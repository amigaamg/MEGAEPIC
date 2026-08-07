'use client'

import { useState } from 'react'
import { Scale, Siren, Search, Plus, Trash2, Bell, AlertTriangle } from 'lucide-react'
import { PC, pc, SectionCard, StatusPill, Toggle, TimelineRow } from './ui'
import { AI_RULES, ESCALATION_RULES, type AiRule } from './data'

export function AiRulesView() {
  const [rules, setRules] = useState<AiRule[]>(AI_RULES)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<{ name: string; condition: string; trigger: string; notify: string; severity: AiRule['severity'] }>({ name: '', condition: 'Lactate > 4 AND SBP < 90', trigger: '', notify: '', severity: 'critical' })

  const toggle = (id: string) => setRules(rs => rs.map(r => r.id === id ? { ...r, active: !r.active } : r))
  const remove = (id: string) => setRules(rs => rs.filter(r => r.id !== id))
  const add = () => {
    if (!draft.name.trim()) return
    const conditions = draft.condition.split(/ AND | OR /i).filter(Boolean)
    const operator = / OR /i.test(draft.condition) ? 'OR' : 'AND'
    setRules(rs => [...rs, {
      id: `rule-${Date.now()}`, name: draft.name.trim(), engine: 'Custom Rule', severity: draft.severity, active: true, triggersCount: 0,
      operator, ifConditions: conditions, trigger: draft.trigger.trim() || draft.name.trim(), notify: draft.notify.split(',').map(s => s.trim()).filter(Boolean),
    }])
    setAdding(false); setDraft({ name: '', condition: 'Lactate > 4 AND SBP < 90', trigger: '', notify: '', severity: 'critical' })
  }

  const filtered = rules.filter(r => {
    if (cat !== 'all' && r.severity !== cat) return false
    if (q) return r.name.toLowerCase().includes(q.toLowerCase()) || r.ifConditions.join(' ').toLowerCase().includes(q.toLowerCase())
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Scale size={18} color={PC.sky} />
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>AI Rules Console</h2>
            <div style={{ fontSize: 11, color: PC.muted }}>Configure IF / THEN triggers. The entire hospital changes instantly on publish.</div>
          </div>
        </div>
        <button onClick={() => setAdding(o => !o)} style={pc.btn(true)}><Plus size={14} /> New AI Rule</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 10 }}>
        <MiniStat label="Total Rules" value={rules.length} color={PC.navy} />
        <MiniStat label="Active" value={rules.filter(r => r.active).length} color={PC.green} />
        <MiniStat label="Critical" value={rules.filter(r => r.severity === 'critical').length} color={PC.red} />
        <MiniStat label="Triggers (30d)" value={rules.reduce((s, r) => s + r.triggersCount, 0).toLocaleString()} color={PC.purple} />
      </div>

      {adding && (
        <div style={{ ...pc.card, border: `1px solid ${PC.sky}55` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: PC.navy, marginBottom: 10 }}>New Executable Rule</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label style={label}>Rule name<input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Septic Shock Alert" style={pc.input} /></label>
            <label style={label}>IF conditions (use AND / OR)
              <input value={draft.condition} onChange={e => setDraft({ ...draft, condition: e.target.value })} placeholder="Lactate > 4 AND SBP < 90" style={{ ...pc.input, fontFamily: 'monospace' }} /></label>
            <label style={label}>THEN trigger<input value={draft.trigger} onChange={e => setDraft({ ...draft, trigger: e.target.value })} placeholder="Septic Shock Alert" style={pc.input} /></label>
            <label style={label}>Notify (comma separated)<input value={draft.notify} onChange={e => setDraft({ ...draft, notify: e.target.value })} placeholder="ICU, Emergency, Consultant" style={pc.input} /></label>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: PC.slate }}>Severity</span>
            {(['info', 'warning', 'critical'] as const).map(s => (
              <button key={s} onClick={() => setDraft({ ...draft, severity: s })} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${draft.severity === s ? sevColor(s) : PC.border}`, background: draft.severity === s ? `${sevColor(s)}18` : '#fff', color: draft.severity === s ? sevColor(s) : PC.slate }}>{s}</button>
            ))}
            <span style={{ flex: 1 }} />
            <button style={pc.btn(true)} onClick={add}>Save Rule</button>
            <button style={pc.btn()} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={13} color={PC.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search rules…" value={q} onChange={e => setQ(e.target.value)} style={{ ...pc.input, paddingLeft: 30 }} />
        </div>
        {[['all', 'All'], ['critical', 'Critical'], ['warning', 'Warning'], ['info', 'Info']].map(([v, l]) => (
          <button key={v} onClick={() => setCat(v)} style={chipBtn(cat === v)}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(r => (
          <div key={r.id} style={{ padding: '12px 14px', borderRadius: 12, background: '#fff', border: `1px solid ${r.active ? `${sevColor(r.severity)}33` : PC.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: sevColor(r.severity) }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>{r.name}</span>
              <span style={pc.chip}>{r.engine}</span>
              <span style={pc.chip}>{r.triggersCount.toLocaleString()} triggers</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <Toggle on={r.active} onChange={() => toggle(r.id)} />
                <button onClick={() => remove(r.id)} style={{ ...pc.btn(), padding: '5px 8px' }}><Trash2 size={13} color={PC.red} /></button>
              </span>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontFamily: 'monospace', fontSize: 11 }}>
              <span style={{ background: PC.faint, borderRadius: 6, padding: '4px 8px', color: PC.slate }}>IF</span>
              {r.ifConditions.map((c, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: PC.skySoft, borderRadius: 6, padding: '4px 8px', color: PC.sky, fontWeight: 700 }}>{c}</span>
                  {i < r.ifConditions.length - 1 && <span style={{ fontSize: 9, fontWeight: 800, color: PC.muted }}>{r.operator}</span>}
                </span>
              ))}
              <span style={{ background: PC.faint, borderRadius: 6, padding: '4px 8px', color: PC.slate }}>THEN</span>
              <span style={{ background: `${PC.purple}12`, borderRadius: 6, padding: '4px 8px', color: PC.purple, fontWeight: 700 }}>{r.trigger}</span>
            </div>
            {r.notify.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell size={12} color={PC.muted} />
                <span style={{ fontSize: 11, color: PC.muted }}>Notify:</span>
                {r.notify.map(n => <span key={n} style={pc.chip}>{n}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function sevColor(s: string) { return s === 'critical' ? PC.red : s === 'warning' ? PC.amber : PC.sky }

function chipBtn(a: boolean) {
  return { padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' as const, background: a ? PC.sky : '#fff', color: a ? '#fff' : PC.slate, border: a ? 'none' : `1px solid ${PC.border}` }
}

const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontWeight: 700, color: PC.slate }

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={pc.card}>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: PC.muted, marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
    </div>
  )
}

export function EscalationRulesView() {
  const [open, setOpen] = useState(ESCALATION_RULES[0].id)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Siren size={18} color={PC.red} />
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Escalation Rules</h2>
          <div style={{ fontSize: 11, color: PC.muted }}>No patient forgotten — every critical trigger escalates until acknowledged.</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ESCALATION_RULES.map(r => (
          <button key={r.id} onClick={() => setOpen(r.id)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${r.id === open ? PC.red : PC.border}`, background: r.id === open ? `${PC.red}0d` : '#fff', color: r.id === open ? PC.red : PC.slate, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>{r.name}</button>
        ))}
      </div>
      {ESCALATION_RULES.filter(r => r.id === open).map(r => (
        <SectionCard key={r.id} title={r.name} subtitle={`Trigger: ${r.trigger}`}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {r.steps.map((s, i) => (
              <TimelineRow key={i} label={s.label} detail={s.action} role={s.role} delay={s.delay} accent={i >= 3 ? PC.red : PC.sky} />
            ))}
          </div>
        </SectionCard>
      ))}
      <div style={{ ...pc.card, background: `${PC.amber}08`, border: `1px solid ${PC.amber}30` }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle size={15} color={PC.amber} style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 11.5, color: PC.slate, lineHeight: 1.6 }}>
            <b style={{ color: PC.amber }}>No acknowledgement → automatic escalation.</b> If a critical result is not acknowledged within the configured delay, the alert walks up the chain to the Medical Director and opens a patient-safety event for review.
          </div>
        </div>
      </div>
    </div>
  )
}