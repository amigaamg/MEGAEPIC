'use client'

import { useState } from 'react'
import { GitBranch, TrendingUp, Store, GitCompareArrows, CheckCircle2, Download, CloudDownload, Archive, Clock, Activity, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, PieChart, Pie, Legend } from 'recharts'
import { PC, pc, StatusPill, Collapsible } from './ui'
import { VERSIONED_PROTOCOLS, ANALYTICS, MARKETPLACE, CDS_HOOKS } from './data'

export function VersionControlView() {
  const [sel, setSel] = useState(VERSIONED_PROTOCOLS[0])
  const [left, setLeft] = useState<number>(sel.versions.length - 1)
  const [right, setRight] = useState<number>(0)
  const same = left === right
  const l = sel.versions[left]
  const r = sel.versions[right]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <GitBranch size={18} color={PC.green} />
        <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Version Control</h2>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: PC.muted }}>Never lose history — every protocol is immutable and versioned.</span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {VERSIONED_PROTOCOLS.map(v => (
          <button key={v.id} onClick={() => { setSel(v); setRight(0); setLeft(v.versions.length - 1) }} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${v.id === sel.id ? PC.green : PC.border}`, background: v.id === sel.id ? `${PC.green}12` : '#fff', color: v.id === sel.id ? PC.green : PC.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{v.name}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
        <div style={pc.card}>
          <div style={{ fontSize: 12, fontWeight: 800, color: PC.navy, marginBottom: 10 }}>Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sel.versions.map((v, i) => (
              <div key={v.version} style={{ display: 'flex', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: v.status === 'current' ? PC.green : v.status === 'draft' ? PC.sky : PC.muted, border: '3px solid #fff', boxShadow: `0 0 0 1.5px ${v.status === 'current' ? PC.green : v.status === 'draft' ? PC.sky : PC.muted }55`, marginTop: 2 }} />
                  {i < sel.versions.length - 1 && <span style={{ width: 2, flex: 1, background: '#e2e8f0', margin: '3px 0', minHeight: 18 }} />}
                </div>
                <div style={{ paddingBottom: i < sel.versions.length - 1 ? 4 : 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: PC.navy }}>{v.version} <span style={{ fontSize: 9, fontWeight: 500, color: PC.muted }}>· {v.date}</span></div>
                  <div style={{ fontSize: 10, color: PC.slate }}>{v.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
            <select value={left} onChange={e => setLeft(Number(e.target.value))} style={pc.input}>
              {sel.versions.map((v, i) => <option key={i} value={i}>{v.version} — {v.status}</option>)}
            </select>
            <span style={{ fontSize: 10, fontWeight: 800, color: PC.muted }}>VS</span>
            <select value={right} onChange={e => setRight(Number(e.target.value))} style={pc.input}>
              {sel.versions.map((v, i) => <option key={i} value={i}>{v.version} — {v.status}</option>)}
            </select>
          </div>

          {same ? (
            <Collapsible title={`${l.version} — ${l.summary}`} badge={<StatusPill status={l.status} />} defaultOpen>
              <MetaRow label="Author" value={l.author} />
              <MetaRow label="Date" value={l.date} />
              <MetaBlock title="Changes" items={l.changes} />
              <MetaBlock title="Sections" items={l.sections.map(s => `${s.present ? '✓' : '—'} ${s.name}`)} />
            </Collapsible>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ ...pc.card, border: `1px solid ${PC.red}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: PC.red }}>{l.version}</span>
                  <StatusPill status={l.status} />
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: PC.muted }}>{l.date}</span>
                </div>
                <MetaBlock title="Changes" items={l.changes} accent={PC.red} />
                <MetaBlock title="Sections" items={l.sections.map(s => `${s.present ? '✓' : '—'} ${s.name}`)} />
              </div>
              <div style={{ ...pc.card, border: `1px solid ${PC.green}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: PC.green }}>{r.version}</span>
                  <StatusPill status={r.status} />
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: PC.muted }}>{r.date}</span>
                </div>
                <MetaBlock title="Changes" items={r.changes} accent={PC.green} />
                <MetaBlock title="Sections" items={r.sections.map(s => `${s.present ? '✓' : '—'} ${s.name}`)} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={pc.btn(true)} disabled={false}><GitCompareArrows size={13} /> {same ? 'Promote to Current' : 'Compare selected versions'}</button>
            <button style={pc.btn()}><Download size={13} /> Export JSON</button>
            <button style={pc.btn()}><Archive size={13} /> Archive</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return <div style={{ display: 'flex', gap: 8, fontSize: 11.5, marginBottom: 6 }}><span style={{ color: PC.muted, width: 50 }}>{label}</span><span style={{ color: PC.ink, fontWeight: 600 }}>{value}</span></div>
}
function MetaBlock({ title, items, accent }: { title: string; items: string[]; accent?: string }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: PC.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it, i) => <div key={i} style={{ fontSize: 11.5, color: accent || PC.ink }}>• {it}</div>)}
      </div>
    </div>
  )
}

export function AnalyticsView() {
  const barData = [
    { category: 'Most Used', data: ANALYTICS.mostUsed, color: PC.sky },
    { category: 'Lowest Compliance', data: ANALYTICS.lowestCompliance, color: PC.amber },
    { category: 'Highest Mortality', data: ANALYTICS.mortality, color: PC.red },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TrendingUp size={18} color={PC.cyan} />
        <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Protocol Analytics</h2>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: PC.muted }}>What the hospital actually executes.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
        {ANALYTICS.outcomes.map(o => (
          <div key={o.name} style={pc.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: PC.slate }}>{o.name}</span>
              <b style={{ fontSize: 18, color: o.name === 'Deaths' ? PC.red : PC.green }}>{o.value}%</b>
            </div>
            <div style={{ height: 6, marginTop: 8, borderRadius: 4, background: '#eef2f7', overflow: 'hidden' }}>
              <div style={{ width: `${o.value}%`, height: '100%', background: o.name === 'Deaths' || o.name === 'Readmission' ? PC.red : PC.green, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {barData.map(b => (
          <div key={b.category} style={pc.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: PC.navy }}>{b.category}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={b.data} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: PC.muted }} />
                <YAxis type="category" dataKey="name" width={86} tick={{ fontSize: 9, fill: PC.slate }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill={b.color} radius={[0, 4, 4, 0]} barSize={14}>
                  {b.data.map((d, i) => <Cell key={i} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 }}>
        <div style={pc.card}>
          <div style={{ fontSize: 12, fontWeight: 800, color: PC.navy, marginBottom: 12 }}>AI Trigger Frequency (by hour)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ANALYTICS.aiTriggerByHour} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: PC.muted }} />
              <YAxis tick={{ fontSize: 9, fill: PC.muted }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke={PC.purple} strokeWidth={2} dot={{ r: 3, fill: PC.purple }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={pc.card}>
          <div style={{ fontSize: 12, fontWeight: 800, color: PC.navy, marginBottom: 12 }}>AI Engine Trigger Share</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ANALYTICS.triggerFreq} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {ANALYTICS.triggerFreq.map((d, i) => <Cell key={i} fill={[PC.sky, PC.purple, PC.green, PC.amber, PC.cyan, '#f97316'][i % 6]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ ...pc.card, background: `${PC.amber}06`, border: `1px solid ${PC.amber}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <AlertTriangle size={14} color={PC.amber} />
          <span style={{ fontSize: 12, fontWeight: 800, color: PC.navy }}>Protocol Deviation Insights</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
          {ANALYTICS.deviations.map((d, i) => (
            <div key={d.name} style={{ background: '#fff', border: `1px solid ${PC.border}`, borderRadius: 10, padding: '9px 11px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: PC.navy }}>{d.name}</div>
              <div style={{ fontSize: 10, color: PC.slate }}>{d.value} deviations · causes flagged</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                {['antibiotic delay', 'lactate miss', 'transfer delay', 'doc gap'].slice(0, (i % 3) + 2).map((c, j) => <span key={j} style={pc.chip}>{c}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MarketplaceView() {
  const [installed, setInstalled] = useState<Record<string, boolean>>(() => Object.fromEntries(MARKETPLACE.map(m => [m.id, m.installed])))
  const toggle = (id: string) => setInstalled(s => ({ ...s, [id]: !s[id] }))
  const installedCount = Object.values(installed).filter(Boolean).length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Store size={18} color={PC.purple} />
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Protocol Marketplace</h2>
            <div style={{ fontSize: 11, color: PC.muted }}>Install authenticated protocol packs from global authorities.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={pc.card}><b style={{ fontSize: 18, color: PC.green }}>{installedCount}</b><div style={{ fontSize: 10, color: PC.muted }}>Installed</div></div>
          <div style={pc.card}><b style={{ fontSize: 18, color: PC.navy }}>{MARKETPLACE.length - installedCount}</b><div style={{ fontSize: 10, color: PC.muted }}>Available</div></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {MARKETPLACE.map(m => {
          const on = installed[m.id]
          return (
            <div key={m.id} style={{ ...pc.card, border: `1px solid ${on ? `${PC.green}40` : PC.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: on ? `${PC.green}14` : PC.skySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: on ? PC.green : PC.sky, flexShrink: 0 }}>
                  {m.authority.slice(0, 3).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: PC.muted }}>{m.authority}{m.featured ? ' · ★ Featured' : ''}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: PC.slate, marginTop: 10, lineHeight: 1.5 }}>{m.description}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {m.items.map((it, i) => <span key={i} style={pc.chip}>{it}</span>)}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={() => toggle(m.id)} style={{ ...pc.btn(true), flex: 1, justifyContent: 'center', background: on ? `${PC.amber}` : PC.sky }}>
                  {on ? 'Uninstall' : 'Install'}
                </button>
                <button style={pc.btn()}><Download size={13} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}