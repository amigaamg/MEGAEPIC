'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Activity, Clock, AlertTriangle, Baby, ArrowLeft } from 'lucide-react'
import { MCStat } from '@/components/ui/MCStat'
import { useRouter } from 'next/navigation'

export default function LabourDeliveryIC() {
  const router = useRouter()
  const [tab, setTab] = useState('active')
  const labours = [
    { patient: 'Grace Mwangi', parity: 'P1G2', dilatation: '6cm', effacement: '80%', station: '-1', contractions: '3/10min', fhr: '145', risk: 'low', duration: '4h 20min' },
    { patient: 'Nancy Wambui', parity: 'P2G3', dilatation: '9cm', effacement: '100%', station: '+1', contractions: '4/10min', fhr: '135', risk: 'low', duration: '6h 10min' },
    { patient: 'Faith Chebet', parity: 'P0G1', dilatation: '4cm', effacement: '60%', station: '-2', contractions: '2/10min', fhr: '160', risk: 'moderate', duration: '8h 30min' },
    { patient: 'Ann Wanjiku', parity: 'P3G4', dilatation: '8cm', effacement: '90%', station: '0', contractions: '3/10min', fhr: '110', risk: 'high', duration: '2h 15min' },
  ]
  const emergencies = [
    { type: 'PPH Protocol', patient: 'Jane Wanjiku', status: 'active', responders: 'Dr. Kamau, Nurse Ann' },
    { type: 'Eclampsia', patient: 'Mary Muthoni', status: 'resolved', responders: 'Dr. Ochieng' },
    { type: 'Cord Prolapse', patient: '-', status: 'standby', responders: 'Theatre team' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Activity size={18} color="#F43F5E" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Labour & Delivery IC</span>
        <div style={{ flex: 1 }} />
        <span style={{ padding: '4px 10px', borderRadius: 6, background: '#EF444415', color: '#EF4444', fontSize: 11, fontWeight: 600 }}><AlertTriangle size={12} /> {emergencies.filter(e => e.status === 'active').length} Active Emergency</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['active', 'partograph', 'emergencies', 'history'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#F43F5E' : 'transparent'}`, background: 'transparent', color: tab === t ? '#F43F5E' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="Active Labour" value="4" color="#F43F5E" /><MCStat label="Delivered Today" value="8" color="#10B981" />
          <MCStat label="C-Section Rate" value="32%" color="#F59E0B" /><MCStat label="Avg Labour Duration" value="6.4h" color={C.sky} />
        </div>
        {tab === 'active' && <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Active Labour Patients</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 60px 60px 60px 60px 80px 60px 80px 60px', gap: 4, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Patient</span><span>P/G</span><span>Dil</span><span>Eff</span><span>Station</span><span>Contr</span><span>FHR</span><span>Duration</span><span>Risk</span></div>
            {labours.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 60px 60px 60px 60px 80px 60px 80px 60px', gap: 4, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{l.patient}</span><span style={{ color: 'var(--text-muted)' }}>{l.parity}</span>
                <span style={{ fontWeight: 700 }}>{l.dilatation}</span><span>{l.effacement}</span><span>{l.station}</span>
                <span>{l.contractions}</span><span style={{ fontWeight: 600, color: l.fhr === '110' ? '#EF4444' : l.fhr === '160' ? '#F59E0B' : '#10B981' }}>{l.fhr}</span>
                <span style={{ color: 'var(--text-muted)' }}>{l.duration}</span>
                <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9, background: l.risk === 'low' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: l.risk === 'low' ? '#10B981' : '#F59E0B', textAlign: 'center' }}>{l.risk}</span>
              </div>
            ))}
          </div>
        </div>}
        {tab === 'emergencies' && <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Emergency Protocols</h3>
          {emergencies.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.status === 'active' ? '#EF4444' : e.status === 'resolved' ? '#10B981' : '#F59E0B' }} />
              <span style={{ fontWeight: 600, width: 120 }}>{e.type}</span><span style={{ color: 'var(--text-secondary)' }}>{e.patient}</span>
              <span style={{ color: 'var(--text-muted)' }}>{e.responders}</span>
              <span style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: 4, fontSize: 10, background: e.status === 'active' ? 'rgba(239,68,68,0.1)' : e.status === 'resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: e.status === 'active' ? '#EF4444' : e.status === 'resolved' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{e.status}</span>
            </div>
          ))}
        </div>}
      </div>
    </div>
  )
}
