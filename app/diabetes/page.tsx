'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, Eye, Brain, type LucideIcon, Zap, Home, Globe, Baby, Apple, Target, BarChart3, Sliders, LineChart, ClipboardList, Hospital, Download, Printer, RefreshCw } from 'lucide-react'
import { C } from '@/lib/colors';

const S = {
  page: { minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' as const },
  topBar: { height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 },
  logoText: { fontSize: 14, fontWeight: 700, color: C.navy },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftNav: { width: 220, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' as const, padding: '12px 8px', gap: 1, flexShrink: 0, overflow: 'auto' },
  navItem: (a: boolean) => ({ padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: a ? 600 : 400, color: a ? C.sky : C.text, background: a ? C.skyLight : 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const }),
  main: { flex: 1, overflow: 'auto', padding: 20 },
  card: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  cardH: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.1s' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  label: { fontSize: 11, fontWeight: 500, color: C.text, marginBottom: 4, display: 'block' },
  input: { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.panel, outline: 'none', fontFamily: "'Inter', sans-serif" } as any,
  sel: { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.panel, outline: 'none', fontFamily: "'Inter', sans-serif", cursor: 'pointer' },
  btn: (c: string) => ({ padding: '8px 20px', borderRadius: 8, border: 'none', background: c, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }),
  btnO: { padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  badge: (c: string) => ({ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  pill: (c: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  secTitle: { fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 },
  divider: { height: 1, background: C.border, margin: '16px 0' },
  statCard: { textAlign: 'center' as const, padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12 },
  statValue: { fontSize: 28, fontWeight: 700, color: C.navy, marginTop: 8 },
  statLabel: { fontSize: 11, color: C.textLight, marginTop: 4 },
}

const statusColor = (s: string) => {
  switch (s) {
    case 'Active': case 'Complete': case 'Controlled': case 'On Track': case 'Available': case 'Good': case 'Functioning': case 'Completed': return C.green
    case 'Resolved': case 'Excellent': case 'Stable': case 'Achieved': return C.green
    case 'Fair': case 'Pending': case 'Needs Attention': case 'Moderate': case 'Busy': case 'Low': case 'Mild': case 'Improving': case 'Partially Controlled': return C.amber
    case 'Poor': case 'Behind': case 'Critical': case 'Uncontrolled': case 'High': case 'Severe': case 'Unavailable': case 'Declining': case 'High Risk': return C.red
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Disease Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Disease Snapshot', icon: Eye },
  { id: 'timeline', label: 'Disease Timeline', icon: Clock },
  { id: 'state', label: 'Disease State Engine', icon: Sliders },
  { id: 'phenotype', label: 'Phenotype Engine', icon: Brain },
  { id: 'problems', label: 'Problem List', icon: ClipboardList },
  { id: 'glycaemic', label: 'Glycaemic Control', icon: TrendingUp },
  { id: 'cgm', label: 'CGM Intelligence', icon: LineChart },
  { id: 'medications', label: 'Medication Intelligence', icon: Pill },
  { id: 'lifestyle', label: 'Lifestyle Intelligence', icon: Apple },
  { id: 'goals', label: 'Goal Engine', icon: Target },
  { id: 'complications', label: 'Complication Centers', icon: AlertTriangle },
  { id: 'foot', label: 'Foot Center', icon: Zap },
  { id: 'annual', label: 'Annual Review', icon: Calendar },
  { id: 'risk', label: 'Risk Prediction', icon: BarChart3 },
  { id: 'hospitalization', label: 'Hospitalization Intelligence', icon: Hospital },
  { id: 'pregnancy', label: 'Pregnancy Module', icon: Baby },
  { id: 'portal', label: 'Patient Portal', icon: Globe },
  { id: 'devices', label: 'Home Device Integration', icon: Home },
  { id: 'team', label: 'Multidisciplinary Team', icon: Users },
  { id: 'registry', label: 'Registry', icon: FileText },
  { id: 'quality', label: 'Quality Indicators', icon: BarChart3 },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Nurse Workspace', href: '/nurse' },
  { label: 'Doctor Workspace', href: '/doctor' },
  { label: 'Lab Workspace', href: '/laboratory' },
  { label: 'Pharmacy', href: '/pharmacy' },
  { label: 'Radiology', href: '/radiology' },
  { label: 'Theatre', href: '/theatre' },
  { label: 'ICU', href: '/icu' },
  { label: 'Emergency', href: '/emergency' },
  { label: 'CKD', href: '/ckd' },
  { label: 'Hypertension', href: '/hypertension' },
  { label: 'HF', href: '/hf' },
  { label: 'Respiratory', href: '/respiratory' },
  { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Oncology', href: '/oncology' },
  { label: 'Neurology', href: '/neurology' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

export default function DiabetesWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Diabetes Intelligence Center &mdash; Volume XI-A</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>DM</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Diabetes Intelligence</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id} style={S.navItem(tab === item.id)} onClick={() => setTab(item.id)}>
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase', marginTop: 8 }}>Other Workspaces</div>
          {WORKSPACE_LINKS.map(w => (
            <a key={w.label} href={w.href} style={{ ...S.navItem(false), textDecoration: 'none', fontSize: 11 }}>
              <span style={{ fontSize: 12, flexShrink: 0 }}>▸</span>
              {w.label}
            </a>
          ))}
        </nav>

        <main style={S.main}>

          {/* ─── DASHBOARD ─── */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Diabetes Intelligence Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Volume XI-A &mdash; Diabetes Mellitus, Glycaemic Control &amp; Metabolic Intelligence</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.red)}>12 High Risk</span>
                  <span style={S.pill(C.amber)}>28 Partially Controlled</span>
                  <span style={S.pill(C.green)}>56 Controlled</span>
                  <span style={S.pill(C.sky)}>142 Enrolled</span>
                </div>
              </div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.sky}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>James Mwangi / 48 Years / Male / Type 2 Diabetes</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Duration: 12 Years · Current State: Partially Controlled · Risk: High · Last Review: 2 Weeks Ago</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.amber)}>Partially Controlled</span>
                    <span style={S.badge(C.red)}>High Risk</span>
                  </div>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'Total Diabetes Patients', value: '142', icon: Users, color: C.sky },
                  { label: 'Mean HbA1c', value: '7.4%', icon: Activity, color: C.amber },
                  { label: 'TIR >70%', value: '58%', icon: LineChart, color: C.green },
                  { label: 'Poor Control (>9%)', value: '12.8%', icon: AlertTriangle, color: C.red },
                  { label: 'Retinal Screen (annual)', value: '72%', icon: Eye, color: C.amber },
                  { label: 'Foot Exam (annual)', value: '58%', icon: Zap, color: C.amber },
                  { label: 'Hospitalizations (30d)', value: '8', icon: Hospital, color: C.amber },
                  { label: 'Mortality (1yr)', value: '3', icon: Heart, color: C.red },
                ].map(s => (
                  <div key={s.label} style={S.statCard}>
                    <s.icon size={20} color={s.color} />
                    <div style={S.statValue}>{s.value}</div>
                    <div style={S.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Alerts</div>
                <div style={S.grid2}>
                  {[
                    { title: 'HbA1c Above Target', patient: 'James Mwangi', detail: 'HbA1c 7.8% — goal <7%, consider therapy intensification', color: C.amber },
                    { title: 'Hypoglycaemia Alert', patient: 'James Mwangi', detail: '2 episodes this month BG <70 mg/dL, review insulin dose', color: C.red },
                    { title: 'Missed Eye Screening', patient: 'James Mwangi', detail: 'Annual retinal exam overdue by 3 months', color: C.amber },
                    { title: 'Weight Gain Trend', patient: 'James Mwangi', detail: '+2.1 kg in 3 months, BMI increasing to 28', color: C.amber },
                  ].map(a => (
                    <div key={a.title} style={{ padding: '10px 14px', borderRadius: 8, background: `${a.color}08`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AlertTriangle size={18} color={a.color} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{a.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{a.patient} — {a.detail}</div>
                      </div>
                      <button style={S.btn(a.color)}>Review</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Quick Actions</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Diabetes Assessment</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Medication Review</button>
                  <button style={S.btn(C.purple)}><Eye size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Schedule Eye Exam</button>
                  <button style={S.btnO}><Search size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Patient Search</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.green}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>James Mwangi / 48 / M</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Type 2 Diabetes · Duration: 12 Years · Partially Controlled · Risk: High</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.amber)}>Partially Controlled</span>
                    <span style={S.badge(C.red)}>High Risk</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Disease Snapshot</div>
              <div style={S.grid4}>
                {[
                  { label: 'HbA1c', value: '7.8%', goal: 'Goal <7%', color: C.amber },
                  { label: 'TIR', value: '68%', goal: 'Goal >70%', color: C.amber },
                  { label: 'Average Glucose', value: '154 mg/dL', goal: 'Goal <140', color: C.amber },
                  { label: 'Blood Pressure', value: '128/78', goal: 'Goal <130/80', color: C.green },
                  { label: 'BMI', value: '28', goal: 'Goal <25', color: C.amber },
                  { label: 'Weight', value: '84 kg', goal: 'Target 79 kg', color: C.amber },
                  { label: 'LDL', value: '1.8 mmol/L', goal: 'Goal <1.4', color: C.amber },
                  { label: 'eGFR', value: '72 mL/min', goal: 'Goal >60', color: C.green },
                  { label: 'Albuminuria', value: 'Negative', goal: 'Normal', color: C.green },
                ].map(m => (
                  <div key={m.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${m.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{m.value}</div>
                    <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>{m.goal}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginTop: 6 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TIMELINE ─── */}
          {tab === 'timeline' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Disease Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { year: '2014', title: 'Prediabetes', desc: 'Impaired fasting glucose detected, HbA1c 6.0%, lifestyle counselling initiated', icon: AlertTriangle, color: C.amber },
                  { year: '2015', title: 'Diagnosed → Lifestyle → Metformin', desc: 'Type 2 Diabetes diagnosed, HbA1c 7.2%, metformin started, lifestyle modification', icon: Activity, color: C.sky },
                  { year: '2016', title: 'HbA1c 6.8 — Well Controlled', desc: 'Good glycaemic response to metformin, HbA1c improved to 6.8%, weight stable', icon: CheckCircle, color: C.green },
                  { year: '2019', title: 'Sulfonylurea Added', desc: 'Secondary failure on metformin alone, HbA1c 7.8%, gliclazide added', icon: Pill, color: C.amber },
                  { year: '2022', title: 'Insulin Started', desc: 'Progressive beta-cell decline, HbA1c 8.5%, basal insulin glargine initiated', icon: Syringe, color: C.amber },
                  { year: '2024', title: 'Retinopathy Detected', desc: 'Background diabetic retinopathy on screening, annual monitoring initiated', icon: Eye, color: C.amber },
                  { year: '2025', title: 'GLP-1 Started', desc: 'Semaglutide added for glycaemic control and weight loss, 8 kg weight reduction', icon: Pill, color: C.green },
                  { year: '2026', title: 'HbA1c Improved', desc: 'HbA1c improved from 8.1% to 7.8% on GLP-1 + insulin + metformin combination', icon: TrendingUp, color: C.green },
                ].map((e, i) => (
                  <div key={e.year} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${e.color}15`, border: `2px solid ${e.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <e.icon size={14} color={e.color} />
                      </div>
                      {i < 7 && <div style={{ width: 2, height: '100%', background: C.border, flex: 1 }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: e.color }}>{e.year}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{e.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Add Event</div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Year</label>
                    <input style={S.input} placeholder="e.g. 2026" />
                  </div>
                  <div>
                    <label style={S.label}>Event Type</label>
                    <select style={S.sel}>
                      <option>Diagnosis</option>
                      <option>Medication Change</option>
                      <option>Complication</option>
                      <option>Hospitalization</option>
                      <option>Screening</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={S.label}>Description</label>
                    <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Describe the event..." />
                  </div>
                  <div>
                    <button style={S.btn(C.sky)}>Add to Timeline</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STATE ─── */}
          {tab === 'state' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Disease State Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Disease States</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { stage: 'Prediabetes', label: 'Impaired glucose tolerance', active: false },
                      { stage: 'New Diagnosis', label: '<1 year since diagnosis', active: false },
                      { stage: 'Controlled', label: 'HbA1c <7%, no complications', active: false },
                      { stage: 'Partially Controlled', label: 'HbA1c 7-8%, early complications', active: true },
                      { stage: 'Poor Control', label: 'HbA1c >8%, complications emerging', active: false },
                      { stage: 'Complicated', label: 'Multiple complications, organ involvement', active: false },
                      { stage: 'Advanced Diabetes', label: 'End-organ damage, complex care needs', active: false },
                      { stage: 'End Organ Disease', label: 'ESRD, blindness, amputation, severe CVD', active: false },
                    ].map(g => (
                      <div key={g.stage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: g.active ? `${C.sky}10` : C.panel, border: g.active ? `1px solid ${C.sky}30` : 'none' }}>
                        <span style={{ width: 120, height: 24, borderRadius: 4, background: g.active ? C.sky : C.border, color: g.active ? C.white : C.textLight, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{g.stage}</span>
                        <span style={{ flex: 1, fontSize: 11, color: C.textLight }}>{g.label}</span>
                        {g.active && <span style={S.pill(C.sky)}>Active</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>State Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}25` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Partially Controlled</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Type 2 diabetes with 12-year duration. HbA1c 7.8% above target. Background retinopathy present. Early insulin resistance and obesity. No renal involvement. Requires therapy intensification for glycaemic optimisation.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Update State</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Current State</label>
                      <select style={S.sel}><option>Partially Controlled</option><option>Controlled</option><option>Poor Control</option><option>Complicated</option><option>Advanced</option></select>
                    </div>
                    <button style={S.btn(C.sky)}>Update State</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PHENOTYPE ─── */}
          {tab === 'phenotype' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Phenotype Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Obese', status: true, note: 'Confirmed' },
                      { label: 'Insulin Resistant', status: 'Likely', note: 'Likely' },
                      { label: 'High Cardiovascular Risk', status: 'Yes', note: 'Yes' },
                      { label: 'CKD', status: false, note: 'No' },
                      { label: 'Retinopathy', status: 'Mild', note: 'Mild' },
                      { label: 'Neuropathy', status: false, note: 'Absent' },
                      { label: 'Frailty', status: false, note: 'No' },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${p.status === true || p.status === 'Yes' || p.status === 'Mild' ? C.sky : p.status === 'Likely' ? C.amber : C.border}`, background: p.status === true || p.status === 'Yes' || p.status === 'Mild' ? C.sky : p.status === 'Likely' ? C.amber : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(p.status === true || p.status === 'Yes' || p.status === 'Mild') && <CheckCircle size={12} color={C.white} />}
                          {p.status === 'Likely' && <span style={{ color: C.white, fontSize: 8 }}>?</span>}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.navy }}>{p.label}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: typeof p.status === 'string' ? p.status === 'Yes' || p.status === 'Likely' || p.status === 'Mild' ? C.sky : C.green : p.status ? C.green : C.textLight }}>{typeof p.status === 'string' ? p.status : p.status ? 'Yes' : 'No'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Obese T2D with Insulin Resistance</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Middle-aged male with obesity (BMI 28), likely insulin resistant, high cardiovascular risk. Mild background retinopathy. No neuropathy or frailty. Suitable for GLP-1 receptor agonist therapy with metformin and insulin.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Update Phenotype</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>Primary Phenotype</label>
                        <select style={S.sel}><option>Obese T2D</option><option>Lean T2D</option><option>Elderly T2D</option><option>LADA</option></select>
                      </div>
                      <div>
                        <label style={S.label}>Subtype</label>
                        <select style={S.sel}><option>Insulin Resistant</option><option>Beta-cell Failure</option><option>Mixed</option></select>
                      </div>
                    </div>
                    <button style={S.btn(C.sky)}>Update Classification</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PROBLEMS ─── */}
          {tab === 'problems' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Problem List</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Problems</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { prob: 'Type 2 Diabetes', status: 'Active', color: C.amber },
                      { prob: 'Hypertension', status: 'Active', color: C.amber },
                      { prob: 'Obesity (BMI 28)', status: 'Active', color: C.amber },
                      { prob: 'Dyslipidaemia', status: 'Active', color: C.amber },
                      { prob: 'Background Retinopathy', status: 'Active', color: C.amber },
                    ].map(p => (
                      <div key={p.prob} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <AlertTriangle size={14} color={p.color} />
                        <span style={{ flex: 1, fontSize: 12, color: C.navy }}>{p.prob}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Resolved Problems</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { prob: 'Hyperosmolar Crisis (2023)', status: 'Resolved', color: C.green },
                    ].map(p => (
                      <div key={p.prob} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <CheckCircle size={14} color={p.color} />
                        <span style={{ flex: 1, fontSize: 12, color: C.navy }}>{p.prob}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── GLYCAEMIC ─── */}
          {tab === 'glycaemic' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Glycaemic Control</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Glycaemic metrics for James Mwangi — 12-year Type 2 Diabetes</div>
              <div style={S.grid4}>
                {[
                  { label: 'HbA1c', value: '7.8%', sub: 'Goal <7%', color: C.amber },
                  { label: 'TIR 70-180', value: '68%', sub: 'Goal >70%', color: C.amber },
                  { label: 'TBR <70', value: '4%', sub: 'Goal <4%', color: C.green },
                  { label: 'TAR >180', value: '28%', sub: 'Goal <25%', color: C.amber },
                  { label: 'Glucose Variability', value: 'CV 32%', sub: 'Goal <36%', color: C.green },
                  { label: 'Fasting Glucose', value: '142 mg/dL', sub: 'Goal <130', color: C.amber },
                  { label: 'Post-Prandial', value: '178 mg/dL', sub: 'Goal <160', color: C.amber },
                  { label: 'Average Glucose', value: '154 mg/dL', sub: 'eAG', color: C.amber },
                ].map(m => (
                  <div key={m.label} style={S.statCard}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{m.label}</div>
                    <div style={S.statValue}>{m.value}</div>
                    <div style={S.statLabel}>{m.sub}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, margin: '6px auto 0' }} />
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>HbA1c Trend (Last 4 Readings)</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, padding: '12px 8px' }}>
                    {[
                      { val: 8.1, date: 'Jan 2026', color: C.red },
                      { val: 7.9, date: 'Mar 2026', color: C.amber },
                      { val: 8.0, date: 'May 2026', color: C.amber },
                      { val: 7.8, date: 'Jul 2026', color: C.amber },
                    ].map(p => {
                      const h = (p.val / 10) * 130
                      return (
                        <div key={p.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.val}%</div>
                          <div style={{ width: '60%', height: h, borderRadius: '6px 6px 0 0', background: p.color, marginTop: 4, opacity: 0.8 }} />
                          <div style={{ fontSize: 9, color: C.textLight, marginTop: 6 }}>{p.date}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: C.textLight }}>HbA1c declining — improving glycaemic control</div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Glycaemic Events (Last 30 Days)</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      {[
                        { label: 'Hypoglycaemia Episodes (<70)', value: '4 episodes', color: C.amber },
                        { label: 'Severe Hypoglycaemia (<54)', value: '1 episode', color: C.red },
                        { label: 'Hyperglycaemia Episodes (>250)', value: '8 episodes', color: C.amber },
                        { label: 'DKA Events', value: '0', color: C.green },
                        { label: 'Nocturnal Hypoglycaemia', value: '2 episodes', color: C.amber },
                        { label: 'CGM Active Days', value: '28/30 (93%)', color: C.green },
                      ].map(r => (
                        <tr key={r.label} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 4px', color: C.text }}>{r.label}</td>
                          <td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: r.color }}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── CGM ─── */}
          {tab === 'cgm' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>CGM Intelligence</div>
              <div style={S.grid4}>
                {[
                  { label: 'TIR 70-180 mg/dL', value: '68%', color: C.amber },
                  { label: 'TBR <70 mg/dL', value: '4%', color: C.amber },
                  { label: 'TAR >180 mg/dL', value: '28%', color: C.amber },
                  { label: 'GMI', value: '7.2%', color: C.amber },
                  { label: 'Glucose Variability (CV)', value: '32%', color: C.green },
                  { label: 'Sensor Usage', value: '93%', color: C.green },
                ].map(m => (
                  <div key={m.label} style={S.statCard}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{m.label}</div>
                    <div style={S.statValue}>{m.value}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, margin: '6px auto 0' }} />
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Daily Glucose Profiles</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { time: '00:00-06:00 (Overnight)', bg: '95 mg/dL', flag: 'Normal', color: C.green },
                      { time: '06:00-08:00 (Fasting)', bg: '142 mg/dL', flag: 'Elevated', color: C.amber },
                      { time: '08:00-10:00 (Post-Breakfast)', bg: '178 mg/dL', flag: 'High', color: C.amber },
                      { time: '10:00-12:00 (Pre-Lunch)', bg: '125 mg/dL', flag: 'Normal', color: C.green },
                      { time: '12:00-14:00 (Post-Lunch)', bg: '192 mg/dL', flag: 'High', color: C.amber },
                      { time: '14:00-18:00 (Afternoon)', bg: '138 mg/dL', flag: 'Normal', color: C.green },
                      { time: '18:00-20:00 (Post-Dinner)', bg: '185 mg/dL', flag: 'High', color: C.amber },
                      { time: '20:00-00:00 (Evening)', bg: '156 mg/dL', flag: 'Elevated', color: C.amber },
                    ].map(p => (
                      <div key={p.time} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ width: 150, fontSize: 10, color: C.textLight }}>{p.time}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.navy }}>{p.bg}</span>
                        <span style={S.pill(p.color)}>{p.flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>CGM Summary</div>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20`, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Overnight Hypoglycaemia</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>2 episodes this week — BG 58 and 62 mg/dL, consider reducing evening insulin</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Meal-Related Excursions</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Post-prandial spikes {'>'}180 after lunch and dinner — consider prandial insulin adjustment</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.sky}08`, border: `1px solid ${C.sky}20` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Latest AGP Report</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Ambulatory Glucose Profile available — Download PDF report</div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 10, color: C.textLight }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Device:</span><span style={{ color: C.navy }}>Dexcom G7</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Sensor Inserted:</span><span style={{ color: C.navy }}>2026-07-01</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Days Remaining:</span><span style={{ color: C.navy }}>8 days</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MEDICATIONS ─── */}
          {tab === 'medications' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Medication Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Diabetes Medications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { drug: 'Metformin', dose: '1000 mg BID', class: 'Biguanide', started: '2015', adherence: '92%', color: C.green },
                      { drug: 'Insulin Glargine', dose: '24 U daily', class: 'Basal Insulin', started: '2022', adherence: '88%', color: C.green },
                      { drug: 'Semaglutide', dose: '1 mg weekly', class: 'GLP-1 Agonist', started: '2025', adherence: '95%', color: C.green },
                    ].map(m => (
                      <div key={m.drug} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 6, padding: '6px 8px', borderRadius: 6, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{m.drug}</span>
                        <span style={{ color: C.text }}>{m.dose}</span>
                        <span style={S.pill(m.color)}>{m.class}</span>
                        <span style={{ color: C.textLight }}>Started {m.started}</span>
                        <span style={S.pill(parseInt(m.adherence) >= 90 ? C.green : C.amber)}>{m.adherence}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.sky}08`, border: `1px solid ${C.sky}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Metformin</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Indication: Initial therapy · Started 2015 · Still active · No side effects · eGFR adequate</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Insulin Glargine</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Indication: Progressive beta-cell failure · Started 2022 · 24 Units at bedtime · Dose history: 20U → 24U</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Semaglutide</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Indication: Glycaemic + weight management · Started 2025 · Weight loss 8 kg · HbA1c improved by 0.6%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication History</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Medication</th>
                      <th style={{ textAlign: 'center', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Indication</th>
                      <th style={{ textAlign: 'center', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Dose History</th>
                      <th style={{ textAlign: 'center', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Effectiveness</th>
                      <th style={{ textAlign: 'center', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Side Effects</th>
                      <th style={{ textAlign: 'center', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { m: 'Gliclazide', ind: 'Add-on therapy', dose: '80 mg BID → D/C', eff: 'Moderate', se: 'Weight gain', status: 'Discontinued' },
                      { m: 'Metformin', ind: 'Initial therapy', dose: '500 → 1000 mg BID', eff: 'Good', se: 'None', status: 'Active' },
                      { m: 'Insulin Glargine', ind: 'Beta-cell failure', dose: '20 → 24 U', eff: 'Good', se: 'Hypoglycaemia', status: 'Active' },
                      { m: 'Semaglutide', ind: 'HbA1c + weight', dose: '0.5 → 1 mg weekly', eff: 'Excellent', se: 'Mild nausea', status: 'Active' },
                    ].map(r => (
                      <tr key={r.m} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.m}</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}>{r.ind}</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}>{r.dose}</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}>{r.eff}</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}>{r.se}</td>
                        <td style={{ textAlign: 'center', padding: '6px 4px' }}><span style={S.badge(r.status === 'Active' ? C.green : C.textLight)}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── LIFESTYLE ─── */}
          {tab === 'lifestyle' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Lifestyle Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Nutrition</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Meal Pattern', value: '3 meals + 1 snack', status: 'Regular', color: C.green },
                      { label: 'Carb Intake', value: '~200 g/day', status: 'Moderate', color: C.amber },
                      { label: 'Sugary Drinks', value: '1-2/week', status: 'Occasional', color: C.amber },
                      { label: 'Alcohol', value: '2-3 units/week', status: 'Within limits', color: C.green },
                    ].map(n => (
                      <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{n.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{n.value}</div>
                        </div>
                        <span style={S.badge(n.color)}>{n.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Physical Activity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Minutes/Week', value: '120 min', status: 'Below target', color: C.amber },
                      { label: 'Resistance Training', value: '1x/week', status: 'Insufficient', color: C.amber },
                      { label: 'Walking', value: '3,200 steps/day', status: 'Low', color: C.amber },
                      { label: 'Sedentary Time', value: '8-10 hrs/day', status: 'High', color: C.amber },
                    ].map(a => (
                      <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{a.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{a.value}</div>
                        </div>
                        <span style={S.badge(a.color)}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Sleep & Psychosocial</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Sleep Hours', value: '6.5 hrs/night', status: 'Below target', color: C.amber },
                      { label: 'Sleep Quality', value: 'Fair', status: 'Improving', color: C.amber },
                      { label: 'Apnea Screening', value: 'Not done', status: 'Due', color: C.amber },
                      { label: 'Stress Level', value: 'Moderate', status: 'Work-related', color: C.amber },
                      { label: 'Depression Screen (PHQ-9)', value: 'Score 8', status: 'Mild', color: C.amber },
                      { label: 'Health Literacy', value: 'Adequate', status: 'Good', color: C.green },
                      { label: 'Financial Barriers', value: 'None reported', status: 'Good', color: C.green },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{s.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{s.value}</div>
                        </div>
                        <span style={S.badge(s.color)}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Smoking & Substance Use</div>
                <div style={S.grid2}>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Smoking Status</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Non-smoker · 0 pack-years · No quit attempts needed</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Alcohol Use</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>2-3 units/week · Social drinking · No binge drinking · AUDIT-C score: 2 (low risk)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── GOALS ─── */}
          {tab === 'goals' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Goal Engine</div>
              <div style={S.grid4}>
                {[
                  { goal: 'HbA1c <7%', progress: 80, current: '7.8% → 7.0%', color: C.amber },
                  { goal: 'Lose 5 kg', progress: 76, current: '3.8/5.0 kg', color: C.amber },
                  { goal: 'Walk 150 min/week', progress: 80, current: '120/150 min', color: C.amber },
                  { goal: 'Stop Smoking', progress: 100, current: 'Completed', color: C.green },
                ].map(g => (
                  <div key={g.goal} style={S.statCard}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>{g.goal}</div>
                    <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ width: `${g.progress}%`, height: '100%', background: g.progress >= 90 ? C.green : g.progress >= 70 ? C.amber : C.red, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight }}>{g.current}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: g.progress >= 90 ? C.green : C.amber }}>{g.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── COMPLICATIONS ─── */}
          {tab === 'complications' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Complication Centers</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Eye (XI-A1)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { l: 'Retinal Screening', v: 'Background retinopathy — Mild NPDR', c: C.amber },
                      { l: 'Fundus Photos', v: 'Microaneurysms, hard exudates', c: C.amber },
                      { l: 'OCT', v: 'Normal macular thickness', c: C.green },
                      { l: 'Laser Treatment', v: 'Not required', c: C.green },
                      { l: 'Visual Acuity', v: '6/9 (R), 6/12 (L)', c: C.green },
                    ].map(e => (
                      <div key={e.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ width: 100, fontWeight: 600, color: C.navy }}>{e.l}</span>
                        <span style={{ flex: 1, color: C.text }}>{e.v}</span>
                        {e.c && <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.c }} />}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Kidney (XI-A2)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { l: 'eGFR Trend', v: '72 mL/min — Stable', c: C.green },
                      { l: 'Albuminuria', v: 'Negative (ACR <30)', c: C.green },
                      { l: 'Electrolytes', v: 'Normal', c: C.green },
                      { l: 'Nephrology Referrals', v: 'Not required', c: C.green },
                      { l: 'Dialysis Planning', v: 'Not indicated', c: C.green },
                    ].map(k => (
                      <div key={k.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ width: 100, fontWeight: 600, color: C.navy }}>{k.l}</span>
                        <span style={{ flex: 1, color: C.text }}>{k.v}</span>
                        {k.c && <span style={{ width: 8, height: 8, borderRadius: '50%', background: k.c }} />}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Neuropathy (XI-A3)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { l: 'Monofilament', v: 'Normal (10/10)', c: C.green },
                      { l: 'Vibration Sense', v: 'Normal (128 Hz)', c: C.green },
                      { l: 'Pain Scores', v: 'No neuropathic pain', c: C.green },
                      { l: 'Ulcers', v: 'None', c: C.green },
                      { l: 'Falls Risk', v: 'Low', c: C.green },
                    ].map(n => (
                      <div key={n.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ width: 100, fontWeight: 600, color: C.navy }}>{n.l}</span>
                        <span style={{ flex: 1, color: C.text }}>{n.v}</span>
                        {n.c && <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.c }} />}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cardiovascular (XI-A4)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { l: 'ECG', v: 'Normal sinus rhythm', c: C.green },
                      { l: 'Echocardiogram', v: 'Normal LV function', c: C.green },
                      { l: 'MI History', v: 'None', c: C.green },
                      { l: 'Stroke/TIA', v: 'None', c: C.green },
                      { l: 'PAD', v: 'ABI 1.05 (R), 1.02 (L)', c: C.green },
                    ].map(cv => (
                      <div key={cv.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ width: 100, fontWeight: 600, color: C.navy }}>{cv.l}</span>
                        <span style={{ flex: 1, color: C.text }}>{cv.v}</span>
                        {cv.c && <span style={{ width: 8, height: 8, borderRadius: '50%', background: cv.c }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FOOT ─── */}
          {tab === 'foot' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Foot Intelligence Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Foot Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Inspection', value: 'Normal skin, no deformities', status: 'Good', color: C.green },
                      { label: 'Skin', value: 'Intact, well-hydrated', status: 'Good', color: C.green },
                      { label: 'Nails', value: 'Normal, trimmed', status: 'Good', color: C.green },
                      { label: 'Pulses', value: 'DP + PT present bilaterally', status: 'Normal', color: C.green },
                      { label: 'Monofilament', value: '10/10 sensation intact', status: 'Normal', color: C.green },
                      { label: 'Vibration Sense', value: '128 Hz perceived', status: 'Normal', color: C.green },
                      { label: 'Footwear', value: 'Appropriate, well-fitting', status: 'Adequate', color: C.green },
                      { label: 'Risk Category', value: 'Low — routine surveillance', status: 'Low', color: C.green },
                    ].map(f => (
                      <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{f.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{f.value}</div>
                        </div>
                        <span style={S.badge(f.color)}>{f.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Foot Risk Classification</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {['Low', 'Moderate', 'High', 'Active Ulcer'].map(r => (
                      <div key={r} style={{ flex: 1, padding: '12px 8px', borderRadius: 8, textAlign: 'center', background: r === 'Low' ? `${C.green}15` : r === 'Moderate' ? `${C.amber}15` : r === 'High' ? `${C.red}15` : `${C.purple}15`, border: r === 'Low' ? `2px solid ${C.green}` : `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: r === 'Low' ? C.green : r === 'Moderate' ? C.amber : r === 'High' ? C.red : C.purple }}>{r}</div>
                        {r === 'Low' && <div style={{ fontSize: 9, color: C.green, marginTop: 4 }}>✓ Current</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Photographs & Ulcer Mapping</div>
                  <div style={{ padding: '20px', borderRadius: 8, background: C.panel, textAlign: 'center', fontSize: 11, color: C.textLight }}>No ulcer mapping required — Low risk category</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ANNUAL ─── */}
          {tab === 'annual' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Annual Review</div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Annual Review Checklist — James Mwangi</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Item</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Result</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { item: 'HbA1c', result: '7.8%', status: 'Completed' },
                      { item: 'Blood Pressure', result: '128/78', status: 'Completed' },
                      { item: 'Weight/BMI', result: '84 kg / 28', status: 'Completed' },
                      { item: 'Lipids', result: 'LDL 1.8, HDL 1.2, TG 2.1', status: 'Completed' },
                      { item: 'Kidney Function (eGFR)', result: '72 mL/min', status: 'Completed' },
                      { item: 'Albumin-Creatinine Ratio (ACR)', result: 'Negative', status: 'Completed' },
                      { item: 'Dilated Retinal Exam', result: 'Background retinopathy', status: 'Completed' },
                      { item: 'Foot Exam', result: 'Low risk, normal sensation', status: 'Completed' },
                      { item: 'Smoking Status', result: 'Non-smoker', status: 'Completed' },
                      { item: 'Vaccinations', result: 'Flu 2026, Pneumococcal 2024', status: 'Completed' },
                      { item: 'Medication Reconciliation', result: 'Metformin + Glargine + Semaglutide', status: 'Completed' },
                      { item: 'Depression Screening', result: 'PHQ-9 score 8 (mild)', status: 'Completed' },
                      { item: 'Dental Review', result: 'Due — not performed', status: 'Pending' },
                    ].map(r => (
                      <tr key={r.item} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600, color: C.navy }}>{r.item}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.text }}>{r.result}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(statusColor(r.status))}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── RISK ─── */}
          {tab === 'risk' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Risk Prediction</div>
              <div style={S.grid4}>
                {[
                  { label: 'CVD Risk (10yr)', value: '12.5%', color: C.amber },
                  { label: 'CKD Progression (5yr)', value: '8.2%', color: C.green },
                  { label: 'Severe Hypoglycaemia (1yr)', value: '15.1%', color: C.amber },
                  { label: 'Foot Ulcer Risk', value: '7.5%', color: C.green },
                  { label: 'Retinopathy Progression (5yr)', value: '22.3%', color: C.amber },
                ].map(r => (
                  <div key={r.label} style={S.statCard}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{r.label}</div>
                    <div style={S.statValue}>{r.value}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, margin: '6px auto 0' }} />
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Risk Mitigation Plan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { rec: 'Intensify glycaemic therapy to achieve HbA1c <7%', pri: 'High', col: C.red },
                    { rec: 'Optimise statin therapy — target LDL <1.4 mmol/L', pri: 'High', col: C.red },
                    { rec: 'Annual retinal screening — next due in 6 months', pri: 'Medium', col: C.amber },
                    { rec: 'Continue foot surveillance — low risk, annual exam', pri: 'Low', col: C.green },
                  ].map(rm => (
                    <div key={rm.rec} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <AlertTriangle size={14} color={rm.col} />
                      <span style={{ flex: 1, fontSize: 11, color: C.navy }}>{rm.rec}</span>
                      <span style={S.badge(rm.col)}>{rm.pri} Priority</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── HOSPITALIZATION ─── */}
          {tab === 'hospitalization' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Hospitalization Intelligence</div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Hospitalization History — James Mwangi</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Year</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Diagnosis</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { yr: '2022', dx: 'DKA (Diabetic Ketoacidosis)', outcome: 'Resolved — insulin regimen optimized' },
                      { yr: '2024', dx: 'Foot Infection — Surgical Debridement', outcome: 'Resolved — IV antibiotics, wound care' },
                      { yr: '2025', dx: 'Hypoglycaemia (Severe)', outcome: 'Resolved — medication adjusted, education reinforced' },
                    ].map(h => (
                      <tr key={h.yr} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 700, color: C.navy }}>{h.yr}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.text }}>{h.dx}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(C.green)}>{h.outcome}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── PREGNANCY ─── */}
          {tab === 'pregnancy' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Pregnancy Module</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Preconception & Antenatal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Preconception HbA1c', val: 'Stable <6.5% recommended', done: true },
                      { item: 'Folic Acid Supplementation', val: '5 mg daily', done: true },
                      { item: 'Medication Review', val: 'ACEi/ARB → alternatives, Metformin safe', done: true },
                      { item: 'Fetal Monitoring', val: 'Growth scans, BPP, Doppler', done: false },
                      { item: 'Insulin Adjustments', val: 'Basal-bolus regimen optimized', done: true },
                      { item: 'Delivery Planning', val: 'Multidisciplinary team, neonatology', done: false },
                      { item: 'Postpartum Review', val: 'OGTT at 6 weeks, contraception counselling', done: false },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        {c.done ? <CheckCircle size={14} color={C.green} /> : <XCircle size={14} color={C.textLight} />}
                        <span style={{ flex: 1, color: c.done ? C.navy : C.textLight }}>{c.item}</span>
                        <span style={{ color: C.textLight }}>{c.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pregnancy Care Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}08`, border: `1px solid ${C.sky}20` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Glycaemic Targets in Pregnancy</div>
<div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>Fasting: {'<'}95 mg/dL · 1-hr Postprandial: {'<'}140 mg/dL · 2-hr: {'<'}120 mg/dL</div>
<div style={{ fontSize: 10, color: C.text }}>TIR (63-140 mg/dL): &gt;70% · TBR ({'<'}63 mg/dL): {'<'}4%</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Medication Adjustments</div>
                      <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>Insulin requirements ↑ in 2nd/3rd trimester · Postpartum ↓ significantly</div>
                      <div style={{ fontSize: 10, color: C.text }}>Metformin may continue · GLP-1 and SGLT2i contraindicated</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PORTAL ─── */}
          {tab === 'portal' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Patient Portal</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>James Mwangi — Today's Goals</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { icon: CheckCircle, label: 'Medication Reminders', value: 'Metformin, Glargine, Semaglutide due', color: C.green },
                      { icon: Activity, label: 'Home Glucose Logging', value: '4 readings today — avg 152 mg/dL', color: C.green },
                      { icon: Weight, label: 'Weight Tracking', value: '84.0 kg — stable', color: C.green },
                      { icon: Zap, label: 'Foot Self-Care', value: 'Daily inspection — no concerns', color: C.green },
                      { icon: Apple, label: 'Diet Diary', value: 'Logged breakfast and lunch', color: C.amber },
                      { icon: Calendar, label: 'Appointments', value: 'Next: Eye screening Jul 20', color: C.amber },
                      { icon: BookOpen, label: 'Education', value: 'Sick day rules video available', color: C.sky },
                      { icon: Target, label: 'Achievements', value: '7-day logging streak', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <p.icon size={16} color={p.color} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.label}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{p.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Education</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { title: 'Understanding Your HbA1c', type: 'PDF', read: true },
                        { title: 'Carbohydrate Counting Guide', type: 'PDF', read: true },
                        { title: 'Insulin Injection Technique', type: 'Video', read: false },
                        { title: 'Sick Day Management', type: 'PDF', read: false },
                        { title: 'Foot Care Guide', type: 'Interactive', read: true },
                        { title: 'GLP-1 Therapy Information', type: 'PDF', read: false },
                      ].map(e => (
                        <div key={e.title} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          {e.read ? <CheckCircle size={12} color={C.green} /> : <BookOpen size={12} color={C.amber} />}
                          <span style={{ flex: 1, color: C.navy }}>{e.title}</span>
                          <span style={{ color: C.textLight }}>{e.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Warning Signs</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { sym: 'Blood glucose >20 mmol/L', urg: 'Call clinic same day', color: C.red },
                        { sym: 'BG <4 mmol/L with confusion', urg: 'Emergency — call 911', color: C.red },
                        { sym: 'Fever with vomiting/diarrhoea', urg: 'Call clinic same day', color: C.red },
                        { sym: 'New foot ulcer or blister', urg: 'Call within 24h', color: C.amber },
                        { sym: 'Blurred vision (sudden)', urg: 'Call within 24h', color: C.amber },
                      ].map(w => (
                        <div key={w.sym} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                          <span style={{ flex: 1, color: C.navy }}>{w.sym}</span>
                          <span style={S.badge(w.color)}>{w.urg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── DEVICES ─── */}
          {tab === 'devices' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Home Device Integration</div>
              <div style={S.grid4}>
                {[
                  { label: 'Connected Devices', value: '6', icon: Home, color: C.sky },
                  { label: 'Sync Rate', value: '95%', icon: RefreshCw, color: C.green },
                  { label: 'Active Sensors', value: '3', icon: Activity, color: C.green },
                  { label: 'Pending Alerts', value: '2', icon: AlertTriangle, color: C.amber },
                ].map(d => (
                  <div key={d.label} style={S.statCard}>
                    <d.icon size={20} color={d.color} />
                    <div style={S.statValue}>{d.value}</div>
                    <div style={S.statLabel}>{d.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>James Mwangi — Connected Devices</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Device Type</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Model</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Last Sync</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { t: 'Glucometer', m: 'Accu-Chek Guide', s: 'Today 08:00', st: 'Online' },
                      { t: 'CGM', m: 'Dexcom G7', s: 'Today 08:15', st: 'Online' },
                      { t: 'Smart Insulin Pen', m: 'NovoPen 6', s: 'Today 07:30', st: 'Online' },
                      { t: 'Smart Scale', m: 'Withings Body+', s: 'Today 07:00', st: 'Online' },
                      { t: 'BP Monitor', m: 'Omron HEM-7322', s: 'Yesterday 20:00', st: 'Online' },
                      { t: 'Activity Tracker', m: 'Fitbit Charge 6', s: 'Today 06:00', st: 'Online' },
                    ].map(dv => (
                      <tr key={dv.t} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600, color: C.navy }}>{dv.t}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{dv.m}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{dv.s}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(dv.st === 'Online' ? C.green : C.red)}>{dv.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {tab === 'team' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Multidisciplinary Team</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Diabetes Care Team</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { role: 'Endocrinologist', name: 'Dr. Kamau', contact: 'Ext. 3101', status: 'Available', color: C.green },
                      { role: 'Primary Care', name: 'Dr. Njoroge', contact: 'Ext. 2102', status: 'Available', color: C.green },
                      { role: 'Diabetes Nurse Educator', name: 'Sr. Atieno', contact: 'Ext. 3402', status: 'Available', color: C.green },
                      { role: 'Dietitian', name: 'Ms. Wanjiku', contact: 'Ext. 4501', status: 'Busy', color: C.amber },
                      { role: 'Pharmacist', name: 'Mr. Otieno', contact: 'Ext. 5201', status: 'Available', color: C.green },
                      { role: 'Ophthalmologist', name: 'Dr. Mwangi', contact: 'Ext. 4402', status: 'Available', color: C.green },
                      { role: 'Podiatrist', name: 'Dr. Ochieng', contact: 'Ext. 3406', status: 'Available', color: C.green },
                      { role: 'Nephrologist', name: 'Dr. Chebet', contact: 'Ext. 6301', status: 'On Call', color: C.amber },
                      { role: 'Cardiologist', name: 'Dr. Wambui', contact: 'Ext. 6302', status: 'Available', color: C.green },
                    ].map(t => (
                      <div key={t.role} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{t.role}</span>
                        <span style={{ color: C.text }}>{t.name}</span>
                        <span style={{ color: C.textLight }}>{t.contact}</span>
                        <span style={S.badge(t.color)}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Upcoming MDT Discussions</div>
                  {[
                    { p: 'James Mwangi', d: '2026-07-15', t: 'Therapy intensification, GLP-1 titration', pr: 'High' },
                    { p: 'Grace Akinyi', d: '2026-07-15', t: 'Pregnancy glycaemic management, insulin pump optimization', pr: 'High' },
                    { p: 'Peter Ochieng', d: '2026-07-22', t: 'Foot ulcer management, vascular assessment', pr: 'Medium' },
                    { p: 'John Kamau', d: '2026-07-22', t: 'Poor glycaemic control, adherence barriers', pr: 'Medium' },
                  ].map(md => (
                    <div key={md.p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.panel}`, fontSize: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: C.navy }}>{md.p}</div>
                        <div style={{ color: C.textLight }}>{md.d} — {md.t}</div>
                      </div>
                      <span style={S.badge(md.pr === 'High' ? C.red : C.amber)}>{md.pr}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === 'registry' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Diabetes Registry</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Activity size={20} color={C.sky} />
                  <div style={S.statValue}>142</div>
                  <div style={S.statLabel}>Total Diabetes Patients</div>
                </div>
                <div style={S.statCard}>
                  <Activity size={20} color={C.green} />
                  <div style={S.statValue}>7.4%</div>
                  <div style={S.statLabel}>Mean HbA1c</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={20} color={C.amber} />
                  <div style={S.statValue}>12.8%</div>
                  <div style={S.statLabel}>Poor Control</div>
                </div>
                <div style={S.statCard}>
                  <TrendingUp size={20} color={C.purple} />
                  <div style={S.statValue}>58%</div>
                  <div style={S.statLabel}>TIR {'>'}70%</div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                  <input style={{ ...S.input, width: 200 }} type="text" placeholder="Search registry..." />
                  <select style={S.sel}>
                    <option>All Types</option>
                    <option>T1D</option>
                    <option>T2D</option>
                    <option>GDM</option>
                    <option>LADA</option>
                  </select>
                  <button style={S.btn(C.sky)}><Search size={14} /> Search</button>
                  <button style={S.btn(C.green)}><Plus size={14} /> Register</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Duration</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>HbA1c</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>TIR</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 'James Mwangi', t: 'T2D', d: '12 yr', h: '7.8', ti: '68%', s: 'Partially Controlled' },
                      { n: 'Grace Akinyi', t: 'T1D', d: '15 yr', h: '6.9', ti: '71%', s: 'Controlled' },
                      { n: 'Peter Ochieng', t: 'T2D', d: '8 yr', h: '9.1', ti: '35%', s: 'Poor Control' },
                      { n: 'John Kamau', t: 'T2D', d: '5 yr', h: '8.5', ti: '48%', s: 'Poor Control' },
                      { n: 'Mary Achieng', t: 'GDM', d: '28 wk', h: '5.8', ti: '85%', s: 'Controlled' },
                    ].map(p => (
                      <tr key={p.n} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600, color: C.navy }}>{p.n}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.pill(p.t === 'T1D' ? C.sky : p.t === 'GDM' ? C.purple : C.green)}>{p.t}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{p.d}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: parseFloat(p.h) > 8 ? C.red : parseFloat(p.h) > 7 ? C.amber : C.green }}>{p.h}%</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{p.ti}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(statusColor(p.s))}>{p.s}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── QUALITY ─── */}
          {tab === 'quality' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Quality Indicators</div>
              <div style={S.grid4}>
                {[
                  { label: 'Mean HbA1c', value: '7.4%', color: C.amber },
                  { label: '% at Target (<7%)', value: '68%', color: C.amber },
                  { label: 'Retinal Screening', value: '72%', color: C.amber },
                  { label: 'Foot Exam (annual)', value: '58%', color: C.amber },
                  { label: 'BP Control (<130/80)', value: '65%', color: C.amber },
                  { label: 'Statin Use', value: '62%', color: C.amber },
                  { label: 'ACEi/ARB Use', value: '58%', color: C.amber },
                  { label: 'DKA Admissions (30d)', value: '2', color: C.amber },
                ].map(q => (
                  <div key={q.label} style={S.statCard}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{q.label}</div>
                    <div style={S.statValue}>{q.value}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: q.color, margin: '6px auto 0' }} />
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Indicator</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Current</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Target</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Progress</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { ind: 'Mean HbA1c <7.0%', cur: '7.4%', tgt: '<7.0%', prog: 55, st: 'Needs Attention' },
                      { ind: '% at Target (HbA1c <7%)', cur: '68%', tgt: '75%', prog: 68, st: 'Fair' },
                      { ind: 'Retinal Screening (annual)', cur: '72%', tgt: '85%', prog: 72, st: 'Fair' },
                      { ind: 'Foot Exam (annual)', cur: '58%', tgt: '80%', prog: 58, st: 'Needs Attention' },
                      { ind: 'BP Control (<130/80)', cur: '65%', tgt: '70%', prog: 65, st: 'Fair' },
                      { ind: 'Statin Therapy (ASCVD >10%)', cur: '62%', tgt: '80%', prog: 62, st: 'Needs Attention' },
                      { ind: 'ACEi/ARB (if CKD/albuminuria)', cur: '58%', tgt: '75%', prog: 58, st: 'Needs Attention' },
                      { ind: 'Severe Hypoglycaemia Rate (annual)', cur: '3.2%', tgt: '<2%', prog: 40, st: 'Behind' },
                      { ind: 'DKA Admissions (per 100 patient-years)', cur: '2.1', tgt: '<1.5', prog: 45, st: 'Behind' },
                      { ind: 'Amputation Rate (annual)', cur: '0.8%', tgt: '<0.5%', prog: 50, st: 'Needs Attention' },
                    ].map(q => (
                      <tr key={q.ind} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{q.ind}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600 }}>{q.cur}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{q.tgt}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                            <div style={{ width: 60, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${q.prog}%`, height: '100%', background: q.prog >= 80 ? C.green : q.prog >= 60 ? C.amber : C.red, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 10 }}>{q.prog}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(statusColor(q.st))}>{q.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}