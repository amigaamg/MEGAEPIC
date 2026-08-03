// AMEXAN Interaction Engine - Barrel
// Constitutional Principle: The UI never reasons. Every interaction routes through engines.

export { interactionConstitution, interactionGuarantees, shortcutConventions, feedbackModes, undoScopes } from './constitution';
export type { InteractionGuarantee, FeedbackMode, UndoScope } from './constitution';

export { commandPalette, registerCommand, searchCommands, resolveShortcut } from './command-palette';
export type { Command, CommandRegistration, CommandPalette } from './command-palette';

export { keyboardEngine, getKeyboardState, listShortcuts, registerShortcut, focusIsVisible, trapFocus } from './keyboard-engine';
export type { KeyboardShortcut, KeyboardState, KeyboardEngine } from './keyboard-engine';

export { undoEngine, pushUndo, undo, redo, clearUndo, undoScopeLabel } from './undo-engine';
export type { UndoAction, UndoState, UndoEngine } from './undo-engine';

export { feedbackEngine, emitFeedback, dismissFeedback, acknowledgeConfirm, feedbackIsVisible } from './feedback-engine';
export type { FeedbackEvent, FeedbackState, FeedbackEngine } from './feedback-engine';

export { selectionEngine, selectionAllowed, applySelection, clearSelection, isSelected } from './selection-engine';
export type { SelectionState, SelectionUpdate, SelectionEngine } from './selection-engine';
