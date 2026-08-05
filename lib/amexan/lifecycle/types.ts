// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN BOOK VIII — CLINICAL OPERATING LIFECYCLE
// Shared types for the Five Centers: PERSON · PATIENT · ENCOUNTER · KNOWLEDGE ·
// ORGANIZATION. Everything else references these. Nothing floats independently.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Center 1: PERSON ───────────────────────────────────────────────────────────

export interface PersonCenterModel {
  personId: AmxUid;
  identityId: AmxUid;
  actors: ActorProfile[];
  capabilities: string[];
  memberships: string[];
  sessions: SessionRecord[];
  updatedAt: number;
}

export interface ActorProfile {
  actorId: AmxUid;
  personId: AmxUid;
  categories: string[];
  primaryCategory: string;
  specialties: string[];
  roles: string[];
  organizations: string[];
  active: boolean;
}

export interface SessionRecord {
  id: string;
  actorId: AmxUid;
  startedAt: number;
  lastActiveAt: number;
  endedAt?: number;
  organizationId?: string;
  deviceInfo?: string;
  ipAddress?: string;
  active: boolean;
}

// ── Center 2: PATIENT ──────────────────────────────────────────────────────────

export interface PatientCenterModel {
  patientId: string;
  personId: AmxUid;
  demographics: PatientDemographics;
  contacts: PatientContact[];
  insurance: PatientInsurance[];
  consent: ConsentRecord[];
  guardians: GuardianRecord[];
  timeline: PatientTimelineEvent[];
  family: FamilyMember[];
  riskProfile: Record<string, number>;
  careNetwork: string[];
  followUpPlan?: FollowUpPlan;
  education: PatientEducationRecord[];
  goals: PatientGoal[];
  alerts: PatientAlert[];
  createdAt: number;
  updatedAt: number;
}

export interface PatientDemographics {
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'undisclosed';
  bloodGroup?: string;
  nationalId?: string;
  maritalStatus?: string;
  occupation?: string;
  religion?: string;
  language?: string;
}

export interface PatientContact {
  id: string;
  type: 'phone' | 'email' | 'address' | 'kin' | 'other';
  value: string;
  isPrimary: boolean;
}

export interface PatientInsurance {
  id: string;
  provider: string;
  policyNumber: string;
  scheme: string;
  memberNumber?: string;
  validFrom: number;
  validUntil: number;
  coverLevel: string;
  active: boolean;
}

export interface ConsentRecord {
  id: string;
  type: string;
  scope: string;
  grantedAt: number;
  grantedBy?: AmxUid;
  revokedAt?: number;
  version: string;
}

export interface GuardianRecord {
  id: string;
  personId: AmxUid;
  relationship: string;
  consentLevel: string;
  contactPhone: string;
  isLegalGuardian: boolean;
}

export interface PatientTimelineEvent {
  id: string;
  type: 'birth' | 'vaccine' | 'clinic' | 'admission' | 'operation' | 'pregnancy' | 'disease' | 'follow_up' | 'death' | 'other';
  title: string;
  at: number;
  organizationId?: string;
  encounterId?: string;
  detail?: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  relationship: string;
  living: boolean;
  relevantHistory: string[];
}

export interface FollowUpPlan {
  id: string;
  patientId: string;
  reason: string;
  intervalDays: number;
  nextDueAt: number;
  providerId?: AmxUid;
  instructions: string[];
  active: boolean;
}

export interface PatientEducationRecord {
  id: string;
  topic: string;
  deliveredAt: number;
  deliveredBy?: AmxUid;
  materials: string[];
  understood: boolean;
}

export interface PatientGoal {
  id: string;
  description: string;
  targetDate?: number;
  achieved: boolean;
  achievedAt?: number;
}

export interface PatientAlert {
  id: string;
  type: 'allergy' | 'warning' | 'flag';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail?: string;
  active: boolean;
}

// ── Center 3: ENCOUNTER ────────────────────────────────────────────────────────

export type EncounterType =
  | 'emergency' | 'outpatient' | 'inpatient' | 'theatre' | 'icu'
  | 'maternity' | 'telemedicine' | 'home_visit' | 'procedure' | 'other';

export type EncounterStage =
  | 'registration' | 'triage' | 'history' | 'examination' | 'investigation'
  | 'diagnosis' | 'management' | 'monitoring' | 'discharge' | 'follow_up' | 'closed';

export interface EncounterModel {
  id: string;
  patientId: string;
  organizationId: string;
  type: EncounterType;
  stage: EncounterStage;
  registeredAt: number;
  closedAt?: number;
  registeredBy: AmxUid;
  triage?: TriageRecord;
  history?: HistoryRecord;
  examination?: ExaminationRecord;
  investigations: InvestigationOrder[];
  diagnoses: DiagnosisRecord[];
  management: ManagementRecord[];
  monitoring: MonitoringRecord[];
  discharge?: DischargeRecord;
  events: EncounterEvent[];
  status: 'open' | 'closed';
}

export interface TriageRecord {
  id: string;
  acuity: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  presentingComplaint: string;
  triagedAt: number;
  triagedBy: AmxUid;
  priorityScore: number;
  waitTimeMinutes?: number;
}

export interface HistoryRecord {
  id: string;
  chiefComplaint: string;
  hpi: string;
  associatedSymptoms: string[];
  pmh: string[];
  psh: string[];
  drugs: string[];
  allergies: { allergen: string; reaction: string }[];
  familyHistory: string[];
  socialHistory: string[];
  reviewSystems: Record<string, string>;
  takenAt: number;
  takenBy: AmxUid;
}

export interface ExaminationRecord {
  id: string;
  general: string;
  vitals: { systolicBP?: number; diastolicBP?: number; heartRate?: number; respiratoryRate?: number; temperature?: number; spo2?: number; weightKg?: number; gcs?: number };
  systems: Record<string, string>;
  positiveFindings: string[];
  negativeFindings: string[];
  examinedAt: number;
  examinedBy: AmxUid;
}

export interface InvestigationOrder {
  id: string;
  type: 'lab' | 'imaging' | 'microbiology' | 'pathology' | 'other';
  tests: string[];
  orderedAt: number;
  orderedBy: AmxUid;
  status: 'ordered' | 'collected' | 'in_progress' | 'resulted' | 'cancelled';
  resultId?: string;
  resultSummary?: string;
}

export type DiagnosisStatus = 'working' | 'differential' | 'confirmed' | 'excluded';

export interface DiagnosisRecord {
  id: string;
  code?: string;
  name: string;
  status: DiagnosisStatus;
  certainty: number;
  notedAt: number;
  notedBy: AmxUid;
}

export interface ManagementRecord {
  id: string;
  type: 'medication' | 'procedure' | 'referral' | 'admission' | 'observation' | 'education' | 'consent' | 'billing' | 'other';
  title: string;
  detail?: string;
  orderedAt: number;
  orderedBy: AmxUid;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  linkedResourceId?: string;
}

export interface MonitoringRecord {
  id: string;
  type: 'vitals' | 'obs' | 'fluid' | 'pain' | 'ew_score';
  value: string;
  recordedAt: number;
  recordedBy: AmxUid;
  note?: string;
}

export interface DischargeRecord {
  id: string;
  summary: string;
  prescriptions: string[];
  education: string[];
  followUpPlan?: string;
  completedAt: number;
  completedBy: AmxUid;
  dischargeDisposition: 'home' | 'transfer' | 'death' | 'ama' | 'other';
}

export interface EncounterEvent {
  id: string;
  type: string;
  at: number;
  actorId: AmxUid;
  payload: string;
}

// ── Center 5: ORGANIZATION ─────────────────────────────────────────────────────
// Everything administrative. Hospital, departments, users, permissions, buildings,
// beds, theatres, clinics, inventory, HR, finance, analytics. Stored mostly in
// PostgreSQL; relationships mirrored into Neo4j.

export interface OrganizationCenterModel {
  organizationId: string;
  name: string;
  type?: string;
  departments: OrganizationDepartment[];
  users: OrganizationUser[];
  permissions: OrganizationPermission[];
  buildings: OrganizationBuilding[];
  beds: OrganizationBed[];
  theatres: OrganizationTheatre[];
  clinics: OrganizationClinic[];
  inventory: OrganizationInventoryItem[];
  hrSummary: OrganizationHrSummary;
  financeSummary: OrganizationFinanceSummary;
  analytics: OrganizationAnalytics;
  updatedAt: number;
}

export interface OrganizationDepartment {
  id: string;
  name: string;
  type: string;
  buildingId?: string;
  managerId?: AmxUid;
  staffIds: AmxUid[];
  active: boolean;
}

export interface OrganizationUser {
  id: string;
  personId: AmxUid;
  departmentId?: string;
  roles: string[];
  permissions: string[];
  active: boolean;
}

export interface OrganizationPermission {
  id: string;
  actorId?: AmxUid;
  role?: string;
  departmentId?: string;
  actions: string[];
  grantedAt: number;
  grantedBy?: AmxUid;
}

export interface OrganizationBuilding {
  id: string;
  name: string;
  address?: string;
  floors: number;
  departments: string[];
}

export interface OrganizationBed {
  id: string;
  bedNumber: string;
  wardId: string;
  buildingId?: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'out_of_service';
  patientId?: string;
  occupiedSince?: number;
  equipment: string[];
}

export interface OrganizationTheatre {
  id: string;
  name: string;
  buildingId?: string;
  status: 'available' | 'in_use' | 'scheduled' | 'maintenance';
  currentProcedureId?: string;
  equipment: string[];
  nextAvailableAt?: number;
}

export interface OrganizationClinic {
  id: string;
  name: string;
  type: string;
  buildingId?: string;
  consultationRooms: number;
  schedule: { day: string; startTime: string; endTime: string; clinicianId?: AmxUid }[];
}

export interface OrganizationInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitCost?: number;
  locationId?: string;
  expiresAt?: number;
}

export interface OrganizationHrSummary {
  headcount: number;
  byDepartment: Record<string, number>;
  vacancies: number;
  onLeave: number;
  trainingCompliancePercent: number;
}

export interface OrganizationFinanceSummary {
  monthlyRevenue: number;
  monthlyExpenses: number;
  outstandingDebt: number;
  departmentProfitability: Record<string, number>;
}

export interface OrganizationAnalytics {
  utilization: Record<string, number>;
  keyIndicators: Record<string, number>;
  updatedAt: number;
}

// ── Center 4: KNOWLEDGE ────────────────────────────────────────────────────────
export interface KnowledgeNode {
  id: string;
  kind: string;
  label: string;
  aliases: string[];
  attributes: Record<string, string>;
}

export interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  weight: number;
  evidence: string[];
}

export interface KnowledgeModel {
  organizationId?: string;
  nodes: Record<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
  protocols: ClinicalProtocol[];
  evidence: EvidenceSource[];
  updatedAt: number;
}

export interface ClinicalProtocol {
  id: string;
  title: string;
  specialty: string;
  version: string;
  steps: string[];
  indications: string[];
  contraindications: string[];
  source: string;
  active: boolean;
}

export interface EvidenceSource {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  type: 'guideline' | 'trial' | 'review' | 'study';
  grade: string;
  summary: string;
  references: string[];
}

// ── Communication engine (event driven) ────────────────────────────────────────

export type EventPriority = 'info' | 'normal' | 'urgent' | 'critical';

export interface DomainEvent {
  id: string;
  type: string;
  sourceEngine: string;
  entityType: string;
  entityId: string;
  payload: Record<string, string>;
  priority: EventPriority;
  emittedAt: number;
  recipientActorIds: AmxUid[];
  channels: ('push' | 'sms' | 'in_app' | 'email')[];
  delivered: boolean;
}

export interface NotificationRecord {
  id: string;
  actorId: AmxUid;
  eventId: string;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  readAt?: number;
  actionable: boolean;
  actionLink?: string;
}

// ── Communication engine model ─────────────────────────────────────────────────

export interface CommunicationModel {
  events: DomainEvent[];
  notifications: Record<string, NotificationRecord[]>;
  updatedAt: number;
}

// ── Dashboard generation model ─────────────────────────────────────────────────

export type DashboardWidgetType =
  | 'tasks' | 'patients' | 'alerts' | 'schedule' | 'queue' | 'stats'
  | 'activity' | 'notifications' | 'encounters' | 'orders' | 'results'
  | 'handover' | 'command_center' | 'ai_assistant';

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  data: Record<string, unknown>;
  priority: number;
}

export interface GeneratedDashboard {
  actorId: AmxUid;
  organizationId?: string;
  departmentId?: string;
  role: string;
  title: string;
  widgets: DashboardWidget[];
  quickActions: string[];
  generatedAt: number;
}
