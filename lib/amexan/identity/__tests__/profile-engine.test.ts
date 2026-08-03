import { describe, it, expect, beforeEach } from 'vitest'
import { UniversalProfileEngine } from '@/lib/amexan/identity/profile-engine'
import { UniversalIdentityEngine } from '@/lib/amexan/identity/identity-engine'
import { IdentityType, VerificationLevel } from '@/lib/amexan/identity/types'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'
import { clearVerificationStore } from '@/lib/amexan/identity/verification'
import { clearEvents } from '@/lib/amexan/identity/audit'

describe('Profile Engine', () => {
  beforeEach(() => {
    UniversalProfileEngine.clearStore()
    UniversalIdentityEngine.clearStore()
    clearVerificationStore()
    clearEvents(0)
  })

  it('getProfile builds from identity after creation', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'John Doe', email: 'john@example.com', phone: '555-0100', photo: 'photo.jpg'
    })
    const profile = UniversalProfileEngine.getProfile(uid)
    expect(profile).toBeDefined()
    expect(profile!.fullName).toBe('John Doe')
    expect(profile!.email).toBe('john@example.com')
    expect(profile!.photoUrl).toBe('photo.jpg')
  })

  it('createProfile creates and stores a profile', () => {
    const uid = generateAmxUid('person') as AmxUid
    const profile = UniversalProfileEngine.createProfile(uid, {
      fullName: 'Jane Smith', givenName: 'Jane', familyName: 'Smith',
      email: 'jane@smith.com', phone: '555-0200'
    })
    expect(profile.fullName).toBe('Jane Smith')
    expect(profile.givenName).toBe('Jane')
    expect(profile.uid).toBe(uid)
  })

  it('updateProfile merges updates', () => {
    const uid = generateAmxUid('person') as AmxUid
    UniversalProfileEngine.createProfile(uid, {
      fullName: 'Original', givenName: 'Orig', familyName: 'Name',
      email: 'o@test.com', phone: '555-0000'
    })
    const updated = UniversalProfileEngine.updateProfile(uid, { fullName: 'Updated' })
    expect(updated?.fullName).toBe('Updated')
    expect(updated?.email).toBe('o@test.com')
  })

  it('deleteProfile removes the profile', () => {
    const uid = generateAmxUid('person') as AmxUid
    UniversalProfileEngine.createProfile(uid, {
      fullName: 'Test', givenName: 'T', familyName: 'User',
      email: 't@t.com', phone: '555-0000'
    })
    expect(UniversalProfileEngine.deleteProfile(uid)).toBe(true)
    expect(UniversalProfileEngine.deleteProfile(uid)).toBe(false)
  })

  it('returns undefined for updateProfile on non-existent identity', () => {
    const uid = generateAmxUid('person') as AmxUid
    expect(UniversalProfileEngine.updateProfile(uid, { fullName: 'X' })).toBeUndefined()
  })

  it('getPreferences returns defaults on first call', () => {
    const uid = generateAmxUid('person') as AmxUid
    const prefs = UniversalProfileEngine.getPreferences(uid)
    expect(prefs.theme).toBe('system')
    expect(prefs.language).toBe('en')
    expect(prefs.density).toBe('standard')
    expect(prefs.notifications.clinical).toBe(true)
  })

  it('updatePreferences merges into existing', () => {
    const uid = generateAmxUid('person') as AmxUid
    UniversalProfileEngine.updatePreferences(uid, { theme: 'dark', language: 'es' })
    const prefs = UniversalProfileEngine.getPreferences(uid)
    expect(prefs.theme).toBe('dark')
    expect(prefs.language).toBe('es')
  })

  it('resetPreferences restores defaults', () => {
    const uid = generateAmxUid('person') as AmxUid
    UniversalProfileEngine.updatePreferences(uid, { theme: 'dark' })
    UniversalProfileEngine.resetPreferences(uid)
    const prefs = UniversalProfileEngine.getPreferences(uid)
    expect(prefs.theme).toBe('system')
  })

  it('getTrustProfile returns profile data for known identity', () => {
    const { uid } = UniversalIdentityEngine.createIdentity(IdentityType.Human, 'US', {
      name: 'Test', email: 't@t.com', phone: '555-0000'
    })
    const trust = UniversalProfileEngine.getTrustProfile(uid)
    expect(trust).toBeDefined()
    expect(trust!.uid).toBe(uid)
    expect(trust!.level).toBe(VerificationLevel.Anonymous)
    expect(trust!.score).toBe(0)
  })

  it('getTrustProfile returns a default profile for unknown identity', () => {
    const uid = generateAmxUid('person') as AmxUid
    const trust = UniversalProfileEngine.getTrustProfile(uid)
    expect(trust).toBeDefined()
    expect(trust!.uid).toBe(uid)
    expect(trust!.level).toBe(VerificationLevel.Anonymous)
    expect(trust!.score).toBe(0)
  })
})

