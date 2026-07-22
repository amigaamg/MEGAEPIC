'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Brain, Activity, Users, Search, ArrowLeft } from 'lucide-react'
import { MCStat } from '@/components/ui/MCStat'
import { useRouter } from 'next/navigation'

export default function ECDIC() {
  const router = useRouter()
  const [tab, setTab] = useState('milestones')
  const children = [
    { name: 'Kevin Mwangi', age: '4yr', motor: 'On track', fineMotor: 'On track', language: 'Delayed', social: 'On track', hearing: 'Pass', vision: 'Pass', school: 'Pre-school' },
    { name: 'Sarah Chebet', age: '2yr', motor: 'Delayed', fineMotor: 'On track', language: 'Delayed', social: 'On track', hearing: 'Refer', vision: 'Pass', school: 'Home' },
    { name: 'Baby Ochieng', age: '6mo', motor: 'On track', fineMotor: 'On track', language: 'On track', social: 'On track', hearing: 'Pass', vision: 'Pass', school: 'N/A' },
    { name: 'Grace Wanjiku', age: '1yr', motor: 'Delayed', fineMotor: 'Delayed', language: 'Delayed', social: 'Delayed', hearing: 'Pass', vision: 'Refer', school: 'N/A' },
    { name: 'Peter Kiprop', age: '3yr', motor: 'On track', fineMotor: 'On track', language: 'On track', social: 'On track', hearing: 'Pass', vision: 'Pass', school: 'Daycare' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Brain size={18} color="#8B5CF6" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Early Childhood Development</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['milestones', 'screening', 'referrals', 'school_readiness'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#8B5CF6' : 'transparent'}`, background: 'transparent', color: tab === t ? '#8B5CF6' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{t.replace('_', ' ')}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="Children Screened" value="186" color="#8B5CF6" /><MCStat label="Dev Delay Identified" value="24" color="#F59E0B" />
          <MCStat label="Autism Screen+" value="3" color="#EF4444" /><MCStat label="Early Intervention" value="18" color="#10B981" />
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Developmental Milestones Tracking</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 40px 70px 70px 70px 70px 50px 50px 70px', gap: 4, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Name</span><span>Age</span><span>Gross Motor</span><span>Fine Motor</span><span>Language</span><span>Social</span><span>Hearing</span><span>Vision</span><span>School</span></div>
            {children.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 40px 70px 70px 70px 70px 50px 50px 70px', gap: 4, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{c.name}</span><span style={{ color: 'var(--text-muted)' }}>{c.age}</span>
                <span style={{ color: c.motor === 'On track' ? '#10B981' : '#EF4444' }}>{c.motor}</span>
                <span style={{ color: c.fineMotor === 'On track' ? '#10B981' : '#EF4444' }}>{c.fineMotor}</span>
                <span style={{ color: c.language === 'On track' ? '#10B981' : '#EF4444', fontWeight: c.language === 'Delayed' ? 600 : 400 }}>{c.language}</span>
                <span style={{ color: c.social === 'On track' ? '#10B981' : '#EF4444' }}>{c.social}</span>
                <span style={{ color: c.hearing === 'Pass' ? '#10B981' : '#EF4444' }}>{c.hearing}</span>
                <span style={{ color: c.vision === 'Pass' ? '#10B981' : '#EF4444' }}>{c.vision}</span>
                <span style={{ color: 'var(--text-muted)' }}>{c.school}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
