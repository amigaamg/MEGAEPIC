// AMEXAN Presentation Engine - Dashboard Engine
// Constitutional Principle: No dashboards coded. Generated.
// Identity + Role + Permissions + Subscriptions + Organization + Clinical Context -> Dashboard Object.

import { renderWidgetsForWorkspace } from './widget-engine';
import type { WidgetRuntime } from './widget-engine';
import { resolveLayout } from './layout-engine';
import type { LayoutDecision } from './layout-engine';
import type { DeviceInfo } from '../types';

export interface DashboardSectionSpec {
  id: string;
  title: string;
  widgets: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface DashboardObject {
  id: string;
  title: string;
  layout: LayoutDecision;
  widgets: WidgetRuntime[];
  sections: { id: string; title: string; widgets: WidgetRuntime[]; priority: string }[];
  quickActions: { label: string; action: string }[];
  toolbar: { search: boolean; command: boolean; notifications: boolean; refresh: boolean };
  empty: boolean;
}

export interface DashboardRequest {
  id: string;
  title: string;
  role: string;
  workspaceId: string;
  device: DeviceInfo;
  sections?: DashboardSectionSpec[];
  permissions?: string[];
}

const ROLE_SECTIONS: Record<string, DashboardSectionSpec[]> = {
  doctor: [
    { id: 'ward_round', title: "Today's Ward Round", widgets: ['patient_card', 'clinical_alert'], priority: 'critical' },
    { id: 'pending', title: 'Pending Reviews', widgets: ['task_list', 'clinical_alert'], priority: 'high' },
    { id: 'results', title: 'Investigations', widgets: ['analytics_chart', 'knowledge_explorer'], priority: 'medium' },
  ],
  nurse: [
    { id: 'assigned', title: 'Assigned Patients', widgets: ['patient_card', 'vitals_widget'], priority: 'critical' },
    { id: 'tasks', title: 'Medication & Vitals', widgets: ['medication_list', 'task_list'], priority: 'high' },
  ],
  patient: [
    { id: 'summary', title: 'My Health', widgets: ['patient_card', 'vitals_widget'], priority: 'high' },
    { id: 'appointments', title: 'Appointments', widgets: ['appointment_calendar', 'billing_summary'], priority: 'medium' },
    { id: 'education', title: 'Health Education', widgets: ['education_panel'], priority: 'low' },
  ],
  administrator: [
    { id: 'overview', title: 'Overview', widgets: ['ward_occupancy', 'analytics_chart'], priority: 'critical' },
    { id: 'finance', title: 'Finance', widgets: ['billing_summary', 'analytics_chart'], priority: 'high' },
  ],
  student: [
    { id: 'learning', title: 'Learning', widgets: ['education_panel', 'knowledge_explorer'], priority: 'high' },
  ],
  researcher: [
    { id: 'analytics', title: 'Analytics', widgets: ['analytics_chart', 'knowledge_explorer'], priority: 'high' },
  ],
};

export function generateDashboard(request: DashboardRequest): DashboardObject {
  const sections = request.sections ?? ROLE_SECTIONS[request.role] ?? ROLE_SECTIONS.patient!;
  const layout = resolveLayout({ workspaceId: request.workspaceId, viewportClass: request.device.viewportClass, contentKind: 'dashboard' });

  const widgets: WidgetRuntime[] = [];
  const resolvedSections = sections.map((section) => {
    const sectionWidgets = section.widgets
      .map((widgetId) => {
        const runtime = renderWidgetsForWorkspace(request.workspaceId, request.device, request.role)
          .find((w) => w.widget.id === widgetId);
        if (runtime) widgets.push(runtime);
        return runtime;
      })
      .filter((w): w is WidgetRuntime => w !== null && w !== undefined);
    return { id: section.id, title: section.title, widgets: sectionWidgets, priority: section.priority };
  });

  return {
    id: request.id,
    title: request.title,
    layout,
    widgets,
    sections: resolvedSections,
    quickActions: [
      { label: 'New Note', action: 'new_note' },
      { label: 'Search', action: 'search' },
    ],
    toolbar: { search: true, command: true, notifications: true, refresh: true },
    empty: widgets.length === 0,
  };
}

export function isDashboardGenerated(dashboard: DashboardObject): boolean {
  return dashboard.widgets.every((w) => w.version !== undefined);
}

export const dashboardEngine = {
  generate: generateDashboard,
  isGenerated: isDashboardGenerated,
};

export type DashboardEngine = typeof dashboardEngine;
