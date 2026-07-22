import type { AmxUid } from './types';

export type VerificationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface VerificationState {
  uid: AmxUid;
  currentLevel: VerificationLevel;
  levels: Record<VerificationLevel, VerificationLevelInfo>;
  updatedAt: number;
}

export interface VerificationLevelInfo {
  achieved: boolean;
  achievedAt?: number;
  achievedBy?: string;
  evidence?: string[];
  expiresAt?: number;
}

const LEVEL_LABELS: Record<VerificationLevel, string> = {
  0: 'Anonymous',
  1: 'Email Verified',
  2: 'Government ID Verified',
  3: 'Professional License Verified',
  4: 'Institutional Verified',
  5: 'System Trust',
};

const LEVEL_REQUIREMENTS: Record<VerificationLevel, string[]> = {
  0: [],
  1: ['Valid email address', 'Email verification code'],
  2: ['Government-issued ID (passport, national ID, driver\'s license)', 'Selfie/liveness check', 'Address verification'],
  3: ['Professional license number', 'Council registration number', 'License verification with issuing body', 'Degree certificates', 'Years of experience declaration'],
  4: ['Employment verification letter', 'Organization admin verification', 'Background check', 'Reference check'],
  5: ['System administrator approval', 'Security clearance', 'Biometric enrollment', 'Hardware security key'],
};

export function getVerificationLevelLabel(level: VerificationLevel): string {
  return LEVEL_LABELS[level];
}

export function getVerificationRequirements(level: VerificationLevel): string[] {
  return LEVEL_REQUIREMENTS[level];
}

export function createVerificationState(uid: AmxUid): VerificationState {
  const now = Date.now();
  return {
    uid,
    currentLevel: 0,
    levels: {
      0: { achieved: true, achievedAt: now, achievedBy: 'system' },
      1: { achieved: false },
      2: { achieved: false },
      3: { achieved: false },
      4: { achieved: false },
      5: { achieved: false },
    },
    updatedAt: now,
  };
}

export function upgradeVerificationLevel(
  state: VerificationState,
  level: VerificationLevel,
  achievedBy: string,
  evidence: string[],
): VerificationState {
  if (level <= state.currentLevel) return state;

  const newLevels = { ...state.levels };
  for (let l = state.currentLevel + 1; l <= level; l++) {
    const existingLevel = state.levels[l as VerificationLevel] ?? { achieved: false };
    newLevels[l as VerificationLevel] = {
      ...existingLevel,
      achieved: true,
      achievedAt: Date.now(),
      achievedBy,
      evidence,
    };
  }

  return {
    ...state,
    currentLevel: level as VerificationLevel,
    levels: newLevels,
    updatedAt: Date.now(),
  };
}

export function canAccessFeature(state: VerificationState, requiredLevel: VerificationLevel): boolean {
  return state.currentLevel >= requiredLevel;
}

export function getNextRequiredLevel(state: VerificationState): VerificationLevel | null {
  for (let l = state.currentLevel + 1; l <= 5; l++) {
    const level = l as VerificationLevel;
    if (!state.levels[level]?.achieved) return level;
  }
  return null;
}

export function isVerificationExpired(state: VerificationState, level: VerificationLevel): boolean {
  const info = state.levels[level];
  if (!info?.achieved || !info.expiresAt) return false;
  return Date.now() > info.expiresAt;
}
