import type { AmxUid, ResourceType, Action } from './types';

export interface Policy {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  subjects: PolicySubject[];
  resources: PolicyResource[];
  actions: Action[];
  conditions: PolicyCondition[];
  priority: number;
  version: number;
  enabled: boolean;
  validFrom?: number;
  validTo?: number;
  createdBy: AmxUid;
  createdAt: number;
  updatedAt: number;
}

export interface PolicySubject {
  type: 'role' | 'user' | 'department' | 'group' | 'position';
  values: string[];
}

export interface PolicyResource {
  type: ResourceType;
  patterns?: string[];
}

export interface PolicyCondition {
  attribute: string;
  operator: 'eq' | 'neq' | 'lt' | 'gt' | 'lte' | 'gte' | 'in' | 'not_in' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface PolicyEvaluationRequest {
  subject: { uid: AmxUid; roles: string[]; departmentId?: string; position?: string };
  resource: { type: ResourceType; id?: string; departmentId?: string };
  action: Action;
  context: Record<string, any>;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  matchedPolicy?: Policy;
  reason?: string;
  requiredConditions?: string[];
}

export function evaluatePolicy(policy: Policy, request: PolicyEvaluationRequest): boolean {
  if (!policy.enabled) return false;
  if (policy.validFrom && Date.now() < policy.validFrom) return false;
  if (policy.validTo && Date.now() > policy.validTo) return false;

  const subjectMatch = policy.subjects.some(s => {
    switch (s.type) {
      case 'role': return s.values.some(v => request.subject.roles.includes(v));
      case 'user': return s.values.includes(request.subject.uid);
      case 'department': return s.values.includes(request.subject.departmentId ?? '');
      case 'position': return s.values.includes(request.subject.position ?? '');
      default: return false;
    }
  });
  if (!subjectMatch) return false;

  const resourceMatch = policy.resources.some(r => r.type === request.resource.type);
  if (!resourceMatch) return false;

  if (!policy.actions.includes(request.action)) return false;

  return policy.conditions.every(c => evaluateCondition(c, request.context));
}

function evaluateCondition(condition: PolicyCondition, context: Record<string, any>): boolean {
  const value = context[condition.attribute];
  if (value === undefined) return false;

  switch (condition.operator) {
    case 'eq': return value === condition.value;
    case 'neq': return value !== condition.value;
    case 'lt': return value < condition.value;
    case 'gt': return value > condition.value;
    case 'lte': return value <= condition.value;
    case 'gte': return value >= condition.value;
    case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
    case 'not_in': return Array.isArray(condition.value) && !condition.value.includes(value);
    case 'contains': return String(value).includes(String(condition.value));
    case 'startsWith': return String(value).startsWith(String(condition.value));
    case 'endsWith': return String(value).endsWith(String(condition.value));
    default: return false;
  }
}

export function evaluatePolicies(policies: Policy[], request: PolicyEvaluationRequest): PolicyEvaluationResult {
  const sorted = [...policies].sort((a, b) => b.priority - a.priority);

  for (const policy of sorted) {
    if (evaluatePolicy(policy, request)) {
      if (policy.effect === 'deny') {
        return { allowed: false, matchedPolicy: policy, reason: `Denied by policy: ${policy.name}` };
      }
      return { allowed: true, matchedPolicy: policy };
    }
  }

  return { allowed: false, reason: 'No matching policy' };
}

export function createPolicy(
  orgId: string,
  name: string,
  effect: Policy['effect'],
  subjects: PolicySubject[],
  resources: PolicyResource[],
  actions: Action[],
  conditions: PolicyCondition[],
  createdBy: AmxUid,
): Omit<Policy, 'id'> {
  return {
    organizationId: orgId,
    name,
    description: '',
    effect,
    subjects,
    resources,
    actions,
    conditions,
    priority: 100,
    version: 1,
    enabled: true,
    createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export interface BreakGlassEvent {
  id: string;
  actor: AmxUid;
  actorName: string;
  resourceType: string;
  resourceId: string;
  action: string;
  reason: string;
  timestamp: number;
  expiresAt: number;
  status: 'active' | 'expired' | 'revoked';
  notifiedSupervisor: boolean;
  supervisorId?: AmxUid;
  approvedBy?: AmxUid;
}

export function breakGlassAccess(
  actor: AmxUid,
  actorName: string,
  resourceType: string,
  resourceId: string,
  action: string,
  reason: string,
): BreakGlassEvent {
  return {
    id: `bg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actor,
    actorName,
    resourceType,
    resourceId,
    action,
    reason,
    timestamp: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000,
    status: 'active',
    notifiedSupervisor: false,
  };
}

export function requireDualAuth(action: string, primaryId: AmxUid, secondaryId: AmxUid): DualAuthRequest {
  return {
    id: `da-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    primaryId,
    secondaryId,
    status: 'pending',
    requestedAt: Date.now(),
  };
}

export interface DualAuthRequest {
  id: string;
  action: string;
  primaryId: AmxUid;
  secondaryId: AmxUid;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
  requestedAt: number;
}

export function authorizeDual(req: DualAuthRequest, approverId: AmxUid, approved: boolean, reason?: string): DualAuthRequest {
  if (approverId !== req.secondaryId) return req;
  return {
    ...req,
    status: approved ? 'approved' : 'rejected',
    approvedAt: approved ? Date.now() : undefined,
    rejectedAt: approved ? undefined : Date.now(),
    rejectionReason: reason,
  };
}

export interface Delegation {
  id: string;
  fromId: AmxUid;
  toId: AmxUid;
  scope: 'all' | 'clinical' | 'administrative' | 'supervisory';
  fromDate: number;
  toDate: number;
  status: 'active' | 'expired' | 'revoked';
  reason: string;
  createdBy: AmxUid;
  createdAt: number;
  revokedAt?: number;
}

export function delegateAuthority(
  fromId: AmxUid,
  toId: AmxUid,
  scope: Delegation['scope'],
  fromDate: number,
  toDate: number,
  reason: string,
  createdBy: AmxUid,
): Omit<Delegation, 'id'> {
  return { fromId, toId, scope, fromDate, toDate, status: 'active', reason, createdBy, createdAt: Date.now() };
}

export function revokeDelegation(delegation: Delegation): Delegation {
  return { ...delegation, status: 'revoked', revokedAt: Date.now() };
}

export function getActiveDelegations(delegations: Delegation[], workerId: AmxUid): Delegation[] {
  const now = Date.now();
  return delegations.filter(d => (d.fromId === workerId || d.toId === workerId) && d.status === 'active' && d.fromDate <= now && d.toDate >= now);
}

export function getPatientRelationship(clinicianId: AmxUid, patientId: string): 'primary' | 'consulting' | 'ward' | 'emergency' | 'none' {
  return 'none';
}
