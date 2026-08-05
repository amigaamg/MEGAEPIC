// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Nursing Engine (BOOK VI-M · Constitutional Engine No. 23)
//
// "The Engine of Continuous Patient Care, Clinical Observation, Coordination,
// and Healing"
//
// Nursing is the continuous heartbeat of patient care. Doctors diagnose,
// surgeons operate, laboratories investigate, radiology images — but nurses
// never leave the patient. AMEXAN therefore treats Nursing as one of the
// largest constitutional engines in the Healthcare Operating System.
//
// Constitutional position (full hierarchy):
//   Chief Nursing Officer (CNO) → Deputy CNO → Director of Nursing Services
//     → Hospital Nursing Manager → Department Nursing Manager → Ward Nurse Manager
//     → Senior Registered Nurse → Registered Nurse → Enrolled Nurse
//     → Critical Care / Theatre / Recovery / Emergency Nurse → Midwife
//     → Community Nurse → Nurse Educator → Student Nurse
//
// The engine governs: assignment, bedside intelligence, assessment (ABCDE),
// care plans, eMAR five rights, vital signs, early warning (NEWS/MEWS/PEWS/
// obstetric/ICU), escalation, nursing tasks, wound care, pressure injury
// (Braden), falls prevention (Morse), fluid balance, SBAR handover, procedures,
// patient education, discharge, nursing analytics, workforce, student nurses,
// secure communication, HMIS/EMR responsibility, authority/restriction
// governance, and the AI nursing companion.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Nursing hierarchy ──────────────────────────────────────────────────────────

export type NursingRole =
  | 'chief_nursing_officer'
  | 'deputy_chief_nursing_officer'
  | 'director_of_nursing_services'
  | 'hospital_nursing_manager'
  | 'department_nursing_manager'
  | 'ward_nurse_manager'
  | 'senior_registered_nurse'
  | 'registered_nurse'
  | 'enrolled_nurse'
  | 'critical_care_nurse'
  | 'operating_theatre_nurse'
  | 'recovery_nurse'
  | 'emergency_nurse'
  | 'midwife'
  | 'community_nurse'
  | 'nurse_educator'
  | 'student_nurse'
  // Legacy aliases retained for backward compatibility.
  | 'director_of_nursing'
  | 'ward_in_charge'
  | 'senior_nurse';

export const NURSING_ROLE_LEVELS: Readonly<Record<NursingRole, number>> = {
  chief_nursing_officer: 14,
  deputy_chief_nursing_officer: 13,
  director_of_nursing_services: 12,
  hospital_nursing_manager: 11,
  department_nursing_manager: 10,
  ward_nurse_manager: 9,
  senior_registered_nurse: 8,
  registered_nurse: 7,
  enrolled_nurse: 6,
  critical_care_nurse: 7,
  operating_theatre_nurse: 7,
  recovery_nurse: 7,
  emergency_nurse: 7,
  midwife: 7,
  community_nurse: 6,
  nurse_educator: 8,
  student_nurse: 3,
  director_of_nursing: 12,
  ward_in_charge: 9,
  senior_nurse: 8,
};

// ── Constitutional authority / restriction tables ──────────────────────────────

export const NURSING_AUTHORITY: readonly string[] = [
  'assign_patients', 'monitor_clinical_status', 'administer_medications',
  'perform_nursing_procedures', 'manage_care_plans', 'record_observations',
  'escalate_care', 'manage_shift_operations', 'teach_students',
  'lead_nursing_quality',
];

export const NURSING_RESTRICTIONS: readonly string[] = [
  'diagnose_diseases', 'prescribe_medications',
  'override_constitutional_governance', 'modify_physician_documentation',
  'access_unrelated_patient_records', 'discharge_patients_without_physician',
];

// ── Nursing departments ────────────────────────────────────────────────────────

export type NursingDepartment =
  | 'medical' | 'surgical' | 'critical_care' | 'theatre' | 'recovery'
  | 'emergency' | 'maternity' | 'paediatrics' | 'community' | 'outpatient'
  | 'education' | 'quality_governance';

export const NURSING_DEPARTMENTS: readonly NursingDepartment[] = [
  'medical', 'surgical', 'critical_care', 'theatre', 'recovery',
  'emergency', 'maternity', 'paediatrics', 'community', 'outpatient',
  'education', 'quality_governance',
];

// ── Shift ──────────────────────────────────────────────────────────────────────

export type NursingShiftType = 'morning' | 'afternoon' | 'night' | 'weekend' | 'on_call';

export interface NursingShift {
  id: string;
  nurseId: AmxUid;
  wardId: string;
  type: NursingShiftType;
  startAt: number;
  endAt: number;
  assignedPatientIds: string[];
  highRiskPatientIds: string[];
  pendingTaskIds: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  handoverId?: string;
}

// ── Patient acuity ─────────────────────────────────────────────────────────────

export type AcuityLevel = 'critical' | 'high_dependency' | 'moderate' | 'stable' | 'discharge_ready';

export interface PatientAcuity {
  patientId: string;
  level: AcuityLevel;
  score: number;
  updatedAt: number;
  updatedBy?: AmxUid;
  notes?: string;
}

// ── Observation & deterioration ────────────────────────────────────────────────

export type EarlyWarningScoreType = 'news' | 'mews' | 'pews' | 'obstetric' | 'icu' | 'pediatric';

export interface VitalObservation {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  recordedAt: number;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  spo2?: number;
  painScore?: number;
  urineOutput?: number;
  weightKg?: number;
  gcs?: number;
}

export interface DeteriorationAlert {
  id: string;
  patientId: string;
  ewScore: number;
  scoreType: EarlyWarningScoreType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: number;
  probableCause?: string;
  recommendedActions: string[];
  notifiedMO: boolean;
  notifiedConsultant: boolean;
  notifiedICU: boolean;
  resolved: boolean;
  resolvedAt?: number;
}

// ── Medication administration ──────────────────────────────────────────────────

export type MedicationRoute =
  | 'oral' | 'iv' | 'im' | 'sc' | 'inhaled' | 'topical' | 'rectal' | 'intrathecal' | 'other';

export interface MedicationAdministrationRecord {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  medicationId: string;
  medicationName: string;
  dose: string;
  route: MedicationRoute;
  scheduledAt: number;
  administeredAt?: number;
  rightPatient: boolean;
  rightDrug: boolean;
  rightDose: boolean;
  rightRoute: boolean;
  rightTime: boolean;
  allergyChecked: boolean;
  interactionChecked: boolean;
  barcodeVerified?: boolean;
  status: 'due' | 'administered' | 'omitted' | 'refused' | 'held';
  observation?: string;
}

// ── eMAR Five Rights Engine ────────────────────────────────────────────────────

export interface FiveRightsCheck {
  id: string;
  medicationRecordId: string;
  patientId: string;
  nurseId: AmxUid;
  checkedAt: number;
  rightPatient: boolean;
  rightDrug: boolean;
  rightDose: boolean;
  rightRoute: boolean;
  rightTime: boolean;
  allPassed: boolean;
  failures: string[];
}

export function verifyFiveRights(input: { rightPatient: boolean; rightDrug: boolean; rightDose: boolean; rightRoute: boolean; rightTime: boolean }): { allPassed: boolean; failures: string[] } {
  const failures: string[] = [];
  if (!input.rightPatient) failures.push('right_patient');
  if (!input.rightDrug) failures.push('right_drug');
  if (!input.rightDose) failures.push('right_dose');
  if (!input.rightRoute) failures.push('right_route');
  if (!input.rightTime) failures.push('right_time');
  return { allPassed: failures.length === 0, failures };
}

// ── Bedside care ───────────────────────────────────────────────────────────────

export interface CarePlanItem {
  id: string;
  patientId: string;
  category: 'medication' | 'vitals' | 'fluids' | 'nutrition' | 'pain' | 'wound' | 'lines' | 'catheters' | 'education' | 'safety' | 'discharge';
  title: string;
  instructions?: string;
  dueAt?: number;
  completedAt?: number;
  completedBy?: AmxUid;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface IVTherapyLine {
  id: string;
  patientId: string;
  site: string;
  type: 'cannula' | 'central_line' | 'picc' | 'port' | 'arterial';
  insertedAt: number;
  insertedBy?: AmxUid;
  patency: 'patent' | 'occluded' | 'phlebitis' | 'infiltration';
  dueForReplacementAt?: number;
  fluids: { name: string; rate: string; startedAt: number }[];
}

export interface WoundRecord {
  id: string;
  patientId: string;
  site: string;
  lengthCm?: number;
  widthCm?: number;
  depthCm?: number;
  exudate: 'none' | 'minimal' | 'moderate' | 'heavy';
  infection: boolean;
  dressing: string;
  photographs: string[];
  assessedAt: number;
  assessedBy?: AmxUid;
  healingTrend: 'improving' | 'static' | 'worsening';
}

export interface PressureInjuryRisk {
  patientId: string;
  bradenScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  turningSchedule: string;
  supportSurface: string;
  assessedAt: number;
}

export interface FluidBalance {
  patientId: string;
  date: number;
  inputIV: number;
  inputOral: number;
  inputNG: number;
  inputBlood: number;
  outputUrine: number;
  outputDrains: number;
  outputOther: number;
  insensibleEstimate: number;
  netBalance: number;
}

export interface PainRecord {
  id: string;
  patientId: string;
  recordedAt: number;
  score: number;
  location?: string;
  character?: string;
  intervention?: string;
  response?: string;
  recordedBy?: AmxUid;
}

// ── Handover (SBAR) ────────────────────────────────────────────────────────────

export interface HandoverDocument {
  id: string;
  wardId: string;
  outgoingNurseId: AmxUid;
  incomingNurseId?: AmxUid;
  shift: NursingShiftType;
  createdAt: number;
  acknowledgedAt?: number;
  sbar: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  patientSummaries: { patientId: string; summary: string; pendingTasks: string[]; criticalAlerts: string[] }[];
  pendingInvestigations: string[];
  pendingProcedures: string[];
  risks: string[];
}

// ── Tasks ──────────────────────────────────────────────────────────────────────

export type NursingTaskType =
  | 'medication'
  | 'vitals'
  | 'blood_sugar'
  | 'wound_dressing'
  | 'patient_education'
  | 'position_change'
  | 'catheter_care'
  | 'drain_care'
  | 'specimen_collection'
  | 'ecg'
  | 'nebulization'
  | 'oxygen'
  | 'documentation';

export interface NursingTask {
  id: string;
  patientId?: string;
  nurseId: AmxUid;
  type: NursingTaskType;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueAt?: number;
  completedAt?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

// ── Nursing assessment (ABCDE) ─────────────────────────────────────────────────

export interface NursingAssessment {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  assessedAt: number;
  airway: 'patent' | 'partially_obstructed' | 'obstructed';
  breathing: 'normal' | 'labored' | 'distressed' | 'absent';
  circulation: 'adequate' | 'compromised' | 'inadequate';
  disability: 'alert' | 'verbal' | 'pain' | 'unresponsive';
  exposure: 'normal' | 'rash' | 'swelling' | 'trauma';
  pain: number;
  nutrition: string;
  mobility: 'independent' | 'assisted' | 'dependent';
  skin: string;
  elimination: string;
  mentalStatus: string;
  psychosocial: string;
  familySupport: string;
  riskScores: { name: string; value: number }[];
  generatedCarePlan: string[];
}

// ── Escalation engine ──────────────────────────────────────────────────────────

export type EscalationTarget = 'ward_doctor' | 'consultant' | 'rapid_response_team' | 'icu' | 'safety_officer';

export interface EscalationEvent {
  id: string;
  patientId: string;
  trigger: string;
  ewScore?: number;
  target: EscalationTarget;
  escalatedAt: number;
  escalatedBy: AmxUid;
  acknowledgedBy?: AmxUid;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedAt?: number;
  notes?: string;
}

// ── Falls prevention (Morse) ───────────────────────────────────────────────────

export interface FallsRisk {
  patientId: string;
  morseScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  bedAlarmRequired: boolean;
  closeObservation: boolean;
  mobilityAssistance: boolean;
  assessedAt: number;
  assessedBy?: AmxUid;
}

export function computeMorseFallScore(input: { historyOfFalls?: boolean; secondaryDiagnosis?: boolean; ambulatoryAid: 'none' | 'crutches' | 'furniture' | 'zimmer' | 'bed_rest'; ivTherapy: boolean; gait: 'normal' | 'weak' | 'impaired'; mentalStatus: 'oriented' | 'forgetful' | 'impaired' }): number {
  let score = 0;
  if (input.historyOfFalls) score += 25;
  if (input.secondaryDiagnosis) score += 15;
  switch (input.ambulatoryAid) {
    case 'crutches': score += 15; break;
    case 'furniture': score += 30; break;
    case 'zimmer': score += 15; break;
    case 'bed_rest': score += 0; break;
    default: score += 0;
  }
  if (input.ivTherapy) score += 20;
  switch (input.gait) {
    case 'weak': score += 10; break;
    case 'impaired': score += 20; break;
    default: score += 0;
  }
  switch (input.mentalStatus) {
    case 'forgetful': score += 15; break;
    case 'impaired': score += 15; break;
    default: score += 0;
  }
  return score;
}

export function fallsRiskLevel(score: number): FallsRisk['riskLevel'] {
  if (score >= 45) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

// ── Procedure engine ───────────────────────────────────────────────────────────

export type NursingProcedureType =
  | 'ng_tube' | 'urinary_catheter' | 'iv_cannulation' | 'central_line_care'
  | 'blood_transfusion' | 'ecg' | 'specimen_collection' | 'dressing'
  | 'suction' | 'oxygen_therapy';

export interface NursingProcedure {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  type: NursingProcedureType;
  documentation: string;
  performedAt: number;
  complications?: string;
  witnessedBy?: AmxUid;
}

// ── Patient education engine ───────────────────────────────────────────────────

export interface PatientEducation {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  topic: string;
  categories: ('medication' | 'disease' | 'nutrition' | 'exercise' | 'follow_up' | 'warning_signs' | 'home_care' | 'family_counselling')[];
  materials: string[];
  deliveredAt: number;
  understood: boolean;
}

// ── Discharge engine ───────────────────────────────────────────────────────────

export interface DischargeChecklist {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  medicationExplained: boolean;
  appointmentsBooked: boolean;
  educationComplete: boolean;
  equipmentIssued: boolean;
  transportArranged: boolean;
  followUpPlanned: boolean;
  summarySigned: boolean;
  patientUnderstands: boolean;
  completedAt: number;
  readyForDischarge: boolean;
}

// ── Student nurse engine ───────────────────────────────────────────────────────

export interface StudentNurseRecord {
  id: string;
  studentId: AmxUid;
  supervisorId?: AmxUid;
  patientsManaged: string[];
  procedures: { type: NursingProcedureType; date: number }[];
  skills: string[];
  casePresentations: number;
  feedback?: string;
  competencies: { name: string; status: 'in_progress' | 'achieved' }[];
  osceReady: boolean;
}

// ── Workforce records ──────────────────────────────────────────────────────────

export interface NurseWorkforceRecord {
  nurseId: AmxUid;
  roster: { date: number; shiftType: NursingShiftType; wardId: string }[];
  overtimeHours: number;
  leaveDays: number;
  competencies: string[];
  mandatoryTraining: { name: string; completed: boolean; expiresAt?: number }[];
  licensureExpiry?: number;
  burnoutIndicator: number;
}

// ── Nursing analytics ──────────────────────────────────────────────────────────

export interface NursingAnalytics {
  nurseId: AmxUid;
  patientsCaredFor: number;
  medicationAccuracy: number;
  documentationQuality: number;
  responseTimes: number;
  patientSatisfaction: number;
  clinicalAlertsResponded: number;
  competencies: number;
  teachingCompleted: number;
}

// ── Bedside Intelligence Engine ────────────────────────────────────────────────

export interface BedsideIntelligence {
  patientId: string;
  generatedAt: number;
  acuity?: AcuityLevel;
  latestVitals?: VitalObservation;
  latestEwScore?: { score: number; scoreType: EarlyWarningScoreType };
  activeAlerts: DeteriorationAlert[];
  pendingTasks: NursingTask[];
  painScore?: number;
  fallsRisk?: FallsRisk;
  pressureRisk?: PressureInjuryRisk;
  openEscalations: EscalationEvent[];
  dueMedications: MedicationAdministrationRecord[];
  carePlanItems: CarePlanItem[];
  netFluidBalance?: number;
  suggestedFocus: string[];
}

// ── Secure communication engine ────────────────────────────────────────────────

export interface NursingCommunication {
  id: string;
  senderId: AmxUid;
  recipientIds: AmxUid[];
  patientId?: string;
  category: 'escalation' | 'handover' | 'education' | 'family' | 'team' | 'quality' | 'workforce';
  subject: string;
  body: string;
  sentAt: number;
  readBy: AmxUid[];
  urgent: boolean;
}

// ── HMIS responsibility surface ────────────────────────────────────────────────

export interface NursingHmisResponsibilities {
  wardCensus: boolean;
  staffing: boolean;
  patientAssignments: boolean;
  observationsCharting: boolean;
  medicationAdministration: boolean;
  carePlanning: boolean;
  discharges: boolean;
  infectionControl: boolean;
  qualityIndicators: boolean;
}

// ── EMR contribution surface ───────────────────────────────────────────────────

export type NursingEmrContributionKind =
  | 'vitals' | 'nursing_notes' | 'care_plan' | 'medication_administration'
  | 'fluid_balance' | 'wound_care' | 'assessments' | 'escalations' | 'education';

export interface NursingEmrContribution {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  kind: NursingEmrContributionKind;
  summary: string;
  recordedAt: number;
}

// ── AI Nursing Companion ───────────────────────────────────────────────────────

export interface AiNursingAdvice {
  id: string;
  patientId: string;
  nurseId: AmxUid;
  kind: 'observation_patterns' | 'medication_double_check' | 'deterioration_risk' | 'care_plan_suggestion' | 'fluid_review' | 'discharge_readiness' | 'workforce_hint';
  advice: string;
  confidence: number;
  generatedAt: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface NursingModel {
  organizationId: string;
  facilityId?: string;
  directorOfNursingId?: AmxUid;
  hospitalNursingManagerId?: AmxUid;
  departmentNursingManagerIds: AmxUid[];
  wardInChargeIds: AmxUid[];
  shifts: NursingShift[];
  acuities: Record<string, PatientAcuity>;
  observations: VitalObservation[];
  deteriorationAlerts: DeteriorationAlert[];
  assessments: NursingAssessment[];
  escalations: EscalationEvent[];
  fallsRisks: FallsRisk[];
  medicationRecords: MedicationAdministrationRecord[];
  carePlans: Record<string, CarePlanItem[]>;
  ivLines: IVTherapyLine[];
  wounds: WoundRecord[];
  pressureRisks: PressureInjuryRisk[];
  fluidBalances: FluidBalance[];
  painRecords: PainRecord[];
  procedures: NursingProcedure[];
  education: PatientEducation[];
  dischargeChecklists: DischargeChecklist[];
  handovers: HandoverDocument[];
  tasks: NursingTask[];
  studentRecords: StudentNurseRecord[];
  workforceRecords: Record<string, NurseWorkforceRecord>;
  analytics: Record<string, NursingAnalytics>;
  staffingRatios: { wardId: string; patientCount: number; nurseCount: number; ratio: number }[];
  fiveRightsChecks: FiveRightsCheck[];
  communications: NursingCommunication[];
  hmisResponsibilities: NursingHmisResponsibilities;
  emrContributions: NursingEmrContribution[];
  aiAdvice: AiNursingAdvice[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateNursingModelInput {
  organizationId: string;
  facilityId?: string;
  directorOfNursingId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Early warning score calculation ────────────────────────────────────────────

/** Compute an early warning score for the given score type. Returns 0 when insufficient data. */
export function computeEarlyWarningScore(o: VitalObservation, scoreType: EarlyWarningScoreType = 'news'): { score: number; points: Record<string, number> } {
  const points: Record<string, number> = {};
  const systolicThreshold = scoreType === 'obstetric' ? 100 : 90;

  if (o.respiratoryRate !== undefined) {
    const rr = o.respiratoryRate;
    points.respiratoryRate = rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3;
  }
  if (o.spo2 !== undefined) {
    const s = o.spo2;
    points.spo2 = s <= 91 ? 3 : s <= 93 ? 2 : s <= 95 ? 1 : s >= 96 ? 0 : 0;
  }
  if (o.heartRate !== undefined) {
    const hr = o.heartRate;
    points.heartRate = hr <= 40 ? 3 : hr <= 50 ? 1 : hr <= 90 ? 0 : hr <= 110 ? 1 : hr <= 130 ? 2 : 3;
  }
  if (o.systolicBP !== undefined) {
    const sbp = o.systolicBP;
    points.systolicBP = sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : sbp <= 219 ? 0 : 3;
    if (scoreType === 'obstetric') {
      points.systolicBP = sbp <= 100 ? 3 : sbp <= 110 ? 2 : sbp <= 140 ? 0 : 2;
    }
  }
  if (o.temperature !== undefined) {
    const t = o.temperature;
    points.temperature = t <= 35 ? 3 : t <= 36 ? 1 : t <= 38 ? 0 : t <= 39 ? 1 : 2;
  }
  if (scoreType === 'obstetric' && o.gcs !== undefined && o.gcs < 15) {
    points.neurological = 3;
  }

  const score = Object.values(points).reduce((sum, v) => sum + v, 0);
  return { score, points };
}

export function severityFromScore(score: number): DeteriorationAlert['severity'] {
  if (score >= 7) return 'critical';
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class NursingEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateNursingModelInput): NursingModel {
    if (!input.organizationId) throw new Error('[NursingEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      directorOfNursingId: input.directorOfNursingId,
      hospitalNursingManagerId: undefined,
      departmentNursingManagerIds: [],
      wardInChargeIds: [],
      shifts: [],
      acuities: {},
      observations: [],
      deteriorationAlerts: [],
      assessments: [],
      escalations: [],
      fallsRisks: [],
      medicationRecords: [],
      carePlans: {},
      ivLines: [],
      wounds: [],
      pressureRisks: [],
      fluidBalances: [],
      painRecords: [],
      procedures: [],
      education: [],
      dischargeChecklists: [],
      handovers: [],
      tasks: [],
      studentRecords: [],
      workforceRecords: {},
      analytics: {},
      staffingRatios: [],
      fiveRightsChecks: [],
      communications: [],
      hmisResponsibilities: {
        wardCensus: true, staffing: true, patientAssignments: true, observationsCharting: true,
        medicationAdministration: true, carePlanning: true, discharges: true,
        infectionControl: true, qualityIndicators: true,
      },
      emrContributions: [],
      aiAdvice: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard & audit ─────────────────────────────────────────────

  static canNursePerform(action: string): { allowed: boolean; reason?: string } {
    if (NURSING_AUTHORITY.includes(action)) return { allowed: true };
    if (NURSING_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        diagnose_diseases: 'Diagnosis is outside nursing authority and remains with the clinician.',
        prescribe_medications: 'Nurses administer medication but do not prescribe unless jurisdiction permits.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        modify_physician_documentation: 'Physician documentation may not be modified by nursing.',
        access_unrelated_patient_records: 'Access is limited to assigned patients within nursing scope.',
        discharge_patients_without_physician: 'Discharge requires physician approval.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Nursing authority.` };
  }

  static guard(model: NursingModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[NursingEngine] actorId is required for nursing actions');
    const verdict = NursingEngine.canNursePerform(action);
    if (!verdict.allowed) throw new Error(`[NursingEngine] ${verdict.reason}`);
  }

  static audit(model: NursingModel, actorId: AmxUid | undefined, action: string, detail?: string): NursingModel {
    const now = Date.now();
    const actor = actorId ?? model.directorOfNursingId ?? model.hospitalNursingManagerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Leadership ───────────────────────────────────────────────────────────────

  static setDirectorOfNursing(model: NursingModel, nurseId: AmxUid): NursingModel {
    return { ...model, directorOfNursingId: nurseId, updatedAt: Date.now() };
  }

  static setHospitalNursingManager(model: NursingModel, nurseId: AmxUid): NursingModel {
    return { ...model, hospitalNursingManagerId: nurseId, updatedAt: Date.now() };
  }

  static appointWardInCharge(model: NursingModel, nurseId: AmxUid): NursingModel {
    if (model.wardInChargeIds.includes(nurseId)) return model;
    return { ...model, wardInChargeIds: [...model.wardInChargeIds, nurseId], updatedAt: Date.now() };
  }

  // ── Shifts ───────────────────────────────────────────────────────────────────

  static scheduleShift(model: NursingModel, input: { nurseId: AmxUid; wardId: string; type: NursingShiftType; startAt: number; endAt: number }): NursingModel {
    const shift: NursingShift = {
      id: nextId('nsh'),
      nurseId: input.nurseId,
      wardId: input.wardId,
      type: input.type,
      startAt: input.startAt,
      endAt: input.endAt,
      assignedPatientIds: [],
      highRiskPatientIds: [],
      pendingTaskIds: [],
      status: 'scheduled',
    };
    return { ...model, shifts: [...model.shifts, shift], updatedAt: Date.now() };
  }

  static startShift(model: NursingModel, shiftId: string): NursingModel {
    const index = model.shifts.findIndex(s => s.id === shiftId);
    if (index === -1) throw new Error(`[NursingEngine] Shift "${shiftId}" does not exist`);
    const updated = { ...model.shifts[index], status: 'active' as const };
    return { ...model, shifts: [...model.shifts.slice(0, index), updated, ...model.shifts.slice(index + 1)], updatedAt: Date.now() };
  }

  static completeShift(model: NursingModel, shiftId: string): NursingModel {
    const index = model.shifts.findIndex(s => s.id === shiftId);
    if (index === -1) throw new Error(`[NursingEngine] Shift "${shiftId}" does not exist`);
    const updated = { ...model.shifts[index], status: 'completed' as const };
    return { ...model, shifts: [...model.shifts.slice(0, index), updated, ...model.shifts.slice(index + 1)], updatedAt: Date.now() };
  }

  static assignPatientToShift(model: NursingModel, shiftId: string, patientId: string): NursingModel {
    const index = model.shifts.findIndex(s => s.id === shiftId);
    if (index === -1) throw new Error(`[NursingEngine] Shift "${shiftId}" does not exist`);
    const shift = model.shifts[index];
    if (shift.assignedPatientIds.includes(patientId)) return model;
    const updated = { ...shift, assignedPatientIds: [...shift.assignedPatientIds, patientId] };
    return { ...model, shifts: [...model.shifts.slice(0, index), updated, ...model.shifts.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Acuity ───────────────────────────────────────────────────────────────────

  static setAcuity(model: NursingModel, acuity: Omit<PatientAcuity, 'updatedAt'>): NursingModel {
    return {
      ...model,
      acuities: { ...model.acuities, [acuity.patientId]: { ...acuity, updatedAt: Date.now() } },
      updatedAt: Date.now(),
    };
  }

  static getAcuity(model: NursingModel, patientId: string): PatientAcuity | undefined {
    return model.acuities[patientId];
  }

  static getHighRiskPatients(model: NursingModel, wardId?: string): string[] {
    const critical = Object.values(model.acuities)
      .filter(a => a.level === 'critical' || a.level === 'high_dependency')
      .map(a => a.patientId);
    const deteriorated = model.deteriorationAlerts
      .filter(d => !d.resolved && d.severity === 'critical')
      .map(d => d.patientId);
    return Array.from(new Set([...critical, ...deteriorated]));
  }

  // ── Observations & deterioration ─────────────────────────────────────────────

  static recordObservation(model: NursingModel, observation: Omit<VitalObservation, 'id' | 'recordedAt'>, scoreType: EarlyWarningScoreType = 'news'): { model: NursingModel; alert?: DeteriorationAlert } {
    const full: VitalObservation = { ...observation, id: nextId('obs'), recordedAt: Date.now() };
    const { score } = computeEarlyWarningScore(full, scoreType);
    const severity = severityFromScore(score);

    let modelWithObs: NursingModel = {
      ...model,
      observations: [...model.observations, full],
      updatedAt: Date.now(),
    };

    if (score >= 3) {
      const alert: DeteriorationAlert = {
        id: nextId('alert'),
        patientId: observation.patientId,
        ewScore: score,
        scoreType,
        severity,
        triggeredAt: Date.now(),
        recommendedActions: NursingEngine.recommendActionsFor(severity),
        notifiedMO: severity === 'high' || severity === 'critical',
        notifiedConsultant: severity === 'critical',
        notifiedICU: severity === 'critical',
        resolved: false,
      };
      modelWithObs = {
        ...modelWithObs,
        deteriorationAlerts: [...modelWithObs.deteriorationAlerts, alert],
      };
      return { model: modelWithObs, alert };
    }

    return { model: modelWithObs };
  }

  static resolveAlert(model: NursingModel, alertId: string): NursingModel {
    const index = model.deteriorationAlerts.findIndex(a => a.id === alertId);
    if (index === -1) throw new Error(`[NursingEngine] Alert "${alertId}" does not exist`);
    const updated = { ...model.deteriorationAlerts[index], resolved: true, resolvedAt: Date.now() };
    return {
      ...model,
      deteriorationAlerts: [...model.deteriorationAlerts.slice(0, index), updated, ...model.deteriorationAlerts.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static recommendActionsFor(severity: DeteriorationAlert['severity']): string[] {
    switch (severity) {
      case 'critical':
        return ['Call MO immediately', 'Call Consultant', 'Prepare oxygen', 'Prepare IV access', 'Prepare fluids', 'Notify ICU', 'Start sepsis bundle'];
      case 'high':
        return ['Inform medical officer', 'Repeat observations within 30 minutes', 'Check capillary refill'];
      case 'medium':
        return ['Increase observation frequency', 'Inform nurse in charge', 'Review monitoring plan'];
      default:
        return ['Continue routine observations'];
    }
  }

  // ── Medication administration ────────────────────────────────────────────────

  static scheduleMedication(model: NursingModel, record: Omit<MedicationAdministrationRecord, 'id' | 'status'>): NursingModel {
    const full: MedicationAdministrationRecord = { ...record, id: nextId('mar'), status: 'due' };
    return { ...model, medicationRecords: [...model.medicationRecords, full], updatedAt: Date.now() };
  }

  static administerMedication(model: NursingModel, recordId: string, opts: { nurseId: AmxUid; administeredAt?: number; observation?: string }): NursingModel {
    const index = model.medicationRecords.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error(`[NursingEngine] Medication record "${recordId}" does not exist`);
    const current = model.medicationRecords[index];
    const updated: MedicationAdministrationRecord = {
      ...current,
      status: 'administered',
      nurseId: opts.nurseId,
      administeredAt: opts.administeredAt ?? Date.now(),
      observation: opts.observation,
    };
    return {
      ...model,
      medicationRecords: [...model.medicationRecords.slice(0, index), updated, ...model.medicationRecords.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  // ── eMAR Five Rights Engine ──────────────────────────────────────────────────

  static checkFiveRights(model: NursingModel, input: { medicationRecordId: string; nurseId: AmxUid; rights: { rightPatient: boolean; rightDrug: boolean; rightDose: boolean; rightRoute: boolean; rightTime: boolean } }): { model: NursingModel; check: FiveRightsCheck; verdict: { allPassed: boolean; failures: string[] } } {
    const record = model.medicationRecords.find(r => r.id === input.medicationRecordId);
    if (!record) throw new Error(`[NursingEngine] Medication record "${input.medicationRecordId}" does not exist`);
    const verdict = verifyFiveRights(input.rights);
    const check: FiveRightsCheck = {
      id: nextId('fr'),
      medicationRecordId: input.medicationRecordId,
      patientId: record.patientId,
      nurseId: input.nurseId,
      checkedAt: Date.now(),
      ...input.rights,
      allPassed: verdict.allPassed,
      failures: verdict.failures,
    };
    return {
      model: { ...model, fiveRightsChecks: [...model.fiveRightsChecks, check], updatedAt: Date.now() },
      check,
      verdict,
    };
  }

  // ── Care plan ────────────────────────────────────────────────────────────────

  static addCarePlanItem(model: NursingModel, item: Omit<CarePlanItem, 'id' | 'status'>): NursingModel {
    const full: CarePlanItem = { ...item, id: nextId('care'), status: 'pending' };
    const existing = model.carePlans[item.patientId] ?? [];
    return {
      ...model,
      carePlans: { ...model.carePlans, [item.patientId]: [...existing, full] },
      updatedAt: Date.now(),
    };
  }

  static completeCarePlanItem(model: NursingModel, patientId: string, itemId: string, nurseId: AmxUid): NursingModel {
    const existing = model.carePlans[patientId] ?? [];
    const index = existing.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error(`[NursingEngine] Care item "${itemId}" does not exist`);
    const updated: CarePlanItem = { ...existing[index], status: 'completed', completedAt: Date.now(), completedBy: nurseId };
    const next = [...existing];
    next[index] = updated;
    return { ...model, carePlans: { ...model.carePlans, [patientId]: next }, updatedAt: Date.now() };
  }

  // ── Wounds / pressure / IV / fluids / pain ───────────────────────────────────

  static recordWound(model: NursingModel, wound: Omit<WoundRecord, 'id'>): NursingModel {
    return { ...model, wounds: [...model.wounds, { ...wound, id: nextId('wnd') }], updatedAt: Date.now() };
  }

  static assessPressureInjuryRisk(model: NursingModel, risk: PressureInjuryRisk): NursingModel {
    const index = model.pressureRisks.findIndex(r => r.patientId === risk.patientId);
    if (index === -1) return { ...model, pressureRisks: [...model.pressureRisks, { ...risk, assessedAt: Date.now() }], updatedAt: Date.now() };
    const updated = { ...model.pressureRisks[index], ...risk, assessedAt: Date.now() };
    return {
      ...model,
      pressureRisks: [...model.pressureRisks.slice(0, index), updated, ...model.pressureRisks.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static addIVLine(model: NursingModel, line: Omit<IVTherapyLine, 'id'>): NursingModel {
    return { ...model, ivLines: [...model.ivLines, { ...line, id: nextId('iv') }], updatedAt: Date.now() };
  }

  static addFluidBalance(model: NursingModel, balance: FluidBalance): NursingModel {
    const inputTotal = balance.inputIV + balance.inputOral + balance.inputNG + balance.inputBlood;
    const outputTotal = balance.outputUrine + balance.outputDrains + balance.outputOther + balance.insensibleEstimate;
    const full: FluidBalance = { ...balance, netBalance: inputTotal - outputTotal };
    return { ...model, fluidBalances: [...model.fluidBalances, full], updatedAt: Date.now() };
  }

  static recordPain(model: NursingModel, pain: Omit<PainRecord, 'id' | 'recordedAt'>): NursingModel {
    return { ...model, painRecords: [...model.painRecords, { ...pain, id: nextId('pain'), recordedAt: Date.now() }], updatedAt: Date.now() };
  }

  // ── Handover (SBAR) ──────────────────────────────────────────────────────────

  static createHandover(model: NursingModel, input: Omit<HandoverDocument, 'id' | 'createdAt'>): NursingModel {
    const handover: HandoverDocument = { ...input, id: nextId('hb'), createdAt: Date.now() };
    return { ...model, handovers: [...model.handovers, handover], updatedAt: Date.now() };
  }

  static acknowledgeHandover(model: NursingModel, handoverId: string, incomingNurseId: AmxUid): NursingModel {
    const index = model.handovers.findIndex(h => h.id === handoverId);
    if (index === -1) throw new Error(`[NursingEngine] Handover "${handoverId}" does not exist`);
    const updated = { ...model.handovers[index], incomingNurseId, acknowledgedAt: Date.now() };
    return {
      ...model,
      handovers: [...model.handovers.slice(0, index), updated, ...model.handovers.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  // ── Tasks ────────────────────────────────────────────────────────────────────

  static createTask(model: NursingModel, task: Omit<NursingTask, 'id' | 'status'>): NursingModel {
    return { ...model, tasks: [...model.tasks, { ...task, id: nextId('tsk'), status: 'pending' }], updatedAt: Date.now() };
  }

  static completeTask(model: NursingModel, taskId: string): NursingModel {
    const index = model.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error(`[NursingEngine] Task "${taskId}" does not exist`);
    const updated = { ...model.tasks[index], status: 'completed' as const, completedAt: Date.now() };
    return {
      ...model,
      tasks: [...model.tasks.slice(0, index), updated, ...model.tasks.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static getPendingTasksForNurse(model: NursingModel, nurseId: AmxUid): NursingTask[] {
    return model.tasks.filter(t => t.nurseId === nurseId && t.status !== 'completed');
  }

  // ── Nursing assessment (ABCDE → care plan) ──────────────────────────────────

  static conductAssessment(model: NursingModel, assessment: Omit<NursingAssessment, 'id' | 'assessedAt' | 'generatedCarePlan'>): { model: NursingModel; assessment: NursingAssessment; generatedCarePlan: string[] } {
    const generatedCarePlan = NursingEngine.generateCarePlan(assessment);
    const full: NursingAssessment = { ...assessment, id: nextId('asmt'), assessedAt: Date.now(), generatedCarePlan };
    return {
      model: { ...model, assessments: [...model.assessments, full], updatedAt: Date.now() },
      assessment: full,
      generatedCarePlan,
    };
  }

  /** Constitutional Assessment Engine — automatically derives a nursing care plan. */
  static generateCarePlan(assessment: Omit<NursingAssessment, 'id' | 'assessedAt' | 'generatedCarePlan'>): string[] {
    const plan: string[] = [];
    if (assessment.airway !== 'patent') plan.push('Maintain airway — position, suction, anaesthesia review');
    if (assessment.breathing === 'labored' || assessment.breathing === 'distressed') plan.push('Oxygen monitoring, respiratory support, escalate if NEWS rises');
    if (assessment.circulation === 'compromised' || assessment.circulation === 'inadequate') plan.push('Fluid balance monitoring, IV access, haemodynamic monitoring');
    if (assessment.pain >= 4) plan.push('Pain assessment and management — reassess after intervention');
    if (assessment.nutrition.toLowerCase().includes('risk') || !assessment.nutrition) plan.push('Nutrition assessment — dietitian review');
    if (assessment.mobility !== 'independent') plan.push('Mobility assistance — falls prevention bundle, turning schedule');
    if (assessment.skin.toLowerCase().includes('break') || assessment.skin.toLowerCase().includes('ulcer') || assessment.skin.toLowerCase().includes('rash')) plan.push('Skin assessment — pressure area care, wound review');
    plan.push('Patient education and family support', 'Monitor vital signs per early warning schedule');
    return plan;
  }

  // ── Escalation Engine ────────────────────────────────────────────────────────

  static escalate(model: NursingModel, escalation: Omit<EscalationEvent, 'id' | 'escalatedAt' | 'resolved'>): NursingModel {
    const full: EscalationEvent = { ...escalation, id: nextId('esc'), escalatedAt: Date.now(), resolved: false };
    return { ...model, escalations: [...model.escalations, full], updatedAt: Date.now() };
  }

  static resolveEscalation(model: NursingModel, escalationId: string, notes?: string): NursingModel {
    const index = model.escalations.findIndex(e => e.id === escalationId);
    if (index === -1) throw new Error(`[NursingEngine] Escalation "${escalationId}" does not exist`);
    const updated = { ...model.escalations[index], resolved: true, resolvedAt: Date.now(), notes };
    return {
      ...model,
      escalations: [...model.escalations.slice(0, index), updated, ...model.escalations.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static getOpenEscalations(model: NursingModel): EscalationEvent[] {
    return model.escalations.filter(e => !e.resolved);
  }

  // ── Falls prevention (Morse) ─────────────────────────────────────────────────

  static assessFallsRisk(model: NursingModel, input: { patientId: string; assessedBy?: AmxUid } & Parameters<typeof computeMorseFallScore>[0]): NursingModel {
    const morseScore = computeMorseFallScore(input);
    const riskLevel = fallsRiskLevel(morseScore);
    const risk: FallsRisk = {
      patientId: input.patientId,
      morseScore,
      riskLevel,
      bedAlarmRequired: riskLevel === 'high',
      closeObservation: riskLevel === 'high',
      mobilityAssistance: riskLevel !== 'low',
      assessedAt: Date.now(),
      assessedBy: input.assessedBy,
    };
    const index = model.fallsRisks.findIndex(r => r.patientId === input.patientId);
    if (index === -1) return { ...model, fallsRisks: [...model.fallsRisks, risk], updatedAt: Date.now() };
    return {
      ...model,
      fallsRisks: [...model.fallsRisks.slice(0, index), risk, ...model.fallsRisks.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static getHighFallRiskPatients(model: NursingModel): FallsRisk[] {
    return model.fallsRisks.filter(r => r.riskLevel === 'high');
  }

  // ── Procedure Engine ─────────────────────────────────────────────────────────

  static performProcedure(model: NursingModel, procedure: Omit<NursingProcedure, 'id' | 'performedAt'>): NursingModel {
    return { ...model, procedures: [...model.procedures, { ...procedure, id: nextId('proc'), performedAt: Date.now() }], updatedAt: Date.now() };
  }

  // ── Patient Education Engine ─────────────────────────────────────────────────

  static recordEducation(model: NursingModel, education: Omit<PatientEducation, 'id' | 'deliveredAt'>): NursingModel {
    return { ...model, education: [...model.education, { ...education, id: nextId('edu'), deliveredAt: Date.now() }], updatedAt: Date.now() };
  }

  static getPendingEducation(model: NursingModel, patientId?: string): PatientEducation[] {
    return model.education.filter(e => !e.understood && (!patientId || e.patientId === patientId));
  }

  // ── Discharge Engine ─────────────────────────────────────────────────────────

  static evaluateDischargeChecklist(model: NursingModel, checklist: Omit<DischargeChecklist, 'id' | 'completedAt' | 'readyForDischarge'>): { model: NursingModel; checklist: DischargeChecklist; ready: boolean } {
    const readyForDischarge = checklist.medicationExplained && checklist.appointmentsBooked && checklist.educationComplete && checklist.equipmentIssued && checklist.transportArranged && checklist.followUpPlanned && checklist.summarySigned && checklist.patientUnderstands;
    const full: DischargeChecklist = { ...checklist, id: nextId('dc'), completedAt: Date.now(), readyForDischarge };
    return {
      model: { ...model, dischargeChecklists: [...model.dischargeChecklists, full], updatedAt: Date.now() },
      checklist: full,
      ready: readyForDischarge,
    };
  }

  static getDischargeReadyPatients(model: NursingModel): DischargeChecklist[] {
    return model.dischargeChecklists.filter(c => c.readyForDischarge);
  }

  // ── Student Nurse Engine ─────────────────────────────────────────────────────

  static registerStudent(model: NursingModel, studentId: AmxUid, supervisorId: AmxUid): NursingModel {
    const record: StudentNurseRecord = {
      id: nextId('stu'),
      studentId,
      supervisorId,
      patientsManaged: [],
      procedures: [],
      skills: [],
      casePresentations: 0,
      competencies: [],
      osceReady: false,
    };
    return { ...model, studentRecords: [...model.studentRecords, record], updatedAt: Date.now() };
  }

  static logStudentActivity(model: NursingModel, studentId: AmxUid, activity: { patientId?: string; procedure?: NursingProcedureType; skill?: string; casePresentation?: boolean }): NursingModel {
    const index = model.studentRecords.findIndex(r => r.studentId === studentId);
    if (index === -1) throw new Error(`[NursingEngine] No student record for "${studentId}"`);
    const current = model.studentRecords[index];
    const updated: StudentNurseRecord = {
      ...current,
      patientsManaged: activity.patientId && !current.patientsManaged.includes(activity.patientId) ? [...current.patientsManaged, activity.patientId] : current.patientsManaged,
      procedures: activity.procedure ? [...current.procedures, { type: activity.procedure, date: Date.now() }] : current.procedures,
      skills: activity.skill && !current.skills.includes(activity.skill) ? [...current.skills, activity.skill] : current.skills,
      casePresentations: current.casePresentations + (activity.casePresentation ? 1 : 0),
    };
    return {
      ...model,
      studentRecords: [...model.studentRecords.slice(0, index), updated, ...model.studentRecords.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static assessStudentCompetency(model: NursingModel, studentId: AmxUid, competency: string, status: 'in_progress' | 'achieved', feedback?: string): NursingModel {
    const index = model.studentRecords.findIndex(r => r.studentId === studentId);
    if (index === -1) throw new Error(`[NursingEngine] No student record for "${studentId}"`);
    const current = model.studentRecords[index];
    const competencies = current.competencies.filter(c => c.name !== competency);
    const updated: StudentNurseRecord = {
      ...current,
      competencies: [...competencies, { name: competency, status }],
      osceReady: status === 'achieved' || current.osceReady,
      feedback,
    };
    return {
      ...model,
      studentRecords: [...model.studentRecords.slice(0, index), updated, ...model.studentRecords.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  // ── Workforce records ────────────────────────────────────────────────────────

  static upsertWorkforceRecord(model: NursingModel, nurseId: AmxUid, patch: Partial<Omit<NurseWorkforceRecord, 'nurseId'>>): NursingModel {
    const current = model.workforceRecords[nurseId];
    const merged: NurseWorkforceRecord = {
      nurseId,
      roster: patch.roster ?? current?.roster ?? [],
      overtimeHours: patch.overtimeHours ?? current?.overtimeHours ?? 0,
      leaveDays: patch.leaveDays ?? current?.leaveDays ?? 0,
      competencies: patch.competencies ?? current?.competencies ?? [],
      mandatoryTraining: patch.mandatoryTraining ?? current?.mandatoryTraining ?? [],
      licensureExpiry: patch.licensureExpiry ?? current?.licensureExpiry,
      burnoutIndicator: patch.burnoutIndicator ?? current?.burnoutIndicator ?? 0,
    };
    return { ...model, workforceRecords: { ...model.workforceRecords, [nurseId]: merged }, updatedAt: Date.now() };
  }

  static getBurnoutRiskNurses(model: NursingModel, threshold = 70): { nurseId: AmxUid; burnoutIndicator: number }[] {
    return Object.values(model.workforceRecords)
      .filter(r => r.burnoutIndicator >= threshold)
      .map(r => ({ nurseId: r.nurseId, burnoutIndicator: r.burnoutIndicator }));
  }

  // ── Staffing ratio ───────────────────────────────────────────────────────────

  static updateStaffingRatio(model: NursingModel, wardId: string, patientCount: number, nurseCount: number): NursingModel {
    const ratio = nurseCount > 0 ? Number((patientCount / nurseCount).toFixed(2)) : 0;
    const existing = model.staffingRatios.findIndex(s => s.wardId === wardId);
    const entry = { wardId, patientCount, nurseCount, ratio };
    if (existing === -1) return { ...model, staffingRatios: [...model.staffingRatios, entry], updatedAt: Date.now() };
    return {
      ...model,
      staffingRatios: [...model.staffingRatios.slice(0, existing), entry, ...model.staffingRatios.slice(existing + 1)],
      updatedAt: Date.now(),
    };
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  static updateAnalytics(model: NursingModel, analytics: Partial<NursingAnalytics> & { nurseId: AmxUid }): NursingModel {
    const current = model.analytics[analytics.nurseId];
    const merged: NursingAnalytics = {
      nurseId: analytics.nurseId,
      patientsCaredFor: analytics.patientsCaredFor ?? current?.patientsCaredFor ?? 0,
      medicationAccuracy: analytics.medicationAccuracy ?? current?.medicationAccuracy ?? 0,
      documentationQuality: analytics.documentationQuality ?? current?.documentationQuality ?? 0,
      responseTimes: analytics.responseTimes ?? current?.responseTimes ?? 0,
      patientSatisfaction: analytics.patientSatisfaction ?? current?.patientSatisfaction ?? 0,
      clinicalAlertsResponded: analytics.clinicalAlertsResponded ?? current?.clinicalAlertsResponded ?? 0,
      competencies: analytics.competencies ?? current?.competencies ?? 0,
      teachingCompleted: analytics.teachingCompleted ?? current?.teachingCompleted ?? 0,
    };
    return { ...model, analytics: { ...model.analytics, [analytics.nurseId]: merged }, updatedAt: Date.now() };
  }

  // ── Bedside Intelligence Engine ──────────────────────────────────────────────

  static getBedsideIntelligence(model: NursingModel, patientId: string): BedsideIntelligence | undefined {
    const latestVitals = model.observations
      .filter(o => o.patientId === patientId)
      .sort((a, b) => b.recordedAt - a.recordedAt)[0];
    if (!latestVitals && !model.acuities[patientId] && !model.carePlans[patientId]) return undefined;
    const latestEwScore = latestVitals ? (() => {
      const score = computeEarlyWarningScore(latestVitals);
      return { score: score.score, scoreType: 'news' as const };
    })() : undefined;
    const pain = model.painRecords.filter(p => p.patientId === patientId).sort((a, b) => b.recordedAt - a.recordedAt)[0];
    const fluid = model.fluidBalances.filter(f => f.patientId === patientId).sort((a, b) => b.date - a.date)[0];
    const suggestedFocus: string[] = [];
    const acuity = model.acuities[patientId];
    if (acuity && (acuity.level === 'critical' || acuity.level === 'high_dependency')) suggestedFocus.push('Frequent reassessment — critical/high dependency acuity');
    if (latestEwScore && latestEwScore.score >= 5) suggestedFocus.push('Escalation watch — elevated early warning score');
    if (pain && pain.score >= 4) suggestedFocus.push('Pain management and reassessment');
    if (model.fallsRisks.some(r => r.patientId === patientId && r.riskLevel === 'high')) suggestedFocus.push('Falls prevention bundle active');
    if (model.pressureRisks.some(r => r.patientId === patientId && (r.riskLevel === 'high' || r.riskLevel === 'very_high'))) suggestedFocus.push('Pressure injury prevention — turning schedule');
    if (suggestedFocus.length === 0) suggestedFocus.push('Continue routine nursing care');

    return {
      patientId,
      generatedAt: Date.now(),
      acuity: acuity?.level,
      latestVitals,
      latestEwScore,
      activeAlerts: model.deteriorationAlerts.filter(a => a.patientId === patientId && !a.resolved),
      pendingTasks: model.tasks.filter(t => t.patientId === patientId && t.status !== 'completed'),
      painScore: pain?.score,
      fallsRisk: model.fallsRisks.find(r => r.patientId === patientId),
      pressureRisk: model.pressureRisks.find(r => r.patientId === patientId),
      openEscalations: model.escalations.filter(e => e.patientId === patientId && !e.resolved),
      dueMedications: model.medicationRecords.filter(m => m.patientId === patientId && m.status === 'due'),
      carePlanItems: model.carePlans[patientId] ?? [],
      netFluidBalance: fluid?.netBalance,
      suggestedFocus,
    };
  }

  // ── Secure Communication Engine ──────────────────────────────────────────────

  static sendCommunication(model: NursingModel, actorId: AmxUid | undefined, input: Omit<NursingCommunication, 'id' | 'sentAt' | 'readBy'>): { model: NursingModel; communication: NursingCommunication } {
    NursingEngine.guard(model, input.senderId, 'escalate_care');
    const communication: NursingCommunication = { ...input, id: nextId('com'), sentAt: Date.now(), readBy: [] };
    return {
      model: { ...NursingEngine.audit(model, actorId, 'nursing_communication_sent', input.category), communications: [...model.communications, communication], updatedAt: Date.now() },
      communication,
    };
  }

  static markCommunicationRead(model: NursingModel, communicationId: string, nurseId: AmxUid): NursingModel {
    const index = model.communications.findIndex(c => c.id === communicationId);
    if (index === -1) throw new Error(`[NursingEngine] Communication "${communicationId}" does not exist`);
    const current = model.communications[index];
    const updated = { ...current, readBy: current.readBy.includes(nurseId) ? current.readBy : [...current.readBy, nurseId] };
    return {
      ...model,
      communications: [...model.communications.slice(0, index), updated, ...model.communications.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  // ── EMR Contribution Engine ──────────────────────────────────────────────────

  static recordEmrContribution(model: NursingModel, actorId: AmxUid | undefined, input: Omit<NursingEmrContribution, 'id' | 'recordedAt'>): { model: NursingModel; contribution: NursingEmrContribution } {
    const contribution: NursingEmrContribution = { ...input, id: nextId('emr'), recordedAt: Date.now() };
    return {
      model: { ...NursingEngine.audit(model, actorId, 'emr_contribution_recorded', input.kind), emrContributions: [...model.emrContributions, contribution], updatedAt: Date.now() },
      contribution,
    };
  }

  // ── AI Nursing Companion ─────────────────────────────────────────────────────

  static aiNursingAdvice(model: NursingModel, patientId: string, kind: AiNursingAdvice['kind']): { model: NursingModel; advice: AiNursingAdvice } {
    const latest = model.observations.filter(o => o.patientId === patientId).sort((a, b) => b.recordedAt - a.recordedAt)[0];
    const ew = latest ? computeEarlyWarningScore(latest) : undefined;
    const patient = model.acuities[patientId];
    let advice = 'No specific AI suggestion for current nursing data.';
    let confidence = 0.5;

    if (kind === 'observation_patterns' && latest) {
      advice = `Latest observations: ${latest.heartRate !== undefined ? `HR ${latest.heartRate}, ` : ''}${latest.systolicBP !== undefined ? `BP ${latest.systolicBP}, ` : ''}${latest.spo2 !== undefined ? `SpO2 ${latest.spo2}` : ''}. Keep the observation schedule aligned with the early warning trend.`;
      confidence = 0.7;
    }
    if (kind === 'deterioration_risk' && ew && ew.score >= 5) {
      advice = 'Elevated early warning trend detected — intensify observation frequency and prepare escalation to the medical team.';
      confidence = 0.85;
    }
    if (kind === 'medication_double_check' && patient) {
      advice = 'Cross-check the five rights against the prescription before administration; verify allergy history before giving new agents.';
      confidence = 0.75;
    }
    if (kind === 'fluid_review' && latest) {
      advice = 'Consider a fluid balance summary and review renal output against input in the last 24 hours.';
      confidence = 0.6;
    }

    const adviceRecord: AiNursingAdvice = {
      id: nextId('ai'),
      patientId,
      nurseId: latest?.nurseId ?? patient?.updatedBy ?? model.directorOfNursingId ?? model.hospitalNursingManagerId ?? model.departmentNursingManagerIds[0],
      kind,
      advice,
      confidence,
      generatedAt: Date.now(),
    };
    return { model: { ...model, aiAdvice: [...model.aiAdvice, adviceRecord], updatedAt: Date.now() }, advice: adviceRecord };
  }

  // ── Read conveniences ────────────────────────────────────────────────────────

  static getActiveShifts(model: NursingModel, wardId?: string): NursingShift[] {
    const now = Date.now();
    return model.shifts.filter(s => s.status === 'active' && (!wardId || s.wardId === wardId) && s.startAt <= now && s.endAt >= now);
  }

  static getUnresolvedAlerts(model: NursingModel): DeteriorationAlert[] {
    return model.deteriorationAlerts.filter(a => !a.resolved);
  }

  static getCriticalAlerts(model: NursingModel): DeteriorationAlert[] {
    return model.deteriorationAlerts.filter(a => !a.resolved && a.severity === 'critical');
  }

  static getShiftHandover(model: NursingModel, shiftId: string): HandoverDocument | undefined {
    const shift = model.shifts.find(s => s.id === shiftId);
    return shift?.handoverId ? model.handovers.find(h => h.id === shift.handoverId) : undefined;
  }

  static getWardSummary(model: NursingModel, wardId: string): {
    activeShifts: number;
    highRiskPatients: number;
    pendingTasks: number;
    unresolvedAlerts: number;
    patientsOnObservations: number;
    ratio?: { patientCount: number; nurseCount: number; ratio: number };
  } {
    return {
      activeShifts: NursingEngine.getActiveShifts(model, wardId).length,
      highRiskPatients: model.shifts.filter(s => s.wardId === wardId).reduce((sum, s) => sum + s.highRiskPatientIds.length, 0),
      pendingTasks: model.tasks.filter(t => t.status !== 'completed').length,
      unresolvedAlerts: NursingEngine.getUnresolvedAlerts(model).length,
      patientsOnObservations: model.observations.length,
      ratio: model.staffingRatios.find(s => s.wardId === wardId),
    };
  }
}

export default NursingEngine;
