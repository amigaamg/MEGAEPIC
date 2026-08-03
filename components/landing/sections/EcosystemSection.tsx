'use client'
import { ChevronRight } from 'lucide-react'

const ECOSYSTEM_NODES = ['Patient', 'Community', 'Clinic', 'Hospital', 'Referral', 'Laboratory', 'Radiology', 'Pharmacy', 'Insurance', 'Research', 'Education', 'Public Health', 'Government']

// Phase 4B — Ecosystem Section
// Constitutional: the ecosystem is the product. One continuous intelligence loop.
export default function EcosystemSection() {
  return (
    <section className="hp-section-dark" id="ecosystem" style={{ textAlign: 'center' }}>
      <div className="hp-title-wrap">
        <div className="hp-tag-dark">THE ECOSYSTEM</div>
        <h2 className="hp-h2-dark">One Continuous Intelligence Loop</h2>
        <p className="hp-sub-dark" style={{ maxWidth: 600, margin: '0 auto' }}>Patient to community to clinic to hospital to research and back. Everything connected.</p>
      </div>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '12px 0' }}>
        <div className="hp-flex" style={{ gap: 6 }}>
          {ECOSYSTEM_NODES.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="pill-dark">{label}</span>
              {i < ECOSYSTEM_NODES.length - 1 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          Every patient, every encounter, every clinical decision, every healthcare service—connected through one continuously learning operating system.
        </p>
      </div>
    </section>
  )
}
