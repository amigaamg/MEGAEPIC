'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ECOSYSTEM_ITEMS } from '@/components/landing/config'
import { C } from '@/lib/colors'
import { S } from '@/components/landing/config'

const RADIUS = 220
const CENTER = { x: 280, y: 260 }

export default function Ecosystem() {
  const positions = useMemo(() => {
    return ECOSYSTEM_ITEMS.map((_, i) => {
      const angle = (i / ECOSYSTEM_ITEMS.length) * Math.PI * 2 - Math.PI / 2
      return {
        x: CENTER.x + RADIUS * Math.cos(angle),
        y: CENTER.y + RADIUS * Math.sin(angle),
      }
    })
  }, [])

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
    }),
  }

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 0.12,
      transition: { delay: 0.3 + i * 0.02, duration: 0.6 },
    }),
  }

  return (
    <section style={{ background: C.navy, overflow: 'hidden' }}>
      <div style={{
        ...S.sectionWide as React.CSSProperties,
        textAlign: 'center' as const,
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={S.secTagDark}>
          <span>Connected Ecosystem</span>
        </div>
        <h2 style={S.secH2Light}>Everything Connected</h2>
        <p style={{ ...S.secPLight as React.CSSProperties, maxWidth: 560, margin: '0 auto 48px' }}>
          AMEXAN connects every part of the healthcare ecosystem — enabling seamless data
          flow between clinicians, patients, administrators, and systems.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'relative' as const,
            width: 560,
            height: 520,
            margin: '0 auto',
          }}
        >
          <svg
            width={560}
            height={520}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' as const }}
          >
            {positions.map((p, i) => {
              const next = positions[(i + 1) % positions.length]
              return (
                <motion.path
                  key={`line-${i}`}
                  d={`M${p.x},${p.y} L${next.x},${next.y}`}
                  fill="none"
                  stroke={C.skySoft}
                  strokeWidth={1.5}
                  custom={i}
                  variants={lineVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                />
              )
            })}
            {positions.map((p, i) => {
              const next = positions[(i + 2) % positions.length]
              return (
                <motion.path
                  key={`cross-${i}`}
                  d={`M${p.x},${p.y} L${next.x},${next.y}`}
                  fill="none"
                  stroke={C.skySoft}
                  strokeWidth={0.5}
                  custom={i}
                  variants={lineVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                />
              )
            })}
          </svg>

          <motion.div
            style={{
              position: 'absolute',
              top: CENTER.y - 32,
              left: CENTER.x - 32,
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: C.sky,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.white,
              fontWeight: 700,
              fontSize: 11,
              textAlign: 'center',
              boxShadow: `0 0 0 8px rgba(47,128,237,0.15)`,
              zIndex: 2,
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            AMEXAN
          </motion.div>

          {ECOSYSTEM_ITEMS.map((item, i) => {
            const p = positions[i]
            return (
              <motion.div
                key={i}
                custom={i}
                variants={nodeVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.15, transition: { duration: 0.15 } }}
                style={{
                  position: 'absolute',
                  left: p.x - 48,
                  top: p.y - 48,
                  width: 96,
                  height: 96,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: C.white,
                  cursor: 'default',
                  zIndex: 1,
                }}
              >
                <div style={{ lineHeight: 1, opacity: 0.9 }}>{item.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85, textAlign: 'center', lineHeight: 1.2, padding: '0 4px' }}>
                  {item.label}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
