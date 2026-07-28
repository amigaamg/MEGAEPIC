// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XII: Radiology Engine
// Imaging request, scheduling, acquisition, reporting, verification, acknowledgement.
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImagingRequest {
  id: string;
  orderId: string;
  patientId: string;
  encounterId: string;
  modality: ImagingModality;
  bodyPart: string;
  laterality?: 'left' | 'right' | 'bilateral' | 'NA';
  clinicalIndication: string;
  diagnosis?: string;
  contrastRequired: boolean;
  contrastType?: string;
  protocol?: string;
  priority: 'stat' | 'urgent' | 'routine' | 'elective';
  requester: { id: string; name: string; department: string; };
  requestedAt: number;
  scheduledAt?: number;
  status: ImagingStatus;
}

export enum ImagingModality {
  XRay = 'xray',
  CT = 'ct',
  MRI = 'mri',
  Ultrasound = 'ultrasound',
  Fluoroscopy = 'fluoroscopy',
  Mammography = 'mammography',
  NuclearMedicine = 'nuclear_medicine',
  PET = 'pet',
  DEXA = 'dexa',
  Angiography = 'angiography',
}

export enum ImagingStatus {
  Ordered = 'ordered',
  Scheduled = 'scheduled',
  InProgress = 'in_progress',
  Completed = 'completed',
  Reporting = 'reporting',
  ReportCompleted = 'report_completed',
  Verified = 'verified',
  Released = 'released',
  Cancelled = 'cancelled',
}

export interface ImagingReport {
  id: string;
  requestId: string;
  technique: string;
  comparison: string;
  findings: string;
  impression: string;
  recommendations?: string;
  radiologistId: string;
  radiologistName: string;
  reportedAt: number;
  verifiedAt?: number;
  verifiedBy?: string;
  isCritical: boolean;
  criticalFindings?: string;
  attachments: string[];
}

export interface PACSStudy {
  studyUid: string;
  accessionNumber: string;
  patientId: string;
  modality: string;
  studyDate: string;
  studyDescription: string;
  seriesCount: number;
  instanceCount: number;
  dicomTags: Record<string, string>;
}
