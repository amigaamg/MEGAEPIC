'use client'
import { viewportEngine } from '@/lib/amexan/presentation/viewport-engine'
import { getTypeStyle } from '@/lib/amexan/presentation/constitution/typography.constitution'
import { getSpacing } from '@/lib/amexan/presentation/constitution/spacing.constitution'
import { baseColorTokens } from '@/lib/amexan/presentation/constitution/colors.constitution'

// LandingLayout — the constitutional shell for public pages.
// Constitutional Principle: the layout engine decides adaptation. Pages only compose.
// Theme is data: the base AMEXAN color tokens drive all landing surfaces.

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const viewport = viewportEngine.current()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: baseColorTokens.background,
        color: baseColorTokens.paragraph,
        fontFamily: 'Inter, system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        ['--landing-max-width' as string]: viewport.isMobile ? '100%' : '1200px',
        ['--landing-gutter' as string]: getSpacing(24),
      }}
    >
      {children}
    </div>
  )
}

export function getLandingTypeScale() {
  return {
    heading: getTypeStyle('headingL'),
    subheading: getTypeStyle('headingM'),
    body: getTypeStyle('body'),
    caption: getTypeStyle('caption'),
  }
}

export function getLandingSpacing() {
  return {
    gutter: getSpacing(24),
    section: getSpacing(64),
    card: getSpacing(24),
  }
}
