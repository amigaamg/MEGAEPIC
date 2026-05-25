/**
 * AMEXAN MySQL API Layer
 * ─────────────────────────────────────────────────────────────
 * These types and fetchers replace the Firebase hooks from Sprint 1.
 * All data fetching goes through Next.js API routes → MySQL.
 *
 * Drop-in compatible with the Sprint 1 type definitions.
 * Same shape, different data source.
 */

// Re-export all base types from Sprint 1 (copy types/index.ts alongside this)
export type {
  Patient, PatientTool, BPEntry, Prescription, DoseChange,
  ClinicalNote, FollowUp, LabOrder, ImagingOrder, SystemAlert,
  Complication, BPStats, AlertThreshold, BPStatus,
} from "./types";

// ─────────────────────────────────────────────────────────────
// BASE FETCHER — wraps all API calls with error handling
// ─────────────────────────────────────────────────────────────

export class AMEXANApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AMEXANApiError";
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new AMEXANApiError(res.status, body.message ?? "API error");
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────
// API ROUTE PATHS — centralised, never scattered in components
// ─────────────────────────────────────────────────────────────

export const API = {
  // Patient
  patient:         (id: string)            => `/api/amexan/patients/${id}`,
  // Tool
  tool:            (id: string)            => `/api/amexan/tools/${id}`,
  toolByPatient:   (patientId: string)     => `/api/amexan/tools?patientId=${patientId}`,
  // BP
  bpEntries:       (toolId: string)        => `/api/amexan/bp?toolId=${toolId}`,
  bpCreate:                                   `/api/amexan/bp`,
  // Prescriptions
  prescriptions:   (toolId: string)        => `/api/amexan/prescriptions?toolId=${toolId}`,
  prescriptionCreate:                         `/api/amexan/prescriptions`,
  prescriptionUpdate: (id: string)         => `/api/amexan/prescriptions/${id}`,
  prescriptionStop:   (id: string)         => `/api/amexan/prescriptions/${id}/stop`,
  prescriptionDose:   (id: string)         => `/api/amexan/prescriptions/${id}/dose`,
  // Follow-ups
  followUps:       (toolId: string)        => `/api/amexan/followups?toolId=${toolId}`,
  followUpCreate:                             `/api/amexan/followups`,
  followUpUpdate:  (id: string)            => `/api/amexan/followups/${id}`,
  // Clinical notes
  notes:           (toolId: string)        => `/api/amexan/notes?toolId=${toolId}`,
  noteCreate:                                 `/api/amexan/notes`,
  noteUpdate:      (id: string)            => `/api/amexan/notes/${id}`,
  // Labs
  labs:            (toolId: string)        => `/api/amexan/labs?toolId=${toolId}`,
  labCreate:                                  `/api/amexan/labs`,
  labUpdate:       (id: string)            => `/api/amexan/labs/${id}`,
  // Imaging
  imaging:         (toolId: string)        => `/api/amexan/imaging?toolId=${toolId}`,
  imagingCreate:                              `/api/amexan/imaging`,
  // Alerts
  alerts:          (toolId: string)        => `/api/amexan/alerts?toolId=${toolId}`,
  alertAck:        (id: string)            => `/api/amexan/alerts/${id}/acknowledge`,
  // Complications
  complications:   (toolId: string)        => `/api/amexan/complications?toolId=${toolId}`,
  complicationCreate:                         `/api/amexan/complications`,
  // Messages
  messages:        (patientId: string)     => `/api/amexan/messages?patientId=${patientId}`,
  messageCreate:                              `/api/amexan/messages`,
  // Dashboard aggregate (single call for all panel data)
  dashboard:       (toolId: string)        => `/api/amexan/dashboard?toolId=${toolId}`,
} as const;

// ─────────────────────────────────────────────────────────────
// TYPED FETCHERS
// ─────────────────────────────────────────────────────────────

import type {
  Patient, PatientTool, BPEntry, Prescription,
  ClinicalNote, FollowUp, LabOrder, ImagingOrder,
  SystemAlert, Complication, HTNDashboardData,
} from "./types";

export const amexanApi = {
  // ── Patient ──────────────────────────────────────────────────
  getPatient:        (id: string)            => apiFetch<Patient>(API.patient(id)),
  getToolByPatient:  (patientId: string)     => apiFetch<PatientTool[]>(API.toolByPatient(patientId)),
  getTool:           (id: string)            => apiFetch<PatientTool>(API.tool(id)),
  updateTool:        (id: string, data: Partial<PatientTool>) =>
                       apiFetch<PatientTool>(API.tool(id), { method: "PATCH", body: JSON.stringify(data) }),

  // ── BP Entries ───────────────────────────────────────────────
  getBPEntries:      (toolId: string)        => apiFetch<BPEntry[]>(API.bpEntries(toolId)),
  createBPEntry:     (data: Partial<BPEntry>) =>
                       apiFetch<BPEntry>(API.bpCreate, { method: "POST", body: JSON.stringify(data) }),

  // ── Prescriptions ─────────────────────────────────────────────
  getPrescriptions:  (toolId: string)        => apiFetch<Prescription[]>(API.prescriptions(toolId)),
  createPrescription:(data: Partial<Prescription>) =>
                       apiFetch<Prescription>(API.prescriptionCreate, { method: "POST", body: JSON.stringify(data) }),
  adjustDose:        (id: string, newDose: string, reason: string, doctorId: string) =>
                       apiFetch<Prescription>(API.prescriptionDose(id), { method: "POST", body: JSON.stringify({ newDose, reason, doctorId }) }),
  stopDrug:          (id: string, reason: string, doctorId: string) =>
                       apiFetch<Prescription>(API.prescriptionStop(id), { method: "POST", body: JSON.stringify({ reason, doctorId }) }),

  // ── Follow-Ups ────────────────────────────────────────────────
  getFollowUps:      (toolId: string)        => apiFetch<FollowUp[]>(API.followUps(toolId)),
  createFollowUp:    (data: Partial<FollowUp>) =>
                       apiFetch<FollowUp>(API.followUpCreate, { method: "POST", body: JSON.stringify(data) }),
  updateFollowUp:    (id: string, data: Partial<FollowUp>) =>
                       apiFetch<FollowUp>(API.followUpUpdate(id), { method: "PATCH", body: JSON.stringify(data) }),

  // ── Clinical Notes ────────────────────────────────────────────
  getNotes:          (toolId: string)        => apiFetch<ClinicalNote[]>(API.notes(toolId)),
  createNote:        (data: Partial<ClinicalNote>) =>
                       apiFetch<ClinicalNote>(API.noteCreate, { method: "POST", body: JSON.stringify(data) }),

  // ── Labs ──────────────────────────────────────────────────────
  getLabs:           (toolId: string)        => apiFetch<LabOrder[]>(API.labs(toolId)),
  createLab:         (data: Partial<LabOrder>) =>
                       apiFetch<LabOrder>(API.labCreate, { method: "POST", body: JSON.stringify(data) }),
  updateLab:         (id: string, data: Partial<LabOrder>) =>
                       apiFetch<LabOrder>(API.labUpdate(id), { method: "PATCH", body: JSON.stringify(data) }),

  // ── Imaging ───────────────────────────────────────────────────
  getImaging:        (toolId: string)        => apiFetch<ImagingOrder[]>(API.imaging(toolId)),
  createImaging:     (data: Partial<ImagingOrder>) =>
                       apiFetch<ImagingOrder>(API.imagingCreate, { method: "POST", body: JSON.stringify(data) }),

  // ── Alerts ────────────────────────────────────────────────────
  getAlerts:         (toolId: string)        => apiFetch<SystemAlert[]>(API.alerts(toolId)),
  acknowledgeAlert:  (id: string)            =>
                       apiFetch<{ ok: boolean }>(API.alertAck(id), { method: "POST" }),

  // ── Complications ─────────────────────────────────────────────
  getComplications:  (toolId: string)        => apiFetch<Complication[]>(API.complications(toolId)),
  createComplication:(data: Partial<Complication>) =>
                       apiFetch<Complication>(API.complicationCreate, { method: "POST", body: JSON.stringify(data) }),

  // ── Dashboard aggregate ───────────────────────────────────────
  // Single SQL-joined query — faster than 8 round trips
  getDashboard:      (toolId: string)        => apiFetch<HTNDashboardData>(API.dashboard(toolId)),
};