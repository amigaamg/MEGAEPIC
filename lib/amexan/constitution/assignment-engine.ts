import type { AmxUid, Assignment, AssignmentLocation, AssignmentType } from './types';

export interface AssignmentTemplate {
  type: AssignmentType;
  title: string;
  description?: string;
  location: AssignmentLocation;
  priority: Assignment['priority'];
  requiresSignature: boolean;
}

export const ASSIGNMENT_TEMPLATES: Record<AssignmentType, AssignmentTemplate> = {
  ward_round: { type: 'ward_round', title: 'Ward Round', location: { type: 'ward' }, priority: 'routine', requiresSignature: false },
  clinic: { type: 'clinic', title: 'Clinic Duty', location: { type: 'clinic' }, priority: 'routine', requiresSignature: false },
  theatre: { type: 'theatre', title: 'Theatre Session', location: { type: 'theatre' }, priority: 'routine', requiresSignature: true },
  emergency_call: { type: 'emergency_call', title: 'Emergency Call', location: { type: 'emergency' }, priority: 'emergency', requiresSignature: false },
  icu_duty: { type: 'icu_duty', title: 'ICU Duty', location: { type: 'icu' }, priority: 'urgent', requiresSignature: false },
  consultation: { type: 'consultation', title: 'Consultation', location: { type: 'clinic' }, priority: 'routine', requiresSignature: false },
  admission: { type: 'admission', title: 'Admission Review', location: { type: 'ward' }, priority: 'urgent', requiresSignature: false },
  discharge: { type: 'discharge', title: 'Discharge Summary', location: { type: 'ward' }, priority: 'routine', requiresSignature: true },
  procedure: { type: 'procedure', title: 'Procedure', location: { type: 'theatre' }, priority: 'routine', requiresSignature: true },
  home_visit: { type: 'home_visit', title: 'Home Visit', location: { type: 'remote' }, priority: 'routine', requiresSignature: false },
  teleconsultation: { type: 'teleconsultation', title: 'Teleconsultation', location: { type: 'remote' }, priority: 'routine', requiresSignature: false },
  lecture: { type: 'lecture', title: 'Teaching Session', location: { type: 'ward' }, priority: 'routine', requiresSignature: false },
  research: { type: 'research', title: 'Research Activity', location: { type: 'remote' }, priority: 'routine', requiresSignature: false },
  administration: { type: 'administration', title: 'Admin Duty', location: { type: 'ward' }, priority: 'routine', requiresSignature: false },
  supervision: { type: 'supervision', title: 'Supervision', location: { type: 'ward' }, priority: 'routine', requiresSignature: false },
  on_call: { type: 'on_call', title: 'On Call', location: { type: 'emergency' }, priority: 'urgent', requiresSignature: false },
  standby: { type: 'standby', title: 'Standby', location: { type: 'ward' }, priority: 'routine', requiresSignature: false },
  outreach: { type: 'outreach', title: 'Outreach', location: { type: 'outreach' }, priority: 'routine', requiresSignature: false },
  other: { type: 'other', title: 'Other Duty', location: { type: 'ward' }, priority: 'routine', requiresSignature: false },
};

export function makeAssignment(
  personId: AmxUid,
  orgId: string,
  deptId: string,
  employmentId: string,
  type: AssignmentType,
  startTime: number,
  endTime: number,
  assignedBy: AmxUid,
  overrides?: Partial<Assignment>,
): Omit<Assignment, 'id'> {
  const template = ASSIGNMENT_TEMPLATES[type] ?? ASSIGNMENT_TEMPLATES.other;
  return {
    personId,
    employmentId,
    organizationId: orgId,
    departmentId: deptId,
    type,
    title: overrides?.title ?? template.title,
    description: overrides?.description ?? template.description,
    startTime,
    endTime,
    location: overrides?.location ?? template.location,
    status: 'scheduled',
    priority: overrides?.priority ?? template.priority,
    assignedBy,
    assignedAt: Date.now(),
    requiresSignature: overrides?.requiresSignature ?? template.requiresSignature,
    notes: overrides?.notes,
  };
}

export function getCurrentAssignment(assignments: Assignment[]): Assignment | null {
  const now = Date.now();
  return assignments.find(a => a.startTime <= now && a.endTime >= now && (a.status === 'active' || a.status === 'scheduled')) ?? null;
}

export function getAssignmentQueue(assignments: Assignment[]): Assignment[] {
  const now = Date.now();
  return assignments
    .filter(a => a.status === 'scheduled' || a.status === 'active')
    .sort((a, b) => {
      const priorityOrder = { emergency: 0, critical: 1, urgent: 2, routine: 3 };
      return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
    });
}

export function startAssignment(assignment: Assignment): Assignment {
  return { ...assignment, status: 'active' };
}

export function completeAssignment(assignment: Assignment): Assignment {
  return { ...assignment, status: 'completed', completedAt: Date.now() };
}

export function cancelAssignment(assignment: Assignment): Assignment {
  return { ...assignment, status: 'cancelled' };
}
