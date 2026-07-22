'use client'

import type { PaneProps } from '@/lib/amexan/workspace'
import { useState } from 'react'

export default function CenterPane({ session, onNavigate }: PaneProps) {
  const [view, setView] = useState('overview')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        {['overview', 'details', 'timeline', 'orders'].map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{
              padding: '4px 12px', borderRadius: 6, border: 'none',
              background: view === v ? 'var(--sky-50)' : 'transparent',
              color: view === v ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: view === v ? 600 : 400, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {view === 'overview' && (
          <div>
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No patient selected</p>
              <p style={{ fontSize: 12, margin: 0 }}>Select a patient from the work queue or search</p>
              <button onClick={() => onNavigate('/workflow/queue')}
                style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                View Queue
              </button>
            </div>
          </div>
        )}

        {view === 'details' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 13 }}>Select a patient to see details</p>
          </div>
        )}

        {view === 'timeline' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 13 }}>Patient timeline will appear here</p>
          </div>
        )}

        {view === 'orders' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 13 }}>Orders and results will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
