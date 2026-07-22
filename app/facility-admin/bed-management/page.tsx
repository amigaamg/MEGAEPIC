'use client'

import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import { ArrowLeft, Bed, Search, Filter, Activity } from 'lucide-react'
import { useState } from 'react'

export default function BedManagementPage() {
  const router = useRouter()
  const [ward, setWard] = useState('all')
  const wards = [
    { id: 'ward-3a', name: 'Ward 3A - Medical', beds: 24, occupied: 20, icu: false },
    { id: 'ward-4a', name: 'Ward 4A - Cardiology', beds: 20, occupied: 18, icu: false },
    { id: 'ward-5a', name: 'Ward 5A - Pediatric', beds: 18, occupied: 14, icu: false },
    { id: 'icu', name: 'Intensive Care Unit', beds: 12, occupied: 10, icu: true },
    { id: 'hdu', name: 'High Dependency Unit', beds: 8, occupied: 6, icu: true },
    { id: 'nicu', name: 'NICU', beds: 10, occupied: 8, icu: true },
    { id: 'ward-6a', name: 'Ward 6A - Surgical', beds: 28, occupied: 18, icu: false },
    { id: 'ward-7a', name: 'Ward 7A - Maternity', beds: 16, occupied: 12, icu: false },
    { id: 'ward-8a', name: 'Ward 8A - Isolation', beds: 8, occupied: 3, icu: false },
  ]

  const filteredWards = ward === 'all' ? wards : wards.filter(w => w.icu === (ward === 'icu'))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.back()} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><ArrowLeft size={16} /></button>
        <Bed size={18} color={C.sky} />
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Bed Management</h1>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ key: 'all', label: 'All' }, { key: 'icu', label: 'ICU/HDU' }, { key: 'ward', label: 'Wards' }].map(w => (
            <button key={w.key} onClick={() => setWard(w.key)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: ward === w.key ? C.sky : 'var(--surface)', color: ward === w.key ? 'white' : 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}>{w.label}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filteredWards.map((w, i) => {
          const pct = Math.round((w.occupied / w.beds) * 100)
          const pctColor = pct > 85 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981'
          return (
            <div key={i} style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</span>
                {w.icu && <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: '#EF444415', color: '#EF4444' }}>ICU</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 11 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: 'var(--surface-elevated)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{w.beds}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Total</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: 'var(--surface-elevated)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: pctColor }}>{w.occupied}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Occupied</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: 'var(--surface-elevated)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{w.beds - w.occupied}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Available</div>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-border)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: pctColor }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{pct}% occupancy</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
