'use client'

import { useState } from 'react'

interface RoleOption {
  id: string
  label: string
  icon: string
}

interface Props {
  currentRole: string
  roles: RoleOption[]
  onSwitch: (roleId: string) => void
}

export default function RoleSwitcher({ currentRole, roles, onSwitch }: Props) {
  const [open, setOpen] = useState(false)
  const current = roles.find(r => r.id === currentRole)

  if (roles.length <= 1) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>{current?.icon}</span>
        <span>{current?.label || currentRole}</span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 6,
          border: '1px solid var(--surface-border)',
          background: 'var(--surface-card)',
          cursor: 'pointer', color: 'var(--text-primary)',
          fontSize: 12, fontFamily: 'var(--font-sans)',
          minHeight: 32,
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{current?.icon}</span>
        <span style={{ fontWeight: 500 }}>{current?.label || currentRole}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
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
              minWidth: 180, background: 'var(--surface-card)',
              border: '1px solid var(--surface-border)',
              borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '6px 10px', fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Switch Role
            </div>
            {roles.map(r => (
              <button
                key={r.id}
                role="option"
                aria-selected={r.id === currentRole}
                onClick={() => { onSwitch(r.id); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 10px',
                  border: 'none', background: r.id === currentRole ? 'var(--primary-light)' : 'transparent',
                  color: 'var(--text-primary)', cursor: 'pointer',
                  fontSize: 12, textAlign: 'left', fontFamily: 'var(--font-sans)',
                }}
              >
                <span>{r.icon}</span>
                <span style={{ flex: 1, fontWeight: r.id === currentRole ? 600 : 400 }}>{r.label}</span>
                {r.id === currentRole && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
