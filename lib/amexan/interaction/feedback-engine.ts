// AMEXAN Interaction Engine - Feedback Engine
// Constitutional Principle: Every interaction produces visible feedback. Nothing is silent.

import type { FeedbackMode } from './constitution';

export interface FeedbackEvent {
  id: string;
  mode: FeedbackMode;
  message: string;
  severity: 'info' | 'normal' | 'warning' | 'critical';
  persistent: boolean;
  timeoutMs: number;
  actions?: { label: string; action: string }[];
}

export interface FeedbackState {
  events: FeedbackEvent[];
  lastEvent: FeedbackEvent | null;
}

export function emitFeedback(
  state: FeedbackState,
  input: { mode: FeedbackMode; message: string; severity: FeedbackEvent['severity']; persistent?: boolean; actions?: FeedbackEvent['actions'] }
): { state: FeedbackState; event: FeedbackEvent } {
  const timeouts: Record<FeedbackMode, number> = {
    toast: 5000,
    snackbar: 8000,
    inline: 0,
    skeleton: 0,
    progress: 0,
    confirm: 0,
    disabled: 0,
  };
  const event: FeedbackEvent = {
    id: `fb-${Date.now()}`,
    mode: input.mode,
    message: input.message,
    severity: input.severity,
    persistent: input.persistent ?? false,
    timeoutMs: input.persistent ? 0 : timeouts[input.mode],
    actions: input.actions,
  };
  const events = [...state.events, event];
  return { state: { events, lastEvent: event }, event };
}

export function dismissFeedback(state: FeedbackState, id: string): FeedbackState {
  return { ...state, events: state.events.filter((e) => e.id !== id) };
}

export function acknowledgeConfirm(state: FeedbackState, id: string): { state: FeedbackState; confirmed: boolean } {
  const target = state.events.find((e) => e.id === id);
  if (!target || target.mode !== 'confirm') return { state, confirmed: false };
  return { state: dismissFeedback(state, id), confirmed: true };
}

export function feedbackIsVisible(event: FeedbackEvent): boolean {
  return event.mode === 'toast' || event.mode === 'snackbar' || event.mode === 'confirm' || event.mode === 'progress';
}

export const feedbackEngine = {
  emit: emitFeedback,
  dismiss: dismissFeedback,
  confirm: acknowledgeConfirm,
  visible: feedbackIsVisible,
};

export type FeedbackEngine = typeof feedbackEngine;
