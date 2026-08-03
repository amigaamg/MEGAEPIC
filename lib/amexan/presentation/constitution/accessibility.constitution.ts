// AMEXAN Presentation Constitution - Accessibility
// Version 1.0 (Frozen)
// Constitutional Principle: Everything must satisfy WCAG AA minimum. Every interaction supports keyboard, screen reader, focus, contrast, reduced motion, zoom.

import { getAccessibilityRules } from '../accessibility-constitution';
import { MIN_TOUCH_SIZE } from '../interaction-constitution';
import type { DeviceInfo } from '../types';

export const accessibilityConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Everything must satisfy WCAG AA minimum.',
};

export const accessibilityStandards = {
  wcag: 'AA' as const,
  wcagLargeText: 'AAA' as const,
  keyboard: true,
  screenReader: true,
  focusVisible: true,
  highContrast: true,
  reducedMotion: true,
  zoom: 400,
  touch: true,
  mouse: true,
  stylus: true,
  voice: true,
};

export const inputMethods = [
  'keyboard',
  'mouse',
  'touch',
  'stylus',
  'voice',
  'eye_tracking',
  'switch_control',
] as const;

export const focusVisibility = {
  visibleRing: true,
  ringWidth: 2,
  ringColor: '#2563eb',
  ringOffset: 2,
  noFocusOnMouseClick: true,
} as const;

export const reducedMotionRules = {
  disableAnimations: true,
  keepTransitions: false,
  allowEssentialOnly: true,
} as const;

export const contrastRules = {
  normalText: 4.5,
  largeText: 3.0,
  uiComponents: 3.0,
} as const;

export function getAccessibilitySpec(device: DeviceInfo) {
  const rules = getAccessibilityRules(device);
  return {
    rules,
    standards: accessibilityStandards,
    minTouchSize: MIN_TOUCH_SIZE,
    focus: focusVisibility,
    reducedMotion: rules.reducedMotion,
    contrast: contrastRules,
  };
}
