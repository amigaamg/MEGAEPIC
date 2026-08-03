'use client'
import { Star } from 'lucide-react'
import { TESTIMONIALS } from '../config'

// Phase 4J — Testimonials.
export default function TestimonialsSection() {
  return (
    <section className="hp-section" id="testimonials">
      <div className="hp-title-wrap">
        <div className="hp-tag">SUCCESS STORIES</div>
        <h2 className="hp-h2">Real Outcomes. Real Healthcare Teams.</h2>
        <p className="hp-sub" style={{ maxWidth: 600, margin: '0 auto' }}>Reduced documentation time. Fewer medication errors. Better follow-up. Improved chronic care.</p>
      </div>
      <div className="hp-grid-2col" style={{ maxWidth: 900, margin: '0 auto' }}>
        {TESTIMONIALS.slice(0, 4).map((t) => (
          <div key={t.name} className="card" style={{ padding: 20 }}>
            <div style={{ color: 'var(--sky-500)', fontSize: 12, marginBottom: 8, display: 'flex', gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="var(--sky-500)" />)}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sky-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-500)', fontSize: 12, fontWeight: 600 }}>{t.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
