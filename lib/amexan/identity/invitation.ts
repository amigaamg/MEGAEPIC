import type { AmxUid } from './types'

// ── Invitation Engine ─────────────────────────────────────────────────────────────
// Handles invite-based onboarding: invitations are issued by organizations
// to identities, which may or may not yet have an AMEXAN account.

export type { AmxUid }

// ── Invitation Status ───────────────────────────────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | 'pending_review'

// ── Invitation Type ─────────────────────────────────────────────────────────────

export interface Invitation {
  id: string
  code: string
  inviterUid: AmxUid
  inviteeEmail?: string
  inviteePhone?: string
  orgId: string
  deptId?: string
  roleId: string
  permissions?: string[]
  message?: string
  status: InvitationStatus
  createdAt: number
  expiresAt: number
  acceptedAt?: number
  revokedAt?: number
  revokedBy?: AmxUid
  metadata?: Record<string, any>
}

// ── Invitation Code Generation ──────────────────────────────────────────────────

/**
 * Generate a secure, human-readable invitation code.
 * Format: XXXX-XXXX-XXXX (4 groups of 4 alphanumeric characters)
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const groups: string[] = []
  for (let i = 0; i < 4; i++) {
    let group = ''
    for (let j = 0; j < 4; j++) {
      group += chars[Math.floor(Math.random() * chars.length)]
    }
    groups.push(group)
  }
  return groups.join('-')
}

// ── In-Memory Store ─────────────────────────────────────────────────────────────
// In production this maps to invitations table in Postgres.

const invitationStore = new Map<string, Invitation>()

// ── Engine ──────────────────────────────────────────────────────────────────────

export class InvitationEngine {
  /**
   * Issue a new invitation from an inviter to a potential member.
   * Returns the created invitation with a unique code and expiry.
   */
  static createInvitation(opts: {
    inviterUid: AmxUid
    inviteeEmail?: string
    inviteePhone?: string
    orgId: string
    deptId?: string
    roleId: string
    permissions?: string[]
    message?: string
    ttlHours?: number
    metadata?: Record<string, any>
  }): Invitation {
    const now = Date.now()
    const ttl = (opts.ttlHours ?? 72) * 3600 * 1000
    const invitation: Invitation = {
      id: `inv_${now}_${Math.random().toString(36).substring(2, 10)}`,
      code: generateInvitationCode(),
      inviterUid: opts.inviterUid,
      inviteeEmail: opts.inviteeEmail,
      inviteePhone: opts.inviteePhone,
      orgId: opts.orgId,
      deptId: opts.deptId,
      roleId: opts.roleId,
      permissions: opts.permissions,
      message: opts.message,
      status: 'pending',
      createdAt: now,
      expiresAt: now + ttl,
      metadata: opts.metadata,
    }

    invitationStore.set(invitation.id, invitation)
    invitationStore.set(`code:${invitation.code}`, invitation)

    return invitation
  }

  /**
   * Look up an invitation by its code.
   */
  static getInvitationByCode(code: string): Invitation | undefined {
    return invitationStore.get(`code:${code}`)
  }

  /**
   * Look up an invitation by ID.
   */
  static getInvitationById(id: string): Invitation | undefined {
    return invitationStore.get(id)
  }

  /**
   * Validate that an invitation is still active and valid.
   */
  static validateInvitation(code: string): { valid: boolean; invitation?: Invitation; reason?: string } {
    const invitation = this.getInvitationByCode(code)
    if (!invitation) {
      return { valid: false, reason: 'invitation_not_found' }
    }
    if (invitation.status === 'accepted') {
      return { valid: false, reason: 'already_accepted' }
    }
    if (invitation.status === 'revoked') {
      return { valid: false, reason: 'revoked' }
    }
    if (invitation.status === 'expired') {
      return { valid: false, reason: 'expired' }
    }
    const now = Date.now()
    if (now > invitation.expiresAt) {
      invitation.status = 'expired'
      invitationStore.set(invitation.id, invitation)
      invitationStore.set(`code:${invitation.code}`, invitation)
      return { valid: false, reason: 'expired' }
    }
    return { valid: true, invitation }
  }

  /**
   * Accept an invitation: marks it accepted and returns the invitation data
   * needed to create a membership.
   */
  static acceptInvitation(code: string, accepterUid: AmxUid): Invitation | null {
    const result = this.validateInvitation(code)
    if (!result.valid || !result.invitation) return null

    const invitation = result.invitation
    invitation.status = 'accepted'
    invitation.acceptedAt = Date.now()
    invitation.inviterUid = accepterUid

    invitationStore.set(invitation.id, invitation)
    invitationStore.set(`code:${invitation.code}`, invitation)

    return invitation
  }

  /**
   * Revoke an invitation (only the inviter or an admin can revoke).
   */
  static revokeInvitation(codeOrId: string, revokedBy: AmxUid, reason?: string): boolean {
    const invitation = invitationStore.get(codeOrId) ?? invitationStore.get(`code:${codeOrId}`)
    if (!invitation) return false
    if (invitation.status === 'accepted') return false

    invitation.status = 'revoked'
    invitation.revokedAt = Date.now()
    invitation.revokedBy = revokedBy

    invitationStore.set(invitation.id, invitation)
    invitationStore.set(`code:${invitation.code}`, invitation)
    return true
  }

  /**
   * List all invitations for a given inviter.
   */
  static listInvitationsByInviter(inviterUid: AmxUid): Invitation[] {
    const results: Invitation[] = []
    for (const [key, inv] of invitationStore.entries()) {
      if (key.startsWith('code:')) continue
      if (inv.inviterUid === inviterUid) {
        results.push(inv)
      }
    }
    return results
  }

  /**
   * List pending invitations for an organization.
   */
  static listPendingInvitations(orgId: string): Invitation[] {
    const results: Invitation[] = []
    const now = Date.now()
    for (const [key, inv] of invitationStore.entries()) {
      if (key.startsWith('code:')) continue
      if (inv.orgId === orgId && inv.status === 'pending' && now <= inv.expiresAt) {
        results.push(inv)
      }
    }
    return results
  }

  /**
   * Clean up expired invitations (call periodically or at startup).
   */
  static purgeExpired(): number {
    const now = Date.now()
    let count = 0
    for (const [key, inv] of invitationStore.entries()) {
      if (!key.startsWith('code:') && inv.status !== 'accepted' && inv.status !== 'revoked' && now > inv.expiresAt) {
        inv.status = 'expired'
        invitationStore.set(inv.id, inv)
        invitationStore.set(`code:${inv.code}`, inv)
        count++
      }
    }
    return count
  }

  /**
   * Clear the invitation store (for testing).
   */
  static clearStore(): void {
    invitationStore.clear()
  }
}

// ── Convenience Exports ─────────────────────────────────────────────────────────

// Standalone wrappers for ergonomic use
export function validateInvitation(code: string) {
  return InvitationEngine.validateInvitation(code)
}

export function acceptInvitation(code: string, accepterUid: AmxUid) {
  return InvitationEngine.acceptInvitation(code, accepterUid)
}

export function revokeInvitation(codeOrId: string, revokedBy: AmxUid, reason?: string) {
  return InvitationEngine.revokeInvitation(codeOrId, revokedBy, reason)
}
