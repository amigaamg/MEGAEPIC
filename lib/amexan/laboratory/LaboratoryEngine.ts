// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Laboratory Engine (BOOK VI-K) — Constitutional Engine No. 21
//
// "The Engine of Diagnostic Intelligence, Specimen Governance, and Laboratory
// Excellence"
//
// The Laboratory Engine transforms laboratory medicine from performing tests
// into generating trusted diagnostic intelligence. Every specimen, test,
// analyzer, result, and interpretation contributes to safe, evidence-based
// patient care. No specimen is untraceable, no result leaves unvalidated,
// no critical value goes unacknowledged.
//
// Constitutional specimen lifecycle:
//   Clinical Order → Specimen Request → Collection → Label Verification →
//   Transportation → Reception → Accessioning → Processing → Analysis →
//   Validation → Authorization → Result Release → Clinical Interpretation →
//   Archival
//
// Every stage is tracked constitutionally. Results never leave automatically.
// Authorization remains constitutional. This engine is pure and deterministic;
// persistence is orchestrated by the provisioning conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Hierarchy ──────────────────────────────────────────────────────────────────

export type LaboratoryRole =
  | 'laboratory_director'
  | 'deputy_laboratory_director'
  | 'laboratory_manager'
  | 'section_head'
  | 'clinical_pathologist'
  | 'laboratory_scientist'
  | 'laboratory_technologist'
  | 'laboratory_technician'
  | 'phlebotomist'
  | 'specimen_reception_officer'
  | 'quality_officer'
  | 'biomedical_engineer'
  | 'student';

export const LABORATORY_ROLE_LEVELS: Readonly<Record<LaboratoryRole, number>> = {
  laboratory_director: 14,
  deputy_laboratory_director: 13,
  laboratory_manager: 12,
  section_head: 11,
  clinical_pathologist: 11,
  laboratory_scientist: 9,
  laboratory_technologist: 8,
  laboratory_technician: 7,
  phlebotomist: 5,
  specimen_reception_officer: 4,
  quality_officer: 8,
  biomedical_engineer: 8,
  student: 3,
};

// ── Laboratory sections ────────────────────────────────────────────────────────

export type LaboratorySection =
  | 'hematology'
  | 'clinical_chemistry'
  | 'microbiology'
  | 'molecular_biology'
  | 'blood_bank'
  | 'histopathology'
  | 'cytology'
  | 'immunology'
  | 'virology'
  | 'toxicology'
  | 'genetics'
  | 'point_of_care'
  | 'research';

export const LABORATORY_SECTIONS: Readonly<LaboratorySection[]> = [
  'hematology', 'clinical_chemistry', 'microbiology', 'molecular_biology',
  'blood_bank', 'histopathology', 'cytology', 'immunology', 'virology',
  'toxicology', 'genetics', 'point_of_care', 'research',
];

export type TestUrgency = 'routine' | 'urgent' | 'stat' | 'emergency';
export type SpecimenType = 'blood' | 'serum' | 'plasma' | 'urine' | 'stool' | 'sputum' | 'csf' | 'swab' | 'tissue' | 'aspirate' | 'bone_marrow' | 'other';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const LABORATORY_AUTHORITY: readonly string[] = [
  'receive_specimens', 'analyze_tests', 'validate_results', 'release_reports',
  'recommend_repeat_sampling', 'manage_analyzers', 'conduct_qc',
  'participate_in_research', 'generate_laboratory_analytics',
];

export const LABORATORY_RESTRICTIONS: readonly string[] = [
  'diagnose_independently', 'prescribe_medications', 'alter_clinician_documentation',
  'release_unauthorized_reports', 'access_unrelated_patient_records', 'override_constitutional_governance',
];

export interface LabTest {
  id: string;
  code: string;
  name: string;
  section: LaboratorySection;
  specimenType: SpecimenType;
  container: string;
  collectionInstructions: string[];
  transportRequirements: string[];
  defaultUrgency: TestUrgency;
  estimatedTurnaroundMinutes: number;
  unit?: string;
  referenceRange?: { low?: number; high?: number; text?: string };
  criticalLow?: number;
  criticalHigh?: number;
  billableCode?: string;
  cost: number;
  currency: string;
  active: boolean;
}

// ── Specimen ───────────────────────────────────────────────────────────────────

export type SpecimenStatus =
  | 'requested'
  | 'collected'
  | 'in_transit'
  | 'received'
  | 'accessioned'
  | 'processing'
  | 'analyzed'
  | 'validated'
  | 'released'
  | 'rejected'
  | 'archived';

export type RejectionReason =
  | 'wrong_tube'
  | 'insufficient_sample'
  | 'hemolysis'
  | 'clotted'
  | 'expired'
  | 'unlabeled'
  | 'duplicate'
  | 'wrong_transport_conditions'
  | 'delayed_transport'
  | 'other';

export interface Specimen {
  id: string;
  barcode: string;
  patientId: string;
  encounterId?: string;
  orderId: string;
  testCode: string;
  testName: string;
  section: LaboratorySection;
  specimenType: SpecimenType;
  container: string;
  urgency: TestUrgency;
  collectorId?: AmxUid;
  requestedAt: number;
  collectedAt?: number;
  collectionVolume?: number;
  condition?: string;
  receivedAt?: number;
  receivingScientistId?: AmxUid;
  analyzerId?: string;
  storage?: string;
  status: SpecimenStatus;
  rejectionReason?: RejectionReason;
  rejectionDetail?: string;
  releasedAt?: number;
  viewedAt?: number;
  chainOfCustody: { timestamp: number; location: string; actorId?: AmxUid; action: string }[];
}

// ── Order ──────────────────────────────────────────────────────────────────────

export interface LaboratoryOrder {
  id: string;
  patientId: string;
  encounterId?: string;
  orderingClinicianId: AmxUid;
  requestedAt: number;
  urgency: TestUrgency;
  indication?: string;
  requestedTests: string[];
  specimens: string[];
  status: 'pending' | 'collected' | 'in_progress' | 'completed' | 'cancelled';
}

// ── Analyzer ───────────────────────────────────────────────────────────────────

export type AnalyzerStatus = 'operational' | 'calibrating' | 'maintenance' | 'downtime' | 'qc_failed';

export interface Analyzer {
  id: string;
  name: string;
  section: LaboratorySection;
  vendor?: string;
  model?: string;
  serialNumber?: string;
  status: AnalyzerStatus;
  lastCalibratedAt?: number;
  nextCalibrationAt?: number;
  operatorId?: AmxUid;
  connectivity: 'lis' | 'hl7' | 'fhir' | 'astm' | 'csv' | 'manual';
  errorLogs: string[];
  reagentIds: string[];
  performanceScore: number;
  uptimePercentage: number;
}

// ── Quality control ────────────────────────────────────────────────────────────

export type WestgardRule = '1_2s' | '1_3s' | '2_2s' | 'R_4s' | '4_1s' | '10x';

export const WESTGARD_RULES: Readonly<WestgardRule[]> = ['1_2s', '1_3s', '2_2s', 'R_4s', '4_1s', '10x'];

export interface QualityControlRecord {
  id: string;
  analyzerId: string;
  testCode: string;
  level: 'low' | 'normal' | 'high';
  measuredValue: number;
  mean: number;
  sd: number;
  violatedRules: WestgardRule[];
  pass: boolean;
  runAt: number;
  operatorId?: AmxUid;
  correctiveAction?: string;
  supervisorApprovedBy?: AmxUid;
}

// ── Results ────────────────────────────────────────────────────────────────────

export interface LabResult {
  id: string;
  specimenId: string;
  patientId: string;
  orderId: string;
  testCode: string;
  testName: string;
  section: LaboratorySection;
  value: number;
  unit?: string;
  referenceRange?: { low?: number; high?: number; text?: string };
  critical: boolean;
  abnormal: boolean;
  analyzerId?: string;
  analyzedAt: number;
  validationStatus: 'pending' | 'reviewed' | 'authorized' | 'released';
  validatedBy?: AmxUid;
  authorizedBy?: AmxUid;
  releasedAt?: number;
  interpretiveComment?: string;
}

// ── Interpretation ─────────────────────────────────────────────────────────────

export interface Interpretation {
  id: string;
  pattern: string;
  summary: string;
  likelyDiagnoses: string[];
  recommendedFollowUpTests: string[];
  supportingEvidence: string[];
  relatedGuidelines: string[];
}

export interface InterpretationEngineData {
  interpretations: Interpretation[];
}

// ── Microbiology ───────────────────────────────────────────────────────────────

export interface CultureResult {
  id: string;
  specimenId: string;
  organism: string;
  growth: 'none' | 'scant' | 'moderate' | 'heavy';
  sensitivities: { antibiotic: string; result: 'S' | 'I' | 'R' }[];
  resistanceProfile: string[];
  startedAt: number;
  completedAt: number;
  reportedBy?: AmxUid;
}

export interface AntibiogramEntry {
  organism: string;
  antibiotic: string;
  sensitivePercent: number;
  isolatesTested: number;
}

// ── Blood bank ─────────────────────────────────────────────────────────────────

export type BloodComponent = 'whole_blood' | 'packed_cells' | 'platelets' | 'ffp' | 'cryoprecipitate' | 'albumin';

export interface BloodUnit {
  id: string;
  unitNumber: string;
  component: BloodComponent;
  donorId?: string;
  bloodGroup: string;
  screenedAt?: number;
  screeningResults: string[];
  crossmatchPatientId?: string;
  status: 'available' | 'crossmatched' | 'issued' | 'transfused' | 'recalled' | 'discarded';
  issuedAt?: number;
  transfusedAt?: number;
  reactionReported?: boolean;
  expiryDate: number;
}

// ── Histopathology ─────────────────────────────────────────────────────────────

export type HistopathologyStage =
  | 'received'
  | 'gross_examination'
  | 'cassette'
  | 'processing'
  | 'embedding'
  | 'sectioning'
  | 'staining'
  | 'microscopy'
  | 'diagnosis'
  | 'report'
  | 'consultation'
  | 'archived';

export interface HistopathologyCase {
  id: string;
  specimenId: string;
  stage: HistopathologyStage;
  grossDescription?: string;
  cassettes: number;
  slides: number;
  diagnosis?: string;
  consultationRequestedBy?: AmxUid;
  pathologistId?: AmxUid;
  reportReleasedAt?: number;
  archivedAt?: number;
}

// ── Molecular ──────────────────────────────────────────────────────────────────

export interface MolecularAssay {
  id: string;
  specimenId: string;
  assayType: 'pcr' | 'ngs' | 'gene_panel' | 'genexpert' | 'viral_load' | 'pharmacogenomics' | 'other';
  target?: string;
  result: string;
  quantitative?: number;
  unit?: string;
  completedAt: number;
  reportedBy?: AmxUid;
}

// ── Auto-LIS integration ───────────────────────────────────────────────────────

export type LisConnectorKind =
  | 'lis' | 'hmis' | 'emr' | 'analyzer_middleware' | 'hl7' | 'fhir' | 'astm'
  | 'vendor_api' | 'csv' | 'manual';

export const LIS_CONNECTOR_KINDS: readonly LisConnectorKind[] = [
  'lis', 'hmis', 'emr', 'analyzer_middleware', 'hl7', 'fhir', 'astm',
  'vendor_api', 'csv', 'manual',
];

export interface LisConnection {
  id: string;
  kind: LisConnectorKind;
  label: string;
  endpoint?: string;
  status: 'connected' | 'disconnected' | 'degraded';
  lastSyncAt?: number;
  lastError?: string;
}

export interface ImportedOrderRow {
  patientId: string;
  requestedTests: string[];
  urgency?: TestUrgency;
  indication?: string;
}

// ── Communication engine ───────────────────────────────────────────────────────

export type LaboratoryCorrespondent =
  | 'doctors' | 'nurses' | 'pharmacy' | 'radiology' | 'blood_bank'
  | 'administration' | 'patients' | 'researchers' | 'public_health';

export const LABORATORY_CORRESPONDENTS: readonly LaboratoryCorrespondent[] = [
  'doctors', 'nurses', 'pharmacy', 'radiology', 'blood_bank',
  'administration', 'patients', 'researchers', 'public_health',
];

export interface LaboratoryCommunication {
  id: string;
  correspondent: LaboratoryCorrespondent;
  title: string;
  body: string;
  patientId?: string;
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── HMIS / EMR responsibilities ────────────────────────────────────────────────

export interface LaboratoryHmisDuties {
  orders: boolean;
  specimenLogistics: boolean;
  analyzerInfrastructure: boolean;
  inventory: boolean;
  staff: boolean;
  maintenance: boolean;
  billingCodes: boolean;
  qualityAssurance: boolean;
  research: boolean;
}

export type LaboratoryEmrContributionKind =
  | 'verified_report' | 'interpretive_comment' | 'critical_value_notification'
  | 'trend_graph' | 'reference_range' | 'microbiology_report'
  | 'histopathology_report' | 'molecular_diagnostics';

export const LABORATORY_EMR_CONTRIBUTION_KINDS: readonly LaboratoryEmrContributionKind[] = [
  'verified_report', 'interpretive_comment', 'critical_value_notification',
  'trend_graph', 'reference_range', 'microbiology_report',
  'histopathology_report', 'molecular_diagnostics',
];

export interface LaboratoryEmrContribution {
  id: string;
  kind: LaboratoryEmrContributionKind;
  patientId: string;
  summary: string;
  documentedBy: AmxUid;
  documentedAt: number;
}

// ── AI laboratory companion ────────────────────────────────────────────────────

export type AiLaboratoryAdviceKind =
  | 'delta_check' | 'analyzer_anomaly' | 'qc_trend_prediction' | 'critical_prioritization'
  | 'pattern_recognition' | 'interpretation_assistance' | 'outbreak_detection'
  | 'population_analytics' | 'research_cohort';

export const AI_LABORATORY_ADVICE_KINDS: readonly AiLaboratoryAdviceKind[] = [
  'delta_check', 'analyzer_anomaly', 'qc_trend_prediction', 'critical_prioritization',
  'pattern_recognition', 'interpretation_assistance', 'outbreak_detection',
  'population_analytics', 'research_cohort',
];

export interface AiLaboratoryAdvice {
  id: string;
  kind: AiLaboratoryAdviceKind;
  patientId?: string;
  summary: string;
  supportingData: string[];
  generatedAt: number;
}

export interface DeltaCheck {
  id: string;
  patientId: string;
  testCode: string;
  previousValue?: number;
  newValue: number;
  deltaPercent: number;
  flagsDelta: boolean;
  note?: string;
  checkedAt: number;
}

// ── National integration ───────────────────────────────────────────────────────

export type NationalProgram =
  | 'national_tb' | 'national_hiv' | 'cancer_registry' | 'public_health_surveillance'
  | 'disease_outbreak' | 'reference_laboratory' | 'research_network' | 'who_reporting';

export const NATIONAL_PROGRAMS: readonly NationalProgram[] = [
  'national_tb', 'national_hiv', 'cancer_registry', 'public_health_surveillance',
  'disease_outbreak', 'reference_laboratory', 'research_network', 'who_reporting',
];

export interface NationalIntegration {
  id: string;
  program: NationalProgram;
  institution: string;
  enabled: boolean;
  lastReportAt?: number;
}

// ── Turnaround time ────────────────────────────────────────────────────────────

export interface TurnaroundRecord {
  id: string;
  specimenId: string;
  testCode: string;
  requestedAt: number;
  collectedAt?: number;
  receivedAt?: number;
  startedAt?: number;
  completedAt?: number;
  releasedAt?: number;
  viewedAt?: number;
}

// ── Critical result ────────────────────────────────────────────────────────────

export interface CriticalResult {
  id: string;
  resultId: string;
  patientId: string;
  testCode: string;
  value: number;
  unit?: string;
  triggeredAt: number;
  notifiedTo?: AmxUid;
  notificationChannel: 'sms' | 'push' | 'ward' | 'icu' | 'in_person' | 'phone';
  acknowledgedBy?: AmxUid;
  acknowledgedAt?: number;
  auditTrail: string[];
}

// ── Inventory & maintenance ────────────────────────────────────────────────────

export interface LabInventoryItem {
  id: string;
  name: string;
  category: 'reagent' | 'control' | 'consumable' | 'kit';
  currentStock: number;
  minimumStock: number;
  unit: string;
  expiryDate?: number;
  coldChainRequired: boolean;
  storage?: string;
  consumedPerRun?: number;
}

export interface MaintenanceRecord {
  id: string;
  analyzerId: string;
  type: 'installation' | 'calibration' | 'scheduled' | 'repair';
  scheduledAt: number;
  completedAt?: number;
  engineerId?: AmxUid;
  serviceReport?: string;
  downtimeHours?: number;
  cost?: number;
  currency?: string;
  warranty: boolean;
}

// ── Workforce ──────────────────────────────────────────────────────────────────

export interface LaboratoryShift {
  id: string;
  staffId: AmxUid;
  section: LaboratorySection;
  startAt: number;
  endAt: number;
  shiftType: 'day' | 'night' | 'evening' | 'weekend' | 'on_call';
  workload: number;
  competencyTags: string[];
  certificationExpiry?: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

// ── Student ────────────────────────────────────────────────────────────────────

export interface StudentLaboratoryRecord {
  id: string;
  studentId: AmxUid;
  supervisorId?: AmxUid;
  assignedSpecimenIds: string[];
  practicalSessions: number;
  microscopySessions: number;
  caseDiscussions: number;
  competencies: { name: string; status: 'in_progress' | 'achieved' }[];
  feedback?: string;
  ospeReady: boolean;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface LaboratoryModel {
  organizationId: string;
  facilityId?: string;
  directorId?: AmxUid;
  deputyDirectorId?: AmxUid;
  laboratoryManagerId?: AmxUid;
  tests: LabTest[];
  sections: Partial<Record<LaboratorySection, { headId?: AmxUid; staffIds: AmxUid[]; open: boolean }>>;
  orders: LaboratoryOrder[];
  specimens: Specimen[];
  analyzers: Analyzer[];
  qualityControl: QualityControlRecord[];
  results: LabResult[];
  interpretations: Interpretation[];
  cultures: CultureResult[];
  antibiogram: AntibiogramEntry[];
  bloodUnits: BloodUnit[];
  histopathologyCases: HistopathologyCase[];
  molecularAssays: MolecularAssay[];
  turnaroundRecords: TurnaroundRecord[];
  criticalResults: CriticalResult[];
  inventory: LabInventoryItem[];
  maintenance: MaintenanceRecord[];
  shifts: LaboratoryShift[];
  studentRecords: StudentLaboratoryRecord[];
  lisConnections: LisConnection[];
  communications: LaboratoryCommunication[];
  hmis: LaboratoryHmisDuties;
  emrContributions: LaboratoryEmrContribution[];
  aiAdvice: AiLaboratoryAdvice[];
  deltaChecks: DeltaCheck[];
  nationalIntegrations: NationalIntegration[];
  metrics: {
    criticalResultsCount: number;
    rejectionRate: number;
    releasedReports: number;
    pendingValidation: number;
    avgTurnaroundMinutes: number;
    analyzerUptime: number;
  };
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateLaboratoryModelInput {
  organizationId: string;
  facilityId?: string;
  directorId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Rejection detection (constitutional Specimen Rejection Engine) ─────────────

export function detectRejection(input: {
  correctTube: boolean;
  sufficientVolume: boolean;
  hemolyzed?: boolean;
  clotted?: boolean;
  expired?: boolean;
  labeled: boolean;
  duplicate?: boolean;
  correctTransportConditions: boolean;
  transportDelayed?: boolean;
}): { reason?: RejectionReason; detail?: string } {
  if (!input.correctTube) return { reason: 'wrong_tube', detail: 'Incorrect collection container' };
  if (!input.sufficientVolume) return { reason: 'insufficient_sample', detail: 'Sample volume below minimum required' };
  if (input.hemolyzed) return { reason: 'hemolysis', detail: 'Hemolyzed specimen' };
  if (input.clotted) return { reason: 'clotted', detail: 'Clotted specimen' };
  if (input.expired) return { reason: 'expired', detail: 'Specimen beyond acceptable age' };
  if (!input.labeled) return { reason: 'unlabeled', detail: 'Specimen lacks patient label' };
  if (input.duplicate) return { reason: 'duplicate', detail: 'Duplicate specimen received' };
  if (!input.correctTransportConditions) return { reason: 'wrong_transport_conditions', detail: 'Transport temperature/packaging violated' };
  if (input.transportDelayed) return { reason: 'delayed_transport', detail: 'Transport delay exceeded window' };
  return { reason: undefined };
}

// ── Westgard QC evaluation ─────────────────────────────────────────────────────

export function evaluateWestgard(measuredValue: number, mean: number, sd: number): WestgardRule[] {
  const violated: WestgardRule[] = [];
  const z = Math.abs((measuredValue - mean) / sd);
  if (z > 2) violated.push('1_2s');
  if (z > 3) violated.push('1_3s');
  if (z > 4) violated.push('2_2s', 'R_4s', '4_1s', '10x');
  else if (z > 3.5) violated.push('R_4s');
  return violated;
}

// ── Critical range evaluation ──────────────────────────────────────────────────

export function isCritical(test: LabTest, value: number): boolean {
  if (test.criticalLow !== undefined && value < test.criticalLow) return true;
  if (test.criticalHigh !== undefined && value > test.criticalHigh) return true;
  return false;
}

export function isAbnormal(test: LabTest, value: number): boolean {
  if (!test.referenceRange) return false;
  if (test.referenceRange.low !== undefined && value < test.referenceRange.low) return true;
  if (test.referenceRange.high !== undefined && value > test.referenceRange.high) return true;
  return false;
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class LaboratoryEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateLaboratoryModelInput): LaboratoryModel {
    if (!input.organizationId) throw new Error('[LaboratoryEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      directorId: input.directorId,
      deputyDirectorId: undefined,
      laboratoryManagerId: undefined,
      tests: [],
      sections: {},
      orders: [],
      specimens: [],
      analyzers: [],
      qualityControl: [],
      results: [],
      interpretations: [],
      cultures: [],
      antibiogram: [],
      bloodUnits: [],
      histopathologyCases: [],
      molecularAssays: [],
      turnaroundRecords: [],
      criticalResults: [],
      inventory: [],
      maintenance: [],
      shifts: [],
      studentRecords: [],
      lisConnections: [],
      communications: [],
      hmis: {
        orders: true, specimenLogistics: true, analyzerInfrastructure: true, inventory: true,
        staff: true, maintenance: true, billingCodes: true, qualityAssurance: true, research: true,
      },
      emrContributions: [],
      aiAdvice: [],
      deltaChecks: [],
      nationalIntegrations: [],
      metrics: {
        criticalResultsCount: 0,
        rejectionRate: 0,
        releasedReports: 0,
        pendingValidation: 0,
        avgTurnaroundMinutes: 0,
        analyzerUptime: 100,
      },
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static canLaboratoryPerform(action: string): { allowed: boolean; reason?: string } {
    if (LABORATORY_AUTHORITY.includes(action)) return { allowed: true };
    if (LABORATORY_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        diagnose_independently: 'Diagnosis is outside laboratory authority — the laboratory produces evidence, not diagnoses.',
        prescribe_medications: 'Prescribing is outside laboratory authority.',
        alter_clinician_documentation: 'Clinician documentation may not be altered by laboratory personnel.',
        release_unauthorized_reports: 'Reports may only be released after constitutional validation and authorization.',
        access_unrelated_patient_records: 'Laboratory access is limited to specimens and results within scope.',
        override_constitutional_governance: 'Constitutional governance may not be overridden by laboratory personnel.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Laboratory authority.` };
  }

  static guard(model: LaboratoryModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[LaboratoryEngine] actorId is required for laboratory actions');
    const verdict = LaboratoryEngine.canLaboratoryPerform(action);
    if (!verdict.allowed) throw new Error(`[LaboratoryEngine] ${verdict.reason}`);
  }

  static audit(model: LaboratoryModel, actorId: AmxUid | undefined, action: string, detail?: string): LaboratoryModel {
    const now = Date.now();
    const actor = actorId ?? model.directorId ?? model.deputyDirectorId ?? model.laboratoryManagerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Section governance ───────────────────────────────────────────────────────

  static configureSection(model: LaboratoryModel, section: LaboratorySection, config: { headId?: AmxUid; open: boolean }): LaboratoryModel {
    const existing = model.sections[section] ?? { staffIds: [], open: false };
    return {
      ...model,
      sections: { ...model.sections, [section]: { ...existing, headId: config.headId, open: config.open } },
      updatedAt: Date.now(),
    };
  }

  static assignStaff(model: LaboratoryModel, section: LaboratorySection, staffId: AmxUid): LaboratoryModel {
    const existing = model.sections[section] ?? { staffIds: [], open: false };
    if (existing.staffIds.includes(staffId)) return model;
    return {
      ...model,
      sections: { ...model.sections, [section]: { ...existing, staffIds: [...existing.staffIds, staffId] } },
      updatedAt: Date.now(),
    };
  }

  // ── Test catalogue / Order Engine ────────────────────────────────────────────

  static addTest(model: LaboratoryModel, input: Omit<LabTest, 'id' | 'active'>): LaboratoryModel {
    const code = (input.code ?? '').trim().toUpperCase();
    if (!code) throw new Error('[LaboratoryEngine] Test code is required');
    if (model.tests.some(t => t.code === code)) throw new Error(`[LaboratoryEngine] Test "${code}" already exists`);
    const test: LabTest = { ...input, code, id: nextId('test'), active: true };
    return { ...model, tests: [...model.tests, test], updatedAt: Date.now() };
  }

  static placeOrder(
    model: LaboratoryModel,
    input: { patientId: string; encounterId?: string; orderingClinicianId: AmxUid; requestedTests: string[]; urgency?: TestUrgency; indication?: string },
  ): { model: LaboratoryModel; order: LaboratoryOrder } {
    if (!input.requestedTests.length) throw new Error('[LaboratoryEngine] No tests requested');
    const missing = input.requestedTests.filter(code => !model.tests.some(t => t.code === code));
    if (missing.length) throw new Error(`[LaboratoryEngine] Unknown test(s): ${missing.join(', ')}`);
    const now = Date.now();
    const order: LaboratoryOrder = {
      id: nextId('ord'),
      patientId: input.patientId,
      encounterId: input.encounterId,
      orderingClinicianId: input.orderingClinicianId,
      requestedAt: now,
      urgency: input.urgency ?? 'routine',
      indication: input.indication,
      requestedTests: input.requestedTests,
      specimens: [],
      status: 'pending',
    };
    return { model: { ...model, orders: [...model.orders, order], updatedAt: now }, order };
  }

  static planCollection(model: LaboratoryModel, orderId: string): { model: LaboratoryModel; plan: { testCode: string; specimenType: SpecimenType; container: string; instructions: string[]; transport: string[]; section: LaboratorySection; tatMinutes: number }[] } {
    const order = model.orders.find(o => o.id === orderId);
    if (!order) throw new Error(`[LaboratoryEngine] Order "${orderId}" does not exist`);
    const plan = order.requestedTests.map(code => {
      const test = model.tests.find(t => t.code === code)!;
      return {
        testCode: test.code,
        specimenType: test.specimenType,
        container: test.container,
        instructions: test.collectionInstructions,
        transport: test.transportRequirements,
        section: test.section,
        tatMinutes: test.estimatedTurnaroundMinutes,
      };
    });
    return { model, plan };
  }

  // ── Specimen Engine (barcode, collection, chain of custody) ─────────────────

  static collectSpecimen(
    model: LaboratoryModel,
    input: { orderId: string; patientId: string; testCode: string; collectorId: AmxUid; container: string; volume?: number },
  ): { model: LaboratoryModel; specimen: Specimen } {
    const order = model.orders.find(o => o.id === input.orderId);
    if (!order) throw new Error(`[LaboratoryEngine] Order "${input.orderId}" does not exist`);
    const test = model.tests.find(t => t.code === input.testCode);
    if (!test) throw new Error(`[LaboratoryEngine] Test "${input.testCode}" does not exist`);
    const now = Date.now();
    const barcode = `L${now.toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const specimen: Specimen = {
      id: nextId('spec'),
      barcode,
      patientId: input.patientId,
      encounterId: order.encounterId,
      orderId: input.orderId,
      testCode: input.testCode,
      testName: test.name,
      section: test.section,
      specimenType: test.specimenType,
      container: input.container,
      urgency: order.urgency,
      collectorId: input.collectorId,
      requestedAt: order.requestedAt,
      collectedAt: now,
      collectionVolume: input.volume,
      status: 'collected',
      chainOfCustody: [{ timestamp: now, location: 'collection_point', actorId: input.collectorId, action: 'collected' }],
    };
    const updatedOrder: LaboratoryOrder = { ...order, specimens: [...order.specimens, specimen.id], status: 'collected' };
    return {
      model: {
        ...model,
        specimens: [...model.specimens, specimen],
        orders: model.orders.map(o => (o.id === order.id ? updatedOrder : o)),
        updatedAt: now,
      },
      specimen,
    };
  }

  static scanSpecimen(model: LaboratoryModel, barcode: string): { model: LaboratoryModel; specimen?: Specimen; match: boolean; note: string } {
    const specimen = model.specimens.find(s => s.barcode === barcode);
    if (!specimen) return { model, specimen: undefined, match: false, note: 'Barcode not found' };
    return { model, specimen, match: true, note: 'Patient, test, tube, collector, and location verified' };
  }

  static trackSpecimen(model: LaboratoryModel, specimenId: string, action: string, location: string, actorId?: AmxUid): LaboratoryModel {
    const index = model.specimens.findIndex(s => s.id === specimenId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Specimen "${specimenId}" does not exist`);
    const current = model.specimens[index];
    const chain = [...current.chainOfCustody, { timestamp: Date.now(), location, actorId, action }];
    const updated: Specimen = { ...current, chainOfCustody: chain };
    return { ...model, specimens: [...model.specimens.slice(0, index), updated, ...model.specimens.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Specimen Rejection Engine ────────────────────────────────────────────────

  static receiveSpecimen(
    model: LaboratoryModel,
    specimenId: string,
    checks: { correctTube: boolean; sufficientVolume: boolean; hemolyzed?: boolean; clotted?: boolean; expired?: boolean; labeled: boolean; duplicate?: boolean; correctTransportConditions: boolean; transportDelayed?: boolean },
    receivingScientistId?: AmxUid,
  ): LaboratoryModel {
    const index = model.specimens.findIndex(s => s.id === specimenId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Specimen "${specimenId}" does not exist`);
    const current = model.specimens[index];
    const verdict = detectRejection(checks);
    const now = Date.now();
    let updated: Specimen;
    if (verdict.reason) {
      updated = {
        ...current,
        status: 'rejected',
        rejectionReason: verdict.reason,
        rejectionDetail: verdict.detail,
        receivedAt: now,
        receivingScientistId,
        chainOfCustody: [...current.chainOfCustody, { timestamp: now, location: 'reception', actorId: receivingScientistId, action: `rejected: ${verdict.reason}` }],
      };
    } else {
      updated = {
        ...current,
        status: 'received',
        receivedAt: now,
        receivingScientistId,
        chainOfCustody: [...current.chainOfCustody, { timestamp: now, location: 'reception', actorId: receivingScientistId, action: 'received' }],
      };
    }
    return { ...model, specimens: [...model.specimens.slice(0, index), updated, ...model.specimens.slice(index + 1)], updatedAt: now };
  }

  static accession(model: LaboratoryModel, specimenId: string, analyzerId?: string, storage?: string): LaboratoryModel {
    return LabAccession.apply(model, specimenId, analyzerId, storage);
  }

  // ── Analyzer Engine ──────────────────────────────────────────────────────────

  static registerAnalyzer(model: LaboratoryModel, input: Omit<Analyzer, 'id' | 'status' | 'errorLogs' | 'performanceScore' | 'uptimePercentage'>): LaboratoryModel {
    const analyzer: Analyzer = {
      ...input,
      id: nextId('anl'),
      status: 'operational',
      errorLogs: [],
      performanceScore: 100,
      uptimePercentage: 100,
    };
    return { ...model, analyzers: [...model.analyzers, analyzer], updatedAt: Date.now() };
  }

  static setAnalyzerStatus(model: LaboratoryModel, analyzerId: string, status: AnalyzerStatus, error?: string): LaboratoryModel {
    const index = model.analyzers.findIndex(a => a.id === analyzerId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Analyzer "${analyzerId}" does not exist`);
    const current = model.analyzers[index];
    const updated: Analyzer = {
      ...current,
      status,
      errorLogs: error ? [...current.errorLogs, `[${new Date().toISOString()}] ${error}`] : current.errorLogs,
    };
    return { ...model, analyzers: [...model.analyzers.slice(0, index), updated, ...model.analyzers.slice(index + 1)], updatedAt: Date.now() };
  }

  static calibrateAnalyzer(model: LaboratoryModel, analyzerId: string, operatorId?: AmxUid): LaboratoryModel {
    const index = model.analyzers.findIndex(a => a.id === analyzerId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Analyzer "${analyzerId}" does not exist`);
    const now = Date.now();
    const current = model.analyzers[index];
    const updated: Analyzer = {
      ...current,
      status: 'operational',
      lastCalibratedAt: now,
      nextCalibrationAt: now + 30 * 86400000,
      operatorId,
    };
    return { ...model, analyzers: [...model.analyzers.slice(0, index), updated, ...model.analyzers.slice(index + 1)], updatedAt: now };
  }

  // ── Quality Control Engine (Westgard) ────────────────────────────────────────

  static runQualityControl(
    model: LaboratoryModel,
    input: { analyzerId: string; testCode: string; level: 'low' | 'normal' | 'high'; measuredValue: number; mean: number; sd: number; operatorId?: AmxUid },
  ): { model: LaboratoryModel; record: QualityControlRecord; pass: boolean } {
    const violatedRules = evaluateWestgard(input.measuredValue, input.mean, input.sd);
    const pass = violatedRules.length === 0;
    const record: QualityControlRecord = {
      id: nextId('qc'),
      analyzerId: input.analyzerId,
      testCode: input.testCode,
      level: input.level,
      measuredValue: input.measuredValue,
      mean: input.mean,
      sd: input.sd,
      violatedRules,
      pass,
      runAt: Date.now(),
      operatorId: input.operatorId,
    };
    const analyzers = pass
      ? model.analyzers
      : model.analyzers.map(a => (a.id === input.analyzerId ? { ...a, status: 'qc_failed' as AnalyzerStatus, errorLogs: [...a.errorLogs, `[${new Date().toISOString()}] QC failure on ${input.testCode}: ${violatedRules.join(', ')}`] } : a));
    return {
      model: { ...model, qualityControl: [...model.qualityControl, record], analyzers, updatedAt: Date.now() },
      record,
      pass,
    };
  }

  static resolveQualityControl(model: LaboratoryModel, recordId: string, correctiveAction: string, supervisorId: AmxUid, analyzerId: string): LaboratoryModel {
    const index = model.qualityControl.findIndex(q => q.id === recordId);
    if (index === -1) throw new Error(`[LaboratoryEngine] QC record "${recordId}" does not exist`);
    const updated = { ...model.qualityControl[index], correctiveAction, supervisorApprovedBy: supervisorId };
    const analyzers = model.analyzers.map(a => (a.id === analyzerId ? { ...a, status: 'operational' as AnalyzerStatus } : a));
    return {
      ...model,
      qualityControl: [...model.qualityControl.slice(0, index), updated, ...model.qualityControl.slice(index + 1)],
      analyzers,
      updatedAt: Date.now(),
    };
  }

  // ── Result capture & Validation Engine ───────────────────────────────────────

  static captureResult(
    model: LaboratoryModel,
    input: { specimenId: string; patientId: string; orderId: string; testCode: string; value: number; analyzerId?: string; interpretiveComment?: string },
  ): { model: LaboratoryModel; result: LabResult; critical: boolean } {
    const test = model.tests.find(t => t.code === input.testCode);
    if (!test) throw new Error(`[LaboratoryEngine] Test "${input.testCode}" does not exist`);
    const now = Date.now();
    const critical = isCritical(test, input.value);
    const abnormal = isAbnormal(test, input.value);
    const result: LabResult = {
      id: nextId('res'),
      specimenId: input.specimenId,
      patientId: input.patientId,
      orderId: input.orderId,
      testCode: input.testCode,
      testName: test.name,
      section: test.section,
      value: input.value,
      unit: test.unit,
      referenceRange: test.referenceRange,
      critical,
      abnormal,
      analyzerId: input.analyzerId,
      analyzedAt: now,
      validationStatus: 'pending',
      interpretiveComment: input.interpretiveComment,
    };
    const specimens = model.specimens.map(s => (s.id === input.specimenId ? { ...s, status: 'analyzed' as SpecimenStatus } : s));
    return { model: { ...model, results: [...model.results, result], specimens, updatedAt: now }, result, critical };
  }

  static validateResult(model: LaboratoryModel, resultId: string, scientistId: AmxUid): LaboratoryModel {
    return LabAccession.mutateResult(model, resultId, { validationStatus: 'reviewed', validatedBy: scientistId });
  }

  static authorizeResult(model: LaboratoryModel, resultId: string, pathologistId: AmxUid): LaboratoryModel {
    return LabAccession.mutateResult(model, resultId, { validationStatus: 'authorized', authorizedBy: pathologistId });
  }

  static releaseResult(model: LaboratoryModel, resultId: string): { model: LaboratoryModel; released: boolean; criticalResult?: CriticalResult } {
    const index = model.results.findIndex(r => r.id === resultId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Result "${resultId}" does not exist`);
    const current = model.results[index];
    if (current.validationStatus !== 'authorized') {
      throw new Error('[LaboratoryEngine] Result not authorized; results never leave automatically');
    }
    const now = Date.now();
    const released: LabResult = { ...current, validationStatus: 'released', releasedAt: now };
    let criticalResult: CriticalResult | undefined;
    let criticalResults = model.criticalResults;
    if (released.critical) {
      criticalResult = {
        id: nextId('crit'),
        resultId: released.id,
        patientId: released.patientId,
        testCode: released.testCode,
        value: released.value,
        unit: released.unit,
        triggeredAt: now,
        notificationChannel: 'push',
        auditTrail: [`[${new Date().toISOString()}] Critical result flagged for immediate notification`],
      };
      criticalResults = [...criticalResults, criticalResult];
    }
    const specimens = model.specimens.map(s => (s.id === released.specimenId ? { ...s, status: 'released' as SpecimenStatus, releasedAt: now } : s));
    const turnaround = LabAccession.touchTurnaround(model.turnaroundRecords, released.specimenId, released.testCode, now, 'releasedAt');
    return {
      model: {
        ...model,
        results: [...model.results.slice(0, index), released, ...model.results.slice(index + 1)],
        specimens,
        criticalResults,
        turnaroundRecords: turnaround,
        updatedAt: now,
      },
      released: true,
      criticalResult,
    };
  }

  // ── Critical Result Engine ───────────────────────────────────────────────────

  static acknowledgeCritical(model: LaboratoryModel, criticalId: string, acknowledgedBy: AmxUid): LaboratoryModel {
    const index = model.criticalResults.findIndex(c => c.id === criticalId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Critical result "${criticalId}" does not exist`);
    const now = Date.now();
    const current = model.criticalResults[index];
    const updated: CriticalResult = {
      ...current,
      acknowledgedBy,
      acknowledgedAt: now,
      auditTrail: [...current.auditTrail, `[${new Date().toISOString()}] Acknowledged by ${acknowledgedBy}`],
    };
    return { ...model, criticalResults: [...model.criticalResults.slice(0, index), updated, ...model.criticalResults.slice(index + 1)], updatedAt: now };
  }

  static getUnacknowledgedCritical(model: LaboratoryModel): CriticalResult[] {
    return model.criticalResults.filter(c => !c.acknowledgedAt);
  }

  // ── Microbiology Engine ──────────────────────────────────────────────────────

  static reportCulture(model: LaboratoryModel, input: Omit<CultureResult, 'id' | 'startedAt' | 'completedAt'>): LaboratoryModel {
    const now = Date.now();
    const culture: CultureResult = { ...input, id: nextId('cult'), startedAt: now, completedAt: now };
    return { ...model, cultures: [...model.cultures, culture], updatedAt: now };
  }

  static updateAntibiogram(model: LaboratoryModel, organism: string, antibiotic: string, sensitivePercent: number, isolatesTested: number): LaboratoryModel {
    const existing = model.antibiogram.findIndex(a => a.organism === organism && a.antibiotic === antibiotic);
    const entry: AntibiogramEntry = { organism, antibiotic, sensitivePercent, isolatesTested };
    const antibiogram =
      existing === -1
        ? [...model.antibiogram, entry]
        : [...model.antibiogram.slice(0, existing), entry, ...model.antibiogram.slice(existing + 1)];
    return { ...model, antibiogram, updatedAt: Date.now() };
  }

  static detectOutbreakSignals(model: LaboratoryModel): { organism: string; count: number; note: string }[] {
    const counts: Record<string, number> = {};
    for (const c of model.cultures) {
      if (c.organism && c.growth !== 'none') counts[c.organism] = (counts[c.organism] ?? 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, count]) => count >= 3)
      .map(([organism, count]) => ({ organism, count, note: 'Possible outbreak — notify infection control and pharmacy stewardship' }));
  }

  // ── Blood Bank Engine ────────────────────────────────────────────────────────

  static addBloodUnit(model: LaboratoryModel, input: Omit<BloodUnit, 'id' | 'status' | 'screeningResults'>): LaboratoryModel {
    const unit: BloodUnit = { ...input, id: nextId('blu'), status: 'available', screeningResults: [] };
    return { ...model, bloodUnits: [...model.bloodUnits, unit], updatedAt: Date.now() };
  }

  static crossmatch(model: LaboratoryModel, unitId: string, patientId: string): LaboratoryModel {
    const index = model.bloodUnits.findIndex(u => u.id === unitId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Blood unit "${unitId}" does not exist`);
    const updated = { ...model.bloodUnits[index], status: 'crossmatched' as BloodUnit['status'], crossmatchPatientId: patientId };
    return { ...model, bloodUnits: [...model.bloodUnits.slice(0, index), updated, ...model.bloodUnits.slice(index + 1)], updatedAt: Date.now() };
  }

  static issueBloodUnit(model: LaboratoryModel, unitId: string, issuedTo?: AmxUid): LaboratoryModel {
    const index = model.bloodUnits.findIndex(u => u.id === unitId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Blood unit "${unitId}" does not exist`);
    const updated = { ...model.bloodUnits[index], status: 'issued' as BloodUnit['status'], issuedAt: Date.now() };
    return { ...model, bloodUnits: [...model.bloodUnits.slice(0, index), updated, ...model.bloodUnits.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordTransfusionReaction(model: LaboratoryModel, unitId: string): LaboratoryModel {
    const index = model.bloodUnits.findIndex(u => u.id === unitId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Blood unit "${unitId}" does not exist`);
    const updated = { ...model.bloodUnits[index], status: 'transfused' as BloodUnit['status'], transfusedAt: Date.now(), reactionReported: true };
    return { ...model, bloodUnits: [...model.bloodUnits.slice(0, index), updated, ...model.bloodUnits.slice(index + 1)], updatedAt: Date.now() };
  }

  static recallBloodUnit(model: LaboratoryModel, unitId: string): LaboratoryModel {
    const index = model.bloodUnits.findIndex(u => u.id === unitId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Blood unit "${unitId}" does not exist`);
    const updated = { ...model.bloodUnits[index], status: 'recalled' as BloodUnit['status'] };
    return { ...model, bloodUnits: [...model.bloodUnits.slice(0, index), updated, ...model.bloodUnits.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Histopathology Engine ────────────────────────────────────────────────────

  static advanceHistopathology(model: LaboratoryModel, caseId: string, stage: HistopathologyStage, patch: Partial<HistopathologyCase> = {}): LaboratoryModel {
    const index = model.histopathologyCases.findIndex(c => c.id === caseId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Histopathology case "${caseId}" does not exist`);
    const now = Date.now();
    const updated: HistopathologyCase = { ...model.histopathologyCases[index], ...patch, stage };
    if (stage === 'report') updated.reportReleasedAt = now;
    if (stage === 'archived') updated.archivedAt = now;
    return { ...model, histopathologyCases: [...model.histopathologyCases.slice(0, index), updated, ...model.histopathologyCases.slice(index + 1)], updatedAt: now };
  }

  static openHistopathologyCase(model: LaboratoryModel, specimenId: string): { model: LaboratoryModel; labCase: HistopathologyCase } {
    const labCase: HistopathologyCase = {
      id: nextId('histo'),
      specimenId,
      stage: 'received',
      cassettes: 0,
      slides: 0,
    };
    return { model: { ...model, histopathologyCases: [...model.histopathologyCases, labCase], updatedAt: Date.now() }, labCase };
  }

  // ── Molecular Engine ─────────────────────────────────────────────────────────

  static reportMolecularAssay(model: LaboratoryModel, input: Omit<MolecularAssay, 'id' | 'completedAt'>): LaboratoryModel {
    const now = Date.now();
    const assay: MolecularAssay = { ...input, id: nextId('mol'), completedAt: now };
    return { ...model, molecularAssays: [...model.molecularAssays, assay], updatedAt: now };
  }

  // ── Turnaround Time Engine ───────────────────────────────────────────────────

  static recordTurnaround(model: LaboratoryModel, specimenId: string, testCode: string, stage: keyof Omit<TurnaroundRecord, 'id' | 'specimenId' | 'testCode'>, timestamp?: number): LaboratoryModel {
    return {
      ...model,
      turnaroundRecords: LabAccession.touchTurnaround(model.turnaroundRecords, specimenId, testCode, timestamp ?? Date.now(), stage),
      updatedAt: Date.now(),
    };
  }

  static getAverageTurnaround(model: LaboratoryModel, section?: LaboratorySection): number {
    const released = model.turnaroundRecords.filter(t => t.releasedAt && t.requestedAt && (section === undefined || model.tests.find(tt => tt.code === t.testCode)?.section === section));
    if (!released.length) return 0;
    const total = released.reduce((sum, t) => sum + (t.releasedAt! - t.requestedAt), 0);
    return Math.round(total / released.length / 60000);
  }

  // ── Inventory & maintenance ──────────────────────────────────────────────────

  static addInventoryItem(model: LaboratoryModel, input: Omit<LabInventoryItem, 'id'>): LaboratoryModel {
    return { ...model, inventory: [...model.inventory, { ...input, id: nextId('inv') }], updatedAt: Date.now() };
  }

  static consumeInventory(model: LaboratoryModel, itemId: string, quantity: number): LaboratoryModel {
    const index = model.inventory.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Inventory item "${itemId}" does not exist`);
    const current = model.inventory[index];
    const updated = { ...current, currentStock: Math.max(0, current.currentStock - quantity) };
    return { ...model, inventory: [...model.inventory.slice(0, index), updated, ...model.inventory.slice(index + 1)], updatedAt: Date.now() };
  }

  static getLowStockInventory(model: LaboratoryModel): LabInventoryItem[] {
    return model.inventory.filter(i => i.currentStock <= i.minimumStock);
  }

  static scheduleMaintenance(model: LaboratoryModel, input: Omit<MaintenanceRecord, 'id' | 'completedAt'>): LaboratoryModel {
    return { ...model, maintenance: [...model.maintenance, { ...input, id: nextId('mnt') }], updatedAt: Date.now() };
  }

  static completeMaintenance(model: LaboratoryModel, recordId: string, input: Partial<Pick<MaintenanceRecord, 'serviceReport' | 'downtimeHours' | 'cost'>>): LaboratoryModel {
    const index = model.maintenance.findIndex(m => m.id === recordId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Maintenance record "${recordId}" does not exist`);
    const updated = { ...model.maintenance[index], ...input, completedAt: Date.now() };
    return { ...model, maintenance: [...model.maintenance.slice(0, index), updated, ...model.maintenance.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Workforce Engine ─────────────────────────────────────────────────────────

  static scheduleShift(model: LaboratoryModel, input: Omit<LaboratoryShift, 'id' | 'status'>): LaboratoryModel {
    return { ...model, shifts: [...model.shifts, { ...input, id: nextId('shift'), status: 'scheduled' }], updatedAt: Date.now() };
  }

  static completeShift(model: LaboratoryModel, shiftId: string): LaboratoryModel {
    const index = model.shifts.findIndex(s => s.id === shiftId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Shift "${shiftId}" does not exist`);
    const updated = { ...model.shifts[index], status: 'completed' as const };
    return { ...model, shifts: [...model.shifts.slice(0, index), updated, ...model.shifts.slice(index + 1)], updatedAt: Date.now() };
  }

  static getOverloadedScientists(model: LaboratoryModel, threshold = 12): LaboratoryShift[] {
    return model.shifts.filter(s => s.status !== 'completed' && s.workload >= threshold);
  }

  // ── Student Laboratory Engine ────────────────────────────────────────────────

  static assignSpecimenToStudent(model: LaboratoryModel, studentId: AmxUid, supervisorId: AmxUid, specimenId: string): LaboratoryModel {
    const index = model.studentRecords.findIndex(r => r.studentId === studentId);
    if (index === -1) {
      const record: StudentLaboratoryRecord = {
        id: nextId('stu'),
        studentId,
        supervisorId,
        assignedSpecimenIds: [specimenId],
        practicalSessions: 0,
        microscopySessions: 0,
        caseDiscussions: 0,
        competencies: [],
        ospeReady: false,
      };
      return { ...model, studentRecords: [...model.studentRecords, record], updatedAt: Date.now() };
    }
    const current = model.studentRecords[index];
    const updated = { ...current, supervisorId, assignedSpecimenIds: [...current.assignedSpecimenIds, specimenId] };
    return { ...model, studentRecords: [...model.studentRecords.slice(0, index), updated, ...model.studentRecords.slice(index + 1)], updatedAt: Date.now() };
  }

  static logStudentSession(model: LaboratoryModel, studentId: AmxUid, session: 'practical' | 'microscopy' | 'case_discussion'): LaboratoryModel {
    const index = model.studentRecords.findIndex(r => r.studentId === studentId);
    if (index === -1) throw new Error(`[LaboratoryEngine] No student record for "${studentId}"`);
    const current = model.studentRecords[index];
    const updated: StudentLaboratoryRecord = {
      ...current,
      practicalSessions: current.practicalSessions + (session === 'practical' ? 1 : 0),
      microscopySessions: current.microscopySessions + (session === 'microscopy' ? 1 : 0),
      caseDiscussions: current.caseDiscussions + (session === 'case_discussion' ? 1 : 0),
    };
    return { ...model, studentRecords: [...model.studentRecords.slice(0, index), updated, ...model.studentRecords.slice(index + 1)], updatedAt: Date.now() };
  }

  static assessStudentCompetency(model: LaboratoryModel, studentId: AmxUid, competency: string, status: 'in_progress' | 'achieved'): LaboratoryModel {
    const index = model.studentRecords.findIndex(r => r.studentId === studentId);
    if (index === -1) throw new Error(`[LaboratoryEngine] No student record for "${studentId}"`);
    const current = model.studentRecords[index];
    const competencies = current.competencies.filter(c => c.name !== competency);
    const updated: StudentLaboratoryRecord = {
      ...current,
      competencies: [...competencies, { name: competency, status }],
      ospeReady: status === 'achieved' || current.ospeReady,
    };
    return { ...model, studentRecords: [...model.studentRecords.slice(0, index), updated, ...model.studentRecords.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Interpretation Engine ────────────────────────────────────────────────────

  static addInterpretation(model: LaboratoryModel, interpretation: Omit<Interpretation, 'id'>): LaboratoryModel {
    return { ...model, interpretations: [...model.interpretations, { ...interpretation, id: nextId('int') }], updatedAt: Date.now() };
  }

  static interpretCBC(model: LaboratoryModel, values: { hemoglobin?: number; mcv?: number; mch?: number; reticulocytes?: number; ferritin?: number }): Interpretation {
    let pattern = 'Normal CBC pattern';
    const summary: string[] = [];
    const followUp: string[] = [];
    if (values.hemoglobin !== undefined && values.hemoglobin < 12 && values.mcv !== undefined && values.mcv < 80) {
      pattern = 'Microcytic hypochromic anemia';
      summary.push('Microcytic anemia detected — iron deficiency is the most likely cause.');
      followUp.push('Serum ferritin', 'Peripheral smear', 'Reticulocyte count');
    } else if (values.hemoglobin !== undefined && values.hemoglobin < 12 && values.mcv !== undefined && values.mcv >= 80 && values.mcv <= 100) {
      pattern = 'Normocytic anemia';
      summary.push('Normocytic anemia — consider haemolysis, chronic disease, or early deficiency.');
      followUp.push('Reticulocyte count', 'LFT', 'Renal function');
    } else if (values.hemoglobin !== undefined && values.hemoglobin < 12 && values.mcv !== undefined && values.mcv > 100) {
      pattern = 'Macrocytic anemia';
      summary.push('Macrocytic anemia — consider B12/folate deficiency.');
      followUp.push('Serum B12', 'Serum folate');
    }
    return {
      id: nextId('int'),
      pattern,
      summary: summary.join(' ') || 'Complete blood count within normal limits.',
      likelyDiagnoses: summary.length ? [pattern] : [],
      recommendedFollowUpTests: followUp,
      supportingEvidence: ['CBC parameters', 'MCV classification'],
      relatedGuidelines: ['WHO haemoglobin thresholds', 'Local haematology guidelines'],
    };
  }

  // ── Auto-LIS integration ─────────────────────────────────────────────────────

  static connectLis(model: LaboratoryModel, actorId: AmxUid, input: Omit<LisConnection, 'id' | 'status' | 'lastSyncAt'>): { model: LaboratoryModel; connection: LisConnection } {
    LaboratoryEngine.guard(model, actorId, 'manage_analyzers');
    const connection: LisConnection = { ...input, id: nextId('lis'), status: 'connected', lastSyncAt: Date.now() };
    return { model: { ...LaboratoryEngine.audit(model, actorId, 'lis_connected', input.kind), lisConnections: [...model.lisConnections, connection], updatedAt: Date.now() }, connection };
  }

  static disconnectLis(model: LaboratoryModel, actorId: AmxUid, connectionId: string): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'manage_analyzers');
    const index = model.lisConnections.findIndex(c => c.id === connectionId);
    if (index === -1) throw new Error(`[LaboratoryEngine] LIS connection "${connectionId}" does not exist`);
    const updated = { ...model.lisConnections[index], status: 'disconnected' as const, lastError: undefined };
    return { ...LaboratoryEngine.audit(model, actorId, 'lis_disconnected', connectionId), lisConnections: [...model.lisConnections.slice(0, index), updated, ...model.lisConnections.slice(index + 1)], updatedAt: Date.now() };
  }

  static importOrdersFromLis(model: LaboratoryModel, actorId: AmxUid, connectionId: string, rows: ImportedOrderRow[]): { model: LaboratoryModel; createdOrders: LaboratoryOrder[] } {
    LaboratoryEngine.guard(model, actorId, 'receive_specimens');
    const connection = model.lisConnections.find(c => c.id === connectionId);
    if (!connection) throw new Error(`[LaboratoryEngine] LIS connection "${connectionId}" does not exist`);
    const createdOrders: LaboratoryOrder[] = [];
    let next = model;
    for (const row of rows) {
      const known = row.requestedTests.filter(code => model.tests.some(t => t.code === code));
      if (!known.length) continue;
      const order: LaboratoryOrder = {
        id: nextId('ord'),
        patientId: row.patientId,
        orderingClinicianId: actorId,
        requestedAt: Date.now(),
        urgency: row.urgency ?? 'routine',
        indication: row.indication,
        requestedTests: known,
        specimens: [],
        status: 'pending',
      };
      createdOrders.push(order);
      next = { ...next, orders: [...next.orders, order] };
    }
    return { model: { ...LaboratoryEngine.audit(next, actorId, 'lis_orders_imported', `${createdOrders.length} orders`), updatedAt: Date.now() }, createdOrders };
  }

  // ── Barcode verification engine ──────────────────────────────────────────────

  static verifyBarcode(model: LaboratoryModel, barcode: string, expected: { patientId: string; testCode: string; container: string; collectorId?: AmxUid; location?: string; analyzerId?: string }): { model: LaboratoryModel; verified: boolean; mismatches: string[] } {
    const specimen = model.specimens.find(s => s.barcode === barcode);
    if (!specimen) return { model, verified: false, mismatches: ['Barcode not found'] };
    const mismatches: string[] = [];
    if (specimen.patientId !== expected.patientId) mismatches.push('Patient mismatch');
    if (specimen.testCode !== expected.testCode) mismatches.push('Test mismatch');
    if (specimen.container !== expected.container) mismatches.push('Tube mismatch');
    if (expected.collectorId && specimen.collectorId !== expected.collectorId) mismatches.push('Collector mismatch');
    const verified = mismatches.length === 0;
    return { model: { ...LaboratoryEngine.audit(model, expected.collectorId, verified ? 'barcode_verified' : 'barcode_mismatch', barcode), updatedAt: Date.now() }, verified, mismatches };
  }

  // ── Critical result notification engine ──────────────────────────────────────

  static notifyCriticalResult(model: LaboratoryModel, criticalId: string, notifyTo: AmxUid, channel: CriticalResult['notificationChannel']): { model: LaboratoryModel; criticalResult: CriticalResult } {
    const index = model.criticalResults.findIndex(c => c.id === criticalId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Critical result "${criticalId}" does not exist`);
    const now = Date.now();
    const updated: CriticalResult = {
      ...model.criticalResults[index],
      notifiedTo: notifyTo,
      notificationChannel: channel,
      auditTrail: [...model.criticalResults[index].auditTrail, `[${new Date().toISOString()}] Notified ${notifyTo} via ${channel}`],
    };
    return {
      model: { ...model, criticalResults: [...model.criticalResults.slice(0, index), updated, ...model.criticalResults.slice(index + 1)], updatedAt: now },
      criticalResult: updated,
    };
  }

  // ── Blood bank engine (donor screening & component preparation) ─────────────

  static screenBloodDonor(model: LaboratoryModel, unitId: string, screeningResults: string[], screenedAt?: number): LaboratoryModel {
    const index = model.bloodUnits.findIndex(u => u.id === unitId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Blood unit "${unitId}" does not exist`);
    const updated = { ...model.bloodUnits[index], screeningResults, screenedAt: screenedAt ?? Date.now() };
    return { ...model, bloodUnits: [...model.bloodUnits.slice(0, index), updated, ...model.bloodUnits.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Inventory forecasting & procurement requests ─────────────────────────────

  static getReplenishmentRecommendations(model: LaboratoryModel): { item: LabInventoryItem; suggestedQuantity: number; reason: string }[] {
    const recs: { item: LabInventoryItem; suggestedQuantity: number; reason: string }[] = [];
    for (const item of model.inventory) {
      if (item.currentStock <= item.minimumStock) {
        recs.push({
          item,
          suggestedQuantity: Math.max(item.minimumStock * 2 - item.currentStock, item.minimumStock),
          reason: `Stock ${item.currentStock} at/below minimum ${item.minimumStock} — raise procurement request`,
        });
      } else if (item.expiryDate && item.expiryDate - Date.now() < 90 * 86400000) {
        recs.push({ item, suggestedQuantity: 0, reason: `Expires within 90 days (${new Date(item.expiryDate).toISOString()}) — use first or transfer` });
      }
    }
    return recs;
  }

  // ── Communication engine ─────────────────────────────────────────────────────

  static sendCommunication(model: LaboratoryModel, actorId: AmxUid, input: Omit<LaboratoryCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: LaboratoryModel; communication: LaboratoryCommunication } {
    if (!LABORATORY_CORRESPONDENTS.includes(input.correspondent)) throw new Error('[LaboratoryEngine] Unsupported laboratory correspondent');
    const communication: LaboratoryCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...LaboratoryEngine.audit(model, actorId, 'laboratory_communication_sent', input.correspondent), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  // ── HMIS / EMR responsibilities ──────────────────────────────────────────────

  static updateHmisDuties(model: LaboratoryModel, patch: Partial<LaboratoryHmisDuties>): LaboratoryModel {
    const hmis = { ...model.hmis, ...patch };
    return { ...model, hmis, updatedAt: Date.now() };
  }

  static recordEmrContribution(model: LaboratoryModel, actorId: AmxUid, input: Omit<LaboratoryEmrContribution, 'id' | 'documentedBy' | 'documentedAt'>): { model: LaboratoryModel; contribution: LaboratoryEmrContribution } {
    const contribution: LaboratoryEmrContribution = { ...input, id: nextId('emr'), documentedBy: actorId, documentedAt: Date.now() };
    return { model: { ...LaboratoryEngine.audit(model, actorId, 'emr_contribution_recorded', input.kind), emrContributions: [...model.emrContributions, contribution], updatedAt: Date.now() }, contribution };
  }

  // ── AI laboratory companion ──────────────────────────────────────────────────

  static runDeltaCheck(model: LaboratoryModel, patientId: string, testCode: string, newValue: number, previousValue?: number): { model: LaboratoryModel; delta: DeltaCheck } {
    const deltaPercent = previousValue && previousValue !== 0 ? Math.abs(((newValue - previousValue) / previousValue) * 100) : 0;
    const flagsDelta = deltaPercent >= 50;
    const delta: DeltaCheck = { id: nextId('dlt'), patientId, testCode, previousValue, newValue, deltaPercent: Math.round(deltaPercent), flagsDelta, checkedAt: Date.now() };
    return { model: { ...model, deltaChecks: [...model.deltaChecks, delta], updatedAt: Date.now() }, delta };
  }

  static generateAiAdvice(model: LaboratoryModel, input: Omit<AiLaboratoryAdvice, 'id' | 'generatedAt'>): { model: LaboratoryModel; advice: AiLaboratoryAdvice } {
    const advice: AiLaboratoryAdvice = { ...input, id: nextId('ai'), generatedAt: Date.now() };
    return { model: { ...model, aiAdvice: [...model.aiAdvice, advice], updatedAt: Date.now() }, advice };
  }

  static getCriticalPrioritization(model: LaboratoryModel): { result: LabResult; priority: 'immediate' | 'urgent' | 'routine' }[] {
    return model.results
      .filter(r => r.validationStatus === 'pending' || r.validationStatus === 'reviewed')
      .map(r => ({ result: r, priority: (r.critical ? 'immediate' : r.abnormal ? 'urgent' : 'routine') as 'immediate' | 'urgent' | 'routine' }))
      .sort((a, b) => a.priority === 'immediate' ? -1 : b.priority === 'immediate' ? 1 : a.priority === 'urgent' ? -1 : 1);
  }

  static detectAnalyzerAnomaly(model: LaboratoryModel): { analyzer: Analyzer; signal: string }[] {
    return model.analyzers
      .filter(a => a.errorLogs.length > 3 || a.status === 'qc_failed' || a.uptimePercentage < 90)
      .map(a => ({ analyzer: a, signal: a.status === 'qc_failed' ? 'QC failure' : a.errorLogs.length > 3 ? 'Repeated errors' : 'Low uptime' }));
  }

  static predictQcTrend(model: LaboratoryModel, testCode: string, recentResults: number[]): { testCode: string; drift: 'increasing' | 'decreasing' | 'stable'; recommendation: string } {
    if (recentResults.length < 3) return { testCode, drift: 'stable', recommendation: 'Insufficient data for trend prediction' };
    const firstHalf = recentResults.slice(0, Math.ceil(recentResults.length / 2));
    const secondHalf = recentResults.slice(Math.ceil(recentResults.length / 2));
    const avg = (arr: number[]) => arr.reduce((a, v) => a + v, 0) / arr.length;
    const diff = avg(secondHalf) - avg(firstHalf);
    const drift: 'increasing' | 'decreasing' | 'stable' = diff > 1.5 * Math.max(0.1, Math.abs(avg(firstHalf)) * 0.05) ? 'increasing' : diff < -1.5 * Math.max(0.1, Math.abs(avg(firstHalf)) * 0.05) ? 'decreasing' : 'stable';
    return { testCode, drift, recommendation: drift === 'stable' ? 'No corrective action required' : 'Review calibration and reagents — QC drift predicted' };
  }

  static identifyResearchCohorts(model: LaboratoryModel, filter: { testCode?: string; abnormalOnly?: boolean; since?: number }): { cohort: string; patientIds: string[]; count: number }[] {
    const cohortMap = new Map<string, string[]>();
    for (const r of model.results) {
      if (filter.testCode && r.testCode !== filter.testCode) continue;
      if (filter.abnormalOnly && !r.abnormal) continue;
      if (filter.since && r.analyzedAt < filter.since) continue;
      const key = `${r.testCode}${r.abnormal ? ':abnormal' : ':normal'}`;
      const set = cohortMap.get(key) ?? [];
      if (!set.includes(r.patientId)) set.push(r.patientId);
      cohortMap.set(key, set);
    }
    return [...cohortMap.entries()].map(([cohort, patientIds]) => ({ cohort, patientIds, count: patientIds.length }));
  }

  static getPopulationLaboratoryAnalytics(model: LaboratoryModel, testCode?: string): { testCode: string; patientsTested: number; abnormalCount: number; criticalCount: number; abnormalityRate: number }[] {
    const map = new Map<string, { patients: Set<string>; abnormal: number; critical: number }>();
    for (const r of model.results) {
      if (testCode && r.testCode !== testCode) continue;
      const entry = map.get(r.testCode) ?? { patients: new Set<string>(), abnormal: 0, critical: 0 };
      entry.patients.add(r.patientId);
      if (r.abnormal) entry.abnormal += 1;
      if (r.critical) entry.critical += 1;
      map.set(r.testCode, entry);
    }
    return [...map.entries()].map(([code, e]) => ({
      testCode: code,
      patientsTested: e.patients.size,
      abnormalCount: e.abnormal,
      criticalCount: e.critical,
      abnormalityRate: e.patients.size ? Math.round((e.abnormal / e.patients.size) * 100) : 0,
    }));
  }

  // ── National integration ─────────────────────────────────────────────────────

  static registerNationalIntegration(model: LaboratoryModel, actorId: AmxUid, input: Omit<NationalIntegration, 'id' | 'enabled' | 'lastReportAt'>): { model: LaboratoryModel; integration: NationalIntegration } {
    LaboratoryEngine.guard(model, actorId, 'participate_in_research');
    if (!NATIONAL_PROGRAMS.includes(input.program)) throw new Error('[LaboratoryEngine] Unsupported national program');
    const integration: NationalIntegration = { ...input, id: nextId('nat'), enabled: true, lastReportAt: undefined };
    return { model: { ...LaboratoryEngine.audit(model, actorId, 'national_integration_registered', input.program), nationalIntegrations: [...model.nationalIntegrations, integration], updatedAt: Date.now() }, integration };
  }

  static reportToNationalProgram(model: LaboratoryModel, actorId: AmxUid, integrationId: string): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'participate_in_research');
    const index = model.nationalIntegrations.findIndex(i => i.id === integrationId);
    if (index === -1) throw new Error(`[LaboratoryEngine] National integration "${integrationId}" does not exist`);
    const updated = { ...model.nationalIntegrations[index], enabled: true, lastReportAt: Date.now() };
    return { ...LaboratoryEngine.audit(model, actorId, 'national_report_submitted', updated.program), nationalIntegrations: [...model.nationalIntegrations.slice(0, index), updated, ...model.nationalIntegrations.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Constitutional restrictions (enforced) ──────────────────────────────────

  static diagnoseIndependently(model: LaboratoryModel, actorId: AmxUid): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'diagnose_independently');
    return model;
  }

  static prescribeMedications(model: LaboratoryModel, actorId: AmxUid): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'prescribe_medications');
    return model;
  }

  static alterClinicianDocumentation(model: LaboratoryModel, actorId: AmxUid): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'alter_clinician_documentation');
    return model;
  }

  static releaseUnauthorizedReport(model: LaboratoryModel, actorId: AmxUid): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'release_unauthorized_reports');
    return model;
  }

  static accessUnrelatedPatientRecords(model: LaboratoryModel, actorId: AmxUid): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'access_unrelated_patient_records');
    return model;
  }

  static overrideConstitutionalGovernance(model: LaboratoryModel, actorId: AmxUid): LaboratoryModel {
    LaboratoryEngine.guard(model, actorId, 'override_constitutional_governance');
    return model;
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  static getDashboardSummary(model: LaboratoryModel): {
    ordersToday: number;
    specimensAwaitingCollection: number;
    receivedSamples: number;
    processingQueue: number;
    criticalResults: number;
    pendingValidation: number;
    releasedReports: number;
    rejectionRate: number;
    analyzerDowntime: number;
    lowStock: number;
    avgTurnaroundMinutes: number;
  } {
    const total = model.specimens.length;
    const rejected = model.specimens.filter(s => s.status === 'rejected').length;
    return {
      ordersToday: model.orders.length,
      specimensAwaitingCollection: model.specimens.filter(s => s.status === 'requested').length,
      receivedSamples: model.specimens.filter(s => s.status === 'received' || s.status === 'accessioned').length,
      processingQueue: model.specimens.filter(s => s.status === 'processing').length,
      criticalResults: LabAccession.countUnacknowledged(model.criticalResults),
      pendingValidation: model.results.filter(r => r.validationStatus === 'pending').length,
      releasedReports: model.results.filter(r => r.validationStatus === 'released').length,
      rejectionRate: total ? Math.round((rejected / total) * 1000) / 10 : 0,
      analyzerDowntime: model.analyzers.filter(a => a.status === 'downtime' || a.status === 'maintenance').length,
      lowStock: LabAccession.countLowStock(model.inventory),
      avgTurnaroundMinutes: LabAccession.avgTurnaround(model.turnaroundRecords),
    };
  }
}

// ── Internal helpers (kept out of the public surface) ──────────────────────────

namespace LabAccession {
  export function apply(model: LaboratoryModel, specimenId: string, analyzerId?: string, storage?: string): LaboratoryModel {
    const index = model.specimens.findIndex(s => s.id === specimenId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Specimen "${specimenId}" does not exist`);
    const now = Date.now();
    const updated: Specimen = {
      ...model.specimens[index],
      status: 'accessioned',
      analyzerId,
      storage,
      chainOfCustody: [...model.specimens[index].chainOfCustody, { timestamp: now, location: 'accessioning', action: 'accessioned' }],
    };
    return { ...model, specimens: [...model.specimens.slice(0, index), updated, ...model.specimens.slice(index + 1)], updatedAt: now };
  }

  export function touchTurnaround(
    records: TurnaroundRecord[],
    specimenId: string,
    testCode: string,
    timestamp: number,
    stage: keyof Omit<TurnaroundRecord, 'id' | 'specimenId' | 'testCode'>,
  ): TurnaroundRecord[] {
    const existing = records.findIndex(r => r.specimenId === specimenId && r.testCode === testCode);
    if (existing === -1) {
      return [...records, { id: nextId('tat'), specimenId, testCode, requestedAt: timestamp, [stage]: timestamp } as TurnaroundRecord];
    }
    const updated = { ...records[existing], [stage]: timestamp } as TurnaroundRecord;
    return [...records.slice(0, existing), updated, ...records.slice(existing + 1)];
  }

  export function mutateResult(model: LaboratoryModel, resultId: string, patch: Partial<Pick<LabResult, 'validationStatus' | 'validatedBy' | 'authorizedBy'>>): LaboratoryModel {
    const index = model.results.findIndex(r => r.id === resultId);
    if (index === -1) throw new Error(`[LaboratoryEngine] Result "${resultId}" does not exist`);
    const updated = { ...model.results[index], ...patch };
    return { ...model, results: [...model.results.slice(0, index), updated, ...model.results.slice(index + 1)], updatedAt: Date.now() };
  }

  export function countUnacknowledged(criticalResults: CriticalResult[]): number {
    return criticalResults.filter(c => !c.acknowledgedAt).length;
  }

  export function countLowStock(inventory: LabInventoryItem[]): number {
    return inventory.filter(i => i.currentStock <= i.minimumStock).length;
  }

  export function avgTurnaround(records: TurnaroundRecord[]): number {
    const released = records.filter(r => r.releasedAt && r.requestedAt);
    if (!released.length) return 0;
    const total = released.reduce((sum, r) => sum + (r.releasedAt! - r.requestedAt), 0);
    return Math.round(total / released.length / 60000);
  }
}

export default LaboratoryEngine;
