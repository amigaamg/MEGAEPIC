import { describe, it, expect, beforeEach } from 'vitest'
import { UniversalIdentityEngine } from '@/lib/amexan/identity/identity-engine'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'
import { IdentityType, VerificationLevel } from '@/lib/amexan/identity/types'
import { clearSessionStore } from '@/lib/amexan/identity/session'
import { clearVerificationStore } from '@/lib/amexan/identity/verification'
import { clearEvents } from '@/lib/amexan/identity/audit'
import { clearSignatures } from '@/lib/amexan/identity/digital-signature'

describe('UniversalIdentityEngine: Identity Lifecycle', () => {
  beforeEach(() => {
    UniversalIdentityEngine.clearStore()
    clearSessionStore()
    clearVerificationStore()
    clearEvents(0)
    clearSignatures()
  })

  it('creates a human identity with pending status', () => {
    const { identity, profile, uid } = UniversalIdentityEngine.createIdentity(
      IdentityType.Human, 'US', { name: 'Dr. Smith', email: 'dr@smith.com', phone: '555-0100' }
    )
    expect(identity.type).toBe(IdentityType.Human)
    expect(identity.country).toBe('US')
    expect(identity.createdAt).toBeGreaterThan(0)

    const rec = UniversalIdentityEngine.getIdentity(uid)
    expect(rec?.status).toBe('pending')
    expect(rec?.trustScore).toBe(0)
    expect(rec?.credentials).toEqual([])
    expect(rec?.authProviders.size).toBe(0)

    expect(profile.name).toBe('Dr. Smith')
    expect(profile.email).toBe('dr@smith.com')
  })

  it('creates identities with different types', () => {
    for (const type of [IdentityType.Organization, IdentityType.Device, IdentityType.AI, IdentityType.System]) {
      const { identity } = UniversalIdentityEngine.createIdentity(type, 'US', {
        name: 'Test', email: 't@t.com', phone: '555-0000'
      })
      expect(identity.type).toBe(type)
    }
  })

  it('returns undefined for non-existent identity', () => {
    const fakeUid = generateAmxUid('person') as AmxUid
    expect(UniversalIdentityEngine.getIdentity(fakeUid)).toBeUndefined()
  })

  it('getIdentityByRawUid validates before lookup', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    expect(UniversalIdentityEngine.getIdentityByRawUid(uid)).toBeDefined()
    expect(UniversalIdentityEngine.getIdentityByRawUid('invalid-uid')).toBeUndefined()
  })

  it('setStatus transitions through lifecycle states', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    expect(UniversalIdentityEngine.setStatus(uid, 'active')).toBe(true)
    expect(UniversalIdentityEngine.getIdentity(uid)?.status).toBe('active')
    expect(UniversalIdentityEngine.setStatus(uid, 'verified')).toBe(true)
    expect(UniversalIdentityEngine.getIdentity(uid)?.status).toBe('verified')
    expect(UniversalIdentityEngine.getIdentity(uid)?.verifiedAt).toBeDefined()
  })

  it('setStatus returns false for non-existent identity', () => {
    const fakeUid = generateAmxUid('person') as AmxUid
    expect(UniversalIdentityEngine.setStatus(fakeUid, 'active')).toBe(false)
  })

  it('suspendIdentity sets suspended status and timestamp', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    UniversalIdentityEngine.setStatus(uid, 'active')
    expect(UniversalIdentityEngine.suspendIdentity(uid, 'policy violation')).toBe(true)
    expect(UniversalIdentityEngine.getIdentity(uid)?.status).toBe('suspended')
    expect(UniversalIdentityEngine.getIdentity(uid)?.suspendedAt).toBeDefined()
  })

  it('activateIdentity reactivates but blocks archived', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    expect(UniversalIdentityEngine.activateIdentity(uid)).toBe(true)
    UniversalIdentityEngine.archiveIdentity(uid)
    expect(UniversalIdentityEngine.activateIdentity(uid)).toBe(false)
  })
})

describe('UniversalIdentityEngine: Auth Provider Linking', () => {
  beforeEach(() => {
    UniversalIdentityEngine.clearStore()
  })

  it('links and retrieves auth providers', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    expect(UniversalIdentityEngine.linkAuthProvider(uid, 'google', 'user-g-123')).toBe(true)
    const providers = UniversalIdentityEngine.getAuthProviders(uid)
    expect(providers.length).toBe(1)
    expect(providers[0].provider).toBe('google')
    expect(providers[0].providerId).toBe('user-g-123')
    expect(providers[0].verified).toBe(true)
  })

  it('unlinkAuthProvider removes the provider', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    UniversalIdentityEngine.linkAuthProvider(uid, 'google', 'g-123')
    expect(UniversalIdentityEngine.unlinkAuthProvider(uid, 'google')).toBe(true)
    expect(UniversalIdentityEngine.getAuthProviders(uid).length).toBe(0)
  })

  it('getAuthProviders returns empty for non-existent identity', () => {
    const fakeUid = generateAmxUid('person') as AmxUid
    expect(UniversalIdentityEngine.getAuthProviders(fakeUid)).toEqual([])
  })
})

describe('UniversalIdentityEngine: Search & Credentials', () => {
  beforeEach(() => {
    UniversalIdentityEngine.clearStore()
  })

  it('searchIdentities finds by name, email, and uid', () => {
    const { uid, profile } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'John Doe', email: 'john@example.com', phone: '555-0100'
    })
    const results = UniversalIdentityEngine.searchIdentities('John')
    expect(results.length).toBe(1)
    expect(results[0].uid).toBe(uid)

    const emailResults = UniversalIdentityEngine.searchIdentities('example.com')
    expect(emailResults.length).toBe(1)

    const uidResults = UniversalIdentityEngine.searchIdentities(uid)
    expect(uidResults.length).toBe(1)
  })

  it('searchIdentities respects type filter', () => {
    UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Person', email: 'p@p.com', phone: '555-0000'
    })
    UniversalIdentityEngine.createIdentity(IdentityType.Organization, 'US', {
      name: 'OrgName', email: 'o@o.com', phone: '555-0000'
    })
    const orgResults = UniversalIdentityEngine.searchIdentities('', { type: IdentityType.Organization })
    expect(orgResults.length).toBe(1)
    expect(orgResults[0].type).toBe(IdentityType.Organization)
  })

  it('searchIdentities respects limit', () => {
    for (let i = 0; i < 10; i++) {
      UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
        name: `User${i}`, email: `u${i}@test.com`, phone: '555-0000'
      })
    }
    const results = UniversalIdentityEngine.searchIdentities('', { limit: 3 })
    expect(results.length).toBe(3)
  })

  it('searchIdentities excludes archived identities', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'ArchiveMe', email: 'a@a.com', phone: '555-0000'
    })
    UniversalIdentityEngine.archiveIdentity(uid)
    const results = UniversalIdentityEngine.searchIdentities('ArchiveMe')
    expect(results.length).toBe(0)
  })

  it('getCredentials returns empty for new identity', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    expect(UniversalIdentityEngine.getCredentials(uid)).toEqual([])
  })

  it('addCredential stores credential and logs event', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    UniversalIdentityEngine.addCredential(uid, {
      type: 'password', hash: 'abc123', salt: 'salt', updatedAt: Date.now()
    })
    const creds = UniversalIdentityEngine.getCredentials(uid)
    expect(creds.length).toBe(1)
    expect(creds[0].type).toBe('password')
  })
})

describe('UniversalIdentityEngine: Trust & Verification', () => {
  beforeEach(() => {
    UniversalIdentityEngine.clearStore()
    clearVerificationStore()
  })

  it('calculateTrust returns Anonymous for non-existent identity', () => {
    const fakeUid = generateAmxUid('person') as AmxUid
    const trust = UniversalIdentityEngine.calculateTrust(fakeUid)
    expect(trust.level).toBe(VerificationLevel.Anonymous)
    expect(trust.score).toBe(0)
    expect(trust.proofs).toBe(0)
  })

  it('calculateTrust returns low score for new identity', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    const trust = UniversalIdentityEngine.calculateTrust(uid)
    expect(trust.score).toBe(0)
    expect(trust.level).toBe(VerificationLevel.Anonymous)
  })

  it('calculateTrustScore delegates to calculateTrust', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    const score = UniversalIdentityEngine.calculateTrustScore(uid)
    expect(score).toBe(0)
  })
})

describe('UniversalIdentityEngine: Profile Operations', () => {
  beforeEach(() => {
    UniversalIdentityEngine.clearStore()
  })

  it('updateProfile modifies profile fields', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Original', email: 'orig@test.com', phone: '555-0000'
    })
    expect(UniversalIdentityEngine.updateProfile(uid, { name: 'Updated', phone: '555-9999' })).toBe(true)
    const rec = UniversalIdentityEngine.getIdentity(uid)
    expect(rec?.profile?.name).toBe('Updated')
    expect(rec?.profile?.phone).toBe('555-9999')
  })

  it('updateProfile returns false for non-existent identity', () => {
    const fakeUid = generateAmxUid('person') as AmxUid
    expect(UniversalIdentityEngine.updateProfile(fakeUid, { name: 'X' })).toBe(false)
  })
})

