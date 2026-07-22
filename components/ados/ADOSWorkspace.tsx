'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collectionGroup, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Stethoscope, Clock, Activity, Plus, Search } from 'lucide-react'

interface FirestoreEncounter {
  id: string
  patientId: string
  patientName: string
  departmentId: string
  unitId: string
  encounterType: string
  status: string
  createdBy: string
  createdAt: number
  activePhase: string
}

const LIFECYCLE_STEPS = ['Trigger', 'Prep', 'Interaction', 'Decision', 'Actions', 'Closure', 'Follow-up']

const PHASE_TO_STEP: Record<string, number> = {
  triage: 0,
  registration: 0,
  prep: 1,
  history: 2,
  examination: 2,
  interaction: 2,
  diagnosis: 3,
  decision: 3,
  planning: 4,
  orders: 4,
  actions: 4,
  procedure: 4,
  completion: 5,
  discharge: 5,
  closure: 5,
  followup: 6,
  follow_up: 6,
}

export function ADOSWorkspace() {
  const router = useRouter()
  const { user } = useAuth()
  const [encounters, setEncounters] = useState<FirestoreEncounter[]>([])
  const [selectedEncounter, setSelectedEncounter] = useState<FirestoreEncounter | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentStep = selectedEncounter
    ? PHASE_TO_STEP[selectedEncounter.activePhase?.toLowerCase()] ?? 2
    : -1

  useEffect(() => {
    if (!user) return
    const q = query(
      collectionGroup(db, 'encounters'),
      where('orgId', '==', 'telemed-a98cf'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )
    const unsub = onSnapshot(q, snap => {
      setEncounters(snap.docs.map(d => ({ ...d.data() as FirestoreEncounter, id: d.id })))
    })
    return () => unsub()
  }, [user])

  const activeEncounters = encounters.filter(e => e.status === 'active')
  const completedToday = encounters.filter(e => {
    const d = new Date(e.createdAt || 0)
    return e.status === 'completed' && d.toDateString() === new Date().toDateString()
  })

  // Empty state — no demo data. System encourages real data entry.
  const showDemoHint = encounters.length === 0

  return (
    <div className="ados-root">
      {/* Header */}
      <header className="ados-header">
        <div className="ados-brand">
          <span className="ados-brand-dot" />
          AMEXAN
        </div>
        <span className="ados-tag">Universal Encounter Center</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            System Operational
          </span>
          <button
            onClick={() => router.push('/encounter-center')}
            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#2F80ED', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} /> New Encounter
          </button>
        </div>
      </header>

      {/* Encounter Lifecycle Bar */}
      <div className="lifecycle-bar">
        {LIFECYCLE_STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className={`lifecycle-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}>
              {i < currentStep ? '✓' : ''} {step}
            </div>
            {i < LIFECYCLE_STEPS.length - 1 && <span className="lifecycle-arrow">→</span>}
          </div>
        ))}
      </div>

      {/* Sidebar Toggle (mobile/tablet) */}
      <button className="ados-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div className={`ados-sidebar-backdrop ${sidebarOpen ? 'ados-backdrop-open' : ''}`}
        onClick={() => setSidebarOpen(false)} />

      {/* Workspace */}
      <div className="ados-workspace">
        {/* Sidebar — Patient List */}
        <aside className={`ados-sidebar ${sidebarOpen ? 'ados-sidebar-open' : ''}`}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94A3B8' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: 12, outline: 'none' }}
            />
          </div>

          <div className="ados-section-title">
            <Activity size={14} color="#2F80ED" />
            Active Patients ({activeEncounters.length})
          </div>

          {activeEncounters.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🏥</div>
              No active patients
            </div>
          ) : (
            activeEncounters.map(enc => (
              <div
                key={enc.id}
                className="ados-patient-card"
                onClick={() => { setSelectedEncounter(enc); setSidebarOpen(false) }}
                style={selectedEncounter?.id === enc.id ? { borderColor: '#2F80ED', background: '#EFF6FF' } : {}}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{enc.patientName || 'Patient'}</span>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: '#FFF3E0', color: '#E65100', fontWeight: 600 }}>{enc.encounterType || 'OPD'}</span>
                </div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, display: 'flex', gap: 8 }}>
                  <span>{enc.departmentId || '—'}</span>
                  <span>Phase: {enc.activePhase || 'triage'}</span>
                </div>
              </div>
            ))
          )}

          {completedToday.length > 0 && (
            <>
              <div className="ados-section-title" style={{ marginTop: 20 }}>
                <Clock size={14} color="#10B981" />
                Completed Today ({completedToday.length})
              </div>
              {completedToday.map(enc => (
                <div key={enc.id} className="ados-patient-card" style={{ opacity: 0.6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{enc.patientName || 'Patient'}</span>
                  <div style={{ fontSize: 10, color: '#10B981', fontWeight: 600 }}>✓ Completed</div>
                </div>
              ))}
            </>
          )}
        </aside>

        {/* Main — Workspace Content */}
        <main className="ados-main">
          {!selectedEncounter ? (
            /* Dashboard View */
            <div>
              <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},
                </h1>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{user?.email || 'Doctor'} · Today's Clinical Dashboard</p>
              </div>

              <div className="ados-stat-grid">
                <div className="ados-stat-card">
                  <div className="ados-stat-value">{activeEncounters.length}</div>
                  <div className="ados-stat-label">Active Encounters</div>
                </div>
                <div className="ados-stat-card">
                  <div className="ados-stat-value" style={{ color: '#10B981' }}>{completedToday.length}</div>
                  <div className="ados-stat-label">Completed Today</div>
                </div>
                <div className="ados-stat-card">
                  <div className="ados-stat-value" style={{ color: '#F59E0B' }}>{encounters.filter(e => e.status === 'active').length}</div>
                  <div className="ados-stat-label">In Progress</div>
                </div>
                <div className="ados-stat-card">
                  <div className="ados-stat-value">{encounters.length}</div>
                  <div className="ados-stat-label">Total Encounters</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 24 }}>
                {[
                  { icon: '✚', title: 'New Patient Encounter', desc: 'Register and begin clinical workflow', color: '#2F80ED', onClick: () => router.push('/encounter-center') },
                  { icon: '⚡', title: 'Emergency Entry', desc: 'Fast-track triage and assessment', color: '#EF4444', onClick: () => router.push('/encounter-center') },
                  { icon: '📁', title: 'Patient Records', desc: 'Search and manage patient records', color: '#10B981', onClick: () => router.push('/patients') },
                  { icon: '📊', title: 'View Queue', desc: 'See all patients in queue', color: '#8B5CF6', onClick: () => {} },
                ].map((action, i) => (
                  <div key={i} onClick={action.onClick} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s', borderLeft: `3px solid ${action.color}` }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{action.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{action.title}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{action.desc}</div>
                  </div>
                ))}
              </div>

              {showDemoHint && (
                <div style={{ padding: '40px 24px', textAlign: 'center', background: '#F8FAFC', borderRadius: 12, border: '2px dashed #CBD5E1' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Start Your Clinical Practice</h3>
                  <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                    No patient encounters yet. Create your first encounter to begin clinical intelligence, protocol-driven orders, and the full AMEXAN clinical workflow.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => router.push('/encounter-center')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#2F80ED', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ✚ New Patient Encounter
                    </button>
                    <button onClick={() => router.push('/encounter-center')} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ⚡ Emergency Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Encounter Detail View */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button onClick={() => setSelectedEncounter(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>←</button>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{selectedEncounter.patientName || 'Patient'}</h2>
                  <div style={{ fontSize: 11, color: '#64748B', display: 'flex', gap: 12, marginTop: 2 }}>
                    <span>{selectedEncounter.encounterType}</span>
                    <span>{selectedEncounter.departmentId}</span>
                    <span>Phase: {selectedEncounter.activePhase}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={() => router.push(`/encounter-center`)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#2F80ED', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Open Encounter →
                </button>
              </div>

              {/* Vitals Display */}
              <div className="med-card" style={{ marginBottom: 16 }}>
                <div className="med-card-header">
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Vital Signs</span>
                  <span style={{ fontSize: 10, color: '#94A3B8' }}>Vitals pending — collect at triage</span>
                </div>
                <div className="med-card-body">
                  <div className="vitals-grid">
                    {[
                      { label: 'SpO₂', value: '—', unit: '%', abnormal: false },
                      { label: 'RR', value: '—', unit: '/min', abnormal: false },
                      { label: 'HR', value: '—', unit: '/min', abnormal: false },
                      { label: 'BP', value: '—', unit: 'mmHg', abnormal: false },
                      { label: 'Temp', value: '—', unit: '°C', abnormal: false },
                      { label: 'AVPU', value: '—', unit: '', abnormal: false },
                    ].map((v, i) => (
                      <div key={i} className="vital-item">
                        <div className={`vital-value ${v.abnormal ? 'vital-abnormal' : ''}`} style={{ color: v.value === '—' ? '#CBD5E1' : undefined }}>{v.value}</div>
                        <div className="vital-unit">{v.unit}</div>
                        <div className="vital-label">{v.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Encounter Timeline — shows Firestore data or empty */}
              <div className="med-card" style={{ marginBottom: 16 }}>
                <div className="med-card-header">
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Encounter Timeline</span>
                </div>
                <div className="med-card-body">
                  <div className="ados-timeline">
                    <div className="ados-timeline-item">
                      <div className="ados-timeline-time">{new Date(selectedEncounter.createdAt || Date.now()).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="ados-timeline-event">Encounter created — {selectedEncounter.encounterType || 'OPD'} </div>
                    </div>
                    <div className="ados-timeline-item">
                      <div className="ados-timeline-time">—</div>
                      <div className="ados-timeline-event" style={{ color: '#94A3B8' }}>Vitals, history, and orders pending — open encounter to continue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placeholder for future CI panel when real clinical data flows through */}
              <div className="med-card" style={{ marginBottom: 16 }}>
                <div className="med-card-header">
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Clinical Intelligence Engine</span>
                  <span style={{ fontSize: 10, color: '#94A3B8', background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 }}>Awaiting clinical data</span>
                </div>
                <div className="med-card-body">
                  <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>
                    History and examination data required before clinical intelligence can generate recommendations.
                    <div style={{ marginTop: 12 }}>
                      <button onClick={() => router.push('/encounter-center')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#2F80ED', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Collect Clinical Data →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
