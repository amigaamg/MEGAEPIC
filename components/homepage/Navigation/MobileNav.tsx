'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Search, Globe, CalendarDays } from 'lucide-react'
import type { NavItem } from '@/lib/navigation/navigation.config'
import { NAV_ACTIONS } from '@/lib/navigation/navigation.config'
import { getIcon } from '../icons'
import { NavigationLogo } from './NavigationLogo'

interface MobileNavProps {
  items: NavItem[]
  scrolled: boolean
}

// MobileNav — constitutional mobile navigation.
// Phone: hamburger + slide-down drawer. Accordion for mega menus.
// Tablet: drawer. Never both bottom nav and hamburger simultaneously.

export default function MobileNav({ items, scrolled }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setExpanded((current) => (current === id ? null : id))
  }

  return (
    <>
      <header
        className={`hp-nav hp-nav-mobile ${scrolled ? 'hp-nav-scrolled' : ''}`}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}
      >
        <div className="hp-nav-inner">
          <NavigationLogo />
          <div className="hp-nav-mobile-actions">
            <button
              type="button"
              className="hp-nav-icon-btn"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className="hp-nav-icon-btn hp-hamburger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="hp-mobile-drawer"
            style={{ position: 'fixed', top: 72, left: 0, right: 0, bottom: 0, zIndex: 99 }}
          >
            <nav className="hp-mobile-nav" aria-label="Mobile navigation">
              {items.map((item) => {
                const Icon = getIcon(item.icon)
                const isExpanded = expanded === item.id
                const hasChildren = !!item.megaMenu?.columns.length
                return (
                  <div key={item.id} className="hp-mobile-item">
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          className="hp-mobile-item-btn"
                          aria-expanded={isExpanded}
                          onClick={() => toggleItem(item.id)}
                        >
                          {Icon && <Icon size={16} />}
                          <span className="hp-mobile-item-label">{item.title}</span>
                          <ChevronDown
                            size={16}
                            className={`hp-mobile-chevron${isExpanded ? ' hp-mobile-chevron--open' : ''}`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="hp-mobile-children">
                                {item.megaMenu!.columns.flatMap((group) =>
                                  group.links.map((link) => {
                                    const ChildIcon = getIcon(link.icon)
                                    return (
                                      <Link
                                        key={link.id}
                                        href={link.route}
                                        className="hp-mobile-child"
                                        onClick={() => setOpen(false)}
                                      >
                                        {ChildIcon && <ChildIcon size={15} />}
                                        <span>
                                          <span className="hp-mobile-child-title">{link.title}</span>
                                          {link.description && (
                                            <span className="hp-mobile-child-desc">{link.description}</span>
                                          )}
                                        </span>
                                      </Link>
                                    )
                                  }),
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.route ?? '#'}
                        className="hp-mobile-item-btn"
                        onClick={() => setOpen(false)}
                      >
                        {Icon && <Icon size={16} />}
                        <span className="hp-mobile-item-label">{item.title}</span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>

            <div className="hp-mobile-footer">
              <div className="hp-mobile-actions-row">
                <button type="button" className="hp-nav-icon-btn">
                  <Globe size={18} />
                  <span className="hp-nav-lang">EN</span>
                </button>
              </div>
              <Link href={NAV_ACTIONS.login.route} className="hp-btn hp-btn-secondary" onClick={() => setOpen(false)}>
                {NAV_ACTIONS.login.title}
              </Link>
              <Link href={NAV_ACTIONS.register.route} className="hp-btn hp-btn-primary" onClick={() => setOpen(false)}>
                {NAV_ACTIONS.register.title}
              </Link>
              <Link href={NAV_ACTIONS.bookDemo.route} className="hp-btn hp-btn-secondary" onClick={() => setOpen(false)}>
                <CalendarDays size={15} />
                {NAV_ACTIONS.bookDemo.title}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
