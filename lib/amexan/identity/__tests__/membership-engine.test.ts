import { describe, it, expect, beforeEach } from 'vitest'
import { UniversalMembershipEngine } from '@/lib/amexan/identity/membership-engine'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'

import type { MembershipRecord } from '@/lib/amexan/identity/identity-engine'
import type { AmxUid } from '@/lib/amexan/identity/types'

describe('Membership Engine', () => {
  const uid = generateAmxUid('person') as AmxUid

  beforeEach(() => {
    UniversalMembershipEngine.clearStore()
  })

  describe('addMembership', () => {
    it('stores a membership record', () => {
      const membership = UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', departmentId: 'dept-1',
        unitId: 'unit-1', roleId: 'doctor', startedAt: Date.now(), status: 'active'
      })
      expect(membership.identityId).toBe(uid)
      expect(membership.orgId).toBe('org-1')
      expect(membership.roleId).toBe('doctor')
    })
  })

  describe('getMemberships', () => {
    it('returns all memberships for an identity', () => {
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: Date.now(), status: 'active'
      })
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-2', roleId: 'admin', startedAt: Date.now(), status: 'active'
      })
      const memberships = UniversalMembershipEngine.getMemberships(uid as any)
      expect(memberships.length).toBe(2)
    })

    it('returns empty array for identity with no memberships', () => {
      expect(UniversalMembershipEngine.getMemberships(uid as any)).toEqual([])
    })
  })

  describe('getMembershipsByOrg', () => {
    it('filters memberships by organization', () => {
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: Date.now(), status: 'active'
      })
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-2', roleId: 'admin', startedAt: Date.now(), status: 'active'
      })
      const org1 = UniversalMembershipEngine.getMembershipsByOrg(uid as any, 'org-1')
      expect(org1.length).toBe(1)
      expect(org1[0].orgId).toBe('org-1')
    })

    it('excludes ended memberships', () => {
      const now = Date.now()
      const membership = UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: now, status: 'active'
      })
      // Set endedAt on the returned object
      membership.endedAt = now
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'nurse', startedAt: now, status: 'active'
      })
      const org1 = UniversalMembershipEngine.getMembershipsByOrg(uid as any, 'org-1')
      expect(org1.length).toBe(1)
    })
  })

  describe('getPrimaryMembership', () => {
    it('returns the first active membership', () => {
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: Date.now(), status: 'active'
      })
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-2', roleId: 'admin', startedAt: Date.now(), status: 'suspended'
      })
      const primary = UniversalMembershipEngine.getPrimaryMembership(uid as any, 'org-1')
      expect(primary?.roleId).toBe('doctor')
    })

    it('returns undefined when no active membership', () => {
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: Date.now(), status: 'suspended'
      })
      expect(UniversalMembershipEngine.getPrimaryMembership(uid as any, 'org-1')).toBeUndefined()
    })
  })

  describe('endMembership', () => {
    it('ends an active membership by composite key', () => {
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: Date.now(), status: 'active'
      })
      const membershipId = `${uid}:org-1`
      expect(UniversalMembershipEngine.endMembership(membershipId)).toBe(true)

      const memberships = UniversalMembershipEngine.getMembershipsByOrg(uid as any, 'org-1')
      expect(memberships.length).toBe(0)
    })

    it('returns false for non-existent membership', () => {
      expect(UniversalMembershipEngine.endMembership('nonexistent')).toBe(false)
    })
  })

  describe('suspendMembership', () => {
    it('suspends a membership', () => {
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: Date.now(), status: 'active'
      })
      const membershipId = `${uid}:org-1`
      expect(UniversalMembershipEngine.suspendMembership(membershipId)).toBe(true)
      const memberships = UniversalMembershipEngine.getMemberships(uid as any)
      expect(memberships[0].status).toBe('suspended')
    })
  })

  describe('clearStore', () => {
    it('clears all membership data', () => {
      UniversalMembershipEngine.addMembership({
        identityId: uid, orgId: 'org-1', roleId: 'doctor', startedAt: Date.now(), status: 'active'
      })
      UniversalMembershipEngine.clearStore()
      expect(UniversalMembershipEngine.getMemberships(uid as any)).toEqual([])
    })
  })
})




