import type { AmxUid } from '../constitution/types'
import type { MembershipRecord, WorkspaceContext } from './identity-engine'
import { UniversalIdentityEngine } from './identity-engine'
import type { Role, Permission, Department, Organization, Employment, Assignment } from '../constitution/types'
import { can } from '../constitution/auth'
import { evaluatePolicies, type Policy } from '../constitution/policy-engine'
import { isAuthorized, setPolicyStore, setRelationships, type AuthzEngineRequest, type AuthzResult } from '../authz'

// ── In-memory membership store ──────────────────────────────────────────────────

const membershipStore = new Map<string, MembershipRecord[]>() // key: identityId
const workspaceContextCache = new Map<string, WorkspaceContext>() // key: `${identityId}:${orgId}`

// ── Engine ─────────────────────────────────────────────────────────────────────

export class UniversalMembershipEngine {
  /** Add a membership record for an identity within an organization */
  static addMembership(membership: MembershipRecord): MembershipRecord {
    const list = membershipStore.get(membership.identityId) ?? []
    list.push(membership)
    membershipStore.set(membership.identityId, list)

    // Invalidate workspace cache
    workspaceContextCache.delete(`${membership.identityId}:${membership.orgId}`)
    return membership
  }

  /** Get active memberships for an identity */
  static getMemberships(uid: AmxUid): MembershipRecord[] {
    return membershipStore.get(uid) ?? []
  }

  /** Get active memberships filtered by organization */
  static getMembershipsByOrg(uid: AmxUid, orgId: string): MembershipRecord[] {
    return (membershipStore.get(uid) ?? []).filter(m => m.orgId === orgId && !m.endedAt)
  }

  /** Get the primary/organization membership (first active) */
  static getPrimaryMembership(uid: AmxUid, orgId: string): MembershipRecord | undefined {
    return this.getMembershipsByOrg(uid, orgId).find(m => m.status === 'active')
  }

  /** End / terminate a membership */
  static endMembership(membershipId: string, endedAt = Date.now()): boolean {
    for (const [uid, memberships] of membershipStore) {
      const index = memberships.findIndex(m => m.identityId + ':' + m.orgId === membershipId || m.identityId === uid)
      if (index !== -1) {
        memberships[index].endedAt = endedAt
        memberships[index].status = 'inactive'
        membershipStore.set(uid, memberships)
        return true
      }
    }
    return false
  }

  /** Suspend a membership temporarily */
  static suspendMembership(membershipId: string): boolean {
    for (const [uid, memberships] of membershipStore) {
      const index = memberships.findIndex(m => m.identityId + ':' + m.orgId === membershipId)
      if (index !== -1) {
        memberships[index].status = 'suspended'
        membershipStore.set(uid, memberships)
        return true
      }
    }
    return false
  }

  /** Derive permissions for an identity in a specific organizational context */
  static async derivePermissions(
    uid: AmxUid,
    organizationId: string,
    departmentId?: string,
    wardId?: string,
  ): Promise<Permission[]> {
    const membership = this.getPrimaryMembership(uid, organizationId)
    if (!membership) return []

    // Query role engine for role permissions (stubbed — in production loads from role repository)
    const rolePermissions = await this.getRolePermissions(membership.roleId)

    // Evaluate ABAC/RBAC/Policy engine via authz
    const authzRequest: AuthzEngineRequest = {
      subject: {
        uid,
        roles: [membership.roleId],
        departmentId,
        position: membership.roleId,
        permissions: rolePermissions,
      },
      resource: { type: 'organization', departmentId },
      action: 'read',
      context: {},
    }

    const authzResult: AuthzResult = isAuthorized(authzRequest)

    if (!authzResult.allowed) {
      return []
    }

    return rolePermissions
  }

  /** Resolve the complete workspace context for a session */
  static async resolveWorkspaceContext(
    uid: AmxUid,
    organizationId: string,
    departmentId?: string,
  ): Promise<WorkspaceContext | null> {
    const cacheKey = `${uid}:${organizationId}:${departmentId ?? ''}`
    const cached = workspaceContextCache.get(cacheKey)
    if (cached) return cached

    const memberships = this.getMembershipsByOrg(uid, organizationId)
    const activeMemberships = memberships.filter(m => m.status === 'active' && !m.endedAt)

    if (activeMemberships.length === 0) return null

    const primary = activeMemberships[0]
    const permissions = await this.derivePermissions(uid, organizationId, primary.departmentId)

    const context: WorkspaceContext = {
      organizationId,
      departmentId: primary.departmentId,
      unitId: primary.unitId,
      roleId: primary.roleId,
      permissions,
      activeAssignments: [],
    }

    workspaceContextCache.set(cacheKey, context)
    return context
  }

  /** Derive dashboard for an identity within an org */
  static async deriveDashboardContext(
    uid: AmxUid,
    organizationId: string,
  ): Promise<{ workspace: WorkspaceContext | null; permissions: Permission[]; memberships: MembershipRecord[] }> {
    const memberships = this.getMembershipsByOrg(uid, organizationId)
    const workspace = await this.resolveWorkspaceContext(uid, organizationId)
    const permissions = workspace?.permissions ?? []
    return { workspace, permissions, memberships }
  }

  // ── Internal helpers ───────────────────────────────────────────────────────────

  /** Stub: In production this loads role permissions from the role repository */
  private static async getRolePermissions(roleId: string): Promise<Permission[]> {
    // Placeholder for role repository lookup
    // Real implementation would query Role store / Neo4j role node
    return []
  }

  // ── Utilities ──────────────────────────────────────────────────────────────────

  static clearStore(): void {
    membershipStore.clear()
    workspaceContextCache.clear()
  }
}

// ── Convenience exports ───────────────────────────────────────────────────────────

export {
  can as canPermission,
  isAuthorized,
  setPolicyStore,
  setRelationships,
}
