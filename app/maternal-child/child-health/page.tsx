'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Baby, Shield, Activity, Search, ArrowLeft } from 'lucide-react'
import { MCStat } from '@/components/ui/MCStat'
import { useRouter } from 'next/navigation'

export default function ChildHealthIC() {
  const router = useRouter()
  const [tab, setTab] = useState('growth')
  const children = [
    { name: 'Kevin Mwangi', dob: '15 Mar 2022', age: '4yr 4mo', weight: '16kg', height: '102cm', muac: '15.5cm', nutrition: 'Normal', dev: 'On track', immunizations: 'Up to date' },
    { name: 'Sarah Chebet', dob: '22 Aug 2023', age: '2yr 11mo', weight: '12kg', height: '88cm', muac: '13.0cm', nutrition: 'MAM', dev: 'Delayed speech', immunizations: 'Missing 1 dose' },
    { name: 'Baby Ochieng', dob: '10 Jan 2026', age: '6mo', weight: '7.2kg', height: '65cm', muac: '14.0cm', nutrition: 'Normal', dev: 'On track', immunizations: 'Up to date' },
    { name: 'Peter Kiprop', dob: '05 Nov 2020', age: '5yr 8mo', weight: '18kg', height: '110cm', muac: '16.0cm', nutrition: 'Overweight', dev: 'On track', immunizations: 'Up to date' },
    { name: 'Grace Wanjiku', dob: '18 Jun 2024', age: '2yr 1mo', weight: '10kg', height: '82cm', muac: '12.0cm', nutrition: 'SAM', dev: 'Delayed motor', immunizations: 'Missing 2 doses' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Shield size={18} color="#10B981" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Child Health IC</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['growth', 'nutrition', 'development', 'immunization', 'school'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#10B981' : 'transparent'}`, background: 'transparent', color: tab === t ? '#10B981' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="Total Children" value="342" color="#10B981" /><MCStat label="SAM" value="8" color="#EF4444" />
          <MCStat label="MAM" value="24" color="#F59E0B" /><MCStat label="Dev Delay" value="12" color={C.sky} />
          <MCStat label="Immunization <80%" value="3" color="#EF4444" />
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Growth & Nutrition Tracking</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 60px 50px 50px 50px 70px 80px 80px', gap: 4, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Name</span><span>Age</span><span>Wt</span><span>Ht</span><span>MUAC</span><span>Nutrition</span><span>Dev</span><span>Immunization</span></div>
            {children.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 60px 50px 50px 50px 70px 80px 80px', gap: 4, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{c.name}</span><span style={{ color: 'var(--text-muted)' }}>{c.age}</span>
                <span>{c.weight}</span><span>{c.height}</span><span style={{ fontWeight: 600, color: parseFloat(c.muac) < 12.5 ? '#EF4444' : parseFloat(c.muac) < 13.5 ? '#F59E0B' : '#10B981' }}>{c.muac}</span>
                <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9, background: c.nutrition === 'SAM' ? '#EF444415' : c.nutrition === 'MAM' ? '#F59E0B15' : '#10B98115', color: c.nutrition === 'SAM' ? '#EF4444' : c.nutrition === 'MAM' ? '#F59E0B' : '#10B981', textAlign: 'center' }}>{c.nutrition}</span>
                <span style={{ color: c.dev === 'On track' ? '#10B981' : '#F59E0B' }}>{c.dev}</span>
                <span style={{ color: c.immunizations === 'Up to date' ? '#10B981' : '#EF4444' }}>{c.immunizations}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
