// AMEXAN Design System 4.1 - Token Tests
// Verifies: elevation 0-5, radius 4/8/12/16/24/999, motion 100/150/200/300/500,
// icon sizes 20/24/28/32, 13 responsive profiles.

import { describe, it, expect } from 'vitest';
import { elevationTokens, elevationScale, elevationSemantics, getElevation } from '@/lib/design/tokens/elevation';
import { radiusValues, radiusScale, radiusSemantics, getRadius } from '@/lib/design/tokens/radius';
import {
  motionDurations,
  motionDurationScale,
  motionMaxDurations,
  forbiddenMotions,
  getMotionDuration,
  isForbiddenMotion,
} from '@/lib/design/tokens/motion';
import { iconSizeValues, getIconSize } from '@/lib/design/tokens/icons';
import {
  breakpoints,
  getCurrentBreakpoint,
  breakpointOrder,
  isBreakpointAtLeast,
  isBreakpointAtMost,
} from '@/lib/design/tokens/breakpoints';
import { radiusTokens, animationTokens, getTheme } from '@/lib/design/theme-engine';

describe('Elevation Tokens (0-5)', () => {
  it('defines exactly 6 levels 0-5', () => {
    expect(elevationScale).toEqual([0, 1, 2, 3, 4, 5]);
    expect(Object.keys(elevationTokens)).toHaveLength(6);
  });

  it('level 0 is flat', () => {
    expect(elevationTokens[0]).toBe('none');
  });

  it('getElevation returns a fallback for unknown levels', () => {
    expect(getElevation(9)).toBe(elevationTokens[0]);
  });

  it('semantic elevations map to valid levels', () => {
    expect(elevationSemantics.flat).toBe(0);
    expect(elevationSemantics.overlay).toBe(5);
  });
});

describe('Radius Tokens (4/8/12/16/24/999)', () => {
  it('defines the exact spec scale', () => {
    expect(radiusScale).toEqual([4, 8, 12, 16, 24, 999]);
  });

  it('includes the 16px radius step', () => {
    expect(radiusValues[16]).toBe('16px');
  });

  it('semantic xl is 16', () => {
    expect(radiusSemantics.xl).toBe(16);
    expect(radiusSemantics.pill).toBe(999);
  });

  it('getRadius falls back to 8', () => {
    expect(getRadius(999)).toBe('999px');
    expect(getRadius(7 as never)).toBe('8px');
  });

  it('theme-engine radiusTokens exposes base: 16px for backward compat', () => {
    expect(radiusTokens.base).toBe('16px');
  });
});

describe('Motion Tokens (100/150/200/300/500)', () => {
  it('defines the exact duration scale', () => {
    expect(motionDurationScale).toEqual([100, 150, 200, 300, 500]);
  });

  it('maps every duration to ms strings', () => {
    expect(motionDurations[100]).toBe('100ms');
    expect(motionDurations[500]).toBe('500ms');
  });

  it('theme-engine animationTokens align with the spec', () => {
    expect(animationTokens.duration.micro).toBe('100ms');
    expect(animationTokens.duration.slowest).toBe('500ms');
  });

  it('enforces max durations that never exceed 400ms', () => {
    expect(motionMaxDurations.hardLimit).toBe(400);
    expect(motionMaxDurations.dashboard).toBe(300);
    expect(motionMaxDurations.button).toBe(80);
  });

  it('identifies forbidden clinical motions', () => {
    expect(forbiddenMotions).toContain('bounce');
    expect(forbiddenMotions).toContain('confetti');
    expect(isForbiddenMotion('shake')).toBe(true);
    expect(isForbiddenMotion('fade')).toBe(false);
  });

  it('getMotionDuration falls back to 200ms', () => {
    expect(getMotionDuration(300)).toBe('300ms');
    expect(getMotionDuration(999 as never)).toBe('200ms');
  });
});

describe('Icon Tokens (20/24/28/32)', () => {
  it('defines the exact icon size values', () => {
    expect(iconSizeValues).toEqual([20, 24, 28, 32]);
  });

  it('getIconSize falls back to 24', () => {
    expect(getIconSize(20)).toBe('20px');
    expect(getIconSize(999 as never)).toBe('24px');
  });
});

describe('Breakpoints (13 profiles: nano 240-319 .. wall 2560+)', () => {
  it('defines exactly 13 profiles', () => {
    expect(breakpointOrder).toHaveLength(13);
    expect(Object.keys(breakpoints)).toHaveLength(13);
  });

  it('starts at nano 240px and ends at command wall 5120+', () => {
    expect(breakpoints.nano.min).toBe(240);
    expect(breakpoints.xl8.min).toBe(5120);
    expect(breakpoints.xl8.max).toBe(Infinity);
  });

  it('labels the wall display profile from 2560', () => {
    expect(breakpoints.xl5.label).toBe('Wall Display');
    expect(breakpoints.xl5.min).toBe(2560);
  });

  it('maps widths to the correct profiles', () => {
    expect(getCurrentBreakpoint(240)).toBe('nano');
    expect(getCurrentBreakpoint(300)).toBe('nano');
    expect(getCurrentBreakpoint(360)).toBe('sm');
    expect(getCurrentBreakpoint(768)).toBe('lg');
    expect(getCurrentBreakpoint(1024)).toBe('xl');
    expect(getCurrentBreakpoint(2560)).toBe('xl5');
    expect(getCurrentBreakpoint(5120)).toBe('xl8');
  });

  it('handles order comparisons', () => {
    expect(isBreakpointAtLeast('xl8', 'nano')).toBe(true);
    expect(isBreakpointAtLeast('nano', 'xl8')).toBe(false);
    expect(isBreakpointAtMost('nano', 'xl8')).toBe(true);
    expect(isBreakpointAtMost('xl8', 'nano')).toBe(false);
  });
});

describe('Theme Engine integration', () => {
  it('base theme exposes all 4.1 token families', () => {
    const theme = getTheme('clinical');
    expect(theme.elevation).toBeDefined();
    expect(theme.icons).toBeDefined();
    expect(theme.animations.duration.slowest).toBe('500ms');
    expect(theme.radius.base).toBe('16px');
  });
});
