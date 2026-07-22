import { QuestionCard, QuestionGroup, Answer, EncounterPhase, ModuleType, AgeGroup, Confidence } from '../types/ces';
import { QUESTION_GROUPS } from '../rules/questionGroups';

export interface GroupInfo {
  id: string;
  label: string;
}

export interface QuestionEngineState {
  answers: Record<string, Answer>;
  currentPhase: EncounterPhase;
  activeModules: ModuleType[];
  ageGroup: AgeGroup;
  answeredQuestions: Set<string>;
  visibleCards: QuestionCard[];
  currentCardIndex: number;
  currentGroup: GroupInfo | null;
  previousGroup: GroupInfo | null;
}

export function getCurrentGroup(state: QuestionEngineState): GroupInfo | null {
  return state.currentGroup;
}

export function didGroupChange(state: QuestionEngineState): boolean {
  if (!state.currentGroup && !state.previousGroup) return false;
  if (!state.currentGroup || !state.previousGroup) return true;
  return state.currentGroup.id !== state.previousGroup.id;
}

function resolveGroup(card: QuestionCard | null): GroupInfo | null {
  if (!card) return null;
  const groupId = card.group || card.id;
  const groupLabel = card.groupLabel || '';
  return { id: groupId, label: groupLabel };
}

export function createQuestionEngine(
  initialAnswers: Record<string, Answer> = {},
  currentPhase: EncounterPhase = 'registration',
  activeModules: ModuleType[] = [],
  complaints: string[] = [],
  ageGroup: AgeGroup = 'adult',
  sex?: string,
  pregnant?: boolean
): QuestionEngineState {
  const visibleCards = getVisibleCards(currentPhase, activeModules, initialAnswers, [], complaints, ageGroup, sex, pregnant);
  const firstCard = visibleCards[0] || null;
  return {
    answers: initialAnswers,
    currentPhase,
    activeModules,
    ageGroup,
    answeredQuestions: new Set(Object.keys(initialAnswers)),
    visibleCards,
    currentCardIndex: 0,
    currentGroup: resolveGroup(firstCard),
    previousGroup: null,
  };
}

function evaluateDependsOn(
  card: QuestionCard,
  answers: Record<string, Answer>,
  alreadyAsked: string[]
): boolean {
  if (!card.dependsOn) return true;

  const answer = answers[card.dependsOn.questionId];
  if (!answer && !alreadyAsked.includes(card.dependsOn.questionId)) return false;

  const expected = card.dependsOn.value;
  const actual = answer?.value;

  if (typeof expected === 'boolean') {
    return actual === expected;
  }
  if (Array.isArray(actual)) {
    return (actual as string[]).includes(expected as string);
  }
  return String(actual) === String(expected);
}

function evaluateCqae(
  card: QuestionCard,
  activeModules: ModuleType[],
  ageGroup?: AgeGroup,
  sex?: string,
  pregnant?: boolean
): boolean {
  // Legacy contextCondition
  if (card.contextCondition) {
    const isActive = activeModules.includes(card.contextCondition.module);
    if (card.contextCondition.active ? !isActive : isActive) return false;
  }

  // New CQAE rule
  if (card.cqae) {
    if (card.cqae.ageGroups && ageGroup) {
      if (!card.cqae.ageGroups.includes(ageGroup)) return false;
    }
    if (card.cqae.sex && sex) {
      if (card.cqae.sex !== sex) return false;
    }
    if (card.cqae.pregnant !== undefined) {
      if (card.cqae.pregnant !== pregnant) return false;
    }
    if (card.cqae.module) {
      const isActive = activeModules.includes(card.cqae.module.module);
      if (card.cqae.module.active ? !isActive : isActive) return false;
    }
  }
  return true;
}

function evaluateGroupCondition(
  group: QuestionGroup,
  activeModules: ModuleType[],
  answers: Record<string, Answer>,
  complaints: string[],
  ageGroup?: AgeGroup
): boolean {
  if (!group.condition) return true;

  if (group.condition.module) {
    if (!activeModules.includes(group.condition.module)) return false;
  }
  if (group.condition.complaint) {
    if (!complaints.some(c => c.toLowerCase().includes(group.condition!.complaint!.toLowerCase()))) return false;
  }
  if (group.condition.ageGroups && ageGroup) {
    if (!group.condition.ageGroups.includes(ageGroup)) return false;
  }
  if (group.condition.factKey) {
    const answer = answers[group.condition.factKey];
    if (!answer) return false;
    if (group.condition.value !== undefined) {
      if (Array.isArray(answer.value)) {
        return (answer.value as string[]).includes(group.condition.value);
      }
      return String(answer.value) === String(group.condition.value);
    }
  }
  return true;
}

const BODY_SYSTEM_KEYWORDS: Record<string, string[]> = {
  cardiovascular: ['chest', 'palpitation', 'heart', 'cardiac', 'cv', 'hypertension', 'hypotension'],
  respiratory: ['cough', 'sob', 'breath', 'dyspnea', 'wheeze', 'hemoptysis', 'respiratory', 'lung', 'asthma', 'copd'],
  abdomen: ['abdominal', 'pain', 'nausea', 'vomit', 'diarrhea', 'constipation', 'gi', 'gastric', 'appetite', 'dysphagia', 'heartburn', 'bloating', 'rectal', 'hernia'],
  neurological: ['headache', 'dizziness', 'seizure', 'stroke', 'neuro', 'paralysis', 'numbness', 'tingling', 'syncope', 'vertigo', 'tremor'],
  musculoskeletal: ['joint', 'muscle', 'back', 'neck', 'shoulder', 'knee', 'hip', 'fracture', 'trauma', 'fall', 'pain'],
  genitourinary: ['urine', 'dysuria', 'frequency', 'urgency', 'vaginal', 'penile', 'testicular', 'gu', 'uti', 'kidney', 'renal', 'flank'],
};

function systemRelevance(system: string, complaints: string[]): number {
  const keywords = BODY_SYSTEM_KEYWORDS[system];
  if (!keywords || complaints.length === 0) return 0;
  let score = 0;
  for (const cc of complaints) {
    const lower = cc.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) { score += 10; break; }
    }
  }
  return score;
}

const SYSTEM_FOR_GROUP: Record<string, string> = {
  exam_abdomen_inspection: 'abdomen',
  exam_abdomen_auscultation: 'abdomen',
  exam_abdomen_percussion: 'abdomen',
  exam_abdomen_palpation_superficial: 'abdomen',
  exam_abdomen_palpation_deep: 'abdomen',
  exam_abdomen_special_tests: 'abdomen',
  exam_rectal: 'abdomen',
  exam_hernia: 'abdomen',
  exam_cvs_general: 'cardiovascular',
  exam_cvs_auscultation: 'cardiovascular',
  exam_resp_general: 'respiratory',
  exam_resp_percussion: 'respiratory',
  exam_resp_auscultation: 'respiratory',
  exam_neuro_cranial: 'neurological',
  exam_neuro_motor: 'neurological',
  exam_neuro_sensory: 'neurological',
  exam_neuro_reflexes: 'neurological',
  exam_msk_upper: 'musculoskeletal',
  exam_msk_lower: 'musculoskeletal',
  exam_msk_spine: 'musculoskeletal',
  exam_gu_male: 'genitourinary',
  exam_gu_female: 'genitourinary',
  exam_renal: 'genitourinary',
};

export function getVisibleCards(
  phase: EncounterPhase,
  activeModules: ModuleType[],
  answers: Record<string, Answer>,
  alreadyAsked: string[],
  complaints: string[] = [],
  ageGroup?: AgeGroup,
  sex?: string,
  pregnant?: boolean
): QuestionCard[] {
  const cards: QuestionCard[] = [];

  const phaseGroups = Object.values(QUESTION_GROUPS).filter(g => g.phase === phase);

  // For systemic_exam phase, sort groups by relevance to chief complaints (Hutchison: most affected system first)
  let sortedGroups = phaseGroups;
  if (phase === 'systemic_exam') {
    sortedGroups = [...phaseGroups].sort((a, b) => {
      const relA = systemRelevance(SYSTEM_FOR_GROUP[a.id] || '', complaints);
      const relB = systemRelevance(SYSTEM_FOR_GROUP[b.id] || '', complaints);
      if (relA !== relB) return relB - relA;
      return 0;
    });
  }

  for (const group of sortedGroups) {
    if (!evaluateGroupCondition(group, activeModules, answers, complaints, ageGroup)) continue;
    for (const card of group.cards) {
      if (!evaluateDependsOn(card, answers, alreadyAsked)) continue;
      if (!evaluateCqae(card, activeModules, ageGroup, sex, pregnant)) continue;
      cards.push(card);
    }
  }

  return cards;
}

export function answerQuestion(
  state: QuestionEngineState,
  cardId: string,
  value: string | number | boolean | string[],
  complaints: string[] = [],
  ageGroup?: AgeGroup,
  sex?: string,
  pregnant?: boolean
): QuestionEngineState {
  const newAnswers = {
    ...state.answers,
    [cardId]: {
      questionId: cardId,
      value,
      confidence: 'clinician_observed' as Confidence,
      timestamp: Date.now(),
    },
  };

  const newAnswered = new Set(state.answeredQuestions);
  newAnswered.add(cardId);

  const newCards = getVisibleCards(
    state.currentPhase,
    state.activeModules,
    newAnswers,
    Array.from(newAnswered),
    complaints,
    ageGroup || state.ageGroup,
    sex,
    pregnant
  );

  const currentIdx = newCards.findIndex(c => c.id === cardId);
  const nextIdx = currentIdx >= 0 ? Math.min(currentIdx + 1, newCards.length - 1) : state.currentCardIndex;
  const nextCard = newCards[nextIdx] || null;

  const previousGroup = state.currentGroup;
  const newGroup = resolveGroup(nextCard);

  return {
    ...state,
    answers: newAnswers,
    answeredQuestions: newAnswered,
    visibleCards: newCards,
    currentCardIndex: nextIdx,
    currentGroup: newGroup,
    previousGroup,
  };
}

export function setPhase(
  state: QuestionEngineState,
  phase: EncounterPhase,
  complaints: string[] = [],
  ageGroup?: AgeGroup,
  sex?: string,
  pregnant?: boolean
): QuestionEngineState {
  const newCards = getVisibleCards(
    phase,
    state.activeModules,
    state.answers,
    Array.from(state.answeredQuestions),
    complaints,
    ageGroup || state.ageGroup,
    sex,
    pregnant
  );

  const firstCard = newCards[0] || null;

  return {
    ...state,
    currentPhase: phase,
    visibleCards: newCards,
    currentCardIndex: 0,
    currentGroup: resolveGroup(firstCard),
    previousGroup: state.currentGroup,
  };
}

export function setActiveModules(
  state: QuestionEngineState,
  modules: ModuleType[],
  ageGroup?: AgeGroup,
  sex?: string,
  pregnant?: boolean
): QuestionEngineState {
  const newCards = getVisibleCards(
    state.currentPhase,
    modules,
    state.answers,
    Array.from(state.answeredQuestions),
    [],
    ageGroup || state.ageGroup,
    sex,
    pregnant
  );

  return {
    ...state,
    activeModules: modules,
    visibleCards: newCards,
    currentCardIndex: 0,
  };
}

export function getCurrentCard(state: QuestionEngineState): QuestionCard | null {
  if (state.visibleCards.length === 0) return null;
  return state.visibleCards[state.currentCardIndex] || null;
}

export function getProgress(state: QuestionEngineState): { total: number; answered: number; percent: number } {
  const total = state.visibleCards.length;
  const answered = state.visibleCards.filter(c => state.answeredQuestions.has(c.id)).length;
  return { total, answered, percent: total > 0 ? Math.round((answered / total) * 100) : 0 };
}
