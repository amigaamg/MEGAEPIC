// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Types
// Constitutional Principle: The Workspace is the single source of truth for
// the user's active context. Everything derives from it.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  AmxUid,
  Identity,
  Person,
  ProfessionalIdentity,
  Organization,
  Department,
  Employment,
  Assignment,
  Role,
  Permission,
  Responsibility,
  Ward,
  Clinic,
  WorkSchedule,
} from '../constitution/types';

// ── Workspace Layout Types (Universal Workspace Assembly) ─────────────────────
// NOTE: These types are shared by the builder/router/context/lifecycle modules.
// They are intentionally kept here so all workspace code reads one types module.

export type PaneType = 'list' | 'detail' | 'context' | 'assistant' | 'queue' | 'tasks' | 'timeline' | 'search' | 'metrics'

export interface PaneConfig {
  id: string
  title: string
  type: PaneType
  component: string
  config: Record<string, unknown>
  width?: number
  minWidth?: number
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export interface WorkspaceLayout {
  leftPane: PaneConfig
  centerPane: PaneConfig
  rightPane: PaneConfig
  responsive: {
    mobile: 'single' | 'overlay'
    tablet: 'left_center' | 'single'
    desktop: 'three_column'
  }
}

export interface WorkspaceSession {
  identity: AmxUid
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  shiftType: string
  assignmentType: string
  assignmentTitle: string
  location: string
  activePatientId?: string
  activeEncounterId?: string
  activeWorkflowId?: string
  role: string
  position: string
  permissions: string[]
}

export type AssignmentType =
  | 'ward_round' | 'clinic' | 'theatre' | 'emergency_call'
  | 'icu_duty' | 'consultation' | 'admission' | 'discharge'
  | 'procedure' | 'home_visit' | 'teleconsultation'
  | 'lecture' | 'research' | 'administration'
  | 'supervision' | 'on_call' | 'standby'
  | 'outreach' | 'other'

export interface PaneProps {
  session: WorkspaceSession
  onNavigate: (path: string) => void
  onAction: (action: string, payload?: unknown) => void
}

// ── Membership (Actor ↔ Organization relationship) ─────────────────────────────

export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated';

export interface Membership {
  id: string;
  personId: AmxUid;
  organizationId: string;
  orgId?: string;
  organizationName: string;
  organizationType: Organization['type'];
  roleId: string;
  roleName: string;
  departmentId?: string;
  departmentName?: string;
  facilityId?: string;
  facilityName?: string;
  isPrimary: boolean;
  status: MembershipStatus;
  joinedAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

// ── Facility Hierarchy ────────────────────────────────────────────────────────

export type FacilityType =
  | 'hospital'
  | 'clinic'
  | 'specialist_center'
  | 'teaching_hospital'
  | 'research_institute'
  | 'university'
  | 'pharmacy'
  | 'laboratory'
  | 'radiology_center'
  | 'blood_bank'
  | 'ambulance_service'
  | 'home_care'
  | 'nursing_home'
  | 'hospice'
  | 'rehabilitation_center'
  | 'mental_health_facility'
  | 'other';

export interface Facility {
  id: string;
  organizationId: string;
  name: string;
  legalName: string;
  type: FacilityType;
  code: string;
  address: Organization['address'];
  phone: string;
  email: string;
  parentFacilityId?: string;
  campusId?: string;
  buildingId?: string;
  floorId?: string;
  departments: string[];
  status: 'active' | 'inactive' | 'maintenance';
  license?: {
    number: string;
    authority: string;
    issuedAt: number;
    expiresAt: number;
    status: 'valid' | 'expired' | 'revoked';
  };
  config?: {
    timezone: string;
    defaultCurrency: string;
    language: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Campus {
  id: string;
  organizationId: string;
  facilityId?: string;
  name: string;
  code: string;
  address: Organization['address'];
  buildings: Building[];
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

export interface Building {
  id: string;
  campusId: string;
  name: string;
  code: string;
  floors: Floor[];
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Floor {
  id: string;
  buildingId: string;
  number: number;
  name?: string;
  departments: string[];
  wards: string[];
  clinics: string[];
  status: 'active' | 'inactive';
}

export interface FacilityHierarchy {
  organization: Organization | null;
  campuses: Campus[];
  facilities: Facility[];
  buildings: Building[];
  floors: Floor[];
  departments: Department[];
  wards: Ward[];
  clinics: Clinic[];
}

// ── Shift & Schedule ──────────────────────────────────────────────────────────

export type ShiftType =
  | 'morning'
  | 'evening'
  | 'night'
  | 'weekend'
  | 'on_call'
  | 'holiday'
  | 'flexible'
  | 'split';

export interface Shift {
  id: string;
  organizationId: string;
  departmentId?: string;
  wardId?: string;
  clinicId?: string;
  teamId?: string;
  name: string;
  type: ShiftType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  daysOfWeek: number[]; // 0-6, Sunday=0
  startDate: number;
  endDate?: number;
  recurring: boolean;
  requiredRoles: string[];
  minStaff: number;
  maxStaff: number;
  color: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: number;
  updatedAt: number;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  personId: AmxUid;
  employmentId: string;
  assignmentId?: string;
  date: number; // Date at midnight
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'completed' | 'missed' | 'swapped' | 'cancelled';
  checkedInAt?: number;
  checkedOutAt?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// ── Team ──────────────────────────────────────────────────────────────────────

export type TeamType =
  | 'ward_team'
  | 'icu_team'
  | 'emergency_team'
  | 'surgical_team'
  | 'trauma_team'
  | 'stroke_team'
  | 'code_blue_team'
  | 'rapid_response_team'
  | 'mdt'
  | 'outreach_team'
  | 'administration'
  | 'quality_team'
  | 'infection_control'
  | 'research_team'
  | 'other';

export interface Team {
  id: string;
  organizationId: string;
  facilityId?: string;
  departmentId?: string;
  wardId?: string;
  name: string;
  type: TeamType;
  description?: string;
  leadId?: AmxUid;
  members: TeamMember[];
  schedule?: WorkSchedule;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

export interface TeamMember {
  personId: AmxUid;
  role: 'lead' | 'member' | 'supervisor' | 'trainee';
  joinedAt: number;
  isPrimary: boolean;
}

// ── Active Workspace (Resolved Context) ───────────────────────────────────────

export interface ResolvedWorkspace {
  // Identity layer
  identity: Identity;
  person: Person;
  professional: ProfessionalIdentity | null;

  // Organization layer
  memberships: Membership[];
  activeMembership: Membership | null;
  organization: Organization | null;

  // Facility layer
  facility: Facility | null;
  campus: Campus | null;
  building: Building | null;
  floor: Floor | null;

  // Department layer
  department: Department | null;
  unit: Department | null; // Sub-department/unit
  ward: Ward | null;
  clinic: Clinic | null;

  // Employment layer
  employments: Employment[];
  activeEmployment: Employment | null;

  // Assignment layer
  assignments: Assignment[];
  activeAssignment: Assignment | null;
  currentAssignments: Assignment[]; // Today's assignments

  // Shift layer
  shifts: Shift[];
  activeShift: Shift | null;
  shiftAssignment: ShiftAssignment | null;

  // Team layer
  teams: Team[];
  activeTeam: Team | null;

  // Role & Permissions
  role: Role;
  permissions: Permission[];
  responsibilities: Responsibility[];

  // Active clinical context
  activePatientIds: string[];
  activeEncounterIds: string[];

  // Computed state
  isOnDuty: boolean;
  isLoading: boolean;
  lastResolvedAt: number;

  // Constitutional completeness (Book XV — Workspace Resolution Constitution)
  completeness: WorkspaceCompleteness;

  // Navigation & Dashboard
  navigation: NavigationTree;
  dashboard: DashboardConfig;
  quickActions: QuickAction[];

  // Extended context (Book XV Layers 1–13)
  extendedContext?: ExtendedWorkspaceContext;
}

// ── Workspace Completeness (CR-WS-001 gate) ───────────────────────────────────

export type WorkspaceMissingElement =
  | 'professional'
  | 'membership'
  | 'organization'
  | 'facility'
  | 'department'
  | 'employment'
  | 'assignment'
  | 'shift'
  | 'role'
  | 'permissions';

export interface WorkspaceCompleteness {
  /** True only when the workspace satisfies every required constitutional element. */
  isComplete: boolean;
  /** 0..1 — fraction of required elements present. */
  score: number;
  /** Elements required by the actor's constitution but currently missing. */
  missing: WorkspaceMissingElement[];
  /** Elements present and satisfied. */
  present: WorkspaceMissingElement[];
  /** Elements that are optional for this actor (e.g. shift for administrators). */
  optional: WorkspaceMissingElement[];
  /** Ordered list of required elements in constitutional resolution order (WS-003..WS-008). */
  requiredOrder: WorkspaceMissingElement[];
  /** Actor completeness profile (patient | professional | administrator | individual). */
  profile: string;
  /** ISO timestamp of the completeness evaluation. */
  evaluatedAt: number;
}

export interface NavigationTree {
  primary: NavigationNode[];
  secondary: NavigationNode[];
  quickAccess: NavigationNode[];
}

export interface NavigationNode {
  id: string;
  label: string;
  description?: string;
  route: string;
  icon?: string;
  badge?: string | number;
  badgeColor?: string;
  children?: NavigationNode[];
  permission?: string | null;
  visibility: 'always' | 'on_duty' | 'off_duty' | 'admin';
  order: number;
  isActive?: boolean;
}

export interface DashboardConfig {
  title: string;
  greeting: string;
  layout: 'clinical' | 'administrative' | 'laboratory' | 'pharmacy' | 'radiology' | 'nursing' | 'reception' | 'custom';
  sections: DashboardSection[];
  widgets: DashboardWidget[];
  theme: 'light' | 'dark' | 'auto';
}

export interface DashboardSection {
  id: string;
  title: string;
  type: 'tasks' | 'patients' | 'alerts' | 'schedule' | 'queue' | 'stats' | 'activity' | 'custom';
  items: DashboardItem[];
  priority: number;
  emptyMessage?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface DashboardItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'overdue' | 'urgent' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  time?: string;
  patientId?: string;
  patientName?: string;
  encounterId?: string;
  link?: string;
  action?: string;
  actionLink?: string;
  assignedBy?: string;
  assignedAt?: number;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'queue' | 'calendar' | 'alert' | 'custom';
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  route: string;
  color?: string;
  shortcut?: string;
  requiresContext: boolean;
  permission?: string;
  category: 'clinical' | 'administrative' | 'communication' | 'navigation';
}

// ── Resolver Result Types ─────────────────────────────────────────────────────

export interface ResolverResult<T> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
  resolvedAt: number;
}

export interface ResolverContext {
  uid: AmxUid;
  /** Canonical constitutional actor id (AMX-UID). Employment & assignment records are keyed by this id. */
  personId?: AmxUid;
  activeOrganizationId?: string;
  activeFacilityId?: string;
  activeDepartmentId?: string;
  activeEmploymentId?: string;
  activeMembership?: Membership | null;
  forceRefresh?: boolean;
  deviceId?: string;
  /** Persisted workspace choice — 'individual' | 'organization' | 'create' | 'join'. */
  workspaceChoice?: 'individual' | 'organization' | 'create' | 'join' | null;
  /** Persisted registration step — drives RegistrationResolver. */
  registrationStep?: string | null;
  /** Override emergency state (for testing / admin). */
  emergencyOverride?: EmergencyState | null;
}

// ── Workspace Persistence ────────────────────────────────────────────────────

export interface WorkspaceSnapshot {
  uid: AmxUid;
  resolvedWorkspace: ResolvedWorkspace;
  snapshotAt: number;
  deviceId: string;
  version: number;
}

export interface WorkspacePersistenceConfig {
  firestore: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  redis?: boolean;
  auditLog: boolean;
}

// ── Engine Configuration ──────────────────────────────────────────────────────

export interface WorkspaceEngineConfig {
  cache: {
    ttl: number; // milliseconds
    maxSize: number;
  };
  resolvers: {
    membership: boolean;
    employment: boolean;
    facility: boolean;
    assignment: boolean;
    shift: boolean;
    team: boolean;
    dashboard: boolean;
    navigation: boolean;
    permission: boolean;
    registration: boolean;
    workspaceType: boolean;
    modules: boolean;
    subscription: boolean;
    notifications: boolean;
    tasks: boolean;
    patientContext: boolean;
    clinicalContext: boolean;
    ai: boolean;
    emergency: boolean;
    education: boolean;
    research: boolean;
  };
  persistence: WorkspacePersistenceConfig;
  autoRefresh: {
    enabled: boolean;
    interval: number; // milliseconds
  };
  lazyLoad: boolean;
}

// ── Events ────────────────────────────────────────────────────────────────────

export type WorkspaceEventType =
  | 'workspace_resolved'
  | 'workspace_updated'
  | 'membership_changed'
  | 'facility_changed'
  | 'department_changed'
  | 'assignment_changed'
  | 'shift_changed'
  | 'team_changed'
  | 'permission_changed'
  | 'navigation_updated'
  | 'dashboard_updated';

export interface WorkspaceEvent {
  type: WorkspaceEventType;
  uid: AmxUid;
  payload: unknown;
  timestamp: number;
  deviceId: string;
}

export type WorkspaceEventListener = (event: WorkspaceEvent) => void;

// ── Default Configuration ────────────────────────────────────────────────────

export const DEFAULT_WORKSPACE_ENGINE_CONFIG: WorkspaceEngineConfig = {
  cache: {
    ttl: 5 * 60 * 1000,
    maxSize: 100,
  },
  resolvers: {
    membership: true,
    employment: true,
    facility: true,
    assignment: true,
    shift: true,
    team: true,
    dashboard: true,
    navigation: true,
    permission: true,
    registration: true,
    workspaceType: true,
    modules: true,
    subscription: true,
    notifications: true,
    tasks: true,
    patientContext: true,
    clinicalContext: true,
    ai: true,
    emergency: true,
    education: true,
    research: true,
  },
  persistence: {
    firestore: true,
    localStorage: true,
    sessionStorage: true,
    auditLog: true,
  },
  autoRefresh: {
    enabled: true,
    interval: 30 * 1000,
  },
  lazyLoad: true,
};

// ═══════════════════════════════════════════════════════════════════════
// EXTENDED WORKSPACE CONTEXT (Book XV — Layers 1–13)
// ═══════════════════════════════════════════════════════════════════════

export type WorkspaceType =
  | 'individual'
  | 'facility'
  | 'clinic'
  | 'university'
  | 'medical_school'
  | 'research_lab'
  | 'government'
  | 'ngo'
  | 'insurance'
  | 'telemedicine'
  | 'training'
  | 'simulation'
  | 'student'
  | 'locum'
  | 'remote';

export interface WorkspaceTypeInfo {
  type: WorkspaceType;
  label: string;
  requiresFacilityHierarchy: boolean;
  dashboardLayout: DashboardConfig['layout'];
}

export type ModuleId =
  | 'emr'
  | 'hmis'
  | 'billing'
  | 'pharmacy'
  | 'laboratory'
  | 'radiology'
  | 'blood_bank'
  | 'icu'
  | 'nicu'
  | 'theatre'
  | 'research'
  | 'education'
  | 'ai_assistant'
  | 'inventory'
  | 'finance'
  | 'insurance'
  | 'quality'
  | 'public_health'
  | 'telemedicine'
  | 'registry'
  | 'bed_management'
  | 'scheduling'
  | 'hr'
  | 'payroll';

export interface ModuleInfo {
  id: ModuleId;
  label: string;
  description: string;
  icon: string;
  route: string;
  requiredRole: string;
}

export type SubscriptionTier = 'free' | 'student' | 'professional' | 'clinic' | 'hospital' | 'enterprise' | 'government' | 'university';

export interface SubscriptionLimits {
  users: number;
  modules: number;
  storageGB: number;
  aiCredits: number;
  reportsPerMonth: number;
  apiRequestsPerDay: number;
}

export interface Subscription {
  tier: SubscriptionTier;
  label: string;
  limits: SubscriptionLimits;
  active: boolean;
  renewsAt?: number;
}

export interface RegistrationCompleteness {
  identityComplete: boolean;
  professionalComplete: boolean;
  organizationSelected: boolean;
  employmentAccepted: boolean;
  departmentAssigned: boolean;
  licenseVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  paymentVerified: boolean;
  complete: boolean;
  missing: string[];
  nextStep: string | null;
}

export interface WorkspaceNotification {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'urgent' | 'critical';
  title: string;
  message: string;
  patientId?: string;
  patientName?: string;
  link?: string;
  createdAt: number;
  read: boolean;
}

export interface WorkspaceTask {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  patientId?: string;
  patientName?: string;
  encounterId?: string;
  dueAt: number;
  link?: string;
}

export interface PatientContext {
  assignedPatients: string[];
  currentPatients: string[];
  recentPatients: string[];
  criticalPatients: string[];
  dischargedToday: string[];
  expectedAdmissions: string[];
}

export interface ClinicalContext {
  currentEncounterId: string | null;
  currentDiagnosis: string | null;
  pendingLabs: number;
  pendingImaging: number;
  pendingProcedures: number;
  pendingConsults: number;
  riskAlerts: string[];
  riskScores: { news: number | null; mews: number | null; sofa: number | null; sepsis: boolean };
}

export interface AIContext {
  currentPatientId: string | null;
  currentEncounterId: string | null;
  currentWardId: string | null;
  currentRoleId: string;
  currentSpecialty: string;
  currentTaskType: string | null;
  contextBundle: string[];
}

export type EmergencyStateType = 'none' | 'code_blue' | 'mass_casualty' | 'fire' | 'disaster' | 'pandemic' | 'lockdown';

export interface EmergencyState {
  active: boolean;
  type: EmergencyStateType;
  title: string;
  activatedAt: number | null;
  activatedBy: string | null;
  description?: string;
}

export interface EducationContext {
  isTrainee: boolean;
  supervisorId: string | null;
  currentRotation: string | null;
  logbookEntries: number;
  completedEPAs: string[];
  skillsLog: string[];
  pendingAssessments: number;
}

export interface ResearchContext {
  activeStudies: string[];
  enrolledPatients: number;
  pendingApprovals: number;
  ethicsApprovals: string[];
  dataCaptureActive: boolean;
}

export interface ExtendedWorkspaceContext {
  registration: RegistrationCompleteness;
  workspaceType: WorkspaceTypeInfo;
  modules: ModuleId[];
  subscription: Subscription;
  notifications: WorkspaceNotification[];
  tasks: WorkspaceTask[];
  patientContext: PatientContext;
  clinicalContext: ClinicalContext;
  aiContext: AIContext;
  emergency: EmergencyState;
  education: EducationContext;
  research: ResearchContext;
}