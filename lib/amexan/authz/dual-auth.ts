import type { AmxUid, ResourceType, Action } from '../constitution/types'
import { requireDualAuth as constitutionDualAuth, authorizeDual as constitutionAuthorize } from '../constitution/policy-engine'
import type { DualAuthRequest } from './types'

const _requests = new Map<string, DualAuthRequest>()

export function createDualAuthRequest(
  action: Action,
  primaryId: AmxUid,
  secondaryId: AmxUid,
  resourceType: ResourceType,
  resourceId: string,
): DualAuthRequest {
  const base = constitutionDualAuth(action, primaryId, secondaryId)
  const req: DualAuthRequest = {
    id: base.id,
    action: base.action,
    primaryId: base.primaryId,
    secondaryId: base.secondaryId,
    resourceType,
    resourceId,
    status: 'pending',
    requestedAt: base.requestedAt,
  }
  _requests.set(req.id, req)
  return req
}

export function approveDualAuth(requestId: string, approverId: AmxUid): DualAuthRequest | null {
  const req = _requests.get(requestId)
  if (!req) return null
  if (approverId !== req.secondaryId) return null
  const updated = constitutionAuthorize(req as any, approverId, true)
  req.status = 'approved'
  req.approvedAt = updated.approvedAt
  return req
}

export function rejectDualAuth(requestId: string, approverId: AmxUid, reason?: string): DualAuthRequest | null {
  const req = _requests.get(requestId)
  if (!req) return null
  if (approverId !== req.secondaryId) return null
  req.status = 'rejected'
  req.rejectedAt = Date.now()
  req.rejectionReason = reason
  return req
}

export function getDualAuthRequests(status?: DualAuthRequest['status']): DualAuthRequest[] {
  const all = Array.from(_requests.values())
  if (status) return all.filter(r => r.status === status)
  return all
}

export function getPendingDualAuthForUser(userId: AmxUid): DualAuthRequest[] {
  return Array.from(_requests.values()).filter(
    r => r.secondaryId === userId && r.status === 'pending',
  )
}
