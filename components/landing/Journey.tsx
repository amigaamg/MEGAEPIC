'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { S, JOURNEY_STEPS } from '@/components/landing/config'
import { C } from '@/lib/colors'
import { ChevronRight } from 'lucide-react'

export default function Journey() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section style={{ background: C.white }}>
      <div style={{ ...S.sectionWide as React.CSSProperties }}>
        <div style={{ ...S.sectionCenter as React.CSSProperties }}>
          <div style={S.secTag}>
            <span>The Journey</span>
          </div>
          <h2 style={S.secH2}>From Booking to Better Health</h2>
          <p style={S.secP}>
            A complete, connected care journey — from the moment a patient walks in through diagnosis,
            treatment, discharge, and beyond.
          </p>
        </div>

        <div
          ref={scrollRef}
          style={{
            overflowX: 'auto',
            paddingBottom: 16,
            scrollbarWidth: 'thin' as any,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 'max-content',
              padding: '8px 40px',
            }}
          >
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div
                  title={step.desc}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: C.skyLight,
                    border: `1px solid ${C.border}`,
                    cursor: 'default',
                    transition: 'all 0.15s',
                    minWidth: 80,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = C.sky
                    ;(e.currentTarget as HTMLDivElement).style.color = C.white
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = C.sky
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = C.skyLight
                    ;(e.currentTarget as HTMLDivElement).style.color = C.navy
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = C.border
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
                  }}
                >
                  <div style={{ lineHeight: 1 }}>{step.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {step.label}
                  </span>
                </div>

                {i < JOURNEY_STEPS.length - 1 && (
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                    style={{ color: C.sky, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
