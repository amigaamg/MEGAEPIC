'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { FileText, Search, Plus, Filter, Clock, ChevronRight } from 'lucide-react'

const notes = [
  { id: 'NOTE-07842', patient: 'John Mwangi', type: 'Progress Note', author: 'Dr. Kamau', date: '12 Jul 2026', status: 'signed' },
  { id: 'NOTE-07841', patient: 'Grace Wanjiku', type: 'Discharge Summary', author: 'Dr. Ochieng', date: '12 Jul 2026', status: 'draft' },
  { id: 'NOTE-07840', patient: 'Samuel Ochieng', type: 'Admission Note', author: 'Dr. Kamau', date: '11 Jul 2026', status: 'signed' },
  { id: 'NOTE-07839', patient: 'Nancy Wambui', type: 'Procedure Note', author: 'Dr. Mwangi', date: '11 Jul 2026', status: 'signed' },
  { id: 'NOTE-07838', patient: 'Peter Kiprop', type: 'Consult Note', author: 'Dr. Ochieng', date: '10 Jul 2026', status: 'signed' },
  { id: 'NOTE-07837', patient: 'Faith Chebet', type: 'Progress Note', author: 'Dr. Kamau', date: '10 Jul 2026', status: 'draft' },
]

export default function NotesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = notes.filter(n => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    if (search && !n.patient.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <FileText size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Clinical Notes</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> New Note</button>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
          {['all', 'Progress Note', 'Admission Note', 'Discharge Summary', 'Procedure Note', 'Consult Note'].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: typeFilter === f ? C.sky : 'var(--surface)', color: typeFilter === f ? C.white : 'var(--text-secondary)', fontSize: 10, fontWeight: typeFilter === f ? 600 : 400, cursor: 'pointer' }}>{f === 'all' ? 'All' : f}</button>
          ))}
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 120px 120px 80px 30px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>ID</span><span>Patient</span><span>Type</span><span>Author</span><span>Date</span><span></span></div>
            {filtered.map((n, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 120px 120px 120px 80px 30px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{n.id}</span>
                <span style={{ fontWeight: 600 }}>{n.patient}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{n.type}</span>
                <span style={{ color: 'var(--text-muted)' }}>{n.author}</span>
                <span style={{ color: 'var(--text-muted)' }}>{n.date}</span>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
