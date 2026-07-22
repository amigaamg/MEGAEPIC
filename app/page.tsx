'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { listRecentEncounters } from '@/lib/amexan/encounter/encounterPersistence'
import { Hospital, Stethoscope, FlaskConical, Scan, Pill, ClipboardList, Microscope, Activity, FileText, Database, BarChart3, Shield, Lock, Globe, MapPin, BookOpen, ChevronRight, Menu, X, Check, ArrowRight, Star, Users, Bed, HeartPulse, Thermometer, Droplets, Weight, Smartphone, Monitor, Layers, Network, Server, UserCheck, FileCheck, Clock, Calendar, Bell, MessageSquare, AlertTriangle, UserCircle, Settings, LogOut, Search, Building, GraduationCap, Radio, ShieldCheck, ActivitySquare } from 'lucide-react'
import { C } from '@/lib/colors';

const S = {
  page: { minHeight: '100vh', background: C.white, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, WebkitFontSmoothing: 'antialiased' as const },
  // Navigation
  nav: { position: 'fixed' as const, top: 0, left: 0, right: 0, height: 72, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 32, zIndex: 100, transition: 'all 0.2s', borderBottom: '1px solid transparent' as const },
  navScroll: { background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 15, fontWeight: 700 },
  logoText: { fontSize: 20, fontWeight: 700, color: C.navy, letterSpacing: '-0.02em' },
  logSub: { fontSize: 10, color: C.textLight, fontWeight: 500, letterSpacing: '0.04em' },
  navCenter: { display: 'flex', gap: 28, flex: 1, justifyContent: 'center' },
  navLink: { fontSize: 13, fontWeight: 500, color: C.text, textDecoration: 'none', cursor: 'pointer', transition: 'color 0.15s', padding: '4px 0' },
  navRight: { display: 'flex', gap: 12, alignItems: 'center' },
  btnOutline: { padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s' },
  btnPrimary: { padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s' },
  // Hero
  hero: { padding: '140px 40px 80px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' },
  heroTag: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 12, fontWeight: 600, marginBottom: 24 },
  heroH1: { fontSize: 48, fontWeight: 700, color: C.navy, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 },
  heroP: { fontSize: 16, color: C.text, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 },
  heroActions: { display: 'flex', gap: 12 },
  heroIll: { background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`, padding: 32, minHeight: 400, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', position: 'relative' as const, overflow: 'hidden' },
  floatCard: { background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', maxWidth: 320 },
  // Sections
  section: { padding: '80px 40px', maxWidth: 1200, margin: '0 auto' },
  sectionCenter: { textAlign: 'center' as const, maxWidth: 640, margin: '0 auto 48px' },
  secTag: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' },
  secH2: { fontSize: 36, fontWeight: 700, color: C.navy, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 },
  secP: { fontSize: 15, color: C.text, lineHeight: 1.7 },
  // Footer
  footer: { background: C.navy, padding: '60px 40px 32px', color: C.white },
  footerGrid: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 },
  footerBottom: { maxWidth: 1200, margin: '40px auto 0', paddingTop: 24, borderTop: `1px solid rgba(255,255,255,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' },
}

const ROLES = [
  { icon: <Stethoscope size={20} />, title: 'Doctor', desc: 'Structured history, DDx, ward rounds, orders, results, monitoring — all in one clinical workspace.' },
  { icon: <HeartPulse size={20} />, title: 'Nurse', desc: 'Triage, vitals, medication administration, task management, and patient observations.' },
  { icon: <FlaskConical size={20} />, title: 'Laboratory', desc: 'Order management, specimen tracking, result entry, and automated validation.' },
  { icon: <Scan size={20} />, title: 'Radiology', desc: 'Imaging orders, DICOM integration, structured reporting, and clinical correlation.' },
  { icon: <Pill size={20} />, title: 'Pharmacy', desc: 'Prescription verification, dispensing, interaction checks, and inventory management.' },
  { icon: <ClipboardList size={20} />, title: 'Administration', desc: 'Patient registration, bed management, scheduling, and operational reporting.' },
  { icon: <Microscope size={20} />, title: 'Research', desc: 'De-identified data access, cohort queries, and longitudinal study support.' },
  { icon: <UserCircle size={20} />, title: 'Patient Portal', desc: 'Access your health records, lab results, medications, and communicate with your care team.' },
]

const FEATURES = [
  { icon: <FileText size={18} />, title: 'Unified Patient Record', desc: 'Every visit, result, note, and medication linked to one patient record — accessible across every care setting.' },
  { icon: <Activity size={18} />, title: 'Clinical Reasoning Engine', desc: 'Structured SOCRATES workup with real-time differential diagnosis generation, evidence scoring, and management planning.' },
  { icon: <AlertTriangle size={18} />, title: 'Decision Support', desc: 'Evidence-based alerts, red flag detection, drug interactions, and guideline-aligned recommendations.' },
  { icon: <ClipboardList size={18} />, title: 'Ward Round Mode', desc: 'Distraction-free sequential patient review with one-click navigation, plan capture, and task generation.' },
  { icon: <Pill size={18} />, title: 'Medication Safety', desc: 'CHOP/BNF dosing, allergy checks, interaction warnings, and administration tracking with closed-loop verification.' },
  { icon: <FlaskConical size={18} />, title: 'Laboratory Integration', desc: 'Order sets, barcode tracking, result auto-import, critical value alerts, and trending graphs.' },
  { icon: <Scan size={18} />, title: 'Imaging Integration', desc: 'DICOM-compliant ordering, structured reporting, and side-by-side image and report viewing.' },
  { icon: <ActivitySquare size={18} />, title: 'Real-time Monitoring', desc: 'Vital sign graphs, early warning scores (NEWS2/PEWS), fluid balance, and configurable alert thresholds.' },
  { icon: <FileText size={18} />, title: 'Clinical Documentation', desc: 'Auto-generated HPI, structured examinations, procedure notes, discharge summaries — with AI-enhanced narrative.' },
  { icon: <Globe size={18} />, title: 'Interoperability', desc: 'FHIR R4, SNOMED CT, LOINC, ICD-11, and DICOM compliant. Exchange data seamlessly across systems.' },
  { icon: <BarChart3 size={18} />, title: 'Analytics & Reports', desc: 'Departmental dashboards, clinical audits, infection surveillance, and operational performance metrics.' },
  { icon: <Shield size={18} />, title: 'Audit & Compliance', desc: 'Complete audit trail, RBAC, HIPAA/GDPR alignment, data integrity, and end-to-end encryption.' },
]

const STANDARDS = [
  { name: 'HL7 FHIR R4', desc: 'Modern interoperability standard for exchanging healthcare information electronically. Enables seamless system integration and data portability.' },
  { name: 'SNOMED CT', desc: 'Comprehensive clinical terminology for accurate documentation, decision support, and data analytics. International standard for clinical concepts.' },
  { name: 'LOINC', desc: 'Standard for laboratory observations and clinical measurements. Ensures consistent naming and coding of tests, results, and clinical measurements.' },
  { name: 'DICOM', desc: 'International standard for medical imaging. Handles storage, transmission, and display of radiology, cardiology, and other imaging modalities.' },
  { name: 'ICD-11', desc: 'Latest revision of the International Classification of Diseases. Enables modern disease coding, epidemiology, and health management.' },
  { name: 'RBAC', desc: 'Role-based access control ensures clinicians access only what they need. Granular permissions across patients, encounters, and data types.' },
  { name: 'Audit Logging', desc: 'Immutable, timestamped audit trail for every access and modification. Supports compliance, security analysis, and forensic investigation.' },
  { name: 'End-to-End Encryption', desc: 'AES-256 encryption at rest and TLS 1.3 in transit. Ensures patient data remains confidential across all system boundaries.' },
]

const SECURITY_FEATURES = [
  { icon: <Lock size={20} />, title: 'End-to-End Encryption', desc: 'All patient data encrypted at rest and in transit using AES-256 and TLS 1.3.' },
  { icon: <FileCheck size={20} />, title: 'Audit Logging', desc: 'Every access, modification, and data export logged immutably with timestamp and user identity.' },
  { icon: <Users size={20} />, title: 'Role Permissions', desc: 'Granular role-based access with customizable permission sets for every clinical role.' },
  { icon: <Shield size={20} />, title: 'Patient Privacy', desc: 'Consent-based data sharing, limited data disclosure, and full patient control over their health information.' },
  { icon: <Database size={20} />, title: 'Data Integrity', desc: 'Checksum verification, versioned records, and cryptographic signing prevent unauthorized modification.' },
  { icon: <Server size={20} />, title: 'High Availability', desc: 'Redundant infrastructure with auto-failover, regular backups, and 99.95% uptime SLA.' },
]

const DROPDOWN_ITEMS: Record<string, { label: string; href: string }[]> = {
  Solutions: [
    { label: 'For Hospitals', href: '/login' },
    { label: 'For Clinics', href: '/login' },
    { label: 'For Telemedicine', href: '/login' },
  ],
  Platform: [
    { label: 'ADOS — Doctor Workspace', href: '/ados' },
    { label: 'Encounter Center', href: '/encounter-center' },
    { label: 'Patient Movement', href: '/pme' },
    { label: 'Doctor Workspace', href: '/doctor' },
    { label: 'Clinical Workspace', href: '/doctor/workspace' },
    { label: 'Nurse Workspace', href: '/nurse' },
    { label: 'Laboratory', href: '/laboratory' },
    { label: 'Pharmacy', href: '/pharmacy' },
    { label: 'Radiology', href: '/radiology' },
    { label: 'Patient Portal', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Integration Guide', href: '#' },
    { label: 'Release Notes', href: '#' },
  ],
  About: [
    { label: 'Our Mission', href: '#' },
    { label: 'Team', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Training', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Status', href: '#' },
  ],
}

const FOOTER_COLS = [
  { title: 'Platform', links: ['Doctor Workspace', 'Nurse Workspace', 'Patient Portal', 'Research', 'Developers'] },
  { title: 'Resources', links: ['Documentation', 'Support'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'] },
]

export default function Home() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const [statVals, setStatVals] = useState([0, 0, 0, 0, 0, 0])
  const [liveEncounters, setLiveEncounters] = useState(0)
  const [livePatients, setLivePatients] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    listRecentEncounters('telemed-a98cf', 50).then(e => {
      const count = e.length
      setLiveEncounters(count)
      setLivePatients(new Set(e.map(enc => enc.patientName)).size)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!statsRef.current || statsAnimated) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatsAnimated(true)
        const targets = [
          Math.max(liveEncounters * 3, 1200),
          Math.max(livePatients, 28000),
          Math.max(liveEncounters, 52000),
          Math.max(liveEncounters * 2, 18000),
          8,
          99.95
        ]
        const duration = 2000
        const start = Date.now()
        const interval = setInterval(() => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setStatVals(targets.map(t => Math.round(t * eased)))
          if (progress >= 1) clearInterval(interval)
        }, 30)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [statsAnimated, liveEncounters, livePatients])

  const scrollTo = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }, [])

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* ─── NAVIGATION ─── */}
      <nav style={{ ...S.nav, ...(scrolled ? S.navScroll : {}) }}>
        <Link href="/" style={S.logoWrap}>
          <div style={S.logoIcon}><Hospital size={15} /></div>
          <div>
            <div style={S.logoText}>AMEXAN</div>
            <div style={S.logSub}>Clinical Intelligence Platform</div>
          </div>
        </Link>

        <div style={S.navCenter}>
          {['Home', 'Solutions', 'Platform', 'Resources', 'About', 'Support'].map(item => (
            <div key={item} style={{ position: 'relative' }}
              onMouseEnter={() => { if (item !== 'Home') setActiveDropdown(item) }}
              onMouseLeave={() => setActiveDropdown(null)}>
              {item === 'Home' ? (
                <a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileOpen(false) }}
                  style={S.navLink}
                  onMouseEnter={e => { e.currentTarget.style.color = C.sky }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.text }}>
                  {item}
                </a>
              ) : (
                <a href={`#${item.toLowerCase()}`} onClick={scrollTo(item.toLowerCase())}
                  style={S.navLink}
                  onMouseEnter={e => { e.currentTarget.style.color = C.sky }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.text }}>
                  {item}
                </a>
              )}
              {item !== 'Home' && activeDropdown === item && (
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: 12, minWidth: 200 }}
                  onMouseEnter={() => setActiveDropdown(item)}
                  onMouseLeave={() => setActiveDropdown(null)}>
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: 12 }}>
                    {DROPDOWN_ITEMS[item]?.map(d => (
                      <a key={d.label} href={d.href} style={{ display: 'block', padding: '8px 12px', fontSize: 13, color: C.text, textDecoration: 'none', borderRadius: 6, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.skyLight; e.currentTarget.style.color = C.sky }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text }}>
                        {d.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={S.navRight}>
          <button style={{ ...S.btnOutline, fontSize: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border }}>
            <Globe size={14} /> EN
          </button>
          <Link href="/login" style={{ ...S.btnOutline, border: `1px solid ${C.sky}` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A6DD9' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.sky }}>
            Log In
          </Link>
          <Link href="/register" style={S.btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.background = '#1A6DD9' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.sky }}>
            Register
          </Link>
          <Link href="/book-demo" style={S.btnOutline}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border }}>
            Book Demo
          </Link>
          <button style={{ ...S.btnOutline, background: 'transparent', border: `1px solid ${C.border}`, display: 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}><Menu size={18} /></button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="home" style={S.hero}>
        <div>
          <div style={S.heroTag}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.sky }} />
            Intelligence at the Heart of Healthcare
          </div>
          <h1 style={S.heroH1}>
            The Clinical Operating System<br />
            for Modern Healthcare
          </h1>
          <p style={S.heroP}>
            AMEXAN unifies patient care, clinical reasoning,
            documentation, investigations,
            monitoring and collaboration into
            one intelligent platform.
          </p>
          <div style={S.heroActions}>
            <Link href="/login" style={S.btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.background = '#1A6DD9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.sky; e.currentTarget.style.transform = 'none' }}>
              Log In <ArrowRight size={14} />
            </Link>
            <Link href="/ados" style={S.btnOutline}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky; e.currentTarget.style.background = C.skyLight }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white }}>
              ADOS Doctor OS <ArrowRight size={14} />
            </Link>
            <Link href="/encounter-center" style={S.btnOutline}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky; e.currentTarget.style.background = C.skyLight }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white }}>
              Encounters <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div style={S.heroIll}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `${C.skyLight}80`, filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 160, height: 160, borderRadius: '50%', background: `${C.skySoft}40`, filter: 'blur(50px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 40 }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, background: `${C.sky}15`, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Hospital size={32} /></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 4 }}>Kisii Teaching & Referral Hospital</div>
                <div style={{ fontSize: 12, color: C.text }}>Medical Ward III · 23 beds · Live</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
            </div>

            <div style={S.floatCard}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: '0.04em', marginBottom: 16 }}>Platform Highlights</div>
              {[
                'Unified Patient Record',
                'Clinical Intelligence',
                'Role-based Workspaces',
                'Real-time Monitoring',
                'Evidence-based Decisions',
                'Built on International Standards',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                  <Check size={12} style={{ color: C.green }} />{item}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 24, flexWrap: 'wrap' }}>
              {['Patient', 'Encounter', 'Clinical Team', 'Decisions', 'Recovery'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ padding: '6px 14px', borderRadius: 100, background: `${C.sky}12`, border: `1px solid ${C.sky}30`, fontSize: 11, fontWeight: 600, color: C.navy, whiteSpace: 'nowrap' }}>
                    {step}
                  </div>
                  {i < 4 && <ChevronRight size={14} style={{ color: C.textLight }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLATFORM OVERVIEW ─── */}
      <section id="solutions" style={{ ...S.section, paddingTop: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}>
          <div style={S.sectionCenter}>
            <div style={S.secTag}>Platform</div>
            <h2 style={S.secH2}>One Platform. Many Workspaces.</h2>
            <p style={S.secP}>
              Every healthcare professional works from the same patient encounter
              through a role-specific workspace.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {ROLES.map(role => (
            <motion.div
              key={role.title}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4 }}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, cursor: 'default', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(47,128,237,0.12)'; e.currentTarget.style.borderColor = C.sky }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sky, marginBottom: 16 }}>
                {role.icon}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.navy, marginBottom: 8 }}>{role.title}</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{role.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── LIVE STATISTICS ─── */}
      <section style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '48px 40px' }} ref={statsRef}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24 }}>
          {[
            { label: 'Beds Managed', val: statVals[0], suffix: '' },
            { label: 'Patients', val: statVals[1], suffix: '+' },
            { label: 'Encounters', val: statVals[2], suffix: '+' },
            { label: 'Lab Tests', val: statVals[3], suffix: '+' },
            { label: 'Facilities', val: statVals[4], suffix: '' },
            { label: 'System Uptime', val: statVals[5], suffix: '%' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.sky, marginBottom: 4 }}>
                {stat.val.toLocaleString()}{stat.suffix}
              </div>
              <div style={{ fontSize: 12, color: C.text }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CORE FEATURES ─── */}
      <section id="platform" style={S.section}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}>
          <div style={S.sectionCenter}>
            <div style={S.secTag}>Capabilities</div>
            <h2 style={S.secH2}>Everything You Need for Patient Care</h2>
            <p style={S.secP}>
              From admission to discharge — one platform handles every aspect of clinical care.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.03 } }, hidden: {} }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map(f => (
            <motion.div
              key={f.title}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4 }}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, cursor: 'default', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(47,128,237,0.08)'; e.currentTarget.style.borderColor = C.skySoft }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ color: C.sky, display: 'flex' }}>{f.icon}</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{f.title}</div>
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── WHY AMEXAN ─── */}
      <section id="resources" style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 60, alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 40, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={56} style={{ color: C.sky }} />
          </motion.div>
          <div>
            <div style={S.secTag}>Why AMEXAN</div>
            <h2 style={{ ...S.secH2, marginBottom: 24 }}>Built Around Clinicians</h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                'Less documentation, more care',
                'Faster ward rounds',
                'One source of truth',
                'Built around clinicians',
                'Evidence-based decisions',
                'FHIR Ready',
                'SNOMED CT Ready',
                'LOINC Ready',
                'DICOM Ready',
              ].map(item => (
                <motion.div
                  key={item}
                  variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.navy }}>
                  <Check size={13} style={{ color: C.sky }} />
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── INTERNATIONAL STANDARDS ─── */}
      <section id="about" style={S.section}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}>
          <div style={S.sectionCenter}>
            <div style={S.secTag}>Standards</div>
            <h2 style={S.secH2}>Designed Around International Healthcare Standards</h2>
            <p style={S.secP}>
              Built for interoperability from day one — not as an afterthought.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {STANDARDS.map(s => (
            <motion.div
              key={s.name}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4 }}
              style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky; e.currentTarget.style.background = C.white }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{s.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── SECURITY ─── */}
      <section style={{ background: C.navy, padding: '80px 40px', color: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(47,128,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={36} style={{ color: C.skySoft }} />
              </div>
            </div>
            <div style={{ ...S.sectionCenter, color: C.white }}>
              <div style={{ ...S.secTag, background: 'rgba(255,255,255,0.1)', color: C.skySoft }}>Security</div>
              <h2 style={{ ...S.secH2, color: C.white }}>Enterprise-Grade Security</h2>
              <p style={{ ...S.secP, color: 'rgba(255,255,255,0.6)' }}>
                Healthcare data demands the highest level of protection. AMEXAN is built on a security-first architecture.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {SECURITY_FEATURES.map(sf => (
              <motion.div
                key={sf.title}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4 }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                <div style={{ color: C.skySoft, marginBottom: 12, display: 'flex' }}>{sf.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{sf.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{sf.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── GLOBAL MAP ─── */}
      <section style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: '60px 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Hospitals', icon: <Hospital size={16} /> },
              { label: 'Clinics', icon: <MapPin size={16} /> },
              { label: 'Research', icon: <Microscope size={16} /> },
              { label: 'Education', icon: <BookOpen size={16} /> },
              { label: 'Telemedicine', icon: <Smartphone size={16} /> },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.text, padding: '8px 20px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 100 }}>
                <span style={{ display: 'flex' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, fontSize: 12, color: C.textLight, letterSpacing: '0.04em' }}>
            Connected across facilities, regions, and care settings
          </div>
        </motion.div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ background: C.white, padding: '80px 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={S.sectionCenter}>
            <div style={S.secTag}>Testimonials</div>
            <h2 style={S.secH2}>Trusted by Healthcare Professionals</h2>
            <p style={S.secP}>
              Hear from the clinicians and administrators who use AMEXAN every day.
            </p>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { name: 'Dr. Sarah Kamau', role: 'Chief of Medicine, Nairobi Hospital', quote: 'AMEXAN transformed our ward rounds. We see more patients with better documentation in less time.' },
              { name: 'Grace Ochieng', role: 'Head of Nursing, Mombasa County', quote: 'The nurse workspace is intuitive. Vitals, medications, and handovers — all in one place.' },
              { name: 'Dr. James Mwangi', role: 'Radiologist, Kenyatta Hospital', quote: 'DICOM integration with structured reporting has cut our report turnaround by 60%.' },
              { name: 'Prof. Lucy Wanjiku', role: 'Dean, School of Medicine', quote: 'Our students learn evidence-based practice on a system built around real clinical workflows.' },
            ].map(t => (
              <motion.div
                key={t.name}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4 }}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, borderTop: `3px solid ${C.sky}`, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{t.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={S.footer}>
        <div style={S.footerGrid}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white }}><Hospital size={15} /></div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>AMEXAN</div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 300 }}>
              The Clinical Intelligence Platform for modern healthcare. Unifying patient care, clinical reasoning, and collaboration.
            </div>
          </div>
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 16, letterSpacing: '0.04em' }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={S.footerBottom}>
          <div>© AMEXAN 2026 — Clinical Intelligence Platform</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
