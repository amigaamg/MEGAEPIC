// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Brain Orchestrator — Bridge between legacy orchestrator and Encounter Brain
// Provides backward-compatible API while using the Encounter Brain internally.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, AnswerRecord, FeatureRecord, ConvergenceState, InterviewState, Contradiction, NarrativePart, DomainCompleteness, CandidateDiseaseState, DiseaseNode } from '../knowbase/diseaseNode';
import type { EncounterBrainState, InformationGap, WorkflowStep, SymptomObject, DiseaseState } from './types';
import { INTERVIEW_STATE_ORDER } from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { getActiveHighways, getMergedDiseaseMap, prefillFromChiefComplaint } from '../highways/abdominalPain';
import { computeDdxUpdate, answerToPolarity } from '../reasoning/bayesianEngine';
import { generateHpiNarrative, type HpiNarrative } from '../reasoning/narrativeEngine';
import { detectContradictions } from '../reasoning/contradictionEngine';
import { computeCompleteness, getCompletenessScore, isHistoryCompleteEnough } from '../reasoning/completenessEngine';

import { createEncounterBrain, processAnswer as brainProcessAnswer, advanceWorkflow, getSummary, isEncounterComplete } from './encounterBrain';
import { computeInformationGaps, selectNextGap, getGapRationale } from '../information-gap-engine/informationGapEngine';
import { assessStory, canGenerateNarrative } from '../clinical-story-engine/clinicalStoryEngine';
import { evaluatePatientContext, evaluateEncounterContext, getContextualIntroduction } from '../context-rules/contextRules';
import { registerSymptom } from './encounterBrain';

export interface BrainSession {
  brain: EncounterBrainState;
  legacyState: EncounterState;
  narrative: HpiNarrative | null;
  isComplete: boolean;
  activeHighways: string[];
}

function buildLegacyState(brain: EncounterBrainState): EncounterState {
  const symptoms = Object.values(brain.symptoms);
  const primarySymptom = symptoms.find(s => s.isPrimary);
  const answers: AnswerRecord[] = [];
  const questionsAsked: string[] = brain.questionsAsked;
  const redFlags: string[] = [];
  const narrativeParts: NarrativePart[] = [];

  for (const symptom of symptoms) {
    for (const attr of Object.values(symptom.attributes)) {
      if (attr.value !== undefined && attr.value !== null && attr.value !== '') {
        answers.push({
          featureId: attr.featureId,
          questionLabel: attr.label,
          value: attr.value,
          polarity: attr.polarity === 'present' ? 'present' : 'absent',
          timestamp: attr.timestamp,
          source: attr.source === 'system' || attr.source === 'inferred' ? 'inferred' : 'socrates',
        });
      }
    }
  }

  for (const ds of Object.values(brain.diseaseStates)) {
    if (ds.redFlagTriggered) {
      redFlags.push(...ds.redFlagFeatures);
    }
  }

  const activeCandidates: CandidateDiseaseState[] = Object.values(brain.diseaseStates).map(ds => ({
    diseaseId: ds.diseaseId,
    diseaseName: ds.diseaseName,
    priorProb: ds.priorProb,
    currentProb: ds.currentProb,
    evidenceFor: ds.supportingEvidence.map(e => e.featureId),
    evidenceAgainst: ds.againstEvidence.map(e => e.featureId),
    importantNegativesFound: [],
    matchedStages: [ds.currentStageIndex],
    scoreResults: {},
    isRedFlagTriggered: ds.redFlagTriggered,
  }));

  const completeness = computeCompleteness({
    patient: {
      age: brain.patient.ageYears,
      sex: brain.patient.sex,
      setting: brain.encounter.encounterType,
      geographicRegion: brain.patient.geographicRegion,
      knownComorbidities: [],
      medications: [],
      surgicalHistory: [],
    },
    chiefComplaint: {
      text: primarySymptom?.label || '',
      symptomId: primarySymptom?.symptomId || '',
      highwayId: brain.encounter.department,
      duration: '',
      preFiledFeatures: [],
    },
    answers,
    questionsAsked,
    redFlagsTriggered: redFlags,
    ddx: {
      activeCandidates,
      leadingDiagnosis: brain.leadingDiseaseId ? activeCandidates.find(c => c.diseaseId === brain.leadingDiseaseId) || null : null,
      convergenceState: brain.diseaseConvergenceState || 'exploring' as ConvergenceState,
      lastUpdated: Date.now(),
    },
    phase: 'triage',
    interviewState: brain.workflow.currentStep as unknown as InterviewState,
    completeness: {
      timeline: brain.completeness['timeline'] || false,
      location: brain.completeness['location'] || false,
      character: brain.completeness['character'] || false,
      severity: brain.completeness['severity'] || false,
      radiation: brain.completeness['radiation'] || false,
      aggravating: brain.completeness['aggravating'] || false,
      relieving: brain.completeness['relieving'] || false,
      temporal_pattern: brain.completeness['temporal_pattern'] || false,
      functional_impact: brain.completeness['functional_impact'] || false,
      associated_gi: brain.completeness['associated_gi'] || false,
      associated_fever: brain.completeness['associated_fever'] || false,
      associated_urinary: brain.completeness['associated_urinary'] || false,
      associated_gynae: brain.completeness['associated_gynae'] || false,
      red_flags: brain.completeness['red_flags'] || false,
      risk_factors: brain.completeness['risk_factors'] || false,
    } as DomainCompleteness,
    contradictions: brain.contradictions,
    narrativeParts,
  } as EncounterState);

  return {
    ...completeness,
    patient: {
      age: brain.patient.ageYears,
      sex: brain.patient.sex as 'male' | 'female',
      setting: brain.encounter.encounterType,
      geographicRegion: brain.patient.geographicRegion,
      knownComorbidities: [],
      medications: [],
      surgicalHistory: [],
    },
    chiefComplaint: {
      text: primarySymptom?.label || '',
      symptomId: primarySymptom?.symptomId || '',
      highwayId: brain.encounter.department,
      duration: '',
      preFiledFeatures: [],
    },
    answers,
    questionsAsked,
    redFlagsTriggered: redFlags,
    ddx: {
      activeCandidates,
      leadingDiagnosis: brain.leadingDiseaseId ? activeCandidates.find(c => c.diseaseId === brain.leadingDiseaseId) || null : null,
      convergenceState: brain.diseaseConvergenceState || 'exploring',
      lastUpdated: Date.now(),
    },
    phase: 'triage',
    interviewState: brain.workflow.currentStep as unknown as InterviewState,
    completeness: completeness as DomainCompleteness,
    contradictions: brain.contradictions,
    narrativeParts,
  } as EncounterState;
}

export function createBrainSession(
  symptomId: string,
  complaintText: string,
  age: number,
  sex: string,
  duration?: string,
  preExistingAnswers: { featureId: string; value: string | boolean | string[] | number }[] = [],
  geographicRegion?: string,
): BrainSession {
  const activeHighways = getActiveHighways(symptomId, complaintText);

  const brain = createEncounterBrain(
    {
      ageYears: age,
      ageMonths: 0,
      sex: sex as 'male' | 'female',
      geographicRegion: geographicRegion || 'unknown',
      name: '',
      patientId: '',
      encounterId: '',
      residence: '',
      informant: 'patient',
      informantRelation: 'self',
      reliability: 'reliable',
      facilityId: '',
      departmentSlug: '',
      unitSlug: '',
      ageCategory: age < 1 ? 'infant' : age < 10 ? 'child' : age < 20 ? 'adolescent' : age < 65 ? 'adult' : 'older_adult',
      pregnancyStatus: 'not_applicable',
      hasUterus: false,
      isBreastfeeding: false,
      isPostpartum: false,
      requiresGuardian: age < 18,
    },
    {
      encounterType: 'emergency',
      department: 'surgery',
      specialty: 'general_surgery',
      acuity: 'urgent',
      referralStatus: 'self',
      isPostoperative: false,
      isTrauma: false,
      emergencyLevel: 'yellow',
    },
    {
      text: complaintText,
      duration: duration || 'unknown',
      severity: 5,
      priority: 'medium',
      activeHighways: activeHighways.map(h => h.id),
    },
  );

  const brainWithSymptom = registerSymptom(brain, symptomId, complaintText, true);

  let updatedBrain = brainWithSymptom;

  for (const answer of preExistingAnswers) {
    updatedBrain = brainProcessAnswer(updatedBrain, answer.featureId, answer.value, FEATURES[answer.featureId]?.label);
  }

  const legacyState = buildLegacyState(updatedBrain);
  const narrative = canGenerateNarrative(updatedBrain.clinicalStory || assessStory(updatedBrain))
    ? generateHpiNarrative(legacyState)
    : null;

  return {
    brain: updatedBrain,
    legacyState,
    narrative,
    isComplete: isEncounterComplete(updatedBrain),
    activeHighways: activeHighways.map(h => h.id),
  };
}

export function processBrainAnswer(
  session: BrainSession,
  featureId: string,
  value: string | boolean | string[] | number,
  questionLabel?: string,
): BrainSession {
  const updatedBrain = brainProcessAnswer(
    session.brain,
    featureId,
    value,
    questionLabel || FEATURES[featureId]?.label,
  );

  const legacyState = buildLegacyState(updatedBrain);
  const narrative = canGenerateNarrative(updatedBrain.clinicalStory || assessStory(updatedBrain))
    ? generateHpiNarrative(legacyState)
    : null;

  return {
    brain: updatedBrain,
    legacyState,
    narrative,
    isComplete: isEncounterComplete(updatedBrain),
    activeHighways: session.activeHighways,
  };
}

export function getBrainNextQuestion(brain: EncounterBrainState): InformationGap | null {
  const gaps = computeInformationGaps(
    brain,
    brain.diseaseStates,
    new Map(),
    brain.timeline,
    brain.questionsAsked,
  );
  return selectNextGap(gaps, brain.questionsAsked);
}

export function getBrainNextQuestions(brain: EncounterBrainState, count: number = 6): InformationGap[] {
  const gaps = computeInformationGaps(
    brain,
    brain.diseaseStates,
    new Map(),
    brain.timeline,
    brain.questionsAsked,
  );
  return gaps.slice(0, count);
}
