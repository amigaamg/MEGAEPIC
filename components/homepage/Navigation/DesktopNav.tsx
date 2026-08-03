'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Globe, CalendarDays } from 'lucide-react'
import type { NavItem } from '@/lib/navigation/navigation.config'
import { NAV_ACTIONS } from '@/lib/navigation/navigation.config'
import { getIcon } from '../icons'
import MegaMenu from './MegaMenu'
import { NavigationLogo } from './NavigationLogo'

interface DesktopNavProps {
  items: NavItem[]
  scrolled: boolean
}

// DesktopNav — constitutional top navigation for desktop.
// Left: logo. Center: nav items with hover mega menus. Right: actions.
// Fully keyboard accessible; Escape closes any open menu.

export default function DesktopNav({ items, scrolled }: DesktopNavProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node)) {
      setOpenId(null)
    }
  }

  return (
    <header
      ref={rootRef}
      onBlur={handleBlur}
      className={`hp-nav ${scrolled ? 'hp-nav-scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <div className="hp-nav-inner">
        <NavigationLogo />

        {/* Center nav */}
        <nav className="hp-nav-center" aria-label="Main navigation">
          {items.map((item) => {
            const Icon = getIcon(item.icon)
            const isOpen = openId === item.id
            const hasMega = !!item.megaMenu
            return (
              <div
                key={item.id}
                className="hp-nav-item"
                onMouseEnter={() => setOpenId(item.id)}
                onMouseLeave={() => setOpenId(null)}
              >
                {item.route && !hasMega ? (
                  <Link href={item.route} className="hp-nav-link">
                    {Icon && <Icon size={15} />}
                    {item.title}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className="hp-nav-link"
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      onClick={() => {
                        setOpenId(isOpen ? null : item.id)
                      }}
                    >
                      {Icon && <Icon size={15} />}
                      {item.title}
                      {hasMega && (
                        <ChevronDown
                          size={14}
                          className={`hp-nav-chevron${isOpen ? ' hp-nav-chevron--open' : ''}`}
                        />
                      )}
                    </button>
                    <AnimatePresence>
                      {isOpen && hasMega && <MegaMenu item={item} />}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="hp-nav-actions">
          <button
            type="button"
            className="hp-nav-icon-btn"
            aria-label={NAV_ACTIONS.search.description}
            title={NAV_ACTIONS.search.title}
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            className="hp-nav-icon-btn"
            aria-label={NAV_ACTIONS.language.description}
            title={NAV_ACTIONS.language.title}
          >
            <Globe size={18} />
            <span className="hp-nav-lang">EN</span>
          </button>
          <Link href={NAV_ACTIONS.login.route} className="hp-nav-login">
            {NAV_ACTIONS.login.title}
          </Link>
          <Link href={NAV_ACTIONS.register.route} className="hp-btn hp-btn-primary">
            {NAV_ACTIONS.register.title}
          </Link>
          <Link href={NAV_ACTIONS.bookDemo.route} className="hp-btn hp-btn-secondary">
            <CalendarDays size={15} />
            {NAV_ACTIONS.bookDemo.title}
          </Link>
        </div>
      </div>
    </header>
  )
}
