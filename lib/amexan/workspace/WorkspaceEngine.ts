// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Main Orchestrator
// The heart of the HMIS: resolves complete workspace context for any actor
// Constitutional Principle: Single source of truth for all context resolution
// ═══════════════════════════════════════════════════════════════════════════════

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { composeUserSession } from '../constitution/session';
import { buildEmptySession } from '../constitution/auth';
import {
  getIdentity,
  getPerson,
  getProfessional,
  getOrganization,
  getOrgRole,
} from '../constitution/firestoreService';
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
  ProfessionalCategory,
} from '../constitution/types';
import {
  DEFAULT_WORKSPACE_ENGINE_CONFIG,
  type ResolvedWorkspace,
  type ResolverContext,
  type ResolverResult,
  type WorkspaceEngineConfig,
  type WorkspaceEvent,
  type WorkspaceEventListener,
  type WorkspaceSnapshot,
} from './types';
import { membershipResolver } from './MembershipResolver';
import { employmentResolver } from './EmploymentResolver';
import { computeWorkspaceCompleteness } from './completeness';
import { facilityResolver } from './FacilityResolver';
import { assignmentResolver } from './AssignmentResolver';
import { dashboardResolver } from './DashboardResolver';
import { navigationResolver } from './NavigationResolver';
import { permissionResolver } from './PermissionResolver';
import { getActiveOrganizationId } from '@/lib/firebase/orgContext';
import { resolveExtendedContext } from './context';

const ROLE_LABEL: Record<string, ProfessionalCategory> = {
  doctor: 'medical_doctor',
  consultant: 'consultant',
  nurse: 'nurse',
  admin: 'facility_admin',
  super_admin: 'super_admin',
  pharmacist: 'pharmacist',
  lab_tech: 'lab_technologist',
  receptionist: 'receptionist',
  student: 'medical_student',
  facility_administrator: 'facility_admin',
  facility_admin: 'facility_admin',
  hospital_admin: 'facility_admin',
  hospital_director: 'facility_admin',
  medical_superintendent: 'facility_admin',
  county_director: 'facility_admin',
  regional_director: 'facility_admin',
  national_director: 'facility_admin',
};

function defaultPermissions(role: string): Permission[] {
  const scope = { type: 'organization' as const };
  if (role === 'doctor' || role === 'consultant' || role === 'clinical_officer') {
    return [
      { resource: 'patient', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'encounter', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'prescription', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'lab_order', actions: ['create', 'read'], scope, deny: false },
      { resource: 'imaging_order', actions: ['create', 'read'], scope, deny: false },
      { resource: 'clinical_note', actions: ['create', 'read', 'update'], scope, deny: false },
      { resource: 'referral', actions: ['create', 'read'], scope, deny: false },
      { resource: 'discharge', actions: ['create', 'update'], scope, deny: false },
    ];
  }
  if (role === 'nurse' || role === 'midwife') {
    return [
      { resource: 'patient', actions: ['read'], scope, deny: false },
      { resource: 'encounter', actions: ['read', 'update'], scope, deny: false },
      { resource: 'clinical_note', actions: ['create', 'read'], scope, deny: false },
      { resource: 'prescription', actions: ['read'], scope, deny: false },
    ];
  }
  if (role === 'admin' || role === 'super_admin' || role === 'hospital_admin' || role === 'facility_administrator') {
    return [
      { resource: 'admin', actions: ['create', 'read', 'update', 'delete', 'admin'], scope: { type: 'global' }, deny: false },
      { resource: 'manage_org', actions: ['manage_org', 'manage_staff', 'manage_roles'], scope: { type: 'global' }, deny: false },
    ];
  }
  if (role === 'pharmacist') {
    return [
      { resource: 'prescription', actions: ['read', 'update'], scope, deny: false },
      { resource: 'inventory', actions: ['create', 'read'], scope, deny: false },
    ];
  }
  if (role === 'lab_tech') {
    return [
      { resource: 'lab_order', actions: ['read', 'update'], scope, deny: false },
      { resource: 'observations', actions: ['create', 'read'], scope, deny: false },
    ];
  }
  return [{ resource: 'patient', actions: ['read'], scope, deny: false }];
}

function buildRoleFromId(roleId: string): Role {
  const perms = defaultPermissions(roleId);
  return {
    id: roleId,
    name: roleId,
    description: '',
    type: 'system',
    permissions: perms,
    isAssignable: false,
    createdBy: '' as AmxUid,
    createdAt: 0,
    updatedAt: 0,
  };
}

function categoryFromRole(role: string | null | undefined): ProfessionalCategory {
  return (ROLE_LABEL[role || 'user'] as ProfessionalCategory) || 'other';
}

export class WorkspaceEngine {
  private config: WorkspaceEngineConfig;
  private currentWorkspace: ResolvedWorkspace | null = null;
  private currentUid: AmxUid | null = null;
  private eventListeners: Set<WorkspaceEventListener> = new Set();
  private refreshInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor(config?: Partial<WorkspaceEngineConfig>) {
    this.config = { ...DEFAULT_WORKSPACE_ENGINE_CONFIG, ...config };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN ENTRY POINT: Initialize and resolve workspace for a user
  // ═══════════════════════════════════════════════════════════════════════════════

  async initialize(uid: AmxUid, context?: Partial<ResolverContext>): Promise<ResolvedWorkspace> {
    this.currentUid = uid;

    const resolverContext: ResolverContext = {
      uid,
      personId: context?.personId,
      activeOrganizationId: context?.activeOrganizationId || getActiveOrganizationId() || undefined,
      forceRefresh: true,
      deviceId: context?.deviceId,
      ...context,
    };

    const workspace = await this.resolveWorkspace(resolverContext);
    this.currentWorkspace = workspace;

    // Start auto-refresh if enabled
    if (this.config.autoRefresh.enabled && !this.refreshInterval) {
      this.startAutoRefresh();
    }

    // Persist workspace snapshot
    await this.persistWorkspace(workspace);

    // Anchor the resolved organization so the very next resolution (page
    // reload, /facility-admin, subsequent login) never falls back to a stale or
    // empty active-org state. Rule WS-010 (workspace immutable): the resolved
    // membership's organization is the single source of truth.
    if (workspace.activeMembership?.organizationId) {
      const { setActiveOrganizationId } = await import('@/lib/firebase/orgContext');
      try { setActiveOrganizationId(workspace.activeMembership.organizationId); } catch { /* noop */ }
      try {
        await (await import('firebase/firestore')).updateDoc(
          doc(db, 'users', uid),
          { activeOrganizationId: workspace.activeMembership.organizationId, updatedAt: Date.now() },
        );
      } catch { /* non-fatal */ }
    }

    this.initialized = true;
    this.emitEvent({ type: 'workspace_resolved', uid, payload: workspace, timestamp: Date.now(), deviceId: resolverContext.deviceId || '' });

    return workspace;
  }

  async resolveWorkspace(context: ResolverContext): Promise<ResolvedWorkspace> {
    const uid = context.uid;

    // Load the users/{uid} doc for role fallback + activeOrganizationId
    let userData: Record<string, unknown> | null = null;
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      userData = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : null;
    } catch {
      userData = null;
    }

    // Persisted role on users/{uid} (quick-register / legacy accounts). Used as
    // a fallback for category + default permissions until a constitutional role
    // is resolved from the active membership.
    const fetchedRole =
      (userData?.role as string | null) ||
      (userData?.roleId as string | null) ||
      (userData?.clinicianRole as string | null) ||
      null;

    // Canonical personId (AMX-UID) — resolve the identity docs by the actor's
    // constitutional id first, then fall back to the Firebase UID for legacy
    // accounts that were keyed by firebase UID (quick-register).
    const personId: AmxUid = ((userData?.amxUid as string) || context.personId || uid) as AmxUid;

    // Phase 1: Load Identity, Person, Professional directly from Firestore
    const [identityResult, personResult, professionalResult] = await Promise.all([
      getIdentity(personId)
        .catch(() => null)
        .then(r => r || getIdentity(uid).catch(() => null)),
      getPerson(personId)
        .catch(() => null)
        .then(r => r || getPerson(uid).catch(() => null)),
      getProfessional(personId)
        .catch(() => null)
        .then(r => r || getProfessional(uid).catch(() => null)),
    ]);

    const identity: Identity = identityResult ?? {
      uid: uid as AmxUid,
      email: (userData?.email as string) || '',
      phone: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now(),
      verified: !!(userData?.emailVerified as boolean),
      twoFactorEnabled: false,
      securityKeys: [],
      authProvider: 'email',
      status: 'active',
    };

    const person: Person = personResult ?? {
      uid: uid as AmxUid,
      identityId: uid as AmxUid,
      fullName: (userData?.displayName as string) || (userData?.name as string) || fetchedRole || 'User',
      givenName: '',
      familyName: '',
      dateOfBirth: '',
      gender: 'undisclosed',
      nationality: '',
      nationalId: '',
      address: { country: 'Kenya', county: '' },
    };

    const professional: ProfessionalIdentity | null = professionalResult ?? {
      uid: uid as AmxUid,
      personId: uid as AmxUid,
      categories: [categoryFromRole(fetchedRole)],
      primaryCategory: categoryFromRole(fetchedRole),
      specialties: [],
      qualifications: [],
      yearsOfExperience: 0,
      verified: false,
      verificationDocuments: [],
    };

    // Phase 2: Resolve Memberships
    const membershipsResult = await membershipResolver.resolve({ ...context, personId });
    const memberships = membershipsResult.data || [];

    // Phase 3: Determine Active Membership
    // `storedOrgId` is the persisted active organization (localStorage, and now
    // Firestore via AuthContext) — the actor's own preference wins over the
    // passed-in context so switching survives page reloads (WS-010).
    const storedOrgId = getActiveOrganizationId() || undefined;
    const activeMembershipResult = await membershipResolver.getActiveMembership({
      ...context,
      personId,
      activeOrganizationId: storedOrgId || context.activeOrganizationId,
    });
    const activeMembership = activeMembershipResult.data;

    // Update context with active organization
    const orgContext: ResolverContext = {
      ...context,
      personId,
      activeOrganizationId: activeMembership?.organizationId || storedOrgId || context.activeOrganizationId,
    };

    // Phase 4: Resolve Organization
    let organization: Organization | null = null;
    if (orgContext.activeOrganizationId) {
      organization = await getOrganization(orgContext.activeOrganizationId).catch(() => null);
    }

    // Phase 5: Resolve Facility Hierarchy
    const [facilityResult, departmentResult, wardResult, clinicResult] = await Promise.all([
      facilityResolver.resolveActiveFacility(orgContext),
      facilityResolver.resolveActiveDepartment(orgContext),
      facilityResolver.resolveActiveWard(orgContext),
      facilityResolver.resolveActiveClinic(orgContext),
    ]);

    const facility = facilityResult.data;
    const department = departmentResult.data;
    const ward = wardResult.data;
    const clinic = clinicResult.data;

    // Update context with facility/department
    const facilityContext: ResolverContext = {
      ...orgContext,
      activeFacilityId: facility?.id,
      activeDepartmentId: department?.id,
      activeMembership,
    };

    // Phase 6: Resolve Employments
    const employmentsResult = await employmentResolver.resolve(facilityContext);
    const employments = employmentsResult.data || [];

    const activeEmploymentResult = await employmentResolver.getActiveEmployment(facilityContext);
    const activeEmployment = activeEmploymentResult.data;

    // Phase 7: Resolve Assignments & Shifts
    const assignmentsContext: ResolverContext = {
      ...facilityContext,
      activeEmploymentId: activeEmployment?.id,
    };

    const [assignmentsResult, activeAssignmentResult, shiftsResult, activeShiftResult, shiftAssignmentResult] = await Promise.all([
      assignmentResolver.resolveAssignments(assignmentsContext),
      assignmentResolver.getActiveAssignment(assignmentsContext),
      assignmentResolver.resolveShifts(assignmentsContext),
      assignmentResolver.getActiveShift(assignmentsContext),
      assignmentResolver.getActiveShiftAssignment(assignmentsContext),
    ]);

    const assignments = assignmentsResult.data || [];
    const activeAssignment = activeAssignmentResult.data;
    const shifts = shiftsResult.data || [];
    const activeShift = activeShiftResult.data;
    const shiftAssignment = shiftAssignmentResult.data;

    // Phase 8: Resolve Teams (if enabled)
    let teams: any[] = [];
    let activeTeam: any = null;
    if (this.config.resolvers.team) {
      // Team resolution would go here
      // For now, empty
    }

    // Phase 9: Resolve Role
    let role: Role = buildRoleFromId(fetchedRole || 'user');
    if (activeMembership?.roleId && organization) {
      const orgRole = await getOrgRole(organization.id, activeMembership.roleId).catch(() => null);
      if (orgRole) role = orgRole;
    }

    // Phase 10: Resolve Responsibilities
    let responsibilities: Responsibility[] = [];

    // Phase 11: Compute effective permissions
    const partialWorkspace: ResolvedWorkspace = {
      identity,
      person,
      professional,
      memberships,
      activeMembership,
      organization,
      facility,
      campus: null,
      building: null,
      floor: null,
      department,
      unit: null,
      ward,
      clinic,
      employments,
      activeEmployment,
      assignments,
      activeAssignment,
      currentAssignments: assignments,
      shifts,
      activeShift,
      shiftAssignment,
      teams,
      activeTeam,
      role,
      permissions: [], // Will be filled below
      responsibilities,
      activePatientIds: activeAssignment?.linkedPatientIds || [],
      activeEncounterIds: activeAssignment?.linkedEncounterIds || [],
      isOnDuty: assignments.some(a => a.status === 'active' || a.status === 'scheduled'),
      isLoading: false,
      lastResolvedAt: Date.now(),
      completeness: computeWorkspaceCompleteness({
        professional,
        activeMembership,
        organization,
        facility,
        department,
        activeEmployment,
        activeAssignment,
        activeShift,
      }, {
        registrationStep: userData?.registrationStep as string | undefined,
        workspaceChoice: (userData?.workspaceChoice as 'individual' | 'organization' | 'create' | 'join' | undefined) || undefined,
      }),
      navigation: { primary: [], secondary: [], quickAccess: [] },
      dashboard: { title: '', greeting: '', layout: 'clinical', sections: [], widgets: [], theme: 'light' },
      quickActions: [],
    };

    const permissionsResult = await permissionResolver.resolve(partialWorkspace);
    const permissions = permissionsResult.data || [];

    // Phase 12: Resolve Dashboard
    const dashboardResult = await dashboardResolver.resolve({
      ...partialWorkspace,
      permissions,
    });
    const dashboard = dashboardResult.data || { title: '', greeting: '', layout: 'clinical', sections: [], widgets: [], theme: 'light' };

    // Phase 13: Resolve Navigation
    const navigationResult = await navigationResolver.resolve({
      ...partialWorkspace,
      permissions,
    });
    const navigation = navigationResult.data || { primary: [], secondary: [], quickAccess: [] };

    // Phase 14: Resolve Quick Actions
    const quickActions = dashboardResolver.buildQuickActions({
      ...partialWorkspace,
      permissions,
    }, professional?.primaryCategory || 'other', activeAssignment?.type || 'other');

    // Phase 15: Resolve Extended Context (Layers 1–13)
    const extendedContext = resolveExtendedContext(
      { ...partialWorkspace, permissions, dashboard, navigation, quickActions },
      userData ?? undefined,
      context.emergencyOverride ?? null,
    );

    // Build complete workspace
    const workspace: ResolvedWorkspace = {
      ...partialWorkspace,
      permissions,
      dashboard,
      navigation,
      quickActions,
      extendedContext,
    };

    return workspace;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════════

  getWorkspace(): ResolvedWorkspace | null {
    return this.currentWorkspace;
  }

  getSession(): any {
    if (!this.currentWorkspace) return buildEmptySession();
    const w = this.currentWorkspace;
    return composeUserSession({
      identity: w.identity,
      person: w.person,
      professional: w.professional,
      organizations: w.organization ? [w.organization] : [],
      employments: w.employments,
      currentEmployment: w.activeEmployment,
      currentOrganization: w.organization,
      currentDepartment: w.department,
      currentAssignments: w.currentAssignments,
      role: w.role,
      permissions: w.permissions,
      responsibilities: w.responsibilities,
    });
  }

  async refresh(context?: Partial<ResolverContext>): Promise<ResolvedWorkspace> {
    if (!this.currentUid) throw new Error('Workspace not initialized');
    return this.initialize(this.currentUid, { ...context, forceRefresh: true });
  }

  async switchOrganization(orgId: string): Promise<ResolvedWorkspace> {
    if (!this.currentUid) throw new Error('Workspace not initialized');
    const { setActiveOrganizationId } = await import('@/lib/firebase/orgContext');
    setActiveOrganizationId(orgId);
    return this.refresh({ activeOrganizationId: orgId });
  }

  async switchFacility(facilityId: string): Promise<ResolvedWorkspace> {
    if (!this.currentUid) throw new Error('Workspace not initialized');
    return this.refresh({ activeFacilityId: facilityId });
  }

  async switchDepartment(departmentId: string): Promise<ResolvedWorkspace> {
    if (!this.currentUid) throw new Error('Workspace not initialized');
    return this.refresh({ activeDepartmentId: departmentId });
  }

  async switchRole(roleId: string): Promise<ResolvedWorkspace> {
    // Would update active role in membership
    return this.refresh({});
  }

  // Permission checking
  can(resource: any, action: any, scope?: any): boolean {
    if (!this.currentWorkspace) return false;
    return permissionResolver.checkPermission(this.currentWorkspace, resource, action, scope);
  }

  // Event system
  onEvent(listener: WorkspaceEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emitEvent(event: WorkspaceEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('[WorkspaceEngine] Event listener error:', e);
      }
    }
  }

  // Auto-refresh
  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(async () => {
      if (this.currentUid && this.initialized && this.currentWorkspace) {
        try {
          const newWorkspace = await this.resolveWorkspace({ uid: this.currentUid, forceRefresh: false });
          const changed = this.hasWorkspaceChanged(this.currentWorkspace, newWorkspace);
          if (changed) {
            this.currentWorkspace = newWorkspace;
            this.emitEvent({ type: 'workspace_updated', uid: this.currentUid, payload: newWorkspace, timestamp: Date.now(), deviceId: '' });
          }
        } catch (e) {
          console.error('[WorkspaceEngine] Auto-refresh failed:', e);
        }
      }
    }, this.config.autoRefresh.interval);
  }

  private hasWorkspaceChanged(old: ResolvedWorkspace, newW: ResolvedWorkspace): boolean {
    return (
      old.activeMembership?.id !== newW.activeMembership?.id ||
      old.activeAssignment?.id !== newW.activeAssignment?.id ||
      old.activeShift?.id !== newW.activeShift?.id ||
      old.activeEmployment?.id !== newW.activeEmployment?.id ||
      old.isOnDuty !== newW.isOnDuty ||
      old.facility?.id !== newW.facility?.id ||
      old.department?.id !== newW.department?.id ||
      old.extendedContext?.workspaceType?.type !== newW.extendedContext?.workspaceType?.type ||
      old.extendedContext?.emergency?.active !== newW.extendedContext?.emergency?.active ||
      old.extendedContext?.emergency?.type !== newW.extendedContext?.emergency?.type
    );
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Persistence
  private async persistWorkspace(workspace: ResolvedWorkspace): Promise<void> {
    if (!this.config.persistence.firestore && !this.config.persistence.localStorage) return;

    const snapshot: WorkspaceSnapshot = {
      uid: workspace.identity.uid,
      resolvedWorkspace: workspace,
      snapshotAt: Date.now(),
      deviceId: '',
      version: 1,
    };

    // LocalStorage
    if (this.config.persistence.localStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`amexan.workspace.${workspace.identity.uid}`, JSON.stringify(snapshot));
      } catch (e) {
        // Ignore storage errors
      }
    }

    // Firestore (async, non-blocking)
    if (this.config.persistence.firestore) {
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'workspaces', workspace.identity.uid), snapshot);
      } catch (e: any) {
        // Check if this is a permissions error
        const errorCode = e?.code || e?.message || '';
        const isPermissionError = 
          errorCode.includes('permission') || 
          errorCode.includes('missing') || 
          errorCode.includes('insufficient') ||
          errorCode.includes('unauthorized') ||
          errorCode.includes('not-found') ||
          errorCode.includes('forbidden');
        
        if (isPermissionError) {
          console.warn('[WorkspaceEngine] Firestore persistence failed due to permissions (expected in some contexts):', errorCode);
        } else {
          console.warn('[WorkspaceEngine] Firestore persistence failed:', e);
        }
      }
    }
  }

  // Load from persistence
  async loadPersistedWorkspace(uid: AmxUid): Promise<ResolvedWorkspace | null> {
    // Try localStorage first
    if (this.config.persistence.localStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`amexan.workspace.${uid}`);
        if (stored) {
          const snapshot: WorkspaceSnapshot = JSON.parse(stored);
          if (Date.now() - snapshot.snapshotAt < 60 * 60 * 1000) {
            return snapshot.resolvedWorkspace;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    // Try Firestore
    if (this.config.persistence.firestore) {
      try {
        const snap = await getDoc(doc(db, 'workspaces', uid));
        if (snap.exists()) {
          const snapshot: WorkspaceSnapshot = snap.data() as WorkspaceSnapshot;
          if (Date.now() - snapshot.snapshotAt < 24 * 60 * 60 * 1000) {
            return snapshot.resolvedWorkspace;
          }
        }
      } catch (e) {
        console.warn('[WorkspaceEngine] Failed to load persisted workspace:', e);
      }
    }

    return null;
  }

  // Cleanup
  destroy(): void {
    this.stopAutoRefresh();
    this.eventListeners.clear();
    this.currentWorkspace = null;
    this.currentUid = null;
    this.initialized = false;

    // Clear resolver caches
    membershipResolver.clearCache();
    employmentResolver.clearCache();
    facilityResolver.clearCache();
    assignmentResolver.clearCache();
  }

  // Configuration
  updateConfig(config: Partial<WorkspaceEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): WorkspaceEngineConfig {
    return { ...this.config };
  }
}

// Singleton instance
let engineInstance: WorkspaceEngine | null = null;

export function getWorkspaceEngine(config?: Partial<WorkspaceEngineConfig>): WorkspaceEngine {
  if (!engineInstance) {
    engineInstance = new WorkspaceEngine(config);
  }
  return engineInstance;
}

export function resetWorkspaceEngine(): void {
  if (engineInstance) {
    engineInstance.destroy();
    engineInstance = null;
  }
}

// Backward compatibility exports
export const workspaceEngine = {
  initialize: (uid: AmxUid, context?: Partial<ResolverContext>) => getWorkspaceEngine().initialize(uid, context),
  getWorkspace: () => getWorkspaceEngine().getWorkspace(),
  getSession: () => getWorkspaceEngine().getSession(),
  refresh: (context?: Partial<ResolverContext>) => getWorkspaceEngine().refresh(context),
  switchOrganization: (orgId: string) => getWorkspaceEngine().switchOrganization(orgId),
  switchFacility: (facilityId: string) => getWorkspaceEngine().switchFacility(facilityId),
  switchDepartment: (departmentId: string) => getWorkspaceEngine().switchDepartment(departmentId),
  can: (resource: any, action: any, scope?: any) => getWorkspaceEngine().can(resource, action, scope),
  onEvent: (listener: WorkspaceEventListener) => getWorkspaceEngine().onEvent(listener),
  destroy: () => getWorkspaceEngine().destroy(),
};