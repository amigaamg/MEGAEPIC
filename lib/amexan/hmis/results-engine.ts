// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book VIII: Universal Results Engine
// Every result passes through a complete lifecycle from request to acknowledgement.
// Nobody misses a critical result.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Result {
  id: string;
  orderId: string;
  resultType: ResultType;
  category: ResultCategory;
  patientId: string;
  encounterId: string;
  requesterId: string;
  departmentId: string;
  status: ResultStatus;
  priority: ResultPriority;
  timing: ResultTiming;
  specimen?: SpecimenInfo;
  values: ResultValue[];
  attachments: ResultAttachment[];
  interpretation?: string;
  conclusion?: string;
  isAbnormal: boolean;
  isCritical: boolean;
  criticalFlags: CriticalFlag[];
  reviewedBy: ResultReview[];
  auditTrail: ResultAuditEntry[];
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export enum ResultType {
  LabHematology = 'lab_hematology',
  LabBiochemistry = 'lab_biochemistry',
  LabMicrobiology = 'lab_microbiology',
  LabImmunology = 'lab_immunology',
  LabPathology = 'lab_pathology',
  LabGenetics = 'lab_genetics',
  LabToxicology = 'lab_toxicology',
  LabBloodBank = 'lab_blood_bank',
  ImagingRadiograph = 'imaging_radiograph',
  ImagingCT = 'imaging_ct',
  ImagingMRI = 'imaging_mri',
  ImagingUltrasound = 'imaging_ultrasound',
  ImagingFluoroscopy = 'imaging_fluoroscopy',
  ImagingMammography = 'imaging_mammography',
  ImagingNuclear = 'imaging_nuclear',
  PathologyHistology = 'pathology_histology',
  PathologyCytology = 'pathology_cytology',
  PathologyFrozen = 'pathology_frozen',
  MicrobiologyCulture = 'microbiology_culture',
  MicrobiologySensitivity = 'microbiology_sensitivity',
  MicrobiologyPCR = 'microbiology_pcr',
  MicrobiologySerology = 'microbiology_serology',
  PhysiologyECG = 'physiology_ecg',
  PhysiologyEchocardiogram = 'physiology_echocardiogram',
  PhysiologyPFT = 'physiology_pft',
  PhysiologyEEG = 'physiology_eeg',
  PhysiologyEMG = 'physiology_emg',
  PhysiologyStressTest = 'physiology_stress_test',
  Other = 'other',
}

export enum ResultCategory {
  Hematology = 'hematology',
  Biochemistry = 'biochemistry',
  Microbiology = 'microbiology',
  Immunology = 'immunology',
  Pathology = 'pathology',
  Genetics = 'genetics',
  Toxicology = 'toxicology',
  BloodBank = 'blood_bank',
  Radiology = 'radiology',
  Cardiology = 'cardiology',
  Pulmonology = 'pulmonology',
  Neurology = 'neurology',
  Other = 'other',
}

export enum ResultStatus {
  Requested = 'requested',
  SampleCollected = 'sample_collected',
  SampleReceived = 'sample_received',
  Processing = 'processing',
  Completed = 'completed',
  Verified = 'verified',
  Released = 'released',
  Reviewed = 'reviewed',
  Acknowledged = 'acknowledged',
  Actioned = 'actioned',
  Archived = 'archived',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
  RedoRequested = 'redo_requested',
}

export enum ResultPriority {
  STAT = 'stat',
  Emergency = 'emergency',
  Urgent = 'urgent',
  Routine = 'routine',
  Timed = 'timed',
}

export interface ResultTiming {
  requestedAt: number;
  sampleCollectedAt?: number;
  sampleReceivedAt?: number;
  processingStartedAt?: number;
  completedAt?: number;
  verifiedAt?: number;
  releasedAt?: number;
  reviewedAt?: number;
  acknowledgedAt?: number;
  actionedAt?: number;
  turnaroundTargetMinutes?: number;
  actualTurnaroundMinutes?: number;
}

export interface SpecimenInfo {
  id: string;
  type: string;
  site?: string;
  container?: string;
  volume?: string;
  collectedAt?: number;
  collectedBy?: string;
  receivedAt?: number;
  receivedBy?: string;
  condition?: 'acceptable' | 'hemolyzed' | 'clotted' | 'insufficient' | 'contaminated' | 'expired';
  rejectionReason?: string;
  barcode?: string;
  storageLocation?: string;
}

export interface ResultValue {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  isCritical: boolean;
  flag: 'normal' | 'high' | 'low' | 'critical_high' | 'critical_low' | 'abnormal' | 'panic';
  method?: string;
  notes?: string;
}

export interface ResultAttachment {
  id: string;
  type: 'image' | 'pdf' | 'dicom' | 'waveform' | 'document' | 'other';
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface CriticalFlag {
  parameter: string;
  value: string;
  threshold: string;
  notifiedAt?: number;
  notifiedTo?: string;
  acknowledgedAt?: number;
  escalatedTo?: string;
}

export interface ResultReview {
  userId: string;
  userName: string;
  role: string;
  action: 'reviewed' | 'acknowledged' | 'actioned';
  at: number;
  notes?: string;
}

export interface ResultAuditEntry {
  at: number;
  by: string;
  action: string;
  details: string;
}

export function createResult(params: {
  orderId: string;
  resultType: ResultType;
  category: ResultCategory;
  patientId: string;
  encounterId: string;
  requesterId: string;
  departmentId: string;
  priority: ResultPriority;
}): Result {
  const now = Date.now();
  return {
    id: `RES-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    orderId: params.orderId,
    resultType: params.resultType,
    category: params.category,
    patientId: params.patientId,
    encounterId: params.encounterId,
    requesterId: params.requesterId,
    departmentId: params.departmentId,
    status: ResultStatus.Requested,
    priority: params.priority,
    timing: { requestedAt: now },
    values: [],
    attachments: [],
    isAbnormal: false,
    isCritical: false,
    criticalFlags: [],
    reviewedBy: [],
    auditTrail: [{ at: now, by: params.requesterId, action: 'request', details: 'Result requested' }],
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function collectSample(result: Result, collectedBy: string, specimen: SpecimenInfo): Result {
  result.status = ResultStatus.SampleCollected;
  result.timing.sampleCollectedAt = Date.now();
  result.specimen = specimen;
  result.updatedAt = Date.now();
  result.auditTrail.push({ at: Date.now(), by: collectedBy, action: 'collect', details: `Sample collected: ${specimen.type}` });
  return result;
}

export function receiveSample(result: Result, receivedBy: string): Result {
  result.status = ResultStatus.SampleReceived;
  result.timing.sampleReceivedAt = Date.now();
  if (result.specimen) result.specimen.receivedAt = Date.now();
  result.updatedAt = Date.now();
  result.auditTrail.push({ at: Date.now(), by: receivedBy, action: 'receive', details: 'Sample received in lab' });
  return result;
}

export function rejectSample(result: Result, rejectedBy: string, reason: string): Result {
  result.status = ResultStatus.Rejected;
  if (result.specimen) result.specimen.rejectionReason = reason;
  result.updatedAt = Date.now();
  result.auditTrail.push({ at: Date.now(), by: rejectedBy, action: 'reject', details: `Sample rejected: ${reason}` });
  return result;
}

export function addResultValues(result: Result, values: ResultValue[]): Result {
  result.values = values;
  result.isAbnormal = values.some(v => v.isAbnormal);
  result.isCritical = values.some(v => v.isCritical);
  if (result.isCritical) {
    result.criticalFlags = values.filter(v => v.isCritical).map(v => ({
      parameter: v.parameter,
      value: v.value,
      threshold: v.referenceRange,
    }));
  }
  result.updatedAt = Date.now();
  return result;
}

export function verifyResult(result: Result, verifiedBy: string): Result {
  result.status = ResultStatus.Verified;
  result.timing.verifiedAt = Date.now();
  result.updatedAt = Date.now();
  result.auditTrail.push({ at: Date.now(), by: verifiedBy, action: 'verify', details: 'Result verified' });
  return result;
}

export function releaseResult(result: Result, releasedBy: string): Result {
  const now = Date.now();
  result.status = ResultStatus.Released;
  result.timing.releasedAt = now;
  result.timing.actualTurnaroundMinutes = result.timing.sampleReceivedAt
    ? Math.round((now - result.timing.sampleReceivedAt) / 60000)
    : Math.round((now - result.timing.requestedAt) / 60000);
  result.updatedAt = now;
  result.auditTrail.push({ at: now, by: releasedBy, action: 'release', details: 'Result released to clinician' });
  return result;
}

export function acknowledgeResult(result: Result, userId: string, userName: string): Result {
  result.status = ResultStatus.Acknowledged;
  result.timing.acknowledgedAt = Date.now();
  result.reviewedBy.push({ userId, userName, role: '', action: 'acknowledged', at: Date.now() });
  result.updatedAt = Date.now();
  result.auditTrail.push({ at: Date.now(), by: userId, action: 'acknowledge', details: 'Result acknowledged by clinician' });
  return result;
}

export function actionResult(result: Result, userId: string, userName: string, notes?: string): Result {
  result.status = ResultStatus.Actioned;
  result.timing.actionedAt = Date.now();
  result.reviewedBy.push({ userId, userName, role: '', action: 'actioned', at: Date.now(), notes });
  result.updatedAt = Date.now();
  result.auditTrail.push({ at: Date.now(), by: userId, action: 'action', details: notes || 'Result actioned' });
  return result;
}

export function archiveResult(result: Result): Result {
  result.status = ResultStatus.Archived;
  result.updatedAt = Date.now();
  result.auditTrail.push({ at: Date.now(), by: 'system', action: 'archive', details: 'Result archived' });
  return result;
}

export function hasUnacknowledgedCriticalResult(results: Result[]): boolean {
  return results.some(r => r.isCritical && r.status !== ResultStatus.Acknowledged && r.status !== ResultStatus.Actioned);
}

export function getResultsByPatient(results: Result[], patientId: string): Result[] {
  return results.filter(r => r.patientId === patientId);
}

export function getResultsByStatus(results: Result[], status: ResultStatus): Result[] {
  return results.filter(r => r.status === status);
}

export function getCriticalResultsPendingAcknowledgment(results: Result[]): Result[] {
  return results.filter(r => r.isCritical && r.status !== ResultStatus.Acknowledged && r.status !== ResultStatus.Actioned);
}

export function getResultSummary(results: Result[]): {
  total: number;
  pendingProcessing: number;
  pendingVerification: number;
  released: number;
  acknowledged: number;
  criticalPending: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const r of results) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  }
  return {
    total: results.length,
    pendingProcessing: results.filter(r => [ResultStatus.Requested, ResultStatus.SampleCollected, ResultStatus.SampleReceived, ResultStatus.Processing].includes(r.status)).length,
    pendingVerification: results.filter(r => r.status === ResultStatus.Completed).length,
    released: results.filter(r => r.status === ResultStatus.Released).length,
    acknowledged: results.filter(r => r.status === ResultStatus.Acknowledged || r.status === ResultStatus.Actioned).length,
    criticalPending: getCriticalResultsPendingAcknowledgment(results).length,
    byCategory, byStatus,
  };
}

export function getDeltaCheck(results: Result[], parameter: string, maxChangePercent: number = 20): { previous: ResultValue | null; current: ResultValue | null; changePercent: number; significant: boolean } {
  const withParam = results.filter(r => r.values.some(v => v.parameter === parameter));
  if (withParam.length < 2) {
    const val = withParam[0]?.values.find(v => v.parameter === parameter) || null;
    return { previous: null, current: val, changePercent: 0, significant: false };
  }
  const latest = withParam[withParam.length - 1].values.find(v => v.parameter === parameter)!;
  const previous = withParam[withParam.length - 2].values.find(v => v.parameter === parameter)!;
  const prevNum = parseFloat(previous.value);
  const currNum = parseFloat(latest.value);
  const changePercent = prevNum !== 0 ? Math.abs((currNum - prevNum) / prevNum) * 100 : currNum !== 0 ? 100 : 0;
  return { previous, current: latest, changePercent, significant: changePercent > maxChangePercent };
}
