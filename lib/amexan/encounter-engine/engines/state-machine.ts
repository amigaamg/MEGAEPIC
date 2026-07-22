// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Section State Machine
// Manages execution states per UCAEM-SB-003 through SB-009.
// Every section has a constitutional lifecycle.
// ═══════════════════════════════════════════════════════════════════════════════

import type { SectionState, SectionExecutionState, SectionDef } from '../knowledge/symptom-types';

export interface SectionStateMachine {
  sections: Record<string, SectionState>
  currentSectionId: string | null
  overallProgress: number         // 0-100
  completedSections: string[]
}

export function createStateMachine(formatSections: SectionDef[]): SectionStateMachine {
  const sections: Record<string, SectionState> = {};
  for (const section of formatSections) {
    sections[section.id] = {
      sectionId: section.id,
      status: 'not_started',
      visited: false,
      skippedQuestions: [],
      deferredQuestions: [],
    };
  }

  const firstSection = formatSections.length > 0 ? formatSections[0].id : null;

  return {
    sections,
    currentSectionId: firstSection,
    overallProgress: 0,
    completedSections: [],
  };
}

// ─── Rule UCAEM-SB-003: Section state transitions ──────────────────────────

export function startSection(machine: SectionStateMachine, sectionId: string): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  return {
    ...machine,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        status: 'in_progress',
        visited: true,
      },
    },
    currentSectionId: sectionId,
  };
}

export function completeSection(
  machine: SectionStateMachine,
  sectionId: string,
  unknowns: string[] = [],
  declined: string[] = [],
): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  let status: SectionExecutionState = 'completed';
  if (unknowns.length > 0 && declined.length === 0) {
    status = 'completed_with_unknowns';
  } else if (declined.length > 0 && unknowns.length === 0) {
    status = 'completed_patient_declined';
  } else if (unknowns.length > 0 && declined.length > 0) {
    status = 'completed_with_unknowns';
  }

  const newCompleted = [...machine.completedSections, sectionId];

  return {
    ...machine,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        status,
        completedAt: Date.now(),
      },
    },
    completedSections: newCompleted,
    overallProgress: calculateProgress(machine, newCompleted),
  };
}

// ─── Rule UCAEM-SB-004: Deferred questions ─────────────────────────────────

export function deferQuestion(
  machine: SectionStateMachine,
  sectionId: string,
  questionId: string,
): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  return {
    ...machine,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        deferredQuestions: [...section.deferredQuestions, questionId],
        status: section.visited ? 'in_progress' : 'not_started',
      },
    },
  };
}

export function skipQuestion(
  machine: SectionStateMachine,
  sectionId: string,
  questionId: string,
): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  return {
    ...machine,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        skippedQuestions: [...section.skippedQuestions, questionId],
      },
    },
  };
}

// ─── Rule UCAEM-SB-002: Navigation ──────────────────────────────────────────

export function navigateToSection(
  machine: SectionStateMachine,
  sectionId: string,
): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  return {
    ...machine,
    currentSectionId: sectionId,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        visited: true,
        status: section.status === 'not_started' ? 'in_progress' : section.status,
      },
    },
  };
}

export function navigateToNextSection(machine: SectionStateMachine, formatSections: SectionDef[]): SectionStateMachine {
  if (!machine.currentSectionId) return machine;

  const currentIdx = formatSections.findIndex(s => s.id === machine.currentSectionId);
  if (currentIdx < 0 || currentIdx >= formatSections.length - 1) return machine;

  const nextSection = formatSections[currentIdx + 1];
  return navigateToSection(machine, nextSection.id);
}

export function navigateToPreviousSection(machine: SectionStateMachine, formatSections: SectionDef[]): SectionStateMachine {
  if (!machine.currentSectionId) return machine;

  const currentIdx = formatSections.findIndex(s => s.id === machine.currentSectionId);
  if (currentIdx <= 0) return machine;

  const prevSection = formatSections[currentIdx - 1];
  return navigateToSection(machine, prevSection.id);
}

// ─── Rule UCAEM-SB-008: Partial completion ──────────────────────────────────

export function getSectionProgress(machine: SectionStateMachine, sectionId: string): {
  status: SectionExecutionState
  answeredCount: number
  deferredCount: number
  visited: boolean
} {
  const section = machine.sections[sectionId];
  if (!section) {
    return { status: 'not_started', answeredCount: 0, deferredCount: 0, visited: false };
  }

  return {
    status: section.status,
    answeredCount: 0, // caller tracks this
    deferredCount: section.deferredQuestions.length,
    visited: section.visited,
  };
}

// ─── Progress calculation ───────────────────────────────────────────────────

function calculateProgress(
  machine: SectionStateMachine,
  completedSections: string[],
): number {
  const total = Object.keys(machine.sections).length;
  if (total === 0) return 0;
  return Math.round((completedSections.length / total) * 100);
}

// ─── Rule UCAEM-FG-004: Context change — preserve data ─────────────────────

export function handleContextChange(
  machine: SectionStateMachine,
  oldFormat: SectionDef[],
  newFormat: SectionDef[],
): SectionStateMachine {
  const newSections: Record<string, SectionState> = {};

  // Preserve existing section states
  for (const section of newFormat) {
    const existing = machine.sections[section.id];
    newSections[section.id] = existing || {
      sectionId: section.id,
      status: 'not_started',
      visited: false,
      skippedQuestions: [],
      deferredQuestions: [],
    };
  }

  const firstSection = newFormat.length > 0 ? newFormat[0].id : null;
  const currentExists = machine.currentSectionId && newSections[machine.currentSectionId];

  return {
    ...machine,
    sections: newSections,
    currentSectionId: currentExists ? machine.currentSectionId : firstSection,
    overallProgress: calculateProgress(
      { ...machine, sections: newSections },
      machine.completedSections.filter(id => newSections[id] !== undefined),
    ),
    completedSections: machine.completedSections.filter(id => newSections[id] !== undefined),
  };
}

// ─── Rule UCAEM-SB-003: Awaiting information ────────────────────────────────

export function setAwaitingInformation(
  machine: SectionStateMachine,
  sectionId: string,
): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  return {
    ...machine,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        status: 'awaiting_information',
      },
    },
  };
}

// ─── Rule UCAEM-SB-003: Not applicable (terminal) ───────────────────────────

export function setNotApplicable(
  machine: SectionStateMachine,
  sectionId: string,
): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  const newCompleted = [...machine.completedSections, sectionId];

  return {
    ...machine,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        status: 'not_applicable',
        completedAt: Date.now(),
      },
    },
    completedSections: newCompleted,
    overallProgress: calculateProgress(machine, newCompleted),
  };
}

// ─── Rule UCAEM-SB-003: Validated state transitions ─────────────────────────

const VALID_TRANSITIONS: Record<SectionExecutionState, SectionExecutionState[]> = {
  not_started: ['in_progress'],
  in_progress: ['completed', 'completed_with_unknowns', 'completed_patient_declined', 'deferred', 'awaiting_information'],
  awaiting_information: ['in_progress'],
  completed: ['in_progress'],
  completed_with_unknowns: [],
  completed_patient_declined: [],
  deferred: ['in_progress'],
  not_applicable: ['not_started'],
};

export function transitionSectionState(
  machine: SectionStateMachine,
  sectionId: string,
  newState: SectionExecutionState,
): SectionStateMachine {
  const section = machine.sections[sectionId];
  if (!section) return machine;

  const allowed = VALID_TRANSITIONS[section.status];
  if (!allowed.includes(newState)) {
    throw new Error(
      `Invalid state transition: ${section.status} -> ${newState} for section "${sectionId}"`,
    );
  }

  return {
    ...machine,
    sections: {
      ...machine.sections,
      [sectionId]: {
        ...section,
        status: newState,
        completedAt: newState === 'completed' || newState === 'completed_with_unknowns' || newState === 'completed_patient_declined' || newState === 'not_applicable' ? Date.now() : section.completedAt,
      },
    },
  };
}
