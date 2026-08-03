// AMEXAN Universal Footer Component
// Book III Visual Constitution: AMEXAN Blue (#2F80ED) / White / Soft Gray.
// All values come from the CSS var layer (presentation.css). Never inline hex.
import React from 'react';
import { FOOTER_COLUMNS, TRUST_LOGOS } from './config';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  year: string;
}

export default function Footer({ year }: FooterProps) {
  return (
    <footer
      style={{
        background: 'var(--surface-card)',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--surface-border)',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-12)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-4)',
        }}
      >
        {/* Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Brand Column */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--sky-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-on-brand)',
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                AM
              </div>
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  AMEXAN
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Clinical Operating System
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              The International Clinical Operating System.
              Connecting every patient, clinician, facility, and healthcare service through one intelligent platform.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              <MapPin size={14} />
              <span>Kenya • Global</span>
            </div>
          </div>

          {/* Footer Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                {column.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        display: 'block',
                        padding: 'var(--space-1) 0',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'color var(--t-fast) ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--sky-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
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

        {/* Trust Logos */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2) var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {TRUST_LOGOS.map((logo) => (
            <span
              key={logo}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-elevated)',
                color: 'var(--text-muted)',
                border: '1px solid var(--surface-border)',
              }}
            >
              {logo}
            </span>
          ))}
        </div>

        {/* Contact Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--surface-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Mail size={14} />
            <span>contact@amexan.health</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Globe size={14} />
            <span>amexan.health</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Phone size={14} />
            <span>+254 20 000 0000</span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            © {year} AMEXAN. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
