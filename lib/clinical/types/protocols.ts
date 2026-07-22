// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Protocol Types
// Constitutional types for all clinical protocol modules
// ═══════════════════════════════════════════════════════════════════════════════

export interface InvestigationBundle {
  id: string
  label: string
  diseaseId: string
  severity: 'mild' | 'moderate' | 'severe'
  bedside: string[]
  laboratory: string[]
  imaging: string[]
  microbiology: string[]
  conditional: Record<string, string[]>
}

export interface LabProtocol {
  id: string
  name: string
  category: 'hematology' | 'biochemistry' | 'microbiology' | 'immunology' | 'serology'
  sample: string
  turnaroundMinutes: number
  interpretation: Record<string, string>
  criticalValues: Record<string, string>
}

export interface ImagingProtocol {
  id: string
  name: string
  modality: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'fluoroscopy'
  views: string[]
  preparation: string
  contrast: boolean
  urgency: 'routine' | 'urgent' | 'stat'
  findingsExpected: string[]
}

export interface MedicationProtocol {
  id: string
  diseaseId: string
  drug: string
  route: 'PO' | 'IV' | 'IM' | 'SC' | 'INH' | 'TOP' | 'IV/PO' | 'PO/IV'
  dose: string
  frequency: string
  duration: string
  maxDose?: string
  contraindications: string[]
  allergies: string[]
  severity: 'mild' | 'moderate' | 'severe'
  alternativeIfAllergy: string[]
  notes: string
}

export interface SupportiveCareProtocol {
  id: string
  condition: string
  threshold: string
  action: string
  route?: string
  details: string
  monitoring: string
}

export interface NursingProtocol {
  id: string
  diseaseId: string
  severity: 'mild' | 'moderate' | 'severe'
  monitoring: NursingOrder[]
  care: NursingOrder[]
  escalation: EscalationRule[]
}

export interface NursingOrder {
  id: string
  parameter: string
  frequency: string
  target?: string
  duration?: string
  notes?: string
}

export interface EscalationRule {
  id: string
  condition: string
  threshold: string
  action: string
  notify: string[]
}

export interface MonitoringProtocol {
  id: string
  diseaseId: string
  severity: 'mild' | 'moderate' | 'severe'
  vitals: string[]
  vitalsFrequency: string
  urineOutput: boolean
  urineOutputFrequency?: string
  fluidBalance: boolean
  dailyWeight: boolean
  painScore: boolean
  consciousness: boolean
  oxygenMonitoring: boolean
  special: string[]
}

export interface InfusionProtocol {
  id: string
  indication: string
  solution: string
  rate: string
  maxRate?: string
  additives?: string[]
  monitoring: string[]
  contraindications: string[]
}

export interface IsolationProtocol {
  id: string
  diseaseId: string
  type: 'standard' | 'contact' | 'droplet' | 'airborne' | 'protective'
  ppe: string[]
  roomType: string
  patientTransport: string
  duration: string
  disinfection: string[]
}

export interface DiseaseKnowledge {
  id: string
  name: string
  mechanisms: string[]
  epidemiology: string[]
  riskFactors: string[]
  pathophysiology: string
  diagnosticCriteria: string[]
  differentials: string[]
  severityScoring: string[]
  complications: string[]
  references: string[]
}

export interface FullProtocolSet {
  investigationBundles: InvestigationBundle[]
  labProtocols: LabProtocol[]
  imagingProtocols: ImagingProtocol[]
  medications: MedicationProtocol[]
  supportiveCare: SupportiveCareProtocol[]
  nursing: NursingProtocol[]
  monitoring: MonitoringProtocol[]
  infusions: InfusionProtocol[]
  isolation: IsolationProtocol[]
  diseaseKnowledge: DiseaseKnowledge[]
}
