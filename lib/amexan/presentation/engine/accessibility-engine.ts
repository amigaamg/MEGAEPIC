// AMEXAN Presentation Engine - Accessibility Engine
// Constitutional Principle: Accessibility is a hard guarantee, not a feature.
// The engine computes a single accessibility profile for the device and context.

import type { DeviceInfo, SemanticColor } from '../types';
import {
  getAccessibilityRules,
  validateContrast,
  getFontSize,
  shouldReduceMotion,
  getAnimDuration,
} from '../accessibility-constitution';
import { getColor } from '../color-constitution';

export interface AccessibilityProfile {
  rules: ReturnType<typeof getAccessibilityRules>;
  contrast: {
    text: { passes: boolean; ratio: number; minimum: number };
    largeText: { passes: boolean; ratio: number; minimum: number };
    interactive: { passes: boolean; ratio: number; minimum: number };
  };
  fontSize: Record<'base' | 'small' | 'large' | 'display', number>;
  reducedMotion: boolean;
  animDuration: (baseMs: number) => number;
  focusRing: { enabled: boolean; width: number; offset: number };
  keyboardShortcuts: boolean;
  screenReader: { enabled: boolean; liveRegion: boolean; labelDescribedBy: boolean };
}

export interface ContrastViolation {
  semantic: SemanticColor;
  foreground: string;
  background: string;
  passes: boolean;
  ratio: number;
}

export function computeAccessibilityProfile(device: DeviceInfo): AccessibilityProfile {
  const rules = getAccessibilityRules(device);
  const bg = getColor('inactive', device, 'bg');
  const text = getColor('info', device, 'contrast');
  return {
    rules,
    contrast: {
      text: validateContrast(text, bg, false),
      largeText: validateContrast(text, bg, true),
      interactive: validateContrast(getColor('info', device, 'base'), bg, false),
    },
    fontSize: {
      base: getFontSize(device, 'base'),
      small: getFontSize(device, 'small'),
      large: getFontSize(device, 'large'),
      display: getFontSize(device, 'display'),
    },
    reducedMotion: shouldReduceMotion(device),
    animDuration: (baseMs: number) => getAnimDuration(device, baseMs),
    focusRing: { enabled: true, width: 3, offset: 2 },
    keyboardShortcuts: device.hasKeyboard,
    screenReader: {
      enabled: device.hasScreenReader,
      liveRegion: true,
      labelDescribedBy: true,
    },
  };
}

export function auditContrast(device: DeviceInfo, pairs: { foreground: SemanticColor; background: SemanticColor }[]): ContrastViolation[] {
  return pairs.map((pair) => {
    const fg = getColor(pair.foreground, device, 'base');
    const bgc = getColor(pair.background, device, 'bg');
    return { semantic: pair.foreground, foreground: fg, background: bgc, ...validateContrast(fg, bgc, false) };
  });
}

export function ensureTouchTargets(device: DeviceInfo, targets: { id: string; width: number; height: number }[]): string[] {
  const min = getAccessibilityRules(device).touchTarget;
  return targets.filter((t) => t.width < min || t.height < min).map((t) => t.id);
}

export function isAccessibleComposition(device: DeviceInfo, composition: { focusable: boolean; labels: boolean; contrast: boolean; motion: boolean }): boolean {
  const rules = getAccessibilityRules(device);
  if (rules.screenReader && !composition.labels) return false;
  if (rules.keyboardNav && !composition.focusable) return false;
  if (!composition.contrast) return false;
  if (rules.reducedMotion && !composition.motion) return false;
  return true;
}

export const accessibilityEngine = {
  profile: computeAccessibilityProfile,
  audit: auditContrast,
  touchTargets: ensureTouchTargets,
  accessible: isAccessibleComposition,
};

export type AccessibilityEngine = typeof accessibilityEngine;
