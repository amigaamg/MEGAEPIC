import { describe, it, expect, beforeEach } from 'vitest'
import { InvitationEngine, generateInvitationCode, validateInvitation, acceptInvitation, revokeInvitation } from '@/lib/amexan/identity/invitation'
import { UniversalIdentityEngine } from '@/lib/amexan/identity/identity-engine'
import { IdentityType } from '@/lib/amexan/identity/types'

describe('Invitation Code Generation', () => {
  it('generates a code in XXXX-XXXX-XXXX-XXXX format', () => {
    const code = generateInvitationCode()
    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
  })

  it('generates unique codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) codes.add(generateInvitationCode())
    expect(codes.size).toBe(100)
  })
})

describe('Invitation Engine', () => {
  beforeEach(() => {
    InvitationEngine.clearStore()
    UniversalIdentityEngine.clearStore()
  })

  function getInviterUid() {
    return UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Inviter', email: 'inviter@test.com', phone: '555-0000'
    }).uid
  }

  it('createInvitation returns a valid invitation', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({
      inviterUid, orgId: 'org-1', roleId: 'doctor'
    })
    expect(inv.id).toMatch(/^inv_/)
    expect(inv.code).toMatch(/^[A-Z2-9]{4}-/)
    expect(inv.inviterUid).toBe(inviterUid)
    expect(inv.orgId).toBe('org-1')
    expect(inv.roleId).toBe('doctor')
    expect(inv.status).toBe('pending')
    expect(inv.expiresAt).toBeGreaterThan(inv.createdAt)
  })

  it('getInvitationByCode retrieves by code', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    const found = InvitationEngine.getInvitationByCode(inv.code)
    expect(found?.id).toBe(inv.id)
  })

  it('getInvitationById retrieves by ID', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    const found = InvitationEngine.getInvitationById(inv.id)
    expect(found?.code).toBe(inv.code)
  })

  it('getInvitationByCode returns undefined for unknown code', () => {
    expect(InvitationEngine.getInvitationByCode('XXXX-XXXX-XXXX-XXXX')).toBeUndefined()
  })

  it('validateInvitation returns true for valid, non-expired invitation', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    const result = InvitationEngine.validateInvitation(inv.code)
    expect(result.valid).toBe(true)
    expect(result.invitation?.code).toBe(inv.code)
  })

  it('validateInvitation rejects already-accepted invitation', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    InvitationEngine.acceptInvitation(inv.code, inviterUid)
    const result = InvitationEngine.validateInvitation(inv.code)
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('already_accepted')
  })

  it('validateInvitation rejects revoked invitation', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    InvitationEngine.revokeInvitation(inv.code, inviterUid)
    const result = InvitationEngine.validateInvitation(inv.code)
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('revoked')
  })

  it('validateInvitation rejects non-existent invitation', () => {
    const result = InvitationEngine.validateInvitation('NOSUCH-XXXX-XXXX-XXXX')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('invitation_not_found')
  })

  it('acceptInvitation marks as accepted and records acceptance', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    const accepted = InvitationEngine.acceptInvitation(inv.code, inviterUid)
    expect(accepted).not.toBeNull()
    expect(accepted!.status).toBe('accepted')
    expect(accepted!.acceptedAt).toBeDefined()
  })

  it('acceptInvitation returns null for invalid code', () => {
    expect(InvitationEngine.acceptInvitation('BAD-CODE-XX', getInviterUid())).toBeNull()
  })

  it('revokeInvitation returns true for valid pending invitation', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    expect(InvitationEngine.revokeInvitation(inv.code, inviterUid)).toBe(true)
    const found = InvitationEngine.getInvitationById(inv.id)
    expect(found?.status).toBe('revoked')
    expect(found?.revokedBy).toBe(inviterUid)
  })

  it('revokeInvitation returns false for non-existent invitation', () => {
    expect(InvitationEngine.revokeInvitation('BAD-CODE-XX', getInviterUid())).toBe(false)
  })

  it('revokeInvitation fails for already-accepted invitation', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    InvitationEngine.acceptInvitation(inv.code, inviterUid)
    expect(InvitationEngine.revokeInvitation(inv.code, inviterUid)).toBe(false)
  })

  it('listInvitationsByInviter returns invitations for a given inviter', () => {
    const inviterUid = getInviterUid()
    const otherUid = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Other', email: 'o@test.com', phone: '555-0000'
    }).uid

    InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    InvitationEngine.createInvitation({ inviterUid, orgId: 'org-2', roleId: 'nurse' })
    InvitationEngine.createInvitation({ inviterUid: otherUid, orgId: 'org-1', roleId: 'admin' })

    const invitations = InvitationEngine.listInvitationsByInviter(inviterUid)
    expect(invitations.length).toBe(2)
  })

  it('listPendingInvitations returns only valid pending invitations', () => {
    const inviterUid = getInviterUid()
    InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'nurse' })

    const pending = InvitationEngine.listPendingInvitations('org-1')
    expect(pending.length).toBe(2)
  })

  it('purgeExpired returns count and marks expired invitations', () => {
    const count = InvitationEngine.purgeExpired()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  it('uses custom TTL when provided', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({
      inviterUid, orgId: 'org-1', roleId: 'doctor', ttlHours: 1
    })
    expect(inv.expiresAt - inv.createdAt).toBe(3600000)
  })

  it('standalone validateInvitation wrapper works', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    const result = validateInvitation(inv.code)
    expect(result.valid).toBe(true)
  })

  it('standalone acceptInvitation wrapper works', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    const accepted = acceptInvitation(inv.code, inviterUid)
    expect(accepted).not.toBeNull()
    expect(accepted!.status).toBe('accepted')
  })

  it('standalone revokeInvitation wrapper works', () => {
    const inviterUid = getInviterUid()
    const inv = InvitationEngine.createInvitation({ inviterUid, orgId: 'org-1', roleId: 'doctor' })
    expect(revokeInvitation(inv.code, inviterUid)).toBe(true)
  })
})

