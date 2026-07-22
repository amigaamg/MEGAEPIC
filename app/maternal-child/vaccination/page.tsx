'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Syringe, Shield, Activity, Search, AlertTriangle, ArrowLeft } from 'lucide-react'
import { MCStat } from '@/components/ui/MCStat'
import { useRouter } from 'next/navigation'

export default function VaccinationIC() {
  const router = useRouter()
  const [tab, setTab] = useState('schedule')
  const vaccines = [
    { name: 'BCG', schedule: 'Birth', coverage: '94%', target: '95%', stock: 240, due: 12, adverse: 0 },
    { name: 'OPV 0', schedule: 'Birth', coverage: '92%', target: '95%', stock: 180, due: 15, adverse: 0 },
    { name: 'OPV 1', schedule: '6w', coverage: '88%', target: '90%', stock: 200, due: 22, adverse: 0 },
    { name: 'OPV 2', schedule: '10w', coverage: '85%', target: '90%', stock: 165, due: 28, adverse: 0 },
    { name: 'OPV 3', schedule: '14w', coverage: '82%', target: '90%', stock: 150, due: 35, adverse: 0 },
    { name: 'IPV', schedule: '14w', coverage: '78%', target: '85%', stock: 120, due: 40, adverse: 0 },
    { name: 'PCV 1', schedule: '6w', coverage: '88%', target: '90%', stock: 190, due: 22, adverse: 1 },
    { name: 'PCV 2', schedule: '10w', coverage: '84%', target: '90%', stock: 160, due: 28, adverse: 0 },
    { name: 'PCV 3', schedule: '14w', coverage: '80%', target: '90%', stock: 140, due: 35, adverse: 0 },
    { name: 'RV 1', schedule: '6w', coverage: '86%', target: '90%', stock: 175, due: 22, adverse: 0 },
    { name: 'RV 2', schedule: '10w', coverage: '82%', target: '90%', stock: 155, due: 28, adverse: 0 },
    { name: 'Measles 1', schedule: '9m', coverage: '76%', target: '85%', stock: 110, due: 45, adverse: 0 },
    { name: 'Measles 2', schedule: '18m', coverage: '62%', target: '85%', stock: 85, due: 55, adverse: 0 },
    { name: 'Yellow Fever', schedule: '9m', coverage: '74%', target: '85%', stock: 100, due: 42, adverse: 0 },
    { name: 'Td (pregnant)', schedule: 'ANC', coverage: '68%', target: '80%', stock: 90, due: 32, adverse: 0 },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Syringe size={18} color="#6366F1" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Vaccination Intelligence</span>
        <div style={{ flex: 1 }} />
        <span style={{ padding: '4px 10px', borderRadius: 6, background: '#F59E0B15', color: '#F59E0B', fontSize: 11, fontWeight: 600 }}><AlertTriangle size={12} /> 1 Adverse Event</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['schedule', 'coverage', 'stock', 'adverse_events', 'forecast'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#6366F1' : 'transparent'}`, background: 'transparent', color: tab === t ? '#6366F1' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>{t.replace('_', ' ')}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="Coverage Rate" value="81.2%" color="#6366F1" /><MCStat label="Stock at Risk" value="3" color="#EF4444" />
          <MCStat label="Due this Week" value="398" color="#F59E0B" /><MCStat label="Missed Doses" value="87" color="#EF4444" />
          <MCStat label="Zero-Dose Children" value="24" color="#EC4899" />
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Vaccination Schedule & Coverage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 60px 1fr 60px 60px 60px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Vaccine</span><span>Schedule</span><span>Coverage</span><span>Stock</span><span>Due</span><span>AEs</span></div>
            {vaccines.map((v, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 60px 1fr 60px 60px 60px', gap: 6, padding: '6px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{v.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{v.schedule}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface-border)', overflow: 'hidden' }}>
                    <div style={{ width: v.coverage, height: '100%', borderRadius: 3, background: parseInt(v.coverage) >= parseInt(v.target) ? '#10B981' : parseInt(v.coverage) >= parseInt(v.target) - 5 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                  <span style={{ fontWeight: 600, width: 40, textAlign: 'right', color: parseInt(v.coverage) >= parseInt(v.target) ? '#10B981' : '#EF4444' }}>{v.coverage}</span>
                </div>
                <span style={{ color: v.stock < 120 ? '#EF4444' : 'var(--text-primary)' }}>{v.stock}</span>
                <span style={{ color: 'var(--text-muted)' }}>{v.due}</span>
                <span style={{ color: v.adverse > 0 ? '#EF4444' : '#10B981' }}>{v.adverse}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
