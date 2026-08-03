'use client'
import EcosystemSection from './EcosystemSection'
import AudienceSection from './AudienceSection'
import ProductsSection from './ProductsSection'
import IntelligenceSection from './IntelligenceSection'
import JourneySection from './JourneySection'
import PhilosophySection from './PhilosophySection'
import StandardsSection from './StandardsSection'
import TestimonialsSection from './TestimonialsSection'
import CTASection from './CTASection'

// Phase 4 — Homepage Section Registry.
// Constitutional Principle 3: Every page is generated from a composition of independent sections.
// The homepage never knows business logic. It only composes.

export interface LandingSection {
  id: string
  name: string
  component: React.ComponentType
}

export const landingSections: LandingSection[] = [
  { id: 'ecosystem', name: 'Ecosystem', component: EcosystemSection },
  { id: 'audience', name: 'Who We Serve', component: AudienceSection },
  { id: 'products', name: 'Products', component: ProductsSection },
  { id: 'intelligence', name: 'Clinical Intelligence', component: IntelligenceSection },
  { id: 'journey', name: 'Clinical Journey', component: JourneySection },
  { id: 'philosophy', name: 'Why AMEXAN', component: PhilosophySection },
  { id: 'standards', name: 'Security & Standards', component: StandardsSection },
  { id: 'testimonials', name: 'Testimonials', component: TestimonialsSection },
  { id: 'cta', name: 'Call To Action', component: CTASection },
]

export function renderLandingSections() {
  return landingSections.map((section) => {
    const Section = section.component
    return <Section key={section.id} />
  })
}
