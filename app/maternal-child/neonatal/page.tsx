'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Baby, Activity, AlertTriangle, Thermometer, ArrowLeft } from 'lucide-react'
import { MCStat } from '@/components/ui/MCStat'
import { useRouter } from 'next/navigation'

export default function NeonatalIC() {
  const router = useRouter()
  const [tab, setTab] = useState('nicu')
  const neonates = [
    { name: 'Baby Mwangi', dob: '10 Jul', ga: '34w', weight: '2.1kg', diagnosis: 'Prematurity, RDS', vent: 'CPAP', feeding: 'NG tube', jaundice: 'Phototherapy', infection: 'Rule out sepsis' },
    { name: 'Baby Kamau', dob: '11 Jul', ga: '38w', weight: '3.2kg', diagnosis: 'Neonatal jaundice', vent: 'Room air', feeding: 'Breastfeeding', jaundice: 'Phototherapy', infection: 'Negative' },
    { name: 'Baby Ochieng', dob: '09 Jul', ga: '28w', weight: '1.1kg', diagnosis: 'Extreme prematurity', vent: 'Ventilator', feeding: 'TPN', jaundice: 'Double phototherapy', infection: 'Proven sepsis' },
    { name: 'Baby Chebet', dob: '12 Jul', ga: '36w', weight: '2.6kg', diagnosis: 'Hypoglycemia', vent: 'Room air', feeding: 'IV dextrose', jaundice: 'No', infection: 'Negative' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Baby size={18} color="#F97316" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Neonatal IC</span>
        <div style={{ flex: 1 }} />
        <span style={{ padding: '4px 10px', borderRadius: 6, background: '#EF444415', color: '#EF4444', fontSize: 11, fontWeight: 600 }}><AlertTriangle size={12} /> NICU Full (5/5)</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['nicu', 'kangaroo', 'feeding', 'discharge_readiness'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#F97316' : 'transparent'}`, background: 'transparent', color: tab === t ? '#F97316' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>{t.replace('_', ' ')}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="NICU Census" value="5" color="#EF4444" /><MCStat label="KMC Unit" value="4" color="#F97316" />
          <MCStat label="Avg Weight" value="2.1kg" color={C.sky} /><MCStat label="Discharges/Week" value="6" color="#10B981" />
          <MCStat label="Mortality (30d)" value="3.2%" color="#6B7280" />
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>NICU Roster</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 50px 60px 80px 100px 80px 80px 80px', gap: 4, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Name</span><span>GA</span><span>Weight</span><span>Diagnosis</span><span>Ventilation</span><span>Feeding</span><span>Jaundice</span><span>Sepsis</span></div>
            {neonates.map((n, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 50px 60px 80px 100px 80px 80px 80px', gap: 4, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{n.name}</span>
                <span>{n.ga}</span>
                <span style={{ fontWeight: 600 }}>{n.weight}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{n.diagnosis}</span>
                <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9, background: n.vent === 'Ventilator' ? '#EF444415' : '#10B98115', color: n.vent === 'Ventilator' ? '#EF4444' : '#10B981', textAlign: 'center' }}>{n.vent}</span>
                <span style={{ color: 'var(--text-muted)' }}>{n.feeding}</span>
                <span style={{ color: n.jaundice === 'No' ? '#10B981' : '#F59E0B' }}>{n.jaundice}</span>
                <span style={{ color: n.infection.startsWith('Proven') ? '#EF4444' : '#10B981' }}>{n.infection}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
