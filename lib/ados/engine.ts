// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ADOS — Doctor Operating System Engine
// Book III Volume I: "The Doctor Never Searches For Work. Work Finds The Doctor."
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ADOSContext, ADOSAssignment, ADOSLocation, ADOSWorkspace,
  ADOSPatient, ADOSQueueItem, ADOSTask, ADOSAlert, ADOSNotification,
  ADOSAIState, ADOSHandover, ADOSLifecycleState, ADOSAnswers,
  ADOSAssignmentType, ADOSWorkspaceType, ADOSShiftType,
  ADOSWorkspaceSection, ADOSQuickAction, ADOSRightPanelConfig,
  ADOSHandoverPatient, ADOSAISuggestion, ADOSPatientTask, ADOSVitals,
} from './types'
import { SHIFT_TIMES, ASSIGNMENT_LABELS } from './types'

let _idCounter = 0
function uid(prefix: string): string {
  _idCounter++
  return `${prefix}_${Date.now()}_${_idCounter}`
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────

export function createLifecycle(): ADOSLifecycleState {
  return {
    phase: 'authenticating',
    currentPatientId: undefined,
    wardRoundIndex: 0,
    shiftProgress: 0,
    startTime: Date.now(),
    lastActivity: Date.now(),
  }
}

export function transitionLifecycle(
  state: ADOSLifecycleState,
  phase: ADOSLifecycleState['phase'],
  context?: ADOSContext,
): ADOSLifecycleState {
  return { ...state, phase, context, lastActivity: Date.now() }
}

// ── Context Builder ────────────────────────────────────────────────────────────

export function buildADOSContext(params: {
  doctorId: string
  doctorName: string
  doctorTitle?: string
  specialty?: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  unitId?: string
  unitName?: string
  shift: ADOSShiftType
  assignmentType: ADOSAssignmentType
  assignmentLabel?: string
  location: ADOSLocation
  patients: ADOSPatient[]
  queue?: ADOSQueueItem[]
  tasks?: ADOSTask[]
  alerts?: ADOSAlert[]
  notifications?: ADOSNotification[]
  handover?: ADOSHandover
}): ADOSContext {
  const assignment: ADOSAssignment = {
    type: params.assignmentType,
    label: params.assignmentLabel || ASSIGNMENT_LABELS[params.assignmentType],
    startTime: Date.now(),
    endTime: Date.now() + 8 * 3600000,
    location: params.location.departmentName,
  }

  const shiftStart = getShiftStart(params.shift)
  const shiftEnd = getShiftEnd(params.shift)

  const workspace = generateADOSWorkspace(params.assignmentType, params.location)

  const queue = params.queue || []
  const tasks = params.tasks || []
  const alerts = params.alerts || []
  const notifications = params.notifications || []

  const ai: ADOSAIState = {
    enabled: true,
    suggestions: generateSuggestions(params.patients, tasks),
    pendingActions: [],
    lastUpdated: Date.now(),
  }

  return {
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    doctorTitle: params.doctorTitle || 'Physician',
    specialty: params.specialty || 'General Medicine',
    organizationId: params.organizationId,
    organizationName: params.organizationName,
    departmentId: params.departmentId,
    departmentName: params.departmentName,
    unitId: params.unitId,
    unitName: params.unitName,
    shift: params.shift,
    shiftStart,
    shiftEnd,
    assignment,
    currentLocation: params.location,
    workspace,
    patients: params.patients,
    queue,
    tasks,
    alerts,
    notifications,
    ai,
    handover: params.handover,
    loadedAt: Date.now(),
  }
}

// ── Workspace Generator ────────────────────────────────────────────────────────

export function generateADOSWorkspace(
  assignmentType: ADOSAssignmentType,
  location: ADOSLocation,
): ADOSWorkspace {
  switch (assignmentType) {
    case 'ward_round':
      return wardRoundWorkspace(location)
    case 'clinic':
      return clinicWorkspace(location)
    case 'emergency':
      return emergencyWorkspace(location)
    case 'icu':
      return icuWorkspace(location)
    case 'theatre':
      return theatreWorkspace()
    case 'telemedicine':
      return telemedicineWorkspace()
    case 'private_practice':
      return privatePracticeWorkspace()
    case 'outreach':
      return outreachWorkspace(location)
    case 'admin':
      return adminWorkspace()
    default:
      return defaultWorkspace()
  }
}

function wardRoundWorkspace(location: ADOSLocation): ADOSWorkspace {
  return {
    type: 'ward_round',
    title: `Ward Round — ${location.ward || location.departmentName}`,
    icon: 'Footprints',
    sections: [
      { id: 'patient-queue', title: 'Patient Queue', items: [], priority: 1 },
      { id: 'current-patient', title: 'Current Patient', items: [], priority: 0 },
      { id: 'ai-summary', title: 'AI Summary', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'cbc', label: 'CBC', shortcut: 'Alt+C', action: 'order_lab', requiresPatient: true },
      { id: 'ct-abdomen', label: 'CT Abdomen', shortcut: 'Alt+I', action: 'order_imaging', requiresPatient: true },
      { id: 'discharge', label: 'Discharge', shortcut: 'Alt+D', action: 'start_discharge', requiresPatient: true },
      { id: 'consult', label: 'Consult', shortcut: 'Alt+R', action: 'request_consult', requiresPatient: true },
      { id: 'prescribe', label: 'Prescribe', shortcut: 'Alt+P', action: 'prescribe', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showCalculators: true, showGuidelines: true, showMessaging: true },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'clinical' },
  }
}

function clinicWorkspace(location: ADOSLocation): ADOSWorkspace {
  return {
    type: 'clinic',
    title: `Clinic — ${location.clinic || location.departmentName}`,
    icon: 'Calendar',
    sections: [
      { id: 'queue', title: 'Waiting Patients', items: [], priority: 1 },
      { id: 'current', title: 'Current Patient', items: [], priority: 0 },
      { id: 'appointments', title: 'Upcoming Appointments', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'prescribe', label: 'Prescribe', shortcut: 'Alt+P', action: 'prescribe', requiresPatient: true },
      { id: 'lab', label: 'Lab Order', shortcut: 'Alt+L', action: 'order_lab', requiresPatient: true },
      { id: 'refer', label: 'Refer', shortcut: 'Alt+R', action: 'refer', requiresPatient: true },
      { id: 'follow-up', label: 'Follow-up', shortcut: 'Alt+F', action: 'schedule_follow_up', requiresPatient: true },
      { id: 'certificate', label: 'Medical Certificate', shortcut: 'Alt+M', action: 'generate_certificate', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showCalculators: true, showGuidelines: true, showMessaging: false },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'routine' },
  }
}

function emergencyWorkspace(location: ADOSLocation): ADOSWorkspace {
  return {
    type: 'emergency',
    title: `Emergency Department — ${location.departmentName}`,
    icon: 'AlertTriangle',
    sections: [
      { id: 'resus', title: 'Resuscitation', items: [], priority: 0 },
      { id: 'critical', title: 'Critical Queue', items: [], priority: 1 },
      { id: 'waiting', title: 'Waiting', items: [], priority: 3 },
      { id: 'results', title: 'Pending Results', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'intubate', label: 'Intubate', action: 'airway', requiresPatient: true, color: '#EF4444' },
      { id: 'defib', label: 'Defibrillate', action: 'defibrillate', requiresPatient: true, color: '#EF4444' },
      { id: 'fluids', label: 'IV Fluids', action: 'order_fluids', requiresPatient: true },
      { id: 'ct-brain', label: 'CT Brain (Stroke)', action: 'order_ct_brain', requiresPatient: true, color: '#8B5CF6' },
      { id: 'troponin', label: 'Troponin', action: 'order_troponin', requiresPatient: true },
      { id: 'blood-culture', label: 'Blood Culture', action: 'order_blood_culture', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showCalculators: true, showGuidelines: true, showMessaging: true },
    theme: { primaryColor: '#EF4444', accentColor: '#FEF2F2', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'emergency' },
  }
}

function icuWorkspace(location: ADOSLocation): ADOSWorkspace {
  return {
    type: 'icu',
    title: `ICU — ${location.departmentName}`,
    icon: 'Monitor',
    sections: [
      { id: 'ventilated', title: 'Ventilated Patients', items: [], priority: 1 },
      { id: 'weaning', title: 'Weaning', items: [], priority: 2 },
      { id: 'alerts', title: 'Alerts', items: [], priority: 0 },
    ],
    quickActions: [
      { id: 'abg', label: 'ABG', action: 'order_abg', requiresPatient: true },
      { id: 'cxr', label: 'Chest XR', action: 'order_cxr', requiresPatient: true },
      { id: 'pressors', label: 'Adjust Pressors', action: 'adjust_pressors', requiresPatient: true },
      { id: 'sedation', label: 'Sedation Review', action: 'sedation_review', requiresPatient: true },
      { id: 'echo', label: 'Bedside Echo', action: 'order_echo', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showCalculators: true, showGuidelines: true, showMessaging: true },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'clinical' },
  }
}

function theatreWorkspace(): ADOSWorkspace {
  return {
    type: 'theatre',
    title: 'Operating Theatre — Today\'s List',
    icon: 'Scissors',
    sections: [
      { id: 'list', title: 'Operating List', items: [], priority: 1 },
      { id: 'current', title: 'Current Case', items: [], priority: 0 },
      { id: 'recovery', title: 'Recovery', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'checklist', label: 'Surgical Checklist', action: 'open_checklist', requiresPatient: true },
      { id: 'note', label: 'Operation Note', action: 'write_op_note', requiresPatient: true },
      { id: 'images', label: 'View Images', action: 'view_imaging', requiresPatient: true },
      { id: 'consent', label: 'Consent', action: 'review_consent', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: true, showCalculators: false, showGuidelines: true, showMessaging: true },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'clinical' },
  }
}

function telemedicineWorkspace(): ADOSWorkspace {
  return {
    type: 'telemedicine',
    title: 'Telemedicine',
    icon: 'Video',
    sections: [
      { id: 'queue', title: 'Video Queue', items: [], priority: 1 },
      { id: 'current', title: 'Current Call', items: [], priority: 0 },
      { id: 'upcoming', title: 'Upcoming', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'prescribe', label: 'ePrescribe', action: 'prescribe', requiresPatient: true },
      { id: 'refer', label: 'Refer', action: 'refer', requiresPatient: true },
      { id: 'sick-note', label: 'Medical Certificate', action: 'generate_certificate', requiresPatient: true },
      { id: 'education', label: 'Patient Education', action: 'send_education', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showCalculators: false, showGuidelines: true, showMessaging: false },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'routine' },
  }
}

function privatePracticeWorkspace(): ADOSWorkspace {
  return {
    type: 'private_practice',
    title: 'Private Practice',
    icon: 'Stethoscope',
    sections: [
      { id: 'patients', title: 'My Patients', items: [], priority: 1 },
      { id: 'appointments', title: 'Today\'s Appointments', items: [], priority: 0 },
      { id: 'billing', title: 'Billing Summary', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'schedule', label: 'Schedule Appointment', action: 'schedule', requiresPatient: false },
      { id: 'prescribe', label: 'Prescribe', action: 'prescribe', requiresPatient: true },
      { id: 'refer', label: 'Refer', action: 'refer', requiresPatient: true },
      { id: 'invoice', label: 'Generate Invoice', action: 'generate_invoice', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showCalculators: false, showGuidelines: true, showMessaging: true },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'routine' },
  }
}

function outreachWorkspace(location: ADOSLocation): ADOSWorkspace {
  return {
    type: 'outreach',
    title: `Outreach — ${location.departmentName}`,
    icon: 'Users',
    sections: [
      { id: 'patients', title: 'Patients', items: [], priority: 1 },
      { id: 'screening', title: 'Screening Queue', items: [], priority: 0 },
      { id: 'supplies', title: 'Supplies', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'register', label: 'Register Patient', action: 'register', requiresPatient: false },
      { id: 'vaccinate', label: 'Administer Vaccine', action: 'vaccinate', requiresPatient: true },
      { id: 'refer', label: 'Refer', action: 'refer', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: false, showCalculators: false, showGuidelines: true, showMessaging: false },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'routine' },
  }
}

function adminWorkspace(): ADOSWorkspace {
  return {
    type: 'admin',
    title: 'Administrative',
    icon: 'Settings',
    sections: [
      { id: 'tasks', title: 'Pending Tasks', items: [], priority: 1 },
      { id: 'reports', title: 'Reports', items: [], priority: 2 },
      { id: 'team', title: 'Team Overview', items: [], priority: 0 },
    ],
    quickActions: [
      { id: 'approve', label: 'Approve Requests', action: 'approve', requiresPatient: false },
      { id: 'report', label: 'Generate Report', action: 'generate_report', requiresPatient: false },
      { id: 'schedule', label: 'Manage Schedules', action: 'manage_schedule', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showCalculators: false, showGuidelines: false, showMessaging: true },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'routine' },
  }
}

function defaultWorkspace(): ADOSWorkspace {
  return {
    type: 'home',
    title: 'Clinical Workspace',
    icon: 'LayoutDashboard',
    sections: [
      { id: 'tasks', title: 'Tasks', items: [], priority: 1 },
      { id: 'patients', title: 'Patients', items: [], priority: 2 },
    ],
    quickActions: [
      { id: 'search', label: 'Search Patient', shortcut: 'Ctrl+K', action: 'search', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: false, showCalculators: false, showGuidelines: true, showMessaging: true },
    theme: { primaryColor: '#2F80ED', accentColor: '#EBF5FF', backgroundColor: '#F8FAFC', cardColor: '#FFFFFF', priority: 'routine' },
  }
}

// ── AI Suggestions ─────────────────────────────────────────────────────────────

export function generateSuggestions(patients: ADOSPatient[], tasks: ADOSTask[]): ADOSAISuggestion[] {
  const suggestions: ADOSAISuggestion[] = []

  const criticalPatients = patients.filter(p => p.priority === 'critical')
  if (criticalPatients.length > 0) {
    suggestions.push({
      id: uid('ai'),
      type: 'alert',
      title: `${criticalPatients.length} Critical Patient(s)`,
      description: criticalPatients.map(p => `${p.name} (${p.diagnosis})`).join(', '),
      confidence: 100,
      actionable: true,
      actionLabel: 'View Critical Patients',
      actionType: 'focus_critical',
    })
  }

  const dischargeReady = patients.filter(p => p.status === 'discharge_ready')
  if (dischargeReady.length > 0) {
    suggestions.push({
      id: uid('ai'),
      type: 'reminder',
      title: `${dischargeReady.length} Patient(s) Ready for Discharge`,
      description: 'Review and finalize discharge summaries',
      confidence: 95,
      actionable: true,
      actionLabel: 'Review Discharges',
      actionType: 'review_discharges',
    })
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'critical')
  if (pendingTasks.length > 0) {
    suggestions.push({
      id: uid('ai'),
      type: 'reminder',
      title: 'Critical Tasks Pending',
      description: `${pendingTasks.length} critical tasks require immediate attention`,
      confidence: 100,
      actionable: true,
      actionLabel: 'View Critical Tasks',
      actionType: 'view_tasks',
    })
  }

  return suggestions
}

// ── The Six ADOS Questions ─────────────────────────────────────────────────────

export function answerADOSQuestions(context: ADOSContext): ADOSAnswers {
  const priorityPatient = context.queue
    .filter(q => q.status === 'waiting')
    .sort((a, b) => a.priority - b.priority)[0]

  return {
    whereAmI: `${context.departmentName} — ${context.assignment.label} (${context.currentLocation.ward || context.currentLocation.clinic || context.currentLocation.departmentName})`,
    myPatients: context.patients.map(p => `${p.name} (${p.bed || 'No bed'})${p.priority === 'critical' ? ' ⚠️' : ''}`),
    whoNeedsMeFirst: priorityPatient
      ? `${priorityPatient.patientName} (Priority ${priorityPatient.priority})`
      : 'No waiting patients — review pending tasks',
    decisionsWaiting: context.tasks
      .filter(t => (t.type === 'review' || t.type === 'discharge') && t.status === 'pending')
      .map(t => `${t.title}${t.patientName ? ` — ${t.patientName}` : ''}`),
    whatHappensNext: [
      ...context.workspace.sections.map(s => s.title),
      ...context.workspace.quickActions.slice(0, 3).map(a => a.label),
    ],
    safeHandover: context.tasks.filter(t => t.status !== 'completed').length === 0,
  }
}

// ── Handover ───────────────────────────────────────────────────────────────────

export function createADOSHandover(params: {
  fromClinicianId: string
  fromClinicianName: string
  patients: ADOSPatient[]
  tasks: ADOSTask[]
  summary: string
}): ADOSHandover {
  const handoverPatients: ADOSHandoverPatient[] = params.patients.map(p => {
    const patientTasks = params.tasks.filter(t => t.patientId === p.id)
    return {
      id: p.id,
      name: p.name,
      bed: p.bed || 'N/A',
      diagnosis: p.diagnosis,
      status: p.priority === 'critical' ? 'critical' : p.status === 'discharge_ready' ? 'discharge_ready' : 'stable',
      pendingTasks: patientTasks.filter(t => t.status !== 'completed').map(t => t.title),
      pendingResults: [],
      nightInstructions: [],
      escalationCriteria: p.priority === 'critical' ? ['MAP < 65', 'GCS drop > 2', 'SpO2 < 90%'] : [],
      dayOfStay: p.hospitalDay,
      consultant: p.consultant || 'Unassigned',
    }
  })

  const outstandingTasks = params.tasks.filter(t => t.status !== 'completed').length
  const criticalCount = handoverPatients.filter(p => p.status === 'critical').length

  return {
    id: uid('ho'),
    fromClinicianId: params.fromClinicianId,
    fromClinicianName: params.fromClinicianName,
    shift: 'Morning',
    patients: handoverPatients,
    summary: params.summary,
    createdAt: Date.now(),
    status: 'pending',
    outstandingTasks,
    criticalCount,
  }
}

export function acknowledgeADOSHandover(handover: ADOSHandover, clinicianId: string, clinicianName: string): ADOSHandover {
  return {
    ...handover,
    toClinicianId: clinicianId,
    toClinicianName: clinicianName,
    acknowledgedAt: Date.now(),
    status: 'acknowledged',
  }
}

// ── Shift Helpers ──────────────────────────────────────────────────────────────

export function getShiftStart(shift: ADOSShiftType): number {
  const now = new Date()
  const hours = SHIFT_TIMES[shift].start
  now.setHours(hours, 0, 0, 0)
  return now.getTime()
}

export function getShiftEnd(shift: ADOSShiftType): number {
  const now = new Date()
  const hours = SHIFT_TIMES[shift].end
  now.setHours(hours, 0, 0, 0)
  if (hours <= SHIFT_TIMES[shift].start) {
    now.setDate(now.getDate() + 1)
  }
  return now.getTime()
}

export function getShiftProgress(start: number, end: number): number {
  const now = Date.now()
  const total = end - start
  const elapsed = now - start
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

export function getShiftRemaining(start: number, end: number): string {
  const now = Date.now()
  const remaining = end - now
  if (remaining <= 0) return 'Shift Over'
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  return `${hours}h ${minutes}m remaining`
}

// ── Task Management ────────────────────────────────────────────────────────────

export function createTask(params: {
  type: ADOSTask['type']
  title: string
  patientId?: string
  patientName?: string
  priority?: ADOSTask['priority']
  dueAt?: number
}): ADOSTask {
  return {
    id: uid('task'),
    type: params.type,
    title: params.title,
    patientId: params.patientId,
    patientName: params.patientName,
    status: 'pending',
    priority: params.priority || 'routine',
    createdAt: Date.now(),
    dueAt: params.dueAt,
    dependsOn: [],
    escalationLevel: 0,
  }
}

export function escalateTask(task: ADOSTask): ADOSTask {
  return {
    ...task,
    escalationLevel: Math.min(3, task.escalationLevel + 1),
    priority: task.escalationLevel >= 1 ? 'critical' : task.priority,
  }
}

// ── Queue Intelligence ─────────────────────────────────────────────────────────

export function prioritizeQueue(items: ADOSQueueItem[], patients: ADOSPatient[]): ADOSQueueItem[] {
  return [...items].sort((a, b) => {
    const pA = patients.find(p => p.id === a.patientId)
    const pB = patients.find(p => p.id === b.patientId)
    const priorityA = pA ? (pA.priority === 'critical' ? 0 : pA.priority === 'high' ? 1 : pA.priority === 'medium' ? 2 : 3) : 3
    const priorityB = pB ? (pB.priority === 'critical' ? 0 : pB.priority === 'high' ? 1 : pB.priority === 'medium' ? 2 : 3) : 3
    if (priorityA !== priorityB) return priorityA - priorityB
    return a.enteredAt - b.enteredAt
  })
}

// ── Notification Triage ────────────────────────────────────────────────────────

export function triageNotifications(notifications: ADOSNotification[]): {
  critical: ADOSNotification[]
  urgent: ADOSNotification[]
  routine: ADOSNotification[]
} {
  return {
    critical: notifications.filter(n => n.priority === 'critical' && !n.read),
    urgent: notifications.filter(n => n.priority === 'urgent' && !n.read),
    routine: notifications.filter(n => n.priority === 'routine' || n.read),
  }
}

// ── End-of-Shift Summary ───────────────────────────────────────────────────────

export function generateEndOfShiftSummary(context: ADOSContext): {
  outstandingPatients: number
  outstandingNotes: number
  pendingReferrals: number
  pendingLabs: number
  pendingDischarges: number
  handoverRequired: boolean
  summaryItems: { label: string; value: number; color: string }[]
} {
  const outstandingPatients = context.patients.filter(p => p.priority === 'critical' || p.priority === 'high').length
  const outstandingNotes = context.tasks.filter(t => t.type === 'documentation' && t.status !== 'completed').length
  const pendingReferrals = context.tasks.filter(t => t.type === 'consult' && t.status !== 'completed').length
  const pendingLabs = context.tasks.filter(t => t.type === 'ordering' && t.status !== 'completed').length
  const pendingDischarges = context.patients.filter(p => p.status === 'discharge_ready').length

  return {
    outstandingPatients,
    outstandingNotes,
    pendingReferrals,
    pendingLabs,
    pendingDischarges,
    handoverRequired: context.patients.length > 0,
    summaryItems: [
      { label: 'Patients Under Care', value: context.patients.length, color: '#2F80ED' },
      { label: 'Outstanding', value: outstandingPatients, color: '#EF4444' },
      { label: 'Notes Pending', value: outstandingNotes, color: '#F59E0B' },
      { label: 'Pending Labs/Orders', value: pendingLabs, color: '#8B5CF6' },
      { label: 'Ready for Discharge', value: pendingDischarges, color: '#10B981' },
      { label: 'Pending Referrals', value: pendingReferrals, color: '#F59E0B' },
    ],
  }
}
