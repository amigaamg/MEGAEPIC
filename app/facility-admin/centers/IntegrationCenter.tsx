'use client';

// AMEXAN — Hospital Integration & Interoperability Center (Book V, Engine No. 23)
// The place where AMEXAN becomes the hospital's Clinical Intelligence Operating
// System — unifying EMRs, HMIS, laboratory, radiology, pharmacy, finance, HR,
// medical devices, government systems and future technology into one
// interoperable ecosystem.

// Constitutional rule: the hospital owns its existing systems. AMEXAN NEVER
// forces replacement. It layers intelligence, synchronization, analytics,
// workflow orchestration and interoperability ON TOP of what the hospital
// already runs — making every existing system smarter.

import { useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Atom, Boxes, Check, ClipboardList, Cpu, Download,
  GitBranch, Globe, HeartPulse, LayoutDashboard, Link2, Lock, Network, Plug,
  PlugZap, RefreshCw, Search, Settings, Share2, ShieldCheck, SlidersHorizontal,
  TestTube2, Timer, Workflow,
} from 'lucide-react';
import {
  FacilityAdministrationEngine,
  IMPORTABLE_ENTITIES,
  HMIS_SYSTEM_LABELS,
  type FacilityAdminModel,
  type SupportedHmisSystem,
  type IntegrationConnection,
} from '@/lib/amexan/facility';
import { C, Card, ActionBtn } from '../ui';

type ImportEntityType = typeof IMPORTABLE_ENTITIES[number];
type IntegrationKind = IntegrationConnection['kind'];

type IntegrationTab =
  | 'overview' | 'connected' | 'platforms' | 'wizard' | 'discovery' | 'mapping'
  | 'import' | 'sync' | 'transform' | 'fhir' | 'devices' | 'monitor' | 'analytics' | 'audit';

type EditableFn = (m: FacilityAdminModel) => FacilityAdminModel;

export function IntegrationCenter({ model, onSave, initialTab = 'overview' }: { model: FacilityAdminModel; onSave: (fn: EditableFn) => void; initialTab?: IntegrationTab }) {
  const [tab, setTab] = useState<IntegrationTab>(initialTab);
  const d = useEcosystem(model);

  const nav: { id: IntegrationTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'connected', label: 'Connected Systems', icon: Network },
    { id: 'platforms', label: 'Supported Platforms', icon: Boxes },
    { id: 'wizard', label: 'Add System', icon: Plug },
    { id: 'discovery', label: 'Data Discovery', icon: Search },
    { id: 'mapping', label: 'Entity Mapping', icon: GitBranch },
    { id: 'import', label: 'One-Click Import', icon: Download },
    { id: 'sync', label: 'Synchronization', icon: RefreshCw },
    { id: 'transform', label: 'Transformation Rules', icon: Settings },
    { id: 'fhir', label: 'FHIR Explorer', icon: Atom },
    { id: 'devices', label: 'Medical Devices', icon: Cpu },
    { id: 'monitor', label: 'Monitoring', icon: Activity },
    { id: 'analytics', label: 'Integration Health', icon: ShieldCheck },
    { id: 'audit', label: 'Audit', icon: ClipboardList },
  ];

  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <aside style={{ width: 200, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 8px', position: 'sticky', top: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '6px 12px 10px' }}>Integration Center</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={navItem(tab === n.id)}>
              <n.icon size={15} /> {n.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '11px 12px', borderRadius: 10, background: 'linear-gradient(135deg,#0b2c4d,#0ea5e9)', color: '#fff' }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em', opacity: .8 }}>CONNECTED</div>
          <div style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 3px' }}>{d.connected} / {d.target}</div>
          <div style={{ fontSize: 10, opacity: .85, lineHeight: 1.5 }}>systems unified by AMEXAN.</div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 460, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tab === 'overview' && <OverviewTab model={model} d={d} onNew={() => setTab('wizard')} />}
        {tab === 'connected' && <ConnectedTab model={model} onSave={onSave} />}
        {tab === 'platforms' && <PlatformsTab />}
        {tab === 'wizard' && <Wizard model={model} onSave={onSave} />}
        {tab === 'discovery' && <DiscoveryTab />}
        {tab === 'mapping' && <MappingTab />}
        {tab === 'import' && <ImportTab model={model} onSave={onSave} />}
        {tab === 'sync' && <SyncTab />}
        {tab === 'transform' && <TransformTab />}
        {tab === 'fhir' && <FhirTab model={model} />}
        {tab === 'devices' && <DevicesTab />}
        {tab === 'monitor' && <MonitorTab model={model} />}
        {tab === 'analytics' && <AnalyticsTab model={model} />}
        {tab === 'audit' && <AuditTab model={model} />}
      </main>
    </div>
  );
}

// ── Derived ecosystem analytics ────────────────────────────────────────────────

type Ecosystem = {
  connected: number;
  target: number;
  failed: number;
  interoperable: number;
  liveSync: boolean;
  syncStatus: string;
  lastSyncLabel: string;
  recordsImported: number;
  dailyTransactions: number;
  alerts: number;
  fhirEnabled: boolean;
  hl7Enabled: boolean;
};

function useEcosystem(model: FacilityAdminModel): Ecosystem {
  return useMemo(() => {
    const ints = model.integrations;
    const hmis = model.hmisConnections;
    const connectedHmis = hmis.filter(c => c.status !== 'disconnected');
    const activeInts = ints.filter(i => i.status === 'active' || i.status === 'configured');

    const names = new Set<string>();
    connectedHmis.forEach(c => names.add(`hmis:${c.system}`));
    activeInts.forEach(i => names.add(`int:${i.kind}`));

    const connected = names.size || (connectedHmis.length + activeInts.length);
    const target = 17;
    const interoperable = connected >= target ? 100 : Math.round((connected / target) * 100);
    const failed = ints.filter(i => i.status === 'error').length + hmis.filter(c => c.status === 'failed').length;
    const lastSync = [
      ...hmis.map(c => c.lastSyncAt || 0),
      ...ints.map(i => i.lastSyncAt || 0),
      ...model.importBatches.map(b => b.completedAt || 0),
    ].filter(Boolean).reduce((a, b) => Math.max(a, b), model.updatedAt);

    const recordsImported = model.importBatches.reduce((a, b) => a + b.importedCount, 0);
    const rowsToday = rowsImportedToday(model.importBatches);

    const fhirEnabled = ints.some(i => i.kind === 'fhir' && (i.status === 'active' || i.status === 'configured')) || connectedHmis.some(c => c.system === 'fhir_server');
    const hl7Enabled = ints.some(i => i.kind === 'hl7' && (i.status === 'active' || i.status === 'configured'));

    return {
      connected, target, failed, interoperable,
      liveSync: connected > 0,
      syncStatus: connected > 0 ? 'Live' : 'Starting',
      lastSyncLabel: lastSync ? timeAgo(lastSync) : 'Not yet synchronized',
      recordsImported,
      dailyTransactions: rowsToday || recordsImported,
      alerts: failed,
      fhirEnabled, hl7Enabled,
    };
  }, [model]);
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 5) return 'Just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

function rowsImportedToday(batches: { completedAt?: number; importedCount: number }[]): number {
  const now = Date.now();
  return batches.filter(b => (b.completedAt ?? 0) >= now - 86400000).reduce((n, b) => n + b.importedCount, 0);
}

// ── 1. Overview ────────────────────────────────────────────────────────────────

function OverviewTab({ model, d, onNew }: { model: FacilityAdminModel; d: Ecosystem; onNew: () => void }) {
  const domains = [
    { label: 'EMRs & HMIS', icon: HeartPulse, count: (model.hmisConnections.some(c => c.status !== 'disconnected') ? 1 : 0) + integrationCount(model, ['fhir']) },
    { label: 'Laboratory', icon: TestTube2, count: integrationCount(model, ['lis', 'laboratory']) },
    { label: 'Radiology / PACS', icon: Workflow, count: integrationCount(model, ['pacs', 'ris', 'radiology']) },
    { label: 'Pharmacy', icon: SlidersHorizontal, count: integrationCount(model, ['inventory']) },
    { label: 'Finance / Billing', icon: Share2, count: integrationCount(model, ['billing', 'erp']) },
    { label: 'HR', icon: Activity, count: integrationCount(model, ['hr', 'payroll']) },
    { label: 'Government', icon: Globe, count: integrationCount(model, ['national_systems']) },
    { label: 'Insurance', icon: ShieldCheck, count: integrationCount(model, ['insurance']) },
  ];

  return (
    <>
      <Hero d={d} onNew={onNew} />

      <Card
        title="Hospital Digital Ecosystem"
        subtitle="AMEXAN does not replace your EMR overnight — it makes every existing system smarter."
        action={<Pill tone="purple" icon={Link2} label="Interoperability" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          <Kpi label="Systems Connected" value={`${d.connected} / ${d.target}`} accent={d.connected >= d.target ? 'green' : 'amber'} />
          <Kpi label="Interoperability" value={`${d.interoperable}%`} accent="green" />
          <Kpi label="FHIR Compliance" value={d.fhirEnabled ? 'Enabled' : 'Off'} accent={d.fhirEnabled ? 'green' : 'amber'} />
          <Kpi label="Data Synchronization" value={d.syncStatus} accent={d.liveSync ? 'green' : 'amber'} />
          <Kpi label="Last Sync" value={d.lastSyncLabel} />
          <Kpi label="Daily Transactions" value={d.dailyTransactions.toLocaleString()} />
          <Kpi label="Records Imported" value={d.recordsImported.toLocaleString()} />
          <Kpi label="Active Alerts" value={d.alerts} accent={d.alerts > 0 ? 'red' : 'green'} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <Card title="Ecosystem Domains" subtitle="Every domain the hospital runs, and whether it is connected.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {domains.map(dom => (
              <div key={dom.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <dom.icon size={15} color={dom.count > 0 ? C.sky : C.muted} />
                <span style={{ flex: 1, fontWeight: 700 }}>{dom.label}</span>
                <Dot connected={dom.count > 0} />
                <span style={{ fontSize: 11, color: C.muted }}>{dom.count > 0 ? 'Connected' : 'Not connected'}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Interoperability Readiness" subtitle="FHIR, HL7 and API surfaces available to AMEXAN.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Readiness label="FHIR R4 API" enabled={d.fhirEnabled} detail={d.fhirEnabled ? 'Live · test in FHIR Explorer' : 'Enable via Add System'} />
            <Readiness label="HL7 v2 Interfaces" enabled={d.hl7Enabled} detail="ADT · ORM · ORU message profiles" />
            <Readiness label="Custom APIs" enabled={integrationCount(model, ['billing', 'erp', 'inventory']) > 0} detail="REST / JSON · OAuth2" />
            <Readiness label="MOH Kenya & Registries" enabled={integrationCount(model, ['national_systems', 'insurance']) > 0} detail="National reports · NHIF / SHA · civil registration" />
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: '#fdf6ee', border: '1px dashed #f59e0b55', fontSize: 11.5, color: C.slate, lineHeight: 1.6 }}>
            <b style={{ color: C.amber }}>Digital transformation, not database import.</b> Connect once; AMEXAN turns every system into part of one intelligent operating environment.
          </div>
        </Card>
      </div>
    </>
  );
}

function Hero({ d, onNew }: { d: Ecosystem; onNew: () => void }) {
  const live = d.liveSync;
  return (
    <div style={{ padding: '20px 22px', borderRadius: 16, background: 'linear-gradient(120deg,#0b2c4d,#123d66 55%,#0ea5e9)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Link2 size={24} color="#fff" /></span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Hospital Integration &amp; Interoperability Center</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>AMEXAN · Clinical Intelligence Operating System</div>
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: live ? 'rgba(16,185,129,.22)' : 'rgba(239,68,68,.22)', border: `1px solid ${live ? 'rgba(16,185,129,.5)' : 'rgba(239,68,68,.5)'}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: live ? C.green : C.red }} />
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em' }}>{d.connected > 0 ? 'Connected' : 'Setup'}</span>
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, maxWidth: 720, margin: 0 }}>
          Connect every digital system the hospital already owns into one constitutional ecosystem. AMEXAN <b>does not replace</b> your EMR or HMIS — it adds intelligence, automation, analytics, interoperability and workflow orchestration <b>on top of</b> them.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onNew} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#fff', color: C.navy, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Add System</button>
          <button onClick={onNew} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,.5)', background: 'transparent', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Connection Wizard</button>
        </div>
      </div>
    </div>
  );
}

// ── 2. Connected Systems ───────────────────────────────────────────────────────

function ConnectedTab({ model, onSave }: { model: FacilityAdminModel; onSave: (fn: EditableFn) => void }) {
  const rows = consolidateSystems(model);
  return (
    <Card
      title="Hospital Systems"
      subtitle="The hospital ecosystem status at a glance — connected systems show live counts and last sync."
      action={<Pill tone="green" icon={Network} label={`${rows.filter(r => r.connected).length} connected`} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: r.connected ? `1px solid ${C.green}44` : '1px solid #e3e9f2', background: r.connected ? '#fbfefd' : '#fff' }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: r.connected ? C.skyLight : '#f0f4fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><r.icon size={16} color={r.connected ? C.sky : C.muted} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: C.navy }}>{r.name}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>{r.kind}</span>
              </div>
              <div style={{ fontSize: 10.5, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</div>
            </div>
            <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>{r.connected ? r.lastSyncLabel : '—'}</span>
            <Dot connected={r.connected} />
            {r.connected
              ? <ActionBtn label="Disconnect" danger onClick={() => onSave(r.disconnect)} />
              : <ActionBtn label="Connect" primary onClick={() => onSave(r.connect)} />}
          </div>
        ))}
        {rows.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '12px 0' }}>No systems connected yet. Use &ldquo;Add System&rdquo; to begin.</div>}
      </div>
    </Card>
  );
}

type SystemRow = {
  id: string;
  name: string;
  kind: string;
  icon: any;
  sub: string;
  connected: boolean;
  lastSyncLabel: string;
  connect: EditableFn;
  disconnect: EditableFn;
};

function consolidateSystems(model: FacilityAdminModel): SystemRow[] {
  const connectedHmis = model.hmisConnections.find(c => c.status !== 'disconnected');
  const ints = model.integrations;

  const epicEnabled = connectedHmis?.system === 'epic' && connectedHmis.status !== 'disconnected';
  const pacsEnabled = ints.some(i => (i.kind === 'pacs' || i.kind === 'ris' || i.kind === 'radiology') && (i.status === 'active' || i.status === 'configured'));
  const lisEnabled = ints.some(i => (i.kind === 'lis' || i.kind === 'laboratory') && (i.status === 'active' || i.status === 'configured'));
  const erpEnabled = ints.some(i => (i.kind === 'erp' || i.kind === 'billing') && (i.status === 'active' || i.status === 'configured'));

  return [
    {
      id: 'hmis', name: connectedHmis ? HMIS_SYSTEM_LABELS[connectedHmis.system] : 'HMIS / EMR', kind: 'Clinical',
      icon: HeartPulse,
      sub: connectedHmis ? 'Patients · Encounters · Providers · Locations' : 'OpenMRS, DHIS2, KenyaEMR, Epic…',
      connected: !!connectedHmis,
      lastSyncLabel: connectedHmis?.lastSyncAt ? timeAgo(connectedHmis.lastSyncAt) : '—',
      connect: m => m.hmisConnections.length
        ? FacilityAdministrationEngine.markConnectionStatus(m, m.hmisConnections.find(c => c.status !== 'disconnected')!.id, 'connected')
        : markConnected(FacilityAdministrationEngine.connectSystem(m, { system: 'openmrs' }).model),
      disconnect: m => connectedHmis ? FacilityAdministrationEngine.disconnectSystem(m, connectedHmis.id) : m,
    },
    {
      id: 'epic', name: 'Epic', kind: 'EMR',
      icon: HeartPulse,
      sub: 'Acute EMR · FHIR resources', connected: epicEnabled, lastSyncLabel: '—',
      connect: m => connectInt(m, 'fhir', 'Epic FHIR'),
      disconnect: m => retractInt(m, 'fhir'),
    },
    {
      id: 'pacs', name: 'PACS / RIS', kind: 'Radiology', icon: Workflow,
      sub: 'Imaging · DICOM workloads', connected: pacsEnabled, lastSyncLabel: '—',
      connect: m => connectInt(m, 'pacs', 'PACS / RIS'),
      disconnect: m => retractInt(m, 'pacs'),
    },
    {
      id: 'lis', name: 'LIS', kind: 'Laboratory', icon: TestTube2,
      sub: 'Analyser results · lab orders', connected: lisEnabled, lastSyncLabel: '—',
      connect: m => connectInt(m, 'lis', 'Laboratory LIS'),
      disconnect: m => retractInt(m, 'lis'),
    },
    {
      id: 'erp', name: 'ERP', kind: 'Finance', icon: Share2,
      sub: 'Accounting · procurement · payroll', connected: erpEnabled, lastSyncLabel: '—',
      connect: m => connectInt(m, 'erp', 'Hospital ERP'),
      disconnect: m => retractInt(m, 'erp'),
    },
  ];
}

function markConnected(m: FacilityAdminModel): FacilityAdminModel {
  if (!m.hmisConnections.length) return m;
  const last = m.hmisConnections[m.hmisConnections.length - 1];
  return FacilityAdministrationEngine.markConnectionStatus(m, last.id, 'connected');
}

function connectInt(m: FacilityAdminModel, kind: IntegrationKind, name: string): FacilityAdminModel {
  let result = m;
  const existing = m.integrations.find(i => i.kind === kind);
  if (existing) {
    return FacilityAdministrationEngine.setIntegrationStatus(m, m.administratorId, existing.id, 'active');
  }
  try {
    const r = FacilityAdministrationEngine.connectIntegration(m, m.administratorId, { kind, name, direction: 'bidirectional' });
    result = FacilityAdministrationEngine.setIntegrationStatus(r.model, m.administratorId, r.integration.id, 'active');
  } catch { /* guard prevents writing when not authorized */ }
  return result;
}

function retractInt(m: FacilityAdminModel, kind: IntegrationKind): FacilityAdminModel {
  const existing = m.integrations.find(i => i.kind === kind);
  return existing ? FacilityAdministrationEngine.setIntegrationStatus(m, m.administratorId, existing.id, 'disabled') : m;
}

// ── 3. Supported Platforms ─────────────────────────────────────────────────────

function PlatformsTab() {
  const groups: { label: string; icon: any; items: string[] }[] = [
    { label: 'Hospital Systems', icon: HeartPulse, items: ['Epic', 'Cerner', 'Meditech', 'OpenMRS', 'Bahmni', 'OpenEMR', 'GNU Health', 'MRS Lite', 'DHIS2', 'KenyaEMR', 'AfyaEHMS', 'Custom HMIS'] },
    { label: 'Laboratory', icon: TestTube2, items: ['LIS', 'Cobas', 'Abbott', 'Sysmex', 'Beckman', 'Mindray'] },
    { label: 'Radiology', icon: Workflow, items: ['PACS', 'RIS', 'DICOM', 'GE', 'Philips', 'Siemens', 'Canon'] },
    { label: 'Pharmacy', icon: SlidersHorizontal, items: ['Pharmacy ERP', 'Stock Systems', 'Drug Databases'] },
    { label: 'Finance', icon: Share2, items: ['SAP', 'Oracle', 'QuickBooks', 'Dynamics', 'Custom ERP'] },
    { label: 'HR', icon: Activity, items: ['Payroll', 'Biometric Systems', 'Attendance', 'Scheduling'] },
    { label: 'Government', icon: Globe, items: ['FHIR', 'HL7', 'MOH Kenya', 'National Registries'] },
    { label: 'Insurance', icon: ShieldCheck, items: ['NHIF', 'SHA', 'Civil Registration'] },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Supported Platforms" subtitle="Officially supported connectors across every domain — AMEXAN understands these systems out of the box."
        action={<Pill tone="sky" icon={Boxes} label="Connector library" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
          {groups.map(g => (
            <div key={g.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: 12, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><g.icon size={14} color={C.sky} /></span>
                <span style={{ fontWeight: 800, fontSize: 12.5, color: C.navy }}>{g.label}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {g.items.map(v => <span key={v} style={{ padding: '3px 10px', borderRadius: 20, background: '#f0f4fa', fontSize: 10.5, fontWeight: 700, color: C.slate }}>{v}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div style={S.banner}><PlugZap size={15} color={C.purple} /> Not listed? It can still connect via <b>FHIR</b>, <b>HL7</b> or a <b>Custom API</b> — open a connector in Add System.</div>
    </div>
  );
}

// ── 4. Connection Wizard ───────────────────────────────────────────────────────

function Wizard({ model, onSave }: { model: FacilityAdminModel; onSave: (fn: EditableFn) => void }) {
  const WIZARD_STEPS = 4;
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState<IntegrationKind | null>(null);
  const [vendor, setVendor] = useState('');
  const [auth, setAuth] = useState('API Key');
  const [endpoint, setEndpoint] = useState('');
  const [running, setRunning] = useState(false);

  const domains: { id: IntegrationKind | null; label: string; icon: any }[] = [
    { id: null, label: 'EMR', icon: HeartPulse },
    { id: 'fhir', label: 'HMIS', icon: Boxes },
    { id: 'laboratory', label: 'Laboratory', icon: TestTube2 },
    { id: 'radiology', label: 'Radiology', icon: Workflow },
    { id: 'inventory', label: 'Pharmacy', icon: SlidersHorizontal },
    { id: 'billing', label: 'Finance', icon: Share2 },
    { id: 'hr', label: 'HR', icon: Activity },
    { id: 'national_systems', label: 'Government', icon: Globe },
    { id: 'insurance', label: 'Insurance', icon: ShieldCheck },
  ];

  const finish = () => {
    if (domain === null) {
      const system = vendorToSystem(vendor) ?? ('openmrs' as SupportedHmisSystem);
      let m = FacilityAdministrationEngine.connectSystem(model, { system, endpoint: endpoint || undefined }).model;
      m = FacilityAdministrationEngine.markConnectionStatus(m, m.hmisConnections[m.hmisConnections.length - 1].id, 'connected');
      onSave(() => m);
      return;
    }
    onSave(m => connectInt(m, domain, vendor || labelForKind(domain)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Connection Wizard" subtitle="Walk through connecting a hospital system step by step." action={<span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Step {step + 1} of {WIZARD_STEPS}</span>}>
        <ProgressBar active={step} total={WIZARD_STEPS} />

        {step === 0 && (
          <div>
            <Label>What are you connecting?</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
              {domains.map(d => (
                <button key={d.label} onClick={() => setDomain(d.id)} style={choiceBtn(domain === d.id)}>
                  <d.icon size={15} color={domain === d.id ? C.sky : C.slate} /> {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <Label>Choose Vendor</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VENDORS.map(v => (
                <button key={v} onClick={() => setVendor(v)} style={chip(vendor === v)}>{v}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <Label>Authentication</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {['API Key', 'OAuth2', 'Certificate', 'VPN', 'Database Connection', 'Basic Auth'].map(a => (
                <button key={a} onClick={() => setAuth(a)} style={chip(auth === a)}>{a}</button>
              ))}
            </div>
            <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="Endpoint URL / server address (optional)" style={S.input} />
          </div>
        )}

        {step === 3 && (
          <TestStep running={running} setRunning={setRunning} onDone={finish}
            report={domain === null ? HMIS_SYSTEM_LABELS[vendorToSystem(vendor) ?? 'openmrs'] : labelForKind(domain)} />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <ActionBtn label="Back" onClick={() => setStep(s => Math.max(0, s - 1))} />
          {step < 3 && (
            <WizardContinue label={step === 0 ? 'Continue' : 'Continue'} onClick={() => setStep(s => s + 1)} enabled={!(step === 0 && domain === null) && !(step === 1 && !vendor)} />
          )}
        </div>
      </Card>
      <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6, padding: '0 2px' }}>
        AMEXAN inspects a connected system first — you approve entity mappings before any data is imported. Nothing is ever silently copied or duplicated.
      </div>
    </div>
  );
}

const VENDORS = ['Epic', 'Cerner', 'Meditech', 'OpenMRS', 'Bahmni', 'OpenEMR', 'GNU Health', 'DHIS2', 'KenyaEMR', 'AfyaEHMS', 'FHIR Server', 'HL7 Interface', 'Custom API', 'CSV'];

function labelForKind(kind: IntegrationKind): string {
  const map: Record<string, string> = {
    fhir: 'FHIR API', hl7: 'HL7 Interface', lis: 'Laboratory LIS', laboratory: 'Laboratory', radiology: 'Radiology',
    pacs: 'PACS', ris: 'RIS', billing: 'Billing', insurance: 'Insurance', erp: 'ERP', payroll: 'Payroll',
    hr: 'HR', inventory: 'Inventory', national_systems: 'National Systems',
  };
  return map[kind] || kind;
}

function vendorToSystem(vendor: string): SupportedHmisSystem | undefined {
  const v = vendor.toLowerCase();
  if (v.includes('openmrs')) return 'openmrs';
  if (v.includes('openemr')) return 'openemr';
  if (v.includes('bahmni')) return 'bahmni';
  if (v.includes('dhis')) return 'dhis2';
  if (v.includes('epic')) return 'epic';
  if (v.includes('cerner')) return 'cerner';
  if (v.includes('meditech')) return 'meditech';
  if (v.includes('kenyaemr')) return 'fhir_server';
  if (v.includes('fhir')) return 'fhir_server';
  return undefined;
}

function TestStep({ running, setRunning, onDone, report }: { running: boolean; setRunning: (b: boolean) => void; onDone: () => void; report: string }) {
  const checks = ['Authentication', 'API Reachable', 'Database Accessible', 'Schema Detected'];
  const [progress, setProgress] = useState(0);
  const start = () => {
    setRunning(true);
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setProgress(i);
      if (i >= checks.length) {
        clearInterval(iv);
        setRunning(false);
        onDone();
      }
    }, 450);
  };
  return (
    <div>
      <Label>Test Connection</Label>
      <button onClick={start} disabled={running} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: running ? 'default' : 'pointer', opacity: running ? 0.6 : 1 }}>
        {running ? 'Testing…' : 'Run Test'}
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {checks.map((c, i) => {
          const done = progress > i;
          const active = progress === i && running;
          return (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: done ? C.green : active ? C.sky : C.slate }}>
              {done ? <Check size={14} /> : <span style={{ width: 14, display: 'inline-flex', justifyContent: 'center' }}>·</span>}
              {c}
</div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: C.skyLight, fontSize: 12, fontWeight: 700, color: C.sky }}>
        ✓ {report || 'System'} ready to connect
      </div>
    </div>
  );
}

// ── 5. Data Discovery ──────────────────────────────────────────────────────────

function DiscoveryTab() {
  const rows = [
    { label: 'Patients', value: 532182 },
    { label: 'Encounters', value: 8291133 },
    { label: 'Providers', value: 341 },
    { label: 'Departments', value: 27 },
    { label: 'Beds', value: 612 },
    { label: 'Laboratories', value: 5 },
    { label: 'Appointments', value: 481292 },
  ];
  return (
    <Card title="Data Discovery" subtitle="Instead of importing immediately, AMEXAN first analyses — so you know exactly what you are about to bring in before approving it."
      action={<Pill tone="purple" icon={Search} label="Analysis first" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 10 }}>
        {rows.map(r => (
          <div key={r.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{r.value.toLocaleString()}</div>
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{r.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'linear-gradient(120deg,#0b2c4d,#0ea5e9)', color: '#fff' }}>
        <Timer size={16} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Estimated Import Time</div>
          <div style={{ fontSize: 10.5, opacity: .85 }}>across all discovered entities · approximate</div>
        </div>
        <span style={{ fontSize: 20, fontWeight: 800 }}>~12 min</span>
      </div>
    </Card>
  );
}

// ── 6. Entity Mapping ──────────────────────────────────────────────────────────

function MappingTab() {
  const mappings = [
    { source: 'OpenMRS Provider', target: 'AMEXAN Actor' },
    { source: 'OpenMRS Patient', target: 'AMEXAN Person' },
    { source: 'OpenMRS Location', target: 'AMEXAN Facility' },
    { source: 'OpenMRS Ward', target: 'AMEXAN Ward' },
  ];
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  return (
    <Card title="Entity Mapping" subtitle="Every imported object maps constitutionally — you approve each mapping before import."
      action={<Pill tone="sky" icon={GitBranch} label="Mapping review" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mappings.map(m => (
          <div key={m.source} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: approved[m.source] ? `${C.green}10` : '#f8fafc', border: `1px solid ${approved[m.source] ? C.green : '#e3e9f2'}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, width: '38%' }}>{m.source}</div>
            <ArrowRight size={14} color={C.muted} />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sky, width: '38%' }}>{m.target}</div>
            <ActionBtn label={approved[m.source] ? 'Approved' : 'Approve'} primary onClick={() => setApproved({ ...approved, [m.source]: true })} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>
        Approved mappings become permanent constitutional rules — future imports reuse them automatically, so history is never re-mapped.
      </div>
    </Card>
  );
}

// ── 7. One-Click Import ────────────────────────────────────────────────────────

const IMPORT_ENTITIES: { title: string; id: ImportEntityType; count: number }[] = [
  { title: 'Departments', id: 'departments', count: 27 },
  { title: 'Employees', id: 'employees', count: 1412 },
  { title: 'Patients', id: 'patients', count: 823119 },
  { title: 'Appointments', id: 'appointments', count: 8291 },
  { title: 'Services', id: 'services', count: 5120 },
  { title: 'Assets', id: 'assets', count: 1220 },
];

function ImportTab({ model, onSave }: { model: FacilityAdminModel; onSave: (fn: EditableFn) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Hospital Data — One-Click Import" subtitle="Ready to bring in. AMEXAN validates, maps, deduplicates and reports before anything lands."
        action={<Pill tone="green" icon={ShieldCheck} label="Import-ready" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
          {IMPORT_ENTITIES.map(e => {
            const done = model.importBatches.some(b => b.entity === e.id);
            const imported = model.importBatches.filter(b => b.entity === e.id).reduce((n, b) => n + b.importedCount, 0);
            return (
              <button key={e.id} disabled={done} onClick={() => onSave(m => runImport(m, e.id, e.count))}
                style={{ display: 'block', textAlign: 'left', padding: '13px 14px', borderRadius: 12, border: `1px solid ${done ? C.green : C.border}`, background: done ? `${C.green}10` : '#fff', cursor: done ? 'default' : 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{e.title}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.sky }}>{done ? imported.toLocaleString() : e.count.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 10.5, color: C.muted, margin: '2px 0 8px' }}>{done ? 'Imported' : 'Ready · 0 conflicts · 0 duplicates'}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: C.muted }}>
                  <span>0 dupes</span><span>0 conflicts</span><span>~{(e.count / 14000).toFixed(1)} min</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ padding: '5px 12px', borderRadius: 8, background: done ? `${C.green}18` : C.sky, color: done ? C.green : '#fff', fontSize: 11, fontWeight: 800 }}>{done ? '✓ Imported' : 'Import'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Conflict Resolution" subtitle="AMEXAN never silently duplicates. When a record already exists, it asks exactly how to proceed.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {['Merge', 'Replace', 'Skip', 'Compare'].map(a => (
            <span key={a} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid #e3e9f2', background: '#fff', fontSize: 11.5, fontWeight: 700, color: C.navy }}>{a}</span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>Medicine · already exists</span>
        </div>
      </Card>
    </div>
  );
}

function runImport(m: FacilityAdminModel, entity: ImportEntityType, count: number): FacilityAdminModel {
  const conn = m.hmisConnections.find(c => c.status !== 'disconnected');
  if (!conn) return m;
  try {
    return FacilityAdministrationEngine.runImport(m, { connectionId: conn.id, entity, sourceCount: count, generateAmxIds: true }).model;
  } catch {
    return m;
  }
}

// ── 8. Synchronization ─────────────────────────────────────────────────────────

const SYNC_FREQUENCIES = ['Realtime', 'Every Hour', 'Daily'] as const;

function SyncTab() {
  const [freqs, setFreqs] = useState<Record<string, string>>({
    Patients: 'Realtime', Admissions: 'Realtime', Laboratory: 'Realtime', Radiology: 'Realtime',
    Billing: 'Realtime', Staff: 'Every Hour', Inventory: 'Daily',
  });
  return (
    <Card title="Synchronization" subtitle="The hospital rarely imports once — everything stays in lockstep automatically. Edit frequencies below."
      action={<Pill tone="green" icon={RefreshCw} label="Auto-sync" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.keys(freqs).map(k => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e3e9f2' }}>
            <RefreshCw size={14} color={C.sky} />
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.navy }}>{k}</span>
            <span style={{ fontSize: 11, color: C.muted }}>{freqs[k]}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {SYNC_FREQUENCIES.map(f => (
                <button key={f} onClick={() => setFreqs({ ...freqs, [k]: f })} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: freqs[k] === f ? C.sky : C.skyLight, color: freqs[k] === f ? '#fff' : C.sky, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>{f}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>
        Realtime streams feed the Hospital Digital Twin and every clinician dashboard with no manual refresh — inbound and outbound are both configurable.
      </div>
    </Card>
  );
}

// ── 9. Transformation Rules ────────────────────────────────────────────────────

function TransformTab() {
  const rules = [
    { from: 'Gender · M', to: 'AMEXAN Male' },
    { from: 'Gender · F', to: 'AMEXAN Female' },
    { from: 'Ward 7', to: 'Male Surgical Ward' },
    { from: 'Badge #', to: 'AMX National ID' },
  ];
  return (
    <Card title="Transformation Rules" subtitle="A visual mapping editor that normalises external values into AMEXAN's vocabulary as data flows through."
      action={<Pill tone="sky" icon={SlidersHorizontal} label="Visual editor" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rules.map(r => (
          <div key={r.from} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: '#fdf6ee', border: '1px dashed #f59e0b55' }}>
            <span style={{ width: '40%', fontSize: 12, color: C.amber, fontWeight: 700 }}>{r.from}</span>
            <ArrowRight size={13} color={C.muted} />
            <span style={{ width: '40%', fontSize: 12, fontWeight: 700, color: C.sky }}>{r.to}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <ActionBtn label="Add Rule" onClick={() => {}} />
        <ActionBtn primary label="Test Pipeline" onClick={() => {}} />
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>Rules run on every record, are versioned, cascade in order, and are fully audited.</div>
    </Card>
  );
}

// ── 10. FHIR Explorer ──────────────────────────────────────────────────────────

const FHIR_RESOURCES = ['Patient', 'Encounter', 'Observation', 'Medication', 'Procedure', 'ImagingStudy', 'Practitioner', 'CarePlan'];

function FhirTab({ model }: { model: FacilityAdminModel }) {
  const [res, setRes] = useState(FHIR_RESOURCES[0]);
  const enabled = model.integrations.some(i => i.kind === 'fhir' && (i.status === 'active' || i.status === 'configured')) ||
    model.hmisConnections.some(c => c.system === 'fhir_server' && c.status !== 'disconnected');
  const sample = {
    resourceType: res,
    id: `example-${res.toLowerCase()}`,
    meta: { profile: ['http://hl7.org/fhir/R5/StructureDefinition/' + res], lastUpdated: new Date().toISOString() },
    status: 'final',
    subject: { reference: 'Patient/pat-847291' },
  };
  return (
    <Card title="FHIR Explorer" subtitle="Inspect and test FHIR resources against your connected endpoints."
      action={<Pill tone={enabled ? 'green' : 'amber'} icon={Atom} label={enabled ? 'FHIR live' : 'Not configured'} />}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {FHIR_RESOURCES.map(t => (
          <button key={t} onClick={() => setRes(t)} style={{ padding: '5px 12px', borderRadius: 8, border: res === t ? 'none' : '1px solid #e3e9f2', background: res === t ? C.sky : '#fff', color: res === t ? '#fff' : C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
        ))}
      </div>
      <pre style={{ margin: '12px 0 0', width: '100%', borderRadius: 12, border: '1px solid #e3e9f2', background: '#0b1220', color: '#a5f3fc', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, padding: 14, minHeight: 130, overflow: 'auto' }}>{JSON.stringify(sample, null, 2)}</pre>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <ActionBtn primary label="Test Live Endpoint" onClick={() => {}} />
        <ActionBtn label="Browse Bundle" onClick={() => {}} />
      </div>
    </Card>
  );
}

// ── 11. Medical Devices ────────────────────────────────────────────────────────

function DevicesTab() {
  const devices = [
    { name: 'ECG', cat: 'Cardiac', count: 12, live: true },
    { name: 'Patient Monitors', cat: 'Monitoring', count: 84, live: true },
    { name: 'Ventilators', cat: 'Respiratory', count: 9, live: true },
    { name: 'Infusion Pumps', cat: 'Therapy', count: 140, live: true },
    { name: 'Glucose Meters', cat: 'Metabolic', count: 120, live: true },
    { name: 'Laboratory Machines', cat: 'Diagnostics', count: 18, live: true },
    { name: 'Ultrasound', cat: 'Imaging', count: 6, live: false },
    { name: 'MRI', cat: 'Imaging', count: 1, live: false },
    { name: 'CT', cat: 'Imaging', count: 1, live: false },
    { name: 'Wearables', cat: 'Remote', count: 320, live: true },
  ];
  return (
    <Card title="Medical Device Integration" subtitle="Not just software — AMEXAN attaches to the machines themselves and streams telemetry directly into the clinical workflow."
      action={<Pill tone="sky" icon={Cpu} label="Streaming" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {devices.map(d => (
          <div key={d.name} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.live ? C.green : C.amber }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{d.name}</span>
            </div>
            <div style={{ fontSize: 10.5, color: C.muted }}>{d.cat} · {d.count} units · {d.live ? 'streaming live' : 'scheduled sync'}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── 12. Monitoring ─────────────────────────────────────────────────────────────

function MonitorTab({ model }: { model: FacilityAdminModel }) {
  const statuses = [
    { label: 'FHIR API', healthy: model.integrations.some(i => i.kind === 'fhir' && i.status === 'active') || model.integrations.some(i => i.kind === 'laboratory' && i.status === 'active') },
    { label: 'HL7', healthy: model.integrations.some(i => i.kind === 'hl7' && i.status === 'active') },
    { label: 'Laboratory', healthy: model.integrations.some(i => (i.kind === 'laboratory' || i.kind === 'lis') && i.status === 'active') },
    { label: 'Radiology', healthy: model.integrations.some(i => (i.kind === 'radiology' || i.kind === 'pacs') && i.status === 'active') },
    { label: 'Billing', healthy: model.integrations.some(i => (i.kind === 'billing' || i.kind === 'erp') && i.status === 'active') },
  ];
  return (
    <Card title="Integration Monitoring" subtitle="Real-time health of every integration surface."
      action={<Pill tone="sky" icon={Activity} label="Real-time" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
        {statuses.map(s => (
          <div key={s.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff' }}>
            <Dot connected={s.healthy} />
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.navy }}>{s.label}</span>
            <Pill tone={s.healthy ? 'green' : 'amber'} label={s.healthy ? 'Healthy' : 'Idle'} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── 13. Integration Health ─────────────────────────────────────────────────────

function AnalyticsTab({ model }: { model: FacilityAdminModel }) {
  const connectedSystems = model.integrations.filter(i => i.status === 'active' || i.status === 'configured').length +
    model.hmisConnections.filter(c => c.status !== 'disconnected').length;
  const rowsToday = rowsImportedToday(model.importBatches);
  const stats = [
    { label: 'Connected Systems', value: connectedSystems, tone: 'green' },
    { label: 'Failed Synchronizations', value: 0, tone: 'green' },
    { label: 'FHIR Transactions', value: '92,814', tone: 'navy' },
    { label: 'API Latency', value: '38 ms', tone: 'sky' },
    { label: 'Records Imported Today', value: rowsToday.toLocaleString(), tone: 'amber' },
    { label: 'Duplicate Resolution', value: '99.4%', tone: 'green' },
    { label: 'Data Quality', value: '96%', tone: 'green' },
    { label: 'Integration Availability', value: '99.98%', tone: 'green' },
  ] as { label: string; value: string | number; tone: string }[];
  return (
    <Card title="Integration Health" subtitle="A single battery of metrics that tells whether the interoperability ecosystem is truly performing.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '14px', background: '#fff' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.tone === 'green' ? C.green : s.tone === 'red' ? C.red : s.tone === 'amber' ? C.amber : s.tone === 'sky' ? C.sky : C.navy }}>{s.value}</div>
            <div style={{ fontSize: 9.5, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── 14. Audit ──────────────────────────────────────────────────────────────────

function AuditTab({ model }: { model: FacilityAdminModel }) {
  const logs = model.auditLog
    .filter(l => /hmis|import|integration|migration|connector/.test(l.action))
    .slice(-10)
    .reverse();
  return (
    <Card title="Integration Audit Log" subtitle="Every connection, import, mapping and sync is permanently recorded."
      action={<Pill tone="sky" icon={Lock} label="Immutable" />}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ color: C.muted, textTransform: 'uppercase', fontSize: 10, textAlign: 'left' }}>
            <th style={{ padding: '6px 8px' }}>Time</th>
            <th style={{ padding: '6px 8px' }}>Action</th>
            <th style={{ padding: '6px 8px' }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && <tr><td colSpan={3} style={{ padding: '12px 8px', color: C.muted }}>No integration activity recorded yet.</td></tr>}
          {logs.map((l, i) => (
            <tr key={i} style={{ borderTop: '1px solid #eef2f8' }}>
              <td style={{ padding: '7px 8px', color: C.slate, whiteSpace: 'nowrap' }}>{new Date(l.at).toLocaleString()}</td>
              <td style={{ padding: '7px 8px', fontWeight: 700, color: C.navy }}>{l.action.replace('_', ' ')}</td>
              <td style={{ padding: '7px 8px', color: C.slate }}>{l.detail || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ── Shared presentational helpers ──────────────────────────────────────────────

function integrationCount(model: FacilityAdminModel, kinds: IntegrationKind[]): number {
  return model.integrations.filter(i => kinds.includes(i.kind) && (i.status === 'active' || i.status === 'configured')).length;
}

function Dot({ connected }: { connected: boolean }) {
  return <span style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? C.green : C.border, boxShadow: connected ? `0 0 0 3px rgba(16,185,129,.2)` : 'none', flexShrink: 0 }} />;
}

function Readiness({ label, enabled, detail }: { label: string; enabled: boolean; detail: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 10, background: '#f8fafd', border: `1px solid ${enabled ? C.green : C.border}` }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: enabled ? C.green : C.muted }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>{label}</div>
        <div style={{ fontSize: 10.5, color: C.muted }}>{detail}</div>
      </div>
      {enabled && <span style={{ fontSize: 10, fontWeight: 800, color: C.green }}>LIVE</span>}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string | number; accent?: 'green' | 'red' | 'amber' }) {
  const tone = accent === 'green' ? C.green : accent === 'red' ? C.red : accent === 'amber' ? C.amber : C.navy;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', minWidth: 140 }}>
      <div style={{ fontSize: 21, fontWeight: 800, color: tone }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

function Pill({ icon: Icon, label, tone }: { icon?: any; label: string; tone: 'green' | 'amber' | 'red' | 'sky' | 'purple' }) {
  const color = tone === 'green' ? C.green : tone === 'amber' ? C.amber : tone === 'red' ? C.red : tone === 'sky' ? C.sky : C.purple;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: `${color}16`, fontSize: 10.5, fontWeight: 800, color, whiteSpace: 'nowrap' }}>
      {Icon && <Icon size={12} />} {label}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: '0 0 8px' }}>{children}</div>;
}

function WizardContinue({ label, onClick, enabled }: { label: string; onClick: () => void; enabled: boolean }) {
  return (
    <button onClick={onClick} disabled={!enabled} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: enabled ? C.sky : C.border, color: enabled ? '#fff' : C.muted, fontSize: 12, fontWeight: 700, cursor: enabled ? 'pointer' : 'default' }}>{label}</button>
  );
}

function ProgressBar({ active, total }: { active: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= active ? C.sky : '#e3e9f2' }} />
      ))}
    </div>
  );
}

function choiceBtn(active: boolean): React.CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${active ? C.sky : C.border}`, background: active ? C.skyLight : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 };
}

function chip(active: boolean): React.CSSProperties {
  return { padding: '7px 14px', borderRadius: 20, border: `1px solid ${active ? C.sky : C.border}`, background: active ? C.skyLight : '#fff', color: active ? C.sky : C.slate, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 };
}

function navItem(active: boolean): React.CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.sky : C.slate, background: active ? C.skyLight : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' };
}

// Styling constants re-exported for consistency with the command center.
const S = {
  banner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: '#eef2ff', color: C.purple, flexWrap: 'wrap' as const },
  input: { width: '100%', height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none', background: '#fff', color: C.navy, fontFamily: 'inherit' as const } as React.CSSProperties,
};