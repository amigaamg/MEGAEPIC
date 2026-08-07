'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN — Enterprise Integration & Interoperability Engine (E³)
//
// The Hospital Enterprise Integration Command Center. Not a list of connectors —
// a live constitutional ecosystem view: every system in the hospital as one
// graph, continuously synchronized, transformed, standardized and monitored by
// the AMEXAN orchestration layer.
//
// Style: Azure Portal × AWS Console × Datadog × Grafana × Epic Bridges.
// Dark/Light compatible, glowing health, animated flows, live throughput.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, Boxes, Building2, Cpu, FileCode2,
  FileText, GitBranch, HeartPulse, Layers, Lock, Monitor,
  Moon, Network, Plug, Radio, ShieldCheck, Sun, Zap,
} from 'lucide-react';
import type { FacilityAdminModel } from '@/lib/amexan/facility';
import type { IntegrationKind } from '@/lib/amexan/facility/FacilityAdministrationEngine';
import type { ConstitutionalContext } from './ConstitutionalContextGate';

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
  bg: '#050d1a', panel: '#0d1a2e', panel2: '#12223c', border: 'rgba(56,189,248,.14)',
  text: '#e2e8f0', muted: '#8fa0ba', faint: '#5b6b80',
  green: '#34d399', amber: '#fbbf24', red: '#f87171', sky: '#38bdf8', purple: '#a78bfa', teal: '#2dd4bf',
  greenSoft: 'rgba(52,211,153,.12)', amberSoft: 'rgba(251,191,36,.12)', redSoft: 'rgba(248,113,113,.12)', skySoft: 'rgba(56,189,248,.12)',
  glowGreen: '0 0 10px rgba(52,211,153,.55)',
};

const LIGHT: Theme = {
  name: 'light',
  bg: '#eef2f7', panel: '#ffffff', panel2: '#f1f5f9', border: '#dbe3ef',
  text: '#0b2c4d', muted: '#5b6b80', faint: '#8a98ac',
  green: '#059669', amber: '#d97706', red: '#dc2626', sky: '#0284c7', purple: '#7c3aed', teal: '#0d9488',
  greenSoft: 'rgba(5,150,105,.1)', amberSoft: 'rgba(217,119,6,.1)', redSoft: 'rgba(220,38,38,.1)', skySoft: 'rgba(2,132,199,.1)',
  glowGreen: '0 0 8px rgba(5,150,105,.4)',
};

// ── Types ──────────────────────────────────────────────────────────────────────

export type E3SectionId =
  | 'overview' | 'clinical' | 'business' | 'government' | 'devices' | 'fhir' | 'hl7' | 'dicom'
  | 'marketplace' | 'transformation' | 'sync' | 'monitoring' | 'developer' | 'security' | 'audit';

type Tone = 'healthy' | 'warning' | 'critical' | 'offline' | 'calibrate' | 'maintenance' | 'info';

interface SystemSpec {
  id: string; name: string; short: string; vendor: string; version: string;
  tone: Tone; latencyMs: number; lastSyncSec: number; records: number; note?: string;
}

interface DeviceSpec {
  id: string; name: string; count: number; tone: Tone;
}

// ── Data catalogue (realistic enterprise telemetry) ────────────────────────────

const CLINICAL_SYSTEMS: SystemSpec[] = [
  { id: 'epic', name: 'Epic', short: 'EMR', vendor: 'Epic Systems', version: '2026.1', tone: 'healthy', latencyMs: 43, lastSyncSec: 6, records: 2_148_382, note: 'Patient records · charting · orders' },
  { id: 'emr', name: 'AMEXAN EMR', short: 'Electronic Medical Records', vendor: 'AMEXAN', version: '5.4.0', tone: 'healthy', latencyMs: 12, lastSyncSec: 2, records: 2_148_382 },
  { id: 'his', name: 'Hospital Information System', short: 'HIS', vendor: 'Meditech', version: '7.0', tone: 'healthy', latencyMs: 61, lastSyncSec: 45, records: 980_000, note: 'Registration · admissions · billing' },
  { id: 'lab', name: 'Laboratory Systems', short: 'LIS', vendor: 'Clinilab', version: '3.8', tone: 'healthy', latencyMs: 28, lastSyncSec: 11, records: 1_240_000 },
  { id: 'rad', name: 'Radiology Systems', short: 'RIS', vendor: 'Ramsoft', version: '2.9', tone: 'healthy', latencyMs: 22, lastSyncSec: 8, records: 890_000 },
  { id: 'pharm', name: 'Pharmacy Systems', short: 'Pharm', vendor: 'PharmacistPro', version: '4.1', tone: 'healthy', latencyMs: 33, lastSyncSec: 20, records: 540_000 },
  { id: 'icu', name: 'ICU Systems', short: 'ICU', vendor: 'Philips IntelliVue', version: '12.0', tone: 'healthy', latencyMs: 51, lastSyncSec: 4, records: 41_200 },
  { id: 'theatre', name: 'Theatre Systems', short: 'OT', vendor: 'SurgicalHub', version: '2.2', tone: 'warning', latencyMs: 94, lastSyncSec: 420, records: 88_900, note: 'Slower sync since 09:40' },
  { id: 'blood', name: 'Blood Bank', short: 'BB', vendor: 'HemoCare', version: '1.7', tone: 'healthy', latencyMs: 47, lastSyncSec: 30, records: 61_700 },
  { id: 'dialysis', name: 'Dialysis', short: 'HD', vendor: 'Fresenius', version: '6.3', tone: 'healthy', latencyMs: 58, lastSyncSec: 15, records: 22_400 },
  { id: 'cssd', name: 'CSSD', short: 'Sterile', vendor: 'SteriTrack', version: '1.4', tone: 'healthy', latencyMs: 39, lastSyncSec: 60, records: 98_000 },
];

const BUSINESS_SYSTEMS: SystemSpec[] = [
  { id: 'erp', name: 'Enterprise Resource Planning', short: 'ERP', vendor: 'Oracle NetSuite', version: '2025.2', tone: 'healthy', latencyMs: 76, lastSyncSec: 90, records: 320_000, note: 'Inventory · finance · assets · payroll' },
  { id: 'finance', name: 'Financial Management', short: 'FMIS', vendor: 'SAP', version: 'FPS02', tone: 'healthy', latencyMs: 68, lastSyncSec: 120, records: 210_000 },
  { id: 'payroll', name: 'Payroll', short: 'PR', vendor: 'Workday', version: 'R2', tone: 'healthy', latencyMs: 40, lastSyncSec: 600, records: 8_400, note: '8,431 employees' },
  { id: 'procurement', name: 'Procurement', short: 'PRC', vendor: 'SAP Ariba', version: '21', tone: 'warning', latencyMs: 132, lastSyncSec: 900, records: 44_000, note: 'Purchase order backlog rising' },
  { id: 'inventory', name: 'Inventory', short: 'INV', vendor: 'QuickStock', version: '3.0', tone: 'healthy', latencyMs: 35, lastSyncSec: 240, records: 156_000 },
  { id: 'assets', name: 'Asset Management', short: 'AMS', vendor: 'Maximo', version: '7.6.1', tone: 'healthy', latencyMs: 55, lastSyncSec: 300, records: 72_000 },
  { id: 'hr', name: 'Human Resource', short: 'HRIS', vendor: 'BambooHR', version: '12.4', tone: 'healthy', latencyMs: 44, lastSyncSec: 180, records: 8_431 },
  { id: 'attendance', name: 'Attendance', short: 'ATD', vendor: 'BiometricX', version: '2.8', tone: 'healthy', latencyMs: 29, lastSyncSec: 10, records: 1_900_000 },
  { id: 'biometric', name: 'Biometric', short: 'BIO', vendor: 'Suprema', version: '5.1', tone: 'healthy', latencyMs: 31, lastSyncSec: 5, records: 8_431 },
  { id: 'accounting', name: 'Accounting', short: 'GL', vendor: 'QuickBooks Premier', version: '2026', tone: 'healthy', latencyMs: 49, lastSyncSec: 600, records: 188_000 },
];

const GOVERNMENT_SYSTEMS: SystemSpec[] = [
  { id: 'sha', name: 'SHA', short: 'Social Health Authority', vendor: 'Kenya · Government', version: 'V1 API', tone: 'healthy', latencyMs: 84, lastSyncSec: 90, records: 4_200_000, note: 'Claims · eligibility · capitation' },
  { id: 'moh', name: 'MOH', short: 'Ministry of Health', vendor: 'Kenya · Government', version: 'N3', tone: 'healthy', latencyMs: 110, lastSyncSec: 300, records: 1_600_000 },
  { id: 'dhis2', name: 'DHIS2', short: 'HMIS Aggregate', vendor: 'UIO / HISP', version: '2.41', tone: 'healthy', latencyMs: 97, lastSyncSec: 180, records: 8_900_000, note: 'Weekly aggregates reported on time' },
  { id: 'birth', name: 'Birth Registry', short: 'CRVS', vendor: 'Kenya · Government', version: 'V2', tone: 'healthy', latencyMs: 88, lastSyncSec: 600, records: 3_100_000 },
  { id: 'death', name: 'Death Registry', short: 'CRVS', vendor: 'Kenya · Government', version: 'V2', tone: 'warning', latencyMs: 143, lastSyncSec: 1800, records: 1_700_000, note: 'Sync delayed 30 min' },
  { id: 'surveillance', name: 'Disease Surveillance', short: 'IDSR', vendor: 'Kenya · MOH', version: '3.0', tone: 'healthy', latencyMs: 74, lastSyncSec: 150, records: 2_300_000, note: 'EWARS · outbreak alerts' },
  { id: 'natlab', name: 'National Laboratory', short: 'NRL', vendor: 'KEMRI', version: '2.6', tone: 'healthy', latencyMs: 92, lastSyncSec: 240, records: 640_000 },
  { id: 'cancer', name: 'Cancer Registry', short: 'KCR', vendor: 'KEMRI', version: '1.9', tone: 'healthy', latencyMs: 105, lastSyncSec: 720, records: 310_000 },
  { id: 'vacc', name: 'Vaccination Registry', short: 'EPI', vendor: 'Kenya · MOH', version: 'KEPI', tone: 'healthy', latencyMs: 67, lastSyncSec: 180, records: 5_500_000 },
];

const DEVICES: DeviceSpec[] = [
  { id: 'ecg', name: 'ECG', count: 32, tone: 'healthy' },
  { id: 'vent', name: 'Ventilators', count: 21, tone: 'healthy' },
  { id: 'monitors', name: 'Patient Monitors', count: 186, tone: 'healthy' },
  { id: 'us', name: 'Ultrasound', count: 9, tone: 'calibrate' },
  { id: 'mri', name: 'MRI', count: 2, tone: 'healthy' },
  { id: 'ct', name: 'CT', count: 2, tone: 'maintenance' },
  { id: 'analysers', name: 'Laboratory Analysers', count: 24, tone: 'warning' },
  { id: 'pumps', name: 'Infusion Pumps', count: 140, tone: 'healthy' },
  { id: 'wearables', name: 'Wearables', count: 510, tone: 'healthy' },
  { id: 'dicom', name: 'DICOM Nodes', count: 11, tone: 'healthy' },
  { id: 'xray', name: 'X-Ray', count: 6, tone: 'healthy' },
  { id: 'mammo', name: 'Mammography', count: 1, tone: 'offline' },
];

const FHIR_RESOURCES: { name: string; count: number }[] = [
  { name: 'Patient', count: 2_148_382 }, { name: 'Encounter', count: 6_402_000 }, { name: 'Observation', count: 14_800_000 },
  { name: 'Condition', count: 1_220_000 }, { name: 'Procedure', count: 410_000 }, { name: 'Medication', count: 3_700_000 },
  { name: 'CarePlan', count: 240_000 }, { name: 'Coverage', count: 4_200_000 }, { name: 'Claim', count: 980_000 },
  { name: 'Practitioner', count: 8_431 }, { name: 'Organization', count: 84 }, { name: 'Location', count: 320 }, { name: 'Subscription', count: 56 },
];

const HL7_TYPES: { name: string; tone: Tone; queued: number; delayMs: number }[] = [
  { name: 'ADT', tone: 'healthy', queued: 0, delayMs: 12 },
  { name: 'ORM', tone: 'healthy', queued: 0, delayMs: 14 },
  { name: 'ORU', tone: 'healthy', queued: 0, delayMs: 18 },
  { name: 'SIU', tone: 'healthy', queued: 0, delayMs: 9 },
  { name: 'ACK', tone: 'healthy', queued: 0, delayMs: 7 },
  { name: 'MDM', tone: 'warning', queued: 12, delayMs: 220 },
];

const MONITOR_WALL: { name: string; tone: Tone }[] = [
  { name: 'Epic', tone: 'healthy' }, { name: 'OpenMRS', tone: 'healthy' }, { name: 'FHIR', tone: 'healthy' },
  { name: 'PACS', tone: 'healthy' }, { name: 'LIS', tone: 'healthy' }, { name: 'ERP', tone: 'healthy' },
  { name: 'SHA', tone: 'healthy' }, { name: 'DICOM', tone: 'healthy' }, { name: 'Biometric', tone: 'healthy' },
  { name: 'Theatre', tone: 'warning' }, { name: 'Mammography', tone: 'critical' },
];

const RECOMMENDATIONS: { system: string; text: string; tone: Tone }[] = [
  { system: 'OpenMRS', text: 'No synchronization in 4 hours.', tone: 'warning' },
  { system: 'FHIR', text: 'New Patient resource available.', tone: 'info' },
  { system: 'Laboratory', text: 'Analyzer disconnected.', tone: 'critical' },
  { system: 'Radiology', text: 'Image backlog increasing.', tone: 'warning' },
  { system: 'Insurance', text: 'Claim rejection rate rising.', tone: 'warning' },
];

const TRANSFORMATION_RULES: { name: string; source: string; target: string; action: string; status: Tone }[] = [
  { name: 'Patient Identity Merge', source: 'OpenMRS', target: 'FHIR Patient', action: 'normalize · dedupe', status: 'healthy' },
  { name: 'Lab Result → LOINC', source: 'LIS', target: 'FHIR Observation', action: 'LOINC mapping', status: 'healthy' },
  { name: 'Diagnosis → SNOMED CT', source: 'EMR', target: 'FHIR Condition', action: 'SNOMED mapping', status: 'healthy' },
  { name: 'Discharge → ICD-11', source: 'Theatre', target: 'FHIR Procedure', action: 'ICD-11 encoding', status: 'warning' },
  { name: 'Vitals → Observation', source: 'Patient Monitors', target: 'FHIR Observation', action: 'unit normalize', status: 'healthy' },
  { name: 'Claim → SHA', source: 'Finance', target: 'SHA Claims', action: 'revenue code mapping', status: 'healthy' },
];

const DEVELOPER_PORTAL: { name: string; desc: string }[] = [
  { name: 'REST APIs', desc: 'RESTful endpoints for every constitutional resource' },
  { name: 'FHIR APIs', desc: 'FHIR R5 conformance · read, search, history' },
  { name: 'Webhooks', desc: 'Subscribe to clinical + integration events' },
  { name: 'SDK', desc: 'TypeScript + Python SDKs for AMEXAN' },
  { name: 'OAuth 2.0', desc: 'Constitutional auth for every integration' },
  { name: 'API Keys', desc: 'Scoped, rotating, revocable keys' },
  { name: 'Rate Limits', desc: 'Per-key throughput governance' },
  { name: 'Sandbox', desc: 'Isolated test tenant with synthetic patients' },
  { name: 'Testing', desc: 'Integration test runner + fixtures' },
];

const AUDIT_EVENTS: { at: number; actor: string; action: string; scope: string; tone: Tone }[] = [
  { at: Date.now() - 12_000, actor: 'SYSTEM', action: 'FHIR bulk import completed', scope: 'epic → fhir', tone: 'healthy' },
  { at: Date.now() - 48_000, actor: 'SHA.GATEWAY', action: 'Claim batch submitted (2,148)', scope: 'finance → sha', tone: 'healthy' },
  { at: Date.now() - 132_000, actor: 'LIS.ANALYZER#4', action: 'Connection lost', scope: 'lab analyzer', tone: 'critical' },
  { at: Date.now() - 210_000, actor: 'SYSTEM', action: 'SNOMED map applied (12,400 concepts)', scope: 'emr → snomed', tone: 'healthy' },
  { at: Date.now() - 400_000, actor: 'CT.SCANNER', action: 'Maintenance window scheduled', scope: 'imaging', tone: 'warning' },
  { at: Date.now() - 900_000, actor: 'administrator@', action: 'Created API key fhir-ops', scope: 'developer portal', tone: 'info' },
  { at: Date.now() - 1_800_000, actor: 'SHA.GATEWAY', action: 'Eligibility refresh', scope: 'sha', tone: 'healthy' },
];

const SYNC_PIPELINE: { node: string; sub: string; tone: Tone }[] = [
  { node: 'Epic', sub: '2.1M patients', tone: 'healthy' },
  { node: 'FHIR', sub: 'R5 · normalized', tone: 'healthy' },
  { node: 'AMEXAN', sub: 'orchestration layer', tone: 'healthy' },
  { node: 'Neo4j', sub: 'knowledge graph', tone: 'healthy' },
  { node: 'Clinical Intelligence', sub: 'reasoning active', tone: 'healthy' },
  { node: 'Digital Twin', sub: 'live mirror', tone: 'healthy' },
];

const AI_TRANSFORMATION_STEPS: { label: string; detail: string; tone: Tone }[] = [
  { label: 'Imported', detail: 'Patients', tone: 'healthy' },
  { label: 'Standardized', detail: 'canonical constitution', tone: 'healthy' },
  { label: 'FHIR', detail: 'R5 resources', tone: 'healthy' },
  { label: 'SNOMED', detail: 'clinical concepts', tone: 'healthy' },
  { label: 'LOINC', detail: 'lab observables', tone: 'healthy' },
  { label: 'ICD-11', detail: 'diagnoses', tone: 'healthy' },
  { label: 'Knowledge Graph Built', detail: 'Neo4j', tone: 'healthy' },
  { label: 'Clinical Intelligence Activated', detail: 'reasoning live', tone: 'healthy' },
];

const PG_TABLES = ['integration_systems', 'connectors', 'sync_jobs', 'fhir_resources', 'hl7_messages', 'device_registry', 'api_tokens', 'transformation_rules', 'audit_logs'];
const NEO4J_EDGES = [
  ['Epic', 'CONNECTED_TO', 'Hospital'],
  ['FHIR', 'CONNECTED_TO', 'Observation'],
  ['PACS', 'PROVIDES', 'ImagingStudy'],
  ['LIS', 'GENERATES', 'Observation'],
  ['Device', 'STREAMS_TO', 'Patient'],
];

const fmt = (n: number) => n.toLocaleString();
const fmtSync = (s: number) => {
  if (s < 90) return `${s} sec`;
  const m = Math.round(s / 60);
  if (m < 90) return `${m} min`;
  return `${Math.round(m / 60)} hr`;
};

// ── Main component ─────────────────────────────────────────────────────────────

export function EnterpriseIntegrationEngine({ ctx, model }: { ctx: ConstitutionalContext; model: FacilityAdminModel | null }) {
  const [dark, setDark] = useState(true);
  const [section, setSection] = useState<E3SectionId>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = dark ? DARK : LIGHT;

  // Derive real integration connectivity from the persisted model where present.
  const modelKinds = useMemo(() => new Set((model?.integrations || []).map(i => i.kind)), [model]);
  const isConnected = (kind: string) => modelKinds.has(kind as IntegrationKind);

  const sections: { id: E3SectionId; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'clinical', label: 'Clinical Systems', icon: HeartPulse },
    { id: 'business', label: 'Business Systems', icon: Boxes },
    { id: 'government', label: 'Government Systems', icon: Building2 },
    { id: 'devices', label: 'Medical Devices', icon: Monitor },
    { id: 'fhir', label: 'FHIR APIs', icon: Layers },
    { id: 'hl7', label: 'HL7 Interfaces', icon: GitBranch },
    { id: 'dicom', label: 'DICOM', icon: Radio },
    { id: 'marketplace', label: 'Integration Marketplace', icon: Zap },
    { id: 'transformation', label: 'Transformation Rules', icon: Cpu },
    { id: 'sync', label: 'Synchronization', icon: Network },
    { id: 'monitoring', label: 'Monitoring', icon: BarChart3 },
    { id: 'developer', label: 'Developer Portal', icon: FileCode2 },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'audit', label: 'Audit', icon: FileText },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: t.bg, color: t.text, fontFamily: "'Inter', 'Noto Sans', system-ui, sans-serif", display: 'flex' }}>
      <style>{`
        .e3-dash{stroke-dasharray:6 8;animation:e3flow 1.1s linear infinite}
        @keyframes e3flow{to{stroke-dashoffset:-14}}
        .e3-pulse{animation:e3pulse 2.2s ease-in-out infinite}
        @keyframes e3pulse{0%,100%{opacity:1}50%{opacity:.45}}
        .e3-dot{animation:e3dot 1.6s ease-in-out infinite}
        @keyframes e3dot{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .e3-scan{animation:e3scan 2.8s linear infinite}
        @keyframes e3scan{0%{transform:translateX(-30%)}100%{transform:translateX(130%)}}
        @media(max-width:860px){.e3-side{position:fixed;left:0;top:60px;bottom:0;z-index:25;box-shadow:0 10px 40px rgba(0,0,0,.4)}.e3-main{padding:14px!important}}
      `}</style>

      {/* Sidebar */}
      <aside className="e3-side" style={{ width: 236, flexShrink: 0, background: t.panel, borderRight: `1px solid ${t.border}`, padding: '12px 10px', overflowY: 'auto', display: mobileOpen ? 'block' : undefined }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: t.muted, textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={13} color={t.sky} /> Ecosystem
        </div>
        {sections.map(s => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button key={s.id} onClick={() => { setSection(s.id); setMobileOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer', background: active ? t.skySoft : 'transparent', color: active ? t.sky : t.muted, fontSize: 12.5, fontWeight: active ? 700 : 500, marginBottom: 2 }}>
              <Icon size={15} /> {s.label}
            </button>
          );
        })}
        <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: t.panel2, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 10, color: t.faint, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Constitutional IDs</div>
          <div style={{ fontSize: 10, color: t.muted, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
            <div>org · {ctx.organizationId.slice(0, 14)}</div>
            <div>fac · {ctx.facilityId.slice(0, 14)}</div>
            <div>actor · {ctx.actorId.slice(0, 14)}</div>
            <div>ws · {ctx.workspaceId.slice(0, 14)}</div>
            <div>sess · {ctx.sessionId.slice(0, 14)}</div>
          </div>
        </div>
        <button onClick={() => setDark(d => !d)} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.panel2, color: t.text, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </aside>

      {/* Main */}
      <main className="e3-main" style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 20 }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 8, padding: 6, cursor: 'pointer' }} className="e3-menu" aria-label="Menu">
            <Activity size={16} color={t.text} />
          </button>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>Enterprise Integration &amp; Interoperability Engine</div>
            <div style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>{ctx.facilityName} · {ctx.organizationName} — one constitutional ecosystem</div>
          </div>
          <HealthBadge t={t} label="System Health" value="99.99%" tone="healthy" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: t.panel2, border: `1px solid ${t.border}` }}>
            <span className="e3-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: t.green, boxShadow: t.glowGreen }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: t.text }}>Constitutional Context Ready</span>
          </div>
        </div>

        {section === 'overview' && <OverviewView t={t} ctx={ctx} isConnected={isConnected} model={model} />}
        {section === 'clinical' && <SystemsView t={t} title="Clinical Systems" sub="Every clinical platform in the hospital, continuously synchronized and standardized." systems={CLINICAL_SYSTEMS} />}
        {section === 'business' && <SystemsView t={t} title="Business Systems" sub="ERP, finance, payroll, procurement, inventory, assets, HR, attendance, biometric, accounting." systems={BUSINESS_SYSTEMS} />}
        {section === 'government' && <SystemsView t={t} title="Government Systems" sub="National registries and payers — SHA, MOH, DHIS2, CRVS, surveillance, NRL, registries." systems={GOVERNMENT_SYSTEMS} />}
        {section === 'devices' && <DevicesView t={t} />}
        {section === 'fhir' && <FhirView t={t} />}
        {section === 'hl7' && <Hl7View t={t} />}
        {section === 'dicom' && <DicomView t={t} />}
        {section === 'marketplace' && <MarketplaceView t={t} model={model} isConnected={isConnected} />}
        {section === 'transformation' && <TransformationView t={t} />}
        {section === 'sync' && <SyncView t={t} />}
        {section === 'monitoring' && <MonitoringView t={t} />}
        {section === 'developer' && <DeveloperView t={t} />}
        {section === 'security' && <SecurityView t={t} />}
        {section === 'audit' && <AuditView t={t} />}
      </main>
    </div>
  );
}

// ── Shared atoms ───────────────────────────────────────────────────────────────

function HealthBadge({ t, label, value, tone }: { t: Theme; label: string; value: string; tone: Tone }) {
  const color = toneColor(t, tone);
  return (
    <div style={{ padding: '8px 14px', borderRadius: 10, background: t.panel2, border: `1px solid ${t.border}` }}>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
    </div>
  );
}

function toneColor(t: Theme, tone: Tone): string {
  switch (tone) {
    case 'healthy': return t.green;
    case 'warning': case 'calibrate': case 'maintenance': return t.amber;
    case 'critical': case 'offline': return t.red;
    default: return t.sky;
  }
}

function toneLabel(tone: Tone): string {
  switch (tone) {
    case 'healthy': return '● Connected';
    case 'warning': return '▲ Warning';
    case 'critical': return '● Critical';
    case 'offline': return '○ Offline';
    case 'calibrate': return '~ Needs Calibration';
    case 'maintenance': return '⚙ Maintenance Due';
    default: return '· Info';
  }
}

function TonePill({ t, tone, label }: { t: Theme; tone: Tone; label?: string }) {
  const c = toneColor(t, tone);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: `${c}1a`, color: c, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      <span className={tone === 'healthy' ? 'e3-pulse' : undefined} style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: tone === 'healthy' ? `0 0 8px ${c}` : undefined }} />
      {label || toneLabel(tone)}
    </span>
  );
}

function Card({ t, title, sub, children, action }: { t: Theme; title: string; sub?: string; children: React.ReactNode; action?: React.ReactNode }) {
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

function Stat({ t, label, value, tone, mono }: { t: Theme; label: string; value: string | number; tone?: Tone; mono?: boolean }) {
  return (
    <div style={{ background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: tone ? toneColor(t, tone) : t.text, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{value}</div>
      <div style={{ fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SectionRule({ t, title }: { t: Theme; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 2px' }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: t.text, letterSpacing: '.02em', textTransform: 'uppercase' }}>══ {title}</span>
      <span style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────

function OverviewView({ t, isConnected, model }: { t: Theme; isConnected: (k: string) => boolean; model: FacilityAdminModel | null; ctx?: ConstitutionalContext }) {
  const connected = isConnected('fhir') || isConnected('hl7') || isConnected('lis') ? 14 : 12;
  const kpis = [
    { label: 'Connected Systems', value: String(connected), tone: 'healthy' as Tone },
    { label: 'Healthy Systems', value: String(connected - 1), tone: 'healthy' as Tone },
    { label: 'Disconnected', value: '1', tone: 'critical' as Tone },
    { label: 'Realtime Interfaces', value: '9', tone: 'info' as Tone },
    { label: 'FHIR Resources', value: '1.8M', tone: 'info' as Tone },
    { label: 'Daily Messages', value: '8.2M', tone: 'info' as Tone },
    { label: 'Avg Sync Delay', value: '1.2s', tone: 'healthy' as Tone },
    { label: 'System Health', value: '99.99%', tone: 'healthy' as Tone },
  ];
  return (
    <>
      <SectionRule t={t} title="Hospital Enterprise Ecosystem" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {kpis.map(k => <Stat key={k.label} t={t} label={k.label} value={k.value} tone={k.tone} mono />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(260px,0.75fr)', gap: 14, alignItems: 'stretch' }}>
        <Card t={t} title="Connection Topology" sub="Live constitutional graph — every system in the hospital, one ecosystem.">
          <Topology t={t} />
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card t={t} title="Live Throughput" sub="messages / min across the mesh">
            <Sparkline t={t} />
          </Card>
          <Card t={t} title="AI Recommendations" sub="Clinical Intelligence continuously watching">
            {RECOMMENDATIONS.map(r => (
              <div key={r.system} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: toneColor(t, r.tone), marginTop: 3, flexShrink: 0 }} />
                <span><b style={{ color: t.text }}>{r.system}</b> <span style={{ color: t.muted }}>— {r.text}</span></span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <Card t={t} title="Realtime Interfaces" sub="Live FHIR, HL7, DICOM and device flows">
        <InterfaceTable t={t} isConnected={isConnected} model={model} />
      </Card>
    </>
  );
}

function InterfaceTable({ t, isConnected, model }: { t: Theme; isConnected: (k: string) => boolean; model: FacilityAdminModel | null }) {
  const rows = [
    { id: 'fhir', name: 'FHIR Gateway', kind: 'fhir', detail: 'R5 · REST · messages', msgs: '4.8M/day' },
    { id: 'hl7', name: 'HL7 Message Broker', kind: 'hl7', detail: 'ADT · ORM · ORU · SIU', msgs: '2.1M/day' },
    { id: 'lis', name: 'Laboratory Interface', kind: 'lis', detail: 'ASTM · LIS2-A2', msgs: '620K/day' },
    { id: 'pacs', name: 'PACS / DICOM', kind: 'pacs', detail: 'DICOM C-STORE · WADO-RS', msgs: '8,112 studies' },
    { id: 'ris', name: 'Radiology Information', kind: 'ris', detail: 'HL7 ORM/ORU', msgs: '310K/day' },
    { id: 'insurance', name: 'Insurance Gateway', kind: 'insurance', detail: 'SHA · NHIF legacy', msgs: '12K/day' },
    { id: 'erp', name: 'ERP Connector', kind: 'erp', detail: 'OData · REST', msgs: '88K/day' },
    { id: 'national', name: 'National Systems', kind: 'national_systems', detail: 'DHIS2 · CRVS · IDSR', msgs: '74K/day' },
  ];
  const modelActive = (kind: string) => model?.integrations?.some(i => i.kind === kind && (i.status === 'active' || i.status === 'configured'));
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 640 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.8fr 0.9fr 1fr', gap: 8, padding: '6px 8px', fontSize: 9.5, color: t.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>
          <span>Interface</span><span>Protocol</span><span>Status</span><span>Flow</span><span>Volume</span>
        </div>
        {rows.map(r => {
          const on = isConnected(r.kind) || modelActive(r.kind) || r.id === 'fhir' || r.id === 'hl7' || r.id === 'pacs' || r.id === 'lis';
          return (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.8fr 0.9fr 1fr', gap: 8, alignItems: 'center', padding: '8px', borderRadius: 8, fontSize: 11.5, background: t.panel2, marginBottom: 5 }}>
              <span style={{ fontWeight: 700, color: t.text }}>{r.name}<span style={{ color: t.faint, fontWeight: 500, marginLeft: 6 }}>{r.detail}</span></span>
              <span style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{r.kind}</span>
              <TonePill t={t} tone={on ? 'healthy' : 'offline'} label={on ? 'Connected' : 'Offline'} />
              <span style={{ color: t.muted, fontSize: 10.5 }}>{r.id === 'hl7' ? 'bidirectional' : 'inbound'}</span>
              <span style={{ color: t.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{r.msgs}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Topology ───────────────────────────────────────────────────────────────────

function Topology({ t }: { t: Theme }) {
  const nodes: { id: string; x: number; y: number; label: string; tone: Tone }[] = [
    { id: 'epic', x: 60, y: 96, label: 'Epic', tone: 'healthy' },
    { id: 'fhir', x: 190, y: 96, label: 'FHIR', tone: 'healthy' },
    { id: 'amexan', x: 320, y: 60, label: 'AMEXAN', tone: 'healthy' },
    { id: 'neo4j', x: 460, y: 96, label: 'Neo4j', tone: 'healthy' },
    { id: 'ci', x: 560, y: 180, label: 'Clinical Intelligence', tone: 'healthy' },
    { id: 'twin', x: 320, y: 200, label: 'Digital Twin', tone: 'healthy' },
    { id: 'pacs', x: 60, y: 200, label: 'PACS', tone: 'healthy' },
    { id: 'lis', x: 190, y: 200, label: 'LIS', tone: 'healthy' },
    { id: 'device', x: 460, y: 200, label: 'Devices', tone: 'healthy' },
  ];
  const edges: [string, string, string][] = [
    ['epic', 'fhir', 'CONNECTED_TO'], ['fhir', 'amexan', 'SYNC'], ['amexan', 'neo4j', 'BUILD'],
    ['neo4j', 'ci', 'FEED'], ['ci', 'twin', 'MIRROR'], ['pacs', 'amexan', 'PROVIDES'],
    ['lis', 'amexan', 'GENERATES'], ['device', 'amexan', 'STREAMS_TO'], ['amexan', 'twin', 'MIRROR'],
  ];
  const nid = (id: string) => nodes.find(n => n.id === id)!;
  return (
    <div style={{ position: 'relative', height: 250, overflow: 'hidden', borderRadius: 10 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${t.sky}, transparent)`, opacity: 0.5 }} className="e3-scan" />
      <svg width="100%" height="100%" viewBox="0 0 640 250" preserveAspectRatio="xMidYMid meet">
        {edges.map(([a, b, rel], i) => {
          const A = nid(a); const B = nid(b);
          return (
            <g key={i}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={t.border} strokeWidth="1" />
              <line className="e3-dash" x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={t.sky} strokeWidth="1.2" opacity="0.85" />
              <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 5} fill={t.faint} fontSize="7.5" textAnchor="middle" letterSpacing="1">{rel}</text>
            </g>
          );
        })}
        {nodes.map(n => {
          const c = toneColor(t, n.tone);
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="20" fill={t.panel2} stroke={c} strokeWidth="1.4" className="e3-pulse" />
              <circle cx={n.x} cy={n.y} r="5" fill={c} style={{ filter: `drop-shadow(0 0 6px ${c})` }} />
              <text x={n.x} y={n.y + 34} fill={t.muted} fontSize="10" textAnchor="middle" fontWeight="700">{n.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Sparkline (live throughput) ────────────────────────────────────────────────

function Sparkline({ t }: { t: Theme }) {
  const [pts, setPts] = useState<number[]>([42, 48, 45, 52, 49, 57, 54, 60, 56, 63, 58, 66, 61, 68, 64, 70, 66, 72, 69, 75]);
  useEffect(() => {
    const id = setInterval(() => {
      setPts(p => {
        const next = p.slice(1);
        next.push(Math.max(20, Math.min(95, (next[next.length - 1] || 60) + (Math.random() * 12 - 6))));
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);
  const w = 320, h = 90, max = 100;
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: t.sky, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(last).toLocaleString()}k</span>
        <span style={{ fontSize: 10, color: t.muted }}>msgs/min</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: 90 }}>
        <defs>
          <linearGradient id="e3fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.sky} stopOpacity=".35" />
            <stop offset="100%" stopColor={t.sky} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#e3fill)" />
        <path d={path} fill="none" stroke={t.sky} strokeWidth="2" />
        <circle cx={w} cy={h - (last / max) * h} r="4" fill={t.sky} style={{ filter: `drop-shadow(0 0 6px ${t.sky})` }} />
      </svg>
    </div>
  );
}

// ── System grids (Clinical / Business / Government) ────────────────────────────

function SystemsView({ t, title, sub, systems }: { t: Theme; title: string; sub: string; systems: SystemSpec[] }) {
  return (
    <>
      <SectionRule t={t} title={title} />
      <div style={{ fontSize: 11.5, color: t.muted, marginBottom: 4 }}>{sub}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
        {systems.map(s => (
          <div key={s.id} style={{ background: t.panel, border: `1px solid ${s.tone === 'healthy' ? 'rgba(52,211,153,.25)' : t.border}`, borderRadius: 12, padding: 14, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: toneColor(t, s.tone), opacity: .7 }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{s.name}</div>
                <div style={{ fontSize: 10, color: t.faint, marginTop: 2 }}>{s.vendor} · v{s.version}</div>
              </div>
              <TonePill t={t} tone={s.tone} />
            </div>
            {s.note && <div style={{ fontSize: 10.5, color: toneColor(t, s.tone), background: `${toneColor(t, s.tone)}14`, borderRadius: 6, padding: '5px 8px', marginBottom: 10 }}>{s.note}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.latencyMs} ms</div><div style={{ fontSize: 9, color: t.muted }}>Latency</div></div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmtSync(s.lastSyncSec)}</div><div style={{ fontSize: 9, color: t.muted }}>Last Sync</div></div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(s.records)}</div><div style={{ fontSize: 9, color: t.muted }}>Records</div></div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9.5, color: t.muted }}>{s.short}</span>
              <span style={{ marginLeft: 'auto', fontSize: 9.5, color: t.faint, fontFamily: "'JetBrains Mono', monospace" }}>{s.id.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Medical Devices ────────────────────────────────────────────────────────────

function DevicesView({ t }: { t: Theme }) {
  const healthy = DEVICES.filter(d => d.tone === 'healthy').reduce((a, d) => a + d.count, 0);
  const issues = DEVICES.filter(d => d.tone !== 'healthy');
  return (
    <>
      <SectionRule t={t} title="Connected Devices" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Connected Devices" value={fmt(healthy)} tone="healthy" />
        <Stat t={t} label="Device Types" value={DEVICES.length} tone="info" />
        <Stat t={t} label="Needs Attention" value={issues.length} tone="warning" />
        <Stat t={t} label="Streaming Interfaces" value="9" tone="info" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
        {DEVICES.map(d => {
          const c = toneColor(t, d.tone);
          return (
            <div key={d.id} style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{d.name}</span>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: c, boxShadow: `0 0 10px ${c}` }} className={d.tone === 'healthy' ? 'e3-pulse' : undefined} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{d.count}</div>
              <TonePill t={t} tone={d.tone} />
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── FHIR ───────────────────────────────────────────────────────────────────────

function FhirView({ t }: { t: Theme }) {
  const total = FHIR_RESOURCES.reduce((a, r) => a + r.count, 0);
  return (
    <>
      <SectionRule t={t} title="FHIR Gateway" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Status" value="Healthy" tone="healthy" />
        <Stat t={t} label="FHIR Version" value="R5" tone="info" />
        <Stat t={t} label="Resources Today" value={fmt(total)} tone="info" />
        <Stat t={t} label="Messages Today" value="4.8M" tone="info" />
        <Stat t={t} label="Avg Search (p95)" value="38 ms" tone="healthy" />
        <Stat t={t} label="Subscriptions" value="56" tone="info" />
      </div>
      <Card t={t} title="Resource Inventory" sub="Normalized, validated, enriched FHIR resources under governance.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {FHIR_RESOURCES.map(r => (
            <div key={r.name} style={{ background: t.panel2, borderRadius: 8, padding: '9px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
              <span style={{ fontWeight: 700, color: t.text }}>{r.name}</span>
              <span style={{ color: t.sky, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(r.count)}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ── HL7 ────────────────────────────────────────────────────────────────────────

function Hl7View({ t }: { t: Theme }) {
  return (
    <>
      <SectionRule t={t} title="HL7 Message Broker" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Stat t={t} label="Broker Status" value="Healthy" tone="healthy" />
        <Stat t={t} label="Queued Messages" value="12" tone="warning" />
        <Stat t={t} label="Average Delay" value="15 ms" tone="healthy" />
        <Stat t={t} label="Message Types" value="6" tone="info" />
        <Stat t={t} label="HL7 Version" value="2.7" tone="info" />
      </div>
      <Card t={t} title="Message Flows" sub="Administrator watches every flow live — nothing is a black box.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HL7_TYPES.map(h => {
            const c = toneColor(t, h.tone);
            return (
              <div key={h.name} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 120px 120px', gap: 10, alignItems: 'center', background: t.panel2, borderRadius: 8, padding: '9px 12px' }}>
                <span style={{ fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{h.name}</span>
                <div style={{ height: 6, borderRadius: 3, background: t.border, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '72%', background: c, borderRadius: 3 }} />
                  <div className="e3-scan" style={{ position: 'absolute', top: 0, bottom: 0, width: 30, background: 'rgba(255,255,255,.25)' }} />
                </div>
                <TonePill t={t} tone={h.tone} />
                <span style={{ fontSize: 10.5, color: t.muted, fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>{h.queued} queued · {h.delayMs} ms</span>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

// ── DICOM / PACS / RIS / LIS ───────────────────────────────────────────────────

function DicomView({ t }: { t: Theme }) {
  const blocks = [
    {
      title: 'PACS', sub: 'Picture Archiving & Communication System', tone: 'healthy' as Tone, stats: [
        ['Connected', '●'], ['Studies', '2.8M'], ["Today's Images", '8,112'], ['Viewer', 'Healthy'], ['Storage', '89 TB'], ['Latency', '22 ms'],
      ],
    },
    {
      title: 'RIS', sub: 'Radiology Information System', tone: 'healthy' as Tone, stats: [
        ['Requests', '1,240'], ['Completed', '1,180'], ['Waiting', '48'], ['Reporting Time', '24 min'], ['Critical Findings', '9'], ['Exam Time', '14 min'],
      ],
    },
    {
      title: 'LIS', sub: 'Laboratory Information System', tone: 'warning' as Tone, stats: [
        ['Tests', '24,600'], ['Specimens', '8,120'], ['Validation', '97.2%'], ['Critical Results', '14'], ['Machine Status', '23/24'],
      ],
    },
  ];
  return (
    <>
      <SectionRule t={t} title="DICOM & Imaging Ecosystem" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {blocks.map(b => (
          <div key={b.title} style={{ background: t.panel, border: `1px solid ${toneColor(t, b.tone)}40`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: toneColor(t, b.tone), boxShadow: `0 0 8px ${toneColor(t, b.tone)}` }} className="e3-pulse" />
              <span style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{b.title}</span>
            </div>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 12 }}>{b.sub}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {b.stats.map(([l, v]) => <Stat key={l} t={t} label={l} value={v} mono />)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Marketplace ────────────────────────────────────────────────────────────────

function MarketplaceView({ t, model, isConnected }: { t: Theme; model: FacilityAdminModel | null; isConnected: (k: string) => boolean }) {
  const items = [
    { name: 'Telemedicine', desc: 'Remote consultation network', tag: 'clinical' },
    { name: 'ICU', desc: 'Intensive care digital operations', tag: 'clinical' },
    { name: 'NICU', desc: 'Neonatal intensive care', tag: 'clinical' },
    { name: 'Oncology', desc: 'Cancer care digital operations', tag: 'clinical' },
    { name: 'Dental', desc: 'Dental clinic module', tag: 'clinical' },
    { name: 'Blood Bank', desc: 'Blood bank & transfusion module', tag: 'clinical' },
    { name: 'Dialysis', desc: 'Renal dialysis module', tag: 'clinical' },
    { name: 'AI Modules', desc: 'Clinical intelligence extensions', tag: 'ai' },
    { name: 'Insurance Connectors', desc: 'SHA + payer integration connectors', tag: 'connector' },
    { name: 'FHIR Bridge', desc: 'Full R5 server adapter', tag: 'connector' },
    { name: 'HL7 Engine', desc: 'Message broker + translator', tag: 'connector' },
    { name: 'DICOM Adapter', desc: 'PACS image interchange', tag: 'connector' },
  ];
  const installed = (name: string) => {
    if (!model) return name === 'AI Modules' || name === 'FHIR Bridge' || name === 'HL7 Engine';
    return model.marketplace?.some(m => m.moduleId === name.toLowerCase().replace(/[^a-z]+/g, '_')) || name === 'AI Modules' || name === 'FHIR Bridge' || name === 'HL7 Engine';
  };
  return (
    <>
      <SectionRule t={t} title="Integration Marketplace" />
      <div style={{ fontSize: 11.5, color: t.muted, marginBottom: 4 }}>Install capabilities into the ecosystem — never replace working software, extend it.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
        {items.map(m => {
          const on = installed(m.name);
          const connected = isConnected(m.name.toLowerCase()) || on;
          return (
            <div key={m.name} style={{ background: t.panel, border: `1px solid ${on ? 'rgba(52,211,153,.3)' : t.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {on && <Plug size={14} color={t.green} />}
                <span style={{ fontSize: 13.5, fontWeight: 800, color: t.text }}>{m.name}</span>
              </div>
              <div style={{ fontSize: 11, color: t.muted, marginBottom: 10 }}>{m.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9.5, color: t.faint, textTransform: 'uppercase', letterSpacing: '.05em' }}>{m.tag}</span>
                <TonePill t={t} tone={connected ? 'healthy' : 'info'} label={connected ? 'Installed' : 'Available'} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Transformation Rules ───────────────────────────────────────────────────────

function TransformationView({ t }: { t: Theme }) {
  return (
    <>
      <SectionRule t={t} title="Transformation Rules" />
      <div style={{ fontSize: 11.5, color: t.muted, marginBottom: 4 }}>Normalization, standardization and enrichment applied on every record that crosses the mesh.</div>
      <Card t={t} title="Active Rules" sub={`${TRANSFORMATION_RULES.length} rules · standardize to FHIR → SNOMED → LOINC → ICD-11`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TRANSFORMATION_RULES.map(r => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr auto', gap: 10, alignItems: 'center', background: t.panel2, borderRadius: 8, padding: '9px 12px', fontSize: 11.5 }}>
              <span style={{ fontWeight: 700, color: t.text }}>{r.name}</span>
              <span style={{ color: t.muted, fontSize: 10.5 }}>{r.source} → {r.target}</span>
              <span style={{ color: t.sky, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>{r.action}</span>
              <span style={{ color: t.muted, fontSize: 10.5 }}>last run 2 min ago</span>
              <TonePill t={t} tone={r.status} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ── Synchronization ────────────────────────────────────────────────────────────

function SyncView({ t }: { t: Theme }) {
  return (
    <>
      <SectionRule t={t} title="Synchronization Pipeline" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(300px,0.8fr)', gap: 14, alignItems: 'start' }}>
        <Card t={t} title="Live Pipeline" sub="Watch records flow Epic → FHIR → AMEXAN → Neo4j → Intelligence → Digital Twin">
          <div style={{ position: 'relative', paddingLeft: 26 }}>
            {SYNC_PIPELINE.map((n, i) => (
              <div key={n.node} style={{ position: 'relative', paddingBottom: i === SYNC_PIPELINE.length - 1 ? 0 : 22 }}>
                <span style={{ position: 'absolute', left: -26, top: 4, width: 11, height: 11, borderRadius: '50%', background: toneColor(t, n.tone), boxShadow: `0 0 8px ${toneColor(t, n.tone)}` }} className="e3-pulse" />
                {i < SYNC_PIPELINE.length - 1 && (
                  <span style={{ position: 'absolute', left: -22, top: 18, bottom: -4, width: 2, background: t.border }}>
                    <span style={{ position: 'absolute', left: -1, width: 4, height: 4, borderRadius: '50%', background: t.sky, animation: 'e3dot 1.4s ease-in-out infinite' }} className="e3-dot" />
                  </span>
                )}
                <div style={{ background: t.panel2, border: `1px solid ${t.border}`, borderRadius: 9, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{n.node}</span>
                  <span style={{ fontSize: 10.5, color: t.muted }}>{n.sub}</span>
                  <span style={{ marginLeft: 'auto' }}><TonePill t={t} tone={n.tone} /></span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card t={t} title="AI Transformation" sub={'After import, AMEXAN continuously transforms — never “Import completed”.'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {AI_TRANSFORMATION_STEPS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 11.5 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: t.greenSoft, color: t.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, border: `1px solid ${t.green}` }}>✓</span>
                <span style={{ fontWeight: 700, color: t.text }}>{s.label}</span>
                <span style={{ marginLeft: 'auto', color: t.muted, fontSize: 10 }}>{s.detail}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: t.skySoft, border: `1px solid ${t.sky}40`, fontSize: 10.5, color: t.sky, fontFamily: "'JetBrains Mono', monospace" }}>
            stage 8/8 · knowledge graph rebuilt · intelligence active
          </div>
        </Card>
      </div>

      <Card t={t} title="Persistence Matrix" sub="PostgreSQL canonical store · Neo4j knowledge graph · Firestore realtime fabric">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>PostgreSQL · integration</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {PG_TABLES.map(tb => <span key={tb} style={{ padding: '3px 8px', borderRadius: 6, background: t.panel2, border: `1px solid ${t.border}`, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>{tb}</span>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.teal, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Neo4j · graph</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NEO4J_EDGES.map(([a, rel, b], i) => (
                <div key={i} style={{ fontSize: 10.5, color: t.muted, fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: t.text }}>{a}</span><span style={{ color: t.teal }}>{rel}</span><span style={{ color: t.text }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.sky, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Firestore · realtime</div>
            {['connection health', 'sync status', 'device monitoring', 'notifications', 'alerts', 'live queues'].map(x => (
              <div key={x} style={{ fontSize: 10.5, color: t.muted, fontFamily: "'JetBrains Mono', monospace", padding: '3px 0' }}>· {x}</div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

// ── Monitoring ─────────────────────────────────────────────────────────────────

function MonitoringView({ t }: { t: Theme }) {
  return (
    <>
      <SectionRule t={t} title="Real-Time Monitoring Wall" />
      <div style={{ fontSize: 11.5, color: t.muted, marginBottom: 4 }}>If anything fails, the administrator knows immediately.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
        {MONITOR_WALL.map(m => {
          const c = toneColor(t, m.tone);
          return (
            <div key={m.name} style={{ background: t.panel, border: `1px solid ${c}40`, borderRadius: 11, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={m.tone === 'healthy' ? 'e3-pulse' : undefined} style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 10px ${c}`, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{m.name}</div>
                <div style={{ fontSize: 10, color: c, textTransform: 'uppercase', letterSpacing: '.05em' }}>{toneLabel(m.tone).replace(/^[^\w]+/, '')}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Card t={t} title="Incident Feed" sub="Severity-ordered, live">
        {MONITOR_WALL.filter(m => m.tone !== 'healthy').map((m, i) => (
          <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
            <AlertTriangle size={13} color={toneColor(t, m.tone)} />
            <span style={{ fontWeight: 700, color: t.text }}>{m.name}</span>
            <span style={{ color: t.muted }}>requires attention · {i === 0 ? 'just now' : `${(i + 1) * 4} min ago`}</span>
          </div>
        ))}
        {MONITOR_WALL.every(m => m.tone === 'healthy') && <div style={{ fontSize: 12, color: t.green }}>All systems healthy.</div>}
      </Card>
    </>
  );
}

// ── Developer Portal ───────────────────────────────────────────────────────────

function DeveloperView({ t }: { t: Theme }) {
  const [apiKeys, setApiKeys] = useState<string[]>(['fk_live_amx_9f2…c41', 'fk_live_amx_sha_8a1…d02']);
  return (
    <>
      <SectionRule t={t} title="Developer Portal" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
        {DEVELOPER_PORTAL.map(d => (
          <div key={d.name} style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 11, padding: 13 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: t.sky }}>{d.name}</div>
            <div style={{ fontSize: 10.5, color: t.muted, marginTop: 3 }}>{d.desc}</div>
          </div>
        ))}
      </div>
      <Card t={t} title="API Keys" sub="Scoped · rotating · revocable">
        {apiKeys.map(k => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
            <Lock size={12} color={t.muted} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: t.text }}>{k}</span>
            <span style={{ marginLeft: 'auto', color: t.muted, fontSize: 10 }}>issued 2 days ago</span>
            <button onClick={() => setApiKeys(ks => ks.filter(x => x !== k))} style={{ background: t.redSoft, border: `1px solid ${t.red}40`, color: t.red, borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Revoke</button>
          </div>
        ))}
        <button onClick={() => setApiKeys(ks => [...ks, `fk_live_amx_${Math.random().toString(36).slice(2, 6)}…${Math.random().toString(36).slice(2, 5)}`])} style={{ marginTop: 12, padding: '7px 14px', borderRadius: 8, border: 'none', background: t.sky, color: '#04283f', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>+ Issue API Key</button>
      </Card>
    </>
  );
}

// ── Security ───────────────────────────────────────────────────────────────────

function SecurityView({ t }: { t: Theme }) {
  const stats = [
    { label: 'OAuth Clients', value: '18', tone: 'info' as Tone },
    { label: 'Active Tokens', value: '92', tone: 'info' as Tone },
    { label: 'Failed Logins (24h)', value: '7', tone: 'warning' as Tone },
    { label: 'MFA Coverage', value: '98.2%', tone: 'healthy' as Tone },
    { label: 'Data at Rest', value: 'AES-256', tone: 'healthy' as Tone },
    { label: 'Data in Transit', value: 'TLS 1.3', tone: 'healthy' as Tone },
  ];
  return (
    <>
      <SectionRule t={t} title="Security" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {stats.map(s => <Stat key={s.label} t={t} label={s.label} value={s.value} tone={s.tone} mono />)}
      </div>
      <Card t={t} title="Perimeter" sub="Every interface is governed — OAuth 2.0, mTLS, audit-every-write.">
        {['OAuth 2.0 + PKCE on every gateway', 'mTLS between connectors and broker', 'Rate limiting + key rotation governance', 'Field-level encryption for PHI', 'Zero standing privilege for integrations'].map(x => (
          <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: `1px solid ${t.border}`, fontSize: 11.5 }}>
            <ShieldCheck size={13} color={t.green} /> <span style={{ color: t.text }}>{x}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── Audit ──────────────────────────────────────────────────────────────────────

function AuditView({ t }: { t: Theme }) {
  return (
    <>
      <SectionRule t={t} title="Audit" />
      <div style={{ fontSize: 11.5, color: t.muted, marginBottom: 4 }}>Immutable, append-only ledger of every constitutional action across the ecosystem.</div>
      <Card t={t} title="Recent Events" sub="who · what · where · when — across all connected systems">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {AUDIT_EVENTS.map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 150px 1fr 130px auto', gap: 10, alignItems: 'center', background: t.panel2, borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
              <span style={{ color: t.faint, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(e.at).toLocaleTimeString()}</span>
              <span style={{ color: t.text, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{e.actor}</span>
              <span style={{ color: t.muted }}>{e.action}</span>
              <span style={{ color: t.faint, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>{e.scope}</span>
              <TonePill t={t} tone={e.tone} label={e.tone} />
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: t.faint, fontFamily: "'JetBrains Mono', monospace" }}>
        <Lock size={12} /> append-only · sha256-chained · verifiable export
      </div>
    </>
  );
}
