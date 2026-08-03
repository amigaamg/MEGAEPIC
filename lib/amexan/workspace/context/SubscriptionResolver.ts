// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 4 — Subscription Resolver
// Determines the subscription tier from organization config and
// membership metadata. Governs limits on users, modules, storage, AI, etc.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { Subscription, SubscriptionTier, SubscriptionLimits } from '../types';

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: { users: 1, modules: 4, storageGB: 1, aiCredits: 0, reportsPerMonth: 10, apiRequestsPerDay: 100 },
  student: { users: 1, modules: 8, storageGB: 5, aiCredits: 50, reportsPerMonth: 50, apiRequestsPerDay: 500 },
  professional: { users: 3, modules: 16, storageGB: 20, aiCredits: 200, reportsPerMonth: 200, apiRequestsPerDay: 2000 },
  clinic: { users: 10, modules: 20, storageGB: 100, aiCredits: 500, reportsPerMonth: 1000, apiRequestsPerDay: 5000 },
  hospital: { users: 500, modules: 24, storageGB: 500, aiCredits: 5000, reportsPerMonth: 10000, apiRequestsPerDay: 20000 },
  enterprise: { users: 5000, modules: 24, storageGB: 5000, aiCredits: 50000, reportsPerMonth: 100000, apiRequestsPerDay: 100000 },
  government: { users: 10000, modules: 24, storageGB: 10000, aiCredits: 100000, reportsPerMonth: 500000, apiRequestsPerDay: 500000 },
  university: { users: 2000, modules: 24, storageGB: 5000, aiCredits: 20000, reportsPerMonth: 50000, apiRequestsPerDay: 100000 },
};

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  student: 'Student',
  professional: 'Professional',
  clinic: 'Clinic',
  hospital: 'Hospital',
  enterprise: 'Enterprise',
  government: 'Government',
  university: 'University',
};

export function resolveSubscription(workspace: ResolvedWorkspace): Subscription {
  const org = workspace.organization;
  const membership = workspace.activeMembership;

  // Check org config for pricing tier
  const configTier = ((org?.config as unknown) as Record<string, unknown> | undefined)?.pricingTier as SubscriptionTier | undefined;
  if (configTier && TIER_LIMITS[configTier]) {
    return {
      tier: configTier,
      label: TIER_LABELS[configTier],
      limits: TIER_LIMITS[configTier],
      active: true,
    };
  }

  // Check membership metadata for tier
  const metaTier = membership?.metadata?.tier as SubscriptionTier | undefined;
  if (metaTier && TIER_LIMITS[metaTier]) {
    return {
      tier: metaTier,
      label: TIER_LABELS[metaTier],
      limits: TIER_LIMITS[metaTier],
      active: true,
    };
  }

  // Default: free tier
  return {
    tier: 'free',
    label: 'Free',
    limits: TIER_LIMITS.free,
    active: true,
  };
}