// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CLINICAL OFFICER ENGINE (BOOK VI-I) — Engine No. 19
//
// "The Engine of Frontline, Community-Anchored Clinical Care"
//
// The Clinical Officer (CO) is a licensed frontline clinician who diagnoses,
// treats, prescribes, orders investigations, admits, and discharges patients —
// most often in primary, outpatient, and district facilities where they are the
// most senior clinician on site. The Senior Clinical Officer (SCO) adds approved
// surgical scope and supervisory authority over COs, interns, and students.
//
// Position in the Constitutional Hierarchy (clinical cadre):
//   Medical Director → Department Head → Consultant → Senior Registrar →
//   Registrar → Medical Officer → Senior Clinical Officer → Clinical Officer →
//   Intern → Student
//
// AI Collaboration: the CO is a partner with the Clinical Intelligence Engine —
// accepting suggestions, annotating evidence, flagging errors, and contributing
// frontline knowledge, while preserving auditability at every step.
//
// Constitutional Distinctions (enforced, never commented away):
//   • Clinical Officer (CO):     prescribes, orders labs & imaging, admits,
//                                discharges, covers primary & outpatient care;
//                                NO surgery, NO supervision.
//   • Senior Clinical Officer (SCO): adds approved surgical procedures and
//     supervisory authority over COs, interns, and students.
//   A CO cannot manage hospital finances, create organizations, modify
//   constitutional engines, change enterprise security, access unrelated
//   departments without authorization, delete audit logs, or override legal
//   consent requirements.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { MedicalSpecialty } from '@/lib/amexan/constitution/types';

// ── Clinical officer grade ─────────────────────────────────────────────────────

export type ClinicalOfficerGrade = 'clinical_officer' | 'senior_clinical_officer';

export const CLINICAL_OFFICER_GRADES: readonly { grade: ClinicalOfficerGrade; label: string; surgery: boolean; supervision: boolean }[] = [
  { grade: 'clinical_officer', label: 'Clinical Officer', surgery: false, supervision: false },
  { grade: 'senior_clinical_officer', label: 'Senior Clinical Officer', surgery: true, supervision: true },
];

export function getGradeCapabilities(grade: ClinicalOfficerGrade): { surgery: boolean; supervision: boolean } {
  const entry = CLINICAL_OFFICER_GRADES.find(g => g.grade === grade);
  if (!entry) throw new Error(`[COE] Unknown clinical officer grade "${grade}"`);
  return { surgery: entry.surgery, supervision: entry.supervision };
}

// ── Today's clinical work ─────────────────────────────────────────────────────────

export interface CoWorkload {
  opdPatients: number;
  wardPatients: number;
  chronicReviews: number;
  triageAssessments: number;
  procedures: number;
  admissions: number;
  discharges: number;
  referrals: number;
  emergencyCases: number;
}

// ── My patients (automatically grouped) ───────────────────────────────────────────

export type CoPatientGroup =
  | 'critical' | 'new_assessment' | 'chronic_follow_up' | 'review'
  | 'stable' | 'discharge_candidate' | 'awaiting_investigations' | 'awaiting_consultant_review';

export interface CoPatient {
  patientId: string;
  name?: string;
  group: CoPatientGroup;
  ward?: string;
  site?: string;
  status: 'active' | 'discharged' | 'transferred';
  assignedAt: number;
}

// ── Frontline triage engine ────────────────────────────────────────────────────────

export type CoTriageAcuity = 'resuscitation' | 'emergency' | 'urgent' | 'semi_urgent' | 'non_urgent';

export interface CoTriage {
  id: string;
  patientId: string;
  acuity: CoTriageAcuity;
  redFlags: string[];
  immediateActions: string[];
  disposition: string;
  escalatedTo?: string;
  assessedAt: number;
}

// ── Consultation / assessment engine ──────────────────────────────────────────────

export interface CoAssessment {
  id: string;
  patientId: string;
  complaint: string;
  history: string;
  examination: string;
  problemList: string[];
  differentials: { diagnosis: string; evidencePercent: number }[];
  workingDiagnosis: string;
  management: string[];
  disposition: string;
  consultNeeded?: string;
  at: number;
}

// ── Prescription engine ───────────────────────────────────────────────────────────

export interface CoPrescription {
  id: string;
  patientId: string;
  medication: string;
  dose: string;
  frequency: string;
  route: string;
  durationDays: number;
  status: 'active' | 'completed' | 'stopped';
  prescribedAt: number;
}

// ── Investigation orders engine ───────────────────────────────────────────────────

export type CoInvestigationKind = 'laboratory' | 'imaging' | 'microbiology';

export interface CoInvestigationOrder {
  id: string;
  patientId: string;
  kind: CoInvestigationKind;
  order: string;
  indication: string;
  status: 'requested' | 'in_progress' | 'resulted' | 'cancelled';
  result?: string;
  orderedAt: number;
  resultedAt?: number;
}

// ── Procedure engine ──────────────────────────────────────────────────────────────

export type CoProcedureName =
  | 'suturing' | 'incision_and_drainage' | 'foreign_body_removal' | 'wound_dressing'
  | 'venepuncture' | 'iv_cannulation' | 'lumbar_puncture' | 'pleural_tap' | 'abscess_drainage';

export const APPROVED_CO_PROCEDURES: readonly CoProcedureName[] = [
  'suturing', 'incision_and_drainage', 'foreign_body_removal', 'wound_dressing',
  'venepuncture', 'iv_cannulation',
];

export const SCO_ONLY_PROCEDURES: readonly CoProcedureName[] = [
  'lumbar_puncture', 'pleural_tap', 'abscess_drainage',
];

export interface CoProcedure {
  id: string;
  patientId: string;
  name: string;
  requiresSco: boolean;
  indications: string[];
  outcome: string;
  complications?: string;
  performedAt: number;
}

// ── Admission / discharge engine ─────────────────────────────────────────────────

export interface CoAdmission {
  id: string;
  patientId: string;
  reason: string;
  ward: string;
  referredFrom?: string;
  admittedAt: number;
}

export interface CoDischarge {
  id: string;
  patientId: string;
  summary: string;
  medications: string[];
  followUpDate?: string;
  escalatedTo?: string;
  dischargedAt: number;
}

// ── Referral & escalation (CO escalates up the cadre) ────────────────────────────

export type CoReferralTarget = 'medical_officer' | 'consultant' | 'specialist' | 'surgery' | 'icu' | 'external';

export interface CoReferral {
  id: string;
  patientId: string;
  target: CoReferralTarget;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  createdAt: number;
}

// ── Community & public-health anchor ─────────────────────────────────────────────

export type CoCommunityKind = 'outreach' | 'chronic_clinic' | 'immunization' | 'home_visit' | 'health_education';

export interface CommunitySession {
  id: string;
  kind: CoCommunityKind;
  site?: string;
  patientsSeen: number;
  notes: string;
  heldAt: number;
}

// ── Teaching & personal learning ────────────────────────────────────────────────

export type CoTeachingKind = 'bedside' | 'skill_demonstration' | 'case_discussion' | 'student_session';

export interface CoTeachingRecord {
  id: string;
  kind: CoTeachingKind;
  topic: string;
  learnerId: AmxUid;
  at: number;
}

export interface CoLearningRecord {
  id: string;
  topic: string;
  triggeredBy: string;
  guidelines: string[];
  createdAt: number;
}

// ── Personal analytics & benchmarks ─────────────────────────────────────────────

export interface CoBenchmarkValue { self: number; facility: number; district: number; national: number }

export interface CoAnalytics {
  consultations: CoBenchmarkValue;
  chronicManagement: CoBenchmarkValue;
  referralTimeliness: CoBenchmarkValue;
  documentation: CoBenchmarkValue;
  procedureNumbers: CoBenchmarkValue;
  complications: CoBenchmarkValue;
  communityOutreach: CoBenchmarkValue;
  supervisorFeedback: CoBenchmarkValue;
}

export interface CoAuditEntry {
  at: number;
  actorId: AmxUid;
  action: string;
  detail?: string;
}

// ── The full model ─────────────────────────────────────────────────────────────

export interface ClinicalOfficerModel {
  organizationId: AmxUid;
  facilityId?: AmxUid;
  grade: ClinicalOfficerGrade;
  supervisorId?: AmxUid;
  seniorClinicalOfficerId?: AmxUid;
  medicalOfficerId?: AmxUid;
  departmentId: string;
  specialties: MedicalSpecialty[];
  officerId: AmxUid;
  workload: CoWorkload;
  patients: CoPatient[];
  triage: CoTriage[];
  assessments: CoAssessment[];
  prescriptions: CoPrescription[];
  investigations: CoInvestigationOrder[];
  procedures: CoProcedure[];
  admissions: CoAdmission[];
  discharges: CoDischarge[];
  referrals: CoReferral[];
  community: CommunitySession[];
  teaching: CoTeachingRecord[];
  learning: CoLearningRecord[];
  analytics: CoAnalytics;
  auditLog: CoAuditEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateClinicalOfficerModelInput {
  organizationId: AmxUid;
  facilityId?: AmxUid;
  grade?: ClinicalOfficerGrade;
  supervisorId?: AmxUid;
  seniorClinicalOfficerId?: AmxUid;
  medicalOfficerId?: AmxUid;
  departmentId?: string;
  specialties?: MedicalSpecialty[];
  officerId: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const ZERO_BENCHMARK: CoBenchmarkValue = { self: 0, facility: 0, district: 0, national: 0 };

// ── Constitutional authority / restriction tables ──────────────────────────────

export const CLINICAL_OFFICER_AUTHORITY: readonly string[] = [
  'triage_patients', 'assess_common_conditions', 'request_laboratory_investigations',
  'request_imaging', 'prescribe_medications', 'perform_approved_procedures',
  'admit_patients', 'discharge_appropriate_patients', 'refer_patients',
  'escalate_emergencies', 'provide_primary_care', 'document_care',
  'run_chronic_clinics', 'community_health_outreach',
];

export const SCO_AUTHORITY_EXTENSION: readonly string[] = [
  'perform_sco_only_procedures', 'supervise_clinical_officers',
  'supervise_interns', 'supervise_students',
];

export const CLINICAL_OFFICER_RESTRICTIONS: readonly string[] = [
  'modify_hospital_protocols', 'change_constitutional_rules', 'manage_departments',
  'approve_consultant_only_procedures', 'override_patient_consent',
  'access_unrelated_departmental_data', 'delete_audit_records', 'modify_enterprise_permissions',
  'perform_complex_surgery', 'supervise_peers',
];

// ── The Engine ───────────────────────────────────────────────────────────────

export class ClinicalOfficerEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateClinicalOfficerModelInput): ClinicalOfficerModel {
    if (!input.organizationId) throw new Error('[COE] organizationId is required');
    if (!input.officerId) throw new Error('[COE] officerId is required');
    const grade: ClinicalOfficerGrade = input.grade ?? 'clinical_officer';
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      grade,
      supervisorId: input.supervisorId,
      seniorClinicalOfficerId: input.seniorClinicalOfficerId,
      medicalOfficerId: input.medicalOfficerId,
      departmentId: input.departmentId ?? 'outpatient_primary_care',
      specialties: input.specialties ?? ['general_practice', 'other'],
      officerId: input.officerId,
      workload: {
        opdPatients: 0, wardPatients: 0, chronicReviews: 0, triageAssessments: 0,
        procedures: 0, admissions: 0, discharges: 0, referrals: 0, emergencyCases: 0,
      },
      patients: [],
      triage: [],
      assessments: [],
      prescriptions: [],
      investigations: [],
      procedures: [],
      admissions: [],
      discharges: [],
      referrals: [],
      community: [],
      teaching: [],
      learning: [],
      analytics: {
        consultations: { ...ZERO_BENCHMARK },
        chronicManagement: { ...ZERO_BENCHMARK },
        referralTimeliness: { ...ZERO_BENCHMARK },
        documentation: { ...ZERO_BENCHMARK },
        procedureNumbers: { ...ZERO_BENCHMARK },
        complications: { ...ZERO_BENCHMARK },
        communityOutreach: { ...ZERO_BENCHMARK },
        supervisorFeedback: { ...ZERO_BENCHMARK },
      },
      auditLog: [{ at: now, actorId: input.officerId, action: 'clinical_officer_registered', detail: getGradeCapabilities(grade).surgery ? 'SCO scope' : 'CO scope' }],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static assertOfficer(model: ClinicalOfficerModel, actorId: AmxUid): void {
    if (actorId !== model.officerId) throw new Error('[COE] Only the Clinical Officer may perform this action');
  }

  static canOfficerPerform(grade: ClinicalOfficerGrade, action: string): { allowed: boolean; reason?: string } {
    if (CLINICAL_OFFICER_AUTHORITY.includes(action)) return { allowed: true };
    if (SCO_AUTHORITY_EXTENSION.includes(action)) {
      const caps = getGradeCapabilities(grade);
      if (caps.supervision && action.startsWith('supervise_')) return { allowed: true };
      if (action === 'perform_sco_only_procedures' && caps.surgery) return { allowed: true };
      return { allowed: false, reason: 'This action requires Senior Clinical Officer scope.' };
    }
    if (CLINICAL_OFFICER_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        modify_hospital_protocols: 'Hospital protocols are governed at department and facility level.',
        change_constitutional_rules: 'Constitutional rules may not be changed.',
        manage_departments: 'Department management is Department Head authority.',
        approve_consultant_only_procedures: 'Consultant-only procedures require Consultant approval.',
        override_patient_consent: 'Patient consent may not be overridden.',
        access_unrelated_departmental_data: 'Unrelated departmental data is outside scope.',
        delete_audit_records: 'Audit records are append-only and may never be deleted.',
        modify_enterprise_permissions: 'Enterprise permissions may not be modified.',
        perform_complex_surgery: 'Complex surgery requires a surgeon or Consultant.',
        supervise_peers: 'Clinical Officers do not supervise peers of the same grade.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Clinical Officer authority.` };
  }

  static guard(model: ClinicalOfficerModel, actorId: AmxUid, action: string): void {
    ClinicalOfficerEngine.assertOfficer(model, actorId);
    const verdict = ClinicalOfficerEngine.canOfficerPerform(model.grade, action);
    if (!verdict.allowed) throw new Error(`[COE] ${verdict.reason}`);
  }

  static audit(model: ClinicalOfficerModel, actorId: AmxUid, action: string, detail?: string): ClinicalOfficerModel {
    const now = Date.now();
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId, action, detail }], updatedAt: now };
  }

  // ── Today's clinical work ────────────────────────────────────────────────────

  static updateWorkload(model: ClinicalOfficerModel, actorId: AmxUid, patch: Partial<CoWorkload>): ClinicalOfficerModel {
    ClinicalOfficerEngine.guard(model, actorId, 'document_care');
    const workload = { ...model.workload, ...patch };
    return { ...ClinicalOfficerEngine.audit(model, actorId, 'workload_updated'), workload };
  }

  static getTodayWork(model: ClinicalOfficerModel): CoWorkload {
    return { ...model.workload };
  }

  // ── My patients ──────────────────────────────────────────────────────────────

  static assignPatient(model: ClinicalOfficerModel, actorId: AmxUid, patient: Omit<CoPatient, 'assignedAt' | 'status'>): { model: ClinicalOfficerModel; patient: CoPatient } {
    ClinicalOfficerEngine.guard(model, actorId, 'document_care');
    const created: CoPatient = { ...patient, status: 'active', assignedAt: Date.now() };
    const patients = [...model.patients.filter(p => p.patientId !== created.patientId), created];
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'patient_assigned', created.patientId), patients }, patient: created };
  }

  static unassignPatient(model: ClinicalOfficerModel, actorId: AmxUid, patientId: string): ClinicalOfficerModel {
    ClinicalOfficerEngine.guard(model, actorId, 'document_care');
    const patients = model.patients.filter(p => p.patientId !== patientId);
    return { ...ClinicalOfficerEngine.audit(model, actorId, 'patient_unassigned', patientId), patients };
  }

  // ── Frontline triage ─────────────────────────────────────────────────────────

  static performTriage(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoTriage, 'id' | 'assessedAt'>,
  ): { model: ClinicalOfficerModel; triage: CoTriage } {
    ClinicalOfficerEngine.guard(model, actorId, 'triage_patients');
    const created: CoTriage = { ...input, id: nextId('triage'), assessedAt: Date.now() };
    const triage = [...model.triage, created];
    const workload = { ...model.workload, triageAssessments: model.workload.triageAssessments + 1 };
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'triage_performed', created.id), triage, workload }, triage: created };
  }

  // ── Consultation / assessment ────────────────────────────────────────────────

  static recordAssessment(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoAssessment, 'id' | 'at'>,
  ): { model: ClinicalOfficerModel; assessment: CoAssessment } {
    ClinicalOfficerEngine.guard(model, actorId, 'assess_common_conditions');
    const created: CoAssessment = { ...input, id: nextId('assess'), at: Date.now() };
    const assessments = [...model.assessments, created];
    const workload = { ...model.workload, opdPatients: model.workload.opdPatients + 1 };
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'assessment_recorded', created.id), assessments, workload }, assessment: created };
  }

  // ── Prescription engine ──────────────────────────────────────────────────────

  static prescribe(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoPrescription, 'id' | 'prescribedAt' | 'status'>,
  ): { model: ClinicalOfficerModel; prescription: CoPrescription } {
    ClinicalOfficerEngine.guard(model, actorId, 'prescribe_medications');
    const created: CoPrescription = { ...input, id: nextId('rx'), status: 'active', prescribedAt: Date.now() };
    const prescriptions = [...model.prescriptions, created];
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'prescription_written', created.id), prescriptions }, prescription: created };
  }

  static stopPrescription(model: ClinicalOfficerModel, actorId: AmxUid, prescriptionId: string): ClinicalOfficerModel {
    ClinicalOfficerEngine.guard(model, actorId, 'prescribe_medications');
    const prescriptions = model.prescriptions.map(p => p.id === prescriptionId ? { ...p, status: 'stopped' as const } : p);
    return { ...ClinicalOfficerEngine.audit(model, actorId, 'prescription_stopped', prescriptionId), prescriptions };
  }

  // ── Investigation orders ─────────────────────────────────────────────────────

  static orderInvestigation(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoInvestigationOrder, 'id' | 'orderedAt' | 'status'>,
  ): { model: ClinicalOfficerModel; order: CoInvestigationOrder } {
    const action = input.kind === 'imaging' ? 'request_imaging' : 'request_laboratory_investigations';
    ClinicalOfficerEngine.guard(model, actorId, action);
    const created: CoInvestigationOrder = { ...input, id: nextId('inv'), status: 'requested', orderedAt: Date.now() };
    const investigations = [...model.investigations, created];
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'investigation_ordered', created.id), investigations }, order: created };
  }

  static recordResult(
    model: ClinicalOfficerModel, actorId: AmxUid, orderId: string, result: string,
  ): ClinicalOfficerModel {
    ClinicalOfficerEngine.guard(model, actorId, 'document_care');
    const investigations = model.investigations.map(o =>
      o.id === orderId ? { ...o, status: 'resulted' as const, result, resultedAt: Date.now() } : o,
    );
    return { ...ClinicalOfficerEngine.audit(model, actorId, 'investigation_resulted', orderId), investigations };
  }

  // ── Procedure engine ─────────────────────────────────────────────────────────

  static canPerformProcedure(grade: ClinicalOfficerGrade, name: string): { allowed: boolean; reason?: string } {
    if (APPROVED_CO_PROCEDURES.includes(name as CoProcedureName)) return { allowed: true };
    if (SCO_ONLY_PROCEDURES.includes(name as CoProcedureName)) {
      const caps = getGradeCapabilities(grade);
      if (caps.surgery) return { allowed: true };
      return { allowed: false, reason: 'This procedure requires Senior Clinical Officer scope.' };
    }
    return { allowed: false, reason: 'This procedure is outside Clinical Officer scope.' };
  }

  static performProcedure(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoProcedure, 'id' | 'performedAt' | 'requiresSco'>,
  ): { model: ClinicalOfficerModel; procedure: CoProcedure } {
    const verdict = ClinicalOfficerEngine.canPerformProcedure(model.grade, input.name);
    if (!verdict.allowed) throw new Error(`[COE] ${verdict.reason}`);
    const action = SCO_ONLY_PROCEDURES.includes(input.name as CoProcedureName) ? 'perform_sco_only_procedures' : 'perform_approved_procedures';
    ClinicalOfficerEngine.guard(model, actorId, action);
    const created: CoProcedure = {
      ...input, id: nextId('proc'),
      requiresSco: SCO_ONLY_PROCEDURES.includes(input.name as CoProcedureName),
      performedAt: Date.now(),
    };
    const procedures = [...model.procedures, created];
    const workload = { ...model.workload, procedures: model.workload.procedures + 1 };
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'procedure_performed', created.id), procedures, workload }, procedure: created };
  }

  // ── Admission / discharge ────────────────────────────────────────────────────

  static admitPatient(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoAdmission, 'id' | 'admittedAt'>,
  ): { model: ClinicalOfficerModel; admission: CoAdmission } {
    ClinicalOfficerEngine.guard(model, actorId, 'admit_patients');
    const created: CoAdmission = { ...input, id: nextId('adm'), admittedAt: Date.now() };
    const admissions = [...model.admissions, created];
    const workload = { ...model.workload, admissions: model.workload.admissions + 1, wardPatients: model.workload.wardPatients + 1 };
    const patients = model.patients.map(p => p.patientId === input.patientId ? { ...p, status: 'active' as const, ward: input.ward } : p);
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'patient_admitted', created.id), admissions, workload, patients }, admission: created };
  }

  static dischargePatient(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoDischarge, 'id' | 'dischargedAt'>,
  ): { model: ClinicalOfficerModel; discharge: CoDischarge } {
    ClinicalOfficerEngine.guard(model, actorId, 'discharge_appropriate_patients');
    const created: CoDischarge = { ...input, id: nextId('dis'), dischargedAt: Date.now() };
    const discharges = [...model.discharges, created];
    const workload = { ...model.workload, discharges: model.workload.discharges + 1, wardPatients: Math.max(0, model.workload.wardPatients - 1) };
    const patients = model.patients.map(p => p.patientId === input.patientId ? { ...p, status: 'discharged' as const } : p);
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'patient_discharged', created.id), discharges, workload, patients }, discharge: created };
  }

  // ── Referral & escalation ────────────────────────────────────────────────────

  static referPatient(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoReferral, 'id' | 'createdAt' | 'status'>,
  ): { model: ClinicalOfficerModel; referral: CoReferral } {
    ClinicalOfficerEngine.guard(model, actorId, 'refer_patients');
    const created: CoReferral = { ...input, id: nextId('ref'), status: 'pending', createdAt: Date.now() };
    const referrals = [...model.referrals, created];
    const workload = { ...model.workload, referrals: model.workload.referrals + 1 };
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'referral_created', created.id), referrals, workload }, referral: created };
  }

  static escalateEmergency(
    model: ClinicalOfficerModel, actorId: AmxUid, patientId: string, reason: string, escalatedTo?: string,
  ): ClinicalOfficerModel {
    ClinicalOfficerEngine.guard(model, actorId, 'escalate_emergencies');
    const workload = { ...model.workload, emergencyCases: model.workload.emergencyCases + 1 };
    return { ...ClinicalOfficerEngine.audit(model, actorId, 'emergency_escalated', `${patientId}: ${reason} → ${escalatedTo ?? 'cadre'}`), workload };
  }

  // ── Community & public-health anchor ─────────────────────────────────────────

  static recordCommunitySession(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CommunitySession, 'id' | 'heldAt'>,
  ): { model: ClinicalOfficerModel; session: CommunitySession } {
    ClinicalOfficerEngine.guard(model, actorId, 'community_health_outreach');
    const created: CommunitySession = { ...input, id: nextId('com'), heldAt: Date.now() };
    const community = [...model.community, created];
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'community_session_recorded', created.id), community }, session: created };
  }

  // ── Supervision (SCO only) ───────────────────────────────────────────────────

  static superviseLearner(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoTeachingRecord, 'id' | 'at'>,
  ): { model: ClinicalOfficerModel; record: CoTeachingRecord } {
    ClinicalOfficerEngine.guard(model, actorId, 'supervise_clinical_officers');
    const created: CoTeachingRecord = { ...input, id: nextId('teach'), at: Date.now() };
    const teaching = [...model.teaching, created];
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'learner_supervised', created.id), teaching }, record: created };
  }

  // ── Personal learning ────────────────────────────────────────────────────────

  static addLearning(
    model: ClinicalOfficerModel, actorId: AmxUid, input: Omit<CoLearningRecord, 'id' | 'createdAt'>,
  ): { model: ClinicalOfficerModel; record: CoLearningRecord } {
    ClinicalOfficerEngine.guard(model, actorId, 'document_care');
    const created: CoLearningRecord = { ...input, id: nextId('learn'), createdAt: Date.now() };
    const learning = [...model.learning, created];
    return { model: { ...ClinicalOfficerEngine.audit(model, actorId, 'learning_recorded', created.id), learning }, record: created };
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  static updateBenchmark(
    model: ClinicalOfficerModel, actorId: AmxUid, key: keyof CoAnalytics, patch: Partial<CoBenchmarkValue>,
  ): ClinicalOfficerModel {
    ClinicalOfficerEngine.guard(model, actorId, 'document_care');
    const analytics = { ...model.analytics, [key]: { ...model.analytics[key], ...patch } };
    return { ...ClinicalOfficerEngine.audit(model, actorId, 'benchmark_updated', key), analytics };
  }

  static getAuditLog(model: ClinicalOfficerModel): readonly CoAuditEntry[] {
    return model.auditLog;
  }
}
