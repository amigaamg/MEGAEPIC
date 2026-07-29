// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ENTERPRISE CONSTITUTION — Book V
// Customers, products, plans, subscriptions, licensing, pricing.
// No medical rules exist here. Only business rules.
// ═══════════════════════════════════════════════════════════════════════════════

export type CustomerType =
  | 'individual_doctor' | 'individual_nurse' | 'individual_student'
  | 'clinic' | 'hospital' | 'hospital_group'
  | 'university' | 'research_institute'
  | 'government' | 'county' | 'ministry'
  | 'insurance' | 'ngo'
  | 'telemedicine_provider' | 'ambulance_service'
  | 'corporate' | 'developer' | 'partner';

export interface CustomerDefinition {
  id: CustomerType;
  label: string;
  description: string;
  maxFacilities: number;
  maxUsers: number;
  typicalSegment: 'individual' | 'smb' | 'mid' | 'enterprise' | 'government';
  requiresContract: boolean;
}

export const CUSTOMER_TYPES: Record<CustomerType, CustomerDefinition> = {
  individual_doctor: { id: 'individual_doctor', label: 'Individual Doctor', description: 'Solo practitioner', maxFacilities: 1, maxUsers: 1, typicalSegment: 'individual', requiresContract: false },
  individual_nurse: { id: 'individual_nurse', label: 'Individual Nurse', description: 'Independent nurse', maxFacilities: 1, maxUsers: 1, typicalSegment: 'individual', requiresContract: false },
  individual_student: { id: 'individual_student', label: 'Medical Student', description: 'Student subscriber', maxFacilities: 0, maxUsers: 1, typicalSegment: 'individual', requiresContract: false },
  clinic: { id: 'clinic', label: 'Clinic', description: 'Private clinic or health center', maxFacilities: 3, maxUsers: 20, typicalSegment: 'smb', requiresContract: false },
  hospital: { id: 'hospital', label: 'Hospital', description: 'District or county hospital', maxFacilities: 5, maxUsers: 500, typicalSegment: 'mid', requiresContract: true },
  hospital_group: { id: 'hospital_group', label: 'Hospital Group', description: 'Multi-facility health system', maxFacilities: 50, maxUsers: 5000, typicalSegment: 'enterprise', requiresContract: true },
  university: { id: 'university', label: 'University', description: 'Medical school or teaching hospital', maxFacilities: 10, maxUsers: 5000, typicalSegment: 'enterprise', requiresContract: true },
  research_institute: { id: 'research_institute', label: 'Research Institute', description: 'Clinical research organization', maxFacilities: 5, maxUsers: 200, typicalSegment: 'enterprise', requiresContract: true },
  government: { id: 'government', label: 'Government', description: 'National or regional health authority', maxFacilities: 999, maxUsers: 99999, typicalSegment: 'government', requiresContract: true },
  county: { id: 'county', label: 'County Health', description: 'County health department', maxFacilities: 100, maxUsers: 5000, typicalSegment: 'government', requiresContract: true },
  ministry: { id: 'ministry', label: 'Ministry of Health', description: 'National ministry', maxFacilities: 999, maxUsers: 99999, typicalSegment: 'government', requiresContract: true },
  insurance: { id: 'insurance', label: 'Insurance Company', description: 'Health insurance provider', maxFacilities: 0, maxUsers: 100, typicalSegment: 'enterprise', requiresContract: true },
  ngo: { id: 'ngo', label: 'NGO', description: 'Non-governmental health organization', maxFacilities: 20, maxUsers: 200, typicalSegment: 'mid', requiresContract: false },
  telemedicine_provider: { id: 'telemedicine_provider', label: 'Telemedicine Provider', description: 'Virtual care platform', maxFacilities: 1, maxUsers: 50, typicalSegment: 'smb', requiresContract: true },
  ambulance_service: { id: 'ambulance_service', label: 'Ambulance Service', description: 'Emergency medical transport', maxFacilities: 10, maxUsers: 100, typicalSegment: 'smb', requiresContract: false },
  corporate: { id: 'corporate', label: 'Corporate Client', description: 'Corporate wellness program', maxFacilities: 5, maxUsers: 500, typicalSegment: 'mid', requiresContract: true },
  developer: { id: 'developer', label: 'Developer', description: 'Third-party API developer', maxFacilities: 0, maxUsers: 1, typicalSegment: 'individual', requiresContract: false },
  partner: { id: 'partner', label: 'Implementation Partner', description: 'Reseller or implementation partner', maxFacilities: 0, maxUsers: 10, typicalSegment: 'mid', requiresContract: true },
};

// ── Products ─────────────────────────────────────────────────────────────────

export type ProductId =
  | 'clinical_os' | 'hmis' | 'emr' | 'telemedicine' | 'medical_ai'
  | 'analytics' | 'research_platform' | 'education_platform'
  | 'marketplace' | 'cloud_storage' | 'backup' | 'api_access'
  | 'integrations' | 'hosting' | 'premium_support'
  | 'customization' | 'training' | 'certification'
  | 'pharmacy' | 'laboratory' | 'radiology' | 'billing' | 'inventory'
  | 'payroll' | 'hr' | 'ambulance' | 'government_reporting';

export interface ProductDefinition {
  id: ProductId;
  label: string;
  description: string;
  category: 'core' | 'clinical' | 'ancillary' | 'infrastructure' | 'premium' | 'addon';
  basePrice: number;
  unit: 'per_user' | 'per_facility' | 'flat' | 'per_storage_gb';
  requiresContract: boolean;
  dependencies: ProductId[];
}

export const PRODUCTS: Record<ProductId, ProductDefinition> = {
  clinical_os: { id: 'clinical_os', label: 'Clinical OS', description: 'Core clinical operating system', category: 'core', basePrice: 0, unit: 'flat', requiresContract: false, dependencies: [] },
  hmis: { id: 'hmis', label: 'HMIS', description: 'Hospital Management Information System', category: 'core', basePrice: 500, unit: 'per_facility', requiresContract: true, dependencies: ['clinical_os'] },
  emr: { id: 'emr', label: 'EMR', description: 'Electronic Medical Records', category: 'core', basePrice: 200, unit: 'per_facility', requiresContract: true, dependencies: ['clinical_os'] },
  telemedicine: { id: 'telemedicine', label: 'Telemedicine', description: 'Virtual consultation platform', category: 'clinical', basePrice: 100, unit: 'per_facility', requiresContract: false, dependencies: ['clinical_os'] },
  medical_ai: { id: 'medical_ai', label: 'Medical AI', description: 'AI-powered clinical decision support', category: 'clinical', basePrice: 50, unit: 'per_user', requiresContract: false, dependencies: ['clinical_os'] },
  analytics: { id: 'analytics', label: 'Analytics', description: 'Business and clinical analytics', category: 'premium', basePrice: 300, unit: 'per_facility', requiresContract: true, dependencies: ['clinical_os'] },
  research_platform: { id: 'research_platform', label: 'Research Platform', description: 'Clinical research tooling', category: 'premium', basePrice: 500, unit: 'per_facility', requiresContract: true, dependencies: ['clinical_os', 'analytics'] },
  education_platform: { id: 'education_platform', label: 'Education Platform', description: 'Medical education and CPD', category: 'addon', basePrice: 200, unit: 'per_facility', requiresContract: true, dependencies: ['clinical_os'] },
  marketplace: { id: 'marketplace', label: 'Marketplace', description: 'Plugin and extension marketplace', category: 'addon', basePrice: 0, unit: 'flat', requiresContract: false, dependencies: [] },
  cloud_storage: { id: 'cloud_storage', label: 'Cloud Storage', description: 'Secure cloud data storage', category: 'infrastructure', basePrice: 10, unit: 'per_storage_gb', requiresContract: false, dependencies: ['clinical_os'] },
  backup: { id: 'backup', label: 'Backup & DR', description: 'Automated backup and disaster recovery', category: 'infrastructure', basePrice: 50, unit: 'per_facility', requiresContract: false, dependencies: ['cloud_storage'] },
  api_access: { id: 'api_access', label: 'API Access', description: 'REST and FHIR API access', category: 'premium', basePrice: 100, unit: 'per_facility', requiresContract: true, dependencies: ['clinical_os'] },
  integrations: { id: 'integrations', label: 'Integrations', description: 'Third-party system integrations', category: 'addon', basePrice: 200, unit: 'per_facility', requiresContract: true, dependencies: ['api_access'] },
  hosting: { id: 'hosting', label: 'Managed Hosting', description: 'Fully managed cloud hosting', category: 'infrastructure', basePrice: 500, unit: 'per_facility', requiresContract: true, dependencies: ['clinical_os'] },
  premium_support: { id: 'premium_support', label: 'Premium Support', description: '24/7 dedicated support', category: 'premium', basePrice: 1000, unit: 'per_facility', requiresContract: true, dependencies: [] },
  customization: { id: 'customization', label: 'Customization', description: 'Custom forms, workflows, branding', category: 'premium', basePrice: 2000, unit: 'flat', requiresContract: true, dependencies: ['clinical_os'] },
  training: { id: 'training', label: 'Training', description: 'On-site and virtual training', category: 'premium', basePrice: 500, unit: 'flat', requiresContract: true, dependencies: [] },
  certification: { id: 'certification', label: 'Certification', description: 'Staff competency certification', category: 'premium', basePrice: 100, unit: 'per_user', requiresContract: false, dependencies: ['training'] },
  pharmacy: { id: 'pharmacy', label: 'Pharmacy Module', description: 'Pharmacy management and dispensing', category: 'ancillary', basePrice: 200, unit: 'per_facility', requiresContract: false, dependencies: ['hmis'] },
  laboratory: { id: 'laboratory', label: 'Laboratory Module', description: 'Lab information system', category: 'ancillary', basePrice: 200, unit: 'per_facility', requiresContract: false, dependencies: ['hmis'] },
  radiology: { id: 'radiology', label: 'Radiology Module', description: 'Radiology information system', category: 'ancillary', basePrice: 300, unit: 'per_facility', requiresContract: false, dependencies: ['hmis'] },
  billing: { id: 'billing', label: 'Billing Module', description: 'Patient billing and insurance claims', category: 'ancillary', basePrice: 200, unit: 'per_facility', requiresContract: false, dependencies: ['hmis'] },
  inventory: { id: 'inventory', label: 'Inventory Module', description: 'Supply chain and inventory management', category: 'ancillary', basePrice: 150, unit: 'per_facility', requiresContract: false, dependencies: ['hmis'] },
  payroll: { id: 'payroll', label: 'Payroll Module', description: 'Staff payroll management', category: 'ancillary', basePrice: 150, unit: 'per_facility', requiresContract: false, dependencies: [] },
  hr: { id: 'hr', label: 'HR Module', description: 'Human resources management', category: 'ancillary', basePrice: 100, unit: 'per_facility', requiresContract: false, dependencies: [] },
  ambulance: { id: 'ambulance', label: 'Ambulance Module', description: 'Ambulance dispatch and tracking', category: 'ancillary', basePrice: 100, unit: 'per_facility', requiresContract: false, dependencies: ['hmis'] },
  government_reporting: { id: 'government_reporting', label: 'Government Reporting', description: 'Automated regulatory reporting', category: 'addon', basePrice: 300, unit: 'per_facility', requiresContract: true, dependencies: ['analytics'] },
};

// ── Plans (bundled packages) ─────────────────────────────────────────────────

export type PlanId = 'starter' | 'professional' | 'enterprise' | 'education' | 'government';

export interface PlanDefinition {
  id: PlanId;
  label: string;
  description: string;
  includedProducts: ProductId[];
  maxUsers: number;
  maxFacilities: number;
  monthlyPrice: number;
  annualDiscount: number;
  supportLevel: 'community' | 'standard' | 'premium' | 'dedicated';
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: 'starter', label: 'Starter', description: 'For small clinics and individual practitioners',
    includedProducts: ['clinical_os', 'emr', 'telemedicine'],
    maxUsers: 5, maxFacilities: 1, monthlyPrice: 0, annualDiscount: 0, supportLevel: 'community',
  },
  professional: {
    id: 'professional', label: 'Professional', description: 'For growing clinics and private hospitals',
    includedProducts: ['clinical_os', 'hmis', 'emr', 'telemedicine', 'medical_ai', 'analytics', 'pharmacy', 'laboratory', 'billing', 'inventory'],
    maxUsers: 50, maxFacilities: 3, monthlyPrice: 199, annualDiscount: 0.15, supportLevel: 'standard',
  },
  enterprise: {
    id: 'enterprise', label: 'Enterprise', description: 'For hospitals, hospital groups, and health systems',
    includedProducts: ['clinical_os', 'hmis', 'emr', 'telemedicine', 'medical_ai', 'analytics', 'research_platform', 'education_platform', 'marketplace', 'api_access', 'integrations', 'hosting', 'cloud_storage', 'backup', 'pharmacy', 'laboratory', 'radiology', 'billing', 'inventory', 'payroll', 'hr', 'ambulance', 'government_reporting'],
    maxUsers: 9999, maxFacilities: 999, monthlyPrice: 1999, annualDiscount: 0.2, supportLevel: 'premium',
  },
  education: {
    id: 'education', label: 'Education', description: 'For universities and teaching hospitals',
    includedProducts: ['clinical_os', 'education_platform', 'emr', 'telemedicine', 'medical_ai', 'analytics'],
    maxUsers: 9999, maxFacilities: 10, monthlyPrice: 499, annualDiscount: 0.2, supportLevel: 'standard',
  },
  government: {
    id: 'government', label: 'Government', description: 'For ministries and county health departments',
    includedProducts: ['clinical_os', 'hmis', 'emr', 'telemedicine', 'analytics', 'government_reporting', 'hosting', 'backup', 'pharmacy', 'laboratory', 'billing'],
    maxUsers: 99999, maxFacilities: 999, monthlyPrice: 4999, annualDiscount: 0.25, supportLevel: 'dedicated',
  },
};

// ── Subscription / Licensing ─────────────────────────────────────────────────

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  organizationId: string;
  customerType: CustomerType;
  planId: PlanId;
  addonProducts: ProductId[];
  status: SubscriptionStatus;
  startDate: string;
  trialEndDate?: string;
  renewalDate: string;
  maxUsers: number;
  maxFacilities: number;
  activeUsers: number;
  activeFacilities: number;
  pricePerMonth: number;
  billingCycle: 'monthly' | 'annual';
  gracePeriodDays: number;
  autoRenew: boolean;
  metadata: Record<string, unknown>;
}

export interface License {
  id: string;
  subscriptionId: string;
  licenseKey: string;
  issuedAt: string;
  expiresAt: string;
  moduleAccess: string[];
  maxApiCalls: number;
  apiCallsUsed: number;
  environment: 'production' | 'staging' | 'development';
  allowedDomains: string[];
}

// ── Organization / Tenant ────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  customerType: CustomerType;
  subscriptionId?: string;
  facilities: Facility[];
  users: OrganizationUser[];
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'health_center' | 'dispensary' | 'laboratory' | 'pharmacy';
  region: string;
  active: boolean;
  deploymentStatus: DeploymentStatus;
}

export type DeploymentStatus =
  | 'onboarding' | 'migration' | 'training' | 'testing' | 'go_live' | 'live' | 'hypercare' | 'active';

export interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin?: string;
  modulesUsed: string[];
}

export interface TenantSettings {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  domain?: string;
  customCss?: string;
}

// ── Regions / Currencies / Taxes ─────────────────────────────────────────────

export type RegionCode = 'ke' | 'ng' | 'tz' | 'ug' | 'rw' | 'et' | 'gh' | 'za' | 'us' | 'uk' | 'eu' | 'other';

export interface RegionDefinition {
  code: RegionCode;
  label: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxLabel: string;
  pricingMultiplier: number;
  dateFormat: string;
  timezone: string;
}

export const REGIONS: Record<RegionCode, RegionDefinition> = {
  ke: { code: 'ke', label: 'Kenya', currency: 'KES', currencySymbol: 'KSh', taxRate: 0.16, taxLabel: 'VAT 16%', pricingMultiplier: 1.0, dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Nairobi' },
  ng: { code: 'ng', label: 'Nigeria', currency: 'NGN', currencySymbol: '₦', taxRate: 0.075, taxLabel: 'VAT 7.5%', pricingMultiplier: 0.9, dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Lagos' },
  tz: { code: 'tz', label: 'Tanzania', currency: 'TZS', currencySymbol: 'TSh', taxRate: 0.18, taxLabel: 'VAT 18%', pricingMultiplier: 0.85, dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Dar_es_Salaam' },
  ug: { code: 'ug', label: 'Uganda', currency: 'UGX', currencySymbol: 'USh', taxRate: 0.18, taxLabel: 'VAT 18%', pricingMultiplier: 0.8, dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Kampala' },
  rw: { code: 'rw', label: 'Rwanda', currency: 'RWF', currencySymbol: 'FRw', taxRate: 0.18, taxLabel: 'VAT 18%', pricingMultiplier: 0.85, dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Kigali' },
  et: { code: 'et', label: 'Ethiopia', currency: 'ETB', currencySymbol: 'Br', taxRate: 0.15, taxLabel: 'VAT 15%', pricingMultiplier: 0.7, dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Addis_Ababa' },
  gh: { code: 'gh', label: 'Ghana', currency: 'GHS', currencySymbol: '₵', taxRate: 0.125, taxLabel: 'VAT 12.5%', pricingMultiplier: 0.9, dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Accra' },
  za: { code: 'za', label: 'South Africa', currency: 'ZAR', currencySymbol: 'R', taxRate: 0.15, taxLabel: 'VAT 15%', pricingMultiplier: 1.1, dateFormat: 'YYYY/MM/DD', timezone: 'Africa/Johannesburg' },
  us: { code: 'us', label: 'United States', currency: 'USD', currencySymbol: '$', taxRate: 0.0, taxLabel: 'No VAT', pricingMultiplier: 2.0, dateFormat: 'MM/DD/YYYY', timezone: 'America/New_York' },
  uk: { code: 'uk', label: 'United Kingdom', currency: 'GBP', currencySymbol: '£', taxRate: 0.2, taxLabel: 'VAT 20%', pricingMultiplier: 1.8, dateFormat: 'DD/MM/YYYY', timezone: 'Europe/London' },
  eu: { code: 'eu', label: 'European Union', currency: 'EUR', currencySymbol: '€', taxRate: 0.2, taxLabel: 'VAT 20%', pricingMultiplier: 1.9, dateFormat: 'DD/MM/YYYY', timezone: 'Europe/Berlin' },
  other: { code: 'other', label: 'Other Region', currency: 'USD', currencySymbol: '$', taxRate: 0.0, taxLabel: 'No tax', pricingMultiplier: 1.0, dateFormat: 'YYYY-MM-DD', timezone: 'UTC' },
};

export interface DiscountRule {
  id: string;
  label: string;
  type: 'annual' | 'volume' | 'promo' | 'contract' | 'education' | 'nonprofit' | 'early_adopter';
  discountPercent: number;
  appliesTo: 'base' | 'total' | 'overages_only';
  minUsers?: number;
  minFacilities?: number;
  minContractMonths?: number;
  promoCode?: string;
  expiresAt?: string;
  maxApplications: number;
}

export const BUILT_IN_DISCOUNT_RULES: DiscountRule[] = [
  { id: 'disc_annual', label: 'Annual Billing', type: 'annual', discountPercent: 15, appliesTo: 'total', maxApplications: 999999 },
  { id: 'disc_volume_50', label: '50+ Users', type: 'volume', discountPercent: 10, appliesTo: 'overages_only', minUsers: 50, maxApplications: 999999 },
  { id: 'disc_volume_200', label: '200+ Users', type: 'volume', discountPercent: 15, appliesTo: 'overages_only', minUsers: 200, maxApplications: 999999 },
  { id: 'disc_volume_1000', label: '1,000+ Users', type: 'volume', discountPercent: 20, appliesTo: 'overages_only', minUsers: 1000, maxApplications: 999999 },
  { id: 'disc_education', label: 'Educational Institution', type: 'education', discountPercent: 25, appliesTo: 'total', maxApplications: 999999 },
  { id: 'disc_nonprofit', label: 'Non-Profit / NGO', type: 'nonprofit', discountPercent: 20, appliesTo: 'total', maxApplications: 999999 },
  { id: 'disc_contract_12', label: '12-Month Contract', type: 'contract', discountPercent: 5, appliesTo: 'base', minContractMonths: 12, maxApplications: 999999 },
  { id: 'disc_contract_24', label: '24-Month Contract', type: 'contract', discountPercent: 10, appliesTo: 'base', minContractMonths: 24, maxApplications: 999999 },
  { id: 'disc_contract_36', label: '36-Month Contract', type: 'contract', discountPercent: 15, appliesTo: 'base', minContractMonths: 36, maxApplications: 999999 },
  { id: 'disc_early_2026', label: 'Early Adopter 2026', type: 'early_adopter', discountPercent: 30, appliesTo: 'total', promoCode: 'EARLY2026', expiresAt: '2026-12-31', maxApplications: 500 },
];

// ── Pricing ──────────────────────────────────────────────────────────────────

export interface PriceQuote {
  planId: PlanId;
  basePrice: number;
  addonProducts: Array<{ productId: ProductId; price: number; unit: string }>;
  userOverages: number;
  facilityOverages: number;
  storageCost: number;
  supportCost: number;
  taxRate: number;
  taxAmount: number;
  taxLabel: string;
  appliedDiscounts: Array<{ ruleId: string; label: string; amount: number }>;
  discountTotal: number;
  subtotal: number;
  totalMonthly: number;
  totalAnnual: number;
  currency: string;
  currencySymbol: string;
  region: RegionCode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getCustomerType(type: CustomerType): CustomerDefinition {
  return CUSTOMER_TYPES[type] || CUSTOMER_TYPES.individual_doctor;
}

export function getProduct(productId: ProductId): ProductDefinition {
  return PRODUCTS[productId] || PRODUCTS.clinical_os;
}

export function getPlan(planId: PlanId): PlanDefinition {
  return PLANS[planId] || PLANS.starter;
}

export function getRegion(code: RegionCode): RegionDefinition {
  return REGIONS[code] || REGIONS.other;
}

export function getAvailableProducts(customerType: CustomerType): ProductId[] {
  const type = getCustomerType(customerType);
  return (Object.entries(PRODUCTS) as [ProductId, ProductDefinition][])
    .filter(([_, p]) => {
      if (type.typicalSegment === 'individual') return p.category !== 'infrastructure';
      return true;
    })
    .map(([id]) => id);
}

export function calculatePrice(
  planId: PlanId, addons: ProductId[], users: number, facilities: number,
  billingCycle: 'monthly' | 'annual',
  overrides?: { region?: RegionCode; discountRules?: DiscountRule[]; promoCode?: string },
): PriceQuote {
  const plan = getPlan(planId);
  const region = overrides?.region ? getRegion(overrides.region) : REGIONS.ke;
  const addonProducts = addons.map(id => getProduct(id));
  const multiplier = region.pricingMultiplier;

  const addonCosts = addonProducts.map(p => ({
    productId: p.id, price: Math.round(p.basePrice * multiplier * facilities), unit: p.unit,
  }));

  const userOverage = Math.max(0, users - plan.maxUsers);
  const facilityOverage = Math.max(0, facilities - plan.maxFacilities);
  const userOverageCost = Math.round(userOverage * 5 * multiplier);
  const facilityOverageCost = Math.round(facilityOverage * 50 * multiplier);

  const baseMonthly = Math.round(plan.monthlyPrice * multiplier);
  const addonMonthly = addonCosts.reduce((s, a) => s + a.price, 0);
  const overageTotal = userOverageCost + facilityOverageCost;
  const subtotal = baseMonthly + addonMonthly + overageTotal;

  const candidateDiscounts = overrides?.discountRules || [];
  const effectiveDiscounts: PriceQuote['appliedDiscounts'] = [];

  for (const rule of candidateDiscounts) {
    if (rule.expiresAt && new Date(rule.expiresAt) < new Date()) continue;
    if (rule.promoCode && rule.promoCode !== overrides?.promoCode) continue;
    if (rule.minUsers && users < rule.minUsers) continue;
    if (rule.minFacilities && facilities < rule.minFacilities) continue;

    let discBase = 0;
    if (rule.appliesTo === 'base') discBase = baseMonthly + addonMonthly;
    else if (rule.appliesTo === 'overages_only') discBase = overageTotal;
    else discBase = subtotal;

    const amount = Math.round(discBase * rule.discountPercent / 100);
    effectiveDiscounts.push({ ruleId: rule.id, label: rule.label, amount });
  }

  if (billingCycle === 'annual') {
    const annualRule = effectiveDiscounts.find(d => d.ruleId === 'disc_annual');
    if (!annualRule) {
      effectiveDiscounts.push({
        ruleId: 'disc_annual', label: 'Annual Billing',
        amount: Math.round(subtotal * 0.15),
      });
    }
  }

  const discountTotal = effectiveDiscounts.reduce((s, d) => s + d.amount, 0);
  const afterDiscount = Math.max(0, subtotal - discountTotal);
  const taxAmount = Math.round(afterDiscount * region.taxRate);

  return {
    planId, basePrice: baseMonthly,
    addonProducts: addonCosts, userOverages: userOverageCost,
    facilityOverages: facilityOverageCost, storageCost: 0, supportCost: 0,
    taxRate: region.taxRate, taxAmount, taxLabel: region.taxLabel,
    appliedDiscounts: effectiveDiscounts, discountTotal,
    subtotal: afterDiscount,
    totalMonthly: afterDiscount + taxAmount,
    totalAnnual: (afterDiscount + taxAmount) * (billingCycle === 'annual' ? 12 : 12),
    currency: region.currency, currencySymbol: region.currencySymbol,
    region: region.code,
  };
}