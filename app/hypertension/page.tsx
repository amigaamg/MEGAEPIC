'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, Eye, Brain, Bone, Filter, HeartPulse, Globe, type LucideIcon } from 'lucide-react'
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

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Disease Dashboard', icon: Activity },
  { id: 'snapshot', label: 'CV Snapshot', icon: HeartPulse },
  { id: 'timeline', label: 'BP Timeline', icon: Clock },
  { id: 'bp-intelligence', label: 'BP Intelligence', icon: Monitor },
  { id: 'phenotype', label: 'Phenotype Engine', icon: Brain },
  { id: 'risk', label: 'Cardiovascular Risk', icon: AlertTriangle },
  { id: 'heart-protection', label: 'Heart Protection', icon: Heart },
  { id: 'brain-protection', label: 'Brain Protection', icon: Brain },
  { id: 'kidney-protection', label: 'Kidney Protection', icon: Filter },
  { id: 'eye-protection', label: 'Eye Protection', icon: Eye },
  { id: 'pad', label: 'Peripheral Arterial Disease', icon: Bone },
  { id: 'medications', label: 'Medication Intelligence', icon: Pill },
  { id: 'resistant', label: 'Resistant HTN', icon: Shield },
  { id: 'secondary', label: 'Secondary HTN', icon: Search },
  { id: 'lifestyle', label: 'Lifestyle Intelligence', icon: Activity },
  { id: 'home', label: 'Home Monitoring', icon: Heart },
  { id: 'goals', label: 'Goal Engine', icon: CheckCircle },
  { id: 'annual', label: 'Annual Review', icon: Calendar },
  { id: 'registry', label: 'Registry', icon: FileText },
  { id: 'quality', label: 'Quality Indicators', icon: TrendingUp },
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
  { label: 'Heart Failure', href: '/hf' },
  { label: 'CKD', href: '/ckd' },
  { label: 'Respiratory', href: '/respiratory' },
  { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Oncology', href: '/oncology' },
  { label: 'Neurology', href: '/neurology' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

export default function HypertensionWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Hypertension &amp; Cardiovascular Risk Intelligence Center &mdash; Volume XI-B</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>HT</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Hypertension</div>
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Hypertension &amp; Cardiovascular Risk Intelligence Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>A Lifelong Blood Pressure, Target-Organ Damage &amp; Risk Reduction Operating System</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.red)}>Very High (8%)</span>
                  <span style={S.pill(C.amber)}>High (22%)</span>
                  <span style={S.pill(C.green)}>Controlled (45%)</span>
                </div>
              </div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.green}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Mary Atieno / 57 Years / Female</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Primary Hypertension &middot; Duration: 14 Years &middot; Current: Controlled &middot; Overall CV Risk: Very High &middot; Last Review: 1 Month Ago</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.green)}>Controlled</span>
                    <span style={S.badge(C.red)}>Very High Risk</span>
                  </div>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'Total HTN Patients', value: '1,247', icon: Users, color: C.sky },
                  { label: 'Controlled BP (%)', value: '68%', icon: CheckCircle, color: C.green },
                  { label: 'Mean SBP', value: '132 mmHg', icon: TrendingUp, color: C.amber },
                  { label: 'Mean DBP', value: '82 mmHg', icon: TrendingUp, color: C.amber },
                  { label: 'Resistant HTN', value: '156', icon: Shield, color: C.red },
                  { label: 'LVH Patients', value: '89', icon: Heart, color: C.amber },
                  { label: 'CKD with HTN', value: '214', icon: Filter, color: C.amber },
                  { label: 'Stroke History', value: '78', icon: Brain, color: C.red },
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
                    { title: 'BP Above Target', patient: 'Peter Ochieng', detail: 'Sustained SBP >145 mmHg on 3 readings', color: C.red },
                    { title: 'Missed Medication', patient: 'Grace Njeri', detail: 'Amlodipine not taken for 5 days', color: C.amber },
                    { title: 'eGFR Decline Detected', patient: 'Samuel Kiprop', detail: 'eGFR dropped from 68 to 52 in 3 months', color: C.red },
                  ].map(a => (
                    <div key={a.title} style={{ padding: '10px 14px', borderRadius: 8, background: `${a.color}08`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AlertTriangle size={18} color={a.color} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{a.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{a.patient} &mdash; {a.detail}</div>
                      </div>
                      <button style={S.btn(a.color)}>Review</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Quick Actions</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Patient Assessment</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Medication Review</button>
                  <button style={S.btn(C.purple)}><Monitor size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> BP Review</button>
                  <button style={S.btnO}><Heart size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Home Monitoring Review</button>
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
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Mary Atieno / 57 Years / Female</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Primary Hypertension &middot; Duration: 14 Years &middot; Current: Controlled &middot; Overall CV Risk: Very High</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.green)}>Controlled</span>
                    <span style={S.badge(C.amber)}>Very High Risk</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Cardiovascular Snapshot</div>
              <div style={S.grid4}>
                {[
                  { label: "Today's BP", value: '126/76', status: 'Controlled', color: C.green },
                  { label: 'Target BP', value: '<130/80', status: 'On Target', color: C.green },
                  { label: 'Home BP Avg', value: '124/74', status: 'Controlled', color: C.green },
                  { label: 'Pulse', value: '68 bpm', status: 'Normal', color: C.green },
                  { label: 'BMI', value: '29 kg/m²', status: 'Overweight', color: C.amber },
                  { label: 'Waist', value: '96 cm', status: 'Elevated', color: C.amber },
                  { label: 'LDL', value: '1.5 mmol/L', status: 'At Target', color: C.green },
                  { label: 'eGFR', value: '65 mL/min', status: 'Stage G2', color: C.amber },
                  { label: 'Albuminuria', value: 'Negative', status: 'Normal', color: C.green },
                  { label: 'LVH', value: 'Mild', status: 'Present', color: C.amber },
                  { label: 'Risk Category', value: 'Very High', status: 'Elevated', color: C.red },
                  { label: 'Last Review', value: '1 Month', status: 'Current', color: C.green },
                ].map(m => (
                  <div key={m.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${m.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{m.value}</div>
                    <div style={{ marginTop: 6 }}><span style={S.pill(m.color)}>{m.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TIMELINE ─── */}
          {tab === 'timeline' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Lifetime BP Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { year: '2025', title: 'Optimized Control', desc: 'Amlodipine + Perindopril maintained, BP 126/76 achieved', icon: CheckCircle, color: C.green },
                  { year: '2024', title: 'COVID Era — Poor Control', desc: 'SBP 150-160 during pandemic, medication adherence declined', icon: AlertTriangle, color: C.red },
                  { year: '2023', title: 'HCTZ Stopped', desc: 'Thiazide discontinued due to hyponatremia, regimen simplified', icon: XCircle, color: C.amber },
                  { year: '2021', title: 'ACE Inhibitor Added', desc: 'Perindopril 5 mg initiated for albuminuria and better BP control', icon: Plus, color: C.sky },
                  { year: '2015', title: 'Amlodipine Up-Titrated', desc: 'Dose increased to 10 mg for persistent HTN, BP 138/86 achieved', icon: Pill, color: C.sky },
                  { year: '2014', title: 'Lifestyle Modification', desc: 'Structured DASH diet and walking program initiated, limited effect', icon: Activity, color: C.amber },
                  { year: '2012', title: 'Hypertension Diagnosis', desc: 'BP 164/102 on initial presentation, Amlodipine 5 mg started', icon: Heart, color: C.red },
                ].map((e, i) => (
                  <div key={e.year} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${e.color}15`, border: `2px solid ${e.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <e.icon size={14} color={e.color} />
                      </div>
                      {i < 6 && <div style={{ width: 2, height: '100%', background: C.border, flex: 1 }} />}
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
                      <option>BP Change</option>
                      <option>Medication Change</option>
                      <option>Hospitalization</option>
                      <option>Complication</option>
                      <option>Stable Follow-up</option>
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

          {/* ─── BP INTELLIGENCE ─── */}
          {tab === 'bp-intelligence' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Blood Pressure Intelligence Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Comprehensive BP assessment across office, home, and ambulatory monitoring domains.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Office BP</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Systolic', value: '126 mmHg', color: C.green },
                      { label: 'Diastolic', value: '76 mmHg', color: C.green },
                      { label: 'Heart Rate', value: '68 bpm', color: C.green },
                      { label: 'Position', value: 'Seated, right arm', color: C.textLight },
                      { label: 'Cuff Size', value: 'Standard', color: C.textLight },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{i.label}</span>
                        <span style={{ color: i.color, fontWeight: 600 }}>{i.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Home BP (7-Day Average)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Morning SBP', value: '124 mmHg', color: C.green },
                      { label: 'Morning DBP', value: '74 mmHg', color: C.green },
                      { label: 'Evening SBP', value: '127 mmHg', color: C.green },
                      { label: 'Evening DBP', value: '76 mmHg', color: C.green },
                      { label: 'Compliance', value: '92%', color: C.green },
                      { label: 'Readings (7d)', value: '18', color: C.green },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{i.label}</span>
                        <span style={{ fontWeight: 600, color: i.color }}>{i.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Ambulatory BP Monitoring (ABPM)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Mean Daytime SBP', value: '128 mmHg', color: C.green },
                      { label: 'Mean Daytime DBP', value: '78 mmHg', color: C.green },
                      { label: 'Mean Nighttime SBP', value: '118 mmHg', color: C.green },
                      { label: 'Mean Nighttime DBP', value: '68 mmHg', color: C.green },
                      { label: 'Dipping Status', value: 'Normal Dipper', color: C.green },
                      { label: 'Morning Surge', value: '12 mmHg', color: C.amber },
                      { label: '24-hr Mean SBP', value: '125 mmHg', color: C.green },
                      { label: '24-hr Mean DBP', value: '75 mmHg', color: C.green },
                      { label: 'Valid Readings', value: '92%', color: C.green },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{i.label}</span>
                        <span style={{ fontWeight: 600, color: i.color }}>{i.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>BP Variability</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Visit-to-Visit SBP SD', value: '8.2 mmHg', color: C.amber },
                      { label: 'Visit-to-Visit DBP SD', value: '5.1 mmHg', color: C.green },
                      { label: '24-hr SBP SD', value: '11.4 mmHg', color: C.amber },
                      { label: 'Nocturnal SBP Fall', value: '12%', color: C.green },
                      { label: 'Variability Category', value: 'Moderate', color: C.amber },
                      { label: 'cSBP', value: '118 mmHg', color: C.green },
                      { label: 'Central PP', value: '42 mmHg', color: C.amber },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{i.label}</span>
                        <span style={{ fontWeight: 600, color: i.color }}>{i.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PHENOTYPE ─── */}
          {tab === 'phenotype' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Hypertension Phenotype Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Primary (Essential)', status: true, color: C.green },
                      { label: 'White Coat', status: false, color: C.textLight },
                      { label: 'Masked', status: 'Possible', color: C.amber },
                      { label: 'Resistant', status: false, color: C.textLight },
                      { label: 'Isolated Systolic', status: true, color: C.green },
                      { label: 'Secondary', status: false, color: C.textLight },
                      { label: 'Labile', status: false, color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${p.status === true ? C.sky : C.border}`, background: p.status === true ? C.sky : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.status === true && <CheckCircle size={12} color={C.white} />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.navy }}>{p.label}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: typeof p.status === 'string' ? C.amber : p.status ? C.green : C.textLight }}>{p.status === true ? 'Yes' : typeof p.status === 'string' ? p.status : 'No'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Primary Hypertension, Isolated Systolic</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Long-standing primary hypertension with isolated systolic component. Possible masked hypertension under investigation. No evidence of resistant or secondary hypertension. Labile component not present.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Update Phenotype</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>Phenotype</label>
                        <select style={S.sel}><option>Primary Essential</option><option>White Coat</option><option>Masked</option><option>Resistant</option><option>Secondary</option></select>
                      </div>
                      <div>
                        <label style={S.label}>BP Pattern</label>
                        <select style={S.sel}><option>Isolated Systolic</option><option>Systolic-Diastolic</option><option>Isolated Diastolic</option><option>Labile</option></select>
                      </div>
                    </div>
                    <button style={S.btn(C.sky)}>Update Classification</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── RISK ─── */}
          {tab === 'risk' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Cardiovascular Risk Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Quantified risk assessment across multiple validated risk calculators.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Risk Factors</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Age', value: '57 years' },
                      { label: 'Sex', value: 'Female' },
                      { label: 'Systolic BP', value: '126 mmHg (treated)' },
                      { label: 'Diabetes', value: 'No' },
                      { label: 'Smoking', value: 'Stopped 5 years ago' },
                      { label: 'LDL Cholesterol', value: '1.5 mmol/L' },
                      { label: 'CKD Stage', value: 'G2 (eGFR 65)' },
                      { label: 'Family History of CVD', value: 'Yes (father, MI age 54)' },
                      { label: 'Previous CVD', value: 'No' },
                      { label: 'Obesity', value: 'BMI 29, Waist 96 cm' },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{r.label}</span>
                        <span style={{ fontWeight: 600, color: C.navy }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Risk Results</div>
                  <div style={{ textAlign: 'center', padding: 16, background: `${C.red}08`, borderRadius: 8, border: `1px solid ${C.red}25`, marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: C.textLight }}>Current Risk Category</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.red }}>Very High</div>
                    <span style={S.badge(C.red)}>Modifiable</span>
                  </div>
                  <div style={S.grid2}>
                    {[
                      { label: '10-Year ASCVD Risk', value: '22%', color: C.red },
                      { label: 'Lifetime Risk', value: 'High', color: C.red },
                      { label: 'Stroke Risk', value: '8.5%', color: C.amber },
                      { label: 'Heart Failure Risk', value: '6.2%', color: C.amber },
                    ].map(r => (
                      <div key={r.label} style={{ padding: '10px', borderRadius: 8, background: C.panel, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>{r.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: r.color }}>{r.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ ...S.divider, margin: '12px 0' }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Calculator Selector</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={S.btn(C.sky)}>ASCVD (PCE)</button>
                    <button style={S.btnO}>SCORE2</button>
                    <button style={S.btnO}>WHO</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HEART PROTECTION ─── */}
          {tab === 'heart-protection' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>XI-B1 — Heart Protection</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Target-organ assessment and protection for hypertensive heart disease.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cardiac Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'ECG', value: 'Normal sinus rhythm', status: 'Normal', color: C.green },
                      { label: 'Echocardiogram', value: 'LVH, EF 55%', status: 'Mild LVH', color: C.amber },
                      { label: 'LV Hypertrophy', value: 'Mild (12 mm)', status: 'Present', color: C.amber },
                      { label: 'Heart Failure', value: 'No', status: 'Absent', color: C.green },
                      { label: 'CAD', value: 'No', status: 'Absent', color: C.green },
                      { label: 'Arrhythmias', value: 'PACs', status: 'Benign', color: C.green },
                      { label: 'Aortic Root', value: '3.2 cm', status: 'Normal', color: C.green },
                      { label: 'Left Atrial Size', value: '38 mm', status: 'Normal', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Echocardiogram Trend</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        { label: 'LVEF Over Last 4 Echos', vals: ['58%', '56%', '55%', '55%'], color: C.green },
                        { label: 'LV Mass Index Trend', vals: ['98 g/m²', '102 g/m²', '108 g/m²', '112 g/m²'], color: C.amber },
                        { label: 'E/A Ratio Trend', vals: ['0.9', '0.8', '0.8', '0.8'], color: C.amber },
                      ].map(t => (
                        <div key={t.label}>
                          <div style={{ fontSize: 10, color: C.textLight, marginBottom: 6 }}>{t.label}</div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 48 }}>
                            {t.vals.map((v, i) => {
                              const h = 16 + i * 6
                              return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{ fontSize: 9, color: C.textLight }}>{v}</div>
                                  <div style={{ width: '80%', height: h, borderRadius: '4px 4px 0 0', background: t.color, marginTop: 4, opacity: 0.5 + i * 0.12 }} />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── BRAIN PROTECTION ─── */}
          {tab === 'brain-protection' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>XI-B2 — Brain Protection</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Cerebrovascular risk assessment and prevention in hypertension.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cerebrovascular Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Stroke', value: 'No', status: 'Absent', color: C.green },
                      { label: 'TIA', value: '2018, resolved', status: 'History', color: C.amber },
                      { label: 'Cognitive Decline', value: 'None', status: 'Normal', color: C.green },
                      { label: 'Carotid Disease', value: 'No plaque', status: 'Normal', color: C.green },
                      { label: 'Carotid IMT', value: '0.8 mm', status: 'Normal', color: C.green },
                      { label: 'MRI Brain', value: 'Normal', status: 'No WMH', color: C.green },
                      { label: 'Functional Recovery', value: 'N/A', status: 'Not applicable', color: C.textLight },
                      { label: 'Dementia Screening', value: 'Negative', status: 'Normal', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Stroke Prevention Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { item: 'Antihypertensive therapy optimized', complete: true },
                      { item: 'Statin therapy (atorvastatin 20 mg)', complete: true },
                      { item: 'Antiplatelet therapy (aspirin 81 mg)', complete: false },
                      { item: 'Carotid ultrasound scheduled', complete: true },
                      { item: 'Smoking cessation confirmed', complete: true },
                      { item: 'AF screening (24-hr Holter)', complete: false },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        {c.complete ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.textLight} />}
                        <span style={{ color: c.complete ? C.navy : C.textLight }}>{c.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── KIDNEY PROTECTION ─── */}
          {tab === 'kidney-protection' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>XI-B3 — Kidney Protection</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Hypertensive nephropathy prevention and renal preservation.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'eGFR', value: '65 mL/min/1.73m²', status: 'Stable', color: C.green },
                      { label: 'Creatinine', value: '95 μmol/L', status: 'Normal', color: C.green },
                      { label: 'Albuminuria', value: 'Negative', status: 'Normal', color: C.green },
                      { label: 'UACR', value: '12 mg/g', status: 'Normal', color: C.green },
                      { label: 'CKD Stage', value: 'G2', status: 'Mild', color: C.amber },
                      { label: 'Potassium', value: '4.2 mmol/L', status: 'Normal', color: C.green },
                      { label: 'Nephrology', value: 'Not referred', status: 'Not indicated', color: C.green },
                      { label: 'ACEi/ARB Therapy', value: 'Perindopril 5 mg', status: 'Onboarded', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>eGFR Trend</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, padding: '12px 0' }}>
                    {[
                      { mo: 'Jan', val: 72 },
                      { mo: 'Apr', val: 70 },
                      { mo: 'Jul', val: 68 },
                      { mo: 'Oct', val: 65 },
                    ].map(m => (
                      <div key={m.mo} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: 9, color: C.textLight, marginBottom: 4 }}>{m.val}</div>
                        <div style={{ width: '60%', height: m.val * 1.4, borderRadius: '3px 3px 0 0', background: m.val > 65 ? C.green : C.amber }} />
                        <div style={{ fontSize: 8, color: C.textLight, marginTop: 4 }}>{m.mo}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 8 }}>Recorded eGFR over last 4 measurements — stable trajectory</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── EYE PROTECTION ─── */}
          {tab === 'eye-protection' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>XI-B4 — Eye Protection</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Hypertensive retinopathy surveillance and vision preservation.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Ophthalmic Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Retinopathy Grade', value: 'None', status: 'Normal', color: C.green },
                      { label: 'Fundus Imaging', value: 'Normal', status: 'No changes', color: C.green },
                      { label: 'Visual Acuity', value: '6/6 OU', status: 'Normal', color: C.green },
                      { label: 'Intraocular Pressure', value: '16 mmHg', status: 'Normal', color: C.green },
                      { label: 'Ophthalmology', value: 'Annual review', status: 'Scheduled', color: C.amber },
                      { label: 'Last Exam', value: '6 months ago', status: 'Current', color: C.green },
                      { label: 'Hypertensive Retinopathy', value: 'Keith-Wagener Grade 0', status: 'Absent', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Exam Schedule</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { exam: 'Fundoscopic Examination', freq: 'Annual', last: '6 months ago', next: '6 months', status: 'On Track' },
                      { exam: 'Visual Acuity Test', freq: 'Annual', last: '6 months ago', next: '6 months', status: 'On Track' },
                      { exam: 'Intraocular Pressure', freq: 'Annual', last: '6 months ago', next: '6 months', status: 'On Track' },
                      { exam: 'Retinal Photography', freq: 'Every 2 years', last: '6 months ago', next: '18 months', status: 'On Track' },
                    ].map(e => (
                      <div key={e.exam} style={{ padding: '8px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ fontWeight: 600, color: C.navy }}>{e.exam}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: C.textLight }}>
                          <span>{e.freq}</span>
                          <span>Last: {e.last}</span>
                          <span>Next: {e.next}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PAD ─── */}
          {tab === 'pad' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>XI-B5 — Peripheral Arterial Disease</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Peripheral vascular assessment in hypertensive vascular disease.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PAD Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Ankle-Brachial Index (ABI)', value: '1.1', status: 'Normal', color: C.green },
                      { label: 'Claudication', value: 'None', status: 'Absent', color: C.green },
                      { label: 'Limb Ischemia', value: 'None', status: 'Absent', color: C.green },
                      { label: 'Ulcers', value: 'None', status: 'Absent', color: C.green },
                      { label: 'Vascular Interventions', value: 'None', status: 'None', color: C.green },
                      { label: 'Peripheral Pulses', value: 'Palpable bilateral', status: 'Normal', color: C.green },
                      { label: 'Capillary Refill', value: '<3 seconds', status: 'Normal', color: C.green },
                      { label: 'ABI (Left)', value: '1.08', status: 'Normal', color: C.green },
                      { label: 'ABI (Right)', value: '1.12', status: 'Normal', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 120 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PAD Screening History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { date: '2026-06-15', abiR: '1.12', abiL: '1.08', symptom: 'None', risk: 'Low' },
                      { date: '2025-12-10', abiR: '1.10', abiL: '1.07', symptom: 'None', risk: 'Low' },
                      { date: '2025-06-05', abiR: '1.14', abiL: '1.10', symptom: 'None', risk: 'Low' },
                      { date: '2024-12-01', abiR: '1.09', abiL: '1.06', symptom: 'None', risk: 'Low' },
                    ].map(s => (
                      <div key={s.date} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{s.date}</span>
                        <span style={{ color: C.text }}>R: {s.abiR}</span>
                        <span style={{ color: C.text }}>L: {s.abiL}</span>
                        <span style={{ color: C.textLight }}>{s.symptom}</span>
                        <span style={S.badge(C.green)}>{s.risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MEDICATIONS ─── */}
          {tab === 'medications' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Medication Intelligence</div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication History</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Drug</span><span>Started</span><span>Dose</span><span>Reason</span><span>Status</span>
                  </div>
                  {[
                    { drug: 'Amlodipine', started: '2012', dose: '10 mg daily', reason: 'Persistent HTN', status: 'Active', color: C.green },
                    { drug: 'Perindopril', started: '2015', dose: '5 mg daily', reason: 'Albuminuria', status: 'Active', color: C.green },
                    { drug: 'Atorvastatin', started: '2016', dose: '20 mg daily', reason: 'Dyslipidemia, CV risk', status: 'Active', color: C.green },
                    { drug: 'Hydrochlorothiazide', started: '2013', dose: '25 mg daily', reason: 'Adjunctive HTN', status: 'Stopped 2023', color: C.red },
                    { drug: 'Aspirin', started: '2018', dose: '81 mg daily', reason: 'Primary prevention', status: 'On Hold', color: C.amber },
                  ].map(m => (
                    <div key={m.drug} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', gap: 8, padding: '8px 10px', borderRadius: 6, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{m.drug}</span>
                      <span style={{ color: C.text }}>{m.started}</span>
                      <span style={{ color: C.text }}>{m.dose}</span>
                      <span style={{ color: C.textLight }}>{m.reason}</span>
                      <span style={S.badge(m.color)}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Add Medication</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}>
                    <label style={S.label}>Drug</label>
                    <select style={S.sel}>
                      <option>Amlodipine</option>
                      <option>Perindopril</option>
                      <option>Losartan</option>
                      <option>Hydrochlorothiazide</option>
                      <option>Spironolactone</option>
                      <option>Doxazosin</option>
                      <option>Bisoprolol</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Dose</label>
                    <input style={S.input} placeholder="e.g. 10 mg" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Frequency</label>
                    <select style={S.sel}><option>Once daily</option><option>Twice daily</option><option>Three times daily</option></select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Reason</label>
                    <input style={S.input} placeholder="Indication" />
                  </div>
                  <button style={S.btn(C.sky)}>Add</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── RESISTANT ─── */}
          {tab === 'resistant' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Resistant Hypertension Workspace</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Systematic evaluation and management of resistant hypertension (BP above target on ≥3 agents including a diuretic).</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Evaluation Checklist</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { item: 'Medication Adherence Confirmed', status: 'Confirmed', color: C.green },
                      { item: 'Home BP Monitoring', status: 'Confirmed', color: C.green },
                      { item: 'White Coat Effect Ruled Out', status: 'Ruled out', color: C.green },
                      { item: 'Secondary Causes Screening', status: 'Screening ongoing', color: C.amber },
                      { item: 'Drug Interactions', status: 'None', color: C.green },
                      { item: 'Lifestyle Adherence', status: 'Partial', color: C.amber },
                      { item: 'Sleep Apnea Screening', status: 'Pending', color: C.amber },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${c.status === 'Confirmed' || c.status === 'Ruled out' || c.status === 'None' ? C.green : C.amber}`, background: c.status === 'Confirmed' || c.status === 'Ruled out' || c.status === 'None' ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(c.status === 'Confirmed' || c.status === 'Ruled out' || c.status === 'None') && <CheckCircle size={12} color={C.white} />}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: C.navy, flex: 1 }}>{c.item}</span>
                        <span style={S.badge(c.color)}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Investigations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { test: 'Aldosterone/Renin Ratio', status: 'Pending', color: C.amber },
                      { test: 'Plasma Metanephrines', status: 'Not indicated', color: C.textLight },
                      { test: 'Cortisol (DST)', status: 'Not indicated', color: C.textLight },
                      { test: 'Renal Artery Doppler', status: 'Normal', color: C.green },
                      { test: 'Polysomnography (OSA)', status: 'Scheduled', color: C.amber },
                      { test: 'Echocardiogram', status: 'Completed', color: C.green },
                    ].map(s => (
                      <div key={s.test} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ color: C.navy }}>{s.test}</span>
                        <span style={S.badge(s.color)}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SECONDARY ─── */}
          {tab === 'secondary' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Secondary Hypertension Pathway</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Systematic workup for secondary causes of hypertension.</div>
              <div style={S.grid2}>
                {[
                  { name: 'Renal Artery Stenosis', status: 'Pending', notes: 'Doppler suggested, awaiting MRA', color: C.amber },
                  { name: 'Hyperaldosteronism', status: 'Pending', notes: 'ARR screening in progress', color: C.amber },
                  { name: 'Pheochromocytoma', status: 'Negative', notes: 'Metanephrines normal', color: C.green },
                  { name: 'Cushing Syndrome', status: 'Negative', notes: 'DST normal', color: C.green },
                  { name: 'Thyroid Dysfunction', status: 'Negative', notes: 'TSH normal', color: C.green },
                  { name: 'Coarctation of Aorta', status: 'Negative', notes: 'BP differential absent', color: C.green },
                  { name: 'Obstructive Sleep Apnea', status: 'Suspected', notes: 'STOP-BANG 5, scheduled PSG', color: C.amber },
                  { name: 'Drug-Induced', status: 'Negative', notes: 'No offending agents', color: C.green },
                ].map(c => (
                  <div key={c.name} style={S.cardH}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{c.name}</div>
                      <span style={S.badge(c.color)}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight }}>{c.notes}</div>
                    <div style={{ marginTop: 8 }}>
                      <input type="checkbox" style={{ marginRight: 6 }} />
                      <span style={{ fontSize: 10, color: C.textLight }}>Mark as evaluated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── LIFESTYLE ─── */}
          {tab === 'lifestyle' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Lifestyle Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Lifestyle Domains</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { domain: 'Salt Intake', current: '3 g/day', goal: '<5 g/day', progress: 60, color: C.amber },
                      { domain: 'Physical Activity', current: '120 min/wk', goal: '150 min/wk', progress: 80, color: C.amber },
                      { domain: 'Weight', current: 'BMI 29', goal: 'BMI <25', progress: 40, color: C.amber },
                      { domain: 'Smoking', current: 'Stopped 5 yr ago', goal: 'Remain abstinent', progress: 100, color: C.green },
                      { domain: 'Alcohol', current: '4 units/wk', goal: '<14 units/wk', progress: 90, color: C.green },
                      { domain: 'Stress Management', current: 'Moderate', goal: 'Controlled', progress: 55, color: C.amber },
                      { domain: 'Sleep', current: '6.5 hr/night', goal: '7-9 hr/night', progress: 50, color: C.amber },
                      { domain: 'OSA Screen', current: 'Negative', goal: 'Exclude OSA', progress: 100, color: C.green },
                    ].map(d => (
                      <div key={d.domain}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{d.domain}</span>
                          <div style={{ display: 'flex', gap: 8, fontSize: 10, color: C.textLight }}>
                            <span>Current: <strong>{d.current}</strong></span>
                            <span>Goal: <strong>{d.goal}</strong></span>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: 6, borderRadius: 3, background: C.border }}>
                          <div style={{ width: `${d.progress}%`, height: 6, borderRadius: 3, background: d.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Lifestyle Interventions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>DASH Diet Adherence</label>
                      <select style={S.sel}><option>Full adherence</option><option>Partial adherence</option><option>Minimal adherence</option><option>Not attempted</option></select>
                    </div>
                    <div>
                      <label style={S.label}>Exercise Type</label>
                      <select style={S.sel}><option>Walking</option><option>Cycling</option><option>Swimming</option><option>Mixed Aerobic</option></select>
                    </div>
                    <div>
                      <label style={S.label}>Weight Loss Target (kg)</label>
                      <input style={S.input} placeholder="e.g. 8 kg" />
                    </div>
                    <div>
                      <label style={S.label}>Stress Reduction Method</label>
                      <select style={S.sel}><option>Meditation</option><option>Yoga</option><option>Counselling</option><option>None</option></select>
                    </div>
                    <button style={S.btn(C.green)}>Update Lifestyle Plan</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Home Monitoring Integration</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Home BP', value: '124/74 mmHg', trend: 'Controlled', color: C.green, time: 'Today' },
                      { label: 'Compliance', value: '92%', trend: 'Good', color: C.green, time: '7 days' },
                      { label: 'Pulse', value: '72 bpm', trend: 'Normal', color: C.green, time: 'Today' },
                      { label: 'Weight', value: '78 kg', trend: 'Stable', color: C.green, time: 'Today' },
                      { label: 'Physical Activity', value: '5,200 steps', trend: 'Below target', color: C.amber, time: 'Today' },
                      { label: 'Sleep', value: '7.2 hrs', trend: 'Adequate', color: C.green, time: 'Last night' },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{m.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{m.value}</div>
                        </div>
                        <span style={S.badge(m.color)}>{m.trend}</span>
                        <span style={{ fontSize: 9, color: C.textLight }}>{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Trend Alerts</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20`, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>BP: </span><span style={{ color: C.text }}>Stable control over last 30 days</span>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>Activity: </span><span style={{ color: C.text }}>Consistently below 6,000 steps/day target</span>
                      </div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Device Connections</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { device: 'BP Monitor (Omron HEM-7322)', status: 'Connected', color: C.green },
                        { device: 'Weight Scale (Withings)', status: 'Connected', color: C.green },
                        { device: 'Activity Tracker (Fitbit)', status: 'Connected', color: C.green },
                        { device: 'Pulse Oximeter', status: 'Disconnected (7 days)', color: C.amber },
                      ].map(d => (
                        <div key={d.device} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                          <span style={{ color: C.text }}>{d.device}</span>
                          <span style={S.badge(d.color)}>{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── GOALS ─── */}
          {tab === 'goals' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Longitudinal Goal Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Goals</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { goal: 'BP <130/80 mmHg', status: 'Achieved', progress: 100, current: '126/76', color: C.green },
                      { goal: 'Weight Loss 8 kg', status: 'In Progress', progress: 68, current: '5.4 kg lost', color: C.amber },
                      { goal: 'Exercise ≥150 min/wk', status: 'In Progress', progress: 80, current: '120 min/wk', color: C.amber },
                      { goal: 'Smoking Cessation', status: 'Completed', progress: 100, current: 'Abstinent 5 years', color: C.green },
                    ].map(g => (
                      <div key={g.goal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{g.goal}</span>
                          <span style={S.badge(g.status === 'Achieved' || g.status === 'Completed' ? C.green : C.amber)}>{g.status}</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight, marginBottom: 6 }}>Current: {g.current}</div>
                        <div style={{ width: '100%', height: 8, borderRadius: 4, background: C.border }}>
                          <div style={{ width: `${g.progress}%`, height: 8, borderRadius: 4, background: g.color }} />
                        </div>
                        <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>{g.progress}% complete</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Add Goal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Goal Type</label>
                      <select style={S.sel}>
                        <option>BP Target</option>
                        <option>Weight Loss</option>
                        <option>Exercise</option>
                        <option>Smoking Cessation</option>
                        <option>Salt Reduction</option>
                        <option>Medication Adherence</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Target Value</label>
                      <input style={S.input} placeholder="e.g. BP <130/80" />
                    </div>
                    <div>
                      <label style={S.label}>Target Date</label>
                      <input style={S.input} type="date" />
                    </div>
                    <button style={S.btn(C.sky)}>Set Goal</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ANNUAL ─── */}
          {tab === 'annual' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Annual Hypertension Review</div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Annual Review Checklist &mdash; Mary Atieno</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Domain</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Result</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { domain: 'Blood Pressure', result: '126/76 mmHg', status: 'Controlled', date: '2026-07-01' },
                      { domain: 'Home BP Monitoring', result: '124/74 avg', status: 'Completed', date: '2026-07-01' },
                      { domain: 'Weight / BMI', result: '78 kg / 29', status: 'Reviewed', date: '2026-07-01' },
                      { domain: 'Waist Circumference', result: '96 cm', status: 'Reviewed', date: '2026-07-01' },
                      { domain: 'Lipid Profile', result: 'LDL 1.5, HDL 1.2, TG 1.8', status: 'Completed', date: '2026-06-15' },
                      { domain: 'Kidney Function', result: 'eGFR 65, Cr 95', status: 'Completed', date: '2026-06-15' },
                      { domain: 'Urinalysis', result: 'Negative albuminuria', status: 'Completed', date: '2026-06-15' },
                      { domain: 'ECG', result: 'Normal sinus rhythm', status: 'Completed', date: '2026-06-01' },
                      { domain: 'Eye Exam', result: 'No retinopathy', status: 'Completed', date: '2026-05-15' },
                      { domain: 'Medication Review', result: 'Amlodipine + Perindopril', status: 'Completed', date: '2026-07-01' },
                      { domain: 'Lifestyle Review', result: 'Partial adherence', status: 'Reviewed', date: '2026-07-01' },
                      { domain: 'CV Risk Recalculation', result: 'Very High (22% 10yr)', status: 'Completed', date: '2026-07-01' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{r.domain}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{r.result}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(r.status === 'Controlled' || r.status === 'Completed' ? C.green : C.amber)}>{r.status}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 16 }}>
                  <button style={S.btn(C.green)}><CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Complete Review</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === 'registry' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Hypertension Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'All HTN', value: '1,247', color: C.sky },
                  { label: 'Controlled BP', value: '848', color: C.green },
                  { label: 'Resistant HTN', value: '156', color: C.red },
                  { label: 'LVH', value: '89', color: C.amber },
                  { label: 'CKD with HTN', value: '214', color: C.amber },
                  { label: 'Stroke History', value: '78', color: C.red },
                  { label: 'On 3+ Agents', value: '312', color: C.purple },
                  { label: 'Mortality (YTD)', value: '42', color: C.red },
                ].map(r => (
                  <div key={r.label} style={S.statCard}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: r.color }}>{r.value}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{r.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Patient Registry</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} color={C.textLight} style={{ position: 'absolute', left: 10, top: 8 }} />
                      <input style={{ ...S.input, paddingLeft: 28, width: 200 }} placeholder="Search patients..." />
                    </div>
                    <select style={S.sel}><option>All Stages</option><option>Stage 1</option><option>Stage 2</option><option>Resistant</option></select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Name</span><span>MRN</span><span>Stage</span><span>SBP</span><span>DBP</span><span>Status</span><span>Last Visit</span>
                  </div>
                  {[
                    { name: 'Mary Atieno', mrn: 'HT-001', stage: 'Stage 2', sbp: '126', dbp: '76', status: 'Controlled', visit: '1 month ago' },
                    { name: 'Peter Ochieng', mrn: 'HT-012', stage: 'Resistant', sbp: '158', dbp: '92', status: 'Uncontrolled', visit: '1 week ago' },
                    { name: 'Grace Njeri', mrn: 'HT-024', stage: 'Stage 1', sbp: '138', dbp: '84', status: 'Partial', visit: '2 weeks ago' },
                    { name: 'Samuel Kiprop', mrn: 'HT-036', stage: 'Stage 2', sbp: '145', dbp: '88', status: 'Uncontrolled', visit: 'Today' },
                    { name: 'Faith Nyambura', mrn: 'HT-048', stage: 'Stage 1', sbp: '132', dbp: '80', status: 'Controlled', visit: '3 weeks ago' },
                  ].map(p => (
                    <div key={p.mrn} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                      <span style={{ color: C.textLight }}>{p.mrn}</span>
                      <span style={{ color: C.text }}>{p.stage}</span>
                      <span style={{ color: parseInt(p.sbp) > 140 ? C.red : C.navy }}>{p.sbp}</span>
                      <span style={{ color: parseInt(p.dbp) > 90 ? C.red : C.navy }}>{p.dbp}</span>
                      <span style={S.badge(
                        p.status === 'Controlled' ? C.green : p.status === 'Partial' ? C.amber : C.red
                      )}>{p.status}</span>
                      <span style={{ color: C.textLight }}>{p.visit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── QUALITY ─── */}
          {tab === 'quality' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Quality Indicators</div>
              <div style={S.grid4}>
                {[
                  { metric: 'BP Control Rate', value: '68%', target: '80%', trend: '↑', color: C.amber },
                  { metric: 'Mean SBP', value: '132 mmHg', target: '<130', trend: '→', color: C.amber },
                  { metric: 'Mean DBP', value: '82 mmHg', target: '<80', trend: '→', color: C.amber },
                  { metric: 'Kidney Assessment', value: '72%', target: '90%', trend: '↑', color: C.amber },
                  { metric: 'CV Risk Assessment', value: '58%', target: '80%', trend: '↑', color: C.red },
                  { metric: 'Medication Adherence', value: '76%', target: '85%', trend: '↑', color: C.amber },
                  { metric: 'Stroke Incidence', value: '3.2%', target: '<2%', trend: '↓', color: C.amber },
                  { metric: 'HF Incidence', value: '2.1%', target: '<1.5%', trend: '↓', color: C.amber },
                ].map(q => (
                  <div key={q.metric} style={{ ...S.card, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{q.metric}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{q.value}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
                      <span style={{ color: C.textLight }}>Target: {q.target}</span>
                      <span style={{ color: q.color, fontWeight: 600 }}>{q.trend}</span>
                    </div>
                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: C.border, marginTop: 8 }}>
                      <div style={{ width: q.value, height: 4, borderRadius: 2, background: q.color }} />
                    </div>
                    <span style={{ ...S.badge(parseInt(q.value) >= parseInt(q.target) ? C.green : q.color), marginTop: 6, display: 'inline-block' }}>
                      {parseInt(q.value) >= parseInt(q.target) ? 'On Target' : 'Below Target'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Improvement Initiatives</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: 'BP Control Enhancement Program', desc: 'Protocol-based titration algorithm for all HTN patients', progress: '65%', color: C.sky },
                    { title: 'CV Risk Assessment Initiative', desc: 'Automated risk calculator deployment across primary care', progress: '45%', color: C.amber },
                    { title: 'Medication Adherence Intervention', desc: 'Pharmacy-led medication reconciliation and adherence counseling', progress: '55%', color: C.green },
                  ].map(proj => (
                    <div key={proj.title} style={{ padding: '12px 16px', borderRadius: 8, background: C.panel }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{proj.title}</div>
                        <span style={S.badge(proj.color)}>{proj.progress}</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.textLight, marginBottom: 8 }}>{proj.desc}</div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: C.border }}>
                        <div style={{ width: proj.progress, height: 6, borderRadius: 3, background: proj.color }} />
                      </div>
                    </div>
                  ))}
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Today&rsquo;s Status</div>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${C.green}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={32} color={C.green} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Controlled</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>BP 126/76 &mdash; within target range</div>
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Dashboard</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>Home BP Trend</div>
                        <div style={{ height: 40, background: C.border, borderRadius: 4, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.textLight }}>[Graph placeholder]</div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ color: C.textLight }}>Medication Reminders</div>
                        {['Amlodipine 10 mg OD', 'Perindopril 5 mg OD', 'Atorvastatin 20 mg OD'].map(m => (
                          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                            <CheckCircle size={10} color={C.green} />
                            <span style={{ color: C.text }}>{m}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Today&rsquo;s BP</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>126/76</div>
                          <div style={{ color: C.green }}>Controlled</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Salt Intake</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>3 g</div>
                           <div style={{ color: C.textLight }}>Target: {'<'}5 g</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Steps Today</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>3,200</div>
                          <div style={{ color: C.textLight }}>Target: 6,000</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Next Appointment</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2 weeks</div>
                          <div style={{ color: C.textLight }}>Hypertension Clinic</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Educational Content</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { title: 'HTN Education', desc: 'Understanding your blood pressure', icon: BookOpen, color: C.sky },
                      { title: 'Salt Reduction', desc: 'Tips for lowering sodium intake', icon: Droplets, color: C.sky },
                      { title: 'Medication Adherence', desc: 'Why daily meds matter', icon: Pill, color: C.sky },
                      { title: 'Warning Signs', desc: 'When to seek emergency care', icon: AlertTriangle, color: C.sky },
                    ].map(e => (
                      <div key={e.title} style={{ padding: '12px', borderRadius: 8, background: C.panel, cursor: 'pointer' }}>
                        <e.icon size={20} color={e.color} />
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginTop: 6 }}>{e.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>{e.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Progress Badges</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={S.pill(C.green)}>BP Target Achieved</span>
                      <span style={S.pill(C.amber)}>Medication Adherence</span>
                      <span style={S.pill(C.green)}>Non-Smoker</span>
                    </div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Communication</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea style={{ ...S.input, minHeight: 120, resize: 'vertical' }} placeholder="Send a secure message to your care team..." />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={S.btn(C.sky)}><MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Send Message</button>
                      <button style={S.btnO}>View Messages</button>
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
