// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XI: Laboratory Engine
// Universal specimen workflow from order through collection, processing, verification, release.
// ═══════════════════════════════════════════════════════════════════════════════

export interface LabTestProfile {
  id: string;
  code: string;
  name: string;
  category: LabCategory;
  department: string;
  specimen: SpecimenRequirements;
  methodology: string;
  turnaroundMinutes: number;
  cost: number;
  isPanel: boolean;
  panelMembers?: string[];
  referenceRanges: ReferenceRange[];
  criticalValues: CriticalValue[];
  interpretation: string;
  preparation: string;
  isActive: boolean;
}

export enum LabCategory {
  Hematology = 'hematology',
  Biochemistry = 'biochemistry',
  Microbiology = 'microbiology',
  Immunology = 'immunology',
  Pathology = 'pathology',
  Genetics = 'genetics',
  Toxicology = 'toxicology',
  BloodBank = 'blood_bank',
  Histology = 'histology',
  Cytology = 'cytology',
  Molecular = 'molecular',
}

export interface SpecimenRequirements {
  type: SpecimenType;
  volume?: string;
  container: string;
  additive?: string;
  storage: string;
  transport: string;
  rejectionCriteria: string[];
  fasting: boolean;
  specialHandling?: string;
}

export enum SpecimenType {
  WholeBlood = 'whole_blood',
  Serum = 'serum',
  Plasma = 'plasma',
  EDTA = 'edta',
  Citrate = 'citrate',
  Urine = 'urine',
  Stool = 'stool',
  Sputum = 'sputum',
  CSF = 'csf',
  Swab = 'swab',
  Tissue = 'tissue',
  Aspirate = 'aspirate',
  BAL = 'bal',
  Pus = 'pus',
  Fluid = 'fluid',
  BoneMarrow = 'bone_marrow',
  Amniotic = 'amniotic',
  Semen = 'semen',
  Hair = 'hair',
  Nail = 'nail',
  Biopsy = 'biopsy',
  Other = 'other',
}

export interface ReferenceRange {
  gender?: 'male' | 'female' | 'all';
  ageMin?: number;
  ageMax?: number;
  ageUnit?: 'years' | 'months' | 'days';
  low: number;
  high: number;
  unit: string;
  textRange?: string;
}

export interface CriticalValue {
  low?: number;
  high?: number;
  unit: string;
  notifyImmediately: boolean;
  notifyTo: string[];
}

export interface LabRequest {
  id: string;
  orderId: string;
  patientId: string;
  encounterId: string;
  tests: LabTestRequest[];
  priority: 'stat' | 'urgent' | 'routine';
  clinicalInfo: string;
  diagnosis?: string;
  requester: { id: string; name: string; department: string; };
  requestedAt: number;
}

export interface LabTestRequest {
  testCode: string;
  testName: string;
  isStat: boolean;
  status: LabTestStatus;
  specimenCollected?: boolean;
  specimenId?: string;
}

export enum LabTestStatus {
  Ordered = 'ordered',
  Collected = 'collected',
  Received = 'received',
  Processing = 'processing',
  Completed = 'completed',
  Verified = 'verified',
  Released = 'released',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
}

export interface LabSpecimen {
  id: string;
  requestId: string;
  type: SpecimenType;
  barcode: string;
  collectedAt: number;
  collectedBy: string;
  receivedAt?: number;
  receivedBy?: string;
  location?: string;
  condition: 'acceptable' | 'hemolyzed' | 'clotted' | 'insufficient' | 'contaminated' | 'expired';
  rejectionReason?: string;
  tests: string[];
}

export interface QCResult {
  id: string;
  testCode: string;
  controlLevel: 'low' | 'normal' | 'high';
  value: number;
  mean: number;
  sd: number;
  isInControl: boolean;
  performedAt: number;
  performedBy: string;
  lotNumber: string;
}
