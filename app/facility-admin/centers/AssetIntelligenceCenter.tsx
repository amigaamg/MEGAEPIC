'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Asset Intelligence Center — Engine VI
// Every physical, digital, and clinical resource of the hospital is a living
// constitutional asset with a complete lifecycle — registration, warranty,
// maintenance, calibration, utilization, faults, predictive health, replacement
// forecast, and a Digital Twin that recolours the whole hospital live.
//
// Layout mirrors the Facility Command Center: an asset rail, a 4-step
// registration wizard, department dashboards, biomedical engineering,
// calibration, utilization, fault impact, predictive maintenance, lifecycle
// timelines, a capital treemap, realtime alerts and the report catalogue.
// Pure engine + repository, optimistic writes with rollback.
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Boxes, Plus, Building2, Wrench, ShieldAlert, Ruler,
  Activity as ActivityIcon, AlertTriangle, CalendarCheck, Cpu, LineChart, FileText,
  Search, Loader2, CircleDot, Siren, TrendingUp,
} from 'lucide-react';
import { AssetIntelligenceEngine } from '@/lib/amexan/assets/AssetIntelligenceEngine';
import { FirestoreAssetRepository } from '@/lib/amexan/assets/FirestoreAssetRepository';
import {
  ASSET_CATEGORIES, ASSET_CATALOG, DEPARTMENTS, getCatalogItem, getCategory,
  getAssetCategoryLabel, ASSET_STATUSES, FUNDING_SOURCES, MAINTENANCE_TYPES, REPORTS,
  DIGITAL_TWIN_LEGEND,
} from '@/lib/amexan/assets/registry';
import type {
  AssetModel, AssetRecord, AssetStatus,
} from '@/lib/amexan/assets/constitutional-types';
import { C } from '../ui';

type AssetTab =
  | 'dashboard' | 'assets' | 'register' | 'departments' | 'maintenance'
  | 'biomedical' | 'calibration' | 'utilization' | 'faults' | 'lifecycle'
  | 'digital' | 'analytics' | 'reports';

const NAV: { id: AssetTab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assets', label: 'Asset Register', icon: Boxes },
  { id: 'register', label: 'Register Asset', icon: Plus },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'biomedical', label: 'Biomedical Eng.', icon: ShieldAlert },
  { id: 'calibration', label: 'Calibration', icon: Ruler },
  { id: 'utilization', label: 'Utilization', icon: ActivityIcon },
  { id: 'faults', label: 'Fault Impact', icon: AlertTriangle },
  { id: 'lifecycle', label: 'Lifecycle', icon: CalendarCheck },
  { id: 'digital', label: 'Digital Twin', icon: Cpu },
  { id: 'analytics', label: 'Capital Analytics', icon: LineChart },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const lbl: React.CSSProperties = { fontSize: 10, color: C.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 };
const inputStyle: React.CSSProperties = { width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none', background: '#fff', color: C.navy, fontFamily: 'inherit' };

function fmtKES(n: number): string {
  if (!n) return 'KES 0';
  if (n >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n.toLocaleString()}`;
}

function statusColor(status: AssetStatus): string {
  return ASSET_STATUSES.find((s) => s.id === status)?.color ?? C.slate;
}

function statusLabel(status: AssetStatus): string {
  return ASSET_STATUSES.find((s) => s.id === status)?.label ?? status;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}

function Panel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, margin: 0 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PanelStep({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{title}</div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{subtitle}</div>
      {children}
    </div>
  );
}

function ActionBtn({ label, onClick, tone = C.sky, disabled }: { label: string; onClick: () => void; tone?: string; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: tone, color: '#fff', fontSize: 11, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap' }}>{label}</button>;
}

function TinyBtn({ label, onClick, tone = C.sky }: { label: string; onClick: () => void; tone?: string }) {
  return <button onClick={onClick} style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid ${tone === C.red ? C.red : C.border}`, background: '#fff', color: tone, fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{label}</button>;
}

function StatusRing({ status }: { status: AssetStatus }) {
  const color = statusColor(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <CircleDot size={13} color={color} />
      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'capitalize' }}>{statusLabel(status)}</span>
    </div>
  );
}

function AssetMini({ asset, onOpen }: { asset: AssetRecord; onOpen: (t: AssetTab, id?: string) => void }) {
  const cat = getCategory(asset.category);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${C.sky}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{cat?.icon ?? '📦'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</div>
        <div style={{ fontSize: 10, color: C.muted }}>{asset.assetId} · {cat?.label} · {asset.department}</div>
      </div>
      <StatusRing status={asset.status} />
      <div style={{ fontSize: 10, color: C.slate, textAlign: 'right', minWidth: 70 }}>{fmtKES(asset.finance.purchaseCost)}</div>
      <button onClick={() => onOpen('lifecycle', asset.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.sky, fontWeight: 600 }}>Lifecycle →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main center
// ═══════════════════════════════════════════════════════════════════════════════
export function AssetIntelligenceCenter({ orgId, actorId, actorName }: {
  orgId: string;
  actorId: string;
  actorName: string;
}) {
  const [model, setModel] = useState<AssetModel | null>(null);
  const [tab, setTab] = useState<AssetTab>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const repoRef = useRef(new FirestoreAssetRepository(orgId));

  const navigate = useCallback((next: AssetTab, assetId?: string) => {
    setTab(next);
    setSelectedAssetId(assetId);
  }, []);

  const load = useCallback(async () => {
    const m = await repoRef.current.loadAll();
    setModel(m ?? AssetIntelligenceEngine.create({ organizationId: orgId }));
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 2600);
  };

  const mutate = useCallback(async (next: AssetModel | ((m: AssetModel) => AssetModel)) => {
    if (!model) return;
    setSaving(true);
    const prev = model;
    const applied = typeof next === 'function' ? next(model) : next;
    setModel(applied);
    try {
      await repoRef.current.save(applied);
      notify('Saved');
    } catch (e: any) {
      setModel(prev);
      notify(`Save failed — ${e?.message || 'unknown'}`, false);
    } finally {
      setSaving(false);
    }
  }, [model]);

  if (!model) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: '50vh', color: C.slate }}><Loader2 className="spin" size={22} color={C.sky} /> Loading Asset Intelligence…</div>;
  }

  const overview = AssetIntelligenceEngine.getOverview(model);
  const alerts = AssetIntelligenceEngine.alerts(model);
  const searches = query.trim() ? AssetIntelligenceEngine.search(model, query) : null;

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 150px)' }}>
      <aside style={{ width: 208, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 8px', overflowY: 'auto' }}>
        <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 800, color: C.navy }}>Hospital Asset Intelligence</div>
        <div style={{ fontSize: 10, color: C.muted, padding: '0 10px 8px' }}>Engine VI · living lifecycle</div>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => navigate(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8,
              fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.sky : C.slate,
              background: active ? C.skyLight : 'transparent', cursor: 'pointer', border: 'none', textAlign: 'left',
            }}>
              <Icon size={15} /> {n.label}
            </button>
          );
        })}
        {alerts.length > 0 && (
          <div style={{ marginTop: 10, padding: '10px', borderRadius: 10, background: `${C.amber}14`, border: `1px solid ${C.amber}`, fontSize: 11, fontWeight: 700, color: C.amber }}>⚠ {alerts.length} realtime alert{alerts.length > 1 ? 's' : ''}</div>
        )}
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={13} color={C.muted} style={{ position: 'absolute', left: 8, top: 10 }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search assets, ID, model, dept…" style={{ ...inputStyle, paddingLeft: 28 }} />
          </div>
          {saving && <span style={{ fontSize: 11, color: C.slate, display: 'flex', alignItems: 'center', gap: 6 }}><Loader2 size={12} className="spin" /> Persisting…</span>}
          <span style={{ flex: 1 }} />
          <ActionBtn label="+ Register Asset" onClick={() => navigate('register')} />
        </div>

        {query.trim() && searches ? (
          <Panel title={`Search results (${searches.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {searches.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No matches.</div>}
              {searches.map(a => <AssetMini key={a.id} asset={a} onOpen={navigate} />)}
            </div>
          </Panel>
        ) : (
          <>
            {tab === 'dashboard' && <DashboardView model={model} overview={overview} alerts={alerts} onOpen={navigate} />}
            {tab === 'assets' && <AssetsView model={model} onOpen={navigate} />}
            {tab === 'register' && <RegisterView actorId={actorId} onMutate={mutate} onDone={() => navigate('assets')} />}
            {tab === 'departments' && <DepartmentsView model={model} onOpen={navigate} />}
            {tab === 'maintenance' && <MaintenanceView model={model} actorId={actorId} actorName={actorName} onMutate={mutate} />}
            {tab === 'biomedical' && <BiomedicalView model={model} actorId={actorId} onMutate={mutate} />}
            {tab === 'calibration' && <CalibrationView model={model} actorId={actorId} actorName={actorName} onMutate={mutate} />}
            {tab === 'utilization' && <UtilizationView model={model} actorId={actorId} onMutate={mutate} />}
            {tab === 'faults' && <FaultsView model={model} actorId={actorId} onMutate={mutate} />}
            {tab === 'lifecycle' && <LifecycleView model={model} selectedId={selectedAssetId} actorId={actorId} onMutate={mutate} onSelect={setSelectedAssetId} />}
            {tab === 'digital' && <DigitalTwinView model={model} onOpen={navigate} />}
            {tab === 'analytics' && <AnalyticsView model={model} overview={overview} />}
            {tab === 'reports' && <ReportsView model={model} />}
          </>
        )}
      </main>

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: toast.ok ? C.green : C.red, color: '#fff', padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 60, boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}>{toast.msg}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardView({ model, overview, alerts, onOpen }: {
  model: AssetModel;
  overview: { totalAssets: number; operational: number; maintenance: number; faulted: number; reserved: number; totalValue: number; maintenanceCostYtd: number; avgUtilization: number; warrantyExpiring: number; calibrationDue: number; healthScore: number; openFaults: number };
  alerts: { level: string; assetName: string; detail: string }[];
  onOpen: (t: AssetTab) => void;
}) {
  const kpis = [
    { label: 'Registered Assets', value: overview.totalAssets, color: C.navy, go: 'assets' as AssetTab },
    { label: 'Operational', value: overview.operational, color: C.green, go: 'assets' as AssetTab },
    { label: 'Under Maintenance', value: overview.maintenance, color: C.amber, go: 'maintenance' as AssetTab },
    { label: 'Faulted', value: overview.faulted, color: C.red, go: 'faults' as AssetTab },
    { label: 'Reserved', value: overview.reserved, color: C.sky, go: 'assets' as AssetTab },
    { label: 'Utilization', value: `${overview.avgUtilization}%`, color: C.sky, go: 'utilization' as AssetTab },
    { label: 'Asset Value', value: fmtKES(overview.totalValue), color: C.purple, go: 'analytics' as AssetTab },
    { label: 'Maint. Cost YTD', value: fmtKES(overview.maintenanceCostYtd), color: C.amber, go: 'maintenance' as AssetTab },
    { label: 'Health Score', value: `${overview.healthScore}%`, color: C.green, go: 'analytics' as AssetTab },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>Hospital Asset Intelligence</div>
          <div style={{ fontSize: 12, color: C.muted }}>Every resource is a living constitutional asset — procurement → retirement.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <TinyBtn label={`Warranty expiring: ${overview.warrantyExpiring}`} tone={C.amber} onClick={() => onOpen('digital')} />
          <TinyBtn label={`Calibration due: ${overview.calibrationDue}`} tone={C.sky} onClick={() => onOpen('calibration')} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {kpis.map(k => (
          <button key={k.label} onClick={() => onOpen(k.go)} style={{ textAlign: 'left', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.label}</div>
          </button>
        ))}
      </div>

      {alerts.length > 0 && (
        <Panel title={`Realtime Alerts (${alerts.length})`} subtitle="Generator fuel, MRI temperature, UPS battery, calibration, maintenance — live.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {alerts.slice(0, 8).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: a.level === 'high' ? `${C.red}10` : `${C.amber}10`, fontSize: 12 }}>
                <AlertTriangle size={14} color={a.level === 'high' ? C.red : C.amber} />
                <span style={{ fontWeight: 700 }}>{a.assetName}</span>
                <span style={{ flex: 1 }} />
                <span style={{ color: C.slate }}>{a.detail}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'start' }}>
        <Panel title="Latest Assets" subtitle="Recently registered">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {model.assets.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No assets yet. Register the first one.</div>}
            {model.assets.slice(-5).reverse().map(a => <AssetMini key={a.id} asset={a} onOpen={onOpen} />)}
          </div>
        </Panel>
        <Panel title="Department Value" subtitle="Capital treemap">
          <DepartmentTreemap model={model} />
        </Panel>
      </div>
    </div>
  );
}

function DepartmentTreemap({ model }: { model: AssetModel }) {
  const tm = AssetIntelligenceEngine.departmentTreemap(model);
  const total = tm.reduce((s, d) => s + d.value, 0);
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  if (tm.length === 0) return <div style={{ fontSize: 12, color: C.muted }}>No data yet.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {tm.slice(0, 6).map(d => (
        <div key={d.department} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 78, fontSize: 11, fontWeight: 700 }}>{d.department}</span>
          <div style={{ flex: 1, height: 14, borderRadius: 7, background: '#eef2f7', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct(d.value)}%`, background: d.value > 1000000000 ? C.purple : d.value > 100000000 ? C.sky : C.green, borderRadius: 7 }} />
          </div>
          <span style={{ width: 64, fontSize: 10, color: C.slate, textAlign: 'right' }}>{fmtKES(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// All Assets
// ═══════════════════════════════════════════════════════════════════════════════
function AssetsView({ model, onOpen }: { model: AssetModel; onOpen: (t: AssetTab, id?: string) => void }) {
  const [cat, setCat] = useState('all');
  const assets = cat === 'all' ? model.assets : AssetIntelligenceEngine.byCategory(model, cat);
  const sorted = [...assets].reverse();
  return (
    <Panel title={`Asset Register (${model.assets.length})`} subtitle="Search, filter by constitutional category, inspect each lifecycle." action={
      <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inputStyle, width: 220 }}>
        <option value="all">All categories</option>
        {ASSET_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
      </select>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No assets in this category.</div>}
        {sorted.map(a => <AssetMini key={a.id} asset={a} onOpen={onOpen} />)}
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Registration wizard
// ═══════════════════════════════════════════════════════════════════════════════
const STEP_LABELS = ['Department', 'Asset', 'Profile', 'Finance'];

function RegisterView({ actorId, onMutate, onDone }: {
  actorId: string;
  onMutate: (f: (m: AssetModel) => AssetModel) => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [dept, setDept] = useState('');
  const [deptSearch, setDeptSearch] = useState('');
  const [itemKey, setItemKey] = useState<string>('');
  const [assetName, setAssetName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [modelStr, setModelStr] = useState('');
  const [serial, setSerial] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [cost, setCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [funding, setFunding] = useState('private');
  const [lifeYears, setLifeYears] = useState('10');
  const [residual, setResidual] = useState('');
  const [installed, setInstalled] = useState('');
  const catalogItem = itemKey ? getCatalogItem(itemKey) : undefined;

  const canNext = step === 0 ? dept !== '' : step === 1 ? (itemKey !== '' || assetName.trim() !== '') : true;

  const finish = () => {
    if (!dept) return;
    const costNum = Number(cost) || catalogItem?.suggestedCost || 0;
    onMutate(m => AssetIntelligenceEngine.registerAsset(m, actorId, {
      department: dept,
      category: catalogItem?.category ?? 'medical_equipment',
      itemKey: itemKey || undefined,
      name: assetName,
      manufacturer,
      model: modelStr,
      serialNumber: serial,
      location: { building, floor, room },
      finance: {
        purchaseCost: costNum,
        supplier,
        fundingSource: funding as any,
        usefulLifeYears: Number(lifeYears) || 10,
        residualValue: Number(residual) || 0,
        installationDate: installed ? new Date(installed).getTime() : Date.now(),
      },
    }).model);
    onDone();
  };

  return (
    <Panel title="Asset Registration Wizard" subtitle="The administrator rarely types categories — they are constitutional." action={
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STEP_LABELS.map((s, i) => <span key={s} style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, background: i <= step ? C.sky : C.border, color: i <= step ? '#fff' : C.muted }}>{i + 1}. {s}</span>)}
      </div>
    }>
      {step === 0 && (
        <PanelStep title="Step 1 · Choose Department" subtitle="The asset automatically belongs to this department.">
          <input value={deptSearch} onChange={e => setDeptSearch(e.target.value)} placeholder="Search department…" style={inputStyle} />
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
            {DEPARTMENTS.filter(d => d.label.toLowerCase().includes(deptSearch.toLowerCase())).map(d => (
              <button key={d.id} onClick={() => setDept(d.id)} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: dept === d.id ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: dept === d.id ? C.skyLight : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.navy }}>
                {d.label}
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>{d.amexan}</div>
              </button>
            ))}
          </div>
        </PanelStep>
      )}
      {step === 1 && (
        <PanelStep title="Step 2 · Choose Asset" subtitle="Select from the constitutional catalog, or type a custom asset.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {ASSET_CATALOG.map(c => {
              const cat = getCategory(c.category);
              return (
                <button key={c.key} onClick={() => { setItemKey(c.key); setAssetName(c.name); }} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: itemKey === c.key ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: itemKey === c.key ? C.skyLight : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.navy }}>
                  {cat?.icon} {c.name}
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>{cat?.label} · {fmtKES(c.suggestedCost)}</div>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 10 }}><label style={lbl}>Custom asset name (optional)</label>
            <input value={assetName} onChange={e => setAssetName(e.target.value)} placeholder="Type a custom asset" style={inputStyle} />
          </div>
        </PanelStep>
      )}
      {step === 2 && (
        <PanelStep title="Step 3 · Asset Profile" subtitle="Identity, location, barcode, RFID — the AMEXAN Asset ID is assigned automatically.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Field label="Category"><input value={catalogItem ? getAssetCategoryLabel(catalogItem.category) : 'Medical Equipment'} disabled style={inputStyle} /></Field>
            <Field label="Manufacturer"><input value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="e.g. Siemens" style={inputStyle} /></Field>
            <Field label="Model"><input value={modelStr} onChange={e => setModelStr(e.target.value)} placeholder="e.g. Somatom X" style={inputStyle} /></Field>
            <Field label="Serial Number"><input value={serial} onChange={e => setSerial(e.target.value)} style={inputStyle} /></Field>
            <Field label="Building"><input value={building} onChange={e => setBuilding(e.target.value)} placeholder="Main Building" style={inputStyle} /></Field>
            <Field label="Floor"><input value={floor} onChange={e => setFloor(e.target.value)} placeholder="Level 2" style={inputStyle} /></Field>
            <Field label="Room"><input value={room} onChange={e => setRoom(e.target.value)} placeholder="Room 214" style={inputStyle} /></Field>
          </div>
        </PanelStep>
      )}
      {step === 3 && (
        <PanelStep title="Step 4 · Financial Details" subtitle="Automatically linked to Finance — depreciation, funding, supplier.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Field label="Purchase Cost (KES)"><input value={cost} onChange={e => setCost(e.target.value)} placeholder={catalogItem ? String(catalogItem.suggestedCost) : 'e.g. 145000000'} style={inputStyle} /></Field>
            <Field label="Supplier"><input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Vendor name" style={inputStyle} /></Field>
            <Field label="Funding Source">
              <select value={funding} onChange={e => setFunding(e.target.value)} style={inputStyle}>
                {FUNDING_SOURCES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </Field>
            <Field label="Useful Life (years)"><input value={lifeYears} onChange={e => setLifeYears(e.target.value)} style={inputStyle} /></Field>
            <Field label="Residual Value (KES)"><input value={residual} onChange={e => setResidual(e.target.value)} style={inputStyle} /></Field>
            <Field label="Installation date (optional)">
              <input type="date" value={installed} onChange={e => setInstalled(e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </PanelStep>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 8 }}>
        <TinyBtn label="← Back" onClick={() => step > 0 && setStep(step - 1)} />
        {step < 3 ? (
          <ActionBtn label="Next →" onClick={() => setStep(step + 1)} disabled={!canNext} />
        ) : (
          <ActionBtn label="Register Asset" tone={C.green} onClick={finish} />
        )}
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Departments
// ═══════════════════════════════════════════════════════════════════════════════
function DepartmentsView({ model }: { model: AssetModel; onOpen: (t: AssetTab, id?: string) => void }) {
  const rows = DEPARTMENTS
    .map(d => ({ ...d, ...AssetIntelligenceEngine.departmentOverview(model, d.id) }))
    .filter(d => d.assets > 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Department Dashboards" subtitle="Every department head lands on these — no spreadsheets.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No assets registered yet.</div>}
          {rows.map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px', borderRadius: 10, background: '#f8fafc', flexWrap: 'wrap' }}>
              <div style={{ width: 130, fontSize: 13, fontWeight: 800, color: C.navy }}>{d.label}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, flexWrap: 'wrap' }}>
                <span>Assets <b>{d.assets}</b></span>
                <span style={{ color: C.green }}>Operational <b>{d.operational}</b></span>
                <span style={{ color: C.sky }}>Utilization <b>{d.avgUtilization}%</b></span>
                <span style={{ color: C.amber }}>Maint <b>{fmtKES(d.maintenanceCost)}</b></span>
                <span style={{ color: C.purple }}>Value <b>{fmtKES(d.value)}</b></span>
              </div>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: d.faults > 0 ? C.red : C.green, fontWeight: 700 }}>{d.faults > 0 ? `⚠ ${d.faults} open fault` : 'OK'}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Capital Treemap by Department" subtitle="Total replacement value per department.">
        <DepartmentTreemap model={model} />
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Maintenance
// ═══════════════════════════════════════════════════════════════════════════════
function MaintenanceView({ model, actorId, actorName, onMutate }: {
  model: AssetModel; actorId: string; actorName: string; onMutate: (f: (m: AssetModel) => AssetModel) => void;
}) {
  const [assetId, setAssetId] = useState(model.assets[0]?.id ?? '');
  const [type, setType] = useState('preventive');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [when, setWhen] = useState('');
  const schedule = () => {
    if (!title.trim() || !assetId) return;
    onMutate(m => AssetIntelligenceEngine.scheduleMaintenance(m, actorId, {
      assetId, type: type as any, title, description: desc, scheduledFor: when ? new Date(when).getTime() : Date.now(),
    }).model);
    setTitle(''); setDesc('');
  };
  const jobs = [...model.maintenance].reverse();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Schedule Maintenance" subtitle="Routine, preventive, corrective, calibration, cleaning, software, inspection, safety — not 'working / broken'.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Asset">
            <select value={assetId} onChange={e => setAssetId(e.target.value)} style={inputStyle}>
              {model.assets.length === 0 && <option value="">No assets yet</option>}
              {model.assets.map(a => <option key={a.id} value={a.id}>{a.name} · {a.assetId}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              {MAINTENANCE_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
            </select>
          </Field>
          <Field label="Scheduled for"><input type="date" value={when} onChange={e => setWhen(e.target.value)} style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Job title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Replace cooling fan" style={inputStyle} />
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Details</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ ...inputStyle, height: 'auto', padding: '10px', fontFamily: 'inherit', resize: 'vertical' }} placeholder="What the biomedical team will do" />
        </div>
        <div style={{ marginTop: 10 }}>
          <ActionBtn label="Schedule Job" onClick={schedule} />
        </div>
      </Panel>
      <Panel title={`Maintenance Log (${model.maintenance.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {jobs.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No maintenance jobs yet.</div>}
          {jobs.map(j => {
            const asset = model.assets.find(a => a.id === j.assetId);
            const tone = j.status === 'completed' ? C.green : j.status === 'overdue' ? C.red : C.amber;
            return (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <span style={{ fontSize: 15 }}>{MAINTENANCE_TYPES.find(t => t.id === j.type)?.icon ?? '🔧'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{j.title} <span style={{ color: C.muted, fontWeight: 500 }}>· {asset?.name}</span></div>
                  <div style={{ fontSize: 10, color: C.muted }}>{j.type.replace('_', ' ')} · due {new Date(j.scheduledFor).toLocaleDateString()}{j.cost ? ` · ${fmtKES(j.cost)}` : ''}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: tone, textTransform: 'capitalize' }}>{j.status}</span>
                {j.status === 'scheduled' && <TinyBtn label="Complete" tone={C.green} onClick={() => onMutate(m => AssetIntelligenceEngine.completeMaintenance(m, actorId, j.id, { performedBy: actorName, cost: 0 }).model)} />}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Biomedical engineering
// ═══════════════════════════════════════════════════════════════════════════════
function BiomedicalView({ model, actorId, onMutate }: {
  model: AssetModel; actorId: string; onMutate: (f: (m: AssetModel) => AssetModel) => void;
}) {
  const openFaults = model.faults.filter(f => f.status !== 'resolved');
  const scheduled = model.maintenance.filter(m => m.status === 'scheduled');
  const completedToday = model.maintenance.filter(m => m.status === 'completed').length;
  const predicted = AssetIntelligenceEngine.predictiveHealth(model);
  const highRisk = predicted.assets.filter(a => a.health.failureProbabilityPct >= 70);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {[
          { label: "Today's Jobs", value: scheduled.length, color: C.sky },
          { label: 'Pending', value: scheduled.length, color: C.amber },
          { label: 'Critical Faults', value: openFaults.filter(f => f.severity === 'critical').length, color: C.red },
          { label: 'Completed', value: completedToday, color: C.green },
          { label: 'High Risk Assets', value: highRisk.length, color: C.purple },
        ].map(k => (
          <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase' }}>{k.label}</div>
          </div>
        ))}
      </div>
      <Panel title="Open Service Requests" subtitle="The biomedical engineer's queue — faults first.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {openFaults.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No open service requests.</div>}
          {openFaults.map(f => {
            const asset = model.assets.find(a => a.id === f.assetId);
            const tone = f.severity === 'critical' ? C.red : f.severity === 'high' ? C.amber : C.slate;
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <AlertTriangle size={14} color={tone} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{asset?.name} <span style={{ color: C.muted, fontWeight: 500 }}>· {asset?.assetId}</span></div>
                  <div style={{ fontSize: 10, color: C.muted }}>{f.description} · {f.impact?.revenueLossPerDay ? `${fmtKES(f.impact.revenueLossPerDay)}/day` : ''}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: tone, textTransform: 'uppercase' }}>{f.severity}</span>
                <TinyBtn label="Resolve" tone={C.green} onClick={() => onMutate(m => AssetIntelligenceEngine.resolveFault(m, actorId, f.id, 'Fixed by biomedical'))} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Calibration
// ═══════════════════════════════════════════════════════════════════════════════
function CalibrationView({ model, actorId, actorName, onMutate }: {
  model: AssetModel; actorId: string; actorName: string; onMutate: (f: (m: AssetModel) => AssetModel) => void;
}) {
  const now = Date.now();
  const [assetId, setAssetId] = useState(model.assets[0]?.id ?? '');
  const [days, setDays] = useState('180');
  const overdue = model.calibration.filter(c => c.nextDue < now);
  const dueSoon = model.calibration.filter(c => c.nextDue >= now && c.nextDue - now <= 30 * 86400000);
  const calibrate = () => {
    if (!assetId) return;
    onMutate(m => AssetIntelligenceEngine.calibrate(m, actorId, {
      assetId, performedBy: actorName, nextDueInDays: Number(days) || 180,
    }).model);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Calibration" subtitle="Ventilators, defibrillators, lab instruments — know exactly when due. AMEXAN warns when overdue.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Asset">
            <select value={assetId} onChange={e => setAssetId(e.target.value)} style={inputStyle}>
              {model.assets.length === 0 && <option value="">No assets yet</option>}
              {model.assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="Next due in (days)"><input value={days} onChange={e => setDays(e.target.value)} style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 10 }}><ActionBtn label="Record Calibration" onClick={calibrate} /></div>
      </Panel>
      <Panel title={`Calibration Register (${model.calibration.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {model.calibration.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No calibration records yet.</div>}
          {model.calibration.slice().reverse().map(c => {
            const state = c.nextDue < now ? 'OVERDUE' : c.nextDue - now <= 30 * 86400000 ? 'due soon' : 'healthy';
            const tone = c.nextDue < now ? C.red : c.nextDue - now <= 30 * 86400000 ? C.amber : C.green;
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{c.assetName}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Last: {new Date(c.lastCalibration).toLocaleDateString()} · Next: {new Date(c.nextDue).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: tone, textTransform: 'uppercase' }}>{state}</span>
              </div>
            );
          })}
        </div>
      </Panel>
      {(overdue.length > 0 || dueSoon.length > 0) && (
        <Panel title="Calibration Alerts" subtitle={`${overdue.length} overdue · ${dueSoon.length} due within 30 days.`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {overdue.map(c => <div key={c.id} style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: `${C.red}10`, color: C.red, fontWeight: 700 }}>⚠ {c.assetName} — calibration overdue</div>)}
            {dueSoon.map(c => <div key={c.id} style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: `${C.amber}10`, color: C.amber, fontWeight: 700 }}>⏳ {c.assetName} — calibration due {new Date(c.nextDue).toLocaleDateString()}</div>)}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Utilization
// ═══════════════════════════════════════════════════════════════════════════════
function UtilizationView({ model, actorId, onMutate }: {
  model: AssetModel; actorId: string; onMutate: (f: (m: AssetModel) => AssetModel) => void;
}) {
  const [assetId, setAssetId] = useState(model.assets[0]?.id ?? '');
  const [usage, setUsage] = useState('');
  const [max, setMax] = useState('');
  const [revenue, setRevenue] = useState('');
  const [downtime, setDowntime] = useState('');
  const record = () => {
    if (!assetId) return;
    onMutate(m => AssetIntelligenceEngine.recordUtilization(m, actorId, assetId, {
      usageToday: Number(usage) || 0,
      maxCapacity: Number(max) || undefined,
      revenueToday: Number(revenue) || undefined,
      downtimeMinutes: Number(downtime) || undefined,
    }).model);
    setUsage('');
  };
  const tracked = model.assets.filter(a => a.utilization?.utilizationPct !== undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Record Utilization" subtitle="Scans today, capacity, revenue — the administrator sees value, not just 'working'.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          <Field label="Asset">
            <select value={assetId} onChange={e => setAssetId(e.target.value)} style={inputStyle}>
              {model.assets.length === 0 && <option value="">No assets yet</option>}
              {model.assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="Usage today"><input value={usage} onChange={e => setUsage(e.target.value)} placeholder="e.g. 81 scans" style={inputStyle} /></Field>
          <Field label="Max capacity"><input value={max} onChange={e => setMax(e.target.value)} placeholder="e.g. 120" style={inputStyle} /></Field>
          <Field label="Revenue today (KES)"><input value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="e.g. 1800000" style={inputStyle} /></Field>
          <Field label="Downtime (mins)"><input value={downtime} onChange={e => setDowntime(e.target.value)} placeholder="e.g. 12" style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 10 }}><ActionBtn label="Record" onClick={record} /></div>
      </Panel>
      <Panel title={`Utilization (${tracked.length} tracked)`} subtitle="Live value creation per asset.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tracked.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No utilization recorded yet.</div>}
          {tracked.slice().reverse().map(a => {
            const u = a.utilization!;
            const pctColor = (u.utilizationPct ?? 0) >= 70 ? C.green : (u.utilizationPct ?? 0) >= 40 ? C.sky : C.amber;
            return (
              <div key={a.id} style={{ padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700 }}>{a.name}</span>
                    <span style={{ color: C.muted, fontSize: 10 }}> · {u.scansToday ?? 0} today · avg {u.average ?? 0} · max {u.maximum ?? 0} · revenue {fmtKES(u.revenueToday ?? 0)} · downtime {u.downtimeMinutes ?? 0}m</span>
                  </div>
                  <span style={{ width: 60, textAlign: 'right', fontWeight: 800, color: pctColor }}>{u.utilizationPct ?? 0}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: '#eef2f7', overflow: 'hidden', marginTop: 6 }}>
                  <div style={{ height: '100%', width: `${u.utilizationPct ?? 0}%`, background: pctColor, borderRadius: 5 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Faults & impact
// ═══════════════════════════════════════════════════════════════════════════════
function FaultsView({ model, actorId, onMutate }: {
  model: AssetModel; actorId: string; onMutate: (f: (m: AssetModel) => AssetModel) => void;
}) {
  const [assetId, setAssetId] = useState(model.assets[0]?.id ?? '');
  const [severity, setSeverity] = useState('critical');
  const [desc, setDesc] = useState('');
  const [revenueLoss, setRevenueLoss] = useState('');
  const [service, setService] = useState('');
  const report = () => {
    if (!assetId || !desc.trim()) return;
    onMutate(m => AssetIntelligenceEngine.reportFault(m, actorId, {
      assetId, severity: severity as any, description: desc,
      impact: { revenueLossPerDay: Number(revenueLoss) || undefined, service: service || 'General', narrative: desc },
    }).model);
    setDesc('');
  };
  const open = model.faults.filter(f => f.status !== 'resolved');
  const totalDailyLoss = open.reduce((s, f) => s + (f.impact?.revenueLossPerDay ?? 0), 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Report a Fault" subtitle="Every fault is logged with its clinical + revenue impact.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          <Field label="Asset">
            <select value={assetId} onChange={e => setAssetId(e.target.value)} style={inputStyle}>
              {model.assets.length === 0 && <option value="">No assets yet</option>}
              {model.assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="Severity">
            <select value={severity} onChange={e => setSeverity(e.target.value)} style={inputStyle}>
              <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </Field>
          <Field label="Revenue loss / day (KES)"><input value={revenueLoss} onChange={e => setRevenueLoss(e.target.value)} style={inputStyle} /></Field>
          <Field label="Affected service"><input value={service} onChange={e => setService(e.target.value)} placeholder="e.g. CT brain" style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Description</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. X-ray tube failed" style={inputStyle} />
        </div>
        <div style={{ marginTop: 10 }}><ActionBtn label="Report Fault" tone={C.red} onClick={report} /></div>
      </Panel>
      <Panel title={`Open Faults (${open.length})`} subtitle={totalDailyLoss ? `Estimated daily revenue impact: ${fmtKES(totalDailyLoss)}` : 'No estimated revenue impact yet.'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {open.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No open faults.</div>}
          {open.map(f => {
            const asset = model.assets.find(a => a.id === f.assetId);
            const tone = f.severity === 'critical' ? C.red : f.severity === 'high' ? C.amber : C.slate;
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <AlertTriangle size={14} color={tone} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{asset?.name} <span style={{ color: C.muted, fontWeight: 500 }}>· {asset?.assetId}</span></div>
                  <div style={{ fontSize: 10, color: C.muted }}>{f.description}{f.impact?.service ? ` · ${f.impact.service} capacity reduced` : ''}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: tone, textTransform: 'uppercase' }}>{f.severity}</span>
                {f.impact?.revenueLossPerDay ? <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>{fmtKES(f.impact.revenueLossPerDay)}/day</span> : null}
                <TinyBtn label="Resolve" tone={C.green} onClick={() => onMutate(m => AssetIntelligenceEngine.resolveFault(m, actorId, f.id, 'Resolved'))} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════
function LifecycleView({ model, selectedId, actorId, onMutate, onSelect }: {
  model: AssetModel; selectedId?: string; actorId: string;
  onMutate: (f: (m: AssetModel) => AssetModel) => void; onSelect: (id: string) => void;
}) {
  const asset = model.assets.find(a => a.id === selectedId) ?? model.assets[model.assets.length - 1];
  if (!asset) return <Panel title="Lifecycle Timeline" subtitle="Complete history of one asset."><div style={{ fontSize: 12, color: C.muted }}>No assets yet.</div></Panel>;
  const events = [...asset.lifecycle].reverse();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Asset Lifecycle Timeline" subtitle="Purchased → installed → calibrated → serviced → fault → repair → operational → upgrade → replaced → retired." action={
        <select value={asset.id} onChange={e => onSelect(e.target.value)} style={{ ...inputStyle, width: 240 }}>
          {model.assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: e.type === 'fault' ? C.red : e.type === 'retired' || e.type === 'replacement' ? C.muted : C.sky }} />
                {i < events.length - 1 && <span style={{ width: 2, flex: 1, background: C.border }} />}
              </div>
              <div style={{ paddingBottom: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{e.type}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{e.detail} · {new Date(e.at).toLocaleString()} · {e.by}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Manage Asset">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.muted, marginRight: 4 }}>Set status:</span>
          {ASSET_STATUSES.map(s => (
            <TinyBtn key={s.id} label={s.label} tone={asset.status === s.id ? s.color : C.slate} onClick={() => onMutate(m => AssetIntelligenceEngine.setStatus(m, actorId, asset.id, s.id as AssetStatus, `Set to ${s.label} by admin`))} />
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          <div><span style={{ color: C.muted }}>AMEXAN ID:</span> <b>{asset.assetId}</b></div>
          <div><span style={{ color: C.muted }}>Value:</span> <b>{fmtKES(asset.finance.purchaseCost)}</b></div>
          <div><span style={{ color: C.muted }}>Current:</span> <b>{fmtKES(asset.finance.currentValue ?? asset.finance.purchaseCost)}</b></div>
          <div><span style={{ color: C.muted }}>Failure risk:</span> <b style={{ color: asset.health.failureProbabilityPct >= 70 ? C.red : C.slate }}>{asset.health.failureProbabilityPct}%</b></div>
          <div><span style={{ color: C.muted }}>Supplier:</span> <b>{asset.finance.supplier || '—'}</b></div>
          <div><span style={{ color: C.muted }}>Funding:</span> <b>{asset.finance.fundingSource}</b></div>
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Digital twin
// ═══════════════════════════════════════════════════════════════════════════════
function DigitalTwinView({ model, onOpen }: { model: AssetModel; onOpen: (t: AssetTab, id?: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Digital Twin" subtitle="Every asset recolours the hospital live — green operational, amber maintenance, red fault, blue reserved.">
        <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
          {DIGITAL_TWIN_LEGEND.map(l => (
            <span key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: C.slate }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.color }} /> {l.label}
            </span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
          {model.assets.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No assets yet — the twin is empty.</div>}
          {model.assets.map(a => {
            const color = statusColor(a.status);
            return (
              <button key={a.id} onClick={() => onOpen('lifecycle', a.id)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 12, background: `${color}10`, border: `1px solid ${color}`, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.navy }}>{a.name}</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{a.department} · {a.location.building || '—'} · {a.location.room || ''}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'capitalize', marginTop: 4 }}>{statusLabel(a.status)}</div>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Capital analytics
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsView({ model, overview }: {
  model: AssetModel;
  overview: { totalValue: number; avgUtilization: number; maintenanceCostYtd: number; avgDowntimeMinutes: number; replacementCost: number };
}) {
  const forecast = AssetIntelligenceEngine.replacementForecast(model);
  const budgetRequired = forecast.reduce((s, f) => s + f.replacementCost, 0);
  const treemap = AssetIntelligenceEngine.departmentTreemap(model);
  const total = treemap.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {[
          { label: 'Total Asset Value', value: fmtKES(overview.totalValue), color: C.purple },
          { label: 'Average Utilization', value: `${overview.avgUtilization}%`, color: C.sky },
          { label: 'Maintenance Cost YTD', value: fmtKES(overview.maintenanceCostYtd), color: C.amber },
          { label: 'Average Downtime', value: `${overview.avgDowntimeMinutes} mins`, color: C.red },
          { label: 'Replacement Budget', value: fmtKES(budgetRequired), color: C.navy },
        ].map(k => (
          <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase' }}>{k.label}</div>
          </div>
        ))}
      </div>
      <Panel title="Replacement Plan" subtitle="Assets past or near end of useful life, with failure probability and budget.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {forecast.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No replacement needed right now.</div>}
          {forecast.map(f => (
            <div key={f.assetId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              {f.critical ? <Siren size={14} color={C.red} /> : <TrendingUp size={14} color={C.amber} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{f.name} <span style={{ color: C.muted, fontWeight: 500 }}>· {f.department}</span></div>
                <div style={{ fontSize: 10, color: C.muted }}>{f.assetId} · {f.ageYears} yrs / {f.usefulLifeYears} yrs · {f.yearsToEndOfLife <= 0 ? 'past EOL' : `${f.yearsToEndOfLife} yrs left`} · failure {f.failureProbability}%</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.navy }}>{fmtKES(f.replacementCost)}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Department Comparison" subtitle="Capital value by department.">
        <DepartmentTreemap model={model} />
        <div style={{ marginTop: 8, fontSize: 11, color: C.muted }}>Total capital base: {fmtKES(total)}</div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Reports
// ═══════════════════════════════════════════════════════════════════════════════
function ReportsView({ model }: { model: AssetModel }) {
  const counts = model.assets.reduce((acc, a) => {
    acc[a.finance.fundingSource] = (acc[a.finance.fundingSource] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Reports Catalogue" subtitle="One-click exports for board, MOH, donors, auditors, finance.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {REPORTS.map(r => (
            <div key={r.id} style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.label}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{r.formats.join(' · ')}</div>
              </div>
              <TinyBtn label="Export" onClick={() => { /* CSV/PDF export hook */ }} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Funding Source Mix" subtitle="Government · Donor · Private · Research · Loan.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(counts).length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No assets yet.</div>}
          {Object.entries(counts).map(([k, v]) => {
            const pct = model.assets.length ? Math.round((v / model.assets.length) * 100) : 0;
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 90, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{k}</span>
                <div style={{ flex: 1, height: 12, borderRadius: 6, background: '#eef2f7', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: k === 'government' ? C.sky : k === 'donor' ? C.purple : k === 'research' ? C.green : C.amber, borderRadius: 6 }} />
                </div>
                <span style={{ width: 60, fontSize: 11, color: C.slate, textAlign: 'right' }}>{v} · {pct}%</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}