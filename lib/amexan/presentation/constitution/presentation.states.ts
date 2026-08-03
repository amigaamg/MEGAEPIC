// AMEXAN Presentation Constitution - States
// Version 1.0 (Frozen)
// Constitutional Principle: Every widget, workspace, and page declares a universal state machine.

export type ComponentState =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error'
  | 'offline'
  | 'syncing'
  | 'updating'
  | 'disabled'
  | 'permission_denied'
  | 'locked'
  | 'readonly'
  | 'stale'
  | 'hidden';

export const componentStateOrder: ComponentState[] = [
  'loading',
  'ready',
  'empty',
  'error',
  'offline',
  'syncing',
  'updating',
  'disabled',
  'permission_denied',
  'locked',
  'readonly',
  'stale',
  'hidden',
];

export interface StateContract {
  state: ComponentState;
  reason?: string;
  retryable: boolean;
  requiresAttention: boolean;
  blocked: boolean;
  offlineSafe: boolean;
  message?: string;
}

export const componentStatesConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Every widget declares a universal state. No silent states.',
  states: componentStateOrder,
};

// How each state behaves constitutionally.
export const stateContracts: Record<ComponentState, Omit<StateContract, 'state' | 'reason' | 'message'>> = {
  loading: { retryable: false, requiresAttention: false, blocked: true, offlineSafe: true },
  ready: { retryable: false, requiresAttention: false, blocked: false, offlineSafe: true },
  empty: { retryable: false, requiresAttention: false, blocked: false, offlineSafe: true },
  error: { retryable: true, requiresAttention: true, blocked: true, offlineSafe: false },
  offline: { retryable: true, requiresAttention: true, blocked: false, offlineSafe: true },
  syncing: { retryable: false, requiresAttention: false, blocked: false, offlineSafe: true },
  updating: { retryable: false, requiresAttention: false, blocked: true, offlineSafe: false },
  disabled: { retryable: false, requiresAttention: false, blocked: true, offlineSafe: true },
  permission_denied: { retryable: false, requiresAttention: true, blocked: true, offlineSafe: true },
  locked: { retryable: false, requiresAttention: true, blocked: true, offlineSafe: true },
  readonly: { retryable: false, requiresAttention: false, blocked: false, offlineSafe: true },
  stale: { retryable: true, requiresAttention: true, blocked: false, offlineSafe: true },
  hidden: { retryable: false, requiresAttention: false, blocked: false, offlineSafe: true },
};

export function getStateContract(state: ComponentState): StateContract {
  const base = stateContracts[state];
  return { state, ...base };
}

// Transitions that are constitutionally valid. Never skip lifecycle.
export const allowedTransitions: Record<ComponentState, ComponentState[]> = {
  loading: ['ready', 'empty', 'error', 'offline', 'permission_denied', 'updating'],
  ready: ['loading', 'empty', 'error', 'offline', 'syncing', 'stale', 'disabled', 'locked', 'readonly', 'hidden'],
  empty: ['loading', 'ready', 'error', 'hidden'],
  error: ['loading', 'ready', 'offline'],
  offline: ['loading', 'ready', 'syncing'],
  syncing: ['ready', 'stale', 'offline'],
  updating: ['ready', 'error', 'offline'],
  disabled: ['ready', 'hidden'],
  permission_denied: ['ready', 'hidden', 'locked'],
  locked: ['ready', 'hidden'],
  readonly: ['ready', 'hidden'],
  stale: ['loading', 'ready', 'syncing'],
  hidden: ['loading', 'ready'],
};

export function canTransition(from: ComponentState, to: ComponentState): boolean {
  const allowed = allowedTransitions[from];
  return allowed ? allowed.includes(to) : false;
}
