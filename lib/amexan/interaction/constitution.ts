// AMEXAN Interaction Constitution
// Version 1.0 (Frozen)
// Constitutional Principle: The UI never reasons. Every interaction routes through engines.

export const interactionConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'The UI never reasons. Every interaction routes through engines.',
  guarantees: {
    undo: true,
    consistentShortcuts: true,
    visibleFeedback: true,
    accessibleSelection: true,
    noDeadInteraction: true,
  } as const,
};

export const interactionGuarantees = [
  'undo_supported',
  'consistent_shortcuts',
  'visible_feedback',
  'accessible_selection',
  'no_dead_interaction',
] as const;

export type InteractionGuarantee = (typeof interactionGuarantees)[number];

export const shortcutConventions = {
  globalPrefix: 'CTRL +',
  confirm: 'CTRL + SHIFT + ENTER',
  commandPalette: 'CTRL + K',
  search: 'CTRL + P',
  save: 'CTRL + S',
  undo: 'CTRL + Z',
  redo: 'CTRL + SHIFT + Z',
} as const;

export const feedbackModes = [
  'toast',
  'snackbar',
  'inline',
  'skeleton',
  'progress',
  'confirm',
  'disabled',
] as const;

export type FeedbackMode = (typeof feedbackModes)[number];

export const undoScopes = [
  'document',
  'form',
  'workflow',
  'system',
] as const;

export type UndoScope = (typeof undoScopes)[number];
