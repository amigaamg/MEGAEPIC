'use client'
import { useState } from 'react'
import { Activity, Scissors, Clock, AlertTriangle, CheckCircle, XCircle, User, ChevronRight, Plus, Search, ArrowRight, Menu, Bell, BookOpen, Eye, FileText, FlaskConical, Heart, Shield, Thermometer, type LucideIcon } from 'lucide-react'
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
  textarea: { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.panel, outline: 'none', fontFamily: "'Inter', sans-serif", resize: 'vertical' as const, minHeight: 60 },
  btn: (c: string) => ({ padding: '8px 20px', borderRadius: 8, border: 'none', background: c, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }),
  btnO: { padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  badge: (c: string) => ({ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  pill: (c: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  secTitle: { fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 },
  divider: { height: 1, background: C.border, margin: '16px 0' },
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Command Center', icon: Activity },
  { id: 'booking', label: 'Surgical Booking', icon: FileText },
  { id: 'schedule', label: 'Theatre Schedule', icon: Clock },
  { id: 'preop', label: 'Preoperative', icon: Shield },
  { id: 'anaesthesia', label: 'Anaesthesia', icon: Thermometer },
  { id: 'who', label: 'WHO Checklist', icon: CheckCircle },
  { id: 'procedure', label: 'Procedure Note', icon: Scissors },
  { id: 'recovery', label: 'Recovery', icon: Heart },
  { id: 'specimen', label: 'Specimen Tracking', icon: FlaskConical },
  { id: 'instruments', label: 'Instruments (CSSD)', icon: Activity },
  { id: 'postop', label: 'Postoperative', icon: FileText },
  { id: 'complications', label: 'Complications', icon: AlertTriangle },
]

const statusIcon = (s: string) => {
  switch (s) {
    case 'Completed': case 'Ready': case 'Signed': return <CheckCircle size={14} color={C.green} />
    case 'In Progress': case 'Operating': case 'Recovery': return <Clock size={14} color={C.sky} />
    case 'Pending': case 'Booked': case 'Scheduled': return <Clock size={14} color={C.amber} />
    case 'Cancelled': case 'Delayed': return <XCircle size={14} color={C.red} />
    case 'Critical': return <AlertTriangle size={14} color={C.red} />
    default: return <Clock size={14} color={C.textLight} />
  }
}

const statusColor = (s: string) => {
  switch (s) {
    case 'Completed': case 'Ready': case 'Signed': case 'Available': return C.green
    case 'In Progress': case 'Operating': case 'Recovery': return C.sky
    case 'Pending': case 'Booked': case 'Scheduled': return C.amber
    case 'Cancelled': case 'Delayed': case 'Down': case 'Critical': return C.red
    default: return C.text
  }
}

interface Booking {
  id: string; patient: string; procedure: string; surgeon: string; priority: string; status: string; anaesthetist: string; duration: string; bloodRequired: boolean; icuRequired: boolean
}

interface PreopChecklist {
  id: string; patient: string; procedure: string; consent: boolean; imaging: boolean; labsComplete: boolean; bloodAvailable: boolean; allergies: string; status: string
}

interface AnaesthesiaRecord {
  id: string; patient: string; asa: string; airway: string; plan: string; status: string; induction: string; maintenance: string
}

interface ProcedureNote {
  id: string; patient: string; procedure: string; findings: string; bloodLoss: string; complications: string; implants: string; status: string
}

interface RecoveryRecord {
  id: string; patient: string; aldrete: number; pain: string; bleeding: string; consciousness: string; status: string
}

interface Specimen {
  id: string; patient: string; specimen: string; barcode: string; status: string; sent: string; report: string
}

interface Instrument {
  id: string; tray: string; items: number; status: string; cycle: string; expiry: string
}

interface Complication {
  id: string; patient: string; type: string; severity: string; date: string; outcome: string
}

const BOOKINGS: Booking[] = [
  { id: 'B1', patient: 'Peter Otieno', procedure: 'Exploratory Laparotomy', surgeon: 'Dr. Kamau', priority: 'Emergency', status: 'Operating', anaesthetist: 'Dr. Ochieng', duration: '120 min', bloodRequired: true, icuRequired: true },
  { id: 'B2', patient: 'Grace Wanjiku', procedure: 'Open Cholecystectomy', surgeon: 'Dr. Kamau', priority: 'Elective', status: 'Booked', anaesthetist: 'Dr. Ochieng', duration: '90 min', bloodRequired: false, icuRequired: false },
  { id: 'B3', patient: 'Mary Achieng', procedure: 'Caesarean Section', surgeon: 'Dr. Njeri', priority: 'Urgent', status: 'Scheduled', anaesthetist: 'Dr. Wafula', duration: '60 min', bloodRequired: true, icuRequired: false },
  { id: 'B4', patient: 'Kevin Mutua', procedure: 'Hernia Repair', surgeon: 'Dr. Kamau', priority: 'Elective', status: 'Pending', anaesthetist: 'Dr. Ochieng', duration: '75 min', bloodRequired: false, icuRequired: false },
  { id: 'B5', patient: 'John Njoroge', procedure: 'Appendicectomy', surgeon: 'Dr. Njeri', priority: 'Emergency', status: 'Booked', anaesthetist: 'Dr. Wafula', duration: '60 min', bloodRequired: false, icuRequired: false },
]

const PREOP: PreopChecklist[] = [
  { id: 'P1', patient: 'Peter Otieno', procedure: 'Exploratory Laparotomy', consent: true, imaging: true, labsComplete: true, bloodAvailable: true, allergies: 'None', status: 'Ready' },
  { id: 'P2', patient: 'Grace Wanjiku', procedure: 'Open Cholecystectomy', consent: true, imaging: true, labsComplete: true, bloodAvailable: false, allergies: 'Penicillin', status: 'Pending' },
  { id: 'P3', patient: 'Mary Achieng', procedure: 'Caesarean Section', consent: true, imaging: false, labsComplete: true, bloodAvailable: true, allergies: 'None', status: 'Pending' },
  { id: 'P4', patient: 'Kevin Mutua', procedure: 'Hernia Repair', consent: false, imaging: true, labsComplete: false, bloodAvailable: false, allergies: 'None', status: 'Incomplete' },
]

const ANAESTHESIA: AnaesthesiaRecord[] = [
  { id: 'A1', patient: 'Peter Otieno', asa: 'ASA 3E', airway: 'Mallampati II — easy', plan: 'General anaesthesia + epidural', status: 'Induced', induction: 'Propofol 120mg + Rocuronium 50mg', maintenance: 'Sevoflurane + O2/Air' },
  { id: 'A2', patient: 'Grace Wanjiku', asa: 'ASA 2', airway: 'Mallampati I', plan: 'General anaesthesia + LMA', status: 'Pending', induction: '—', maintenance: '—' },
  { id: 'A3', patient: 'Mary Achieng', asa: 'ASA 2E', airway: 'Mallampati II', plan: 'Spinal anaesthesia', status: 'Pending', induction: '—', maintenance: '—' },
]

const PROCEDURE_NOTES: ProcedureNote[] = [
  { id: 'PN1', patient: 'Peter Otieno', procedure: 'Exploratory Laparotomy', findings: 'Perforated duodenal ulcer with moderate peritonitis. Primary repair performed. Abdominal washout with 4L normal saline.', bloodLoss: '200 mL', complications: 'None', implants: 'None', status: 'Completed' },
]

const RECOVERY: RecoveryRecord[] = [
  { id: 'R1', patient: 'Peter Otieno', aldrete: 8, pain: 'Controlled (PCA)', bleeding: 'Minimal — dressing dry', consciousness: 'Responding to voice', status: 'In Recovery' },
]

const SPECIMENS: Specimen[] = [
  { id: 'S1', patient: 'Peter Otieno', specimen: 'Omental biopsy', barcode: 'HISTO-2026-001', status: 'Sent to Lab', sent: '10:30', report: 'Pending' },
  { id: 'S2', patient: 'Grace Wanjiku', specimen: 'Gallbladder', barcode: 'HISTO-2026-002', status: 'Not Yet Collected', sent: '—', report: '—' },
]

const INSTRUMENTS: Instrument[] = [
  { id: 'I1', tray: 'Laparotomy Set', items: 42, status: 'In Use', cycle: '#CYC-2026-089', expiry: '2026-07-10' },
  { id: 'I2', tray: 'Laparoscopy Set', items: 28, status: 'Available', cycle: '#CYC-2026-090', expiry: '2026-07-11' },
  { id: 'I3', tray: 'Caesarean Set', items: 35, status: 'Available', cycle: '#CYC-2026-088', expiry: '2026-07-09' },
  { id: 'I4', tray: 'Hernia Set', items: 22, status: 'Sterilization', cycle: '#CYC-2026-091', expiry: '2026-07-12' },
  { id: 'I5', tray: 'Orthopaedic Set', items: 38, status: 'Available', cycle: '#CYC-2026-087', expiry: '2026-07-08' },
]

const COMPLICATIONS: Complication[] = [
  { id: 'C1', patient: 'Mary Achieng', type: 'Surgical Site Infection', severity: 'Moderate', date: '2026-07-08', outcome: 'Resolved with antibiotics' },
  { id: 'C2', patient: 'John Njoroge', type: 'Postoperative Bleeding', severity: 'Severe', date: '2026-07-05', outcome: 'Returned to theatre — haemostasis achieved' },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Doctor Dashboard', href: '/doctor' },
  { label: 'Doctor Clinical', href: '/doctor/workspace' },
  { label: 'Nurse Workspace', href: '/nurse' },
  { label: 'Laboratory', href: '/laboratory' },
  { label: 'Pharmacy', href: '/pharmacy' },
  { label: 'Radiology', href: '/radiology' },
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

export default function TheatreWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Theatre & Perioperative Intelligence Workspace</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
          <Bell size={14} color={C.textLight} /> <span style={S.badge(C.red)}>3</span>
          <User size={14} color={C.textLight} />
          <span style={{ fontWeight: 600, color: C.navy }}>Surgeon On Duty</span>
        </div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Theatre</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id} style={S.navItem(tab === item.id)} onClick={() => setTab(item.id)}>
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Other Workspaces</div>
          {WORKSPACE_LINKS.map(w => (
            <a key={w.label} href={w.href} style={{ ...S.navItem(false), textDecoration: 'none', fontSize: 11 }}>
              <span style={{ fontSize: 12, flexShrink: 0 }}>▸</span>
              {w.label}
            </a>
          ))}
        </nav>

        <main style={S.main}>
          {/* ─── COMMAND CENTER ─── */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Theatre Command Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Total Bookings', val: BOOKINGS.length, col: C.sky, icon: <FileText size={20} /> },
                  { label: 'Operating Now', val: BOOKINGS.filter(b => b.status === 'Operating').length, col: C.red, icon: <Scissors size={20} /> },
                  { label: 'Ready for Surgery', val: PREOP.filter(p => p.status === 'Ready').length, col: C.green, icon: <CheckCircle size={20} /> },
                  { label: 'In Recovery', val: RECOVERY.filter(r => r.status === 'In Recovery').length, col: C.sky, icon: <Heart size={20} /> },
                  { label: 'Pending Preop', val: PREOP.filter(p => p.status !== 'Ready').length, col: C.amber, icon: <Shield size={20} /> },
                  { label: 'Specimens Pending', val: SPECIMENS.filter(s => s.status !== 'Reported').length, col: C.amber, icon: <FlaskConical size={20} /> },
                  { label: 'CSSD Items Used', val: INSTRUMENTS.filter(i => i.status === 'In Use' || i.status === 'Sterilization').length, col: C.sky, icon: <Activity size={20} /> },
                  { label: 'Complications (30d)', val: COMPLICATIONS.length, col: C.red, icon: <AlertTriangle size={20} /> },
                ].map(m => (
                  <div key={m.label} style={S.cardH}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ color: m.col }}>{m.icon}</span>
                      <span style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>{m.val}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.text }}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={S.secTitle}>Today's Operating List</div>
                {BOOKINGS.filter(b => b.status !== 'Cancelled').slice(0, 4).map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.panel}` }}>
                    <div style={{ minWidth: 60, fontSize: 11, color: C.textLight }}>{b.status === 'Operating' ? 'NOW' : b.priority}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{b.procedure}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{b.patient} · {b.surgeon} · {b.duration}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(b.status)) }}>
                      {statusIcon(b.status)} {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SURGICAL BOOKING ─── */}
          {tab === 'booking' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Surgical Booking</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Diagnosis → Indication → Priority → Booking</div>
                </div>
                <button style={S.btn(C.sky)}>+ New Booking</button>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PROCEDURE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>SURGEON</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PRIORITY</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ANAESTHETIST</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DURATION</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>BLOOD</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ICU</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BOOKINGS.map(b => (
                      <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{b.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{b.procedure}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{b.surgeon}</td>
                        <td style={{ padding: '10px 14px' }}><span style={S.badge(b.priority === 'Emergency' ? C.red : b.priority === 'Urgent' ? C.amber : C.sky)}>{b.priority}</span></td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{b.anaesthetist}</td>
                        <td style={{ padding: '10px 14px', color: C.textLight }}>{b.duration}</td>
                        <td style={{ padding: '10px 14px' }}>{b.bloodRequired ? <span style={S.pill(C.red)}>Yes</span> : <span style={{ color: C.textLight }}>No</span>}</td>
                        <td style={{ padding: '10px 14px' }}>{b.icuRequired ? <span style={S.pill(C.red)}>Yes</span> : <span style={{ color: C.textLight }}>No</span>}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(b.status)) }}>
                            {statusIcon(b.status)} {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── THEATRE SCHEDULE ─── */}
          {tab === 'schedule' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Theatre Schedule</div>
              <div style={S.grid3}>
                {['Theatre 1', 'Theatre 2', 'Theatre 3'].map(theatre => (
                  <div key={theatre} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{theatre}</div>
                      <span style={S.pill(C.green)}>Available</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8 }}>Today's Schedule</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {BOOKINGS.filter(b => b.status !== 'Cancelled').slice(0, 3).map((b, i) => (
                        <div key={b.id} style={{ padding: '6px 8px', background: C.panel, borderRadius: 6, fontSize: 11 }}>
                          <div style={{ fontWeight: 600, color: C.navy }}>{['08:00', '10:30', '13:00'][i] || '—'} — {b.procedure}</div>
                          <div style={{ color: C.textLight }}>{b.patient} · {b.surgeon} · {b.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PREOPERATIVE ─── */}
          {tab === 'preop' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Preoperative Optimization</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Consent · Imaging · Labs · Blood · Allergies · Anaesthesia Review</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PREOP.map(p => {
                  const allChecked = p.consent && p.imaging && p.labsComplete && p.bloodAvailable
                  return (
                    <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${allChecked ? C.green : C.red}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{p.procedure}</div>
                          <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{p.patient}</div>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(p.status)) }}>
                          {statusIcon(p.status)} {p.status}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, fontSize: 11 }}>
                        <div><span style={{ color: p.consent ? C.green : C.red }}>{p.consent ? '✓' : '✗'}</span> Consent</div>
                        <div><span style={{ color: p.imaging ? C.green : C.red }}>{p.imaging ? '✓' : '✗'}</span> Imaging</div>
                        <div><span style={{ color: p.labsComplete ? C.green : C.red }}>{p.labsComplete ? '✓' : '✗'}</span> Labs</div>
                        <div><span style={{ color: p.bloodAvailable ? C.green : C.red }}>{p.bloodAvailable ? '✓' : '✗'}</span> Blood</div>
                        <div><span style={{ color: C.text }}>Allergies: {p.allergies}</span></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── ANAESTHESIA ─── */}
          {tab === 'anaesthesia' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Anaesthesia Workspace</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Preop Assessment · ASA · Airway · Plan · Induction · Maintenance · Recovery</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ANAESTHESIA.map(a => (
                  <div key={a.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{a.patient}</div>
                        <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{a.asa} · {a.airway}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(a.status)) }}>
                        {statusIcon(a.status)} {a.status}
                      </span>
                    </div>
                    <div style={S.grid2}>
                      <div><span style={{ fontSize: 11, color: C.textLight }}>Plan:</span> <span style={{ fontSize: 12, color: C.text }}>{a.plan}</span></div>
                      <div><span style={{ fontSize: 11, color: C.textLight }}>Induction:</span> <span style={{ fontSize: 12, color: C.text }}>{a.induction}</span></div>
                      <div><span style={{ fontSize: 11, color: C.textLight }}>Maintenance:</span> <span style={{ fontSize: 12, color: C.text }}>{a.maintenance}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── WHO CHECKLIST ─── */}
          {tab === 'who' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>WHO Surgical Safety Checklist</div>
              <div style={S.grid3}>
                <div style={{ ...S.card, borderTop: `3px solid ${C.sky}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Sign In (Before Induction)</div>
                  {['Patient identity confirmed', 'Procedure confirmed', 'Site marked', 'Consent signed', 'Allergies checked', 'Airway assessed', 'Blood available'].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text, padding: '4px 0', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: C.sky }} /> {item}
                    </label>
                  ))}
                </div>
                <div style={{ ...S.card, borderTop: `3px solid ${C.amber}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Time Out (Before Incision)</div>
                  {['Team introductions complete', 'Procedure confirmed with team', 'Antibiotic prophylaxis given', 'Critical concerns discussed', 'Equipment ready', 'Imaging displayed'].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text, padding: '4px 0', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: C.sky }} /> {item}
                    </label>
                  ))}
                </div>
                <div style={{ ...S.card, borderTop: `3px solid ${C.green}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Sign Out (Before Leaving)</div>
                  {['Instrument count correct', 'Needle count correct', 'Swab count correct', 'Specimens labelled', 'Procedure documented', 'Recovery plan confirmed'].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text, padding: '4px 0', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: C.sky }} /> {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── PROCEDURE NOTE ─── */}
          {tab === 'procedure' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Surgical Procedure Note</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Indication · Findings · Technique · Blood Loss · Complications · Implants</div>
                </div>
                <button style={S.btn(C.sky)}>+ New Procedure Note</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PROCEDURE_NOTES.map(pn => (
                  <div key={pn.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{pn.procedure}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{pn.patient}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(pn.status)) }}>
                        {statusIcon(pn.status)} {pn.status}
                      </span>
                    </div>
                    <div style={S.grid2}>
                      <div><span style={{ fontSize: 11, color: C.textLight }}>Findings:</span> <span style={{ fontSize: 12, color: C.text }}>{pn.findings}</span></div>
                      <div><span style={{ fontSize: 11, color: C.textLight }}>Blood Loss:</span> <span style={{ fontSize: 12, color: C.text }}>{pn.bloodLoss}</span></div>
                      <div><span style={{ fontSize: 11, color: C.textLight }}>Complications:</span> <span style={{ fontSize: 12, color: C.text }}>{pn.complications}</span></div>
                      <div><span style={{ fontSize: 11, color: C.textLight }}>Implants:</span> <span style={{ fontSize: 12, color: C.text }}>{pn.implants}</span></div>
                    </div>
                  </div>
                ))}
                {PROCEDURE_NOTES.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 48, fontSize: 13, color: C.textLight }}>No procedure notes yet</div>
                )}
              </div>
            </div>
          )}

          {/* ─── RECOVERY ─── */}
          {tab === 'recovery' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Recovery Room</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RECOVERY.map(r => (
                  <div key={r.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{r.patient}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(r.status)) }}>
                        {statusIcon(r.status)} {r.status}
                      </span>
                    </div>
                    <div style={S.grid4}>
                      <div style={{ textAlign: 'center', padding: 12, background: C.panel, borderRadius: 8 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: r.aldrete >= 8 ? C.green : C.amber }}>{r.aldrete}/10</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>Aldrete Score</div>
                      </div>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Pain:</span> <div style={{ fontSize: 12, color: C.text }}>{r.pain}</div></div>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Bleeding:</span> <div style={{ fontSize: 12, color: C.text }}>{r.bleeding}</div></div>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Consciousness:</span> <div style={{ fontSize: 12, color: C.text }}>{r.consciousness}</div></div>
                    </div>
                  </div>
                ))}
                {RECOVERY.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 48, fontSize: 13, color: C.textLight }}>No patients in recovery</div>
                )}
              </div>
            </div>
          )}

          {/* ─── SPECIMEN TRACKING ─── */}
          {tab === 'specimen' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Specimen Tracking</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>BARCODE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>SPECIMEN</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>SENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>REPORT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPECIMENS.map(s => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: C.navy }}>{s.barcode}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{s.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{s.specimen}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{s.sent}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(s.status)) }}>
                            {statusIcon(s.status)} {s.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: C.textLight }}>{s.report}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── INSTRUMENTS / CSSD ─── */}
          {tab === 'instruments' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Instrument Intelligence (CSSD)</div>
              <div style={S.grid3}>
                {INSTRUMENTS.map(instr => (
                  <div key={instr.id} style={{ padding: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, borderLeft: `3px solid ${instr.status === 'Available' ? C.green : instr.status === 'In Use' ? C.amber : C.sky}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{instr.tray}</span>
                      <span style={S.badge(statusColor(instr.status))}>{instr.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.text }}>Items: {instr.items}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>Cycle: {instr.cycle}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>Expiry: {instr.expiry}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── POSTOPERATIVE ─── */}
          {tab === 'postop' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Postoperative Orders</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.secTitle}>Immediate Postop Orders</div>
                  {['Analgesia: PCA Morphine', 'Antibiotics: Ceftriaxone 1g IV BD', 'IV Fluids: Normal Saline 1L 8-hourly', 'Monitoring: Q15min vitals x2, Q30min x2, Q1h x2, then Q4h', 'Mobilization: Bed rest 6h, then sit out', 'Diet: NPO 4h, then sips', 'Drain Management: NGT on free drainage', 'VTE Prophylaxis: Enoxaparin 40mg SC OD'].map(order => (
                    <label key={order} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text, padding: '4px 0', borderBottom: `1px solid ${C.panel}`, cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: C.sky }} /> {order}
                    </label>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={S.secTitle}>Follow-up Plan</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.8 }}>
                    <div>• Review in 1 week at surgical clinic</div>
                    <div>• Wound check at 48h by GP</div>
                    <div>• Remove sutures Day 10</div>
                    <div>• No heavy lifting for 6 weeks</div>
                    <div>• Return immediately if: fever, wound discharge, increasing pain, vomiting</div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={S.label}>Review Date</label>
                    <input style={S.input} type="date" defaultValue="2026-07-16" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── COMPLICATIONS ─── */}
          {tab === 'complications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Surgical Complications</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>30-day morbidity tracking</div>
                </div>
                <button style={S.btn(C.sky)}>+ Record Complication</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COMPLICATIONS.map(c => (
                  <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{c.type}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{c.patient} · {c.date}</div>
                      </div>
                      <span style={S.badge(c.severity === 'Severe' ? C.red : c.severity === 'Moderate' ? C.amber : C.sky)}>{c.severity}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.text }}>Outcome: {c.outcome}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
