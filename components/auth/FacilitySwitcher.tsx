'use client'

import { useState } from 'react'

export interface FacilityInfo {
  id: string
  name: string
  department: string
  role: string
}

interface Props {
  currentFacility: FacilityInfo
  facilities: FacilityInfo[]
  onSwitch: (facilityId: string) => void
}

export default function FacilitySwitcher({ currentFacility, facilities, onSwitch }: Props) {
  const [open, setOpen] = useState(false)

  if (facilities.length <= 1) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>{currentFacility.name}</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span>{currentFacility.department}</span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 8,
          border: '1px solid var(--surface-border)',
          background: 'var(--surface-card)',
          cursor: 'pointer', color: 'var(--text-primary)',
          fontSize: 12, fontFamily: 'var(--font-sans)',
          minHeight: 36,
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span style={{ fontWeight: 500 }}>{currentFacility.name}</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{ color: 'var(--text-muted)' }}>{currentFacility.department}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div
            role="listbox"
            style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              minWidth: 280, background: 'var(--surface-card)',
              border: '1px solid var(--surface-border)',
              borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Switch Facility
            </div>
            {facilities.map(f => (
              <button
                key={f.id}
                role="option"
                aria-selected={f.id === currentFacility.id}
                onClick={() => { onSwitch(f.id); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 12px',
                  border: 'none', background: f.id === currentFacility.id ? 'var(--primary-light)' : 'transparent',
                  color: 'var(--text-primary)', cursor: 'pointer',
                  fontSize: 12, textAlign: 'left', fontFamily: 'var(--font-sans)',
                  borderBottom: '1px solid var(--surface-border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.department} · {f.role}</div>
                </div>
                {f.id === currentFacility.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
