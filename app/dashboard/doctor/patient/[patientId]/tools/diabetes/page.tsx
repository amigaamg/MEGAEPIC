'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity, TrendingDown, Droplets, Weight, Calendar, Clock, AlertTriangle, Check } from 'lucide-react'

export default function DiabetesToolsPage({ params }: { params: { patientId: string } }) {
  const [glucose, setGlucose] = useState('')
  const [readingType, setReadingType] = useState('fasting')

  const readings = [
    { date: '12 Jul 2026', fasting: 7.2, post: 9.8, hba1c: 7.1 },
    { date: '05 Jul 2026', fasting: 7.8, post: 10.2, hba1c: 7.3 },
    { date: '28 Jun 2026', fasting: 8.1, post: 11.0, hba1c: 7.5 },
    { date: '20 Jun 2026', fasting: 8.5, post: 11.5, hba1c: 7.8 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Activity size={18} color="#10B981" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Diabetes Management</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Patient: {params.patientId}</span>
      </div>
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Latest HbA1c</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>7.1%</div>
            <div style={{ fontSize: 10, color: '#10B981' }}>↓ Target range</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Fasting Glucose</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>7.2</div>
            <div style={{ fontSize: 10, color: '#F59E0B' }}>↑ Above target</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Postprandial</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>9.8</div>
            <div style={{ fontSize: 10, color: '#F59E0B' }}>↑ Above target</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Readings (30d)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.sky }}>28</div>
            <div style={{ fontSize: 10, color: C.sky }}>85% adherence</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Record Reading</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {['fasting', 'postprandial', 'random'].map(t => (
                  <button key={t} onClick={() => setReadingType(t)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: readingType === t ? '#10B981' : 'var(--surface)', color: readingType === t ? C.white : 'var(--text-secondary)', fontSize: 10, cursor: 'pointer', fontWeight: readingType === t ? 600 : 400, textTransform: 'capitalize' }}>{t}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" step="0.1" style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={glucose} onChange={e => setGlucose(e.target.value)} placeholder="mmol/L" />
                <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#10B981', color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Save</button>
              </div>
            </div>
          </div>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Current Medication</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>Metformin 500mg BD</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>Gliclazide MR 30mg OD</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: '#F59E0B10', border: '1px solid #F59E0B30', color: '#92400E', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} /> Consider insulin initiation</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Glucose Trend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 60px 60px 60px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Date</span><span>Fasting</span><span>Post</span><span>HbA1c</span></div>
            {readings.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 60px 60px 60px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.date}</span>
                <span style={{ fontWeight: 600, color: r.fasting > 7 ? '#F59E0B' : '#10B981' }}>{r.fasting}</span>
                <span style={{ fontWeight: 600, color: r.post > 10 ? '#F59E0B' : '#10B981' }}>{r.post}</span>
                <span style={{ fontWeight: 600, color: r.hba1c > 7 ? '#F59E0B' : '#10B981' }}>{r.hba1c}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
