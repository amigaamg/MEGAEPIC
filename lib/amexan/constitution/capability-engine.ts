export type SubscriptionTier = 'starter' | 'professional' | 'enterprise' | 'national';

export type Capability = string;

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  pricePerMonth: number;
  maxUsersPerOrg: number;
  maxOrganizations: number;
  maxStorageGB: number;
  includesFHIR: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    tier: 'starter',
    name: 'Starter',
    description: 'Basic EMR, appointments, billing, patients',
    pricePerMonth: 0,
    maxUsersPerOrg: 10,
    maxOrganizations: 1,
    maxStorageGB: 10,
    includesFHIR: false,
  },
  {
    tier: 'professional',
    name: 'Professional',
    description: 'Analytics, research, education, AI-assisted, FHIR, PACS, LIS',
    pricePerMonth: 500,
    maxUsersPerOrg: 50,
    maxOrganizations: 3,
    maxStorageGB: 100,
    includesFHIR: true,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Marketplace, multi-facility, registries, population health, SSO, API',
    pricePerMonth: 2000,
    maxUsersPerOrg: 500,
    maxOrganizations: 25,
    maxStorageGB: 1000,
    includesFHIR: true,
  },
  {
    tier: 'national',
    name: 'National',
    description: 'White label, custom integrations, priority support, dedicated account manager',
    pricePerMonth: 10000,
    maxUsersPerOrg: 9999,
    maxOrganizations: 9999,
    maxStorageGB: 10000,
    includesFHIR: true,
  },
];

export function getAllPlans(): SubscriptionPlan[] {
  return PLANS;
}

export function getPlan(tier: SubscriptionTier): SubscriptionPlan | undefined {
  return PLANS.find(p => p.tier === tier);
}

export const TIER_ORDER: Record<SubscriptionTier, number> = {
  starter: 0,
  professional: 1,
  enterprise: 2,
  national: 3,
};

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  national: 'National',
};

const TIER_CAPABILITIES: Record<SubscriptionTier, Capability[]> = {
  starter: ['emr', 'patients', 'encounters', 'billing', 'appointments'],
  professional: ['emr', 'patients', 'encounters', 'billing', 'appointments', 'analytics', 'research', 'education', 'ai_assisted', 'fhir', 'pacs', 'lis'],
  enterprise: ['emr', 'patients', 'encounters', 'billing', 'appointments', 'analytics', 'research', 'education', 'ai_assisted', 'fhir', 'pacs', 'lis', 'marketplace', 'multi_facility', 'registries', 'population_health', 'sso', 'api'],
  national: ['emr', 'patients', 'encounters', 'billing', 'appointments', 'analytics', 'research', 'education', 'ai_assisted', 'fhir', 'pacs', 'lis', 'marketplace', 'multi_facility', 'registries', 'population_health', 'sso', 'api', 'white_label', 'custom_integrations'],
};

export function getTierCapabilities(tier: SubscriptionTier): Capability[] {
  return TIER_CAPABILITIES[tier] ?? TIER_CAPABILITIES.starter;
}

export function hasCapability(tier: SubscriptionTier, capability: Capability): boolean {
  return getTierCapabilities(tier).includes(capability);
}

export function canUpgrade(from: SubscriptionTier, to: SubscriptionTier): boolean {
  return TIER_ORDER[to] > TIER_ORDER[from];
}

export function canDowngrade(from: SubscriptionTier, to: SubscriptionTier): boolean {
  return TIER_ORDER[to] < TIER_ORDER[from];
}

export function getMaxUsers(tier: SubscriptionTier): number {
  switch (tier) {
    case 'starter': return 10;
    case 'professional': return 50;
    case 'enterprise': return 500;
    case 'national': return 9999;
  }
}

export function isValidTier(value: unknown): value is SubscriptionTier {
  return value === 'starter' || value === 'professional' || value === 'enterprise' || value === 'national';
}
