// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 6 — Task Resolver
// Derives today's priority tasks from the active assignment and
// clinical context. Every dashboard starts with tasks.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { WorkspaceTask } from '../types';

export function resolveTasks(workspace: ResolvedWorkspace): WorkspaceTask[] {
  const tasks: WorkspaceTask[] = [];
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  const assignment = workspace.activeAssignment;
  const category = workspace.professional?.primaryCategory || '';
  const isOnDuty = workspace.isOnDuty;

  if (!assignment && !isOnDuty) {
    tasks.push({
      id: 'off-duty',
      type: 'info',
      title: 'Off Duty',
      description: 'No active assignment. Review pending items when on duty.',
      priority: 'low',
      status: 'pending',
      dueAt: now,
    });
    return tasks;
  }

  // Assignment-based tasks
  if (assignment) {
    const type = assignment.type;
    const titleMap: Record<string, string> = {
      ward_round: 'Ward Round',
      clinic: 'Clinic Consultations',
      theatre: 'Surgical List',
      emergency_call: 'Emergency Call',
      icu_duty: 'ICU Rounds',
      consultation: 'Pending Consults',
      admission: 'Admissions Review',
      discharge: 'Discharge Summary',
      procedure: 'Pending Procedures',
      home_visit: 'Home Visits',
      teleconsultation: 'Teleconsultations',
      lecture: 'Lecture Preparation',
      research: 'Research Activities',
      administration: 'Administrative Tasks',
      supervision: 'Supervision Duties',
      on_call: 'On-Call Review',
      standby: 'Standby Review',
      outreach: 'Outreach Activities',
    };

    tasks.push({
      id: `task-${type}`,
      type,
      title: titleMap[type] || type,
      description: `Active assignment: ${assignment.title}`,
      priority: assignment.status === 'active' ? 'high' : 'medium',
      status: 'in_progress',
      patientId: assignment.linkedPatientIds?.[0],
      dueAt: now,
      link: `/assignments/${assignment.id}`,
    });
  }

  // Pending labs from clinical context
  const clinical = workspace.extendedContext?.clinicalContext;
  if (clinical) {
    if (clinical.pendingLabs > 0) {
      tasks.push({
        id: 'pending-labs',
        type: 'lab_review',
        title: `Review ${clinical.pendingLabs} Pending Lab Result${clinical.pendingLabs > 1 ? 's' : ''}`,
        priority: 'high',
        status: 'pending',
        dueAt: now,
        link: '/laboratory',
      });
    }
    if (clinical.pendingImaging > 0) {
      tasks.push({
        id: 'pending-imaging',
        type: 'imaging_review',
        title: `Review ${clinical.pendingImaging} Pending Imaging`,
        priority: 'high',
        status: 'pending',
        dueAt: now,
        link: '/radiology',
      });
    }
    if (clinical.pendingProcedures > 0) {
      tasks.push({
        id: 'pending-procedures',
        type: 'procedure_review',
        title: `${clinical.pendingProcedures} Pending Procedure(s)`,
        priority: 'urgent',
        status: 'pending',
        dueAt: now,
        link: '/theatre',
      });
    }
    if (clinical.pendingConsults > 0) {
      tasks.push({
        id: 'pending-consults',
        type: 'consult_review',
        title: `${clinical.pendingConsults} Pending Consult(s)`,
        priority: 'high',
        status: 'pending',
        dueAt: now,
        link: '/consults',
      });
    }
    if (clinical.riskAlerts.length > 0) {
      tasks.push({
        id: 'risk-alerts',
        type: 'risk_alert',
        title: `${clinical.riskAlerts.length} Risk Alert(s)`,
        description: clinical.riskAlerts.join('; '),
        priority: 'urgent',
        status: 'pending',
        dueAt: now,
        link: '/patients',
      });
    }
  }

  // Pending notes and prescriptions (from assignments context)
  if (assignment?.type === 'ward_round' || assignment?.type === 'clinic') {
    tasks.push({
      id: 'pending-notes',
      type: 'clinical_note',
      title: 'Complete Pending Clinical Notes',
      priority: 'medium',
      status: 'pending',
      dueAt: now,
      link: '/notes',
    });
    tasks.push({
      id: 'pending-prescriptions',
      type: 'prescription',
      title: 'Review Pending Prescriptions',
      priority: 'medium',
      status: 'pending',
      dueAt: now,
      link: '/prescriptions',
    });
  }

  // Billing task for administrative roles
  if (category === 'facility_admin' || category === 'administrator') {
    tasks.push({
      id: 'pending-billing',
      type: 'billing',
      title: 'Review Pending Billing Items',
      priority: 'medium',
      status: 'pending',
      dueAt: now,
      link: '/billing',
    });
  }

  // Shift handover if on duty
  if (isOnDuty && workspace.activeShift) {
    tasks.push({
      id: 'shift-handover',
      type: 'handover',
      title: 'Shift Handover Notes',
      description: `Current shift: ${workspace.activeShift.type}`,
      priority: 'high',
      status: 'pending',
      dueAt: now,
      link: '/shift',
    });
  }

  return tasks.sort((a, b) => {
    const prio = { urgent: 0, high: 1, medium: 2, low: 3 };
    return prio[a.priority] - prio[b.priority];
  });
}