'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Pill, Search, Filter, FileText, Clock, AlertTriangle, Printer, ChevronRight } from 'lucide-react'

const rx = [
  { id: 'RX-2026-07842', patient: 'John Mwangi', age: 68, drug: 'Amlodipine 5mg', dose: 'OD', prescriber: 'Dr. Kamau', date: '12 Jul 2026', status: 'active', refills: 2 },
  { id: 'RX-2026-07841', patient: 'Grace Wanjiku', age: 45, drug: 'Metformin 500mg', dose: 'BD', prescriber: 'Dr. Ochieng', date: '11 Jul 2026', status: 'active', refills: 0 },
  { id: 'RX-2026-07840', patient: 'Samuel Ochieng', age: 32, drug: 'Amoxicillin 500mg', dose: 'TDS', prescriber: 'Dr. Kamau', date: '10 Jul 2026', status: 'completed', refills: 0 },
  { id: 'RX-2026-07839', patient: 'Nancy Wambui', age: 55, drug: 'Atorvastatin 20mg', dose: 'OD', prescriber: 'Dr. Mwangi', date: '09 Jul 2026', status: 'active', refills: 3 },
  { id: 'RX-2026-07838', patient: 'Peter Kiprop', age: 28, drug: 'Salbutamol Inhaler', dose: 'PRN', prescriber: 'Dr. Ochieng', date: '08 Jul 2026', status: 'active', refills: 1 },
  { id: 'RX-2026-07837', patient: 'Faith Chebet', age: 62, drug: 'Losartan 50mg', dose: 'OD', prescriber: 'Dr. Kamau', date: '07 Jul 2026', status: 'expired', refills: 0 },
  { id: 'RX-2026-07836', patient: 'Joseph Maina', age: 70, drug: 'Metformin 500mg', dose: 'BD', prescriber: 'Dr. Mwangi', date: '06 Jul 2026', status: 'active', refills: 5 },
  { id: 'RX-2026-07835', patient: 'Esther Wanjiku', age: 38, drug: 'Cetirizine 10mg', dose: 'OD', prescriber: 'Dr. Ochieng', date: '05 Jul 2026', status: 'completed', refills: 0 },
]

export default function PrescriptionsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = rx.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search && !r.patient.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Pill size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Prescriptions</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Printer size={14} /> Export</button>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{rx.filter(r => r.status === 'active').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Active Prescriptions</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.sky }}>{rx.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Total This Month</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>12</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Pending Refills</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#8B5CF6' }}>7</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Interactions Flagged</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prescriptions..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
          {['all', 'active', 'completed', 'expired'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: filter === f ? C.sky : 'var(--surface)', color: filter === f ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: filter === f ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 40px 120px 80px 60px 30px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>ID</span><span>Patient</span><span>Medication</span><span>Dose</span><span>Prescriber</span><span>Date</span><span>Status</span><span></span></div>
            {filtered.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 40px 120px 80px 60px 30px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{r.id}</span>
                <span style={{ fontWeight: 600 }}>{r.patient}</span>
                <span>{r.drug}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.dose}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{r.prescriber}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.date}</span>
                <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, textAlign: 'center', background: r.status === 'active' ? '#10B98115' : r.status === 'completed' ? C.sky + '15' : '#EF444415', color: r.status === 'active' ? '#10B981' : r.status === 'completed' ? C.sky : '#EF4444', textTransform: 'capitalize' }}>{r.status}</span>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
