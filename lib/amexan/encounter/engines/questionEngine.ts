// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal Question Engine — single authority for "what to ask next?"
// ═══════════════════════════════════════════════════════════════════════════════
// Replaces: src/engine/respiratory/questionEngine.ts
//           src/engine/cough/ClinicalEngine.ts
//           src/engine/inference/adaptive-questioner.ts
//           lib/amexan/reasoning/questionEngine.ts
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, SymptomId, StructuredSymptom, GenericSymptom } from '../encounterState';
import type { SymptomField } from '../symptomSchemas';
import { SYMPTOM_SCHEMAS, getUnansweredFields, getMandatoryFields } from '../symptomSchemas';
import { evaluateCompleteness } from '../completionEngine';
import { WORKFLOW_ORDER } from './workflowEngine';

// ── Types ──────────────────────────────────────────────────────────────────

export type QuestionPriority = 'mandatory' | 'danger' | 'completion' | 'safety' | 'optional';

export interface NextQuestion {
  symptomId: SymptomId;
  field: SymptomField;
  priority: QuestionPriority;
  reason: string;
  phase: string;
  /** The current value of the symptom fields already answered */
  currentValues: Record<string, any>;
}

// ── Question sources, ranked by priority ───────────────────────────────────

const DANGER_FIELDS: Partial<Record<SymptomId, string[]>> = {
  chest_pain: ['exertional', 'pleuritic'],
  dyspnea: ['at_rest', 'severity'],
  gi_bleeding: ['syncope', 'volume'],
  seizure: ['duration'],
  stridor: ['severity', 'drooling'],
  cyanosis: ['context', 'location'],
  lethargy: ['severity'],
};

export function getNextQuestion(state: EncounterState): NextQuestion | null {
  // Phase 1: Danger questions first (life-threatening red flags)
  const danger = findDangerQuestion(state);
  if (danger) return danger;

  // Phase 2: Critical-priority fields (equivalent to red flags but from schema)
  const critical = findQuestionByPriority(state, 'critical');
  if (critical) return critical;

  // Phase 3: High-priority fields (strong discriminators)
  const high = findQuestionByPriority(state, 'high');
  if (high) return { ...high, priority: 'mandatory' };

  // Phase 4: Legacy mandatory fields (schemas not yet migrated to priority tiers)
  const mandatory = findMandatoryQuestion(state);
  if (mandatory) return mandatory;

  // Phase 5: ROS exploration for activated systems
  const ros = findRosQuestion(state);
  if (ros) return ros;

  // Phase 6: Medium-priority fields (completion)
  const medium = findQuestionByPriority(state, 'medium');
  if (medium) return { ...medium, priority: 'completion' };

  // Phase 7: Low-priority / optional fields (nice-to-have)
  const optional = findOptionalQuestion(state);
  if (optional) return { ...optional, priority: 'optional' };

  return null;
}

function findQuestionByPriority(state: EncounterState, targetPriority: string): NextQuestion | null {
  const activeSymptomIds = Object.keys(state.symptoms) as SymptomId[];
  for (const symptomId of activeSymptomIds) {
    const symptom = state.symptoms[symptomId];
    if (!symptom || !symptom.present) continue;

    const answered = new Set(Object.keys(symptom));
    const schema = SYMPTOM_SCHEMAS[symptomId];
    if (!schema) continue;

    for (const field of schema.fields) {
      if (answered.has(field.id)) continue;
      if (field.priority === targetPriority) {
        return {
          symptomId,
          field,
          priority: targetPriority as QuestionPriority,
          reason: `${targetPriority}-priority: ${field.shortLabel}`,
          phase: field.phase,
          currentValues: symptom as Record<string, any>,
        };
      }
    }
  }
  return null;
}

function findDangerQuestion(state: EncounterState): NextQuestion | null {
  for (const [symptomId, fields] of Object.entries(DANGER_FIELDS)) {
    const symptom = state.symptoms[symptomId as SymptomId];
    if (!symptom || !symptom.present) continue;

    const answered = new Set(Object.keys(symptom));
    for (const fieldId of fields) {
      if (!answered.has(fieldId)) {
        const schema = SYMPTOM_SCHEMAS[symptomId as SymptomId];
        const field = schema?.fields.find(f => f.id === fieldId);
        if (field) {
          return {
            symptomId: symptomId as SymptomId,
            field,
            priority: 'danger',
            reason: `Danger assessment required for ${schema?.label ?? symptomId}`,
            phase: field.phase,
            currentValues: symptom as Record<string, any>,
          };
        }
      }
    }
  }
  return null;
}

function findMandatoryQuestion(state: EncounterState): NextQuestion | null {
  const activeSymptomIds = Object.keys(state.symptoms) as SymptomId[];

  for (const symptomId of activeSymptomIds) {
    const symptom = state.symptoms[symptomId];
    if (!symptom || !symptom.present) continue;

    const answered = new Set(Object.keys(symptom));
    const unanswered = getUnansweredFields(symptomId, answered);
    const mandatoryUnanswered = unanswered.filter(f => f.mandatory);

    if (mandatoryUnanswered.length > 0) {
      const field = mandatoryUnanswered[0];
      return {
        symptomId,
        field,
        priority: 'mandatory',
        reason: `Missing mandatory field for ${SYMPTOM_SCHEMAS[symptomId]?.label ?? symptomId}`,
        phase: field.phase,
        currentValues: symptom as Record<string, any>,
      };
    }
  }

  return null;
}

function findRosQuestion(state: EncounterState): NextQuestion | null {
  const completeness = evaluateCompleteness(state);
  if (completeness.domains.ros) return null;

  // Find first ROS system that hasn't been explored
  const activatedSystems = new Set<string>();
  for (const symptomId of Object.keys(state.symptoms) as SymptomId[]) {
    const schema = SYMPTOM_SCHEMAS[symptomId];
    if (schema) {
      for (const sys of schema.activatesRosSystems) {
        activatedSystems.add(sys);
      }
    }
  }
  activatedSystems.add('general');

  for (const sys of Array.from(activatedSystems)) {
    const rosSection = (state.history.ros as any)[sys];
    if (!rosSection) continue;

    const emptyFields = Object.entries(rosSection)
      .filter(([_, v]) => v === false || v === '');

    if (emptyFields.length > 0) {
      const fieldId = emptyFields[0][0];
      return {
        symptomId: 'fever' as SymptomId, // Placeholder — ROS questions are system-level
        field: {
          id: `ros.${sys}.${fieldId}`,
          label: `Any ${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()}?`,
          shortLabel: fieldId.replace(/([A-Z])/g, ' $1'),
          type: 'boolean',
          mandatory: false,
          phase: 'associated',
        },
        priority: 'completion',
        reason: `ROS: ${sys} not fully explored`,
        phase: 'associated',
        currentValues: {},
      };
    }
  }

  return null;
}

function findOptionalQuestion(state: EncounterState): NextQuestion | null {
  const activeSymptomIds = Object.keys(state.symptoms) as SymptomId[];

  for (const symptomId of activeSymptomIds) {
    const symptom = state.symptoms[symptomId];
    if (!symptom || !symptom.present) continue;

    const answered = new Set(Object.keys(symptom));
    const unanswered = getUnansweredFields(symptomId, answered);
    const optionalUnanswered = unanswered.filter(f => !f.mandatory);

    if (optionalUnanswered.length > 0) {
      const field = optionalUnanswered[0];
      return {
        symptomId,
        field,
        priority: 'optional',
        reason: `Optional field for ${SYMPTOM_SCHEMAS[symptomId]?.label ?? symptomId}`,
        phase: field.phase,
        currentValues: symptom as Record<string, any>,
      };
    }
  }

  return null;
}

// ── Batch questions (for UI to show a checklist) ───────────────────────────

export function getAllPendingQuestions(state: EncounterState): NextQuestion[] {
  const questions: NextQuestion[] = [];
  const seen = new Set<string>();
  let q = getNextQuestion(state);
  let safety = 50;
  while (q && safety-- > 0) {
    if (seen.has(q.field.id)) break;
    seen.add(q.field.id);
    questions.push(q);
    q = findMandatoryQuestion(state);
  }
  return questions;
}

// ── Question phase helper ──────────────────────────────────────────────────

export const QUESTION_PHASES = ['onset', 'location', 'character', 'evolution', 'associated', 'context'] as const;

export function getCurrentPhase(state: EncounterState): string {
  const activeSymptomIds = Object.keys(state.symptoms) as SymptomId[];
  for (const phase of QUESTION_PHASES) {
    for (const symptomId of activeSymptomIds) {
      const symptom = state.symptoms[symptomId];
      if (!symptom || !symptom.present) continue;
      const answered = new Set(Object.keys(symptom));
      const fields = SYMPTOM_SCHEMAS[symptomId]?.fields.filter(f => f.phase === phase) ?? [];
      for (const field of fields) {
        if (!answered.has(field.id)) {
          return phase;
        }
      }
    }
  }
  return 'associated';
}
