// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workflow Engine — single authority for progression
// ═══════════════════════════════════════════════════════════════════════════════
// This is the ONLY place that controls:
//   - What step/phase comes next
//   - Whether a transition is valid
//   - What conditions must be met to advance
// No component, no other engine, no reducer bypasses this.
//
// Two-layer architecture:
//   Layer 1 — WorkflowStep (legacy 8-step, kept for backward compatibility)
//   Layer 2 — EncounterPhase (new 22-step doctor-centric workflow)
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, WorkflowStep, EncounterPhase } from '../encounterState';
import { ENCOUNTER_PHASES, getPhaseDefinition, PHASE_ORDER } from '../encounterPhases';

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — Legacy 8-step workflow (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

export const WORKFLOW_ORDER: readonly WorkflowStep[] = [
  'intake',
  'chief_complaint',
  'history',
  'examination',
  'investigations',
  'assessment',
  'plan',
  'complete',
] as const;

const STEP_PREREQUISITES: Record<WorkflowStep, (state: EncounterState) => string | null> = {
  intake: () => null,

  chief_complaint: (s) =>
    !s.demographics.name
      ? 'Patient demographics must be collected first'
      : null,

  history: (s) =>
    !s.chiefComplaint.text
      ? 'Chief complaint must be documented first'
      : null,

  examination: () =>
    null,

  investigations: () => null,

  assessment: (s) =>
    s.examination.vitals.avpu === 'alert' && !s.examination.vitals.temp
      ? 'Vitals should be recorded before assessment'
      : null,

  plan: (s) =>
    s.assessment.differentials.length === 0
      ? 'Differential must be generated before plan'
      : null,

  complete: (s) =>
    !s.plan.admissionReason && s.plan.admissionDecision !== 'discharge'
      ? 'Management plan must be complete'
      : null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — New 22-step phase workflow
// ═══════════════════════════════════════════════════════════════════════════════

const PHASE_PREREQUISITES: Partial<Record<EncounterPhase, (state: EncounterState) => string | null>> = {
  biodata: () => null,

  chief_complaints: (s) =>
    !s.demographics.name
      ? 'Patient demographics must be collected first'
      : null,

  hpi: (s) =>
    !s.chiefComplaint.text
      ? 'Chief complaint must be documented first'
      : null,

  pmh: () => null,
  psh: () => null,
  drug_history: () => null,
  allergy_history: () => null,
  family_history: () => null,
  social_history: () => null,
  ros: () => null,

  physical_examination: () => null,

  clinical_summary: (s) => {
    if (!s.chiefComplaint.text) return 'Chief complaint must be documented before summary';
    return null;
  },

  provisional_diagnosis: () => null,
  differential_diagnoses: () => null,
  problem_list: () => null,

  investigations: () => null,
  results_review: () => null,

  final_diagnosis: () => null,

  management: () => null,
  disposition: () => null,
  documentation: () => null,
  sign_off: () => null,
  closed: () => null,
};

// ── Mapping: new phase → old step ─────────────────────────────────────────────

export function phaseToStep(phase: EncounterPhase): WorkflowStep {
  return getPhaseDefinition(phase).mapsToOldStep;
}

// ── Mapping: old step → its constituent phases ─────────────────────────────────

const STEP_TO_PHASES_MAP: Record<WorkflowStep, readonly EncounterPhase[]> = {
  intake: ['biodata'],
  chief_complaint: ['chief_complaints'],
  history: ['hpi', 'pmh', 'psh', 'drug_history', 'allergy_history', 'family_history', 'social_history', 'ros'],
  examination: ['physical_examination'],
  investigations: ['investigations', 'results_review'],
  assessment: ['clinical_summary', 'provisional_diagnosis', 'differential_diagnoses', 'problem_list', 'final_diagnosis'],
  plan: ['management', 'disposition'],
  complete: ['documentation', 'sign_off', 'closed'],
};

export function stepToPhases(step: WorkflowStep): readonly EncounterPhase[] {
  return STEP_TO_PHASES_MAP[step];
}

// ── Mapping: new phase → its sibling phases in the same old step ──────────────

const PHASE_TO_STEP_GROUP: Partial<Record<EncounterPhase, readonly EncounterPhase[]>> = {};

for (const step of Object.keys(STEP_TO_PHASES_MAP) as WorkflowStep[]) {
  const phases = STEP_TO_PHASES_MAP[step];
  for (const phase of phases) {
    PHASE_TO_STEP_GROUP[phase] = phases;
  }
}

export function getStepGroup(phase: EncounterPhase): readonly EncounterPhase[] {
  return PHASE_TO_STEP_GROUP[phase] ?? [phase];
}

export function isLastPhaseInStep(phase: EncounterPhase): boolean {
  const group = getStepGroup(phase);
  return group.length > 0 && group[group.length - 1] === phase;
}

export function getNextPhaseInStep(phase: EncounterPhase): EncounterPhase | null {
  const group = getStepGroup(phase);
  const idx = group.indexOf(phase);
  if (idx >= 0 && idx < group.length - 1) return group[idx + 1];
  return null;
}

// ── Sync function: given a phase, what should currentStep be? ─────────────────

export function phaseToCurrentStep(phase: EncounterPhase): WorkflowStep {
  return phaseToStep(phase);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — Public API (unchanged signatures, backward compatible)
// ═══════════════════════════════════════════════════════════════════════════════

export function getWorkflowOrder(): readonly WorkflowStep[] {
  return WORKFLOW_ORDER;
}

export function getWorkflowPrerequisite(step: WorkflowStep): ((state: EncounterState) => string | null) {
  return STEP_PREREQUISITES[step];
}

export function canAdvanceTo(state: EncounterState, target: WorkflowStep): {
  allowed: boolean;
  reason: string | null;
  prerequisiteCheck: string | null;
} {
  const currentIdx = WORKFLOW_ORDER.indexOf(state.workflow.currentStep);
  const targetIdx = WORKFLOW_ORDER.indexOf(target);

  if (targetIdx === -1) {
    return { allowed: false, reason: `Unknown step: ${target}`, prerequisiteCheck: null };
  }

  if (targetIdx === currentIdx) {
    return { allowed: true, reason: 'Already at this step', prerequisiteCheck: null };
  }

  if (targetIdx < currentIdx) {
    return { allowed: true, reason: 'Going back to previous step', prerequisiteCheck: null };
  }

  if (targetIdx > currentIdx + 1) {
    return {
      allowed: false,
      reason: `Cannot skip from ${state.workflow.currentStep} to ${target}. Must advance one step at a time.`,
      prerequisiteCheck: null,
    };
  }

  const prereq = STEP_PREREQUISITES[target](state);
  if (prereq) {
    return { allowed: false, reason: `Prerequisite not met for ${target}`, prerequisiteCheck: prereq };
  }

  return { allowed: true, reason: null, prerequisiteCheck: null };
}

export function getNextStep(state: EncounterState): WorkflowStep | null {
  const currentIdx = WORKFLOW_ORDER.indexOf(state.workflow.currentStep);
  if (currentIdx < WORKFLOW_ORDER.length - 1) {
    const next = WORKFLOW_ORDER[currentIdx + 1];
    const result = canAdvanceTo(state, next);
    return result.allowed ? next : null;
  }
  return null;
}

export function getPreviousStep(state: EncounterState): WorkflowStep | null {
  const currentIdx = WORKFLOW_ORDER.indexOf(state.workflow.currentStep);
  if (currentIdx > 0) {
    return WORKFLOW_ORDER[currentIdx - 1];
  }
  return null;
}

export function isComplete(state: EncounterState): boolean {
  return state.workflow.currentStep === 'complete' || state.workflow.completedSteps.includes('plan');
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — Phase-level navigation (new API)
// ═══════════════════════════════════════════════════════════════════════════════

export function canAdvanceToPhase(state: EncounterState, targetPhase: EncounterPhase): {
  allowed: boolean;
  reason: string | null;
  prerequisiteCheck: string | null;
} {
  const currentIdx = PHASE_ORDER.indexOf(state.workflow.currentPhase);
  const targetIdx = PHASE_ORDER.indexOf(targetPhase);

  if (targetIdx === -1) {
    return { allowed: false, reason: `Unknown phase: ${targetPhase}`, prerequisiteCheck: null };
  }

  if (targetIdx === currentIdx) {
    return { allowed: true, reason: 'Already at this phase', prerequisiteCheck: null };
  }

  if (targetIdx < currentIdx) {
    return { allowed: true, reason: 'Going back to previous phase', prerequisiteCheck: null };
  }

  if (targetIdx > currentIdx + 1) {
    return {
      allowed: false,
      reason: `Cannot skip from ${state.workflow.currentPhase} to ${targetPhase}. Must advance one phase at a time.`,
      prerequisiteCheck: null,
    };
  }

  const prereqFn = PHASE_PREREQUISITES[targetPhase];
  if (prereqFn) {
    const prereq = prereqFn(state);
    if (prereq) {
      return { allowed: false, reason: `Prerequisite not met for ${targetPhase}`, prerequisiteCheck: prereq };
    }
  }

  return { allowed: true, reason: null, prerequisiteCheck: null };
}

export function getNextPhase(state: EncounterState): EncounterPhase | null {
  const currentIdx = PHASE_ORDER.indexOf(state.workflow.currentPhase);
  if (currentIdx < PHASE_ORDER.length - 1) {
    const next = PHASE_ORDER[currentIdx + 1];
    const result = canAdvanceToPhase(state, next);
    return result.allowed ? next : null;
  }
  return null;
}

export function getPreviousPhase(state: EncounterState): EncounterPhase | null {
  const currentIdx = PHASE_ORDER.indexOf(state.workflow.currentPhase);
  if (currentIdx > 0) {
    return PHASE_ORDER[currentIdx - 1];
  }
  return null;
}

export function isPhaseComplete(state: EncounterState, phase: EncounterPhase): boolean {
  return state.workflow.completedPhases.includes(phase);
}

export function isBeforePhase(state: EncounterState, phase: EncounterPhase): boolean {
  return PHASE_ORDER.indexOf(state.workflow.currentPhase) < PHASE_ORDER.indexOf(phase);
}

export function isAfterPhase(state: EncounterState, phase: EncounterPhase): boolean {
  return PHASE_ORDER.indexOf(state.workflow.currentPhase) > PHASE_ORDER.indexOf(phase);
}

export function isClinicalSummaryReached(state: EncounterState): boolean {
  return !isBeforePhase(state, 'clinical_summary');
}

export function areAllPhasesComplete(state: EncounterState): boolean {
  return state.workflow.completedPhases.includes('sign_off');
}

export function getCompletedStepCount(state: EncounterState): number {
  return state.workflow.completedSteps.length;
}

export function getCompletedPhaseCount(state: EncounterState): number {
  return state.workflow.completedPhases.length;
}

export function getPhaseProgress(state: EncounterState): {
  completed: EncounterPhase[];
  current: EncounterPhase;
  remaining: EncounterPhase[];
  percentComplete: number;
} {
  const currentIdx = PHASE_ORDER.indexOf(state.workflow.currentPhase);
  return {
    completed: state.workflow.completedPhases,
    current: state.workflow.currentPhase,
    remaining: PHASE_ORDER.slice(currentIdx + 1),
    percentComplete: Math.round((state.workflow.completedPhases.length / PHASE_ORDER.length) * 100),
  };
}
