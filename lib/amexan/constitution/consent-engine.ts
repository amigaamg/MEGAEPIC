// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Universal Consent & Delegation Engine (Engine VII)
// Consent grants, scopes, restrictions, conditions, and audit trail.
// ═══════════════════════════════════════════════════════════════════════════════

export type ConsentType =
  | 'clinician_access'
  | 'caregiver_delegation'
  | 'research_consent'
  | 'guardian_authorization'
  | 'emergency_access'
  | 'public_health_consent'
  | 'data_sharing'
  | 'telemedicine_consent'
  | 'third_party_access';

export type ConsentStatus = 'active' | 'pending' | 'revoked' | 'expired';

export type ConsentDataType =
  | 'identity'
  | 'encounters'
  | 'clinical_notes'
  | 'lab_results'
  | 'imaging_results'
  | 'vitals'
  | 'appointments'
  | 'billing'
  | 'medications'
  | 'immunizations'
  | 'prescriptions';

export interface ConsentTimeRange {
  start: number;
  end: number | null;
}

export type ConsentRestrictionType = 'deny_resource' | 'deidentify' | 'purpose_limit' | 'no_secondary_use' | 'regional_limit';

export interface ConsentRestriction {
  type: ConsentRestrictionType;
  value: string;
}

export interface ConsentScope {
  resources: string[];
  departments: string[];
  organizations: string[];
  timeRange: ConsentTimeRange;
  dataTypes: string[];
  restrictions: ConsentRestriction[];
}

export type ConsentConditionType = 'time_limit' | 'purpose_limit' | 'one_time' | 'requires_verification' | 'requires_notification';

export interface ConsentCondition {
  type: ConsentConditionType;
  value: string;
}

export type ConsentEventType = 'created' | 'updated' | 'revoked' | 'expired' | 'accessed' | 'denied';

export interface ConsentEvent {
  id: string;
  type: ConsentEventType;
  actorAmxUid: string;
  action: string;
  timestamp: number;
  details?: string;
}

export interface ConsentGrant {
  id: string;
  grantorAmxUid: string;
  granteeAmxUid: string;
  granteeName: string;
  granteeRelationship: string;
  type: ConsentType;
  scope: ConsentScope;
  status: ConsentStatus;
  createdAt: number;
  updatedAt: number;
  expiresAt: number | null;
  revokedAt: number | null;
  reason: string;
  conditions: ConsentCondition[];
  auditTrail: ConsentEvent[];
}

export function isConsentActive(grant: ConsentGrant, at?: number): boolean {
  const now = at ?? Date.now();
  if (grant.status !== 'active') return false;
  if (grant.revokedAt && grant.revokedAt <= now) return false;
  if (grant.expiresAt && grant.expiresAt <= now) return false;
  return true;
}

export function revokeConsent(grant: ConsentGrant, reason?: string): ConsentGrant {
  return {
    ...grant,
    status: 'revoked',
    revokedAt: Date.now(),
    reason: reason || grant.reason,
    updatedAt: Date.now(),
    auditTrail: [...grant.auditTrail, {
      id: `EVT-${Date.now().toString(36)}`,
      type: 'revoked',
      action: 'Consent revoked',
      timestamp: Date.now(),
      details: reason,
      actorAmxUid: grant.granteeAmxUid,
    }],
  };
}

export function canAccess(grant: ConsentGrant, resourceId: string, at?: number): boolean {
  if (!isConsentActive(grant, at)) return false;
  return grant.scope.resources.includes(resourceId);
}