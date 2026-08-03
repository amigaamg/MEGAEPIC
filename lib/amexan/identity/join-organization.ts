import type { AmxUid } from './types'
import { InvitationEngine } from './invitation'
import type { Invitation } from './invitation'
import { UniversalIdentityEngine, type MembershipRecord } from './identity-engine'

// ── Organization Joining Engine ──────────────────────────────────────────────────
// Handles both:
//   1. Invite-only join (user receives invitation code, then joins)
//   2. Open join (user joins via public invitation link with approval flow)

export type { AmxUid }

// ── Join Request Status ─────────────────────────────────────────────────────────

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired'

// ── Join Request ─────────────────────────────────────────────────────────────────
// A join request represents a user who wants to become a member of an organization.

export interface JoinRequest {
  id: string
  uid: AmxUid
  orgId: string
  invitationCode?: string
  requestedRole: string
  departmentId?: string
  justification?: string
  documents?: Array<{ type: string; url: string; verified: boolean }>
  status: JoinRequestStatus
  createdAt: number
  expiresAt: number
  reviewedBy?: AmxUid
  reviewedAt?: number
  rejectionReason?: string
  metadata?: Record<string, any>
}

// ── Organization Join Configuration ─────────────────────────────────────────────
// Defines how an organization accepts new members.

export interface JoinConfiguration {
  orgId: string
  mode: 'open' | 'invite-only' | 'approval-required'
  autoAssignRole?: string
  requiresApproval: boolean
  requiresDocument?: boolean
  documentTypes?: string[]
  welcomeMessage?: string
  allowedDomains?: string[]
  defaultDepartmentId?: string
  maxMembers?: number
  membershipExpiryDays?: number
}

// ── Join Result ──────────────────────────────────────────────────────────────────

export interface JoinResult {
  success: boolean
  joinRequest?: JoinRequest
  invitation?: Invitation
  membership?: MembershipRecord
  reason?: string
}

// ── In-Memory Stores ─────────────────────────────────────────────────────────────
// In production these map to join_requests and join_configurations tables.

const joinRequestStore = new Map<string, JoinRequest>()
const joinConfigStore = new Map<string, JoinConfiguration>()

// ── Engine ──────────────────────────────────────────────────────────────────────

export class OrganizationJoinEngine {
  // ── Configuration Management ───────────────────────────────────────────────

  /**
   * Set or update the join configuration for an organization.
   */
  static configureJoin(opts: JoinConfiguration): JoinConfiguration {
    joinConfigStore.set(opts.orgId, opts)
    return opts
  }

  /**
   * Get the join configuration for an organization.
   * Defaults to invite-only mode if not configured.
   */
  static getJoinConfiguration(orgId: string): JoinConfiguration {
    const existing = joinConfigStore.get(orgId)
    if (existing) return existing

    const defaultConfig: JoinConfiguration = {
      orgId,
      mode: 'invite-only',
      requiresApproval: false,
      autoAssignRole: '',
    }
    joinConfigStore.set(orgId, defaultConfig)
    return defaultConfig
  }

  // ── Join Operations ─────────────────────────────────────────────────────────

  /**
   * Process a join request. This is the main entry point for users who want
   * to join an organization, either with or without an invitation code.
   *
   * Flow:
   * 1. If invitation code provided → validate invitation
   * 2. If open/required approval → create join request
   * 3. If no approval needed → create membership directly
   */
  static async submitJoinRequest(opts: {
    uid: AmxUid
    orgId: string
    invitationCode?: string
    requestedRole: string
    departmentId?: string
    justification?: string
    documents?: Array<{ type: string; url: string }>
  }): Promise<JoinResult> {
    const config = this.getJoinConfiguration(opts.orgId)
    const now = Date.now()
    const ttl = 168 * 3600 * 1000 // 7 days

    // If an invitation code was provided, validate it first
    let invitation: Invitation | undefined
    if (opts.invitationCode) {
      const validation = InvitationEngine.validateInvitation(opts.invitationCode)
      if (!validation.valid) {
        return { success: false, reason: validation.reason ?? 'invalid_invitation' }
      }

      // Check that the invitation is for this organization
      if (validation.invitation && validation.invitation.orgId !== opts.orgId) {
        return { success: false, reason: 'invitation_org_mismatch' }
      }
      invitation = validation.invitation
    }

    // Check organization capacity
    if (config.maxMembers && config.maxMembers > 0) {
      const currentCount = Array.from(joinRequestStore.values()).filter(
        (jr) => jr.orgId === opts.orgId && jr.status === 'approved'
      ).length
      // Note: in production this would query actual membership count
      if (currentCount >= config.maxMembers) {
        return { success: false, reason: 'organization_full' }
      }
    }

    // Check allowed domains (if email domain restriction is set)
    if (config.allowedDomains && config.allowedDomains.length > 0) {
      // Domain check would require identity lookup; for now, allow through
    }

    // If no approval required and (invited or open join), create membership directly
    if (!config.requiresApproval) {
      // Accept invitation if one was used
      if (invitation) {
        InvitationEngine.acceptInvitation(opts.invitationCode!, opts.uid)
      }

      // Create membership
      const membership: MembershipRecord = {
        identityId: opts.uid,
        orgId: opts.orgId,
        departmentId: opts.departmentId ?? config.defaultDepartmentId,
        roleId: opts.requestedRole || config.autoAssignRole || '',
        startedAt: now,
        status: 'active',
      }

      // In a full implementation, this would call UniversalIdentityEngine.addMembership
      // For now, return the membership record
      return { success: true, membership, invitation }
    }

    // Approval required — create a join request
    const requestId = `req_${now}_${Math.random().toString(36).substring(2, 10)}`
    const joinRequest: JoinRequest = {
      id: requestId,
      uid: opts.uid,
      orgId: opts.orgId,
      invitationCode: opts.invitationCode,
      requestedRole: opts.requestedRole || config.autoAssignRole || '',
      departmentId: opts.departmentId ?? config.defaultDepartmentId,
      justification: opts.justification,
      documents: opts.documents?.map((d) => ({ ...d, verified: false })),
      status: 'pending',
      createdAt: now,
      expiresAt: now + ttl,
      metadata: {},
    }

    joinRequestStore.set(requestId, joinRequest)
    return { success: true, joinRequest, invitation }
  }

  /**
   * Review (approve or reject) a join request.
   */
  static reviewJoinRequest(
    requestId: string,
    reviewerUid: AmxUid,
    decision: 'approved' | 'rejected',
    reason?: string,
  ): JoinRequest | null {
    const request = joinRequestStore.get(requestId)
    if (!request) return null
    if (request.status !== 'pending') return null

    const now = Date.now()
    if (now > request.expiresAt) {
      request.status = 'expired'
      joinRequestStore.set(requestId, request)
      return null
    }

    request.status = decision
    request.reviewedBy = reviewerUid
    request.reviewedAt = now
    if (decision === 'rejected' && reason) {
      request.rejectionReason = reason
    }

    joinRequestStore.set(requestId, request)

    // If approved and invitation was used, accept it
    if (decision === 'approved' && request.invitationCode) {
      InvitationEngine.acceptInvitation(request.invitationCode, request.uid)
    }

    return request
  }

  /**
   * Get all pending join requests for an organization.
   */
  static getPendingJoinRequests(orgId: string): JoinRequest[] {
    const now = Date.now()
    const results: JoinRequest[] = []
    for (const req of joinRequestStore.values()) {
      if (req.orgId === orgId && req.status === 'pending' && now <= req.expiresAt) {
        results.push(req)
      }
    }
    return results
  }

  /**
   * Get a specific join request by ID.
   */
  static getJoinRequest(requestId: string): JoinRequest | undefined {
    return joinRequestStore.get(requestId)
  }

  /**
   * Cancel a join request (user can cancel their own pending request).
   */
  static cancelJoinRequest(requestId: string, uid: AmxUid): boolean {
    const request = joinRequestStore.get(requestId)
    if (!request) return false
    if (request.uid !== uid) return false
    if (request.status !== 'pending') return false

    request.status = 'rejected'
    request.rejectionReason = 'cancelled_by_user'
    joinRequestStore.set(requestId, request)
    return true
  }

  /**
   * Get all join requests for a user across organizations.
   */
  static getUserJoinRequests(uid: AmxUid): JoinRequest[] {
    const results: JoinRequest[] = []
    for (const req of joinRequestStore.values()) {
      if (req.uid === uid) {
        results.push(req)
      }
    }
    return results
  }

  /**
   * Purge expired join requests.
   */
  static purgeExpired(): number {
    const now = Date.now()
    let count = 0
    for (const [id, req] of joinRequestStore.entries()) {
      if (req.status === 'pending' && now > req.expiresAt) {
        req.status = 'expired'
        joinRequestStore.set(id, req)
        count++
      }
    }
    return count
  }

  /**
   * Clear all stores (for testing).
   */
  static clearStore(): void {
    joinRequestStore.clear()
    joinConfigStore.clear()
  }
}

// ── Convenience Exports ─────────────────────────────────────────────────────────

export {
  OrganizationJoinEngine as JoinOrchestrator,
  OrganizationJoinEngine as OrganizationJoin,
}
