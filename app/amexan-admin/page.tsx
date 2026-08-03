'use client';
import { useState, useMemo } from 'react';
import { Shield, Users, Building2, CreditCard, CheckCircle, XCircle, AlertTriangle, Search, Settings, Activity, BarChart3, Globe, Lock, Key, Server, Database, Bell, TrendingUp, ArrowRight, UserPlus, UserCog, LayoutDashboard, ClipboardList, Plus, Edit3, Trash2, Filter, Download, Upload, Mail, Phone, IdCard, Calendar, MapPin, Star, Award, BookOpen, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { getAllPlans, type SubscriptionPlan, type SubscriptionTier } from '@/lib/amexan/constitution/capability-engine';
import { VerificationLevel } from '@/lib/amexan/identity/types';
import { getAllOrgs, type Organization } from '@/lib/amexan/organization';
import { getActiveOrganizationId } from '@/lib/firebase/orgContext';

const TIER_COLORS: Record<SubscriptionTier, string> = {
  starter: '#10B981',
  professional: '#3B82F6',
  enterprise: '#8B5CF6',
  national: '#F59E0B',
};

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  starter: ['basic_emr', 'appointments', 'billing', 'patients', 'telemedicine', 'clinical_intelligence'],
  professional: ['analytics', 'research', 'education', 'ai_assisted', 'fhir', 'pacs', 'lis'],
  enterprise: ['marketplace', 'multi_facility', 'registries', 'population_health', 'national_reporting', 'sso', 'api_access'],
  national: ['white_label', 'custom_integrations', 'priority_support', 'dedicated_account_manager', 'onboarding_training'],
};

const VERIFICATION_LEVELS = [
  { level: 0, label: 'Anonymous', color: '#64748B' },
  { level: 1, label: 'Email Verified', color: '#10B981' },
  { level: 2, label: 'Gov ID Verified', color: '#3B82F6' },
  { level: 3, label: 'License Verified', color: '#8B5CF6' },
  { level: 4, label: 'Institutional', color: '#F59E0B' },
  { level: 5, label: 'System Trust', color: '#EF4444' },
];

const MOCK_TENANTS = [
  { id: 'org_1', name: 'Aga Khan Hospital', type: 'hospital', country: 'KE', tier: 'professional' as SubscriptionTier, users: 45, status: 'active', verificationLevel: 3 },
  { id: 'org_2', name: 'Kenyatta National Hospital', type: 'hospital', country: 'KE', tier: 'enterprise' as SubscriptionTier, users: 320, status: 'active', verificationLevel: 4 },
  { id: 'org_3', name: 'Mombasa Clinic Network', type: 'clinic', country: 'KE', tier: 'starter' as SubscriptionTier, users: 12, status: 'active', verificationLevel: 2 },
  { id: 'org_4', name: 'Kisumu Regional Lab', type: 'lab', country: 'KE', tier: 'professional' as SubscriptionTier, users: 28, status: 'active', verificationLevel: 3 },
  { id: 'org_5', name: 'Nairobi Pharmacy Chain', type: 'pharmacy', country: 'KE', tier: 'starter' as SubscriptionTier, users: 18, status: 'suspended', verificationLevel: 1 },
  { id: 'org_6', name: 'Ministry of Health', type: 'ministry', country: 'KE', tier: 'national' as SubscriptionTier, users: 1200, status: 'active', verificationLevel: 5 },
];

const MOCK_VERIFICATION_REQUESTS = [
  { id: 'VR-001', uid: 'DOC-001', name: 'Dr. Wanjiku', type: 'Doctor', currentLevel: 1, requestedLevel: 3, status: 'pending', submittedAt: Date.now() - 86400000 },
  { id: 'VR-002', uid: 'NUR-001', name: 'Nurse Odera', type: 'Nurse', currentLevel: 2, requestedLevel: 2, status: 'approved', submittedAt: Date.now() - 172800000 },
  { id: 'VR-003', uid: 'LAB-001', name: 'Lab Tech Mutua', type: 'Laboratory', currentLevel: 0, requestedLevel: 2, status: 'pending', submittedAt: Date.now() - 43200000 },
  { id: 'VR-004', uid: 'PHR-001', name: 'Pharmacist Atieno', type: 'Pharmacist', currentLevel: 1, requestedLevel: 3, status: 'rejected', submittedAt: Date.now() - 259200000 },
];

export default function AmexanAdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'subscriptions' | 'verification' | 'users' | 'dashboards' | 'marketplace' | 'telemetry'>('overview');
  const [search, setSearch] = useState('');

  const plans = getAllPlans();
  const activeOrgId = getActiveOrganizationId();

  const stats = useMemo(() => ({
    totalTenants: MOCK_TENANTS.length,
    activeTenants: MOCK_TENANTS.filter(t => t.status === 'active').length,
    totalUsers: MOCK_TENANTS.reduce((s, t) => s + t.users, 0),
    pendingVerifications: MOCK_VERIFICATION_REQUESTS.filter(v => v.status === 'pending').length,
    totalRevenue: MOCK_TENANTS.reduce((s, t) => {
      const plan = plans.find(p => p.tier === t.tier);
      return s + (plan?.pricePerMonth ?? 0);
    }, 0),
  }), [plans]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>AMEXAN Platform Admin</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Platform-level management: tenants, subscriptions, verification, telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>Platform Active</span>
          <span style={{ fontSize: 10, color: '#64748B' }}>{activeOrgId}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Tenants', value: stats.totalTenants, color: '#06B6D4', icon: <Globe size={14} /> },
          { label: 'Active', value: stats.activeTenants, color: '#10B981', icon: <CheckCircle size={14} /> },
          { label: 'Total Users', value: stats.totalUsers, color: '#3B82F6', icon: <Users size={14} /> },
          { label: 'Pending Verifications', value: stats.pendingVerifications, color: '#F59E0B', icon: <Key size={14} /> },
          { label: 'Monthly Revenue', value: `KES ${stats.totalRevenue.toLocaleString()}`, color: '#8B5CF6', icon: <CreditCard size={14} /> },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2" style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
        {(['overview', 'tenants', 'subscriptions', 'verification', 'users', 'dashboards', 'marketplace', 'telemetry'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
              background: activeTab === tab ? 'rgba(6,182,212,0.15)' : 'transparent',
              color: activeTab === tab ? '#06B6D4' : '#64748B',
              fontSize: 12, fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              textTransform: 'capitalize',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'tenants' && <TenantsTab search={search} onSearch={setSearch} />}
      {activeTab === 'subscriptions' && <SubscriptionsTab plans={plans} />}
      {activeTab === 'verification' && <VerificationTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'dashboards' && <DashboardsTab />}
      {activeTab === 'marketplace' && <MarketplaceAdminTab />}
      {activeTab === 'telemetry' && <TelemetryTab />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
        <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}><Activity size={16} color="#06B6D4" /> Tenant Distribution</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['professional', 'enterprise', 'starter', 'national'].map(tier => {
            const count = MOCK_TENANTS.filter(t => t.tier === tier).length;
            const pct = (count / MOCK_TENANTS.length) * 100;
            return (
              <div key={tier} className="flex items-center gap-3">
                <span style={{ fontSize: 11, color: '#94A3B8', width: 80, textTransform: 'capitalize' }}>{tier}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: TIER_COLORS[tier], transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 11, color: '#64748B', width: 30, textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
        <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}><Bell size={16} color="#F59E0B" /> Verification Queue</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_VERIFICATION_REQUESTS.filter(v => v.status === 'pending').map(v => (
            <div key={v.id} className="flex items-center justify-between" style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{v.name}</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>{v.type} · {v.currentLevel} → {v.requestedLevel}</div>
              </div>
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>pending</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
        <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}><TrendingUp size={16} color="#10B981" /> System Health</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'API Latency', value: '42ms', status: 'good' },
            { label: 'Firestore Connections', value: '1,247', status: 'good' },
            { label: 'JWT Verification Rate', value: '99.8%', status: 'good' },
            { label: 'Error Rate', value: '0.03%', status: 'good' },
            { label: 'Active Sessions', value: '342', status: 'warning' },
            { label: 'Notification Queue', value: '12 pending', status: 'good' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{item.label}</span>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{item.value}</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.status === 'good' ? '#10B981' : '#F59E0B' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20, gridColumn: 'span 2' }}>
        <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}><Server size={16} color="#8B5CF6" /> Recent Tenant Activity</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Tenant', 'Type', 'Tier', 'Users', 'Status', 'Verification', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TENANTS.map(org => (
                <tr key={org.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 12px', color: '#E2E8F0', fontWeight: 500 }}>{org.name}</td>
                  <td style={{ padding: '10px 12px', color: '#94A3B8', textTransform: 'capitalize' }}>{org.type}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${TIER_COLORS[org.tier]}22`, color: TIER_COLORS[org.tier] }}>{org.tier}</span></td>
                  <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{org.users}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: org.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: org.status === 'active' ? '#10B981' : '#EF4444' }}>{org.status}</span></td>
                  <td style={{ padding: '10px 12px' }}><span style={{ fontSize: 10, color: '#94A3B8' }}>Level {org.verificationLevel}</span></td>
                  <td style={{ padding: '10px 12px' }}><button style={{ fontSize: 10, color: '#06B6D4', background: 'none', border: 'none', cursor: 'pointer' }}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TenantsTab({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  const filtered = useMemo(() => {
    if (!search) return MOCK_TENANTS;
    const q = search.toLowerCase();
    return MOCK_TENANTS.filter(t => t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2" style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input placeholder="Search tenants..." value={search} onChange={e => onSearch(e.target.value)} style={{ width: '100%', height: 36, padding: '0 10px 0 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
        {filtered.map(org => (
          <div key={org.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4', fontSize: 14 }}><Building2 size={16} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{org.name}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>{org.id} · {org.type} · {org.country}</div>
                </div>
              </div>
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: org.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: org.status === 'active' ? '#10B981' : '#EF4444' }}>{org.status}</span>
            </div>
            <div className="flex items-center gap-4" style={{ fontSize: 11, color: '#94A3B8' }}>
              <span>Tier: <strong style={{ color: TIER_COLORS[org.tier] }}>{org.tier}</strong></span>
              <span>Users: {org.users}</span>
              <span>Verification: Level {org.verificationLevel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionsTab({ plans }: { plans: SubscriptionPlan[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Subscription Plans</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {plans.map(plan => (
          <div key={plan.tier} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20, borderTop: `3px solid ${TIER_COLORS[plan.tier]}` }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', fontFamily: "'Syne',sans-serif" }}>{plan.name}</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>{plan.tier}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: TIER_COLORS[plan.tier], fontFamily: "'Syne',sans-serif" }}>KES {plan.pricePerMonth.toLocaleString()}</div>
            </div>
            <p style={{ fontSize: 11, color: '#64748B', marginBottom: 12, lineHeight: 1.5 }}>{plan.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Users: {plan.maxUsersPerOrg}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Orgs: {plan.maxOrganizations}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Storage: {plan.maxStorageGB}GB</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>FHIR: {plan.includesFHIR ? '✓' : '✗'}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {TIER_FEATURES[plan.tier].slice(0, 6).map(f => (
                <span key={f} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{f}</span>
              ))}
              {TIER_FEATURES[plan.tier].length > 6 && <span style={{ fontSize: 9, color: '#64748B' }}>+{TIER_FEATURES[plan.tier].length - 6}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerificationTab() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const filtered = useMemo(() => filter === 'all' ? MOCK_VERIFICATION_REQUESTS : MOCK_VERIFICATION_REQUESTS.filter(v => v.status === filter), [filter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: filter === f ? 'rgba(6,182,212,0.15)' : 'transparent', color: filter === f ? '#06B6D4' : '#64748B', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(v => (
          <div key={v.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-4">
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#8B5CF6', fontWeight: 600 }}>{v.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{v.name} <span style={{ fontSize: 10, color: '#64748B' }}>{v.type}</span></div>
                <div style={{ fontSize: 10, color: '#64748B' }}>{v.uid} · Verification {v.currentLevel} → {v.requestedLevel}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: v.status === 'pending' ? 'rgba(245,158,11,0.15)' : v.status === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: v.status === 'pending' ? '#F59E0B' : v.status === 'approved' ? '#10B981' : '#EF4444' }}>{v.status}</span>
              {v.status === 'pending' && (
                <div className="flex gap-1">
                  <button style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Approve</button>
                  <button style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceAdminTab() {
  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Module Marketplace Management</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {[
          { name: 'FHIR Integration', category: 'integration', tier: 'enterprise', status: 'installed', installs: 12 },
          { name: 'PACS Connector', category: 'integration', tier: 'enterprise', status: 'installed', installs: 8 },
          { name: 'LIS Bridge', category: 'integration', tier: 'enterprise', status: 'available', installs: 0 },
          { name: 'Telemedicine Pro', category: 'telemedicine', tier: 'professional', status: 'installed', installs: 25 },
          { name: 'Research Suite', category: 'research', tier: 'professional', status: 'available', installs: 0 },
          { name: 'Education Portal', category: 'education', tier: 'professional', status: 'installed', installs: 15 },
          { name: 'Marketplace Core', category: 'administration', tier: 'enterprise', status: 'installed', installs: 6 },
          { name: 'National Reporting', category: 'reporting', tier: 'national', status: 'available', installs: 0 },
        ].map(mod => (
          <div key={mod.name} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{mod.name}</span>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: mod.status === 'installed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: mod.status === 'installed' ? '#10B981' : '#F59E0B' }}>{mod.status}</span>
            </div>
            <div className="flex items-center gap-3" style={{ fontSize: 10, color: '#64748B' }}>
              <span>{mod.category}</span>
              <span>·</span>
              <span style={{ color: TIER_COLORS[mod.tier as SubscriptionTier] }}>{mod.tier}</span>
              <span>·</span>
              <span>{mod.installs} installs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TelemetryTab() {
  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>System Telemetry</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { label: 'Requests/min', value: '1,247', change: '+12%', positive: true },
          { label: 'Avg Response', value: '42ms', change: '-8ms', positive: true },
          { label: 'Error Rate', value: '0.03%', change: '-0.01%', positive: true },
          { label: 'P99 Latency', value: '187ms', change: '+12ms', positive: false },
          { label: 'Active Connections', value: '342', change: '+18', positive: true },
          { label: 'Firestore Reads', value: '84.2K', change: '+5.3K', positive: false },
          { label: 'JWT Verifications', value: '99.8%', change: '+0.1%', positive: true },
          { label: 'Notification Queue', value: '12', change: '-3', positive: true },
        ].map(item => (
          <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>{item.label}</div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', fontFamily: "'Syne',sans-serif" }}>{item.value}</span>
              <span style={{ fontSize: 10, color: item.positive ? '#10B981' : '#EF4444' }}>{item.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// USERS TAB — User Registration Management
// ═══════════════════════════════════════════════════════════════════════

const AMEXAN_ROLES = [
  { id: 'medical_doctor', label: 'Medical Doctor', icon: '👨‍⚕️', color: '#2563EB' },
  { id: 'nurse', label: 'Nurse', icon: '👩‍⚕️', color: '#059669' },
  { id: 'pharmacist', label: 'Pharmacist', icon: '💊', color: '#D97706' },
  { id: 'lab_technologist', label: 'Lab Technologist', icon: '🧪', color: '#7C3AED' },
  { id: 'radiographer', label: 'Radiographer', icon: '📷', color: '#06B6D4' },
  { id: 'clinical_officer', label: 'Clinical Officer', icon: '🏥', color: '#0891B2' },
  { id: 'midwife', label: 'Midwife', icon: '👶', color: '#EC4899' },
  { id: 'administrator', label: 'Administrator', icon: '⚙️', color: '#475569' },
  { id: 'it_staff', label: 'IT Staff', icon: '💻', color: '#6366F1' },
  { id: 'finance_staff', label: 'Finance Staff', icon: '💰', color: '#10B981' },
  { id: 'hr_staff', label: 'HR Staff', icon: '👥', color: '#F59E0B' },
  { id: 'receptionist', label: 'Receptionist', icon: '📋', color: '#14B8A6' },
  { id: 'records_officer', label: 'Records Officer', icon: '📁', color: '#8B5CF6' },
  { id: 'facility_admin', label: 'Facility Admin', icon: '🏢', color: '#64748B' },
  { id: 'super_admin', label: 'Super Admin', icon: '🛡️', color: '#EF4444' },
  { id: 'patient', label: 'Patient', icon: '🧑', color: '#0EA5E9' },
  { id: 'guardian', label: 'Guardian', icon: '👤', color: '#F97316' },
  { id: 'other', label: 'Other', icon: '👤', color: '#64748B' },
];

const MOCK_REGISTERED_USERS = [
  { id: 'USR-001', amxUid: 'DOC-001', name: 'Dr. Wanjiku', email: 'doctor@hospital.com', role: 'medical_doctor', org: 'Aga Khan Hospital', status: 'active', verified: 3, registeredAt: Date.now() - 86400000 * 180, lastLogin: Date.now() - 86400000 * 2 },
  { id: 'USR-002', amxUid: 'NUR-001', name: 'Nurse Odera', email: 'nurse@hospital.com', role: 'nurse', org: 'Aga Khan Hospital', status: 'active', verified: 2, registeredAt: Date.now() - 86400000 * 120, lastLogin: Date.now() - 86400000 * 1 },
  { id: 'USR-003', amxUid: 'LAB-001', name: 'Lab Tech Mutua', email: 'lab@hospital.com', role: 'lab_technologist', org: 'Kisumu Regional Lab', status: 'active', verified: 2, registeredAt: Date.now() - 86400000 * 90, lastLogin: Date.now() - 86400000 * 3 },
  { id: 'USR-004', amxUid: 'PAT-001', name: 'John Doe', email: 'john@patient.com', role: 'patient', org: 'Individual', status: 'active', verified: 1, registeredAt: Date.now() - 86400000 * 60, lastLogin: Date.now() - 86400000 * 5 },
  { id: 'USR-005', amxUid: 'ADM-001', name: 'Admin Kamau', email: 'admin@hospital.com', role: 'administrator', org: 'Aga Khan Hospital', status: 'active', verified: 4, registeredAt: Date.now() - 86400000 * 365, lastLogin: Date.now() - 86400000 * 1 },
  { id: 'USR-006', amxUid: 'GUARD-001', name: 'Grace Wanjiku', email: 'guardian@patient.com', role: 'guardian', org: 'Individual', status: 'pending', verified: 1, registeredAt: Date.now() - 86400000 * 7, lastLogin: null },
  { id: 'USR-007', amxUid: 'DOC-002', name: 'Dr. Kamau', email: 'dr.kamau@hospital.com', role: 'medical_doctor', org: 'Kenyatta National Hospital', status: 'suspended', verified: 3, registeredAt: Date.now() - 86400000 * 200, lastLogin: Date.now() - 86400000 * 30 },
  { id: 'USR-008', amxUid: 'REC-001', name: 'Receptionist Achieng', email: 'reception@hospital.com', role: 'receptionist', org: 'Aga Khan Hospital', status: 'active', verified: 2, registeredAt: Date.now() - 86400000 * 150, lastLogin: Date.now() - 86400000 * 4 },
];

function UsersTab() {
  const [users] = useState(MOCK_REGISTERED_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (orgFilter !== 'all' && u.org !== orgFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.amxUid.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter, orgFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    avgVerification: Math.round(users.reduce((s, u) => s + u.verified, 0) / users.length),
  }), [users]);

  const orgs = useMemo(() => [...new Set(users.map(u => u.org))], [users]);
  const roles = useMemo(() => [...new Set(users.map(u => u.role))], [users]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>User Registration Management</div>
        <div className="flex gap-2">
          <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} /> Export</button>
          <button style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}><UserPlus size={12} /> Add User</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Users', value: stats.total, color: '#06B6D4' },
          { label: 'Active', value: stats.active, color: '#10B981' },
          { label: 'Pending', value: stats.pending, color: '#F59E0B' },
          { label: 'Suspended', value: stats.suspended, color: '#EF4444' },
          { label: 'Avg Verification', value: stats.avgVerification, color: '#8B5CF6' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input placeholder="Search by name, email, or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', height: 36, padding: '0 10px 0 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Roles</option>
          {AMEXAN_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Organizations</option>
          {orgs.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(user => {
          const roleInfo = AMEXAN_ROLES.find(r => r.id === user.role);
          const statusColor = user.status === 'active' ? '#10B981' : user.status === 'pending' ? '#F59E0B' : '#EF4444';
          return (
            <div key={user.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-4">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${roleInfo?.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{roleInfo?.icon || '👤'}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{user.name}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>{user.id} · {user.amxUid} · {user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${statusColor}22`, color: statusColor }}>{user.status}</span>
                <span style={{ fontSize: 10, color: '#64748B' }}>Lvl {user.verified}</span>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>{user.org}</span>
                <div className="flex gap-1">
                  {user.status === 'pending' && (
                    <>
                      <button style={{ padding: '4px 8', borderRadius: 4, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Approve</button>
                      <button style={{ padding: '4px 8', borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Reject</button>
                    </>
                  )}
                  {user.status === 'suspended' && (
                    <button style={{ padding: '4px 8', borderRadius: 4, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Reactivate</button>
                  )}
                  {user.status === 'active' && (
                    <button style={{ padding: '4px 8', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#EF4444', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Suspend</button>
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

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARDS TAB — Dashboard Controlling Functions
// ═══════════════════════════════════════════════════════════════════════

const DASHBOARD_ROLES = [
  { role: 'medical_doctor', label: 'Medical Doctor', icon: '👨‍⚕️', sections: ['Today\'s Patients', 'Pending Orders', 'Lab Results', 'Prescriptions', 'Alerts', 'Schedule'], color: '#2563EB' },
  { role: 'nurse', label: 'Nurse', icon: '👩‍⚕️', sections: ['Assigned Patients', 'Vitals Monitoring', 'Medication Admin', 'Task List', 'Alerts'], color: '#059669' },
  { role: 'pharmacist', label: 'Pharmacist', icon: '💊', sections: ['Pending Prescriptions', 'Drug Interactions', 'Inventory Alerts', 'Dispensed Today'], color: '#D97706' },
  { role: 'lab_technologist', label: 'Lab Technologist', icon: '🧪', sections: ['Pending Specimens', 'Results Queue', 'QC Checks', 'Equipment Status'], color: '#7C3AED' },
  { role: 'radiographer', label: 'Radiographer', icon: '📷', sections: ['Pending Imaging', 'Reports Queue', 'Equipment Status', 'Radiology Alerts'], color: '#06B6D4' },
  { role: 'patient', label: 'Patient', icon: '🧑', sections: ['Appointments', 'Lab Results', 'Prescriptions', 'Billing', 'Messages'], color: '#0EA5E9' },
  { role: 'administrator', label: 'Administrator', icon: '⚙️', sections: ['User Management', 'Billing', 'Reports', 'Audit Logs', 'System Settings'], color: '#475569' },
  { role: 'guardian', label: 'Guardian', icon: '👤', sections: ['Patient Profile', 'Appointments', 'Lab Results', 'Billing'], color: '#F97316' },
];

function DashboardsTab() {
  const [selectedRole, setSelectedRole] = useState<string>('medical_doctor');
  const [editing, setEditing] = useState(false);
  const [customSections, setCustomSections] = useState<string[]>([]);

  const roleInfo = useMemo(() => DASHBOARD_ROLES.find(r => r.role === selectedRole), [selectedRole]);

  const toggleSection = (section: string) => {
    setCustomSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Dashboard Configuration</div>
      <p style={{ fontSize: 11, color: '#64748B', marginBottom: 12 }}>Control which sections and features each role sees on their dashboard. Configure permissions, quick actions, and workspace links per role.</p>

      <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
        {DASHBOARD_ROLES.map(r => (
          <button key={r.role} onClick={() => { setSelectedRole(r.role); setCustomSections([]); setEditing(false); }}
            style={{
              padding: '8px 14px', borderRadius: 8, border: selectedRole === r.role ? `2px solid ${r.color}` : '1px solid rgba(255,255,255,0.1)',
              background: selectedRole === r.role ? `${r.color}15` : 'transparent',
              color: selectedRole === r.role ? r.color : '#94A3B8',
              fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <span>{r.icon}</span> {r.label}
          </button>
        ))}
      </div>

      {roleInfo && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 24 }}>{roleInfo.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>{roleInfo.label} Dashboard</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>{roleInfo.sections.length} sections configured</div>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              {editing ? 'Done Editing' : 'Edit Sections'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {roleInfo.sections.map(section => (
              <div key={section} style={{
                padding: 12, borderRadius: 8,
                background: customSections.includes(section) ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${customSections.includes(section) ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
                cursor: editing ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }} onClick={() => editing && toggleSection(section)}>
                <div className="flex items-center gap-2">
                  {editing && (
                    <span style={{ fontSize: 12, color: customSections.includes(section) ? '#06B6D4' : '#64748B' }}>
                      {customSections.includes(section) ? '✓' : '○'}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#E2E8F0' }}>{section}</span>
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <div style={{ fontSize: 11, color: '#06B6D4', fontWeight: 600, marginBottom: 8 }}>Custom Sections ({customSections.length})</div>
              {customSections.length > 0 ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {customSections.map(s => (
                    <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>{s}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#64748B' }}>Click sections to toggle them for this role</div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}>Quick Actions Configuration</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { action: 'New Patient', icon: '👤', roles: ['medical_doctor', 'nurse', 'receptionist'] },
            { action: 'New Prescription', icon: '💊', roles: ['medical_doctor', 'pharmacist'] },
            { action: 'New Order', icon: '📋', roles: ['medical_doctor', 'nurse'] },
            { action: 'View Results', icon: '📊', roles: ['medical_doctor', 'nurse', 'patient', 'lab_technologist'] },
            { action: 'Schedule Appointment', icon: '📅', roles: ['receptionist', 'patient', 'medical_doctor'] },
            { action: 'Send Message', icon: '💬', roles: ['medical_doctor', 'nurse', 'patient', 'administrator'] },
          ].map(item => (
            <div key={item.action} className="flex items-center justify-between" style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: '#E2E8F0' }}>{item.action}</span>
              </div>
              <div className="flex gap-2">
                {item.roles.map(r => {
                  const ri = DASHBOARD_ROLES.find(d => d.role === r);
                  return (
                    <span key={r} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${ri?.color}22`, color: ri?.color }}>{ri?.label || r}</span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}>Dashboard Routing Rules</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { from: '/login', to: '/dashboard', condition: 'All authenticated users', icon: '🏠' },
            { from: '/dashboard', to: '/dashboard', condition: 'Role-based section rendering', icon: '📊' },
            { from: '/hmis', to: '/hmis', condition: 'HMIS console access', icon: '🏥' },
            { from: '/admin', to: '/admin', condition: 'Admin role only', icon: '⚙️' },
            { from: '/amexan-admin', to: '/amexan-admin', condition: 'Platform admin only', icon: '🛡️' },
            { from: '/patient', to: '/patient', condition: 'Patient role only', icon: '🧑' },
            { from: '/doctor', to: '/doctor', condition: 'Doctor role only', icon: '👨‍⚕️' },
            { from: '/nurse', to: '/nurse', condition: 'Nurse role only', icon: '👩‍⚕️' },
          ].map((rule, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 14 }}>{rule.icon}</span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{rule.from} → {rule.to}</span>
              </div>
              <span style={{ fontSize: 10, color: '#64748B' }}>{rule.condition}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}