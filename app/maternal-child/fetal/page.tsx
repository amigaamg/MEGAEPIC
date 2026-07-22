'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Heart, Baby, Activity, Search, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MCStat } from '@/components/ui/MCStat'

export default function FetalIC() {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const pregnancies = [
    { id: 'P1', mother: 'Grace Mwangi', ga: '32w', edd: '10 Sep 2026', status: 'singleton', risk: 'low', growth: '25th', bpp: '10/10', dopplers: 'Normal' },
    { id: 'P2', mother: 'Nancy Wambui', ga: '28w', edd: '08 Oct 2026', status: 'twins', risk: 'moderate', growth: '15th', bpp: '8/10', dopplers: 'REDF' },
    { id: 'P3', mother: 'Faith Chebet', ga: '36w', edd: '14 Aug 2026', status: 'singleton', risk: 'low', growth: '50th', bpp: '10/10', dopplers: 'Normal' },
    { id: 'P4', mother: 'Ann Wanjiku', ga: '24w', edd: '05 Nov 2026', status: 'singleton', risk: 'high', growth: '5th', bpp: '6/10', dopplers: 'AEDF' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Heart size={18} color="#EC4899" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Fetal Intelligence Center</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['overview', 'growth', 'dopplers', 'anomalies', 'twins'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#EC4899' : 'transparent'}`, background: 'transparent', color: tab === t ? '#EC4899' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="Active Pregnancies" value="48" color="#EC4899" />
          <MCStat label="Twins" value="4" color="#8B5CF6" />
          <MCStat label="High Risk" value="7" color="#EF4444" />
          <MCStat label="Due This Month" value="12" color="#10B981" />
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Fetal Tracking</h3>
          {pregnancies.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 60px 80px 80px 80px 80px 80px', gap: 8, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
              <span style={{ fontWeight: 600 }}>{p.mother}</span>
              <span style={{ color: 'var(--text-muted)' }}>{p.ga}</span>
              <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: p.risk === 'low' ? 'rgba(16,185,129,0.1)' : p.risk === 'moderate' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: p.risk === 'low' ? '#10B981' : p.risk === 'moderate' ? '#F59E0B' : '#EF4444', textAlign: 'center', textTransform: 'capitalize' }}>{p.risk}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{p.growth}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{p.bpp}</span>
              <span style={{ fontWeight: 600, color: p.dopplers === 'REDF' || p.dopplers === 'AEDF' ? '#EF4444' : '#10B981' }}>{p.dopplers}</span>
              <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


