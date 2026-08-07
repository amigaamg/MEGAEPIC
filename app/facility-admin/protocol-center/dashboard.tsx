'use client'

import { Brain, Network, CheckCircle2, AlertTriangle, CalendarClock, Sparkles } from 'lucide-react'
import { PC, pc, StatCard, StatusPill } from './ui'
import { OVERVIEW_STATS, RECENT_UPDATES, AI_RECOMMENDATIONS, CDS_HOOKS } from './data'

export function DashboardView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader />
      <OverviewGrid />
      <UpdatesAndRecs />
      <CdsHooks />
    </div>
  )
}

function SectionHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={20} color={PC.purple} />
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Clinical Intelligence Overview</h2>
        </div>
        <div style={{ fontSize: 11, color: PC.muted, marginTop: 4 }}>
          The Protocol Center is not a document library — it is the hospital&apos;s executable clinical intelligence engine.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusPill status="live" />
        <span style={{ fontSize: 11, color: PC.slate, background: PC.skySoft, padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
          FHIR CDS Hooks <span style={{ color: PC.sky }}>Enabled</span>
        </span>
        <span style={{ fontSize: 11, color: PC.muted, background: '#f1f5f9', padding: '4px 10px', borderRadius: 8 }}>Last Updated: <b style={{ color: PC.navy }}>Today</b></span>
      </div>
    </div>
  )
}

function OverviewGrid() {
  return (
    <div style={pc.grid('150px')}>
      {OVERVIEW_STATS.map(s => <StatCard key={s.label} label={s.label} value={s.value} color={s.color} />)}
    </div>
  )
}

function UpdatesAndRecs() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
      <div style={pc.card}>
        <div style={pc.cardTitle}><Network size={14} color={PC.sky} /> Recent Updates</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RECENT_UPDATES.map(u => (
            <div key={u.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 10px', borderRadius: 10, background: PC.faint, border: `1px solid ${PC.border}` }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: u.ok ? `${PC.green}18` : `${PC.amber}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={12} color={u.ok ? PC.green : PC.amber} />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: PC.ink }}>{u.title}</div>
                <div style={{ fontSize: 11, color: PC.slate, lineHeight: 1.4, marginTop: 1 }}>{u.detail}</div>
              </div>
              <span style={{ fontSize: 10, color: PC.muted, whiteSpace: 'nowrap' }}>{u.when}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={pc.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} color={PC.purple} />
          <span style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>AI Recommendations</span>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AI_RECOMMENDATIONS.map(r => (
            <div key={r.id} style={{ padding: '10px 12px', borderRadius: 10, background: r.severity === 'critical' ? `${PC.red}0a` : `${PC.amber}0d`, border: `1px solid ${r.severity === 'critical' ? `${PC.red}22` : `${PC.amber}22`}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <AlertTriangle size={13} color={r.severity === 'critical' ? PC.red : PC.amber} />
                <span style={{ fontSize: 11, fontWeight: 800, color: r.severity === 'critical' ? PC.red : PC.amber }}>{r.dept}</span>
              </div>
              <div style={{ fontSize: 11, color: PC.slate, lineHeight: 1.5 }}>{r.text}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={pc.btn(true)} onClick={() => {}}>Review Recommendations</button>
          <button style={pc.btn()}>Auto-Fix Intelligence</button>
        </div>
      </div>
    </div>
  )
}

function CdsHooks() {
  return (
    <div style={pc.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarClock size={14} color={PC.cyan} />
        <span style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>FHIR CDS Hooks</span>
        <span style={pc.pill(PC.green, `${PC.green}18`)}>Enabled</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: PC.muted }}>Best Practice Advisories fired across the EMR</span>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {CDS_HOOKS.map(h => (
          <div key={h.id} style={{ padding: '10px 12px', borderRadius: 10, background: PC.faint, border: `1px solid ${h.active ? `${PC.green}22` : PC.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: PC.ink }}>{h.name}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.active ? PC.green : '#cbd5e1' }} />
            </div>
            <div style={{ fontSize: 10, color: PC.slate, marginTop: 4, lineHeight: 1.4 }}>{h.action}</div>
            <div style={{ fontSize: 10, color: PC.muted, marginTop: 4 }}>{h.hits.toLocaleString()} hits</div>
          </div>
        ))}
      </div>
    </div>
  )
}