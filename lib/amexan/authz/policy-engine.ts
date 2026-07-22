import type { AmxUid, Action } from '../constitution/types'
import {
  type Policy,
  type PolicySubject,
  type PolicyResource,
  type PolicyCondition,
  type PolicyEvaluationRequest,
  type PolicyEvaluationResult,
  evaluatePolicy,
  evaluatePolicies,
  createPolicy as constitutionCreatePolicy,
} from '../constitution/policy-engine'

export type { Policy, PolicySubject, PolicyResource, PolicyCondition, PolicyEvaluationRequest, PolicyEvaluationResult }

const _policies = new Map<string, Policy>()

export function addPolicy(policy: Policy) {
  _policies.set(policy.id, policy)
}

export function getPolicy(id: string): Policy | undefined {
  return _policies.get(id)
}

export function getAllPolicies(orgId?: string): Policy[] {
  const all = Array.from(_policies.values())
  if (orgId) return all.filter(p => p.organizationId === orgId)
  return all
}

export function updatePolicy(id: string, updates: Partial<Policy>): Policy | null {
  const existing = _policies.get(id)
  if (!existing) return null
  const updated = { ...existing, ...updates, updatedAt: Date.now(), version: existing.version + 1 }
  _policies.set(id, updated)
  return updated
}

export function deletePolicy(id: string) {
  _policies.delete(id)
}

export function evaluate(request: PolicyEvaluationRequest): PolicyEvaluationResult {
  return evaluatePolicies(Array.from(_policies.values()), request)
}

export function createPolicyRecord(
  orgId: string,
  name: string,
  effect: Policy['effect'],
  subjects: PolicySubject[],
  resources: PolicyResource[],
  actions: Action[],
  createdBy: AmxUid,
): Policy {
  const partial = constitutionCreatePolicy(orgId, name, effect, subjects, resources, actions, [], createdBy)
  const policy: Policy = {
    ...partial,
    id: `pol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  } as Policy
  _policies.set(policy.id, policy)
  return policy
}

export function togglePolicy(id: string) {
  const p = _policies.get(id)
  if (p) {
    p.enabled = !p.enabled
    p.updatedAt = Date.now()
  }
  return p ?? null
}
