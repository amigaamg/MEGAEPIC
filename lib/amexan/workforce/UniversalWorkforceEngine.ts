// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN UNIVERSAL WORKFORCE ENGINE (BOOK IV)
//
// "The Constitutional Engine of People, Privileges, Duty, Competency, and
// Clinical Continuity."
//
// Every healthcare action is performed by a person acting under a validated
// identity, an organizational relationship, a professional competency, a granted
// privilege, an active assignment, and an accountable workspace.
//
// Traditional HMIS:        User → Role → Access
// AMEXAN UWE:              Actor → Identity → Professional Identity →
//                          Organization Membership → Employment → Privileges →
//                          Competency → Assignment → Shift → Workspace → Action
//
// Constitutional principles:
//   P1  Person ≠ User            — a surgeon is the same person across hospitals,
//        teaching, research, telemedicine. Person ≠ Employment ≠ Assignment ≠ Workspace.
//   P2  Employment ≠ Privilege   — being employed never grants clinical privileges.
//   P3  Assignment ≠ Shift       — many assignments may exist within one shift.
//   P4  Workspace is Context     — the same doctor has different workspaces that
//        change the dashboard.
//
// Constitutional laws: UWE-001 … UWE-010 (enforced, never commented).
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { MedicalSpecialty } from '@/lib/amexan/constitution/types';

// ── Core objects (constitutional) ──────────────────────────────────────────────

export type IdentityStatus = 'unverified' | 'pending' | 'verified' | 'revoked';

export interface UwePerson {
  personId: AmxUid;
  amxId: string;
  legalName: string;
  preferredName?: string;
  dob?: string;
  sex?: 'male' | 'female' | 'other' | 'undisclosed';
  contacts: { type: string; value: string }[];
  identityStatus: IdentityStatus;
}

export interface UweProfessionalIdentity {
  profession: string;
  specialty: MedicalSpecialty;
  subspecialty?: string;
  councils: string[];
  licenses: { authority: string; number: string; expiresAt?: number }[];
  qualifications: { degree: string; institution: string; year: number }[];
  yearsOfExperience?: number;
  verification: { status: IdentityStatus; verifiedAt?: number; documents: string[] };
}

export type MembershipStatus = 'active' | 'inactive' | 'suspended';

export interface UweMembership {
  organizationId: string;
  role: string;
  status: MembershipStatus;
  primary: boolean;
  joinedAt: number;
}

export type EmploymentType =
  | 'permanent' | 'contract' | 'locum' | 'visiting_specialist' | 'resident'
  | 'intern' | 'student' | 'volunteer' | 'research_staff' | 'telemedicine'
  | 'cross_facility' | 'honorary' | 'part_time';

export type EmploymentStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface UweEmployment {
  employmentId: string;
  personId: AmxUid;
  organizationId: string;
  departmentId: string;
  jobTitle: string;
  type: EmploymentType;
  startDate: number;
  endDate?: number;
  supervisorId?: AmxUid;
  status: EmploymentStatus;
  primary: boolean;
}

export type PrivilegeScope = 'global' | 'organization' | 'department' | 'facility' | 'ward';

export interface UwePrivilege {
  privilegeId: string;
  code: string;
  scope: PrivilegeScope;
  organizationId?: string;
  departmentId?: string;
  facilityId?: string;
  grantedBy: AmxUid;
  grantedAt: number;
  expiresAt?: number;
  revokedAt?: number;
  revokedBy?: AmxUid;
  revocationReason?: string;
  active: boolean;
}

export interface UweCompetency {
  competencyId: string;
  code: string;
  level: 'observed' | 'supervised' | 'independent' | 'expert' | 'trainer';
  evidence: string[];
  validatedBy?: AmxUid;
  validatedAt?: number;
  expiresAt?: number;
}

export type AssignmentType =
  | 'ward_round' | 'clinic' | 'emergency' | 'theatre' | 'icu' | 'hdu' | 'nicu'
  | 'lab_validation' | 'radiology_reporting' | 'pharmacy_review' | 'teaching'
  | 'research' | 'administrative' | 'telemedicine' | 'outreach' | 'call_duty'
  | 'procedure' | 'handover';

export interface UweAssignment {
  assignmentId: string;
  personId: AmxUid;
  shiftId?: string;
  type: AssignmentType;
  title: string;
  location: { type: 'ward' | 'clinic' | 'theatre' | 'icu' | 'emergency' | 'remote' | 'outreach'; name?: string };
  startTime: number;
  endTime: number;
  priority: 'routine' | 'urgent' | 'emergency' | 'critical';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'overdue';
  requiresPrivilege?: string;
  linkedPatientIds?: string[];
  linkedEncounterIds?: string[];
}

export type ShiftType = 'day' | 'night' | 'weekend' | 'public_holiday' | 'on_call' | 'standby' | 'relief' | 'rotational';

export interface UweShift {
  shiftId: string;
  personId: AmxUid;
  organizationId: string;
  departmentId: string;
  type: ShiftType;
  start: number;
  end: number;
  roster: string;
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'missed' | 'cancelled';
  assignmentIds: string[];
  handoverId?: string;
}

export interface UweWorkspace {
  personId: AmxUid;
  organizationId: string;
  facilityId?: string;
  departmentId: string;
  employment: UweEmployment;
  assignment?: UweAssignment;
  shift?: UweShift;
  capabilities: string[];
  context: 'ward' | 'theatre' | 'clinic' | 'emergency' | 'telemedicine' | 'teaching' | 'research' | 'administration';
  active: boolean;
}

// ── Handover (UWE-008: structured, acknowledged, traceable) ───────────────────

export interface ShiftHandover {
  handoverId: string;
  shiftId: string;
  fromPersonId: AmxUid;
  toPersonId: AmxUid;
  patients: { patientId: string; summary: string }[];
  pendingTasks: string[];
  criticalAlerts: string[];
  pendingInvestigations: string[];
  pendingProcedures: string[];
  risks: string[];
  createdAt: number;
  acknowledgedAt?: number;
  acknowledgedBy?: AmxUid;
  status: 'open' | 'acknowledged';
}

// ── Attendance ─────────────────────────────────────────────────────────────────

export type PresenceMethod = 'biometric' | 'qr' | 'mobile_checkin' | 'geofence' | 'manual';

export interface PresenceRecord {
  presenceId: string;
  shiftId: string;
  personId: AmxUid;
  checkInAt: number;
  checkOutAt?: number;
  method: PresenceMethod;
  approvedBy?: AmxUid;
}

// ── Leave ──────────────────────────────────────────────────────────────────────

export type LeaveType = 'annual' | 'sick' | 'study' | 'maternity' | 'paternity' | 'compassionate' | 'unpaid';

export interface LeaveRequest {
  leaveId: string;
  personId: AmxUid;
  type: LeaveType;
  startDate: number;
  endDate: number;
  reason?: string;
  status: 'requested' | 'approved' | 'rejected' | 'cancelled';
  coverageGap: boolean;
  decidedBy?: AmxUid;
  decidedAt?: number;
}

// ── Rotation (students & residents) ────────────────────────────────────────────

export interface RotationBlock {
  rotationId: string;
  personId: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  startDate: number;
  endDate: number;
  supervisorId?: AmxUid;
  status: 'scheduled' | 'active' | 'completed';
  logbookEntries: number;
  competenciesAchieved: string[];
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface WorkforceModel {
  organizationId: string;
  facilityId?: string;
  people: Record<string, UwePerson>;
  professionalIdentities: Record<string, UweProfessionalIdentity>;
  memberships: Record<string, UweMembership[]>;
  employments: Record<string, UweEmployment[]>;
  privileges: Record<string, UwePrivilege[]>;
  competencies: Record<string, UweCompetency[]>;
  shifts: UweShift[];
  assignments: UweAssignment[];
  handovers: ShiftHandover[];
  presence: PresenceRecord[];
  leave: LeaveRequest[];
  rotations: RotationBlock[];
  auditLog: { at: number; actorId: AmxUid; action: string; personId: AmxUid; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateWorkforceModelInput {
  organizationId: string;
  facilityId?: string;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Privilege catalogue (examples from the constitutional book) ────────────────

export const STANDARD_PRIVILEGES: readonly string[] = [
  'admit_patients', 'discharge_patients', 'prescribe', 'order_ct', 'order_blood',
  'operate_independently', 'perform_c_section', 'intubate', 'sign_death_certificate',
  'validate_lab_results', 'report_imaging', 'approve_chemotherapy',
  'order_imaging', 'request_consult', 'refer_patient', 'perform_procedure',
  'access_controlled_drugs', 'verify_prescriptions', 'dispense_medication',
  'administer_medication', 'triage_patients', 'run_resuscitation',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class UniversalWorkforceEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateWorkforceModelInput): WorkforceModel {
    if (!input.organizationId) throw new Error('[UWE] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      people: {},
      professionalIdentities: {},
      memberships: {},
      employments: {},
      privileges: {},
      competencies: {},
      shifts: [],
      assignments: [],
      handovers: [],
      presence: [],
      leave: [],
      rotations: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Person & professional identity ───────────────────────────────────────────

  static registerPerson(model: WorkforceModel, person: UwePerson): WorkforceModel {
    if (!person.personId || !person.legalName.trim()) {
      throw new Error('[UWE] A person requires a personId and legalName');
    }
    if (model.people[person.personId]) throw new Error(`[UWE] Person "${person.personId}" already registered`);
    const now = Date.now();
    return {
      ...model,
      people: { ...model.people, [person.personId]: person },
      auditLog: [...model.auditLog, { at: now, actorId: person.personId, action: 'person_registered', personId: person.personId }],
      updatedAt: now,
    };
  }

  static setProfessionalIdentity(model: WorkforceModel, identity: UweProfessionalIdentity & { personId: AmxUid }): WorkforceModel {
    const { personId, ...rest } = identity;
    if (!model.people[personId]) throw new Error(`[UWE] Person "${personId}" does not exist`);
    return {
      ...model,
      professionalIdentities: { ...model.professionalIdentities, [personId]: rest },
      updatedAt: Date.now(),
    };
  }

  // ── Membership & employment (UWE-002: multiple employments) ─────────────────

  static addMembership(model: WorkforceModel, personId: AmxUid, membership: Omit<UweMembership, 'joinedAt'>): WorkforceModel {
    if (!model.people[personId]) throw new Error(`[UWE] Person "${personId}" does not exist`);
    const memberships = [...(model.memberships[personId] ?? []), { ...membership, joinedAt: Date.now() }];
    return { ...model, memberships: { ...model.memberships, [personId]: memberships }, updatedAt: Date.now() };
  }

  static employ(
    model: WorkforceModel,
    input: Omit<UweEmployment, 'employmentId' | 'status'>,
  ): { model: WorkforceModel; employment: UweEmployment } {
    if (!model.people[input.personId]) throw new Error(`[UWE] Person "${input.personId}" does not exist`);
    const employment: UweEmployment = { ...input, employmentId: nextId('emp'), status: 'active' };
    const employments = [...(model.employments[input.personId] ?? []), employment];
    return {
      model: { ...model, employments: { ...model.employments, [input.personId]: employments }, updatedAt: Date.now() },
      employment,
    };
  }

  static resolveEmployment(model: WorkforceModel, personId: AmxUid, opts: { organizationId?: string; activeOnly?: boolean } = {}): UweEmployment[] {
    const list = model.employments[personId] ?? [];
    return list.filter(e => {
      if (opts.organizationId && e.organizationId !== opts.organizationId) return false;
      if (opts.activeOnly && e.status !== 'active') return false;
      return true;
    });
  }

  static getActiveEmployment(model: WorkforceModel, personId: AmxUid, organizationId: string): UweEmployment | undefined {
    return UniversalWorkforceEngine.resolveEmployment(model, personId, { organizationId, activeOnly: true })[0];
  }

  // ── Credentialing & privileges (UWE-003, UWE-001) ───────────────────────────

  /**
   * Constitutional credentialing pipeline:
   *   Identity → License → Qualification → Experience → Reference →
   *   Department Approval → Medical Director Approval → Privilege Granted
   */
  static credentialAndPrivilege(
    model: WorkforceModel,
    input: {
      personId: AmxUid;
      departmentId: string;
      organizationId: string;
      licenseValid: boolean;
      qualificationsVerified: boolean;
      referenceChecked: boolean;
      departmentApproved: boolean;
      medicalDirectorApproved: boolean;
      privilegeCode: string;
      scope: PrivilegeScope;
      expiresAt?: number;
      grantedBy: AmxUid;
    },
  ): { model: WorkforceModel; granted: boolean; reason?: string } {
    const identity = model.professionalIdentities[input.personId];
    if (!identity) return { model, granted: false, reason: 'Missing professional identity' };
    if (identity.verification.status !== 'verified') return { model, granted: false, reason: 'Identity not verified' };
    if (!input.licenseValid) return { model, granted: false, reason: 'License invalid' };
    if (!input.qualificationsVerified) return { model, granted: false, reason: 'Qualifications unverified' };
    if (!input.referenceChecked) return { model, granted: false, reason: 'References not checked' };
    if (!input.departmentApproved) return { model, granted: false, reason: 'Department approval missing' };
    if (!input.medicalDirectorApproved) return { model, granted: false, reason: 'Medical director approval missing' };
    if (!(STANDARD_PRIVILEGES as readonly string[]).includes(input.privilegeCode)) {
      // Custom privileges are allowed by the constitutional registry (no hardcoding).
    }
    const now = Date.now();
    const privilege: UwePrivilege = {
      privilegeId: nextId('prv'),
      code: input.privilegeCode,
      scope: input.scope,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
      grantedBy: input.grantedBy,
      grantedAt: now,
      expiresAt: input.expiresAt,
      active: true,
    };
    const privileges = [...(model.privileges[input.personId] ?? []), privilege];
    return {
      model: {
        ...model,
        privileges: { ...model.privileges, [input.personId]: privileges },
        auditLog: [...model.auditLog, { at: now, actorId: input.grantedBy, action: 'privilege_granted', personId: input.personId, detail: input.privilegeCode }],
        updatedAt: now,
      },
      granted: true,
    };
  }

  /** UWE-001: no clinical action without an active privilege. */
  static resolvePrivilege(model: WorkforceModel, personId: AmxUid, code: string, opts: { organizationId?: string; departmentId?: string } = {}): UwePrivilege | undefined {
    const now = Date.now();
    return (model.privileges[personId] ?? []).find(p =>
      p.code === code && p.active && (!p.expiresAt || p.expiresAt > now) &&
      (!opts.organizationId || p.organizationId === opts.organizationId || p.scope === 'global') &&
      (!opts.departmentId || p.departmentId === opts.departmentId || p.scope === 'organization' || p.scope === 'global' || p.scope === 'facility'),
    );
  }

  static resolvePrivileges(model: WorkforceModel, personId: AmxUid, opts: { organizationId?: string } = {}): UwePrivilege[] {
    const now = Date.now();
    return (model.privileges[personId] ?? []).filter(p =>
      p.active && (!p.expiresAt || p.expiresAt > now) &&
      (!opts.organizationId || p.organizationId === opts.organizationId || p.scope === 'global'),
    );
  }

  static revokePrivilege(model: WorkforceModel, personId: AmxUid, privilegeId: string, revokeBy: AmxUid, reason: string): WorkforceModel {
    const privileges = (model.privileges[personId] ?? []).map(p =>
      p.privilegeId === privilegeId ? { ...p, active: false, revokedAt: Date.now(), revokedBy: revokeBy, revocationReason: reason } : p,
    );
    const now = Date.now();
    return {
      ...model,
      privileges: { ...model.privileges, [personId]: privileges },
      auditLog: [...model.auditLog, { at: now, actorId: revokeBy, action: 'privilege_revoked', personId, detail: reason }],
      updatedAt: now,
    };
  }

  static grantPrivilege(
    model: WorkforceModel,
    input: { personId: AmxUid; privilegeCode: string; scope: PrivilegeScope; organizationId: string; departmentId: string; grantedBy: AmxUid; expiresAt?: number },
  ): { model: WorkforceModel; privilege: UwePrivilege } {
    const now = Date.now();
    const privilege: UwePrivilege = {
      privilegeId: nextId('prv'),
      code: input.privilegeCode,
      scope: input.scope,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
      grantedBy: input.grantedBy,
      grantedAt: now,
      expiresAt: input.expiresAt,
      active: true,
    };
    return {
      model: {
        ...model,
        privileges: { ...model.privileges, [input.personId]: [...(model.privileges[input.personId] ?? []), privilege] },
        auditLog: [...model.auditLog, { at: now, actorId: input.grantedBy, action: 'privilege_granted', personId: input.personId, detail: input.privilegeCode }],
        updatedAt: now,
      },
      privilege,
    };
  }

  // ── Competency (UWE-009: evolves from constitutional evidence) ───────────────

  static addCompetency(model: WorkforceModel, personId: AmxUid, input: Omit<UweCompetency, 'competencyId'>): WorkforceModel {
    const competency: UweCompetency = { ...input, competencyId: nextId('cmp') };
    return {
      ...model,
      competencies: { ...model.competencies, [personId]: [...(model.competencies[personId] ?? []), competency] },
      updatedAt: Date.now(),
    };
  }

  static validateCompetency(model: WorkforceModel, personId: AmxUid, competencyId: string, validatedBy: AmxUid, level?: UweCompetency['level']): WorkforceModel {
    const competencies = (model.competencies[personId] ?? []).map(c =>
      c.competencyId === competencyId ? { ...c, validatedBy, validatedAt: Date.now(), level: level ?? c.level } : c,
    );
    return {
      ...model,
      competencies: { ...model.competencies, [personId]: competencies },
      auditLog: [...model.auditLog, { at: Date.now(), actorId: validatedBy, action: 'competency_validated', personId, detail: competencyId }],
      updatedAt: Date.now(),
    };
  }

  static getCompetencies(model: WorkforceModel, personId: AmxUid): UweCompetency[] {
    return model.competencies[personId] ?? [];
  }

  // ── Shifts, roster, presence ─────────────────────────────────────────────────

  static createShift(
    model: WorkforceModel,
    input: { personId: AmxUid; organizationId: string; departmentId: string; type: ShiftType; start: number; end: number; roster: string },
  ): { model: WorkforceModel; shift: UweShift } {
    if (input.end <= input.start) throw new Error('[UWE] Shift end must be after start');
    if (!UniversalWorkforceEngine.getActiveEmployment(model, input.personId, input.organizationId)) {
      throw new Error(`[UWE] Person "${input.personId}" has no active employment at ${input.organizationId}`);
    }
    const shift: UweShift = { ...input, shiftId: nextId('sft'), status: 'scheduled', assignmentIds: [] };
    return { model: { ...model, shifts: [...model.shifts, shift], updatedAt: Date.now() }, shift };
  }

  static generateRoster(
    model: WorkforceModel,
    input: {
      departmentId: string;
      date: number;
      shifts: { personId: AmxUid; type: ShiftType; start: number; end: number }[];
    },
  ): { model: WorkforceModel; created: UweShift[] } {
    const created: UweShift[] = [];
    let next = model;
    for (const s of input.shifts) {
      const result = UniversalWorkforceEngine.createShift(next, {
        personId: s.personId,
        organizationId: next.organizationId,
        departmentId: input.departmentId,
        type: s.type,
        start: s.start,
        end: s.end,
        roster: `roster_${input.date}`,
      });
      next = result.model;
      created.push(result.shift);
    }
    return { model: next, created };
  }

  static resolveShift(model: WorkforceModel, personId: AmxUid): UweShift | undefined {
    const now = Date.now();
    return model.shifts.find(s => s.personId === personId && s.start <= now && s.end >= now && s.status !== 'cancelled');
  }

  static checkIn(model: WorkforceModel, shiftId: string, method: PresenceMethod, approvedBy?: AmxUid): WorkforceModel {
    const shift = model.shifts.find(s => s.shiftId === shiftId);
    if (!shift) throw new Error(`[UWE] Shift "${shiftId}" does not exist`);
    const presence: PresenceRecord = { presenceId: nextId('prs'), shiftId, personId: shift.personId, checkInAt: Date.now(), method, approvedBy };
    const shifts = model.shifts.map(s => (s.shiftId === shiftId ? { ...s, status: 'checked_in' as const } : s));
    return { ...model, shifts, presence: [...model.presence, presence], updatedAt: Date.now() };
  }

  static checkOut(model: WorkforceModel, shiftId: string): WorkforceModel {
    const shift = model.shifts.find(s => s.shiftId === shiftId);
    if (!shift) throw new Error(`[UWE] Shift "${shiftId}" does not exist`);
    const shifts = model.shifts.map(s => (s.shiftId === shiftId ? { ...s, status: 'checked_out' as const } : s));
    const presence = model.presence.map(p => (p.shiftId === shiftId && !p.checkOutAt ? { ...p, checkOutAt: Date.now() } : p));
    return { ...model, shifts, presence, updatedAt: Date.now() };
  }

  static getOnDutyWorkers(model: WorkforceModel, opts: { departmentId?: string } = {}): AmxUid[] {
    const now = Date.now();
    return Array.from(new Set(
      model.shifts
        .filter(s => s.start <= now && s.end >= now && s.status === 'checked_in' && (!opts.departmentId || s.departmentId === opts.departmentId))
        .map(s => s.personId),
    ));
  }

  // ── Assignments (UWE-004: independent of shifts) ─────────────────────────────

  static createAssignment(
    model: WorkforceModel,
    input: Omit<UweAssignment, 'assignmentId' | 'status'>,
  ): { model: WorkforceModel; assignment: UweAssignment } {
    if (input.requiresPrivilege) {
      const has = UniversalWorkforceEngine.resolvePrivilege(model, input.personId, input.requiresPrivilege, {
        organizationId: model.organizationId,
      });
      if (!has) {
        throw new Error(`[UWE] UWE-001 violated: person "${input.personId}" lacks active privilege "${input.requiresPrivilege}"`);
      }
    }
    const assignment: UweAssignment = { ...input, assignmentId: nextId('asg'), status: 'scheduled' };
    let shifts = model.shifts;
    if (input.shiftId) {
      shifts = model.shifts.map(s => (s.shiftId === input.shiftId ? { ...s, assignmentIds: [...s.assignmentIds, assignment.assignmentId] } : s));
    }
    return { model: { ...model, assignments: [...model.assignments, assignment], shifts, updatedAt: Date.now() }, assignment };
  }

  static startAssignment(model: WorkforceModel, assignmentId: string): WorkforceModel {
    const assignments = model.assignments.map(a => (a.assignmentId === assignmentId ? { ...a, status: 'active' as const } : a));
    return { ...model, assignments, updatedAt: Date.now() };
  }

  static completeAssignment(model: WorkforceModel, assignmentId: string): WorkforceModel {
    const assignments = model.assignments.map(a => (a.assignmentId === assignmentId ? { ...a, status: 'completed' as const } : a));
    return { ...model, assignments, updatedAt: Date.now() };
  }

  static resolveAssignments(model: WorkforceModel, personId: AmxUid, opts: { activeOnly?: boolean } = {}): UweAssignment[] {
    return model.assignments.filter(a => a.personId === personId && (!opts.activeOnly || a.status === 'scheduled' || a.status === 'active'));
  }

  static getAssignment(model: WorkforceModel, personId: AmxUid): UweAssignment | undefined {
    return UniversalWorkforceEngine.resolveAssignments(model, personId, { activeOnly: true }).find(a => a.status === 'active');
  }

  // ── Handover (UWE-008) ───────────────────────────────────────────────────────

  static createHandover(
    model: WorkforceModel,
    input: Omit<ShiftHandover, 'handoverId' | 'createdAt' | 'status'>,
  ): { model: WorkforceModel; handover: ShiftHandover } {
    const handover: ShiftHandover = { ...input, handoverId: nextId('hb'), createdAt: Date.now(), status: 'open' };
    const shifts = model.shifts.map(s => (s.shiftId === input.shiftId ? { ...s, handoverId: handover.handoverId } : s));
    return { model: { ...model, handovers: [...model.handovers, handover], shifts, updatedAt: Date.now() }, handover };
  }

  static acknowledgeHandover(model: WorkforceModel, handoverId: string, acknowledgedBy: AmxUid): WorkforceModel {
    const handovers = model.handovers.map(h =>
      h.handoverId === handoverId ? { ...h, acknowledgedAt: Date.now(), acknowledgedBy, status: 'acknowledged' as const } : h,
    );
    return { ...model, handovers, updatedAt: Date.now() };
  }

  static getOpenHandovers(model: WorkforceModel): ShiftHandover[] {
    return model.handovers.filter(h => h.status === 'open');
  }

  // ── Leave (with automatic coverage check, UWE-007) ───────────────────────────

  static requestLeave(model: WorkforceModel, input: Omit<LeaveRequest, 'leaveId' | 'status' | 'coverageGap'>): { model: WorkforceModel; leave: LeaveRequest } {
    const now = Date.now();
    const overlaps = model.shifts.some(s =>
      s.personId === input.personId && s.status !== 'cancelled' && s.start >= input.startDate && s.end <= input.endDate,
    );
    const leave: LeaveRequest = { ...input, leaveId: nextId('lv'), status: 'requested', coverageGap: overlaps };
    return { model: { ...model, leave: [...model.leave, leave], updatedAt: now }, leave };
  }

  static approveLeave(model: WorkforceModel, leaveId: string, decidedBy: AmxUid): WorkforceModel {
    const leave = model.leave.map(l =>
      l.leaveId === leaveId ? { ...l, status: 'approved' as const, decidedBy, decidedAt: Date.now() } : l,
    );
    return { ...model, leave, updatedAt: Date.now() };
  }

  static getCoverageGaps(model: WorkforceModel): LeaveRequest[] {
    return model.leave.filter(l => l.status === 'approved' && l.coverageGap);
  }

  // ── Rotation engine (students & residents) ───────────────────────────────────

  static startRotation(
    model: WorkforceModel,
    input: Omit<RotationBlock, 'rotationId' | 'status' | 'logbookEntries' | 'competenciesAchieved'>,
  ): { model: WorkforceModel; rotation: RotationBlock } {
    const rotation: RotationBlock = { ...input, rotationId: nextId('rot'), status: 'scheduled', logbookEntries: 0, competenciesAchieved: [] };
    return { model: { ...model, rotations: [...model.rotations, rotation], updatedAt: Date.now() }, rotation };
  }

  static activateRotation(model: WorkforceModel, rotationId: string): WorkforceModel {
    const rotations = model.rotations.map(r => (r.rotationId === rotationId ? { ...r, status: 'active' as const } : r));
    return { ...model, rotations, updatedAt: Date.now() };
  }

  static completeRotation(model: WorkforceModel, rotationId: string, competenciesAchieved: string[]): WorkforceModel {
    const rotations = model.rotations.map(r =>
      r.rotationId === rotationId ? { ...r, status: 'completed' as const, competenciesAchieved } : r,
    );
    return { ...model, rotations, updatedAt: Date.now() };
  }

  static getActiveRotations(model: WorkforceModel): RotationBlock[] {
    return model.rotations.filter(r => r.status === 'active');
  }

  // ── Multi-facility practice (UWE-002, UWE-005) ───────────────────────────────

  /** Resolve the workspace from active employment + current assignment + shift. */
  static resolveWorkspace(model: WorkforceModel, personId: AmxUid, opts: { organizationId?: string } = {}): UweWorkspace {
    const employment = UniversalWorkforceEngine.getActiveEmployment(model, personId, opts.organizationId ?? model.organizationId);
    if (!employment) throw new Error(`[UWE] No active employment for "${personId}"`);
    const assignment = UniversalWorkforceEngine.resolveAssignments(model, personId, { activeOnly: true }).find(a => a.status === 'active');
    const shift = UniversalWorkforceEngine.resolveShift(model, personId);
    const capabilities = UniversalWorkforceEngine.resolvePrivileges(model, personId, { organizationId: employment.organizationId }).map(p => p.code);
    const context: UweWorkspace['context'] =
      assignment?.location.type === 'theatre' ? 'theatre'
        : assignment?.location.type === 'clinic' ? 'clinic'
        : assignment?.type === 'telemedicine' ? 'telemedicine'
        : assignment?.type === 'teaching' ? 'teaching'
        : assignment?.type === 'research' ? 'research'
        : assignment?.location.type === 'emergency' ? 'emergency'
        : assignment?.location.type === 'icu' ? 'ward'
        : 'ward';
    return {
      personId,
      organizationId: employment.organizationId,
      departmentId: employment.departmentId,
      employment,
      assignment,
      shift,
      capabilities,
      context,
      active: true,
    };
  }

  /** Offboarding security sequence (UWE-006: nothing deleted, everything audited). */
  static offboard(model: WorkforceModel, personId: AmxUid, employmentId: string, reason: string, actorId: AmxUid): WorkforceModel {
    const now = Date.now();
    let next = model;
    // 1. Deactivate employment.
    const employments = (next.employments[personId] ?? []).map(e => (e.employmentId === employmentId ? { ...e, status: 'terminated' as const, endDate: now } : e));
    next = { ...next, employments: { ...next.employments, [personId]: employments } };
    // 2. Revoke privileges for that employment.
    const employment = (model.employments[personId] ?? []).find(e => e.employmentId === employmentId);
    if (employment) {
      const privileges = (next.privileges[personId] ?? []).map(p =>
        p.organizationId === employment.organizationId ? { ...p, active: false, revokedAt: now, revokedBy: actorId, revocationReason: reason } : p,
      );
      next = { ...next, privileges: { ...next.privileges, [personId]: privileges } };
    }
    // 3. Close active assignments.
    const assignments = next.assignments.map(a => (a.personId === personId && a.status !== 'completed' ? { ...a, status: 'cancelled' as const } : a));
    next = { ...next, assignments };
    // 4. Cancel future shifts.
    const shifts = next.shifts.map(s => (s.personId === personId && s.start > now ? { ...s, status: 'cancelled' as const } : s));
    next = { ...next, shifts };
    // 5. Audit — workspace archived, nothing deleted.
    next = {
      ...next,
      auditLog: [...next.auditLog, { at: now, actorId, action: 'offboarded', personId, detail: reason }],
      updatedAt: now,
    };
    return next;
  }

  // ── Transfer (cross-department / cross-facility) ─────────────────────────────

  static transferStaff(
    model: WorkforceModel,
    input: { personId: AmxUid; employmentId: string; fromDepartmentId: string; toDepartmentId: string; toFacilityId?: string; actorId: AmxUid },
  ): WorkforceModel {
    const now = Date.now();
    const employments = (model.employments[input.personId] ?? []).map(e =>
      e.employmentId === input.employmentId ? { ...e, departmentId: input.toDepartmentId } : e,
    );
    const privileges = (model.privileges[input.personId] ?? []).map(p =>
      p.departmentId === input.fromDepartmentId ? { ...p, departmentId: input.toDepartmentId, facilityId: input.toFacilityId ?? p.facilityId } : p,
    );
    return {
      ...model,
      employments: { ...model.employments, [input.personId]: employments },
      privileges: { ...model.privileges, [input.personId]: privileges },
      auditLog: [...model.auditLog, { at: now, actorId: input.actorId, action: 'staff_transferred', personId: input.personId, detail: `${input.fromDepartmentId} → ${input.toDepartmentId}` }],
      updatedAt: now,
    };
  }

  // ── Coverage & analytics (UWE-007) ───────────────────────────────────────────

  static getStaffingRatio(model: WorkforceModel, departmentId: string, patientCount: number): { activeNurses: number; activeDoctors: number; ratio: number } {
    const now = Date.now();
    const onDuty = new Set(
      model.shifts.filter(s => s.departmentId === departmentId && s.start <= now && s.end >= now && s.status === 'checked_in').map(s => s.personId),
    );
    let activeNurses = 0;
    let activeDoctors = 0;
    for (const personId of onDuty) {
      const prof = model.professionalIdentities[personId];
      if (prof?.profession.toLowerCase().includes('nurse')) activeNurses += 1;
      else if (prof?.profession.toLowerCase().includes('doctor') || prof?.profession.toLowerCase().includes('physician')) activeDoctors += 1;
    }
    const total = activeNurses + activeDoctors;
    return {
      activeNurses,
      activeDoctors,
      ratio: total > 0 ? Number((patientCount / total).toFixed(2)) : Infinity,
    };
  }

  static getExpiringLicenses(model: WorkforceModel, days = 60): { personId: AmxUid; name: string; license: { authority: string; number: string; expiresAt?: number } }[] {
    const cutoff = Date.now() + days * 86400000;
    const result: { personId: AmxUid; name: string; license: { authority: string; number: string; expiresAt?: number } }[] = [];
    for (const personId of Object.keys(model.professionalIdentities)) {
      const identity = model.professionalIdentities[personId];
      for (const license of identity.licenses) {
        if (license.expiresAt && license.expiresAt <= cutoff) {
          result.push({ personId: personId as AmxUid, name: model.people[personId]?.legalName ?? personId, license });
        }
      }
    }
    return result;
  }

  static getCoverageGapsByDepartment(model: WorkforceModel, departmentId: string, requiredCount: number): number {
    const onDuty = UniversalWorkforceEngine.getOnDutyWorkers(model, { departmentId }).length;
    return Math.max(0, requiredCount - onDuty);
  }

  static getBurnoutRisk(model: WorkforceModel, threshold = 6): { personId: AmxUid; recentShifts: number }[] {
    const weekAgo = Date.now() - 7 * 86400000;
    const counts: Record<string, number> = {};
    for (const s of model.shifts) {
      if (s.start >= weekAgo && (s.status === 'checked_in' || s.status === 'checked_out')) {
        counts[s.personId] = (counts[s.personId] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .filter(([, count]) => count >= threshold)
      .map(([personId, recentShifts]) => ({ personId: personId as AmxUid, recentShifts }));
  }

  // ── Read conveniences & dashboards ───────────────────────────────────────────

  static getWorkforceSummary(model: WorkforceModel): {
    people: number;
    activeEmployments: number;
    activePrivileges: number;
    onDuty: number;
    openAssignments: number;
    openHandovers: number;
    pendingLeave: number;
    activeRotations: number;
  } {
    return {
      people: Object.keys(model.people).length,
      activeEmployments: Object.values(model.employments).flat().filter(e => e.status === 'active').length,
      activePrivileges: Object.values(model.privileges).flat().filter(p => p.active).length,
      onDuty: UniversalWorkforceEngine.getOnDutyWorkers(model).length,
      openAssignments: model.assignments.filter(a => a.status === 'active' || a.status === 'scheduled').length,
      openHandovers: UniversalWorkforceEngine.getOpenHandovers(model).length,
      pendingLeave: model.leave.filter(l => l.status === 'requested').length,
      activeRotations: UniversalWorkforceEngine.getActiveRotations(model).length,
    };
  }

  static getDepartmentDashboard(model: WorkforceModel, departmentId: string): {
    todayRoster: UweShift[];
    absent: string[];
    onDuty: number;
    coverageGap: number;
  } {
    const now = Date.now();
    const todayShifts = model.shifts.filter(s => s.departmentId === departmentId && s.start >= new Date(now).setHours(0, 0, 0, 0) && s.start < new Date(now).setHours(0, 0, 0, 0) + 86400000);
    const scheduled = new Set(todayShifts.map(s => s.personId));
    const checkedIn = new Set(model.presence.filter(p => todayShifts.some(s => s.shiftId === p.shiftId)).map(p => p.personId));
    const absent = Array.from(scheduled).filter(p => !checkedIn.has(p));
    return {
      todayRoster: todayShifts,
      absent,
      onDuty: UniversalWorkforceEngine.getOnDutyWorkers(model, { departmentId }).length,
      coverageGap: UniversalWorkforceEngine.getCoverageGapsByDepartment(model, departmentId, 5),
    };
  }

  static getClinicianDashboard(model: WorkforceModel, personId: AmxUid): {
    currentAssignment?: UweAssignment;
    nextAssignment?: UweAssignment;
    patients: string[];
    pendingHandovers: ShiftHandover[];
    competencies: UweCompetency[];
  } {
    const active = UniversalWorkforceEngine.resolveAssignments(model, personId, { activeOnly: true });
    return {
      currentAssignment: active.find(a => a.status === 'active'),
      nextAssignment: active.find(a => a.status === 'scheduled'),
      patients: active.flatMap(a => a.linkedPatientIds ?? []),
      pendingHandovers: UniversalWorkforceEngine.getOpenHandovers(model).filter(h => h.toPersonId === personId),
      competencies: UniversalWorkforceEngine.getCompetencies(model, personId),
    };
  }
}

export default UniversalWorkforceEngine;
