// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace — Public Exports
// Includes the Universal Workspace Assembly (builder/router/context/lifecycle)
// and the new Workspace Engine (membership/employment/facility/assignment/
// dashboard/navigation/permission resolvers).
// ═══════════════════════════════════════════════════════════════════════════════

// ── All types defined in this module (incl. Workspace Engine types) ───────────
export type * from './types';

// ── Constitutional types re-exported for convenience ──────────────────────────
export type {
  AmxUid, Identity, Person, ProfessionalIdentity, Organization,
  Department, Employment, Assignment, Role, Permission, Responsibility,
  Ward, Clinic, WorkSchedule, UserSession, DashboardTemplate,
} from '../constitution/types';

// ── Universal Workspace Assembly (legacy — preserved) ─────────────────────────
export {
  buildWorkspace, workspaceBuilder,
} from './builder/workspace-builder';
export type {
  WorkspaceBuildRequest, BuiltWorkspace, WorkspaceBuilder,
} from './builder/workspace-builder';

export {
  routeWorkspace, morphTarget, workspaceRouter,
} from './router/workspace-router';
export type {
  RouteDecision, RouteInput, WorkspaceRouter,
} from './router/workspace-router';

export {
  createWorkspaceContext, contextLabel, workspaceContext,
} from './context/workspace-context';
export type {
  WorkspaceContext, WorkspaceContextEngine,
} from './context/workspace-context';

export {
  initializeWorkspace, activateWorkspace, pauseWorkspace, suspendWorkspace, workspaceIsAlive, workspaceLifecycle,
} from './lifecycle/workspace-lifecycle';
export type {
  WorkspaceStage, LifecycleRecord, WorkspaceLifecycle,
} from './lifecycle/workspace-lifecycle';

export {
  generateWorkspace, getVisiblePanes, getWorkspaceTitle, getQuickActions,
} from './engine';

export {
  getLayout, getAssignmentTypes, getLayoutForAssignment,
} from './layouts';

// ── Workspace Engine (new) ────────────────────────────────────────────────────

// Completeness (Book XV — CR-WS-001 gate)
export {
  computeWorkspaceCompleteness,
  isWorkspaceComplete,
  resolveCompletenessProfile,
  workspaceCompletenessEngine,
} from './completeness';
export type {
  WorkspaceCompleteness,
  WorkspaceMissingElement,
} from './types';
export type {
  ActorCompletenessProfile,
} from './completeness';

// Resolvers
// Resolvers
export { membershipResolver, MembershipResolver } from './MembershipResolver';
export { employmentResolver, EmploymentResolver } from './EmploymentResolver';
export { facilityResolver, FacilityResolver } from './FacilityResolver';
export { assignmentResolver, AssignmentResolver } from './AssignmentResolver';
export { dashboardResolver, DashboardResolver } from './DashboardResolver';
export { navigationResolver, NavigationResolver } from './NavigationResolver';
export { permissionResolver, PermissionResolver } from './PermissionResolver';

// Extended Context Resolvers (Layers 1–13)
export { resolveExtendedContext } from './context';
export type {
  RegistrationCompleteness,
  WorkspaceType,
  WorkspaceTypeInfo,
  ModuleId,
  ModuleInfo,
  SubscriptionTier,
  Subscription,
  SubscriptionLimits,
  WorkspaceNotification,
  WorkspaceTask,
  PatientContext,
  ClinicalContext,
  AIContext,
  EmergencyState,
  EmergencyStateType,
  EducationContext,
  ResearchContext,
  ExtendedWorkspaceContext,
} from './types';

// Main Engine
export {
  WorkspaceEngine,
  getWorkspaceEngine,
  resetWorkspaceEngine,
  workspaceEngine,
} from './WorkspaceEngine';

// Workspace Resolution Gate (Book XV)
export {
  WorkspaceResolutionEngine,
  workspaceResolutionEngine,
  resolveWorkspaceGate,
} from './WorkspaceResolutionEngine';
export type {
  WorkspaceResolutionDecision,
  ResolutionDecisionType,
  ResolutionGap,
  ResolutionContext,
} from './WorkspaceResolutionEngine';

// Constitutional Dashboard Adapter (Book VIII unification)
export {
  DashboardConstitutionalEngine,
  dashboardConstitutionalEngine,
  roleTokensFor,
} from './dashboard-constitutional';