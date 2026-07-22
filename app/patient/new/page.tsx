'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { UserPlus, Search, Check, Calendar, FileText, Activity, ClipboardList } from 'lucide-react'

export default function NewPatientPage() {
  const [step, setStep] = useState(1)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <UserPlus size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>New Patient Encounter</span>
      </div>
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', textAlign: 'center' }}>
          <FileText size={48} color={C.sky} style={{ marginBottom: 12 }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Start New Encounter</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 20px' }}>Search for an existing patient or register a new one.</p>
          <div style={{ position: 'relative', maxWidth: 400, margin: '0 auto 20px' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }} />
            <input style={{ width: '100%', height: 44, padding: '0 14px 0 42px', borderRadius: 10, border: '2px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} placeholder="Search by name, AMX ID, or phone..." />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Select Patient</button>
            <button style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Register New</button>
          </div>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 11, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Quick Select:</strong> Recent patients will appear here
          </div>
        </div>
      </div>
    </div>
  )
}
