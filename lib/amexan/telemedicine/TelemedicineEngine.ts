// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Telemedicine Engine (BOOK VI-N · Constitutional Engine No. 24)
//
// "The Engine of Borderless Healthcare"
//
// Healthcare should never be limited by geography. AMEXAN's Telemedicine Engine
// provides constitutional healthcare beyond hospital walls while maintaining the
// same standards of safety, documentation, governance, clinical reasoning, legal
// compliance, education, and continuity of care.
//
// Telemedicine is NOT video calling. It is an extension of the EMR, HMIS,
// Clinical Intelligence Engine, Research Engine, Pharmacy Engine, Laboratory
// Engine, Radiology Engine, and Patient Journey Engine.
//
// Constitutional scope: virtual hospitals, virtual clinics, remote OPD, rural
// outreach, community health, cross-country consultations, home care, ICU
// tele-rounds, specialist opinions, remote MDTs, chronic disease monitoring,
// and AI-assisted follow-up.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const TELEMEDICINE_AUTHORITY: readonly string[] = [
  'conduct_remote_consultation', 'triaging', 'review_asynchronous_encounters',
  'monitor_remote_patients', 'admit_to_virtual_ward', 'refer_across_facilities',
  'coordinate_mdt', 'consult_global_specialists', 'manage_patient_portal',
  'lead_telemedicine_quality',
];

export const TELEMEDICINE_RESTRICTIONS: readonly string[] = [
  'practice_without_licensure', 'prescribe_without_virtual_encounter',
  'override_constitutional_governance', 'modify_facility_documentation',
  'access_unrelated_patient_records', 'discharge_virtual_patients_without_evidence',
];

// ── Virtual clinic catalogue ───────────────────────────────────────────────────

export type VirtualClinicType =
  | 'medicine' | 'diabetes' | 'hypertension' | 'heart_failure' | 'oncology'
  | 'mental_health' | 'hiv' | 'tb' | 'nutrition' | 'rehabilitation'
  | 'postoperative' | 'palliative_care';

export const VIRTUAL_CLINIC_TYPES: readonly VirtualClinicType[] = [
  'medicine', 'diabetes', 'hypertension', 'heart_failure', 'oncology',
  'mental_health', 'hiv', 'tb', 'nutrition', 'rehabilitation',
  'postoperative', 'palliative_care',
];

export interface VirtualClinic {
  id: string;
  type: VirtualClinicType;
  name: string;
  facilityId?: string;
  leadClinicianId?: AmxUid;
  active: boolean;
  workflowSteps: string[];
  createdBy?: AmxUid;
}

// ── Remote consultation ────────────────────────────────────────────────────────

export type ConsultationMode = 'video' | 'audio' | 'chat';

export type RemoteConsultationStatus =
  | 'requested' | 'pre_triaged' | 'scheduled' | 'identity_verified'
  | 'consented' | 'in_progress' | 'documented' | 'completed' | 'cancelled';

export interface RemoteConsultation {
  id: string;
  patientId: string;
  clinicId?: string;
  clinicianId: AmxUid;
  mode: ConsultationMode;
  status: RemoteConsultationStatus;
  requestedAt: number;
  scheduledAt?: number;
  startedAt?: number;
  endedAt?: number;
  aiPreTriage?: { riskLevel: 'low' | 'medium' | 'high' | 'critical'; summary: string; suggestedUrgency: string };
  identityVerified?: { method: string; verifiedAt: number; verifiedBy?: AmxUid };
  consentGiven?: { at: number; scope: string; method: string };
  documentation?: string;
  orders?: { type: string; detail: string }[];
  prescriptionId?: string;
  followUpPlan?: string;
  recordedIntoLongitudinalEmr: boolean;
  jurisdiction?: string;
  language?: string;
  cancelledReason?: string;
}

// ── Asynchronous (store-and-forward) consultation ──────────────────────────────

export type AsyncConsultationType =
  | 'dermatology' | 'radiology_second_opinion' | 'pathology_review'
  | 'wound_review' | 'ecg_interpretation' | 'laboratory_review'
  | 'home_monitoring_review';

export interface AsyncConsultation {
  id: string;
  patientId: string;
  type: AsyncConsultationType;
  clinicianId: AmxUid;
  status: 'submitted' | 'notified' | 'in_review' | 'responded' | 'archived';
  attachments: { name: string; kind: string; ref: string }[];
  submittedAt: number;
  notifiedAt?: number;
  respondedAt?: number;
  structuredResponse?: string;
  followUpPlan?: string;
  archivedAt?: number;
}

// ── Remote monitoring ──────────────────────────────────────────────────────────

export type RemoteMonitoringSignal =
  | 'blood_pressure' | 'blood_sugar' | 'weight' | 'ecg' | 'pulse_oximetry'
  | 'temperature' | 'respiratory_rate' | 'smart_watch' | 'implantable_device'
  | 'home_ventilator' | 'wearable';

export interface RemoteMonitoringReading {
  id: string;
  patientId: string;
  signal: RemoteMonitoringSignal;
  value: number;
  unit: string;
  deviceId?: string;
  recordedAt: number;
  interpreted?: { withinLimits: boolean; note: string };
}

export interface RemoteMonitoringDevice {
  id: string;
  patientId: string;
  kind: RemoteMonitoringSignal;
  name: string;
  serialNumber: string;
  pairedAt: number;
  lastHeartbeatAt?: number;
  active: boolean;
}

// ── Virtual ward ───────────────────────────────────────────────────────────────

export interface VirtualWardAdmission {
  id: string;
  patientId: string;
  consultantId: AmxUid;
  admittedAt: number;
  dischargePlan?: string;
  status: 'active' | 'discharged';
  dischargedAt?: number;
  dailyObservations: { date: number; recordedBy?: AmxUid; summary: string }[];
  medicationAdherence: { date: number; adherencePercent: number }[];
  virtualNursingVisits: { date: number; nurseId?: AmxUid; note: string }[];
  doctorReviews: { date: number; clinicianId: AmxUid; note: string }[];
  escalations: { at: number; reason: string; target: string; resolved: boolean }[];
  familyEducation: string[];
  homeDevices: string[];
  emergencyPlan?: string;
}

// ── Referral engine ────────────────────────────────────────────────────────────

export type ReferralKind =
  | 'facility_to_facility' | 'primary_to_secondary' | 'secondary_to_tertiary'
  | 'international' | 'insurance' | 'tele_radiology' | 'tele_pathology'
  | 'remote_icu' | 'remote_surgery_planning';

export interface Referral {
  id: string;
  patientId: string;
  kind: ReferralKind;
  fromFacilityId?: string;
  fromClinicianId: AmxUid;
  toFacilityId?: string;
  toSpecialty?: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  clinicalSummary: string;
  attachments: string[];
  createdAt: number;
  status: 'created' | 'accepted' | 'declined' | 'completed';
  traceLog: { at: number; action: string; by?: AmxUid }[];
}

// ── MDT engine ─────────────────────────────────────────────────────────────────

export type MdtDiscipline =
  | 'medicine' | 'surgery' | 'radiology' | 'laboratory' | 'oncology'
  | 'pathology' | 'nutrition' | 'physiotherapy' | 'social_work'
  | 'palliative_care' | 'research';

export interface MdtMeeting {
  id: string;
  patientId?: string;
  topic: string;
  disciplines: MdtDiscipline[];
  participants: { clinicianId: AmxUid; discipline: MdtDiscipline; remote: boolean }[];
  scheduledAt: number;
  heldAt?: number;
  agenda: string[];
  decisions: { decision: string; madeBy?: AmxUid; documentedAt: number }[];
  sharedDecisionRecorded: boolean;
  followUpActions: string[];
  status: 'scheduled' | 'held' | 'cancelled';
}

// ── Global specialist network ──────────────────────────────────────────────────

export type SpecialistSource =
  | 'national_specialist' | 'international_expert' | 'teaching_hospital'
  | 'center_of_excellence' | 'research_collaborator' | 'professional_society';

export interface SpecialistOpinion {
  id: string;
  patientId: string;
  consultationId?: string;
  expertId: AmxUid;
  source: SpecialistSource;
  specialty: string;
  country?: string;
  askedAt: number;
  respondedAt?: number;
  question: string;
  opinion?: string;
  linkedToEncounter: boolean;
  status: 'requested' | 'provided' | 'declined';
}

// ── Patient portal ─────────────────────────────────────────────────────────────

export type PortalAccessArea =
  | 'appointments' | 'video_consultations' | 'results' | 'education'
  | 'medication' | 'payments' | 'messaging' | 'remote_monitoring'
  | 'community_support';

export interface PatientPortalAccount {
  id: string;
  patientId: string;
  activatedAt: number;
  lastLoginAt?: number;
  enabledAreas: PortalAccessArea[];
  active: boolean;
}

// ── AI telemedicine companion ──────────────────────────────────────────────────

export type TelemedicineAiKind =
  | 'pre_consultation_summarization' | 'risk_stratification'
  | 'conversation_transcription' | 'clinical_documentation'
  | 'follow_up_reminders' | 'education' | 'escalation_detection' | 'translation';

export interface TelemedicineAiInsight {
  id: string;
  patientId?: string;
  consultationId?: string;
  kind: TelemedicineAiKind;
  output: string;
  confidence: number;
  generatedAt: number;
}

// ── Telemedicine analytics ─────────────────────────────────────────────────────

export interface TelemedicineAnalytics {
  totalConsultations: number;
  avgWaitingMinutes: number;
  virtualClinicUtilization: Record<string, number>;
  missedAppointments: number;
  patientSatisfaction: number;
  clinicalOutcomes: number;
  geographicalCoverage: { region: string; consultations: number }[];
  diseaseTrends: { condition: string; count: number }[];
  providerWorkload: { clinicianId: AmxUid; consultations: number }[];
  asyncReviewsCompleted: number;
  remoteMonitoringReadings: number;
  virtualWardAdmissions: number;
  referralsCompleted: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface TelemedicineModel {
  organizationId: string;
  facilityId?: string;
  chiefTelemedicineOfficerId?: AmxUid;
  clinics: VirtualClinic[];
  consultations: RemoteConsultation[];
  asyncConsultations: AsyncConsultation[];
  monitoringReadings: RemoteMonitoringReading[];
  monitoringDevices: RemoteMonitoringDevice[];
  virtualWardAdmissions: VirtualWardAdmission[];
  referrals: Referral[];
  mdtMeetings: MdtMeeting[];
  specialistOpinions: SpecialistOpinion[];
  portalAccounts: PatientPortalAccount[];
  aiInsights: TelemedicineAiInsight[];
  analytics: TelemedicineAnalytics;
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateTelemedicineModelInput {
  organizationId: string;
  facilityId?: string;
  chiefTelemedicineOfficerId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── AI pre-triage ──────────────────────────────────────────────────────────────

export function aiPreTriage(request: { symptoms: string[]; history?: string; currentCondition?: string }): { riskLevel: RemoteConsultation['aiPreTriage'] extends { riskLevel: infer R } ? R : 'low' | 'medium' | 'high' | 'critical'; summary: string; suggestedUrgency: string } {
  const text = [...request.symptoms, request.history ?? '', request.currentCondition ?? ''].join(' ').toLowerCase();
  const critical = /chest pain|difficulty breathing|seizure|unconscious|stroke|bleeding/i.test(text);
  const high = /severe pain|high fever|confusion|severe headache|shortness of breath/i.test(text);
  const medium = /pain|fever|vomiting|diarrhea|dizziness|rash/i.test(text);
  const riskLevel = critical ? 'critical' : high ? 'high' : medium ? 'medium' : 'low';
  const suggestedUrgency = critical ? 'immediate_emergency' : high ? 'same_day' : medium ? 'within_48h' : 'routine';
  const summary = `AI triage classified the request as ${riskLevel} risk with ${suggestedUrgency} urgency based on reported symptoms.`;
  return { riskLevel, summary, suggestedUrgency };
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class TelemedicineEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateTelemedicineModelInput): TelemedicineModel {
    if (!input.organizationId) throw new Error('[TelemedicineEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefTelemedicineOfficerId: input.chiefTelemedicineOfficerId,
      clinics: [],
      consultations: [],
      asyncConsultations: [],
      monitoringReadings: [],
      monitoringDevices: [],
      virtualWardAdmissions: [],
      referrals: [],
      mdtMeetings: [],
      specialistOpinions: [],
      portalAccounts: [],
      aiInsights: [],
      analytics: {
        totalConsultations: 0,
        avgWaitingMinutes: 0,
        virtualClinicUtilization: {},
        missedAppointments: 0,
        patientSatisfaction: 0,
        clinicalOutcomes: 0,
        geographicalCoverage: [],
        diseaseTrends: [],
        providerWorkload: [],
        asyncReviewsCompleted: 0,
        remoteMonitoringReadings: 0,
        virtualWardAdmissions: 0,
        referralsCompleted: 0,
      },
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard & audit ─────────────────────────────────────────────

  static canTelemedicinePerform(action: string): { allowed: boolean; reason?: string } {
    if (TELEMEDICINE_AUTHORITY.includes(action)) return { allowed: true };
    if (TELEMEDICINE_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        practice_without_licensure: 'Practitioners must be licensed in the patient jurisdiction.',
        prescribe_without_virtual_encounter: 'Prescribing requires a documented virtual encounter.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        modify_facility_documentation: 'Facility documentation may not be modified by telemedicine.',
        access_unrelated_patient_records: 'Access is limited to telemedicine-related records in scope.',
        discharge_virtual_patients_without_evidence: 'Virtual ward discharge requires clinical evidence.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Telemedicine authority.` };
  }

  static guard(model: TelemedicineModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[TelemedicineEngine] actorId is required for telemedicine actions');
    const verdict = TelemedicineEngine.canTelemedicinePerform(action);
    if (!verdict.allowed) throw new Error(`[TelemedicineEngine] ${verdict.reason}`);
  }

  static audit(model: TelemedicineModel, actorId: AmxUid | undefined, action: string, detail?: string): TelemedicineModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefTelemedicineOfficerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Virtual Clinic Engine ────────────────────────────────────────────────────

  static createVirtualClinic(model: TelemedicineModel, actorId: AmxUid | undefined, input: Omit<VirtualClinic, 'id' | 'active'>): { model: TelemedicineModel; clinic: VirtualClinic } {
    TelemedicineEngine.guard(model, input.leadClinicianId ?? actorId ?? model.chiefTelemedicineOfficerId ?? ('' as AmxUid), 'lead_telemedicine_quality');
    const clinic: VirtualClinic = { ...input, id: nextId('vc'), active: true };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'virtual_clinic_created', input.type), clinics: [...model.clinics, clinic], updatedAt: Date.now() },
      clinic,
    };
  }

  static getClinic(model: TelemedicineModel, clinicId: string): VirtualClinic | undefined {
    return model.clinics.find(c => c.id === clinicId);
  }

  static getClinicsByType(model: TelemedicineModel, type: VirtualClinicType): VirtualClinic[] {
    return model.clinics.filter(c => c.type === type && c.active);
  }

  // ── Remote Consultation Engine ───────────────────────────────────────────────

  static requestConsultation(model: TelemedicineModel, actorId: AmxUid | undefined, input: { patientId: string; clinicId?: string; mode: ConsultationMode; symptoms: string[]; language?: string; jurisdiction?: string }): { model: TelemedicineModel; consultation: RemoteConsultation; preTriage: RemoteConsultation['aiPreTriage'] } {
    const preTriage = aiPreTriage({ symptoms: input.symptoms });
    const now = Date.now();
    const consultation: RemoteConsultation = {
      id: nextId('rc'),
      patientId: input.patientId,
      clinicId: input.clinicId,
      clinicianId: ('' as AmxUid),
      mode: input.mode,
      status: 'pre_triaged',
      requestedAt: now,
      aiPreTriage: preTriage,
      recordedIntoLongitudinalEmr: false,
      language: input.language,
      jurisdiction: input.jurisdiction,
    };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'remote_consultation_requested', input.patientId), consultations: [...model.consultations, consultation], aiInsights: [...model.aiInsights, { id: nextId('ai'), patientId: input.patientId, consultationId: consultation.id, kind: 'risk_stratification', output: preTriage.summary, confidence: 0.8, generatedAt: now }], updatedAt: now },
      consultation,
      preTriage,
    };
  }

  static scheduleConsultation(model: TelemedicineModel, consultationId: string, clinicianId: AmxUid, scheduledAt: number): TelemedicineModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Consultation "${consultationId}" does not exist`);
    const updated = { ...model.consultations[index], clinicianId, scheduledAt, status: 'scheduled' as const };
    return { ...model, consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)], updatedAt: Date.now() };
  }

  static verifyIdentity(model: TelemedicineModel, consultationId: string, method: string): TelemedicineModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Consultation "${consultationId}" does not exist`);
    const updated = { ...model.consultations[index], identityVerified: { method, verifiedAt: Date.now() }, status: 'identity_verified' as const };
    return { ...model, consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordConsent(model: TelemedicineModel, consultationId: string, scope: string, method: string): TelemedicineModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Consultation "${consultationId}" does not exist`);
    const updated = { ...model.consultations[index], consentGiven: { at: Date.now(), scope, method }, status: 'consented' as const };
    return { ...model, consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)], updatedAt: Date.now() };
  }

  static startConsultation(model: TelemedicineModel, consultationId: string): TelemedicineModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Consultation "${consultationId}" does not exist`);
    const current = model.consultations[index];
    if (!current.identityVerified) throw new Error('[TelemedicineEngine] Identity must be verified before consultation');
    if (!current.consentGiven) throw new Error('[TelemedicineEngine] Consent must be recorded before consultation');
    const updated = { ...current, status: 'in_progress' as const, startedAt: Date.now() };
    return { ...model, consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)], updatedAt: Date.now() };
  }

  static documentConsultation(model: TelemedicineModel, consultationId: string, input: { documentation: string; orders?: { type: string; detail: string }[]; prescriptionId?: string; followUpPlan?: string }): TelemedicineModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Consultation "${consultationId}" does not exist`);
    const updated = { ...model.consultations[index], ...input, status: 'documented' as const };
    return { ...model, consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)], updatedAt: Date.now() };
  }

  static completeConsultation(model: TelemedicineModel, consultationId: string, actorId: AmxUid | undefined): TelemedicineModel {
    const index = model.consultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Consultation "${consultationId}" does not exist`);
    const current = model.consultations[index];
    const updated = { ...current, status: 'completed' as const, endedAt: Date.now(), recordedIntoLongitudinalEmr: true };
    const analytics = model.analytics;
    const providerIndex = analytics.providerWorkload.findIndex(p => p.clinicianId === current.clinicianId);
    const providerWorkload = [...analytics.providerWorkload];
    if (providerIndex === -1) providerWorkload.push({ clinicianId: current.clinicianId, consultations: 1 });
    else providerWorkload[providerIndex] = { ...providerWorkload[providerIndex], consultations: providerWorkload[providerIndex].consultations + 1 };
    const clinicKey = current.clinicId ?? 'general';
    return {
      ...model,
      consultations: [...model.consultations.slice(0, index), updated, ...model.consultations.slice(index + 1)],
      analytics: { ...analytics, totalConsultations: analytics.totalConsultations + 1, providerWorkload, virtualClinicUtilization: { ...analytics.virtualClinicUtilization, [clinicKey]: (analytics.virtualClinicUtilization[clinicKey] ?? 0) + 1 } },
      updatedAt: Date.now(),
    };
  }

  // ── Asynchronous Consultation Engine ─────────────────────────────────────────

  static submitAsyncConsultation(model: TelemedicineModel, actorId: AmxUid | undefined, input: Omit<AsyncConsultation, 'id' | 'status' | 'submittedAt'>): { model: TelemedicineModel; consultation: AsyncConsultation } {
    const consultation: AsyncConsultation = { ...input, id: nextId('ac'), status: 'submitted', submittedAt: Date.now() };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'async_consultation_submitted', input.type), asyncConsultations: [...model.asyncConsultations, consultation], updatedAt: Date.now() },
      consultation,
    };
  }

  static respondAsyncConsultation(model: TelemedicineModel, consultationId: string, input: { structuredResponse: string; followUpPlan?: string }): TelemedicineModel {
    const index = model.asyncConsultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Async consultation "${consultationId}" does not exist`);
    const updated = { ...model.asyncConsultations[index], ...input, status: 'responded' as const, respondedAt: Date.now() };
    return {
      ...model,
      asyncConsultations: [...model.asyncConsultations.slice(0, index), updated, ...model.asyncConsultations.slice(index + 1)],
      analytics: { ...model.analytics, asyncReviewsCompleted: model.analytics.asyncReviewsCompleted + 1 },
      updatedAt: Date.now(),
    };
  }

  static archiveAsyncConsultation(model: TelemedicineModel, consultationId: string): TelemedicineModel {
    const index = model.asyncConsultations.findIndex(c => c.id === consultationId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Async consultation "${consultationId}" does not exist`);
    const updated = { ...model.asyncConsultations[index], status: 'archived' as const, archivedAt: Date.now() };
    return { ...model, asyncConsultations: [...model.asyncConsultations.slice(0, index), updated, ...model.asyncConsultations.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Remote Monitoring Engine ─────────────────────────────────────────────────

  static pairMonitoringDevice(model: TelemedicineModel, actorId: AmxUid | undefined, input: Omit<RemoteMonitoringDevice, 'id' | 'pairedAt' | 'active'>): { model: TelemedicineModel; device: RemoteMonitoringDevice } {
    const device: RemoteMonitoringDevice = { ...input, id: nextId('md'), pairedAt: Date.now(), active: true };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'monitoring_device_paired', input.kind), monitoringDevices: [...model.monitoringDevices, device], updatedAt: Date.now() },
      device,
    };
  }

  static recordMonitoringReading(model: TelemedicineModel, input: Omit<RemoteMonitoringReading, 'id' | 'recordedAt' | 'interpreted'>): { model: TelemedicineModel; reading: RemoteMonitoringReading; flagged: boolean } {
    const reading: RemoteMonitoringReading = { ...input, id: nextId('mr'), recordedAt: Date.now() };
    const withinLimits = TelemedicineEngine.interpretReading(input.signal, input.value);
    const flagged = !withinLimits;
    const interpreted = { withinLimits, note: withinLimits ? 'Within configured limits' : `Abnormal ${input.signal} reading — alert configured` };
    const full: RemoteMonitoringReading = { ...reading, interpreted };
    return {
      model: { ...model, monitoringReadings: [...model.monitoringReadings, full], analytics: { ...model.analytics, remoteMonitoringReadings: model.analytics.remoteMonitoringReadings + 1 }, updatedAt: Date.now() },
      reading: full,
      flagged,
    };
  }

  static interpretReading(signal: RemoteMonitoringSignal, value: number): boolean {
    switch (signal) {
      case 'blood_pressure': return value >= 60 && value <= 200;
      case 'blood_sugar': return value >= 2 && value <= 30;
      case 'weight': return value >= 20 && value <= 300;
      case 'pulse_oximetry': return value >= 90 && value <= 100;
      case 'temperature': return value >= 35 && value <= 39;
      case 'respiratory_rate': return value >= 8 && value <= 30;
      default: return true;
    }
  }

  static getLatestReading(model: TelemedicineModel, patientId: string, signal: RemoteMonitoringSignal): RemoteMonitoringReading | undefined {
    return model.monitoringReadings
      .filter(r => r.patientId === patientId && r.signal === signal)
      .sort((a, b) => b.recordedAt - a.recordedAt)[0];
  }

  static getAbnormalReadings(model: TelemedicineModel, patientId?: string): RemoteMonitoringReading[] {
    return model.monitoringReadings.filter(r => r.interpreted && !r.interpreted.withinLimits && (!patientId || r.patientId === patientId));
  }

  // ── Virtual Ward Engine ──────────────────────────────────────────────────────

  static admitToVirtualWard(model: TelemedicineModel, actorId: AmxUid | undefined, input: { patientId: string; consultantId: AmxUid; dischargePlan?: string; emergencyPlan?: string; homeDevices?: string[] }): { model: TelemedicineModel; admission: VirtualWardAdmission } {
    TelemedicineEngine.guard(model, input.consultantId, 'admit_to_virtual_ward');
    const admission: VirtualWardAdmission = {
      id: nextId('vw'),
      patientId: input.patientId,
      consultantId: input.consultantId,
      admittedAt: Date.now(),
      dischargePlan: input.dischargePlan,
      status: 'active',
      dailyObservations: [],
      medicationAdherence: [],
      virtualNursingVisits: [],
      doctorReviews: [],
      escalations: [],
      familyEducation: [],
      homeDevices: input.homeDevices ?? [],
      emergencyPlan: input.emergencyPlan,
    };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'virtual_ward_admission', input.patientId), virtualWardAdmissions: [...model.virtualWardAdmissions, admission], analytics: { ...model.analytics, virtualWardAdmissions: model.analytics.virtualWardAdmissions + 1 }, updatedAt: Date.now() },
      admission,
    };
  }

  static recordVirtualWardObservation(model: TelemedicineModel, admissionId: string, summary: string): TelemedicineModel {
    const index = model.virtualWardAdmissions.findIndex(a => a.id === admissionId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Virtual ward admission "${admissionId}" does not exist`);
    const current = model.virtualWardAdmissions[index];
    const updated = { ...current, dailyObservations: [...current.dailyObservations, { date: Date.now(), summary }] };
    return { ...model, virtualWardAdmissions: [...model.virtualWardAdmissions.slice(0, index), updated, ...model.virtualWardAdmissions.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordVirtualWardAdherence(model: TelemedicineModel, admissionId: string, adherencePercent: number): TelemedicineModel {
    const index = model.virtualWardAdmissions.findIndex(a => a.id === admissionId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Virtual ward admission "${admissionId}" does not exist`);
    const current = model.virtualWardAdmissions[index];
    const updated = { ...current, medicationAdherence: [...current.medicationAdherence, { date: Date.now(), adherencePercent }] };
    return { ...model, virtualWardAdmissions: [...model.virtualWardAdmissions.slice(0, index), updated, ...model.virtualWardAdmissions.slice(index + 1)], updatedAt: Date.now() };
  }

  static escalateVirtualWard(model: TelemedicineModel, admissionId: string, reason: string, target: string): TelemedicineModel {
    const index = model.virtualWardAdmissions.findIndex(a => a.id === admissionId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Virtual ward admission "${admissionId}" does not exist`);
    const current = model.virtualWardAdmissions[index];
    const updated = { ...current, escalations: [...current.escalations, { at: Date.now(), reason, target, resolved: false }] };
    return { ...model, virtualWardAdmissions: [...model.virtualWardAdmissions.slice(0, index), updated, ...model.virtualWardAdmissions.slice(index + 1)], updatedAt: Date.now() };
  }

  static dischargeVirtualWard(model: TelemedicineModel, admissionId: string): TelemedicineModel {
    const index = model.virtualWardAdmissions.findIndex(a => a.id === admissionId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Virtual ward admission "${admissionId}" does not exist`);
    const updated = { ...model.virtualWardAdmissions[index], status: 'discharged' as const, dischargedAt: Date.now() };
    return { ...model, virtualWardAdmissions: [...model.virtualWardAdmissions.slice(0, index), updated, ...model.virtualWardAdmissions.slice(index + 1)], updatedAt: Date.now() };
  }

  static getActiveVirtualWardAdmissions(model: TelemedicineModel): VirtualWardAdmission[] {
    return model.virtualWardAdmissions.filter(a => a.status === 'active');
  }

  // ── Referral Engine ──────────────────────────────────────────────────────────

  static createReferral(model: TelemedicineModel, actorId: AmxUid | undefined, input: Omit<Referral, 'id' | 'createdAt' | 'status' | 'traceLog'>): { model: TelemedicineModel; referral: Referral } {
    TelemedicineEngine.guard(model, input.fromClinicianId, 'refer_across_facilities');
    const referral: Referral = { ...input, id: nextId('ref'), createdAt: Date.now(), status: 'created', traceLog: [{ at: Date.now(), action: 'referral_created', by: input.fromClinicianId }] };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'referral_created', input.kind), referrals: [...model.referrals, referral], updatedAt: Date.now() },
      referral,
    };
  }

  static acceptReferral(model: TelemedicineModel, referralId: string, acceptingClinicianId: AmxUid): TelemedicineModel {
    const index = model.referrals.findIndex(r => r.id === referralId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Referral "${referralId}" does not exist`);
    const current = model.referrals[index];
    const updated = { ...current, status: 'accepted' as const, traceLog: [...current.traceLog, { at: Date.now(), action: 'referral_accepted', by: acceptingClinicianId }] };
    return { ...model, referrals: [...model.referrals.slice(0, index), updated, ...model.referrals.slice(index + 1)], updatedAt: Date.now() };
  }

  static completeReferral(model: TelemedicineModel, referralId: string): TelemedicineModel {
    const index = model.referrals.findIndex(r => r.id === referralId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Referral "${referralId}" does not exist`);
    const current = model.referrals[index];
    const updated = { ...current, status: 'completed' as const, traceLog: [...current.traceLog, { at: Date.now(), action: 'referral_completed' }] };
    return {
      ...model,
      referrals: [...model.referrals.slice(0, index), updated, ...model.referrals.slice(index + 1)],
      analytics: { ...model.analytics, referralsCompleted: model.analytics.referralsCompleted + 1 },
      updatedAt: Date.now(),
    };
  }

  static getReferralTrace(model: TelemedicineModel, referralId: string): { action: string; at: number; by?: AmxUid }[] | undefined {
    return model.referrals.find(r => r.id === referralId)?.traceLog;
  }

  // ── MDT Engine ───────────────────────────────────────────────────────────────

  static scheduleMdt(model: TelemedicineModel, actorId: AmxUid | undefined, input: Omit<MdtMeeting, 'id' | 'status' | 'decisions' | 'sharedDecisionRecorded'>): { model: TelemedicineModel; meeting: MdtMeeting } {
    const meeting: MdtMeeting = { ...input, id: nextId('mdt'), status: 'scheduled', decisions: [], sharedDecisionRecorded: false };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'mdt_scheduled', input.topic), mdtMeetings: [...model.mdtMeetings, meeting], updatedAt: Date.now() },
      meeting,
    };
  }

  static recordMdtDecision(model: TelemedicineModel, meetingId: string, decision: string, madeBy: AmxUid): TelemedicineModel {
    const index = model.mdtMeetings.findIndex(m => m.id === meetingId);
    if (index === -1) throw new Error(`[TelemedicineEngine] MDT meeting "${meetingId}" does not exist`);
    const current = model.mdtMeetings[index];
    const updated = { ...current, decisions: [...current.decisions, { decision, madeBy, documentedAt: Date.now() }], sharedDecisionRecorded: true };
    return { ...model, mdtMeetings: [...model.mdtMeetings.slice(0, index), updated, ...model.mdtMeetings.slice(index + 1)], updatedAt: Date.now() };
  }

  static holdMdt(model: TelemedicineModel, meetingId: string): TelemedicineModel {
    const index = model.mdtMeetings.findIndex(m => m.id === meetingId);
    if (index === -1) throw new Error(`[TelemedicineEngine] MDT meeting "${meetingId}" does not exist`);
    const updated = { ...model.mdtMeetings[index], status: 'held' as const, heldAt: Date.now() };
    return { ...model, mdtMeetings: [...model.mdtMeetings.slice(0, index), updated, ...model.mdtMeetings.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Global Specialist Network ────────────────────────────────────────────────

  static requestSpecialistOpinion(model: TelemedicineModel, actorId: AmxUid | undefined, input: { patientId: string; consultationId?: string; expertId: AmxUid; source: SpecialistSource; specialty: string; country?: string; question: string }): { model: TelemedicineModel; opinion: SpecialistOpinion } {
    TelemedicineEngine.guard(model, input.expertId, 'consult_global_specialists');
    const opinion: SpecialistOpinion = { ...input, id: nextId('so'), askedAt: Date.now(), linkedToEncounter: false, status: 'requested' };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'specialist_opinion_requested', input.specialty), specialistOpinions: [...model.specialistOpinions, opinion], updatedAt: Date.now() },
      opinion,
    };
  }

  static provideSpecialistOpinion(model: TelemedicineModel, opinionId: string, opinion: string): TelemedicineModel {
    const index = model.specialistOpinions.findIndex(o => o.id === opinionId);
    if (index === -1) throw new Error(`[TelemedicineEngine] Specialist opinion "${opinionId}" does not exist`);
    const updated = { ...model.specialistOpinions[index], opinion, respondedAt: Date.now(), status: 'provided' as const, linkedToEncounter: true };
    return { ...model, specialistOpinions: [...model.specialistOpinions.slice(0, index), updated, ...model.specialistOpinions.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Patient Portal ───────────────────────────────────────────────────────────

  static activatePortalAccount(model: TelemedicineModel, actorId: AmxUid | undefined, input: { patientId: string; enabledAreas: PortalAccessArea[] }): { model: TelemedicineModel; account: PatientPortalAccount } {
    TelemedicineEngine.guard(model, actorId ?? model.chiefTelemedicineOfficerId ?? ('' as AmxUid), 'manage_patient_portal');
    const account: PatientPortalAccount = { id: nextId('pp'), patientId: input.patientId, activatedAt: Date.now(), enabledAreas: input.enabledAreas, active: true };
    return {
      model: { ...TelemedicineEngine.audit(model, actorId, 'portal_account_activated', input.patientId), portalAccounts: [...model.portalAccounts, account], updatedAt: Date.now() },
      account,
    };
  }

  static getPortalAccount(model: TelemedicineModel, patientId: string): PatientPortalAccount | undefined {
    return model.portalAccounts.find(a => a.patientId === patientId && a.active);
  }

  // ── AI Telemedicine Companion ────────────────────────────────────────────────

  static aiTelemedicineInsight(model: TelemedicineModel, kind: TelemedicineAiKind, input: { patientId?: string; consultationId?: string; context: string }): { model: TelemedicineModel; insight: TelemedicineAiInsight } {
    let output = input.context;
    switch (kind) {
      case 'pre_consultation_summarization':
        output = `Pre-consultation summary generated: ${input.context}`;
        break;
      case 'conversation_transcription':
        output = `Consultation transcript captured for review: ${input.context}`;
        break;
      case 'clinical_documentation':
        output = `Draft clinical documentation prepared: ${input.context}`;
        break;
      case 'follow_up_reminders':
        output = `Follow-up reminders scheduled based on: ${input.context}`;
        break;
      case 'escalation_detection':
        output = /critical|emergency|severe/i.test(input.context) ? 'Escalation recommended — high-risk context detected.' : 'No escalation signal detected.';
        break;
      case 'translation':
        output = `Translation service engaged for: ${input.context}`;
        break;
      case 'risk_stratification':
      case 'education':
      default:
        output = `AI insight for ${kind}: ${input.context}`;
    }
    const insight: TelemedicineAiInsight = { id: nextId('tai'), patientId: input.patientId, consultationId: input.consultationId, kind, output, confidence: 0.75, generatedAt: Date.now() };
    return { model: { ...model, aiInsights: [...model.aiInsights, insight], updatedAt: Date.now() }, insight };
  }

  // ── Telemedicine Analytics ───────────────────────────────────────────────────

  static updateSatisfaction(model: TelemedicineModel, satisfactionScore: number): TelemedicineModel {
    const current = model.analytics.patientSatisfaction;
    const totalConsultations = model.analytics.totalConsultations;
    const merged = totalConsultations > 0 ? (current * (totalConsultations - 1) + satisfactionScore) / totalConsultations : satisfactionScore;
    return { ...model, analytics: { ...model.analytics, patientSatisfaction: Number(merged.toFixed(2)) }, updatedAt: Date.now() };
  }

  static recordGeographicalCoverage(model: TelemedicineModel, region: string): TelemedicineModel {
    const current = model.analytics.geographicalCoverage;
    const index = current.findIndex(g => g.region === region);
    const next = index === -1 ? [...current, { region, consultations: 1 }] : current.map((g, i) => i === index ? { ...g, consultations: g.consultations + 1 } : g);
    return { ...model, analytics: { ...model.analytics, geographicalCoverage: next }, updatedAt: Date.now() };
  }

  static recordDiseaseTrend(model: TelemedicineModel, condition: string): TelemedicineModel {
    const current = model.analytics.diseaseTrends;
    const index = current.findIndex(d => d.condition === condition);
    const next = index === -1 ? [...current, { condition, count: 1 }] : current.map((d, i) => i === index ? { ...d, count: d.count + 1 } : d);
    return { ...model, analytics: { ...model.analytics, diseaseTrends: next }, updatedAt: Date.now() };
  }

  static markMissedAppointment(model: TelemedicineModel): TelemedicineModel {
    return { ...model, analytics: { ...model.analytics, missedAppointments: model.analytics.missedAppointments + 1 }, updatedAt: Date.now() };
  }

  // ── Read conveniences / dashboard ────────────────────────────────────────────

  static getOpenConsultations(model: TelemedicineModel): RemoteConsultation[] {
    return model.consultations.filter(c => c.status !== 'completed' && c.status !== 'cancelled');
  }

  static getConsultationsForPatient(model: TelemedicineModel, patientId: string): RemoteConsultation[] {
    return model.consultations.filter(c => c.patientId === patientId);
  }

  static getDashboardSummary(model: TelemedicineModel): {
    activeConsultations: number;
    activeVirtualWardPatients: number;
    abnormalReadings: number;
    openReferrals: number;
    pendingAsyncReviews: number;
    providers: number;
  } {
    return {
      activeConsultations: model.consultations.filter(c => c.status === 'in_progress' || c.status === 'scheduled').length,
      activeVirtualWardPatients: TelemedicineEngine.getActiveVirtualWardAdmissions(model).length,
      abnormalReadings: TelemedicineEngine.getAbnormalReadings(model).length,
      openReferrals: model.referrals.filter(r => r.status === 'created' || r.status === 'accepted').length,
      pendingAsyncReviews: model.asyncConsultations.filter(a => a.status === 'notified' || a.status === 'in_review').length,
      providers: new Set(model.consultations.map(c => c.clinicianId)).size,
    };
  }
}

export default TelemedicineEngine;
