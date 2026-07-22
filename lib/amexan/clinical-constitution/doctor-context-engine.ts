// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Doctor Operational Context Engine (ADOS)
// Book III Volume I: The doctor never searches for work
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  DoctorContext, DoctorShift, DoctorAssignment, DoctorLocation,
  ActivePatient, DoctorWorkspace, DoctorNotification,
  AIAssistantState, WardRound, WardRoundPatient,
  PatientPresentation, InvestigationTrend,
  HandoverNote, HandoverPatient,
  AssignmentType, WorkspaceType,
} from './types';

import type { AmxUid } from '../constitution/types';

import { computeWorkflowHealth, type WorkflowHealthSnapshot } from './workflow-engine';
import type { ClinicalTask, QueueItem, WorkflowInstance } from './types';

let _counter = 0;
function uid(prefix: string): string {
  _counter++;
  return `${prefix}_${Date.now()}_${_counter}`;
}

// ── Build Doctor Context ──────────────────────────────────────────────────────
// The primary entry point. Generates the full ADOS context from
// the doctor's identity, organization, schedule, and current workload.

export function buildDoctorContext(params: {
  doctorId: AmxUid;
  doctorName: string;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  unitId?: string;
  unitName?: string;
  shift: DoctorShift;
  assignment: DoctorAssignment;
  currentLocation: DoctorLocation;
  activePatients: ActivePatient[];
  patientQueue: QueueItem[];
  pendingTasks: ClinicalTask[];
  notifications: DoctorNotification[];
  workflows?: WorkflowInstance[];
}): DoctorContext {
  const workspace = generateWorkspace(params.assignment.type, params.currentLocation);
  const healthSnapshot = params.workflows
    ? computeWorkflowHealth(params.workflows, params.pendingTasks)
    : undefined;

  // Add workflow health as a notification if there are critical items
  const allNotifications = [...params.notifications];
  if (healthSnapshot && healthSnapshot.escalatedTasks > 0) {
    allNotifications.push({
      id: uid('notif'),
      type: 'escalation',
      title: `Escalated Tasks`,
      message: `${healthSnapshot.escalatedTasks} task(s) have been escalated and require attention`,
      priority: 'critical',
      timestamp: Date.now(),
      read: false,
      actionable: true,
      actionLabel: 'View Escalated Tasks',
      actionLink: '/tasks/escalated',
    });
  }

  return {
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    organizationId: params.organizationId,
    organizationName: params.organizationName,
    departmentId: params.departmentId,
    departmentName: params.departmentName,
    unitId: params.unitId,
    unitName: params.unitName,
    shift: params.shift,
    assignment: params.assignment,
    currentLocation: params.currentLocation,
    activePatients: params.activePatients,
    patientQueue: params.patientQueue,
    pendingTasks: params.pendingTasks,
    notifications: allNotifications,
    workspace,
    aiAssistant: { enabled: true, suggestions: [], pendingActions: [] },
    loadedAt: Date.now(),
  };
}

// ── Workspace Generator ───────────────────────────────────────────────────────
// Generates the doctor's workspace based on assignment type and location.
// No two assignment types produce the same workspace.

export function generateWorkspace(
  assignmentType: AssignmentType,
  location: DoctorLocation,
): DoctorWorkspace {
  switch (assignmentType) {
    case 'ward_round':
      return {
        type: 'ward_round',
        title: `Ward Round — ${location.ward ?? location.departmentName}`,
        sections: [
          { id: 'patient-queue', title: 'Patient Queue', items: [], priority: 1 },
          { id: 'current-patient', title: 'Current Patient', items: [], priority: 0 },
          { id: 'ai-summary', title: 'AI Summary', items: [], priority: 2 },
        ],
        quickActions: [
          { id: 'cbc', label: 'CBC', shortcut: 'Alt+C', action: 'order_lab', requiresPatient: true },
          { id: 'imaging', label: 'CT Abdomen', shortcut: 'Alt+I', action: 'order_imaging', requiresPatient: true },
          { id: 'discharge', label: 'Discharge', shortcut: 'Alt+D', action: 'start_discharge', requiresPatient: true },
          { id: 'consult', label: 'Consult', shortcut: 'Alt+R', action: 'request_consult', requiresPatient: true },
          { id: 'prescribe', label: 'Prescribe', shortcut: 'Alt+P', action: 'prescribe', requiresPatient: true },
        ],
        rightPanel: { showAI: true, showOrders: true, showCalculators: true, showGuidelines: true, showMessaging: true },
      };

    case 'clinic':
      return {
        type: 'clinic',
        title: `Clinic — ${location.clinic ?? location.departmentName}`,
        sections: [
          { id: 'queue', title: 'Waiting Patients', items: [], priority: 1 },
          { id: 'current', title: 'Current Patient', items: [], priority: 0 },
        ],
        quickActions: [
          { id: 'prescribe', label: 'Prescribe', shortcut: 'Alt+P', action: 'prescribe', requiresPatient: true },
          { id: 'lab', label: 'Lab Order', shortcut: 'Alt+L', action: 'order_lab', requiresPatient: true },
          { id: 'refer', label: 'Refer', shortcut: 'Alt+R', action: 'refer', requiresPatient: true },
          { id: 'follow-up', label: 'Follow-up', shortcut: 'Alt+F', action: 'schedule_follow_up', requiresPatient: true },
        ],
        rightPanel: { showAI: true, showOrders: false, showCalculators: true, showGuidelines: true, showMessaging: false },
      };

    case 'emergency':
      return {
        type: 'emergency',
        title: `Emergency Department — ${location.departmentName}`,
        sections: [
          { id: 'resus', title: 'Resuscitation', items: [], priority: 0 },
          { id: 'critical', title: 'Critical Queue', items: [], priority: 1 },
          { id: 'waiting', title: 'Waiting', items: [], priority: 3 },
          { id: 'results', title: 'Pending Results', items: [], priority: 2 },
        ],
        quickActions: [
          { id: 'intubate', label: 'Intubate', shortcut: '', action: 'airway', requiresPatient: true },
          { id: 'defib', label: 'Defibrillate', shortcut: '', action: 'defibrillate', requiresPatient: true },
          { id: 'fluids', label: 'IV Fluids', shortcut: '', action: 'order_fluids', requiresPatient: true },
          { id: 'ct-brain', label: 'CT Brain (Stroke)', shortcut: '', action: 'order_ct_brain', requiresPatient: true },
          { id: 'troponin', label: 'Troponin', shortcut: '', action: 'order_troponin', requiresPatient: true },
          { id: 'blood-culture', label: 'Blood Culture', shortcut: '', action: 'order_blood_culture', requiresPatient: true },
        ],
        rightPanel: { showAI: true, showOrders: true, showCalculators: true, showGuidelines: true, showMessaging: true },
      };

    case 'icu':
      return {
        type: 'icu',
        title: `ICU — ${location.departmentName}`,
        sections: [
          { id: 'ventilated', title: 'Ventilated Patients', items: [], priority: 1 },
          { id: 'weaning', title: 'Weaning', items: [], priority: 2 },
          { id: 'alerts', title: 'Alerts', items: [], priority: 0 },
        ],
        quickActions: [
          { id: 'abg', label: 'ABG', shortcut: '', action: 'order_abg', requiresPatient: true },
          { id: 'cxr', label: 'Chest XR', shortcut: '', action: 'order_cxr', requiresPatient: true },
          { id: 'pressors', label: 'Adjust Pressors', shortcut: '', action: 'adjust_pressors', requiresPatient: true },
          { id: 'sedation', label: 'Sedation Review', shortcut: '', action: 'sedation_review', requiresPatient: true },
        ],
        rightPanel: { showAI: true, showOrders: true, showCalculators: true, showGuidelines: true, showMessaging: true },
      };

    case 'theatre':
      return {
        type: 'theatre',
        title: `Theatre — Today's List`,
        sections: [
          { id: 'list', title: 'Operating List', items: [], priority: 1 },
          { id: 'current', title: 'Current Case', items: [], priority: 0 },
          { id: 'recovery', title: 'Recovery', items: [], priority: 2 },
        ],
        quickActions: [
          { id: 'checklist', label: 'Surgical Checklist', shortcut: '', action: 'open_checklist', requiresPatient: true },
          { id: 'note', label: 'Operation Note', shortcut: '', action: 'write_op_note', requiresPatient: true },
          { id: 'images', label: 'View Images', shortcut: '', action: 'view_imaging', requiresPatient: true },
        ],
        rightPanel: { showAI: false, showOrders: true, showCalculators: false, showGuidelines: true, showMessaging: true },
      };

    case 'telemedicine':
      return {
        type: 'telemedicine',
        title: 'Telemedicine',
        sections: [
          { id: 'queue', title: 'Video Queue', items: [], priority: 1 },
          { id: 'current', title: 'Current Call', items: [], priority: 0 },
        ],
        quickActions: [
          { id: 'prescribe', label: 'ePrescribe', shortcut: '', action: 'prescribe', requiresPatient: true },
          { id: 'refer', label: 'Refer', shortcut: '', action: 'refer', requiresPatient: true },
          { id: 'sick-note', label: 'Medical Certificate', shortcut: '', action: 'generate_certificate', requiresPatient: true },
        ],
        rightPanel: { showAI: true, showOrders: false, showCalculators: false, showGuidelines: true, showMessaging: false },
      };

    default:
      return {
        type: 'home',
        title: 'Clinical Workspace',
        sections: [
          { id: 'tasks', title: 'Tasks', items: [], priority: 1 },
          { id: 'patients', title: 'Patients', items: [], priority: 2 },
        ],
        quickActions: [
          { id: 'search', label: 'Search Patient', shortcut: 'Ctrl+K', action: 'search', requiresPatient: false },
        ],
        rightPanel: { showAI: true, showOrders: false, showCalculators: false, showGuidelines: true, showMessaging: true },
      };
  }
}

// ── Ward Round Management ─────────────────────────────────────────────────────

export function createWardRound(params: {
  doctorId: AmxUid;
  wardId: string;
  wardName: string;
  patients: Omit<WardRoundPatient, 'presentation' | 'reviewed' | 'decision'>[];
}): WardRound {
  return {
    id: uid('wr'),
    doctorId: params.doctorId,
    wardId: params.wardId,
    wardName: params.wardName,
    startedAt: Date.now(),
    patients: params.patients.map(p => ({
      ...p,
      presentation: createEmptyPresentation(p.name),
      reviewed: false,
    })),
    currentPatientIndex: 0,
    status: 'preparing',
  };
}

export function startWardRound(round: WardRound): WardRound {
  return { ...round, status: 'in_progress', startedAt: Date.now() };
}

export function nextPatient(round: WardRound): WardRound {
  const nextIndex = round.currentPatientIndex + 1;
  if (nextIndex >= round.patients.length) {
    return { ...round, status: 'completed', completedAt: Date.now() };
  }
  return { ...round, currentPatientIndex: nextIndex };
}

export function reviewPatient(
  round: WardRound,
  patientId: string,
  presentation: Partial<PatientPresentation>,
  decision?: string,
): WardRound {
  return {
    ...round,
    patients: round.patients.map(p =>
      p.patientId === patientId
        ? {
            ...p,
            reviewed: true,
            decision: decision as any,
            presentation: { ...p.presentation, ...presentation },
          }
        : p
    ),
  };
}

function createEmptyPresentation(name: string): PatientPresentation {
  return {
    identity: { name, age: 0, sex: '', hospitalDay: 0, bed: '', consultant: '' },
    chiefProblem: '',
    overnightEvents: [],
    currentStatus: {
      vitals: [],
      newsScore: 0,
    },
    inputOutput: { fluidBalance: '', urine: '' },
    investigations: [],
    currentTreatment: [],
    assessment: '',
    plan: '',
  };
}

// ── Presentation Builder ──────────────────────────────────────────────────────
// Builds the structured patient presentation for ward rounds.

export function buildPresentation(params: {
  name: string;
  age: number;
  sex: string;
  hospitalDay: number;
  bed: string;
  consultant: string;
  chiefProblem: string;
  overnightEvents: string[];
  vitals: { name: string; value: any; unit?: string }[];
  newsScore: number;
  fluidBalance: string;
  urine: string;
  investigationTrends: InvestigationTrend[];
  treatment: string[];
  assessment: string;
  plan: string;
}): PatientPresentation {
  return {
    identity: {
      name: params.name,
      age: params.age,
      sex: params.sex,
      hospitalDay: params.hospitalDay,
      bed: params.bed,
      consultant: params.consultant,
    },
    chiefProblem: params.chiefProblem,
    overnightEvents: params.overnightEvents,
    currentStatus: {
      vitals: params.vitals.map(v => ({
        concept: v.name,
        displayName: v.name,
        value: v.value,
        unit: v.unit,
        flags: [],
      })),
      newsScore: params.newsScore,
    },
    inputOutput: {
      fluidBalance: params.fluidBalance,
      urine: params.urine,
    },
    investigations: params.investigationTrends,
    currentTreatment: params.treatment,
    assessment: params.assessment,
    plan: params.plan,
  };
}

// ── Handover ──────────────────────────────────────────────────────────────────

export function createHandover(params: {
  fromClinicianId: string;
  fromClinicianName: string;
  toClinicianId: string;
  toClinicianName: string;
  shift: string;
  patients: Omit<HandoverPatient, 'status'>[];
  summary: string;
}): HandoverNote {
  return {
    id: uid('ho'),
    fromClinicianId: params.fromClinicianId,
    fromClinicianName: params.fromClinicianName,
    toClinicianId: params.toClinicianId,
    toClinicianName: params.toClinicianName,
    shift: params.shift,
    patients: params.patients.map(p => ({
      ...p,
      status: 'stable' as const,
    })),
    summary: params.summary,
    createdAt: Date.now(),
  };
}

export function acknowledgeHandover(handover: HandoverNote): HandoverNote {
  return { ...handover, acknowledgedAt: Date.now() };
}

// ── AI Assistant ──────────────────────────────────────────────────────────────

export function updateAISuggestions(
  ai: AIAssistantState,
  suggestions: string[],
): AIAssistantState {
  return { ...ai, suggestions };
}

export function addAIAction(
  ai: AIAssistantState,
  action: string,
): AIAssistantState {
  return {
    ...ai,
    pendingActions: [...ai.pendingActions, action],
  };
}

export function clearAIActions(ai: AIAssistantState): AIAssistantState {
  return { ...ai, pendingActions: [] };
}

// ── Notification Triage ──────────────────────────────────────────────────────

export function triageNotifications(notifications: DoctorNotification[]): {
  critical: DoctorNotification[];
  urgent: DoctorNotification[];
  routine: DoctorNotification[];
} {
  return {
    critical: notifications.filter(n => n.priority === 'critical' && !n.read),
    urgent: notifications.filter(n => n.priority === 'urgent' && !n.read),
    routine: notifications.filter(n => n.priority === 'routine' || n.read),
  };
}

// ── End-of-Shift Summary ──────────────────────────────────────────────────────

export function generateEndOfShiftSummary(
  activePatients: ActivePatient[],
  pendingTasks: ClinicalTask[],
): {
  outstandingPatients: number;
  outstandingNotes: number;
  pendingReferrals: number;
  pendingLabs: number;
  pendingDischarges: number;
  handoverRequired: boolean;
} {
  return {
    outstandingPatients: activePatients.filter(p => p.status !== 'stable').length,
    outstandingNotes: pendingTasks.filter(t => t.type === 'documentation' && t.status !== 'completed').length,
    pendingReferrals: pendingTasks.filter(t => t.type === 'consult_request' && t.status !== 'completed').length,
    pendingLabs: pendingTasks.filter(t => t.type === 'ordering' && t.title.toLowerCase().includes('lab')).length,
    pendingDischarges: activePatients.filter(p => p.status === 'ready_for_discharge').length,
    handoverRequired: activePatients.length > 0,
  };
}

// ── Doctor Question Answering (ADOS 6 Questions) ──────────────────────────────

export function answerADOSQuestions(context: DoctorContext): {
  whereAmI: string;
  myPatients: string[];
  whoNeedsMeFirst: string;
  decisionsWaiting: string[];
  whatHappensNext: string[];
  safeHandover: boolean;
} {
  const priorityPatient = context.patientQueue
    .filter(q => q.status === 'waiting')
    .sort((a, b) => a.priority - b.priority)[0];

  return {
    whereAmI: `${context.departmentName ?? 'Unknown'}, ${context.assignment.type} — ${context.assignment.location}`,
    myPatients: context.activePatients.map(p => `${p.name} (${p.bed ?? 'No bed'})`),
    whoNeedsMeFirst: priorityPatient
      ? `${priorityPatient.patientName} (Priority ${priorityPatient.priority})`
      : 'No waiting patients',
    decisionsWaiting: context.pendingTasks
      .filter(t => t.type === 'review' && t.status === 'pending')
      .map(t => t.title),
    whatHappensNext: [
      ...context.workspace.sections.map(s => s.title),
      ...context.workspace.quickActions.slice(0, 3).map(a => a.label),
    ],
    safeHandover: context.pendingTasks.filter(t => t.status !== 'completed').length === 0,
  };
}
