// AMEXAN Interaction Engine - Keyboard Engine
// Constitutional Principle: Full keyboard access is a guarantee, not a feature.

import type { DeviceInfo } from '../presentation/types';

export interface KeyboardShortcut {
  keys: string;
  scope: string;
  description: string;
  action: string;
  global?: boolean;
}

export interface KeyboardState {
  hasKeyboard: boolean;
  focusTrapped: boolean;
  visibleFocus: boolean;
  shortcutsEnabled: boolean;
  lastFocusedScope: string | null;
}

const SHORTCUTS: KeyboardShortcut[] = [
  { keys: 'Ctrl+K', scope: 'global', description: 'Open command palette', action: 'command_palette', global: true },
  { keys: 'Ctrl+P', scope: 'global', description: 'Search', action: 'search', global: true },
  { keys: 'Ctrl+O', scope: 'clinical', description: 'Open orders', action: 'orders', global: true },
  { keys: 'Ctrl+D', scope: 'clinical', description: 'Documentation', action: 'documentation', global: true },
  { keys: 'Ctrl+S', scope: 'document', description: 'Save', action: 'save' },
  { keys: 'Ctrl+Z', scope: 'global', description: 'Undo', action: 'undo', global: true },
  { keys: 'Ctrl+Shift+Z', scope: 'global', description: 'Redo', action: 'redo', global: true },
  { keys: 'Escape', scope: 'global', description: 'Close / cancel', action: 'dismiss', global: true },
  { keys: 'Tab', scope: 'global', description: 'Move focus', action: 'focus_next', global: true },
];

export function getKeyboardState(device: DeviceInfo): KeyboardState {
  return {
    hasKeyboard: device.hasKeyboard,
    focusTrapped: false,
    visibleFocus: true,
    shortcutsEnabled: device.hasKeyboard,
    lastFocusedScope: null,
  };
}

export function listShortcuts(scope?: string): KeyboardShortcut[] {
  return scope ? SHORTCUTS.filter((s) => s.scope === scope || s.global) : SHORTCUTS;
}

export function registerShortcut(shortcut: KeyboardShortcut): void {
  SHORTCUTS.push(shortcut);
}

export function focusIsVisible(state: KeyboardState): boolean {
  return state.visibleFocus;
}

export function trapFocus(state: KeyboardState, trap: boolean): KeyboardState {
  return { ...state, focusTrapped: trap };
}

export const keyboardEngine = {
  state: getKeyboardState,
  list: listShortcuts,
  register: registerShortcut,
  visible: focusIsVisible,
  trap: trapFocus,
};

export type KeyboardEngine = typeof keyboardEngine;
