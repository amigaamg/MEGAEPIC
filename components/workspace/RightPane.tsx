'use client'

import type { PaneProps } from '@/lib/amexan/workspace'
import { Bot, Calculator, BookOpen, MessageSquare } from 'lucide-react'

export default function RightPane({ session }: PaneProps) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--surface-border)' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Context</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, padding: '0 4px' }}>
            <Bot size={12} style={{ display: 'inline', marginRight: 4 }} /> AI Assistant
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: 'var(--sky-50)', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 500 }}>How can I help?</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Ask about protocols, drug doses, or clinical guidelines
            </p>
            <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['Malaria protocol', 'HTN guidelines', 'Pediatric doses'].map((s, i) => (
                <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'white', color: 'var(--primary)', border: '1px solid var(--sky-200)', cursor: 'pointer' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, padding: '0 4px' }}>
            <Calculator size={12} style={{ display: 'inline', marginRight: 4 }} /> Clinical Calculators
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'GCS Score', desc: 'Glasgow Coma Scale' },
              { label: 'MEWS', desc: 'Early Warning Score' },
              { label: 'Creatinine Clearance', desc: 'Cockcroft-Gault' },
            ].map((c, i) => (
              <button key={i} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>{c.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, padding: '0 4px' }}>
            <BookOpen size={12} style={{ display: 'inline', marginRight: 4 }} /> Quick References
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'Emergency Protocols', subtitle: 'ACLS, ATLS, PALS' },
              { label: 'Drug Formulary', subtitle: 'AMEXAN Essential Medicines' },
              { label: 'Lab Reference Ranges', subtitle: 'Normal values by age' },
            ].map((r, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--surface-elevated)', fontSize: 12 }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>{r.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.subtitle}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
