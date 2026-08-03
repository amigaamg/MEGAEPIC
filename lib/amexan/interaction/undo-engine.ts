// AMEXAN Interaction Engine - Undo Engine
// Constitutional Principle: Undo is a system-wide guarantee, not an optional feature.

import type { UndoScope } from './constitution';

export interface UndoAction {
  id: string;
  scope: UndoScope;
  label: string;
  timestamp: number;
  reversible: boolean;
  redoable: boolean;
  payload: unknown;
}

export interface UndoState {
  stack: UndoAction[];
  redoStack: UndoAction[];
  depth: number;
  lastAction: UndoAction | null;
  canUndo: boolean;
  canRedo: boolean;
}

const MAX_DEPTH = 50;

export function pushUndo(stack: UndoAction[], action: Omit<UndoAction, 'id' | 'timestamp'>): UndoAction[] {
  const entry: UndoAction = { ...action, id: `${action.scope}-${Date.now()}`, timestamp: Date.now() };
  const next = [...stack, entry];
  return next.length > MAX_DEPTH ? next.slice(next.length - MAX_DEPTH) : next;
}

export function undo(state: UndoState): { state: UndoState; undone: UndoAction | null } {
  if (state.stack.length === 0) return { state, undone: null };
  const undone = state.stack[state.stack.length - 1]!;
  const stack = state.stack.slice(0, -1);
  const redoStack = [...state.redoStack, undone];
  return {
    state: { stack, redoStack, depth: stack.length, lastAction: undone, canUndo: stack.length > 0, canRedo: true },
    undone,
  };
}

export function redo(state: UndoState): { state: UndoState; redone: UndoAction | null } {
  if (state.redoStack.length === 0) return { state, redone: null };
  const redone = state.redoStack[state.redoStack.length - 1]!;
  const redoStack = state.redoStack.slice(0, -1);
  const stack = [...state.stack, redone];
  return {
    state: { stack, redoStack, depth: stack.length, lastAction: redone, canUndo: true, canRedo: redoStack.length > 0 },
    redone,
  };
}

export function clearUndo(): UndoState {
  return { stack: [], redoStack: [], depth: 0, lastAction: null, canUndo: false, canRedo: false };
}

export function undoScopeLabel(action: UndoAction): string {
  return action.label;
}

export const undoEngine = {
  push: pushUndo,
  undo,
  redo,
  clear: clearUndo,
  label: undoScopeLabel,
};

export type UndoEngine = typeof undoEngine;
