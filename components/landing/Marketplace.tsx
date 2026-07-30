'use client'
import { motion } from 'framer-motion'
import { S, MARKETPLACE_ITEMS } from '@/components/landing/config'
import { C } from '@/lib/colors'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Marketplace() {
  return (
    <section style={{ background: C.panel }}>
      <div style={S.section}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>Marketplace</span>
          <h2 style={S.secH2}>An Ecosystem of Possibilities</h2>
          <p style={S.secP}>
            Extend AMEXAN with certified plugins, FHIR apps, regional modules, AI models, and more — built by our community and partners.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {MARKETPLACE_ITEMS.map((item) => (
            <motion.div key={item.title} variants={itemAnim} style={{ ...S.card, padding: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: C.skyLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.sky,
                  marginBottom: 14,
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: 6 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}