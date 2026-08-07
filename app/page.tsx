'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { resolveFamily, familyRedirect } from '@/lib/amexan/workspace/WorkspaceGuard'
import Navigation from '@/components/homepage/Navigation'
import Hero from '@/components/homepage/hero/Hero'
import Footer from '@/components/landing/Footer'
import { LandingLayout } from '@/components/landing/Layout'
import { renderLandingSections } from '@/components/landing/sections'
import './_shared/presentation.css'
import './_shared/responsive.css'
import '@/styles/homepage.css'
import { Activity } from 'lucide-react'

// AMEXAN Homepage — a constitutional composition, not an implementation.
// Phase 4: Navigation → Hero → Ecosystem → Audience → Products → Intelligence
//         → Journey → Philosophy → Standards → Testimonials → CTA → Footer
// Constitutional Principle 3: Every page is generated. Sections are independent,
// reusable, replaceable, configurable, themeable, responsive, international.

export default function Home() {
  const [year, setYear] = useState('')
  const { user, session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => { setYear(String(new Date().getFullYear())) }, 0)
    return () => clearTimeout(t)
  }, [])

  // Signed-in actors are routed to their role dashboard, never the marketing
  // page. The landing page is a public surface for anonymous visitors.
  useEffect(() => {
    if (loading) return
    if (!user) return
    if (session?.professional?.primaryCategory || session?.role?.name) {
      const family = resolveFamily(session.professional?.primaryCategory ?? null, session.role?.name ?? null)
      router.replace(family ? familyRedirect(family) : '/dashboard')
    } else {
      router.replace('/workspace')
    }
  }, [loading, user, session, router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
        <Activity size={28} color="#0ea5e9" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <LandingLayout>
      <Navigation />
      <main>
        <Hero />
        {renderLandingSections()}
      </main>
      <Footer year={year} />
    </LandingLayout>
  )
}
