import { describe, it, expect, beforeEach } from 'vitest'
import {
  logIdentityEvent,
  getIdentityHistory,
  getRecentEvents,
  getFailedLogins,
  clearEvents,
} from '@/lib/amexan/identity/audit'
import { generateAmxUid } from '@/lib/amexan/identity/amxuid'
import type { AmxUid } from '@/lib/amexan/identity/types'

describe('Audit Engine', () => {
  const uid = generateAmxUid('person') as AmxUid

  beforeEach(() => {
    clearEvents(0)
  })

  describe('logIdentityEvent', () => {
    it('logs an event with correct fields', () => {
      const event = logIdentityEvent(uid, 'login', { device: 'web' })
      expect(event.id).toMatch(/^evt_/)
      expect(event.uid).toBe(uid)
      expect(event.eventType).toBe('login')
      expect(event.details).toEqual({ device: 'web' })
      expect(event.timestamp).toBeGreaterThan(0)
    })

    it('uses default empty object for details', () => {
      const event = logIdentityEvent(uid, 'logout')
      expect(event.details).toEqual({})
    })
  })

  describe('getIdentityHistory', () => {
    it('returns events for a specific identity in reverse order', () => {
      logIdentityEvent(uid, 'login', { device: '1' })
      logIdentityEvent(uid, 'logout', {})
      logIdentityEvent(uid, 'login', { device: '2' })

      const history = getIdentityHistory(uid)
      expect(history.length).toBe(3)
      expect(history[0].eventType).toBe('login')
      expect(history[0].details.device).toBe('2')
    })

    it('respects the limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        logIdentityEvent(uid, 'profile_edit', { index: i })
      }
      const history = getIdentityHistory(uid, 3)
      expect(history.length).toBe(3)
    })

    it('returns empty for identity with no events', () => {
      const otherUid = generateAmxUid('person') as AmxUid
      expect(getIdentityHistory(otherUid)).toEqual([])
    })
  })

  describe('getRecentEvents', () => {
    it('returns events from the last N hours', () => {
      logIdentityEvent(uid, 'login', {})
      const recent = getRecentEvents(24)
      expect(recent.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getFailedLogins', () => {
    it('filters only failed_login events for a user', () => {
      logIdentityEvent(uid, 'failed_login', {})
      logIdentityEvent(uid, 'failed_login', {})
      logIdentityEvent(uid, 'login', {})

      const failures = getFailedLogins(uid)
      expect(failures.length).toBe(2)
    })

    it('respects the since parameter', () => {
      const now = Date.now()
      logIdentityEvent(uid, 'failed_login', {})
      const since = now + 1
      const failures = getFailedLogins(uid, since)
      expect(failures.length).toBe(0)
    })
  })

  describe('clearEvents', () => {
    it('clears all events for all identities', () => {
      logIdentityEvent(uid, 'login', {})
      const deleted = clearEvents(0)
      expect(deleted).toBeGreaterThan(0)
    })
  })
})
