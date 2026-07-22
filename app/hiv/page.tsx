'use client'
import { useState } from 'react'
import { Activity, Bell, User, Users, Heart, AlertTriangle, Clock, Calendar, Pill, Syringe, FileText, CheckCircle, XCircle, ArrowRight, Plus, Search, Menu, ChevronRight, MessageSquare, Shield, TrendingUp, type LucideIcon, Brain, Baby, BarChart3, Download, Printer, Globe, Home, HeartPulse, Weight, Eye, Send, BookOpen, Zap, Target, Wind } from 'lucide-react'
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
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  input: { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.panel, outline: 'none', fontFamily: "'Inter', sans-serif" } as any,
  btn: (c: string) => ({ padding: '8px 20px', borderRadius: 8, border: 'none', background: c, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }),
  badge: (c: string) => ({ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  pill: (c: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  secTitle: { fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 },
  divider: { height: 1, background: C.border, margin: '16px 0' },
}

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'HIV Dashboard', icon: Activity },
  { id: 'snapshot', label: 'HIV Snapshot', icon: Heart },
  { id: 'timeline', label: 'HIV Timeline', icon: Clock },
  { id: 'phenotype', label: 'Phenotype Engine', icon: Brain },
  { id: 'viral', label: 'Viral Suppression', icon: TrendingUp },
  { id: 'immune', label: 'Immune Intelligence', icon: Shield },
  { id: 'art', label: 'ART Intelligence', icon: Pill },
  { id: 'adherence', label: 'Adherence Intelligence', icon: CheckCircle },
  { id: 'resistance', label: 'Drug Resistance', icon: AlertTriangle },
  { id: 'oi', label: 'Opportunistic Infections', icon: Wind },
  { id: 'tb', label: 'TB Integration', icon: Wind },
  { id: 'prevention', label: 'Prevention', icon: Syringe },
  { id: 'pregnancy', label: 'HIV & Pregnancy', icon: Baby },
  { id: 'pediatrics', label: 'HIV & Children', icon: Users },
  { id: 'comorbidities', label: 'Comorbidities', icon: HeartPulse },
  { id: 'mental', label: 'Mental Health', icon: MessageSquare },
  { id: 'aging', label: 'Aging with HIV', icon: User },
  { id: 'community', label: 'Community Health', icon: Globe },
  { id: 'team', label: 'MDT', icon: Users },
  { id: 'registry', label: 'Registry', icon: FileText },
  { id: 'quality', label: 'Quality Indicators', icon: BarChart3 },
  { id: 'portal', label: 'Patient Portal', icon: Globe },
]

const WORKSPACE_LINKS = [
  { label: 'Patient Movement', href: '/pme' }, { label: 'Nurse Workspace', href: '/nurse' },
  { label: 'Doctor Workspace', href: '/doctor' }, { label: 'Lab Workspace', href: '/laboratory' },
  { label: 'Pharmacy', href: '/pharmacy' }, { label: 'Radiology', href: '/radiology' },
  { label: 'Theatre', href: '/theatre' }, { label: 'ICU', href: '/icu' },
  { label: 'Emergency', href: '/emergency' }, { label: 'Diabetes', href: '/diabetes' },
  { label: 'Hypertension', href: '/hypertension' }, { label: 'CKD', href: '/ckd' },
  { label: 'Respiratory', href: '/respiratory' }, { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'Oncology', href: '/oncology' }, { label: 'Neurology', href: '/neurology' },
  { label: 'Heart Failure', href: '/hf' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

export default function HIVWorkspace() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN HMIS</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>HIV & Infectious Diseases Intelligence Center &mdash; Volume XI-G</div>
        <div style={{ flex: 1 }} />
        <Bell size={16} color={C.textLight} style={{ cursor: 'pointer' }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700 }}>HIV</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>HIV & Infectious Diseases</div>
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

          {tab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>HIV Intelligence Center</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>A Lifelong Viral Suppression, Immune Recovery & Prevention Operating System</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={S.pill(C.green)}>Virally Suppressed</span>
                  <span style={S.pill(C.amber)}>12 High-Risk</span>
                  <span style={S.pill(C.sky)}>842 Enrolled</span>
                </div>
              </div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.green}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Peter Mwangi / 39 Years / Male / HIV-1</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Duration: 13 Years &middot; Status: Virally Suppressed &middot; WHO Stage I &middot; ART: TDF/3TC/DTG</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={S.badge(C.green)}>Suppressed</span>
                  <span style={S.badge(C.sky)}>WHO I</span>
                  <span style={S.badge(C.green)}>On ART</span>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { icon: Users, label: 'Total HIV Patients', value: '842', color: C.sky },
                  { icon: TrendingUp, label: 'Virally Suppressed', value: '92%', color: C.green },
                  { icon: Pill, label: 'On ART', value: '758', color: C.sky },
                  { icon: AlertTriangle, label: 'Lost to Follow-up', value: '4.5%', color: C.amber },
                  { icon: Wind, label: 'TB/HIV Co-infection', value: '38', color: C.red },
                  { icon: Baby, label: 'PMTCT', value: '62', color: C.purple },
                  { icon: Heart, label: 'Mortality', value: '11', color: C.red },
                  { icon: Shield, label: 'Advanced HIV', value: '18', color: C.amber },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                    <s.icon size={24} color={s.color} />
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, marginTop: 8 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'snapshot' && (
            <div>
              <div style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.green}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Peter Mwangi / 39 Years / Male</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>HIV-1 &middot; Duration: 13 Years &middot; Suppressed &middot; WHO I &middot; TDF/3TC/DTG</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={S.badge(C.green)}>Suppressed</span>
                  <span style={S.badge(C.sky)}>WHO I</span>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>HIV Snapshot</div>
              <div style={S.grid4}>
                {[
                  { label: 'Viral Load', value: '<20 c/mL', color: C.green },
                  { label: 'CD4', value: '684', color: C.green },
                  { label: 'ART Adherence', value: '98%', color: C.green },
                  { label: 'WHO Stage', value: 'I', color: C.green },
                  { label: 'TB Screen', value: 'Negative', color: C.green },
                  { label: 'Weight', value: '71 kg', color: C.green },
                  { label: 'BMI', value: '23.4', color: C.green },
                  { label: 'Last Clinic', value: '2mo ago', color: C.amber },
                  { label: 'CD4%', value: '34%', color: C.green },
                  { label: 'CD4/CD8', value: '1.2', color: C.green },
                  { label: 'Hb', value: '13.5', color: C.green },
                  { label: 'Creatinine', value: '82', color: C.green },
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

          {tab === 'timeline' && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 20 }}>HIV Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { year: '2025', title: 'Suppressed', desc: 'VL <20, CD4 684, stable on TDF/3TC/DTG, WHO I', icon: CheckCircle, color: C.green },
                  { year: '2023', title: 'Stable', desc: 'VL <20, CD4 650, no OIs, fully adherent', icon: CheckCircle, color: C.green },
                  { year: '2022', title: 'COVID-19', desc: 'Mild infection, ART continued without interruption', icon: AlertTriangle, color: C.amber },
                  { year: '2020', title: 'DTG Transition', desc: 'TDF/3TC/EFV to TDF/3TC/DTG for tolerability', icon: Pill, color: C.sky },
                  { year: '2018', title: 'Suppressed', desc: 'VL <20, CD4 580, annual review completed', icon: CheckCircle, color: C.green },
                  { year: '2015', title: 'TB Treated', desc: 'Pulmonary TB, 6mo rifampicin regimen, cured', icon: Wind, color: C.red },
                  { year: '2014', title: 'Suppression Achieved', desc: 'VL 620, CD4 rising, good adherence', icon: TrendingUp, color: C.green },
                  { year: '2013', title: 'ART Started', desc: 'TDF/3TC/EFV, VL 340,000, CD4 320', icon: Pill, color: C.sky },
                  { year: '2013', title: 'HIV Diagnosis', desc: 'Confirmed HIV-1, VL 340,000, CD4 320, WHO II', icon: Heart, color: C.amber },
                ].map((e, i) => (
                  <div key={`${e.year}-${i}`} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${e.color}15`, border: `2px solid ${e.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <e.icon size={14} color={e.color} />
                      </div>
                      {i < 8 && <div style={{ width: 2, height: '100%', background: C.border, flex: 1 }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: e.color }}>{e.year}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{e.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'phenotype' && (
            <div>
              <div style={S.secTitle}>HIV Phenotype Engine</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Acute HIV', status: false, detail: 'No' }, { label: 'Chronic HIV', status: true, detail: 'Yes' },
                      { label: 'Elite Controller', status: false, detail: 'No' }, { label: 'Advanced HIV', status: false, detail: 'No' },
                      { label: 'Treatment Failure', status: false, detail: 'No' }, { label: 'Drug Resistance', status: false, detail: 'None' },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${p.status ? C.sky : C.border}`, background: p.status ? C.sky : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.status && <CheckCircle size={12} color={C.white} />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.navy, flex: 1 }}>{p.label}</span>
                        <span style={{ fontSize: 10, color: p.status ? C.green : C.textLight }}>{p.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Phenotype Summary</div>
                  <div style={{ padding: 16, borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Chronic HIV-1 with Full Suppression</div>
                    <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                      Chronic HIV-1 diagnosed 2013. Sustained viral suppression on ART, excellent immune recovery (CD4 nadir 320 → 684). No elite controller, treatment failure, or resistance phenotype.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'viral' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Viral Suppression Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Viral load monitoring, trend analysis & rebound detection</div>
              <div style={S.grid4}>
                {[
                  { icon: TrendingUp, label: 'Current VL', value: '<20 c/mL', color: C.green },
                  { icon: TrendingUp, label: 'Suppression Rate', value: '92%', color: C.green },
                  { icon: TrendingUp, label: 'Years Suppressed', value: '11 yrs', color: C.green },
                  { icon: TrendingUp, label: 'Viral Rebounds', value: '0', color: C.green },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                    <s.icon size={24} color={s.color} />
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, marginTop: 8 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={S.divider} />
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Viral Load Trend</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { year: '2013', vl: '340,000', color: C.red }, { year: '2014', vl: '620', color: C.amber },
                      { year: '2015', vl: '<20', color: C.green }, { year: '2025', vl: '<20', color: C.green },
                    ].map(e => (
                      <div key={e.year} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.textLight, minWidth: 40 }}>{e.year}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.border }}>
                          <div style={{ width: e.vl === '<20' ? '5%' : e.vl === '620' ? '30%' : '90%', height: 8, borderRadius: 4, background: e.color }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: e.color, minWidth: 70, textAlign: 'right' }}>{e.vl}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.green }}>Current: &lt;20 copies/mL</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>Undetectable — optimal suppression</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.green }}>Viral Rebounds: None</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.green }}>Low-level Viremia: None</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'immune' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Immune Intelligence Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>CD4 trajectory, immune recovery assessment & immunologic monitoring</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Immune Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'CD4 Count', value: '684', badge: 'Normal', color: C.green },
                      { label: 'CD4 Nadir', value: '320', badge: 'Was low', color: C.amber },
                      { label: 'CD4%', value: '34%', badge: 'Normal', color: C.green },
                      { label: 'CD8 Count', value: '580', badge: 'Normal', color: C.green },
                      { label: 'CD4/CD8 Ratio', value: '1.2', badge: 'Good', color: C.green },
                      { label: 'Immune Recovery', value: 'Good', badge: 'Recovered', color: C.green },
                      { label: 'Late Presentation', value: 'Yes', badge: 'CD4 320', color: C.amber },
                      { label: 'Immunologic Failure', value: 'No', badge: 'Excellent', color: C.green },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{p.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, minWidth: 50 }}>{p.value}</span>
                        <span style={S.badge(p.color)}>{p.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>CD4 Trajectory</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, padding: '12px 0' }}>
                    {[
                      { yr: '2013', cd4: 320 }, { yr: '2015', cd4: 510 }, { yr: '2017', cd4: 560 },
                      { yr: '2019', cd4: 590 }, { yr: '2021', cd4: 620 }, { yr: '2023', cd4: 650 },
                      { yr: '2025', cd4: 684 },
                    ].map(m => (
                      <div key={m.yr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '70%', height: (m.cd4 / 684) * 120, borderRadius: '3px 3px 0 0', background: m.cd4 >= 500 ? C.green : m.cd4 >= 350 ? C.amber : C.red }} />
                        <div style={{ fontSize: 7, color: C.textLight, marginTop: 2 }}>{m.yr}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 8 }}>CD4: nadir 320 (2013) → current 684 — excellent recovery</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'art' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>ART Intelligence Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>ART optimization, regimen history & medication intelligence</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Current Regimen</div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25`, textAlign: 'center', marginBottom: 12 }}>
                    <Pill size={24} color={C.green} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>TDF/3TC/DTG</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>TDF 300mg + 3TC 300mg + DTG 50mg &middot; Once daily</div>
                    <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>Well tolerated &middot; 98% adherence</div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Regimen History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>TDF/3TC/DTG</div><div style={{ fontSize: 10, color: C.textLight }}>2020 — Present &middot; DTG transition for tolerability</div></div>
                      <span style={S.badge(C.green)}>Current</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>TDF/3TC/EFV</div><div style={{ fontSize: 10, color: C.textLight }}>2013 — 2020 &middot; CNS side effects (EFV)</div></div>
                      <span style={S.badge(C.amber)}>Previous</span>
                    </div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Change Reasons</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: C.panel }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>EFV → DTG (2020)</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>Toxicity: CNS side effects — vivid dreams, dizziness</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 6, background: C.panel }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Other Change Reasons</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
                        <div><span style={S.pill(C.green)}>Pregnancy: N/A</span></div>
                        <div><span style={S.pill(C.green)}>Interaction: None</span></div>
                        <div><span style={S.pill(C.green)}>Failure: None</span></div>
                        <div><span style={S.pill(C.green)}>Resistance: None</span></div>
                      </div>
                    </div>
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Optimization Score</div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.green}10`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: C.textLight }}>Regimen appropriateness</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: C.green }}>98%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'adherence' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Adherence Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Multi-source adherence assessment — pharmacy, clinic & self-report</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Adherence Metrics</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Pharmacy Pickup Rate', value: '100%', color: C.green },
                      { label: 'Missed Appointments', value: '0', color: C.green },
                      { label: 'Refill Gaps', value: 'None', color: C.green },
                      { label: 'Self-Reported', value: '98%', color: C.green },
                      { label: 'Pill Count', value: '95%', color: C.green },
                      { label: 'Community ART', value: 'No', color: C.textLight },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 11, color: C.text, flex: 1 }}>{m.label}</span>
                        <span style={S.badge(m.color)}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Adherence Score</div>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <div style={{ position: 'relative', display: 'inline-flex', width: 120, height: 120, marginBottom: 8 }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke={C.border} strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke={C.green} strokeWidth="10" strokeDasharray={`${(98 / 100) * 314} 314`} transform="rotate(-90 60 60)" strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: C.navy }}>98%</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.textLight }}>Composite Adherence Score</div>
                    <div style={{ marginTop: 12, fontSize: 12 }}><span style={S.pill(C.green)}>Risk of Failure: Very Low</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'resistance' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Drug Resistance Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Genotypic resistance, cross-resistance analysis & future ART options</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Resistance Profile</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Genotype Result', value: 'No resistance mutations', color: C.green },
                      { label: 'Historical Resistance', value: 'None', color: C.green },
                      { label: 'Cross-Resistance', value: 'None detected', color: C.green },
                      { label: 'NNRTI Resistance', value: 'None', color: C.green },
                      { label: 'NRTI Resistance', value: 'None', color: C.green },
                      { label: 'INSTI Resistance', value: 'None', color: C.green },
                      { label: 'PI Resistance', value: 'None', color: C.green },
                      { label: 'Future ART Options', value: 'All available', color: C.green },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{r.label}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.navy }}>{r.value}</span>
                        <CheckCircle size={14} color={C.green} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Drug Class Susceptibility</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { cls: 'NRTIs', status: 'Susceptible' }, { cls: 'NNRTIs', status: 'Susceptible' },
                      { cls: 'INSTIs', status: 'Susceptible' }, { cls: 'PIs', status: 'Susceptible' },
                      { cls: 'Entry Inhibitors', status: 'Susceptible' }, { cls: 'Post-Attachment Inhibitors', status: 'Susceptible' },
                    ].map(d => (
                      <div key={d.cls} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, borderLeft: `3px solid ${C.green}`, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: C.text }}>{d.cls}</span>
                        <span style={S.badge(C.green)}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'oi' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Opportunistic Infection Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>OI history, prophylaxis & surveillance</div>
              <div style={S.grid3}>
                {[
                  { name: 'Tuberculosis', year: '2015', status: 'Resolved', treatment: 'Rifampicin 6mo', response: 'Complete', recurrence: 'No', residual: 'None', color: C.green },
                  { name: 'Oral Thrush', year: '2013', status: 'Resolved', treatment: 'Fluconazole 7d', response: 'Complete', recurrence: 'No', residual: 'None', color: C.green },
                  { name: 'PJP', year: '—', status: 'Never', treatment: '—', response: '—', recurrence: '—', residual: '—', color: C.textLight },
                  { name: 'CMV Retinitis', year: '—', status: 'Never', treatment: '—', response: '—', recurrence: '—', residual: '—', color: C.textLight },
                  { name: 'Cryptococcal Meningitis', year: '—', status: 'Never', treatment: '—', response: '—', recurrence: '—', residual: '—', color: C.textLight },
                  { name: 'Kaposi Sarcoma', year: '—', status: 'Never', treatment: '—', response: '—', recurrence: '—', residual: '—', color: C.textLight },
                ].map(oi => (
                  <div key={oi.name} style={{ ...S.card, borderTop: `2px solid ${oi.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{oi.name}</div>
                      <span style={S.badge(oi.color)}>{oi.status}</span>
                    </div>
                    {oi.year !== '—' && <div style={{ fontSize: 11, color: C.text, marginBottom: 4 }}><strong>Year:</strong> {oi.year} &middot; <strong>Rx:</strong> {oi.treatment} &middot; <strong>Response:</strong> {oi.response}</div>}
                    <div style={S.divider} />
                    <div style={{ display: 'flex', gap: 16, fontSize: 10 }}><span style={{ color: C.textLight }}>Recurrence: <strong>{oi.recurrence}</strong></span><span style={{ color: C.textLight }}>Residual: <strong>{oi.residual}</strong></span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'tb' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Tuberculosis Integration</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>TB screening, treatment & cure monitoring in HIV co-infection</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>TB Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'TB Screen', value: 'Negative annually', color: C.green }, { label: 'GeneXpert', value: 'Negative', color: C.green },
                      { label: 'Culture', value: 'Negative', color: C.green }, { label: 'DST', value: 'N/A', color: C.textLight },
                      { label: 'TB Treatment', value: 'Completed 2015', color: C.green }, { label: 'Cured', value: 'Yes', color: C.green },
                      { label: 'Relapse', value: 'No', color: C.green }, { label: 'DR-TB', value: 'No', color: C.green },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 90 }}>{s.label}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.navy }}>{s.value}</span>
                        <span style={S.badge(s.color)}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>TB Treatment History (2015)</div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.green}10`, border: `1px solid ${C.green}25` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Pulmonary TB — Cured</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>2RHZE / 4RH regimen. Completed treatment. No relapse.</div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 6 }}>Annual TB Screening</div>
                    {[
                      { yr: '2024', res: 'Negative' }, { yr: '2023', res: 'Negative' }, { yr: '2022', res: 'Negative' },
                    ].map(r => (
                      <div key={r.yr} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', borderRadius: 4, background: C.panel, fontSize: 10, marginBottom: 4 }}>
                        <span style={{ color: C.navy }}>{r.yr}</span><span style={S.badge(C.green)}>{r.res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'prevention' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Prevention Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>OI prophylaxis, vaccinations & transmission prevention</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Prevention Checklist</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Cotrimoxazole Prophylaxis', status: 'Stopped after CD4 >350', done: true },
                      { item: 'IPT (Isoniazid)', status: 'Completed 6 months', done: true },
                      { item: 'Vaccinations', status: 'Up to date', done: true },
                      { item: 'Cervical Cancer Screening', status: 'Due', done: false },
                      { item: 'Anal Cancer Screening', status: 'Not indicated', done: true },
                      { item: 'Partner Testing', status: 'Declined', done: false },
                      { item: 'PrEP Referral', status: 'Discussed', done: true },
                      { item: 'PEP History', status: 'None', done: true },
                      { item: 'U=U Counselling', status: 'Provided', done: true },
                    ].map(c => (
                      <div key={c.item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 10px', borderRadius: 6, background: C.panel }}>
                        {c.done ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.amber} />}
                        <div style={{ flex: 1, fontSize: 11, color: C.navy }}>{c.item}</div>
                        <span style={{ fontSize: 10, color: c.done ? C.green : C.amber }}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Immunizations</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { vac: 'Influenza', status: 'Current' }, { vac: 'Pneumococcal', status: 'Complete' },
                        { vac: 'Hepatitis B', status: 'Immune' }, { vac: 'Tdap', status: 'Current' },
                        { vac: 'COVID-19', status: 'Current' },
                      ].map(v => (
                        <div key={v.vac} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                          <span style={{ color: C.navy }}>{v.vac}</span><span style={S.badge(C.green)}>{v.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>U=U Status</div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.green}10`, fontSize: 10, color: C.text }}>
                      Counselling provided. Patient understands undetectable viral load eliminates sexual transmission risk.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'pregnancy' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>HIV & Pregnancy Center</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Vertical transmission prevention continuum</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PMTCT Care Pathway</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { item: 'Preconception Counselling', done: true, detail: 'ART optimization, folate' },
                      { item: 'VL Suppression Before Delivery', done: true, detail: '<20 c/mL throughout' },
                      { item: 'Delivery Plan', done: true, detail: 'Elective C-section 38wk' },
                      { item: 'Infant Prophylaxis (NVP 6wk)', done: true, detail: 'Completed' },
                      { item: 'Infant PCR', done: true, detail: 'Negative at 6wk & 6mo' },
                      { item: 'Breastfeeding', done: true, detail: 'Formula feeding' },
                      { item: 'Maternal Postpartum Follow-up', done: false, detail: 'Scheduled 6wk' },
                    ].map(p => (
                      <div key={p.item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        {p.done ? <CheckCircle size={14} color={C.green} /> : <Clock size={14} color={C.amber} />}
                        <div style={{ flex: 1, fontSize: 11, color: C.navy }}>{p.item}</div>
                        <span style={{ fontSize: 10, color: C.textLight }}>{p.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Outcomes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: C.textLight }}>Pre-delivery VL</span><span style={{ fontSize: 16, fontWeight: 700, color: C.green }}>&lt;20 c/mL</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: C.textLight }}>CD4 at Delivery</span><span style={{ fontSize: 16, fontWeight: 700, color: C.green }}>684</span>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: C.textLight }}>Infant HIV Status</span><span style={{ fontSize: 16, fontWeight: 700, color: C.green }}>Negative</span>
                    </div>
                    <div style={S.divider} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 4 }}>PMTCT Cascade</div>
                    {['Maternal VL suppressed', 'Safe delivery', 'Infant prophylaxis', 'PCR negative'].map(s => (
                      <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        <span>{s}</span><CheckCircle size={12} color={C.green} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'pediatrics' && (
            <div>
              <div style={S.secTitle}>HIV & Children</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pediatric Profile</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Growth Percentile', value: '25th %ile', color: C.green },
                      { label: 'Development', value: 'Normal', color: C.green },
                      { label: 'Immunization', value: 'Up to date', color: C.green },
                      { label: 'School Attendance', value: '95%', color: C.green },
                      { label: 'Disclosure', value: 'Not yet', color: C.amber },
                      { label: 'Transition Planning', value: 'Age 14+', color: C.amber },
                      { label: 'Adult Clinic Transfer', value: 'Pending', color: C.amber },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{d.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, flex: 1 }}>{d.value}</span>
                        <span style={S.badge(d.color)}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Pediatric ART</div>
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: `${C.sky}10`, border: `1px solid ${C.sky}25` }}>
                      <Pill size={20} color={C.sky} style={{ marginBottom: 6 }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>ABC/3TC/DTG</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>Pediatric formulation &middot; Weight-based</div>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                      <span style={S.pill(C.green)}>VL: {'<'}20</span>
                      <span style={S.pill(C.green)}>CD4: 1,200</span>
                      <span style={S.pill(C.green)}>CD4%: 38%</span>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Transition Readiness</div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: `${C.amber}08`, fontSize: 10, color: C.text }}>
                      Disclosure pending. Transition planning should begin by age 14. Recommend gradual disclosure counselling.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'comorbidities' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Comorbidity Intelligence</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>HIV-associated comorbidity screening & management</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Comorbidity Screen</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'HTN', status: 'No', color: C.green }, { label: 'Diabetes', status: 'No', color: C.green },
                      { label: 'CKD', status: 'No', color: C.green }, { label: 'Heart Disease', status: 'No', color: C.green },
                      { label: 'Cancer', status: 'No', color: C.green }, { label: 'Depression', status: 'Mild', color: C.amber },
                      { label: 'Liver Disease', status: 'No', color: C.green }, { label: 'Osteoporosis', status: 'No', color: C.green },
                    ].map(c => (
                      <div key={c.label} style={{ padding: '8px 12px', borderRadius: 8, background: C.panel, borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ fontSize: 9, color: C.textLight }}>{c.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Risk Scores</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ padding: '6px 10px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span>CV Risk (FRS)</span><span style={{ fontWeight: 700, color: C.green }}>Low (5.2%)</span>
                      </div>
                      <div style={{ padding: '6px 10px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span>FRAX Score</span><span style={{ fontWeight: 700, color: C.green }}>Low</span>
                      </div>
                      <div style={{ padding: '6px 10px', borderRadius: 6, background: C.panel, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span>FIB-4 (Liver)</span><span style={{ fontWeight: 700, color: C.green }}>1.2 (Normal)</span>
                      </div>
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Management Plan</div>
                    <div style={{ fontSize: 10, color: C.text, lineHeight: 1.6 }}>
                      Mild depression (PHQ-9: 6). Counselling active. Annual CVD risk, renal monitoring, bone density at 50.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'mental' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Mental Health Workspace</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Integrated mental health screening & counselling</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Depression (PHQ-9)', value: '6 — Mild', color: C.amber },
                      { label: 'Anxiety (GAD-7)', value: '4 — Minimal', color: C.green },
                      { label: 'Substance Use', value: 'None', color: C.green },
                      { label: 'Suicide Risk', value: 'Low', color: C.green },
                      { label: 'Counselling', value: 'Active', color: C.sky },
                      { label: 'Psychiatric Review', value: 'Not needed', color: C.green },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 110 }}>{m.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, flex: 1 }}>{m.value}</span>
                        <span style={S.badge(m.color)}>{m.value.split('—')[0].trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>PHQ-9 Detail</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[
                      { item: 'Interest/pleasure', s: 1 }, { item: 'Feeling down', s: 1 }, { item: 'Sleep', s: 2 },
                      { item: 'Fatigue', s: 1 }, { item: 'Appetite', s: 0 }, { item: 'Self-worth', s: 0 },
                      { item: 'Concentration', s: 1 }, { item: 'Psychomotor', s: 0 }, { item: 'Suicidal', s: 0 },
                    ].map(i => (
                      <div key={i.item} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        <span style={{ color: C.text }}>{i.item}</span><span style={{ fontWeight: 600, color: C.navy }}>{i.s}</span>
                      </div>
                    ))}
                    <div style={{ padding: '4px 10px', borderRadius: 4, background: `${C.amber}10`, fontSize: 11, fontWeight: 600, color: C.amber, marginTop: 4 }}>Total: 6/27 — Mild</div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: C.text }}>Monthly counselling. No pharmacotherapy needed. Re-assess in 3 months.</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'aging' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Aging with HIV</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Geriatric assessment, frailty screening & prevention</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Geriatric Domains</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Frailty', value: 'None', color: C.green }, { label: 'Polypharmacy', value: '1 drug (ART)', color: C.green },
                      { label: 'Falls', value: 'None', color: C.green }, { label: 'Cognition', value: 'Normal', color: C.green },
                      { label: 'Vaccinations', value: 'Complete', color: C.green }, { label: 'Cancer Screening', value: 'Due', color: C.amber },
                      { label: 'CV Risk', value: 'Low', color: C.green }, { label: 'Functional Status', value: 'Independent', color: C.green },
                    ].map(g => (
                      <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 90 }}>{g.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, flex: 1 }}>{g.value}</span>
                        <span style={S.badge(g.color)}>{g.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Age-Related Screening</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { screen: 'Colorectal Cancer', due: 'Due 2026', status: 'Not done', color: C.amber },
                      { screen: 'Prostate Cancer', due: 'Done 2025', status: 'Normal', color: C.green },
                      { screen: 'DEXA Scan', due: 'Age 50 (2027)', status: 'Not yet', color: C.green },
                      { screen: 'Lipid Profile', due: 'Annual', status: 'Done 2026', color: C.green },
                    ].map(s => (
                      <div key={s.screen} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{s.screen}</span>
                        <span style={{ color: C.textLight }}>{s.due}</span>
                        <span style={S.badge(s.color)}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: C.text, lineHeight: 1.6 }}>No frailty or cognitive impairment. Continue annual screening. Schedule colorectal screening.</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'community' && (
            <div>
              <div style={{ ...S.secTitle, marginBottom: 4 }}>Community Health Integration</div>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 20, fontStyle: 'italic' }}>Community-based care, defaulter tracing & support</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Community Record</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Community ART Group', value: 'No', color: C.textLight },
                      { label: 'Home Visits', value: 'None', color: C.textLight },
                      { label: 'CHW Reviews', value: 'Quarterly', color: C.sky },
                      { label: 'Defaulter Tracing', value: 'N/A', color: C.textLight },
                      { label: 'Support Groups', value: 'Monthly', color: C.green },
                      { label: 'Social Interventions', value: 'Transport vouchers', color: C.sky },
                    ].map(c => (
                      <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px', borderRadius: 6, background: C.panel }}>
                        <span style={{ fontSize: 10, color: C.textLight, minWidth: 100 }}>{c.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, flex: 1 }}>{c.value}</span>
                        <span style={S.badge(c.color)}>{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Support Group</div>
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10, marginBottom: 12 }}>
                    <span style={{ color: C.textLight }}>&quot;Living Positively&quot; — Last: 2 weeks ago</span>
                    <div style={{ color: C.green, marginTop: 4 }}>Attendance: 8/12 sessions</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Social Needs</div>
                  <div style={{ fontSize: 10, color: C.text, lineHeight: 1.6 }}>
                    Transport vouchers provided. No food insecurity. Stable housing, employed. Peer support via CHW.
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div>
              <div style={S.secTitle}>Multidisciplinary Team</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>HIV Care Team</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { role: 'HIV Physician', name: 'Dr. Kamau', status: 'Available', color: C.green },
                      { role: 'Clinical Officer', name: 'Mr. Njoroge', status: 'Available', color: C.green },
                      { role: 'HIV Nurse', name: 'Sr. Atieno', status: 'Busy', color: C.amber },
                      { role: 'Pharmacist', name: 'Mr. Otieno', status: 'Available', color: C.green },
                      { role: 'Lab Scientist', name: 'Ms. Wambui', status: 'Available', color: C.green },
                      { role: 'TB Program', name: 'Mr. Mwangi', status: 'On Leave', color: C.amber },
                      { role: 'CHW', name: 'Sr. Nyambura', status: 'Available', color: C.green },
                      { role: 'Nutritionist', name: 'Ms. Achieng', status: 'Available', color: C.green },
                      { role: 'Psychologist', name: 'Dr. Chebet', status: 'Available', color: C.green },
                      { role: 'Social Worker', name: 'Mr. Kiprop', status: 'Busy', color: C.amber },
                      { role: 'Obstetrician', name: 'Dr. Wanjiku', status: 'Available', color: C.green },
                      { role: 'Pediatrician', name: 'Dr. Muthoni', status: 'Available', color: C.green },
                      { role: 'Oncologist', name: 'Dr. Patel', status: 'In Clinic', color: C.amber },
                    ].map(t => (
                      <div key={t.role} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: 6, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 10, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: C.navy }}>{t.role}</span>
                        <span style={{ color: C.text }}>{t.name}</span>
                        <span style={S.badge(t.color)}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recent Communications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Dr. Kamau · 2 hrs ago</div>
                      <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Peter Mwangi stable. VL {'<'}20, CD4 684. Continue current management.</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Sr. Atieno · 4 hrs ago</div>
                      <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Adherence 98%. No missed appointments. Patient engaged.</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Mr. Mwangi · 1 day ago</div>
                      <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Annual TB screen negative. Continue annual screening.</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.textLight }}>Next MDT: 15 Jul 2026</span>
                    <span style={{ fontWeight: 600, color: C.navy }}>Complex Case Review</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'registry' && (
            <div>
              <div style={S.secTitle}>HIV Registry</div>
              <div style={S.grid4}>
                {[
                  { label: 'Adult', value: '842', color: C.sky }, { label: 'Pediatric', value: '38', color: C.purple },
                  { label: 'Pregnant', value: '62', color: C.amber }, { label: 'On ART', value: '758', color: C.green },
                  { label: 'Suppressed', value: '92%', color: C.green }, { label: 'Drug Resistance', value: '4', color: C.red },
                  { label: 'TB/HIV', value: '38', color: C.red }, { label: 'Advanced HIV', value: '18', color: C.amber },
                ].map(r => (
                  <div key={r.label} style={{ textAlign: 'center', padding: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12 }}>
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
                      <input style={{ ...S.input, paddingLeft: 28, width: 180 }} placeholder="Search..." />
                    </div>
                    <button style={{ ...S.btn(C.sky), padding: '8px 12px' }}><Download size={14} /> Export</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                    <span>Name</span><span>MRN</span><span>Category</span><span>VL</span><span>Status</span>
                  </div>
                  {[
                    { name: 'Peter Mwangi', mrn: 'HIV-001', cat: 'Adult', vl: '<20', status: 'Suppressed' },
                    { name: 'Grace Akinyi', mrn: 'HIV-012', cat: 'Pregnant', vl: '<20', status: 'Suppressed' },
                    { name: 'Samuel Kiprop', mrn: 'HIV-023', cat: 'Adult', vl: '12,400', status: 'Detectable' },
                    { name: 'Faith Nyambura', mrn: 'HIV-034', cat: 'Pediatric', vl: '<20', status: 'Suppressed' },
                    { name: 'Joseph Kariuki', mrn: 'HIV-045', cat: 'Adult', vl: '340', status: 'Low-level' },
                  ].map(p => (
                    <div key={p.mrn} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '6px 10px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                      <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                      <span style={{ color: C.textLight }}>{p.mrn}</span>
                      <span style={{ color: C.text }}>{p.cat}</span>
                      <span style={{ color: p.vl === '<20' ? C.green : C.red, fontWeight: 600 }}>{p.vl}</span>
                      <span style={S.badge(p.status === 'Suppressed' ? C.green : p.status === 'Low-level' ? C.amber : C.red)}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'quality' && (
            <div>
              <div style={S.secTitle}>Quality Indicators</div>
              <div style={S.grid4}>
                {[
                  { metric: 'Viral Suppression', value: '92%', target: '90%', color: C.green },
                  { metric: 'ART Initiation (30d)', value: '98%', target: '95%', color: C.green },
                  { metric: 'Retention', value: '88%', target: '90%', color: C.amber },
                  { metric: 'Missed Appts', value: '5%', target: '<5%', color: C.amber },
                  { metric: 'Adherence', value: '95%', target: '95%', color: C.green },
                  { metric: 'TB Screening', value: '96%', target: '95%', color: C.green },
                  { metric: 'Cervical Cancer Screen', value: '62%', target: '80%', color: C.red },
                  { metric: 'PMTCT Success', value: '98%', target: '98%', color: C.green },
                  { metric: 'Infant PCR (6wk)', value: '96%', target: '95%', color: C.green },
                  { metric: 'Mortality', value: '1.2%', target: '<2%', color: C.green },
                  { metric: 'LTFU', value: '4.5%', target: '<5%', color: C.green },
                  { metric: 'Genotype Access', value: '78%', target: '85%', color: C.amber },
                ].map(q => (
                  <div key={q.metric} style={{ ...S.card, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 4 }}>{q.metric}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{q.value}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>Target: {q.target}</div>
                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: C.border, marginTop: 6 }}>
                      <div style={{ width: q.value, height: 4, borderRadius: 2, background: q.color }} />
                    </div>
                    <span style={{ ...S.badge(parseInt(q.value) >= parseInt(q.target) ? C.green : q.color), marginTop: 6, display: 'inline-block' }}>
                      {parseInt(q.value) >= parseInt(q.target) ? 'On Target' : 'Below Target'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'portal' && (
            <div>
              <div style={S.secTitle}>Patient Portal</div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Today&rsquo;s Status</div>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${C.green}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={32} color={C.green} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Virally Suppressed</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>VL &lt;20 &middot; CD4 684 &middot; Stable</div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Patient Dashboard</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>VL Trend</div>
                      <div style={{ height: 30, background: C.border, borderRadius: 4, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.textLight }}>Suppressed since 2015</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                      <div style={{ color: C.textLight }}>Medication Reminders</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                        <CheckCircle size={10} color={C.green} /><span>TDF/3TC/DTG — 1 tablet daily</span>
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                      <div style={{ color: C.textLight }}>ART Refill Dates</div>
                      <div style={{ fontWeight: 600, color: C.navy }}>Next: 15 Aug 2026</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ color: C.textLight }}>Next Appointment</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2 weeks</div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, fontSize: 10 }}>
                        <div style={{ color: C.textLight }}>VL Due</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>3 months</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Lab History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '4px 8px', borderRadius: 4, background: C.panel, fontSize: 9, fontWeight: 700, color: C.textLight }}>
                      <span>Date</span><span>VL</span><span>CD4</span><span>CD4%</span>
                    </div>
                    {[
                      { d: 'Jun 2026', vl: '<20', cd4: '684', pct: '34%' },
                      { d: 'Mar 2026', vl: '<20', cd4: '670', pct: '33%' },
                      { d: 'Dec 2025', vl: '<20', cd4: '650', pct: '33%' },
                    ].map(r => (
                      <div key={r.d} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '3px 8px', borderRadius: 4, background: C.panel, fontSize: 10 }}>
                        <span style={{ color: C.textLight }}>{r.d}</span>
                        <span style={{ color: C.green, fontWeight: 600 }}>{r.vl}</span>
                        <span style={{ color: C.navy }}>{r.cd4}</span>
                        <span style={{ color: C.text }}>{r.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Education & Messaging</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { title: 'HIV Basics', desc: 'Understanding your care', icon: BookOpen },
                      { title: 'U=U', desc: 'Undetectable = Untransmittable', icon: Shield },
                      { title: 'ART Adherence', desc: 'Why meds matter', icon: Pill },
                      { title: 'Wellness Goals', desc: 'Track your progress', icon: Target },
                    ].map(e => (
                      <div key={e.title} style={{ padding: '10px', borderRadius: 8, background: C.panel, cursor: 'pointer' }}>
                        <e.icon size={18} color={C.sky} />
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.navy, marginTop: 4 }}>{e.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>{e.desc}</div>
                      </div>
                    ))}
                  </div>
                  <textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' }} placeholder="Send a secure message..." />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button style={S.btn(C.sky)}><Send size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Send</button>
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
