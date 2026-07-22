'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { FileText, Search, Filter, FlaskConical, Scan, AlertTriangle, CheckCircle, Clock, ChevronRight } from 'lucide-react'

const results = [
  { id: 'RES-07842', patient: 'John Mwangi', type: 'lab', test: 'CBC, CRP, Creatinine', ordered: 'Dr. Kamau', date: '12 Jul 2026', status: 'pending', priority: 'urgent' },
  { id: 'RES-07841', patient: 'Grace Wanjiku', type: 'lab', test: 'HbA1c, Lipid Profile', ordered: 'Dr. Ochieng', date: '12 Jul 2026', status: 'verified', priority: 'routine' },
  { id: 'RES-07840', patient: 'Samuel Ochieng', type: 'imaging', test: 'CT Head (Non-contrast)', ordered: 'Dr. Kamau', date: '12 Jul 2026', status: 'in_progress', priority: 'urgent' },
  { id: 'RES-07839', patient: 'Nancy Wambui', type: 'lab', test: 'U&E, LFT, Blood Glucose', ordered: 'Dr. Mwangi', date: '11 Jul 2026', status: 'verified', priority: 'routine' },
  { id: 'RES-07838', patient: 'Peter Kiprop', type: 'imaging', test: 'Chest X-ray PA', ordered: 'Dr. Ochieng', date: '11 Jul 2026', status: 'verified', priority: 'routine' },
  { id: 'RES-07837', patient: 'Faith Chebet', type: 'lab', test: 'Blood Culture, Malaria RDT', ordered: 'Dr. Kamau', date: '10 Jul 2026', status: 'critical', priority: 'urgent' },
  { id: 'RES-07836', patient: 'Joseph Maina', type: 'imaging', test: 'MRI Lumbar Spine', ordered: 'Dr. Mwangi', date: '10 Jul 2026', status: 'pending', priority: 'routine' },
]

export default function ResultsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = results.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search && !r.patient.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <FileText size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Results</span>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{results.filter(r => r.status === 'pending').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Pending</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.sky }}>{results.filter(r => r.status === 'in_progress').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>In Progress</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{results.filter(r => r.status === 'verified').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Verified</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>{results.filter(r => r.status === 'critical').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Critical</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search results..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
          {['all', 'lab', 'imaging'].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: typeFilter === f ? C.sky : 'var(--surface)', color: typeFilter === f ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: typeFilter === f ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 4 }}>{f === 'lab' ? <FlaskConical size={12} /> : f === 'imaging' ? <Scan size={12} /> : null} {f}</button>
          ))}
          {['all', 'pending', 'in_progress', 'verified', 'critical'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: statusFilter === f ? C.sky : 'var(--surface)', color: statusFilter === f ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: statusFilter === f ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{f.replace('_', ' ')}</button>
          ))}
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 60px 1fr 100px 80px 30px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>ID</span><span>Patient</span><span>Type</span><span>Test</span><span>Ordered By</span><span>Status</span><span></span></div>
            {filtered.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 120px 60px 1fr 100px 80px 30px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{r.id}</span>
                <span style={{ fontWeight: 600 }}>{r.patient}</span>
                <span style={{ color: r.type === 'lab' ? '#8B5CF6' : '#6366F1', display: 'flex', alignItems: 'center', gap: 4 }}>{r.type === 'lab' ? <FlaskConical size={10} /> : <Scan size={10} />} {r.type}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{r.test}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.ordered}</span>
                <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, textAlign: 'center', background: r.status === 'verified' ? '#10B98115' : r.status === 'pending' ? '#F59E0B15' : r.status === 'critical' ? '#EF444415' : C.sky + '15', color: r.status === 'verified' ? '#10B981' : r.status === 'pending' ? '#F59E0B' : r.status === 'critical' ? '#EF4444' : C.sky, textTransform: 'capitalize' }}>{r.status.replace('_', ' ')}</span>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
