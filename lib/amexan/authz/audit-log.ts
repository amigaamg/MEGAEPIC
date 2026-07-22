import type { AmxUid, ResourceType, Action } from '../constitution/types'
import type { AuditLogEntry } from './types'

const _logs: AuditLogEntry[] = []

export function logAccess(params: {
  actor: AmxUid
  actorName: string
  actorRole: string
  organizationId: string
  departmentId?: string
  action: string
  resourceType: string
  resourceId: string
  result: 'allowed' | 'denied' | 'break_glass' | 'dual_auth'
  reason?: string
  ipAddress?: string
  sessionId?: string
  details?: string
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    ...params,
  }
  _logs.unshift(entry)
  return entry
}

export function getAuditLogs(options?: {
  actor?: AmxUid
  resourceType?: string
  result?: AuditLogEntry['result']
  limit?: number
  offset?: number
}): AuditLogEntry[] {
  let filtered = _logs
  if (options?.actor) filtered = filtered.filter(l => l.actor === options.actor)
  if (options?.resourceType) filtered = filtered.filter(l => l.resourceType === options.resourceType)
  if (options?.result) filtered = filtered.filter(l => l.result === options.result)
  const offset = options?.offset ?? 0
  const limit = options?.limit ?? 50
  return filtered.slice(offset, offset + limit)
}

export function getAuditSummary(): {
  total: number
  allowed: number
  denied: number
  breakGlass: number
  dualAuth: number
} {
  return {
    total: _logs.length,
    allowed: _logs.filter(l => l.result === 'allowed').length,
    denied: _logs.filter(l => l.result === 'denied').length,
    breakGlass: _logs.filter(l => l.result === 'break_glass').length,
    dualAuth: _logs.filter(l => l.result === 'dual_auth').length,
  }
}

export function clearLogs() {
  _logs.length = 0
}
