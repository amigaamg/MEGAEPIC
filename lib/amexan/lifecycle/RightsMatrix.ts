// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CONSTITUTIONAL RIGHTS MATRIX (BOOK IX · Universal Patient Lifecycle)
//
// The patient journey is one continuous graph. Each professional contributes only
// the part they are constitutionally responsible for. This matrix is the single
// constitutional source of truth for WHO may perform WHICH activity along the
// journey — the backbone for every dashboard, permission, EMR action, AI decision,
// audit trail, and inter-engine communication.
//
//   Row  = activity (an atomic contribution to the patient journey)
//   Col  = actor family
//   Cell = 'allowed' | 'denied' | 'conditional' (with reason)
//
// The Doctor engine NEVER asks "Am I in a hospital?" It asks "Does this workspace
// support this capability?" and the rights matrix answers "may this actor perform
// this activity?" Everything else is configuration.
//
// This module is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Actor families (columns of the matrix) ─────────────────────────────────────

export type RightsActorFamily =
  | 'reception' | 'nurse' | 'doctor' | 'clinical_officer'
  | 'laboratory' | 'radiology' | 'pharmacy' | 'finance';

export const RIGHTS_ACTOR_FAMILIES: readonly RightsActorFamily[] = [
  'reception', 'nurse', 'doctor', 'clinical_officer',
  'laboratory', 'radiology', 'pharmacy', 'finance',
];

// Map constitutional positions/roles onto actor families. This is the ONLY place
// where the mapping lives — dashboards, guards, and engines all consult it.
export const ROLE_TO_RIGHTS_FAMILY: Readonly<Record<string, RightsActorFamily>> = {
  receptionist: 'reception',
  records_officer: 'reception',
  admissions_clerk: 'reception',
  registration_clerk: 'reception',
  staff_nurse: 'nurse',
  senior_nurse: 'nurse',
  nurse_manager: 'nurse',
  nurse_intern: 'nurse',
  chief_nursing_officer: 'nurse',
  midwife: 'nurse',
  senior_midwife: 'nurse',
  medical_officer: 'doctor',
  senior_registrar: 'doctor',
  registrar: 'doctor',
  resident: 'doctor',
  consultant: 'doctor',
  specialist: 'doctor',
  medical_director: 'doctor',
  department_head: 'doctor',
  clinical_officer: 'clinical_officer',
  senior_clinical_officer: 'clinical_officer',
  lab_technologist: 'laboratory',
  senior_lab_technologist: 'laboratory',
  lab_intern: 'laboratory',
  lab_scientist: 'laboratory',
  radiographer: 'radiology',
  senior_radiographer: 'radiology',
  radiologist: 'radiology',
  pharmacist: 'pharmacy',
  senior_pharmacist: 'pharmacy',
  pharmacist_intern: 'pharmacy',
  chief_pharmacist: 'pharmacy',
  finance_officer: 'finance',
  cashier: 'finance',
  billing_officer: 'finance',
};

// ── Activities (rows of the matrix) ────────────────────────────────────────────

export type RightsActivity =
  | 'register_patient' | 'verify_identity' | 'create_encounter' | 'triage'
  | 'record_vitals' | 'take_history' | 'perform_examination' | 'diagnose'
  | 'order_labs_imaging' | 'perform_lab_test' | 'report_imaging'
  | 'prescribe_medication' | 'dispense_medication' | 'administer_medication'
  | 'admit_patient' | 'allocate_bed' | 'write_medical_progress_notes'
  | 'write_nursing_notes' | 'discharge_patient';

export const RIGHTS_ACTIVITIES: readonly RightsActivity[] = [
  'register_patient', 'verify_identity', 'create_encounter', 'triage',
  'record_vitals', 'take_history', 'perform_examination', 'diagnose',
  'order_labs_imaging', 'perform_lab_test', 'report_imaging',
  'prescribe_medication', 'dispense_medication', 'administer_medication',
  'admit_patient', 'allocate_bed', 'write_medical_progress_notes',
  'write_nursing_notes', 'discharge_patient',
];

// ── Verdicts ───────────────────────────────────────────────────────────────────

export type RightsVerdict = 'allowed' | 'denied' | 'conditional';

export interface RightsCell {
  verdict: RightsVerdict;
  reason?: string;
}

export type RightsRow = Partial<Record<RightsActorFamily, RightsCell>>;

// ── The Constitutional Rights Matrix ───────────────────────────────────────────
//
// Encodes the constitutional table verbatim. Notes from the constitution are
// captured as `conditional` cells with their reason (e.g. "Limited screening",
// "Protocol only (if allowed)", "Ward In-Charge").

export const RIGHTS_MATRIX: Readonly<Record<RightsActivity, RightsRow>> = {
  register_patient: {
    reception: { verdict: 'allowed' },
  },
  verify_identity: {
    reception: { verdict: 'allowed' },
  },
  create_encounter: {
    reception: { verdict: 'allowed' },
  },
  triage: {
    nurse: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed', reason: 'Where applicable' },
  },
  record_vitals: {
    nurse: { verdict: 'allowed' },
    doctor: { verdict: 'conditional', reason: 'If needed' },
    clinical_officer: { verdict: 'conditional', reason: 'If needed' },
  },
  take_history: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
    nurse: { verdict: 'conditional', reason: 'Limited screening only' },
  },
  perform_examination: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
    nurse: { verdict: 'conditional', reason: 'Limited nursing assessment only' },
  },
  diagnose: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
  },
  order_labs_imaging: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
    nurse: { verdict: 'conditional', reason: 'Protocol-driven orders only where legally allowed' },
  },
  perform_lab_test: {
    laboratory: { verdict: 'allowed' },
  },
  report_imaging: {
    radiology: { verdict: 'allowed' },
  },
  prescribe_medication: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
  },
  dispense_medication: {
    pharmacy: { verdict: 'allowed' },
  },
  administer_medication: {
    nurse: { verdict: 'allowed' },
    doctor: { verdict: 'conditional', reason: 'Occasionally, within scope' },
  },
  admit_patient: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
  },
  allocate_bed: {
    nurse: { verdict: 'conditional', reason: 'Ward In-Charge only' },
  },
  write_medical_progress_notes: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
  },
  write_nursing_notes: {
    nurse: { verdict: 'allowed' },
  },
  discharge_patient: {
    doctor: { verdict: 'allowed' },
    clinical_officer: { verdict: 'allowed' },
  },
};

// ── Query engine ───────────────────────────────────────────────────────────────

export interface RightsVerdictResult {
  activity: RightsActivity;
  family: RightsActorFamily;
  verdict: RightsVerdict;
  reason?: string;
}

/** Whether an actor family may perform an activity. */
export function rightsFor(family: RightsActorFamily, activity: RightsActivity): RightsCell {
  const row = RIGHTS_MATRIX[activity];
  return row[family] ?? { verdict: 'denied', reason: `${family} is not permitted to ${activity}` };
}

/** Whether a specific role may perform an activity (resolved via family). */
export function roleMayPerform(role: string, activity: RightsActivity): RightsVerdictResult {
  const family = ROLE_TO_RIGHTS_FAMILY[role];
  if (!family) {
    return { activity, family: 'reception', verdict: 'denied', reason: `Role "${role}" is not mapped to a rights family` };
  }
  const cell = rightsFor(family, activity);
  return { activity, family, verdict: cell.verdict, reason: cell.reason };
}

/** Strict boolean gate: denied roles cannot act, conditional requires approval flag. */
export function mayPerform(role: string, activity: RightsActivity, opts?: { allowConditional?: boolean }): boolean {
  const result = roleMayPerform(role, activity);
  if (result.verdict === 'allowed') return true;
  if (result.verdict === 'conditional' && opts?.allowConditional) return true;
  return false;
}

/** Guard used by engines: throws when the actor lacks the constitutional right. */
export function assertRights(role: string, activity: RightsActivity, opts?: { allowConditional?: boolean }): void {
  const result = roleMayPerform(role, activity);
  if (result.verdict === 'allowed') return;
  if (result.verdict === 'conditional' && opts?.allowConditional) return;
  throw new Error(`[RightsMatrix] ${role} may not ${activity}${result.reason ? ` — ${result.reason}` : ''}`);
}

// ── Provenance ─────────────────────────────────────────────────────────────────

export interface RightsEnforcement {
  actorId: AmxUid;
  role: string;
  family: RightsActorFamily;
  activity: RightsActivity;
  allowed: boolean;
  reason?: string;
  at: number;
}

/** Record a decision so the audit trail proves who could do what, when. */
export function enforceRights(
  actorId: AmxUid, role: string, activity: RightsActivity,
  opts?: { allowConditional?: boolean },
): RightsEnforcement {
  const result = roleMayPerform(role, activity);
  const allowed = result.verdict === 'allowed' || (result.verdict === 'conditional' && opts?.allowConditional);
  if (!allowed) throw new Error(`[RightsMatrix] ${role} may not ${activity}${result.reason ? ` — ${result.reason}` : ''}`);
  return { actorId, role, family: result.family, activity, allowed, reason: result.reason, at: Date.now() };
}

/** Every activity is owned by exactly one profession as its primary owner. */
export function primaryOwner(activity: RightsActivity): RightsActorFamily | undefined {
  const allowed = RIGHTS_ACTOR_FAMILIES.filter(f => rightsFor(f, activity).verdict === 'allowed');
  return allowed.length === 1 ? allowed[0] : undefined;
}

/** Allowed actors (those with a straight 'allowed' verdict) for an activity. */
export function allowedActors(activity: RightsActivity): RightsActorFamily[] {
  return RIGHTS_ACTOR_FAMILIES.filter(f => rightsFor(f, activity).verdict === 'allowed');
}
