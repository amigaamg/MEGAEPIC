import type {
  AmxUid, ResourceType, Action, Permission, PermissionScope,
  Role as ConstitutionRole,
} from '../constitution/types'

export type AuthzRole = ConstitutionRole

export interface AuthzEngineRequest {
  subject: { uid: AmxUid; roles: string[]; departmentId?: string; position?: string; permissions: Permission[] }
  resource: { type: ResourceType; id?: string; departmentId?: string; patientId?: string }
  action: Action
  context: Record<string, unknown>
}

export interface AuthzResult {
  allowed: boolean
  reason?: string
  matchedRule?: string
  enforcementLevel: 'granted' | 'denied' | 'break_glass' | 'dual_auth_required'
  requiresDualAuth?: boolean
  requiresBreakGlass?: boolean
}

export interface PatientRelationship {
  clinicianId: AmxUid
  patientId: string
  relationship: 'primary' | 'consulting' | 'ward' | 'emergency' | 'none'
  since: number
  expiresAt?: number
}

export interface DelegationEntry {
  id: string
  fromId: AmxUid
  toId: AmxUid
  scope: 'all' | 'clinical' | 'administrative' | 'supervisory'
  fromDate: number
  toDate: number
  status: 'active' | 'expired' | 'revoked'
  reason: string
  createdBy: AmxUid
  createdAt: number
  revokedAt?: number
}

export interface AuditLogEntry {
  id: string
  timestamp: number
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
}

export interface BreakGlassRecord {
  id: string
  actor: AmxUid
  actorName: string
  resourceType: string
  resourceId: string
  action: string
  reason: string
  timestamp: number
  expiresAt: number
  status: 'active' | 'expired' | 'revoked'
  notifiedSupervisor: boolean
  supervisorId?: AmxUid
  approvedBy?: AmxUid
}

export interface DualAuthRequest {
  id: string
  action: string
  primaryId: AmxUid
  secondaryId: AmxUid
  resourceType: ResourceType
  resourceId: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: number
  approvedAt?: number
  rejectedAt?: number
  rejectionReason?: string
}
