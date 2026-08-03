'use client'
import { Stethoscope, Smartphone, Microscope, GraduationCap, BarChart3, Grid, Code, Cloud, ArrowRight } from 'lucide-react'

const PRODUCTS = [
  {
    icon: <Stethoscope size={24} />, title: 'Clinical OS',
    desc: 'Eliminate documentation burden. Clinical reasoning, structured history, differential diagnosis in one workspace.',
    gradient: 'linear-gradient(135deg,#2F80ED,#1A6DD9)',
  },
  {
    icon: <Smartphone size={24} />, title: 'Patient',
    desc: 'Never repeat your story. Personal health record, appointments, labs, telehealth in your pocket.',
    gradient: 'linear-gradient(135deg,#60A5FA,#3B82F6)',
  },
  {
    icon: <Microscope size={24} />, title: 'Research',
    desc: 'Discover from daily care. No manual extraction. Research-ready data by design.',
    gradient: 'linear-gradient(135deg,#0EA5E9,#0284C7)',
  },
  {
    icon: <GraduationCap size={24} />, title: 'Education',
    desc: 'Learn where clinicians work. Medical curriculum and simulation inside real clinical workflows.',
    gradient: 'linear-gradient(135deg,#93C5FD,#60A5FA)',
  },
  {
    icon: <BarChart3 size={24} />, title: 'Analytics',
    desc: 'Stop guessing. Population health dashboards, operational BI, predictive insights from your data.',
    gradient: 'linear-gradient(135deg,#3B82F6,#2563EB)',
  },
  {
    icon: <Grid size={24} />, title: 'Marketplace',
    desc: 'Never outgrow the platform. Certified plugins, FHIR apps, AI models—extend everything.',
    gradient: 'linear-gradient(135deg,#1C68D1,#1E4FA8)',
  },
  {
    icon: <Code size={24} />, title: 'API Platform',
    desc: 'Break data silos. Open APIs, FHIR R4, SDKs, webhooks. Interoperability by design.',
    gradient: 'linear-gradient(135deg,#1e293b,#0f172a)',
  },
  {
    icon: <Cloud size={24} />, title: 'Cloud',
    desc: 'Secure, scalable, available everywhere. Offline-first. HIPAA-aligned. Disaster-ready.',
    gradient: 'linear-gradient(135deg,#0284C7,#0369A1)',
  },
]

// Phase 4C — Products. NOT features.
export default function ProductsSection() {
  return (
    <section className="hp-section-dark" id="products">
      <div className="hp-title-wrap">
        <div className="hp-tag-dark">PRODUCTS</div>
        <h2 className="hp-h2-dark">The AMEXAN Ecosystem</h2>
        <p className="hp-sub-dark" style={{ maxWidth: 600, margin: '0 auto' }}>Eight products. One platform. Every product built on the same clinical intelligence engine.</p>
      </div>
      <div className="hp-grid-4" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {PRODUCTS.map((p) => (
          <div key={p.title} className="hover-lift" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ height: 4, background: p.gradient }} />
            <div style={{ padding: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)', margin: '0 0 6px 0' }}>{p.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>{p.desc}</p>
              <span style={{ fontSize: 12, color: 'var(--sky-500)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Learn More <ArrowRight size={12} /></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
