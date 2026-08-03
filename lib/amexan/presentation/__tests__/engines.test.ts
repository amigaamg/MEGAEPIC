import { describe, it, expect } from 'vitest';
import {
  resolveLayout,
  layoutEngine,
} from '@/lib/amexan/presentation/engine/layout-engine';
import {
  renderWidget,
  renderWidgetsForWorkspace,
  transitionWidgetState,
  assertStateContract,
  widgetEngine,
} from '@/lib/amexan/presentation/engine/widget-engine';
import {
  generateNavigation,
  navigationEngine,
} from '@/lib/amexan/presentation/engine/navigation-engine';
import {
  generateDashboard,
  dashboardEngine,
} from '@/lib/amexan/presentation/engine/dashboard-engine';
import {
  resolveResponsive,
  presentWidget,
  getResponsiveMode,
  responsiveEngine,
} from '@/lib/amexan/presentation/engine/responsive-engine';
import {
  computeAccessibilityProfile,
  auditContrast,
  ensureTouchTargets,
  accessibilityEngine,
} from '@/lib/amexan/presentation/engine/accessibility-engine';
import {
  planMotion,
  hasForbiddenMotion,
  suggestMotion,
  animationEngine,
} from '@/lib/amexan/presentation/engine/animation-engine';
import {
  computeBrandSurface,
  effectiveTheme,
  brandingEngine,
} from '@/lib/amexan/presentation/engine/branding-engine';
import type { DeviceInfo } from '@/lib/amexan/presentation/types';

const device = (overrides: Partial<DeviceInfo> = {}): DeviceInfo => ({
  viewportClass: 'xl',
  width: 1440,
  height: 900,
  heightClass: 'normal',
  orientation: 'landscape',
  pixelDensity: 1,
  pointerType: 'fine',
  interactionMode: 'hover',
  hasKeyboard: true,
  hasScreenReader: false,
  prefersReducedMotion: false,
  prefersHighContrast: false,
  colorScheme: 'light',
  online: true,
  browser: 'chromium',
  touchSupported: false,
  ...overrides,
});

describe('Layout Engine', () => {
  it('resolves a decision from the registry', () => {
    const decision = resolveLayout({ workspaceId: 'ward_round', viewportClass: 'xl' });
    expect(decision.kind).toBe('workspace');
    expect(decision.zones.length).toBeGreaterThan(0);
  });

  it('compacts density on small screens', () => {
    const decision = resolveLayout({ layoutKind: 'dashboard', viewportClass: 'sm' });
    expect(decision.density).toBe('compact');
  });
});

describe('Widget Engine', () => {
  it('renders a widget for a permitted workspace', () => {
    const runtime = renderWidget({ widgetId: 'patient_card', device: device(), role: 'doctor', workspaceId: 'ward_round' });
    expect(runtime).not.toBeNull();
    expect(runtime!.widget.id).toBe('patient_card');
  });

  it('refuses a widget outside its workspace', () => {
    const runtime = renderWidget({ widgetId: 'billing_summary', device: device(), role: 'doctor', workspaceId: 'icu' });
    expect(runtime).toBeNull();
  });

  it('enforces constitutional state transitions', () => {
    const runtime = renderWidget({ widgetId: 'patient_card', device: device(), role: 'doctor', workspaceId: 'ward_round' })!;
    const next = transitionWidgetState(runtime, 'loading');
    expect(next.state).toBe('loading');
    expect(assertStateContract(next)).toBe(true);
  });

  it('assembles all widgets for a workspace', () => {
    const all = renderWidgetsForWorkspace('ward_round', device(), 'doctor');
    expect(all.length).toBeGreaterThan(0);
  });
});

describe('Navigation Engine', () => {
  it('generates role-scoped navigation without reload semantics', () => {
    const tree = generateNavigation({ role: 'doctor', viewportClass: 'xl', permissions: ['read:*'] });
    expect(tree.type).toBe('workspace_navigation');
    expect(tree.items.length).toBeGreaterThan(0);
    expect(navigationEngine).toBeDefined();
  });

  it('limits visible items on mobile', () => {
    const tree = generateNavigation({ role: 'patient', viewportClass: 'xs' });
    const visible = tree.items.filter((i) => !i.hiddenWhen);
    expect(visible.length).toBeLessThanOrEqual(4);
  });
});

describe('Dashboard Engine', () => {
  it('generates a dashboard from role, never coded', () => {
    const dash = generateDashboard({
      id: 'doctor-dash', title: "Today's Work", role: 'doctor', workspaceId: 'ward_round', device: device(),
    });
    expect(dash.widgets.length).toBeGreaterThan(0);
    expect(dashboardEngine.isGenerated(dash)).toBe(true);
  });

  it('adapts layout to viewport', () => {
    const mobile = generateDashboard({ id: 'd', title: 'D', role: 'doctor', workspaceId: 'ward_round', device: device({ viewportClass: 'sm' }) });
    const desktop = generateDashboard({ id: 'd', title: 'D', role: 'doctor', workspaceId: 'ward_round', device: device() });
    expect(mobile.layout.columns).toBe(1);
    expect(desktop.layout.columns).toBeGreaterThanOrEqual(2);
  });
});

describe('Responsive Engine', () => {
  it('maps viewport classes to modes', () => {
    expect(getResponsiveMode(device({ viewportClass: 'sm' }))).toBe('focused');
    expect(getResponsiveMode(device({ viewportClass: 'ultra' }))).toBe('command_center');
  });

  it('hides low priority widgets on phones, keeps critical', () => {
    expect(presentWidget('critical', device({ viewportClass: 'sm' }))).toBe('visible');
    expect(presentWidget('low', device({ viewportClass: 'sm' }))).toBe('hidden');
  });

  it('resolves a full responsive decision', () => {
    const decision = resolveResponsive(device({ viewportClass: 'lg' }), [
      { id: 'a', priority: 'critical' },
      { id: 'b', priority: 'low' },
    ]);
    expect(decision.navigation).toBe('sidebar');
    expect(decision.columns).toBe(2);
  });
});

describe('Accessibility Engine', () => {
  it('computes an accessibility profile honoring device preferences', () => {
    const profile = computeAccessibilityProfile(device({ prefersReducedMotion: true }));
    expect(profile.reducedMotion).toBe(true);
    expect(profile.animDuration(300)).toBe(0);
  });

  it('audits contrast against WCAG AA', () => {
    const violations = auditContrast(device(), [
      { foreground: 'critical', background: 'normal' },
    ]);
    expect(violations[0]!.semantic).toBe('critical');
    expect(violations[0]!.ratio).toBeGreaterThan(0);
  });

  it('flags undersized touch targets', () => {
    const flagged = ensureTouchTargets(device(), [
      { id: 'too-small', width: 32, height: 32 },
      { id: 'fine', width: 64, height: 64 },
    ]);
    expect(flagged).toEqual(['too-small']);
  });
});

describe('Animation Engine', () => {
  it('plans legal motion and flags forbidden motion', () => {
    const plan = planMotion(device(), [
      { animation: 'fade', trigger: 'control' },
      { animation: 'bounce', trigger: 'control' },
    ]);
    expect(plan.items[0]!.legal).toBe(true);
    expect(plan.items[1]!.legal).toBe(false);
    expect(hasForbiddenMotion(plan)).toBe(true);
  });

  it('suggests constitutional motion for state changes', () => {
    const spec = suggestMotion(device(), 'expand');
    expect(animationEngine.suggest).toBeDefined();
    expect(spec.animation).toBe('expand');
  });
});

describe('Branding Engine', () => {
  it('computes a white-label-safe brand surface', () => {
    const surface = computeBrandSurface({ themeId: 'hospital', device: device() });
    expect(surface.brandName).toBe('Hospital');
    expect(surface.whiteLabelSafe).toBe(true);
    expect(brandingEngine.whiteLabelSafe(surface)).toBe(true);
  });

  it('derives theme from organization type', () => {
    expect(effectiveTheme({ organizationType: 'university' })).toBe('university');
    expect(effectiveTheme({ organizationType: 'hospital', themePreference: 'research' })).toBe('research');
    expect(effectiveTheme({})).toBe('amexan-default');
  });
});
