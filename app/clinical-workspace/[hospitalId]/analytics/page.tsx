'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { C } from '@/lib/colors'
import { Activity, TrendingUp, Clock, Users, Bed, AlertTriangle, BarChart3, LineChart, PieChart, Download, Printer, Calendar, ArrowUp, ArrowDown, Stethoscope, Heart, Pill, Syringe, Shield, Zap } from 'lucide-react'

export default function AnalyticsPage() {
  const params = useParams()
  const hospitalId = params?.hospitalId as string
  const [period, setPeriod] = useState('week')
  const [dept, setDept] = useState('all')

  const kpis = [
    { label: 'Encounters Today', value: 247, change: '+12%', up: true, icon: <Activity size={18} />, color: C.sky },
    { label: 'Active Patients', value: 1_342, change: '+5%', up: true, icon: <Users size={18} />, color: '#10B981' },
    { label: 'Avg Wait Time', value: '34min', change: '-8%', up: false, icon: <Clock size={18} />, color: '#F59E0B' },
    { label: 'Bed Occupancy', value: '78%', change: '+3%', up: true, icon: <Bed size={18} />, color: '#8B5CF6' },
    { label: 'Critical Patients', value: 18, change: '-2%', up: false, icon: <AlertTriangle size={18} />, color: '#EF4444' },
    { label: 'Discharges Today', value: 89, change: '+15%', up: true, icon: <TrendingUp size={18} />, color: '#EC4899' },
  ]

  const deptData = [
    { name: 'Emergency', patients: 42, wait: 18, admits: 12, acuity: '4.2', census: 38, beds: 42 },
    { name: 'ICU', patients: 18, wait: 0, admits: 3, acuity: '4.8', census: 18, beds: 20 },
    { name: 'Cardiology', patients: 32, wait: 28, admits: 5, acuity: '3.5', census: 28, beds: 35 },
    { name: 'Pediatrics', patients: 28, wait: 22, admits: 6, acuity: '3.2', census: 24, beds: 30 },
    { name: 'Maternity', patients: 22, wait: 14, admits: 8, acuity: '3.8', census: 20, beds: 25 },
    { name: 'Surgery', patients: 35, wait: 42, admits: 7, acuity: '3.6', census: 30, beds: 40 },
    { name: 'Outpatient', patients: 68, wait: 45, admits: 0, acuity: '2.5', census: 55, beds: 0 },
    { name: 'Mental Health', patients: 15, wait: 35, admits: 2, acuity: '3.4', census: 14, beds: 18 },
  ]

  const diseases = [
    { name: 'Hypertension', count: 342, trend: '+8%', prevWeek: 317, color: '#EF4444' },
    { name: 'Diabetes', count: 286, trend: '+5%', prevWeek: 272, color: '#F97316' },
    { name: 'HIV', count: 198, trend: '+1%', prevWeek: 196, color: '#EC4899' },
    { name: 'Malaria', count: 167, trend: '-12%', prevWeek: 190, color: '#F59E0B' },
    { name: 'Pneumonia', count: 124, trend: '+15%', prevWeek: 108, color: '#14B8A6' },
    { name: 'TB', count: 87, trend: '+3%', prevWeek: 84, color: '#6366F1' },
    { name: 'Heart Failure', count: 76, trend: '+6%', prevWeek: 72, color: '#8B5CF6' },
    { name: 'CKD', count: 64, trend: '+4%', prevWeek: 62, color: '#A855F7' },
  ]

  const quality = [
    { metric: 'Door-to-Provider Time', target: '<15 min', actual: '12 min', status: 'on_target' },
    { metric: 'Medication Reconciliation', target: '>95%', actual: '92%', status: 'near_target' },
    { metric: 'Hand Hygiene Compliance', target: '>90%', actual: '87%', status: 'needs_improvement' },
    { metric: 'Readmission Rate (30d)', target: '<10%', actual: '8.5%', status: 'on_target' },
    { metric: 'Hospital-Acquired Infections', target: '<2%', actual: '1.8%', status: 'on_target' },
    { metric: 'Surgical Site Infections', target: '<3%', actual: '2.1%', status: 'on_target' },
    { metric: 'Patient Satisfaction', target: '>85%', actual: '82%', status: 'near_target' },
    { metric: 'Discharge Summary Timeliness', target: '<24hr', actual: '18hr', status: 'on_target' },
  ]

  const trendData = [
    { day: 'Mon', encounters: 42, admits: 8, discharges: 7 },
    { day: 'Tue', encounters: 38, admits: 6, discharges: 9 },
    { day: 'Wed', encounters: 45, admits: 10, discharges: 11 },
    { day: 'Thu', encounters: 40, admits: 7, discharges: 8 },
    { day: 'Fri', encounters: 52, admits: 12, discharges: 14 },
    { day: 'Sat', encounters: 36, admits: 5, discharges: 6 },
    { day: 'Sun', encounters: 30, admits: 4, discharges: 5 },
  ]

  const outcomeData = [
    { metric: 'Mortality Rate', value: '2.8%', benchmark: '3.5%', color: '#10B981' },
    { metric: 'Complication Rate', value: '4.2%', benchmark: '5.0%', color: '#10B981' },
    { metric: 'C-section Rate', value: '32%', benchmark: '25%', color: '#F59E0B' },
    { metric: 'Bed Turnaround', value: '4.2hr', benchmark: '4.0hr', color: '#F59E0B' },
    { metric: 'Lab TAT (Stat)', value: '38min', benchmark: '45min', color: '#10B981' },
    { metric: 'ER LOS (Discharged)', value: '4.5hr', benchmark: '4.0hr', color: '#EF4444' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <BarChart3 size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Analytics & Intelligence</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {['day', 'week', 'month', 'quarter'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: period === p ? 'var(--primary)' : 'var(--surface)', color: period === p ? 'white' : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {p}
            </button>
          ))}
        </div>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Download size={14} /> Export
        </button>
      </div>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ padding: 14, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{k.label}</span>
                <span style={{ color: k.color, opacity: 0.7 }}>{k.icon}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{k.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 11, color: k.up ? '#10B981' : '#EF4444' }}>
                {k.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span style={{ fontWeight: 600 }}>{k.change}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs yesterday</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Daily Trend</h3>
              <LineChart size={16} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100, paddingTop: 10 }}>
              {trendData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: 8, height: `${(d.encounters / 52) * 80}px`, borderRadius: '4px 4px 0 0', background: C.sky, opacity: 0.8 }} />
                    <div style={{ width: 8, height: `${(d.admits / 12) * 80}px`, borderRadius: '4px 4px 0 0', background: '#10B981', opacity: 0.6 }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{d.day.substring(0, 3)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 10, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.sky }} /> Encounters</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} /> Admits</span>
            </div>
          </div>

          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Clinical Outcomes</h3>
              <PieChart size={16} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {outcomeData.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: 'var(--surface-elevated)', fontSize: 12 }}>
                  <span style={{ width: 140, color: 'var(--text-secondary)' }}>{o.metric}</span>
                  <span style={{ fontWeight: 700, color: o.color }}>{o.value}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>benchmark: {o.benchmark}</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: o.color }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Department Operations</h3>
              <select value={dept} onChange={e => setDept(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 11, outline: 'none' }}>
                <option value="all">All Departments</option>
                {deptData.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(dept === 'all' ? deptData : deptData.filter(d => d.name === dept)).map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 60px 60px 60px 60px 60px', gap: 8, padding: '6px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.patients} pts</span>
                  <span style={{ color: d.wait > 30 ? '#EF4444' : d.wait > 20 ? '#F59E0B' : '#10B981', fontWeight: 600 }}>{d.wait}min</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.admits} admits</span>
                  <span style={{ color: 'var(--text-muted)' }}>{d.census}/{d.beds}</span>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(d.census / Math.max(d.beds, 1)) * 100}%`, borderRadius: 2, background: (d.census / Math.max(d.beds, 1)) > 0.85 ? '#EF4444' : (d.census / Math.max(d.beds, 1)) > 0.7 ? '#F59E0B' : '#10B981' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Disease Surveillance</h3>
              <Zap size={16} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {diseases.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 50px 1fr 60px', gap: 8, padding: '6px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</span>
                  <span style={{ fontWeight: 700, color: d.color }}>{d.count}</span>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(d.count / 350) * 100}%`, borderRadius: 2, background: d.color, opacity: 0.7 }} />
                  </div>
                  <span style={{ color: d.trend.startsWith('+') ? '#EF4444' : '#10B981', fontWeight: 600, textAlign: 'right' }}>{d.trend}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
              Active surveillance across all departments — {diseases.reduce((s, d) => s + d.count, 0)} total cases
            </div>
          </div>
        </div>

        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Quality Indicators</h3>
            <Shield size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {quality.map((q, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 120px', gap: 8, padding: '8px 12px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-primary)' }}>{q.metric}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Target: {q.target}</span>
                <span style={{ fontWeight: 700, color: q.status === 'on_target' ? '#10B981' : q.status === 'near_target' ? '#F59E0B' : '#EF4444' }}>{q.actual}</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: q.status === 'on_target' ? 'rgba(16,185,129,0.1)' : q.status === 'near_target' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: q.status === 'on_target' ? '#10B981' : q.status === 'near_target' ? '#F59E0B' : '#EF4444', textAlign: 'center', textTransform: 'capitalize' }}>
                  {q.status === 'on_target' ? '✓ On Track' : q.status === 'near_target' ? '⚠ Near Target' : '✗ Needs Work'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
