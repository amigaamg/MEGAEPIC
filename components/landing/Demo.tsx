'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { USER_TYPES, S } from '@/components/landing/config'
import { C } from '@/lib/colors'

export default function Demo() {
  const [selected, setSelected] = useState(USER_TYPES[0])

  return (
    <section style={{ background: C.white }}>
      <div style={S.section}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>Live Demo</span>
          <h2 style={S.secH2}>Experience AMEXAN</h2>
          <p style={S.secP}>
            Select a role to see a live preview of what AMEXAN looks like for each type of user.
          </p>
        </motion.div>

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            {USER_TYPES.map((user) => (
              <button
                key={user.title}
                onClick={() => setSelected(user)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 100,
                  border: `1px solid ${selected.title === user.title ? C.sky : C.border}`,
                  background: selected.title === user.title ? C.sky : C.white,
                  color: selected.title === user.title ? C.white : C.navy,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {user.icon}
                {user.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div
                style={{
                  borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  overflow: 'hidden',
                  background: C.panel,
                }}
              >
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: C.skyLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: C.sky,
                      }}
                    >
                      {selected.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>
                        {selected.title} Dashboard
                      </div>
                      <div style={{ fontSize: 12, color: C.textLight }}>{selected.desc}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: 100,
                      background: C.green + '20',
                      color: C.green,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Live
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                    padding: 24,
                  }}
                >
                  {selected.dashPreview.map((stat, i) => {
                    const parts = stat.split(': ')
                    const label = parts[0]
                    const value = parts[1] || ''
                    const colors = [C.sky, C.green, C.amber, C.purple, C.red, C.navy]
                    const accent = colors[i % colors.length]
                    return (
                      <div
                        key={i}
                        style={{
                          background: C.white,
                          borderRadius: 14,
                          padding: 20,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: C.textLight,
                            fontWeight: 500,
                            marginBottom: 6,
                            letterSpacing: '0.03em',
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: accent,
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div
                  style={{
                    padding: '12px 24px',
                    borderTop: `1px solid ${C.border}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: C.green,
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: C.amber,
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: C.red,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
