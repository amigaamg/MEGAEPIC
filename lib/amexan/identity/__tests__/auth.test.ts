import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerCredentials,
  authenticate,
  authenticateWithBiometric,
  authenticateWithPasskey,
  authenticateWithSSO,
  verifyMFA,
  clearUserStore,
} from '@/lib/amexan/identity/auth'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'

describe('Authentication Engine', () => {
  const uid = generateAmxUid('person') as AmxUid

  beforeEach(() => {
    clearUserStore()
  })

  describe('registerCredentials', () => {
    it('registers credentials for an identity', async () => {
      await registerCredentials(uid, 'securePassword123')
      const authResult = await authenticate(uid, 'securePassword123')
      expect(authResult.success).toBe(true)
      expect(authResult.uid).toBe(uid)
    })

    it('produces different hashes for different passwords', async () => {
      await registerCredentials(uid, 'password1')
      const result = await authenticate(uid, 'password2')
      expect(result.success).toBe(false)
    })
  })

  describe('authenticate', () => {
    it('returns failure for unknown user', async () => {
      const result = await authenticate('unknown-uid', 'password')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('returns failure for wrong password', async () => {
      await registerCredentials(uid, 'correctPassword')
      const result = await authenticate(uid, 'wrongPassword')
      expect(result.success).toBe(false)
    })
  })

  describe('authenticateWithBiometric', () => {
    it('authenticates with valid biometric token', async () => {
      const result = await authenticateWithBiometric(uid, 'valid-bio-token-data')
      expect(result.success).toBe(true)
      expect(result.sessionToken).toBeDefined()
      expect(result.uid).toBe(uid)
    })

    it('fails with short biometric token', async () => {
      const result = await authenticateWithBiometric(uid, 'short')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid biometric')
    })
  })

  describe('authenticateWithPasskey', () => {
    it('authenticates with valid passkey assertion', async () => {
      const result = await authenticateWithPasskey(uid, { response: 'data' })
      expect(result.success).toBe(true)
      expect(result.sessionToken).toBeDefined()
    })

    it('fails with null passkey assertion', async () => {
      const result = await authenticateWithPasskey(uid, null)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid passkey')
    })
  })

  describe('authenticateWithSSO', () => {
    it('authenticates with valid SSO token', async () => {
      const result = await authenticateWithSSO('google', 'valid-id-token')
      expect(result.success).toBe(true)
      expect(result.sessionToken).toBeDefined()
    })

    it('fails with empty SSO token', async () => {
      const result = await authenticateWithSSO('google', '')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid SSO token')
    })
  })

  describe('verifyMFA', () => {
    it('authenticates with valid 6-digit code', async () => {
      const result = await verifyMFA(uid, '123456')
      expect(result.success).toBe(true)
      expect(result.sessionToken).toBeDefined()
      expect(result.uid).toBe(uid)
    })

    it('fails with wrong code length', async () => {
      const result = await verifyMFA(uid, '12345')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid code')
    })
  })

  describe('Session token format', () => {
    it('generates session tokens prefixed with sess_', async () => {
      const result = await authenticateWithBiometric(uid, 'valid-token-data')
      expect(result.sessionToken?.startsWith('sess_')).toBe(true)
    })
  })
})

