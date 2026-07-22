import type { AmxUid } from '../constitution/types'
import { delegateAuthority, revokeDelegation, getActiveDelegations } from '../constitution/policy-engine'
import type { DelegationEntry } from './types'

const _delegations = new Map<string, DelegationEntry>()

export function createDelegation(
  fromId: AmxUid,
  toId: AmxUid,
  scope: DelegationEntry['scope'],
  fromDate: number,
  toDate: number,
  reason: string,
  createdBy: AmxUid,
): DelegationEntry {
  const partial = delegateAuthority(fromId, toId, scope, fromDate, toDate, reason, createdBy)
  const entry: DelegationEntry = {
    ...partial,
    id: `del_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  }
  _delegations.set(entry.id, entry)
  return entry
}

export function revoke(delegationId: string): DelegationEntry | null {
  const entry = _delegations.get(delegationId)
  if (!entry) return null
  const revoked = revokeDelegation(entry as any)
  entry.status = 'revoked'
  entry.revokedAt = revoked.revokedAt
  return entry
}

export function getDelegationsForUser(userId: AmxUid): DelegationEntry[] {
  return Array.from(_delegations.values()).filter(
    d => (d.fromId === userId || d.toId === userId),
  )
}

export function getActiveForUser(userId: AmxUid): DelegationEntry[] {
  const now = Date.now()
  return Array.from(_delegations.values()).filter(
    d => (d.fromId === userId || d.toId === userId) &&
      d.status === 'active' &&
      d.fromDate <= now &&
      d.toDate >= now,
  )
}

export function getAllDelegations(orgId?: string): DelegationEntry[] {
  return Array.from(_delegations.values())
}
