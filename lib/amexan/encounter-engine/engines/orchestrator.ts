import { Biodata, ChiefComplaint, Answer, ClinicalObjective, Differential, EncounterPhase, ModuleType, TimelineEntry, ManagementItem } from '../types/ces';
import { buildBiodata, buildPatientContext, determineAgeGroup, PatientContext } from './context-engine';
import {
  createQuestionEngine,
  answerQuestion,
  setPhase,
  getVisibleCards,
  QuestionEngineState,
} from './question-engine';
import { generateHpiNarrative, generateEnhancedHpiNarrative, generateTimeline, generateProblemList, HpiNarrativeContext } from './documentation-engine';
import { computeDifferentials, computeRedFlags, computeMissingInfo, computeObjectives, ReasoningInput } from './reasoning-engine';
import { getSymptomNodeByName } from '../knowledge/symptomKnowledge';
import { generateManagementPlan, ManagementGeneratorInput } from './management-generator';
import { autoExecuteProtocol, estimateSeverityFromVitals, AutoExecutionPlan, AutoExecutionInput } from './protocol-auto-executor';
import { mergeInvestigationOrders, extractLabOrders, extractImagingOrders } from './investigation-engine';
import { mergePrescriptionOrders } from './prescription-engine';
import { DocSectionId, createSectionStates, updateSectionStates, PHASE_TO_SECTION, NO_SIGNIFICANT_HISTORY_ACTIONS } from './sectionEngine';
import type { SectionState } from '../knowledge/symptom-types';
import type { LabOrder, ImagingOrder, PrescriptionOrder, OrderStatus } from '../types/ces';
import type { Encounter, PatientJourney, ClinicalFact, EncounterAction } from '../../clinical-constitution/types';
import {
  PHASE_TO_CONSTITUTION_STATE, mapPhaseToState,
  createConstitutionEncounter, managementItemToAction,
  convertManagementPlanToActions, createDiagnosisDecision,
  createClinicalFactsFromAnswers, createEncounterNoteFromPhase,
  updateEncounterPreparation, addPatientInputToEncounter,
  setEncounterDecision, addActionsToEncounter,
  createConstitutionWorkflow, createTaskFromAction,
} from '../constitution-integration';

export interface VersionRecord {
  cardId: string;
  previousValue: any;
  newValue: any;
  timestamp: number;
  phase: EncounterPhase;
}

export interface EncounterOrchestratorState {
  biodata: Biodata | null;
  patientContext: PatientContext | null;
  chiefComplaints: ChiefComplaint[];
  questionEngine: QuestionEngineState;
  hpiNarrative: string;
  aiNarrative: string;
  isAiLoading: boolean;
  timeline: TimelineEntry[];
  problemList: string[];
  differentials: Differential[];
  redFlags: string[];
  missingInfo: string[];
  objectives: ClinicalObjective[];
  managementPlan: ManagementItem[];
  completedPhases: EncounterPhase[];
  currentPhase: EncounterPhase;
  clinicalNotes: Record<string, string>;
  sectionStates: Record<DocSectionId, SectionState>;
  versionHistory: VersionRecord[];
  autoExecutionPlan: AutoExecutionPlan | null;
  labOrders: LabOrder[];
  imagingOrders: ImagingOrder[];
  prescriptionOrders: PrescriptionOrder[];
  constitutionEncounter: Encounter | null;
  constitutionFacts: ClinicalFact[];
  constitutionActions: EncounterAction[];
}

// ── Naegele's Formula Helpers ──
function parseDate(str: string | undefined): Date | null {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function computeGestationalWeeks(lmp: Date): { weeks: number; days: number } {
  const totalDays = daysBetween(lmp, new Date());
  if (totalDays < 0) return { weeks: 0, days: 0 };
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

export function createEncounterOrchestrator(
  initialBiodata?: Partial<Biodata>,
  initialAnswers: Record<string, Answer> = {}
): EncounterOrchestratorState {
  const biodata = initialBiodata ? buildBiodata(initialBiodata) : null;

  let context: PatientContext | null = null;
  if (biodata) {
    context = buildPatientContext(biodata, [], initialAnswers as any);
  }

  const sex = biodata?.sex || undefined;
  const repStatus = (initialAnswers as any)?.q_reproductive_status?.value as string | undefined;
  const pregnant = biodata?.sex === 'female' ? repStatus === 'Currently pregnant' || repStatus === 'Postpartum' : false;
  const questionEngine = createQuestionEngine(
    initialAnswers,
    'registration',
    context?.activeModules || [],
    [],
    biodata?.ageGroup || 'adult',
    sex,
    pregnant
  );

  const sectionStates = createSectionStates();

  const constitutionEncounter = biodata ? createConstitutionEncounter(
    biodata.hospitalNumber || biodata.patientName || `patient-${Date.now()}`,
    biodata.hospital || 'unknown-org',
    biodata.hospital || 'Unknown Organization',
    undefined,
    biodata.department,
    'walk_in',
    'Clinical encounter',
    'routine',
    'system',
    'outpatient_consultation',
    'clinical',
    'clinic',
    'registration',
  ) : null;

  return {
    biodata,
    patientContext: context,
    chiefComplaints: [],
    questionEngine,
    hpiNarrative: '',
    aiNarrative: '',
    isAiLoading: false,
    timeline: [],
    problemList: [],
    differentials: [],
    redFlags: [],
    missingInfo: [],
    objectives: [],
    managementPlan: [],
    completedPhases: [],
    currentPhase: 'registration',
    clinicalNotes: {},
    sectionStates,
    versionHistory: [],
    autoExecutionPlan: null,
    labOrders: [],
    imagingOrders: [],
    prescriptionOrders: [],
    constitutionEncounter,
    constitutionFacts: [],
    constitutionActions: [],
  };
}

export function answerInOrchestrator(
  state: EncounterOrchestratorState,
  cardId: string,
  value: string | number | boolean | string[]
): EncounterOrchestratorState {
  const complaints = state.chiefComplaints.map(c => c.complaint);
  const ageGroup = state.biodata?.ageGroup || 'adult';
  const sex = state.biodata?.sex || undefined;
  const repStatus = state.questionEngine.answers?.['q_reproductive_status']?.value as string | undefined;
  const pregnant = repStatus === 'Currently pregnant' || repStatus === 'Postpartum';
  let newQE = answerQuestion(state.questionEngine, cardId, value, complaints, ageGroup, sex, pregnant);

  let newAnswers = newQE.answers;

  // ── Sync biodata from registration-phase answers in real time ──
  let biodata = state.biodata;
  if (state.currentPhase === 'registration') {
    const bioPartial: Partial<Biodata> = {};
    if (cardId === 'q_patient_name' && typeof value === 'string') bioPartial.patientName = value;
    if (cardId === 'q_sex') bioPartial.sex = (typeof value === 'string' ? (value.toLowerCase() === 'male' ? 'male' : 'female') : undefined) as 'male' | 'female' | undefined;
    if (cardId === 'q_occupation' && typeof value === 'string') bioPartial.occupation = value;
    if (cardId === 'q_residence' && typeof value === 'string') bioPartial.residence = value;
    if (cardId === 'q_informant' && typeof value === 'string') bioPartial.informant = value;
    if (cardId === 'q_informant_relation' && typeof value === 'string') bioPartial.informantRelation = value;
    if (cardId === 'q_reliability' && typeof value === 'string') bioPartial.reliability = value;
    if (cardId === 'q_date_of_admission' && typeof value === 'string') bioPartial.dateOfAdmission = value;
    if (cardId === 'q_hospital_number' && typeof value === 'string') bioPartial.hospitalNumber = value;
    if (cardId === 'q_department' && typeof value === 'string') bioPartial.department = value;
    if (cardId === 'q_encounter_type' && typeof value === 'string') bioPartial.encounterType = value;
    // Handle age value + unit → compute biodata.age in years
    if (cardId === 'q_age_value' || cardId === 'q_age_unit') {
      const ageVal = cardId === 'q_age_value'
        ? (typeof value === 'string' ? value : String(value))
        : (newAnswers['q_age_value']?.value as string | undefined);
      const ageUnit = cardId === 'q_age_unit'
        ? (typeof value === 'string' ? value : String(value))
        : (newAnswers['q_age_unit']?.value as string | undefined);
      if (ageVal && ageUnit) {
        const numVal = parseFloat(ageVal);
        if (!isNaN(numVal) && numVal > 0) {
          let ageYears = 0;
          switch (ageUnit) {
            case 'Hours': ageYears = numVal / (365.25 * 24); break;
            case 'Days': ageYears = numVal / 365.25; break;
            case 'Months': ageYears = numVal / 12; break;
            case 'Years': ageYears = numVal; break;
          }
          bioPartial.age = Math.round(ageYears * 100) / 100;
        }
      }
    }
    const keys = Object.keys(bioPartial);
    if (keys.length > 0 && biodata) {
      biodata = { ...biodata, ...bioPartial };
      if (bioPartial.age !== undefined || bioPartial.dateOfBirth !== undefined) {
        biodata.ageGroup = determineAgeGroup(biodata.age);
      }
    }
  }

  // ── Handle reproductive status → pregnancy module activation ──
  if (cardId === 'q_reproductive_status' && typeof value === 'string') {
    const isPregnant = value === 'Currently pregnant' || value === 'Postpartum';
    if (isPregnant) {
      newQE = {
        ...newQE,
        answers: {
          ...newQE.answers,
          pregnancy_possible: {
            questionId: 'pregnancy_possible',
            value: true,
            confidence: 'clinician_observed',
            timestamp: Date.now(),
          },
        },
      };
      newAnswers = newQE.answers;
    }
  }

  // ── Naegele's formula: auto-calculate LMP/EDD/GBD ──
  if (cardId === 'q_biodata_lmp' || cardId === 'q_biodata_edd' || cardId === 'q_biodata_gbd_weeks' || cardId === 'q_biodata_gbd_days') {
    const lmpStr = cardId === 'q_biodata_lmp' ? (typeof value === 'string' ? value : undefined) : newAnswers['q_biodata_lmp']?.value as string | undefined;
    const eddStr = cardId === 'q_biodata_edd' ? (typeof value === 'string' ? value : undefined) : newAnswers['q_biodata_edd']?.value as string | undefined;
    const gbdWeeksNum = cardId === 'q_biodata_gbd_weeks' ? (typeof value === 'string' ? parseInt(value) : 0) : parseInt(newAnswers['q_biodata_gbd_weeks']?.value as string || '');
    const gbdDaysNum = cardId === 'q_biodata_gbd_days' ? (typeof value === 'string' ? parseInt(value) : 0) : parseInt(newAnswers['q_biodata_gbd_days']?.value as string || '');

    let lmp: Date | null = null;
    let edd: Date | null = null;

    if (cardId === 'q_biodata_lmp') {
      lmp = parseDate(typeof value === 'string' ? value : undefined);
      if (lmp) {
        edd = addDays(lmp, 280);
        const ga = computeGestationalWeeks(lmp);
        newQE = {
          ...newQE,
          answers: {
            ...newQE.answers,
            q_biodata_edd: { questionId: 'q_biodata_edd', value: formatDate(edd), confidence: 'inferred', timestamp: Date.now() },
            q_biodata_gbd_weeks: { questionId: 'q_biodata_gbd_weeks', value: String(ga.weeks), confidence: 'inferred', timestamp: Date.now() },
            q_biodata_gbd_days: { questionId: 'q_biodata_gbd_days', value: String(ga.days), confidence: 'inferred', timestamp: Date.now() },
          },
        };
        newAnswers = newQE.answers;
      }
    } else if (cardId === 'q_biodata_edd') {
      edd = parseDate(typeof value === 'string' ? value : undefined);
      if (edd) {
        lmp = addDays(edd, -280);
        const ga = computeGestationalWeeks(lmp);
        newQE = {
          ...newQE,
          answers: {
            ...newQE.answers,
            q_biodata_lmp: { questionId: 'q_biodata_lmp', value: formatDate(lmp), confidence: 'inferred', timestamp: Date.now() },
            q_biodata_gbd_weeks: { questionId: 'q_biodata_gbd_weeks', value: String(ga.weeks), confidence: 'inferred', timestamp: Date.now() },
            q_biodata_gbd_days: { questionId: 'q_biodata_gbd_days', value: String(ga.days), confidence: 'inferred', timestamp: Date.now() },
          },
        };
        newAnswers = newQE.answers;
      }
    } else if (!isNaN(gbdWeeksNum) && !isNaN(gbdDaysNum) && (cardId === 'q_biodata_gbd_weeks' || cardId === 'q_biodata_gbd_days')) {
      const gbdW = cardId === 'q_biodata_gbd_weeks' ? (typeof value === 'string' ? parseInt(value) : 0) : gbdWeeksNum;
      const gbdD = cardId === 'q_biodata_gbd_days' ? (typeof value === 'string' ? parseInt(value) : 0) : gbdDaysNum;
      const weeks = gbdW || 0;
      const days = gbdD || 0;
      if (weeks > 0 || days > 0) {
        lmp = addDays(new Date(), -(weeks * 7 + days));
        edd = addDays(lmp, 280);
        const newAnswers2: Record<string, Answer> = {
          ...newQE.answers,
          q_biodata_lmp: { questionId: 'q_biodata_lmp', value: formatDate(lmp), confidence: 'inferred', timestamp: Date.now() },
          q_biodata_edd: { questionId: 'q_biodata_edd', value: formatDate(edd), confidence: 'inferred', timestamp: Date.now() },
        };
        if (cardId !== 'q_biodata_gbd_weeks') {
          newAnswers2.q_biodata_gbd_weeks = { questionId: 'q_biodata_gbd_weeks', value: String(weeks), confidence: 'inferred', timestamp: Date.now() };
        }
        if (cardId !== 'q_biodata_gbd_days') {
          newAnswers2.q_biodata_gbd_days = { questionId: 'q_biodata_gbd_days', value: String(days), confidence: 'inferred', timestamp: Date.now() };
        }
        newQE = { ...newQE, answers: newAnswers2 };
        newAnswers = newQE.answers;
      }
    }

    // Re-evaluate visible cards so that LMP/EDD/GBD cards update (they may become "answered" and progress shifts)
    const newCards = getVisibleCards(
      newQE.currentPhase,
      newQE.activeModules,
      newAnswers,
      Array.from(newQE.answeredQuestions),
      complaints,
      ageGroup,
      sex,
      pregnant
    );
    newQE = { ...newQE, visibleCards: newCards };
  }

  // ── Version tracking: record every change ──
  const prevValue = state.questionEngine.answers[cardId]?.value;
  const versionEntry: VersionRecord = {
    cardId,
    previousValue: prevValue !== undefined ? prevValue : null,
    newValue: value,
    timestamp: Date.now(),
    phase: state.currentPhase,
  };
  const versionHistory = [...state.versionHistory, versionEntry];

  let newComplaints = [...state.chiefComplaints];
  if (cardId === 'q_cc_primary' && typeof value === 'string') {
    const duration = newAnswers['q_cc_duration']?.value as string || '';
    const onset = newAnswers['q_cc_onset']?.value as string || '';
    const patientWords = newAnswers['q_cc_patient_words']?.value as string || '';
    newComplaints = [
      {
        id: 'cc_1',
        complaint: value,
        duration,
        durationSeconds: parseDuration(duration),
        onset,
        primary: true,
        patientWords,
        bodySystem: mapComplaintToSystem(value.toLowerCase()),
      },
    ];
    const sec1 = newAnswers['q_cc_secondary_1']?.value as string;
    if (sec1) {
      newComplaints.push({
        id: 'cc_2',
        complaint: sec1,
        duration: newAnswers['q_cc_secondary_1_dur']?.value as string || '',
        durationSeconds: 0,
        onset: '',
        primary: false,
        patientWords: '',
      });
    }
    const sec2 = newAnswers['q_cc_secondary_2']?.value as string;
    if (sec2) {
      newComplaints.push({
        id: 'cc_3',
        complaint: sec2,
        duration: newAnswers['q_cc_secondary_2_dur']?.value as string || '',
        durationSeconds: 0,
        onset: '',
        primary: false,
        patientWords: '',
      });
    }
  }

  const reasoningInput: ReasoningInput = {
    biodata,
    chiefComplaints: newComplaints,
    answers: newAnswers,
    activeModules: newQE.activeModules,
    currentPhase: state.currentPhase,
    completedPhases: state.completedPhases,
  };

  const narrative = generateHpiNarrative({
    biodata,
    chiefComplaints: newComplaints,
    answers: newAnswers,
  });

  const timeline = generateTimeline(newComplaints, newAnswers);
  const problemList = generateProblemList(newComplaints, newAnswers);
  const differentials = computeDifferentials(reasoningInput);
  const redFlags = computeRedFlags(reasoningInput);
  const missingInfo = computeMissingInfo(reasoningInput);
  const objectives = computeObjectives(state.currentPhase, state.completedPhases, newAnswers, reasoningInput);

  // ── UNIVERSAL: Phenotype → Mechanism → Management pipeline ──
  const mgmtInput: ManagementGeneratorInput = {
    biodata,
    chiefComplaints: newComplaints,
    answers: newAnswers,
    activeModules: newQE.activeModules,
    currentPhase: state.currentPhase,
    completedPhases: state.completedPhases,
  };
  const generated = generateManagementPlan(mgmtInput);
  const managementPlan: ManagementItem[] = generated.all;

  // ── PROTOCOL AUTO-EXECUTION: Triggered by working diagnosis or final diagnosis ──
  const workingDx = newAnswers['q_working_diagnosis']?.value as string | undefined
  const finalDx = newAnswers['q_dx_final']?.value as string | undefined
  const triggerDx = finalDx || workingDx || differentials[0]?.diseaseName
  const prevTrigger = state.autoExecutionPlan?.diagnosisName

  let autoExecutionPlan = state.autoExecutionPlan
  if (triggerDx && triggerDx !== prevTrigger) {
    const autoInput: AutoExecutionInput = {
      diagnosisId: (finalDx || workingDx || differentials[0]?.diseaseId || triggerDx).toLowerCase().replace(/[^a-z0-9]/g, '_'),
      diagnosisName: triggerDx,
      severity: estimateSeverityFromVitals({
        temperature: Number(newAnswers['exam_temp']?.value) || undefined,
        spo2: Number(newAnswers['exam_spo2']?.value) || undefined,
        respiratoryRate: Number(newAnswers['exam_rr']?.value) || undefined,
        heartRate: Number(newAnswers['exam_hr']?.value) || undefined,
        systolicBP: Number(newAnswers['exam_bp_systolic']?.value) || undefined,
        diastolicBP: Number(newAnswers['exam_bp_diastolic']?.value) || undefined,
        consciousness: (newAnswers['exam_consciousness']?.value as any) || undefined,
      }),
      patientAge: biodata?.age || 0,
      pregnant: newQE.answers?.['q_reproductive_status']?.value === 'Currently pregnant' || newQE.answers?.['q_reproductive_status']?.value === 'Postpartum',
      allergies: Array.isArray(newAnswers['q_all_known']?.value)
        ? (newAnswers['q_all_known'].value as string[]).filter(a => a !== 'None known')
        : [],
      renalImpairment: false,
      hepaticImpairment: false,
      comorbidities: Array.isArray(newAnswers['q_pmh_conditions']?.value)
        ? (newAnswers['q_pmh_conditions'].value as string[]).filter(c => c !== 'None')
        : [],
      activeModules: newQE.activeModules,
      chiefComplaints: newComplaints.map(c => c.complaint),
      vitals: {},
    }
    autoExecutionPlan = autoExecuteProtocol(autoInput)
  }

  // ── SYNC ageGroup to question engine (for CQAE real-time format switching) ──
  if (biodata) {
    newQE.ageGroup = biodata.ageGroup;
  }

  // ── LAB & IMAGING ORDERS: Sync from auto-execution plan ──
  const merged = mergeInvestigationOrders(
    state.labOrders,
    state.imagingOrders,
    autoExecutionPlan,
  );
  const labOrders = merged.labs;
  const imagingOrders = merged.imaging;

  // ── PRESCRIPTION ORDERS: Sync from auto-execution plan ──
  const prescriptionOrders = mergePrescriptionOrders(state.prescriptionOrders, autoExecutionPlan);

  const sectionStates = updateSectionStates(
    state.sectionStates,
    state.currentPhase,
    state.completedPhases,
    newAnswers,
  );

  // ── CONSTITUTION SYNC: Update encounter facts, preparation, decisions ──
  let constitutionEncounter = state.constitutionEncounter
  let constitutionFacts = [...state.constitutionFacts]
  let constitutionActions = [...state.constitutionActions]

  if (constitutionEncounter) {
    if (biodata) {
      const allergies = Array.isArray(newAnswers['q_all_known']?.value)
        ? (newAnswers['q_all_known'].value as string[]).filter(a => a !== 'None known')
        : []
      const activeDiagnoses = differentials.map(d => d.diseaseName)
      const chronicConditions = Array.isArray(newAnswers['q_pmh_conditions']?.value)
        ? (newAnswers['q_pmh_conditions'].value as string[]).filter(c => c !== 'None')
        : []
      constitutionEncounter = updateEncounterPreparation(
        constitutionEncounter,
        { patientName: biodata.patientName, age: biodata.age, sex: biodata.sex },
        allergies,
        activeDiagnoses,
        chronicConditions,
        missingInfo,
        redFlags,
      )
    }

    if (cardId.startsWith('q_cc_') && typeof value === 'string') {
      constitutionEncounter = addPatientInputToEncounter(
        constitutionEncounter, 'symptom_report', { complaint: value, phase: state.currentPhase }, 'encounter_form'
      )
    }

    // Sync diagnosis decisions
    const workingDx = newAnswers['q_working_diagnosis']?.value as string | undefined
    const finalDx = newAnswers['q_dx_final']?.value as string | undefined
    if (finalDx || workingDx) {
      const dx = finalDx || workingDx || ''
      const decision = createDiagnosisDecision(
        dx, dx.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        `Diagnosis reached during ${state.currentPhase} phase`,
        'clinician', 'Clinician', 'order_investigations'
      )
      constitutionEncounter = setEncounterDecision(constitutionEncounter, decision)
    }

    // Sync management plan to encounter actions
    if (managementPlan.length > 0 && constitutionEncounter) {
      const newActions = convertManagementPlanToActions(managementPlan, constitutionEncounter.id)
      constitutionEncounter = addActionsToEncounter(constitutionEncounter, newActions)
      constitutionActions = [...constitutionActions, ...newActions]
    }

    // Generate clinical facts from answers
    const newFacts = createClinicalFactsFromAnswers(
      Object.fromEntries(Object.entries(newAnswers).filter(([k]) =>
        !k.startsWith('q_') || ['q_cc_primary', 'q_cc_duration', 'q_cc_onset'].includes(k)
      )),
      constitutionEncounter.patientId,
      constitutionEncounter.id,
      { recordedBy: { id: 'clinician', name: 'Clinician', role: 'clinician', type: 'clinician' }, recordedAt: Date.now(), source: 'direct_entry', verified: false }
    )
    constitutionFacts = [...constitutionFacts, ...newFacts]
  }

  return {
    ...state,
    biodata,
    chiefComplaints: newComplaints,
    questionEngine: newQE,
    hpiNarrative: narrative,
    timeline,
    problemList,
    differentials,
    redFlags,
    missingInfo,
    objectives,
    managementPlan,
    autoExecutionPlan,
    labOrders,
    imagingOrders,
    prescriptionOrders,
    sectionStates,
    versionHistory,
    constitutionEncounter,
    constitutionFacts,
    constitutionActions,
  };
}

export function advancePhase(
  state: EncounterOrchestratorState,
  nextPhase: EncounterPhase
): EncounterOrchestratorState {
  const completedPhases = state.completedPhases.includes(state.currentPhase)
    ? state.completedPhases
    : [...state.completedPhases, state.currentPhase];

  const complaints = state.chiefComplaints.map(c => c.complaint);
  const ageGroup = state.biodata?.ageGroup;
  const sex = state.biodata?.sex || undefined;
  const repStatus = state.questionEngine.answers?.['q_reproductive_status']?.value as string | undefined;
  const pregnant = repStatus === 'Currently pregnant' || repStatus === 'Postpartum';
  const newQE = setPhase(state.questionEngine, nextPhase, complaints, ageGroup, sex, pregnant);

  const sectionStates = updateSectionStates(
    state.sectionStates,
    state.currentPhase,
    completedPhases,
    state.questionEngine.answers,
  );

  // ── CONSTITUTION SYNC: Advance encounter state machine ──
  let constitutionEncounter = state.constitutionEncounter
  if (constitutionEncounter) {
    const targetState = mapPhaseToState(nextPhase)
    constitutionEncounter = {
      ...constitutionEncounter,
      currentState: targetState,
      updatedAt: Date.now(),
    }
    if (nextPhase === 'disposition' || nextPhase === 'discharge_admission_referral') {
      constitutionEncounter = {
        ...constitutionEncounter,
        endTime: Date.now(),
      }
    }
  }

  return {
    ...state,
    currentPhase: nextPhase,
    completedPhases,
    questionEngine: newQE,
    sectionStates,
    constitutionEncounter,
  };
}

export function setPatientBiodata(
  state: EncounterOrchestratorState,
  partial: Partial<Biodata>
): EncounterOrchestratorState {
  const biodata = buildBiodata(partial);
  const context = buildPatientContext(biodata, state.chiefComplaints, state.questionEngine.answers as any);
  const ageGroup = biodata.ageGroup;

  // Re-evaluate the question engine with the new age group (real-time format switching)
  const newCards = getVisibleCards(
    state.questionEngine.currentPhase,
    context.activeModules,
    state.questionEngine.answers,
    Array.from(state.questionEngine.answeredQuestions),
    state.chiefComplaints.map(c => c.complaint),
    ageGroup,
  );

  return {
    ...state,
    biodata,
    patientContext: context,
    questionEngine: {
      ...state.questionEngine,
      activeModules: context.activeModules,
      ageGroup,
      visibleCards: newCards,
      currentCardIndex: 0,
    },
  };
}

export function addChiefComplaint(
  state: EncounterOrchestratorState,
  complaintName: string,
  duration: string,
  onset: string,
  patientWords: string,
): EncounterOrchestratorState {
  const existing = state.chiefComplaints;
  const nextId = `cc_${existing.length + 1}`;
  const isPrimary = existing.length === 0;

  const newComplaint: ChiefComplaint = {
    id: nextId,
    complaint: complaintName,
    duration,
    durationSeconds: parseDuration(duration),
    onset,
    primary: isPrimary,
    patientWords,
    bodySystem: mapComplaintToSystem(complaintName.toLowerCase()),
  };

  const newComplaints = [...existing, newComplaint];
  const complaintsStr = newComplaints.map(c => c.complaint);
  const ageGroup = state.biodata?.ageGroup || 'adult';
  const sex = state.biodata?.sex || undefined;
  const repStatus = state.questionEngine.answers?.['q_reproductive_status']?.value as string | undefined;
  const pregnant = repStatus === 'Currently pregnant' || repStatus === 'Postpartum';

  const newAnswers = {
    ...state.questionEngine.answers,
    q_cc_primary: { questionId: 'q_cc_primary', value: complaintName, confidence: 'clinician_observed' as const, timestamp: Date.now() },
    q_cc_duration: duration ? { questionId: 'q_cc_duration', value: duration, confidence: 'clinician_observed' as const, timestamp: Date.now() } : state.questionEngine.answers['q_cc_duration'],
    q_cc_onset: onset ? { questionId: 'q_cc_onset', value: onset, confidence: 'clinician_observed' as const, timestamp: Date.now() } : state.questionEngine.answers['q_cc_onset'],
    q_cc_patient_words: patientWords ? { questionId: 'q_cc_patient_words', value: patientWords, confidence: 'clinician_observed' as const, timestamp: Date.now() } : state.questionEngine.answers['q_cc_patient_words'],
  };

  const newCards = getVisibleCards(
    state.questionEngine.currentPhase,
    state.questionEngine.activeModules,
    newAnswers,
    Array.from(state.questionEngine.answeredQuestions),
    complaintsStr,
    ageGroup,
    sex,
    pregnant,
  );

  const newQE: QuestionEngineState = {
    ...state.questionEngine,
    answers: newAnswers,
    answeredQuestions: new Set([...Array.from(state.questionEngine.answeredQuestions), 'q_cc_primary', ...(duration ? ['q_cc_duration'] : []), ...(onset ? ['q_cc_onset'] : []), ...(patientWords ? ['q_cc_patient_words'] : [])]),
    visibleCards: newCards,
  };

  const reasoningInput: ReasoningInput = {
    biodata: state.biodata,
    chiefComplaints: newComplaints,
    answers: newAnswers,
    activeModules: newQE.activeModules,
    currentPhase: state.currentPhase,
    completedPhases: state.completedPhases,
  };

  const narrative = generateHpiNarrative({
    biodata: state.biodata,
    chiefComplaints: newComplaints,
    answers: newAnswers,
  });

  const timeline = generateTimeline(newComplaints, newAnswers);
  const problemList = generateProblemList(newComplaints, newAnswers);
  const differentials = computeDifferentials(reasoningInput);
  const redFlags = computeRedFlags(reasoningInput);
  const missingInfo = computeMissingInfo(reasoningInput);
  const objectives = computeObjectives(state.currentPhase, state.completedPhases, newAnswers, reasoningInput);

  return {
    ...state,
    chiefComplaints: newComplaints,
    questionEngine: newQE,
    hpiNarrative: narrative,
    timeline,
    problemList,
    differentials,
    redFlags,
    missingInfo,
    objectives,
  };
}

export function removeChiefComplaint(
  state: EncounterOrchestratorState,
  complaintId: string,
): EncounterOrchestratorState {
  const existing = state.chiefComplaints;
  const filtered = existing.filter(c => c.id !== complaintId);

  if (filtered.length === existing.length) return state;
  if (filtered.length === 0) return state;

  // If we removed the primary, promote the first remaining
  const hadPrimary = existing.find(c => c.id === complaintId)?.primary;
  let newComplaints = filtered;
  if (hadPrimary && filtered.length > 0) {
    newComplaints = filtered.map((c, i) => i === 0 ? { ...c, primary: true } : c);
  }

  const complaintsStr = newComplaints.map(c => c.complaint);
  const ageGroup = state.biodata?.ageGroup || 'adult';
  const sex = state.biodata?.sex || undefined;
  const repStatus = state.questionEngine.answers?.['q_reproductive_status']?.value as string | undefined;
  const pregnant = repStatus === 'Currently pregnant' || repStatus === 'Postpartum';

  const newCards = getVisibleCards(
    state.questionEngine.currentPhase,
    state.questionEngine.activeModules,
    state.questionEngine.answers,
    Array.from(state.questionEngine.answeredQuestions),
    complaintsStr,
    ageGroup,
    sex,
    pregnant,
  );

  const newQE: QuestionEngineState = {
    ...state.questionEngine,
    visibleCards: newCards,
  };

  const reasoningInput: ReasoningInput = {
    biodata: state.biodata,
    chiefComplaints: newComplaints,
    answers: state.questionEngine.answers,
    activeModules: newQE.activeModules,
    currentPhase: state.currentPhase,
    completedPhases: state.completedPhases,
  };

  const narrative = generateHpiNarrative({
    biodata: state.biodata,
    chiefComplaints: newComplaints,
    answers: state.questionEngine.answers,
  });

  const timeline = generateTimeline(newComplaints, state.questionEngine.answers);
  const problemList = generateProblemList(newComplaints, state.questionEngine.answers);
  const differentials = computeDifferentials(reasoningInput);
  const redFlags = computeRedFlags(reasoningInput);
  const missingInfo = computeMissingInfo(reasoningInput);
  const objectives = computeObjectives(state.currentPhase, state.completedPhases, state.questionEngine.answers, reasoningInput);

  return {
    ...state,
    chiefComplaints: newComplaints,
    questionEngine: newQE,
    hpiNarrative: narrative,
    timeline,
    problemList,
    differentials,
    redFlags,
    missingInfo,
    objectives,
  };
}

export function getHpiNarrativeContext(state: EncounterOrchestratorState): HpiNarrativeContext {
  return {
    biodata: state.biodata,
    chiefComplaints: state.chiefComplaints,
    answers: state.questionEngine.answers,
  };
}

export function applyQuickComplete(
  state: EncounterOrchestratorState,
  actionId: string
): EncounterOrchestratorState {
  const action = NO_SIGNIFICANT_HISTORY_ACTIONS.find(a =>
    `${a.sectionId}_${a.label.replace(/\s+/g, '_')}` === actionId
  );
  if (!action) return state;

  let newState = { ...state };
  for (const [key, val] of Object.entries(action.fillAnswers)) {
    newState = answerInOrchestrator(newState, key, val);
  }
  return newState;
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const lower = duration.toLowerCase();
  const num = parseInt(duration) || 1;
  if (lower.includes('day') || lower.includes('d')) return num * 86400;
  if (lower.includes('hour') || lower.includes('hr')) return num * 3600;
  if (lower.includes('week') || lower.includes('wk')) return num * 604800;
  if (lower.includes('month') || lower.includes('mo')) return num * 2592000;
  if (lower.includes('year') || lower.includes('yr')) return num * 31536000;
  return num * 86400;
}

function mapComplaintToSystem(complaint: string): string {
  if (complaint.includes('pain') || complaint.includes('ache')) return 'gi';
  if (complaint.includes('headache') || complaint.includes('dizziness') || complaint.includes('seizure')) return 'neuro';
  if (complaint.includes('cough') || complaint.includes('sob') || complaint.includes('breath')) return 'resp';
  if (complaint.includes('chest') || complaint.includes('palpitation')) return 'cv';
  if (complaint.includes('fever') || complaint.includes('rash')) return 'derm';
  if (complaint.includes('urine') || complaint.includes('dysuria')) return 'renal';
  return 'general';
}

export function requestLabOrder(
  state: EncounterOrchestratorState,
  orderId: string,
): EncounterOrchestratorState {
  const updated = state.labOrders.map(o =>
    o.id === orderId
      ? { ...o, status: 'ordered' as OrderStatus, orderedAt: Date.now() }
      : o
  );
  return { ...state, labOrders: updated };
}

export function markLabSampleCollected(
  state: EncounterOrchestratorState,
  orderId: string,
): EncounterOrchestratorState {
  const updated = state.labOrders.map(o =>
    o.id === orderId && o.status === 'ordered'
      ? { ...o, status: 'sample_collected' as OrderStatus, collectedAt: Date.now() }
      : o
  );
  return { ...state, labOrders: updated };
}

export function updateLabResult(
  state: EncounterOrchestratorState,
  orderId: string,
  result: string,
  flag: LabOrder['flag'],
): EncounterOrchestratorState {
  const updated = state.labOrders.map(o =>
    o.id === orderId
      ? { ...o, status: 'completed' as OrderStatus, completedAt: Date.now(), result, flag }
      : o
  );
  return { ...state, labOrders: updated };
}

export function requestImagingOrder(
  state: EncounterOrchestratorState,
  orderId: string,
): EncounterOrchestratorState {
  const updated = state.imagingOrders.map(o =>
    o.id === orderId
      ? { ...o, status: 'ordered' as OrderStatus, orderedAt: Date.now() }
      : o
  );
  return { ...state, imagingOrders: updated };
}

export function updateImagingResult(
  state: EncounterOrchestratorState,
  orderId: string,
  findings: string,
  impression: string,
  flag: ImagingOrder['flag'],
): EncounterOrchestratorState {
  const updated = state.imagingOrders.map(o =>
    o.id === orderId
      ? { ...o, status: 'completed' as OrderStatus, completedAt: Date.now(), findings, impression, flag }
      : o
  );
  return { ...state, imagingOrders: updated };
}

export function prescribeMedication(
  state: EncounterOrchestratorState,
  orderId: string,
): EncounterOrchestratorState {
  const updated = state.prescriptionOrders.map(o =>
    o.id === orderId
      ? { ...o, status: 'prescribed' as PrescriptionOrder['status'], prescribedAt: Date.now(), prescribedBy: 'clinician', prescribedByName: 'Clinician' }
      : o
  );
  return { ...state, prescriptionOrders: updated };
}

export function sendPrescriptionToPharmacy(
  state: EncounterOrchestratorState,
  orderId: string,
): EncounterOrchestratorState {
  const updated = state.prescriptionOrders.map(o =>
    o.id === orderId && o.status === 'prescribed'
      ? { ...o, status: 'sent_to_pharmacy' as PrescriptionOrder['status'] }
      : o
  );
  return { ...state, prescriptionOrders: updated };
}

export function confirmPrescriptionAtPharmacy(
  state: EncounterOrchestratorState,
  orderId: string,
  pharmacyNote?: string,
): EncounterOrchestratorState {
  const updated = state.prescriptionOrders.map(o =>
    o.id === orderId && o.status === 'sent_to_pharmacy'
      ? { ...o, status: 'confirmed' as PrescriptionOrder['status'], pharmacyNote: pharmacyNote || o.pharmacyNote }
      : o
  );
  return { ...state, prescriptionOrders: updated };
}

export function offerAlternativeMedication(
  state: EncounterOrchestratorState,
  orderId: string,
  alternativeDrug: string,
): EncounterOrchestratorState {
  const updated = state.prescriptionOrders.map(o =>
    o.id === orderId && (o.status === 'sent_to_pharmacy' || o.status === 'confirmed')
      ? { ...o, status: 'alternative_offered' as PrescriptionOrder['status'], drugName: alternativeDrug, pharmacyNote: `Alternative: ${alternativeDrug} (original: ${o.drugName})` }
      : o
  );
  return { ...state, prescriptionOrders: updated };
}

export function dispenseMedication(
  state: EncounterOrchestratorState,
  orderId: string,
  dispensedBy?: string,
): EncounterOrchestratorState {
  const updated = state.prescriptionOrders.map(o =>
    o.id === orderId && (o.status === 'confirmed' || o.status === 'alternative_offered')
      ? { ...o, status: 'dispensed' as PrescriptionOrder['status'], dispensedAt: Date.now(), dispensedBy: dispensedBy || 'pharmacy' }
      : o
  );
  return { ...state, prescriptionOrders: updated };
}

export function cancelPrescription(
  state: EncounterOrchestratorState,
  orderId: string,
): EncounterOrchestratorState {
  const updated = state.prescriptionOrders.map(o =>
    o.id === orderId && o.status !== 'dispensed'
      ? { ...o, status: 'cancelled' as PrescriptionOrder['status'] }
      : o
  );
  return { ...state, prescriptionOrders: updated };
}

export function getClinicalNotes(
  state: EncounterOrchestratorState
): Record<string, string> {
  return {
    hpi: state.hpiNarrative,
    problem_list: state.problemList.map((p, i) => `${i + 1}. ${p}`).join('\n'),
    differentials: state.differentials.map(d =>
      `${d.rank}. ${d.diseaseName} (${d.probability}%)\n   For: ${d.supporting.join(', ')}\n   Against: ${d.against.join(', ')}`
    ).join('\n\n'),
    red_flags: state.redFlags.join('\n'),
    missing: state.missingInfo.join('\n'),
    summary: generateSummary(state),
  };
}

function generateSummary(state: EncounterOrchestratorState): string {
  const parts: string[] = [];
  const name = state.biodata?.patientName || 'The patient';
  const age = state.biodata?.age;
  const sex = state.biodata?.sex;
  const gender = sex === 'male' ? 'male' : 'female';

  if (age) {
    const chiefComp = state.chiefComplaints.find(c => c.primary)?.complaint || '';
    const duration = state.chiefComplaints.find(c => c.primary)?.duration || '';
    parts.push(`${name} is a ${age}-year-old ${gender} presenting with ${chiefComp.toLowerCase()}${duration ? ` of ${duration}` : ''}.`);
  }

  if (state.differentials.length > 0) {
    const top = state.differentials[0];
    parts.push(`The most likely diagnosis is ${top.diseaseName} (${top.probability}% probability).`);
  }

  return parts.join(' ');
}
