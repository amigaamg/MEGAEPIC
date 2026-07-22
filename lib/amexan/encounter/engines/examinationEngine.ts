// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Examination Engine — single authority for "what to examine next?"
// ═══════════════════════════════════════════════════════════════════════════════
// Mirrors the QuestionEngine pattern but for physical examination.
// Examination follows a fixed sequential methodology:
// Inspection → Palpation → Percussion → Auscultation → Special Signs
// No random examination. Every finding has clinical significance.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, GiExam, SymptomId } from '../encounterState';
import {
  EXAM_SCHEMAS,
  getExamSchema,
  getUnansweredExamFields,
  getFieldsForPhase,
  getCriticalExamFields,
  getExamSystemsActivatedBySymptom,
  getExamSystemsActivatedByCC,
} from '../examinationSchemas';
import type { ExamField, ExamPhase } from '../examinationSchemas';
import { SYMPTOM_SCHEMAS } from '../symptomSchemas';

// ── Types ──────────────────────────────────────────────────────────────────

export type ExamPriority = 'critical' | 'mandatory' | 'completion' | 'optional';

export interface NextExamStep {
  systemId: string;
  field: ExamField;
  priority: ExamPriority;
  reason: string;
  phase: ExamPhase;
  /** Current values of the exam fields already captured for this system */
  currentValues: Record<string, any>;
}

// ── Canonical examination phase order ──────────────────────────────────────
// Follows Hutchison's methodology.

export const EXAM_PHASE_ORDER: ExamPhase[] = [
  'inspection',
  'palpation',
  'deep_palpation',
  'percussion',
  'auscultation',
  'special_signs',
  'dre',
  'inguinal',
];

// ── Active system detection ────────────────────────────────────────────────
// Determines which body systems need examination based on symptoms and CC.

export function getActiveExamSystems(state: EncounterState): string[] {
  const activated = new Set<string>();

  // Activate GI system if any GI symptom is present
  const giSymptoms: SymptomId[] = ['abdominal_pain', 'nausea_vomiting', 'diarrhea', 'constipation', 'dysphagia', 'gi_bleeding', 'jaundice', 'distension'];
  for (const symptomId of Object.keys(state.symptoms) as SymptomId[]) {
    const symptom = state.symptoms[symptomId];
    if (symptom?.present) {
      const fromSymptom = getExamSystemsActivatedBySymptom(symptomId);
      for (const sys of fromSymptom) activated.add(sys);
    }
  }

  // Activate from chief complaint keywords
  const ccText = state.chiefComplaint.text;
  if (ccText) {
    const fromCC = getExamSystemsActivatedByCC(ccText);
    for (const sys of fromCC) activated.add(sys);
  }

  return Array.from(activated);
}

// ── Get current examination phase for a system ────────────────────────────
// Returns the earliest incomplete phase.

export function getCurrentExamPhase(systemId: string, capturedFields: Set<string>): ExamPhase {
  for (const phase of EXAM_PHASE_ORDER) {
    const fieldsInPhase = getFieldsForPhase(systemId, phase);
    for (const field of fieldsInPhase) {
      if (!capturedFields.has(field.id) && field.mandatory) {
        return phase;
      }
    }
    // If all mandatory fields in this phase are complete, move to next phase
  }
  return 'inspection';
}

// ── Priority pipeline — what to examine next ──────────────────────────────
// Phase 1: Critical/danger findings first (life-threatening signs)
// Phase 2: Mandatory fields in sequence (Inspection → Palpation → etc.)
// Phase 3: Optional/completion fields

export function getNextExamStep(state: EncounterState): NextExamStep | null {
  const activeSystems = getActiveExamSystems(state);

  // If no active system based on symptoms, default to GI if symptoms are present
  if (activeSystems.length === 0) {
    const hasAnySymptom = Object.values(state.symptoms).some(s => s?.present);
    if (hasAnySymptom) {
      // Determine which system to examine based on symptom type
      for (const symptomId of Object.keys(state.symptoms) as SymptomId[]) {
        const symptom = state.symptoms[symptomId];
        if (symptom?.present) {
          const fromSymptom = getExamSystemsActivatedBySymptom(symptomId);
          if (fromSymptom.length > 0) {
            // Return the first critical/danger field from this system
            const critical = findCriticalExamField(fromSymptom[0], state);
            if (critical) return critical;
            const mandatory = findFirstMandatoryField(fromSymptom[0], state);
            if (mandatory) return mandatory;
          }
        }
      }
      // Fallback: GI examination if any symptom exists
      if (findCriticalExamField('gastrointestinal', state)) return findCriticalExamField('gastrointestinal', state)!;
      if (findFirstMandatoryField('gastrointestinal', state)) return findFirstMandatoryField('gastrointestinal', state)!;
    }
    return null;
  }

  // Phase 1: Critical/danger findings across all active systems
  for (const systemId of activeSystems) {
    const critical = findCriticalExamField(systemId, state);
    if (critical) return critical;
  }

  // Phase 2: Mandatory fields in sequence per system
  for (const systemId of activeSystems) {
    const mandatory = findFirstMandatoryField(systemId, state);
    if (mandatory) return mandatory;
  }

  // Phase 3: Optional/completion fields
  for (const systemId of activeSystems) {
    const optional = findOptionalField(systemId, state);
    if (optional) return optional;
  }

  return null;
}

// ── Critical/Danger finding search ────────────────────────────────────────
// Looks for critical-priority or critical-significance fields not yet captured.

function findCriticalExamField(systemId: string, state: EncounterState): NextExamStep | null {
  const schema = getExamSchema(systemId);
  if (!schema) return null;

  const capturedFields = getCapturedFields(systemId, state);
  const criticalFields = getCriticalExamFields(systemId);

  for (const field of criticalFields) {
    if (!capturedFields.has(field.id)) {
      return {
        systemId,
        field,
        priority: 'critical',
        reason: `Critical sign: ${field.clinicalGuide || field.label}`,
        phase: field.phase,
        currentValues: getSystemValues(systemId, state),
      };
    }
  }

  return null;
}

// ── First mandatory field search ───────────────────────────────────────────
// Finds the first unanswered mandatory field in examination sequence order.

function findFirstMandatoryField(systemId: string, state: EncounterState): NextExamStep | null {
  const schema = getExamSchema(systemId);
  if (!schema) return null;

  const capturedFields = getCapturedFields(systemId, state);

  // Check phases in order
  for (const phase of EXAM_PHASE_ORDER) {
    const fieldsInPhase = getFieldsForPhase(systemId, phase);
    for (const field of fieldsInPhase) {
      if (!capturedFields.has(field.id) && field.mandatory) {
        // Check dependsOn
        if (field.dependsOn) {
          const parentValue = (getSystemValues(systemId, state) as any)[field.dependsOn.field];
          if (parentValue !== field.dependsOn.value) continue;
        }
        return {
          systemId,
          field,
          priority: 'mandatory',
          reason: `Examine: ${field.label}`,
          phase,
          currentValues: getSystemValues(systemId, state),
        };
      }
    }
  }

  return null;
}

// ── Optional field search ─────────────────────────────────────────────────

function findOptionalField(systemId: string, state: EncounterState): NextExamStep | null {
  const schema = getExamSchema(systemId);
  if (!schema) return null;

  const capturedFields = getCapturedFields(systemId, state);

  for (const phase of EXAM_PHASE_ORDER) {
    const fieldsInPhase = getFieldsForPhase(systemId, phase);
    for (const field of fieldsInPhase) {
      if (!capturedFields.has(field.id) && !field.mandatory) {
        if (field.dependsOn) {
          const parentValue = (getSystemValues(systemId, state) as any)[field.dependsOn.field];
          if (parentValue !== field.dependsOn.value) continue;
        }
        return {
          systemId,
          field,
          priority: 'optional',
          reason: `Optional: ${field.label}`,
          phase,
          currentValues: getSystemValues(systemId, state),
        };
      }
    }
  }

  return null;
}

// ── Batch exam steps (for UI checklist display) ──────────────────────────

export function getAllPendingExamSteps(state: EncounterState): NextExamStep[] {
  const steps: NextExamStep[] = [];
  const seen = new Set<string>();
  let step = getNextExamStep(state);
  let safety = 50;
  while (step && safety-- > 0) {
    const key = `${step.systemId}.${step.field.id}`;
    if (seen.has(key)) break;
    seen.add(key);
    steps.push(step);
    // Get next after marking this one as answered
    const systemValues = getSystemValues(step.systemId, state);
    const updatedValues = { ...systemValues, [step.field.id]: undefined };
    step = findNextAfter(systemValues, step.systemId, state);
  }
  return steps;
}

function findNextAfter(captured: Record<string, any>, systemId: string, state: EncounterState): NextExamStep | null {
  const capturedSet = new Set(Object.keys(captured));
  const schema = getExamSchema(systemId);
  if (!schema) return null;

  for (const phase of EXAM_PHASE_ORDER) {
    const fieldsInPhase = getFieldsForPhase(systemId, phase);
    for (const field of fieldsInPhase) {
      if (!capturedSet.has(field.id) && field.mandatory) {
        if (field.dependsOn) {
          const parentValue = captured[field.dependsOn.field];
          if (parentValue !== field.dependsOn.value) continue;
        }
        return { systemId, field, priority: 'mandatory', reason: field.label, phase: field.phase, currentValues: captured };
      }
    }
  }
  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getCapturedFields(systemId: string, state: EncounterState): Set<string> {
  if (systemId === 'gastrointestinal' || systemId === 'abdominal') {
    const gi = state.examination.physical.abdominal as GiExam;
    return new Set(Object.keys(gi).filter(k => {
      const v = (gi as any)[k];
      return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
    }));
  }
  const section = (state.examination.physical as any)[systemId];
  if (!section) return new Set();
  return new Set(Object.keys(section).filter(k => {
    const v = section[k];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  }));
}

function getSystemValues(systemId: string, state: EncounterState): Record<string, any> {
  if (systemId === 'gastrointestinal' || systemId === 'abdominal') {
    return state.examination.physical.abdominal as Record<string, any>;
  }
  return (state.examination.physical as any)[systemId] || {};
}

// ── Examination completeness check ────────────────────────────────────────
// Returns which systems have been adequately examined.

export interface ExamCompletenessResult {
  examinedSystems: string[];
  partiallyExamined: string[];
  notExamined: string[];
  complete: boolean;
  completionRatio: number;
}

export function getExamCompleteness(state: EncounterState): ExamCompletenessResult {
  const activeSystems = getActiveExamSystems(state);
  const examined: string[] = [];
  const partially: string[] = [];
  const notExamined: string[] = [];

  if (activeSystems.length === 0) {
    return { examinedSystems: [], partiallyExamined: [], notExamined: [], complete: true, completionRatio: 1 };
  }

  for (const systemId of activeSystems) {
    const schema = getExamSchema(systemId);
    if (!schema) {
      notExamined.push(systemId);
      continue;
    }

    const capturedKeys = getCapturedFields(systemId, state);
    const mandatoryFields = schema.fields.filter(f => f.mandatory);
    const answeredMandatory = mandatoryFields.filter(f => capturedKeys.has(f.id));
    const adequacyFields: string[] = schema.minimumForAdequacy;
    const adequacyAnswered = adequacyFields.filter(id => capturedKeys.has(id));

    if (adequacyAnswered.length >= adequacyFields.length) {
      examined.push(systemId);
    } else if (answeredMandatory.length > 0) {
      partially.push(systemId);
    } else {
      notExamined.push(systemId);
    }
  }

  const total = activeSystems.length;
  const completeRatio = total > 0 ? (examined.length + partially.length * 0.5) / total : 1;

  return {
    examinedSystems: examined,
    partiallyExamined: partially,
    notExamined: notExamined,
    complete: notExamined.length === 0,
    completionRatio: completeRatio,
  };
}
