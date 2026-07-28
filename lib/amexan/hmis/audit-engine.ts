// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XX: Audit & Compliance Engine
// Every click, every edit, every prescription, every result — hash-chained, immutable.
// ═══════════════════════════════════════════════════════════════════════════════

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  timestamp: number;
  actorId: string;
  actorName: string;
  actorRole: string;
  patientId?: string;
  encounterId?: string;
  resourceType: string;
  resourceId: string;
  action: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  deviceId?: string;
  location?: string;
  sessionId?: string;
  metadata: Record<string, unknown>;
  integrityHash: string;
  previousHash: string;
  status: 'pending' | 'verified' | 'tampered' | 'archived';
}

export enum AuditEventType {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Access = 'access',
  Login = 'login',
  Logout = 'logout',
  PermissionChange = 'permission_change',
  RoleChange = 'role_change',
  PrescriptionWrite = 'prescription_write',
  PrescriptionDispense = 'prescription_dispense',
  ResultView = 'result_view',
  ResultVerify = 'result_verify',
  DiagnosisEnter = 'diagnosis_enter',
  DiagnosisChange = 'diagnosis_change',
  OrderPlace = 'order_place',
  OrderCancel = 'order_cancel',
  PaymentProcess = 'payment_process',
  RefundProcess = 'refund_process',
  InsuranceClaim = 'insurance_claim',
  DischargeProcess = 'discharge_process',
  TransferProcess = 'transfer_process',
  AdmissionProcess = 'admission_process',
  BreakGlassAccess = 'break_glass_access',
  EmergencyOverride = 'emergency_override',
  DualAuthApprove = 'dual_auth_approve',
  DelegateAccess = 'delegate_access',
  ConsentGiven = 'consent_given',
  ConsentRevoked = 'consent_revoked',
  DataExport = 'data_export',
  DataImport = 'data_import',
  SystemConfigChange = 'system_config_change',
  IntegrationCall = 'integration_call',
  Error = 'error',
  SecurityIncident = 'security_incident',
}

export enum AuditCategory {
  Clinical = 'clinical',
  Administrative = 'administrative',
  Billing = 'billing',
  Security = 'security',
  Compliance = 'compliance',
  System = 'system',
  Integration = 'integration',
  Research = 'research',
}

export enum AuditSeverity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
  Security = 'security',
}

export function createAuditEvent(params: {
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  actorId: string;
  actorName: string;
  actorRole: string;
  resourceType: string;
  resourceId: string;
  action: string;
  description: string;
  patientId?: string;
  encounterId?: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}, previousHash: string = ''): AuditEvent {
  const now = Date.now();
  const event: AuditEvent = {
    id: `AUD-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: now,
    previousHash,
    integrityHash: '',
    status: 'pending',
    ...params,
    metadata: params.metadata || {},
  };
  event.integrityHash = computeIntegrityHash(event);
  event.status = 'verified';
  return event;
}

export function computeIntegrityHash(event: AuditEvent): string {
  const content = `${event.id}|${event.timestamp}|${event.actorId}|${event.action}|${event.resourceId}|${event.previousValue}|${event.newValue}|${event.previousHash}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function verifyAuditChain(events: AuditEvent[]): { valid: boolean; breakPoint?: number } {
  for (let i = 0; i < events.length; i++) {
    const computed = computeIntegrityHash(events[i]);
    if (computed !== events[i].integrityHash) {
      return { valid: false, breakPoint: i };
    }
    if (i > 0 && events[i].previousHash !== events[i - 1].integrityHash) {
      return { valid: false, breakPoint: i };
    }
  }
  return { valid: true };
}

export function getAuditByPatient(events: AuditEvent[], patientId: string): AuditEvent[] {
  return events.filter(e => e.patientId === patientId);
}

export function getAuditByActor(events: AuditEvent[], actorId: string): AuditEvent[] {
  return events.filter(e => e.actorId === actorId);
}

export function getAuditByResource(events: AuditEvent[], resourceType: string, resourceId: string): AuditEvent[] {
  return events.filter(e => e.resourceType === resourceType && e.resourceId === resourceId);
}

export function getAuditByDateRange(events: AuditEvent[], from: number, to: number): AuditEvent[] {
  return events.filter(e => e.timestamp >= from && e.timestamp <= to);
}

export function getAuditSummary(events: AuditEvent[]): {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byEventType: Record<string, number>;
  securityIncidents: number;
  clinicalEvents: number;
  criticalEvents: number;
} {
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byEventType: Record<string, number> = {};
  for (const e of events) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
    byEventType[e.eventType] = (byEventType[e.eventType] || 0) + 1;
  }
  return {
    total: events.length,
    byCategory, bySeverity, byEventType,
    securityIncidents: events.filter(e => e.category === AuditCategory.Security).length,
    clinicalEvents: events.filter(e => e.category === AuditCategory.Clinical).length,
    criticalEvents: events.filter(e => e.severity === AuditSeverity.Critical || e.severity === AuditSeverity.Security).length,
  };
}

export function detectAnomalies(events: AuditEvent[]): AuditEvent[] {
  const anomalies: AuditEvent[] = [];
  const breakGlassEvents = events.filter(e => e.eventType === AuditEventType.BreakGlassAccess);
  if (breakGlassEvents.length > 3) anomalies.push(...breakGlassEvents);

  const afterHoursAccess = events.filter(e => {
    const hour = new Date(e.timestamp).getHours();
    return hour < 6 || hour > 22;
  });
  if (afterHoursAccess.length > 20) anomalies.push(...afterHoursAccess);

  const deleteEvents = events.filter(e => e.eventType === AuditEventType.Delete);
  if (deleteEvents.length > 5) anomalies.push(...deleteEvents);

  return anomalies;
}
