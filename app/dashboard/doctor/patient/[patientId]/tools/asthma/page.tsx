'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity, Wind, AlertTriangle, Check, Clock, TrendingDown } from 'lucide-react'

export default function AsthmaToolsPage({ params }: { params: { patientId: string } }) {
  const [peakFlow, setPeakFlow] = useState('')

  const readings = [
    { date: '12 Jul 2026', peak: 380, symptoms: 'mild', attacks: 0 },
    { date: '10 Jul 2026', peak: 340, symptoms: 'moderate', attacks: 1 },
    { date: '08 Jul 2026', peak: 420, symptoms: 'none', attacks: 0 },
    { date: '05 Jul 2026', peak: 360, symptoms: 'mild', attacks: 0 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Wind size={18} color="#8B5CF6" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Asthma Management</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Patient: {params.patientId}</span>
      </div>
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Latest Peak Flow</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#8B5CF6' }}>380</div>
            <div style={{ fontSize: 10, color: '#10B981' }}>78% predicted</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Attacks (30d)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>2</div>
            <div style={{ fontSize: 10, color: '#10B981' }}>Well controlled</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>SABA Use</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>4/wk</div>
            <div style={{ fontSize: 10, color: '#F59E0B' }}>↑ Step up consider</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Control Status</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>Partial</div>
            <div style={{ fontSize: 10, color: '#F59E0B' }}>ACT Score: 18</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Record Peak Flow</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={peakFlow} onChange={e => setPeakFlow(e.target.value)} placeholder="L/min" />
              <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Save</button>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
              {['green', 'yellow', 'red'].map(z => (
                <button key={z} style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--surface-border)', background: z === 'green' ? '#10B98115' : z === 'yellow' ? '#F59E0B15' : '#EF444415', color: z === 'green' ? '#10B981' : z === 'yellow' ? '#F59E0B' : '#EF4444', fontSize: 10, cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{z} Zone</button>
              ))}
            </div>
          </div>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Current Medication</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>Salbutamol Inhaler 100mcg PRN</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>Budesonide/Formoterol 160/4.5mcg BD</div>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: '#F59E0B10', border: '1px solid #F59E0B30', color: '#92400E', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} /> Consider step-up to medium-dose ICS/LABA</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>Peak Flow Trend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 60px 60px 60px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Date</span><span>Peak Flow</span><span>Symptoms</span><span>Attacks</span></div>
            {readings.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 60px 60px 60px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.date}</span>
                <span style={{ fontWeight: 600 }}>{r.peak}</span>
                <span style={{ color: r.symptoms === 'none' ? '#10B981' : r.symptoms === 'mild' ? '#F59E0B' : '#EF4444', textTransform: 'capitalize' }}>{r.symptoms}</span>
                <span style={{ fontWeight: 600 }}>{r.attacks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
