'use client'
import { UserCircle, Activity, Stethoscope, Brain, FlaskConical, Pill, RefreshCw } from 'lucide-react'

const CARE_FLOW = [
  { step: '1', label: 'Arrival', icon: <UserCircle size={18} />, desc: 'Eliminate registration delays' },
  { step: '2', label: 'Triage', icon: <Activity size={18} />, desc: 'Instant acuity assignment' },
  { step: '3', label: 'History and Exam', icon: <Stethoscope size={18} />, desc: 'AI-guided. No missed details.' },
  { step: '4', label: 'Reasoning', icon: <Brain size={18} />, desc: 'DDx with evidence scoring' },
  { step: '5', label: 'Investigations', icon: <FlaskConical size={18} />, desc: 'Eliminate duplicate orders' },
  { step: '6', label: 'Diagnosis and Treatment', icon: <Pill size={18} />, desc: 'Safety-checked. Evidence-linked.' },
  { step: '7', label: 'Monitoring', icon: <Activity size={18} />, desc: 'Detect deterioration early' },
  { step: '8', label: 'Follow-up', icon: <RefreshCw size={18} />, desc: 'No patients lost to follow-up' },
]

// Phase 4D — The Clinical Journey.
// One patient. One timeline. One intelligence.
export default function JourneySection() {
  return (
    <section className="hp-section-dark" id="care-flow">
      <div className="hp-title-wrap">
        <div className="hp-tag-dark">HOW CARE FLOWS</div>
        <h2 className="hp-h2-dark">The Clinical Journey</h2>
        <p className="hp-sub-dark" style={{ maxWidth: 600, margin: '0 auto' }}>From arrival to lifelong care. Every step connected. Every step intelligent.</p>
      </div>
      <div className="hp-grid-4" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {CARE_FLOW.map((f) => (
          <div key={f.step} className="card" style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="care-flow-step">{f.step}</div>
            <div style={{ color: 'var(--sky-400)', marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{f.label}</div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
