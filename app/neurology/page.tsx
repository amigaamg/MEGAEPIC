'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, Eye, Brain, HeartPulse, Globe, Home, BarChart3, type LucideIcon } from 'lucide-react'
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
    case 'Active': case 'Controlled': case 'On Track': case 'Available': case 'Good': case 'Normal': case 'Full': case 'Independent': case 'Eligible': case 'Complete': case 'Stable': case 'Excellent': case 'None': return C.green
    case 'Fair': case 'Pending': case 'Needs Attention': case 'Moderate': case 'Busy': case 'Low': case 'Mild': case 'Limited': return C.amber
    case 'Poor': case 'Behind': case 'Critical': case 'Uncontrolled': case 'High': case 'Severe': case 'Unavailable': case 'No': case 'N/A': return C.red
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Neurology Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Neurological Snapshot', icon: Brain },
  { id: 'timeline', label: 'Brain Timeline', icon: Clock },
  { id: 'phenotype', label: 'Neurological Phenotype', icon: Brain },
  { id: 'seizures', label: 'Seizure Intelligence', icon: Activity },
  { id: 'stroke', label: 'Stroke Intelligence', icon: Heart },
  { id: 'function', label: 'Functional Brain', icon: Monitor },
  { id: 'cognitive', label: 'Cognitive Intelligence', icon: Brain },
  { id: 'movement', label: 'Movement Disorders', icon: TrendingUp },
  { id: 'ms', label: 'Multiple Sclerosis', icon: Shield },
  { id: 'headache', label: 'Headache Intelligence', icon: AlertTriangle },
  { id: 'neuroimaging', label: 'Neuroimaging', icon: Eye },
  { id: 'eeg', label: 'EEG Intelligence', icon: Activity },
  { id: 'neurosurgery', label: 'Neurosurgery', icon: Bed },
  { id: 'rehab', label: 'Rehabilitation', icon: HeartPulse },
  { id: 'medications', label: 'Medication Intelligence', icon: Pill },
  { id: 'home', label: 'Home Monitoring', icon: Home },
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
  { label: 'Heart Failure', href: '/hf' },
  { label: 'Hypertension', href: '/hypertension' },
  { label: 'Respiratory', href: '/respiratory' },
  { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Oncology', href: '/oncology' },
  { label: 'CKD', href: '/ckd' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

const timelineEvents = [
  { date: '2011-03-15', title: 'First Seizure', details: 'Generalised tonic-clonic seizure, witnessed by family', color: C.red, icon: AlertTriangle },
  { date: '2011-04-02', title: 'MRI Brain', details: '1.5T MRI showed left mesial temporal sclerosis', color: C.sky, icon: Eye },
  { date: '2011-04-10', title: 'EEG', details: 'Left temporal epileptiform discharges identified', color: C.purple, icon: Activity },
  { date: '2011-05-01', title: 'Diagnosis', details: 'Focal epilepsy confirmed — started on carbamazepine', color: C.amber, icon: FileText },
  { date: '2011-05-15', title: 'Medication Initiated', details: 'Carbamazepine 200mg BID initiated with good response', color: C.green, icon: Pill },
  { date: '2015-08-20', title: 'Breakthrough Seizure', details: 'Single focal impaired awareness seizure after sleep deprivation', color: C.red, icon: AlertTriangle },
  { date: '2015-09-01', title: 'Dose Increased', details: 'Carbamazepine increased to 400mg BID, switched to Levetiracetam', color: C.amber, icon: TrendingUp },
  { date: '2016-02-10', title: 'Stable', details: 'No further seizures, driving restrictions reviewed', color: C.green, icon: CheckCircle },
  { date: '2019-06-01', title: 'Levetiracetam Optimised', details: 'Maintenance dose 1g BID established, excellent tolerability', color: C.green, icon: Pill },
  { date: '2024-12-01', title: 'Driving Restored', details: 'Seizure-free >18 months, driving eligibility confirmed', color: C.green, icon: CheckCircle },
]

const seizureEvents = [
  { date: '2015-08-20', trigger: 'Sleep deprivation', aura: 'Epigastric rising', duration: '90s', type: 'Focal impaired awareness', witness: 'Wife', recovery: '5 min', injuries: 'Tongue bite', hospitalization: 'No', medChanges: 'Dose increased' },
  { date: '2011-03-15', trigger: 'Unknown', aura: 'None', duration: '120s', type: 'Generalised tonic-clonic', witness: 'Family', recovery: '15 min', injuries: 'None', hospitalization: 'Yes (observation)', medChanges: 'Initiated carbamazepine' },
  { date: '2023-11-10', trigger: 'Alcohol cessation', aura: 'Deja vu', duration: '60s', type: 'Focal aware', witness: 'Self-reported', recovery: '2 min', injuries: 'None', hospitalization: 'No', medChanges: 'None' },
]

const teamMembers = [
  { role: 'Neurologist', name: 'Dr. Jane Mwangi', status: 'Available' },
  { role: 'Neurosurgeon', name: 'Dr. Peter Kamau', status: 'Available' },
  { role: 'Stroke Physician', name: 'Dr. Grace Ochieng', status: 'Available' },
  { role: 'Rehab Physician', name: 'Dr. Samuel Kiprop', status: 'Available' },
  { role: 'Physiotherapist', name: 'Nancy Wanjiku', status: 'Busy' },
  { role: 'Occupational Therapist', name: 'James Otieno', status: 'Available' },
  { role: 'Speech Therapist', name: 'Mary Achieng', status: 'Available' },
  { role: 'Psychologist', name: 'Dr. Ben Kiprop', status: 'Busy' },
  { role: 'Psychiatrist', name: 'Dr. Sarah Wangari', status: 'Available' },
  { role: 'Social Worker', name: 'Esther Muthoni', status: 'Available' },
  { role: 'Primary Care', name: 'Dr. David Mwangi', status: 'Available' },
]

export default function NeurologyWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Neurology, Epilepsy &amp; Stroke Intelligence Center &mdash; Volume XI-I</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>NE</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>NESIC</div>
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
            <>
              <div style={S.secTitle}>Neurology Dashboard</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={20} color={C.sky} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Samuel Ochieng</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <div style={{ fontSize: 12, color: C.text }}>42 Years / Male</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <span style={S.pill(C.sky)}>Focal Epilepsy</span>
                <div style={{ fontSize: 11, color: C.textLight }}>Duration: 15 Years</div>
                <span style={S.pill(C.green)}>Controlled</span>
                <div style={{ fontSize: 11, color: C.textLight }}>Last Seizure: 18 months ago</div>
                <span style={S.pill(C.green)}>Driving: Eligible</span>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Brain size={24} color={C.sky} />
                  <div style={S.statValue}>1,247</div>
                  <div style={S.statLabel}>Total Neuro Patients</div>
                </div>
                <div style={S.statCard}>
                  <Activity size={24} color={C.purple} />
                  <div style={S.statValue}>382</div>
                  <div style={S.statLabel}>Epilepsy</div>
                </div>
                <div style={S.statCard}>
                  <Heart size={24} color={C.red} />
                  <div style={S.statValue}>215</div>
                  <div style={S.statLabel}>Stroke</div>
                </div>
                <div style={S.statCard}>
                  <Brain size={24} color={C.amber} />
                  <div style={S.statValue}>148</div>
                  <div style={S.statLabel}>Parkinson</div>
                </div>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Brain size={24} color={C.text} />
                  <div style={S.statValue}>196</div>
                  <div style={S.statLabel}>Dementia</div>
                </div>
                <div style={S.statCard}>
                  <Shield size={24} color={C.purple} />
                  <div style={S.statValue}>62</div>
                  <div style={S.statLabel}>MS</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.red} />
                  <div style={S.statValue}>28</div>
                  <div style={S.statLabel}>MND</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.amber} />
                  <div style={S.statValue}>216</div>
                  <div style={S.statLabel}>Headache</div>
                </div>
              </div>
            </>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <>
              <div style={S.secTitle}>Neurological Snapshot &mdash; Samuel Ochieng</div>
              <div style={S.grid4}>
                {[
                  { label: 'Diagnosis', value: 'Focal epilepsy', color: C.sky },
                  { label: 'Seizure Freq', value: '0 (18mo)', color: C.green },
                  { label: 'Medication', value: 'Levetiracetam 1g BID', color: C.green },
                  { label: 'MRI', value: 'Stable', color: C.green },
                  { label: 'EEG', value: 'No active epil activity', color: C.green },
                  { label: 'Cognition', value: 'Normal', color: C.green },
                  { label: 'Employment', value: 'Active', color: C.green },
                  { label: 'Driving', value: 'Eligible', color: C.green },
                  { label: 'NIHSS', value: 'N/A', color: C.textLight },
                  { label: 'Modified Rankin', value: '0', color: C.green },
                  { label: 'MMSE', value: '29/30', color: C.green },
                  { label: 'MoCA', value: '27/30', color: C.green },
                ].map((s, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── TIMELINE ─── */}
          {tab === 'timeline' && (
            <>
              <div style={S.secTitle}>Brain Timeline &mdash; Samuel Ochieng</div>
              <div style={S.card}>
                {timelineEvents.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < timelineEvents.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${e.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <e.icon size={14} color={e.color} />
                      </div>
                      {i < timelineEvents.length - 1 && <div style={{ width: 1, flex: 1, background: C.border, margin: '4px 0' }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < timelineEvents.length - 1 ? 4 : 0 }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>{e.date}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{e.title}</div>
                      <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{e.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── PHENOTYPE ─── */}
          {tab === 'phenotype' && (
            <>
              <div style={S.secTitle}>Neurological Phenotype &mdash; Samuel Ochieng</div>
              <div style={S.grid3}>
                {[
                  { label: 'Generalised', value: 'No', detail: 'No evidence of generalised epilepsy syndromes', color: C.red },
                  { label: 'Focal', value: 'Yes', detail: 'Left temporal lobe epilepsy with mesial temporal sclerosis', color: C.green },
                  { label: 'Drug Resistant', value: 'No', detail: 'Well-controlled on levetiracetam monotherapy', color: C.green },
                  { label: 'Structural Cause', value: 'Temporal sclerosis', detail: 'Left mesial temporal sclerosis on MRI', color: C.amber },
                  { label: 'Genetic', value: 'Unknown', detail: 'No family history, genetic testing not performed', color: C.amber },
                ].map((p, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.label}</div>
                      <span style={S.badge(p.color)}>{p.value}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{p.detail}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── SEIZURES ─── */}
          {tab === 'seizures' && (
            <>
              <div style={S.secTitle}>Seizure Intelligence Center</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Activity size={24} color={C.green} />
                  <div style={S.statValue}>0</div>
                  <div style={S.statLabel}>Seizures (18mo)</div>
                </div>
                <div style={S.statCard}>
                  <Clock size={24} color={C.sky} />
                  <div style={S.statValue}>3</div>
                  <div style={S.statLabel}>Total Recorded Events</div>
                </div>
                <div style={S.statCard}>
                  <Brain size={24} color={C.purple} />
                  <div style={S.statValue}>Focal</div>
                  <div style={S.statLabel}>Predominant Type</div>
                </div>
                <div style={S.statCard}>
                  <Clock size={24} color={C.green} />
                  <div style={S.statValue}>18 mo</div>
                  <div style={S.statLabel}>Seizure-Free Duration</div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Trigger</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Aura</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Duration</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Witness</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Recovery</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Injuries</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Hospitalization</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Med Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seizureEvents.map((se, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{se.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{se.trigger}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{se.aura}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{se.duration}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{se.type}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{se.witness}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{se.recovery}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(se.injuries === 'None' ? C.green : C.red)}>{se.injuries}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(se.hospitalization === 'No' ? C.green : C.amber)}>{se.hospitalization}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{se.medChanges}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── STROKE ─── */}
          {tab === 'stroke' && (
            <>
              <div style={S.secTitle}>Stroke Intelligence Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Type', value: 'Ischaemic', color: C.red },
                  { label: 'TOAST', value: 'Cardioembolic', color: C.amber },
                  { label: 'NIHSS Onset', value: '12', color: C.red },
                  { label: 'NIHSS Discharge', value: '3', color: C.green },
                  { label: 'Imaging', value: 'CT/MRI', color: C.sky },
                  { label: 'Thrombolysis', value: 'Yes', color: C.green },
                  { label: 'Thrombectomy', value: 'No', color: C.amber },
                  { label: 'Complications', value: 'None', color: C.green },
                  { label: 'Recovery', value: 'Good', color: C.green },
                  { label: 'mRS', value: '1', color: C.green },
                  { label: 'Secondary Prev', value: 'Aspirin, Statin', color: C.green },
                ].map((s, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── FUNCTION ─── */}
          {tab === 'function' && (
            <>
              <div style={S.secTitle}>Functional Brain Intelligence</div>
              <div style={S.grid3}>
                {[
                  { domain: 'Speech', status: 'Normal' },
                  { domain: 'Memory', status: 'Normal' },
                  { domain: 'Motor Strength', status: '5/5 all' },
                  { domain: 'Balance', status: 'Normal' },
                  { domain: 'Vision', status: 'Normal' },
                  { domain: 'Sensation', status: 'Normal' },
                  { domain: 'Coordination', status: 'Normal' },
                  { domain: 'Executive Function', status: 'Normal' },
                  { domain: 'Swallowing', status: 'Normal' },
                ].map((f, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{f.domain}</div>
                      <span style={S.pill(C.green)}>{f.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── COGNITIVE ─── */}
          {tab === 'cognitive' && (
            <>
              <div style={S.secTitle}>Cognitive Intelligence</div>
              <div style={S.grid4}>
                {[
                  { label: 'MMSE', value: '29/30 (Normal)', color: C.green },
                  { label: 'MoCA', value: '27/30 (Normal)', color: C.green },
                  { label: 'Neuropsychology', value: 'Not indicated', color: C.green },
                  { label: 'Functional Independence', value: 'Independent', color: C.green },
                  { label: 'Behavioural', value: 'Normal', color: C.green },
                  { label: 'Caregiver Burden', value: 'N/A', color: C.textLight },
                  { label: 'Progression', value: 'Stable', color: C.green },
                ].map((c, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── MOVEMENT ─── */}
          {tab === 'movement' && (
            <>
              <div style={S.secTitle}>Movement Disorder Workspace</div>
              <div style={S.grid4}>
                {[
                  { label: 'Tremor', value: 'None', color: C.green },
                  { label: 'Rigidity', value: 'None', color: C.green },
                  { label: 'Bradykinesia', value: 'None', color: C.green },
                  { label: 'Falls', value: 'None', color: C.green },
                  { label: 'Freezing', value: 'None', color: C.green },
                  { label: 'Med Response', value: 'N/A', color: C.textLight },
                  { label: 'UPDRS', value: 'N/A', color: C.textLight },
                  { label: 'DBS', value: 'N/A', color: C.textLight },
                ].map((m, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── MS ─── */}
          {tab === 'ms' && (
            <>
              <div style={S.secTitle}>Multiple Sclerosis Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Relapses', value: 'None', color: C.green },
                  { label: 'MRI Lesions', value: 'None', color: C.green },
                  { label: 'DMT', value: 'None', color: C.textLight },
                  { label: 'EDSS', value: 'N/A', color: C.textLight },
                  { label: 'Visual', value: 'Normal', color: C.green },
                  { label: 'Mobility', value: 'Full', color: C.green },
                  { label: 'Cognition', value: 'Normal', color: C.green },
                  { label: 'Fatigue', value: 'No', color: C.green },
                ].map((ms, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{ms.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ms.color }}>{ms.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── HEADACHE ─── */}
          {tab === 'headache' && (
            <>
              <div style={S.secTitle}>Headache Intelligence</div>
              <div style={S.grid4}>
                {[
                  { label: 'Migraine Days', value: '2/mo', color: C.amber },
                  { label: 'Triggers', value: 'Stress, Sleep deprivation', color: C.amber },
                  { label: 'Aura', value: 'Visual', color: C.sky },
                  { label: 'Acute Meds', value: 'Sumatriptan PRN', color: C.green },
                  { label: 'Preventive', value: 'Propranolol 40mg', color: C.green },
                  { label: 'ER Visits', value: '1 in 6mo', color: C.amber },
                  { label: 'QoL Impact', value: 'Moderate', color: C.amber },
                ].map((h, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{h.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: h.color }}>{h.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── NEUROIMAGING ─── */}
          {tab === 'neuroimaging' && (
            <>
              <div style={S.secTitle}>Neuroimaging Intelligence</div>
              <div style={S.grid4}>
                {[
                  { label: 'MRI', value: '1.5T brain, Stable, No new lesions', color: C.green },
                  { label: 'CT', value: '2021, Normal', color: C.green },
                  { label: 'MRA', value: 'Normal', color: C.green },
                  { label: 'MRV', value: 'Not done', color: C.textLight },
                  { label: 'fMRI', value: 'Not done', color: C.textLight },
                  { label: 'PET', value: 'Not done', color: C.textLight },
                ].map((ni, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{ni.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ni.color }}>{ni.value}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Lesion Tracking</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Study</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Finding</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Comparison</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { study: 'MRI Brain', date: '2024-12-01', finding: 'Stable left mesial temporal sclerosis, no new lesions', comp: 'Unchanged from 2022' },
                      { study: 'MRI Brain', date: '2022-06-15', finding: 'Left mesial temporal sclerosis, no interval change', comp: 'Unchanged from 2019' },
                      { study: 'MRI Brain', date: '2019-03-10', finding: 'Left mesial temporal sclerosis identified', comp: 'New finding' },
                      { study: 'CT Head', date: '2021-05-20', finding: 'Normal brain parenchyma, no acute pathology', comp: 'N/A' },
                    ].map((lt, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{lt.study}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{lt.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{lt.finding}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(lt.comp === 'Unchanged from 2022' || lt.comp === 'Unchanged from 2019' ? C.green : C.sky)}>{lt.comp}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── EEG ─── */}
          {tab === 'eeg' && (
            <>
              <div style={S.secTitle}>EEG Intelligence</div>
              <div style={S.grid4}>
                {[
                  { label: 'Routine EEG', value: 'Normal (2023)', color: C.green },
                  { label: 'Sleep EEG', value: 'Normal (2022)', color: C.green },
                  { label: 'Video EEG', value: 'Not done', color: C.textLight },
                  { label: 'Epileptiform Activity', value: 'None', color: C.green },
                  { label: 'Localisation', value: 'Left temporal', color: C.amber },
                  { label: 'Serial Comparisons', value: 'Stable', color: C.green },
                ].map((e, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{e.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: e.color }}>{e.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── NEUROSURGERY ─── */}
          {tab === 'neurosurgery' && (
            <>
              <div style={S.secTitle}>Neurosurgery Integration</div>
              <div style={S.grid4}>
                {[
                  { label: 'Operations', value: 'None', color: C.green },
                  { label: 'Tumour Resection', value: 'N/A', color: C.textLight },
                  { label: 'Epilepsy Surgery', value: 'Not indicated', color: C.amber },
                  { label: 'Shunts', value: 'None', color: C.green },
                  { label: 'DBS', value: 'None', color: C.green },
                  { label: 'Complications', value: 'N/A', color: C.textLight },
                  { label: 'Follow-up', value: 'N/A', color: C.textLight },
                ].map((ns, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{ns.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ns.color }}>{ns.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── REHAB ─── */}
          {tab === 'rehab' && (
            <>
              <div style={S.secTitle}>Rehabilitation Intelligence</div>
              <div style={S.grid4}>
                {[
                  { label: 'PT', value: 'Not needed', color: C.green },
                  { label: 'OT', value: 'Not needed', color: C.green },
                  { label: 'Speech', value: 'Not needed', color: C.green },
                  { label: 'Neuropsych', value: 'Not needed', color: C.green },
                  { label: 'Mobility', value: 'Full', color: C.green },
                  { label: 'ADLs', value: 'Independent', color: C.green },
                  { label: 'Return to Work', value: 'Active, Full-time', color: C.green },
                  { label: 'Driving', value: 'Eligible', color: C.green },
                  { label: 'Assistive Devices', value: 'None', color: C.green },
                ].map((rh, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{rh.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: rh.color }}>{rh.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── MEDICATIONS ─── */}
          {tab === 'medications' && (
            <>
              <div style={S.secTitle}>Medication Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Levetiracetam</div>
                    <span style={S.pill(C.green)}>1g BID</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2019</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>1g BID</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Response</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>Excellent</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Side Effects</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>None</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Propranolol</div>
                    <span style={S.pill(C.amber)}>40mg</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2023</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>40mg</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Indication</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Migraine prophylaxis</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Response</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>Good</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <>
              <div style={S.secTitle}>Home Monitoring</div>
              <div style={S.grid4}>
                {[
                  { label: 'Seizures', value: '0 alerts (30d)', trend: 'Stable', color: C.green },
                  { label: 'Falls', value: '0 reports', trend: 'Stable', color: C.green },
                  { label: 'Headaches', value: '2/mo avg', trend: 'Improving', color: C.amber },
                  { label: 'Med Adherence', value: '95%', trend: 'Good', color: C.green },
                  { label: 'Sleep', value: '6.5h avg', trend: 'Adequate', color: C.amber },
                  { label: 'Mood', value: 'PHQ-9: 4', trend: 'Normal', color: C.green },
                  { label: 'Exercise', value: '3x/week', trend: 'On track', color: C.green },
                  { label: 'Wearable Data', value: '98% sync', trend: 'Active', color: C.green },
                ].map((hm, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight }}>{hm.label}</div>
                      <span style={{ fontSize: 10, color: hm.color }}>{hm.trend}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{hm.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── TEAM ─── */}
          {tab === 'team' && (
            <>
              <div style={S.secTitle}>Multidisciplinary Team</div>
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Role</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((tm, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{tm.role}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{tm.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(statusColor(tm.status))}>{tm.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === 'registry' && (
            <>
              <div style={S.secTitle}>Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'Epilepsy', count: 382, color: C.purple },
                  { label: 'Stroke', count: 215, color: C.red },
                  { label: 'Parkinson', count: 148, color: C.amber },
                  { label: 'Dementia', count: 196, color: C.text },
                  { label: 'MS', count: 62, color: C.purple },
                  { label: 'MND', count: 28, color: C.red },
                  { label: 'NM', count: 45, color: C.sky },
                ].map((rg, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={S.statValue}>{rg.count}</div>
                    <div style={S.statLabel}>{rg.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>MRN</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Diagnosis</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Duration</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Samuel Ochieng', mrn: 'MRN-2001', dx: 'Focal Epilepsy', dur: '15 yr', st: 'Controlled' },
                      { name: 'Grace Akinyi', mrn: 'MRN-2002', dx: 'Ischaemic Stroke', dur: '3 yr', st: 'Active' },
                      { name: 'John Kamau', mrn: 'MRN-2003', dx: 'Parkinson Disease', dur: '8 yr', st: 'Active' },
                      { name: 'Mary Achieng', mrn: 'MRN-2004', dx: 'Multiple Sclerosis', dur: '5 yr', st: 'Active' },
                      { name: 'Peter Ochieng', mrn: 'MRN-2005', dx: 'Migraine with Aura', dur: '12 yr', st: 'Active' },
                    ].map((rp, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{rp.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{rp.mrn}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.dx}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.dur}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(statusColor(rp.st))}>{rp.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── QUALITY ─── */}
          {tab === 'quality' && (
            <>
              <div style={S.secTitle}>Quality Indicators</div>
              <div style={S.grid4}>
                {[
                  { label: 'Seizure Freedom', value: '72%', color: C.green },
                  { label: 'Door-to-Needle', value: '45 min', color: C.amber },
                  { label: 'Thrombectomy', value: '18%', color: C.amber },
                  { label: 'Secondary Prevention', value: '82%', color: C.green },
                  { label: 'Rehab Initiation', value: '68%', color: C.amber },
                  { label: 'Functional Recovery (mod)', value: '72%', color: C.green },
                  { label: 'Falls', value: '12%', color: C.amber },
                  { label: 'Readmissions', value: '8%', color: C.amber },
                  { label: 'Mortality', value: '4.2%', color: C.red },
                  { label: 'QoL Reporting', value: '54%', color: C.amber },
                ].map((qi, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={S.statValue}>{qi.value}</div>
                    <div style={S.statLabel}>{qi.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── PORTAL ─── */}
          {tab === 'portal' && (
            <>
              <div style={S.secTitle}>Patient Portal &mdash; Samuel Ochieng</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Disease Timeline</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Focal epilepsy diagnosed 2011, seizure-free since 2015, driving restored 2024.</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication Reminders</div>
                  <div style={{ fontSize: 11, color: C.text }}>Levetiracetam 1g BID &mdash; 08:00 / 20:00 daily</div>
                  <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Propranolol 40mg &mdash; 08:00 daily</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Seizure / Symptom Diary</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>No seizures reported in the last 18 months</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Rehab Goals</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Maintain independence, continue full-time employment</div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Appointments</div>
                  <div style={{ fontSize: 11, color: C.text }}>Next Neurology Review: 2026-08-15</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Last seen: 2026-06-10</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Imaging History</div>
                  <div style={{ fontSize: 11, color: C.text }}>MRI Brain: 2024-12-01 (stable)</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>CT Head: 2021-05-20 (normal)</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Education</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Epilepsy self-management, seizure first aid, driving regulations, medication adherence, migraine trigger diary</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Driving / Work Recommendations</div>
                  <div style={{ fontSize: 11, color: C.green }}>Eligible to drive (seizure-free &gt;12 months)</div>
                  <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Active full-time employment, no restrictions</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Emergency Action Plans</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Seizure first aid card issued. Emergency contact: Wife (Joyce Ochieng, +254 712 345 678). Buccal midazolam prescribed PRN.</div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}