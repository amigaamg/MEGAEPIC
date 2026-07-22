// ── HPIRulesEngine — Main Entry Point ───────────────────────────
// Orchestrates all sub-engines: timeline, differential coverage,
// question selection, completeness, and documentation.
//
// RULE H0: The HPI is one evolving story, not separate questionnaires.
// RULE H25: The engine stops only when all criteria are met.
// RULE: Information-gap-driven: identify what's missing, ask the
//        single most valuable question, update, repeat.

import type {
  HpiState, HpiEngineOutput, Question, EncounterContext,
  SymptomInstance, SymptomCategory, TimelineEvent,
} from './types';
import {
  buildTimeline, sortSymptomsByOnset, isTimelineComplete,
} from './timeline-engine';
import type { TimelineEntry } from './timeline-engine';
import {
  generateInitialDifferentials,
  buildCoverage,
  CORE_DIFFERENTIAL_KNOWLEDGE,
} from './differential-coverage';
import {
  getTemplate,
  generateQuestionsForSymptom,
  findHighestValueQuestion,
  recordAnswer,
  getAllUnansweredQuestions,
  removeResolvedQuestions,
} from './question-engine';
import { evaluateCompleteness, canProceedToNextStage } from './completeness-engine';
import { generateFullNarrative, generateStructuredSummary } from './documentation-engine';

// ── Stage Transitions ───────────────────────────────────────────
const STAGE_ORDER: HpiState['status'][] = [
  'not_started',
  'primary_expansion',
  'associated_discovery',
  'associated_expansion',
  'differential_coverage',
  'risk_factor_exploration',
  'care_before_presentation',
  'impact_exploration',
  'current_status',
  'complete',
];

function nextStage(current: HpiState['status']): HpiState['status'] | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

// ── UUID Generator ──────────────────────────────────────────────
function generateId(): string {
  return `sym_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Create a new HPI Engine ─────────────────────────────────────
export function createHpiEngine(encounterId: string, context?: EncounterContext): HpiState {
  return {
    encounterId,
    status: 'not_started',
    symptoms: [],
    primarySymptomId: '',
    questions: [],
    currentQuestionIndex: 0,
    askedQuestionIds: new Set(),
    differentials: [],
    coverage: [],
    timeline: [],
    sharedData: {},
    riskFactors: {},
    careBeforePresentation: {},
    impactOnLife: {},
    currentStatus: {} as any,
    completeness: {},
    missingMandatory: [],
    unresolvedAlerts: [],
    narrative: '',
    lastUpdated: Date.now(),
  };
}

// ── Add a chief complaint (entry point) ────────────────────────
// RULE H1: Expand primary complaint first.
// RULE H2: Primary must reach completion before moving to secondary.
export function addChiefComplaint(
  state: HpiState,
  category: SymptomCategory,
  label: string,
  verbatim: string,
  isPrimary: boolean,
  firstAppearanceDay: number,
): HpiState {
  const symptom: SymptomInstance = {
    id: generateId(),
    category,
    label,
    verbatim,
    isPrimary,
    coreData: {},
    timeline: [],
    explorationComplete: false,
    metadata: {
      firstAppearanceDay,
      explorationStartedAt: Date.now(),
    },
  };

  state.symptoms.push(symptom);

  if (isPrimary) {
    state.primarySymptomId = symptom.id;
    state.status = 'primary_expansion';
    state.currentSymptomId = symptom.id;

    // Generate initial questions for primary symptom
    const initialQuestions = generateQuestionsForSymptom(symptom, state, state.differentials);
    state.questions.push(...initialQuestions);
  }

  state.lastUpdated = Date.now();

  // Generate initial differentials
  state.differentials = generateInitialDifferentials(state.symptoms);
  state.coverage = buildCoverage(state.symptoms, state.differentials.filter(d => d.isActive).map(d => d.id));

  return state;
}

// ── Add an associated symptom ──────────────────────────────────
// RULE H4: After completing primary, discover associated symptoms.
// RULE H5: Every associated symptom becomes a child symptom.
export function addAssociatedSymptom(
  state: HpiState,
  category: SymptomCategory,
  label: string,
  verbatim: string,
  parentSymptomId?: string,
  relationshipToParent?: 'before' | 'after' | 'same_time' | 'unknown',
  firstAppearanceDay?: number,
): HpiState {
  const parent = parentSymptomId
    ? state.symptoms.find(s => s.id === parentSymptomId)
    : state.symptoms.find(s => s.isPrimary);

  const symptom: SymptomInstance = {
    id: generateId(),
    category,
    label,
    verbatim,
    isPrimary: false,
    parentSymptomId: parent?.id,
    relationshipToParent: relationshipToParent || 'after',
    coreData: {},
    timeline: [],
    explorationComplete: false,
    metadata: {
      firstAppearanceDay: firstAppearanceDay ?? (parent ? parent.metadata.firstAppearanceDay + 1 : 1),
    },
  };

  state.symptoms.push(symptom);
  state.currentSymptomId = symptom.id;

  // RULE H5: Each child symptom receives its own exploration
  // BUT only unanswered information (handled by question engine)
  const initialQuestions = generateQuestionsForSymptom(symptom, state, state.differentials);
  state.questions.push(...initialQuestions);

  state.status = 'associated_expansion';
  state.lastUpdated = Date.now();

  // Update differentials
  state.differentials = generateInitialDifferentials(state.symptoms);
  state.coverage = buildCoverage(state.symptoms, state.differentials.filter(d => d.isActive).map(d => d.id));

  return state;
}

// ── Record an answer and advance ───────────────────────────────
// RULE: Information-gap-driven — after recording, find the next gap.
export function recordAnswerAndAdvance(
  state: HpiState,
  questionId: string,
  answer: any,
): HpiEngineOutput {
  recordAnswer(state, questionId, answer);

  // Check if current symptom is complete
  const symptom = state.symptoms.find(s => s.id === state.currentSymptomId);
  if (symptom) {
    const template = getTemplate(symptom.category);
    const mandatoryFields = template.coreFields.filter(f => f.mandatory);
    const allMandatoryAnswered = mandatoryFields.every(f =>
      symptom.coreData[f.id] !== undefined && symptom.coreData[f.id] !== null && symptom.coreData[f.id] !== ''
    );
    if (allMandatoryAnswered) {
      symptom.explorationComplete = true;
      symptom.metadata.explorationCompletedAt = Date.now();
    }
  }

  // Remove resolved questions
  state.questions = removeResolvedQuestions(state.questions, state.differentials);

  // Update differentials
  state.differentials = generateInitialDifferentials(state.symptoms);
  state.coverage = buildCoverage(state.symptoms, state.differentials.filter(d => d.isActive).map(d => d.id));

  // Advance stage if applicable
  advanceStageIfReady(state);

  // Get next question
  const nextQuestion = findHighestValueQuestion(
    state.symptoms,
    state.differentials,
    state.askedQuestionIds,
  );

  // Generate narrative
  state.narrative = generateFullNarrative(state);
  state.lastUpdated = Date.now();

  // Evaluate completeness
  const completeness = evaluateCompleteness(state);

  return {
    state,
    nextQuestion: nextQuestion
      ? {
          id: nextQuestion.question.id,
          symptomId: nextQuestion.symptomId,
          fieldId: nextQuestion.field.id,
          text: nextQuestion.question.text,
          type: nextQuestion.question.type,
          options: nextQuestion.question.options,
          purpose: nextQuestion.question.purpose,
          priority: 0,
          ddRelevance: nextQuestion.field.ddRelevance || [],
          safetyRelevance: nextQuestion.field.safetyRelevance || [],
          triggerConditions: [],
          skipIfKnown: [],
          answered: false,
          skipped: false,
        }
      : undefined,
    questionsRemaining: getAllUnansweredQuestions(state).length,
    completeness,
    narrative: state.narrative,
    timeline: entriesToEvents(buildTimeline(state.symptoms, state.sharedData)),
    activeDifferentials: state.differentials.filter(d => d.isActive && !d.isExcluded),
  };
}

// ── Advance stage automatically when ready ─────────────────────
function advanceStageIfReady(state: HpiState): void {
  if (state.status === 'not_started') return;

  // Check if we can move from primary_expansion
  if (state.status === 'primary_expansion') {
    const primary = state.symptoms.find(s => s.id === state.primarySymptomId);
    if (primary && primary.explorationComplete) {
      state.status = 'associated_discovery';
    }
    return;
  }

  // Check if we can move from associated_discovery
  if (state.status === 'associated_discovery') {
    // Stay here until user explicitly moves on
    return;
  }

  // For all other stages, check completeness
  if (canProceedToNextStage(state)) {
    const next = nextStage(state.status);
    if (next) {
      state.status = next;
    }
  }
}

// ── Manually advance to next stage ─────────────────────────────
export function advanceStage(state: HpiState): HpiEngineOutput {
  const next = nextStage(state.status);
  if (!next) {
    return getEngineOutput(state);
  }

  state.status = next;
  state.lastUpdated = Date.now();

  // When entering associated_discovery, generate questions about associated symptoms
  if (next === 'associated_discovery' || next === 'associated_expansion') {
    // Refresh questions for associated symptoms
    const nonPrimary = state.symptoms.filter(s => !s.isPrimary);
    for (const symptom of nonPrimary) {
      const newQuestions = generateQuestionsForSymptom(symptom, state, state.differentials);
      state.questions.push(...newQuestions);
    }
  }

  // Update differentially when entering differential_coverage
  if (next === 'differential_coverage') {
    state.differentials = generateInitialDifferentials(state.symptoms);
    state.coverage = buildCoverage(state.symptoms, state.differentials.filter(d => d.isActive).map(d => d.id));
  }

  return getEngineOutput(state);
}

// ── Get current engine state output ────────────────────────────
export function getEngineOutput(state: HpiState): HpiEngineOutput {
  const nextQuestion = findHighestValueQuestion(
    state.symptoms,
    state.differentials,
    state.askedQuestionIds,
  );

  const completeness = evaluateCompleteness(state);
  const narrative = generateFullNarrative(state);

  return {
    state,
    nextQuestion: nextQuestion
      ? {
          id: nextQuestion.question.id,
          symptomId: nextQuestion.symptomId,
          fieldId: nextQuestion.field.id,
          text: nextQuestion.question.text,
          type: nextQuestion.question.type,
          options: nextQuestion.question.options,
          purpose: nextQuestion.question.purpose,
          priority: 0,
          ddRelevance: nextQuestion.field.ddRelevance || [],
          safetyRelevance: nextQuestion.field.safetyRelevance || [],
          triggerConditions: [],
          skipIfKnown: [],
          answered: false,
          skipped: false,
        }
      : undefined,
    questionsRemaining: getAllUnansweredQuestions(state).length,
    completeness,
    narrative,
    timeline: entriesToEvents(buildTimeline(state.symptoms, state.sharedData)),
    activeDifferentials: state.differentials.filter(d => d.isActive && !d.isExcluded),
  };
}

// ── Get structured summary for UI ──────────────────────────────
// ── Helper: convert TimelineEntry to TimelineEvent ──────────────
function entriesToEvents(entries: TimelineEntry[]): TimelineEvent[] {
  return entries.map(e => ({
    id: e.id,
    symptomId: e.symptomId || '',
    label: e.label,
    relativeDay: e.relativeDay,
    detail: e.detail,
  }));
}

export { generateStructuredSummary } from './documentation-engine';
export { evaluateCompleteness, canProceedToNextStage, getMissingMandatorySummary } from './completeness-engine';
export { buildTimeline, getTimelineSummary } from './timeline-engine';
export { generateInitialDifferentials, buildCoverage, CORE_DIFFERENTIAL_KNOWLEDGE } from './differential-coverage';
export { getTemplate, getAllUnansweredQuestions } from './question-engine';
export { generateFullNarrative } from './documentation-engine';

// ── Types ──────────────────────────────────────────────────────
export type {
  HpiState, HpiEngineOutput, Question, SymptomInstance,
  SymptomCategory, EncounterContext, DifferentialDiagnosis,
  DifferentialCoverage, RuleEvaluation, RuleEngineResult,
  TimelineEvent,
} from './types';
export type { TimelineEntry } from './timeline-engine';
export type { DiagnosisKnowledge } from './differential-coverage';
