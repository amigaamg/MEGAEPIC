// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DASHBOARD GENERATION ENGINE (BOOK VIII — Dashboard Constitution)
//
// The dashboard is never stored. It is generated on every login from:
//   Actor × Organization × Role × Department × Current Tasks × Patients ×
//   Permissions × Notifications × AI × Preferences × Subscriptions
//
// Every login generates a unique workspace. No separate apps are hardcoded.
//
// Pure and deterministic. Persistence is orchestrated by the conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { DashboardWidget, GeneratedDashboard } from './types';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface DashboardInput {
  actorId: AmxUid;
  organizationId?: string;
  departmentId?: string;
  role: string;
  roleLevel: number;
  pendingTasks: number;
  assignedPatients: string[];
  openEncounters: string[];
  unreadNotifications: number;
  criticalAlerts: number;
  permissions: string[];
  quickActions?: string[];
  customData?: Record<string, Record<string, unknown>>;
}

export class DashboardEngine {
  static generate(input: DashboardInput): GeneratedDashboard {
    const widgets: DashboardWidget[] = [];
    let priority = 10;

    // Alerts & notifications — highest priority, always present.
    widgets.push(DashboardEngine.widget('alerts', 'Critical Alerts', { count: input.criticalAlerts }, priority));
    priority -= 1;
    widgets.push(DashboardEngine.widget('notifications', 'Notifications', { unread: input.unreadNotifications }, priority));
    priority -= 1;

    // Tasks.
    if (input.pendingTasks > 0) {
      widgets.push(DashboardEngine.widget('tasks', 'Pending Tasks', { count: input.pendingTasks }, priority));
      priority -= 1;
    }

    // Patients (assigned).
    if (input.assignedPatients.length > 0) {
      widgets.push(DashboardEngine.widget('patients', 'Assigned Patients', { patientIds: input.assignedPatients }, priority));
      priority -= 1;
    }

    // Encounters.
    if (input.openEncounters.length > 0) {
      widgets.push(DashboardEngine.widget('encounters', 'Open Encounters', { encounterIds: input.openEncounters }, priority));
      priority -= 1;
    }

    // Schedule & command center for senior roles.
    if (input.roleLevel >= 9) {
      widgets.push(DashboardEngine.widget('schedule', 'Schedule', {}, priority));
      priority -= 1;
      widgets.push(DashboardEngine.widget('command_center', 'Command Center', {}, priority));
      priority -= 1;
    }

    // Queue for operational roles.
    if (input.roleLevel >= 5 && input.roleLevel < 9) {
      widgets.push(DashboardEngine.widget('queue', 'Department Queue', {}, priority));
      priority -= 1;
    }

    // AI assistant for clinical roles.
    if (input.permissions.includes('view_analytics') || input.permissions.includes('prescribe')) {
      widgets.push(DashboardEngine.widget('ai_assistant', 'AI Assistant', {}, priority));
      priority -= 1;
    }

    // Orders & results for clinical roles.
    if (input.permissions.includes('order_lab') || input.permissions.includes('order_imaging')) {
      widgets.push(DashboardEngine.widget('orders', 'Orders & Results', {}, priority));
      priority -= 1;
    }

    // Handover for nursing/ward roles.
    if (input.role.toLowerCase().includes('nurse') || input.role.toLowerCase().includes('in_charge')) {
      widgets.push(DashboardEngine.widget('handover', 'Shift Handover', {}, priority));
      priority -= 1;
    }

    // Stats for managers and above.
    if (input.roleLevel >= 8) {
      widgets.push(DashboardEngine.widget('stats', 'Statistics', input.customData?.['stats'] ?? {}, priority));
      priority -= 1;
    }

    // Activity feed.
    widgets.push(DashboardEngine.widget('activity', 'Recent Activity', {}, priority));

    const titles: Record<string, string> = {
      'facility_admin': 'Facility Command Center',
      'consultant': 'Clinical Workspace',
      'resident': 'Resident Workspace',
      'intern': 'Intern Workspace',
      'medical_student': 'Student Workspace',
      'nurse': 'Nursing Workspace',
      'pharmacist': 'Pharmacy Workspace',
      'lab_scientist': 'Laboratory Workspace',
      'radiologist': 'Imaging Workspace',
      'patient': 'Patient Portal',
      'admin': 'Administration Workspace',
    };

    return {
      actorId: input.actorId,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
      role: input.role,
      title: titles[input.role.toLowerCase()] ?? `${input.role} Workspace`,
      widgets: widgets.sort((a, b) => b.priority - a.priority),
      quickActions: input.quickActions ?? DashboardEngine.defaultQuickActions(input.role, input.permissions),
      generatedAt: Date.now(),
    };
  }

  private static widget(type: DashboardWidget['type'], title: string, data: Record<string, unknown>, priority: number): DashboardWidget {
    return { id: nextId('w'), type, title, data, priority };
  }

  static defaultQuickActions(role: string, permissions: string[]): string[] {
    const actions: string[] = [];
    if (permissions.includes('create')) actions.push('New Encounter');
    if (permissions.includes('order_lab')) actions.push('Order Lab');
    if (permissions.includes('order_imaging')) actions.push('Order Imaging');
    if (permissions.includes('prescribe')) actions.push('Prescribe');
    if (permissions.includes('admit')) actions.push('Admit Patient');
    if (permissions.includes('discharge')) actions.push('Discharge');
    if (permissions.includes('schedule')) actions.push('Schedule');
    if (role.toLowerCase().includes('nurse')) actions.push('Record Vitals', 'Medication Round', 'Handover');
    if (role.toLowerCase().includes('pharmacist')) actions.push('Verify Prescription', 'Dispense');
    if (role.toLowerCase().includes('lab')) actions.push('Receive Specimen', 'Release Results');
    if (role.toLowerCase().includes('radiology') || role.toLowerCase().includes('radiolog')) actions.push('Report Study', 'Check Queue');
    if (role.toLowerCase().includes('admin') || role.toLowerCase().includes('manager')) actions.push('Analytics', 'Staff', 'Finance');
    actions.push('View Patients');
    return actions.slice(0, 6);
  }

  static getDashboard(model: GeneratedDashboard): GeneratedDashboard {
    return model;
  }
}

export default DashboardEngine;
