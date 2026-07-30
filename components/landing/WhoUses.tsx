'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { S, USER_TYPES } from '@/components/landing/config'
import { C } from '@/lib/colors'

interface Props {
  activeUser: number | null
  setActiveUser: (i: number | null) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function WhoUses({ activeUser, setActiveUser }: Props) {
  return (
    <section style={{ ...{ background: `linear-gradient(180deg, ${C.white} 0%, ${C.skyLight} 50%, ${C.white} 100%)` } }}>
      <div style={{ ...S.section as React.CSSProperties, textAlign: 'center' as const }}>
        <div style={S.secTag}>
          <span>Who We Serve</span>
        </div>
        <h2 style={S.secH2}>One Ecosystem for Everyone</h2>
        <p style={{ ...S.secP as React.CSSProperties, maxWidth: 560, margin: '0 auto 48px' }}>
          From individual clinicians to national health systems — AMEXAN unifies every stakeholder in one platform.
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {USER_TYPES.map((u, i) => {
            const expanded = activeUser === i
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                onClick={() => setActiveUser(expanded ? null : i)}
                style={{
                  ...S.card as React.CSSProperties,
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  position: 'relative' as const,
                  overflow: 'hidden',
                  borderColor: expanded ? C.sky : undefined,
                  boxShadow: expanded ? `0 0 0 2px ${C.sky}` : undefined,
                }}
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: C.skyLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.sky,
                    flexShrink: 0,
                  }}>
                    {u.icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: C.navy, margin: 0 }}>{u.title}</h3>
                </div>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{u.desc}</p>

                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px solid ${C.border}`,
                      background: C.skyLight,
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    {u.dashPreview.map((stat, j) => (
                      <div key={j} style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: C.navy,
                        padding: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.sky, display: 'inline-block' }} />
                        {stat}
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
