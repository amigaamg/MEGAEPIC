// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN MULTI-TENANT CONSTITUTION
// Tenant isolation, domain routing, data separation, provisioning.
// Pure business logic. No medical rules and no tenant sees another tenant's data.
// ═══════════════════════════════════════════════════════════════════════════════

import { Organization, RegionCode, REGIONS } from './business-constitution';

export type TenantIsolationModel = 'shared_db_schema' | 'shared_db_separate_schema' | 'separate_db' | 'separate_instance';

export interface Tenant {
  id: string;
  organizationId: string;
  subdomain: string;
  customDomain?: string;
  isolationModel: TenantIsolationModel;
  databaseName?: string;
  region: RegionCode;
  status: 'provisioning' | 'active' | 'suspended' | 'decommissioned';
  provisionedAt: string;
  suspendedAt?: string;
  config: TenantConfig;
  allowedIpRanges: string[];
  featureFlags: Record<string, boolean>;
}

export interface TenantConfig {
  maxStorageGb: number;
  maxConcurrentUsers: number;
  maxApiRatePerMinute: number;
  allowedAuthMethods: ('password' | 'sso' | 'oauth' | 'ldap')[];
  sessionTimeoutMinutes: number;
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  maintenanceWindow: { day: string; hour: number; durationMinutes: number };
  allowedOrigins: string[];
}

export interface TenantDomainMapping {
  domain: string;
  tenantId: string;
  sslStatus: 'active' | 'pending' | 'expired';
  verifiedAt: string;
  isPrimary: boolean;
}

export interface TenantResourceQuota {
  storageUsedGb: number;
  storageQuotaGb: number;
  usersCount: number;
  usersQuota: number;
  apiCallsThisMonth: number;
  apiCallsQuota: number;
  facilitiesCount: number;
  facilitiesQuota: number;
  overageAllowed: boolean;
}

export type DataSeparationStrategy = 'by_tenant_id' | 'by_schema' | 'by_database' | 'by_instance';

export const ISOLATION_COSTS: Record<TenantIsolationModel, { monthlyPremium: number; setupFee: number; maxTenants: number }> = {
  shared_db_schema: { monthlyPremium: 0, setupFee: 0, maxTenants: 500 },
  shared_db_separate_schema: { monthlyPremium: 100, setupFee: 200, maxTenants: 100 },
  separate_db: { monthlyPremium: 500, setupFee: 1000, maxTenants: 20 },
  separate_instance: { monthlyPremium: 2000, setupFee: 5000, maxTenants: 5 },
};

export class MultiTenantEngine {
  private tenants: Map<string, Tenant> = new Map();
  private domainMappings: Map<string, TenantDomainMapping> = new Map();
  private resourceQuotas: Map<string, TenantResourceQuota> = new Map();

  provisionTenant(org: Organization, isolationModel: TenantIsolationModel, region: RegionCode, subdomain: string): Tenant {
    const tenant: Tenant = {
      id: `tenant_${org.id}`,
      organizationId: org.id,
      subdomain,
      isolationModel,
      region,
      status: 'active',
      provisionedAt: new Date().toISOString(),
      config: {
        maxStorageGb: 100, maxConcurrentUsers: 500,
        maxApiRatePerMinute: 1000,
        allowedAuthMethods: ['password', 'sso'],
        sessionTimeoutMinutes: 30,
        backupSchedule: 'daily',
        maintenanceWindow: { day: 'sunday', hour: 2, durationMinutes: 120 },
        allowedOrigins: [],
      },
      allowedIpRanges: [],
      featureFlags: {},
    };

    this.tenants.set(tenant.id, tenant);
    this.resourceQuotas.set(tenant.id, {
      storageUsedGb: 0, storageQuotaGb: 100,
      usersCount: 0, usersQuota: 500,
      apiCallsThisMonth: 0, apiCallsQuota: 10000,
      facilitiesCount: 0, facilitiesQuota: org.facilities?.length || 5,
      overageAllowed: isolationModel !== 'shared_db_schema',
    });

    return tenant;
  }

  getTenantByOrgId(organizationId: string): Tenant | undefined {
    for (const tenant of this.tenants.values()) {
      if (tenant.organizationId === organizationId) return tenant;
    }
    return undefined;
  }

  getTenant(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  resolveTenantFromDomain(domain: string): { tenant: Tenant; mapping: TenantDomainMapping } | null {
    const mapping = this.domainMappings.get(domain);
    if (!mapping) return null;
    const tenant = this.tenants.get(mapping.tenantId);
    return tenant ? { tenant, mapping } : null;
  }

  resolveTenantFromSubdomain(subdomain: string): Tenant | null {
    for (const tenant of this.tenants.values()) {
      if (tenant.subdomain === subdomain) return tenant;
    }
    return null;
  }

  registerDomain(tenantId: string, domain: string, isPrimary: boolean): TenantDomainMapping | null {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;
    this.tenants.set(tenantId, { ...tenant, customDomain: domain });

    const mapping: TenantDomainMapping = {
      domain, tenantId, sslStatus: 'pending',
      verifiedAt: new Date().toISOString(), isPrimary,
    };
    this.domainMappings.set(domain, mapping);
    return mapping;
  }

  updateTenantConfig(tenantId: string, config: Partial<TenantConfig>): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    this.tenants.set(tenantId, { ...tenant, config: { ...tenant.config, ...config } });
    return true;
  }

  updateQuota(tenantId: string, updates: Partial<TenantResourceQuota>): boolean {
    const quota = this.resourceQuotas.get(tenantId);
    if (!quota) return false;
    this.resourceQuotas.set(tenantId, { ...quota, ...updates });
    return true;
  }

  getQuota(tenantId: string): TenantResourceQuota | undefined {
    return this.resourceQuotas.get(tenantId);
  }

  suspendTenant(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    this.tenants.set(tenantId, { ...tenant, status: 'suspended', suspendedAt: new Date().toISOString() });
    return true;
  }

  activateTenant(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    this.tenants.set(tenantId, { ...tenant, status: 'active', suspendedAt: undefined });
    return true;
  }

  getIsolationCost(model: TenantIsolationModel): { monthlyPremium: number; setupFee: number; maxTenants: number } {
    return ISOLATION_COSTS[model];
  }

  getDataSeparationStrategy(model: TenantIsolationModel): DataSeparationStrategy {
    const map: Record<TenantIsolationModel, DataSeparationStrategy> = {
      shared_db_schema: 'by_tenant_id',
      shared_db_separate_schema: 'by_schema',
      separate_db: 'by_database',
      separate_instance: 'by_instance',
    };
    return map[model];
  }

  getAllTenants(status?: Tenant['status']): Tenant[] {
    const all = Array.from(this.tenants.values());
    return status ? all.filter(t => t.status === status) : all;
  }

  getTenantCount(): { total: number; active: number; suspended: number; byRegion: Record<string, number>; byModel: Record<string, number> } {
    const all = Array.from(this.tenants.values());
    const byRegion: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    let active = 0, suspended = 0;

    for (const t of all) {
      byRegion[t.region] = (byRegion[t.region] || 0) + 1;
      byModel[t.isolationModel] = (byModel[t.isolationModel] || 0) + 1;
      if (t.status === 'active') active++;
      if (t.status === 'suspended') suspended++;
    }

    return { total: all.length, active, suspended, byRegion, byModel };
  }

  setFeatureFlag(tenantId: string, flag: string, enabled: boolean): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    this.tenants.set(tenantId, {
      ...tenant,
      featureFlags: { ...tenant.featureFlags, [flag]: enabled },
    });
    return true;
  }
}

export const multiTenantEngine = new MultiTenantEngine();