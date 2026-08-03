'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { C } from '@/lib/colors'
import {
  User, Phone, Calendar, MapPin, Activity, FileText, ClipboardList,
  Pill, FlaskConical, AlertTriangle, CheckCircle2, ArrowRight,
  Users, MessageSquare, Stethoscope, FilePlus2, Loader2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getActiveOrganizationId } from '@/lib/firebase/orgContext'
import {
  getPatientRecord, getPatientEncounters, getPatientLifeline,
  formatAge, initialOf, type PatientRecord,
} from '@/lib/firebase/patientService'

type TabKey = 'overview' | 'timeline' | 'encounters' | 'tasks' | 'notes' | 'orders'

interface EncounterSummary {
  id: string
  encounterType?: string
  patientName?: string
  status?: string
  createdAt?: number
}

interface LifelineEntry {
  id: string
  type: string
  title: string
  detail?: string
  byName?: string
  byRole?: string
  acknowledged?: boolean
  createdAt?: number
}

export default function PatientWorkspacePage({ params }: { params: { pid: string } }) {
  const orgId = getActiveOrganizationId() || ''

  const [patient, setPatient] = useState<(PatientRecord & { id: string }) | null>(null)
  const [encounters, setEncounters] = useState<EncounterSummary[]>([])
  const [lifeline, setLifeline] = useState<LifelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  useEffect(() => {
    if (!orgId) return
    getPatientRecord(orgId, params.pid)
      .then(async (rec) => {
        if (rec) {
          setPatient(rec)
          const [encs, life] = await Promise.all([
            getPatientEncounters(orgId, params.pid).catch(() => []),
            getPatientLifeline(orgId, params.pid).catch(() => []),
          ])
          setEncounters(encs as EncounterSummary[])
          setLifeline(life as LifelineEntry[])
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [orgId, params.pid])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
        <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 13 }}>Loading patient workspace…</span>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.sky + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <User size={28} color={C.sky} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Patient not found</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px' }}>
            No patient record matches <strong>{params.pid}</strong> in the active organization.
          </p>
          <Link href="/patient/register" style={{ padding: '10px 20px', borderRadius: 8, background: C.sky, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FilePlus2 size={15} /> Register Patient
          </Link>
        </div>
      </div>
    )
  }

  if (!patient) return null

  const p = patient

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Activity size={14} /> },
    { key: 'timeline', label: 'Timeline', icon: <MessageSquare size={14} /> },
    { key: 'encounters', label: 'Encounters', icon: <ClipboardList size={14} /> },
    { key: 'tasks', label: 'Tasks', icon: <CheckCircle2 size={14} /> },
    { key: 'notes', label: 'Notes', icon: <FileText size={14} /> },
    { key: 'orders', label: 'Orders', icon: <Pill size={14} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <Header pid={params.pid} />

      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {/* Identity card */}
        <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.sky + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: C.sky }}>{initialOf(p.fullName || p.givenName)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{p.fullName || `${p.givenName} ${p.familyName}`.trim()}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {formatAge(p.dateOfBirth)} · {p.sex}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {p.phone || '—'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {[p.address?.county, p.address?.city].filter(Boolean).join(' · ') || '—'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>ID {p.amxpId || params.pid}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Link href="/encounter-center" style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 11, textDecoration: 'none', color: 'var(--text-primary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Stethoscope size={13} /> New Encounter</span>
              </Link>
              <Link href={`/patient/${params.pid}/edit`} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: C.sky, color: C.white, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                Edit
              </Link>
            </div>
          </div>

          {/* Clinical summary strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 16 }}>
            {[
              { label: 'Blood Group', value: p.bloodGroup || '—', icon: <FlaskConical size={13} color="#7C3AED" /> },
              { label: 'Allergies', value: p.allergies?.length ? p.allergies.join(', ') : 'None listed', icon: <AlertTriangle size={13} color="#F59E0B" /> },
              { label: 'Next of Kin', value: p.emergencyContact?.name || '—', icon: <Users size={13} color="#10B981" /> },
              { label: 'Active', value: p.active ? 'Yes' : 'No', icon: <CheckCircle2 size={13} color="#10B981" /> },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Universal workspace: four questions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { q: 'What do I need?', a: p.fullName || 'Patient', icon: <User size={15} color={C.sky} /> },
            { q: 'What am I doing?', a: 'Review this patient, their status, and decide next care.', icon: <Stethoscope size={15} color="#10B981" /> },
            { q: 'What requires attention?', a: unreadCount(encounters, lifeline) ? `${unreadCount(encounters, lifeline)} outstanding items for this patient.` : 'No open alerts for this patient.', icon: <AlertTriangle size={15} color="#F59E0B" /> },
            { q: 'What happens next?', a: 'Next review, next order, next follow-up.', icon: <ArrowRight size={15} color="#7C3AED" /> },
          ].map(card => (
            <div key={card.q} style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{card.q}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{card.a}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid var(--surface-border)',
                background: activeTab === t.key ? C.sky : 'var(--surface-card)', color: activeTab === t.key ? C.white : 'var(--text-primary)',
                cursor: 'pointer', fontSize: 11, fontWeight: activeTab === t.key ? 600 : 500,
                display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
              }}
            >{t.icon} {t.label}</button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab encounters={encounters} lifeline={lifeline} />}
        {activeTab === 'timeline' && <TimelineTab lifeline={lifeline} />}
        {activeTab === 'encounters' && <EncountersTab encounters={encounters} />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </div>
    </div>
  )
}

function Header({ pid }: { pid: string }) {
  const { user, logout } = useAuth()
  return (
    <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
      <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Patient Workspace</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{pid}</span>
      <div style={{ flex: 1 }} />
      {user && (
        <>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</span>
          <button onClick={logout} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 11 }}>Sign out</button>
        </>
      )}
    </div>
  )
}

function unreadCount(encounters: EncounterSummary[], lifeline: LifelineEntry[]): number {
  return lifeline.filter(e => e.type === 'alert' && !e.acknowledged).length + encounters.filter(e => e.status === 'active').length
}

function OverviewTab({ encounters, lifeline }: { encounters: EncounterSummary[]; lifeline: LifelineEntry[] }) {
  const recent = lifeline.slice(0, 5)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Panel title="Recent Activity" icon={<Activity size={13} color={C.sky} />}>
        {recent.length === 0 ? (
          <Empty text="No activity recorded yet." />
        ) : (
          recent.map(e => (
            <div key={e.id} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 11, marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{e.title || e.type}</span>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{fmtDate(e.createdAt)}</span>
            </div>
          ))
        )}
      </Panel>
      <Panel title="Encounters" icon={<ClipboardList size={13} color="#10B981" />}>
        {encounters.length === 0 ? (
          <Empty text="No encounters yet." />
        ) : (
          encounters.map(e => (
            <div key={e.id} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 11, marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{e.encounterType || 'Encounter'}</span>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{e.status || 'active'}</span>
            </div>
          ))
        )}
      </Panel>
    </div>
  )
}

function TimelineTab({ lifeline }: { lifeline: LifelineEntry[] }) {
  return (
    <Panel title="Patient Timeline" icon={<MessageSquare size={13} color={C.sky} />}>
      {lifeline.length === 0 ? <Empty text="No timeline events." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lifeline.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.sky, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{e.title || e.type}</div>
                {e.detail && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{e.detail}</div>}
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {fmtDate(e.createdAt)}{e.byName ? ` · ${e.byName}` : ''}{e.byRole ? ` (${e.byRole})` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

function EncountersTab({ encounters }: { encounters: EncounterSummary[] }) {
  return (
    <Panel title="All Encounters" icon={<ClipboardList size={13} color={C.sky} />}>
      {encounters.length === 0 ? <Empty text="No encounters yet." /> : (
        encounters.map(e => (
          <div key={e.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{e.encounterType || 'Encounter'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{fmtDate(e.createdAt)} · {e.patientName || '—'}</div>
            </div>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: (e.status === 'active' ? '#10B981' : 'var(--surface-border)') + '20', color: e.status === 'active' ? '#10B981' : 'var(--text-muted)', fontWeight: 600 }}>{e.status || '—'}</span>
          </div>
        ))
      )}
    </Panel>
  )
}

function TasksTab() {
  return (
    <Panel title="Tasks" icon={<CheckCircle2 size={13} color="#10B981" />}>
      <Empty text="No tasks assigned for this patient." />
    </Panel>
  )
}

function NotesTab() {
  return (
    <Panel title="Clinical Notes" icon={<FileText size={13} color={C.sky} />}>
      <Empty text="No notes yet. Start an encounter to create one." />
    </Panel>
  )
}

function OrdersTab() {
  return (
    <Panel title="Orders" icon={<Pill size={13} color="#7C3AED" />}>
      <Empty text="No orders yet." />
    </Panel>
  )
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, background: 'var(--surface)', borderRadius: 8, border: '1px dashed var(--surface-border)' }}>
      {text}
    </div>
  )
}

function fmtDate(ts: number | undefined): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}
