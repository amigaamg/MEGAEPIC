'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Bed, Heart, Monitor, Wind, Droplets, Thermometer, Weight, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, BookOpen, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, Stethoscope, Ambulance, TrendingUp, type LucideIcon, UserPlus, ClipboardList, ArrowRightLeft, LogOut, Send, Eye, Hospital, Building, Filter, MoreHorizontal, Zap, Brain, Baby, Apple, Target, BarChart3, LineChart, Download, Printer, RefreshCw, Globe, Home, Sliders, HeartPulse } from 'lucide-react'
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

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Oncology Dashboard', icon: Activity },
  { id: 'snapshot', label: 'Cancer Snapshot', icon: Heart },
  { id: 'timeline', label: 'Cancer Timeline', icon: Clock },
  { id: 'tumor', label: 'Tumor Intelligence', icon: Brain },
  { id: 'staging', label: 'Staging Intelligence', icon: Sliders },
  { id: 'mdt', label: 'MDT / Tumor Board', icon: Users },
  { id: 'pathology', label: 'Pathology Intelligence', icon: FileText },
  { id: 'imaging', label: 'Imaging Intelligence', icon: Eye },
  { id: 'recist', label: 'RECIST Response', icon: TrendingUp },
  { id: 'surgery', label: 'Surgery Intelligence', icon: Bed },
  { id: 'chemo', label: 'Chemotherapy Intelligence', icon: Syringe },
  { id: 'immunotherapy', label: 'Immunotherapy', icon: Shield },
  { id: 'radiation', label: 'Radiotherapy', icon: Zap },
  { id: 'toxicity', label: 'Toxicity Intelligence', icon: AlertTriangle },
  { id: 'survivorship', label: 'Survivorship', icon: HeartPulse },
  { id: 'genetics', label: 'Genetics Center', icon: Brain },
  { id: 'fertility', label: 'Fertility Preservation', icon: Baby },
  { id: 'palliative', label: 'Palliative Care', icon: Heart },
  { id: 'home', label: 'Home Monitoring', icon: Home },
  { id: 'team', label: 'MDT Members', icon: Users },
  { id: 'registry', label: 'Registry', icon: BookOpen },
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
  { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Heart Failure', href: '/hf' },
  { label: 'Neurology', href: '/neurology' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

export default function OncologyWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Oncology & Cancer Intelligence Center &mdash; Volume XI-H</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>OC</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Oncology</div>
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Oncology & Cancer Intelligence Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>A Comprehensive Cancer Care Operating System</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.red)}>4 High Risk</span>
                  <span style={S.pill(C.amber)}>18 Active Adjuvant</span>
                  <span style={S.pill(C.green)}>42 Enrolled</span>
                </div>
              </div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.green}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Grace Njeri / 48 Years / Female</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Breast Cancer · HER2+ · Stage IIIB · Current: Neoadjuvant Chemotherapy · Goal: Curative</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={S.badge(C.green)}>Curative</span>
                    <span style={S.badge(C.amber)}>Neoadjuvant</span>
                    <span style={S.badge(C.purple)}>HER2+</span>
                  </div>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { label: 'Total Cancer Patients', value: '1,247', icon: Users, color: C.navy },
                  { label: 'New Cases (YTD)', value: '156', icon: Plus, color: C.sky },
                  { label: 'Active Treatment', value: '342', icon: Syringe, color: C.amber },
                  { label: 'Survivorship', value: '489', icon: HeartPulse, color: C.green },
                  { label: 'Palliative Care', value: '89', icon: Heart, color: C.purple },
                  { label: 'Clinical Trials', value: '34', icon: Target, color: C.sky },
                  { label: 'Mortality', value: '86', icon: AlertTriangle, color: C.red },
                  { label: '5-Year Survival', value: '68%', icon: TrendingUp, color: C.green },
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
                    { title: 'Neutropenia Grade 3', patient: 'Grace Njeri', detail: 'Cycle 3, ANC 0.8 — dose reduction', color: C.red },
                    { title: 'Chemotherapy Delay', patient: 'Mary Atieno', detail: 'Cycle 2 delayed 7 days — mucositis', color: C.amber },
                    { title: 'Imaging Due', patient: 'Samuel Ochieng', detail: 'Restaging CT overdue by 2 weeks', color: C.amber },
                    { title: 'New Referral', patient: 'Peter Mwangi', detail: 'Suspicious mammogram — awaiting biopsy', color: C.red },
                  ].map(a => (
                    <div key={a.title} style={{ padding: '10px 14px', borderRadius: 8, background: `${a.color}08`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AlertTriangle size={18} color={a.color} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{a.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{a.patient} — {a.detail}</div>
                      </div>
                      <button style={S.btn(a.color)}>Review</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Quick Actions</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={S.btn(C.sky)}><Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Cancer Case</button>
                  <button style={S.btn(C.green)}><Syringe size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Start Treatment</button>
                  <button style={S.btn(C.purple)}><Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Schedule MDT</button>
                  <button style={S.btnO}><ClipboardList size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> New Assessment</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── SNAPSHOT ─── */}
          {tab === 'snapshot' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Cancer Snapshot — Grace Njeri</div>
              <div style={S.grid4}>
                {[
                  { label: 'Diagnosis', value: 'Breast carcinoma', color: C.navy },
                  { label: 'Stage', value: 'cT3N2M0', color: C.amber },
                  { label: 'ECOG', value: '1', color: C.green },
                  { label: 'Cycle', value: '4 of 6', color: C.sky },
                  { label: 'Response', value: 'Partial', color: C.green },
                  { label: 'Latest CT', value: 'Improving', color: C.green },
                  { label: 'Intent', value: 'Curative', color: C.green },
                  { label: 'Ki67', value: '30%', color: C.amber },
                  { label: 'ER', value: 'Negative', color: C.red },
                  { label: 'PR', value: 'Negative', color: C.red },
                  { label: 'HER2', value: '3+', color: C.purple },
                  { label: 'PD-L1 (CPS)', value: '15', color: C.amber },
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
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Cancer Timeline — Grace Njeri</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { year: '2026', title: 'Surveillance', desc: 'Ongoing follow-up, mammogram q6mo, imaging stable', icon: CheckCircle, color: C.green },
                  { year: '2025', title: 'Targeted Therapy', desc: 'Trastuzumab/Pertuzumab maintenance after surgery', icon: Shield, color: C.purple },
                  { year: '2025', title: 'Radiotherapy', desc: 'Post-mastectomy 50 Gy/25 fx + 10 Gy boost', icon: Zap, color: C.amber },
                  { year: '2025', title: 'Surgery', desc: 'Mastectomy + SLNB, margins cleared, 2/12 nodes positive', icon: Bed, color: C.sky },
                  { year: '2025', title: 'Chemotherapy Cycle 4-6', desc: 'TCHP regimen, dose reduction Cycle 3 (neutropenia)', icon: Syringe, color: C.amber },
                  { year: '2024', title: 'MDT Decision', desc: 'Tumor board recommended neoadjuvant TCHP', icon: Users, color: C.sky },
                  { year: '2024', title: 'HER2+ Confirmed', desc: 'IHC 3+, FISH amplified, PD-L1 CPS 15', icon: Brain, color: C.purple },
                  { year: '2024', title: 'Pathology', desc: 'Core biopsy: Invasive ductal carcinoma, Grade III', icon: FileText, color: C.amber },
                  { year: '2024', title: 'Core Biopsy', desc: 'Ultrasound-guided core biopsy of left breast mass', icon: Eye, color: C.sky },
                  { year: '2024', title: 'Screening Mammogram', desc: 'Abnormal finding left breast — BIRADS 5', icon: Activity, color: C.red },
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
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Add Event</div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Date</label>
                    <input style={S.input} placeholder="e.g. 2025" />
                  </div>
                  <div>
                    <label style={S.label}>Event Type</label>
                    <select style={S.sel}>
                      <option>Diagnosis</option>
                      <option>Treatment Start</option>
                      <option>Surgery</option>
                      <option>Imaging</option>
                      <option>MDT</option>
                      <option>Follow-up</option>
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

          {/* ─── TUMOR ─── */}
          {tab === 'tumor' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Tumor Intelligence Engine</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Molecular, histologic, and genomic tumor characterization.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Tumor Characteristics</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Histology', value: 'Invasive ductal carcinoma', color: C.navy },
                      { label: 'Grade', value: 'III', color: C.red },
                      { label: 'Molecular subtype', value: 'HER2+ (HR-)', color: C.purple },
                      { label: 'Biomarkers', value: 'HER2 3+, ER-, PR-', color: C.purple },
                      { label: 'Genetics', value: 'No BRCA mutation', color: C.green },
                      { label: 'Driver alteration', value: 'HER2 amplification', color: C.amber },
                      { label: 'PD-L1 (CPS)', value: '15', color: C.amber },
                      { label: 'MSI Status', value: 'Stable (MSS)', color: C.green },
                      { label: 'Ki67', value: '30%', color: C.amber },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Tumor Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.purple}10`, border: `1px solid ${C.purple}25` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>HER2+ Invasive Ductal Carcinoma</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Hormone receptor-negative, HER2-amplified (IHC 3+) breast cancer with high Ki67 (30%) indicating rapid proliferation. PD-L1 CPS 15 suggests potential immunotherapy sensitivity. No BRCA germline mutations identified. MSS status confers no MSI-H associated immune feature.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Update Tumor Profile</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid2}>
                      <div>
                        <label style={S.label}>Histology</label>
                        <select style={S.sel}><option>Invasive ductal</option><option>Invasive lobular</option><option>Ductal CIS</option><option>Other</option></select>
                      </div>
                      <div>
                        <label style={S.label}>Grade</label>
                        <select style={S.sel}><option>I</option><option>II</option><option>III</option></select>
                      </div>
                    </div>
                    <button style={S.btn(C.sky)}>Update Tumor Profile</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STAGING ─── */}
          {tab === 'staging' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Staging Intelligence — Breast Cancer</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>TNM Staging Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Clinical Stage', value: 'cT3N2M0 (Stage IIIB)', color: C.amber },
                      { label: 'Pathological Stage', value: 'Pending (neoadjuvant not complete)', color: C.textLight },
                      { label: 'Restaging', value: 'After neoadjuvant — awaiting imaging', color: C.amber },
                      { label: 'Recurrence Stage', value: 'N/A', color: C.green },
                      { label: 'Metastatic Sites', value: 'None detected', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>TNM Components</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'T (Tumor)', c: 'cT3', desc: 'Tumor >5 cm in greatest dimension' },
                      { label: 'N (Nodes)', c: 'cN2', desc: 'Metastasis in ipsilateral level I/II axillary LN (fixed/matted)' },
                      { label: 'M (Metastasis)', c: 'cM0', desc: 'No distant metastasis' },
                      { label: 'Overall Stage', c: 'IIIB', desc: 'Locally advanced breast cancer' },
                    ].map(p => (
                      <div key={p.label} style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, borderLeft: `3px solid ${C.sky}` }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 10, color: C.textLight, minWidth: 60 }}>{p.label}</span>
                          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{p.c}</span>
                          <span style={{ fontSize: 10, color: C.text, flex: 1 }}>{p.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Update Staging</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <select style={{ ...S.sel, width: 200 }}><option>Clinical (cTNM)</option><option>Pathological (pTNM)</option><option>Restaging (ycTNM)</option><option>Recurrence (rTNM)</option></select>
                  <button style={S.btn(C.sky)}>Update Stage</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── MDT ─── */}
          {tab === 'mdt' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>MDT (Tumor Board) Workspace</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Participants</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { role: 'Medical Oncologist', name: 'Dr. Kamau', present: true },
                      { role: 'Surgical Oncologist', name: 'Dr. Ochieng', present: true },
                      { role: 'Radiation Oncologist', name: 'Dr. Patel', present: true },
                      { role: 'Radiologist', name: 'Dr. Wambui', present: true },
                      { role: 'Pathologist', name: 'Dr. Mwangi', present: true },
                      { role: 'Palliative Care', name: 'Dr. Chebet', present: false },
                      { role: 'Oncology Nurse', name: 'Sr. Atieno', present: true },
                      { role: 'Nutritionist', name: 'Ms. Nyambura', present: false },
                      { role: 'Genetic Counsellor', name: 'Mr. Mutua', present: false },
                      { role: 'Psychologist', name: 'Ms. Akinyi', present: false },
                    ].map(p => (
                      <div key={p.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        <div>
                          <span style={{ fontWeight: 600, color: C.navy }}>{p.role}</span>
                          <span style={{ color: C.textLight, marginLeft: 6 }}>{p.name}</span>
                        </div>
                        <span style={S.pill(p.present ? C.green : C.textLight)}>{p.present ? 'Present' : 'Absent'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>MDT Decision</div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}08`, border: `1px solid ${C.sky}25` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Consensus: Neoadjuvant TCHP x6 cycles</div>
                      <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>
                        Tumor board recommended neoadjuvant chemotherapy with Docetaxel/Carboplatin/Trastuzumab/Pertuzumab followed by surgery and radiotherapy. Discussed fertility preservation — completed. Genetics referral offered.
                      </div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Master Treatment Plan</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { step: '1. Neoadjuvant TCHP', status: 'In Progress', color: C.amber },
                        { step: '2. Surgery (Mastectomy + SLNB)', status: 'Pending', color: C.textLight },
                        { step: '3. Post-mastectomy Radiotherapy', status: 'Pending', color: C.textLight },
                        { step: '4. Trastuzumab Maintenance', status: 'Pending', color: C.textLight },
                        { step: '5. Surveillance', status: 'Pending', color: C.textLight },
                      ].map(p => (
                        <div key={p.step} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                          <span style={{ color: C.navy }}>{p.step}</span>
                          <span style={{ flex: 1 }} />
                          <span style={S.badge(p.color)}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Meeting Log</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Date</span><span>Attendees</span><span>Decision</span><span>Status</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                    <span style={{ color: C.navy }}>15 Dec 2024</span>
                    <span style={{ color: C.text }}>9 members</span>
                    <span style={{ color: C.textLight }}>Neoadjuvant TCHP recommended</span>
                    <span style={S.badge(C.green)}>Implemented</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                    <span style={{ color: C.navy }}>12 Mar 2025</span>
                    <span style={{ color: C.text }}>6 members</span>
                    <span style={{ color: C.textLight }}>Mid-treatment response review — partial response confirmed</span>
                    <span style={{ color: C.amber }}>Partial Response</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PATHOLOGY ─── */}
          {tab === 'pathology' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Pathology Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Histopathology</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Histology', value: 'Invasive ductal carcinoma', color: C.navy },
                      { label: 'Margins', value: 'Positive (re-excision planned)', color: C.red },
                      { label: 'LVI (Lymphovascular Invasion)', value: 'Present', color: C.amber },
                      { label: 'PNI (Perineural Invasion)', value: 'Absent', color: C.green },
                      { label: 'Lymph Nodes', value: '2/12 positive', color: C.amber },
                      { label: 'Grade', value: 'III (poorly differentiated)', color: C.red },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Immunohistochemistry</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Markers', value: 'HER2 3+ (IHC)', color: C.purple },
                      { label: 'ER Status', value: 'Negative (0%)', color: C.red },
                      { label: 'PR Status', value: 'Negative (0%)', color: C.red },
                      { label: 'Ki67', value: '30%', color: C.amber },
                      { label: 'PD-L1 (CPS)', value: '15', color: C.amber },
                      { label: 'Synoptic Report', value: 'Complete', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 90 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Re-excision Planning</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, fontSize: 10 }}>
                  Positive deep margin identified on initial biopsy. Repeat excision scheduled for next operative session. Intraoperative margin assessment planned.
                </div>
              </div>
            </div>
          )}

          {/* ─── IMAGING ─── */}
          {tab === 'imaging' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Imaging Intelligence — Breast Cancer</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recent Imaging</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { modality: 'CT Chest/Abd/Pelvis', date: '2 weeks ago', finding: 'Primary tumor 4.2 cm, axillary LN stable', status: 'Improving', color: C.green },
                      { modality: 'MRI Breast', date: '3 weeks ago', finding: 'Enhancing mass 3.8 cm, reduced from 5.1 cm', status: 'Improving', color: C.green },
                      { modality: 'PET-CT', date: 'Not done', finding: 'Not indicated at this stage', status: 'N/A', color: C.textLight },
                      { modality: 'US Axillary', date: '3 weeks ago', finding: '2 suspicious LN, irregular cortex', status: 'Stable', color: C.amber },
                      { modality: 'Mammogram (Diag.)', date: '4 weeks ago', finding: 'BIRADS 5 → proven malignancy', status: 'Baseline', color: C.textLight },
                      { modality: 'Bone Scan', date: 'Negative', finding: 'No osseous metastases', status: 'Normal', color: C.green },
                    ].map(p => (
                      <div key={p.modality} style={{ padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{p.modality}</span>
                          <span style={S.badge(p.color)}>{p.status}</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{p.date} — {p.finding}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>RECIST Target Lesions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { lesion: 'Breast primary', baseline: '5.1 cm', current: '3.8 cm', change: '-25%', color: C.green },
                      { lesion: 'Axillary LN 1', baseline: '2.3 cm', current: '1.6 cm', change: '-30%', color: C.green },
                      { lesion: 'Axillary LN 2', baseline: '1.8 cm', current: '1.4 cm', change: '-22%', color: C.green },
                      { lesion: 'Non-target', baseline: 'None', current: 'None', change: '—', color: C.textLight },
                    ].map(l => (
                      <div key={l.lesion} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 6, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{l.lesion}</span>
                        <span style={{ color: C.textLight }}>{l.baseline}</span>
                        <span style={{ color: C.text }}>{l.current}</span>
                        <span style={{ color: l.color, fontWeight: 600 }}>{l.change}</span>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 6, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                      <span>Lesion</span><span>Baseline</span><span>Current</span><span>Change</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── RECIST ─── */}
          {tab === 'recist' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>RECIST Response Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Response Classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Complete Response (CR)', value: 'No', color: C.textLight },
                      { label: 'Partial Response (PR)', value: 'Yes, -45%', color: C.green },
                      { label: 'Stable Disease (SD)', value: 'No', color: C.textLight },
                      { label: 'Progressive Disease (PD)', value: 'No', color: C.textLight },
                      { label: 'Mixed Response', value: 'No', color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, flex: 1 }}>{p.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25`, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>Partial Response</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Best overall response: PR · Confirmed at 12 weeks</div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Target Lesion Measurements Trend</div>
                  {[
                    { label: 'Sum of Diameters (mm)', vals: ['51', '46', '42', '38'], bar: C.sky },
                    { label: 'Change from Baseline', vals: ['0%', '-10%', '-18%', '-25%'], bar: C.green },
                  ].map(t => (
                    <div key={t.label} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10, color: C.textLight, marginBottom: 6 }}>{t.label}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64 }}>
                        {t.vals.map((v, i) => {
                          const absVal = parseInt(v) || 0
                          const h = i === 0 ? 48 : i === 1 ? 40 : i === 2 ? 32 : 24
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ fontSize: 9, color: C.textLight }}>{v}</div>
                              <div style={{ width: '80%', height: h, borderRadius: '4px 4px 0 0', background: t.bar, marginTop: 4, opacity: 0.6 + i * 0.1 }} />
                              <div style={{ fontSize: 8, color: C.textLight, marginTop: 4 }}>{['Baseline', 'C1', 'C2', 'C3'][i]}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── SURGERY ─── */}
          {tab === 'surgery' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Surgery Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Surgical Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Operation', value: 'Mastectomy + SLNB', color: C.navy },
                      { label: 'Margins', value: 'Pending (re-excision planned)', color: C.textLight },
                      { label: 'Lymph Node Yield', value: 'Pending', color: C.textLight },
                      { label: 'Complications', value: 'N/A', color: C.green },
                      { label: 'Recovery', value: 'N/A', color: C.textLight },
                      { label: 'Reconstruction', value: 'Delayed (planned after radiotherapy)', color: C.amber },
                      { label: 'ERAS Protocol', value: 'Planned', color: C.amber },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Surgical Timeline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { event: 'Neoadjuvant Completion', date: 'Est. Aug 2025', status: 'Pending', color: C.textLight },
                      { event: 'Mastectomy + SLNB', date: 'Est. Sep 2025', status: 'Planned', color: C.amber },
                      { event: 'Re-excision (if needed)', date: 'Per OP findings', status: 'Contingency', color: C.textLight },
                      { event: 'Reconstruction (Delayed)', date: 'Post-radiotherapy', status: 'Planned', color: C.textLight },
                    ].map(s => (
                      <div key={s.event} style={{ padding: '8px 12px', borderRadius: 8, background: C.panel, borderLeft: `3px solid ${s.color}` }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{s.event}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{s.date}</div>
                        <span style={S.badge(s.color)}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── CHEMO ─── */}
          {tab === 'chemo' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Chemotherapy Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Regimen: TCHP</div>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: `${C.sky}08`, border: `1px solid ${C.sky}20`, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Docetaxel / Carboplatin / Trastuzumab / Pertuzumab</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>6 x 21-day cycles · Neoadjuvant</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { cycle: 'Cycle 1', status: 'Completed', color: C.green },
                      { cycle: 'Cycle 2', status: 'Completed', color: C.green },
                      { cycle: 'Cycle 3', status: 'Completed (20% dose reduction)', color: C.amber },
                      { cycle: 'Cycle 4', status: 'Current', color: C.sky },
                      { cycle: 'Cycle 5', status: 'Pending', color: C.textLight },
                      { cycle: 'Cycle 6', status: 'Pending', color: C.textLight },
                    ].map(c => (
                      <div key={c.cycle} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.status === 'Completed' ? C.green : c.status === 'Current' ? C.sky : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.status === 'Completed' ? <CheckCircle size={12} color={C.white} /> : c.status === 'Current' ? <Clock size={12} color={C.white} /> : <span style={{ fontSize: 10, color: C.textLight }}>{c.cycle.split(' ')[1]}</span>}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, flex: 1 }}>{c.cycle}</span>
                        <span style={S.badge(c.color)}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Dose Reductions</div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Cycle 3</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>Neutropenia (Grade 3, ANC 0.8) — 20% dose reduction of Docetaxel and Carboplatin</div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recorded Toxicities</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { toxicity: 'Neutropenia', grade: 'G3', cycle: '3', color: C.red },
                        { toxicity: 'Fatigue', grade: 'G2', cycle: 'All', color: C.amber },
                        { toxicity: 'Nausea', grade: 'G2', cycle: '1-2', color: C.amber },
                        { toxicity: 'Neuropathy (fingers)', grade: 'G1', cycle: '2+', color: C.amber },
                        { toxicity: 'Mucositis', grade: 'G0', cycle: '—', color: C.green },
                      ].map(t => (
                        <div key={t.toxicity} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <span style={{ color: C.text, flex: 1 }}>{t.toxicity}</span>
                          <span style={S.badge(t.color)}>{t.grade}</span>
                          <span style={{ color: C.textLight }}>Cycle {t.cycle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── IMMUNOTHERAPY ─── */}
          {tab === 'immunotherapy' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Immunotherapy Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Immune Agents</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Drug 1', value: 'Pertuzumab (Perjeta)', color: C.purple },
                      { label: 'Drug 2', value: 'Trastuzumab (Herceptin)', color: C.purple },
                      { label: 'Cycles Completed', value: '5 of planned 18', color: C.sky },
                      { label: 'Immune Toxicities', value: 'None observed', color: C.green },
                      { label: 'Response', value: 'Partial (-35%)', color: C.green },
                      { label: 'Endocrine Effects', value: 'None', color: C.green },
                      { label: 'Steroids Required', value: 'None', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Immunotherapy Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.purple}10`, border: `1px solid ${C.purple}25` }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Dual HER2 Blockade</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Patient receives dual HER2-targeted therapy with trastuzumab and pertuzumab in combination with neoadjuvant chemotherapy. No immune-related adverse events observed to date. Partial response confirmed on interval imaging. Plan to continue trastuzumab for total 18 cycles (1 year).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── RADIATION ─── */}
          {tab === 'radiation' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Radiotherapy Intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Radiotherapy Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Planning CT', value: 'Post-op, pending surgery', color: C.textLight },
                      { label: 'Dose', value: '50 Gy / 25 fractions', color: C.amber },
                      { label: 'Boost', value: '10 Gy / 5 fractions (tumour bed)', color: C.amber },
                      { label: 'Volumes', value: 'Whole breast + regional nodes', color: C.navy },
                      { label: 'Toxicities (acute)', value: 'N/A (not started)', color: C.textLight },
                      { label: 'Late Effects', value: 'N/A', color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Treatment Schedule</div>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: C.panel }}>
                    <div style={{ fontSize: 11, color: C.textLight }}>Proposed Start</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>4-6 weeks post-surgery</div>
                    <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>Duration: 5 weeks (25 fractions) + 1 week boost</div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08` }}>
                    <div style={{ fontSize: 10, color: C.amber }}>Awaiting surgical pathology to finalize radiotherapy volumes and margins.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TOXICITY ─── */}
          {tab === 'toxicity' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Toxicity Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>CTCAE v5.0 Grading — systematic monitoring and management of treatment-related adverse events.</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>CTCAE Toxicities</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Neutropenia', grade: 'Grade 3', cycle: 'Cycle 3', detail: 'ANC 0.8, dose reduced 20%', color: C.red },
                      { label: 'Neuropathy', grade: 'Grade 1', cycle: 'Cycle 2+', detail: 'Finger tip numbness', color: C.amber },
                      { label: 'Mucositis', grade: 'Grade 0', cycle: '—', detail: 'None', color: C.green },
                      { label: 'Diarrhea', grade: 'Grade 1', cycle: 'Cycle 1', detail: 'Self-limited, 3 episodes/day', color: C.amber },
                      { label: 'Cardiotoxicity', grade: 'Grade 0', cycle: '—', detail: 'None — echo monitoring', color: C.green },
                      { label: 'Fatigue', grade: 'Grade 2', cycle: 'All', detail: 'Moderate, affecting daily activities', color: C.amber },
                      { label: 'Nausea', grade: 'Grade 2', cycle: 'Cycle 1-2', detail: 'Controlled with antiemetics', color: C.amber },
                    ].map(t => (
                      <div key={t.label} style={{ padding: '8px 12px', borderRadius: 8, background: C.panel, borderLeft: `4px solid ${t.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{t.label}</span>
                          <span style={S.badge(t.color)}>{t.grade}</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{t.cycle} — {t.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Toxicity Management</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { issue: 'Neutropenia Management', plan: 'G-CSF prophylaxis for subsequent cycles' },
                        { issue: 'Nausea Control', plan: 'Aprepitant + ondansetron regimen' },
                        { issue: 'Neuropathy Monitoring', plan: 'Neurological assessment if worsens' },
                        { issue: 'Cardiac Monitoring', plan: 'Echo every 3 cycles' },
                      ].map(m => (
                        <div key={m.issue} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: C.navy }}>{m.issue}</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>{m.plan}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Toxicity Score</div>
                    <div style={{ textAlign: 'center', padding: 12 }}>
                      <div style={{ fontSize: 36, fontWeight: 700, color: C.amber }}>G2</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Overall CTCAE Grade (worst) — Moderate toxicity</div>
                      <div style={{ marginTop: 8 }}>
                        <span style={S.pill(C.amber)}>Requires active monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SURVIVORSHIP ─── */}
          {tab === 'survivorship' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Survivorship Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Survivorship Domains</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Recurrence Surveillance', value: 'Mammo q6mo, CT q12mo', color: C.sky },
                      { label: 'Second Cancers', value: 'Screening up to date', color: C.green },
                      { label: 'Employment', value: 'On medical leave', color: C.amber },
                      { label: 'Fertility', value: 'Discussed — eggs banked', color: C.green },
                      { label: 'Cardiac Health', value: 'Echo planned post-treatment', color: C.amber },
                      { label: 'Bone Health', value: 'DEXA ordered (baseline)', color: C.amber },
                      { label: 'Cognition', value: 'Normal — no chemo-brain', color: C.green },
                      { label: 'Exercise', value: 'Walking 30 min daily', color: C.green },
                      { label: 'Nutrition', value: 'Dietitian consult completed', color: C.green },
                      { label: 'Mental Health', value: 'Counselling ongoing', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 120 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Survivorship Care Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.green}08`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Treatment Summary</div>
                      <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>Neoadjuvant TCHP (6 cycles) → Mastectomy + SLNB → Radiotherapy → Trastuzumab 1 year</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}08`, border: `1px solid ${C.sky}25` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Follow-up Schedule</div>
                      <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>Oncology q3mo × 2yr, q6mo × 3yr, then annually. Mammogram q6mo. CT q12mo for 3yr.</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.purple}08`, border: `1px solid ${C.purple}25` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Health Promotion</div>
                      <div style={{ fontSize: 10, color: C.text, marginTop: 4 }}>Exercise 150 min/week. BMI {'<'}25. Limit alcohol. Smoking cessation. Vaccinations current.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── GENETICS ─── */}
          {tab === 'genetics' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Genetics Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Genetic Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Family Pedigree', value: 'Maternal aunt: breast CA (54 yrs)', color: C.amber },
                      { label: 'Genetic Counselling', value: 'Offered and completed', color: C.green },
                      { label: 'BRCA1/2', value: 'Negative', color: C.green },
                      { label: 'Lynch Syndrome', value: 'N/A', color: C.textLight },
                      { label: 'Other Syndromes', value: 'None identified', color: C.green },
                      { label: 'Relative Screening', value: 'Suggested for maternal aunt', color: C.amber },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Genetic Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      No pathogenic BRCA1/2 germline mutation identified. Family history of breast cancer in maternal aunt diagnosed at age 54. Despite negative testing, patient's family pedigree warrants ongoing vigilance. Maternal aunt advised to pursue risk assessment and screening. No other hereditary cancer syndromes identified.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Family Screening</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { relative: 'Maternal aunt', screening: 'Mammogram recommended', status: 'Pending' },
                      { relative: 'Mother (62)', screening: 'Mammogram current', status: 'Up to date' },
                      { relative: 'Sister (44)', screening: 'Clinical breast exam', status: 'Scheduled' },
                    ].map(r => (
                      <div key={r.relative} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ color: C.navy }}>{r.relative}</span>
                        <span style={{ color: C.textLight }}>{r.screening}</span>
                        <span style={S.badge(C.amber)}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FERTILITY ─── */}
          {tab === 'fertility' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Fertility Preservation</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fertility Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Fertility Counselling', value: 'Complete', color: C.green },
                      { label: 'Egg Freezing', value: 'Completed (12 oocytes)', color: C.green },
                      { label: 'Sperm Banking', value: 'N/A', color: C.textLight },
                      { label: 'Embryo Storage', value: 'N/A', color: C.textLight },
                      { label: 'Future Options', value: 'Discussed in detail', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Fertility Plan Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Patient completed fertility preservation counselling prior to neoadjuvant chemotherapy. Elected for oocyte cryopreservation. 12 mature oocytes successfully vitrified. Costs covered by institutional fertility preservation program. Plan for future natural conception or ART discussed. Gonadotoxicity risk of TCHP regimen explained — patient opted for preservation.
                    </div>
                  </div>
                  <div style={{ ...S.divider, margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Follow-up Plan</div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                    Refer to reproductive endocrinology post-treatment completion. Ovarian function monitoring recommended.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PALLIATIVE ─── */}
          {tab === 'palliative' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Palliative Care Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Palliative Domains</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Pain Control', value: 'Controlled, 2/10', color: C.green },
                      { label: 'Symptoms', value: 'Nausea controlled with antiemetics', color: C.green },
                      { label: 'Nutrition', value: 'Dietitian consult completed', color: C.green },
                      { label: 'Advance Directives', value: 'Not yet documented', color: C.amber },
                      { label: 'Family Meetings', value: 'Scheduled next month', color: C.amber },
                      { label: 'Home Care', value: 'Not needed at present', color: C.green },
                      { label: 'Hospice', value: 'N/A — curative pathway', color: C.textLight },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Symptom Management</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { sym: 'Pain (NRS)', val: '2/10', color: C.green },
                      { sym: 'Nausea', val: '1/10', color: C.green },
                      { sym: 'Fatigue', val: '6/10', color: C.amber },
                      { sym: 'Anxiety', val: '3/10', color: C.amber },
                    ].map(s => (
                      <div key={s.sym} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 11, color: C.text, width: 100 }}>{s.sym}</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border }}>
                          <div style={{ width: `${(parseInt(s.val.split('/')[0]) / 10) * 100}%`, height: 6, borderRadius: 3, background: s.color }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Goals of Care</div>
                <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                  Patient is on curative-intent treatment pathway. Palliative care integrated early for symptom management. Pain controlled, nausea managed. Advance care planning to be completed. Family meeting scheduled to discuss treatment plan and support needs.
                </div>
              </div>
            </div>
          )}

          {/* ─── HOME ─── */}
          {tab === 'home' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Home Monitoring Center</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Home Monitoring Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Pain (NRS)', value: '2/10', status: 'Controlled', color: C.green },
                      { label: 'Weight', value: '68 kg', status: 'Stable', color: C.green },
                      { label: 'Temperature', value: '36.8°C', status: 'Normal', color: C.green },
                      { label: 'Side Effects', value: 'Mild fatigue', status: 'Tolerable', color: C.amber },
                      { label: 'Medication Adherence', value: '95%', status: 'Good', color: C.green },
                      { label: 'Fatigue Score', value: '6/10', status: 'Moderate', color: C.amber },
                      { label: 'Functional Status', value: 'Independent ADLs', status: 'Good', color: C.green },
                      { label: 'Psych Wellbeing', value: 'Anxiety 3/10', status: 'Mild', color: C.amber },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: C.textLight }}>{m.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{m.value}</div>
                        </div>
                          <span style={S.badge(m.color)}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Alerts Summary</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
                        <AlertTriangle size={14} color={C.amber} />
                        <span style={{ color: C.text }}>Fatigue increasing — consider energy conservation strategies</span>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
                        <AlertTriangle size={14} color={C.amber} />
                        <span style={{ color: C.text }}>Mild anxiety — follow up with psychology next week</span>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.green}08`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
                        <CheckCircle size={14} color={C.green} />
                        <span style={{ color: C.text }}>Adherence {'>'}95% — excellent compliance</span>
                      </div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Home Care Plan</div>
                    <div style={{ fontSize: 10, color: C.text, lineHeight: 1.6 }}>
                      Continue daily symptom log. Call clinic if temp {'>'}38°C, uncontrolled pain, or new symptoms. Next chemotherapy appointment: Cycle 4 in 2 weeks.
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
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>MDT Members — Grace Njeri</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { role: 'Medical Oncologist', name: 'Dr. Kamau', contact: 'Ext. 3401', status: 'Available', color: C.green },
                    { role: 'Surgical Oncologist', name: 'Dr. Ochieng', contact: 'Ext. 3407', status: 'Available', color: C.green },
                    { role: 'Radiation Oncologist', name: 'Dr. Patel', contact: 'Ext. 3408', status: 'Available', color: C.green },
                    { role: 'Radiologist', name: 'Dr. Wambui', contact: 'Ext. 3201', status: 'Available', color: C.green },
                    { role: 'Pathologist', name: 'Dr. Mwangi', contact: 'Ext. 3301', status: 'Busy', color: C.amber },
                    { role: 'Palliative Care', name: 'Dr. Chebet', contact: 'Ext. 6301', status: 'Available', color: C.green },
                    { role: 'Oncology Nurse', name: 'Sr. Atieno', contact: 'Ext. 3402', status: 'Available', color: C.green },
                    { role: 'Nutritionist', name: 'Ms. Nyambura', contact: 'Ext. 4501', status: 'On Leave', color: C.red },
                    { role: 'Genetic Counsellor', name: 'Mr. Mutu', contact: 'Ext. 3601', status: 'Available', color: C.green },
                    { role: 'Psychologist', name: 'Ms. Akinyi', contact: 'Ext. 4601', status: 'Available', color: C.green },
                  ].map(t => (
                    <div key={t.role} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{t.role}</span>
                      <span style={{ color: C.text }}>{t.name}</span>
                      <span style={{ color: C.textLight }}>{t.contact}</span>
                      <span style={S.badge(t.color)}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── REGISTRY ─── */}
          {tab === 'registry' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Cancer Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'Breast Cancer', value: '342', color: C.navy },
                  { label: 'Colorectal', value: '156', color: C.purple },
                  { label: 'Lung Cancer', value: '89', color: C.amber },
                  { label: 'Prostate Cancer', value: '124', color: C.sky },
                  { label: 'Cervical Cancer', value: '67', color: C.red },
                  { label: 'Stage III at Dx', value: '28%', color: C.amber },
                  { label: 'Completed Treatment', value: '64%', color: C.green },
                  { label: 'Lost to Follow-up', value: '8%', color: C.red },
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
                    <select style={S.sel}><option>All Tumor Types</option><option>Breast</option><option>Colorectal</option><option>Lung</option><option>Prostate</option></select>
                    <select style={S.sel}><option>All Stages</option><option>I</option><option>II</option><option>III</option><option>IV</option></select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Name</span><span>MRN</span><span>Tumor Type</span><span>Stage</span><span>Treatment</span><span>Outcome</span>
                  </div>
                  {[
                    { name: 'Grace Njeri', mrn: 'OC-001', type: 'Breast', stage: 'IIIB', treatment: 'Neoadjuvant TCHP', outcome: 'Partial Response' },
                    { name: 'Mary Atieno', mrn: 'OC-012', type: 'Breast', stage: 'IIA', treatment: 'Adjuvant ACT', outcome: 'NED' },
                    { name: 'Samuel Ochieng', mrn: 'OC-024', type: 'Lung', stage: 'IV', treatment: 'Pembrolizumab', outcome: 'Stable' },
                    { name: 'Peter Mwangi', mrn: 'OC-036', type: 'Colorectal', stage: 'III', treatment: 'FOLFOX + Surgery', outcome: 'Remission' },
                    { name: 'Jane Wanjiku', mrn: 'OC-048', type: 'Prostate', stage: 'II', treatment: 'Radical Prostatectomy', outcome: 'NED' },
                  ].map(p => (
                    <div key={p.mrn} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                      <span style={{ color: C.textLight }}>{p.mrn}</span>
                      <span style={{ color: C.text }}>{p.type}</span>
                      <span style={{ color: p.stage.includes('IV') ? C.red : p.stage.includes('III') ? C.amber : C.green }}>{p.stage}</span>
                      <span style={{ color: C.text }}>{p.treatment}</span>
                      <span style={S.badge(p.outcome === 'NED' || p.outcome === 'Remission' ? C.green : p.outcome === 'Partial Response' ? C.amber : C.sky)}>{p.outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── QUALITY ─── */}
          {tab === 'quality' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Quality Indicators — Oncology</div>
              <div style={S.grid4}>
                {[
                  { metric: 'Referral-to-Diagnosis', value: '14d', target: '<14d', trend: '✓', color: C.green },
                  { metric: 'Diagnosis-to-MDT', value: '7d', target: '<14d', trend: '✓', color: C.green },
                  { metric: 'MDT-to-Treatment', value: '21d', target: '<28d', trend: '✓', color: C.green },
                  { metric: 'Margin Positivity', value: '12%', target: '<15%', trend: '✓', color: C.green },
                  { metric: 'Chemo Completion', value: '78%', target: '>80%', trend: '↓', color: C.amber },
                  { metric: 'Radiotherapy Completion', value: '85%', target: '>85%', trend: '✓', color: C.green },
                  { metric: '5-Year Survival', value: '68%', target: '>65%', trend: '✓', color: C.green },
                  { metric: 'Recurrence Rate', value: '12%', target: '<15%', trend: '✓', color: C.green },
                  { metric: 'Toxicity (G3+)', value: '18%', target: '<15%', trend: '↑', color: C.red },
                  { metric: 'Palliative Referral', value: '64%', target: '>70%', trend: '↑', color: C.amber },
                ].map(q => (
                  <div key={q.metric} style={{ ...S.card, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{q.metric}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{q.value}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
                      <span style={{ color: C.textLight }}>Target: {q.target}</span>
                      <span style={{ color: q.color, fontWeight: 600 }}>{q.trend}</span>
                    </div>
                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: C.border, marginTop: 8 }}>
                      <div style={{ width: parseInt(q.value) <= parseInt(q.target) && q.target.startsWith('<') ? '85%' : '70%', height: 4, borderRadius: 2, background: q.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Improvement Initiatives</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: 'Chemotherapy Completion Program', desc: 'Improve completion from 78% to 85% through proactive toxicity management', progress: '65%', color: C.sky },
                    { title: 'Palliative Referral Initiative', desc: 'Increase palliative referral rate from 64% to 75% via automatic trigger at Stage IV diagnosis', progress: '40%', color: C.amber },
                    { title: 'Toxicity Reduction Bundle', desc: 'Reduce G3+ toxicity incidence through protocolized pre-medication and dose adaptation', progress: '55%', color: C.green },
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
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Patient Portal — Grace Njeri</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Today&rsquo;s Summary</div>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${C.green}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HeartPulse size={32} color={C.green} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>On Treatment</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Cycle 4 of 6 · Next chemo in 2 weeks</div>
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Dashboard</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>Treatment Calendar</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                            <span style={{ color: C.navy }}>Mon 14 Jul</span>
                            <span style={{ color: C.text }}>Cycle 4 Day 1 — TCHP</span>
                            <span style={S.badge(C.sky)}>Upcoming</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                            <span style={{ color: C.navy }}>Mon 7 Jul</span>
                            <span style={{ color: C.text }}>Pre-cycle blood work</span>
                            <span style={S.badge(C.amber)}>Pending</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ color: C.textLight }}>Current Medications</div>
                        {['Docetaxel 75mg/m² (D1)', 'Carboplatin AUC6 (D1)', 'Trastuzumab 8mg/kg (D1)', 'Pertuzumab 840mg (D1)', 'Aprepitant 125mg (D1-3)', 'Ondansetron 8mg TID PRN'].map(m => (
                          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                            <CheckCircle size={10} color={C.green} />
                            <span style={{ color: C.text }}>{m}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Lab Results</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>ANC 1.8</div>
                          <div style={{ color: C.green }}>/ Normal range</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Upcoming Imaging</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>CT Chest</div>
                          <div style={{ color: C.amber }}>In 4 weeks</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Symptoms to Report</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>Fever &gt;38°C</div>
                          <div style={{ color: C.textLight }}>Uncontrolled pain</div>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                          <div style={{ color: C.textLight }}>Next Appointment</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Cycle 4</div>
                          <div style={{ color: C.textLight }}>14 Jul 2026</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Educational Resources</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { title: 'Cancer Education', desc: 'Understanding breast cancer', color: C.sky },
                      { title: 'Nutrition Guide', desc: 'Eating well during chemo', color: C.green },
                      { title: 'Exercise Guide', desc: 'Staying active in treatment', color: C.amber },
                      { title: 'Mental Health', desc: 'Coping with cancer', color: C.purple },
                    ].map(e => (
                      <div key={e.title} style={{ padding: '12px', borderRadius: 8, background: C.panel, cursor: 'pointer' }}>
                        <BookOpen size={20} color={e.color} />
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginTop: 6 }}>{e.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>{e.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Secure Messaging</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea style={{ ...S.input, minHeight: 120, resize: 'vertical' }} placeholder="Send a secure message to your oncology team..." />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={S.btn(C.sky)}><Send size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Send Message</button>
                      <button style={S.btnO}>View Messages</button>
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