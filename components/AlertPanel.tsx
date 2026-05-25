'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/amexan/AlertPanel.tsx
// Renders evaluated clinical alerts from the Alert Engine
// ─────────────────────────────────────────────────────────────────────────────

import { TriggeredAlert } from '@/lib/clinicalProtocols';

const LEVEL_STYLES: Record<string, { border: string; bg: string; badge: string; text: string; dot: string }> = {
  emergency: { border: '#ef444435', bg: 'rgba(239,68,68,.06)', badge: 'rgba(239,68,68,.2)',  text: '#fca5a5', dot: '#ef4444' },
  urgent:    { border: '#f59e0b30', bg: 'rgba(245,158,11,.05)', badge: 'rgba(245,158,11,.18)', text: '#fcd34d', dot: '#f59e0b' },
  watch:     { border: '#06b6d425', bg: 'rgba(6,182,212,.05)',  badge: 'rgba(6,182,212,.15)',  text: '#67e8f9', dot: '#06b6d4' },
  normal:    { border: '#10b98125', bg: 'rgba(16,185,129,.04)', badge: 'rgba(16,185,129,.15)', text: '#6ee7b7', dot: '#10b981' },
};

interface AlertPanelProps {
  alerts: TriggeredAlert[];
  compact?: boolean;
}

export default function AlertPanel({ alerts, compact = false }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#3a4a5e', padding: '20px 0', fontSize: 12 }}>
        <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
        No active clinical alerts
      </div>
    );
  }

  const sorted = [...alerts].sort((a, b) => {
    const p = { emergency: 3, urgent: 2, watch: 1, normal: 0 };
    return p[b.level] - p[a.level];
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {sorted.map((alert) => {
        const s = LEVEL_STYLES[alert.level] || LEVEL_STYLES.watch;
        return (
          <div
            key={alert.id}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderLeft: `3px solid ${s.dot}`,
              borderRadius: 6,
              padding: compact ? '6px 10px' : '9px 12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {alert.level === 'emergency' && (
                  <span
                    style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'block', flexShrink: 0 }}
                  />
                )}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: s.dot,
                    background: s.badge,
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}
                >
                  {alert.level}
                </span>
                <span style={{ fontSize: 9, color: '#3a4a5e', fontWeight: 500 }}>{alert.disease}</span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: s.dot,
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 600,
                }}
              >
                {alert.param?.toUpperCase()}: {alert.value}
              </span>
            </div>
            {!compact && (
              <div style={{ fontSize: 11, color: s.text, lineHeight: 1.5 }}>{alert.message}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}