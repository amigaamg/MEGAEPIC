'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Shield, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function CredentialsPage() {
  const [search, setSearch] = useState('')
  const credentials = [
    { worker: 'Dr. Grace Kamau', license: 'KMPDC-2024-001', type: 'Medical License', issuer: 'KMPDC', expiry: '31 Dec 2027', status: 'valid' },
    { worker: 'Dr. John Mwangi', license: 'KMPDC-2024-002', type: 'Medical License', issuer: 'KMPDC', expiry: '31 Dec 2026', status: 'valid' },
    { worker: 'Nurse Ann Wanjiku', license: 'NCK-2023-045', type: 'Nursing License', issuer: 'NCK', expiry: '30 Jun 2026', status: 'valid' },
    { worker: 'Dr. Peter Ochieng', license: 'KMPDC-2023-015', type: 'Specialist (Surgery)', issuer: 'KMPDC', expiry: '15 Mar 2026', status: 'expiring' },
    { worker: 'Pharm. David Kiprop', license: 'PPB-2022-008', type: 'Pharmacy License', issuer: 'PPB', expiry: '01 Jan 2026', status: 'expired' },
    { worker: 'Lab Tech. Nancy Wambui', license: 'MLT-2023-012', type: 'Lab Technology', issuer: 'MLT Board', expiry: '31 Aug 2026', status: 'valid' },
    { worker: 'Dr. Samuel Kioko', license: 'KMPDC-2024-003', type: 'Medical License', issuer: 'KMPDC', expiry: '31 Dec 2026', status: 'valid' },
    { worker: 'Nurse Faith Chebet', license: 'NCK-2024-022', type: 'Nursing License', issuer: 'NCK', expiry: '15 Feb 2025', status: 'expired' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Shield size={18} color={C.sky} />
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Credential Tracking</h1>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <CredStat label="Valid" value={credentials.filter(c => c.status === 'valid').length.toString()} color="#10B981" icon={<CheckCircle size={14} />} />
        <CredStat label="Expiring Soon" value={credentials.filter(c => c.status === 'expiring').length.toString()} color="#F59E0B" icon={<AlertTriangle size={14} />} />
        <CredStat label="Expired" value={credentials.filter(c => c.status === 'expired').length.toString()} color="#EF4444" icon={<XCircle size={14} />} />
      </div>
      <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 80px 60px', gap: 6, padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Worker</span><span>License / ID</span><span>Issuing Body</span><span>Expiry</span><span>Status</span>
        </div>
        {credentials.filter(c => !search || c.worker.toLowerCase().includes(search.toLowerCase())).map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 80px 60px', gap: 6, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
            <span style={{ fontWeight: 600 }}>{c.worker}</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 10 }}>{c.license}</span>
            <span style={{ color: 'var(--text-muted)' }}>{c.issuer}</span>
            <span style={{ color: c.status === 'expired' ? '#EF4444' : c.status === 'expiring' ? '#F59E0B' : 'var(--text-muted)', fontWeight: c.status !== 'valid' ? 600 : 400 }}>{c.expiry}</span>
            <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: c.status === 'valid' ? 'rgba(16,185,129,0.1)' : c.status === 'expiring' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: c.status === 'valid' ? '#10B981' : c.status === 'expiring' ? '#F59E0B' : '#EF4444', textAlign: 'center', textTransform: 'capitalize' }}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CredStat({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ color }}>{icon}</span>
    <div><div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div></div>
  </div>
}
