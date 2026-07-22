"use client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }))
      throw new ApiError(res.status, body.message ?? body.error ?? "API error")
    }
    return res.json() as Promise<T>
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(0, `Network error: ${(err as Error).message}`)
  }
}

export interface StartEncounterRequest {
  patient_id: string
  provider_id: string
  department: string
  visit_type: string
  priority: string
  reason_for_visit: string
}

export interface EncounterResponse {
  encounter: {
    id: string
    patient_id: string
    provider_id: string
    visit_type: string
    priority: string
    status: string
    clinical_state: string
    reason_for_visit: string
    created_at: string
    updated_at: string
  }
  rules_triggered: number
  active_pathways: string[]
  alerts: string[]
  warnings: string[]
}

export interface RegisterPatientRequest {
  hospital_number?: string
  given_name: string
  family_name: string
  date_of_birth?: string
  age: number
  sex: string
  residence: string
  occupation?: string
}

export interface PatientContextResponse {
  patient_id: string
  context: {
    patient_id: string
    age: number
    sex: string
    age_category: string
    is_pregnant: boolean
    has_uterus: boolean
    is_menstruating: boolean
    requires_guardian: boolean
  }
}

export interface TransitionRequest {
  encounter_id: string
  new_state: string
  user_id: string
}

export interface LboRequest {
  input: {
    history: {
      symptom_streams: {
        concept: string
        onset: string
        duration: string
        attributes: Record<string, any>
      }[]
      review_of_systems: { system: string; findings: string[] }[]
      past_history: { condition: string; year?: string; notes?: string }[]
      medications: string[]
      social: { smoking?: string; alcohol?: string; occupation?: string }
    }
    exam: { vitals: Record<string, string>; findings: { system: string; finding: string }[] }
    labs: { test: string; result?: string }[]
  }
  registration: { age: number; sex: string; setting: string }
}

export const encounterApi = {
  health: () => apiFetch<{ status: string }>("/api/health"),

  registerPatient: (data: RegisterPatientRequest) =>
    apiFetch<PatientContextResponse>("/api/patients/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPatient: (id: string) =>
    apiFetch<PatientContextResponse>(`/api/patients/${id}`),

  startEncounter: (data: StartEncounterRequest) =>
    apiFetch<EncounterResponse>("/api/encounters/start", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getEncounter: (id: string) =>
    apiFetch<EncounterResponse["encounter"]>(`/api/encounters/${id}`),

  transitionState: (data: TransitionRequest) =>
    apiFetch<{ status: string }>("/api/encounters/transition", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  runLbo: (data: LboRequest) =>
    apiFetch<{
      ddx: any[]
      redFlags: string[]
      managementPlan: any
      narrative: string
    }>("/api/clinical/domains/lbo", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

export const CLINICIAN_ROLES = [
  { id: "doctor", label: "Doctor", icon: "🩺", permissions: ["all"] },
  { id: "nurse", label: "Nurse", icon: "💉", permissions: ["vitals", "nursing_notes", "med_admin"] },
  { id: "clinical_officer", label: "Clinical Officer", icon: "📋", permissions: ["history", "exam", "diagnosis", "management"] },
  { id: "midwife", label: "Midwife", icon: "👶", permissions: ["antenatal", "postnatal", "vitals"] },
  { id: "medical_student", label: "Medical Student", icon: "📚", permissions: ["history", "exam", "read_only"] },
] as const

export type ClinicianRoleId = typeof CLINICIAN_ROLES[number]["id"]

export const ROLE_PERMISSIONS: Record<ClinicianRoleId, string[]> = {
  doctor: ["registration", "chief_complaint", "hpi", "pmh", "drug_history", "social_history", "ros", "examination", "investigations", "diagnosis", "management", "documentation", "orders", "prescriptions", "referrals", "discharge"],
  nurse: ["registration", "vitals", "nursing_notes", "med_admin", "ros", "documentation"],
  clinical_officer: ["registration", "chief_complaint", "hpi", "pmh", "drug_history", "social_history", "ros", "examination", "investigations", "diagnosis", "management", "documentation"],
  midwife: ["registration", "antenatal", "postnatal", "vitals", "examination", "documentation"],
  medical_student: ["registration", "chief_complaint", "hpi", "pmh", "ros", "examination", "read_only"],
}

export const DEPARTMENTS = [
  { id: "emergency", label: "Emergency Department", icon: "🚑" },
  { id: "outpatient", label: "Outpatient Clinic", icon: "🏥" },
  { id: "medicine", label: "Internal Medicine", icon: "🫀" },
  { id: "surgery", label: "General Surgery", icon: "🔪" },
  { id: "pediatrics", label: "Pediatrics", icon: "👶" },
  { id: "obgyn", label: "Obstetrics & Gynecology", icon: "🤰" },
  { id: "orthopedics", label: "Orthopedics", icon: "🦴" },
  { id: "ent", label: "ENT", icon: "👂" },
  { id: "ophthalmology", label: "Ophthalmology", icon: "👁️" },
  { id: "psychiatry", label: "Psychiatry", icon: "🧠" },
  { id: "icu", label: "ICU", icon: "❤️" },
  { id: "theatre", label: "Operating Theatre", icon: "💡" },
  { id: "ward", label: "Ward", icon: "🛏️" },
  { id: "telemedicine", label: "Telemedicine", icon: "📹" },
] as const

export const FACILITIES = [
  { id: "main-hospital", label: "Main Teaching Hospital", region: "Urban" },
  { id: "district-1", label: "District Health Center", region: "Rural" },
  { id: "clinic-a", label: "Community Clinic A", region: "Urban" },
] as const

export interface EncounterSessionData {
  id: string
  biodata: any
  complaints: any[]
  hpiData: Record<string, any>
  pmh: any
  drugs: any
  social: any
  ros: any[]
  vitals: any
  examFindings: any[]
  investigations: any[]
  diagnoses: any[]
  management: any[]
  step: string
  createdAt: number
  updatedAt: number
}

const SESSION_KEY = "amexan_session_index"
const sessionStore = new Map<string, EncounterSessionData>()

function getStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function storeId(id: string) {
  try {
    const ids = getStoredIds()
    if (!ids.includes(id)) {
      ids.unshift(id)
      localStorage.setItem(SESSION_KEY, JSON.stringify(ids.slice(0, 50)))
    }
  } catch { /* quota */ }
}

export const sessionApi = {
  save(data: EncounterSessionData): string {
    const id = data.id || `enc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const entry = { ...data, id, updatedAt: Date.now() }
    sessionStore.set(id, entry)
    try {
      localStorage.setItem(`amexan_enc_${id}`, JSON.stringify(entry))
      storeId(id)
    } catch { /* fallback */ }
    return id
  },

  load(id: string): EncounterSessionData | null {
    const cached = sessionStore.get(id)
    if (cached) return cached
    try {
      const raw = localStorage.getItem(`amexan_enc_${id}`)
      if (raw) {
        const data = JSON.parse(raw) as EncounterSessionData
        sessionStore.set(id, data)
        return data
      }
    } catch { /* ignore */ }
    return null
  },

  delete(id: string) {
    sessionStore.delete(id)
    try { localStorage.removeItem(`amexan_enc_${id}`) } catch { /* ignore */ }
  },

  list(): EncounterSessionData[] {
    const ids = getStoredIds()
    return ids.map(id => sessionApi.load(id)).filter(Boolean) as EncounterSessionData[]
  },

  async syncToBackend(id: string): Promise<boolean> {
    const data = sessionApi.load(id)
    if (!data) return false
    try {
      await encounterApi.transitionState({
        encounter_id: id,
        new_state: data.step,
        user_id: "local-dev",
      })
      return true
    } catch { return false }
  },
}
