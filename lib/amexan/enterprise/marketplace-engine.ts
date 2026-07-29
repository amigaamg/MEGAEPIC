// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN MARKETPLACE ENGINE
// Plugin store, themes, connectors, and extension management.
// ═══════════════════════════════════════════════════════════════════════════════

import { ProductId } from './business-constitution';

export type ExtensionType = 'plugin' | 'theme' | 'connector' | 'protocol' | 'ai_model' | 'dashboard' | 'education_content';

export type ExtensionCategory =
  | 'clinical' | 'radiology' | 'laboratory' | 'pharmacy' | 'billing'
  | 'analytics' | 'ai' | 'education' | 'research' | 'integration'
  | 'compliance' | 'reporting' | 'communication' | 'administration';

export type PricingModel = 'free' | 'one_time' | 'subscription' | 'usage_based';

export interface MarketplaceExtension {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: ExtensionType;
  category: ExtensionCategory;
  developer: string;
  version: string;
  minEngineVersion: string;
  pricingModel: PricingModel;
  price: number;
  currency: string;
  screenshots: string[];
  documentationUrl: string;
  supportUrl: string;
  rating: number;
  downloads: number;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  permissions: string[];
  dependencies: string[];
  compatiblePlans: string[];
}

export interface InstalledExtension {
  extensionId: string;
  organizationId: string;
  installedAt: string;
  enabled: boolean;
  config: Record<string, unknown>;
  version: string;
  lastUpdated: string;
  usageCount: number;
}

export class MarketplaceEngine {
  private catalog: Map<string, MarketplaceExtension> = new Map();
  private installations: Map<string, InstalledExtension[]> = new Map();

  registerExtension(ext: MarketplaceExtension): void {
    this.catalog.set(ext.id, ext);
  }

  registerBatch(extensions: MarketplaceExtension[]): void {
    for (const ext of extensions) extensions.forEach(e => this.catalog.set(e.id, e));
  }

  getExtension(id: string): MarketplaceExtension | undefined {
    return this.catalog.get(id);
  }

  search(query: { type?: ExtensionType; category?: ExtensionCategory; tag?: string; compatiblePlan?: string; pricing?: PricingModel }): MarketplaceExtension[] {
    return Array.from(this.catalog.values()).filter(ext => {
      if (query.type && ext.type !== query.type) return false;
      if (query.category && ext.category !== query.category) return false;
      if (query.tag && !ext.tags.includes(query.tag)) return false;
      if (query.compatiblePlan && !ext.compatiblePlans.includes(query.compatiblePlan)) return false;
      if (query.pricing && ext.pricingModel !== query.pricing) return false;
      return true;
    }).sort((a, b) => b.rating - a.rating || b.downloads - a.downloads);
  }

  install(orgId: string, extensionId: string): InstalledExtension | null {
    const ext = this.catalog.get(extensionId);
    if (!ext) return null;
    const installed: InstalledExtension = {
      extensionId, organizationId: orgId, installedAt: new Date().toISOString(),
      enabled: true, config: {}, version: ext.version, lastUpdated: new Date().toISOString(), usageCount: 0,
    };
    const existing = this.installations.get(orgId) || [];
    existing.push(installed);
    this.installations.set(orgId, existing);
    return installed;
  }

  uninstall(orgId: string, extensionId: string): boolean {
    const existing = this.installations.get(orgId) || [];
    const filtered = existing.filter(e => e.extensionId !== extensionId);
    if (filtered.length === existing.length) return false;
    this.installations.set(orgId, filtered);
    return true;
  }

  getInstalled(orgId: string): InstalledExtension[] {
    return this.installations.get(orgId) || [];
  }

  toggleExtension(orgId: string, extensionId: string, enabled: boolean): boolean {
    const existing = this.installations.get(orgId) || [];
    const ext = existing.find(e => e.extensionId === extensionId);
    if (!ext) return false;
    ext.enabled = enabled;
    return true;
  }

  updateConfig(orgId: string, extensionId: string, config: Record<string, unknown>): boolean {
    const existing = this.installations.get(orgId) || [];
    const ext = existing.find(e => e.extensionId === extensionId);
    if (!ext) return false;
    ext.config = { ...ext.config, ...config };
    return true;
  }

  incrementUsage(orgId: string, extensionId: string): void {
    const existing = this.installations.get(orgId) || [];
    const ext = existing.find(e => e.extensionId === extensionId);
    if (ext) ext.usageCount++;
  }

  getCatalogStats(): { total: number; byType: Record<string, number>; byCategory: Record<string, number> } {
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const ext of this.catalog.values()) {
      byType[ext.type] = (byType[ext.type] || 0) + 1;
      byCategory[ext.category] = (byCategory[ext.category] || 0) + 1;
    }
    return { total: this.catalog.size, byType, byCategory };
  }
}

export const marketplaceEngine = new MarketplaceEngine();

// ── Built-in Extensions ─────────────────────────────────────────────────────

export const BUILT_IN_EXTENSIONS: MarketplaceExtension[] = [
  { id: 'ext_radiology_ai', name: 'Radiology AI Assistant', description: 'AI-powered radiology interpretation and reporting', shortDescription: 'AI for radiology', type: 'ai_model', category: 'radiology', developer: 'AMEXAN AI', version: '1.0.0', minEngineVersion: '1.0.0', pricingModel: 'subscription', price: 200, currency: 'KES', screenshots: [], documentationUrl: '', supportUrl: '', rating: 4.5, downloads: 150, publishedAt: '2026-01-01', updatedAt: '2026-06-01', tags: ['ai', 'radiology', 'reporting'], permissions: ['read:imaging', 'write:reports'], dependencies: ['clinical_os'], compatiblePlans: ['enterprise', 'professional'] },
  { id: 'ext_dental', name: 'Dental Module', description: 'Complete dental practice management', shortDescription: 'Dental EMR', type: 'plugin', category: 'clinical', developer: 'AMEXAN Partners', version: '1.0.0', minEngineVersion: '1.0.0', pricingModel: 'subscription', price: 150, currency: 'KES', screenshots: [], documentationUrl: '', supportUrl: '', rating: 4.2, downloads: 80, publishedAt: '2026-03-01', updatedAt: '2026-06-01', tags: ['dental', 'specialty'], permissions: ['read:clinical', 'write:clinical'], dependencies: ['hmis'], compatiblePlans: ['enterprise', 'professional'] },
  { id: 'ext_oncology', name: 'Oncology Module', description: 'Cancer registry, staging, and treatment planning', shortDescription: 'Oncology EMR', type: 'plugin', category: 'clinical', developer: 'AMEXAN', version: '1.0.0', minEngineVersion: '1.0.0', pricingModel: 'subscription', price: 300, currency: 'KES', screenshots: [], documentationUrl: '', supportUrl: '', rating: 4.8, downloads: 45, publishedAt: '2026-05-01', updatedAt: '2026-06-01', tags: ['oncology', 'cancer', 'staging'], permissions: ['read:clinical', 'write:clinical'], dependencies: ['hmis'], compatiblePlans: ['enterprise'] },
  { id: 'ext_kenya_moh', name: 'Kenya MoH Reporting', description: 'Automated KHIS/DHIS2 reporting for Kenya', shortDescription: 'Kenya health reporting', type: 'connector', category: 'compliance', developer: 'AMEXAN Kenya', version: '2.0.0', minEngineVersion: '1.0.0', pricingModel: 'free', price: 0, currency: 'KES', screenshots: [], documentationUrl: '', supportUrl: '', rating: 4.6, downloads: 300, publishedAt: '2025-01-01', updatedAt: '2026-06-01', tags: ['kenya', 'dhis2', 'reporting', 'compliance'], permissions: ['read:aggregate', 'write:reports'], dependencies: ['government_reporting'], compatiblePlans: ['enterprise', 'government'] },
  { id: 'ext_nhif', name: 'NHIF Claims Engine', description: 'Automated NHIF claim submission and tracking', shortDescription: 'NHIF integration', type: 'connector', category: 'billing', developer: 'AMEXAN', version: '1.5.0', minEngineVersion: '1.0.0', pricingModel: 'usage_based', price: 5, currency: 'KES', screenshots: [], documentationUrl: '', supportUrl: '', rating: 4.3, downloads: 200, publishedAt: '2025-06-01', updatedAt: '2026-06-01', tags: ['insurance', 'nhif', 'claims'], permissions: ['read:claims', 'write:claims'], dependencies: ['billing'], compatiblePlans: ['enterprise', 'professional', 'government'] },
  { id: 'ext_icu_protocols', name: 'ICU Protocol Pack', description: 'Evidence-based ICU protocols and order sets', shortDescription: 'ICU protocols', type: 'protocol', category: 'clinical', developer: 'AMEXAN Critical Care', version: '1.0.0', minEngineVersion: '1.0.0', pricingModel: 'one_time', price: 500, currency: 'KES', screenshots: [], documentationUrl: '', supportUrl: '', rating: 4.7, downloads: 120, publishedAt: '2026-02-01', updatedAt: '2026-06-01', tags: ['icu', 'protocols', 'critical care'], permissions: ['read:clinical'], dependencies: ['clinical_os'], compatiblePlans: ['enterprise'] },
];