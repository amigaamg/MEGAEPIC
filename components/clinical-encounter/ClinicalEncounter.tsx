'use client';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { EncounterPhase } from '@/lib/amexan/encounter-engine/types/ces';
import {
  createEncounterOrchestrator,
  answerInOrchestrator,
  advancePhase,
  setPatientBiodata,
  applyQuickComplete,
  requestLabOrder,
  requestImagingOrder,
  prescribeMedication,
  sendPrescriptionToPharmacy,
  cancelPrescription,
  addChiefComplaint,
  removeChiefComplaint,
  EncounterOrchestratorState,
} from '@/lib/amexan/encounter-engine/engines/orchestrator';
import { getHpiNarrativeContext } from '@/lib/amexan/encounter-engine/engines/orchestrator';
import { createQuestionEngine, setPhase } from '@/lib/amexan/encounter-engine/engines/question-engine';
import type { Answer, Biodata } from '@/lib/amexan/encounter-engine/types/ces';
import {
  generateEnhancedHpiNarrative,
  generatePastMedicalSurgicalNarrative,
  generateDrugAllergyNarrative,
  generateFamilyHistoryNarrative,
  generateSocialHistoryNarrative,
  generateReviewOfSystemsNarrative,
  generateSummaryNarrative,
} from '@/lib/amexan/encounter-engine/engines/documentation-engine';
import { saveEncounter } from '@/lib/amexan/encounter/encounterPersistence';
import { persistExamFindings, listenExamFindings, persistEvidenceGraph } from '@/lib/clinical/constitutional/examinationPersistence';
import { InvestigationCards } from './InvestigationCards';
import { PrescriptionCards } from './PrescriptionCards';
import { getAllSymptomNames, searchSymptom as searchSymptomNodes, getSymptomById, getSymptomNodeByName, getApplicableQuestions, extractFacts, getApplicableQuestionsConstitutional } from '@/lib/amexan/encounter-engine/knowledge/symptomKnowledge';
import type { AssessmentContext, ConstitutionalContext, ComplaintObject } from '@/lib/amexan/encounter-engine/knowledge/symptom-types';
import { buildConstitutionalContext, determineAgeGroup } from '@/lib/amexan/encounter-engine/engines/context-engine';
import { generateConstitutionalHpiNarrative } from '@/lib/amexan/encounter-engine/engines/documentation-engine';
import { DocSectionId, NO_SIGNIFICANT_HISTORY_ACTIONS, SECTION_LABELS } from '@/lib/amexan/encounter-engine/engines/sectionEngine';
import type { SectionExecutionState, AssessmentFormat, SectionDef } from '@/lib/amexan/encounter-engine/knowledge/symptom-types';
import { getDynamicSections, generateAssessmentFormat, determineActiveModule } from '@/lib/amexan/encounter-engine/engines/formatEngine';
  import { useConstitutionalStore } from '@/lib/clinical/constitutional/constitutionalStore';
import { computeAgeFromMonths } from '@/lib/clinical/constitutional/types';
import { getPediatricCardsForSection } from '@/lib/amexan/encounter-engine/rules/pediatricQuestionGroups';
import { getObgynCardsForSection } from '@/lib/amexan/encounter-engine/rules/obgynQuestionGroups';
import { getPerinatalCardsForSection } from '@/lib/amexan/encounter-engine/rules/neonatalQuestionGroups';
import { getPsychiatricCardsForSection } from '@/lib/amexan/encounter-engine/rules/psychiatricQuestionGroups';
import type { QuestionCard } from '@/lib/amexan/encounter-engine/types/ces';
import { ConstitutionalSidebar } from '@/components/clinical/ConstitutionalSidebar';
import { useCoughEngine } from './bridge/CoughEngineBridge';
import {
  useExaminationEngine,
  VitalsPanel,
  AnthropometryPanel,
  GeneralExamPanel,
  SystemicExamPanel,
  SpecialCascadeRenderer,
  RespiratoryPanel,
  AbdominalPanel,
  CardiovascularPanel,
  NeurologicalPanel,
  UEOPlayground,
  BreastPanel,
} from './exam/index';
import type { ExamFindings } from '@/lib/clinical/constitutional/examination-engine';
import './clinical-encounter-theme.css';

interface Props {
  patientName: string;
  patientAge: number;
  patientSex: 'male' | 'female';
  hospitalNumber: string;
  occupation?: string;
  residence?: string;
  informant?: string;
  informantRelation?: string;
  reliability?: string;
  dateOfAdmission?: string;
  initialState?: EncounterOrchestratorState;
  encounterId?: string;
}

const ORG_ID = 'telemed-a98cf';
const DEFAULT_DEPT = 'OUTPATIENT';
const DEFAULT_UNIT = 'general';

/**
 * FIX: added fullLabel — used for Previous/Next nav buttons and tooltips.
 * label (short) stays for the compact phase-dot strip only.
 */
const PHASES: { id: EncounterPhase; label: string; fullLabel: string }[] = [
  { id: 'registration', label: 'Reg', fullLabel: 'Registration' },
  { id: 'chief_complaint', label: 'C/C', fullLabel: 'Chief Complaint' },
  { id: 'hpi', label: 'HPI', fullLabel: 'History of Presenting Illness' },
  { id: 'past_medical', label: 'PMH', fullLabel: 'Past Medical History' },
  { id: 'past_surgical', label: 'PSH', fullLabel: 'Past Surgical History' },
  { id: 'drug_history', label: 'Drugs', fullLabel: 'Drug History' },
  { id: 'allergies', label: 'Allergy', fullLabel: 'Allergies' },
  { id: 'family_history', label: 'Family', fullLabel: 'Family History' },
  { id: 'social_history', label: 'Social', fullLabel: 'Social History' },
  { id: 'review_of_systems', label: 'ROS', fullLabel: 'Review of Systems' },
  { id: 'general_exam', label: 'Exam', fullLabel: 'Physical Examination' },
  { id: 'clinical_reasoning', label: 'DDx', fullLabel: 'Clinical Reasoning / Differentials' },
  { id: 'investigations', label: 'Tests', fullLabel: 'Investigations' },
  { id: 'diagnosis', label: 'Dx', fullLabel: 'Diagnosis' },
  { id: 'management', label: 'Mgt', fullLabel: 'Management Plan' },
  { id: 'disposition', label: 'D/C', fullLabel: 'Disposition' },
  { id: 'follow_up', label: 'F/U', fullLabel: 'Follow Up' },
];

const DURATION_UNITS = ['Hours', 'Days', 'Weeks', 'Months', 'Years'] as const;

function parseDurationUnit(duration: string | undefined): 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' {
  if (!duration) return 'days';
  const lower = duration.toLowerCase();
  if (lower.includes('hour') || lower.includes('hr')) return 'hours';
  if (lower.includes('minute') || lower.includes('min')) return 'minutes';
  if (lower.includes('week') || lower.includes('wk')) return 'weeks';
  if (lower.includes('month') || lower.includes('mo')) return 'months';
  if (lower.includes('year') || lower.includes('yr')) return 'years';
  return 'days';
}

function biodataToSeeds(biodata: Biodata): Record<string, Answer> {
  const seeds: Record<string, Answer> = {};
  const now = Date.now();
  if (biodata.patientName) seeds.q_patient_name = { questionId: 'q_patient_name', value: biodata.patientName, confidence: 'imported', timestamp: now };
  if (biodata.hospitalNumber) seeds.q_hospital_number = { questionId: 'q_hospital_number', value: biodata.hospitalNumber, confidence: 'imported', timestamp: now };
  if (biodata.age) {
    seeds.q_age_value = { questionId: 'q_age_value', value: String(biodata.age), confidence: 'imported', timestamp: now };
    seeds.q_age_unit = { questionId: 'q_age_unit', value: 'Years', confidence: 'imported', timestamp: now };
  }
  if (biodata.sex) seeds.q_sex = { questionId: 'q_sex', value: biodata.sex === 'male' ? 'Male' : 'Female', confidence: 'imported', timestamp: now };
  if (biodata.occupation) seeds.q_occupation = { questionId: 'q_occupation', value: biodata.occupation, confidence: 'imported', timestamp: now };
  if (biodata.residence) seeds.q_residence = { questionId: 'q_residence', value: biodata.residence, confidence: 'imported', timestamp: now };
  if (biodata.informant) seeds.q_informant = { questionId: 'q_informant', value: biodata.informant, confidence: 'imported', timestamp: now };
  if (biodata.reliability) seeds.q_reliability = { questionId: 'q_reliability', value: biodata.reliability, confidence: 'imported', timestamp: now };
  if (biodata.informantRelation) seeds.q_informant_relation = { questionId: 'q_informant_relation', value: biodata.informantRelation, confidence: 'imported', timestamp: now };
  if (biodata.dateOfAdmission) seeds.q_date_of_admission = { questionId: 'q_date_of_admission', value: biodata.dateOfAdmission, confidence: 'imported', timestamp: now };
  if (biodata.department) seeds.q_department = { questionId: 'q_department', value: biodata.department, confidence: 'imported', timestamp: now };
  if (biodata.encounterType) {
    const et = biodata.encounterType.charAt(0).toUpperCase() + biodata.encounterType.slice(1);
    seeds.q_encounter_type = { questionId: 'q_encounter_type', value: et, confidence: 'imported', timestamp: now };
  }
  return seeds;
}

export function ClinicalEncounter({
  patientName, patientAge, patientSex, hospitalNumber,
  occupation, residence, informant, informantRelation, reliability, dateOfAdmission,
  initialState, encounterId,
}: Props) {
  const encounterIdRef = useRef(encounterId || `enc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hpiContainerRef = useRef<HTMLDivElement>(null);
  const hpiUserScrolledRef = useRef(false);

  const [state, setState] = useState<EncounterOrchestratorState>(() => {
    if (initialState) {
      const defaults = createEncounterOrchestrator();
      const merged = { ...defaults, ...initialState };
      if (!merged.questionEngine) merged.questionEngine = defaults.questionEngine;
      if (!merged.versionHistory) merged.versionHistory = [];
      if (merged.biodata) {
        const seeds = biodataToSeeds(merged.biodata);
        const savedAnswers = (merged as any).answers || {};
        const mergedRep = savedAnswers?.['q_reproductive_status']?.value as string | undefined;
        const mergedPregnant = mergedRep === 'Currently pregnant' || mergedRep === 'Postpartum';
        merged.questionEngine = createQuestionEngine(
          { ...seeds, ...savedAnswers },
          merged.currentPhase || 'registration',
          merged.patientContext?.activeModules || [],
          [],
          merged.biodata.ageGroup || 'adult',
          merged.biodata.sex || undefined,
          mergedPregnant
        );
      }
      return merged;
    }
    const defaults = createEncounterOrchestrator();
    const withBiodata = setPatientBiodata(defaults, {
      patientName, age: patientAge, sex: patientSex, hospitalNumber,
      occupation, residence, informant, informantRelation, reliability, dateOfAdmission,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      department: 'outpatient', hospital: 'AMEXAN', encounterType: 'new', clinician: '',
    });
    if (withBiodata.biodata) {
      const seeds = biodataToSeeds(withBiodata.biodata);
      withBiodata.questionEngine = createQuestionEngine(
        seeds,
        withBiodata.currentPhase,
        withBiodata.patientContext?.activeModules || [],
        [],
        withBiodata.biodata.ageGroup || 'adult',
        withBiodata.biodata.sex || undefined,
        false
      );
    }
    return withBiodata;
  });

  const prevHpiAnswerCountRef = useRef(0);

  const [ccSearch, setCcSearch] = useState('');
  const [ccResults, setCcResults] = useState(getAllSymptomNames());
  const [ccSubmitted, setCcSubmitted] = useState(false);
  const [ccNum, setCcNum] = useState('');
  const [ccUnit, setCcUnit] = useState<string>('Days');
  const [ccWords, setCcWords] = useState('');
  const [semanticStates, setSemanticStates] = useState<Record<string, 'unknown' | 'unable' | 'declined' | 'not_applicable' | 'already_captured'>>({});

  const repStatus = state.questionEngine.answers?.['q_reproductive_status']?.value as string | undefined;
  const pregnant = repStatus === 'Currently pregnant' || repStatus === 'Postpartum';

  const assessmentContext: AssessmentContext = useMemo(() => ({
    age: state.biodata?.age || patientAge || 30,
    sex: state.biodata?.sex || patientSex || 'male',
    pregnant,
    department: state.biodata?.department || 'outpatient',
    module: state.patientContext?.activeModules?.find(m => ['neonatal','pediatric','adult','obstetric'].includes(m)) || 'adult',
    encounterType: state.biodata?.encounterType || 'new',
  }), [state.biodata, patientAge, patientSex, state.patientContext?.activeModules, state.questionEngine.answers, pregnant]);

  const constitutionalContext = useMemo((): ConstitutionalContext => ({
    age: state.biodata?.age || patientAge || 30,
    sex: (state.biodata?.sex || patientSex || 'male') as 'male' | 'female',
    pregnant,
    encounterType: state.biodata?.encounterType || 'outpatient',
    department: state.biodata?.department || 'outpatient',
    location: 'clinic',
    chiefComplaints: state.chiefComplaints.map((cc, i) => ({
      id: cc.id,
      standardizedConcept: cc.complaint,
      patientWording: cc.patientWords || cc.complaint,
      duration: cc.duration,
      durationUnit: parseDurationUnit(cc.duration),
      sequenceOrder: i,
      reporter: 'patient' as const,
      recordedAt: Date.now(),
      author: 'clinician',
    })),
    knownDiseases: (state.patientContext as any)?.knownDiseases || [],
    currentMedications: (state.patientContext as any)?.currentMedications || [],
    knownAllergies: (state.patientContext as any)?.knownAllergies || [],
    workingDiagnoses: (state as any).workingDiagnoses || [],
    capturedFacts: Object.fromEntries(
      Object.entries(state.questionEngine.answers)
        .filter(([, v]) => v != null && v.value != null)
        .map(([k, v]) => [k, v.value]),
    ),
    module: pregnant ? 'obstetric' : state.patientContext?.activeModules?.find(m => ['neonatal','pediatric','adult','obstetric','psychiatric','surgical'].includes(m)) || 'adult',
  }), [state.biodata, patientAge, patientSex, state.questionEngine.answers, state.chiefComplaints, state.patientContext, pregnant]);

  const currentPhase = state.currentPhase;
  const completedPhases = state.completedPhases;
  const phaseIndex = PHASES.findIndex(p => p.id === currentPhase);
  const primaryComplaint = state.chiefComplaints.find(c => c.primary)?.complaint || '';
  const visibleCards = state.questionEngine.visibleCards || [];

  const getSymptomIdForComplaint = useCallback((complaint: string): string | null => {
    if (!complaint) return null;
    const node = getSymptomNodeByName(complaint);
    if (node) return node.identity.id;
    const lower = complaint.toLowerCase();
    if (lower.includes('fever') || lower.includes('homa') || lower.includes('hot')) return 'SX000001';
    if (lower.includes('headache') || lower.includes('cephalalgia')) return 'SX000002';
    if (lower.includes('cough') || lower.includes('kikohozi') || lower.includes('tussis')) return 'SX000005';
    return null;
  }, []);

  const hpiCardsByComplaint = useMemo(() => {
    if (currentPhase !== 'hpi') return [];
    const complaints = state.chiefComplaints;
    if (complaints.length === 0) return [];

    // Sort chronologically: oldest complaint (longest duration) first
    const sorted = [...complaints].sort((a, b) => (b.durationSeconds || 0) - (a.durationSeconds || 0));

    return sorted.map(cc => {
      const symptomId = getSymptomIdForComplaint(cc.complaint) || 'SX000001';
      const symptom = getSymptomById(symptomId);
      if (!symptom) return { complaint: cc.complaint, cards: [] };

      const applicable = getApplicableQuestionsConstitutional(symptom.identity.id, constitutionalContext);
      const objMap = new Map<string, string>();
      for (const o of symptom.objectives) {
        for (const qid of o.questionIds) {
          if (!objMap.has(qid)) objMap.set(qid, o.label);
        }
      }

      const seen = new Set<string>();
      const cards: any[] = [];
      for (const aq of applicable) {
        if (seen.has(aq.question.id)) continue;
        seen.add(aq.question.id);
        const groupLabel = objMap.get(aq.question.id);
        cards.push({
          id: aq.question.id,
          question: aq.displayText,
          type: aq.question.type === 'chips' ? 'chips' : aq.question.type === 'multiple' ? 'multiple' : aq.question.type === 'scale' ? 'scale' : aq.question.type === 'boolean' ? 'boolean' : 'text',
          chips: aq.displayChips || aq.question.chips,
          groupLabel,
          factKey: aq.question.factKey,
        });
      }
      return { complaint: cc.complaint, cards };
    });
  }, [currentPhase, state.chiefComplaints, constitutionalContext, getSymptomIdForComplaint]);

  const complaintFacts = useMemo(() => {
    const facts: { key: string; value: string | number | boolean; type: 'reported' | 'observed' | 'measured' | 'derived'; questionId: string; documentationPhrase: string }[] = [];
    for (const cc of state.chiefComplaints) {
      const symptomId = getSymptomIdForComplaint(cc.complaint);
      if (!symptomId) continue;
      const symptom = getSymptomById(symptomId);
      if (!symptom) continue;
      for (const q of symptom.questions) {
        const ans = state.questionEngine.answers[q.id];
        if (ans !== undefined) {
          const val = Array.isArray(ans.value) ? (ans.value as string[]).join(', ') : ans.value;
          facts.push({
            key: q.factKey,
            value: val,
            type: 'reported',
            questionId: q.id,
            documentationPhrase: q.documentationPhrase,
          });
        }
      }
    }
    return facts;
  }, [state.chiefComplaints, state.questionEngine.answers, getSymptomIdForComplaint]);

  const storeFormatResult = useConstitutionalStore(s => s.formatResult);
  const assessmentFormat = useMemo((): AssessmentFormat | null => {
    if (!state.biodata) return null;
    if (storeFormatResult) {
      const sectionDefs = storeFormatResult.sections;
      const sections: SectionDef[] = sectionDefs.map((s, i) => ({
        id: s.id,
        label: s.label,
        description: s.description || '',
        order: i + 1,
        required: s.required,
        source: 'constitutional' as SectionDef['source'],
        population: ['adult'],
        applicable: () => true,
      }));
      return {
        name: storeFormatResult.contextModifiers.join(' + ') || 'Constitutional Assessment',
        description: `Constitutional format: ${storeFormatResult.format}`,
        population: 'adult',
        sections,
        constitutionalBase: storeFormatResult.format,
        activeAdapters: [],
        encounterType: state.biodata?.encounterType,
      };
    }
    return generateAssessmentFormat(
      state.biodata,
      state.patientContext?.activeModules || [],
      constitutionalContext,
    );
  }, [state.biodata, state.patientContext?.activeModules, constitutionalContext, storeFormatResult]);

  const dynamicSections = useMemo(() => {
    return getDynamicSections(constitutionalContext);
  }, [constitutionalContext]);

  const constitutionalNarrative = useMemo(() => {
    if (complaintFacts.length === 0) return '';
    const complaintIds = state.chiefComplaints.map(cc => getSymptomIdForComplaint(cc.complaint)).filter(Boolean) as string[];
    return generateConstitutionalHpiNarrative(complaintIds, complaintFacts);
  }, [complaintFacts, state.chiefComplaints, getSymptomIdForComplaint]);

  const coughBridge = useCoughEngine(
    state.biodata?.age || patientAge || 30,
    state.biodata?.sex || patientSex || 'male',
    state.biodata?.ageGroup || 'adult',
    pregnant,
    state.chiefComplaints.map(cc => cc.complaint),
    Object.fromEntries(
      Object.entries(state.questionEngine.answers).map(([k, v]) => [k, v.value]),
    ),
  );

  const [examFindings, setExamFindings] = useState<ExamFindings>({});

  // Load exam findings from Firestore on mount
  const examLoadedRef = useRef(false);
  useEffect(() => {
    if (examLoadedRef.current || !encounterIdRef.current) return;
    examLoadedRef.current = true;
    const unsub = listenExamFindings(ORG_ID, DEFAULT_DEPT, DEFAULT_UNIT, encounterIdRef.current, (data) => {
      if (!data) return;
      const loaded: ExamFindings = {};
      for (const system of ['cardiology', 'respiratory', 'abdominal', 'neurological', 'breast'] as const) {
        const findings = data[system] as Record<string, { value: unknown; documentedAt: number }> | undefined;
        if (findings) {
          for (const [id, f] of Object.entries(findings)) {
            loaded[id] = f;
          }
        }
      }
      if (Object.keys(loaded).length > 0) {
        setExamFindings(prev => ({ ...prev, ...loaded }));
      }
    });
    return () => unsub();
  }, []);

  const handleExamFindingChange = useCallback((findingId: string, value: unknown) => {
    setExamFindings(prev => ({
      ...prev,
      [findingId]: { value, documentedAt: Date.now() },
    }));
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await saveEncounter(ORG_ID, encounterIdRef.current, state);
      const eid = encounterIdRef.current;
      if (Object.keys(examFindings).length > 0) {
        persistExamFindings(ORG_ID, DEFAULT_DEPT, DEFAULT_UNIT, eid, {
          cardiology: Object.fromEntries(Object.entries(examFindings).filter(([k]) => k.startsWith('cvs_'))),
          respiratory: Object.fromEntries(Object.entries(examFindings).filter(([k]) => k.startsWith('resp_') || k.startsWith('scr_resp_'))),
          abdominal: Object.fromEntries(Object.entries(examFindings).filter(([k]) => k.startsWith('abd_') || k.startsWith('scr_abd_'))),
          neurological: Object.fromEntries(Object.entries(examFindings).filter(([k]) => k.startsWith('neuro_') || k.startsWith('scr_neuro_'))),
          breast: Object.fromEntries(Object.entries(examFindings).filter(([k]) => k.startsWith('breast_') || k.startsWith('scr_breast_'))),
        }).catch(() => {});
      }
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state.questionEngine.answers, examFindings, currentPhase, completedPhases]);

  const historyFacts = useMemo(() => {
    const facts: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(state.questionEngine.answers)) {
      if (v?.value != null) facts[k] = v.value;
    }
    return facts;
  }, [state.questionEngine.answers]);

  const examBridge = useExaminationEngine(
    (state.biodata?.age || patientAge || 30) * 12,
    state.biodata?.sex || patientSex || 'male',
    pregnant,
    state.chiefComplaints.map(cc => cc.complaint),
    historyFacts,
    examFindings,
    handleExamFindingChange,
    (state.patientContext as any)?.knownDiseases || [],
    state.patientContext?.activeModules || [],
  );

  // Persist evidence graphs to Neo4j whenever they change
  const evidencePersistedRef = useRef(false);
  useEffect(() => {
    const eid = encounterIdRef.current;
    if (!eid || evidencePersistedRef.current) return;
    const allNodes = [
      ...(examBridge.respEvidenceGraph || []).map(n => ({ ...n, value: examFindings[n.finding]?.value })),
      ...(examBridge.abdEvidenceGraph || []).map(n => ({ ...n, value: examFindings[n.finding]?.value })),
      ...(examBridge.cvsEvidenceGraph || []).map(n => ({ ...n, value: examFindings[n.finding]?.value })),
      ...(examBridge.neuroEvidenceGraph || []).map(n => ({ ...n, value: examFindings[n.finding]?.value })),
      ...(examBridge.breastEvidenceGraph || []).map(n => ({ ...n, value: examFindings[n.finding]?.value })),
    ];
    const validNodes = allNodes.filter(n => n.mechanisms?.length > 0 || n.diseases?.length > 0);
    if (validNodes.length > 0) {
      persistEvidenceGraph(eid, validNodes);
      evidencePersistedRef.current = true;
    }
  }, [examBridge.respEvidenceGraph, examBridge.abdEvidenceGraph, examBridge.cvsEvidenceGraph, examBridge.neuroEvidenceGraph, examBridge.breastEvidenceGraph, examFindings]);

  useEffect(() => {
    const answeredCount = Object.keys(state.questionEngine.answers).length;
    if (answeredCount < 2) return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(async () => {
      setState(prev => ({ ...prev, isAiLoading: true }));
      const ctx = getHpiNarrativeContext(state);
      try {
        const enhanced = await generateEnhancedHpiNarrative(ctx);
        setState(prev => ({ ...prev, aiNarrative: enhanced, isAiLoading: false }));
      } catch {
        setState(prev => ({ ...prev, isAiLoading: false }));
      }
    }, 1500);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [state.questionEngine.answers]);

  // Initialize prevHpiAnswerCountRef and auto-scroll HPI phase
  useEffect(() => {
    prevHpiAnswerCountRef.current = Object.keys(state.questionEngine.answers).length;
  }, []);

  useEffect(() => {
    if (currentPhase !== 'hpi') return;
    const currentCount = Object.keys(state.questionEngine.answers).length;
    if (currentCount > prevHpiAnswerCountRef.current && hpiContainerRef.current) {
      prevHpiAnswerCountRef.current = currentCount;
      if (hpiUserScrolledRef.current) return;
      requestAnimationFrame(() => {
        const el = hpiContainerRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
  }, [state.questionEngine.answers, currentPhase]);

  const handleHpiScroll = useCallback(() => {
    const el = hpiContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    hpiUserScrolledRef.current = !isNearBottom;
  }, []);

  // Debounced constitutional store re-evaluation for realtime doc panel/sidebar updates
  const reEvalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (reEvalTimerRef.current) clearTimeout(reEvalTimerRef.current);
    reEvalTimerRef.current = setTimeout(() => {
      const store = useConstitutionalStore.getState();
      if (store.reEvaluate) store.reEvaluate();
    }, 100);
    return () => { if (reEvalTimerRef.current) clearTimeout(reEvalTimerRef.current); };
  }, [state.questionEngine.answers]);

  useEffect(() => {
    if (ccSearch.length === 0) setCcResults(getAllSymptomNames());
    else setCcResults(searchSymptomNodes(ccSearch).map(s => s.identity.canonicalName));
  }, [ccSearch]);

  // ── Sync biodata to constitutional store for real-time format/section evaluation ──
  const constitutionalInitRef = useRef(false);
  useEffect(() => {
    const biodata = state.biodata;
    if (!biodata) return;
    const ageMonths = Math.round((biodata.age || 0) * 12);
    const sex = biodata.sex === 'male' ? 'Male' : 'Female';
    const department = biodata.department || '';

    if (!constitutionalInitRef.current) {
      useConstitutionalStore.getState().initializeFromPatient(ageMonths, sex, department);
      constitutionalInitRef.current = true;
    } else {
      const ctx = useConstitutionalStore.getState().patientContext;
      if (ctx) {
        const newAge = computeAgeFromMonths(ageMonths);
        if (newAge.totalMonths !== ctx.age.totalMonths || sex.toLowerCase() !== ctx.sex) {
          useConstitutionalStore.getState().updatePatientContext({
            age: newAge,
            sex: sex.toLowerCase() as 'male' | 'female',
          });
        }
      }
    }
  }, [state.biodata?.age, state.biodata?.sex, state.biodata?.department]);

  // ── Wire reproductive status answer → constitutional store pregnancyStatus ──
  useEffect(() => {
    const repVal = state.questionEngine.answers?.['q_reproductive_status']?.value as string | undefined;
    if (!repVal) return;
    let pregnancyStatus: 'not_pregnant' | 'pregnant' | 'postpartum' | 'unknown' = 'unknown';
    if (repVal === 'Currently pregnant') pregnancyStatus = 'pregnant';
    else if (repVal === 'Postpartum') pregnancyStatus = 'postpartum';
    else if (repVal === 'Not pregnant (routine care)' || repVal === 'Gynecological complaint only') pregnancyStatus = 'not_pregnant';
    useConstitutionalStore.getState().updatePatientContext({ pregnancyStatus });
  }, [state.questionEngine.answers?.['q_reproductive_status']?.value]);

  // ── Wire age value/unit answers → constitutional store age ──
  useEffect(() => {
    const ageVal = state.questionEngine.answers?.['q_age_value']?.value as string | undefined;
    const ageUnit = state.questionEngine.answers?.['q_age_unit']?.value as string | undefined;
    if (!ageVal || !ageUnit) return;
    const numVal = parseFloat(ageVal);
    if (isNaN(numVal) || numVal <= 0) return;
    let totalMonths = 0;
    switch (ageUnit) {
      case 'Hours': totalMonths = Math.round(numVal / (24 * 30.4375)); break;
      case 'Days': totalMonths = Math.round(numVal / 30.4375); break;
      case 'Months': totalMonths = Math.round(numVal); break;
      case 'Years': totalMonths = Math.round(numVal * 12); break;
    }
    if (totalMonths > 0) {
      const newAge = computeAgeFromMonths(totalMonths);
      useConstitutionalStore.getState().updatePatientContext({ age: newAge });
    }
  }, [state.questionEngine.answers?.['q_age_value']?.value, state.questionEngine.answers?.['q_age_unit']?.value]);

  useEffect(() => {
    const activeSection = useConstitutionalStore.getState().activeSectionId;
    if (!activeSection) return;
    const mappedPhase = SECTION_TO_PHASE[activeSection];
    if (mappedPhase && mappedPhase !== currentPhase) {
      const reverseMap: Record<string, string> = {};
      for (const [sec, ph] of Object.entries(SECTION_TO_PHASE)) {
        reverseMap[ph] = sec;
      }
      const sectionForPhase = reverseMap[currentPhase];
      if (sectionForPhase && sectionForPhase !== activeSection) {
        storeSetActiveSection(sectionForPhase);
      }
    }
  }, [currentPhase]);

  const handleAnswer = useCallback((cardId: string, value: string | number | boolean | string[]) => {
    setState(prev => answerInOrchestrator(prev, cardId, value));
  }, []);

  const handleSemanticState = useCallback((cardId: string, state: 'unknown' | 'unable' | 'declined' | 'not_applicable' | 'already_captured') => {
    setSemanticStates(prev => ({ ...prev, [cardId]: state }));
    setState(prev => answerInOrchestrator(prev, cardId, `__${state}__`));
  }, []);

  function isCardVisibleByCqae(card: QuestionCard, answers: Record<string, Answer>, ctx: ConstitutionalContext): boolean {
    if (card.dependsOn) {
      const ans = answers[card.dependsOn.questionId];
      if (!ans) return false;
      if (card.dependsOn.value !== undefined && ans.value !== card.dependsOn.value) return false;
    }
    if (card.contextCondition) {
      const isActive = ctx.module === card.contextCondition.module;
      if (card.contextCondition.active ? !isActive : isActive) return false;
    }
    if (card.cqae) {
      const ageGroup = determineAgeGroup(ctx.age ?? 30);
      if (card.cqae.ageGroups && !card.cqae.ageGroups.includes(ageGroup)) return false;
      if (card.cqae.sex && ctx.sex !== card.cqae.sex) return false;
      if (card.cqae.pregnant !== undefined && ctx.pregnant !== card.cqae.pregnant) return false;
      if (card.cqae.module) {
        const isActive = ctx.module === card.cqae.module.module;
        if (card.cqae.module.active ? !isActive : isActive) return false;
      }
    }
    return true;
  }

  function filterCardsByCqae(cards: QuestionCard[], answers: Record<string, Answer>, ctx: ConstitutionalContext): QuestionCard[] {
    return cards.filter(c => isCardVisibleByCqae(c, answers, ctx));
  }

  const handleQuickComplete = useCallback((actionId: string) => {
    setState(prev => applyQuickComplete(prev, actionId));
  }, []);

  const handleRequestLab = useCallback((orderId: string) => {
    setState(prev => requestLabOrder(prev, orderId));
  }, []);

  const handleRequestImaging = useCallback((orderId: string) => {
    setState(prev => requestImagingOrder(prev, orderId));
  }, []);

  const handlePrescribe = useCallback((orderId: string) => {
    setState(prev => prescribeMedication(prev, orderId));
  }, []);

  const handleSendToPharmacy = useCallback((orderId: string) => {
    setState(prev => sendPrescriptionToPharmacy(prev, orderId));
  }, []);

  const handleCancelPrescription = useCallback((orderId: string) => {
    setState(prev => cancelPrescription(prev, orderId));
  }, []);

  const goToPhase = useCallback((phase: EncounterPhase) => {
    setState(prev => advancePhase(prev, phase));
  }, []);

  const storeActiveSectionId = useConstitutionalStore(s => s.activeSectionId);
  const storeSetActiveSection = useConstitutionalStore(s => s.setActiveSection);
  const storeGateStates = useConstitutionalStore(s => s.gateStates);

  const SECTION_TO_PHASE: Record<string, EncounterPhase> = {
    biodata: 'registration', chief_complaints: 'chief_complaint', chief_complaint: 'chief_complaint', hpi: 'hpi',
    pmh: 'past_medical', past_surgical_history: 'past_surgical', drug_history: 'drug_history', allergy_history: 'allergies',
    family_history: 'family_history', social_history: 'social_history',
    review_of_systems: 'review_of_systems', examination: 'general_exam',
    clinical_summary: 'clinical_reasoning', syndromes: 'clinical_reasoning',
    mechanisms: 'clinical_reasoning', phenotypes: 'clinical_reasoning',
    differentials: 'clinical_reasoning', problem_list: 'clinical_reasoning',
    investigations: 'investigations', diagnosis: 'diagnosis',
    management: 'management', disposition: 'disposition',
  };

  const storeSectionVisible = useConstitutionalStore(s => s.sectionVisible);

  const storeSectionNav = useMemo(() => {
    const visibleSections = useConstitutionalStore.getState().getVisibleSections();
    const idx = visibleSections.findIndex(s => s.id === storeActiveSectionId);
    return {
      prevSection: idx > 0 ? visibleSections[idx - 1] : null,
      nextSection: idx >= 0 && idx < visibleSections.length - 1 ? visibleSections[idx + 1] : null,
      sectionIndex: idx,
      totalSections: visibleSections.length,
    };
  }, [storeActiveSectionId, storeSectionVisible, storeGateStates]);

  const navigateToSection = useCallback((sectionId: string) => {
    storeSetActiveSection(sectionId);
    const phase = SECTION_TO_PHASE[sectionId];
    if (phase && phase !== currentPhase) {
      setState(prev => {
        const complaints = prev.chiefComplaints.map(c => c.complaint);
        const ageGroup = prev.biodata?.ageGroup;
        const sex = prev.biodata?.sex || undefined;
        const repStatus = prev.questionEngine.answers?.['q_reproductive_status']?.value as string | undefined;
        const pregnant = repStatus === 'Currently pregnant' || repStatus === 'Postpartum';
        return {
          ...prev,
          currentPhase: phase,
          questionEngine: setPhase(prev.questionEngine, phase, complaints, ageGroup, sex, pregnant),
        };
      });
    }
  }, [storeSetActiveSection, currentPhase]);

  const goNextSection = useCallback(() => {
    if (storeSectionNav.nextSection) {
      navigateToSection(storeSectionNav.nextSection.id);
    }
  }, [storeSectionNav.nextSection, navigateToSection]);

  const goPrevSection = useCallback(() => {
    if (storeSectionNav.prevSection) {
      navigateToSection(storeSectionNav.prevSection.id);
    }
  }, [storeSectionNav.prevSection, navigateToSection]);

  const goNext = () => { goNextSection(); };
  const goPrev = () => { goPrevSection(); };

  const submitCc = () => {
    if (!ccSearch.trim()) return;
    const durationStr = ccNum ? `${ccNum} ${ccUnit}` : '';
    setState(prev => addChiefComplaint(prev, ccSearch.trim(), durationStr, '', ccWords));
    setCcSearch('');
    setCcNum('');
    setCcUnit('Days');
    setCcWords('');
    setCcSubmitted(true);
  };

  const deleteCc = (id: string) => {
    setState(prev => removeChiefComplaint(prev, id));
  };

  const addAnotherCc = () => {
    setCcSearch('');
    setCcNum('');
    setCcUnit('Days');
    setCcWords('');
    setCcSubmitted(false);
  };

  const isExistingEncounter = !!initialState;
  const skipRegistration = isExistingEncounter && state.biodata?.patientName;

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (id: string) => setCollapsedSections(cs => ({ ...cs, [id]: !cs[id] }));

  const renderSectionStateBadge = (sectionId: DocSectionId) => {
    const ss = state.sectionStates[sectionId];
    if (!ss) return null;
    const colorMap: Record<SectionExecutionState, string> = {
      not_started: '#94A3B8',
      in_progress: '#F59E0B',
      completed: '#10B981',
      deferred: '#8B5CF6',
      awaiting_information: '#3B82F6',
      completed_with_unknowns: '#F59E0B',
      completed_patient_declined: '#94A3B8',
      not_applicable: '#94A3B8',
    };
    const labelMap: Record<SectionExecutionState, string> = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      completed: 'Done',
      deferred: 'Deferred',
      awaiting_information: 'Awaiting Info',
      completed_with_unknowns: 'Partial',
      completed_patient_declined: 'Declined',
      not_applicable: 'N/A',
    };
    return (
      <span style={{
        display: 'inline-block',
        fontSize: 7,
        fontWeight: 700,
        color: colorMap[ss.status] || '#94A3B8',
        background: `${colorMap[ss.status] || '#94A3B8'}18`,
        padding: '1px 5px',
        borderRadius: 3,
        marginLeft: 4,
        verticalAlign: 'middle',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}>
        {labelMap[ss.status] || ss.status}
      </span>
    );
  };

  const renderQuickComplete = (sectionId: DocSectionId) => {
    const ss = state.sectionStates[sectionId];
    if (!ss || ss.status === 'completed' || ss.status === 'not_applicable') return null;
    const actions = NO_SIGNIFICANT_HISTORY_ACTIONS.filter(a => a.sectionId === sectionId);
    if (actions.length === 0) return null;
    return (
      <div style={{ marginTop: 3 }}>
        {actions.map(action => (
          <button key={`${action.sectionId}_${action.label.replace(/\s+/g, '_')}`}
            onClick={() => handleQuickComplete(`${action.sectionId}_${action.label.replace(/\s+/g, '_')}`)}
            style={{
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 3,
              border: '1px dashed #94A3B8',
              background: '#FFFFFF',
              color: '#64748B',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
            }}>
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderCard = (card: any, answered: boolean) => {
    const chips = card.chips as string[] | undefined;
    const chipCount = chips?.length || 0;
    const showCollapsible = chipCount > 8;
    const visibleChips = showCollapsible && !expandedCards[card.id] ? chips?.slice(0, 8) : chips;
    const ss = semanticStates[card.id];

    const questionText = card.groupLabel
      ? `<b>${card.groupLabel}:</b> ${card.question}`
      : card.question;

    const semanticColors: Record<string, string> = {
      unknown: '#F59E0B', unable: '#8B5CF6', declined: '#EF4444',
      not_applicable: '#64748B', already_captured: '#10B981',
    };
    const semanticLabels: Record<string, string> = {
      unknown: 'Unknown', unable: 'Unable', declined: 'Declined',
      not_applicable: 'N/A', already_captured: 'Captured',
    };

    return (
      <div className={`ec-card ${answered ? 'ec-card-done' : 'ec-card-active'}`} key={card.id}>
        <div className="ec-card-q" dangerouslySetInnerHTML={{ __html: questionText }} />
        {ss && (
          <div style={{ fontSize: 9, fontWeight: 600, color: semanticColors[ss], marginBottom: 4, padding: '2px 6px', background: `${semanticColors[ss]}18`, borderRadius: 3, display: 'inline-block' }}>
            {semanticLabels[ss]}
          </div>
        )}
        {!ss && (
          <>
            {card.type === 'chips' && chips && (
              <>
                <div className="ec-chips ec-chips-inline">
                  {visibleChips?.map((ch: string) => (
                    <button key={ch} className={`ec-chip ${answered && state.questionEngine.answers[card.id]?.value === ch ? 'ec-chip-on' : ''}`}
                      onClick={() => handleAnswer(card.id, ch)}>{ch}</button>
                  ))}
                </div>
                {showCollapsible && chipCount > 8 && (
                  <button className="ec-chip-more" onClick={() => setExpandedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}>
                    {expandedCards[card.id] ? `▲ Less` : `▼ +${chipCount - 8} more`}
                  </button>
                )}
              </>
            )}
            {card.type === 'multiple' && chips && (
              <>
                <div className="ec-chips ec-chips-inline">
                  {visibleChips?.map((ch: string) => {
                    const v = (state.questionEngine.answers[card.id]?.value as string[]) || [];
                    const on = v.includes(ch);
                    return (
                      <button key={ch} className={`ec-chip ${on ? 'ec-chip-on' : ''}`}
                        onClick={() => handleAnswer(card.id, on ? v.filter(x => x !== ch) : [...v, ch])}>{ch}</button>
                    );
                  })}
                </div>
                {showCollapsible && chipCount > 8 && (
                  <button className="ec-chip-more" onClick={() => setExpandedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}>
                    {expandedCards[card.id] ? `▲ Less` : `▼ +${chipCount - 8} more`}
                  </button>
                )}
              </>
            )}
            {card.type === 'boolean' && (
              <div className="ec-chips ec-chips-inline">
                <button className={`ec-chip ${answered && state.questionEngine.answers[card.id]?.value === true ? 'ec-chip-on' : ''}`}
                  onClick={() => handleAnswer(card.id, true)}>Yes</button>
                <button className={`ec-chip ${answered && state.questionEngine.answers[card.id]?.value === false ? 'ec-chip-on' : ''}`}
                  onClick={() => handleAnswer(card.id, false)}>No</button>
              </div>
            )}
            {card.type === 'scale' && (
              <div className="ec-chips ec-chips-inline">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} className={`ec-scl ${answered && state.questionEngine.answers[card.id]?.value === n ? 'ec-scl-on' : ''}`}
                    onClick={() => handleAnswer(card.id, n)}>{n}</button>
                ))}
                <span className="ec-scl-label">10=P</span>
              </div>
            )}
            {card.type === 'text' && (
              <input className="ec-input" placeholder="Type..."
                value={(answered ? state.questionEngine.answers[card.id]?.value as string : '') || ''}
                onChange={e => handleAnswer(card.id, e.target.value)} />
            )}
            {card.type === 'date' && (
              <input className="ec-input" type="date"
                value={(answered ? state.questionEngine.answers[card.id]?.value as string : '') || ''}
                onChange={e => handleAnswer(card.id, e.target.value)} />
            )}
          </>
        )}
        {/* Semantic state footer */}
        <div style={{ display: 'flex', gap: 3, marginTop: ss ? 0 : 6, flexWrap: 'wrap' }}>
          {Object.entries(semanticLabels).map(([key, label]) => {
            const isActive = ss === key;
            return (
              <button key={key} onClick={() => {
                if (isActive) {
                  setSemanticStates(prev => { const n = { ...prev }; delete n[card.id]; return n; });
                } else {
                  handleSemanticState(card.id, key as any);
                }
              }}
              style={{
                fontSize: 8, padding: '1px 5px', borderRadius: 3,
                border: isActive ? 'none' : '1px solid #D0DCE8',
                background: isActive ? semanticColors[key] : 'transparent',
                color: isActive ? '#fff' : '#94A3B8',
                cursor: 'pointer', fontWeight: isActive ? 600 : 400,
                fontFamily: 'inherit', lineHeight: 1.4,
              }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="ec">
      <div className="ec-banner">
        <div className="ec-banner-l">
          <span className="ec-banner-name">{state.biodata?.patientName || patientName}</span>
          <span className="ec-banner-meta">{state.biodata?.age || patientAge}y {state.biodata?.sex === 'male' ? 'M' : 'F'}</span>
          <span className="ec-banner-meta">{state.biodata?.hospitalNumber || hospitalNumber}</span>
          <span className="ec-banner-phase">{PHASES.find(p => p.id === currentPhase)?.fullLabel || currentPhase}</span>
        </div>
        <div className="ec-banner-r">
          {state.isAiLoading && <span className="ec-ai-badge">AI…</span>}
        </div>
      </div>

      <div className="ec-body">
        {/* SECTION SIDEBAR: Constitutional gate-based navigation */}
        <div className="ec-section-sidebar">
          <ConstitutionalSidebar onNavigate={navigateToSection} />
        </div>

        {/* LEFT: Questions — own scroll, sticky footer inside, ONE footer nav for all phases */}
        <div className="ec-question-panel" ref={hpiContainerRef} onScroll={handleHpiScroll}>
          {/* ── Format strip: shows current constitutional format ── */}
          {storeFormatResult && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', marginBottom: 6, borderRadius: 6,
              background: storeFormatResult.format === 'pediatric' || storeFormatResult.format === 'neonatal' ? '#F5F3FF' : '#EFF6FF',
              border: `1px solid ${storeFormatResult.format === 'pediatric' || storeFormatResult.format === 'neonatal' ? '#DDD6FE' : '#BFDBFE'}`,
              fontSize: 10, fontWeight: 600,
              color: storeFormatResult.format === 'pediatric' || storeFormatResult.format === 'neonatal' ? '#7C3AED' : '#2563EB',
            }}>
              <span>Format: {storeFormatResult.contextModifiers.join(' + ')}</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 4, fontSize: 9, fontWeight: 500, color: '#64748B' }}>
                <span>{useConstitutionalStore.getState().completedRequired}/{useConstitutionalStore.getState().totalRequired} sections</span>
              </span>
            </div>
          )}
          {(currentPhase === 'registration' && !skipRegistration) && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">Patient Registration</div>
              <div className="ec-cards">
                {visibleCards.map(c => renderCard(c, !!state.questionEngine.answers[c.id]))}
              </div>
            </div>
          )}
          {(currentPhase === 'registration' && skipRegistration) && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">Patient Registration</div>
              <div className="ec-cards">
                {visibleCards.map(c => renderCard(c, !!state.questionEngine.answers[c.id]))}
              </div>
              <button className="ec-btn-pri" style={{ marginTop: 12 }} onClick={() => goToPhase('chief_complaint')}>Start Chief Complaint →</button>
            </div>
          )}

          {currentPhase === 'chief_complaint' && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">
                {state.chiefComplaints.length > 0 ? 'Chief Complaints' : 'What is the main problem?'}
              </div>

              {state.chiefComplaints.map(cc => (
                <div key={cc.id} className="ec-cc-item">
                  <span className="ec-cc-check">✓</span>
                  <span>
                    <strong>{cc.complaint}</strong>
                    {cc.duration ? ` for ${cc.duration}` : ''}
                    {cc.patientWords ? ` — "${cc.patientWords}"` : ''}
                    {cc.primary ? <span className="ec-cc-primary-badge" style={{ marginLeft: 6, fontSize: 9, color: '#2563EB', fontWeight: 600 }}>PRIMARY</span> : null}
                  </span>
                  <button
                    className="ec-cc-delete"
                    onClick={() => deleteCc(cc.id)}
                    title="Remove complaint"
                    style={{
                      marginLeft: 'auto', background: 'none', border: 'none',
                      color: '#EF4444', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                      padding: '0 4px', lineHeight: 1, fontFamily: 'inherit',
                    }}
                  >✕</button>
                </div>
              ))}

              {!ccSubmitted && (
                <div className="ec-cc-add">
                  <input className="ec-input ec-input-lg" placeholder="Search symptom..." value={ccSearch}
                    onChange={e => setCcSearch(e.target.value)} autoFocus />
                  <div className="ec-cc-results">
                    {ccResults.slice(0, 16).map(s => (
                      <button key={s} className="ec-cc-opt" onClick={() => { setCcSearch(s); }}>{s}</button>
                    ))}
                    {ccSearch && ccResults.length === 0 && (
                      <button className="ec-cc-opt ec-cc-custom" onClick={() => {}}>Use "{ccSearch}"</button>
                    )}
                  </div>
                  {ccSearch && (
                    <div className="ec-cc-dur">
                      <span className="ec-cc-dur-label">Duration:</span>
                      <div className="ec-cc-dur-inputs">
                        <input className="ec-input ec-input-num" type="number" min={1} placeholder="3"
                          value={ccNum} onChange={e => setCcNum(e.target.value)} />
                        <div className="ec-chips">
                          {DURATION_UNITS.map(u => (
                            <button key={u} className={`ec-chip ${ccUnit === u ? 'ec-chip-on' : ''}`}
                              onClick={() => setCcUnit(u)}>{u}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {ccSearch && (
                    <div className="ec-cc-words">
                      <span className="ec-cc-dur-label">Patient&apos;s words (optional)</span>
                      <input className="ec-input" placeholder="e.g. 'I have a hot feeling in my chest'"
                        value={ccWords} onChange={e => setCcWords(e.target.value)} />
                    </div>
                  )}
                  {ccSearch && (
                    <button className="ec-btn-pri ec-cc-add-btn" onClick={submitCc}>
                      {state.chiefComplaints.length === 0 ? 'Add Chief Complaint' : 'Add Additional Complaint'}
                    </button>
                  )}
                </div>
              )}

              {ccSubmitted && (
                <div className="ec-cc-actions">
                  <button className="ec-btn-sec" onClick={addAnotherCc}>+ Add Another Complaint</button>
                  {state.chiefComplaints.length > 0 && (
                    <button className="ec-btn-pri" style={{ marginLeft: 8 }} onClick={() => goToPhase('hpi')}>
                      Continue to HPI →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {currentPhase === 'hpi' && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">
                History of Presenting Illness
                {coughBridge.isCoughActive && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, color: '#7C3AED', marginLeft: 8,
                    background: '#7C3AED18', padding: '1px 6px', borderRadius: 3,
                  }}>Cough · Context-adapted</span>
                )}
              </div>
              {state.chiefComplaints.length === 0 ? (
                <div className="ec-empty-state">
                  <div>No chief complaints recorded. Please add a chief complaint first.</div>
                </div>
              ) : (
                <div className="ec-hpi-grid">
                  {hpiCardsByComplaint.map((group, gi) => {
                    const isCoughGroup = coughBridge.isCoughActive &&
                      group.complaint.toLowerCase().includes('cough');
                    return (
                      <div key={gi} className="ec-hpi-col">
                        <div className="ec-hpi-col-h">
                          {group.complaint}
                          {isCoughGroup && (
                            <span style={{
                              fontSize: 7, fontWeight: 600, color: '#7C3AED', marginLeft: 6,
                              background: '#7C3AED18', padding: '1px 4px', borderRadius: 2,
                              textTransform: 'uppercase', verticalAlign: 'middle',
                            }}>
                              {coughBridge.patientDesc}
                            </span>
                          )}
                        </div>
                        <div className="ec-hpi-cards-grid">
                          {isCoughGroup ? (
                            coughBridge.cards.length > 0 ? (
                              coughBridge.cards.map(c => {
                                const answered = !!state.questionEngine.answers[c.id];
                                const cardForRender = {
                                  ...c,
                                  chips: c.chips,
                                  options: c.options?.map(o => ({ value: o.value, label: o.label })),
                                };
                                return renderCard(cardForRender, answered);
                              })
                            ) : (
                              <div className="ec-empty-state" style={{ padding: '12px' }}>
                                <div>All cough details captured</div>
                              </div>
                            )
                          ) : (
                            group.cards.length > 0 ? group.cards.map((c: any) =>
                              renderCard(c, !!state.questionEngine.answers[c.id])
                            ) : (
                              <div className="ec-empty-state" style={{ padding: '12px' }}>
                                <div>All captured</div>
                              </div>
                            )
                          )}
                        </div>
                        {/* Cough-specific context bar */}
                        {isCoughGroup && coughBridge.hpiNarrative && (
                          <div style={{
                            marginTop: 6, padding: '6px 8px', fontSize: 9, lineHeight: 1.4,
                            color: '#334155', background: '#F8FAFC', borderRadius: 4,
                            borderLeft: '2px solid #7C3AED',
                          }}>
                            {coughBridge.hpiNarrative.slice(0, 200)}
                            {coughBridge.hpiNarrative.length > 200 ? '…' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {hpiCardsByComplaint.length === 0 && state.chiefComplaints.length > 0 && (
                    <div className="ec-empty-state">
                      <div>No further questions. Continue to next phase.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentPhase === 'investigations' && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">Investigations</div>
              <InvestigationCards
                labOrders={state.labOrders}
                imagingOrders={state.imagingOrders}
                onRequestLab={handleRequestLab}
                onRequestImaging={handleRequestImaging}
              />
              {/* Show the investigation plan questions below */}
              {visibleCards.length > 0 && (
                <>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: '#334155',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    marginTop: 10, marginBottom: 4, borderBottom: '1px solid #E2E8F0',
                    paddingBottom: 3,
                  }}>Additional Orders</div>
                  <div className="ec-cards">
                    {visibleCards.map(c => renderCard(c, !!state.questionEngine.answers[c.id]))}
                  </div>
                </>
              )}
            </div>
          )}

          {currentPhase === 'management' && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">Management Plan</div>

              {/* Prescription Cards */}
              {state.prescriptionOrders.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <PrescriptionCards
                    prescriptionOrders={state.prescriptionOrders}
                    onPrescribe={handlePrescribe}
                    onSendToPharmacy={handleSendToPharmacy}
                    onCancel={handleCancelPrescription}
                  />
                </div>
              )}

              {/* Management plan items from auto-generator */}
              {state.managementPlan.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: '#334155',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    marginBottom: 4, borderBottom: '1px solid #E2E8F0', paddingBottom: 3,
                  }}>Plan Items</div>
                  {state.managementPlan.map(m => (
                    <div key={m.id} style={{
                      display: 'flex', gap: 4, padding: '2px 0',
                      fontSize: 9, color: '#475569',
                    }}>
                      <span style={{
                        fontSize: 7, padding: '1px 4px', borderRadius: 3, fontWeight: 600,
                        color: m.category === 'emergency' ? '#DC2626' :
                               m.category === 'definitive' ? '#1D4ED8' :
                               m.category === 'supportive' ? '#16A34A' :
                               m.category === 'monitoring' ? '#D97706' :
                               '#8B5CF6',
                        background: m.category === 'emergency' ? '#FEF2F2' :
                                    m.category === 'definitive' ? '#EFF6FF' :
                                    m.category === 'supportive' ? '#F0FDF4' :
                                    m.category === 'monitoring' ? '#FFF7ED' :
                                    '#F5F3FF',
                        whiteSpace: 'nowrap',
                      }}>
                        {m.category}
                      </span>
                      <span>{m.action}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Management question cards (additional orders) */}
              {visibleCards.length > 0 && (
                <div className="ec-cards">
                  {visibleCards.map(c => renderCard(c, !!state.questionEngine.answers[c.id]))}
                </div>
              )}

              {visibleCards.length === 0 && state.prescriptionOrders.length === 0 && state.managementPlan.length === 0 && (
                <div className="ec-empty-state">
                  <div>Complete the history and examination to generate a management plan.</div>
                </div>
              )}
            </div>
          )}

          {currentPhase === 'general_exam' && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">
                Physical Examination
                <span style={{
                  fontSize: 9, fontWeight: 600, color: '#7C3AED', marginLeft: 8,
                  background: '#7C3AED18', padding: '1px 6px', borderRadius: 3,
                }}>
                  {examBridge.engineOutput.sequence.label}
                </span>
              </div>

              <div className="ec-exam-container">
                <VitalsPanel
                  groups={examBridge.visibleVitals}
                  findings={examFindings}
                  onAnswer={handleExamFindingChange}
                />

                <AnthropometryPanel
                  engineOutput={examBridge.anthropometry}
                  onValueChange={examBridge.handleAnthropometryValue}
                />

                <GeneralExamPanel
                  cards={examBridge.generalExamCards}
                  findings={examBridge.generalExamFindings}
                  ageBand={state.biodata?.ageGroup || 'adult'}
                  onAnswer={examBridge.handleGeneralExamAnswer}
                  narrative={examBridge.engineOutput.generalExamNarrative}
                />

                <RespiratoryPanel
                  mode={examBridge.respMode}
                  cards={examBridge.respCards}
                  expandedCardIds={examBridge.respExpandedCardIds}
                  narrative={examBridge.respNarrative}
                  escalated={examBridge.respEscalated}
                  evidenceGraph={examBridge.respEvidenceGraph}
                  findings={examFindings}
                  onAnswer={examBridge.handleRespiratoryAnswer}
                  onEscalate={() => {
                    /* engine auto-escalates via shouldEscalateToPrimary */
                  }}
                />

                <AbdominalPanel
                  mode={examBridge.abdMode}
                  cards={examBridge.abdCards}
                  expandedCardIds={examBridge.abdExpandedCardIds}
                  narrative={examBridge.abdNarrative}
                  escalated={examBridge.abdEscalated}
                  evidenceGraph={examBridge.abdEvidenceGraph}
                  findings={examFindings}
                  onAnswer={examBridge.handleAbdominalAnswer}
                  onEscalate={() => {}}
                />

                <CardiovascularPanel
                  mode={examBridge.cvsMode}
                  cards={examBridge.cvsCards}
                  expandedCardIds={examBridge.cvsExpandedCardIds}
                  narrative={examBridge.cvsNarrative}
                  escalated={examBridge.cvsEscalated}
                  evidenceGraph={examBridge.cvsEvidenceGraph}
                  findings={examFindings}
                  onAnswer={examBridge.handleCardiovascularAnswer}
                  onEscalate={() => {}}
                />

                <NeurologicalPanel
                  mode={examBridge.neuroMode}
                  cards={examBridge.neuroCards}
                  expandedCardIds={examBridge.neuroExpandedCardIds}
                  narrative={examBridge.neuroNarrative}
                  escalated={examBridge.neuroEscalated}
                  evidenceGraph={examBridge.neuroEvidenceGraph}
                  findings={examFindings}
                  onAnswer={examBridge.handleNeurologicalAnswer}
                  onEscalate={() => {}}
                />

                <BreastPanel
                  mode={examBridge.breastMode}
                  cards={examBridge.breastCards}
                  expandedCardIds={examBridge.breastExpandedCardIds}
                  narrative={examBridge.breastNarrative}
                  escalated={examBridge.breastEscalated}
                  evidenceGraph={examBridge.breastEvidenceGraph}
                  findings={examFindings}
                  onAnswer={examBridge.handleBreastAnswer}
                  onEscalate={() => {}}
                />

                <SystemicExamPanel
                  modules={examBridge.visibleModules}
                  findings={examFindings}
                  onAnswer={handleExamFindingChange}
                />

                <SpecialCascadeRenderer
                  cascades={examBridge.activeCascades}
                  findings={examFindings}
                  onAnswer={handleExamFindingChange}
                />

                <UEOPlayground
                  activeUEOs={examBridge.activeUEOs}
                  allFindings={examFindings}
                  onFindingChange={handleExamFindingChange}
                />
              </div>

              {/* Cross-check alerts */}
              {examBridge.crossCheckResults.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: '#EA580C',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    marginBottom: 6,
                  }}>
                    Cross-Check Alerts ({examBridge.crossCheckResults.length})
                  </div>
                  {examBridge.crossCheckResults.map(cr => (
                    <div key={cr.ruleId} style={{
                      padding: '6px 10px', marginBottom: 4, borderRadius: 5,
                      fontSize: 10, lineHeight: 1.4,
                      background: cr.severity === 'critical' ? '#FEF2F2'
                        : cr.severity === 'warning' ? '#FFF7ED' : '#F0FDF4',
                      border: `1px solid ${
                        cr.severity === 'critical' ? '#FECACA'
                        : cr.severity === 'warning' ? '#FED7AA' : '#BBF7D0'
                      }`,
                      color: cr.severity === 'critical' ? '#991B1B'
                        : cr.severity === 'warning' ? '#9A3412' : '#166534',
                    }}>
                      <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 8 }}>
                        {cr.severity}
                      </span>
                      {' '}{cr.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {![ 'registration', 'chief_complaint', 'hpi', 'general_exam', 'investigations', 'management' ].includes(currentPhase) && (
            <div className="ec-phase-view">
              <div className="ec-phase-title">
                {(() => {
                  const SPECIAL_SECTION_TITLES: Record<string, string> = {
                    birth_history: 'Birth History', development: 'Growth & Development', immunization: 'Immunization History', nutrition: 'Nutrition & Feeding',
                    pregnancy_history: 'Current Pregnancy / Antenatal Profile', obstetric_history: 'Past Obstetric History', gynecological_history: 'Gynecological History',
                    perinatal_history: 'Perinatal History',
                    past_psychiatric_history: 'Past Psychiatric History', substance_use_history: 'Substance Use History', forensic_history: 'Forensic & Legal History', premorbid_personality: 'Premorbid Personality',
                  };
                  const a = storeActiveSectionId;
                  if (a && SPECIAL_SECTION_TITLES[a]) return SPECIAL_SECTION_TITLES[a];
                  return PHASES.find(p => p.id === currentPhase)?.fullLabel || currentPhase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                })()}
              </div>
              {(() => {
                const activeSecId = storeActiveSectionId;
                const SPECIAL_SECTION_IDS = [
                  'birth_history', 'development', 'immunization', 'nutrition',
                  'pregnancy_history', 'obstetric_history', 'gynecological_history',
                  'perinatal_history',
                  'past_psychiatric_history', 'substance_use_history', 'forensic_history', 'premorbid_personality',
                ];
                if (activeSecId && SPECIAL_SECTION_IDS.includes(activeSecId)) return null;
                const SPECIALTY_PREFIXES = ['q_obgyn_', 'q_perinatal_', 'q_peds_', 'q_psych_'];
                const SPECIALTY_VISIBLE_CARDS = visibleCards.filter(c => !SPECIALTY_PREFIXES.some(p => c.id.startsWith(p)));
                return (
                  <div className="ec-cards">
                    {SPECIALTY_VISIBLE_CARDS.map(c => renderCard(c, !!state.questionEngine.answers[c.id]))}
                    {SPECIALTY_VISIBLE_CARDS.length === 0 && (
                      <div className="ec-empty-state">
                        <div>Nothing to collect in this phase.</div>
                      </div>
                    )}
                  </div>
                );
              })()}
              {(() => {
                const SPECIAL_SECTION_IDS = [
                  'birth_history', 'development', 'immunization', 'nutrition',
                  'pregnancy_history', 'obstetric_history', 'gynecological_history',
                  'perinatal_history',
                  'past_psychiatric_history', 'substance_use_history', 'forensic_history', 'premorbid_personality',
                ];
                const activeSecId = storeActiveSectionId;
                if (!activeSecId || !SPECIAL_SECTION_IDS.includes(activeSecId)) return null;

                let cards: QuestionCard[] = [];
                let label = '';
                let tag = '';
                let tagColor = '';
                let search: 'peds' | 'obgyn' | 'perinatal' | 'psych' = 'peds';

                if (['birth_history', 'development', 'immunization', 'nutrition'].includes(activeSecId)) {
                  cards = getPediatricCardsForSection(activeSecId);
                  tag = 'PEDS'; tagColor = '#7C3AED';
                  const ls: Record<string, string> = { birth_history: 'Birth History', development: 'Growth & Development', immunization: 'Immunization History', nutrition: 'Nutrition & Feeding' };
                  label = ls[activeSecId] || activeSecId;
                  search = 'peds';
                } else if (['pregnancy_history', 'obstetric_history', 'gynecological_history'].includes(activeSecId)) {
                  const isGynae = activeSecId === 'gynecological_history';
                  cards = getObgynCardsForSection(activeSecId);
                  // FG-006: Gynecological section includes menstrual history questions
                  if (isGynae) {
                    cards = [...getObgynCardsForSection('menstrual_history'), ...cards];
                  }
                  tag = 'OBGYN'; tagColor = '#2563EB';
                  const ls: Record<string, string> = { pregnancy_history: 'Current Pregnancy / Antenatal Profile', obstetric_history: 'Past Obstetric History', gynecological_history: 'Gynecological History' };
                  label = ls[activeSecId] || activeSecId;
                  search = 'obgyn';
                } else if (activeSecId === 'perinatal_history') {
                  cards = getPerinatalCardsForSection(activeSecId);
                  tag = 'NEONATAL'; tagColor = '#D97706';
                  label = 'Perinatal History';
                  search = 'perinatal';
                } else if (['past_psychiatric_history', 'substance_use_history', 'forensic_history', 'premorbid_personality'].includes(activeSecId)) {
                  cards = getPsychiatricCardsForSection(activeSecId);
                  tag = 'PSYCH'; tagColor = '#8B5CF6';
                  const ls: Record<string, string> = { past_psychiatric_history: 'Past Psychiatric History', substance_use_history: 'Substance Use History', forensic_history: 'Forensic & Legal History', premorbid_personality: 'Premorbid Personality' };
                  label = ls[activeSecId] || activeSecId;
                  search = 'psych';
                }

                if (!cards || cards.length === 0) return null;

                const cqaeFilteredCards = filterCardsByCqae(cards, state.questionEngine.answers, constitutionalContext);
                const cardsToRender = cqaeFilteredCards.length > 0 ? cqaeFilteredCards : cards;
                const answeredCount = cardsToRender.filter(c => !!state.questionEngine.answers[c.id] || !!semanticStates[c.id]).length;
                const totalCount = cardsToRender.length;
                const allAnswered = answeredCount >= totalCount;

                return (
                  <div style={{ marginTop: 12, border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: allAnswered ? '#F0FDF4' : '#FAFAFA', borderBottom: '1px solid #E2E8F0', userSelect: 'none' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: tagColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                      <span style={{ fontSize: 7, fontWeight: 600, color: tagColor, background: `${tagColor}18`, padding: '1px 4px', borderRadius: 2, textTransform: 'uppercase' }}>{tag}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 9, color: allAnswered ? '#16A34A' : '#64748B', fontWeight: 500 }}>
                        {allAnswered ? '✓ Complete' : `${answeredCount}/${totalCount}`}
                      </span>
                    </div>
                    <div style={{ padding: '6px 8px' }}>
                      <div className="ec-cards">
                        {cardsToRender.map(c => renderCard(c as any, !!state.questionEngine.answers[c.id] || !!semanticStates[c.id]))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Sticky footer nav — section-based, driven by constitutional format */}
          <div className="ec-bottom">
            <button className="ec-nav-btn" onClick={goPrevSection} disabled={!storeSectionNav.prevSection}>
              ← Previous{storeSectionNav.prevSection ? `: ${storeSectionNav.prevSection.label}` : ''}
            </button>
            <div className="ec-phase-bar" style={{ gap: 2, fontSize: 9, color: '#64748B' }}>
              <span>Section {storeSectionNav.sectionIndex >= 0 ? storeSectionNav.sectionIndex + 1 : '-'} / {storeSectionNav.totalSections}</span>
              <span style={{ marginLeft: 4, color: '#2563EB', fontWeight: 600 }}>
                {storeActiveSectionId ? (useConstitutionalStore.getState().sections.find(s => s.id === storeActiveSectionId)?.label || '') : ''}
              </span>
            </div>
            <button className="ec-nav-btn ec-nav-next" onClick={goNextSection} disabled={!storeSectionNav.nextSection}>
              Next{storeSectionNav.nextSection ? `: ${storeSectionNav.nextSection.label}` : ''} →
            </button>
          </div>
        </div>

        {/* RIGHT: Live Documentation — Constitutional Section Format (UCAEM-FG-005) */}
        <div className="ec-doc-panel">
          <div className="ec-docs-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Clinical Documentation
            {storeFormatResult ? (
              <span style={{
                fontSize: 8,
                fontWeight: 600,
                color: storeFormatResult.format === 'pediatric' || storeFormatResult.format === 'neonatal' ? '#7C3AED' : '#2563EB',
                background: storeFormatResult.format === 'pediatric' || storeFormatResult.format === 'neonatal' ? '#7C3AED12' : '#2563EB12',
                padding: '1px 5px',
                borderRadius: 3,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}>
                {storeFormatResult.contextModifiers.join(' + ')}
              </span>
            ) : assessmentFormat && (
              <span style={{
                fontSize: 8,
                fontWeight: 600,
                color: '#7C3AED',
                background: '#7C3AED12',
                padding: '1px 5px',
                borderRadius: 3,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}>
                {assessmentFormat.name}
              </span>
            )}
          </div>
          <div className="ec-docs-body">
            {assessmentFormat?.sections.map(section => {
              const sectionId = section.id;
              const cqaeSectionIds = ['perinatal', 'birth_history', 'pediatric_growth', 'immunization', 'nutritional', 'obstetric', 'psychiatric_mse', 'functional', 'perinatal_history', 'development', 'nutrition', 'menstrual_history', 'pregnancy_history', 'obstetric_history', 'gynecological_history', 'past_psychiatric_history', 'substance_use_history', 'forensic_history', 'premorbid_personality'];
              const sectionClass = cqaeSectionIds.includes(sectionId) ? 'ec-doc-sec ec-doc-sec-cqae' : 'ec-doc-sec';
 
              return (
                <div className={sectionClass} key={sectionId}>
                  <div className="ec-doc-sec-h">
                    {section.label}
                    {renderSectionStateBadge(sectionId as DocSectionId)}
                    {cqaeSectionIds.includes(sectionId) && (
                      <span style={{ fontSize: 7, fontWeight: 600, color: '#7C3AED', background: '#7C3AED18', padding: '1px 4px', borderRadius: 2, marginLeft: 4, textTransform: 'uppercase' }}>CQAE</span>
                    )}
                  </div>
                  <div className="ec-doc-text" style={{ fontSize: 10 }}>
                    {sectionId === 'biodata' && (
                      <div style={{ lineHeight: 1.5 }}>
                        <div><strong>{state.biodata?.patientName || patientName}</strong></div>
                        <div>{state.biodata?.age || patientAge} years, {state.biodata?.sex === 'male' ? 'Male' : 'Female'}{state.biodata?.occupation ? `, ${state.biodata.occupation}` : ''}{state.biodata?.residence ? `, residing in ${state.biodata.residence}` : ''}</div>
                        <div style={{ color: '#64748B', fontSize: 9 }}>HN: {state.biodata?.hospitalNumber || hospitalNumber} | Informant: {state.biodata?.informant || '—'}{state.biodata?.informantRelation ? ` (${state.biodata.informantRelation})` : ''} | Reliability: {state.biodata?.reliability || '—'}</div>
                        <div style={{ color: '#64748B', fontSize: 9 }}>Date: {state.biodata?.date || ''} · Time: {state.biodata?.time || ''} · Dept: {state.biodata?.department || '—'} · Encounter: {state.biodata?.encounterType || '—'}</div>
                        {pregnant && (
                          <div style={{ color: '#2563EB', fontWeight: 600, fontSize: 9, marginTop: 2 }}>
                            LMP: {state.questionEngine.answers['q_biodata_lmp']?.value || '—'} | EDD: {state.questionEngine.answers['q_biodata_edd']?.value || '—'} | GBD: {state.questionEngine.answers['q_biodata_gbd_weeks']?.value || '—'}w {state.questionEngine.answers['q_biodata_gbd_days']?.value || '—'}d
                          </div>
                        )}
                        {state.biodata?.encounterType === 'inpatient' && state.biodata?.dateOfAdmission && (
                          <div style={{ color: '#2563EB', fontWeight: 600, fontSize: 9, marginTop: 2 }}>
                            Admitted: {(() => {
                              const admit = new Date(state.biodata!.dateOfAdmission!);
                              const today = new Date();
                              const diff = Math.floor((today.getTime() - admit.getTime()) / 86400000);
                              return `${state.biodata!.dateOfAdmission} (${diff === 0 ? 'Today' : diff === 1 ? '1 day ago' : `${diff} days ago`})`;
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    {sectionId === 'chief_complaints' && state.chiefComplaints.length > 0 && (
                      <div>{state.chiefComplaints.map((cc, i) => (
                        <div key={cc.id} style={{ marginBottom: 1 }}>{cc.complaint}{cc.duration ? ` for ${cc.duration}` : ''}{i < state.chiefComplaints.length - 1 ? ',' : ''}</div>
                      ))}</div>
                    )}
                    {sectionId === 'hpi' && (
                      <div>
                        {coughBridge.isCoughActive && coughBridge.hpiNarrative ? (
                          <>
                            {coughBridge.isCoughActive && (
                              <span style={{
                                fontSize: 7, fontWeight: 600, color: '#7C3AED',
                                background: '#7C3AED15', padding: '1px 4px', borderRadius: 2,
                                textTransform: 'uppercase', marginRight: 4,
                              }}>COUGH ENGINE</span>
                            )}
                            {coughBridge.hpiNarrative}
                            {coughBridge.differentials.length > 0 && (
                              <div style={{ marginTop: 4, fontSize: 9, color: '#64748B' }}>
                                Top differentials: {coughBridge.differentials.slice(0, 3).map(d => d.diseaseName).join(', ')}
                              </div>
                            )}
                          </>
                        ) : constitutionalNarrative || state.aiNarrative || state.hpiNarrative ? (
                          <>{constitutionalNarrative || state.aiNarrative || state.hpiNarrative}</>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>
                            {state.chiefComplaints.length > 0 ? 'Capturing details…' : 'No history captured yet.'}
                          </span>
                        )}
                      </div>
                    )}
                    {sectionId === 'past_medical_surgical' && (
                      <div>{generatePastMedicalSurgicalNarrative(state.questionEngine.answers) || 'Not yet assessed.'}{renderQuickComplete('past_medical_surgical')}</div>
                    )}
                    {sectionId === 'drug_allergy' && (
                      <div>{generateDrugAllergyNarrative(state.questionEngine.answers) || 'Not yet assessed.'}{renderQuickComplete('drug_allergy')}</div>
                    )}
                    {sectionId === 'family_history' && (
                      <div>{generateFamilyHistoryNarrative(state.questionEngine.answers) || 'Not yet assessed.'}{renderQuickComplete('family_history')}</div>
                    )}
                    {sectionId === 'social_history' && (
                      <div>{generateSocialHistoryNarrative(state.questionEngine.answers, state.biodata) || 'Not yet assessed.'}{renderQuickComplete('social_history')}</div>
                    )}
                    {sectionId === 'review_of_systems' && (
                      <div>{generateReviewOfSystemsNarrative(state.questionEngine.answers) || 'Not yet assessed.'}</div>
                    )}
                    {sectionId === 'summary' && (
                      <div>{generateSummaryNarrative(state.questionEngine.answers, state.biodata, state.chiefComplaints) || 'Awaiting history...'}</div>
                    )}
                    {sectionId === 'perinatal' && (
                      <div>
                        <div>Gestational age: {state.questionEngine.answers['q_neonatal_gestational_age']?.value || '—'} wks</div>
                        <div>Birth weight: {state.questionEngine.answers['q_neonatal_birth_weight']?.value || '—'} kg</div>
                        <div>Delivery: {state.questionEngine.answers['q_neonatal_delivery']?.value || '—'}</div>
                        <div>APGAR: {state.questionEngine.answers['q_neonatal_apgar']?.value || '—'}</div>
                        <div>Resuscitation: {state.questionEngine.answers['q_neonatal_resuscitation']?.value === true ? 'Yes' : state.questionEngine.answers['q_neonatal_resuscitation']?.value === false ? 'No' : '—'}</div>
                      </div>
                    )}
                    {sectionId === 'birth_history' && (
                      <div>
                        <div>Place of birth: {state.questionEngine.answers['q_birth_place']?.value || '—'}</div>
                        <div>Mode of delivery: {state.questionEngine.answers['q_birth_delivery']?.value || '—'}</div>
                        <div>Gestation: {state.questionEngine.answers['q_birth_gestation']?.value || '—'} wks</div>
                        <div>Birth weight: {state.questionEngine.answers['q_birth_weight']?.value || '—'} kg</div>
                        <div>APGAR: {state.questionEngine.answers['q_birth_apgar']?.value || '—'}</div>
                        <div>NICU admission: {state.questionEngine.answers['q_birth_nicu']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'pediatric_growth' && (
                      <div>
                        <div>Growth parameters: Pending assessment</div>
                        <div>Developmental milestones: Pending assessment</div>
                      </div>
                    )}
                    {sectionId === 'immunization' && (
                      <div>
                        <div>Immunization status: Review needed</div>
                      </div>
                    )}
                    {sectionId === 'obstetric' && (
                      <div>
                        <div>Gravida: {state.questionEngine.answers['q_female_gravidity']?.value || '—'}  </div>
                        <div>Parity: {state.questionEngine.answers['q_female_parity']?.value || '—'}</div>
                        <div>LMP: {state.questionEngine.answers['q_female_lmp']?.value || '—'}</div>
                        <div>EDD: {state.questionEngine.answers['q_preg_edd']?.value || '—'}</div>
                        <div>Gestational age: {state.questionEngine.answers['q_preg_ga']?.value || '—'} wks</div>
                        <div>Fetal movements: {state.questionEngine.answers['q_preg_fetal_movement']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'nutritional' && (
                      <div>
                        <div>Feeding: {state.questionEngine.answers['q_neonatal_feeding_type']?.value || '—'}</div>
                        <div>Tolerance: {state.questionEngine.answers['q_neonatal_feeding_tolerance']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'psychiatric_mse' && (
                      <div><div>MSE pending documentation</div></div>
                    )}
                    {sectionId === 'functional' && (
                      <div><div>Functional status: Pending assessment</div></div>
                    )}
                    {/* Constitutional format section ID mappings */}
                    {sectionId === 'pmh' && (
                      <div>{generatePastMedicalSurgicalNarrative(state.questionEngine.answers) || 'Not yet assessed.'}{renderQuickComplete('past_medical_surgical')}</div>
                    )}
                    {sectionId === 'drug_history' && (
                      <div>{generateDrugAllergyNarrative(state.questionEngine.answers) || 'Not yet assessed.'}{renderQuickComplete('drug_allergy')}</div>
                    )}
                    {sectionId === 'allergy_history' && (
                      <div>{generateDrugAllergyNarrative(state.questionEngine.answers) || 'Not yet assessed.'}{renderQuickComplete('drug_allergy')}</div>
                    )}
                    {sectionId === 'examination' && (
                      <div>
                        {examBridge.engineOutput.fullExaminationNarrative ? (
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {examBridge.engineOutput.fullExaminationNarrative}

                            {/* Cross-check results in documentation */}
                            {examBridge.crossCheckResults.length > 0 && (
                              <div style={{ marginTop: 8, padding: '6px 8px', background: '#FFF7ED', borderRadius: 4, border: '1px solid #FED7AA' }}>
                                <div style={{ fontWeight: 700, fontSize: 8, color: '#9A3412', textTransform: 'uppercase', marginBottom: 4 }}>
                                  Cross-Check Findings
                                </div>
                                {examBridge.crossCheckResults.map(cr => (
                                  <div key={cr.ruleId} style={{ fontSize: 8, color: '#9A3412', marginBottom: 2 }}>
                                    {cr.message}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Evidence score summary */}
                            {Object.keys(examBridge.engineOutput.evidenceScore.diseaseEvidenceMap).length > 0 && (
                              <div style={{ marginTop: 6, fontSize: 8, color: '#64748B' }}>
                                <div style={{ fontWeight: 600 }}>Evidence: {
                                  Object.entries(examBridge.engineOutput.evidenceScore.diseaseEvidenceMap)
                                    .sort(([, a], [, b]) => b.forDisease - a.forDisease)
                                    .slice(0, 5)
                                    .map(([disease, score]) =>
                                      `${disease} (${score.forDisease.toFixed(1)}↑${score.againstDisease > 0 ? `/${score.againstDisease.toFixed(1)}↓` : ''})`
                                    ).join(', ')
                                }</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>
                            Physical examination findings pending documentation. Capture findings in the Examination phase.
                          </span>
                        )}
                      </div>
                    )}
                    {sectionId === 'clinical_summary' && (
                      <div>{generateSummaryNarrative(state.questionEngine.answers, state.biodata, state.chiefComplaints) || 'Awaiting summary...'}</div>
                    )}
                    {sectionId === 'perinatal_history' && (
                      <div>
                        <div>Gestational age: {state.questionEngine.answers['q_neonatal_gestational_age']?.value || '—'} wks</div>
                        <div>Birth weight: {state.questionEngine.answers['q_neonatal_birth_weight']?.value || '—'} kg</div>
                        <div>Delivery: {state.questionEngine.answers['q_neonatal_delivery']?.value || '—'}</div>
                        <div>APGAR: {state.questionEngine.answers['q_neonatal_apgar']?.value || '—'}</div>
                        <div>Resuscitation: {state.questionEngine.answers['q_neonatal_resuscitation']?.value === true ? 'Yes' : state.questionEngine.answers['q_neonatal_resuscitation']?.value === false ? 'No' : '—'}</div>
                      </div>
                    )}
                    {sectionId === 'development' && (
                      <div><div>Growth & development: Pending assessment</div></div>
                    )}
                    {sectionId === 'nutrition' && (
                      <div>
                        <div>Feeding: {state.questionEngine.answers['q_neonatal_feeding_type']?.value || '—'}</div>
                        <div>Tolerance: {state.questionEngine.answers['q_neonatal_feeding_tolerance']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'pregnancy_history' && (
                      <div>
                        <div>Currently pregnant.</div>
                        <div>LMP: {state.questionEngine.answers['q_obgyn_lmp']?.value || state.questionEngine.answers['q_female_lmp']?.value || '—'}</div>
                        <div>EDD: {state.questionEngine.answers['q_obgyn_edd']?.value || state.questionEngine.answers['q_preg_edd']?.value || '—'}</div>
                        <div>Gestational age: {state.questionEngine.answers['q_obgyn_gestation']?.value || state.questionEngine.answers['q_preg_ga']?.value || '—'} wks</div>
                        <div>Antenatal care: {state.questionEngine.answers['q_obgyn_antenatal_care']?.value || '—'}</div>
                        <div>Fetal movements: {state.questionEngine.answers['q_preg_fetal_movement']?.value || '—'}</div>
                        <div>Pregnancy complications: {state.questionEngine.answers['q_obgyn_pregnancy_complications']?.value || state.questionEngine.answers['q_preg_complications']?.value || 'None'}</div>
                      </div>
                    )}
                    {sectionId === 'obstetric_history' && (
                      <div>
                        <div>Gravida: {state.questionEngine.answers['q_obgyn_gravida']?.value || state.questionEngine.answers['q_female_gravidity']?.value || '—'}</div>
                        <div>Para: {state.questionEngine.answers['q_obgyn_para']?.value || state.questionEngine.answers['q_female_parity']?.value || '—'}</div>
                        <div>Abortus: {state.questionEngine.answers['q_obgyn_abortus']?.value || '—'}</div>
                        <div>Living children: {state.questionEngine.answers['q_obgyn_living']?.value || '—'}</div>
                        <div>Previous C-sections: {state.questionEngine.answers['q_obgyn_previous_cs']?.value || '—'}</div>
                        <div>Past obstetric complications: {state.questionEngine.answers['q_obgyn_obstetric_complications']?.value || 'None'}</div>
                      </div>
                    )}
                    {sectionId === 'gynecological_history' && (
                      <div>
                        <div>Menarche: {state.questionEngine.answers['q_obgyn_menarche']?.value || state.questionEngine.answers['q_female_menarche']?.value || '—'}</div>
                        <div>LMP: {state.questionEngine.answers['q_obgyn_lmp']?.value || state.questionEngine.answers['q_female_lmp']?.value || '—'}</div>
                        <div>Cycle: {state.questionEngine.answers['q_obgyn_cycle_length']?.value || '—'} days, Flow: {state.questionEngine.answers['q_obgyn_flow_duration']?.value || '—'} days</div>
                        <div>Dysmenorrhea: {state.questionEngine.answers['q_obgyn_dysmenorrhea']?.value || '—'} · Menorrhagia: {state.questionEngine.answers['q_obgyn_menorrhagia']?.value || '—'}</div>
                        <div>Menopausal status: {state.questionEngine.answers['q_obgyn_menopause']?.value || '—'}{state.questionEngine.answers['q_obgyn_menopause_age']?.value ? ` (age ${state.questionEngine.answers['q_obgyn_menopause_age'].value})` : ''}</div>
                        <div>Contraception: {state.questionEngine.answers['q_obgyn_contraception']?.value || '—'}</div>
                        <div>Cervical screening: {state.questionEngine.answers['q_obgyn_cervical_screening']?.value || '—'}</div>
                        <div>STI history: {state.questionEngine.answers['q_obgyn_std_history']?.value || '—'}</div>
                        <div>Fertility concerns: {state.questionEngine.answers['q_obgyn_fertility']?.value || '—'}</div>
                        <div>Gynae surgeries: {state.questionEngine.answers['q_obgyn_gynae_surgery']?.value || '—'}</div>
                        <div>Vaginal discharge: {state.questionEngine.answers['q_obgyn_vaginal_discharge']?.value || '—'}</div>
                        <div>Chronic pelvic pain: {state.questionEngine.answers['q_obgyn_pelvic_pain']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'past_psychiatric_history' && (
                      <div>
                        <div>Psychiatric Dx: {state.questionEngine.answers['q_psych_prev_diagnosis']?.value || '—'}</div>
                        <div>Admissions: {state.questionEngine.answers['q_psych_prev_admissions']?.value || '—'}</div>
                        <div>Suicide attempts: {state.questionEngine.answers['q_psych_suicide_attempts']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'substance_use_history' && (
                      <div>
                        <div>Alcohol: {state.questionEngine.answers['q_psych_alcohol']?.value || '—'}</div>
                        <div>Tobacco: {state.questionEngine.answers['q_psych_tobacco']?.value || '—'}</div>
                        <div>Drugs: {state.questionEngine.answers['q_psych_drugs']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'forensic_history' && (
                      <div>
                        <div>Legal issues: {state.questionEngine.answers['q_psych_legal_issues']?.value || '—'}</div>
                        <div>Violence: {state.questionEngine.answers['q_psych_violence']?.value || '—'}</div>
                      </div>
                    )}
                    {sectionId === 'premorbid_personality' && (
                      <div>
                        <div>Traits: {state.questionEngine.answers['q_psych_premorbid_traits']?.value || '—'}</div>
                        <div>Functioning: {state.questionEngine.answers['q_psych_functioning']?.value || '—'}</div>
                        <div>Support: {state.questionEngine.answers['q_psych_social_support']?.value || '—'}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── Timeline (contextual) ── */}
            {state.timeline.length > 0 && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h">TIMELINE</div>
                {state.timeline.map((t, i) => (
                  <div key={i} className="ec-doc-tl">
                    <span className="ec-doc-tl-d">{t.date}</span>
                    <span>{(t as any).events?.join(', ') || (t as any).event || ''}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Clinical Reasoning Summary ── */}
            {state.differentials.length > 0 && !completedPhases.includes('clinical_reasoning') && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h" style={{ color: '#F59E0B' }}>CLINICAL REASONING IN PROGRESS</div>
                <div className="ec-doc-text" style={{ fontSize: 9, color: '#F59E0B', background: '#FFF7ED' }}>
                  The differential diagnoses and management plan will appear here once history taking and examination are satisfactorily completed. Continue capturing clinical information.
                </div>
              </div>
            )}

            {/* ── Differential Diagnoses (only after clinical_reasoning phase is reached) ── */}
            {state.differentials.length > 0 && completedPhases.includes('clinical_reasoning') && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h">DIFFERENTIAL DIAGNOSES</div>
                {state.differentials.slice(0, 8).map(d => (
                  <div key={d.rank} className="ec-doc-df">
                    <span>{d.rank}. {d.diseaseName}</span>
                    <span className="ec-doc-df-p">{d.probability}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Management Plan (only after management phase is reached) ── */}
            {state.managementPlan.length > 0 && completedPhases.includes('management') && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h">MANAGEMENT PLAN</div>
                {state.managementPlan.map(m => (
                  <div key={m.id} className="ec-doc-mgt">
                    <span className={`ec-doc-mgt-c ec-mgt-${m.category}`}>{m.category}</span>
                    <span>{m.action}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Prescription Orders (documentation) ── */}
            {state.prescriptionOrders.some(o => o.status === 'prescribed' || o.status === 'sent_to_pharmacy' || o.status === 'confirmed' || o.status === 'dispensed') && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h">PRESCRIPTIONS</div>
                {state.prescriptionOrders.filter(o => o.status !== 'suggested' && o.status !== 'cancelled').map(o => (
                  <div key={o.id} className="ec-doc-tl" style={{ flexDirection: 'column', padding: '2px 0', marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                      <strong>{o.drugName}</strong>
                      <span style={{
                        fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2,
                        color: '#059669', background: '#F0FDF4',
                      }}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: 7, color: '#475569' }}>
                      {o.dose}{o.doseUnit} {o.route} {o.frequency} x{o.duration}{o.durationUnit}
                      {o.indication ? ` — ${o.indication}` : ''}
                    </div>
                    {o.prescribedAt && (
                      <div style={{ fontSize: 6, color: '#94A3B8' }}>
                        Prescribed: {new Date(o.prescribedAt).toLocaleString()}
                        {o.dispensedAt && ` | Dispensed: ${new Date(o.dispensedAt).toLocaleString()}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Investigation Results (contextual) ── */}
            {state.labOrders.some(o => o.status === 'completed') && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h">LABORATORY RESULTS</div>
                {state.labOrders.filter(o => o.status === 'completed').map(o => (
                  <div key={o.id} className="ec-doc-tl" style={{ flexDirection: 'column', padding: '3px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                      <strong>{o.testName}</strong>
                      <span style={{
                        fontSize: 7, fontWeight: 700,
                        color: o.flag === 'critical' ? '#DC2626' : o.flag === 'abnormal' ? '#EA580C' : '#15803D',
                      }}>
                        {o.flag?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 8, color: '#334155' }}>{o.result}</div>
                  </div>
                ))}
              </div>
            )}
            {state.imagingOrders.some(o => o.status === 'completed') && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h">IMAGING RESULTS</div>
                {state.imagingOrders.filter(o => o.status === 'completed').map(o => (
                  <div key={o.id} className="ec-doc-tl" style={{ flexDirection: 'column', padding: '3px 0' }}>
                    <div style={{ fontSize: 9, fontWeight: 600 }}>{o.studyName}</div>
                    {o.findings && <div style={{ fontSize: 8, color: '#334155' }}><strong>Findings:</strong> {o.findings}</div>}
                    {o.impression && <div style={{ fontSize: 8, color: '#334155' }}><strong>Impression:</strong> {o.impression}</div>}
                    {o.flag && (
                      <span style={{ fontSize: 7, fontWeight: 700, color: o.flag === 'critical' ? '#DC2626' : o.flag === 'abnormal' ? '#EA580C' : '#15803D' }}>
                        {o.flag.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Assessment Progress ── */}
            {state.objectives.length > 0 && (
              <div className="ec-doc-sec">
                <div className="ec-doc-sec-h">ASSESSMENT PROGRESS</div>
                {state.objectives.slice(0, 6).map(obj => (
                  <div key={obj.id} className="ec-doc-tl">
                    <span className="ec-doc-tl-d" style={{ minWidth: 'auto', width: 14 }}>
                      {obj.completed >= obj.required ? '✓' : '○'}
                    </span>
                    <span>{obj.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 9, color: '#94A3B8' }}>{obj.completed}/{obj.required}</span>
                  </div>
                ))}
              </div>
            )}

            {state.chiefComplaints.length === 0 && !state.hpiNarrative && (
              <div className="ec-docs-empty">
                <div className="ec-docs-empty-icon">📋</div>
                <div>Facts will appear here as you capture them.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Noto+Serif+Devanagari:wght@300;400;500;600;700&display=swap');
:root{--sky: #87CEEB; --sky-dark: #5BA3D9; --sky-darker: #4A90D9; --sky-light: #E8F4FD; --sky-lighter: #F0F8FF; --sky-border: #B0D4F1; --sky-focus: #6BB8E8; --white: #FFFFFF; --text: #1A2A3A; --text-secondary: #5A6B7A; --border: #D0DCE8; --border-light: #E2EDF5; --success: #10B981; --warning: #F59E0B; --danger: #EF4444; --purple: #8B5CF6}
.ec{width:100%;height:100vh;max-width:100vw;display:flex;flex-direction:column;background:var(--white);color:var(--text);font-family:'Noto Sans','Inter','Noto Sans Arabic','Noto Sans SC','Noto Sans JP','Noto Serif Devanagari',system-ui,-apple-system,sans-serif;overflow:hidden}
.ec-banner{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;background:var(--white);border-bottom:1px solid var(--border-light);flex-shrink:0;min-height:34px}
.ec-banner-l{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ec-banner-name{font-weight:700;font-size:13px;color:var(--text)}
.ec-banner-meta{font-size:10px;color:var(--text-secondary)}
.ec-banner-phase{font-size:9px;background:var(--sky-light);color:var(--sky-darker);padding:2px 8px;border-radius:4px;font-weight:600}
.ec-ai-badge{font-size:9px;color:var(--sky-darker);background:var(--sky-light);padding:2px 8px;border-radius:4px;animation:pulse 1.5s infinite;font-weight:600}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.ec-body{flex:1;display:grid;grid-template-columns:220px 1fr 300px;overflow:hidden;min-height:0;width:100%}
.ec-question-panel{overflow-y:auto;padding:10px 14px;min-height:0;width:100%;box-sizing:border-box;display:flex;flex-direction:column;background:var(--white)}
.ec-doc-panel{overflow-y:auto;padding:10px;background:var(--sky-lighter);border-left:2px solid var(--sky-border);width:100%;box-sizing:border-box}
.ec-phase-view{width:100%;box-sizing:border-box;flex:1}
.ec-phase-title{font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px;padding-bottom:4px;border-bottom:2px solid var(--sky-light)}
.ec-hpi-grid{display:flex;flex-direction:column;gap:12px;width:100%;box-sizing:border-box}
.ec-hpi-col{border:1px solid var(--border-light);border-radius:6px;padding:8px;background:var(--white);width:100%;box-sizing:border-box}
.ec-hpi-col-h{font-size:10px;font-weight:700;color:var(--sky-darker);padding:0 0 6px 0;margin-bottom:6px;border-bottom:1px solid var(--border-light);text-transform:uppercase;letter-spacing:0.04em}
.ec-hpi-cards-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;width:100%;box-sizing:border-box}
.ec-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;box-sizing:border-box}
.ec-card{border:1px solid var(--border-light);border-radius:6px;padding:7px 8px;background:var(--white);transition:all .15s ease}
.ec-card:hover{box-shadow:0 1px 4px rgba(135,206,235,.15)}
.ec-card-active{border-color:var(--sky);box-shadow:0 0 0 2px rgba(135,206,235,.2)}
.ec-card-done{opacity:.5;border-color:var(--success)}
.ec-card-q{font-size:10px;font-weight:600;color:var(--text);margin-bottom:5px;line-height:1.35}
.ec-card-q b{font-weight:700;color:var(--sky-darker);text-transform:uppercase;font-size:8px;letter-spacing:.03em}
.ec-chips{display:flex;flex-wrap:wrap;gap:4px}
.ec-chips-inline{display:flex;flex-wrap:wrap;gap:3px}
.ec-chip{padding:3px 8px;border-radius:4px;border:1px solid var(--border);background:var(--white);color:var(--text);font-size:10px;font-weight:500;cursor:pointer;transition:all .1s ease;font-family:inherit;white-space:nowrap}
.ec-chip:hover{border-color:var(--sky);background:var(--sky-light)}
.ec-chip-on{border-color:var(--sky-dark)!important;background:var(--sky-light)!important;color:var(--sky-dark)!important;font-weight:600}
.ec-chip-more{font-size:9px;color:var(--sky-darker);background:0 0;border:none;cursor:pointer;padding:3px 0 0;font-family:inherit;font-weight:600}
.ec-scl{width:28px;height:28px;border-radius:5px;border:1px solid var(--border);background:var(--white);color:var(--text);font-size:10px;font-weight:600;cursor:pointer;font-family:inherit}
.ec-scl:hover{border-color:var(--sky);background:var(--sky-light)}
.ec-scl-on{border-color:var(--sky-dark);background:var(--sky-dark);color:var(--white)}
.ec-scl-label{font-size:9px;color:var(--text-secondary);margin-left:5px}
.ec-input{width:100%;padding:6px 10px;border-radius:5px;border:1px solid var(--border);background:var(--white);color:var(--text);font-size:11px;outline:none;font-family:inherit;box-sizing:border-box;transition:border-color .1s}
.ec-input:focus{border-color:var(--sky-focus);box-shadow:0 0 0 2px rgba(107,184,232,.15)}
.ec-input-lg{font-size:14px;padding:10px 14px;border-radius:8px;border:2px solid var(--border)}
.ec-input-lg:focus{border-color:var(--sky-focus)}
.ec-input-num{width:65px;text-align:center}
.ec-empty-state{text-align:center;padding:28px 18px;color:var(--text-secondary);font-size:12px}
.ec-cc-item{display:flex;align-items:center;gap:8px;padding:7px 12px;margin-bottom:5px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:7px;font-size:12px;color:#166534}
.ec-cc-check{color:#16A34A;font-weight:700}
.ec-cc-add{display:flex;flex-direction:column;gap:10px}
.ec-cc-results{display:flex;flex-wrap:wrap;gap:5px}
.ec-cc-opt{padding:5px 12px;border-radius:6px;border:1px solid var(--border);background:var(--white);color:var(--text);font-size:11px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .1s ease}
.ec-cc-opt:hover{border-color:var(--sky);background:var(--sky-light);color:var(--sky-darker)}
.ec-cc-custom{font-style:italic;border-color:var(--sky);color:var(--sky-dark)}
.ec-cc-dur{display:flex;align-items:center;gap:10px}
.ec-cc-dur-label{font-size:11px;font-weight:600;color:var(--text-secondary);white-space:nowrap}
.ec-cc-dur-inputs{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ec-cc-words{margin-top:4px}
.ec-cc-add-btn{margin-top:4px;align-self:flex-start}
.ec-cc-actions{margin-top:10px;display:flex;gap:8px}
.ec-auto-fill-msg{padding:10px 14px;background:var(--sky-light);border:1px solid var(--sky-border);border-radius:6px;color:var(--sky-darker);font-size:12px;margin-bottom:8px}
.ec-reg-bio-name{font-size:17px;font-weight:700;color:var(--text);margin-bottom:5px}
.ec-reg-bio-line{font-size:12px;color:var(--text-secondary);margin-bottom:3px;line-height:1.6}
.ec-reg-bio-admit{font-size:12px;color:var(--sky-darker);font-weight:600;margin-top:5px;padding-top:5px;border-top:1px dashed var(--sky-border)}
.ec-reg-bio-meta{font-size:10px;color:var(--text-secondary);margin-top:5px}
.ec-bio-sep{color:var(--border);margin:0 5px}
.ec-docs-title{font-size:11px;font-weight:700;color:var(--text);margin-bottom:6px;padding-bottom:4px;border-bottom:2px solid var(--sky-border)}
.ec-doc-biodata{background:var(--white);border:1px solid var(--border-light);border-radius:4px;padding:5px 8px;margin-bottom:8px}
.ec-doc-bio-row{font-size:9px;color:var(--text);line-height:1.35}
.ec-doc-bio-name{font-weight:700}
.ec-doc-bio-sep{color:var(--border);margin:0 3px}
.ec-doc-bio-meta{font-size:8px;color:var(--text-secondary)}
.ec-docs-body{font-size:10px}
.ec-doc-sec{margin-bottom:8px}
.ec-doc-sec-h{font-size:8px;font-weight:700;color:var(--sky-darker);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
.ec-doc-text{font-size:10px;color:var(--text);line-height:1.45;white-space:pre-wrap;background:var(--white);border:1px solid var(--border-light);border-radius:5px;padding:7px}
.ec-doc-tl{display:flex;gap:4px;font-size:9px;color:var(--text-secondary);padding:2px 0;border-bottom:1px solid var(--border-light)}
.ec-doc-tl-d{font-weight:600;color:var(--sky-darker);min-width:62px;font-size:8px}
.ec-doc-ul{margin:0;padding-left:14px}
.ec-doc-ul li{font-size:9px;color:var(--text-secondary);margin-bottom:2px}
.ec-doc-cc{display:flex;align-items:center;gap:4px;font-size:9px;color:var(--text);padding:2px 0;border-bottom:1px solid var(--border-light)}
.ec-doc-cc-dot{color:var(--sky);font-size:8px}
.ec-doc-fact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 6px}
.ec-doc-fact{display:flex;flex-direction:column;padding:3px 5px;background:var(--sky-lighter);border:1px solid var(--border-light);border-radius:3px}
.ec-doc-fact-q{font-size:7px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em}
.ec-doc-fact-v{font-size:8px;color:var(--text);font-weight:500}
.ec-doc-df{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border-light);font-size:9px;color:var(--text)}
.ec-doc-df-p{font-family:'JetBrains Mono','Noto Sans Mono',monospace;color:var(--text-secondary);font-size:8px}
.ec-doc-mgt{display:flex;gap:4px;padding:3px 0;border-bottom:1px solid var(--border-light);font-size:8px;color:var(--text-secondary);line-height:1.25}
.ec-doc-mgt-c{font-size:7px;padding:1px 4px;border-radius:3px;font-weight:600;white-space:nowrap}
.ec-mgt-emergency{background:#FEF2F2;color:var(--danger)}
.ec-mgt-definitive{background:var(--sky-light);color:var(--sky-darker)}
.ec-mgt-supportive{background:#F0FDF4;color:#16A34A}
.ec-mgt-monitoring{background:#FFF7ED;color:var(--warning)}
.ec-mgt-referral{background:#F5F3FF;color:var(--purple)}
.ec-docs-empty{text-align:center;padding:45px 14px;color:var(--text-secondary);font-size:11px}
.ec-docs-empty-icon{font-size:26px;margin-bottom:8px;opacity:.3}
.ec-bottom{display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--white);border-top:1px solid var(--border-light);flex-shrink:0;overflow-x:auto;min-height:36px;position:sticky;bottom:0;z-index:10;margin-top:auto}
.ec-exam-container{width:100%;box-sizing:border-box}
.ec-exam-section{margin-bottom:16px;border:1px solid var(--border-light);border-radius:8px;overflow:hidden}
.ec-exam-section-title{font-size:11px;font-weight:700;color:var(--sky-darker);padding:8px 10px;background:var(--sky-lighter);border-bottom:1px solid var(--sky-border);text-transform:uppercase;letter-spacing:.04em}
.ec-exam-group{margin:0;padding:6px 10px}
.ec-exam-group+.ec-exam-group{border-top:1px dashed var(--border-light)}
.ec-exam-group-label{font-size:8px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}
.ec-exam-unit{font-size:8px;color:var(--text-secondary);font-weight:400}
.ec-exam-module-tabs{display:flex;gap:3px;padding:6px 10px;flex-wrap:wrap;border-bottom:1px solid var(--border-light);background:var(--sky-lighter)}
.ec-exam-module-tab{padding:4px 10px;border-radius:4px;border:1px solid var(--border);background:var(--white);color:var(--text-secondary);font-size:9px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .1s ease}
.ec-exam-module-tab:hover{border-color:var(--sky);color:var(--sky-darker)}
.ec-exam-module-tab-active{border-color:var(--sky-dark)!important;background:var(--sky-light)!important;color:var(--sky-dark)!important;font-weight:600}
.ec-exam-module-content{padding:0}
.ec-exam-module-header{font-size:10px;font-weight:700;color:var(--text);padding:8px 10px;display:flex;align-items:center;gap:8px}
.ec-exam-module-sequence{font-size:8px;font-weight:400;color:var(--text-secondary);margin-left:auto}
.ec-exam-cascade{border-top:2px solid var(--warning)}
.ec-exam-cascade-header{font-size:10px;font-weight:700;color:#9A3412;padding:8px 10px;background:#FFF7ED;display:flex;align-items:center;gap:8px}
.ec-exam-cascade-trigger{font-size:8px;font-weight:400;color:#9A3412;margin-left:auto}
.ec-nav-btn{padding:5px 14px;border-radius:6px;border:1px solid var(--border);background:var(--white);color:var(--text-secondary);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .1s ease;white-space:nowrap;line-height:1.3}
.ec-nav-btn:hover:not(:disabled){border-color:var(--sky);color:var(--sky-darker)}
.ec-nav-btn:disabled{opacity:.25;cursor:default}
.ec-nav-next{background:var(--sky);color:var(--white);border-color:var(--sky)}
.ec-nav-next:hover:not(:disabled){background:var(--sky-dark)!important;color:var(--white)!important}
.ec-phase-bar{display:flex;gap:2px;flex:1;justify-content:center;overflow-x:auto;padding:0 4px}
.ec-phase-dot{display:flex;align-items:center;gap:3px;padding:2px 6px;border:none;background:0 0;color:var(--text-secondary);font-size:10px;cursor:pointer;border-radius:4px;transition:all .1s ease;white-space:nowrap;font-family:inherit}
.ec-phase-dot:hover{background:var(--sky-light)}
.ec-dot-active{color:var(--sky-dark)!important;font-weight:700}
.ec-dot-done{color:var(--success)!important}
.ec-phase-dot-l{font-size:8px;font-weight:500}
.ec-btn-pri{padding:7px 18px;border-radius:7px;border:none;background:var(--sky);color:var(--white);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:5px;transition:background .1s ease}
.ec-btn-pri:hover{background:var(--sky-dark)}
.ec-btn-sec{padding:5px 12px;border-radius:5px;border:1px solid var(--border);background:var(--white);color:var(--text-secondary);font-size:11px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .1s ease}
.ec-btn-sec:hover{border-color:var(--sky);color:var(--sky-darker)}
@media(max-width:1100px){
  .ec-body{grid-template-columns:200px 1fr 240px}
}
@media(max-width:900px){
  .ec-body{grid-template-columns:1fr;grid-template-rows:1fr auto}
  .ec-section-sidebar{display:none}
  .ec-doc-panel{border-left:none;border-top:1px solid var(--border-light);max-height:30vh}
  .ec-bottom{flex-wrap:wrap}
  .ec-phase-bar{order:-1;width:100%;justify-content:flex-start;padding-bottom:3px}
  .ec-cards{grid-template-columns:repeat(2,1fr)!important}
}
@media(max-width:480px){
  .ec-question-panel{padding:7px}
  .ec-doc-panel{padding:7px;max-height:25vh}
  .ec-phase-title{font-size:12px}
  .ec-cards{grid-template-columns:1fr!important}
  .ec-card{padding:5px 6px}
  .ec-cc-opt{font-size:10px;padding:4px 8px}
  .ec-input-lg{font-size:13px}
  .ec-banner-name{font-size:11px}
  .ec-banner-meta{font-size:8px}
}
`}</style>
    </div>
  );
}