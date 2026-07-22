import type {
  EncounterBrainState,
  PatientContext,
  EncounterContext,
  SymptomObject,
  TimelineEvent,
  InformationGap,
  WorkflowStep,
  WorkflowState,
  ClinicalStory,
  DiseaseState,
} from './types';
import type { AnswerRecord, Contradiction } from '../knowbase/diseaseNode';
import {
  WORKFLOW_STEPS,
} from './types';
import { updateAllDiseaseStates, computeConvergenceState } from './diseaseState';
import { addEvent } from '../master-timeline/timelineEngine';
import { computeInformationGaps, selectNextGap } from '../information-gap-engine/informationGapEngine';
import { assessStory } from '../clinical-story-engine/clinicalStoryEngine';
import { detectContradictions } from '../reasoning/contradictionEngine';
import { FEATURES } from '../knowbase/features/featureLibrary';
import type { DiseaseNode } from '../knowbase/diseaseNode';

let brainVersion = 0;

function nextVersion(): number {
  return ++brainVersion;
}

function now(): number {
  return Date.now();
}

function createPatientContext(
  patientData: Record<string, unknown>,
  encounterData: Record<string, unknown>,
): PatientContext {
  return {
    patientId: (patientData.patientId as string) || '',
    encounterId: (encounterData.encounterId as string) || '',
    name: (patientData.name as string) || '',
    ageYears: (patientData.ageYears as number) || 0,
    ageMonths: (patientData.ageMonths as number) || 0,
    ageCategory: (patientData.ageCategory as PatientContext['ageCategory']) || 'adult',
    sex: (patientData.sex as PatientContext['sex']) || 'other',
    pregnancyStatus: (patientData.pregnancyStatus as PatientContext['pregnancyStatus']) || 'unknown',
    hasUterus: (patientData.hasUterus as boolean) ?? false,
    isBreastfeeding: (patientData.isBreastfeeding as boolean) ?? false,
    isPostpartum: (patientData.isPostpartum as boolean) ?? false,
    lmp: patientData.lmp as string | undefined,
    weightKg: patientData.weightKg as number | undefined,
    heightCm: patientData.heightCm as number | undefined,
    bmi: patientData.bmi as number | undefined,
    occupation: patientData.occupation as string | undefined,
    informant: (patientData.informant as string) || '',
    informantRelation: (patientData.informantRelation as string) || '',
    reliability: (patientData.reliability as PatientContext['reliability']) || 'unknown',
    geographicRegion: (patientData.geographicRegion as string) || '',
    facilityId: (encounterData.facilityId as string) || '',
    departmentSlug: (encounterData.departmentSlug as string) || '',
    unitSlug: (encounterData.unitSlug as string) || '',
    requiresGuardian: (patientData.requiresGuardian as boolean) ?? false,
  };
}

function createEncounterContext(
  encounterData: Record<string, unknown>,
): EncounterContext {
  return {
    encounterType: (encounterData.encounterType as EncounterContext['encounterType']) || 'outpatient',
    department: (encounterData.department as EncounterContext['department']) || 'general',
    specialty: (encounterData.specialty as string) || '',
    acuity: (encounterData.acuity as EncounterContext['acuity']) || 'routine',
    referralStatus: (encounterData.referralStatus as EncounterContext['referralStatus']) || 'self',
    referringFacility: encounterData.referringFacility as string | undefined,
    referringClinician: encounterData.referringClinician as string | undefined,
    referralReason: encounterData.referralReason as string | undefined,
    referralDocuments: encounterData.referralDocuments as string[] | undefined,
    isPostoperative: (encounterData.isPostoperative as boolean) ?? false,
    postOpDay: encounterData.postOpDay as number | undefined,
    operationPerformed: encounterData.operationPerformed as string | undefined,
    operationDate: encounterData.operationDate as string | undefined,
    isTrauma: (encounterData.isTrauma as boolean) ?? false,
    traumaMechanism: encounterData.traumaMechanism as string | undefined,
    emergencyLevel: (encounterData.emergencyLevel as EncounterContext['emergencyLevel']) || 'green',
  };
}

function createWorkflowState(): WorkflowState {
  return {
    currentStep: 'registration',
    completedSteps: [],
    skippedSteps: [],
    startedAt: now(),
    updatedAt: now(),
    owner: 'encounter_brain',
  };
}

function getAnsweredFeatureIds(brain: EncounterBrainState): string[] {
  const ids: string[] = [];
  for (const symptom of Object.values(brain.symptoms)) {
    for (const attr of Object.values(symptom.attributes)) {
      ids.push(attr.featureId);
    }
  }
  ids.push(...brain.questionsAsked);
  return ids;
}

function polarityForValue(value: string | boolean | number | string[]): 'present' | 'absent' {
  if (typeof value === 'boolean') return value ? 'present' : 'absent';
  if (Array.isArray(value)) return value.length > 0 ? 'present' : 'absent';
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (['no', 'none', 'never', 'absent', 'n/a', ''].includes(lower)) return 'absent';
    return 'present';
  }
  if (typeof value === 'number') return value > 0 ? 'present' : 'absent';
  return 'present';
}

const TIMELINE_FEATURE_EVENTS: Record<string, TimelineEvent['eventType']> = {
  pain_onset: 'symptom_onset',
  symptom_onset_date: 'symptom_onset',
  pain_onset_sudden: 'symptom_change',
  pain_duration_hours: 'symptom_change',
  pain_duration_days: 'symptom_change',
  progression: 'symptom_change',
  symptom_change: 'symptom_change',
  pain_migration: 'symptom_change',
  pain_temporal_pattern: 'symptom_change',
};

function answerToAnswerRecord(
  brain: EncounterBrainState,
  featureId: string,
  value: string | boolean | number | string[],
  label: string,
): AnswerRecord {
  return {
    featureId,
    questionLabel: label,
    value,
    polarity: polarityForValue(value),
    timestamp: now(),
    source: 'hpi',
  };
}

export function createEncounterBrain(
  patientData: Record<string, unknown>,
  encounterData: Record<string, unknown>,
  chiefComplaintData: Record<string, unknown>,
): EncounterBrainState {
  const patient = createPatientContext(patientData, encounterData);
  const encounter = createEncounterContext(encounterData);
  const encounterId = encounterData.encounterId as string || patient.encounterId || `enc_${now()}`;

  const primarySymptomId = chiefComplaintData.symptomId as string || '';
  const symptoms: Record<string, SymptomObject> = {};

  if (primarySymptomId) {
    symptoms[primarySymptomId] = {
      symptomId: primarySymptomId,
      label: (chiefComplaintData.label as string) || primarySymptomId,
      present: true,
      isPrimary: true,
      attributes: {},
      relationships: [],
      timelineRefs: [],
      owner: 'chief_complaint_engine',
    };
  }

  const brain: EncounterBrainState = {
    encounterId,
    organizationId: (encounterData.organizationId as string) || '',
    version: nextVersion(),

    patient,
    encounter,

    symptoms,
    primarySymptomId,

    timeline: [],
    symptomRelationships: [],

    diseaseStates: {},
    leadingDiseaseId: null,
    diseaseConvergenceState: 'exploring',

    healthSeekingJourney: null,
    chronicDiseases: {},
    previousSurgeries: [],
    postOperativeState: null,
    functionalStatus: null,
    frailtyAssessment: null,

    gaps: [],
    nextGap: null,
    questionsAsked: [],

    clinicalStory: null,

    workflow: createWorkflowState(),
    activeQuestionGroups: [],

    documentationGraph: null,

    contradictions: [],
    redFlags: [],

    completeness: {},
    completenessScore: 0,

    createdAt: now(),
    updatedAt: now(),
    isComplete: false,
  };

  return brain;
}

export function processAnswer(
  brain: EncounterBrainState,
  featureId: string,
  value: string | boolean | number | string[],
  label: string,
): EncounterBrainState {
  const updated: EncounterBrainState = {
    ...brain,
    version: nextVersion(),
    updatedAt: now(),
  };

  const symptomId = updated.primarySymptomId;
  if (symptomId && updated.symptoms[symptomId]) {
    const symptom = updated.symptoms[symptomId];
    const polarity = polarityForValue(value);
    symptom.attributes[featureId] = {
      featureId,
      label,
      value: value as string | boolean | number,
      polarity,
      timestamp: now(),
      certainty: 'patient_reported',
      source: 'patient',
    };
    updated.symptoms = {
      ...updated.symptoms,
      [symptomId]: { ...symptom, attributes: { ...symptom.attributes } },
    };
  }

  if (!updated.questionsAsked.includes(featureId)) {
    updated.questionsAsked = [...updated.questionsAsked, featureId];
  }

  if (TIMELINE_FEATURE_EVENTS[featureId]) {
    const eventType = TIMELINE_FEATURE_EVENTS[featureId];
    const description = `${label}: ${String(value)}`;
    const date = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `tl_${now()}_${Math.random().toString(36).slice(2, 8)}`,
      eventType,
      date,
      datePrecision: 'relative',
      description,
      certainty: 'patient_reported',
      source: 'patient',
      owner: 'timeline_engine',
      metadata: {},
    };
    updated.timeline = [...updated.timeline, newEvent];
  }

  const diseaseMap = new Map<string, DiseaseNode>();
  const featureLibrary: Record<string, import('../knowbase/diseaseNode').FeatureRecord> = {};
  for (const [fid, feat] of Object.entries(FEATURES)) {
    featureLibrary[fid] = feat;
  }

  const answerRec = answerToAnswerRecord(updated, featureId, value, label);
  updated.diseaseStates = updateAllDiseaseStates(updated.diseaseStates, answerRec, diseaseMap, featureLibrary);

  updated.diseaseConvergenceState = computeConvergenceState(updated.diseaseStates);

  const sorted = Object.values(updated.diseaseStates).sort((a, b) => b.currentProb - a.currentProb);
  updated.leadingDiseaseId = sorted.length > 0 ? sorted[0].diseaseId : null;

  updated.gaps = computeInformationGaps(
    updated,
    updated.diseaseStates,
    diseaseMap,
    updated.timeline,
    getAnsweredFeatureIds(updated),
  );

  updated.nextGap = selectNextGap(updated.gaps, getAnsweredFeatureIds(updated));

  updated.clinicalStory = assessStory(updated);

  const completedCount = updated.clinicalStory
    ? updated.clinicalStory.nodes.filter(n => n.complete).length
    : 0;
  const totalCount = updated.clinicalStory
    ? updated.clinicalStory.nodes.length
    : 1;
  updated.completenessScore = totalCount > 0 ? completedCount / totalCount : 0;

  const encounterState = {
    patient: {
      age: updated.patient.ageYears,
      sex: updated.patient.sex as 'male' | 'female',
      setting: updated.encounter.department,
      geographicRegion: updated.patient.geographicRegion,
      knownComorbidities: Object.values(updated.chronicDiseases).map(cd => cd.diseaseName),
      medications: [],
      surgicalHistory: updated.previousSurgeries.map(s => s.procedureName),
    },
    chiefComplaint: {
      text: updated.symptoms[updated.primarySymptomId]?.label || '',
      symptomId: updated.primarySymptomId,
      highwayId: updated.primarySymptomId,
      preFiledFeatures: [],
    },
    answers: [answerRec],
    questionsAsked: updated.questionsAsked,
    redFlagsTriggered: updated.redFlags,
    ddx: {
      activeCandidates: [],
      leadingDiagnosis: null,
      convergenceState: updated.diseaseConvergenceState,
      lastUpdated: now(),
    },
    phase: 'characterization' as const,
    interviewState: 'symptom_characterization' as const,
    completeness: {
      timeline: false, location: false, character: false, severity: false,
      radiation: false, aggravating: false, relieving: false,
      temporal_pattern: false, functional_impact: false, associated_gi: false,
      associated_fever: false, associated_urinary: false, associated_gynae: false,
      red_flags: false, risk_factors: false,
    },
    contradictions: [],
    narrativeParts: [],
  } as any;

  updated.contradictions = detectContradictions(encounterState);
  updated.redFlags = [];

  for (const ds of Object.values(updated.diseaseStates)) {
    if (ds.redFlagTriggered) {
      updated.redFlags.push(...ds.redFlagFeatures);
    }
  }
  updated.redFlags = [...new Set(updated.redFlags)];

  const allWorkflowDone = updated.workflow.completedSteps.length >= WORKFLOW_STEPS.length;
  const storyReady = updated.clinicalStory?.status === 'story_ready' || updated.clinicalStory?.status === 'story_review';
  updated.isComplete = allWorkflowDone || storyReady;

  return updated;
}

export function advanceWorkflow(
  brain: EncounterBrainState,
  nextStep: WorkflowStep,
): EncounterBrainState {
  const currentIdx = WORKFLOW_STEPS.indexOf(brain.workflow.currentStep);
  const nextIdx = WORKFLOW_STEPS.indexOf(nextStep);

  const completedSteps = brain.workflow.completedSteps.includes(brain.workflow.currentStep)
    ? brain.workflow.completedSteps
    : [...brain.workflow.completedSteps, brain.workflow.currentStep];

  const updated: EncounterBrainState = {
    ...brain,
    version: nextVersion(),
    updatedAt: now(),
    workflow: {
      ...brain.workflow,
      currentStep: nextStep,
      completedSteps,
      updatedAt: now(),
    },
  };

  return updated;
}

export function getSummary(brain: EncounterBrainState): string {
  const parts: string[] = [];

  const p = brain.patient;
  parts.push(`${p.name || 'Patient'}, ${p.ageYears || p.ageMonths || '?'}yo ${p.sex}`);

  if (brain.primarySymptomId && brain.symptoms[brain.primarySymptomId]) {
    parts.push(`presenting with ${brain.symptoms[brain.primarySymptomId].label}`);
  }

  if (brain.leadingDiseaseId && brain.diseaseStates[brain.leadingDiseaseId]) {
    const ds = brain.diseaseStates[brain.leadingDiseaseId];
    parts.push(`leading Dx: ${ds.diseaseName} (${Math.round(ds.currentProb * 100)}%)`);
  }

  if (brain.clinicalStory) {
    const status = brain.clinicalStory.status.replace(/_/g, ' ');
    parts.push(`story: ${status} (${Math.round(brain.clinicalStory.completenessScore * 100)}% complete)`);
  }

  parts.push(`step: ${brain.workflow.currentStep.replace(/_/g, ' ')}`);

  if (brain.contradictions.length > 0) {
    parts.push(`${brain.contradictions.length} contradiction(s)`);
  }

  if (brain.redFlags.length > 0) {
    parts.push(`${brain.redFlags.length} red flag(s)`);
  }

  return parts.join(' | ');
}

export function isEncounterComplete(brain: EncounterBrainState): boolean {
  const workflowComplete = brain.workflow.completedSteps.length >= WORKFLOW_STEPS.length;
  const storyReady = brain.clinicalStory?.status === 'story_ready' || brain.clinicalStory?.status === 'story_review';
  const storyComplete = brain.clinicalStory?.status === 'story_review' || (brain.clinicalStory?.completenessScore ?? 0) >= 0.95;
  const allRequiredComplete = brain.workflow.completedSteps.length >= WORKFLOW_STEPS.filter(s => {
    const meta = WORKFLOW_STEPS.find(x => x === s);
    return meta !== undefined;
  }).length;

  return (workflowComplete || allRequiredComplete) && (storyReady || storyComplete);
}

export function addTimelineEvent(
  brain: EncounterBrainState,
  event: Omit<TimelineEvent, 'id' | 'owner'>,
): EncounterBrainState {
  const newEvent: TimelineEvent = {
    ...event,
    id: `tl_${now()}_${Math.random().toString(36).slice(2, 8)}`,
    owner: 'timeline_engine',
  };

  return {
    ...brain,
    version: nextVersion(),
    updatedAt: now(),
    timeline: [...brain.timeline, newEvent],
  };
}

export function registerSymptom(
  brain: EncounterBrainState,
  symptomId: string,
  label: string,
  isPrimary: boolean,
): EncounterBrainState {
  const updated: EncounterBrainState = {
    ...brain,
    version: nextVersion(),
    updatedAt: now(),
    symptoms: {
      ...brain.symptoms,
      [symptomId]: {
        symptomId,
        label,
        present: true,
        isPrimary,
        attributes: {},
        relationships: [],
        timelineRefs: [],
        owner: isPrimary ? 'chief_complaint_engine' : 'hpi_engine',
      },
    },
  };

  if (isPrimary) {
    updated.primarySymptomId = symptomId;
  }

  return updated;
}

export function updateDiseaseStates(
  brain: EncounterBrainState,
  answer: AnswerRecord,
): EncounterBrainState {
  const diseaseMap = new Map<string, DiseaseNode>();
  const featureLibrary: Record<string, import('../knowbase/diseaseNode').FeatureRecord> = {};
  for (const [fid, feat] of Object.entries(FEATURES)) {
    featureLibrary[fid] = feat;
  }

  const updated = {
    ...brain,
    version: nextVersion(),
    updatedAt: now(),
    diseaseStates: updateAllDiseaseStates(brain.diseaseStates, answer, diseaseMap, featureLibrary),
  };

  updated.diseaseConvergenceState = computeConvergenceState(updated.diseaseStates);

  const sorted = Object.values(updated.diseaseStates).sort((a, b) => b.currentProb - a.currentProb);
  updated.leadingDiseaseId = sorted.length > 0 ? sorted[0].diseaseId : null;

  return updated;
}
