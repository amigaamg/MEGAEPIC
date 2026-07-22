'use client'
import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Activity, Bell, User, Users, Bed, Eye, Heart, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, LogOut, Clipboard, type LucideIcon } from 'lucide-react'
import { C } from '@/lib/colors';
import { NurseEMAR } from '@/components/nurse/NurseEMAR'
import { NurseKardexView } from '@/components/nurse/NurseKardexView'
import { NurseVitalsCapture } from '@/components/nurse/NurseVitalsCapture'
import { VitalTrendsDashboard } from '@/components/vitals/VitalTrendsDashboard'

const S = {
  page: { minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' as const },
  topBar: { height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 },
  logoText: { fontSize: 14, fontWeight: 700, color: C.navy },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftNav: { width: 200, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' as const, padding: '12px 8px', gap: 1, flexShrink: 0, overflow: 'auto' },
  navItem: (a: boolean) => ({ padding: '7px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: a ? 600 : 400, color: a ? C.sky : C.text, background: a ? C.skyLight : 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const }),
  main: { flex: 1, overflow: 'auto', padding: 20 },
  card: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
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
}

interface PatientSummary { bed: string; name: string; age: string; priority: string; tasks: string[]; alerts: string[]; isolation: boolean; allergies: string; status: string }

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Shift Command', icon: Activity },
  { id: 'handover', label: 'Handover', icon: ArrowRight },
  { id: 'assessment', label: 'Admission Assessment', icon: Clipboard },
  { id: 'emar', label: 'eMAR', icon: Pill },
  { id: 'kardex', label: 'Kardex', icon: BookOpen },
  { id: 'vitals', label: 'Vital Signs', icon: Thermometer },
  { id: 'fluids', label: 'Fluid Balance', icon: Droplets },
  { id: 'observations', label: 'Observation Charts', icon: Eye },
  { id: 'care-plans', label: 'Care Plans', icon: Heart },
  { id: 'tasks', label: 'Task Engine', icon: CheckCircle },
  { id: 'escalation', label: 'Escalations', icon: AlertTriangle },
  { id: 'discharge', label: 'Discharge Prep', icon: LogOut },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Doctor Dashboard', href: '/doctor' },
  { label: 'Doctor Clinical', href: '/doctor/workspace' },
  { label: 'Lab Workspace', href: '/laboratory' },
  { label: 'Pharmacy', href: '/pharmacy' },
  { label: 'Radiology', href: '/radiology' },
  { label: 'Theatre', href: '/theatre' },
  { label: 'ICU', href: '/icu' },
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

const PATIENTS: PatientSummary[] = [
  { bed: '02', name: 'James Mwangi', age: '2 yrs M', priority: 'HIGH', tasks: ['IV Artesunate due', 'Monitor glucose'], alerts: ['NEWS 6'], isolation: true, allergies: 'None', status: 'Requires Medication' },
  { bed: '04', name: 'Mary Achieng', age: '45 yrs F', priority: 'STABLE', tasks: ['BP monitoring'], alerts: [], isolation: false, allergies: 'Penicillin', status: 'Stable' },
  { bed: '05', name: 'Kevin Mutua', age: '2 yrs M', priority: 'HIGH', tasks: ['Blood transfusion', 'Review Hb'], alerts: ['Hb 5.8', 'NEWS Trigger'], isolation: false, allergies: 'None', status: 'NEWS Trigger' },
  { bed: '06', name: 'Grace Wanjiku', age: '30 yrs F', priority: 'MEDIUM', tasks: ['Admit assessment'], alerts: [], isolation: false, allergies: 'None', status: 'Admission Pending' },
  { bed: '08', name: 'Peter Otieno', age: '67 yrs M', priority: 'MEDIUM', tasks: ['Fluid balance'], alerts: ['K+ 6.8'], isolation: false, allergies: 'Sulfa', status: 'Fluid Balance' },
]

const medsSchedule = [
  { time: '08:00', drug: 'IV Artesunate', dose: '2.4 mg/kg', patient: 'James Mwangi', bed: '02', status: 'Due' },
  { time: '08:30', drug: 'Paracetamol', dose: '15 mg/kg', patient: 'Kevin Mutua', bed: '05', status: 'Given' },
  { time: '09:00', drug: 'IV Normal Saline', dose: '10 mL/kg', patient: 'James Mwangi', bed: '02', status: 'Running' },
  { time: '12:00', drug: 'Ceftriaxone', dose: '50 mg/kg', patient: 'Peter Otieno', bed: '08', status: 'Upcoming' },
  { time: '14:00', drug: 'IV Artesunate', dose: '2.4 mg/kg', patient: 'James Mwangi', bed: '02', status: 'Upcoming' },
]

const shiftStart = '07:00'
const shiftEnd = '19:00'

export default function NurseWorkspace() {
  const [tab, setTab] = useState('dashboard')
  const [vitals, setVitals] = useState({ temp: '39.2', pulse: '158', rr: '42', bpS: '90', bpD: '60', spo2: '97', weight: '12', pain: '5', glucose: '' })
  const [fluidInput, setFluidInput] = useState({ oral: '200', iv: '500', blood: '0', feed: '0' })
  const [fluidOutput, setFluidOutput] = useState({ urine: '150', vomitus: '0', stool: '0', drain: '0' })
  const [carePlanNotes, setCarePlanNotes] = useState('')
  const [taskFilter, setTaskFilter] = useState('all')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [activePatients, setActivePatients] = useState<{ id: string; name: string; encounterId: string }[]>([])
  const selectedEncounterId = useMemo(() => {
    if (!selectedPatientId || selectedPatientId === 'pt-unknown') return ''
    const today = new Date().toISOString().slice(0, 10)
    return `enc-${selectedPatientId.replace(/^pt-/, '')}-${today}`
  }, [selectedPatientId])
  const userId = 'nurse_current'
  const userName = 'Current Nurse'

  const shiftProgress = Math.round(((Date.now() - new Date().setHours(7, 0, 0, 0)) / (12 * 60 * 60 * 1000)) * 100)

  useEffect(() => {
    const q = query(collection(db, 'prescriptions'), where('active', '==', true))
    const unsub = onSnapshot(q, (snap) => {
      const seen = new Map<string, { name: string; id: string }>()
      snap.docs.forEach(d => {
        const data = d.data()
        const pid = data.patientId
        if (pid && !seen.has(pid)) {
          seen.set(pid, { name: data.patientName || 'Unknown', id: pid })
        }
      })
      const patients = Array.from(seen.entries()).map(([id, info]) => ({ id, name: info.name, encounterId: '' }))
      setActivePatients(patients)
      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].id)
      }
    })
    return () => unsub()
  }, [])

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Nursing Clinical Workspace</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: C.textLight }}>Day Shift · {shiftStart}–{shiftEnd}</div>
        <div style={{ width: 100, height: 6, borderRadius: 3, background: C.border }}>
          <div style={{ width: `${shiftProgress}%`, height: 6, borderRadius: 3, background: C.sky }} />
        </div>
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>MA</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Nursing</div>
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
          {/* ─── DASHBOARD / SHIFT COMMAND ─── */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Good Morning,</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginTop: 2 }}>Mary Atieno · Registered Nurse</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Medical Ward III · Day Shift {shiftStart}–{shiftEnd}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={S.badge(C.green)}>{PATIENTS.filter(p => p.priority === 'STABLE').length} Stable</span>
                  <span style={S.badge(C.red)}>{PATIENTS.filter(p => p.priority === 'HIGH').length} High Priority</span>
                  <span style={S.badge(C.amber)}>{medsSchedule.filter(m => m.status === 'Due').length} Meds Due</span>
                </div>
              </div>

              {/* My Patients */}
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>My Patients</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PATIENTS.map(p => (
                    <div key={p.bed} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.skyLight; e.currentTarget.style.borderColor = C.sky }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.border }}>
                      <div style={{ background: C.skyLight, color: C.sky, fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}>Bed {p.bed}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{p.age} · {p.status}</div>
                        {p.alerts.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                            {p.alerts.map(a => <span key={a} style={S.pill(C.red)}>{a}</span>)}
                          </div>
                        )}
                      </div>
                      {p.isolation && <span style={S.pill(C.amber)}>🧪 Isolation</span>}
                      {p.allergies !== 'None' && <span style={S.pill(C.red)}>⚠ {p.allergies}</span>}
                      <span style={S.pill(p.priority === 'HIGH' ? C.red : p.priority === 'MEDIUM' ? C.amber : C.green)}>{p.priority}</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {p.tasks.map(t => (
                          <label key={t} style={{ fontSize: 9, color: C.textLight, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <input type="checkbox" style={{ accentColor: C.sky, width: 10, height: 10 }} />
                            {t.slice(0, 14)}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TODAY'S TASKS + MEDS DUE */}
              <div style={{ ...S.grid2, marginTop: 16 }}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Today's Tasks</div>
                  {[
                    { task: 'Morning observations', due: '07:00–08:00', done: true },
                    { task: 'Medication round', due: '08:00–09:00', done: true },
                    { task: 'IV Artesunate — James Mwangi', due: '08:00', done: false },
                    { task: 'Blood transfusion — Kevin Mutua', due: '10:00', done: false },
                    { task: 'Wound dressing — Bed 8', due: '10:30', done: false },
                    { task: 'Admission assessment — Bed 6', due: 'Pending', done: false },
                    { task: 'Evening observations', due: '16:00–17:00', done: false },
                  ].map(t => (
                    <div key={t.task} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.panel}`, fontSize: 11 }}>
                      <input type="checkbox" checked={t.done} style={{ accentColor: C.sky }} />
                      <span style={{ flex: 1, color: t.done ? C.textLight : C.text, textDecoration: t.done ? 'line-through' : 'none' }}>{t.task}</span>
                      <span style={{ color: C.textLight, fontSize: 10 }}>{t.due}</span>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Monitoring Alerts</div>
                  {[
                    { patient: 'Kevin Mutua', alert: 'Hb 5.8 g/dL — Transfusion overdue', color: C.red },
                    { patient: 'James Mwangi', alert: 'PEWS 6 — Escalation required', color: C.red },
                    { patient: 'Peter Otieno', alert: 'K+ 6.8 mEq/L — Critical', color: C.amber },
                  ].map(a => (
                    <div key={a.alert} style={{ padding: '8px 10px', borderRadius: 6, background: `${a.color}10`, border: `1px solid ${a.color}25`, marginBottom: 6, fontSize: 11 }}>
                      <div style={{ fontWeight: 600, color: a.color }}>{a.patient}</div>
                      <div style={{ color: C.text }}>{a.alert}</div>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: C.textLight, padding: 8, textAlign: 'center' }}>No other alerts</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HANDOVER ─── */}
          {tab === 'handover' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Shift Handover</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Structured handover to prevent information loss</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Outgoing Nurse Report</div>
                  {PATIENTS.map(p => (
                    <div key={p.bed} style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 8, fontSize: 11 }}>
                      <div style={{ fontWeight: 600, color: C.navy, marginBottom: 4 }}>Bed {p.bed} · {p.name}</div>
                      <div style={{ color: C.text, lineHeight: 1.6 }}>
                        <div>Dx: {p.status}</div>
                        <div>Events today: [Auto-populated from encounter timeline]</div>
                        <div>Pending: {p.tasks.join(', ')}</div>
                        <div>IV fluids: [Auto-populated]</div>
                        <div>Concerns: {p.alerts.join(', ') || 'None'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Incoming Nurse Confirmation</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 8, background: C.green + '10', border: `1px solid ${C.green}25`, fontSize: 12 }}>
                      <div style={{ fontWeight: 600, color: C.green }}>Handover Summary</div>
                      <div style={{ color: C.text, marginTop: 4 }}>5 patients transferred · 3 high priority · 2 medication alerts · 1 overdue task</div>
                    </div>
                    <button style={S.btn(C.green)}>
                      <CheckCircle size={14} style={{ marginRight: 6 }} />
                      Accept Handover
                    </button>
                    <div style={{ fontSize: 10, color: C.textLight }}>Records: time, outgoing nurse, incoming nurse, patients transferred</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ADMISSION ASSESSMENT ─── */}
          {tab === 'assessment' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Admission Assessment</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Mandatory tasks generated when a patient arrives on the ward</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Assessment Checklist</div>
                  {[
                    'Identity Verification',
                    'Baseline Vital Signs',
                    'Weight & Height',
                    'Pain Score',
                    'Pressure Injury Risk (Braden)',
                    'Falls Risk (Morse)',
                    'Nutrition Screening (MUST)',
                    'Skin Assessment',
                    'Belongings Recorded',
                    'Ward Orientation',
                    'Patient Education',
                  ].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.panel}`, fontSize: 11, cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: C.sky }} />
                      {item}
                    </label>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Nursing Assessment — ABCDE</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Airway: Patent', 'Breathing: SpO₂ 97% RA', 'Circulation: CRT 3s, BP 90/60', 'Disability: AVPU — Voice', 'Exposure: No rash, warm'].map(a => (
                      <div key={a} style={{ padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11, color: C.text }}>{a}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={S.label}>Additional Notes</div>
                    <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' as const }} placeholder="Psychosocial, mobility, elimination, safety concerns..." />
                  </div>
                  <button style={{ ...S.btn(C.sky), marginTop: 12, width: '100%' }}>Complete Admission Assessment</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── eMAR ─── */}
          {tab === 'emar' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Medication Administration Record</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>eMAR — Real-time medication administration from doctor prescriptions</div>
              <div style={S.card}>
                <NurseEMAR unitId="ward" patientId={selectedPatientId} userId={userId} userName={userName} />
              </div>
            </div>
          )}

          {/* ─── KARDEX ─── */}
          {tab === 'kardex' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Nursing Kardex</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Live nursing care board — generated automatically from the encounter</div>
              <NurseKardexView orgId="telemed-a98cf" deptId="ward" unitId="ward" userId={userId} />
            </div>
          )}

          {/* ─── VITAL SIGNS ─── */}
          {tab === 'vitals' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Vital Signs Workspace</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Record vitals — trends and deterioration detection — real-time shared with doctors</div>
              {selectedPatientId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>
                      Record Vitals for {activePatients.find(p => p.id === selectedPatientId)?.name || 'Selected Patient'}
                    </div>
                    <NurseVitalsCapture
                      deptId="ward"
                      unitId="ward"
                      encounterId={selectedEncounterId || 'current'}
                      patientId={selectedPatientId}
                      userId={userId}
                      userName={userName}
                    />
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>
                      Vital Trends — Shared with Doctor
                    </div>
                    <VitalTrendsDashboard
                      deptId="ward"
                      unitId="ward"
                      encounterId={selectedEncounterId || 'current'}
                      patientId={selectedPatientId}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
                  Select a patient from the dropdown above to record vitals
                </div>
              )}
            </div>
          )}

          {/* ─── FLUID BALANCE ─── */}
          {tab === 'fluids' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Fluid Balance</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Automated totals with alert triggers</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Input (mL) — James Mwangi</div>
                  <div style={S.grid2}>
                    {Object.entries(fluidInput).map(([k, v]) => (
                      <div key={k}><label style={S.label}>{k.charAt(0).toUpperCase() + k.slice(1)}</label><input style={S.input} value={v} onChange={e => setFluidInput(prev => ({ ...prev, [k]: e.target.value }))} /></div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: C.navy }}>Total Input: {Object.values(fluidInput).reduce((a, b) => a + parseInt(b || '0'), 0)} mL</div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Output (mL)</div>
                  <div style={S.grid2}>
                    {Object.entries(fluidOutput).map(([k, v]) => (
                      <div key={k}><label style={S.label}>{k.charAt(0).toUpperCase() + k.slice(1)}</label><input style={S.input} value={v} onChange={e => setFluidOutput(prev => ({ ...prev, [k]: e.target.value }))} /></div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: C.navy }}>Total Output: {Object.values(fluidOutput).reduce((a, b) => a + parseInt(b || '0'), 0)} mL</div>
                  <div style={{ marginTop: 6, padding: 8, borderRadius: 6, background: `${C.amber}10`, fontSize: 11 }}>
                    <span style={{ fontWeight: 600, color: C.amber }}>Net Balance: +{Object.values(fluidInput).reduce((a, b) => a + parseInt(b || '0'), 0) - Object.values(fluidOutput).reduce((a, b) => a + parseInt(b || '0'), 0)} mL</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── OBSERVATION CHARTS ─── */}
          {tab === 'observations' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Observation Charts</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Configurable monitoring schedules with overdue tracking</div>
              <div style={S.grid3}>
                {['Hourly', '4-hourly', '6-hourly', '12-hourly', 'Daily', 'PRN'].map(schedule => (
                  <div key={schedule} style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>{schedule}</div>
                    <div style={{ fontSize: 11, color: C.text }}>Due: 3 patients</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Overdue: 1 patient</div>
                    <span style={S.badge(C.amber)}>Actions needed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CARE PLANS ─── */}
          {tab === 'care-plans' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Nursing Care Plans</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Linked to active problems — evolving with the patient</div>
              {[
                { problem: 'Dehydration', goal: 'Maintain urine output >1 mL/kg/hr', interventions: ['Monitor I/O', 'Administer IV fluids', 'Assess mucous membranes', 'Daily weight'], progress: 'Improving', color: C.green },
                { problem: 'Hyperthermia', goal: 'Temperature <38°C', interventions: ['Q4h temperature', 'Administer antipyretics', 'Cool compresses', 'Monitor for seizures'], progress: 'Resolving', color: C.amber },
                { problem: 'Risk for seizures', goal: 'No seizure activity', interventions: ['Seizure precautions', 'Pad side rails', 'Suction at bedside', 'Monitor LOC'], progress: 'Stable', color: C.green },
              ].map(cp => (
                <div key={cp.problem} style={{ ...S.card, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{cp.problem}</div>
                    <span style={S.badge(cp.color)}>{cp.progress}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6 }}>Goal: {cp.goal}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {cp.interventions.map(i => (
                      <label key={i} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: C.sky, width: 10, height: 10 }} />
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── TASK ENGINE ─── */}
          {tab === 'tasks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Task Engine</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Tasks generated from orders, schedules, care plans, and workflows</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['all', 'due', 'overdue', 'completed'].map(f => (
                    <button key={f} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: taskFilter === f ? C.sky : C.panel, color: taskFilter === f ? C.white : C.text, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => setTaskFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                  ))}
                </div>
              </div>
              <div style={S.card}>
                {[
                  { task: 'IV Artesunate — James Mwangi', due: '14:00', type: 'Medication', status: 'due' },
                  { task: 'Blood transfusion — Kevin Mutua', due: '10:00', type: 'Procedure', status: 'overdue' },
                  { task: 'Admission assessment — Bed 6', due: 'Today', type: 'Assessment', status: 'due' },
                  { task: 'Morning vitals — All patients', due: 'Completed', type: 'Observation', status: 'completed' },
                  { task: 'Wound care — Bed 8', due: '10:30', type: 'Procedure', status: 'due' },
                  { task: 'Discharge teaching — Bed 3', due: '11:00', type: 'Education', status: 'due' },
                ].filter(t => taskFilter === 'all' || t.status === taskFilter).map(t => (
                  <div key={t.task} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderBottom: `1px solid ${C.panel}`, fontSize: 12 }}>
                    <input type="checkbox" checked={t.status === 'completed'} style={{ accentColor: C.sky }} />
                    <span style={S.badge(t.status === 'overdue' ? C.red : t.status === 'due' ? C.amber : C.green)}>{t.type}</span>
                    <span style={{ flex: 1, color: t.status === 'completed' ? C.textLight : C.text, textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>{t.task}</span>
                    <span style={{ color: t.status === 'overdue' ? C.red : C.textLight, fontWeight: t.status === 'overdue' ? 600 : 400 }}>{t.due}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ESCALATION ─── */}
          {tab === 'escalation' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Escalation Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Automatic detection and notification of clinical deterioration</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Active Escalations</div>
                  {[
                    { patient: 'James Mwangi', criteria: 'PEWS 6 · SpO₂ 89%', time: '3 min ago', color: C.red },
                    { patient: 'Kevin Mutua', criteria: 'Hb 5.8 · HR 158', time: '8 min ago', color: C.red },
                    { patient: 'Peter Otieno', criteria: 'K+ 6.8 · ECG changes', time: '15 min ago', color: C.amber },
                  ].map(e => (
                    <div key={e.patient} style={{ padding: '10px 12px', borderRadius: 8, background: `${e.color}10`, border: `1px solid ${e.color}25`, marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: e.color, fontSize: 12 }}>{e.patient}</div>
                        <span style={{ fontSize: 10, color: C.textLight }}>{e.time}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.text }}>{e.criteria}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: C.red, color: C.white, fontSize: 10, cursor: 'pointer' }}>Alert Doctor</button>
                        <button style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 10, cursor: 'pointer' }}>Acknowledge</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Escalation Rules</div>
                  {[
                    { rule: 'HR >140 or <60', action: 'Alert doctor immediately' },
                    { rule: 'SpO₂ <90%', action: 'Give oxygen, reassess, escalate' },
                    { rule: 'Urine output <0.5 mL/kg/hr x 2 hrs', action: 'Fluid challenge, notify doctor' },
                    { rule: 'PEWS ≥4', action: 'Review by senior nurse' },
                    { rule: 'PEWS ≥6', action: 'Immediate doctor review' },
                    { rule: 'NEWS2 ≥5', action: 'Urgent clinical review' },
                    { rule: 'Temp >39.5°C', action: 'Administer antipyretics, cultures if new' },
                  ].map(r => (
                    <div key={r.rule} style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panel}`, fontSize: 11 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{r.rule}</span>
                      <div style={{ color: C.textLight }}>{r.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── DISCHARGE PREP ─── */}
          {tab === 'discharge' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Discharge Preparation</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Auto-generated tasks when doctor marks Expected Discharge</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Discharge Checklist</div>
                  {[
                    'Remove IV cannula',
                    'Final observations recorded',
                    'Medication teaching completed',
                    'Wound care education given',
                    'Follow-up appointment confirmed',
                    'Return patient belongings',
                    'Complete discharge checklist',
                  ].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.panel}`, fontSize: 11, cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: C.sky }} />
                      {item}
                    </label>
                  ))}
                  <button style={{ ...S.btn(C.green), marginTop: 12, width: '100%' }}>Confirm Discharge Ready</button>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Patients Expected for Discharge</div>
                  <div style={{ padding: 12, borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Kevin Mutua · Bed 5</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Expected today · Discharge summary pending</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Grace Wanjiku · Bed 6</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Expected tomorrow · Follow-up not scheduled</div>
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
