import { offlineDB } from '../offline/indexeddb-persistence';

export interface PatientData {
  mrn: string;
  name: string;
  dob: number;
  sex: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string[];
  surgicalHistory: string[];
  familyHistory: string[];
  contact: string;
  address: string;
  id?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface SavedEncounter {
  id: string;
  encounterId: string;
  patientName: string;
  hospitalNumber: string;
  status: 'active' | 'completed';
  currentPhase: string;
  updatedAt: number;
  createdAt: number;
  data?: any;
}

function getPatients(): Record<string, PatientData> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('amexan_patients') || '{}') } catch { return {} }
}

function savePatients(p: Record<string, PatientData>) {
  localStorage.setItem('amexan_patients', JSON.stringify(p))
}

function getEncounters(): Record<string, SavedEncounter> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('amexan_encounters') || '{}') } catch { return {} }
}

function saveEncounters(e: Record<string, SavedEncounter>) {
  localStorage.setItem('amexan_encounters', JSON.stringify(e))
}

// ─── Patient ───────────────────────────────────────────────

export function registerPatient(data: PatientData, _orgId?: string): string {
  const patients = getPatients()
  const existing = Object.entries(patients).find(([, v]) => v.mrn === data.mrn)
  if (existing) return existing[0]
  const id = `pat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  patients[id] = { ...data, id, createdAt: Date.now(), updatedAt: Date.now() }
  savePatients(patients)
  return id
}

export function getPatient(patientId: string): PatientData | null {
  return getPatients()[patientId] || null
}

export function findPatientByMRN(mrn: string): { id: string; data: PatientData } | null {
  const patients = getPatients()
  const entry = Object.entries(patients).find(([, v]) => v.mrn === mrn)
  if (!entry) return null
  return { id: entry[0], data: entry[1] }
}

export function updatePatient(patientId: string, updates: Partial<PatientData>): void {
  const patients = getPatients()
  if (patients[patientId]) {
    patients[patientId] = { ...patients[patientId], ...updates, updatedAt: Date.now() }
    savePatients(patients)
  }
}

// ─── Hospital Number ───────────────────────────────────────

export function generateHospitalNumber(_orgId: string): string {
  const key = 'amexan_hospital_counter'
  let seq = parseInt(localStorage.getItem(key) || '0', 10) + 1
  localStorage.setItem(key, String(seq))
  const year = new Date().getFullYear()
  return `HN-${year}-${String(seq).padStart(5, '0')}`
}

// ─── Encounters ────────────────────────────────────────────

export function saveEncounter(orgId: string, encounterId: string, state: any): void {
  const encounters = getEncounters()
  const existing = encounters[encounterId]
  const entry: SavedEncounter = {
    id: encounterId,
    encounterId,
    patientName: state.biodata?.patientName || 'Unknown',
    hospitalNumber: state.biodata?.hospitalNumber || '',
    status: 'active',
    currentPhase: state.currentPhase || 'registration',
    updatedAt: Date.now(),
    createdAt: existing?.createdAt || Date.now(),
    data: {
      biodata: state.biodata,
      chiefComplaints: state.chiefComplaints,
      answers: state.questionEngine?.answers || state.answers || {},
      hpiNarrative: state.hpiNarrative || '',
      aiNarrative: state.aiNarrative || '',
      timeline: state.timeline || [],
      problemList: state.problemList || [],
      differentials: state.differentials || [],
      redFlags: state.redFlags || [],
      missingInfo: state.missingInfo || [],
      objectives: state.objectives || [],
      completedPhases: state.completedPhases || [],
    },
  }
  encounters[encounterId] = entry
  saveEncounters(encounters)
}

export function loadEncounter(orgId: string, encounterId: string): { state: any; answers: Record<string, any> } | null {
  const entry = getEncounters()[encounterId]
  if (!entry || !entry.data) return null
  return { state: entry.data, answers: entry.data.answers || {} }
}

export function listRecentEncounters(_orgId: string, maxResults: number = 20): SavedEncounter[] {
  const entries = Object.values(getEncounters())
  entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  return entries.slice(0, maxResults).map(e => ({
    id: e.id,
    encounterId: e.encounterId,
    patientName: e.patientName,
    hospitalNumber: e.hospitalNumber,
    status: e.status,
    currentPhase: e.currentPhase,
    updatedAt: e.updatedAt,
    createdAt: e.createdAt,
  }))
}

export function completeEncounter(_orgId: string, encounterId: string): void {
  const encounters = getEncounters()
  if (encounters[encounterId]) {
    encounters[encounterId].status = 'completed'
    encounters[encounterId].updatedAt = Date.now()
    saveEncounters(encounters)
  }
}

// ─── IndexedDB-backed operations (offline-capable) ───────┐

export async function idbRegisterPatient(data: PatientData): Promise<string> {
  const id = `pat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const record = { ...data, id, createdAt: Date.now(), updatedAt: Date.now() }
  await offlineDB.put('patients', record)
  return id
}

export async function idbGetPatient(patientId: string): Promise<PatientData | null> {
  return offlineDB.get<PatientData>('patients', patientId)
}

export async function idbFindPatientByMRN(mrn: string): Promise<{ id: string; data: PatientData } | null> {
  const patients = await offlineDB.queryByIndex<PatientData>('patients', 'mrn', mrn)
  if (patients.length === 0) return null
  return { id: patients[0].id!, data: patients[0] }
}

export async function idbUpdatePatient(patientId: string, updates: Partial<PatientData>): Promise<void> {
  const existing = await idbGetPatient(patientId)
  if (existing) {
    await offlineDB.put('patients', { ...existing, ...updates, updatedAt: Date.now() })
  }
}

export async function idbSaveEncounter(encounterId: string, data: any): Promise<void> {
  const existing = await offlineDB.get('encounters', encounterId)
  const entry = {
    id: encounterId,
    encounterId,
    patientName: data.biodata?.patientName || 'Unknown',
    hospitalNumber: data.biodata?.hospitalNumber || '',
    status: 'active',
    currentPhase: data.currentPhase || 'registration',
    updatedAt: Date.now(),
    createdAt: (existing as any)?.createdAt || Date.now(),
    data,
  }
  await offlineDB.put('encounters', entry)
}

export async function idbLoadEncounter(encounterId: string): Promise<any | null> {
  const entry = await offlineDB.get('encounters', encounterId)
  return entry ? (entry as any).data : null
}

export async function idbListRecentEncounters(maxResults = 20): Promise<any[]> {
  const entries = await offlineDB.getAll<any>('encounters')
  entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  return entries.slice(0, maxResults)
}

export async function idbCompleteEncounter(encounterId: string): Promise<void> {
  const existing = await offlineDB.get<any>('encounters', encounterId)
  if (existing) {
    await offlineDB.put('encounters', { ...existing, status: 'completed', updatedAt: Date.now() })
  }
}

export async function idbGetStorageInfo(): Promise<{ usage: number; quota: number; patientCount: number; encounterCount: number; queueCount: number }> {
  const estimate = await offlineDB.getStorageEstimate()
  const patientCount = await offlineDB.count('patients')
  const encounterCount = await offlineDB.count('encounters')
  const queueCount = await offlineDB.count('queue')
  return { ...estimate, patientCount, encounterCount, queueCount }
}
