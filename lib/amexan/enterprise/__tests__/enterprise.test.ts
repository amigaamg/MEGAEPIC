import { describe, it, expect, beforeEach } from 'vitest';
import {
  CUSTOMER_TYPES, PRODUCTS, PLANS, getCustomerType, getProduct, getPlan,
  getAvailableProducts, calculatePrice, getRegion, BUILT_IN_DISCOUNT_RULES,
  Organization, Subscription, SubscriptionStatus, TenantSettings, Facility,
} from '@/lib/amexan/enterprise/business-constitution';
import { licensingEngine, LicensingEngine } from '@/lib/amexan/enterprise/licensing-engine';
import { billingEngine, BillingEngine } from '@/lib/amexan/enterprise/billing-engine';
import { marketplaceEngine, MarketplaceEngine, BUILT_IN_EXTENSIONS } from '@/lib/amexan/enterprise/marketplace-engine';
import { customerSuccessEngine } from '@/lib/amexan/enterprise/customer-success-engine';
import { adminDashboardEngine } from '@/lib/amexan/enterprise/admin-dashboard-engine';
import { whiteLabelEngine } from '@/lib/amexan/enterprise/white-label-engine';
import { deploymentEngine } from '@/lib/amexan/enterprise/deployment-engine';
import { supportEngine } from '@/lib/amexan/enterprise/support-engine';
import { analyticsEngine } from '@/lib/amexan/enterprise/analytics-engine';
import { securityEngine } from '@/lib/amexan/enterprise/security-engine';
import { multiTenantEngine } from '@/lib/amexan/enterprise/multi-tenant-engine';
import { growthEngine } from '@/lib/amexan/enterprise/growth-engine';
import { pluginEngine } from '@/lib/amexan/enterprise/plugin-engine';

// ── Business Constitution ──────────────────────────────────────────────────

describe('Business Constitution', () => {
  it('defines all customer types', () => {
    expect(Object.keys(CUSTOMER_TYPES).length).toBeGreaterThanOrEqual(18);
    expect(CUSTOMER_TYPES.hospital.label).toBe('Hospital');
    expect(CUSTOMER_TYPES.individual_student.typicalSegment).toBe('individual');
    expect(CUSTOMER_TYPES.government.requiresContract).toBe(true);
  });

  it('defines all products with pricing', () => {
    expect(Object.keys(PRODUCTS).length).toBeGreaterThanOrEqual(25);
    expect(PRODUCTS.clinical_os.basePrice).toBe(0);
    expect(PRODUCTS.hmis.basePrice).toBe(500);
    expect(PRODUCTS.premium_support.category).toBe('premium');
  });

  it('defines all plans', () => {
    expect(PLANS.enterprise.supportLevel).toBe('premium');
    expect(PLANS.starter.monthlyPrice).toBe(0);
    expect(PLANS.professional.monthlyPrice).toBe(199);
    expect(PLANS.government.supportLevel).toBe('dedicated');
  });

  it('getCustomerType returns correct definition', () => {
    expect(getCustomerType('hospital').maxUsers).toBe(500);
    expect(getCustomerType('unknown' as any).id).toBe('individual_doctor');
  });

  it('getProduct returns correct definition', () => {
    expect(getProduct('telemedicine').basePrice).toBe(100);
    expect(getProduct('unknown' as any).id).toBe('clinical_os');
  });

  it('getPlan returns correct plan', () => {
    expect(getPlan('professional').maxUsers).toBe(50);
    expect(getPlan('unknown' as any).id).toBe('starter');
  });

  it('getAvailableProducts filters by customer segment', () => {
    const individualProducts = getAvailableProducts('individual_doctor');
    expect(individualProducts.length).toBeGreaterThan(0);
  });

  it('calculatePrice returns correct pricing', () => {
    const price = calculatePrice('professional', ['pharmacy'], 10, 1, 'monthly');
    expect(price.basePrice).toBe(199);
    expect(price.addonProducts.length).toBe(1);
    expect(price.currency).toBe('KES');
    expect(price.totalMonthly).toBeGreaterThan(0);
  });

  it('calculatePrice applies annual discount', () => {
    const monthly = calculatePrice('professional', [], 5, 1, 'monthly');
    const annual = calculatePrice('professional', [], 5, 1, 'annual');
    expect(annual.totalAnnual).toBeLessThan(monthly.totalMonthly * 12);
  });

  it('calculatePrice supports regional pricing', () => {
    const kenya = calculatePrice('professional', [], 10, 1, 'monthly', { region: 'ke' });
    const nigeria = calculatePrice('professional', [], 10, 1, 'monthly', { region: 'ng' });
    expect(nigeria.totalMonthly).toBeLessThan(kenya.totalMonthly);
    expect(nigeria.currency).toBe('NGN');
    expect(kenya.currency).toBe('KES');
  });

  it('calculatePrice applies taxes per region', () => {
    const ke = calculatePrice('professional', [], 5, 1, 'monthly', { region: 'ke' });
    expect(ke.taxRate).toBe(0.16);
    expect(ke.taxLabel).toBe('VAT 16%');
    expect(ke.taxAmount).toBeGreaterThan(0);

    const us = calculatePrice('professional', [], 5, 1, 'monthly', { region: 'us' });
    expect(us.taxRate).toBe(0);
    expect(us.taxAmount).toBe(0);
  });

  it('calculatePrice applies discount rules', () => {
    const price = calculatePrice('professional', [], 55, 1, 'monthly', {
      region: 'ke',
      discountRules: BUILT_IN_DISCOUNT_RULES.filter(r => r.id === 'disc_volume_50'),
    });
    expect(price.appliedDiscounts.length).toBeGreaterThanOrEqual(1);
    expect(price.discountTotal).toBeGreaterThan(0);
  });

  it('calculatePrice applies promo code discount', () => {
    const price = calculatePrice('professional', [], 5, 1, 'monthly', {
      region: 'ke', promoCode: 'EARLY2026',
      discountRules: BUILT_IN_DISCOUNT_RULES,
    });
    expect(price.appliedDiscounts.some(d => d.ruleId === 'disc_early_2026')).toBe(true);
  });

  it('getRegion returns correct region', () => {
    expect(getRegion('ke').currency).toBe('KES');
    expect(getRegion('us').pricingMultiplier).toBe(2.0);
    expect(getRegion('uk').taxRate).toBe(0.2);
    expect(getRegion('invalid' as any).code).toBe('other');
  });
});

// ── Licensing Engine ────────────────────────────────────────────────────────

describe('Licensing Engine', () => {
  const mockSub: Subscription = {
    id: 'sub_001', organizationId: 'HOSP_001', customerType: 'hospital',
    planId: 'enterprise', addonProducts: ['pharmacy', 'laboratory'],
    status: 'active', startDate: '2026-01-01', renewalDate: '2027-01-01',
    maxUsers: 500, maxFacilities: 5, activeUsers: 120, activeFacilities: 3,
    pricePerMonth: 1999, billingCycle: 'monthly', gracePeriodDays: 30, autoRenew: true,
    metadata: {},
  };

  it('generates a valid license key', () => {
    const license = licensingEngine.generateLicense(mockSub);
    expect(license.licenseKey).toMatch(/^AMX-/);
    expect(license.moduleAccess).toContain('pharmacy');
    expect(license.moduleAccess).toContain('laboratory');
  });

  it('validates an active license', () => {
    const license = licensingEngine.generateLicense(mockSub);
    const validation = licensingEngine.validateLicense(license, mockSub);
    expect(validation.valid).toBe(true);
    expect(validation.moduleAccess.length).toBeGreaterThan(0);
  });

  it('rejects suspended subscription', () => {
    const license = licensingEngine.generateLicense(mockSub);
    const validation = licensingEngine.validateLicense(license, { ...mockSub, status: 'suspended' });
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('suspended');
  });

  it('rejects cancelled subscription', () => {
    const license = licensingEngine.generateLicense(mockSub);
    const validation = licensingEngine.validateLicense(license, { ...mockSub, status: 'cancelled' });
    expect(validation.valid).toBe(false);
  });

  it('checks module access', () => {
    const license = licensingEngine.generateLicense(mockSub);
    expect(licensingEngine.checkModuleAccess(license, 'pharmacy')).toBe(true);
    expect(licensingEngine.checkModuleAccess(license, 'extras' as any)).toBe(false);
  });

  it('increments API usage', () => {
    const license = licensingEngine.generateLicense(mockSub);
    const updated = licensingEngine.incrementApiUsage(license, 5);
    expect(updated.apiCallsUsed).toBe(5);
  });

  it('revokes a license', () => {
    const license = licensingEngine.generateLicense(mockSub);
    const revoked = licensingEngine.revokeLicense(license);
    expect(new Date(revoked.expiresAt).getTime()).toBe(0);
  });

  it('warns when nearing limits', () => {
    const license = licensingEngine.generateLicense(mockSub);
    const validation = licensingEngine.validateLicense(license, { ...mockSub, activeUsers: 501, activeFacilities: 6 });
    expect(validation.warnings.length).toBeGreaterThanOrEqual(2);
  });
});

// ── Billing Engine ──────────────────────────────────────────────────────────

describe('Billing Engine', () => {
  const mockSub: Subscription = {
    id: 'sub_002', organizationId: 'HOSP_002', customerType: 'hospital',
    planId: 'professional', addonProducts: ['pharmacy'],
    status: 'active', startDate: '2026-01-01', renewalDate: '2026-02-01',
    maxUsers: 50, maxFacilities: 3, activeUsers: 10, activeFacilities: 2,
    pricePerMonth: 199, billingCycle: 'monthly', gracePeriodDays: 30, autoRenew: true,
    metadata: {},
  };

  it('creates an invoice', () => {
    const invoice = billingEngine.createInvoice(mockSub, new Date('2026-01-01'), new Date('2026-01-31'));
    expect(invoice.subscriptionId).toBe('sub_002');
    expect(invoice.lineItems.length).toBeGreaterThan(0);
    expect(invoice.total).toBeGreaterThan(0);
  });

  it('processes lifecycle events', () => {
    const created = billingEngine.processLifecycleEvent(mockSub, { type: 'created', subscriptionId: 'sub_002', timestamp: new Date().toISOString() });
    expect(created.status).toBe('trial');
    expect(created.trialEndDate).toBeTruthy();

    const renewed = billingEngine.processLifecycleEvent(created, { type: 'renewed', subscriptionId: 'sub_002', timestamp: new Date().toISOString() });
    expect(renewed.status).toBe('active');

    const upgraded = billingEngine.processLifecycleEvent(renewed, { type: 'upgraded', subscriptionId: 'sub_002', timestamp: new Date().toISOString(), newPlan: 'enterprise' });
    expect(upgraded.planId).toBe('enterprise');

    const cancelled = billingEngine.processLifecycleEvent(upgraded, { type: 'cancelled', subscriptionId: 'sub_002', timestamp: new Date().toISOString() });
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.autoRenew).toBe(false);
  });

  it('calculates renewal date', () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const subWithFutureRenewal = { ...mockSub, renewalDate: futureDate };
    const next = billingEngine.getRenewalDate(subWithFutureRenewal);
    expect(new Date(next) > new Date()).toBe(true);
  });

  it('validates plan upgrades', () => {
    expect(billingEngine.canUpgrade('starter', 'professional')).toBe(true);
    expect(billingEngine.canUpgrade('professional', 'starter')).toBe(false);
    expect(billingEngine.canUpgrade('enterprise', 'government')).toBe(true);
  });

  it('estimates MRR and ARR', () => {
    const subs = [
      { ...mockSub, status: 'active', pricePerMonth: 199 },
      { ...mockSub, id: 'sub_003', status: 'active', pricePerMonth: 1999 },
      { ...mockSub, id: 'sub_004', status: 'trial', pricePerMonth: 0 },
    ] as Subscription[];

    const mrr = billingEngine.estimateMonthlyRevenue(subs);
    expect(mrr).toBeGreaterThan(0);

    const arr = billingEngine.estimateARR(subs);
    expect(arr).toBe(mrr * 12);
  });

  it('identifies at-risk subscriptions', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const atRisk = billingEngine.getAtRiskSubscriptions([
      { ...mockSub, status: 'past_due' },
      { ...mockSub, id: 'sub_005', status: 'trial', trialEndDate: future.toISOString() },
      { ...mockSub, id: 'sub_006', status: 'active' },
    ] as Subscription[]);

    expect(atRisk.length).toBe(2);
  });
});

// ── Marketplace Engine ─────────────────────────────────────────────────────

describe('Marketplace Engine', () => {
  beforeEach(() => {
    marketplaceEngine.registerBatch(BUILT_IN_EXTENSIONS);
  });

  it('registers and retrieves extensions', () => {
    const ext = marketplaceEngine.getExtension('ext_radiology_ai');
    expect(ext).toBeDefined();
    expect(ext!.name).toBe('Radiology AI Assistant');
  });

  it('searches extensions by type', () => {
    const results = marketplaceEngine.search({ type: 'connector' });
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('searches extensions by category', () => {
    const results = marketplaceEngine.search({ category: 'radiology' });
    expect(results.length).toBeGreaterThan(0);
  });

  it('searches extensions by tag', () => {
    const results = marketplaceEngine.search({ tag: 'kenya' });
    expect(results.length).toBeGreaterThan(0);
  });

  it('searches free extensions', () => {
    const results = marketplaceEngine.search({ pricing: 'free' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].price).toBe(0);
  });

  it('installs and uninstalls extensions', () => {
    const installed = marketplaceEngine.install('org_001', 'ext_radiology_ai');
    expect(installed).not.toBeNull();
    expect(installed!.enabled).toBe(true);

    const list = marketplaceEngine.getInstalled('org_001');
    expect(list.length).toBe(1);

    const uninstalled = marketplaceEngine.uninstall('org_001', 'ext_radiology_ai');
    expect(uninstalled).toBe(true);
    expect(marketplaceEngine.getInstalled('org_001').length).toBe(0);
  });

  it('toggles extension enabled state', () => {
    marketplaceEngine.install('org_002', 'ext_dental');
    marketplaceEngine.toggleExtension('org_002', 'ext_dental', false);
    const installed = marketplaceEngine.getInstalled('org_002');
    expect(installed[0].enabled).toBe(false);
  });

  it('updates extension config', () => {
    marketplaceEngine.install('org_003', 'ext_dental');
    marketplaceEngine.updateConfig('org_003', 'ext_dental', { apiKey: 'test-key' });
    const installed = marketplaceEngine.getInstalled('org_003');
    expect(installed[0].config.apiKey).toBe('test-key');
  });

  it('increments usage count', () => {
    marketplaceEngine.install('org_004', 'ext_dental');
    marketplaceEngine.incrementUsage('org_004', 'ext_dental');
    marketplaceEngine.incrementUsage('org_004', 'ext_dental');
    const installed = marketplaceEngine.getInstalled('org_004');
    expect(installed[0].usageCount).toBe(2);
  });

  it('returns catalog stats', () => {
    const stats = marketplaceEngine.getCatalogStats();
    expect(stats.total).toBeGreaterThanOrEqual(6);
    expect(Object.keys(stats.byType).length).toBeGreaterThan(0);
  });
});

// ── Customer Success Engine ─────────────────────────────────────────────────

describe('Customer Success Engine', () => {
  const mockOrg: Organization = {
    id: 'org_001', name: 'Test Hospital', customerType: 'hospital',
    facilities: [
      { id: 'fac_001', name: 'Main Campus', type: 'hospital', region: 'Nairobi', active: true, deploymentStatus: 'active' },
      { id: 'fac_002', name: 'Annex', type: 'clinic', region: 'Nairobi', active: true, deploymentStatus: 'training' },
    ],
    users: [
      { id: 'u1', name: 'Dr A', email: 'a@test.com', role: 'doctor', active: true, modulesUsed: ['hmis', 'pharmacy', 'laboratory'] },
      { id: 'u2', name: 'Nurse B', email: 'b@test.com', role: 'nurse', active: true, modulesUsed: ['hmis'] },
    ],
    settings: { primaryColor: '#2563eb', secondaryColor: '#4f46e5', language: 'en', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY' },
    createdAt: '2026-01-01', updatedAt: '2026-06-01',
  };

  const mockSub: Subscription = {
    id: 'sub_001', organizationId: 'org_001', customerType: 'hospital',
    planId: 'enterprise', addonProducts: ['pharmacy', 'laboratory', 'radiology'],
    status: 'active', startDate: '2026-01-01', renewalDate: '2027-01-01',
    maxUsers: 500, maxFacilities: 5, activeUsers: 120, activeFacilities: 2,
    pricePerMonth: 1999, billingCycle: 'monthly', gracePeriodDays: 30, autoRenew: true,
    metadata: {},
  };

  it('computes health score', () => {
    const score = customerSuccessEngine.computeHealthScore(mockOrg, mockSub, 5, 8);
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.categories.usage).toBeGreaterThan(0);
    expect(score.risk).toMatch(/^(low|medium|high|critical)$/);
  });

  it('computes feature adoption', () => {
    const adoption = customerSuccessEngine.computeFeatureAdoption(mockSub, mockOrg);
    expect(adoption.length).toBeGreaterThan(0);
    expect(adoption[0].totalUsers).toBe(2);
  });

  it('computes deployment progress', () => {
    const progress = customerSuccessEngine.computeDeploymentProgress(mockOrg, 'fac_001');
    expect(progress).not.toBeNull();
    expect(progress!.completion).toBe(100);

    const progress2 = customerSuccessEngine.computeDeploymentProgress(mockOrg, 'fac_002');
    expect(progress2).not.toBeNull();
    expect(progress2!.completion).toBeLessThan(100);
  });

  it('predicts churn risk', () => {
    const score = customerSuccessEngine.computeHealthScore(mockOrg, mockSub, 5, 8);
    const predictions = customerSuccessEngine.predictChurnRisk([score]);
    expect(predictions.length).toBe(1);
    expect(predictions[0].daysToChurn).toBeGreaterThan(0);
  });

  it('detects engagement trends', () => {
    expect(customerSuccessEngine.getEngagementTrend([5, 5, 5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 10, 10])).toBe('rising');
    expect(customerSuccessEngine.getEngagementTrend([10, 10, 10, 10, 10, 10, 10, 5, 5, 5, 5, 5, 5, 5])).toBe('declining');
    expect(customerSuccessEngine.getEngagementTrend([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5])).toBe('stable');
  });
});

// ── Admin Dashboard Engine ──────────────────────────────────────────────────

describe('Admin Dashboard Engine', () => {
  const mockSubs: Subscription[] = [
    { id: 's1', organizationId: 'o1', customerType: 'hospital', planId: 'enterprise', addonProducts: [], status: 'active', startDate: '2026-01-01', renewalDate: '2027-01-01', maxUsers: 500, maxFacilities: 5, activeUsers: 100, activeFacilities: 3, pricePerMonth: 1999, billingCycle: 'monthly', gracePeriodDays: 30, autoRenew: true, metadata: {} },
    { id: 's2', organizationId: 'o2', customerType: 'clinic', planId: 'professional', addonProducts: [], status: 'active', startDate: '2026-03-01', renewalDate: '2026-04-01', maxUsers: 50, maxFacilities: 3, activeUsers: 10, activeFacilities: 1, pricePerMonth: 199, billingCycle: 'monthly', gracePeriodDays: 30, autoRenew: true, metadata: {} },
    { id: 's3', organizationId: 'o3', customerType: 'individual_doctor', planId: 'starter', addonProducts: [], status: 'trial', startDate: '2026-06-01', renewalDate: '2026-07-01', maxUsers: 5, maxFacilities: 1, activeUsers: 1, activeFacilities: 0, pricePerMonth: 0, billingCycle: 'monthly', gracePeriodDays: 14, autoRenew: false, metadata: {} },
  ];

  it('computes sales dashboard', () => {
    const sales = adminDashboardEngine.computeSalesDashboard(mockSubs);
    expect(sales.trialsActive).toBe(1);
    expect(sales.conversionRate).toBeGreaterThan(0);
  });

  it('computes financial dashboard', () => {
    const finance = adminDashboardEngine.computeFinancialDashboard(mockSubs);
    expect(finance.mrr).toBeGreaterThan(0);
    expect(finance.arr).toBe(finance.mrr * 12);
    expect(finance.revenueByPlan.enterprise).toBe(1999);
  });

  it('computes infrastructure dashboard', () => {
    const infra = adminDashboardEngine.computeInfrastructureDashboard();
    expect(infra.apiHealth).toBeGreaterThan(99);
    expect(infra.backupStatus).toBe('healthy');
  });

  it('computes growth metrics', () => {
    const growth = adminDashboardEngine.computeGrowthMetrics(mockSubs, 10);
    expect(growth.netRetentionRate).toBeGreaterThan(1);
  });

  it('identifies at-risk customers', () => {
    const scores = [
      { organizationId: 'o1', overall: 25, categories: { usage: 20, adoption: 30, support: 20, engagement: 30, deployment: 25 }, risk: 'critical' as const, flags: [], lastComputed: '' },
      { organizationId: 'o2', overall: 85, categories: { usage: 90, adoption: 80, support: 90, engagement: 80, deployment: 85 }, risk: 'low' as const, flags: [], lastComputed: '' },
    ];
    const atRisk = adminDashboardEngine.identifyAtRiskCustomers(scores);
    expect(atRisk.length).toBe(1);
    expect(atRisk[0].organizationId).toBe('o1');
  });

  it('gets plan distribution', () => {
    const dist = adminDashboardEngine.getPlanDistribution(mockSubs);
    expect(dist.enterprise).toBe(1);
    expect(dist.professional).toBe(1);
    expect(dist.starter).toBe(1);
  });

  it('gets segment breakdown', () => {
    const orgs: Organization[] = [
      { id: 'o1', name: 'Hospital A', customerType: 'hospital', facilities: [], users: [], settings: {} as any, createdAt: '', updatedAt: '' },
      { id: 'o2', name: 'Clinic B', customerType: 'clinic', facilities: [], users: [], settings: {} as any, createdAt: '', updatedAt: '' },
      { id: 'o3', name: 'Doctor C', customerType: 'individual_doctor', facilities: [], users: [], settings: {} as any, createdAt: '', updatedAt: '' },
    ];
    const breakdown = adminDashboardEngine.getSegmentBreakdown(orgs);
    expect(breakdown.hospital).toBe(1);
    expect(breakdown.clinic).toBe(1);
    expect(breakdown.individual_doctor).toBe(1);
  });
});

// ── White Label Engine ──────────────────────────────────────────────────────

describe('White Label Engine', () => {
  const mockOrg: Organization = {
    id: 'org_white', name: 'White Label Hospital', customerType: 'hospital',
    facilities: [], users: [],
    settings: {
      logoUrl: 'https://example.com/logo.png',
      primaryColor: '#ff0000', secondaryColor: '#00ff00',
      language: 'sw', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY',
      domain: 'white-label.com',
    },
    createdAt: '', updatedAt: '',
  };

  it('gets branding from settings', () => {
    const branding = whiteLabelEngine.getBranding(mockOrg.settings);
    expect(branding.primaryColor).toBe('#ff0000');
    expect(branding.secondaryColor).toBe('#00ff00');
    expect(branding.layout).toBe('sidebar');
  });

  it('generates CSS variables', () => {
    const branding = whiteLabelEngine.getBranding(mockOrg.settings);
    const vars = whiteLabelEngine.getCSSVariables(branding);
    expect(vars['--brand-primary']).toBe('#ff0000');
    expect(vars['--brand-radius']).toBe('8px');
  });

  it('returns domain config', () => {
    const config = whiteLabelEngine.getDomainConfig(mockOrg);
    expect(config.customLoginPage).toBe(true);
  });

  it('returns supported languages', () => {
    const langs = whiteLabelEngine.getSupportedLanguages();
    expect(langs.length).toBeGreaterThanOrEqual(5);
    expect(langs.some(l => l.code === 'sw')).toBe(true);
    expect(langs.some(l => l.isRTL)).toBe(true);
  });

  it('returns null for unsupported language', () => {
    expect(whiteLabelEngine.getLanguagePack('xx')).toBeNull();
  });

  it('applies tenant overrides', () => {
    const overrides = whiteLabelEngine.applyTenantOverrides(mockOrg, 'LoginPage');
    expect(overrides.primaryColor).toBe('#ff0000');
    expect(overrides.timezone).toBe('Africa/Nairobi');
  });

  it('returns date format by locale', () => {
    expect(whiteLabelEngine.getDateFormat('en')).toBe('MM/DD/YYYY');
    expect(whiteLabelEngine.getDateFormat('sw')).toBe('DD/MM/YYYY');
  });

  it('returns currency by locale', () => {
    expect(whiteLabelEngine.getCurrency('en_KE')).toBe('KES');
    expect(whiteLabelEngine.getCurrency('en_US')).toBe('USD');
  });
});

// ── End-to-End Enterprise Pipeline ─────────────────────────────────────────

describe('Enterprise Pipeline End-to-End', () => {
  it('customer → subscription → license → invoice → health', () => {
    const customerType = 'hospital';
    const customer = getCustomerType(customerType as any);
    expect(customer.maxUsers).toBe(500);

    const plan = PLANS.enterprise;
    expect(plan.monthlyPrice).toBe(1999);

    const price = calculatePrice('enterprise', ['pharmacy', 'laboratory'], 100, 3, 'monthly');
    expect(price.totalMonthly).toBeGreaterThan(0);

    const subscription: Subscription = {
      id: 'ep_sub_001', organizationId: 'EP_ORG', customerType: 'hospital',
      planId: 'enterprise', addonProducts: ['pharmacy', 'laboratory'],
      status: 'active', startDate: '2026-01-01', renewalDate: '2027-01-01',
      maxUsers: 500, maxFacilities: 5, activeUsers: 80, activeFacilities: 2,
      pricePerMonth: price.totalMonthly, billingCycle: 'monthly',
      gracePeriodDays: 30, autoRenew: true, metadata: {},
    };

    const license = licensingEngine.generateLicense(subscription);
    expect(license.moduleAccess).toContain('pharmacy');

    const validation = licensingEngine.validateLicense(license, subscription);
    expect(validation.valid).toBe(true);

    const invoice = billingEngine.createInvoice(subscription, new Date('2026-01-01'), new Date('2026-01-31'));
    expect(invoice.total).toBeGreaterThan(0);

    const org: Organization = {
      id: 'EP_ORG', name: 'End-to-End Hospital', customerType: 'hospital',
      facilities: [{ id: 'fac_ep', name: 'Main', type: 'hospital', region: 'Nairobi', active: true, deploymentStatus: 'active' }],
      users: [{ id: 'u_ep', name: 'Dr EP', email: 'ep@test.com', role: 'doctor', active: true, lastLogin: new Date().toISOString(), modulesUsed: ['hmis', 'pharmacy'] }],
      settings: { primaryColor: '#2563eb', secondaryColor: '#4f46e5', language: 'en', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY' },
      createdAt: '2026-01-01', updatedAt: '2026-06-01',
    };

    const health = customerSuccessEngine.computeHealthScore(org, subscription, 3, 10);
    expect(health.overall).toBeGreaterThan(0);

    const sales = adminDashboardEngine.computeSalesDashboard([subscription]);
    expect(sales.pipelineValue).toBeGreaterThanOrEqual(0);
  });

  it('full marketplace lifecycle', () => {
    marketplaceEngine.registerBatch(BUILT_IN_EXTENSIONS);

    const installed = marketplaceEngine.install('org_market', 'ext_kenya_moh');
    expect(installed).not.toBeNull();

    marketplaceEngine.updateConfig('org_market', 'ext_kenya_moh', { dhis2Url: 'https://dhis2.health.go.ke' });
    const config = marketplaceEngine.getInstalled('org_market')[0].config;
    expect(config.dhis2Url).toBe('https://dhis2.health.go.ke');

    const searchResults = marketplaceEngine.search({ tag: 'compliance' });
    expect(searchResults.length).toBeGreaterThan(0);
  });

  it('white label + branding pipeline', () => {
    const org: Organization = {
      id: 'wl_org', name: 'WL Hospital', customerType: 'hospital',
      facilities: [], users: [],
      settings: { primaryColor: '#ff6600', secondaryColor: '#0066ff', language: 'fr', timezone: 'Europe/Paris', currency: 'EUR', dateFormat: 'DD/MM/YYYY', domain: 'wl-hospital.fr' },
      createdAt: '', updatedAt: '',
    };

    const branding = whiteLabelEngine.getBranding(org.settings);
    const vars = whiteLabelEngine.getCSSVariables(branding);
    expect(vars['--brand-primary']).toBe('#ff6600');
    expect(whiteLabelEngine.getDateFormat('fr')).toBe('DD/MM/YYYY');
    expect(whiteLabelEngine.getCurrency('en_US')).toBe('USD');
  });
});

// ── Deployment Engine ─────────────────────────────────────────────────────────

describe('Deployment Engine', () => {
  const mockOrg: Organization = {
    id: 'dep_org', name: 'Deploy Hospital', customerType: 'hospital',
    facilities: [
      { id: 'fac_d1', name: 'Main', type: 'hospital', region: 'Nairobi', active: true, deploymentStatus: 'onboarding' },
      { id: 'fac_d2', name: 'Branch', type: 'clinic', region: 'Mombasa', active: true, deploymentStatus: 'onboarding' },
    ],
    users: [], settings: { primaryColor: '#2563eb', secondaryColor: '#4f46e5', language: 'en', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY' },
    createdAt: '', updatedAt: '',
  };

  it('creates an implementation project', () => {
    const project = deploymentEngine.createProject(mockOrg, mockOrg.facilities, 'PM Alice');
    expect(project.organizationId).toBe('dep_org');
    expect(project.currentPhase).toBe('infrastructure_assessment');
    expect(project.phases.length).toBe(8);
    expect(project.status).toBe('in_progress');
  });

  it('advances through project phases', () => {
    const project = deploymentEngine.createProject(mockOrg, mockOrg.facilities, 'PM Bob');
    const advanced = deploymentEngine.advancePhase(project);
    expect(advanced.currentPhase).toBe('migration');
    expect(advanced.phases[0].completion).toBe(100);
  });

  it('completes individual tasks', () => {
    let project = deploymentEngine.createProject(mockOrg, mockOrg.facilities, 'PM Carol');
    const taskId = project.phases[1].tasks[0].id;
    project = deploymentEngine.completeTask(project, 'infrastructure_assessment', taskId);
    expect(project.phases[1].tasks[0].completed).toBe(true);
    expect(project.phases[1].completion).toBeGreaterThan(0);
  });

  it('adds and resolves blockers', () => {
    let project = deploymentEngine.createProject(mockOrg, mockOrg.facilities, 'PM Dave');
    project = deploymentEngine.addBlocker(project, { description: 'No internet', category: 'infrastructure', severity: 'critical', status: 'open', notes: '' });
    expect(project.blockers.length).toBe(1);
    expect(project.blockers[0].severity).toBe('critical');

    project = deploymentEngine.resolveBlocker(project, project.blockers[0].id);
    expect(project.blockers[0].status).toBe('resolved');
  });

  it('returns infrastructure checklist by facility type', () => {
    const hospitalChecks = deploymentEngine.getInfrastructureChecklist('hospital');
    expect(hospitalChecks.length).toBeGreaterThanOrEqual(5);
    expect(hospitalChecks.some(c => c.category === 'server')).toBe(true);

    const clinicChecks = deploymentEngine.getInfrastructureChecklist('clinic');
    expect(clinicChecks.length).toBeLessThan(hospitalChecks.length);
  });

  it('estimates timeline based on scope', () => {
    const basic = deploymentEngine.estimateTimeline(1, 'basic');
    expect(basic.minDays).toBeGreaterThan(0);
    expect(basic.maxDays).toBeGreaterThan(basic.minDays);

    const full = deploymentEngine.estimateTimeline(1, 'full');
    expect(full.maxDays).toBeGreaterThan(basic.maxDays);
  });

  it('computes project health', () => {
    const project = deploymentEngine.createProject(mockOrg, mockOrg.facilities, 'PM Eve');
    const health = deploymentEngine.getProjectHealth(project);
    expect(health.status).toMatch(/^(on_track|at_risk|delayed)$/);
    expect(health.overallCompletion).toBeGreaterThan(0);
  });
});

// ── Support Engine ────────────────────────────────────────────────────────────

describe('Support Engine', () => {
  it('creates a support ticket', () => {
    const ticket = supportEngine.createTicket({
      organizationId: 'org_sup', userId: 'user_1', subject: 'Login issue', description: 'Cannot log in',
      category: 'technical', priority: 'high', status: 'new',
      assignedTo: undefined, tags: ['login'], attachments: [], linkedTicketIds: [],
      satisfactionRating: undefined,
    });
    expect(ticket.id).toMatch(/^TKT-/);
    expect(ticket.slaDeadline).toBeTruthy();
    expect(ticket.priority).toBe('high');
  });

  it('updates and assigns a ticket', () => {
    const ticket = supportEngine.createTicket({
      organizationId: 'org_sup', userId: 'user_2', subject: 'Bug in billing', description: '',
      category: 'billing', priority: 'critical', status: 'new',
      tags: [], attachments: [], linkedTicketIds: [],
    });

    const assigned = supportEngine.assignTicket(ticket.id, 'agent_1');
    expect(assigned).not.toBeNull();
    expect(assigned!.assignedTo).toBe('agent_1');
    expect(assigned!.status).toBe('assigned');
  });

  it('adds comments to tickets', () => {
    const ticket = supportEngine.createTicket({
      organizationId: 'org_sup', userId: 'user_3', subject: 'Need training', description: '',
      category: 'training', priority: 'medium', status: 'new',
      tags: [], attachments: [], linkedTicketIds: [],
    });

    supportEngine.addComment({ ticketId: ticket.id, authorId: 'agent_2', authorRole: 'agent', body: 'We will schedule training', isInternal: false, attachments: [] });
    const comments = supportEngine.getComments(ticket.id);
    expect(comments.length).toBe(1);
    expect(comments[0].body).toContain('schedule training');
  });

  it('searches tickets by various criteria', () => {
    supportEngine.createTicket({
      organizationId: 'org_search', userId: 'u1', subject: 'Critical bug', description: '',
      category: 'bug_report', priority: 'critical', status: 'new',
      tags: ['urgent'], attachments: [], linkedTicketIds: [],
    });
    supportEngine.createTicket({
      organizationId: 'org_search', userId: 'u2', subject: 'Feature request', description: '',
      category: 'feature_request', priority: 'low', status: 'new',
      tags: ['enhancement'], attachments: [], linkedTicketIds: [],
    });

    const criticalTickets = supportEngine.searchTickets({ priority: 'critical' });
    expect(criticalTickets.length).toBeGreaterThanOrEqual(1);

    const bugReports = supportEngine.searchTickets({ category: 'bug_report' });
    expect(bugReports.length).toBeGreaterThanOrEqual(1);
  });

  it('detects SLA breaches', () => {
    const ticket = supportEngine.createTicket({
      organizationId: 'gov_org', userId: 'u1', subject: 'Emergency', description: '',
      category: 'technical', priority: 'critical', status: 'new',
      tags: [], attachments: [], linkedTicketIds: [],
    });
    const breached = supportEngine.checkSLABreaches();
    expect(Array.isArray(breached)).toBe(true);
  });

  it('returns SLA definition by plan', () => {
    const sla = supportEngine.getSLADefinition('enterprise');
    expect(sla.firstResponse).toBe(2);
    expect(sla.channels).toContain('phone');
    expect(sla.supportHours).toBe('24_7');
  });

  it('creates and searches knowledge articles', () => {
    const article = supportEngine.createArticle({
      title: 'How to reset password', slug: 'reset-password', summary: 'Password reset guide',
      body: 'Go to settings and click reset.', category: 'technical',
      tags: ['password', 'account'], published: true,
    });
    expect(article.id).toMatch(/^KB-/);

    const results = supportEngine.searchArticles({ searchText: 'password' });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('tracks article views and feedback', () => {
    const article = supportEngine.createArticle({
      title: 'Test Article', slug: 'test', summary: 'test', body: 'test body',
      category: 'technical', tags: [], published: true,
    });

    supportEngine.recordArticleView(article.id);
    supportEngine.recordArticleView(article.id);
    supportEngine.recordArticleFeedback(article.id, true);
    supportEngine.recordArticleFeedback(article.id, false);

    const results = supportEngine.searchArticles({ searchText: 'Test' });
    expect(results[0].viewCount).toBe(2);
    expect(results[0].helpfulCount).toBe(1);
    expect(results[0].notHelpfulCount).toBe(1);
  });

  it('returns support stats', () => {
    const stats = supportEngine.getSupportStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.avgResolutionHours).toBe('number');
  });
});

// ── Analytics Engine ─────────────────────────────────────────────────────────

describe('Analytics Engine', () => {
  it('records and retrieves disease trends', () => {
    analyticsEngine.recordDiseaseTrend({
      diseaseName: 'Malaria', region: 'Nairobi', icdCode: 'B50', period: '2026-06',
      totalCases: 450, ageGroups: [{ group: '0-5', count: 120 }, { group: '6-18', count: 180 }, { group: '19+', count: 150 }],
      genderDistribution: { male: 200, female: 250, other: 0 },
      regionalBreakdown: { Nairobi: 150, Kisumu: 200, Mombasa: 100 },
      mortalityRate: 0.02, averageLos: 3.5, comparedToPrevious: 15, trend: 'rising',
    });

    const trends = analyticsEngine.getDiseaseTrends('Malaria');
    expect(trends.length).toBeGreaterThanOrEqual(1);
    expect(trends[0].totalCases).toBe(450);
  });

  it('detects outbreaks based on case thresholds', () => {
    const alerts = analyticsEngine.detectOutbreak('Kisumu', [
      { diseaseName: 'Cholera', currentCases: 150, expectedBaseline: 30 },
      { diseaseName: 'Malaria', currentCases: 80, expectedBaseline: 60 },
    ]);

    expect(alerts.length).toBeGreaterThanOrEqual(1);
    expect(alerts.some(a => a.severity === 'outbreak')).toBe(true);
    expect(alerts.some(a => a.severity === 'watch')).toBe(true);
  });

  it('resolves active alerts', () => {
    analyticsEngine.detectOutbreak('Nairobi', [
      { diseaseName: 'Dengue', currentCases: 100, expectedBaseline: 40 },
    ]);

    const active = analyticsEngine.getActiveAlerts('Nairobi');
    expect(active.length).toBeGreaterThanOrEqual(1);

    const resolved = analyticsEngine.resolveAlert(active[0].id);
    expect(resolved).toBe(true);

    const stillActive = analyticsEngine.getActiveAlerts('Nairobi');
    expect(stillActive.find(a => a.id === active[0].id)).toBeUndefined();
  });

  it('records and retrieves benchmarks', () => {
    analyticsEngine.recordBenchmarks('org_bench', [
      { organizationId: 'org_bench', facilityId: 'fac_1', metric: 'bed_occupancy', value: 85, percentile: 70, peerAverage: 75, peerMin: 40, peerMax: 98, rating: 'good' },
      { organizationId: 'org_bench2', facilityId: 'fac_2', metric: 'bed_occupancy', value: 92, percentile: 90, peerAverage: 75, peerMin: 40, peerMax: 98, rating: 'excellent' },
    ]);

    const benchmarks = analyticsEngine.getPeerBenchmarks('bed_occupancy');
    expect(benchmarks.length).toBeGreaterThanOrEqual(2);
  });

  it('computes aggregate statistics', () => {
    const agg = analyticsEngine.computeAggregates([10, 20, 30, 40, 50]);
    expect(agg.average).toBe(30);
    expect(agg.median).toBe(30);
    expect(agg.min).toBe(10);
    expect(agg.max).toBe(50);
    expect(agg.total).toBe(150);
  });

  it('generates an analytics report', () => {
    const report = analyticsEngine.generateReport('Monthly Report', '2026-06-01', '2026-06-30', [], [], []);
    expect(report.title).toBe('Monthly Report');
    expect(report.period.start).toBe('2026-06-01');
    expect(report.id).toMatch(/^report_/);
  });
});

// ── Security & Compliance Engine ──────────────────────────────────────────────

describe('Security & Compliance Engine', () => {
  it('creates audit log entries', () => {
    const entry = securityEngine.log({
      actorId: 'user_admin', actorType: 'admin', organizationId: 'org_sec',
      action: 'user.created', resourceType: 'user', resourceId: 'new_user',
      details: { role: 'doctor' }, severity: 'info',
    });
    expect(entry.id).toMatch(/^audit_/);
    expect(entry.action).toBe('user.created');
  });

  it('queries audit logs', () => {
    const results = securityEngine.queryAuditLog({ organizationId: 'org_sec', limit: 10 });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('returns audit stats', () => {
    const stats = securityEngine.getAuditStats('org_sec');
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.last24h).toBe('number');
  });

  it('manages roles and permissions', () => {
    const role = securityEngine.getRole('role_org_admin');
    expect(role).toBeDefined();
    expect(role!.permissions.length).toBeGreaterThan(0);

    const assigned = securityEngine.assignRole('user_test', 'role_billing_admin');
    expect(assigned).toBe(true);

    const userRole = securityEngine.getUserRole('user_test');
    expect(userRole).toBeDefined();
    expect(userRole!.id).toBe('role_billing_admin');
  });

  it('checks permissions correctly', () => {
    securityEngine.assignRole('user_perm', 'role_viewer');
    expect(securityEngine.checkPermission('user_perm', 'dashboard', 'read')).toBe(true);
    expect(securityEngine.checkPermission('user_perm', 'subscription', 'update')).toBe(false);
  });

  it('manages security policies', () => {
    const policy = securityEngine.getPolicy('pol_mfa');
    expect(policy).toBeDefined();
    expect(policy!.enabled).toBe(true);

    const updated = securityEngine.updatePolicy('pol_mfa', { enabled: false });
    expect(updated).toBe(true);
    expect(securityEngine.getPolicy('pol_mfa')!.enabled).toBe(false);
  });

  it('returns applicable compliance frameworks', () => {
    const frameworks = securityEngine.getApplicableFrameworks('ke', 'hospital');
    expect(frameworks.some(f => f.id === 'kenya_data_protection')).toBe(true);
    expect(frameworks.some(f => f.id === 'hipaa')).toBe(false);
  });

  it('assesses compliance for an organization', () => {
    const org: Organization = {
      id: 'comp_org', name: 'Compliance Hospital', customerType: 'hospital',
      facilities: [], users: [],
      settings: { primaryColor: '#2563eb', secondaryColor: '#4f46e5', language: 'en', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY' },
      createdAt: '', updatedAt: '',
    };

    const assessments = securityEngine.assessCompliance(org, 'ke');
    expect(assessments.length).toBeGreaterThanOrEqual(1);
    expect(assessments[0].score).toBeGreaterThan(0);
  });

  it('generates compliance report', () => {
    const org: Organization = {
      id: 'report_org', name: 'Report Hospital', customerType: 'hospital',
      facilities: [], users: [],
      settings: { primaryColor: '#2563eb', secondaryColor: '#4f46e5', language: 'en', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY' },
      createdAt: '', updatedAt: '',
    };

    const report = securityEngine.generateComplianceReport(org, 'ke');
    expect(report.region).toBe('ke');
    expect(report.assessments.length).toBeGreaterThan(0);
  });
});

// ── Multi-Tenant Engine ───────────────────────────────────────────────────────

describe('Multi-Tenant Engine', () => {
  const mockOrg: Organization = {
    id: 'mt_org', name: 'Multi-Tenant Hospital', customerType: 'hospital',
    facilities: [
      { id: 'mt_f1', name: 'Main', type: 'hospital', region: 'Nairobi', active: true, deploymentStatus: 'active' },
    ],
    users: [], settings: { primaryColor: '#2563eb', secondaryColor: '#4f46e5', language: 'en', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY' },
    createdAt: '', updatedAt: '',
  };

  it('provisions a tenant', () => {
    const tenant = multiTenantEngine.provisionTenant(mockOrg, 'shared_db_schema', 'ke', 'hospital-a');
    expect(tenant.id).toBe('tenant_mt_org');
    expect(tenant.subdomain).toBe('hospital-a');
    expect(tenant.status).toBe('active');
    expect(tenant.isolationModel).toBe('shared_db_schema');
  });

  it('resolves tenant by subdomain', () => {
    const tenant = multiTenantEngine.resolveTenantFromSubdomain('hospital-a');
    expect(tenant).not.toBeNull();
    expect(tenant!.organizationId).toBe('mt_org');
  });

  it('resolves tenant by custom domain', () => {
    const mapping = multiTenantEngine.registerDomain('tenant_mt_org', 'hospital-a.amexan.com', true);
    expect(mapping).not.toBeNull();

    const resolved = multiTenantEngine.resolveTenantFromDomain('hospital-a.amexan.com');
    expect(resolved).not.toBeNull();
    expect(resolved!.tenant.organizationId).toBe('mt_org');
  });

  it('retrieves tenant by organization ID', () => {
    const tenant = multiTenantEngine.getTenantByOrgId('mt_org');
    expect(tenant).not.toBeNull();
  });

  it('manages tenant configuration', () => {
    const updated = multiTenantEngine.updateTenantConfig('tenant_mt_org', { sessionTimeoutMinutes: 60 });
    expect(updated).toBe(true);
    const tenant = multiTenantEngine.getTenant('tenant_mt_org');
    expect(tenant!.config.sessionTimeoutMinutes).toBe(60);
  });

  it('manages resource quotas', () => {
    const quota = multiTenantEngine.getQuota('tenant_mt_org');
    expect(quota).not.toBeNull();
    expect(quota!.storageQuotaGb).toBe(100);

    multiTenantEngine.updateQuota('tenant_mt_org', { storageUsedGb: 45 });
    const updated = multiTenantEngine.getQuota('tenant_mt_org');
    expect(updated!.storageUsedGb).toBe(45);
  });

  it('suspends and activates tenants', () => {
    multiTenantEngine.suspendTenant('tenant_mt_org');
    const suspended = multiTenantEngine.getTenant('tenant_mt_org');
    expect(suspended!.status).toBe('suspended');

    multiTenantEngine.activateTenant('tenant_mt_org');
    const active = multiTenantEngine.getTenant('tenant_mt_org');
    expect(active!.status).toBe('active');
  });

  it('returns isolation costs and strategies', () => {
    const cost = multiTenantEngine.getIsolationCost('separate_db');
    expect(cost.monthlyPremium).toBe(500);
    expect(cost.setupFee).toBe(1000);

    const strategy = multiTenantEngine.getDataSeparationStrategy('separate_db');
    expect(strategy).toBe('by_database');
  });

  it('manages feature flags per tenant', () => {
    multiTenantEngine.setFeatureFlag('tenant_mt_org', 'ai_assistant', true);
    const tenant = multiTenantEngine.getTenant('tenant_mt_org');
    expect(tenant!.featureFlags.ai_assistant).toBe(true);
  });

  it('returns tenant counts and breakdown', () => {
    const counts = multiTenantEngine.getTenantCount();
    expect(counts.total).toBeGreaterThanOrEqual(1);
    expect(counts.byRegion.ke).toBeGreaterThanOrEqual(1);
  });
});

// ── Growth & Partner Engine ───────────────────────────────────────────────────

describe('Growth & Partner Engine', () => {
  it('registers a partner', () => {
    const partner = growthEngine.registerPartner({
      organizationId: 'partner_org', name: 'HealthTech Partners',
      tier: 'gold', regions: ['ke', 'tz'], specialties: ['HMIS', 'EMR'],
      status: 'active', contactEmail: 'partner@htp.com', contactPhone: '+254700000',
      contractEndDate: '2027-01-01', metadata: {},
      joinedAt: new Date().toISOString(), commissionRate: 0.1,
    });
    expect(partner.id).toMatch(/^partner_/);
    expect(partner.referralCode).toMatch(/^AMX-/);
    expect(partner.tier).toBe('gold');
  });

  it('retrieves partner by referral code', () => {
    const partners = growthEngine.getAllPartners('active');
    const partner = growthEngine.getPartnerByReferralCode(partners[0].referralCode);
    expect(partner).not.toBeNull();
  });

  it('records referrals and updates partner lead count', () => {
    const partners = growthEngine.getAllPartners('active');
    const partner = partners[0];
    const initialLeads = partner.leadCount;

    const referral = growthEngine.recordReferral(partner.id, 'New Hospital', 'org_new');
    expect(referral).not.toBeNull();
    expect(referral!.status).toBe('lead');

    const updated = growthEngine.getPartner(partner.id);
    expect(updated!.leadCount).toBe(initialLeads + 1);
  });

  it('qualifies and converts referrals with commission', () => {
    const partners = growthEngine.getAllPartners('active');
    const partner = partners[0];

    const ref = growthEngine.recordReferral(partner.id, 'Big Hospital', 'org_big');
    growthEngine.qualifyReferral(ref!.id);
    const result = growthEngine.convertReferral(ref!.id, 50000);

    expect(result).not.toBeNull();
    expect(result!.commission).toBeGreaterThan(0);
    expect(result!.referral.status).toBe('commission_paid');
  });

  it('computes partner metrics', () => {
    const partners = growthEngine.getAllPartners('active');
    const metrics = growthEngine.computePartnerMetrics(partners[0].id, '2026-01-01', '2026-12-31');
    expect(metrics.conversions).toBeGreaterThanOrEqual(0);
    expect(metrics.performanceRating).toMatch(/^(excellent|good|average|poor)$/);
  });

  it('returns partner tier benefits', () => {
    const benefits = growthEngine.getPartnerTierBenefits('platinum');
    expect(benefits.commissionRate).toBe(0.25);
    expect(benefits.dedicatedSupport).toBe(true);
  });

  it('returns partner dashboard summary', () => {
    const dashboard = growthEngine.getPartnerDashboard();
    expect(dashboard.totalPartners).toBeGreaterThan(0);
    expect(dashboard.byTier.gold).toBeGreaterThanOrEqual(1);
  });

  it('updates partner tier', () => {
    const partners = growthEngine.getAllPartners('active');
    const updated = growthEngine.updatePartnerTier(partners[0].id, 'platinum');
    expect(updated).not.toBeNull();
    expect(updated!.tier).toBe('platinum');
  });
});

// ── Plugin Engine ─────────────────────────────────────────────────────────────

describe('Plugin Engine', () => {
  it('registers a developer', () => {
    const dev = pluginEngine.registerDeveloper({
      name: 'ThirdParty Dev', email: 'dev@thirdparty.com',
      organizationId: 'org_dev', status: 'pending',
    });
    expect(dev.id).toMatch(/^dev_/);
    expect(dev.status).toBe('pending');
    expect(dev.plugins).toEqual([]);
  });

  it('verifies a developer', () => {
    const devs = [pluginEngine.registerDeveloper({
      name: 'Verified Dev', email: 'verified@dev.com', status: 'pending',
    })];
    const verified = pluginEngine.verifyDeveloper(devs[0].id);
    expect(verified).toBe(true);
    const dev = pluginEngine.getDeveloper(devs[0].id);
    expect(dev!.status).toBe('verified');
  });

  it('generates and validates API keys', () => {
    const dev = pluginEngine.registerDeveloper({
      name: 'API Dev', email: 'api@dev.com', status: 'pending',
    });
    pluginEngine.verifyDeveloper(dev.id);

    const apiKey = pluginEngine.generateApiKey(dev.id, 'Production Key', 'production', ['read:patient', 'read:clinical']);
    expect(apiKey).not.toBeNull();
    expect(apiKey!.key).toMatch(/^amx_/);

    const validation = pluginEngine.validateApiKey(apiKey!.key);
    expect(validation.valid).toBe(true);
    expect(validation.permissions).toContain('read:patient');

    pluginEngine.revokeApiKey(dev.id, apiKey!.id);
    const afterRevoke = pluginEngine.validateApiKey(apiKey!.key);
    expect(afterRevoke.valid).toBe(false);
  });

  it('registers a plugin manifest', () => {
    const dev = pluginEngine.registerDeveloper({
      name: 'Plugin Dev', email: 'plugin@dev.com', status: 'pending',
    });
    pluginEngine.verifyDeveloper(dev.id);

    const plugin = pluginEngine.registerPlugin({
      id: 'plugin_lab_connector', name: 'Lab Connector', description: 'Connect to lab systems',
      shortDescription: 'Lab integration',
      developerId: dev.id, version: '1.0.0', minEngineVersion: '1.0.0',
      type: 'connector', category: 'laboratory',
      permissions: ['read:orders', 'write:results'],
      hooks: ['on_order_placed', 'on_result_received'],
      configSchema: {}, screenshots: [], documentationUrl: '', supportUrl: '',
      license: 'MIT',
      compatiblePlans: ['enterprise', 'professional'],
      pricingModel: 'subscription', price: 100, currency: 'KES',
      tags: ['lab', 'integration'], dependencies: [],
    });
    expect(plugin.id).toBe('plugin_lab_connector');
    expect(plugin.status).toBe('draft');
  });

  it('submits, approves, and publishes a plugin', () => {
    const dev = pluginEngine.registerDeveloper({
      name: 'Publish Dev', email: 'pub@dev.com', status: 'pending',
    });
    pluginEngine.verifyDeveloper(dev.id);
    pluginEngine.registerPlugin({
      id: 'plugin_publish_test', name: 'Test Plugin', description: 'test',
      shortDescription: 'test', developerId: dev.id, version: '1.0.0',
      minEngineVersion: '1.0.0', type: 'report', category: 'analytics',
      permissions: ['read:analytics'], hooks: [],
      configSchema: {}, screenshots: [], documentationUrl: '', supportUrl: '',
      license: 'MIT', compatiblePlans: ['enterprise'], pricingModel: 'free',
      price: 0, currency: 'KES', tags: [], dependencies: [],
    });

    const submitted = pluginEngine.submitForReview('plugin_publish_test');
    expect(submitted).toBe(true);

    const approved = pluginEngine.approvePlugin('plugin_publish_test');
    expect(approved).toBe(true);

    const published = pluginEngine.publishPlugin('plugin_publish_test');
    expect(published).not.toBeNull();
    expect(published!.status).toBe('published');

    const versions = pluginEngine.getPluginVersions('plugin_publish_test');
    expect(versions.length).toBe(1);
  });

  it('searches plugins by various criteria', () => {
    const results = pluginEngine.searchPlugins({ type: 'connector' });
    expect(results.length).toBeGreaterThanOrEqual(1);

    const byCategory = pluginEngine.searchPlugins({ category: 'laboratory' });
    expect(byCategory.length).toBeGreaterThanOrEqual(1);
  });

  it('validates plugin compatibility', () => {
    const compat = pluginEngine.validatePluginCompatibility('plugin_publish_test', '1.0.0');
    expect(compat.compatible).toBe(true);

    const minFail = pluginEngine.validatePluginCompatibility('plugin_publish_test', '0.9.0');
    expect(minFail.compatible).toBe(false);
  });

  it('tracks plugin install counts', () => {
    pluginEngine.recordInstall('plugin_publish_test');
    pluginEngine.recordInstall('plugin_lab_connector');
    expect(pluginEngine.getInstallCount('plugin_publish_test')).toBe(1);
  });

  it('returns developer stats', () => {
    const devs = Array.from({ length: 3 }, () => pluginEngine.registerDeveloper({
      name: 'Stats Dev', email: 'stats@dev.com', status: 'pending',
    }));
    const stats = pluginEngine.getDeveloperStats(devs[0].id);
    expect(typeof stats.totalPlugins).toBe('number');
  });

  it('returns marketplace stats', () => {
    const stats = pluginEngine.getMarketplaceStats();
    expect(stats.totalPlugins).toBeGreaterThan(0);
    expect(stats.totalDevelopers).toBeGreaterThan(0);
    expect(Object.keys(stats.byType).length).toBeGreaterThan(0);
  });
});

// ── Enhanced End-to-End Enterprise Pipeline ──────────────────────────────────

describe('Enterprise Pipeline End-to-End (Extended)', () => {
  it('full enterprise lifecycle: pricing → deployment → support → security → multi-tenant → growth', () => {
    const price = calculatePrice('enterprise', ['pharmacy', 'laboratory', 'radiology'], 200, 3, 'annual', { region: 'ke' });
    expect(price.totalAnnual).toBeGreaterThan(0);
    expect(price.taxLabel).toBe('VAT 16%');
    expect(price.currency).toBe('KES');

    const org: Organization = {
      id: 'e2e_full', name: 'Full E2E Hospital', customerType: 'hospital',
      facilities: [{ id: 'fac_e2e', name: 'Main', type: 'hospital', region: 'Nairobi', active: true, deploymentStatus: 'onboarding' }],
      users: [{ id: 'u_e2e', name: 'Dr Test', email: 'dr@test.com', role: 'doctor', active: true, modulesUsed: ['hmis'] }],
      settings: { primaryColor: '#2563eb', secondaryColor: '#4f46e5', language: 'en', timezone: 'Africa/Nairobi', currency: 'KES', dateFormat: 'DD/MM/YYYY' },
      createdAt: '2026-01-01', updatedAt: '2026-06-01',
    };

    const project = deploymentEngine.createProject(org, org.facilities, 'PM E2E');
    expect(project.currentPhase).toBe('infrastructure_assessment');

    const ticket = supportEngine.createTicket({
      organizationId: org.id, userId: org.users[0].id, subject: 'Setup help',
      description: 'Need help with deployment', category: 'implementation',
      priority: 'high', status: 'new', tags: ['deployment'], attachments: [], linkedTicketIds: [],
    });
    expect(ticket.id).toMatch(/^TKT-/);

    const auditEntry = securityEngine.log({
      actorId: 'system', actorType: 'system', organizationId: org.id,
      action: 'subscription.created', resourceType: 'subscription',
      resourceId: 'sub_e2e', details: { plan: 'enterprise' }, severity: 'info',
    });
    expect(auditEntry.action).toBe('subscription.created');

    const tenant = multiTenantEngine.provisionTenant(org, 'shared_db_schema', 'ke', 'e2e-hospital');
    expect(tenant.status).toBe('active');

    const partner = growthEngine.registerPartner({
      organizationId: 'partner_e2e', name: 'E2E Partner',
      tier: 'gold', regions: ['ke'], specialties: ['HMIS'],
      status: 'active', contactEmail: 'e2e@partner.com', contactPhone: '+254700000',
      metadata: {},
      joinedAt: new Date().toISOString(), commissionRate: 0.1,
    });
    expect(partner.referralCode).toMatch(/^AMX-/);

    const dev = pluginEngine.registerDeveloper({
      name: 'E2E Developer', email: 'e2e@dev.com', status: 'pending',
    });
    pluginEngine.verifyDeveloper(dev.id);
    const apiKey = pluginEngine.generateApiKey(dev.id, 'E2E Key', 'development', ['read:clinical']);
    expect(apiKey).not.toBeNull();

    const compliance = securityEngine.assessCompliance(org, 'ke');
    expect(compliance.length).toBeGreaterThan(0);

    const alerts = analyticsEngine.detectOutbreak('Nairobi', [
      { diseaseName: 'Malaria', currentCases: 500, expectedBaseline: 200 },
    ]);
    expect(alerts.length).toBeGreaterThan(0);
  });
});