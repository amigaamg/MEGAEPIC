'use client';
import { useState, useMemo } from 'react';
import { ShoppingCart, Search, Filter, Plus, Edit3, Trash2, Download, Upload, Shield, CheckCircle, XCircle, Clock, AlertTriangle, Package, Star, Zap, Lock, Unlock, Globe, Server, Cpu, Database, Wifi, ShieldCheck, Settings } from 'lucide-react';
import { ModuleCategory, ModuleStatus, type MarketplaceModule } from '@/lib/amexan/constitution/marketplace-engine';
import { SubscriptionTier } from '@/lib/amexan/constitution/capability-engine';

const CATEGORIES: { value: ModuleCategory; label: string; icon: string }[] = [
  { value: 'clinical', label: 'Clinical', icon: '🏥' },
  { value: 'administration', label: 'Administration', icon: '⚙️' },
  { value: 'research', label: 'Research', icon: '🔬' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'telemedicine', label: 'Telemedicine', icon: '📹' },
  { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { value: 'laboratory', label: 'Laboratory', icon: '🧪' },
  { value: 'imaging', label: 'Imaging', icon: '📷' },
  { value: 'billing', label: 'Billing', icon: '💰' },
  { value: 'scheduling', label: 'Scheduling', icon: '📅' },
  { value: 'reporting', label: 'Reporting', icon: '📊' },
  { value: 'integration', label: 'Integration', icon: '🔗' },
  { value: 'security', label: 'Security', icon: '🔒' },
];

const TIER_OPTIONS: SubscriptionTier[] = ['starter', 'professional', 'enterprise', 'national'];

const STATUS_OPTIONS: ModuleStatus[] = ['installed', 'available', 'deprecated', 'blocked', 'pending_approval'];

const MOCK_MODULES: MarketplaceModule[] = [
  { id: 'mod_fhir', name: 'FHIR Integration', description: 'Full FHIR R4 compliance with HL7 interoperability', category: 'integration', version: '2.1.0', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'installed', requiredTier: 'enterprise', requiredVerificationLevel: 2, requiredRoles: ['admin', 'clinician'], requiredOrgs: [], capabilities: ['fhir', 'api_access'], dependencies: [], compatibleOrgs: [], icon: '🔗', documentationUrl: 'https://docs.amexan.io/fhir', repositoryUrl: 'https://github.com/amexan/fhir', license: 'MIT', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 180, updatedAt: Date.now() - 86400000 * 7, installedAt: Date.now() - 86400000 * 90, installedBy: 'org_1', config: { endpoint: 'https://fhir.amexan.io', version: 'R4' }, lastUpdated: Date.now() - 86400000 * 7, approvalStatus: 'approved', approvedBy: 'platform_admin', approvedAt: Date.now() - 86400000 * 180, rejectionReason: null },
  { id: 'mod_pacs', name: 'PACS Connector', description: 'DICOM PACS integration for radiology imaging', category: 'integration', version: '1.5.2', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'installed', requiredTier: 'enterprise', requiredVerificationLevel: 2, requiredRoles: ['admin', 'radiographer'], requiredOrgs: [], capabilities: ['pacs', 'fhir'], dependencies: ['mod_fhir'], compatibleOrgs: [], icon: '📷', documentationUrl: 'https://docs.amexan.io/pacs', repositoryUrl: 'https://github.com/amexan/pacs', license: 'MIT', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 200, updatedAt: Date.now() - 86400000 * 14, installedAt: Date.now() - 86400000 * 120, installedBy: 'org_2', config: { pacsHost: 'pacs.hospital.ke', aeTitle: 'AMEXAN_PACS' }, lastUpdated: Date.now() - 86400000 * 14, approvalStatus: 'approved', approvedBy: 'platform_admin', approvedAt: Date.now() - 86400000 * 200, rejectionReason: null },
  { id: 'mod_lis', name: 'LIS Bridge', description: 'Laboratory Information System bidirectional interface', category: 'integration', version: '3.0.1', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'available', requiredTier: 'enterprise', requiredVerificationLevel: 2, requiredRoles: ['admin', 'lab_tech'], requiredOrgs: [], capabilities: ['lis', 'fhir'], dependencies: ['mod_fhir'], compatibleOrgs: [], icon: '🧪', documentationUrl: 'https://docs.amexan.io/lis', repositoryUrl: 'https://github.com/amexan/lis', license: 'MIT', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 90, updatedAt: Date.now() - 86400000 * 30, installedAt: null, installedBy: null, config: {}, lastUpdated: Date.now() - 86400000 * 30, approvalStatus: 'approved', approvedBy: 'platform_admin', approvedAt: Date.now() - 86400000 * 90, rejectionReason: null },
  { id: 'mod_telemed', name: 'Telemedicine Pro', description: 'Video consultation, remote monitoring, and e-prescribing', category: 'telemedicine', version: '4.2.0', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'installed', requiredTier: 'professional', requiredVerificationLevel: 1, requiredRoles: ['doctor', 'nurse', 'clinician'], requiredOrgs: [], capabilities: ['telemedicine', 'fhir'], dependencies: [], compatibleOrgs: [], icon: '📹', documentationUrl: 'https://docs.amexan.io/telemed', repositoryUrl: 'https://github.com/amexan/telemed', license: 'Apache-2.0', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 365, updatedAt: Date.now() - 86400000 * 30, installedAt: Date.now() - 86400000 * 180, installedBy: 'org_1', config: { maxConcurrentCalls: 10, recordingEnabled: true }, lastUpdated: Date.now() - 86400000 * 30, approvalStatus: 'approved', approvedBy: 'platform_admin', approvedAt: Date.now() - 86400000 * 365, rejectionReason: null },
  { id: 'mod_research', name: 'Research Suite', description: 'Clinical trial management, data collection, and analysis', category: 'research', version: '1.8.0', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'available', requiredTier: 'professional', requiredVerificationLevel: 2, requiredRoles: ['admin', 'researcher'], requiredOrgs: [], capabilities: ['research', 'analytics'], dependencies: [], compatibleOrgs: [], icon: '🔬', documentationUrl: 'https://docs.amexan.io/research', repositoryUrl: 'https://github.com/amexan/research', license: 'MIT', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 120, updatedAt: Date.now() - 86400000 * 45, installedAt: null, installedBy: null, config: {}, lastUpdated: Date.now() - 86400000 * 45, approvalStatus: 'approved', approvedBy: 'platform_admin', approvedAt: Date.now() - 86400000 * 120, rejectionReason: null },
  { id: 'mod_edu', name: 'Education Portal', description: 'Learning management system with competency tracking', category: 'education', version: '2.0.3', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'installed', requiredTier: 'professional', requiredVerificationLevel: 1, requiredRoles: ['admin', 'clinician'], requiredOrgs: [], capabilities: ['education', 'analytics'], dependencies: [], compatibleOrgs: [], icon: '📚', documentationUrl: 'https://docs.amexan.io/education', repositoryUrl: 'https://github.com/amexan/education', license: 'MIT', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 200, updatedAt: Date.now() - 86400000 * 60, installedAt: Date.now() - 86400000 * 150, installedBy: 'org_1', config: { maxLearners: 50, selfPacedEnabled: true }, lastUpdated: Date.now() - 86400000 * 60, approvalStatus: 'approved', approvedBy: 'platform_admin', approvedAt: Date.now() - 86400000 * 200, rejectionReason: null },
  { id: 'mod_marketplace', name: 'Marketplace Core', description: 'Module marketplace with discovery, approval, and lifecycle management', category: 'administration', version: '1.0.0', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'installed', requiredTier: 'enterprise', requiredVerificationLevel: 3, requiredRoles: ['admin'], requiredOrgs: [], capabilities: ['marketplace', 'custom_integrations'], dependencies: [], compatibleOrgs: [], icon: '🛒', documentationUrl: 'https://docs.amexan.io/marketplace', repositoryUrl: 'https://github.com/amexan/marketplace', license: 'Apache-2.0', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 365, updatedAt: Date.now() - 86400000 * 90, installedAt: Date.now() - 86400000 * 300, installedBy: 'platform_admin', config: { autoApprove: false, maxModulesPerOrg: 20 }, lastUpdated: Date.now() - 86400000 * 90, approvalStatus: 'approved', approvedBy: 'platform_admin', approvedAt: Date.now() - 86400000 * 365, rejectionReason: null },
  { id: 'mod_national', name: 'National Reporting', description: 'DHIS2 integration and national health reporting', category: 'reporting', version: '1.2.0', author: 'AMEXAN Labs', maintainer: 'AMEXAN Core Team', status: 'available', requiredTier: 'national', requiredVerificationLevel: 4, requiredRoles: ['admin', 'national_admin'], requiredOrgs: [], capabilities: ['national_reporting', 'registries', 'population_health'], dependencies: ['mod_fhir'], compatibleOrgs: [], icon: '🌍', documentationUrl: 'https://docs.amexan.io/national', repositoryUrl: 'https://github.com/amexan/national', license: 'Apache-2.0', privacyPolicy: 'https://amexan.io/privacy', termsOfService: 'https://amexan.io/tos', createdAt: Date.now() - 86400000 * 60, updatedAt: Date.now() - 86400000 * 20, installedAt: null, installedBy: null, config: {}, lastUpdated: Date.now() - 86400000 * 20, approvalStatus: 'pending_approval', approvedBy: null, approvedAt: null, rejectionReason: null },
];

export default function MarketplacePage() {
  const [modules] = useState<MarketplaceModule[]>(MOCK_MODULES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ModuleCategory | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<SubscriptionTier | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ModuleStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'installed' | 'pending' | 'config'>('catalog');

  const filtered = useMemo(() => {
    return modules.filter(m => {
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (tierFilter !== 'all' && m.requiredTier !== tierFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [modules, search, categoryFilter, tierFilter, statusFilter]);

  const catalogCount = modules.filter(m => m.status === 'available' || m.status === 'pending_approval').length;
  const installedCount = modules.filter(m => m.status === 'installed').length;
  const pendingCount = modules.filter(m => m.status === 'pending_approval').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Module Marketplace</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Discover, install, and manage platform modules and integrations</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Publish Module
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Catalog', value: catalogCount, color: '#3B82F6', icon: <Package size={14} /> },
          { label: 'Installed', value: installedCount, color: '#10B981', icon: <CheckCircle size={14} /> },
          { label: 'Pending Approval', value: pendingCount, color: '#F59E0B', icon: <Clock size={14} /> },
          { label: 'Categories', value: CATEGORIES.length, color: '#8B5CF6', icon: <Globe size={14} /> },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2" style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
        {(['catalog', 'installed', 'pending', 'config'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: activeTab === tab ? 'rgba(6,182,212,0.15)' : 'transparent', color: activeTab === tab ? '#06B6D4' : '#64748B', fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', height: 36, padding: '0 10px 0 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as ModuleCategory | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value as SubscriptionTier | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Tiers</option>
          {TIER_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ModuleStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map(mod => {
          const category = CATEGORIES.find(c => c.value === mod.category);
          const statusColor = mod.status === 'installed' ? '#10B981' : mod.status === 'available' ? '#3B82F6' : mod.status === 'pending_approval' ? '#F59E0B' : mod.status === 'deprecated' ? '#64748B' : '#EF4444';
          const tierColor = mod.requiredTier === 'starter' ? '#10B981' : mod.requiredTier === 'professional' ? '#3B82F6' : mod.requiredTier === 'enterprise' ? '#8B5CF6' : '#F59E0B';
          return (
            <div key={mod.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{mod.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{mod.name}</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>{mod.id} · v{mod.version}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${statusColor}22`, color: statusColor }}>{mod.status.replace('_', ' ')}</span>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, marginBottom: 10 }}>{mod.description}</p>
              <div className="flex items-center gap-3" style={{ fontSize: 10, color: '#94A3B8', marginBottom: 8 }}>
                <span>{category?.label}</span>
                <span>·</span>
                <span style={{ color: tierColor }}>Tier: {mod.requiredTier}</span>
                <span>·</span>
                <span>by {mod.author}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {mod.capabilities.slice(0, 3).map(c => (
                  <span key={c} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{c}</span>
                ))}
                {mod.capabilities.length > 3 && <span style={{ fontSize: 9, color: '#64748B' }}>+{mod.capabilities.length - 3}</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mod.dependencies.length > 0 && <span style={{ fontSize: 9, color: '#F59E0B' }}>⚠ {mod.dependencies.length} dep(s)</span>}
                  {mod.requiredVerificationLevel > 0 && <span style={{ fontSize: 9, color: '#64748B' }}>🔒 Lvl {mod.requiredVerificationLevel}</span>}
                </div>
                <div className="flex gap-1">
                  {mod.status === 'available' && (
                    <button style={{ padding: '4px 10', borderRadius: 4, border: 'none', background: 'rgba(6,182,212,0.15)', color: '#06B6D4', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Install</button>
                  )}
                  {mod.status === 'installed' && (
                    <>
                      <button style={{ padding: '4px 10', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}><Settings size={10} /></button>
                      <button style={{ padding: '4px 10', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#EF4444', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Uninstall</button>
                    </>
                  )}
                  {mod.status === 'pending_approval' && (
                    <>
                      <button style={{ padding: '4px 10', borderRadius: 4, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Approve</button>
                      <button style={{ padding: '4px 10', borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}