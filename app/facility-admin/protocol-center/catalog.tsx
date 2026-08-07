'use client'

import { useState } from 'react'
import { Route, GitFork, Boxes, ClipboardList, BookOpen, FileStack, ScrollText, Pill, FlaskConical, Power, FileText, Search, ClipboardX, ListChecks, CheckCircle2 } from 'lucide-react'
import { PC, pc, SectionCard, StatusPill, Collapsible, ViewHeader } from './ui'
import { BundleCard } from './library'
import { PATHWAYS, DECISION_TREES, CARE_BUNDLES, ORDER_SETS, GUIDELINES, POLICIES, SOPS, FORMULARY, REFERENCE_RANGES, type Pathway } from './data'

export function PathwaysView() {
  const [sel, setSel] = useState<Pathway>(PATHWAYS[0])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ViewHeader icon={<Route size={18} color={PC.purple} />} title="Clinical Pathways" subtitle="Entire patient journeys — triage to discharge — executed step by step." action={<button style={pc.btn(true)}><FileText size={13} /> New Pathway</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PATHWAYS.map(p => (
            <button key={p.id} onClick={() => setSel(p)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${sel.id === p.id ? PC.sky : PC.border}`, background: sel.id === p.id ? PC.skySoft : '#fff', cursor: 'pointer' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: PC.navy }}>{p.name}</div>
              <div style={{ fontSize: 10, color: PC.muted, marginTop: 2 }}>{p.steps.length} steps · v{p.version} · {p.patients} patients</div>
            </button>
          ))}
        </div>
        <PathwayFlow path={sel} />
      </div>
    </div>
  )
}

function PathwayFlow({ path }: { path: Pathway }) {
  return (
    <div style={pc.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: PC.navy }}>{path.name}</div>
          <div style={{ fontSize: 10, color: PC.muted }}>Owner: {path.owner} · v{path.version}</div>
        </div>
        <StatusPill status={path.status} />
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
        {path.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: s.decision ? 8 : '50%', background: s.decision ? `${PC.amber}18` : PC.skySoft, border: `1.5px solid ${s.decision ? PC.amber : PC.sky}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.decision ? PC.amber : PC.sky, fontSize: 11, fontWeight: 800 }}>
                {i + 1}
              </div>
              {i < path.steps.length - 1 && <span style={{ width: 2, flex: 1, background: '#dbe4ee', minHeight: 22 }} />}
            </div>
            <div style={{ paddingBottom: i < path.steps.length - 1 ? 14 : 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: PC.navy }}>{s.label}</span>
                {s.decision && <span style={pc.pill(PC.amber, `${PC.amber}18`)}>Decision</span>}
                <span style={{ fontSize: 10, color: PC.muted }}>{s.duration}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: PC.slate, background: '#f1f5f9', padding: '2px 8px', borderRadius: 10 }}>{s.owner}</span>
              </div>
              <div style={{ fontSize: 11, color: PC.slate, marginTop: 3, lineHeight: 1.5 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AlgorithmsView() {
  const [sel, setSel] = useState(DECISION_TREES[0].id)
  const [trail, setTrail] = useState<{ question: string; answer: string }[]>([])
  const tree = DECISION_TREES.find(t => t.id === sel)!
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GitFork size={18} color={PC.amber} />
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Clinical Algorithms</h2>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DECISION_TREES.map(t => (
            <button key={t.id} onClick={() => { setSel(t.id); setTrail([]) }} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${t.id === sel ? PC.skyW : PC.border}`, background: t.id === sel ? PC.skySoft : '#fff', color: t.id === sel ? PC.skyW : PC.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{t.name}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 14, alignItems: 'start' }}>
        <div style={{ ...pc.card, background: 'linear-gradient(180deg,#f8fbff,#fff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: PC.navy }}>{tree.name}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={pc.chip}>v{tree.version}</span>
              <span style={pc.chip}>{tree.dept}</span>
              <span style={pc.chip}>Updated {tree.updated}</span>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {tree.steps.map((step, i) => (
              <StepNode key={i} q={step.q} branches={step.branches} index={i} />
            ))}
          </div>
        </div>
        <div style={pc.card}>
          <div style={{ fontSize: 12, fontWeight: 800, color: PC.navy, marginBottom: 10 }}>Decision Trail</div>
          {trail.length === 0 ? (
            <div style={{ fontSize: 11, color: PC.muted, lineHeight: 1.6 }}>Follow the branches to build the executed path. Every decision is recorded for reproducibility (Law III).</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trail.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: PC.skySoft, color: PC.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: PC.ink }}>{t.question}</div>
                    <div style={{ fontSize: 10.5, color: PC.sky }}>→ {t.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepNode({ q, branches, index }: { q: string; branches: { label: string; next?: string; result?: string }[]; index: number }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const answer = chosen !== null ? branches[chosen] : null
  return (
    <div style={{ flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 560 }}>
      <div style={{ width: '100%', borderRadius: 12, border: `1px solid ${PC.sky}44`, background: '#fff', padding: '14px 16px', position: 'relative' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: PC.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Step {index + 1}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>{q}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {branches.map((b, i) => (
            <button key={i} onClick={() => setChosen(i)} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer',
              background: chosen === i ? (b.result ? `${PC.green}18` : PC.sky) : '#fff',
              color: chosen === i ? (b.result ? PC.green : '#fff') : PC.slate,
              border: `1.5px solid ${chosen === i ? (b.result ? PC.green : PC.sky) : PC.border}`,
            }}>{b.label}</button>
          ))}
        </div>
      </div>
      {answer && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="2" height="22"><line x1="1" y1="0" x2="1" y2="22" stroke="#cbd5e1" /></svg>
          {answer.result ? (
            <div style={{ borderRadius: 10, border: `1.5px solid ${PC.green}55`, background: `${PC.green}0d`, padding: '10px 16px', fontSize: 12, color: PC.green, fontWeight: 700, textAlign: 'center', maxWidth: 420 }}>
              ✓ {answer.result}
            </div>
          ) : (
            <div style={{ borderRadius: 10, padding: '7px 16px', fontSize: 11, fontWeight: 700, color: PC.sky, background: PC.skySoft, border: `1px solid ${PC.sky}44`, textAlign: 'center' }}>→ {answer.next}</div>
          )}
        </div>
      )}
    </div>
  )
}

export function BundlesView() {
  const featured = CARE_BUNDLES.find(b => b.id === 'sepsis-six')
  const rest = CARE_BUNDLES.filter(b => b.id !== 'sepsis-six')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Boxes size={18} color={PC.green} />
        <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Care Bundles</h2>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: PC.muted }}>Administrator monitors compliance in real time</span>
      </div>
      {featured && (
        <SectionCard title="Sepsis Six — Interactive Bundle" subtitle="Timed, executable bundle card. Nurses check off items; the compliance timer runs for the administrator.">
          <BundleCard title={featured.name} items={featured.items.map(i => i.label)} />
        </SectionCard>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {rest.map(b => (
          <div key={b.id} style={pc.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>{b.name}</span>
              <StatusPill status={b.compliance >= 85 ? 'current' : 'review'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: PC.muted, marginBottom: 3 }}><span>Compliance</span><b style={{ color: b.compliance >= 85 ? PC.green : PC.amber }}>{b.compliance}%</b></div>
                <div style={{ height: 6, borderRadius: 4, background: '#eef2f7', overflow: 'hidden' }}>
                  <div style={{ width: `${b.compliance}%`, height: '100%', background: b.compliance >= 85 ? PC.green : PC.amber, borderRadius: 4 }} />
                </div>
              </div>
              <span style={pc.chip}>{b.items.length} items</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {b.items.map((it, i) => <span key={i} style={pc.chip}>✓ {it.label}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrderSetsView() {
  const [selId, setSelId] = useState(ORDER_SETS[0].id)
  const [generated, setGenerated] = useState<string | null>(null)
  const set = ORDER_SETS.find(o => o.id === selId)!
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ListChecks size={18} color={PC.sky} />
        <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Order Sets</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ORDER_SETS.map(o => (
          <button key={o.id} onClick={() => { setSelId(o.id); setGenerated(null) }} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${o.id === selId ? PC.sky : PC.border}`, background: o.id === selId ? PC.skySoft : '#fff', color: o.id === selId ? PC.skyW : PC.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{o.name}</button>
        ))}
      </div>
      <div style={pc.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: PC.navy }}>{set.name}</div>
            <div style={{ fontSize: 11, color: PC.slate }}>Generated for {set.indication} · v{set.version}</div>
          </div>
          <button onClick={() => setGenerated(set.id)} style={pc.btn(true)} disabled={!!generated}>{generated ? 'Orders Generated ✓' : 'Generate All Orders — 1 Click'}</button>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {set.groups.map(g => (
            <div key={g.group} style={{ border: `1px solid ${generated === set.id ? `${PC.green}44` : PC.border}`, borderRadius: 12, padding: '10px 12px', background: generated === set.id ? `${PC.green}05` : '#f8fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Power size={12} color={g.auto === false ? PC.muted : PC.sky} />
                <span style={{ fontSize: 11, fontWeight: 800, color: PC.navy, textTransform: 'uppercase', letterSpacing: '.04em' }}>{g.group}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {g.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, color: PC.ink }}>
                    {generated === set.id ? <CheckCircle2 size={12} color={PC.green} style={{ marginTop: 1, flexShrink: 0 }} /> : <span style={{ color: PC.sky, flexShrink: 0 }}>•</span>}
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function GuidelinesView() {
  return (
    <DocList icon={<BookOpen size={18} color={PC.purple} />} title="Clinical Guidelines" subtitle="National & international evidence-based guidelines, versioned and executable." rows={GUIDELINES} action={<button style={pc.btn(true)}><FileText size={13} /> Import Guideline</button>} />
  )
}

export function PoliciesView() {
  return <DocList icon={<ScrollText size={18} color={PC.cyan} />} title="Hospital Policies" subtitle="Governance, safety and operational policy library." rows={POLICIES} action={<button style={pc.btn(true)}><FileText size={13} /> New Policy</button>} />
}

function DocList({ icon, title, subtitle, rows, action }: { icon: React.ReactNode; title: string; subtitle: string; rows: { id: string; title: string; authority?: string; dept?: string; version: string; status: string; updated: string }[]; action: React.ReactNode }) {
  const [q, setQ] = useState('')
  const filtered = rows.filter(r => !q || r.title.toLowerCase().includes(q.toLowerCase()) || (r.authority || '').toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon}
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>{title}</h2>
            <div style={{ fontSize: 11, color: PC.muted }}>{subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color={PC.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} style={{ ...pc.input, width: 220, paddingLeft: 30 }} />
          </div>
          {action}
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(r => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(120px,0.8fr) 110px 90px auto', gap: 12, alignItems: 'center', padding: '11px 14px', borderRadius: 12, background: '#fff', border: `1px solid ${PC.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>{r.title}</div>
              <div style={{ fontSize: 10, color: PC.muted, marginTop: 1 }}>{r.authority || r.dept || '—'}</div>
            </div>
            <span style={{ fontSize: 11, color: PC.slate }}>v{r.version}</span>
            <StatusPill status={r.status} />
            <span style={{ fontSize: 10, color: PC.muted }}>{r.updated}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={pc.btn()}><FileText size={12} /> View</button>
              <button style={pc.btn()}><ClipboardX size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SopsView() {
  const [open, setOpen] = useState<string | null>('sop1')
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileStack size={18} color={PC.amber} />
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>SOP Library</h2>
          <div style={{ fontSize: 11, color: PC.muted }}>Standard operating procedures — step-by-step executable checklists.</div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SOPS.map(s => (
          <Collapsible key={s.id} title={s.title} badge={<div style={{ display: 'flex', gap: 6 }}><StatusPill status={s.status} /><span style={pc.chip}>{s.dept}</span></div>} defaultOpen={s.id === open}>
            <div style={{ fontSize: 11, color: PC.muted, marginBottom: 10 }}>Owner: {s.owner} · v{s.version}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.steps.map((st, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: PC.ink }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: `${PC.amber}18`, color: PC.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ lineHeight: 1.5 }}>{st}</span>
                </div>
              ))}
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}

export function FormularyView() {
  const [q, setQ] = useState('')
  const rows = FORMULARY.filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.class.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill size={18} color={PC.green} />
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Drug Formulary</h2>
            <div style={{ fontSize: 11, color: PC.muted }}>Hospital formulary, connected to prescribing & AI rules.</div>
          </div>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search drug…" style={{ ...pc.input, maxWidth: 260 }} />
      </div>
      <div style={{ marginTop: 14, overflow: 'auto', borderRadius: 14, border: `1px solid ${PC.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 1100 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Drug', 'Class', 'Dose', 'Indications', 'Contraindications', 'Interactions', 'Pregnancy', 'Pediatric', 'Renal', 'Hepatic', 'Avail', 'Cost'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', fontSize: 10, fontWeight: 800, color: PC.muted, textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap', borderBottom: `1px solid ${PC.border}` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(d => (
              <tr key={d.id} style={{ borderBottom: `1px solid ${PC.border}44` }}>
                <td style={{ padding: '8px 10px', fontWeight: 800, color: PC.navy, whiteSpace: 'nowrap' }}>{d.name}</td>
                <td style={{ padding: '8px 10px', color: PC.slate }}>{d.class}</td>
                <td style={{ padding: '8px 10px', color: PC.ink }}>{d.dose}</td>
                <td style={{ padding: '8px 10px', color: PC.slate, maxWidth: 180 }}>{d.indications}</td>
                <td style={{ padding: '8px 10px', color: PC.red, maxWidth: 140 }}>{d.contraindications}</td>
                <td style={{ padding: '8px 10px', color: PC.slate }}>{d.interactions}</td>
                <td style={{ padding: '8px 10px', color: PC.slate }}>{d.pregnancy}</td>
                <td style={{ padding: '8px 10px', color: PC.slate }}>{d.pediatric}</td>
                <td style={{ padding: '8px 10px', color: PC.slate }}>{d.renal}</td>
                <td style={{ padding: '8px 10px', color: PC.slate }}>{d.hepatic}</td>
                <td style={{ padding: '8px 10px' }}><StatusPill status={d.availability} /></td>
                <td style={{ padding: '8px 10px', color: PC.navy, whiteSpace: 'nowrap' }}>{d.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ReferenceRangesView() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FlaskConical size={18} color={PC.cyan} />
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Laboratory Reference Ranges</h2>
          <div style={{ fontSize: 11, color: PC.muted }}>Hospital / analyser-specific. AMEXAN interprets results against the correct lab.</div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
        {REFERENCE_RANGES.map(r => (
          <div key={r.id} style={pc.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>{r.test}</span>
              <span style={pc.chip}>{r.gender}</span>
            </div>
            <div style={{ fontSize: 10, color: PC.muted, marginTop: 1 }}>Unit: {r.unit}</div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {r.labs.map(l => (
                <div key={l.lab} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: PC.faint }}>
                  <span style={{ fontSize: 11, color: PC.slate, flex: 1 }}>{l.lab}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: PC.skyW }}>{l.value} {r.unit}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, fontSize: 10 }}>
              <span style={pc.pill(PC.red, `${PC.red}12`)}>Critical low: {r.criticalLow}</span>
              <span style={pc.pill(PC.red, `${PC.red}12`)}>Critical high: {r.criticalHigh}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}