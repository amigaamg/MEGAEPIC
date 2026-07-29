'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { listRecentEncounters } from '@/lib/amexan/encounter/encounterPersistence'
import { getDefaultOrgId } from '@/lib/config'
import { C } from '@/lib/colors'
import { useViewportClass, isMobileViewport } from '@/hooks/useViewportClass'
import {
  Hospital, Stethoscope, FlaskConical, Scan, Pill, ClipboardList, Microscope,
  Activity, FileText, Database, BarChart3, Shield, Lock, Globe, MapPin,
  BookOpen, ChevronRight, Menu, X, Check, ArrowRight, Star, Users, Bed,
  HeartPulse, Thermometer, Droplets, Weight, Smartphone, Monitor, Layers,
  Network, Server, UserCheck, FileCheck, Clock, Calendar, Bell, MessageSquare,
  AlertTriangle, UserCircle, Settings, LogOut, Search, Building, GraduationCap,
  Radio, ShieldCheck, ActivitySquare, ChevronDown
} from 'lucide-react'

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

const FOOTER_COLS = [
  { title: 'Platform', links: ['Doctor Workspace', 'Nurse Workspace', 'Patient Portal', 'Research', 'Developers'] },
  { title: 'Resources', links: ['Documentation', 'Support'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'] },
]

function Tag({ label }: { label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
      borderRadius: 100, background: C.skyLight, color: C.sky,
      fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em'
    }}>
      {label}
    </div>
  )
}

function SectionHeader({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="lp-section-center">
      <Tag label={tag} />
      <h2 style={{ fontSize: 36, fontWeight: 700, color: C.navy, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 }}>{title}</h2>
      <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>{desc}</p>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const vc = useViewportClass()
  const mobile = isMobileViewport(vc)
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const [statVals, setStatVals] = useState([0, 0, 0, 0, 0, 0])
  const [liveEncounters, setLiveEncounters] = useState(0)
  const [livePatients, setLivePatients] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const navItems = ['Home', 'Solutions', 'Platform', 'Resources', 'About', 'Support']
  const dropdownMap: Record<string, { label: string; href: string }[]> = {
    Solutions: [
      { label: 'For Hospitals', href: '/login' }, { label: 'For Clinics', href: '/login' },
      { label: 'For Telemedicine', href: '/login' },
    ],
    Platform: [
      { label: 'ADOS — Doctor Workspace', href: '/ados' }, { label: 'Encounter Center', href: '/encounter-center' },
      { label: 'Patient Movement', href: '/pme' }, { label: 'Doctor Workspace', href: '/doctor' },
      { label: 'Clinical Workspace', href: '/doctor/workspace' }, { label: 'Nurse Workspace', href: '/nurse' },
      { label: 'Laboratory', href: '/laboratory' }, { label: 'Pharmacy', href: '/pharmacy' },
      { label: 'Radiology', href: '/radiology' },
    ],
    Resources: [
      { label: 'Documentation', href: '#' }, { label: 'API Reference', href: '#' },
      { label: 'Integration Guide', href: '#' }, { label: 'Release Notes', href: '#' },
    ],
    About: [
      { label: 'Our Mission', href: '#' }, { label: 'Team', href: '#' },
      { label: 'Careers', href: '#' }, { label: 'Contact', href: '#' },
    ],
    Support: [
      { label: 'Help Center', href: '#' }, { label: 'Training', href: '#' },
      { label: 'Community', href: '#' }, { label: 'Status', href: '#' },
    ],
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    listRecentEncounters(getDefaultOrgId(), 50).then(e => {
      setLiveEncounters(e.length)
      setLivePatients(new Set(e.map(enc => enc.patientName)).size)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!statsRef.current || statsAnimated) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatsAnimated(true)
        const targets = [
          Math.max(liveEncounters * 3, 1200), Math.max(livePatients, 28000),
          Math.max(liveEncounters, 52000), Math.max(liveEncounters * 2, 18000),
          8, 99.95
        ]
        const duration = 2000
        const start = Date.now()
        const interval = setInterval(() => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          setStatVals(targets.map(t => Math.round(t * (1 - Math.pow(1 - progress, 3)))))
          if (progress >= 1) clearInterval(interval)
        }, 30)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [statsAnimated, liveEncounters, livePatients])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const navBarStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, height: mobile ? 64 : 72,
    display: 'flex', alignItems: 'center', padding: mobile ? '0 16px' : '0 40px',
    gap: mobile ? 16 : 32, zIndex: 100, transition: 'all 0.2s',
    borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
    background: scrolled ? C.white : 'transparent',
    boxShadow: scrolled ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.white, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* ─── NAVIGATION ─── */}
      <nav style={navBarStyle} role="navigation" aria-label="Main navigation">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          aria-label="AMEXAN Home">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 15, fontWeight: 700 }}>
            <Hospital size={15} />
          </div>
          <div>
            <div style={{ fontSize: mobile ? 18 : 20, fontWeight: 700, color: C.navy, letterSpacing: '-0.02em' }}>AMEXAN</div>
            <div style={{ fontSize: 10, color: C.textLight, fontWeight: 500, letterSpacing: '0.04em', display: mobile ? 'none' : 'block' }}>
              Clinical Intelligence Platform
            </div>
          </div>
        </Link>

        <div className="lp-nav-row">
          {navItems.map(item => (
            <div key={item} style={{ position: 'relative' }}
              onMouseEnter={() => { if (item !== 'Home') setActiveDropdown(item) }}
              onMouseLeave={() => setActiveDropdown(null)}>
              <Link href={item === 'Home' ? '/' : `#${item.toLowerCase()}`}
                onClick={(e) => { if (item === 'Home') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}}
                style={{
                  fontSize: 13, fontWeight: 500, color: C.text, textDecoration: 'none',
                  cursor: 'pointer', transition: 'color 0.15s', padding: '8px 4px',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
                aria-haspopup={item !== 'Home' ? 'true' : undefined}
                aria-expanded={item !== 'Home' ? activeDropdown === item : undefined}>
                {item}
                {item !== 'Home' && <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: activeDropdown === item ? 'rotate(180deg)' : 'none' }} />}
              </Link>
              {item !== 'Home' && activeDropdown === item && (
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: 12, minWidth: 200 }}
                  role="menu">
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: 12 }}>
                    {dropdownMap[item]?.map(d => (
                      <Link key={d.label} href={d.href}
                        style={{ display: 'block', padding: '8px 12px', fontSize: 13, color: C.text, textDecoration: 'none', borderRadius: 6, transition: 'all 0.15s' }}
                        role="menuitem">
                        {d.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lp-nav-actions">
          <button style={{ minWidth: 48, minHeight: 48, padding: '0 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.navy, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Globe size={14} /> EN
          </button>
          <Link href="/login" style={{ minHeight: 48, padding: '0 20px', borderRadius: 10, border: `1px solid ${C.sky}`, background: C.white, color: C.navy, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Log In
          </Link>
          <Link href="/register" style={{ minHeight: 48, padding: '0 20px', borderRadius: 10, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Register
          </Link>
          <Link href="/book-demo" style={{ minHeight: 48, padding: '0 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Book Demo
          </Link>
        </div>

        <button className="lp-hamburger" onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}>
          {drawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* ─── MOBILE DRAWER ─── */}
      <div className={`lp-drawer${drawerOpen ? ' lp-drawer-open' : ''}`} role="dialog" aria-label="Mobile navigation">
        {navItems.map(item => (
          <div key={item} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, padding: '12px 0', borderBottom: item !== 'Home' ? `1px solid ${C.border}` : 'none', marginBottom: item !== 'Home' ? 8 : 0 }}>
              {item === 'Home' ? (
                <Link href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); closeDrawer() }}
                  style={{ color: C.navy, textDecoration: 'none', display: 'block' }}>Home</Link>
              ) : item}
            </div>
            {item !== 'Home' && dropdownMap[item]?.map(d => (
              <Link key={d.label} href={d.href} onClick={closeDrawer}
                style={{ display: 'block', padding: '10px 12px', textDecoration: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: C.text }}>
                {d.label}
              </Link>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <Link href="/register" onClick={closeDrawer}
            style={{ minHeight: 48, borderRadius: 10, border: 'none', background: C.sky, color: C.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Register
          </Link>
          <Link href="/book-demo" onClick={closeDrawer}
            style={{ minHeight: 48, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 15, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Book Demo
          </Link>
          <Link href="/login" onClick={closeDrawer}
            style={{ fontSize: 15, color: C.navy, fontWeight: 500, textDecoration: 'none', textAlign: 'center', padding: 12 }}>
            Log In
          </Link>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section id="home" className="lp-section-wide" style={{ paddingTop: mobile ? 96 : 140 }}>
        <div className="lp-hero-grid">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.sky }} />
              Intelligence at the Heart of Healthcare
            </div>
            <h1 style={{ fontSize: mobile ? 32 : 48, fontWeight: 700, color: C.navy, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              The Clinical Operating System<br />
              for Modern Healthcare
            </h1>
            <p style={{ fontSize: mobile ? 15 : 16, color: C.text, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              AMEXAN unifies patient care, clinical reasoning, documentation, investigations, monitoring and collaboration into one intelligent platform.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/login" className="lp-btn lp-btn-primary">
                Log In <ArrowRight size={16} />
              </Link>
              <Link href="/ados" className="lp-btn lp-btn-outline">
                ADOS Doctor OS
              </Link>
              <Link href="/encounter-center" className="lp-btn lp-btn-outline">
                Encounters
              </Link>
            </div>
          </motion.div>

          <motion.div className="lp-hero-vis"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ background: C.panel, borderRadius: 20, border: `1px solid ${C.border}`, padding: 32, minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `${C.skyLight}80`, filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 160, height: 160, borderRadius: '50%', background: `${C.skySoft}40`, filter: 'blur(50px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 40 }}>
                <div style={{ width: 80, height: 80, borderRadius: 16, background: `${C.sky}15`, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Hospital size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 4 }}>Your Facility · Connected</div>
                  <div style={{ fontSize: 12, color: C.text }}>Live · AMEXAN Clinical Intelligence</div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
              </div>
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', maxWidth: 320 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: '0.04em', marginBottom: 16 }}>Platform Highlights</div>
                {['Unified Patient Record', 'Clinical Intelligence', 'Role-based Workspaces', 'Real-time Monitoring', 'Evidence-based Decisions', 'Built on International Standards'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                    <Check size={12} style={{ color: C.green, flexShrink: 0 }} />{item}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 24, flexWrap: 'wrap' }}>
                {['Patient', 'Encounter', 'Clinical Team', 'Decisions', 'Recovery'].slice(0, mobile ? 3 : 5).map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ padding: '6px 14px', borderRadius: 100, background: `${C.sky}12`, border: `1px solid ${C.sky}30`, fontSize: 11, fontWeight: 600, color: C.navy, whiteSpace: 'nowrap' }}>{step}</div>
                    {i < (mobile ? 2 : 4) && <ChevronRight size={14} style={{ color: C.textLight, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PLATFORM OVERVIEW ─── */}
      <section id="solutions" className="lp-section" style={{ paddingTop: 0 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
          <SectionHeader tag="Platform" title="One Platform. Many Workspaces." desc="Every healthcare professional works from the same patient encounter through a role-specific workspace." />
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
          className="lp-grid-3">
          {ROLES.map(role => (
            <motion.div key={role.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="lp-card lp-card-hover"
              style={{ padding: 28, cursor: 'default' }}>
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
      <section ref={statsRef} style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: mobile ? '32px 20px' : '48px 40px' }}>
        <div className="lp-grid-6">
          {[
            { label: 'Beds Managed', val: statVals[0], suffix: '' },
            { label: 'Patients', val: statVals[1], suffix: '+' },
            { label: 'Encounters', val: statVals[2], suffix: '+' },
            { label: 'Lab Tests', val: statVals[3], suffix: '+' },
            { label: 'Facilities', val: statVals[4], suffix: '' },
            { label: 'System Uptime', val: statVals[5], suffix: '%' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: mobile ? 24 : 32, fontWeight: 700, color: C.sky, marginBottom: 4 }}>
                {stat.val.toLocaleString()}{stat.suffix}
              </div>
              <div style={{ fontSize: mobile ? 11 : 12, color: C.text }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CORE FEATURES ─── */}
      <section id="platform" className="lp-section">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
          <SectionHeader tag="Capabilities" title="Everything You Need for Patient Care" desc="From admission to discharge — one platform handles every aspect of clinical care." />
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.03 } }, hidden: {} }}
          className="lp-grid-3">
          {FEATURES.map(f => (
            <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="lp-card" style={{ padding: 24, cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ color: C.sky, display: 'flex', flexShrink: 0 }}>{f.icon}</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{f.title}</div>
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── WHY AMEXAN ─── */}
      <section id="resources" style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: mobile ? '48px 20px' : '80px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : '2fr 3fr', gap: mobile ? 32 : 60, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 40, minHeight: 300, display: mobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={56} style={{ color: C.sky }} />
          </motion.div>
          <div>
            <Tag label="Why AMEXAN" />
            <h2 style={{ fontSize: mobile ? 28 : 36, fontWeight: 700, color: C.navy, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 24 }}>Built Around Clinicians</h2>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
              className="lp-grid-2">
              {['Less documentation, more care', 'Faster ward rounds', 'One source of truth', 'Built around clinicians',
                'Evidence-based decisions', 'FHIR Ready', 'SNOMED CT Ready', 'LOINC Ready', 'DICOM Ready',
              ].map(item => (
                <motion.div key={item} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.navy }}>
                  <Check size={13} style={{ color: C.sky, flexShrink: 0 }} />{item}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── INTERNATIONAL STANDARDS ─── */}
      <section id="about" className="lp-section">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
          <SectionHeader tag="Standards" title="Designed Around International Healthcare Standards" desc="Built for interoperability from day one — not as an afterthought." />
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
          className="lp-grid-3" style={{ gap: 20 }}>
          {STANDARDS.map(s => (
            <motion.div key={s.name} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="lp-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{s.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── SECURITY ─── */}
      <section style={{ background: C.navy, padding: mobile ? '48px 20px' : '80px 40px', color: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(47,128,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={36} style={{ color: C.skySoft }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: C.skySoft, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>
                Security
              </div>
              <h2 style={{ fontSize: mobile ? 28 : 36, fontWeight: 700, color: C.white, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 }}>
                Enterprise-Grade Security
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Healthcare data demands the highest level of protection. AMEXAN is built on a security-first architecture.
              </p>
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
            className="lp-grid-3" style={{ gap: 20 }}>
            {SECURITY_FEATURES.map(sf => (
              <motion.div key={sf.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
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
      <section style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: mobile ? '40px 20px' : '60px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: mobile ? 8 : 40, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Hospitals', icon: <Hospital size={16} /> },
              { label: 'Clinics', icon: <MapPin size={16} /> },
              { label: 'Research', icon: <Microscope size={16} /> },
              { label: 'Education', icon: <BookOpen size={16} /> },
              { label: 'Telemedicine', icon: <Smartphone size={16} /> },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.text, padding: '8px 20px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 100 }}>
                <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
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
      <section style={{ background: C.white, padding: mobile ? '48px 20px' : '80px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader tag="Testimonials" title="Trusted by Healthcare Professionals" desc="Hear from the clinicians and administrators who use AMEXAN every day." />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
            className="lp-grid-4">
            {[
              { name: 'Dr. Sarah Kamau', role: 'Chief of Medicine, Nairobi Hospital', quote: 'AMEXAN transformed our ward rounds. We see more patients with better documentation in less time.' },
              { name: 'Grace Ochieng', role: 'Head of Nursing, Mombasa County', quote: 'The nurse workspace is intuitive. Vitals, medications, and handovers — all in one place.' },
              { name: 'Dr. James Mwangi', role: 'Radiologist, Kenyatta Hospital', quote: 'DICOM integration with structured reporting has cut our report turnaround by 60%.' },
              { name: 'Prof. Lucy Wanjiku', role: 'Dean, School of Medicine', quote: 'Our students learn evidence-based practice on a system built around real clinical workflows.' },
            ].map(t => (
              <motion.div key={t.name} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="lp-card" style={{ padding: 28, borderTop: `3px solid ${C.sky}` }}>
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
      <footer style={{ background: C.navy, padding: mobile ? '40px 20px 24px' : '60px 40px 32px', color: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: mobile ? 32 : 40 }}>
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
                  <a key={link} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s', padding: mobile ? '4px 0' : undefined }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '40px auto 0', paddingTop: 24, borderTop: `1px solid rgba(255,255,255,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 16 : 0 }}>
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
