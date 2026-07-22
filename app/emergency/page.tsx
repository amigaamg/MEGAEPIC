'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, UserPlus, ClipboardList, ArrowRightLeft, LogOut, Send, Eye, Hospital, Building, Filter, MoreHorizontal, Zap, Truck, Bone, Brain, type LucideIcon } from 'lucide-react'
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
    case 'Completed': case 'Verified': case 'Given': case 'Stable': return <CheckCircle size={14} color={C.green} />
    case 'Active': case 'Running': case 'In Progress': return <Clock size={14} color={C.sky} />
    case 'Pending': case 'Ordered': case 'Waiting': return <Clock size={14} color={C.amber} />
    case 'Critical': case 'Alert': case 'Deteriorating': case 'Resus': return <AlertTriangle size={14} color={C.red} />
    default: return <Clock size={14} color={C.textLight} />
  }
}

const statusColor = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Given': case 'Stable': case 'Discharged': case 'Vacant': return C.green
    case 'Active': case 'Running': case 'In Progress': case 'Occupied': case 'Arrived': return C.sky
    case 'Pending': case 'Ordered': case 'Waiting': case 'Evaluating': return C.amber
    case 'Critical': case 'Alert': case 'Deteriorating': case 'Resus': case 'RED': case 'ORANGE': return C.red
    case 'YELLOW': return C.amber
    case 'GREEN': return C.green
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'command', label: 'Command Center', icon: Activity },
  { id: 'arrival', label: 'Arrival', icon: UserPlus },
  { id: 'triage', label: 'Dynamic Triage', icon: AlertTriangle },
  { id: 'resuscitation', label: 'Resuscitation ABCDE', icon: Heart },
  { id: 'trauma', label: 'Trauma ATLS', icon: Truck },
  { id: 'pathways', label: 'Time-Critical Pathways', icon: Clock },
  { id: 'observation', label: 'Observation Unit', icon: Eye },
  { id: 'procedures', label: 'Procedures', icon: Syringe },
  { id: 'medications', label: 'Emergency Medications', icon: Pill },
  { id: 'monitoring', label: 'Monitoring', icon: Monitor },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'disposition', label: 'Disposition Engine', icon: ArrowRight },
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

const ARRIVAL_PATIENTS = [
  { name: 'John Smith', age: 45, gender: 'M', mrn: 'EM-2024-001', complaint: 'Chest pain', mode: 'Ambulance', triage: 'RED', time: '08:15', waitMin: 5 },
  { name: 'Mary Jones', age: 32, gender: 'F', mrn: 'EM-2024-002', complaint: 'Abdominal pain', mode: 'Walk-in', triage: 'YELLOW', time: '09:30', waitMin: 18 },
  { name: 'David Wilson', age: 67, gender: 'M', mrn: 'EM-2024-003', complaint: 'Shortness of breath', mode: 'Ambulance', triage: 'ORANGE', time: '10:00', waitMin: 12 },
  { name: 'Sarah Brown', age: 28, gender: 'F', mrn: 'EM-2024-004', complaint: 'Head injury', mode: 'Police', triage: 'ORANGE', time: '10:45', waitMin: 8 },
  { name: 'Robert Lee', age: 55, gender: 'M', mrn: 'EM-2024-005', complaint: 'Severe headache', mode: 'Walk-in', triage: 'YELLOW', time: '11:20', waitMin: 3 },
]

const TRIAGE_QUEUE = [
  { name: 'James Kamau', ctas: 'RED', hr: 118, bp: '90/50', rr: 28, spo2: 91, gcs: 14, wait: '0 min', provider: 'Dr. Ochieng' },
  { name: 'Grace Wanjiku', ctas: 'ORANGE', hr: 104, bp: '110/70', rr: 22, spo2: 95, gcs: 15, wait: '8 min', provider: '—' },
  { name: 'Peter Otieno', ctas: 'YELLOW', hr: 88, bp: '130/80', rr: 18, spo2: 97, gcs: 15, wait: '25 min', provider: '—' },
  { name: 'Hannah Muthoni', ctas: 'ORANGE', hr: 112, bp: '100/65', rr: 24, spo2: 94, gcs: 15, wait: '15 min', provider: 'Dr. Kamau' },
  { name: 'Samuel Kiprop', ctas: 'GREEN', hr: 76, bp: '120/75', rr: 16, spo2: 99, gcs: 15, wait: '45 min', provider: '—' },
]

const RESUS_PATIENTS = [
  { name: 'John Smith', age: 45, complaint: 'STEMI — Anterior MI', team: 'Cardiology', status: 'Active', mrn: 'EM-2024-001' },
  { name: 'David Wilson', age: 67, complaint: 'Acute Respiratory Failure', team: 'Respiratory', status: 'Critical', mrn: 'EM-2024-003' },
  { name: 'Mary Achieng', age: 35, complaint: 'Septic Shock — Urosepsis', team: 'Medical', status: 'Stable', mrn: 'EM-2024-006' },
]

const ACTIVITY_FEED = [
  { time: '11:45', event: 'Code Blue called — Resus Bay 2', user: 'Dr. Kamau', type: 'alert' },
  { time: '11:30', event: 'CTAS RED patient arrived via ambulance', user: 'Triage Nurse', type: 'arrival' },
  { time: '11:15', event: 'STEMI activation — Door-to-ECG 8 min', user: 'ECG Tech', type: 'milestone' },
  { time: '10:50', event: 'Massive Transfusion Protocol activated', user: 'Blood Bank', type: 'alert' },
  { time: '10:30', event: 'ED bed census: 18 occupied / 6 available', user: 'Charge Nurse', type: 'info' },
]

const PROCEDURES_LIST = [
  { name: 'Central Line', indication: 'IV access / CVP monitoring', consent: 'Completed', performer: 'Dr. Ochieng', time: '11:20' },
  { name: 'Chest Tube', indication: 'Tension pneumothorax', consent: 'Completed', performer: 'Dr. Kamau', time: '10:45' },
  { name: 'Intubation', indication: 'Airway protection / Respiratory failure', consent: 'Pending', performer: '—', time: '—' },
  { name: 'Lumbar Puncture', indication: 'Rule out meningitis', consent: 'Pending', performer: '—', time: '—' },
  { name: 'Paracentesis', indication: 'Ascites — diagnostic', consent: 'Completed', performer: 'Dr. Mwangi', time: '09:30' },
  { name: 'Thoracentesis', indication: 'Pleural effusion', consent: 'Pending', performer: '—', time: '—' },
  { name: 'Pericardiocentesis', indication: 'Cardiac tamponade', consent: 'Pending', performer: '—', time: '—' },
  { name: 'Cricothyroidotomy', indication: 'Cannot intubate / Cannot ventilate', consent: 'Pending', performer: '—', time: '—' },
]

const EMERGENCY_MEDS = [
  { drug: 'Epinephrine', cls: 'Vasopressor', dose: '1 mg IV/IO', route: 'IV/IO', indication: 'Cardiac arrest, Anaphylaxis', contraindications: 'Tachyarrhythmias', stock: 'In' },
  { drug: 'Amiodarone', cls: 'Antiarrhythmic', dose: '300 mg IV/IO', route: 'IV/IO', indication: 'VF/VT cardiac arrest', contraindications: 'Bradycardia, Heart block', stock: 'In' },
  { drug: 'Atropine', cls: 'Anticholinergic', dose: '0.5 mg IV', route: 'IV', indication: 'Symptomatic bradycardia', contraindications: 'Tachycardia', stock: 'In' },
  { drug: 'Adenosine', cls: 'Antiarrhythmic', dose: '6 mg IV push', route: 'IV', indication: 'PSVT', contraindications: '2nd/3rd degree AV block', stock: 'In' },
  { drug: 'Naloxone', cls: 'Opioid Antagonist', dose: '0.4-2 mg IV', route: 'IV/IM/IN', indication: 'Opioid overdose', contraindications: 'None in overdose', stock: 'In' },
  { drug: 'Flumazenil', cls: 'Benzodiazepine Antagonist', dose: '0.2 mg IV', route: 'IV', indication: 'Benzodiazepine overdose', contraindications: 'Seizure history', stock: 'In' },
  { drug: 'D50%', cls: 'Hypertonic Glucose', dose: '25 g IV (50 mL)', route: 'IV', indication: 'Hypoglycemia', contraindications: 'Intracranial hemorrhage', stock: 'In' },
  { drug: 'Sodium Bicarbonate', cls: 'Buffer', dose: '1 mEq/kg IV', route: 'IV', indication: 'Metabolic acidosis', contraindications: 'Hypocalcemia', stock: 'In' },
  { drug: 'Calcium Gluconate', cls: 'Electrolyte', dose: '1-2 g IV', route: 'IV', indication: 'Hypocalcemia, Hyperkalemia', contraindications: 'Hypercalcemia', stock: 'In' },
  { drug: 'Magnesium Sulfate', cls: 'Electrolyte', dose: '1-2 g IV', route: 'IV', indication: 'Torsades de Pointes', contraindications: 'Renal failure', stock: 'In' },
  { drug: 'Nitroglycerin', cls: 'Vasodilator', dose: '0.4 mg SL', route: 'SL/IV', indication: 'Angina, ACS', contraindications: 'SBP <90 mmHg', stock: 'In' },
  { drug: 'Fentanyl', cls: 'Opioid Analgesic', dose: '25-50 mcg IV', route: 'IV/IM', indication: 'Severe pain', contraindications: 'Respiratory depression', stock: 'In' },
]

const TIMELINE_EVENTS = [
  { time: '08:15', type: 'arrival', desc: 'Patient arrived via Ambulance', details: 'ALS en route. ECG performed pre-hospital. STEMI suspected.' },
  { time: '08:20', type: 'clinical', desc: 'Triage completed — CTAS RED', details: 'ECG: ST elevation V2-V4. Pain 10/10. HR 118, BP 90/50.' },
  { time: '08:25', type: 'clinical', desc: 'Physician assigned', details: 'Dr. Ochieng — Emergency Physician assigned to case.' },
  { time: '08:30', type: 'meds', desc: 'Medication administered', details: 'Aspirin 325 mg PO, Nitroglycerin 0.4 mg SL, Morphine 4 mg IV.' },
  { time: '08:35', type: 'procedures', desc: 'ECG performed', details: '12-lead ECG: Anterior STEMI. Door-to-ECG: 8 min.' },
  { time: '08:40', type: 'clinical', desc: 'Labs ordered', details: 'Troponin, CBC, BMP, Coagulation, Type & Screen.' },
  { time: '08:45', type: 'meds', desc: 'Medication administered', details: 'Heparin 5000 U IV bolus. Ticagrelor 180 mg PO.' },
  { time: '08:50', type: 'clinical', desc: 'Cardiology consult called', details: 'STEMI team activated. Cath lab preparing.' },
  { time: '09:00', type: 'procedures', desc: 'Imaging ordered', details: 'CXR portable — lung fields clear. No contraindication to PCI.' },
  { time: '09:15', type: 'procedures', desc: 'Central line inserted', details: 'Right IJ 7 Fr triple lumen. Sterile technique. No complications.' },
  { time: '09:30', type: 'clinical', desc: 'Disposition decision', details: 'Proceed to cardiac catheterization lab. Interventional Cardiology notified.' },
]

const OBS_BEDS = [
  { id: 'O1', status: 'Occupied', name: 'Grace Wanjiku', dx: 'Chest pain — R/O ACS', los: '4h', eta: '12:00' },
  { id: 'O2', status: 'Occupied', name: 'Peter Otieno', dx: 'Syncope — workup', los: '2h', eta: '14:00' },
  { id: 'O3', status: 'Occupied', name: 'Sarah Brown', dx: 'Head injury observation', los: '6h', eta: '16:00' },
  { id: 'O4', status: 'Vacant', name: '', dx: '', los: '', eta: '' },
  { id: 'O5', status: 'Occupied', name: 'Hannah Muthoni', dx: 'Asthma exacerbation', los: '3h', eta: '13:00' },
  { id: 'O6', status: 'Occupied', name: 'Robert Lee', dx: 'Hypertensive urgency', los: '1h', eta: '11:30' },
  { id: 'O7', status: 'Vacant', name: '', dx: '', los: '', eta: '' },
  { id: 'O8', status: 'Vacant', name: '', dx: '', los: '', eta: '' },
]

const MONITOR_PATIENTS = [
  { name: 'John Smith', bed: 'Resus 1', hr: [118, 114, 108, 102, 96], rr: 28, bp: [90, 92, 95, 98, 102], spo2: 94, temp: 37.2, ecg: 'Sinus tachycardia' },
  { name: 'David Wilson', bed: 'Resus 2', hr: [132, 128, 124, 120, 118], rr: 34, bp: [82, 84, 86, 88, 90], spo2: 88, temp: 38.9, ecg: 'Afib with RVR' },
  { name: 'Mary Achieng', bed: 'Resus 3', hr: [108, 106, 104, 102, 100], rr: 22, bp: [100, 102, 104, 105, 106], spo2: 96, temp: 37.8, ecg: 'Sinus tachycardia' },
  { name: 'James Kamau', bed: 'Resus 4', hr: [98, 96, 94, 92, 90], rr: 20, bp: [110, 112, 114, 116, 118], spo2: 97, temp: 36.8, ecg: 'Normal sinus rhythm' },
]

const PATH_STEMI = { doorToECG: 8, doorToBalloon: 52, ecgTarget: 10, balloonTarget: 90, activated: true, checklist: ['ECG within 10 min', 'Aspirin', 'Heparin', 'Cardiology notified', 'Cath lab ready'] }
const PATH_STROKE = { lkw: '06:30', doorToNeedle: 38, nihss: 12, tpaCandidate: true, checklist: ['CT head', 'NIHSS assessment', 'tPA eligibility', 'BP <185/110', 'INR <1.7'] }
const PATH_SEPSIS = { qSOFA: 2, lactate: 4.8, cultures: 'Pending', abxTime: '45 min', checklist: ['Lactate measured', 'Blood cultures', 'Broad-spectrum abx', 'Fluid resuscitation', 'Vasopressors if needed'] }
const PATH_TRAUMA = { activation: true, mtp: true, bloodProducts: '4 PRBC / 2 FFP / 1 Platelets', checklist: ['Chest XR', 'Pelvic XR', 'FAST', 'CT trauma', 'Ortho notified'] }

const DISPOSITION_PATIENTS = [
  { name: 'John Smith', mrn: 'EM-2024-001', dx: 'Anterior STEMI', current: 'Cath Lab' },
  { name: 'Mary Jones', mrn: 'EM-2024-002', dx: 'Appendicitis', current: 'ED' },
  { name: 'David Wilson', mrn: 'EM-2024-003', dx: 'COPD exacerbation', current: 'ED' },
  { name: 'Robert Lee', mrn: 'EM-2024-005', dx: 'Hypertensive urgency', current: 'Observation' },
  { name: 'Grace Wanjiku', mrn: 'EM-2024-007', dx: 'Chest pain R/O ACS', current: 'Observation' },
]

export default function EmergencyWorkspace() {
  const [tab, setTab] = useState('command')
  const [arrivalMode, setArrivalMode] = useState('Ambulance')
  const [triageCat, setTriageCat] = useState('RED')
  const [patName, setPatName] = useState('')
  const [patAge, setPatAge] = useState('')
  const [patGender, setPatGender] = useState('M')
  const [patMRN, setPatMRN] = useState('')
  const [patComplaint, setPatComplaint] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [weightKg, setWeightKg] = useState('70')
  const [weightDrug, setWeightDrug] = useState('Epinephrine')
  const [timelineFilter, setTimelineFilter] = useState('All Events')
  const [filteredMeds] = useState(EMERGENCY_MEDS)

  const totalArrivals = 42
  const triageWait = 12
  const resusBays = 4
  const totalBays = 6
  const admitRate = 28
  const alsCalls = 8
  const ctaCompliance = 94
  const doorToProvider = 14
  const lwbs = 2

  const getWeightDose = () => {
    const w = parseFloat(weightKg) || 70
    const doses: Record<string, string> = {
      'Epinephrine': `${(w * 0.01).toFixed(2)} mg (${(w * 10).toFixed(0)} mcg)`,
      'Amiodarone': '300 mg (fixed dose)',
      'Adenosine': '6 mg (first dose)',
      'Naloxone': `${(w * 0.04).toFixed(2)} mg`,
      'Fentanyl': `${(w * 0.5).toFixed(0)} mcg`,
      'Magnesium Sulfate': '1-2 g (fixed dose)',
      'D50%': '25 g (50 mL) — fixed',
      'Sodium Bicarbonate': `${w} mEq (1 mEq/kg)`,
    }
    return doses[weightDrug] || `${w * 0.1} mg (weight-based)`
  }

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Emergency & Trauma</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: C.textLight }}>{totalArrivals} arrivals today · {resusBays}/{totalBays} resus bays occupied</div>
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>ED</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Emergency & Trauma</div>
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
          {/* ─── COMMAND CENTER ─── */}
          {tab === 'command' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Command Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Emergency Department real-time operational overview</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.red)}>{RESUS_PATIENTS.filter(p => p.status === 'Critical' || p.status === 'Active').length} Active Resus</span>
                  <span style={S.pill(C.amber)}>{TRIAGE_QUEUE.filter(t => t.ctas === 'RED' || t.ctas === 'ORANGE').length} High Acuity</span>
                  <span style={S.pill(C.green)}>{ctaCompliance}% CTAS Compliance</span>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'Total Arrivals (24h)', value: totalArrivals, icon: Ambulance, color: C.sky },
                  { label: 'Triage Wait (avg min)', value: triageWait, icon: Clock, color: C.amber },
                  { label: 'Resus Bays Occupied', value: `${resusBays}/${totalBays}`, icon: Bed, color: C.red },
                  { label: 'Admission Rate (%)', value: `${admitRate}%`, icon: TrendingUp, color: C.purple },
                  { label: 'ALS Calls', value: alsCalls, icon: Bell, color: C.sky },
                  { label: 'CTAS Compliance', value: `${ctaCompliance}%`, icon: CheckCircle, color: C.green },
                  { label: 'Door-to-Provider (min)', value: doorToProvider, icon: Clock, color: C.amber },
                  { label: 'Left Without Being Seen', value: lwbs, icon: User, color: C.red },
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
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Resuscitations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {RESUS_PATIENTS.map(p => (
                    <div key={p.mrn} style={{ padding: '10px 14px', borderRadius: 8, background: `${C.red}08`, border: `1px solid ${C.red}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'Critical' ? C.red : p.status === 'Active' ? C.sky : C.green, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name} · {p.age} yrs</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{p.complaint} · Team: {p.team}</div>
                      </div>
                      <span style={S.badge(p.status === 'Critical' ? C.red : p.status === 'Active' ? C.sky : C.green)}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Department Activity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ACTIVITY_FEED.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                      <div style={{ fontWeight: 600, color: C.textLight, minWidth: 40 }}>{a.time}</div>
                      <div style={{ color: C.text, flex: 1 }}>{a.event}</div>
                      <div style={{ color: C.textLight }}>{a.user}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── ARRIVAL ─── */}
          {tab === 'arrival' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Patient Arrival Registration</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Register new ED arrivals</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>New Arrival</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>Arrival Mode</label>
                        <select style={S.sel} value={arrivalMode} onChange={e => setArrivalMode(e.target.value)}>
                          <option>Ambulance</option>
                          <option>Walk-in</option>
                          <option>Police</option>
                          <option>Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label style={S.label}>Triage Category</label>
                        <select style={S.sel} value={triageCat} onChange={e => setTriageCat(e.target.value)}>
                          <option>RED</option>
                          <option>ORANGE</option>
                          <option>YELLOW</option>
                          <option>GREEN</option>
                        </select>
                      </div>
                    </div>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>Patient Name</label>
                        <input style={S.input} placeholder="Full name" value={patName} onChange={e => setPatName(e.target.value)} />
                      </div>
                      <div>
                        <label style={S.label}>Age</label>
                        <input style={S.input} placeholder="Years" value={patAge} onChange={e => setPatAge(e.target.value)} />
                      </div>
                    </div>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>Gender</label>
                        <select style={S.sel} value={patGender} onChange={e => setPatGender(e.target.value)}>
                          <option>M</option>
                          <option>F</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={S.label}>MRN</label>
                        <input style={S.input} placeholder="EM-YYYY-NNN" value={patMRN} onChange={e => setPatMRN(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={S.label}>Chief Complaint</label>
                      <input style={S.input} placeholder="e.g. Chest pain, Abdominal pain, Trauma" value={patComplaint} onChange={e => setPatComplaint(e.target.value)} />
                    </div>
                    <button style={S.btn(C.sky)}>Register Arrival</button>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Waiting for Triage</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 6, padding: '6px 8px', fontSize: 10, fontWeight: 600, color: C.textLight, borderBottom: `1px solid ${C.border}` }}>
                      <span>Name</span>
                      <span>MRN</span>
                      <span>Mode</span>
                      <span>Wait</span>
                      <span>Actions</span>
                    </div>
                    {ARRIVAL_PATIENTS.map(p => (
                      <div key={p.mrn} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 6, padding: '6px 8px', borderRadius: 6, background: C.panel, fontSize: 11, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                        <span style={{ color: C.text }}>{p.mrn}</span>
                        <span style={S.pill(p.mode === 'Ambulance' ? C.red : p.mode === 'Police' ? C.purple : C.sky)}>{p.mode}</span>
                        <span style={{ color: p.waitMin > 15 ? C.red : C.text }}>{p.waitMin} min</span>
                        <button style={{ padding: '3px 8px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 10, cursor: 'pointer' }}>Triage</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── DYNAMIC TRIAGE ─── */}
          {tab === 'triage' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Dynamic Triage</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8 }}>CTAS / RTS Triage System</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'RED — Resus within 0 min', color: C.red },
                  { label: 'ORANGE — Emergent within 10 min', color: C.amber },
                  { label: 'YELLOW — Urgent within 60 min', color: C.amber },
                  { label: 'GREEN — Non-urgent within 120 min', color: C.green },
                ].map(l => (
                  <div key={l.label} style={{ padding: '6px 12px', borderRadius: 6, background: `${l.color}12`, fontSize: 10, fontWeight: 600, color: l.color, flex: 1 }}>
                    {l.label}
                  </div>
                ))}
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Triage Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid3}>
                      <div><label style={S.label}>HR (bpm)</label><input style={S.input} placeholder="72" /></div>
                      <div><label style={S.label}>RR (/min)</label><input style={S.input} placeholder="16" /></div>
                      <div><label style={S.label}>BP (mmHg)</label><input style={S.input} placeholder="120/80" /></div>
                      <div><label style={S.label}>SpO₂ (%)</label><input style={S.input} placeholder="98" /></div>
                      <div><label style={S.label}>Temp (°C)</label><input style={S.input} placeholder="37.0" /></div>
                      <div><label style={S.label}>GCS</label><input style={S.input} placeholder="15" /></div>
                    </div>
                    <div>
                      <label style={S.label}>Pain Score (0-10)</label>
                      <input style={S.input} placeholder="5" />
                    </div>
                    <div>
                      <label style={S.label}>Chief Complaint</label>
                      <input style={S.input} placeholder="e.g. Chest pain, SOB, Trauma" />
                    </div>
                    <div>
                      <label style={S.label}>Mechanism of Injury</label>
                      <input style={S.input} placeholder="e.g. MVC, Fall, Assault, Burn" />
                    </div>
                    <button style={S.btn(C.sky)}>Assign Triage Category</button>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Triage Queue</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.8fr 1.5fr 1fr 1fr', gap: 4, padding: '6px 8px', fontSize: 10, fontWeight: 600, color: C.textLight, borderBottom: `1px solid ${C.border}` }}>
                      <span>Pri</span><span>Name</span><span>CTAS</span><span>Vitals</span><span>Wait</span><span>Provider</span>
                    </div>
                    {TRIAGE_QUEUE.map(p => {
                      const ctasColor = p.ctas === 'RED' ? C.red : p.ctas === 'ORANGE' ? C.amber : p.ctas === 'YELLOW' ? C.amber : C.green
                      return (
                        <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.8fr 1.5fr 1fr 1fr', gap: 4, padding: '6px 8px', borderRadius: 6, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: ctasColor }} />
                          <span style={{ fontWeight: 600, color: C.navy, fontSize: 11 }}>{p.name}</span>
                          <span style={{ ...S.pill(ctasColor), fontSize: 9 }}>{p.ctas}</span>
                          <span style={{ color: C.text, fontSize: 9 }}>HR {p.hr} BP {p.bp} SpO₂ {p.spo2}</span>
                          <span style={{ color: p.wait === '0 min' ? C.red : C.text }}>{p.wait}</span>
                          <span style={{ color: C.textLight }}>{p.provider}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── RESUSCITATION ABCDE ─── */}
          {tab === 'resuscitation' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>ABCDE Assessment</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Systematic approach to the critically ill patient</div>
              <div style={S.grid2}>
                {[
                  { title: 'A — Airway', color: C.sky, fields: [
                    { label: 'Status', el: <select style={S.sel} defaultValue="Patent"><option>Patent</option><option>Obstructed</option><option>Intubated</option><option>Surgical</option></select> },
                    { label: 'Interventions', el: <textarea style={{ ...S.input, height: 50, resize: 'vertical' }} placeholder="Chin lift, Jaw thrust, OPA/NPA, ETT" /> },
                  ]},
                  { title: 'B — Breathing', color: C.purple, fields: [
                    { label: 'RR', el: <input style={S.input} placeholder="16 /min" /> },
                    { label: 'SpO₂', el: <input style={S.input} placeholder="98%" /> },
                    { label: 'Auscultation', el: <select style={S.sel} defaultValue="Clear"><option>Clear</option><option>Wheezes</option><option>Crackles</option><option>Decreased</option></select> },
                    { label: 'Supplemental O₂', el: <select style={S.sel} defaultValue="None"><option>None</option><option>NC 2L</option><option>NRB 15L</option><option>Venturi</option><option>Ventilator</option></select> },
                  ]},
                  { title: 'C — Circulation', color: C.red, fields: [
                    { label: 'HR', el: <input style={S.input} placeholder="72 bpm" /> },
                    { label: 'BP', el: <input style={S.input} placeholder="120/80" /> },
                    { label: 'Cap Refill', el: <select style={S.sel} defaultValue="<2s"><option>{'<2s'}</option><option>2-3s</option><option>{'>3s'}</option></select> },
                    { label: 'IV Access', el: <select style={S.sel} defaultValue="Peripheral"><option>None</option><option>Peripheral</option><option>IO</option><option>Central</option></select> },
                  ]},
                  { title: 'D — Disability', color: C.amber, fields: [
                    { label: 'GCS (3-15)', el: <input type="range" min="3" max="15" defaultValue="15" style={{ width: '100%' }} /> },
                    { label: 'Pupils', el: <select style={S.sel} defaultValue="Brisk"><option>Brisk</option><option>Sluggish</option><option>Pinpoint</option><option>Dilated</option></select> },
                    { label: 'Blood Glucose', el: <input style={S.input} placeholder="6.0 mmol/L" /> },
                    { label: 'Pain Score', el: <input style={S.input} placeholder="0-10" /> },
                  ]},
                  { title: 'E — Exposure', color: C.green, fields: [
                    { label: 'Temp', el: <input style={S.input} placeholder="37.0 °C" /> },
                    { label: 'Skin', el: <select style={S.sel} defaultValue="Warm"><option>Warm</option><option>Cool</option><option>Diaphoretic</option><option>Rash</option></select> },
                    { label: 'Rashes/Injuries', el: <textarea style={{ ...S.input, height: 50, resize: 'vertical' }} placeholder="Describe any skin findings" /> },
                  ]},
                  { title: 'ABCDE Summary', color: C.navy, fields: [
                    { label: 'Overall Impression', el: <textarea style={{ ...S.input, height: 50, resize: 'vertical' }} placeholder="Summary of ABCDE findings..." /> },
                    { label: 'Disposition', el: <select style={S.sel} defaultValue="ICU"><option>ICU</option><option>OR</option><option>Ward</option><option>Discharge</option></select> },
                  ]},
                ].map(panel => (
                  <div key={panel.title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${panel.color}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>{panel.title}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {panel.fields.map((f, i) => (
                        <div key={i}>
                          <label style={S.label}>{f.label}</label>
                          {f.el}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ ...S.btn(C.red), marginTop: 16, padding: '10px 32px', fontSize: 13 }}>Complete Resuscitation</button>
            </div>
          )}

          {/* ─── TRAUMA ATLS ─── */}
          {tab === 'trauma' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>ATLS Primary & Secondary Survey</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Primary Survey (A-E)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'A — Airway with C-spine control', done: true },
                      { label: 'B — Breathing & Ventilation', done: true },
                      { label: 'C — Circulation & Hemorrhage Control', done: true },
                      { label: 'D — Disability / Neurological status', done: false },
                      { label: 'E — Exposure / Environmental control', done: false },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: C.panel, fontSize: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.done ? C.green : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 10, fontWeight: 700 }}>
                          {item.done ? '✓' : '○'}
                        </div>
                        <div style={{ flex: 1, color: C.text, fontWeight: item.done ? 400 : 600 }}>{item.label}</div>
                        <span style={S.pill(item.done ? C.green : C.amber)}>{item.done ? 'Completed' : 'Pending'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Secondary Survey — Head to Toe</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {['Head', 'Face', 'C-spine', 'Chest', 'Abdomen', 'Pelvis', 'Extremities', 'Back', 'Neuro'].map(area => (
                      <button key={area} style={{ padding: '8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, color: C.text, cursor: 'pointer', textAlign: 'center' }}>
                        {area}<br /><span style={{ fontSize: 9, color: C.textLight }}>Tap to examine</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Investigations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {['Chest XR', 'Pelvic XR', 'C-spine XR', 'FAST', 'CT Head', 'CT Abdomen/Pelvis', 'Labs — CBC, BMP, Coags, Type & Screen'].map(inv => (
                      <label key={inv} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: C.sky }} />
                        {inv}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Trauma Team</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { role: 'Team Leader', name: 'Dr. Ochieng' },
                      { role: 'Airway', name: 'Dr. Kamau' },
                      { role: 'Circulatory', name: 'Dr. Mwangi' },
                      { role: 'Scribe', name: 'Nurse Grace' },
                      { role: 'Radiology', name: 'Dr. Achieng' },
                    ].map(m => (
                      <div key={m.role} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: C.navy, minWidth: 80 }}>{m.role}</span>
                        <select style={{ ...S.sel, padding: '4px 8px', fontSize: 11 }} defaultValue={m.name}>
                          <option>{m.name}</option>
                          <option>Dr. Smith</option>
                          <option>Dr. Jones</option>
                          <option>Nurse Lead</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Activation Criteria</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    'SBP <90 mmHg', 'GCS <9', 'ET intubation', 'Flail chest', 'Penetrating injury', 'Potential amputation', 'MVC >100 km/h', 'Pedestrian struck',
                  ].map(crit => (
                    <label key={crit} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.text, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, background: C.panel }}>
                      <input type="checkbox" style={{ accentColor: C.red }} />
                      {crit}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── TIME-CRITICAL PATHWAYS ─── */}
          {tab === 'pathways' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Time-Critical Pathways</div>
              <div style={S.grid2}>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderTop: `3px solid ${C.red}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>STEMI Pathway</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 12 }}>Door-to-ECG: {PATH_STEMI.doorToECG} min / Target {PATH_STEMI.ecgTarget} min · Door-to-Balloon: {PATH_STEMI.doorToBalloon} min / Target {PATH_STEMI.balloonTarget} min</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border }}><div style={{ width: `${(PATH_STEMI.doorToECG / PATH_STEMI.ecgTarget) * 100}%`, height: '100%', borderRadius: 3, background: PATH_STEMI.doorToECG <= PATH_STEMI.ecgTarget ? C.green : C.red }} /></div>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border }}><div style={{ width: `${(PATH_STEMI.doorToBalloon / PATH_STEMI.balloonTarget) * 100}%`, height: '100%', borderRadius: 3, background: PATH_STEMI.doorToBalloon <= PATH_STEMI.balloonTarget ? C.green : C.red }} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <span style={S.pill(PATH_STEMI.activated ? C.green : C.amber)}>{PATH_STEMI.activated ? 'Activated' : 'Inactive'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {PATH_STEMI.checklist.map((item, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={i < 3} style={{ accentColor: C.green }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderTop: `3px solid ${C.purple}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Stroke Pathway</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 12 }}>LKW: {PATH_STROKE.lkw} · Door-to-Needle: {PATH_STROKE.doorToNeedle} min · NIHSS: {PATH_STROKE.nihss}</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <span style={S.pill(PATH_STROKE.tpaCandidate ? C.green : C.red)}>tPA {PATH_STROKE.tpaCandidate ? 'Candidate' : 'Not Eligible'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {PATH_STROKE.checklist.map((item, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={i < 2} style={{ accentColor: C.purple }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderTop: `3px solid ${C.amber}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Sepsis Pathway</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 12 }}>qSOFA: {PATH_SEPSIS.qSOFA} · Lactate: {PATH_SEPSIS.lactate} mmol/L · Cultures: {PATH_SEPSIS.cultures} · Abx within: {PATH_SEPSIS.abxTime}</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <span style={S.pill(PATH_SEPSIS.qSOFA >= 2 ? C.red : C.green)}>qSOFA ≥2</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {PATH_SEPSIS.checklist.map((item, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={i < 3} style={{ accentColor: C.amber }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderTop: `3px solid ${C.red}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Trauma Pathway</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 12 }}>Activation: {PATH_TRAUMA.activation ? 'Activated' : 'Standby'} · MTP: {PATH_TRAUMA.mtp ? 'Active' : 'Inactive'} · Products: {PATH_TRAUMA.bloodProducts}</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <span style={S.pill(PATH_TRAUMA.mtp ? C.red : C.green)}>Massive Transfusion</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {PATH_TRAUMA.checklist.map((item, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={i < 3} style={{ accentColor: C.red }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── OBSERVATION UNIT ─── */}
          {tab === 'observation' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Observation Unit</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Observation Beds</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {OBS_BEDS.map(b => (
                      <div key={b.id} style={{ padding: 12, borderRadius: 8, border: `1px solid ${b.status === 'Occupied' ? C.border : `${C.green}40`}`, background: b.status === 'Occupied' ? C.white : `${C.green}08`, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight }}>Bed {b.id}</div>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: b.status === 'Occupied' ? C.sky : C.green, margin: '6px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 10 }}>{b.status === 'Occupied' ? 'P' : 'V'}</div>
                        <div style={{ fontSize: 9, color: C.text }}>{b.status === 'Occupied' ? b.name : 'Vacant'}</div>
                        {b.status === 'Occupied' && <div style={{ fontSize: 8, color: C.textLight }}>{b.dx} · {b.los}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Observation Orders</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Order Type</label>
                      <select style={S.sel} defaultValue="CBC">
                        <option>CBC</option>
                        <option>BMP</option>
                        <option>ECG</option>
                        <option>CXR</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Frequency</label>
                      <select style={S.sel} defaultValue="Once">
                        <option>Once</option>
                        <option>q6h</option>
                        <option>q8h</option>
                        <option>q12h</option>
                        <option>Daily</option>
                      </select>
                    </div>
                    <button style={S.btn(C.sky)}>Place Order</button>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Disposition Decision</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Clinical improvement', checked: true },
                    { label: 'Vitals stable', checked: true },
                    { label: 'Discharge criteria met', checked: false },
                    { label: 'Follow-up arranged', checked: false },
                  ].map(d => (
                    <label key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.text, cursor: 'pointer', padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <input type="checkbox" defaultChecked={d.checked} style={{ accentColor: C.sky }} />
                      {d.label}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button style={S.btn(C.sky)}>Admit</button>
                  <button style={S.btn(C.green)}>Discharge</button>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: C.textLight }}>Estimated LOS: 6h 45min</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── PROCEDURES ─── */}
          {tab === 'procedures' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Emergency Procedures</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Procedure tracking — Consent, Performer, Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PROCEDURES_LIST.map(p => (
                  <div key={p.name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.textLight }}>Indication: {p.indication}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={S.pill(p.consent === 'Completed' ? C.green : C.amber)}>Consent: {p.consent}</span>
                        <span style={S.pill(p.performer !== '—' ? C.sky : C.textLight)}>{p.performer !== '—' ? p.performer : 'Unassigned'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <button style={S.btn(C.sky)}>Start</button>
                      <button style={S.btn(C.green)}>Complete</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={S.label}>Complications</label>
                        <textarea style={{ ...S.input, height: 40, resize: 'vertical' }} placeholder="e.g. Bleeding, Infection" />
                      </div>
                      <div>
                        <label style={S.label}>Notes</label>
                        <textarea style={{ ...S.input, height: 40, resize: 'vertical' }} placeholder="Additional notes..." />
                      </div>
                    </div>
                    {p.time !== '—' && <div style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>{p.time}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── EMERGENCY MEDICATIONS ─── */}
          {tab === 'medications' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Emergency Drug Formulary</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 16 }}>Critical care drug reference</div>
              <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Search size={16} color={C.textLight} />
                <input style={{ ...S.input, maxWidth: 400 }} placeholder="Search drugs..." value={medSearch} onChange={e => setMedSearch(e.target.value)} />
              </div>
              <div style={{ ...S.card, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 0.6fr 1.2fr 1fr 0.6fr', gap: 6, padding: '6px 8px', fontSize: 10, fontWeight: 600, color: C.textLight, borderBottom: `1px solid ${C.border}` }}>
                    <span>Drug</span><span>Class</span><span>Dose</span><span>Route</span><span>Indication</span><span>Contraindications</span><span>Stock</span>
                  </div>
                  {EMERGENCY_MEDS.map(m => (
                    <div key={m.drug} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 0.6fr 1.2fr 1fr 0.6fr', gap: 6, padding: '6px 8px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{m.drug}</span>
                      <span style={{ color: C.text }}>{m.cls}</span>
                      <span style={{ color: C.text }}>{m.dose}</span>
                      <span style={{ color: C.text }}>{m.route}</span>
                      <span style={{ color: C.text }}>{m.indication}</span>
                      <span style={{ color: C.text, fontSize: 9 }}>{m.contraindications}</span>
                      <span style={S.pill(m.stock === 'In' ? C.green : C.red)}>{m.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Weight-Based Dosing Calculator</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div>
                    <label style={S.label}>Weight (kg)</label>
                    <input style={{ ...S.input, width: 120 }} value={weightKg} onChange={e => setWeightKg(e.target.value)} />
                  </div>
                  <div>
                    <label style={S.label}>Drug</label>
                    <select style={S.sel} value={weightDrug} onChange={e => setWeightDrug(e.target.value)}>
                      {EMERGENCY_MEDS.map(m => <option key={m.drug}>{m.drug}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Calculated Dose</label>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: C.skyLight, fontSize: 16, fontWeight: 700, color: C.navy }}>{getWeightDose()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MONITORING ─── */}
          {tab === 'monitoring' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Continuous Monitoring</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Real-time patient monitoring — Resuscitation Bays</div>
              <div style={S.grid2}>
                {MONITOR_PATIENTS.map(m => (
                  <div key={m.name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: C.textLight }}>{m.bed} · {m.ecg}</div>
                      </div>
                      <span style={S.pill(m.spo2 < 90 ? C.red : C.green)}>SpO₂ {m.spo2}%</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                      <div style={{ textAlign: 'center', padding: 8, borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 9, color: C.textLight }}>HR</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{m.hr[m.hr.length - 1]}</div>
                        <div style={{ display: 'flex', gap: 2, marginTop: 4, alignItems: 'flex-end', height: 20 }}>
                          {m.hr.map((v, i) => (
                            <div key={i} style={{ width: 8, height: `${(v - 80) * 0.5}px`, borderRadius: 2, background: C.red, minHeight: 2 }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', padding: 8, borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 9, color: C.textLight }}>RR</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{m.rr}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: 8, borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 9, color: C.textLight }}>BP</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{m.bp[m.bp.length - 1]}</div>
                        <div style={{ display: 'flex', gap: 2, marginTop: 4, alignItems: 'flex-end', height: 20 }}>
                          {m.bp.map((v, i) => (
                            <div key={i} style={{ width: 8, height: `${(v - 70) * 0.5}px`, borderRadius: 2, background: C.sky, minHeight: 2 }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', padding: 8, borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 9, color: C.textLight }}>Temp</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{m.temp}°</div>
                      </div>
                    </div>
                    <div style={{ height: 32, borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.textLight, border: `1px solid ${C.border}` }}>
                      ECG Rhythm Strip — {m.ecg}
                    </div>
                  </div>
                ))}
              </div>
              <div style={S.grid2}>
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Alarm Settings</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: C.text, minWidth: 80 }}>HR Limits</span>
                      <input style={{ ...S.input, width: 70 }} placeholder="Low" defaultValue="40" />
                      <span style={{ fontSize: 10, color: C.textLight }}>to</span>
                      <input style={{ ...S.input, width: 70 }} placeholder="High" defaultValue="140" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: C.text, minWidth: 80 }}>BP Limits</span>
                      <input style={{ ...S.input, width: 70 }} placeholder="Low" defaultValue="80" />
                      <span style={{ fontSize: 10, color: C.textLight }}>to</span>
                      <input style={{ ...S.input, width: 70 }} placeholder="High" defaultValue="200" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: C.text, minWidth: 80 }}>SpO₂ Threshold</span>
                      <input style={{ ...S.input, width: 70 }} defaultValue="90" />
                      <span style={{ fontSize: 10, color: C.textLight }}>%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: C.text, minWidth: 80 }}>Alarm Silence</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: C.sky }} />
                        Silence for 2 min
                      </label>
                    </div>
                  </div>
                </div>
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Multi-parameter Waveforms</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['ECG (II)', 'ECG (V5)', 'ART', 'SpO₂'].map(w => (
                      <div key={w} style={{ height: 60, borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.textLight }}>
                        {w} Waveform
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TIMELINE ─── */}
          {tab === 'timeline' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Emergency Visit Timeline</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Patient: John Smith · MRN: EM-2024-001</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['All Events', 'Clinical', 'Meds', 'Procedures', 'Notes'].map(f => (
                  <button key={f} style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: f === timelineFilter ? 600 : 400,
                    background: f === timelineFilter ? C.sky : C.border, color: f === timelineFilter ? C.white : C.text, cursor: 'pointer',
                  }} onClick={() => setTimelineFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative', paddingLeft: 20 }}>
                {TIMELINE_EVENTS.map((e, i) => {
                  const typeColors: Record<string, string> = { arrival: C.sky, clinical: C.navy, meds: C.green, procedures: C.purple }
                  const typeIcons: Record<string, LucideIcon> = { arrival: UserPlus, clinical: Stethoscope, meds: Pill, procedures: Syringe }
                  const Icon = typeIcons[e.type] || Clock
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 16, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -20, top: 4, width: 12, height: 12, borderRadius: '50%', background: typeColors[e.type] || C.textLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.white }} />
                      </div>
                      {i < TIMELINE_EVENTS.length - 1 && <div style={{ position: 'absolute', left: -15, top: 16, width: 2, height: 'calc(100% - 12px)', background: `${(typeColors[e.type] || C.textLight)}30` }} />}
                      <div style={{ minWidth: 50, fontSize: 10, fontWeight: 600, color: C.textLight, paddingTop: 2 }}>{e.time}</div>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: `${(typeColors[e.type] || C.textLight)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={12} color={typeColors[e.type] || C.textLight} />
                      </div>
                      <div style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{e.desc}</div>
                        <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{e.details}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button style={S.btn(C.sky)}>Add Timeline Entry</button>
            </div>
          )}

          {/* ─── DISPOSITION ENGINE ─── */}
          {tab === 'disposition' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Disposition Decision Support</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Evidence-based disposition recommendations</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Patient Selection</div>
                  <select style={S.sel} defaultValue={DISPOSITION_PATIENTS[0].mrn}>
                    {DISPOSITION_PATIENTS.map(p => <option key={p.mrn} value={p.mrn}>{p.name} · {p.dx} · {p.current}</option>)}
                  </select>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Decision Factors</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 6 }}>Clinical Stability</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    {['Vitals normalized', 'Symptoms resolved', 'Able to ambulate', 'Tolerating PO', 'Pain controlled'].map(f => (
                      <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: C.sky }} />
                        {f}
                      </label>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 6 }}>Social Factors</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    {['Caregiver available', 'Home environment safe', 'Can follow-up'].map(f => (
                      <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: C.sky }} />
                        {f}
                      </label>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 6 }}>Risk Assessment</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.text, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: C.sky }} />
                    Low risk for adverse event
                  </label>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Recommended Disposition</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25`, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 4 }}>Discharge Recommended</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Based on 6/9 criteria met — clinically stable with appropriate follow-up</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Disposition Orders</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={S.label}>Type</label>
                      <select style={S.sel} defaultValue="Discharge">
                        <option>Discharge</option>
                        <option>Admit</option>
                        <option>Transfer</option>
                        <option>Observation</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Orders</label>
                      <textarea style={{ ...S.input, height: 70, resize: 'vertical' }} placeholder="e.g. Discharge instructions, prescriptions, follow-up appointment" />
                    </div>
                    <button style={S.btn(C.sky)}>Execute Disposition</button>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Disposition Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><span style={{ fontSize: 10, color: C.textLight }}>Final Decision</span><div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Discharge to home</div></div>
                  <div><span style={{ fontSize: 10, color: C.textLight }}>Orders Placed</span><div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Prescriptions, Follow-up in 2 weeks</div></div>
                  <div><span style={{ fontSize: 10, color: C.textLight }}>Follow-up Instructions</span><div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Return if worsening — ED direct number provided</div></div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
