'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, Eye, Brain, Bone, HeartPulse, type LucideIcon, Zap, Home, Globe, Baby, Apple, Target, BarChart3, Sliders, LineChart } from 'lucide-react'
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
    case 'Controlled': case 'Good': case 'Stable': case 'Completed': case 'Normal': case 'Yes': case 'Low': case 'Improved': return C.green
    case 'Moderate': case 'Fair': case 'Pending': case 'Occasional': case 'Mild': case 'Daily': return C.amber
    case 'High': case 'Severe': case 'Critical': case 'Poor': case 'No': case 'Rare': case 'Reduced': case 'Uncontrolled': return C.red
    case 'Predominant': case 'Frequent Exacerbator': case 'Slow': return C.sky
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Respiratory Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Respiratory Snapshot', icon: Wind },
  { id: 'timeline', label: 'Disease Timeline', icon: Clock },
  { id: 'phenotype', label: 'Phenotype Engine', icon: Brain },
  { id: 'lung-function', label: 'Lung Function', icon: Monitor },
  { id: 'symptoms', label: 'Symptom Intelligence', icon: AlertTriangle },
  { id: 'asthma', label: 'Asthma Control', icon: Wind },
  { id: 'copd', label: 'COPD Intelligence', icon: Wind },
  { id: 'exacerbations', label: 'Exacerbation Intelligence', icon: TrendingUp },
  { id: 'smoking', label: 'Smoking Intelligence', icon: BookOpen },
  { id: 'environment', label: 'Environmental Exposure', icon: Globe },
  { id: 'medications', label: 'Medication Intelligence', icon: Pill },
  { id: 'inhaler', label: 'Inhaler Technique', icon: CheckCircle },
  { id: 'oxygen', label: 'Oxygen Therapy', icon: Wind },
  { id: 'rehab', label: 'Pulmonary Rehabilitation', icon: Heart },
  { id: 'imaging', label: 'Imaging Intelligence', icon: Eye },
  { id: 'infection', label: 'Respiratory Infection', icon: Shield },
  { id: 'vaccination', label: 'Vaccination Intelligence', icon: Syringe },
  { id: 'home', label: 'Home Monitoring', icon: Home },
  { id: 'team', label: 'MDT', icon: Users },
  { id: 'registry', label: 'Registry', icon: FileText },
  { id: 'quality', label: 'Quality Indicators', icon: BarChart3 },
  { id: 'portal', label: 'Patient Portal', icon: Globe },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' },
  { label: 'Doctor Workspace', href: '/doctor' },
  { label: 'Nurse Workspace', href: '/nurse' },
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
  { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Oncology', href: '/oncology' },
  { label: 'Neurology', href: '/neurology' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

const timelineEvents = [
  { year: '2016', event: 'Initial COPD Diagnosis', detail: 'GOLD II, started SABA monotherapy', color: C.sky },
  { year: '2017', event: 'Smoking Cessation', detail: 'Completed program after 12 years of smoking', color: C.green },
  { year: '2018', event: 'ICS/LABA Initiated', detail: 'Budesonide/Formoterol started for persistent symptoms', color: C.sky },
  { year: '2019', event: 'Pulmonary Rehabilitation', detail: 'Completed 12-week course, 6MWT improved from 280m to 340m', color: C.green },
  { year: '2020', event: 'First Hospital Admission', detail: 'Acute exacerbation, treated with steroids + antibiotics', color: C.red },
  { year: '2021', event: 'LAMA Added', detail: 'Tiotropium added to regimen for symptom control', color: C.amber },
  { year: '2022', event: 'O\u2082 Therapy Initiated', detail: 'LTOT at 2L/min, 12hr/day for desaturation on exertion', color: C.amber },
  { year: '2023', event: 'Azithromycin Trial', detail: 'Stopped due to QT prolongation on ECG', color: C.red },
  { year: '2024', event: 'Pulmonary Rehab (2nd)', detail: 'Maintenance program, 75% attendance, functional gains sustained', color: C.green },
  { year: '2025', event: 'Stable Disease State', detail: 'GOLD III, Group E, on triple therapy with stable symptoms', color: C.green },
]

const exacerbationEvents = [
  { date: '2025-02-15', trigger: 'Viral URTI', severity: 'Moderate', organism: 'H. influenzae', hospitalization: 'Yes, 5 days', treatment: 'Prednisolone 40mg x5d + Amoxicillin/clavulanate', recovery: 'Full recovery at 2 weeks', pattern: 'Winter viral' },
  { date: '2024-11-20', trigger: 'Bacterial bronchitis', severity: 'Severe', organism: 'S. pneumoniae', hospitalization: 'Yes, 7 days', treatment: 'IV methylprednisolone + Levofloxacin', recovery: 'Gradual recovery over 4 weeks', pattern: 'Winter viral' },
  { date: '2024-06-10', trigger: 'Environmental smoke', severity: 'Moderate', organism: 'H. influenzae', hospitalization: 'Yes, 4 days', treatment: 'Prednisolone 40mg + Doxycycline', recovery: 'Recovered with pulmonary rehab', pattern: 'Summer exacerbation' },
]

const medicationData = [
  { drug: 'Salbutamol', cls: 'SABA', dose: '100-200 mcg PRN', start: '2016', adherence: '95%', status: 'Active', note: 'As needed for dyspnoea' },
  { drug: 'Budesonide/Formoterol', cls: 'ICS/LABA', dose: '320/9 mcg BID', start: '2018', adherence: '88%', status: 'Active', note: 'Maintenance therapy' },
  { drug: 'Tiotropium', cls: 'LAMA', dose: '18 mcg daily', start: '2021', adherence: '92%', status: 'Active', note: 'Added for persistent symptoms' },
  { drug: 'Azithromycin', cls: 'Macrolide', dose: '250 mg 3x/wk', start: '2023', adherence: '100%', status: 'Stopped', note: 'QT prolongation on ECG' },
]

const teamMembers = [
  { role: 'Pulmonologist', name: 'Dr. Kamau Mwangi', status: 'Available' },
  { role: 'Primary Care', name: 'Dr. Grace Otieno', status: 'Available' },
  { role: 'Respiratory Nurse', name: 'Sr. Jane Wanjiku', status: 'Available' },
  { role: 'Physiotherapist', name: 'Peter Ochieng', status: 'Busy' },
  { role: 'Pharmacist', name: 'Sarah Akinyi', status: 'Available' },
  { role: 'Dietitian', name: 'Nancy Kiprop', status: 'Available' },
  { role: 'Thoracic Surgeon', name: 'Dr. Ben Mwangi', status: 'Available' },
  { role: 'Respiratory Therapist', name: 'James Achieng', status: 'Busy' },
  { role: 'Occupational Therapist', name: 'Mary Njoroge', status: 'Available' },
  { role: 'Psychologist', name: 'Dr. Faith Wambui', status: 'Available' },
  { role: 'Palliative Care', name: 'Dr. Esther Muthoni', status: 'Available' },
]

const registryPatients = [
  { name: 'Jane Akinyi', mrn: 'MRN-2001', diagnosis: 'COPD GOLD III', duration: '9 yr', lastFev1: '42%', exacerbations: '2/yr', admissions: '1/yr', risk: 'High' },
  { name: 'John Kamau', mrn: 'MRN-2002', diagnosis: 'Asthma', duration: '15 yr', lastFev1: '78%', exacerbations: '1/yr', admissions: '0/yr', risk: 'Moderate' },
  { name: 'Grace Akinyi', mrn: 'MRN-2003', diagnosis: 'ILD', duration: '3 yr', lastFev1: '65%', exacerbations: '0/yr', admissions: '0/yr', risk: 'Moderate' },
  { name: 'Peter Ochieng', mrn: 'MRN-2004', diagnosis: 'Bronchiectasis', duration: '8 yr', lastFev1: '55%', exacerbations: '3/yr', admissions: '2/yr', risk: 'High' },
  { name: 'Mary Achieng', mrn: 'MRN-2005', diagnosis: 'COPD GOLD II', duration: '5 yr', lastFev1: '58%', exacerbations: '1/yr', admissions: '0/yr', risk: 'Moderate' },
]

export default function RespiratoryWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Volume XI-E &middot; CRDIC</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: C.textLight }}>Respiratory Intelligence Center</div>
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>CR</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Respiratory</div>
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
              <div style={S.secTitle}>Respiratory Dashboard</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.skyLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color={C.sky} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Jane Akinyi</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                {['52 Years', 'Female', 'COPD GOLD III', 'Duration: 9 Years'].map(t => (
                  <span key={t} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: C.panel, color: C.text }}>{t}</span>
                ))}
                <div style={{ width: 1, height: 24, background: C.border }} />
                <span style={S.pill(C.amber)}>Stable</span>
                <span style={S.pill(C.red)}>Risk: High</span>
                <span style={S.pill(C.sky)}>Last Exacerbation: 5 months ago</span>
              </div>
              <div style={S.grid4}>
                {[
                  { icon: Wind, label: 'Total Respiratory Patients', value: '847', color: C.sky },
                  { icon: Wind, label: 'Asthma Controlled (%)', value: '68%', color: C.green },
                  { icon: Bed, label: 'COPD Admissions', value: '124/yr', color: C.amber },
                  { icon: Wind, label: 'ILD Patients', value: '58', color: C.purple },
                  { icon: Wind, label: 'O\u2082 Therapy', value: '92', color: C.sky },
                  { icon: Heart, label: 'Rehab Attendance', value: '55%', color: C.amber },
                  { icon: TrendingUp, label: 'Exacerbation Rate', value: '2.1/yr', color: C.red },
                  { icon: HeartPulse, label: 'Mortality', value: '3.2%', color: C.red },
                ].map(k => (
                  <div key={k.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <k.icon size={18} color={k.color} />
                      <div style={{ fontSize: 11, color: C.textLight }}>{k.label}</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.navy }}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>High-Risk Respiratory Patients</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { n: 'Jane Akinyi', d: 'COPD GOLD III', r: 'High', e: '5mo ago' },
                      { n: 'Peter Ochieng', d: 'Bronchiectasis', r: 'High', e: '2mo ago' },
                      { n: 'John Kamau', d: 'Severe Asthma', r: 'Moderate', e: '8mo ago' },
                      { n: 'Grace Akinyi', d: 'ILD, IPF', r: 'High', e: '1mo ago' },
                    ].map(p => (
                      <div key={p.n} style={{ padding: '10px 14px', borderRadius: 8, background: `${C.red}08`, border: `1px solid ${C.red}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.r === 'High' ? C.red : C.amber, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.n}</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.d} &middot; Last exacerbation: {p.e}</div>
                        </div>
                        <span style={S.badge(p.r === 'High' ? C.red : C.amber)}>{p.r}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recent Alerts</div>
                  {[
                    { a: 'Jane Akinyi \u2014 CAT score increased from 16 to 18', c: C.amber },
                    { a: 'Peter Ochieng \u2014 Missed pulmonary rehab session', c: C.amber },
                    { a: 'Grace Akinyi \u2014 SpO\u2082 dropped to 88% on 6MWT', c: C.red },
                    { a: 'John Kamau \u2014 ACT score decreased to 16', c: C.red },
                    { a: 'Influenza vaccination campaign starts next week', c: C.sky },
                  ].map((al, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                      <AlertTriangle size={14} color={al.c} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, color: C.text }}>{al.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <div>
              <div style={S.secTitle}>Respiratory Snapshot</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Comprehensive respiratory status</div>
              <div style={S.grid4}>
                {[
                  { label: 'SpO\u2082', value: '95%', icon: Monitor, color: C.green },
                  { label: 'Respiratory Rate', value: '18/min', icon: Wind, color: C.green },
                  { label: 'FEV\u2081', value: '42% predicted', icon: Monitor, color: C.red },
                  { label: 'FVC', value: '73%', icon: Monitor, color: C.amber },
                  { label: 'FEV\u2081/FVC', value: '0.46', icon: Monitor, color: C.red },
                  { label: 'mMRC Dyspnea', value: 'Grade 2', icon: Wind, color: C.amber },
                  { label: 'CAT Score', value: '18', icon: AlertTriangle, color: C.amber },
                  { label: 'Smoking', value: 'Stopped 3yr', icon: BookOpen, color: C.green },
                  { label: '6MWT', value: '340m', icon: Heart, color: C.amber },
                  { label: 'ACT Score', value: '20', icon: CheckCircle, color: C.green },
                  { label: 'Inhaler Technique', value: 'Good', icon: CheckCircle, color: C.green },
                  { label: 'Last PFT', value: '2 months ago', icon: Calendar, color: C.amber },
                ].map(s => (
                  <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <s.icon size={16} color={s.color} />
                      <div style={{ fontSize: 10, color: C.textLight }}>{s.label}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TIMELINE ─── */}
          {tab === 'timeline' && (
            <div>
              <div style={S.secTitle}>Disease Timeline</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; 10-year disease journey</div>
              <div style={S.card}>
                {timelineEvents.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < timelineEvents.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${e.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: e.color }}>{e.year}</div>
                      {i < timelineEvents.length - 1 && <div style={{ width: 1, flex: 1, background: C.border, margin: '4px 0' }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < timelineEvents.length - 1 ? 4 : 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{e.event}</div>
                      <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{e.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PHENOTYPE ─── */}
          {tab === 'phenotype' && (
            <div>
              <div style={S.secTitle}>Phenotype Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Disease phenotype classification</div>
              <div style={S.grid3}>
                {[
                  { trait: 'COPD', value: 'Confirmed', icon: CheckCircle, color: C.green },
                  { trait: 'Chronic Bronchitis', value: 'Yes', icon: CheckCircle, color: C.green },
                  { trait: 'Emphysema', value: 'Predominant', icon: Wind, color: C.sky },
                  { trait: 'Frequent Exacerbator', value: 'Yes', icon: AlertTriangle, color: C.sky },
                  { trait: 'Asthma Overlap', value: 'No', icon: XCircle, color: C.red },
                  { trait: 'Alpha-1 Deficiency', value: 'No', icon: XCircle, color: C.green },
                ].map(p => (
                  <div key={p.trait} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <p.icon size={20} color={p.color} />
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight }}>{p.trait}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{p.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── LUNG FUNCTION ─── */}
          {tab === 'lung-function' && (
            <div>
              <div style={S.secTitle}>Lung Function Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Spirometry &amp; pulmonary function tests</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PFT Values</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      {[
                        { p: 'FEV\u2081', v: '1.15 L', pct: '42%' },
                        { p: 'FVC', v: '2.50 L', pct: '73%' },
                        { p: 'FEV\u2081/FVC', v: '0.46', pct: '' },
                        { p: 'TLC', v: '5.80 L', pct: '' },
                        { p: 'RV', v: '3.10 L', pct: '' },
                        { p: 'DLCO', v: '14 mL/min/mmHg', pct: '' },
                        { p: 'BD Response', v: 'Negative (<12% / <200 mL)', pct: '' },
                        { p: 'Peak Flow', v: '280 L/min', pct: '' },
                      ].map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 4px', fontWeight: 500 }}>{r.p}</td>
                          <td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600 }}>{r.v}</td>
                          {r.pct && <td style={{ textAlign: 'right', padding: '8px 4px', color: C.textLight }}>{r.pct}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>FEV\u2081 Decline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Annual Decline', value: '-42 mL/year', color: C.amber },
                      { label: 'Progression', value: 'Slow', color: C.amber },
                      { label: 'Severity', value: 'Moderate-Severe', color: C.red },
                    ].map(d => (
                      <div key={d.label} style={{ padding: '12px 16px', borderRadius: 8, background: C.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: C.textLight }}>{d.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 11, color: C.textLight }}>Lung age: <strong style={{ color: C.navy }}>68 years</strong> (actual: 52 years)</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SYMPTOMS ─── */}
          {tab === 'symptoms' && (
            <div>
              <div style={S.secTitle}>Symptom Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; 7-day symptom tracking</div>
              <div style={S.grid3}>
                {[
                  { s: 'Dyspnea', severity: 'Moderate', trend: 'Stable', color: C.amber },
                  { s: 'Wheeze', severity: 'Mild', trend: 'Improving', color: C.green },
                  { s: 'Cough', severity: 'Daily', trend: 'Stable', color: C.amber },
                  { s: 'Sputum', severity: 'Clear, moderate', trend: 'Stable', color: C.amber },
                  { s: 'Chest tightness', severity: 'Occasional', trend: 'Improving', color: C.green },
                  { s: 'Exercise intolerance', severity: 'Moderate', trend: 'Stable', color: C.amber },
                  { s: 'Nocturnal symptoms', severity: 'Rare', trend: 'Improving', color: C.green },
                ].map(sx => (
                  <div key={sx.s} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{sx.s}</div>
                      <span style={S.badge(sx.color)}>{sx.severity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: C.textLight }}>Trend</span>
                      <span style={{ fontWeight: 600, color: sx.trend === 'Improving' ? C.green : C.amber }}>{sx.trend}</span>
                    </div>
                    <div style={{ marginTop: 8, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: sx.severity === 'Moderate' || sx.severity === 'Daily' ? '65%' : sx.severity === 'Mild' ? '35%' : '20%', height: '100%', background: sx.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ASTHMA ─── */}
          {tab === 'asthma' && (
            <div>
              <div style={S.secTitle}>Asthma Control Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Asthma control assessment</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <CheckCircle size={24} color={C.green} />
                  <div style={S.statValue}>20</div>
                  <div style={S.statLabel}>ACT Score (Controlled)</div>
                </div>
                <div style={S.statCard}>
                  <CheckCircle size={24} color={C.green} />
                  <div style={S.statValue}>&lt;2x/wk</div>
                  <div style={S.statLabel}>Daytime Symptoms</div>
                </div>
                <div style={S.statCard}>
                  <CheckCircle size={24} color={C.green} />
                  <div style={S.statValue}>0</div>
                  <div style={S.statLabel}>Night Waking (per wk)</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.amber} />
                  <div style={S.statValue}>2x/wk</div>
                  <div style={S.statLabel}>Reliever Use</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Asthma Metrics</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '8px 4px' }}>Activity Limitation</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600 }}>Mild</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '8px 4px' }}>Exacerbations (6mo)</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600 }}>1</td></tr>
                      <tr><td style={{ padding: '8px 4px' }}>Risk Level</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: C.amber }}>Moderate</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Management Plan</div>
                  <div style={{ fontSize: 12, color: C.text }}>Step 3 therapy: Low-dose ICS/LABA + PRN SABA. Continue current regimen. Review inhaler technique. Action plan updated.</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── COPD ─── */}
          {tab === 'copd' && (
            <div>
              <div style={S.secTitle}>COPD Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Comprehensive COPD assessment</div>
              <div style={S.grid4}>
                {[
                  { label: 'GOLD Stage', value: 'III', color: C.red },
                  { label: 'Group', value: 'E', color: C.red },
                  { label: 'Exacerbations/yr', value: '2', color: C.amber },
                  { label: 'Admissions/yr', value: '1', color: C.amber },
                  { label: 'Hyperinflation', value: 'Moderate', color: C.amber },
                  { label: 'Gas Exchange', value: 'Normal', color: C.green },
                  { label: 'Exercise Capacity', value: 'Reduced', color: C.amber },
                  { label: 'BODE Index', value: '5', color: C.amber },
                ].map(c => (
                  <div key={c.label} style={S.statCard}>
                    <div style={S.statValue}>{c.value}</div>
                    <div style={S.statLabel}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── EXACERBATIONS ─── */}
          {tab === 'exacerbations' && (
            <div>
              <div style={S.secTitle}>Exacerbation Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Exacerbation history &amp; pattern analysis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {exacerbationEvents.map((ex, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, borderLeft: `3px solid ${ex.severity === 'Severe' ? C.red : C.amber}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{ex.date} &middot; {ex.trigger}</div>
                      <span style={S.badge(ex.severity === 'Severe' ? C.red : C.amber)}>{ex.severity}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 11 }}>
                      <div><span style={{ color: C.textLight }}>Organism:</span> <strong>{ex.organism}</strong></div>
                      <div><span style={{ color: C.textLight }}>Hospitalization:</span> <strong>{ex.hospitalization}</strong></div>
                      <div><span style={{ color: C.textLight }}>Treatment:</span> <strong>{ex.treatment}</strong></div>
                      <div><span style={{ color: C.textLight }}>Recovery:</span> <strong>{ex.recovery}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: C.textLight }}>Pattern:</span> <strong>{ex.pattern}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Pattern Detection</div>
                <div style={{ fontSize: 12, color: C.text }}>Predominant pattern: <strong>Winter viral exacerbations</strong> (2 of 3 episodes). Consider seasonal prophylaxis and early antiviral planning. Influenza and pneumococcal vaccination status up to date.</div>
              </div>
            </div>
          )}

          {/* ─── SMOKING ─── */}
          {tab === 'smoking' && (
            <div>
              <div style={S.secTitle}>Smoking Intelligence Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Smoking history &amp; cessation tracking</div>
              <div style={S.grid4}>
                {[
                  { label: 'Pack Years', value: '32', icon: BookOpen, color: C.red },
                  { label: 'Current', value: 'Stopped 3yr', icon: CheckCircle, color: C.green },
                  { label: 'Quit Attempts', value: '2', icon: TrendingUp, color: C.amber },
                  { label: 'Nicotine Replacement', value: 'Gum', icon: Pill, color: C.sky },
                  { label: 'Counselling', value: 'Complete', icon: CheckCircle, color: C.green },
                  { label: 'Relapse', value: 'No', icon: XCircle, color: C.green },
                  { label: 'CO Testing', value: '3 ppm', icon: Wind, color: C.green },
                  { label: 'Vaping', value: 'No', icon: XCircle, color: C.green },
                ].map(s => (
                  <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <s.icon size={16} color={s.color} />
                      <div style={{ fontSize: 10, color: C.textLight }}>{s.label}</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ENVIRONMENT ─── */}
          {tab === 'environment' && (
            <div>
              <div style={S.secTitle}>Environmental Exposure Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Environmental and occupational exposure assessment</div>
              <div style={S.grid3}>
                {[
                  { factor: 'Indoor smoke (Firewood)', exposure: 'Daily', risk: 'High', color: C.red },
                  { factor: 'Charcoal', exposure: 'Occasional', risk: 'Moderate', color: C.amber },
                  { factor: 'Occupational', exposure: 'None', risk: 'Low', color: C.green },
                  { factor: 'Dust', exposure: 'None', risk: 'Low', color: C.green },
                  { factor: 'Air Pollution', exposure: 'Moderate', risk: 'Moderate', color: C.amber },
                  { factor: 'Biomass Fuel', exposure: 'Daily', risk: 'High', color: C.red },
                  { factor: 'Mining', exposure: 'None', risk: 'Low', color: C.green },
                ].map(e => (
                  <div key={e.factor} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{e.factor}</div>
                      <span style={S.badge(e.color)}>{e.risk}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textLight }}>Exposure: <strong>{e.exposure}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── MEDICATIONS ─── */}
          {tab === 'medications' && (
            <div>
              <div style={S.secTitle}>Medication Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Current and past respiratory medications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {medicationData.map(m => (
                  <div key={m.drug} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{m.drug}</div>
                        <div style={{ fontSize: 12, color: C.textLight }}>{m.cls} &middot; {m.dose}</div>
                      </div>
                      <span style={S.badge(m.status === 'Active' ? C.green : C.red)}>{m.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, fontSize: 11 }}>
                      <div><span style={{ color: C.textLight }}>Start:</span> <strong>{m.start}</strong></div>
                      <div><span style={{ color: C.textLight }}>Adherence:</span> <strong>{m.adherence}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: C.textLight }}>Note:</span> <strong>{m.note}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── INHALER ─── */}
          {tab === 'inhaler' && (
            <div>
              <div style={S.secTitle}>Inhaler Technique Workspace</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Inhaler technique assessment</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Technique Assessment</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '8px 4px' }}>Assessed</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: C.green }}>Yes, 2 weeks ago</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '8px 4px' }}>Correct</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: C.red }}>No</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '8px 4px' }}>Errors</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: C.amber }}>Poor coordination</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '8px 4px' }}>Education</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: C.green }}>Provided</td></tr>
                      <tr><td style={{ padding: '8px 4px' }}>Reassessment</td><td style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600, color: C.amber }}>Scheduled</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Devices in Use</div>
                  {[
                    { device: 'Turbuhaler', technique: 'Poor coordination - shake, load, exhale, seal lips, inhale firmly, hold 10s', status: 'Needs practice' },
                    { device: 'Respimat', technique: 'Correct - twist, press, slow deep inhalation, hold', status: 'Good' },
                  ].map(d => (
                    <div key={d.device} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{d.device}</div>
                      <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{d.technique}</div>
                      <span style={S.badge(d.status === 'Good' ? C.green : C.amber)}>{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── OXYGEN ─── */}
          {tab === 'oxygen' && (
            <div>
              <div style={S.secTitle}>Oxygen Therapy Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Long-term oxygen therapy monitoring</div>
              <div style={S.grid4}>
                {[
                  { label: 'Resting SpO\u2082', value: '95%', color: C.green },
                  { label: 'Walking SpO\u2082', value: '88%', color: C.red },
                  { label: 'O\u2082 Prescription', value: '2 L/min, 12hr/day', color: C.sky },
                  { label: 'Compliance', value: '85%', color: C.amber },
                  { label: 'Equipment', value: 'Concentrator', color: C.sky },
                  { label: 'Reassessment', value: '3 months', color: C.amber },
                ].map(o => (
                  <div key={o.label} style={S.statCard}>
                    <div style={S.statValue}>{o.value}</div>
                    <div style={S.statLabel}>{o.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Oxygen Titration</div>
                <div style={{ fontSize: 12, color: C.text }}>Target SpO\u2082 range: <strong>88-92%</strong>. Current settings maintain resting SpO\u2082 at 95%. Exertional desaturation to 88% managed with increased flow to 3 L/min during activity. Annual LTOT review due in 3 months.</div>
              </div>
            </div>
          )}

          {/* ─── REHAB ─── */}
          {tab === 'rehab' && (
            <div>
              <div style={S.secTitle}>Pulmonary Rehabilitation</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Rehabilitation progress tracking</div>
              <div style={S.grid4}>
                {[
                  { label: 'Exercise Sessions', value: '8/12', color: C.amber },
                  { label: 'Distance (6MWT)', value: '340m (+40m)', color: C.green },
                  { label: 'Strength', value: 'Improved', color: C.green },
                  { label: 'Breathing Exercises', value: 'Daily', color: C.green },
                  { label: 'Attendance', value: '75%', color: C.amber },
                  { label: 'Functional Improvement', value: 'Moderate', color: C.amber },
                ].map(r => (
                  <div key={r.label} style={S.statCard}>
                    <div style={S.statValue}>{r.value}</div>
                    <div style={S.statLabel}>{r.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Program Details</div>
                <div style={{ fontSize: 12, color: C.text }}>12-week supervised program. Current: week 8. Exercises include treadmill (15 min), cycle ergometer (10 min), upper/lower limb strengthening, breathing retraining. Home exercise program: daily diaphragmatic breathing, pursed-lip breathing, walking program.</div>
              </div>
            </div>
          )}

          {/* ─── IMAGING ─── */}
          {tab === 'imaging' && (
            <div>
              <div style={S.secTitle}>Imaging Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Chest imaging surveillance</div>
              <div style={S.grid3}>
                {[
                  { modality: 'Chest X-Ray', detail: 'Last: 3 months ago', finding: 'Hyperinflation, flat diaphragms', color: C.amber },
                  { modality: 'CT Chest', detail: 'Last: 12 months ago', finding: 'Emphysema, upper lobe predominant', color: C.amber },
                  { modality: 'HRCT', detail: 'Last: 12 months ago', finding: 'No fibrosis', color: C.green },
                  { modality: 'Bronchiectasis', detail: 'Assessed', finding: 'None', color: C.green },
                  { modality: 'Nodules', detail: 'Surveillance', finding: 'None', color: C.green },
                  { modality: 'Cancer Surveillance', detail: 'Annual low-dose CT', finding: 'Scheduled', color: C.amber },
                ].map(img => (
                  <div key={img.modality} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>{img.modality}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4 }}>{img.detail}</div>
                    <div style={{ fontSize: 12, color: img.finding === 'None' || img.finding === 'No fibrosis' ? C.green : C.amber, fontWeight: 600 }}>{img.finding}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── INFECTION ─── */}
          {tab === 'infection' && (
            <div>
              <div style={S.secTitle}>Respiratory Infection Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Infection history &amp; microbiology</div>
              <div style={S.grid3}>
                {[
                  { label: 'Organisms', value: 'H. influenzae', icon: Shield, color: C.red },
                  { label: 'Culture', value: 'Positive (sputum)', icon: Shield, color: C.amber },
                  { label: 'Resistance', value: 'None detected', icon: CheckCircle, color: C.green },
                  { label: 'Antibiotics', value: 'Amoxicillin', icon: Pill, color: C.sky },
                  { label: 'Vaccination', value: 'Up to date', icon: Syringe, color: C.green },
                  { label: 'Colonization', value: 'No', icon: XCircle, color: C.green },
                ].map(inf => (
                  <div key={inf.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <inf.icon size={16} color={inf.color} />
                      <div style={{ fontSize: 10, color: C.textLight }}>{inf.label}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{inf.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── VACCINATION ─── */}
          {tab === 'vaccination' && (
            <div>
              <div style={S.secTitle}>Vaccination Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Vaccination status &amp; schedule</div>
              <div style={S.grid4}>
                {[
                  { v: 'Influenza', year: '2025', status: 'Received', icon: Syringe, color: C.green },
                  { v: 'COVID-19', year: 'Booster', status: 'Received', icon: Syringe, color: C.green },
                  { v: 'Pneumococcal (PCV20)', year: '2024', status: 'Received', icon: Syringe, color: C.green },
                  { v: 'RSV', year: 'Pending', status: 'Due', icon: Clock, color: C.amber },
                ].map(v => (
                  <div key={v.v} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <v.icon size={18} color={v.color} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{v.v}</div>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{v.year}</div>
                    <span style={S.badge(v.color)}>{v.status}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Due Reminders</div>
                <div style={{ fontSize: 12, color: C.amber }}>
                  <AlertTriangle size={14} style={{ marginRight: 6 }} />
                  RSV vaccination pending &mdash; recommended for COPD patients aged &ge;50 years
                </div>
              </div>
            </div>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <div>
              <div style={S.secTitle}>Home Monitoring</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient: <strong>Jane Akinyi</strong> &middot; Home monitoring data &amp; trends</div>
              <div style={S.grid3}>
                {[
                  { metric: 'Peak Flow', value: '280 L/min', trend: 'Stable', color: C.green },
                  { metric: 'Symptoms', value: 'Mild SOB', trend: 'Stable', color: C.amber },
                  { metric: 'Pulse Oximetry', value: '95%', trend: 'Stable', color: C.green },
                  { metric: 'Medication Use', value: 'PRN SABA 2x/wk', trend: 'Stable', color: C.green },
                  { metric: 'Exercise', value: 'Walking 20 min', trend: 'Improving', color: C.green },
                  { metric: 'Weight', value: '72 kg', trend: 'Stable', color: C.green },
                  { metric: 'O\u2082 Hours', value: '12 hr/day', trend: 'Stable', color: C.amber },
                ].map(h => (
                  <div key={h.metric} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: C.textLight }}>{h.metric}</div>
                      <span style={S.badge(h.color)}>{h.trend}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{h.value}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Summarized Trends (Last 7 Days)</div>
                <div style={{ fontSize: 12, color: C.text }}>Peak flow variability: &lt;10%. No significant diurnal variation. Symptom score averaging 2/10. Oxygen saturation consistently &ge;94% at rest. 2 rescue inhaler uses this week (within expected range).</div>
              </div>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {tab === 'team' && (
            <div>
              <div style={S.secTitle}>Multidisciplinary Team</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>11-member respiratory MDT &middot; Patient: Jane Akinyi</div>
              <div style={S.grid3}>
                {teamMembers.map(t => (
                  <div key={t.role} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.skyLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={18} color={C.sky} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{t.role}</div>
                        <div style={{ fontSize: 11, color: C.textLight }}>{t.name}</div>
                      </div>
                    </div>
                    <span style={S.badge(t.status === 'Available' ? C.green : C.amber)}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === 'registry' && (
            <div>
              <div style={S.secTitle}>Registry</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Respiratory disease registry &middot; Population overview</div>
              <div style={S.grid3}>
                {[
                  { label: 'Asthma', count: '342', pct: '40%', color: C.sky },
                  { label: 'COPD', count: '218', pct: '26%', color: C.red },
                  { label: 'ILD', count: '58', pct: '7%', color: C.purple },
                  { label: 'Bronchiectasis', count: '45', pct: '5%', color: C.amber },
                  { label: 'Pulmonary HTN', count: '22', pct: '3%', color: C.red },
                  { label: 'Long-term O\u2082', count: '92', pct: '11%', color: C.sky },
                ].map(r => (
                  <div key={r.label} style={S.statCard}>
                    <div style={S.statValue}>{r.count}</div>
                    <div style={S.statLabel}>{r.label} ({r.pct})</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Registry Patients</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Diagnosis</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Duration</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>FEV\u2081</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Exacerbations/yr</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Admissions/yr</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registryPatients.map((rp, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{rp.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.diagnosis}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.duration}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: rp.lastFev1 === '42%' || rp.lastFev1 === '55%' ? C.red : rp.lastFev1 === '58%' ? C.amber : C.green }}>{rp.lastFev1}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.exacerbations}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.admissions}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(rp.risk === 'High' ? C.red : C.amber)}>{rp.risk}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── QUALITY ─── */}
          {tab === 'quality' && (
            <div>
              <div style={S.secTitle}>Quality Indicators</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Respiratory quality metrics &middot; Population-level performance</div>
              <div style={S.grid4}>
                {[
                  { qi: 'Asthma Control', value: '68%', icon: Wind, color: C.amber },
                  { qi: 'COPD Exacerbation Rate', value: '2.1/yr', icon: TrendingUp, color: C.red },
                  { qi: 'Admissions', value: '0.8/yr', icon: Bed, color: C.amber },
                  { qi: 'Smoking Cessation', value: '45%', icon: BookOpen, color: C.amber },
                  { qi: 'Spirometry', value: '82%', icon: Monitor, color: C.green },
                  { qi: 'Vaccination', value: '71%', icon: Syringe, color: C.amber },
                  { qi: 'Rehab Attendance', value: '55%', icon: Heart, color: C.red },
                  { qi: 'Inhaler Technique Review', value: '62%', icon: CheckCircle, color: C.amber },
                ].map(q => (
                  <div key={q.qi} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <q.icon size={16} color={q.color} />
                      <div style={{ fontSize: 10, color: C.textLight }}>{q.qi}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{q.value}</div>
                    <div style={{ marginTop: 8, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: typeof q.value === 'string' && q.value.includes('%') ? q.value : '55%', height: '100%', background: q.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PORTAL ─── */}
          {tab === 'portal' && (
            <div>
              <div style={S.secTitle}>Patient Portal</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20 }}>Patient view &middot; <strong>Jane Akinyi</strong></div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Lung Status</div>
                  <div style={{ fontSize: 12, color: C.text, marginBottom: 12 }}>FEV\u2081: <strong>42% predicted</strong> (last PFT 2 months ago) &middot; Stable since last visit</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Peak Flow Trend</div>
                  <div style={{ fontSize: 12, color: C.text }}>Morning: 280 L/min &middot; Evening: 290 L/min &middot; Variability: 3.4%</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Medication Reminders</div>
                  {[
                    { med: 'Budesonide/Formoterol', time: '08:00 & 20:00' },
                    { med: 'Tiotropium', time: '08:00' },
                    { med: 'Salbutamol PRN', time: 'As needed' },
                  ].map(mr => (
                    <div key={mr.med} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontWeight: 500 }}>{mr.med}</span>
                      <span style={{ color: C.textLight }}>{mr.time}</span>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Education &amp; Action Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { t: 'Inhaler Instructions', d: 'Turbuhaler: shake, load, exhale, seal lips, inhale firmly, hold 10s. Watch video tutorial.' },
                      { t: 'Exercise Goals', d: 'Daily 20-min walk. Pulmonary rehab exercises: diaphragmatic breathing, pursed-lip breathing, upper limb stretches.' },
                      { t: 'Vaccinations', d: 'Influenza (2025 \u2713), COVID booster (\u2713), PCV20 (\u2713), RSV (pending).' },
                      { t: 'Appointments', d: 'Pulmonologist: 2026-08-15. Pulmonary rehab: Tue/Thu 10:00. PFT: 2026-09-01.' },
                      { t: 'Action Plan', d: 'Green zone: daily meds, exercise. Yellow zone: increase inhaler, monitor symptoms. Red zone: seek urgent care.' },
                      { t: 'Education Resources', d: 'COPD self-management guide, breathing techniques booklet, nutrition for lung health, smoking relapse prevention.' },
                    ].map(res => (
                      <div key={res.t} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{res.t}</div>
                        <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{res.d}</div>
                      </div>
                    ))}
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
