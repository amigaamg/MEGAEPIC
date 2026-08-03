// AMEXAN Design System 4.1 - Layout, Motion & Accessibility Engine Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLayoutConfig, layoutKinds, workspaceRegions, LayoutEngine } from '@/lib/design/layout-engine';
import { getTheme } from '@/lib/design/theme-engine';
import { MotionEngine, motionLevels } from '@/lib/design/motion-engine';
import {
  AccessibilityEngine,
  accessibilityProfiles,
  profileRequirements,
  isRtlLanguage,
} from '@/lib/design/accessibility-engine';

const theme = getTheme('clinical');

describe('LayoutEngine (7 layouts)', () => {
  it('defines exactly 7 layout kinds', () => {
    expect(layoutKinds).toEqual([
      'shell',
      'public',
      'auth',
      'dashboard',
      'workspace',
      'fullscreen',
      'operations',
    ]);
  });

  it('defines the 6 workspace regions', () => {
    expect(workspaceRegions).toEqual([
      'header',
      'contextBar',
      'navigation',
      'workspace',
      'assistantPanel',
      'statusBar',
    ]);
  });

  it('auth layout is centered and narrow', () => {
    const config = createLayoutConfig(theme, 'auth');
    expect(config.content.maxWidth).toBe('480px');
    expect(config.content.alignment).toBe('center');
    expect(config.regions.navigation?.visible).toBe(false);
  });

  it('workspace layout shows context bar and assistant panel', () => {
    const config = createLayoutConfig(theme, 'workspace');
    expect(config.regions.contextBar?.visible).toBe(true);
    expect(config.regions.assistantPanel?.visible).toBe(true);
    expect(config.container.fullWidth).toBe(true);
  });

  it('fullscreen layout hides navigation and status bar', () => {
    const config = createLayoutConfig(theme, 'fullscreen');
    expect(config.regions.navigation?.visible).toBe(false);
    expect(config.regions.statusBar?.visible).toBe(false);
    expect(config.container.maxWidth).toBe('100%');
  });

  it('grid is responsive across 13 profiles', () => {
    const config = createLayoutConfig(theme, 'shell');
    expect(config.grid.responsive.nano.columns).toBe(1);
    expect(config.grid.responsive.xl8.columns).toBe(24);
  });

  it('LayoutEngine supports switching kinds', () => {
    LayoutEngine.reset();
    const engine = new LayoutEngine(theme, 'auth');
    expect(engine.getKind()).toBe('auth');
    engine.switchKind('operations');
    expect(engine.getKind()).toBe('operations');
    expect(engine.isRegionVisible('contextBar')).toBe(true);
  });

  it('LayoutEngine exposes region lookup', () => {
    LayoutEngine.reset();
    const engine = new LayoutEngine(theme, 'workspace');
    expect(engine.getKind()).toBe('workspace');
    expect(engine.getRegion('header')?.height).toBe(64);
    expect(engine.isRegionVisible('assistantPanel')).toBe(true);
  });
});

describe('MotionEngine (7 levels, limits, forbidden)', () => {
  beforeEach(() => {
    MotionEngine.reset();
  });

  it('defines exactly 7 motion levels', () => {
    expect(Object.keys(motionLevels)).toHaveLength(7);
  });

  it('never exceeds the 400ms hard limit', () => {
    for (const key of Object.keys(motionLevels)) {
      const spec = motionLevels[Number(key) as keyof typeof motionLevels];
      expect(Number(spec.duration)).toBeLessThanOrEqual(400);
    }
  });

  it('flags forbidden motions', () => {
    const engine = new MotionEngine({ onViolation: vi.fn() });
    expect(engine.assertMotionAllowed('confetti')).toBe(false);
    expect(engine.assertMotionAllowed('fade-in')).toBe(true);
  });

  it('suppresses motion under reduced-motion preference', () => {
    const engine = new MotionEngine({ prefersReducedMotion: true });
    const decision = engine.resolve(5);
    expect(decision.realDuration).toBe(0);
    expect(decision.reduced).toBe(true);
  });

  it('caps motion during clinical emergency mode', () => {
    const engine = new MotionEngine({ clinicalEmergencyMode: true });
    const decision = engine.resolve(7);
    expect(decision.emergencySuppressed).toBe(true);
    expect(decision.realDuration).toBeLessThanOrEqual(100);
  });

  it('enforces button max duration', () => {
    const engine = new MotionEngine({ onViolation: vi.fn() });
    expect(engine.maxDurationFor(2)).toBe(80);
    expect(engine.assertDurationWithinLimit(2, 300)).toBe(false);
  });

  it('limits toasts to 3 visible', () => {
    const violations: string[] = [];
    const engine = new MotionEngine({ onViolation: (m) => violations.push(m) });
    engine.registerToast();
    engine.registerToast();
    engine.registerToast();
    engine.registerToast();
    expect(violations.length).toBe(1);
    expect(engine.getToastCount()).toBe(3);
  });
});

describe('AccessibilityEngine (7 profiles, contrast, RTL)', () => {
  beforeEach(() => {
    AccessibilityEngine.reset();
  });

  it('defines 7 user profiles', () => {
    expect(accessibilityProfiles).toEqual([
      'general',
      'lowVision',
      'blind',
      'colorBlind',
      'motor',
      'hearing',
      'cognitive',
    ]);
  });

  it('enforces >=4.5:1 contrast for general profile', () => {
    const engine = new AccessibilityEngine();
    expect(engine.getRequirements().contrastRatioMin).toBe(4.5);
  });

  it('computes WCAG contrast ratios', () => {
    const engine = new AccessibilityEngine();
    const ratio = engine.contrastRatio('#ffffff', '#1E40AF');
    expect(ratio).toBeGreaterThan(4.5);
  });

  it('fails assertContrast for poor contrast pairs', () => {
    const violations: string[] = [];
    const engine = new AccessibilityEngine({ onViolation: (m) => violations.push(m) });
    expect(engine.assertContrast('#CCCCCC', '#FFFFFF')).toBe(false);
    expect(violations.length).toBeGreaterThan(0);
  });

  it('passes assertContrast for accessible pairs', () => {
    const engine = new AccessibilityEngine();
    expect(engine.assertContrast('#111111', '#FFFFFF')).toBe(true);
  });

  it('low vision profile demands 7:1 contrast and zoom to 300%', () => {
    const req = profileRequirements.lowVision;
    expect(req.contrastRatioMin).toBe(7);
    expect(req.zoomMax).toBe(300);
  });

  it('motor profile requires a larger touch target', () => {
    expect(profileRequirements.motor.touchTargetMin).toBe(64);
  });

  it('detects RTL languages', () => {
    expect(isRtlLanguage('ar-EG')).toBe(true);
    expect(isRtlLanguage('he')).toBe(true);
    expect(isRtlLanguage('en-US')).toBe(false);
  });

  it('registers and resolves translations', () => {
    const engine = new AccessibilityEngine();
    engine.registerTranslation('nav.home', 'Home');
    expect(engine.translate('nav.home')).toBe('Home');
    expect(engine.translate('missing')).toBe('missing');
  });
});
