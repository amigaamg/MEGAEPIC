'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Clock, Heart, Droplets, Thermometer, Shield, HeartPulse, Bone, Brain, AlertTriangle, Pill, Home, FileText, BarChart3, Globe, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Calendar, Stethoscope, TrendingUp, Eye, Monitor, BookOpen, type LucideIcon } from 'lucide-react'
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
  { id: 'dashboard', label: "Women's Health Dashboard", icon: Activity },
  { id: 'snapshot', label: 'Well-Woman Snapshot', icon: User },
  { id: 'timeline', label: 'Life Stage Timeline', icon: Clock },
  { id: 'gynaecology', label: 'Gynaecology Intelligence', icon: Heart },
  { id: 'menstruation', label: 'Menstrual Health', icon: Droplets },
  { id: 'menopause', label: 'Menopause & Perimenopause', icon: Thermometer },
  { id: 'contraception', label: 'Contraception & Family Planning', icon: Shield },
  { id: 'fertility', label: 'Fertility Intelligence', icon: HeartPulse },
  { id: 'breast', label: 'Breast Health', icon: Activity },
  { id: 'cervical', label: 'Cervical Health', icon: Shield },
  { id: 'bone', label: 'Bone Health', icon: Bone },
  { id: 'cardiovascular', label: 'CV Health in Women', icon: Heart },
  { id: 'mental', label: 'Mental Health (Women)', icon: Brain },
  { id: 'oncology', label: 'Gynaecological Oncology', icon: AlertTriangle },
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
  { label: 'Hypertension', href: '/hypertension' },
  { label: 'Heart Failure', href: '/hf' },
  { label: 'CKD', href: '/ckd' },
  { label: 'Respiratory', href: '/respiratory' },
  { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Oncology', href: '/oncology' },
  { label: 'Neurology', href: '/neurology' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

const timelineEvents = [
  { date: '2000-03-12', title: 'Menarche', details: 'Normal onset of menstruation at age 12, regular cycles established within 2 years', color: C.purple, icon: Droplets },
  { date: '2005-09-20', title: 'First Pap Smear', details: 'Normal cervical cytology, negative for intraepithelial lesions', color: C.green, icon: Shield },
  { date: '2007-06-10', title: 'HPV Vaccination Initiated', details: 'Gardasil quadrivalent vaccine series started, completed over 6 months', color: C.sky, icon: Shield },
  { date: '2009-11-15', title: 'First Pregnancy', details: 'Uncomplicated pregnancy, spontaneous vaginal delivery at 39 weeks, healthy female infant', color: C.green, icon: HeartPulse },
  { date: '2012-04-08', title: 'Second Pregnancy', details: 'Normal antenatal course, elective caesarean section at 38 weeks for breech presentation', color: C.green, icon: HeartPulse },
  { date: '2015-01-25', title: 'Menstrual Irregularity Diagnosed', details: 'Presented with menorrhagia and dysmenorrhoea, ultrasound revealed small fibroids', color: C.amber, icon: Droplets },
  { date: '2016-08-14', title: 'Hypothyroidism Diagnosis', details: 'TSH 8.2 mIU/L, T4 low, diagnosed autoimmune hypothyroidism, started levothyroxine', color: C.amber, icon: AlertTriangle },
  { date: '2018-05-30', title: 'Mammogram Baseline', details: 'First screening mammogram at age 40, BI-RADS 1 negative, dense breast tissue noted', color: C.green, icon: Activity },
  { date: '2020-10-12', title: 'Colposcopy & Cervical Biopsy', details: 'LSIL on Pap, colposcopy showed CIN1, HPV 16 positive, managed conservatively', color: C.amber, icon: Shield },
  { date: '2021-07-05', title: 'Bone Density Scan', details: 'DEXA scan: lumbar spine T-score -1.2, hip T-score -0.8, osteopenia diagnosed', color: C.amber, icon: Bone },
  { date: '2023-02-18', title: 'Perimenopause Assessment', details: 'Irregular cycles, hot flushes, FSH 28 mIU/mL, perimenopausal transition stage', color: C.amber, icon: Thermometer },
  { date: '2024-09-01', title: 'Well-Woman Annual Review', details: 'Comprehensive review: mammogram negative, Pap normal, BP 118/76, BMI 27, TSH stable', color: C.green, icon: User },
  { date: '2025-06-15', title: 'Latest Gynaecology Review', details: 'Menstrual disorder managed, fibroids stable, HRT discussed but declined, next review 12 months', color: C.green, icon: Heart },
  { date: '2025-07-01', title: 'Cervical Screening HPV Clearance', details: 'Repeat HPV test negative, cytology normal, surveillance interval extended to 5 years', color: C.green, icon: Shield },
]

const teamMembers = [
  { role: 'Gynaecologist', name: 'Dr. Grace Wanjiku', status: 'Available' },
  { role: 'Breast Surgeon', name: 'Dr. Susan Muthoni', status: 'Available' },
  { role: 'Menopause Specialist', name: 'Dr. Jane Nyambura', status: 'Available' },
  { role: 'Fertility Specialist', name: 'Dr. Peter Kamau', status: 'Busy' },
  { role: 'Urogynaecologist', name: 'Dr. Esther Achieng', status: 'Available' },
  { role: 'Pelvic Floor Physio', name: 'Nancy Wanjiru', status: 'Available' },
  { role: 'Psychologist', name: 'Dr. Ben Kiprop', status: 'Busy' },
  { role: 'Dietitian', name: 'Faith Njoki', status: 'Available' },
  { role: 'Radiologist', name: 'Dr. Samuel Ochieng', status: 'Available' },
  { role: 'Gynaecological Oncologist', name: 'Dr. Margaret Wairimu', status: 'Available' },
  { role: 'Sexual Health Specialist', name: 'Dr. Anne Waithira', status: 'Busy' },
  { role: 'Cardiologist (Women\'s Health)', name: 'Dr. James Mwangi', status: 'Available' },
  { role: 'Social Worker', name: 'Catherine Nyambura', status: 'Available' },
]

export default function WomensHealthWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Women's Health Intelligence Center &mdash; Volume XII-A</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>WH</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>WHIC</div>
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
              <div style={S.secTitle}>Women's Health Dashboard</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${C.purple}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color={C.purple} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Sarah Wangari</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <div style={{ fontSize: 12, color: C.text }}>42 Years / Female</div>
                <div style={{ width: 1, height: 24, background: C.border }} />
                <span style={S.pill(C.amber)}>Menstrual Disorder</span>
                <span style={S.pill(C.sky)}>Hypothyroidism</span>
                <span style={S.pill(C.green)}>Stable</span>
                <div style={{ fontSize: 11, color: C.textLight }}>Last Visit: 2025-06-15</div>
                <span style={S.pill(C.purple)}>Perimenopausal</span>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Users size={24} color={C.purple} />
                  <div style={S.statValue}>3,542</div>
                  <div style={S.statLabel}>Total Women's Health Patients</div>
                </div>
                <div style={S.statCard}>
                  <Droplets size={24} color={C.amber} />
                  <div style={S.statValue}>1,124</div>
                  <div style={S.statLabel}>Menstrual Disorders</div>
                </div>
                <div style={S.statCard}>
                  <Thermometer size={24} color={C.red} />
                  <div style={S.statValue}>892</div>
                  <div style={S.statLabel}>Menopause Mgmt</div>
                </div>
                <div style={S.statCard}>
                  <Activity size={24} color={C.sky} />
                  <div style={S.statValue}>2,150</div>
                  <div style={S.statLabel}>Breast Surveillance</div>
                </div>
              </div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Shield size={24} color={C.green} />
                  <div style={S.statValue}>1,876</div>
                  <div style={S.statLabel}>Cervical Screening</div>
                </div>
                <div style={S.statCard}>
                  <Shield size={24} color={C.sky} />
                  <div style={S.statValue}>2,340</div>
                  <div style={S.statLabel}>Contraception</div>
                </div>
                <div style={S.statCard}>
                  <HeartPulse size={24} color={C.purple} />
                  <div style={S.statValue}>456</div>
                  <div style={S.statLabel}>Fertility</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.red} />
                  <div style={S.statValue}>189</div>
                  <div style={S.statLabel}>Gynae Cancers</div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Alerts</div>
                <div style={S.grid2}>
                  {[
                    { title: 'Abnormal Mammogram Follow-up', patient: 'Grace Akinyi', detail: 'BI-RADS 4B, biopsy pending', color: C.red },
                    { title: 'HPV 16 Persistent', patient: 'Faith Nyambura', detail: 'HPV 16 positive for 24 months, colposcopy due', color: C.amber },
                    { title: 'Osteoporosis Treatment Gap', patient: 'Margaret Wairimu', detail: 'Bisphosphonate not refilled for 3 months', color: C.amber },
                    { title: 'BRCA Carrier Surveillance', patient: 'Jane Wanjiku', detail: 'Annual MRI breast overdue by 2 months', color: C.red },
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
                  <button style={S.btn(C.purple)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Patient Assessment</button>
                  <button style={S.btn(C.sky)}><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Schedule Screening</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Medication Review</button>
                  <button style={S.btnO}><Heart size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Well-Woman Exam</button>
                </div>
              </div>
            </>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <>
              <div style={S.secTitle}>Well-Woman Snapshot &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                {[
                  { label: 'Age', value: '42 years', color: C.navy },
                  { label: 'BMI', value: '27 kg/m²', color: C.amber },
                  { label: 'Blood Pressure', value: '118/76', color: C.green },
                  { label: 'Menstrual Status', value: 'Perimenopausal', color: C.amber },
                  { label: 'Contraception', value: 'None', color: C.textLight },
                  { label: 'Pregnancies', value: '2 (2 live births)', color: C.green },
                  { label: 'Last Pap Smear', value: '2025-06-15 (Normal)', color: C.green },
                  { label: 'HPV Status', value: 'Negative (cleared)', color: C.green },
                  { label: 'Mammogram', value: '2024-09-01 (BI-RADS 1)', color: C.green },
                  { label: 'TSH', value: '3.1 mIU/L (on therapy)', color: C.green },
                  { label: 'DEXA T-Score', value: '-1.2 (Osteopenia)', color: C.amber },
                  { label: 'Vitamin D', value: '28 ng/mL', color: C.amber },
                  { label: 'Ferritin', value: '45 ng/mL', color: C.green },
                  { label: 'Haemoglobin', value: '13.2 g/dL', color: C.green },
                  { label: 'Folate', value: '12.4 ng/mL', color: C.green },
                  { label: 'Vitamin B12', value: '385 pg/mL', color: C.green },
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
              <div style={S.secTitle}>Life Stage Timeline &mdash; Sarah Wangari</div>
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

          {/* ─── GYNAECOLOGY ─── */}
          {tab === 'gynaecology' && (
            <>
              <div style={S.secTitle}>Gynaecology Intelligence &mdash; Sarah Wangari</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Gynaecological History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Menarche', value: 'Age 12 (2000)', status: 'Normal', color: C.green },
                      { label: 'Cycle Length', value: '26-45 days (irregular)', status: 'Irregular', color: C.amber },
                      { label: 'Flow Duration', value: '5-7 days', status: 'Normal', color: C.green },
                      { label: 'Flow Severity', value: 'Heavy (PBAC >150)', status: 'Menorrhagia', color: C.amber },
                      { label: 'Dysmenorrhoea', value: 'Moderate, requires NSAIDs', status: 'Moderate', color: C.amber },
                      { label: 'Gravida/Para', value: 'G2 P2 (0+0)', status: 'Normal', color: C.green },
                      { label: 'Last Delivery', value: '2012 (C-section)', status: 'Remote', color: C.textLight },
                      { label: 'Fibroids', value: '2 small intramural (3cm, 2cm)', status: 'Stable', color: C.amber },
                      { label: 'Endometriosis', value: 'Not suspected', status: 'None', color: C.green },
                      { label: 'Previous Surgery', value: 'C-section 2012', status: 'Remote', color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 120 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pelvic Exam Findings</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Vulva', value: 'Normal, no lesions', status: 'Normal', color: C.green },
                      { label: 'Vagina', value: 'Well-oestrogenised', status: 'Normal', color: C.green },
                      { label: 'Cervix', value: 'Transformation zone visible', status: 'Normal', color: C.green },
                      { label: 'Uterus', value: 'Anteverted, slightly bulky', status: 'Bulky', color: C.amber },
                      { label: 'Adnexae', value: 'No masses, non-tender', status: 'Normal', color: C.green },
                      { label: 'Pelvic Floor', value: 'Mild cystocele, good tone', status: 'Mild', color: C.amber },
                      { label: 'Rectovaginal', value: 'Normal, no nodules', status: 'Normal', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pelvic Ultrasound</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.panel}` }}>
                      <span style={{ color: C.text }}>Endometrial Thickness</span>
                      <span style={{ fontWeight: 600, color: C.navy }}>6.5 mm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.panel}` }}>
                      <span style={{ color: C.text }}>Ovaries</span>
                      <span style={{ fontWeight: 600, color: C.navy }}>Normal volume, no cysts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.panel}` }}>
                      <span style={{ color: C.text }}>Fibroid 1</span>
                      <span style={{ fontWeight: 600, color: C.navy }}>3cm intramural, fundal</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ color: C.text }}>Fibroid 2</span>
                      <span style={{ fontWeight: 600, color: C.navy }}>2cm intramural, posterior</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── MENSTRUATION ─── */}
          {tab === 'menstruation' && (
            <>
              <div style={S.secTitle}>Menstrual Health &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Droplets size={24} color={C.amber} />
                  <div style={S.statValue}>26-45</div>
                  <div style={S.statLabel}>Cycle Length (days)</div>
                </div>
                <div style={S.statCard}>
                  <Droplets size={24} color={C.red} />
                  <div style={S.statValue}>PBAC 180</div>
                  <div style={S.statLabel}>Menstrual Blood Loss</div>
                </div>
                <div style={S.statCard}>
                  <Calendar size={24} color={C.sky} />
                  <div style={S.statValue}>7/10</div>
                  <div style={S.statLabel}>Pain Score (avg)</div>
                </div>
                <div style={S.statCard}>
                  <TrendingUp size={24} color={C.purple} />
                  <div style={S.statValue}>8</div>
                  <div style={S.statLabel}>Days of Flow</div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Menstrual Symptom Diary (Last 6 Cycles)</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Cycle</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Length (d)</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Flow (d)</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>PBAC Score</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Pain (0-10)</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Clots</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Intermenstrual</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Medication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { cycle: 'Jan 2025', len: '32', flow: '7', pbach: '185', pain: '7', clots: 'Moderate', im: 'No', med: 'NSAIDs' },
                      { cycle: 'Feb 2025', len: '28', flow: '6', pbach: '160', pain: '6', clots: 'Small', im: 'No', med: 'NSAIDs' },
                      { cycle: 'Mar 2025', len: '41', flow: '8', pbach: '210', pain: '8', clots: 'Large', im: 'Spotting', med: 'NSAIDs + Tranexamic' },
                      { cycle: 'Apr 2025', len: '35', flow: '7', pbach: '175', pain: '7', clots: 'Moderate', im: 'No', med: 'NSAIDs' },
                      { cycle: 'May 2025', len: '26', flow: '5', pbach: '140', pain: '5', clots: 'Small', im: 'No', med: 'NSAIDs' },
                      { cycle: 'Jun 2025', len: '45', flow: '8', pbach: '195', pain: '8', clots: 'Large', im: 'Spotting', med: 'NSAIDs + Tranexamic' },
                    ].map((c, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{c.cycle}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{c.len}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{c.flow}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{c.pbach}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(parseInt(c.pain) > 7 ? C.red : parseInt(c.pain) > 5 ? C.amber : C.green)}>{c.pain}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{c.clots}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{c.im}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{c.med}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ─── MENOPAUSE ─── */}
          {tab === 'menopause' && (
            <>
              <div style={S.secTitle}>Menopause & Perimenopause &mdash; Sarah Wangari</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Menopausal Stage Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'STRAW+10 Stage', value: 'Late reproductive / Early perimenopause', color: C.amber },
                      { label: 'FSH', value: '28 mIU/mL (2025)', color: C.amber },
                      { label: 'AMH', value: '0.6 ng/mL', color: C.amber },
                      { label: 'Oestradiol', value: '85 pmol/L', color: C.amber },
                      { label: 'Cycle Variability', value: 'Irregular, 26-45 days', color: C.amber },
                      { label: 'Hot Flushes', value: 'Mild, 2-3/week', color: C.amber },
                      { label: 'Night Sweats', value: 'Occasional, 1-2/week', color: C.green },
                      { label: 'Sleep Disturbance', value: 'Mild, wakes 1x/night', color: C.amber },
                      { label: 'Mood Changes', value: 'Mild irritability', color: C.amber },
                      { label: 'Vaginal Dryness', value: 'Mild, not distressing', color: C.green },
                      { label: 'Libido', value: 'Slightly reduced', color: C.amber },
                      { label: 'Joint Pain', value: 'Mild knee discomfort', color: C.amber },
                      { label: 'Weight Change', value: '+3 kg over 12 months', color: C.amber },
                      { label: 'Bone Health', value: 'Osteopenia, T-score -1.2', color: C.amber },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 130 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>HRT Eligibility & Discussion</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { item: 'HRT discussed with patient', complete: true },
                        { item: 'Counselled on risks and benefits', complete: true },
                        { item: 'Patient elected to decline HRT', complete: true },
                        { item: 'Non-hormonal alternatives offered', complete: true },
                        { item: 'Lifestyle modifications reviewed', complete: true },
                        { item: 'Bone health monitoring plan established', complete: true },
                      ].map(c => (
                        <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                          {c.complete ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.textLight} />}
                          <span style={{ color: c.complete ? C.navy : C.textLight }}>{c.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Non-Hormonal Management</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                      {[
                        { therapy: 'SSRI/SNRI (Escitalopram)', status: 'Offered, declined', color: C.textLight },
                        { therapy: 'Gabapentin for hot flushes', status: 'Not indicated', color: C.textLight },
                        { therapy: 'Vaginal moisturisers', status: 'Recommended', color: C.green },
                        { therapy: 'Vitamin D + Calcium', status: 'Supplementing 1000/500 mg', color: C.green },
                        { therapy: 'Weight-bearing exercise', status: 'Walking 3x/week', color: C.amber },
                        { therapy: 'Cognitive behavioural therapy', status: 'On waitlist', color: C.amber },
                      ].map(t => (
                        <div key={t.therapy} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: 4, background: C.panel }}>
                          <span style={{ color: C.text }}>{t.therapy}</span>
                          <span style={{ fontWeight: 600, color: t.color }}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── CONTRACEPTION ─── */}
          {tab === 'contraception' && (
            <>
              <div style={S.secTitle}>Contraception & Family Planning &mdash; Sarah Wangari</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Contraception</div>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${C.amber}15`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={32} color={C.amber} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>None Currently</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Not using contraception &mdash; not sexually active</div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Contraception History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                      <span>Method</span><span>Started</span><span>Stopped</span><span>Reason</span>
                    </div>
                    {[
                      { method: 'Combined OCP (Microgynon)', started: '2005', stopped: '2009', reason: 'Planned pregnancy' },
                      { method: 'Combined OCP (Microgynon)', started: '2013', stopped: '2018', reason: 'Age >35, migraine' },
                      { method: 'Condoms', started: '2018', stopped: '2022', reason: 'No longer sexually active' },
                      { method: 'None', started: '2022', stopped: 'Present', reason: 'Perimenopausal, not SA' },
                    ].map(c => (
                      <div key={c.method} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{c.method}</span>
                        <span style={{ color: C.text }}>{c.started}</span>
                        <span style={{ color: C.text }}>{c.stopped}</span>
                        <span style={{ color: C.textLight }}>{c.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Family Planning Intentions</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 8, background: C.panel }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${C.purple}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartPulse size={20} color={C.purple} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Family Complete</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Patient has completed desired family size (2 children). No further pregnancies planned. Perimenopausal, not currently requiring contraception.</div>
                  </div>
                  <span style={S.badge(C.green)}>Completed</span>
                </div>
              </div>
            </>
          )}

          {/* ─── FERTILITY ─── */}
          {tab === 'fertility' && (
            <>
              <div style={S.secTitle}>Fertility Intelligence &mdash; Sarah Wangari</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Obstetric History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Gravida', value: '2', status: 'Normal', color: C.green },
                      { label: 'Para', value: '2 (2 live births)', status: 'Normal', color: C.green },
                      { label: 'Miscarriages', value: '0', status: 'None', color: C.green },
                      { label: 'Terminations', value: '0', status: 'None', color: C.green },
                      { label: 'Ectopic Pregnancies', value: '0', status: 'None', color: C.green },
                      { label: 'Mode of Delivery 1', value: 'SVD (2009)', status: 'Uncomplicated', color: C.green },
                      { label: 'Mode of Delivery 2', value: 'C-section (2012)', status: 'Breech', color: C.amber },
                      { label: 'Complications', value: 'None in either pregnancy', status: 'None', color: C.green },
                      { label: 'Birth Weights', value: '3.2 kg, 3.4 kg', status: 'Normal', color: C.green },
                      { label: 'Breastfeeding', value: '12 months each', status: 'Extended', color: C.green },
                      { label: 'Postpartum Depression', value: 'None', status: 'None', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                        <span style={{ color: C.text }}>{p.label}</span>
                        <span style={{ fontWeight: 600, color: C.navy }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fertility Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'AMH', value: '0.6 ng/mL', status: 'Low for age', color: C.amber },
                      { label: 'Antral Follicle Count', value: '6', status: 'Low', color: C.amber },
                      { label: 'FSH', value: '28 mIU/mL', status: 'Elevated', color: C.amber },
                      { label: 'TSH', value: '3.1 mIU/L (on therapy)', status: 'Controlled', color: C.green },
                      { label: 'Prolactin', value: '12 ng/mL', status: 'Normal', color: C.green },
                      { label: 'Ovarian Reserve', value: 'Reduced for age', status: 'Low', color: C.amber },
                      { label: 'Tubal Patency', value: 'Not assessed (no indication)', status: 'N/A', color: C.textLight },
                      { label: 'Partner Semen Analysis', value: 'N/A', status: 'Not indicated', color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 130 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── BREAST ─── */}
          {tab === 'breast' && (
            <>
              <div style={S.secTitle}>Breast Health &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Activity size={24} color={C.green} />
                  <div style={S.statValue}>BI-RADS 1</div>
                  <div style={S.statLabel}>Latest Mammogram</div>
                </div>
                <div style={S.statCard}>
                  <Calendar size={24} color={C.sky} />
                  <div style={S.statValue}>2024-09</div>
                  <div style={S.statLabel}>Last Mammogram</div>
                </div>
                <div style={S.statCard}>
                  <Shield size={24} color={C.green} />
                  <div style={S.statValue}>Dense A</div>
                  <div style={S.statLabel}>Breast Density</div>
                </div>
                <div style={S.statCard}>
                  <User size={24} color={C.textLight} />
                  <div style={S.statValue}>Average</div>
                  <div style={S.statLabel}>Lifetime Risk</div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Mammography History</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Finding</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>BI-RADS</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Density</th>
                      <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2024-09-01', type: 'Digital Mammo', finding: 'Negative, no masses or calcifications', birads: '1', density: 'A', rec: 'Routine screening in 12 months' },
                      { date: '2022-08-15', type: 'Digital Mammo', finding: 'Negative, no suspicious findings', birads: '1', density: 'A', rec: 'Routine screening in 24 months' },
                      { date: '2020-07-20', type: 'Digital Mammo', finding: 'Negative', birads: '1', density: 'B', rec: 'Routine screening in 24 months' },
                      { date: '2018-05-30', type: 'Digital Mammo', finding: 'Negative, baseline study', birads: '1', density: 'B', rec: 'Routine screening in 24 months' },
                    ].map(m => (
                      <tr key={m.date} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{m.date}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{m.type}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.text }}>{m.finding}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(C.green)}>{m.birads}</span></td>
                        <td style={{ textAlign: 'center', padding: '8px 6px' }}>{m.density}</td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{m.rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Clinical Breast Exam</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Last CBE', value: '2025-06-15', status: 'Current', color: C.green },
                    { label: 'Palpable Masses', value: 'None', status: 'Normal', color: C.green },
                    { label: 'Nipple Discharge', value: 'None', status: 'Normal', color: C.green },
                    { label: 'Skin Changes', value: 'None', status: 'Normal', color: C.green },
                    { label: 'Lymphadenopathy', value: 'None', status: 'Normal', color: C.green },
                    { label: 'Family History', value: 'Mother: breast cancer age 68', status: 'Relevant', color: C.amber },
                    { label: 'BRCA Testing', value: 'Not indicated (NICE criteria not met)', status: 'N/A', color: C.textLight },
                  ].map(b => (
                    <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                      <span style={{ fontSize: 10, color: C.textLight, minWidth: 120 }}>{b.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{b.value}</span>
                      <span style={S.badge(b.color)}>{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── CERVICAL ─── */}
          {tab === 'cervical' && (
            <>
              <div style={S.secTitle}>Cervical Health &mdash; Sarah Wangari</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cervical Screening History</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Date</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Cytology</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>HPV</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Result</th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight, fontWeight: 500 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { date: '2025-06-15', cyt: 'Normal', hpv: 'Negative', res: 'Negative', act: 'Routine recall 5 years' },
                        { date: '2023-11-10', cyt: 'Normal', hpv: 'Negative', res: 'Negative', act: 'Routine recall 3 years' },
                        { date: '2021-08-22', cyt: 'LSIL', hpv: '16 Positive', res: 'Abnormal', act: 'Colposcopy referral' },
                        { date: '2020-10-12', cyt: 'LSIL', hpv: '16 Positive', res: 'Abnormal', act: 'Colposcopy: CIN1, conservative' },
                        { date: '2018-03-05', cyt: 'Normal', hpv: 'Negative', res: 'Negative', act: 'Routine recall 3 years' },
                      ].map(c => (
                        <tr key={c.date} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 6px', fontWeight: 600 }}>{c.date}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}>{c.cyt}</td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(c.hpv === 'Negative' ? C.green : C.red)}>{c.hpv}</span></td>
                          <td style={{ textAlign: 'center', padding: '8px 6px' }}><span style={S.badge(c.res === 'Negative' ? C.green : C.amber)}>{c.res}</span></td>
                          <td style={{ textAlign: 'center', padding: '8px 6px', color: C.textLight }}>{c.act}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Colposcopy Details (Oct 2020)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Indication', value: 'LSIL + HPV 16 positive', color: C.text },
                      { label: 'Cervix Visualisation', value: 'Satisfactory, squamocolumnar junction visible', color: C.green },
                      { label: 'Acetowhite Change', value: 'Mild, in transformation zone', color: C.amber },
                      { label: 'Biopsy Result', value: 'CIN1 (mild dysplasia)', color: C.amber },
                      { label: 'Management', value: 'Conservative surveillance', color: C.amber },
                      { label: 'HPV Clearance', value: 'Confirmed 2025, now negative', color: C.green },
                      { label: 'HPV Vaccination', value: 'Gardasil completed 2008', color: C.green },
                    ].map(c => (
                      <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                        <span style={{ color: C.text }}>{c.label}</span>
                        <span style={{ fontWeight: 600, color: c.color }}>{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── BONE ─── */}
          {tab === 'bone' && (
            <>
              <div style={S.secTitle}>Bone Health &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <Bone size={24} color={C.amber} />
                  <div style={S.statValue}>-1.2</div>
                  <div style={S.statLabel}>Lumbar Spine T-Score</div>
                </div>
                <div style={S.statCard}>
                  <Bone size={24} color={C.green} />
                  <div style={S.statValue}>-0.8</div>
                  <div style={S.statLabel}>Hip T-Score</div>
                </div>
                <div style={S.statCard}>
                  <Bone size={24} color={C.amber} />
                  <div style={S.statValue}>Osteopenia</div>
                  <div style={S.statLabel}>Diagnosis</div>
                </div>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.green} />
                  <div style={S.statValue}>None</div>
                  <div style={S.statLabel}>Fractures</div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>DEXA Scan History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { date: '2024-08-20', spine: '-1.2', hip: '-0.8', diagnosis: 'Osteopenia' },
                      { date: '2021-07-05', spine: '-1.0', hip: '-0.6', diagnosis: 'Osteopenia' },
                      { date: '2018-04-12', spine: '-0.7', hip: '-0.4', diagnosis: 'Normal' },
                    ].map(d => (
                      <div key={d.date} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{d.date}</span>
                        <span style={{ color: C.text }}>Spine: {d.spine}</span>
                        <span style={{ color: C.text }}>Hip: {d.hip}</span>
                        <span style={S.badge(C.amber)}>{d.diagnosis}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Bone Health Management</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Vitamin D', value: '28 ng/mL', status: 'Sufficient', color: C.green },
                      { label: 'Calcium Intake', value: '800 mg/day', status: 'Below target', color: C.amber },
                      { label: 'Bisphosphonate Therapy', value: 'Not indicated', status: 'N/A', color: C.textLight },
                      { label: 'Weight-Bearing Exercise', value: 'Walking 3x/week', status: 'Moderate', color: C.amber },
                      { label: 'FRAX Score', value: '10yr MOF 8.2%', status: 'Low', color: C.green },
                      { label: 'Next DEXA', value: '2027', status: 'Scheduled', color: C.green },
                      { label: 'Falls Risk', value: 'Low', status: 'Low', color: C.green },
                    ].map(b => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 120 }}>{b.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{b.value}</span>
                        <span style={S.badge(b.color)}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── CARDIOVASCULAR ─── */}
          {tab === 'cardiovascular' && (
            <>
              <div style={S.secTitle}>Cardiovascular Health in Women &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                {[
                  { label: 'Blood Pressure', value: '118/76 mmHg', color: C.green },
                  { label: 'Heart Rate', value: '72 bpm', color: C.green },
                  { label: 'LDL Cholesterol', value: '2.8 mmol/L', color: C.amber },
                  { label: 'HDL Cholesterol', value: '1.4 mmol/L', color: C.green },
                  { label: 'Triglycerides', value: '1.6 mmol/L', color: C.amber },
                  { label: 'Fasting Glucose', value: '5.1 mmol/L', color: C.green },
                  { label: 'HbA1c', value: '5.4%', color: C.green },
                  { label: 'hsCRP', value: '1.8 mg/L', color: C.amber },
                  { label: 'ECG', value: 'Normal sinus rhythm', color: C.green },
                  { label: '10yr ASCVD Risk', value: '4.2% (Low)', color: C.green },
                  { label: 'Lifetime Risk', value: 'Moderate', color: C.amber },
                  { label: 'Menopause CV Impact', value: 'Perimenopausal, risk increasing', color: C.amber },
                ].map((s, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Women-Specific CV Risk Factors</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { factor: 'Hypertensive Disorders of Pregnancy', status: 'None', color: C.green },
                    { factor: 'Gestational Diabetes', status: 'None', color: C.green },
                    { factor: 'Premature Menopause (<40)', status: 'None', color: C.green },
                    { factor: 'Polycystic Ovary Syndrome', status: 'Not diagnosed', color: C.green },
                    { factor: 'Autoimmune Disease', status: 'Hypothyroidism (controlled)', color: C.amber },
                    { factor: 'Breast Cancer Treatment', status: 'N/A', color: C.textLight },
                    { factor: 'Menopausal Hormone Therapy', status: 'Declined HRT', color: C.textLight },
                  ].map(f => (
                    <div key={f.factor} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                      <span style={{ fontSize: 10, color: C.textLight, minWidth: 220 }}>{f.factor}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{f.status}</span>
                      <span style={S.badge(f.color)}>{f.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── MENTAL ─── */}
          {tab === 'mental' && (
            <>
              <div style={S.secTitle}>Mental Health (Women) &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                {[
                  { label: 'PHQ-9', value: '6 (Mild depression)', color: C.amber },
                  { label: 'GAD-7', value: '4 (Minimal anxiety)', color: C.green },
                  { label: 'Epworth Sleepiness', value: '8 (Normal)', color: C.green },
                  { label: 'Perinatal MH History', value: 'None', color: C.green },
                  { label: 'PMDD Screening', value: 'Negative', color: C.green },
                  { label: 'Menopause Mood Impact', value: 'Mild irritability', color: C.amber },
                  { label: 'Social Support', value: 'Adequate', color: C.green },
                  { label: 'Stress Level', value: 'Moderate', color: C.amber },
                ].map((s, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Mental Health History</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Diagnosed Conditions', value: 'None', status: 'Nil', color: C.green },
                    { label: 'Previous Treatment', value: 'None', status: 'Nil', color: C.green },
                    { label: 'Current Therapy', value: 'None', status: 'Not indicated', color: C.green },
                    { label: 'Current Medication', value: 'None', status: 'None', color: C.green },
                    { label: 'Sleep Quality', value: 'Wakes 1-2x/night', status: 'Mild disturbance', color: C.amber },
                    { label: 'Appetite', value: 'Normal', status: 'Good', color: C.green },
                    { label: 'Energy Levels', value: 'Adequate', status: 'Normal', color: C.green },
                    { label: 'Coping Strategies', value: 'Exercise, reading, social', status: 'Active', color: C.green },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                      <span style={{ fontSize: 10, color: C.textLight, minWidth: 140 }}>{m.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{m.value}</span>
                      <span style={S.badge(m.color)}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── ONCOLOGY ─── */}
          {tab === 'oncology' && (
            <>
              <div style={S.secTitle}>Gynaecological Oncology &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                <div style={S.statCard}>
                  <AlertTriangle size={24} color={C.green} />
                  <div style={S.statValue}>None</div>
                  <div style={S.statLabel}>Current Malignancy</div>
                </div>
                <div style={S.statCard}>
                  <Shield size={24} color={C.green} />
                  <div style={S.statValue}>HPV Cleared</div>
                  <div style={S.statLabel}>Cervical Cancer Risk</div>
                </div>
                <div style={S.statCard}>
                  <Activity size={24} color={C.green} />
                  <div style={S.statValue}>BI-RADS 1</div>
                  <div style={S.statLabel}>Breast Cancer Risk</div>
                </div>
                <div style={S.statCard}>
                  <User size={24} color={C.amber} />
                  <div style={S.statValue}>Family Hx</div>
                  <div style={S.statLabel}>Breast CA (Mother)</div>
                </div>
              </div>
              <div style={S.divider} />
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cancer Surveillance Schedule</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { site: 'Cervical', test: 'HPV/Pap co-test', freq: '5 yearly', last: '2025-06-15', next: '2030', status: 'On Track', color: C.green },
                      { site: 'Breast', test: 'Mammogram', freq: '2 yearly', last: '2024-09-01', next: '2026-09', status: 'On Track', color: C.green },
                      { site: 'Ovarian', test: 'Pelvic US + CA125', freq: 'Not indicated', last: 'N/A', next: 'N/A', status: 'Not Indicated', color: C.textLight },
                      { site: 'Endometrial', test: 'TVUS', freq: 'Symptom-driven', last: '2025-06-15', next: 'PRN', status: 'Surveillance', color: C.amber },
                      { site: 'Skin', test: 'Clinical exam', freq: 'Annual', last: '2025-06-15', next: '2026-06', status: 'On Track', color: C.green },
                    ].map(c => (
                      <div key={c.site} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr', gap: 4, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{c.site}</span>
                        <span style={{ color: C.text }}>{c.test}</span>
                        <span style={{ color: C.textLight }}>{c.freq}</span>
                        <span style={{ color: C.textLight }}>{c.last}</span>
                        <span style={{ color: C.textLight }}>{c.next}</span>
                        <span style={S.badge(c.color)}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Hereditary Cancer Risk</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Family History', value: 'Mother: breast cancer age 68 (alive, treated)', color: C.amber },
                      { label: 'Maternal Aunt', value: 'Ovarian cancer age 72 (deceased)', color: C.amber },
                      { label: 'BRCA 1/2 Testing', value: 'Not meeting NICE referral criteria', color: C.amber },
                      { label: 'Lynch Syndrome Screening', value: 'Not indicated (no endometrial/colon Ca)', color: C.green },
                      { label: 'Typer-Cuzick Score', value: '10yr: 2.8% (Average)', color: C.green },
                      { label: 'Risk Reduction Advice', value: 'Lifestyle, screening adherence', color: C.green },
                    ].map(h => (
                      <div key={h.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                        <span style={{ color: C.text }}>{h.label}</span>
                        <span style={{ fontWeight: 600, color: h.color, textAlign: 'right', maxWidth: '60%' }}>{h.value}</span>
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
              <div style={S.secTitle}>Medication Intelligence &mdash; Sarah Wangari</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Levothyroxine</div>
                    <span style={S.pill(C.sky)}>75 mcg daily</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2016</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>75 mcg daily</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Indication</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Hypothyroidism</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>TSH Last</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.green }}>3.1 mIU/L (Controlled)</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Side Effects</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>None</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Tranexamic Acid</div>
                    <span style={S.pill(C.amber)}>1g TDS PRN (menstrual)</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2024</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>1g TDS during menstruation</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Indication</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Menorrhagia</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Response</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.amber }}>Moderate reduction in bleeding</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Side Effects</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Mild nausea</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Vitamin D3</div>
                    <span style={S.pill(C.green)}>1,000 IU daily</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Started</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2021</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Indication</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Osteopenia, insufficiency</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Level (2025)</td><td style={{ textAlign: 'right', padding: '6px 4px', color: C.amber }}>28 ng/mL (Sufficient)</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>NSAIDs (Ibuprofen)</div>
                    <span style={S.pill(C.amber)}>400 mg PRN</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Use</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>Dysmenorrhoea PRN</td></tr>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '6px 4px', fontWeight: 500 }}>Dose</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>400 mg TDS PRN</td></tr>
                      <tr><td style={{ padding: '6px 4px', fontWeight: 500 }}>Frequency</td><td style={{ textAlign: 'right', padding: '6px 4px' }}>2-3 days per cycle</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication History</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Drug</span><span>Started</span><span>Stopped</span><span>Reason</span><span>Status</span>
                  </div>
                  {[
                    { drug: 'Combined OCP', started: '2005', stopped: '2018', reason: 'Contraception', status: 'Discontinued', color: C.red },
                    { drug: 'Iron Supplement', started: '2024', stopped: '2025', reason: 'Mild anaemia', status: 'Completed', color: C.green },
                    { drug: 'Calcium Carbonate', started: '2024', stopped: 'Active', reason: 'Osteopenia', status: 'Active', color: C.green },
                    { drug: 'Escitalopram', started: '2024', stopped: '2024', reason: 'Mood, declined after trial', status: 'Stopped', color: C.amber },
                  ].map(m => (
                    <div key={m.drug} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{m.drug}</span>
                      <span style={{ color: C.text }}>{m.started}</span>
                      <span style={{ color: C.text }}>{m.stopped}</span>
                      <span style={{ color: C.textLight }}>{m.reason}</span>
                      <span style={S.badge(m.color)}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <>
              <div style={S.secTitle}>Home Monitoring &mdash; Sarah Wangari</div>
              <div style={S.grid4}>
                {[
                  { label: 'Blood Pressure', value: '118/76', trend: 'Stable', color: C.green },
                  { label: 'Weight', value: '72 kg', trend: 'Stable', color: C.green },
                  { label: 'Mood (PHQ-9)', value: '6/27', trend: 'Mild', color: C.amber },
                  { label: 'Sleep', value: '7.2h avg', trend: 'Adequate', color: C.green },
                  { label: 'Exercise', value: '3x/week', trend: 'On track', color: C.green },
                  { label: 'Menstrual Diary', value: 'Updated', trend: 'Active', color: C.green },
                  { label: 'Med Adherence', value: '98%', trend: 'Excellent', color: C.green },
                  { label: 'Symptom Log', value: 'Current', trend: 'Active', color: C.green },
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
              <div style={S.secTitle}>Multidisciplinary Team &mdash; Women's Health</div>
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
              <div style={S.secTitle}>Women's Health Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'All Women Registered', count: 3542, color: C.purple },
                  { label: 'Cervical Screening Up-to-Date', count: 1876, color: C.green },
                  { label: 'Mammogram Completed', count: 2150, color: C.sky },
                  { label: 'Contraception Users', count: 2340, color: C.green },
                  { label: 'Fertility Tracking', count: 456, color: C.amber },
                  { label: 'Menopause Management', count: 892, color: C.red },
                  { label: 'Gynae Cancers', count: 189, color: C.red },
                  { label: 'Osteoporosis Registry', count: 312, color: C.amber },
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
                    <select style={S.sel}><option>All Cohorts</option><option>Screening</option><option>Menopause</option><option>Fertility</option><option>Oncology</option></select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Name</span><span>MRN</span><span>Age</span><span>Cohort</span><span>Status</span><span>Last Visit</span>
                  </div>
                  {[
                    { name: 'Sarah Wangari', mrn: 'WH-001', age: '42', cohort: 'Menopause', status: 'Active', visit: '2025-06-15' },
                    { name: 'Grace Akinyi', mrn: 'WH-012', age: '55', cohort: 'Breast Screening', status: 'Follow-up', visit: '2025-05-20' },
                    { name: 'Faith Nyambura', mrn: 'WH-024', age: '34', cohort: 'Cervical Screening', status: 'Pending', visit: '2025-04-10' },
                    { name: 'Margaret Wairimu', mrn: 'WH-036', age: '68', cohort: 'Osteoporosis', status: 'Active', visit: '2025-06-01' },
                    { name: 'Jane Wanjiku', mrn: 'WH-048', age: '39', cohort: 'Fertility', status: 'Active', visit: '2025-06-10' },
                    { name: 'Ann Muthoni', mrn: 'WH-055', age: '47', cohort: 'Perimenopause', status: 'New', visit: '2025-07-05' },
                  ].map((rp, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{rp.name}</span>
                      <span style={{ color: C.textLight }}>{rp.mrn}</span>
                      <span style={{ color: C.text }}>{rp.age}</span>
                      <span style={{ color: C.text }}>{rp.cohort}</span>
                      <span style={S.badge(statusColor(rp.status))}>{rp.status}</span>
                      <span style={{ color: C.textLight }}>{rp.visit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── QUALITY ─── */}
          {tab === 'quality' && (
            <>
              <div style={S.secTitle}>Quality Indicators &mdash; Women's Health</div>
              <div style={S.grid4}>
                {[
                  { metric: 'Cervical Screening Coverage', value: '68%', target: '80%', trend: '↑', color: C.amber },
                  { metric: 'Mammogram Adherence', value: '72%', target: '85%', trend: '↑', color: C.amber },
                  { metric: 'HPV Vaccination (12-13yr)', value: '82%', target: '90%', trend: '↑', color: C.amber },
                  { metric: 'Contraception Access', value: '76%', target: '85%', trend: '→', color: C.amber },
                  { metric: 'Menopause Care Review', value: '54%', target: '75%', trend: '↑', color: C.red },
                  { metric: 'Bone Density Screening', value: '48%', target: '70%', trend: '↑', color: C.red },
                  { metric: 'Fertility Referral Wait', value: '12 wks', target: '<8 wks', trend: '→', color: C.amber },
                  { metric: 'Gynae Cancer 62-day', value: '85%', target: '96%', trend: '↓', color: C.red },
                ].map(q => (
                  <div key={q.metric} style={{ ...S.card, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{q.metric}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{q.value}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
                      <span style={{ color: C.textLight }}>Target: {q.target}</span>
                      <span style={{ color: q.color, fontWeight: 600 }}>{q.trend}</span>
                    </div>
                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: C.border, marginTop: 8 }}>
                      <div style={{ width: q.value, height: 4, borderRadius: 2, background: q.color }} />
                    </div>
                    <span style={{ ...S.badge(parseInt(q.value) >= parseInt(q.target) ? C.green : q.color), marginTop: 6, display: 'inline-block' }}>
                      {parseInt(q.value) >= parseInt(q.target) ? 'On Target' : 'Below Target'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Improvement Initiatives</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: 'Cervical Screening Recall Programme', desc: 'Automated SMS reminders for overdue LARC patients', progress: '62%', color: C.sky },
                    { title: 'Menopause Care Pathway', desc: 'Standardised menopause assessment and HRT counselling', progress: '44%', color: C.amber },
                    { title: 'Breast Screening Uptake Initiative', desc: 'Community health worker outreach for underserved areas', progress: '58%', color: C.green },
                    { title: 'Osteoporosis Screening in Menopause', desc: 'DXA referral protocol for all women >50 entering menopause', progress: '35%', color: C.red },
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
              <div style={S.secTitle}>Patient Portal &mdash; Sarah Wangari</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Today's Status</div>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${C.green}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={32} color={C.green} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Well-Woman: Stable</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Last review: 2025-06-15 &mdash; All screening up to date</div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Medication Reminders</div>
                  {['Levothyroxine 75 mcg daily', 'Vitamin D3 1,000 IU daily', 'Calcium 500 mg daily', 'Tranexamic acid 1g TDS PRN (periods)'].map(m => (
                    <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', fontSize: 11 }}>
                      <CheckCircle size={10} color={C.green} />
                      <span style={{ color: C.text }}>{m}</span>
                    </div>
                  ))}
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Screening Schedule</div>
                  <div style={{ fontSize: 11, color: C.text }}>Next Mammogram: 2026-09</div>
                  <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Next Pap/HPV: 2030</div>
                  <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Next DEXA: 2027</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Education</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Perimenopause self-management, menstrual diary, breast self-awareness, HPV education, bone health nutrition, cardiovascular risk in menopause</div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Appointments</div>
                  <div style={{ fontSize: 11, color: C.text }}>Next Gynaecology Review: 2026-06-15</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Last seen: 2025-06-15</div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recent Results</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 10 }}>
                    {[
                      { test: 'Mammogram', result: 'BI-RADS 1, Normal', date: '2024-09-01' },
                      { test: 'Cervical Cytology', result: 'Normal, HPV Negative', date: '2025-06-15' },
                      { test: 'TSH', result: '3.1 mIU/L (Controlled)', date: '2025-06-15' },
                      { test: 'Lipid Profile', result: 'LDL 2.8, HDL 1.4', date: '2025-06-15' },
                      { test: 'Vitamin D', result: '28 ng/mL (Sufficient)', date: '2025-06-15' },
                    ].map(r => (
                      <div key={r.test} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: 4, background: C.panel }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{r.test}</span>
                        <span style={{ color: C.text }}>{r.result}</span>
                        <span style={{ color: C.textLight }}>{r.date}</span>
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Educational Content</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { title: 'Perimenopause Guide', desc: 'Understanding the transition', color: C.purple },
                      { title: 'Bone Health', desc: 'Osteopenia management', color: C.sky },
                      { title: 'HPV & Cervical Health', desc: 'After HPV clearance', color: C.green },
                      { title: 'Menstrual Health', desc: 'Managing heavy periods', color: C.amber },
                    ].map(e => (
                      <div key={e.title} style={{ padding: '12px', borderRadius: 8, background: C.panel, cursor: 'pointer' }}>
                        <BookOpen size={20} color={e.color} />
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginTop: 6 }}>{e.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>{e.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Progress Badges</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={S.pill(C.green)}>Screening Up-to-Date</span>
                      <span style={S.pill(C.amber)}>Thyroid Controlled</span>
                      <span style={S.pill(C.green)}>HPV Cleared</span>
                    </div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Communication</div>
                  <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Send a secure message to your care team..." />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button style={S.btn(C.purple)}><MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Send Message</button>
                    <button style={S.btnO}>View Messages</button>
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