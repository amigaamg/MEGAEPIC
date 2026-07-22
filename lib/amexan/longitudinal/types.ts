// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Longitudinal Care — Core Data Model
// ═══════════════════════════════════════════════════════════════════════════════
// Governs the continuous inpatient journey.
// One patient, one story, one evolving timeline.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Timeline ──────────────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'admission' | 'discharge' | 'transfer'
  | 'ward_round' | 'consultation' | 'operation' | 'procedure'
  | 'investigation_ordered' | 'investigation_result'
  | 'medication_prescribed' | 'medication_administered' | 'medication_changed'
  | 'icu_admission' | 'icu_discharge'
  | 'complication' | 'event' | 'note'
  | 'clinic_visit' | 'emergency_visit'
  | 'vaccination' | 'milestone' | 'outcome';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number;
  title: string;
  description: string;
  source: 'system' | 'doctor' | 'nurse' | 'lab' | 'pharmacy' | 'external';
  relatedEncounterId?: string;
  relatedUserId?: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
  metadata: Record<string, unknown>;
}

// ── Hospital Day ──────────────────────────────────────────────────────────────

export type PatientStatus = 'stable' | 'improving' | 'deteriorating' | 'critical' | 'transfer' | 'discharge_ready';

export interface VitalsSummary {
  tempMin?: number; tempMax?: number; tempTrend?: TrendDirection;
  hrMin?: number; hrMax?: number; hrTrend?: TrendDirection;
  rrMin?: number; rrMax?: number; rrTrend?: TrendDirection;
  bpSystolicMin?: number; bpSystolicMax?: number; bpTrend?: TrendDirection;
  spo2Min?: number; spo2Max?: number; spo2Trend?: TrendDirection;
  news?: number; newsTrend?: TrendDirection;
  urineOutput?: number;
  fluidBalance?: number;
  weight?: number;
}

export type TrendDirection = 'improving' | 'stable' | 'worsening' | 'variable';

export interface HospitalDay {
  dayNumber: number;
  date: number;
  status: PatientStatus;
  summary: string;
  overnightEvents: string[];
  soap: SoapNote;
  vitals: VitalsSummary;
  investigations: InvestigationStatus[];
  medications: MedicationStatus[];
  tasks: ToDoTask[];
  events: TimelineEvent[];
  problems: ProblemStatus[];
  dischargeReadiness: DischargeReadiness;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  generatedAt: number;
}

export interface ProblemStatus {
  id: string;
  problem: string;
  status: 'active' | 'improving' | 'resolved' | 'worsening' | 'chronic';
  priority: number;
  icd10?: string;
}

export interface InvestigationStatus {
  id: string;
  testName: string;
  category: 'lab' | 'imaging' | 'pathology' | 'microbiology';
  status: 'ordered' | 'collected' | 'processing' | 'resulted' | 'reviewed' | 'acted' | 'closed';
  orderedAt: number;
  collectedAt?: number;
  resultedAt?: number;
  reviewedAt?: number;
  result?: string;
  unit?: string;
  referenceRange?: string;
  flag?: 'normal' | 'abnormal' | 'critical' | null;
  interpretation?: string;
  action?: string;
}

export interface MedicationStatus {
  id: string;
  genericName: string;
  dosage: string;
  route: string;
  frequency: string;
  status: 'prescribed' | 'verified' | 'dispensed' | 'administering' | 'completed' | 'missed' | 'discontinued';
  prescribedAt: number;
  lastAdministered?: number;
  nextDue?: number;
  missedDoses: number;
}

export type DischargeReadiness = 'not_ready' | 'nearly_ready' | 'ready' | 'discharged';

// ── To-Do Task ────────────────────────────────────────────────────────────────

export type TaskCategory = 'lab' | 'radiology' | 'nursing' | 'pharmacy' | 'physiotherapy' | 'doctor' | 'consult' | 'admin';

export type TaskPriority = 'stat' | 'urgent' | 'today' | 'routine';

export interface ToDoTask {
  id: string;
  category: TaskCategory;
  description: string;
  detail: string;
  priority: TaskPriority;
  source: string;
  assignedTo?: string;
  assignedRole?: string;
  dueBy?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
  createdAt: number;
  completedAt?: number;
  completedBy?: string;
  sourcePhase?: string;
}

// ── Ward Round ────────────────────────────────────────────────────────────────

export interface WardRound {
  id: string;
  hospitalDay: number;
  date: number;
  consultant: string;
  registrar: string;
  teamMembers: string[];
  summary: string;
  presentationCard: WardRoundPresentation;
  soap: SoapNote;
  plan: string;
  tasksGenerated: string[];
  completed: boolean;
}

export interface WardRoundPresentation {
  identification: string;
  oneLineSummary: string;
  diagnosis: string;
  problems: string[];
  overnightEvents: string[];
  vitals: string;
  medications: string;
  labs: string;
  imaging: string;
  examination: string;
  assessment: string;
  plan: string;
}

// ── Monitoring Data ───────────────────────────────────────────────────────────

export type MonitoringParameter =
  | 'temperature' | 'heart_rate' | 'respiratory_rate'
  | 'bp_systolic' | 'bp_diastolic' | 'spo2'
  | 'urine_output' | 'fluid_balance' | 'weight'
  | 'blood_glucose' | 'news' | 'pain_score';

export interface MonitoringDataPoint {
  timestamp: number;
  value: number;
  recordedBy?: string;
  source?: 'manual' | 'device' | 'lab';
}

export interface MonitoringSeries {
  parameter: MonitoringParameter;
  label: string;
  unit: string;
  dataPoints: MonitoringDataPoint[];
  trend: TrendDirection;
  lowerLimit?: number;
  upperLimit?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

// ── Clinical Snapshot (Today's Summary) ──────────────────────────────────────

export interface ClinicalSnapshot {
  diagnosis: string;
  diagnosisStatus: PatientStatus;
  problems: ProblemStatus[];
  warnings: WarningItem[];
  outstandingResults: string[];
  todayTasks: ToDoTask[];
  medicationIssues: MedicationIssue[];
  dischargeReadiness: DischargeReadiness;
  nextDueAction?: string;
}

export interface WarningItem {
  type: 'allergy' | 'high_news' | 'fall_risk' | 'critical_result' | 'medication' | 'isolation';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface MedicationIssue {
  medication: string;
  issue: 'missed_dose' | 'due_soon' | 'overdue' | 'interaction' | 'allergy';
  detail: string;
  severity: 'info' | 'warning' | 'critical';
}

// ── Admission Record (Master Document) ────────────────────────────────────────

export interface AdmissionRecord {
  encounterId: string;
  admittedAt: number;
  admittedFrom: string;
  admittedBy: string;
  ward: string;
  bed: string;
  consultant: string;
  team: string[];
  admittingDiagnosis: string;
  presentingComplaint: string;
  historySummary: string;
  examinationSummary: string;
  investigationSummary: string;
  initialPlan: string;
  severityAtAdmission: string;
  expectedDischargeAt?: number;
}

// ── Discharge Summary ─────────────────────────────────────────────────────────

export interface DischargeData {
  dischargedAt: number;
  dischargeType: DischargeReadiness;
  admittingDiagnosis: string;
  finalDiagnosis: string;
  proceduresPerformed: string[];
  hospitalCourse: string;
  dischargeMedications: DischargeMedication[];
  conditionAtDischarge: 'improved' | 'stable' | 'transferred' | 'self_discharge' | 'deceased';
  followUpPlan: string;
  activityRestrictions: string[];
  dietInstructions: string;
  woundCareInstructions: string;
  redFlags: string[];
  safetyNetting: string;
  medicationReconciliationDone: boolean;
  nursingHandoverDone: boolean;
  dischargeNote: string;
  generatedAt: number;
}

export interface DischargeMedication {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  indication: string;
}

// ── ICU Transfer / Consultation / Operative Note ─────────────────────────────

export interface IcuTransferNote {
  reason: string;
  currentDiagnosis: string;
  ventilatorSettings?: string;
  linesAndAccess: string[];
  currentMedications: string[];
  currentInvestigations: string[];
  pendingIssues: string[];
  generatedAt: number;
}

export interface ConsultationNote {
  patientSummary: string;
  reasonForConsult: string;
  consultFindings: string;
  opinion: string;
  recommendations: string[];
  consultedBy: string;
  consultedAt: number;
}

export interface OperativeNote {
  patientId: string;
  encounterId: string;
  preoperativeDiagnosis: string;
  procedure: string;
  side: string;
  consentVerified: boolean;
  anaesthesia: string;
  surgeon: string;
  assistant: string;
  findings: string;
  complications: string;
  bloodLoss: string;
  drains: string[];
  closure: string;
  specimens: string[];
  postoperativePlan: string;
  completedAt: number;
}

// ── Longitudinal Care State ───────────────────────────────────────────────────

export interface PatientJourney {
  patientId: string;
  timeline: TimelineEvent[];
  hospitalDays: HospitalDay[];
  wardRounds: WardRound[];
  admission: AdmissionRecord | null;
  discharge: DischargeData | null;
  consultations: ConsultationNote[];
  operativeNotes: OperativeNote[];
  icuTransfers: IcuTransferNote[];
  monitoring: MonitoringSeries[];
  tasks: ToDoTask[];
  snapshot: ClinicalSnapshot | null;
  currentHospitalDay: number;
  status: PatientStatus;
}
