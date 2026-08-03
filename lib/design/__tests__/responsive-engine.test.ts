// AMEXAN Design System 4.1 - Responsive Engine Tests
// Verifies: 13 profiles, input detection, breakpoint subscriptions, atLeast/atMost.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getCurrentBreakpoint } from '@/lib/design/tokens/breakpoints';
import { ResponsiveEngine, responsiveProfiles } from '@/lib/design/responsive-engine';

describe('ResponsiveEngine profiles', () => {
  it('exposes all 13 profiles', () => {
    expect(Object.keys(responsiveProfiles)).toHaveLength(13);
  });

  it('starts at nano and ends at xl8', () => {
    expect(responsiveProfiles.nano.min).toBe(240);
    expect(responsiveProfiles.xl8.min).toBe(5120);
  });

  it('matches breakpoints via tokens getCurrentBreakpoint', () => {
    expect(getCurrentBreakpoint(319)).toBe('nano');
    expect(getCurrentBreakpoint(320)).toBe('xs');
    expect(getCurrentBreakpoint(1280)).toBe('xl2');
    expect(getCurrentBreakpoint(2560)).toBe('xl5');
    expect(getCurrentBreakpoint(6000)).toBe('xl8');
  });
});

describe('ResponsiveEngine SSR default', () => {
  let engine: ResponsiveEngine;
  beforeEach(() => {
    engine = new ResponsiveEngine();
  });
  afterEach(() => {
    engine.destroy();
  });

  it('returns a safe SSR default when window is undefined', () => {
    const viewport = engine.getViewport();
    expect(viewport.breakpoint).toBe('xl');
    expect(viewport.inputMode).toBe('mouse');
    expect(viewport.isDesktop).toBe(true);
  });
});

describe('ResponsiveEngine with mocked window', () => {
  let engine: ResponsiveEngine;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches:
        query === '(pointer: coarse)' ||
        query === '(hover: none)' ||
        query === '(orientation: portrait)' ||
        query === '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const mockWindow = {
      innerWidth: 390,
      innerHeight: 844,
      devicePixelRatio: 2,
      matchMedia,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    (globalThis as unknown as { window: Window }).window = mockWindow as unknown as Window;
    engine = new ResponsiveEngine();
  });

  afterEach(() => {
    engine.destroy();
    (globalThis as unknown as { window: typeof window }).window = originalWindow;
  });

  it('detects the mobile profile from innerWidth', () => {
    const viewport = engine.getViewport();
    expect(viewport.breakpoint).toBe('sm');
    expect(viewport.profile.label).toBe('Mobile Standard');
    expect(viewport.isMobile).toBe(true);
  });

  it('detects coarse pointer / touch', () => {
    expect(engine.getViewport().isTouch).toBe(true);
    expect(engine.getViewport().isCoarsePointer).toBe(true);
  });

  it('atLeast/atMost respect profile ordering', () => {
    expect(engine.atLeast('nano')).toBe(true);
    expect(engine.atLeast('xl8')).toBe(false);
    expect(engine.atMost('md')).toBe(true);
  });

  it('subscribes and emits viewport changes', () => {
    const spy = vi.fn();
    const unsub = engine.subscribe(spy);
    expect(spy).toHaveBeenCalled();
    unsub();
  });
});
