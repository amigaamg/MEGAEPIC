'use client';

// AMEXAN — Facility Administration COO Command Center (Book V, Engine No. 23)
// The Facility Administrator is the digital COO. This is a Hospital Operations
// Command Center, not a settings page. All 20 constitutional centers render from
// the FacilityAdministrationEngine, persisted to Firestore per organization and
// seeded from live org data (departments, members, patients).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity, LayoutDashboard, Menu, X, Building2, Users, Boxes, ListChecks, Wrench, HeartPulse, BarChart3, ShieldCheck, DollarSign, FlaskConical, GraduationCap, Megaphone, FileText, Brain, Plug, Database, Store, Lock, TrendingUp, AlertTriangle, Loader2, Network, ListTree, Settings2, Cpu } from 'lucide-react';
import {
  FacilityAdministrationEngine,
  type FacilityAdminModel,
  type ExecutiveOverview,
  type InfrastructureAsset,
  type WorkforceCategory,
} from '@/lib/amexan/facility';
import { loadFacilityAdminModel, saveFacilityAdminModel } from '@/lib/firebase/facilityAdminService';
import { loadFacilityAdminSettings, saveFacilityAdminSettings } from '@/lib/firebase/facilityAdminSettings';
import type { FacilityAdminSettings } from '@/lib/firebase/facilityAdminSettings';
import { resolveFamily } from '@/lib/amexan/workspace/WorkspaceGuard';
import { MARKETPLACE_MODULES, type CommunityCenterId } from './centers';
import { IntelligenceCenter } from './centers/IntelligenceCenter';
import { QualityCommandCenter } from './centers/QualityCommandCenter';
import { ResearchCenter } from './centers/ResearchCenter';
import { IntegrationCenter } from './centers/IntegrationCenter';
import { ExecutiveIntelligenceCenter } from './centers/ExecutiveIntelligenceCenter';
import { OrganizationBuilder } from './centers/OrganizationBuilder';
import { CommunicationCenter } from './centers/CommunicationCenter';
import { AssetIntelligenceCenter } from './centers/AssetIntelligenceCenter';
import { FinanceCenter } from './centers/finance/FinanceCenter';
import { EducationCenter } from './centers/EducationCenter';
import { SettingsCenter } from './centers/SettingsCenter';
import { WorkforceProvisioning } from './centers/WorkforceProvisioning';
import ProtocolCenter from './protocol-center/ProtocolCenter';
import WorkspaceGuard from '@/components/workspace/WorkspaceGuard';
import { ConstitutionalContextGate, type ConstitutionalContext } from './engines/ConstitutionalContextGate';
import { EnterpriseIntegrationEngine } from './engines/EnterpriseIntegrationEngine';
import { SecurityOperationsCenter } from './engines/SecurityOperationsCenter';
import { ClinicalOperationsCenter } from './engines/ClinicalOperationsCenter';

// Book XV WS-016: this executive command center may only render for the
// executive role family. Any other family is hard-redirected (WS-014) before
// the page body mounts.
const SupportedRoles = ['executive'] as const;

const CENTERS: { id: CommunityCenterId; label: string; icon: any }[] = [
  { id: 'executive', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'digital_twin', label: 'Digital Twin', icon: Building2 },
  { id: 'workforce', label: 'Workforce Command', icon: Users },
  { id: 'workforce_provisioning', label: 'Provision Staff & Roles', icon: Users },
  { id: 'organization', label: 'Organization', icon: Boxes },
  { id: 'services', label: 'Service Catalogue', icon: ListChecks },
  { id: 'infrastructure', label: 'Infrastructure', icon: Wrench },
  { id: 'assets', label: 'Asset Intelligence', icon: Cpu },
  { id: 'clinical', label: 'Clinical Operations', icon: HeartPulse },
  { id: 'workforce_analytics', label: 'Workforce Analytics', icon: BarChart3 },
  { id: 'quality', label: 'Quality · Safety & Governance', icon: ShieldCheck },
  { id: 'finance', label: 'Financial', icon: DollarSign },
  { id: 'research', label: 'Research Intelligence', icon: FlaskConical },
  { id: 'education', label: 'Clinical Education', icon: GraduationCap },
  { id: 'communication', label: 'Communication', icon: Megaphone },
  { id: 'protocol', label: 'Protocol Center', icon: FileText },
  { id: 'intelligence', label: 'Clinical Intelligence', icon: Brain },
  { id: 'integration', label: 'Enterprise Integration', icon: Plug },
  { id: 'hmis', label: 'HMIS Connection', icon: Network },
  { id: 'migration', label: 'Data Migration', icon: Database },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'security', label: 'Security Center', icon: Lock },
  { id: 'analytics', label: 'Executive Intelligence', icon: TrendingUp },
  { id: 'structure', label: 'Hospital Builder', icon: ListTree },
  { id: 'settings', label: 'Hospital Identity', icon: Settings2 },
];

const C = {
  bg: '#eff4fa',
  card: '#ffffff',
  border: '#e3e9f2',
  navy: '#0b2c4d',
  slate: '#5b6b80',
  muted: '#8a98ac',
  sky: '#0ea5e9',
  skyLight: '#e0f2fe',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  purple: '#8b5cf6',
};

const S = {
  li: (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
    fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.sky : C.slate,
    background: active ? C.skyLight : 'transparent', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
  }),
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 },
  title: { fontSize: 15, fontWeight: 800, color: C.navy, margin: 0 },
  sub: { fontSize: 11, color: C.muted, marginTop: 2 },
  banner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 16 },
};

export default function FacilityAdminPage() {
  return (
    <WorkspaceGuard supportedRoles={SupportedRoles}>
      <ConstitutionalContextGate>
        {(ctx) => <FacilityAdminCommandCenter ctx={ctx} />}
      </ConstitutionalContextGate>
    </WorkspaceGuard>
  );
}

function FacilityAdminCommandCenter({ ctx }: { ctx: ConstitutionalContext }) {
  const { session, user, activeOrganizationId, loading } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(ctx.organizationId || null);
  const [model, setModel] = useState<FacilityAdminModel | null>(null);
  const [settings, setSettings] = useState<FacilityAdminSettings | null>(null);
  const [center, setCenter] = useState<CommunityCenterId>('integration');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminId = useRef<string>('');
  adminId.current = (session.identity?.uid as string) || (user?.uid as string) || '';

  // Fast start: derive orgId synchronously from the session so the shell
  // renders immediately, then load model + settings in parallel (one round-trip
  // set) instead of two sequential awaits. No infinite spinner: any failure is
  // surfaced as an inline banner with a retry.
  useEffect(() => {
    const org = activeOrganizationId || (session.currentOrganization?.id as string) || null;
    setOrgId(org);
  }, [activeOrganizationId, session.currentOrganization]);

  useEffect(() => {
    if (!orgId || !adminId.current || model) return;
    let cancelled = false;
    (async () => {
      try {
        const [m, s] = await Promise.all([
          loadFacilityAdminModel(orgId, adminId.current),
          loadFacilityAdminSettings(orgId),
        ]);
        if (cancelled) return;
        setModel(m);
        setSettings(s);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load facility');
      }
    })();
    return () => { cancelled = true; };
  }, [orgId, model]);

  const isAdmin = !loading && user && (session.professional?.primaryCategory
    ? resolveFamily(session.professional.primaryCategory, session.role?.name) === 'executive'
    : false);

  const reloadModel = async () => {
    if (!orgId || !adminId.current) { setCenter('workforce'); return; }
    try {
      setError('');
      const m = await loadFacilityAdminModel(orgId, adminId.current);
      setModel(m);
    } catch (e: any) {
      setError(e?.message || 'Failed to refresh staff');
    }
    setCenter('workforce');
  };

  const mutate = useCallback(async (next: FacilityAdminModel | ((m: FacilityAdminModel) => FacilityAdminModel)) => {
    // Constitutional rule: NO WRITE while any constitutional ID is unresolved.
    if (!orgId || !ctx.facilityId || !ctx.actorId || !ctx.workspaceId || !ctx.sessionId) {
      setError('Constitutional context incomplete — write blocked until all IDs resolve.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const applied = typeof next === 'function' && model ? next(model) : (next as FacilityAdminModel);
      setModel(applied);
      await saveFacilityAdminModel(applied);
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  }, [model, ctx, orgId]);

  if (loading) return <Centered><Loader2 className="spin" size={28} color={C.sky} /><span>Loading Command Center…</span></Centered>;
  if (!user || !isAdmin) return <Centered><AlertTriangle size={24} color={C.amber} /><span>Facility Administrator access required.</span></Centered>;
  if (!orgId) return <Centered><AlertTriangle size={24} color={C.amber} /><span>No active organization. Switch to a facility from your workspace.</span></Centered>;

  const actorId = adminId.current;
  const loadingData = !model || !settings;

  const saveSettings = async (next: FacilityAdminSettings | ((s: FacilityAdminSettings) => FacilityAdminSettings)) => {
    if (!orgId || !settings) return;
    if (!ctx.facilityId || !ctx.actorId || !ctx.workspaceId) return;
    setSaving(true);
    setError('');
    try {
      const applied = typeof next === 'function' ? next(settings) : next;
      setSettings(applied);
      await saveFacilityAdminSettings(orgId, applied);
    } catch (e: any) {
      setError(e?.message || 'Settings change failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', 'Noto Sans', system-ui, sans-serif", color: C.navy }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.menu-toggle{display:none}@media(max-width:820px){.menu-toggle{display:inline-flex}.cmd-sidebar{display:none;position:fixed;width:250px!important;z-index:30}.cmd-main{padding:16px!important}}`}</style>
        <style>{`.cmd-sidebar--open{display:block!important}`}</style>
      <div style={{ height: 60, background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px' }}>
        <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }} className="menu-toggle" aria-label="Toggle menu">
          {mobileOpen ? <X size={20} color={C.slate} /> : <Menu size={20} color={C.slate} />}
        </button>
        <Building2 size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 800 }}>AMEXAN · Facility Administration</span>
        <span style={{ width: 1, height: 22, background: C.border }} />
        <span style={{ fontSize: 12, color: C.muted }}>{model ? model.organizationId.toUpperCase() : orgId}</span>
        <span style={{ background: model && model.status === 'live' ? `${C.green}18` : `${C.amber}18`, color: model && model.status === 'live' ? C.green : C.amber, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>● {model ? model.status : 'loading'}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.muted }}>Digital COO · Engine No. 23</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', position: 'relative' }}>
        <aside style={{ width: 232, background: C.card, borderRight: `1px solid ${C.border}`, padding: '12px 10px', overflowY: 'auto', flexShrink: 0, ...(mobileOpen ? { position: 'fixed', zIndex: 30, left: 0, top: 60, bottom: 0, boxShadow: '0 8px 30px rgba(11,44,77,.18)' } : {}) }} className={`cmd-sidebar${mobileOpen ? ' cmd-sidebar--open' : ''}`}>
          {CENTER_GROUPS.map(g => (
            <div key={g.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '6px 12px' }}>{g.label}</div>
              {g.items.map((it) => {
                const IconComp = it.icon;
                return (
                  <button key={it.id} onClick={() => { setCenter(it.id); setMobileOpen(false); }} style={S.li(center === it.id)}>
                    <IconComp size={15} /> {it.label}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,44,77,.35)', zIndex: 20 }} className="cmd-backdrop" />}

        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="cmd-main">
          {saving && <div data-testid="saving" style={{ marginBottom: 12, fontSize: 11, color: C.slate, display: 'flex', alignItems: 'center', gap: 6 }}><Loader2 size={13} className="spin" /> Persisting…</div>}
          {error && <div style={{ ...S.banner, background: `${C.red}12`, color: C.red }}><AlertTriangle size={15} /> {error}</div>}

          {loadingData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: C.slate, fontSize: 13 }}>
              <Loader2 className="spin" size={26} color={C.sky} />
              <span>Initializing facility…</span>
              {error && (
                <button
                  onClick={() => { setError(''); setModel(null); setSettings(null); }}
                  style={{ marginTop: 4, padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <>
          {center === 'executive' && <ExecutiveView model={model!} onPatch={(patch) => mutate(m => FacilityAdministrationEngine.updateMetrics(m, m.administratorId, patch))} />}
          {center === 'workforce' && <WorkforceView model={model!} actorId={actorId} onCommand={(staffId, action) => mutate(m => FacilityAdministrationEngine.commandWorkforce(m, m.administratorId, { action, staffId, by: m.organizationId }))} />}
          {center === 'workforce_provisioning' && <WorkforceProvisioning orgId={model!.organizationId} structures={settings!.structure} onProvisioned={() => reloadModel()} />}
          {center === 'services' && <ServicesView model={model!} actorId={actorId} onSave={(fn) => mutate(fn)} />}
          {center === 'infrastructure' && <InfrastructureView model={model!} actorId={actorId} onSave={(fn) => mutate(fn)} />}
          {center === 'assets' && <AssetIntelligenceCenter orgId={model!.organizationId} actorId={actorId} actorName={(session.person?.fullName) || (user?.displayName) || 'Facility Administrator'} />}
          {center === 'quality' && <QualityCommandCenter model={model!} onPatch={(patch) => mutate(m => FacilityAdministrationEngine.updateQuality(m, m.administratorId, patch))} />}
          {center === 'research' && <ResearchCenter model={model!} onPatch={(next) => mutate((m) => ({ ...m, cric: next }))} />}
          {center === 'education' && <EducationCenter model={model!} onSave={(fn) => mutate(fn)} />}
          {center === 'finance' && <FinanceCenter model={model!} onPatch={(patch) => mutate(m => FacilityAdministrationEngine.updateFinance(m, m.administratorId, patch))} />}
          {center === 'communication' && <CommunicationCenter orgId={model!.organizationId} actorId={actorId} actorName={(session.person?.fullName) || (user?.displayName) || 'Facility Administrator'} actorRole={session.role?.name} />}
          {center === 'protocol' && <ProtocolCenter />}
          {center === 'integration' && <EnterpriseIntegrationEngine ctx={ctx} model={model} />}
          {center === 'migration' && <IntegrationCenter model={model!} onSave={(fn) => mutate(fn)} initialTab="import" />}
          {center === 'marketplace' && <MarketplaceView model={model!} actorId={actorId} onSave={(fn) => mutate(fn)} />}
          {center === 'security' && <SecurityOperationsCenter />}
          {center === 'analytics' && <ExecutiveIntelligenceCenter model={model!} />}
          {center === 'digital_twin' && <DigitalTwinView model={model!} />}
          {center === 'organization' && <OrganizationView model={model!} />}
          {center === 'clinical' && <ClinicalOperationsCenter />}
          {center === 'workforce_analytics' && <WorkforceAnalyticsView model={model!} />}
          {center === 'intelligence' && <IntelligenceCenter model={model!} onPatch={(patch) => mutate(m => FacilityAdministrationEngine.updateIntelligence(m, m.administratorId, patch))} />}
          {center === 'hmis' && <IntegrationCenter model={model!} onSave={(fn) => mutate(fn)} initialTab="connected" />}
          {center === 'structure' && <OrganizationBuilder orgId={model!.organizationId} />}
          {center === 'settings' && <SettingsCenter settings={settings!} onChange={(next) => saveSettings(next)} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.slate, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>{children}</div>;
}

function Kpi({ label, value, color = C.navy, accent }: { label: string; value: string | number; color?: string; accent?: 'green' | 'red' | 'amber' }) {
  const tone = accent === 'green' ? C.green : accent === 'red' ? C.red : accent === 'amber' ? C.amber : color;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', minWidth: 150 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: tone }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

function Card({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={S.title}>{title}</div>
          {subtitle && <div style={S.sub}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Center 1: Executive Overview ──────────────────────────────────────────────

function ExecutiveView({ model, onPatch }: { model: FacilityAdminModel; onPatch: (patch: any) => void }) {
  const o = FacilityAdministrationEngine.getExecutiveOverview(model);
  const [edit, setEdit] = useState<Record<string, string>>({});
  const apply = () => {
    const patch: any = {};
    Object.entries(edit).forEach(([k, v]) => {
      const n = Number(v);
      if (!Number.isNaN(n)) patch[k] = n;
    });
    setEdit({});
    onPatch(patch);
  };
  return (
    <MetricPanel o={o} model={model} edit={edit} setEdit={setEdit} apply={apply} />
  );
}

function MetricPanel({ o, model, edit, setEdit, apply }: { o: ExecutiveOverview; model: FacilityAdminModel; edit: Record<string, string>; setEdit: (x: Record<string, string>) => void; apply: () => void }) {
  const rows: { id: keyof ExecutiveOverview; label: string }[] = [
    { id: 'bedsAvailable', label: 'Beds Available' }, { id: 'patients', label: 'Patients' },
    { id: 'admissionsToday', label: 'Admissions Today' }, { id: 'dischargesToday', label: 'Discharges Today' },
    { id: 'surgeriesToday', label: 'Surgeries' }, { id: 'emergencyCount', label: 'Emergency' },
    { id: 'criticalAlerts', label: 'Critical Alerts' }, { id: 'staffOnDuty', label: 'Staff On Duty' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Kpi label="Hospital Status" value={o.operational ? 'OPERATIONAL' : o.hospitalStatus} accent="green" />
        <Kpi label="Revenue Today" value={`KES ${(model.metrics.revenueToday || 0).toLocaleString()}`} />
        <Kpi label="Occupancy" value={`${o.occupancyPercent}%`} accent={o.occupancyPercent > 85 ? 'red' : o.occupancyPercent > 70 ? 'amber' : 'green'} />
        <Kpi label="System Health" value={`${o.systemHealthPercent}%`} accent="green" />
      </div>

      <Card title="Shared Hospital Metrics" subtitle="Live figures fed from the hospital. Update to reflect real operations.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {rows.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.muted }}>{r.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{String(o[r.id] ?? '—')}</div>
              </div>
              <input
                value={edit[r.id] ?? ''}
                placeholder={String(o[r.id] ?? 0)}
                onChange={e => setEdit({ ...edit, [r.id]: e.target.value })}
                style={{ width: 80, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', fontSize: 12, padding: '0 8px', outline: 'none' }}
              />
            </div>
          ))}
        </div>
        <button onClick={apply} style={{ marginTop: 14, padding: '8px 18px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Update Metrics</button>
      </Card>

      {o.criticalAlerts > 0 && (
        <div style={{ ...S.banner, background: `${C.red}14`, color: C.red }}><AlertTriangle size={15} /> {o.criticalAlerts} critical alert(s) require attention.</div>
      )}
    </div>
  );
}

// ── Center 3: Workforce Command Center ────────────────────────────────────────

function WorkforceView({ model, actorId, onCommand }: { model: FacilityAdminModel; actorId: string; onCommand: (staffId: string, action: any) => void }) {
  const snap = FacilityAdministrationEngine.getWorkforceCommandCenter(model);
  const [search, setSearch] = useState('');
  const cats = Object.entries(snap.byCategory) as [WorkforceCategory, { total: number; present: number; onLeave: number; offDuty: number; expiredLicense: number }][];
  const filtered = model.workforce.filter(w => !search || w.fullName.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {cats.map(([cat, agg]) => (
          <div key={cat} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>{cat}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{agg.total}</div>
            <div style={{ fontSize: 10, color: C.slate }}>{agg.present} present · {agg.onLeave} leave · {agg.offDuty} off</div>
            {agg.expiredLicense > 0 && <div style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>⚠ {agg.expiredLicense} expired license</div>}
          </div>
        ))}
      </div>

      <Card title="Workforce Registry" subtitle={`${model.workforce.length} staff imported from the existing HR/HMIS. Staff activate — they never register.`}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff…" style={{ width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none', marginBottom: 10 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(w => (
            <div key={w.staffId} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 120px', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
              <div><div style={{ fontWeight: 700 }}>{w.fullName}</div><div style={{ fontSize: 10, color: C.muted }}>{w.amxId}</div></div>
              <div style={{ color: C.slate }}><span style={{ fontWeight: 600 }}>{w.category}</span> · {w.departmentId || '—'}</div>
              <StatusBadge status={w.employmentStatus} />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(['suspend', 'promote', 'approve_leave', 'verify_credential', 'reset_password', 'transfer', 'reassign', 'deactivate'] as const).map(a => (
                  <ActionBtn key={a} label={a.replace('_', ' ')} onClick={() => onCommand(w.staffId, a)} />
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '12px 0' }}>No staff match. Import workforce via Data Migration to populate.</div>}
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'active' ? C.green : status === 'suspended' || status === 'deactivated' ? C.red : C.amber;
  return <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${tone}18`, color: tone, textTransform: 'capitalize', textAlign: 'center' }}>{status}</span>;
}
function ActionBtn({ label, onClick, danger, primary }: { label: string; onClick: () => void; danger?: boolean; primary?: boolean }) {
  return <button onClick={onClick} style={{ padding: '4px 8px', borderRadius: 6, border: primary ? 'none' : `1px solid ${danger ? C.red : C.border}`, background: primary ? C.sky : '#fff', color: primary ? '#fff' : danger ? C.red : C.slate, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{label}</button>;
}
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{label}</button>;
}

// ── Center 5: Service Catalogue ───────────────────────────────────────────────

function ServicesView({ model, actorId, onSave }: { model: FacilityAdminModel; actorId: string; onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [edits, setEdits] = useState<Record<string, { price: string; capacity: string; schedule: string }>>({});
  const add = () => {
    if (!name.trim()) return;
    const input: any = { code: name.toUpperCase().slice(0, 8), name: name.trim(), category: 'medicine', availability: 'available', price: Number(price) || 0, capacityPerDay: 0, schedule: '', requiresReferral: false };
    onSave(m => FacilityAdministrationEngine.addService(m, m.administratorId, input).model);
    setName(''); setPrice('');
  };
  const commitEdits = (sid: string) => {
    const e = edits[sid];
    if (!e) return;
    onSave(m => ({ ...m, services: m.services.map(s => s.id === sid ? {
      ...s,
      price: e.price !== '' ? Number(e.price) : s.price,
      capacityPerDay: e.capacity !== '' ? Number(e.capacity) : s.capacityPerDay,
      schedule: e.schedule !== '' ? e.schedule : s.schedule,
    } : s) } as FacilityAdminModel));
    setEdits(prev => { const n = { ...prev }; delete n[sid]; return n; });
  };
  return (
    <Card title="Service Catalogue" subtitle="Every service the hospital provides — availability, pricing, capacity, schedules.">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Service name (e.g. Dialysis)" style={{ flex: 1, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none' }} />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (KES)" style={{ width: 120, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none' }} />
        <AddBtn label="Add Service" onClick={add} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {model.services.map(s => {
          const e = edits[s.id];
          const dirty = e && (e.price !== '' || e.capacity !== '' || e.schedule !== '');
          return (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 100px 100px 1fr auto', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
              <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div><div style={{ fontSize: 10, color: C.muted }}>{s.code} · {s.category}</div></div>
              <input value={e?.price ?? ''} placeholder={`KES ${s.price.toLocaleString()}`} onChange={ev => setEdits({ ...edits, [s.id]: { ...(e || { price: '', capacity: '', schedule: '' }), price: ev.target.value } })} style={{ height: 28, borderRadius: 6, border: `1px solid ${C.border}`, padding: '0 8px', fontSize: 11, outline: 'none', width: '100%' }} />
              <input value={e?.capacity ?? ''} placeholder={`Cap ${s.capacityPerDay}`} onChange={ev => setEdits({ ...edits, [s.id]: { ...(e || { price: '', capacity: '', schedule: '' }), capacity: ev.target.value } })} style={{ height: 28, borderRadius: 6, border: `1px solid ${C.border}`, padding: '0 8px', fontSize: 11, outline: 'none', width: '100%' }} />
              <input value={e?.schedule ?? ''} placeholder={s.schedule || 'Schedule'} onChange={ev => setEdits({ ...edits, [s.id]: { ...(e || { price: '', capacity: '', schedule: '' }), schedule: ev.target.value } })} style={{ height: 28, borderRadius: 6, border: `1px solid ${C.border}`, padding: '0 8px', fontSize: 11, outline: 'none', width: '100%' }} />
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.availability === 'available' ? `${C.green}18` : s.availability === 'limited' ? `${C.amber}18` : `${C.red}18`, color: s.availability === 'available' ? C.green : s.availability === 'limited' ? C.amber : C.red, textAlign: 'center' }}>{s.availability}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {dirty && <ActionBtn label="Save" primary onClick={() => commitEdits(s.id)} />}
                <ActionBtn label="Avail" danger={s.availability === 'available'} onClick={() => onSave(m => FacilityAdministrationEngine.setServiceAvailability(m, m.administratorId, s.id, s.availability === 'available' ? 'limited' : 'available', true))} />
              </div>
            </div>
          );
        })}
        {model.services.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '12px 0' }}>No services yet. Add your first service above.</div>}
      </div>
    </Card>
  );
}

// ── Center 6: Infrastructure ──────────────────────────────────────────────────

function InfrastructureView({ model, actorId, onSave }: { model: FacilityAdminModel; actorId: string; onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void }) {
  const health = FacilityAdministrationEngine.getInfrastructureHealth(model);
  const openFaults = FacilityAdministrationEngine.getOpenFaults(model);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InfrastructureAsset['category']>('medical_equipment');
  const add = () => {
    if (!name.trim()) return;
    onSave(m => FacilityAdministrationEngine.registerAsset(m, m.administratorId, { code: name.toUpperCase().slice(0, 8), name: name.trim(), category }).model);
    setName('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <Kpi label="Assets" value={health.totalAssets} />
        <Kpi label="Operational" value={health.operational} accent="green" />
        <Kpi label="Maintenance" value={health.inMaintenance} accent="amber" />
        <Kpi label="Faulted" value={health.faulted} accent="red" />
        <Kpi label="Downtime (min)" value={health.totalDowntimeMinutes} />
      </div>
      <Card title="Asset Registry" subtitle="Beds, buildings, machines, servers, network, medical equipment — with maintenance & warranty tracking.">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Asset name (e.g. CT Scanner 2)" style={{ flex: 1, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none' }} />
          <select value={category} onChange={e => setCategory(e.target.value as any)} style={{ height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 8px', fontSize: 12, outline: 'none' }}>
            {['beds', 'buildings', 'machines', 'computers', 'servers', 'network', 'internet', 'medical_equipment', 'vehicles', 'theatres'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <AddBtn label="Register Asset" onClick={add} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {model.assets.map(a => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 90px', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
              <div style={{ fontWeight: 700 }}>{a.name}</div>
              <div style={{ color: C.slate }}>{a.category}</div>
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: a.status === 'operational' ? `${C.green}18` : `${C.amber}18`, color: a.status === 'operational' ? C.green : C.amber, textAlign: 'center' }}>{a.status}</span>
              <div style={{ fontSize: 10, color: C.muted }}>{a.downtimeMinutes} min downtime</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <ActionBtn label="Fault" onClick={() => onSave(m => FacilityAdministrationEngine.reportFault(m, m.administratorId, a.id, 'Reported fault', 'medium').model)} />
              </div>
            </div>
          ))}
          {model.assets.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '12px 0' }}>No assets registered yet.</div>}
        </div>
        {openFaults.length > 0 && <div style={{ ...S.banner, background: `${C.red}12`, color: C.red }}><AlertTriangle size={15} /> {openFaults.length} open fault(s).</div>}
      </Card>
    </div>
  );
}

// ── Center 9: Quality ─────────────────────────────────────────────────────────

function FinanceView({ model, onPatch }: any) {
  return <NumberFields title="Financial Dashboard" sub="revenue, claims, insurance, outstanding bills, expenses, payroll, drug costs." fields={[
    { id: 'revenueToday', label: 'Revenue Today', value: model.finance.revenueToday },
    { id: 'claimsSubmitted', label: 'Claims Submitted', value: model.finance.claimsSubmitted },
    { id: 'claimsApproved', label: 'Claims Approved', value: model.finance.claimsApproved },
    { id: 'insuranceOutstanding', label: 'Insurance Outstanding', value: model.finance.insuranceOutstanding },
    { id: 'outstandingBills', label: 'Outstanding Bills', value: model.finance.outstandingBills },
    { id: 'expenses', label: 'Expenses', value: model.finance.expenses },
    { id: 'payroll', label: 'Payroll', value: model.finance.payroll },
    { id: 'drugCosts', label: 'Drug Costs', value: model.finance.drugCosts },
  ]} onSave={(patch) => onPatch(patch)} />;
}

function NumberFields({ title, sub, fields, onSave }: { title: string; sub: string; fields: { id: string; label: string; value: number }[]; onSave: (patch: any) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const apply = () => {
    const patch: any = {};
    Object.entries(vals).forEach(([k, v]) => { const n = Number(v); if (!Number.isNaN(n)) patch[k] = n; });
    setVals({});
    onSave(patch);
  };
  return (
    <Card title={title} subtitle={sub}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {fields.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.muted }}>{f.label}</div><div style={{ fontSize: 16, fontWeight: 700 }}>{f.value}</div></div>
            <input value={vals[f.id] ?? ''} placeholder={String(f.value)} onChange={e => setVals({ ...vals, [f.id]: e.target.value })} style={{ width: 80, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, padding: '0 8px', outline: 'none' }} />
          </div>
        ))}
      </div>
      <button onClick={apply} style={{ marginTop: 14, padding: '8px 18px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Update</button>
    </Card>
  );
}

// ── Center 16: Integration ────────────────────────────────────────────────────

function IntegrationView({ model, actorId, onSave }: { model: FacilityAdminModel; actorId: string; onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void }) {
  const kinds = ['fhir', 'hl7', 'lis', 'pacs', 'ris', 'billing', 'insurance', 'laboratory', 'radiology', 'national_systems', 'erp', 'payroll', 'hr', 'inventory'] as const;
  return (
    <Card title="Integration Center" subtitle="FHIR, HL7, LIS, PACS, RIS, billing, insurance, laboratory, radiology, national systems, ERP, payroll, HR, inventory.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {kinds.map(k => {
          const existing = model.integrations.find(i => i.kind === k);
          return (
            <button key={k} onClick={() => onSave(m => existing
              ? FacilityAdministrationEngine.setIntegrationStatus(m, m.administratorId, existing.id, existing.status === 'active' ? 'disabled' : 'active')
              : ({ ...m, integrations: [...m.integrations, { id: `int-${k}`, kind: k, name: k, direction: 'bidirectional', status: 'active', lastSyncAt: Date.now() }] } as FacilityAdminModel))}
              style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${existing?.status === 'active' ? C.green : C.border}`, background: existing?.status === 'active' ? `${C.green}10` : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <div style={{ textTransform: 'uppercase', fontSize: 10, color: C.muted, fontWeight: 700 }}>{k}</div>
              {existing ? (existing.status === 'active' ? '● Connected' : '○ Disabled') : '+ Connect'}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ── Center 17: Data Migration ─────────────────────────────────────────────────

function MigrationView({ model, actorId, onSave }: { model: FacilityAdminModel; actorId: string; onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void }) {
  const summary = FacilityAdministrationEngine.getMigrationSummary(model);
  const entities = ['patients', 'staff', 'appointments', 'encounters', 'laboratory', 'radiology', 'pharmacy'] as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <Kpi label="Completed" value={summary.completed} accent="green" />
        <Kpi label="Rows Migrated" value={summary.migratedRows} />
        <Kpi label="Failed Rows" value={summary.failedRows} accent="red" />
      </div>
      <Card title="Data Migration Center" subtitle="Import patients, staff, appointments, encounters, laboratory, radiology, pharmacy — one click from OpenMRS, OpenEMR, Bahmni, DHIS2, Epic, FHIR, CSV and more.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
          {entities.map(e => {
            const done = model.migrations.some(x => x.entity === e && x.status === 'completed');
            return (
              <button key={e} disabled={done} onClick={() => onSave(m => ({ ...m, migrations: [...m.migrations, { id: `mig-${e}-${Date.now()}`, entity: e, sourceSystem: 'OpenMRS', totalRows: 0, migratedRows: 0, failedRows: 0, status: 'completed', startedAt: Date.now(), completedAt: Date.now() }] } as FacilityAdminModel))}
                style={{ padding: '12px', borderRadius: 10, border: `1px solid ${done ? C.green : C.border}`, background: done ? `${C.green}10` : '#fff', cursor: done ? 'default' : 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left', textTransform: 'capitalize' }}>
                {done ? '✓ Imported' : `+ Import ${e}`}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Center 18: Marketplace ────────────────────────────────────────────────────

function MarketplaceView({ model, actorId, onSave }: { model: FacilityAdminModel; actorId: string; onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void }) {
  return (
    <Card title="Marketplace" subtitle="Install telemedicine, ICU, NICU, oncology, dental, blood bank, dialysis, AI modules, insurance connectors — without changing core.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {MARKETPLACE_MODULES.map(mod => {
          const installed = model.marketplace.some(x => x.moduleId === mod.id);
          return (
            <div key={mod.id} style={{ padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: '#f8fafc' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{mod.name}</div>
              <div style={{ fontSize: 10, color: C.muted, margin: '4px 0 8px' }}>{mod.description}</div>
              <button onClick={() => onSave(m => installed ? FacilityAdministrationEngine.uninstallModule(m, m.administratorId, mod.id as any) : FacilityAdministrationEngine.installModule(m, m.administratorId, mod.id as any).model)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: installed ? `${C.amber}18` : C.sky, color: installed ? C.amber : '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {installed ? 'Installed' : 'Install'}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Center 19: Security ───────────────────────────────────────────────────────

function SecurityView({ model, actorId, onSave }: { model: FacilityAdminModel; actorId: string; onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void }) {
  const sec = FacilityAdministrationEngine.getSecurityCenter(model);
  const openReview = model.accessReviews.some(r => r.status === 'open');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <Kpi label="Failed Logins" value={sec.failedLogins} accent="red" />
        <Kpi label="Active Sessions" value={sec.activeSessions} />
        <Kpi label="Open Reviews" value={sec.openReviews} accent={sec.openReviews > 0 ? 'amber' : 'green'} />
        <Kpi label="Devices" value={sec.devices} />
      </div>
      <Card title="Security Center" subtitle="Users, sessions, devices, audit logs, failed logins, permissions, access review, MFA.">
        <div style={{ display: 'flex', gap: 8 }}>
          <AddBtn label={openReview ? 'Complete Access Review' : 'Create Access Review'} onClick={() => onSave(m => openReview
            ? FacilityAdministrationEngine.completeAccessReview(m, m.administratorId, m.accessReviews.find(r => r.status === 'open')!.id, 3)
            : FacilityAdministrationEngine.createAccessReview(m, m.administratorId, 'Quarterly access review', 'organization-wide', Date.now() + 30 * 86400000).model)} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Recent Security Events</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {model.securityEvents.slice(-8).reverse().map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.severity === 'critical' ? C.red : e.severity === 'warning' ? C.amber : C.sky }} />
                <span style={{ flex: 1 }}>{e.kind.replace('_', ' ')}{e.detail ? ` · ${e.detail}` : ''}</span>
                <span style={{ color: C.muted }}>{new Date(e.at).toLocaleString()}</span>
              </div>
            ))}
            {model.securityEvents.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No security events recorded.</div>}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Center 2: Digital Twin / 4: Organization ──────────────────────────────────

function DigitalTwinView({ model }: { model: FacilityAdminModel }) {
  return (
    <Card title="Hospital Digital Twin" subtitle="The entire organization, navigable top-down: hospital → buildings → departments → units → wards → clinics → services.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={14} color={C.sky} /><span style={{ fontWeight: 800 }}>{model.organizationId.toUpperCase()} — Hospital</span></div>
        <div style={{ borderLeft: `2px solid ${C.border}`, marginLeft: 7, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontWeight: 600 }}>Departments ({model.services.length})</div>
          {model.services.slice(0, 8).map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.slate }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.sky }} /> {s.name}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function OrganizationView({ model }: { model: FacilityAdminModel }) {
  return (
    <Card title="Organization Management" subtitle="Departments, units, clinics, buildings, floors, beds, rooms, theatres, ICUs, laboratories, radiology, pharmacy, stores, vehicles.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        <OrgStat label="Departments" value={model.services.length} />
        <OrgStat label="Wards / Units" value={model.services.length} />
        <OrgStat label="Services" value={model.services.length} />
        <OrgStat label="Assets" value={model.assets.length} />
        <OrgStat label="Workforce" value={model.workforce.length} />
      </div>
    </Card>
  );
}
function OrgStat({ label, value }: { label: string; value: number }) {
  return <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div><div style={{ fontSize: 10, color: C.muted }}>{label}</div></div>;
}

// ── Center 7: Clinical Operations / 8: Workforce Analytics ────────────────────

function ClinicalView({ model, onPatch }: any) {
  const m = model.metrics;
  const fields = ['admissionsToday', 'dischargesToday', 'averageLosDays', 'occupancyPercent', 'theatreUtilizationPercent', 'labTurnaroundMinutes', 'radiologyTurnaroundMinutes'] as const;
  return <NumberFields title="Clinical Operations" sub="high-level only — the admin monitors, never edits notes. admissions, discharges, transfers, bed occupancy, LOS, waiting times, queues, theatre & lab utilization." fields={fields.map(f => ({ id: f, label: f, value: m[f] }))} onSave={(patch) => onPatch(patch)} />;
}
function WorkforceAnalyticsView({ model }: { model: FacilityAdminModel }) {
  const a = FacilityAdministrationEngine.getWorkforceAnalytics(model);
  const cats = Object.entries(a.byCategory);
  return (
    <Card title="Workforce Analytics" subtitle="patients per doctor, nurse ratio, coverage, burnout, attendance, overtime, competencies, vacancies.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {cats.map(([c, n]) => <OrgStat key={c} label={c} value={n} />)}
        <OrgStat label="Total Staff" value={a.total} />
        <OrgStat label="On Duty" value={a.onDuty} />
        <OrgStat label="Flagged" value={a.flaggedCount} />
      </div>
    </Card>
  );
}

// ── Sidebar grouping (constitutional centers) ─────────────────────────────────

const CENTER_GROUPS: { label: string; items: { id: CommunityCenterId; label: string; icon: any }[] }[] = [
  { label: 'Enterprise', items: [CENTERS[17], CENTERS[18], CENTERS[19]] },
  { label: 'Command', items: [CENTERS[0], CENTERS[2]] },
  { label: 'Configure', items: [CENTERS[3], CENTERS[4], CENTERS[5], CENTERS[6], CENTERS[7]] },
  { label: 'Monitor', items: [CENTERS[8], CENTERS[9], CENTERS[10], CENTERS[11], CENTERS[12]] },
  { label: 'Intelligence & Ecosystems', items: [CENTERS[13], CENTERS[14], CENTERS[15], CENTERS[16], CENTERS[17], CENTERS[18]] },
  { label: 'Data & Govern', items: [CENTERS[19], CENTERS[20], CENTERS[21], CENTERS[22]] },
  { label: 'Builder & Settings', items: [CENTERS[23], CENTERS[24]] },
];