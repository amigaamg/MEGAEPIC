// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN LICENSING ENGINE
// No medical rules. Only business logic for license generation,
// validation, enforcement, and module access control.
// ═══════════════════════════════════════════════════════════════════════════════

import { Subscription, License, PlanId, ProductId, SubscriptionStatus } from './business-constitution';

export interface LicenseValidation {
  valid: boolean;
  reason?: string;
  warnings: string[];
  daysUntilExpiry: number;
  moduleAccess: string[];
}

export class LicensingEngine {
  generateLicense(subscription: Subscription): License {
    const key = this.generateKey(subscription);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return {
      id: `lic_${subscription.id}`,
      subscriptionId: subscription.id,
      licenseKey: key,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      moduleAccess: this.computeModuleAccess(subscription),
      maxApiCalls: this.computeApiLimit(subscription),
      apiCallsUsed: 0,
      environment: 'production',
      allowedDomains: [],
    };
  }

  validateLicense(license: License, subscription: Subscription): LicenseValidation {
    const warnings: string[] = [];
    const now = new Date();
    const expiry = new Date(license.expiresAt);
    const daysUntilExpiry = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (subscription.status === 'suspended') {
      return { valid: false, reason: 'Subscription suspended', warnings, daysUntilExpiry: 0, moduleAccess: [] };
    }
    if (subscription.status === 'cancelled') {
      return { valid: false, reason: 'Subscription cancelled', warnings, daysUntilExpiry: 0, moduleAccess: [] };
    }
    if (subscription.status === 'expired') {
      return { valid: false, reason: 'Subscription expired', warnings, daysUntilExpiry: 0, moduleAccess: [] };
    }

    if (daysUntilExpiry < 0) {
      return { valid: false, reason: 'License expired', warnings, daysUntilExpiry: 0, moduleAccess: [] };
    }

    if (daysUntilExpiry < 30) warnings.push(`License expires in ${daysUntilExpiry} days`);
    if (subscription.activeUsers > subscription.maxUsers) warnings.push(`User count (${subscription.activeUsers}) exceeds limit (${subscription.maxUsers})`);
    if (subscription.activeFacilities > subscription.maxFacilities) warnings.push(`Facility count (${subscription.activeFacilities}) exceeds limit (${subscription.maxFacilities})`);
    if (license.apiCallsUsed > license.maxApiCalls * 0.8) warnings.push('API call quota at 80% or higher');

    return {
      valid: true,
      warnings,
      daysUntilExpiry,
      moduleAccess: license.moduleAccess,
    };
  }

  checkModuleAccess(license: License, productId: ProductId): boolean {
    return license.moduleAccess.includes(productId) || license.moduleAccess.includes('*');
  }

  incrementApiUsage(license: License, count: number): License {
    return { ...license, apiCallsUsed: license.apiCallsUsed + count };
  }

  revokeLicense(license: License): License {
    return { ...license, expiresAt: new Date(0).toISOString() };
  }

  private generateKey(subscription: Subscription): string {
    const prefix = 'AMX';
    const orgPart = subscription.organizationId.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    const planPart = subscription.planId.toUpperCase().slice(0, 4);
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const checksum = this.checksum(`${prefix}${orgPart}${planPart}${randomPart}`);
    return `${prefix}-${orgPart}-${planPart}-${randomPart}-${checksum}`;
  }

  private checksum(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) hash = ((hash << 5) - hash) + input.charCodeAt(i);
    return Math.abs(hash).toString(16).toUpperCase().slice(0, 4);
  }

  private computeModuleAccess(subscription: Subscription): string[] {
    const planProducts = PRODUCTS_BY_PLAN[subscription.planId] || [];
    return [...new Set([...planProducts, ...subscription.addonProducts])];
  }

  private computeApiLimit(subscription: Subscription): number {
    const base = subscription.planId === 'enterprise' ? 100000 : subscription.planId === 'government' ? 500000 : 10000;
    return base * (subscription.activeFacilities || 1);
  }
}

const PRODUCTS_BY_PLAN: Record<PlanId, string[]> = {
  starter: ['clinical_os', 'emr', 'telemedicine'],
  professional: ['clinical_os', 'hmis', 'emr', 'telemedicine', 'medical_ai', 'analytics', 'pharmacy', 'laboratory', 'billing', 'inventory'],
  enterprise: ['clinical_os', 'hmis', 'emr', 'telemedicine', 'medical_ai', 'analytics', 'research_platform', 'education_platform', 'marketplace', 'api_access', 'integrations', 'hosting', 'pharmacy', 'laboratory', 'radiology', 'billing', 'inventory', 'payroll', 'hr', 'ambulance', 'government_reporting'],
  education: ['clinical_os', 'education_platform', 'emr', 'telemedicine', 'medical_ai', 'analytics'],
  government: ['clinical_os', 'hmis', 'emr', 'telemedicine', 'analytics', 'government_reporting', 'pharmacy', 'laboratory', 'billing'],
};

export const licensingEngine = new LicensingEngine();