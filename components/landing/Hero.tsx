"use client";

import Link from 'next/link';
import { useTheme } from '../../lib/amexan/presentation/engine/theme-engine';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { radiusTokens } from '@/lib/design/tokens/index';

const STATS = [
  { value: '2,500', label: 'Clinicians' },
  { value: '500', label: 'Hospitals' },
  { value: '200M', label: 'Patients Served' },
  { value: '150', label: 'Countries' },
];

export default function Hero() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.neutral[900]})`,
        color: theme.colors.primary.contrast,
        overflow: 'hidden',
        padding: `${spacingTokens[8]} ${spacingTokens[4]}`,
      }}
    >
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ ...typographyTokens.display, color: '#FFFFFF', marginBottom: spacingTokens[4] }}>
          The Clinical Intelligence Platform for{' '}
          <span
            style={{
              background: `linear-gradient(90deg, ${theme.colors.accent.DEFAULT}, ${theme.colors.primary.hover})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Modern Healthcare
          </span>
        </h1>

        <p
          style={{
            ...typographyTokens.bodyLarge,
            color: 'rgba(255,255,255,0.8)',
            maxWidth: 720,
            margin: '0 auto',
            marginBottom: spacingTokens[6],
            lineHeight: 1.7,
          }}
        >
          One intelligent ecosystem connecting clinicians, patients, hospitals, researchers, educators and
          healthcare organizations through evidence-based clinical intelligence.
        </p>

        <div
          style={{
            display: 'flex',
            gap: spacingTokens[4],
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: spacingTokens[8],
          }}
        >
          <Link
            href="/register"
            style={{
              padding: `${spacingTokens[3]} ${spacingTokens[6]}`,
              background: theme.colors.primary.contrast,
              color: theme.colors.primary.DEFAULT,
              fontWeight: 600,
              borderRadius: radiusTokens.medium,
              textDecoration: 'none',
            }}
          >
            Start Free Trial
          </Link>
          <Link
            href="/demo"
            style={{
              padding: `${spacingTokens[3]} ${spacingTokens[6]}`,
              background: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              fontWeight: 600,
              borderRadius: radiusTokens.medium,
              border: `1px solid rgba(255,255,255,0.3)`,
              textDecoration: 'none',
            }}
          >
            Book Demo
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: spacingTokens[4],
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                borderRadius: radiusTokens.large,
                padding: spacingTokens[5],
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
