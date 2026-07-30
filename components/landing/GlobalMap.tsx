'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Hospital, Globe, GraduationCap } from 'lucide-react'
import { S } from '@/components/landing/config'
import { C } from '@/lib/colors'

const DOT_POSITIONS = [
  { top: '25%', left: '15%', size: 6, delay: 0 },
  { top: '35%', left: '30%', size: 8, delay: 0.2 },
  { top: '45%', left: '20%', size: 5, delay: 0.4 },
  { top: '20%', left: '50%', size: 7, delay: 0.1 },
  { top: '30%', left: '60%', size: 6, delay: 0.3 },
  { top: '55%', left: '45%', size: 9, delay: 0.5 },
  { top: '50%', left: '70%', size: 5, delay: 0.2 },
  { top: '40%', left: '80%', size: 7, delay: 0.4 },
  { top: '60%', left: '25%', size: 6, delay: 0.1 },
  { top: '70%', left: '55%', size: 5, delay: 0.3 },
  { top: '75%', left: '35%', size: 8, delay: 0.5 },
  { top: '65%', left: '75%', size: 6, delay: 0.2 },
  { top: '15%', left: '75%', size: 5, delay: 0.4 },
  { top: '80%', left: '65%', size: 7, delay: 0.1 },
  { top: '45%', left: '88%', size: 5, delay: 0.3 },
]

const BADGES = [
  { icon: <Hospital size={18} />, label: 'Hospitals', color: C.sky },
  { icon: <Globe size={18} />, label: 'Countries', color: C.green },
  { icon: <GraduationCap size={18} />, label: 'Medical Schools', color: C.purple },
]

interface Props {
  statVals: number[]
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 2000
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <>{count.toLocaleString()}{suffix}</>
}

export default function GlobalMap({ statVals }: Props) {
  return (
    <section style={{ background: C.panel }}>
      <div style={S.section}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>Global Reach</span>
          <h2 style={S.secH2}>Connected Across the World</h2>
          <p style={S.secP}>
            AMEXAN powers clinical intelligence across hospitals, medical schools, and health systems worldwide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'relative',
            width: '100%',
            height: 340,
            background: 'radial-gradient(ellipse at center, rgba(47,128,237,0.08) 0%, transparent 70%)',
            borderRadius: 24,
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
            marginBottom: 40,
          }}
        >
          <svg viewBox="0 0 800 400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
            <ellipse cx="400" cy="200" rx="300" ry="140" fill="none" stroke={C.sky} strokeWidth="0.5" strokeDasharray="4 4" />
            <ellipse cx="400" cy="200" rx="220" ry="100" fill="none" stroke={C.sky} strokeWidth="0.5" strokeDasharray="3 3" />
            <ellipse cx="400" cy="200" rx="140" ry="60" fill="none" stroke={C.sky} strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="200" y1="200" x2="600" y2="200" stroke={C.sky} strokeWidth="0.5" opacity="0.3" />
            <line x1="400" y1="60" x2="400" y2="340" stroke={C.sky} strokeWidth="0.5" opacity="0.3" />
          </svg>

          {DOT_POSITIONS.map((dot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: dot.delay, duration: 0.5 }}
              style={{
                position: 'absolute',
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
                borderRadius: '50%',
                background: C.sky,
                boxShadow: `0 0 12px ${C.sky}`,
              }}
            />
          ))}

          {DOT_POSITIONS.slice(0, 6).map((dot, i) => {
            const target = DOT_POSITIONS[(i + 3) % DOT_POSITIONS.length]
            return (
              <motion.div
                key={`line-${i}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                style={{
                  position: 'absolute',
                  top: dot.top,
                  left: dot.left,
                  width: 1,
                  height: 1,
                  background: `linear-gradient(90deg, ${C.sky}, transparent)`,
                  transformOrigin: 'left center',
                }}
              />
            )
          })}
        </motion.div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40 }}>
          {BADGES.map((badge) => (
            <div
              key={badge.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 100,
                background: C.white,
                border: `1px solid ${C.border}`,
                color: badge.color,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {badge.icon}
              {badge.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
          {statVals.map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, color: C.navy, lineHeight: 1 }}>
                <AnimatedCounter target={val} suffix={['', '+', '+', '+', '', '%'][i]} />
              </div>
              <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
                {['Beds Managed', 'Patients', 'Encounters', 'Lab Tests', 'Facilities', 'System Uptime'][i]}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}