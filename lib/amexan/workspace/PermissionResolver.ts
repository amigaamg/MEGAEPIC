// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Permission Resolver
// Resolves effective permissions from roles, responsibilities, and context
// Constitutional Principle: Permissions are contextual, not just role-based
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ResolvedWorkspace,
  ResolverResult,
} from './types';
import type { AmxUid, Role, Responsibility, Permission } from '@/lib/amexan/constitution/types';
import { can as checkCan, type ResourceType, type Action } from '@/lib/amexan';

export class PermissionResolver {
  async resolve(workspace: ResolvedWorkspace): Promise<ResolverResult<Permission[]>> {
    try {
      const permissions = new Map<string, Permission>();

      // 1. Base role permissions
      if (workspace.role?.permissions) {
        for (const p of workspace.role.permissions) {
          const key = `${p.resource}:${p.actions.join(',')}:${p.scope.type}`;
          permissions.set(key, p);
        }
      }

      // 2. Employment-based permissions (from active employment)
      if (workspace.activeEmployment?.privileges) {
        for (const priv of workspace.activeEmployment.privileges) {
          // Parse privilege string (e.g., "patient:create,read:organization")
          const [resource, actionsStr] = priv.split(':');
          if (resource && actionsStr) {
            const actions = actionsStr.split(',') as Action[];
            const key = `${resource}:${actions.join(',')}:organization`;
            if (!permissions.has(key)) {
              permissions.set(key, {
                resource: resource as ResourceType,
                actions,
                scope: { type: 'organization', organizationIds: [workspace.activeEmployment.organizationId] },
                deny: false,
              });
            }
          }
        }
      }

      // 3. Responsibility-based permissions
      for (const resp of workspace.responsibilities) {
        if (resp.status !== 'active') continue;
        const respPermissions = this.getResponsibilityPermissions(resp);
        for (const p of respPermissions) {
          const key = `${p.resource}:${p.actions.join(',')}:${p.scope.type}`;
          if (!permissions.has(key)) {
            permissions.set(key, p);
          }
        }
      }

      // 4. Assignment-based permissions (contextual)
      if (workspace.activeAssignment) {
        const assignmentPermissions = this.getAssignmentPermissions(workspace.activeAssignment, workspace);
        for (const p of assignmentPermissions) {
          const key = `${p.resource}:${p.actions.join(',')}:${p.scope.type}`;
          // Assignment permissions can override (higher priority)
          permissions.set(key, p);
        }
      }

      // 5. Shift-based permissions
      if (workspace.activeShift) {
        const shiftPermissions = this.getShiftPermissions(workspace.activeShift, workspace);
        for (const p of shiftPermissions) {
          const key = `${p.resource}:${p.actions.join(',')}:${p.scope.type}`;
          permissions.set(key, p);
        }
      }

      // 6. Team-based permissions
      if (workspace.activeTeam) {
        const teamPermissions = this.getTeamPermissions(workspace.activeTeam, workspace);
        for (const p of teamPermissions) {
          const key = `${p.resource}:${p.actions.join(',')}:${p.scope.type}`;
          permissions.set(key, p);
        }
      }

      // 7. Contextual scope restrictions
      const scopedPermissions = this.applyContextualScopes(Array.from(permissions.values()), workspace);

      // 8. Sort: deny first, then by resource
      const sorted = scopedPermissions.sort((a, b) => {
        if (a.deny && !b.deny) return -1;
        if (!a.deny && b.deny) return 1;
        return a.resource.localeCompare(b.resource);
      });

      return { data: sorted, error: null, fromCache: false, resolvedAt: Date.now() };
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  private getResponsibilityPermissions(responsibility: Responsibility): Permission[] {
    const baseScope = {
      type: 'department' as const,
      departmentIds: [responsibility.targetId],
    };

    switch (responsibility.type) {
      case 'ward_coverage':
        return [
          { resource: 'patient', actions: ['read', 'update'], scope: baseScope, deny: false },
          { resource: 'encounter', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
          { resource: 'prescription', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
          { resource: 'lab_order', actions: ['create', 'read'], scope: baseScope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
        ];
      case 'clinic_coverage':
        return [
          { resource: 'patient', actions: ['read', 'update'], scope: baseScope, deny: false },
          { resource: 'encounter', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
          { resource: 'prescription', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
          { resource: 'referral', actions: ['create', 'read'], scope: baseScope, deny: false },
        ];
      case 'theatre_schedule':
        return [
          { resource: 'patient', actions: ['read'], scope: baseScope, deny: false },
          { resource: 'encounter', actions: ['read', 'update'], scope: baseScope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
        ];
      case 'primary_doctor':
        return [
          { resource: 'patient', actions: ['read', 'update'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
          { resource: 'encounter', actions: ['create', 'read', 'update', 'sign'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
          { resource: 'prescription', actions: ['create', 'read', 'update', 'delete'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
          { resource: 'lab_order', actions: ['create', 'read', 'update'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
          { resource: 'imaging_order', actions: ['create', 'read', 'update'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
          { resource: 'clinical_note', actions: ['create', 'read', 'update', 'sign'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
          { resource: 'referral', actions: ['create', 'read'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
          { resource: 'discharge', actions: ['create', 'update', 'sign'], scope: { type: 'custom', patientIds: [responsibility.targetId] }, deny: false },
        ];
      case 'nurse_in_charge':
        return [
          { resource: 'patient', actions: ['read', 'update'], scope: baseScope, deny: false },
          { resource: 'vitals', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
          { resource: 'prescription', actions: ['read', 'administer'], scope: baseScope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'read'], scope: baseScope, deny: false },
          { resource: 'handover' as ResourceType, actions: ['create', 'read'], scope: baseScope, deny: false },
        ];
      case 'on_call_duty':
        return [
          { resource: 'patient', actions: ['read', 'update'], scope: baseScope, deny: false },
          { resource: 'encounter', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
          { resource: 'prescription', actions: ['create', 'read', 'update'], scope: baseScope, deny: false },
          { resource: 'lab_order', actions: ['create', 'read'], scope: baseScope, deny: false },
          { resource: 'imaging_order', actions: ['create', 'read'], scope: baseScope, deny: false },
        ];
      case 'quality_officer':
        return [
          { resource: 'audit_log', actions: ['read'], scope: baseScope, deny: false },
          { resource: 'reports', actions: ['read'], scope: baseScope, deny: false },
        ];
      case 'infection_control':
        return [
          { resource: 'patient', actions: ['read'], scope: baseScope, deny: false },
          { resource: 'reports', actions: ['read', 'create'], scope: baseScope, deny: false },
        ];
      default:
        return [];
    }
  }

  private getAssignmentPermissions(assignment: any, workspace: ResolvedWorkspace): Permission[] {
    const scope = {
      type: 'ward' as const,
      wardIds: assignment.location?.wardId ? [assignment.location.wardId] : [],
      departmentIds: assignment.departmentId ? [assignment.departmentId] : [],
      organizationIds: assignment.organizationId ? [assignment.organizationId] : [],
    };

    // Base assignment permissions
    const permissions: Permission[] = [
      { resource: 'patient', actions: ['read'], scope, deny: false },
      { resource: 'encounter', actions: ['read'], scope, deny: false },
    ];

    // Type-specific permissions
    switch (assignment.type) {
      case 'ward_round':
        permissions.push(
          { resource: 'patient', actions: ['update'], scope, deny: false },
          { resource: 'encounter', actions: ['create', 'update'], scope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'update', 'sign'], scope, deny: false },
          { resource: 'prescription', actions: ['create', 'update'], scope, deny: false },
          { resource: 'lab_order', actions: ['create', 'read'], scope, deny: false },
          { resource: 'imaging_order', actions: ['create', 'read'], scope, deny: false },
          { resource: 'referral', actions: ['create', 'read'], scope, deny: false },
          { resource: 'discharge', actions: ['create', 'update'], scope, deny: false },
        );
        break;
      case 'clinic':
        permissions.push(
          { resource: 'patient', actions: ['update'], scope, deny: false },
          { resource: 'encounter', actions: ['create', 'update'], scope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'update', 'sign'], scope, deny: false },
          { resource: 'prescription', actions: ['create', 'update'], scope, deny: false },
          { resource: 'lab_order', actions: ['create', 'read'], scope, deny: false },
          { resource: 'referral', actions: ['create', 'read'], scope, deny: false },
        );
        break;
      case 'emergency_call':
        permissions.push(
          { resource: 'patient', actions: ['create', 'update'], scope, deny: false },
          { resource: 'encounter', actions: ['create', 'update', 'sign'], scope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'update', 'sign'], scope, deny: false },
          { resource: 'prescription', actions: ['create', 'update'], scope, deny: false },
          { resource: 'lab_order', actions: ['create', 'read'], scope, deny: false },
          { resource: 'imaging_order', actions: ['create', 'read'], scope, deny: false },
          { resource: 'referral', actions: ['create', 'read'], scope, deny: false },
        );
        break;
      case 'icu_duty':
        permissions.push(
          { resource: 'patient', actions: ['update'], scope, deny: false },
          { resource: 'encounter', actions: ['update'], scope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'update'], scope, deny: false },
          { resource: 'vitals', actions: ['create', 'read', 'update'], scope, deny: false },
          { resource: 'prescription', actions: ['read', 'administer'], scope, deny: false },
        );
        break;
      case 'theatre':
        permissions.push(
          { resource: 'patient', actions: ['read', 'update'], scope, deny: false },
          { resource: 'encounter', actions: ['create', 'update', 'sign'], scope, deny: false },
          { resource: 'clinical_note', actions: ['create', 'update', 'sign'], scope, deny: false },
        );
        break;
    }

    return permissions;
  }

  private getShiftPermissions(shift: any, workspace: ResolvedWorkspace): Permission[] {
    // Shift-based permissions (e.g., night shift may have different permissions)
    const scope = {
      type: 'organization' as const,
      organizationIds: [workspace.organization?.id].filter(Boolean) as string[],
    };

    if (shift.type === 'night' || shift.type === 'on_call') {
      // Night/on-call shifts get broader emergency permissions
      return [
        { resource: 'patient', actions: ['create', 'read', 'update'], scope, deny: false },
        { resource: 'encounter', actions: ['create', 'read', 'update', 'sign'], scope, deny: false },
        { resource: 'prescription', actions: ['create', 'read', 'update'], scope, deny: false },
        { resource: 'lab_order', actions: ['create', 'read'], scope, deny: false },
        { resource: 'imaging_order', actions: ['create', 'read'], scope, deny: false },
      ];
    }

    return [];
  }

  private getTeamPermissions(team: any, workspace: ResolvedWorkspace): Permission[] {
    // Team-based permissions (e.g., trauma team, code blue team)
    const scope = {
      type: 'department' as const,
      departmentIds: team.departmentId ? [team.departmentId] : [],
      organizationIds: [workspace.organization?.id].filter(Boolean) as string[],
    };

    if (team.type === 'trauma_team' || team.type === 'code_blue_team' || team.type === 'rapid_response_team') {
      return [
        { resource: 'patient', actions: ['create', 'read', 'update'], scope, deny: false },
        { resource: 'encounter', actions: ['create', 'read', 'update', 'sign'], scope, deny: false },
        { resource: 'clinical_note', actions: ['create', 'update', 'sign'], scope, deny: false },
        { resource: 'prescription', actions: ['create', 'read', 'update'], scope, deny: false },
        { resource: 'lab_order', actions: ['create', 'read'], scope, deny: false },
        { resource: 'imaging_order', actions: ['create', 'read'], scope, deny: false },
      ];
    }

    return [];
  }

  private applyContextualScopes(permissions: Permission[], workspace: ResolvedWorkspace): Permission[] {
    return permissions.map(p => {
      // Add contextual scope restrictions
      const newScope = { ...p.scope };

      // If scope is organization, restrict to current organization
      if (p.scope.type === 'organization' && workspace.organization) {
        newScope.organizationIds = [workspace.organization.id];
      }

      // If scope is department, restrict to current department
      if (p.scope.type === 'department' && workspace.department) {
        newScope.departmentIds = [workspace.department.id];
      }

      // If scope is ward, restrict to current ward
      if (p.scope.type === 'ward' && workspace.ward) {
        newScope.wardIds = [workspace.ward.id];
      }

      // Add patient context if available
      if (workspace.activePatientIds.length > 0) {
        newScope.patientIds = workspace.activePatientIds;
      }

      // Add encounter context if available
      if (workspace.activeEncounterIds.length > 0) {
        newScope.encounterIds = workspace.activeEncounterIds;
      }

      return { ...p, scope: newScope };
    });
  }

  // Public API for checking permissions
  checkPermission(
    workspace: ResolvedWorkspace,
    resource: ResourceType,
    action: Action,
    scope?: { organizationId?: string; departmentId?: string; wardId?: string; patientId?: string }
  ): boolean {
    return checkCan(workspace.permissions, resource, action, scope);
  }

  getEffectivePermissions(workspace: ResolvedWorkspace): Permission[] {
    return workspace.permissions;
  }
}

export const permissionResolver = new PermissionResolver();