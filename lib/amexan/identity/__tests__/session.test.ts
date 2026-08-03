import { describe, it, expect, beforeEach } from 'vitest'
import {
  createSession,
  validateSession,
  revokeSession,
  getActiveSessions,
  extendSession,
  getSessionContext,
  getSessionById,
  getSessionByToken,
  clearSessionStore,
} from '@/lib/amexan/identity/session'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'

describe('Session Management', () => {
  const uid = generateAmxUid('person') as AmxUid

  beforeEach(() => {
    clearSessionStore()
  })

  it('creates a valid session', () => {
    const session = createSession(uid, 'iPhone 15', 'org-1', 'dept-1', 'doctor')
    expect(session.id).toMatch(/^sess_/)
    expect(session.uid).toBe(uid)
    expect(session.device).toBe('iPhone 15')
    expect(session.orgId).toBe('org-1')
    expect(session.deptId).toBe('dept-1')
    expect(session.role).toBe('doctor')
    expect(session.revoked).toBe(false)
    expect(session.expiresAt).toBeGreaterThan(session.createdAt)
  })

  it('validateSession returns session for valid token', () => {
    const session = createSession(uid, 'web-browser')
    const result = validateSession(session.id)
    expect(result).not.toBeNull()
    expect(result?.uid).toBe(uid)
  })

  it('validateSession returns null for invalid token', () => {
    expect(validateSession('nonexistent')).toBeNull()
  })

  it('validateSession returns null for revoked session', () => {
    const session = createSession(uid, 'web-browser')
    expect(revokeSession(session.id)).toBe(true)
    expect(validateSession(session.id)).toBeNull()
  })

  it('revokeSession returns false for non-existent session', () => {
    expect(revokeSession('nonexistent')).toBe(false)
  })

  it('getActiveSessions returns non-revoked active sessions', () => {
    const s1 = createSession(uid, 'device1')
    const s2 = createSession(uid, 'device2')
    revokeSession(s2.id)

    const active = getActiveSessions(uid)
    expect(active.length).toBe(1)
    expect(active[0].id).toBe(s1.id)
  })

  it('getActiveSessions returns empty for user with no sessions', () => {
    const otherUid = generateAmxUid("person") as AmxUid
    expect(getActiveSessions(otherUid)).toEqual([])
  })

  it('extendSession extends expiry', () => {
    const session = createSession(uid, 'device')
    const originalExpiry = session.expiresAt
    expect(extendSession(session.id, 24)).toBe(true)
    expect(session.expiresAt).toBeGreaterThan(originalExpiry)
  })

  it('extendSession returns false for non-existent session', () => {
    expect(extendSession('nonexistent', 8)).toBe(false)
  })

  it('getSessionContext returns context for valid session', () => {
    const session = createSession(uid, 'device', 'org-1', 'dept-2', 'nurse')
    const ctx = getSessionContext(session.id)
    expect(ctx).toEqual({ orgId: 'org-1', deptId: 'dept-2', role: 'nurse' })
  })

  it('getSessionContext returns null for revoked session', () => {
    const session = createSession(uid, 'device')
    revokeSession(session.id)
    expect(getSessionContext(session.id)).toBeNull()
  })

  it('getSessionById returns session directly', () => {
    const session = createSession(uid, 'device')
    const found = getSessionById(session.id)
    expect(found?.id).toBe(session.id)
  })

  it('getSessionByToken returns session', () => {
    const session = createSession(uid, 'device')
    const found = getSessionByToken(session.id)
    expect(found?.id).toBe(session.id)
  })
})


