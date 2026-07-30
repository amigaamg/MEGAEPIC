'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Play, Check, Brain, Stethoscope, Heart, Building,
  Users, Globe, GraduationCap, Shield, Activity, Microscope, BookOpen,
  FlaskConical, Scan, Pill, ClipboardList, FileText, Database, BarChart3,
  Lock, MapPin, Smartphone, UserCircle, BookMarked, Target, Rocket,
  Menu, X, Code, Grid, Video, Settings, Clock, RefreshCw,
  Headphones, Airplay, Package, AppWindow, Monitor, DollarSign,
  Eye, Cloud, Sparkles, ChevronRight, Calendar,
  Fingerprint, WifiOff, Server, Layers, Cpu, Zap, Award, Share2
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { ENGINES, TESTIMONIALS } from '@/components/landing/config'
import './_shared/presentation.css'
import './_shared/responsive.css'

const ECOSYSTEM_NODES = ['Patient', 'Community', 'Clinic', 'Hospital', 'Referral', 'Laboratory', 'Radiology', 'Pharmacy', 'Insurance', 'Research', 'Education', 'Public Health', 'Government']

const AUDIENCE = [
  { icon: <UserCircle size={22} />, title: 'Patients', desc: 'Never repeat your medical history. Own your health data. One lifelong record across every visit.', gradient: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', accent: '#22c55e' },
  { icon: <Stethoscope size={22} />, title: 'Clinicians', desc: 'Spend more time treating. Less time documenting. AI-assisted reasoning at every step.', gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', accent: '#2F80ED' },
  { icon: <Building size={22} />, title: 'Organizations', desc: 'One platform for every department. Laboratory, radiology, pharmacy, billing—all connected.', gradient: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', accent: '#7c3aed' },
  { icon: <Shield size={22} />, title: 'Governments', desc: 'Real-time public health visibility. National surveillance. Policy intelligence. Population health.', gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', accent: '#2F80ED' },
  { icon: <Microscope size={22} />, title: 'Researchers', desc: 'Discover from real-world care. Built-in registries. De-identified cohorts. Trial-ready data.', gradient: 'linear-gradient(135deg,#ecfeff,#cffafe)', accent: '#06b6d4' },
  { icon: <Code size={22} />, title: 'Developers', desc: 'Build on AMEXAN. Open APIs, FHIR R4, SDKs, and a plugin marketplace for endless extensions.', gradient: 'linear-gradient(135deg,#f4f4f5,#e4e4e7)', accent: '#18181b' },
]

const PHILOSOPHY = [
  { icon: <UserCircle size={24} />, title: 'One Patient', sub: 'One Record. Anywhere. Anytime.', desc: 'Every patient has a single lifelong record across every encounter, facility, and care setting.' },
  { icon: <Brain size={24} />, title: 'Evidence First', sub: 'Every recommendation explainable.', desc: 'Every clinical suggestion traceable to source evidence. Nothing hidden. Nothing assumed.' },
  { icon: <BookOpen size={24} />, title: 'Learning System', sub: 'Every encounter teaches.', desc: 'Every case improves the system. Education inside care. Learning that scales across every clinician.' },
  { icon: <Share2 size={24} />, title: 'Open Standards', sub: 'FHIR · DICOM · SNOMED · LOINC · ICD', desc: 'Open standards out of the box. No lock-in. Connected to the global health ecosystem.' },
  { icon: <Globe size={24} />, title: 'Built for Africa', sub: 'Built for the World.', desc: 'Localized protocols, formularies, languages, and compliance—adaptable to every country.' },
  { icon: <Zap size={24} />, title: 'Continuous Evolution', sub: 'Never frozen. Always learning.', desc: 'Medicine changes every month. AMEXAN evolves with it—protocols, guidelines, and intelligence updated continuously.' },
]

const CARE_FLOW = [
  { step: '1', label: 'Patient Arrives', icon: <UserCircle size={18} />, desc: 'Walk-in, appointment, telemedicine, or referral' },
  { step: '2', label: 'Registration', icon: <ClipboardList size={18} />, desc: 'Identity verified. Record created or retrieved.' },
  { step: '3', label: 'Triage', icon: <Activity size={18} />, desc: 'Vitals, acuity assessment, priority assignment' },
  { step: '4', label: 'History & Exam', icon: <Stethoscope size={18} />, desc: 'Structured SOCRATES with AI-guided examination' },
  { step: '5', label: 'Clinical Reasoning', icon: <Brain size={18} />, desc: 'AI-assisted differential diagnosis with evidence scoring' },
  { step: '6', label: 'Investigations', icon: <FlaskConical size={18} />, desc: 'Intelligent lab and imaging orders. Auto-result import.' },
  { step: '7', label: 'Diagnosis', icon: <FileText size={18} />, desc: 'Final diagnosis with ICD-11 coding. Evidence-linked.' },
  { step: '8', label: 'Treatment', icon: <Pill size={18} />, desc: 'Medications, procedures, therapy. Safety checks at every step.' },
  { step: '9', label: 'Monitoring', icon: <Activity size={18} />, desc: 'Vitals, early warning scores, real-time alerts' },
  { step: '10', label: 'Discharge', icon: <Check size={18} />, desc: 'Summary, prescriptions, follow-up. Connected.' },
  { step: '11', label: 'Follow-up', icon: <RefreshCw size={18} />, desc: 'Telemedicine, home care, adherence tracking' },
  { step: '12', label: 'Lifetime Care', icon: <Heart size={18} />, desc: 'One patient. One timeline. Forever.' },
]

const ORG_JOURNEY = [
  { step: '01', label: 'Book Demo', icon: <Eye size={18} />, desc: 'See the ecosystem in action.' },
  { step: '02', label: 'Assessment', icon: <ClipboardList size={18} />, desc: 'Map your workflows.' },
  { step: '03', label: 'Configuration', icon: <Settings size={18} />, desc: 'Customize for your context.' },
  { step: '04', label: 'Migration', icon: <Cloud size={18} />, desc: 'Secure data migration.' },
  { step: '05', label: 'Integration', icon: <Share2 size={18} />, desc: 'Connect existing systems.' },
  { step: '06', label: 'Training', icon: <GraduationCap size={18} />, desc: 'Role-specific onboarding.' },
  { step: '07', label: 'Go Live', icon: <Rocket size={18} />, desc: 'Phased clinical rollout.' },
  { step: '08', label: 'Support', icon: <Headphones size={18} />, desc: '24/7 clinical informatics.' },
  { step: '09', label: 'Optimize', icon: <BarChart3 size={18} />, desc: 'Analyze and improve.' },
  { step: '10', label: 'Scale', icon: <Globe size={18} />, desc: 'Expand across your organization.' },
]

const CAPABILITIES = [
  { icon: <Database size={16} />, label: 'Lifelong Patient Records' },
  { icon: <Grid size={16} />, label: '20+ Healthcare Workspaces' },
  { icon: <BookMarked size={16} />, label: 'International Standards' },
  { icon: <Building size={16} />, label: 'Multi-Hospital Ready' },
  { icon: <WifiOff size={16} />, label: 'Offline First' },
  { icon: <Code size={16} />, label: 'API Driven' },
  { icon: <Brain size={16} />, label: 'Knowledge Graph Powered' },
  { icon: <Cpu size={16} />, label: 'AI Assisted' },
]

const PRODUCTS_SHOW = [
  {
    icon: <Stethoscope size={24} />, title: 'Clinical OS',
    desc: 'Doctor workspace with clinical reasoning, structured history, differential diagnosis, ward rounds, and evidence-guided decision support.',
    gradient: 'linear-gradient(135deg,#2F80ED,#1A6DD9)',
  },
  {
    icon: <Smartphone size={24} />, title: 'Patient',
    desc: 'Personal health record, appointments, lab results, medications, telehealth, and secure messaging—always in your pocket.',
    gradient: 'linear-gradient(135deg,#22c55e,#16a34a)',
  },
  {
    icon: <Microscope size={24} />, title: 'Research',
    desc: 'De-identified data, cohort builder, registry support, trial management, and AI dataset creation for real-world evidence.',
    gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)',
  },
  {
    icon: <GraduationCap size={24} />, title: 'Education',
    desc: 'Medical school curriculum, simulation, assessments, OSCE tools, and continuous professional development inside clinical care.',
    gradient: 'linear-gradient(135deg,#f97316,#ea580c)',
  },
  {
    icon: <BarChart3 size={24} />, title: 'Analytics',
    desc: 'Population health dashboards, operational BI, clinical audit, infection surveillance, and predictive analytics.',
    gradient: 'linear-gradient(135deg,#eab308,#ca8a04)',
  },
  {
    icon: <Grid size={24} />, title: 'Marketplace',
    desc: 'Certified plugins, FHIR apps, regional modules, AI models, themes, and integration adapters to extend every capability.',
    gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
  },
  {
    icon: <Code size={24} />, title: 'API Platform',
    desc: 'Open APIs, FHIR R4, SDKs, webhooks, and plugin framework for building on AMEXAN—interoperability by design.',
    gradient: 'linear-gradient(135deg,#1e293b,#0f172a)',
  },
  {
    icon: <Cloud size={24} />, title: 'Cloud',
    desc: 'Secure, scalable healthcare infrastructure with HIPAA-aligned hosting, disaster recovery, and offline-first support.',
    gradient: 'linear-gradient(135deg,#0284c7,#0369a1)',
  },
]

const TRUST_ITEMS = [
  'FHIR', 'SNOMED CT', 'LOINC', 'DICOM', 'ICD-11', 'WHO',
  'Offline-first', 'Knowledge Graph', 'Role-based Security', 'End-to-End Encryption',
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [year, setYear] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setYear(String(new Date().getFullYear())) }, [])

  const Tag = ({ dark, children }: { dark?: boolean; children: React.ReactNode }) => (
    <div className={dark ? 'hp-tag-dark' : 'hp-tag'}>{children}</div>
  )

  const SecTitle = ({ tag, title, subtitle, dark }: { tag?: string; title: string; subtitle?: string; dark?: boolean }) => (
    <div className="hp-title-wrap">
      {tag && <Tag dark={dark}>{tag}</Tag>}
      <h2 className={dark ? 'hp-h2-dark' : 'hp-h2'}>{title}</h2>
      {subtitle && <p className={dark ? 'hp-sub-dark' : 'hp-sub'} style={{ maxWidth: 600, margin: '0 auto' }}>{subtitle}</p>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-card)', color: 'var(--text-primary)' }}>
      <Header scrolled={scrolled} />

      {/* ═══ 1 — HERO ═══ */}
      <section className="hp-section" style={{ paddingTop: 136, paddingBottom: 48 }}>
        <div className="hp-hero">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="hp-tag" style={{ marginBottom: 20 }}>
              <Brain size={14} /> AMEXAN Clinical Operating System
            </div>
            <h1 className="hp-hero-h1">
              The Operating System<br />for Modern Healthcare.
            </h1>
            <p className="hp-hero-p">
              Connect every patient, clinician, facility, and healthcare service through one intelligent platform that powers clinical care, education, research, operations, and lifelong health.
            </p>
            <p className="hp-hero-p2">
              AMEXAN transforms fragmented healthcare into one connected ecosystem—bringing together clinical reasoning, documentation, investigations, treatment, collaboration, analytics, and continuous learning to improve outcomes for everyone.
            </p>
            <div className="hp-hero-btns hp-hero-btns--main">
              <Link href="/register" className="btn btn-primary">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#" className="btn btn-secondary">
                Book a Demo
              </a>
              <a href="#" className="btn btn-ghost">
                <Play size={18} /> Watch Overview
              </a>
            </div>
          </motion.div>
          <div className="hp-hero-vis">
            <div className="hp-hero-card">
              <div className="hp-hero-card-header">
                {['var(--sky-500)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.15)'].map((c, i) => (
                  <div key={i} className="hp-hero-card-dot" style={{ background: c }} />
                ))}
                <div style={{ flex: 1 }} />
                <span className="hp-hero-card-badge">ONE ECOSYSTEM</span>
              </div>
              <div className="hp-hero-card-list">
                {ECOSYSTEM_NODES.map((label, i) => (
                  <div key={label} className="hp-hero-card-item">
                    <div className="hp-hero-card-dot-sm" />
                    <span>{label}</span>
                    {i < ECOSYSTEM_NODES.length - 1 && <ChevronRight size={11} className="hp-hero-card-arrow" />}
                  </div>
                ))}
              </div>
              <div className="hp-hero-card-footer">
                <div className="hp-hero-card-live" />
                <span>Live — The infrastructure healthcare has been missing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2 — TRUST STRIP ═══ Immediate trust below hero */}
      <section className="hp-section" id="trust" style={{ padding: 'clamp(20px,4vw,32px) clamp(20px,5vw,40px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.03em' }}>
            Trusted by clinicians. Built on international healthcare standards.
          </span>
        </div>
        <div className="hp-flex" style={{ maxWidth: 960, margin: '0 auto', gap: 8 }}>
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="pill" style={{ fontSize: 12, padding: '4px 12px' }}>{item}</span>
          ))}
        </div>
        <div className="hp-flex" style={{ maxWidth: 720, margin: '16px auto 0', gap: 10 }}>
          {CAPABILITIES.map((c) => (
            <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              <span style={{ color: 'var(--meaning-normal)', flexShrink: 0 }}>{c.icon}</span>
              {c.label}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ 3 — ECOSYSTEM ═══ */}
      <section className="hp-section-dark" id="ecosystem" style={{ textAlign: 'center' }}>
        <SecTitle dark tag="THE ECOSYSTEM" title="One Continuous Intelligence Loop" subtitle="Patient to community to clinic to hospital to research and back. Everything connected." />
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

      {/* ═══ 4 — WHO WE SERVE ═══ */}
      <section className="hp-section" id="who">
        <SecTitle tag="WHO WE SERVE" title="Built for Everyone in Healthcare" subtitle="Six audiences. One platform. Each sees what matters most to them." />
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

      {/* ═══ 5 — PRODUCTS ═══ */}
      <section className="hp-section-dark" id="products">
        <SecTitle dark tag="PRODUCTS" title="The AMEXAN Ecosystem" subtitle="Eight products. One platform. Every product built on the same clinical intelligence engine." />
        <div className="hp-grid-4" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {PRODUCTS_SHOW.map((p) => (
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

      {/* ═══ 6 — CLINICAL INTELLIGENCE ═══ */}
      <section className="hp-section" id="intelligence">
        <SecTitle tag="CLINICAL INTELLIGENCE" title="AI Assists. Doctors Decide." subtitle="This is not ChatGPT. It is clinical intelligence. Every recommendation traceable to source evidence. Nothing hidden." />
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

      {/* ═══ 7 — CLINICAL JOURNEY ═══ */}
      <section className="hp-section-dark" id="care-flow">
        <SecTitle dark tag="HOW CARE FLOWS" title="The Clinical Journey" subtitle="From arrival to lifelong care. Every step connected. Every step intelligent." />
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

      {/* ═══ 8 — WHY AMEXAN ═══ */}
      <section className="hp-section" id="why">
        <SecTitle tag="WHY AMEXAN" title="Built Differently. On Purpose." subtitle="Not better software. A different philosophy. One patient. One record. One operating system. Unlimited applications." />
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

      {/* ═══ 9 — SECURITY & STANDARDS ═══ */}
      <section className="hp-section-dark" id="security-standards">
        <SecTitle dark tag="SECURITY & STANDARDS" title="Healthcare-Grade. Every Layer." subtitle="Encrypted. Audited. Compliant. Offline-capable. Patient data protected by design. Interoperability is not an afterthought—it is the foundation." />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="hp-flex" style={{ gap: 8, justifyContent: 'center' }}>
            <span className="pill-dark"><Shield size={13} /> End-to-End Encryption</span>
            <span className="pill-dark"><FileText size={13} /> Audit Logging</span>
            <span className="pill-dark"><Users size={13} /> Role-Based Access</span>
            <span className="pill-dark"><Lock size={13} /> Patient Privacy</span>
            <span className="pill-dark"><Database size={13} /> Data Integrity</span>
            <span className="pill-dark"><Server size={13} /> High Availability</span>
            <span className="pill-dark"><WifiOff size={13} /> Offline First</span>
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {['HL7 FHIR R4', 'SNOMED CT', 'LOINC', 'DICOM', 'ICD-11', 'WHO Guidelines', 'HIPAA', 'GDPR', 'SOC 2'].map((s) => (
              <span key={s} style={{ padding: '4px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10 — ORGANIZATION JOURNEY ═══ */}
      <section className="hp-section" id="org-journey">
        <SecTitle tag="ORGANIZATION JOURNEY" title="From Demo to Full-Scale Deployment" subtitle="How healthcare organizations adopt and scale with AMEXAN." />
        <div className="hp-grid-5" style={{ maxWidth: 900, margin: '0 auto' }}>
          {ORG_JOURNEY.map((o) => (
            <div key={o.step} className="org-step-card">
              <div className="org-step-icon">{o.icon}</div>
              <div className="org-step-num">{o.step}</div>
              <div className="org-step-label">{o.label}</div>
              <p className="org-step-desc">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 11 — TESTIMONIALS ═══ */}
      <section className="hp-section-dark" id="testimonials">
        <SecTitle dark tag="SUCCESS STORIES" title="Real Outcomes. Real Healthcare Teams." subtitle="Reduced documentation time. Fewer medication errors. Better follow-up. Improved chronic care." />
        <div className="hp-grid-2col" style={{ maxWidth: 900, margin: '0 auto' }}>
          {TESTIMONIALS.slice(0, 4).map((t) => (
            <div key={t.name} className="card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
              <div style={{ color: 'var(--meaning-attention)', fontSize: 12, marginBottom: 8 }}>{'\u2B50'.repeat(5)}</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(47,128,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-400)', fontSize: 12, fontWeight: 600 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 12 — CTA ═══ */}
      <section className="hp-cta">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="hp-tag-dark" style={{ display: 'inline-flex', marginBottom: 16 }}>GET STARTED</div>
          <h2 className="hp-cta-h2">
            This is not software.
          </h2>
          <p className="hp-cta-p1">
            This is the infrastructure healthcare has been missing.
          </p>
          <p className="hp-cta-p2">
            Join the healthcare organizations, governments, universities, and innovators building on AMEXAN.
          </p>
          <div className="hp-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary hp-cta-btn-primary">
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#" className="btn btn-secondary hp-cta-btn-secondary">
              Book a Demo
            </a>
          </div>
        </motion.div>
      </section>

      <Footer year={year} />
    </div>
  )
}
