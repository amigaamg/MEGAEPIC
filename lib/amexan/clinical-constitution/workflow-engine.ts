// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Universal Clinical Workflow Engine
// Book II Volume III: Every patient is always somewhere
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  PrimaryClinicalState, ClinicalOwnership, OwnershipEntry, OwnershipTransfer,
  WorkflowInstance, WorkflowType, WorkflowPriority,
  ClinicalQueue, QueueItem, QueueType,
  ClinicalTask, TaskType, TaskEscalation,
  WorkflowDependency, EscalationPolicy, EscalationLevel,
} from './types';

let _counter = 0;
function uid(prefix: string): string {
  _counter++;
  return `${prefix}_${Date.now()}_${_counter}`;
}

// ── State Machine ─────────────────────────────────────────────────────────────
// Valid transitions between primary clinical states

const ALLOWED_CLINICAL_TRANSITIONS: Record<PrimaryClinicalState, PrimaryClinicalState[]> = {
  self_care: ['appointment', 'emergency_department', 'community_care', 'telemedicine'],
  appointment: ['waiting', 'consultation', 'self_care'],
  waiting: ['consultation', 'laboratory', 'radiology', 'triage', 'self_care'],
  triage: ['waiting', 'consultation', 'emergency_department', 'resuscitation'],
  consultation: ['laboratory', 'radiology', 'observation', 'admission', 'pharmacy',
                 'theatre', 'discharge', 'follow_up', 'referral' as any, 'self_care'],
  emergency_department: ['resuscitation', 'triage', 'consultation', 'laboratory',
                          'radiology', 'observation', 'admission', 'theatre', 'icu', 'deceased'],
  resuscitation: ['emergency_department', 'icu', 'theatre', 'deceased'],
  laboratory: ['consultation', 'observation', 'self_care'],
  radiology: ['consultation', 'observation', 'theatre', 'self_care'],
  observation: ['admission', 'discharge', 'self_care', 'consultation'],
  admission: ['ward', 'icu', 'theatre', 'observation'],
  ward: ['theatre', 'icu', 'laboratory', 'radiology', 'pharmacy',
         'physiotherapy', 'discharge', 'transfer', 'deceased'],
  icu: ['ward', 'theatre', 'deceased', 'transfer'],
  theatre: ['recovery' as any, 'icu', 'ward', 'deceased'],
  pharmacy: ['consultation', 'discharge', 'self_care'],
  physiotherapy: ['ward', 'discharge', 'self_care', 'consultation'],
  discharge: ['follow_up', 'self_care', 'long_term_monitoring', 'community_care', 'home_care'],
  follow_up: ['self_care', 'consultation', 'long_term_monitoring', 'appointment'],
  long_term_monitoring: ['consultation', 'self_care', 'emergency_department', 'follow_up'],
  community_care: ['self_care', 'home_care', 'consultation', 'emergency_department'],
  home_care: ['self_care', 'consultation', 'emergency_department', 'long_term_monitoring'],
  telemedicine: ['consultation', 'pharmacy', 'follow_up', 'self_care'],
  transfer: ['admission', 'consultation', 'ward', 'icu'],
  deceased: [],
};

// ── Workflow Creation ─────────────────────────────────────────────────────────

export function createWorkflowInstance(params: {
  patientId: string;
  type: WorkflowType;
  currentState: PrimaryClinicalState;
  encounterId?: string;
  episodeId?: string;
  patientOwner?: OwnershipEntry;
  workflowOwner?: OwnershipEntry;
  priority?: WorkflowPriority;
  expectedCompletionMinutes?: number;
}): WorkflowInstance {
  const now = Date.now();
  return {
    id: uid('wf'),
    patientId: params.patientId,
    encounterId: params.encounterId,
    episodeId: params.episodeId,
    type: params.type,
    currentState: params.currentState,
    previousState: null,
    ownership: {
      patientOwner: params.patientOwner ?? { ownerId: '', ownerName: '', ownerType: 'clinician', role: '', assumedAt: now },
      workflowOwner: params.workflowOwner ?? { ownerId: '', ownerName: '', ownerType: 'department', role: '', assumedAt: now },
      taskOwners: [],
      episodeOwner: null,
      lastTransferredAt: now,
      transferHistory: [],
    },
    priority: params.priority ?? 3,
    tasks: [],
    dependencies: [],
    startedAt: now,
    expectedCompletionAt: params.expectedCompletionMinutes ? now + params.expectedCompletionMinutes * 60000 : undefined,
    status: 'active',
    escalationLevel: 0,
  };
}

// ── State Transition ──────────────────────────────────────────────────────────

export function transitionPatient(
  workflow: WorkflowInstance,
  newState: PrimaryClinicalState,
): WorkflowInstance {
  const allowed = ALLOWED_CLINICAL_TRANSITIONS[workflow.currentState];
  if (!allowed || !allowed.includes(newState)) {
    throw new Error(
      `Invalid patient state transition: ${workflow.currentState} → ${newState}`,
    );
  }
  return {
    ...workflow,
    previousState: workflow.currentState,
    currentState: newState,
  };
}

// ── Ownership Management ──────────────────────────────────────────────────────

export function transferPatientOwnership(
  workflow: WorkflowInstance,
  fromOwner: OwnershipEntry,
  toOwner: OwnershipEntry,
  transferType: OwnershipTransfer['transferType'],
  checklistCompleted: boolean,
  notes?: string,
): WorkflowInstance {
  const now = Date.now();
  const transfer: OwnershipTransfer = {
    fromOwner: fromOwner.ownerId,
    fromName: fromOwner.ownerName,
    toOwner: toOwner.ownerId,
    toName: toOwner.ownerName,
    transferType,
    checklistCompleted,
    accepted: false,
    transferredAt: now,
    notes,
  };

  return {
    ...workflow,
    ownership: {
      ...workflow.ownership,
      patientOwner: toOwner,
      lastTransferredAt: now,
      transferHistory: [...workflow.ownership.transferHistory, transfer],
    },
  };
}

export function acceptTransfer(
  workflow: WorkflowInstance,
  transferIndex: number,
): WorkflowInstance {
  const history = [...workflow.ownership.transferHistory];
  if (transferIndex >= 0 && transferIndex < history.length) {
    history[transferIndex] = { ...history[transferIndex], accepted: true, acceptedAt: Date.now() };
  }
  return {
    ...workflow,
    ownership: { ...workflow.ownership, transferHistory: history },
  };
}

// ── Queue Management ──────────────────────────────────────────────────────────

export function createQueue(params: {
  name: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  type: QueueType;
}): ClinicalQueue {
  return {
    id: uid('q'),
    name: params.name,
    departmentId: params.departmentId,
    departmentName: params.departmentName,
    organizationId: params.organizationId,
    type: params.type,
    items: [],
    lastReordered: Date.now(),
  };
}

export function addToQueue(
  queue: ClinicalQueue,
  item: Omit<QueueItem, 'id' | 'enteredAt' | 'waitTime' | 'escalationLevel' | 'status'>,
): ClinicalQueue {
  const now = Date.now();
  const newItem: QueueItem = {
    ...item,
    id: uid('qi'),
    status: 'waiting',
    enteredAt: now,
    waitTime: 0,
    escalationLevel: 0,
  };
  return {
    ...queue,
    items: [...queue.items, newItem],
    lastReordered: now,
  };
}

// ── Priority Reordering ───────────────────────────────────────────────────────
// Re-sorts queue by clinical priority (not FIFO)

export function reorderByPriority(queue: ClinicalQueue): ClinicalQueue {
  const sorted = [...queue.items].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.enteredAt - b.enteredAt;
  });
  return {
    ...queue,
    items: sorted,
    lastReordered: Date.now(),
  };
}

// ── Task Management ───────────────────────────────────────────────────────────

export function createTask(params: {
  workflowId: string;
  patientId: string;
  title: string;
  description?: string;
  assignedBy: string;
  assignedByName: string;
  type: TaskType;
  priority?: WorkflowPriority;
  dueAt?: number;
  expectedDuration?: number;
  clinicalClockTarget?: number;
  dependsOnTaskIds?: string[];
}): ClinicalTask {
  return {
    id: uid('task'),
    workflowId: params.workflowId,
    patientId: params.patientId,
    title: params.title,
    description: params.description,
    assignedBy: params.assignedBy,
    assignedByName: params.assignedByName,
    type: params.type,
    priority: params.priority ?? 3,
    status: 'pending',
    createdAt: Date.now(),
    dueAt: params.dueAt,
    expectedDuration: params.expectedDuration,
    clinicalClockTarget: params.clinicalClockTarget,
    dependsOnTaskIds: params.dependsOnTaskIds ?? [],
    escalationLevel: 0,
    escalationHistory: [],
  };
}

export function assignTask(task: ClinicalTask, assignToId: string, assignToName: string): ClinicalTask {
  return { ...task, assignedTo: assignToId, assignedToName: assignToName };
}

export function completeTask(task: ClinicalTask): ClinicalTask {
  return { ...task, status: 'completed', completedAt: Date.now() };
}

// ── Automatic Task Creation ───────────────────────────────────────────────────
// When a clinical decision is made, creates standard task bundles.

export function getAdmissionTaskBundle(workflowId: string, patientId: string, assignedBy: string, assignedByName: string): ClinicalTask[] {
  return [
    createTask({ workflowId, patientId, title: 'Medical admission note', type: 'documentation', assignedBy, assignedByName, priority: 1, clinicalClockTarget: 60 }),
    createTask({ workflowId, patientId, title: 'Nursing admission assessment', type: 'assessment', assignedBy, assignedByName, priority: 1, clinicalClockTarget: 60 }),
    createTask({ workflowId, patientId, title: 'Medication reconciliation', type: 'assessment', assignedBy, assignedByName, priority: 2, clinicalClockTarget: 120 }),
    createTask({ workflowId, patientId, title: 'Falls risk assessment', type: 'assessment', assignedBy, assignedByName, priority: 2 }),
    createTask({ workflowId, patientId, title: 'Pressure sore risk assessment', type: 'assessment', assignedBy, assignedByName, priority: 2 }),
    createTask({ workflowId, patientId, title: 'Vital signs schedule', type: 'ordering', assignedBy, assignedByName, priority: 1 }),
    createTask({ workflowId, patientId, title: 'Fluid balance chart', type: 'documentation', assignedBy, assignedByName, priority: 2 }),
    createTask({ workflowId, patientId, title: 'Bed allocation', type: 'other', assignedBy, assignedByName, priority: 2 }),
    createTask({ workflowId, patientId, title: 'Diet order', type: 'ordering', assignedBy, assignedByName, priority: 3 }),
    createTask({ workflowId, patientId, title: 'Identification band', type: 'other', assignedBy, assignedByName, priority: 1, clinicalClockTarget: 15 }),
  ];
}

export function getDischargeTaskBundle(workflowId: string, patientId: string, assignedBy: string, assignedByName: string): ClinicalTask[] {
  return [
    createTask({ workflowId, patientId, title: 'Discharge summary', type: 'documentation', assignedBy, assignedByName, priority: 1 }),
    createTask({ workflowId, patientId, title: 'Prescription reconciliation', type: 'review', assignedBy, assignedByName, priority: 2 }),
    createTask({ workflowId, patientId, title: 'Follow-up appointment', type: 'follow_up', assignedBy, assignedByName, priority: 2 }),
    createTask({ workflowId, patientId, title: 'Patient education', type: 'education', assignedBy, assignedByName, priority: 3 }),
    createTask({ workflowId, patientId, title: 'Billing clearance', type: 'other', assignedBy, assignedByName, priority: 2 }),
  ];
}

export function getOperationTaskBundle(workflowId: string, patientId: string, assignedBy: string, assignedByName: string): ClinicalTask[] {
  return [
    createTask({ workflowId, patientId, title: 'Anaesthesia review', type: 'assessment', assignedBy, assignedByName, priority: 1 }),
    createTask({ workflowId, patientId, title: 'Informed consent', type: 'documentation', assignedBy, assignedByName, priority: 1 }),
    createTask({ workflowId, patientId, title: 'Blood availability check', type: 'other', assignedBy, assignedByName, priority: 1 }),
    createTask({ workflowId, patientId, title: 'Surgical checklist', type: 'documentation', assignedBy, assignedByName, priority: 1 }),
    createTask({ workflowId, patientId, title: 'Theatre slot confirmation', type: 'other', assignedBy, assignedByName, priority: 1 }),
    createTask({ workflowId, patientId, title: 'Equipment preparation', type: 'other', assignedBy, assignedByName, priority: 2 }),
  ];
}

// ── Dependency Checking ───────────────────────────────────────────────────────

export function checkDependencies(task: ClinicalTask, allTasks: ClinicalTask[]): { canProceed: boolean; blockingTasks: ClinicalTask[] } {
  const blockingTasks = allTasks.filter(t =>
    task.dependsOnTaskIds.includes(t.id) && t.status !== 'completed'
  );
  return {
    canProceed: blockingTasks.length === 0,
    blockingTasks,
  };
}

// ── Escalation Engine ─────────────────────────────────────────────────────────

export function createEscalationPolicy(params: {
  name: string;
  taskType: TaskType;
  maxWaitTime: number;
  levels: Omit<EscalationLevel, 'level'>[];
  departmentId?: string;
}): EscalationPolicy {
  return {
    id: uid('epol'),
    name: params.name,
    taskType: params.taskType,
    maxWaitTime: params.maxWaitTime,
    reEscalationInterval: params.maxWaitTime,
    levels: params.levels.map((l, i) => ({ ...l, level: i + 1 })),
    departmentId: params.departmentId,
  };
}

export function checkEscalation(
  task: ClinicalTask,
  policy: EscalationPolicy,
): { needsEscalation: boolean; nextLevel?: EscalationLevel } {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return { needsEscalation: false };
  }

  const now = Date.now();
  const elapsed = now - task.createdAt;
  const currentLevel = task.escalationLevel;

  for (const level of policy.levels) {
    if (level.level > currentLevel && elapsed >= level.afterMinutes * 60000) {
      return { needsEscalation: true, nextLevel: level };
    }
  }

  return { needsEscalation: false };
}

export function escalateTask(
  task: ClinicalTask,
  level: EscalationLevel,
): ClinicalTask {
  const escalation: TaskEscalation = {
    escalatedAt: Date.now(),
    escalatedTo: level.escalateTo,
    escalatedToName: '',
    reason: `Escalation level ${level.level} — ${level.escalateToRole}`,
  };
  return {
    ...task,
    escalationLevel: level.level,
    escalationHistory: [...task.escalationHistory, escalation],
    status: 'escalated',
  };
}

// ── Clinical Clock ────────────────────────────────────────────────────────────

export function checkClinicalClock(task: ClinicalTask): {
  onTrack: boolean;
  remainingMinutes?: number;
  overdueBy?: number;
} {
  if (!task.clinicalClockTarget || !task.createdAt) {
    return { onTrack: true };
  }
  const now = Date.now();
  const elapsed = (now - task.createdAt) / 60000;
  const target = task.clinicalClockTarget;

  if (task.status === 'completed' && task.completedAt) {
    const actualDuration = (task.completedAt - task.createdAt) / 60000;
    return {
      onTrack: actualDuration <= target,
      remainingMinutes: Math.max(0, target - actualDuration),
      overdueBy: actualDuration > target ? actualDuration - target : undefined,
    };
  }

  return {
    onTrack: elapsed <= target,
    remainingMinutes: Math.max(0, target - elapsed),
    overdueBy: elapsed > target ? elapsed - target : undefined,
  };
}

// ── Workflow Health Dashboard ─────────────────────────────────────────────────

export interface WorkflowHealthSnapshot {
  activeWorkflows: number;
  waitingReviews: number;
  pendingLabs: number;
  delayedImaging: number;
  pendingDischarges: number;
  highRiskPatients: number;
  escalatedTasks: number;
}

export function computeWorkflowHealth(
  workflows: WorkflowInstance[],
  tasks: ClinicalTask[],
): WorkflowHealthSnapshot {
  return {
    activeWorkflows: workflows.filter(w => w.status === 'active').length,
    waitingReviews: tasks.filter(t => t.type === 'review' && t.status === 'pending').length,
    pendingLabs: tasks.filter(t => t.title.toLowerCase().includes('lab') && t.status !== 'completed').length,
    delayedImaging: tasks.filter(t => t.title.toLowerCase().includes('imaging') && t.status !== 'completed').length,
    pendingDischarges: workflows.filter(w => w.type === 'discharge' && w.status === 'active').length,
    highRiskPatients: workflows.filter(w => w.priority <= 2).length,
    escalatedTasks: tasks.filter(t => t.status === 'escalated').length,
  };
}
