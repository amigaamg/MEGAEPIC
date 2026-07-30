'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Play, Check, Brain, Stethoscope, Heart, Building,
  Users, Globe, GraduationCap, Shield, Activity, Microscope, BookOpen,
  FlaskConical, Scan, Pill, ClipboardList, FileText, Database, BarChart3,
  Lock, Server, MessageSquare,
  MapPin, Smartphone, UserCircle, BookMarked, Target, Dna, Rocket,
  Menu, X, Code, Grid, Video, Zap, LinkIcon,
  Settings, GitMerge, Clock, RefreshCw, Headphones, ShoppingBag,
  Airplay, Package, AppWindow, Monitor, DollarSign,
  Award, Star, Mail, Share2, Eye,
  Cloud, Upload, LifeBuoy,
  Sparkles, ChevronRight, Calendar
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { PRODUCTS, ENGINES, STANDARDS, MARKETPLACE_ITEMS, TESTIMONIALS } from '@/components/landing/config'
import './_shared/responsive.css'

const C = {
  sky: '#2F80ED', skySoft: '#60a5fa', skyLight: 'rgba(47,128,237,0.1)',
  white: '#fff', panel: '#f8fafc', border: '#e2e8f0',
  navy: '#1e3a8a', text: '#0f172a', textLight: '#475569', textMuted: '#94a3b8',
  green: '#22c55e', amber: '#f59e0b', red: '#ef4444', purple: '#7c3aed',
  orange: '#f97316',
}

const AUDIENCE = [
  { href: '#', icon: <UserCircle size={22} />, title: 'Patients', desc: 'Own your health. Access records, labs, medications, appointments, and your care team from anywhere.', gradient: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', accent: C.green },
  { href: '#', icon: <Stethoscope size={22} />, title: 'Doctors', desc: 'Reason faster with AI-assisted clinical reasoning, structured history, differential diagnosis, and evidence-based decisions.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: C.sky },
  { href: '#', icon: <Heart size={22} />, title: 'Nurses', desc: 'Coordinate care with intuitive triage, vitals, med admin, task management, and structured handovers.', gradient: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', accent: '#ec4899' },
  { href: '#', icon: <Building size={22} />, title: 'Hospitals', desc: 'Operate intelligently with bed management, scheduling, billing, inventory, and real-time operational dashboards.', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', accent: C.purple },
  { href: '#', icon: <MapPin size={22} />, title: 'Clinics', desc: 'Streamline outpatient care with scheduling, patient flow, e-prescribing, and integrated lab and pharmacy.', gradient: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', accent: C.orange },
  { href: '#', icon: <GraduationCap size={22} />, title: 'Medical Schools', desc: 'Train on a real clinical system with case-based learning, simulations, OSCE tools, and CPD tracking.', gradient: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', accent: C.amber },
  { href: '#', icon: <Microscope size={22} />, title: 'Researchers', desc: 'Discover from de-identified data with cohort builder, registries, trial management, and population analytics.', gradient: 'linear-gradient(135deg,#ECFEFF,#CFFAFE)', accent: '#06b6d4' },
  { href: '#', icon: <Shield size={22} />, title: 'Governments', desc: 'Monitor population health, disease surveillance, national registries, and evidence-based policy making.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: C.sky },
  { href: '#', icon: <DollarSign size={22} />, title: 'Insurance', desc: 'Real-time claims integration, utilization review, risk adjustment, and population health analytics.', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', accent: C.purple },
  { href: '#', icon: <FlaskConical size={22} />, title: 'Laboratories', desc: 'End-to-end lab management with order entry, specimen tracking, result validation, and auto-reporting.', gradient: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', accent: '#16a34a' },
  { href: '#', icon: <Scan size={22} />, title: 'Radiology', desc: 'DICOM image management, structured reporting, clinical correlation, and AI-assisted reading workflows.', gradient: 'linear-gradient(135deg,#F4F4F5,#E4E4E7)', accent: '#52525b' },
  { href: '#', icon: <Pill size={22} />, title: 'Pharmacies', desc: 'Prescription verification, dispensing, interaction checks, inventory, and medication therapy management.', gradient: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)', accent: '#e11d48' },
  { href: '#', icon: <Heart size={22} />, title: 'NGOs & CHWs', desc: 'Community health programs, mobile clinics, field data collection, and population health management.', gradient: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', accent: C.green },
  { href: '#', icon: <Video size={22} />, title: 'Telemedicine', desc: 'Virtual consultations, remote monitoring, e-prescriptions, and integrated follow-up care.', gradient: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)', accent: '#db2777' },
  { href: '#', icon: <ShoppingBag size={22} />, title: 'Medical Suppliers', desc: 'Healthcare commerce for medical devices, supplies, and pharmaceuticals through the marketplace.', gradient: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', accent: C.amber },
  { href: '#', icon: <Airplay size={22} />, title: 'Flying Doctors', desc: 'Remote emergency coordination, tele-consultation, and medical evacuation logistics.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', accent: C.sky },
  { href: '#', icon: <Code size={22} />, title: 'Developers', desc: 'Build on AMEXAN with open APIs, FHIR R4, SDKs, webhooks, and a plugin framework.', gradient: 'linear-gradient(135deg,#F4F4F5,#E4E4E7)', accent: '#18181b' },
  { href: '#', icon: <Brain size={22} />, title: 'AI Companies', desc: 'Integrate medical AI models securely with access to de-identified data for training and validation.', gradient: 'linear-gradient(135deg,#F0F9FF,#E0F2FE)', accent: '#0284c7' },
]

const ECO_NODES = [
  { label: 'Patient', icon: <UserCircle size={14} />, color: C.green },
  { label: 'Clinic', icon: <MapPin size={14} />, color: C.amber },
  { label: 'Hospital', icon: <Building size={14} />, color: C.sky },
  { label: 'Laboratory', icon: <FlaskConical size={14} />, color: '#06b6d4' },
  { label: 'Radiology', icon: <Scan size={14} />, color: '#52525b' },
  { label: 'Pharmacy', icon: <Pill size={14} />, color: '#e11d48' },
  { label: 'Telemedicine', icon: <Video size={14} />, color: '#db2777' },
  { label: 'Insurance', icon: <Shield size={14} />, color: C.purple },
  { label: 'Government', icon: <Globe size={14} />, color: C.sky },
  { label: 'Research', icon: <Microscope size={14} />, color: '#06b6d4' },
  { label: 'Education', icon: <GraduationCap size={14} />, color: C.amber },
  { label: 'Analytics', icon: <BarChart3 size={14} />, color: C.orange },
  { label: 'Marketplace', icon: <Grid size={14} />, color: '#e74c3c' },
  { label: 'Back to Patient', icon: <RefreshCw size={14} />, color: C.green },
]

const PHILOSOPHY = [
  { icon: <UserCircle size={24} />, title: 'One Patient', sub: 'One Record — Anywhere, Anytime', desc: 'Every patient has a single lifelong record across every encounter, facility, and care setting.' },
  { icon: <Brain size={24} />, title: 'One Clinical Brain', sub: 'Shared safely', desc: 'Clinical reasoning, knowledge graph, and decision support powered by a shared intelligence engine.' },
  { icon: <Lock size={24} />, title: 'Evidence First', sub: 'Every recommendation explainable', desc: 'Every clinical suggestion traceable to source evidence. Nothing hidden. Nothing assumed.' },
  { icon: <BookOpen size={24} />, title: 'Knowledge Never Stops', sub: 'Every encounter teaches', desc: 'Every case improves the system. Education inside care. Learning that scales.' },
  { icon: <LinkIcon size={24} />, title: 'Interoperable', sub: 'FHIR · DICOM · SNOMED · LOINC · ICD', desc: 'Open standards out of the box. No lock-in. Connected to the global health ecosystem.' },
  { icon: <Globe size={24} />, title: 'Designed for Africa', sub: 'Built for the World', desc: 'Localized protocols, formularies, languages, and compliance — adaptable to every country.' },
]

const CARE_FLOW = [
  { step: '1', label: 'Patient Arrives', icon: <UserCircle size={18} />, desc: 'Walk-in, appointment, telemedicine, or referral' },
  { step: '2', label: 'Registration', icon: <ClipboardList size={18} />, desc: 'Identity verified, record created or retrieved' },
  { step: '3', label: 'Triage', icon: <Activity size={18} />, desc: 'Vitals, acuity assessment, priority assignment' },
  { step: '4', label: 'History & Exam', icon: <Stethoscope size={18} />, desc: 'Structured SOCRATES with guided exam' },
  { step: '5', label: 'Clinical Reasoning', icon: <Brain size={18} />, desc: 'AI-assisted DDx with evidence scoring' },
  { step: '6', label: 'Investigations', icon: <FlaskConical size={18} />, desc: 'Lab and imaging orders, results auto-import' },
  { step: '7', label: 'Diagnosis', icon: <FileText size={18} />, desc: 'Final diagnosis with ICD-11 coding' },
  { step: '8', label: 'Treatment', icon: <Pill size={18} />, desc: 'Medications, procedures, therapy with checks' },
  { step: '9', label: 'Monitoring', icon: <Activity size={18} />, desc: 'Vitals, early warning scores, outcomes' },
  { step: '10', label: 'Discharge', icon: <Check size={18} />, desc: 'Summary, prescriptions, follow-up plan' },
  { step: '11', label: 'Follow-up', icon: <RefreshCw size={18} />, desc: 'Telemedicine, home care, adherence' },
  { step: '12', label: 'Lifetime Care', icon: <Heart size={18} />, desc: 'One patient, one timeline, forever' },
]

const PATIENT_JOURNEY = [
  { step: '01', label: 'Symptoms', icon: <Activity size={18} />, desc: 'Recognize symptoms, triage guidance, find care' },
  { step: '02', label: 'Appointment', icon: <Calendar size={18} />, desc: 'Book in-person or telemedicine visit' },
  { step: '03', label: 'Telemedicine', icon: <Video size={18} />, desc: 'Virtual consultation from anywhere' },
  { step: '04', label: 'Hospital', icon: <Building size={18} />, desc: 'In-patient care, procedures, surgery' },
  { step: '05', label: 'Recovery', icon: <Heart size={18} />, desc: 'Follow care plan, track vitals, progress' },
  { step: '06', label: 'Medication', icon: <Pill size={18} />, desc: 'Prescriptions, adherence tracking, refills' },
  { step: '07', label: 'Education', icon: <BookOpen size={18} />, desc: 'Learn about condition, lifestyle, prevention' },
  { step: '08', label: 'Monitoring', icon: <Activity size={18} />, desc: 'Ongoing vitals, labs, symptom tracking' },
  { step: '09', label: 'Community', icon: <Users size={18} />, desc: 'Support groups, community health, wellness' },
  { step: '10', label: 'Lifetime Record', icon: <Database size={18} />, desc: 'Complete health history, always accessible' },
]

const ORG_JOURNEY = [
  { step: '01', label: 'Book Demo', icon: <Eye size={18} />, desc: 'Learn about AMEXAN ecosystem and capabilities' },
  { step: '02', label: 'Needs Assessment', icon: <ClipboardList size={18} />, desc: 'Evaluate workflows, gaps, and requirements' },
  { step: '03', label: 'Configuration', icon: <Settings size={18} />, desc: 'Customize protocols, roles, and workflows' },
  { step: '04', label: 'Migration', icon: <Upload size={18} />, desc: 'Secure data migration from existing systems' },
  { step: '05', label: 'Integration', icon: <LinkIcon size={18} />, desc: 'Connect labs, imaging, pharmacy, billing' },
  { step: '06', label: 'Training', icon: <GraduationCap size={18} />, desc: 'Staff training on role-specific workspaces' },
  { step: '07', label: 'Go Live', icon: <Rocket size={18} />, desc: 'Phased rollout with clinical supervision' },
  { step: '08', label: 'Support', icon: <Headphones size={18} />, desc: '24/7 support with clinical informatics team' },
  { step: '09', label: 'Optimization', icon: <BarChart3 size={18} />, desc: 'Analyze usage, outcomes, and efficiency' },
  { step: '10', label: 'Expansion', icon: <Globe size={18} />, desc: 'Scale across departments, facilities, regions' },
]

const COUNTRIES = [
  { country: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', desc: 'National referral hospitals, county facilities, rural clinics' },
  { country: 'Uganda', flag: '\u{1F1FA}\u{1F1EC}', desc: 'Regional referral hospitals and community health programs' },
  { country: 'Tanzania', flag: '\u{1F1F9}\u{1F1FF}', desc: 'Teaching hospitals and district health systems' },
  { country: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}', desc: 'National health system integration' },
  { country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', desc: 'Private and public hospital networks' },
  { country: 'UK', flag: '\u{1F1EC}\u{1F1E7}', desc: 'NHS integration, GP practices, private healthcare' },
  { country: 'USA', flag: '\u{1F1FA}\u{1F1F8}', desc: 'HIPAA-compliant, hospital networks, insurance' },
  { country: 'India', flag: '\u{1F1EE}\u{1F1F3}', desc: 'Large hospital groups, Ayushman Bharat, clinics' },
  { country: 'Global', flag: '\u{1F30D}', desc: 'WHO standards, international collaboration' },
]

const SECURITY_ITEMS = [
  'End-to-End Encryption', 'Audit Logging', 'Role-Based Access',
  'Patient Privacy', 'Data Integrity', 'High Availability',
  'Zero Trust', 'Disaster Recovery', 'Offline Mode',
]

const RESEARCH_ITEMS = [
  { icon: <FileText size={20} />, title: 'Clinical Registries', desc: 'Disease-specific registries with longitudinal data collection and outcomes tracking.' },
  { icon: <Users size={20} />, title: 'Cohort Builder', desc: 'Query de-identified data to build research cohorts with granular inclusion criteria.' },
  { icon: <Microscope size={20} />, title: 'Trial Management', desc: 'End-to-end clinical trial support from enrollment to data collection and analysis.' },
  { icon: <BarChart3 size={20} />, title: 'Population Analytics', desc: 'Epidemiological analysis, disease surveillance, and health system performance metrics.' },
  { icon: <Database size={20} />, title: 'De-identified Datasets', desc: 'Export de-identified clinical data for AI training, research, and publications.' },
  { icon: <BookMarked size={20} />, title: 'Publications', desc: 'AMEXAN-powered research publications across multiple therapeutic areas and regions.' },
]

const EDUCATION_ITEMS = [
  { icon: <BookOpen size={20} />, title: 'Case Reviews', desc: 'Review real de-identified clinical cases with AI-guided teaching points and feedback.' },
  { icon: <Brain size={20} />, title: 'Reasoning Replay', desc: 'Replay clinical reasoning pathways to understand diagnostic thinking and decision trees.' },
  { icon: <Users size={20} />, title: 'Virtual Patients', desc: 'Simulated patient encounters with dynamic responses and realistic clinical scenarios.' },
  { icon: <GraduationCap size={20} />, title: 'OSCE Preparation', desc: 'Structured objective structured clinical examination tools with standardized assessment.' },
  { icon: <ClipboardList size={20} />, title: 'Question Banks', desc: 'Curated clinical questions with evidence-based answers and performance analytics.' },
  { icon: <Sparkles size={20} />, title: 'AI Tutor', desc: 'Intelligent tutoring that adapts to learner level, identifies gaps, and reinforces knowledge.' },
]

const PARTNERS = [
  { name: 'WHO', desc: 'World Health Organization standards' },
  { name: 'Universities', desc: 'Medical schools and academic research' },
  { name: 'Hospitals', desc: 'National and regional referral networks' },
  { name: 'NGOs', desc: 'Community health and global health programs' },
  { name: 'Medical Boards', desc: 'Licensing and clinical governance' },
  { name: 'Research Centers', desc: 'Clinical trials and population health' },
  { name: 'HL7 FHIR', desc: 'Interoperability standards' },
  { name: 'OpenHIE', desc: 'Health information exchange' },
]

const RESOURCES = [
  { icon: <BookOpen size={20} />, title: 'Documentation', desc: 'Comprehensive guides and reference for all platform capabilities' },
  { icon: <Code size={20} />, title: 'Developer Portal', desc: 'APIs, SDKs, webhooks, and integration guides' },
  { icon: <FileText size={20} />, title: 'Clinical Library', desc: 'Evidence-based clinical content, protocols, and formularies' },
  { icon: <Video size={20} />, title: 'Video Library', desc: 'Product tours, clinical training, and expert webinars' },
  { icon: <Headphones size={20} />, title: 'Support Center', desc: '24/7 technical and clinical support' },
  { icon: <Users size={20} />, title: 'Community', desc: 'Forums, discussion groups, and user networks' },
]

const LIFECYCLE = [
  { age: 'Newborn', icon: <Dna size={18} />, color: '#06b6d4', items: ['Birth registration', 'Immunization tracking', 'Growth monitoring', 'Newborn screening'] },
  { age: 'Child', icon: <Heart size={18} />, color: '#22c55e', items: ['Well-child visits', 'Vaccination records', 'Developmental screening', 'School health'] },
  { age: 'Adolescent', icon: <Users size={18} />, color: C.orange, items: ['Adolescent health', 'Mental health', 'Sexual health', 'Sports medicine'] },
  { age: 'Adult', icon: <UserCircle size={18} />, color: C.sky, items: ['Primary care', 'Chronic disease', 'Maternal health', 'Occupational health'] },
  { age: 'Elderly', icon: <Heart size={18} />, color: C.purple, items: ['Geriatric care', 'Polypharmacy', 'Palliative care', 'Care coordination'] },
]

const careers = [
  { icon: <Target size={20} />, title: 'Mission', desc: 'Connect every part of healthcare through one intelligent platform.' },
  { icon: <Eye size={20} />, title: 'Vision', desc: 'A world where every patient, clinician, and health system is connected.' },
  { icon: <Users size={20} />, title: 'Culture', desc: 'Open, transparent, evidence-driven. Clinicians and engineers building together.' },
  { icon: <Microscope size={20} />, title: 'Research', desc: 'Advancing clinical AI, knowledge graphs, and healthcare interoperability.' },
  { icon: <Code size={20} />, title: 'Open Source', desc: 'Core platform components open for community contribution and audit.' },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [activeEco, setActiveEco] = useState(0)
  const [year, setYear] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setYear(String(new Date().getFullYear())) }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEco(p => (p + 1) % ECO_NODES.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  const Section = ({ children, dark, id, style: extraStyle }: { children: React.ReactNode; dark?: boolean; id?: string; style?: React.CSSProperties }) => (
    <section id={id} style={{
      padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 40px)',
      background: dark ? 'var(--surface-elevated)' : 'transparent',
      borderTop: dark ? '1px solid var(--surface-border)' : 'none',
      borderBottom: dark ? '1px solid var(--surface-border)' : 'none',
      ...extraStyle,
    }}>{children}</section>
  )

  const SectionTitle = ({ tag, title, subtitle }: { tag?: string; title: string; subtitle?: string }) => (
    <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      {tag && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>{tag}</div>}
      <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--sky-800)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 'clamp(13px, 3vw, 15px)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>{subtitle}</p>}
    </div>
  )

  const SectionTitleDark = ({ tag, title, subtitle }: { tag?: string; title: string; subtitle?: string }) => (
    <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      {tag && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: C.skySoft, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>{tag}</div>}
      <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 'clamp(13px, 3vw, 15px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>{subtitle}</p>}
    </div>
  )

  const cardHover = {
    transition: 'all 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--surface-card)',
      color: 'var(--text-primary)',
      WebkitFontSmoothing: 'antialiased',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", sans-serif',
      fontSize: 16,
      lineHeight: 1.5,
    }}>
      <Header scrolled={scrolled} />

      {/* ═══ L1 — HERO ═══ */}
      <Section style={{ paddingTop: 136, paddingBottom: 64 }}>
        <div className="l-hero-grid" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 12, fontWeight: 600, marginBottom: 20, letterSpacing: '0.03em' }}>
              <Brain size={14} /> The Healthcare Operating System
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, color: 'var(--sky-800)', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 12 }}>
              AMEXAN
            </h1>
            <p style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', color: C.text, lineHeight: 1.35, marginBottom: 16, fontWeight: 500 }}>
              One intelligent ecosystem connecting every part of healthcare.
            </p>
            <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 540 }}>
              Patients. Clinicians. Hospitals. Education. Research. Public Health. Artificial Intelligence.<br />
              One secure healthcare platform.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" className="touch-target" style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: C.sky, color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
                Explore Platform <ArrowRight size={18} />
              </Link>
              <a href="#" className="touch-target" style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
                <Play size={18} /> Watch 2-minute Overview
              </a>
              <a href="#" className="touch-target" style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
                Book Demo
              </a>
              <Link href="/register" className="touch-target" style={{ padding: '14px 28px', borderRadius: 10, border: 'none', background: C.green, color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
                Start Free
              </Link>
            </div>
          </motion.div>

          <motion.div className="l-hero-vis" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div style={{ background: 'var(--sky-800)', borderRadius: 20, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                {[C.sky, 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.15)'].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>ECOSYSTEM</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Patient', 'Clinic', 'Hospital', 'Laboratory', 'Radiology', 'Pharmacy', 'Insurance', 'Government', 'Research', 'Education'].map((label, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.sky }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{label}</span>
                    {i < 9 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Live — One connected healthcare ecosystem</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══ L2 — WHO IT'S FOR ═══ */}
      <Section dark id="who">
        <SectionTitle tag="ECOSYSTEM" title="Built for Every Part of Healthcare" subtitle="If you are in healthcare, AMEXAN was built for you." />
        <div className="l-grid-auto" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {AUDIENCE.map((a, i) => (
            <Link key={a.title} href={a.href} style={{ textDecoration: 'none' }}>
              <div onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                style={{ ...cardHover, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 16, padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: a.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent, flexShrink: 0 }}>{a.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)', margin: 0 }}>{a.title}</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ═══ L3 — ECOSYSTEM MAP ═══ */}
      <Section dark id="ecosystem" style={{ textAlign: 'center' }}>
        <SectionTitleDark tag="THE ECOSYSTEM" title="One Connected Healthcare Network" subtitle="Every entity connected. Every patient at the center. An infinite cycle of care." />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0 40px' }}>
          <svg viewBox="0 0 800 120" style={{ width: '100%', height: 120, overflow: 'visible' }}>
            {ECO_NODES.map((node, i) => {
              const x = 30 + (i * (740 / (ECO_NODES.length - 1)))
              const nextX = 30 + (((i + 1) % ECO_NODES.length) * (740 / (ECO_NODES.length - 1)))
              const isActiveSeg = (i === activeEco)
              return (
                <g key={node.label}>
                  <line x1={x + 28} y1={60} x2={nextX} y2={60} stroke={isActiveSeg ? node.color : 'var(--surface-border)'} strokeWidth={isActiveSeg ? 2.5 : 1} strokeLinecap="round" style={{ transition: 'all 0.5s ease' }} />
                  <circle cx={x + 28} cy={60} r={isActiveSeg ? 14 : 10} fill={isActiveSeg ? node.color : 'var(--surface-elevated)'} stroke={node.color} strokeWidth={isActiveSeg ? 3 : 1.5} style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setActiveEco(i)} />
                  <text x={x + 28} y={62} textAnchor="middle" fill={isActiveSeg ? '#fff' : node.color} fontSize={isActiveSeg ? 11 : 9} fontWeight="600" style={{ pointerEvents: 'none', transition: 'all 0.3s ease' }}>{node.label === 'Back to Patient' ? '\u221E' : node.label.charAt(0)}</text>
                </g>
              )
            })}
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: '50%', background: ECO_NODES[activeEco].color }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {ECO_NODES[activeEco].label === 'Back to Patient' ? 'Cycle continues — patient at center' : `-> ${ECO_NODES[(activeEco + 1) % ECO_NODES.length].label}`}
            </span>
          </div>
          <div className="l-flex-center" style={{ maxWidth: 800, margin: '24px auto 0' }}>
            {ECO_NODES.filter(n => n.label !== 'Back to Patient').map((node, i) => (
              <div key={node.label} onMouseEnter={() => setActiveEco(i)}
                style={{ ...cardHover, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: activeEco === i ? node.color : 'var(--surface-card)', border: `1px solid ${activeEco === i ? node.color : 'var(--surface-border)'}`, color: activeEco === i ? '#fff' : node.color, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {node.icon} {node.label}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ L4 — PRODUCTS ═══ */}
      <Section dark id="products">
        <SectionTitleDark tag="PRODUCTS" title="The AMEXAN Ecosystem" subtitle="Every product built on the same clinical intelligence platform. Connected. Consistent. Comprehensive." />
        <div className="l-grid-3" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {PRODUCTS.map((p, i) => (
            <div key={p.title} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              style={{ ...cardHover, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ height: 4, background: p.gradient }} />
              <div style={{ padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 16 }}>{p.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                <span style={{ fontSize: 13, color: C.sky, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Learn More <ArrowRight size={13} /></span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L5 — PLATFORM PRINCIPLES ═══ */}
      <Section id="principles">
        <SectionTitle tag="OUR CONSTITUTION" title="One Patient. One Platform. One Ecosystem." subtitle="Six principles that guide everything we build." />
        <div className="l-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {PHILOSOPHY.map((p, i) => (
            <div key={p.title} style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ color: C.sky, flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sky-800)' }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: C.sky, fontWeight: 500 }}>{p.sub}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L6 — CLINICAL INTELLIGENCE ═══ */}
      <Section dark id="intelligence">
        <SectionTitleDark tag="CLINICAL INTELLIGENCE" title="Clinical Intelligence, Not Just AI" subtitle="Built on a knowledge graph of clinical concepts, relationships, and evidence. AI assists. Doctors decide. Nothing hidden." />
        <div className="l-grid-4" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {ENGINES.map((e, i) => (
            <div key={e.name} style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ color: C.sky }}>{e.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)' }}>{e.name}</div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{e.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L7 — CLINICAL CARE FLOW ═══ */}
      <Section id="care-flow">
        <SectionTitle tag="HOW CARE FLOWS" title="The Clinical Journey" subtitle="From first encounter to lifelong care. One continuous, connected experience." />
        <div className="l-grid-4" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {CARE_FLOW.map((f, i) => (
            <div key={f.step} style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: C.skyLight, color: C.sky, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.step}</div>
              <div style={{ color: C.sky, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{f.label}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L8 — PATIENT JOURNEY ═══ */}
      <Section dark id="patient-journey">
        <SectionTitleDark tag="PATIENT JOURNEY" title="Your Health Journey. One Platform." subtitle="From symptoms to lifelong wellness. AMEXAN meets you where you are." />
        <div className="l-flex-center" style={{ maxWidth: 900, margin: '0 auto', gap: 6 }}>
          {PATIENT_JOURNEY.map((p, i) => (
            <div key={p.step} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: C.sky, fontSize: 11, fontWeight: 700 }}>{p.step}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{p.label}</span>
              {i < PATIENT_JOURNEY.length - 1 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />}
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L9 — ORGANIZATION JOURNEY ═══ */}
      <Section id="org-journey">
        <SectionTitle tag="ORGANIZATION JOURNEY" title="From Discovery to Expansion" subtitle="How healthcare organizations adopt and scale with AMEXAN." />
        <div className="l-grid-5" style={{ maxWidth: 900, margin: '0 auto' }}>
          {ORG_JOURNEY.map((o, i) => (
            <div key={o.step} style={{ textAlign: 'center', padding: 20, background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sky, margin: '0 auto 8px' }}>{o.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.sky, marginBottom: 4 }}>{o.step}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{o.label}</div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{o.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L10 — LIFECYCLE ═══ */}
      <Section dark id="lifelong">
        <SectionTitleDark tag="LIFELONG CARE" title="One Patient, One Life, One Record" subtitle="From newborn screening to geriatric care. AMEXAN remembers patients forever." />
        <div className="l-life-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
          {LIFECYCLE.map((phase, i) => (
            <div key={phase.age} style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 12 }}>
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
      </Section>

      {/* ═══ L11 — SECURITY ═══ */}
      <Section id="security">
        <SectionTitle tag="SECURITY" title="Healthcare-Grade. Every Layer." subtitle="Encrypted. Audited. Compliant. Open. Patient data protected by design." />
        <div className="l-flex-center" style={{ maxWidth: 800, margin: '0 auto', gap: 12 }}>
          {SECURITY_ITEMS.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', fontSize: 13, color: 'var(--text-primary)' }}>
              <Shield size={14} style={{ color: C.green, flexShrink: 0 }} /> {item}
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L12 — STANDARDS ═══ */}
      <Section dark id="standards">
        <SectionTitleDark tag="STANDARDS" title="Built on International Healthcare Standards" subtitle="Interoperability is not an afterthought. It is the foundation." />
        <div className="l-flex-center" style={{ maxWidth: 900, margin: '0 auto', gap: 8 }}>
          {STANDARDS.map((s, i) => (
            <div key={s.name} style={{ padding: '6px 14px', borderRadius: 100, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {s.name}
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L13 — COUNTRIES ═══ */}
      <Section id="global">
        <SectionTitle tag="GLOBAL REACH" title="Designed for Africa. Built for the World." subtitle="One platform. Many countries. Localized protocols, formularies, languages, and compliance." />
        <div className="l-grid-4" style={{ maxWidth: 900, margin: '0 auto' }}>
          {COUNTRIES.map((g, i) => (
            <div key={g.country} style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{g.flag}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 4 }}>{g.country}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{g.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L14 — RESEARCH ═══ */}
      <Section dark id="research">
        <SectionTitleDark tag="RESEARCH" title="Clinical Research Intelligence" subtitle="Discover knowledge from de-identified clinical data. Accelerate research across every therapeutic area." />
        <div className="l-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {RESEARCH_ITEMS.map((r, i) => (
            <div key={r.title} style={{ display: 'flex', gap: 14, padding: 16, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 12 }}>
              <div style={{ color: C.sky, flexShrink: 0, marginTop: 2 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{r.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L15 — EDUCATION ═══ */}
      <Section id="education">
        <SectionTitle tag="EDUCATION" title="Clinical Education Built Into Care" subtitle="Every encounter is a learning opportunity. Train the next generation of healthcare professionals." />
        <div className="l-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {EDUCATION_ITEMS.map((e, i) => (
            <div key={e.title} style={{ display: 'flex', gap: 14, padding: 16, background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 12 }}>
              <div style={{ color: C.amber, flexShrink: 0, marginTop: 2 }}>{e.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{e.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L16 — MARKETPLACE ═══ */}
      <Section dark id="marketplace">
        <SectionTitleDark tag="MARKETPLACE" title="Apps, Plugins & Integrations" subtitle="Extend AMEXAN with certified plugins, regional modules, AI models, and FHIR apps from the community." />
        <div className="l-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {MARKETPLACE_ITEMS.map((m, i) => (
            <div key={m.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sky, flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 2 }}>{m.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L17 — SUCCESS STORIES ═══ */}
      <Section id="testimonials">
        <SectionTitle tag="SUCCESS STORIES" title="Real Outcomes from Real Healthcare Teams" subtitle="Reduced documentation time. Fewer medication errors. Better follow-up. Improved chronic care." />
        <div className="l-grid-2col" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {TESTIMONIALS.slice(0, 6).map((t, i) => (
            <div key={t.name} style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 16, padding: 20 }}>
              <div style={{ color: C.amber, fontSize: 12, marginBottom: 8 }}>{'\u2B50'.repeat(5)}</div>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sky, fontSize: 12, fontWeight: 600 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sky-800)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L18 — PARTNERS ═══ */}
      <Section dark id="partners">
        <SectionTitleDark tag="PARTNERS" title="Backed by Global Standards Bodies" subtitle="AMEXAN aligns with international healthcare standards organizations." />
        <div className="l-flex-center" style={{ maxWidth: 800, margin: '0 auto', gap: 8 }}>
          {PARTNERS.map((p) => (
            <div key={p.name} style={{ padding: '10px 18px', borderRadius: 10, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L19 — RESOURCES ═══ */}
      <Section id="resources">
        <SectionTitle tag="RESOURCES" title="Everything You Need to Get Started" subtitle="Documentation, guides, community, and support — all in one place." />
        <div className="l-grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {RESOURCES.map((r, i) => (
            <div key={r.title} style={{ display: 'flex', gap: 14, padding: 20, background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: 14 }}>
              <div style={{ color: C.sky, flexShrink: 0, marginTop: 2 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--sky-800)', marginBottom: 4 }}>{r.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L19b — CAREERS ═══ */}
      <Section dark id="careers">
        <SectionTitleDark tag="CAREERS" title="Join Us in Building the Future of Healthcare" subtitle="Mission-driven. Open-source. Global impact." />
        <div className="l-grid-5" style={{ maxWidth: 900, margin: '0 auto' }}>
          {careers.map((c, i) => (
            <div key={c.title} style={{ textAlign: 'center', padding: 20, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sky, margin: '0 auto 10px' }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-800)', marginBottom: 6 }}>{c.title}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ L20 — CTA ═══ */}
      <Section style={{ background: 'var(--sky-800)', textAlign: 'center', padding: '64px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: C.skySoft, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>GET STARTED</div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 12 }}>Ready to Connect Your Healthcare Ecosystem?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: '0 auto 32px' }}>
            Join the healthcare organizations building on AMEXAN. One platform. One ecosystem. Infinite possibilities.
          </p>
          <div className="hero-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="touch-target" style={{ padding: '14px 28px', borderRadius: 10, border: 'none', background: '#fff', color: 'var(--sky-800)', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
              Explore Platform <ArrowRight size={18} />
            </Link>
            <Link href="/register" className="touch-target" style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
              Schedule a Demo
            </Link>
          </div>
        </motion.div>
      </Section>

      <Footer year={year} />
    </div>
  )
}
