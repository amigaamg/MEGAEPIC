'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { S, FOOTER_COLUMNS } from '@/components/landing/config'
import { C } from '@/lib/colors'
import { Globe, MessageCircle, Share2, Mail, Heart } from 'lucide-react'

const LEGAL_LINKS = ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact']

export default function Footer({ year: propYear }: { year?: string }) {
  const [year, setYear] = useState('')
  useEffect(() => { setYear(String(new Date().getFullYear())) }, [])
  const displayYear = propYear || year
  return (
    <footer style={{ background: '#0B1926', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '64px 40px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr repeat(6, 1fr)',
            gap: 32,
            marginBottom: 48,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  ...S.logoIcon,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  fontSize: 16,
                }}
              >
                A
              </div>
              <span style={{ ...S.logoText, color: C.white, fontSize: 18 }}>AMEXAN</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20, maxWidth: 260 }}>
              The clinical operating system powering intelligent healthcare worldwide. Open,
              interoperable, and built for every care setting.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[Globe, MessageCircle, Share2, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: 16,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map((link) => (
                  <li key={link} style={{ marginBottom: 10 }}>
                    <a
                      href="#"
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            &copy; {displayYear || '2026'} AMEXAN. All rights reserved. Made with{' '}
            <Heart size={11} style={{ display: 'inline', verticalAlign: 'middle', color: '#E74C3C' }} />{' '}
            for global health.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {LEGAL_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}