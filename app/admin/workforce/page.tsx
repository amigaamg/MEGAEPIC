'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Users, Search, Plus, Briefcase, Clock, Calendar, ChevronRight } from 'lucide-react'

export default function WorkforcePage() {
  const [search, setSearch] = useState('')
  const workers = [
    { name: 'Dr. Grace Kamau', role: 'Consultant Cardiologist', dept: 'Cardiology', status: 'active', shifts: 'M-F 8-5' },
    { name: 'Dr. John Mwangi', role: 'Medical Officer', dept: 'Emergency', status: 'active', shifts: 'Rotating' },
    { name: 'Nurse Ann Wanjiku', role: 'Senior Nurse', dept: 'ICU', status: 'active', shifts: 'Night' },
    { name: 'Dr. Peter Ochieng', role: 'Registrar Surgery', dept: 'Surgery', status: 'active', shifts: 'M-F 8-5' },
    { name: 'Pharm. David Kiprop', role: 'Clinical Pharmacist', dept: 'Pharmacy', status: 'active', shifts: 'M-F 8-5' },
    { name: 'Lab Tech. Nancy Wambui', role: 'Senior Technologist', dept: 'Laboratory', status: 'active', shifts: 'Rotating' },
    { name: 'Dr. Samuel Kioko', role: 'Consultant Pediatrician', dept: 'Pediatrics', status: 'active', shifts: 'On Call' },
    { name: 'Nurse Faith Chebet', role: 'Nurse', dept: 'Maternity', status: 'active', shifts: 'Afternoon' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Briefcase size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Workforce Management</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}><Clock size={14} /> Clock In/Out</button>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workforce..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>
          <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Roster</button>
          <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Staff</button>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 120px 100px 60px', gap: 6, padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Name</span><span>Role</span><span>Department</span><span>Shift Pattern</span><span>Status</span>
          </div>
          {workers.filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase())).map((w, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 120px 100px 60px', gap: 6, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{w.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{w.role}</span>
              <span style={{ color: 'var(--text-muted)' }}>{w.dept}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{w.shifts}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
