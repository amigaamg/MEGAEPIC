'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Play, Check, Brain, Stethoscope, Heart, Building,
  Users, Globe, GraduationCap, Shield, Activity, Microscope, BookOpen,
  FlaskConical, Scan, Pill, ClipboardList, FileText, Database, BarChart3,
  Lock,
  MapPin, Smartphone, UserCircle, BookMarked, Target, Dna, Rocket,
  Menu, X, Code, Grid, Video,
  Settings, Clock, RefreshCw, Headphones, ShoppingBag,
  Airplay, Package, AppWindow, Monitor, DollarSign,
  Eye,
  Cloud, Upload,
  Sparkles, ChevronRight, Calendar,
  Fingerprint, WifiOff, Database as DbIcon, Share2
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { PRODUCTS, ENGINES, STANDARDS, MARKETPLACE_ITEMS, TESTIMONIALS } from '@/components/landing/config'
import './_shared/presentation.css'
import './_shared/responsive.css'

const PAINS = [
  { icon: <Activity size={22} />, problem: 'Clinicians waste time on documentation.', solution: 'Reduce documentation time by up to 70%. Let AI capture the narrative.', stat: '70%', unit: 'less time' },
  { icon: <Building size={22} />, problem: 'Hospitals buy ten different systems.', solution: 'One platform for every department. Laboratory. Radiology. Pharmacy. Billing. All connected.', stat: '1', unit: 'platform' },
  { icon: <UserCircle size={22} />, problem: 'Patients repeat their story at every visit.', solution: 'Universal lifelong patient record. Never repeat. Never lost.', stat: '100%', unit: 'continuity' },
  { icon: <Brain size={22} />, problem: 'Clinical decisions vary. Protocols forgotten.', solution: 'Evidence-guided reasoning at every step. AI assists. Doctors decide.', stat: 'Real-time', unit: 'guidance' },
  { icon: <DbIcon size={22} />, problem: 'Hospitals have data but no intelligence.', solution: 'Clinical Intelligence that learns from every encounter. Trends. Predictions. Insights.', stat: 'Live', unit: 'analytics' },
  { icon: <GraduationCap size={22} />, problem: 'Medical students learn separately from practice.', solution: 'Education inside clinical care. Every case teaches.', stat: 'Built-in', unit: 'CPD' },
]

const ECOSYSTEM_NODES = ['Patient', 'Community', 'Clinic', 'Hospital', 'Referral', 'Laboratory', 'Radiology', 'Pharmacy', 'Insurance', 'Research', 'Education', 'Public Health', 'Government', 'Policy']

const AUDIENCE = [
  { href: '#', icon: <UserCircle size={22} />, title: 'Patients', desc: 'Never repeat your medical history. Own your health data.', gradient: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', accent: 'var(--meaning-normal)' },
  { href: '#', icon: <Stethoscope size={22} />, title: 'Clinicians', desc: 'Spend more time treating. Less time documenting. AI works with you.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: 'var(--sky-500)' },
  { href: '#', icon: <Heart size={22} />, title: 'Nurses', desc: 'Know exactly what matters now. Clear tasks. Connected care.', gradient: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', accent: '#ec4899' },
  { href: '#', icon: <Building size={22} />, title: 'Hospitals', desc: 'One platform for every department. No more disconnected systems.', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', accent: 'var(--meaning-education)' },
  { href: '#', icon: <MapPin size={22} />, title: 'Clinics', desc: 'Streamline every workflow. Schedule. Treat. Follow up. One place.', gradient: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', accent: 'var(--meaning-warning)' },
  { href: '#', icon: <GraduationCap size={22} />, title: 'Universities', desc: 'Teach real clinical reasoning. Not theory. Real cases. Real intelligence.', gradient: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', accent: 'var(--meaning-attention)' },
  { href: '#', icon: <Microscope size={22} />, title: 'Researchers', desc: 'Discover from real-world care. Built-in registries. De-identified cohorts.', gradient: 'linear-gradient(135deg,#ECFEFF,#CFFAFE)', accent: '#06b6d4' },
  { href: '#', icon: <Shield size={22} />, title: 'Governments', desc: 'See public health in real time. National surveillance. Policy intelligence.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: 'var(--sky-500)' },
  { href: '#', icon: <DollarSign size={22} />, title: 'Insurance', desc: 'Automate verification. Real-time claims. Fraud detection. Population risk.', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', accent: 'var(--meaning-education)' },
  { href: '#', icon: <FlaskConical size={22} />, title: 'Laboratories', desc: 'Receive intelligent requests. Auto-validate results. Zero manual entry.', gradient: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', accent: 'var(--meaning-normal)' },
  { href: '#', icon: <Scan size={22} />, title: 'Radiology', desc: 'Clinically relevant imaging requests. Structured reporting. AI-assisted reads.', gradient: 'linear-gradient(135deg,#F4F4F5,#E4E4E7)', accent: '#52525b' },
  { href: '#', icon: <Pill size={22} />, title: 'Pharmacies', desc: 'Receive verified prescriptions. Zero errors. Automatic interaction checks.', gradient: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)', accent: '#e11d48' },
  { href: '#', icon: <Heart size={22} />, title: 'NGOs & CHWs', desc: 'Deploy anywhere. Offline-first. Connect community care to the national system.', gradient: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', accent: 'var(--meaning-normal)' },
  { href: '#', icon: <Video size={22} />, title: 'Telemedicine', desc: 'Continue care across distances. Not a separate encounter. The same journey.', gradient: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)', accent: '#db2777' },
  { href: '#', icon: <Airplay size={22} />, title: 'Flying Doctors', desc: 'Continue the same patient journey from air to hospital. No information lost.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: 'var(--sky-500)' },
  { href: '#', icon: <ShoppingBag size={22} />, title: 'Medical Suppliers', desc: 'Connected commerce. Real-time inventory. Verified procurement.', gradient: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', accent: 'var(--meaning-attention)' },
  { href: '#', icon: <Code size={22} />, title: 'Developers', desc: 'Build on AMEXAN. Open APIs. FHIR R4. SDKs. Plugin marketplace.', gradient: 'linear-gradient(135deg,#F4F4F5,#E4E4E7)', accent: '#18181b' },
  { href: '#', icon: <Brain size={22} />, title: 'AI Companies', desc: 'Integrate your models. Secure de-identified data. Clinical validation pipeline.', gradient: 'linear-gradient(135deg,#F0F9FF,#E0F2FE)', accent: '#0284c7' },
]

const PHILOSOPHY = [
  { icon: <UserCircle size={24} />, title: 'One Patient', sub: 'One Record. Anywhere. Anytime.', desc: 'Every patient has a single lifelong record across every encounter, facility, and care setting.' },
  { icon: <Brain size={24} />, title: 'One Clinical Brain', sub: 'Shared safely.', desc: 'Clinical reasoning, knowledge graph, and decision support powered by a shared intelligence engine.' },
  { icon: <Lock size={24} />, title: 'Evidence First', sub: 'Every recommendation explainable.', desc: 'Every clinical suggestion traceable to source evidence. Nothing hidden. Nothing assumed.' },
  { icon: <BookOpen size={24} />, title: 'Knowledge Never Stops', sub: 'Every encounter teaches.', desc: 'Every case improves the system. Education inside care. Learning that scales across every clinician.' },
  { icon: <Share2 size={24} />, title: 'Interoperable', sub: 'FHIR · DICOM · SNOMED · LOINC · ICD', desc: 'Open standards out of the box. No lock-in. Connected to the global health ecosystem.' },
  { icon: <Globe size={24} />, title: 'Designed for Africa', sub: 'Built for the World.', desc: 'Localized protocols, formularies, languages, and compliance—adaptable to every country.' },
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

const PATIENT_JOURNEY = [
  { step: '01', label: 'Symptoms', icon: <Activity size={18} />, desc: 'Recognize symptoms. Triage guidance.' },
  { step: '02', label: 'Appointment', icon: <Calendar size={18} />, desc: 'Book in-person or telemedicine.' },
  { step: '03', label: 'Telemedicine', icon: <Video size={18} />, desc: 'Consult from anywhere.' },
  { step: '04', label: 'Hospital', icon: <Building size={18} />, desc: 'In-patient care. Procedures.' },
  { step: '05', label: 'Recovery', icon: <Heart size={18} />, desc: 'Care plan. Vitals. Progress.' },
  { step: '06', label: 'Medication', icon: <Pill size={18} />, desc: 'Prescriptions. Adherence.' },
  { step: '07', label: 'Education', icon: <BookOpen size={18} />, desc: 'Learn about your condition.' },
  { step: '08', label: 'Monitoring', icon: <Activity size={18} />, desc: 'Ongoing vitals. Labs.' },
  { step: '09', label: 'Community', icon: <Users size={18} />, desc: 'Support groups. Wellness.' },
  { step: '10', label: 'Lifetime Record', icon: <Database size={18} />, desc: 'Complete health history. Always.' },
]

const ORG_JOURNEY = [
  { step: '01', label: 'Book Demo', icon: <Eye size={18} />, desc: 'See the ecosystem in action.' },
  { step: '02', label: 'Needs Assessment', icon: <ClipboardList size={18} />, desc: 'Map your workflows.' },
  { step: '03', label: 'Configuration', icon: <Settings size={18} />, desc: 'Customize for your context.' },
  { step: '04', label: 'Migration', icon: <Upload size={18} />, desc: 'Secure data migration.' },
  { step: '05', label: 'Integration', icon: <Share2 size={18} />, desc: 'Connect existing systems.' },
  { step: '06', label: 'Training', icon: <GraduationCap size={18} />, desc: 'Role-specific onboarding.' },
  { step: '07', label: 'Go Live', icon: <Rocket size={18} />, desc: 'Phased clinical rollout.' },
  { step: '08', label: 'Support', icon: <Headphones size={18} />, desc: '24/7 clinical informatics.' },
  { step: '09', label: 'Optimization', icon: <BarChart3 size={18} />, desc: 'Analyze and improve.' },
  { step: '10', label: 'Expansion', icon: <Globe size={18} />, desc: 'Scale across your organization.' },
]

const COUNTRIES = [
  { country: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', desc: 'National referral hospitals, county facilities, rural clinics' },
  { country: 'Uganda', flag: '\u{1F1FA}\u{1F1EC}', desc: 'Regional referral hospitals and community health' },
  { country: 'Tanzania', flag: '\u{1F1F9}\u{1F1FF}', desc: 'Teaching hospitals and district health systems' },
  { country: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}', desc: 'National health system integration' },
  { country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', desc: 'Private and public hospital networks' },
  { country: 'UK', flag: '\u{1F1EC}\u{1F1E7}', desc: 'NHS integration. GP practices.' },
  { country: 'USA', flag: '\u{1F1FA}\u{1F1F8}', desc: 'HIPAA-compliant. Hospital networks.' },
  { country: 'India', flag: '\u{1F1EE}\u{1F1F3}', desc: 'Large hospital groups. Ayushman Bharat.' },
  { country: 'Global', flag: '\u{1F30D}', desc: 'WHO standards. International collaboration.' },
]

const SECURITY_ITEMS = [
  'End-to-End Encryption', 'Audit Logging', 'Role-Based Access',
  'Patient Privacy', 'Data Integrity', 'High Availability',
  'Zero Trust Architecture', 'Disaster Recovery', 'Offline-First',
]

const LIFECYCLE = [
  { age: 'Newborn', icon: <Dna size={18} />, color: '#06b6d4', items: ['Birth registration', 'Immunization tracking', 'Growth monitoring', 'Newborn screening'] },
  { age: 'Child', icon: <Heart size={18} />, color: '#22c55e', items: ['Well-child visits', 'Vaccination records', 'School health', 'Developmental screening'] },
  { age: 'Adolescent', icon: <Users size={18} />, color: '#f97316', items: ['Adolescent health', 'Mental health', 'Sexual health', 'Sports medicine'] },
  { age: 'Adult', icon: <UserCircle size={18} />, color: '#2F80ED', items: ['Primary care', 'Chronic disease', 'Maternal health', 'Occupational health'] },
  { age: 'Elderly', icon: <Heart size={18} />, color: '#7c3aed', items: ['Geriatric care', 'Polypharmacy', 'Palliative care', 'Care coordination'] },
]

const PARTNERS = [
  { name: 'WHO', desc: 'World Health Organization' },
  { name: 'HL7 FHIR', desc: 'Interoperability standard' },
  { name: 'SNOMED CT', desc: 'Clinical terminology' },
  { name: 'LOINC', desc: 'Laboratory standard' },
  { name: 'ICD-11', desc: 'Disease classification' },
  { name: 'DICOM', desc: 'Medical imaging' },
  { name: 'OpenEHR', desc: 'Open health records' },
  { name: 'IHE', desc: 'Healthcare integration' },
]

const RESOURCES = [
  { icon: <BookOpen size={20} />, title: 'Documentation', desc: 'Comprehensive guides for every platform capability.' },
  { icon: <Code size={20} />, title: 'Developer Portal', desc: 'APIs, SDKs, webhooks, and integration guides.' },
  { icon: <FileText size={20} />, title: 'Clinical Library', desc: 'Evidence-based protocols, guidelines, and formularies.' },
  { icon: <Video size={20} />, title: 'Video Library', desc: 'Product tours, clinical training, and expert webinars.' },
  { icon: <Headphones size={20} />, title: 'Support Center', desc: '24/7 technical and clinical support.' },
  { icon: <Users size={20} />, title: 'Community', desc: 'Forums, discussion groups, and user networks.' },
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

      {/* ═══ L1 — HERO ═══ The Operating System That Connects Healthcare */}
      <section className="hp-section" style={{ paddingTop: 136, paddingBottom: 64 }}>
        <div className="hp-hero">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="hp-tag" style={{ marginBottom: 20 }}>
              <Brain size={14} /> AMEXAN Clinical Operating System
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, color: 'var(--sky-800)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 12px 0' }}>
              The Operating System<br />for Modern Healthcare.
            </h1>
            <p style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 24, fontWeight: 450, maxWidth: 540 }}>
              Connect every patient, clinician, facility, and healthcare service through one intelligent platform that powers clinical care, education, research, operations, and lifelong health.
            </p>
            <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 28, maxWidth: 540 }}>
              AMEXAN transforms fragmented healthcare into one connected ecosystem—bringing together clinical reasoning, documentation, investigations, treatment, collaboration, analytics, and continuous learning to improve outcomes for everyone.
            </p>
            <div className="hp-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
            <div style={{ background: 'var(--sky-800)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                {['var(--sky-500)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.15)'].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>ONE ECOSYSTEM</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Patient', 'Community', 'Clinic', 'Hospital', 'Referral', 'Laboratory', 'Radiology', 'Pharmacy', 'Insurance', 'Research', 'Education', 'Public Health', 'Government'].map((label, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sky-500)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{label}</span>
                    {i < 12 && <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--meaning-normal)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Live — The infrastructure healthcare has been missing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ L2 — THE PAIN ═══ Healthcare is still fragmented */}
      <section className="hp-section-dark">
        <SecTitle tag="THE PROBLEM" title="Healthcare Is Still Fragmented" subtitle="One patient. Many hospitals. Many systems. Many passwords. Lost information. Repeated investigations. Delayed diagnosis. AMEXAN fixes that." />
        <div className="hp-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {PAINS.map((p, i) => (
            <div key={i} className="pain-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ color: 'var(--sky-500)', flexShrink: 0, marginTop: 2 }}>{p.icon}</div>
                <div>
                  <div className="outcome">{p.stat}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>{p.unit}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 8px 0' }}><span style={{ color: 'var(--sky-800)', fontWeight: 600 }}>Pain:</span> {p.problem}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}><span style={{ color: 'var(--meaning-normal)', fontWeight: 600 }}>Solution:</span> {p.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L3 — TRUST ═══ Shown early — buyers need to trust before scrolling */}
      <section className="hp-section" id="trust" style={{ padding: 'clamp(32px,6vw,48px) clamp(20px,5vw,40px)' }}>
        <div className="hp-flex" style={{ maxWidth: 900, margin: '0 auto' }}>
          <span className="pill"><Fingerprint size={13} /> Evidence-based reasoning</span>
          <span className="pill"><Shield size={13} /> Complete audit trail</span>
          <span className="pill"><Lock size={13} /> End-to-end encryption</span>
          <span className="pill"><Users size={13} /> Role-based permissions</span>
          <span className="pill"><WifiOff size={13} /> Offline capable</span>
          <span className="pill"><Globe size={13} /> Multi-country</span>
          <span className="pill"><BookMarked size={13} /> FHIR · SNOMED · LOINC · ICD-11 · DICOM</span>
        </div>
      </section>

      {/* ═══ L4 — WHO IT'S FOR ═══ Problems solved for every role */}
      <section className="hp-section-dark" id="who">
        <SecTitle dark tag="PROBLEMS SOLVED" title="What Pain Disappears?" subtitle="Every role in healthcare. Every setting. Every country. One platform ends the fragmentation." />
        <div className="hp-audience">
          {AUDIENCE.map((a, i) => (
            <Link key={a.title} href={a.href} style={{ textDecoration: 'none' }}>
              <div className="hover-lift" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: a.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent, flexShrink: 0, fontSize: 22 }}>{a.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)', margin: 0 }}>{a.title}</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ L5 — ECOSYSTEM MAP ═══ */}
      <section className="hp-section-dark" id="ecosystem" style={{ textAlign: 'center' }}>
        <SecTitle dark tag="THE ECOSYSTEM MAP" title="One Continuous Intelligence Loop" subtitle="Patient to community to clinic to hospital to research and back. Everything connected." />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
          <div className="hp-flex" style={{ gap: 6 }}>
            {ECOSYSTEM_NODES.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="pill-dark">{label}</span>
                {i < ECOSYSTEM_NODES.length - 1 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--meaning-normal)' }} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Infinite loop — patient at the center of an intelligent ecosystem</span>
          </div>
        </div>
      </section>

      {/* ═══ L6 — PRODUCTS ═══ */}
      <section className="hp-section-dark" id="products">
        <SecTitle dark tag="PRODUCTS" title="The AMEXAN Ecosystem" subtitle="Ten products. One platform. Every product built on the same clinical intelligence engine." />
        <div className="hp-grid-3" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {PRODUCTS.map((p, i) => (
            <div key={p.title} className="hover-lift" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ height: 4, background: p.gradient }} />
              <div style={{ padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 16 }}>{p.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sky-800)', margin: '0 0 8px 0' }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>{p.desc}</p>
                <span style={{ fontSize: 13, color: 'var(--sky-500)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Learn More <ArrowRight size={13} /></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L7 — PLATFORM PRINCIPLES ═══ */}
      <section className="hp-section" id="principles">
        <SecTitle tag="OUR CONSTITUTION" title="One Patient. One Platform. One Ecosystem." subtitle="Six constitutional principles. They never change." />
        <div className="hp-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {PHILOSOPHY.map((p, i) => (
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

      {/* ═══ L8 — CLINICAL INTELLIGENCE ═══ */}
      <section className="hp-section-dark" id="intelligence">
        <SecTitle dark tag="CLINICAL INTELLIGENCE" title="AI Assists. Doctors Decide." subtitle="This is not ChatGPT. It is clinical intelligence. Every recommendation traceable to source evidence. Nothing hidden." />
        <div className="hp-grid-4" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {ENGINES.map((e, i) => (
            <div key={e.name} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ color: 'var(--sky-500)' }}>{e.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)' }}>{e.name}</div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L9 — CLINICAL CARE FLOW ═══ */}
      <section className="hp-section" id="care-flow">
        <SecTitle tag="HOW CARE FLOWS" title="The Clinical Journey" subtitle="From arrival to lifelong care. Every step connected. Every step intelligent." />
        <div className="hp-grid-4" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {CARE_FLOW.map((f, i) => (
            <div key={f.step} className="card" style={{ position: 'relative', background: 'var(--surface-elevated)' }}>
              <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: 'var(--sky-light)', color: 'var(--sky-500)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.step}</div>
              <div style={{ color: 'var(--sky-500)', marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{f.label}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L10 — PATIENT JOURNEY ═══ */}
      <section className="hp-section-dark" id="patient-journey">
        <SecTitle dark tag="PATIENT JOURNEY" title="Your Health Journey. One Platform." subtitle="Never repeat your story. AMEXAN remembers everything." />
        <div className="hp-flex" style={{ maxWidth: 900, margin: '0 auto', gap: 6 }}>
          {PATIENT_JOURNEY.map((p, i) => (
            <div key={p.step} className="pill-dark" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--sky-400)', fontSize: 11, fontWeight: 700 }}>{p.step}</span>
              <span>{p.label}</span>
              {i < PATIENT_JOURNEY.length - 1 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L11 — ORG JOURNEY ═══ */}
      <section className="hp-section" id="org-journey">
        <SecTitle tag="ORGANIZATION JOURNEY" title="From Demo to Full-Scale Deployment" subtitle="How healthcare organizations adopt and scale with AMEXAN." />
        <div className="hp-grid-5" style={{ maxWidth: 900, margin: '0 auto' }}>
          {ORG_JOURNEY.map((o, i) => (
            <div key={o.step} style={{ textAlign: 'center', padding: 20, background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sky-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-500)', margin: '0 auto 8px' }}>{o.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky-500)', marginBottom: 4 }}>{o.step}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{o.label}</div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L12 — LIFELONG CARE ═══ */}
      <section className="hp-section-dark" id="lifelong">
        <SecTitle dark tag="LIFELONG CARE" title="One Patient. One Life. One Record." subtitle="From newborn screening to geriatric care. AMEXAN remembers patients forever." />
        <div className="hp-life" style={{ maxWidth: 900, margin: '0 auto' }}>
          {LIFECYCLE.map((phase, i) => (
            <div key={phase.age} style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${phase.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: phase.color, margin: '0 auto 8px' }}>{phase.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 8 }}>{phase.age}</div>
              {phase.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0' }}>
                  <Check size={10} style={{ color: phase.color, flexShrink: 0 }} /> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L13 — SECURITY ═══ */}
      <section className="hp-section" id="security">
        <SecTitle tag="SECURITY" title="Healthcare-Grade. Every Layer." subtitle="Encrypted. Audited. Compliant. Offline-capable. Patient data protected by design." />
        <div className="hp-flex" style={{ maxWidth: 800, margin: '0 auto', gap: 12 }}>
          {SECURITY_ITEMS.map((item) => (
            <div key={item} className="pill" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} style={{ color: 'var(--meaning-normal)', flexShrink: 0 }} /> {item}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L14 — STANDARDS ═══ */}
      <section className="hp-section-dark" id="standards">
        <SecTitle dark tag="STANDARDS" title="Built on International Healthcare Standards" subtitle="Interoperability is not an afterthought. It is the foundation." />
        <div className="hp-flex" style={{ maxWidth: 900, margin: '0 auto' }}>
          {STANDARDS.map((s, i) => (
            <span key={s.name} className="pill-dark">{s.name}</span>
          ))}
        </div>
      </section>

      {/* ═══ L15 — COUNTRIES ═══ */}
      <section className="hp-section" id="global">
        <SecTitle tag="GLOBAL REACH" title="Designed for Africa. Built for the World." subtitle="Kenya. UK. USA. India. One platform. Many countries. Localized protocols, formularies, languages." />
        <div className="hp-grid-4" style={{ maxWidth: 900, margin: '0 auto' }}>
          {COUNTRIES.map((g, i) => (
            <div key={g.country} style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{g.flag}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 4 }}>{g.country}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L16 — RESEARCH ═══ */}
      <section className="hp-section-dark" id="research">
        <SecTitle dark tag="RESEARCH" title="Care Automatically Becomes Research-Ready" subtitle="Every encounter generates de-identified data. Cohorts. Registries. Clinical trials. Real-world evidence." />
        <div className="hp-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {[
            { icon: <FileText size={20} />, title: 'Clinical Registries', desc: 'Disease-specific registries with longitudinal data collection and outcomes tracking.' },
            { icon: <Users size={20} />, title: 'Cohort Builder', desc: 'Query de-identified data to build research cohorts with granular inclusion criteria.' },
            { icon: <Microscope size={20} />, title: 'Trial Management', desc: 'End-to-end clinical trial support from enrollment to data collection and analysis.' },
            { icon: <BarChart3 size={20} />, title: 'Population Analytics', desc: 'Epidemiological analysis, disease surveillance, and health system performance metrics.' },
            { icon: <Database size={20} />, title: 'De-identified Datasets', desc: 'Export de-identified clinical data for AI training, research, and publications.' },
            { icon: <BookMarked size={20} />, title: 'Real-World Evidence', desc: 'Publish findings from real-world clinical data across multiple therapeutic areas.' },
          ].map((r, i) => (
            <div key={r.title} className="card" style={{ display: 'flex', gap: 14, padding: 16 }}>
              <div style={{ color: 'var(--sky-500)', flexShrink: 0, marginTop: 2 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{r.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L17 — EDUCATION ═══ */}
      <section className="hp-section" id="education">
        <SecTitle tag="EDUCATION" title="Every Encounter Teaches" subtitle="Education inside care. Not separate. Not theoretical. Real cases. Real learning." />
        <div className="hp-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {[
            { icon: <BookOpen size={20} />, title: 'Case Reviews', desc: 'Review real de-identified cases with AI-guided teaching points.' },
            { icon: <Brain size={20} />, title: 'Reasoning Replay', desc: 'Replay clinical reasoning pathways. Understand every decision.' },
            { icon: <Users size={20} />, title: 'Virtual Patients', desc: 'Simulated encounters with dynamic responses and realistic scenarios.' },
            { icon: <GraduationCap size={20} />, title: 'OSCE Preparation', desc: 'Structured examination tools with standardized assessment.' },
            { icon: <ClipboardList size={20} />, title: 'Question Banks', desc: 'Curated clinical questions. Evidence-based answers. Performance analytics.' },
            { icon: <Sparkles size={20} />, title: 'AI Tutor', desc: 'Adaptive tutoring that identifies gaps and reinforces knowledge.' },
          ].map((e, i) => (
            <div key={e.title} className="card" style={{ display: 'flex', gap: 14, padding: 16, background: 'var(--surface-elevated)' }}>
              <div style={{ color: 'var(--meaning-education)', flexShrink: 0, marginTop: 2 }}>{e.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{e.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L18 — MARKETPLACE ═══ */}
      <section className="hp-section-dark" id="marketplace">
        <SecTitle dark tag="MARKETPLACE" title="Apps, Plugins & Integrations" subtitle="Extend AMEXAN with certified plugins, AI models, FHIR apps, and country modules." />
        <div className="hp-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {MARKETPLACE_ITEMS.map((m, i) => (
            <div key={m.title} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--sky-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-500)', flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 2 }}>{m.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L19 — SUCCESS STORIES ═══ */}
      <section className="hp-section" id="success">
        <SecTitle tag="SUCCESS STORIES" title="Real Outcomes. Real Healthcare Teams." subtitle="Reduced documentation time. Fewer medication errors. Better follow-up. Improved chronic care." />
        <div className="hp-grid-2col" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {TESTIMONIALS.slice(0, 6).map((t, i) => (
            <div key={t.name} className="card" style={{ padding: 20 }}>
              <div style={{ color: 'var(--meaning-attention)', fontSize: 12, marginBottom: 8 }}>{'\u2B50'.repeat(5)}</div>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sky-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-500)', fontSize: 12, fontWeight: 600 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L20 — PARTNERS ═══ */}
      <section className="hp-section-dark" id="partners">
        <SecTitle dark tag="PARTNERS" title="Aligned with Global Standards Bodies" subtitle="AMEXAN is built on internationally recognized healthcare standards." />
        <div className="hp-flex" style={{ maxWidth: 800, margin: '0 auto' }}>
          {PARTNERS.map((p) => (
            <div key={p.name} className="pill-dark" style={{ flexDirection: 'column', padding: '10px 18px', gap: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L21 — RESOURCES ═══ */}
      <section className="hp-section" id="resources">
        <SecTitle tag="RESOURCES" title="Everything You Need" subtitle="Documentation. APIs. Community. Support. Start building on AMEXAN today." />
        <div className="hp-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {RESOURCES.map((r, i) => (
            <div key={r.title} className="card" style={{ display: 'flex', gap: 14, padding: 20 }}>
              <div style={{ color: 'var(--sky-500)', flexShrink: 0, marginTop: 2 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{r.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L22 — CAREERS ═══ */}
      <section className="hp-section-dark" id="careers">
        <SecTitle dark tag="CAREERS" title="Join the Mission" subtitle="Mission-driven. Open-source. Global impact. Build the infrastructure healthcare has been missing." />
        <div className="hp-grid-5" style={{ maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: <Target size={20} />, title: 'Mission', desc: 'Connect every part of healthcare through one intelligent platform.' },
            { icon: <Eye size={20} />, title: 'Vision', desc: 'A world where every patient, clinician, and health system is connected.' },
            { icon: <Users size={20} />, title: 'Culture', desc: 'Open, transparent, evidence-driven. Clinicians and engineers building together.' },
            { icon: <Microscope size={20} />, title: 'Research', desc: 'Advancing clinical AI, knowledge graphs, and interoperability.' },
            { icon: <Code size={20} />, title: 'Open Source', desc: 'Core platform components open for community contribution and audit.' },
          ].map((c, i) => (
            <div key={c.title} style={{ textAlign: 'center', padding: 20, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sky-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-500)', margin: '0 auto 10px' }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 6 }}>{c.title}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ L23 — CTA ═══ */}
      <section style={{ background: 'var(--sky-800)', textAlign: 'center', padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 40px)' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="hp-tag-dark" style={{ display: 'inline-flex', marginBottom: 16 }}>GET STARTED</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 12px 0' }}>
            This is not software.
          </h2>
          <p style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
            This is the infrastructure healthcare has been missing.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', maxWidth: 500, margin: '0 auto 32px' }}>
            Join the healthcare organizations, governments, universities, and innovators building on AMEXAN.
          </p>
          <div className="hp-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary" style={{ background: '#fff', color: 'var(--sky-800)' }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#" className="btn btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'transparent', color: '#fff' }}>
              Book a Demo
            </a>
          </div>
        </motion.div>
      </section>

      <Footer year={year} />
    </div>
  )
}
