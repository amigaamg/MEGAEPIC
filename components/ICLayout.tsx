'use client'

import { Search, Plus, ArrowRight } from 'lucide-react'
import { C } from '@/lib/colors'

export function ICLayout({ title, icon, stats, tab, setTab, search, setSearch, patients, color, conditions, meds, indicators }: any) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        {icon}
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <button style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <Plus size={14} /> New Patient
        </button>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['overview', 'registry', 'monitoring', 'treatment', 'quality'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`, background: 'transparent', color: tab === t ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-sans)' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
          <StatCard label="Total Registry" value={stats.total} color={color} />
          <StatCard label="Active" value={stats.active} color="#10B981" />
          <StatCard label="Critical" value={stats.critical} color="#EF4444" />
          <StatCard label="Follow-up" value={stats.followUp} color="#F59E0B" />
          <StatCard label="New/Week" value={stats.newThisWeek} color={C.sky} />
          <StatCard label="Mortality" value={stats.mortality} color="#6B7280" />
        </div>
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Common Conditions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{conditions.map((c: string, i: number) => <span key={i} style={{ padding: '4px 12px', borderRadius: 6, background: `${color}10`, color, fontSize: 12, fontWeight: 500 }}>{c}</span>)}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Common Medications</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{meds.map((m: string, i: number) => <span key={i} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--sky-50)', color: 'var(--primary)', fontSize: 12, fontWeight: 500 }}>{m}</span>)}</div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Active Patients</h3>
              <PatientTable patients={patients} color={color} />
            </div>
          </div>
        )}
        {tab === 'registry' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Patient Registry ({patients.length})</h3>
            <PatientTable patients={patients} color={color} />
          </div>
        )}
        {tab === 'monitoring' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Monitoring Dashboard</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <MonitorCard label="Vitals Overdue" value="3" color="#EF4444" />
              <MonitorCard label="Labs Pending" value="7" color="#F59E0B" />
              <MonitorCard label="Imaging Pending" value="4" color={C.sky} />
            </div>
          </div>
        )}
        {tab === 'treatment' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Treatment Intelligence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[
              { condition: 'Standard first-line', firstLine: 'Per guideline', alternative: 'Individualized', duration: 'Per protocol' },
              { condition: 'Escalation therapy', firstLine: 'Second-line agents', alternative: 'Combination therapy', duration: 'Reassess 4wk' },
              { condition: 'Maintenance', firstLine: 'Lowest effective dose', alternative: 'Drug holiday', duration: 'Long-term' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-elevated)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: 12, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.condition}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{t.firstLine}</span>
                <span style={{ color: 'var(--text-muted)' }}>{t.alternative}</span>
                <span style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{t.duration}</span>
              </div>
            ))}</div>
          </div>
        )}
        {tab === 'quality' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Quality Indicators</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {indicators.map((ind: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--surface-elevated)', fontSize: 12 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: i < 3 ? '#10B981' : '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700 }}>{i < 3 ? '✓' : '!'}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{ind}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{i < 3 ? 'On target' : 'Needs improvement'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', textAlign: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
}

function PatientTable({ patients, color }: { patients: any[]; color: string }) {
  return <div>{patients.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No patients</div> : patients.map((p, i) => (
    <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 80px 80px', gap: 8, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 12 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{p.diagnosis}</span>
      <span style={{ padding: '2px 6px', borderRadius: 4, background: p.status === 'critical' ? 'rgba(239,68,68,0.1)' : p.status === 'active' ? 'rgba(16,185,129,0.1)' : 'var(--surface-elevated)', color: p.status === 'critical' ? '#EF4444' : p.status === 'active' ? '#10B981' : 'var(--text-muted)', fontWeight: 600, fontSize: 10, textAlign: 'center', textTransform: 'capitalize' }}>{p.status}</span>
      <span style={{ color: 'var(--text-muted)' }}>{p.bed}</span>
      <span style={{ fontSize: 16, cursor: 'pointer', textAlign: 'right' }}><ArrowRight size={14} color="var(--text-muted)" /></span>
    </div>
  ))}</div>
}

function MonitorCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ padding: 16, borderRadius: 10, background: `${color}08`, border: `1px solid ${color}20` }}>
    <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
}
