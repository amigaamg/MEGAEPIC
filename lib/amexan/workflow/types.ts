export enum PatientState {
  SelfCare = 'self_care',
  Appointment = 'appointment',
  Waiting = 'waiting',
  Triage = 'triage',
  Consultation = 'consultation',
  Laboratory = 'laboratory',
  Radiology = 'radiology',
  Pharmacy = 'pharmacy',
  Observation = 'observation',
  Admission = 'admission',
  Ward = 'ward',
  ICU = 'icu',
  Theatre = 'theatre',
  Recovery = 'recovery',
  Discharge = 'discharge',
  FollowUp = 'follow_up',
  LongTermMonitoring = 'long_term_monitoring',
  CommunityCare = 'community_care',
  HomeCare = 'home_care',
  Deceased = 'deceased',
  Transfer = 'transfer',
  Referral = 'referral',
  Escalation = 'escalation',
  Telemedicine = 'telemedicine',
  Physiotherapy = 'physiotherapy',
}

export interface ClinicalQueue {
  id: string
  departmentId: string
  type: string
  items: QueueItem[]
  priorityOrder: 'fifo' | 'severity' | 'appointment'
}

export interface QueueItem {
  workflowId: string
  patientId: string
  priority: number
  status: 'waiting' | 'in_progress' | 'completed' | 'skipped'
  enteredAt: number
  expectedServiceTime?: number
}

export interface ClinicalTask {
  id: string
  workflowId: string
  type: string
  title: string
  assignedTo?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueAt?: number
  dependsOn: string[]
  escalationLevel: number
  createdAt: number
  completedAt?: number
}

export interface Workflow {
  id: string
  patientId: string
  currentState: PatientState
  previousStates: PatientState[]
  owner: string
  priority: number
  dependencies: string[]
  clock: number
  tasks: ClinicalTask[]
  escalationLevel: number
  createdAt: number
}

export interface EscalationPolicy {
  levels: { level: number; maxWaitMs: number; notifyRoles: string[] }[]
  reEscalationInterval: number
}

export interface OwnershipTransfer {
  id: string
  workflowId: string
  fromOwner: string
  toOwner: string
  type: 'handover' | 'referral' | 'discharge' | 'admission' | 'escalation'
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  reason?: string
  createdAt: number
}
