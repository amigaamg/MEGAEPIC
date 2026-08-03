// AMEXAN Presentation Renderer - Dashboard Renderer
// Constitutional Principle: No dashboards coded. Generated. Rendered.
// The renderer turns the Dashboard Object into a mountable section tree.

import type { DeviceInfo } from '../types';
import type { DashboardObject } from '../engine/dashboard-engine';
import type { WidgetRuntime } from '../engine/widget-engine';
import { renderWidgetView, widgetIsRenderable } from './widget-renderer';
import type { RenderedWidget } from './widget-renderer';

export interface RenderedSection {
  id: string;
  title: string;
  priority: string;
  widgets: RenderedWidget[];
  empty: boolean;
}

export interface RenderedDashboard {
  id: string;
  title: string;
  layoutKind: string;
  sections: RenderedSection[];
  quickActions: { label: string; action: string }[];
  toolbar: { search: boolean; command: boolean; notifications: boolean; refresh: boolean };
  empty: boolean;
}

export function renderDashboardView(dashboard: DashboardObject, device: DeviceInfo): RenderedDashboard {
  const sections = dashboard.sections.map((section) => ({
    id: section.id,
    title: section.title,
    priority: section.priority,
    widgets: section.widgets
      .filter(widgetIsRenderable)
      .map((w: WidgetRuntime) => renderWidgetView(w, device)),
    empty: section.widgets.length === 0,
  }));

  return {
    id: dashboard.id,
    title: dashboard.title,
    layoutKind: dashboard.layout.kind,
    sections,
    quickActions: dashboard.quickActions,
    toolbar: dashboard.toolbar,
    empty: dashboard.empty,
  };
}

export function dashboardHasContent(rendered: RenderedDashboard): boolean {
  return rendered.sections.some((s) => s.widgets.length > 0);
}

export const dashboardRenderer = {
  render: renderDashboardView,
  hasContent: dashboardHasContent,
};

export type DashboardRenderer = typeof dashboardRenderer;
