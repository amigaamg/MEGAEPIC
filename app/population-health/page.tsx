'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity, Users, BarChart3, TrendingUp, Download, Printer, Search, Map, Globe, Baby, Heart, Pill, Syringe, Shield, AlertTriangle, ArrowUp, ArrowDown, Target, Filter, Calendar } from 'lucide-react'

const registries = [
  {
    id: 1, name: 'Diabetes Registry', count: 342, active: 286, controlled: 198, uncontrolled: 88, screening: 245,
    hba1c_avg: '7.8%', complications: 67, color: '#F97316', icon: <Activity size={16} />,
    indicators: [
      { label: 'HbA1c <7%', value: '58%', target: '>70%', status: 'below' },
      { label: 'Annual Eye Exam', value: '62%', target: '>80%', status: 'below' },
      { label: 'Foot Screening', value: '71%', target: '>80%', status: 'below' },
      { label: 'BP Control <140/90', value: '65%', target: '>70%', status: 'near' },
    ]
  },
  {
    id: 2, name: 'Hypertension Registry', count: 428, active: 368, controlled: 245, uncontrolled: 123, screening: 312,
    hba1c_avg: null, complications: 89, color: '#EF4444', icon: <Heart size={16} />,
    indicators: [
      { label: 'BP <140/90', value: '67%', target: '>70%', status: 'near' },
      { label: 'On ACEi/ARB', value: '78%', target: '>85%', status: 'below' },
      { label: 'Annual Creatinine', value: '82%', target: '>90%', status: 'below' },
      { label: 'Lifestyle Counselling', value: '55%', target: '>80%', status: 'below' },
    ]
  },
  {
    id: 3, name: 'HIV Registry', count: 198, active: 176, controlled: 158, uncontrolled: 18, screening: 165,
    hba1c_avg: null, complications: 24, color: '#EC4899', icon: <Shield size={16} />,
    indicators: [
      { label: 'Viral Suppression', value: '90%', target: '>95%', status: 'near' },
      { label: 'On ART', value: '96%', target: '>95%', status: 'met' },
      { label: 'CD4 Monitoring', value: '85%', target: '>90%', status: 'below' },
      { label: 'TB Screening', value: '78%', target: '>90%', status: 'below' },
    ]
  },
  {
    id: 4, name: 'TB Registry', count: 87, active: 72, controlled: 65, uncontrolled: 7, screening: 80,
    hba1c_avg: null, complications: 12, color: '#6366F1', icon: <Syringe size={16} />,
    indicators: [
      { label: 'Treatment Success', value: '88%', target: '>90%', status: 'near' },
      { label: 'Contact Tracing', value: '72%', target: '>90%', status: 'below' },
      { label: 'GeneXpert Testing', value: '94%', target: '>95%', status: 'near' },
      { label: 'MDR-TB Detection', value: '82%', target: '>85%', status: 'near' },
    ]
  },
  {
    id: 5, name: 'CKD Registry', count: 124, active: 98, controlled: 54, uncontrolled: 44, screening: 87,
    hba1c_avg: null, complications: 31, color: '#8B5CF6', icon: <Activity size={16} />,
    indicators: [
      { label: 'eGFR Monitoring', value: '76%', target: '>85%', status: 'below' },
      { label: 'BP <130/80', value: '48%', target: '>60%', status: 'below' },
      { label: 'Proteinuria Screen', value: '64%', target: '>80%', status: 'below' },
      { label: 'AVF Creation', value: '42%', target: '>50%', status: 'near' },
    ]
  },
  {
    id: 6, name: 'Heart Failure Registry', count: 76, active: 62, controlled: 38, uncontrolled: 24, screening: 52,
    hba1c_avg: null, complications: 18, color: '#14B8A6', icon: <Heart size={16} />,
    indicators: [
      { label: 'ACEi/ARB Prescribed', value: '82%', target: '>90%', status: 'below' },
      { label: 'Beta-blocker', value: '78%', target: '>90%', status: 'below' },
      { label: 'Echo Done', value: '88%', target: '>95%', status: 'below' },
      { label: 'Readmission <30d', value: '16%', target: '<10%', status: 'below' },
    ]
  },
  {
    id: 7, name: 'Sickle Cell Registry', count: 64, active: 48, controlled: 32, uncontrolled: 16, screening: 42,
    hba1c_avg: null, complications: 14, color: '#F43F5E', icon: <Activity size={16} />,
    indicators: [
      { label: 'Hydroxyurea Therapy', value: '68%', target: '>80%', status: 'below' },
      { label: 'Penicillin Prophylaxis', value: '82%', target: '>90%', status: 'below' },
      { label: 'Transfusion Program', value: '45%', target: '>60%', status: 'below' },
      { label: 'Pain Crisis Admission', value: '28%', target: '<20%', status: 'below' },
    ]
  },
  {
    id: 8, name: 'Asthma Registry', count: 92, active: 70, controlled: 45, uncontrolled: 25, screening: 58,
    hba1c_avg: null, complications: 22, color: '#0EA5E9', icon: <Activity size={16} />,
    indicators: [
      { label: 'Peak Flow Monitoring', value: '54%', target: '>70%', status: 'below' },
      { label: 'ICS Prescribed', value: '85%', target: '>90%', status: 'below' },
      { label: 'Action Plan Given', value: '42%', target: '>80%', status: 'below' },
      { label: 'Hospitalization Rate', value: '18%', target: '<15%', status: 'below' },
    ]
  },
]

const cohortPatients = [
  { name: 'Grace Mwangi', age: 54, disease: 'Diabetes', status: 'uncontrolled', lastVisit: '2d ago', hba1c: '9.2%', bp: '145/90', nextAppt: '15 Jul' },
  { name: 'John Kamau', age: 62, disease: 'Hypertension', status: 'uncontrolled', lastVisit: '1w ago', hba1c: '-', bp: '158/95', nextAppt: '18 Jul' },
  { name: 'Samuel Ochieng', age: 7, disease: 'Asthma', status: 'uncontrolled', lastVisit: '3d ago', hba1c: '-', bp: '-', nextAppt: '12 Jul' },
  { name: 'Nancy Wambui', age: 42, disease: 'Diabetes', status: 'uncontrolled', lastVisit: '5d ago', hba1c: '10.1%', bp: '138/85', nextAppt: '14 Jul' },
  { name: 'Peter Kiprop', age: 68, disease: 'CKD', status: 'uncontrolled', lastVisit: '2w ago', hba1c: '-', bp: '155/90', nextAppt: '20 Jul' },
  { name: 'Faith Chebet', age: 35, disease: 'HIV', status: 'uncontrolled', lastVisit: '1m ago', hba1c: '-', bp: '-', nextAppt: '22 Jul' },
  { name: 'Joseph Maina', age: 58, disease: 'Heart Failure', status: 'uncontrolled', lastVisit: '4d ago', hba1c: '-', bp: '140/88', nextAppt: '11 Jul' },
]

const outreachEvents = [
  { campaign: 'Diabetes Screening Camp - Kibera', type: 'screening', date: '15 Jul', target: 200, registered: 145, staff: 6 },
  { campaign: 'Hypertension Awareness - Dagoretti', type: 'education', date: '18 Jul', target: 150, registered: 98, staff: 4 },
  { campaign: 'HIV Testing & Counselling - City', type: 'testing', date: '22 Jul', target: 300, registered: 0, staff: 8 },
  { campaign: 'Child Wellness Clinic - Kawangware', type: 'immunization', date: '25 Jul', target: 100, registered: 62, staff: 5 },
]

export default function PopulationHealthPage() {
  const [activeRegistry, setActiveRegistry] = useState<number | null>(null)
  const [view, setView] = useState('registries')

  const total = { patients: registries.reduce((s, r) => s + r.count, 0), active: registries.reduce((s, r) => s + r.active, 0), controlled: registries.reduce((s, r) => s + r.controlled, 0), uncontrolled: registries.reduce((s, r) => s + r.uncontrolled, 0) }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Globe size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Population Health & Registry Management</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{total.patients} patients across 8 registries</span>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {[
          { key: 'registries', label: 'Registries', icon: <Target size={14} /> },
          { key: 'cohorts', label: 'Uncontrolled Cohort', icon: <AlertTriangle size={14} /> },
          { key: 'outreach', label: 'Outreach', icon: <Map size={14} /> },
          { key: 'coverage', label: 'Coverage Metrics', icon: <BarChart3 size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${view === t.key ? 'var(--primary)' : 'transparent'}`, background: 'transparent', color: view === t.key ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: view === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          <PHStat label="Total Registry Patients" value={total.patients} color={C.sky} />
          <PHStat label="Active on Treatment" value={total.active} color="#10B981" />
          <PHStat label="Well Controlled" value={total.controlled} color="#059669" />
          <PHStat label="Needs Attention" value={total.uncontrolled} color="#EF4444" />
          <PHStat label="Missed Appointments" value={38} color="#F59E0B" suffix="this week" />
        </div>

        {view === 'registries' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
              {registries.map(r => (
                <div
                  key={r.id}
                  onClick={() => setActiveRegistry(activeRegistry === r.id ? null : r.id)}
                  style={{
                    padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: `1px solid ${activeRegistry === r.id ? r.color : 'var(--surface-border)'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color }}>{r.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: r.color }}>{r.count}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 11 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Active</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.active}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Controlled</div>
                      <div style={{ fontWeight: 600, color: '#10B981' }}>{r.controlled}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Uncontrolled</div>
                      <div style={{ fontWeight: 600, color: '#EF4444' }}>{r.uncontrolled}</div>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-border)', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: `${(r.controlled / r.count) * 100}%`, background: '#10B981', transition: 'width 0.3s' }} />
                    <div style={{ width: `${(r.uncontrolled / r.count) * 100}%`, background: '#EF4444', transition: 'width 0.3s' }} />
                    <div style={{ flex: 1, background: 'var(--surface-elevated)' }} />
                  </div>
                  {activeRegistry === r.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--surface-border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quality Indicators</div>
                      {r.indicators.map((ind, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11 }}>
                          <span style={{ width: 140, color: 'var(--text-secondary)' }}>{ind.label}</span>
                          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--surface-border)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${parseInt(ind.value)}%`, borderRadius: 2, background: ind.status === 'met' ? '#10B981' : ind.status === 'near' ? '#F59E0B' : '#EF4444', transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ fontWeight: 600, width: 40, textAlign: 'right', color: ind.status === 'met' ? '#10B981' : ind.status === 'near' ? '#F59E0B' : '#EF4444' }}>{ind.value}</span>
                          <span style={{ color: 'var(--text-muted)', width: 50, textAlign: 'right', fontSize: 10 }}>target {ind.target}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'cohorts' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>Uncontrolled Patient Cohort</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px' }}>Patients requiring active intervention — {cohortPatients.length} identified</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 60px 100px 70px 70px 70px 100px 60px', gap: 6, padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Patient</span><span>Age</span><span>Disease</span><span>Status</span><span>Last Visit</span><span>HbA1c/BP</span><span>Next Appointment</span><span />
              </div>
              {cohortPatients.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 60px 100px 70px 70px 70px 100px 60px', gap: 6, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{p.age}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--surface-border)', color: 'var(--text-primary)', fontSize: 10, textAlign: 'center' }}>{p.disease}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>{p.status}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{p.lastVisit}</span>
                  <span style={{ fontWeight: 600, color: p.hba1c !== '-' && parseFloat(p.hba1c) > 8 ? '#EF4444' : '#F59E0B' }}>{p.hba1c !== '-' ? p.hba1c : p.bp}</span>
                  <span style={{ color: p.nextAppt === '11 Jul' || p.nextAppt === '12 Jul' ? '#EF4444' : 'var(--text-muted)', fontWeight: p.nextAppt === '11 Jul' || p.nextAppt === '12 Jul' ? 600 : 400 }}>{p.nextAppt}</span>
                  <button style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Contact</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'outreach' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Upcoming Outreach Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {outreachEvents.map((e, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-elevated)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{e.campaign}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: e.type === 'screening' ? 'rgba(16,185,129,0.1)' : e.type === 'education' ? 'rgba(14,165,233,0.1)' : e.type === 'testing' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: e.type === 'screening' ? '#10B981' : e.type === 'education' ? '#0EA5E9' : e.type === 'testing' ? '#EF4444' : '#F59E0B', textTransform: 'capitalize' }}>{e.type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                        <span>{e.date}</span>
                        <span>Target: {e.target}</span>
                        <span>Registered: {e.registered}</span>
                        <span>Staff: {e.staff}</span>
                      </div>
                      <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: 'var(--surface-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${(e.registered / e.target) * 100}%`, height: '100%', borderRadius: 2, background: '#10B981' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Coverage Map</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { zone: 'Urban Central', screened: 1240, target: 2000, percentage: '62%' },
                    { zone: 'Urban East', screened: 876, target: 1500, percentage: '58%' },
                    { zone: 'Urban West', screened: 654, target: 1200, percentage: '55%' },
                    { zone: 'Rural North', screened: 342, target: 800, percentage: '43%' },
                    { zone: 'Rural South', screened: 287, target: 700, percentage: '41%' },
                    { zone: 'Peri-urban', screened: 523, target: 900, percentage: '58%' },
                  ].map((z, i) => (
                    <div key={i} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-elevated)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{z.zone}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{z.screened} / {z.target} screened</div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-border)', overflow: 'hidden' }}>
                        <div style={{ width: z.percentage, height: '100%', borderRadius: 2, background: parseInt(z.percentage) >= 60 ? '#10B981' : parseInt(z.percentage) >= 50 ? '#F59E0B' : '#EF4444' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'coverage' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Screening Coverage</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="35" fill="none" stroke="var(--surface-border)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="35" fill="none" stroke="#10B981" strokeWidth="6" strokeDasharray={`${0.58 * 220} 220`} transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#10B981' }}>58%</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Overall screening coverage across all registries<br />
                    Target: 75% | Gap: 17%<br />
                    <span style={{ color: '#F59E0B', fontWeight: 600 }}>4 registries below target</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Treatment Coverage</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="35" fill="none" stroke="var(--surface-border)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="35" fill="none" stroke="#059669" strokeWidth="6" strokeDasharray={`${0.72 * 220} 220`} transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#059669' }}>72%</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Registry patients actively on treatment<br />
                    Target: 85% | Gap: 13%<br />
                    <span style={{ color: '#F59E0B', fontWeight: 600 }}>2 registries below target</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Control Rate</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="35" fill="none" stroke="var(--surface-border)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="35" fill="none" stroke="#10B981" strokeWidth="6" strokeDasharray={`${0.48 * 220} 220`} transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#10B981' }}>48%</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Patients meeting treatment targets<br />
                    Target: 60% | Gap: 12%<br />
                    <span style={{ color: '#EF4444', fontWeight: 600 }}>7 registries below target</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Benchmark Comparison</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {registries.map((r, i) => {
                  const controlRate = Math.round((r.controlled / r.active) * 100)
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 80px', gap: 8, padding: '6px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</span>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-border)', display: 'flex', overflow: 'hidden' }}>
                        <div style={{ width: `${controlRate}%`, background: controlRate >= 70 ? '#10B981' : controlRate >= 50 ? '#F59E0B' : '#EF4444', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontWeight: 700, textAlign: 'right', color: controlRate >= 70 ? '#10B981' : controlRate >= 50 ? '#F59E0B' : '#EF4444' }}>{controlRate}%</span>
                      <span style={{ color: 'var(--text-muted)', textAlign: 'right' }}>target 60%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PHStat({ label, value, color, suffix }: { label: string; value: number; color: string; suffix?: string }) {
  return <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', textAlign: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}{suffix ? ` · ${suffix}` : ''}</div>
  </div>
}
