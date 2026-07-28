// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book IV: Universal Encounter Lifecycle
// Every encounter follows one state machine from creation to closure.
// ═══════════════════════════════════════════════════════════════════════════════

export enum EncounterState {
  Created = 'created',
  Registered = 'registered',
  Triaged = 'triaged',
  Waiting = 'waiting',
  Consultation = 'consultation',
  Investigating = 'investigating',
  Diagnosis = 'diagnosis',
  Treatment = 'treatment',
  Observation = 'observation',
  Procedure = 'procedure',
  Admission = 'admission',
  Transferred = 'transferred',
  Discharged = 'discharged',
  FollowUp = 'follow_up',
  Closed = 'closed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
}

export const ENCOUNTER_STATE_TRANSITIONS: Record<EncounterState, EncounterState[]> = {
  [EncounterState.Created]: [EncounterState.Registered, EncounterState.Cancelled],
  [EncounterState.Registered]: [EncounterState.Triaged, EncounterState.Waiting, EncounterState.Cancelled],
  [EncounterState.Triaged]: [EncounterState.Waiting, EncounterState.Consultation, EncounterState.Cancelled],
  [EncounterState.Waiting]: [EncounterState.Consultation, EncounterState.Cancelled, EncounterState.NoShow],
  [EncounterState.Consultation]: [EncounterState.Investigating, EncounterState.Diagnosis, EncounterState.Treatment, EncounterState.Admission, EncounterState.Procedure, EncounterState.Observation],
  [EncounterState.Investigating]: [EncounterState.Consultation, EncounterState.Diagnosis],
  [EncounterState.Diagnosis]: [EncounterState.Treatment, EncounterState.Admission, EncounterState.Observation, EncounterState.Procedure],
  [EncounterState.Treatment]: [EncounterState.Observation, EncounterState.Admission, EncounterState.Discharged, EncounterState.Procedure],
  [EncounterState.Observation]: [EncounterState.Diagnosis, EncounterState.Treatment, EncounterState.Admission, EncounterState.Discharged],
  [EncounterState.Procedure]: [EncounterState.Observation, EncounterState.Treatment, EncounterState.Admission, EncounterState.Discharged],
  [EncounterState.Admission]: [EncounterState.Treatment, EncounterState.Observation, EncounterState.Procedure, EncounterState.Transferred, EncounterState.Discharged],
  [EncounterState.Transferred]: [EncounterState.Consultation, EncounterState.Treatment, EncounterState.Observation, EncounterState.Discharged],
  [EncounterState.Discharged]: [EncounterState.FollowUp, EncounterState.Closed],
  [EncounterState.FollowUp]: [EncounterState.Closed, EncounterState.Consultation],
  [EncounterState.Closed]: [],
  [EncounterState.Cancelled]: [],
  [EncounterState.NoShow]: [EncounterState.Created, EncounterState.Closed],
};

export interface EncounterLifecycle {
  id: string;
  patientId: string;
  patientAmxUid: string;
  encounterType: EncounterClass;
  state: EncounterState;
  stateHistory: StateTransition[];
  departmentId: string;
  unitId?: string;
  assignedTo?: string;
  assignedTeam?: string[];
  priority: EncounterPriority;
  timing: EncounterTiming;
  context: HMISEncounterContext;
  flags: EncounterFlags;
  auditTrail: EncounterAuditEntry[];
  createdAt: number;
  updatedAt: number;
}

export enum EncounterClass {
  Outpatient = 'outpatient',
  Inpatient = 'inpatient',
  Emergency = 'emergency',
  Consultation = 'consultation',
  FollowUp = 'follow_up',
  Telemedicine = 'telemedicine',
  HomeVisit = 'home_visit',
  CommunityOutreach = 'community_outreach',
  Procedure = 'procedure',
  DayCase = 'day_case',
  Antenatal = 'antenatal',
  Postnatal = 'postnatal',
  Immunization = 'immunization',
  WellChild = 'well_child',
  SchoolHealth = 'school_health',
  OccupationalHealth = 'occupational_health',
  Research = 'research',
}

export interface StateTransition {
  from: EncounterState;
  to: EncounterState;
  at: number;
  by: string;
  reason: string;
  department?: string;
  metadata?: Record<string, unknown>;
}

export interface EncounterTiming {
  createdAt: number;
  registeredAt?: number;
  triagedAt?: number;
  consultationStartedAt?: number;
  consultationEndedAt?: number;
  dischargedAt?: number;
  closedAt?: number;
  totalWaitMinutes?: number;
  totalConsultationMinutes?: number;
  totalLengthOfStay?: number;
}

export enum EncounterPriority {
  Resuscitation = 'resuscitation',
  Emergency = 'emergency',
  Urgent = 'urgent',
  SemiUrgent = 'semi_urgent',
  NonUrgent = 'non_urgent',
  Routine = 'routine',
  Elective = 'elective',
}

export interface HMISEncounterContext {
  chiefComplaint: string;
  triageNotes?: string;
  modeOfArrival: ModeOfArrival;
  referredFrom?: string;
  referredBy?: string;
  referralReason?: string;
  insuranceScheme?: string;
  insuranceNumber?: string;
  consentObtained: boolean;
  consentType?: string;
  isConfidential: boolean;
  language?: string;
  interpreterNeeded: boolean;
  companionPresent?: string;
}

export enum ModeOfArrival {
  WalkIn = 'walk_in',
  PrivateCar = 'private_car',
  Ambulance = 'ambulance',
  Police = 'police',
  Transfer = 'transfer',
  Helicopter = 'helicopter',
  BroughtByBystander = 'brought_by_bystander',
  Wheelchair = 'wheelchair',
  Stretcher = 'stretcher',
}

export interface EncounterFlags {
  isPregnant: boolean;
  isEmergency: boolean;
  isTrauma: boolean;
  isInfectious: boolean;
  isIsolationRequired: boolean;
  isCriticallyIll: boolean;
  isDNR: boolean;
  hasAdvanceDirective: boolean;
  isResearchSubject: boolean;
  requiresInterpreter: boolean;
  isConfidential: boolean;
  isBillingHold: boolean;
  isMedicolegal: boolean;
  hasPoliceCase: boolean;
}

export interface EncounterAuditEntry {
  at: number;
  by: string;
  action: string;
  details: string;
  previousState?: EncounterState;
  newState?: EncounterState;
  ipAddress?: string;
  deviceId?: string;
}

export interface EncounterStats {
  totalToday: number;
  byType: Record<string, number>;
  byState: Record<string, number>;
  byPriority: Record<string, number>;
  byDepartment: Record<string, number>;
  averageWaitMinutes: number;
  averageConsultMinutes: number;
  longestWaitMinutes: number;
  noShowRate: number;
  dischargedToday: number;
  admittedToday: number;
  transferredToday: number;
}

export function createEncounterLifecycle(
  id: string,
  patientId: string,
  patientAmxUid: string,
  encounterType: EncounterClass,
  departmentId: string,
  priority: EncounterPriority,
  chiefComplaint: string,
): EncounterLifecycle {
  const now = Date.now();
  return {
    id,
    patientId,
    patientAmxUid,
    encounterType,
    state: EncounterState.Created,
    stateHistory: [{ from: EncounterState.Created, to: EncounterState.Created, at: now, by: 'system', reason: 'Encounter created' }],
    departmentId,
    priority,
    timing: { createdAt: now },
    context: {
      chiefComplaint,
      modeOfArrival: ModeOfArrival.WalkIn,
      consentObtained: false,
      isConfidential: false,
      interpreterNeeded: false,
    },
    flags: {
      isPregnant: false, isEmergency: false, isTrauma: false, isInfectious: false,
      isIsolationRequired: false, isCriticallyIll: false, isDNR: false,
      hasAdvanceDirective: false, isResearchSubject: false, requiresInterpreter: false,
      isConfidential: false, isBillingHold: false, isMedicolegal: false, hasPoliceCase: false,
    },
    auditTrail: [{ at: now, by: 'system', action: 'create', details: 'Encounter created' }],
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionEncounter(
  encounter: EncounterLifecycle,
  newState: EncounterState,
  by: string,
  reason: string,
): EncounterLifecycle {
  const allowed = ENCOUNTER_STATE_TRANSITIONS[encounter.state];
  if (!allowed.includes(newState)) {
    throw new Error(`Invalid transition from ${encounter.state} to ${newState}`);
  }
  const now = Date.now();
  encounter.stateHistory.push({ from: encounter.state, to: newState, at: now, by, reason });
  encounter.state = newState;
  encounter.updatedAt = now;
  encounter.auditTrail.push({ at: now, by, action: 'transition', details: reason, previousState: encounter.state, newState });

  switch (newState) {
    case EncounterState.Registered: encounter.timing.registeredAt = now; break;
    case EncounterState.Triaged: encounter.timing.triagedAt = now; break;
    case EncounterState.Consultation: {
      encounter.timing.consultationStartedAt = now;
      if (encounter.timing.triagedAt || encounter.timing.registeredAt) {
        const start = encounter.timing.triagedAt || encounter.timing.registeredAt!;
        encounter.timing.totalWaitMinutes = Math.round((now - start) / 60000);
      }
      break;
    }
    case EncounterState.Discharged: {
      encounter.timing.dischargedAt = now;
      if (encounter.timing.consultationStartedAt) {
        encounter.timing.totalConsultationMinutes = Math.round((now - encounter.timing.consultationStartedAt) / 60000);
      }
      if (encounter.timing.createdAt) {
        encounter.timing.totalLengthOfStay = Math.round((now - encounter.timing.createdAt) / 60000);
      }
      break;
    }
    case EncounterState.Closed: encounter.timing.closedAt = now; break;
  }

  return encounter;
}

export function getEncountersByState(encounters: EncounterLifecycle[], state: EncounterState): EncounterLifecycle[] {
  return encounters.filter(e => e.state === state);
}

export function getEncountersByDepartment(encounters: EncounterLifecycle[], deptId: string): EncounterLifecycle[] {
  return encounters.filter(e => e.departmentId === deptId);
}

export function getActiveEncounters(encounters: EncounterLifecycle[]): EncounterLifecycle[] {
  const terminalStates = [EncounterState.Closed, EncounterState.Cancelled, EncounterState.NoShow, EncounterState.Discharged];
  return encounters.filter(e => !terminalStates.includes(e.state));
}

export function computeEncounterStats(encounters: EncounterLifecycle[]): EncounterStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  const todayEncounters = encounters.filter(e => e.createdAt >= todayTs);
  const waitTimes = todayEncounters.filter(e => e.timing.totalWaitMinutes != null).map(e => e.timing.totalWaitMinutes!);
  const consultTimes = todayEncounters.filter(e => e.timing.totalConsultationMinutes != null).map(e => e.timing.totalConsultationMinutes!);

  const discharged = todayEncounters.filter(e => e.state === EncounterState.Discharged);
  const admitted = todayEncounters.filter(e => e.state === EncounterState.Admission);
  const transferred = todayEncounters.filter(e => e.state === EncounterState.Transferred);
  const noShow = todayEncounters.filter(e => e.state === EncounterState.NoShow);

  const byType: Record<string, number> = {};
  const byState: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};

  for (const e of todayEncounters) {
    byType[e.encounterType] = (byType[e.encounterType] || 0) + 1;
    byState[e.state] = (byState[e.state] || 0) + 1;
    byPriority[e.priority] = (byPriority[e.priority] || 0) + 1;
    byDepartment[e.departmentId] = (byDepartment[e.departmentId] || 0) + 1;
  }

  return {
    totalToday: todayEncounters.length,
    byType, byState, byPriority, byDepartment,
    averageWaitMinutes: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
    averageConsultMinutes: consultTimes.length > 0 ? Math.round(consultTimes.reduce((a, b) => a + b, 0) / consultTimes.length) : 0,
    longestWaitMinutes: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
    noShowRate: todayEncounters.length > 0 ? (noShow.length / todayEncounters.length) * 100 : 0,
    dischargedToday: discharged.length,
    admittedToday: admitted.length,
    transferredToday: transferred.length,
  };
}
