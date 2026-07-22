'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Link, Baby, Users, Heart, ArrowLeft, Search } from 'lucide-react'
import { MCStat } from '@/components/ui/MCStat'
import { useRouter } from 'next/navigation'

export default function MotherBabyIC() {
  const router = useRouter()
  const [tab, setTab] = useState('linked')
  const records = [
    { mother: 'Grace Mwangi', baby: 'Baby Mwangi', dob: '10 Jul 2026', delivery: 'SVD', complications: 'None', feeding: 'Exclusive BF', immunization: 'BCG + OPV0', nextVisit: '6w check' },
    { mother: 'Nancy Wambui', baby: 'Baby Wambui', dob: '10 Jul 2026', delivery: 'C-section', complications: 'Wound infection', feeding: 'Latching support', immunization: 'BCG + OPV0', nextVisit: '2w wound check' },
    { mother: 'Faith Chebet', baby: 'Baby Chebet', dob: '11 Jul 2026', delivery: 'SVD', complications: 'Postpartum hemorrhage', feeding: 'Exclusive BF', immunization: 'BCG + OPV0', nextVisit: '6w check' },
    { mother: 'Ann Wanjiku', baby: 'Baby Wanjiku', dob: '12 Jul 2026', delivery: 'Vacuum', complications: 'Shoulder dystocia', feeding: 'IV dextrose (baby)', immunization: 'Pending', nextVisit: '24h review' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Link size={18} color="#0EA5E9" /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><button onClick={() => router.back()} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}><ArrowLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Mother-Baby Linked Record</span>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {['linked', 'generational', 'outcomes'].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? '#0EA5E9' : 'transparent'}`, background: 'transparent', color: tab === t ? '#0EA5E9' : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>)}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <MCStat label="Linked Records" value="42" color="#0EA5E9" /><MCStat label="Mother Complications" value="3" color="#EF4444" />
          <MCStat label="Neonatal Complications" value="2" color="#F59E0B" /><MCStat label="6w F/U Due" value="18" color="#10B981" />
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Linked Mother-Baby Records</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 110px 70px 80px 80px 100px 80px', gap: 4, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Mother</span><span>Baby</span><span>Delivery</span><span>Maternal Comp</span><span>Feeding</span><span>Immunization</span><span>Next Visit</span></div>
            {records.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 110px 70px 80px 80px 100px 80px', gap: 4, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{r.mother}</span>
                <span style={{ fontWeight: 600 }}>{r.baby}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.delivery}</span>
                <span style={{ color: r.complications === 'None' ? '#10B981' : '#EF4444', fontWeight: r.complications !== 'None' ? 600 : 400 }}>{r.complications}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{r.feeding}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.immunization}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{r.nextVisit}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: `${C.sky}08`, border: `1px solid ${C.sky}20`, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: C.sky }}>Generational Health Link:</strong> Maternal complications during pregnancy are tracked forward to neonatal outcomes. Neonatal complications are logged back to maternal record. Every mother-baby pair creates a linked health record that persists across future pregnancies.
          </div>
        </div>
      </div>
    </div>
  )
}
