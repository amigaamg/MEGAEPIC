// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ADOS — Doctor Operating System Types
// Book III Volume I: "The Doctor Never Searches For Work. Work Finds The Doctor."
// ═══════════════════════════════════════════════════════════════════════════════

export type ADOSAssignmentType =
  | 'ward_round' | 'clinic' | 'emergency' | 'icu' | 'theatre'
  | 'telemedicine' | 'private_practice' | 'outreach' | 'admin' | 'off'

export type ADOSWorkspaceType = ADOSAssignmentType | 'home' | 'handover' | 'pre_round'

export type ADOSShiftType = 'morning' | 'afternoon' | 'night' | 'long_day' | 'on_call'

export type ADOSPatientPriority = 'critical' | 'high' | 'medium' | 'low'
export type ADOSPatientStatus = 'waiting' | 'in_progress' | 'reviewed' | 'completed' | 'discharge_ready'
export type ADOSAlertPriority = 'critical' | 'urgent' | 'routine'

export interface ADOSContext {
  doctorId: string
  doctorName: string
  doctorTitle: string
  specialty: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  unitId?: string
  unitName?: string
  shift: ADOSShiftType
  shiftStart: number
  shiftEnd: number
  assignment: ADOSAssignment
  currentLocation: ADOSLocation
  workspace: ADOSWorkspace
  patients: ADOSPatient[]
  queue: ADOSQueueItem[]
  tasks: ADOSTask[]
  alerts: ADOSAlert[]
  notifications: ADOSNotification[]
  ai: ADOSAIState
  handover?: ADOSHandover
  loadedAt: number
}

export interface ADOSAssignment {
  type: ADOSAssignmentType
  label: string
  startTime: number
  endTime: number
  location: string
  details?: string
}

export interface ADOSLocation {
  departmentId: string
  departmentName: string
  ward?: string
  unit?: string
  clinic?: string
  theatre?: string
  building?: string
  floor?: string
}

export interface ADOSWorkspace {
  type: ADOSWorkspaceType
  title: string
  icon: string
  sections: ADOSWorkspaceSection[]
  quickActions: ADOSQuickAction[]
  rightPanel: ADOSRightPanelConfig
  theme?: ADOSWorkspaceTheme
}

export interface ADOSWorkspaceSection {
  id: string
  title: string
  items: any[]
  priority: number
  maxItems?: number
}

export interface ADOSQuickAction {
  id: string
  label: string
  shortcut?: string
  icon?: string
  action: string
  requiresPatient: boolean
  color?: string
}

export interface ADOSRightPanelConfig {
  showAI: boolean
  showOrders: boolean
  showCalculators: boolean
  showGuidelines: boolean
  showMessaging: boolean
}

export interface ADOSWorkspaceTheme {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  cardColor: string
  priority: 'clinical' | 'routine' | 'emergency'
}

export interface ADOSPatient {
  id: string
  name: string
  age: number
  sex: string
  bed?: string
  diagnosis: string
  hospitalDay: number
  priority: ADOSPatientPriority
  status: ADOSPatientStatus
  vitals: ADOSVitals
  alerts: string[]
  tasks: ADOSPatientTask[]
  presentation: string
  location?: string
  consultant?: string
  nextAction?: string
}

export interface ADOSVitals {
  bp: string
  hr: number
  rr: number
  spo2: number
  temp: number
  gcs?: number
  glucose?: number
  painScore?: number
  weight?: number
}

export interface ADOSPatientTask {
  id: string
  label: string
  done: boolean
  priority?: ADOSPatientPriority
  dueBy?: string
}

export interface ADOSQueueItem {
  id: string
  patientId: string
  patientName: string
  priority: number
  status: 'waiting' | 'in_progress' | 'completed' | 'skipped'
  enteredAt: number
  expectedWait?: number
  reason?: string
}

export interface ADOSTask {
  id: string
  type: 'documentation' | 'ordering' | 'review' | 'consult' | 'procedure' | 'discharge' | 'communication'
  title: string
  patientId?: string
  patientName?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: ADOSAlertPriority
  createdAt: number
  dueAt?: number
  assignedTo?: string
  dependsOn: string[]
  escalationLevel: number
}

export interface ADOSAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  patientId?: string
  patientName?: string
  timestamp: number
  acknowledged: boolean
  actionable: boolean
  actionLabel?: string
  actionLink?: string
}

export interface ADOSNotification {
  id: string
  type: 'task' | 'result' | 'message' | 'alert' | 'referral' | 'system'
  title: string
  message: string
  priority: ADOSAlertPriority
  timestamp: number
  read: boolean
  actionable: boolean
  actionLabel?: string
  actionLink?: string
  senderId?: string
  senderName?: string
}

export interface ADOSAIState {
  enabled: boolean
  suggestions: ADOSAISuggestion[]
  pendingActions: string[]
  lastUpdated: number
}

export interface ADOSAISuggestion {
  id: string
  type: 'diagnosis' | 'investigation' | 'treatment' | 'guideline' | 'alert' | 'reminder'
  title: string
  description: string
  confidence: number
  actionable: boolean
  actionLabel?: string
  actionType?: string
}

export interface ADOSHandover {
  id: string
  fromClinicianId: string
  fromClinicianName: string
  toClinicianId?: string
  toClinicianName?: string
  shift: string
  patients: ADOSHandoverPatient[]
  summary: string
  createdAt: number
  acknowledgedAt?: number
  status: 'pending' | 'acknowledged' | 'completed'
  outstandingTasks: number
  criticalCount: number
}

export interface ADOSHandoverPatient {
  id: string
  name: string
  bed: string
  diagnosis: string
  status: 'stable' | 'unstable' | 'critical' | 'discharge_ready'
  pendingTasks: string[]
  pendingResults: string[]
  nightInstructions: string[]
  escalationCriteria: string[]
  dayOfStay: number
  consultant: string
}

export interface ADOSLifecycleState {
  phase: 'authenticating' | 'loading_context' | 'pre_round' | 'working' | 'handover' | 'completed' | 'signed_out'
  context?: ADOSContext
  currentPatientId?: string
  wardRoundIndex: number
  shiftProgress: number
  startTime: number
  lastActivity: number
}

export interface ADOSAnswers {
  whereAmI: string
  myPatients: string[]
  whoNeedsMeFirst: string
  decisionsWaiting: string[]
  whatHappensNext: string[]
  safeHandover: boolean
}

export const SHIFT_TIMES: Record<ADOSShiftType, { start: number; end: number; label: string }> = {
  morning: { start: 7, end: 15, label: '07:00 - 15:00' },
  afternoon: { start: 15, end: 23, label: '15:00 - 23:00' },
  night: { start: 23, end: 7, label: '23:00 - 07:00' },
  long_day: { start: 8, end: 20, label: '08:00 - 20:00' },
  on_call: { start: 0, end: 24, label: '24h On-Call' },
}

export const ASSIGNMENT_LABELS: Record<ADOSAssignmentType, string> = {
  ward_round: 'Ward Round',
  clinic: 'Clinic',
  emergency: 'Emergency Department',
  icu: 'Intensive Care Unit',
  theatre: 'Operating Theatre',
  telemedicine: 'Telemedicine',
  private_practice: 'Private Practice',
  outreach: 'Outreach Clinic',
  admin: 'Administrative',
  off: 'Off Duty',
}
