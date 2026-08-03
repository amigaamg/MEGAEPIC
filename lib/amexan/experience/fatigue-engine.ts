// AMEXAN Experience Engine - Fatigue Engine
// Constitutional Principle: The system is fatigue-aware. Long sessions must be supported.

import type { FatigueTier } from './constitution';

export interface FatigueInput {
  sessionMinutes: number;
  consecutiveInteractions: number;
  errorRate: number;
  timeOfDay: number;
  role: string;
}

export interface FatigueDecision {
  tier: FatigueTier;
  reason: string;
  suggestions: string[];
  reduceChrome: boolean;
  simplifyCharts: boolean;
  recommendBreak: boolean;
}

export function assessFatigue(input: FatigueInput): FatigueDecision {
  const longSession = input.sessionMinutes > 120;
  const heavyLoad = input.consecutiveInteractions > 300;
  const highErrors = input.errorRate > 0.12;
  const lateNight = input.timeOfDay >= 22 || input.timeOfDay < 6;

  if (longSession && (heavyLoad || highErrors)) {
    return {
      tier: 'very_fatigued',
      reason: 'Extended session with high interaction load and/or error rate.',
      suggestions: ['Suggest break', 'Reduce visual density', 'Delay non-critical alerts', 'Simplify charts to essential'],
      reduceChrome: true,
      simplifyCharts: true,
      recommendBreak: true,
    };
  }

  if (longSession || heavyLoad || highErrors || lateNight) {
    return {
      tier: 'fatigued',
      reason: 'Session duration, load, or hour indicate reduced capacity.',
      suggestions: ['Reduce ambient information', 'Prioritize critical tasks', 'Offer rest reminder'],
      reduceChrome: true,
      simplifyCharts: false,
      recommendBreak: false,
    };
  }

  return {
    tier: 'alert',
    reason: 'No fatigue indicators present.',
    suggestions: [],
    reduceChrome: false,
    simplifyCharts: false,
    recommendBreak: false,
  };
}

export function fatigueSlowsMotion(tier: FatigueTier): boolean {
  return tier !== 'alert';
}

export function fatigueReducesChrome(tier: FatigueTier): boolean {
  return tier === 'fatigued' || tier === 'very_fatigued';
}

export const fatigueEngine = {
  assess: assessFatigue,
  slowsMotion: fatigueSlowsMotion,
  reducesChrome: fatigueReducesChrome,
};

export type FatigueEngine = typeof fatigueEngine;
