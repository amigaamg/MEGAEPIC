'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { BarChart3, FileText, Download, Printer, Calendar, Filter, ChevronRight } from 'lucide-react'

const reports = [
  { id: 'RPT-001', name: 'Monthly Clinical Summary', type: 'Clinical', period: 'June 2026', generated: '01 Jul 2026', status: 'ready', pages: 24 },
  { id: 'RPT-002', name: 'OPD Attendance Report', type: 'Operations', period: 'Q2 2026', generated: '30 Jun 2026', status: 'ready', pages: 12 },
  { id: 'RPT-003', name: 'Pharmacy Consumption', type: 'Pharmacy', period: 'June 2026', generated: '28 Jun 2026', status: 'ready', pages: 18 },
  { id: 'RPT-004', name: 'Laboratory Performance', type: 'Lab', period: 'June 2026', generated: '27 Jun 2026', status: 'ready', pages: 15 },
  { id: 'RPT-005', name: 'Radiology Utilization', type: 'Radiology', period: 'June 2026', generated: '27 Jun 2026', status: 'ready', pages: 10 },
  { id: 'RPT-006', name: 'Maternal Mortality Audit', type: 'Clinical', period: 'Q2 2026', generated: '25 Jun 2026', status: 'pending', pages: 0 },
  { id: 'RPT-007', name: 'Infection Control Report', type: 'Quality', period: 'June 2026', generated: '24 Jun 2026', status: 'ready', pages: 8 },
  { id: 'RPT-008', name: 'Revenue & Billing Summary', type: 'Finance', period: 'June 2026', generated: '23 Jun 2026', status: 'ready', pages: 20 },
]

export default function ReportsPage() {
  const [typeFilter, setTypeFilter] = useState('all')

  const types = [...new Set(reports.map(r => r.type))]
  const filtered = reports.filter(r => typeFilter === 'all' || r.type === typeFilter)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <BarChart3 size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Reports</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> Generate Report</button>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setTypeFilter('all')} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: typeFilter === 'all' ? C.sky : 'var(--surface)', color: typeFilter === 'all' ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: typeFilter === 'all' ? 600 : 400, cursor: 'pointer' }}>All</button>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: typeFilter === t ? C.sky : 'var(--surface)', color: typeFilter === t ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: typeFilter === t ? 600 : 400, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 100px 80px 60px 80px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              <span>ID</span><span>Name</span><span>Type</span><span>Period</span><span>Generated</span><span>Status</span><span></span></div>
            {filtered.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 100px 80px 60px 80px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{r.id}</span>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.type}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{r.period}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.generated}</span>
                <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, textAlign: 'center', background: r.status === 'ready' ? '#10B98115' : '#F59E0B15', color: r.status === 'ready' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{r.status}</span>
                <button style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}><Download size={10} /> PDF</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
