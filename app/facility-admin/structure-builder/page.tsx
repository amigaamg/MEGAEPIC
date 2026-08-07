'use client';

// AMEXAN — Hospital Structure Builder (Engine III, Master Architectural Engine)
// The digital blueprint of the institution. Nothing else exists before this.
// Every patient, doctor, bed, laboratory, theatre and dashboard is generated from
// this constitutional hierarchy. Three-pane builder, creation wizards, templates,
// digital twin, dependency graph, organization health, executive visualizations
// and expansion planning.

import { useState } from 'react';
import {
  LayoutDashboard, ListTree, Building2, Boxes, HeartPulse, Stethoscope, BedDouble,
  FlaskConical, Radiation, Pill, Truck, MapPin, ClipboardList, Network,
  Search, Plus, X, CheckCircle, ChevronRight, ChevronDown, Sparkles, Layers, Eye,
  Download, Map, FileText,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, Sankey, Treemap,
} from 'recharts';
import WorkspaceGuard from '@/components/workspace/WorkspaceGuard';

const SupportedRoles = ['executive'] as const;

const C = {
  bg: '#eff4fa', card: '#ffffff', border: '#e3e9f2',
  navy: '#0b2c4d', slate: '#5b6b80', muted: '#8a98ac',
  sky: '#0ea5e9', skyLight: '#e0f2fe',
  green: '#10b981', red: '#ef4444', amber: '#f59e0b', purple: '#8b5cf6', indigo: '#6366f1',
};

type Status = 'operational' | 'planned' | 'maintenance' | 'fault' | 'cleaning' | 'closed';
type Kind =
  | 'building' | 'floor' | 'department' | 'unit' | 'ward' | 'clinic' | 'theatre'
  | 'lab' | 'radiology' | 'pharmacy' | 'store' | 'room' | 'bed' | 'vehicle' | 'satellite';

type SNode = {
  id: string; name: string; kind: Kind; status: Status;
  capacity?: number; meta?: string; icon?: string; children?: SNode[];
};

const STATUS_TONE: Record<Status, { color: string; label: string }> = {
  operational: { color: C.green, label: 'Operational' },
  planned: { color: C.sky, label: 'Planned' },
  maintenance: { color: C.amber, label: 'Maintenance' },
  fault: { color: C.red, label: 'Fault' },
  cleaning: { color: '#94a3b8', label: 'Cleaning' },
  closed: { color: C.muted, label: 'Closed' },
};

const KIND_META: Record<Kind, { icon: string; accent: string }> = {
  building: { icon: '🏢', accent: C.indigo },
  floor: { icon: '🏗️', accent: C.sky },
  department: { icon: '🏥', accent: C.sky },
  unit: { icon: '🩺', accent: C.purple },
  ward: { icon: '🛏️', accent: C.sky },
  clinic: { icon: '🩹', accent: C.green },
  theatre: { icon: '🏥', accent: C.indigo },
  lab: { icon: '🔬', accent: C.purple },
  radiology: { icon: '📷', accent: C.indigo },
  pharmacy: { icon: '💊', accent: C.amber },
  store: { icon: '📦', accent: C.slate },
  room: { icon: '🚪', accent: C.muted },
  bed: { icon: '🛏️', accent: C.green },
  vehicle: { icon: '🚐', accent: C.slate },
  satellite: { icon: '🏛️', accent: C.green },
};

// ── Master architectural tree ──────────────────────────────────────────────
const STRUCTURE: SNode[] = [
  {
    id: 'hos-1', name: 'AMEXAN Medical Centre', kind: 'building', status: 'operational', icon: '🏥',
    children: [
      {
        id: 'bld-clinical', name: 'Clinical Block', kind: 'building', status: 'operational', meta: '8 floors',
        children: [
          { id: 'dept-medicine', name: 'Medicine', kind: 'department', status: 'operational', meta: 'Head: Dr John · 8 clinics · 124 beds', children: [
            { id: 'ward-med-1', name: 'General Medicine Ward 1', kind: 'ward', status: 'operational', capacity: 40, meta: 'Mixed · 6 isolation · 4 HDU', children: [
              { id: 'room-med-3', name: 'Room 03', kind: 'room', status: 'operational', children: [
                { id: 'bed-med-4', name: 'MED-W01-R03-B04', kind: 'bed', status: 'operational' },
                { id: 'bed-med-5', name: 'MED-W01-R03-B05', kind: 'bed', status: 'fault' },
              ] },
            ] },
            { id: 'unit-cardio', name: 'Cardiology', kind: 'unit', status: 'operational', meta: '6 consult · 2 echo · 4 ECG' },
          ] },
          { id: 'dept-surgery', name: 'Surgery', kind: 'department', status: 'operational', meta: 'Head: Dr Auma', children: [
            { id: 'unit-recovery', name: 'Recovery', kind: 'unit', status: 'operational' },
          ] },
          { id: 'dept-icu', name: 'ICU', kind: 'department', status: 'operational', meta: '47 daily users', children: [
            { id: 'unit-vent', name: 'Ventilated Beds', kind: 'unit', status: 'operational', capacity: 10 },
          ] },
          { id: 'dept-emergency', name: 'Emergency', kind: 'department', status: 'operational', meta: 'ESI Triage', children: [
            { id: 'clinic-rac', name: 'Resuscitation', kind: 'clinic', status: 'operational' },
          ] },
        ],
      },
      {
        id: 'bld-surgical', name: 'Surgical Block', kind: 'building', status: 'operational', meta: '6 theatres',
        children: [
          { id: 'theatre-1', name: 'Major Theatre 1', kind: 'theatre', status: 'operational', meta: 'Orthopedics · General Surgery' },
          { id: 'theatre-2', name: 'Major Theatre 2', kind: 'theatre', status: 'maintenance', meta: 'Neurosurgery' },
        ],
      },
      {
        id: 'bld-outpatient', name: 'Outpatient Complex', kind: 'building', status: 'operational', meta: '47 clinics',
        children: [
          { id: 'clinic-cardio', name: 'Cardiology Clinic', kind: 'clinic', status: 'operational', meta: '6 rooms · 4 ECG', capacity: 80 },
          { id: 'clinic-ortho', name: 'Orthopedics Clinic', kind: 'clinic', status: 'operational' },
        ],
      },
      {
        id: 'bld-diagnostic', name: 'Diagnostic Centre', kind: 'building', status: 'operational',
        children: [
          { id: 'lab-chem', name: 'Clinical Chemistry Lab', kind: 'lab', status: 'operational' },
          { id: 'lab-micro', name: 'Microbiology Lab', kind: 'lab', status: 'operational' },
          { id: 'lab-blood', name: 'Blood Bank', kind: 'lab', status: 'operational' },
          { id: 'rad-ct', name: 'CT Unit', kind: 'radiology', status: 'operational' },
          { id: 'rad-mri', name: 'MRI Unit', kind: 'radiology', status: 'planned' },
        ],
      },
      {
        id: 'bld-pharmacy', name: 'Pharmacy', kind: 'building', status: 'operational',
        children: [
          { id: 'pharmacy-main', name: 'Main Pharmacy', kind: 'pharmacy', status: 'operational' },
          { id: 'pharmacy-ward', name: 'Ward Pharmacy', kind: 'pharmacy', status: 'operational' },
        ],
      },
      { id: 'bld-admin', name: 'Administrative Block', kind: 'building', status: 'operational', meta: 'Finance · HR · Records' },
      { id: 'bld-research', name: 'Research Centre', kind: 'building', status: 'planned', meta: 'Expansion 2027' },
    ],
  },
  { id: 'satellite-1', name: 'Satellite Clinic — Kilimani', kind: 'satellite', status: 'operational' },
  { id: 'satellite-2', name: 'Satellite Clinic — Westlands', kind: 'satellite', status: 'planned' },
  { id: 'vehicle-1', name: 'Ambulance Fleet (7)', kind: 'vehicle', status: 'operational' },
];

const LANDING_STATS: { label: string; value: string; color: string; icon: string }[] = [
  { label: 'Buildings', value: '6', color: C.indigo, icon: '🏢' },
  { label: 'Departments', value: '34', color: C.sky, icon: '🏥' },
  { label: 'Clinical Units', value: '82', color: C.purple, icon: '🩺' },
  { label: 'Wards', value: '51', color: C.sky, icon: '🛏️' },
  { label: 'Clinics', value: '47', color: C.green, icon: '🩹' },
  { label: 'Rooms', value: '843', color: C.slate, icon: '🚪' },
  { label: 'Beds', value: '1,286', color: C.green, icon: '🛏️' },
  { label: 'Theatres', value: '14', color: C.indigo, icon: '🏥' },
  { label: 'Laboratories', value: '9', color: C.purple, icon: '🔬' },
  { label: 'Radiology Units', value: '4', color: C.indigo, icon: '📷' },
  { label: 'Pharmacies', value: '6', color: C.amber, icon: '💊' },
  { label: 'Satellite Facilities', value: '18', color: C.green, icon: '🏛️' },
];

const GROWTH = [
  { year: '2018', departments: 12, buildings: 3, beds: 480, staff: 300, services: 90 },
  { year: '2019', departments: 16, buildings: 3, beds: 600, staff: 410, services: 120 },
  { year: '2020', departments: 20, buildings: 5, beds: 760, staff: 560, services: 165 },
  { year: '2021', departments: 24, buildings: 5, beds: 860, staff: 700, services: 205 },
  { year: '2022', departments: 28, buildings: 6, beds: 980, staff: 860, services: 245 },
  { year: '2023', departments: 31, buildings: 6, beds: 1100, staff: 1030, services: 260 },
  { year: '2024', departments: 34, buildings: 6, beds: 1286, staff: 1240, services: 280 },
];

const CAPACITY_TREEMAP = [
  { name: 'Medicine', value: 380, fill: C.sky },
  { name: 'ICU', value: 90, fill: C.red },
  { name: 'Emergency', value: 120, fill: C.amber },
  { name: 'Surgery', value: 280, fill: C.indigo },
  { name: 'Radiology', value: 160, fill: C.purple },
  { name: 'OBG', value: 240, fill: C.green },
  { name: 'Laboratory', value: 140, fill: C.sky },
  { name: 'NICU', value: 70, fill: C.amber },
];

const BED_MIX = [
  { dept: 'Medicine', male: 140, female: 155, isolation: 40, icu: 22, nicu: 0, hdu: 26 },
  { dept: 'Surgery', male: 130, female: 120, isolation: 32, icu: 18, nicu: 0, hdu: 22 },
  { dept: 'Pediatrics', male: 80, female: 80, isolation: 22, icu: 10, nicu: 28, hdu: 12 },
  { dept: 'OBG', male: 20, female: 210, isolation: 26, icu: 8, nicu: 22, hdu: 14 },
  { dept: 'ICU', male: 45, female: 35, isolation: 12, icu: 90, nicu: 0, hdu: 0 },
];

const ORG_SANKEY = {
  nodes: [
    { name: 'Hospital' }, { name: 'Medicine' }, { name: 'Surgery' }, { name: 'OBG' },
    { name: 'Ward' }, { name: 'Clinic' }, { name: 'Beds' }, { name: 'Patients' },
  ],
  links: [
    { source: 0, target: 1, value: 380 }, { source: 0, target: 2, value: 280 },
    { source: 0, target: 3, value: 240 },
    { source: 1, target: 4, value: 240 }, { source: 1, target: 5, value: 140 },
    { source: 2, target: 4, value: 210 }, { source: 2, target: 5, value: 70 },
    { source: 3, target: 4, value: 180 }, { source: 3, target: 5, value: 60 },
    { source: 4, target: 6, value: 630 }, { source: 5, target: 6, value: 270 },
    { source: 6, target: 7, value: 900 },
  ],
};

const TIMELINE = [
  { year: '2018', title: 'Building A', note: 'Core clinical block' },
  { year: '2020', title: 'Cancer Centre', note: 'Oncology service' },
  { year: '2023', title: 'ICU Expansion', note: '+40 beds' },
  { year: '2025', title: 'Dialysis', note: '20 stations' },
  { year: '2027', title: 'Research Block', note: 'Planned' },
];

const HEALTH = [
  { label: 'Missing Departments', value: 2, tone: 'warn' },
  { label: 'Departments Without Heads', value: 3, tone: 'warn' },
  { label: 'Wards Without Beds', value: 0, tone: 'ok' },
  { label: 'Clinics Without Services', value: 4, tone: 'warn' },
  { label: 'Duplicate Rooms', value: 0, tone: 'ok' },
  { label: 'Unused Buildings', value: 1, tone: 'warn' },
];

// ── helpers ────────────────────────────────────────────────────────────────
function flatten(nodes: SNode[]): SNode[] {
  const out: SNode[] = [];
  const walk = (list: SNode[]) => list.forEach(n => { out.push(n); if (n.children) walk(n.children); });
  walk(nodes);
  return out;
}
function findNode(nodes: SNode[], id: string): SNode | undefined {
  return flatten(nodes).find(n => n.id === id);
}
function pathNames(nodes: SNode[], id: string): string[] {
  const walk = (list: SNode[], trail: string[]): string[] => {
    for (const n of list) {
      const next = [...trail, n.name];
      if (n.id === id) return next;
      if (n.children) {
        const r = walk(n.children, next);
        if (r.length) return r;
      }
    }
    return [];
  };
  return walk(nodes, []);
}
function twinColor(s: Status): string {
  switch (s) {
    case 'operational': return C.green;
    case 'cleaning': return '#94a3b8';
    case 'maintenance': return C.amber;
    case 'fault': return C.red;
    case 'planned': return C.sky;
    case 'closed': return C.muted;
  }
}

// ── Page shell ─────────────────────────────────────────────────────────────
type View = 'overview' | 'master' | Kind | 'templates' | 'dependencies' | 'twin' | 'reports';

const NAV: { group: string; items: { id: View; label: string; icon: any; kind?: Kind }[] }[] = [
  {
    group: 'Architecture',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'master', label: 'Master Plan', icon: Map },
      { id: 'templates', label: 'Templates', icon: Layers },
      { id: 'dependencies', label: 'Dependencies', icon: Network },
      { id: 'twin', label: 'Digital Twin', icon: Eye },
      { id: 'reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    group: 'Structure',
    items: [
      { id: 'building', label: 'Buildings', icon: Building2, kind: 'building' },
      { id: 'department', label: 'Departments', icon: HeartPulse, kind: 'department' },
      { id: 'unit', label: 'Clinical Units', icon: Stethoscope, kind: 'unit' },
      { id: 'clinic', label: 'Clinics', icon: ClipboardList, kind: 'clinic' },
      { id: 'ward', label: 'Wards', icon: BedDouble, kind: 'ward' },
      { id: 'theatre', label: 'Theatres', icon: LayoutDashboard, kind: 'theatre' },
      { id: 'lab', label: 'Laboratories', icon: FlaskConical, kind: 'lab' },
      { id: 'radiology', label: 'Radiology', icon: Radiation, kind: 'radiology' },
      { id: 'pharmacy', label: 'Pharmacy', icon: Pill, kind: 'pharmacy' },
      { id: 'store', label: 'Stores', icon: Boxes, kind: 'store' },
      { id: 'vehicle', label: 'Vehicles', icon: Truck, kind: 'vehicle' },
      { id: 'satellite', label: 'Satellite Facilities', icon: MapPin, kind: 'satellite' },
    ],
  },
];

export default function StructureBuilderPage() {
  return (
    <WorkspaceGuard supportedRoles={SupportedRoles}>
      <StructureBuilder />
    </WorkspaceGuard>
  );
}

function StructureBuilder() {
  const [view, setView] = useState<View>('overview');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('dept-medicine');
  const [twin, setTwin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2400); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Noto Sans',system-ui,sans-serif", color: C.navy }}>
      <style>{`@keyframes mfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}.sb-fade{animation:mfade .2s ease-out}.sb-toggle{display:none}@media(max-width:980px){.sb-toggle{display:inline-flex}.sb-side{display:none;position:fixed;width:250px!important;left:0;top:58px;bottom:0;z-index:40}.sb-side--open{display:block!important}}`}</style>

      {/* Toolbar */}
      <div style={{ height: 58, background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => setMobileOpen(o => !o)} className="sb-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><ListTree size={20} color={C.slate} /></button>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.indigo},${C.sky})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Building2 size={18} /></div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>Hospital Structure Builder</div>
          <div style={{ fontSize: 10, color: C.muted }}>Engine III · the master architectural blueprint</div>
        </div>
        <span style={{ width: 1, height: 24, background: C.border }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
          <Search size={15} color={C.muted} style={{ flexShrink: 0 }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Ward 5, ICU, Cardiology, Clinical Block…" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: C.navy }} />
        </div>
        <button onClick={() => setTwin(t => !t)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: twin ? `${C.indigo}12` : '#fff', color: twin ? C.indigo : C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}><Eye size={13} /> {twin ? 'Digital Twin: On' : 'Digital Twin'}</button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.green, fontWeight: 700, background: `${C.green}14`, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}><CheckCircle size={13} /> Health 98%</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>
        <aside className={`sb-side${mobileOpen ? ' sb-side--open' : ''}`} style={{ width: 244, background: C.card, borderRight: `1px solid ${C.border}`, padding: '10px 8px', overflowY: 'auto', flexShrink: 0 }}>
          {NAV.map(section => (
            <div key={section.group} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 12px', marginBottom: 2 }}>{section.group}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const active = item.id === view || (item.kind != null && view === item.kind);
                return (
                  <button key={String(item.id)} onClick={() => { setView(item.id); setMobileOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: active ? C.skyLight : 'transparent', color: active ? C.sky : C.slate, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                    <Icon size={15} style={{ flexShrink: 0 }} /> <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <button onClick={() => setCreateOpen(true)} style={{ width: '100%', padding: 10, borderRadius: 10, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={14} /> Create Structure</button>
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: `linear-gradient(135deg,${C.indigo}14,${C.sky}14)`, border: `1px solid ${C.border}`, fontSize: 11, color: C.slate }}>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 2 }}>⚙️ 98% structure health</div>
            Every dashboard in AMEXAN is generated from here.
          </div>
        </aside>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,43,77,.35)', zIndex: 30 }} />}

        <main style={{ flex: 1, padding: 22, minWidth: 0, overflowY: 'auto' }}>
          {view === 'overview' && <OverviewView setView={setView} onSelect={(id) => { setSelected(id); setView('master'); }} />}
          {view === 'master' && <BuilderWorkspace tree={STRUCTURE} twin={twin} query={query} selected={selected} setSelected={setSelected} onCreate={() => setCreateOpen(true)} notify={notify} />}
          {view === 'templates' && <TemplatesView onOpen={() => setCreateOpen(true)} />}
          {view === 'dependencies' && <DependenciesView onSelect={() => { setSelected('dept-medicine'); setView('master'); }} />}
          {view === 'twin' && <TwinView tree={STRUCTURE} twin={twin} setTwin={setTwin} />}
          {view === 'reports' && <ReportsView />}
          {view !== 'overview' && view !== 'master' && view !== 'templates' && view !== 'dependencies' && view !== 'twin' && view !== 'reports' && (
            <KindView kind={view as Kind} tree={STRUCTURE} onOpen={(id) => { setSelected(id); setView('master'); }} onCreate={() => setCreateOpen(true)} />
          )}
        </main>
      </div>

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onToast={notify} />}
      {toast && <div style={{ position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', background: C.navy, color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 12, fontWeight: 600, boxShadow: '0 10px 30px rgba(11,43,77,.3)', zIndex: 70 }}>{toast}</div>}
    </div>
  );
}

// ── shared atoms ───────────────────────────────────────────────────────────
function Card({ title, sub, children, action }: { title?: string; sub?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
      {(title || action) && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div><div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>{sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}</div>{action}
      </div>}
      {children}
    </div>
  );
}
function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 800 }}>{title}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{sub}</div>}
      {children}
    </div>
  );
}
function ChapterHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>{sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}</div>
      {action}
    </div>
  );
}
function LabelDot({ color, label }: { color: string; label: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color, whiteSpace: 'nowrap' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />{label}</span>;
}
function TreemapCell(props: any) {
  const { x, y, width, height, name, fill, value } = props;
  if (width < 70 || height < 34) return <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} />;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} />
      <text x={x + 8} y={y + 18} fill="#fff" fontSize={12} fontWeight={800}>{name}</text>
      <text x={x + 8} y={y + 34} fill="#fff" fontSize={9} opacity={0.9}>{value} beds</text>
    </g>
  );
}
function Timeline() {
  return (
    <div>
      {TIMELINE.map((t, i) => (
        <div key={t.year} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: 16 }}>
          {i < TIMELINE.length - 1 && <div style={{ position: 'absolute', left: 36, top: 24, bottom: 0, width: 2, background: C.border }} />}
          <div style={{ width: 44, fontWeight: 800, fontSize: 12, color: C.indigo, flexShrink: 0, paddingTop: 2 }}>{t.year}</div>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.sky, border: '3px solid #fff', boxShadow: `0 0 0 1px ${C.sky}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, position: 'relative', zIndex: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{t.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Overview / Landing ─────────────────────────────────────────────────────
function OverviewView({ setView, onSelect }: { setView: (v: View) => void; onSelect: (id: string) => void }) {
  return (
    <div className="sb-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ padding: 20, borderRadius: 16, background: 'linear-gradient(120deg,#0b2c4d,#1e3a5f)', color: '#eaf1f9', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -40, fontSize: 150, opacity: .08, fontWeight: 800 }}>🏗️</div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7dd3fc', fontWeight: 800 }}>Constitutional Mission</div>
        <div style={{ fontSize: 19, fontWeight: 800, margin: '6px 0 6px', maxWidth: 760 }}>Design, visualize, evolve and govern the complete physical & operational structure of the hospital.</div>
        <div style={{ fontSize: 12, color: '#c7d8ee', maxWidth: 720, lineHeight: 1.6 }}>This is not a list of departments — it is the digital blueprint. Every bed, laboratory, theatre and dashboard in AMEXAN is generated from here and propagated to workforce, routing, admissions, Digital Twin, inventory, finance, analytics and permissions.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => setView('master')} style={{ border: 'none', background: C.sky, color: '#fff', padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Open Master Plan</button>
          <button onClick={() => onSelect('dept-medicine')} style={{ border: '1px solid rgba(255,255,255,.25)', background: 'transparent', color: '#eaf1f9', padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Inspect Medicine Dept</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 12 }}>
        {LANDING_STATS.map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.03em' }}><span style={{ fontSize: 14 }}>{s.icon}</span>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 3 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 16 }}>
        <ChartCard title="Organization Growth" sub="Departments · Beds · Buildings over time">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={GROWTH} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="departments" stroke={C.sky} strokeWidth={2} />
              <Line type="monotone" dataKey="beds" stroke={C.green} strokeWidth={2} />
              <Line type="monotone" dataKey="buildings" stroke={C.indigo} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Capacity by Department" sub="Treemap by bed / area">
          <ResponsiveContainer width="100%" height={250}>
            <Treemap data={CAPACITY_TREEMAP} dataKey="value" nameKey="name" stroke="#fff" content={<TreemapCell />} />
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 16 }}>
        <ChartCard title="Organizational Composition" sub="Hospital → Departments → Beds → Patients">
          <ResponsiveContainer width="100%" height={240}>
            <Sankey data={ORG_SANKEY} nodePadding={12} nameKey="name" node={{ strokeWidth: 1, stroke: C.border }} link={{ stroke: C.sky }} />
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Bed Distribution" sub="Male · Female · Isolation · ICU · NICU · HDU">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={BED_MIX} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="dept" tick={{ fontSize: 9, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="male" stackId="a" fill={C.sky} />
              <Bar dataKey="female" stackId="a" fill={C.purple} />
              <Bar dataKey="isolation" stackId="a" fill={C.amber} />
              <Bar dataKey="icu" stackId="a" fill={C.red} />
              <Bar dataKey="nicu" stackId="a" fill={C.green} />
              <Bar dataKey="hdu" stackId="a" fill={C.indigo} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 16 }}>
        <ChartCard title="Facility Expansion Timeline" sub="Investment → capability">
          <Timeline />
        </ChartCard>
        <Card title="Organization Health" sub="Governance audit — 98% healthy">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HEALTH.map(h => (
              <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.tone === 'ok' ? C.green : C.amber }} />
                <span style={{ flex: 1, fontSize: 12 }}>{h.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: h.tone === 'ok' ? C.green : C.amber }}>{h.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Three-pane builder ─────────────────────────────────────────────────────
function BuilderWorkspace({ tree, twin, query, selected, setSelected, onCreate, notify }: {
  tree: SNode[]; twin: boolean; query: string; selected: string; setSelected: (id: string) => void; onCreate: () => void; notify: (m: string) => void;
}) {
  const selectedNode = findNode(tree, selected);
  const q = query.trim().toLowerCase();
  return (
    <div className="sb-fade" style={{ display: 'flex', flexDirection: 'column', gap: 6, height: 'calc(100vh - 120px)', minHeight: 520 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.slate, padding: '2px' }}>
        <span style={{ fontWeight: 700, color: C.navy }}>Blueprint</span>
        {pathNames(tree, selected).map((p, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ color: C.muted }}>→</span><span style={{ fontWeight: i === pathNames(tree, selected).length - 1 ? 700 : 400 }}>{p}</span></span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        {/* LEFT · tree */}
        <div style={{ width: 262, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={14} color={C.sky} /> Hospital Tree</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
            {q ? <TreeFiltered tree={tree} q={q} onSelect={setSelected} selected={selected} /> : tree.map(n => <TreeRow key={n.id} node={n} depth={0} selected={selected} onSelect={setSelected} twin={twin} />)}
          </div>
          <button onClick={onCreate} style={{ padding: 10, borderTop: `1px solid ${C.border}`, background: 'transparent', color: C.sky, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><Plus size={13} /> Add child node</button>
        </div>
        {/* CENTER · canvas */}
        <CanvasTree tree={tree} twin={twin} node={selectedNode || tree[0]} selectedId={selected} onSelect={setSelected} onCreate={onCreate} />
        {/* RIGHT · properties */}
        <div style={{ width: 320, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflowY: 'auto', padding: 16 }}>
          {selectedNode ? <Properties node={selectedNode} twin={twin} onToast={notify} /> : <div style={{ fontSize: 13, color: C.muted, textAlign: 'center', padding: '40px 0' }}>Select a node to inspect it.</div>}
        </div>
      </div>
    </div>
  );
}

function TreeRow({ node, depth, selected, onSelect, twin }: { node: SNode; depth: number; selected: string; onSelect: (id: string) => void; twin: boolean }) {
  const [open, setOpen] = useState(depth < 1);
  const has = !!node.children && node.children.length > 0;
  const sel = node.id === selected;
  return (
    <div>
      <div onClick={() => { onSelect(node.id); if (has) setOpen(o => !o); }}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', paddingLeft: 6 + depth * 16, borderRadius: 7, cursor: 'pointer', background: sel ? `${C.skyLight}99` : 'transparent', fontSize: 12, color: sel ? C.sky : C.navy, fontWeight: sel ? 700 : 500 }}>
        {has ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span style={{ width: 13 }} />}
        <span>{node.icon || KIND_META[node.kind].icon}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
        <span title={STATUS_TONE[node.status].label} style={{ width: 8, height: 8, borderRadius: '50%', background: twin ? twinColor(node.status) : STATUS_TONE[node.status].color, flexShrink: 0 }} />
      </div>
      {has && open && node.children!.map(c => <TreeRow key={c.id} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} twin={twin} />)}
    </div>
  );
}

function TreeFiltered({ tree, q, onSelect, selected }: { tree: SNode[]; q: string; onSelect: (id: string) => void; selected: string }) {
  const hits = flatten(tree).filter(n => (n.name + ' ' + n.id).toLowerCase().includes(q) || n.kind.toLowerCase().includes(q));
  if (hits.length === 0) return <div style={{ fontSize: 11, color: C.muted, padding: 12 }}>No matches.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {hits.map(n => (
        <button key={n.id} onClick={() => onSelect(n.id)} style={{ textAlign: 'left', padding: '7px 9px', borderRadius: 8, border: 'none', background: selected === n.id ? C.skyLight : '#f8fafc', color: C.navy, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>{n.icon || KIND_META[n.kind].icon}</span>{n.name}
          <span style={{ marginLeft: 'auto', fontSize: 9, color: C.muted }}>{n.kind}</span>
        </button>
      ))}
    </div>
  );
}

function CanvasTree({ tree, twin, node, selectedId, onSelect, onCreate }: {
  tree: SNode[]; twin: boolean; node: SNode; selectedId: string; onSelect: (id: string) => void; onCreate: () => void;
}) {
  if (!node) {
    return (
      <div style={{ flex: 1, minWidth: 0, background: '#f7fafd', border: `1px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 13 }}>Select a node on the tree.</div>
    );
  }
  return (
    <div style={{ flex: 1, minWidth: 0, background: 'radial-gradient(circle at 20% 20%, #f8fbfe, #eaf1f7)', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'auto', padding: 14 }}>
      <CanvasStack node={node} onSelect={onSelect} twin={twin} selectedId={selectedId} />
      <button onClick={onCreate} style={{ marginTop: 14, border: `1px dashed ${C.sky}88`, background: 'transparent', color: C.sky, padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Plus size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} /> Add on canvas</button>
    </div>
  );
}

function CanvasStack({ node, onSelect, twin, selectedId }: { node: SNode; onSelect: (id: string) => void; twin: boolean; selectedId: string }) {
  const children = node.children || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Block node={node} onSelect={onSelect} active={node.id === selectedId} twin={twin} />
      {children.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 20, borderLeft: `2px solid ${C.border}`, marginLeft: 14 }}>
          {children.map(c => <CanvasStack key={c.id} node={c} onSelect={onSelect} twin={twin} selectedId={selectedId} />)}
        </div>
      )}
    </div>
  );
}

function Block({ node, onSelect, active, twin }: { node: SNode; onSelect: (id: string) => void; active: boolean; twin: boolean }) {
  const children = node.children || [];
  const color = twin ? twinColor(node.status) : STATUS_TONE[node.status].color;
  return (
    <div onClick={() => onSelect(node.id)}
      style={{ padding: '10px 12px', borderRadius: 10, border: active ? `1.5px solid ${C.sky}` : `1px solid ${C.border}`, background: C.card, boxShadow: active ? '0 6px 18px rgba(14,116,211,.15)' : 'none', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{node.icon || KIND_META[node.kind].icon}</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{node.name}</span>
        <span style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '.03em' }}>{node.kind}</span>
        <LabelDot color={color} label={STATUS_TONE[node.status].label} />
        {children.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: C.muted }}>{children.length} children</span>}
      </div>
      {node.capacity ? <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>Capacity {node.capacity}</div> : null}
    </div>
  );
}

// ── Properties panel ───────────────────────────────────────────────────────
function Properties({ node, twin, onToast }: { node: SNode; twin: boolean; onToast: (m: string) => void }) {
  const meta = KIND_META[node.kind];
  const kids = node.children || [];
  const details: [string, string | number][] = node.kind === 'department' && node.id === 'dept-medicine'
    ? [['Clinics', 8], ['Wards', 2], ['Beds', 124], ['Doctors', 41], ['Nurses', 112], ['Residents', 18], ['Students', 56], ['Protocols', 182], ['Services', 247], ['Assets', 381]]
    : [['Children', kids.length], ['Capacity', node.capacity ?? '—'], ['Type', meta.accent === C.slate ? node.kind : node.kind], ['Status', STATUS_TONE[node.status].label]];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: `${meta.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{node.icon || meta.icon}</div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 800 }}>{node.name}</div><div style={{ fontSize: 11, color: C.muted }}>{node.kind} · {node.id}</div></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <LabelDot color={twin ? twinColor(node.status) : STATUS_TONE[node.status].color} label={STATUS_TONE[node.status].label} />
        <span style={{ marginLeft: 'auto' }} /><button onClick={() => onToast('Changes saved ✓')} style={{ border: 'none', background: C.sky, color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {details.map(([k, v]) => (
          <div key={k} style={{ padding: '9px 10px', background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{v}</div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
        <input defaultValue={node.meta || ''} style={{ width: '100%', height: 32, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none' }} placeholder="Add a note…" />
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>Children ({kids.length})</div>
        {kids.length === 0 && <div style={{ fontSize: 11, color: C.muted }}>No children yet.</div>}
        {kids.map(k => <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: 12 }}><span>{k.icon || KIND_META[k.kind].icon}</span><span style={{ flex: 1 }}>{k.name}</span><LabelDot color={STATUS_TONE[k.status].color} label={STATUS_TONE[k.status].label} /></div>)}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <button onClick={() => onToast('Relationship validated · best path recorded')} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px dashed ${C.purple}66`, background: `${C.purple}0c`, color: C.purple, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Sparkles size={12} style={{ verticalAlign: '-2px', marginRight: 6 }} />Smart Relationships</button>
      </div>
    </div>
  );
}

// ── Digital Twin ───────────────────────────────────────────────────────────
function TwinView({ tree, twin, setTwin }: { tree: SNode[]; twin: boolean; setTwin: (b: boolean) => void }) {
  const beds = flatten(tree).filter(n => n.kind === 'bed');
  const legend = [
    ['Operational', C.green], ['Empty', C.sky], ['Maintenance', C.amber], ['Fault', C.red], ['Cleaning', '#94a3b8'],
  ];
  return (
    <div className="sb-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ChapterHead title="Digital Twin" sub="Occupancy state of the whole estate — live."
        action={<button onClick={() => setTwin(!twin)} style={{ border: `1px solid ${C.border}`, background: twin ? C.indigo : C.card, color: twin ? '#fff' : C.slate, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{twin ? 'Twin Active' : 'Show Digital Twin'}</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 10 }}>
        {legend.map(([k, color]) => (
          <div key={k} style={{ padding: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: color }} />
            <div><div style={{ fontSize: 16, fontWeight: 800 }}>{beds.filter(b => b.status === (k === 'Empty' ? 'planned' : k === 'Operational' ? 'operational' : k.toLowerCase().split(' ')[0])).length}</div><div style={{ fontSize: 10, color: C.muted }}>{k}</div></div>
          </div>
        ))}
      </div>
      <Card title="Live occupancy — Bed canvas" sub="Every bed rendered from the constitutional tree, recolored by the twin.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {flatten(tree).filter(n => n.kind === 'room').map(r => (
            <div key={r.id} style={{ padding: 12, background: '#f8fafc', borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(r.children || []).map(b => (
                  <span key={b.id} title={b.name} style={{ width: 22, height: 22, borderRadius: 5, background: twin ? twinColor(b.status) : STATUS_TONE[b.status].color, display: 'inline-block' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Templates / Reports / Dependencies ─────────────────────────────────────
function TemplatesView({ onOpen }: { onOpen: () => void }) {
  const templates = ['Referral Hospital', 'Teaching Hospital', 'District Hospital', 'Private Hospital', 'Cancer Centre', "Children's Hospital"];
  return (
    <div className="sb-fade">
      <ChapterHead title="Structure Templates" sub="Choose an archetype — the entire constitutional blueprint is generated." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
        {templates.map(t => (
          <button key={t} onClick={onOpen} style={{ textAlign: 'left', padding: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer' }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🏗️</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{t}</div>
            <div style={{ fontSize: 11, color: C.muted, margin: '4px 0 10px' }}>Generates departments, wards, theatres, labs, beds, dashboards.</div>
            <span style={{ fontSize: 10, color: C.sky, fontWeight: 700 }}>Generate →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DependenciesView({ onSelect }: { onSelect: () => void }) {
  const links: [string, string][] = [['Hospital', 'Medicine'], ['Medicine', 'Clinics'], ['Medicine', 'Ward'], ['Ward', 'Beds'], ['Beds', 'Patients'], ['Medicine', 'Protocols'], ['Medicine', 'Services']];
  const pos: Record<string, [number, number]> = {
    Hospital: [40, 170], Medicine: [210, 170], Clinics: [380, 60], Ward: [380, 150],
    Beds: [380, 250], Patients: [380, 340], Protocols: [210, 310], Services: [210, 350],
  };
  return (
    <div className="sb-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div><div style={{ fontSize: 16, fontWeight: 800 }}>Dependency Graph</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Neo4j visualization — click the Medicine node to jump into the blueprint.</div></div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.indigo, fontWeight: 700 }}><Network size={13} /> Neo4j live</span>
      </div>
      <div style={{ background: 'radial-gradient(circle at 30% 30%, #1f3a5f, #0b2c4d)', borderRadius: 16, padding: 24, minHeight: 380 }}>
        <svg width="100%" height={340} viewBox="0 0 560 400" style={{ fontFamily: 'inherit' }}>
          {links.map(([a, b], i) => {
            const [ax, ay] = pos[a] || [0, 0];
            const [bx, by] = pos[b] || [0, 0];
            return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#3b5f8a" strokeWidth={2} />;
          })}
          {Object.entries(pos).map(([name, [x, y]]) => (
            <g key={name} onClick={onSelect} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={26} fill={name === 'Medicine' ? C.sky : C.indigo} />
              <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{name.slice(0, 5)}</text>
              <text x={x} y={y - 34} textAnchor="middle" fill="#c7d8ee" fontSize={10}>{name}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function ReportsView() {
  const reports = ['Hospital Blueprint', 'Department Map', 'Bed Map', 'Clinic Directory', 'Building Layout', 'Room Register', 'Government Structure Report', 'Accreditation Report', 'Digital Twin Export'];
  return (
    <div className="sb-fade">
      <ChapterHead title="Structure Reports" sub="Export the living blueprint at the touch of a button." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px,1fr))', gap: 10 }}>
        {reports.map(r => (
          <button key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
            <FileText size={18} color={C.sky} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>{r}</span>
            <span style={{ marginLeft: 'auto', color: C.muted }}><Download size={13} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Kind views ─────────────────────────────────────────────────────────────
function KindView({ kind, tree, onOpen, onCreate }: { kind: Kind; tree: SNode[]; onOpen: (id: string) => void; onCreate: () => void }) {
  const items = flatten(tree).filter(n => n.kind === kind);
  const meta = KIND_META[kind];
  const label = kindLabel(kind);
  return (
    <div className="sb-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: `${meta.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{meta.icon}</div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 800 }}>{label}s ({items.length})</div><div style={{ fontSize: 11, color: C.muted }}>All {label.toLowerCase()} nodes in the constitutional hierarchy.</div></div>
        <button onClick={onCreate} style={{ border: 'none', background: C.sky, color: '#fff', padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add {label}</button>
      </div>
      {items.length === 0 && <div style={{ fontSize: 13, color: C.muted, padding: '30px 0' }}>No {label.toLowerCase()} nodes yet.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 12 }}>
        {items.map(n => (
          <div key={n.id} onClick={() => onOpen(n.id)} style={{ padding: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 22 }}>{n.icon || meta.icon}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{n.name}</div><div style={{ fontSize: 10, color: C.muted }}>{n.meta || n.id}</div></div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}><LabelDot color={STATUS_TONE[n.status].color} label={STATUS_TONE[n.status].label} /><span style={{ marginLeft: 'auto', fontSize: 10, color: C.sky, fontWeight: 700 }}>Open →</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function kindLabel(k: Kind): string {
  const map: Record<Kind, string> = {
    building: 'Building', floor: 'Floor', department: 'Department', unit: 'Clinical Unit', ward: 'Ward',
    clinic: 'Clinic', theatre: 'Theatre', lab: 'Laboratory', radiology: 'Radiology Unit', pharmacy: 'Pharmacy',
    store: 'Store', room: 'Room', bed: 'Bed', vehicle: 'Vehicle', satellite: 'Satellite Facility',
  };
  return map[k];
}

// ── Create modal ───────────────────────────────────────────────────────────
function CreateModal({ onClose, onToast }: { onClose: () => void; onToast: (m: string) => void }) {
  const options: { label: string; icon: string; kind: Kind }[] = [
    { label: 'Building', icon: '🏢', kind: 'building' }, { label: 'Department', icon: '🏥', kind: 'department' },
    { label: 'Clinical Unit', icon: '🩺', kind: 'unit' }, { label: 'Ward', icon: '🛏️', kind: 'ward' },
    { label: 'Clinic', icon: '🩹', kind: 'clinic' }, { label: 'Theatre', icon: '🏥', kind: 'theatre' },
    { label: 'Laboratory', icon: '🔬', kind: 'lab' }, { label: 'Radiology', icon: '📷', kind: 'radiology' },
    { label: 'Pharmacy', icon: '💊', kind: 'pharmacy' }, { label: 'Store', icon: '📦', kind: 'store' },
    { label: 'Floor', icon: '🏗️', kind: 'floor' }, { label: 'Satellite Centre', icon: '🏛️', kind: 'satellite' },
  ];
  const [pick, setPick] = useState('Department');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,43,77,.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="sb-fade" style={{ width: 520, maxWidth: '100%', background: C.card, borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} color={C.sky} />
          <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15 }}>Create Structure</div><div style={{ fontSize: 11, color: C.muted }}>Generator — AMEXAN builds the blueprint, you never type.</div></div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.slate }}><X size={18} /></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>What are you building?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {options.map(o => (
              <button key={o.label} onClick={() => setPick(o.label)}
                style={{ padding: '12px 8px', borderRadius: 10, border: pick === o.label ? `1.5px solid ${C.sky}` : `1px solid ${C.border}`, background: pick === o.label ? C.skyLight : '#f8fafc', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', color: pick === o.label ? C.sky : C.navy }}>
                <span style={{ fontSize: 20 }}>{o.icon}</span>{o.label}
              </button>
            ))}
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: '#f8fafc', border: `1px solid ${C.border}`, fontSize: 12, color: C.slate, lineHeight: 1.6 }}>
            Generate <strong>{pick}</strong> — AMEXAN creates the full hierarchy, dashboards, permissions, and analytics. ✓ One click.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { onToast(`${pick} generated ✓`); onClose(); }} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Generate {pick}</button>
          </div>
        </div>
      </div>
    </div>
  );
}