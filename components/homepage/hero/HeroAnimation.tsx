'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Globe, ShieldCheck, Activity } from 'lucide-react'
import type { HeroContent } from '@/lib/homepage/types'

interface HeroAnimationProps {
  hero: HeroContent
}

// HeroAnimation — the Universal Live Operating System.
// Not a fake hospital. Not marketing. A live status panel showing the
// real modules of the AMEXAN Clinical Operating System, with an animated
// clinical flow. Constitutional: green = success/online only.

export default function HeroAnimation({ hero }: HeroAnimationProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showAllModules, setShowAllModules] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % (hero.flow.length - 1))
    }, 1800)
    return () => clearInterval(id)
  }, [hero.flow.length])

  const visibleModules = showAllModules ? hero.modules : hero.modules.slice(0, 6)

  return (
    <div className="hp-hero-panel" aria-label="AMEXAN Clinical Intelligence Platform — live status">
      {/* Panel header */}
      <div className="hp-hero-panel-head">
        <div className="hp-hero-panel-title">
          <span className="hp-hero-panel-name">AMEXAN Clinical Intelligence Platform</span>
          <span className="hp-hero-panel-version">{hero.version}</span>
        </div>
        <div className="hp-hero-panel-status" role="status">
          <span className="hp-live-dot" aria-hidden="true" />
          <span>{hero.status.label}</span>
          <span className="hp-live-ok">{hero.status.ok ? hero.status.value : 'Check'}</span>
        </div>
      </div>

      {/* Animated clinical flow */}
      <div className="hp-hero-flow">
        <div className="hp-hero-flow-label">LIVE CLINICAL FLOW</div>
        <div className="hp-hero-flow-steps" aria-hidden="true">
          {hero.flow.map((step, i) => {
            const isActive = i === activeIndex
            const isDone = i < activeIndex
            return (
              <div key={step} className="hp-hero-flow-row">
                <motion.div
                  className="hp-hero-flow-step"
                  animate={{
                    backgroundColor: isActive ? 'var(--sky-500)' : isDone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="hp-hero-flow-dot">
                    {isActive ? <Activity size={12} /> : isDone ? <Check size={12} /> : <span />}
                  </span>
                  <span className="hp-hero-flow-name">{step}</span>
                  {i < hero.flow.length - 1 && (
                    <ChevronDown size={11} className="hp-hero-flow-chevron" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  )}
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modules active */}
      <div className="hp-hero-modules">
        <div className="hp-hero-modules-head">
          <span className="hp-hero-modules-label">MODULES ACTIVE</span>
          <AnimatePresence>
            {!showAllModules && (
              <button
                type="button"
                className="hp-hero-modules-toggle"
                onClick={() => setShowAllModules(true)}
              >
                +{hero.modules.length - 6} more
              </button>
            )}
          </AnimatePresence>
        </div>
        <div className="hp-hero-modules-grid">
          <AnimatePresence initial={false}>
            {visibleModules.map((m) => (
              <motion.span
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="hp-hero-module"
              >
                <Check size={12} className="hp-hero-module-check" />
                {m.label}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer row */}
      <div className="hp-hero-panel-foot">
        <div className="hp-hero-foot-item">
          <Globe size={14} />
          <span>Countries: {hero.countries}</span>
        </div>
        <div className="hp-hero-foot-item">
          <ShieldCheck size={14} />
          <span>Healthcare-grade security</span>
        </div>
      </div>
    </div>
  )
}
