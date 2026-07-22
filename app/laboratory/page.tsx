'use client'
import { useState } from 'react'
import { Activity, Beaker, FlaskConical, Microscope, Droplets, Heart, AlertTriangle, CheckCircle, XCircle, Clock, User, ChevronRight, Plus, Search, ArrowRight, Menu, Bell, BookOpen, Eye, FileText, Thermometer, Weight, Clipboard, type LucideIcon } from 'lucide-react'
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
  { id: 'dashboard', label: 'Lab Dashboard', icon: Activity },
  { id: 'orders', label: 'Incoming Orders', icon: FlaskConical },
  { id: 'collection', label: 'Specimen Collection', icon: Droplets },
  { id: 'reception', label: 'Reception Desk', icon: Clipboard },
  { id: 'analyzer', label: 'Analyzer Queue', icon: Microscope },
  { id: 'qc', label: 'QC Hold', icon: AlertTriangle },
  { id: 'verification', label: 'Verification', icon: CheckCircle },
  { id: 'critical', label: 'Critical Values', icon: AlertTriangle },
  { id: 'results', label: 'Result View', icon: Eye },
  { id: 'reflex', label: 'Reflex Testing', icon: ArrowRight },
  { id: 'pathology', label: 'Pathology', icon: BookOpen },
  { id: 'blood-bank', label: 'Blood Bank', icon: Heart },
]

const statusIcon = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Reported': return <CheckCircle size={14} color={C.green} />
    case 'Processing': case 'In Analysis': case 'Running': return <Clock size={14} color={C.sky} />
    case 'Pending': case 'Ordered': case 'Collected': return <Clock size={14} color={C.amber} />
    case 'Critical': return <AlertTriangle size={14} color={C.red} />
    case 'On Hold': case 'QC Hold': return <XCircle size={14} color={C.amber} />
    default: return <Clock size={14} color={C.textLight} />
  }
}

const statusColor = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Reported': return C.green
    case 'Processing': case 'In Analysis': return C.sky
    case 'Pending': case 'Ordered': case 'Collected': return C.amber
    case 'Critical': case 'Panic': return C.red
    case 'On Hold': case 'QC Hold': case 'Failed': return C.red
    default: return C.text
  }
}

interface LabOrder {
  id: string; patient: string; test: string; priority: string; ordered: string; collected?: string; status: string; tube: string; department: string
}

interface Specimen {
  id: string; patient: string; type: string; tube: string; barcode: string; collected: string; by: string; location: string; status: string
}

interface AnalyzerItem {
  id: string; specimen: string; test: string; analyzer: string; status: string; started: string; eta: string; priority: string
}

interface QCResult {
  id: string; test: string; level: string; value: string; range: string; status: string; timestamp: string; technician: string
}

interface VerificationItem {
  id: string; patient: string; test: string; value: string; delta: string; flags: string[]; status: string; technician: string
}

interface CriticalValue {
  id: string; patient: string; test: string; value: string; notified_scientist: boolean; notified_doctor: boolean; notified_nurse: boolean; acknowledged: boolean; time: string
}

interface ReflexRule {
  id: string; trigger: string; condition: string; reflex_test: string; status: string
}

interface PathologyCase {
  id: string; patient: string; specimen: string; gross: string; blocks: number; slides: number; microscopy: string; status: string; consultant: string
}

interface BloodProduct {
  id: string; patient: string; group: string; crossmatch: string; product: string; status: string; reserved: string; issued: string; compatibility: string
}

const LAB_ORDERS: LabOrder[] = [
  { id: 'L1', patient: 'James Mwangi', test: 'CBC', priority: 'STAT', ordered: '09:10', collected: '09:15', status: 'Processing', tube: 'Lavender (EDTA)', department: 'Hematology' },
  { id: 'L2', patient: 'James Mwangi', test: 'Malaria RDT', priority: 'STAT', ordered: '09:10', collected: '09:15', status: 'Completed', tube: 'Gold (SST)', department: 'Microbiology' },
  { id: 'L3', patient: 'James Mwangi', test: 'Blood Culture', priority: 'STAT', ordered: '09:10', collected: '09:15', status: 'Processing', tube: 'Blood Culture Bottles', department: 'Microbiology' },
  { id: 'L4', patient: 'Kevin Mutua', test: 'Urea & Electrolytes', priority: 'Routine', ordered: '09:30', status: 'Ordered', tube: 'Green (Lithium Heparin)', department: 'Chemistry' },
  { id: 'L5', patient: 'Amina Hassan', test: 'Cardiac Troponin', priority: 'STAT', ordered: '09:45', collected: '09:50', status: 'Processing', tube: 'Gold (SST)', department: 'Chemistry' },
  { id: 'L6', patient: 'Peter Otieno', test: 'Blood Gas', priority: 'STAT', ordered: '08:30', collected: '08:35', status: 'Completed', tube: 'Heparin Syringe', department: 'Blood Gas' },
  { id: 'L7', patient: 'Grace Wanjiku', test: 'Urinalysis', priority: 'Routine', ordered: '10:00', status: 'Ordered', tube: 'Urine Container', department: 'Urinalysis' },
  { id: 'L8', patient: 'James Mwangi', test: 'Blood Film', priority: 'STAT', ordered: '09:10', collected: '09:15', status: 'Completed', tube: 'Blood Smear Slide', department: 'Hematology' },
]

const SPECIMENS: Specimen[] = [
  { id: 'S1', patient: 'James Mwangi', type: 'Blood', tube: 'Lavender (EDTA)', barcode: 'EDTA-2026-001', collected: '09:15', by: 'Nurse Mary', location: 'Ward 3', status: 'In Lab' },
  { id: 'S2', patient: 'James Mwangi', type: 'Blood', tube: 'Gold (SST)', barcode: 'SST-2026-002', collected: '09:15', by: 'Nurse Mary', location: 'Ward 3', status: 'In Analysis' },
  { id: 'S3', patient: 'Kevin Mutua', type: 'Blood', tube: 'Green (Lithium Heparin)', barcode: 'LIH-2026-003', collected: '09:45', by: 'Nurse Jane', location: 'Ward 5', status: 'Received' },
  { id: 'S4', patient: 'Amina Hassan', type: 'Blood', tube: 'Gold (SST)', barcode: 'SST-2026-004', collected: '09:50', by: 'Nurse Mary', location: 'Ward 3', status: 'In Analysis' },
  { id: 'S5', patient: 'Grace Wanjiku', type: 'Urine', tube: 'Urine Container', barcode: 'URN-2026-005', collected: '10:05', by: 'Patient', location: 'Outpatient', status: 'Received' },
]

const ANALYZER_QUEUE: AnalyzerItem[] = [
  { id: 'A1', specimen: 'EDTA-2026-001', test: 'CBC', analyzer: 'Sysmex XN-1000', status: 'Running', started: '09:20', eta: '09:35', priority: 'STAT' },
  { id: 'A2', specimen: 'SST-2026-002', test: 'Malaria RDT', analyzer: 'Core Malaria', status: 'Completed', started: '09:20', eta: '09:25', priority: 'STAT' },
  { id: 'A3', specimen: 'SST-2026-004', test: 'Troponin', analyzer: 'Cobas 8000', status: 'Queued', started: '—', eta: '10:15', priority: 'STAT' },
  { id: 'A4', specimen: 'LIH-2026-003', test: 'U&E', analyzer: 'Cobas 8000', status: 'Queued', started: '—', eta: '10:30', priority: 'Routine' },
  { id: 'A5', specimen: 'URN-2026-005', test: 'Urinalysis', analyzer: 'Dirui FUS-2000', status: 'Queued', started: '—', eta: '10:45', priority: 'Routine' },
]

const QC_RESULTS: QCResult[] = [
  { id: 'Q1', test: 'CBC', level: 'High', value: 'Hb 14.2', range: '13.5-15.5', status: 'Pass', timestamp: '07:00', technician: 'Lab Tech' },
  { id: 'Q2', test: 'CBC', level: 'Low', value: 'WBC 5.1', range: '4.5-5.5', status: 'Pass', timestamp: '07:00', technician: 'Lab Tech' },
  { id: 'Q3', test: 'U&E', level: 'High', value: 'Na 142', range: '138-145', status: 'Pass', timestamp: '07:30', technician: 'Lab Tech' },
  { id: 'Q4', test: 'Troponin', level: 'Control', value: '0.05', range: '0.03-0.07', status: 'Hold', timestamp: '08:00', technician: 'Lab Tech' },
  { id: 'Q5', test: 'Glucose', level: 'High', value: '6.2', range: '5.5-6.5', status: 'Pass', timestamp: '07:45', technician: 'Lab Tech' },
]

const VERIFICATION_ITEMS: VerificationItem[] = [
  { id: 'V1', patient: 'James Mwangi', test: 'CBC', value: 'Hb 8.2, WBC 14.2, Plt 98', delta: '-2.1 Hb vs prev', flags: ['Anemia', 'Leukocytosis'], status: 'Pending', technician: 'Lab Tech' },
  { id: 'V2', patient: 'James Mwangi', test: 'Malaria RDT', value: 'Positive (P. falciparum)', delta: 'N/A', flags: [], status: 'Verified', technician: 'Lab Tech' },
  { id: 'V3', patient: 'James Mwangi', test: 'Blood Film', value: '2+ asexual parasites', delta: 'New finding', flags: ['Parasitemia'], status: 'Verified', technician: 'Lab Tech' },
  { id: 'V4', patient: 'Peter Otieno', test: 'Blood Gas', value: 'pH 7.32, pCO2 48, HCO3 18', delta: '—', flags: ['Metabolic Acidosis'], status: 'Pending', technician: 'Lab Tech' },
  { id: 'V5', patient: 'Kevin Mutua', test: 'U&E', value: 'K+ 6.8, Na 132', delta: '+1.2 K+ vs prev', flags: ['Hyperkalemia', 'Critical'], status: 'Pending', technician: 'Lab Tech' },
]

const CRITICAL_VALUES: CriticalValue[] = [
  { id: 'CV1', patient: 'Kevin Mutua', test: 'Potassium', value: '6.8 mmol/L', notified_scientist: true, notified_doctor: true, notified_nurse: true, acknowledged: true, time: '09:15' },
  { id: 'CV2', patient: 'James Mwangi', test: 'Hemoglobin', value: '5.8 g/dL', notified_scientist: true, notified_doctor: true, notified_nurse: false, acknowledged: false, time: '09:30' },
  { id: 'CV3', patient: 'Peter Otieno', test: 'pH', value: '7.32', notified_scientist: true, notified_doctor: false, notified_nurse: false, acknowledged: false, time: '08:45' },
]

const REFLEX_RULES: ReflexRule[] = [
  { id: 'R1', trigger: 'Positive MRDT', condition: 'If positive', reflex_test: 'Blood Film for Parasites + Parasite Count', status: 'Active' },
  { id: 'R2', trigger: 'Hb <10', condition: 'If low', reflex_test: 'Iron Studies + Ferritin + B12 + Folate', status: 'Active' },
  { id: 'R3', trigger: 'K+ >5.5', condition: 'If high', reflex_test: 'Repeat K+ + ECG', status: 'Active' },
  { id: 'R4', trigger: 'WBC >12', condition: 'If high', reflex_test: 'Blood Culture + Differential', status: 'Active' },
  { id: 'R5', trigger: 'CRP >50', condition: 'If high', reflex_test: 'PCT + Blood Culture', status: 'Inactive' },
]

const PATHOLOGY_CASES: PathologyCase[] = [
  { id: 'P1', patient: 'James Mwangi', specimen: 'Bone Marrow Aspirate', gross: 'Bloody aspirate, 2 mL', blocks: 3, slides: 6, microscopy: 'Hypercellular marrow with erythroid hyperplasia. Ring forms seen in RBCs.', status: 'Pending Review', consultant: 'Dr. Kamau' },
  { id: 'P2', patient: 'Mary Achieng', specimen: 'Cervical Biopsy', gross: 'Tissue fragment 1.5x1x0.5 cm, firm, grey-white', blocks: 2, slides: 4, microscopy: 'Awaiting processing', status: 'Processing', consultant: '' },
]

const BLOOD_PRODUCTS: BloodProduct[] = [
  { id: 'B1', patient: 'Kevin Mutua', group: 'O+', crossmatch: 'Compatible', product: 'Packed RBC (1 unit)', status: 'Crossmatched', reserved: '09:00', issued: '', compatibility: 'Compatible' },
  { id: 'B2', patient: 'James Mwangi', group: 'A+', crossmatch: 'Pending', product: 'Packed RBC (1 unit)', status: 'Grouped', reserved: '09:30', issued: '', compatibility: 'Pending' },
  { id: 'B3', patient: '', group: 'O-', crossmatch: '', product: 'O Negative (Emergency)', status: 'Available', reserved: '', issued: '', compatibility: 'Universal' },
  { id: 'B4', patient: 'Grace Wanjiku', group: 'B+', crossmatch: 'Compatible', product: 'Fresh Frozen Plasma (2 units)', status: 'Issued', reserved: '08:30', issued: '08:45', compatibility: 'Compatible' },
  { id: 'B5', patient: 'Peter Otieno', group: 'AB+', crossmatch: 'Incompatible', product: 'Platelets (1 pool)', status: 'Crossmatched', reserved: '09:15', issued: '', compatibility: 'Minor mismatch — proceed with caution' },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Doctor Dashboard', href: '/doctor' },
  { label: 'Doctor Clinical', href: '/doctor/workspace' },
  { label: 'Nurse Workspace', href: '/nurse' },
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

export default function LabWorkspace() {
  const [tab, setTab] = useState('dashboard')
  const [orders, setOrders] = useState<LabOrder[]>(LAB_ORDERS)
  const [orderFilter, setOrderFilter] = useState('all')
  const [critical, setCritical] = useState<CriticalValue[]>(CRITICAL_VALUES)
  const [qcResults, setQcResults] = useState<QCResult[]>(QC_RESULTS)

  const filteredOrders = orders.filter(o => orderFilter === 'all' || o.status === orderFilter)

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Laboratory Intelligence Workspace</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bell size={14} color={C.textLight} /> <span style={S.badge(C.red)}>3</span></span>
          <User size={14} color={C.textLight} />
          <span style={{ fontWeight: 600, color: C.navy }}>Lab Tech On Duty</span>
        </div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Laboratory</div>
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
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Laboratory Dashboard</div>
              <div style={S.grid4}>
                {[
                  { label: 'Pending Collections', val: orders.filter(o => o.status === 'Ordered').length, col: C.amber, icon: <Clock size={20} /> },
                  { label: 'In Analysis', val: orders.filter(o => o.status === 'Processing').length, col: C.sky, icon: <Microscope size={20} /> },
                  { label: 'Awaiting Verification', val: VERIFICATION_ITEMS.filter(v => v.status === 'Pending').length, col: C.amber, icon: <FileText size={20} /> },
                  { label: 'Critical Values', val: critical.filter(c => !c.acknowledged).length, col: C.red, icon: <AlertTriangle size={20} /> },
                  { label: 'QC On Hold', val: qcResults.filter(q => q.status === 'Hold').length, col: C.red, icon: <XCircle size={20} /> },
                  { label: 'Results Today', val: orders.filter(o => o.status === 'Completed').length, col: C.green, icon: <CheckCircle size={20} /> },
                  { label: 'Equipment Online', val: '6/6', col: C.green, icon: <Activity size={20} /> },
                  { label: 'Reflex Triggers', val: REFLEX_RULES.filter(r => r.status === 'Active').length, col: C.purple, icon: <ArrowRight size={20} /> },
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
            </div>
          )}

          {/* ─── INCOMING ORDERS ─── */}
          {tab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Incoming Orders</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{orders.length} orders today</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select style={S.sel} value={orderFilter} onChange={e => setOrderFilter(e.target.value)}>
                    <option value="all">All Orders</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Collected">Collected</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TEST</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PRIORITY</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TUBE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DEPARTMENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ORDERED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o, i) => (
                      <tr key={o.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{o.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{o.test}</td>
                        <td style={{ padding: '10px 14px' }}><span style={S.badge(o.priority === 'STAT' ? C.red : C.sky)}>{o.priority}</span></td>
                        <td style={{ padding: '10px 14px', color: C.text, fontSize: 11 }}>{o.tube}</td>
                        <td style={{ padding: '10px 14px' }}><span style={S.pill(C.sky)}>{o.department}</span></td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(o.status)) }}>
                            {statusIcon(o.status)} {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: C.textLight }}>{o.ordered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── SPECIMEN COLLECTION ─── */}
          {tab === 'collection' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Specimen Collection</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Tube intelligence & barcode tracking</div>
                </div>
                <button style={S.btn(C.sky)}>Register Specimen</button>
              </div>
              <div style={S.card}>
                <div style={S.secTitle}>Tube Type Guide</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { tube: 'Lavender (EDTA)', tests: 'CBC, Blood Film', additive: 'EDTA', volume: '2-4 mL' },
                    { tube: 'Gold (SST)', tests: 'Chemistry, Serology', additive: 'Clot activator + gel', volume: '3-5 mL' },
                    { tube: 'Green (Li Heparin)', tests: 'U&E, LFT, Troponin', additive: 'Lithium Heparin', volume: '3-5 mL' },
                    { tube: 'Blue (Citrate)', tests: 'PT, APTT, D-dimer', additive: 'Sodium Citrate', volume: '1.8 mL' },
                    { tube: 'Grey (Fluoride)', tests: 'Glucose, Lactate', additive: 'Sodium Fluoride', volume: '2 mL' },
                    { tube: 'Urine Container', tests: 'Urinalysis, Culture', additive: 'None', volume: '10-20 mL' },
                    { tube: 'Blood Culture Bottles', tests: 'Aerobic/Anaerobic', additive: 'Culture media', volume: '8-10 mL' },
                    { tube: 'Heparin Syringe', tests: 'Blood Gas', additive: 'Heparin', volume: '0.5-1 mL' },
                  ].map(t => (
                    <div key={t.tube} style={{ padding: 12, background: C.panel, borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{t.tube}</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{t.tests}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Additive: {t.additive}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Vol: {t.volume}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 12 }}>
                <div style={S.secTitle}>Collected Specimens</div>
                <div style={{ background: C.white, borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>BARCODE</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TYPE</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TUBE</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>COLLECTED BY</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>LOCATION</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SPECIMENS.map(s => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: C.navy }}>{s.barcode}</td>
                          <td style={{ padding: '10px 14px', color: C.text }}>{s.patient}</td>
                          <td style={{ padding: '10px 14px' }}><span style={S.pill(C.sky)}>{s.type}</span></td>
                          <td style={{ padding: '10px 14px', fontSize: 11, color: C.text }}>{s.tube}</td>
                          <td style={{ padding: '10px 14px', color: C.text }}>{s.by}</td>
                          <td style={{ padding: '10px 14px', color: C.text }}>{s.location}</td>
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
            </div>
          )}

          {/* ─── RECEPTION DESK ─── */}
          {tab === 'reception' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Reception Desk — Verification Checklist</div>
              <div style={S.grid3}>
                {[
                  { label: 'Specimen Integrity', checked: true, desc: 'No hemolysis, lipemia, clots' },
                  { label: 'Label Verification', checked: true, desc: 'Barcode matches request form' },
                  { label: 'Volume Adequacy', checked: true, desc: 'Sufficient for all ordered tests' },
                  { label: 'Tube Correct', checked: true, desc: 'Correct tube type for tests' },
                  { label: 'Collection Time', checked: true, desc: 'Within acceptable timeframe' },
                  { label: 'Transport Condition', checked: true, desc: 'Proper temperature and handling' },
                  { label: 'Patient ID Match', checked: false, desc: 'Two identifiers verified' },
                  { label: 'Consent Confirmed', checked: false, desc: 'Special tests consent verified' },
                  { label: 'Chain of Custody', checked: false, desc: 'Forensic/legal specimens only' },
                ].map(item => (
                  <div key={item.label} style={{ padding: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div>{item.checked ? <CheckCircle size={20} color={C.green} /> : <XCircle size={20} color={C.amber} />}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ANALYZER QUEUE ─── */}
          {tab === 'analyzer' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Analyzer Queue</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Real-time analyzer status</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.green)}>Sysmex XN-1000: Online</span>
                  <span style={S.pill(C.green)}>Cobas 8000: Online</span>
                  <span style={S.pill(C.green)}>Dirui FUS-2000: Online</span>
                </div>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>SPECIMEN</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TEST</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ANALYZER</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PRIORITY</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STARTED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ANALYZER_QUEUE.map(a => (
                      <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: C.navy }}>{a.specimen}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 500, color: C.navy }}>{a.test}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{a.analyzer}</td>
                        <td style={{ padding: '10px 14px' }}><span style={S.badge(a.priority === 'STAT' ? C.red : C.sky)}>{a.priority}</span></td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(a.status)) }}>
                            {statusIcon(a.status)} {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{a.started}</td>
                        <td style={{ padding: '10px 14px', color: C.textLight }}>{a.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── QC HOLD ─── */}
          {tab === 'qc' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Quality Control — QC Hold</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>QC results requiring attention</div>
                </div>
                <button style={S.btn(C.sky)}>Run QC</button>
              </div>
              <div style={S.grid4}>
                {qcResults.map(q => (
                  <div key={q.id} style={{ padding: 16, background: C.white, border: `1px solid ${q.status === 'Hold' ? C.red : C.green}40`, borderRadius: 10, borderLeft: `3px solid ${q.status === 'Hold' ? C.red : C.green}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{q.test}</span>
                      <span style={S.badge(q.status === 'Hold' ? C.red : C.green)}>{q.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.text }}>Level: {q.level}</div>
                    <div style={{ fontSize: 11, color: C.text }}>Value: {q.value}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>Range: {q.range}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{q.timestamp} · {q.technician}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── VERIFICATION ─── */}
          {tab === 'verification' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Result Verification</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Review delta changes, criticals, implausible values</div>
                </div>
                <button style={S.btn(C.sky)}>Verify Selected</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {VERIFICATION_ITEMS.map(v => (
                  <div key={v.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{v.patient} — {v.test}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{v.value}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={S.badge(v.status === 'Verified' ? C.green : C.amber)}>{v.status}</span>
                        {v.status === 'Pending' && <button style={S.btn(C.green)}>Verify</button>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                      <span style={{ color: C.text }}>Delta: <strong style={{ color: v.delta.startsWith('-') ? C.red : C.text }}>{v.delta}</strong></span>
                      {v.flags.length > 0 && (
                        <span style={{ display: 'flex', gap: 4 }}>
                          {v.flags.map(f => <span key={f} style={S.pill(f.includes('Critical') ? C.red : C.amber)}>{f}</span>)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CRITICAL VALUES ─── */}
          {tab === 'critical' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Critical Value Engine</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {critical.map(cv => {
                  const allNotified = cv.notified_scientist && cv.notified_doctor && cv.notified_nurse
                  return (
                    <div key={cv.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${cv.acknowledged ? C.green : C.red}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{cv.patient} — {cv.test}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginTop: 2 }}>{cv.value}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span style={S.badge(cv.acknowledged ? C.green : C.red)}>{cv.acknowledged ? 'Acknowledged' : 'Unacknowledged'}</span>
                          {!cv.acknowledged && <button style={S.btn(C.sky)}>Acknowledge</button>}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: C.text }}>Time: {cv.time}</div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cv.notified_scientist ? C.green : C.red }} />
                          <span style={{ fontSize: 11, color: C.textLight }}>Scientist</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cv.notified_doctor ? C.green : C.red }} />
                          <span style={{ fontSize: 11, color: C.textLight }}>Doctor</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cv.notified_nurse ? C.green : C.red }} />
                          <span style={{ fontSize: 11, color: C.textLight }}>Nurse</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── RESULT VIEW ─── */}
          {tab === 'results' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Doctor Result View — Clinical Cards</div>
              <div style={S.grid2}>
                {[
                  { test: 'CBC', result: 'Hb 8.2, WBC 14.2, Plt 98', trend: '↓ Hb from 10.3', status: 'Abnormal', note: 'Moderate anemia with leukocytosis' },
                  { test: 'Malaria RDT', result: 'Positive (P. falciparum)', trend: 'New', status: 'Positive', note: 'Immediate treatment indicated' },
                  { test: 'Blood Glucose', result: '4.2 mmol/L', trend: 'Stable', status: 'Normal', note: 'Within target range' },
                  { test: 'Blood Film', result: '2+ asexual parasites', trend: 'New', status: 'Positive', note: 'Parasite density ~2%' },
                  { test: 'Urea & Electrolytes', result: 'Na 132, K+ 6.8, Urea 8.2', trend: '↑ K+ from 5.6', status: 'Critical', note: 'Hyperkalemia — urgent intervention' },
                  { test: 'Blood Gas', result: 'pH 7.32, pCO2 48, HCO3 18', trend: '↓ pH from 7.38', status: 'Abnormal', note: 'Metabolic acidosis with respiratory compensation' },
                ].map(r => (
                  <div key={r.test} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{r.test}</span>
                      <span style={S.badge(r.status === 'Critical' ? C.red : r.status === 'Abnormal' ? C.amber : r.status === 'Positive' ? C.amber : C.green)}>{r.status}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.navy, marginBottom: 4 }}>{r.result}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>Trend: {r.trend}</div>
                    <div style={{ fontSize: 11, color: C.text, marginTop: 4, fontStyle: 'italic' }}>{r.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── REFLEX TESTING ─── */}
          {tab === 'reflex' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Reflex Testing Engine</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Automated reflex rules configured</div>
                </div>
                <button style={S.btn(C.sky)}>Add Rule</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {REFLEX_RULES.map(r => (
                  <div key={r.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{r.trigger} → {r.reflex_test}</div>
                      <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{r.condition}</div>
                    </div>
                    <span style={S.pill(r.status === 'Active' ? C.green : C.textLight)}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PATHOLOGY ─── */}
          {tab === 'pathology' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Pathology Workspace</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Gross examination, blocks, slides, microscopy, reporting</div>
                </div>
                <button style={S.btn(C.sky)}>New Case</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PATHOLOGY_CASES.map(p => (
                  <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{p.patient} — {p.specimen}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <span style={S.pill(C.textLight)}>Blocks: {p.blocks}</span>
                          <span style={S.pill(C.textLight)}>Slides: {p.slides}</span>
                          <span style={S.badge(statusColor(p.status))}>{p.status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={S.btnO}>View Slides</button>
                        <button style={S.btn(C.sky)}>Report</button>
                      </div>
                    </div>
                    <div style={S.grid2}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, letterSpacing: '0.04em', marginBottom: 4 }}>GROSS DESCRIPTION</div>
                        <div style={{ fontSize: 12, color: C.text }}>{p.gross}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, letterSpacing: '0.04em', marginBottom: 4 }}>MICROSCOPY</div>
                        <div style={{ fontSize: 12, color: C.text }}>{p.microscopy}</div>
                      </div>
                    </div>
                    {p.consultant && <div style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>Consultant: {p.consultant}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── BLOOD BANK ─── */}
          {tab === 'blood-bank' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Blood Bank</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Group & screen, crossmatch, reservation, compatibility, transfusion tracking</div>
                </div>
                <button style={S.btn(C.sky)}>New Crossmatch</button>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>GROUP</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>CROSSMATCH</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PRODUCT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>COMPATIBILITY</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BLOOD_PRODUCTS.map(b => (
                      <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{b.patient || '—'}</td>
                        <td style={{ padding: '10px 14px' }}><span style={S.pill(C.sky)}>{b.group}</span></td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{b.crossmatch}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{b.product}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={S.badge(b.compatibility === 'Compatible' ? C.green : b.compatibility === 'Incompatible' ? C.red : C.amber)}>
                            {b.compatibility}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(b.status)) }}>
                            {statusIcon(b.status)} {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <button style={S.btn(C.sky)}>{b.status === 'Available' ? 'Reserve' : b.status === 'Crossmatched' ? 'Issue' : 'View'}</button>
                        </td>
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
