'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, Eye, Brain, Bone, Filter, HeartPulse, type LucideIcon, Zap, Home, Globe, Baby, Apple, Target, BarChart3, Sliders, LineChart } from 'lucide-react'
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
    case 'Active': case 'Complete': case 'Controlled': case 'On Track': case 'Available': case 'Good': return C.green
    case 'Resolved': case 'Excellent': return C.green
    case 'Fair': case 'Pending': case 'Needs Attention': case 'Moderate': case 'Stable': case 'Mild': return C.amber
    case 'Poor': case 'Behind': case 'Critical': case 'Uncontrolled': case 'High': case 'Severe': case 'Unavailable': case 'Reduced': return C.red
    case 'Normal': return C.sky
    default: return C.text
  }
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Disease Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Disease Snapshot', icon: Heart },
  { id: 'timeline', label: 'Lifetime Timeline', icon: Clock },
  { id: 'genotype', label: 'Genotype Intelligence', icon: Brain },
  { id: 'crises', label: 'Crisis Intelligence', icon: AlertTriangle },
  { id: 'pain', label: 'Pain Intelligence', icon: Activity },
  { id: 'brain', label: 'Brain Protection', icon: Brain },
  { id: 'lungs', label: 'Lung Protection', icon: Wind },
  { id: 'heart', label: 'Heart Protection', icon: HeartPulse },
  { id: 'kidneys', label: 'Kidney Protection', icon: Filter },
  { id: 'bones', label: 'Bone & Joint', icon: Bone },
  { id: 'eyes', label: 'Eye Protection', icon: Eye },
  { id: 'spleen', label: 'Spleen & Liver', icon: Monitor },
  { id: 'preventive', label: 'Preventive Care', icon: Shield },
  { id: 'hydroxyurea', label: 'Hydroxyurea', icon: Pill },
  { id: 'transfusions', label: 'Transfusion Intelligence', icon: Syringe },
  { id: 'iron', label: 'Iron Overload', icon: Weight },
  { id: 'growth', label: 'Growth & Development', icon: TrendingUp },
  { id: 'pregnancy', label: 'Pregnancy', icon: Baby },
  { id: 'transition', label: 'Transition Center', icon: Users },
  { id: 'psychosocial', label: 'Psychosocial', icon: MessageSquare },
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
  { label: 'CKD', href: '/ckd' },
  { label: 'Respiratory', href: '/respiratory' },
  { label: 'Heart Failure', href: '/hf' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Oncology', href: '/oncology' },
  { label: 'Neurology', href: '/neurology' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

export default function SickleCellWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Sickle Cell Disease Intelligence Center &mdash; Volume XI-F</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>SC</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Sickle Cell</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Sickle Cell Disease Intelligence Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>A Comprehensive Lifelong SCD Operating System &mdash; Volume XI-F</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.amber)}>Moderate Risk</span>
                  <span style={S.pill(C.green)}>156 Stable</span>
                  <span style={S.pill(C.red)}>28 High Risk</span>
                </div>
              </div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.amber}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Brian Otieno / 16 Years / Male / HbSS</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Status: Stable &middot; Last Crisis: 4 months ago &middot; Stroke Risk: Moderate &middot; Hydroxyurea: Active</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.green)}>Stable</span>
                    <span style={S.badge(C.amber)}>HbSS</span>
                    <span style={S.badge(C.amber)}>Moderate Risk</span>
                  </div>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'Total SCD Patients', value: '847', icon: Users, color: C.sky },
                  { label: 'HbSS', value: '524', icon: Droplets, color: C.red },
                  { label: 'HbSC', value: '218', icon: Droplets, color: C.amber },
                  { label: 'Crisis Frequency', value: '3.2/yr', icon: AlertTriangle, color: C.amber },
                  { label: 'ACS Incidence', value: '0.3/yr', icon: Wind, color: C.red },
                  { label: 'Stroke History', value: '12%', icon: Brain, color: C.red },
                  { label: 'Transfusion Burden', value: '186', icon: Syringe, color: C.purple },
                  { label: 'Mortality', value: '2.1%', icon: Heart, color: C.red },
                ].map(s => (
                  <div key={s.label} style={S.statCard}>
                    <s.icon size={20} color={s.color} />
                    <div style={S.statValue}>{s.value}</div>
                    <div style={S.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Active Alerts</div>
                <div style={S.grid2}>
                  {[
                    { title: 'Crisis Risk Elevated', patient: 'Brian Otieno', detail: 'Cold season onset, poor hydration last 3 days', color: C.amber },
                    { title: 'Hydroxyurea Review Due', patient: 'Mary Atieno', detail: 'HbF response pending, dose adjustment needed', color: C.amber },
                    { title: 'TCD Screening Overdue', patient: 'Samuel Ochieng', detail: 'Last TCD 14 months ago, repeat due', color: C.red },
                    { title: 'Transition Education Pending', patient: 'Grace Akinyi', detail: 'Aged 17, transition pathway not initiated', color: C.amber },
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
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Patient Assessment</button>
                  <button style={S.btn(C.green)}><Pill size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Hydroxyurea Review</button>
                  <button style={S.btn(C.purple)}><Syringe size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Transfusion Planning</button>
                  <button style={S.btnO}><Shield size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Preventive Care Check</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.green}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Brian Otieno / 16 Years / Male / HbSS</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Disease Status: Stable &middot; Genotype: HbSS &middot; Hydroxyurea: Active &middot; Last Crisis: 4 months ago</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.green)}>Stable</span>
                    <span style={S.badge(C.amber)}>HbSS</span>
                    <span style={S.badge(C.sky)}>16 Years</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Disease Snapshot &mdash; Key Clinical Parameters</div>
              <div style={S.grid4}>
                {[
                  { label: 'Hemoglobin', value: '8.4 g/dL', color: C.amber },
                  { label: 'HbF', value: '18%', color: C.green },
                  { label: 'Reticulocytes', value: '11%', color: C.amber },
                  { label: 'SpO2', value: '97%', color: C.green },
                  { label: 'Pain Score', value: '2/10', color: C.green },
                  { label: 'Last Admission', value: '4 months', color: C.amber },
                  { label: 'Hydroxyurea', value: 'Good adherence', color: C.green },
                  { label: 'Transfusions', value: '12 lifetime', color: C.amber },
                  { label: 'TCD', value: 'Normal', color: C.green },
                  { label: 'MRI Brain', value: 'Normal', color: C.green },
                  { label: 'Ferritin', value: '800 ng/mL', color: C.amber },
                  { label: 'WBC', value: '12 x10^9/L', color: C.amber },
                ].map(m => (
                  <div key={m.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${m.color}` }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{m.value}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginTop: 6 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TIMELINE ─── */}
          {tab === 'timeline' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Lifetime Disease Timeline &mdash; Brian Otieno</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { year: '2025', title: 'Adult Transition', desc: 'Transition program initiated, adult physician pending assignment', icon: Users, color: C.sky },
                  { year: '2024', title: 'Hip AVN Diagnosed', desc: 'Right hip AVN confirmed on MRI, orthopedic referral, physiotherapy started', icon: Bone, color: C.red },
                  { year: '2023', title: 'Exchange Transfusion', desc: 'Acute stroke protocol, exchange transfusion completed, neurologic recovery', icon: Syringe, color: C.purple },
                  { year: '2022', title: 'Stroke Event', desc: 'Left MCA territory stroke, NIHSS 8, TCD 210 cm/s, exchange transfusion initiated', icon: Brain, color: C.red },
                  { year: '2021', title: 'Hydroxyurea Initiated', desc: 'Started hydroxyurea 20 mg/kg, HbF response 14%, good tolerance', icon: Pill, color: C.green },
                  { year: '2020', title: 'ACS Episode', desc: 'Acute chest syndrome, oxygen required, IV antibiotics, 7-day admission', icon: Wind, color: C.red },
                  { year: '2019', title: 'Vaccination Complete', desc: 'Pneumococcal, meningococcal, influenza vaccine series completed', icon: Shield, color: C.green },
                  { year: '2018', title: 'Penicillin Prophylaxis', desc: 'Daily penicillin V commenced per SCD prophylaxis protocol', icon: Pill, color: C.green },
                  { year: '2017', title: 'Newborn Screen', desc: 'HbSS confirmed on newborn screening, first hematology visit', icon: Heart, color: C.sky },
                  { year: '2016', title: 'Birth', desc: 'Born at term, uncomplicated delivery, birth weight 3.2 kg', icon: Baby, color: C.green },
                ].map((e, i) => (
                  <div key={e.year} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${e.color}15`, border: `2px solid ${e.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <e.icon size={14} color={e.color} />
                      </div>
                      {i < 9 && <div style={{ width: 2, height: '100%', background: C.border, flex: 1 }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: e.color }}>{e.year}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{e.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Add Timeline Event</div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Year</label>
                    <input style={S.input} placeholder="e.g. 2026" />
                  </div>
                  <div>
                    <label style={S.label}>Event Type</label>
                    <select style={S.sel}>
                      <option>Crisis</option>
                      <option>Admission</option>
                      <option>Medication Change</option>
                      <option>Procedure</option>
                      <option>Screening</option>
                      <option>Vaccination</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={S.label}>Description</label>
                    <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Describe the event..." />
                  </div>
                  <div>
                    <button style={S.btn(C.sky)}>Add to Timeline</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── GENOTYPE ─── */}
          {tab === 'genotype' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Genotype Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Genotype Classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'HbSS', status: true, desc: 'Homozygous Sickle Cell Disease', color: C.red },
                      { label: 'HbSC', status: false, desc: 'Compound Heterozygous', color: C.textLight },
                      { label: 'HbSβ0', status: false, desc: 'Sickle Beta-zero Thalassemia', color: C.textLight },
                      { label: 'HbSβ+', status: false, desc: 'Sickle Beta-plus Thalassemia', color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${p.status ? C.sky : C.border}`, background: p.status ? C.sky : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.status && <CheckCircle size={14} color={C.white} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{p.label}</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.desc}</div>
                        </div>
                        <span style={S.badge(p.status ? C.green : C.textLight)}>{p.status ? 'Confirmed' : 'Not Present'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Family Pedigree & Carrier Screening</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Pedigree: HbSS</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Father: HbAS (Carrier) &middot; Mother: HbAS (Carrier) &middot; Sibling 1: HbAA &middot; Sibling 2: HbAS &middot; Patient: HbSS
                    </div>
                    <div style={{ ...S.divider, margin: '12px 0' }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Carrier Screening Information</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>
                      Sibling carrier screening completed. Genetic counselling offered. Reproductive risk counselling pending for patient.
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={S.label}>Genetic Counselling Status</label>
                    <select style={S.sel}>
                      <option>Completed</option>
                      <option>Offered — Pending</option>
                      <option>Declined</option>
                      <option>Not Indicated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── CRISES ─── */}
          {tab === 'crises' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Crisis Intelligence Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Comprehensive vaso-occlusive crisis tracking and pattern analysis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { trigger: 'Cold Exposure', painDist: 'Chest, Back, Legs', score: '8/10', treatment: 'IV fluids, Morphine PCA, Ketorolac', stay: '5 days', complications: 'ACS', recovery: 'Complete', date: 'Mar 2025', color: C.red },
                  { trigger: 'Infection (URTI)', painDist: 'Abdomen, Lower Back', score: '6/10', treatment: 'IV fluids, NSAIDs, Antibiotics', stay: '3 days', complications: 'None', recovery: 'Complete', date: 'Nov 2024', color: C.amber },
                  { trigger: 'Dehydration', painDist: 'Bilateral Legs', score: '5/10', treatment: 'Oral/IV fluids, Acetaminophen', stay: '2 days', complications: 'None', recovery: 'Complete', date: 'Jul 2024', color: C.amber },
                ].map((c, i) => (
                  <div key={i} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertTriangle size={18} color={c.color} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Crisis Event &mdash; {c.date}</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>Trigger: {c.trigger}</div>
                        </div>
                      </div>
                      <span style={S.badge(c.color)}>Pain: {c.score}</span>
                    </div>
                    <div style={S.grid3}>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Pain Distribution</span><div style={{ fontSize: 11, color: C.navy, fontWeight: 500 }}>{c.painDist}</div></div>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Treatment</span><div style={{ fontSize: 11, color: C.navy, fontWeight: 500 }}>{c.treatment}</div></div>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Hospital Stay</span><div style={{ fontSize: 11, color: C.navy, fontWeight: 500 }}>{c.stay}</div></div>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Complications</span><div style={{ fontSize: 11, color: c.complications === 'None' ? C.green : C.red, fontWeight: 500 }}>{c.complications}</div></div>
                      <div><span style={{ fontSize: 10, color: C.textLight }}>Recovery</span><div style={{ fontSize: 11, color: C.green, fontWeight: 500 }}>{c.recovery}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pattern Analysis</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ padding: '10px 16px', borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25`, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Seasonal Pattern</div>
                    <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>Mostly cold season (Nov&ndash;Mar)</div>
                  </div>
                  <div style={{ padding: '10px 16px', borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}25`, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Hydration Link</div>
                    <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>Associated with poor hydration prior to onset</div>
                  </div>
                  <div style={{ padding: '10px 16px', borderRadius: 8, background: `${C.purple}10`, border: `1px solid ${C.purple}25`, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Crisis Frequency</div>
                    <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>3.2 crises/year, improving on hydroxyurea</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PAIN ─── */}
          {tab === 'pain' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Pain Intelligence Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Acute Pain Profile</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Current Pain Score', value: '2/10', color: C.green },
                      { label: 'Crisis Pain (Average)', value: '6.5/10', color: C.amber },
                      { label: 'Crisis Pain (Worst)', value: '9/10', color: C.red },
                      { label: 'Pain Distribution', value: 'Chest, Back, Limbs', color: C.navy },
                      { label: 'Opioid Use (Current)', value: 'None — Crisis Only', color: C.green },
                      { label: 'Opioid Response', value: 'Good — PCA Morphine', color: C.green },
                      { label: 'NSAID Use', value: 'Ketorolac PRN', color: C.amber },
                      { label: 'Neuropathic Features', value: 'None', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Chronic Pain & Psychological Impact</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>Chronic Pain Baseline</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>Mild — Intermittent</div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>Pain Interference</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>Moderate — School attendance affected</div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>Psychological Impact</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>Mild anxiety related to pain episodes</div>
                      </div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pain Management Plan</div>
                    <div style={{ fontSize: 10, color: C.textLight, lineHeight: 1.6 }}>
                      <strong style={{ color: C.navy }}>Mild Pain:</strong> Acetaminophen + NSAIDs, oral hydration<br />
                      <strong style={{ color: C.navy }}>Moderate Pain:</strong> Oral opioids + NSAIDs, IV fluids if needed<br />
                      <strong style={{ color: C.navy }}>Severe Pain:</strong> IV opioids (PCA), IV fluids, admission<br />
                      <strong style={{ color: C.navy }}>Adjuvant:</strong> Hydroxyurea adherence, warm compresses, psychological support
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pain Maps</div>
                <div style={S.grid3}>
                  <div style={{ padding: 16, borderRadius: 8, background: C.panel, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Chest</div>
                    <div style={{ fontSize: 10, color: C.red, marginTop: 4 }}>Most Common</div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 8, background: C.panel, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Back</div>
                    <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>Frequent</div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 8, background: C.panel, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Lower Limbs</div>
                    <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>Frequent</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── BRAIN ─── */}
          {tab === 'brain' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>XI-F1 Brain Protection</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cerebrovascular Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Stroke', value: 'Yes — 2022 (Left MCA)', color: C.red },
                      { label: 'TIA', value: 'No', color: C.green },
                      { label: 'Silent Infarcts', value: 'None on MRI', color: C.green },
                      { label: 'TCD Velocity', value: 'Normal — 140 cm/s', color: C.green },
                      { label: 'Cognitive Assessment', value: 'Normal', color: C.green },
                      { label: 'School Performance', value: 'Good', color: C.green },
                    ].map(b => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{b.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: b.color }}>{b.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Stroke Prevention Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Chronic Transfusion Program</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Exchange transfusions every 4 weeks &middot; HbS target &lt;30%</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>TCD Monitoring</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Annual TCD &middot; Last: 140 cm/s (Normal)</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>MRI Surveillance</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>MRI brain every 2 years &middot; Last: Normal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── LUNGS ─── */}
          {tab === 'lungs' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>XI-F2 Lung Protection</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pulmonary Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'ACS Episodes', value: '1 episode — 2021', color: C.amber },
                      { label: 'Pulmonary Hypertension', value: 'No', color: C.green },
                      { label: 'Spirometry', value: 'Normal', color: C.green },
                      { label: 'Oxygen Requirement', value: 'None — Room air', color: C.green },
                      { label: 'Sleep Apnea', value: 'No', color: C.green },
                    ].map(l => (
                      <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{l.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: l.color }}>{l.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>ACS Risk Reduction</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} color={C.green} />
                      <span style={{ fontSize: 11, color: C.text }}>Influenza vaccination — Annual</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} color={C.green} />
                      <span style={{ fontSize: 11, color: C.text }}>Pneumococcal vaccination — Completed</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} color={C.green} />
                      <span style={{ fontSize: 11, color: C.text }}>Hydroxyurea therapy — Reduces ACS risk</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} color={C.green} />
                      <span style={{ fontSize: 11, color: C.text }}>Asthma management — No diagnosis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HEART ─── */}
          {tab === 'heart' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>XI-F3 Heart Protection</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cardiac Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Echocardiogram', value: 'Normal', color: C.green },
                      { label: 'Pulmonary Pressures', value: '25 mmHg', color: C.green },
                      { label: 'Cardiomyopathy', value: 'No', color: C.green },
                      { label: 'Heart Failure', value: 'No', color: C.green },
                      { label: 'Right Heart Function', value: 'Normal', color: C.green },
                      { label: 'Left Heart Function', value: 'Normal', color: C.green },
                    ].map(h => (
                      <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{h.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: h.color }}>{h.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Cardiac Monitoring Plan</div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 4 }}>Next Echocardiogram</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Due in 12 months &middot; Routine surveillance</div>
                  </div>
                  <div style={{ ...S.divider, margin: '12px 0' }} />
                  <div style={{ fontSize: 10, color: C.textLight }}>
                    Annual cardiac assessment recommended for SCD patients on chronic transfusion program due to iron overload risk.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── KIDNEYS ─── */}
          {tab === 'kidneys' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>XI-F4 Kidney Protection</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Renal Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Albuminuria', value: 'Negative', color: C.green },
                      { label: 'eGFR', value: '120 mL/min/1.73m²', color: C.green },
                      { label: 'CKD Stage', value: 'None', color: C.green },
                      { label: 'Serum Creatinine', value: '0.6 mg/dL', color: C.green },
                      { label: 'Blood Pressure', value: '110/68', color: C.green },
                      { label: 'Urine ACR', value: '&lt;3 mg/g', color: C.green },
                    ].map(k => (
                      <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{k.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: k.color }}>{k.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Linked to Renal Intelligence</div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 4 }}>CKD Workspace</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>
                      This patient&rsquo;s renal data is linked to the comprehensive CKD Intelligence Center for longitudinal tracking and early detection of sickle cell nephropathy.
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={S.label}>Annual Renal Screen</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 11 }}>
                      <CheckCircle size={14} color={C.green} />
                      <span style={{ color: C.text }}>Completed &mdash; Due in 10 months</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── BONES ─── */}
          {tab === 'bones' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>XI-F5 Bones & Joints</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Osteoarticular Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'AVN', value: 'Right hip — 2023', color: C.red },
                      { label: 'Hip Replacement', value: 'Planned', color: C.amber },
                      { label: 'Bone Infarction', value: 'None', color: C.green },
                      { label: 'Osteomyelitis', value: 'No', color: C.green },
                      { label: 'Mobility Status', value: 'Reduced — Uses crutches', color: C.amber },
                      { label: 'Physiotherapy', value: 'Active — Weekly sessions', color: C.green },
                    ].map(b => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{b.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: b.color }}>{b.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>AVN Management Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Conservative</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Physiotherapy, weight-bearing restriction, analgesia</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Surgical Planning</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Total hip arthroplasty &mdash; Pre-op assessment pending</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Post-op Plan</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Rehabilitation protocol, DVT prophylaxis, infection prevention</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── EYES ─── */}
          {tab === 'eyes' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>XI-F6 Eye Protection</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Ophthalmologic Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Sickle Retinopathy', value: 'None', color: C.green },
                      { label: 'Visual Acuity', value: '6/6 — Both eyes', color: C.green },
                      { label: 'Laser Therapy', value: 'None', color: C.green },
                      { label: 'Ophthalmology Review', value: 'Annual — Due', color: C.amber },
                    ].map(e => (
                      <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{e.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: e.color }}>{e.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Screening Schedule</div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}25` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 4 }}>Annual Dilated Eye Exam</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>Due for review &middot; Last exam: 11 months ago</div>
                  </div>
                  <div style={{ ...S.divider, margin: '12px 0' }} />
                  <div style={{ fontSize: 10, color: C.textLight }}>
                    Annual dilated fundoscopy recommended starting at age 10 for HbSS patients. Retinopathy screening is critical for preventing vision loss.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SPLEEN ─── */}
          {tab === 'spleen' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>XI-F7 Spleen & Liver</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Splenic Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Splenic Sequestration', value: 'None since age 4', color: C.green },
                      { label: 'Autosplenectomy', value: 'Yes — Age 7', color: C.amber },
                      { label: 'Overwhelming Post-splenectomy Infection Risk', value: 'Managed — Vaccination complete', color: C.green },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{s.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Hepatic Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Gallstones', value: 'None', color: C.green },
                      { label: 'Cholecystectomy', value: 'No', color: C.green },
                      { label: 'Liver Disease', value: 'No', color: C.green },
                      { label: 'Iron Overload', value: 'Mild', color: C.amber },
                      { label: 'Liver Enzymes', value: 'Normal', color: C.green },
                    ].map(h => (
                      <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{h.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: h.color }}>{h.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PREVENTIVE ─── */}
          {tab === 'preventive' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Preventive Care Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Preventive Checklist</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Penicillin Prophylaxis', status: 'Active', color: C.green },
                      { item: 'Pneumococcal Vaccine', status: 'Complete', color: C.green },
                      { item: 'Meningococcal Vaccine', status: 'Complete', color: C.green },
                      { item: 'Influenza Vaccine', status: 'Annual — Due', color: C.amber },
                      { item: 'Malaria Prevention', status: 'Active', color: C.green },
                      { item: 'TCD Screening', status: 'Annual — Up to date', color: C.green },
                      { item: 'Eye Review', status: 'Due', color: C.red },
                      { item: 'Kidney Screen', status: 'Completed', color: C.green },
                      { item: 'Hydroxyurea Review', status: 'Due in 2 weeks', color: C.amber },
                      { item: 'Dental Check', status: 'Due', color: C.red },
                      { item: 'Transition Education', status: 'Pending', color: C.red },
                    ].map(p => (
                      <div key={p.item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        {p.status === 'Active' || p.status === 'Complete' || p.status === 'Completed' || p.status === 'Annual — Up to date'
                          ? <CheckCircle size={14} color={C.green} />
                          : <XCircle size={14} color={p.color} />}
                        <span style={{ flex: 1, fontSize: 11, color: C.navy }}>{p.item}</span>
                        <span style={S.badge(p.color)}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Vaccination Schedule</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: C.text }}>Pneumococcal Conjugate (PCV13)</span>
                      <span style={S.badge(C.green)}>Complete</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: C.text }}>Pneumococcal Polysaccharide (PPSV23)</span>
                      <span style={S.badge(C.green)}>Complete</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: C.text }}>Meningococcal ACWY</span>
                      <span style={S.badge(C.green)}>Complete</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: C.text }}>Meningococcal B</span>
                      <span style={S.badge(C.green)}>Complete</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: C.text }}>Influenza (Annual)</span>
                      <span style={S.badge(C.amber)}>Due</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HYDROXYUREA ─── */}
          {tab === 'hydroxyurea' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Hydroxyurea Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Therapy Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Started', value: '2020', color: C.navy },
                      { label: 'Current Dose', value: '20 mg/kg/day', color: C.navy },
                      { label: 'Escalation Target', value: '25 mg/kg/day', color: C.amber },
                      { label: 'Max Tolerated Dose', value: '25 mg/kg/day', color: C.green },
                      { label: 'HbF Response', value: '14% → 18%', color: C.green },
                      { label: 'Neutrophil Count', value: '2.5 x10^9/L', color: C.green },
                      { label: 'Platelet Count', value: '300 x10^9/L', color: C.green },
                      { label: 'Adherence Rate', value: '95%', color: C.green },
                      { label: 'Side Effects', value: 'None', color: C.green },
                    ].map(h => (
                      <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{h.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: h.color }}>{h.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Therapy Optimization</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Laboratory Monitoring</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>FBC & HbF every 3 months &middot; Renal & liver function every 6 months</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Dose Adjustment Protocol</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Escalate by 5 mg/kg every 8 weeks if ANC &gt;2.0 and HbF response suboptimal</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Next Review</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Due in 2 weeks &middot; HbF, FBC, adherence assessment</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TRANSFUSIONS ─── */}
          {tab === 'transfusions' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Transfusion Intelligence Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Transfusion Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Simple Transfusions', value: '8', color: C.sky },
                      { label: 'Exchange Transfusions', value: '4', color: C.purple },
                      { label: 'Indications', value: 'Stroke prophylaxis, ACS', color: C.navy },
                      { label: 'Total Units', value: '24 units', color: C.amber },
                      { label: 'Blood Phenotype', value: 'O+', color: C.navy },
                      { label: 'Alloantibodies', value: 'None', color: C.green },
                      { label: 'Iron Overload', value: 'Mild', color: C.amber },
                      { label: 'Chelation Therapy', value: 'Deferasirox 20 mg/kg', color: C.sky },
                      { label: 'Complications', value: 'None', color: C.green },
                    ].map(t => (
                      <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{t.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: t.color }}>{t.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Exchange Transfusion Protocol</div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.purple}10`, border: `1px solid ${C.purple}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Current Schedule</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Every 4 weeks &middot; Target HbS &lt;30% &middot; Target Hb 9&ndash;10 g/dL</div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Iron Chelation Monitoring</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ padding: '6px 10px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: C.textLight }}>Ferritin</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.amber }}>800 ng/mL</span>
                      </div>
                      <div style={{ padding: '6px 10px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: C.textLight }}>Liver Iron (MRI)</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.amber }}>3.2 mg/g</span>
                      </div>
                      <div style={{ padding: '6px 10px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: C.textLight }}>Cardiac Iron (MRI T2*)</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>32 ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── IRON ─── */}
          {tab === 'iron' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Iron Overload Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Iron Burden Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Cumulative Transfusion Burden', value: '24 units', color: C.amber },
                      { label: 'Serum Ferritin', value: '800 ng/mL', color: C.amber },
                      { label: 'MRI Liver Iron Concentration', value: '3.2 mg/g dry weight', color: C.amber },
                      { label: 'MRI Cardiac T2*', value: '32 ms', color: C.green },
                      { label: 'Chelation Therapy', value: 'Deferasirox 20 mg/kg/day', color: C.sky },
                      { label: 'Treatment Response', value: 'Stable', color: C.green },
                    ].map(i => (
                      <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{i.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: i.color }}>{i.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Chelation Monitoring</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Current Agent</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Deferasirox (Exjade) 20 mg/kg once daily</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Side Effects</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>None reported &middot; Renal function monitoring monthly</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Target Ferritin</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>&lt;500 ng/mL &middot; Annual MRI liver and cardiac iron</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── GROWTH ─── */}
          {tab === 'growth' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Growth & Development Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Growth Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Height Percentile', value: '25th %ile', color: C.amber },
                      { label: 'Weight Percentile', value: '10th %ile', color: C.red },
                      { label: 'BMI Percentile', value: '15th %ile', color: C.amber },
                      { label: 'Puberty Stage', value: 'Tanner Stage III', color: C.amber },
                      { label: 'Growth Velocity', value: '5.2 cm/year', color: C.amber },
                    ].map(g => (
                      <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{g.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: g.color }}>{g.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Development & School</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'School Attendance', value: '85%', color: C.amber },
                      { label: 'School Performance', value: 'Average', color: C.amber },
                      { label: 'Neurodevelopment', value: 'Normal', color: C.green },
                      { label: 'Psychological Adjustment', value: 'Adjusted', color: C.green },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{d.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Nutrition & Growth Support</div>
                <div style={S.grid3}>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: C.panel, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Dietitian Review</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Monthly &middot; Next in 2 weeks</div>
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: C.panel, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Folic Acid</div>
                    <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>5 mg daily &mdash; Active</div>
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: C.panel, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Vitamin D</div>
                    <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>Levels low — Supplementation started</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PREGNANCY ─── */}
          {tab === 'pregnancy' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Pregnancy Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Preconception Counselling</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Genetic counselling offered', done: false },
                      { item: 'Partner carrier screening', done: false },
                      { item: 'Medication review completed', done: false },
                      { item: 'Hydroxyurea safety discussed', done: false },
                      { item: 'Maternal-fetal medicine referral', done: false },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        {c.done ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.textLight} />}
                        <span style={{ color: c.done ? C.navy : C.textLight }}>{c.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pregnancy Risks in SCD</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}10`, fontSize: 10 }}>
                      <strong style={{ color: C.navy }}>Maternal:</strong> Increased pain crises, ACS, preeclampsia, venous thromboembolism
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}10`, fontSize: 10 }}>
                      <strong style={{ color: C.navy }}>Fetal:</strong> IUGR, preterm birth, low birth weight, perinatal mortality
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.green}10`, fontSize: 10 }}>
                      <strong style={{ color: C.navy }}>Current Status:</strong> No active pregnancy — preconception phase
                    </div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Antepartum Management Plan</div>
                  <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Multidisciplinary care plan including hematology, obstetrics, and anesthesia..." />
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Delivery & Postpartum</div>
                  <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Delivery mode, transfusion support, analgesia plan, postpartum monitoring..." />
                </div>
              </div>
            </div>
          )}

          {/* ─── TRANSITION ─── */}
          {tab === 'transition' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Transition Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Transition Readiness Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Disease Knowledge', value: '80%', color: C.amber },
                      { label: 'Medication Independence', value: 'Partial', color: C.amber },
                      { label: 'Appointment Independence', value: 'No — Requires caregiver', color: C.red },
                      { label: 'Adult Physician Assigned', value: 'Pending', color: C.red },
                      { label: 'Transition Completed', value: 'No', color: C.red },
                    ].map(t => (
                      <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{t.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: t.color }}>{t.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Transition Milestones</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} color={C.green} />
                      <span style={{ fontSize: 11, color: C.text }}>Disease education sessions initiated</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} color={C.green} />
                      <span style={{ fontSize: 11, color: C.text }}>Self-management skills training started</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={14} color={C.red} />
                      <span style={{ fontSize: 11, color: C.textLight }}>Adult provider identified</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={14} color={C.red} />
                      <span style={{ fontSize: 11, color: C.textLight }}>Transition care plan completed</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={14} color={C.red} />
                      <span style={{ fontSize: 11, color: C.textLight }}>First adult clinic appointment scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Transition Care Plan</div>
                <div style={S.grid3}>
                  <div><label style={S.label}>Target Transition Age</label><input style={S.input} defaultValue="18" /></div>
                  <div><label style={S.label}>Adult Hematologist</label><input style={S.input} placeholder="To be assigned" /></div>
                  <div><label style={S.label}>Transition Readiness Score</label><input style={S.input} defaultValue="60%" /></div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PSYCHOSOCIAL ─── */}
          {tab === 'psychosocial' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Psychosocial Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Mental Health Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Depression (PHQ-9)', value: '5 — Mild', color: C.amber },
                      { label: 'Anxiety (GAD-7)', value: '4 — Mild', color: C.amber },
                      { label: 'Pain Catastrophizing', value: 'Low', color: C.green },
                      { label: 'Coping Strategy', value: 'Adaptive', color: C.green },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{m.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Social Determinants</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'School Attendance', value: '85%', color: C.amber },
                        { label: 'Employment Status', value: 'Student', color: C.green },
                        { label: 'Family Support', value: 'Good', color: C.green },
                        { label: 'Financial Barriers', value: 'Transport costs', color: C.amber },
                        { label: 'Social Work Interventions', value: 'Active', color: C.green },
                      ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: C.textLight }}>{s.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Support Plan</div>
                    <div style={{ fontSize: 10, color: C.textLight, lineHeight: 1.6 }}>
                      Referral to child life specialist. Peer support group enrollment. School liaison for attendance support. Transport subsidy application submitted.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {tab === 'team' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Multidisciplinary Team</div>
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>SCD Care Team &mdash; 12 Roles</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: 6, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Role</span><span>Name</span><span>Contact</span><span>Status</span>
                  </div>
                  {[
                    { role: 'Hematologist', name: 'Dr. Kamau', contact: 'Ext. 3201', status: 'Available', color: C.green },
                    { role: 'Pediatrician', name: 'Dr. Njoroge', contact: 'Ext. 2102', status: 'Available', color: C.green },
                    { role: 'Internist', name: 'Dr. Ochieng', contact: 'Ext. 2105', status: 'Consult', color: C.amber },
                    { role: 'Pain Specialist', name: 'Dr. Akinyi', contact: 'Ext. 4401', status: 'Available', color: C.green },
                    { role: 'Orthopedic Surgeon', name: 'Dr. Patel', contact: 'Ext. 3602', status: 'In Theatre', color: C.amber },
                    { role: 'Neurologist', name: 'Dr. Mwangi', contact: 'Ext. 3103', status: 'Available', color: C.green },
                    { role: 'Nephrologist', name: 'Dr. Wambui', contact: 'Ext. 3101', status: 'On Leave', color: C.red },
                    { role: 'Cardiologist', name: 'Dr. Chebet', contact: 'Ext. 3401', status: 'Available', color: C.green },
                    { role: 'Dietitian', name: 'Ms. Nyambura', contact: 'Ext. 4501', status: 'Available', color: C.green },
                    { role: 'Physiotherapist', name: 'Mr. Otieno', contact: 'Ext. 4402', status: 'Busy', color: C.amber },
                    { role: 'Psychologist', name: 'Dr. Atieno', contact: 'Ext. 6302', status: 'Available', color: C.green },
                    { role: 'Social Worker', name: 'Ms. Jerono', contact: 'Ext. 6303', status: 'Available', color: C.green },
                    { role: 'Genetic Counsellor', name: 'Ms. Wanjiku', contact: 'Ext. 6304', status: 'Available', color: C.green },
                  ].map(t => (
                    <div key={t.role} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: 6, padding: '5px 10px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{t.role}</span>
                      <span style={{ color: C.text }}>{t.name}</span>
                      <span style={{ color: C.textLight }}>{t.contact}</span>
                      <span style={S.badge(t.color)}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Care Coordination</div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Task</label>
                    <input style={S.input} placeholder="e.g. Arrange hip replacement review" />
                  </div>
                  <div>
                    <label style={S.label}>Assign To</label>
                    <select style={S.sel}>
                      <option>Hematologist</option>
                      <option>Orthopedic Surgeon</option>
                      <option>Pain Specialist</option>
                      <option>Social Worker</option>
                    </select>
                  </div>
                  <div>
                    <button style={S.btn(C.sky)}>Assign Task</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === 'registry' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Sickle Cell Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'Total Enrolled', value: '847', color: C.sky },
                  { label: 'HbSS', value: '524', color: C.red },
                  { label: 'HbSC', value: '218', color: C.amber },
                  { label: 'HbSβ Thal', value: '105', color: C.purple },
                  { label: 'Stroke History', value: '102', color: C.red },
                  { label: 'Hydroxyurea', value: '468', color: C.green },
                  { label: 'Chronic Transfusion', value: '86', color: C.purple },
                  { label: 'Pregnancy (Active)', value: '24', color: C.amber },
                  { label: 'Mortality (YTD)', value: '18', color: C.red },
                  { label: 'Transition (Active)', value: '92', color: C.sky },
                  { label: 'AVN', value: '76', color: C.amber },
                  { label: 'ACS (Lifetime)', value: '134', color: C.red },
                ].map(r => (
                  <div key={r.label} style={S.statCard}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: r.color }}>{r.value}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{r.label}</div>
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
                    <select style={S.sel}><option>All Genotypes</option><option>HbSS</option><option>HbSC</option><option>HbSβ</option></select>
                    <select style={S.sel}><option>All Status</option><option>Stable</option><option>High Risk</option><option>Critical</option></select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Name</span><span>MRN</span><span>Genotype</span><span>Age</span><span>Status</span><span>Last Visit</span>
                  </div>
                  {[
                    { name: 'Brian Otieno', mrn: 'SC-001', gt: 'HbSS', age: '16', status: 'Stable', visit: '2 weeks ago', sc: C.green },
                    { name: 'Mary Atieno', mrn: 'SC-012', gt: 'HbSS', age: '22', status: 'High Risk', visit: '3 days ago', sc: C.red },
                    { name: 'Samuel Ochieng', mrn: 'SC-024', gt: 'HbSC', age: '9', status: 'Stable', visit: '1 month ago', sc: C.green },
                    { name: 'Grace Akinyi', mrn: 'SC-036', gt: 'HbSS', age: '17', status: 'Transition', visit: '1 week ago', sc: C.amber },
                    { name: 'Peter Mwangi', mrn: 'SC-048', gt: 'HbSβ0', age: '31', status: 'Critical', visit: 'Today', sc: C.red },
                  ].map(p => (
                    <div key={p.mrn} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                      <span style={{ color: C.textLight }}>{p.mrn}</span>
                      <span style={{ color: C.text }}>{p.gt}</span>
                      <span style={{ color: C.text }}>{p.age}</span>
                      <span style={S.badge(p.sc)}>{p.status}</span>
                      <span style={{ color: C.textLight }}>{p.visit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── QUALITY ─── */}
          {tab === 'quality' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Quality Indicators</div>
              <div style={S.grid4}>
                {[
                  { metric: 'Hydroxyurea Use', value: '68%', target: '80%', trend: '↑', color: C.amber },
                  { metric: 'TCD Completion', value: '72%', target: '90%', trend: '↑', color: C.amber },
                  { metric: 'Vaccination Rate', value: '85%', target: '95%', trend: '→', color: C.amber },
                  { metric: 'Penicillin Adherence', value: '62%', target: '85%', trend: '↓', color: C.red },
                  { metric: 'Crisis Frequency', value: '3.2/yr', target: '<2.5/yr', trend: '↓', color: C.amber },
                  { metric: 'Admissions/Year', value: '1.8/yr', target: '<1.5/yr', trend: '→', color: C.amber },
                  { metric: 'ACS Incidence', value: '0.3/yr', target: '<0.2/yr', trend: '→', color: C.amber },
                  { metric: 'Stroke Incidence', value: '0.1/yr', target: '<0.05/yr', trend: '↓', color: C.amber },
                  { metric: 'Transition Completion', value: '45%', target: '75%', trend: '↑', color: C.red },
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
                    { title: 'Hydroxyurea Optimization Program', desc: 'Increase HU utilization from 68% to 85% through pharmacist-led adherence clinic', progress: '55%', color: C.sky },
                    { title: 'TCD Completion Initiative', desc: 'Automated reminders and dedicated screening days to reach 90% TCD completion', progress: '40%', color: C.amber },
                    { title: 'Transition Care Pathway', desc: 'Structured transition program for all patients aged 14+ moving to adult care', progress: '35%', color: C.green },
                    { title: 'Penicillin Adherence Project', desc: 'Home delivery program and caregiver education to improve prophylaxis adherence', progress: '50%', color: C.sky },
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
            </div>
          )}

          {/* ─── PORTAL ─── */}
          {tab === 'portal' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Patient Portal — Brian Otieno</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Today&rsquo;s Health Status</div>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${C.green}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={32} color={C.green} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Stable</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>No active crisis &middot; Pain 2/10 &middot; Adherent to hydroxyurea</div>
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Daily Tools</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>Pain Diary</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          <input style={S.input} placeholder="Pain score (0-10)" />
                          <input style={S.input} placeholder="Location" />
                        </div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ color: C.textLight, marginBottom: 4 }}>Medication Reminders</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={10} color={C.green} />
                            <span style={{ color: C.text }}>Hydroxyurea 20 mg/kg — Taken</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={10} color={C.green} />
                            <span style={{ color: C.text }}>Folic Acid 5 mg — Taken</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={10} color={C.green} />
                            <span style={{ color: C.text }}>Penicillin V — Taken</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Hydration Goal</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2.5L</div>
                          <div style={{ color: C.green }}>/day &middot; 1.2L consumed</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Next Appointment</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2 weeks</div>
                          <div style={{ color: C.textLight }}>Hematology Clinic</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Education & Resources</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { title: 'Understanding SCD', desc: 'Genetics, symptoms, treatment overview', icon: BookOpen, color: C.sky },
                      { title: 'Crisis Prevention', desc: 'Hydration, temperature, infection avoidance', icon: AlertTriangle, color: C.sky },
                      { title: 'Medication Guide', desc: 'Hydroxyurea, folic acid, penicillin', icon: Pill, color: C.sky },
                      { title: 'Warning Signs', desc: 'When to seek emergency care', icon: Shield, color: C.sky },
                    ].map(e => (
                      <div key={e.title} style={{ padding: '12px', borderRadius: 8, background: C.panel, cursor: 'pointer' }}>
                        <e.icon size={20} color={e.color} />
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginTop: 6 }}>{e.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>{e.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Family Screening Info</div>
                    <div style={{ fontSize: 10, color: C.textLight, lineHeight: 1.6 }}>
                      Sickle cell disease is inherited in an autosomal recessive pattern. Siblings and parents are encouraged to undergo carrier screening. Genetic counselling is available.
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Disease Timeline</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>
                      Birth → Newborn Screen → Penicillin Prophylaxis → Vaccinations → ACS Episode → Hydroxyurea Started → Stroke → Exchange Transfusion Program → Hip AVN → Adult Transition Planning
                    </div>
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
