import { type AmxUid, type IdentityEvent } from './types'

const events: IdentityEvent[] = []

export function logIdentityEvent(uid: AmxUid, eventType: IdentityEvent['eventType'], details: Record<string, any> = {}): IdentityEvent {
  const event: IdentityEvent = {
    id: `evt_${crypto.randomUUID()}`,
    uid,
    eventType,
    details,
    timestamp: Date.now(),
  }
  events.push(event)
  return event
}

export function getIdentityHistory(uid: AmxUid, limit = 100): IdentityEvent[] {
  return events.filter(e => e.uid === uid).slice(-limit).reverse()
}

export function getRecentEvents(hours = 24): IdentityEvent[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000
  return events.filter(e => e.timestamp > cutoff).reverse()
}

export function getFailedLogins(uid: AmxUid, since?: number): IdentityEvent[] {
  return events.filter(e => e.uid === uid && e.eventType === 'failed_login' && (!since || e.timestamp > since))
}

export function clearEvents(olderThan: number): number {
  const cutoff = Date.now() - olderThan
  const before = events.length
  const keepIndex = events.findIndex(e => e.timestamp > cutoff)
  if (keepIndex === -1) {
    events.length = 0
  } else {
    events.splice(0, keepIndex)
  }
  return before - events.length
}
