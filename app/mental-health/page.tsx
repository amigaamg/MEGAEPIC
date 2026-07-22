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
    case 'Active': case 'Controlled': case 'On Track': case 'Available': case 'Good': case 'Normal': case 'Full': case 'Independent': case 'Eligible': case 'Complete': case 'Stable': case 'Excellent': case 'None': case 'Stable': case 'Remission': case 'Improving': return C.green
    case 'Fair': case 'Pending': case 'Needs Attention': case 'Moderate': case 'Busy': case 'Low': case 'Mild': case 'Limited': case 'Partial': case 'Mild': case 'Watchful': return C.amber
    case 'Poor': case 'Behind': case 'Critical': case 'Uncontrolled': case 'High': case 'Severe': case 'Unavailable': case 'No': case 'N/A': case 'Active': case 'Relapse': return C.red
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Mental Health Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Psychiatric Snapshot', icon: Brain },
  { id: 'timeline', label: 'Mental Health Timeline', icon: Clock },
  { id: 'phenotype', label: 'Psychiatric Phenotype', icon: Brain },
  { id: 'depression', label: 'Depression Intelligence', icon: Heart },
  { id: 'anxiety', label: 'Anxiety Intelligence', icon: Wind },
  { id: 'bipolar', label: 'Bipolar Disorder', icon: TrendingUp },
  { id: 'psychosis', label: 'Psychosis & Schizophrenia Spectrum', icon: Shield },
  { id: 'ptsd', label: 'PTSD & Trauma', icon: AlertTriangle },
  { id: 'ocd', label: 'OCD Intelligence', icon: Activity },
  { id: 'addictions', label: 'Addiction Medicine', icon: Syringe },
  { id: 'eating', label: 'Eating Disorders', icon: Weight },
  { id: 'child', label: 'Child & Adolescent', icon: Users },
  { id: 'geriatric', label: 'Geriatric Psychiatry', icon: User },
  { id: 'crisis', label: 'Crisis Intervention', icon: Ambulance },
  { id: 'therapy', label: 'Therapy Intelligence', icon: MessageSquare },
  { id: 'medications', label: 'Medication Intelligence', icon: Pill },
  { id: 'home', label: 'Home Monitoring', icon: Monitor },
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
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

const timelineEvents = [
  { date: '2012-03-10', title: 'First Depressive Episode', details: 'Presented with low mood, anhedonia, sleep disturbance, and appetite changes. PHQ-9 score 22.', color: C.red, icon: AlertTriangle },
  { date: '2013-06-22', title: 'Anxiety Symptoms Emerge', details: 'Generalised anxiety with excessive worry, muscle tension, restlessness. GAD-7 score 18.', color: C.amber, icon: Wind },
  { date: '2014-09-15', title: 'Diagnosis Established', details: 'Confirmed diagnosis of Major Depressive Disorder and Generalised Anxiety Disorder (comorbid).', color: C.sky, icon: FileText },
  { date: '2015-04-01', title: 'SSRI Initiated', details: 'Sertraline 50mg daily started. Initial mild nausea, titrated to 100mg over 4 weeks.', color: C.purple, icon: Pill },
  { date: '2016-11-10', title: 'CBT Programme Started', details: 'Weekly Cognitive Behavioural Therapy sessions commenced. Focus on cognitive restructuring and behavioural activation.', color: C.green, icon: MessageSquare },
  { date: '2018-02-20', title: 'GAD Diagnosis Refined', details: 'Formal GAD diagnosis confirmed per DSM-5 criteria. GAD-7 improved to 12.', color: C.sky, icon: Brain },
  { date: '2019-07-15', title: 'Medication Optimisation', details: 'Sertraline increased to 200mg daily. Mild improvement in depressive symptoms. PHQ-9 14.', color: C.amber, icon: TrendingUp },
  { date: '2020-05-01', title: 'Telepsychiatry Transition', details: 'Converted to remote care during COVID-19 pandemic. Maintained monthly virtual reviews.', color: C.sky, icon: Monitor },
  { date: '2021-09-30', title: 'Depressive Relapse', details: 'Significant deterioration triggered by work stress. PHQ-9 24. Augmented with CBT booster sessions.', color: C.red, icon: AlertTriangle },
  { date: '2022-03-15', title: 'TMS Therapy Course', details: 'Transcranial Magnetic Stimulation initiated for treatment-resistant depression. 30 sessions over 6 weeks.', color: C.purple, icon: Activity },
  { date: '2023-08-01', title: 'Sustained Remission', details: 'PHQ-9 4, GAD-7 3. Returned to full-time work. Tapered to maintenance therapy.', color: C.green, icon: CheckCircle },
  { date: '2024-06-10', title: 'Mindfulness Programme', details: 'Enrolled in Mindfulness-Based Relapse Prevention. Eight-week structured programme completed.', color: C.green, icon: Heart },
  { date: '2025-01-20', title: 'Maintenance Phase', details: 'Stable on Sertraline 150mg. Monthly supportive therapy. PHQ-9 3, GAD-7 2. Full functional recovery.', color: C.green, icon: CheckCircle },
]

const suicideScreenings = [
  { date: '2025-06-01', tool: 'C-SSRS', result: 'Negative', risk: 'Low', action: 'Routine monitoring' },
  { date: '2025-03-15', tool: 'C-SSRS', result: 'Negative', risk: 'Low', action: 'Routine monitoring' },
  { date: '2024-12-10', tool: 'C-SSRS', result: 'Negative', risk: 'Low', action: 'Routine monitoring' },
  { date: '2024-09-05', tool: 'C-SSRS', result: 'Negative', risk: 'Low', action: 'Routine monitoring' },
  { date: '2022-03-20', tool: 'C-SSRS', result: 'Passive SI', risk: 'Moderate', action: 'Safety plan updated' },
]

const phq9Scores = [
  { date: '2025-07-01', score: 3, severity: 'None' },
  { date: '2025-04-01', score: 4, severity: 'Minimal' },
  { date: '2025-01-15', score: 3, severity: 'None' },
  { date: '2024-10-01', score: 5, severity: 'Minimal' },
  { date: '2024-07-01', score: 6, severity: 'Mild' },
  { date: '2024-04-01', score: 8, severity: 'Mild' },
]

const gad7Scores = [
  { date: '2025-07-01', score: 2, severity: 'None' },
  { date: '2025-04-01', score: 3, severity: 'Minimal' },
  { date: '2025-01-15', score: 2, severity: 'None' },
  { date: '2024-10-01', score: 4, severity: 'Minimal' },
  { date: '2024-07-01', score: 6, severity: 'Mild' },
]

const teamMembers = [
  { role: 'Consultant Psychiatrist', name: 'Dr. Faith Wanjiku', status: 'Available' },
  { role: 'Clinical Psychologist', name: 'Dr. Michael Omondi', status: 'Available' },
  { role: 'Psychiatric Nurse', name: 'Grace Muthoni', status: 'Available' },
  { role: 'Social Worker', name: 'James Kiprop', status: 'Busy' },
  { role: 'Occupational Therapist', name: 'Nancy Achieng', status: 'Available' },
  { role: 'Art Therapist', name: 'Sarah Wangari', status: 'Available' },
  { role: 'Addiction Counsellor', name: 'Peter Kamau', status: 'Busy' },
  { role: 'Psychotherapist', name: 'Dr. Ben Ochieng', status: 'Available' },
  { role: 'Child & Adolescent Psychiatrist', name: 'Dr. Mary Atieno', status: 'Available' },
  { role: 'Geriatric Psychiatrist', name: 'Dr. Samuel Njenga', status: 'Available' },
  { role: 'Crisis Intervention Specialist', name: 'Esther Wambui', status: 'Available' },
  { role: 'Mental Health Educator', name: 'David Mwangi', status: 'Available' },
]

export default function MentalHealthWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Mental Health, Psychiatry &amp; Behavioral Intelligence Center &mdash; Volume XI-J</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>MH</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>MHBIC</div>
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
              <div style={S.secTitle}>Mental Health Dashboard</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={20} color={C.sky} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Grace Akinyi</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <div style={{ fontSize: 12, color: C.text }}>34 Years / Female</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <span style={S.pill(C.sky)}>Depressive Disorder</span>
                <span style={S.pill(C.amber)}>GAD</span>
                <span style={S.pill(C.green)}>Stable</span>
                <div style={{ fontSize: 11, color: C.textLight }}>Duration: 13 Years</div>
                <div style={{ fontSize: 11, color: C.textLight }}>PHQ-9: 3</div>
                <div style={{ fontSize: 11, color: C.textLight }}>GAD-7: 2</div>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Users size={24} color={C.sky} />
                  <div style={S.statValue}>2,847</div>
                  <div style={S.statLabel}>Total MH Patients</div>
                </div>
                <div style={S.statCard}>
                  <Heart size={24} color={C.purple} />
                  <div style={S.statValue}>1,024</div>
                  <div style={S.statLabel}>Depression</div>
                </div>
                <div style={S.statCard}>
                  <Wind size={24} color={C.amber} />
                  <div style={S.statValue}>876</div>
                  <div style={S.statLabel}>Anxiety</div>
                </div>
                <div style={S.statCard}>
                  <TrendingUp size={24} color={C.red} />
                  <div style={S.statValue}>312</div>
                  <div style={S.statLabel}>Bipolar</div>
                </div>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Shield size={24} color={C.purple} />
                  <div style={S.statValue}>198</div>
                  <div style={S.statLabel}>Psychosis</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.amber} />
                  <div style={S.statValue}>245</div>
                  <div style={S.statLabel}>PTSD</div>
                </div>
                <div style={S.statCard}>
                  <Activity size={24} color={C.sky} />
                  <div style={S.statValue}>112</div>
                  <div style={S.statLabel}>OCD</div>
                </div>
                <div style={S.statCard}>
                  <Syringe size={24} color={C.red} />
                  <div style={S.statValue}>178</div>
                  <div style={S.statLabel}>Addictions</div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Alerts</div>
                <div style={S.grid2}>
                  {[
                    { title: 'Suicidal Ideation Risk', patient: 'Peter Ochieng', detail: 'C-SSRS moderate risk, last reviewed 2 days ago', color: C.red },
                    { title: 'Medication Non-Adherence', patient: 'Grace Njeri', detail: 'Missed 7 consecutive days of antipsychotic', color: C.amber },
                    { title: 'Deteriorating PHQ-9', patient: 'Samuel Kiprop', detail: 'PHQ-9 rose from 8 to 19 in 4 weeks', color: C.red },
                    { title: 'Missed Appointment', patient: 'Faith Nyambura', detail: 'No-show for 2 consecutive therapy sessions', color: C.amber },
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
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Assessment</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Medication Review</button>
                  <button style={S.btn(C.purple)}><Brain size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> PHQ-9 / GAD-7</button>
                  <button style={S.btnO}><MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Therapy Note</button>
                </div>
              </div>
            </>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <>
              <div style={S.secTitle}>Psychiatric Snapshot &mdash; Grace Akinyi</div>
              <div style={S.grid4}>
                {[
                  { label: 'Primary Diagnosis', value: 'MDD, Recurrent', color: C.sky },
                  { label: 'Secondary Diagnosis', value: 'GAD', color: C.amber },
                  { label: 'Current PHQ-9', value: '3 (Remission)', color: C.green },
                  { label: 'Current GAD-7', value: '2 (Remission)', color: C.green },
                  { label: 'Medication', value: 'Sertraline 150mg', color: C.green },
                  { label: 'Therapy', value: 'CBT (monthly)', color: C.green },
                  { label: 'Suicide Risk', value: 'Low', color: C.green },
                  { label: 'Functional Status', value: 'Full', color: C.green },
                  { label: 'Employment', value: 'Full-time', color: C.green },
                  { label: 'CGI-S', value: '1 (Normal)', color: C.green },
                  { label: 'GAF', value: '85', color: C.green },
                  { label: 'Last Review', value: '1 week ago', color: C.green },
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
              <div style={S.secTitle}>Mental Health Timeline &mdash; Grace Akinyi</div>
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
              <div style={S.secTitle}>Psychiatric Phenotype &mdash; Grace Akinyi</div>
              <div style={S.grid3}>
                {[
                  { label: 'MDD Specifier', value: 'Recurrent, Moderate', detail: 'Multiple lifetime episodes with good inter-episode recovery', color: C.amber },
                  { label: 'Anxiety Specifier', value: 'Generalised', detail: 'Chronic excessive worry across multiple domains', color: C.amber },
                  { label: 'Treatment Response', value: 'Good', detail: 'Responded well to SSRIs and CBT combination', color: C.green },
                  { label: 'Treatment Resistance', value: 'Partial', detail: 'Required augmentation with TMS for refractory episode', color: C.amber },
                  { label: 'Suicide Risk Category', value: 'Low', detail: 'No recent SI, protective factors present', color: C.green },
                  { label: 'Functional Impact', value: 'Mild', detail: 'Currently fully functional, previous episodic impairment', color: C.green },
                  { label: 'Psychotic Features', value: 'Absent', detail: 'No history of psychotic symptoms', color: C.green },
                  { label: 'Seasonal Pattern', value: 'Probable', detail: 'Tendency for worsening in winter months', color: C.amber },
                  { label: 'Peripartum Onset', value: 'No', detail: 'First episode preceded peripartum period', color: C.green },
                  { label: 'Atypical Features', value: 'No', detail: 'Typical melancholic features during episodes', color: C.green },
                  { label: 'Rapid Cycling', value: 'No', detail: 'No evidence of mood episode acceleration', color: C.green },
                  { label: 'Substance-Induced', value: 'No', detail: 'No causal substance use identified', color: C.green },
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

          {/* ─── DEPRESSION ─── */}
          {tab === 'depression' && (
            <>
              <div style={S.secTitle}>Depression Intelligence Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Current PHQ-9', value: '3', status: 'Remission', color: C.green },
                  { label: 'PHQ-9 Baseline', value: '22', status: 'Severe', color: C.red },
                  { label: 'Episodes (Lifetime)', value: '4', status: 'Recurrent', color: C.amber },
                  { label: 'Episode Duration', value: '8-12 weeks', status: 'Moderate', color: C.amber },
                  { label: 'Treatment Lines', value: '3', status: 'SSRI, CBT, TMS', color: C.sky },
                  { label: 'Current Regimen', value: 'Sertraline 150mg', status: 'Effective', color: C.green },
                  { label: 'Relapse Risk', value: 'Moderate', status: 'Need vigilance', color: C.amber },
                  { label: 'Functional Recovery', value: 'Complete', status: 'Full-time work', color: C.green },
                ].map((d, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${d.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{d.value}</div>
                    <div style={{ marginTop: 6 }}><span style={S.pill(d.color)}>{d.status}</span></div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PHQ-9 Longitudinal Scores</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Score</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phq9Scores.map((p, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{p.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: 16, fontWeight: 700, color: p.score <= 4 ? C.green : p.score <= 9 ? C.amber : C.red }}>{p.score}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(p.score <= 4 ? C.green : p.score <= 9 ? C.amber : C.red)}>{p.severity}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── ANXIETY ─── */}
          {tab === 'anxiety' && (
            <>
              <div style={S.secTitle}>Anxiety Intelligence Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Current GAD-7', value: '2', status: 'Remission', color: C.green },
                  { label: 'GAD-7 Peak', value: '18', status: 'Severe', color: C.red },
                  { label: 'Panic Attacks', value: '0/mo', status: 'None', color: C.green },
                  { label: 'Avoidance', value: 'Minimal', status: 'Improving', color: C.green },
                  { label: 'Worry Domains', value: 'Health, Work', status: 'Controlled', color: C.amber },
                  { label: 'Somatic Symptoms', value: 'Mild tension', status: 'Occasional', color: C.amber },
                  { label: 'Sleep Quality', value: 'Good', status: '7h/night', color: C.green },
                  { label: 'Coping Strategy', value: 'CBT, Mindfulness', status: 'Effective', color: C.green },
                ].map((a, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${a.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{a.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{a.value}</div>
                    <div style={{ marginTop: 6 }}><span style={S.pill(a.color)}>{a.status}</span></div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>GAD-7 Longitudinal Scores</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Score</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gad7Scores.map((g, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{g.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: 16, fontWeight: 700, color: g.score <= 4 ? C.green : g.score <= 9 ? C.amber : C.red }}>{g.score}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(g.score <= 4 ? C.green : g.score <= 9 ? C.amber : C.red)}>{g.severity}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── BIPOLAR ─── */}
          {tab === 'bipolar' && (
            <>
              <div style={S.secTitle}>Bipolar Disorder Intelligence Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Type', value: 'Bipolar I', color: C.red },
                  { label: 'Mood State', value: 'Euthymic', color: C.green },
                  { label: 'Last Episode', value: 'Mania (2024)', color: C.amber },
                  { label: 'Episode Frequency', value: '2/yr', color: C.amber },
                  { label: 'YMRS Score', value: '4', color: C.green },
                  { label: 'Medication', value: 'Lithium + Olanzapine', color: C.green },
                  { label: 'Lithium Level', value: '0.8 mmol/L', color: C.green },
                  { label: 'Rapid Cycling', value: 'No', color: C.green },
                ].map((b, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${b.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{b.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{b.value}</div>
                    <div style={{ marginTop: 6 }}><span style={S.pill(b.color)}>{b.color === C.green ? 'Controlled' : 'Monitor'}</span></div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Episode History</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Duration</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Severity</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Hospitalisation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2024-08-15', type: 'Mania', dur: '4 weeks', sev: 'Severe', hosp: 'Yes' },
                      { date: '2024-02-10', type: 'Depression', dur: '6 weeks', sev: 'Moderate', hosp: 'No' },
                      { date: '2023-06-20', type: 'Hypomania', dur: '10 days', sev: 'Mild', hosp: 'No' },
                      { date: '2022-11-05', type: 'Mania', dur: '3 weeks', sev: 'Severe', hosp: 'Yes' },
                    ].map((ep, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{ep.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(ep.type === 'Mania' ? C.red : ep.type === 'Depression' ? C.sky : C.amber)}>{ep.type}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{ep.dur}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{ep.sev}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(ep.hosp === 'Yes' ? C.red : C.green)}>{ep.hosp}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── PSYCHOSIS ─── */}
          {tab === 'psychosis' && (
            <>
              <div style={S.secTitle}>Psychosis &amp; Schizophrenia Spectrum Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Diagnosis', value: 'Schizophrenia', color: C.red },
                  { label: 'PANSS Total', value: '62', status: 'Mild', color: C.amber },
                  { label: 'Positive Symptoms', value: '14', status: 'Mild', color: C.amber },
                  { label: 'Negative Symptoms', value: '18', status: 'Moderate', color: C.amber },
                  { label: 'General Psychopath', value: '30', status: 'Mild', color: C.amber },
                  { label: 'Antipsychotic', value: 'Aripiprazole 15mg', status: 'Effective', color: C.green },
                  { label: 'Adherence', value: '90%', status: 'Good', color: C.green },
                  { label: 'Functional Level', value: 'Independent', status: 'Stable', color: C.green },
                ].map((p, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${p.color || C.text}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{p.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{p.value}</div>
                    {p.status && <div style={{ marginTop: 6 }}><span style={S.pill(p.color || C.text)}>{p.status}</span></div>}
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Domain</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Current</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Previous</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { domain: 'Hallucinations', cur: 'Auditory, 1x/wk', prev: 'Daily', trend: 'Improving', color: C.green },
                      { domain: 'Delusions', cur: 'None', prev: 'Persecutory', trend: 'Resolved', color: C.green },
                      { domain: 'Disorganisation', cur: 'Mild', prev: 'Moderate', trend: 'Improving', color: C.amber },
                      { domain: 'Negative Symptoms', cur: 'Social withdrawal', prev: 'Avolition', trend: 'Stable', color: C.amber },
                      { domain: 'Cognition', cur: 'Mild impairment', prev: 'Moderate', trend: 'Improving', color: C.amber },
                      { domain: 'Insight', cur: 'Partial', prev: 'Poor', trend: 'Improving', color: C.amber },
                    ].map((d, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{d.domain}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{d.cur}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{d.prev}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(d.color)}>{d.trend}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── PTSD ─── */}
          {tab === 'ptsd' && (
            <>
              <div style={S.secTitle}>PTSD &amp; Trauma Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Trauma Type', value: 'Motor Vehicle Accident', color: C.red },
                  { label: 'PCL-5 Score', value: '18', status: 'Subthreshold', color: C.amber },
                  { label: 'Time Since Trauma', value: '5 years', color: C.text },
                  { label: 'Re-experiencing', value: 'Mild', status: 'Occasional nightmares', color: C.amber },
                  { label: 'Avoidance', value: 'Minimal', status: 'Improving', color: C.green },
                  { label: 'Hyperarousal', value: 'Mild', status: 'Startle intact', color: C.amber },
                  { label: 'Dissociation', value: 'None', status: 'Absent', color: C.green },
                  { label: 'Treatment', value: 'Trauma-Focused CBT', status: 'Weekly', color: C.green },
                ].map((p, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${p.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{p.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{p.value}</div>
                    {p.status && <div style={{ marginTop: 6 }}><span style={S.pill(p.color)}>{p.status}</span></div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── OCD ─── */}
          {tab === 'ocd' && (
            <>
              <div style={S.secTitle}>OCD Intelligence Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Y-BOCS Total', value: '8', status: 'Mild', color: C.green },
                  { label: 'Obsessions', value: 'Contamination, Doubt', status: '4/20', color: C.green },
                  { label: 'Compulsions', value: 'Checking, Washing', status: '4/20', color: C.green },
                  { label: 'Insight', value: 'Good', status: 'Fair', color: C.green },
                  { label: 'Avoidance', value: 'Minimal', status: 'Improving', color: C.green },
                  { label: 'ERP Adherence', value: 'Weekly', status: 'Ongoing', color: C.amber },
                  { label: 'Medication', value: 'Sertraline 200mg', status: 'Effective', color: C.green },
                  { label: 'Functional Impact', value: 'Mild', status: 'Working', color: C.green },
                ].map((o, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${o.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{o.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{o.value}</div>
                    {o.status && <div style={{ marginTop: 6 }}><span style={S.pill(o.color)}>{o.status}</span></div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── ADDICTIONS ─── */}
          {tab === 'addictions' && (
            <>
              <div style={S.secTitle}>Addiction Medicine Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Primary Substance', value: 'Alcohol', status: 'Active', color: C.red },
                  { label: 'AUDIT Score', value: '24', status: 'High Risk', color: C.red },
                  { label: 'Consumption', value: '35 units/wk', status: 'Exceeding limits', color: C.red },
                  { label: 'Withdrawal Risk', value: 'CIWA-Ar 8', status: 'Moderate', color: C.amber },
                  { label: 'Cravings', value: 'Daily', status: 'Strong', color: C.red },
                  { label: 'Motivation', value: 'Contemplation', status: 'Stage 2', color: C.amber },
                  { label: 'Medical Complication', value: 'Mild hepatomegaly', status: 'Monitored', color: C.amber },
                  { label: 'Treatment', value: 'Naltrexone + CBT', status: 'Week 2', color: C.sky },
                ].map((a, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${a.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{a.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{a.value}</div>
                    <div style={{ marginTop: 6 }}><span style={S.pill(a.color)}>{a.status}</span></div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Substance Use History</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Substance</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Pattern</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Age Started</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Last Use</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { sub: 'Alcohol', pattern: 'Daily heavy', age: '16', last: 'Today', st: 'Active' },
                      { sub: 'Cannabis', pattern: 'Weekly', age: '18', last: '3 days ago', st: 'Active' },
                      { sub: 'Nicotine', pattern: '10/day', age: '15', last: 'Today', st: 'Active' },
                      { sub: 'Cocaine', pattern: 'Occasional', age: '22', last: '6 months ago', st: 'In remission' },
                    ].map(s => (
                      <tr key={s.sub} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{s.sub}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{s.pattern}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{s.age}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{s.last}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(s.st === 'Active' ? C.red : C.green)}>{s.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── EATING ─── */}
          {tab === 'eating' && (
            <>
              <div style={S.secTitle}>Eating Disorders Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Diagnosis', value: 'Anorexia Nervosa', status: 'Restrictive', color: C.red },
                  { label: 'BMI', value: '17.2', status: 'Underweight', color: C.red },
                  { label: 'Weight', value: '48 kg', status: 'Goal: 55 kg', color: C.amber },
                  { label: 'Eating Concern', value: 'EDE-Q 4.2', status: 'Moderate', color: C.amber },
                  { label: 'Restriction', value: 'Severe', status: 'Daily', color: C.red },
                  { label: 'Purging', value: 'None', status: 'Absent', color: C.green },
                  { label: 'Medical Stability', value: 'HR 52, K+ 3.8', status: 'Borderline', color: C.amber },
                  { label: 'Treatment', value: 'FBT + Nutritional', status: 'Weekly', color: C.sky },
                ].map((e, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${e.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{e.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{e.value}</div>
                    <div style={{ marginTop: 6 }}><span style={S.pill(e.color)}>{e.status}</span></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── CHILD ─── */}
          {tab === 'child' && (
            <>
              <div style={S.secTitle}>Child &amp; Adolescent Psychiatry</div>
              <div style={S.grid4}>
                {[
                  { label: 'Patient', value: 'Kevin Otieno', age: '14 yrs / Male' },
                  { label: 'Diagnosis', value: 'ADHD (Combined)', color: C.sky },
                  { label: 'Comorbidities', value: 'ODD, Anxiety', color: C.amber },
                  { label: 'CGAS Score', value: '55', status: 'Some difficulty', color: C.amber },
                  { label: 'Medication', value: 'Methylphenidate 36mg', status: 'Effective', color: C.green },
                  { label: 'School Performance', value: 'Improving', status: 'On track', color: C.amber },
                  { label: 'Behavioural Therapy', value: 'Parent training', status: 'Weekly', color: C.green },
                  { label: 'Next Review', value: '2 weeks', status: 'Scheduled', color: C.green },
                ].map((c, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c.color || C.navy }}>{c.value}</div>
                    {c.status && <div style={{ marginTop: 6 }}><span style={S.pill(c.color || C.text)}>{c.status}</span></div>}
                    {c.age && <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{c.age}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── GERIATRIC ─── */}
          {tab === 'geriatric' && (
            <>
              <div style={S.secTitle}>Geriatric Psychiatry</div>
              <div style={S.grid4}>
                {[
                  { label: 'Patient', value: 'Margaret Wanjiku', age: '72 yrs / Female' },
                  { label: 'Diagnosis', value: 'Major Depression', spec: 'Late-onset' },
                  { label: 'Cognitive Status', value: 'MoCA 26/30', status: 'MCI', color: C.amber },
                  { label: 'Geriatric Depression', value: 'GDS-15: 8', status: 'Moderate', color: C.amber },
                  { label: 'Medication', value: 'Escitalopram 10mg', status: 'Tolerated', color: C.green },
                  { label: 'Medical Comorbidities', value: 'HTN, DM, OA', status: 'Managed', color: C.amber },
                  { label: 'Social Support', value: 'Lives with daughter', status: 'Adequate', color: C.green },
                  { label: 'Falls Risk', value: 'Low', status: 'Mobility aid', color: C.green },
                ].map((g, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{g.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: g.color || C.navy }}>{g.value}</div>
                    {g.status && <div style={{ marginTop: 6 }}><span style={S.pill(g.color || C.text)}>{g.status}</span></div>}
                    {g.age && <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{g.age}</div>}
                    {g.spec && <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{g.spec}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── CRISIS ─── */}
          {tab === 'crisis' && (
            <>
              <div style={S.secTitle}>Crisis Intervention Center</div>
              <div style={S.grid4}>
                {[
                  { label: 'Crisis Episodes (YTD)', value: '12', color: C.red },
                  { label: 'Current Crisis', value: 'None', status: 'All clear', color: C.green },
                  { label: 'Safety Plan', value: 'Active, Updated', status: 'Current', color: C.green },
                  { label: 'Mobile Crisis Team', value: 'Available 24/7', status: 'On call', color: C.green },
                  { label: 'Crisis Hotline Calls', value: '48/mo', trend: 'Stable', color: C.amber },
                  { label: 'ER MH Presentations', value: '18/mo', trend: 'Reducing', color: C.amber },
                  { label: 'Involuntary Admissions', value: '4/mo', trend: 'Stable', color: C.amber },
                  { label: 'Follow-up Rate', value: '92%', status: 'Good', color: C.green },
                ].map((c, i) => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${c.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{c.value}</div>
                    <div style={{ marginTop: 6 }}><span style={S.pill(c.color)}>{c.status || c.trend || 'Monitor'}</span></div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Suicide Risk Screening History</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Tool</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Result</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Risk Level</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suicideScreenings.map((s, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{s.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{s.tool}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(s.result === 'Negative' ? C.green : C.amber)}>{s.result}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(s.risk === 'Low' ? C.green : C.amber)}>{s.risk}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{s.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── THERAPY ─── */}
          {tab === 'therapy' && (
            <>
              <div style={S.secTitle}>Therapy Intelligence Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Therapy Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { modality: 'CBT', sessions: 'Weekly', focus: 'Cognitive restructuring, behavioural activation', status: 'Ongoing', color: C.green },
                      { modality: 'Mindfulness', sessions: 'Monthly', focus: 'Relapse prevention, emotional regulation', status: 'Ongoing', color: C.green },
                      { modality: 'Behavioural Activation', sessions: 'PRN', focus: 'Activity scheduling during low mood', status: 'Maintenance', color: C.amber },
                    ].map(t => (
                      <div key={t.modality} style={{ padding: '12px', borderRadius: 8, background: C.panel }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{t.modality}</div>
                          <span style={S.pill(t.color)}>{t.status}</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight }}>Frequency: {t.sessions}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>Focus: {t.focus}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Therapy Session Log</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Modality</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Focus</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { date: '2025-07-01', mod: 'CBT', focus: 'Cognitive restructuring', att: 'Attended' },
                        { date: '2025-06-24', mod: 'CBT', focus: 'Behavioural activation', att: 'Attended' },
                        { date: '2025-06-17', mod: 'Mindfulness', focus: 'Body scan meditation', att: 'Attended' },
                        { date: '2025-06-10', mod: 'CBT', focus: 'Thought records', att: 'Attended' },
                        { date: '2025-06-03', mod: 'CBT', focus: 'Core beliefs', att: 'No-show' },
                      ].map((sl, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 6px', fontWeight: 600 }}>{sl.date}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}>{sl.mod}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{sl.focus}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(sl.att === 'Attended' ? C.green : C.red)}>{sl.att}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Sertraline</div>
                    <span style={S.pill(C.green)}>150mg daily</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2015</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>150mg daily</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Response</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>Excellent</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Side Effects</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Mild nausea (initial)</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Adherence</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>95%</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Propranolol</div>
                    <span style={S.pill(C.amber)}>40mg PRN</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2023</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>40mg PRN</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Indication</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Performance anxiety</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Response</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>Good</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication History</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Drug</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Started</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Stopped</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Max Dose</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Reason Stopped</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { drug: 'Fluoxetine', start: '2014', stop: '2015', max: '40mg', reason: 'Inadequate response', st: 'Discontinued' },
                      { drug: 'Sertraline', start: '2015', stop: '—', max: '200mg', reason: '—', st: 'Active' },
                      { drug: 'Mirtazapine', start: '2021', stop: '2022', max: '30mg', reason: 'Weight gain', st: 'Discontinued' },
                      { drug: 'Aripiprazole', start: '2021', stop: '2022', max: '5mg', reason: 'Akathisia', st: 'Discontinued' },
                      { drug: 'Propranolol', start: '2023', stop: '—', max: '40mg', reason: '—', st: 'Active (PRN)' },
                    ].map(m => (
                      <tr key={m.drug} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{m.drug}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{m.start}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{m.stop}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{m.max}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{m.reason}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(m.st === 'Active' || m.st === 'Active (PRN)' ? C.green : C.red)}>{m.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <>
              <div style={S.secTitle}>Home Monitoring</div>
              <div style={S.grid4}>
                {[
                  { label: 'PHQ-9 Self-Report', value: '3', trend: 'Stable', color: C.green },
                  { label: 'GAD-7 Self-Report', value: '2', trend: 'Stable', color: C.green },
                  { label: 'Sleep Quality', value: '7.2h avg', trend: 'Adequate', color: C.green },
                  { label: 'Med Adherence', value: '95%', trend: 'Excellent', color: C.green },
                  { label: 'Mood Rating', value: '7/10 avg', trend: 'Positive', color: C.green },
                  { label: 'Energy Level', value: '6/10', trend: 'Moderate', color: C.amber },
                  { label: 'Social Activity', value: '3x/week', trend: 'On track', color: C.green },
                  { label: 'Exercise', value: '3x/week', trend: 'On track', color: C.green },
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
                  { label: 'Depression', count: 1024, color: C.sky },
                  { label: 'Anxiety', count: 876, color: C.amber },
                  { label: 'Bipolar', count: 312, color: C.red },
                  { label: 'Psychosis', count: 198, color: C.purple },
                  { label: 'PTSD', count: 245, color: C.amber },
                  { label: 'OCD', count: 112, color: C.sky },
                  { label: 'Addictions', count: 178, color: C.red },
                  { label: 'Eating Disorders', count: 64, color: C.purple },
                  { label: 'Child & Adolescent', count: 156, color: C.text },
                  { label: 'Geriatric', count: 89, color: C.sky },
                  { label: 'Crisis Contacts', count: 198, color: C.red },
                  { label: 'Therapy Cases', count: 412, color: C.green },
                ].map((rg, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={S.statValue}>{rg.count}</div>
                    <div style={S.statLabel}>{rg.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Patient Registry</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} color={C.textLight} style={{ position: 'absolute', left: 10, top: 8 }} />
                      <input style={{ ...S.input, paddingLeft: 28, width: 200 }} placeholder="Search patients..." />
                    </div>
                    <select style={S.sel}><option>All Conditions</option><option>Depression</option><option>Anxiety</option><option>Bipolar</option><option>Psychosis</option></select>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Name</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>MRN</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Diagnosis</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>PHQ-9</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>GAD-7</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Grace Akinyi', mrn: 'MH-001', dx: 'MDD, GAD', phq: '3', gad: '2', st: 'Stable' },
                      { name: 'Peter Ochieng', mrn: 'MH-012', dx: 'Bipolar I', phq: '8', gad: '6', st: 'Active' },
                      { name: 'Grace Njeri', mrn: 'MH-024', dx: 'Schizophrenia', phq: '5', gad: '4', st: 'Active' },
                      { name: 'Samuel Kiprop', mrn: 'MH-036', dx: 'PTSD', phq: '14', gad: '12', st: 'Active' },
                      { name: 'Faith Nyambura', mrn: 'MH-048', dx: 'OCD', phq: '6', gad: '8', st: 'Active' },
                      { name: 'Margaret Wanjiku', mrn: 'MH-052', dx: 'Geriatric Depression', phq: '8', gad: '9', st: 'Active' },
                    ].map((rp, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{rp.name}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{rp.mrn}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{rp.dx}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: parseInt(rp.phq) <= 4 ? C.green : parseInt(rp.phq) <= 9 ? C.amber : C.red }}>{rp.phq}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: parseInt(rp.gad) <= 4 ? C.green : parseInt(rp.gad) <= 9 ? C.amber : C.red }}>{rp.gad}</td>
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
                  { label: 'PHQ-9 Completion', value: '78%', color: C.amber },
                  { label: 'GAD-7 Completion', value: '72%', color: C.amber },
                  { label: 'Suicide Screening', value: '85%', color: C.green },
                  { label: 'Follow-up within 7d', value: '68%', color: C.amber },
                  { label: 'Med Adherence', value: '76%', color: C.amber },
                  { label: 'Therapy Attendance', value: '82%', color: C.green },
                  { label: 'Readmission (30d)', value: '12%', color: C.red },
                  { label: 'Crisis Follow-up', value: '92%', color: C.green },
                  { label: 'Recovery Rate', value: '58%', color: C.amber },
                  { label: 'DNAs', value: '14%', color: C.amber },
                  { label: 'Care Plan Review', value: '64%', color: C.amber },
                  { label: 'Patient Satisfaction', value: '4.2/5', color: C.green },
                ].map((qi, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={S.statValue}>{qi.value}</div>
                    <div style={S.statLabel}>{qi.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Improvement Initiatives</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: 'Outcome Measure Completion', desc: 'Automate PHQ-9/GAD-7 deployment via patient portal', progress: '65%', color: C.sky },
                    { title: 'Suicide Risk Screening Rollout', desc: 'Universal C-SSRS screening at all MH touchpoints', progress: '80%', color: C.green },
                    { title: 'Therapy Attendance Improvement', desc: 'SMS reminder system and telehealth alternatives', progress: '55%', color: C.amber },
                    { title: 'Medication Adherence Programme', desc: 'Pharmacist-led reconciliation and pill count monitoring', progress: '40%', color: C.amber },
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
              <div style={S.secTitle}>Patient Portal &mdash; Grace Akinyi</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Disease Timeline</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>MDD and GAD diagnosed 2014. Multiple depressive episodes with good inter-episode recovery. Currently in sustained remission since 2023.</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication Reminders</div>
                  <div style={{ fontSize: 11, color: C.text }}>Sertraline 150mg &mdash; 08:00 daily</div>
                  <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Propranolol 40mg PRN &mdash; As needed for anxiety</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Symptom Diary</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Mood stable, minimal anxiety. Sleep 7h/night. Energy adequate. No suicidal thoughts.</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Therapy Goals</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Maintain mood stability, develop relapse prevention plan, continue CBT skills practice, improve stress management</div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Appointments</div>
                  <div style={{ fontSize: 11, color: C.text }}>Next Psychiatry Review: 2026-08-15</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Last seen: 2026-07-01 (PHQ-9: 3, GAD-7: 2)</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Therapy Sessions</div>
                  <div style={{ fontSize: 11, color: C.text }}>Next CBT Session: 2026-07-15</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Last session: 2026-07-01 (Cognitive restructuring)</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Self-Management Resources</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { label: 'Relapse Prevention', color: C.sky },
                      { label: 'Mindfulness Audio', color: C.green },
                      { label: 'CBT Worksheets', color: C.purple },
                      { label: 'Crisis Plan', color: C.red },
                      { label: 'Sleep Hygiene', color: C.amber },
                    ].map(r => (
                      <span key={r.label} style={S.pill(r.color)}>{r.label}</span>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Emergency Action Plan</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Crisis line: 0800-123-456. Emergency contact: Mother (Jane Akinyi, +254 712 345 678). Nearest A&E: Kenyatta National Hospital. Safety plan agreed 2025-06-01.</div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}
