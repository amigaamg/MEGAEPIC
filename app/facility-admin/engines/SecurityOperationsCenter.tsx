'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN — Hospital Security Operations Center (HSOC) · Engine XIII
//
// Far bigger than authentication. Every action in the AMEXAN ecosystem is
// continuously monitored, cryptographically audited, behaviorally analyzed and
// permanently preserved. Nothing is deleted — every event becomes part of an
// immutable constitutional audit trail supporting clinical governance,
// cybersecurity, forensics, compliance, executive oversight and patient trust.
//
// Style: Sentinel × CrowdStrike × Azure Security Center × Splunk × SOC/NOC,
// purpose-built for healthcare. Dark/Light. Live — this engine never sleeps.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, ClipboardCheck, Cpu, FileText,
  Fingerprint, Gauge, HeartPulse, KeyRound, Lock, Megaphone, Monitor,
  Moon, Network, Search, Server, Settings2, ShieldCheck, Sun, TrendingUp,
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
  bg: '#04110d', panel: '#0c1a1a', panel2: '#122426', border: 'rgba(45,212,191,.14)',
  text: '#e6f5f1', muted: '#93b5b0', faint: '#5c7a75',
  green: '#2dd4bf', amber: '#fbbf24', red: '#f87171', sky: '#38bdf8', purple: '#a78bfa', teal: '#34d399',
  greenSoft: 'rgba(45,212,191,.12)', amberSoft: 'rgba(251,191,36,.12)', redSoft: 'rgba(248,113,113,.12)', skySoft: 'rgba(56,189,248,.12)',
  glowGreen: '0 0 10px rgba(45,212,191,.55)',
};

const LIGHT: Theme = {
  name: 'light',
  bg: '#eef4f2', panel: '#ffffff', panel2: '#f0f6f4', border: '#d3e4e0',
  text: '#0b2c2a', muted: '#4f6f6a', faint: '#8aa6a1',
  green: '#0d9488', amber: '#d97706', red: '#dc2626', sky: '#0284c7', purple: '#7c3aed', teal: '#059669',
  greenSoft: 'rgba(13,148,136,.1)', amberSoft: 'rgba(217,119,6,.1)', redSoft: 'rgba(220,38,38,.1)', skySoft: 'rgba(2,132,199,.1)',
  glowGreen: '0 0 8px rgba(13,148,136,.4)',
};

// ── Data catalogue ─────────────────────────────────────────────────────────────

const EXEC_WALL = [
  { label: "Today's Logins", value: '18,441', tone: 'info' as Tone },
  { label: 'Successful', value: '18,426', tone: 'healthy' as Tone },
  { label: 'Failed', value: '15', tone: 'warning' as Tone },
  { label: 'Blocked', value: '4', tone: 'critical' as Tone },
  { label: 'Password Resets', value: '11', tone: 'warning' as Tone },
  { label: 'MFA Challenges', value: '291', tone: 'info' as Tone },
  { label: 'New Devices', value: '8', tone: 'warning' as Tone },
  { label: 'Suspicious Activities', value: '3', tone: 'critical' as Tone },
];

const DEPT_ACTIVITY = [
  { dept: 'Emergency', users: 42 }, { dept: 'Medicine', users: 91 }, { dept: 'ICU', users: 38 },
  { dept: 'Laboratory', users: 24 }, { dept: 'Radiology', users: 18 }, { dept: 'Pharmacy', users: 16 },
  { dept: 'Theatre', users: 27 }, { dept: 'Outpatient', users: 73 }, { dept: 'Admin', users: 49 },
];

const CYBER_INTEL: { name: string; status: string; tone: Tone; detail: string }[] = [
  { name: 'Brute Force', status: 'Blocked', tone: 'healthy', detail: '3 attempts today' },
  { name: 'Malware', status: 'Blocked', tone: 'healthy', detail: '0 detections' },
  { name: 'Phishing', status: 'Watch', tone: 'warning', detail: '1 reported' },
  { name: 'Ransomware', status: 'Watch', tone: 'warning', detail: 'None active' },
  { name: 'DDoS', status: 'Watch', tone: 'warning', detail: 'None' },
  { name: 'Port Scan', status: 'Watch', tone: 'warning', detail: '2 detected' },
  { name: 'SQL Injection', status: 'Blocked', tone: 'healthy', detail: 'Blocked' },
  { name: 'Zero-Day', status: 'None', tone: 'healthy', detail: 'None' },
];

const DEVICE_HEALTH = [
  { label: 'Servers', value: 'Healthy', tone: 'healthy' as Tone },
  { label: 'UPS', value: 'Healthy', tone: 'healthy' as Tone },
  { label: 'Firewall', value: 'Healthy', tone: 'healthy' as Tone },
  { label: 'Backup', value: 'Running', tone: 'healthy' as Tone },
  { label: 'Storage', value: '81%', tone: 'warning' as Tone },
  { label: 'CPU', value: '42%', tone: 'healthy' as Tone },
];

const DEVICES = [
  { name: 'Hospital PC', count: 412, tone: 'healthy' as Tone },
  { name: 'Nurse Tablet', count: 210, tone: 'healthy' as Tone },
  { name: 'Doctor Laptop', count: 340, tone: 'healthy' as Tone },
  { name: 'CT Scanner', count: 2, tone: 'healthy' as Tone },
  { name: 'MRI Console', count: 2, tone: 'healthy' as Tone },
  { name: 'Laboratory Analyzer', count: 24, tone: 'warning' as Tone },
  { name: 'Ventilator', count: 21, tone: 'healthy' as Tone },
  { name: 'Patient Monitor', count: 186, tone: 'healthy' as Tone },
  { name: 'Router', count: 44, tone: 'healthy' as Tone },
  { name: 'Firewall', count: 6, tone: 'healthy' as Tone },
  { name: 'Printer', count: 88, tone: 'healthy' as Tone },
  { name: 'Server', count: 32, tone: 'healthy' as Tone },
];

const SESSIONS = [
  { user: 'Dr Mary', role: 'Radiologist', device: 'MacBook Pro', ip: '192.168.4.22', browser: 'Safari', country: 'KE', building: 'Block A', dept: 'Radiology', patient: 'AMX-PT-00211', duration: '58 min', risk: 'healthy' as Tone },
  { user: 'Dr John', role: 'Consultant', device: 'Lenovo T14', ip: '192.168.7.10', browser: 'Chrome', country: 'KE', building: 'Block B', dept: 'Medicine Clinic', patient: 'AMX-PT-88102', duration: '3 hr 12 min', risk: 'healthy' as Tone },
  { user: 'Nurse Anne', role: 'Nurse', device: 'iPad', ip: '192.168.9.15', browser: 'Safari', country: 'KE', building: 'Ward 3', dept: 'Medicine Ward', patient: 'AMX-PT-12811', duration: '1 hr 6 min', risk: 'healthy' as Tone },
  { user: 'ICT Ops', role: 'ICT Officer', device: 'ThinkPad', ip: '10.0.0.8', browser: 'Edge', country: 'KE', building: 'Data Centre', dept: 'ICT', patient: '—', duration: '7 hr 40 min', risk: 'warning' as Tone },
  { user: 'Lab Tech 6', role: 'Lab Technologist', device: 'Desktop', ip: '192.168.11.3', browser: 'Firefox', country: 'KE', building: 'Block C', dept: 'Laboratory', patient: '—', duration: '2 hr 30 min', risk: 'healthy' as Tone },
  { user: 'CEO', role: 'Chief Executive', device: 'MacBook Pro', ip: '41.90.8.204', browser: 'Chrome', country: 'KE', building: 'Administration', dept: 'Executive', patient: '—', duration: '38 min', risk: 'healthy' as Tone },
  { user: 'Unknown', role: '—', device: 'Unknown Device', ip: '185.220.101.12', browser: '—', country: '—', building: '—', dept: '—', patient: '—', duration: '00:02', risk: 'critical' as Tone },
];

const AUDIT_EVENTS = [
  { time: '09:24', user: 'Unknown', action: 'Failed Login', device: 'Unknown Device', detail: 'Blocked', tone: 'critical' as Tone },
  { time: '09:23', user: 'CEO', action: 'Generated Executive Report', device: 'MacBook Pro', detail: 'Executive', tone: 'healthy' as Tone },
  { time: '09:23', user: 'ICT', action: 'Server Patch Installed', device: 'ThinkPad', detail: 'Server VLAN', tone: 'healthy' as Tone },
  { time: '09:22', user: 'Radiology', action: 'CT Brain Report Signed', device: 'Radiology Console', detail: 'AMX-PT-002118', tone: 'healthy' as Tone },
  { time: '09:22', user: 'Nurse Anne', action: 'Updated Vital Signs', device: 'iPad', detail: 'Patient AMX-PT-12811', tone: 'healthy' as Tone },
  { time: '09:21', user: 'Dr James', action: 'Logged in', device: 'Lenovo', detail: 'Medicine Ward', tone: 'healthy' as Tone },
];

const LANDING = [
  { label: 'Security Status', value: 'HEALTHY', tone: 'healthy' as Tone },
  { label: 'Threat Level', value: 'LOW', tone: 'healthy' as Tone },
  { label: 'Hospital Trust Score', value: '99.8%', tone: 'healthy' as Tone },
  { label: 'Realtime Users', value: '418', tone: 'info' as Tone },
  { label: 'Active Sessions', value: '613', tone: 'info' as Tone },
  { label: 'Protected Devices', value: '2,841', tone: 'info' as Tone },
  { label: 'Critical Alerts', value: '0', tone: 'healthy' as Tone },
  { label: 'Medium Alerts', value: '3', tone: 'warning' as Tone },
  { label: 'Resolved Today', value: '18', tone: 'info' as Tone },
  { label: 'Open Investigations', value: '2', tone: 'warning' as Tone },
];

const AUDIT_COLS = ['Who', 'What', 'When', 'Where', 'Device', 'Patient', 'Department', 'Reason', 'Approval', 'Hash'];
const AUDIT_ROWS = [
  { who: 'Dr. Njeri', what: 'Viewed patient record', when: '09:18', where: 'Block B / 3', device: 'Lenovo-T3', patient: 'AMX-PT-00177', dep: 'Internal', reason: 'Routine', approval: 'Auto', hash: '9f2c…c41a' },
  { who: 'Nurse Anne', what: 'Edited diagnosis', when: '09:11', where: 'Ward 3', device: 'iPad-14', patient: 'AMX-PT-12811', dep: 'Medicine', reason: 'Care plan', approval: 'SYS', hash: '77aa…901b' },
  { who: 'Lab Tech 6', what: 'Exported lab results', when: '08:52', where: 'Block C', device: 'LAB-PC-014', patient: 'AMX-PT-33012', dep: 'Laboratory', reason: 'External QA', approval: 'MANAGER ✓', hash: '02e1…b38c' },
  { who: 'Dr. Kariuki', what: 'Viewed VIP patient', when: '08:40', where: 'Radiology', device: 'Console-2', patient: 'AMX-PT-VIP-001', dep: 'Radiology', reason: 'Review', approval: 'BIOMETRIC ✓', hash: 'ee32…7fa9' },
  { who: 'ICT', what: 'Password reset', when: '08:21', where: 'Data Centre', device: 'ThinkPad', patient: '—', dep: 'ICT', reason: 'Expired', approval: 'MFA ✓', hash: '12b8…09d4' },
];

const INSIGHTS = [
  { user: 'Dr John', text: 'Accessed 312 patient records in 15 minutes — significantly above usual behavior.', tone: 'critical' as Tone, at: '09:17' },
  { user: 'LAB-PC-014', text: 'Laboratory workstation has not received security updates for 41 days.', tone: 'warning' as Tone, at: '09:03' },
  { user: 'Emergency', text: 'Three failed logins originated from the Emergency Department in the last 20 minutes.', tone: 'warning' as Tone, at: '08:56' },
  { user: 'Dr. Mary', text: 'New device (MacBook Pro) authorized — risk re-scored to 12 / 100.', tone: 'info' as Tone, at: '08:31' },
];

const COMPLIANCE = [
  { name: 'HIPAA', status: 'Compliant', score: 99.8, tone: 'healthy' as Tone },
  { name: 'GDPR', status: 'Compliant', score: 94.2, tone: 'healthy' as Tone },
  { name: 'Kenya DPA', status: 'Compliant', score: 97.6, tone: 'healthy' as Tone },
  { name: 'ISO 27001', status: 'Compliant', score: 93.1, tone: 'healthy' as Tone },
  { name: 'MOH Reporting', status: 'On-track', score: 99.0, tone: 'healthy' as Tone },
  { name: 'FHIR Security', status: 'Audit', score: 88.4, tone: 'warning' as Tone },
];

const INCIDENT_STEPS = ['Create Security Incident', 'Assign Investigator', 'Evidence', 'Timeline', 'Resolution', 'Root Cause', 'CAPA', 'Close'];
const FORENSICS_TIMELINE = ['Login', 'Viewed Patient', 'Modified Diagnosis', 'Printed', 'Exported', 'USB Connected', 'Logout'];
const PERMISSION_ALLOWED = ['History', 'Examination', 'Orders', 'Prescription', 'Admissions', 'Discharge'];
const PERMISSION_DENIED = ['Payroll', 'Finance', 'Delete Records', 'User Management'];

const PG_TABLES = ['users', 'sessions', 'devices', 'permissions', 'audit_logs', 'security_incidents', 'mfa', 'investigations', 'access_reviews', 'risk_scores', 'login_history'];
const NEO4J_EDGES = [
  ['User', 'LOGGED_IN_FROM', 'Device'], ['User', 'ACCESSED', 'Patient'], ['User', 'WORKS_IN', 'Department'],
  ['Device', 'CONNECTED_TO', 'Network'], ['Incident', 'INVOLVES', 'User'],
];

const fmt = (n: number) => n.toLocaleString();

type Tone = 'healthy' | 'warning' | 'critical' | 'offline' | 'info';

// ── Atoms ──────────────────────────────────────────────────────────────────────

function toneColor(t: Theme, tone: Tone): string {
  switch (tone) {
    case 'healthy': return t.green;
    case 'warning': return t.amber;
    case 'critical': case 'offline': return t.red;
    default: return t.sky;
  }
}

function ToneDot({ t, tone }: { t: Theme; tone: Tone }) {
  const c = toneColor(t, tone);
  return <span className={tone === 'healthy' ? 'soc-pulse' : undefined} style={{ width: 9, height: 9, borderRadius: '50%', background: c, boxShadow: tone === 'healthy' ? `0 0 10px ${c}` : undefined, flexShrink: 0 }} />;
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

// ── HSOC ───────────────────────────────────────────────────────────────────────

const VIEW_IDs = {
  overview: 'overview', activity: 'activity', threat: 'threat', identity: 'identity', sessions: 'sessions',
  devices: 'devices', networks: 'networks', clinical: 'clinical', audit: 'audit',
  investigations: 'investigations', permissions: 'permissions', mfa: 'mfa', passwords: 'passwords',
  behavior: 'behavior', risk: 'risk', incident: 'incident', compliance: 'compliance',
  forensics: 'forensics', reports: 'reports', settings: 'settings',
} as const;
type ViewId = (typeof VIEW_IDs)[keyof typeof VIEW_IDs];

export function SecurityOperationsCenter() {
  const [dark, setDark] = useState(true);
  const [view, setView] = useState<ViewId>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = dark ? DARK : LIGHT;

  const nav: { id: ViewId; label: string; icon: any }[] = [
    { id: 'overview', label: 'Security Overview', icon: ShieldCheck },
    { id: 'activity', label: 'Realtime Activity', icon: Activity },
    { id: 'threat', label: 'Threat Intelligence', icon: AlertTriangle },
    { id: 'identity', label: 'Identity & Access', icon: Fingerprint },
    { id: 'sessions', label: 'Sessions', icon: Monitor },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'networks', label: 'Networks', icon: Network },
    { id: 'clinical', label: 'Clinical Security', icon: HeartPulse },
    { id: 'audit', label: 'Audit Center', icon: FileText },
    { id: 'investigations', label: 'Investigations', icon: Search },
    { id: 'permissions', label: 'Permissions', icon: KeyRound },
    { id: 'mfa', label: 'MFA', icon: Lock },
    { id: 'passwords', label: 'Passwords', icon: KeyRound },
    { id: 'behavior', label: 'Behavioral Analytics', icon: TrendingUp },
    { id: 'risk', label: 'Risk Scores', icon: Gauge },
    { id: 'incident', label: 'Incident Response', icon: Megaphone },
    { id: 'compliance', label: 'Compliance', icon: ClipboardCheck },
    { id: 'forensics', label: 'Digital Forensics', icon: Search },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: t.bg, color: t.text, fontFamily: "'Inter', 'Noto Sans', system-ui, sans-serif", display: 'flex' }}>
      <style>{`
        .soc-pulse{animation:socPulse 2.2s ease-in-out infinite}
        @keyframes socPulse{0%,100%{opacity:1}50%{opacity:.4}}
        .soc-scan{animation:socScan 3s linear infinite}
        @keyframes socScan{0%{transform:translateX(-30%)}100%{transform:translateX(130%)}}
        .soc-line{stroke-dasharray:5 7;animation:socFlow 1s linear infinite}
        @keyframes socFlow{to{stroke-dashoffset:-12}}
        @media(max-width:900px){.soc-side{position:fixed;left:0;top:60px;bottom:0;z-index:25;box-shadow:0 10px 40px rgba(0,0,0,.4)}.soc-main{padding:14px!important}}
      `}</style>

      <aside className="soc-side" style={{ width: 232, flexShrink: 0, background: t.panel, borderRight: `1px solid ${t.border}`, padding: '12px 10px', overflowY: 'auto', display: mobileOpen ? 'block' : undefined }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: t.muted, textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={13} color={t.teal} /> SOC · Engine XIII
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

      <main className="soc-main" style={{ flex: 1, overflowY: 'auto', padding: 22, position: 'relative' }}>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 20 }} />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 8, padding: 6, cursor: 'pointer' }} className="soc-menu" aria-label="Menu"><ShieldCheck size={16} color={t.text} /></button>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>Hospital Security Operations Center</div>
            <div style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>Engine XIII · never sleeps · immutable audit · behavioral intelligence</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: t.panel, border: `1px solid ${t.border}` }}>
            <span className="soc-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: t.green, boxShadow: t.glowGreen }} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Live · 09:24</span>
          </div>
        </div>

        {view === 'overview' && <Overview t={t} />}
        {view === 'activity' && <ActivityFeed t={t} full />}
        {view === 'threat' && <ThreatView t={t} />}
        {view === 'identity' && <IdentityView t={t} />}
        {view === 'sessions' && <SessionsView t={t} />}
        {view === 'devices' && <DevicesView t={t} />}
        {view === 'networks' && <NetworksView t={t} />}
        {view === 'clinical' && <ClinicalView t={t} />}
        {view === 'audit' && <AuditView t={t} />}
        {view === 'investigations' && <InvestigationsView t={t} />}
        {view === 'permissions' && <PermissionsView t={t} />}
        {view === 'mfa' && <MfaView t={t} />}
        {view === 'passwords' && <PasswordsView t={t} />}
        {view === 'behavior' && <BehaviorView t={t} />}
        {view === 'risk' && <RiskView t={t} />}
        {view === 'incident' && <IncidentView t={t} />}
        {view === 'compliance' && <ComplianceView t={t} />}
        {view === 'forensics' && <ForensicsView t={t} />}
        {view === 'reports' && <ReportsView t={t} />}
        {view === 'settings' && <SettingsView t={t} />}
      </main>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────

function Overview({ t }: { t: Theme }) {
  const tt = t;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionTitle t={tt} title="Hospital Security Overview" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {LANDING.map(k => <Stat key={k.label} t={tt} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>

      <Panel t={tt} title="Executive Security Wall" sub="Live — every login, challenge, new device and anomaly, as it happens.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {EXEC_WALL.map(k => (
            <div key={k.label} style={{ background: tt.panel2, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ color: toneColor(tt, k.tone), fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</span>
              <span style={{ fontSize: 9.5, color: tt.muted }}>{k.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(260px,0.42fr)', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ActivityFeed t={tt} />
          <HospitalMap t={tt} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel t={tt} title="Cybersecurity Intelligence" sub="Live threat posture">
            {CYBER_INTEL.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${tt.border}`, fontSize: 11.5 }}>
                <ToneDot t={tt} tone={c.tone} />
                <span style={{ fontWeight: 700, color: tt.text, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 10, color: tt.muted }}>{c.detail}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: toneColor(tt, c.tone) }}>{c.tone === 'healthy' ? 'None' : c.status === 'Blocked' ? 'Blocked' : 'Watch'}</span>
              </div>
            ))}
          </Panel>

          <Panel t={tt} title="Device Health" sub="Infrastructure in real time">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEVICE_HEALTH.map((d, i) => {
                const c = toneColor(tt, d.tone === 'healthy' ? 'healthy' : d.tone === 'warning' ? 'warning' : 'critical');
                return (
                  <div key={d.label} style={{ background: tt.panel2, borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9.5, color: tt.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>{d.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{d.value}</div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel t={tt} title="AI Security Assistant" sub="Sentinel continuously analyzing">
            {INSIGHTS.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: `1px solid ${tt.border}`, fontSize: 11.5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: toneColor(tt, n.tone), marginTop: 4, flexShrink: 0 }} />
                <span><b style={{ color: tt.text }}>{n.user}</b> <span style={{ color: tt.muted }}>— {n.text}</span></span>
                <span style={{ marginLeft: 'auto', fontSize: 9.5, color: tt.faint, flexShrink: 0 }}>{n.at}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function TonePill({ t, tone, label }: { t: Theme; tone: Tone; label?: string }) {
  const c = toneColor(t, tone);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: `${c}1a`, color: c, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      <ToneDot t={t} tone={tone} /> {label || tone}
    </span>
  );
}

// ── Hospital Activity Map ──────────────────────────────────────────────────────

function HospitalMap({ t }: { t: Theme }) {
  const max = Math.max(...DEPT_ACTIVITY.map(d => d.users));
  return (
    <Panel t={t} title="Hospital Activity Map" sub="Every department lights up in real time — the hospital's digital twin">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
        {DEPT_ACTIVITY.map(d => {
          const pct = d.users / max;
          const heat = pct > 0.8 ? t.amber : pct > 0.5 ? t.teal : t.sky;
          return (
            <div key={d.dept} style={{ background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 10, padding: 12, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${Math.round(pct * 100)}%`, background: `${heat}22` }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="soc-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: heat, boxShadow: `0 0 8px ${heat}` }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{d.dept}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{d.users}</div>
                <div style={{ fontSize: 9.5, color: t.muted }}>users online</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ── Realtime Activity Feed ─────────────────────────────────────────────────────

type FeedEvent = { time: string; user: string; action: string; detail: string; tone: Tone };

const POOL: Omit<FeedEvent, 'time'>[] = [
  { user: 'Dr. Amina', action: 'Viewing patient record', detail: 'AMX-PT-22011', tone: 'info' },
  { user: 'Lab', action: 'Signed lab result', detail: 'Patient AMX-PT-33012', tone: 'healthy' },
  { user: 'AUTH', action: 'MFA challenge passed', detail: 'Dr. Omar', tone: 'healthy' },
  { user: 'AUTH', action: 'Failed login blocked', detail: 'Unknown device', tone: 'critical' },
  { user: 'Pharmacy', action: 'Dispensed prescription', detail: 'AMX-PT-11887', tone: 'healthy' },
  { user: 'ICT', action: 'Firewall rule updated', detail: 'Service VLAN', tone: 'healthy' },
  { user: 'CEO', action: 'Opened executive dashboard', detail: 'Block A', tone: 'healthy' },
  { user: 'VIP WATCH', action: 'VIP patient record opened', detail: 'AMX-PT-VIP-001', tone: 'warning' },
  { user: 'Device', action: 'CT Scanner heartbeat', detail: 'Radiology', tone: 'healthy' },
];

function ActivityFeed({ t, full }: { t: Theme; full?: boolean }) {
  const [events, setEvents] = useState<FeedEvent[]>(() => AUTH_SEVENTS.map(e => ({ ...e })));
  const idx = useRef(0);
  useEffect(() => {
    if (!full) return;
    const id = setInterval(() => {
      const ev = POOL[idx.current % POOL.length];
      idx.current += 1;
      setEvents(p => [{ time: new Date().toLocaleTimeString([], { hour12: false }), ...ev }, ...p].slice(0, 60));
    }, 5000);
    return () => clearInterval(id);
  }, [full]);
  return (
    <Panel t={t} title={full ? "Realtime Activity Feed" : "Live Activity Feed"} sub={full ? 'The hospital black-box recorder — never erased, never deleted.' : 'Scrolling forever · never erased'} action={full ? undefined : <span className="soc-pulse" style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:t.green, fontWeight:700 }}><span style={{ width:7,height:7,borderRadius:'50%',background:t.green,boxShadow:t.glowGreen }} />LIVE</span>}>
      <div style={{ maxHeight: full ? '72vh' : 380, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {(full ? events.slice(0, 24) : events.slice(0, 7)).map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11 }}>
            <span style={{ color: t.faint, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, width: 44, flexShrink: 0 }}>{e.time}</span>
            <span style={{ color: toneColor(t, e.tone), flexShrink: 0, width: 8 }}>●</span>
            <span style={{ fontWeight: 700, color: t.text }}>{e.user}</span>
            <span style={{ color: t.muted }}>{e.action}</span>
            <span style={{ marginLeft: 'auto', color: t.faint, fontSize: 9.5 }}>{e.detail}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const AUTH_SEVENTS: FeedEvent[] = [
  { time: '09:24', user: 'AUTH', action: 'Failed login — Unknown Device', detail: 'Blocked', tone: 'critical' },
  { time: '09:23', user: 'ICT', action: 'Server Patch Installed', detail: 'Server-04', tone: 'healthy' },
  { time: '09:23', user: 'CEO', action: 'Generated Executive Report', detail: 'Dashboard', tone: 'healthy' },
  { time: '09:22', user: 'Radiology', action: 'CT Brain Report Signed', detail: 'AMX-PT-002118', tone: 'healthy' },
  { time: '09:22', user: 'Nurse Anne', action: 'Updated Vital Signs', detail: 'AMX-PT-12811', tone: 'healthy' },
  { time: '09:21', user: 'Dr James', action: 'Logged in', detail: 'Medicine Ward', tone: 'healthy' },
];

// ── Threat Intelligence ────────────────────────────────────────────────────────

function ThreatView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Threat Intelligence" sub="Live global + hospital threat posture." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {CYBER_INTEL.map(c => <Stat key={c.name} t={t} label={c.name} value={c.detail} tone={c.tone} />)}
      </div>
      <Panel t={t} title="Failed Login Trend" sub="Last 24 hours — autoblocked brute force">
        <TrendLine t={t} />
      </Panel>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }}>
        <Panel t={t} title="Login Heatmap" sub="Hours × days across the hospital">
          <Heatmap t={t} />
        </Panel>
        <Panel t={t} title="Threat Response" sub="Every event gated — nothing bypassed">
          {['Brute force auto-blocked', 'Malware quarantined at endpoint', 'Phishing link removed from inbox', 'Anomalous export held for review', 'Impossible travel auto-blocked'].map(x => (
            <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
              <ShieldCheck size={13} color={t.green} /> <span style={{ color: t.text }}>{x}</span>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function TrendLine({ t }: { t: Theme }) {
  const [pts, setPts] = useState<number[]>([3, 5, 2, 8, 6, 12, 9, 7, 4, 6, 3, 2, 1]);
  useEffect(() => {
    const id = setInterval(() => setPts(p => [...p.slice(1), Math.max(0, Math.min(14, (p[p.length - 1] || 1) + (Math.random() * 4 - 2)))]), 2200);
    return () => clearInterval(id);
  }, []);
  const w = 320, h = 90, max = 16;
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: t.amber, fontFamily: "'JetBrains Mono', monospace" }}>{last}</span>
        <span style={{ fontSize: 10, color: t.muted }}>failed in this window</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: 90 }}>
        <defs><linearGradient id="socfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.amber} stopOpacity=".3" /><stop offset="100%" stopColor={t.amber} stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#socfill)" /><path d={path} fill="none" stroke={t.amber} strokeWidth="2" />
        <text x={8} y={h/2} fill={t.faint} fontSize="9" fontFamily="'JetBrains Mono', monospace">attempts ▼</text>
      </svg>
    </div>
  );
}

function Heatmap({ t }: { t: Theme }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['0', '4', '8', '12', '16', '20'];
  const rand = (a: number) => Math.floor(Math.random() * a);
  const cells: number[][] = days.map(() => Array.from({ length: 6 }, () => rand(6)));
  return (
    <div style={{ fontSize: 9.5 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 4 }}>
        <div />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
          {hours.map(h => <div key={h} style={{ textAlign: 'center', color: t.faint, fontFamily: "'JetBrains Mono', monospace" }}>{h}</div>)}
        </div>
      </div>
      {days.map((d, di) => (
        <div key={d} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 4, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ color: t.muted, fontSize: 9.5 }}>{d}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
            {cells[di].map((v, i) => {
              const alpha = v / 6;
              const color = v > 3 ? t.red : v > 1 ? t.amber : t.green;
              return <div key={i} style={{ height: 22, borderRadius: 4, background: `${color}${Math.round(alpha * 50).toString(16).padStart(2, '0')}`, border: `1px solid ${t.border}` }} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Identity & Access ──────────────────────────────────────────────────────────

function IdentityView({ t }: { t: Theme }) {
  const scores = ['Identity Score', 'Authentication Score', 'Risk Score', 'Behavior Score', 'Trust Score'];
  const users = [
    { name: 'Dr John', role: 'Consultant', trust: 99, devices: 2, failed: 0, current: 'Medicine Clinic', tone: 'healthy' as Tone },
    { name: 'Dr Mary', role: 'Radiologist', trust: 97, devices: 3, failed: 1, current: 'Radiology', tone: 'healthy' as Tone },
    { name: 'Nurse Anne', role: 'Nurse', trust: 98, devices: 2, failed: 0, current: 'Medicine Ward', tone: 'healthy' as Tone },
    { name: 'ICT Ops', role: 'ICT Officer', trust: 92, devices: 4, failed: 2, current: 'Data Centre', tone: 'warning' as Tone },
    { name: 'Lab Tech 6', role: 'Lab Technologist', trust: 88, devices: 1, failed: 5, current: 'Laboratory', tone: 'warning' as Tone },
  ];
  return (
    <>
      <SectionTitle t={t} title="Identity & Access Monitoring" sub="Every user carries a permanent, continuously recomputed identity profile." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {scores.map(s => <Stat key={s} t={t} label={s} value="—" tone="info" />)}
      </div>
      <Panel t={t} title="Identity Profiles" sub="Identity · Authentication · Risk · Behavior · Trust">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => (
            <div key={u.name} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.6fr 0.6fr 1.2fr auto', gap: 10, alignItems: 'center', background: t.panel2, borderRadius: 8, padding: '10px 12px' }}>
              <div><div style={{ fontWeight: 700, color: t.text }}>{u.name}</div><div style={{ fontSize: 9.5, color: t.faint }}>{u.role}</div></div>
              <div><div style={{ fontSize: 15, fontWeight: 800, color: t.green }}>{u.trust}%</div><div style={{ fontSize: 9, color: t.muted }}>Trust</div></div>
              <div style={{ fontSize: 10.5, color: t.muted }}>{u.devices} devices · {u.failed} failed</div>
              <div style={{ fontSize: 10.5, color: t.muted }}>Current: <b style={{ color: t.text }}>{u.current}</b></div>
              <ToneDot t={t} tone={u.tone} />
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ── Sessions ───────────────────────────────────────────────────────────────────

function SessionsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Session Intelligence" sub="Every active session — who, role, device, IP, browser, location, building, department." />
      <Panel t={t} title={`Active Sessions · ${fmt(613)}`}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 820 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.8fr 1fr 0.8fr 0.7fr 0.6fr 0.8fr 0.8fr 0.6fr', gap: 8, padding: '6px 8px', fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
              {['User', 'Role', 'Device', 'IP', 'Browser', 'Country', 'Department', 'Patient', 'Risk'].map(h => <span key={h}>{h}</span>)}
            </div>
            {SESSIONS.map(s => (
              <div key={s.user + s.ip} style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.8fr 0.8fr 0.8fr 0.7fr 0.6fr 0.8fr 0.8fr 0.6fr', gap: 5, alignItems: 'center', padding: '8px 8px', borderRadius: 8, background: t.panel2, marginBottom: 4, fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: t.text }}>{s.user}</span>
                <span style={{ color: t.muted }}>{s.role}</span>
                <span style={{ color: t.muted }}>{s.device}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.muted }}>{s.ip}</span>
                <span style={{ color: t.muted }}>{s.browser}</span>
                <span style={{ color: t.muted }}>{s.country}</span>
                <span style={{ color: t.muted }}>{s.dept}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{s.user.length ? (s.patient === '—' ? '—' : <span style={{ color: t.sky }}>{s.patient}</span>) : '—'}</span>
                <TonePill t={t} tone={s.risk} label={s.risk} />
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </>
  );
}

// ── Devices ────────────────────────────────────────────────────────────────────

function DevicesView({ t }: { t: Theme }) {
  const [sel, setSel] = useState(DEVICES[0]);
  const detail = (sel.name === 'CT Scanner' || sel.name === 'MRI Console') ? [
    { label: 'Firmware', value: 'Healthy', tone: 'healthy' as Tone }, { label: 'Updates', value: 'Current', tone: 'healthy' as Tone },
    { label: 'Network', value: 'Connected', tone: 'healthy' as Tone }, { label: 'Users', value: 'Radiology', tone: 'info' as Tone },
    { label: 'Security', value: 'Healthy', tone: 'healthy' as Tone }, { label: 'Warranty', value: '2 Years', tone: 'info' as Tone },
  ] : null;
  return (
    <>
      <SectionTitle t={t} title="Device Intelligence" sub="Every device — click to inspect firmware, network, security, warranty." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        {DEVICES.map(d => {
          return (
            <button key={d.name} onClick={() => setSel(d)} style={{ textAlign: 'left', cursor: 'pointer', background: t.panel, border: `1px solid ${sel.name === d.name ? toneColor(t, d.tone) : t.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Cpu size={14} color={toneColor(t, d.tone)} /><span style={{ fontSize: 12.5, fontWeight: 800, color: t.text }}>{d.name}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{d.count}</div>
              <TonePill t={t} tone={d.tone} />
            </button>
          );
        })}
      </div>
      <Panel t={t} title={sel.name} sub="Device detail — live telemetry">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {detail && detail.map(d => <Stat key={d.label} t={t} label={d.label} value={d.value} tone={d.tone} />)}
          {!detail && <Stat t={t} label="Status" value={sel.tone === 'healthy' ? 'Online' : 'Attention'} tone={sel.tone} />}
        </div>
      </Panel>
    </>
  );
}

// ── Networks ───────────────────────────────────────────────────────────────────

function NetworksView({ t }: { t: Theme }) {
  const nodes = ['Internet', 'Firewall', 'Core Switch', 'Departments', 'WiFi', 'Servers', 'Medical Devices'];
  return (
    <>
      <SectionTitle t={t} title="Network Intelligence" sub="The entire hospital network — live bandwidth, failures, latency, packet loss." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Bandwidth (WAN)" value="8.4 Gbps" tone="healthy" />
        <Stat t={t} label="Failures (24h)" value="1" tone="warning" />
        <Stat t={t} label="Avg Latency" value="3.2 ms" tone="healthy" />
        <Stat t={t} label="Packet Loss" value="0.01%" tone="healthy" />
      </div>
      <Panel t={t} title="Topology" sub="Live flows across the hospital backbone">
        <div style={{ position: 'relative', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {nodes.map((n, i) => (
            <div key={n} style={{ position: 'relative', paddingBottom: i === nodes.length - 1 ? 0 : 16 }}>
              <div className="soc-line" style={{ position: 'absolute', left: -22, top: 12, bottom: i === nodes.length - 1 ? 12 : -8, width: 2, background: i === nodes.length - 1 ? 'transparent' : t.sky }} />
              <span style={{ position: 'absolute', left: -26, top: 4, width: 11, height: 11, borderRadius: '50%', background: i === 0 ? t.sky : t.green, boxShadow: `0 0 8px ${i === 0 ? t.sky : t.green}` }} className="soc-pulse" />
              <div style={{ background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 9, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={14} color={i === 0 ? t.sky : t.teal} /><span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{n}</span>
                {i === 0 && <span style={{ fontSize: 10, color: t.muted }}>Internet</span>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ── Clinical Security ──────────────────────────────────────────────────────────

function ClinicalView({ t }: { t: Theme }) {
  const watches = [
    { dept: 'Opened patient records', today: '12,441' }, { dept: 'Edited diagnoses', today: '884' },
    { dept: 'Modified prescriptions', today: '1,203' }, { dept: 'Cancelled surgeries', today: '7' },
    { dept: 'Viewed VIP patients', today: '23' }, { dept: 'Exported data', today: '41' },
    { dept: 'Approved discharge', today: '318' },
  ];
  return (
    <>
      <SectionTitle t={t} title="Clinical Security" sub="Unique to healthcare — clinical actions are cyber-critical too." />
      <Panel t={t} title="Clinical Action Watch" sub="who did what, to which patient, when">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {watches.map(w => (
            <div key={w.dept} style={{ background: t.panel2, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>{w.dept}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{w.today}</div>
              <div style={{ fontSize: 9.5, color: t.faint }}>today</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel t={t} title="Patient Record Watch" sub="VIP patient — opened 14 times today; flag is auto-raised on every suspicious open.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <Stat t={t} label="Opened today" value="14" tone="warning" />
          <Stat t={t} label="Normal" value="4" tone="healthy" />
          <Stat t={t} label="Suspicious" value="10" tone="critical" />
          <Stat t={t} label="Alert" value="Generated" tone="critical" />
        </div>
      </Panel>
    </>
  );
}

// ── Audit Center ───────────────────────────────────────────────────────────────

function AuditView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Audit Center" sub="Immutable · append-only · nothing is ever erased." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Audit Events Today" value="2.8M" tone="info" />
        <Stat t={t} label="Retention" value="Forever" tone="info" />
        <Stat t={t} label="Hash-Chained" value="Yes" tone="healthy" />
        <Stat t={t} label="Tamper" value="None" tone="healthy" />
      </div>
      <Panel t={t} title="Audit Ledger" sub="who · what · when · where · device · patient · reason · approval · hash">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 900 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.5fr 0.7fr 1fr 1fr 1fr 0.9fr 1fr 0.8fr 1.1fr', gap: 6, padding: '6px 8px', fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>
              {AUDIT_COLS.map(h => <span key={h}>{h}</span>)}
            </div>
            {AUDIT_ROWS.map(r => (
              <div key={r.hash} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.5fr 0.7fr 1fr 1fr 0.9fr 0.2fr 1fr 0.8fr 1.1fr', gap: 6, alignItems: 'center', padding: '8px 8px', borderRadius: 8, background: t.panel2, marginBottom: 4, fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: t.text }}>{r.who}</span><span style={{ color: t.muted }}>{r.what}</span>
                <span style={{ color: t.faint, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{r.when}</span>
                <span style={{ color: t.muted }}>{r.where}</span><span style={{ color: t.muted }}>{r.device}</span>
                <span style={{ color: t.muted }}>{r.patient === '—' ? '—' : <span style={{ color: t.sky }}>{r.patient}</span>}</span>
                <span style={{ color: t.muted }}>{r.dep}</span><span style={{ fontSize: 10, color: t.muted }}>{r.reason}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: t.green }}>{r.approval}</span>
                <span style={{ color: t.faint, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5 }}>{r.hash}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </>
  );
}

// ── Investigations ─────────────────────────────────────────────────────────────

function InvestigationsView({ t }: { t: Theme }) {
  const cases = [
    { id: 'INV-1024', who: 'Dr. John · 312 records', status: 'Critical', assignee: 'SOC Team', tone: 'critical' as Tone },
    { id: 'INV-1025', who: 'LAB-PC-014 · 41 days unpatched', status: 'Open', assignee: 'ICT', tone: 'warning' as Tone },
  ];
  return (
    <>
      <SectionTitle t={t} title="Investigations" sub="Every anomaly becomes a tracked, assigned, never-lost investigation." />
      <Panel t={t} title={`Open Investigations · ${cases.length}`}>
        {cases.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '120px 1.5fr 0.7fr 0.7fr auto', gap: 10, alignItems: 'center', background: t.panel2, borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: t.sky }}>{c.id}</span>
            <span style={{ color: t.text }}>{c.who}</span>
            <TonePill t={t} tone={c.tone} label={c.status} />
            <span style={{ color: t.muted, fontSize: 11 }}>{c.assignee}</span>
            <button style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.panel, color: t.text, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Open</button>
          </div>
        ))}
      </Panel>
    </>
  );
}

// ── Permissions ────────────────────────────────────────────────────────────────

function PermissionsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Permission Intelligence" sub="Visual — every role's allow / deny across constitutional resources." />
      <Panel t={t} title="Doctor — Permissions">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.green, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Allowed</div>
            {PERMISSION_ALLOWED.map(p => <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 12 }}> <span style={{ color: t.green }}>✓</span> <span style={{ color: t.text }}>{p}</span></div>)}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.red, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Not Allowed</div>
            {PERMISSION_DENIED.map(p => <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 12 }}>
              <span style={{ color: t.red }}>✕</span> <span style={{ color: t.muted, textDecoration: 'line-through' }}>{p}</span></div>)}
          </div>
        </div>
      </Panel>
    </>
  );
}

// ── MFA ────────────────────────────────────────────────────────────────────────

function MfaView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="MFA Center" sub="One click — enforce everywhere." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Enabled" value="98%" tone="healthy" />
        <Stat t={t} label="Pending" value="12" tone="warning" />
        <Stat t={t} label="Failed" value="3" tone="critical" />
        <Stat t={t} label="Challenges / day" value="291" tone="info" />
      </div>
      <Panel t={t} title="Enrollment">
        <div style={{ height: 12, borderRadius: 6, background: t.panel2, overflow: 'hidden' }}>
          <div style={{ width: '98%', height: '100%', background: t.green, borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 11, color: t.muted, marginTop: 8 }}>8,302 / 8,431 users enrolled · 129 pending enforcement</div>
      </Panel>
    </>
  );
}

// ── Passwords ──────────────────────────────────────────────────────────────────

function PasswordsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Password Security" sub="Policy enforcement, rotation, breach watch." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Resets Today" value="11" tone="info" />
        <Stat t={t} label="Expiring (7d)" value="46" tone="warning" />
        <Stat t={t} label="Breached (watch)" value="0" tone="healthy" />
        <Stat t={t} label="Policy" value="NIST" tone="healthy" />
      </div>
      <Panel t={t} title="Policy" sub="18-month rotation · 14-char minimum · breach watchlist">
        {['MFA + password required for clinical roles', 'Breached password watchlist · auto-reject', 'Rotation on privilege reset · enforced by edge guard', 'Password last changed enforced at login'].map(x => (
          <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
            <ShieldCheck size={13} color={t.green} /> <span style={{ color: t.text }}>{x}</span>
          </div>
        ))}
      </Panel>
    </>
  );
}

// ── Behavior Analytics / Insider / Impossible travel ───────────────────────────

function BehaviorView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Clinical Behavior Analytics & Insider Threat" sub="AI learns a baseline for every user — deviations become risk." />
      <Panel t={t} title="Insider Threat" sub="Risk: HIGH — user automatically locked">
        {INSIDER_ROWS.map(r => (
          <div key={r.user} style={{ display: 'grid', gridTemplateColumns: '190px 1fr auto', gap: 10, alignItems: 'center', background: `${t.redSoft}`, borderRadius: 8, padding: '12px', marginBottom: 6, border: `1px solid ${t.red}40` }}>
            <span style={{ fontWeight: 800, color: t.red }}>{r.user}</span>
            <span style={{ color: t.muted, fontSize: 11 }}>{r.detail}</span>
            <TonePill t={t} tone={'critical'} label={r.risk} />
          </div>
        ))}
        <div style={{ marginTop: 4, fontSize: 11, color: t.red, fontWeight: 600 }}>Access automatically locked · SOC notified · investigation opened.</div>
      </Panel>
      <Panel t={t} title="Behavior Anomaly — Dr John" sub="Baseline ≠ today's pattern">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11.5 }}>
          <div style={{ background: t.panel2, borderRadius: 8, padding: 12, flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9.5, color: t.muted, textTransform: 'uppercase' }}>Normally</div>
            <div style={{ marginTop: 4 }}><b style={{ color: t.text }}>08:00–17:00 · Medicine</b></div>
            <div style={{ color: t.muted }}>~40 records / session · clinic</div>
          </div>
          <div style={{ background: t.redSoft, borderRadius: 8, padding: 12, border: `1px solid ${t.red}40`, flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9.5, color: t.red, textTransform: 'uppercase' }}>Today</div>
            <div style={{ marginTop: 4 }}><b style={{ color: t.red }}>02:14 · Downloaded 2,000 Records</b></div>
            <div style={{ color: t.muted }}>outside hours · bulk access</div>
          </div>
        </div>
      </Panel>
      <Panel t={t} title="Impossible Travel Detected" sub="Same user cannot be in two places">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5 }}>
          <span style={{ background: t.panel2, borderRadius: 8, padding: '10px 12px', color: t.text }}>09:00 · Nairobi</span>
          <span style={{ color: t.faint }}>→</span>
          <span style={{ background: t.panel2, borderRadius: 8, padding: '10px 12px', color: t.text }}>09:12 · London</span>
          <span style={{ color: t.faint }}>→</span>
          <span style={{ background: t.redSoft, borderRadius: 8, padding: '10px 12px', border: `1px solid ${t.red}40`, color: t.red, fontWeight: 700 }}>Same User · Blocked</span>
        </div>
      </Panel>
    </>
  );
}
const INSIDER_ROWS = [
  { user: 'User sus-221', detail: 'Downloaded 4,000 patient files · outside working hours · USB inserted · unknown device', risk: 'HIGH' },
  { user: 'User sus-118', detail: 'Bulk export of 1,200 records · Sunday 03:44', risk: 'HIGH' },
];

// ── Risk Scores / Heatmap ──────────────────────────────────────────────────────

function RiskView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Risk Heatmap" sub="Departments colored — green normal · amber watch · red investigate." />
      <Panel t={t} title="Department Risk">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {DEPT_ACTIVITY.map(d => {
            const risk = d.dept === 'Radiology' || d.dept === 'Theatre' ? 'warning' : d.dept === 'Emergency' ? 'critical' : 'healthy';
            const name: any = toneColor(t, risk);
            return (
              <div key={d.dept} style={{ background: `${name}1a`, border: `1px solid ${name}50`, borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ToneDot t={t} tone={risk as Tone} /><span style={{ fontWeight: 700, color: t.text }}>{d.dept}</span></div>
                <div style={{ fontSize: 20, fontWeight: 800, color: name, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{risk.toUpperCase()}</div>
                <div style={{ fontSize: 9.5, color: t.muted }}>{d.users} online · risk score</div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel t={t} title="Risk Scores" sub="0 = safe · 100 = critical">
        {SESSIONS.slice(0, 6).map(s => <UserRiskRow key={s.user} t={t} name={s.user} score={s.risk === 'critical' ? 88 : s.risk === 'warning' ? 42 : 12} />)}
      </Panel>
    </>
  );
}

function UserRiskRow({ t, name, score }: { t: Theme; name: string; score: number }) {
  const c = score > 70 ? t.red : score > 40 ? t.amber : t.green;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
      <span style={{ fontWeight: 700, color: t.text, width: 130 }}>{name}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: t.panel2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: c, borderRadius: 4 }} />
      </div>
      <span style={{ width: 36, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: c }}>{score}</span>
    </div>
  );
}

// ── Incident Response ──────────────────────────────────────────────────────────

function IncidentView({ t }: { t: Theme }) {
  const [step, setStep] = useState(0);
  return (
    <>
      <SectionTitle t={t} title="Incident Response" sub="Create → assign → evidence → timeline → pool: never lost." />
      <Panel t={t} title="Incident Lifecycle" action={<button onClick={() => setStep(s => Math.min(INC_STEPS.length - 1, s + 1))} style={{ color: t.text, borderRadius: 8, border: `1px solid ${t.border}`, background: t.panel2, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Next step →</button>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INC_STEPS.map((s2, i) => (
            <span key={s2} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: i <= step ? (i < step ? t.greenSoft : t.skySoft) : t.panel2, color: i <= step ? (i < step ? t.green : t.sky) : t.muted, border: `1px solid ${i === step ? t.sky : t.border}` }}>
              {i < step ? '✓' : `${i + 1}`} {s2}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 8, background: t.panel2, fontSize: 11.5, color: t.muted }}>
          <b style={{ color: t.text }}>INV-1024</b> — {INC_STEPS[step]} · assigned to SOC Team · evidence: 23 events · root cause pending.
        </div>
      </Panel>
    </>
  );
}
const INC_STEPS = INCIDENT_STEPS;

// ── Compliance ─────────────────────────────────────────────────────────────────

function ComplianceView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Compliance" sub="Automatically monitors regulatory posture — live." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {COMPLIANCE.map(c => {
          const col = toneColor(t, c.tone);
          return (
            <div key={c.name} style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><ShieldCheck size={14} color={col} /><span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{c.name}</span></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}><span style={{ fontSize: 20, fontWeight: 800, color: col }}>{c.score}%</span><span style={{ fontSize: 10, color: t.muted }}>{c.status}</span></div>
              <div style={{ height: 8, borderRadius: 4, background: t.panel2, overflow: 'hidden' }}><div style={{ width: `${c.score}%`, height: '100%', background: col, borderRadius: 4 }} /></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Forensics ──────────────────────────────────────────────────────────────────

function ForensicsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Digital Forensics" sub="Reconstruct any investigation as a timeline — permanently preserved." />
      <Panel t={t} title="Reconstructed Timeline — INV-003 (Dr. Kariuki)">
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          {FORENSICS_TIMELINE.map((s2, i) => (
            <div key={s2} style={{ position: 'relative', paddingBottom: 14 }}>
              <span style={{ position: 'absolute', left: -24, top: 2, width: 11, height: 11, borderRadius: '50%', background: i === 0 || i === FORENSICS_TIMELINE.length - 1 ? t.sky : t.teal, boxShadow: `0 0 8px ${t.teal}` }} />
              {i < FORENSICS_TIMELINE.length - 1 && <span style={{ position: 'absolute', left: -20, top: 16, bottom: -4, width: 2, background: t.border }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s2}</span>
                <span style={{ fontSize: 10, color: t.faint, fontFamily: "'JetBrains Mono', monospace" }}>Hash 7a…f0 · 09:0{i}</span>
                <span style={{ marginLeft: 'auto' }}><TonePill t={t} tone={s2 === 'USB Connected' || s2 === 'Downloaded' ? 'critical' : 'healthy'} label={s2 === 'USB Connected' ? 'Flagged' : s2 === 'Downloaded' ? 'Flagged' : 'OK'} /></span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────────

function ReportsView({ t }: { t: Theme }) {
  const reports = ['Daily Security', 'Weekly', 'Monthly', 'Board', 'MOH', 'Cybersecurity', 'Audit', 'Forensics', 'Compliance', 'Incident Summary'];
  return (
    <>
      <SectionTitle t={t} title="Executive Reports" sub="One click · PDF · Excel · JSON · Power BI" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {reports.map(r => (
          <button key={r} onClick={() => {}} style={{ textAlign: 'left', cursor: 'pointer', background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
            <FileText size={16} color={t.sky} />
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text, margin: '8px 0 2px' }}>{r}</div>
            <div style={{ fontSize: 10.5, color: t.muted }}>PDF · XLSX · JSON · PB** export</div>
          </button>
        ))}
      </div>
      <Panel t={t} title="Executive Summary" sub="CEO opens and sees one number: trust">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Stat t={t} label="Hospital Security" value="99.8%" tone="healthy" />
          <Stat t={t} label="Threats" value="3" tone="warning" />
          <Stat t={t} label="Critical" value="0" tone="healthy" />
          <Stat t={t} label="Data Leaks" value="0" tone="healthy" />
          <Stat t={t} label="Users Online" value="418" tone="info" />
          <Stat t={t} label="Protected Devices" value="2,841" tone="info" />
          <Stat t={t} label="Audit Events Today" value="2.8M" tone="info" />
        </div>
      </Panel>
    </>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────────

function SettingsView({ t }: { t: Theme }) {
  return (
    <>
      <SectionTitle t={t} title="Immutable Audit & Forensics" sub="Nothing is ever deleted." />
      <Panel t={t} title="Data Storage">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.teal, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>PostgreSQL · canonical</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{PG_TABLES.map(tb => <span key={tb} style={{ padding: '3px 8px', borderRadius: 6, background: t.panel2, border: `1px solid ${t.border}`, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>{tb}</span>)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Neo4j · relationships</div>
            {NEO4J_EDGES.map(([a, rel, b], i) => (<div key={i} style={{ fontSize: 10.5, color: t.muted, fontFamily: "'JetBrains Mono', monospace", display: 'flex', gap: 6 }}><span style={{ color: t.text }}>{a}</span><span style={{ color: t.teal }}>{rel}</span><span style={{ color: t.text }}>{b}</span></div>))}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.sky, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Firestore · realtime</div>
            {['active sessions', 'alerts', 'device status', 'notifications', 'live activity', 'security wall'].map(x => (<div key={x} style={{ fontSize: 10.5, color: t.muted, fontFamily: "'JetBrains Mono', monospace", padding: '3px 0' }}>· {x}</div>))}
          </div>
        </div>
      </Panel>
    </>
  );
}