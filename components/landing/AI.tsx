'use client'
import { motion } from 'framer-motion'
import { Brain, Zap, BookOpen, FileText, Search, Microscope, Eye, Users, AlertTriangle } from 'lucide-react'
import { S, type IconType } from '@/components/landing/config'
import { C } from '@/lib/colors'

const AI_CAPABILITIES: { icon: IconType; title: string; desc: string }[] = [
  { icon: Brain, title: 'Clinical Reasoning', desc: 'Structured SOCRATES workup with real-time differential diagnosis generation and evidence scoring.' },
  { icon: AlertTriangle, title: 'Decision Support', desc: 'Evidence-based alerts, red flag detection, drug interactions, and guideline-aligned recommendations.' },
  { icon: BookOpen, title: 'Learning', desc: 'Case-based learning, assessments, and simulated patient encounters for continuous professional development.' },
  { icon: FileText, title: 'Protocol Guidance', desc: 'Configurable clinical protocols, order sets, and pathway-based care coordination at every step.' },
  { icon: FileText, title: 'Documentation', desc: 'Auto-generated HPI, structured exams, procedure notes, and discharge summaries with AI narrative.' },
  { icon: Search, title: 'Case Review', desc: 'Structured review of complex cases with pattern recognition and evidence-based recommendations.' },
  { icon: Microscope, title: 'Research', desc: 'Cohort queries, registry support, de-identified data exports, and trial management acceleration.' },
  { icon: Eye, title: 'Explainability', desc: 'Every AI recommendation includes transparent reasoning, citations, and confidence scoring.' },
  { icon: Users, title: 'Human Oversight', desc: 'All AI outputs are reviewed and validated by clinicians before any clinical action is taken.' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function AI() {
  return (
    <section style={{ background: 'var(--sky-900)' }}>
      <div style={S.section}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          style={S.sectionCenter}
        >
          <span style={S.secTagDark}>Artificial Intelligence</span>
          <h2 style={S.secH2Light}>Clinical Intelligence, Not Just AI</h2>
          <p style={S.secPLight}>
            AI is a tool, not a replacement. Every recommendation is explainable, verifiable, and under human oversight.
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
          className="ai-grid"
        >
          {AI_CAPABILITIES.map((item) => {
            const Icon = item.icon
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
      </div>
    </section>
  )
}