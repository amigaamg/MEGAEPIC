import { describe, it, expect, beforeEach } from 'vitest'
import {
  getVerificationLevel,
  upgradeVerificationLevel,
  getVerificationProofs,
  requiresVerification,
  formatVerificationLevel,
  clearVerificationStore,
} from '@/lib/amexan/identity/verification'
import { VerificationLevel } from '@/lib/amexan/identity/types'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'

describe('Verification Engine', () => {
  const uid = generateAmxUid('person') as AmxUid

  beforeEach(() => {
    clearVerificationStore()
  })

  describe('getVerificationLevel', () => {
    it('returns Anonymous for unverified identity', () => {
      expect(getVerificationLevel(uid)).toBe(VerificationLevel.Anonymous)
    })
  })

  describe('upgradeVerificationLevel', () => {
    it('upgrades to EmailVerified with email and code proof', async () => {
      const result = await upgradeVerificationLevel(uid, VerificationLevel.EmailVerified, {
        email: 'test@example.com', code: '123456'
      })
      expect(result).toBe(true)
      expect(getVerificationLevel(uid)).toBe(VerificationLevel.EmailVerified)
    })

    it('rejects upgrade with missing email proof', async () => {
      const result = await upgradeVerificationLevel(uid, VerificationLevel.EmailVerified, {})
      expect(result).toBe(false)
    })

    it('upgrades to GovernmentIdVerified with required fields', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.EmailVerified, {
        email: 'test@example.com', code: '123456'
      })
      const result = await upgradeVerificationLevel(uid, VerificationLevel.GovernmentIdVerified, {
        idType: 'passport', idNumber: 'P1234567', issuingCountry: 'US'
      })
      expect(result).toBe(true)
      expect(getVerificationLevel(uid)).toBe(VerificationLevel.GovernmentIdVerified)
    })

    it('rejects GovernmentIdVerified upgrade without required fields', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.EmailVerified, {
        email: 't@e.com', code: '123456'
      })
      const result = await upgradeVerificationLevel(uid, VerificationLevel.GovernmentIdVerified, {
        idType: 'passport'
      })
      expect(result).toBe(false)
    })

    it('upgrades to ProfessionalLicenseVerified', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.GovernmentIdVerified, {
        idType: 'passport', idNumber: 'P123', issuingCountry: 'US'
      })
      const result = await upgradeVerificationLevel(uid, VerificationLevel.ProfessionalLicenseVerified, {
        licenseNumber: 'LIC-123', issuingBody: 'AMA', expiryDate: '2027-01-01'
      })
      expect(result).toBe(true)
      expect(getVerificationLevel(uid)).toBe(VerificationLevel.ProfessionalLicenseVerified)
    })

    it('upgrades to InstitutionalVerified', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.ProfessionalLicenseVerified, {
        licenseNumber: 'LIC', issuingBody: 'AMA', expiryDate: '2027-01-01'
      })
      const result = await upgradeVerificationLevel(uid, VerificationLevel.InstitutionalVerified, {
        orgId: 'org-1', verifiedBy: 'admin-uid'
      })
      expect(result).toBe(true)
    })

    it('upgrades to SystemTrust', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.InstitutionalVerified, {
        orgId: 'org-1', verifiedBy: 'admin-uid'
      })
      const result = await upgradeVerificationLevel(uid, VerificationLevel.SystemTrust, {
        systemKey: 'key-1', authorizedBy: 'root'
      })
      expect(result).toBe(true)
    })

    it('rejects downgrade (level already met)', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.EmailVerified, {
        email: 't@e.com', code: '123456'
      })
      const result = await upgradeVerificationLevel(uid, VerificationLevel.Anonymous, {})
      expect(result).toBe(false)
    })
  })

  describe('getVerificationProofs', () => {
    it('returns empty array for unverified identity', () => {
      expect(getVerificationProofs(uid)).toEqual([])
    })

    it('accumulates proof records on upgrades', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.EmailVerified, {
        email: 't@e.com', code: '123456'
      })
      await upgradeVerificationLevel(uid, VerificationLevel.GovernmentIdVerified, {
        idType: 'passport', idNumber: 'P123', issuingCountry: 'US'
      })
      const proofs = getVerificationProofs(uid)
      expect(proofs.length).toBe(2)
    })
  })

  describe('requiresVerification', () => {
    it('returns true when level meets minimum', async () => {
      await upgradeVerificationLevel(uid, VerificationLevel.EmailVerified, {
        email: 't@e.com', code: '123456'
      })
      expect(requiresVerification(uid, VerificationLevel.EmailVerified)).toBe(true)
    })

    it('returns false when below minimum', () => {
      expect(requiresVerification(uid, VerificationLevel.EmailVerified)).toBe(false)
    })

    it('Anonymous always meets minimum 0', () => {
      expect(requiresVerification(uid, VerificationLevel.Anonymous)).toBe(true)
    })
  })

  describe('formatVerificationLevel', () => {
    it('returns human-readable labels', () => {
      expect(formatVerificationLevel(VerificationLevel.Anonymous)).toBe('Anonymous')
      expect(formatVerificationLevel(VerificationLevel.EmailVerified)).toBe('Email Verified')
      expect(formatVerificationLevel(VerificationLevel.GovernmentIdVerified)).toBe('Government ID Verified')
      expect(formatVerificationLevel(VerificationLevel.ProfessionalLicenseVerified)).toBe('Professional License Verified')
      expect(formatVerificationLevel(VerificationLevel.InstitutionalVerified)).toBe('Institution Verified')
      expect(formatVerificationLevel(VerificationLevel.SystemTrust)).toBe('System Trust')
    })
  })
})

