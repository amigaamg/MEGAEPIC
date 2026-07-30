'use client'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { COMPARISON_ROWS, S } from '@/components/landing/config'
import { C } from '@/lib/colors'

export default function Comparison() {
  return (
    <section style={{ background: C.panel }}>
      <div style={S.section}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>Why AMEXAN</span>
          <h2 style={S.secH2}>Traditional EMR vs AMEXAN</h2>
          <p style={S.secP}>
            See how AMEXAN goes beyond traditional electronic medical records to deliver a
            comprehensive clinical intelligence platform.
          </p>
        </motion.div>

        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
            background: C.white,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 120px',
              borderBottom: `1px solid ${C.border}`,
              background: C.skyLight,
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                fontSize: 12,
                fontWeight: 700,
                color: C.navy,
                letterSpacing: '0.04em',
              }}
            >
              Feature
            </div>
            <div
              style={{
                padding: '14px 20px',
                fontSize: 12,
                fontWeight: 700,
                color: C.navy,
                letterSpacing: '0.04em',
                textAlign: 'center',
              }}
            >
              Traditional EMR
            </div>
            <div
              style={{
                padding: '14px 20px',
                fontSize: 12,
                fontWeight: 700,
                color: C.sky,
                letterSpacing: '0.04em',
                textAlign: 'center',
              }}
            >
              AMEXAN
            </div>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.feature}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 120px',
                borderBottom: i < COMPARISON_ROWS.length - 1 ? `1px solid ${C.border}` : 'none',
                background: !row.trad ? `${C.skyLight}80` : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div
                style={{
                  padding: '12px 20px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.navy,
                }}
              >
                {row.feature}
              </div>
              <div
                style={{
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: row.trad ? C.green : C.red,
                }}
              >
                {row.trad ? <Check size={18} /> : <X size={18} />}
              </div>
              <div
                style={{
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.green,
                }}
              >
                <Check size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
