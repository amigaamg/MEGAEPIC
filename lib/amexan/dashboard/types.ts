// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DASHBOARD CONSTITUTION — Shared Types (BOOK VIII · Volume VIII-A)
//
// The dashboard is never a page. It is the generated operating environment of an
// actor at that exact moment. Every type here is a pure, determinable descriptor
// that the Dashboard Engine composes into a live workspace.
//
// Nothing in this file references React, Firebase, or the UI rendering layer. It is
// pure constitution describing what an actor may, should, and will see first.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Phase 1: Authentication ────────────────────────────────────────────────────
// Authentication ONLY proves who you are. Nothing else.

export interface AuthResult {
  uid: AmxUid;
  sessionId: string;
  token: string;
  authenticatedAt: number;
}

// ── Phase 2: Identity ──────────────────────────────────────────────────────────
// One person, many identities (doctor, administrator, teacher, researcher...).

export type IdentityKind = 'clinical' | 'administrative' | 'teaching' | 'research' | 'patient' | 'public_health';

export interface UniversalIdentity {
  personId: AmxUid;
  actorId: AmxUid;
  amxPer: string;
  name: string;
  identities: { kind: IdentityKind; label: string; verified: boolean }[];
  licenses: { license: string; authority: string; validUntil: number }[];
  capabilities: string[];
  preferences: Record<string, string>;
}

// ── Phase 3: Actor ─────────────────────────────────────────────────────────────

export interface ActorObject {
  actorId: AmxUid;
  personId: AmxUid;
  name: string;
  amxid: string;
  professionalIdentity?: string;
  administrativeIdentity?: string;
  teachingIdentity?: string;
  researchIdentity?: string;
  capabilities: string[];
  organizations: string[];
}

// ── Phase 4: Organization ──────────────────────────────────────────────────────
// The actor belongs to many organizations; the active workspace is always one.

export interface OrganizationChoice {
  organizationId: string;
  name: string;
  type: string;
  isActive: boolean;
  context: 'morning' | 'afternoon' | 'evening' | 'on_call' | 'manual';
}

// ── Phase 5: Employment ────────────────────────────────────────────────────────
// Inside the hospital, who are you? Many ranks at once.

export interface EmploymentProfile {
  organizationId: string;
  departmentId?: string;
  roles: string[];
  rank?: string;
  employmentType: 'permanent' | 'contract' | 'locum' | 'volunteer';
  supervisorId?: AmxUid;
  reportingStructure: string[];
  status: 'active' | 'on_leave' | 'suspended' | 'terminated';
}

// ── Phase 6: Assignment ────────────────────────────────────────────────────────
// Today, what exactly are you doing right now? Assignment overrides dashboard.

export type AssignmentKind =
  | 'ward_round' | 'clinic' | 'theatre' | 'administration' | 'meeting'
  | 'research' | 'teaching' | 'emergency_call' | 'icu' | 'on_call'
  | 'laboratory' | 'pharmacy' | 'radiology' | 'telemedicine' | 'community_health';

export interface CurrentAssignment {
  id: string;
  kind: AssignmentKind;
  label: string;
  departmentId?: string;
  wardId?: string;
  startedAt?: number;
  endsAt?: number;
}

// ── Phase 7: Capability ────────────────────────────────────────────────────────
// Role is not enough. Capabilities determine functionality.

export interface CapabilityProfile {
  actorId: AmxUid;
  clinical: boolean;
  administration: boolean;
  teaching: boolean;
  research: boolean;
  telemedicine: boolean;
  prescribe: boolean;
  orderLab: boolean;
  orderImaging: boolean;
  admit: boolean;
  discharge: boolean;
  signOff: boolean;
  flags: string[];
}

// ── Phase 8: Preferences ───────────────────────────────────────────────────────

export interface PreferenceSet {
  actorId: AmxUid;
  language: string;
  theme: 'dark' | 'light' | 'system';
  favoriteWidgets: string[];
  widgetOrder: string[];
  documentationStyle?: string;
  protocols: boolean;
  evidenceLevel?: string;
  units?: string;
  dateFormat?: string;
  density?: 'comfortable' | 'compact';
}

// ── Constitutional dashboard structure ─────────────────────────────────────────

export type DashboardFamilyId =
  | 'executive' | 'clinical_leadership' | 'department' | 'ward'
  | 'clinician' | 'resident' | 'student' | 'nursing' | 'pharmacy'
  | 'laboratory' | 'radiology' | 'theatre' | 'emergency'
  | 'telemedicine' | 'research' | 'finance' | 'hr' | 'ict' | 'patient';

export interface FamilyRoleMap {
  familyId: DashboardFamilyId;
  label: string;
  roles: string[];
}

export interface NavigationItem {
  key: string;
  label: string;
  icon?: string;
  permission?: string;
  active: boolean;
}

export interface HeaderState {
  actorId: AmxUid;
  name: string;
  amxid: string;
  organizationId?: string;
  organizationName?: string;
  departmentId?: string;
  departmentName?: string;
  currentAssignment?: string;
  notificationCount: number;
  searchEnabled: boolean;
  emergencyShortcut: boolean;
  aiEnabled: boolean;
  workspaceSwitcher: { id: string; label: string; familyId: DashboardFamilyId }[];
  language: string;
  theme: string;
}

// ── Intelligence panel item ────────────────────────────────────────────────────

export interface IntelligenceItem {
  id: string;
  kind: 'alert' | 'task' | 'ai' | 'recommendation' | 'learning' | 'research' | 'protocol' | 'notification';
  title: string;
  detail?: string;
  priority: 'info' | 'normal' | 'urgent' | 'critical';
}

// ── Floating quick actions ─────────────────────────────────────────────────────

export interface QuickAction {
  key: string;
  label: string;
  permission?: string;
  context: AssignmentKind | 'generic';
}

// ── The resolved dashboard ─────────────────────────────────────────────────────

export interface ResolvedWorkspace {
  key: string;
  label: string;
  familyId: DashboardFamilyId;
  kind: AssignmentKind | 'overview';
}

export interface ResolvedDashboard {
  actorId: AmxUid;
  familyId: DashboardFamilyId;
  familyLabel: string;
  context: ResolvedWorkspace;
  header: HeaderState;
  navigation: NavigationItem[];
  workspace: { widgets: PresentationWidget[] };
  intelligence: IntelligenceItem[];
  quickActions: QuickAction[];
  layers: DashboardLayer[];
  generatedAt: number;
  offlineRecoverable: boolean;
}

// ── The five dashboard layers ──────────────────────────────────────────────────

export type DashboardLayerId = 'overview' | 'operations' | 'communication' | 'learning' | 'analytics';

export interface DashboardLayer {
  id: DashboardLayerId;
  label: string;
  widgets: PresentationWidget[];
}

// ── Presentation widget (engine-composed, not hardcoded) ──────────────────────

export interface PresentationWidget {
  id: string;
  type: string;
  title: string;
  familyId: DashboardFamilyId;
  layer: DashboardLayerId;
  size: 'sm' | 'md' | 'lg' | 'xl';
  priority: number;
  refreshIntervalSeconds: number;
  visible: boolean;
  permission?: string;
  data: Record<string, unknown>;
}

// ── Resolution pipeline result ─────────────────────────────────────────────────

export interface ResolutionContext {
  auth: AuthResult;
  identity: UniversalIdentity;
  actor: ActorObject;
  activeOrganization?: string;
  organizationChoices: OrganizationChoice[];
  employments: EmploymentProfile[];
  assignment?: CurrentAssignment;
  capabilities: CapabilityProfile;
  preferences: PreferenceSet;
  notificationCount: number;
  tasksCount: number;
  criticalAlertsCount: number;
  hospitalStatus: Record<string, unknown>;
}