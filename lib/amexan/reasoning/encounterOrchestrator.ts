// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Encounter Orchestrator
// Manages the EncounterState lifecycle: init → answer → update → next question
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EncounterState, AnswerRecord, CandidateDiseaseState,
  FeatureRecord, ConvergenceState,
} from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { getHighway, getActiveHighways, getMergedDiseaseMap, prefillFromChiefComplaint } from '../highways/abdominalPain';
import { computeDdxUpdate, answerToPolarity } from '../reasoning/bayesianEngine';
import { selectNextQuestion, selectNextQuestions, type NextQuestion } from '../reasoning/questionEngine';
import { generateHpiNarrative, type HpiNarrative } from '../reasoning/narrativeEngine';

export interface AmexanSession {
  state: EncounterState;
  nextQuestion: NextQuestion | null;
  allNextQuestions: NextQuestion[];
  narrative: HpiNarrative | null;
  questionsAsked: string[];
  isComplete: boolean;
  activeHighways: string[];  // which highways are active (e.g. abdominal_pain + vomiting)
}

/** Initialise an encounter session with cross-highway support */
export function createSession(
  symptomId: string,
  complaintText: string,
  age: number,
  sex: string,
  duration?: string,
  preExistingAnswers: { featureId: string; value: string | boolean | string[] | number }[] = [],
  geographicRegion?: string,
): AmexanSession {
  // Determine active highways (primary + any cross-highways from CC text)
  const activeHighways = getActiveHighways(symptomId, complaintText);
  const primaryHighway = activeHighways[0];
  if (!primaryHighway) {
    throw new Error(`No highway found for symptom: ${symptomId}`);
  }

  // Get merged disease map (includes diseases from ALL active highways)
  const diseaseMap = getMergedDiseaseMap(activeHighways);

  // Pre-fill from chief complaint text (from ALL active highways)
  const ccPrefills: { featureId: string; answerValue: string }[] = [];
  for (const hw of activeHighways) {
    ccPrefills.push(...prefillFromChiefComplaint(hw, complaintText));
  }

  // Build initial answers (from biodata or pre-fills)
  const initialAnswers: AnswerRecord[] = [
    // Pre-fills from chief complaint
    ...ccPrefills.map((p, i) => ({
      featureId: p.featureId,
      questionLabel: FEATURES[p.featureId]?.label || p.featureId,
      value: p.answerValue,
      polarity: 'present' as const,
      timestamp: Date.now() + i,
      source: 'chief_complaint' as const,
    })),
    // Pre-existing answers from store
    ...preExistingAnswers.map((a, i) => ({
      featureId: a.featureId,
      questionLabel: FEATURES[a.featureId]?.label || a.featureId,
      value: a.value,
      polarity: answerToPolarity(a.value),
      timestamp: Date.now() + ccPrefills.length + i,
      source: 'socrates' as const,
    })),
  ];

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
  };

  // Initial DDX computation using merged disease map
  const ddx = computeDdxUpdate(state, diseaseMap);
  state.ddx = { ...state.ddx, ...ddx, lastUpdated: Date.now() };

  // Select first question + all next questions
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

/** Reconstruct merged disease map from session's active highways */
function getSessionDiseaseMap(session: AmexanSession): Map<string, import('../knowbase/diseaseNode').DiseaseNode> {
  const highways = session.activeHighways
    .map(id => getHighway(id))
    .filter(Boolean) as import('../highways/abdominalPain').SymptomHighway[];
  return getMergedDiseaseMap(highways.length > 0 ? highways : getActiveHighways(
    session.state.chiefComplaint.symptomId,
    session.state.chiefComplaint.text,
  ));
}

/** Process an answer and update the session */
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

  // Append or replace answer (supports re-answering/edit)
  const existingIdx = session.state.answers.findIndex(a => a.featureId === featureId);
  const newAnswers = existingIdx >= 0
    ? session.state.answers.map((a, i) => i === existingIdx ? answer : a)
    : [...session.state.answers, answer];
  const newQuestionsAsked = existingIdx >= 0
    ? session.questionsAsked
    : [...session.questionsAsked, featureId];
  const newState = { ...session.state, answers: newAnswers, questionsAsked: newQuestionsAsked };

  // Recompute DDX
  const ddx = computeDdxUpdate(newState, diseaseMap);
  newState.ddx = { ...newState.ddx, ...ddx, lastUpdated: Date.now() };
  // Update phase
  const isVomitingPrimary = newState.chiefComplaint.symptomId === 'vomiting' ||
    newState.chiefComplaint.highwayId.includes('vomiting');
  const isDistensionPrimary = newState.chiefComplaint.symptomId === 'bloating' ||
    newState.chiefComplaint.symptomId === 'abdominal_distension' ||
    newState.chiefComplaint.highwayId.includes('abdominal_distension');
  const isDiarrhoeaPrimary = newState.chiefComplaint.symptomId === 'diarrhea' ||
    newState.chiefComplaint.symptomId === 'diarrhoea' ||
    newState.chiefComplaint.highwayId.includes('diarrhoea');
  const isConstipationPrimary = newState.chiefComplaint.symptomId === 'constipation' ||
    newState.chiefComplaint.highwayId.includes('constipation');
  const isDysphagiaPrimary = newState.chiefComplaint.symptomId === 'dysphagia' ||
    newState.chiefComplaint.symptomId === 'odynophagia' ||
    newState.chiefComplaint.highwayId.includes('dysphagia');
  const isGiBleedingPrimary = newState.chiefComplaint.symptomId === 'hematemesis' ||
    newState.chiefComplaint.symptomId === 'melena' ||
    newState.chiefComplaint.symptomId === 'hematochezia' ||
    newState.chiefComplaint.highwayId.includes('gi_bleeding');
  const hasLocation = newAnswers.some(a =>
    a.featureId === 'pain_initial_location' || a.featureId === 'pain_location_now'
  );
  const hasVomitingDetail = newAnswers.some(a =>
    ['vomiting_timing', 'vomiting_description', 'vomiting_frequency', 'vomiting_bilious',
      'vomiting_projectile', 'vomiting_relation_to_eating', 'vomiting_relief'].includes(a.featureId)
  );
  const hasDistensionDetail = newAnswers.some(a =>
    ['distension_site', 'distension_onset', 'distension_character', 'distension_progression',
      'distension_pain_relation', 'distension_gas_passage_relief'].includes(a.featureId)
  );
  const hasDiarrhoeaDetail = newAnswers.some(a =>
    ['diarrhoea_duration', 'diarrhoea_stool_type', 'diarrhoea_frequency',
      'diarrhoea_nocturnal', 'diarrhoea_dehydration'].includes(a.featureId)
  );
  const hasConstipationDetail = newAnswers.some(a =>
    ['constipation_duration', 'constipation_stool_frequency', 'constipation_stool_consistency',
      'constipation_obstipation', 'constipation_abdominal_pain'].includes(a.featureId)
  );
  const hasDysphagiaDetail = newAnswers.some(a =>
    ['dysphagia_solids_liquids', 'dysphagia_progressive', 'dysphagia_odynophagia',
      'dysphagia_onset', 'dysphagia_aspiration', 'dysphagia_level'].includes(a.featureId)
  );
  const hasGiBleedingDetail = newAnswers.some(a =>
    ['hematemesis', 'hematemesis_color', 'hematemesis_volume', 'melena',
      'melena_volume', 'hematochezia', 'hematochezia_color', 'hematochezia_volume',
      'gi_bleeding_vomiting_first', 'gi_bleeding_painless', 'gi_bleeding_syncope',
      'gi_bleeding_liver_disease'].includes(a.featureId)
  );
  const hasEvolution = newAnswers.some(a =>
    ['pain_character', 'pain_migration', 'pain_radiation', 'nausea', 'vomiting'].includes(a.featureId)
  );

  if (ddx.convergenceState === 'confirming') newState.phase = 'confirmation';
  else if (ddx.convergenceState === 'converging') newState.phase = 'characterization';
  else if (hasLocation || (isVomitingPrimary && hasVomitingDetail) || (isDistensionPrimary && hasDistensionDetail) || (isDiarrhoeaPrimary && hasDiarrhoeaDetail) || (isConstipationPrimary && hasConstipationDetail) || (isDysphagiaPrimary && hasDysphagiaDetail) || (isGiBleedingPrimary && hasGiBleedingDetail)) newState.phase = 'characterization';
  else newState.phase = 'triage';

  // Risk factor phase when confirming and primary symptoms are done
  const diseaseSpecificAnswered = newAnswers.some(a =>
    ['vomiting_timing', 'vomiting_description', 'obstipation', 'rebound_history',
      'peritonism', 'guarding', 'rigidity'].includes(a.featureId)
  );
  if (newState.phase === 'confirmation' && diseaseSpecificAnswered) {
    newState.phase = 'risk_factor';
  }

  // Examination phase when risk factors done and convergence is confirming
  if (newState.phase === 'risk_factor' && ddx.convergenceState === 'confirming') {
    newState.phase = 'examination';
  }

  // Select next question + all next questions
  const next = selectNextQuestion(newState, newQuestionsAsked, diseaseMap);
  const allNext = selectNextQuestions(newState, newQuestionsAsked, diseaseMap, 6);

  const isComplete = next === null || newQuestionsAsked.length >= 20;

  return {
    ...session,
    state: newState,
    nextQuestion: next,
    allNextQuestions: allNext,
    narrative: isComplete ? generateHpiNarrative(newState) : null,
    questionsAsked: newQuestionsAsked,
    isComplete,
  };
}

/** Get questions grouped by clinical phase for display */
export interface PhaseQuestion {
  phaseId: string;
  phaseLabel: string;
  phaseGoal: string;
  color: string;
  questions: NextQuestion[];
  answeredQuestions: { featureId: string; label: string; value: string }[];
}

const PHASE_META: Record<string, { label: string; color: string; goal: string }> = {
  triage: { label: 'Triage & Localisation', color: '#DC2626', goal: 'Is the patient sick? Where did the problem start?' },
  characterization: { label: 'Pain Evolution & Character', color: '#7C3AED', goal: 'How has the pain progressed? Which organ is involved?' },
  confirmation: { label: 'Syndrome Confirmation', color: '#2563EB', goal: 'Which specific disease fits best? Are there complications?' },
  risk_factor: { label: 'Risk Factors & Context', color: '#059669', goal: 'What predisposes this patient?' },
  examination: { label: 'Examination', color: '#D97706', goal: 'Examine the patient to confirm or refute leading diagnoses.' },
  output: { label: 'Summary', color: '#4F46E5', goal: 'HPI Narrative generated' },
};

export function getPhaseQuestions(
  session: AmexanSession,
): PhaseQuestion[] {
  const answeredIds = new Set(session.state.answers.map(a => a.featureId));

  // Get all upcoming questions
  const allNext = session.allNextQuestions;

  // Build answered question lookup
  const answeredMap = new Map(session.state.answers.map(a => [a.featureId, a]));

  // Group unanswered questions by phase
  const phaseQuestions: Record<string, NextQuestion[]> = {
    triage: [], characterization: [], confirmation: [], risk_factor: [], examination: [], output: [],
  };

  for (const q of allNext) {
    const pid = q.priority === 1 ? 'triage' : q.priority === 2 ? 'characterization' : q.priority === 3 ? 'confirmation' : q.priority === 4 ? 'risk_factor' : q.priority === 5 ? 'examination' : 'output';
    phaseQuestions[pid]?.push(q);
  }

  // Build answered questions lookup by phase
  const phaseAnswered: Record<string, { featureId: string; label: string; value: string }[]> = {
    triage: [], characterization: [], confirmation: [], risk_factor: [], examination: [], output: [],
  };

  for (const [fid, a] of answeredMap) {
    const fe = FEATURES[fid];
    if (!fe) continue;
    const pid = getFeaturePhase(fe.featureId);
    const isCC = a.source === 'chief_complaint';
    phaseAnswered[pid]?.push({
      featureId: fid,
      label: (isCC ? '✓ ' : '') + (a.questionLabel || fe.label || fid),
      value: formatAnswerValue(a.value),
    });
  }

  // Return only phases that have content (questions or answers)
  return ['triage', 'characterization', 'confirmation', 'risk_factor', 'examination', 'output']
    .map(pid => {
      const meta = PHASE_META[pid] || PHASE_META.triage;
      return {
        phaseId: pid,
        phaseLabel: meta.label,
        phaseGoal: meta.goal,
        color: meta.color,
        questions: phaseQuestions[pid] || [],
        answeredQuestions: phaseAnswered[pid] || [],
      };
    })
    .filter(p => p.questions.length > 0 || p.answeredQuestions.length > 0);
}

function formatAnswerValue(value: string | boolean | string[] | number): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function getFeaturePhase(featureId: string): string {
  const triage = ['pain_onset', 'pain_initial_location', 'pain_severity', 'syncope', 'peritonism',
    'vomiting_timing', 'distension_onset', 'abdominal_distension', 'diarrhoea_duration',
    'constipation_duration', 'constipation_obstipation', 'dysphagia', 'odynophagia',
    'hematemesis', 'melena', 'hematochezia', 'gi_bleeding_syncope'];
  const evolution = ['pain_character', 'pain_radiation', 'pain_migration', 'pain_location_now',
    'nausea', 'vomiting', 'vomiting_description', 'vomiting_bilious',
    'vomiting_projectile', 'vomiting_frequency', 'anorexia', 'fever', 'pain_worsening_factors',
    'pain_relieving_factors', 'distension_site', 'distension_character', 'distension_progression',
    'distension_pain_relation', 'distension_gas_passage_relief', 'distension_worse_after_meals',
    'distension_timing_cyclical', 'bloating', 'bloating_relation_to_meals',
    'diarrhoea_stool_type', 'diarrhoea_frequency', 'diarrhoea_volume', 'diarrhoea_nocturnal',
    'constipation_stool_frequency', 'constipation_stool_consistency', 'constipation_straining',
    'constipation_incomplete_evacuation', 'constipation_abdominal_pain', 'constipation_bloating',
    'constipation_overflow', 'constipation_painful_defecation',
    'dysphagia_solids_liquids', 'dysphagia_progressive', 'dysphagia_odynophagia',
    'dysphagia_regurgitation', 'dysphagia_onset', 'dysphagia_aspiration',
    'dysphagia_level', 'dysphagia_weight_loss', 'dysphagia_neck_mass', 'dysphagia_hoarseness',
    'dysphagia_nasal_regurgitation', 'dysphagia_drooling',
    'odynophagia_location', 'odynophagia_pain_character', 'odynophagia_fever',
    'hematemesis_color', 'hematemesis_volume', 'hematemesis_frequency',
    'melena_frequency', 'melena_volume', 'melena_duration_days', 'melena_hematemesis_association',
    'hematochezia_volume', 'hematochezia_color', 'hematochezia_relation_to_stool',
    'hematochezia_frequency', 'gi_bleeding_vomiting_first', 'gi_bleeding_painless',
    'gi_bleeding_dysphagia', 'gi_bleeding_weight_loss'];
  const confirmation = ['vomiting_relation_to_eating',
    'vomiting_relief', 'vomiting_force', 'fever_chills', 'rebound_history',
    'guarding', 'bowel_habits', 'diarrhea', 'constipation', 'obstipation', 'melena', 'hematochezia',
    'hematemesis', 'dysuria', 'hematuria', 'flank_pain', 'vaginal_discharge', 'vaginal_bleeding',
    'last_menstrual_period', 'dyspareunia', 'jaundice', 'abdominal_distension', 'heartburn', 'belching',
    'early_satiety', 'leg_swelling', 'weight_loss', 'night_sweats', 'dyspnea',
    'steatorrhea', 'tenesmus', 'diarrhoea_relation_to_food', 'diarrhoea_improves_fasting',
    'diarrhoea_mucus', 'diarrhoea_fever', 'diarrhoea_travel_related', 'diarrhoea_antibiotics_related',
    'diarrhoea_flushing', 'diarrhoea_perianal', 'diarrhoea_oral_ulcers', 'diarrhoea_arthritis',
    'diarrhoea_rash', 'diarrhoea_weight_loss', 'diarrhoea_dehydration',
    'dysphagia_heartburn', 'dysphagia_neurological', 'dysphagia_alcohol_smoking',
    'dysphagia_caustic', 'dysphagia_medication_induced', 'odynophagia_immunocompromised',
    'gi_bleeding_liver_disease', 'gi_bleeding_known_varices', 'gi_bleeding_known_aaa',
    'gi_bleeding_prior_gi_bleed', 'gi_bleeding_iron_deficiency',
    'nsaid_use', 'anticoagulant_use', 'alcohol_use', 'known_cancer',
    'constipation_manual_maneuvers', 'constipation_rectal_bleeding', 'constipation_tenesmus',
    'constipation_mucus', 'constipation_neurological', 'constipation_endocrine',
    'constipation_medication_related', 'constipation_abdominal_distension',
    'constipation_weight_loss', 'constipation_vomiting', 'constipation_dietary_fiber',
    'constipation_fluid_intake'];
  const risk = ['prior_abdominal_surgery', 'smoking', 'alcohol_use', 'nsaid_use', 'steroid_use',
    'known_gallstones', 'diabetes', 'htn_cad', 'anticoagulant_use', 'previous_similar_episodes',
    'pregnancy_status', 'last_menstrual_period', 'recent_travel', 'family_history_gi_cancer',
    'ivdu', 'hiv_status', 'occupation'];
  const exam = ['guarding', 'rigidity'];

  if (triage.includes(featureId)) return 'triage';
  if (evolution.includes(featureId)) return 'characterization';
  if (confirmation.includes(featureId)) return 'confirmation';
  if (risk.includes(featureId)) return 'risk_factor';
  if (exam.includes(featureId)) return 'examination';
  return 'output';
}
