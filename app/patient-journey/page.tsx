'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import {
  Activity, User, Clock, AlertTriangle, CheckCircle, Heart,
  Users, FileText, Shield, Filter, Search, Plus, ArrowRight,
  Stethoscope, Pill, FlaskConical, Scan, MessageSquare,
} from 'lucide-react'
import { appendEvent, getPatientTimeline, reconstructState } from '@/lib/amexan/data/event-store'
import { addTriple, getPatientGraph } from '@/lib/amexan/data/knowledge-graph'
import type { ClinicalEvent, ClinicalEventType, ProvenanceEntry } from '@/lib/amexan/data/types'

const EVENT_ICONS: Record<ClinicalEventType, string> = {
  symptom_reported: '💬', vitals_recorded: '💓', diagnosis_made: '🏷️',
  lab_ordered: '🧪', lab_result_received: '📊', imaging_ordered: '🔬',
  imaging_result_received: '📋', medication_prescribed: '💊', medication_administered: '💉',
  procedure_performed: '🔧', consultation_requested: '🩺', referral_made: '🔗',
  admission_ordered: '🏥', discharge_ordered: '🚪', transfer_ordered: '🚑',
  death_recorded: '🕊️', note_written: '📝', care_plan_created: '📋',
  allergy_recorded: '⚠️', immunization_given: '💉', consent_obtained: '📄',
  patient_education: '📖', state_transition: '🔄', ownership_change: '👤',
  task_created: '✅', task_completed: '✔️', task_escalated: '🔔', task_assigned: '📌',
}

const EVENT_LABELS: Record<ClinicalEventType, string> = {
  symptom_reported: 'Symptom Reported', vitals_recorded: 'Vitals Recorded',
  diagnosis_made: 'Diagnosis Made', lab_ordered: 'Lab Ordered',
  lab_result_received: 'Lab Result Received', imaging_ordered: 'Imaging Ordered',
  imaging_result_received: 'Imaging Result Received', medication_prescribed: 'Medication Prescribed',
  medication_administered: 'Medication Administered', procedure_performed: 'Procedure Performed',
  consultation_requested: 'Consultation Requested', referral_made: 'Referral Made',
  admission_ordered: 'Admission Ordered', discharge_ordered: 'Discharge Ordered',
  transfer_ordered: 'Transfer Ordered', death_recorded: 'Death Recorded',
  note_written: 'Note Written', care_plan_created: 'Care Plan Created',
  allergy_recorded: 'Allergy Recorded', immunization_given: 'Immunization Given',
  consent_obtained: 'Consent Obtained', patient_education: 'Patient Education',
  state_transition: 'State Transition', ownership_change: 'Ownership Change',
  task_created: 'Task Created', task_completed: 'Task Completed',
  task_escalated: 'Task Escalated', task_assigned: 'Task Assigned',
}

function seedData() {
  const orgId = 'org_1'
  const deptId = 'dept_1'
  const provenance = (name: string, role: string): ProvenanceEntry => ({
    recordedBy: '' as any, recordedByName: name, recordedByRole: role,
    recordedAt: Date.now(), organizationId: orgId, organizationName: 'AMEXAN Teaching Hospital',
    departmentId: deptId, departmentName: 'Internal Medicine',
  })

  const patientId = 'pat_demo_001'
  const now = Date.now()

  const events: { type: ClinicalEventType; payload: any; minsAgo: number; provenance: ProvenanceEntry }[] = [
    { type: 'symptom_reported', minsAgo: 1440, payload: { symptoms: ['fever', 'cough', 'shortness of breath'] }, provenance: provenance('Patient', 'self') },
    { type: 'vitals_recorded', minsAgo: 1380, payload: { temp: 38.5, bp: '130/85', hr: 102, rr: 22, spo2: 94 }, provenance: provenance('Nurse Wanjiku', 'Nurse') },
    { type: 'consultation_requested', minsAgo: 1320, payload: { specialty: 'Internal Medicine', urgency: 'urgent' }, provenance: provenance('Triage Officer', 'Triage') },
    { type: 'diagnosis_made', minsAgo: 1260, payload: { diagnosis: 'Community-acquired pneumonia', icd10: 'J15.9', confidence: 0.85 }, provenance: provenance('Dr. Mwangi', 'Consultant') },
    { type: 'lab_ordered', minsAgo: 1200, payload: { orderId: 'lab_001', tests: ['CBC', 'CRP', 'Blood culture', 'Chest X-ray'] }, provenance: provenance('Dr. Mwangi', 'Consultant') },
    { type: 'medication_prescribed', minsAgo: 1140, payload: { medication: 'Ceftriaxone', dose: '2g', route: 'IV', frequency: 'daily' }, provenance: provenance('Dr. Mwangi', 'Consultant') },
    { type: 'lab_result_received', minsAgo: 900, payload: { orderId: 'lab_001', results: [{ test: 'CBC', value: 'WBC 18.5, Hb 12.1, Plt 250' }, { test: 'CRP', value: '156 mg/L' }] }, provenance: provenance('Lab Tech', 'Lab Technologist') },
    { type: 'imaging_result_received', minsAgo: 840, payload: { modality: 'Chest X-ray', finding: 'Left lower lobe consolidation', impression: 'Consistent with pneumonia' }, provenance: provenance('Dr. Radiologist', 'Radiologist') },
    { type: 'note_written', minsAgo: 600, payload: { noteType: 'Progress Note', content: 'Patient improving. Fever resolved. O2 sat 97% on room air.' }, provenance: provenance('Dr. Mwangi', 'Consultant') },
    { type: 'state_transition', minsAgo: 480, payload: { from: 'consultation', to: 'ward' }, provenance: provenance('System', 'system') },
    { type: 'medication_administered', minsAgo: 360, payload: { medication: 'Ceftriaxone', dose: '2g', route: 'IV', nurse: 'Nurse Kamau' }, provenance: provenance('Nurse Kamau', 'Nurse') },
    { type: 'care_plan_created', minsAgo: 300, payload: { plan: 'Complete 7-day antibiotics, repeat CXR at day 3, physiotherapy' }, provenance: provenance('Dr. Mwangi', 'Consultant') },
  ]

  for (const e of events) {
    appendEvent({ patientId, type: e.type, payload: e.payload, provenance: { ...e.provenance, recordedAt: now - e.minsAgo * 60000 } })
  }

  addTriple({ subject: patientId, predicate: 'hasDiagnosis', object: 'Community-acquired pneumonia', confidence: 0.85 })
  addTriple({ subject: patientId, predicate: 'treatedBy', object: 'Dr. Mwangi' })
  addTriple({ subject: patientId, predicate: 'assignedTo', object: 'Ward 3A' })
  addTriple({ subject: patientId, predicate: 'hasMedication', object: 'Ceftriaxone' })
  addTriple({ subject: patientId, predicate: 'hasAllergy', object: 'Penicillin' })
}

seedData()

export default function PatientJourneyPage() {
  const [patientId] = useState('pat_demo_001')
  const [filterType, setFilterType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'timeline' | 'network' | 'consent' | 'gaps'>('timeline')
  const [searchQuery, setSearchQuery] = useState('')

  const events = useMemo(() => getPatientTimeline(patientId), [patientId])
  const state = useMemo(() => reconstructState(patientId), [patientId])
  const graph = useMemo(() => getPatientGraph(patientId), [patientId])

  const filteredEvents = useMemo(() => {
    let result = events
    if (filterType !== 'all') result = result.filter(e => e.type === filterType)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.type.toLowerCase().includes(q) ||
        JSON.stringify(e.payload).toLowerCase().includes(q)
      )
    }
    return result
  }, [events, filterType, searchQuery])

  const eventTypes = useMemo(() => [...new Set(events.map(e => e.type))], [events])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Activity size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Patient Journey</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Events</option>
          {eventTypes.map(t => <option key={t} value={t}>{EVENT_LABELS[t] || t}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {([
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'network', label: 'Care Network', icon: Users },
          { id: 'consent', label: 'Consent', icon: Shield },
          { id: 'gaps', label: 'Care Gaps', icon: AlertTriangle },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
              background: 'transparent', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
            }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        {/* Patient header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 18px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--sky-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Demo Patient</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{patientId} · {events.length} events · {graph.length} relationships</p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Current State</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{(state as any).currentClinicalState?.to ?? 'Ward'}</span>
          </div>
        </div>

        {/* Timeline tab */}
        {activeTab === 'timeline' && (
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            <div style={{ position: 'absolute', left: 14, top: 8, bottom: 8, width: 2, background: 'var(--surface-border)', borderRadius: 1 }} />
            {filteredEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>No events found</p>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} style={{ position: 'relative', marginBottom: 16 }}>
                  <div style={{
                    position: 'absolute', left: -26, top: 4, width: 12, height: 12, borderRadius: '50%',
                    background: 'var(--surface-card)', border: '3px solid var(--primary)', zIndex: 1,
                  }} />
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{EVENT_ICONS[event.type] || '📌'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{EVENT_LABELS[event.type] || event.type}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTimeAgo(event.timestamp)}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>{event.provenance.recordedByName}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{describePayload(event)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Care Network tab */}
        {activeTab === 'network' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {graph.map((triple, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{triple.predicate}</span>
                    {triple.confidence && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{(triple.confidence * 100).toFixed(0)}%</span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{triple.object}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', fontSize: 12, color: 'var(--text-muted)' }}>
              {graph.length} relationships in knowledge graph
            </div>
          </div>
        )}

        {/* Consent tab */}
        {activeTab === 'consent' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { type: 'Treatment Consent', status: 'active', date: '2026-07-01', scope: 'All clinical care' },
                { type: 'Data Sharing', status: 'active', date: '2026-07-01', scope: 'Share with AMEXAN providers' },
                { type: 'Research Participation', status: 'pending', date: null, scope: 'Clinical trial enrollment' },
                { type: 'Advance Directive', status: 'not_submitted', date: null, scope: 'End-of-life preferences' },
              ].map((c, i) => (
                <div key={i} style={{ padding: '14px 18px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: c.status === 'active' ? 'rgba(16,185,129,0.1)' : 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.status === 'active' ? <CheckCircle size={18} color="#10B981" /> : c.status === 'pending' ? <Clock size={18} color="#F59E0B" /> : <AlertTriangle size={18} color="var(--text-muted)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.type}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>{c.scope}</span>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: c.status === 'active' ? 'rgba(16,185,129,0.08)' : c.status === 'pending' ? 'rgba(245,158,11,0.08)' : 'var(--surface-elevated)', color: c.status === 'active' ? '#10B981' : c.status === 'pending' ? '#F59E0B' : 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                  {c.date && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.date}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Care Gaps tab */}
        {activeTab === 'gaps' && (
          <div>
            {[
              { gap: 'HbA1c not checked in 6 months', severity: 'high', patient: 'Demographic: Diabetes', recommendation: 'Order HbA1c' },
              { gap: 'Influenza vaccine due', severity: 'medium', patient: 'Age > 65', recommendation: 'Administer flu vaccine' },
              { gap: 'Annual eye exam overdue', severity: 'medium', patient: 'Diabetes > 5 years', recommendation: 'Refer to ophthalmology' },
            ].map((g, i) => (
              <div key={i} style={{ padding: '14px 18px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: g.severity === 'high' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{g.gap}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{g.patient}</span>
                </div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'var(--sky-50)', color: 'var(--primary)', fontWeight: 500 }}>{g.recommendation}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function describePayload(event: ClinicalEvent): string {
  const p = event.payload as Record<string, any>
  switch (event.type) {
    case 'vitals_recorded': return `Temp ${p.temp}°C, BP ${p.bp}, HR ${p.hr}, SpO2 ${p.spo2}%`
    case 'diagnosis_made': return `${p.diagnosis} (${p.icd10 || ''})`
    case 'lab_ordered': return (p.tests as string[])?.join(', ') ?? ''
    case 'lab_result_received': return (p.results as any[])?.map((r: any) => `${r.test}: ${r.value}`).join(' · ') ?? ''
    case 'medication_prescribed': return `${p.medication} ${p.dose} ${p.route} ${p.frequency}`
    case 'medication_administered': return `${p.medication} ${p.dose} by ${p.nurse}`
    case 'note_written': return p.content ? p.content.slice(0, 80) + (p.content.length > 80 ? '...' : '') : ''
    case 'state_transition': return `From ${p.from} → ${p.to}`
    default: return typeof p === 'object' ? Object.entries(p).map(([k, v]) => `${k}: ${v}`).join(', ') : String(p)
  }
}
