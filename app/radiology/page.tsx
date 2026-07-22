'use client'
import { useState } from 'react'
import { Activity, Scan, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, User, ChevronRight, Plus, Search, ArrowRight, Menu, Bell, BookOpen, Eye, FileText, FlaskConical, Truck, Monitor, Layers, type LucideIcon } from 'lucide-react'
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
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'requests', label: 'Imaging Requests', icon: FileText },
  { id: 'appropriateness', label: 'Appropriateness', icon: AlertTriangle },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'preparation', label: 'Patient Prep', icon: CheckCircle },
  { id: 'transport', label: 'Transport', icon: Truck },
  { id: 'acquisition', label: 'Acquisition', icon: Scan },
  { id: 'quality', label: 'Quality Control', icon: Eye },
  { id: 'reporting', label: 'Reporting', icon: FileText },
  { id: 'critical', label: 'Critical Findings', icon: AlertTriangle },
  { id: 'archive', label: 'Image Archive', icon: Layers },
  { id: 'equipment', label: 'Equipment', icon: Monitor },
]

const statusIcon = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Reported': case 'Arrived': return <CheckCircle size={14} color={C.green} />
    case 'Processing': case 'Scanning': case 'In Progress': case 'Preparing': return <Clock size={14} color={C.sky} />
    case 'Pending': case 'Scheduled': case 'Ordered': case 'Requested': return <Clock size={14} color={C.amber} />
    case 'Critical': case 'Alert': return <AlertTriangle size={14} color={C.red} />
    case 'On Hold': case 'Rejected': return <XCircle size={14} color={C.red} />
    default: return <Clock size={14} color={C.textLight} />
  }
}

const statusColor = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Reported': case 'Arrived': case 'Available': return C.green
    case 'Processing': case 'Scanning': case 'In Progress': case 'Preparing': return C.sky
    case 'Pending': case 'Scheduled': case 'Ordered': case 'Requested': return C.amber
    case 'Critical': case 'Alert': case 'Rejected': case 'Down': return C.red
    case 'On Hold': return C.red
    default: return C.text
  }
}

interface ImagingRequest {
  id: string; patient: string; examination: string; modality: string; priority: string; clinicalQuestion: string; status: string; requestedBy: string; ward: string; time: string; contraindications: string[]
}

interface ScheduleItem {
  id: string; patient: string; exam: string; modality: string; room: string; time: string; duration: string; status: string; preparation: string
}

interface PrepTask {
  id: string; patient: string; exam: string; tasks: string[]; completed: boolean[]
}

interface TransportItem {
  id: string; patient: string; from: string; to: string; status: string; requested: string; accepted: string; collected: string; returned: string
}

interface AcquisitionItem {
  id: string; patient: string; exam: string; protocol: string; status: string; images: number; quality: string; started: string
}

interface QCItem {
  id: string; patient: string; exam: string; issues: string[]; status: string; reviewedBy: string
}

interface ReportItem {
  id: string; patient: string; exam: string; findings: string; impression: string; status: string; radiologist: string; critical: boolean
}

interface CriticalFinding {
  id: string; patient: string; exam: string; finding: string; verified: boolean; notifiedDoctor: boolean; notifiedWard: boolean; acknowledged: boolean; time: string
}

interface ArchiveItem {
  id: string; patient: string; exam: string; date: string; modality: string; report: string; hasPrior: boolean
}

interface Equipment {
  name: string; modality: string; status: string; utilization: number; maintenance: string; nextService: string
}

const IMAGING_REQUESTS: ImagingRequest[] = [
  { id: 'IR1', patient: 'James Mwangi', examination: 'Chest X-ray PA', modality: 'X-ray', priority: 'STAT', clinicalQuestion: 'Rule out pneumonia — fever 3d, cough, tachypnea', status: 'Requested', requestedBy: 'Dr. Methu', ward: 'Medical Ward III', time: '09:30', contraindications: [] },
  { id: 'IR2', patient: 'Mary Achieng', examination: 'CT Brain', modality: 'CT', priority: 'Emergency', clinicalQuestion: 'Post-traumatic loss of consciousness — fall from height', status: 'Processing', requestedBy: 'Dr. Kamau', ward: 'Emergency', time: '08:45', contraindications: [] },
  { id: 'IR3', patient: 'Kevin Mutua', examination: 'Abdominal Ultrasound', modality: 'Ultrasound', priority: 'Routine', clinicalQuestion: 'Evaluate for intussusception — vomiting, bloody stool', status: 'Scheduled', requestedBy: 'Dr. Methu', ward: 'Pediatric Ward', time: '10:00', contraindications: [] },
  { id: 'IR4', patient: 'Peter Otieno', examination: 'CT Abdomen with Contrast', modality: 'CT', priority: 'Urgent', clinicalQuestion: 'Suspected bowel obstruction — distension, pain', status: 'On Hold', requestedBy: 'Dr. Kamau', ward: 'Surgical Ward', time: '09:15', contraindications: ['eGFR 18 — contrast contraindicated'] },
  { id: 'IR5', patient: 'Grace Wanjiku', examination: 'MRI Lumbar Spine', modality: 'MRI', priority: 'Routine', clinicalQuestion: 'Chronic back pain with radiculopathy', status: 'Scheduled', requestedBy: 'Dr. Methu', ward: 'OPD', time: '11:00', contraindications: [] },
]

const SCHEDULE: ScheduleItem[] = [
  { id: 'S1', patient: 'James Mwangi', exam: 'Chest X-ray PA', modality: 'X-ray', room: 'X-ray Room 1', time: '09:00', duration: '10 min', status: 'Completed', preparation: 'None' },
  { id: 'S2', patient: 'Mary Achieng', exam: 'CT Brain', modality: 'CT', room: 'CT Room 2', time: '09:15', duration: '20 min', status: 'Scanning', preparation: 'Remove metal objects' },
  { id: 'S3', patient: 'Kevin Mutua', exam: 'Abdominal US', modality: 'Ultrasound', room: 'US Room 3', time: '10:00', duration: '30 min', status: 'Scheduled', preparation: 'Fasting 4h, full bladder' },
  { id: 'S4', patient: 'Grace Wanjiku', exam: 'MRI Lumbar Spine', modality: 'MRI', room: 'MRI Room 1', time: '11:00', duration: '45 min', status: 'Scheduled', preparation: 'Remove metal, implant check' },
  { id: 'S5', patient: 'Peter Otieno', exam: 'CT Abdomen', modality: 'CT', room: 'CT Room 2', time: '—', duration: '30 min', status: 'On Hold', preparation: 'Contrast issue — nephrology review' },
]

const PREP_TASKS: PrepTask[] = [
  { id: 'P1', patient: 'Kevin Mutua', exam: 'Abdominal Ultrasound', tasks: ['Fasting for 4 hours', 'Full bladder — drink 500mL water 1h before', 'Empty bladder after US if needed'], completed: [false, false, false] },
  { id: 'P2', patient: 'Grace Wanjiku', exam: 'MRI Lumbar Spine', tasks: ['Remove all metal objects', 'Complete MRI safety questionnaire', 'Check for implants/pregnancy', 'Change into hospital gown'], completed: [false, false, false, false] },
  { id: 'P3', patient: 'Mary Achieng', exam: 'CT Brain', tasks: ['Remove metal objects', 'IV cannula in situ', 'Check GCS'], completed: [true, true, true] },
]

const TRANSPORT: TransportItem[] = [
  { id: 'T1', patient: 'Mary Achieng', from: 'Emergency Department', to: 'CT Room 2', status: 'Arrived', requested: '08:50', accepted: '08:52', collected: '09:00', returned: '—' },
  { id: 'T2', patient: 'James Mwangi', from: 'Medical Ward III', to: 'X-ray Room 1', status: 'Returned', requested: '08:55', accepted: '08:57', collected: '09:00', returned: '09:15' },
  { id: 'T3', patient: 'Kevin Mutua', from: 'Pediatric Ward', to: 'US Room 3', status: 'Requested', requested: '09:45', accepted: '—', collected: '—', returned: '—' },
]

const ACQUISITION: AcquisitionItem[] = [
  { id: 'A1', patient: 'James Mwangi', exam: 'Chest X-ray PA', protocol: 'Standard PA chest', status: 'Completed', images: 2, quality: 'Good', started: '09:05' },
  { id: 'A2', patient: 'Mary Achieng', exam: 'CT Brain', protocol: 'Non-contrast CT head', status: 'Scanning', images: 0, quality: '—', started: '09:20' },
]

const QC_ITEMS: QCItem[] = [
  { id: 'Q1', patient: 'Mary Achieng', exam: 'CT Brain', issues: ['Motion artifact — repeat slice 12-18'], status: 'Pending', reviewedBy: '—' },
  { id: 'Q2', patient: 'James Mwangi', exam: 'Chest X-ray PA', issues: [], status: 'Passed', reviewedBy: 'Radiographer John' },
]

const REPORTS: ReportItem[] = [
  { id: 'R1', patient: 'James Mwangi', exam: 'Chest X-ray PA', findings: 'Normal heart size. Clear lung fields bilaterally. No consolidation, effusion, or pneumothorax.', impression: 'Normal chest X-ray. No evidence of pneumonia.', status: 'Verified', radiologist: 'Dr. Kamau', critical: false },
  { id: 'R2', patient: 'Mary Achieng', exam: 'CT Brain', findings: 'Pending completion of acquisition and reconstruction.', impression: '—', status: 'In Progress', radiologist: 'Dr. Kamau', critical: false },
  { id: 'R3', patient: 'Peter Otieno', exam: 'CT Abdomen (prior)', findings: 'Prior study (2026-06-15): Mild diverticulosis, no acute findings.', impression: 'No acute intra-abdominal pathology.', status: 'Verified', radiologist: 'Dr. Kamau', critical: false },
]

const CRITICAL_FINDINGS: CriticalFinding[] = [
  { id: 'CF1', patient: 'Mary Achieng', exam: 'CT Brain', finding: 'Large acute intracranial hemorrhage — left subdural hematoma with 8mm midline shift', verified: true, notifiedDoctor: true, notifiedWard: true, acknowledged: true, time: '09:25' },
]

const ARCHIVE: ArchiveItem[] = [
  { id: 'AR1', patient: 'James Mwangi', exam: 'Chest X-ray PA', date: '2026-07-09', modality: 'X-ray', report: 'Normal chest X-ray.', hasPrior: false },
  { id: 'AR2', patient: 'James Mwangi', exam: 'Chest X-ray PA', date: '2026-01-15', modality: 'X-ray', report: 'Clear lungs. Mild cardiomegaly.', hasPrior: true },
  { id: 'AR3', patient: 'Peter Otieno', exam: 'CT Abdomen + Contrast', date: '2026-06-15', modality: 'CT', report: 'Mild diverticulosis, no acute findings.', hasPrior: false },
  { id: 'AR4', patient: 'Mary Achieng', exam: 'CT Brain', date: '2026-07-09', modality: 'CT', report: 'Pending report.', hasPrior: false },
]

const EQUIPMENT: Equipment[] = [
  { name: 'X-ray Room 1', modality: 'X-ray', status: 'Available', utilization: 65, maintenance: 'None', nextService: '2026-08-01' },
  { name: 'CT Room 2', modality: 'CT', status: 'In Use', utilization: 82, maintenance: 'None', nextService: '2026-07-15' },
  { name: 'US Room 3', modality: 'Ultrasound', status: 'Available', utilization: 45, maintenance: 'None', nextService: '2026-07-20' },
  { name: 'MRI Room 1', modality: 'MRI', status: 'Available', utilization: 70, maintenance: 'Scheduled — quench test', nextService: '2026-07-12' },
  { name: 'Mammography', modality: 'Mammography', status: 'Down', utilization: 0, maintenance: 'Repair — detector fault', nextService: '2026-07-11' },
  { name: 'Fluoroscopy', modality: 'Fluoroscopy', status: 'Available', utilization: 30, maintenance: 'None', nextService: '2026-08-15' },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Doctor Dashboard', href: '/doctor' },
  { label: 'Doctor Clinical', href: '/doctor/workspace' },
  { label: 'Nurse Workspace', href: '/nurse' },
  { label: 'Laboratory', href: '/laboratory' },
  { label: 'Pharmacy', href: '/pharmacy' },
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

export default function RadiologyWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Radiology & Diagnostic Imaging Intelligence Workspace</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
          <Bell size={14} color={C.textLight} /> <span style={S.badge(C.red)}>2</span>
          <User size={14} color={C.textLight} />
          <span style={{ fontWeight: 600, color: C.navy }}>Radiologist On Duty</span>
        </div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Radiology</div>
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
          {/* ─── DASHBOARD ─── */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Radiology Dashboard</div>
              <div style={S.grid4}>
                {[
                  { label: 'Pending Requests', val: IMAGING_REQUESTS.filter(r => r.status === 'Requested' || r.status === 'Scheduled').length, col: C.amber, icon: <FileText size={20} /> },
                  { label: 'Currently Scanning', val: ACQUISITION.filter(a => a.status === 'Scanning').length, col: C.sky, icon: <Scan size={20} /> },
                  { label: 'Awaiting Reporting', val: ACQUISITION.filter(a => a.status === 'Completed').length + REPORTS.filter(r => r.status === 'In Progress').length, col: C.sky, icon: <FileText size={20} /> },
                  { label: 'Critical Findings', val: CRITICAL_FINDINGS.filter(c => !c.acknowledged).length, col: C.red, icon: <AlertTriangle size={20} /> },
                  { label: 'QC Pending', val: QC_ITEMS.filter(q => q.status === 'Pending').length, col: C.amber, icon: <Eye size={20} /> },
                  { label: 'Transport Active', val: TRANSPORT.filter(t => t.status !== 'Returned').length, col: C.sky, icon: <Truck size={20} /> },
                  { label: 'Equipment Down', val: EQUIPMENT.filter(e => e.status === 'Down').length, col: C.red, icon: <Monitor size={20} /> },
                  { label: 'Reports Today', val: REPORTS.filter(r => r.status === 'Verified').length, col: C.green, icon: <CheckCircle size={20} /> },
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
                <div style={S.secTitle}>Today's Schedule</div>
                {SCHEDULE.filter(s => s.status !== 'Completed').slice(0, 4).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${C.panel}` }}>
                    <div style={{ textAlign: 'center', minWidth: 50 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{s.time}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{s.exam}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{s.patient} · {s.room}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(s.status)) }}>
                      {statusIcon(s.status)} {s.status}
                    </span>
                    <span style={{ fontSize: 11, color: C.textLight }}>{s.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── IMAGING REQUESTS ─── */}
          {tab === 'requests' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Incoming Imaging Requests</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {IMAGING_REQUESTS.map(r => (
                  <div key={r.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{r.examination}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{r.patient} · {r.ward}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={S.pill(r.modality === 'CT' ? C.purple : r.modality === 'MRI' ? C.sky : r.modality === 'Ultrasound' ? C.green : C.text)}>{r.modality}</span>
                        <span style={S.badge(r.priority === 'STAT' || r.priority === 'Emergency' ? C.red : r.priority === 'Urgent' ? C.amber : C.sky)}>{r.priority}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(r.status)) }}>
                          {statusIcon(r.status)} {r.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: C.text, marginBottom: 8 }}>
                      <strong>Clinical Question:</strong> {r.clinicalQuestion}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.textLight }}>
                      <span>Requested by: <strong>{r.requestedBy}</strong></span>
                      <span>Time: <strong>{r.time}</strong></span>
                    </div>
                    {r.contraindications.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                        {r.contraindications.map((c, i) => (
                          <span key={i} style={S.pill(C.red)}><AlertTriangle size={10} /> {c}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <button style={S.btn(C.sky)}>Accept</button>
                      <button style={S.btnO}>Discuss</button>
                      <button style={{ ...S.btnO, color: C.red, borderColor: C.red }}>Hold</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── APPROPRIATENESS ─── */}
          {tab === 'appropriateness' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Imaging Appropriateness Engine</div>
              <div style={S.grid2}>
                {[
                  { patient: 'Peter Otieno', exam: 'CT Abdomen with Contrast', check: 'eGFR 18 — contrast contraindicated', status: 'Alert', action: 'Consider non-contrast CT or alternative. Nephrology review required.' },
                  { patient: 'James Mwangi', exam: 'Chest X-ray PA', check: 'No contraindications identified', status: 'Appropriate', action: 'Proceed as requested.' },
                  { patient: 'Kevin Mutua', exam: 'Abdominal US', check: 'Appropriate first-line for suspected intussusception', status: 'Appropriate', action: 'Proceed. Avoid CT in child if possible.' },
                  { patient: 'Mary Achieng', exam: 'CT Brain', check: 'Appropriate for acute head trauma with LOC', status: 'Appropriate', action: 'Proceed as emergency.' },
                  { patient: 'Grace Wanjiku', exam: 'MRI Lumbar Spine', check: 'Appropriate for chronic radiculopathy after failed conservative therapy', status: 'Appropriate', action: 'Proceed. Consider non-contrast.' },
                  { patient: 'James Mwangi', exam: 'CT Chest (not requested)', check: 'Duplicate consideration — CXR already adequate', status: 'Not Indicated', action: 'CXR already performed. Only CT if CXR abnormal.' },
                ].map(a => (
                  <div key={a.patient + a.exam} style={{ padding: 16, background: C.white, border: `1px solid ${a.status === 'Alert' ? C.red + '40' : C.border}`, borderRadius: 10, borderLeft: `3px solid ${a.status === 'Alert' ? C.red : a.status === 'Appropriate' ? C.green : C.amber}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{a.exam}</span>
                      <span style={S.badge(a.status === 'Alert' ? C.red : a.status === 'Appropriate' ? C.green : C.amber)}>{a.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.text }}>{a.patient}</div>
                    <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>{a.check}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4, fontStyle: 'italic' }}>{a.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SCHEDULING ─── */}
          {tab === 'scheduling' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Scheduling Workspace</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Priority · Equipment · Duration · Sedation · Isolation</div>
                </div>
                <button style={S.btn(C.sky)}>Schedule New</button>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TIME</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>EXAM</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>MODALITY</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ROOM</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DURATION</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PREPARATION</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCHEDULE.map(s => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{s.time}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{s.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{s.exam}</td>
                        <td style={{ padding: '10px 14px' }}><span style={S.pill(C.sky)}>{s.modality}</span></td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{s.room}</td>
                        <td style={{ padding: '10px 14px', color: C.textLight }}>{s.duration}</td>
                        <td style={{ padding: '10px 14px', fontSize: 11, color: C.text }}>{s.preparation}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(s.status)) }}>
                            {statusIcon(s.status)} {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── PATIENT PREPARATION ─── */}
          {tab === 'preparation' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Patient Preparation Tasks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PREP_TASKS.map(pt => (
                  <div key={pt.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 4 }}>{pt.patient}</div>
                    <div style={{ fontSize: 12, color: C.textLight, marginBottom: 12 }}>{pt.exam}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {pt.tasks.map((task, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text, cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked={pt.completed[i]} style={{ accentColor: C.sky }} />
                          {task}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TRANSPORT ─── */}
          {tab === 'transport' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Patient Transport Workflow</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>FROM</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TO</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>REQUESTED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>COLLECTED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>RETURNED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRANSPORT.map(t => (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{t.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{t.from}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{t.to}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{t.requested}</td>
                        <td style={{ padding: '10px 14px', color: t.collected ? C.green : C.textLight, fontWeight: 600 }}>{t.collected || '—'}</td>
                        <td style={{ padding: '10px 14px', color: t.returned ? C.green : C.textLight, fontWeight: 600 }}>{t.returned || '—'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(t.status)) }}>
                            {statusIcon(t.status)} {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── ACQUISITION ─── */}
          {tab === 'acquisition' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Imaging Acquisition</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ACQUISITION.map(a => (
                  <div key={a.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{a.exam}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{a.patient}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(a.status)) }}>
                        {statusIcon(a.status)} {a.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 11 }}>
                      <div><span style={{ color: C.textLight }}>Protocol:</span> {a.protocol}</div>
                      <div><span style={{ color: C.textLight }}>Images:</span> {a.images}</div>
                      <div><span style={{ color: C.textLight }}>Quality:</span> {a.quality}</div>
                      <div><span style={{ color: C.textLight }}>Started:</span> {a.started}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── QUALITY CONTROL ─── */}
          {tab === 'quality' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Image Quality Control</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QC_ITEMS.map(q => (
                  <div key={q.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{q.exam}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{q.patient}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(q.status)) }}>
                        {statusIcon(q.status)} {q.status}
                      </span>
                    </div>
                    {q.issues.length > 0 ? (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {q.issues.map((iss, i) => (
                          <span key={i} style={S.pill(C.amber)}>{iss}</span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: C.green }}>No issues — quality passed ✓</div>
                    )}
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Reviewed by: {q.reviewedBy || 'Pending'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── REPORTING ─── */}
          {tab === 'reporting' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Radiologist Reporting Workspace</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Patient Summary · Clinical Question · Previous · Current · Comparison · Measurements · Structured Report · Impression · Critical</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {REPORTS.map(r => (
                  <div key={r.id} style={{ background: C.white, border: `1px solid ${r.critical ? C.red + '40' : C.border}`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${r.critical ? C.red : r.status === 'Verified' ? C.green : C.amber}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{r.exam} — {r.patient}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {r.critical && <span style={S.pill(C.red)}>Critical</span>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(r.status)) }}>
                          {statusIcon(r.status)} {r.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11, marginBottom: 8 }}>
                      <div>
                        <div style={{ color: C.textLight, fontWeight: 600, marginBottom: 4 }}>FINDINGS</div>
                        <div style={{ color: C.text }}>{r.findings}</div>
                      </div>
                      <div>
                        <div style={{ color: C.textLight, fontWeight: 600, marginBottom: 4 }}>IMPRESSION</div>
                        <div style={{ color: C.text }}>{r.impression}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>Radiologist: {r.radiologist}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      {r.status === 'In Progress' && <button style={S.btn(C.sky)}>Complete Report</button>}
                      {r.status === 'Verified' && <button style={S.btnO}>View Images</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CRITICAL FINDINGS ─── */}
          {tab === 'critical' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Critical Findings Engine</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CRITICAL_FINDINGS.map(cf => (
                  <div key={cf.id} style={{ background: C.white, border: `1px solid ${C.red}40`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${C.red}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{cf.exam} — {cf.patient}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.red, marginTop: 4 }}>{cf.finding}</div>
                      </div>
                      <span style={S.badge(cf.acknowledged ? C.green : C.red)}>{cf.acknowledged ? 'Acknowledged' : 'Pending'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.text }}>Time: {cf.time}</div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                      <div><span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: cf.verified ? C.green : C.red, marginRight: 4 }} /> Verified</div>
                      <div><span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: cf.notifiedDoctor ? C.green : C.red, marginRight: 4 }} /> Doctor Notified</div>
                      <div><span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: cf.notifiedWard ? C.green : C.red, marginRight: 4 }} /> Ward Notified</div>
                    </div>
                  </div>
                ))}
                {CRITICAL_FINDINGS.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 48, fontSize: 13, color: C.textLight }}>No critical findings at this time</div>
                )}
              </div>
            </div>
          )}

          {/* ─── IMAGE ARCHIVE ─── */}
          {tab === 'archive' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Imaging Archive</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Previous studies · Comparison · Date · Modality · Anatomy</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...S.input, width: 200 }} placeholder="Search archive..." />
                  <select style={S.sel}>
                    <option>All Modalities</option>
                    <option>X-ray</option>
                    <option>CT</option>
                    <option>MRI</option>
                    <option>Ultrasound</option>
                    <option>Mammography</option>
                  </select>
                </div>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>EXAM</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DATE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>MODALITY</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>REPORT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PRIOR</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ARCHIVE.map(ar => (
                      <tr key={ar.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{ar.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{ar.exam}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{ar.date}</td>
                        <td style={{ padding: '10px 14px' }}><span style={S.pill(C.sky)}>{ar.modality}</span></td>
                        <td style={{ padding: '10px 14px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.textLight, fontSize: 11 }}>{ar.report}</td>
                        <td style={{ padding: '10px 14px' }}>{ar.hasPrior ? <span style={S.pill(C.sky)}>Prior available</span> : <span style={{ color: C.textLight }}>—</span>}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <button style={S.btnO}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── EQUIPMENT ─── */}
          {tab === 'equipment' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Equipment Intelligence</div>
              <div style={S.grid3}>
                {EQUIPMENT.map(eq => (
                  <div key={eq.name} style={{ padding: 16, background: C.white, border: `1px solid ${eq.status === 'Down' ? C.red + '40' : C.border}`, borderRadius: 10, borderLeft: `3px solid ${eq.status === 'Down' ? C.red : eq.status === 'In Use' ? C.amber : C.green}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{eq.name}</span>
                      <span style={S.badge(statusColor(eq.status))}>{eq.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{eq.modality}</div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: C.text }}>Utilization: <strong>{eq.utilization}%</strong></div>
                      <div style={{ width: '100%', height: 4, background: C.border, borderRadius: 2, marginTop: 4 }}>
                        <div style={{ width: `${eq.utilization}%`, height: 4, borderRadius: 2, background: eq.utilization > 80 ? C.red : eq.utilization > 50 ? C.amber : C.green }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>Maintenance: {eq.maintenance || 'None'}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>Next service: {eq.nextService}</div>
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
