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
    case 'Active': case 'Controlled': case 'On Track': case 'Available': case 'Good': case 'Normal': case 'Full': case 'Independent': case 'Eligible': case 'Complete': case 'Stable': case 'Excellent': case 'None': case 'Low Risk': case 'Completed': case 'Achieved': case 'Confirmed': return C.green
    case 'Fair': case 'Pending': case 'Needs Attention': case 'Moderate': case 'Busy': case 'Low': case 'Mild': case 'Limited': case 'Partial': case 'Review': case 'Scheduled': case 'In Progress': case 'Monitored': return C.amber
    case 'Poor': case 'Behind': case 'Critical': case 'Uncontrolled': case 'High': case 'Severe': case 'Unavailable': case 'No': case 'N/A': case 'High Risk': return C.red
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Antenatal Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Pregnancy Snapshot', icon: Heart },
  { id: 'timeline', label: 'Pregnancy Timeline', icon: Clock },
  { id: 'preconception', label: 'Preconception Care', icon: HeartPulse },
  { id: 'booking', label: 'Booking Assessment', icon: FileText },
  { id: 'visits', label: 'Scheduled Visits', icon: Calendar },
  { id: 'growth', label: 'Fetal Growth', icon: Monitor },
  { id: 'wellbeing', label: 'Maternal Wellbeing', icon: User },
  { id: 'screening', label: 'Antenatal Screening', icon: Shield },
  { id: 'nutrition', label: 'Nutrition Intelligence', icon: Weight },
  { id: 'medications', label: 'Medication Intelligence', icon: Pill },
  { id: 'complications', label: 'Complication Centers', icon: AlertTriangle },
  { id: 'diabetes', label: 'Gestational Diabetes', icon: Droplets },
  { id: 'hypertension', label: 'Pregnancy Hypertension', icon: Heart },
  { id: 'birth', label: 'Birth Plan', icon: BookOpen },
  { id: 'postnatal', label: 'Postnatal Plan', icon: Users },
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
]

const timelineEvents = [
  { date: '2025-01-15', title: 'Booking Appointment', details: 'First antenatal booking visit at 10 weeks, baseline investigations ordered', color: C.sky, icon: FileText },
  { date: '2025-02-12', title: 'Dating Scan', details: 'Crown-rump length consistent with 12w+2d, EDD confirmed 12-Aug-2025', color: C.green, icon: Monitor },
  { date: '2025-03-05', title: 'Combined Screening', details: 'First trimester combined screening — low risk for trisomies (1:5200)', color: C.green, icon: Shield },
  { date: '2025-04-02', title: 'Anomaly Scan', details: '20-week anomaly scan — all anatomical structures normal, placenta posterior', color: C.green, icon: Eye },
  { date: '2025-04-15', title: 'GDM Screen — Normal', details: '75g OGTT: Fasting 4.2, 1hr 7.1, 2hr 5.8 — all within normal limits', color: C.green, icon: Droplets },
  { date: '2025-05-10', title: 'Growth Scan', details: 'Fundal height 25cm, estimated fetal weight 680g (50th centile)', color: C.sky, icon: Monitor },
  { date: '2025-06-01', title: 'Iron Deficiency Detected', details: 'Hb 10.2 g/dL, ferritin 18 ng/mL — oral ferrous sulphate 200mg daily started', color: C.amber, icon: Pill },
  { date: '2025-06-20', title: 'Repeat Hb Improved', details: 'Hb 11.5 g/dL after 3 weeks of iron therapy, ferritin improving', color: C.green, icon: CheckCircle },
  { date: '2025-07-15', title: 'Growth Scan — 32w', details: 'EFW 1,820g (45th centile), AFI 12cm, umbilical artery Doppler normal', color: C.green, icon: Monitor },
  { date: '2025-08-05', title: 'Birth Plan Discussed', details: 'Patient prefers vaginal delivery, wishes for skin-to-skin and delayed cord clamping', color: C.purple, icon: BookOpen },
  { date: '2025-08-12', title: 'Spontaneous Labour', details: 'Admitted at 40w+0d, spontaneous onset of labour, membranes intact', color: C.sky, icon: Stethoscope },
  { date: '2025-08-13', title: 'Vaginal Delivery', details: 'Live female infant 3,420g, Apgar 9/9, vaginal delivery with episiotomy', color: C.green, icon: Heart },
  { date: '2025-08-14', title: 'Postnatal Day 1', details: 'Mother and baby well, breastfeeding initiated, Hb 10.8 g/dL, lochia normal', color: C.green, icon: User },
  { date: '2025-09-10', title: '6-Week Postnatal Check', details: 'Mother well, Hb 12.1 g/dL, baby thriving, breastfeeding established', color: C.green, icon: CheckCircle },
  { date: '2026-04-15', title: 'Preconception Visit', details: 'New pregnancy planning — folic acid 5mg, Hb 12.8, BP 118/76, BMI 24', color: C.sky, icon: HeartPulse },
]

const teamMembers = [
  { role: 'Obstetrician', name: 'Dr. Grace Wanjiku', status: 'Available' },
  { role: 'Midwife', name: 'Nancy Muthoni', status: 'Available' },
  { role: 'Sonographer', name: 'Peter Kamau', status: 'Available' },
  { role: 'Anaesthetist', name: 'Dr. Samuel Kiprop', status: 'Available' },
  { role: 'Dietitian', name: 'Mary Achieng', status: 'Busy' },
  { role: 'Physiotherapist', name: 'James Otieno', status: 'Available' },
  { role: 'Paediatrician', name: 'Dr. Sarah Wangari', status: 'Available' },
  { role: 'Social Worker', name: 'Esther Muthoni', status: 'Available' },
  { role: 'Lactation Consultant', name: 'Faith Nyambura', status: 'Available' },
  { role: 'Mental Health Midwife', name: 'Jane Atieno', status: 'Busy' },
]

export default function AntenatalWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Preconception &amp; Antenatal Intelligence Center &mdash; Volume XII-B</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>AN</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>PAIC</div>
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
              <div style={S.secTitle}>Antenatal Dashboard</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color={C.sky} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Jane Mwangi</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <div style={{ fontSize: 12, color: C.text }}>28 Years / Female</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <span style={S.pill(C.purple)}>Gravida 2 Para 1</span>
                <span style={S.pill(C.sky)}>24w+3d</span>
                <span style={S.pill(C.green)}>Low Risk</span>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Users size={24} color={C.sky} />
                  <div style={S.statValue}>1,876</div>
                  <div style={S.statLabel}>Total Antenatal Patients</div>
                </div>
                <div style={S.statCard}>
                  <Heart size={24} color={C.purple} />
                  <div style={S.statValue}>342</div>
                  <div style={S.statLabel}>Active Pregnancies</div>
                </div>
                <div style={S.statCard}>
                  <Calendar size={24} color={C.green} />
                  <div style={S.statValue}>48</div>
                  <div style={S.statLabel}>Deliveries This Month</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.red} />
                  <div style={S.statValue}>89</div>
                  <div style={S.statLabel}>High Risk</div>
                </div>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Calendar size={24} color={C.green} />
                  <div style={S.statValue}>12</div>
                  <div style={S.statLabel}>Booking This Week</div>
                </div>
                <div style={S.statCard}>
                  <Monitor size={24} color={C.sky} />
                  <div style={S.statValue}>156</div>
                  <div style={S.statLabel}>Growth Scans</div>
                </div>
                <div style={S.statCard}>
                  <Droplets size={24} color={C.amber} />
                  <div style={S.statValue}>28</div>
                  <div style={S.statLabel}>GDM Cases</div>
                </div>
                <div style={S.statCard}>
                  <Heart size={24} color={C.red} />
                  <div style={S.statValue}>14</div>
                  <div style={S.statLabel}>PIH Cases</div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Alerts</div>
                <div style={S.grid2}>
                  {[
                    { title: 'Missed Visit — High Risk', patient: 'Grace Akinyi', detail: 'Missed 32w growth scan, GDM + PIH, needs rescheduling', color: C.red },
                    { title: 'Abnormal OGTT', patient: 'Faith Nyambura', detail: 'Fasting glucose 5.8 mmol/L — diagnostic of GDM, refer to diabetes clinic', color: C.amber },
                    { title: 'HB < 10 g/dL', patient: 'Mary Achieng', detail: 'Hb 9.4 g/dL at 28 weeks — IV iron infusion recommended', color: C.red },
                    { title: 'Reduced Fetal Movements', patient: 'Jane Mwangi', detail: 'Reported reduced movements at 24w, CTG and ultrasound booked', color: C.amber },
                  ].map(a => (
                    <div key={a.title} style={{ padding: '10px 14px', borderRadius: 8, background: `${a.color}08`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AlertTriangle size={18} color={a.color} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{a.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{a.patient} &mdash; {a.detail}</div>
                      </div>
                      <button style={S.btn(a.color)}>Review</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Quick Actions</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Booking</button>
                  <button style={S.btn(C.purple)}><Monitor size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Schedule Growth Scan</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> GDM Referral</button>
                  <button style={S.btnO}><Heart size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> CTG Review</button>
                  <button style={S.btnO}><FileText size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Generate Summary</button>
                </div>
              </div>
            </>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <>
              <div style={S.secTitle}>Pregnancy Snapshot &mdash; Jane Mwangi</div>
              <div style={S.grid4}>
                {[
                  { label: 'Gestational Age', value: '24 weeks + 3 days', color: C.sky },
                  { label: 'EDD', value: '12-Aug-2025', color: C.navy },
                  { label: 'Parity', value: 'G2P1', color: C.purple },
                  { label: 'Blood Group', value: 'O Rh+', color: C.navy },
                  { label: 'Hb', value: '11.5 g/dL', color: C.green },
                  { label: 'Blood Pressure', value: '118/76 mmHg', color: C.green },
                  { label: 'BMI', value: '24.2 kg/m²', color: C.green },
                  { label: 'Urinalysis', value: 'Normal', color: C.green },
                  { label: 'OGTT', value: 'Normal (Apr 2025)', color: C.green },
                  { label: 'Anomaly Scan', value: 'Normal', color: C.green },
                  { label: 'Risk Category', value: 'Low Risk', color: C.green },
                  { label: 'Fetal Presentation', value: 'Cephalic', color: C.sky },
                ].map((s, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Upcoming Milestones</div>
                <div style={S.grid3}>
                  {[
                    { event: '28-Week Visit', date: '15-Jun-2025', note: 'Growth scan + Hb check', status: 'Scheduled', color: C.sky },
                    { event: 'GDM Rescreen', date: '22-Jun-2025', note: '75g OGTT repeat if indicated', status: 'Pending', color: C.amber },
                    { event: '32-Week Growth', date: '20-Jul-2025', note: 'Growth scan + Doppler', status: 'Scheduled', color: C.sky },
                    { event: '36-Week Visit', date: '17-Aug-2025', note: 'Presentation check + birth plan', status: 'Pending', color: C.amber },
                    { event: 'Birth Plan Review', date: 'TBD', note: 'Finalise with midwife', status: 'Pending', color: C.amber },
                    { event: 'Estimated Delivery', date: '12-Aug-2025', note: 'EDD ± 2 weeks', status: 'Pending', color: C.purple },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{m.event}</div>
                        <span style={S.badge(m.color)}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Date: {m.date}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{m.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── TIMELINE ─── */}
          {tab === 'timeline' && (
            <>
              <div style={S.secTitle}>Pregnancy Timeline &mdash; Jane Mwangi</div>
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

          {/* ─── PRECONCEPTION ─── */}
          {tab === 'preconception' && (
            <>
              <div style={S.secTitle}>Preconception Care &mdash; Jane Mwangi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Preconception Checklist</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { item: 'Folic Acid 5mg Daily', status: 'Completed', color: C.green },
                      { item: 'Rubella Immunity Confirmed', status: 'Completed', color: C.green },
                      { item: 'Genetic Carrier Screening', status: 'Offered', color: C.amber },
                      { item: 'Immunization Review (Tdap, Influenza)', status: 'Completed', color: C.green },
                      { item: 'BMI Optimisation', status: 'Achieved', color: C.green },
                      { item: 'Smoking / Alcohol Cessation', status: 'Not applicable', color: C.green },
                      { item: 'Chronic Disease Optimisation', status: 'Completed', color: C.green },
                      { item: 'Mental Health Screening', status: 'Completed', color: C.green },
                      { item: 'Partner HIV / Syphilis Screen', status: 'Completed', color: C.green },
                      { item: 'Dental Check', status: 'Completed', color: C.green },
                    ].map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${c.color}`, background: c.status === 'Completed' || c.status === 'Achieved' || c.status === 'Not applicable' ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(c.status === 'Completed' || c.status === 'Achieved' || c.status === 'Not applicable') && <CheckCircle size={12} color={C.white} />}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: C.navy, flex: 1 }}>{c.item}</span>
                        <span style={S.badge(c.color)}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Preconception Labs</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { test: 'Full Blood Count', result: 'Normal', date: '2026-04-15', color: C.green },
                      { test: 'Blood Group & Antibody Screen', result: 'O Rh+ Negative', date: '2026-04-15', color: C.green },
                      { test: 'Rubella IgG', result: 'Immune', date: '2026-04-15', color: C.green },
                      { test: 'HIV', result: 'Negative', date: '2026-04-15', color: C.green },
                      { test: 'Syphilis (VDRL)', result: 'Negative', date: '2026-04-15', color: C.green },
                      { test: 'Hepatitis B (HBsAg)', result: 'Negative', date: '2026-04-15', color: C.green },
                      { test: 'Thyroid Function (TSH)', result: '2.1 mIU/L', date: '2026-04-15', color: C.green },
                      { test: 'Vitamin D', result: '32 ng/mL', date: '2026-04-15', color: C.amber },
                      { test: 'Ferritin', result: '45 ng/mL', date: '2026-04-15', color: C.green },
                      { test: 'Urinalysis', result: 'Normal', date: '2026-04-15', color: C.green },
                    ].map((l, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{l.test}</span>
                        <span style={{ color: l.color }}>{l.result}</span>
                        <span style={{ color: C.textLight }}>{l.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── BOOKING ─── */}
          {tab === 'booking' && (
            <>
              <div style={S.secTitle}>Booking Assessment &mdash; Jane Mwangi</div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Booking History</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Parameter</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Current</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Reference</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { param: 'Gestational Age at Booking', current: '10w+2d', ref: '8-12 weeks', status: 'On Track', color: C.green },
                      { param: 'Maternal Age', current: '28 years', ref: '20-35 years', status: 'Optimal', color: C.green },
                      { param: 'BMI', current: '24.2 kg/m²', ref: '18.5-24.9', status: 'Normal', color: C.green },
                      { param: 'Systolic BP', current: '118 mmHg', ref: '<140 mmHg', status: 'Normal', color: C.green },
                      { param: 'Diastolic BP', current: '76 mmHg', ref: '<90 mmHg', status: 'Normal', color: C.green },
                      { param: 'Haemoglobin', current: '12.8 g/dL', ref: '≥11 g/dL', status: 'Normal', color: C.green },
                      { param: 'Blood Group', current: 'O Rh+', ref: 'Screened', status: 'Completed', color: C.green },
                      { param: 'HIV Status', current: 'Negative', ref: 'Negative', status: 'Completed', color: C.green },
                      { param: 'Syphilis', current: 'Negative', ref: 'Negative', status: 'Completed', color: C.green },
                      { param: 'Urinalysis', current: 'Normal', ref: 'No protein/glucose', status: 'Normal', color: C.green },
                      { param: 'Risk Assessment', current: 'Low Risk', ref: 'Standard care', status: 'Low', color: C.green },
                      { param: 'Smoking Status', current: 'Non-smoker', ref: 'No smoking', status: 'Optimal', color: C.green },
                    ].map((b, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{b.param}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{b.current}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{b.ref}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(b.color)}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── VISITS ─── */}
          {tab === 'visits' && (
            <>
              <div style={S.secTitle}>Scheduled Visits &mdash; Jane Mwangi</div>
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Gestation</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Location</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Clinician</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2025-01-15', gest: '10w+2d', type: 'Booking Visit', loc: 'ANC Clinic 3', clin: 'Midwife N. Muthoni', status: 'Completed', color: C.green },
                      { date: '2025-02-12', gest: '14w+0d', type: 'Dating Scan', loc: 'Ultrasound Suite', clin: 'Sonographer P. Kamau', status: 'Completed', color: C.green },
                      { date: '2025-03-05', gest: '17w+0d', type: 'Screening Visit', loc: 'ANC Clinic 2', clin: 'Midwife N. Muthoni', status: 'Completed', color: C.green },
                      { date: '2025-04-02', gest: '21w+0d', type: 'Anomaly Scan', loc: 'Ultrasound Suite', clin: 'Sonographer P. Kamau', status: 'Completed', color: C.green },
                      { date: '2025-05-10', gest: '26w+0d', type: 'Growth Scan', loc: 'Fetal Medicine', clin: 'Dr. G. Wanjiku', status: 'Completed', color: C.green },
                      { date: '2025-06-15', gest: '31w+0d', type: '28-Week Review', loc: 'ANC Clinic 1', clin: 'Midwife N. Muthoni', status: 'Scheduled', color: C.sky },
                      { date: '2025-07-20', gest: '36w+0d', type: '32-Week Growth', loc: 'Ultrasound Suite', clin: 'Sonographer P. Kamau', status: 'Scheduled', color: C.sky },
                      { date: '2025-08-17', gest: '40w+0d', type: '36-Week Check', loc: 'ANC Clinic 3', clin: 'Midwife N. Muthoni', status: 'Pending', color: C.amber },
                    ].map((v, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{v.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{v.gest}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{v.type}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{v.loc}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{v.clin}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(v.color)}>{v.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Schedule New Visit</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div>
                    <label style={S.label}>Visit Type</label>
                    <select style={S.sel}><option>Growth Scan</option><option>Midwife Check</option><option>Doctor Review</option><option>CTG</option><option>Bloods</option></select>
                  </div>
                  <div>
                    <label style={S.label}>Date</label>
                    <input style={S.input} type="date" />
                  </div>
                  <div>
                    <label style={S.label}>Time</label>
                    <input style={S.input} type="time" />
                  </div>
                  <button style={S.btn(C.sky)}>Schedule</button>
                </div>
              </div>
            </>
          )}

          {/* ─── GROWTH ─── */}
          {tab === 'growth' && (
            <>
              <div style={S.secTitle}>Fetal Growth Intelligence &mdash; Jane Mwangi</div>
              <div style={S.grid4}>
                {[
                  { label: 'EFW Current', value: '1,820g', color: C.navy },
                  { label: 'Centile', value: '45th', color: C.green },
                  { label: 'AFI', value: '12 cm', color: C.green },
                  { label: 'UA Doppler PI', value: '0.85', color: C.green },
                  { label: 'Fundal Height', value: '32 cm', color: C.sky },
                  { label: 'BPD', value: '79 mm', color: C.navy },
                  { label: 'HC', value: '295 mm', color: C.navy },
                  { label: 'AC', value: '275 mm', color: C.navy },
                  { label: 'FL', value: '62 mm', color: C.navy },
                  { label: 'Liquor Volume', value: 'Normal', color: C.green },
                  { label: 'Placental Grade', value: 'Grade 1', color: C.green },
                  { label: 'Presentation', value: 'Cephalic', color: C.sky },
                ].map((g, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{g.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: g.color }}>{g.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Growth Trajectory</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>GA</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>EFW (g)</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Centile</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>AFI</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>UA Doppler</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2025-07-15', ga: '32w+0d', efw: '1,820', cent: '45th', afi: '12 cm', ua: '0.85', trend: 'On Track', color: C.green },
                      { date: '2025-05-10', ga: '26w+0d', efw: '890', cent: '50th', afi: '11 cm', ua: '0.88', trend: 'On Track', color: C.green },
                      { date: '2025-04-02', ga: '21w+0d', efw: '420', cent: '48th', afi: '10 cm', ua: '0.92', trend: 'On Track', color: C.green },
                    ].map((gr, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{gr.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{gr.ga}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{gr.efw}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{gr.cent}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{gr.afi}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{gr.ua}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(gr.color)}>{gr.trend}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── WELLBEING ─── */}
          {tab === 'wellbeing' && (
            <>
              <div style={S.secTitle}>Maternal Wellbeing &mdash; Jane Mwangi</div>
              <div style={S.grid3}>
                {[
                  { domain: 'Physical Activity', status: 'Active', detail: 'Walking 30 min daily', emoji: 'Mild' },
                  { domain: 'Sleep Quality', status: 'Good', detail: '7-8 hours/night, waking 1-2x', emoji: 'Normal' },
                  { domain: 'Stress Level', status: 'Mild', detail: 'Work-related, manageable', emoji: 'Moderate' },
                  { domain: 'Mood (PHQ-9)', status: 'Normal', detail: 'Score 3 — no significant depressive symptoms', emoji: 'Normal' },
                  { domain: 'Pelvic Floor', status: 'Good', detail: 'No incontinence, performing Kegels', emoji: 'Good' },
                  { domain: 'Back Pain', status: 'Mild', detail: 'Lower back ache, responds to paracetamol', emoji: 'Mild' },
                  { domain: 'Nausea/Vomiting', status: 'Resolved', detail: 'Resolved after first trimester', emoji: 'None' },
                  { domain: 'Heartburn', status: 'Moderate', detail: 'Requires antacids PRN, worse at night', emoji: 'Moderate' },
                  { domain: 'Oedema', status: 'Mild', detail: 'Trace ankle oedema, no proteinuria', emoji: 'Mild' },
                  { domain: 'Breastfeeding Prep', status: 'In Progress', detail: 'Attending antenatal breastfeeding classes', emoji: 'On Track' },
                  { domain: 'Perineal Massage', status: 'Not started', detail: 'Will commence at 34 weeks', emoji: 'Pending' },
                  { domain: 'Birth Preparation', status: 'On Track', detail: 'Birth plan discussed, hospital bag ready', emoji: 'On Track' },
                ].map((w, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{w.domain}</div>
                      <span style={S.pill(statusColor(w.status))}>{w.status}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight }}>{w.detail}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Wellbeing Plan</div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Exercise Recommendation</label>
                    <input style={S.input} defaultValue="Walking 30 min, pelvic floor exercises daily" />
                  </div>
                  <div>
                    <label style={S.label}>Sleep Hygiene</label>
                    <input style={S.input} defaultValue="Left lateral position, pillow between knees" />
                  </div>
                  <div>
                    <label style={S.label}>Dietary Adjustment</label>
                    <input style={S.input} defaultValue="Small frequent meals, avoid spicy foods" />
                  </div>
                  <div>
                    <label style={S.label}>Counselling Referral</label>
                    <select style={S.sel}><option>Not indicated</option><option>Routine counselling</option><option>Mental health midwife</option><option>Psychiatry</option></select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── SCREENING ─── */}
          {tab === 'screening' && (
            <>
              <div style={S.secTitle}>Antenatal Screening &mdash; Jane Mwangi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>First Trimester Screening</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { test: 'Combined Screening (PAPP-A + free β-hCG)', result: 'Low Risk 1:5200', date: '2025-03-05', color: C.green },
                      { test: 'Nuchal Translucency', result: '1.2 mm', date: '2025-03-05', color: C.green },
                      { test: 'Nasal Bone', result: 'Present', date: '2025-03-05', color: C.green },
                      { test: 'Trisomy 21 Risk', result: '1:5200', date: '2025-03-05', color: C.green },
                      { test: 'Trisomy 18/13 Risk', result: '<1:10000', date: '2025-03-05', color: C.green },
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{s.test}</span>
                        <span style={{ color: s.color }}>{s.result}</span>
                        <span style={{ color: C.textLight }}>{s.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Second Trimester Screening</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { test: 'Anomaly Scan (20-22w)', result: 'Normal — all systems visualised', date: '2025-04-02', color: C.green },
                      { test: 'Maternal Serum AFP', result: '1.2 MoM', date: '2025-04-02', color: C.green },
                      { test: 'GDM Screening (75g OGTT)', result: 'Normal — 4.2 / 7.1 / 5.8', date: '2025-04-15', color: C.green },
                      { test: 'Fetal Echocardiography', result: 'Not indicated', date: 'N/A', color: C.textLight },
                      { test: 'Cervical Length', result: '38 mm', date: '2025-04-02', color: C.green },
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{s.test}</span>
                        <span style={{ color: s.color }}>{s.result}</span>
                        <span style={{ color: C.textLight }}>{s.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Third Trimester Screening</div>
                <div style={S.grid3}>
                  {[
                    { test: 'GDM Rescreen (if indicated)', status: 'Pending', color: C.amber },
                    { test: 'Group B Strep Screen', status: 'Scheduled at 36w', color: C.sky },
                    { test: 'Growth Scan (32w)', status: 'Completed', color: C.green },
                    { test: 'Growth Scan (36w)', status: 'Pending', color: C.amber },
                    { test: 'Repeat Hb / Ferritin', status: 'Due at 28w', color: C.amber },
                    { test: 'Birth Planning', status: 'In Progress', color: C.amber },
                  ].map((t, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 4 }}>{t.test}</div>
                      <span style={S.badge(t.color)}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── NUTRITION ─── */}
          {tab === 'nutrition' && (
            <>
              <div style={S.secTitle}>Nutrition Intelligence &mdash; Jane Mwangi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Dietary Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { domain: 'Caloric Intake', current: '2,100 kcal', goal: '2,200-2,500 kcal', status: 'Adequate', color: C.green },
                      { domain: 'Protein', current: '68 g/day', goal: '71 g/day', status: 'Near target', color: C.amber },
                      { domain: 'Iron', current: 'Ferrous sulphate 200mg', goal: '27 mg/day', status: 'Supplemented', color: C.green },
                      { domain: 'Folic Acid', current: '5 mg daily', goal: '600 mcg/day', status: 'Supplemented', color: C.green },
                      { domain: 'Vitamin D', current: '400 IU daily', goal: '600 IU/day', status: 'Adequate', color: C.green },
                      { domain: 'Calcium', current: '800 mg/day', goal: '1,000 mg/day', status: 'Below target', color: C.amber },
                      { domain: 'Iodine', current: '150 mcg/day', goal: '220 mcg/day', status: 'Below target', color: C.amber },
                      { domain: 'Hydration', current: '1.8 L/day', goal: '2.3 L/day', status: 'Adequate', color: C.green },
                    ].map((n, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy, minWidth: 80 }}>{n.domain}</span>
                        <span style={{ color: C.text }}>{n.current}</span>
                        <span style={{ color: C.textLight }}>Goal: {n.goal}</span>
                        <span style={S.badge(n.color)}>{n.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Meal Plan &amp; Recommendations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { meal: 'Breakfast', rec: 'Fortified cereal, milk, fruit, iron-rich', timing: '07:30-08:30' },
                      { meal: 'Morning Snack', rec: 'Greek yogurt + nuts + banana', timing: '10:30-11:00' },
                      { meal: 'Lunch', rec: 'Grilled protein + whole grains + vegetables', timing: '12:30-13:30' },
                      { meal: 'Afternoon Snack', rec: 'Hummus + crudités + apple', timing: '15:30-16:00' },
                      { meal: 'Dinner', rec: 'Fish (2x/wk) + sweet potato + greens', timing: '18:30-19:30' },
                      { meal: 'Evening', rec: 'Warm milk + small snack', timing: '21:00-21:30' },
                    ].map((mp, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, fontSize: 10 }}>
                        <div style={{ fontWeight: 600, color: C.navy, marginBottom: 4 }}>{mp.meal}</div>
                        <div style={{ color: C.text }}>{mp.rec}</div>
                        <div style={{ color: C.textLight, marginTop: 2 }}>{mp.timing}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── MEDICATIONS ─── */}
          {tab === 'medications' && (
            <>
              <div style={S.secTitle}>Medication Intelligence &mdash; Jane Mwangi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Ferrous Sulphate</div>
                    <span style={S.pill(C.green)}>200mg daily</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2025-06-01</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>200mg daily</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Indication</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Iron deficiency anaemia</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Response</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>Hb improved from 10.2 to 11.5 g/dL</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Side Effects</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Mild constipation</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Folic Acid</div>
                    <span style={S.pill(C.green)}>5mg daily</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Preconception (Apr 2026)</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>5mg daily</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Indication</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>NTD prevention (previous pregnancy)</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Duration</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>Continue until 12 weeks</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Adherence</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>100%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication Safety — Pregnancy Category</div>
                <div style={S.grid4}>
                  {[
                    { drug: 'Ferrous Sulphate', cat: 'A', safe: 'Safe', color: C.green },
                    { drug: 'Folic Acid', cat: 'A', safe: 'Safe', color: C.green },
                    { drug: 'Paracetamol (PRN)', cat: 'B', safe: 'Safe in pregnancy', color: C.green },
                    { drug: 'Antacids (PRN)', cat: 'B', safe: 'Caution in 3rd trimester', color: C.amber },
                  ].map((ms, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, fontSize: 10 }}>
                      <div style={{ fontWeight: 600, color: C.navy }}>{ms.drug}</div>
                      <div style={{ color: C.textLight, marginTop: 2 }}>Category {ms.cat}</div>
                      <span style={S.badge(ms.color)}>{ms.safe}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── COMPLICATIONS ─── */}
          {tab === 'complications' && (
            <>
              <div style={S.secTitle}>Complication Centers</div>
              <div style={S.grid2}>
                {[
                  { name: 'Pre-eclampsia', risk: 'Low', screening: 'Normal BP, no proteinuria', plan: 'Aspirin 75mg not indicated', color: C.green },
                  { name: 'Gestational Diabetes', risk: 'Low', screening: 'Normal OGTT Apr 2025', plan: 'Rescreen if symptoms develop', color: C.green },
                  { name: 'Preterm Labour', risk: 'Low', screening: 'Cervical length 38mm at 21w', plan: 'Routine monitoring', color: C.green },
                  { name: 'FGR / SGA', risk: 'Low', screening: 'EFW 45th centile', plan: 'Serial growth scans', color: C.green },
                  { name: 'Placenta Praevia', risk: 'Low', screening: 'Placenta posterior, >2cm from os', plan: 'No further action', color: C.green },
                  { name: 'Anaemia', risk: 'Mild', screening: 'Hb 10.2 g/dL resolved with iron', plan: 'Maintain iron supplementation', color: C.amber },
                  { name: 'APH / PPH', risk: 'Low', screening: 'No antepartum bleeding, PPH risk: low', plan: 'Active management of 3rd stage', color: C.green },
                  { name: 'Thromboembolism', risk: 'Low', screening: 'No personal/family history', plan: 'Encourage mobilisation, TED stockings in labour', color: C.green },
                  { name: 'Obstetric Cholestasis', risk: 'Low', screening: 'No pruritus, LFTs normal', plan: 'Monitor if symptoms develop', color: C.green },
                  { name: 'Mental Health', risk: 'Low', screening: 'PHQ-9 3, GAD-7 2', plan: 'Routine midwifery support', color: C.green },
                ].map((c, i) => (
                  <div key={i} style={S.cardH}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{c.name}</div>
                      <span style={S.badge(c.color)}>{c.risk}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}><strong>Screening:</strong> {c.screening}</div>
                    <div style={{ fontSize: 10, color: C.textLight }}><strong>Plan:</strong> {c.plan}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── DIABETES ─── */}
          {tab === 'diabetes' && (
            <>
              <div style={S.secTitle}>Gestational Diabetes &mdash; Jane Mwangi</div>
              <div style={S.grid4}>
                {[
                  { label: 'OGTT Fasting', value: '4.2 mmol/L', color: C.green },
                  { label: 'OGTT 1-Hour', value: '7.1 mmol/L', color: C.green },
                  { label: 'OGTT 2-Hour', value: '5.8 mmol/L', color: C.green },
                  { label: 'Result', value: 'Normal', color: C.green },
                  { label: 'Hba1c If Indicated', value: 'N/A', color: C.textLight },
                  { label: 'Risk Factors', value: 'None', color: C.green },
                  { label: 'Rescreen Due', value: '24-28w if indicated', color: C.amber },
                  { label: 'GDM Diagnosis', value: 'None', color: C.green },
                ].map((d, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: d.color }}>{d.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>GDM Registry — Active Cases</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Patient</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>GA at Dx</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Fasting</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>1-Hour</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>2-Hour</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Treatment</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Grace Akinyi', ga: '26w', fast: '5.8', h1: '11.2', h2: '9.5', tx: 'Metformin + Insulin', status: 'Active', color: C.red },
                      { name: 'Faith Nyambura', ga: '28w', fast: '5.3', h1: '10.8', h2: '9.1', tx: 'Diet + Metformin', status: 'Active', color: C.amber },
                      { name: 'Mary Achieng', ga: '24w', fast: '5.6', h1: '10.2', h2: '8.8', tx: 'Diet controlled', status: 'Active', color: C.amber },
                      { name: 'Esther Kemunto', ga: '30w', fast: '4.8', h1: '9.1', h2: '7.2', tx: 'Diet controlled', status: 'Well controlled', color: C.green },
                    ].map((g, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{g.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{g.ga}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{g.fast}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{g.h1}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{g.h2}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{g.tx}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(g.color)}>{g.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── HYPERTENSION ─── */}
          {tab === 'hypertension' && (
            <>
              <div style={S.secTitle}>Pregnancy Hypertension &mdash; Jane Mwangi</div>
              <div style={S.grid4}>
                {[
                  { label: 'Current SBP', value: '118 mmHg', color: C.green },
                  { label: 'Current DBP', value: '76 mmHg', color: C.green },
                  { label: 'MAP', value: '90 mmHg', color: C.green },
                  { label: 'Proteinuria', value: 'Negative', color: C.green },
                  { label: 'Pre-eclampsia Risk', value: 'Low', color: C.green },
                  { label: 'Aspirin Prophylaxis', value: 'Not indicated', color: C.green },
                  { label: 'Uric Acid', value: '0.22 mmol/L', color: C.green },
                  { label: 'Platelets', value: '245 x10⁹/L', color: C.green },
                  { label: 'ALT', value: '18 U/L', color: C.green },
                  { label: 'Creatinine', value: '62 μmol/L', color: C.green },
                ].map((h, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{h.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: h.color }}>{h.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PIH Risk Surveillance</div>
                <div style={S.grid2}>
                  {[
                    { risk: 'Maternal Age >35', value: 'No (28)', color: C.green },
                    { risk: 'Nulliparity', value: 'No (G2P1)', color: C.green },
                    { risk: 'Multiple Pregnancy', value: 'No', color: C.green },
                    { risk: 'BMI >35', value: 'No (24.2)', color: C.green },
                    { risk: 'Previous Pre-eclampsia', value: 'No', color: C.green },
                    { risk: 'Chronic HTN', value: 'No', color: C.green },
                    { risk: 'Diabetes', value: 'No', color: C.green },
                    { risk: 'Autoimmune Disease', value: 'No', color: C.green },
                    { risk: 'Family History', value: 'No', color: C.green },
                    { risk: 'Interpregnancy Interval >10yr', value: 'No', color: C.green },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                      <span style={{ fontWeight: 500, color: C.navy }}>{r.risk}</span>
                      <span style={S.badge(r.color)}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PIH Registry — Active Cases</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Patient</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>GA</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>BP</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Proteinuria</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Diagnosis</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Treatment</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Sarah Wanjiku', ga: '32w', bp: '158/94', prot: '+2', dx: 'Pre-eclampsia', tx: 'Labetalol 200mg TID', status: 'Inpatient', color: C.red },
                      { name: 'Margaret Nyambura', ga: '28w', bp: '145/90', prot: 'Negative', dx: 'Gestational HTN', tx: 'Methyldopa 500mg BID', status: 'Monitored', color: C.amber },
                      { name: 'Anna Kemunto', ga: '34w', bp: '152/96', prot: '+1', dx: 'Pre-eclampsia', tx: 'Nifedipine SR 30mg daily', status: 'Monitored', color: C.amber },
                      { name: 'Diana Akoth', ga: '36w', bp: '135/85', prot: 'Negative', dx: 'Gestational HTN', tx: 'Methyldopa 250mg BID', status: 'Well controlled', color: C.green },
                    ].map((pih, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{pih.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{pih.ga}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{pih.bp}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{pih.prot}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{pih.dx}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{pih.tx}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(pih.color)}>{pih.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── BIRTH ─── */}
          {tab === 'birth' && (
            <>
              <div style={S.secTitle}>Birth Plan &mdash; Jane Mwangi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Birth Preferences</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { category: 'Place of Birth', preference: 'Labour Ward — District Hospital', status: 'Confirmed' },
                      { category: 'Mode of Delivery', preference: 'Vaginal — spontaneous or induced', status: 'Preferred' },
                      { category: 'Pain Relief', preference: 'Gas & air, TENS, pethidine, epidural if desired', status: 'Discussed' },
                      { category: 'Birth Companion', preference: 'Husband (Peter Mwangi)', status: 'Confirmed' },
                      { category: 'Skin-to-Skin', preference: 'Immediate skin-to-skin after delivery', status: 'Requested' },
                      { category: 'Delayed Cord Clamping', preference: 'Yes — at least 1 minute', status: 'Requested' },
                      { category: 'Third Stage', preference: 'Active management with syntocinon', status: 'Discussed' },
                      { category: 'Episiotomy', preference: 'Only if clinically indicated', status: 'Discussed' },
                      { category: 'Feeding', preference: 'Exclusive breastfeeding', status: 'Plan' },
                      { category: 'Vitamin K', preference: 'Yes — intramuscular', status: 'Consented' },
                      { category: 'Newborn Exam', preference: 'Within 72 hours', status: 'Scheduled' },
                      { category: 'Special Requests', preference: 'Low lighting, minimal intervention', status: 'Noted' },
                    ].map((bp, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{bp.category}</span>
                        <span style={{ color: C.text }}>{bp.preference}</span>
                        <span style={S.badge(C.green)}>{bp.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Contingency Plans</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { scenario: 'Failure to progress', plan: 'ARM + syntocinon augmentation', icon: Syringe },
                        { scenario: 'Fetal distress', plan: 'FSE monitoring, proceed to C-section if needed', icon: Monitor },
                        { scenario: 'PPH', plan: 'Active management, oxytocin, tranexamic acid, uterine massage', icon: AlertTriangle },
                        { scenario: 'Emergency C-section', plan: 'Category 1/2 CS under spinal/general anaesthesia', icon: Ambulance },
                        { scenario: 'NICU admission', plan: 'Paediatric team present, transfer to NICU if needed', icon: Bed },
                      ].map((cp, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                          <cp.icon size={16} color={C.sky} style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{cp.scenario}</div>
                            <div style={{ fontSize: 10, color: C.textLight }}>{cp.plan}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Birth Team</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { role: 'Lead Midwife', name: 'Nancy Muthoni' },
                        { role: 'Obstetrician', name: 'Dr. Grace Wanjiku' },
                        { role: 'Anaesthetist (if epidural/CS)', name: 'Dr. Samuel Kiprop' },
                        { role: 'Paediatrician', name: 'Dr. Sarah Wangari' },
                        { role: 'Lactation Consultant', name: 'Faith Nyambura' },
                      ].map((bt, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                          <span style={{ fontWeight: 600, color: C.navy }}>{bt.role}</span>
                          <span style={{ color: C.text }}>{bt.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── POSTNATAL ─── */}
          {tab === 'postnatal' && (
            <>
              <div style={S.secTitle}>Postnatal Plan &mdash; Jane Mwangi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Immediate Postnatal (Days 1-3)</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Domain</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Plan</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { domain: 'Vital Signs Monitoring', plan: '4-hourly BP, pulse, temp for 24h', status: 'Protocol', color: C.sky },
                        { domain: 'Blood Loss Monitoring', plan: 'Track lochia, pad count, fundal height', status: 'Protocol', color: C.sky },
                        { domain: 'Pain Management', plan: 'Paracetamol 1g QDS, ibuprofen 400mg TDS PRN', status: 'Standard', color: C.green },
                        { domain: 'Breastfeeding Support', plan: 'Lactation consultant daily, latch assessment', status: 'Scheduled', color: C.amber },
                        { domain: 'Thromboprophylaxis', plan: 'TED stockings, early mobilisation', status: 'Standard', color: C.green },
                        { domain: 'Perineal Care', plan: 'Ice packs, sitz baths, peri-bottle', status: 'Standard', color: C.green },
                      ].map((pn, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 6px', fontWeight: 600 }}>{pn.domain}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}>{pn.plan}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(pn.color)}>{pn.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Ongoing Postnatal (Days 4-42)</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Domain</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Plan</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Timing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { domain: 'Wound Check (if CS)', plan: 'Review wound at day 5-7', timing: 'Day 5-7' },
                        { domain: 'Hb Check', plan: 'Repeat Hb at day 2 and day 42', timing: 'Day 2 + Day 42' },
                        { domain: 'Mood Assessment', plan: 'EPDS screening at 6 weeks', timing: 'Day 42' },
                        { domain: 'Contraception Counselling', plan: 'Discuss options at 6-week visit', timing: 'Day 42' },
                        { domain: 'Baby Immunisations', plan: 'BCG + OPV at birth, HepB at 6w', timing: 'Birth + 6w' },
                        { domain: 'Newborn Hearing Screen', plan: 'OAE screening', timing: 'Within 72h' },
                        { domain: 'Cord Care', plan: 'Dry care, monitor for infection', timing: 'Daily' },
                        { domain: '6-Week Postnatal Check', plan: 'Mother + baby review', timing: '6 weeks' },
                      ].map((pn, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 6px', fontWeight: 600 }}>{pn.domain}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}>{pn.plan}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{pn.timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <>
              <div style={S.secTitle}>Home Monitoring &mdash; Jane Mwangi</div>
              <div style={S.grid4}>
                {[
                  { label: 'Fetal Movements', value: '10+/2 hrs', trend: 'Normal', color: C.green },
                  { label: 'Blood Pressure', value: '118/76 mmHg', trend: 'Stable', color: C.green },
                  { label: 'Weight Gain', value: '+8.2 kg total', trend: 'On Track', color: C.green },
                  { label: 'Urine Protein', value: 'Negative', trend: 'Normal', color: C.green },
                  { label: 'Contractions', value: 'None', trend: 'Normal', color: C.green },
                  { label: 'Vaginal Loss', value: 'None', trend: 'Normal', color: C.green },
                  { label: 'Mood (PHQ-9)', value: '3', trend: 'Stable', color: C.green },
                  { label: 'Symphysial Pain', value: 'Mild', trend: 'Managing', color: C.amber },
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
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Home Monitoring Alerts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.green}08`, border: `1px solid ${C.green}20`, fontSize: 10 }}>
                    <span style={{ fontWeight: 600, color: C.navy }}>Fetal Movements: </span><span style={{ color: C.text }}>Normal pattern — daily kick counts documented</span>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, fontSize: 10 }}>
                    <span style={{ fontWeight: 600, color: C.navy }}>Weight Gain: </span><span style={{ color: C.text }}>Gaining 0.3 kg/week — within recommended range</span>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20`, fontSize: 10 }}>
                    <span style={{ fontWeight: 600, color: C.navy }}>Symphysial Pain: </span><span style={{ color: C.text }}>Mild SPD, managing with physiotherapy exercises</span>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Connected Devices</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { device: 'BP Monitor (Omron)', status: 'Connected', color: C.green },
                    { device: 'Weight Scale', status: 'Connected', color: C.green },
                    { device: 'Activity Tracker', status: 'Connected', color: C.green },
                    { device: 'CTG Monitor (Clinic)', status: 'Scheduled weekly', color: C.amber },
                  ].map(d => (
                    <div key={d.device} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                      <span style={{ color: C.text }}>{d.device}</span>
                      <span style={S.badge(d.color)}>{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── TEAM ─── */}
          {tab === 'team' && (
            <>
              <div style={S.secTitle}>Multidisciplinary Team &mdash; Antenatal</div>
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Role</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Contact</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((tm, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{tm.role}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{tm.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>Ext. {2000 + i}</td>
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
              <div style={S.secTitle}>Antenatal Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'Total Booked', count: '1,876', color: C.sky },
                  { label: 'Active Pregnancies', count: '342', color: C.purple },
                  { label: 'Deliveries This Month', count: '48', color: C.green },
                  { label: 'High Risk Pregnancies', count: '89', color: C.red },
                  { label: 'GDM Positive', count: '28', color: C.amber },
                  { label: 'PIH / Pre-eclampsia', count: '14', color: C.red },
                  { label: 'Twins / Multiples', count: '12', color: C.amber },
                  { label: 'Maternal Deaths', count: '0', color: C.green },
                ].map((rg, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={S.statValue}>{rg.count}</div>
                    <div style={S.statLabel}>{rg.label}</div>
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
                    <select style={S.sel}><option>All Trimester</option><option>First</option><option>Second</option><option>Third</option></select>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>MRN</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>GA</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Parity</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Risk</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Next Visit</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Jane Mwangi', mrn: 'AN-001', ga: '24w+3d', parity: 'G2P1', risk: 'Low', next: '15-Jun-2025', status: 'Active' },
                      { name: 'Grace Akinyi', mrn: 'AN-012', ga: '32w+1d', parity: 'G1P0', risk: 'High', next: '22-Jun-2025', status: 'High Risk' },
                      { name: 'Faith Nyambura', mrn: 'AN-024', ga: '28w+0d', parity: 'G3P2', risk: 'High', next: '18-Jun-2025', status: 'GDM' },
                      { name: 'Mary Achieng', mrn: 'AN-036', ga: '26w+5d', parity: 'G2P1', risk: 'High', next: '20-Jun-2025', status: 'Anaemia' },
                      { name: 'Esther Kemunto', mrn: 'AN-048', ga: '30w+2d', parity: 'G1P0', risk: 'Low', next: '25-Jun-2025', status: 'Active' },
                      { name: 'Sarah Wanjiku', mrn: 'AN-055', ga: '32w+0d', parity: 'G2P0', risk: 'High', next: 'Inpatient', status: 'Pre-eclampsia' },
                    ].map((rp, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{rp.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{rp.mrn}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.ga}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.parity}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(rp.risk === 'High' ? C.red : C.green)}>{rp.risk}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{rp.next}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(statusColor(rp.status))}>{rp.status}</span></td>
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
              <div style={S.secTitle}>Quality Indicators &mdash; Antenatal</div>
              <div style={S.grid4}>
                {[
                  { metric: 'Booking <12 Weeks', value: '68%', target: '90%', trend: '↑', color: C.amber },
                  { metric: 'Anomaly Scan Rate', value: '95%', target: '98%', trend: '↑', color: C.green },
                  { metric: 'GDM Screening Rate', value: '78%', target: '90%', trend: '↑', color: C.amber },
                  { metric: 'Hb Screening (28w)', value: '86%', target: '95%', trend: '↑', color: C.amber },
                  { metric: 'Caesarean Section Rate', value: '24%', target: '15-25%', trend: '→', color: C.green },
                  { metric: 'Preterm Birth Rate', value: '8.2%', target: '<10%', trend: '→', color: C.green },
                  { metric: 'Stillbirth Rate', value: '3.2/1000', target: '<4/1000', trend: '↓', color: C.green },
                  { metric: 'Maternal Mortality', value: '0', target: '0', trend: 'Stable', color: C.green },
                  { metric: 'Postnatal Check (6w)', value: '72%', target: '85%', trend: '↑', color: C.amber },
                  { metric: 'Breastfeeding Initiation', value: '88%', target: '90%', trend: '↑', color: C.green },
                ].map((qi, i) => (
                  <div key={i} style={{ ...S.card, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{qi.metric}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{qi.value}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
                      <span style={{ color: C.textLight }}>Target: {qi.target}</span>
                      <span style={{ color: qi.color, fontWeight: 600 }}>{qi.trend}</span>
                    </div>
                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: C.border, marginTop: 8 }}>
                      <div style={{ width: `${parseInt(qi.value) > 100 ? 100 : parseInt(qi.value)}%`, height: 4, borderRadius: 2, background: qi.color }} />
                    </div>
                    <span style={{ ...S.badge(qi.value >= '0' && parseFloat(qi.value) >= parseFloat(qi.target.split('-')[0]) ? C.green : qi.color), marginTop: 6, display: 'inline-block' }}>
                      {parseInt(qi.value) >= parseInt(qi.target) ? 'On Target' : 'Below Target'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Improvement Initiatives</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: 'Early Booking Enhancement', desc: 'Community outreach for booking before 12 weeks', progress: '55%', color: C.sky },
                    { title: 'GDM Screening Improvement', desc: 'Universal OGTT at 24-28 weeks for all patients', progress: '72%', color: C.amber },
                    { title: 'Postnatal Follow-up Programme', desc: 'Automated SMS reminders for 6-week check', progress: '48%', color: C.green },
                    { title: 'Breastfeeding Support Expansion', desc: 'Lactation consultant coverage 7 days/week', progress: '80%', color: C.green },
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
            </>
          )}

          {/* ─── PORTAL ─── */}
          {tab === 'portal' && (
            <>
              <div style={S.secTitle}>Patient Portal &mdash; Jane Mwangi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pregnancy Summary</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Jane Mwangi, 28 years, G2P1, currently 24w+3d. Low risk pregnancy with normal anomaly scan and OGTT. Iron deficiency corrected.</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Appointments</div>
                  <div style={{ fontSize: 11, color: C.text }}>Next: 15-Jun-2025 — 28-Week Review with Midwife</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Last seen: 10-May-2025 — Growth Scan</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication Reminders</div>
                  <div style={{ fontSize: 11, color: C.text }}>Ferrous Sulphate 200mg &mdash; daily with food</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Folic Acid 5mg &mdash; daily until 12 weeks</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fetal Movement Diary</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Active — 10+ movements in 2 hours daily</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Birth Plan Summary</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Vaginal delivery preferred, skin-to-skin, delayed cord clamping, exclusive breastfeeding</div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Today&rsquo;s Status</div>
                    <div style={{ textAlign: 'center', padding: 16 }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${C.green}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={32} color={C.green} />
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Low Risk</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>24w+3d &mdash; all parameters normal</div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Educational Content</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { title: 'Pregnancy Nutrition', desc: 'Eating well for you and baby', icon: BookOpen, color: C.sky },
                        { title: 'Exercise in Pregnancy', desc: 'Safe activity guide', icon: Activity, color: C.sky },
                        { title: 'Breastfeeding Basics', desc: 'Getting started with feeding', icon: Heart, color: C.sky },
                        { title: 'Warning Signs', desc: 'When to call your midwife', icon: AlertTriangle, color: C.sky },
                      ].map(e => (
                        <div key={e.title} style={{ padding: '12px', borderRadius: 8, background: C.panel, cursor: 'pointer' }}>
                          <e.icon size={20} color={e.color} />
                          <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginTop: 6 }}>{e.title}</div>
                          <div style={{ fontSize: 9, color: C.textLight }}>{e.desc}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Progress Badges</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={S.pill(C.green)}>Booking Complete</span>
                        <span style={S.pill(C.green)}>Anomaly Scan Done</span>
                        <span style={S.pill(C.green)}>OGTT Normal</span>
                        <span style={S.pill(C.amber)}>Birth Plan Pending</span>
                      </div>
                    </div>
                    <div style={S.divider} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Communication</div>
                    <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical', marginBottom: 8 }} placeholder="Send a secure message to your midwife..." />
                    <button style={S.btn(C.sky)}><MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Send Message</button>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}
