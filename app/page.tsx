'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { listRecentEncounters } from '@/lib/amexan/encounter/encounterPersistence'
import { getDefaultOrgId } from '@/lib/config'
import { C } from '@/lib/colors'
import { useViewportClass, isMobileViewport } from '@/hooks/useViewportClass'
import { Stethoscope, Heart, Building, Users, Globe, GraduationCap, Shield, Check, ArrowRight, Activity, Microscope, BookOpen, FlaskConical, Scan, Pill, ClipboardList, FileText, Database, BarChart3, Lock, Server, UserCheck, FileCheck, AlertTriangle, MessageSquare, Star, MapPin, Smartphone, UserCircle, BookMarked, Award, Target, Dna, Syringe, Thermometer } from 'lucide-react'
import Link from 'next/link'

import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Journey from '@/components/landing/Journey'
import WhoUses from '@/components/landing/WhoUses'
import Products from '@/components/landing/Products'
import Engines from '@/components/landing/Engines'
import Comparison from '@/components/landing/Comparison'
import Ecosystem from '@/components/landing/Ecosystem'
import Patient from '@/components/landing/Patient'
import Standards from '@/components/landing/Standards'
import Trust from '@/components/landing/Trust'
import Community from '@/components/landing/Community'
import GlobalMap from '@/components/landing/GlobalMap'
import Marketplace from '@/components/landing/Marketplace'
import Demo from '@/components/landing/Demo'
import AI from '@/components/landing/AI'
import Footer from '@/components/landing/Footer'

import './_shared/responsive.css'

const THREE_WORLDS = [
  { icon: <Stethoscope size={24} />, title: 'Clinical World', subtitle: 'For doctors, nurses, lab, radiology & pharmacy', desc: 'Purpose-built workspaces for every clinical role — from structured history taking and differential diagnosis to investigations, medications, and monitoring. All connected to a unified patient timeline across every care setting.', color: C.sky, hoverBg: C.skyLight, items: ['Doctor Workspace', 'Nurse Workspace', 'Laboratory', 'Radiology', 'Pharmacy'], href: '/doctor' },
  { icon: <Heart size={24} />, title: 'Patient World', subtitle: 'For patients, families & caregivers', desc: 'Empower patients with their own health portal — view records, lab results, medications, book appointments, message care teams, and manage their wellness journey from any device.', color: C.green, hoverBg: '#ECFDF5', items: ['Health Records', 'Lab Results', 'Appointments', 'Telemedicine', 'Messaging'], href: '/login' },
  { icon: <Building size={24} />, title: 'Operations World', subtitle: 'For administrators, IT, finance & government', desc: 'Manage facilities, beds, staffing, billing, compliance, and population health — all from one command center. Real-time dashboards and analytics for informed decision-making.', color: C.purple, hoverBg: '#F5F3FF', items: ['Hospital Admin', 'Billing & Finance', 'Population Health', 'Compliance', 'Analytics'], href: '/admin' },
]

const AUDIENCE = [
  { icon: <Users size={28} />, title: 'For Patients', subtitle: 'Your health, in your hands', desc: 'Access your complete health record, lab results, medications, and care team — from anywhere. Book appointments, consult via telemedicine, and stay informed with personalized health education.', highlights: ['Personal health record', 'Telemedicine consultations', 'Lab results & medications', 'Family access & messaging'], gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', accent: C.green },
  { icon: <Globe size={28} />, title: 'For Government & Policy Makers', subtitle: 'Population health intelligence', desc: 'Real-time visibility into disease trends, resource utilization, and healthcare coverage across regions. Make evidence-based policy decisions with comprehensive population health analytics and reporting.', highlights: ['Population health dashboards', 'Disease surveillance', 'Resource allocation analytics', 'National registry support'], gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', accent: C.sky },
  { icon: <Shield size={28} />, title: 'For Insurance', subtitle: 'Real-time claims and analytics', desc: 'Streamline claims processing with real-time clinical data integration. Improve utilization review, risk adjustment, and fraud detection with comprehensive population health insights.', highlights: ['Real-time claims integration', 'Utilization review', 'Risk adjustment analytics', 'Population health insights'], gradient: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', accent: C.purple },
  { icon: <GraduationCap size={28} />, title: 'For Medical Education', subtitle: 'Train on a real clinical system', desc: 'Train the next generation on a live clinical platform. Structured case-based learning, simulated encounters, OSCE tools, and performance tracking — integrated with the real AMEXAN environment.', highlights: ['Case-based learning', 'OSCE & simulation tools', 'Performance analytics', 'CPD tracking & certification'], gradient: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', accent: C.amber },
]

export default function Home() {
  const vc = useViewportClass()
  const mobile = isMobileViewport(vc)
  const [scrolled, setScrolled] = useState(false)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const [statVals, setStatVals] = useState([0, 0, 0, 0, 0, 0])
  const [liveEncounters, setLiveEncounters] = useState(0)
  const [livePatients, setLivePatients] = useState(0)
  const [activeUser, setActiveUser] = useState<number | null>(null)
  const statsRef = useRef<HTMLDivElement>(null)

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

  return (
    <div style={{ minHeight: '100vh', background: C.white, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <Header scrolled={scrolled} />

      <Hero />

      <Journey />

      <section className="lp-section">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>
            Three Worlds
          </div>
          <h2 className="clamp-h2" style={{ fontSize: 36, fontWeight: 700, color: C.navy, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 }}>
            One Platform for Every World of Healthcare
          </h2>
          <p className="clamp-body" style={{ fontSize: 15, color: C.text, lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>
            AMEXAN serves three interconnected worlds of healthcare — each with purpose-built tools, workflows, and experiences tailored to their unique needs.
          </p>
        </motion.div>

        <div className="tw-grid">
          {THREE_WORLDS.map((world, i) => (
            <motion.div key={world.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, cursor: 'default', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: world.color }} />
              <div style={{ width: 56, height: 56, borderRadius: 16, background: world.hoverBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: world.color, marginBottom: 20, border: `1px solid ${world.color}20` }}>
                {world.icon}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{world.title}</h3>
              <p style={{ fontSize: 13, color: world.color, fontWeight: 600, marginBottom: 16 }}>{world.subtitle}</p>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 20 }}>{world.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {world.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: C.textLight }}>
                    <Check size={12} style={{ color: world.color, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
              <Link href={world.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: world.color, textDecoration: 'none' }}>
                Explore <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <WhoUses activeUser={activeUser} setActiveUser={setActiveUser} />

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

      <Products />
      <Engines />
      <Comparison />
      <Ecosystem />
      <Patient />

      <section className="lp-section" style={{ background: C.panel }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' }}>
            <Users size={12} /> Who We Serve
          </div>
          <h2 className="clamp-h2" style={{ fontSize: 36, fontWeight: 700, color: C.navy, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Purpose-Built for Every Stakeholder
          </h2>
          <p className="clamp-body" style={{ fontSize: 15, color: C.text, lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>
            Whether you are a patient, policy maker, insurer, or educator — AMEXAN delivers the tools and insights you need.
          </p>
        </motion.div>

        <div className="aud-grid">
          {AUDIENCE.map((a, i) => (
            <motion.div key={a.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: a.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent }}>
                    {a.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>{a.title}</h3>
                    <p style={{ fontSize: 13, color: a.accent, fontWeight: 500, margin: 0 }}>{a.subtitle}</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 16 }}>{a.desc}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {a.highlights.map(h => (
                    <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.textLight }}>
                      <Check size={12} style={{ color: a.accent, flexShrink: 0 }} />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Standards />
      <Trust />
      <Community />
      <GlobalMap statVals={statVals} />
      <Marketplace />
      <Demo />
      <AI />
      <Footer />
    </div>
  )
}
