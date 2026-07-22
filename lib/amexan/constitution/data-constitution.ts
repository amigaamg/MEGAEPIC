import type { AmxUid } from './types';

export interface ClinicalEvent {
  id: string;
  patientId: string;
  type: ClinicalEventType;
  timestamp: number;
  payload: Record<string, any>;
  provenance: ClinicalProvenance;
}

export type ClinicalEventType =
  | 'symptom_reported' | 'vitals_recorded' | 'diagnosis_made' | 'lab_ordered'
  | 'lab_result_received' | 'imaging_ordered' | 'imaging_result_received'
  | 'medication_prescribed' | 'medication_administered' | 'procedure_performed'
  | 'consultation_requested' | 'referral_made' | 'admission_ordered'
  | 'discharge_ordered' | 'transfer_ordered' | 'death_recorded'
  | 'note_written' | 'care_plan_created' | 'allergy_recorded'
  | 'immunization_given' | 'consent_obtained' | 'patient_education';

export interface ClinicalProvenance {
  recordedBy: AmxUid;
  recordedByName: string;
  recordedByRole: string;
  recordedAt: number;
  organizationId: string;
  departmentId: string;
  deviceId?: string;
  signature?: string;
  supersededBy?: string;
}

export function appendEvent(
  events: ClinicalEvent[],
  patientId: string,
  type: ClinicalEventType,
  payload: Record<string, any>,
  provenance: ClinicalProvenance,
): ClinicalEvent[] {
  const event: ClinicalEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    patientId,
    type,
    timestamp: Date.now(),
    payload,
    provenance,
  };
  return [...events, event];
}

export function getPatientTimeline(events: ClinicalEvent[], patientId: string): ClinicalEvent[] {
  return events.filter(e => e.patientId === patientId).sort((a, b) => a.timestamp - b.timestamp);
}

export function reconstructState(events: ClinicalEvent[], patientId: string, atTime?: number): Record<string, any> {
  const timeline = getPatientTimeline(events, patientId);
  const state: Record<string, any> = {};
  for (const event of timeline) {
    if (atTime && event.timestamp > atTime) break;
    if (event.type === 'diagnosis_made') state.currentDiagnosis = event.payload;
    if (event.type === 'vitals_recorded') state.latestVitals = event.payload;
    if (event.type === 'medication_prescribed') {
      state.medications = [...(state.medications ?? []), event.payload];
    }
  }
  return state;
}

export interface TerminologyMapping {
  code: string;
  system: 'snomed' | 'icd_10' | 'icd_11' | 'loinc' | 'rxnorm' | 'atc' | 'local';
  display: string;
}

const TERMINOLOGY_MAP: Record<string, TerminologyMapping[]> = {};

export function mapToSystem(concept: string, system: TerminologyMapping['system']): TerminologyMapping | undefined {
  return TERMINOLOGY_MAP[concept]?.find(m => m.system === system);
}

export function getConceptDisplay(concept: string, system: TerminologyMapping['system']): string {
  return mapToSystem(concept, system)?.display ?? concept;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  createdBy: AmxUid;
  createdAt: number;
  parentVersionId?: string;
  changeSummary?: string;
}

export function createVersion(documentId: string, content: string, createdBy: AmxUid, parentVersionId?: string): DocumentVersion {
  return {
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    documentId,
    version: 1,
    content,
    createdBy,
    createdAt: Date.now(),
    parentVersionId,
  };
}

const VERSION_STORE: Record<string, DocumentVersion[]> = {};

export function addVersion(version: DocumentVersion): void {
  if (!VERSION_STORE[version.documentId]) VERSION_STORE[version.documentId] = [];
  VERSION_STORE[version.documentId].push(version);
}

export function getVersionHistory(documentId: string): DocumentVersion[] {
  return VERSION_STORE[documentId] ?? [];
}

export function compareVersions(v1: string, v2: string): { added: string[]; removed: string[]; changed: string[] } {
  const lines1 = v1.split('\n');
  const lines2 = v2.split('\n');
  const set1 = new Set(lines1);
  const set2 = new Set(lines2);
  return {
    added: lines2.filter(l => !set1.has(l)),
    removed: lines1.filter(l => !set2.has(l)),
    changed: [],
  };
}

export interface SearchIndexEntry {
  id: string;
  type: 'patient' | 'encounter' | 'lab' | 'imaging' | 'medication' | 'diagnosis' | 'note';
  title: string;
  description: string;
  keywords: string[];
  organizationId: string;
  patientId?: string;
  link: string;
}

const SEARCH_INDEX: SearchIndexEntry[] = [];

export function indexEntry(entry: SearchIndexEntry): void {
  SEARCH_INDEX.push(entry);
}

export function search(query: string, orgId?: string): SearchIndexEntry[] {
  const q = query.toLowerCase();
  return SEARCH_INDEX.filter(e => {
    if (orgId && e.organizationId !== orgId) return false;
    return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.keywords.some(k => k.toLowerCase().includes(q));
  });
}
