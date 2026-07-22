'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { User, Search, Users, Filter, ChevronRight, Plus } from 'lucide-react'

const staff = [
  { name: 'Dr. James Kamau', role: 'Consultant Surgeon', dept: 'General Surgery', license: 'KMPDC 5678', status: 'active', lastActive: 'Today' },
  { name: 'Dr. Grace Ochieng', role: 'Medical Officer', dept: 'Internal Medicine', license: 'KMPDC 7890', status: 'active', lastActive: 'Today' },
  { name: 'Nancy Wambui', role: 'Registered Nurse', dept: 'Surgical Ward', license: 'NCK 1234', status: 'active', lastActive: 'Yesterday' },
  { name: 'Samuel Kioko', role: 'Lab Technologist', dept: 'Laboratory', license: 'KMLTTB 456', status: 'active', lastActive: 'Today' },
  { name: 'Faith Chebet', role: 'Pharmacist', dept: 'Pharmacy', license: 'PPB 789', status: 'on_leave', lastActive: '3 days ago' },
  { name: 'Peter Kiprop', role: 'Radiographer', dept: 'Radiology', license: 'KMPDC 901', status: 'active', lastActive: 'Today' },
  { name: 'Esther Wanjiku', role: 'Medical Officer', dept: 'Paediatrics', license: 'KMPDC 234', status: 'active', lastActive: 'Yesterday' },
  { name: 'Joseph Maina', role: 'Clinical Officer', dept: 'OPD', license: 'KMPDC 567', status: 'inactive', lastActive: '1 week ago' },
]

export default function StaffManagementPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')

  const depts = [...new Set(staff.map(s => s.dept))]
  const filtered = staff.filter(s => {
    if (deptFilter !== 'all' && s.dept !== deptFilter) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.license.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Users size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Staff Management</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Staff</button>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.sky }}>{staff.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Total Staff</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{staff.filter(s => s.status === 'active').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Active</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{staff.filter(s => s.status === 'on_leave').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>On Leave</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#8B5CF6' }}>{[...new Set(staff.map(s => s.dept))].length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Departments</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
            <option value="all">All Departments</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 80px 80px 30px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>Name</span><span>Role</span><span>Department</span><span>License</span><span>Status</span><span></span></div>
            {filtered.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 80px 80px 30px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s.role}</span>
                <span style={{ color: 'var(--text-muted)' }}>{s.dept}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.license}</span>
                <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, textAlign: 'center', background: s.status === 'active' ? '#10B98115' : s.status === 'on_leave' ? '#F59E0B15' : '#EF444415', color: s.status === 'active' ? '#10B981' : s.status === 'on_leave' ? '#F59E0B' : '#EF4444', textTransform: 'capitalize' }}>{s.status.replace('_', ' ')}</span>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
