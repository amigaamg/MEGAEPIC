import { describe, it, expect, beforeEach } from 'vitest'
import {
  OrganizationJoinEngine,
  JoinOrchestrator,
  OrganizationJoin,
} from '@/lib/amexan/identity/join-organization'
import { InvitationEngine } from '@/lib/amexan/identity/invitation'
import { UniversalIdentityEngine } from '@/lib/amexan/identity/identity-engine'
import { IdentityType } from '@/lib/amexan/identity/types'

describe('Organization Join Engine', () => {
  let inviterUid: string
  let userUid: string

  beforeEach(() => {
    OrganizationJoinEngine.clearStore()
    InvitationEngine.clearStore()
    UniversalIdentityEngine.clearStore()

    const inviter = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Admin', email: 'admin@test.com', phone: '555-0000'
    })
    inviterUid = inviter.uid as string

    const user = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'User', email: 'user@test.com', phone: '555-0100'
    })
    userUid = user.uid as string
  })

  describe('Configuration Management', () => {
    it('configureJoin stores configuration', () => {
      const config = OrganizationJoinEngine.configureJoin({
        orgId: 'org-1', mode: 'open', requiresApproval: false,
        autoAssignRole: 'member', allowedDomains: ['test.com']
      })
      expect(config.orgId).toBe('org-1')
      expect(config.mode).toBe('open')
    })

    it('getJoinConfiguration returns default for unconfigured org', () => {
      const config = OrganizationJoinEngine.getJoinConfiguration('new-org')
      expect(config.mode).toBe('invite-only')
      expect(config.requiresApproval).toBe(false)
    })

    it('getJoinConfiguration returns stored config', () => {
      OrganizationJoinEngine.configureJoin({
        orgId: 'org-1', mode: 'approval-required', requiresApproval: true
      })
      const config = OrganizationJoinEngine.getJoinConfiguration('org-1')
      expect(config.mode).toBe('approval-required')
      expect(config.requiresApproval).toBe(true)
    })
  })

  describe('submitJoinRequest', () => {
    it('creates membership directly when no approval required', async () => {
      OrganizationJoinEngine.configureJoin({
        orgId: 'org-1', mode: 'open', requiresApproval: false, autoAssignRole: 'member'
      })
      const result = await OrganizationJoinEngine.submitJoinRequest({
        uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
      })
      expect(result.success).toBe(true)
      expect(result.membership).toBeDefined()
      expect(result.membership?.roleId).toBe('doctor')
    })

    it('uses invitation code successfully', async () => {
      OrganizationJoinEngine.configureJoin({
        orgId: 'org-1', mode: 'invite-only', requiresApproval: false, autoAssignRole: 'member'
      })
      const inv = InvitationEngine.createInvitation({
        inviterUid: inviterUid as any, orgId: 'org-1', roleId: 'member'
      })
      const result = await OrganizationJoinEngine.submitJoinRequest({
        uid: userUid as any, orgId: 'org-1', invitationCode: inv.code, requestedRole: 'member'
      })
      expect(result.success).toBe(true)
      expect(result.membership).toBeDefined()
      expect(result.invitation).toBeDefined()
    })

    it('rejects invalid invitation code', async () => {
      OrganizationJoinEngine.configureJoin({
        orgId: 'org-1', mode: 'invite-only', requiresApproval: false
      })
      const result = await OrganizationJoinEngine.submitJoinRequest({
        uid: userUid as any, orgId: 'org-1', invitationCode: 'BAD-CODE-XX', requestedRole: 'member'
      })
      expect(result.success).toBe(false)
      expect(result.reason).toBe('invitation_not_found')
    })

    it('rejects invitation from different organization', async () => {
      OrganizationJoinEngine.configureJoin({
        orgId: 'org-2', mode: 'invite-only', requiresApproval: false
      })
      const inv = InvitationEngine.createInvitation({
        inviterUid: inviterUid as any, orgId: 'org-1', roleId: 'member'
      })
      const result = await OrganizationJoinEngine.submitJoinRequest({
        uid: userUid as any, orgId: 'org-2', invitationCode: inv.code, requestedRole: 'member'
      })
      expect(result.success).toBe(false)
      expect(result.reason).toBe('invitation_org_mismatch')
    })

    it('creates join request when approval required', async () => {
      OrganizationJoinEngine.configureJoin({
        orgId: 'org-1', mode: 'approval-required', requiresApproval: true
      })
      const result = await OrganizationJoinEngine.submitJoinRequest({
        uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
      })
      expect(result.success).toBe(true)
      expect(result.joinRequest).toBeDefined()
      expect(result.joinRequest?.status).toBe('pending')
    })

    it('rejects when organization is full (counts approved join requests)', async () => {
      OrganizationJoinEngine.configureJoin({
        orgId: 'org-1', mode: 'approval-required', requiresApproval: true, maxMembers: 1, autoAssignRole: 'member'
      })
      // First user submits and gets approved
      const r1 = await OrganizationJoinEngine.submitJoinRequest({
        uid: userUid as any, orgId: 'org-1', requestedRole: 'member'
      })
      OrganizationJoinEngine.reviewJoinRequest(r1.joinRequest!.id, inviterUid as any, 'approved')

      // Second user hits capacity
      const user2 = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
        name: 'User2', email: 'u2@test.com', phone: '555-0001'
      })
      const result = await OrganizationJoinEngine.submitJoinRequest({
        uid: user2.uid as any, orgId: 'org-1', requestedRole: 'member'
      })
      expect(result.success).toBe(false)
      expect(result.reason).toBe('organization_full')
    })
  })

  describe('reviewJoinRequest', () => {
    it('rejects review of non-existent request', () => {
      expect(OrganizationJoinEngine.reviewJoinRequest('nonexistent', inviterUid as any, 'approved')).toBeNull()
    })
  })

  describe('getPendingJoinRequests', () => {
    it('returns empty when no requests', () => {
      expect(OrganizationJoinEngine.getPendingJoinRequests('org-1')).toEqual([])
    })
  })

  describe('getJoinRequest', () => {
    it('returns undefined for non-existent request', () => {
      expect(OrganizationJoinEngine.getJoinRequest('nonexistent')).toBeUndefined()
    })
  })

  describe('cancelJoinRequest', () => {
    it('returns false for non-existent request', () => {
      expect(OrganizationJoinEngine.cancelJoinRequest('nonexistent', userUid as any)).toBe(false)
    })
  })

  describe('getUserJoinRequests', () => {
    it('returns empty for user with no requests', () => {
      expect(OrganizationJoinEngine.getUserJoinRequests(userUid as any)).toEqual([])
    })
  })

  describe('purgeExpired', () => {
    it('returns count of purged expired requests', () => {
      const count = OrganizationJoinEngine.purgeExpired()
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Aliases', () => {
    it('JoinOrchestrator is OrganizationJoinEngine', () => {
      expect(JoinOrchestrator).toBe(OrganizationJoinEngine)
    })

    it('OrganizationJoin is OrganizationJoinEngine', () => {
      expect(OrganizationJoin).toBe(OrganizationJoinEngine)
    })
  })
})

describe('Async join request flow', () => {
  let inviterUid: string
  let userUid: string

  beforeEach(async () => {
    OrganizationJoinEngine.clearStore()
    InvitationEngine.clearStore()
    UniversalIdentityEngine.clearStore()

    const inviter = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Admin', email: 'admin@test.com', phone: '555-0000'
    })
    inviterUid = inviter.uid as string

    const user = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'User', email: 'user@test.com', phone: '555-0100'
    })
    userUid = user.uid as string

    OrganizationJoinEngine.configureJoin({
      orgId: 'org-1', mode: 'approval-required', requiresApproval: true
    })
  })

  it('submitJoinRequest with approval creates join request', async () => {
    const result = await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
    })
    expect(result.success).toBe(true)
    expect(result.joinRequest).toBeDefined()
    expect(result.membership).toBeUndefined()
  })

  it('reviewJoinRequest approves and returns updated request', async () => {
    const submitResult = await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
    })
    const requestId = submitResult.joinRequest!.id
    const reviewed = OrganizationJoinEngine.reviewJoinRequest(requestId, inviterUid as any, 'approved')
    expect(reviewed).not.toBeNull()
    expect(reviewed!.status).toBe('approved')
    expect(reviewed!.reviewedBy).toBe(inviterUid)
  })

  it('reviewJoinRequest rejects with reason', async () => {
    const submitResult = await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
    })
    const requestId = submitResult.joinRequest!.id
    const reviewed = OrganizationJoinEngine.reviewJoinRequest(requestId, inviterUid as any, 'rejected', 'Not qualified')
    expect(reviewed).not.toBeNull()
    expect(reviewed!.status).toBe('rejected')
    expect(reviewed!.rejectionReason).toBe('Not qualified')
  })

  it('reviewJoinRequest fails for already-reviewed request', async () => {
    const submitResult = await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
    })
    const requestId = submitResult.joinRequest!.id
    OrganizationJoinEngine.reviewJoinRequest(requestId, inviterUid as any, 'approved')
    const result = OrganizationJoinEngine.reviewJoinRequest(requestId, inviterUid as any, 'approved')
    expect(result).toBeNull()
  })

  it('approveJoinRequest with invitation accepts the invitation', async () => {
    const inv = InvitationEngine.createInvitation({
      inviterUid: inviterUid as any, orgId: 'org-1', roleId: 'doctor'
    })
    const submitResult = await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', invitationCode: inv.code, requestedRole: 'doctor'
    })
    const requestId = submitResult.joinRequest!.id
    const reviewed = OrganizationJoinEngine.reviewJoinRequest(requestId, inviterUid as any, 'approved')
    expect(reviewed).not.toBeNull()
    const invStatus = InvitationEngine.validateInvitation(inv.code)
    expect(invStatus.valid).toBe(false)
  })

  it('getPendingJoinRequests returns pending requests for org', async () => {
    await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
    })
    const pending = OrganizationJoinEngine.getPendingJoinRequests('org-1')
    expect(pending.length).toBe(1)
  })

  it('cancelJoinRequest works for own pending request', async () => {
    const submitResult = await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
    })
    const requestId = submitResult.joinRequest!.id
    expect(OrganizationJoinEngine.cancelJoinRequest(requestId, userUid as any)).toBe(true)
    const req = OrganizationJoinEngine.getJoinRequest(requestId)
    expect(req?.status).toBe('rejected')
    expect(req?.rejectionReason).toBe('cancelled_by_user')
  })

  it('getUserJoinRequests returns requests for user', async () => {
    await OrganizationJoinEngine.submitJoinRequest({
      uid: userUid as any, orgId: 'org-1', requestedRole: 'doctor'
    })
    const requests = OrganizationJoinEngine.getUserJoinRequests(userUid as any)
    expect(requests.length).toBe(1)
  })
})
