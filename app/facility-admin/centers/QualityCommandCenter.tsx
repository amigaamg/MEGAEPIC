'use client';

// ════════════════════════════════════════════════════════════════════════════
// AMEXAN — Clinical Quality, Patient Safety & Governance Command Center (QPSGC)
//
// One of the highest-level constitutional engines in the hospital. This is NOT a
// "Quality Dashboard" that counts deaths. Its mission:
//
//   Continuously detect, learn from, prevent, and improve every clinical failure
//   while strengthening patient safety, governance, accreditation, and continuous
//   quality improvement — transforming the hospital into a High Reliability
//   Organization (HRO).
//
// Every patient interaction must answer four questions:
//   • Was care safe?     • Was care timely?
//   • Was care effective? • Was care improved?
//
// Quality is never retrospective. It is continuous.
// ════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Activity, Award, Brain, CheckCircle2,
  ClipboardCheck, Clock, Crown, FileText, FlaskConical, HeartPulse, Layers,
  Megaphone, Pill as PillIcon, Radar as RadarIcon, RefreshCw, ShieldCheck, Siren,
  Stethoscope, Target, TrendingDown, TrendingUp, Users, Zap, type LucideIcon,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar,
  RadarChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, Treemap,
  XAxis, YAxis, ZAxis,
} from 'recharts';
import { type FacilityAdminModel, type QualityMetrics } from '@/lib/amexan/facility';
import { C } from '../ui';
const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const tooltipStyle = { borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, background: '#fff' };

// ── Shared primitives ────────────────────────────────────────────────────────

function Pill({ icon: Icon, label, tone }: { icon?: LucideIcon; label: string; tone: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: `${tone}22`, color: tone, fontSize: 11, fontWeight: 700 }}>{Icon ? <Icon size={12} /> : null} {label}</span>;
}

function Card({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
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

function MetricChip({ label, value, expected, trend, risk }: {
  label: string; value: string | number;
  expected?: string | number; trend?: 'up' | 'down'; risk?: 'high' | 'med' | 'low';
}) {
  const riskTone = risk === 'high' ? C.red : risk === 'med' ? C.amber : C.green;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, margin: '4px 0 2px' }}>{value}</div>
      {expected !== undefined && <div style={{ fontSize: 11, color: C.slate }}>Expected <b>{expected}</b></div>}
      {trend && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, color: trend === 'up' ? C.green : C.red, fontWeight: 700 }}>
        {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {trend === 'up' ? 'Improving' : 'Rising'}
      </div>}
      {risk && <div style={{ marginTop: 6, padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${riskTone}18`, color: riskTone, display: 'inline-block' }}>AI Risk · {risk.toUpperCase()}</div>}
    </div>
  );
}

function BarRow({ label, value, tone, pct }: { label: string; value: string | number; tone: string; pct?: number }) {
  const p = pct ?? Number(value) ?? 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.slate, marginBottom: 3 }}>
        <span>{label}</span><span style={{ fontWeight: 700, color: C.navy }}>{value}</span>
      </div>
      <div style={{ height: 7, background: '#eef2f7', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, p)}%`, background: tone, borderRadius: 6 }} />
      </div>
    </div>
  );
}

function Gauge({ value, label, color = C.sky, target = 100 }: { value: number; label: string; color?: string; target?: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const c = Math.PI * 55;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{label}</div>
      <svg width={140} height={120} viewBox="0 0 140 120">
        <path d="M 15 105 A 55 55 0 0 1 125 105" fill="none" stroke="#e8eef5" strokeWidth={14} strokeLinecap="round" />
        <path d="M 15 105 A 55 55 0 0 1 125 105" fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${(c * pct / 100)} ${c}`} />
      </svg>
      <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: -24 }}>{value}%</div>
    </div>
  );
}

function Heatmap({ data }: { data: { day: string; hours: { h: string; v: number }[] }[] }) {
  const hours = data[0]?.hours ?? [];
  const max = Math.max(1, ...data.flatMap(d => d.hours.map(h => h.v)));
  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
        <div style={{ width: 52 }} />
        {hours.map(hh => <div key={hh.h} style={{ flex: 1, fontSize: 9, color: C.muted, textAlign: 'center' }}>{hh.h}</div>)}
      </div>
      {data.map(d => (
        <div key={d.day} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <div style={{ width: 52, fontSize: 10, color: C.muted, lineHeight: '18px' }}>{d.day}</div>
          {d.hours.map((cell, i) => {
            const alpha = 0.15 + (cell.v / max) * 0.85;
            const color = cell.v > max * 0.7 ? C.red : cell.v > max * 0.4 ? C.amber : C.sky;
            return <div key={i} style={{ flex: 1, height: 18, borderRadius: 3, background: `${color}${Math.round(alpha * 255).toString(16)}` }} />;
          })}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
      <span style={{ color: C.slate }}>{label}</span><b style={{ color: tone ?? C.navy }}>{value}</b>
    </div>
  );
}

function TreemapBlock({ name, x, y, width, height, index }: { name: string; x: number; y: number; width: number; height: number; index: number }) {
  const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#6366f1', '#14b8a6'];
  const show = width > 34 && height > 20;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4} fill={colors[index % colors.length]} opacity={0.9} />
      {show && <text x={x + 4} y={y + 14} fontSize={11} fill="#fff" fontWeight={700}>{name}</text>}
    </g>
  );
}

// ── Deterministic analytics data ─────────────────────────────────────────────

function compositeTrend() { return MONTHS.map((m, i) => ({ m, score: Math.round((88 + i * 0.7) * 10) / 10 })); }
function mortalityTrend() { return MONTHS.map((m, i) => ({ m, deaths: 15 - ((i % 4) + (i % 3) * 2), expected: 9 })); }
function ssiMonthly() { return MONTHS.map((m, i) => ({ m, deep: i % 2, sup: 2 + (i % 3) })); }
function readmissionTrend() { return MONTHS.map((m, i) => ({ m, v: Math.round((9 - i * 0.2) * 10) / 10 })); }
function pressureTrend() { return MONTHS.map((m, i) => ({ m, v: Math.round((4 - i * 0.15) * 10) / 10 })); }
function haiData() {
  return [
    { name: 'CLABSI', rate: 1.2, target: 2 }, { name: 'CAUTI', rate: 2.4, target: 3 },
    { name: 'VAP', rate: 1.1, target: 1.5 }, { name: 'HAP', rate: 5.2, target: 6 },
    { name: 'MDRO', rate: 8, target: 9 }, { name: 'C.diff', rate: 3, target: 5 },
  ];
}
function sentimentData() { return [{ name: 'Positive', value: 58 }, { name: 'Neutral', value: 26 }, { name: 'Negative', value: 16 }]; }
function safetyEvents() {
  return [
    { name: 'Medication', value: 34 }, { name: 'Falls', value: 24 }, { name: 'Infection', value: 18 },
    { name: 'Mortality', value: 8 }, { name: 'Other', value: 22 },
  ];
}
function fallsHeat() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22'];
  return days.map((day, di) => ({
    day,
    hours: hours.map((h) => ({ h, v: Math.round(((Math.sin(di * 2 + Number(h) * 0.4) + 1.4) * 1.6) * 10) / 10 })),
  }));
}

// ── Department roster ────────────────────────────────────────────────────────

function deptNames(model: FacilityAdminModel): string[] {
  const n = (model.services?.map((s) => s.name).filter(Boolean) ?? []);
  const base = ['General Surgery', 'Orthopedics', 'Neurosurgery', 'OBG', 'Urology', 'ENT', 'Plastic Surgery', 'Cardiology'];
  return n.length ? n.slice(0, 10) : base;
}

// ════════════════════════════════════════════════════════════════════════════
// MODULE REGISTRY
// ════════════════════════════════════════════════════════════════════════════

type ModuleId =
  | 'executive' | 'safety' | 'mortality' | 'morbidity' | 'ssi' | 'hai'
  | 'medication' | 'nearmiss' | 'falls' | 'pressure' | 'readmissions'
  | 'complaints' | 'feedback' | 'audits' | 'accreditation' | 'governance'
  | 'rca' | 'capa' | 'meetings' | 'ai' | 'reports';

const MODULES: { id: ModuleId; label: string; icon: LucideIcon; group: string }[] = [
  { id: 'executive', label: 'Executive Quality', icon: Crown, group: 'Command' },
  { id: 'safety', label: 'Patient Safety', icon: ShieldCheck, group: 'Command' },

  { id: 'mortality', label: 'Mortality', icon: Siren, group: 'Clinical Quality' },
  { id: 'morbidity', label: 'Morbidity', icon: HeartPulse, group: 'Clinical Quality' },
  { id: 'ssi', label: 'Surgical Site Infection', icon: Stethoscope, group: 'Clinical Quality' },
  { id: 'hai', label: 'Hosp. Acquired Infection', icon: FlaskConical, group: 'Clinical Quality' },
  { id: 'medication', label: 'Medication Safety', icon: PillIcon, group: 'Clinical Quality' },
  { id: 'nearmiss', label: 'Near Misses', icon: Zap, group: 'Clinical Quality' },
  { id: 'falls', label: 'Falls', icon: Activity, group: 'Clinical Quality' },
  { id: 'pressure', label: 'Pressure Injuries', icon: Layers, group: 'Clinical Quality' },
  { id: 'readmissions', label: 'Readmissions', icon: RefreshCw, group: 'Clinical Quality' },

  { id: 'complaints', label: 'Complaints', icon: Megaphone, group: 'Experience' },
  { id: 'feedback', label: 'Patient Experience', icon: HeartPulse, group: 'Experience' },

  { id: 'audits', label: 'Clinical Audits', icon: ClipboardCheck, group: 'Governance' },
  { id: 'accreditation', label: 'Accreditation', icon: Award, group: 'Governance' },
  { id: 'governance', label: 'Clinical Governance', icon: ShieldCheck, group: 'Governance' },
  { id: 'rca', label: 'Root Cause Analysis', icon: RadarIcon, group: 'Governance' },
  { id: 'capa', label: 'Corrective & Preventive', icon: Target, group: 'Governance' },
  { id: 'meetings', label: 'Executive Meetings', icon: Users, group: 'Governance' },

  { id: 'ai', label: 'AI Quality Intelligence', icon: Brain, group: 'Intelligence' },
  { id: 'reports', label: 'Executive Reports', icon: FileText, group: 'Intelligence' },
];

const GROUPS = ['Command', 'Clinical Quality', 'Experience', 'Governance', 'Intelligence'];

// ════════════════════════════════════════════════════════════════════════════
// MAIN CENTER
// ════════════════════════════════════════════════════════════════════════════

export function QualityCommandCenter({ model, onPatch }: { model: FacilityAdminModel; onPatch: (patch: Partial<QualityMetrics>) => void }) {
  const [module, setModule] = useState<ModuleId>('executive');
  const depts = deptNames(model);
  const q = model.quality;

  const patch = (next: Partial<QualityMetrics>) => onPatch(next);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Masthead */}
      <div style={{ background: 'linear-gradient(120deg,#0b2c4d,#0e5a8a)', borderRadius: 18, padding: '20px 22px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ position: 'absolute', right: 60, top: 40, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={22} color="#22d3ee" />
          <span style={{ fontSize: 15, fontWeight: 800 }}>Clinical Quality, Patient Safety &amp; Governance Command Center</span>
        </div>
        <p style={{ fontSize: 12, color: '#bfdbfe', margin: '8px 0 0', maxWidth: 780, lineHeight: 1.5 }}>
          A constitutional engine, not a dashboard. We detect, learn from, prevent and improve every clinical failure —
          transforming this hospital into a High Reliability Organization. Quality is continuous, never retrospective.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <Pill icon={CheckCircle2} label="Safe" tone="#22d3ee" />
          <Pill icon={Clock} label="Timely" tone="#22d3ee" />
          <Pill icon={Zap} label="Effective" tone="#22d3ee" />
          <Pill icon={TrendingUp} label="Improved" tone="#22d3ee" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <aside style={{ width: 238, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 8px', maxHeight: 'calc(100vh - 190px)', overflowY: 'auto' }}>
          {GROUPS.map(g => (
            <div key={g} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '6px 10px' }}>{g}</div>
              {MODULES.filter(m => m.group === g).map(m => {
                const Icon = m.icon;
                const active = module === m.id;
                return (
                  <button key={m.id} onClick={() => { setModule(m.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 8, border: 'none', background: active ? C.skyLight : 'transparent', color: active ? C.sky : C.slate, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', textAlign: 'left' }}>
                    <Icon size={15} /> {m.label}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Active module */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {module === 'executive' && <Executive depts={depts} />}
          {module === 'safety' && <Safety />}
          {module === 'mortality' && <Mortality />}
          {module === 'morbidity' && <Morbidity />}
          {module === 'ssi' && <SSI depts={depts} />}
          {module === 'hai' && <HAI />}
          {module === 'medication' && <Medication q={q} onPatch={patch} />}
          {module === 'nearmiss' && <NearMiss />}
          {module === 'falls' && <Falls />}
          {module === 'pressure' && <Pressure />}
          {module === 'readmissions' && <Readmissions />}
          {module === 'complaints' && <Complaints />}
          {module === 'feedback' && <PatientExperience />}
          {module === 'audits' && <Audits />}
          {module === 'accreditation' && <Accreditation />}
          {module === 'governance' && <Governance />}
          {module === 'rca' && <RCA />}
          {module === 'capa' && <CAPA />}
          {module === 'meetings' && <Meetings />}
          {module === 'ai' && <Ais />}
          {module === 'reports' && <Reports />}
        </main>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1. EXECUTIVE LANDING
// ════════════════════════════════════════════════════════════════════════════

function Executive({ depts }: { depts: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Executive wall */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
        {[
          { label: 'Mortality', value: 12, tone: C.red, note: '2 preventable' },
          { label: 'SSI Rate', value: '1.9%', tone: C.amber, note: 'Target <2%' },
          { label: 'Readmissions', value: '8%', tone: C.amber, note: 'Target <5%' },
          { label: 'Med Errors', value: '21', tone: C.sky, note: 'Trend: ↓18%' },
          { label: 'Falls', value: 14, tone: C.navy, note: '2 with injury' },
          { label: 'Complaints', value: 27, tone: C.purple, note: 'Sentiment mixed' },
        ].map(c => (
          <div key={c.label} style={{ border: `1px solid ${C.border}`, borderRadius: 14, background: C.card, padding: 14, boxShadow: '0 2px 8px rgba(11,44,77,.04)' }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.tone, margin: '4px 0' }}>{c.value}</div>
            <div style={{ fontSize: 11, color: C.slate }}>{c.note}</div>
          </div>
        ))}
      </div>

      {/* Context KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Hospital Quality Index" value="96.4%" expected="Target 95%" trend="up" risk="low" />
        <MetricChip label="Patient Safety Score" value="98%" expected="Target 97%" trend="up" risk="low" />
        <MetricChip label="Accreditation Status" value="COMPLIANT" risk="low" />
        <MetricChip label="Open High-Risk Events" value="2" risk="high" />
        <MetricChip label="Quality Alerts" value="3" risk="med" />
        <MetricChip label="AI Improvement Opportunities" value="9" risk="med" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Organizational Health Gauge">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 6 }}>
            <Gauge value={96.4} label="Quality Index" color={C.green} target={100} />
            <Gauge value={98} label="Patient Safety" color={C.sky} target={100} />
          </div>
        </Card>
        <Card title="Quality Trend (12 months)" subtitle="Rolling composite quality scoreline">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={compositeTrend()}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.sky} stopOpacity={.3} /><stop offset="100%" stopColor={C.sky} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="score" stroke={C.sky} strokeWidth={2} fill="url(#gc)" name="Quality Index" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Department Quality Radar" subtitle="Quality scores across specialties">
          <RadarScore depts={depts} />
        </Card>
        <Card title="Performance vs Volume" subtitle="Bubble: quality score vs monthly procedures">
          <ResponsiveContainer width="100%" height={210}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="v" name="Volume" type="number" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <YAxis dataKey="q" name="Quality" type="number" domain={[70, 100]} tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <ZAxis dataKey="d" range={[60, 300]} name="Procedures" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
              <Scatter data={depts.map((d, i) => ({ dept: d, v: 40 + i * 38, q: 78 + ((i * 7) % 20), d: 60 + (i % 6) * 40 }))} fill={C.sky} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function RadarScore({ depts }: { depts: string[] }) {
  const labels = depts.length ? depts.slice(0, 6) : ['GS', 'OR', 'NS', 'OBG', 'UR', 'ENT'];
  const data = labels.map((d, i) => ({ subject: d.length > 10 ? d.slice(0, 10) : d, score: 78 + ((i * 7) % 20), fullMark: 100 }));
  return (
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data}>
        <PolarGrid stroke="#eef2f7" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: C.muted }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: C.muted }} />
        <Radar dataKey="score" stroke={C.sky} fill={C.sky} fillOpacity={.4} name="Quality score" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. PATIENT SAFETY
// ════════════════════════════════════════════════════════════════════════════

function Safety() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Patient Safety Score" value="98%" expected="Target 97%" trend="up" risk="low" />
        <MetricChip label="Open High-Risk Events" value="2" risk="high" />
        <MetricChip label="Process-of-Care Measures" value="92%" trend="up" risk="low" />
        <MetricChip label="Culture of Safety" value="Green" risk="low" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Safety Pyramid (Swiss Cheese)" subtitle="Latent failures reach harm only when all layers fail.">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, minHeight: 120 }}>
            {[4, 3, 2, 1].map(l => (
              <div key={l} style={{ width: 56 + l * 16, height: 30, borderRadius: 6, background: l === 1 ? `${C.red}22` : `${C.sky}14`, border: `1px solid ${l === 1 ? C.red : C.sky}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: l === 1 ? C.red : C.sky, fontWeight: 700 }}>{l}</div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 8, fontSize: 11, color: C.muted }}>Harm<br />Reached</div>
          </div>
        </Card>
        <Card title="Event Types" subtitle="Distribution of patient safety events">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={safetyEvents()} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                {['#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6', '#10b981'].map(c => <Cell key={c} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. MORTALITY INTELLIGENCE
// ════════════════════════════════════════════════════════════════════════════

function Mortality() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        <MetricChip label="Deaths" value="12" expected="9" trend="up" risk="high" />
        <MetricChip label="Risk Adjusted" value="10" risk="med" />
        <MetricChip label="Preventable" value="2" risk="high" />
        <MetricChip label="Reviewed" value="11" trend="up" />
        <MetricChip label="Pending Review" value="1" risk="med" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Mortality Trend" subtitle="12-month rolling deaths vs expected">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mortalityTrend()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="deaths" stroke={C.red} strokeWidth={2} name="Deaths" />
              <Line type="monotone" dataKey="expected" stroke={C.muted} strokeDasharray="4 4" name="Expected" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Breakdown" subtitle="Deaths by department">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['Medicine', 4], ['Surgery', 3], ['ICU', 2], ['Neuro', 2], ['Other', 1]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ width: 90, color: C.slate }}>{l}</span>
                <div style={{ height: 14, width: `${(v as number) * 12}%`, background: C.red, borderRadius: 4 }} />
                <b>{v}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Mortality Heatmap" subtitle="Hours × days — when deaths cluster">
          <Heatmap data={fallsHeat()} />
        </Card>
        <Card title="What AMEXAN Found" subtitle="Continuous learning from every mortality review">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Late sepsis recognition', 'Delayed ICU transfer', 'Late antibiotic administration'].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: `${C.red}10`, border: `1px solid ${C.red}22`, fontSize: 12.5, fontWeight: 600, color: C.navy }}>
                <Brain size={15} color={C.red} /> {s}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. MORBIDITY INTELLIGENCE
// ════════════════════════════════════════════════════════════════════════════

function Morbidity() {
  const morbs = [
    { name: 'Bleeding', value: 9 }, { name: 'Wound breakdown', value: 7 }, { name: 'AKI', value: 6 },
    { name: 'ARDS', value: 3 }, { name: 'Stroke', value: 2 }, { name: 'DVT', value: 4 },
    { name: 'PE', value: 2 }, { name: 'Cardiac Arrest', value: 4 }, { name: 'Delirium', value: 11 },
    { name: 'Pressure Injuries', value: 8 },
  ];
  const [sel, setSel] = useState(0);
  const root: [string, string][] = [
    ['Incidence', '9 this month'],
    ['Trend', '↑ 3% year-on-year'],
    ['Root causes', 'Timing antibiotics · long theatre duration · diabetes'],
    ['Improvement', 'Bundle compliance +8% since last quarter'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Total Complications" value="56" trend="up" risk="med" />
        <MetricChip label="Complication Rate" value="4.2%" expected="Target <5%" trend="up" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Complications" subtitle="Click a complication for root-cause insight">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
            {morbs.map((m, i) => (
              <button key={m.name} onClick={() => setSel(i)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${sel === i ? C.sky : C.border}`, background: sel === i ? C.skyLight : '#fff', fontSize: 11, fontWeight: 600, color: C.navy }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{m.value}</div>
                <div>{m.name}</div>
              </button>
            ))}
          </div>
        </Card>
        <Card title={morbs[sel].name} subtitle="Root-cause analysis of selected complication">
          {root.map(([k, v]) => (
            <div key={k} style={{ padding: '9px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${C.border}`, marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. SURGICAL SITE INFECTION
// ════════════════════════════════════════════════════════════════════════════

function SSI({ depts }: { depts: string[] }) {
  const defaults = [
    { d: 'General Surgery', cases: 312, ssi: 6, deep: 2, sup: 4 },
    { d: 'Orthopedics', cases: 214, ssi: 8, deep: 2, sup: 6 },
    { d: 'Neurosurgery', cases: 98, ssi: 2, deep: 1, sup: 1 },
    { d: 'OBG', cases: 260, ssi: 3, deep: 0, sup: 3 },
    { d: 'Urology', cases: 140, ssi: 2, deep: 1, sup: 1 },
    { d: 'ENT', cases: 80, ssi: 1, deep: 0, sup: 1 },
    { d: 'Plastic Surgery', cases: 64, ssi: 1, deep: 1, sup: 0 },
  ];
  const rows = defaults.map((r, i) => i < depts.length ? { ...r, d: depts[i] } : r);
  const [sel, setSel] = useState(0);
  const cur = rows[sel];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="SSI Rate" value="1.9%" expected="<2%" trend="up" risk="med" />
        <MetricChip label="Cases" value={rows.reduce((a, r) => a + r.cases, 0)} />
        <MetricChip label="Deep SSI" value={rows.reduce((a, r) => a + r.deep, 0)} risk="med" />
        <MetricChip label="Superficial" value={rows.reduce((a, r) => a + r.sup, 0)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {rows.map((r, i) => (
          <button key={r.d} onClick={() => setSel(i)} style={{ padding: 12, borderRadius: 12, border: `1px solid ${sel === i ? C.sky : C.border}`, background: sel === i ? '#fff' : '#f8fafc', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{r.d}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.red }}>{r.ssi}</div>
            <div style={{ fontSize: 10, color: C.muted }}>{r.cases} cases</div>
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title={`${cur.d} — SSI Detail`} subtitle="Deep vs superficial, with likely drivers">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <InfoRow label="Cases" value={cur.cases} />
            <InfoRow label="SSI" value={cur.ssi} tone={C.red} />
            <InfoRow label="Deep" value={cur.deep} tone={C.red} />
            <InfoRow label="Superficial" value={cur.sup} tone={C.amber} />
            <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: `${C.amber}10`, border: `1px solid ${C.amber}22` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: 'uppercase', marginBottom: 4 }}>Likely causes</div>
              {['Antibiotic timing', 'Implant', 'Long theatre duration', 'Diabetes'].map(c => <div key={c} style={{ fontSize: 11.5, color: C.navy }}>• {c}</div>)}
            </div>
          </div>
        </Card>
        <Card title="SSI Trend" subtitle="Deep + superficial by month">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ssiMonthly()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="deep" stackId="a" fill={C.red} name="Deep" />
              <Bar dataKey="sup" stackId="a" fill={C.amber} name="Superficial" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. HOSPITAL ACQUIRED INFECTION
// ════════════════════════════════════════════════════════════════════════════

function HAI() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
        {[
          ['CLABSI', '1.2/1000d', '2.0', 0], ['CAUTI', '2.4/1000d', '3.0', 1],
          ['VAP', '1.1/1000d', '1.5', 1], ['HAP', '5.2%', '<6%', 0],
          ['MDRO', '8 cases', '<10', 1], ['C. difficile', '3 cases', '<5', 0],
        ].map(([n, r, t, met]) => (
          <div key={n as string} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: C.muted }}>{n}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: '4px 0' }}>{r}</div>
            <div style={{ fontSize: 11, color: C.slate }}>Target {t} · <span style={{ color: met ? C.green : C.slate }}>{met ? 'met' : 'watch'}</span></div>
          </div>
        ))}
      </div>
      <Card title="Infection-Control Module" subtitle="Device-associated infection density (per 1,000 device days)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={haiData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rate" fill={C.purple} name="Rate /1000d" />
            <Bar dataKey="target" fill={C.green} name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. MEDICATION SAFETY
// ════════════════════════════════════════════════════════════════════════════

function Medication({ q, onPatch }: { q: QualityMetrics; onPatch: (p: Partial<QualityMetrics>) => void }) {
  const cats = [
    { name: 'Wrong Drug', v: 3 }, { name: 'Wrong Dose', v: 5 }, { name: 'Wrong Route', v: 2 },
    { name: 'Wrong Time', v: 4 }, { name: 'Duplicate Therapy', v: 2 }, { name: 'Allergy Override', v: 1 },
    { name: 'Look-Alike Sound-Alike', v: 2 }, { name: 'Missed Dose', v: 5 },
  ];
  const total = cats.reduce((a, c) => a + c.v, 0) || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MetricChip label="Medication Errors (month)" value={total} expected="Down 18% YoY" trend="up" risk="med" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Error Categories" subtitle="Every error type, tracked separately">
          {cats.map(c => <BarRow key={c.name} label={c.name} value={c.v} pct={(c.v / total) * 100} tone={C.sky} />)}
        </Card>
        <Card title="Medication Errors Treemap" subtitle="Relative surface = frequency">
          <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={cats.map(c => ({ name: c.name, size: c.v }))} dataKey="size" aspectRatio={4 / 3} stroke="#fff" content={TreemapBlock} />
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card title="AI Detection" subtitle="Pattern watch, surfaced continuously">
        <div style={{ padding: '10px 12px', borderRadius: 10, background: `${C.sky}10`, border: `1px solid ${C.sky}22`, fontSize: 12, fontWeight: 600, color: C.navy }}>
          Repeated Ceftriaxone overdosing detected in Pediatrics — <button style={{ border: 'none', background: 'transparent', color: C.sky, fontWeight: 700, cursor: 'pointer' }} onClick={() => onPatch({ medicationErrors: (q.medicationErrors || 0) + 1 })}>evaluate</button>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. NEAR MISSES
// ════════════════════════════════════════════════════════════════════════════

function NearMiss() {
  const events = [
    'Wrong patient detected before surgery',
    'Wrong blood prevented',
    'Medication intercepted',
    'Specimen relabeled',
    'Fall risk identified pre-transfer',
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Near Misses (month)" value="18" trend="up" risk="low" />
        <MetricChip label="Intercepted before harm" value="18" trend="up" />
        <MetricChip label="Reaching the patient" value="0" risk="low" />
      </div>
      <Card title="The Hospital Learned" subtitle="Every near miss is a tuition-free lesson in safety.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map(e => (
            <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${C.border}` }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: `${C.green}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={15} color={C.green} /></span>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.navy }}>{e}</span>
              <Pill icon={CheckCircle2} label="Prevented" tone={C.green} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. FALLS
// ════════════════════════════════════════════════════════════════════════════

function Falls() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Falls" value="14" trend="up" />
        <MetricChip label="With injury" value="2" risk="med" />
        <MetricChip label="No injury" value="12" trend="up" />
        <MetricChip label="High-risk patients" value="26" />
        <MetricChip label="Most common time" value="Night shift" />
      </div>
      <Card title="Falls Heatmap" subtitle="When falls happen — hour of day × day of week">
        <Heatmap data={fallsHeat()} />
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 10. PRESSURE INJURIES
// ════════════════════════════════════════════════════════════════════════════

function Pressure() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
        {[
          ['Stage I', 9] as const, ['Stage II', 4] as const, ['Stage III', 2] as const, ['Stage IV', 1] as const,
          ['Present on admission', 12] as const, ['Hospital acquired', 16] as const,
        ].map(([l, v]) => <MetricChip key={l} label={l} value={v} />)}
      </div>
      <Card title="Pressure Injury Trend" subtitle="Hospital-acquired rate per 1,000 bed days">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={pressureTrend()}>
            <defs><linearGradient id="pc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.purple} stopOpacity={.3} /><stop offset="100%" stopColor={C.purple} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="v" stroke={C.purple} strokeWidth={2} fill="url(#pc)" name="HAPI per 1000" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 11. READMISSIONS
// ════════════════════════════════════════════════════════════════════════════

function Readmissions() {
  const reasons = [
    { name: 'Medication', v: 24 }, { name: 'Poor education', v: 18 }, { name: 'Early discharge', v: 14 },
    { name: 'Complications', v: 22 }, { name: 'Transport', v: 8 }, { name: 'Social factors', v: 14 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Readmission rate" value="8%" expected="<5%" trend="up" risk="med" />
        <MetricChip label="AI-predicted 30-day risk" value="9 patients" risk="med" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Readmission Reasons" subtitle="Root causes behind returns">
          {reasons.map(r => <BarRow key={r.name} label={r.name} value={r.v} pct={r.v} tone={C.amber} />)}
        </Card>
        <Card title="Readmission Trend (30-day)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={readmissionTrend()}>
              <defs><linearGradient id="rc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.amber} stopOpacity={.3} /><stop offset="100%" stopColor={C.amber} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="v" stroke={C.amber} strokeWidth={2} fill="url(#rc)" name="30-day %" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 12. COMPLAINTS INTELLIGENCE
// ════════════════════════════════════════════════════════════════════════════

function Complaints() {
  const cats = [
    { name: 'Waiting time', v: 12 }, { name: 'Communication', v: 9 }, { name: 'Professionalism', v: 5 },
    { name: 'Billing', v: 8 }, { name: 'Medication', v: 3 }, { name: 'Cleanliness', v: 6 },
    { name: 'Food', v: 4 }, { name: 'Privacy', v: 2 }, { name: 'Respect', v: 3 },
    { name: 'Discrimination', v: 1 }, { name: 'Delays', v: 7 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Complaints (month)" value="27" trend="up" />
        <MetricChip label="Resolved" value="24" trend="up" />
        <MetricChip label="Avg resolution" value="2.4 days" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Complaint Categories" subtitle="Horizontal distribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cats} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis type="number" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10, fill: C.slate }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="v" fill={C.purple} name="Complaints" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Sentiment Analysis" subtitle="Positive · Neutral · Negative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sentimentData()} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                <Cell fill={C.green} />
                <Cell fill={C.amber} />
                <Cell fill={C.red} />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <WordCloud />
        </Card>
      </div>
    </div>
  );
}

function WordCloud() {
  const words = ['waiting', 'doctor', 'bill', 'kind', 'clean', 'rude', 'delay', 'thank', 'nurse', 'fast'];
  const sizes = [18, 14, 12, 20, 13, 10, 11, 22, 16, 15];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 6 }}>Word cloud</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', minHeight: 80 }}>
        {words.map((w, i) => <span key={w} style={{ fontSize: sizes[i], fontWeight: 700, color: i % 3 === 0 ? C.navy : i % 3 === 1 ? C.sky : C.amber }}>{w}</span>)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 13. PATIENT EXPERIENCE
// ════════════════════════════════════════════════════════════════════════════

function PatientExperience() {
  const dims = [
    { name: 'Satisfaction', v: 96, max: 100, display: '4.8/5' },
    { name: 'Communication', v: 94, max: 100, display: '94%' },
    { name: 'Respect', v: 98, max: 100, display: '98%' },
    { name: 'Waiting', v: 83, max: 100, display: '83%' },
    { name: 'Cleanliness', v: 96, max: 100, display: '96%' },
    { name: 'Would recommend', v: 96, max: 100, display: '96%' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Satisfaction" value="4.8/5" trend="up" />
        <MetricChip label="Would recommend" value="96%" trend="up" />
        <MetricChip label="Care is safe" value="98%" trend="up" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <Card title="Experience Radar" subtitle="Across every dimension of the patient journey">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={dims.filter(d => d.name !== 'Would recommend')}>
              <PolarGrid stroke="#eef2f7" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: C.muted }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: C.muted }} />
              <Radar dataKey="v" stroke={C.sky} fill={C.sky} fillOpacity={.4} name="Score" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Experience Dimensions">
          {dims.map(d => <BarRow key={d.name} label={d.name} value={d.display} pct={(d.v / d.max) * 100} tone={C.sky} />)}
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 14. CLINICAL AUDITS
// ════════════════════════════════════════════════════════════════════════════

function Audits() {
  const types = ['Mortality', 'Documentation', 'Antimicrobial', 'Blood', 'Surgery', 'Stroke', 'Sepsis', 'Trauma', 'ICU'];
  const [gen, setGen] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        <MetricChip label="Required" value="24" />
        <MetricChip label="Completed" value="18" trend="up" />
        <MetricChip label="Pending" value="4" />
        <MetricChip label="Overdue" value="2" risk="med" />
        <MetricChip label="Failed" value="0" trend="up" />
      </div>
      <Card title="Audit Centre" subtitle="Generate audits automatically across every clinical domain">
        <button onClick={() => setGen(g => g + 1)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>Generate audit schedule</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 8 }}>
          {types.map(t => (
            <button key={t} onClick={() => setGen(g => g + 1)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#f8fafc', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t}{gen > 0 ? ' · scheduled' : ''}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 15. ACCREDITATION
// ════════════════════════════════════════════════════════════════════════════

function Accreditation() {
  const accs = [
    { n: 'JCI', s: 'compliant' }, { n: 'NABH', s: 'compliant' }, { n: 'ISO', s: 'compliant' },
    { n: 'CAP', s: 'partial' }, { n: 'Laboratory', s: 'partial' }, { n: 'Radiology', s: 'compliant' }, { n: 'Pharmacy', s: 'compliant' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MetricChip label="Overall accreditation" value="COMPLIANT" trend="up" risk="low" />
      <Card title="Accreditation Domains" subtitle="JCI, NABH, ISO, CAP & departmental readiness">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 }}>
          {accs.map(a => {
            const c = a.s === 'compliant' ? C.green : a.s === 'partial' ? C.amber : C.red;
            return (
              <div key={a.n} style={{ padding: 12, borderRadius: 12, border: `1px solid ${C.border}`, background: a.s === 'compliant' ? `${C.green}08` : '#fffaf2' }}>
                <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4 }}>{a.n}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: c, textTransform: 'uppercase' }}>● {a.s}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="AI: Upcoming Accreditation Gaps" subtitle="Readiness flagged ahead of re-survey">
        <div style={{ padding: '10px 12px', borderRadius: 10, background: `${C.amber}10`, border: `1px solid ${C.amber}22`, fontSize: 12, color: C.navy }}>
          <b>Laboratory</b> — 2 non-conformities remain (turnaround documentation). Review before re-survey in 45 days.
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 16. CLINICAL GOVERNANCE
// ════════════════════════════════════════════════════════════════════════════

function Governance() {
  const items = ['Policies', 'Guidelines', 'Approvals', 'Committee decisions', 'Implementation', 'Compliance'];
  const v = [100, 92, 88, 95, 90, 96];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <MetricChip label="Policies enforced" value="100%" trend="up" />
        <MetricChip label="Guidelines ratified" value="92%" trend="up" />
        <MetricChip label="Committee compliance" value="95%" trend="up" />
      </div>
      <Card title="Clinical Governance Scope" subtitle="Policies → guidelines → approvals → implementation → compliance">
        {items.map((k, i) => <BarRow key={k} label={k} value={`${v[i]}%`} pct={v[i]} tone={C.sky} />)}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 17. ROOT CAUSE ANALYSIS
// ════════════════════════════════════════════════════════════════════════════

function RCA() {
  const steps = ['Event', 'Immediate cause', 'Underlying cause', 'System cause', 'Recommendations', 'Responsible person', 'Timeline', 'Completed', 'Measured again'];
  const curr = 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: C.slate }}>No blame. Learning. Every major event becomes a system improvement.</div>
      <Card title="Active Root Cause Analysis" subtitle="Event ID #A-4821 · Orthopedic handoff">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: '1 1 60px', minWidth: 30 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: i <= curr ? C.sky : C.border, color: i <= curr ? '#fff' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < curr ? C.sky : C.border, margin: '0 4px' }} />}
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: C.skyLight, fontSize: 12, fontWeight: 700, color: C.sky }}>Now reviewing: <b>System cause</b> — provider conditions → team communication gaps</div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <Card title="System Cause" subtitle="Definitive findings">
          {['Underdocumented handoff', 'No double-check for high-risk transfer', 'Training lacked simulation'].map(x => (
            <div key={x} style={{ padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12, color: C.navy, border: `1px solid ${C.border}`, marginBottom: 8 }}>{x}</div>
          ))}
        </Card>
        <Card title="Recommendations" subtitle="Owned and tracked to closure">
          {[
            ['Add verification checklist (RN-1)', 'Nurse Manager · 7 days'],
            ['Simulation drill monthly', 'QA Officer · 30 days'],
          ].map(([a, w]) => (
            <div key={a} style={{ padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12, border: `1px solid ${C.border}`, marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: C.navy }}>{a}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>• {w}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 18. CAPA ENGINE
// ════════════════════════════════════════════════════════════════════════════

function CAPA() {
  const stages = ['Created', 'Assigned', 'Implemented', 'Verified', 'Closed'];
  const counts = [3, 2, 1, 2, 4];
  const max = Math.max(...counts);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
        {stages.map((s, i) => (
          <div key={s} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: i < 3 ? C.sky : C.green }}>{counts[i]}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{s}</div>
          </div>
        ))}
      </div>
      <Card title="CAPA Flow" subtitle="Corrective & preventive action management lifecycle">
        {stages.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 90, fontSize: 11, fontWeight: 700, color: C.navy }}>{s}</div>
            <div style={{ flex: 1, height: 12, background: '#eef2f7', borderRadius: 6 }}>
              <div style={{ height: '100%', width: `${(counts[i] / max) * 100}%`, background: i < 3 ? C.sky : C.green, borderRadius: 6 }} />
            </div>
            <div style={{ width: 40, textAlign: 'right', fontWeight: 700, color: C.navy }}>{counts[i]}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 19. EXECUTIVE MEETINGS
// ════════════════════════════════════════════════════════════════════════════

function Meetings() {
  const meets = [
    { t: 'Morning Safety Brief', freq: 'Daily' },
    { t: 'Daily Quality Report', freq: 'Daily' },
    { t: 'Weekly Governance Meeting', freq: 'Weekly' },
    { t: 'Monthly M&M', freq: 'Monthly' },
    { t: 'Quarterly Board', freq: 'Quarterly' },
  ];
  return (
    <Card title="Executive Meetings & Auto-generated deliverables">
      {meets.map(m => (
        <div key={m.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${C.border}`, marginBottom: 6 }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: `${C.sky}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={14} color={C.sky} /></span>
          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.navy }}>{m.t}</span>
          <Pill icon={Clock} label={m.freq} tone={C.sky} />
        </div>
      ))}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 20. AI QUALITY INTELLIGENCE
// ════════════════════════════════════════════════════════════════════════════

function Ais() {
  const insights = [
    { icon: PillIcon, t: 'Medication errors reduced 18% this quarter — the bundle is working.', tone: C.green },
    { icon: Activity, t: 'Falls increasing in Ward B — evaluate night staffing and side-rails.', tone: C.amber },
    { icon: Stethoscope, t: 'Orthopedic SSI rising — priority audit on antibiotic timing.', tone: C.red },
    { icon: ClipboardCheck, t: 'Documentation quality improving — sustain the standard.', tone: C.green },
    { icon: Siren, t: 'Emergency delays now attributable to radiology turnaround.', tone: C.amber },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MetricChip label="AI Improvement Opportunities" value="9" risk="med" />
      <Card title="AMEXAN AI Quality Intelligence" subtitle="From dashboards to prescription — what the hospital should do next">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map(i => (
            <div key={i.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#fff' }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: `${i.tone}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i.icon size={16} color={i.tone} /></span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.navy }}>{i.t}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 21. EXECUTIVE REPORTS
// ════════════════════════════════════════════════════════════════════════════

function Reports() {
  const [reported, setReported] = useState<string | null>(null);
  const reports = [
    'Daily Patient Safety Report', 'Weekly Quality Dashboard', 'Monthly M&M Report',
    'Infection Control Report', 'Medication Safety Report', 'Nursing Quality Report',
    'Executive Quality Report', 'Board Quality Report', 'Accreditation Readiness Report',
    'MOH Quality Indicators', 'Donor Quality Metrics', 'Department Scorecards',
  ];
  return (
    <Card title="Executive Report Generator" subtitle="One click → PDF, Excel, Power BI, FHIR Measures">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10 }}>
        {reports.map(r => (
          <button key={r} onClick={() => setReported(r)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#f8fafc', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', color: C.navy }}>
            <FileText size={14} color={C.sky} /> {r}
          </button>
        ))}
      </div>
      {reported && <div style={{ marginTop: 12, fontSize: 12, color: C.green, fontWeight: 600 }}>✓ {reported} — generated · PDF · Excel · Power BI · FHIR Measures</div>}
    </Card>
  );
}
