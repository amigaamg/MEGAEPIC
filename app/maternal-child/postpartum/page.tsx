'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Users, Heart, Baby, ArrowLeft } from 'lucide-react'
import { MCStat } from '@/components/ui/MCStat'
import { useRouter } from 'next/navigation'

export default function PostpartumIC() {
  const router = useRouter()
  const [tab, setTab] = useState('ward')
  const patients = [
    { name: 'Grace Mwangi', delivery: 'SVD', daysPP: 2, bleeding: 'Normal', fundus: 'U+1', breastfeeding: 'Exclusive', bp: '120/80', depression: 'Negative', wound: 'Intact' },
    { name: 'Nancy Wambui', delivery: 'C-section', daysPP: 1, bleeding: 'Heavy', fundus: 'U+3', breastfeeding: 'Latching', bp: '145/90', depression: 'Mild', wound: 'Clean' },
    { name: 'Faith Chebet', delivery: 'SVD', daysPP: 3, bleeding: 'Normal', fundus: 'U-0', breastfeeding: 'Exclusive', bp: '110/70', depression: 'Negative', wound: 'N/A' },
    { name: 'Ann Wanjiku', delivery: 'Vacuum', daysPP: 0, bleeding: 'Normal', fundus: 'U+2', breastfeeding: 'Not started', bp: '130/85', depression: 'Screening', wound: 'Intact' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Users size={18} color="#14B8A6" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Postpartum IC</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['ward', 'breastfeeding', 'depression', 'follow_up'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#14B8A6' : 'transparent'}`, background: 'transparent', color: tab === t ? '#14B8A6' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{t.replace('_', ' ')}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="Postpartum Ward" value="8" color="#14B8A6" /><MCStat label="C-section Recovery" value="3" color="#F59E0B" />
          <MCStat label="Breastfeeding Issues" value="2" color="#EF4444" /><MCStat label="EPDS Positive" value="1" color="#EC4899" />
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Postpartum Ward Round</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 60px 50px 50px 70px 70px 70px 60px', gap: 4, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Patient</span><span>Delivery</span><span>Day</span><span>Bleed</span><span>Fundus</span><span>BF</span><span>BP</span><span>Wound</span></div>
            {patients.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 60px 50px 50px 70px 70px 70px 60px', gap: 4, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span><span style={{ color: 'var(--text-muted)' }}>{p.delivery}</span>
                <span>{p.daysPP}d</span><span style={{ color: p.bleeding === 'Heavy' ? '#EF4444' : '#10B981' }}>{p.bleeding}</span>
                <span>{p.fundus}</span><span>{p.breastfeeding}</span>
                <span style={{ fontWeight: 600, color: p.bp.startsWith('145') ? '#EF4444' : '#10B981' }}>{p.bp}</span>
                <span style={{ color: p.wound === 'Clean' || p.wound === 'Intact' ? '#10B981' : 'var(--text-muted)' }}>{p.wound}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
