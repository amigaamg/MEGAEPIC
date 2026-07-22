import type { AmxUid, ResourceType, Action, Permission, PermissionScope } from '../constitution/types'
import { can as canCheck } from '../constitution/auth'
import { evaluatePolicies, type Policy } from '../constitution/policy-engine'
import type { AuthzEngineRequest, AuthzResult, PatientRelationship } from './types'

let _policyStore: Policy[] = []
let _relationships: PatientRelationship[] = []
let _breakGlassEvents: string[] = []

export function setPolicyStore(policies: Policy[]) {
  _policyStore = policies
}

export function setRelationships(rels: PatientRelationship[]) {
  _relationships = rels
}

export function isAuthorized(request: AuthzEngineRequest): AuthzResult {
  const { subject, resource, action, context } = request

  const relationship = getPatientRelationship(subject.uid, resource.patientId)
  context.patientRelationship = relationship

  const policyResult = evaluatePolicies(_policyStore, {
    subject: { uid: subject.uid, roles: subject.roles, departmentId: subject.departmentId, position: subject.position },
    resource: { type: resource.type, id: resource.id, departmentId: resource.departmentId },
    action,
    context,
  })

  if (!policyResult.allowed && policyResult.matchedPolicy?.effect === 'deny') {
    return {
      allowed: false,
      reason: policyResult.reason,
      enforcementLevel: 'denied',
    }
  }

  const hasPermission = canCheck(subject.permissions, resource.type, action, {
    organizationId: undefined,
    departmentId: resource.departmentId,
  })

  if (!hasPermission && !policyResult.allowed) {
    const needsBreakGlass = shouldAllowBreakGlass(subject.uid, resource, action)
    if (needsBreakGlass) {
      return {
        allowed: true,
        reason: 'Access granted via break-glass protocol',
        enforcementLevel: 'break_glass',
        requiresBreakGlass: true,
      }
    }

    if (requiresDualAuth(action)) {
      return {
        allowed: false,
        reason: 'Dual authorization required',
        enforcementLevel: 'dual_auth_required',
        requiresDualAuth: true,
      }
    }

    return {
      allowed: false,
      reason: 'Insufficient permissions',
      enforcementLevel: 'denied',
    }
  }

  return {
    allowed: true,
    enforcementLevel: 'granted',
    matchedRule: policyResult.matchedPolicy?.name,
  }
}

function getPatientRelationship(clinicianId: AmxUid, patientId?: string): string {
  if (!patientId) return 'none'
  const rel = _relationships.find(r => r.clinicianId === clinicianId && r.patientId === patientId && (!r.expiresAt || r.expiresAt > Date.now()))
  return rel?.relationship ?? 'none'
}

function shouldAllowBreakGlass(uid: AmxUid, resource: AuthzEngineRequest['resource'], action: Action): boolean {
  if (action === 'read' || action === 'update') {
    return !_breakGlassEvents.includes(`${uid}_${resource.type}_${resource.id}`)
  }
  return false
}

export function markBreakGlassUsed(uid: AmxUid, resourceType: string, resourceId: string) {
  _breakGlassEvents.push(`${uid}_${resourceType}_${resourceId}`)
}

export const DUAL_AUTH_ACTIONS = new Set<Action>([
  'delete', 'approve', 'discharge', 'prescribe', 'administer',
])

function requiresDualAuth(action: Action): boolean {
  return DUAL_AUTH_ACTIONS.has(action)
}

export function setDualAuthActions(actions: Action[]) {
  actions.forEach(a => DUAL_AUTH_ACTIONS.add(a))
}
