'use client'
import { motion } from 'framer-motion'
import { S, PRODUCTS } from '@/components/landing/config'
import { C } from '@/lib/colors'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

export default function Products() {
  return (
    <section style={{ background: C.white }}>
      <div style={{ ...S.section as React.CSSProperties }}>
        <div style={{ ...S.sectionCenter as React.CSSProperties }}>
          <div style={S.secTag}>
            <span>Products</span>
          </div>
          <h2 style={S.secH2}>The AMEXAN Ecosystem</h2>
          <p style={S.secP}>
            A comprehensive suite of products spanning clinical care, education, research,
            operations, and population health — built on a unified data platform.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            maxWidth: 1050,
            margin: '0 auto',
          }}
        >
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
              transition={{ duration: 0.2 }}
              style={{
                ...S.card as React.CSSProperties,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: p.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.navy, margin: 0 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
