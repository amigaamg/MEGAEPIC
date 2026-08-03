'use client'
import { UserCircle, Brain, BookOpen, Share2, Globe, Zap } from 'lucide-react'

const PHILOSOPHY = [
  { icon: <UserCircle size={24} />, title: 'One Patient', sub: 'Never fragment the story.', desc: 'Every patient has one lifelong record. No repetition. No gaps. Continuity across every setting.' },
  { icon: <Brain size={24} />, title: 'Evidence First', sub: 'Every recommendation explainable.', desc: 'Every clinical suggestion traceable to source evidence. Nothing hidden. Nothing assumed.' },
  { icon: <BookOpen size={24} />, title: 'Learning System', sub: 'Care teaches the system.', desc: 'Every encounter improves clinical intelligence. Education lives inside care—not separate from it.' },
  { icon: <Share2 size={24} />, title: 'Open Standards', sub: 'FHIR DICOM SNOMED LOINC ICD', desc: 'Open standards out of the box. No lock-in. Connected to the global health ecosystem.' },
  { icon: <Globe size={24} />, title: 'Built for the World', sub: 'Localized. Adaptable. Global.', desc: 'Localized protocols, formularies, languages—adaptable to every country. Universal by design.' },
  { icon: <Zap size={24} />, title: 'Never Frozen', sub: 'Medicine changes. AMEXAN evolves.', desc: 'Protocols, guidelines, and intelligence update continuously. Healthcare software that never stagnates.' },
]

// Phase 4 — Why AMEXAN. The philosophy.
export default function PhilosophySection() {
  return (
    <section className="hp-section" id="why">
      <div className="hp-title-wrap">
        <div className="hp-tag">WHY AMEXAN</div>
        <h2 className="hp-h2">Built Differently. On Purpose.</h2>
        <p className="hp-sub" style={{ maxWidth: 600, margin: '0 auto' }}>Not better software. A different philosophy. One patient. One record. One operating system. Unlimited applications.</p>
      </div>
      <div className="hp-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {PHILOSOPHY.map((p) => (
          <div key={p.title} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ color: 'var(--sky-500)', flexShrink: 0 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sky-800)' }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--sky-500)', fontWeight: 500 }}>{p.sub}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
