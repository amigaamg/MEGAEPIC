'use client'

import { useState, useEffect } from 'react'
import type { NavItem } from '@/lib/navigation/navigation.config'
import { getVisibleNavItems } from '@/lib/navigation/navigation.config'
import { responsiveEngine } from '@/lib/design/responsive-engine'
import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'

// Navigation — the constitutional entry point into the AMEXAN ecosystem.
// Renders DesktopNav on XL/XXL, MobileNav on everything smaller.
// Menus come exclusively from lib/navigation/navigation.config.ts.
// Viewport detection comes exclusively from the AUDS Responsive Engine.

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const update = () => setIsDesktop(responsiveEngine.atLeast('xl'))
    update()
    const unsubscribe = responsiveEngine.subscribeBreakpoint(update)
    return unsubscribe
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items: NavItem[] = getVisibleNavItems('public')

  return isDesktop ? (
    <DesktopNav items={items} scrolled={scrolled} />
  ) : (
    <MobileNav items={items} scrolled={scrolled} />
  )
}
