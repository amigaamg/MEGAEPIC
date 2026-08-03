'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import type { NavItem } from '@/lib/navigation/navigation.config'
import { getIcon } from '../icons'

// MegaMenu — constitutional mega menu.
// Structure: Overview heading, grouped columns of links, footer CTA.
// Never a flat list of 30 links.

export default function MegaMenu({ item }: { item: NavItem }) {
  const mega = item.megaMenu
  if (!mega) return null

  return (
    <motion.div
      role="menu"
      aria-label={`${item.title} menu`}
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="hp-mega"
    >
      <div className="hp-mega-inner">
        {/* Overview heading */}
        <div className="hp-mega-head">
          <div>
            <div className="hp-mega-title">{item.title}</div>
            <div className="hp-mega-desc">{item.description}</div>
          </div>
          {item.route && (
            <Link href={item.route} className="hp-mega-overview-link">
              Overview <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Grouped columns */}
        <div className="hp-mega-cols">
          {mega.columns.map((group) => (
            <div key={group.title} className="hp-mega-col">
              <div className="hp-mega-group-title">{group.title}</div>
              {group.links.map((link) => {
                const Icon = getIcon(link.icon)
                return (
                  <Link
                    key={link.id}
                    href={link.route}
                    className="hp-mega-link"
                    role="menuitem"
                  >
                    {Icon && <Icon size={16} className="hp-mega-link-icon" />}
                    <span className="hp-mega-link-body">
                      <span className="hp-mega-link-title">
                        {link.title}
                        {link.badge && <span className="hp-mega-badge">{link.badge}</span>}
                      </span>
                      {link.description && (
                        <span className="hp-mega-link-desc">{link.description}</span>
                      )}
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        {mega.footer && (
          <div className="hp-mega-foot">
            <span className="hp-mega-foot-title">{mega.footer.title}</span>
            <Link href={mega.footer.route} className="hp-mega-foot-cta">
              {mega.footer.cta}
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
