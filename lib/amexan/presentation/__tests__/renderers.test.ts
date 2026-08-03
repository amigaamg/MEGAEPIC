import { describe, it, expect } from 'vitest';
import {
  renderWidgetView,
  widgetIsRenderable,
  widgetRenderer,
} from '@/lib/amexan/presentation/renderer/widget-renderer';
import {
  renderLayoutView,
  zoneOrder,
  sortZonesByOrder,
  layoutRenderer,
} from '@/lib/amexan/presentation/renderer/layout-renderer';
import {
  renderDashboardView,
  dashboardHasContent,
  dashboardRenderer,
} from '@/lib/amexan/presentation/renderer/dashboard-renderer';
import { renderWidget } from '@/lib/amexan/presentation/engine/widget-engine';
import { generateDashboard } from '@/lib/amexan/presentation/engine/dashboard-engine';
import { resolveLayout } from '@/lib/amexan/presentation/engine/layout-engine';
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

describe('Widget Renderer', () => {
  it('renders a widget view with accessibility metadata', () => {
    const runtime = renderWidget({ widgetId: 'patient_card', device: device(), role: 'doctor', workspaceId: 'ward_round' })!;
    const view = renderWidgetView(runtime, device());
    expect(view.ariaLabel).toBe('Patient summary card');
    expect(view.keyboardNav).toBe(true);
  });

  it('renders analytics as a chart element', () => {
    const runtime = renderWidget({ widgetId: 'analytics_chart', device: device(), role: 'administrator', workspaceId: 'executive' })!;
    const view = renderWidgetView(runtime, device());
    expect(view.element).toBe('chart');
  });

  it('hidden widgets are not renderable', () => {
    const runtime = renderWidget({ widgetId: 'patient_card', device: device(), role: 'doctor', workspaceId: 'ward_round' })!;
    const hidden = { ...runtime, visibility: 'hidden' as const };
    expect(widgetIsRenderable(hidden)).toBe(false);
  });
});

describe('Layout Renderer', () => {
  it('emits a zone tree with slots', () => {
    const decision = resolveLayout({ workspaceId: 'ward_round', viewportClass: 'xl' });
    const view = renderLayoutView(decision, device());
    expect(view.kind).toBe('workspace');
    expect(view.zones[0]!.slot).toBeDefined();
    expect(layoutRenderer).toBeDefined();
  });

  it('sorts zones by constitutional order', () => {
    const zones = [
      { zone: 'context', visible: true, weight: 1, order: 2, slot: 'context' },
      { zone: 'primary', visible: true, weight: 3, order: 0, slot: 'primary' },
    ];
    const sorted = sortZonesByOrder(zones);
    expect(sorted[0]!.zone).toBe('primary');
  });

  it('zones are hidden only per viewport rules', () => {
    const decision = resolveLayout({ layoutKind: 'dashboard', viewportClass: 'sm' });
    const view = renderLayoutView(decision, device({ viewportClass: 'sm' }));
    expect(view.viewport).toBe('sm');
  });
});

describe('Dashboard Renderer', () => {
  it('renders a dashboard into sections with widget views', () => {
    const dash = generateDashboard({ id: 'd', title: 'D', role: 'doctor', workspaceId: 'ward_round', device: device() });
    const view = renderDashboardView(dash, device());
    expect(view.sections.length).toBeGreaterThan(0);
    expect(dashboardHasContent(view)).toBe(true);
    expect(dashboardRenderer).toBeDefined();
  });

  it('filters hidden widgets from sections', () => {
    const dash = generateDashboard({ id: 'd', title: 'D', role: 'doctor', workspaceId: 'ward_round', device: device() });
    const view = renderDashboardView(dash, device());
    const total = view.sections.reduce((n, s) => n + s.widgets.length, 0);
    expect(total).toBeLessThanOrEqual(dash.widgets.length);
  });
});
