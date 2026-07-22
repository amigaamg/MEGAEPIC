'use client'
import { useState } from 'react'
import { Pill, Activity, AlertTriangle, CheckCircle, XCircle, Clock, User, ChevronRight, Plus, Search, ArrowRight, Menu, Bell, BookOpen, Eye, FileText, FlaskConical, Syringe, Shield, TrendingUp, type LucideIcon } from 'lucide-react'
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
  { id: 'verification', label: 'Verification', icon: Shield },
  { id: 'compounding', label: 'Compounding', icon: Syringe },
  { id: 'dispensing', label: 'Dispensing', icon: Pill },
  { id: 'ward-cabinet', label: 'Ward Cabinet', icon: BookOpen },
  { id: 'administration', label: 'Administration', icon: CheckCircle },
  { id: 'timeline', label: 'Med Timeline', icon: Clock },
  { id: 'controlled', label: 'Controlled Drugs', icon: Shield },
  { id: 'monitoring', label: 'Drug Monitoring', icon: TrendingUp },
  { id: 'stewardship', label: 'AMS', icon: AlertTriangle },
  { id: 'reconciliation', label: 'Med Reconciliation', icon: FileText },
  { id: 'inventory', label: 'Inventory', icon: Activity },
  { id: 'drug-info', label: 'Drug Info Centre', icon: BookOpen },
]

const statusIcon = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Given': case 'Dispensed': return <CheckCircle size={14} color={C.green} />
    case 'Processing': case 'Active': case 'Running': return <Clock size={14} color={C.sky} />
    case 'Pending': case 'Ordered': case 'Upcoming': return <Clock size={14} color={C.amber} />
    case 'Critical': case 'Alert': case 'Hold': return <AlertTriangle size={14} color={C.red} />
    case 'Refused': case 'Vomited': case 'Not Given': return <XCircle size={14} color={C.red} />
    default: return <Clock size={14} color={C.textLight} />
  }
}

const statusColor = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Given': case 'Dispensed': case 'Available': return C.green
    case 'Processing': case 'Active': case 'Running': case 'In Stock': return C.sky
    case 'Pending': case 'Ordered': case 'Upcoming': case 'Low': return C.amber
    case 'Critical': case 'Alert': case 'Hold': case 'Expired': case 'Contraindicated': return C.red
    case 'Refused': case 'Vomited': case 'Not Given': case 'Partial': return C.red
    default: return C.text
  }
}

interface Prescription {
  id: string; patient: string; drug: string; dose: string; route: string; frequency: string; indication: string; status: string; prescriber: string; time: string; weight: string; allergies: string; interactionWarnings: string[]
}

interface CompoundingItem {
  id: string; drug: string; patient: string; preparedBy: string; checkedBy: string; batch: string; expiry: string; status: string
}

interface DispensingItem {
  id: string; drug: string; patient: string; ward: string; status: string; picked: string; packed: string; checked: string; dispensed: string; delivered: string
}

interface WardDrug {
  name: string; strength: string; stock: number; minLevel: number; status: string; expiry: string
}

interface AdminRecord {
  id: string; drug: string; patient: string; time: string; status: string; dose: string; reason: string; nurse: string
}

interface ControlledDrug {
  id: string; drug: string; patient: string; dose: string; witness: string; status: string; time: string
}

interface DrugMonitoring {
  drug: string; patient: string; parameter: string; value: string; range: string; status: string; nextDue: string
}

interface AMSRecord {
  id: string; patient: string; antibiotic: string; indication: string; culture: string; sensitivity: string; reviewDate: string; status: string
}

interface MedReconciliation {
  id: string; patient: string; homeMeds: string[]; admissionMeds: string[]; currentMeds: string[]; dischargeMeds: string[]; differences: string[]
}

interface InventoryItem {
  drug: string; strength: string; stock: number; monthlyUsage: number; leadTime: number; reorderPoint: number; status: string; expiry: string
}

const PRESCRIPTIONS: Prescription[] = [
  { id: 'Rx1', patient: 'James Mwangi', drug: 'IV Artesunate', dose: '2.4 mg/kg', route: 'IV', frequency: '0,12,24h', indication: 'Severe Malaria', status: 'Verified', prescriber: 'Dr. Methu', time: '09:45', weight: '12 kg', allergies: 'None', interactionWarnings: [] },
  { id: 'Rx2', patient: 'Kevin Mutua', drug: 'Ceftriaxone', dose: '50 mg/kg', route: 'IV', frequency: 'BD', indication: 'Sepsis', status: 'Pending', prescriber: 'Dr. Kamau', time: '10:30', weight: '15 kg', allergies: 'Penicillin', interactionWarnings: ['Ceftriaxone + Calcium — precipitation risk'] },
  { id: 'Rx3', patient: 'Amina Hassan', drug: 'Metformin', dose: '500 mg', route: 'Oral', frequency: 'BD', indication: 'Type 2 DM', status: 'Hold', prescriber: 'Dr. Methu', time: '09:00', weight: '70 kg', allergies: 'None', interactionWarnings: ['Metformin contraindicated — eGFR 18'] },
  { id: 'Rx4', patient: 'James Mwangi', drug: 'Paracetamol', dose: '15 mg/kg', route: 'IV', frequency: 'PRN q6h', indication: 'Fever', status: 'Verified', prescriber: 'Dr. Methu', time: '09:45', weight: '12 kg', allergies: 'None', interactionWarnings: [] },
  { id: 'Rx5', patient: 'Peter Otieno', drug: 'Warfarin', dose: '5 mg', route: 'Oral', frequency: 'OD', indication: 'DVT', status: 'Pending', prescriber: 'Dr. Kamau', time: '11:00', weight: '68 kg', allergies: 'None', interactionWarnings: ['Drug interaction with Metronidazole'] },
]

const COMPOUNDING: CompoundingItem[] = [
  { id: 'C1', drug: 'IV Artesunate 30mg', patient: 'James Mwangi', preparedBy: 'Pharm Tech Jane', checkedBy: 'Pharmacist John', batch: 'ART-2026-001', expiry: '2026-07-10', status: 'Completed' },
  { id: 'C2', drug: 'TPN Pediatric', patient: 'Kevin Mutua', preparedBy: 'Pharm Tech Mary', checkedBy: '—', batch: 'TPN-2026-002', expiry: '2026-07-09', status: 'In Progress' },
  { id: 'C3', drug: 'Ceftriaxone 750mg IV', patient: 'Kevin Mutua', preparedBy: 'Pharm Tech Jane', checkedBy: 'Pharmacist John', batch: 'CTX-2026-003', expiry: '2026-07-09', status: 'Completed' },
]

const DISPENSING: DispensingItem[] = [
  { id: 'D1', drug: 'IV Artesunate 30mg', patient: 'James Mwangi', ward: 'Medical Ward III', status: 'Dispensed', picked: '09:50', packed: '09:52', checked: '09:55', dispensed: '10:00', delivered: '10:10' },
  { id: 'D2', drug: 'Paracetamol IV 180mg', patient: 'James Mwangi', ward: 'Medical Ward III', status: 'Delivered', picked: '09:50', packed: '09:52', checked: '09:55', dispensed: '10:00', delivered: '10:10' },
  { id: 'D3', drug: 'Ceftriaxone 750mg', patient: 'Kevin Mutua', ward: 'Pediatric Ward', status: 'Picked', picked: '10:45', packed: '—', checked: '—', dispensed: '—', delivered: '—' },
  { id: 'D4', drug: 'Metformin 500mg', patient: 'Amina Hassan', ward: 'Medical Ward III', status: 'Hold', picked: '—', packed: '—', checked: '—', dispensed: '—', delivered: '—' },
]

const WARD_DRUGS: WardDrug[] = [
  { name: 'IV Artesunate 30mg', strength: '30 mg/vial', stock: 4, minLevel: 5, status: 'Low', expiry: '2026-08' },
  { name: 'Ceftriaxone 1g', strength: '1 g/vial', stock: 12, minLevel: 10, status: 'In Stock', expiry: '2026-09' },
  { name: 'Paracetamol IV', strength: '10 mg/mL', stock: 8, minLevel: 5, status: 'In Stock', expiry: '2026-07' },
  { name: 'Normal Saline 500mL', strength: '0.9%', stock: 2, minLevel: 10, status: 'Low', expiry: '2026-12' },
  { name: 'Morphine 10mg', strength: '10 mg/mL', stock: 3, minLevel: 2, status: 'In Stock', expiry: '2026-08' },
  { name: 'Insulin Regular', strength: '100 IU/mL', stock: 1, minLevel: 3, status: 'Low', expiry: '2026-06' },
  { name: 'Diazepam 5mg', strength: '5 mg/mL', stock: 6, minLevel: 5, status: 'In Stock', expiry: '2026-10' },
  { name: 'Adrenaline 1mg', strength: '1 mg/mL', stock: 4, minLevel: 5, status: 'Low', expiry: '2026-11' },
]

const ADMIN_RECORDS: AdminRecord[] = [
  { id: 'A1', drug: 'IV Artesunate', patient: 'James Mwangi', time: '10:00', status: 'Given', dose: '2.4 mg/kg', reason: '—', nurse: 'Nurse Mary' },
  { id: 'A2', drug: 'Paracetamol', patient: 'James Mwangi', time: '10:05', status: 'Given', dose: '15 mg/kg', reason: '—', nurse: 'Nurse Mary' },
  { id: 'A3', drug: 'Ceftriaxone', patient: 'Kevin Mutua', time: '12:00', status: 'Not Given', dose: '50 mg/kg', reason: 'Awaiting pharmacy verification', nurse: 'Nurse Jane' },
  { id: 'A4', drug: 'IV Normal Saline', patient: 'James Mwangi', time: '09:00', status: 'Given', dose: '10 mL/kg', reason: '—', nurse: 'Nurse Mary' },
]

const CONTROLLED_DRUGS: ControlledDrug[] = [
  { id: 'CD1', drug: 'Morphine 10mg', patient: 'Peter Otieno', dose: '5 mg IV', witness: 'Nurse Jane', status: 'Administered', time: '08:30' },
  { id: 'CD2', drug: 'Diazepam 5mg', patient: 'James Mwangi', dose: '2.5 mg IV', witness: 'Nurse Mary', status: 'Administered', time: '09:15' },
  { id: 'CD3', drug: 'Pethidine 50mg', patient: 'Grace Wanjiku', dose: '25 mg IM', witness: '—', status: 'Prescribed', time: '11:00' },
]

const DRUG_MONITORING: DrugMonitoring[] = [
  { drug: 'Gentamicin', patient: 'Kevin Mutua', parameter: 'Creatinine', value: '0.8 mg/dL', range: '0.5–1.2', status: 'Normal', nextDue: 'Tomorrow AM' },
  { drug: 'Gentamicin', patient: 'Kevin Mutua', parameter: 'Trough Level', value: 'Pending', range: '<2 mg/L', status: 'Pending', nextDue: 'Today 14:00' },
  { drug: 'Insulin', patient: 'Amina Hassan', parameter: 'Blood Glucose', value: '8.2 mmol/L', range: '4–10', status: 'Normal', nextDue: '12:00' },
  { drug: 'Warfarin', patient: 'Peter Otieno', parameter: 'INR', value: '2.1', range: '2–3', status: 'Normal', nextDue: 'Tomorrow' },
  { drug: 'Heparin', patient: 'Mary Achieng', parameter: 'APTT', value: '68s', range: '60–85', status: 'Normal', nextDue: '16:00' },
]

const AMS_RECORDS: AMSRecord[] = [
  { id: 'AMS1', patient: 'James Mwangi', antibiotic: 'IV Artesunate', indication: 'Severe Malaria — RDT+', culture: 'Blood film + (P. falciparum)', sensitivity: '—', reviewDate: '2026-07-11', status: 'Active' },
  { id: 'AMS2', patient: 'Kevin Mutua', antibiotic: 'IV Ceftriaxone', indication: 'Neonatal Sepsis — empirical', culture: 'Blood culture pending', sensitivity: 'Pending', reviewDate: '2026-07-10', status: 'Awaiting Culture' },
  { id: 'AMS3', patient: 'Peter Otieno', antibiotic: 'IV Metronidazole', indication: 'Intra-abdominal infection', culture: 'Wound swab grew E. coli', sensitivity: 'Sensitive', reviewDate: '2026-07-12', status: 'Active' },
  { id: 'AMS4', patient: 'Grace Wanjiku', antibiotic: 'Oral Amoxicillin', indication: 'UTI', culture: 'Midstream urine — E. coli', sensitivity: 'Sensitive', reviewDate: '2026-07-09', status: 'Due for Review' },
]

const RECONCILIATION: MedReconciliation[] = [
  { id: 'MR1', patient: 'James Mwangi', homeMeds: ['None'], admissionMeds: ['IV Artesunate', 'Paracetamol', 'IV Normal Saline'], currentMeds: ['IV Artesunate', 'Paracetamol', 'Blood Transfusion'], dischargeMeds: ['Oral Artemether-Lumefantrine', 'Iron Supplement'], differences: ['New: Artemether-Lumefantrine', 'New: Iron Supplement', 'Stopped: IV Artesunate → oral'] },
  { id: 'MR2', patient: 'Amina Hassan', homeMeds: ['Metformin 500mg BD', 'Lisinopril 10mg OD'], admissionMeds: ['Metformin (hold)', 'Lisinopril', 'Insulin sliding scale'], currentMeds: ['Lisinopril', 'Insulin'], dischargeMeds: ['Lisinopril', 'Metformin (if eGFR improves)'], differences: ['Hold: Metformin (eGFR 18)', 'New: Insulin'] },
]

const INVENTORY: InventoryItem[] = [
  { drug: 'IV Artesunate 30mg', strength: '30 mg/vial', stock: 24, monthlyUsage: 60, leadTime: 14, reorderPoint: 30, status: 'Reorder Soon', expiry: '2026-08' },
  { drug: 'Ceftriaxone 1g', strength: '1 g/vial', stock: 120, monthlyUsage: 200, leadTime: 10, reorderPoint: 100, status: 'In Stock', expiry: '2026-09' },
  { drug: 'Paracetamol IV', strength: '10 mg/mL', stock: 50, monthlyUsage: 80, leadTime: 7, reorderPoint: 40, status: 'In Stock', expiry: '2026-07' },
  { drug: 'Normal Saline 500mL', strength: '0.9%', stock: 40, monthlyUsage: 300, leadTime: 5, reorderPoint: 150, status: 'Low Stock', expiry: '2026-12' },
  { drug: 'Morphine 10mg', strength: '10 mg/mL', stock: 15, monthlyUsage: 10, leadTime: 14, reorderPoint: 8, status: 'In Stock', expiry: '2026-08' },
  { drug: 'Insulin Regular', strength: '100 IU/mL', stock: 5, monthlyUsage: 20, leadTime: 10, reorderPoint: 15, status: 'Reorder Soon', expiry: '2026-06' },
  { drug: 'Artemether-Lumefantrine', strength: '20/120 mg', stock: 200, monthlyUsage: 150, leadTime: 14, reorderPoint: 80, status: 'In Stock', expiry: '2026-10' },
  { drug: 'IV Fluids (various)', strength: '500–1000mL', stock: 200, monthlyUsage: 600, leadTime: 7, reorderPoint: 300, status: 'Reorder Soon', expiry: '2027-01' },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Doctor Dashboard', href: '/doctor' },
  { label: 'Doctor Clinical', href: '/doctor/workspace' },
  { label: 'Nurse Workspace', href: '/nurse' },
  { label: 'Laboratory', href: '/laboratory' },
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

export default function PharmacyWorkspace() {
  const [tab, setTab] = useState('dashboard')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(PRESCRIPTIONS)

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Pharmacy & Medication Intelligence Workspace</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
          <Bell size={14} color={C.textLight} /> <span style={S.badge(C.red)}>4</span>
          <User size={14} color={C.textLight} />
          <span style={{ fontWeight: 600, color: C.navy }}>Pharmacist On Duty</span>
        </div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Pharmacy</div>
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
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Pharmacy Dashboard</div>
              <div style={S.grid4}>
                {[
                  { label: 'Awaiting Verification', val: prescriptions.filter(p => p.status === 'Pending').length, col: C.amber, icon: <Shield size={20} /> },
                  { label: 'Verified', val: prescriptions.filter(p => p.status === 'Verified').length, col: C.green, icon: <CheckCircle size={20} /> },
                  { label: 'On Hold', val: prescriptions.filter(p => p.status === 'Hold').length, col: C.red, icon: <XCircle size={20} /> },
                  { label: 'Compounding Queue', val: COMPOUNDING.filter(c => c.status === 'In Progress').length, col: C.sky, icon: <Syringe size={20} /> },
                  { label: 'To Dispense', val: DISPENSING.filter(d => d.status === 'Picked' || d.status === 'Packed').length, col: C.sky, icon: <Pill size={20} /> },
                  { label: 'Low Stock Items', val: WARD_DRUGS.filter(w => w.status === 'Low').length, col: C.red, icon: <AlertTriangle size={20} /> },
                  { label: 'Expiry Alerts', val: INVENTORY.filter(i => i.status === 'Reorder Soon').length, col: C.amber, icon: <Clock size={20} /> },
                  { label: 'AMS Reviews Due', val: AMS_RECORDS.filter(a => a.status === 'Due for Review').length, col: C.purple, icon: <AlertTriangle size={20} /> },
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
                <div style={S.secTitle}>Recent Prescriptions</div>
                {prescriptions.slice(0, 3).map(rx => (
                  <div key={rx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.panel}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{rx.drug} — {rx.patient}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{rx.dose} · {rx.route} · {rx.frequency}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(rx.status)) }}>
                      {statusIcon(rx.status)} {rx.status}
                    </span>
                    <span style={{ fontSize: 11, color: C.textLight }}>{rx.prescriber}</span>
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Intelligent Verification</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Safety checks: dose, interaction, allergy, duplicate, contraindication</div>
                </div>
                <button style={S.btn(C.sky)}>Refresh</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {prescriptions.map(rx => {
                  const hasWarnings = rx.interactionWarnings.length > 0 || rx.status === 'Hold'
                  return (
                    <div key={rx.id} style={{ background: C.white, border: `1px solid ${hasWarnings ? C.red + '40' : C.border}`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${rx.status === 'Hold' ? C.red : rx.status === 'Verified' ? C.green : C.amber}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{rx.drug}</div>
                          <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{rx.patient} · {rx.dose} · {rx.route} · {rx.frequency}</div>
                          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Prescriber: {rx.prescriber} · {rx.time}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={S.badge(statusColor(rx.status))}>{rx.status}</span>
                          {rx.status === 'Pending' && <button style={S.btn(C.green)}>Verify</button>}
                          {rx.status === 'Hold' && <button style={S.btn(C.sky)}>Review</button>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11 }}>
                        <span style={{ color: C.text }}>Weight: <strong>{rx.weight}</strong></span>
                        <span style={{ color: C.text }}>Allergies: <strong>{rx.allergies}</strong></span>
                        <span style={{ color: C.text }}>Indication: <strong>{rx.indication}</strong></span>
                      </div>
                      {rx.interactionWarnings.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {rx.interactionWarnings.map((w, i) => (
                            <span key={i} style={S.pill(C.red)}><AlertTriangle size={10} /> {w}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── COMPOUNDING ─── */}
          {tab === 'compounding' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Compounding Workspace</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Prepared by / Checked by / Batch / Expiry</div>
                </div>
                <button style={S.btn(C.sky)}>Start Compounding</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {COMPOUNDING.map(c => (
                  <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{c.drug}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>Patient: {c.patient}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(c.status)) }}>
                        {statusIcon(c.status)} {c.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 11 }}>
                      <div><span style={{ color: C.textLight }}>Prepared by:</span> <strong>{c.preparedBy}</strong></div>
                      <div><span style={{ color: C.textLight }}>Checked by:</span> <strong>{c.checkedBy}</strong></div>
                      <div><span style={{ color: C.textLight }}>Batch:</span> <strong>{c.batch}</strong></div>
                      <div><span style={{ color: C.textLight }}>Expiry:</span> <strong>{c.expiry}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── DISPENSING ─── */}
          {tab === 'dispensing' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Dispensing Tracking</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DRUG</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>WARD</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PICKED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PACKED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>CHECKED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DISPENSED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DELIVERED</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DISPENSING.map(d => (
                      <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{d.drug}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{d.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{d.ward}</td>
                        <td style={{ padding: '10px 14px', color: d.picked !== '—' ? C.green : C.textLight, fontWeight: 600 }}>{d.picked}</td>
                        <td style={{ padding: '10px 14px', color: d.packed !== '—' ? C.green : C.textLight, fontWeight: 600 }}>{d.packed}</td>
                        <td style={{ padding: '10px 14px', color: d.checked !== '—' ? C.green : C.textLight, fontWeight: 600 }}>{d.checked}</td>
                        <td style={{ padding: '10px 14px', color: d.dispensed !== '—' ? C.green : C.textLight, fontWeight: 600 }}>{d.dispensed}</td>
                        <td style={{ padding: '10px 14px', color: d.delivered !== '—' ? C.green : C.textLight, fontWeight: 600 }}>{d.delivered}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(d.status)) }}>
                            {statusIcon(d.status)} {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── WARD CABINET ─── */}
          {tab === 'ward-cabinet' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Ward Medication Cabinet</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Available · Low · Expired · Reserved · Emergency Stock</div>
                </div>
              </div>
              <div style={S.grid4}>
                {WARD_DRUGS.map(w => (
                  <div key={w.name} style={{ padding: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, borderLeft: `3px solid ${w.status === 'Low' ? C.red : C.green}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{w.strength}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{w.stock}</span>
                      <span style={S.badge(w.status === 'Low' ? C.red : C.green)}>{w.status}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Min: {w.minLevel} · Exp: {w.expiry}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ADMINISTRATION ─── */}
          {tab === 'administration' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Medication Administration Documentation</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DRUG</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>PATIENT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>TIME</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DOSE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>REASON/NOTES</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>NURSE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADMIN_RECORDS.map(a => (
                      <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{a.drug}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{a.patient}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{a.time}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{a.dose}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(a.status)) }}>
                            {statusIcon(a.status)} {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: C.textLight }}>{a.reason}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{a.nurse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── MEDICATION TIMELINE ─── */}
          {tab === 'timeline' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Medication Timeline — James Mwangi</div>
              <div style={{ position: 'relative', paddingLeft: 24 }}>
                {[
                  { time: '09:05', event: 'IV Artesunate Prescribed', by: 'Dr. Methu' },
                  { time: '09:08', event: 'Pharmacist Verified', by: 'Pharmacist John' },
                  { time: '09:15', event: 'Dispensed from Pharmacy', by: 'Pharm Tech Jane' },
                  { time: '09:30', event: 'Received on Ward', by: 'Nurse Mary' },
                  { time: '10:00', event: 'Administered to Patient', by: 'Nurse Mary' },
                  { time: '12:00', event: 'Temperature Reduced (39.2→37.8°C)', by: 'Monitor' },
                  { time: '14:00', event: 'Next Dose Due', by: 'Schedule' },
                ].map((ev, i) => (
                  <div key={i} style={{ position: 'relative', paddingBottom: 20, paddingLeft: 20, borderLeft: `2px solid ${i < 6 ? C.sky : C.amber}` }}>
                    <div style={{ position: 'absolute', left: -7, top: 0, width: 12, height: 12, borderRadius: '50%', background: i < 6 ? C.sky : C.amber }} />
                    <div style={{ fontSize: 11, color: C.textLight }}>{ev.time}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{ev.event}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>by {ev.by}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CONTROLLED DRUGS ─── */}
          {tab === 'controlled' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Controlled Drugs</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Two signatures · Inventory · Witness · Audit</div>
                </div>
                <button style={S.btn(C.sky)}>New Controlled Drug Entry</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONTROLLED_DRUGS.map(cd => (
                  <div key={cd.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{cd.drug}</div>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{cd.patient} · {cd.dose}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...S.badge(statusColor(cd.status)) }}>
                        {statusIcon(cd.status)} {cd.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11 }}>
                      <span style={{ color: C.text }}>Witness: <strong>{cd.witness || '—'}</strong></span>
                      <span style={{ color: C.text }}>Time: <strong>{cd.time}</strong></span>
                    </div>
                    {cd.status === 'Prescribed' && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                        <button style={S.btn(C.amber)}>Requires Witness</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── DRUG MONITORING ─── */}
          {tab === 'monitoring' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Medication Monitoring</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Gentamicin→Creatinine · Insulin→Glucose · Heparin→APTT · Warfarin→INR</div>
                </div>
              </div>
              <div style={S.grid2}>
                {DRUG_MONITORING.map(m => (
                  <div key={m.drug + m.parameter} style={{ padding: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{m.drug}</span>
                        <span style={{ fontSize: 11, color: C.textLight, marginLeft: 6 }}>→ {m.parameter}</span>
                      </div>
                      <span style={S.badge(statusColor(m.status))}>{m.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>Patient: {m.patient}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{m.value}</span>
                      <span style={{ fontSize: 11, color: C.textLight }}>(range: {m.range})</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Next due: {m.nextDue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ANTIMICROBIAL STEWARDSHIP ─── */}
          {tab === 'stewardship' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Antimicrobial Stewardship</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Indication · Culture · Sensitivity · Review Date · Escalation/De-escalation</div>
                </div>
                <button style={S.btn(C.sky)}>Review All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AMS_RECORDS.map(ams => (
                  <div key={ams.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{ams.antibiotic} — {ams.patient}</div>
                        <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>Indication: {ams.indication}</div>
                      </div>
                      <span style={S.badge(statusColor(ams.status))}>{ams.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, marginTop: 4 }}>
                      <div><span style={{ color: C.textLight }}>Culture:</span> {ams.culture}</div>
                      <div><span style={{ color: C.textLight }}>Sensitivity:</span> {ams.sensitivity}</div>
                      <div><span style={{ color: C.textLight }}>Review Date:</span> {ams.reviewDate}</div>
                    </div>
                    {ams.status === 'Due for Review' && (
                      <div style={{ marginTop: 8 }}><button style={S.btn(C.amber)}>Review Now</button></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── MEDICATION RECONCILIATION ─── */}
          {tab === 'reconciliation' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Medication Reconciliation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {RECONCILIATION.map(mr => (
                  <div key={mr.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 12 }}>{mr.patient}</div>
                    <div style={S.grid2}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, letterSpacing: '0.04em' }}>HOME MEDICATIONS</div>
                        <div style={{ marginTop: 4, fontSize: 12 }}>{mr.homeMeds.map(m => <div key={m}>• {m}</div>)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, letterSpacing: '0.04em' }}>ADMISSION</div>
                        <div style={{ marginTop: 4, fontSize: 12 }}>{mr.admissionMeds.map(m => <div key={m}>• {m}</div>)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, letterSpacing: '0.04em' }}>CURRENT</div>
                        <div style={{ marginTop: 4, fontSize: 12 }}>{mr.currentMeds.map(m => <div key={m}>• {m}</div>)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, letterSpacing: '0.04em' }}>DISCHARGE PLAN</div>
                        <div style={{ marginTop: 4, fontSize: 12 }}>{mr.dischargeMeds.map(m => <div key={m}>• {m}</div>)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, padding: 8, background: `${C.amber}10`, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.amber, letterSpacing: '0.04em' }}>CHANGES</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>{mr.differences.map(d => <div key={d}>→ {d}</div>)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── INVENTORY ─── */}
          {tab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Inventory Intelligence</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Usage prediction · Seasonality · Consumption · Lead time · Expiry</div>
                </div>
                <button style={S.btn(C.sky)}>Generate Reorder</button>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>DRUG</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STRENGTH</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STOCK</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>MONTHLY USE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>LEAD TIME</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>REORDER AT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>STATUS</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textLight, fontSize: 10, letterSpacing: '0.04em' }}>EXPIRY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVENTORY.map(inv => (
                      <tr key={inv.drug} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: C.navy }}>{inv.drug}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{inv.strength}</td>
                        <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: inv.stock < inv.reorderPoint ? C.red : C.navy }}>{inv.stock}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{inv.monthlyUsage}</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{inv.leadTime}d</td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{inv.reorderPoint}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={S.badge(statusColor(inv.status))}>{inv.status}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: C.text }}>{inv.expiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── DRUG INFO CENTRE ─── */}
          {tab === 'drug-info' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Drug Information Centre</div>
              <div style={S.grid2}>
                {[
                  {
                    name: 'IV Artesunate', class: 'Antimalarial', mechanism: 'Artemisinin derivative. Acts rapidly against asexual forms of P. falciparum.',
                    indications: 'Severe malaria (first-line), complicated malaria', contraindications: 'Hypersensitivity',
                    sideEffects: 'Bradycardia, QT prolongation, hemolysis (rare)', monitoring: 'Hb, glucose, ECG, parasite count',
                    interactions: 'None significant', pregnancy: 'Safe (Category N)', renalDose: 'No adjustment needed', hepaticDose: 'Caution in severe impairment'
                  },
                  {
                    name: 'Ceftriaxone', class: 'Cephalosporin (3rd gen)', mechanism: 'Inhibits bacterial cell wall synthesis. Broad-spectrum Gram+ and Gram-.',
                    indications: 'Sepsis, meningitis, pneumonia, UTIs', contraindications: 'Penicillin allergy (caution), neonates with hyperbilirubinemia',
                    sideEffects: 'Diarrhea, rash, biliary sludge, pseudomembranous colitis', monitoring: 'CBC, renal function, culture & sensitivity',
                    interactions: 'Ceftriaxone + Calcium → precipitation risk in neonates', pregnancy: 'Category B', renalDose: 'Adjust if CrCl <10', hepaticDose: 'No adjustment'
                  },
                  {
                    name: 'Gentamicin', class: 'Aminoglycoside', mechanism: 'Irreversibly binds 30S ribosomal subunit. Bactericidal.',
                    indications: 'Gram-negative infections, synergy for endocarditis', contraindications: 'Myasthenia gravis, hypersensitivity',
                    sideEffects: 'Nephrotoxicity, ototoxicity, neuromuscular blockade', monitoring: 'Trough levels (<2), peak (6-10), creatinine, urine output',
                    interactions: 'NSAIDs, contrast media, other nephrotoxins', pregnancy: 'Category D — avoid', renalDose: 'Extended interval dosing preferred', hepaticDose: 'No adjustment'
                  },
                  {
                    name: 'Morphine', class: 'Opioid analgesic', mechanism: 'Mu-opioid receptor agonist. Acts on pain pathways in CNS.',
                    indications: 'Moderate to severe acute pain, palliative care', contraindications: 'Respiratory depression, paralytic ileus, head injury',
                    sideEffects: 'Respiratory depression, constipation, nausea, sedation, pruritus', monitoring: 'Respiratory rate, sedation score, pain score, bowel function',
                    interactions: 'Benzodiazepines, alcohol, other CNS depressants', pregnancy: 'Category C — use if benefit outweighs risk', renalDose: 'Reduce dose in renal impairment', hepaticDose: 'Reduce dose'
                  },
                  {
                    name: 'Warfarin', class: 'Vitamin K antagonist', mechanism: 'Inhibits vitamin K-dependent clotting factors (II, VII, IX, X).',
                    indications: 'DVT/PE, atrial fibrillation, mechanical heart valves', contraindications: 'Bleeding risk, pregnancy (1st/3rd trimester), severe hypertension',
                    sideEffects: 'Bleeding, skin necrosis, purple toes syndrome', monitoring: 'INR (target 2-3 for most indications)',
                    interactions: 'Metronidazole, Fluconazole, NSAIDs, many antibiotics', pregnancy: 'Category X — contraindicated', renalDose: 'No adjustment needed', hepaticDose: 'Reduce dose, monitor closely'
                  },
                  {
                    name: 'Insulin (Regular)', class: 'Hormone (pancreatic)', mechanism: 'Binds insulin receptors → glucose uptake → ↓ blood glucose.',
                    indications: 'Type 1 DM, Type 2 DM (uncontrolled), DKA, hyperkalemia', contraindications: 'Hypoglycemia',
                    sideEffects: 'Hypoglycemia, weight gain, lipodystrophy at injection site', monitoring: 'Blood glucose (pre-meal + bedtime), HbA1c',
                    interactions: 'Beta-blockers mask hypoglycemia symptoms, steroids ↑ insulin requirement', pregnancy: 'Category B — preferred for gestational diabetes', renalDose: '↓ doses as renal function declines', hepaticDose: 'Monitor glucose closely'
                  },
                ].map(drug => (
                  <div key={drug.name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{drug.name}</div>
                    <div style={{ fontSize: 11, color: C.sky, fontWeight: 500, marginBottom: 12 }}>{drug.class}</div>
                    <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                      <div style={{ marginBottom: 6 }}><strong>Mechanism:</strong> {drug.mechanism}</div>
                      <div style={{ marginBottom: 6 }}><strong>Indications:</strong> {drug.indications}</div>
                      <div style={{ marginBottom: 6 }}><strong>Contraindications:</strong> {drug.contraindications}</div>
                      <div style={{ marginBottom: 6 }}><strong>Side Effects:</strong> {drug.sideEffects}</div>
                      <div style={{ marginBottom: 6 }}><strong>Monitoring:</strong> {drug.monitoring}</div>
                      <div style={{ marginBottom: 6 }}><strong>Interactions:</strong> {drug.interactions}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        <div><strong>Pregnancy:</strong> {drug.pregnancy}</div>
                        <div><strong>Renal:</strong> {drug.renalDose}</div>
                        <div><strong>Hepatic:</strong> {drug.hepaticDose}</div>
                      </div>
                    </div>
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
