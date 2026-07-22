'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import type { PrimaryClinicalState } from '@/lib/amexan/clinical-constitution/types'
import {
  Activity, User, Users, Clock, AlertTriangle, CheckCircle,
  XCircle, ArrowRight, ChevronRight, Search, RefreshCw, Eye,
  Home, Shield, Stethoscope, Pill, FlaskConical, Scan,
  Bed, Ambulance, Heart, type LucideIcon,
} from 'lucide-react'

const STATE_LABELS: Record<PrimaryClinicalState, { label: string; icon: string; color: string; description: string }> = {
  self_care: { label: 'Self Care', icon: '🏠', color: '#10B981', description: 'Managing at home' },
  appointment: { label: 'Appointment', icon: '📅', color: '#3B82F6', description: 'Appointment scheduled' },
  waiting: { label: 'Waiting', icon: '⏳', color: '#F59E0B', description: 'Waiting to be seen' },
  triage: { label: 'Triage', icon: '🔍', color: '#8B5CF6', description: 'Undergoing triage assessment' },
  consultation: { label: 'Consultation', icon: '🩺', color: C.sky, description: 'Active consultation' },
  emergency_department: { label: 'Emergency', icon: '🚨', color: '#EF4444', description: 'Emergency department care' },
  resuscitation: { label: 'Resuscitation', icon: '❤️', color: '#DC2626', description: 'Resuscitation in progress' },
  laboratory: { label: 'Laboratory', icon: '🧪', color: '#8B5CF6', description: 'Awaiting or undergoing lab tests' },
  radiology: { label: 'Radiology', icon: '🔬', color: '#F59E0B', description: 'Awaiting or undergoing imaging' },
  observation: { label: 'Observation', icon: '👁️', color: '#14B8A6', description: 'Under clinical observation' },
  admission: { label: 'Admission', icon: '🏥', color: '#3B82F6', description: 'Being admitted' },
  ward: { label: 'Ward', icon: '🛏️', color: '#6366F1', description: 'Inpatient ward care' },
  icu: { label: 'ICU', icon: '💓', color: '#EF4444', description: 'Intensive care' },
  theatre: { label: 'Theatre', icon: '🔧', color: '#3B82F6', description: 'In operating theatre' },
  pharmacy: { label: 'Pharmacy', icon: '💊', color: '#10B981', description: 'Pharmacy visit' },
  physiotherapy: { label: 'Physio', icon: '🏃', color: '#14B8A6', description: 'Physiotherapy session' },
  discharge: { label: 'Discharge', icon: '🚪', color: '#6366F1', description: 'Discharge process' },
  follow_up: { label: 'Follow-up', icon: '📋', color: '#8B5CF6', description: 'Follow-up appointment' },
  long_term_monitoring: { label: 'Long-term Monitor', icon: '📊', color: '#10B981', description: 'Chronic disease monitoring' },
  community_care: { label: 'Community', icon: '🤝', color: '#14B8A6', description: 'Community-based care' },
  home_care: { label: 'Home Care', icon: '🏠', color: '#10B981', description: 'Receiving home care' },
  telemedicine: { label: 'Telemedicine', icon: '📱', color: C.sky, description: 'Remote consultation' },
  transfer: { label: 'Transfer', icon: '🚑', color: '#F59E0B', description: 'Being transferred' },
  deceased: { label: 'Deceased', icon: '🕊️', color: '#6B7280', description: 'End of life' },
}

const VALID_TRANSITIONS: Record<PrimaryClinicalState, PrimaryClinicalState[]> = {
  self_care: ['appointment', 'emergency_department', 'community_care', 'telemedicine'],
  appointment: ['waiting', 'consultation', 'self_care'],
  waiting: ['consultation', 'laboratory', 'radiology', 'triage', 'self_care'],
  triage: ['waiting', 'consultation', 'emergency_department', 'resuscitation'],
  consultation: ['laboratory', 'radiology', 'observation', 'admission', 'pharmacy', 'theatre', 'discharge', 'follow_up', 'self_care'],
  emergency_department: ['resuscitation', 'triage', 'consultation', 'laboratory', 'radiology', 'observation', 'admission', 'theatre', 'icu', 'deceased'],
  resuscitation: ['emergency_department', 'icu', 'theatre', 'deceased'],
  laboratory: ['consultation', 'observation', 'self_care'],
  radiology: ['consultation', 'observation', 'theatre', 'self_care'],
  observation: ['admission', 'discharge', 'self_care', 'consultation'],
  admission: ['ward', 'icu', 'theatre', 'observation'],
  ward: ['theatre', 'icu', 'laboratory', 'radiology', 'pharmacy', 'physiotherapy', 'discharge', 'transfer', 'deceased'],
  icu: ['ward', 'theatre', 'deceased', 'transfer'],
  theatre: ['icu', 'ward', 'deceased'],
  pharmacy: ['consultation', 'discharge', 'self_care'],
  physiotherapy: ['ward', 'discharge', 'self_care', 'consultation'],
  discharge: ['follow_up', 'self_care', 'long_term_monitoring', 'community_care', 'home_care'],
  follow_up: ['self_care', 'consultation', 'long_term_monitoring', 'appointment'],
  long_term_monitoring: ['consultation', 'self_care', 'emergency_department', 'follow_up'],
  community_care: ['self_care', 'home_care', 'consultation', 'emergency_department'],
  home_care: ['self_care', 'consultation', 'emergency_department', 'long_term_monitoring'],
  telemedicine: ['consultation', 'pharmacy', 'follow_up', 'self_care'],
  transfer: ['admission', 'consultation', 'ward', 'icu'],
  deceased: [],
}

interface PatientJourney {
  id: string
  name: string
  age: number
  gender: string
  currentState: PrimaryClinicalState
  previousStates: PrimaryClinicalState[]
  ownerName: string
  ownerRole: string
  department: string
  admissionDate: number
  priority: number
  hasAlert: boolean
}

function generatePatients(): PatientJourney[] {
  const firstNames = ['James', 'Grace', 'Peter', 'Ann', 'John', 'Mary', 'David', 'Sarah', 'Michael', 'Esther', 'Samuel', 'Hannah', 'Joseph', 'Deborah', 'Daniel', 'Ruth', 'Paul', 'Naomi', 'Thomas', 'Elizabeth']
  const lastNames = ['Mwangi', 'Kamau', 'Ochieng', 'Wanjiku', 'Kiprop', 'Nyambura', 'Odhiambo', 'Chebet', 'Njoroge', 'Akinyi', 'Mutua', 'Jerono', 'Kioko', 'Wambui', 'Barasa']
  const states: PrimaryClinicalState[] = ['ward', 'icu', 'laboratory', 'radiology', 'consultation', 'waiting', 'observation', 'theatre', 'pharmacy', 'discharge', 'follow_up', 'emergency_department', 'physiotherapy']

  return Array.from({ length: 9 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const state = states[Math.floor(Math.random() * states.length)]
    const stateIdx = states.indexOf(state)
    const prevCount = Math.floor(Math.random() * Math.min(stateIdx, 4)) + 1
    const prevStates = states.slice(Math.max(0, stateIdx - prevCount), stateIdx).filter(Boolean)

    return {
      id: `pat_${Math.random().toString(36).slice(2, 8)}`,
      name: `${firstName} ${lastName}`,
      age: Math.floor(Math.random() * 60) + 18,
      gender: Math.random() > 0.5 ? 'M' : 'F',
      currentState: state,
      previousStates: prevStates,
      ownerName: ['Dr. Mwangi', 'Dr. Kamau', 'Dr. Ochieng', 'Dr. Wanjiku'][Math.floor(Math.random() * 4)],
      ownerRole: ['Consultant', 'Registrar', 'Medical Officer'][Math.floor(Math.random() * 3)],
      department: ['Medicine', 'Surgery', 'ICU', 'Pediatrics', 'OB/GYN', 'Emergency'][Math.floor(Math.random() * 6)],
      admissionDate: Date.now() - Math.floor(Math.random() * 10 * 86400000),
      priority: (Math.floor(Math.random() * 4) + 2) as any,
      hasAlert: Math.random() > 0.7,
    }
  })
}

function getStateIcon(state: PrimaryClinicalState): string {
  return STATE_LABELS[state]?.icon || '•'
}

function getStateColor(state: PrimaryClinicalState): string {
  return STATE_LABELS[state]?.color || 'var(--text-muted)'
}

function getStateLabel(state: PrimaryClinicalState): string {
  return STATE_LABELS[state]?.label || state.replace(/_/g, ' ')
}

export default function PatientPathPage() {
  const [patients, setPatients] = useState(generatePatients)
  const [selectedPatient, setSelectedPatient] = useState<PatientJourney | null>(patients[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('all')

  const filteredPatients = useMemo(() => {
    let result = patients
    if (stateFilter !== 'all') {
      result = result.filter(p => p.currentState === stateFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    }
    return result
  }, [patients, stateFilter, searchQuery])

  const uniqueStates = useMemo(() => {
    const states = new Set(patients.map(p => p.currentState))
    return Array.from(states).sort()
  }, [patients])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Eye size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Patient Path</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search patients..."
            style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
          style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All States</option>
          {uniqueStates.map(s => <option key={s} value={s}>{getStateLabel(s)}</option>)}
        </select>
        <button onClick={() => setPatients(generatePatients())}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Patient list */}
        <div style={{ width: 300, background: 'var(--surface-card)', borderRight: '1px solid var(--surface-border)', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '12px 12px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Patients ({filteredPatients.length})
          </div>
          {filteredPatients.map(patient => (
            <div key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              style={{
                padding: '10px 12px', cursor: 'pointer', margin: '2px 6px', borderRadius: 8,
                background: selectedPatient?.id === patient.id ? 'var(--sky-50)' : 'transparent',
                border: selectedPatient?.id === patient.id ? '1px solid var(--sky-200)' : '1px solid transparent',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{patient.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{patient.age}{patient.gender}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{getStateIcon(patient.currentState)}</span>
                <span style={{
                  fontSize: 11, padding: '1px 6px', borderRadius: 4,
                  background: `${getStateColor(patient.currentState)}15`,
                  color: getStateColor(patient.currentState),
                  fontWeight: 500,
                }}>
                  {getStateLabel(patient.currentState)}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{patient.department}</span>
              </div>
              {patient.hasAlert && (
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#EF4444' }}>
                  <AlertTriangle size={11} /> Clinical alert
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Patient path visualization */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {selectedPatient ? (
            <PatientPathView patient={selectedPatient} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <User size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>Select a patient to view their journey</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PatientPathView({ patient }: { patient: PatientJourney }) {
  const timeline = [...patient.previousStates, patient.currentState]

  return (
    <div>
      {/* Patient header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--sky-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {getStateIcon(patient.currentState)}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{patient.name}</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {patient.age} years · {patient.gender} · {patient.id.slice(0, 10)} · Admitted {formatDate(patient.admissionDate)}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Responsible Clinician</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{patient.ownerName}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4 }}>({patient.ownerRole})</span>
          </div>
          {patient.hasAlert && (
            <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={13} /> Clinical Alert
            </span>
          )}
        </div>
      </div>

      {/* Current state indicator */}
      <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: `${getStateColor(patient.currentState)}08`, border: `1px solid ${getStateColor(patient.currentState)}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${getStateColor(patient.currentState)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {getStateIcon(patient.currentState)}
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Current State</span>
            <p style={{ fontSize: 16, fontWeight: 700, color: getStateColor(patient.currentState), margin: '2px 0 0' }}>
              {getStateLabel(patient.currentState)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              {STATE_LABELS[patient.currentState]?.description || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Journey timeline */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Patient Journey</h2>
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: 14, top: 8, bottom: 8, width: 2, background: 'var(--surface-border)', borderRadius: 1 }} />

          {timeline.map((state, idx) => {
            const isCurrent = idx === timeline.length - 1
            const validNext = isCurrent ? VALID_TRANSITIONS[state] || [] : []

            return (
              <div key={`${state}_${idx}`} style={{ position: 'relative', marginBottom: idx < timeline.length - 1 ? 20 : 0 }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: -26, top: 4,
                  width: isCurrent ? 16 : 12, height: isCurrent ? 16 : 12,
                  borderRadius: '50%',
                  background: isCurrent ? getStateColor(state) : 'var(--surface-card)',
                  border: `3px solid ${getStateColor(state)}`,
                  zIndex: 1,
                }} />

                {/* Content */}
                <div style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: isCurrent ? `${getStateColor(state)}08` : 'var(--surface-card)',
                  border: `1px solid ${isCurrent ? `${getStateColor(state)}30` : 'var(--surface-border)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{getStateIcon(state)}</span>
                    <span style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? getStateColor(state) : 'var(--text-primary)' }}>
                      {getStateLabel(state)}
                    </span>
                    {isCurrent && (
                      <span style={{ padding: '1px 7px', borderRadius: 4, background: `${getStateColor(state)}15`, color: getStateColor(state), fontSize: 10, fontWeight: 700 }}>
                        Current
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    {STATE_LABELS[state]?.description || ''}
                  </p>
                </div>

                {/* Valid transitions from current state */}
                {isCurrent && validNext.length > 0 && (
                  <div style={{ marginTop: 12, marginLeft: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'block' }}>
                      Possible Next States
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {validNext.map(nextState => (
                        <span key={nextState} style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                          background: `${getStateColor(nextState)}10`,
                          color: getStateColor(nextState),
                          border: `1px solid ${getStateColor(nextState)}25`,
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <span style={{ fontSize: 14 }}>{getStateIcon(nextState)}</span>
                          {getStateLabel(nextState)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Ownership info */}
      <div style={{ padding: 16, borderRadius: 12, background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Ownership & Care Team</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Patient Owner</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{patient.ownerName}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block' }}>{patient.ownerRole}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Department</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{patient.department}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Prioritization</span>
            <span style={{
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              color: patient.priority <= 2 ? '#EF4444' : patient.priority === 3 ? '#F59E0B' : 'var(--text-primary)',
            }}>
              {patient.priority <= 2 && <AlertTriangle size={14} />}
              Priority {patient.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
