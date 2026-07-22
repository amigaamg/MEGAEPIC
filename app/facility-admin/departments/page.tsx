'use client'

import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import { ArrowLeft, Users, Search, Plus } from 'lucide-react'
import { useState } from 'react'

export default function DepartmentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const depts = [
    { name: 'Emergency Medicine', head: 'Dr. John Mwangi', workers: 24, type: 'Medical' },
    { name: 'Internal Medicine', head: 'Dr. Grace Kamau', workers: 18, type: 'Medical' },
    { name: 'Cardiology', head: 'Dr. Peter Ochieng', workers: 14, type: 'Medical' },
    { name: 'Pediatrics', head: 'Dr. Ann Wanjiku', workers: 20, type: 'Medical' },
    { name: 'OB/GYN', head: 'Dr. Nancy Wambui', workers: 16, type: 'Medical' },
    { name: 'Surgery', head: 'Dr. Samuel Kioko', workers: 22, type: 'Surgical' },
    { name: 'Orthopedics', head: 'Dr. David Kiprop', workers: 10, type: 'Surgical' },
    { name: 'Radiology', head: 'Dr. Faith Chebet', workers: 8, type: 'Diagnostic' },
    { name: 'Laboratory', head: 'Mr. Joseph Maina', workers: 12, type: 'Diagnostic' },
    { name: 'Pharmacy', head: 'Pharm. James Mutua', workers: 6, type: 'Support' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.back()} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><ArrowLeft size={16} /></button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Departments</h1>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)' }} />
        </div>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Department</button>
      </div>
      <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
        {depts.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase())).map((d, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 80px 60px', gap: 8, padding: '10px 12px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>{d.name}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{d.head}</span>
            <span style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{d.workers} workers</span>
            <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: `${C.sky}15`, color: C.sky, textAlign: 'center' }}>{d.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
