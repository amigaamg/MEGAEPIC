import { describe, it, expect, beforeEach } from 'vitest'
import {
  signAction,
  verifySignature,
  getSignatureChain,
  getSignaturesByUser,
  clearSignatures,
} from '@/lib/amexan/identity/digital-signature'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'

describe('Digital Signature Engine', () => {
  const uid = generateAmxUid('person') as AmxUid

  beforeEach(() => {
    clearSignatures()
  })

  describe('signAction', () => {
    it('creates a signature with correct fields', async () => {
      const sig = await signAction(uid, 'prescribe', 'rx-123', {
        orgId: 'org-1', licenseNumber: 'LIC-001', deptId: 'dept-1'
      })
      expect(sig.id).toMatch(/^sig_/)
      expect(sig.uid).toBe(uid)
      expect(sig.action).toBe('prescribe')
      expect(sig.resourceId).toBe('rx-123')
      expect(sig.orgId).toBe('org-1')
      expect(sig.licenseNumber).toBe('LIC-001')
      expect(sig.deptId).toBe('dept-1')
      expect(sig.hash).toMatch(/^[a-f0-9]{64}$/)
      expect(sig.previousSignatureId).toBeUndefined()
    })

    it('creates chained signatures for same resourceId', async () => {
      const sig1 = await signAction(uid, 'create', 'doc-1')
      const sig2 = await signAction(uid, 'update', 'doc-1')
      expect(sig2.previousSignatureId).toBe(sig1.id)
    })
  })

  describe('verifySignature', () => {
    it('returns invalid for non-existent signature', () => {
      const result = verifySignature('sig-nonexistent')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Signature not found')
    })

    it('returns invalid when no license attached', async () => {
      const sig = await signAction(uid, 'action', 'res-1')
      const result = verifySignature(sig.id)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No professional license attached')
    })

    it('returns valid when license is attached', async () => {
      const sig = await signAction(uid, 'prescribe', 'rx-1', { licenseNumber: 'LIC-001' })
      const result = verifySignature(sig.id)
      expect(result.valid).toBe(true)
      expect(result.signature?.id).toBe(sig.id)
    })
  })

  describe('getSignatureChain', () => {
    it('returns all signatures for a resource in order', async () => {
      const s1 = await signAction(uid, 'create', 'res-1')
      const s2 = await signAction(uid, 'update', 'res-1')
      const chain = getSignatureChain('res-1')
      expect(chain.length).toBe(2)
      expect(chain[0].id).toBe(s1.id)
      expect(chain[1].id).toBe(s2.id)
      expect(chain[1].previousSignatureId).toBe(s1.id)
    })

    it('returns empty array for resource with no signatures', () => {
      expect(getSignatureChain('no-such-resource')).toEqual([])
    })
  })

  describe('getSignaturesByUser', () => {
    it('returns signatures filtered by user', async () => {
      const otherUid = generateAmxUid('person') as AmxUid
      await signAction(uid, 'action', 'res-1', { licenseNumber: 'LIC' })
      await signAction(uid, 'action', 'res-2', { licenseNumber: 'LIC' })
      await signAction(otherUid, 'action', 'res-3', { licenseNumber: 'LIC2' })

      const userSigs = getSignaturesByUser(uid)
      expect(userSigs.length).toBe(2)
      const otherSigs = getSignaturesByUser(otherUid)
      expect(otherSigs.length).toBe(1)
    })
  })
})



