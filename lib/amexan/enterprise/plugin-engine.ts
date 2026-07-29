// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN PLUGIN SDK & DEVELOPER CONSTITUTION
// Developer registration, plugin manifests, versioning, validation,
// API key management. Pure business logic. No medical rules.
// ═══════════════════════════════════════════════════════════════════════════════

import { PlanId } from './business-constitution';

export interface DeveloperRegistration {
  id: string;
  name: string;
  email: string;
  organizationId?: string;
  status: 'pending' | 'verified' | 'suspended';
  joinedAt: string;
  verifiedAt?: string;
  apiKeys: DeveloperApiKey[];
  plugins: string[];
  rating: number;
  totalDownloads: number;
  totalRevenue: number;
}

export interface DeveloperApiKey {
  id: string;
  key: string;
  label: string;
  environment: 'development' | 'staging' | 'production';
  permissions: PluginPermission[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  developerId: string;
  version: string;
  minEngineVersion: string;
  maxEngineVersion?: string;
  type: PluginType;
  category: PluginCategory;
  permissions: PluginPermission[];
  hooks: PluginHook[];
  configSchema: Record<string, unknown>;
  screenshots: string[];
  documentationUrl: string;
  supportUrl: string;
  repositoryUrl?: string;
  license: string;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived';
  compatiblePlans: PlanId[];
  pricingModel: 'free' | 'one_time' | 'subscription' | 'usage_based';
  price: number;
  currency: string;
  tags: string[];
  dependencies: string[];
}

export type PluginType = 'ui_extension' | 'protocol' | 'connector' | 'ai_model' | 'report' | 'dashboard' | 'theme' | 'workflow' | 'integration' | 'clinical_rule';

export type PluginCategory =
  | 'clinical' | 'radiology' | 'laboratory' | 'pharmacy' | 'billing'
  | 'analytics' | 'ai' | 'education' | 'research' | 'integration'
  | 'compliance' | 'reporting' | 'communication' | 'administration' | 'infrastructure';

export type PluginPermission =
  | 'read:patient' | 'write:patient' | 'read:clinical' | 'write:clinical'
  | 'read:orders' | 'write:orders' | 'read:results' | 'write:results'
  | 'read:billing' | 'write:billing' | 'read:admin' | 'write:admin'
  | 'read:analytics' | 'export:data' | 'webhook:receive' | 'webhook:send';

export type PluginHook =
  | 'on_patient_registration' | 'on_order_placed' | 'on_result_received'
  | 'on_diagnosis_entered' | 'on_prescription_written' | 'on_discharge'
  | 'on_invoice_generated' | 'before_save' | 'after_save'
  | 'custom_menu_item' | 'dashboard_widget' | 'report_block';

export interface PluginVersion {
  pluginId: string;
  version: string;
  manifest: PluginManifest;
  changelog: string;
  publishedAt: string;
  downloads: number;
  minEngineVersion: string;
}

export class PluginEngine {
  private developers: Map<string, DeveloperRegistration> = new Map();
  private manifests: Map<string, PluginManifest> = new Map();
  private versions: Map<string, PluginVersion[]> = new Map();
  private installCounts: Map<string, number> = new Map();

  // ── Developer Registration ─────────────────────────────────────────────────

  registerDeveloper(dev: Omit<DeveloperRegistration, 'id' | 'apiKeys' | 'plugins' | 'rating' | 'totalDownloads' | 'totalRevenue' | 'joinedAt'>): DeveloperRegistration {
    const created: DeveloperRegistration = {
      ...dev, id: `dev_${Date.now()}`,
      joinedAt: new Date().toISOString(),
      apiKeys: [], plugins: [],
      rating: 0, totalDownloads: 0, totalRevenue: 0,
    };
    this.developers.set(created.id, created);
    return created;
  }

  getDeveloper(id: string): DeveloperRegistration | undefined {
    return this.developers.get(id);
  }

  verifyDeveloper(devId: string): boolean {
    const dev = this.developers.get(devId);
    if (!dev || dev.status !== 'pending') return false;
    this.developers.set(devId, { ...dev, status: 'verified', verifiedAt: new Date().toISOString() });
    return true;
  }

  // ── API Keys ───────────────────────────────────────────────────────────────

  generateApiKey(devId: string, label: string, environment: DeveloperApiKey['environment'], permissions: PluginPermission[]): DeveloperApiKey | null {
    const dev = this.developers.get(devId);
    if (!dev || dev.status !== 'verified') return null;

    const key: DeveloperApiKey = {
      id: `apikey_${Date.now()}`,
      key: `amx_${devId.slice(0, 8)}_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')}`,
      label, environment, permissions,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    };
    this.developers.set(devId, { ...dev, apiKeys: [...dev.apiKeys, key] });
    return key;
  }

  revokeApiKey(devId: string, keyId: string): boolean {
    const dev = this.developers.get(devId);
    if (!dev) return false;
    const keys = dev.apiKeys.map(k => k.id === keyId ? { ...k, status: 'revoked' as const } : k);
    this.developers.set(devId, { ...dev, apiKeys: keys });
    return true;
  }

  validateApiKey(key: string): { valid: boolean; developer?: DeveloperRegistration; permissions?: PluginPermission[] } {
    for (const dev of this.developers.values()) {
      const found = dev.apiKeys.find(k => k.key === key);
      if (found) {
        if (found.status !== 'active') return { valid: false };
        if (new Date(found.expiresAt) < new Date()) return { valid: false };
        return { valid: true, developer: dev, permissions: found.permissions };
      }
    }
    return { valid: false };
  }

  // ── Plugin Manifest & Versioning ───────────────────────────────────────────

  registerPlugin(manifest: Omit<PluginManifest, 'publishedAt' | 'updatedAt' | 'status'>): PluginManifest {
    const created: PluginManifest = {
      ...manifest,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    this.manifests.set(created.id, created);

    const dev = this.developers.get(manifest.developerId);
    if (dev) {
      this.developers.set(manifest.developerId, {
        ...dev, plugins: [...dev.plugins, created.id],
      });
    }

    return created;
  }

  submitForReview(pluginId: string): boolean {
    const manifest = this.manifests.get(pluginId);
    if (!manifest || manifest.status !== 'draft') return false;
    this.manifests.set(pluginId, { ...manifest, status: 'pending_review', updatedAt: new Date().toISOString() });
    return true;
  }

  approvePlugin(pluginId: string): boolean {
    const manifest = this.manifests.get(pluginId);
    if (!manifest || manifest.status !== 'pending_review') return false;
    this.manifests.set(pluginId, { ...manifest, status: 'approved', updatedAt: new Date().toISOString() });
    return true;
  }

  rejectPlugin(pluginId: string, reason: string): boolean {
    const manifest = this.manifests.get(pluginId);
    if (!manifest || manifest.status !== 'pending_review') return false;
    this.manifests.set(pluginId, { ...manifest, status: 'rejected', updatedAt: new Date().toISOString() });
    return true;
  }

  publishPlugin(pluginId: string): PluginManifest | null {
    const manifest = this.manifests.get(pluginId);
    if (!manifest || (manifest.status !== 'approved' && manifest.status !== 'draft')) return null;

    const published = { ...manifest, status: 'published' as const, updatedAt: new Date().toISOString() };
    this.manifests.set(pluginId, published);

    const existingVersions = this.versions.get(pluginId) || [];
    const versionEntry: PluginVersion = {
      pluginId, version: manifest.version, manifest: published,
      changelog: '', publishedAt: published.publishedAt,
      downloads: 0, minEngineVersion: manifest.minEngineVersion,
    };
    this.versions.set(pluginId, [...existingVersions, versionEntry]);

    return published;
  }

  getPlugin(id: string): PluginManifest | undefined {
    return this.manifests.get(id);
  }

  getPluginVersions(pluginId: string): PluginVersion[] {
    return this.versions.get(pluginId) || [];
  }

  searchPlugins(query: { type?: PluginType; category?: PluginCategory; tag?: string; compatiblePlan?: string; status?: string; searchText?: string }): PluginManifest[] {
    return Array.from(this.manifests.values()).filter(p => {
      if (query.status && p.status !== query.status) return false;
      if (query.type && p.type !== query.type) return false;
      if (query.category && p.category !== query.category) return false;
      if (query.tag && !p.tags.includes(query.tag)) return false;
      if (query.compatiblePlan && !p.compatiblePlans.includes(query.compatiblePlan as PlanId)) return false;
      if (query.searchText) {
        const text = query.searchText.toLowerCase();
        if (!p.name.toLowerCase().includes(text) && !p.description.toLowerCase().includes(text)) return false;
      }
      return true;
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  recordInstall(pluginId: string): void {
    this.installCounts.set(pluginId, (this.installCounts.get(pluginId) || 0) + 1);
    const devId = this.manifests.get(pluginId)?.developerId;
    if (devId) {
      const dev = this.developers.get(devId);
      if (dev) this.developers.set(devId, { ...dev, totalDownloads: dev.totalDownloads + 1 });
    }
  }

  getInstallCount(pluginId: string): number {
    return this.installCounts.get(pluginId) || 0;
  }

  validatePluginCompatibility(pluginId: string, engineVersion: string): { compatible: boolean; reason?: string } {
    const plugin = this.manifests.get(pluginId);
    if (!plugin) return { compatible: false, reason: 'Plugin not found' };
    if (plugin.status !== 'published') return { compatible: false, reason: 'Plugin not published' };

    const minParts = plugin.minEngineVersion.split('.').map(Number);
    const engineParts = engineVersion.split('.').map(Number);

    for (let i = 0; i < Math.max(minParts.length, engineParts.length); i++) {
      const min = minParts[i] || 0;
      const eng = engineParts[i] || 0;
      if (eng < min) return { compatible: false, reason: `Requires engine >= ${plugin.minEngineVersion}` };
      if (eng > min) return { compatible: true };
    }

    if (plugin.maxEngineVersion) {
      const maxParts = plugin.maxEngineVersion.split('.').map(Number);
      for (let i = 0; i < Math.max(maxParts.length, engineParts.length); i++) {
        const max = maxParts[i] || 999;
        const eng = engineParts[i] || 0;
        if (eng > max) return { compatible: false, reason: `Requires engine <= ${plugin.maxEngineVersion}` };
      }
    }

    return { compatible: true };
  }

  getDeveloperStats(devId: string): { totalPlugins: number; published: number; totalDownloads: number; totalRevenue: number; rating: number } {
    const dev = this.developers.get(devId);
    if (!dev) return { totalPlugins: 0, published: 0, totalDownloads: 0, totalRevenue: 0, rating: 0 };
    const published = dev.plugins.filter(id => this.manifests.get(id)?.status === 'published').length;
    return { totalPlugins: dev.plugins.length, published, totalDownloads: dev.totalDownloads, totalRevenue: dev.totalRevenue, rating: dev.rating };
  }

  getMarketplaceStats(): { totalPlugins: number; published: number; byType: Record<string, number>; byCategory: Record<string, number>; totalDevelopers: number; totalInstalls: number } {
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let published = 0, totalInstalls = 0;

    for (const plugin of this.manifests.values()) {
      byType[plugin.type] = (byType[plugin.type] || 0) + 1;
      byCategory[plugin.category] = (byCategory[plugin.category] || 0) + 1;
      if (plugin.status === 'published') published++;
    }

    for (const count of this.installCounts.values()) totalInstalls += count;

    return {
      totalPlugins: this.manifests.size, published, byType, byCategory,
      totalDevelopers: this.developers.size, totalInstalls,
    };
  }
}

export const pluginEngine = new PluginEngine();