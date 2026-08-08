// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN COS — Canonical Clinical Operating Types
//
// These are the OBJECTS the clinical workspace creates and mutates. Every
// action must create or update the correct underlying clinical object and
// remain traceable to the patient, encounter, clinician, facility, time, and
// authorization context. This file defines those contracts. It never stores
// data; it only describes shape.
// ═══════════════════════════════════════════════════════════════════════════════

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'stable';

export type ClinicalStatus = 'active' | 'in_review' | 'disposition' | 'discharged';

export type OrderStatus = 'draft' | 'ordered' | 'sent' | 'resulted' | 'cancelled';

export type ResultQuality = 'normal' | 'abnormal' | 'critical' | 'pending';

export type NoteAuthStatus = 'draft' | 'verified' | 'signed';

/** The constitutional envelope every action carries. */
export interface EnvironmentContext {
  organizationId?: string;
  facilityId?: string;
  departmentId?: string;
  wardId?: string;
  clinicianId?: string;
  clinicianName?: string;
  roleId?: string;
  credential?: string;
  deviceId?: string;
}

/** The universal patient workspace unit — a patient inside an active encounter/episode. */
export interface WorkspacePatient {
  patientId?: string;
  encounterId?: string;
  mrn?: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other' | 'undisclosed';
  bed?: string;
  wardId?: string;
  diagnosis?: string;
  episodeDay?: number;
  priority?: PriorityLevel;
  location?: string;
  lastReview?: number;
  status: ClinicalStatus;
}

/** One row on a patient's priority board. */
export interface PriorityCard {
  patientId?: string;
  encounterId?: string;
  name: string;
  mrn?: string;
  age: number;
  sex: 'male' | 'female' | 'other' | 'undisclosed';
  location?: string;
  diagnosis?: string;
  episodeDay?: number;
  status: 'critical' | 'attention' | 'stable';
  triggers: TriggerFlag[];
}

export interface TriggerFlag {
  severy: 'critical' | 'warning' | 'info';
  label: string;
  detail?: string;
}

/** A sign/symptom/observation recorded during a review. */
export interface ClinicalObservation {
  code: string;
  label: string;
  value?: string | number;
  unit?: string;
  flags?: string[];
  trend?: 'up' | 'down' | 'stable';
  at?: number;
}

/** Current physiological status / vitals snapshot. */
export interface VitalsSnapshot {
  spo2?: string;
  rr?: string;
  temp?: string;
  bp?: string;
  hr?: string;
  gcs?: string;
  recordedAt?: number;
}

/** An order issued through the Universal Orders engine. */
export interface ClinicalOrder {
  id: string;
  patientId?: string;
  encounterId?: string;
  clinicianId: string;
  clinicianName?: string;
  contextId: string; // wardRound/hospitalEpisode/outpatient
  kind: 'medication' | 'lab' | 'imaging' | 'procedure' | 'nursing' | 'diet' | 'service' | 'monitoring';
  name: string;
  detail?: string;
  priority: 'stat' | 'urgent' | 'routine';
  destination?: string;
  status: ClinicalStatus;
  reason?: string;
  createdAt: number;
  updatedAt: number;
  env: EnvironmentContext;
}

/** A clinical note / ward round review entry. */
export interface ClinicalNote {
  id: string;
  patientId?: string;
  encounterId?: string;
  contextId?: string;
  roundId?: string;
  type: 'ward_round' | 'admission' | 'progress' | 'discharge' | 'referral';
  phase: 'draft' | 'verified' | 'signed';
  generatedAt?: string;
  clinician: {
    id: string;
    name: string;
    roleId?: string;
  };
  structured: AmexanNoteStructured;
  createdAt: number;
  updatedAt: number;
  env: EnvironmentContext;
}

/** Structured documentation body (auto-populated from observations, clinician verifies). */
export interface AmexanNoteStructured {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  problems?: string[];
  investigations?: string[];
  clinicalInterpretation?: string;
  escalation?: string;
  followUp?: string;
}

/** Immutable, traceable audit event appended to a patient's timeline. */
export interface TimelineEvent {
  id: string;
  patientId?: string;
  encounterId?: string;
  contextId?: string;
  at: number;
  actor: string;
  actorName?: string;
  category: 'clinical' | 'ordering' | 'result' | 'documentation' | 'medication' | 'admission' | 'disposition' | 'communication' | 'intelligence';
  title: string;
  detail?: string;
  env: EnvironmentContext;
}

/** A decision captured during a ward round. */
export interface ClinicalDecision {
  id: string;
  kind: 'continue' | 'escalate' | 'investigate' | 'refer' | 'discharge' | 'review';
  text: string;
  orders: string[];
  createdAt: number;
  clinician: { id: string; name: string };
  env: EnvironmentContext;
}

/** A round review for one patient. */
export interface RoundReview {
  patientId: string;
  encounterId?: string;
  reviewedAt?: number;
  reviewer?: { id: string; name: string };
  noteId?: string;
  decisions: ClinicalDecision[];
  status: 'pending' | 'reviewed';
}

/** A scheduled/today's clinical activity in the agenda. */
export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  activity: 'ward_round' | 'mdt' | 'clinic' | 'theatre' | 'followup' | 'teaching';
  location?: string;
}

/** Unified clinical inbox categories. */
export type InboxBucket = 'results' | 'consult_requests' | 'messages' | 'tasks' | 'referrals' | 'signatures' | 'ai_observations';

export interface InboxSummary {
  bucket: InboxBucket;
  count: number;
}