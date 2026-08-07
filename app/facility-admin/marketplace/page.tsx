'use client';

// AMEXAN — Hospital Capability Marketplace (Book V, Constitutional Engine)
// An Operating System for clinical capability. This is NOT an app store.
// This is the Hospital Capability Expansion Center: every installed engine is a
// first-class, constitutional citizen that provisions workflows, dashboards,
// clinical intelligence, analytics, integrations, permissions, documentation,
// Digital Twin components and APIs across the entire AMEXAN ecosystem.

import { useMemo, useState } from 'react';
import {
  Search, HeartPulse, Cpu, Boxes, BrainCircuit, Globe, ShieldCheck, Network,
  MonitorSmartphone, Download, KeyRound, TrendingUp, LayoutDashboard, Wrench, FlaskConical,
  Home, GitBranch, Menu, X, CheckCircle, Sparkles, Loader2,
} from 'lucide-react';
import WorkspaceGuard from '@/components/workspace/WorkspaceGuard';

const SupportedRoles = ['executive'] as const;

// ── Theme (shared with facility-admin command center) ──────────────────────
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
  indigo: '#6366f1',
};

type Status = 'installed' | 'available' | 'update' | 'licensed' | 'coming';
type Group = 'clinical' | 'diagnostic' | 'operation' | 'community' | 'ai' | 'national';

type Engine = {
  id: string;
  name: string;
  tagline: string;
  group: Group;
  category: string;
  icon: string;
  accent: string;
  version: string;
  status: Status;
  size: string;
  rate?: number;
  roles?: string[];
  dependencies?: string[];
  features: string[];
  kpis?: string[];
  digitalTwin?: boolean;
  clinicalIntelligence?: boolean;
  fhir?: boolean;
  releases?: { version: string; note: string }[];
  recommended?: string[];
  updated?: string;
};

const GROUP_META: Record<Group, string> = {
  clinical: 'Clinical Engines',
  diagnostic: 'Diagnostic Engines',
  operation: 'Operations Engines',
  community: 'Community Engines',
  ai: 'AI Intelligence Packs',
  national: 'National Packages',
};

const GROUP_ICON: Record<Group, string> = {
  clinical: '🫀', diagnostic: '🔬', operation: '⚙️', community: '🏘️', ai: '🧠', national: '🌍',
};

function mk(e: Engine): Engine {
  return {
    roles: [],
    dependencies: [],
    releases: [],
    ...e,
  };
}

// ── Engine catalog ─────────────────────────────────────────────────────────
const ENGINES: Engine[] = [
  // Clinical Engines
  mk({ id: 'icu', name: 'ICU', tagline: 'Intensive Care digital operations', group: 'clinical', category: 'Clinical Engine', icon: '🫀', accent: C.red, version: '6.3', status: 'update', size: '420 MB', rate: 47, roles: ['ICU Physicians', 'ICU Nurses', 'Respiratory Therapists'], dependencies: ['Critical Care Intelligence', 'Vitals Streaming', 'Ventilator Integration'], features: ['ICU Dashboard', 'Ventilator Management', 'Sedation Protocols', 'Daily Goals', 'SOFA Score', 'APACHE II', 'Sepsis Intelligence', 'ICU Analytics', 'Family Communication', 'Bed Management', 'Digital Twin'], kpis: ['SOFA compliance', 'Vent days / 1000', 'Unplanned extubation'], digitalTwin: true, clinicalIntelligence: true, fhir: true, updated: '2 days ago', recommended: ['Neonatal Intelligence', 'Critical Care Intelligence'], releases: [{ version: 'v6.3', note: 'Security fixes · New AI · Ventilator Bundle' }, { version: 'v6.2', note: 'Sedation Protocol 2.0 · Analytics rewrite' }] }),
  mk({ id: 'emergency', name: 'Emergency', tagline: 'Emergency department command & triage', group: 'clinical', category: 'Clinical Engine', icon: '🚑', accent: C.red, version: '4.1', status: 'installed', size: '210 MB', rate: 112, roles: ['ED Physicians', 'ED Nurses', 'Triage Officers'], dependencies: ['Triage System', 'Consultation'], features: ['Real-time ED Dashboard', 'ESI Triage', 'Resuscitation Bay', 'Overflow Management', 'Emergency Analytics', 'Ambulance Tracking'], kpis: ['Door-to-triage', 'Door-to-doctor', 'ED boarding hours'], digitalTwin: true, clinicalIntelligence: true, fhir: true, updated: '1 week ago' }),
  mk({ id: 'surgery', name: 'Surgery', tagline: 'Theatre & perioperative operations', group: 'clinical', category: 'Clinical Engine', icon: '🩺', accent: C.indigo, version: '5.0', status: 'installed', size: '280 MB', rate: 64, roles: ['Surgeons', 'Theatre Nurses', 'Anaesthesia'], features: ['Theatre Scheduling', 'WHO Checklist', 'Surgical Safety', 'Anaesthesia Record', 'Recovery', 'Operation Notes'], digitalTwin: true, fhir: true }),
  mk({ id: 'theatre', name: 'Theatre', tagline: 'Operating room resource center', group: 'clinical', category: 'Clinical Engine', icon: '🏥', accent: C.indigo, version: '3.8', status: 'update', size: '190 MB', rate: 38, roles: ['Theatre Managers', 'Surgeons', 'Theatre Nurses'], features: ['Case Scheduling', 'Equipment Locking', 'Turnover Analytics', 'Sterile Processing', 'Surgeon Preferences'], digitalTwin: true, fhir: true, updated: '3 days ago', recommended: ['Scheduling AI'] }),
  mk({ id: 'oncology', name: 'Oncology', tagline: 'Cancer service line & chemotherapy', group: 'clinical', category: 'Clinical Engine', icon: '🎗️', accent: C.purple, version: '4.0', status: 'available', size: '412 MB', roles: ['Medical Oncologists', 'Oncology Nurses', 'Pharmacists'], dependencies: ['Cancer Registry', 'Chemotherapy Module', 'Pharmacy', 'Laboratory', 'Pathology', 'Radiology'], features: ['Tumour Board', 'Chemotherapy Workbench', 'Regimen Libraries', 'Toxicity Tracking', 'Cancer Registry Sync', 'Palliative Handoff'], kpis: ['Cycle adherence', 'Toxicity alerts', 'Registry coverage'], digitalTwin: true, clinicalIntelligence: true, fhir: true, recommended: ['Radiology AI', 'Laboratory AI'] }),
  mk({ id: 'nicu', name: 'NICU', tagline: 'Neonatal intensive care', group: 'clinical', category: 'Clinical Engine', icon: '👶', accent: C.amber, version: '3.2', status: 'available', size: '180 MB', roles: ['Neonatologists', 'NICU Nurses'], dependencies: ['Neonatal Intelligence', 'Vitals Streaming'], features: ['Neonatal Scoring', 'Growth Charts', 'Phototherapy', 'Incubator Link', 'Newborn Screening'], digitalTwin: true, fhir: true, recommended: ['Neonatal Intelligence', 'Neonatal Pharmacy', 'Neonatal Laboratory', 'Neonatal Growth Charts', 'Newborn Screening'] }),
  mk({ id: 'dialysis', name: 'Dialysis', tagline: 'Renal replacement center', group: 'clinical', category: 'Clinical Engine', icon: '💧', accent: C.sky, version: '2.9', status: 'available', size: '150 MB', roles: ['Nephrologists', 'Dialysis Nurses'], features: ['Treatment Scheduling', 'Vascular Access', 'Fluid Balance', 'RRT Analytics'], digitalTwin: true, fhir: true, clinicalIntelligence: true }),
  mk({ id: 'obg', name: 'OBG', tagline: 'Obstetrics & gynaecology', group: 'clinical', category: 'Clinical Engine', icon: '🤰', accent: C.purple, version: '6.0', status: 'installed', size: '230 MB', rate: 90, roles: ['Obstetricians', 'Midwives'], features: ['Antepartum', 'Labour & Delivery', 'Postpartum', 'Maternal Early Warning', 'Caesarean Planning'], digitalTwin: true, fhir: true }),
  mk({ id: 'cardiology', name: 'Cardiology', tagline: 'Cardiac diagnostics & monitoring', group: 'clinical', category: 'Clinical Engine', icon: '❤️', accent: C.red, version: '3.5', status: 'available', size: '205 MB', roles: ['Cardiologists', 'Cardiac Nurses'], features: ['ECG Capture', 'Echo Workflow', 'Cath Lab', 'Rhythm Review'], digitalTwin: true, fhir: true }),
  mk({ id: 'stroke', name: 'Stroke Unit', tagline: 'Hyperacute stroke command', group: 'clinical', category: 'Clinical Engine', icon: '🧠', accent: C.purple, version: '2.4', status: 'available', size: '170 MB', roles: ['Stroke Physicians', 'Neurology Nurses'], features: ['Code Stroke', 'NIHSS Tracking', 'Thrombolysis Timer', 'Rehabilitation Handoff'], clinicalIntelligence: true, recommended: ['Stroke AI'] }),
  mk({ id: 'burns', name: 'Burn Unit', tagline: 'Burn care & fluid resuscitation', group: 'clinical', category: 'Clinical Engine', icon: '🔥', accent: C.amber, version: '1.6', status: 'licensed', size: '120 MB', roles: ['Burn Surgeons', 'Therapy Team'], features: ['Parkland Protocol', 'Lund-Browder', 'Dressing Capture'], digitalTwin: true }),
  mk({ id: 'mental', name: 'Mental Health', tagline: 'Behavioral health workflows', group: 'clinical', category: 'Clinical Engine', icon: '🧘', accent: C.indigo, version: '2.8', status: 'available', size: '130 MB', roles: ['Psychiatrists', 'Psychologists'], features: ['Screening Tools', 'Risk Assessment', 'Care Plans'], }),
  mk({ id: 'palliative', name: 'Palliative Care', tagline: 'Compassionate end-of-life care', group: 'clinical', category: 'Clinical Engine', icon: '🕊️', accent: C.slate, version: '2.1', status: 'coming', size: '90 MB', roles: ['Palliative Team'], features: ['Symptom Management', 'Dignity Plans', 'Family Support'], digitalTwin: true }),

  // Diagnostic Engines
  mk({ id: 'radiology', name: 'Radiology', tagline: 'Imaging & PACS', group: 'diagnostic', category: 'Diagnostic Engine', icon: '📷', accent: C.indigo, version: '4.4', status: 'installed', size: '300 MB', rate: 55, roles: ['Radiologists', 'Radiographers'], features: ['DICOM Viewing', 'Report Capture', 'Dose Tracking', 'Intervention'], digitalTwin: true, fhir: true, clinicalIntelligence: true }),
  mk({ id: 'laboratory', name: 'Laboratory', tagline: 'Lab & LIS', group: 'diagnostic', category: 'Diagnostic Engine', icon: '🔬', accent: C.sky, version: '5.2', status: 'installed', size: '260 MB', rate: 128, roles: ['Lab Techs', 'Pathologists'], features: ['LIS Core', 'Orders', 'Result Auto-post', 'Critical Alerts', 'QC'], digitalTwin: true, fhir: true }),
  mk({ id: 'pathology', name: 'Pathology', tagline: 'Anatomical pathology', group: 'diagnostic', category: 'Diagnostic Engine', icon: '🧫', accent: C.purple, version: '3.0', status: 'available', size: '140 MB', roles: ['Pathologists'], features: ['Specimen Tracking', 'Grossing', 'Slides & Blocks', 'Reporting'], digitalTwin: true }),
  mk({ id: 'bloodbank', name: 'Blood Bank', tagline: 'Transfusion & inventory', group: 'diagnostic', category: 'Diagnostic Engine', icon: '🩸', accent: C.red, version: '2.7', status: 'available', size: '150 MB', roles: ['Blood Bank Techs'], dependencies: ['Laboratory'], features: ['Donor Registry', 'Crossmatch Inventory', 'Cool Chain Tracking', 'Transfusion Monitoring'] }),
  mk({ id: 'microbiology', name: 'Microbiology', tagline: 'Culture & sensitivity', group: 'diagnostic', category: 'Diagnostic Engine', icon: '🦠', accent: C.sky, version: '2.3', status: 'licensed', size: '110 MB', roles: ['Microbiologists'], dependencies: ['Laboratory'], features: ['Culture Handling', 'Sensitivity Tracking', 'AMR Surveillance'], recommended: ['Antibiotic Stewardship'] }),
  mk({ id: 'molecular', name: 'Molecular Laboratory', tagline: 'PCR & molecular diagnostics', group: 'diagnostic', category: 'Diagnostic Engine', icon: '🧬', accent: C.purple, version: '1.9', status: 'available', size: '120 MB', roles: ['Molecular Techs'], features: ['PCR Workflow', 'Panel Management', 'Viral Load Tracking'], fhir: true }),

  // Operations Engines
  mk({ id: 'finance', name: 'Finance', tagline: 'Revenue & claims', group: 'operation', category: 'Operations Engine', icon: '💰', accent: C.green, version: '4.8', status: 'installed', size: '240 MB', rate: 31, roles: ['Finance Team'], features: ['Billing', 'Claims', 'Collections', 'GL', 'Pricing'], digitalTwin: true }),
  mk({ id: 'inventory', name: 'Inventory', tagline: 'Supplies & procurement', group: 'operation', category: 'Operations Engine', icon: '📦', accent: C.amber, version: '3.9', status: 'installed', size: '160 MB', rate: 22, roles: ['Stores'], features: ['Stock Control', 'Reorder Alerts', 'Drug Supply', 'Vendor Registration'], digitalTwin: true, recommended: ['Procurement'] }),
  mk({ id: 'hr', name: 'HR', tagline: 'Human resources core', group: 'operation', category: 'Operations Engine', icon: '👥', accent: C.indigo, version: '3.3', status: 'installed', size: '180 MB', roles: ['HR'], features: ['Employee Directories', 'Rosters', 'Leave', 'Duty Workload'] }),
  mk({ id: 'payroll', name: 'Payroll', tagline: 'Compensation automation', group: 'operation', category: 'Operations Engine', icon: '💼', accent: C.navy, version: '2.5', status: 'available', size: '120 MB', roles: ['Finance'], features: ['Payslips', 'Statutory Links', 'Allowances', 'Bulk Processing'] }),
  mk({ id: 'scheduling', name: 'Scheduling', tagline: 'Rosters & appointments', group: 'operation', category: 'Operations Engine', icon: '📅', accent: C.sky, version: '3.6', status: 'installed', size: '140 MB', rate: 44, roles: ['HR', 'Ward Managers'], features: ['Provider Rosters', 'Appointments', 'Utilization', 'No-Show Alerts'] }),
  mk({ id: 'fleet', name: 'Fleet', tagline: 'Ambulance & transport', group: 'operation', category: 'Operations Engine', icon: '🚐', accent: C.green, version: '1.9', status: 'licensed', size: '100 MB', roles: ['Logistics'], features: ['Vehicle Tracking', 'Maintenance', 'Dispatch', 'Fuel Log'], recommended: ['Remote Monitoring'] }),
  mk({ id: 'mortuary', name: 'Mortuary', tagline: 'Mortuary management', group: 'operation', category: 'Operations Engine', icon: '⚰️', accent: C.slate, version: '1.3', status: 'coming', size: '50 MB', roles: ['Mortuary Attendants'], features: ['Body Log', 'Cold Storage', 'Release Workflow'] }),

  // Community Engines
  mk({ id: 'telemedicine', name: 'Telemedicine', tagline: 'Remote consultation network', group: 'community', category: 'Community Engine', icon: '📹', accent: C.sky, version: '4.2', status: 'installed', size: '220 MB', rate: 28, roles: ['Physicians', 'Nurses'], features: ['Video Calls', 'ePrescribing', 'Remote Monitoring', 'Patient Messaging'], digitalTwin: true, fhir: true }),
  mk({ id: 'homecare', name: 'Home Care', tagline: 'Community care bridging', group: 'community', category: 'Community Engine', icon: '🏠', accent: C.green, version: '2.0', status: 'available', size: '140 MB', roles: ['Community Health Workers'], features: ['Visit Scheduling', 'Remote Vital Signs', 'Task Bars', 'Careplans'] }),
  mk({ id: 'vaccination', name: 'Vaccination', tagline: 'Immunization program', group: 'community', category: 'Community Engine', icon: '💉', accent: C.sky, version: '3.1', status: 'installed', size: '110 MB', roles: ['Vaccinators'], features: ['Schedule Registry', 'Cold Chain', 'Stockouts', 'Campaigns'] }),
  mk({ id: 'remote', name: 'Remote Monitoring', tagline: 'Connected care at home', group: 'community', category: 'Community Engine', icon: '📡', accent: C.purple, version: '1.5', status: 'coming', size: '130 MB', roles: ['Care Teams', 'Patients'], features: ['Vitals at Home', 'Alerts', 'Medication Reminders'], clinicalIntelligence: true }),

  // AI Intelligence Packs
  mk({ id: 'sepsis-ai', name: 'Sepsis AI', tagline: 'Sepsis prediction & alerts', group: 'ai', category: 'AI Pack', icon: '🧪', accent: C.red, version: '3.0', status: 'installed', size: '90 MB', roles: ['All Clinicians'], features: ['Sepsis Alert', 'Bundle Tracking', 'Mortality Predictor'], clinicalIntelligence: true }),
  mk({ id: 'stroke-ai', name: 'Stroke AI', tagline: 'Thrombolysis decision support', group: 'ai', category: 'AI Pack', icon: '🧠', accent: C.purple, version: '2.4', status: 'available', size: '70 MB', roles: ['Neurology'], features: ['NIHSS Auto', 'Door-to-needle', 'Outcome Prediction'], clinicalIntelligence: true }),
  mk({ id: 'aki-ai', name: 'AKI Intelligence', tagline: 'Acute kidney injury alerts', group: 'ai', category: 'AI Pack', icon: '🫘', accent: C.sky, version: '1.7', status: 'available', size: '65 MB', roles: ['Nephrology', 'ICU'], features: ['KDIGO Alerts', 'Creatinine Trend', 'Fluid Risk'], clinicalIntelligence: true }),
  mk({ id: 'drug-ai', name: 'Drug Interaction AI', tagline: 'Safety-critical interactions', group: 'ai', category: 'AI Pack', icon: '💊', accent: C.amber, version: '3.2', status: 'installed', size: '85 MB', roles: ['Pharmacy', 'Clinicians'], features: ['Interaction Checking', 'Contraindications', 'Dose Adjustment'], clinicalIntelligence: true }),
  mk({ id: 'radio-ai', name: 'Radiology AI', tagline: 'Image triage intelligence', group: 'ai', category: 'AI Pack', icon: '📷', accent: C.indigo, version: '2.1', status: 'installed', size: '190 MB', roles: ['Radiology'], features: ['Chest X-ray Triage', 'Fracture Detection', 'Priority Flagging'], clinicalIntelligence: true }),
  mk({ id: 'bed-ai', name: 'Bed Occupancy AI', tagline: 'Capacity forecasting', group: 'ai', category: 'AI Pack', icon: '🛏️', accent: C.sky, version: '1.8', status: 'available', size: '60 MB', roles: ['Bed Managers'], features: ['Discharge Forecast', 'Admission Forecast', 'Overflow Model'], clinicalIntelligence: true }),
  mk({ id: 'revenue-ai', name: 'Revenue Intelligence', tagline: 'Payer & revenue insight', group: 'ai', category: 'AI Pack', icon: '📊', accent: C.green, version: '1.4', status: 'licensed', size: '55 MB', roles: ['Finance'], features: ['Denial Prediction', 'Payer Mix', 'Charge Capture'] }),
  mk({ id: 'antibiotic-ai', name: 'Antibiotic Stewardship', tagline: 'AMR-aware prescribing', group: 'ai', category: 'AI Pack', icon: '🛡️', accent: C.indigo, version: '2.0', status: 'available', size: '75 MB', roles: ['ID Physicians', 'Pharmacy'], features: ['Guideline Checks', 'Restriction Workflow', 'AMR Surveillance'], clinicalIntelligence: true }),

  // National Packages
  mk({ id: 'moh', name: 'MOH Kenya', tagline: 'Ministry of Health', group: 'national', category: 'National Package', icon: '🇰🇪', accent: C.green, version: '2.0', status: 'installed', size: '100 MB', roles: ['Health Records'], features: ['MOH Reporting', 'KHIS Sync', 'Indicator Packs'], updated: '1 week ago' }),
  mk({ id: 'sha', name: 'Social Health Authority', tagline: 'SHA claims & eligibility', group: 'national', category: 'National Package', icon: '🛡️', accent: C.sky, version: '3.4', status: 'installed', size: '85 MB', roles: ['Finance', 'Front Desk'], features: ['Eligibility Checks', 'Claims', 'Prior Authorization', 'Enrollee Lookup'], updated: '3 days ago' }),
  mk({ id: 'nhif', name: 'NHIF Legacy', tagline: 'Legacy insurance connector', group: 'national', category: 'National Package', icon: '🧾', accent: C.amber, version: '1.9', status: 'installed', size: '60 MB', roles: ['Finance'], features: ['Legacy Claims', 'Member Verification'], updated: '2 weeks ago' }),
  mk({ id: 'dhis2', name: 'DHIS2', tagline: 'National reporting', group: 'national', category: 'National Package', icon: '📊', accent: C.purple, version: '2.2', status: 'installed', size: '90 MB', roles: ['Health Records'], features: ['Data Elements', 'Aggregate Reporting', 'Analytics'] }),
  mk({ id: 'kenyaemr', name: 'KenyaEMR', tagline: 'EMR bridge', group: 'national', category: 'National Package', icon: '🔗', accent: C.indigo, version: '1.6', status: 'available', size: '70 MB', roles: ['IT'], features: ['Patient Sync', 'Lab Bridge', 'Pharmacy Bridge'] }),

  // Interoperability / platform
  mk({ id: 'fhir', name: 'FHIR Pack', tagline: 'Interoperability core', group: 'national', category: 'Interoperability', icon: '📡', accent: C.sky, version: '4.0', status: 'update', size: '50 MB', roles: ['IT'], features: ['FHIR R4', 'HL7 v2', 'OpenAPI'], fhir: true, updated: 'Security update available', releases: [{ version: 'v4.0', note: 'Security update · FHIR R4 payload signing' }] }),
  mk({ id: 'digitaltwin', name: 'Digital Twin', tagline: 'Whole-hospital twin', group: 'national', category: 'Interoperability', icon: '🏢', accent: C.indigo, version: '2.6', status: 'installed', size: '160 MB', roles: ['IT'], features: ['Digital Twin Graph', 'Asset Graph', 'Simulation'], digitalTwin: true }),
];

const STATUS_LABEL: Record<Status, string> = {
  installed: 'Installed', available: 'Available', update: 'Update Available', licensed: 'Licensed', coming: 'Coming Soon',
};

// ── Page shell ─────────────────────────────────────────────────────────────
export default function CapabilityCenterPage() {
  return (
    <WorkspaceGuard supportedRoles={SupportedRoles}>
      <CapabilityCenter />
    </WorkspaceGuard>
  );
}

type NavItem = { id: string; label: string; icon: any; groupKey?: Group };

const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Discover', items: [{ id: 'home', label: 'Marketplace', icon: LayoutDashboard }, { id: 'modules', label: 'Hospital Modules', icon: Boxes }] },
  {
    group: 'Clinical',
    items: [
      { id: 'clinical', label: 'Clinical Engines', icon: HeartPulse, groupKey: 'clinical' },
      { id: 'diagnostic', label: 'Diagnostic Engines', icon: FlaskConical, groupKey: 'diagnostic' },
      { id: 'operation', label: 'Operations Engines', icon: Wrench, groupKey: 'operation' },
      { id: 'community', label: 'Community Engines', icon: Home, groupKey: 'community' },
      { id: 'ai', label: 'AI Intelligence Packs', icon: BrainCircuit, groupKey: 'ai' },
      { id: 'national', label: 'National Packages', icon: Globe, groupKey: 'national' },
    ],
  },
  {
    group: 'Network',
    items: [
      { id: 'insurance', label: 'Insurance Connectors', icon: ShieldCheck },
      { id: 'interop', label: 'Interoperability', icon: Network },
      { id: 'devices', label: 'Devices', icon: MonitorSmartphone },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'updates', label: 'Updates', icon: Download },
      { id: 'licensing', label: 'Licensing', icon: KeyRound },
      { id: 'analytics', label: 'Usage Analytics', icon: TrendingUp },
      { id: 'developer', label: 'Developer Store', icon: GitBranch },
    ],
  },
];

function CapabilityCenter() {
  const [view, setView] = useState<string>('home');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<Engine | null>(null);
  const [wizard, setWizard] = useState<Engine | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { installed: 0, available: 0, update: 0, licensed: 0, coming: 0 };
    ENGINES.forEach(e => c[e.status]++);
    return c;
  }, []);

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const openInstall = (e: Engine) => setWizard(e);
  const openByName = (name: string) => {
    const found = ENGINES.find(x => x.name.toLowerCase() === name.toLowerCase());
    setWizard(found || mk({ id: name.toLowerCase().replace(/\s+/g, '-'), name, tagline: 'Capability engine', group: 'ai', category: 'AI Pack', icon: '🧠', accent: C.purple, version: '1.0', status: 'available', size: '—', features: [], digitalTwin: true, clinicalIntelligence: true, fhir: true }));
  };
  const finishInstall = (name: string) => {
    setInstalled(prev => new Set(prev).add(name));
    notify(`${name} engine installed ✓`);
  };

  const countFor = (groupKey?: Group) => groupKey ? ENGINES.filter(e => e.group === groupKey).length : 0;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Noto Sans',system-ui,sans-serif", color: C.navy }}>
      <style>{`@keyframes mfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@keyframes mpspin{to{transform:rotate(360deg)}}.mp-fade{animation:mfade .18s ease-out}.mp-spin{animation:mpspin 1s linear infinite}.mp-menu-toggle{display:none}@media(max-width:900px){.mp-menu-toggle{display:inline-flex}.mp-sidebar{display:none;position:fixed;width:248px!important;left:0;top:58px;bottom:0;z-index:40}.mp-sidebar--open{display:block!important}}`}</style>

      {/* Toolbar */}
      <div style={{ height: 58, background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => setMobileOpen(o => !o)} className="mp-menu-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }}>
          {mobileOpen ? <X size={20} color={C.slate} /> : <Menu size={20} color={C.slate} />}
        </button>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.sky},${C.indigo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Cpu size={18} /></div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>Hospital Capability Marketplace</div>
          <div style={{ fontSize: 10, color: C.muted }}>AMEXAN operating system · capability expansion center</div>
        </div>
        <span style={{ width: 1, height: 24, background: C.border }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
          <Search size={15} color={C.muted} style={{ flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find dialysis, oncology, ICU, blood bank, sepsis AI..." style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: C.navy }} />
        </div>
        <button onClick={() => setView('licensing')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}><KeyRound size={13} /> Licensing</button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.green, fontWeight: 700, background: `${C.green}14`, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}><CheckCircle size={13} /> Synced · 3 min</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>
        {/* Sidebar */}
        <aside className={`mp-sidebar${mobileOpen ? ' mp-sidebar--open' : ''}`} style={{ width: 248, background: C.card, borderRight: `1px solid ${C.border}`, padding: '10px 8px', overflowY: 'auto', flexShrink: 0 }}>
          {NAV.map(section => (
            <div key={section.group} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 12px', marginBottom: 2 }}>{section.group}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const badge = item.id === 'updates' ? counts.update : item.groupKey ? countFor(item.groupKey) : 0;
                return (
                  <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: view === item.id ? C.skyLight : 'transparent', color: view === item.id ? C.sky : C.slate, fontSize: 12, fontWeight: view === item.id ? 700 : 500, cursor: 'pointer' }}>
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.id === 'updates' ? (badge > 0 ? <span style={{ fontSize: 9, background: `${C.amber}18`, color: C.amber, padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>{badge}</span> : null)
                      : item.groupKey ? <span style={{ fontSize: 10, color: C.muted }}>{badge}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: `linear-gradient(135deg,${C.sky}14,${C.indigo}14)`, border: `1px solid ${C.border}`, fontSize: 11, color: C.slate }}>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 2 }}>⚙️ {counts.installed} engines live</div>
            AMEXAN releases every capability, never the core.
          </div>
        </aside>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,43,77,.35)', zIndex: 30 }} />}

        <main style={{ flex: 1, padding: 22, minWidth: 0, overflowY: 'auto' }}>
          {view === 'home' && <HomeView engines={ENGINES} counts={counts} onPreview={setPreview} onInstall={openInstall} onNavigate={setView} installed={installed} />}
          {view === 'modules' && <EngineGridView title="Hospital Modules" sub="Clinical, diagnostic, operational and community capability engines." engines={ENGINES.filter(e => e.group !== 'ai' && e.group !== 'national')} onPreview={setPreview} onInstall={openInstall} installed={installed} />}
          {(['clinical', 'diagnostic', 'operation', 'community'] as Group[]).includes(view as Group) && <EngineGridView title={GROUP_META[view as Group]} sub={`${ENGINES.filter(e => e.group === view).length} engines in this capability group.`} engines={ENGINES.filter(e => e.group === view)} onPreview={setPreview} onInstall={openInstall} installed={installed} />}
          {view === 'ai' && <AICapabilityStore engines={ENGINES.filter(e => e.group === 'ai')} onPreview={setPreview} onInstall={openInstall} installed={installed} />}
          {view === 'national' && <EngineGridView title="National Packages" sub="MOH Kenya, SHA, NHIF, DHIS2, KenyaEMR — everything one click." engines={ENGINES.filter(e => e.group === 'national')} onPreview={setPreview} onInstall={openInstall} installed={installed} />}
          {view === 'insurance' && <InsuranceView />}
          {view === 'interop' && <InteropView engines={ENGINES.filter(e => e.id === 'fhir' || e.id === 'digitaltwin')} onPreview={setPreview} installed={installed} />}
          {view === 'devices' && <DevicesView />}
          {view === 'updates' && <UpdatesView engines={ENGINES} onPreview={setPreview} onInstall={openInstall} installed={installed} />}
          {view === 'licensing' && <LicensingView engines={ENGINES} />}
          {view === 'analytics' && <UsageAnalyticsView engines={ENGINES} />}
          {view === 'developer' && <DeveloperStore />}

          {search && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Search results for “{search}”</div>
              <SearchResults query={search} onPreview={setPreview} onInstall={openInstall} installed={installed} />
            </div>
          )}
        </main>
      </div>

      {preview && <PreviewDrawer engine={preview} onClose={() => setPreview(null)} onInstall={openInstall} onOpenByName={openByName} installed={installed} />}
      {wizard && <InstallWizard engine={wizard} onClose={() => setWizard(null)} onFinish={finishInstall} onOpenByName={openByName} installed={installed} />}

      {toast && (
        <div style={{ position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 70, background: C.navy, color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 12, fontWeight: 600, boxShadow: '0 10px 30px rgba(11,43,77,.3)' }}>{toast}</div>
      )}
    </div>
  );
}

// ── Shared atoms ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const color = status === 'update' ? C.amber : status === 'installed' ? C.green : status === 'available' ? C.sky : status === 'licensed' ? C.purple : C.muted;
  return <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: `${color}16`, color, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.03em' }}>{STATUS_LABEL[status]}</span>;
}

function Flag({ ok, label }: { ok?: boolean; label: string }) {
  const on = ok;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, background: on ? `${C.green}10` : `${C.muted}10`, color: on ? C.green : C.muted, padding: '2px 7px', borderRadius: 5 }}>
      {on ? '✓ ' : '· '}{label}
    </span>
  );
}

function StatCard({ label, value, accent, small }: { label: string; value: string | number; accent: string; small?: boolean }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '15px 16px' }}>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: small ? 20 : 28, fontWeight: 800, color: accent, marginTop: 3 }}>{value}</div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | number }) {
  return <div style={{ padding: '9px 10px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}><div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.03em' }}>{label}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{value}</div></div>;
}

function Pill({ label, color = C.slate, bg }: { label: string; color?: string; bg?: string }) {
  return <span style={{ fontSize: 10, padding: '4px 9px', borderRadius: 6, background: bg || '#f1f5f9', color, fontWeight: 600 }}>{label}</span>;
}

// ── Home / Landing ─────────────────────────────────────────────────────────
function HomeView({ engines, counts, onPreview, onInstall, onNavigate, installed }: { engines: Engine[]; counts: Record<Status, number>; onPreview: (e: Engine) => void; onInstall: (e: Engine) => void; onNavigate: (v: string) => void; installed: Set<string> }) {
  const featured = engines.filter(e => ['icu', 'oncology', 'nicu', 'dialysis', 'cardiology', 'telemedicine'].includes(e.id));
  const aiPacks = engines.filter(e => e.group === 'ai');
  const isInstalled = (e: Engine) => e.status === 'installed' || installed.has(e.name);
  return (
    <div className="mp-fade" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Constitutional mission banner */}
      <div style={{ padding: 20, borderRadius: 16, background: 'linear-gradient(120deg,#0b2c4d,#0f3a66)', color: '#eaf1f9', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -40, fontSize: 150, opacity: .08, fontWeight: 800 }}>⚕</div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7dd3fc', fontWeight: 800 }}>Constitutional Mission</div>
        <div style={{ fontSize: 19, fontWeight: 800, margin: '6px 0 6px', maxWidth: 720 }}>Enable this hospital to safely extend its digital capability without rebuilding the system.</div>
        <div style={{ fontSize: 12, color: '#c7d8ee', maxWidth: 700, lineHeight: 1.6 }}>Every installed capability becomes a <span style={{ color: '#7dd3fc', fontWeight: 700 }}>constitutional engine</span> — not a plugin, not an extension, but a first-class citizen of the operating system. Open a dialysis unit, an oncology service, or telemedicine; AMEXAN automatically provisions the workflows, dashboards, clinical intelligence, analytics, permissions, documentation, Digital Twin components and APIs.</div>
      </div>

      {/* Leaderboard stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
        <StatCard label="Installed Engines" value={counts.installed} accent={C.green} />
        <StatCard label="Available Engines" value={counts.available} accent={C.sky} />
        <StatCard label="Licensed Engines" value={counts.licensed} accent={C.purple} />
        <StatCard label="Pending Updates" value={counts.update} accent={C.amber} />
        <StatCard label="Beta Features" value="5" accent={C.indigo} />
        <StatCard label="Marketplace Health" value="Excellent" accent={C.green} small />
      </div>

      {/* Category quick access */}
      <div>
        <SectionTitle title="Explore by capability" sub="Clinical, diagnostic, operations, community, AI and national packages." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: 10 }}>
          {(Object.keys(GROUP_META) as Group[]).map(g => {
            const gEngines = engines.filter(e => e.group === g);
            return (
              <button key={g} onClick={() => onNavigate(g)} style={{ textAlign: 'left', padding: 14, borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{GROUP_ICON[g]}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{GROUP_META[g]}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{gEngines.length} engines</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured engine cards */}
      <div>
        <SectionTitle title="Featured engines" sub="Capabilities recommended for this facility." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 12 }}>
          {featured.slice(0, 4).map(e => <EngineCard key={e.id} e={e} onPreview={onPreview} onInstall={onInstall} installed={isInstalled(e)} />)}
        </div>
      </div>

      {/* AI capability store strip */}
      <div style={{ padding: 16, borderRadius: 14, background: C.card, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BrainCircuit size={15} color={C.purple} />
          <div style={{ fontWeight: 800, fontSize: 14 }}>AI Capability Store</div>
          <span style={{ fontSize: 10, color: C.muted }}>The administrator installs intelligence.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {aiPacks.slice(0, 6).map(ai => (
            <div key={ai.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#f8fafc' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.purple}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{ai.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{ai.name}</div><div style={{ fontSize: 10, color: C.muted }}>{ai.tagline}</div></div>
              <StatusBadge status={ai.status} />
              {ai.status !== 'installed' && !installed.has(ai.name) && <button onClick={() => onInstall(ai)} style={{ border: 'none', background: C.sky, color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>Install</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Engine card + grid ─────────────────────────────────────────────────────
function EngineCard({ e, onPreview, onInstall, installed }: { e: Engine; onPreview: (e: Engine) => void; onInstall: (e: Engine) => void; installed: boolean }) {
  const status: Status = installed ? 'installed' : e.status;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: `${e.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{e.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{e.name}</span>
            <span style={{ fontSize: 10, color: C.muted }}>v{e.version}</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{e.tagline}</div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div style={{ fontSize: 10, color: C.muted, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span>{GROUP_META[e.group]}</span>
        {e.size && <span>📦 {e.size}</span>}
        {e.rate ? <span>👥 {e.rate} daily users</span> : null}
      </div>
      {(e.roles && e.roles.length > 0) && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {e.roles.slice(0, 3).map(r => <span key={r} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#f1f5f9', color: C.slate }}>{r}</span>)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {e.fhir && <Flag ok label="FHIR" />}
        {e.digitalTwin && <Flag ok label="Digital Twin" />}
        {e.clinicalIntelligence && <Flag ok label="Clinical Intelligence" />}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', gap: 6, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        {status === 'installed' ? (
          <button disabled style={{ flex: 1, border: 'none', background: `${C.green}10`, color: C.green, fontSize: 11, fontWeight: 700, padding: '9px 0', borderRadius: 8, cursor: 'default' }}>✓ Installed</button>
        ) : (
          <button onClick={() => onInstall(e)} style={{ flex: 1, border: 'none', background: status === 'update' ? C.amber : C.sky, color: '#fff', fontSize: 11, fontWeight: 700, padding: '9px 0', borderRadius: 8, cursor: 'pointer' }}>
            {status === 'update' ? 'Install Update' : 'Install'}
          </button>
        )}
        <button onClick={() => onPreview(e)} style={{ width: 70, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>Preview</button>
      </div>
    </div>
  );
}

function EngineGridView({ title, sub, engines, onPreview, onInstall, installed }: { title: string; sub: string; engines: Engine[]; onPreview: (e: Engine) => void; onInstall: (e: Engine) => void; installed: Set<string> }) {
  return (
    <div className="mp-fade">
      <SectionTitle title={title} sub={sub} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 12 }}>
        {engines.map(e => <EngineCard key={e.id} e={e} onPreview={onPreview} onInstall={onInstall} installed={installed.has(e.name)} />)}
      </div>
    </div>
  );
}

function SearchResults({ query, onPreview, onInstall, installed }: { query: string; onPreview: (e: Engine) => void; onInstall: (e: Engine) => void; installed: Set<string> }) {
  const q = query.toLowerCase();
  const results = ENGINES.filter(e => e.name.toLowerCase().includes(q) || e.tagline.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.roles?.some(r => r.toLowerCase().includes(q)));
  if (results.length === 0) return <div style={{ fontSize: 12, color: C.muted, padding: '20px 0' }}>No engines match. Try “dialysis”, “ICU”, “blood bank”, “sepsis”.</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 12 }}>
      {results.map(e => <EngineCard key={e.id} e={e} onPreview={onPreview} onInstall={onInstall} installed={installed.has(e.name)} />)}
    </div>
  );
}

// ── AI store / insurance / interop / devices ───────────────────────────────
function AICapabilityStore({ engines, onPreview, onInstall, installed }: { engines: Engine[]; onPreview: (e: Engine) => void; onInstall: (e: Engine) => void; installed: Set<string> }) {
  return (
    <div className="mp-fade">
      <SectionTitle title="AI Capability Store" sub="Install intelligence — Sepsis, Stroke, AKI, Radiology, Lab, Drug Interaction, Revenue." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {engines.map(ai => (
          <div key={ai.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.purple}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{ai.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{ai.name} <span style={{ fontSize: 10, color: C.muted }}>v{ai.version}</span></div>
              <div style={{ fontSize: 10, color: C.muted }}>{ai.tagline}</div>
            </div>
            <StatusBadge status={installed.has(ai.name) ? 'installed' : ai.status} />
            <button onClick={() => onPreview(ai)} style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 11, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>Preview</button>
            {ai.status !== 'installed' && !installed.has(ai.name) && <button onClick={() => onInstall(ai)} style={{ border: 'none', background: C.sky, color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Install</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsuranceView() {
  const connectors = [
    { name: 'Social Health Authority (SHA)', status: 'Connected', note: 'Claims · Eligibility · Prior Auth', color: C.sky },
    { name: 'NHIF Legacy', status: 'Connected', note: 'Legacy claims · Member lookup', color: C.slate },
    { name: 'Private Insurance Network', status: '12 Available', note: 'Bidirectional claims & eligibility', color: C.green },
    { name: 'Claims Automation', status: 'Enabled', note: 'SDK auto-submission', color: C.purple },
    { name: 'Eligibility Checks', status: 'Enabled', note: 'Real-time at checkout', color: C.indigo },
    { name: 'Prior Authorization', status: 'Supported', note: 'Procedures & imaging', color: C.amber },
  ];
  return (
    <div className="mp-fade">
      <SectionTitle title="Insurance Network" sub="Payers connected at the operating-system level — not per software install." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))', gap: 12 }}>
        {connectors.map(c => (
          <div key={c.name} style={{ padding: 14, background: C.card, border: `1px solid ${c.color}44`, borderRadius: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: C.muted, margin: '4px 0 10px' }}>{c.note}</div>
            <Pill label={c.status} color={c.color} bg={`${c.color}12`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function InteropView({ engines, onPreview, installed }: { engines: Engine[]; onPreview: (e: Engine) => void; installed: Set<string> }) {
  const compat: [string, boolean][] = [['FHIR', true], ['Neo4j', true], ['PostgreSQL', true], ['Digital Twin', true], ['Clinical Intelligence', true], ['Analytics', true]];
  return (
    <div className="mp-fade">
      <SectionTitle title="Interoperability Engines" sub="FHIR core, HL7, Digital Twin — the substrate every capability rides on." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 12 }}>
        {engines.map(e => <EngineCard key={e.id} e={e} onPreview={onPreview} onInstall={() => {}} installed={installed.has(e.name)} />)}
      </div>
      <div style={{ marginTop: 14, padding: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Engine Compatibility</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 8 }}>
          {compat.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: '#f8fafc', borderRadius: 8, fontSize: 12 }}><ShieldCheck size={14} color={C.green} /><span style={{ fontWeight: 600 }}>{k}</span><span style={{ marginLeft: 'auto', color: C.green, fontWeight: 800, fontSize: 13 }}>{v ? '✓' : ''}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DevicesView() {
  const devices = ['Ventilator Drivers', 'Patient Monitors', 'ECG', 'Ultrasound', 'MRI', 'CT', 'Laboratory Machines', 'Infusion Pumps'];
  return (
    <div className="mp-fade">
      <SectionTitle title="Device Marketplace" sub="Connect hardware — drivers installed one-click." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 10 }}>
        {devices.map(d => (
          <button key={d} style={{ textAlign: 'left', padding: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <MonitorSmartphone size={18} color={C.sky} style={{ marginBottom: 8 }} />
            <div>{d}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Driver · install one-click</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Updates / Licensing / Usage / Developer ────────────────────────────────
function UpdatesView({ engines, onPreview, onInstall, installed }: { engines: Engine[]; onPreview: (e: Engine) => void; onInstall: (e: Engine) => void; installed: Set<string> }) {
  const pending = engines.filter(e => e.status === 'update' && !installed.has(e.name));
  return (
    <div className="mp-fade">
      <SectionTitle title="Updates" sub="The hospital never manually searches — AMEXAN surfaces every available update." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pending.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '16px 0' }}>All engines up to date.</div>}
        {pending.map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.card, border: `1px solid ${C.amber}55`, borderRadius: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${e.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{e.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{e.name} <span style={{ color: C.amber, background: `${C.amber}14`, padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 800 }}>Update Available · v{e.version}</span></div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{e.releases && e.releases.length > 0 ? e.releases[0].note : 'Security & stability improvements'}</div>
            </div>
            <button onClick={() => onPreview(e)} style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 11, padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>Release Notes</button>
            <button onClick={() => onInstall(e)} style={{ border: 'none', background: C.amber, color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>Install Update</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LicensingView({ engines }: { engines: Engine[] }) {
  const licensed = ['ICU', 'NICU', 'Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'Telemedicine', 'Research'];
  return (
    <div className="mp-fade">
      <SectionTitle title="Licensing" sub="Capability entitlements allocated to this facility." />
      <div style={{ padding: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Licensed engines</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Every license maps to a constitutional engine.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.purple }}>12</div>
            <div style={{ fontSize: 10, color: C.muted }}>Remaining licenses</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 8, marginTop: 14 }}>
          {licensed.map(l => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: '#f8fafc', borderRadius: 8, fontSize: 11, fontWeight: 600 }}><KeyRound size={13} color={C.purple} /> {l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageAnalyticsView({ engines }: { engines: Engine[] }) {
  const used = engines.filter(e => e.rate).sort((a, b) => (b.rate || 0) - (a.rate || 0));
  const max = Math.max(...used.map(u => u.rate || 0), 1);
  return (
    <div className="mp-fade">
      <SectionTitle title="Usage Analytics" sub="See which engines your clinicians actually use — and retire the unused." />
      <div style={{ padding: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
        {used.map(u => (
          <div key={u.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{u.icon} {u.name}</span><span style={{ color: C.muted }}>{u.rate} daily users</span>
            </div>
            <div style={{ height: 8, background: '#eef2f7', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${((u.rate || 0) / max) * 100}%`, height: '100%', background: `linear-gradient(90deg,${C.sky},${C.indigo})`, borderRadius: 6 }} />
            </div>
          </div>
        ))}
        <button style={{ marginTop: 8, padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.red}44`, background: '#fff', color: C.red, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Retire unused engines</button>
      </div>
    </div>
  );
}

function DeveloperStore() {
  const catalog = [
    { icon: '🧮', name: 'Clinical Calculators', by: 'AMEXAN Labs' },
    { icon: '🧠', name: 'AI Packs', by: 'AMEXAN Labs' },
    { icon: '📝', name: 'Research Forms', by: 'Partner' },
    { icon: '🎓', name: 'Teaching Modules', by: 'University' },
    { icon: '📐', name: 'National Guidelines', by: 'MOH' },
    { icon: '📋', name: 'Protocols', by: 'AMEXAN Labs' },
    { icon: '📊', name: 'Dashboards', by: 'Partner' },
    { icon: '🔀', name: 'Integrations', by: 'AMEXAN Labs' },
  ];
  return (
    <div className="mp-fade">
      <SectionTitle title="Developer & Partner Marketplace" sub="Hospitals, universities, researchers and partners publish — everything reviewed by AMEXAN." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10 }}>
        {catalog.map(c => (
          <div key={c.name} style={{ padding: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: C.muted, margin: '2px 0 10px' }}>by {c.by}</div>
            <div style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓ Reviewed by AMEXAN</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Preview drawer ─────────────────────────────────────────────────────────
function PreviewDrawer({ engine, onClose, onInstall, onOpenByName, installed }: { engine: Engine; onClose: () => void; onInstall: (e: Engine) => void; onOpenByName: (name: string) => void; installed: Set<string> }) {
  const e = engine;
  const isInstalled = e.status === 'installed' || installed.has(e.name);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,43,77,.45)', zIndex: 50, display: 'flex' }}>
      <div onClick={onClose} style={{ flex: 1 }} />
      <div className="mp-fade" style={{ width: 540, maxWidth: '100%', height: '100vh', background: C.bg, boxShadow: '-12px 0 40px rgba(0,0,0,.2)', overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: `${e.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{e.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{e.name} Engine</h2>
              <StatusBadge status={e.status} />
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{e.tagline}</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.slate, padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Meta label="Version" value={`v${e.version}`} />
          <Meta label="Category" value={e.category} />
          <Meta label="Install Size" value={e.size || '—'} />
          <Meta label="Dependencies" value={e.dependencies && e.dependencies.length > 0 ? String(e.dependencies.length) : 'None'} />
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <Flag ok={e.digitalTwin} label="Digital Twin" />
          <Flag ok={e.clinicalIntelligence} label="Clinical Intelligence" />
          <Flag ok={e.fhir} label="FHIR" />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Features unlocked</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {e.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.slate }}><CheckCircle size={13} color={C.green} style={{ flexShrink: 0 }} /> {f}</div>
            ))}
          </div>
        </div>

        {(e.roles && e.roles.length > 0) && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Supported roles</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {e.roles.map(r => <Pill key={r} label={r} />)}
            </div>
          </div>
        )}

        {(e.kpis && e.kpis.length > 0) && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>KPIs unlocked</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {e.kpis.map(k => <span key={k} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, background: `${C.sky}10`, color: C.sky, fontWeight: 700 }}>{k}</span>)}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Dependencies</div>
          {e.dependencies && e.dependencies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {e.dependencies.map(d => (
                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <CheckCircle size={13} color={C.green} /> {d} <span style={{ marginLeft: 'auto', color: C.green, fontSize: 10, fontWeight: 700 }}>Ready</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: C.muted }}>Standalone engine — no dependencies.</div>
          )}
        </div>

        {(e.recommended && e.recommended.length > 0) && (
          <div style={{ padding: 12, borderRadius: 12, background: `${C.indigo}0f`, border: `1px solid ${C.indigo}33` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.indigo, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Sparkles size={14} /> Recommended alongside</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {e.recommended.map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{r}</span>
                  <button onClick={() => onOpenByName(r)} style={{ border: 'none', background: C.indigo, color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>Install</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8, paddingTop: 4 }}>
          <button onClick={() => onInstall(e)} disabled={isInstalled} style={{ flex: 1, border: 'none', background: isInstalled ? C.green : e.status === 'update' ? C.amber : C.sky, color: '#fff', fontSize: 12, fontWeight: 700, padding: '12px 0', borderRadius: 10, cursor: isInstalled ? 'default' : 'pointer' }}>
            {isInstalled ? 'Installed ✓' : e.status === 'update' ? 'Install Update' : 'Install'}
          </button>
          <button style={{ padding: '0 18px', border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 12, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>Documentation</button>
        </div>
      </div>
    </div>
  );
}

// ── Install wizard ─────────────────────────────────────────────────────────
function InstallWizard({ engine, onClose, onFinish, onOpenByName, installed }: { engine: Engine; onClose: () => void; onFinish: (name: string) => void; onOpenByName: (name: string) => void; installed: Set<string> }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const e = engine;
  const deps = e.dependencies && e.dependencies.length > 0 ? e.dependencies : [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,43,77,.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="mp-fade" style={{ width: 480, maxWidth: '100%', background: C.card, borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 18, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: `${e.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{e.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Install {e.name} Engine</div>
            <div style={{ fontSize: 11, color: C.muted }}>AMEXAN resolves dependencies before anything is touched.</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.slate }}><X size={18} /></button>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 320 }}>
          {/* stepper */}
          <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.muted }}>
            {['Resolve', 'Review', 'Install'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: step === i ? C.sky : step > i ? C.green : '#eef2f7', color: step === i || step > i ? '#fff' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{step > i ? '✓' : i + 1}</span>
                {s}
                {i < 2 && <span style={{ color: C.muted }}>→</span>}
              </div>
            ))}
          </div>

          {step === 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Meta label="Install Size" value={e.size || '—'} />
                <Meta label="Dependencies" value={String(deps.length)} />
                <Meta label="Setup Time" value={deps.length > 0 ? '18 sec' : '12 sec'} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>Dependency resolution</div>
              {deps.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.green, background: `${C.green}0f`, padding: 12, borderRadius: 10 }}><CheckCircle size={16} /> All dependencies satisfied on this OS</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {deps.map(d => <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}><CheckCircle size={14} color={C.green} /> {d} <span style={{ marginLeft: 'auto', color: C.green, fontSize: 10, fontWeight: 700 }}>Ready</span></div>)}
                </div>
              )}
              {(e.recommended && e.recommended.length > 0) && (
                <div style={{ padding: 12, borderRadius: 10, background: `${C.green}0f`, border: `1px solid ${C.green}22` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Sparkles size={13} /> Recommended</div>
                  {e.recommended.slice(0, 3).map(r => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, padding: '4px 0' }}>
                      <span>{r}</span>
                      <button onClick={() => onOpenByName(r)} style={{ border: 'none', background: C.green, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>Install</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Everything checked out. Ready to provision.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Workflows', 'Dashboards', 'Clinical Intelligence', 'Analytics', 'Permissions', 'Documentation templates', 'Digital Twin components', 'API surface'].map(fd => (
                  <div key={fd} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}><CheckCircle size={14} color={C.green} /> Provision {fd}</div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>Rollback supported — the core OS is never modified.</div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0' }}>
              <Loader2 size={44} color={C.sky} className="mp-spin" />
              <div style={{ fontSize: 14, fontWeight: 800 }}>Provisioning {e.name}…</div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>Composing workflows, dashboards, intelligence & APIs across the AMEXAN ecosystem.</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
            {step === 0 && (
              <>
                <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Verify & Continue</button>
              </>
            )}
            {step === 1 && (
              <>
                <button onClick={() => setStep(0)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 12, cursor: 'pointer' }}>Back</button>
                <button onClick={() => { setStep(2); setTimeout(() => { onFinish(e.name); onClose(); }, 2000); }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: C.green, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Install — {e.size || 'one click'}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
