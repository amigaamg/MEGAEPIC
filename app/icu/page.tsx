'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, type LucideIcon } from 'lucide-react'
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
}

const statusIcon = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Given': case 'Weaned': return <CheckCircle size={14} color={C.green} />
    case 'Active': case 'Running': case 'Ventilated': return <Clock size={14} color={C.sky} />
    case 'Pending': case 'Ordered': case 'Scheduled': return <Clock size={14} color={C.amber} />
    case 'Critical': case 'Alert': case 'Deteriorating': return <AlertTriangle size={14} color={C.red} />
    default: return <Clock size={14} color={C.textLight} />
  }
}

const statusColor = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Given': case 'Weaned': case 'Available': return C.green
    case 'Active': case 'Running': case 'Ventilated': case 'In Progress': return C.sky
    case 'Pending': case 'Ordered': case 'Scheduled': case 'Stable': return C.amber
    case 'Critical': case 'Alert': case 'Deteriorating': case 'Unstable': case 'Down': return C.red
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'command', label: 'ICU Command Center', icon: Activity },
  { id: 'board', label: 'ICU Board', icon: Bed },
  { id: 'organs', label: 'Organ-Based Workspace', icon: Heart },
  { id: 'monitoring', label: 'Continuous Monitoring', icon: Monitor },
  { id: 'ventilator', label: 'Ventilator', icon: Wind },
  { id: 'infusions', label: 'Infusion Engine', icon: Syringe },
  { id: 'fluids', label: 'Fluid Intelligence', icon: Droplets },
  { id: 'goals', label: 'Daily Goals', icon: CheckCircle },
  { id: 'round', label: 'ICU Ward Round', icon: Stethoscope },
  { id: 'rapid', label: 'Rapid Response', icon: Ambulance },
  { id: 'code-blue', label: 'Code Blue', icon: AlertTriangle },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Doctor Workspace', href: '/doctor' },
  { label: 'Nurse Workspace', href: '/nurse' },
  { label: 'Lab Workspace', href: '/laboratory' },
  { label: 'Pharmacy', href: '/pharmacy' },
  { label: 'Radiology', href: '/radiology' },
  { label: 'Theatre', href: '/theatre' },
  { label: 'Emergency', href: '/emergency' },
  { label: 'Diabetes', href: '/diabetes' },
  { label: 'Hypertension', href: '/hypertension' },
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

const ICU_PATIENTS = [
  { bed: '01', name: 'James Mwangi', age: '2 yrs M', diagnosis: 'Severe Malaria', ventilator: 'SIMV', fio2: 40, peep: 5, noradrenaline: '0.12', urine: '0.4', sofa: 11, status: 'Critical', admission: 'Day 3', isolation: false },
  { bed: '02', name: 'Mary Achieng', age: '45 yrs F', diagnosis: 'Septic Shock', ventilator: 'PRVC', fio2: 55, peep: 8, noradrenaline: '0.35', urine: '0.2', sofa: 14, status: 'Deteriorating', admission: 'Day 1', isolation: true },
  { bed: '03', name: 'Peter Otieno', age: '67 yrs M', diagnosis: 'Post-Laparotomy', ventilator: 'CPAP', fio2: 35, peep: 5, noradrenaline: '0.05', urine: '1.2', sofa: 6, status: 'Stable', admission: 'Day 5', isolation: false },
  { bed: '04', name: 'Grace Wanjiku', age: '30 yrs F', diagnosis: 'DKA', ventilator: 'None', fio2: 21, peep: 0, noradrenaline: '0.00', urine: '1.8', sofa: 3, status: 'Improving', admission: 'Day 2', isolation: false },
]

const VENTILATORS = [
  { patient: 'James Mwangi', mode: 'SIMV', fio2: 40, peep: 5, tv: 120, pp: 22, dp: 12, mv: 2.4, abg: 'pH 7.35, pCO2 42, pO2 98', weaning: 'Not ready' },
  { patient: 'Mary Achieng', mode: 'PRVC', fio2: 55, peep: 8, tv: 380, pp: 28, dp: 16, mv: 6.8, abg: 'pH 7.28, pCO2 48, pO2 82', weaning: 'Not ready' },
  { patient: 'Peter Otieno', mode: 'CPAP', fio2: 35, peep: 5, tv: 450, pp: 18, dp: 8, mv: 6.2, abg: 'pH 7.40, pCO2 38, pO2 105', weaning: 'SBT tomorrow' },
]

const INFUSIONS = [
  { drug: 'Noradrenaline', patient: 'Mary Achieng', rate: '12 mL/hr', dose: '0.35 mcg/kg/min', conc: '4 mg/50 mL', syringe: '50 mL', remaining: '38 mL', pump: 'Alaris #1' },
  { drug: 'Propofol', patient: 'James Mwangi', rate: '5 mL/hr', dose: '2 mg/kg/hr', conc: '200 mg/50 mL', syringe: '50 mL', remaining: '22 mL', pump: 'Alaris #2' },
  { drug: 'Insulin', patient: 'Grace Wanjiku', rate: '2 mL/hr', dose: '2 units/hr', conc: '50 units/50 mL', syringe: '50 mL', remaining: '40 mL', pump: 'Alaris #3' },
  { drug: 'Midazolam', patient: 'Mary Achieng', rate: '3 mL/hr', dose: '0.1 mg/kg/hr', conc: '50 mg/50 mL', syringe: '50 mL', remaining: '18 mL', pump: 'Alaris #4' },
  { drug: 'Morphine', patient: 'Peter Otieno', rate: '2 mL/hr', dose: '1 mg/hr', conc: '50 mg/50 mL', syringe: '50 mL', remaining: '30 mL', pump: 'Syringe #1' },
]

const DAILY_GOALS = [
  { goal: 'Extubate', patient: 'Peter Otieno', status: 'Planned', assignee: 'Dr. Kamau' },
  { goal: 'Reduce Noradrenaline', patient: 'Mary Achieng', status: 'In Progress', assignee: 'Dr. Ochieng' },
  { goal: 'Start Enteral Feeds', patient: 'James Mwangi', status: 'Pending', assignee: 'Dietitian' },
  { goal: 'Remove Central Line', patient: 'Peter Otieno', status: 'Not Ready', assignee: 'Dr. Kamau' },
  { goal: 'Dialysis', patient: 'Mary Achieng', status: 'Running', assignee: 'Nephrology' },
  { goal: 'Culture Review', patient: 'James Mwangi', status: 'Pending', assignee: 'Microbiology' },
  { goal: 'Mobilize', patient: 'Grace Wanjiku', status: 'Completed', assignee: 'Physio' },
]

const RAPID_RESPONSES = [
  { time: '08:15', ward: 'Medical Ward III', trigger: 'NEWS 8', patient: 'James Mwangi', outcome: 'Transferred to ICU', status: 'Completed' },
  { time: '10:30', ward: 'Surgical Ward', trigger: 'SpO₂ 82%', patient: 'Mary Achieng', outcome: 'ICU Admission', status: 'Completed' },
  { time: '13:00', ward: 'Medical Ward II', trigger: 'Hypotension 70/40', patient: 'Samuel Kiprop', outcome: 'Fluid Resuscitated — stayed on ward', status: 'Monitoring' },
]

const OBS = [
  { time: '06:00', hr: 158, bp: '90/60', rr: 42, spo2: 89, temp: 39.2, uo: 0.3, lact: 4.2 },
  { time: '08:00', hr: 148, bp: '88/58', rr: 38, spo2: 91, temp: 38.7, uo: 0.4, lact: 3.8 },
  { time: '10:00', hr: 140, bp: '92/62', rr: 36, spo2: 93, temp: 38.2, uo: 0.5, lact: 3.1 },
  { time: '12:00', hr: 132, bp: '96/65', rr: 32, spo2: 95, temp: 37.6, uo: 0.7, lact: 2.4 },
]

export default function ICUWorkspace() {
  const [tab, setTab] = useState('command')
  const [selectedBed, setSelectedBed] = useState('01')
  const [goalNewPatient, setGoalNewPatient] = useState('')
  const [goalNewGoal, setGoalNewGoal] = useState('')
  const [goalNewStatus, setGoalNewStatus] = useState('Pending')
  const [rapidTrigger, setRapidTrigger] = useState('')
  const [rapidWard, setRapidWard] = useState('')
  const [cprActive, setCprActive] = useState(false)
  const [cprTime, setCprTime] = useState(0)
  const [shockCount, setShockCount] = useState(0)

  const selected = ICU_PATIENTS.find(p => p.bed === selectedBed)

  const startCode = () => {
    setCprActive(true)
    setCprTime(0)
    setShockCount(0)
    const interval = setInterval(() => {
      setCprTime(prev => { if (prev >= 300) { clearInterval(interval); return prev } return prev + 1 })
    }, 1000)
  }

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Critical Care · ICU</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: C.textLight }}>{ICU_PATIENTS.length} patients · {ICU_PATIENTS.filter(p => p.status === 'Critical' || p.status === 'Deteriorating').length} high risk</div>
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>IC</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>ICU</div>
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
          {/* ─── ICU COMMAND CENTER ─── */}
          {tab === 'command' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>ICU Command Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Real-time unit overview</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.red)}>{ICU_PATIENTS.filter(p => p.status === 'Critical' || p.status === 'Deteriorating').length} Critical</span>
                  <span style={S.pill(C.amber)}>{ICU_PATIENTS.filter(p => p.status === 'Stable').length} Stable</span>
                  <span style={S.pill(C.green)}>{ICU_PATIENTS.filter(p => p.status === 'Improving').length} Improving</span>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'ICU Beds', value: `${ICU_PATIENTS.length}/8`, icon: Bed, color: C.sky },
                  { label: 'Ventilators', value: VENTILATORS.filter(v => v.weaning !== 'Weaned').length, icon: Wind, color: C.sky },
                  { label: 'Vasopressors', value: INFUSIONS.filter(i => i.drug === 'Noradrenaline').length, icon: Droplets, color: C.red },
                  { label: 'CRRT', value: '1', icon: Activity, color: C.amber },
                  { label: 'SOFA ≥10', value: ICU_PATIENTS.filter(p => p.sofa >= 10).length, icon: Heart, color: C.red },
                  { label: 'Pending ABGs', value: '3', icon: Thermometer, color: C.amber },
                  { label: 'Dialysis', value: DAILY_GOALS.filter(g => g.goal === 'Dialysis' && g.status === 'Running').length, icon: Activity, color: C.sky },
                  { label: 'Step-down Ready', value: ICU_PATIENTS.filter(p => p.sofa < 5).length, icon: ArrowRight, color: C.green },
                ].map(s => (
                  <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <s.icon size={18} color={s.color} />
                      <div style={{ fontSize: 11, color: C.textLight }}>{s.label}</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.navy }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>High-Risk Patients</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ICU_PATIENTS.filter(p => p.status === 'Critical' || p.status === 'Deteriorating').map(p => (
                    <div key={p.bed} style={{ padding: '10px 14px', borderRadius: 8, background: `${C.red}08`, border: `1px solid ${C.red}25`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'Critical' ? C.red : C.amber, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name} · Bed {p.bed}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{p.diagnosis} · SOFA {p.sofa} · Day {p.admission}</div>
                      </div>
                      <span style={S.badge(p.status === 'Critical' ? C.red : C.amber)}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── ICU BOARD ─── */}
          {tab === 'board' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>ICU Patient Board</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Bed · Patient · Ventilator · Vasopressors · Urine · SOFA</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.badge(C.green)}>{ICU_PATIENTS.filter(p => !p.ventilator || p.ventilator === 'None').length} Spontaneous</span>
                  <span style={S.badge(C.sky)}>{ICU_PATIENTS.filter(p => p.sofa >= 10).length} SOFA ≥10</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {ICU_PATIENTS.map(p => {
                  const color = p.status === 'Critical' || p.status === 'Deteriorating' ? C.red : p.status === 'Stable' ? C.amber : C.green
                  return (
                    <div key={p.bed} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${color}`, cursor: 'pointer' }}
                      onClick={() => { setSelectedBed(p.bed); setTab('organs') }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Bed {p.bed}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: C.textLight }}>{p.age} · {p.diagnosis} · {p.admission}</div>
                        </div>
                        <span style={S.badge(color)}>{p.status}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                        <div><span style={{ color: C.textLight }}>Vent:</span> <strong>{p.ventilator || 'Spontaneous'}</strong></div>
                        <div><span style={{ color: C.textLight }}>FiO₂:</span> <strong>{p.fio2}%</strong></div>
                        <div><span style={{ color: C.textLight }}>PEEP:</span> <strong>{p.peep} cmH₂O</strong></div>
                        <div><span style={{ color: C.textLight }}>Norad:</span> <strong>{p.noradrenaline} mcg</strong></div>
                        <div><span style={{ color: C.textLight }}>Urine:</span> <strong>{p.urine} mL/kg/hr</strong></div>
                        <div><span style={{ color: C.textLight }}>SOFA:</span> <strong style={{ color: p.sofa >= 10 ? C.red : C.navy }}>{p.sofa}</strong></div>
                      </div>
                      {p.isolation && <div style={{ marginTop: 8 }}><span style={S.pill(C.amber)}>🧪 Isolation</span></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── ORGAN-BASED WORKSPACE ─── */}
          {tab === 'organs' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Organ-Based Workspace</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>{selected?.name || 'None'}</strong> · Bed {selected?.bed} · {selected?.diagnosis} · SOFA {selected?.sofa}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { title: 'Neurology', color: C.purple, fields: ['GCS: 13 (E4 V4 M5)', 'Pupils: 3mm bilaterally reactive', 'Sedation: Propofol 2 mg/kg/hr', 'Delirium: Negative (CAM-ICU)', 'Seizures: None since admission'] },
                  { title: 'Respiratory', color: C.sky, fields: [`Vent: SIMV · FiO₂ ${selected?.fio2 || '—'}% · PEEP ${selected?.peep || '—'}`, 'Tidal Volume: 120 mL (8 mL/kg)', 'Plateau Pressure: 22 cmH₂O', 'Driving Pressure: 12 cmH₂O', 'ABG: pH 7.35 pCO₂ 42 pO₂ 98', 'CXR: Bilateral infiltrates improving'] },
                  { title: 'Cardiovascular', color: C.red, fields: ['HR: 132 bpm', 'BP: 96/65 (MAP 75)', 'Noradrenaline: 0.12 mcg/kg/min', 'Lactate: 2.4 (↓ from 4.2)', 'ECG: Sinus tachycardia', 'Echo: Normal LV function'] },
                  { title: 'Renal', color: C.amber, fields: ['Urine Output: 0.7 mL/kg/hr (↑)', 'Creatinine: 88 mmol/L', 'Na: 138 · K+: 4.0', 'Fluid Balance: +850 mL (24h)', 'RRT: Not required', 'Catheter: Patent'] },
                  { title: 'GI / Nutrition', color: C.green, fields: ['NG Tube: Feeding', 'Feeds: Ensure 30 mL/hr', 'Bowel: Not opened today', 'Abdomen: Soft, non-distended', 'LFTs: Normal'] },
                  { title: 'Hematology / ID', color: C.purple, fields: ['Hb: 9.8 g/dL', 'Plt: 210', 'INR: 1.2', 'WBC: 12.4', 'CRP: 48 (↓ from 120)', 'Cultures: Blood — pending'] },
                ].map(org => (
                  <div key={org.title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderTop: `3px solid ${org.color}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 10 }}>{org.title}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {org.fields.map((f, i) => (
                        <div key={i} style={{ fontSize: 11, color: C.text, padding: '4px 0', borderBottom: i < org.fields.length - 1 ? `1px solid ${C.panel}` : 'none' }}>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CONTINUOUS MONITORING ─── */}
          {tab === 'monitoring' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Continuous Monitoring</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Real-time trended physiological data · Patient: {selected?.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Heart Rate', val: '132', unit: 'bpm', trend: '↓ Improving', color: C.green },
                  { label: 'MAP', val: '75', unit: 'mmHg', trend: '↑ Improving', color: C.green },
                  { label: 'SpO₂', val: '95', unit: '%', trend: '↑ Improving', color: C.green },
                  { label: 'Temp', val: '37.6', unit: '°C', trend: '↓ Improving', color: C.green },
                  { label: 'RR', val: '32', unit: '/min', trend: '↓ Improving', color: C.green },
                  { label: 'Lactate', val: '2.4', unit: 'mmol/L', trend: '↓ Improving', color: C.green },
                  { label: 'Urine Output', val: '0.7', unit: 'mL/kg/hr', trend: '↑ Improving', color: C.green },
                  { label: 'CVP', val: '8', unit: 'mmHg', trend: 'Stable', color: C.amber },
                ].map(v => (
                  <div key={v.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{v.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{v.val}<span style={{ fontSize: 11, fontWeight: 400, color: C.textLight }}> {v.unit}</span></div>
                    <div style={{ fontSize: 10, color: v.color, marginTop: 2 }}>{v.trend}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Vital Signs Trend (Today)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {OBS.map(o => (
                    <div key={o.time} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{o.time}</span>
                      <span>HR {o.hr}</span>
                      <span>BP {o.bp}</span>
                      <span>RR {o.rr}</span>
                      <span>SpO₂ {o.spo2}%</span>
                      <span>Temp {o.temp}</span>
                      <span>UO {o.uo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── VENTILATOR ─── */}
          {tab === 'ventilator' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Ventilator Workspace</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Mode · FiO₂ · PEEP · Tidal Volume · Plateau Pressure · ABGs · Weaning</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {VENTILATORS.map(v => (
                  <div key={v.patient} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{v.patient}</div>
                        <div style={{ fontSize: 12, color: C.textLight }}>Mode: <strong>{v.mode}</strong></div>
                      </div>
                      <span style={S.badge(v.weaning === 'SBT tomorrow' ? C.amber : v.weaning === 'Not ready' ? C.red : C.green)}>{v.weaning}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, fontSize: 11 }}>
                      <div><span style={{ color: C.textLight }}>FiO₂:</span> <strong>{v.fio2}%</strong></div>
                      <div><span style={{ color: C.textLight }}>PEEP:</span> <strong>{v.peep} cmH₂O</strong></div>
                      <div><span style={{ color: C.textLight }}>TV:</span> <strong>{v.tv} mL</strong></div>
                      <div><span style={{ color: C.textLight }}>Plateau:</span> <strong>{v.pp} cmH₂O</strong></div>
                      <div><span style={{ color: C.textLight }}>Driving P:</span> <strong>{v.dp} cmH₂O</strong></div>
                      <div><span style={{ color: C.textLight }}>MV:</span> <strong>{v.mv} L/min</strong></div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: C.textLight }}>ABG:</span> <strong>{v.abg}</strong></div>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                      <button style={S.btn(C.sky)}>Update Settings</button>
                      <button style={S.btnO}>View Trends</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── INFUSION ENGINE ─── */}
          {tab === 'infusions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Infusion Engine</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Drug · Rate · Dose · Syringe · Pump · Status</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {INFUSIONS.map(inf => (
                  <div key={inf.drug + inf.patient} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{inf.drug}</div>
                        <div style={{ fontSize: 12, color: C.textLight }}>{inf.patient}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={S.pill(C.sky)}>{inf.rate}</span>
                        <span style={S.pill(C.amber)}>{inf.remaining} left</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, fontSize: 11 }}>
                      <div><span style={{ color: C.textLight }}>Dose:</span> <strong>{inf.dose}</strong></div>
                      <div><span style={{ color: C.textLight }}>Conc:</span> <strong>{inf.conc}</strong></div>
                      <div><span style={{ color: C.textLight }}>Syringe:</span> <strong>{inf.syringe}</strong></div>
                      <div><span style={{ color: C.textLight }}>Pump:</span> <strong>{inf.pump}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── FLUID INTELLIGENCE ─── */}
          {tab === 'fluids' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Fluid Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Hourly · 24h · Cumulative Balance — Patient: {selected?.name}</div>
              <div style={S.grid3}>
                {[
                  { label: 'Hourly Balance', val: '+45 mL', color: C.green },
                  { label: '24h Input', val: '2850 mL', color: C.sky },
                  { label: '24h Output', val: '1950 mL', color: C.sky },
                  { label: '24h Balance', val: '+900 mL', color: C.amber },
                  { label: 'Cumulative (48h)', val: '+1550 mL', color: C.red },
                  { label: 'Urine Output', val: '0.7 mL/kg/hr', color: C.green },
                ].map(s => (
                  <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Hourly Fluid Balance Chart</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['06:00', '08:00', '10:00', '12:00'].map((h, i) => {
                    const o = OBS[i]
                    const input = 150 + i * 20
                    const output = o.uo * 60
                    return (
                      <div key={h} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{h}</span>
                        <span>Input: {input} mL</span>
                        <span>Output: {output} mL</span>
                        <span>Balance: <strong style={{ color: input - output > 0 ? C.amber : C.green }}>{input - output > 0 ? '+' : ''}{input - output} mL</strong></span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── DAILY GOALS ─── */}
          {tab === 'goals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Daily Goals</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Today's multidisciplinary checklist</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Today's Goals</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {DAILY_GOALS.map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                        <input type="checkbox" checked={g.status === 'Completed'} style={{ accentColor: C.sky }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{g.goal}</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>{g.patient} · {g.assignee}</div>
                        </div>
                        <span style={S.badge(
                          g.status === 'Completed' ? C.green : g.status === 'In Progress' || g.status === 'Running' ? C.sky : g.status === 'Planned' ? C.amber : C.red
                        )}>{g.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Add New Goal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Patient</label>
                      <select style={S.sel} value={goalNewPatient} onChange={e => setGoalNewPatient(e.target.value)}>
                        <option value="">Select patient...</option>
                        {ICU_PATIENTS.map(p => <option key={p.bed} value={p.name}>{p.name} · Bed {p.bed}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Goal</label>
                      <input style={S.input} placeholder="e.g. Extubate, Mobilize, Remove line" value={goalNewGoal} onChange={e => setGoalNewGoal(e.target.value)} />
                    </div>
                    <div>
                      <label style={S.label}>Status</label>
                      <select style={S.sel} value={goalNewStatus} onChange={e => setGoalNewStatus(e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Planned">Planned</option>
                      </select>
                    </div>
                    <button style={S.btn(C.sky)}>Add Goal</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ICU WARD ROUND ─── */}
          {tab === 'round' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>ICU Ward Round</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ICU_PATIENTS.map(p => (
                  <div key={p.bed} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>Bed {p.bed} · {p.name}</div>
                      <span style={S.badge(p.status === 'Critical' ? C.red : p.status === 'Stable' ? C.amber : C.green)}>{p.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 11 }}>
                      <div>
                        <div style={{ color: C.textLight, fontWeight: 600, marginBottom: 4 }}>Overnight Events</div>
                        <div style={{ color: C.text }}>Stable overnight. Noradrenaline weaned from 0.18 to 0.12. Urine output improving.</div>
                      </div>
                      <div>
                        <div style={{ color: C.textLight, fontWeight: 600, marginBottom: 4 }}>Today's Plan</div>
                        <div style={{ color: C.text }}>Continue weaning. Check ABG at 14:00. Review cultures.</div>
                      </div>
                      <div>
                        <div style={{ color: C.textLight, fontWeight: 600, marginBottom: 4 }}>Concerns</div>
                        <div style={{ color: C.text }}>Lactate still mildly elevated. Monitor for fluid overload.</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button style={S.btn(C.sky)}>Complete Round Entry</button>
                      <button style={S.btnO}>Family Update</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── RAPID RESPONSE ─── */}
          {tab === 'rapid' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Rapid Response System</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Trigger → Assessment → Disposition</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>New Rapid Response</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Trigger</label>
                      <select style={S.sel} value={rapidTrigger} onChange={e => setRapidTrigger(e.target.value)}>
                        <option value="">Select trigger...</option>
                        <option value="NEWS ≥5">NEWS ≥5</option>
                        <option value="Hypotension">Hypotension</option>
                        <option value="SpO₂ <90%">SpO₂ &lt;90%</option>
                        <option value="Seizures">Seizures</option>
                        <option value="Reduced GCS">Reduced GCS</option>
                        <option value="Cardiac Arrest">Cardiac Arrest</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Ward</label>
                      <select style={S.sel} value={rapidWard} onChange={e => setRapidWard(e.target.value)}>
                        <option value="">Select ward...</option>
                        <option value="Medical Ward I">Medical Ward I</option>
                        <option value="Medical Ward II">Medical Ward II</option>
                        <option value="Medical Ward III">Medical Ward III</option>
                        <option value="Surgical Ward">Surgical Ward</option>
                        <option value="Pediatrics">Pediatrics</option>
                      </select>
                    </div>
                    <button style={S.btn(C.red)}>Activate Rapid Response</button>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Recent Responses</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {RAPID_RESPONSES.map((r, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, fontSize: 11 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, color: C.navy }}>{r.time} · {r.ward}</span>
                          <span style={S.badge(r.status === 'Completed' ? C.green : C.amber)}>{r.status}</span>
                        </div>
                        <div style={{ color: C.text }}>{r.trigger} — {r.patient}</div>
                        <div style={{ color: C.textLight }}>Outcome: {r.outcome}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── CODE BLUE ─── */}
          {tab === 'code-blue' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Code Blue</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>CPR Timer · Shock Counter · Drug Timer · Rhythm Timeline · ROSC</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...S.btn(C.red), fontSize: 14, padding: '12px 28px' }} onClick={startCode}>🚨 Start Code Blue</button>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>CPR Timer</div>
                  <div style={{ fontSize: 48, fontWeight: 700, color: cprActive ? C.red : C.textLight, textAlign: 'center', padding: 24 }}>
                    {Math.floor(cprTime / 60)}:{(cprTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button style={S.btn(cprActive ? C.amber : C.green)} onClick={() => setCprActive(!cprActive)}>
                      {cprActive ? 'Pause' : 'Resume'}
                    </button>
                    <button style={S.btn(C.green)} onClick={() => setCprTime(0)}>Reset</button>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Shock Counter</div>
                  <div style={{ fontSize: 48, fontWeight: 700, color: C.amber, textAlign: 'center', padding: 24 }}>
                    {shockCount}
                  </div>
                  <button style={S.btn(C.amber)} onClick={() => setShockCount(prev => prev + 1)}>
                    Record Shock Delivered
                  </button>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Drug Timer</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { drug: 'Epinephrine 1 mg', due: 'q3-5min', last: '—' },
                      { drug: 'Amiodarone 300 mg', due: 'After 3rd shock', last: '—' },
                      { drug: 'Sodium Bicarbonate', due: 'If prolonged arrest', last: '—' },
                    ].map(d => (
                      <div key={d.drug} style={{ padding: '8px 10px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, fontSize: 11 }}>
                        <div style={{ fontWeight: 600, color: C.navy }}>{d.drug}</div>
                        <div style={{ color: C.textLight }}>Due: {d.due} · Last: {d.last}</div>
                        <button style={{ marginTop: 4, padding: '3px 8px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 10, cursor: 'pointer' }}>Record Given</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Rhythm Timeline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { time: '0:00', rhythm: 'VF', action: 'Defibrillated' },
                      { time: '2:00', rhythm: 'VF', action: 'Defibrillated + Epinephrine' },
                      { time: '4:00', rhythm: 'VT', action: 'Defibrillated + Amiodarone' },
                      { time: '6:00', rhythm: 'ROSC', action: 'Pulse Returned' },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 8px', borderRadius: 4, background: r.rhythm === 'ROSC' ? `${C.green}10` : C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 700, color: C.navy, minWidth: 36 }}>{r.time}</span>
                        <span style={{ color: r.rhythm === 'ROSC' ? C.green : C.red, fontWeight: 600 }}>{r.rhythm}</span>
                        <span style={{ color: C.textLight }}>— {r.action}</span>
                      </div>
                    ))}
                  </div>
                  <button style={{ ...S.btn(C.green), marginTop: 10, width: '100%' }}>Declare ROSC</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
