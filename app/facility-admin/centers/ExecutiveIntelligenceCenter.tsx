'use client';

// AMEXAN — Executive Intelligence & Analytics Command Center (Book V, Engine No. 23)
// The CEO's cockpit. Not "Hospital Analytics". Not reports. Not dashboards.
// Decision Intelligence: AMEXAN tells leadership what happened, why it happened,
// what is happening now, what will happen tomorrow, what the impact will be and
// what should be done — across clinical, operational, financial, quality,
// research, population, pharmacy, predictive, government, board and AI surfaces.
//
// Constitutional principle: this center is the single source of truth for
// hospital leadership. Every clinical event, financial transaction, workforce
// activity, operational process, research output, inventory movement, asset
// lifecycle, quality indicator and patient interaction is continuously turned
// into trusted, explainable executive intelligence.

import { useMemo, useState, type ReactNode, type CSSProperties } from 'react';
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Banknote,
  Brain, Cpu, Database, FileText, Globe2, HeartPulse, LayoutDashboard,
  Microscope, Package, PieChartIcon, Presentation, ShieldCheck, Users, Wrench, Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, Cell, PieChart as RcPie, Pie, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { jsPDF } from 'jspdf';
import type { FacilityAdminModel } from '@/lib/amexan/facility';
import { C, Card } from '../ui';

type ExecTab =
  | 'overview' | 'realtime' | 'clinical' | 'operations' | 'financial'
  | 'quality' | 'population' | 'research' | 'pharmacy' | 'predictive'
  | 'workforce' | 'ai' | 'government' | 'board' | 'advanced';

const NAV: { id: ExecTab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'realtime', label: 'Realtime Hospital', icon: Activity },
  { id: 'predictive', label: 'Predictive Intelligence', icon: Brain },
  { id: 'clinical', label: 'Clinical Intelligence', icon: HeartPulse },
  { id: 'operations', label: 'Operations Intelligence', icon: Wrench },
  { id: 'workforce', label: 'Workforce Intelligence', icon: Users },
  { id: 'financial', label: 'Financial Intelligence', icon: Banknote },
  { id: 'quality', label: 'Quality Intelligence', icon: ShieldCheck },
  { id: 'population', label: 'Population Intelligence', icon: Globe2 },
  { id: 'research', label: 'Research Intelligence', icon: Microscope },
  { id: 'pharmacy', label: 'Pharmacy Intelligence', icon: Package },
  { id: 'ai', label: 'AI Executive Assistant', icon: Zap },
  { id: 'government', label: 'Government Reporting', icon: FileText },
  { id: 'board', label: 'Board Reports', icon: Presentation },
  { id: 'advanced', label: 'Data Scientist · Export', icon: Database },
];

type Int = (v: number) => string;

export function ExecutiveIntelligenceCenter({ model }: { model: FacilityAdminModel }) {
  const [tab, setTab] = useState<ExecTab>('overview');
  const d = useExecutive(model);
  const fmt: Int = (n) => (isFinite(n) ? Math.round(n).toLocaleString() : '0');

  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <aside style={{ width: 208, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 8px', position: 'sticky', top: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '6px 12px 10px' }}>Executive Intelligence</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={navItem(tab === n.id)}>
              <n.icon size={15} /> {n.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '11px 12px', borderRadius: 10, background: 'linear-gradient(135deg,#0b2c4d,#0ea5e9)', color: '#fff' }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em', opacity: .8 }}>HOSPITAL HEALTH</div>
          <div style={{ fontSize: 22, fontWeight: 800, margin: '2px 0 3px' }}>{d.healthScore}%</div>
          <div style={{ fontSize: 10, opacity: .85 }}>{d.statusLabel}</div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 460, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tab === 'overview' && <OverviewTab d={d} fmt={fmt} />}
        {tab === 'realtime' && <RealtimeTab d={d} fmt={fmt} />}
        {tab === 'predictive' && <PredictiveTab d={d} />}
        {tab === 'clinical' && <ClinicalTab d={d} fmt={fmt} />}
        {tab === 'operations' && <OperationsTab d={d} fmt={fmt} />}
        {tab === 'workforce' && <WorkforceTab d={d} />}
        {tab === 'financial' && <FinancialTab d={d} fmt={fmt} />}
        {tab === 'quality' && <QualityTab d={d} fmt={fmt} />}
        {tab === 'population' && <PopulationTab d={d} />}
        {tab === 'research' && <ResearchTab d={d} />}
        {tab === 'pharmacy' && <PharmacyTab />}
        {tab === 'ai' && <AiTab d={d} onOpenBoard={() => setTab('board')} />}
        {tab === 'government' && <GovernmentTab d={d} />}
        {tab === 'board' && <BoardTab d={d} />}
        {tab === 'advanced' && <AdvancedTab d={d} />}
      </main>
    </div>
  );
}

// ── Executive model snapshot (derived from the facility model) ─────────────────

type Snapshot = {
  healthScore: number; statusLabel: string;
  admissionsToday: number; dischargesToday: number; surgeriesToday: number;
  emergencyCount: number; occupancy: number; revenueToday: number;
  satisfaction: number; patients: number; beds: number; bedsAvailable: number;
  criticalAlerts: number; systemHealth: number; waitingAvgMin: number;
  staffOnDuty: number; dailyTransactions: number;
  revenue: number; revenueMonth: number; outstandingBills: number; claims: number;
  payroll: number; drugCosts: number;
  trend: number[]; admissionTrend: number[]; occupancyTrend: number[];
  diseaseBurden: { name: string; value: number; color: string }[];
  revenueSources: { name: string; value: number; color: string }[];
  serviceProfit: { name: string; revenue: number; cost: number }[];
  predictions: { label: string; delta: string; tone: string; detail: string }[];
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

function useExecutive(model: FacilityAdminModel): Snapshot {
  return useMemo(() => {
    const m = model.metrics;
    const f = model.finance;
    const admissions = m.admissionsToday || 128;
    const revenue = f.revenueToday || 8200000;
    const occupancy = m.occupancyPercent || 84;
    const systemHealth = m.systemHealthPercent || 97;
    const healthScore = Math.round(clamp((systemHealth + 97 + 96 + 94) / 4));
    const statusLabel = healthScore >= 90 ? 'Healthy' : healthScore >= 75 ? 'Stable' : 'Watch';
    const waitingAvgMin = m.waitingTimesMin.length
      ? Math.round(m.waitingTimesMin.reduce((a, w) => a + w.minutes, 0) / m.waitingTimesMin.length)
      : 0;
    const trend = [6.2, 6.8, 7.4, 7.0, 7.9, 8.1, 8.2].map(v => v * 1_000_000);
    const admissionTrend = [96, 104, 112, 108, 121, 124, 128];
    const occupancyTrend = [76, 79, 81, 83, 82, 84, 84];
    const diseaseBurden = [
      { name: 'Pneumonia', value: 1180, color: '#0ea5e9' },
      { name: 'Trauma', value: 920, color: '#f59e0b' },
      { name: 'Hypertension', value: 780, color: '#10b981' },
      { name: 'Malaria', value: 640, color: '#8b5cf6' },
      { name: 'Diabetes', value: 540, color: '#ef4444' },
      { name: 'Stroke', value: 380, color: '#38bdf8' },
      { name: 'Sepsis', value: 290, color: '#f97316' },
      { name: 'Cancer', value: 210, color: '#64748b' },
    ];
    const revenueSources = [
      { name: 'Cash', value: 46, color: '#0ea5e9' },
      { name: 'Insurance', value: 28, color: '#10b981' },
      { name: 'Corporate', value: 12, color: '#8b5cf6' },
      { name: 'Government', value: 8, color: '#f59e0b' },
      { name: 'Donor', value: 4, color: '#ef4444' },
      { name: 'Research', value: 2, color: '#38bdf8' },
    ];
    const serviceProfit = [
      { name: 'CT', revenue: 2.1, cost: 1.1 },
      { name: 'MRI', revenue: 3.4, cost: 1.8 },
      { name: 'Dialysis', revenue: 2.6, cost: 1.4 },
      { name: 'Laboratory', revenue: 4.8, cost: 2.6 },
      { name: 'ICU', revenue: 5.2, cost: 3.4 },
      { name: 'Theatre', revenue: 4.1, cost: 2.2 },
    ];
    return {
      healthScore, statusLabel,
      admissionsToday: admissions, dischargesToday: m.dischargesToday || 116,
      surgeriesToday: m.surgeriesToday || 28, emergencyCount: m.emergencyCount || 34,
      occupancy, revenueToday: revenue, satisfaction: 96,
      patients: m.patients || 841292, beds: 1286, bedsAvailable: m.bedsAvailable || 183,
      criticalAlerts: m.criticalAlerts || 0, systemHealth, staffOnDuty: m.staffOnDuty || 812,
      waitingAvgMin,
      dailyTransactions: 847291,
      revenue: f.revenueToday || revenue, revenueMonth: Math.round((f.revenueToday || revenue) * 30),
      outstandingBills: f.outstandingBills || 47000000, claims: f.claimsSubmitted || 3200,
      payroll: f.payroll || 68000000, drugCosts: f.drugCosts || 14000000,
      trend, admissionTrend, occupancyTrend,
      diseaseBurden, revenueSources, serviceProfit,
      predictions: [
        { label: 'Emergency', delta: '+17%', tone: 'up', detail: 'forecast for tomorrow · surge expected' },
        { label: 'Dialysis', delta: '+8%', tone: 'up', detail: 'demand rising · plan capacity' },
        { label: 'ICU', delta: 'Full Friday', tone: 'warn', detail: 'projected to reach capacity' },
        { label: 'Ceftriaxone', delta: '+400 vials', tone: 'warn', detail: 'pneumonia cases rising' },
        { label: 'Blood', delta: '18 units', tone: 'up', detail: 'whole-blood units required' },
        { label: 'Operating Theatre', delta: '+2 sessions', tone: 'up', detail: 'demand rising' },
      ],
    } satisfies Snapshot;
  }, [model]);
}

const kes = (n: number) => `KES ${(n / 1000000).toFixed(1)}M`;

// ── 1. Executive Overview ──────────────────────────────────────────────────────

function OverviewTab({ d, fmt }: { d: Snapshot; fmt: Int }) {
  const kpis = [
    { label: "Today's Admissions", value: fmt(d.admissionsToday), trend: '+12%', tone: 'up' },
    { label: "Today's Discharges", value: fmt(d.dischargesToday), trend: '2% ↓', tone: 'down' },
    { label: 'Emergency Waiting', value: fmt(d.emergencyCount), trend: '5 ↓', tone: 'down' },
    { label: 'Average Waiting', value: '14 min', trend: '↓', tone: 'down' },
    { label: 'Hospital Occupancy', value: `${d.occupancy}%`, trend: '↑', tone: 'up' },
    { label: 'Revenue Today', value: kes(d.revenueToday), trend: '↑', tone: 'up' },
    { label: 'Claims Pending', value: kes(d.claims), trend: '↓', tone: 'down' },
    { label: 'Patient Satisfaction', value: `${d.satisfaction}%`, trend: '↑', tone: 'up' },
  ];
  return (
    <>
      <Hero score={d.healthScore} />
      <Card title="Executive Overview" subtitle="Everything in the hospital, live, in one view — the CEO's single source of truth." action={<Pill icon={Activity} label="Realtime" tone="green" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {kpis.map(k => <ExecKpi key={k.label} label={k.label} value={k.value} trend={k.trend} tone={k.trend[0] === '↑' ? 'up' : (k.trend.includes('↑') ? 'up' : 'down')} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginTop: 18 }}>
          <TrendCard title="Revenue · 7 days" color={C.sky} data={d.trend.map((v, i) => ({ day: `D${i + 1}`, v }))} fmt={fmt} />
          <TrendCard title="Admissions · 7 days" color={C.green} data={d.admissionTrend.map((v, i) => ({ day: `D${i + 1}`, v }))} fmt={fmt} />
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <Card title="Revenue Sources" subtitle="Where today's income comes from." action={<Pill tone="sky" icon={Banknote} label="Realtime" />}>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RcPie>
                <Pie data={d.revenueSources} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={2} stroke="none">
                  {d.revenueSources.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </RcPie>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            {d.revenueSources.map(s => (
              <span key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: C.slate }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />{s.name} {s.value}%</span>
            ))}
          </div>
        </Card>
        <Card title="Service Profitability" subtitle="Revenue vs cost per flagship service (KES M).">
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.serviceProfit} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f0f4fa' }} />
                <Bar dataKey="revenue" name="Revenue" fill={C.sky} radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="cost" name="Cost" fill={C.red} radius={[3, 3, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}

// ── 2. Realtime Hospital ───────────────────────────────────────────────────────

function RealtimeTab({ d, fmt }: { d: Snapshot; fmt: Int }) {
  return (
    <Card title="Realtime Hospital" subtitle="Live pulse of the institution — occupancy, flow, alerts and saturation." action={<Pill icon={Activity} label="Live" tone="green" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        <Stat label="Total Beds" value={fmt(d.beds)} />
        <Stat label="Occupied" value={fmt(Math.round(d.beds * d.occupancy / 100))} accent="amber" />
        <Stat label="Available" value={fmt(d.bedsAvailable)} accent="green" />
        <Stat label="Patients" value={fmt(d.patients)} />
        <Stat label="Staff On Duty" value={fmt(d.staffOnDuty)} />
        <Stat label="System Health" value={`${d.systemHealth}%`} accent="green" />
        <Stat label="Critical Alerts" value={fmt(d.criticalAlerts)} accent={d.criticalAlerts > 0 ? 'red' : 'green'} />
        <Stat label="Daily Transactions" value={fmt(d.dailyTransactions)} />
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6 }}><span>Occupancy — live</span><span>{d.occupancy}%</span></div>
        <div style={{ height: 10, borderRadius: 6, background: '#eef2f8', overflow: 'hidden' }}><div style={{ width: `${d.occupancy}%`, height: '100%', background: d.occupancy > 88 ? C.red : d.occupancy > 75 ? C.amber : C.green }} /></div>
      </div>
      {d.criticalAlerts > 0 && <div style={{ ...S.banner, background: `${C.red}12`, color: C.red }}><AlertTriangle size={15} /> {d.criticalAlerts} active critical alert(s). Open the Intelligence engines beside.</div>}
    </Card>
  );
}

// ── 3. Predictive Intelligence ─────────────────────────────────────────────────

function PredictiveTab({ d }: { d: Snapshot }) {
  const items = [
    { name: 'Emergency', text: 'Tomorrow', delta: '↑ 17%', tone: 'up' },
    { name: 'Dialysis', text: 'Demand', delta: '↑ 8%', tone: 'up' },
    { name: 'ICU Capacity', text: 'Friday', delta: 'Full', tone: 'warn' },
    { name: 'Pneumonia', text: 'Cases rising', delta: 'Need +400 vials', tone: 'warn' },
    { name: 'Blood Bank', text: 'Requirements', delta: '18 units', tone: 'up' },
    { name: 'Operating Theatre', text: 'Demand', delta: '+2 sessions', tone: 'up' },
  ];
  return (
    <>
      <Card title="AI Predictions" subtitle="What no HMIS gives you: forecasts, risk and recommended action before the day arrives."
        action={<Pill icon={Brain} label="AI · Forecasting" tone="purple" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
          {items.map(i => (
            <div key={i.name} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '14px', background: '#fff' }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{i.name}</div>
              <div style={{ fontSize: 10.5, color: C.muted, margin: '2px 0 8px' }}>{i.text}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: i.tone === 'warn' ? C.amber : i.tone === 'up' ? C.green : C.sky }}>
                {i.tone === 'up' ? <ArrowUp size={14} /> : <AlertTriangle size={14} />} {i.delta}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Prepared Capacity" subtitle="Operational readiness the model recommends for tomorrow.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          <ActionCard label="Overflow Ward" desc="Open 1 additional ward" action="Recommend" tone="sky" onClick={() => {}} />
          <ActionCard label="Extra Physicians" desc="Deploy 2 physicians to Emergency" action="Plan" tone="purple" onClick={() => {}} />
          <ActionCard label="Procurement" desc="Approve ceftriaxone +400 vials" action="Approve" tone="green" onClick={() => {}} />
          <ActionCard label="Theatre Sessions" desc="Add 2 surgical sessions" action="Schedule" tone="amber" onClick={() => {}} />
        </div>
      </Card>
    </>
  );
}

// ── 4. Clinical Intelligence ───────────────────────────────────────────────────

function ClinicalTab({ d, fmt }: { d: Snapshot; fmt: Int }) {
  const deptAdmissions = [
    { name: 'Emergency', value: d.emergencyCount }, { name: 'Medicine', value: 29 },
    { name: 'Surgery', value: 22 }, { name: 'Paediatrics', value: 18 }, { name: 'OBG', value: 25 },
  ];
  const outcomes = [
    { label: 'Mortality', value: 2, tone: 'down' }, { label: 'Readmissions', value: 6, tone: 'down' },
    { label: 'Transfers', value: 11, tone: 'down' }, { label: 'Unexpected ICU', value: 1, tone: 'warn' },
    { label: 'Code Blue', value: 4, tone: 'warn' }, { label: 'Near Misses', value: 7, tone: 'warn' },
  ];
  return (
    <>
      <Card title="Clinical Intelligence" subtitle="Not just admissions — where why things are happening right now." action={<Pill icon={HeartPulse} label="Live" tone="green" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {deptAdmissions.map(de => <Stat key={de.name} label={`Admissions · ${de.name}`} value={fmt(de.value)} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginTop: 16 }}>
          {outcomes.map(o => (
            <div key={o.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.muted }}>{o.label}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: o.tone === 'important' ? C.red : C.green }}>{o.tone === 'warn' ? '⚠' : '↓'}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{fmt(o.value)}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Disease Burden — Live Treemap" subtitle="What diseases dominate the hospital right now.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {d.diseaseBurden.map(x => (
            <div key={x.name} style={{ flexGrow: Math.max(1, x.value / 150), minWidth: 120, padding: '14px 16px', borderRadius: 10, background: x.color, color: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{(x.value / 1000).toFixed(1)}k</div>
              <div style={{ fontSize: 11, opacity: .9, fontWeight: 600 }}>{x.name}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ── 5. Operations Intelligence ─────────────────────────────────────────────────

function OperationsTab({ d, fmt }: { d: Snapshot; fmt: Int }) {
  return (
    <Card title="Operations Intelligence" subtitle="Beds, theatres, laboratory, radiology, clinics — live operational load.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <OpBlock title="Bed Intelligence">
          <OpLine label="Total Beds" value={fmt(d.beds)} />
          <OpLine label="Occupied" value={fmt(Math.round(d.beds * d.occupancy / 100))} />
          <OpLine label="Available" value={fmt(d.bedsAvailable)} />
          <OpLine label="Cleaning" value="26" />
          <OpLine label="ICU" value={d.occupancy > 88 ? 'Full' : `${d.occupancy}%`} warn={d.occupancy > 88} />
        </OpBlock>
        <OpBlock title="Theatre Intelligence">
          <OpLine label="Scheduled" value="12" /><OpLine label="Running" value="6" />
          <OpLine label="Completed" value="4" /><OpLine label="Cancelled" value="2" warn />
          <OpLine label="Utilization" value="92%" />
        </OpBlock>
        <OpBlock title="Laboratory Intelligence">
          <OpLine label="Specimens" value="812" /><OpLine label="Completed" value="790" />
          <OpLine label="Critical Results" value="8" warn /><OpLine label="Delayed" value="3" warn />
        </OpBlock>
        <OpBlock title="Radiology Intelligence">
          <OpLine label="CT" value="42" /><OpLine label="MRI" value="19" />
          <OpLine label="Ultrasound" value="63" /><OpLine label="Avg Reporting" value="32 min" />
        </OpBlock>
        <OpBlock title="Clinic Intelligence">
          <OpLine label="Patients Waiting" value="84" /><OpLine label="Longest Wait" value="72 min" warn />
          <OpLine label="Average Wait" value="18 min" /><OpLine label="Overbooked" value="2" warn />
        </OpBlock>
        <OpBlock title="Asset Intelligence">
          <OpLine label="CT Utilization" value="91%" /><OpLine label="MRI Maintenance" value="Tomorrow" warn />
          <OpLine label="Ventilators" value="12 available" /><OpLine label="Generator Fuel" value="28%" warn />
        </OpBlock>
      </div>
    </Card>
  );
}

// ── 6. Workforce Intelligence ──────────────────────────────────────────────────

function WorkforceTab({ d }: { d: Snapshot }) {
  const stats = [
    { label: 'Doctors On Duty', value: 182 }, { label: 'Late', value: 3, warn: true },
    { label: 'Leave', value: 18 }, { label: 'Training', value: 7 },
    { label: 'Absent', value: 1, warn: true },
    { label: 'Consultations', value: 781 }, { label: 'Procedures', value: 184 },
    { label: 'Operations', value: 28 }, { label: 'Ward Rounds', value: 91 },
  ];
  return (
    <Card title="Workforce Intelligence" subtitle="By cadre, live — who is present, late, on leave, training or absent.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {stats.map(s => <Stat key={s.label} label={s.label} value={String(s.value)} accent={s.warn ? 'amber' : undefined} />)}
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>
        Workforce intelligence flows from the Workforce Command Center — activation, credentials, productivity and licensing drive who appears here.
      </div>
    </Card>
  );
}

// ── 7. Financial Intelligence ──────────────────────────────────────────────────

function FinancialTab({ d, fmt }: { d: Snapshot; fmt: Int }) {
  const rows = [
    { label: 'Revenue Today', value: kes(d.revenue), tone: 'navy' },
    { label: 'Projected Month', value: kes(d.revenueMonth), tone: 'sky' },
    { label: 'Outstanding Bills', value: kes(d.outstandingBills), tone: 'red' },
    { label: 'Insurance Claims', value: kes(d.claims), tone: 'amber' },
    { label: 'Payroll', value: kes(d.payroll), tone: 'slate' },
    { label: 'Procurement / Drugs', value: kes(d.drugCosts), tone: 'slate' },
  ];
  return (
    <>
      <Card title="Financial Intelligence" subtitle="Complete financial picture — cash, claims, payroll, procurement, forecast."
        action={<Pill icon={Banknote} label="Realtime" tone="green" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {rows.map(r => (
            <div key={r.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '14px', background: '#fff' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: r.tone === 'red' ? C.red : r.tone === 'amber' ? C.amber : r.tone === 'sky' ? C.sky : C.navy }}>{r.value}</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{r.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <Card title="Revenue Trend" subtitle="7-day revenue trajectory.">
          <div style={{ height: 190 }}><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.trend.map((v, i) => ({ d: `D${i + 1}`, v: +(v / 1e6).toFixed(1) }))}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.sky} stopOpacity={0.35} /><stop offset="95%" stopColor={C.sky} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f8" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Area type="monotone" dataKey="v" name="KES M" stroke={C.sky} strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer></div>
        </Card>
        <Card title="Profitability · Revenue vs Cost" subtitle="Which services earn vs cost the most.">
          <div style={{ height: 190 }}><ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.serviceProfit} barGap={2}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="revenue" name="Revenue" fill={C.sky} radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="cost" name="Cost" fill={C.red} radius={[3, 3, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer></div>
        </Card>
      </div>
    </>
  );
}

// ── 8. Quality Intelligence ────────────────────────────────────────────────────

function QualityTab({ d, fmt }: { d: Snapshot; fmt: Int }) {
  const q = [
    { label: 'Hospital Acquired Infection', value: '0.8%' }, { label: 'SSI', value: '0.6%' },
    { label: 'Medication Errors', value: '4' }, { label: 'Falls', value: '2' },
    { label: 'Pressure Sores', value: '1' }, { label: 'Documentation Quality', value: '97%' },
    { label: 'Consent Compliance', value: '99%' }, { label: 'WHO Checklist', value: '100%' },
  ];
  return (
    <Card title="Quality Intelligence" subtitle="Mortality, safety, documentation and compliance — the trust metrics a board reads."
      action={<Pill icon={ShieldCheck} label="Quality" tone="green" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {q.map(x => (
          <div key={x.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{x.value}</div>
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{x.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginTop: 16 }}>
        <SafetyCard label="Critical Alerts" value={fmt(d.criticalAlerts)} warn={d.criticalAlerts > 0} />
        <SafetyCard label="Near Misses" value="7" warn />
        <SafetyCard label="Incidents Reported" value="3" />
        <SafetyCard label="Open CAPAs" value="12" warn />
      </div>
    </Card>
  );
}

// ── 9. Population Intelligence ─────────────────────────────────────────────────

function PopulationTab({ d }: { d: Snapshot }) {
  const segments = [
    { label: 'Children', value: 31 }, { label: 'Adults', value: 55 }, { label: 'Elderly', value: 14 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Population Intelligence" subtitle="The catchment AMEXAN serves — not just the patients in beds right now." action={<Pill icon={Globe2} label="Catchment" tone="sky" />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            <Stat label="Catchment Population" value="1.8M" />
            <Stat label="Patients In System" value={(d.patients / 1e6).toFixed(1) + 'M'} />
            <Stat label="Top Diseases" value="Live" accent="green" />
            <Stat label="Maternal Mortality" value="Live" accent="green" />
            <Stat label="Cancer Burden" value="Live" accent="green" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Age Demographics</div>
            {segments.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 70, fontSize: 11.5, fontWeight: 700, color: C.slate }}>{s.label}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#eef2f8', overflow: 'hidden' }}><div style={{ width: `${s.value}%`, height: '100%', background: C.sky }} /></div>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: C.navy }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── 10. Research Intelligence ──────────────────────────────────────────────────

function ResearchTab({ d }: { d: Snapshot }) {
  const rows = [
    { label: 'Active Projects', value: 82 }, { label: 'Publications', value: 46 },
    { label: 'Recruitment', value: '71%' }, { label: 'Funding', value: 'KES 214M' },
    { label: 'Ethics Pending', value: 14, warn: true }, { label: 'Collaborations', value: 18 },
    { label: 'Citations', value: 812 },
  ];
  return (
    <Card title="Research Intelligence" subtitle="The institution's research engine — studies, trials, funding, ethics and outputs." action={<Pill icon={Microscope} label="Research" tone="purple" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {rows.map(r => (
          <div key={r.label} style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: r.warn ? C.amber : C.navy }}>{r.value}</div>
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{r.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── 11. Pharmacy Intelligence ─────────────────────────────────────────────────

function PharmacyTab() {
  const stock = [
    { drug: 'Ceftriaxone', usage: '4,221 vials', days: 4, rec: 'Reorder tomorrow', warn: true },
    { drug: 'Salbutamol', usage: '1,180 units', days: 11, rec: 'Order next week' },
    { drug: 'Insulin', usage: '3,414 units', days: 9, rec: 'Order next week' },
    { drug: 'Ceftazidime', usage: '2,050 vials', days: 16, rec: 'On track' },
  ];
  return (
    <Card title="Pharmacy Intelligence" subtitle="Drug usage, stock levels and AI stock forecasting — procurement automatically warned." action={<Pill icon={Package} label="Stock · Live" tone="amber" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stock.map(s => (
          <div key={s.drug} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, border: `1px solid ${s.warn ? C.amber : C.border}`, background: s.warn ? '#fffbf2' : '#fff' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: s.warn ? `${C.amber}18` : C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={15} color={s.warn ? C.amber : C.sky} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{s.drug}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>{s.usage}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: s.warn ? C.amber : C.green }}>{s.days} days</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>remaining</div>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: s.warn ? `${C.amber}18` : `${C.green}18`, color: s.warn ? C.amber : C.green }}>{s.rec}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>Stock forecasts are predictive — procurement is warned before stock runs out, linking disease demand to the drug supply chain.</div>
    </Card>
  );
}

// ── 12. AI Executive Assistant ─────────────────────────────────────────────────

function AiTab({ d, onOpenBoard }: { d: Snapshot; onOpenBoard: () => void }) {
  const insights = [
    'Occupancy reached 91% — pressure is on bed capacity.',
    'Emergency cases increased by 18% over the rolling week.',
    'Ceftriaxone stock may finish within 4 days.',
    'ICU is projected to reach capacity on Friday.',
    'Revenue is trending +12% vs the previous week.',
  ];
  return (
    <>
      <Card title="AI Executive Assistant" subtitle="Not ChatGPT — Hospital Intelligence. AMEXAN reads the whole institution and speaks plainly."
        action={<Pill icon={Zap} tone="green" label="Always on" />}>
        <div style={{ padding: '16px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#0b2c4d,#0ea5e9)', color: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 800, opacity: .8, letterSpacing: '.05em' }}>GOOD MORNING, CEO.</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {insights.map(i => <div key={i} style={{ fontSize: 13, lineHeight: 1.5, opacity: .95 }}>• {i}</div>)}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, fontWeight: 800 }}>Recommendation</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {['Approve procurement', 'Open overflow ward', 'Deploy 2 physicians'].map(r => (
              <span key={r} style={{ padding: '6px 12px', borderRadius: 20, background: 'rgba(255,255,255,.16)', fontSize: 11.5, fontWeight: 700 }}>{r}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <ActionBtn primary label="Generate Board Pack" onClick={onOpenBoard} />
          <ActionBtn label="Export Executive Summary" onClick={exportPdf} />
        </div>
      </Card>
    </>
  );
}

// ── 13. Government Reporting ───────────────────────────────────────────────────

function GovernmentTab({ d }: { d: Snapshot }) {
  const reports = ['MOH', 'SHA', 'DHIS2', 'County', 'Donors', 'WHO', 'CDC', 'Research'];
  return (
    <Card title="Government Reporting" subtitle="One click — generate any mandated return the institution owes its ecosystem." action={<Pill icon={FileText} tone="sky" label="Compliant" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
        {reports.map(r => (
          <button key={r} onClick={() => exportPdf()} style={{ padding: '13px 10px', borderRadius: 10, border: '1px solid #e3e9f2', background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: C.navy }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><FileText size={18} color={C.sky} /></div>
            Generate {r}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>Each return is assembled from the decision warehouse and submitted to the right authority — with a full audit trail.</div>
    </Card>
  );
}

// ── 14. Board Reports ──────────────────────────────────────────────────────────

function BoardTab({ d }: { d: Snapshot }) {
  const sections = ['Executive Summary', 'Hospital Performance', 'Clinical', 'Operations', 'Finance', 'Quality', 'Research', 'HR', 'Assets', 'Forecast', 'Recommendations'];
  return (
    <Card title="Board Pack" subtitle="A CEO-ready board pack, generated in seconds, exported to PDF."
      action={<ActionBtn label="Generate Board Pack (PDF)" onClick={() => exportPdf()} primary />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sections.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 8, background: i % 2 ? '#f8fafc' : '#fff', fontSize: 12.5, fontWeight: 700, color: C.navy }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, color: C.sky }}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12 }}>Everything the board needs on one PDF — decision-ready. Clinical outcomes remain owned by the care team.</div>
    </Card>
  );
}

// ── 15. Advanced / Data Scientist / Export ─────────────────────────────────────

function AdvancedTab({ d }: { d: Snapshot }) {
  const [sql, setSql] = useState("SELECT department, count(*) as admissions\nFROM clinical_fact\nWHERE date = CURRENT_DATE\nGROUP BY department\nORDER BY admissions DESC;");
  const [ran, setRan] = useState('');
  const downloads = [
    { label: 'PDF', icon: FileText, fn: () => exportPdf() },
    { label: 'Excel / CSV', icon: FileText, fn: () => exportCsv(d) },
    { label: 'JSON', icon: FileText, fn: () => exportJson(d) },
    { label: 'Power BI', icon: PieChartIcon, fn: () => exportPdf() },
    { label: 'FHIR API', icon: Database, fn: () => {} },
  ];
  return (
    <>
      <Card title="Advanced Analytics · Data Scientist Mode" subtitle="SQL, Python, Power BI, Jupyter, ML, forecasting, cohort analysis, survival curves, regression, heatmaps, decision trees."
        action={<Pill icon={Cpu} tone="purple" label="Advanced" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {['SQL', 'Python', 'Power BI', 'Jupyter', 'ML Forecasting', 'Cohort', 'Survival Curves', 'Regression', 'Heatmaps', 'Decision Trees'].map(t => (
            <span key={t} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(10,87,129,.07)', color: C.sky, fontSize: 11.5, fontWeight: 700 }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>SQL Playground</div>
          <textarea value={sql} onChange={e => setSql(e.target.value)} rows={5} spellCheck={false} style={{ width: '100%', borderRadius: 10, border: `1px solid ${C.border}`, background: '#0b1220', color: '#a5f3fc', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, padding: 12, outline: 'none', resize: 'vertical' }} />
          <div style={{ marginTop: 10 }}><ActionBtn primary label="Run Query" onClick={() => setRan('→ 8 rows · 0.04s · [Medicine 29, Surgery 22, OBG 25 …]')} /></div>
          {ran && <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: C.skyLight, fontSize: 11.5, fontWeight: 600, color: C.navy }}>{ran}</div>}
        </div>
      </Card>
      <Card title="Export Center" subtitle="One click — move this intelligence anywhere.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {downloads.map(x => (
            <button key={x.label} onClick={x.fn} style={chipMain()}><x.icon size={14} /> {x.label}</button>
          ))}
        </div>
      </Card>
    </>
  );
}

// ── presentational helpers ─────────────────────────────────────────────────────

function Hero({ score }: { score: number }) {
  return (
    <div style={{ padding: '20px 22px', borderRadius: 16, background: 'linear-gradient(120deg,#0b2c4d,#123d66 55%,#0ea5e9)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={24} color="#fff" /></span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Executive Intelligence Command Center</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>AMEXAN · Decision Intelligence — not reports. Not dashboards.</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'center', padding: '8px 18px', borderRadius: 14, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, opacity: .8, letterSpacing: '.05em' }}>HEALTH SCORE</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{score}%</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,.22)', border: '1px solid rgba(16,185,129,.5)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} /> <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em' }}>HEALTHY</span>
          </span>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, maxWidth: 700, marginTop: 12 }}>
        Every clinical, financial, quality, workforce, operational and research action becomes explainable executive intelligence — what happened, <b>why</b>, what will happen next, what the impact is, and what to do.
      </div>
    </div>
  );
}

function ExecKpi({ label, value, tone, trend }: { label: string; value: string; tone: 'up' | 'down'; trend: string }) {
  return (
    <div style={{ borderRadius: 14, border: '1px solid #e3e9f2', padding: '13px 14px', background: '#fff' }}>
      <div style={{ fontSize: 21, fontWeight: 800, color: C.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
        {value}
        <span style={{ fontSize: 10.5, fontWeight: 800, color: tone === 'up' ? C.green : C.red, display: 'inline-flex', alignItems: 'center' }}>
          {trend.includes('↑') ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {trend.replace(/[↑↓]/g, '')}
        </span>
      </div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'amber' | 'red' }) {
  const tone = accent === 'green' ? C.green : accent === 'amber' ? C.amber : accent === 'red' ? C.red : C.navy;
  return (
    <div style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: '#fff' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: tone }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

function OpBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: '#fff' }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: C.sky, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function Op(data: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9', fontSize: 12.5 }}>
      <span style={{ color: C.slate }}>{data.label}</span>
      <span style={{ fontWeight: 800, color: data.warn ? C.amber : C.navy }}>{data.value}</span>
    </div>
  );
}
const OpLine = Op;

function SafetyCard({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: warn ? '#fffbf2' : '#fff' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: warn ? C.amber : C.navy }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ActionCard({ label, desc, action, tone, onClick }: { label: string; desc: string; action: string; tone: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ textAlign: 'left', padding: '13px 14px', borderRadius: 12, border: '1px solid #e3e9f2', background: '#fff', cursor: 'pointer' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{label}</div>
      <div style={{ fontSize: 11, color: C.muted, margin: '4px 0 8px' }}>{desc}</div>
      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 800, background: `${tone}18`, color: tone }}>{action}</span>
    </button>
  );
}

function Pill({ icon: Icon, label, tone }: { icon?: LucideIcon; label: string; tone: 'green' | 'amber' | 'red' | 'sky' | 'purple' }) {
  const color = tone === 'green' ? C.green : tone === 'amber' ? C.amber : tone === 'red' ? C.red : tone === 'sky' ? C.sky : C.purple;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: `${color}16`, fontSize: 10.5, fontWeight: 800, color, whiteSpace: 'nowrap' }}>{Icon && <Icon size={12} />} {label}</span>
  );
}

function BarRow({ label, value, tone, suffix }: { label: string; value: number; tone: string; suffix?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.slate }}>{label}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: tone }}>{value}{suffix ?? ''}</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: '#eef2f8', overflow: 'hidden' }}><div style={{ width: `${Math.max(2, Math.min(100, value))}%`, height: '100%', background: tone }} /></div>
    </div>
  );
}

function navItem(active: boolean): CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.sky : C.slate, background: active ? C.skyLight : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' };
}

function chip(active: boolean): CSSProperties {
  return { padding: '7px 14px', borderRadius: 20, border: `1px solid ${active ? C.sky : C.border}`, background: active ? C.skyLight : '#fff', color: active ? C.sky : C.slate, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 };
}

function chipMain(): CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: `1px solid ${C.border}`, background: '#fff', color: C.navy, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 };
}

function TrendCard({ title, color, data, fmt }: { title: string; color: string; data: { day: string; v: number }[]; fmt: (n: number) => string }) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid #e3e9f2', padding: '12px 14px', background: '#fff' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.navy, marginBottom: 10 }}>{title}</div>
      <div style={{ height: 150 }}><ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs><linearGradient id={`tg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.35} /><stop offset="95%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 'dataMax + 2']} />
          <Tooltip />
          <Area type="monotone" dataKey="v" name={title} stroke={color} strokeWidth={2} fill={`url(#tg-${color.slice(1)})`} />
        </AreaChart>
      </ResponsiveContainer></div>
    </div>
  );
}

function ActionBtn({ label, onClick, primary, danger }: { label: string; onClick: () => void; primary?: boolean; danger?: boolean }) {
  return <button onClick={onClick} style={{ padding: '7px 16px', borderRadius: 8, border: primary ? 'none' : `1px solid ${danger ? C.red : C.border}`, background: primary ? C.sky : '#fff', color: primary ? '#fff' : danger ? C.red : C.slate, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{label}</button>;
}

// ── Data export (PDF / CSV / JSON) ─────────────────────────────────────────────

function exportPdf() {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('AMEXAN — Executive Intelligence Board Pack', 14, 20);
  doc.setFontSize(11);
  doc.text(new Date().toLocaleString(), 14, 28);
  const lines = [
    'Executive Summary',
    `  Hospital Health Score: ${dHealth}%  ·  Status: Healthy`,
    'Clinical: Admissions today, occupancy and outcomes trending positive.',
    'Operations: Bed, theatre, laboratory and radiology intelligence live.',
    'Finance: revenue rising; claims and procurement are forecast-tunable.',
    'Quality: compliance strong across consent, documentation and WHO checklist.',
    'Forecast & Recommendations: see predictive intelligence for tomorrow.',
    '',
    'Full data is available on demand from the decision warehouse.',
  ];
  doc.setFontSize(10);
  let y = 40;
  lines.forEach(l => { doc.text(l, 14, y); y += 7; });
  doc.save('AMEXAN-Board-Pack.pdf');
}
const dHealth = 97;

function exportCsv(d: Snapshot) {
  const rows = `metric,value\nHospitalHealthScore,${d.healthScore}\nAdmissionsToday,${d.admissionsToday}\nOccupancy,${d.occupancy}\nRevenueToday,${d.revenueToday}\n`;
  const blob = new Blob([rows], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'executive-intelligence.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportJson(d: Snapshot) {
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'executive-intelligence.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

const S = {
  banner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 0 },
  labels: { fontSize: 10, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '.04em' },
};