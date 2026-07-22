import type { AmxUid, ResourceType } from '../constitution/types'

export type CodeSystem = 'snomed' | 'icd_10' | 'icd_11' | 'loinc' | 'rxnorm' | 'atc' | 'ciel' | 'local'

export interface CodeableConcept {
  code: string
  system: CodeSystem
  display: string
  alternativeCodes?: { code: string; system: CodeSystem; display: string }[]
}

export interface ProvenanceEntry {
  recordedBy: AmxUid
  recordedByName: string
  recordedByRole: string
  recordedAt: number
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  deviceId?: string
  digitalSignature?: string
  supersededAt?: number
  supersededBy?: string
  comment?: string
}

export interface ClinicalEvent {
  id: string
  patientId: string
  encounterId?: string
  type: ClinicalEventType
  timestamp: number
  payload: Record<string, unknown>
  provenance: ProvenanceEntry
  tags?: string[]
}

export type ClinicalEventType =
  | 'symptom_reported' | 'vitals_recorded' | 'diagnosis_made' | 'lab_ordered'
  | 'lab_result_received' | 'imaging_ordered' | 'imaging_result_received'
  | 'medication_prescribed' | 'medication_administered' | 'procedure_performed'
  | 'consultation_requested' | 'referral_made' | 'admission_ordered'
  | 'discharge_ordered' | 'transfer_ordered' | 'death_recorded'
  | 'note_written' | 'care_plan_created' | 'allergy_recorded'
  | 'immunization_given' | 'consent_obtained' | 'patient_education'
  | 'state_transition' | 'ownership_change' | 'task_created'
  | 'task_completed' | 'task_escalated' | 'task_assigned'

export interface KnowledgeTriple {
  id: string
  subject: string
  predicate: string
  object: string
  confidence?: number
  provenance?: ProvenanceEntry
  createdAt: number
  expiresAt?: number
}

export interface TerminologyEntry {
  code: string
  system: CodeSystem
  display: string
  synonyms: string[]
  concepts: { system: CodeSystem; code: string; display: string }[]
}

export interface FhirPatient {
  resourceType: 'Patient'
  id: string
  identifier: { system: string; value: string }[]
  name: { use?: string; family: string; given: string[] }[]
  gender: string
  birthDate: string
  telecom: { system: string; value: string; use?: string }[]
  address: { line: string[]; city: string; country: string }[]
  extension?: Record<string, unknown>[]
}

export interface FhirEncounter {
  resourceType: 'Encounter'
  id: string
  status: string
  class: { code: string; display: string }
  type: { coding: { system: string; code: string; display: string }[] }[]
  subject: { reference: string }
  participant: { individual: { reference: string } }[]
  period: { start: string; end?: string }
  location: { location: { reference: string } }[]
}

export interface FhirObservation {
  resourceType: 'Observation'
  id: string
  status: string
  code: { coding: { system: string; code: string; display: string }[] }
  subject: { reference: string }
  effectiveDateTime: string
  valueQuantity?: { value: number; unit: string; system: string; code: string }
  valueCodeableConcept?: { coding: { system: string; code: string; display: string }[] }
  interpretation?: { coding: { system: string; code: string; display: string }[] }
  referenceRange?: { low?: { value: number }; high?: { value: number }; text?: string }[]
}

export interface DocumentNode {
  id: string
  documentId: string
  title: string
  type: string
  patientId?: string
  encounterId?: string
  content: string
  version: number
  createdBy: AmxUid
  createdAt: number
  updatedAt: number
  parentVersionId?: string
  changeSummary?: string
  status: 'draft' | 'final' | 'amended' | 'superseded'
  tags: string[]
}

export interface SearchableEntry {
  id: string
  type: 'patient' | 'encounter' | 'lab' | 'imaging' | 'medication' | 'diagnosis' | 'note' | 'procedure'
  title: string
  description: string
  keywords: string[]
  organizationId: string
  patientId?: string
  link: string
  createdAt: number
  updatedAt?: number
}

export interface Snapshot {
  id: string
  patientId: string
  atTime: number
  state: Record<string, unknown>
  version: number
}
