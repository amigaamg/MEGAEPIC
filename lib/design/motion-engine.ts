// AMEXAN Motion & Interaction Engine
// Constitutional Principle: Motion is communication only. Never decoration.
// Spec: 7 motion levels, max timings (button 50-80ms .. dashboard 300ms, never >400ms),
// forbidden motions (bounce/spin/flash/shake/confetti), skeleton loading preferred,
// max 3 toasts, 60 FPS, reduced-motion + clinical emergency mode.

import {
  motionMaxDurations,
  forbiddenMotions,
  isForbiddenMotion,
} from './tokens/motion';
import type { MotionDuration, MotionEasing } from './tokens/motion';

export type MotionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface MotionSpec {
  level: MotionLevel;
  duration: MotionDuration;
  easing: MotionEasing;
  description: string;
}

export const motionLevels: Record<MotionLevel, MotionSpec> = {
  1: { level: 1, duration: 100, easing: 'sharp', description: 'Instant feedback (focus, hover, pressed)' },
  2: { level: 2, duration: 150, easing: 'standard', description: 'Micro controls (buttons, toggles, chips)' },
  3: { level: 3, duration: 200, easing: 'standard', description: 'Controls (menus, popovers, dropdowns)' },
  4: { level: 4, duration: 200, easing: 'decelerate', description: 'Panels (drawers, toasts, tooltips)' },
  5: { level: 5, duration: 300, easing: 'decelerate', description: 'Views (tabs, modals, transitions)' },
  6: { level: 6, duration: 300, easing: 'decelerate', description: 'Pages (route transitions, expansions)' },
  7: { level: 7, duration: 300, easing: 'standard', description: 'Emphasis (only for attention-critical states)' },
};

export interface MotionEngineOptions {
  prefersReducedMotion?: boolean;
  clinicalEmergencyMode?: boolean;
  onViolation?: (message: string) => void;
}

export interface MotionDecision {
  duration: number;
  easing: MotionEasing;
  realDuration: number;
  reduced: boolean;
  emergencySuppressed: boolean;
}

export class MotionEngine {
  private static instance: MotionEngine;
  private options: MotionEngineOptions;
  private toasts: number[] = [];
  private emergencyUntil: number | null = null;

  constructor(options: MotionEngineOptions = {}) {
    if (MotionEngine.instance) {
      return MotionEngine.instance;
    }
    this.options = options;
    MotionEngine.instance = this;
  }

  public setOptions = (options: MotionEngineOptions): void => {
    this.options = { ...this.options, ...options };
  };

  public prefersReducedMotion = (): boolean => {
    if (this.options.prefersReducedMotion !== undefined) return this.options.prefersReducedMotion;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  };

  public emergencyModeActive = (): boolean => {
    if (this.emergencyUntil && Date.now() < this.emergencyUntil) return true;
    return this.options.clinicalEmergencyMode === true;
  };

  public enterEmergencyMode = (durationMs = 60_000): void => {
    this.emergencyUntil = Date.now() + durationMs;
  };

  public exitEmergencyMode = (): void => {
    this.emergencyUntil = null;
  };

  public resolve = (level: MotionLevel): MotionDecision => {
    const spec = motionLevels[level] || motionLevels[3];
    const reduced = this.prefersReducedMotion();
    const emergency = this.emergencyModeActive();
    const duration = spec.duration;
    const realDuration = reduced ? 0 : emergency ? Math.min(duration, 100) : duration;
    return {
      duration,
      easing: spec.easing,
      realDuration,
      reduced,
      emergencySuppressed: emergency,
    };
  };

  public duration = (level: MotionLevel): number => {
    return this.resolve(level).realDuration;
  };

  public easing = (level: MotionLevel): MotionEasing => {
    return motionLevels[level]?.easing || 'standard';
  };

  public assertMotionAllowed = (motion: string): boolean => {
    if (isForbiddenMotion(motion)) {
      this.options.onViolation?.(`[MotionEngine] Forbidden motion "${motion}"`);
      return false;
    }
    return true;
  };

  public assertDurationWithinLimit = (level: MotionLevel, duration: number): boolean => {
    const limit = this.maxDurationFor(level);
    if (duration > limit) {
      this.options.onViolation?.(`[MotionEngine] Duration ${duration}ms exceeds limit ${limit}ms for level ${level}`);
      return false;
    }
    return true;
  };

  public maxDurationFor = (level: MotionLevel): number => {
    if (level <= 2) return motionMaxDurations.button;
    if (level <= 4) return motionMaxDurations.panel;
    if (level <= 6) return motionMaxDurations.page;
    return motionMaxDurations.dashboard;
  };

  public registerToast = (): void => {
    this.toasts.push(Date.now());
    if (this.toasts.length > 3) {
      this.options.onViolation?.('[MotionEngine] More than 3 toasts visible');
    }
    while (this.toasts.length > 3) this.toasts.shift();
  };

  public unregisterToast = (): void => {
    this.toasts.shift();
  };

  public getToastCount = (): number => {
    return this.toasts.length;
  };

  public static getInstance(options?: MotionEngineOptions): MotionEngine {
    if (!MotionEngine.instance && options) {
      return new MotionEngine(options);
    }
    return MotionEngine.instance;
  }

  public static reset(): void {
    MotionEngine.instance = undefined as unknown as MotionEngine;
  }
}

export const motionEngine = MotionEngine.getInstance();
export default motionEngine;

export { forbiddenMotions, motionMaxDurations };
