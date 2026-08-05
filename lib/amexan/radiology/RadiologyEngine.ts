// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Radiology & Medical Imaging Engine (BOOK VI-L) — Engine No. 22
//
// "The Engine of Imaging Intelligence, Visualization, and Anatomical Decision
// Support"
//
// Radiology does not exist to create images. It exists to create visual clinical
// intelligence. Every image becomes searchable, analyzable, explainable,
// comparable, teachable, and interoperable.
//
// Constitutional imaging lifecycle:
//   Clinical Order → Appropriateness Check → Scheduling → Preparation →
//   Patient Verification → Image Acquisition → Quality Assessment →
//   Post-processing → Radiologist Reporting → Critical Notification →
//   EMR Integration → Longitudinal Comparison → Research Archive
//
// Nothing bypasses constitutional governance. AI never replaces the
// radiologist. This engine is pure and deterministic; persistence is
// orchestrated by the provisioning conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Hierarchy ──────────────────────────────────────────────────────────────────

export type RadiologyRole =
  | 'chief_radiologist'
  | 'deputy_chief_radiologist'
  | 'radiology_manager'
  | 'consultant_radiologist'
  | 'subspecialty_radiologist'
  | 'resident'
  | 'radiographer'
  | 'sonographer'
  | 'ct_technologist'
  | 'mri_technologist'
  | 'interventional_radiologist'
  | 'nuclear_medicine_team'
  | 'biomedical_engineer'
  | 'pacs_administrator'
  | 'student';

export const RADIOLOGY_ROLE_LEVELS: Readonly<Record<RadiologyRole, number>> = {
  chief_radiologist: 14,
  deputy_chief_radiologist: 13,
  radiology_manager: 12,
  consultant_radiologist: 12,
  subspecialty_radiologist: 11,
  resident: 6,
  radiographer: 8,
  sonographer: 8,
  ct_technologist: 7,
  mri_technologist: 7,
  interventional_radiologist: 11,
  nuclear_medicine_team: 10,
  biomedical_engineer: 8,
  pacs_administrator: 7,
  student: 3,
};

// ── Imaging sections ───────────────────────────────────────────────────────────

export type ImagingSection =
  | 'general_xray'
  | 'fluoroscopy'
  | 'ultrasound'
  | 'doppler'
  | 'echocardiography'
  | 'ct'
  | 'mri'
  | 'mammography'
  | 'dexa'
  | 'nuclear_medicine'
  | 'pet_ct'
  | 'interventional_radiology'
  | 'cardiac_imaging'
  | 'obstetric_imaging'
  | 'pediatric_imaging'
  | 'trauma_imaging'
  | 'research_imaging';

export const IMAGING_SECTIONS: Readonly<ImagingSection[]> = [
  'general_xray', 'fluoroscopy', 'ultrasound', 'doppler', 'echocardiography',
  'ct', 'mri', 'mammography', 'dexa', 'nuclear_medicine', 'pet_ct',
  'interventional_radiology', 'cardiac_imaging', 'obstetric_imaging',
  'pediatric_imaging', 'trauma_imaging', 'research_imaging',
];

export type ImagingModality =
  | 'xray' | 'fluoroscopy' | 'ultrasound' | 'doppler' | 'echo' | 'ct' | 'cta'
  | 'mri' | 'mra' | 'mammography' | 'dexa' | 'nuclear' | 'pet' | 'pet_ct'
  | 'pcr_intervention' | 'portable';

export type StudyUrgency = 'emergency' | 'stat' | 'urgent' | 'routine' | 'elective' | 'follow_up';

export type ContrastAgent = 'none' | 'iodinated' | 'gadolinium' | 'barium' | 'microbubble' | 'radioactive';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const RADIOLOGY_AUTHORITY: readonly string[] = [
  'interpret_imaging', 'approve_reports', 'recommend_further_imaging',
  'perform_image_guided_procedures', 'teach', 'research',
  'participate_in_mdt', 'lead_imaging_quality',
];

export const RADIOLOGY_RESTRICTIONS: readonly string[] = [
  'diagnose_outside_imaging_evidence', 'prescribe_medications',
  'override_constitutional_governance', 'modify_clinician_documentation',
  'access_unrelated_patient_records', 'release_unauthorized_reports',
];

export interface ImagingProtocol {
  id: string;
  code: string;
  name: string;
  section: ImagingSection;
  modality: ImagingModality;
  contrast: ContrastAgent;
  defaultUrgency: StudyUrgency;
  preparationInstructions: string[];
  contraindications: string[];
  radiationExposureMsv?: number;
  pediatricAdjustment?: string;
  estimatedTurnaroundMinutes: number;
  requiresConsent: boolean;
  active: boolean;
}

// ── Imaging order ──────────────────────────────────────────────────────────────

export interface ImagingOrder {
  id: string;
  patientId: string;
  encounterId?: string;
  orderingClinicianId: AmxUid;
  protocolCode: string;
  clinicalIndication: string;
  urgency: StudyUrgency;
  requestedAt: number;
  appropriateness: { passed: boolean; note: string; citations: string[] };
  status: 'pending' | 'scheduled' | 'prepared' | 'acquired' | 'reported' | 'cancelled';
  studyId?: string;
}

// ── Study (DICOM hierarchy) ────────────────────────────────────────────────────

export type StudyStatus = 'scheduled' | 'acquired' | 'qc_pending' | 'post_processing' | 'reporting' | 'reported' | 'released' | 'archived';

export interface ImagingStudy {
  id: string;
  orderId: string;
  patientId: string;
  encounterId?: string;
  protocolCode: string;
  studyDate: number;
  series: ImagingSeries[];
  pacsStudyInstanceUid?: string;
  dicomwebEndpoint?: string;
  technologistId?: AmxUid;
  roomId?: string;
  machineId?: string;
  exposure?: { kv: number; ma: number; mas: number };
  contrastAgent?: ContrastAgent;
  radiationDoseMsv?: number;
  qualityScore?: number;
  repeatImages: number;
  reportId?: string;
  status: StudyStatus;
}

export interface ImagingSeries {
  id: string;
  seriesInstanceUid?: string;
  description: string;
  modality: ImagingModality;
  imageCount: number;
  slices?: number;
  view?: string;
  acquiredAt: number;
  annotations: string[];
  measurements: { name: string; value: number; unit?: string }[];
}

// ── Reports ────────────────────────────────────────────────────────────────────

export type ReportFormat = 'structured' | 'free_text';

export interface StructuredSections {
  indication: string;
  technique: string;
  findings: { section: string; text: string }[];
  impression: string;
  recommendations: string[];
  criticalAlerts: string[];
}

export interface ImagingReport {
  id: string;
  studyId: string;
  patientId: string;
  format: ReportFormat;
  structured?: StructuredSections;
  freeText?: string;
  radiologistId: AmxUid;
  draftedAt: number;
  approvedAt?: number;
  releasedAt?: number;
  critical: boolean;
  criticalNotification?: { alertedAt: number; acknowledgedBy?: AmxUid; acknowledgedAt?: number; auditTrail: string[] };
}

// ── Critical findings ──────────────────────────────────────────────────────────

export interface CriticalFinding {
  id: string;
  reportId: string;
  patientId: string;
  studyId: string;
  finding: string;
  severity: 'urgent' | 'emergency' | 'life_threatening';
  alertChannels: string[];
  alertedAt: number;
  acknowledgedBy?: AmxUid;
  acknowledgedAt?: number;
}

// ── Equipment ──────────────────────────────────────────────────────────────────

export type EquipmentStatus = 'operational' | 'maintenance' | 'calibration' | 'downtime';

export interface ImagingEquipment {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  section: ImagingSection;
  modality: ImagingModality;
  roomId?: string;
  status: EquipmentStatus;
  utilizationPercent: number;
  radiationMonitoring?: string;
  warrantyUntil?: number;
  lastMaintenanceAt?: number;
  nextMaintenanceAt?: number;
  errorLogs: string[];
}

// ── Teaching ───────────────────────────────────────────────────────────────────

export interface TeachingCase {
  id: string;
  studyId: string;
  title: string;
  annotations: string[];
  learningPoints: string[];
  audience: ('residents' | 'students' | 'radiographers' | 'consultants')[];
  createdBy: AmxUid;
  createdAt: number;
}

// ── Radiation safety engine ────────────────────────────────────────────────────

export interface RadiationExposureRecord {
  id: string;
  patientId: string;
  modality: ImagingModality;
  doseMsv: number;
  bodyRegion: string;
  recordedAt: number;
}

export type RadiationRiskBand = 'low' | 'moderate' | 'elevated' | 'high';

// ── Contrast safety engine ─────────────────────────────────────────────────────

export interface ContrastSafetyCheck {
  id: string;
  patientId: string;
  contrast: ContrastAgent;
  checks: { name: string; status: 'pass' | 'warn' | 'fail'; detail?: string }[];
  cleared: boolean;
  checkedAt: number;
}

// ── PACS / RIS integration ─────────────────────────────────────────────────────

export type PacsConnectorKind = 'pacs' | 'dicomweb' | 'vendor_neutral_archive' | 'ris' | 'hl7' | 'fhir';

export interface ImagingSystemConnection {
  id: string;
  kind: PacsConnectorKind;
  label: string;
  endpoint?: string;
  status: 'connected' | 'disconnected' | 'degraded';
  lastSyncAt?: number;
  lastError?: string;
}

// ── AI imaging companion ───────────────────────────────────────────────────────

export type AiImagingFindingKind =
  | 'fracture_detection' | 'stroke_detection' | 'pulmonary_embolism' | 'pneumonia'
  | 'tuberculosis' | 'breast_lesion' | 'brain_hemorrhage' | 'lung_nodule'
  | 'bone_age' | 'tumor_segmentation' | 'measurement_automation';

export interface AiImagingFinding {
  id: string;
  studyId: string;
  patientId: string;
  kind: AiImagingFindingKind;
  region?: string;
  confidencePercent: number;
  summary: string;
  radiologistOverride?: string;
  generatedAt: number;
}

// ── 3D reconstruction engine ───────────────────────────────────────────────────

export type ReconstructionPurpose =
  | 'ct_angiography' | 'orthopedic_planning' | 'trauma' | 'neurosurgery'
  | 'cardiac_imaging' | 'cancer_surgery' | 'printing' | 'ar_vr_visualization';

export interface Reconstruction3D {
  id: string;
  studyId: string;
  purpose: ReconstructionPurpose;
  technique: 'volume_rendering' | 'surface_rendering' | 'mip' | 'mpr' | 'segmentation';
  segments: string[];
  exportable: boolean;
  createdAt: number;
}

// ── Interventional radiology engine ────────────────────────────────────────────

export type InterventionalStage =
  | 'request' | 'planning' | 'consent' | 'procedure' | 'recovery' | 'follow_up' | 'completed';

export interface InterventionalProcedure {
  id: string;
  patientId: string;
  procedureName: string;
  stage: InterventionalStage;
  plannedAt: number;
  devices: string[];
  imagingUsed: string[];
  complications: string[];
  consentObtained: boolean;
  operatorId?: AmxUid;
}

// ── Ultrasound engine ──────────────────────────────────────────────────────────

export type UltrasoundApplication =
  | 'general' | 'obstetric' | 'gynecology' | 'fast' | 'echocardiography'
  | 'doppler' | 'musculoskeletal' | 'pediatric' | 'interventional_guidance';

export interface UltrasoundStudy {
  id: string;
  patientId: string;
  application: UltrasoundApplication;
  technique?: string;
  findings: string[];
  sonographerId?: AmxUid;
  performedAt: number;
}

// ── Research engine ────────────────────────────────────────────────────────────

export interface ImagingResearchCohort {
  id: string;
  title: string;
  studyIds: string[];
  radiomics: boolean;
  aiDataset: boolean;
  clinicalTrial: boolean;
  anonymized: boolean;
  createdBy: AmxUid;
  createdAt: number;
}

// ── Patient imaging portal ─────────────────────────────────────────────────────

export interface PatientPortalAccess {
  id: string;
  patientId: string;
  studyId: string;
  canViewImages: boolean;
  canViewReport: boolean;
  canDownloadDicom: boolean;
  secureShareEnabled: boolean;
  grantedAt: number;
}

// ── Workforce engine ───────────────────────────────────────────────────────────

export interface RadiologyShift {
  id: string;
  staffId: AmxUid;
  role: RadiologyRole;
  section: ImagingSection;
  startAt: number;
  endAt: number;
  onCall: boolean;
  workload: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

// ── Communication ──────────────────────────────────────────────────────────────

export type RadiologyCorrespondent =
  | 'emergency' | 'medicine' | 'surgery' | 'orthopedics' | 'icu'
  | 'obstetrics' | 'pediatrics' | 'oncology' | 'pathology'
  | 'laboratory' | 'patients' | 'researchers';

export const RADIOLOGY_CORRESPONDENTS: readonly RadiologyCorrespondent[] = [
  'emergency', 'medicine', 'surgery', 'orthopedics', 'icu',
  'obstetrics', 'pediatrics', 'oncology', 'pathology',
  'laboratory', 'patients', 'researchers',
];

export interface RadiologyCommunication {
  id: string;
  correspondent: RadiologyCorrespondent;
  title: string;
  body: string;
  patientId?: string;
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── HMIS / EMR responsibilities ────────────────────────────────────────────────

export interface RadiologyHmisDuties {
  scheduling: boolean;
  equipment: boolean;
  rooms: boolean;
  staff: boolean;
  consumables: boolean;
  billing: boolean;
  maintenance: boolean;
  quality: boolean;
  research: boolean;
}

export type RadiologyEmrContributionKind =
  | 'imaging_report' | 'critical_finding' | 'measurements' | 'structured_report'
  | 'longitudinal_history' | 'procedure_documentation' | 'ai_finding' | 'clinical_recommendation';

export interface RadiologyEmrContribution {
  id: string;
  kind: RadiologyEmrContributionKind;
  patientId: string;
  summary: string;
  documentedBy: AmxUid;
  documentedAt: number;
}

// ── Imaging analytics ──────────────────────────────────────────────────────────

export interface RadiologyAnalytics {
  volume: number;
  avgTurnaroundMinutes: number;
  machineUtilization: number;
  repeatRate: number;
  criticalFindingsCount: number;
  subspecialtyWorkload: Record<string, number>;
  teachingCases: number;
  revenue: number;
  researchOutput: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface RadiologyModel {
  organizationId: string;
  facilityId?: string;
  chiefRadiologistId?: AmxUid;
  deputyChiefRadiologistId?: AmxUid;
  radiologyManagerId?: AmxUid;
  protocols: ImagingProtocol[];
  orders: ImagingOrder[];
  studies: ImagingStudy[];
  reports: ImagingReport[];
  criticalFindings: CriticalFinding[];
  equipment: ImagingEquipment[];
  teachingCases: TeachingCase[];
  radiationExposure: RadiationExposureRecord[];
  contrastChecks: ContrastSafetyCheck[];
  systemConnections: ImagingSystemConnection[];
  aiFindings: AiImagingFinding[];
  reconstructions: Reconstruction3D[];
  interventional: InterventionalProcedure[];
  ultrasoundStudies: UltrasoundStudy[];
  researchCohorts: ImagingResearchCohort[];
  portalAccess: PatientPortalAccess[];
  shifts: RadiologyShift[];
  communications: RadiologyCommunication[];
  hmis: RadiologyHmisDuties;
  emrContributions: RadiologyEmrContribution[];
  analytics: RadiologyAnalytics;
  metrics: {
    repeatRate: number;
    avgTurnaroundMinutes: number;
    machineUtilization: number;
    criticalFindingsCount: number;
  };
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateRadiologyModelInput {
  organizationId: string;
  facilityId?: string;
  chiefRadiologistId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Appropriateness (Canadian CT Head Rule for mild headache example) ──────────

export interface AppropriatenessInput {
  protocolCode: string;
  indication: string;
  ageYears?: number;
  trauma?: boolean;
  features?: { glasgowBelow15?: boolean; vomiting?: boolean; ageOver60?: boolean; drugsAlcohol?: boolean; focalNeuroDeficit?: boolean; amnesia?: boolean };
}

export function assessAppropriateness(input: AppropriatenessInput): { passed: boolean; note: string; citations: string[] } {
  const code = input.protocolCode.toLowerCase();
  const lowRiskHeadache = /headache|head|ct head/i.test(input.indication) && !input.trauma && !input.features?.focalNeuroDeficit;
  if (code.startsWith('ct') && code.includes('head') && lowRiskHeadache) {
    return {
      passed: false,
      note: 'CT not routinely indicated for mild headache without red flags. Consider observation or alternative imaging. Decision remains with the clinician.',
      citations: ['Canadian CT Head Rule', 'NICE headache guidelines'],
    };
  }
  return { passed: true, note: 'Appropriate for clinical indication', citations: ['Local imaging appropriateness guidelines'] };
}

// ── Patient preparation generation ─────────────────────────────────────────────

export function generatePreparation(protocol: ImagingProtocol, patient: { renalClearanceMlMin?: number; contrastAllergy?: boolean; pregnant?: boolean; metalImplants?: boolean; pacemaker?: boolean; claustrophobia?: boolean }): string[] {
  const prep: string[] = [...protocol.preparationInstructions];
  switch (protocol.modality) {
    case 'mri':
      if (patient.metalImplants) prep.push('Verify implant compatibility prior to scan');
      if (patient.pacemaker) prep.push('Pacemaker — MRI conditional only; cardiology review required');
      if (patient.claustrophobia) prep.push('Consider sedation and reassure patient');
      if (protocol.contrast === 'gadolinium' && patient.pregnant) prep.push('Gadolinium contraindicated in pregnancy');
      break;
    case 'ct':
      if (protocol.contrast === 'iodinated') {
        if (patient.renalClearanceMlMin !== undefined && patient.renalClearanceMlMin < 30) prep.push('Iodinated contrast requires nephrology review / alternative imaging');
        if (patient.contrastAllergy) prep.push('Contrast allergy — premedication or alternative modality');
        prep.push('Check renal function, hydrate before and after');
      }
      if (patient.pregnant) prep.push('Pregnancy — reassess justification for ionizing radiation');
      break;
    case 'ultrasound':
      prep.push('Follow specific ultrasound preparation (full bladder / fasting)');
      break;
    default:
      break;
  }
  return prep;
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class RadiologyEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateRadiologyModelInput): RadiologyModel {
    if (!input.organizationId) throw new Error('[RadiologyEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefRadiologistId: input.chiefRadiologistId,
      deputyChiefRadiologistId: undefined,
      radiologyManagerId: undefined,
      protocols: [],
      orders: [],
      studies: [],
      reports: [],
      criticalFindings: [],
      equipment: [],
      teachingCases: [],
      radiationExposure: [],
      contrastChecks: [],
      systemConnections: [],
      aiFindings: [],
      reconstructions: [],
      interventional: [],
      ultrasoundStudies: [],
      researchCohorts: [],
      portalAccess: [],
      shifts: [],
      communications: [],
      hmis: {
        scheduling: true, equipment: true, rooms: true, staff: true, consumables: true,
        billing: true, maintenance: true, quality: true, research: true,
      },
      emrContributions: [],
      analytics: {
        volume: 0, avgTurnaroundMinutes: 0, machineUtilization: 0, repeatRate: 0,
        criticalFindingsCount: 0, subspecialtyWorkload: {}, teachingCases: 0,
        revenue: 0, researchOutput: 0,
      },
      metrics: { repeatRate: 0, avgTurnaroundMinutes: 0, machineUtilization: 0, criticalFindingsCount: 0 },
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static canRadiologyPerform(action: string): { allowed: boolean; reason?: string } {
    if (RADIOLOGY_AUTHORITY.includes(action)) return { allowed: true };
    if (RADIOLOGY_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        diagnose_outside_imaging_evidence: 'Radiology diagnoses must be grounded in imaging evidence.',
        prescribe_medications: 'Prescribing is outside radiology authority unless jurisdiction permits.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        modify_clinician_documentation: 'Clinician documentation may not be modified by radiology.',
        access_unrelated_patient_records: 'Access is limited to imaging-related records in scope.',
        release_unauthorized_reports: 'Reports may only be released after approval by the reporting radiologist.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Radiology authority.` };
  }

  static guard(model: RadiologyModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[RadiologyEngine] actorId is required for radiology actions');
    const verdict = RadiologyEngine.canRadiologyPerform(action);
    if (!verdict.allowed) throw new Error(`[RadiologyEngine] ${verdict.reason}`);
  }

  static audit(model: RadiologyModel, actorId: AmxUid | undefined, action: string, detail?: string): RadiologyModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefRadiologistId ?? model.deputyChiefRadiologistId ?? model.radiologyManagerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Protocol catalogue / Order Engine ────────────────────────────────────────

  static addProtocol(model: RadiologyModel, input: Omit<ImagingProtocol, 'id' | 'active'>): RadiologyModel {
    const code = (input.code ?? '').trim().toUpperCase();
    if (!code) throw new Error('[RadiologyEngine] Protocol code is required');
    if (model.protocols.some(p => p.code === code)) throw new Error(`[RadiologyEngine] Protocol "${code}" already exists`);
    return { ...model, protocols: [...model.protocols, { ...input, code, id: nextId('proto'), active: true }], updatedAt: Date.now() };
  }

  static placeOrder(
    model: RadiologyModel,
    input: { patientId: string; encounterId?: string; orderingClinicianId: AmxUid; protocolCode: string; clinicalIndication: string; urgency?: StudyUrgency; patientContext?: Parameters<typeof assessAppropriateness>[0] },
  ): { model: RadiologyModel; order: ImagingOrder; appropriateness: { passed: boolean; note: string; citations: string[] } } {
    const protocol = model.protocols.find(p => p.code === input.protocolCode);
    if (!protocol) throw new Error(`[RadiologyEngine] Protocol "${input.protocolCode}" does not exist`);
    const appropriateness = assessAppropriateness({ protocolCode: input.protocolCode, indication: input.clinicalIndication, ...input.patientContext });
    const now = Date.now();
    const order: ImagingOrder = {
      id: nextId('ro'),
      patientId: input.patientId,
      encounterId: input.encounterId,
      orderingClinicianId: input.orderingClinicianId,
      protocolCode: input.protocolCode,
      clinicalIndication: input.clinicalIndication,
      urgency: input.urgency ?? protocol.defaultUrgency,
      requestedAt: now,
      appropriateness,
      status: 'pending',
    };
    return { model: { ...model, orders: [...model.orders, order], updatedAt: now }, order, appropriateness };
  }

  static scheduleStudy(model: RadiologyModel, orderId: string, machineId?: string, roomId?: string): { model: RadiologyModel; study: ImagingStudy } {
    const order = model.orders.find(o => o.id === orderId);
    if (!order) throw new Error(`[RadiologyEngine] Order "${orderId}" does not exist`);
    const now = Date.now();
    const study: ImagingStudy = {
      id: nextId('study'),
      orderId: order.id,
      patientId: order.patientId,
      encounterId: order.encounterId,
      protocolCode: order.protocolCode,
      studyDate: now,
      series: [],
      technologistId: undefined,
      roomId,
      machineId,
      repeatImages: 0,
      status: 'scheduled',
    };
    return {
      model: {
        ...model,
        orders: model.orders.map(o => (o.id === orderId ? { ...o, status: 'scheduled' as const, studyId: study.id } : o)),
        studies: [...model.studies, study],
        updatedAt: now,
      },
      study,
    };
  }

  static generatePreparation(model: RadiologyModel, protocolCode: string, patient: Parameters<typeof generatePreparation>[1]): string[] {
    const protocol = model.protocols.find(p => p.code === protocolCode);
    if (!protocol) throw new Error(`[RadiologyEngine] Protocol "${protocolCode}" does not exist`);
    return generatePreparation(protocol, patient);
  }

  static markPrepared(model: RadiologyModel, orderId: string): RadiologyModel {
    return RadiologyEngine.patchOrder(model, orderId, { status: 'prepared' });
  }

  private static patchOrder(model: RadiologyModel, orderId: string, patch: Partial<Pick<ImagingOrder, 'status'>>): RadiologyModel {
    const index = model.orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`[RadiologyEngine] Order "${orderId}" does not exist`);
    const updated = { ...model.orders[index], ...patch };
    return { ...model, orders: [...model.orders.slice(0, index), updated, ...model.orders.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Acquisition Engine (DICOM) ───────────────────────────────────────────────

  static acquireSeries(
    model: RadiologyModel,
    studyId: string,
    input: { technologistId: AmxUid; description: string; modality: ImagingModality; imageCount: number; slices?: number; view?: string; radiationDoseMsv?: number; exposure?: ImagingStudy['exposure']; qualityScore?: number; repeat?: boolean },
  ): { model: RadiologyModel; study: ImagingStudy } {
    const index = model.studies.findIndex(s => s.id === studyId);
    if (index === -1) throw new Error(`[RadiologyEngine] Study "${studyId}" does not exist`);
    const current = model.studies[index];
    const now = Date.now();
    const series: ImagingSeries = {
      id: nextId('series'),
      description: input.description,
      modality: input.modality,
      imageCount: input.imageCount,
      slices: input.slices,
      view: input.view,
      acquiredAt: now,
      annotations: [],
      measurements: [],
    };
    const updated: ImagingStudy = {
      ...current,
      technologistId: input.technologistId,
      exposure: input.exposure ?? current.exposure,
      radiationDoseMsv: input.radiationDoseMsv ?? current.radiationDoseMsv,
      qualityScore: input.qualityScore ?? current.qualityScore,
      repeatImages: current.repeatImages + (input.repeat ? 1 : 0),
      series: [...current.series, series],
      status: 'acquired',
    };
    return { model: { ...model, studies: [...model.studies.slice(0, index), updated, ...model.studies.slice(index + 1)], updatedAt: now }, study: updated };
  }

  static postProcessStudy(model: RadiologyModel, studyId: string, reconstruction: '3d' | 'mpr' | 'mip' | 'angiography'): RadiologyModel {
    const index = model.studies.findIndex(s => s.id === studyId);
    if (index === -1) throw new Error(`[RadiologyEngine] Study "${studyId}" does not exist`);
    const updated = { ...model.studies[index], status: 'post_processing' as const };
    return { ...model, studies: [...model.studies.slice(0, index), updated, ...model.studies.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Reporting Engine ─────────────────────────────────────────────────────────

  static draftReport(
    model: RadiologyModel,
    input: { studyId: string; radiologistId: AmxUid; format: ReportFormat; structured?: StructuredSections; freeText?: string; critical: boolean },
  ): { model: RadiologyModel; report: ImagingReport } {
    const study = model.studies.find(s => s.id === input.studyId);
    if (!study) throw new Error(`[RadiologyEngine] Study "${input.studyId}" does not exist`);
    const now = Date.now();
    const report: ImagingReport = {
      id: nextId('rpt'),
      studyId: input.studyId,
      patientId: study.patientId,
      format: input.format,
      structured: input.structured,
      freeText: input.freeText,
      radiologistId: input.radiologistId,
      draftedAt: now,
      critical: input.critical,
    };
    return {
      model: {
        ...model,
        reports: [...model.reports, report],
        studies: model.studies.map(s => (s.id === input.studyId ? { ...s, reportId: report.id, status: 'reporting' as StudyStatus } : s)),
        updatedAt: now,
      },
      report,
    };
  }

  static approveReport(model: RadiologyModel, reportId: string, radiologistId: AmxUid): RadiologyModel {
    const index = model.reports.findIndex(r => r.id === reportId);
    if (index === -1) throw new Error(`[RadiologyEngine] Report "${reportId}" does not exist`);
    const current = model.reports[index];
    if (current.radiologistId !== radiologistId) {
      throw new Error('[RadiologyEngine] Only the reporting radiologist may approve the report');
    }
    const updated = { ...current, approvedAt: Date.now() };
    return { ...model, reports: [...model.reports.slice(0, index), updated, ...model.reports.slice(index + 1)], updatedAt: Date.now() };
  }

  static releaseReport(model: RadiologyModel, reportId: string): { model: RadiologyModel; criticalFindings: CriticalFinding[] } {
    const index = model.reports.findIndex(r => r.id === reportId);
    if (index === -1) throw new Error(`[RadiologyEngine] Report "${reportId}" does not exist`);
    const current = model.reports[index];
    if (!current.approvedAt) throw new Error('[RadiologyEngine] Report must be approved before release');
    const now = Date.now();
    const released = { ...current, releasedAt: now };
    const newFindings: CriticalFinding[] = [];
    if (current.critical) {
      newFindings.push({
        id: nextId('crit'),
        reportId: reportId,
        patientId: current.patientId,
        studyId: current.studyId,
        finding: current.structured?.criticalAlerts.join('; ') || current.structured?.impression || 'Critical imaging finding',
        severity: 'urgent',
        alertChannels: ['emergency', 'ordering_doctor', 'ward'],
        alertedAt: now,
      });
    }
    const studies = model.studies.map(s => (s.id === current.studyId ? { ...s, status: 'released' as StudyStatus } : s));
    return {
      model: {
        ...model,
        reports: [...model.reports.slice(0, index), released, ...model.reports.slice(index + 1)],
        criticalFindings: [...model.criticalFindings, ...newFindings],
        studies,
        updatedAt: now,
      },
      criticalFindings: newFindings,
    };
  }

  // ── Critical Findings Engine ─────────────────────────────────────────────────

  static acknowledgeCriticalFinding(model: RadiologyModel, findingId: string, acknowledgedBy: AmxUid): RadiologyModel {
    const index = model.criticalFindings.findIndex(f => f.id === findingId);
    if (index === -1) throw new Error(`[RadiologyEngine] Critical finding "${findingId}" does not exist`);
    const current = model.criticalFindings[index];
    const updated = { ...current, acknowledgedBy, acknowledgedAt: Date.now() };
    return { ...model, criticalFindings: [...model.criticalFindings.slice(0, index), updated, ...model.criticalFindings.slice(index + 1)], updatedAt: Date.now() };
  }

  static getUnacknowledgedCritical(model: RadiologyModel): CriticalFinding[] {
    return model.criticalFindings.filter(f => !f.acknowledgedAt);
  }

  // ── Comparison Engine ────────────────────────────────────────────────────────

  static compareStudies(model: RadiologyModel, patientId: string, protocolCode: string): { priorStudy?: ImagingStudy; currentStudy?: ImagingStudy; summary: string[] } {
    const studies = model.studies.filter(s => s.patientId === patientId && s.protocolCode === protocolCode).sort((a, b) => a.studyDate - b.studyDate);
    if (studies.length < 2) {
      return { currentStudy: studies[studies.length - 1], summary: ['Not enough prior studies for longitudinal comparison'] };
    }
    const currentStudy = studies[studies.length - 1];
    const priorStudy = studies[studies.length - 2];
    const notes: string[] = [];
    for (const s of currentStudy.series) {
      const prior = priorStudy.series.find(p => p.description === s.description);
      if (prior) notes.push(`${s.description}: ${prior.imageCount} → ${s.imageCount} images; slice count ${prior.slices ?? 'n/a'} → ${s.slices ?? 'n/a'}`);
    }
    return { priorStudy, currentStudy, summary: notes.length ? notes : ['No quantifiable trend detected across studies'] };
  }

  // ── Equipment Engine ─────────────────────────────────────────────────────────

  static registerEquipment(model: RadiologyModel, input: Omit<ImagingEquipment, 'id' | 'status' | 'utilizationPercent' | 'errorLogs'>): RadiologyModel {
    return {
      ...model,
      equipment: [...model.equipment, { ...input, id: nextId('eq'), status: 'operational', utilizationPercent: 0, errorLogs: [] }],
      updatedAt: Date.now(),
    };
  }

  static setEquipmentStatus(model: RadiologyModel, equipmentId: string, status: EquipmentStatus, error?: string): RadiologyModel {
    const index = model.equipment.findIndex(e => e.id === equipmentId);
    if (index === -1) throw new Error(`[RadiologyEngine] Equipment "${equipmentId}" does not exist`);
    const current = model.equipment[index];
    const updated = { ...current, status, errorLogs: error ? [...current.errorLogs, `[${new Date().toISOString()}] ${error}`] : current.errorLogs };
    return { ...model, equipment: [...model.equipment.slice(0, index), updated, ...model.equipment.slice(index + 1)], updatedAt: Date.now() };
  }

  static scheduleMaintenance(model: RadiologyModel, equipmentId: string, nextMaintenanceAt: number): RadiologyModel {
    const index = model.equipment.findIndex(e => e.id === equipmentId);
    if (index === -1) throw new Error(`[RadiologyEngine] Equipment "${equipmentId}" does not exist`);
    const updated = { ...model.equipment[index], nextMaintenanceAt };
    return { ...model, equipment: [...model.equipment.slice(0, index), updated, ...model.equipment.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Teaching Engine ──────────────────────────────────────────────────────────

  static createTeachingCase(model: RadiologyModel, input: Omit<TeachingCase, 'id' | 'createdAt'>): RadiologyModel {
    return { ...model, teachingCases: [...model.teachingCases, { ...input, id: nextId('teach'), createdAt: Date.now() }], updatedAt: Date.now() };
  }

  // ── Radiation Safety Engine ──────────────────────────────────────────────────

  static recordRadiationExposure(model: RadiologyModel, actorId: AmxUid, input: Omit<RadiationExposureRecord, 'id' | 'recordedAt'>): { model: RadiologyModel; exposure: RadiationExposureRecord } {
    RadiologyEngine.guard(model, actorId, 'lead_imaging_quality');
    const exposure: RadiationExposureRecord = { ...input, id: nextId('rad'), recordedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'radiation_exposure_recorded', input.bodyRegion), radiationExposure: [...model.radiationExposure, exposure], updatedAt: Date.now() }, exposure };
  }

  static getLifetimeExposure(model: RadiologyModel, patientId: string): { totalMsv: number; band: RadiationRiskBand; notes: string[] } {
    const records = model.radiationExposure.filter(r => r.patientId === patientId);
    const totalMsv = records.reduce((a, r) => a + r.doseMsv, 0);
    const band: RadiationRiskBand = totalMsv > 100 ? 'high' : totalMsv > 50 ? 'elevated' : totalMsv > 20 ? 'moderate' : 'low';
    const notes: string[] = [];
    if (records.some(r => r.doseMsv >= 20)) notes.push('Individual high-dose examination — justify and document');
    if (totalMsv > 20) notes.push('Lifetime exposure above ALARA baseline — optimize future examinations');
    return { totalMsv: Math.round(totalMsv * 100) / 100, band, notes };
  }

  static checkAlara(model: RadiologyModel, studyId: string): { alaraCompliant: boolean; note: string } {
    const study = model.studies.find(s => s.id === studyId);
    if (!study) throw new Error(`[RadiologyEngine] Study "${studyId}" does not exist`);
    const repeatImages = study.repeatImages;
    return {
      alaraCompliant: repeatImages <= 2,
      note: repeatImages > 2 ? `High repeat count (${repeatImages}) — review technique and protocols to minimize radiation` : 'Repeat rate within ALARA target',
    };
  }

  // ── Contrast Safety Engine ───────────────────────────────────────────────────

  static runContrastSafetyCheck(model: RadiologyModel, actorId: AmxUid, input: {
    patientId: string;
    contrast: ContrastAgent;
    contrastAllergy?: boolean;
    previousReaction?: boolean;
    renalClearanceMlMin?: number;
    onMetformin?: boolean;
  }): { model: RadiologyModel; check: ContrastSafetyCheck } {
    RadiologyEngine.guard(model, actorId, 'lead_imaging_quality');
    const checks: ContrastSafetyCheck['checks'] = [
      { name: 'Contrast allergy', status: input.contrastAllergy ? 'warn' : 'pass', detail: input.contrastAllergy ? 'Known allergy — premedication or alternative modality' : undefined },
      { name: 'Previous reaction', status: input.previousReaction ? 'warn' : 'pass', detail: input.previousReaction ? 'Prior contrast reaction on record' : undefined },
      { name: 'Renal function', status: input.renalClearanceMlMin !== undefined && input.renalClearanceMlMin < 30 ? 'fail' : input.renalClearanceMlMin !== undefined && input.renalClearanceMlMin < 45 ? 'warn' : 'pass', detail: input.renalClearanceMlMin !== undefined && input.renalClearanceMlMin < 45 ? `CrCl ${input.renalClearanceMlMin} mL/min — renal impairment risk` : undefined },
      { name: 'Metformin', status: input.onMetformin ? 'warn' : 'pass', detail: input.onMetformin ? 'Hold metformin around contrast; monitor renal function' : undefined },
      { name: 'Hydration plan', status: 'warn', detail: 'Ensure pre- and post-procedure hydration' },
      { name: 'Emergency medications', status: 'pass', detail: 'Emergency medications and observation available per protocol' },
    ];
    const cleared = !checks.some(c => c.status === 'fail');
    const check: ContrastSafetyCheck = { id: nextId('cs'), patientId: input.patientId, contrast: input.contrast, checks, cleared, checkedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'contrast_safety_check', input.contrast), contrastChecks: [...model.contrastChecks, check], updatedAt: Date.now() }, check };
  }

  // ── DICOM / PACS / RIS Integration Engine ────────────────────────────────────

  static connectSystem(model: RadiologyModel, actorId: AmxUid, input: Omit<ImagingSystemConnection, 'id' | 'status' | 'lastSyncAt'>): { model: RadiologyModel; connection: ImagingSystemConnection } {
    RadiologyEngine.guard(model, actorId, 'lead_imaging_quality');
    const connection: ImagingSystemConnection = { ...input, id: nextId('sys'), status: 'connected', lastSyncAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'imaging_system_connected', input.kind), systemConnections: [...model.systemConnections, connection], updatedAt: Date.now() }, connection };
  }

  static disconnectSystem(model: RadiologyModel, actorId: AmxUid, connectionId: string): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'lead_imaging_quality');
    const index = model.systemConnections.findIndex(c => c.id === connectionId);
    if (index === -1) throw new Error(`[RadiologyEngine] Connection "${connectionId}" does not exist`);
    const updated = { ...model.systemConnections[index], status: 'disconnected' as const, lastError: undefined };
    return { ...RadiologyEngine.audit(model, actorId, 'imaging_system_disconnected', connectionId), systemConnections: [...model.systemConnections.slice(0, index), updated, ...model.systemConnections.slice(index + 1)], updatedAt: Date.now() };
  }

  static registerDicomStudy(model: RadiologyModel, studyId: string, studyInstanceUid: string, dicomwebEndpoint?: string): RadiologyModel {
    const index = model.studies.findIndex(s => s.id === studyId);
    if (index === -1) throw new Error(`[RadiologyEngine] Study "${studyId}" does not exist`);
    const updated = { ...model.studies[index], pacsStudyInstanceUid: studyInstanceUid, dicomwebEndpoint };
    return { ...model, studies: [...model.studies.slice(0, index), updated, ...model.studies.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── AI Imaging Companion ─────────────────────────────────────────────────────

  static recordAiFinding(model: RadiologyModel, actorId: AmxUid, input: Omit<AiImagingFinding, 'id' | 'generatedAt'>): { model: RadiologyModel; finding: AiImagingFinding } {
    RadiologyEngine.guard(model, actorId, 'interpret_imaging');
    const finding: AiImagingFinding = { ...input, id: nextId('ai'), generatedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'ai_finding_recorded', input.kind), aiFindings: [...model.aiFindings, finding], updatedAt: Date.now() }, finding };
  }

  static getHighConfidenceAiFindings(model: RadiologyModel, threshold = 90): AiImagingFinding[] {
    return model.aiFindings.filter(f => f.confidencePercent >= threshold);
  }

  static addAiRadiologistOverride(model: RadiologyModel, actorId: AmxUid, findingId: string, override: string): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'interpret_imaging');
    const index = model.aiFindings.findIndex(f => f.id === findingId);
    if (index === -1) throw new Error(`[RadiologyEngine] AI finding "${findingId}" does not exist`);
    const updated = { ...model.aiFindings[index], radiologistOverride: override };
    return { ...RadiologyEngine.audit(model, actorId, 'ai_finding_overridden', findingId), aiFindings: [...model.aiFindings.slice(0, index), updated, ...model.aiFindings.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── 3D Reconstruction Engine ─────────────────────────────────────────────────

  static createReconstruction(model: RadiologyModel, actorId: AmxUid, input: Omit<Reconstruction3D, 'id' | 'createdAt'>): { model: RadiologyModel; reconstruction: Reconstruction3D } {
    RadiologyEngine.guard(model, actorId, 'interpret_imaging');
    const reconstruction: Reconstruction3D = { ...input, id: nextId('3d'), createdAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'reconstruction_created', input.purpose), reconstructions: [...model.reconstructions, reconstruction], updatedAt: Date.now() }, reconstruction };
  }

  // ── Interventional Radiology Engine ──────────────────────────────────────────

  static planInterventional(model: RadiologyModel, actorId: AmxUid, input: Omit<InterventionalProcedure, 'id' | 'stage' | 'devices' | 'imagingUsed' | 'complications' | 'consentObtained' | 'plannedAt'>): { model: RadiologyModel; procedure: InterventionalProcedure } {
    RadiologyEngine.guard(model, actorId, 'perform_image_guided_procedures');
    const procedure: InterventionalProcedure = { ...input, id: nextId('ir'), stage: 'request', devices: [], imagingUsed: [], complications: [], consentObtained: false, plannedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'interventional_planned', input.procedureName), interventional: [...model.interventional, procedure], updatedAt: Date.now() }, procedure };
  }

  static advanceInterventional(model: RadiologyModel, actorId: AmxUid, procedureId: string, stage: InterventionalStage, patch: Partial<Pick<InterventionalProcedure, 'devices' | 'imagingUsed' | 'complications' | 'consentObtained'>> = {}): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'perform_image_guided_procedures');
    const index = model.interventional.findIndex(p => p.id === procedureId);
    if (index === -1) throw new Error(`[RadiologyEngine] Interventional procedure "${procedureId}" does not exist`);
    const updated = { ...model.interventional[index], ...patch, stage };
    return { ...RadiologyEngine.audit(model, actorId, 'interventional_advanced', stage), interventional: [...model.interventional.slice(0, index), updated, ...model.interventional.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Ultrasound Engine ────────────────────────────────────────────────────────

  static recordUltrasoundStudy(model: RadiologyModel, actorId: AmxUid, input: Omit<UltrasoundStudy, 'id' | 'performedAt'>): { model: RadiologyModel; study: UltrasoundStudy } {
    RadiologyEngine.guard(model, actorId, 'interpret_imaging');
    const study: UltrasoundStudy = { ...input, id: nextId('us'), performedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'ultrasound_study_recorded', input.application), ultrasoundStudies: [...model.ultrasoundStudies, study], updatedAt: Date.now() }, study };
  }

  // ── Research Engine ──────────────────────────────────────────────────────────

  static createResearchCohort(model: RadiologyModel, actorId: AmxUid, input: Omit<ImagingResearchCohort, 'id' | 'createdAt'>): { model: RadiologyModel; cohort: ImagingResearchCohort } {
    RadiologyEngine.guard(model, actorId, 'research');
    const cohort: ImagingResearchCohort = { ...input, id: nextId('rc'), createdAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'research_cohort_created', input.title), researchCohorts: [...model.researchCohorts, cohort], analytics: { ...model.analytics, researchOutput: model.analytics.researchOutput + 1 }, updatedAt: Date.now() }, cohort };
  }

  static getAnonymizedExports(model: RadiologyModel): { cohort: ImagingResearchCohort; anonymized: boolean }[] {
    return model.researchCohorts.filter(c => c.anonymized).map(cohort => ({ cohort, anonymized: true }));
  }

  // ── Patient Imaging Portal ──────────────────────────────────────────────────

  static grantPortalAccess(model: RadiologyModel, actorId: AmxUid, input: Omit<PatientPortalAccess, 'id' | 'grantedAt'>): { model: RadiologyModel; access: PatientPortalAccess } {
    RadiologyEngine.guard(model, actorId, 'recommend_further_imaging');
    const access: PatientPortalAccess = { ...input, id: nextId('port'), grantedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'portal_access_granted', input.patientId), portalAccess: [...model.portalAccess, access], updatedAt: Date.now() }, access };
  }

  static getPatientPortalAccess(model: RadiologyModel, patientId: string): PatientPortalAccess[] {
    return model.portalAccess.filter(a => a.patientId === patientId);
  }

  // ── Workforce Engine ─────────────────────────────────────────────────────────

  static scheduleShift(model: RadiologyModel, input: Omit<RadiologyShift, 'id' | 'status'>): RadiologyModel {
    return { ...model, shifts: [...model.shifts, { ...input, id: nextId('shift'), status: 'scheduled' }], updatedAt: Date.now() };
  }

  static completeShift(model: RadiologyModel, shiftId: string): RadiologyModel {
    const index = model.shifts.findIndex(s => s.id === shiftId);
    if (index === -1) throw new Error(`[RadiologyEngine] Shift "${shiftId}" does not exist`);
    const updated = { ...model.shifts[index], status: 'completed' as const };
    return { ...model, shifts: [...model.shifts.slice(0, index), updated, ...model.shifts.slice(index + 1)], updatedAt: Date.now() };
  }

  static getReportingBacklogByRole(model: RadiologyModel): { role: RadiologyRole; backlog: number }[] {
    const roles = new Set(model.shifts.map(s => s.role));
    return [...roles].map(role => ({ role, backlog: model.studies.filter(s => s.status === 'reporting' || s.status === 'acquired').length }));
  }

  static getOnCallRadiologists(model: RadiologyModel): RadiologyShift[] {
    return model.shifts.filter(s => s.onCall && s.status !== 'completed');
  }

  // ── Communication Engine ─────────────────────────────────────────────────────

  static sendCommunication(model: RadiologyModel, actorId: AmxUid, input: Omit<RadiologyCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: RadiologyModel; communication: RadiologyCommunication } {
    if (!RADIOLOGY_CORRESPONDENTS.includes(input.correspondent)) throw new Error('[RadiologyEngine] Unsupported radiology correspondent');
    const communication: RadiologyCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'radiology_communication_sent', input.correspondent), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  // ── HMIS / EMR responsibilities ──────────────────────────────────────────────

  static updateHmisDuties(model: RadiologyModel, patch: Partial<RadiologyHmisDuties>): RadiologyModel {
    const hmis = { ...model.hmis, ...patch };
    return { ...model, hmis, updatedAt: Date.now() };
  }

  static recordEmrContribution(model: RadiologyModel, actorId: AmxUid, input: Omit<RadiologyEmrContribution, 'id' | 'documentedBy' | 'documentedAt'>): { model: RadiologyModel; contribution: RadiologyEmrContribution } {
    const contribution: RadiologyEmrContribution = { ...input, id: nextId('emr'), documentedBy: actorId, documentedAt: Date.now() };
    return { model: { ...RadiologyEngine.audit(model, actorId, 'emr_contribution_recorded', input.kind), emrContributions: [...model.emrContributions, contribution], updatedAt: Date.now() }, contribution };
  }

  // ── Imaging Analytics ────────────────────────────────────────────────────────

  static recomputeAnalytics(model: RadiologyModel): RadiologyModel {
    const subspecialtyWorkload: Record<string, number> = {};
    for (const s of model.studies) {
      const protocol = model.protocols.find(p => p.code === s.protocolCode);
      const section = protocol?.section ?? 'unknown';
      subspecialtyWorkload[section] = (subspecialtyWorkload[section] ?? 0) + 1;
    }
    const released = model.reports.filter(r => r.releasedAt && r.draftedAt);
    const avgTurnaroundMinutes = released.length ? Math.round(released.reduce((a, r) => a + (r.releasedAt! - r.draftedAt), 0) / released.length / 60000) : 0;
    const totalAcquisitions = model.studies.reduce((a, s) => a + s.series.length + s.repeatImages, 0);
    const repeatRate = totalAcquisitions ? Math.round((model.studies.reduce((a, s) => a + s.repeatImages, 0) / totalAcquisitions) * 100) : 0;
    const machineUtilization = model.equipment.length ? Math.round(model.equipment.reduce((a, e) => a + e.utilizationPercent, 0) / model.equipment.length) : 0;
    const revenue = model.orders.length * 100;
    const analytics: RadiologyAnalytics = {
      volume: model.studies.length,
      avgTurnaroundMinutes,
      machineUtilization,
      repeatRate,
      criticalFindingsCount: model.criticalFindings.length,
      subspecialtyWorkload,
      teachingCases: model.teachingCases.length,
      revenue,
      researchOutput: model.researchCohorts.length,
    };
    return { ...model, analytics, metrics: { repeatRate, avgTurnaroundMinutes, machineUtilization, criticalFindingsCount: model.criticalFindings.length }, updatedAt: Date.now() };
  }

  static getAnalytics(model: RadiologyModel): RadiologyAnalytics {
    return { ...model.analytics };
  }

  // ── Constitutional restrictions (enforced) ──────────────────────────────────

  static diagnoseOutsideImagingEvidence(model: RadiologyModel, actorId: AmxUid): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'diagnose_outside_imaging_evidence');
    return model;
  }

  static prescribeMedications(model: RadiologyModel, actorId: AmxUid): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'prescribe_medications');
    return model;
  }

  static overrideConstitutionalGovernance(model: RadiologyModel, actorId: AmxUid): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'override_constitutional_governance');
    return model;
  }

  static modifyClinicianDocumentation(model: RadiologyModel, actorId: AmxUid): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'modify_clinician_documentation');
    return model;
  }

  static accessUnrelatedPatientRecords(model: RadiologyModel, actorId: AmxUid): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'access_unrelated_patient_records');
    return model;
  }

  static releaseUnauthorizedReport(model: RadiologyModel, actorId: AmxUid): RadiologyModel {
    RadiologyEngine.guard(model, actorId, 'release_unauthorized_reports');
    return model;
  }

  // ── Read conveniences & analytics ────────────────────────────────────────────

  static getReportingBacklog(model: RadiologyModel): ImagingStudy[] {
    return model.studies.filter(s => s.status === 'reporting' || s.status === 'post_processing' || s.status === 'acquired');
  }

  static getEquipmentDowntime(model: RadiologyModel): ImagingEquipment[] {
    return model.equipment.filter(e => e.status === 'downtime' || e.status === 'maintenance');
  }

  static getDashboardSummary(model: RadiologyModel): {
    requestsToday: number;
    waitingPatients: number;
    scheduledScans: number;
    emergencyQueue: number;
    scanningRooms: number;
    pendingReporting: number;
    criticalFindings: number;
    equipmentStatus: number;
    teachingCases: number;
    repeatRate: number;
    radiationAlerts: number;
    contrastIssues: number;
    aiFindings: number;
    interventionalProcedures: number;
    machineUtilization: number;
    avgTurnaroundMinutes: number;
  } {
    const highExposure = model.radiationExposure.filter(r => r.doseMsv >= 20).length;
    return {
      requestsToday: model.orders.length,
      waitingPatients: model.orders.filter(o => o.status === 'pending' || o.status === 'prepared').length,
      scheduledScans: model.studies.filter(s => s.status === 'scheduled').length,
      emergencyQueue: model.orders.filter(o => o.urgency === 'emergency' || o.urgency === 'stat').length,
      scanningRooms: new Set(model.studies.map(s => s.roomId)).size,
      pendingReporting: RadiologyEngine.getReportingBacklog(model).length,
      criticalFindings: RadiologyEngine.getUnacknowledgedCritical(model).length,
      equipmentStatus: RadiologyEngine.getEquipmentDowntime(model).length,
      teachingCases: model.teachingCases.length,
      repeatRate: model.metrics.repeatRate,
      radiationAlerts: highExposure,
      contrastIssues: model.contrastChecks.filter(c => !c.cleared).length,
      aiFindings: model.aiFindings.length,
      interventionalProcedures: model.interventional.filter(p => p.stage !== 'completed').length,
      machineUtilization: model.metrics.machineUtilization,
      avgTurnaroundMinutes: model.metrics.avgTurnaroundMinutes,
    };
  }
}

export default RadiologyEngine;
