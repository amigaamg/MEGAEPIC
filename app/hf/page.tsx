'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, type LucideIcon, UserPlus, ClipboardList, ArrowRightLeft, LogOut, Send, Eye, Hospital, Building, Filter, MoreHorizontal, Zap, Brain, Baby, Apple, Target, BarChart3, LineChart, Download, Printer, RefreshCw, Globe, Home, Sliders, HeartPulse, BrainCircuit, Bone } from 'lucide-react'
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
  { id: 'snapshot', label: 'Cardiac Snapshot', icon: HeartPulse },
  { id: 'timeline', label: 'Heart Failure Timeline', icon: Clock },
  { id: 'phenotype', label: 'Phenotype Engine', icon: Brain },
  { id: 'congestion', label: 'Congestion Intelligence', icon: Droplets },
  { id: 'function', label: 'Cardiac Function', icon: Heart },
  { id: 'functional', label: 'Functional Status', icon: Monitor },
  { id: 'medications', label: 'Medication Optimization', icon: Pill },
  { id: 'devices', label: 'Device Intelligence', icon: Shield },
  { id: 'hospitalizations', label: 'Hospitalization Timeline', icon: Calendar },
  { id: 'fluids', label: 'Fluid Intelligence', icon: Weight },
  { id: 'renal', label: 'Renal Protection', icon: Filter },
  { id: 'arrhythmia', label: 'Arrhythmia Workspace', icon: Activity },
  { id: 'rehab', label: 'Exercise & Rehab', icon: TrendingUp },
  { id: 'nutrition', label: 'Nutrition Workspace', icon: Apple },
  { id: 'home', label: 'Home Monitoring', icon: Home },
  { id: 'symptoms', label: 'Daily Symptom Tracker', icon: ClipboardList },
  { id: 'ai', label: 'AI Deterioration Engine', icon: Zap },
  { id: 'pregnancy', label: 'Pregnancy Pathway', icon: Baby },
  { id: 'palliative', label: 'Palliative Care', icon: Heart },
  { id: 'team', label: 'MDT Workspace', icon: Users },
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

export default function HeartFailureWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Heart Failure Intelligence Center &mdash; Volume XI-C</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>HF</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Heart Failure</div>
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Heart Failure Intelligence Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>A Lifelong Cardiac Function, Congestion & Survival Operating System</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.red)}>3 High Risk</span>
                  <span style={S.pill(C.amber)}>12 Stable</span>
                  <span style={S.pill(C.green)}>28 Enrolled</span>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'Total HF Patients', value: '342', icon: Users, color: C.sky },
                  { label: 'NYHA Class III/IV', value: '87', icon: Heart, color: C.red },
                  { label: 'Recent Admissions (30d)', value: '24', icon: Hospital, color: C.amber },
                  { label: 'LVEF <40%', value: '156', icon: HeartPulse, color: C.red },
                  { label: 'CRT Recipients', value: '89', icon: Activity, color: C.purple },
                  { label: 'ICD Recipients', value: '124', icon: Shield, color: C.purple },
                  { label: 'Advanced HF', value: '45', icon: AlertTriangle, color: C.amber },
                  { label: 'Transplant Waitlist', value: '12', icon: Ambulance, color: C.sky },
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
                    { title: 'Worsening Congestion', patient: 'John Kamau', detail: 'Weight +2.3 kg, BNP 640', color: C.red },
                    { title: 'Missed Medications', patient: 'Mary Atieno', detail: 'Sacubitril/Valsartan not taken 3 days', color: C.amber },
                    { title: 'Weight Gain Detected', patient: 'Samuel Ochieng', detail: '+1.8 kg over 5 days', color: C.amber },
                    { title: 'Deteriorating Renal Function', patient: 'Grace Njeri', detail: 'Creatinine 112 → 135 μmol/L', color: C.red },
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
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Patient Assessment</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Medication Review</button>
                  <button style={S.btn(C.purple)}><Shield size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Device Check</button>
                  <button style={S.btnO}><Home size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Home Monitoring Review</button>
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
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>John Kamau / 63 Years / Male</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>HFrEF · Duration: 6 Years · Current Status: Stable · NYHA Class: II · Risk: High</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.green)}>Stable</span>
                    <span style={S.badge(C.amber)}>NYHA II</span>
                    <span style={S.badge(C.red)}>High Risk</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Cardiac Snapshot</div>
              <div style={S.grid4}>
                {[
                  { label: 'Blood Pressure', value: '118/70', color: C.green },
                  { label: 'Heart Rate', value: '68 bpm', color: C.green },
                  { label: 'Weight', value: '74 kg', color: C.green },
                  { label: 'Weight Change (7d)', value: '+0.8 kg', color: C.amber },
                  { label: 'LVEF', value: '32%', color: C.red },
                  { label: 'NT-proBNP', value: '640 pg/mL', color: C.amber },
                  { label: 'Creatinine', value: '112 μmol/L', color: C.amber },
                  { label: 'eGFR', value: '61 mL/min', color: C.amber },
                  { label: 'Potassium', value: '4.7 mmol/L', color: C.green },
                  { label: 'Hemoglobin', value: '13.2 g/dL', color: C.green },
                  { label: 'BNP', value: '340 pg/mL', color: C.amber },
                  { label: 'NYHA Class', value: 'II', color: C.green },
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
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Heart Failure Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { year: '2025', title: 'Stable', desc: 'Ongoing optimization, NYHA Class II maintained', icon: CheckCircle, color: C.green },
                  { year: '2024', title: 'SGLT2 Added', desc: 'Dapagliflozin 10 mg initiated for additional mortality benefit', icon: Plus, color: C.sky },
                  { year: '2023', title: 'Sacubitril/Valsartan Started', desc: 'Transitioned from ACEi to ARNI for improved outcomes', icon: Pill, color: C.sky },
                  { year: '2022', title: 'Admission (Pulmonary Edema)', desc: 'Acute decompensation, IV diuresis, weight loss 5 kg', icon: Hospital, color: C.red },
                  { year: '2021', title: 'CRT Implanted', desc: 'Biventricular pacemaker for LBBB, QRS 150 ms', icon: Activity, color: C.purple },
                  { year: '2020', title: 'Beta Blocker Started', desc: 'Bisoprolol 5 mg daily, titrated to target dose', icon: Pill, color: C.sky },
                  { year: '2019', title: 'ACEI Started', desc: 'Ramipril 2.5 mg, up-titrated as tolerated', icon: Pill, color: C.sky },
                  { year: '2018', title: 'Heart Failure Diagnosis', desc: 'Confirmed HFrEF, LVEF 35%, NYHA Class III', icon: Heart, color: C.amber },
                  { year: '2017', title: 'Anterior MI', desc: 'STEMI anterior wall, PCI to LAD with drug-eluting stent', icon: Heart, color: C.red },
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
                      <option>Admission</option>
                      <option>Medication Change</option>
                      <option>Device Implant</option>
                      <option>Procedure</option>
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

          {/* ─── PHENOTYPE ─── */}
          {tab === 'phenotype' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Heart Failure Phenotype Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'HFrEF', status: true, color: C.green },
                      { label: 'HFmrEF', status: false, color: C.textLight },
                      { label: 'HFpEF', status: false, color: C.textLight },
                      { label: 'Ischemic', status: true, color: C.green },
                      { label: 'Hypertensive', status: true, color: C.green },
                      { label: 'Valvular', status: false, color: C.textLight },
                      { label: 'Amyloidosis', status: false, color: C.textLight },
                      { label: 'Right Heart Failure', status: false, color: C.amber },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${p.status ? C.sky : C.border}`, background: p.status ? C.sky : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.status && <CheckCircle size={12} color={C.white} />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.navy }}>{p.label}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: p.color }}>{p.status ? 'Yes' : p.label === 'Right Heart Failure' ? 'Mild' : 'No'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Ischemic HFrEF with Hypertension</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      This patient presents with heart failure with reduced ejection fraction (HFrEF) of ischemic etiology, with concomitant hypertensive heart disease. Mild right ventricular involvement noted. No evidence of valvular, amyloid, or HFpEF phenotype.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Update Phenotype</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>HF Type</label>
                        <select style={S.sel}><option>HFrEF</option><option>HFmrEF</option><option>HFpEF</option></select>
                      </div>
                      <div>
                        <label style={S.label}>Etiology</label>
                        <select style={S.sel}><option>Ischemic</option><option>Non-ischemic</option><option>Hypertensive</option><option>Valvular</option></select>
                      </div>
                    </div>
                    <button style={S.btn(C.sky)}>Update Classification</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── CONGESTION ─── */}
          {tab === 'congestion' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Congestion Intelligence Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>"Instead of asking 'Does the patient have edema?' the system evaluates congestion."</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={S.card}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Clinical Congestion</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Peripheral edema', status: 'Mild', color: C.amber },
                      { label: 'JVP', status: 'Normal', color: C.green },
                      { label: 'Orthopnea', status: 'None', color: C.green },
                      { label: 'PND', status: 'None', color: C.green },
                      { label: 'Ascites', status: 'Absent', color: C.green },
                      { label: 'Hepatomegaly', status: 'Absent', color: C.green },
                      { label: 'Pulmonary edema', status: 'None', color: C.green },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{i.label}</span>
                        <span style={S.badge(i.color)}>{i.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Laboratory Congestion</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'BNP', value: '340 pg/mL', status: 'Elevated', color: C.amber },
                      { label: 'NT-proBNP', value: '640 pg/mL', status: 'Elevated', color: C.amber },
                      { label: 'Hemoconcentration', value: '—', status: 'Normal', color: C.green },
                    ].map(i => (
                      <div key={i.label} style={{ padding: '6px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                          <span style={{ color: C.text }}>{i.label}</span>
                          <span style={S.badge(i.color)}>{i.status}</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{i.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Imaging</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Chest X-ray', status: 'Clear', color: C.green },
                      { label: 'Lung ultrasound', status: 'Dry', color: C.green },
                      { label: 'IVC diameter', status: 'Normal', color: C.green },
                      { label: 'Echo', status: 'EF 32%', color: C.amber },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '6px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{i.label}</span>
                        <span style={S.badge(i.color)}>{i.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Device Data</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Implantable monitors', status: 'Stable', color: C.green },
                      { label: 'PA pressure', status: 'Normal', color: C.green },
                      { label: 'Remote monitoring', status: 'No alerts', color: C.green },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '6px 0', borderBottom: `1px solid ${C.panel}` }}>
                        <span style={{ color: C.text }}>{i.label}</span>
                        <span style={S.badge(i.color)}>{i.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={S.card}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Congestion Summary</div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div><span style={S.pill(C.green)}>Congestion: Minimal</span></div>
                  <div><span style={S.pill(C.green)}>Fluid Balance: Improving</span></div>
                  <div><span style={S.pill(C.green)}>Risk of Admission: Low</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FUNCTION ─── */}
          {tab === 'function' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Cardiac Function Workspace</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cardiac Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Ejection Fraction', value: '32%', trend: 'Down from 35%', color: C.red },
                      { label: 'LV Dimensions', value: '6.2 cm', trend: 'Dilated', color: C.amber },
                      { label: 'RV Function', value: 'Normal', trend: 'Stable', color: C.green },
                      { label: 'Valve Disease', value: 'Mild MR', trend: 'Stable', color: C.amber },
                      { label: 'Pulmonary Pressure', value: '35 mmHg', trend: 'Mildly elevated', color: C.amber },
                      { label: 'Diastolic Function', value: 'Grade II', trend: 'Impaired relaxation', color: C.amber },
                      { label: 'Cardiac MRI', value: 'Pending', trend: 'Scheduled next month', color: C.sky },
                      { label: 'Stress Imaging', value: 'Not indicated', trend: '—', color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: C.textLight }}>{p.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{p.value}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={S.badge(p.color)}>{p.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Function Trend</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { label: 'EF Over Last 4 Measurements', vals: ['38%', '35%', '33%', '32%'], color: C.red },
                      { label: 'LVEDD Trend', vals: ['5.8 cm', '6.0 cm', '6.1 cm', '6.2 cm'], color: C.amber },
                      { label: 'RV Function Trend', vals: ['Normal', 'Normal', 'Normal', 'Normal'], color: C.green },
                      { label: 'PA Pressure Trend', vals: ['32 mmHg', '33 mmHg', '34 mmHg', '35 mmHg'], color: C.amber },
                    ].map(t => (
                      <div key={t.label}>
                        <div style={{ fontSize: 10, color: C.textLight, marginBottom: 6 }}>{t.label}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 48 }}>
                          {t.vals.map((v, i) => {
                            const h = i === 0 ? 32 : i === 1 ? 28 : i === 2 ? 26 : 22
                            return (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: 9, color: C.textLight }}>{v}</div>
                                <div style={{ width: '80%', height: h, borderRadius: '4px 4px 0 0', background: t.color, marginTop: 4, opacity: 0.6 + i * 0.1 }} />
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
          )}

          {/* ─── FUNCTIONAL ─── */}
          {tab === 'functional' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Functional Status Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Rather than documenting &lsquo;patient feels better.&rsquo;</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Functional Domains</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'NYHA Class', value: 'II', trend: 'Stable', color: C.green },
                      { label: '6-Minute Walk Test', value: '340 m', trend: 'Improving', color: C.green },
                      { label: 'Frailty Score', value: '4/9', trend: 'Stable', color: C.amber },
                      { label: 'Exercise Capacity', value: 'Moderate', trend: 'Improving', color: C.green },
                      { label: 'Quality of Life (KCCQ)', value: '72', trend: 'Improving', color: C.green },
                      { label: 'Daily Activity', value: 'Independent', trend: 'Stable', color: C.green },
                      { label: 'Sleep', value: 'Good', trend: 'Stable', color: C.green },
                      { label: 'Dyspnea', value: 'Mild', trend: 'Improving', color: C.green },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{d.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{d.value}</div>
                        </div>
                        <span style={S.badge(d.color)}>{d.trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Functional Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>NYHA Class</label>
                      <select style={S.sel}><option>I</option><option>II</option><option>III</option><option>IV</option></select>
                    </div>
                    <div>
                      <label style={S.label}>6-Minute Walk Test (m)</label>
                      <input style={S.input} placeholder="e.g. 340" />
                    </div>
                    <div>
                      <label style={S.label}>Frailty Score</label>
                      <select style={S.sel}><option>0/9 — Robust</option><option>1-3/9 — Pre-frail</option><option>4-6/9 — Frail</option><option>7-9/9 — Severely Frail</option></select>
                    </div>
                    <div>
                      <label style={S.label}>KCCQ Score</label>
                      <input style={S.input} placeholder="0-100" />
                    </div>
                    <button style={S.btn(C.sky)}>Update Assessment</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MEDICATIONS ─── */}
          {tab === 'medications' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Medication Optimization Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Foundation Therapy</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['ACEi/ARNI', 'Beta Blocker', 'MRA', 'SGLT2i'].map(p => (
                      <div key={p} style={{ flex: 1, padding: '12px 8px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25`, textAlign: 'center' }}>
                        <CheckCircle size={16} color={C.green} style={{ marginBottom: 4 }} />
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.navy }}>{p}</div>
                        <div style={{ fontSize: 9, color: C.green }}>Onboarded</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, background: `${C.sky}08`, border: `1px solid ${C.sky}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: C.textLight }}>Optimization Score</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>92%</div>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: C.border, marginTop: 6 }}>
                      <div style={{ width: '92%', height: 6, borderRadius: 3, background: C.green }} />
                    </div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Medications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { drug: 'Sacubitril/Valsartan', dose: '49/51 mg BID', start: '2023', indication: 'HFrEF', adherence: '95%' },
                      { drug: 'Bisoprolol', dose: '5 mg daily', start: '2020', indication: 'HFrEF', adherence: '92%' },
                      { drug: 'Spironolactone', dose: '25 mg daily', start: '2021', indication: 'HFrEF', adherence: '90%' },
                      { drug: 'Dapagliflozin', dose: '10 mg daily', start: '2024', indication: 'HFrEF', adherence: '88%' },
                      { drug: 'Furosemide', dose: '40 mg daily', start: '2018', indication: 'Congestion', adherence: '85%' },
                      { drug: 'Digoxin', dose: '0.125 mg daily', start: '2022', indication: 'Rate control', adherence: '93%' },
                    ].map(m => (
                      <div key={m.drug} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 6, padding: '6px 8px', borderRadius: 6, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{m.drug}</span>
                        <span style={{ color: C.text }}>{m.dose}</span>
                        <span style={{ color: C.textLight }}>{m.indication}</span>
                        <span style={S.pill(m.adherence >= '90' ? C.green : C.amber)}>{m.adherence}</span>
                        <span style={{ display: 'flex', gap: 4 }}>
                          <button style={{ padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.text, cursor: 'pointer', fontSize: 9 }}>Edit</button>
                          <button style={{ padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.red, cursor: 'pointer', fontSize: 9 }}>Stop</button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Add Medication</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}>
                    <label style={S.label}>Drug</label>
                    <select style={S.sel}>
                      <option>Sacubitril/Valsartan</option>
                      <option>Bisoprolol</option>
                      <option>Spironolactone</option>
                      <option>Dapagliflozin</option>
                      <option>Furosemide</option>
                      <option>Digoxin</option>
                      <option>Ivabradine</option>
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
                    <label style={S.label}>Indication</label>
                    <input style={S.input} placeholder="e.g. HFrEF" />
                  </div>
                  <button style={S.btn(C.sky)}>Add</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── DEVICES ─── */}
          {tab === 'devices' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Device Intelligence Center</div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Device Tracking</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Device Type</span><span>Model</span><span>Implant Date</span><span>Battery</span><span>Lead Integrity</span><span>Programming</span><span>Remote Monitoring</span>
                  </div>
                  {[
                    { type: 'CRT-D', model: 'Medtronic 4295', date: 'Jan 2021', battery: '72%', lead: 'Intact', prog: 'DDD 60-130', remote: 'Last: 2 days ago' },
                    { type: 'ICD', model: 'Boston S-ICD', date: 'Mar 2020', battery: '68%', lead: 'Intact', prog: 'VF 200J x6', remote: 'Last: 1 week ago' },
                    { type: 'Pacemaker', model: 'Abbot PM227', date: 'Jun 2022', battery: '88%', lead: 'Intact', prog: 'DDD 50-120', remote: 'Daily' },
                  ].map(d => (
                    <div key={d.type} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '8px 10px', borderRadius: 6, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{d.type}</span>
                      <span style={{ color: C.text }}>{d.model}</span>
                      <span style={{ color: C.textLight }}>{d.date}</span>
                      <span style={S.badge(d.battery >= '70' ? C.green : C.amber)}>{d.battery}</span>
                      <span style={{ color: C.green }}>{d.lead}</span>
                      <span style={{ color: C.textLight }}>{d.prog}</span>
                      <span style={{ color: C.textLight }}>{d.remote}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={S.grid2}>
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Device Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'CRT-D Battery', value: '72%', color: C.green },
                      { label: 'ICD Battery', value: '68%', color: C.amber },
                      { label: 'Pacemaker Battery', value: '88%', color: C.green },
                    ].map(b => (
                      <div key={b.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                          <span style={{ color: C.text }}>{b.label}</span>
                          <span style={{ color: b.color, fontWeight: 600 }}>{b.value}</span>
                        </div>
                        <div style={{ width: '100%', height: 6, borderRadius: 3, background: C.border }}>
                          <div style={{ width: b.value, height: 6, borderRadius: 3, background: b.color }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, fontSize: 10, color: C.amber }}>
                      Generator replacement alert: ICD projected replacement in 14 months
                    </div>
                  </div>
                </div>
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Remote Monitoring</div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                    <div style={{ color: C.textLight }}>Last Transmission</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2 days ago</div>
                    <div style={{ color: C.green, marginTop: 4 }}>No alerts — stable device parameters</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HOSPITALIZATIONS ─── */}
          {tab === 'hospitalizations' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Hospitalization Timeline</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Admission Events</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { year: '2025', event: 'Stable', details: 'No admissions this year', color: C.green },
                      { year: '2024', event: 'No Admissions', details: 'Outpatient management successful', color: C.green },
                      { year: '2023', event: 'Admission (Pulmonary Edema)', details: 'LOS 8 days, ICU 3 days, Discharge EF 32%', color: C.amber },
                      { year: '2022', event: 'Admission (Cardiogenic Shock)', details: 'LOS 14 days, ICU 10 days, Inotropes, Discharge EF 30%', color: C.red },
                    ].map(a => (
                      <div key={a.year} style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, borderLeft: `3px solid ${a.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{a.year}</div>
                          <span style={S.badge(a.color)}>{a.event.split('(')[0].trim()}</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{a.details}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Admission Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, padding: '6px 8px', borderRadius: 4, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                      <span>Date</span><span>Reason</span><span>LOS</span><span>ICU</span><span>EF d/c</span><span>Meds</span>
                    </div>
                    {[
                      { date: 'Mar 2023', reason: 'Pulmonary Edema', los: '8 days', icu: '2 days', ef: '32%', meds: 'IV diuresis' },
                      { date: 'Jan 2022', reason: 'Cardiogenic Shock', los: '14 days', icu: '10 days', ef: '30%', meds: 'Inotropes + diuresis' },
                    ].map(a => (
                      <div key={a.date} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, padding: '6px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{a.date}</span>
                        <span style={{ color: C.text }}>{a.reason}</span>
                        <span style={{ color: C.text }}>{a.los}</span>
                        <span style={{ color: C.text }}>{a.icu}</span>
                        <span style={{ color: C.text }}>{a.ef}</span>
                        <span style={{ color: C.textLight }}>{a.meds}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Risk Update</div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, fontSize: 10 }}>
                    Prior admissions: 2 HF-related hospitalizations. Risk score adjusted: <strong>High</strong>. Current strategies: intensified monitoring, GDMT optimization.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FLUIDS ─── */}
          {tab === 'fluids' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Fluid Intelligence Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Input</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Daily Weight (kg)</label>
                      <input style={S.input} placeholder="e.g. 74.2" />
                    </div>
                    <div>
                      <label style={S.label}>Urine Output (mL)</label>
                      <input style={S.input} placeholder="e.g. 1500" />
                    </div>
                    <div>
                      <label style={S.label}>Fluid Intake (mL)</label>
                      <input style={S.input} placeholder="e.g. 1800" />
                    </div>
                    <div>
                      <label style={S.label}>Leg Swelling</label>
                      <select style={S.sel}><option>None</option><option>Mild</option><option>Moderate</option><option>Severe</option></select>
                    </div>
                    <div>
                      <label style={S.label}>Breathlessness (1-10)</label>
                      <input style={S.input} type="number" min={1} max={10} placeholder="e.g. 6" />
                    </div>
                    <div>
                      <label style={S.label}>Exercise Tolerance</label>
                      <select style={S.sel}><option>Normal</option><option>Slightly Reduced</option><option>Moderately Reduced</option><option>Severely Reduced</option></select>
                    </div>
                    <button style={S.btn(C.sky)}>Record Daily Input</button>
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fluid Status</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.red}08`, border: `1px solid ${C.red}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}><span style={{ fontWeight: 600, color: C.navy }}>Weight:</span> <span style={{ color: C.text }}>+2.3 kg from baseline</span></div>
                        <span style={S.badge(C.red)}>Alert</span>
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1 }}><span style={{ fontWeight: 600, color: C.navy }}>Increasing Dyspnea:</span> <span style={{ color: C.text }}>6/10</span></div>
                        <span style={S.badge(C.amber)}>Warning</span>
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}20`, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1 }}><span style={{ fontWeight: 600, color: C.navy }}>Reduced Activity:</span> <span style={{ color: C.text }}>Possible fluid overload</span></div>
                        <span style={S.badge(C.amber)}>Review</span>
                      </div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fluid Balance Chart (7-day)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                        <span>Date</span><span>Intake (mL)</span><span>Output (mL)</span><span>Balance (mL)</span>
                      </div>
                      {[
                        { d: 'Mon', i: 1800, o: 1500, b: '+300' },
                        { d: 'Tue', i: 1900, o: 1550, b: '+350' },
                        { d: 'Wed', i: 1750, o: 1600, b: '+150' },
                        { d: 'Thu', i: 2000, o: 1450, b: '+550' },
                        { d: 'Fri', i: 1850, o: 1400, b: '+450' },
                        { d: 'Sat', i: 1700, o: 1500, b: '+200' },
                        { d: 'Sun', i: 1650, o: 1550, b: '+100' },
                      ].map(r => (
                        <div key={r.d} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '5px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                          <span style={{ fontWeight: 600, color: C.navy }}>{r.d}</span>
                          <span style={{ color: C.text }}>{r.i}</span>
                          <span style={{ color: C.text }}>{r.o}</span>
                          <span style={{ color: parseInt(r.b) > 200 ? C.amber : C.green, fontWeight: 600 }}>{r.b}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, color: C.textLight }}>Cumulative trend: positive balance, consider diuretic adjustment</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── RENAL ─── */}
          {tab === 'renal' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Renal Protection Workspace</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Heart-kidney interaction in cardiorenal syndrome — early detection, preservation, optimization.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Creatinine', value: '112 μmol/L', status: 'Mildly elevated', color: C.amber, trend: '→' },
                      { label: 'eGFR', value: '61 mL/min', status: 'Stage 3a CKD', color: C.amber, trend: '→' },
                      { label: 'Potassium', value: '4.7 mmol/L', status: 'Normal', color: C.green, trend: '→' },
                      { label: 'Diuretic Response', value: 'Adequate', status: 'Good', color: C.green, trend: '↑' },
                      { label: 'Dialysis', value: 'No', status: 'Not required', color: C.green, trend: '→' },
                      { label: 'Cardiorenal Syndrome', value: 'Type II', status: 'Chronic', color: C.amber, trend: '→' },
                      { label: 'Medication Adjustments', value: 'ACEi continued', status: 'Appropriate', color: C.green, trend: '→' },
                      { label: 'BUN', value: '28 mg/dL', status: 'Elevated', color: C.amber, trend: '↑' },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 90 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, minWidth: 80 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 11, color: p.color }}>{p.trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal Function Trend (12 Months)</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, padding: '12px 0' }}>
                    {[
                      { mo: 'Jul', cr: 95, egfr: 72 },
                      { mo: 'Aug', cr: 98, egfr: 70 },
                      { mo: 'Sep', cr: 100, egfr: 68 },
                      { mo: 'Oct', cr: 105, egfr: 66 },
                      { mo: 'Nov', cr: 102, egfr: 67 },
                      { mo: 'Dec', cr: 108, egfr: 64 },
                      { mo: 'Jan', cr: 106, egfr: 65 },
                      { mo: 'Feb', cr: 110, egfr: 63 },
                      { mo: 'Mar', cr: 112, egfr: 61 },
                      { mo: 'Apr', cr: 110, egfr: 62 },
                      { mo: 'May', cr: 111, egfr: 61 },
                      { mo: 'Jun', cr: 112, egfr: 61 },
                    ].map(m => (
                      <div key={m.mo} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '60%', height: m.cr * 0.8, borderRadius: '3px 3px 0 0', background: m.cr > 110 ? C.amber : C.sky, marginBottom: 2 }} />
                        <div style={{ width: '60%', height: m.egfr * 1.0, borderRadius: '3px 3px 0 0', background: C.green, opacity: 0.5 }} />
                        <div style={{ fontSize: 8, color: C.textLight, marginTop: 4 }}>{m.mo}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 8 }}>Creatinine (blue/amber) and eGFR (green) over 12 months</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ARRHYTHMIA ─── */}
          {tab === 'arrhythmia' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Arrhythmia Workspace</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Arrhythmia Tracking</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'AF', value: 'Paroxysmal', color: C.amber },
                      { label: 'VT', value: 'No', color: C.green },
                      { label: 'VF', value: 'No', color: C.green },
                      { label: 'PVC Burden', value: 'Low, <1%', color: C.green },
                      { label: 'ECG Timeline', value: 'SR with PACs', color: C.amber },
                      { label: 'Holter Monitoring', value: '24h: 0.5% burden', color: C.green },
                      { label: 'Device Detections', value: 'No events', color: C.green },
                      { label: 'Anticoagulation', value: 'Apixaban 5 mg BID', color: C.sky },
                    ].map(a => (
                      <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                        <div style={{ flex: 1 }}><span style={{ fontSize: 11, color: C.textLight }}>{a.label}</span></div>
                        <span style={S.badge(a.color)}>{a.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Latest ECG</div>
                    <div style={{ height: 80, background: C.panel, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(() => {
                        const lines: any[] = []
                        for (let i = 0; i < 40; i++) {
                          const y = 15 * Math.sin(i * 0.3) + 5 * Math.sin(i * 0.9) + 2 * Math.sin(i * 0.1)
                          lines.push(<span key={i} style={{ position: 'absolute', left: `${i * 2.5 + 5}%`, top: `${40 - y}px`, width: 3, height: 3, borderRadius: '50%', background: C.sky, fontSize: 0 }} />)
                        }
                        return <div style={{ width: '100%', height: 80, position: 'relative' }}>{lines}</div>
                      })()}
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 8, textAlign: 'center' }}>Sinus rhythm with occasional PACs · Rate 68 bpm · PR 160 ms · QRS 100 ms · QTc 420 ms</div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Anticoagulation</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: C.textLight }}>Drug:</span><span style={{ fontWeight: 600, color: C.navy }}>Apixaban</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: C.textLight }}>Dose:</span><span style={{ fontWeight: 600, color: C.navy }}>5 mg BID</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: C.textLight }}>Indication:</span><span style={{ fontWeight: 600, color: C.navy }}>Paroxysmal AF · CHA₂DS₂-VASc 4</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: C.textLight }}>DOAC Score:</span><span style={S.badge(C.green)}>Appropriate: 2</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── REHAB ─── */}
          {tab === 'rehab' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Exercise & Rehabilitation Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Not simply physiotherapy — structured aerobic and resistance training in stable HFrEF.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cardiac Rehabilitation</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Attendance</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>12/24 Sessions</div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: C.border, marginTop: 6 }}>
                        <div style={{ width: '50%', height: 6, borderRadius: 3, background: C.sky }} />
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Exercise Prescription</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10 }}>
                        <div><span style={{ color: C.textLight }}>Type:</span> <strong>Walking + Resistance</strong></div>
                        <div><span style={{ color: C.textLight }}>Freq:</span> <strong>3x/week</strong></div>
                        <div><span style={{ color: C.textLight }}>Duration:</span> <strong>30 min</strong></div>
                        <div><span style={{ color: C.textLight }}>Target HR:</span> <strong>95 bpm</strong></div>
                        <div><span style={{ color: C.textLight }}>Intensity:</span> <strong>Moderate</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Tracking Metrics</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, borderLeft: `3px solid ${C.green}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Walking Distance</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>340 m</div>
                      <div style={{ fontSize: 10, color: C.green }}>Improving</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, borderLeft: `3px solid ${C.sky}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Exercise Sessions</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>12/24 completed</div>
                      <div style={{ fontSize: 10, color: C.sky }}>In Progress</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, borderLeft: `3px solid ${C.amber}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Functional Recovery</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Moderate</div>
                      <div style={{ fontSize: 10, color: C.amber }}>Currently tracked</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Rehab Goals</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Complete 24 rehab sessions', progress: '50%', color: C.sky },
                    { label: 'Increase walk test to 400 m', progress: '65%', color: C.green },
                    { label: 'Improve functional class to daily activity', progress: '40%', color: C.amber },
                  ].map(g => (
                    <div key={g.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: C.text }}>{g.label}</span>
                        <span style={{ color: g.color, fontWeight: 600 }}>{g.progress}</span>
                      </div>
                      <div style={{ width: '100%', height: 8, borderRadius: 4, background: C.border }}>
                        <div style={{ width: g.progress, height: 8, borderRadius: 4, background: g.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── NUTRITION ─── */}
          {tab === 'nutrition' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Nutrition Workspace</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Nutritional Domains</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Salt Restriction', value: '2g/day', status: 'Compliant', color: C.green },
                      { label: 'Fluid Restriction', value: '1.5L/day', status: 'Partial', color: C.amber },
                      { label: 'Protein Intake', value: 'Adequate', status: 'Good', color: C.green },
                      { label: 'Weight Trends', value: 'Stable', status: 'On track', color: C.green },
                      { label: 'Cachexia', value: 'Absent', status: 'Good', color: C.green },
                      { label: 'Obesity', value: 'No', status: 'Normal BMI', color: C.green },
                      { label: 'Dietitian Interventions', value: 'Last: 2 weeks ago', status: 'Scheduled', color: C.amber },
                      { label: 'Nutritional Supplements', value: 'None', status: 'Not indicated', color: C.green },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{d.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{d.value}</span>
                        <span style={S.badge(d.color)}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Dietary Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Salt Limit (g/day)</label>
                      <select style={S.sel}><option>1g</option><option>2g (recommended)</option><option>3g</option><option>4g</option></select>
                    </div>
                    <div>
                      <label style={S.label}>Fluid Limit (L/day)</label>
                      <select style={S.sel}><option>1.0L</option><option>1.5L (recommended)</option><option>2.0L</option></select>
                    </div>
                    <div>
                      <label style={S.label}>Calorie Target</label>
                      <input style={S.input} placeholder="e.g. 1,800 kcal/day" />
                    </div>
                    <div>
                      <label style={S.label}>Protein Target</label>
                      <input style={S.input} placeholder="e.g. 60g/day" />
                    </div>
                    <button style={S.btn(C.green)}>Update Plan</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Home Monitoring Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Device Integration</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Blood Pressure', value: '122/76 mmHg', trend: 'Stable', color: C.green, time: '2 hrs ago' },
                      { label: 'Heart Rate', value: '70 bpm', trend: 'Stable', color: C.green, time: '2 hrs ago' },
                      { label: 'Weight', value: '74.2 kg', trend: '+0.3 kg', color: C.amber, time: 'Today' },
                      { label: 'Pulse Oximetry', value: '96%', trend: 'Normal', color: C.green, time: '2 hrs ago' },
                      { label: 'Activity', value: '4,200 steps', trend: 'Below target', color: C.amber, time: 'Today' },
                      { label: 'Device Transmission', value: '—', trend: 'Last transmission', color: C.green, time: '2 hrs ago' },
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
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Summary Insights</div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}08`, fontSize: 11, lineHeight: 1.6, color: C.text }}>
                      Patient John Kamau is stable. Weight trend shows a gradual increase of 0.3 kg. BP and HR within target range. Activity levels slightly below target for this week. Device transmission current.
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Device Management</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { device: 'BP Monitor', status: 'Connected', color: C.green },
                        { device: 'Weight Scale', status: 'Connected', color: C.green },
                        { device: 'Pulse Oximeter', status: 'Connected', color: C.green },
                        { device: 'Activity Tracker', status: 'Disconnected (3 days)', color: C.red },
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

          {/* ─── SYMPTOMS ─── */}
          {tab === 'symptoms' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Daily Symptom Tracker</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Reported Symptoms</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { q: 'Breathlessness?', opts: ['None', 'Mild', 'Mod', 'Severe'], sel: 'Mild' },
                      { q: 'Swelling?', opts: ['None', 'Mild', 'Mod', 'Severe'], sel: 'Mild' },
                      { q: 'Chest pain?', opts: ['Yes', 'No'], sel: 'No' },
                      { q: 'Dizziness?', opts: ['Yes', 'No'], sel: 'No' },
                      { q: 'Syncope?', opts: ['Yes', 'No'], sel: 'No' },
                      { q: 'Fatigue?', opts: ['None', 'Mild', 'Mod', 'Severe'], sel: 'Mild' },
                      { q: 'Orthopnea?', opts: ['None', 'Mild', 'Mod', 'Severe'], sel: 'None' },
                      { q: 'Medication taken?', opts: ['Yes', 'No'], sel: 'Yes' },
                    ].map(q => (
                      <div key={q.q} style={{ padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 11, color: C.text, marginBottom: 6 }}>{q.q}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {q.opts.map(o => (
                            <button key={o} style={{
                              padding: '4px 12px', borderRadius: 12, border: `1px solid ${o === q.sel ? C.sky : C.border}`,
                              background: o === q.sel ? C.sky : C.white, color: o === q.sel ? C.white : C.text, fontSize: 10, cursor: 'pointer', fontWeight: o === q.sel ? 600 : 400,
                            }}>{o}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button style={{ ...S.btn(C.sky), marginTop: 12, width: '100%' }}>Submit Symptom Report</button>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Heart Failure Stability Score</div>
                    <div style={{ textAlign: 'center', padding: 16 }}>
                      <div style={{ fontSize: 36, fontWeight: 700, color: C.navy }}>82</div>
                      <div style={{ fontSize: 12, color: C.textLight }}>Stability Score</div>
                      <div style={{ marginTop: 8 }}>
                        <span style={S.pill(C.green)}>Stable — Continue Monitoring</span>
                      </div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>7-Day Symptom Trend</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                        <span>Metric</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                      {[
                        { metric: 'Breathlessness', vals: ['2', '2', '3', '2', '1', '1', '1'] },
                        { metric: 'Swelling', vals: ['1', '1', '1', '1', '1', '1', '0'] },
                        { metric: 'Fatigue', vals: ['2', '2', '2', '2', '1', '1', '1'] },
                        { metric: 'Score', vals: ['75', '76', '73', '78', '80', '81', '82'] },
                      ].map(r => (
                        <div key={r.metric} style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, padding: '3px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                          <span style={{ fontWeight: 600, color: C.navy }}>{r.metric}</span>
                          {r.vals.map((v, i) => (
                            <span key={i} style={{ color: parseInt(v) > 2 ? C.amber : C.green }}>{v}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── AI ─── */}
          {tab === 'ai' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>AI Deterioration Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Continuous pattern detection across multiple domains — weight, vitals, labs, device data, symptoms.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Detected Risk Factors</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { icon: '↑', label: 'Weight +2.3 kg', color: C.red },
                      { icon: '↑', label: 'HR 78 bpm (↑ baseline)', color: C.amber },
                      { icon: '↓', label: 'Reduced Activity', color: C.amber },
                      { icon: '✗', label: 'Missed Medication (2 days)', color: C.red },
                      { icon: '↑', label: 'Increasing BNP 640 pg/mL', color: C.red },
                    ].map(r => (
                      <div key={r.label} style={{ padding: '8px 12px', borderRadius: 6, background: `${r.color}08`, border: `1px solid ${r.color}20`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: r.color }}>{r.icon}</span>
                        <span style={{ color: C.navy }}>{r.label}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 9, color: C.textLight }}>Detected</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, background: `${C.red}10`, border: `1px solid ${C.red}30`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertTriangle size={18} color={C.red} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>High Risk of Admission</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Alert care team — urgent review recommended</div>
                    </div>
                    <span style={S.badge(C.red)}>Alert</span>
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Explainable Decision Support</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { factor: 'Weight gain 2.3 kg', weight: '45%', bar: 90 },
                        { factor: 'BNP elevation 640 pg/mL', weight: '25%', bar: 60 },
                        { factor: 'Medication non-adherence', weight: '15%', bar: 40 },
                        { factor: 'HR elevation >75 bpm', weight: '10%', bar: 30 },
                        { factor: 'Reduced activity', weight: '5%', bar: 20 },
                      ].map(f => (
                        <div key={f.factor}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                            <span style={{ color: C.text }}>{f.factor}</span>
                            <span style={{ fontWeight: 600, color: C.navy }}>{f.weight}</span>
                          </div>
                          <div style={{ width: '100%', height: 6, borderRadius: 3, background: C.border }}>
                            <div style={{ width: `${f.bar}%`, height: 6, borderRadius: 3, background: f.bar >= 70 ? C.red : f.bar >= 40 ? C.amber : C.green }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Alert Settings</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { param: 'Weight change (1 week)', threshold: '>2 kg', color: C.red },
                        { param: 'HR increase (baseline)', threshold: '>15 bpm', color: C.amber },
                        { param: 'BNP increase', threshold: '>20%', color: C.red },
                        { param: 'Medication non-adherence', threshold: '>2 days', color: C.amber },
                      ].map(a => (
                        <div key={a.param} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <span style={{ color: C.text, flex: 1 }}>{a.param}</span>
                          <span style={S.badge(a.color)}>{a.threshold}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PREGNANCY ─── */}
          {tab === 'pregnancy' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Pregnancy Pathway</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Preconception Counselling</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Cardiac risk assessment completed', done: true },
                      { item: 'Medication review completed', done: true },
                      { item: 'Genetic counselling offered', done: true },
                      { item: 'Maternal mortality risk discussed', done: false },
                      { item: 'Cardiology-obstetric plan established', done: false },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        {c.done ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.textLight} />}
                        <span style={{ color: c.done ? C.navy : C.textLight }}>{c.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Maternal Cardiac Risk</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <label style={S.label}>Risk Classification</label>
                      <select style={S.sel}><option>mWHO Class I</option><option>mWHO Class II</option><option>mWHO Class III</option><option>mWHO Class IV</option></select>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.green}10`, fontSize: 10, color: C.green }}>
                      Current status: No active pregnancy — preconception phase
                    </div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication Safety</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 4, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                      <span>Drug</span><span>Dose</span><span>Safety Category</span><span>Action</span>
                    </div>
                    {[
                      { d: 'Bisoprolol', dose: '5 mg', cat: 'C — Caution', action: 'Continue' },
                      { d: 'Sacubitril/Valsartan', dose: '49/51 mg', cat: 'D — Contraindicated', action: 'Discontinue' },
                      { d: 'Spironolactone', dose: '25 mg', cat: 'C — Caution', action: 'Review' },
                    ].map(m => (
                      <div key={m.d} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 4, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        <span style={{ color: C.navy }}>{m.d}</span>
                        <span style={{ color: C.text }}>{m.dose}</span>
                        <span style={{ color: m.cat.includes('D') ? C.red : C.amber }}>{m.cat}</span>
                        <span style={{ color: m.action === 'Continue' ? C.green : C.red }}>{m.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fetal Monitoring</div>
                  <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Fetal growth, heart rate, ultrasound findings..." />
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Delivery Planning</div>
                  <textarea style={{ ...S.input, minHeight: 80 }} placeholder="Delivery mode, location, multidisciplinary team plan..." />
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Postpartum Follow-up</div>
                  <textarea style={{ ...S.input, minHeight: 80 }} placeholder="Postpartum monitoring plan, follow-up schedule, breastfeeding considerations..." />
                </div>
              </div>
            </div>
          )}

          {/* ─── PALLIATIVE ─── */}
          {tab === 'palliative' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Palliative Care Integration</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Advance Care Planning</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'ACP discussed', done: true },
                      { item: 'Code status documented', done: true },
                      { item: 'Surrogate decision-maker identified', done: true },
                      { item: 'Living will completed', done: false },
                    ].map(a => (
                      <div key={a.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        {a.done ? <CheckCircle size={14} color={C.green} /> : <XCircle size={14} color={C.textLight} />}
                        <span style={{ fontSize: 11, color: a.done ? C.navy : C.textLight }}>{a.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Symptom Control</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { sym: 'Pain', val: '2/10', color: C.green },
                      { sym: 'Dyspnea', val: '4/10', color: C.amber },
                      { sym: 'Fatigue', val: '6/10', color: C.amber },
                      { sym: 'Anxiety', val: '3/10', color: C.amber },
                    ].map(s => (
                      <div key={s.sym} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 11, color: C.text, width: 80 }}>{s.sym}</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border }}>
                          <div style={{ width: `${(parseInt(s.val.split('/')[0]) / 10) * 100}%`, height: 6, borderRadius: 3, background: s.color }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, minWidth: 36 }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Goals-of-Care Discussions</div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                    <div style={{ color: C.textLight }}>Recent Discussion (2 weeks ago)</div>
                    <div style={{ color: C.text, marginTop: 4 }}>Patient expressed desire for comfort-focused care. No escalation to ICU. Discussed home palliative support options with family.</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={S.label}>Next Discussion Scheduled</label>
                    <input style={S.input} type="date" />
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Home Support</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Palliative home care team', active: true },
                      { label: 'Community nurse visits', active: true },
                      { label: 'Oxygen therapy at home', active: false },
                      { label: 'Family caregiver training', active: true },
                      { label: 'Bereavement support', active: false },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        {s.active ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.textLight} />}
                        <span style={{ color: s.active ? C.navy : C.textLight }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Family Meetings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Date</span><span>Attendees</span><span>Summary</span><span>Follow-up</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                    <span style={{ color: C.navy }}>15 Mar 2025</span>
                    <span style={{ color: C.text }}>Spouse, Social Worker</span>
                    <span style={{ color: C.textLight }}>Discussed home hospice options</span>
                    <span style={{ color: C.sky }}>Pending</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {tab === 'team' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Multidisciplinary Team Workspace</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Heart Failure Care Team</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { role: 'HF Cardiologist', name: 'Dr. Kamau', contact: 'Ext. 3401', status: 'Available', color: C.green },
                      { role: 'Primary Care', name: 'Dr. Njoroge', contact: 'Ext. 2102', status: 'Available', color: C.green },
                      { role: 'HF Nurse', name: 'Sr. Atieno', contact: 'Ext. 3402', status: 'Busy', color: C.amber },
                      { role: 'Dietitian', name: 'Ms. Nyambura', contact: 'Ext. 4501', status: 'Available', color: C.green },
                      { role: 'Pharmacist', name: 'Mr. Otieno', contact: 'Ext. 5201', status: 'On Leave', color: C.red },
                      { role: 'Physiotherapist', name: 'Mr. Mwangi', contact: 'Ext. 4402', status: 'Available', color: C.green },
                      { role: 'Nephrologist', name: 'Dr. Wambui', contact: 'Ext. 3101', status: 'Consult', color: C.amber },
                      { role: 'Electrophysiologist', name: 'Dr. Patel', contact: 'Ext. 3405', status: 'Available', color: C.green },
                      { role: 'Cardiac Surgeon', name: 'Dr. Ochieng', contact: 'Ext. 3406', status: 'In Theatre', color: C.amber },
                      { role: 'Palliative Care', name: 'Dr. Chebet', contact: 'Ext. 6301', status: 'Available', color: C.green },
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
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recent Team Communications</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { from: 'Dr. Kamau (Cardiology)', msg: 'Reviewed John Kamau — recommend continuing GDMT optimization. Discuss MRA up-titration.', time: '2 hrs ago' },
                        { from: 'Sr. Atieno (HF Nurse)', msg: 'Patient weight +0.8 kg this week. Will monitor closely and review diuretic dosing.', time: '4 hrs ago' },
                        { from: 'Mr. Otieno (Pharmacy)', msg: 'Medication reconciliation completed. Adherence 92% for core therapy.', time: '1 day ago' },
                      ].map(c => (
                        <div key={c.from} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{c.from} · {c.time}</div>
                          <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>{c.msg}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Care Coordination</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label style={S.label}>Task</label>
                        <input style={S.input} placeholder="e.g. Arrange echocardiogram" />
                      </div>
                      <div>
                        <label style={S.label}>Assign To</label>
                        <select style={S.sel}>
                          <option>HF Cardiologist</option>
                          <option>HF Nurse</option>
                          <option>Dietitian</option>
                          <option>Pharmacist</option>
                        </select>
                      </div>
                      <button style={S.btn(C.sky)}>Assign Task</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === 'registry' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Heart Failure Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'All HFrEF', value: '342', color: C.sky },
                  { label: 'HFpEF', value: '156', color: C.purple },
                  { label: 'CRT Recipients', value: '89', color: C.green },
                  { label: 'ICD Recipients', value: '124', color: C.amber },
                  { label: 'Advanced HF', value: '45', color: C.red },
                  { label: 'Readmissions (30d)', value: '12', color: C.red },
                  { label: 'Transplants', value: '8', color: C.green },
                  { label: 'Mortality (YTD)', value: '24', color: C.red },
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
                    <select style={S.sel}><option>All Types</option><option>HFrEF</option><option>HFpEF</option><option>HFmrEF</option></select>
                    <select style={S.sel}><option>All Status</option><option>Stable</option><option>At Risk</option><option>Decompensated</option></select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Name</span><span>MRN</span><span>Type</span><span>LVEF</span><span>NYHA</span><span>Status</span><span>Last Visit</span>
                  </div>
                  {[
                    { name: 'John Kamau', mrn: 'HF-001', type: 'HFrEF', lvef: '32%', nyha: 'II', status: 'Stable', visit: '2 weeks ago' },
                    { name: 'Mary Atieno', mrn: 'HF-012', type: 'HFrEF', lvef: '28%', nyha: 'III', status: 'At Risk', visit: '1 week ago' },
                    { name: 'Samuel Ochieng', mrn: 'HF-024', type: 'HFpEF', lvef: '55%', nyha: 'II', status: 'Stable', visit: '1 month ago' },
                    { name: 'Grace Njeri', mrn: 'HF-036', type: 'HFrEF', lvef: '30%', nyha: 'III', status: 'Decompensated', visit: 'Today' },
                    { name: 'Peter Mwangi', mrn: 'HF-048', type: 'HFmrEF', lvef: '42%', nyha: 'II', status: 'Stable', visit: '3 weeks ago' },
                  ].map(p => (
                    <div key={p.mrn} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                      <span style={{ color: C.textLight }}>{p.mrn}</span>
                      <span style={{ color: C.text }}>{p.type}</span>
                      <span style={{ color: parseInt(p.lvef) < 35 ? C.red : C.navy }}>{p.lvef}</span>
                      <span style={{ color: C.text }}>{p.nyha}</span>
                      <span style={S.badge(
                        p.status === 'Stable' ? C.green : p.status === 'At Risk' ? C.amber : C.red
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
                  { metric: 'GDMT Completion', value: '72%', target: '80%', trend: '↑', color: C.amber },
                  { metric: 'EF Documentation', value: '88%', target: '95%', trend: '↑', color: C.amber },
                  { metric: 'NYHA Documentation', value: '92%', target: '95%', trend: '→', color: C.green },
                  { metric: '30-day Readmission', value: '14%', target: '<10%', trend: '↑', color: C.red },
                  { metric: '90-day Readmission', value: '22%', target: '<15%', trend: '↓', color: C.red },
                  { metric: 'Mortality', value: '6.5%', target: '<5%', trend: '↓', color: C.amber },
                  { metric: 'Cardiac Rehab Attendance', value: '45%', target: '70%', trend: '↑', color: C.red },
                  { metric: 'Vaccination Status', value: '68%', target: '90%', trend: '↑', color: C.amber },
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
                    { title: 'GDMT Optimization Program', desc: 'Increase GDMT completion from 72% to 85% through pharmacist-led titration clinic', progress: '65%', color: C.sky },
                    { title: 'Cardiac Rehab Enrollment Initiative', desc: 'Automated referral system for all eligible HF patients post-discharge', progress: '40%', color: C.amber },
                    { title: '30-Day Readmission Reduction', desc: 'Transitional care bundle: nurse follow-up, medication reconciliation, early clinic visit', progress: '55%', color: C.green },
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
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Stable</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Compensated — no active congestion</div>
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Dashboard</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>Weight Trend</div>
                        <div style={{ height: 40, background: C.border, borderRadius: 4, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.textLight }}>[Graph placeholder]</div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ color: C.textLight }}>Medication Reminders</div>
                        {['Sacubitril/Valsartan 49/51 mg BID', 'Bisoprolol 5 mg OD', 'Spironolactone 25 mg OD', 'Dapagliflozin 10 mg OD'].map(m => (
                          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                            <CheckCircle size={10} color={C.green} />
                            <span style={{ color: C.text }}>{m}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Fluid Allowance</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>1.5L</div>
                          <div style={{ color: C.green }}>/day</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Salt Goals</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2g</div>
                          <div style={{ color: C.green }}>/day</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Activity Goals</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>90 min</div>
                          <div style={{ color: C.textLight }}>/150 min/week</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Next Appointment</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2 weeks</div>
                          <div style={{ color: C.textLight }}>Cardiology Clinic</div>
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
                      { title: 'HF Education', desc: 'Understanding your heart failure', icon: BookOpen, color: C.sky },
                      { title: 'Fluid Management', desc: 'Managing fluid intake daily', icon: Droplets, color: C.sky },
                      { title: 'Medication Adherence', desc: 'Why daily meds matter', icon: Pill, color: C.sky },
                      { title: 'Warning Signs', desc: 'When to call your care team', icon: AlertTriangle, color: C.sky },
                    ].map(e => (
                      <div key={e.title} style={{ padding: '12px', borderRadius: 8, background: C.panel, cursor: 'pointer' }}>
                        <e.icon size={20} color={e.color} />
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginTop: 6 }}>{e.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>{e.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Communication</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea style={{ ...S.input, minHeight: 120, resize: 'vertical' }} placeholder="Send a secure message to your care team..." />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={S.btn(C.sky)}><Send size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Send Message</button>
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