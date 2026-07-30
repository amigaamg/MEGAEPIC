'use client'
import { motion } from 'framer-motion'
import { MessageSquare, Users, BookOpen, GitMerge, Code, Globe, Star } from 'lucide-react'
import { S, TESTIMONIALS, type IconType } from '@/components/landing/config'
import { C } from '@/lib/colors'

const COMMUNITY_ITEMS: { icon: IconType; title: string; desc: string }[] = [
  { icon: MessageSquare, title: 'Clinical Discussion Forums', desc: 'Case discussions, diagnostic challenges, and peer consultations across specialties.' },
  { icon: Users, title: 'Case Review Sessions', desc: 'Structured multi-disciplinary case reviews with shared learning and outcome tracking.' },
  { icon: BookOpen, title: 'Knowledge Exchange', desc: 'Share protocols, best practices, and clinical guidelines with the global community.' },
  { icon: GitMerge, title: 'Protocol Updating', desc: 'Collaboratively maintain and update clinical protocols with version control.' },
  { icon: Code, title: 'Open Source Contributions', desc: 'Contribute to the AMEXAN codebase, plugins, connectors, and clinical content.' },
  { icon: Globe, title: 'Regional User Groups', desc: 'Local meetups, training sessions, and support networks in your region.' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Community() {
  return (
    <section style={{ background: C.white }}>
      <div style={S.section}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTag}>Community</span>
          <h2 style={S.secH2}>Together, We Advance Healthcare</h2>
          <p style={S.secP}>
            The AMEXAN community brings together clinicians, developers, researchers, and healthcare leaders to shape the future of clinical intelligence.
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
          {COMMUNITY_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.title} variants={itemAnim} style={{ ...S.card, padding: 24 }}>
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
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 6 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={itemAnim} style={{ ...S.card, padding: 28, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: 24, color: C.skyLight }}>
                <Star size={16} fill={C.skyLight} />
              </div>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{t.name}</p>
                <p style={{ fontSize: 12, color: C.textLight }}>{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}