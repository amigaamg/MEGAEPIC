// AMEXAN Experience Engine - Focus Engine
// Constitutional Principle: One task at a time. Focus modes adapt to device and role.

import type { DeviceInfo } from '../presentation/types';
import type { FocusMode } from './constitution';

export interface FocusState {
  mode: FocusMode;
  activeTaskId: string | null;
  ambientItems: string[];
  interruptions: 'allowed' | 'deferred' | 'blocked';
  surfaces: 'single' | 'split' | 'multi';
}

export function focusModeFor(device: DeviceInfo, role: string): FocusMode {
  if (device.viewportClass === 'xs' || device.viewportClass === 'sm') return 'focused';
  if (device.viewportClass === 'ultra') return 'command_center';
  if (role === 'doctor' || role === 'nurse') return 'professional';
  return 'productive';
}

export function initialFocus(mode: FocusMode): FocusState {
  return {
    mode,
    activeTaskId: null,
    ambientItems: [],
    interruptions: mode === 'focused' ? 'deferred' : 'allowed',
    surfaces: mode === 'command_center' ? 'multi' : mode === 'focused' ? 'single' : 'split',
  };
}

export function setActiveTask(state: FocusState, taskId: string): FocusState {
  return { ...state, activeTaskId: taskId };
}

export function deferInterruptions(state: FocusState, defer: boolean): FocusState {
  return { ...state, interruptions: defer ? 'deferred' : 'allowed' };
}

export function isFocused(state: FocusState): boolean {
  return state.activeTaskId !== null && state.interruptions !== 'blocked';
}

export const focusEngine = {
  modeFor: focusModeFor,
  init: initialFocus,
  setTask: setActiveTask,
  defer: deferInterruptions,
  focused: isFocused,
};

export type FocusEngine = typeof focusEngine;
