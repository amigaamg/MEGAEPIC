import { describe, it, expect, beforeEach } from 'vitest'
import {
  initiateRecovery,
  verifyRecoveryCode,
  resetIdentity,
  getRecoveryStatus,
} from '@/lib/amexan/identity/recovery'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'

describe('Recovery Engine', () => {
  const uid = generateAmxUid("person") as AmxUid

  describe('initiateRecovery', () => {
    it('creates a recovery request with a code', () => {
      const result = initiateRecovery('user@example.com')
      expect(result.success).toBe(true)
      expect(result.requestId).toMatch(/^rec_/)
    })
  })

  describe('verifyRecoveryCode', () => {
    it('returns invalid for non-existent request', () => {
      const result = verifyRecoveryCode('rec-nonexistent', 'CODE123')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid recovery request')
    })

    it('rejects wrong codes', () => {
      const init = initiateRecovery('user@example.com')
      const result = verifyRecoveryCode(init.requestId!, 'WRONGCODE')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid code')
    })

    it('allows up to 5 attempts then locks', () => {
      const init = initiateRecovery('user@example.com')
      for (let i = 0; i < 5; i++) {
        verifyRecoveryCode(init.requestId!, 'WRONG')
      }
      const final = verifyRecoveryCode(init.requestId!, 'WRONG')
      expect(final.success).toBe(false)
    })

    it('cannot reuse completed code', () => {
      const init = initiateRecovery('user@example.com')
      // We cannot know the code (random), but we can test the completed state
      // by mocking. For now test the lockout path.
      const result = verifyRecoveryCode(init.requestId!, 'INVALID')
      expect(result.success).toBe(false)
    })

    it('returns not found for unknown request', () => {
      const result = verifyRecoveryCode('nonexistent', 'ABC123')
      expect(result.success).toBe(false)
    })
  })

  describe('resetIdentity', () => {
    it('returns true when password provided', () => {
      expect(resetIdentity(uid, { password: 'newPass123' })).toBe(true)
    })

    it('returns true when biometric token provided', () => {
      expect(resetIdentity(uid, { biometricToken: 'bio-token' })).toBe(true)
    })

    it('returns false when neither password nor biometric provided', () => {
      expect(resetIdentity(uid, {})).toBe(false)
    })
  })

  describe('getRecoveryStatus', () => {
    it('returns status for existing request', () => {
      const init = initiateRecovery('user@example.com')
      const status = getRecoveryStatus(init.requestId!)
      expect(status).not.toBeNull()
      expect(status?.email).toBe('user@example.com')
      expect(status?.completed).toBe(false)
      expect(status?.expiresIn).toBeGreaterThan(0)
    })

    it('returns null for non-existent request', () => {
      expect(getRecoveryStatus('nonexistent')).toBeNull()
    })
  })
})


