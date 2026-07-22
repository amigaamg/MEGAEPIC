import type { AmxUid, ResourceType, Action } from '../constitution/types'
import { breakGlassAccess as constitutionBreakGlass } from '../constitution/policy-engine'
import type { BreakGlassRecord } from './types'

const _events = new Map<string, BreakGlassRecord>()

export function initiateBreakGlass(
  actor: AmxUid,
  actorName: string,
  resourceType: ResourceType,
  resourceId: string,
  action: Action,
  reason: string,
): BreakGlassRecord {
  const event = constitutionBreakGlass(actor, actorName, resourceType, resourceId, action, reason)
  const record: BreakGlassRecord = {
    id: event.id,
    actor: event.actor,
    actorName: event.actorName,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    action: event.action,
    reason: event.reason,
    timestamp: event.timestamp,
    expiresAt: event.expiresAt,
    status: 'active',
    notifiedSupervisor: false,
  }
  _events.set(record.id, record)
  return record
}

export function approveBreakGlass(eventId: string, approverId: AmxUid) {
  const event = _events.get(eventId)
  if (!event) return null
  event.approvedBy = approverId
  return event
}

export function revokeBreakGlass(eventId: string) {
  const event = _events.get(eventId)
  if (!event) return null
  event.status = 'revoked'
  return event
}

export function getBreakGlassEvents(actorId?: AmxUid): BreakGlassRecord[] {
  const events = Array.from(_events.values())
  if (actorId) return events.filter(e => e.actor === actorId)
  return events
}

export function getActiveBreakGlassEvents(): BreakGlassRecord[] {
  return Array.from(_events.values()).filter(e => e.status === 'active')
}

export function isBreakGlassActive(actor: AmxUid, resourceId: string): boolean {
  return Array.from(_events.values()).some(
    e => e.actor === actor && e.resourceId === resourceId && e.status === 'active' && e.expiresAt > Date.now(),
  )
}
