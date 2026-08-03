// AMEXAN Presentation Registry - Widget Registry
// Constitutional Principle: The Presentation Engine never imports widgets directly.
// It asks the registry. Registry finds, Renderer draws.

import type { CardPriority, SemanticColor } from '../types';
import type { ComponentState } from '../constitution/presentation.states';

export type WidgetCategory =
  | 'clinical'
  | 'administrative'
  | 'analytics'
  | 'education'
  | 'research'
  | 'communication'
  | 'marketplace'
  | 'configuration'
  | 'identity'
  | 'monitoring'
  | 'billing'
  | 'telemedicine'
  | 'ai'
  | 'workflow';

export interface WidgetDefinition {
  id: string;
  name: string;
  purpose: string;
  category: WidgetCategory;
  priority: CardPriority;
  semanticColor: SemanticColor;
  inputs: string[];
  outputs: string[];
  permissions?: string[];
  states: ComponentState[];
  responsive: {
    desktop: 'full' | 'half' | 'third' | 'quarter';
    tablet: 'full' | 'half';
    phone: 'compact' | 'full';
  };
  accessibility: {
    role: string;
    keyboardNav: boolean;
    ariaLabel: string;
  };
  events?: string[];
  version: string;
}

const WIDGETS: Record<string, WidgetDefinition> = {
  patient_card: {
    id: 'patient_card', name: 'Patient Card', purpose: 'Show a patient summary in one glance.',
    category: 'clinical', priority: 'high', semanticColor: 'info',
    inputs: ['patientId', 'summary'], outputs: ['openPatient'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'third', tablet: 'half', phone: 'full' },
    accessibility: { role: 'article', keyboardNav: true, ariaLabel: 'Patient summary card' },
    version: '1.0',
  },
  vitals_widget: {
    id: 'vitals_widget', name: 'Vitals', purpose: 'Display the latest vital signs.',
    category: 'clinical', priority: 'critical', semanticColor: 'attention',
    inputs: ['patientId', 'vitals'], outputs: ['showVitalsTimeline'],
    states: ['loading', 'ready', 'empty', 'error', 'offline', 'stale'],
    responsive: { desktop: 'third', tablet: 'half', phone: 'compact' },
    accessibility: { role: 'region', keyboardNav: true, ariaLabel: 'Vital signs' },
    version: '1.0',
  },
  medication_list: {
    id: 'medication_list', name: 'Medication List', purpose: 'List current medications with safety checks.',
    category: 'clinical', priority: 'high', semanticColor: 'normal',
    inputs: ['patientId', 'medications'], outputs: ['prescribe', 'reviewInteraction'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'full', tablet: 'half', phone: 'full' },
    accessibility: { role: 'list', keyboardNav: true, ariaLabel: 'Current medications' },
    version: '1.0',
  },
  ward_occupancy: {
    id: 'ward_occupancy', name: 'Ward Occupancy', purpose: 'Show bed status across a ward.',
    category: 'administrative', priority: 'medium', semanticColor: 'inactive',
    inputs: ['wardId'], outputs: ['allocateBed', 'viewWard'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'half', tablet: 'half', phone: 'full' },
    accessibility: { role: 'region', keyboardNav: true, ariaLabel: 'Ward occupancy' },
    version: '1.0',
  },
  appointment_calendar: {
    id: 'appointment_calendar', name: 'Appointments', purpose: 'Manage appointments and bookings.',
    category: 'administrative', priority: 'medium', semanticColor: 'info',
    inputs: ['orgId', 'dateRange'], outputs: ['book', 'reschedule', 'cancel'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'half', tablet: 'half', phone: 'full' },
    accessibility: { role: 'region', keyboardNav: true, ariaLabel: 'Appointments calendar' },
    version: '1.0',
  },
  clinical_alert: {
    id: 'clinical_alert', name: 'Clinical Alert', purpose: 'Surface urgent clinical notifications.',
    category: 'clinical', priority: 'critical', semanticColor: 'critical',
    inputs: ['alerts'], outputs: ['acknowledge', 'escalate'],
    states: ['ready', 'empty', 'error', 'disabled'],
    responsive: { desktop: 'full', tablet: 'full', phone: 'full' },
    accessibility: { role: 'alert', keyboardNav: true, ariaLabel: 'Clinical alerts' },
    version: '1.0',
  },
  ai_assistant: {
    id: 'ai_assistant', name: 'AI Assistant', purpose: 'Provide explainable AI assistance in context.',
    category: 'ai', priority: 'low', semanticColor: 'education',
    inputs: ['context', 'patientId'], outputs: ['explain', 'summarize', 'suggest'],
    states: ['loading', 'ready', 'empty', 'error', 'disabled'],
    responsive: { desktop: 'third', tablet: 'half', phone: 'compact' },
    accessibility: { role: 'complementary', keyboardNav: true, ariaLabel: 'AI assistant' },
    version: '1.0',
  },
  education_panel: {
    id: 'education_panel', name: 'Education Panel', purpose: 'Expose contextual learning without redesign.',
    category: 'education', priority: 'low', semanticColor: 'education',
    inputs: ['diagnosis', 'role'], outputs: ['openGuideline', 'openEvidence', 'openPearls'],
    states: ['loading', 'ready', 'empty', 'error'],
    responsive: { desktop: 'third', tablet: 'half', phone: 'compact' },
    accessibility: { role: 'complementary', keyboardNav: true, ariaLabel: 'Education panel' },
    version: '1.0',
  },
  notification_bell: {
    id: 'notification_bell', name: 'Notifications', purpose: 'Group and prioritize notifications.',
    category: 'communication', priority: 'medium', semanticColor: 'attention',
    inputs: ['notifications'], outputs: ['openInbox', 'acknowledge'],
    states: ['ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'full', tablet: 'full', phone: 'compact' },
    accessibility: { role: 'button', keyboardNav: true, ariaLabel: 'Notifications' },
    version: '1.0',
  },
  analytics_chart: {
    id: 'analytics_chart', name: 'Analytics Chart', purpose: 'Render a constitutional chart.',
    category: 'analytics', priority: 'medium', semanticColor: 'education',
    inputs: ['series', 'chartType'], outputs: ['export', 'drilldown'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'full', tablet: 'half', phone: 'compact' },
    accessibility: { role: 'img', keyboardNav: false, ariaLabel: 'Analytics chart' },
    version: '1.0',
  },
  knowledge_explorer: {
    id: 'knowledge_explorer', name: 'Knowledge Explorer', purpose: 'Browse guidelines and protocols.',
    category: 'education', priority: 'low', semanticColor: 'education',
    inputs: ['query'], outputs: ['openGuideline', 'openProtocol'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'full', tablet: 'half', phone: 'full' },
    accessibility: { role: 'search', keyboardNav: true, ariaLabel: 'Knowledge explorer' },
    version: '1.0',
  },
  telemedicine_session: {
    id: 'telemedicine_session', name: 'Telemedicine Session', purpose: 'Run a remote consultation.',
    category: 'telemedicine', priority: 'high', semanticColor: 'attention',
    inputs: ['sessionId'], outputs: ['join', 'leave', 'record'],
    states: ['loading', 'ready', 'error', 'offline'],
    responsive: { desktop: 'half', tablet: 'half', phone: 'full' },
    accessibility: { role: 'region', keyboardNav: true, ariaLabel: 'Telemedicine session' },
    version: '1.0',
  },
  billing_summary: {
    id: 'billing_summary', name: 'Billing Summary', purpose: 'Show billing and insurance status.',
    category: 'billing', priority: 'low', semanticColor: 'inactive',
    inputs: ['patientId'], outputs: ['viewInvoice', 'fileClaim'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'third', tablet: 'half', phone: 'full' },
    accessibility: { role: 'region', keyboardNav: true, ariaLabel: 'Billing summary' },
    version: '1.0',
  },
  identity_badge: {
    id: 'identity_badge', name: 'Identity Badge', purpose: 'Show who is acting in the system.',
    category: 'identity', priority: 'medium', semanticColor: 'info',
    inputs: ['identity', 'membership'], outputs: ['switchContext', 'openProfile'],
    states: ['ready', 'error', 'disabled'],
    responsive: { desktop: 'full', tablet: 'full', phone: 'compact' },
    accessibility: { role: 'button', keyboardNav: true, ariaLabel: 'Current user' },
    version: '1.0',
  },
  task_list: {
    id: 'task_list', name: 'Task List', purpose: 'Surface pending work items.',
    category: 'workflow', priority: 'high', semanticColor: 'attention',
    inputs: ['tasks'], outputs: ['complete', 'assign', 'escalate'],
    states: ['loading', 'ready', 'empty', 'error', 'offline'],
    responsive: { desktop: 'half', tablet: 'half', phone: 'full' },
    accessibility: { role: 'list', keyboardNav: true, ariaLabel: 'Tasks' },
    version: '1.0',
  },
};

export function getWidget(id: string): WidgetDefinition | undefined {
  return WIDGETS[id];
}

export function findWidgets(category?: WidgetCategory): WidgetDefinition[] {
  const all = Object.values(WIDGETS);
  return category ? all.filter((w) => w.category === category) : all;
}

export function listWidgetsByPriority(): Record<CardPriority, WidgetDefinition[]> {
  return {
    critical: Object.values(WIDGETS).filter((w) => w.priority === 'critical'),
    high: Object.values(WIDGETS).filter((w) => w.priority === 'high'),
    medium: Object.values(WIDGETS).filter((w) => w.priority === 'medium'),
    low: Object.values(WIDGETS).filter((w) => w.priority === 'low'),
  };
}

export function widgetWorksIn(widgetId: string, workspaceId: string): boolean {
  const widget = WIDGETS[widgetId];
  if (!widget) return false;
  const map: Record<string, string[]> = {
    patient_card: ['ward_round', 'clinic', 'icu', 'telemedicine', 'patient_portal', 'emergency'],
    vitals_widget: ['ward_round', 'icu', 'clinic', 'emergency', 'patient_portal', 'telemedicine'],
    medication_list: ['ward_round', 'clinic', 'icu', 'pharmacy'],
    ward_occupancy: ['ward_round', 'administration', 'executive'],
    appointment_calendar: ['clinic', 'patient_portal', 'administration'],
    clinical_alert: ['*'],
    ai_assistant: ['*'],
    education_panel: ['learning', 'clinic', 'ward_round'],
    notification_bell: ['*'],
    analytics_chart: ['executive', 'research', 'administration', 'public_health'],
    knowledge_explorer: ['learning', 'research', 'clinic'],
    telemedicine_session: ['telemedicine', 'clinic'],
    billing_summary: ['billing', 'administration', 'patient_portal'],
    identity_badge: ['*'],
    task_list: ['*'],
  };
  const workspaces = map[widgetId];
  if (!workspaces) return false;
  return workspaces.includes('*') || workspaces.includes(workspaceId);
}

export const widgetRegistry = {
  get: getWidget,
  find: findWidgets,
  byPriority: listWidgetsByPriority,
  worksIn: widgetWorksIn,
  all: () => Object.values(WIDGETS),
  count: () => Object.keys(WIDGETS).length,
};

export type WidgetRegistry = typeof widgetRegistry;
