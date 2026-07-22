'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Scan, Search, Filter, Clock, CheckCircle, AlertCircle, ChevronRight, Eye } from 'lucide-react'

const images = [
  { id: 'IMG-07842', patient: 'John Mwangi', study: 'CT Head (Non-contrast)', ordered: 'Dr. Kamau', date: '12 Jul 2026', status: 'pending', modality: 'CT' },
  { id: 'IMG-07841', patient: 'Grace Wanjiku', study: 'Chest X-ray PA', ordered: 'Dr. Ochieng', date: '12 Jul 2026', status: 'reported', modality: 'XR' },
  { id: 'IMG-07840', patient: 'Samuel Ochieng', study: 'Abdominal Ultrasound', ordered: 'Dr. Kamau', date: '11 Jul 2026', status: 'reported', modality: 'US' },
  { id: 'IMG-07839', patient: 'Nancy Wambui', study: 'MRI Lumbar Spine', ordered: 'Dr. Mwangi', date: '11 Jul 2026', status: 'in_progress', modality: 'MRI' },
  { id: 'IMG-07838', patient: 'Peter Kiprop', study: 'CT KUB', ordered: 'Dr. Ochieng', date: '10 Jul 2026', status: 'completed', modality: 'CT' },
]

export default function ImagingPage() {
  const [search, setSearch] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Scan size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Radiology</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Scan size={14} /> New Order</button>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{images.filter(i => i.status === 'pending').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Pending</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.sky }}>{images.filter(i => i.status === 'in_progress').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>In Progress</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{images.filter(i => i.status === 'reported' || i.status === 'completed').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Completed</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>1</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Critical Findings</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search imaging..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 100px 80px 80px 60px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>ID</span><span>Patient</span><span>Study</span><span>Ordered By</span><span>Date</span><span>Status</span><span></span></div>
            {images.filter(i => !search || i.patient.toLowerCase().includes(search.toLowerCase())).map((i, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 100px 80px 80px 60px', gap: 6, padding: '7px 8px', borderRadius: 6, background: idx % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{i.id}</span>
                <span style={{ fontWeight: 600 }}>{i.patient}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{i.study}</span>
                <span style={{ color: 'var(--text-muted)' }}>{i.ordered}</span>
                <span style={{ color: 'var(--text-muted)' }}>{i.date}</span>
                <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, textAlign: 'center', background: i.status === 'reported' || i.status === 'completed' ? '#10B98115' : i.status === 'in_progress' ? C.sky + '15' : '#F59E0B15', color: i.status === 'reported' || i.status === 'completed' ? '#10B981' : i.status === 'in_progress' ? C.sky : '#F59E0B', textTransform: 'capitalize' }}>{i.status.replace('_', ' ')}</span>
                <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={10} /> View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
