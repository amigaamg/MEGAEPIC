'use client'
import { UserCircle, Stethoscope, Building, Shield, Microscope, Code } from 'lucide-react'

const AUDIENCE = [
  { icon: <UserCircle size={22} />, title: 'Patients', desc: 'Never repeat your medical history. One lifelong record across every visit, anywhere.', gradient: 'linear-gradient(135deg,#f0f7ff,#e0efff)', accent: '#2F80ED' },
  { icon: <Stethoscope size={22} />, title: 'Clinicians', desc: 'Reduce documentation time up to 70%. AI-assisted reasoning at every step. Focus on patients, not software.', gradient: 'linear-gradient(135deg,#e0efff,#bfdcff)', accent: '#2F80ED' },
  { icon: <Building size={22} />, title: 'Organizations', desc: 'Replace 10 disconnected systems with one platform. Laboratory, pharmacy, billing—all unified.', gradient: 'linear-gradient(135deg,#bfdcff,#93c5fd)', accent: '#1c68d1' },
  { icon: <Shield size={22} />, title: 'Governments', desc: 'Real-time public health visibility. Eliminate fragmented reporting. Evidence-based policy decisions.', gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', accent: '#2F80ED' },
  { icon: <Microscope size={22} />, title: 'Researchers', desc: 'Discover from real-world care. No more manual data extraction. Research-ready by design.', gradient: 'linear-gradient(135deg,#e0efff,#bfdcff)', accent: '#2F80ED' },
  { icon: <Code size={22} />, title: 'Developers', desc: 'Open APIs, FHIR R4, SDKs—extend the ecosystem without fighting proprietary systems.', gradient: 'linear-gradient(135deg,#1e3a8a,#172554)', accent: '#ffffff' },
]

// Phase 4 — Who We Serve
// Six audiences. One platform. Each sees what matters most to them.
export default function AudienceSection() {
  return (
    <section className="hp-section" id="who">
      <div className="hp-title-wrap">
        <div className="hp-tag">WHO WE SERVE</div>
        <h2 className="hp-h2">Built for Everyone in Healthcare</h2>
        <p className="hp-sub" style={{ maxWidth: 600, margin: '0 auto' }}>Six audiences. One platform. Each sees what matters most to them.</p>
      </div>
      <div className="hp-audience" style={{ maxWidth: 960, margin: '0 auto' }}>
        {AUDIENCE.map((a) => (
          <div key={a.title} className="hover-lift" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: 20, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: a.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent, flexShrink: 0 }}>{a.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sky-800)', margin: 0 }}>{a.title}</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
