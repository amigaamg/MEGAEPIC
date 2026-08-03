// AMEXAN Interaction Engine - Selection Engine
// Constitutional Principle: Selection is accessible and predictable.

import type { DeviceInfo } from '../presentation/types';

export interface SelectionState {
  mode: 'none' | 'single' | 'multi';
  selected: string[];
  lastSelected: string | null;
  rangeAnchor: string | null;
}

export interface SelectionUpdate {
  itemId: string;
  modifier: 'none' | 'shift' | 'ctrl' | 'meta';
  available: string[];
}

export function selectionAllowed(device: DeviceInfo, scope: string): boolean {
  if (device.viewportClass === 'xs' || device.viewportClass === 'sm') {
    return scope === 'form' || scope === 'list';
  }
  return true;
}

export function applySelection(state: SelectionState, update: SelectionUpdate): SelectionState {
  const { itemId, modifier } = update;

  if (state.mode === 'none') {
    return { mode: 'single', selected: [itemId], lastSelected: itemId, rangeAnchor: itemId };
  }

  if (modifier === 'ctrl' || modifier === 'meta') {
    const selected = state.selected.includes(itemId)
      ? state.selected.filter((id) => id !== itemId)
      : [...state.selected, itemId];
    return {
      mode: selected.length > 1 ? 'multi' : 'single',
      selected,
      lastSelected: itemId,
      rangeAnchor: state.rangeAnchor ?? itemId,
    };
  }

  if (modifier === 'shift' && state.rangeAnchor) {
    const anchor = state.rangeAnchor;
    const start = update.available.indexOf(anchor);
    const end = update.available.indexOf(itemId);
    if (start !== -1 && end !== -1) {
      const range = update.available.slice(Math.min(start, end), Math.max(start, end) + 1);
      return { mode: 'multi', selected: range, lastSelected: itemId, rangeAnchor: anchor };
    }
  }

  return { mode: 'single', selected: [itemId], lastSelected: itemId, rangeAnchor: itemId };
}

export function clearSelection(): SelectionState {
  return { mode: 'none', selected: [], lastSelected: null, rangeAnchor: null };
}

export function isSelected(state: SelectionState, itemId: string): boolean {
  return state.selected.includes(itemId);
}

export const selectionEngine = {
  allowed: selectionAllowed,
  apply: applySelection,
  clear: clearSelection,
  isSelected,
};

export type SelectionEngine = typeof selectionEngine;
