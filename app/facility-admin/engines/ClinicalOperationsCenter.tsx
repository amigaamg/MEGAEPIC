'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN — Clinical Operations Command Center (COCC)
//
// Mission: continuously monitor, optimize, predict and govern every clinical
// activity in the hospital WITHOUT interfering with clinical decision-making.
//
// CONSTITUTIONAL RULE: Facility Administrators NEVER modify clinical
// documentation. They only observe operations, utilization, capacity, quality,
// efficiency, bottlenecks, safety and resource allocation.
//
// Style: airport control tower × hospital operations wall × executive analytics.
// Dark/Light · live · everything from hospital → building → ward → bed.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Ambulance, BarChart3, BedDouble, Building2, ClipboardList,
  FlaskConical, Gauge, HeartPulse, Moon, Network, Pill, Radio, Stethoscope, Sun,
  Thermometer, TrendingUp, Users,
} from 'lucide-react';

// ── Theme ──────────────────────────────────────────────────────────────────────

type Theme = {
  name: 'dark' | 'light';
  bg: string; panel: string; panel2: string; border: string;
  text: string; muted: string; faint: string;
  green: string; amber: string; red: string; sky: string; purple: string; teal: string;
  greenSoft: string; amberSoft: string; redSoft: string; skySoft: string;
  glowGreen: string;
};

const DARK: Theme = {
  name: 'dark',
  bg: '#060e18', panel: '#0d1a2b', panel2: '#122238', border: 'rgba(56,189,248,.14)',
  text: '#e6eef7', muted: '#8fa3bd', faint: '#5b6f8c',
  green: '#34d399', amber: '#fbbf24', red: '#f87171', sky: '#38bdf8', purple: '#a78bfa', teal: '#2dd4bf',
  greenSoft: 'rgba(52,211,153,.12)', amberSoft: 'rgba(251,191,36,.12)', redSoft: 'rgba(248,113,113,.12)', skySoft: 'rgba(56,189,248,.12)',
  glowGreen: '0 0 10px rgba(52,211,153,.55)',
};

const LIGHT: Theme = {
  name: 'light',
  bg: '#eef3f8', panel: '#ffffff', panel2: '#f1f5fa', border: '#d9e2ee',
  text: '#0b2c4d', muted: '#5b6b80', faint: '#8a98ac',
  green: '#059669', amber: '#d97706', red: '#dc2626', sky: '#0284c7', purple: '#7c3aed', teal: '#0d9488',
  greenSoft: 'rgba(5,150,105,.1)', amberSoft: 'rgba(217,119,6,.1)', redSoft: 'rgba(220,38,38,.1)', skySoft: 'rgba(2,132,199,.1)',
  glowGreen: '0 0 8px rgba(5,150,105,.4)',
};

type Tone = 'healthy' | 'warning' | 'critical' | 'info';

// ── Data catalogue ─────────────────────────────────────────────────────────────

const LANDING = [
  { label: 'Clinical Health Score', value: '97.8%', tone: 'healthy' as Tone },
  { label: 'Hospital Status', value: 'STABLE', tone: 'healthy' as Tone },
  { label: 'Patient Flow', value: 'GOOD', tone: 'healthy' as Tone },
  { label: 'Emergency Load', value: 'MODERATE', tone: 'warning' as Tone },
  { label: 'Bed Availability', value: '18%', tone: 'warning' as Tone },
  { label: 'ICU Occupancy', value: '82%', tone: 'warning' as Tone },
];

const EXEC_KPIS = [
  { label: 'Current Patients', value: '1,104', tone: 'info' as Tone },
  { label: 'Admissions Today', value: '128', tone: 'info' as Tone },
  { label: 'Discharges Today', value: '116', tone: 'healthy' as Tone },
  { label: 'Transfers', value: '42', tone: 'info' as Tone },
  { label: 'Deaths', value: '2', tone: 'critical' as Tone },
  { label: 'Emergency Waiting', value: '23', tone: 'warning' as Tone },
  { label: 'Average LOS', value: '5.4d', tone: 'info' as Tone },
  { label: 'Bed Occupancy', value: '84%', tone: 'warning' as Tone },
  { label: 'Readmissions', value: '6', tone: 'warning' as Tone },
  { label: 'Code Blues', value: '3', tone: 'critical' as Tone },
  { label: 'Theatre Cases', value: '41', tone: 'info' as Tone },
  { label: 'Investigations Pending', value: '89', tone: 'warning' as Tone },
];

const FLOW = ['Community', 'Emergency', 'Triage', 'Observation', 'Ward', 'ICU', 'Theatre', 'Recovery', 'Discharge', 'Follow-up', 'Home Monitoring'];

const EMERGENCY = [
  { label: 'Patients Waiting', value: '23', tone: 'warning' as Tone },
  { label: 'Critical', value: '3', tone: 'critical' as Tone },
  { label: 'High Priority', value: '9', tone: 'warning' as Tone },
  { label: 'Moderate', value: '7', tone: 'info' as Tone },
  { label: 'Low', value: '4', tone: 'healthy' as Tone },
  { label: 'Average Waiting', value: '17 min', tone: 'info' as Tone },
  { label: 'Longest Wait', value: '42 min', tone: 'critical' as Tone },
  { label: 'Ambulances Incoming', value: '2', tone: 'warning' as Tone },
];

const ADMISSIONS_DEPT = [
  { dept: 'Medicine', n: 29 }, { dept: 'Surgery', n: 22 }, { dept: 'Pediatrics', n: 18 }, { dept: 'OBG', n: 25 },
  { dept: 'Orthopedics', n: 12 }, { dept: 'ICU', n: 4 }, { dept: 'Emergency Observation', n: 18 },
];

const LOS_BREAKDOWN = [
  { dept: 'Medicine', days: 7.2, tone: 'warning' as Tone }, { dept: 'Surgery', days: 4.8, tone: 'healthy' as Tone },
  { dept: 'Pediatrics', days: 3.1, tone: 'healthy' as Tone }, { dept: 'ICU', days: 9.8, tone: 'warning' as Tone },
  { dept: 'NICU', days: 12.3, tone: 'critical' as Tone }, { dept: 'Emergency', days: 0.7, tone: 'healthy' as Tone },
];

const WAITING = [
  { dept: 'Emergency', min: 18, tone: 'warning' as Tone }, { dept: 'Medicine Clinic', min: 31, tone: 'critical' as Tone },
  { dept: 'Radiology', min: 24, tone: 'warning' as Tone }, { dept: 'Laboratory', min: 12, tone: 'healthy' as Tone },
  { dept: 'Pharmacy', min: 15, tone: 'healthy' as Tone }, { dept: 'Cashier', min: 6, tone: 'healthy' as Tone },
];

const CLINICS = [
  { name: 'Orthopedics', patients: 72, completed: 49, waiting: 23, consult: 18, late: true, tone: 'warning' as Tone },
  { name: 'Cardiology', patients: 58, completed: 44, waiting: 14, consult: 14, late: false, tone: 'healthy' as Tone },
  { name: 'Diabetes', patients: 66, completed: 51, waiting: 15, consult: 12, late: false, tone: 'healthy' as Tone },
  { name: 'Maternal', patients: 54, completed: 40, waiting: 14, consult: 16, late: true, tone: 'warning' as Tone },
];

const ICU_STATS = [
  { label: 'Beds', value: '18' }, { label: 'Occupied', value: '15' }, { label: 'Ventilated', value: '9' },
  { label: 'Dialysis', value: '2' }, { label: 'ECMO', value: '1' }, { label: 'Predicted Discharges', value: '2' },
  { label: 'Predicted Admissions', value: '4' },
];

const THEATRE = [
  { label: 'Scheduled', value: '14', tone: 'info' as Tone }, { label: 'Running', value: '6', tone: 'healthy' as Tone },
  { label: 'Completed', value: '5', tone: 'healthy' as Tone }, { label: 'Cancelled', value: '3', tone: 'critical' as Tone },
  { label: 'Delayed', value: '2', tone: 'warning' as Tone }, { label: 'Average Start Delay', value: '12 min', tone: 'warning' as Tone },
  { label: 'Utilization', value: '91%', tone: 'healthy' as Tone },
];

const PROCEDURE_MIX = [
  { name: 'General Surgery', v: 30 }, { name: 'Orthopedics', v: 22 }, { name: 'ENT', v: 14 },
  { name: 'Neurosurgery', v: 10 }, { name: 'OBG', v: 16 }, { name: 'Urology', v: 8 },
];

const LABS = [
  { label: 'Specimens', value: '812' }, { label: 'Completed', value: '789', tone: 'healthy' as Tone },
  { label: 'Pending', value: '23', tone: 'warning' as Tone }, { label: 'Critical Results', value: '8', tone: 'critical' as Tone },
  { label: 'Average TAT', value: '26 min', tone: 'healthy' as Tone }, { label: 'Longest Delay', value: '58 min', tone: 'warning' as Tone },
];

const RADIOLOGY = [
  { label: 'CT', value: '41' }, { label: 'MRI', value: '19' }, { label: 'Ultrasound', value: '63' },
  { label: 'X-Ray', value: '121' }, { label: 'Pending Reports', value: '11', tone: 'warning' as Tone },
  { label: 'Average Reporting', value: '31 min', tone: 'healthy' as Tone },
];

const PHARMACY = [
  { label: 'Pending Prescriptions', value: '21', tone: 'warning' as Tone },
  { label: 'Dispensed', value: '481', tone: 'healthy' as Tone },
  { label: 'Average Waiting', value: '9 min', tone: 'healthy' as Tone },
  { label: 'Critical Stockouts', value: '2', tone: 'critical' as Tone },
  { label: 'Delayed Medicines', value: '5', tone: 'warning' as Tone },
];

const QUALITY = [
  { label: 'Medication Errors', value: '0', tone: 'healthy' as Tone }, { label: 'Near Misses', value: '4', tone: 'warning' as Tone },
  { label: 'Mortality', value: '0.2%', tone: 'healthy' as Tone }, { label: 'Readmissions', value: '6', tone: 'warning' as Tone },
  { label: 'Falls', value: '0', tone: 'healthy' as Tone }, { label: 'Pressure Injuries', value: '1', tone: 'warning' as Tone },
  { label: 'HAI', value: '0.8%', tone: 'healthy' as Tone }, { label: 'SSI', value: '0.4%', tone: 'healthy' as Tone },
  { label: 'Sepsis Bundle', value: '96%', tone: 'healthy' as Tone }, { label: 'Stroke Door-to-Needle', value: '31 min', tone: 'healthy' as Tone },
  { label: 'STEMI Door-to-Balloon', value: '58 min', tone: 'warning' as Tone },
];

const FORECAST = [
  { label: 'Emergency Volume', value: '+18%', tone: 'critical' as Tone },
  { label: 'Medicine Admissions', value: '+9%', tone: 'warning' as Tone },
  { label: 'ICU Full by', value: 'Friday', tone: 'critical' as Tone },
  { label: 'Blood Demand', value: '+12%', tone: 'warning' as Tone },
  { label: 'Ceftriaxone Usage', value: '+17%', tone: 'warning' as Tone },
  { label: 'Orthopedic Cases', value: '+8%', tone: 'info' as Tone },
];

const BOTTLENECKS = [
  { name: 'Radiology delay', detail: '11 reports pending · 31 min avg', tone: 'warning' as Tone, rec: 'Add second reporting slot 12:00–14:00' },
  { name: 'Emergency congestion', detail: '23 waiting · 42 min longest', tone: 'critical' as Tone, rec: 'Open Emergency Observation overflow' },
  { name: 'ICU full', detail: '15/18 occupied · 4 predicted admissions', tone: 'critical' as Tone, rec: 'Pre-book HDU step-down for 2 patients' },
  { name: 'Theatre running late', detail: '2 cases delayed · 12 min avg', tone: 'warning' as Tone, rec: 'Move ENT list to Theatre 3' },
  { name: 'Delayed discharge', detail: '7 patients awaiting insurance', tone: 'warning' as Tone, rec: 'Pre-verify SHA eligibility at admission' },
  { name: 'Lab backlog', detail: '23 pending · 58 min longest', tone: 'warning' as Tone, rec: 'Reroute transport queue to Lab 2' },
];

const DEPT_ROWS = [
  { dept: 'Medicine', patients: 291, admissions: 29, los: 7.2, revenue: 4_120_000, occ: 88, waiting: 31, sat: 86, quality: 96 },
  { dept: 'Surgery', patients: 188, admissions: 22, los: 4.8, revenue: 3_860_000, occ: 82, waiting: 14, sat: 90, quality: 98 },
  { dept: 'Pediatrics', patients: 122, admissions: 18, los: 3.1, revenue: 1_540_000, occ: 76, waiting: 9, sat: 91, quality: 97 },
  { dept: 'OBG', patients: 154, admissions: 25, los: 3.4, revenue: 2_240_000, occ: 80, waiting: 12, sat: 92, quality: 99 },
  { dept: 'Orthopedics', patients: 96, admissions: 12, los: 5.1, revenue: 2_610_000, occ: 79, waiting: 18, sat: 88, quality: 95 },
  { dept: 'ICU', patients: 15, admissions: 4, los: 9.8, revenue: 3_120_000, occ: 83, waiting: 2, sat: 94, quality: 97 },
  { dept: 'Emergency', patients: 84, admissions: 18, los: 0.7, revenue: 1_090_000, occ: 91, waiting: 17, sat: 85, quality: 93 },
];

const SPECIMEN_JOURNEY = ['Collected', 'Transported', 'Received', 'Analyzed', 'Validated', 'Reported'];
const THEATRE_TIMELINE = [
  { theatre: 'Theatre 1', cases: [{ s: 7, e: 9, name: 'General Surgery' }, { s: 9.5, e: 12, name: 'General Surgery' }, { s: 13, e: 15, name: 'Urology' }] },
  { theatre: 'Theatre 2', cases: [{ s: 7, e: 10, name: 'OBG' }, { s: 11, e: 14, name: 'OBG' }] },
  { theatre: 'Theatre 3', cases: [{ s: 8, e: 11, name: 'Orthopedics' }, { s: 12, e: 14, name: 'Orthopedics' }] },
  { theatre: 'Theatre 4', cases: [{ s: 9, e: 11, name: 'ENT' }] },
  { theatre: 'Theatre 5', cases: [{ s: 7, e: 13, name: 'Neurosurgery' }] },
];

const REPORTS = ['Daily Operations', 'Bed Report', 'Admissions', 'Discharges', 'LOS', 'Emergency', 'Theatre', 'Laboratory', 'Radiology', 'Clinical KPI', 'MOH', 'Board', 'Executive', 'Department', 'Ward', 'Custom'];

const PG_TABLES = ['admissions', 'discharges', 'transfers', 'bed_allocations', 'patient_movements', 'queues', 'ward_metrics', 'clinic_metrics', 'theatre_metrics', 'icu_metrics', 'operations_snapshots'];

// ── Bed model ──────────────────────────────────────────────────────────────────

type BedState = 'occupied' | 'available' | 'cleaning' | 'maintenance' | 'reserved' | 'isolation' | 'blocked';

interface Ward {
  id: string; name: string; building: string; floor: string; capacity: number; occupied: number;
  cleaning: number; reserved: number; blocked: number; isolation: number;
  avgStay: number; predDischarges: number; predAdmissions: number; overflow: 'LOW' | 'MEDIUM' | 'HIGH';
}

const WARDS: Ward[] = [
  { id: 'med', name: 'Medicine Ward', building: 'Block B', floor: '3', capacity: 42, occupied: 39, cleaning: 1, reserved: 1, blocked: 1, isolation: 0, avgStay: 5.2, predDischarges: 7, predAdmissions: 11, overflow: 'HIGH' },
  { id: 'surg', name: 'Surgical Ward', building: 'Block B', floor: '2', capacity: 36, occupied: 31, cleaning: 2, reserved: 1, blocked: 1, isolation: 1, avgStay: 4.6, predDischarges: 9, predAdmissions: 8, overflow: 'MEDIUM' },
  { id: 'peds', name: 'Pediatric Ward', building: 'Block C', floor: '2', capacity: 28, occupied: 22, cleaning: 2, reserved: 1, blocked: 0, isolation: 3, avgStay: 3.1, predDischarges: 5, predAdmissions: 6, overflow: 'LOW' },
  { id: 'icu', name: 'ICU', building: 'Block A', floor: '1', capacity: 18, occupied: 15, cleaning: 1, reserved: 0, blocked: 1, isolation: 1, avgStay: 9.8, predDischarges: 2, predAdmissions: 4, overflow: 'HIGH' },
  { id: 'hdu', name: 'HDU', building: 'Block A', floor: '1', capacity: 10, occupied: 8, cleaning: 1, reserved: 0, blocked: 0, isolation: 1, avgStay: 6.4, predDischarges: 2, predAdmissions: 3, overflow: 'MEDIUM' },
  { id: 'nicu', name: 'NICU', building: 'Block C', floor: '1', capacity: 12, occupied: 9, cleaning: 1, reserved: 1, blocked: 0, isolation: 1, avgStay: 12.3, predDischarges: 1, predAdmissions: 2, overflow: 'MEDIUM' },
  { id: 'maternity', name: 'Maternity', building: 'Block C', floor: '3', capacity: 24, occupied: 21, cleaning: 1, reserved: 2, blocked: 0, isolation: 0, avgStay: 2.8, predDischarges: 8, predAdmissions: 6, overflow: 'LOW' },
  { id: 'emobs', name: 'Emergency Observation', building: 'Block A', floor: '0', capacity: 16, occupied: 15, cleaning: 1, reserved: 0, blocked: 0, isolation: 0, avgStay: 0.7, predDischarges: 12, predAdmissions: 9, overflow: 'HIGH' },
];

const BED_STATE_COLOR: Record<BedState, { label: string; color: string; bg: string }> = {
  occupied: { label: 'Occupied', color: '#22c55e', bg: 'rgba(34,197,94,.16)' },
  available: { label: 'Available', color: '#3b82f6', bg: 'rgba(59,130,246,.16)' },
  cleaning: { label: 'Cleaning', color: '#f59e0b', bg: 'rgba(245,158,11,.16)' },
  maintenance: { label: 'Maintenance', color: '#64748b', bg: 'rgba(100,116,139,.2)' },
  reserved: { label: 'Reserved', color: '#a855f7', bg: 'rgba(168,85,247,.16)' },
  isolation: { label: 'Isolation', color: '#ef4444', bg: 'rgba(239,68,68,.16)' },
  blocked: { label: 'Blocked', color: '#111827', bg: 'rgba(17,24,39,.35)' },
};

function wardBedPattern(w: Ward): BedState[] {
  const out: BedState[] = [];
  const states: BedState[] = ['occupied', 'available', 'cleaning', 'maintenance', 'reserved', 'isolation', 'blocked'];
  let seed = w.id.length;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < w.capacity; i++) {
    if (i < w.occupied) out.push('occupied');
    else out.push(states[Math.floor(rnd() * states.length)]);
  }
  return out;
}

// ── Atoms ──────────────────────────────────────────────────────────────────────

function toneColor(t: Theme, tone: Tone): string {
  switch (tone) {
    case 'healthy': return t.green;
    case 'warning': return t.amber;
    case 'critical': return t.red;
    default: return t.sky;
  }
}

function Stat({ t, label, value, tone, mono }: { t: Theme; label: string; value: string | number; tone?: Tone; mono?: boolean }) {
  return (
    <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 19, fontWeight: 800, color: tone ? toneColor(t, tone) : t.text, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{value}</div>
      <div style={{ fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function SectionTitle({ t, title, sub }: { t: Theme; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: t.text, letterSpacing: '.02em', textTransform: 'uppercase' }}>══ {title}</span>
        <span style={{ flex: 1, height: 1, background: t.border }} />
      </div>
      {sub && <div style={{ fontSize: 11.5, color: t.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Panel({ t, title, sub, children, action }: { t: Theme; title: string; sub?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function TonePill({ t, tone, label }: { t: Theme; tone: Tone; label?: string }) {
  const c = toneColor(t, tone);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: `${c}1a`, color: c, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      <span className={tone === 'healthy' ? 'cocc-pulse' : undefined} style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: tone === 'healthy' ? `0 0 8px ${c}` : undefined }} />
      {label || tone}
    </span>
  );
}

// ── COCC ───────────────────────────────────────────────────────────────────────

const VIEWS = {
  overview: 'overview', realtime: 'realtime', admissions: 'admissions', discharges: 'discharges', transfers: 'transfers',
  emergency: 'emergency', beds: 'beds', wards: 'wards', clinics: 'clinics', theatres: 'theatres', icu: 'icu', hdu: 'hdu',
  nicu: 'nicu', labs: 'labs', radiology: 'radiology', pharmacy: 'pharmacy', flow: 'flow', waiting: 'waiting',
  los: 'los', bottlenecks: 'bottlenecks', performance: 'performance', intelligence: 'intelligence', forecast: 'forecast', reports: 'reports',
} as const;
type ViewId = (typeof VIEWS)[keyof typeof VIEWS];

export function ClinicalOperationsCenter() {
  const [dark, setDark] = useState(true);
  const [view, setView] = useState<ViewId>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = dark ? DARK : LIGHT;

  const nav: { id: ViewId; label: string; icon: any }[] = [
    { id: 'overview', label: 'Clinical Operations', icon: HeartPulse },
    { id: 'realtime', label: 'Realtime Hospital', icon: Activity },
    { id: 'admissions', label: 'Admissions', icon: Users },
    { id: 'discharges', label: 'Discharges', icon: ClipboardList },
    { id: 'transfers', label: 'Transfers', icon: Network },
    { id: 'emergency', label: 'Emergency', icon: Ambulance },
    { id: 'beds', label: 'Bed Management', icon: BedDouble },
    { id: 'wards', label: 'Ward Operations', icon: Building2 },
    { id: 'clinics', label: 'Clinics', icon: Stethoscope },
    { id: 'theatres', label: 'Operating Theatres', icon: Gauge },
    { id: 'icu', label: 'ICU', icon: HeartPulse },
    { id: 'hdu', label: 'HDU', icon: Activity },
    { id: 'nicu', label: 'NICU', icon: BedDouble },
    { id: 'labs', label: 'Laboratories', icon: FlaskConical },
    { id: 'radiology', label: 'Radiology', icon: Radio },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'flow', label: 'Patient Flow', icon: Network },
    { id: 'waiting', label: 'Waiting Times', icon: Thermometer },
    { id: 'los', label: 'Length of Stay', icon: TrendingUp },
    { id: 'bottlenecks', label: 'Clinical Bottlenecks', icon: AlertTriangle },
    { id: 'performance', label: 'Clinical Performance', icon: BarChart3 },
    { id: 'intelligence', label: 'Clinical Intelligence', icon: HeartPulse },
    { id: 'forecast', label: 'Forecasting', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: ClipboardList },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: t.bg, color: t.text, fontFamily: "'Inter', 'Noto Sans', system-ui, sans-serif", display: 'flex' }}>
      <style>{`
        .cocc-pulse{animation:coccPulse 2.2s ease-in-out infinite}
        @keyframes coccPulse{0%,100%{opacity:1}50%{opacity:.4}}
        .cocc-dash{stroke-dasharray:6 8;animation:coccFlow 1.1s linear infinite}
        @keyframes coccFlow{to{stroke-dashoffset:-14}}
        .cocc-dot{animation:coccDot 1.4s ease-in-out infinite}
        @keyframes coccDot{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @media(max-width:900px){.cocc-side{position:fixed;left:0;top:60px;bottom:0;z-index:25;box-shadow:0 10px 40px rgba(0,0,0,.4)}.cocc-main{padding:14px!important}}
      `}</style>

      <aside className="cocc-side" style={{ width: 232, flexShrink: 0, background: t.panel, borderRight: `1px solid ${t.border}`, padding: '12px 10px', overflowY: 'auto', display: mobileOpen ? 'block' : undefined }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: t.muted, textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartPulse size={13} color={t.teal} /> COCC
        </div>
        {nav.map(n => {
          const Icon = n.icon;
          const active = view === n.id;
          return (
            <button key={n.id} onClick={() => { setView(n.id); setMobileOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer', background: active ? t.skySoft : 'transparent', color: active ? t.sky : t.muted, fontSize: 12.5, fontWeight: active ? 700 : 500, marginBottom: 2 }}>
              <Icon size={15} /> {n.label}
            </button>
          );
        })}
        <button onClick={() => setDark(d => !d)} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.panel2, color: t.text, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </aside>

      <main className="cocc-main" style={{ flex: 1, overflowY: 'auto', padding: 22, position: 'relative' }}>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 20 }} />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 8, padding: 6, cursor: 'pointer' }} className="cocc-menu" aria-label="Menu"><HeartPulse size={16} color={t.text} /></button>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>Clinical Operations Command Center</div>
            <div style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>Observe operations · never touch clinical documentation</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: t.panel, border: `1px solid ${t.border}` }}>
            <span className="cocc-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: t.green, boxShadow: t.glowGreen }} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Realtime · Operational Only</span>
          </div>
        </div>

        {view === 'overview' && <Overview t={t} />}
        {view === 'realtime' && <RealtimeView t={t} />}
        {view === 'admissions' && <AdmissionsView t={t} />}
        {view === 'discharges' && <DischargesView t={t} />}
        {view === 'transfers' && <TransfersView t={t} />}
        {view === 'emergency' && <EmergencyView t={t} />}
        {view === 'beds' && <BedsView t={t} />}
        {view === 'wards' && <WardsView t={t} />}
        {view === 'clinics' && <ClinicsView t={t} />}
        {view === 'theatres' && <TheatresView t={t} />}
        {view === 'icu' && <IcuView t={t} label="ICU" stats={ICU_STATS} detail={{ name: 'ICU', beds: 18, occupied: 15, ventilated: 9, dialysis: 2, ecmo: 1, predD: 2, predA: 4, risk: 'HIGH' }} />}
        {view === 'hdu' && <IcuView t={t} label="HDU" stats={[{ label: 'Beds', value: '10' }, { label: 'Occupied', value: '8' }, { label: 'Step-down', value: '3' }, { label: 'High-flow O₂', value: '4' }, { label: 'Predicted Discharges', value: '2' }, { label: 'Predicted Admissions', value: '3' }]} detail={{ name: 'HDU', beds: 10, occupied: 8, ventilated: 1, dialysis: 0, ecmo: 0, predD: 2, predA: 3, risk: 'MEDIUM' }} />}
        {view === 'nicu' && <IcuView t={t} label="NICU" stats={[{ label: 'Beds', value: '12' }, { label: 'Occupied', value: '9' }, { label: 'Incubators', value: '7' }, { label: 'Phototherapy', value: '3' }, { label: 'Predicted Discharges', value: '1' }, { label: 'Predicted Admissions', value: '2' }]} detail={{ name: 'NICU', beds: 12, occupied: 9, ventilated: 2, dialysis: 0, ecmo: 0, predD: 1, predA: 2, risk: 'MEDIUM' }} />}
        {view === 'labs' && <LabsView t={t} />}
        {view === 'radiology' && <RadiologyView t={t} />}
        {view === 'pharmacy' && <PharmacyView t={t} />}
        {view === 'flow' && <FlowView t={t} />}
        {view === 'waiting' && <WaitingView t={t} />}
        {view === 'los' && <LosView t={t} />}
        {view === 'bottlenecks' && <BottlenecksView t={t} />}
        {view === 'performance' && <PerformanceView t={t} />}
        {view === 'intelligence' && <IntelligenceView t={t} />}
        {view === 'forecast' && <ForecastView t={t} />}
        {view === 'reports' && <ReportsView t={t} />}
      </main>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────

function Overview({ t }: { t: Theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionTitle t={t} title="Executive Clinical Overview" sub="The CEO knows immediately whether the hospital is healthy." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {LANDING.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>

      <Panel t={t} title="AI Prediction" sub="Clinical Intelligence continuously forecasting">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: t.amberSoft, border: `1px solid ${t.amber}40`, fontSize: 12.5 }}>
          <TrendingUp size={15} color={t.amber} />
          <span style={{ color: t.text }}><b>High Emergency Volume Tomorrow.</b> Expected +18% vs baseline. Pre-open the Observation overflow and roster 2 extra nurses for 06:00–14:00.</span>
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(280px,0.85fr)', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <LiveFlow t={t} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {EXEC_KPIS.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel t={t} title="Bed Occupancy" sub="Realtime gauge">
            <GaugeChart t={t} value={84} label="84%" sub="overall occupancy" />
          </Panel>
          <Panel t={t} title="Admissions Trend" sub="Last 24 hours">
            <TrendLine t={t} color={t.teal} seed={[4, 6, 9, 11, 13, 12, 10, 8, 9, 11, 14, 12]} label="admissions/hr" />
          </Panel>
          <Panel t={t} title="Critical Watch" sub="Items needing attention now">
            {[{ n: 'Emergency Waiting', v: '23' }, { n: 'ICU 82%', v: 'Full Friday' }, { n: 'Pending Investigations', v: '89' }, { n: 'Code Blues', v: '3' }].map(x => (
              <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
                <AlertTriangle size={13} color={t.amber} /> <span style={{ flex: 1, color: t.text }}>{x.n}</span> <b style={{ color: t.amber }}>{x.v}</b>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ── Live Flow (airport control tower) ─────────────────────────────────────────

function LiveFlow({ t }: { t: Theme }) {
  return (
    <Panel t={t} title="Live Hospital Flow" sub="Airport control tower — patients moving through the ecosystem" action={<TonePill t={t} tone="healthy" label="LIVE" />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
        {FLOW.map((f, i) => (
          <div key={f} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{ background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
                <span className="cocc-pulse" style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: i === 0 ? t.sky : t.teal, boxShadow: `0 0 8px ${t.teal}`, margin: '0 auto 6px' }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: t.text }}>{f}</span>
                <span style={{ display: 'block', fontSize: 9, color: t.muted, marginTop: 2 }}>{FLOW_COUNTS[i]}</span>
              </div>
              {i < FLOW.length - 1 && (
                <span className="cocc-dot" style={{ position: 'absolute', right: -10, top: '50%', width: 6, height: 6, borderRadius: '50%', background: t.sky }} />
              )}
            </div>
            {i < FLOW.length - 1 && <span style={{ fontSize: 10, color: t.faint }}>↓</span>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

const FLOW_COUNTS = ['—', '128/hr', '118', '42', '1,104', '15', '41', '38', '116', '88', '512'];

// ── Realtime Hospital ──────────────────────────────────────────────────────────

function RealtimeView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Realtime Hospital" sub="Live operations wall — every metric, every department, every ward." />
      <LiveFlow t={t} />
      <Panel t={t} title="Department Live Board" sub="Current patients by department — no notes, operations only">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {DEPT_ACTIVITY.map(d => (
            <div key={d.name} style={{ background: t.panel2, borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="cocc-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: t.teal, boxShadow: `0 0 8px ${t.teal}` }} /><span style={{ fontWeight: 700, color: t.text }}>{d.name}</span></div>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{d.patients}</div>
              <div style={{ fontSize: 9.5, color: t.muted }}>{d.admissions} admits · {d.occ}% occ</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
const DEPT_ACTIVITY = DEPT_ROWS.map(r => ({ name: r.dept, patients: r.patients, admissions: r.admissions, occ: r.occ }));

// ── Admissions / Discharges / Transfers ────────────────────────────────────────

function AdmissionsView({ t }: { t: Theme }) {
  const max = Math.max(...ADMISSIONS_DEPT.map(a => a.n));
  return (
    <>
      <SectionTitle t={t} title="Admission Intelligence" sub="Not just a count — where patients are going." />
      <Panel t={t} title="Admissions by Department" sub="Today · 128 total">
        {ADMISSIONS_DEPT.map(a => (
          <div key={a.dept} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ width: 150, fontWeight: 600, color: t.text, fontSize: 12 }}>{a.dept}</span>
            <div style={{ flex: 1, height: 16, borderRadius: 4, background: t.panel2, overflow: 'hidden' }}>
              <div style={{ width: `${(a.n / max) * 100}%`, height: '100%', background: t.teal, borderRadius: 4 }} />
            </div>
            <span style={{ width: 40, textAlign: 'right', fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{a.n}</span>
          </div>
        ))}
      </Panel>
      <Panel t={t} title="Admission Trend" sub="Hourly — last 24h (auto-updating)">
        <TrendLine t={t} color={t.teal} seed={[4, 6, 9, 11, 13, 12, 10, 8, 9, 11, 14, 12]} label="admissions/hr" />
      </Panel>
    </>
  );
}

function DischargesView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Discharge Intelligence" sub="116 discharged today · flow out of the hospital." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Discharges Today" value="116" tone="healthy" />
        <Stat t={t} label="Planned Tomorrow" value="124" tone="info" />
        <Stat t={t} label="Delayed (social)" value="7" tone="warning" />
        <Stat t={t} label="Awaiting Insurance" value="9" tone="warning" />
        <Stat t={t} label="Home Monitoring" value="512" tone="info" />
      </div>
      <Panel t={t} title="Discharge by Department" sub="Who is leaving today">
        {DEPT_ROWS.slice(0, 6).map(r => (
          <div key={r.dept} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ width: 150, fontWeight: 600, color: t.text, fontSize: 12 }}>{r.dept}</span>
            <div style={{ flex: 1, height: 14, borderRadius: 4, background: t.panel2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, r.admissions * 3)}%`, height: '100%', background: t.green, borderRadius: 4 }} />
            </div>
            <span style={{ width: 40, textAlign: 'right', fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(r.admissions * 0.9)}</span>
          </div>
        ))}
      </Panel>
    </>
  );
}

function TransfersView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Transfer Intelligence" sub="Sankey — movement across the hospital, visible instantly." />
      <Panel t={t} title="Patient Movement (Today · 42)">
        <Sankey t={t} />
      </Panel>
    </>
  );
}

function Sankey({ t }: { t: Theme }) {
  const links = [
    { from: 'Emergency', to: 'Medicine', n: 14 }, { from: 'Emergency', to: 'ICU', n: 3 },
    { from: 'Medicine', to: 'ICU', n: 2 }, { from: 'ICU', to: 'Theatre', n: 2 },
    { from: 'Theatre', to: 'Ward', n: 9 }, { from: 'Ward', to: 'Home', n: 12 },
  ];
  const maxN = Math.max(...links.map(l => l.n));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
          <span style={{ width: 90, textAlign: 'right', fontWeight: 700, color: t.text }}>{l.from}</span>
          <div style={{ flex: 1, height: 22, borderRadius: 4, background: t.panel2, overflow: 'hidden' }}>
            <div style={{ width: `${(l.n / maxN) * 100}%`, height: '100%', background: i % 2 === 0 ? t.teal : t.sky, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
              <span style={{ color: '#04233a', fontWeight: 800, fontSize: 10 }}>{l.n}</span>
            </div>
          </div>
          <span style={{ width: 90, fontWeight: 700, color: t.text }}>{l.to}</span>
        </div>
      ))}
    </div>
  );
}

// ── Emergency ──────────────────────────────────────────────────────────────────

function EmergencyView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Emergency Intelligence" sub="Color-coded by priority — live." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {EMERGENCY.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>
      <Panel t={t} title="Triage Pipeline" sub="Patients flowing through Emergency">
        {['Arrived', 'Triage', 'Waiting', 'Being Seen', 'Admitted', 'Discharged'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ width: 110, fontWeight: 600, color: t.text, fontSize: 12 }}>{s}</span>
            <div style={{ flex: 1, height: 14, borderRadius: 4, background: t.panel2, overflow: 'hidden' }}>
              <div style={{ width: `${[100, 96, 62, 55, 18, 12][i]}%`, height: '100%', background: i >= 4 ? t.green : i >= 2 ? t.amber : t.sky, borderRadius: 4 }} />
            </div>
            <span style={{ width: 40, textAlign: 'right', fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{[128, 121, 78, 68, 23, 15][i]}</span>
          </div>
        ))}
      </Panel>
      <Panel t={t} title="Emergency Load" sub="Area chart — realtime">
        <TrendLine t={t} color={t.amber} seed={[14, 12, 10, 13, 18, 22, 25, 23, 19, 21, 24, 23]} label="patients in department" />
      </Panel>
    </>
  );
}

// ── Beds / Wards ───────────────────────────────────────────────────────────────

function BedsView({ t }: { t: Theme }) {
  const [sel, setSel] = useState<Ward>(WARDS[0]);
  const beds = useMemo(() => wardBedPattern(sel), [sel]);
  const counts = useMemo(() => {
    const c: Record<BedState, number> = { occupied: 0, available: 0, cleaning: 0, maintenance: 0, reserved: 0, isolation: 0, blocked: 0 };
    beds.forEach(b => { c[b] += 1; });
    return c;
  }, [beds]);
  return (
    <>
      <SectionTitle t={t} title="Bed Intelligence" sub="Hospital → Building → Floor → Ward → Bed. Every bed live." />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(320px,0.7fr)', gap: 14, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {(Object.keys(BED_STATE_COLOR) as BedState[]).map(s => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: BED_STATE_COLOR[s].color, background: BED_STATE_COLOR[s].bg }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: BED_STATE_COLOR[s].color }} /> {BED_STATE_COLOR[s].label}
              </span>
            ))}
          </div>
          <Panel t={t} title={`${sel.building} · Floor ${sel.floor} · ${sel.name}`} sub={`${sel.capacity} beds`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: 6 }}>
              {beds.map((b, i) => {
                const st = BED_STATE_COLOR[b];
                return (
                  <div key={i} title={`Bed ${i + 1} · ${st.label}`} style={{ height: 34, borderRadius: 7, background: st.bg, border: `1px solid ${st.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: st.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Panel t={t} title="Wards" sub="Select to inspect">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {WARDS.map(w => (
                <button key={w.id} onClick={() => setSel(w)} style={{ textAlign: 'left', cursor: 'pointer', borderRadius: 8, padding: '9px 11px', background: sel.id === w.id ? t.skySoft : t.panel2, border: `1px solid ${sel.id === w.id ? t.sky : t.border}`, fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: t.text }}>{w.name}</span>
                  <div style={{ fontSize: 9.5, color: t.muted, marginTop: 2 }}>{w.building} / F{w.floor} · {w.occupied}/{w.capacity} occ</div>
                </button>
              ))}
            </div>
          </Panel>
          <Panel t={t} title={`${sel.name} — Ward Detail`}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Stat t={t} label="Capacity" value={sel.capacity} />
              <Stat t={t} label="Occupied" value={sel.occupied} tone="warning" />
              <Stat t={t} label="Cleaning" value={sel.cleaning} tone="warning" />
              <Stat t={t} label="Reserved" value={sel.reserved} tone="info" />
              <Stat t={t} label="Blocked" value={sel.blocked} tone="critical" />
              <Stat t={t} label="Average Stay" value={`${sel.avgStay} d`} tone="info" />
              <Stat t={t} label="Pred. Discharges" value={sel.predDischarges} tone="healthy" />
              <Stat t={t} label="Pred. Admissions" value={sel.predAdmissions} tone="warning" />
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: t.muted }}>Overflow Risk</span>
              <TonePill t={t} tone={sel.overflow === 'HIGH' ? 'critical' : sel.overflow === 'MEDIUM' ? 'warning' : 'healthy'} label={sel.overflow} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function WardsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Ward Operations" sub="Operations only — no notes, no charts. Doctors and nurses still do their work." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {WARDS.map(w => (
          <div key={w.id} style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: t.text }}>{w.name}</span>
              <TonePill t={t} tone={w.overflow === 'HIGH' ? 'critical' : w.overflow === 'MEDIUM' ? 'warning' : 'healthy'} label={`${w.occupied}/${w.capacity}`} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11.5 }}>
              {[['Current Patients', w.occupied], ['Doctors Assigned', 7], ['Nurses', w.id === 'icu' ? 12 : 16], ['Ward Round', 'YES'], ['Medication Admin', '98%'], ['Vitals Completed', '100%'], ['Falls', 0], ['Pressure Ulcers', w.id === 'med' ? 1 : 0], ['Readmissions', w.id === 'med' ? 2 : 1]].map(([l, v]) => (
                <div key={l as string} style={{ background: t.panel2, borderRadius: 7, padding: '7px 10px' }}>
                  <div style={{ fontSize: 9, color: t.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: (l === 'Falls' && v === 0) || (l === 'Vitals Completed') ? t.green : t.text }}>{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Clinics / Theatres / ICU ───────────────────────────────────────────────────

function ClinicsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Outpatient Clinic Intelligence" sub="Every clinic — patients, completion, waiting, consultation." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {CLINICS.map(c => (
          <div key={c.name} style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: t.text }}>{c.name}</span>
              <TonePill t={t} tone={c.late ? 'warning' : 'healthy'} label={c.late ? 'Running Late' : 'On Time'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Stat t={t} label="Patients" value={c.patients} />
              <Stat t={t} label="Completed" value={c.completed} tone="healthy" />
              <Stat t={t} label="Waiting" value={c.waiting} tone={c.waiting > 15 ? 'warning' : 'info'} />
              <Stat t={t} label="Avg Consultation" value={`${c.consult} min`} tone="info" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TheatresView({ t }: { t: Theme }) {
  const colors = [t.teal, t.sky, t.purple, t.amber, t.green];
  return (
    <>
      <SectionTitle t={t} title="Theatre Intelligence" sub="Realtime — schedule, utilization, delays." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {THEATRE.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(280px,0.8fr)', gap: 14 }}>
        <Panel t={t} title="Theatre Schedule" sub="Gantt — today 07:00 → 15:00">
          {THEATRE_TIMELINE.map((row, ri) => (
            <div key={row.theatre} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <span style={{ width: 84, fontSize: 10.5, fontWeight: 700, color: t.text, flexShrink: 0 }}>{row.theatre}</span>
              <div style={{ position: 'relative', flex: 1, height: 26, background: t.panel2, borderRadius: 6 }}>
                {row.cases.map((c, ci) => (
                  <div key={ci} style={{ position: 'absolute', left: `${((c.s - 7) / 8) * 100}%`, width: `${((c.e - c.s) / 8) * 100}%`, top: 2, bottom: 2, background: colors[(ri + ci) % colors.length], borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 6, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 8.5, fontWeight: 800, color: '#04233a' }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Panel>
        <Panel t={t} title="Procedure Mix" sub="Today's cases">
          <Donut t={t} data={PROCEDURE_MIX} colors={colors} />
        </Panel>
      </div>
    </>
  );
}

function Donut({ t, data, colors }: { t: Theme; data: { name: string; v: number }[]; colors: string[] }) {
  const total = data.reduce((a, d) => a + d.v, 0);
  let acc = 0;
  const segs = data.map((d, i) => {
    const start = (acc / total) * 360; acc += d.v;
    const end = (acc / total) * 360;
    return { ...d, start, end, color: colors[i % colors.length] };
  });
  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segs.map((s, i) => (
          <path key={i} d={`M60,60 L${polar(60, 60, 50, s.start)} A50,50 0 ${s.end - s.start > 180 ? 1 : 0} 1 ${polar(60, 60, 50, s.end)} Z`} fill={s.color} />
        ))}
        <circle cx="60" cy="60" r="30" fill={t.panel} />
      </svg>
      <div>
        {segs.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, padding: '2px 0' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />
            <span style={{ color: t.text }}>{s.name}</span>
            <span style={{ color: t.muted }}>{Math.round((s.v / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IcuView({ t, label, stats, detail }: { t: Theme; label: string; stats: { label: string; value: string }[]; detail: { name: string; beds: number; occupied: number; ventilated: number; dialysis: number; ecmo: number; predD: number; predA: number; risk: 'LOW' | 'MEDIUM' | 'HIGH' } }) {
  const occ = Math.round((detail.occupied / detail.beds) * 100);
  return (
    <>
      <SectionTitle t={t} title={`${label} Intelligence`} sub="Critical care — capacity, ventilation, predictions." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {stats.map(s => <Stat key={s.label} t={t} label={s.label} value={s.value} mono />)}
      </div>
      <Panel t={t} title={`${label} Capacity`} action={<TonePill t={t} tone={detail.risk === 'HIGH' ? 'critical' : detail.risk === 'MEDIUM' ? 'warning' : 'healthy'} label={`Capacity Risk ${detail.risk}`} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 6 }}>Occupancy</div>
            <div style={{ height: 18, borderRadius: 8, background: t.panel2, overflow: 'hidden' }}>
              <div style={{ width: `${occ}%`, height: '100%', background: occ > 85 ? t.red : occ > 70 ? t.amber : t.green, borderRadius: 8 }} />
            </div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{detail.occupied}/{detail.beds} beds occupied · {detail.ventilated} ventilated · {detail.dialysis} dialysis · {detail.ecmo} ECMO</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 6 }}>Prediction</div>
            <div style={{ fontSize: 12.5, color: t.text }}>Predicted discharges <b>{detail.predD}</b> · predicted admissions <b>{detail.predA}</b></div>
            <div style={{ marginTop: 8, fontSize: 12, color: detail.predA > detail.predD ? t.red : t.green, fontWeight: 700 }}>
              {detail.predA > detail.predD ? '▲ Net inflow — capacity under pressure' : '▼ Net outflow — capacity easing'}
            </div>
          </div>
        </div>
      </Panel>
    </>
  );
}

// ── Labs / Radiology / Pharmacy ────────────────────────────────────────────────

function LabsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Laboratory Intelligence" sub="Throughput, TAT, critical results." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {LABS.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>
      <Panel t={t} title="Specimen Journey" sub="Realtime — 812 specimens in flight">
        <Journey t={t} steps={SPECIMEN_JOURNEY} counts={['812', '806', '799', '792', '791', '789']} />
      </Panel>
    </>
  );
}

function RadiologyView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Radiology Intelligence" sub="Workload by modality, reporting lag." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {RADIOLOGY.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>
      <Panel t={t} title="Modality Workload" sub="Stacked — studies today">
        <BarRow t={t} data={[{ name: 'CT', v: 41 }, { name: 'MRI', v: 19 }, { name: 'Ultrasound', v: 63 }, { name: 'X-Ray', v: 121 }, { name: 'Mammo', v: 9 }]} />
      </Panel>
    </>
  );
}

function PharmacyView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Pharmacy Operations" sub="Dispensing, waiting, stock risk." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {PHARMACY.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>
      <Panel t={t} title="Stock Watch" sub="Critical stockouts being replenished">
        {[{ m: 'Ceftriaxone 1g', s: 'Critical', t: 'critical' as Tone }, { m: 'Insulin Glargine', s: 'Critical', t: 'critical' as Tone }, { m: 'Morphine 10mg', s: 'Low', t: 'warning' as Tone }, { m: 'Amoxicillin 250mg', s: 'Low', t: 'warning' as Tone }].map(x => (
          <div key={x.m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
            <Pill size={13} color={toneColor(t, x.t)} />
            <span style={{ flex: 1, color: t.text }}>{x.m}</span>
            <TonePill t={t} tone={x.t} label={x.s} />
          </div>
        ))}
      </Panel>
    </>
  );
}

function Journey({ t, steps, counts }: { t: Theme; steps: string[]; counts: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span className="cocc-pulse" style={{ width: 11, height: 11, borderRadius: '50%', background: i === steps.length - 1 ? t.green : t.teal, boxShadow: `0 0 8px ${t.teal}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: t.text }}>{s}</span>
            <span style={{ fontSize: 9, color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>{counts[i]}</span>
          </div>
          {i < steps.length - 1 && <span className="cocc-dash" style={{ width: 44, height: 2, background: t.teal, opacity: .6 }} />}
        </div>
      ))}
    </div>
  );
}

function BarRow({ t, data }: { t: Theme; data: { name: string; v: number }[] }) {
  const max = Math.max(...data.map(d => d.v));
  const colors = [t.sky, t.purple, t.teal, t.amber, t.green];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
      {data.map((d, i) => (
        <div key={d.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{d.v}</span>
          <div style={{ width: '100%', height: `${(d.v / max) * 100}%`, background: colors[i % colors.length], borderRadius: 6, minHeight: 4 }} />
          <span style={{ fontSize: 10, color: t.muted }}>{d.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Flow / Waiting / LOS ───────────────────────────────────────────────────────

function FlowView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Patient Flow" sub="Sankey — Community → Emergency → Ward → ICU → Home." />
      <Panel t={t} title="Hospital Flow Today">
        <Sankey t={t} />
        <div style={{ marginTop: 14 }}>
          <LiveFlow t={t} />
        </div>
      </Panel>
    </>
  );
}

function WaitingView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Waiting Time Intelligence" sub="Live heatmap — department × hour." />
      <Panel t={t} title="Current Waiting (min)" sub="Every queue, live">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
          {WAITING.map(w => (
            <div key={w.dept} style={{ background: t.panel2, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: toneColor(t, w.tone), fontFamily: "'JetBrains Mono', monospace" }}>{w.min} min</div>
              <div style={{ fontSize: 10.5, color: t.muted }}>{w.dept}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel t={t} title="Waiting Heatmap" sub="Hour × department — darker = longer">
        <WaitHeat t={t} />
      </Panel>
    </>
  );
}

function WaitHeat({ t }: { t: Theme }) {
  const depts = ['Emergency', 'Medicine Clinic', 'Radiology', 'Laboratory', 'Pharmacy'];
  const hours = ['08', '09', '10', '11', '12', '13', '14', '15'];
  const base: number[][] = [
    [14, 18, 20, 17, 15, 12, 11, 10], [12, 24, 31, 26, 19, 15, 13, 11],
    [11, 16, 22, 24, 18, 14, 12, 10], [9, 12, 12, 14, 13, 11, 10, 9], [8, 10, 15, 12, 11, 9, 8, 7],
  ];
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '110px repeat(8, 1fr)', gap: 3, minWidth: 640, fontSize: 9.5 }}>
        <div />
        {hours.map(h => <div key={h} style={{ textAlign: 'center', color: t.faint, fontFamily: "'JetBrains Mono', monospace" }}>{h}:00</div>)}
        {base.map((row, ri) => (
          <>
            <div key={`l${ri}`} style={{ display: 'flex', alignItems: 'center', color: t.muted }}>{depts[ri]}</div>
            {row.map((v, ci) => {
              const alpha = v / 31;
              const c = v > 22 ? t.red : v > 14 ? t.amber : t.green;
              return <div key={`${ri}-${ci}`} style={{ height: 26, borderRadius: 5, background: `${c}${Math.round(alpha * 60).toString(16).padStart(2, '0')}`, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v > 22 ? '#fff' : t.text, fontWeight: 700 }}>{v}</div>;
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function LosView({ t }: { t: Theme }) {
  const max = Math.max(...LOS_BREAKDOWN.map(l => l.days));
  return (
    <>
      <SectionTitle t={t} title="Length of Stay Intelligence" sub="One of the most important operational metrics." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Average LOS" value="5.4 Days" tone="info" mono />
        <Stat t={t} label="Median LOS" value="4.1 Days" tone="info" />
        <Stat t={t} label="Over Expected" value="18" tone="warning" />
        <Stat t={t} label="Longest (ICU)" value="9.8 d" tone="warning" />
      </div>
      <Panel t={t} title="LOS by Department" sub="Histogram">
        {LOS_BREAKDOWN.map(l => (
          <div key={l.dept} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ width: 110, fontWeight: 600, color: t.text, fontSize: 12 }}>{l.dept}</span>
            <div style={{ flex: 1, height: 16, borderRadius: 4, background: t.panel2, overflow: 'hidden' }}>
              <div style={{ width: `${(l.days / max) * 100}%`, height: '100%', background: toneColor(t, l.tone), borderRadius: 4 }} />
            </div>
            <span style={{ width: 44, textAlign: 'right', fontWeight: 800, color: toneColor(t, l.tone), fontFamily: "'JetBrains Mono', monospace" }}>{l.days} d</span>
          </div>
        ))}
      </Panel>
      <Panel t={t} title="AI — Patients Exceeding Expected LOS" sub="18 patients · hospital should act now">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {[{ c: 'Delayed Imaging', n: 6 }, { c: 'Delayed Theatre', n: 4 }, { c: 'Social Issues', n: 5 }, { c: 'Awaiting Insurance', n: 3 }].map(x => (
            <div key={x.c} style={{ background: t.amberSoft, border: `1px solid ${t.amber}40`, borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.amber }}>{x.n}</div>
              <div style={{ fontSize: 11, color: t.text }}>{x.c}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ── Bottlenecks / Performance ──────────────────────────────────────────────────

function BottlenecksView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Clinical Bottlenecks" sub="AMEXAN identifies the constraint — and recommends the fix." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {BOTTLENECKS.map(b => (
          <div key={b.name} style={{ background: t.panel, border: `1px solid ${toneColor(t, b.tone)}40`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <AlertTriangle size={14} color={toneColor(t, b.tone)} />
              <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{b.name}</span>
              <span style={{ marginLeft: 'auto' }}><TonePill t={t} tone={b.tone} /></span>
            </div>
            <div style={{ fontSize: 11, color: t.muted }}>{b.detail}</div>
            <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: t.skySoft, fontSize: 11, color: t.sky }}>↳ {b.rec}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function PerformanceView({ t }: { t: Theme }) {
  const [sort, setSort] = useState<{ key: keyof (typeof DEPT_ROWS)[0]; dir: 1 | -1 }>({ key: 'patients', dir: -1 });
  const rows = [...DEPT_ROWS].sort((a, b) => (a[sort.key] > b[sort.key] ? sort.dir : a[sort.key] < b[sort.key] ? -sort.dir : 0));
  const cols: { key: keyof (typeof DEPT_ROWS)[0]; label: string }[] = [
    { key: 'dept', label: 'Department' }, { key: 'patients', label: 'Patients' }, { key: 'admissions', label: 'Admissions' },
    { key: 'los', label: 'LOS' }, { key: 'revenue', label: 'Revenue' }, { key: 'occ', label: 'Occupancy' },
    { key: 'waiting', label: 'Waiting' }, { key: 'sat', label: 'Satisfaction' }, { key: 'quality', label: 'Quality' },
  ];
  return (
    <>
      <SectionTitle t={t} title="Department Performance" sub="Everything sortable — click a column header." />
      <Panel t={t} title="Performance Board">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 760 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(8, 0.7fr)', gap: 6, padding: '6px 8px' }}>
              {cols.map(c => (
                <button key={c.key} onClick={() => setSort(s => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : c.key === 'dept' ? 1 : -1 }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, fontFamily: 'inherit' }}>
                  {c.label} {sort.key === c.key ? (sort.dir === 1 ? '▲' : '▼') : ''}
                </button>
              ))}
            </div>
            {rows.map(r => (
              <div key={r.dept} style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(8, 0.7fr)', gap: 6, alignItems: 'center', padding: '8px 8px', borderRadius: 8, background: t.panel2, marginBottom: 4, fontSize: 11 }}>
                <span style={{ fontWeight: 800, color: t.text }}>{r.dept}</span>
                <span>{r.patients}</span><span>{r.admissions}</span><span>{r.los} d</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>KES {r.revenue.toLocaleString()}</span>
                <span>{r.occ}%</span><span>{r.waiting} min</span>
                <span style={{ color: r.sat >= 90 ? t.green : r.sat >= 85 ? t.amber : t.red }}>{r.sat}</span>
                <span style={{ color: r.quality >= 96 ? t.green : r.quality >= 90 ? t.amber : t.red }}>{r.quality}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </>
  );
}

// ── Intelligence / Forecast ────────────────────────────────────────────────────

function IntelligenceView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Clinical Intelligence" sub="Quality indicators the administrator monitors — never edits." />
      <Panel t={t} title="Clinical Quality Board" sub="Live — safe-care indicators">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
          {QUALITY.map(q => (
            <div key={q.label} style={{ background: t.panel2, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: toneColor(t, q.tone), fontFamily: "'JetBrains Mono', monospace" }}>{q.value}</div>
              <div style={{ fontSize: 9.5, color: t.muted }}>{q.label}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function ForecastView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Clinical Forecasting" sub="AI predicts — the hospital prepares." />
      <Panel t={t} title="Next 72 Hours" sub="AI shaded forecast — demand outlook">
        <ForecastLine t={t} />
      </Panel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {FORECAST.map(f => (
          <div key={f.label} style={{ background: t.panel, border: `1px solid ${toneColor(t, f.tone)}40`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: toneColor(t, f.tone), fontFamily: "'JetBrains Mono', monospace" }}>{f.value}</div>
            <div style={{ fontSize: 11.5, color: t.text, marginTop: 4 }}>{f.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function ForecastLine({ t }: { t: Theme }) {
  const hist = [20, 22, 24, 21, 26, 30, 28, 33];
  const fut = [36, 40, 44];
  const w = 320, h = 100, max = 55;
  const all = [...hist, ...fut];
  const path = (pts: number[], off: number) => pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${((off + i) / (all.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  const histP = path(hist, 0);
  const futP = path(fut, hist.length - 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, marginBottom: 6 }}>
        <span style={{ color: t.teal }}>■</span> observed · <span style={{ color: t.sky }}>┄</span> AI forecast
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: 100 }}>
        <line x1={(hist.length - 1) / (all.length - 1) * w} y1="0" x2={(hist.length - 1) / (all.length - 1) * w} y2={h} stroke={t.faint} strokeDasharray="3 4" />
        <path d={futP} fill="none" stroke={t.sky} strokeWidth="2" strokeDasharray="5 4" />
        <path d={histP} fill="none" stroke={t.teal} strokeWidth="2.5" />
        {fut.map((v, i) => <circle key={i} cx={((hist.length - 1 + i) / (all.length - 1)) * w} cy={h - (v / max) * h} r="4" fill={t.sky} />)}
        <text x={8} y={h - 8} fill={t.faint} fontSize="9" fontFamily="'JetBrains Mono', monospace">emergency demand</text>
      </svg>
    </div>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────────

function ReportsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Operational Reports" sub="One click · PDF · Excel · CSV · Power BI · FHIR." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
        {REPORTS.map(r => (
          <button key={r} style={{ textAlign: 'left', cursor: 'pointer', background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
            <BarChart3 size={16} color={t.sky} />
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text, margin: '8px 0 2px' }}>{r}</div>
            <div style={{ fontSize: 10.5, color: t.muted }}>PDF · XLSX · CSV · PBI · FHIR</div>
          </button>
        ))}
      </div>
      <Panel t={t} title="Operations Data Store" sub="The COCC reads from these stores — never writes clinical records.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.teal, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>PostgreSQL · operations</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{PG_TABLES.map(tb => <span key={tb} style={{ padding: '3px 8px', borderRadius: 6, background: t.panel2, border: `1px solid ${t.border}`, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>{tb}</span>)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Neo4j · patient journey</div>
            {[['Patient', 'ADMITTED_TO', 'Ward'], ['Patient', 'TRANSFERRED_TO', 'ICU'], ['Patient', 'UNDERWENT', 'Procedure'], ['Patient', 'DISCHARGED_FROM', 'Hospital']].map(([a, rel, b], i) => (
              <div key={i} style={{ fontSize: 10.5, color: t.muted, fontFamily: "'JetBrains Mono', monospace", display: 'flex', gap: 6 }}><span style={{ color: t.text }}>{a}</span><span style={{ color: t.teal }}>{rel}</span><span style={{ color: t.text }}>{b}</span></div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.sky, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Firestore · realtime</div>
            {['live occupancy', 'live queues', 'emergency', 'digital twin', 'alerts', 'operations wall'].map(x => (<div key={x} style={{ fontSize: 10.5, color: t.muted, fontFamily: "'JetBrains Mono', monospace", padding: '3px 0' }}>· {x}</div>))}
          </div>
        </div>
      </Panel>
    </>
  );
}

// ── Charts shared ──────────────────────────────────────────────────────────────

function TrendLine({ t, color, seed, label }: { t: Theme; color: string; seed: number[]; label: string }) {
  const [pts, setPts] = useState<number[]>(seed);
  useEffect(() => {
    const id = setInterval(() => {
      setPts(p => [...p.slice(1), Math.max(0, (p[p.length - 1] || seed[seed.length - 1]) + (Math.random() * 6 - 3))]);
    }, 2400);
    return () => clearInterval(id);
  }, [seed]);
  const w = 320, h = 90, max = Math.max(...pts) * 1.3;
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(pts[pts.length - 1])}</span>
        <span style={{ fontSize: 10, color: t.muted }}>{label}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: 90 }}>
        <defs><linearGradient id="coccfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#coccfill)" /><path d={path} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );
}

function GaugeChart({ t, value, label, sub }: { t: Theme; value: number; label: string; sub: string }) {
  const c = value > 85 ? t.red : value > 70 ? t.amber : t.green;
  const r = 60;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - value / 100);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 160, margin: '0 auto' }}>
        <svg width="160" height="100" viewBox="0 0 160 100">
          <path d="M20 90 A 60 60 0 0 1 140 90" fill="none" stroke={t.panel2} strokeWidth="14" strokeLinecap="round" />
          <path d="M20 90 A 60 60 0 0 1 140 90" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, fontSize: 26, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      </div>
      <div style={{ fontSize: 10.5, color: t.muted, marginTop: 8 }}>{sub}</div>
    </div>
  );
}
