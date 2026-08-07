'use client';

// AMEXAN — Clinical Operations Intelligence Center (COIC · Learning Hospital OS)
// Not a passive reporting dashboard. A continuous hospital learning engine that
// observes, analyzes, explains, recommends, improves, measures again, learns and
// predicts. Every metric explains itself: current value, expected value, reason,
// root causes and the AI recommendation.

import { useState } from 'react';
import {
  Activity, HeartPulse, BedDouble, Clock, Timer, Scan, FlaskConical, Radiation,
  Ambulance, LayoutDashboard, Stethoscope, ShieldAlert, RotateCcw, Skull, Users,
  Search, BarChart3, Sparkles, Brain, FileText, TrendingUp, ArrowRight, CheckCircle,
  Loader2, AlertTriangle, Gauge as GaugeIcon, GitBranch, Mail, Wrench, Menu, X,
  ClipboardList, CalendarDays,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, BarChart, Bar, Sankey, Treemap, PieChart, Pie, Cell,
} from 'recharts';
import WorkspaceGuard from '@/components/workspace/WorkspaceGuard';

const SupportedRoles = ['executive'] as const;

const C = {
  bg: '#eff4fa', card: '#ffffff', border: '#e3e9f2',
  navy: '#0b2c4d', slate: '#5b6b80', muted: '#8a98ac',
  sky: '#0ea5e9', skyLight: '#e0f2fe',
  green: '#10b981', red: '#ef4444', amber: '#f59e0b', purple: '#8b5cf6', indigo: '#6366f1',
};

// ── Learning dataset — every metric explains itself ───────────────────────
type Cause = { cause: string; weight: number };
type Learning = {
  id: string;
  title: string;
  domain: string;
  value: string;
  expected: string;
  diff: string;
  diffTone: 'red' | 'green' | 'amber';
  reason: string;
  causes: Cause[];
  ai: string;
  note?: string;
};

const LEARNING: Learning[] = [
  {
    id: 'admissions', title: 'Admissions Today', domain: 'Patient Flow', value: '128', expected: '113', diff: '+15', diffTone: 'amber',
    reason: 'Respiratory infections increased.',
    causes: [{ cause: 'Seasonal respiratory surge', weight: 42 }, { cause: 'Referral spike from satellites', weight: 26 }, { cause: 'Weekend GP closure', weight: 18 }],
    ai: 'Prediction: high admissions tomorrow. Hold 6 overflow beds and staff the evening shift.',
  },
  {
    id: 'occupancy', title: 'Bed Occupancy', domain: 'Bed Management', value: '84%', expected: '76%', diff: '+8%', diffTone: 'red',
    reason: 'Delayed discharges.',
    causes: [{ cause: 'Awaiting imaging', weight: 31 }, { cause: 'Awaiting family pickup', weight: 24 }, { cause: 'Insurance delays', weight: 18 }, { cause: 'Delayed medications', weight: 14 }, { cause: 'Social reasons', weight: 13 }],
    ai: 'Recommendation: open the discharge lounge and batch imaging early morning.',
  },
  {
    id: 'los', title: 'Length of Stay', domain: 'Patient Flow', value: '5.4 Days', expected: '4.2 Days', diff: '+1.2 Days', diffTone: 'red',
    reason: 'Care pathway delays.',
    causes: [{ cause: 'Delayed imaging', weight: 26 }, { cause: 'Delayed theatre', weight: 22 }, { cause: 'Delayed consultant review', weight: 19 }, { cause: 'Delayed laboratory', weight: 16 }, { cause: 'Social discharge barriers', weight: 17 }],
    ai: 'Add a discharge coordinator and standardize consultant rounding before 11:00.',
  },
  {
    id: 'waiting', title: 'Emergency Waiting', domain: 'Emergency', value: '42 mins', expected: '15 mins', diff: '+27 mins', diffTone: 'red',
    reason: 'Demand exceeds triage throughput.',
    causes: [{ cause: 'High patient volume', weight: 34 }, { cause: 'Insufficient triage staff', weight: 22 }, { cause: 'Radiology delays', weight: 18 }, { cause: 'No inpatient beds', weight: 16 }, { cause: 'Delayed admissions', weight: 10 }],
    ai: 'Redeploy one nurse to triage 07:00–15:00; activate the surge plan above 45 mins.',
  },
  {
    id: 'theatre', title: 'Theatre Utilization', domain: 'Theatre', value: '62%', expected: '85%', diff: '-23%', diffTone: 'red',
    reason: 'Surgical flow inefficiency.',
    causes: [{ cause: 'Late starts', weight: 28 }, { cause: 'Cancelled cases', weight: 22 }, { cause: 'No implants', weight: 18 }, { cause: 'No blood', weight: 16 }, { cause: 'Equipment downtime', weight: 16 }],
    ai: 'Lost revenue KES 3.2M. Front-load anaesthesia reviews to eliminate late starts.',
  },
  {
    id: 'lab', title: 'Laboratory TAT', domain: 'Laboratory', value: '36 mins', expected: '20 mins', diff: '+16 mins', diffTone: 'amber',
    reason: 'Pre-analytic & analyzer bottlenecks.',
    causes: [{ cause: 'Analyzer downtime', weight: 30 }, { cause: 'Insufficient reagents', weight: 24 }, { cause: 'Staff shortage', weight: 26 }, { cause: 'Sample transport delays', weight: 20 }],
    ai: 'Suggestion: increase morning staffing and add a second transport runner.',
  },
  {
    id: 'radiology', title: 'CT Reporting', domain: 'Radiology', value: '78 mins', expected: '30 mins', diff: '+48 mins', diffTone: 'red',
    reason: 'Radiologist overload & night coverage gap.',
    causes: [{ cause: 'Radiologist overload', weight: 58 }, { cause: 'Night coverage gap', weight: 26 }, { cause: 'Prioritization gaps', weight: 16 }],
    ai: 'Escalate stat reads to the teleradiology partner after 22:00.',
  },
  {
    id: 'infection', title: 'Surgical Site Infection', domain: 'Infection', value: '4%', expected: '2%', diff: '+2%', diffTone: 'red',
    reason: 'Sterility & antibiotic timing failures.',
    causes: [{ cause: 'Antibiotic timing', weight: 34 }, { cause: 'Sterility breaks', weight: 30 }, { cause: 'Instrument delays', weight: 20 }, { cause: 'Traffic in theatre', weight: 16 }],
    ai: 'Affected: 2 theatres · General Surgery. Enforce 60-min antibiotic prophylaxis window.',
  },
  {
    id: 'readmission', title: '30-Day Readmissions', domain: 'Quality', value: '7%', expected: '5%', diff: '+2%', diffTone: 'amber',
    reason: 'Discharge readiness gaps.',
    causes: [{ cause: 'Medication issues', weight: 32 }, { cause: 'Poor education', weight: 26 }, { cause: 'Follow-up gaps', weight: 24 }, { cause: 'Social factors', weight: 18 }],
    ai: 'Add pharmacist-led discharge counseling and auto-schedule 7-day follow-up.',
  },
  {
    id: 'mortality', title: 'Mortality (Month)', domain: 'Quality', value: '12', expected: '8', diff: '+4', diffTone: 'red',
    reason: 'Late sepsis recognition.',
    causes: [{ cause: 'Sepsis — late presentation', weight: 38 }, { cause: 'Delayed ICU transfer', weight: 26 }, { cause: 'Delayed antibiotics', weight: 22 }, { cause: 'Monitoring gaps', weight: 14 }],
    ai: 'Activate Sepsis AI watch and hard-redirect ICU capacity for deteriorating patients.',
  },
];

const WARD_LEARNING = {
  title: 'Medicine Ward — Root Causes',
  value: '8 delayed discharges',
  expected: '0',
  diff: '8',
  diffTone: 'red' as const,
  reason: 'Nurse workload high · no discharge coordinator · social delays.',
  causes: [{ cause: 'Nurse workload high (11:1)', weight: 40 }, { cause: 'No discharge coordinator', weight: 34 }, { cause: 'Social delays', weight: 26 }],
  ai: 'Recommended nurse:patient 6:1. Assign a discharge coordinator for Ward A.',
  metrics: [['Falls', 3], ['Pressure Injuries', 2], ['Readmissions', 4], ['Delayed Discharges', 8]],
};

const STAFF_LEARNING = {
  title: 'Staff Workload Intelligence',
  value: '11:1',
  expected: '6:1',
  diff: 'High',
  diffTone: 'red' as const,
  reason: 'Ward A Patient:Nurse ratio exceeds recommended safe staffing.',
  causes: [{ cause: 'No-shows', weight: 34 }, { cause: 'Uneven rostering', weight: 30 }, { cause: 'Sick leave', weight: 20 }, { cause: 'Transfer demand', weight: 16 }],
  ai: 'Float pool: reassign 2 nurses from Surgical Block to Ward A tonight.',
};

const EMERGENCY_LEARNING = {
  title: 'Emergency Demand Signals',
  value: 'Trauma increasing',
  expected: 'Baseline',
  diff: 'Trend',
  diffTone: 'amber' as const,
  reason: 'AI detects weekend peaks and rising orthopedic demand.',
  causes: [{ cause: 'Road accidents', weight: 44 }, { cause: 'Weekend peaks', weight: 30 }, { cause: 'Blood demand increasing', weight: 26 }],
  ai: 'Pre-position trauma team Friday–Sunday and secure O-negative stock.',
};

// ── Charts data ────────────────────────────────────────────────────────────
const ADMISSIONS_TREND = [
  { h: '00', v: 3 }, { h: '03', v: 2 }, { h: '06', v: 9 }, { h: '09', v: 21 }, { h: '12', v: 27 },
  { h: '15', v: 30 }, { h: '18', v: 19 }, { h: '21', v: 12 }, { h: '24', v: 5 },
];
const ADMISSIONS_WEEK = [
  { d: 'Mon', actual: 118, predicted: 121 }, { d: 'Tue', actual: 124, predicted: 123 },
  { d: 'Wed', actual: 109, predicted: 116 }, { d: 'Thu', actual: 132, predicted: 128 },
  { d: 'Fri', actual: 141, predicted: 136 }, { d: 'Sat', actual: 112, predicted: 118 },
  { d: 'Sun', actual: 104, predicted: 122 },
];
const FLOW_SANKEY = {
  nodes: [
    { name: 'Emergency' }, { name: 'Ward' }, { name: 'ICU' }, { name: 'Theatre' },
    { name: 'Home' }, { name: 'HDU' }, { name: 'Discharged' },
  ],
  links: [
    { source: 0, target: 1, value: 64 }, { source: 0, target: 2, value: 18 },
    { source: 0, target: 4, value: 46 }, { source: 1, target: 2, value: 12 },
    { source: 1, target: 4, value: 52 }, { source: 2, target: 5, value: 12 },
    { source: 2, target: 4, value: 18 }, { source: 3, target: 1, value: 24 },
    { source: 5, target: 1, value: 12 }, { source: 5, target: 4, value: 22 },
  ],
};
const ROOT_CAUSES = [
  { name: 'Imaging', value: 26, fill: C.sky }, { name: 'Insurance', value: 20, fill: C.purple },
  { name: 'Drugs', value: 16, fill: C.amber }, { name: 'Staff', value: 24, fill: C.indigo },
  { name: 'Equipment', value: 14, fill: C.red },
];
const LOS_HISTOGRAM = [
  { days: '0–2', n: 88 }, { days: '3–5', n: 142 }, { days: '6–8', n: 96 },
  { days: '9–11', n: 42 }, { days: '12–14', n: 21 }, { days: '15+', n: 12 },
];
const WAIT_HEATMAP = [
  { d: 'Emergency', triage: 42, test: 51, consult: 63, bed: 74 },
  { d: 'OPD', triage: 22, test: 34, consult: 47, bed: 0 },
  { d: 'Maternity', triage: 18, test: 26, consult: 38, bed: 22 },
  { d: 'Laboratory', triage: 0, test: 36, consult: 0, bed: 0 },
  { d: 'Radiology', triage: 0, test: 78, consult: 30, bed: 0 },
];
const THEATRE_GANTT = [
  { name: 'T1 — Orthopedics', start: 6, end: 9, color: C.sky },
  { name: 'T2 — General Surgery', start: 7, end: 11, color: C.indigo },
  { name: 'T3 — ENT', start: 8, end: 9, color: C.purple },
  { name: 'T4 — Neurosurgery', start: 9, end: 12, color: C.red },
  { name: 'T5 — Ophth', start: 10, end: 12, color: C.green },
  { name: 'T6 — Obstetrics', start: 11, end: 13, color: C.amber },
];
const LAB_BOX = [
  { assay: 'CBC', p25: 12, med: 22, p75: 34, hi: 58 },
  { assay: 'Chemistry', p25: 18, med: 31, p75: 47, hi: 72 },
  { assay: 'Coagulation', p25: 22, med: 38, p75: 52, hi: 80 },
  { assay: 'Microbiology', p25: 40, med: 66, p75: 92, hi: 130 },
  { assay: 'Blood Bank', p25: 14, med: 26, p75: 41, hi: 66 },
];
const PREDICTIONS = [
  { d: 'Mon', beds: 122 }, { d: 'Tue', beds: 130 }, { d: 'Wed', beds: 141 },
  { d: 'Thu', beds: 152 }, { d: 'Fri', beds: 148 }, { d: 'Sat', beds: 136 },
];
const HEADER = [
  { label: 'Clinical Efficiency Score', value: '97%', tone: C.green },
  { label: 'System Health', value: 'Stable', tone: C.green },
  { label: 'Patient Flow', value: 'Good', tone: C.green },
  { label: 'Critical Bottlenecks', value: '2', tone: C.amber },
  { label: 'AI Recommendations', value: '4', tone: C.sky },
  { label: 'Predicted Risks', value: '3', tone: C.red },
];
const LEARNING_INDEX = { score: '94%', usesData: true, implements: true, improves: true };

// ── Page shell ─────────────────────────────────────────────────────────────
type View = 'overview' | 'reports' | 'rootcauses' | string;

const NAV: { group: string; items: { id: View; label: string; icon: any }[] }[] = [
  {
    group: 'Learning Center',
    items: [
      { id: 'overview', label: 'Operations Learning Wall', icon: LayoutDashboard },
      { id: 'reports', label: 'Meeting & Report Mode', icon: FileText },
      { id: 'rootcauses', label: 'Root Cause Engine', icon: GitBranch },
    ],
  },
  {
    group: 'Domains',
    items: [
      { id: 'admissions', label: 'Admissions', icon: Activity },
      { id: 'flow', label: 'Patient Flow', icon: TrendingUp },
      { id: 'occupancy', label: 'Bed Occupancy', icon: BedDouble },
      { id: 'delays', label: 'Delays & LOS', icon: Clock },
      { id: 'emergency', label: 'Emergency', icon: Ambulance },
      { id: 'theatre', label: 'Theatre', icon: HeartPulse },
      { id: 'laboratory', label: 'Laboratory', icon: FlaskConical },
      { id: 'radiology', label: 'Radiology', icon: Radiation },
      { id: 'wards', label: 'Wards', icon: Stethoscope },
      { id: 'infection', label: 'Infection', icon: ShieldAlert },
      { id: 'readmissions', label: 'Readmissions', icon: RotateCcw },
      { id: 'mortality', label: 'Mortality', icon: Skull },
      { id: 'staff', label: 'Staff Workload', icon: Users },
      { id: 'predictions', label: 'AI Predictions', icon: Brain },
    ],
  },
];

export default function CoicPage() {
  return (
    <WorkspaceGuard supportedRoles={SupportedRoles}>
      <Coic />
    </WorkspaceGuard>
  );
}

function Coic() {
  const [view, setView] = useState<View>('overview');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2400); };

  const learn = (id: string) => LEARNING.find(l => l.id === id);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Noto Sans',system-ui,sans-serif", color: C.navy }}>
      <style>{`@keyframes mfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@keyframes mpspin{to{transform:rotate(360deg)}}.co-fade{animation:mfade .2s ease-out}.co-spin{animation:mpspin 1s linear infinite}.co-toggle{display:none}@media(max-width:980px){.co-toggle{display:inline-flex}.co-side{display:none;position:fixed;width:250px!important;left:0;top:58px;bottom:0;z-index:40}.co-side--open{display:block!important}}`}</style>

      {/* Toolbar */}
      <div style={{ height: 58, background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => setMobileOpen(o => !o)} className="co-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Menu size={20} color={C.slate} /></button>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.sky},${C.indigo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Brain size={18} /></div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>Clinical Operations Intelligence Center</div>
          <div style={{ fontSize: 10, color: C.muted }}>The hospital learns from itself — every day</div>
        </div>
        <span style={{ width: 1, height: 24, background: C.border }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
          <Search size={15} color={C.muted} style={{ flexShrink: 0 }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Why are beds full? Why is mortality rising?…" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: C.navy }} />
        </div>
        <button onClick={() => { setView('reports'); notify('Morning Meeting Report generated ✓'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg,${C.sky},${C.indigo})`, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}><CalendarDays size={13} /> Morning Report</button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.green, fontWeight: 700, background: `${C.green}14`, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}><Brain size={13} /> Learning {LEARNING_INDEX.score}</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>
        <aside className={`co-side${mobileOpen ? ' co-side--open' : ''}`} style={{ width: 248, background: C.card, borderRight: `1px solid ${C.border}`, padding: '10px 8px', overflowY: 'auto', flexShrink: 0 }}>
          {NAV.map(section => (
            <div key={section.group} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 12px', marginBottom: 2 }}>{section.group}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const active = view === item.id || (section.group === 'Domains' && item.id === view);
                return (
                  <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: active ? C.skyLight : 'transparent', color: active ? C.sky : C.slate, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                    <Icon size={15} style={{ flexShrink: 0 }} /> <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: `linear-gradient(135deg,${C.sky}14,${C.purple}14)`, border: `1px solid ${C.border}`, fontSize: 11, color: C.slate }}>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 2 }}>🧠 Observe → Explain → Learn</div>
            Every metric explains itself. No number without a reason.
          </div>
        </aside>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,43,77,.35)', zIndex: 30 }} />}

        <main style={{ flex: 1, padding: 22, minWidth: 0, overflowY: 'auto' }}>
          {view === 'overview' && <Overview notify={notify} goTo={setView} />}
          {view === 'reports' && <ReportsView notify={notify} />}
          {view === 'rootcauses' && <RootCauseEngine />}
          {view === 'flow' && <DomainView l={learn('admissions')!} extra={<FlowCharts />} />}
          {view === 'delays' && <DomainView l={learn('los')!} extra={<DelaysCharts />} />}
          {view === 'occupancy' && <DomainView l={learn('occupancy')!} extra={<OccupancyCharts />} />}
          {view === 'emergency' && <DomainView l={learn('waiting')!} extra={<EmergencyCharts />} />}
          {view === 'theatre' && <DomainView l={learn('theatre')!} extra={<TheatreCharts />} />}
          {view === 'laboratory' && <DomainView l={learn('lab')!} extra={<LaboratoryCharts />} />}
          {view === 'radiology' && <DomainView l={learn('radiology')!} extra={null} />}
          {view === 'wards' && <WardView />}
          {view === 'infection' && <DomainView l={learn('infection')!} extra={null} />}
          {view === 'readmissions' && <DomainView l={learn('readmission')!} extra={null} />}
          {view === 'mortality' && <DomainView l={learn('mortality')!} extra={<MortalityCharts />} />}
          {view === 'staff' && <StaffView />}
          {view === 'predictions' && <PredictionsView />}
          {view === 'admissions' && <DomainView l={learn('admissions')!} extra={<AdmissionsCharts />} />}
        </main>
      </div>

      {report && <ReportPreview report={report} onClose={() => setReport(null)} />}
      {toast && <div style={{ position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', background: C.navy, color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 12, fontWeight: 600, boxShadow: '0 10px 30px rgba(11,43,77,.3)', zIndex: 70 }}>{toast}</div>}
    </div>
  );
}

// ── atoms ──────────────────────────────────────────────────────────────────
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
function HeadStat({ label, value, tone, icon }: { label: string; value: string; tone: string; icon?: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.03em' }}>{icon}{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: tone, marginTop: 3 }}>{value}</div>
    </div>
  );
}
function TreemapCell(props: any) {
  const { x, y, width, height, name, fill, value } = props;
  if (width < 70 || height < 32) return <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} />;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} />
      <text x={x + 8} y={y + 18} fill="#fff" fontSize={12} fontWeight={800}>{name}</text>
      <text x={x + 8} y={y + 34} fill="#fff" fontSize={9} opacity={0.9}>{value}%</text>
    </g>
  );
}

// ── Learning Card — the heart of the system ────────────────────────────────
function LearningCard({ l, wide }: { l: Learning; wide?: boolean }) {
  const tone = l.diffTone === 'red' ? C.red : l.diffTone === 'amber' ? C.amber : C.green;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, ...(wide ? {} : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{l.title}</span>
        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: `${C.sky}12`, color: C.sky, fontWeight: 700 }}>{l.domain}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 30, fontWeight: 800 }}>{l.value}</span>
        <span style={{ fontSize: 12, color: C.muted }}>Expected <strong style={{ color: C.navy }}>{l.expected}</strong></span>
        <span style={{ fontSize: 13, fontWeight: 800, color: tone, background: `${tone}14`, padding: '2px 8px', borderRadius: 8 }}>{l.diff}</span>
      </div>
      <div style={{ fontSize: 12, color: C.slate }}>
        <span style={{ fontWeight: 700 }}>Reason:</span> {l.reason}
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 5 }}>Top Causes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {l.causes.map(c => (
            <div key={c.cause} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, fontSize: 11 }}>{c.cause}</span>
              <div style={{ width: 90, height: 6, background: '#eef2f7', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${c.weight}%`, height: '100%', background: l.diffTone === 'red' ? C.red : C.amber, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 10, color: C.muted, width: 28, textAlign: 'right' }}>{c.weight}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: 10, borderRadius: 10, background: `${C.indigo}0e`, border: `1px solid ${C.indigo}30`, fontSize: 11, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <Sparkles size={13} color={C.indigo} style={{ marginTop: 1, flexShrink: 0 }} />
        <span><strong style={{ color: C.indigo }}>AI Recommendation:</strong> <span style={{ color: C.slate }}>{l.ai}</span></span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
        <button style={{ flex: 1, border: 'none', background: C.sky, color: '#fff', fontSize: 10, fontWeight: 700, padding: '7px 0', borderRadius: 7, cursor: 'pointer' }}>Apply Recommendation</button>
        <button style={{ flex: 1, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 10, fontWeight: 600, padding: '7px 0', borderRadius: 7, cursor: 'pointer' }}>Log Action</button>
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────
function Overview({ notify, goTo }: { notify: (m: string) => void; goTo: (v: View) => void }) {
  return (
    <div className="co-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Executive header */}
      <div style={{ padding: 20, borderRadius: 16, background: 'linear-gradient(120deg,#0b2c4d,#123a63)', color: '#eaf1f9', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -40, fontSize: 150, opacity: .08, fontWeight: 800 }}>🧠</div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7dd3fc', fontWeight: 800 }}>Real-Time Operational Learning Dashboard</div>
        <div style={{ fontSize: 19, fontWeight: 800, margin: '6px 0 4px' }}>Hospital Performance Today</div>
        <div style={{ fontSize: 12, color: '#c7d8ee', maxWidth: 720, lineHeight: 1.55 }}>AMEXAN is no longer passive. It observes, analyzes, explains, recommends, improves, measures again, learns and predicts. Every number below explains <em>why</em>.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 10, marginTop: 16 }}>
          {HEADER.map(h => (
            <div key={h.label} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)' }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.06em', color: '#93b4d8', fontWeight: 700 }}>{h.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: h.tone, marginTop: 2 }}>{h.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning index + meeting mode */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 16 }}>
        <Card title="Hospital Learning Index" sub="The new AMEXAN metric — is this a learning organization?">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#eef2f7" strokeWidth="12" />
                <circle cx="60" cy="60" r="48" fill="none" stroke={C.indigo} strokeWidth="12" strokeDasharray={`${94 * 3.016} 301.6`} strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: C.indigo }}>{LEARNING_INDEX.score}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Uses Data', LEARNING_INDEX.usesData], ['Implements Changes', LEARNING_INDEX.implements], ['Improves Outcomes', LEARNING_INDEX.improves]].map(([k, v]) => (
                <div key={String(k)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>{v ? <CheckCircle size={15} color={C.green} /> : <X size={15} color={C.red} />} {String(k)}</div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Meeting Mode" sub="One click — the hospital briefs itself." action={<button onClick={() => notify('Morning Meeting Report generated ✓')} style={{ border: 'none', background: C.sky, color: '#fff', padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Generate</button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Daily Clinical Operations Report', 'Weekly M&M Report', 'Weekly Executive Report', 'Government & Donor Reports'].map(r => (
              <button key={r} onClick={() => { goTo('reports'); notify(`${r} · generated ✓`); }} style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#f8fafc', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <FileText size={14} color={C.sky} /> {r} <ArrowRight size={13} style={{ marginLeft: 'auto', color: C.muted }} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Learning wall — the explained metrics */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Operational Learning Wall</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>No bare numbers. Each metric explains itself: expected value · reason · causes · AI recommendation.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px,1fr))', gap: 14 }}>
          {LEARNING.map(l => <LearningCard key={l.id} l={l} />)}
        </div>
      </div>

      {/* Ward + staff + emergency special learning */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 14 }}>
        <WardCard />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StaffCard />
          <EmergencyCard />
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 16 }}>
        <ChartCard title="Admissions Trend" sub="Hourly today · Line">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ADMISSIONS_TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
              <Line type="monotone" dataKey="v" stroke={C.sky} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Occupancy" sub="Gauge — 84% vs 76% expected">
          <Gauge value={84} target={76} />
        </ChartCard>
        <ChartCard title="Patient Flow" sub="Sankey — Emergency → Ward → ICU → Home">
          <ResponsiveContainer width="100%" height={200}>
            <Sankey data={FLOW_SANKEY} nodePadding={14} nameKey="name" node={{ strokeWidth: 1, stroke: C.border }} link={{ stroke: C.sky }} />
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Root Causes" sub="Treemap — why the hospital is slow">
          <ResponsiveContainer width="100%" height={200}>
            <Treemap data={ROOT_CAUSES} dataKey="value" nameKey="name" stroke="#fff" content={<TreemapCell />} />
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Ward / Staff / Emergency special cards ─────────────────────────────────
function WardCard() {
  return (
    <Card title={WARD_LEARNING.title} sub={`${WARD_LEARNING.value} · expected ${WARD_LEARNING.expected}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {WARD_LEARNING.metrics.map(([k, v]) => (
          <div key={String(k)} style={{ padding: '9px 10px', background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: Number(v) > 0 ? C.amber : C.green }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: C.slate, marginBottom: 8 }}><strong>Root causes:</strong> {WARD_LEARNING.reason}</div>
      <div style={{ padding: 9, borderRadius: 8, background: `${C.indigo}0e`, fontSize: 11 }}><Sparkles size={12} color={C.indigo} style={{ verticalAlign: '-2px', marginRight: 6 }} /><strong style={{ color: C.indigo }}>{WARD_LEARNING.ai}</strong></div>
    </Card>
  );
}
function StaffCard() {
  const l = STAFF_LEARNING;
  return (
    <Card title={l.title} sub={`Patient:Nurse ${l.value} · recommended ${l.expected}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.red }}>{l.value}</span>
        <span style={{ fontSize: 12, color: C.muted }}>Ward A → <strong style={{ color: C.green }}>6:1</strong></span>
      </div>
      <div style={{ fontSize: 11, color: C.slate, marginBottom: 8 }}>{l.ai}</div>
    </Card>
  );
}
function EmergencyCard() {
  const l = EMERGENCY_LEARNING;
  return (
    <Card title={l.title} sub="AI demand signals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {l.causes.map(c => (
          <div key={c.cause} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <span style={{ flex: 1 }}>{c.cause}</span>
            <div style={{ width: 70, height: 6, background: '#eef2f7', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${c.weight}%`, height: '100%', background: C.amber, borderRadius: 4 }} /></div>
            <span style={{ width: 26, textAlign: 'right', color: C.muted, fontSize: 10 }}>{c.weight}%</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.slate }}>{l.ai}</div>
    </Card>
  );
}

// ── Gauge (custom SVG) ─────────────────────────────────────────────────────
function Gauge({ value, target }: { value: number; target: number }) {
  const pct = value / 100;
  const sweep = Math.PI * 1.15; // ~210°
  const R = 70;
  const arc = (frac: number, offset = 0) => {
    const a0 = Math.PI * 0.9 + offset; // start angle
    const a1 = a0 + sweep * frac;
    const x0 = 100 + R * Math.cos(a0);
    const y0 = 100 - R * Math.sin(a0);
    const x1 = 100 + R * Math.cos(a1);
    const y1 = 100 - R * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return { x0, y0, x1, y1, large };
  };
  const bg = arc(1);
  const fg = arc(pct);
  const tg = arc(target / 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <svg width="200" height="170" viewBox="0 0 200 170">
        <path d={`M ${bg.x0} ${bg.y0} A ${R} ${R} 0 ${bg.large} 1 ${bg.x1} ${bg.y1}`} fill="none" stroke="#eef2f7" strokeWidth="16" strokeLinecap="round" />
        <path d={`M ${fg.x0} ${fg.y0} A ${R} ${R} 0 ${fg.large} 1 ${fg.x1} ${fg.y1}`} fill="none" stroke={pct > 0.85 ? C.red : C.amber} strokeWidth="16" strokeLinecap="round" />
        <path d={`M ${tg.x0} ${tg.y0} A ${R} ${R} 0 ${tg.large} 1 ${tg.x1} ${tg.y1}`} fill="none" stroke={C.green} strokeWidth="3" strokeDasharray="2 4" />
        <text x="100" y="120" textAnchor="middle" fontSize="34" fontWeight="800" fill={C.navy}>{value}%</text>
        <text x="100" y="142" textAnchor="middle" fontSize="10" fill={C.muted}>target {target}%</text>
      </svg>
      <div style={{ fontSize: 11, color: C.slate, maxWidth: 150, lineHeight: 1.5 }}>
        <strong>Reason:</strong> delayed discharges. <strong>AI:</strong> open the discharge lounge and batch early imaging.
      </div>
    </div>
  );
}

// ── Domain views ───────────────────────────────────────────────────────────
function DomainView({ l, extra }: { l: Learning; extra?: React.ReactNode }) {
  return (
    <div className="co-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{l.title} — Learning</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 14 }}>
        <LearningCard l={l} />
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
}

function AdmissionsCharts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ChartCard title="Weekly — Actual vs Predicted" sub="AI future line">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ADMISSIONS_WEEK} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="d" tick={{ fontSize: 10, fill: C.muted }} />
            <YAxis tick={{ fontSize: 10, fill: C.muted }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="actual" stroke={C.sky} strokeWidth={2} name="Actual" />
            <Line type="monotone" dataKey="predicted" stroke={C.purple} strokeDasharray="5 4" strokeWidth={2} name="Predicted" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function OccupancyCharts() {
  return (
    <ChartCard title="Bed Occupancy Learning" sub="84% · expected 76% · delayed discharges">
      <Gauge value={84} target={76} />
    </ChartCard>
  );
}

function FlowCharts() {
  return (
    <ChartCard title="Patient Flow" sub="Sankey — Emergency → Ward → ICU → Home">
      <ResponsiveContainer width="100%" height={260}>
        <Sankey data={FLOW_SANKEY} nodePadding={14} nameKey="name" node={{ strokeWidth: 1, stroke: C.border }} link={{ stroke: C.sky }} />
      </ResponsiveContainer>
    </ChartCard>
  );
}

function DelaysCharts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ChartCard title="LOS Histogram" sub="Days distribution">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={LOS_HISTOGRAM} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="days" tick={{ fontSize: 10, fill: C.muted }} />
            <YAxis tick={{ fontSize: 10, fill: C.muted }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
            <Bar dataKey="n" fill={C.indigo} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Waiting Time — Department Heatmap" sub="minutes by stage">
        <Heatmap />
      </ChartCard>
    </div>
  );
}

function Heatmap() {
  const stages = ['triage', 'test', 'consult', 'bed'];
  const color = (v: number) => {
    if (v <= 0) return 'transparent';
    if (v < 30) return 'rgba(16,185,129,.35)';
    if (v < 50) return 'rgba(245,158,11,.55)';
    if (v < 70) return 'rgba(239,68,68,.65)';
    return 'rgba(239,68,68,.95)';
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(4, 1fr)', gap: 4, fontSize: 10, fontWeight: 700, color: C.muted }}>
        <div />
        {stages.map(s => <div key={s} style={{ textAlign: 'center' }}>{s}</div>)}
        {WAIT_HEATMAP.map(row => (
          <>
            <div key={row.d} style={{ display: 'flex', alignItems: 'center' }}>{row.d}</div>
            {stages.map(s => {
              const v = (row as any)[s];
              return <div key={s} style={{ height: 30, borderRadius: 6, background: color(v), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: v > 50 ? '#fff' : C.navy }}>{v || ''}</div>;
            })}
          </>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10, color: C.muted, alignItems: 'center' }}>
        <span>fast</span>
        {['rgba(16,185,129,.35)', 'rgba(245,158,11,.55)', 'rgba(239,68,68,.65)', 'rgba(239,68,68,.95)'].map(c => <span key={c} style={{ width: 14, height: 14, borderRadius: 4, background: c, display: 'inline-block' }} />)}
        <span>slow</span>
      </div>
    </div>
  );
}

function TheatreCharts() {
  return (
    <ChartCard title="Theatre Gantt — Today" sub="Utilization 62% · target 85% · KES 3.2M lost">
      <Gantt />
    </ChartCard>
  );
}

function Gantt() {
  const hours = ['06', '07', '08', '09', '10', '11', '12', '13'];
  const left = (h: number) => ((h - 6) / (14 - 6)) * 100;
  const width = (s: number, e: number) => ((e - s) / (14 - 6)) * 100;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 8, fontSize: 9, color: C.muted, fontWeight: 700 }}>
        <div />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hours.length}, 1fr)` }}>
          {hours.map(h => <div key={h} style={{ textAlign: 'center' }}>{h}:00</div>)}
        </div>
        {THEATRE_GANTT.map(t => (
          <>
            <div key={t.name} style={{ fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center' }}>{t.name}</div>
            <div style={{ position: 'relative', height: 26 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'grid', gridTemplateColumns: `repeat(${hours.length}, 1fr)` }}>
                {hours.map(h => <div key={h} style={{ borderLeft: `1px solid ${C.border}` }} />)}
              </div>
              <div style={{ position: 'absolute', top: 4, height: 18, left: `${left(t.start)}%`, width: `${width(t.start, t.end)}%`, background: t.color, borderRadius: 5, opacity: 0.9 }} />
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

function LaboratoryCharts() {
  return (
    <ChartCard title="Lab TAT — Box plots (minutes)" sub="36 avg · target 20">
      <BoxPlot />
    </ChartCard>
  );
}

function BoxPlot() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150 }}>
        {LAB_BOX.map(b => (
          <div key={b.assay} style={{ flex: 1, position: 'relative', height: 140 }}>
            <div style={{ position: 'absolute', bottom: 0, left: '30%', width: '40%', height: 8, background: C.border, borderRadius: 2 }} />
            <div style={{ position: 'absolute', bottom: 8, left: '50%', width: 2, background: C.muted, height: `${(b.hi / 130) * 132}px` }} />
            <div style={{ position: 'absolute', bottom: 8 + (b.med / 130) * 132, left: '32%', width: '36%', height: `${((b.p75 - b.p25) / 130) * 132}px`, background: `${C.sky}55`, border: `1px solid ${C.sky}` }} />
            <div style={{ position: 'absolute', bottom: 8 + (b.med / 130) * 132, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: C.navy }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        {LAB_BOX.map(b => <div key={b.assay} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: C.muted }}>{b.assay}</div>)}
      </div>
    </div>
  );
}

function EmergencyCharts() {
  return (
    <ChartCard title="Emergency Demand" sub="AI demand signals — trauma & weekend peaks">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {EMERGENCY_LEARNING.causes.map(c => (
          <div key={c.cause} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <span style={{ flex: 1 }}>{c.cause}</span>
            <div style={{ width: '100%', maxWidth: 160, height: 7, background: '#eef2f7', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${c.weight}%`, height: '100%', background: C.amber, borderRadius: 4 }} /></div>
            <span style={{ width: 30, textAlign: 'right', color: C.muted, fontSize: 10 }}>{c.weight}%</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: C.slate }}>{EMERGENCY_LEARNING.ai}</div>
    </ChartCard>
  );
}

function MortalityCharts() {
  return (
    <ChartCard title="Mortality Learning" sub="12 deaths · expected 8 · excess 4">
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <ResponsiveContainer width="55%" height={180}>
          <PieChart>
            <Pie data={[{ name: 'Expected', value: 8 }, { name: 'Excess', value: 4 }]} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={4}>
              <Cell fill={C.green} />
              <Cell fill={C.red} />
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
          {['Sepsis — late presentation', 'Delayed ICU transfer', 'Delayed antibiotics', 'Monitoring gaps'].map(c => <div key={c} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: C.red }} />{c}</div>)}
        </div>
      </div>
    </ChartCard>
  );
}

function WardView() {
  return (
    <div className="co-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>Ward Learning</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 14 }}>
        <WardCard />
        <Card title="Nurse Workload by Ward" sub="Patient : Nurse ratio">
          {[['Ward A', 11], ['Ward B', 5], ['Ward C', 7], ['ICU', 2], ['NICU', 3]].map(([w, r]) => (
            <div key={String(w)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11 }}>
              <span style={{ width: 80 }}>{w}</span>
              <div style={{ flex: 1, height: 8, background: '#eef2f7', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(Number(r) / 12) * 100}%`, height: '100%', background: Number(r) > 8 ? C.red : Number(r) > 6 ? C.amber : C.green, borderRadius: 4 }} />
              </div>
              <span style={{ width: 30, textAlign: 'right', fontWeight: 700 }}>{r}:1</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 11, color: C.slate }}>Recommended safe ratio: <strong>6:1</strong>. Ward A exceeds it.</div>
        </Card>
      </div>
    </div>
  );
}

function StaffView() {
  return (
    <div className="co-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>Staff Learning</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 14 }}>
        <StaffCard />
        <Card title="Why are nurses overwhelmed?" sub="AI root cause">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STAFF_LEARNING.causes.map(c => (
              <div key={c.cause} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ flex: 1 }}>{c.cause}</span>
                <div style={{ width: 120, height: 7, background: '#eef2f7', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${c.weight}%`, height: '100%', background: C.indigo, borderRadius: 4 }} /></div>
                <span style={{ width: 30, textAlign: 'right', color: C.muted }}>{c.weight}%</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: 9, borderRadius: 8, background: `${C.indigo}0e`, fontSize: 11 }}><Sparkles size={12} color={C.indigo} style={{ verticalAlign: '-2px', marginRight: 6 }} />{STAFF_LEARNING.ai}</div>
        </Card>
      </div>
    </div>
  );
}

// ── AI Predictions ─────────────────────────────────────────────────────────
function PredictionsView() {
  return (
    <div className="co-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>AI Predictions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 14 }}>
        <ChartCard title="Predicted Bed Demand — Next 7 Days" sub="AI future line">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={PREDICTIONS} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="bedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.purple} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
              <Area type="monotone" dataKey="beds" stroke={C.purple} strokeWidth={2} fill="url(#bedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card title="Executive Questions — Answered">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Why are discharges delayed?', 'Awaiting imaging (31%) & family pickup (24%). Open discharge lounge.'],
              ['Why are patients waiting?', 'Triage staffing + radiology delays. Redeploy 1 nurse to triage.'],
              ['Which wards are overloaded?', 'Ward A at 11:1 — recommended 6:1. Float pool tonight.'],
              ['Why is mortality increasing?', 'Late sepsis recognition. Activate Sepsis AI watch.'],
              ['Which department underperforms?', 'Theatre at 62% utilization — KES 3.2M lost.'],
              ['What should we change?', 'Apply 4 AI recommendations → measure again tomorrow.'],
            ].map(([q, a]) => (
              <div key={String(q)} style={{ padding: 10, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{q}</div>
                <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{a}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Root Cause Engine ──────────────────────────────────────────────────────
function RootCauseEngine() {
  const steps = ['Problem', 'Find Cause', 'Recommend', 'Implement', 'Measure', 'Learn'];
  return (
    <div className="co-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>Root Cause Engine</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 8 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ padding: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.sky, color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{i + 1}</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 14 }}>
        {LEARNING.map(l => (
          <div key={l.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{l.title}</div>
            <div style={{ fontSize: 11, color: C.slate }}><strong>Problem:</strong> {l.value} vs expected {l.expected}</div>
            <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}><strong>Cause:</strong> {l.reason}</div>
            <div style={{ fontSize: 11, color: C.indigo, marginTop: 2 }}><strong>Recommend:</strong> {l.ai}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button style={{ border: 'none', background: C.sky, color: '#fff', fontSize: 10, fontWeight: 700, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Implement</button>
              <button style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 10, fontWeight: 600, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Measure</button>
              <button style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 10, fontWeight: 600, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Log</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reports / Meeting Mode ─────────────────────────────────────────────────
function ReportsView({ notify }: { notify: (m: string) => void }) {
  const reports = [
    { name: 'Daily Clinical Operations Report', kind: 'Daily', desc: 'Admissions · Discharges · Occupancy · Emergency · ICU · Theatre · Laboratory · Radiology · Mortality · Readmissions · Critical cases · Bottlenecks · AI Recommendations', format: 'PDF · PowerPoint · Board' },
    { name: 'Weekly M&M Report', kind: 'Weekly', desc: 'Deaths · Complications · Root causes · Actions · Responsible persons · Timelines', format: 'PDF · PowerPoint' },
    { name: 'Weekly Executive Report', kind: 'Weekly', desc: 'Performance · Financial · Quality · Research · Operations · Forecasts', format: 'PDF · Board' },
    { name: 'Government & Donor Reports', kind: 'Government', desc: 'MOH · SHA · DHIS2 · County · Donors — auto-generated, auto-submitted', format: 'XML · CSV · PDF' },
  ];
  return (
    <div className="co-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>Meeting & Report Mode</div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>The hospital briefs itself — daily, weekly, to the board, to the government. No manual compiling.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: 14 }}>
        {reports.map(r => (
          <div key={r.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FileText size={15} color={C.sky} />
              <div style={{ fontSize: 13, fontWeight: 800, flex: 1 }}>{r.name}</div>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: `${C.purple}12`, color: C.purple, fontWeight: 700 }}>{r.kind}</span>
            </div>
            <div style={{ fontSize: 11, color: C.slate, marginBottom: 10 }}>{r.desc}</div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>Formats: {r.format}</div>
            <button onClick={() => notify(`${r.name} generated ✓`)} style={{ width: '100%', border: 'none', background: C.sky, color: '#fff', padding: '9px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Generate Automatically</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPreview({ report, onClose }: { report: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,43,77,.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="co-fade" style={{ width: 520, maxWidth: '100%', background: C.card, borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={16} color={C.sky} />
          <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15 }}>Daily Clinical Operations Report</div><div style={{ fontSize: 11, color: C.muted }}>{new Date().toDateString()}</div></div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.slate }}><X size={18} /></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Admissions', 'Discharges', 'Occupancy', 'Emergency', 'ICU', 'Theatre', 'Laboratory', 'Radiology', 'Mortality', 'Readmissions', 'Critical Cases', 'Bottlenecks', 'AI Recommendations'].map((k, i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: i % 2 ? '#f8fafc' : '#fff', borderRadius: 8 }}>
              <span style={{ flex: 1, fontSize: 12 }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{k === 'Bottlenecks' ? '2 — imaging & theatre' : k === 'AI Recommendations' ? '4 actions queued' : k === 'Mortality' ? '12 (8 expected)' : k === 'Readmissions' ? '7%' : '—'}</span>
            </div>
          ))}
          <button onClick={onClose} style={{ marginTop: 8, padding: '10px 0', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Export PDF · PowerPoint · Board</button>
        </div>
      </div>
    </div>
  );
}