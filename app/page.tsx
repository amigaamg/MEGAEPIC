'use client'
import { useEffect, useState } from 'react'
import Navigation from '@/components/homepage/Navigation'
import Hero from '@/components/homepage/hero/Hero'
import Footer from '@/components/landing/Footer'
import { LandingLayout } from '@/components/landing/Layout'
import { renderLandingSections } from '@/components/landing/sections'
import './_shared/presentation.css'
import './_shared/responsive.css'
import '@/styles/homepage.css'

// AMEXAN Homepage — a constitutional composition, not an implementation.
// Phase 4: Navigation → Hero → Ecosystem → Audience → Products → Intelligence
//         → Journey → Philosophy → Standards → Testimonials → CTA → Footer
// Constitutional Principle 3: Every page is generated. Sections are independent,
// reusable, replaceable, configurable, themeable, responsive, international.

export default function Home() {
  const [year, setYear] = useState('')

  useEffect(() => {
    const t = setTimeout(() => { setYear(String(new Date().getFullYear())) }, 0)
    return () => clearTimeout(t)
  }, [])

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
