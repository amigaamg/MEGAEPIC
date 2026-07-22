'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, Eye, Brain, Bone, Filter, HeartPulse, type LucideIcon, Zap, Home, Globe, Baby, Apple, Target, BarChart3, Sliders, LineChart } from 'lucide-react'
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
    case 'Active': case 'Complete': case 'Controlled': case 'On Track': case 'Available': case 'Good': case 'Functioning': return C.green
    case 'Resolved': case 'Excellent': case 'Stable': return C.green
    case 'Fair': case 'Pending': case 'Needs Attention': case 'Moderate': case 'Busy': case 'Low': case 'Mild': case 'Improving': return C.amber
    case 'Poor': case 'Behind': case 'Critical': case 'Uncontrolled': case 'High': case 'Severe': case 'Unavailable': case 'Declining': return C.red
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Renal Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Kidney Snapshot', icon: Filter },
  { id: 'timeline', label: 'Disease Timeline', icon: Clock },
  { id: 'classification', label: 'CKD Classification', icon: Sliders },
  { id: 'phenotype', label: 'Renal Phenotype', icon: Brain },
  { id: 'function', label: 'Kidney Function', icon: Monitor },
  { id: 'egfr', label: 'eGFR Trend', icon: TrendingUp },
  { id: 'albuminuria', label: 'Albuminuria', icon: Droplets },
  { id: 'anemia', label: 'CKD Anemia', icon: HeartPulse },
  { id: 'bone', label: 'Mineral Bone Disease', icon: Bone },
  { id: 'electrolytes', label: 'Electrolyte Disorders', icon: Activity },
  { id: 'bp', label: 'Blood Pressure Intelligence', icon: Heart },
  { id: 'medications', label: 'Medication Intelligence', icon: Pill },
  { id: 'dialysis-plan', label: 'Dialysis Planning', icon: Calendar },
  { id: 'hemodialysis', label: 'Hemodialysis', icon: Wind },
  { id: 'pd', label: 'Peritoneal Dialysis', icon: Droplets },
  { id: 'access', label: 'Access Intelligence', icon: Shield },
  { id: 'transplant', label: 'Transplant Center', icon: Heart },
  { id: 'fluids', label: 'Fluid Intelligence', icon: Weight },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'pregnancy', label: 'Pregnancy', icon: Baby },
  { id: 'home-monitoring', label: 'Home Monitoring', icon: Monitor },
  { id: 'team', label: 'MDT', icon: Users },
  { id: 'registry', label: 'Registry', icon: FileText },
  { id: 'quality', label: 'Quality Indicators', icon: BarChart3 },
  { id: 'portal', label: 'Patient Portal', icon: Globe },
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
  { label: 'Diabetes', href: '/diabetes' },
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

export default function RenalWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Chronic Kidney Disease &mdash; Volume XI-D</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>CK</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Renal Intelligence</div>
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Renal Intelligence Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Volume XI-D &mdash; Chronic Kidney Disease, Dialysis &amp; Renal Intelligence</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.red)}>5 High Risk</span>
                  <span style={S.pill(C.amber)}>18 Declining</span>
                  <span style={S.pill(C.green)}>42 Stable</span>
                  <span style={S.pill(C.sky)}>142 Enrolled</span>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'Total CKD Patients', value: '142', icon: Users, color: C.sky },
                  { label: 'Stage 1-2', value: '34', icon: Filter, color: C.green },
                  { label: 'Stage 3', value: '52', icon: Filter, color: C.amber },
                  { label: 'Stage 4-5', value: '56', icon: Filter, color: C.red },
                  { label: 'Dialysis', value: '28', icon: Wind, color: C.purple },
                  { label: 'Transplant', value: '12', icon: Heart, color: C.green },
                  { label: 'AKI (30d)', value: '8', icon: AlertTriangle, color: C.amber },
                  { label: 'Mortality (1yr)', value: '6', icon: HeartPulse, color: C.red },
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
                    { title: 'Rapid eGFR Decline', patient: 'John Kamau', detail: 'eGFR 45 → 38 in 6 months', color: C.red },
                    { title: 'Hyperkalemia Detected', patient: 'Mary Wanjiku', detail: 'K+ 6.1 mmol/L — urgent review', color: C.red },
                    { title: 'AVF Maturation Failure', patient: 'Samuel Ochieng', detail: 'AVF not maturing at 8 weeks', color: C.amber },
                    { title: 'Missed Dialysis Session', patient: 'Grace Njeri', detail: '3 sessions missed this month', color: C.amber },
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
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New CKD Assessment</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Medication Review</button>
                  <button style={S.btn(C.purple)}><Shield size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Dialysis Check</button>
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
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Mary Wanjiku / 58 / F</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>CKD Stage 3B · Duration: 8 Years · DKD · Status: Stable · Risk: Moderate</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.green)}>Stable</span>
                    <span style={S.badge(C.amber)}>Stage 3B</span>
                    <span style={S.badge(C.amber)}>Moderate Risk</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Kidney Snapshot</div>
              <div style={S.grid4}>
                {[
                  { label: 'eGFR', value: '38 mL/min', color: C.amber },
                  { label: 'Creatinine', value: '198 μmol/L', color: C.amber },
                  { label: 'Albuminuria', value: 'A3', color: C.amber },
                  { label: 'Potassium', value: '4.8 mmol/L', color: C.green },
                  { label: 'Bicarbonate', value: '22 mmol/L', color: C.green },
                  { label: 'Blood Pressure', value: '126/74', color: C.green },
                  { label: 'Hemoglobin', value: '10.5 g/dL', color: C.amber },
                  { label: 'Weight', value: '72 kg', color: C.green },
                  { label: 'Calcium', value: '2.3 mmol/L', color: C.green },
                  { label: 'Phosphate', value: '1.4 mmol/L', color: C.amber },
                  { label: 'PTH', value: '12 pmol/L', color: C.amber },
                  { label: 'Vitamin D', value: '54 nmol/L', color: C.amber },
                ].map(m => (
                  <div key={m.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${m.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{m.value}</div>
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
                  { year: '2018', title: 'Microalbuminuria → ACE Inhibitor Started', desc: 'ACE inhibitor initiated for renoprotection, microalbuminuria detected', icon: Pill, color: C.sky },
                  { year: '2019', title: 'CKD Stage 2 (eGFR 75)', desc: 'Mildly decreased kidney function, eGFR 75 mL/min', icon: Filter, color: C.green },
                  { year: '2020', title: 'CKD Stage 3A (eGFR 52)', desc: 'Mild-moderate decline, eGFR 52 mL/min, closer monitoring initiated', icon: Filter, color: C.amber },
                  { year: '2021', title: 'Anemia Diagnosed (Hb 10.8)', desc: 'CKD-related anemia detected, hemoglobin 10.8 g/dL, ESA therapy considered', icon: HeartPulse, color: C.amber },
                  { year: '2022', title: 'AV Fistula Created (Left forearm)', desc: 'Left forearm AVF created for hemodialysis access planning', icon: Shield, color: C.amber },
                  { year: '2023', title: 'Hemodialysis Initiated', desc: 'In-center hemodialysis started, 3x/week, 4h sessions', icon: Wind, color: C.purple },
                  { year: '2024', title: 'Kidney Transplant (Deceased donor)', desc: 'Deceased donor kidney transplant, immediate graft function', icon: Heart, color: C.green },
                  { year: '2025', title: 'Stable Graft Function (Cr 120)', desc: 'Creatinine 120 μmol/L, eGFR 52, no rejection, stable immunosuppression', icon: CheckCircle, color: C.green },
                ].map((e, i) => (
                  <div key={e.year} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${e.color}15`, border: `2px solid ${e.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <e.icon size={14} color={e.color} />
                      </div>
                      {i < 8 && <div style={{ width: 2, height: '100%', background: C.border, flex: 1 }} />}
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
                    <input style={S.input} placeholder="e.g. 2025" />
                  </div>
                  <div>
                    <label style={S.label}>Event Type</label>
                    <select style={S.sel}>
                      <option>CKD Progression</option>
                      <option>Medication Change</option>
                      <option>Dialysis Start</option>
                      <option>Transplant</option>
                      <option>Procedure</option>
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

          {/* ─── CLASSIFICATION ─── */}
          {tab === 'classification' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>CKD Classification</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>GFR Categories (G1-G5)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { stage: 'G1', label: '≥90', desc: 'Normal or high', active: false },
                      { stage: 'G2', label: '60-89', desc: 'Mildly decreased', active: false },
                      { stage: 'G3a', label: '45-59', desc: 'Mild-moderate', active: false },
                      { stage: 'G3b', label: '30-44', desc: 'Moderate-severe', active: true },
                      { stage: 'G4', label: '15-29', desc: 'Severely decreased', active: false },
                      { stage: 'G5', label: '<15', desc: 'Kidney failure', active: false },
                    ].map(g => (
                      <div key={g.stage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: g.active ? `${C.sky}10` : C.panel, border: g.active ? `1px solid ${C.sky}30` : 'none' }}>
                        <span style={{ width: 36, height: 24, borderRadius: 4, background: g.active ? C.sky : C.border, color: g.active ? C.white : C.textLight, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{g.stage}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>eGFR {g.label}</span>
                        <span style={{ flex: 1, fontSize: 10, color: C.textLight }}>{g.desc}</span>
                        {g.active && <span style={S.pill(C.sky)}>Active</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Albuminuria Categories (A1-A3)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { stage: 'A1', label: '<30 mg/g', desc: 'Normal-mild', active: false },
                      { stage: 'A2', label: '30-300 mg/g', desc: 'Moderately increased', active: false },
                      { stage: 'A3', label: '>300 mg/g', desc: 'Severely increased', active: true },
                    ].map(a => (
                      <div key={a.stage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: a.active ? `${C.amber}10` : C.panel, border: a.active ? `1px solid ${C.amber}30` : 'none' }}>
                        <span style={{ width: 36, height: 24, borderRadius: 4, background: a.active ? C.amber : C.border, color: a.active ? C.white : C.textLight, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.stage}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>ACR {a.label}</span>
                        <span style={{ flex: 1, fontSize: 10, color: C.textLight }}>{a.desc}</span>
                        {a.active && <span style={S.pill(C.amber)}>Active</span>}
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Cause</div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.sky}10`, fontSize: 12, color: C.navy, fontWeight: 500 }}>DKD — Diabetic Kidney Disease (Type 2 Diabetes)</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PHENOTYPE ─── */}
          {tab === 'phenotype' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Renal Phenotype Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'DKD', status: true, color: C.green },
                      { label: 'HTN Nephropathy', status: false, color: C.amber },
                      { label: 'GN', status: false, color: C.textLight },
                      { label: 'Obstructive', status: false, color: C.textLight },
                      { label: 'PKD', status: false, color: C.textLight },
                      { label: 'Transplant', status: false, color: C.textLight },
                      { label: 'Vasculitis', status: false, color: C.textLight },
                      { label: 'TIN', status: false, color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${p.status ? C.sky : C.border}`, background: p.status ? C.sky : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.status && <CheckCircle size={12} color={C.white} />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.navy }}>{p.label}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: p.color }}>{typeof p.status === 'string' ? p.status : p.status ? 'Yes' : p.label === 'HTN Nephropathy' ? 'Possible' : 'No'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Diabetic Kidney Disease</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Type 2 diabetes with progressive nephropathy. eGFR declining at 3.1 mL/min/year. Significant albuminuria (A3). Possible hypertensive component contributing to progression. No evidence of GN, PKD, or obstructive uropathy.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Update Phenotype</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>Primary Phenotype</label>
                        <select style={S.sel}><option>DKD</option><option>HTN</option><option>GN</option><option>PKD</option><option>Other</option></select>
                      </div>
                      <div>
                        <label style={S.label}>Secondary</label>
                        <select style={S.sel}><option>None</option><option>HTN</option><option>Obstructive</option><option>Vasculitis</option></select>
                      </div>
                    </div>
                    <button style={S.btn(C.sky)}>Update Classification</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FUNCTION ─── */}
          {tab === 'function' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Kidney Function Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'eGFR', value: '38 mL/min', trend: 'Stage 3B', color: C.amber },
                      { label: 'Creatinine', value: '198 μmol/L', trend: 'Elevated', color: C.amber },
                      { label: 'Albuminuria', value: 'A3 (>300 mg/g)', trend: 'Severely increased', color: C.amber },
                      { label: 'BUN', value: '28 mg/dL', trend: 'Mildly elevated', color: C.amber },
                      { label: 'Potassium', value: '4.8 mmol/L', trend: 'Normal', color: C.green },
                      { label: 'Bicarbonate', value: '22 mmol/L', trend: 'Mild acidosis', color: C.amber },
                      { label: 'Proteinuria', value: '1.2 g/24h', trend: 'Nephrotic range', color: C.amber },
                      { label: 'Uric Acid', value: '420 μmol/L', trend: 'Elevated', color: C.amber },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{p.value}</div>
                        </div>
                        <span style={S.badge(p.color)}>{p.trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Function Trend (12 months)</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, padding: '12px 0' }}>
                    {[
                      { mo: 'Jul', egfr: 48, cr: 145 },
                      { mo: 'Aug', egfr: 47, cr: 150 },
                      { mo: 'Sep', egfr: 46, cr: 155 },
                      { mo: 'Oct', egfr: 44, cr: 162 },
                      { mo: 'Nov', egfr: 45, cr: 158 },
                      { mo: 'Dec', egfr: 43, cr: 168 },
                      { mo: 'Jan', egfr: 42, cr: 172 },
                      { mo: 'Feb', egfr: 40, cr: 180 },
                      { mo: 'Mar', egfr: 41, cr: 175 },
                      { mo: 'Apr', egfr: 39, cr: 185 },
                      { mo: 'May', egfr: 38, cr: 192 },
                      { mo: 'Jun', egfr: 38, cr: 198 },
                    ].map(m => (
                      <div key={m.mo} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '60%', height: m.cr * 0.35, borderRadius: '3px 3px 0 0', background: m.cr > 180 ? C.amber : C.sky, marginBottom: 2 }} />
                        <div style={{ width: '60%', height: m.egfr * 1.8, borderRadius: '3px 3px 0 0', background: C.green, opacity: 0.5 }} />
                        <div style={{ fontSize: 8, color: C.textLight, marginTop: 4 }}>{m.mo}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: C.textLight }}>Creatinine (blue/amber) and eGFR (green) over 12 months</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── eGFR ─── */}
          {tab === 'egfr' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>eGFR Trend Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Annual eGFR decline: -3.1 mL/min/year &mdash; Moderate progression</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>eGFR Trend</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, padding: '12px 8px' }}>
                    {[
                      { val: 45, label: '2021' },
                      { val: 42, label: '2022' },
                      { val: 40, label: '2023' },
                      { val: 38, label: '2024' },
                    ].map((p, i) => {
                      const h = (p.val / 50) * 180
                      return (
                        <div key={p.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.val}</div>
                          <div style={{ width: '60%', height: h, borderRadius: '6px 6px 0 0', background: p.val < 40 ? C.red : p.val < 45 ? C.amber : C.sky, marginTop: 4, opacity: 0.7 + i * 0.1 }} />
                          <div style={{ fontSize: 9, color: C.textLight, marginTop: 6 }}>{p.label}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, fontSize: 11 }}>
                    <strong>Progression:</strong> Moderate &mdash; Dialysis window estimated at 5-7 years at current rate
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>eGFR Metrics</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      {[
                        { label: 'Current eGFR', value: '38 mL/min' },
                        { label: '12-Month Change', value: '-7 mL/min' },
                        { label: 'Annual Decline Rate', value: '-3.1 mL/min/year' },
                        { label: 'Progression Category', value: 'Moderate' },
                        { label: 'Dialysis Window', value: '5-7 years' },
                        { label: 'eGFR Slope', value: '-3.1 mL/min/1.73m²/yr' },
                        { label: 'CKD Stage', value: 'G3b (Moderate-severe)' },
                        { label: 'Risk Category', value: 'High (KDIGO)' },
                      ].map(r => (
                        <tr key={r.label} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 4px', color: C.text }}>{r.label}</td>
                          <td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: C.navy }}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── ALBUMINURIA ─── */}
          {tab === 'albuminuria' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Albuminuria Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Albuminuria Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Microalbuminuria', status: 'Negative', color: C.green },
                      { label: 'Macroalbuminuria', status: 'Positive', color: C.red },
                      { label: 'PCR (Protein-Creatinine Ratio)', value: '120 mg/mmol', status: 'Elevated', color: C.amber },
                      { label: 'ACR (Albumin-Creat Ratio)', value: '45 mg/g', status: 'A3', color: C.amber },
                      { label: 'Response to Therapy', status: 'Improving', color: C.amber },
                      { label: '24h Protein', value: '1.2 g/24h', status: 'Nephrotic range', color: C.amber },
                    ].map(a => (
                      <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{a.label}</div>
                          {a.value && <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{a.value}</div>}
                        </div>
                        <span style={S.badge(a.color)}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Timeline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { date: 'Jun 2024', acr: '45 mg/g', pcr: '120 mg/mmol', note: 'Improving on ACEi + SGLT2i' },
                      { date: 'Jan 2024', acr: '62 mg/g', pcr: '155 mg/mmol', note: 'SGLT2i added' },
                      { date: 'Jul 2023', acr: '55 mg/g', pcr: '140 mg/mmol', note: 'ACEi up-titrated' },
                      { date: 'Jan 2023', acr: '48 mg/g', pcr: '130 mg/mmol', note: 'Baseline' },
                    ].map(r => (
                      <div key={r.date} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ fontWeight: 600, color: C.navy }}>{r.date}</div>
                        <div style={{ color: C.textLight }}>ACR {r.acr} &middot; PCR {r.pcr}</div>
                        <div style={{ color: C.textLight }}>{r.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ANEMIA ─── */}
          {tab === 'anemia' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>CKD Anemia Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Anemia Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Hemoglobin', value: '10.5 g/dL', status: 'Mild anemia', color: C.amber },
                      { label: 'Ferritin', value: '200 ng/mL', status: 'Normal', color: C.green },
                      { label: 'TSAT', value: '22%', status: 'Low', color: C.amber },
                      { label: 'Iron', value: '14 μmol/L', status: 'Low', color: C.amber },
                      { label: 'TIBC', value: '65 μmol/L', status: 'Normal', color: C.green },
                      { label: 'Folate', value: '12 nmol/L', status: 'Normal', color: C.green },
                      { label: 'B12', value: '350 pmol/L', status: 'Normal', color: C.green },
                      { label: 'EPO Level', value: '18 mIU/mL', status: 'Inappropriately low', color: C.amber },
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
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Therapy</div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}08`, border: `1px solid ${C.sky}20`, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>IV Iron</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Iron sucrose 200 mg monthly &mdash; Last dose: 2 weeks ago</div>
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.purple}08`, border: `1px solid ${C.purple}20`, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>ESA Therapy</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Epoetin alfa 4,000 U/week SC &mdash; Target Hb: 10-11.5 g/dL</div>
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Transfusions</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>No transfusions in last 12 months</div>
                  </div>
                  <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, fontSize: 10, color: C.amber }}>
                    Next Hb check: 4 weeks &middot; Adjust ESA if Hb &lt;10 or &gt;11.5 g/dL
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── BONE ─── */}
          {tab === 'bone' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Mineral Bone Disease (MBD)</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>MBD Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Calcium (corrected)', value: '2.3 mmol/L', status: 'Normal', color: C.green },
                      { label: 'Phosphate', value: '1.4 mmol/L', status: 'Mildly elevated', color: C.amber },
                      { label: 'PTH', value: '12 pmol/L', status: 'Elevated for stage', color: C.amber },
                      { label: 'Vitamin D (25-OH)', value: '54 nmol/L', status: 'Insufficient', color: C.amber },
                      { label: 'ALP', value: '85 U/L', status: 'Normal', color: C.green },
                      { label: 'T-score (DEXA)', value: '-1.2', status: 'Osteopenia', color: C.amber },
                      { label: 'Fracture History', value: 'None', status: 'No fractures', color: C.green },
                    ].map(b => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{b.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{b.value}</div>
                        </div>
                        <span style={S.badge(b.color)}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Management</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.sky}08`, border: `1px solid ${C.sky}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Vitamin D Supplementation</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Cholecalciferol 800 IU daily</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Phosphate Binder</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Sevelamer carbonate 800 mg TID with meals</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Bone Density</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>DEXA scan annually &middot; Last: normal for age</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ELECTROLYTES ─── */}
          {tab === 'electrolytes' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Electrolyte Disorders</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Electrolytes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Sodium', value: '138 mmol/L', status: 'Normal', color: C.green },
                      { label: 'Potassium', value: '4.8 mmol/L', status: 'High-normal', color: C.amber },
                      { label: 'Chloride', value: '102 mmol/L', status: 'Normal', color: C.green },
                      { label: 'Bicarbonate', value: '22 mmol/L', status: 'Mild acidosis', color: C.amber },
                      { label: 'Calcium (ionized)', value: '1.15 mmol/L', status: 'Normal', color: C.green },
                      { label: 'Magnesium', value: '0.9 mmol/L', status: 'Low-normal', color: C.amber },
                      { label: 'Phosphate', value: '1.4 mmol/L', status: 'Mildly elevated', color: C.amber },
                    ].map(e => (
                      <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{e.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{e.value}</div>
                        </div>
                        <span style={S.badge(e.color)}>{e.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Acid-Base Status</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Mild metabolic acidosis &mdash; Consider oral bicarbonate if bicarb &lt;22</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Hyperkalemia Events</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>No hyperkalemia events in last 6 months</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>ECG</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Normal sinus rhythm &middot; No T-wave changes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── BP INTELLIGENCE ─── */}
          {tab === 'bp' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Blood Pressure Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>BP Metrics</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Office BP', value: '126/74 mmHg', status: 'Controlled', color: C.green },
                      { label: 'Home BP (AM)', value: '124/72 mmHg', status: 'Controlled', color: C.green },
                      { label: 'Home BP (PM)', value: '128/76 mmHg', status: 'Controlled', color: C.green },
                      { label: '24h ABPM Mean', value: '125/73 mmHg', status: 'Controlled', color: C.green },
                      { label: 'BP Target', value: '<130/80 mmHg', status: 'Achieved', color: C.green },
                      { label: 'Proteinuria Response', value: 'UACR 45 mg/g', status: 'Improving', color: C.amber },
                      { label: 'Nocturnal Dipping', value: '12%', status: 'Normal', color: C.green },
                      { label: 'BP Variability', value: 'SD 8/5 mmHg', status: 'Acceptable', color: C.green },
                    ].map(b => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{b.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{b.value}</div>
                        </div>
                        <span style={S.badge(b.color)}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal-Specific BP Targets</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.sky}08`, border: `1px solid ${C.sky}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>CKD Target</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{'<130/80 mmHg (KDIGO 2024)'}</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Albuminuria Target</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{'<125/75 mmHg if ACR >300 mg/g'}</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Dialysis Target</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Pre-HD {'<140/90'} · Post-HD {'<130/80'}</div>
                    </div>
                    <div style={S.divider} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8, marginTop: 4 }}>Medication BP Effects</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                          <th style={{ textAlign: 'left', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Medication</th>
                          <th style={{ textAlign: 'center', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>BP Reduction</th>
                          <th style={{ textAlign: 'center', padding: '6px 4px', color: C.textLight, fontWeight: 500 }}>Effect on Proteinuria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { m: 'Ramipril 10 mg', bp: '-12/8 mmHg', prot: 'Reduces 35%' },
                          { m: 'Losartan 50 mg', bp: '-10/7 mmHg', prot: 'Reduces 30%' },
                          { m: 'Dapagliflozin 10 mg', bp: '-4/2 mmHg', prot: 'Reduces 40%' },
                          { m: 'Furosemide 40 mg', bp: '-8/5 mmHg', prot: 'Indirect effect' },
                        ].map(r => (
                          <tr key={r.m} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.m}</td>
                            <td style={{ textAlign: 'center', padding: '6px 4px' }}>{r.bp}</td>
                            <td style={{ textAlign: 'center', padding: '6px 4px' }}>{r.prot}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal Medications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { drug: 'Ramipril', dose: '10 mg daily', class: 'ACEi', adherence: '95%', color: C.green },
                      { drug: 'Losartan', dose: '50 mg daily', class: 'ARB', adherence: '90%', color: C.green },
                      { drug: 'Dapagliflozin', dose: '10 mg daily', class: 'SGLT2i', adherence: '88%', color: C.green },
                      { drug: 'Furosemide', dose: '40 mg daily', class: 'Diuretic', adherence: '85%', color: C.amber },
                      { drug: 'Sevelamer', dose: '800 mg TID', class: 'Phosphate binder', adherence: '80%', color: C.amber },
                      { drug: 'Epoetin alfa', dose: '4,000 U/week', class: 'ESA', adherence: '92%', color: C.green },
                      { drug: 'Iron sucrose', dose: '200 mg monthly', class: 'IV Iron', adherence: '100%', color: C.green },
                      { drug: 'Cholecalciferol', dose: '800 IU daily', class: 'Vit D', adherence: '85%', color: C.amber },
                      { drug: 'Sodium bicarb', dose: '650 mg BID', class: 'Alkali', adherence: '70%', color: C.amber },
                      { drug: 'Patiromer', dose: '8.4 g daily', class: 'K+ binder', adherence: '75%', color: C.amber },
                    ].map(m => (
                      <div key={m.drug} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 6, padding: '6px 8px', borderRadius: 6, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{m.drug}</span>
                        <span style={{ color: C.text }}>{m.dose}</span>
                        <span style={S.pill(m.color)}>{m.class}</span>
                        <span style={S.pill(m.adherence >= '90' ? C.green : C.amber)}>{m.adherence}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Risk Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>ACEi/ARB + SGLT2i</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Optimal renoprotective combination &mdash; Continue</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Monitor: K+ & eGFR</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>ACEi + SGLT2i + K+ binder &mdash; Check K+ in 2 weeks</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.sky}08`, border: `1px solid ${C.sky}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Dose Adjustments</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Review phosphate binder dose &mdash; Phos 1.4 mmol/L</div>
                    </div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Add Medication</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 2 }}>
                      <label style={S.label}>Drug</label>
                      <select style={S.sel}>
                        <option>Ramipril</option>
                        <option>Losartan</option>
                        <option>Dapagliflozin</option>
                        <option>Furosemide</option>
                        <option>Sevelamer</option>
                        <option>Patiromer</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={S.label}>Dose</label>
                      <input style={S.input} placeholder="e.g. 10 mg" />
                    </div>
                    <button style={S.btn(C.sky)}>Add</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── DIALYSIS PLANNING ─── */}
          {tab === 'dialysis-plan' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Dialysis Planning</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Planning Checklist</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { item: 'Patient Education', status: 'Complete', color: C.green },
                      { item: 'Access Planning', status: 'Pending', color: C.amber },
                      { item: 'AVF Referral', status: 'Pending', color: C.amber },
                      { item: 'PD Catheter Planning', status: 'Pending', color: C.amber },
                      { item: 'Transplant Evaluation', status: 'Pending', color: C.amber },
                      { item: 'Vaccination (Hep B, Pneumococcal)', status: 'Complete', color: C.green },
                      { item: 'Social Work Assessment', status: 'Pending', color: C.amber },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        {c.status === 'Complete' ? <CheckCircle size={16} color={C.green} /> : <XCircle size={16} color={C.amber} />}
                        <span style={{ flex: 1, fontSize: 12, color: C.navy }}>{c.item}</span>
                        <span style={S.badge(c.color)}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Dialysis Modality Selection</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.sky}08`, border: `1px solid ${C.sky}20`, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="radio" checked style={{ accentColor: C.sky }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Hemodialysis (In-Center)</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>3x/week, 4h sessions &middot; AVF required</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: C.panel, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="radio" style={{ accentColor: C.sky }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Peritoneal Dialysis (Home)</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>CAPD 4x/day or APD overnight</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: C.panel, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="radio" style={{ accentColor: C.sky }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Home Hemodialysis</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>5-6x/week, shorter sessions &middot; Partner training needed</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: C.panel, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="radio" style={{ accentColor: C.sky }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Pre-emptive Transplant</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>Live or deceased donor &middot; Evaluation pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HEMODIALYSIS ─── */}
          {tab === 'hemodialysis' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Hemodialysis Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Session</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Access', value: 'AVF Left Forearm', status: 'Functioning', color: C.green },
                      { label: 'Blood Flow Rate', value: '300 mL/min', status: 'Adequate', color: C.green },
                      { label: 'Dialysate Flow', value: '500 mL/min', status: 'Standard', color: C.green },
                      { label: 'Ultrafiltration', value: '2.0 L', status: 'Target achieved', color: C.green },
                      { label: 'Kt/V', value: '1.4', status: 'Adequate (>1.2)', color: C.green },
                      { label: 'Dry Weight', value: '70 kg', status: 'Achieved', color: C.green },
                      { label: 'Predialysis BP', value: '138/78', status: 'Acceptable', color: C.amber },
                      { label: 'Postdialysis BP', value: '122/70', status: 'Normal', color: C.green },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{d.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{d.value}</div>
                        </div>
                        <span style={S.badge(d.color)}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Complications</div>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20`, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16} color={C.green} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>No complications</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>No hypotension, cramps, or access issues</div>
                      </div>
                    </div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Session History</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        <th style={{ textAlign: 'left', padding: '4px', color: C.textLight, fontWeight: 500 }}>Date</th>
                        <th style={{ textAlign: 'center', padding: '4px', color: C.textLight, fontWeight: 500 }}>UF (L)</th>
                        <th style={{ textAlign: 'center', padding: '4px', color: C.textLight, fontWeight: 500 }}>Kt/V</th>
                        <th style={{ textAlign: 'center', padding: '4px', color: C.textLight, fontWeight: 500 }}>Pre-BP</th>
                        <th style={{ textAlign: 'center', padding: '4px', color: C.textLight, fontWeight: 500 }}>Post-BP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { d: '2026-07-09', uf: '2.0', ktv: '1.4', pre: '138/78', post: '122/70' },
                        { d: '2026-07-07', uf: '2.2', ktv: '1.3', pre: '142/82', post: '128/72' },
                        { d: '2026-07-04', uf: '1.8', ktv: '1.4', pre: '136/76', post: '120/68' },
                        { d: '2026-07-02', uf: '2.1', ktv: '1.3', pre: '140/80', post: '124/70' },
                      ].map(s => (
                        <tr key={s.d} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '4px', fontWeight: 600, color: C.navy }}>{s.d}</td>
                          <td style={{ textAlign: 'center', padding: '4px' }}>{s.uf}</td>
                          <td style={{ textAlign: 'center', padding: '4px', color: parseFloat(s.ktv) >= 1.2 ? C.green : C.red }}>{s.ktv}</td>
                          <td style={{ textAlign: 'center', padding: '4px' }}>{s.pre}</td>
                          <td style={{ textAlign: 'center', padding: '4px' }}>{s.post}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── PERITONEAL DIALYSIS ─── */}
          {tab === 'pd' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Peritoneal Dialysis Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PD Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'PD Modality', value: 'CAPD', status: 'Active', color: C.green },
                      { label: 'Exchange Schedule', value: '4 exchanges/day', status: 'On track', color: C.green },
                      { label: 'Dwell Time', value: '4-6 hours', status: 'Adequate', color: C.green },
                      { label: 'Ultrafiltration', value: '800 mL/24h', status: 'Adequate', color: C.green },
                      { label: 'Residual Renal Function', value: '200 mL/24h', status: 'Declining', color: C.amber },
                      { label: 'Peritonitis Episodes', value: '0 (last 12 months)', status: 'Excellent', color: C.green },
                      { label: 'Exit-Site Condition', value: 'Clean, no erythema', status: 'Good', color: C.green },
                      { label: 'PD Catheter', value: 'Tenckhoff coiled', status: 'Functioning', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{p.value}</div>
                        </div>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PD Adequacy</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Weekly Kt/V</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>2.1 (Target: ≥1.7) — Adequate clearance</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Creatinine Clearance</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>62 L/wk/1.73m² (Target: ≥50) — Adequate</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>PET Test</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>High-average transporter — Suitable for CAPD</div>
                    </div>
                    <div style={S.divider} />
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button style={{ flex: 1, ...S.btn(C.sky) }}>CAPD</button>
                      <button style={{ flex: 1, ...S.btnO }}>APD</button>
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight, textAlign: 'center' }}>Toggle between CAPD and APD modality</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ACCESS ─── */}
          {tab === 'access' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Access Intelligence Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Access</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Type', value: 'AVF', status: 'Functioning', color: C.green },
                      { label: 'Location', value: 'Left Forearm', status: 'Mature', color: C.green },
                      { label: 'Flow Rate', value: '600 mL/min', status: 'Adequate', color: C.green },
                      { label: 'Date Created', value: 'Nov 2023', status: '2.5 years', color: C.green },
                      { label: 'Last Doppler', value: 'Jun 2026', status: 'Normal', color: C.green },
                    ].map(a => (
                      <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{a.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{a.value}</div>
                        </div>
                        <span style={S.badge(a.color)}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Access Complications</div>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16} color={C.green} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>No Complications</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>No stenosis, thrombosis, aneurysm, or infection</div>
                      </div>
                    </div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Access Monitoring</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { exam: 'Physical Exam', freq: 'Weekly', next: '2026-07-12', color: C.green },
                      { exam: 'Doppler Ultrasound', freq: 'Quarterly', next: '2026-09-15', color: C.amber },
                      { exam: 'Flow Measurement', freq: 'Monthly', next: '2026-08-01', color: C.amber },
                      { exam: 'Recirculation Study', freq: 'As needed', next: '—', color: C.textLight },
                    ].map(m => (
                      <div key={m.exam} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ flex: 1, color: C.navy }}>{m.exam}</span>
                        <span style={{ color: C.textLight }}>{m.freq}</span>
                        <span style={{ color: C.navy, fontWeight: 600 }}>{m.next}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TRANSPLANT ─── */}
          {tab === 'transplant' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Transplant Center</div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.green}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Post-Transplant &mdash; Deceased Donor 2023</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Graft: Functioning &middot; No Rejection &middot; No Infections</div>
                  </div>
                  <span style={S.pill(C.green)}>Functioning</span>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Graft Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Creatinine', value: '120 μmol/L', status: 'Stable', color: C.green },
                      { label: 'eGFR', value: '52 mL/min', status: 'Adequate', color: C.green },
                      { label: 'Immunosuppression', value: 'Tac/MMF/Pred', status: 'Therapeutic', color: C.green },
                      { label: 'Tac Level', value: '8.2 ng/mL', status: 'Therapeutic', color: C.green },
                      { label: 'Donor Type', value: 'Deceased Donor', status: '2023', color: C.amber },
                      { label: 'Rejection Episodes', value: '0', status: 'None', color: C.green },
                      { label: 'Infections', value: '0', status: 'None', color: C.green },
                    ].map(t => (
                      <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{t.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{t.value}</div>
                        </div>
                        <span style={S.badge(t.color)}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Monitoring Schedule</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Tacrolimus Level', freq: 'Weekly', next: '2026-07-16', color: C.amber },
                      { item: 'Creatinine + eGFR', freq: 'Monthly', next: '2026-08-01', color: C.green },
                      { item: 'Urine Protein', freq: 'Monthly', next: '2026-08-01', color: C.amber },
                      { item: 'BK Virus PCR', freq: 'Quarterly', next: '2026-09-15', color: C.amber },
                      { item: 'EBV PCR', freq: 'Quarterly', next: '2026-09-15', color: C.amber },
                      { item: 'CMV PCR', freq: 'Monthly (6mo)', next: '2026-08-01', color: C.amber },
                    ].map(s => (
                      <div key={s.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ flex: 1, color: C.navy }}>{s.item}</span>
                        <span style={{ color: C.textLight }}>{s.freq}</span>
                        <span style={S.badge(s.color)}>{s.next}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FLUIDS ─── */}
          {tab === 'fluids' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Fluid Intelligence Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Precision fluid management in CKD — overload prediction, dry weight optimization, interdialytic monitoring.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Input</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Weight (kg)</label>
                      <input style={S.input} placeholder="e.g. 72.5" />
                    </div>
                    <div>
                      <label style={S.label}>Urine Output (mL)</label>
                      <input style={S.input} placeholder="e.g. 800" />
                    </div>
                    <div>
                      <label style={S.label}>Fluid Intake (mL)</label>
                      <input style={S.input} placeholder="e.g. 1500" />
                    </div>
                    <div>
                      <label style={S.label}>Edema</label>
                      <select style={S.sel}><option>None</option><option>Mild</option><option>Moderate</option><option>Severe</option></select>
                    </div>
                    <div>
                      <label style={S.label}>Dyspnea (1-10)</label>
                      <input style={S.input} type="number" min={1} max={10} placeholder="e.g. 3" />
                    </div>
                    <div>
                      <label style={S.label}>BP (mmHg)</label>
                      <input style={S.input} placeholder="e.g. 126/74" />
                    </div>
                    <button style={S.btn(C.sky)}>Record Daily Input</button>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fluid Status</div>
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.green}08`, border: `1px solid ${C.green}20`, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}><span style={{ fontWeight: 600, color: C.navy }}>Dry Weight:</span> <span style={{ color: C.text }}>70.0 kg</span></div>
                    <span style={S.badge(C.green)}>Achieved</span>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}><span style={{ fontWeight: 600, color: C.navy }}>Interdialytic Weight Gain:</span> <span style={{ color: C.text }}>+1.8 kg (2.5% BW)</span></div>
                    <span style={S.badge(C.amber)}>Review</span>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Overload Prediction</div>
                  <div style={{ padding: '10px 14px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>Fluid accumulation rate</span>
                      <span style={{ fontWeight: 600, color: C.amber }}>0.35 kg/day</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>Predicted overload in</span>
                      <span style={{ fontWeight: 600, color: C.amber }}>3 days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Risk of pulmonary edema</span>
                      <span style={S.badge(C.amber)}>Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── NUTRITION ─── */}
          {tab === 'nutrition' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Nutrition Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Dietary Restrictions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Protein Restriction', value: '0.8 g/kg/day', status: 'Moderate', color: C.amber },
                      { label: 'Potassium Restriction', value: '<3,000 mg/day', status: 'Active', color: C.amber },
                      { label: 'Phosphate Restriction', value: '<1,000 mg/day', status: 'Active', color: C.amber },
                      { label: 'Sodium Restriction', value: '<2,000 mg/day', status: 'Active', color: C.amber },
                      { label: 'Fluid Restriction', value: '1.5 L/day', status: 'Active', color: C.amber },
                      { label: 'Calorie Target', value: '30 kcal/kg/day', status: 'On track', color: C.green },
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Dietitian Reviews</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { date: '2026-07-01', by: 'Ms. Wanjiku (Renal Dietitian)', note: 'Adjusted protein target, reinforced K+ and Phos limits', plan: 'Review in 1 month' },
                      { date: '2026-05-15', by: 'Ms. Wanjiku (Renal Dietitian)', note: 'Fluid restriction education, daily weight monitoring', plan: 'Home monitoring' },
                      { date: '2026-03-20', by: 'Ms. Wanjiku (Renal Dietitian)', note: 'Initial renal diet counselling, meal plan provided', plan: 'Follow-up in 6 weeks' },
                    ].map(r => (
                      <div key={r.date} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ fontWeight: 600, color: C.navy }}>{r.date}</div>
                        <div style={{ color: C.textLight }}>{r.by}</div>
                        <div style={{ color: C.text, marginTop: 2 }}>{r.note}</div>
                        <div style={{ color: C.sky, marginTop: 2 }}>{r.plan}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PREGNANCY ─── */}
          {tab === 'pregnancy' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Pregnancy in CKD</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Preconception Counselling</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Risk classification completed', done: true },
                      { item: 'Medication review (ACEi/ARB → alternatives)', done: true },
                      { item: 'Renal function baseline', done: true },
                      { item: 'BP optimization', done: true },
                      { item: 'Fetal surveillance plan established', done: false },
                      { item: 'Obstetric nephrology referral', done: false },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        {c.done ? <CheckCircle size={14} color={C.green} /> : <XCircle size={14} color={C.textLight} />}
                        <span style={{ color: c.done ? C.navy : C.textLight }}>{c.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Risk Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Risk Class: Moderate-High</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>CKD Stage 3B with Proteinuria — Close monitoring required</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: C.textLight }}>BP target:</span><span style={{ color: C.navy }}>{'<130/80'}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: C.textLight }}>Proteinuria monitoring:</span><span style={{ color: C.navy }}>Monthly</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: C.textLight }}>eGFR monitoring:</span><span style={{ color: C.navy }}>Every 8 weeks</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: C.textLight }}>Fetal ultrasound:</span><span style={{ color: C.navy }}>Growth scans q4wk</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HOME MONITORING ─── */}
          {tab === 'home-monitoring' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Home Monitoring Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient-Submitted Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Blood Pressure', value: '128/76 mmHg', trend: 'Stable', color: C.green },
                      { label: 'Weight', value: '72.4 kg', trend: '+0.3 kg this week', color: C.amber },
                      { label: 'Urine Output', value: '200 mL/24h', trend: 'Declining', color: C.amber },
                      { label: 'Blood Sugar', value: '6.8 mmol/L', trend: 'Fasting — stable', color: C.green },
                      { label: 'Symptoms', value: 'Mild fatigue, no dyspnea', trend: 'Improving', color: C.green },
                      { label: 'Dialysis Logs', value: '3 sessions completed', trend: '100% adherence', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{p.value}</div>
                        </div>
                        <span style={S.pill(p.color)}>{p.trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Trends & Alerts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16} color={C.green} />
                      <div><div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>BP Trend</div><div style={{ fontSize: 10, color: C.textLight }}>Stable at target — Last 7 days: 125-130/72-78 mmHg</div></div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={16} color={C.amber} />
                      <div><div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Weight Alert</div><div style={{ fontSize: 10, color: C.textLight }}>Weight increased 0.3 kg in 24h — Monitor for fluid overload</div></div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16} color={C.green} />
                      <div><div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Adherence</div><div style={{ fontSize: 10, color: C.textLight }}>Dialysis adherence: 100% this week — No missed sessions</div></div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.red}08`, border: `1px solid ${C.red}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={16} color={C.red} />
                      <div><div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Urine Output Alert</div><div style={{ fontSize: 10, color: C.textLight }}>Urine output declining — 200 mL/24h, discuss with nephrologist</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {tab === 'team' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Multidisciplinary Team</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal Care Team</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { role: 'Nephrologist', name: 'Dr. Kamau', contact: 'Ext. 3101', status: 'Available', color: C.green },
                      { role: 'Primary Care', name: 'Dr. Njoroge', contact: 'Ext. 2102', status: 'Available', color: C.green },
                      { role: 'Dialysis Nurse', name: 'Sr. Atieno', contact: 'Ext. 3402', status: 'Busy', color: C.amber },
                      { role: 'Renal Pharmacist', name: 'Mr. Otieno', contact: 'Ext. 5201', status: 'Available', color: C.green },
                      { role: 'Renal Dietitian', name: 'Ms. Wanjiku', contact: 'Ext. 4501', status: 'Available', color: C.green },
                      { role: 'Vascular Surgeon', name: 'Dr. Mwangi', contact: 'Ext. 4402', status: 'In Theatre', color: C.amber },
                      { role: 'Transplant Surgeon', name: 'Dr. Ochieng', contact: 'Ext. 3406', status: 'Available', color: C.green },
                      { role: 'Social Worker', name: 'Ms. Nyambura', contact: 'Ext. 6301', status: 'Busy', color: C.amber },
                      { role: 'Psychologist', name: 'Dr. Chebet', contact: 'Ext. 6302', status: 'Available', color: C.green },
                      { role: 'Palliative Care', name: 'Dr. Wambui', contact: 'Ext. 6303', status: 'On Call', color: C.amber },
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recent Communications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { from: 'Dr. Kamau (Nephrology)', msg: 'Reviewed Mary Wanjiku — eGFR stable at 38, continue current management. Discuss dialysis planning at next visit.', time: '2 hrs ago' },
                      { from: 'Sr. Atieno (Dialysis)', msg: 'AVF flow 600 mL/min, Kt/V 1.4. No complications. Patient tolerating HD well.', time: '4 hrs ago' },
                      { from: 'Mr. Otieno (Pharmacy)', msg: 'Medication reconciliation complete. ACEi + SGLT2i + ESA on track. K+ stable.', time: '1 day ago' },
                      { from: 'Ms. Wanjiku (Dietitian)', msg: 'Dietary review completed. Patient compliant with K+, Phos, and fluid restrictions.', time: '3 days ago' },
                    ].map(c => (
                      <div key={c.from} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>{c.from} · {c.time}</div>
                        <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>{c.msg}</div>
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Upcoming MDT Discussions</div>
                  {[
                    { p: 'Mary Wanjiku', d: '2026-07-15', t: 'Dialysis planning, AVF maturation', pr: 'High' },
                    { p: 'Samuel Ochieng', d: '2026-07-15', t: 'AVF maturation failure, alternative access', pr: 'High' },
                    { p: 'Grace Njeri', d: '2026-07-22', t: 'Transplant evaluation progress', pr: 'Medium' },
                    { p: 'John Kamau', d: '2026-07-22', t: 'Rapid eGFR decline, SGLT2i optimization', pr: 'Medium' },
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
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Renal Registry</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Activity size={20} color={C.sky} />
                  <div style={S.statValue}>142</div>
                  <div style={S.statLabel}>Total CKD Patients</div>
                </div>
                <div style={S.statCard}>
                  <Wind size={20} color={C.purple} />
                  <div style={S.statValue}>28</div>
                  <div style={S.statLabel}>On Dialysis</div>
                </div>
                <div style={S.statCard}>
                  <Heart size={20} color={C.green} />
                  <div style={S.statValue}>12</div>
                  <div style={S.statLabel}>Transplanted</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={20} color={C.amber} />
                  <div style={S.statValue}>8</div>
                  <div style={S.statLabel}>AKI (30d)</div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                  <input style={{ ...S.input, width: 200 }} type="text" placeholder="Search registry..." />
                  <select style={S.sel}>
                    <option>All Stages</option>
                    <option>Stage 1-2</option>
                    <option>Stage 3</option>
                    <option>Stage 4-5</option>
                    <option>Dialysis</option>
                    <option>Transplant</option>
                  </select>
                  <button style={S.btn(C.sky)}><Search size={14} /> Search</button>
                  <button style={S.btn(C.green)}><Plus size={14} /> Register</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>eGFR</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Stage</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Albuminuria</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Cause</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 'Mary Wanjiku', e: '38', s: 'G3b', a: 'A3', c: 'DKD', st: 'Active' },
                      { n: 'John Kamau', e: '45', s: 'G3a', a: 'A2', c: 'DKD + HTN', st: 'Active' },
                      { n: 'Samuel Ochieng', e: '22', s: 'G4', a: 'A3', c: 'HTN', st: 'Active' },
                      { n: 'Grace Njeri', e: '12', s: 'G5', a: 'A3', c: 'GN', st: 'Dialysis' },
                      { n: 'Peter Otieno', e: '8', s: 'G5', a: 'A3', c: 'DKD', st: 'Dialysis' },
                    ].map(p => (
                      <tr key={p.n} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600, color: C.navy }}>{p.n}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: parseFloat(p.e) < 30 ? C.red : parseFloat(p.e) < 45 ? C.amber : C.green, fontWeight: 600 }}>{p.e}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.pill(p.s.includes('4') || p.s.includes('5') ? C.red : p.s.includes('3') ? C.amber : C.green)}>{p.s}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(p.a === 'A3' ? C.red : p.a === 'A2' ? C.amber : C.green)}>{p.a}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{p.c}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(statusColor(p.st))}>{p.st}</span></td>
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
                <div style={S.statCard}>
                  <TrendingUp size={20} color={C.red} />
                  <div style={S.statValue}>-3.1</div>
                  <div style={S.statLabel}>eGFR Decline (mL/min/yr)</div>
                </div>
                <div style={S.statCard}>
                  <TrendingUp size={20} color={C.green} />
                  <div style={S.statValue}>68%</div>
                  <div style={S.statLabel}>BP &lt;130/80</div>
                </div>
                <div style={S.statCard}>
                  <TrendingUp size={20} color={C.amber} />
                  <div style={S.statValue}>72%</div>
                  <div style={S.statLabel}>ACEi/ARB Use</div>
                </div>
                <div style={S.statCard}>
                  <TrendingUp size={20} color={C.purple} />
                  <div style={S.statValue}>85%</div>
                  <div style={S.statLabel}>AVF Use at HD Start</div>
                </div>
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
                      { ind: 'eGFR Decline <3 mL/min/yr', cur: '-3.1', tgt: '<3.0', prog: 48, st: 'Needs Attention' },
                      { ind: 'BP Control (<130/80)', cur: '68%', tgt: '75%', prog: 68, st: 'Fair' },
                      { ind: 'Albuminuria Monitoring (annual)', cur: '82%', tgt: '90%', prog: 82, st: 'Fair' },
                      { ind: 'ACEi/ARB Therapy (if proteinuric)', cur: '72%', tgt: '85%', prog: 72, st: 'Fair' },
                      { ind: 'SGLT2i Use (if eGFR ≥25)', cur: '58%', tgt: '70%', prog: 58, st: 'Needs Attention' },
                      { ind: 'Anemia Management (Hb 10-11.5)', cur: '76%', tgt: '85%', prog: 76, st: 'Fair' },
                      { ind: 'MBD Monitoring (Ca/Phos/PTH)', cur: '80%', tgt: '90%', prog: 80, st: 'Fair' },
                      { ind: 'AVF at HD Initiation', cur: '85%', tgt: '90%', prog: 85, st: 'Good' },
                      { ind: 'Kt/V ≥1.2 (HD patients)', cur: '92%', tgt: '95%', prog: 92, st: 'Good' },
                      { ind: 'Peritonitis Rate (PD)', cur: '0.25', tgt: '<0.5', prog: 75, st: 'Good' },
                      { ind: 'Transplant Survival (1yr)', cur: '95%', tgt: '95%', prog: 100, st: 'Excellent' },
                      { ind: 'Mortality on Dialysis', cur: '12%', tgt: '<15%', prog: 80, st: 'Good' },
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

          {/* ─── PORTAL ─── */}
          {tab === 'portal' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Patient Portal</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Kidney Status Overview</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { icon: Filter, label: 'Kidney Function', value: 'eGFR 38 mL/min — Stage 3B', color: C.amber },
                      { icon: Bell, label: 'Medication Reminders', value: '3 medications due today', color: C.sky },
                      { icon: Droplets, label: 'Fluid Allowance', value: '1.5 L/day — Used 0.8 L', color: C.green },
                      { icon: Apple, label: 'Diet Recommendations', value: 'Low K+, Low Phos, Low Na', color: C.amber },
                      { icon: FileText, label: 'Lab Results Available', value: 'CMP, CBC — Updated today', color: C.green },
                      { icon: Wind, label: 'Dialysis Sessions', value: 'Next session: Mon 8:00 AM', color: C.sky },
                      { icon: Calendar, label: 'Appointments', value: 'Nephrology: Jul 15, 2026', color: C.amber },
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
                        { title: 'Understanding CKD Stages', type: 'PDF', read: true },
                        { title: 'Dietary Guidelines for CKD', type: 'PDF', read: true },
                        { title: 'Medication Adherence Guide', type: 'Video', read: false },
                        { title: 'When to Call Your Nephrologist', type: 'PDF', read: false },
                        { title: 'Dialysis Modality Options', type: 'Interactive', read: false },
                        { title: 'Warning Symptoms of Fluid Overload', type: 'PDF', read: true },
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
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Warning Symptoms</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { sym: 'Shortness of breath', urg: 'Call clinic same day', color: C.red },
                        { sym: 'Weight gain >2 kg in 2 days', urg: 'Call clinic same day', color: C.red },
                        { sym: 'Leg swelling increasing', urg: 'Call within 24h', color: C.amber },
                        { sym: 'Blood in urine', urg: 'Call within 24h', color: C.amber },
                        { sym: 'Persistent nausea/vomiting', urg: 'Call clinic same day', color: C.red },
                        { sym: 'Chest pain or palpitations', urg: 'Call 911', color: C.red },
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

        </main>
      </div>
    </div>
  )
}
