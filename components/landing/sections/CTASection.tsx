'use client'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Phase 4K — Call To Action.
// Three choices. Each takes a different journey.
export default function CTASection() {
  return (
    <section className="hp-cta">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="hp-tag-dark" style={{ display: 'inline-flex', marginBottom: 16 }}>GET STARTED</div>
        <h2 className="hp-cta-h2">This is not software.</h2>
        <p className="hp-cta-p1">This is the infrastructure healthcare has been missing.</p>
        <p className="hp-cta-p2">Join the healthcare organizations, governments, universities, and innovators building on AMEXAN.</p>
        <div className="hp-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary hp-cta-btn-primary">Get Started <ArrowRight size={18} /></Link>
          <a href="#" className="btn btn-secondary hp-cta-btn-secondary">Book a Demo</a>
        </div>
      </motion.div>
    </section>
  )
}
