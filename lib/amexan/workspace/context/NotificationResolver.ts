// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 5 — Notification Resolver
// Derives priority notifications from assignments, clinical context,
// emergency state, and shift status. Dashboard surfaces these first.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { WorkspaceNotification } from '../types';

export function resolveNotifications(workspace: ResolvedWorkspace): WorkspaceNotification[] {
  const notifications: WorkspaceNotification[] = [];
  const now = Date.now();

  // Emergency state overrides everything
  const emergency = workspace.extendedContext?.emergency;
  if (emergency?.active) {
    notifications.push({
      id: `emergency-${emergency.type}`,
      type: 'emergency',
      severity: 'critical',
      title: emergency.title,
      message: emergency.description || `Emergency state active: ${emergency.type}`,
      createdAt: emergency.activatedAt || now,
      read: false,
    });
  }

  // Critical/urgent assignments
  const criticalAssignments = workspace.assignments.filter(a => a.status === 'active' && (a.priority === 'urgent' || a.priority === 'critical'));
  for (const a of criticalAssignments.slice(0, 3)) {
    notifications.push({
      id: `assignment-${a.id}`,
      type: 'assignment',
      severity: a.priority === 'critical' ? 'critical' : 'urgent',
      title: a.title,
      message: `Active assignment requires attention`,
      patientId: a.linkedPatientIds?.[0],
      link: `/assignments/${a.id}`,
      createdAt: a.assignedAt || now,
      read: false,
    });
  }

  // Pending labs from clinical context
  const clinical = workspace.extendedContext?.clinicalContext;
  if (clinical) {
    if (clinical.pendingLabs > 5) {
      notifications.push({
        id: 'pending-labs-high',
        type: 'lab',
        severity: 'warning',
        title: `${clinical.pendingLabs} Pending Lab Results`,
        message: 'Results awaiting review — may impact patient care',
        link: '/laboratory',
        createdAt: now,
        read: false,
      });
    } else if (clinical.pendingLabs > 0) {
      notifications.push({
        id: 'pending-labs',
        type: 'lab',
        severity: 'info',
        title: `${clinical.pendingLabs} New Lab Result${clinical.pendingLabs > 1 ? 's' : ''}`,
        message: 'Lab results available for review',
        link: '/laboratory',
        createdAt: now,
        read: false,
      });
    }

    if (clinical.riskAlerts.length > 0) {
      notifications.push({
        id: 'risk-alerts',
        type: 'risk',
        severity: clinical.riskAlerts.some(a => a.includes('sepsis') || a.includes('critical')) ? 'critical' : 'urgent',
        title: `${clinical.riskAlerts.length} Risk Alert${clinical.riskAlerts.length > 1 ? 's' : ''}`,
        message: clinical.riskAlerts.join('; '),
        link: '/patients',
        createdAt: now,
        read: false,
      });
    }
  }

  // Shift-related
  if (workspace.isOnDuty && workspace.activeShift) {
    notifications.push({
      id: 'shift-active',
      type: 'shift',
      severity: 'info',
      title: `On Duty — ${workspace.activeShift.type} Shift`,
      message: `Started at ${new Date(workspace.activeShift.startDate || now).toLocaleTimeString()}`,
      link: '/shift',
      createdAt: now,
      read: false,
    });
  }

  // Pending consults
  if (clinical?.pendingConsults && clinical.pendingConsults > 0) {
    notifications.push({
      id: 'pending-consults',
      type: 'consult',
      severity: 'warning',
      title: `${clinical.pendingConsults} Pending Consult Request${clinical.pendingConsults > 1 ? 's' : ''}`,
      message: `${clinical.pendingConsults} consult request${clinical.pendingConsults > 1 ? 's' : ''} require your attention`,
      link: '/consults',
      createdAt: now,
      read: false,
    });
  }

  // Medication overdue (from assignments)
  const medOverdue = workspace.assignments.filter(a => a.type === 'ward_round' && a.status === 'active');
  if (medOverdue.length > 0 && clinical?.pendingLabs !== undefined) {
    // Only surface if there are pending labs too — combined clinical workload signal
  }

  return notifications.sort((a, b) => {
    const sev = { critical: 0, urgent: 1, warning: 2, info: 3 };
    return sev[a.severity] - sev[b.severity];
  });
}