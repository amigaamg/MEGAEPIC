'use client'
import { motion } from 'framer-motion'
import { C } from '@/lib/colors'
import { S, PILLARS, JOURNEY_STEPS } from '@/components/landing/config'
import { ArrowRight, Play, Brain } from 'lucide-react'

const VIZ_STEPS = [0, 2, 3, 5, 6, 7, 9, 10]

export default function Hero() {
  return (
    <section style={{ ...S.sectionWide, paddingTop: 136 }}>
      <div className="h-hero-grid" style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 60, maxWidth: 1200, margin: '0 auto', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div style={S.secTag}>
            <Brain size={14} />
            Intelligence at the Heart of Healthcare
          </div>

          <h1 style={{ ...S.secH2, fontSize: 48, marginBottom: 20 }}>
            Healthcare's Clinical Operating System
          </h1>

          <p style={{ ...S.secP, fontSize: 16, marginBottom: 36, maxWidth: 520, lineHeight: 1.7 }}>
            One intelligent platform connecting clinicians, patients, hospitals, laboratories, pharmacies, researchers and healthcare systems worldwide.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/register" style={{ ...S.btnPrimary, padding: '12px 28px', fontSize: 14 }}>
              Get Started
              <ArrowRight size={16} />
            </a>
            <a href="#" style={{ ...S.btnOutline, padding: '12px 28px', fontSize: 14 }}>
              <Play size={16} />
              Book Live Demo
            </a>
            <a href="#" style={{ ...S.btnOutline, padding: '12px 28px', fontSize: 14 }}>
              Explore Platform
            </a>
          </div>
        </motion.div>

        <motion.div
          className="h-hero-vis"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            background: C.navy,
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.sky }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>CLINICAL WORKFLOW</span>
          </div>

          {[VIZ_STEPS.slice(0, 4), VIZ_STEPS.slice(4)].map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: ri === 0 ? 4 : 0 }}>
              {row.map((idx, i) => {
                const step = JOURNEY_STEPS[idx]
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 6px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.25 }}
                      style={{ width: 10, height: 10, borderRadius: '50%', background: C.sky, boxShadow: `0 0 12px ${C.sky}` }}
                    />
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{step.label}</div>
                    {i < 3 && (
                      <div style={{
                        position: 'absolute',
                        right: -8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: 12,
                        fontWeight: 300,
                      }}>→</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: -2, marginBottom: 4 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 14, fontWeight: 300 }}>↓</div>
            ))}
          </div>

          {[VIZ_STEPS.slice(4)].map((row) => (
            <div key="r2-fill" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {row.map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 6px', borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}
                  />
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }}
            />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Live — 1,247 active encounters</span>
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1200, margin: '80px auto 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={S.secTag}>THE AMEXAN PLATFORM</div>
          <h2 style={{ ...S.secH2, fontSize: 28 }}>Six Pillars, One Platform</h2>
          <p style={{ ...S.secP, maxWidth: 600, margin: '0 auto' }}>
            Every module designed from the ground up for the clinical reality of healthcare delivery.
          </p>
        </motion.div>

        <div className="h-pillars-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
          {PILLARS.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              style={{ ...S.card, padding: 20, textAlign: 'center' }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sky, margin: '0 auto 12px' }}>
                {pillar.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{pillar.title}</div>
              <div style={{ fontSize: 11, color: C.textLight, lineHeight: 1.5 }}>{pillar.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
