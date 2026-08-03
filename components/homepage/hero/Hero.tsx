'use client'

import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { HERO, TRUST_ITEMS, CAPABILITIES } from '@/lib/homepage/constants'
import { getIcon } from '../icons'
import HeroButtons from './HeroButtons'
import HeroAnimation from './HeroAnimation'

// Hero — the first 5 seconds.
// Answers: "What is AMEXAN?" → a Clinical Operating System for healthcare.
// Headline, subheadline, three actions, live visualization, trust.

export default function Hero() {
  return (
    <section className="hp-hero-section" aria-label="AMEXAN — The Clinical Operating System for Healthcare">
      <div className="hp-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hp-hero-content"
        >
          <div className="hp-hero-eyebrow">
            <Brain size={14} />
            {HERO.eyebrow}
          </div>
          <h1 className="hp-hero-title">
            {HERO.headline}
          </h1>
          <p className="hp-hero-sub">{HERO.subheadline}</p>
          <HeroButtons buttons={HERO.buttons} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="hp-hero-visual"
        >
          <HeroAnimation hero={HERO} />
        </motion.div>
      </div>

      {/* Trust strip */}
      <div className="hp-hero-trust" aria-label="Built on international healthcare standards">
        <div className="hp-hero-trust-line">
          Trusted by clinicians. Built on international healthcare standards.
        </div>
        <div className="hp-hero-trust-pills">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="hp-pill">{item}</span>
          ))}
        </div>
        <div className="hp-hero-capabilities">
          {CAPABILITIES.map((c) => {
            const Icon = getIcon(c.icon)
            return (
              <span key={c.label} className="hp-hero-capability">
                {Icon && <Icon size={13} />}
                {c.label}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
