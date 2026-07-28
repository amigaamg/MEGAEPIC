// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book V: Universal Task Engine
// Everything becomes a task. Nothing is forgotten.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Task {
  id: string;
  taskType: TaskType;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  source: TaskSource;
  sourceId: string;
  patientId?: string;
  encounterId?: string;
  orderId?: string;
  departmentId: string;
  unitId?: string;
  assignedTo: string[];
  assignedBy: string;
  assignedAt: number;
  acceptedAt?: number;
  startedAt?: number;
  completedAt?: number;
  dueBy?: number;
  dependsOn: string[];
  dependencies: TaskDependency[];
  escalation: EscalationPolicy;
  notes: TaskNote[];
  attachments: TaskAttachment[];
  metadata: Record<string, unknown>;
  completionProof?: CompletionProof;
  createdAt: number;
  updatedAt: number;
}

export enum TaskType {
  PrescriptionFill = 'prescription_fill',
  LabSampleCollect = 'lab_sample_collect',
  LabProcess = 'lab_process',
  LabVerify = 'lab_verify',
  ImagingPerform = 'imaging_perform',
  ImagingReport = 'imaging_report',
  BloodCrossmatch = 'blood_crossmatch',
  BloodDispense = 'blood_dispense',
  SurgerySchedule = 'surgery_schedule',
  SurgeryPerform = 'surgery_perform',
  AdmissionArrange = 'admission_arrange',
  TransferArrange = 'transfer_arrange',
  DischargeProcess = 'discharge_process',
  ReferralProcess = 'referral_process',
  MedicationAdminister = 'medication_administer',
  VitalSignsRecord = 'vital_signs_record',
  NursingProcedure = 'nursing_procedure',
  PhysiotherapySession = 'physiotherapy_session',
  NutritionAssessment = 'nutrition_assessment',
  CounsellingSession = 'counselling_session',
  SocialWorkVisit = 'social_work_visit',
  EquipmentDelivery = 'equipment_delivery',
  MaintenancePerform = 'maintenance_perform',
  InventoryReorder = 'inventory_reorder',
  InventoryCount = 'inventory_count',
  BillGenerate = 'bill_generate',
  PaymentCollect = 'payment_collect',
  InsuranceClaim = 'insurance_claim',
  ApprovalRequired = 'approval_required',
  ReviewRequired = 'review_required',
  VerificationRequired = 'verification_required',
  ConsentObtain = 'consent_obtain',
  FollowUpCall = 'follow_up_call',
  PatientEducation = 'patient_education',
  DischargeSummary = 'discharge_summary',
  DeathCertificate = 'death_certificate',
  Other = 'other',
}

export enum TaskPriority {
  STAT = 'stat',
  Emergency = 'emergency',
  Urgent = 'urgent',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Routine = 'routine',
}

export enum TaskStatus {
  Pending = 'pending',
  Assigned = 'assigned',
  Accepted = 'accepted',
  InProgress = 'in_progress',
  Paused = 'paused',
  PendingReview = 'pending_review',
  Completed = 'completed',
  Verified = 'verified',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Escalated = 'escalated',
}

export enum TaskSource {
  DoctorOrder = 'doctor_order',
  ProtocolTrigger = 'protocol_trigger',
  LabResult = 'lab_result',
  VitalSign = 'vital_sign',
  Alert = 'alert',
  Schedule = 'schedule',
  Referral = 'referral',
  System = 'system',
  Manual = 'manual',
  PatientRequest = 'patient_request',
  NursingAssessment = 'nursing_assessment',
  Recurring = 'recurring',
}

export interface TaskDependency {
  taskId: string;
  type: 'must_complete' | 'must_start' | 'optional';
  status: 'pending' | 'completed' | 'failed';
}

export interface EscalationPolicy {
  levels: EscalationLevel[];
  currentLevel: number;
  lastEscalatedAt?: number;
  maxEscalations: number;
}

export interface EscalationLevel {
  level: number;
  afterMinutes: number;
  notify: string[];
  action: EscalationAction;
}

export enum EscalationAction {
  Notify = 'notify',
  Reassign = 'reassign',
  NotifySupervisor = 'notify_supervisor',
  Page = 'page',
  SMS = 'sms',
  Call = 'call',
  EmergencyAlert = 'emergency_alert',
}

export interface TaskNote {
  id: string;
  text: string;
  by: string;
  at: number;
  type: 'general' | 'handover' | 'complication' | 'resolution';
}

export interface TaskAttachment {
  id: string;
  type: 'image' | 'document' | 'result' | 'photo';
  url: string;
  name: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface CompletionProof {
  type: 'signature' | 'photo' | 'document' | 'result' | 'observation' | 'verification';
  value: string;
  verifiedBy?: string;
  verifiedAt?: number;
}

export function createTask(params: {
  taskType: TaskType;
  title: string;
  description: string;
  priority: TaskPriority;
  source: TaskSource;
  sourceId: string;
  departmentId: string;
  assignedTo: string[];
  assignedBy: string;
  patientId?: string;
  encounterId?: string;
  dueBy?: number;
  dependsOn?: string[];
}): Task {
  const now = Date.now();
  return {
    id: `TASK-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    taskType: params.taskType,
    title: params.title,
    description: params.description,
    priority: params.priority,
    status: TaskStatus.Pending,
    source: params.source,
    sourceId: params.sourceId,
    patientId: params.patientId,
    encounterId: params.encounterId,
    departmentId: params.departmentId,
    assignedTo: params.assignedTo,
    assignedBy: params.assignedBy,
    assignedAt: now,
    dependsOn: params.dependsOn || [],
    dependencies: (params.dependsOn || []).map(d => ({ taskId: d, type: 'must_complete' as const, status: 'pending' as const })),
    escalation: {
      levels: [
        { level: 1, afterMinutes: 30, notify: [], action: EscalationAction.Notify },
        { level: 2, afterMinutes: 60, notify: [], action: EscalationAction.NotifySupervisor },
        { level: 3, afterMinutes: 120, notify: [], action: EscalationAction.EmergencyAlert },
      ],
      currentLevel: 0,
      maxEscalations: 3,
    },
    notes: [],
    attachments: [],
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function assignTask(task: Task, userId: string): Task {
  if (!task.assignedTo.includes(userId)) {
    task.assignedTo.push(userId);
  }
  task.status = TaskStatus.Assigned;
  task.updatedAt = Date.now();
  return task;
}

export function acceptTask(task: Task, userId: string): Task {
  task.status = TaskStatus.Accepted;
  task.acceptedAt = Date.now();
  task.updatedAt = Date.now();
  return task;
}

export function startTask(task: Task): Task {
  task.status = TaskStatus.InProgress;
  task.startedAt = Date.now();
  task.updatedAt = Date.now();
  return task;
}

export function completeTask(task: Task, proof?: CompletionProof): Task {
  const now = Date.now();
  task.status = TaskStatus.Completed;
  task.completedAt = now;
  task.updatedAt = now;
  if (proof) task.completionProof = proof;
  return task;
}

export function verifyTask(task: Task, verifiedBy: string): Task {
  task.status = TaskStatus.Verified;
  task.updatedAt = Date.now();
  if (task.completionProof) {
    task.completionProof.verifiedBy = verifiedBy;
    task.completionProof.verifiedAt = Date.now();
  }
  return task;
}

export function cancelTask(task: Task, reason: string): Task {
  task.status = TaskStatus.Cancelled;
  task.notes.push({ id: `note-${Date.now()}`, text: `Cancelled: ${reason}`, by: 'system', at: Date.now(), type: 'general' });
  task.updatedAt = Date.now();
  return task;
}

export function escalateTask(task: Task): Task {
  const nextLevel = task.escalation.currentLevel + 1;
  if (nextLevel <= task.escalation.maxEscalations) {
    task.escalation.currentLevel = nextLevel;
    task.escalation.lastEscalatedAt = Date.now();
    task.status = TaskStatus.Escalated;
    task.notes.push({
      id: `note-${Date.now()}`,
      text: `Escalated to level ${nextLevel}`,
      by: 'system', at: Date.now(), type: 'general',
    });
    task.updatedAt = Date.now();
  }
  return task;
}

export function addTaskNote(task: Task, text: string, by: string, type: TaskNote['type'] = 'general'): Task {
  task.notes.push({ id: `note-${Date.now()}`, text, by, at: Date.now(), type });
  task.updatedAt = Date.now();
  return task;
}

export function checkTaskDependencies(task: Task): { satisfied: boolean; pending: string[] } {
  const pending = task.dependencies
    .filter(d => d.status !== 'completed')
    .map(d => d.taskId);
  return { satisfied: pending.length === 0, pending };
}

export function resolveDependency(task: Task, dependencyTaskId: string): Task {
  const dep = task.dependencies.find(d => d.taskId === dependencyTaskId);
  if (dep) dep.status = 'completed';
  task.updatedAt = Date.now();
  return task;
}

export function getTaskByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(t => t.status === status);
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = Date.now();
  return tasks.filter(t => t.dueBy && t.dueBy < now &&
    ![TaskStatus.Completed, TaskStatus.Verified, TaskStatus.Cancelled, TaskStatus.Failed].includes(t.status));
}

export function getTasksForUser(tasks: Task[], userId: string): Task[] {
  return tasks.filter(t => t.assignedTo.includes(userId));
}

export function getTaskSummary(tasks: Task[]): {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  escalated: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  byDepartment: Record<string, number>;
} {
  const now = Date.now();
  const byPriority: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  for (const t of tasks) {
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    byType[t.taskType] = (byType[t.taskType] || 0) + 1;
    byDepartment[t.departmentId] = (byDepartment[t.departmentId] || 0) + 1;
  }
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === TaskStatus.Pending || t.status === TaskStatus.Assigned).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.InProgress || t.status === TaskStatus.Accepted).length,
    completed: tasks.filter(t => t.status === TaskStatus.Completed || t.status === TaskStatus.Verified).length,
    overdue: tasks.filter(t => t.dueBy && t.dueBy < now && ![TaskStatus.Completed, TaskStatus.Verified, TaskStatus.Cancelled].includes(t.status)).length,
    escalated: tasks.filter(t => t.status === TaskStatus.Escalated).length,
    byPriority, byType, byDepartment,
  };
}
