// ── Question Engine ─────────────────────────────────────────────
// RULES:
// H17 — Never ask questions unrelated to active differential set.
// H18 — Never repeat answered questions.
// H19 — Ask the question that removes the greatest uncertainty first.
// H20 — Remove questions once enough evidence gathered.
// H21 — Every differential complication must be screened.
// H22 — Every differential risk factor must be explored.
// H23 — Rule-in/rule-out questions get highest priority.
// H24 — Shared data: never ask information already known from another symptom.

import type {
  SymptomInstance, Question, ExplorationField, ExplorationTemplate,
  DifferentialDiagnosis, HpiState, SymptomCategory,
} from './types';
import {
  PAIN_TEMPLATE, VOMITING_TEMPLATE, FEVER_TEMPLATE,
  DISTENSION_TEMPLATE, CONSTIPATION_TEMPLATE, COUGH_TEMPLATE,
  BLEEDING_TEMPLATE, DYSPNEA_TEMPLATE, DIARRHEA_TEMPLATE,
  NEUROLOGICAL_TEMPLATE, URINARY_TEMPLATE, WEAKNESS_TEMPLATE,
  SKIN_TEMPLATE, CARDIOVASCULAR_TEMPLATE, PSYCHOLOGICAL_TEMPLATE,
  CONSTITUTIONAL_TEMPLATE,
} from './exploration-templates/index';
import { CORE_DIFFERENTIAL_KNOWLEDGE } from './differential-coverage';

// ── Template Registry ──────────────────────────────────────────
const TEMPLATE_REGISTRY: Record<string, ExplorationTemplate> = {
  pain: PAIN_TEMPLATE as ExplorationTemplate,
  vomiting: VOMITING_TEMPLATE as ExplorationTemplate,
  fever: FEVER_TEMPLATE as ExplorationTemplate,
  distension: DISTENSION_TEMPLATE as ExplorationTemplate,
  constipation: CONSTIPATION_TEMPLATE as ExplorationTemplate,
  cough: COUGH_TEMPLATE as ExplorationTemplate,
  bleeding: BLEEDING_TEMPLATE as ExplorationTemplate,
  dyspnea: DYSPNEA_TEMPLATE as ExplorationTemplate,
  diarrhea: DIARRHEA_TEMPLATE as ExplorationTemplate,
  neurological: NEUROLOGICAL_TEMPLATE as ExplorationTemplate,
  urinary: URINARY_TEMPLATE as ExplorationTemplate,
  weakness: WEAKNESS_TEMPLATE as ExplorationTemplate,
  skin: SKIN_TEMPLATE as ExplorationTemplate,
  cardiac: CARDIOVASCULAR_TEMPLATE as ExplorationTemplate,
  psychological: PSYCHOLOGICAL_TEMPLATE as ExplorationTemplate,
  constitutional: CONSTITUTIONAL_TEMPLATE as ExplorationTemplate,
  trauma: {
    symptomCategory: 'trauma' as const,
    name: 'Trauma Exploration',
    coreFields: [
      { id: 'trauma_mechanism', label: 'Mechanism of injury', type: 'text' as const, mandatory: true, purpose: 'Determines injury pattern' },
      { id: 'trauma_time', label: 'Time of injury', type: 'text' as const, mandatory: true, purpose: 'Timeline' },
      { id: 'trauma_loss_consciousness', label: 'Loss of consciousness?', type: 'boolean' as const, mandatory: true, purpose: 'Head injury assessment', safetyRelevance: ['head_injury'] },
    ],
    associatedSymptomPrompt: 'Any other symptoms related to the injury?',
    associatedSymptomOptions: [
      { category: 'bleeding' as const, label: 'Bleeding' },
      { category: 'pain' as const, label: 'Pain' },
      { category: 'neurological' as const, label: 'Neurological symptoms' },
    ],
    completionCriteria: ['Mechanism recorded', 'Time recorded', 'LOC screened'],
  },
  endocrine: {
    symptomCategory: 'endocrine' as const,
    name: 'Endocrine Symptom Exploration',
    coreFields: [
      { id: 'endocrine_type', label: 'Type of symptom', type: 'multi_select' as const, options: ['increased_thirst', 'increased_urination', 'weight_change', 'heat_intolerance', 'cold_intolerance', 'hair_changes', 'skin_changes'], mandatory: true, purpose: 'Identifies endocrine system involvement' },
    ],
    associatedSymptomPrompt: 'Any other symptoms?',
    associatedSymptomOptions: [],
    completionCriteria: ['Type recorded'],
  },
  other: {
    symptomCategory: 'other' as const,
    name: 'Other Symptom Exploration',
    coreFields: [
      { id: 'other_description', label: 'Describe the symptom', type: 'text' as const, mandatory: true, purpose: 'Free text capture' },
      { id: 'other_duration', label: 'Duration', type: 'text' as const, mandatory: true, purpose: 'Timeline' },
    ],
    associatedSymptomPrompt: 'Any other symptoms?',
    associatedSymptomOptions: [],
    completionCriteria: ['Description recorded', 'Duration recorded'],
  },
};

// ── RULE H24: Shared data — skip if already known ──────────────
function shouldSkipField(
  field: ExplorationField,
  symptom: SymptomInstance,
  state: HpiState,
): boolean {
  if (!field.skipIfKnown || field.skipIfKnown.length === 0) return false;

  for (const knownFieldId of field.skipIfKnown) {
    for (const otherSymptom of state.symptoms) {
      const val = otherSymptom.coreData[knownFieldId];
      if (val !== undefined && val !== null && val !== '' && val !== false) {
        return true;
      }
    }
  }
  return false;
}

// ── RULE: Check trigger conditions ─────────────────────────────
function checkTriggerConditions(
  field: ExplorationField,
  state: HpiState,
): boolean {
  if (!field.triggerConditions || field.triggerConditions.length === 0) return true;

  for (const condition of field.triggerConditions) {
    const [condField, condValue] = condition.split('=');
    let matched = false;

    for (const symptom of state.symptoms) {
      const val = symptom.coreData[condField];
      if (String(val) === condValue) { matched = true; break; }
    }

    if (!matched) return false;
  }

  return true;
}

// ── RULE H19: Calculate question priority ──────────────────────
function calculatePriority(
  field: ExplorationField,
  differentials: DifferentialDiagnosis[],
): number {
  let priority = 0;

  // Mandatory fields get base priority
  if (field.mandatory) priority += 50;

  // Safety-relevant fields get high priority
  if (field.safetyRelevance && field.safetyRelevance.length > 0) priority += 40;

  // DD-relevant fields get priority based on how many active differentials they inform
  if (field.ddRelevance && field.ddRelevance.length > 0) {
    for (const dx of differentials) {
      if (!dx.isActive || dx.isExcluded) continue;
      const matches = field.ddRelevance.some(d => dx.id.includes(d) || dx.name.toLowerCase().includes(d));
      if (matches) priority += 10;
    }
  }

  // Rule-in/rule-out fields for high-probability (>=40%) or dangerous diagnoses get highest priority
  for (const dx of differentials) {
    if (!dx.isActive || dx.isExcluded) continue;
    const knowledge = CORE_DIFFERENTIAL_KNOWLEDGE[dx.id];
    if (!knowledge) continue;

    // Check if this field is a rule-in field for this diagnosis
    if (knowledge.ruleInFields.some(rf => rf.startsWith(field.id))) {
      priority += 30;
    }
    // Check if this field is a rule-out field
    if (knowledge.ruleOutFields.some(rf => rf.startsWith(field.id))) {
      priority += 25;
    }
    // High-probability diagnosis questions
    if (dx.probability > 40 && field.ddRelevance?.some(d => dx.id.includes(d))) {
      priority += 15;
    }
  }

  return priority;
}

// ── RULE H21: Generate complication screening questions ────────
function generateComplicationQuestions(
  symptom: SymptomInstance,
  differentials: DifferentialDiagnosis[],
  askedIds: Set<string>,
): Question[] {
  const questions: Question[] = [];
  const seenComplications = new Set<string>();

  for (const dx of differentials) {
    if (!dx.isActive || dx.isExcluded) continue;
    const knowledge = CORE_DIFFERENTIAL_KNOWLEDGE[dx.id];
    if (!knowledge) continue;

    for (const complication of knowledge.complications) {
      if (seenComplications.has(complication)) continue;
      seenComplications.add(complication);

      const fieldId = `${symptom.category}_complication_${complication}`;
      if (askedIds.has(fieldId)) continue;

      questions.push({
        id: `${symptom.id}.complication.${complication}`,
        symptomId: symptom.id,
        fieldId,
        text: `Any evidence of ${complication.replace(/_/g, ' ')}? (complication of ${dx.name})`,
        type: 'boolean',
        purpose: `Screens for ${complication.replace(/_/g, ' ')} — a complication of ${dx.name}`,
        priority: 35,  // High — safety critical
        ddRelevance: [dx.id],
        safetyRelevance: [complication],
        triggerConditions: [],
        skipIfKnown: [],
        answered: false,
        skipped: false,
      });
    }
  }

  return questions;
}

// ── RULE H22: Generate risk factor questions ───────────────────
function generateRiskFactorQuestions(
  symptom: SymptomInstance,
  differentials: DifferentialDiagnosis[],
  askedIds: Set<string>,
): Question[] {
  const questions: Question[] = [];
  const seenRFs = new Set<string>();

  for (const dx of differentials) {
    if (!dx.isActive || dx.isExcluded) continue;
    const knowledge = CORE_DIFFERENTIAL_KNOWLEDGE[dx.id];
    if (!knowledge) continue;

    for (const rf of knowledge.riskFactors) {
      if (seenRFs.has(rf)) continue;
      seenRFs.add(rf);

      const fieldId = `risk_${rf}`;
      if (askedIds.has(fieldId)) continue;

      questions.push({
        id: `${symptom.id}.risk.${rf}`,
        symptomId: symptom.id,
        fieldId,
        text: `Risk factor: ${rf.replace(/_/g, ' ')}?`,
        type: 'boolean',
        purpose: `Assesses ${rf.replace(/_/g, ' ')} as risk factor for ${dx.name}`,
        priority: 20,
        ddRelevance: [dx.id],
        safetyRelevance: [],
        triggerConditions: [],
        skipIfKnown: [],
        answered: false,
        skipped: false,
      });
    }
  }

  return questions;
}

// ── Get template for a symptom category ────────────────────────
export function getTemplate(category: string): ExplorationTemplate {
  return TEMPLATE_REGISTRY[category] || TEMPLATE_REGISTRY.other;
}

// ── RULE: Generate questions for a symptom ─────────────────────
export function generateQuestionsForSymptom(
  symptom: SymptomInstance,
  state: HpiState,
  differentials: DifferentialDiagnosis[],
): Question[] {
  const template = getTemplate(symptom.category);
  const questions: Question[] = [];

  // 1. Core symptom exploration fields
  for (const field of template.coreFields) {
    // RULE H18: Never repeat answered questions
    if (state.askedQuestionIds.has(field.id)) continue;

    // RULE: Check if this symptom already has data for this field
    if (symptom.coreData[field.id] !== undefined && symptom.coreData[field.id] !== null && symptom.coreData[field.id] !== '') {
      state.askedQuestionIds.add(field.id);
      continue;
    }

    // RULE H24: Skip if known from another symptom
    if (shouldSkipField(field, symptom, state)) continue;

    // RULE: Check trigger conditions
    if (!checkTriggerConditions(field, state)) continue;

    // RULE H17: Only ask questions relevant to active differentials
    const isRelevant = differentials.length === 0 ||
      template.coreFields.length <= 3 ||
      field.mandatory ||
      (field.safetyRelevance && field.safetyRelevance.length > 0) ||
      (field.ddRelevance && field.ddRelevance.length > 0 && differentials.some(dx =>
        dx.isActive && !dx.isExcluded && field.ddRelevance!.some(d => dx.id.includes(d) || dx.name.toLowerCase().includes(d))
      ));

    if (!isRelevant) continue;

    const priority = calculatePriority(field, differentials);

    questions.push({
      id: `${symptom.id}.${field.id}`,
      symptomId: symptom.id,
      fieldId: field.id,
      text: field.label,
      type: field.type,
      options: field.options,
      purpose: field.purpose,
      priority,
      ddRelevance: field.ddRelevance || [],
      safetyRelevance: field.safetyRelevance || [],
      triggerConditions: field.triggerConditions || [],
      skipIfKnown: field.skipIfKnown || [],
      answered: false,
      skipped: false,
    });
  }

  // 2. Complication screening questions (RULE H21)
  if (differentials.length > 0) {
    const compQuestions = generateComplicationQuestions(symptom, differentials, state.askedQuestionIds);
    questions.push(...compQuestions);
  }

  // 3. Risk factor questions (RULE H22)
  if (differentials.length > 0) {
    const rfQuestions = generateRiskFactorQuestions(symptom, differentials, state.askedQuestionIds);
    questions.push(...rfQuestions);
  }

  questions.sort((a, b) => b.priority - a.priority);

  return questions;
}

// ── RULE H18: Get all unanswered questions ─────────────────────
export function getAllUnansweredQuestions(state: HpiState): Question[] {
  return state.questions.filter(q => !q.answered && !q.skipped);
}

// ── RULE H19: Get next question (highest priority) ─────────────
export function getNextQuestion(state: HpiState): Question | undefined {
  const unanswered = getAllUnansweredQuestions(state);
  if (unanswered.length === 0) return undefined;
  unanswered.sort((a, b) => b.priority - a.priority);
  return unanswered[0];
}

// ── RULE H19: Information-gap-driven highest-value question ────
export function findHighestValueQuestion(
  symptoms: SymptomInstance[],
  differentials: DifferentialDiagnosis[],
  askedIds: Set<string>,
): { question: Question; symptomId: string; field: ExplorationField } | null {
  let bestQuestion: Question | null = null;
  let bestSymptomId: string = '';
  let bestField: ExplorationField | null = null;
  let bestScore = -1;

  for (const symptom of symptoms) {
    const template = getTemplate(symptom.category);

    for (const field of template.coreFields) {
      if (askedIds.has(field.id)) continue;
      if (symptom.coreData[field.id] !== undefined && symptom.coreData[field.id] !== null && symptom.coreData[field.id] !== '') {
        askedIds.add(field.id);
        continue;
      }

      const priority = calculatePriority(field, differentials);
      let score = priority;

      // Information value: how many uncertain differentials does this inform?
      if (field.ddRelevance) {
        for (const dx of differentials) {
          if (!dx.isActive || dx.isExcluded) continue;
          const isRelevant = field.ddRelevance.some(d => dx.id.includes(d) || dx.name.toLowerCase().includes(d));
          if (isRelevant) {
            const uncertainty = dx.probability > 20 && dx.probability < 80 ? 20 : 5;
            score += uncertainty;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestQuestion = {
          id: `${symptom.id}.${field.id}`, symptomId: symptom.id, fieldId: field.id,
          text: field.label, type: field.type, options: field.options,
          purpose: field.purpose, priority,
          ddRelevance: field.ddRelevance || [],
          safetyRelevance: field.safetyRelevance || [],
          triggerConditions: field.triggerConditions || [],
          skipIfKnown: field.skipIfKnown || [],
          answered: false, skipped: false,
        };
        bestSymptomId = symptom.id;
        bestField = field;
      }
    }
  }

  if (bestQuestion) {
    return { question: bestQuestion, symptomId: bestSymptomId, field: bestField! };
  }

  return null;
}

// ── RULE H18: Record answer and update state ───────────────────
export function recordAnswer(
  state: HpiState,
  questionId: string,
  answer: any,
): void {
  const question = state.questions.find(q => q.id === questionId);
  if (!question) return;

  question.answered = true;
  question.answer = answer;
  question.answeredAt = Date.now();
  state.askedQuestionIds.add(question.fieldId);

  const symptom = state.symptoms.find(s => s.id === question.symptomId);
  if (symptom) {
    symptom.coreData[question.fieldId] = answer;
  }

  state.lastUpdated = Date.now();
}

// ── RULE: Mark question as unobtainable ────────────────────────
export function skipQuestion(state: HpiState, questionId: string, reason: string): void {
  const question = state.questions.find(q => q.id === questionId);
  if (!question) return;

  question.skipped = true;
  question.reasonSkipped = reason;
  state.askedQuestionIds.add(question.fieldId);
  state.lastUpdated = Date.now();
}

// ── RULE H20: Remove questions once enough evidence gathered ───
export function removeResolvedQuestions(
  questions: Question[],
  differentials: DifferentialDiagnosis[],
): Question[] {
  return questions.filter(q => {
    if (q.answered || q.skipped) return false;

    // Diagnosis excluded — remove its questions
    if (q.ddRelevance.length > 0) {
      for (const dx of differentials) {
        const isRelevant = q.ddRelevance.some(d => dx.id.includes(d));
        if (isRelevant && dx.isExcluded) return false;
      }
    }

    // Complication question answered — remove
    if (q.fieldId.startsWith('complication_') || q.fieldId.startsWith('risk_')) {
      return false; // Keep — re-evaluate next cycle
    }

    return true;
  });
}
