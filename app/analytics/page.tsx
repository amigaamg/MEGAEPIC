'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { TrendingUp, BarChart3, Activity, Users, Bed, DollarSign, Calendar, Filter } from 'lucide-react'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('week')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <TrendingUp size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Analytics</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {['day', 'week', 'month', 'quarter', 'year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: period === p ? C.sky : 'var(--surface)', color: period === p ? C.white : 'var(--text-secondary)', fontSize: 10, fontWeight: period === p ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Activity size={14} color={C.sky} /><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Encounters</span></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.sky }}>847</div>
            <div style={{ fontSize: 10, color: '#10B981' }}>↑ 12% vs last period</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Users size={14} color="#10B981" /><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Patients</span></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>1,245</div>
            <div style={{ fontSize: 10, color: '#10B981' }}>↑ 8% vs last period</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Bed size={14} color="#8B5CF6" /><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Bed Occupancy</span></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#8B5CF6' }}>78%</div>
            <div style={{ fontSize: 10, color: '#F59E0B' }}>↑ 3% vs last period</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><DollarSign size={14} color="#F59E0B" /><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Revenue</span></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>KES 2.4M</div>
            <div style={{ fontSize: 10, color: '#10B981' }}>↑ 15% vs last period</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Department Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { dept: 'General Surgery', encounters: 182, target: 200, pct: 91 },
                { dept: 'Internal Medicine', encounters: 156, target: 180, pct: 87 },
                { dept: 'Paediatrics', encounters: 124, target: 150, pct: 83 },
                { dept: 'OB/GYN', encounters: 145, target: 160, pct: 91 },
                { dept: 'Orthopaedics', encounters: 98, target: 120, pct: 82 },
                { dept: 'Casualty', encounters: 210, target: 250, pct: 84 },
              ].map((d, i) => (
                <div key={i} style={{ padding: '6px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600 }}>{d.dept}</span>
                    <span style={{ color: d.pct >= 90 ? '#10B981' : d.pct >= 80 ? '#F59E0B' : '#EF4444' }}>{d.encounters}/{d.target}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-border)', overflow: 'hidden' }}>
                    <div style={{ width: `${d.pct}%`, height: '100%', borderRadius: 2, background: d.pct >= 90 ? '#10B981' : d.pct >= 80 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Clinical Outcomes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Average LOS', value: '4.2 days', trend: '-0.5d', color: '#10B981' },
                { label: 'Readmission Rate (30d)', value: '8.4%', trend: '-1.2%', color: '#10B981' },
                { label: 'Mortality Rate', value: '2.1%', trend: '-0.3%', color: '#10B981' },
                { label: 'Surgical Site Infection', value: '1.8%', trend: '+0.2%', color: '#EF4444' },
                { label: 'C-section Rate', value: '32%', trend: '+2%', color: '#F59E0B' },
                { label: 'Default Rate', value: '14%', trend: '-3%', color: '#10B981' },
              ].map((o, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{o.label}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>{o.value}</span>
                    <span style={{ color: o.color, fontSize: 10, fontWeight: 600 }}>{o.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
