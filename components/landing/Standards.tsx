'use client'
import { motion } from 'framer-motion'
import { STANDARDS, S } from '@/components/landing/config'
import { C } from '@/lib/colors'

const categories = Array.from(new Set(STANDARDS.map((s) => s.category)))

export default function Standards() {
  return (
    <section style={{ background: C.white }}>
      <div style={S.section}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>Standards</span>
          <h2 style={S.secH2}>Built on Global Healthcare Standards</h2>
          <p style={S.secP}>
            AMEXAN is architected on international interoperability, terminology, security, and
            compliance standards — ensuring seamless data exchange across any healthcare ecosystem.
          </p>
        </motion.div>

        {categories.map((category) => (
          <div key={category} style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.textLight,
                letterSpacing: '0.06em',
                marginBottom: 14,
              }}
            >
              {category}
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12,
              }}
            >
              {STANDARDS.filter((s) => s.category === category).map((standard) => (
                <motion.div
                  key={standard.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{ ...S.card, padding: 18 }}
                >
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.navy,
                      marginBottom: 4,
                    }}
                  >
                    {standard.name}
                  </h4>
                  <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6 }}>
                    {standard.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
