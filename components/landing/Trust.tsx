'use client'
import { motion } from 'framer-motion'
import { Lock, FileCheck, Users, Shield, Database, Server } from 'lucide-react'
import { S, SECURITY_FEATURES, TRUST_LOGOS } from '@/components/landing/config'
import { C } from '@/lib/colors'

const SECURITY_ICONS = [Lock, FileCheck, Users, Shield, Database, Server]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Trust() {
  return (
    <section style={{ background: 'var(--sky-900)' }}>
      <div style={S.section}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTagDark}>Trust & Security</span>
          <h2 style={S.secH2Light}>Enterprise-Grade Security</h2>
          <p style={S.secPLight}>
            Your data is protected by military-grade encryption, strict access controls, and compliance with global healthcare standards.
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
            marginBottom: 48,
          }}
        >
          {SECURITY_FEATURES.map((item, i) => {
            const Icon = SECURITY_ICONS[i]
            return (
              <motion.div key={item.title} variants={itemAnim} style={{ ...S.cardDark, padding: 24 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(47,128,237,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sky-300)',
                    marginBottom: 14,
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center' }}
        >
          <span style={S.secTagDark}>Certifications & Compliance</span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'center',
              marginTop: 24,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {TRUST_LOGOS.map((logo) => (
              <div
                key={logo}
                style={{
                  padding: '6px 16px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {logo}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}