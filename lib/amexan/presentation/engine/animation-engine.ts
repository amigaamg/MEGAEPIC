// AMEXAN Presentation Engine - Animation Engine
// Constitutional Principle: Motion exists only to explain. Never decorate.
// The engine is the sole authority on whether a motion is legal and how long it runs.

import {
  isAllowedAnimation,
  getAnimationDuration,
  animationEasing,
  animationMaxDurations,
} from '../constitution/animation.constitution';
import type { DeviceInfo } from '../types';

export type MotionTrigger = keyof typeof animationMaxDurations;

export interface MotionSpec {
  animation: string;
  duration: number;
  easing: string;
  justify: string;
  reducedMotion: boolean;
  legal: boolean;
}

export interface MotionPlan {
  items: MotionSpec[];
  violations: string[];
  totalBudgetMs: number;
}

export function planMotion(device: DeviceInfo, requested: { animation: string; trigger: MotionTrigger }[]): MotionPlan {
  const items: MotionSpec[] = [];
  const violations: string[] = [];

  for (const req of requested) {
    const legal = isAllowedAnimation(req.animation);
    const duration = device.prefersReducedMotion ? 0 : getAnimationDuration(req.trigger);
    if (!legal) violations.push(`Forbidden animation: ${req.animation}`);
    items.push({
      animation: req.animation,
      duration,
      easing: animationEasing.standard,
      justify: legal ? 'Constitutional motion for explained state change' : 'NOT ALLOWED',
      reducedMotion: device.prefersReducedMotion,
      legal,
    });
  }

  return { items, violations, totalBudgetMs: items.reduce((sum, i) => sum + i.duration, 0) };
}

export function hasForbiddenMotion(plan: MotionPlan): boolean {
  return plan.violations.length > 0;
}

export function suggestMotion(device: DeviceInfo, change: 'show' | 'hide' | 'expand' | 'collapse' | 'alert' | 'load' | 'transition'): MotionSpec {
  const map: Record<string, { animation: string; trigger: MotionTrigger }> = {
    show: { animation: 'fade', trigger: 'control' },
    hide: { animation: 'fade', trigger: 'control' },
    expand: { animation: 'expand', trigger: 'panel' },
    collapse: { animation: 'collapse', trigger: 'panel' },
    alert: { animation: 'highlight', trigger: 'button' },
    load: { animation: 'skeleton', trigger: 'page' },
    transition: { animation: 'transition', trigger: 'page' },
  };
  const chosen = map[change] ?? map.transition!;
  return planMotion(device, [chosen]).items[0]!;
}

export const animationEngine = {
  plan: planMotion,
  hasForbidden: hasForbiddenMotion,
  suggest: suggestMotion,
  max: (trigger: MotionTrigger) => getAnimationDuration(trigger),
};

export type AnimationEngine = typeof animationEngine;
