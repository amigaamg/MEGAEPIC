'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'

// Protocol Center palette — light, Figma-grade, consistent with Facility Admin.
export const PC = {
  bg: '#f2f6fc',
  card: '#ffffff',
  border: '#e3e9f2',
  navy: '#0b2c4d',
  slate: '#5b6b80',
  muted: '#8a98ac',
  sky: '#0ea5e9',
  skyW: '#0284c7',
  skySoft: '#e0f2fe',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  ink: '#1e293b',
  faint: '#f8fafc',
  editorBg: '#ffffff',
  gutter: '#eef2f7',
}

export const pc = {
  card: { background: PC.card, border: `1px solid ${PC.border}`, borderRadius: 14, padding: 16 },
  cardTitle: { fontSize: 13, fontWeight: 800, color: PC.navy, margin: 0 },
  sub: { fontSize: 11, color: PC.muted, marginTop: 2 },
  pill: (c: string, bg: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: bg, color: c, whiteSpace: 'nowrap' as const }),
  chip: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#f1f5f9', color: PC.slate, whiteSpace: 'nowrap' as const },
  row: { display: 'flex', alignItems: 'center', gap: 8 },
  grid: (min = '180px') => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))`, gap: 10 }),
  input: { width: '100%', height: 34, borderRadius: 8, border: `1px solid ${PC.border}`, padding: '0 12px', fontSize: 12, outline: 'none', background: '#fff', color: PC.navy, fontFamily: 'inherit' },
  btn: (primary = false) => ({ padding: '8px 14px', borderRadius: 8, border: primary ? 'none' : `1px solid ${PC.border}`, background: primary ? PC.sky : '#fff', color: primary ? '#fff' : PC.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, touchAction: 'manipulation' as const, whiteSpace: 'nowrap' as const }),
}

export function ViewHeader({ icon, title, subtitle, action }: { icon?: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <div style={{ width: 36, height: 36, borderRadius: 10, background: PC.faint, border: `1px solid ${PC.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>}
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>{title}</h2>
          {subtitle && <div style={{ fontSize: 11, color: PC.muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    active: [PC.green, `${PC.green}18`],
    current: [PC.green, `${PC.green}18`],
    installed: [PC.green, `${PC.green}18`],
    live: [PC.green, `${PC.green}18`],
    connected: [PC.green, `${PC.green}18`],
    review: [PC.amber, `${PC.amber}18`],
    draft: [PC.sky, `${PC.sky}18`],
    archived: [PC.muted, '#eef2f7'],
    limited: [PC.amber, `${PC.amber}18`],
    backorder: [PC.red, `${PC.red}18`],
    available: [PC.green, `${PC.green}18`],
  }
  const [c, b] = map[status] || [PC.slate, '#eef2f7']
  return <span style={pc.pill(c, b)}>{status}</span>
}

export function SectionCard({ title, subtitle, action, children, pad = true }: { title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; pad?: boolean }) {
  return (
    <div style={{ ...pc.card, padding: pad ? undefined : 0 }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', padding: pad ? '0 0 12px' : '12px 16px', borderBottom: pad ? 'none' : `1px solid ${PC.border}` }}>
          <div>
            {title && <div style={pc.cardTitle}>{title}</div>}
            {subtitle && <div style={pc.sub}>{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      <div style={pad ? undefined : { padding: '12px 16px' }}>{children}</div>
    </div>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} aria-label="toggle" style={{ width: 36, height: 20, borderRadius: 12, border: 'none', background: on ? PC.green : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background .15s', flexShrink: 0, touchAction: 'manipulation' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  )
}

export function Collapsible({ title, badge, children, defaultOpen = false }: { title: string; badge?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: `1px solid ${PC.border}`, borderRadius: 12, background: PC.card, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
        {open ? <ChevronDown size={15} color={PC.slate} /> : <ChevronRight size={15} color={PC.slate} />}
        <span style={{ fontSize: 13, fontWeight: 700, color: PC.navy, flex: 1 }}>{title}</span>
        {badge}
      </button>
      {open && <div style={{ padding: '4px 14px 14px' }}>{children}</div>}
    </div>
  )
}

export function CheckItem({ done, label, onClick }: { done: boolean; label: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: done ? `${PC.green}0d` : PC.faint, cursor: onClick ? 'pointer' : 'default', border: `1px solid ${done ? `${PC.green}22` : 'transparent'}` }}>
      {done ? <CheckCircle2 size={15} color={PC.green} /> : <Circle size={15} color="#cbd5e1" />}
      <span style={{ fontSize: 12, fontWeight: 600, color: done ? PC.green : PC.ink, textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
    </div>
  )
}

export function StatCard({ label, value, color = PC.navy, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={pc.card}>
      <div style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: PC.muted, marginTop: 6, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: PC.slate, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export function TimelineRow({ label, detail, role, delay, accent = PC.sky }: { label: string; detail?: string; role?: string; delay?: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: accent, border: '3px solid #fff', boxShadow: `0 0 0 1.5px ${accent}55`, marginTop: 2 }} />
        {detail && <span style={{ width: 2, flex: 1, background: '#e2e8f0', margin: '3px 0' }} />}
      </div>
      <div style={{ paddingBottom: detail ? 12 : 4, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: PC.navy }}>{label}</span>
          {delay && <span style={{ fontSize: 10, color: PC.slate, background: '#f1f5f9', padding: '1px 7px', borderRadius: 10 }}>{delay}</span>}
          {role && <span style={{ fontSize: 10, color: PC.muted }}>{role}</span>}
        </div>
        {detail && <div style={{ fontSize: 11, color: PC.slate, marginTop: 2, lineHeight: 1.5 }}>{detail}</div>}
      </div>
    </div>
  )
}
