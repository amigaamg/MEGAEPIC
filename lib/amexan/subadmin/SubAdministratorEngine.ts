// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN SUB-ADMINISTRATOR ENGINE (BOOK VI-B) — Engine No. 12
//
// "Distributed Governance Without Loss of Constitutional Control"
//
// The Facility Administrator cannot and should not run the entire hospital
// alone. The Sub-Administrator Engine exists to delegate authority safely while
// preserving constitutional governance, accountability, traceability, and
// uninterrupted operations.
//
// A Sub-Administrator is not merely another admin account. They are a bounded
// executive. Every action is governed by constitutional permissions, scope,
// and audit.
//
// Constitutional Principles:
//   P1  Delegated Authority. Authority is never transferred — only delegated.
//       The Facility Administrator remains constitutionally responsible for
//       everything. Every delegated privilege remains revocable, time-bound,
//       scope-bound, auditable, and inherited only where permitted.
//   P2  No Unlimited Administrators. There shall never exist two unrestricted
//       Facility Administrators unless explicitly constitutionally configured:
//         Facility Administrator → Sub Administrator → Operational Managers →
//         Department Leaders → Clinical Leaders → Staff
//   P3  Administrative Domains. Sub-admins manage domains, never everything.
//       Each domain becomes its own administrative ecosystem.
//
// Constitutional Limits (enforced, never commented away):
//   A Sub-Administrator cannot promote themselves to Facility Administrator,
//   grant permissions outside their delegated domain, view protected clinical
//   information unless authorized, modify constitutional engines, delete audit
//   logs, override consent without constitutional authority, disable security
//   controls, change subscription tiers, or modify global AMEXAN rules.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Administrative domains (Principle III) ─────────────────────────────────────

export type SubAdminDomain =
  | 'clinical_operations' | 'operations' | 'hr' | 'ict' | 'finance'
  | 'research' | 'education' | 'quality' | 'telemedicine' | 'branch';

export const SUB_ADMIN_DOMAINS: readonly SubAdminDomain[] = [
  'clinical_operations', 'operations', 'hr', 'ict', 'finance',
  'research', 'education', 'quality', 'telemedicine', 'branch',
];

export const SUB_ADMIN_ROLE_TITLES: Readonly<Record<SubAdminDomain, string>> = {
  clinical_operations: 'Clinical Operations Administrator',
  operations: 'Operations Administrator',
  hr: 'Human Resource Administrator',
  ict: 'ICT Administrator',
  finance: 'Finance Administrator',
  research: 'Research Administrator',
  education: 'Education Administrator',
  quality: 'Quality Administrator',
  telemedicine: 'Telemedicine Administrator',
  branch: 'Branch Administrator',
};

// ── Permission categories ──────────────────────────────────────────────────────

export type PermissionCategory =
  | 'read' | 'create' | 'update' | 'approve' | 'reject'
  | 'delete' | 'archive' | 'restore' | 'delegate' | 'audit';

export const PERMISSION_CATEGORIES: readonly PermissionCategory[] = [
  'read', 'create', 'update', 'approve', 'reject',
  'delete', 'archive', 'restore', 'delegate', 'audit',
];

// ── Permissions belong to a domain, never directly to a person ────────────────

export interface AdminPermission {
  code: string;
  domain: SubAdminDomain;
  category: PermissionCategory;
  resource: string;
  scope?: string;
}

function perm(domain: SubAdminDomain, category: PermissionCategory, resource: string, scope?: string): AdminPermission {
  return { code: `${domain}.${category}_${resource}`, domain, category, resource, scope };
}

// ── Domain permission catalogues (a sub-admin receives only required ones) ─────

export const SUB_ADMIN_PERMISSION_CATALOG: Readonly<Record<SubAdminDomain, readonly AdminPermission[]>> = {
  clinical_operations: [
    perm('clinical_operations', 'read', 'admissions'),
    perm('clinical_operations', 'read', 'discharges'),
    perm('clinical_operations', 'read', 'transfers'),
    perm('clinical_operations', 'read', 'bed_occupancy'),
    perm('clinical_operations', 'read', 'waiting_patients'),
    perm('clinical_operations', 'read', 'emergency_load'),
    perm('clinical_operations', 'read', 'critical_alerts'),
    perm('clinical_operations', 'read', 'staff_shortages'),
    perm('clinical_operations', 'read', 'department_kpis'),
    perm('clinical_operations', 'update', 'capacity'),
    perm('clinical_operations', 'create', 'transfer_request'),
    perm('clinical_operations', 'approve', 'transfer'),
    perm('clinical_operations', 'create', 'escalation'),
    perm('clinical_operations', 'audit', 'operations'),
  ],
  operations: [
    perm('operations', 'read', 'electricity'),
    perm('operations', 'read', 'water'),
    perm('operations', 'read', 'ambulances'),
    perm('operations', 'read', 'maintenance'),
    perm('operations', 'read', 'equipment_failures'),
    perm('operations', 'read', 'generator'),
    perm('operations', 'read', 'internet'),
    perm('operations', 'read', 'security_alerts'),
    perm('operations', 'update', 'maintenance'),
    perm('operations', 'create', 'fault_ticket'),
    perm('operations', 'update', 'fault_ticket'),
    perm('operations', 'create', 'biomedical_request'),
    perm('operations', 'audit', 'infrastructure'),
  ],
  hr: [
    perm('hr', 'create', 'employee'),
    perm('hr', 'update', 'employee'),
    perm('hr', 'archive', 'employee'),
    perm('hr', 'approve', 'leave'),
    perm('hr', 'approve', 'recruitment'),
    perm('hr', 'approve', 'termination'),
    perm('hr', 'approve', 'suspension'),
    perm('hr', 'create', 'onboarding'),
    perm('hr', 'approve', 'promotion'),
    perm('hr', 'update', 'rotation'),
    perm('hr', 'read', 'competencies'),
    perm('hr', 'update', 'competencies'),
    perm('hr', 'create', 'cpd'),
    perm('hr', 'update', 'cpd'),
    perm('hr', 'update', 'payroll_integration'),
    perm('hr', 'audit', 'workforce'),
  ],
  ict: [
    perm('ict', 'read', 'system_health'),
    perm('ict', 'read', 'storage'),
    perm('ict', 'read', 'cpu'),
    perm('ict', 'read', 'users_online'),
    perm('ict', 'read', 'devices'),
    perm('ict', 'read', 'api_status'),
    perm('ict', 'read', 'fhir_connections'),
    perm('ict', 'read', 'downtime'),
    perm('ict', 'read', 'cybersecurity'),
    perm('ict', 'read', 'logs'),
    perm('ict', 'update', 'device'),
    perm('ict', 'create', 'device'),
    perm('ict', 'archive', 'device'),
    perm('ict', 'create', 'integration'),
    perm('ict', 'update', 'integration'),
    perm('ict', 'create', 'backup'),
    perm('ict', 'update', 'disaster_recovery'),
    perm('ict', 'create', 'access_review'),
    perm('ict', 'audit', 'technology'),
  ],
  finance: [
    perm('finance', 'read', 'billing'),
    perm('finance', 'read', 'insurance'),
    perm('finance', 'read', 'revenue'),
    perm('finance', 'read', 'payroll'),
    perm('finance', 'read', 'claims'),
    perm('finance', 'read', 'invoices'),
    perm('finance', 'read', 'payments'),
    perm('finance', 'read', 'budgets'),
    perm('finance', 'read', 'financial_reports'),
    perm('finance', 'read', 'cost_centers'),
    perm('finance', 'read', 'assets'),
    perm('finance', 'create', 'invoice'),
    perm('finance', 'update', 'invoice'),
    perm('finance', 'approve', 'budget'),
    perm('finance', 'create', 'claim'),
    perm('finance', 'update', 'claim'),
    perm('finance', 'audit', 'finance'),
  ],
  research: [
    perm('research', 'create', 'project'),
    perm('research', 'update', 'project'),
    perm('research', 'read', 'ethics'),
    perm('research', 'approve', 'ethics'),
    perm('research', 'create', 'approval'),
    perm('research', 'read', 'datasets'),
    perm('research', 'update', 'datasets'),
    perm('research', 'create', 'publication'),
    perm('research', 'update', 'publication'),
    perm('research', 'read', 'researchers'),
    perm('research', 'read', 'funding'),
    perm('research', 'create', 'registry'),
    perm('research', 'update', 'registry'),
    perm('research', 'audit', 'research'),
  ],
  education: [
    perm('education', 'create', 'student'),
    perm('education', 'update', 'student'),
    perm('education', 'create', 'rotation'),
    perm('education', 'update', 'rotation'),
    perm('education', 'approve', 'rotation'),
    perm('education', 'create', 'exam'),
    perm('education', 'update', 'exam'),
    perm('education', 'read', 'competencies'),
    perm('education', 'update', 'competencies'),
    perm('education', 'create', 'course'),
    perm('education', 'update', 'course'),
    perm('education', 'update', 'teaching_schedule'),
    perm('education', 'read', 'logbooks'),
    perm('education', 'update', 'logbooks'),
    perm('education', 'audit', 'education'),
  ],
  quality: [
    perm('quality', 'create', 'audit'),
    perm('quality', 'update', 'audit'),
    perm('quality', 'read', 'quality_indicators'),
    perm('quality', 'update', 'quality_indicators'),
    perm('quality', 'read', 'mortality'),
    perm('quality', 'read', 'morbidity'),
    perm('quality', 'read', 'patient_satisfaction'),
    perm('quality', 'read', 'documentation_quality'),
    perm('quality', 'create', 'accreditation'),
    perm('quality', 'update', 'accreditation'),
    perm('quality', 'create', 'compliance'),
    perm('quality', 'update', 'compliance'),
    perm('quality', 'audit', 'quality'),
  ],
  telemedicine: [
    perm('telemedicine', 'create', 'virtual_clinic'),
    perm('telemedicine', 'update', 'virtual_clinic'),
    perm('telemedicine', 'create', 'teleconsultation'),
    perm('telemedicine', 'read', 'teleconsultation'),
    perm('telemedicine', 'create', 'remote_monitoring'),
    perm('telemedicine', 'update', 'remote_monitoring'),
    perm('telemedicine', 'read', 'virtual_specialists'),
    perm('telemedicine', 'update', 'virtual_specialists'),
    perm('telemedicine', 'update', 'video_systems'),
    perm('telemedicine', 'read', 'online_queue'),
    perm('telemedicine', 'create', 'digital_outreach'),
    perm('telemedicine', 'audit', 'telemedicine'),
  ],
  branch: [
    perm('branch', 'read', 'branch_operations'),
    perm('branch', 'update', 'branch_operations'),
    perm('branch', 'create', 'branch_report'),
    perm('branch', 'read', 'branch_finance'),
    perm('branch', 'read', 'branch_staff'),
    perm('branch', 'update', 'branch_staff'),
    perm('branch', 'read', 'branch_inventory'),
    perm('branch', 'create', 'branch_escalation'),
    perm('branch', 'audit', 'branch'),
  ],
};

// ── Organizational scope ───────────────────────────────────────────────────────

export type OrganizationalScope =
  | 'entire_hospital' | 'branch' | 'department' | 'ward' | 'clinic'
  | 'laboratory' | 'radiology' | 'theatre' | 'network' | 'county' | 'country';

export const ORGANIZATIONAL_SCOPES: readonly OrganizationalScope[] = [
  'entire_hospital', 'branch', 'department', 'ward', 'clinic',
  'laboratory', 'radiology', 'theatre', 'network', 'county', 'country',
];

// ── Sub-administrator record ───────────────────────────────────────────────────

export type SubAdminStatus = 'active' | 'suspended' | 'expired' | 'revoked';

export interface SubAdministrator {
  personId: AmxUid;
  name: string;
  roleTitle: string;
  domain: SubAdminDomain;
  permissions: AdminPermission[];
  organizationalScope: OrganizationalScope;
  branchId?: string;
  departmentId?: string;
  wardIds?: string[];
  grantedBy: AmxUid;
  grantedAt: number;
  expiresAt?: number;
  shiftStartHour?: number;
  shiftEndHour?: number;
  status: SubAdminStatus;
}

// ── Delegation grant (Principle I) ─────────────────────────────────────────────

export interface DelegationGrant {
  id: string;
  subAdminId: AmxUid;
  permissionCodes: string[];
  organizationalScope: OrganizationalScope;
  branchId?: string;
  departmentId?: string;
  delegatedBy: AmxUid;
  delegatedAt: number;
  expiresAt?: number;
  shiftStartHour?: number;
  shiftEndHour?: number;
  inheritable: boolean;
  revokedAt?: number;
  revokedBy?: AmxUid;
  revocationReason?: string;
  active: boolean;
}

// ── Acting administrator (time-scoped temporary delegation) ───────────────────

export interface ActingSession {
  id: string;
  subAdminId: AmxUid;
  actingFor: AmxUid;
  reason: string;
  startAt: number;
  endAt: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  grantedBy: AmxUid;
  grantedAt: number;
}

// ── Approval engine ────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ApprovalRequest {
  id: string;
  title: string;
  action: string;
  resource: string;
  requesterId: AmxUid;
  requesterDomain: SubAdminDomain;
  reason: string;
  chain: { approverId: AmxUid; level: string }[];
  status: ApprovalStatus;
  requestedAt: number;
  decidedAt?: number;
  decidedBy?: AmxUid;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

// ── Escalation engine ──────────────────────────────────────────────────────────

export type EscalationLevel =
  | 'ward' | 'department' | 'clinical_operations' | 'facility_administrator';

export const ESCALATION_CHAIN: readonly EscalationLevel[] = [
  'ward', 'department', 'clinical_operations', 'facility_administrator',
];

export type EscalationStatus = 'open' | 'escalated' | 'acknowledged' | 'resolved' | 'closed';

export interface EscalationRecord {
  id: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  origin: EscalationLevel;
  currentLevel: EscalationLevel;
  raisedBy: AmxUid;
  raisedAt: number;
  assignedTo?: AmxUid;
  status: EscalationStatus;
  history: { level: EscalationLevel; at: number; by: AmxUid }[];
}

// ── Notification engine ────────────────────────────────────────────────────────

export type AdminNotificationKind =
  | 'approval' | 'escalation' | 'emergency' | 'shortage'
  | 'infrastructure_failure' | 'audit_finding' | 'patient_safety_event';

export interface AdminNotification {
  id: string;
  recipientId: AmxUid;
  kind: AdminNotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  readAt?: number;
  link?: string;
}

// ── Administrative AI ──────────────────────────────────────────────────────────

export interface AdminAiAdvice {
  id: string;
  subAdminId: AmxUid;
  domain: SubAdminDomain;
  advice: string;
  rationale: string;
  confidence: number;
  generatedAt: number;
  status: 'pending' | 'acknowledged' | 'actioned' | 'dismissed';
}

// ── Communication engine (scoped) ──────────────────────────────────────────────

export interface ScopedCommunication {
  id: string;
  kind: 'announcement' | 'circular' | 'policy' | 'alert';
  title: string;
  body: string;
  audience: string[];
  audienceScope: OrganizationalScope;
  branchId?: string;
  departmentId?: string;
  severity: 'info' | 'warning' | 'critical';
  publishedBy: AmxUid;
  publishedAt: number;
  requiresAcknowledgement: boolean;
  acknowledgedBy: AmxUid[];
}

// ── Audit engine (no administrative action is anonymous) ──────────────────────

export interface SubAdminAuditEntry {
  id: string;
  at: number;
  actorId: AmxUid;
  actorName: string;
  roleTitle: string;
  domain: SubAdminDomain;
  organizationId: string;
  branchId?: string;
  departmentId?: string;
  device?: string;
  ipLocation?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  approvalChainId?: string;
  action: string;
}

// ── Interoperability oversight ─────────────────────────────────────────────────

export type OversightKind =
  | 'hmis' | 'lis' | 'pacs_ris' | 'pharmacy' | 'erp' | 'payroll'
  | 'national_hie' | 'fhir' | 'hl7';

export interface IntegrationOversight {
  id: string;
  kind: OversightKind;
  name: string;
  status: 'healthy' | 'degraded' | 'failed' | 'monitoring';
  lastCheckAt: number;
  fhirInterfaceHealth?: number;
  hl7Failures?: number;
  syncWindow?: string;
  approvedMapping?: boolean;
}

// ── Analytics per domain ───────────────────────────────────────────────────────

export type SubAdminAnalytics = Record<string, number | string>;

// ── Engine model ───────────────────────────────────────────────────────────────

export interface SubAdministratorModel {
  organizationId: string;
  facilityId?: string;
  facilityAdministratorId: AmxUid;
  administrators: Record<string, SubAdministrator>;
  delegations: DelegationGrant[];
  actingSessions: ActingSession[];
  approvalRequests: ApprovalRequest[];
  escalations: EscalationRecord[];
  notifications: AdminNotification[];
  aiAdvice: AdminAiAdvice[];
  communications: ScopedCommunication[];
  auditLog: SubAdminAuditEntry[];
  integrations: IntegrationOversight[];
  analytics: Record<SubAdminDomain, SubAdminAnalytics>;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSubAdministratorModelInput {
  organizationId: string;
  facilityId?: string;
  facilityAdministratorId: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function hoursMatch(hour: number, start?: number, end?: number): boolean {
  if (start === undefined || end === undefined) return true;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class SubAdministratorEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateSubAdministratorModelInput): SubAdministratorModel {
    if (!input.organizationId) throw new Error('[SAE] organizationId is required');
    if (!input.facilityAdministratorId) throw new Error('[SAE] facilityAdministratorId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      facilityAdministratorId: input.facilityAdministratorId,
      administrators: {},
      delegations: [],
      actingSessions: [],
      approvalRequests: [],
      escalations: [],
      notifications: [],
      aiAdvice: [],
      communications: [],
      auditLog: [],
      integrations: [],
      analytics: Object.fromEntries(SUB_ADMIN_DOMAINS.map(d => [d, {}])) as Record<SubAdminDomain, SubAdminAnalytics>,
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Principle II: No Unlimited Administrators ────────────────────────────────

  /** Only the constitutionally configured Facility Administrator exists at the top. */
  static getFacilityAdministrator(model: SubAdministratorModel): AmxUid {
    return model.facilityAdministratorId;
  }

  static getAdministrationHierarchy(model: SubAdministratorModel): { level: number; title: string; personId: AmxUid }[] {
    return [
      { level: 0, title: 'Facility Administrator', personId: model.facilityAdministratorId },
      ...Object.values(model.administrators)
        .filter(a => a.status === 'active')
        .map(a => ({ level: 1, title: a.roleTitle, personId: a.personId })),
    ];
  }

  // ── Principle I: Delegated authority ─────────────────────────────────────────

  /**
   * Create a Sub-Administrator. Authority is delegated, never transferred.
   * The delegate is bounded by a domain, an organizational scope, optional
   * branch/department, optional time-bound expiry, and optional shift scope.
   */
  static delegate(
    model: SubAdministratorModel,
    actorId: AmxUid,
    input: {
      personId: AmxUid;
      name: string;
      domain: SubAdminDomain;
      permissionCodes?: string[];
      organizationalScope: OrganizationalScope;
      branchId?: string;
      departmentId?: string;
      wardIds?: string[];
      expiresAt?: number;
      shiftStartHour?: number;
      shiftEndHour?: number;
    },
  ): { model: SubAdministratorModel; administrator: SubAdministrator } {
    if (actorId !== model.facilityAdministratorId) {
      throw new Error('[SAE] Only the Facility Administrator may delegate authority');
    }
    if (input.personId === model.facilityAdministratorId) {
      throw new Error('[SAE] The Facility Administrator cannot be delegated to themselves');
    }
    if (model.administrators[input.personId]) {
      throw new Error('[SAE] Person is already a Sub-Administrator');
    }
    if (!SUB_ADMIN_DOMAINS.includes(input.domain)) {
      throw new Error(`[SAE] Unknown domain "${input.domain}"`);
    }
    const catalogue = SUB_ADMIN_PERMISSION_CATALOG[input.domain];
    const permissions = (input.permissionCodes ?? catalogue.map(p => p.code)).map(code => {
      const found = catalogue.find(p => p.code === code);
      if (!found) throw new Error(`[SAE] Permission "${code}" does not belong to domain "${input.domain}"`);
      return found;
    });
    const now = Date.now();
    const administrator: SubAdministrator = {
      personId: input.personId,
      name: input.name,
      roleTitle: SUB_ADMIN_ROLE_TITLES[input.domain],
      domain: input.domain,
      permissions,
      organizationalScope: input.organizationalScope,
      branchId: input.branchId,
      departmentId: input.departmentId,
      wardIds: input.wardIds,
      grantedBy: actorId,
      grantedAt: now,
      expiresAt: input.expiresAt,
      shiftStartHour: input.shiftStartHour,
      shiftEndHour: input.shiftEndHour,
      status: 'active',
    };
    return {
      model: {
        ...model,
        administrators: { ...model.administrators, [input.personId]: administrator },
        auditLog: [...model.auditLog, {
          id: nextId('aud'), at: now, actorId, actorName: 'Facility Administrator',
          roleTitle: 'Facility Administrator', domain: input.domain, organizationId: model.organizationId,
          branchId: input.branchId, departmentId: input.departmentId, action: 'sub_admin_delegated', reason: 'Delegated authority',
        }],
        updatedAt: now,
      },
      administrator,
    };
  }

  static revokeDelegation(
    model: SubAdministratorModel,
    actorId: AmxUid,
    personId: AmxUid,
    reason: string,
  ): SubAdministratorModel {
    if (actorId !== model.facilityAdministratorId) {
      throw new Error('[SAE] Only the Facility Administrator may revoke delegation');
    }
    const admin = model.administrators[personId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    const now = Date.now();
    const administrators = { ...model.administrators, [personId]: { ...admin, status: 'revoked' as const } };
    const delegations = model.delegations
      .filter(d => d.subAdminId !== personId)
      .map(d => ({ ...d, active: false, revokedAt: now, revokedBy: actorId, revocationReason: reason }));
    return {
      ...model,
      administrators,
      delegations,
      auditLog: [...model.auditLog, {
        id: nextId('aud'), at: now, actorId, actorName: 'Facility Administrator',
        roleTitle: 'Facility Administrator', domain: admin.domain, organizationId: model.organizationId,
        departmentId: admin.departmentId, action: 'sub_admin_revoked', reason,
      }],
      updatedAt: now,
    };
  }

  static suspendAdministrator(model: SubAdministratorModel, actorId: AmxUid, personId: AmxUid, reason: string): SubAdministratorModel {
    if (actorId !== model.facilityAdministratorId) throw new Error('[SAE] Only the Facility Administrator may suspend a Sub-Administrator');
    const admin = model.administrators[personId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    const now = Date.now();
    const administrators = { ...model.administrators, [personId]: { ...admin, status: 'suspended' as const } };
    return {
      ...model,
      administrators,
      auditLog: [...model.auditLog, {
        id: nextId('aud'), at: now, actorId, actorName: 'Facility Administrator',
        roleTitle: 'Facility Administrator', domain: admin.domain, organizationId: model.organizationId,
        departmentId: admin.departmentId, action: 'sub_admin_suspended', reason,
      }],
      updatedAt: now,
    };
  }

  static reinstateAdministrator(model: SubAdministratorModel, actorId: AmxUid, personId: AmxUid): SubAdministratorModel {
    if (actorId !== model.facilityAdministratorId) throw new Error('[SAE] Only the Facility Administrator may reinstate a Sub-Administrator');
    const admin = model.administrators[personId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    if (admin.status !== 'suspended') throw new Error('[SAE] Only suspended Sub-Administrators may be reinstated');
    const now = Date.now();
    const administrators = { ...model.administrators, [personId]: { ...admin, status: 'active' as const } };
    return {
      ...model,
      administrators,
      auditLog: [...model.auditLog, {
        id: nextId('aud'), at: now, actorId, actorName: 'Facility Administrator',
        roleTitle: 'Facility Administrator', domain: admin.domain, organizationId: model.organizationId,
        departmentId: admin.departmentId, action: 'sub_admin_reinstated',
      }],
      updatedAt: now,
    };
  }

  // ── Time-bound & shift-bound delegation (auto-resume / auto-revoke) ─────────

  /** Resolve the effective privilege window. Shift scope: night admin 19:00→07:00; morning privileges automatically resume. */
  static resolveActiveAdministrator(model: SubAdministratorModel, personId: AmxUid, now: number = Date.now()): { active: boolean; administrator?: SubAdministrator; reason?: string } {
    const admin = model.administrators[personId];
    if (!admin) return { active: false, reason: 'Not a Sub-Administrator' };
    if (admin.status === 'revoked') return { active: false, reason: 'Delegation revoked' };
    if (admin.status === 'suspended') return { active: false, reason: 'Suspended' };
    if (admin.expiresAt && admin.expiresAt < now) return { active: false, reason: 'Delegation expired' };
    const hour = new Date(now).getHours();
    if (!hoursMatch(hour, admin.shiftStartHour, admin.shiftEndHour)) {
      return { active: false, reason: 'Outside shift scope' };
    }
    return { active: true, administrator: admin };
  }

  /** Time scope delegation e.g. vacation coverage — 48 hours, automatically revoked on expiry. */
  static grantTimeBound(
    model: SubAdministratorModel,
    actorId: AmxUid,
    input: { personId: AmxUid; name: string; domain: SubAdminDomain; organizationalScope: OrganizationalScope; durationMs: number; departmentId?: string },
  ): { model: SubAdministratorModel; delegation: DelegationGrant } {
    const result = SubAdministratorEngine.delegate(model, actorId, {
      personId: input.personId, name: input.name, domain: input.domain,
      organizationalScope: input.organizationalScope, departmentId: input.departmentId,
      expiresAt: Date.now() + input.durationMs,
    });
    const now = Date.now();
    const delegation: DelegationGrant = {
      id: nextId('dgl'),
      subAdminId: input.personId,
      permissionCodes: result.administrator.permissions.map(p => p.code),
      organizationalScope: input.organizationalScope,
      departmentId: input.departmentId,
      delegatedBy: actorId,
      delegatedAt: now,
      expiresAt: now + input.durationMs,
      inheritable: false,
      active: true,
    };
    return { model: { ...result.model, delegations: [...result.model.delegations, delegation] }, delegation };
  }

  static grantShiftScoped(
    model: SubAdministratorModel,
    actorId: AmxUid,
    input: { personId: AmxUid; name: string; domain: SubAdminDomain; organizationalScope: OrganizationalScope; startHour: number; endHour: number; departmentId?: string },
  ): { model: SubAdministratorModel; administrator: SubAdministrator } {
    return SubAdministratorEngine.delegate(model, actorId, {
      personId: input.personId, name: input.name, domain: input.domain,
      organizationalScope: input.organizationalScope, departmentId: input.departmentId,
      shiftStartHour: input.startHour, shiftEndHour: input.endHour,
    });
  }

  static getExpiringDelegations(model: SubAdministratorModel, withinMs: number): DelegationGrant[] {
    const now = Date.now();
    return model.delegations.filter(d => d.active && d.expiresAt && d.expiresAt < now + withinMs);
  }

  /** Acting Administrator — temporary delegation that automatically returns (e.g. Deputy CEO covers CEO's 30-day leave). */
  static startActing(
    model: SubAdministratorModel,
    actorId: AmxUid,
    input: { subAdminId: AmxUid; actingFor: AmxUid; reason: string; durationMs: number },
  ): { model: SubAdministratorModel; session: ActingSession } {
    if (actorId !== model.facilityAdministratorId) throw new Error('[SAE] Only the Facility Administrator may grant acting authority');
    const admin = model.administrators[input.subAdminId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    const now = Date.now();
    const session: ActingSession = {
      id: nextId('act'),
      subAdminId: input.subAdminId,
      actingFor: input.actingFor,
      reason: input.reason,
      startAt: now,
      endAt: now + input.durationMs,
      status: 'active',
      grantedBy: actorId,
      grantedAt: now,
    };
    return {
      model: {
        ...model,
        actingSessions: [...model.actingSessions, session],
        auditLog: [...model.auditLog, {
          id: nextId('aud'), at: now, actorId, actorName: 'Facility Administrator',
          roleTitle: 'Facility Administrator', domain: admin.domain, organizationId: model.organizationId,
          action: 'acting_authority_granted', reason: input.reason,
        }],
        updatedAt: now,
      },
      session,
    };
  }

  static endActing(model: SubAdministratorModel, sessionId: string): SubAdministratorModel {
    const now = Date.now();
    const actingSessions = model.actingSessions.map(s =>
      s.id === sessionId && s.status === 'active' ? { ...s, status: 'completed' as const, endAt: Math.min(s.endAt, now) } : s,
    );
    return { ...model, actingSessions, updatedAt: now };
  }

  static getActiveActing(model: SubAdministratorModel): ActingSession[] {
    const now = Date.now();
    return model.actingSessions.filter(s => s.status === 'active' && s.endAt > now);
  }

  // ── Permission resolution (P1: scope-bound, revocable, time-bound) ──────────

  static hasPermission(
    model: SubAdministratorModel,
    personId: AmxUid,
    code: string,
    context: { now?: number; branchId?: string; departmentId?: string } = {},
  ): { allowed: boolean; reason?: string } {
    const resolution = SubAdministratorEngine.resolveActiveAdministrator(model, personId, context.now);
    if (!resolution.active || !resolution.administrator) {
      return { allowed: false, reason: resolution.reason };
    }
    const admin = resolution.administrator;
    const permission = admin.permissions.find(p => p.code === code);
    if (!permission) return { allowed: false, reason: `Permission "${code}" not delegated to ${admin.domain}` };
    if (admin.organizationalScope === 'branch' && context.branchId && admin.branchId && admin.branchId !== context.branchId) {
      return { allowed: false, reason: 'Branch scope violation' };
    }
    if ((admin.organizationalScope === 'department' || admin.organizationalScope === 'ward') && context.departmentId && admin.departmentId && admin.departmentId !== context.departmentId) {
      return { allowed: false, reason: 'Department scope violation' };
    }
    return { allowed: true };
  }

  static assertCapability(model: SubAdministratorModel, personId: AmxUid, code: string, context?: { now?: number; branchId?: string; departmentId?: string }): void {
    const verdict = SubAdministratorEngine.hasPermission(model, personId, code, context);
    if (!verdict.allowed) throw new Error(`[SAE] ${verdict.reason}`);
  }

  static grantPermission(model: SubAdministratorModel, actorId: AmxUid, personId: AmxUid, code: string): SubAdministratorModel {
    const admin = model.administrators[personId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    if (actorId !== model.facilityAdministratorId) {
      SubAdministratorEngine.assertCapability(model, actorId, 'delegate');
      if (admin.domain !== model.administrators[actorId].domain) {
        throw new Error('[SAE] Permission granted outside delegated domain');
      }
    }
    const catalogue = SUB_ADMIN_PERMISSION_CATALOG[admin.domain];
    const permission = catalogue.find(p => p.code === code);
    if (!permission) throw new Error(`[SAE] Permission "${code}" does not belong to domain "${admin.domain}"`);
    if (admin.permissions.some(p => p.code === code)) throw new Error(`[SAE] Permission "${code}" already granted`);
    const administrators = { ...model.administrators, [personId]: { ...admin, permissions: [...admin.permissions, permission] } };
    const now = Date.now();
    return {
      ...model,
      administrators,
      auditLog: [...model.auditLog, {
        id: nextId('aud'), at: now, actorId, actorName: admin.name, roleTitle: admin.roleTitle,
        domain: admin.domain, organizationId: model.organizationId, departmentId: admin.departmentId,
        action: 'permission_granted', reason: code,
      }],
      updatedAt: now,
    };
  }

  static revokePermission(model: SubAdministratorModel, actorId: AmxUid, personId: AmxUid, code: string): SubAdministratorModel {
    const admin = model.administrators[personId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    if (actorId !== model.facilityAdministratorId) {
      throw new Error('[SAE] Only the Facility Administrator may revoke permissions');
    }
    const administrators = {
      ...model.administrators,
      [personId]: { ...admin, permissions: admin.permissions.filter(p => p.code !== code) },
    };
    const now = Date.now();
    return {
      ...model,
      administrators,
      auditLog: [...model.auditLog, {
        id: nextId('aud'), at: now, actorId, actorName: 'Facility Administrator',
        roleTitle: 'Facility Administrator', domain: admin.domain, organizationId: model.organizationId,
        departmentId: admin.departmentId, action: 'permission_revoked', reason: code,
      }],
      updatedAt: now,
    };
  }

  // ── Approval engine ──────────────────────────────────────────────────────────

  static requestApproval(
    model: SubAdministratorModel,
    requesterId: AmxUid,
    input: { title: string; action: string; resource: string; reason: string; chain: { approverId: AmxUid; level: string }[]; beforeState?: Record<string, unknown> },
  ): { model: SubAdministratorModel; request: ApprovalRequest } {
    const admin = model.administrators[requesterId];
    if (!admin) throw new Error('[SAE] Only Sub-Administrators may request approval');
    const now = Date.now();
    const request: ApprovalRequest = {
      id: nextId('appr'),
      title: input.title,
      action: input.action,
      resource: input.resource,
      requesterId,
      requesterDomain: admin.domain,
      reason: input.reason,
      chain: input.chain,
      status: 'pending',
      requestedAt: now,
      beforeState: input.beforeState,
    };
    const notified = input.chain.reduce((acc, step) =>
      SubAdministratorEngine.notify(acc, step.approverId, 'approval', `Approval required: ${input.title}`, input.reason).model,
      model,
    );
    return {
      model: { ...notified, approvalRequests: [...notified.approvalRequests, request], updatedAt: now },
      request,
    };
  }

  static approveRequest(model: SubAdministratorModel, approverId: AmxUid, requestId: string, afterState?: Record<string, unknown>): { model: SubAdministratorModel; request: ApprovalRequest; approved: boolean } {
    const request = model.approvalRequests.find(r => r.id === requestId);
    if (!request) throw new Error('[SAE] Approval request not found');
    if (request.status !== 'pending') throw new Error('[SAE] Approval request already decided');
    if (approverId !== model.facilityAdministratorId) {
      const inChain = request.chain.find(c => c.approverId === approverId);
      if (!inChain) throw new Error('[SAE] Approver not in approval chain');
    }
    const now = Date.now();
    const approvedRequest: ApprovalRequest = {
      ...request,
      status: 'approved',
      decidedAt: now,
      decidedBy: approverId,
      afterState,
    };
    const approvalRequests = model.approvalRequests.map(r => r.id === requestId ? approvedRequest : r);
    return {
      model: {
        ...model,
        approvalRequests,
        auditLog: [...model.auditLog, {
          id: nextId('aud'), at: now, actorId: approverId, actorName: 'Approver',
          roleTitle: 'Facility Administrator', domain: request.requesterDomain, organizationId: model.organizationId,
          action: 'approval_granted', reason: request.reason, approvalChainId: request.id,
          before: request.beforeState, after: afterState,
        }],
        updatedAt: now,
      },
      request: approvedRequest,
      approved: true,
    };
  }

  static rejectRequest(model: SubAdministratorModel, approverId: AmxUid, requestId: string, reason: string): SubAdministratorModel {
    const request = model.approvalRequests.find(r => r.id === requestId);
    if (!request) throw new Error('[SAE] Approval request not found');
    if (request.status !== 'pending') throw new Error('[SAE] Approval request already decided');
    if (approverId !== model.facilityAdministratorId) {
      const inChain = request.chain.find(c => c.approverId === approverId);
      if (!inChain) throw new Error('[SAE] Approver not in approval chain');
    }
    const now = Date.now();
    const approvalRequests = model.approvalRequests.map(r =>
      r.id === requestId ? { ...r, status: 'rejected' as const, decidedAt: now, decidedBy: approverId } : r,
    );
    return {
      ...model,
      approvalRequests,
      auditLog: [...model.auditLog, {
        id: nextId('aud'), at: now, actorId: approverId, actorName: 'Approver',
        roleTitle: 'Facility Administrator', domain: request.requesterDomain, organizationId: model.organizationId,
        action: 'approval_rejected', reason, approvalChainId: request.id,
      }],
      updatedAt: now,
    };
  }

  static getPendingApprovals(model: SubAdministratorModel, approverId: AmxUid): ApprovalRequest[] {
    return model.approvalRequests.filter(r =>
      r.status === 'pending' && (approverId === model.facilityAdministratorId || r.chain.some(c => c.approverId === approverId)),
    );
  }

  // ── Escalation engine (nothing remains hidden) ───────────────────────────────

  static raiseEscalation(
    model: SubAdministratorModel,
    raiserId: AmxUid,
    input: { issue: string; severity: EscalationRecord['severity']; origin: EscalationLevel },
  ): { model: SubAdministratorModel; escalation: EscalationRecord } {
    const now = Date.now();
    const escalation: EscalationRecord = {
      id: nextId('esc'),
      issue: input.issue,
      severity: input.severity,
      origin: input.origin,
      currentLevel: input.origin,
      raisedBy: raiserId,
      raisedAt: now,
      status: 'open',
      history: [{ level: input.origin, at: now, by: raiserId }],
    };
    return {
      model: {
        ...model,
        escalations: [...model.escalations, escalation],
        updatedAt: now,
      },
      escalation,
    };
  }

  /** Escalate Ward → Department → Clinical Operations Admin → Facility Administrator. */
  static escalate(model: SubAdministratorModel, actorId: AmxUid, escalationId: string): { model: SubAdministratorModel; escalated: boolean } {
    const esc = model.escalations.find(e => e.id === escalationId);
    if (!esc) throw new Error('[SAE] Escalation not found');
    const index = ESCALATION_CHAIN.indexOf(esc.currentLevel);
    if (index >= ESCALATION_CHAIN.length - 1) {
      throw new Error('[SAE] Escalation already at Facility Administrator level');
    }
    const now = Date.now();
    const nextLevel = ESCALATION_CHAIN[index + 1];
    const escalatedRecord: EscalationRecord = {
      ...esc,
      currentLevel: nextLevel,
      status: 'escalated',
      assignedTo: nextLevel === 'facility_administrator' ? model.facilityAdministratorId : undefined,
      history: [...esc.history, { level: nextLevel, at: now, by: actorId }],
    };
    const escalations = model.escalations.map(e => e.id === escalationId ? escalatedRecord : e);
    let next = { ...model, escalations, updatedAt: now };
    if (nextLevel === 'facility_administrator') {
      next = SubAdministratorEngine.notify(next, model.facilityAdministratorId, 'escalation', `Escalation: ${esc.issue}`, `Escalated from ${esc.currentLevel} to Facility Administrator`).model;
    }
    return { model: next, escalated: true };
  }

  static acknowledgeEscalation(model: SubAdministratorModel, actorId: AmxUid, escalationId: string): SubAdministratorModel {
    const now = Date.now();
    const escalations = model.escalations.map(e =>
      e.id === escalationId ? { ...e, status: 'acknowledged' as const, assignedTo: actorId } : e,
    );
    return { ...model, escalations, updatedAt: now };
  }

  static resolveEscalation(model: SubAdministratorModel, actorId: AmxUid, escalationId: string): SubAdministratorModel {
    const now = Date.now();
    const escalations = model.escalations.map(e =>
      e.id === escalationId ? { ...e, status: 'resolved' as const } : e,
    );
    return {
      ...model,
      escalations,
      auditLog: [...model.auditLog, {
        id: nextId('aud'), at: now, actorId, actorName: 'Resolver',
        roleTitle: 'Resolver', domain: 'clinical_operations', organizationId: model.organizationId,
        action: 'escalation_resolved', reason: escalationId,
      }],
      updatedAt: now,
    };
  }

  static getOpenEscalations(model: SubAdministratorModel): EscalationRecord[] {
    return model.escalations.filter(e => e.status === 'open' || e.status === 'escalated');
  }

  // ── Notification engine ──────────────────────────────────────────────────────

  static notify(model: SubAdministratorModel, recipientId: AmxUid, kind: AdminNotificationKind, title: string, body: string, link?: string): { model: SubAdministratorModel; notification: AdminNotification } {
    const notification: AdminNotification = {
      id: nextId('ntf'), recipientId, kind, title, body, createdAt: Date.now(), read: false, link,
    };
    return { model: { ...model, notifications: [...model.notifications, notification], updatedAt: Date.now() }, notification };
  }

  static markNotificationRead(model: SubAdministratorModel, recipientId: AmxUid, notificationId: string): SubAdministratorModel {
    const now = Date.now();
    const notifications = model.notifications.map(n =>
      n.id === notificationId && n.recipientId === recipientId ? { ...n, read: true, readAt: now } : n,
    );
    return { ...model, notifications, updatedAt: now };
  }

  static getUnreadNotifications(model: SubAdministratorModel, recipientId: AmxUid): AdminNotification[] {
    return model.notifications.filter(n => n.recipientId === recipientId && !n.read);
  }

  // ── Administrative AI (every Sub-Admin has a domain assistant) ───────────────

  /** Generate bounded domain advice from current context. AI advises; the administrator decides. */
  static generateAiAdvice(
    model: SubAdministratorModel,
    subAdminId: AmxUid,
    input: { advice: string; rationale: string; confidence: number },
  ): { model: SubAdministratorModel; advice: AdminAiAdvice } {
    const admin = model.administrators[subAdminId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    const advice: AdminAiAdvice = {
      id: nextId('ai'),
      subAdminId,
      domain: admin.domain,
      advice: input.advice,
      rationale: input.rationale,
      confidence: input.confidence,
      generatedAt: Date.now(),
      status: 'pending',
    };
    return { model: { ...model, aiAdvice: [...model.aiAdvice, advice], updatedAt: Date.now() }, advice };
  }

  static respondToAiAdvice(model: SubAdministratorModel, subAdminId: AmxUid, adviceId: string, status: AdminAiAdvice['status']): SubAdministratorModel {
    const aiAdvice = model.aiAdvice.map(a =>
      a.id === adviceId && a.subAdminId === subAdminId ? { ...a, status } : a,
    );
    return { ...model, aiAdvice, updatedAt: Date.now() };
  }

  static getPendingAiAdvice(model: SubAdministratorModel, subAdminId: AmxUid): AdminAiAdvice[] {
    return model.aiAdvice.filter(a => a.subAdminId === subAdminId && a.status === 'pending');
  }

  // ── Analytics (each Sub-Admin sees only relevant analytics) ─────────────────

  static setAnalytics(model: SubAdministratorModel, subAdminId: AmxUid, analytics: SubAdminAnalytics): SubAdministratorModel {
    const admin = model.administrators[subAdminId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    return {
      ...model,
      analytics: { ...model.analytics, [admin.domain]: { ...model.analytics[admin.domain], ...analytics } },
      updatedAt: Date.now(),
    };
  }

  static getAnalytics(model: SubAdministratorModel, subAdminId: AmxUid): SubAdminAnalytics {
    const admin = model.administrators[subAdminId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    return { ...model.analytics[admin.domain] };
  }

  // ── Communication engine (within scope) ─────────────────────────────────────

  static sendCommunication(
    model: SubAdministratorModel,
    senderId: AmxUid,
    input: Omit<ScopedCommunication, 'id' | 'publishedBy' | 'publishedAt' | 'acknowledgedBy'>,
  ): { model: SubAdministratorModel; communication: ScopedCommunication } {
    const admin = model.administrators[senderId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    const now = Date.now();
    const communication: ScopedCommunication = {
      ...input,
      id: nextId('com'),
      publishedBy: senderId,
      publishedAt: now,
      acknowledgedBy: [],
    };
    return { model: { ...model, communications: [...model.communications, communication], updatedAt: now }, communication };
  }

  static acknowledgeCommunication(model: SubAdministratorModel, personId: AmxUid, communicationId: string): SubAdministratorModel {
    const communications = model.communications.map(c =>
      c.id === communicationId && !c.acknowledgedBy.includes(personId)
        ? { ...c, acknowledgedBy: [...c.acknowledgedBy, personId] }
        : c,
    );
    return { ...model, communications, updatedAt: Date.now() };
  }

  static getCommunicationsInScope(model: SubAdministratorModel, personId: AmxUid): ScopedCommunication[] {
    const admin = model.administrators[personId];
    if (!admin) return [];
    const now = Date.now();
    return model.communications.filter(c => {
      const withinDepartment = admin.departmentId ? c.departmentId === admin.departmentId : true;
      const withinBranch = admin.branchId ? c.branchId === admin.branchId : true;
      const audience = c.audience ?? [];
      const withinAudience = audience.includes(personId) || audience.includes('all') || audience.includes(admin.domain);
      return withinDepartment && withinBranch && withinAudience;
    });
  }

  // ── Audit engine (no administrative action is anonymous) ────────────────────

  static recordAction(
    model: SubAdministratorModel,
    actorId: AmxUid,
    input: {
      action: string;
      domain: SubAdminDomain;
      reason?: string;
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
      branchId?: string;
      departmentId?: string;
      device?: string;
      ipLocation?: string;
      approvalChainId?: string;
    },
  ): SubAdministratorModel {
    const admin = model.administrators[actorId];
    const actorName = admin?.name ?? 'Facility Administrator';
    const roleTitle = admin?.roleTitle ?? 'Facility Administrator';
    const now = Date.now();
    const entry: SubAdminAuditEntry = {
      id: nextId('aud'),
      at: now,
      actorId,
      actorName,
      roleTitle,
      domain: input.domain,
      organizationId: model.organizationId,
      branchId: input.branchId ?? admin?.branchId,
      departmentId: input.departmentId ?? admin?.departmentId,
      device: input.device,
      ipLocation: input.ipLocation,
      before: input.before,
      after: input.after,
      reason: input.reason,
      approvalChainId: input.approvalChainId,
      action: input.action,
    };
    return { ...model, auditLog: [...model.auditLog, entry], updatedAt: now };
  }

  static getAuditLog(model: SubAdministratorModel, filters: { actorId?: AmxUid; domain?: SubAdminDomain; since?: number } = {}): SubAdminAuditEntry[] {
    return model.auditLog.filter(e =>
      (!filters.actorId || e.actorId === filters.actorId) &&
      (!filters.domain || e.domain === filters.domain) &&
      (!filters.since || e.at >= filters.since),
    );
  }

  /** Constitutional limit: audit logs are append-only and may never be deleted. */
  static deleteAuditLog(model: SubAdministratorModel, actorId: AmxUid): SubAdministratorModel {
    throw new Error('[SAE] Audit logs are append-only. No actor may delete them.');
  }

  // ── Interoperability oversight (without changing clinical data) ─────────────

  static registerOversight(model: SubAdministratorModel, actorId: AmxUid, input: Omit<IntegrationOversight, 'id' | 'status' | 'lastCheckAt'>): { model: SubAdministratorModel; oversight: IntegrationOversight } {
    SubAdministratorEngine.assertCapability(model, actorId, 'ict.create_integration');
    const oversight: IntegrationOversight = { ...input, id: nextId('ovr'), status: 'monitoring', lastCheckAt: Date.now() };
    return { model: { ...model, integrations: [...model.integrations, oversight], updatedAt: Date.now() }, oversight };
  }

  static updateOversightStatus(model: SubAdministratorModel, actorId: AmxUid, oversightId: string, status: IntegrationOversight['status']): SubAdministratorModel {
    SubAdministratorEngine.assertCapability(model, actorId, 'ict.read_fhir_connections');
    const now = Date.now();
    const integrations = model.integrations.map(i =>
      i.id === oversightId ? { ...i, status, lastCheckAt: now } : i,
    );
    return { ...model, integrations, updatedAt: now };
  }

  static recordHl7Failure(model: SubAdministratorModel, actorId: AmxUid, oversightId: string): SubAdministratorModel {
    SubAdministratorEngine.assertCapability(model, actorId, 'ict.read_logs');
    const integrations = model.integrations.map(i =>
      i.id === oversightId ? { ...i, hl7Failures: (i.hl7Failures ?? 0) + 1, status: 'degraded' as const } : i,
    );
    return { ...model, integrations, updatedAt: Date.now() };
  }

  static approveIntegrationMapping(model: SubAdministratorModel, actorId: AmxUid, oversightId: string): SubAdministratorModel {
    SubAdministratorEngine.assertCapability(model, actorId, 'ict.update_integration');
    const integrations = model.integrations.map(i =>
      i.id === oversightId ? { ...i, approvedMapping: true } : i,
    );
    return { ...model, integrations, updatedAt: Date.now() };
  }

  static getIntegrationHealth(model: SubAdministratorModel): IntegrationOversight[] {
    return model.integrations.filter(i => i.status !== 'healthy');
  }

  // ── Constitutional limits (enforced) ─────────────────────────────────────────

  /** A Sub-Administrator can never promote themselves to Facility Administrator. */
  static promoteToFacilityAdministrator(model: SubAdministratorModel, actorId: AmxUid): SubAdministratorModel {
    throw new Error('[SAE] A Sub-Administrator cannot promote themselves to Facility Administrator');
  }

  /** No permission may be granted outside the delegated domain. */
  static grantOutsideDomain(model: SubAdministratorModel, actorId: AmxUid, personId: AmxUid, code: string): SubAdministratorModel {
    const admin = model.administrators[personId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    const catalogue = SUB_ADMIN_PERMISSION_CATALOG[admin.domain];
    if (!catalogue.some(p => p.code === code)) {
      throw new Error(`[SAE] Permission "${code}" is outside domain "${admin.domain}" and cannot be granted`);
    }
    return model;
  }

  /** Disable security controls? Denied. */
  static disableSecurityControls(model: SubAdministratorModel, actorId: AmxUid): SubAdministratorModel {
    throw new Error('[SAE] Sub-Administrators cannot disable security controls');
  }

  /** Change subscription tier? Denied. */
  static changeSubscriptionTier(model: SubAdministratorModel, actorId: AmxUid): SubAdministratorModel {
    throw new Error('[SAE] Sub-Administrators cannot change subscription tiers');
  }

  /** Modify global AMEXAN rules? Denied. */
  static modifyGlobalRules(model: SubAdministratorModel, actorId: AmxUid): SubAdministratorModel {
    throw new Error('[SAE] Sub-Administrators cannot modify global AMEXAN rules');
  }

  /** Override consent without constitutional authority? Denied. */
  static overrideConsent(model: SubAdministratorModel, actorId: AmxUid): SubAdministratorModel {
    throw new Error('[SAE] Consent may not be overridden without constitutional authority');
  }

  // ── Domain dashboards ────────────────────────────────────────────────────────

  static getDomainDashboard(model: SubAdministratorModel, subAdminId: AmxUid): { roleTitle: string; domain: SubAdminDomain; scope: OrganizationalScope; branchId?: string; departmentId?: string; permissions: AdminPermission[]; analytics: SubAdminAnalytics; activeNow: boolean } {
    const admin = model.administrators[subAdminId];
    if (!admin) throw new Error('[SAE] Person is not a Sub-Administrator');
    const resolution = SubAdministratorEngine.resolveActiveAdministrator(model, subAdminId);
    return {
      roleTitle: admin.roleTitle,
      domain: admin.domain,
      scope: admin.organizationalScope,
      branchId: admin.branchId,
      departmentId: admin.departmentId,
      permissions: admin.permissions,
      analytics: { ...model.analytics[admin.domain] },
      activeNow: resolution.active,
    };
  }
}
