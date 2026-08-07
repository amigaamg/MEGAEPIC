'use client'

import { useState } from 'react'
import { Play, RotateCcw, Brain, Stethoscope, AlertTriangle, Bell, FileText, Activity, Siren } from 'lucide-react'
import { PC, pc } from './ui'
import { SIM_PROFILES, PROTOCOLS, type Protocol } from './data'

interface SimResult {
  protocol: string
  orders: { id: string; label: string; priority: string; auto: boolean }[]
  warnings: string[]
  alerts: { label: string; severity: 'critical' | 'warning' | 'info'; notify: string[] }[]
  recommendations: string[]
  docs: string[]
  escalation: string[]
}

interface SimProfile { id: string; label: string; age: number; bp: string; hr: number; rr: number; spo2: number; temp: number; lactate: number; urine: string }

function runSim(profile: SimProfile, p: Protocol): SimResult {
  const severe = profile.lactate >= 4 || profile.spo2 < 90
  return {
    protocol: p.name,
    orders: [
      { id: 'o1', label: `${p.name} baseline workup — lactate, blood cultures, CBC, U&E, glucose`, priority: 'STAT', auto: true },
      { id: 'o2', label: 'Empiric first-line antimicrobial therapy (within 60 min of time zero)', priority: severe ? 'STAT' : 'Urgent', auto: severe },
      { id: 'o3', label: 'IV fluid resuscitation 30 mL/kg crystalloid', priority: 'STAT', auto: severe },
      { id: 'o4', label: 'Monitoring orders — vitals, urine output, targeted lab repeats', priority: 'Urgent', auto: true },
      { id: 'o5', label: 'Nursing observations + escalation thresholds', priority: 'Urgent', auto: true },
      { id: 'o6', label: 'Documentation template auto-opened for the team', priority: 'Routine', auto: true },
    ],
    warnings: [
      severe ? 'Severe criteria met — urgent senior involvement required.' : 'Borderline physiology — re-screen within 1 h.',
      'Screen for drug allergies and renal function before the antibiotic order fires.',
    ],
    alerts: severe
      ? [
        { label: `${p.name.toUpperCase()} ACTIVATED — critical physiology`, severity: 'critical', notify: ['ICU', 'Emergency', 'Consultant'] },
        { label: `Lactate ${profile.lactate} mmol/L — critical threshold crossed`, severity: 'warning', notify: ['Doctor on call'] },
      ]
      : [{ label: `${p.name} screening triggered`, severity: 'info', notify: ['Ward'] }],
    recommendations: severe
      ? ['Admit to ICU — severe criteria met', 'Consultant review within 15 min', 'Prepare organ-support plan']
      : ['Admit for observation with close monitoring', 'Re-run protocol if no improvement in 6 h'],
    docs: [`${p.name} clerking template pre-filled`, 'Bundle compliance checklist opened', 'Handover note drafted for next shift'],
    escalation: severe
      ? ['00:00 — Ward team + admitting doctor notified', '00:15 — Consultant notified', '00:30 — ICU bed requested', '01:00 — Medical Director flag if unresolved']
      : ['00:00 — Ward team informed', '06:00 — Protocol re-evaluation'],
  }
}

export function SimulatorView() {
  const [profile, setProfile] = useState<SimProfile>(SIM_PROFILES[0])
  const [protocol, setProtocol] = useState<Protocol>(PROTOCOLS[0])
  const [result, setResult] = useState<SimResult | null>(null)

  const reset = () => { setResult(null); setProfile(SIM_PROFILES[0]); setProtocol(PROTOCOLS[0]) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Brain size={18} color={PC.purple} />
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: PC.navy, margin: 0 }}>Protocol Simulator</h2>
          <div style={{ fontSize: 11, color: PC.muted }}>Test any protocol against a virtual patient before deployment — unique to AMEXAN.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            <Panel title="Virtual Patient" icon={<Stethoscope size={14} color={PC.sky} />}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {SIM_PROFILES.map(p => (
                  <button key={p.id} onClick={() => { setProfile(p); setResult(null) }} style={profileChip(p.id === profile.id)}>{p.label}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8 }}>
                <Vital label="Age" value={`${profile.age} y`} />
                <Vital label="BP" value={profile.bp} critical={profile.lactate >= 4} />
                <Vital label="HR" value={`${profile.hr}`} />
                <Vital label="RR" value={`${profile.rr}`} />
                <Vital label="SpO₂" value={`${profile.spo2}%`} critical={profile.spo2 < 90} />
                <Vital label="Temp" value={`${profile.temp}°C`} critical={profile.temp >= 39} />
                <Vital label="Lactate" value={`${profile.lactate}`} critical={profile.lactate >= 4} />
                <Vital label="Urine" value={profile.urine} />
              </div>
            </Panel>
            <Panel title="Protocol Under Test" icon={<Activity size={14} color={PC.green} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PROTOCOLS.slice(0, 7).map(p => (
                  <button key={p.id} onClick={() => { setProtocol(p); setResult(null) }} style={{ textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: `1px solid ${p.id === protocol.id ? PC.sky : PC.border}`, background: p.id === protocol.id ? PC.skySoft : '#fff', color: p.id === protocol.id ? PC.sky : PC.slate, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                    {p.name} <span style={{ fontWeight: 500, color: PC.muted }}>· v{p.version}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setResult(runSim(profile, protocol))} style={pc.btn(true)}><Play size={14} /> Run {protocol.name}</button>
            <button onClick={reset} style={pc.btn()}><RotateCcw size={13} /> Reset</button>
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ ...pc.card, border: `1px solid ${PC.green}44`, background: 'linear-gradient(180deg,#f8fffb,#fff)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <CheckCircle size={16} color={PC.green} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: PC.navy }}>Simulation complete — {result.protocol}</span>
                  <StatusText />
                </div>
              </div>
              <SimSection icon={<ListChecksIcon />} title="Generated Orders" color={PC.sky}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.orders.map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: PC.faint, fontSize: 11.5, color: PC.ink }}>
                      <span style={prioPill(o.priority)}>{o.priority}</span>
                      <span style={{ flex: 1 }}>{o.label}</span>
                      <span style={{ fontSize: 10, color: o.auto ? PC.green : PC.amber, fontWeight: 700 }}>{o.auto ? 'AUTO' : 'REQUIRES APPROVAL'}</span>
                    </div>
                  ))}
                </div>
              </SimSection>
              <SimSection icon={<BellIcon />} title="Alerts & Notifications" color={PC.red}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.alerts.map((a, i) => (
                    <div key={i} style={{ padding: '9px 10px', borderRadius: 8, background: a.severity === 'critical' ? `${PC.red}0d` : a.severity === 'warning' ? `${PC.amber}0d` : PC.faint, border: `1px solid ${a.severity === 'critical' ? PC.red : a.severity === 'warning' ? PC.amber : PC.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={12} color={a.severity === 'critical' ? PC.red : a.severity === 'warning' ? PC.amber : PC.sky} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: PC.navy }}>{a.label}</span>
                      </div>
                      <div style={{ fontSize: 10, color: PC.muted, marginTop: 3 }}>Notify: {a.notify.join(' · ')}</div>
                    </div>
                  ))}
                </div>
              </SimSection>
              <SimSection icon={<DocIcon />} title="AI Recommendations & Documentation" color={PC.purple}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: PC.muted, textTransform: 'uppercase', marginBottom: 6 }}>AI Guidance</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {result.recommendations.map((r, i) => <div key={i} style={{ fontSize: 11, color: PC.ink }}>▸ {r}</div>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: PC.muted, textTransform: 'uppercase', marginBottom: 6 }}>Documentation</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {result.docs.map((d, i) => <div key={i} style={{ fontSize: 11, color: PC.ink }}>▸ {d}</div>)}
                    </div>
                  </div>
                </div>
              </SimSection>
              <SimSection icon={<SirenIcon />} title="Escalation Path" color={PC.amber}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.escalation.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${PC.amber}18`, color: PC.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 11.5, color: PC.ink }}>{e}</span>
                    </div>
                  ))}
                </div>
              </SimSection>
            </div>
          ) : (
            <div style={{ ...pc.card, textAlign: 'center', padding: '30px 20px', border: `1px dashed ${PC.border}` }}>
              <Brain size={26} color={PC.purple} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>Ready to simulate</div>
              <div style={{ fontSize: 11, color: PC.muted, marginTop: 4, maxWidth: 420, margin: '4px auto 0' }}>Choose a virtual patient and a protocol, then press Run. AMEXAN will show every order, alert, AI recommendation, documentation template and escalation the protocol fires before you deploy it.</div>
            </div>
          )}
        </div>

        <div style={{ ...pc.card, background: `${PC.purple}06`, border: `1px solid ${PC.purple}22` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: PC.navy, marginBottom: 8 }}>Why simulate?</div>
          <div style={{ fontSize: 11.5, color: PC.slate, lineHeight: 1.7 }}>
            Test protocol behaviour against edge-case patients, verify escalation chains fire correctly, and preview documentation before anything goes live. No patient is ever exposed to an untested rule.
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: PC.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Also verify</div>
            {['Order set completeness', 'AI trigger thresholds', 'Escalation acknowledgement', 'Compliance reporting'].map((t, i) => (
              <div key={i} style={{ fontSize: 11, color: PC.ink, display: 'flex', gap: 6 }}><CheckIcon /> {t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function profileChip(active: boolean) {
  return { padding: '5px 10px', borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: 'pointer' as const, background: active ? PC.sky : '#fff', color: active ? '#fff' : PC.slate, border: active ? 'none' : `1px solid ${PC.border}` }
}
function prioPill(p: string) {
  const c = p === 'STAT' ? PC.red : p === 'Urgent' ? PC.amber : PC.sky
  return { padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 800, background: `${c}18`, color: c, flexShrink: 0 }
}
function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={pc.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 800, color: PC.navy }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
function Vital({ label, value, critical }: { label: string; value: string | number; critical?: boolean }) {
  return (
    <div style={{ background: critical ? `${PC.red}0d` : PC.faint, border: `1px solid ${critical ? `${PC.red}44` : PC.border}`, borderRadius: 10, padding: '8px 10px' }}>
      <div style={{ fontSize: 9.5, color: critical ? PC.red : PC.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: critical ? PC.red : PC.navy }}>{value}</div>
    </div>
  )
}
function SimSection({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={pc.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 12.5, fontWeight: 800, color: PC.navy }}>{title}</span>
        <span style={{ marginLeft: 'auto' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} /></span>
      </div>
      {children}
    </div>
  )
}
function StatusText() {
  return <span style={{ marginLeft: 'auto', fontSize: 10, color: PC.muted }}>deployed: no — preview only</span>
}
function ListChecksIcon() { return <FileText size={14} color={PC.sky} /> }
function BellIcon() { return <Bell size={14} color={PC.red} /> }
function DocIcon() { return <Brain size={14} color={PC.purple} /> }
function SirenIcon() { return <Siren size={14} color={PC.amber} /> }
function CheckIcon() { return <span style={{ color: PC.green }}>✓</span> }
function CheckCircle({ size, color }: { size: number; color: string }) { return <span style={{ color, fontSize: size, lineHeight: 1 }}>✓</span> }