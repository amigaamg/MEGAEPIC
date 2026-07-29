// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN SECURITY & COMPLIANCE CONSTITUTION
// Audit logs, enterprise RBAC, compliance frameworks, security policies.
// No medical rules. Only governance and regulatory logic.
// ═══════════════════════════════════════════════════════════════════════════════

import { Organization, OrganizationUser } from './business-constitution';

export type AuditAction =
  | 'user.login' | 'user.logout' | 'user.created' | 'user.deactivated'
  | 'subscription.created' | 'subscription.modified' | 'subscription.cancelled'
  | 'license.generated' | 'license.revoked'
  | 'module.access_denied' | 'module.enabled' | 'module.disabled'
  | 'data.exported' | 'data.imported' | 'data.deleted'
  | 'settings.modified' | 'security.policy_changed'
  | 'compliance.report_generated' | 'audit.log_viewed'
  | 'integration.connected' | 'integration.disconnected'
  | 'api.key_created' | 'api.key_revoked'
  | 'payment.processed' | 'payment.failed'
  | 'support.ticket_escalated';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorType: 'user' | 'system' | 'api' | 'admin';
  organizationId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface EnterpriseRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'admin' | 'export' | 'approve' | 'revoke')[];
  constraints?: Record<string, unknown>;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  applicableRegions: string[];
  applicableCustomerTypes: string[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: 'data_protection' | 'access_control' | 'audit' | 'encryption' | 'retention' | 'consent' | 'breach_notification' | 'training';
  status: 'met' | 'partially_met' | 'not_met' | 'not_applicable';
  notes: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export const BUILT_IN_ROLES: EnterpriseRole[] = [
  { id: 'role_super_admin', name: 'Super Admin', description: 'Full system access', isSystemRole: true, permissions: [{ resource: '*', actions: ['admin'] }] },
  { id: 'role_org_admin', name: 'Organization Admin', description: 'Manage organization settings and users', isSystemRole: true, permissions: [{ resource: 'organization', actions: ['create', 'read', 'update', 'delete', 'admin'] }, { resource: 'user', actions: ['create', 'read', 'update', 'delete'] }, { resource: 'subscription', actions: ['read', 'update'] }, { resource: 'billing', actions: ['read', 'export'] }, { resource: 'support', actions: ['read', 'update'] }] },
  { id: 'role_billing_admin', name: 'Billing Admin', description: 'Manage billing and invoices', isSystemRole: true, permissions: [{ resource: 'billing', actions: ['create', 'read', 'update', 'delete', 'export'] }, { resource: 'subscription', actions: ['read'] }, { resource: 'invoice', actions: ['read', 'export'] }] },
  { id: 'role_support_agent', name: 'Support Agent', description: 'Manage support tickets and knowledge base', isSystemRole: true, permissions: [{ resource: 'support', actions: ['create', 'read', 'update'] }, { resource: 'knowledge_base', actions: ['create', 'read', 'update'] }, { resource: 'user', actions: ['read'] }] },
  { id: 'role_compliance_officer', name: 'Compliance Officer', description: 'Manage compliance and audit logs', isSystemRole: true, permissions: [{ resource: 'compliance', actions: ['read', 'admin', 'export'] }, { resource: 'audit_log', actions: ['read', 'export'] }, { resource: 'user', actions: ['read'] }] },
  { id: 'role_developer', name: 'Developer', description: 'API access and integration management', isSystemRole: true, permissions: [{ resource: 'api', actions: ['read', 'create', 'revoke'] }, { resource: 'integration', actions: ['create', 'read', 'update', 'delete'] }, { resource: 'documentation', actions: ['read'] }] },
  { id: 'role_viewer', name: 'Read-only Viewer', description: 'View dashboards and reports only', isSystemRole: true, permissions: [{ resource: 'dashboard', actions: ['read'] }, { resource: 'report', actions: ['read', 'export'] }] },
];

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    id: 'hipaa', name: 'HIPAA', version: '2024',
    applicableRegions: ['us'], applicableCustomerTypes: ['hospital', 'clinic', 'hospital_group'],
    requirements: [
      { id: 'hipaa_1', title: 'Data Encryption at Rest', description: 'All PHI must be encrypted at rest using AES-256', category: 'encryption', status: 'met', notes: 'Implemented via server-side encryption' },
      { id: 'hipaa_2', title: 'Data Encryption in Transit', description: 'All PHI transmitted must use TLS 1.2+', category: 'encryption', status: 'met', notes: 'TLS 1.3 enabled by default' },
      { id: 'hipaa_3', title: 'Access Controls', description: 'Unique user IDs, automatic logoff, emergency access', category: 'access_control', status: 'met', notes: 'RBAC implemented with session timeout' },
      { id: 'hipaa_4', title: 'Audit Controls', description: 'Record and examine access and activity logs', category: 'audit', status: 'met', notes: 'Comprehensive audit logging active' },
      { id: 'hipaa_5', title: 'Integrity Controls', description: 'Ensure PHI is not improperly altered or destroyed', category: 'data_protection', status: 'partially_met', notes: 'Basic integrity checks in place' },
      { id: 'hipaa_6', title: 'Breach Notification', description: 'Notify affected individuals within 60 days', category: 'breach_notification', status: 'met', notes: 'Automated notification workflow' },
    ],
  },
  {
    id: 'gdpr', name: 'GDPR', version: '2018',
    applicableRegions: ['uk', 'eu'], applicableCustomerTypes: ['*'],
    requirements: [
      { id: 'gdpr_1', title: 'Data Processing Consent', description: 'Obtain explicit consent for data processing', category: 'consent', status: 'met', notes: 'Consent management module active' },
      { id: 'gdpr_2', title: 'Right to Access', description: 'Provide data copy within 30 days', category: 'data_protection', status: 'met', notes: 'Data export API available' },
      { id: 'gdpr_3', title: 'Right to Erasure', description: 'Delete personal data on request', category: 'data_protection', status: 'met', notes: 'Account deletion workflow active' },
      { id: 'gdpr_4', title: 'Data Portability', description: 'Export data in machine-readable format', category: 'data_protection', status: 'met', notes: 'JSON/CSV export supported' },
      { id: 'gdpr_5', title: 'Breach Notification', description: 'Notify DPA within 72 hours', category: 'breach_notification', status: 'partially_met', notes: '72-hour workflow established' },
      { id: 'gdpr_6', title: 'Data Protection Officer', description: 'Appoint DPO for large-scale processing', category: 'training', status: 'not_met', notes: 'DPO not yet assigned' },
    ],
  },
  {
    id: 'kenya_data_protection', name: 'Kenya Data Protection Act', version: '2019',
    applicableRegions: ['ke'], applicableCustomerTypes: ['*'],
    requirements: [
      { id: 'kdp_1', title: 'Data Registration', description: 'Register as data processor with ODPC', category: 'consent', status: 'met', notes: 'ODPC registration active' },
      { id: 'kdp_2', title: 'Consent', description: 'Obtain consent for data collection and processing', category: 'consent', status: 'met', notes: 'Consent forms integrated' },
      { id: 'kdp_3', title: 'Data Subject Rights', description: 'Enable access, correction, deletion requests', category: 'data_protection', status: 'met', notes: 'Subject rights portal active' },
      { id: 'kdp_4', title: 'Data Security', description: 'Implement appropriate security measures', category: 'data_protection', status: 'met', notes: 'Security controls in place' },
      { id: 'kdp_5', title: 'Breach Notification', description: 'Notify ODPC within 72 hours', category: 'breach_notification', status: 'partially_met', notes: 'Notification workflow designed but not tested' },
    ],
  },
];

export const DEFAULT_SECURITY_POLICIES: SecurityPolicy[] = [
  { id: 'pol_password_policy', name: 'Password Policy', description: 'Minimum password complexity requirements', enabled: true, config: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true, maxAge: 90 } },
  { id: 'pol_mfa', name: 'Multi-Factor Authentication', description: 'Require MFA for all users', enabled: true, config: { required: true, methods: ['totp', 'sms', 'email'], gracePeriodDays: 7 } },
  { id: 'pol_session_timeout', name: 'Session Timeout', description: 'Automatic logout after inactivity', enabled: true, config: { timeoutMinutes: 30, warningAtMinutes: 5 } },
  { id: 'pol_ip_restriction', name: 'IP Restriction', description: 'Restrict access to allowed IP ranges', enabled: false, config: { allowedCIDRs: [], enabled: false } },
  { id: 'pol_data_retention', name: 'Data Retention', description: 'Automatic data purging after retention period', enabled: true, config: { clinicalDataYears: 10, auditLogYears: 7, backupYears: 3 } },
  { id: 'pol_api_rate_limit', name: 'API Rate Limit', description: 'Rate limit for API calls', enabled: true, config: { maxPerMinute: 60, maxPerHour: 1000, maxPerDay: 10000 } },
  { id: 'pol_audit_logging', name: 'Audit Logging', description: 'Comprehensive audit logging for all sensitive operations', enabled: true, config: { retentionDays: 2555, includeReads: false, includeWrites: true } },
];

export class SecurityEngine {
  private auditLog: AuditLogEntry[] = [];
  private roles: Map<string, EnterpriseRole> = new Map();
  private userRoles: Map<string, string> = new Map();
  private policies: Map<string, SecurityPolicy> = new Map();

  constructor() {
    for (const role of BUILT_IN_ROLES) this.roles.set(role.id, role);
    for (const policy of DEFAULT_SECURITY_POLICIES) this.policies.set(policy.id, policy);
  }

  // ── Audit Logging ─────────────────────────────────────────────────────────

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const created: AuditLogEntry = {
      ...entry, id: `audit_${Date.now()}_${this.auditLog.length}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLog.push(created);
    return created;
  }

  queryAuditLog(options: { organizationId?: string; actorId?: string; action?: AuditAction; severity?: string; startDate?: string; endDate?: string; limit?: number }): AuditLogEntry[] {
    let results = this.auditLog;
    if (options.organizationId) results = results.filter(e => e.organizationId === options.organizationId);
    if (options.actorId) results = results.filter(e => e.actorId === options.actorId);
    if (options.action) results = results.filter(e => e.action === options.action);
    if (options.severity) results = results.filter(e => e.severity === options.severity);
    if (options.startDate) results = results.filter(e => new Date(e.timestamp) >= new Date(options.startDate!));
    if (options.endDate) results = results.filter(e => new Date(e.timestamp) <= new Date(options.endDate!));
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return options.limit ? results.slice(0, options.limit) : results;
  }

  getAuditStats(organizationId?: string): { total: number; byAction: Record<string, number>; bySeverity: Record<string, number>; last24h: number } {
    const relevant = organizationId ? this.auditLog.filter(e => e.organizationId === organizationId) : this.auditLog;
    const byAction: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let last24h = 0;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    for (const entry of relevant) {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
      bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
      if (new Date(entry.timestamp).getTime() > cutoff) last24h++;
    }

    return { total: relevant.length, byAction, bySeverity, last24h };
  }

  // ── Role Management ────────────────────────────────────────────────────────

  getRole(roleId: string): EnterpriseRole | undefined {
    return this.roles.get(roleId);
  }

  createRole(role: EnterpriseRole): void {
    this.roles.set(role.id, role);
  }

  assignRole(userId: string, roleId: string): boolean {
    if (!this.roles.has(roleId)) return false;
    this.userRoles.set(userId, roleId);
    this.log({ actorId: 'system', actorType: 'system', organizationId: '', action: 'settings.modified', resourceType: 'role_assignment', resourceId: userId, details: { role: roleId }, severity: 'info' });
    return true;
  }

  getUserRole(userId: string): EnterpriseRole | undefined {
    const roleId = this.userRoles.get(userId);
    return roleId ? this.roles.get(roleId) : undefined;
  }

  checkPermission(userId: string, resource: string, action: string): boolean {
    const role = this.getUserRole(userId);
    if (!role) return false;
    for (const perm of role.permissions) {
      if (perm.resource === '*' && perm.actions.includes('admin' as any)) return true;
      if (perm.resource === '*' && perm.actions.includes(action as any)) return true;
      if (perm.resource === resource && perm.actions.includes(action as any)) return true;
    }
    return false;
  }

  // ── Policy Management ──────────────────────────────────────────────────────

  getPolicy(policyId: string): SecurityPolicy | undefined {
    return this.policies.get(policyId);
  }

  updatePolicy(policyId: string, updates: Partial<SecurityPolicy>): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) return false;
    this.policies.set(policyId, { ...policy, ...updates });
    return true;
  }

  getAllPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  // ── Compliance ─────────────────────────────────────────────────────────────

  getComplianceFramework(id: string): ComplianceFramework | undefined {
    return COMPLIANCE_FRAMEWORKS.find(f => f.id === id);
  }

  getApplicableFrameworks(region: string, customerType: string): ComplianceFramework[] {
    return COMPLIANCE_FRAMEWORKS.filter(f =>
      f.applicableRegions.includes(region) &&
      (f.applicableCustomerTypes.includes('*') || f.applicableCustomerTypes.includes(customerType)),
    );
  }

  assessCompliance(org: Organization, region: string): { frameworkId: string; frameworkName: string; overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant'; score: number; requirements: ComplianceRequirement[] }[] {
    const applicable = this.getApplicableFrameworks(region, org.customerType);
    return applicable.map(fw => {
      const met = fw.requirements.filter(r => r.status === 'met').length;
      const total = fw.requirements.filter(r => r.status !== 'not_applicable').length;
      const score = total > 0 ? Math.round(met / total * 100) : 100;
      return {
        frameworkId: fw.id, frameworkName: fw.name,
        overallStatus: score >= 100 ? 'compliant' : score >= 50 ? 'partially_compliant' : 'non_compliant',
        score, requirements: fw.requirements,
      };
    });
  }

  generateComplianceReport(org: Organization, region: string): { id: string; organizationId: string; region: string; assessments: ReturnType<SecurityEngine['assessCompliance']>; generatedAt: string } {
    const assessments = this.assessCompliance(org, region);
    this.log({ actorId: 'system', actorType: 'system', organizationId: org.id, action: 'compliance.report_generated', resourceType: 'compliance_report', resourceId: org.id, details: { region, frameworks: assessments.map(a => a.frameworkId) }, severity: 'info' });
    return { id: `compliance_${org.id}_${Date.now()}`, organizationId: org.id, region, assessments, generatedAt: new Date().toISOString() };
  }
}

export const securityEngine = new SecurityEngine();