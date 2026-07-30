'use client'
import { motion } from 'framer-motion'
import { ENGINES, S } from '@/components/landing/config'
import { C } from '@/lib/colors'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Engines() {
  return (
    <section style={{ background: C.panel }}>
      <div style={S.section}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>Intelligence</span>
          <h2 style={S.secH2}>Not Just an EMR. An Operating System.</h2>
          <p style={S.secP}>
            AMEXAN has <strong>16+ clinical intelligence engines</strong> powering every aspect of
            care — from reasoning and documentation to monitoring and analytics.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}
        >
          {ENGINES.map((engine) => (
            <motion.div key={engine.name} variants={itemAnim} style={{ ...S.card, padding: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: C.skyLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.sky,
                  marginBottom: 14,
                }}
              >
                {engine.icon}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 6 }}>
                {engine.name}
              </h3>
              <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                {engine.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
