// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Universal Encounter Engine
// Book II Volume II: Every healthcare interaction is an encounter
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  Encounter, EncounterClass, EncounterType, EncounterState,
  EncounterTrigger, EncounterTriggerType, EncounterPreparation,
  EncounterInteraction, EncounterDecision, EncounterDecisionType,
  EncounterAction, EncounterClosure, EncounterOutcome,
  FollowUpPlan, FollowUpInstruction, FollowUpAppointment,
  MonitoringPlan, EncounterTimelineEvent, EncounterParticipant,
  EncounterNote, EncounterNoteType, PatientSummary, ContextAlert,
  ProfessionalContribution, PatientInput,
} from './types';

import type { ProfessionalCategory } from '../constitution/types';

let _counter = 0;
function uid(prefix: string): string {
  _counter++;
  return `${prefix}_${Date.now()}_${_counter}`;
}

// ── Create Encounter ──────────────────────────────────────────────────────────

export function createEncounter(params: {
  patientId: string;
  encounterClass: EncounterClass;
  encounterType: EncounterType;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  location: Encounter['location'];
  trigger: EncounterTrigger;
  episodeId?: string;
  responsibleTeam?: Encounter['responsibleTeam'];
  expectedDuration?: number;
}): Encounter {
  const now = Date.now();

  const preparation: EncounterPreparation = {
    patientSummary: {
      name: '',
      age: 0,
      sex: '',
      allergies: [],
      currentMedications: [],
      activeDiagnoses: [],
      recentEncounters: 0,
      chronicConditions: [],
      warnings: [],
    },
    contextAlerts: [],
    consentStatus: 'not_required',
    requiredDocuments: [],
    missingInformation: [],
    preparedAt: now,
  };

  const interaction: EncounterInteraction = {
    startedAt: 0,
    participants: [],
    notes: [],
    contributions: [],
    patientContributions: [],
  };

  return {
    id: uid('enc'),
    patientId: params.patientId,
    episodeId: params.episodeId,
    encounterClass: params.encounterClass,
    encounterType: params.encounterType,
    organizationId: params.organizationId,
    organizationName: params.organizationName,
    departmentId: params.departmentId,
    departmentName: params.departmentName,
    location: params.location,
    responsibleTeam: params.responsibleTeam ?? [],
    currentState: 'created',
    startTime: now,
    expectedDuration: params.expectedDuration,
    trigger: params.trigger,
    preparation,
    interaction,
    decision: null,
    actions: [],
    closure: null,
    followUp: null,
    linkedEncounterIds: [],
    createdBy: params.trigger.initiatedBy,
    createdAt: now,
    updatedAt: now,
    eventCount: 0,
  };
}

// ── State Transitions ─────────────────────────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<EncounterState, EncounterState[]> = {
  created: ['scheduled', 'checked_in', 'in_progress', 'closed'],
  scheduled: ['patient_arrived', 'cancelled' as any],
  patient_arrived: ['checked_in'],
  checked_in: ['in_progress'],
  in_progress: ['waiting_results', 'decision_made'],
  waiting_results: ['in_progress', 'decision_made'],
  decision_made: ['actions_running'],
  actions_running: ['completed', 'in_progress'],
  completed: ['follow_up_pending', 'closed'],
  follow_up_pending: ['closed'],
  closed: [],
};

export function transitionEncounter(
  encounter: Encounter,
  newState: EncounterState,
): Encounter {
  const allowed = ALLOWED_TRANSITIONS[encounter.currentState];
  if (!allowed || !allowed.includes(newState)) {
    throw new Error(
      `Invalid transition: ${encounter.currentState} → ${newState}. Allowed: ${allowed?.join(', ') ?? 'none'}`,
    );
  }
  return {
    ...encounter,
    currentState: newState,
    updatedAt: Date.now(),
    endTime: ['completed', 'closed'].includes(newState) ? Date.now() : encounter.endTime,
  };
}

// ── Set Preparation ───────────────────────────────────────────────────────────

export function setPreparation(
  encounter: Encounter,
  summary: PatientSummary,
  alerts: ContextAlert[],
  consentStatus: EncounterPreparation['consentStatus'],
): Encounter {
  return {
    ...encounter,
    preparation: {
      patientSummary: summary,
      contextAlerts: alerts,
      consentStatus,
      requiredDocuments: [],
      missingInformation: [],
      preparedAt: Date.now(),
    },
    currentState: 'checked_in',
    updatedAt: Date.now(),
  };
}

// ── Start Interaction ─────────────────────────────────────────────────────────

export function startInteraction(
  encounter: Encounter,
  participant: EncounterParticipant,
): Encounter {
  return {
    ...encounter,
    currentState: 'in_progress',
    interaction: {
      ...encounter.interaction,
      startedAt: Date.now(),
      participants: [...encounter.interaction.participants, participant],
    },
    updatedAt: Date.now(),
  };
}

// ── Add Note ──────────────────────────────────────────────────────────────────

export function addNote(
  encounter: Encounter,
  note: Omit<EncounterNote, 'id' | 'createdAt' | 'updatedAt'>,
): Encounter {
  const newNote: EncounterNote = {
    ...note,
    id: uid('note'),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return {
    ...encounter,
    interaction: {
      ...encounter.interaction,
      notes: [...encounter.interaction.notes, newNote],
    },
    updatedAt: Date.now(),
  };
}

// ── Add Professional Contribution ─────────────────────────────────────────────

export function addContribution(
  encounter: Encounter,
  contribution: ProfessionalContribution,
): Encounter {
  return {
    ...encounter,
    interaction: {
      ...encounter.interaction,
      contributions: [...encounter.interaction.contributions, contribution],
    },
    updatedAt: Date.now(),
  };
}

// ── Add Patient Input ─────────────────────────────────────────────────────────

export function addPatientInput(
  encounter: Encounter,
  input: PatientInput,
): Encounter {
  return {
    ...encounter,
    interaction: {
      ...encounter.interaction,
      patientContributions: [...encounter.interaction.patientContributions, input],
    },
    updatedAt: Date.now(),
  };
}

// ── Make Decision ─────────────────────────────────────────────────────────────

export function makeDecision(
  encounter: Encounter,
  decision: EncounterDecision,
): Encounter {
  return {
    ...encounter,
    decision,
    currentState: 'decision_made',
    updatedAt: Date.now(),
  };
}

// ── Add Action ────────────────────────────────────────────────────────────────

export function addAction(
  encounter: Encounter,
  action: Omit<EncounterAction, 'id' | 'createdAt' | 'status'>,
): Encounter {
  const newAction: EncounterAction = {
    ...action,
    id: uid('act'),
    status: 'pending',
    createdAt: Date.now(),
  };
  return {
    ...encounter,
    actions: [...encounter.actions, newAction],
    currentState: 'actions_running',
    updatedAt: Date.now(),
  };
}

// ── Complete Action ───────────────────────────────────────────────────────────

export function completeAction(
  encounter: Encounter,
  actionId: string,
): Encounter {
  return {
    ...encounter,
    actions: encounter.actions.map(a =>
      a.id === actionId
        ? { ...a, status: 'completed', completedAt: Date.now() }
        : a
    ),
    updatedAt: Date.now(),
  };
}

// ── Close Encounter ───────────────────────────────────────────────────────────

export function closeEncounter(
  encounter: Encounter,
  outcome: EncounterOutcome,
  summary: string,
  followUpPlan?: Omit<FollowUpPlan, 'id' | 'encounterId' | 'createdAt'>,
): Encounter {
  const now = Date.now();
  const closure: EncounterClosure = {
    completedAt: now,
    completedBy: encounter.createdBy,
    completedByName: '',
    outcome,
    summary,
    documentsGenerated: [],
    followUpCreated: !!followUpPlan,
  };

  const followUp: FollowUpPlan | null = followUpPlan
    ? {
        ...followUpPlan,
        id: uid('fup'),
        encounterId: encounter.id,
        createdAt: now,
      }
    : null;

  return {
    ...encounter,
    decision: encounter.decision ?? {
      type: 'discharge' as any,
      rationale: summary,
      madeBy: encounter.createdBy,
      madeByName: '',
      madeAt: now,
      requiresApproval: false,
      patientInformed: true,
      patientConsented: true,
    },
    closure,
    followUp,
    currentState: followUp ? 'follow_up_pending' : 'closed',
    endTime: now,
    updatedAt: now,
  };
}

// ── Timeline Event ────────────────────────────────────────────────────────────

export function createTimelineEvent(
  encounterId: string,
  type: string,
  description: string,
  actorId: string,
  actorName: string,
  details?: any,
): EncounterTimelineEvent {
  return {
    id: uid('evt'),
    encounterId,
    type,
    description,
    timestamp: Date.now(),
    actorId,
    actorName,
    details,
  };
}

// ── Follow-up Reminder ────────────────────────────────────────────────────────

export function generateFollowUpReminders(
  followUp: FollowUpPlan,
): { message: string; dueDate: number }[] {
  const reminders: { message: string; dueDate: number }[] = [];

  for (const inst of followUp.instructions) {
    reminders.push({
      message: `Follow ${inst.type} instruction: ${inst.instruction}`,
      dueDate: Date.now() + 7 * 86400000, // 7 days default
    });
  }

  for (const apt of followUp.appointments) {
    if (apt.scheduledDate) {
      reminders.push({
        message: `Appointment with ${apt.withName} (${apt.withRole})`,
        dueDate: apt.scheduledDate - 86400000, // 1 day before
      });
    }
  }

  return reminders;
}

// ── Context-Aware Workspace Generator ─────────────────────────────────────────
// Generates the preparation summary based on encounter type.

export interface PreparedWorkspace {
  priorityFields: string[];
  quickActions: string[];
  hiddenFields: string[];
  alerts: ContextAlert[];
}

const WORKSPACE_TEMPLATES: Record<string, {
  priorityFields: string[];
  quickActions: string[];
  hiddenFields: string[];
}> = {
  emergency_consultation: {
    priorityFields: ['airway', 'breathing', 'circulation', 'triage_category', 'resuscitation_timer'],
    quickActions: ['intubate', 'defibrillate', 'fluids', 'blood_culture', 'ct_head'],
    hiddenFields: ['chronic_disease_review', 'routine_medication_review'],
  },
  outpatient_consultation: {
    priorityFields: ['chief_complaint', 'history', 'examination'],
    quickActions: ['prescribe', 'lab_order', 'refer', 'follow_up'],
    hiddenFields: [],
  },
  ward_review: {
    priorityFields: ['overnight_events', 'vitals_trend', 'input_output', 'pending_results'],
    quickActions: ['cbc', 'imaging', 'consult', 'discharge'],
    hiddenFields: [],
  },
};

export function generateWorkspace(
  encounterType: string,
): PreparedWorkspace {
  const template = WORKSPACE_TEMPLATES[encounterType] ?? {
    priorityFields: ['chief_complaint', 'history', 'examination'],
    quickActions: ['document', 'order', 'refer'],
    hiddenFields: [],
  };

  return {
    priorityFields: template.priorityFields,
    quickActions: template.quickActions,
    hiddenFields: template.hiddenFields,
    alerts: [],
  };
}
