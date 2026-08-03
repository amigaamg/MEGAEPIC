// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Universal Marketplace Engine (Engine VIII)
// Healthcare capability store: modules install constitutional capabilities,
// never uncontrolled code.
// ═══════════════════════════════════════════════════════════════════════════════

export type ModuleCategory =
  | 'clinical'
  | 'administration'
  | 'education'
  | 'research'
  | 'integration'
  | 'telemedicine'
  | 'reporting'
  | 'security'
  | 'laboratory'
  | 'pharmacy'
  | 'imaging'
  | 'billing'
  | 'scheduling';

export type ModuleStatus =
  | 'installed'
  | 'available'
  | 'deprecated'
  | 'blocked'
  | 'pending_approval';

export type ModuleApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface MarketplaceModule {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  version: string;
  author: string;
  maintainer: string;
  status: ModuleStatus;
  requiredTier: string;
  requiredVerificationLevel: number;
  requiredRoles: string[];
  requiredOrgs: string[];
  capabilities: string[];
  dependencies: string[];
  compatibleOrgs: string[];
  icon: string;
  documentationUrl: string;
  repositoryUrl: string;
  license: string;
  privacyPolicy: string;
  termsOfService: string;
  createdAt: number;
  updatedAt: number;
  installedAt: number | null;
  installedBy: string | null;
  config: Record<string, unknown>;
  lastUpdated: number;
  approvalStatus: ModuleApprovalStatus;
  approvedBy: string | null;
  approvedAt: number | null;
  rejectionReason: string | null;
}

export function isModuleCompatible(module: MarketplaceModule, dependenciesAvailable: string[]): { ok: boolean; missing: string[] } {
  const missing = module.dependencies.filter((d) => !dependenciesAvailable.includes(d));
  return { ok: module.status === 'available' && missing.length === 0, missing };
}

export function isApproved(module: MarketplaceModule): boolean {
  return module.approvalStatus === 'approved';
}

export function canInstall(module: MarketplaceModule): boolean {
  return module.status === 'available' && module.approvalStatus === 'approved';
}