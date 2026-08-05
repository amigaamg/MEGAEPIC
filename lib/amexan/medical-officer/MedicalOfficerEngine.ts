// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN MEDICAL OFFICER ENGINE (BOOK VI-F) — Engine No. 16
//
// "The Engine of Frontline Clinical Practice"
//
// The Medical Officer (MO) is the primary frontline clinician responsible for
// delivering continuous, safe, evidence-based patient care. Unlike Residents,
// Medical Officers are not necessarily in specialty training. Unlike
// Consultants, they are not the final decision-makers. They are the operational
// backbone of the hospital.
//
// Position in the Constitutional Hierarchy:
//   Medical Director → Department Head → Consultant → Resident →
//   Medical Officer → Intern → Student
//
// The Medical Officer independently manages appropriate cases while escalating
// complex situations through constitutional pathways. AMEXAN exists to make
// every Medical Officer practice like the best version of themselves through
// constitutional intelligence. The Medical Officer always remains the
// decision-maker.
//
// Constitutional Restrictions (enforced, never commented away):
//   A Medical Officer cannot modify hospital protocols, change constitutional
//   rules, manage departments, approve consultant-only procedures, override
//   patient consent, access unrelated departmental data, delete audit records,
//   or modify enterprise permissions.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { MedicalSpecialty } from '@/lib/amexan/constitution/types';

// ── Today's clinical work ──────────────────────────────────────────────────────

export interface MoWorkload {
  admissions: number;
  wardPatients: number;
  opdPatients: number;
  emergencyCases: number;
  referrals: number;
  discharges: number;
  followUps: number;
}

// ── My patients (automatically grouped) ────────────────────────────────────────

export type MoPatientGroup =
  | 'critical' | 'new_admission' | 'review' | 'stable'
  | 'discharge_candidate' | 'awaiting_investigations' | 'awaiting_consultant_review';

export interface MoPatient {
  patientId: string;
  name?: string;
  group: MoPatientGroup;
  ward?: string;
  status: 'active' | 'discharged' | 'transferred';
  assignedAt: number;
}

// ── AI clinical wall ───────────────────────────────────────────────────────────

export interface AiClinicalWall {
  patientId: string;
  chiefComplaint: string;
  timeline: string[];
  problemList: string[];
  differentials: { diagnosis: string; evidencePercent: number }[];
  evidence: string[];
  investigations: string[];
  interpretation: string;
  treatment: string[];
  expectedProgress: string[];
  dischargeReadiness: string[];
  generatedAt: number;
}

// ── Clinical reasoning assistant (transparent, no black-box AI) ────────────────

export interface ReasoningAssistant {
  patientId: string;
  presentation: string;
  lifeThreateningCauses: { cause: string; action: string }[];
  otherDifferentials: string[];
  supportingEvidence: string[];
  contradictingEvidence: string[];
  recommendedTests: string[];
  managementPathways: string[];
  generatedAt: number;
}

// ── Admission engine ───────────────────────────────────────────────────────────

export interface MoAdmission {
  id: string;
  patientId: string;
  arrival: string;
  history: string;
  examination: string;
  problemList: string[];
  differentials: string[];
  orders: string[];
  riskScores: { name: string; score: number }[];
  workingDiagnosis: string;
  disposition: string;
  consultNeeded?: string;
  admittedAt: number;
}

// ── Emergency engine ───────────────────────────────────────────────────────────

export interface EmergencyAction {
  id: string;
  patientId: string;
  abcde: string;
  redFlags: string[];
  immediateInterventions: string[];
  protocols: string[];
  drugCalculator: string;
  shockClassification: string;
  transferPathway: string;
  consultantEscalation: string;
  at: number;
}

// ── Ward round engine ──────────────────────────────────────────────────────────

export interface MoWardRound {
  id: string;
  patientId: string;
  dailyReview: string;
  problemUpdates: string[];
  medicationReview: string[];
  fluidReview: string;
  laboratoryReview: string[];
  imagingReview: string[];
  disposition: string;
  consultantEscalation?: string;
  generated: { progressNote: string; orders: string[]; nursingTasks: string[]; followUpPlans: string[] };
  date: number;
}

// ── Outpatient clinic engine ───────────────────────────────────────────────────

export interface OutpatientClinic {
  id: string;
  name: string;
  todayAppointments: number;
  waitingPatients: number;
  followUps: number;
  preventiveCareReminders: number;
  missedAppointments: number;
  investigationsPending: number;
  referralTracking: number;
  patientEducation: number;
}

// ── Procedure engine ───────────────────────────────────────────────────────────

export type MoProcedureName =
  | 'chest_drain' | 'lumbar_puncture' | 'central_line' | 'arterial_line'
  | 'ascitic_tap' | 'pleural_tap' | 'debridement' | 'incision_drainage'
  | 'casting' | 'minor_surgery';

export const APPROVED_MO_PROCEDURES: readonly MoProcedureName[] = [
  'chest_drain', 'lumbar_puncture', 'central_line', 'arterial_line',
  'ascitic_tap', 'pleural_tap', 'debridement', 'incision_drainage',
  'casting', 'minor_surgery',
];

export interface MoProcedure {
  id: string;
  patientId?: string;
  procedureName: MoProcedureName;
  supervisorId?: AmxUid;
  outcome: string;
  complications: string[];
  learning: string;
  images: string[];
  consentObtained: boolean;
  date: number;
}

// ── Documentation engine ───────────────────────────────────────────────────────

export type MoNoteKind =
  | 'admission_note' | 'progress_note' | 'referral_letter' | 'death_summary'
  | 'discharge_summary' | 'procedure_note' | 'clinic_note' | 'referral_response';

export interface MoDocumentation {
  id: string;
  kind: MoNoteKind;
  patientId: string;
  content: string;
  qualityScore: number;
  suggestions: string[];
  createdAt: number;
}

// ── Investigation engine (nothing gets lost) ───────────────────────────────────

export type InvestigationStage =
  | 'pending' | 'collected' | 'processing' | 'reported' | 'abnormal' | 'critical' | 'action_required' | 'acknowledged';

export const INVESTIGATION_FLOW: readonly InvestigationStage[] = [
  'pending', 'collected', 'processing', 'reported', 'abnormal', 'critical', 'action_required', 'acknowledged',
];

export interface InvestigationTrack {
  id: string;
  patientId: string;
  test: string;
  stage: InvestigationStage;
  result?: string;
  updatedAt: number;
}

// ── Medication engine (automatic safety checks) ────────────────────────────────

export interface MedicationCheckResult {
  medication: string;
  patientId: string;
  drugInteractions: string[];
  renalDosingWarning?: string;
  liverDosingWarning?: string;
  pregnancySafety?: string;
  allergyAlert?: string;
  duplicationAlert?: string;
  monitoringRequired: string[];
  antibioticStewardshipNote?: string;
  safe: boolean;
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  checks: MedicationCheckResult;
  prescribedBy: AmxUid;
  prescribedAt: number;
  status: 'active' | 'held' | 'stopped' | 'completed';
}

// ── Consultant escalation engine (no unnecessary phone calls) ─────────────────

export type EscalationUrgency = 'routine' | 'urgent' | 'emergency';

export interface ConsultantEscalation {
  id: string;
  patientId: string;
  consultantId: AmxUid;
  clinicalSummary: string;
  vitalSigns: string[];
  investigations: string[];
  aiInterpretation: string;
  questionsNeedingInput: string[];
  urgency: EscalationUrgency;
  expectedResponseTimeMin: number;
  status: 'sent' | 'acknowledged' | 'responded' | 'closed';
  sentAt: number;
  respondedAt?: number;
}

// ── Referral engine (every referral is traceable) ──────────────────────────────

export type ReferralTarget =
  | 'radiology' | 'laboratory' | 'surgery' | 'medicine' | 'icu' | 'external';

export interface ReferralRecord {
  id: string;
  patientId: string;
  target: ReferralTarget;
  toDepartment?: string;
  reason: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'closed';
  feedback?: string;
  createdAt: number;
  updatedAt: number;
}

// ── Teaching responsibilities ──────────────────────────────────────────────────

export type MoTeachingKind = 'bedside' | 'case_discussion' | 'mini_cex' | 'cbd' | 'skill_demonstration' | 'session';

export interface MoTeachingRecord {
  id: string;
  kind: MoTeachingKind;
  topic: string;
  learnerId: AmxUid;
  attendance: number;
  feedback?: string;
  at: number;
}

// ── Personal learning (patient-driven) ─────────────────────────────────────────

export interface LearningSuggestion {
  id: string;
  topic: string;
  triggeredBy: string;
  content: { guidelines: string[]; teachingVideos: string[]; protocols: string[]; recentPapers: string[]; examPearls: string[] };
  createdAt: number;
}

// ── Personal analytics ─────────────────────────────────────────────────────────

export interface MoBenchmarkValue { self: number; department: number; hospital: number; national: number }

export interface MoAnalytics {
  admissions: MoBenchmarkValue;
  mortality: MoBenchmarkValue;
  readmissions: MoBenchmarkValue;
  documentation: MoBenchmarkValue;
  clinicEfficiency: MoBenchmarkValue;
  procedureNumbers: MoBenchmarkValue;
  consultantFeedback: MoBenchmarkValue;
  patientSatisfaction: MoBenchmarkValue;
  clinicalReasoningScore: MoBenchmarkValue;
}

// ── Communication (secure messaging only) ─────────────────────────────────────

export type MoAudience =
  | 'consultants' | 'residents' | 'interns' | 'nurses' | 'laboratory'
  | 'radiology' | 'pharmacy' | 'emergency_teams' | 'patients_secure';

export interface MoCommunication {
  id: string;
  audience: MoAudience;
  patientId?: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── Quality engine ─────────────────────────────────────────────────────────────

export type QualityContributionKind =
  | 'audit' | 'incident_reporting' | 'mortality_review' | 'near_miss'
  | 'quality_improvement' | 'patient_safety';

export interface QualityContribution {
  id: string;
  kind: QualityContributionKind;
  title: string;
  description: string;
  submittedBy: AmxUid;
  submittedAt: number;
  status: 'submitted' | 'reviewed' | 'actioned';
}

// ── Research engine ────────────────────────────────────────────────────────────

export type MoResearchStage =
  | 'recruit_patients' | 'collect_data' | 'analyze_cases' | 'write_manuscript'
  | 'join_registry' | 'present_conference' | 'collaborate_international';

export interface MoResearch {
  id: string;
  title: string;
  stage: MoResearchStage;
  status: 'active' | 'completed';
  startedAt: number;
}

// ── Duty engine ────────────────────────────────────────────────────────────────

export interface DutySnapshot {
  id: string;
  date: number;
  currentShift: string;
  nightDuties: number;
  emergencyCoverage: boolean;
  backupConsultant?: string;
  dutyTeam: string[];
  availableBeds: number;
  bloodAvailability: boolean;
  icuCapacity: number;
  radiologyAvailability: boolean;
}

// ── HMIS / EMR responsibilities ────────────────────────────────────────────────

export interface MoHmisDuties {
  admissions: boolean;
  wardManagement: boolean;
  clinicScheduling: boolean;
  procedureBooking: boolean;
  bedRequests: boolean;
  referrals: boolean;
  dischargePlanning: boolean;
  taskManagement: boolean;
}

export type MoEmrKind =
  | 'admission_clerking' | 'progress_note' | 'procedure_note' | 'clinic_documentation'
  | 'discharge_summary' | 'referral_letter' | 'patient_education_record';

export interface MoEmrNote {
  id: string;
  kind: MoEmrKind;
  patientId: string;
  qualityScore: number;
  suggestions: string[];
  createdAt: number;
}

// ── AI companion (active educational support) ─────────────────────────────────

export interface AiCompanionAdvice {
  id: string;
  patientId: string;
  differentialReasoning: string[];
  missingHistoryQuestions: string[];
  missedExaminationFindings: string[];
  guidelineRecommendations: string[];
  localHospitalProtocol?: string;
  nationalProtocol?: string;
  internationalGuidelineComparison: string[];
  riskCalculators: string[];
  drugDosing?: string;
  dischargeCriteria: string[];
  followUpRecommendations: string[];
  generatedAt: number;
}

// ── Wellness engine ────────────────────────────────────────────────────────────

export interface MoWellness {
  id: string;
  week: number;
  dutyHours: number;
  patientLoad: number;
  nightShifts: number;
  criticalCases: number;
  fatigueScore: number;
  burnoutIndicator: number;
  restRecommendation: string;
  leaveBalanceDays: number;
  recordedAt: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface MedicalOfficerModel {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  officerId: AmxUid;
  workload: MoWorkload;
  patients: MoPatient[];
  clinicalWalls: AiClinicalWall[];
  reasoning: ReasoningAssistant[];
  admissions: MoAdmission[];
  emergencies: EmergencyAction[];
  wardRounds: MoWardRound[];
  clinics: OutpatientClinic[];
  procedures: MoProcedure[];
  documentation: MoDocumentation[];
  investigations: InvestigationTrack[];
  medications: MedicationOrder[];
  escalations: ConsultantEscalation[];
  referrals: ReferralRecord[];
  teaching: MoTeachingRecord[];
  learning: LearningSuggestion[];
  topicExposure: Record<string, number>;
  analytics: MoAnalytics;
  communications: MoCommunication[];
  quality: QualityContribution[];
  research: MoResearch[];
  dutySnapshots: DutySnapshot[];
  hmis: MoHmisDuties;
  emrNotes: MoEmrNote[];
  aiAdvice: AiCompanionAdvice[];
  wellness: MoWellness[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateMedicalOfficerModelInput {
  organizationId: string;
  facilityId?: string;
  medicalDirectorId?: AmxUid;
  departmentHeadId?: AmxUid;
  consultantId?: AmxUid;
  residentId?: AmxUid;
  departmentId: string;
  specialty: MedicalSpecialty;
  officerId: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const ZERO_BENCHMARK: MoBenchmarkValue = { self: 0, department: 0, hospital: 0, national: 0 };

// ── Constitutional authority / restriction tables ──────────────────────────────

export const MEDICAL_OFFICER_AUTHORITY: readonly string[] = [
  'admit_patients', 'diagnose_common_conditions', 'request_investigations', 'prescribe_medications',
  'perform_approved_procedures', 'discharge_appropriate_patients', 'refer_patients',
  'escalate_emergencies', 'supervise_interns', 'teach_students', 'lead_routine_ward_rounds', 'document_care',
];

export const MEDICAL_OFFICER_RESTRICTIONS: readonly string[] = [
  'modify_hospital_protocols', 'change_constitutional_rules', 'manage_departments',
  'approve_consultant_only_procedures', 'override_patient_consent', 'access_unrelated_departmental_data',
  'delete_audit_records', 'modify_enterprise_permissions',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class MedicalOfficerEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateMedicalOfficerModelInput): MedicalOfficerModel {
    if (!input.organizationId) throw new Error('[MOE] organizationId is required');
    if (!input.officerId) throw new Error('[MOE] officerId is required');
    if (!input.departmentId) throw new Error('[MOE] departmentId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      medicalDirectorId: input.medicalDirectorId,
      departmentHeadId: input.departmentHeadId,
      consultantId: input.consultantId,
      residentId: input.residentId,
      departmentId: input.departmentId,
      specialty: input.specialty,
      officerId: input.officerId,
      workload: { admissions: 0, wardPatients: 0, opdPatients: 0, emergencyCases: 0, referrals: 0, discharges: 0, followUps: 0 },
      patients: [],
      clinicalWalls: [],
      reasoning: [],
      admissions: [],
      emergencies: [],
      wardRounds: [],
      clinics: [],
      procedures: [],
      documentation: [],
      investigations: [],
      medications: [],
      escalations: [],
      referrals: [],
      teaching: [],
      learning: [],
      topicExposure: {},
      analytics: {
        admissions: { ...ZERO_BENCHMARK },
        mortality: { ...ZERO_BENCHMARK },
        readmissions: { ...ZERO_BENCHMARK },
        documentation: { ...ZERO_BENCHMARK },
        clinicEfficiency: { ...ZERO_BENCHMARK },
        procedureNumbers: { ...ZERO_BENCHMARK },
        consultantFeedback: { ...ZERO_BENCHMARK },
        patientSatisfaction: { ...ZERO_BENCHMARK },
        clinicalReasoningScore: { ...ZERO_BENCHMARK },
      },
      communications: [],
      quality: [],
      research: [],
      dutySnapshots: [],
      hmis: {
        admissions: false, wardManagement: false, clinicScheduling: false, procedureBooking: false,
        bedRequests: false, referrals: false, dischargePlanning: false, taskManagement: false,
      },
      emrNotes: [],
      aiAdvice: [],
      wellness: [],
      auditLog: [{ at: now, actorId: input.officerId, action: 'medical_officer_registered' }],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static assertOfficer(model: MedicalOfficerModel, actorId: AmxUid): void {
    if (actorId !== model.officerId) throw new Error('[MOE] Only the Medical Officer may perform this action');
  }

  static canOfficerPerform(action: string): { allowed: boolean; reason?: string } {
    if (MEDICAL_OFFICER_AUTHORITY.includes(action)) return { allowed: true };
    if (MEDICAL_OFFICER_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        modify_hospital_protocols: 'Hospital protocols are governed at department and facility level.',
        change_constitutional_rules: 'Constitutional rules may not be changed.',
        manage_departments: 'Department management is Department Head authority.',
        approve_consultant_only_procedures: 'Consultant-only procedures require Consultant approval.',
        override_patient_consent: 'Patient consent may not be overridden.',
        access_unrelated_departmental_data: 'Unrelated departmental data is outside scope.',
        delete_audit_records: 'Audit records are append-only and may never be deleted.',
        modify_enterprise_permissions: 'Enterprise permissions may not be modified.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Medical Officer authority.` };
  }

  static guard(model: MedicalOfficerModel, actorId: AmxUid, action: string): void {
    MedicalOfficerEngine.assertOfficer(model, actorId);
    const verdict = MedicalOfficerEngine.canOfficerPerform(action);
    if (!verdict.allowed) throw new Error(`[MOE] ${verdict.reason}`);
  }

  static audit(model: MedicalOfficerModel, actorId: AmxUid, action: string, detail?: string): MedicalOfficerModel {
    const now = Date.now();
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId, action, detail }], updatedAt: now };
  }

  // ── Today's clinical work ────────────────────────────────────────────────────

  static updateWorkload(model: MedicalOfficerModel, actorId: AmxUid, patch: Partial<MoWorkload>): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const workload = { ...model.workload, ...patch };
    return { ...MedicalOfficerEngine.audit(model, actorId, 'workload_updated'), workload, updatedAt: Date.now() };
  }

  static getTodayWork(model: MedicalOfficerModel): MoWorkload {
    return { ...model.workload };
  }

  // ── My patients ──────────────────────────────────────────────────────────────

  static assignPatient(model: MedicalOfficerModel, actorId: AmxUid, patient: Omit<MoPatient, 'assignedAt' | 'status'>): { model: MedicalOfficerModel; patient: MoPatient } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const created: MoPatient = { ...patient, status: 'active', assignedAt: Date.now() };
    const patients = [...model.patients.filter(p => p.patientId !== created.patientId), created];
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'patient_assigned', created.patientId), patients, updatedAt: Date.now() }, patient: created };
  }

  static getMyPatients(model: MedicalOfficerModel, group?: MoPatientGroup): MoPatient[] {
    const priority: Record<MoPatientGroup, number> = {
      critical: 0, new_admission: 1, review: 2, awaiting_consultant_review: 3,
      awaiting_investigations: 4, stable: 5, discharge_candidate: 6,
    };
    const list = [...model.patients].filter(p => p.status === 'active').sort((a, b) => priority[a.group] - priority[b.group]);
    return group ? list.filter(p => p.group === group) : list;
  }

  static getCriticalPatients(model: MedicalOfficerModel): MoPatient[] {
    return model.patients.filter(p => p.group === 'critical' && p.status === 'active');
  }

  static getDischargeCandidates(model: MedicalOfficerModel): MoPatient[] {
    return model.patients.filter(p => p.group === 'discharge_candidate' && p.status === 'active');
  }

  // ── AI clinical wall ─────────────────────────────────────────────────────────

  static generateClinicalWall(model: MedicalOfficerModel, input: Omit<AiClinicalWall, 'generatedAt'>): { model: MedicalOfficerModel; wall: AiClinicalWall } {
    const wall: AiClinicalWall = { ...input, generatedAt: Date.now() };
    const clinicalWalls = [...model.clinicalWalls.filter(c => c.patientId !== input.patientId), wall];
    return { model: { ...model, clinicalWalls, updatedAt: Date.now() }, wall };
  }

  static getClinicalWall(model: MedicalOfficerModel, patientId: string): AiClinicalWall | undefined {
    return model.clinicalWalls.find(c => c.patientId === patientId);
  }

  // ── Clinical reasoning assistant ─────────────────────────────────────────────

  static generateReasoning(model: MedicalOfficerModel, input: Omit<ReasoningAssistant, 'generatedAt'>): { model: MedicalOfficerModel; reasoning: ReasoningAssistant } {
    const reasoning: ReasoningAssistant = { ...input, generatedAt: Date.now() };
    const updated = [...model.reasoning.filter(r => r.patientId !== input.patientId), reasoning];
    return { model: { ...model, reasoning: updated, updatedAt: Date.now() }, reasoning };
  }

  /** Transparent structured reasoning for a presentation (e.g. chest pain). */
  static reasoningForPresentation(presentation: string): { lifeThreateningCauses: { cause: string; action: string }[]; otherDifferentials: string[] } {
    const p = presentation.toLowerCase();
    if (p.includes('chest pain') || p.includes('chest')) {
      return {
        lifeThreateningCauses: [
          { cause: 'Acute Coronary Syndrome (ACS)', action: 'ECG, troponin, aspirin, oxygen if hypoxic' },
          { cause: 'Pulmonary Embolism (PE)', action: 'D-dimer / CTPA, anticoagulation if confirmed' },
          { cause: 'Aortic Dissection', action: 'BP control, urgent imaging, surgical referral' },
          { cause: 'Tension Pneumothorax', action: 'Immediate decompression' },
          { cause: 'Cardiac Tamponade', action: 'Urgent echocardiography, drainage' },
        ],
        otherDifferentials: ['Gastro-oesophageal reflux', 'Musculoskeletal pain', 'Pericarditis', 'Pneumonia', 'Anxiety'],
      };
    }
    return {
      lifeThreateningCauses: [],
      otherDifferentials: [],
    };
  }

  // ── Admission engine ─────────────────────────────────────────────────────────

  static conductAdmission(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoAdmission, 'id' | 'admittedAt'>): { model: MedicalOfficerModel; admission: MoAdmission } {
    MedicalOfficerEngine.guard(model, actorId, 'admit_patients');
    const now = Date.now();
    const admission: MoAdmission = { ...input, id: nextId('adm'), admittedAt: now };
    return {
      model: {
        ...MedicalOfficerEngine.audit(model, actorId, 'admission_conducted', input.patientId),
        admissions: [...model.admissions, admission],
        workload: { ...model.workload, admissions: model.workload.admissions + 1, wardPatients: model.workload.wardPatients + 1 },
        updatedAt: now,
      },
      admission,
    };
  }

  // ── Emergency engine ─────────────────────────────────────────────────────────

  static recordEmergencyAction(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<EmergencyAction, 'id' | 'at'>): { model: MedicalOfficerModel; action: EmergencyAction } {
    MedicalOfficerEngine.guard(model, actorId, 'escalate_emergencies');
    const action: EmergencyAction = { ...input, id: nextId('emg'), at: Date.now() };
    return {
      model: {
        ...MedicalOfficerEngine.audit(model, actorId, 'emergency_action_recorded', input.patientId),
        emergencies: [...model.emergencies, action],
        workload: { ...model.workload, emergencyCases: model.workload.emergencyCases + 1 },
        updatedAt: Date.now(),
      },
      action,
    };
  }

  // ── Ward round engine ────────────────────────────────────────────────────────

  static conductWardRound(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoWardRound, 'id' | 'date' | 'generated'>): { model: MedicalOfficerModel; wardRound: MoWardRound } {
    MedicalOfficerEngine.guard(model, actorId, 'lead_routine_ward_rounds');
    const now = Date.now();
    const wardRound: MoWardRound = {
      ...input,
      id: nextId('wr'),
      date: now,
      generated: {
        progressNote: `Daily review ${input.patientId} — ${input.dailyReview}`,
        orders: input.problemUpdates,
        nursingTasks: input.fluidReview ? ['Monitor fluid balance'] : [],
        followUpPlans: [input.disposition],
      },
    };
    return {
      model: {
        ...MedicalOfficerEngine.audit(model, actorId, 'ward_round_conducted', input.patientId),
        wardRounds: [...model.wardRounds, wardRound],
        updatedAt: now,
      },
      wardRound,
    };
  }

  // ── Outpatient clinic engine ─────────────────────────────────────────────────

  static upsertClinic(model: MedicalOfficerModel, actorId: AmxUid, input: OutpatientClinic): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const clinics = [...model.clinics.filter(c => c.id !== input.id), input];
    return { ...MedicalOfficerEngine.audit(model, actorId, 'clinic_updated', input.name), clinics, updatedAt: Date.now() };
  }

  static getClinicBacklog(model: MedicalOfficerModel): number {
    return model.clinics.reduce((a, c) => a + c.waitingPatients + c.missedAppointments + c.investigationsPending, 0);
  }

  // ── Procedure engine ─────────────────────────────────────────────────────────

  static performProcedure(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoProcedure, 'id' | 'date'>): { model: MedicalOfficerModel; procedure: MoProcedure } {
    MedicalOfficerEngine.guard(model, actorId, 'perform_approved_procedures');
    if (!APPROVED_MO_PROCEDURES.includes(input.procedureName)) {
      throw new Error(`[MOE] Procedure "${input.procedureName}" is not approved for Medical Officers`);
    }
    if (!input.consentObtained) throw new Error('[MOE] Procedure requires documented consent');
    const procedure: MoProcedure = { ...input, id: nextId('proc'), date: Date.now() };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'procedure_performed', input.procedureName), procedures: [...model.procedures, procedure], updatedAt: Date.now() }, procedure };
  }

  static getProcedureLog(model: MedicalOfficerModel): MoProcedure[] {
    return [...model.procedures];
  }

  // ── Documentation engine ─────────────────────────────────────────────────────

  static createDocumentation(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoDocumentation, 'id' | 'qualityScore' | 'suggestions' | 'createdAt'>): { model: MedicalOfficerModel; document: MoDocumentation } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const now = Date.now();
    const qualityScore = MedicalOfficerEngine.evaluateDocumentationQuality(input.kind, input.content);
    const document: MoDocumentation = { ...input, id: nextId('doc'), qualityScore, suggestions: MedicalOfficerEngine.documentationSuggestions(input.kind, qualityScore), createdAt: now };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'documentation_created', input.kind), documentation: [...model.documentation, document], updatedAt: now }, document };
  }

  static evaluateDocumentationQuality(kind: MoNoteKind, content: string): number {
    const base: Record<MoNoteKind, number> = {
      admission_note: 82, progress_note: 80, referral_letter: 85, death_summary: 88,
      discharge_summary: 86, procedure_note: 85, clinic_note: 81, referral_response: 84,
    };
    let score = base[kind];
    if (content.split(/\s+/).length < 20) score = Math.max(0, score - 15);
    if (content.toLowerCase().includes('allergy')) score = Math.min(100, score + 3);
    return score;
  }

  static documentationSuggestions(kind: MoNoteKind, score: number): string[] {
    const suggestions: string[] = [];
    if (kind === 'discharge_summary') suggestions.push('Include discharge medications and follow-up date');
    if (kind === 'admission_note') suggestions.push('Document allergies, vitals, and risk scores');
    if (kind === 'death_summary') suggestions.push('Include cause of death and death review pathway');
    if (kind === 'procedure_note') suggestions.push('Confirm consent and post-procedure observations');
    if (score < 80) suggestions.push('Complete all required fields for structured documentation');
    return suggestions;
  }

  static getDocumentationQuality(model: MedicalOfficerModel): { averageScore: number; count: number } {
    const docs = model.documentation;
    const averageScore = docs.length ? Math.round(docs.reduce((a, d) => a + d.qualityScore, 0) / docs.length) : 0;
    return { averageScore, count: docs.length };
  }

  // ── Investigation engine (nothing gets lost) ─────────────────────────────────

  static trackInvestigation(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<InvestigationTrack, 'id' | 'stage' | 'updatedAt'>): { model: MedicalOfficerModel; track: InvestigationTrack } {
    MedicalOfficerEngine.guard(model, actorId, 'request_investigations');
    const track: InvestigationTrack = { ...input, id: nextId('inv'), stage: 'pending', updatedAt: Date.now() };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'investigation_tracked', input.test), investigations: [...model.investigations, track], updatedAt: Date.now() }, track };
  }

  static advanceInvestigation(model: MedicalOfficerModel, actorId: AmxUid, trackId: string, stage: InvestigationStage, result?: string): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'request_investigations');
    const investigations = model.investigations.map(t => t.id === trackId ? { ...t, stage, result: result ?? t.result, updatedAt: Date.now() } : t);
    return { ...MedicalOfficerEngine.audit(model, actorId, 'investigation_advanced', `${trackId} → ${stage}`), investigations, updatedAt: Date.now() };
  }

  static getActionRequiredInvestigations(model: MedicalOfficerModel): InvestigationTrack[] {
    return model.investigations.filter(t => t.stage === 'abnormal' || t.stage === 'critical' || t.stage === 'action_required');
  }

  static getPendingInvestigations(model: MedicalOfficerModel): InvestigationTrack[] {
    return model.investigations.filter(t => t.stage === 'pending' || t.stage === 'collected' || t.stage === 'processing');
  }

  // ── Medication engine (automatic safety checks) ──────────────────────────────

  static checkMedication(model: MedicalOfficerModel, input: {
    medication: string;
    patientId: string;
    allergies?: string[];
    renalFunctionMlMin?: number;
    liverDisease?: boolean;
    pregnant?: boolean;
    existingMedications?: string[];
    antibiotic?: boolean;
  }): MedicationCheckResult {
    const result: MedicationCheckResult = {
      medication: input.medication,
      patientId: input.patientId,
      drugInteractions: [],
      monitoringRequired: [],
      safe: true,
    };
    const name = input.medication.toLowerCase();
    if (input.allergies?.some(a => name.includes(a.toLowerCase()) || a.toLowerCase().includes(name))) {
      result.allergyAlert = `Allergy match detected for ${input.medication}`;
      result.safe = false;
    }
    if (input.existingMedications?.some(m => m.toLowerCase() === name)) {
      result.duplicationAlert = `${input.medication} already prescribed`;
      result.safe = false;
    }
    const renalAware = ['gentamicin', 'enoxaparin', 'vancomycin', 'digoxin', 'metformin', 'ibuprofen'];
    if (input.renalFunctionMlMin !== undefined && renalAware.some(d => name.includes(d))) {
      result.renalDosingWarning = `${input.medication} requires renal dose adjustment (eGFR ${input.renalFunctionMlMin})`;
    }
    if (input.liverDisease && ['paracetamol', 'warfarin', 'rifampicin'].some(d => name.includes(d))) {
      result.liverDosingWarning = `${input.medication} requires hepatic monitoring`;
    }
    if (input.pregnant && ['lisinopril', 'losartan', 'warfarin', 'methotrexate', 'misoprostol'].some(d => name.includes(d))) {
      result.pregnancySafety = `${input.medication} contraindicated in pregnancy`;
      result.safe = false;
    }
    if (name.includes('gentamicin') || name.includes('vancomycin')) result.monitoringRequired.push('Trough level');
    if (name.includes('warfarin')) result.monitoringRequired.push('INR');
    if (name.includes('digoxin')) result.monitoringRequired.push('Digoxin level');
    if (name.includes('metformin')) result.monitoringRequired.push('Renal function');
    if (input.antibiotic && (name.includes('meropenem') || name.includes('piperacillin'))) {
      result.antibioticStewardshipNote = 'Broad-spectrum — review after 48 hours per stewardship policy';
    }
    return result;
  }

  static prescribeMedication(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MedicationOrder, 'id' | 'checks' | 'prescribedBy' | 'prescribedAt' | 'status'>, patientAllergies?: string[], existingMedications?: string[], renalMlMin?: number, pregnant?: boolean, antibiotic?: boolean): { model: MedicalOfficerModel; order: MedicationOrder } {
    MedicalOfficerEngine.guard(model, actorId, 'prescribe_medications');
    const checks = MedicalOfficerEngine.checkMedication(model, {
      medication: input.medication, patientId: input.patientId,
      allergies: patientAllergies, renalFunctionMlMin: renalMlMin, pregnant,
      existingMedications, antibiotic,
    });
    if (!checks.safe) throw new Error(`[MOE] Medication order blocked: ${checks.allergyAlert ?? checks.duplicationAlert ?? checks.pregnancySafety}`);
    const order: MedicationOrder = { ...input, id: nextId('med'), checks, prescribedBy: actorId, prescribedAt: Date.now(), status: 'active' };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'medication_prescribed', input.medication), medications: [...model.medications, order], updatedAt: Date.now() }, order };
  }

  static getMedicationWarnings(model: MedicalOfficerModel): MedicationOrder[] {
    return model.medications.filter(m => m.status === 'active' && !m.checks.safe);
  }

  // ── Consultant escalation engine (no unnecessary phone calls) ────────────────

  static requestConsultant(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<ConsultantEscalation, 'id' | 'status' | 'sentAt'>): { model: MedicalOfficerModel; escalation: ConsultantEscalation } {
    MedicalOfficerEngine.guard(model, actorId, 'escalate_emergencies');
    const now = Date.now();
    const expectedResponseTimeMin = input.urgency === 'emergency' ? 5 : input.urgency === 'urgent' ? 30 : 240;
    const escalation: ConsultantEscalation = { ...input, id: nextId('esc'), status: 'sent', sentAt: now, expectedResponseTimeMin };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'consultant_requested', input.patientId), escalations: [...model.escalations, escalation], updatedAt: now }, escalation };
  }

  static markEscalationResponded(model: MedicalOfficerModel, actorId: AmxUid, escalationId: string): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'escalate_emergencies');
    const now = Date.now();
    const escalations = model.escalations.map(e => e.id === escalationId ? { ...e, status: 'responded' as const, respondedAt: now } : e);
    return { ...MedicalOfficerEngine.audit(model, actorId, 'escalation_responded', escalationId), escalations, updatedAt: now };
  }

  static getOpenEscalations(model: MedicalOfficerModel): ConsultantEscalation[] {
    return model.escalations.filter(e => e.status !== 'closed');
  }

  // ── Referral engine (every referral is traceable) ────────────────────────────

  static createReferral(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<ReferralRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>): { model: MedicalOfficerModel; referral: ReferralRecord } {
    MedicalOfficerEngine.guard(model, actorId, 'refer_patients');
    const now = Date.now();
    const referral: ReferralRecord = { ...input, id: nextId('ref'), status: 'pending', createdAt: now, updatedAt: now };
    return {
      model: {
        ...MedicalOfficerEngine.audit(model, actorId, 'referral_created', input.target),
        referrals: [...model.referrals, referral],
        workload: { ...model.workload, referrals: model.workload.referrals + 1 },
        updatedAt: now,
      },
      referral,
    };
  }

  static updateReferralStatus(model: MedicalOfficerModel, actorId: AmxUid, referralId: string, status: ReferralRecord['status'], feedback?: string): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'refer_patients');
    const referrals = model.referrals.map(r => r.id === referralId ? { ...r, status, feedback: feedback ?? r.feedback, updatedAt: Date.now() } : r);
    return { ...MedicalOfficerEngine.audit(model, actorId, 'referral_updated', `${referralId} → ${status}`), referrals, updatedAt: Date.now() };
  }

  static getPendingReferrals(model: MedicalOfficerModel): ReferralRecord[] {
    return model.referrals.filter(r => r.status === 'pending');
  }

  // ── Teaching responsibilities ────────────────────────────────────────────────

  static recordTeaching(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoTeachingRecord, 'id' | 'at'>): { model: MedicalOfficerModel; record: MoTeachingRecord } {
    MedicalOfficerEngine.guard(model, actorId, 'teach_students');
    const record: MoTeachingRecord = { ...input, id: nextId('tea'), at: Date.now() };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'teaching_recorded', input.topic), teaching: [...model.teaching, record], updatedAt: Date.now() }, record };
  }

  static getTeachingSummary(model: MedicalOfficerModel): { sessions: number; attendance: number; feedback: number } {
    return {
      sessions: model.teaching.length,
      attendance: model.teaching.reduce((a, t) => a + t.attendance, 0),
      feedback: model.teaching.filter(t => t.feedback).length,
    };
  }

  // ── Personal learning (patient-driven) ───────────────────────────────────────

  static suggestLearning(model: MedicalOfficerModel, input: Omit<LearningSuggestion, 'id' | 'createdAt'>): { model: MedicalOfficerModel; suggestion: LearningSuggestion } {
    const suggestion: LearningSuggestion = { ...input, id: nextId('lrn'), createdAt: Date.now() };
    return { model: { ...model, learning: [...model.learning, suggestion], updatedAt: Date.now() }, suggestion };
  }

  static recordTopicExposure(model: MedicalOfficerModel, actorId: AmxUid, topic: string, threshold: number, builder: (topic: string) => Omit<LearningSuggestion, 'id' | 'createdAt' | 'triggeredBy'>): { model: MedicalOfficerModel; triggered: boolean } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const current = (model.topicExposure[topic] ?? 0) + 1;
    const topicExposure = { ...model.topicExposure, [topic]: current };
    if (current >= threshold) {
      const suggestion = MedicalOfficerEngine.suggestLearning(model, { ...builder(topic), triggeredBy: `${current} ${topic} patients seen` });
      return { model: { ...suggestion.model, topicExposure }, triggered: true };
    }
    return { model: { ...model, topicExposure, updatedAt: Date.now() }, triggered: false };
  }

  static getLearningSuggestions(model: MedicalOfficerModel): LearningSuggestion[] {
    return [...model.learning];
  }

  // ── Personal analytics ───────────────────────────────────────────────────────

  static updateAnalytics(model: MedicalOfficerModel, actorId: AmxUid, patch: Partial<MoAnalytics>): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const analytics = { ...model.analytics, ...patch };
    return { ...MedicalOfficerEngine.audit(model, actorId, 'analytics_updated'), analytics, updatedAt: Date.now() };
  }

  static getAnalytics(model: MedicalOfficerModel): MoAnalytics {
    return { ...model.analytics };
  }

  // ── Communication (secure messaging only) ───────────────────────────────────

  static sendCommunication(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: MedicalOfficerModel; communication: MoCommunication } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const communication: MoCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'communication_published', input.title), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  // ── Quality engine ───────────────────────────────────────────────────────────

  static submitQualityContribution(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<QualityContribution, 'id' | 'submittedBy' | 'submittedAt' | 'status'>): { model: MedicalOfficerModel; contribution: QualityContribution } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const contribution: QualityContribution = { ...input, id: nextId('qlty'), submittedBy: actorId, submittedAt: Date.now(), status: 'submitted' };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'quality_contribution', input.kind), quality: [...model.quality, contribution], updatedAt: Date.now() }, contribution };
  }

  static getQualityContributions(model: MedicalOfficerModel): QualityContribution[] {
    return [...model.quality];
  }

  // ── Research engine ──────────────────────────────────────────────────────────

  static registerResearch(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoResearch, 'id' | 'status' | 'startedAt'>): { model: MedicalOfficerModel; research: MoResearch } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const activity: MoResearch = { ...input, id: nextId('rsc'), status: 'active', startedAt: Date.now() };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'research_registered', input.title), research: [...model.research, activity], updatedAt: Date.now() }, research: activity };
  }

  static getResearch(model: MedicalOfficerModel): MoResearch[] {
    return [...model.research];
  }

  // ── Duty engine ──────────────────────────────────────────────────────────────

  static recordDutySnapshot(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<DutySnapshot, 'id'>): { model: MedicalOfficerModel; snapshot: DutySnapshot } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const snapshot: DutySnapshot = { ...input, id: nextId('dty') };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'duty_snapshot_recorded'), dutySnapshots: [...model.dutySnapshots, snapshot], updatedAt: Date.now() }, snapshot };
  }

  static getDutyDashboard(model: MedicalOfficerModel): DutySnapshot | undefined {
    return [...model.dutySnapshots].sort((a, b) => b.date - a.date)[0];
  }

  // ── HMIS / EMR responsibilities ──────────────────────────────────────────────

  static updateHmisDuties(model: MedicalOfficerModel, actorId: AmxUid, patch: Partial<MoHmisDuties>): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const hmis = { ...model.hmis, ...patch };
    return { ...MedicalOfficerEngine.audit(model, actorId, 'hmis_duties_updated'), hmis, updatedAt: Date.now() };
  }

  static createEmrNote(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoEmrNote, 'id' | 'qualityScore' | 'suggestions' | 'createdAt'>): { model: MedicalOfficerModel; note: MoEmrNote } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const now = Date.now();
    const qualityScore = MedicalOfficerEngine.evaluateEmrQuality(input.kind);
    const note: MoEmrNote = { ...input, id: nextId('emr'), qualityScore, suggestions: MedicalOfficerEngine.emrSuggestions(input.kind), createdAt: now };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'emr_note_created', input.kind), emrNotes: [...model.emrNotes, note], updatedAt: now }, note };
  }

  static evaluateEmrQuality(kind: MoEmrKind): number {
    const base: Record<MoEmrKind, number> = {
      admission_clerking: 82, progress_note: 80, procedure_note: 86, clinic_documentation: 81,
      discharge_summary: 86, referral_letter: 84, patient_education_record: 78,
    };
    return base[kind];
  }

  static emrSuggestions(kind: MoEmrKind): string[] {
    const suggestions: string[] = [];
    if (kind === 'patient_education_record') suggestions.push('Confirm patient understanding and provide written education material');
    if (kind === 'discharge_summary') suggestions.push('Include reconciliation of medications');
    if (kind === 'admission_clerking') suggestions.push('Document social history and functional status');
    return suggestions;
  }

  static getEmrQuality(model: MedicalOfficerModel): { notes: number; averageScore: number } {
    const averageScore = model.emrNotes.length ? Math.round(model.emrNotes.reduce((a, n) => a + n.qualityScore, 0) / model.emrNotes.length) : 0;
    return { notes: model.emrNotes.length, averageScore };
  }

  // ── AI companion (active educational support) ────────────────────────────────

  static generateCompanionAdvice(model: MedicalOfficerModel, input: Omit<AiCompanionAdvice, 'id' | 'generatedAt'>): { model: MedicalOfficerModel; advice: AiCompanionAdvice } {
    const advice: AiCompanionAdvice = { ...input, id: nextId('ai'), generatedAt: Date.now() };
    return { model: { ...model, aiAdvice: [...model.aiAdvice, advice], updatedAt: Date.now() }, advice };
  }

  static getCompanionAdvice(model: MedicalOfficerModel, patientId: string): AiCompanionAdvice | undefined {
    return model.aiAdvice.find(a => a.patientId === patientId);
  }

  // ── Wellness engine ──────────────────────────────────────────────────────────

  static CONSTITUTIONAL_MO_LIMITS: Readonly<{ maxWeeklyDutyHours: number; fatigueThreshold: number; burnoutThreshold: number }> = {
    maxWeeklyDutyHours: 88,
    fatigueThreshold: 7,
    burnoutThreshold: 7,
  };

  static recordWellness(model: MedicalOfficerModel, actorId: AmxUid, input: Omit<MoWellness, 'id' | 'restRecommendation' | 'recordedAt'>): { model: MedicalOfficerModel; wellness: MoWellness } {
    MedicalOfficerEngine.guard(model, actorId, 'document_care');
    const limits = MedicalOfficerEngine.CONSTITUTIONAL_MO_LIMITS;
    const now = Date.now();
    let restRecommendation = 'Continue usual rest pattern';
    if (input.dutyHours >= limits.maxWeeklyDutyHours || input.fatigueScore >= limits.fatigueThreshold) {
      restRecommendation = 'Constitutional duty limit approaching — mandatory rest and reduce on-call load';
    } else if (input.fatigueScore >= limits.fatigueThreshold * 0.7) {
      restRecommendation = 'Increase rest hours; schedule a lighter next day';
    }
    const wellness: MoWellness = { ...input, id: nextId('wl'), restRecommendation, recordedAt: now };
    return { model: { ...MedicalOfficerEngine.audit(model, actorId, 'wellness_recorded'), wellness: [...model.wellness, wellness], updatedAt: now }, wellness };
  }

  static getWellnessAlerts(model: MedicalOfficerModel): MoWellness[] {
    const limits = MedicalOfficerEngine.CONSTITUTIONAL_MO_LIMITS;
    return model.wellness.filter(w => w.dutyHours >= limits.maxWeeklyDutyHours || w.fatigueScore >= limits.fatigueThreshold);
  }

  static getLatestWellness(model: MedicalOfficerModel): MoWellness | undefined {
    return [...model.wellness].sort((a, b) => b.recordedAt - a.recordedAt)[0];
  }

  // ── Authority actions ────────────────────────────────────────────────────────

  static diagnoseCondition(model: MedicalOfficerModel, actorId: AmxUid, patientId: string, diagnosis: string): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'diagnose_common_conditions');
    return MedicalOfficerEngine.audit(model, actorId, 'diagnosis_made', `${patientId}: ${diagnosis}`);
  }

  static dischargePatient(model: MedicalOfficerModel, actorId: AmxUid, patientId: string): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'discharge_appropriate_patients');
    const patients = model.patients.map(p => p.patientId === patientId ? { ...p, status: 'discharged' as const } : p);
    return {
      ...MedicalOfficerEngine.audit(model, actorId, 'patient_discharged', patientId),
      patients,
      workload: { ...model.workload, discharges: model.workload.discharges + 1, wardPatients: Math.max(0, model.workload.wardPatients - 1) },
      updatedAt: Date.now(),
    };
  }

  static superviseIntern(model: MedicalOfficerModel, actorId: AmxUid, internId: AmxUid, topic: string): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'supervise_interns');
    return MedicalOfficerEngine.audit(model, actorId, 'intern_supervised', `${internId}: ${topic}`);
  }

  // ── Constitutional restrictions (enforced) ───────────────────────────────────

  static modifyHospitalProtocol(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'modify_hospital_protocols');
    return model;
  }

  static changeConstitutionalRules(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'change_constitutional_rules');
    return model;
  }

  static manageDepartment(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'manage_departments');
    return model;
  }

  static approveConsultantOnlyProcedure(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'approve_consultant_only_procedures');
    return model;
  }

  static overridePatientConsent(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'override_patient_consent');
    return model;
  }

  static accessUnrelatedDepartment(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'access_unrelated_departmental_data');
    return model;
  }

  static deleteAuditRecord(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'delete_audit_records');
    return model;
  }

  static modifyEnterprisePermissions(model: MedicalOfficerModel, actorId: AmxUid): MedicalOfficerModel {
    MedicalOfficerEngine.guard(model, actorId, 'modify_enterprise_permissions');
    return model;
  }
}
