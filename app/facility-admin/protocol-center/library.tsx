'use client'

import { useMemo, useRef, useState } from 'react'
import { Search, FilePlus2, Users, FlaskConical, Pill, GitBranch, Boxes, Activity, Eye, Play, Send, Copy, Archive, ChevronRight, Brain, FlaskRound, ListChecks, Network, Layers, Timer, Siren } from 'lucide-react'
import { PC, pc, StatusPill, Collapsible, CheckItem } from './ui'
import { PROTOCOLS, PROTOCOL_NAMES, PROTOCOL_STATUS_POOL, type Protocol, type ProtocolSection, type Block } from './data'

export interface EditorActions {
  onBack: () => void
  onSimulate: (p: Protocol) => void
  onVersions: (p: Protocol) => void
  onPreview: (p: Protocol) => void
}

const GENERIC_TEMPLATE: ProtocolSection[] = [
  { id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'Evidence-aligned clinical protocol for this condition. Configure recognition criteria, diagnostic rules and treatment orders as executable intelligence.' }, { t: 'list', title: 'This protocol controls', items: ['Automatic activation triggers', 'Order set generation', 'AI decision support', 'Compliance & outcome tracking'] }] },
  { id: 'recognition', title: 'Recognition', blocks: [{ t: 'list', items: ['Presenting symptoms consistent with the condition', 'Vital sign derangements', 'Bedside red flags'] }] },
  { id: 'diagnostic', title: 'Diagnostic Criteria', blocks: [{ t: 'p', text: 'Define objective criteria using vitals, labs and scores. AMEXAN evaluates these automatically at the point of care.' }] },
  { id: 'investigations', title: 'Investigations', blocks: [{ t: 'list', items: ['Baseline labs', 'Directed imaging', 'Microbiology where indicated'] }] },
  { id: 'treatment', title: 'Treatment', blocks: [{ t: 'p', text: 'Treatment orders generated into one-click order sets. Drugs link to the hospital formulary.' }] },
  { id: 'escalation', title: 'Escalation', blocks: [{ t: 'rule', text: 'Configure escalation thresholds. Alerts escalate from ward to consultant to medical director.' }] },
  { id: 'monitoring', title: 'Monitoring', blocks: [{ t: 'list', items: ['Vitals frequency', 'Lab trending', 'Nursing observations'] }] },
  { id: 'references', title: 'References', blocks: [{ t: 'list', items: ['Authority source guideline', 'Local validation record'] }] },
]

function buildGenericProtocol(name: string, index: number): Protocol {
  const status = PROTOCOL_STATUS_POOL[index % PROTOCOL_STATUS_POOL.length]
  return {
    id: `gen-${name.toLowerCase().replace(/[^a-z]/g, '-')}`, name, version: `${index % 4 + 1}.${index % 9}`,
    status, lastReview: status === 'active' ? 'May 2026' : '—', nextReview: status === 'active' ? 'May 2027' : '—',
    sources: ['MOH Kenya', 'WHO'], departments: ['Medicine', 'Emergency'],
    category: 'Protocol', description: `Executable clinical intelligence for ${name}.`,
    activation: { text: 'Activation criteria not yet configured.', triggers: [] },
    sections: GENERIC_TEMPLATE,
    linked: { orderSets: [], careBundles: [], drugs: [], labRules: [], dependencies: [] },
    outcome: { uses: 0, compliance: 0, mortality: 0, deviations: 0, triggers: 0 },
  }
}

export function ProtocolLibraryView({ onOpen }: { onOpen: (p: Protocol) => void }) {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const all = useMemo(() => {
    const curated = PROTOCOLS
    const generated = PROTOCOL_NAMES.map((n, i) => buildGenericProtocol(n, i))
    const seen = new Set(curated.map(p => p.name.toLowerCase()))
    const extra = generated.filter(g => !seen.has(g.name.toLowerCase()))
    return [...curated, ...extra]
  }, [])

  const filtered = all.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (deptFilter !== 'all' && !p.departments.includes(deptFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sources.join(' ').toLowerCase().includes(q)
    }
    return true
  })

  const depts = Array.from(new Set(all.flatMap(p => p.departments))).sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Clinical Protocol Library</h2>
          <div style={{ fontSize: 11, color: PC.muted, marginTop: 3 }}>{all.length} executable protocols · every protocol is a constitutional object, not a PDF</div>
        </div>
        <button style={pc.btn(true)}><FilePlus2 size={14} /> New Protocol</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={14} color={PC.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search protocols, sources, departments…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...pc.input, paddingLeft: 32 }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={pc.input}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="review">In review</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ ...pc.input, maxWidth: 200 }}>
          <option value="all">All departments</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map(p => (
          <button key={p.id} onClick={() => onOpen(p)} style={{ textAlign: 'left', ...pc.card, cursor: 'pointer', borderColor: p.status === 'active' ? `${PC.green}44` : PC.border, transition: 'all .15s', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: PC.navy }}>{p.name}</div>
                <div style={{ fontSize: 10, color: PC.muted, fontFamily: 'monospace', marginTop: 1 }}>v{p.version} · {p.id}</div>
              </div>
              <StatusPill status={p.status} />
            </div>
            <div style={{ fontSize: 11, color: PC.slate, marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</div>
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {p.departments.map(d => <span key={d} style={pc.chip}>{d}</span>)}
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${PC.border}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: PC.muted }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {p.departments.length} depts</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Activity size={11} /> {p.outcome.uses} uses</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GitBranch size={11} /> v{p.version}</span>
              <span style={{ marginLeft: 'auto' }}>{p.status === 'active' ? `Review ${p.nextReview}` : ''}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Protocol Editor (VS Code + UpToDate + Epic BPA + Figma) ──────────────────

export function ProtocolEditorView({ protocol, actions }: { protocol: Protocol; actions: EditorActions }) {
  const [activeSection, setActiveSection] = useState(protocol.sections[0]?.id || '')
  const [draft, setDraft] = useState<Partial<Record<string, string>>>({})
  const section = protocol.sections.find(s => s.id === activeSection) || protocol.sections[0]

  const dirty = Object.values(draft).some(v => v !== undefined && v !== '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <EditorTopBar protocol={protocol} actions={actions} />
      <div style={{ display: 'grid', gridTemplateColumns: '230px minmax(0,1fr) 300px', gap: 12, alignItems: 'start' }}>
        {/* Left — protocol navigation */}
        <EditorNav protocol={protocol} activeSection={activeSection} setActiveSection={setActiveSection} />
        {/* Center — rich workspace */}
        <EditorWorkspace protocol={protocol} section={section} draft={draft} setDraft={setDraft} dirty={dirty} />
        {/* Right — live AI simulation / links / history / outcomes */}
        <EditorRightPanel protocol={protocol} />
      </div>
    </div>
  )
}

function EditorTopBar({ protocol, actions }: { protocol: Protocol; actions: EditorActions }) {
  return (
    <div style={{ ...pc.card, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={actions.onBack} style={{ ...pc.btn(), padding: '6px 10px' }}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Library</button>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: PC.navy, margin: 0 }}>{protocol.name}</h2>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: PC.muted }}>v{protocol.version}</span>
            <StatusPill status={protocol.status} />
          </div>
          <div style={{ fontSize: 11, color: PC.slate, marginTop: 8 }}>
            <b style={{ color: PC.muted }}>Source:</b> {protocol.sources.join(' • ')}
          </div>
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {protocol.departments.map(d => <span key={d} style={pc.chip}>{d}</span>)}
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <div style={{ fontSize: 11, color: PC.muted }}>
            Last Review: <b style={{ color: PC.navy }}>{protocol.lastReview}</b> &nbsp;·&nbsp; Next Review: <b style={{ color: PC.navy }}>{protocol.nextReview}</b>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 4 }}>
            <button style={pc.btn()} onClick={() => actions.onPreview(protocol)}><Eye size={13} /> Preview</button>
            <button style={pc.btn()} onClick={() => actions.onSimulate(protocol)}><Play size={13} /> Simulate</button>
            <button style={pc.btn()} onClick={() => actions.onVersions(protocol)}><GitBranch size={13} /> Versions</button>
            <button style={pc.btn(true)}><Send size={13} /> Publish</button>
            <button style={pc.btn()}><Copy size={13} /> Clone</button>
            <button style={pc.btn()}><Archive size={13} /> Archive</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditorNav({ protocol, activeSection, setActiveSection }: { protocol: Protocol; activeSection: string; setActiveSection: (id: string) => void }) {
  return (
    <div style={{ ...pc.card, padding: 10, position: 'sticky', top: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: PC.muted, padding: '6px 8px' }}>Protocol Sections</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {protocol.sections.map((s, i) => {
          const active = s.id === activeSection
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, border: 'none', background: active ? PC.skySoft : 'transparent', color: active ? PC.sky : PC.slate, fontWeight: active ? 800 : 500, fontSize: 11, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 9, color: active ? PC.sky : PC.muted, width: 14, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1 }}>{s.title}</span>
              {active && <ChevronRight size={12} />}
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${PC.border}` }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: PC.muted, padding: '4px 8px' }}>Activation</div>
        <div style={{ fontSize: 10, color: PC.slate, lineHeight: 1.5, padding: '0 8px' }}>{protocol.activation.text}</div>
        {protocol.activation.triggers.map(t => (
          <div key={t.label} style={{ marginTop: 6, padding: '7px 8px', borderRadius: 8, background: PC.faint, border: `1px solid ${PC.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: PC.sky }}>{t.label}</div>
            <div style={{ fontSize: 9, color: PC.muted, marginTop: 2 }}>{t.action}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((b, i) => {
    switch (b.t) {
      case 'p':
        return <p key={i} style={{ fontSize: 12.5, color: PC.ink, lineHeight: 1.65, margin: '0 0 12px' }}>{b.text}</p>
      case 'quote':
        return <blockquote key={i} style={{ margin: '0 0 12px', padding: '10px 14px', borderLeft: `3px solid ${PC.purple}`, background: `${PC.purple}0d`, borderRadius: 8, fontSize: 12, color: PC.slate, fontStyle: 'italic' }}>{b.text}</blockquote>
      case 'note':
        return <div key={i} style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: PC.skySoft, border: `1px solid ${PC.sky}33`, fontSize: 12, color: PC.navy, lineHeight: 1.6 }}>{b.text}</div>
      case 'warning':
        return <div key={i} style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: `${PC.red}0d`, border: `1px solid ${PC.red}33`, fontSize: 12, color: PC.red, lineHeight: 1.6, display: 'flex', gap: 8, alignItems: 'flex-start' }}><Siren size={14} style={{ flexShrink: 0, marginTop: 1 }} /><span>{b.text}</span></div>
      case 'rule':
        return <div key={i} style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: `${PC.purple}0d`, border: `1px solid ${PC.purple}30`, fontSize: 12, color: PC.ink, lineHeight: 1.6, display: 'flex', gap: 8, alignItems: 'flex-start' }}><Brain size={14} color={PC.purple} style={{ flexShrink: 0, marginTop: 1 }} /><span>{b.text}</span></div>
      case 'list':
        return (
          <div key={i} style={{ marginBottom: 12 }}>
            {b.title && <div style={{ fontSize: 11, fontWeight: 800, color: PC.navy, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{b.title}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(b.items || []).map((it, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: PC.ink, lineHeight: 1.5 }}>
                  <span style={{ color: PC.sky, marginTop: 1, flexShrink: 0 }}>▸</span><span>{it}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'table':
        return (
          <div key={i} style={{ marginBottom: 12, overflow: 'auto', borderRadius: 10, border: `1px solid ${PC.border}` }}>
            {b.title && <div style={{ padding: '8px 12px', background: PC.gutter, fontSize: 11, fontWeight: 800, color: PC.navy, borderBottom: `1px solid ${PC.border}` }}>{b.title}</div>}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr>
                  {(b.headers || []).map((h, j) => <th key={j} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 800, color: PC.muted, textTransform: 'uppercase', letterSpacing: '.04em', background: PC.faint, borderBottom: `1px solid ${PC.border}`, whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(b.rows || []).map((row, j) => (
                  <tr key={j}>
                    {row.map((c, k) => <td key={k} style={{ padding: '8px 12px', borderBottom: j < (b.rows || []).length - 1 ? `1px solid ${PC.border}66` : 'none', color: PC.ink, verticalAlign: 'top' }}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'timeline':
        return (
          <div key={i} style={{ marginBottom: 12, padding: '12px 14px', borderRadius: 10, background: PC.faint, border: `1px solid ${PC.border}` }}>
            {b.title && <div style={{ fontSize: 11, fontWeight: 800, color: PC.navy, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.04em' }}>{b.title}</div>}
            {(b.items || []).map((it, j) => (
              <div key={j} style={{ display: 'flex', gap: 10, marginBottom: j < (b.items || []).length - 1 ? 10 : 0 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: PC.skySoft, color: PC.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{j + 1}</span>
                <span style={{ fontSize: 11.5, color: PC.ink, lineHeight: 1.5 }}>{it}</span>
              </div>
            ))}
          </div>
        )
      case 'bundle':
        return <BundleCard key={i} title={b.title || 'Care Bundle'} items={b.items || []} />
      default:
        return null
    }
  })
}

export function BundleCard({ title, items, editable }: { title: string; items: string[]; editable?: boolean }) {
  const [state, setState] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map((_, i) => [i, i < 2])))
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completed = Object.values(state).filter(Boolean).length

  const start = () => {
    setRunning(true)
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }
  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRunning(false)
  }

  return (
    <div style={{ marginBottom: 12, borderRadius: 14, border: `1px solid ${PC.sky}44`, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', background: `linear-gradient(135deg, ${PC.skySoft}, #f0f9ff)`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Timer size={16} color={PC.sky} />
        <span style={{ fontSize: 13, fontWeight: 800, color: PC.navy, flex: 1 }}>{title}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: PC.sky }}>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </span>
      </div>
      <div style={{ padding: '10px 14px 14px', background: PC.card }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {items.map((it, i) => (
            <CheckItem key={i} done={!!state[i]} label={it} onClick={() => setState(s => ({ ...s, [i]: !s[i] }))} />
          ))}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ width: `${(completed / items.length) * 100}%`, height: '100%', background: PC.green, borderRadius: 4, transition: 'width .2s' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: completed === items.length ? PC.green : PC.slate }}>{completed}/{items.length}</span>
          <button onClick={() => running ? stop() : start()} style={pc.btn(running)}>{running ? 'Stop' : 'Start Timer'}</button>
          {!editable && <button onClick={() => { stop(); setSeconds(0); setState(s => Object.fromEntries(items.map((_, i) => [i, i < 2]))) }} style={pc.btn()}>Reset</button>}
        </div>
      </div>
    </div>
  )
}

function EditorWorkspace({ protocol, section, draft, setDraft, dirty }: { protocol: Protocol; section?: ProtocolSection; draft: Partial<Record<string, string>>; setDraft: (d: Partial<Record<string, string>>) => void; dirty: boolean }) {
  return (
    <div style={pc.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: `1px solid ${PC.border}`, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: PC.navy }}>{section?.title || 'Section'}</div>
          <div style={{ fontSize: 10, color: PC.muted, marginTop: 2 }}>{protocol.name} · v{protocol.version} · {section?.id}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={pc.btn()} onClick={() => setDraft({})} disabled={!dirty}><Eye size={13} /> Live Preview</button>
          <button style={{ ...pc.btn(true), opacity: dirty ? 1 : 0.5 }} disabled={!dirty}>Save Changes</button>
        </div>
      </div>
      {section ? renderBlocks(section.blocks) : <div style={{ fontSize: 12, color: PC.muted }}>Select a section to edit.</div>}
      <div style={{ marginTop: 6, paddingTop: 14, borderTop: `1px solid ${PC.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: PC.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Executable Rule Draft</div>
        <textarea
          value={draft[section?.id || ''] || ''}
          onChange={e => setDraft({ ...draft, [section?.id || '']: e.target.value })}
          placeholder="e.g. If Lactate > 4 AND SBP < 90 THEN activate Septic Shock Alert, notify ICU & Emergency…"
          rows={3}
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: `1px solid ${PC.border}`, padding: '10px 12px', fontSize: 12, fontFamily: 'monospace', outline: 'none', resize: 'vertical', background: '#0f172a', color: '#e2e8f0' }}
        />
      </div>
    </div>
  )
}

function EditorRightPanel({ protocol }: { protocol: Protocol }) {
  const groups = [
    { icon: ListChecks, color: PC.sky, label: 'Linked Order Sets', items: protocol.linked.orderSets },
    { icon: Boxes, color: PC.green, label: 'Linked Care Bundles', items: protocol.linked.careBundles },
    { icon: Pill, color: PC.purple, label: 'Linked Drug Formulary', items: protocol.linked.drugs },
    { icon: FlaskConical, color: PC.amber, label: 'Linked Laboratory Rules', items: protocol.linked.labRules },
    { icon: Network, color: PC.cyan, label: 'Protocol Dependencies', items: protocol.linked.dependencies },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 0 }}>
      <div style={{ ...pc.card, padding: 12, background: `linear-gradient(135deg, #f5f3ff, #fff)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Brain size={14} color={PC.purple} />
          <span style={{ fontSize: 12, fontWeight: 800, color: PC.navy }}>Live AI Simulation</span>
        </div>
        <div style={{ fontSize: 11, color: PC.slate, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: PC.purple }}>Patient 74 y:</span> BP 78/40 · Lactate 6.8 · SpO₂ 89 · Temp 39.4
        </div>
        <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: PC.red, background: `${PC.red}0d`, padding: '8px 10px', borderRadius: 8, border: `1px solid ${PC.red}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Siren size={13} /> SEPSIS SIX ACTIVATED
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={pc.chip}>0:17 elapsed</span>
          <span style={pc.chip}>3/6 complete</span>
          <span style={pc.chip}>ICU alerted</span>
        </div>
      </div>

      <div style={pc.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Layers size={14} color={PC.sky} />
          <span style={{ fontSize: 12, fontWeight: 800, color: PC.navy }}>Connected Intelligence</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groups.map(g => (
            <div key={g.label} style={{ border: `1px solid ${PC.border}`, borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: g.items.length ? 6 : 0 }}>
                <g.icon size={12} color={g.color} />
                <span style={{ fontSize: 10.5, fontWeight: 800, color: PC.slate }}>{g.label}</span>
              </div>
              {g.items.length ? g.items.map(it => (
                <div key={it} style={{ fontSize: 10.5, color: PC.ink, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: g.color, flexShrink: 0 }} /> {it}
                </div>
              )) : <div style={{ fontSize: 10, color: PC.muted }}>Not linked yet</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={pc.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <GitBranch size={14} color={PC.green} />
          <span style={{ fontSize: 12, fontWeight: 800, color: PC.navy }}>Version History</span>
        </div>
        {[['v4.1', 'Current', PC.green], ['v4.0', 'Archived', PC.muted], ['v3.2', 'Archived', PC.muted], ['v3.0', 'Archived', PC.muted]].map(([v, s, c]) => (
          <div key={v as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: c as string }}>{v}</span>
            <span style={{ fontSize: 10, color: PC.muted }}>{s}</span>
            <span style={{ marginLeft: 'auto' }}><FlaskRound size={12} color={PC.muted} /></span>
          </div>
        ))}
        <button style={{ ...pc.btn(), width: '100%', justifyContent: 'center', marginTop: 6 }}><GitBranch size={12} /> Compare Versions</button>
      </div>

      <div style={pc.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Activity size={14} color={PC.cyan} />
          <span style={{ fontSize: 12, fontWeight: 800, color: PC.navy }}>Outcome Analytics</span>
        </div>
        <OutcomeBars protocol={protocol} />
      </div>
    </div>
  )
}

export function OutcomeBars({ protocol }: { protocol: Protocol }) {
  const rows = [
    { label: 'Uses', value: protocol.outcome.uses, max: Math.max(protocol.outcome.uses, 100), color: PC.sky },
    { label: 'Compliance', value: protocol.outcome.compliance, max: 100, color: PC.green },
    { label: 'Mortality', value: protocol.outcome.mortality, max: 100, color: PC.red },
    { label: 'Deviations', value: protocol.outcome.deviations, max: 100, color: PC.amber },
    { label: 'AI Triggers', value: protocol.outcome.triggers, max: Math.max(protocol.outcome.triggers, 100), color: PC.purple },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map(r => (
        <div key={r.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: PC.slate, marginBottom: 3 }}>
            <span>{r.label}</span><b style={{ color: PC.navy }}>{r.value}</b>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: '#eef2f7', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((r.value / r.max) * 100, 100)}%`, height: '100%', background: r.color, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
