import { describe, it, expect } from 'vitest';
import {
  interactionGuarantees,
  shortcutConventions,
} from '@/lib/amexan/interaction/constitution';
import {
  commandPalette,
  searchCommands,
  resolveShortcut,
  registerCommand,
} from '@/lib/amexan/interaction/command-palette';
import {
  keyboardEngine,
  listShortcuts,
  getKeyboardState,
} from '@/lib/amexan/interaction/keyboard-engine';
import {
  undoEngine,
  clearUndo,
  pushUndo,
} from '@/lib/amexan/interaction/undo-engine';
import {
  feedbackEngine,
  emitFeedback,
  dismissFeedback,
  acknowledgeConfirm,
} from '@/lib/amexan/interaction/feedback-engine';
import {
  selectionEngine,
  applySelection,
  clearSelection,
} from '@/lib/amexan/interaction/selection-engine';
import type { DeviceInfo } from '@/lib/amexan/presentation/types';

const device = (overrides: Partial<DeviceInfo> = {}): DeviceInfo => ({
  viewportClass: 'xl',
  width: 1440,
  height: 900,
  heightClass: 'normal',
  orientation: 'landscape',
  pixelDensity: 1,
  pointerType: 'fine',
  interactionMode: 'hover',
  hasKeyboard: true,
  hasScreenReader: false,
  prefersReducedMotion: false,
  prefersHighContrast: false,
  colorScheme: 'light',
  online: true,
  browser: 'chromium',
  touchSupported: false,
  ...overrides,
});

describe('Interaction Constitution', () => {
  it('guarantees undo, shortcuts, feedback, selection, and no dead interaction', () => {
    expect(interactionGuarantees).toContain('undo_supported');
    expect(interactionGuarantees).toContain('no_dead_interaction');
    expect(shortcutConventions.commandPalette).toBe('CTRL + K');
  });
});

describe('Command Palette', () => {
  it('searches commands by keyword with permission gating', () => {
    const results = searchCommands('patient', ['read:patient']);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.action).toBe('open:patient-search');
  });

  it('hides commands the actor lacks permission for', () => {
    const results = searchCommands('order', []);
    expect(results.length).toBe(0);
  });

  it('resolves global shortcuts to commands', () => {
    const cmd = resolveShortcut({ key: 'k', ctrlKey: true, shiftKey: false }, device());
    expect(cmd!.id).toBe('command_palette');
  });

  it('allows registration of custom commands', () => {
    registerCommand({ id: 'custom', title: 'Custom Action', keywords: ['custom'], context: 'global', action: 'run:custom' });
    expect(searchCommands('custom', []).length).toBeGreaterThan(0);
  });
});

describe('Keyboard Engine', () => {
  it('reflects device keyboard support', () => {
    expect(getKeyboardState(device()).hasKeyboard).toBe(true);
    expect(getKeyboardState(device({ hasKeyboard: false })).shortcutsEnabled).toBe(false);
  });

  it('lists shortcuts with global scope always present', () => {
    const clinical = listShortcuts('clinical');
    expect(clinical.some((s) => s.global)).toBe(true);
  });
});

describe('Undo Engine', () => {
  it('supports undo and redo with depth limits', () => {
    let stack: ReturnType<typeof clearUndo>['stack'] = [];
    for (let i = 0; i < 5; i++) {
      stack = pushUndo(stack, { scope: 'form', label: `action ${i}`, reversible: true, redoable: true, payload: i });
    }
    const state = { stack, redoStack: [], depth: stack.length, lastAction: null, canUndo: true, canRedo: false };
    const undone = undoEngine.undo(state);
    expect(undone.undone!.label).toBe('action 4');
    const redone = undoEngine.redo(undone.state);
    expect(redone.redone!.label).toBe('action 4');
  });

  it('cannot undo on an empty stack', () => {
    const result = undoEngine.undo(clearUndo());
    expect(result.undone).toBeNull();
  });
});

describe('Feedback Engine', () => {
  it('emits persistent confirm events that must be acknowledged', () => {
    const state = { events: [], lastEvent: null } as Parameters<typeof emitFeedback>[0];
    const emitted = emitFeedback(state, { mode: 'confirm', message: 'Delete patient?', severity: 'critical', persistent: true });
    const confirmed = acknowledgeConfirm(emitted.state, emitted.event.id);
    expect(confirmed.confirmed).toBe(true);
    expect(confirmed.state.events.length).toBe(0);
  });

  it('dismisses transient feedback', () => {
    const state = { events: [], lastEvent: null } as Parameters<typeof emitFeedback>[0];
    const emitted = emitFeedback(state, { mode: 'toast', message: 'Saved', severity: 'normal' });
    const after = dismissFeedback(emitted.state, emitted.event.id);
    expect(after.events.length).toBe(0);
  });
});

describe('Selection Engine', () => {
  it('supports single and ctrl multi selection', () => {
    const single = applySelection({ mode: 'none', selected: [], lastSelected: null, rangeAnchor: null }, { itemId: 'a', modifier: 'none', available: ['a', 'b', 'c'] });
    expect(single.selected).toEqual(['a']);
    const multi = applySelection(single, { itemId: 'b', modifier: 'ctrl', available: ['a', 'b', 'c'] });
    expect(multi.mode).toBe('multi');
    expect(selectionEngine.isSelected(multi, 'b')).toBe(true);
  });

  it('performs range selection with shift', () => {
    const anchor = applySelection({ mode: 'none', selected: [], lastSelected: null, rangeAnchor: null }, { itemId: 'a', modifier: 'none', available: ['a', 'b', 'c', 'd'] });
    const range = applySelection(anchor, { itemId: 'd', modifier: 'shift', available: ['a', 'b', 'c', 'd'] });
    expect(range.selected).toEqual(['a', 'b', 'c', 'd']);
  });

  it('clears to no selection', () => {
    const state = { mode: 'multi' as const, selected: ['a', 'b'], lastSelected: 'b', rangeAnchor: 'a' };
    expect(clearSelection().selected).toEqual([]);
  });
});
