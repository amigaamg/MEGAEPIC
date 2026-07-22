// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Encounter Orchestrator v2 — 8-State Clinical Interview OS
// Manages the EncounterState lifecycle: init → answer → update → next question
// Each answer triggers: DDX update → state transition → question selection
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EncounterState, AnswerRecord, FeatureRecord, ConvergenceState,
  InterviewState, Contradiction, NarrativePart, DomainCompleteness,
} from '../knowbase/diseaseNode';
import { INTERVIEW_STATE_ORDER } from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { getHighway, getActiveHighways, getMergedDiseaseMap, prefillFromChiefComplaint } from '../highways/abdominalPain';
import { computeDdxUpdate, answerToPolarity } from '../reasoning/bayesianEngine';
import { selectNextQuestion, selectNextQuestions, type NextQuestion } from '../reasoning/questionEngine';
import { generateHpiNarrative, type HpiNarrative } from '../reasoning/narrativeEngine';
import { detectContradictions } from '../reasoning/contradictionEngine';
import { computeCompleteness, getCompletenessScore, isHistoryCompleteEnough, getNextMissingDomain } from '../reasoning/completenessEngine';

export interface AmexanSession {
  state: EncounterState;
  nextQuestion: NextQuestion | null;
  allNextQuestions: NextQuestion[];
  narrative: HpiNarrative | null;
  questionsAsked: string[];
  isComplete: boolean;
  activeHighways: string[];
}

function buildNarrativePart(featureId: string, value: string | boolean | string[] | number): string {
  const feature = FEATURES[featureId];
  if (!feature) return '';
  const val = String(value);
  const lower = val.toLowerCase();
  if (feature.type === 'boolean') {
    if (lower === 'true' || lower.startsWith('yes')) return `${feature.shortLabel} is present.`;
    return `${feature.shortLabel} is absent.`;
  }
  if (feature.type === 'select') {
    return `${feature.shortLabel}: ${val}.`;
  }
  if (feature.type === 'number') {
    return `${feature.shortLabel}: ${val}.`;
  }
  return `${feature.shortLabel}: ${val}.`;
}

/** Determine the interview state from current answers and DDX state */
function computeInterviewState(state: EncounterState): InterviewState {
  const answeredIds = new Set(state.answers.map(a => a.featureId));
  for (const pf of state.chiefComplaint.preFiledFeatures) {
    answeredIds.add(pf.featureId);
  }

  // STATE 1: Patient identification
  if (state.patient.age === 0) return 'patient_identification';

  // STATE 2: Chief complaint
  if (!state.chiefComplaint.text) return 'chief_complaint';

  // STATE 3: Timeline construction — need onset
  const hasOnset = answeredIds.has('pain_onset') || answeredIds.has('pain_onset_sudden') || answeredIds.has('pain_duration_hours');
  if (!hasOnset) {
    // Check if there are complaint-specific timeline features
    const symptomId = state.chiefComplaint.symptomId;
    if (symptomId === 'vomiting' || state.chiefComplaint.highwayId.includes('vomiting')) {
      if (!answeredIds.has('vomiting_timing') && !answeredIds.has('vomiting_frequency')) return 'timeline_construction';
    }
    if (symptomId === 'bloating' || symptomId === 'abdominal_distension') {
      if (!answeredIds.has('distension_onset')) return 'timeline_construction';
    }
    if (symptomId === 'diarrhea' || symptomId === 'diarrhoea') {
      if (!answeredIds.has('diarrhoea_duration')) return 'timeline_construction';
    }
    if (symptomId === 'constipation') {
      if (!answeredIds.has('constipation_duration')) return 'timeline_construction';
    }
    if (symptomId === 'dysphagia' || symptomId === 'odynophagia') {
      if (!answeredIds.has('dysphagia_onset')) return 'timeline_construction';
    }
    return 'timeline_construction';
  }

  // STATE 4: Symptom characterization — need location, character, severity
  const hasLocation = answeredIds.has('pain_initial_location') || answeredIds.has('pain_location_now');
  const hasCharacter = answeredIds.has('pain_character');
  const hasSeverity = answeredIds.has('pain_severity');
  if (!hasLocation || !hasCharacter || !hasSeverity) return 'symptom_characterization';

  // STATE 5: Differential resolution — convergence check
  const completeness = computeCompleteness(state);
  const hasAssociatedGI = completeness.associated_gi;
  const hasRedFlags = completeness.red_flags;
  const convergence = state.ddx.convergenceState;

  if (convergence === 'exploring' && hasAssociatedGI) {
    // Still need to resolve the differential
    return 'differential_resolution';
  }

  // STATE 6: Red flag exclusion
  if (!hasRedFlags) return 'red_flag_exclusion';

  // STATE 7: Documentation validation — check completeness
  const completenessScore = getCompletenessScore(completeness);
  if (completenessScore < 0.7) return 'documentation_validation';

  // STATE 8: Complete
  return 'complete';
}

/** Initialise an encounter session */
export function createSession(
  symptomId: string,
  complaintText: string,
  age: number,
  sex: string,
  duration?: string,
  preExistingAnswers: { featureId: string; value: string | boolean | string[] | number }[] = [],
  geographicRegion?: string,
): AmexanSession {
  const activeHighways = getActiveHighways(symptomId, complaintText);
  const primaryHighway = activeHighways[0];
  if (!primaryHighway) {
    throw new Error(`No highway found for symptom: ${symptomId}`);
  }

  const diseaseMap = getMergedDiseaseMap(activeHighways);

  const ccPrefills: { featureId: string; answerValue: string }[] = [];
  for (const hw of activeHighways) {
    ccPrefills.push(...prefillFromChiefComplaint(hw, complaintText));
  }

  const initialAnswers: AnswerRecord[] = [
    ...ccPrefills.map((p, i) => ({
      featureId: p.featureId,
      questionLabel: FEATURES[p.featureId]?.label || p.featureId,
      value: p.answerValue,
      polarity: 'present' as const,
      timestamp: Date.now() + i,
      source: 'chief_complaint' as const,
    })),
    ...preExistingAnswers.map((a, i) => ({
      featureId: a.featureId,
      questionLabel: FEATURES[a.featureId]?.label || a.featureId,
      value: a.value,
      polarity: answerToPolarity(a.value),
      timestamp: Date.now() + ccPrefills.length + i,
      source: 'socrates' as const,
    })),
  ];

  const completeness = computeCompleteness({
    patient: { age, sex: sex as 'male' | 'female', setting: 'ED', geographicRegion: geographicRegion || '', knownComorbidities: [], medications: [], surgicalHistory: [] },
    chiefComplaint: { text: complaintText, symptomId, highwayId: activeHighways.map(h => h.id).join('+'), duration, preFiledFeatures: [] as FeatureRecord[] },
    answers: initialAnswers,
    questionsAsked: [],
    redFlagsTriggered: [],
    ddx: { activeCandidates: [], leadingDiagnosis: null, convergenceState: 'exploring', lastUpdated: Date.now() },
    phase: 'triage',
    interviewState: 'patient_identification',
    completeness: {
      timeline: false, location: false, character: false, severity: false, radiation: false,
      aggravating: false, relieving: false, temporal_pattern: false, functional_impact: false,
      associated_gi: false, associated_fever: false, associated_urinary: false, associated_gynae: false,
      red_flags: false, risk_factors: false,
    } as DomainCompleteness,
    contradictions: [],
    narrativeParts: [],
  } as EncounterState);

  const state: EncounterState = {
    patient: { age, sex: sex as 'male' | 'female', setting: 'ED', geographicRegion: geographicRegion || '', knownComorbidities: [], medications: [], surgicalHistory: [] },
    chiefComplaint: {
      text: complaintText,
      symptomId,
      highwayId: activeHighways.map(h => h.id).join('+'),
      duration,
      preFiledFeatures: ccPrefills.map(p => {
        const f = FEATURES[p.featureId];
        return f ? { ...f, sensitivity: 0, specificity: 0 } : null;
      }).filter(Boolean) as FeatureRecord[],
    },
    answers: initialAnswers,
    questionsAsked: [],
    redFlagsTriggered: [],
    ddx: {
      activeCandidates: [],
      leadingDiagnosis: null,
      convergenceState: 'exploring',
      lastUpdated: Date.now(),
    },
    phase: 'triage',
    interviewState: computeInterviewState({
      patient: { age, sex: sex as 'male' | 'female', setting: 'ED', geographicRegion: geographicRegion || '', knownComorbidities: [], medications: [], surgicalHistory: [] },
      chiefComplaint: { text: complaintText, symptomId, highwayId: '', duration, preFiledFeatures: [] as FeatureRecord[] },
      answers: initialAnswers,
      questionsAsked: [],
      redFlagsTriggered: [],
      ddx: { activeCandidates: [], leadingDiagnosis: null, convergenceState: 'exploring', lastUpdated: Date.now() },
      phase: 'triage',
      interviewState: 'patient_identification',
      completeness: {} as any,
      contradictions: [],
      narrativeParts: [],
    } as EncounterState),
    completeness,
    contradictions: [],
    narrativeParts: [],
  };

  // Initial DDX computation
  const ddx = computeDdxUpdate(state, diseaseMap);
  state.ddx = { ...state.ddx, ...ddx, lastUpdated: Date.now() };

  const next = selectNextQuestion(state, [], diseaseMap);
  const allNext = selectNextQuestions(state, [], diseaseMap, 6);

  return {
    state,
    nextQuestion: next,
    allNextQuestions: allNext,
    narrative: null,
    questionsAsked: [],
    isComplete: false,
    activeHighways: activeHighways.map(h => h.id),
  };
}

function getSessionDiseaseMap(session: AmexanSession): Map<string, import('../knowbase/diseaseNode').DiseaseNode> {
  const highways = session.activeHighways
    .map(id => getHighway(id))
    .filter(Boolean) as import('../highways/abdominalPain').SymptomHighway[];
  return getMergedDiseaseMap(highways.length > 0 ? highways : getActiveHighways(
    session.state.chiefComplaint.symptomId,
    session.state.chiefComplaint.text,
  ));
}

/** Process an answer and update the session — v2 with continuous narrative, contradictions, completeness */
export function processAnswer(
  session: AmexanSession,
  featureId: string,
  value: string | boolean | string[] | number,
  questionLabel?: string,
): AmexanSession {
  const diseaseMap = getSessionDiseaseMap(session);

  const answer: AnswerRecord = {
    featureId,
    questionLabel: questionLabel || FEATURES[featureId]?.label || featureId,
    value,
    polarity: answerToPolarity(value),
    timestamp: Date.now(),
    source: 'socrates',
  };

  // Append or replace answer
  const existingIdx = session.state.answers.findIndex(a => a.featureId === featureId);
  const newAnswers = existingIdx >= 0
    ? session.state.answers.map((a, i) => i === existingIdx ? answer : a)
    : [...session.state.answers, answer];
  const newQuestionsAsked = existingIdx >= 0
    ? session.questionsAsked
    : [...session.questionsAsked, featureId];
  const newState = { ...session.state, answers: newAnswers, questionsAsked: newQuestionsAsked };

  // Build continuous narrative part
  const narrativeText = buildNarrativePart(featureId, value);
  const narrativeParts: NarrativePart[] = [
    ...session.state.narrativeParts,
    { section: newState.interviewState, text: narrativeText, timestamp: Date.now(), featureId },
  ];

  // Recompute DDX
  const ddx = computeDdxUpdate(newState, diseaseMap);
  newState.ddx = { ...newState.ddx, ...ddx, lastUpdated: Date.now() };

  // Compute completeness after every answer
  const completeness = computeCompleteness(newState);
  newState.completeness = completeness;

  // Detect contradictions after every answer
  const contradictions = detectContradictions(newState);
  newState.contradictions = contradictions;

  // Update narrative parts
  newState.narrativeParts = narrativeParts;

  // Determine interview state (8-state machine)
  const interviewState = computeInterviewState(newState);
  newState.interviewState = interviewState;

  // Map interview state to legacy phase for compatibility
  const stateToPhase: Record<string, string> = {
    patient_identification: 'triage',
    chief_complaint: 'triage',
    timeline_construction: 'triage',
    symptom_characterization: 'characterization',
    differential_resolution: 'confirmation',
    red_flag_exclusion: 'confirmation',
    documentation_validation: 'risk_factor',
    complete: 'output',
  };
  newState.phase = (stateToPhase[interviewState] || 'triage') as any;

  // Select next question
  const next = selectNextQuestion(newState, newQuestionsAsked, diseaseMap);
  const allNext = selectNextQuestions(newState, newQuestionsAsked, diseaseMap, 6);

  // Check stopping rules
  const shouldStop = next === null ||
    interviewState === 'complete' ||
    isHistoryCompleteEnough(completeness, ddx.leadingDiagnosis?.currentProb || 0) ||
    newQuestionsAsked.length >= 25;

  // Generate narrative at completion
  const hpiNarrative = shouldStop ? generateHpiNarrative(newState) : session.narrative;

  return {
    ...session,
    state: newState,
    nextQuestion: shouldStop ? null : next,
    allNextQuestions: shouldStop ? [] : allNext,
    narrative: hpiNarrative,
    questionsAsked: newQuestionsAsked,
    isComplete: shouldStop,
  };
}

const PHASE_META: Record<string, { label: string; color: string; goal: string }> = {
  patient_identification: { label: 'Patient Identification', color: '#6B7280', goal: 'Establish biodata and initial priors.' },
  chief_complaint: { label: 'Chief Complaint', color: '#6B7280', goal: 'Define the presenting problem.' },
  timeline_construction: { label: 'Timeline Construction', color: '#DC2626', goal: 'When did it start? How has it evolved?' },
  symptom_characterization: { label: 'Symptom Characterization', color: '#7C3AED', goal: 'Location, character, severity, radiation.' },
  differential_resolution: { label: 'Differential Resolution', color: '#2563EB', goal: 'Separate competing diagnoses.' },
  red_flag_exclusion: { label: 'Red Flag Exclusion', color: '#DC2626', goal: 'Exclude life-threatening causes.' },
  documentation_validation: { label: 'Documentation Validation', color: '#059669', goal: 'Fill gaps in the HPI narrative.' },
  complete: { label: 'HPI Complete', color: '#4F46E5', goal: 'Narrative generated.' },
};

export interface PhaseQuestion {
  phaseId: string;
  phaseLabel: string;
  phaseGoal: string;
  color: string;
  questions: NextQuestion[];
  answeredQuestions: { featureId: string; label: string; value: string }[];
}

export function getPhaseQuestions(
  session: AmexanSession,
): PhaseQuestion[] {
  const answeredIds = new Set(session.state.answers.map(a => a.featureId));
  const allNext = session.allNextQuestions;
  const answeredMap = new Map(session.state.answers.map(a => [a.featureId, a]));

  const stateOrder = INTERVIEW_STATE_ORDER;
  const phaseQuestions: Record<string, NextQuestion[]> = {};
  const phaseAnswered: Record<string, { featureId: string; label: string; value: string }[]> = {};

  for (const stateId of stateOrder) {
    phaseQuestions[stateId] = [];
    phaseAnswered[stateId] = [];
  }

  // Group questions by the state they map to
  for (const q of allNext) {
    const stateId = session.state.interviewState || 'timeline_construction';
    phaseQuestions[stateId]?.push(q);
  }

  for (const [fid, a] of answeredMap) {
    const fe = FEATURES[fid];
    if (!fe) continue;
    // Assign to a state
    const stateId = assignFeatureToState(fid);
    const isCC = a.source === 'chief_complaint';
    phaseAnswered[stateId]?.push({
      featureId: fid,
      label: (isCC ? '✓ ' : '') + (a.questionLabel || fe.label || fid),
      value: formatAnswerValue(a.value),
    });
  }

  return stateOrder
    .map(stateId => {
      const meta = PHASE_META[stateId] || PHASE_META.timeline_construction;
      return {
        phaseId: stateId,
        phaseLabel: meta.label,
        phaseGoal: meta.goal,
        color: meta.color,
        questions: phaseQuestions[stateId] || [],
        answeredQuestions: phaseAnswered[stateId] || [],
      };
    })
    .filter(p => p.questions.length > 0 || p.answeredQuestions.length > 0);
}

function assignFeatureToState(featureId: string): string {
  const timeline = ['pain_onset', 'pain_onset_sudden', 'pain_duration_hours', 'pain_duration_days',
    'pain_duration_months', 'vomiting_timing', 'vomiting_frequency',
    'distension_onset', 'distension_progression',
    'diarrhoea_duration', 'constipation_duration',
    'dysphagia_onset', 'dysphagia_duration',
    'hematemesis_timing', 'melena_timing'];
  const characterization = ['pain_initial_location', 'pain_location_now', 'pain_migration',
    'pain_character', 'pain_severity', 'pain_radiation',
    'pain_worsening_factors', 'pain_relieving_factors',
    'pain_temporal_pattern', 'functional_impact',
    'vomiting_description', 'vomiting_bilious', 'vomiting_projectile',
    'distension_site', 'distension_character',
    'diarrhoea_stool_type', 'diarrhoea_frequency',
    'constipation_stool_frequency', 'constipation_stool_consistency',
    'dysphagia_solids_liquids', 'dysphagia_progressive',
    'hematemesis_color', 'hematemesis_volume',
    'melena_volume', 'hematochezia_color', 'hematochezia_volume'];
  const redFlag = ['syncope', 'peritonism', 'rigidity', 'gi_bleeding_syncope',
    'hematemesis', 'melena', 'hematochezia'];
  const risk = ['prior_abdominal_surgery', 'nsaid_use', 'alcohol_use', 'smoking',
    'known_gallstones', 'anticoagulant_use', 'family_history_gi_cancer',
    'previous_similar_episodes', 'pregnancy_status'];

  if (timeline.includes(featureId)) return 'timeline_construction';
  if (characterization.includes(featureId)) return 'symptom_characterization';
  if (redFlag.includes(featureId)) return 'red_flag_exclusion';
  if (risk.includes(featureId)) return 'documentation_validation';
  return 'differential_resolution';
}

function formatAnswerValue(value: string | boolean | string[] | number): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
