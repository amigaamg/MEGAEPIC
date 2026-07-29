export const C = {
  sky: '#2F80ED', skySoft: '#60a5fa', skyLight: 'rgba(47, 128, 237, 0.1)',
  text: '#e2e8f0', textLight: '#94a3b8', textMuted: '#64748b',
  green: '#22c55e', amber: '#f59e0b', red: '#ef4444', purple: '#8b5cf6',
  cardBg: 'rgba(15, 23, 42, 0.8)', cardBorder: 'rgba(148, 163, 184, 0.12)',
  bg: '#0a0e1a',
};

export const S = {
  page: { padding: 16, maxWidth: 1400, margin: '0 auto' } as const,
  pageWide: { padding: 16 } as const,
  h1: { fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 },
  sub: { fontSize: 'clamp(10px, 1.2vw, 12px)', color: C.textMuted, marginBottom: 20 },
  card: { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 'clamp(12px, 1.5vw, 20px)' },
  cardH: { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 'clamp(12px, 1.5vw, 20px)', cursor: 'pointer', transition: 'all 0.15s' },
  cardTitle: { fontSize: 'clamp(9px, 1vw, 11px)', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 8 },
  cardValue: (c: string) => ({ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: c, lineHeight: 1 }),
  statRow: { display: 'flex', gap: 'clamp(8px, 1vw, 16px)', marginBottom: 20, flexWrap: 'wrap' as const },
  statCard: { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 'clamp(10px, 1.2vw, 16px)', flex: '1 1 clamp(120px, 15vw, 160px)', minWidth: 100 },
  statNum: (c: string) => ({ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 700, color: c, lineHeight: 1 }),
  statLabel: { fontSize: 'clamp(9px, 1vw, 11px)', color: '#64748b', marginTop: 4 },
  searchRow: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' as const },
  searchInput: { background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: '8px 14px 8px 32px', fontSize: 'clamp(11px, 1.2vw, 13px)', color: C.text, outline: 'none', width: '100%', maxWidth: 'min(360px, 100%)', boxSizing: 'border-box' as const },
  filterBtn: (a: boolean) => ({ padding: '6px 12px', borderRadius: 6, fontSize: 'clamp(9px, 1vw, 11px)', fontWeight: 500, cursor: 'pointer', background: a ? C.sky : 'rgba(15, 23, 42, 0.4)', color: a ? '#fff' : C.textMuted, border: a ? 'none' : `1px solid ${C.cardBorder}`, whiteSpace: 'nowrap' as const, minHeight: 32, touchAction: 'manipulation' as const }),
  tableWrap: { overflow: 'auto', borderRadius: 10, border: `1px solid ${C.cardBorder}`, WebkitOverflowScrolling: 'touch' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 'clamp(10px, 1.1vw, 12px)', minWidth: 600 },
  th: { textAlign: 'left' as const, padding: '8px 10px', fontSize: 'clamp(9px, 1vw, 11px)', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' as const, borderBottom: `1px solid ${C.cardBorder}`, whiteSpace: 'nowrap' as const },
  td: { padding: '8px 10px', borderBottom: `1px solid rgba(148, 163, 184, 0.06)`, color: '#cbd5e1' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 360px), 1fr))', gap: 'clamp(8px, 1vw, 16px)' },
  divider: { height: 1, background: C.cardBorder, margin: '16px 0' },
  section: { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 'clamp(12px, 1.5vw, 20px)', marginBottom: 'clamp(12px, 1.5vw, 20px)' },
  sectionTitle: { fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 600, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  badge: (c: string, bg: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4, fontSize: 'clamp(8px, 0.9vw, 10px)', fontWeight: 500, background: bg, color: c, whiteSpace: 'nowrap' as const }),
  statusDot: (c: string) => ({ width: 'clamp(6px, 0.6vw, 8px)', height: 'clamp(6px, 0.6vw, 8px)', borderRadius: '50%', background: c, display: 'inline-block', marginRight: 4, flexShrink: 0 }),
};

export function rowStyle() {
  return { display: 'flex', gap: 'clamp(8px, 1vw, 16px)', flexWrap: 'wrap' as const, marginBottom: 20 };
}