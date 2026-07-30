'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { JOURNEY_STEPS, PRODUCTS, ENGINES, STANDARDS, MARKETPLACE_ITEMS, TESTIMONIALS } from '@/components/landing/config'
import { useViewportClass, isMobileViewport } from '@/hooks/useViewportClass'
import { ArrowRight, Play, Check, Brain, Stethoscope, Heart, Building, Users, Globe, GraduationCap, Shield, Activity, Microscope, BookOpen, FlaskConical, Scan, Pill, ClipboardList, FileText, Database, BarChart3, Lock, Server, UserCheck, FileCheck, AlertTriangle, MessageSquare, Star, MapPin, Smartphone, UserCircle, BookMarked, Award, Target, Dna, Syringe, Thermometer, Menu, X, ChevronDown, Code, Grid, Video, Zap, LinkIcon, Settings, GitMerge, Clock, List, RefreshCw, Headphones, ShoppingBag, Layers } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import './_shared/responsive.css'

const COLORS = {
  sky: '#2F80ED', skySoft: '#60a5fa', skyLight: 'rgba(47,128,237,0.1)',
  white: '#fff', panel: '#f8fafc', border: '#e2e8f0',
  navy: '#1e3a8a', text: '#0f172a', textLight: '#475569', textMuted: '#94a3b8',
  green: '#22c55e', amber: '#f59e0b', red: '#ef4444', purple: '#7c3aed',
}

const AUDIENCE_CARDS = [
  { icon: <UserCircle size={22} />, title: 'Patients', desc: 'Own your complete health record. Access labs, medications, appointments, and your care team from anywhere.', gradient: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', accent: COLORS.green },
  { icon: <Stethoscope size={22} />, title: 'Doctors', desc: 'Reason faster with AI-assisted clinical reasoning. Structured history, differential diagnosis, and evidence-based decision support.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: COLORS.sky },
  { icon: <Heart size={22} />, title: 'Nurses', desc: 'Coordinate care with intuitive triage, vitals, medication administration, task management, and handover tools.', gradient: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', accent: '#ec4899' },
  { icon: <Building size={22} />, title: 'Hospitals', desc: 'Operate intelligently with bed management, scheduling, billing, inventory, and real-time operational dashboards.', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', accent: COLORS.purple },
  { icon: <MapPin size={22} />, title: 'Clinics', desc: 'Streamline outpatient care — scheduling, patient flow, e-prescribing, and integrated lab and pharmacy.', gradient: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', accent: '#f97316' },
  { icon: <GraduationCap size={22} />, title: 'Medical Schools', desc: 'Train on a real clinical system. Case-based learning, OSCE tools, simulations, and CPD tracking.', gradient: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', accent: COLORS.amber },
  { icon: <Microscope size={22} />, title: 'Researchers', desc: 'Discover knowledge from de-identified clinical data. Cohort builder, registries, trials, and population analytics.', gradient: 'linear-gradient(135deg,#ECFEFF,#CFFAFE)', accent: '#06b6d4' },
  { icon: <FlaskConical size={22} />, title: 'Laboratories', desc: 'End-to-end lab management — order entry, specimen tracking, result validation, auto-reporting, and QCs.', gradient: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', accent: '#16a34a' },
  { icon: <Scan size={22} />, title: 'Radiology Centers', desc: 'DICOM image management, structured reporting, clinical correlation, and AI-assisted reading workflows.', gradient: 'linear-gradient(135deg,#F4F4F5,#E4E4E7)', accent: '#52525b' },
  { icon: <Pill size={22} />, title: 'Pharmacies', desc: 'Prescription verification, dispensing, interaction checks, inventory, and medication therapy management.', gradient: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)', accent: '#e11d48' },
  { icon: <Globe size={22} />, title: 'Governments', desc: 'Population health monitoring, disease surveillance, national registries, and evidence-based policy making.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: COLORS.sky },
  { icon: <Shield size={22} />, title: 'Insurance', desc: 'Real-time claims integration, utilization review, risk adjustment, and population health analytics.', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', accent: COLORS.purple },
  { icon: <Heart size={22} />, title: 'NGOs & CHWs', desc: 'Community health programs, mobile clinics, field data collection, and population health management.', gradient: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', accent: COLORS.green },
  { icon: <Video size={22} />, title: 'Telemedicine', desc: 'Virtual consultations, remote patient monitoring, e-prescriptions, and integrated follow-up care.', gradient: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)', accent: '#db2777' },
  { icon: <ShoppingBag size={22} />, title: 'Medical Suppliers', desc: 'Healthcare commerce — order medical devices, supplies, and pharmaceuticals through the AMEXAN Marketplace.', gradient: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', accent: COLORS.amber },
  { icon: <Code size={22} />, title: 'Developers', desc: 'Build on AMEXAN with open APIs, FHIR R4, SDKs, webhooks, and a plugin framework.', gradient: 'linear-gradient(135deg,#F4F4F5,#E4E4E7)', accent: '#18181b' },
  { icon: <Brain size={22} />, title: 'AI Companies', desc: 'Integrate medical AI models securely. Access de-identified data for training and validation.', gradient: 'linear-gradient(135deg,#F0F9FF,#E0F2FE)', accent: '#0284c7' },
  { icon: <Airplay size={22} />, title: 'Flying Doctors', desc: 'Remote emergency coordination, tele-consultation, and medical evacuation logistics.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: COLORS.sky },
]

const ECOSYSTEM_NODES = [
  { label: 'Patient', icon: <UserCircle size={18} />, x: 50, y: 5, color: COLORS.green },
  { label: 'Clinic', icon: <MapPin size={18} />, x: 15, y: 20, color: COLORS.amber },
  { label: 'Hospital', icon: <Building size={18} />, x: 85, y: 20, color: COLORS.sky },
  { label: 'Laboratory', icon: <FlaskConical size={18} />, x: 10, y: 40, color: '#06b6d4' },
  { label: 'Radiology', icon: <Scan size={18} />, x: 90, y: 40, color: '#52525b' },
  { label: 'Pharmacy', icon: <Pill size={18} />, x: 30, y: 55, color: '#e11d48' },
  { label: 'Telemedicine', icon: <Video size={18} />, x: 70, y: 55, color: '#db2777' },
  { label: 'Insurance', icon: <Shield size={18} />, x: 5, y: 70, color: COLORS.purple },
  { label: 'Government', icon: <Globe size={18} />, x: 50, y: 75, color: COLORS.sky },
  { label: 'Research', icon: <Microscope size={18} />, x: 95, y: 70, color: '#06b6d4' },
  { label: 'Education', icon: <GraduationCap size={18} />, x: 20, y: 88, color: COLORS.amber },
  { label: 'Marketplace', icon: <Grid size={18} />, x: 80, y: 88, color: '#f97316' },
]

const PHILOSOPHY = [
  { icon: <UserCircle size={24} />, title: 'One Patient', subtitle: 'Not many records', desc: 'Every patient has a single lifelong record across every encounter, facility, and care setting.' },
  { icon: <FileText size={24} />, title: 'One Encounter', subtitle: 'Not many forms', desc: 'A single structured encounter captures history, exam, investigations, diagnosis, and treatment plan.' },
  { icon: <Clock size={24} />, title: 'One Timeline', subtitle: 'Not scattered visits', desc: 'Every interaction — clinical, lab, pharmacy, telemedicine — exists on a unified longitudinal timeline.' },
  { icon: <Brain size={24} />, title: 'One Clinical Brain', subtitle: 'Connected intelligence', desc: 'Clinical reasoning, knowledge graph, and decision support — all powered by a shared intelligence engine.' },
  { icon: <LinkIcon size={24} />, title: 'One Ecosystem', subtitle: 'Not disconnected systems', desc: 'Hospitals, labs, pharmacies, insurers, governments — connected through one interoperable platform.' },
]

const CARE_FLOW = [
  { step: '1', label: 'Patient Arrives', icon: <UserCircle size={20} />, desc: 'Walk-in, appointment, telemedicine, or referral' },
  { step: '2', label: 'Registration', icon: <ClipboardList size={20} />, desc: 'Identity verified, demographics captured, record created or retrieved' },
  { step: '3', label: 'Triage', icon: <Activity size={20} />, desc: 'Vitals, acuity assessment, and priority assignment' },
  { step: '4', label: 'History & Exam', icon: <Stethoscope size={20} />, desc: 'Structured SOCRATES history with guided physical examination' },
  { step: '5', label: 'Clinical Reasoning', icon: <Brain size={20} />, desc: 'AI-assisted differential diagnosis with evidence scoring' },
  { step: '6', label: 'Investigations', icon: <FlaskConical size={20} />, desc: 'Lab orders, imaging requests, results auto-import' },
  { step: '7', label: 'Diagnosis', icon: <FileText size={20} />, desc: 'Final diagnosis with ICD-11 coding and problem list' },
  { step: '8', label: 'Treatment', icon: <Pill size={20} />, desc: 'Medications, procedures, therapy — with safety checks' },
  { step: '9', label: 'Monitoring', icon: <Activity size={20} />, desc: 'Vitals, early warning scores, and outcome tracking' },
  { step: '10', label: 'Discharge', icon: <Check size={20} />, desc: 'Summary, prescriptions, follow-up plan, and patient education' },
  { step: '11', label: 'Follow-up', icon: <RefreshCw size={20} />, desc: 'Telemedicine, home care, vitals monitoring, adherence tracking' },
  { step: '12', label: 'Lifetime Care', icon: <Heart size={20} />, desc: 'Longitudinal record — one patient, one timeline, forever' },
]

const PLATFORM_PRINCIPLES = [
  { icon: <Lock size={20} />, title: 'Evidence First', desc: 'Every recommendation explainable, every decision traceable, every source verifiable.' },
  { icon: <Brain size={20} />, title: 'Clinical Intelligence', desc: 'AI assists. Doctors decide. Reasoning remains transparent. Nothing hidden.' },
  { icon: <BookOpen size={20} />, title: 'Knowledge Never Stops', desc: 'Every encounter teaches. Every case improves the system. Education inside care.' },
  { icon: <LinkIcon size={20} />, title: 'Interoperable by Default', desc: 'FHIR R4, SNOMED CT, LOINC, ICD-11, DICOM — connected out of the box.' },
  { icon: <Globe size={20} />, title: 'Designed for Africa', desc: 'Built for the realities of African healthcare. Adaptable to every country worldwide.' },
  { icon: <Shield size={20} />, title: 'Trust Through Transparency', desc: 'Audit trails, versioned knowledge, and clinical governance at every layer.' },
]

const GLOBAL_REACH = [
  { country: 'Kenya', flag: '🇰🇪', desc: 'National referral hospitals, county facilities, and rural clinics' },
  { country: 'Uganda', flag: '🇺🇬', desc: 'Regional referral hospitals and community health programs' },
  { country: 'Tanzania', flag: '🇹🇿', desc: 'Teaching hospitals and district health systems' },
  { country: 'Rwanda', flag: '🇷🇼', desc: 'National health system integration' },
  { country: 'Nigeria', flag: '🇳🇬', desc: 'Private and public hospital networks' },
  { country: 'Ethiopia', flag: '🇪🇹', desc: 'Academic medical centers' },
  { country: 'South Africa', flag: '🇿🇦', desc: 'Private hospital groups' },
  { country: 'Global', flag: '🌍', desc: 'WHO standards, international collaboration' },
]

const LIFECYCLE = [
  { age: 'Newborn', icon: <Dna size={18} />, color: '#06b6d4', items: ['Birth registration', 'Immunization tracking', 'Growth monitoring', 'Newborn screening'] },
  { age: 'Child', icon: <Heart size={18} />, color: '#22c55e', items: ['Well-child visits', 'Vaccination records', 'Developmental screening', 'School health'] },
  { age: 'Adolescent', icon: <Users size={18} />, color: '#f97316', items: ['Adolescent health', 'Mental health', 'Sexual health', 'Sports medicine'] },
  { age: 'Adult', icon: <UserCircle size={18} />, color: COLORS.sky, items: ['Primary care', 'Chronic disease', 'Maternal health', 'Occupational health'] },
  { age: 'Elderly', icon: <Heart size={18} />, color: COLORS.purple, items: ['Geriatric care', 'Polypharmacy', 'Palliative care', 'Care coordination'] },
]

function Airplay(props: { size?: number | string }) { return <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg> }

export default function Home() {
  const vc = useViewportClass()
  const mobile = isMobileViewport(vc)
  const [scrolled, setScrolled] = useState(false)
  const [activeEco, setActiveEco] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const Section = ({ children, dark, id, style: extraStyle }: { children: React.ReactNode; dark?: boolean; id?: string; style?: React.CSSProperties }) => (
    <section id={id} style={{
      padding: mobile ? '48px 20px' : '80px 40px',
      background: dark ? 'var(--surface-elevated)' : 'transparent',
      borderTop: dark ? '1px solid var(--surface-border)' : 'none',
      borderBottom: dark ? '1px solid var(--surface-border)' : 'none',
      ...extraStyle,
    }}>{children}</section>
  )

  const SectionTitle = ({ tag, title, subtitle }: { tag?: string; title: string; subtitle?: string }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 48, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      {tag && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: COLORS.skyLight, color: COLORS.sky, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>{tag}</div>}
      <h2 style={{ fontSize: mobile ? 24 : 36, fontWeight: 700, color: 'var(--sky-800)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>{subtitle}</p>}
    </motion.div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-card)', fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif", color: 'var(--text-primary)', WebkitFontSmoothing: 'antialiased' }}>

      <Header scrolled={scrolled} />

      {/* ═══════════ HERO ═══════════ */}
      <Section style={{ paddingTop: 136, paddingBottom: mobile ? 40 : 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: COLORS.skyLight, color: COLORS.sky, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>
                <Brain size={14} /> Healthcare Intelligence Platform
              </div>
              <h1 style={{ fontSize: mobile ? 32 : 48, fontWeight: 800, color: 'var(--sky-800)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16 }}>
                The Healthcare{' '}
                <span style={{ color: COLORS.sky }}>Operating System</span>
              </h1>
              <p style={{ fontSize: mobile ? 14 : 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 540 }}>
                Connecting patients, clinicians, hospitals, laboratories, pharmacies, insurers, governments, educators, researchers, and innovators — through one intelligent platform.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/register" style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: COLORS.sky, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Get Started <ArrowRight size={16} />
                </Link>
                <a href="#" style={{ padding: '12px 28px', borderRadius: 10, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Play size={16} /> Watch Overview
                </a>
                <a href="#" style={{ padding: '12px 28px', borderRadius: 10, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Book Demo
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <div style={{ background: 'var(--sky-800)', borderRadius: 20, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.sky }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>CLINICAL WORKFLOW</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {JOURNEY_STEPS.slice(0, 8).map((step, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }} style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.sky, boxShadow: `0 0 10px ${COLORS.sky}` }} />
                      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{step.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 4 }}>
                  {JOURNEY_STEPS.slice(8, 12).map((step, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.6 + i * 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 8, fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{step.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Live — Connecting the healthcare ecosystem</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════ WHO IT'S FOR ═══════════ */}
      <Section dark id="who">
        <SectionTitle tag="ECOSYSTEM" title="Built for Every Part of Healthcare" subtitle="Patients, clinicians, hospitals, governments, researchers, educators, developers — if you are in healthcare, AMEXAN was built for you." />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {AUDIENCE_CARDS.map((a, i) => (
            <motion.div key={a.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.03 }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
              style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 16, padding: 20, cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: a.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent }}>{a.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)', margin: 0 }}>{a.title}</h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ ECOSYSTEM MAP ═══════════ */}
      <Section id="ecosystem">
        <SectionTitle tag="THE ECOSYSTEM" title="One Connected Healthcare Network" subtitle="Every entity connected. Every interaction shared. Every patient at the center." />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', height: mobile ? 400 : 500 }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
            {ECOSYSTEM_NODES.map((a, i) => ECOSYSTEM_NODES.slice(i + 1).map((b, j) => {
              const dx = b.x - a.x; const dy = b.y - a.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 40) return null;
              return <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--surface-border)" strokeWidth="0.3" />;
            }))}
            <line x1={50} y1={5} x2={50} y2={75} stroke={COLORS.sky} strokeWidth="0.4" strokeDasharray="2,2" opacity="0.3" />
          </svg>
          {ECOSYSTEM_NODES.map((node, i) => (
            <motion.div key={node.label} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
              onMouseEnter={() => setActiveEco(i)} onMouseLeave={() => setActiveEco(null)}
              style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', zIndex: activeEco === i ? 10 : 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: activeEco === i ? node.color : COLORS.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeEco === i ? '#fff' : node.color, transition: 'all 0.2s', border: `2px solid ${activeEco === i ? node.color : 'transparent'}`, boxShadow: activeEco === i ? `0 0 20px ${node.color}40` : 'none' }}>
                {node.icon}
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: activeEco === i ? node.color : 'var(--text-muted)', background: activeEco === i ? 'var(--surface-card)' : 'transparent', padding: '1px 6px', borderRadius: 4, transition: 'all 0.2s' }}>{node.label}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ PHILOSOPHY ═══════════ */}
      <Section dark>
        <SectionTitle tag="OUR CONSTITUTION" title="One Patient. One Platform. One Ecosystem." subtitle="Five principles that guide everything we build." />
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          {PHILOSOPHY.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.08 }}
              style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ color: COLORS.sky }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sky-800)' }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.sky, fontWeight: 500 }}>{p.subtitle}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ PRODUCTS ═══════════ */}
      <Section id="products">
        <SectionTitle tag="PRODUCTS" title="The AMEXAN Ecosystem" subtitle="Every product built on the same clinical intelligence platform. Connected. Consistent. Comprehensive." />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {PRODUCTS.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
              style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 20, overflow: 'hidden', cursor: 'default' }}>
              <div style={{ height: 4, background: p.gradient }} />
              <div style={{ padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 16 }}>{p.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ CLINICAL INTELLIGENCE ═══════════ */}
      <Section dark id="intelligence">
        <SectionTitle tag="CLINICAL INTELLIGENCE" title="Clinical Intelligence, Not Just AI" subtitle="Built on a knowledge graph of clinical concepts, relationships, and evidence. AI assists. Doctors decide. Nothing hidden." />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {ENGINES.map((e, i) => (
            <motion.div key={e.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.03 }}
              style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ color: COLORS.sky }}>{e.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sky-800)' }}>{e.name}</div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{e.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ PATIENT JOURNEY / LIFETIME CARE ═══════════ */}
      <Section id="care-flow">
        <SectionTitle tag="HOW CARE FLOWS" title="The Complete Patient Journey" subtitle="From first encounter to lifelong care. One continuous, connected experience." />
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {CARE_FLOW.map((f, i) => (
            <motion.div key={f.step} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: COLORS.skyLight, color: COLORS.sky, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.step}</div>
              <div style={{ color: COLORS.sky, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{f.label}</div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ LIFECYCLE ═══════════ */}
      <Section dark id="lifelong">
        <SectionTitle tag="LIFELONG CARE" title="One Patient, One Life, One Record" subtitle="From newborn screening to geriatric care and palliative support. AMEXAN remembers patients forever." />
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 8, flexWrap: 'wrap' }}>
            {LIFECYCLE.map((phase, i) => (
              <motion.div key={phase.age} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.1 }}
                style={{ flex: 1, minWidth: mobile ? '100%' : 0, textAlign: 'center', padding: '16px 8px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${phase.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: phase.color, margin: '0 auto 8px' }}>{phase.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 8 }}>{phase.age}</div>
                {phase.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)', padding: '2px 0' }}>
                    <Check size={10} style={{ color: phase.color, flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ PLATFORM PRINCIPLES ═══════════ */}
      <Section id="principles">
        <SectionTitle tag="PLATFORM PRINCIPLES" title="How We Build Healthcare Technology" subtitle="Transparency, intelligence, interoperability, and trust — baked into every layer of the platform." />
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          {PLATFORM_PRINCIPLES.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.06 }}
              style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 14, padding: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.sky, marginBottom: 12 }}>
                {p.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 6 }}>{p.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ STANDARDS & SECURITY ═══════════ */}
      <Section dark id="standards">
        <SectionTitle tag="STANDARDS & SECURITY" title="Healthcare-Grade. Every Layer." subtitle="Built on international healthcare standards. Encrypted. Audited. Compliant. Open." />
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {STANDARDS.slice(0, 20).map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}
              style={{ padding: '6px 14px', borderRadius: 100, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {s.name}
            </motion.div>
          ))}
        </div>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {['AES-256 Encryption', 'TLS 1.3', 'SOC 2 Controls', 'HIPAA Alignment', 'GDPR Compliant', 'RBAC', 'Audit Trail', 'Disaster Recovery', '99.95% Uptime SLA'].map((item, i) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', fontSize: 12, color: 'var(--text-primary)' }}>
              <Shield size={14} style={{ color: COLORS.green }} /> {item}
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════ GLOBAL REACH ═══════════ */}
      <Section id="global">
        <SectionTitle tag="GLOBAL REACH" title="Designed for Africa. Built for the World." subtitle="One platform. Many countries. Localized protocols, formularies, guidelines, and compliance." />
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {GLOBAL_REACH.map((g, i) => (
            <motion.div key={g.country} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{g.flag}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 4 }}>{g.country}</div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{g.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ MARKETPLACE ═══════════ */}
      <Section dark id="marketplace">
        <SectionTitle tag="MARKETPLACE" title="An Ecosystem of Apps, Plugins &amp; Integrations" subtitle="Extend AMEXAN with certified plugins, regional modules, AI models, and FHIR apps from the community." />
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          {MARKETPLACE_ITEMS.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.sky, flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 2 }}>{m.title}</div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ DEVELOPER PLATFORM ═══════════ */}
      <Section id="developers">
        <SectionTitle tag="DEVELOPER PLATFORM" title="Build on AMEXAN" subtitle="Open APIs, FHIR R4, SDKs, webhooks, and a plugin framework. Healthcare interoperability, made simple." />
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { icon: <Code size={20} />, title: 'REST & GraphQL APIs', desc: 'Comprehensive APIs for every platform capability. Full CRUD, search, and real-time subscriptions.' },
            { icon: <LinkIcon size={20} />, title: 'FHIR R4 Compliant', desc: 'SMART on FHIR, FHIRcast, and Bulk Data Access for seamless EHR integration.' },
            { icon: <Zap size={20} />, title: 'Webhook Engine', desc: 'Real-time event notifications for patient updates, orders, results, and clinical alerts.' },
            { icon: <Grid size={20} />, title: 'Plugin Framework', desc: 'Build custom modules, clinical protocols, and regional adaptations with our plugin SDK.' },
            { icon: <FileText size={20} />, title: 'SDKs & Libraries', desc: 'Client libraries for JavaScript, Python, Swift, Kotlin, and more — with full documentation.' },
            { icon: <Shield size={20} />, title: 'Secure Sandbox', desc: 'Test your integrations in a HIPAA-aligned sandbox with realistic synthetic data.' },
          ].map((d, i) => (
            <motion.div key={d.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', gap: 14, padding: 20, background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 14 }}>
              <div style={{ color: COLORS.sky, flexShrink: 0, marginTop: 2 }}>{d.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{d.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <Section dark id="testimonials">
        <SectionTitle tag="TRUSTED BY HEALTHCARE LEADERS" title="What Healthcare Professionals Say" subtitle="From doctors and nurses to ministers and CEOs — hear from the people who use AMEXAN every day." />
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 16, padding: 20 }}>
              <div style={{ color: COLORS.amber, fontSize: 12, marginBottom: 8 }}>{'⭐'.repeat(5)}</div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.sky, fontSize: 12, fontWeight: 600 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ CTA ═══════════ */}
      <Section style={{ background: 'var(--sky-800)', textAlign: 'center', padding: mobile ? '48px 20px' : '80px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>🏥</div>
          <h2 style={{ fontSize: mobile ? 24 : 36, fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 12 }}>
            Ready to Connect Your Healthcare Ecosystem?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 32 }}>
            Join the growing network of hospitals, clinics, laboratories, pharmacies, and healthcare organizations using AMEXAN to deliver connected, intelligent care.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: '#fff', color: 'var(--sky-800)', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <a href="#" style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Play size={16} /> Book a Demo
            </a>
          </div>
        </motion.div>
      </Section>

      <Footer />
    </div>
  )
}
