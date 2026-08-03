'use client'
import { ENGINES } from '../config'

// Phase 4E — Clinical Intelligence.
// NOT AI. Clinical Intelligence. Explainable, evidence-linked, safety-first.
export default function IntelligenceSection() {
  return (
    <section className="hp-section" id="intelligence">
      <div className="hp-title-wrap">
        <div className="hp-tag">CLINICAL INTELLIGENCE</div>
        <h2 className="hp-h2">AI Assists. Doctors Decide.</h2>
        <p className="hp-sub" style={{ maxWidth: 600, margin: '0 auto' }}>This is not ChatGPT. It is clinical intelligence. Every recommendation traceable to source evidence.</p>
      </div>
      <div className="hp-grid-4" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {ENGINES.slice(0, 8).map((e) => (
          <div key={e.name} className="card" style={{ background: 'var(--surface-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ color: 'var(--sky-500)' }}>{e.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)' }}>{e.name}</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{e.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
