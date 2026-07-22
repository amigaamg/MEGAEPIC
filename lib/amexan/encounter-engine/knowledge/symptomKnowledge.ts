// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal Symptom Knowledge Base
// Every symptom is a canonical SymptomNode with identical structure.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  SymptomNode, StructuredFact, AssessmentContext,
  SymptomQuestion, ContextExtension, ContextCondition,
  ConstitutionalContext,
} from './symptom-types';
import { HEADACHE_NODE } from './nodes/headache';
import { COUGH_NODE } from './nodes/cough';
import { FEVER_NODE } from './nodes/fever';
import { BODY_ACHES_NODE } from './nodes/body-aches';
import { VOMITING_NODE } from './nodes/vomiting';
import { DIARRHEA_NODE } from './nodes/diarrhea';
import { ABDOMINAL_PAIN_NODE } from './nodes/abdominal-pain';
import { SHORTNESS_OF_BREATH_NODE } from './nodes/shortness-of-breath';
import { evaluateCqae } from '../engines/cqae';

// ─── (FEVER_NODE moved to ./nodes/fever) ──────────────────────────────────────

// ─── SYMPTOM REGISTRY ────────────────────────────────────────────────────────

const SYMPTOM_REGISTRY: Record<string, SymptomNode> = {
  'SX000001': FEVER_NODE,
  'SX000002': HEADACHE_NODE,
  'SX000003': BODY_ACHES_NODE,
  'SX000004': VOMITING_NODE,
  'SX000005': COUGH_NODE,
  'SX000006': DIARRHEA_NODE,
  'SX000007': ABDOMINAL_PAIN_NODE,
  'SX000008': SHORTNESS_OF_BREATH_NODE,
};

export function getSymptomNode(id: string): SymptomNode | undefined {
  return SYMPTOM_REGISTRY[id];
}

export function getSymptomNodeByName(name: string): SymptomNode | undefined {
  const lower = name.toLowerCase();
  return Object.values(SYMPTOM_REGISTRY).find(s =>
    s.identity.canonicalName.toLowerCase() === lower ||
    s.identity.synonyms.some(syn => syn.toLowerCase() === lower) ||
    s.identity.layTerms.some(term => term.toLowerCase() === lower) ||
    Object.values(s.identity.translations).some(t => t.toLowerCase() === lower)
  );
}

export function searchSymptoms(query: string): SymptomNode[] {
  const q = query.toLowerCase();
  return Object.values(SYMPTOM_REGISTRY).filter(s =>
    s.identity.canonicalName.toLowerCase().includes(q) ||
    s.identity.synonyms.some(syn => syn.toLowerCase().includes(q)) ||
    s.identity.layTerms.some(term => term.toLowerCase().includes(q)) ||
    Object.values(s.identity.translations).some(t => t.toLowerCase().includes(q))
  );
}

export function getAllSymptomNames(): string[] {
  return Object.values(SYMPTOM_REGISTRY).map(s => s.identity.canonicalName);
}

// ─── BACKWARD COMPATIBILITY ALIASES ──────────────────────────────────────────

// Maintain old exports so existing code doesn't break
export const searchSymptom = searchSymptoms;
export const getSymptomById = getSymptomNode;

// Legacy type aliases
export type SymptomKnowledgeNode = SymptomNode;

// ─── CQAE-ENHANCED QUESTION FILTER ───────────────────────────────────────────

export function getApplicableQuestionsConstitutional(
  symptomId: string,
  context: ConstitutionalContext,
): { question: SymptomQuestion; displayText: string; displayChips?: string[] }[] {
  const node = getSymptomNode(symptomId);
  if (!node) return [];

  // No chief complaints → no questions (CQAE-005 principle)
  if (context.chiefComplaints.length === 0) return [];

  const alreadyCaptured = new Set(Object.keys(context.capturedFacts));
  const result: { question: SymptomQuestion; displayText: string; displayChips?: string[] }[] = [];

  for (const q of node.questions) {
    const cqaeResult = evaluateCqae({
      question: q,
      context,
      alreadyCapturedFacts: alreadyCaptured,
      patientAge: context.age,
      symptomNodeName: node.identity.canonicalName,
      symptomNodeSynonyms: node.identity.synonyms,
    });

    if (cqaeResult.applicable) {
      result.push({
        question: q,
        displayText: cqaeResult.displayText,
        displayChips: cqaeResult.displayChips,
      });
    }
  }

  return result;
}

// ─── FACT EXTRACTION ENGINE ──────────────────────────────────────────────────

export function extractFacts(
  symptomId: string,
  questionId: string,
  answer: any,
  context: AssessmentContext
): StructuredFact[] {
  const node = getSymptomNode(symptomId);
  if (!node) return [];

  const rule = node.factExtraction.find(r => r.questionId === questionId);
  if (!rule) return [];

  return rule.extract(answer, context);
}

// ─── GET APPLICABLE QUESTIONS ────────────────────────────────────────────────

export function getApplicableQuestions(
  symptomId: string,
  context: AssessmentContext
): { question: SymptomQuestion; displayText: string; displayChips?: string[] }[] {
  const node = getSymptomNode(symptomId);
  if (!node) return [];

  const result: { question: SymptomQuestion; displayText: string; displayChips?: string[] }[] = [];

  // Determine which context adapters apply
  const activeAdapters: ContextExtension[] = [];
  if (context.age < 1) {
    const neonatal = node.contextAdapters['neonatal'];
    if (neonatal) activeAdapters.push(neonatal);
  } else if (context.age < 13) {
    const pediatric = node.contextAdapters['pediatric'];
    if (pediatric) activeAdapters.push(pediatric);
  }
  if (context.pregnant && node.contextAdapters['obstetric']) {
    activeAdapters.push(node.contextAdapters['obstetric']);
  }

  // Collect suppressed question IDs
  const suppressedIds = new Set<string>();
  for (const adapter of activeAdapters) {
    for (const id of adapter.suppressedQuestionIds) {
      suppressedIds.add(id);
    }
  }

  // Process each question
  for (const q of node.questions) {
    if (suppressedIds.has(q.id)) continue;

    // Check dependencies
    if (q.dependencies) {
      // Skip — handled by caller
    }

    // Find best alternative wording
    let displayText = q.text;
    let displayChips = q.chips;

    // Check context adapter modified questions
    for (const adapter of activeAdapters) {
      const modified = adapter.modifiedQuestions.find(m => m.id === q.id);
      if (modified) {
        displayText = modified.text;
        if (modified.chips) displayChips = modified.chips;
      }
    }

    // Check question alternatives
    for (const alt of q.alternatives) {
      if (matchesContext(alt.condition, context)) {
        displayText = alt.text;
        if (alt.chips) displayChips = alt.chips;
        if (alt.type) break; // alternative type overrides
      }
    }

    result.push({ question: q, displayText, displayChips });
  }

  // Add additional questions from adapters
  for (const adapter of activeAdapters) {
    for (const aq of adapter.additionalQuestions) {
      result.push({ question: aq, displayText: aq.text, displayChips: aq.chips });
    }
  }

  return result;
}

function matchesContext(condition: ContextCondition, context: AssessmentContext): boolean {
  if (condition.ageMin !== undefined && context.age < condition.ageMin) return false;
  if (condition.ageMax !== undefined && context.age > condition.ageMax) return false;
  if (condition.sex !== undefined && context.sex !== condition.sex) return false;
  if (condition.pregnant !== undefined && context.pregnant !== condition.pregnant) return false;
  if (condition.departments && !condition.departments.includes(context.department)) return false;
  if (condition.module && context.module !== condition.module) return false;
  return true;
}

export { computeFeverDdx, FEVER_DDX, FEVER_RED_FLAGS, FEVER_MANAGEMENT_PROTOCOLS } from './legacy/fever-legacy';
export type { FeverDdxEntry, FeverProtocol, FeverDdxResult } from './legacy/fever-legacy';
