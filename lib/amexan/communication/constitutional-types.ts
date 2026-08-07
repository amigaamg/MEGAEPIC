// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Communication Engine — Engine IV — Constitutional Types
// Constitutional principles:
//   C1  Every communication has an OWNER (author, department, approval, status).
//   C2  Every communication has a PURPOSE (kind, never a free-form blob).
//   C3  Every communication targets the RIGHT AUDIENCE — never "everyone"
//       unless that is the actual intent (emergencies, mandatory policies).
//   C4  Acknowledgement is measured — delivered/open/read/acknowledged/ignored.
//   C5  The engine is the hospital's OFFICIAL communication authority — every
//       item is version-controlled, auditable, searchable, and owned.
//
// These types are the single source of truth for organizational communication.
// This module is a PURE kernel: it imports nothing from Firestore/Postgres/Neo4j.
// ═══════════════════════════════════════════════════════════════════════════════

/** Every official communication must have a purpose (Owner Rule 2). */
export type CommunicationPurpose =
  | 'announcement'      // general information (anniversary, new consultant, holidays)
  | 'circular'          // formal, permanent administrative directive
  | 'policy'            // living policy document (versioned, owned, reviewed)
  | 'meeting'           // meeting invitation / agenda / minutes
  | 'emergency'         // emergency broadcast (code blue, red, mass casualty…)
  | 'alert'             // operational alert (system / infrastructure / clinical)
  | 'task'              // assigned task with acknowledgement
  | 'reminder'          // time-boxed reminder
  | 'training'          // training / CPD / induction notice
  | 'research'          // research invitation / recruitment
  | 'maintenance'       // scheduled maintenance / outage notice
  | 'public_notice';    // public / community-facing notice

/** Delivery severity — an escalation ladder the engine understands. */
export type BroadcastSeverity = 'info' | 'warning' | 'critical' | 'life_threatening';

/** Owner approval + publication lifecycle. */
export type PublicationStatus = 'draft' | 'pending_approval' | 'scheduled' | 'published' | 'archived' | 'superseded' | 'active' | 'review';

/** Who must read & acknowledge. Supplying an audience is mandatory (Rule 3). */
export interface TargetAudience {
  /** true = "everyone in the organization" — must be an explicit choice. */
  everyone: boolean;
  roles?: string[];          // e.g. ['nurse', 'doctor', 'facility_administrator']
  departments?: string[];    // node ids / department names
  individuals?: string[];    // explicit person ids
  allDepartments?: boolean;  // every department (still narrower than everyone for staff)
}

/** Prefix per purpose for stable, searchable document numbers. */
export const PURPOSE_PREFIX: Record<CommunicationPurpose, string> = {
  announcement: 'ANN',
  circular: 'CIR',
  policy: 'POL',
  meeting: 'MEE',
  emergency: 'EMG',
  alert: 'ALT',
  task: 'TSK',
  reminder: 'REM',
  training: 'TRN',
  research: 'RES',
  maintenance: 'MNT',
  public_notice: 'PUB',
};

export interface CommunicationAuthor {
  uid: string;             // Actor / Person id
  name: string;
  role?: string;
  departmentId?: string;
  departmentName?: string;
}

export interface Attachment {
  name: string;
  type: 'pdf' | 'image' | 'video' | 'doc' | 'link' | 'lab' | 'radiology';
  url: string;
  sizeBytes?: number;
}

/** Every communication item shares these constitutional base fields. */
export interface CommunicationBaseFields {
  id: string;               // AMX-<PREFIX>-<code>-<seq>
  organizationId: string;
  kind: CommunicationPurpose;
  title: string;
  summary?: string;
  body: string;
  author: CommunicationAuthor;
  audience: TargetAudience;
  severity: BroadcastSeverity;
  status: PublicationStatus;
  channels: ('in_app' | 'dashboard' | 'sms' | 'email' | 'hospital_screen' | 'public_address' | 'pager' | 'mobile')[];
  requiresAcknowledgement: boolean;
  allowComments: boolean;
  attachments: Attachment[];
  tags: string[];
  createdAt: number;
  createdBy: string;         // the person who authored
  updatedAt: number;
  approvedBy?: string;
  approvedAt?: number;
  scheduledFor?: number;
  publishedAt?: number;
  expiresAt?: number;
}

// ── Purpose-specific extensions ───────────────────────────────────────────────

/** Announcement — dynamic, expires. */
export interface AnnouncementRecord extends CommunicationBaseFields {
  purpose: 'announcement';
}

/** Circular — permanent institutional document with version lineage. */
export interface CircularRecord extends CommunicationBaseFields {
  purpose: 'circular';
  circularNumber: string;    // e.g. CIR-2026-014
  version: string;
  effectiveDate?: string;
  supersedes?: string;        // previous circular number
  policyLinks: string[];      // linked policy ids
}

/** Policy — living, reviewable, supersede-capable library entry. */
export interface PolicyRecord extends CommunicationBaseFields {
  purpose: 'policy';
  policyCode: string;
  version: string;
  owner: string;             // department / committee responsible
  reviewDate?: string;
  approvedByCommittee?: string;
  status: PublicationStatus;
  reviewCycleDays?: number;
}

/** Emergency broadcast — highest authority, drives Red Mode. */
export interface EmergencyBroadcast extends CommunicationBaseFields {
  purpose: 'emergency';
  emergencyType:
    | 'code_blue' | 'code_red' | 'mass_casualty' | 'fire' | 'network_failure'
    | 'power_failure' | 'oxygen_failure' | 'security_incident' | 'flood'
    | 'earthquake' | 'disease_outbreak' | 'pandemic' | 'other';
  liveSituation?: string;
  commandOverride: boolean;   // auto-acknowledge + fullscreen banner
}

/** The broad base record union used by the engine. */
export type CommunicationItem =
  | AnnouncementRecord
  | CircularRecord
  | PolicyRecord
  | EmergencyBroadcast
  | CommunicationBaseFields; // alerts, tasks, reminders, meetings, etc.

// ── Meetings ──────────────────────────────────────────────────────────────────

export interface MeetingAgendaItem {
  id: string;
  title: string;
  presenter?: string;
  durationMinutes?: number;
  order: number;
}

export interface MeetingRecord {
  id: string;
  organizationId: string;
  kind: 'board' | 'mortality' | 'morbidity' | 'department' | 'mdt' | 'research' | 'cpd' | 'teaching' | 'committee' | 'emergency_briefing';
  title: string;
  organizer: CommunicationAuthor;
  venue?: string;
  virtualLink?: string;
  scheduledAt: number;
  durationMinutes: number;
  participants: string[];     // person ids
  agenda: MeetingAgendaItem[];
  attendance: string[];       // person ids who actually attended
  minutes?: string;
  resolutions: string[];
  tasks: { id: string; title: string; assignee?: string; dueAt?: number; done: boolean }[];
  followUpAt?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

// ── Committees ────────────────────────────────────────────────────────────────

export interface CommitteeMember {
  personId: string;
  name: string;
  role: string;       // chair / secretary / member
  since: number;
}

export interface CommitteeRecord {
  id: string;
  name: string;
  purpose: string;
  members: CommitteeMember[];
  meetingIds: string[];
  tasks: { id: string; title: string; status: 'open' | 'done'; assignee?: string }[];
  recommendations: string[];
  createdAt: number;
  updatedAt: number;
}

// ── Acknowledgement ───────────────────────────────────────────────────────────

export type AcknowledgementState = 'delivered' | 'opened' | 'read' | 'acknowledged' | 'ignored';

export interface AcknowledgementRecord {
  id: string;
  organizationId: string;
  communicationId: string;
  personId: string;
  personName: string;
  department: string;
  state: AcknowledgementState;
  firstDeliveredAt: number;
  openedAt?: number;
  readAt?: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  signature?: string;         // digital signature proof
  comments?: string;
}

// ── Internal messaging (professional, permission-controlled) ──────────────────

export interface DirectMessage {
  id: string;
  organizationId: string;
  senderName: string;
  senderUid: string;
  recipients: string[];            // person ids OR a group key
  recipientGroup?: 'department' | 'committee' | 'role' | 'all';
  channel: 'department' | 'committee' | 'role' | 'individual' | 'hospital';
  body: string;
  attachments?: Attachment[];
  patientId?: string;              // only with permission
  createdAt: number;
  readBy: string[];
  priority: BroadcastSeverity;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export interface CommunicationTemplate {
  id: string;
  name: string;
  purpose: CommunicationPurpose;
  subject: string;
  body: string;
  audience: TargetAudience;
  channels: CommunicationBaseFields['channels'];
  requiresAcknowledgement: boolean;
}

// ── The Engine Model ─────────────────────────────────────────────────────────

export interface CommunicationModel {
  organizationId: string;
  items: CommunicationItem[];                // announcements, circulars, policies, emergencies, alerts…
  meetings: MeetingRecord[];
  committees: CommitteeRecord[];
  acknowledgements: AcknowledgementRecord[];
  messages: DirectMessage[];
  templates: CommunicationTemplate[];
  auditLog: { at: number; actorId: string; action: string; referenceId?: string; detail?: string }[];
  redMode: boolean;
  emergencyInProgress?: string;              // current emergency broadcast id
  createdAt: number;
  updatedAt: number;
}

export interface CreateCommunicationModelInput {
  organizationId: string;
}