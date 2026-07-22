'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  AlertTriangle, Heart, Clock, Activity, User, Users,
  Bed, Truck, Brain, Baby, Stethoscope, ChevronRight,
  CheckCircle, XCircle, Search, ArrowRight, Syringe,
  Monitor, Thermometer, Wind, Droplets, Pill, FileText,
  MessageSquare, Phone, Ambulance, Zap, Eye, LogOut,
  Plus, Calendar, type LucideIcon,
} from 'lucide-react'

interface EmergencyPatient {
  id: string
  name: string
  age: string
  gender: string
  triage: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN'
  complaint: string
  mode: string
  time: string
  waitMin: number
  vitals: { bp: string; hr: number; rr: number; spo2: number; temp: number; gcs: number }
  alerts: string[]
  pathway: 'stroke' | 'stemi' | 'trauma' | 'sepsis' | 'obstetric' | 'paediatric' | 'general'
  status: 'resus' | 'critical' | 'stable' | 'disposition'
  bed?: string
  provider?: string
}

const EMERGENCY_PATIENTS: EmergencyPatient[] = [
  { id: 'em_001', name: 'James Kamau', age: '58', gender: 'M', triage: 'RED', complaint: 'Chest pain radiating to left arm, diaphoresis', mode: 'Ambulance', time: '08:15', waitMin: 5, vitals: { bp: '85/50', hr: 120, rr: 24, spo2: 93, temp: 36.8, gcs: 14 }, alerts: ['STEMI alert', 'Hypotensive'], pathway: 'stemi', status: 'resus' },
  { id: 'em_002', name: 'Grace Wanjiku', age: '67', gender: 'F', triage: 'RED', complaint: 'Sudden onset left-sided weakness, slurred speech', mode: 'Ambulance', time: '08:30', waitMin: 3, vitals: { bp: '180/100', hr: 95, rr: 20, spo2: 97, temp: 36.6, gcs: 13 }, alerts: ['Onset 45 min ago', 'NIHSS 14'], pathway: 'stroke', status: 'resus' },
  { id: 'em_003', name: 'Peter Ochieng', age: '22', gender: 'M', triage: 'RED', complaint: 'Stab wound to chest, respiratory distress', mode: 'Police', time: '08:45', waitMin: 2, vitals: { bp: '80/40', hr: 130, rr: 32, spo2: 88, temp: 37.0, gcs: 12 }, alerts: ['Tension pneumothorax?', 'Hypovolaemic shock'], pathway: 'trauma', status: 'resus' },
  { id: 'em_004', name: 'Ann Nyambura', age: '34', gender: 'F', triage: 'RED', complaint: 'Fever, confusion, hypotension', mode: 'Walk-in', time: '09:00', waitMin: 0, vitals: { bp: '75/40', hr: 135, rr: 28, spo2: 94, temp: 39.5, gcs: 11 }, alerts: ['qSOFA 3/3', 'Lactate 4.5'], pathway: 'sepsis', status: 'resus' },
  { id: 'em_005', name: 'Sarah Chebet', age: '28', gender: 'F', triage: 'ORANGE', complaint: 'Antepartum haemorrhage at 36 weeks', mode: 'Ambulance', time: '09:15', waitMin: 8, vitals: { bp: '100/60', hr: 110, rr: 22, spo2: 97, temp: 37.1, gcs: 15 }, alerts: ['PV bleeding', 'Fetal distress'], pathway: 'obstetric', status: 'critical' },
  { id: 'em_006', name: 'Baby Kiprop', age: '2', gender: 'M', triage: 'ORANGE', complaint: 'Febrile seizure, post-ictal', mode: 'Walk-in', time: '09:30', waitMin: 5, vitals: { bp: '85/50', hr: 150, rr: 30, spo2: 96, temp: 39.8, gcs: 13 }, alerts: ['Febrile seizure', 'High fever'], pathway: 'paediatric', status: 'critical' },
  { id: 'em_007', name: 'David Mwangi', age: '45', gender: 'M', triage: 'YELLOW', complaint: 'Abdominal pain, vomiting 2 days', mode: 'Walk-in', time: '10:00', waitMin: 15, vitals: { bp: '130/85', hr: 95, rr: 18, spo2: 98, temp: 37.8, gcs: 15 }, alerts: [], pathway: 'general', status: 'stable' },
  { id: 'em_008', name: 'Mary Wambui', age: '72', gender: 'F', triage: 'YELLOW', complaint: 'Fall, ?hip fracture, painful', mode: 'Walk-in', time: '10:30', waitMin: 12, vitals: { bp: '140/90', hr: 88, rr: 16, spo2: 97, temp: 36.9, gcs: 15 }, alerts: ['?NOF fracture'], pathway: 'general', status: 'stable' },
]

const PATHWAY_ICONS: Record<string, LucideIcon> = {
  stroke: Brain, stemi: Heart, trauma: Truck, sepsis: AlertTriangle,
  obstetric: Baby, paediatric: Baby, general: User,
}

const PATHWAY_COLORS: Record<string, string> = {
  stroke: '#8B5CF6', stemi: '#EF4444', trauma: '#F59E0B',
  sepsis: '#EC4899', obstetric: '#06B6D4', paediatric: '#10B981', general: '#64748B',
}

export default function DoctorEmergencyPage() {
  const router = useRouter()
  const [view, setView] = useState<'command' | 'resus' | 'pathways' | 'queue'>('command')

  const resusPatients = useMemo(() => EMERGENCY_PATIENTS.filter(p => p.status === 'resus'), [])
  const criticalPatients = useMemo(() => EMERGENCY_PATIENTS.filter(p => p.status === 'critical'), [])
  const stablePatients = useMemo(() => EMERGENCY_PATIENTS.filter(p => p.status === 'stable'), [])

  const TriBadge = ({ triage }: { triage: string }) => {
    const colors: Record<string, string> = { RED: '#DC2626', ORANGE: '#F97316', YELLOW: '#EAB308', GREEN: '#22C55E' }
    return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${colors[triage]}20`, color: colors[triage] }}>{triage}</span>
  }

  const PatientCard = ({ p }: { p: EmergencyPatient }) => {
    const PathwayIcon = PATHWAY_ICONS[p.pathway] || User
    const isResus = p.status === 'resus'
    return (
      <div style={{ padding: '12px 16px', borderRadius: 10, background: isResus ? '#FEF2F2' : C.white, border: `1px solid ${isResus ? '#FECACA' : C.border}`, marginBottom: 6, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: PATHWAY_COLORS[p.pathway] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PathwayIcon size={16} color={PATHWAY_COLORS[p.pathway]} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</span>
              <TriBadge triage={p.triage} />
              <span style={{ fontSize: 11, color: C.textLight }}>{p.age}y {p.gender}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{p.complaint}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: C.textLight }}>
            <div>{p.time}</div>
            <div style={{ color: p.waitMin <= 5 ? C.red : p.waitMin <= 15 ? C.amber : C.green, fontWeight: 600 }}>{p.waitMin} min</div>
          </div>
        </div>
        {p.alerts.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            {p.alerts.map((a, i) => (
              <span key={i} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: isResus ? '#FEE2E2' : '#FFF1F2', color: C.red, border: `1px solid ${isResus ? '#FECACA' : '#FECDD3'}` }}>
                <AlertTriangle size={10} style={{ marginRight: 3 }} />{a}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <div style={{ padding: '3px 8px', borderRadius: 4, background: C.panel, fontSize: 10, color: C.textLight }}>BP {p.vitals.bp}</div>
          <div style={{ padding: '3px 8px', borderRadius: 4, background: C.panel, fontSize: 10, color: C.textLight }}>HR {p.vitals.hr}</div>
          <div style={{ padding: '3px 8px', borderRadius: 4, background: C.panel, fontSize: 10, color: C.textLight }}>RR {p.vitals.rr}</div>
          <div style={{ padding: '3px 8px', borderRadius: 4, background: C.panel, fontSize: 10, color: C.textLight }}>SpO2 {p.vitals.spo2}%</div>
          <div style={{ padding: '3px 8px', borderRadius: 4, background: C.panel, fontSize: 10, color: C.textLight }}>GCS {p.vitals.gcs}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <AlertTriangle size={18} color={C.red} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#FEF2F2', color: C.red, fontWeight: 600 }}>EMERGENCY MODE</span>
        <span style={{ fontSize: 12, color: C.textLight }}>Dr. James Mwangi · Morning Shift</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setView('command')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'command' ? `2px solid ${C.red}` : `1px solid ${C.border}`, background: view === 'command' ? '#FEF2F2' : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'command' ? 600 : 400, color: view === 'command' ? C.red : C.text }}>Command</button>
          <button onClick={() => setView('resus')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'resus' ? `2px solid ${C.red}` : `1px solid ${C.border}`, background: view === 'resus' ? '#FEF2F2' : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'resus' ? 600 : 400, color: view === 'resus' ? C.red : C.text }}>Resus</button>
          <button onClick={() => setView('pathways')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'pathways' ? `2px solid ${C.red}` : `1px solid ${C.border}`, background: view === 'pathways' ? '#FEF2F2' : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'pathways' ? 600 : 400, color: view === 'pathways' ? C.red : C.text }}>Time-Critical Pathways</button>
          <button onClick={() => setView('queue')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'queue' ? `2px solid ${C.red}` : `1px solid ${C.border}`, background: view === 'queue' ? '#FEF2F2' : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'queue' ? 600 : 400, color: view === 'queue' ? C.red : C.text }}>Full Queue</button>
        </div>
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight }}>
          ← Back
        </button>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {view === 'command' && (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Live Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.red }}>{resusPatients.length}</div>
                <div style={{ fontSize: 11, color: C.red, fontWeight: 500 }}>Resuscitation</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#C2410C' }}>{criticalPatients.length}</div>
                <div style={{ fontSize: 11, color: '#C2410C', fontWeight: 500 }}>Critical</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{EMERGENCY_PATIENTS.filter(p => p.pathway === 'stroke').length}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>Stroke Alerts</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{EMERGENCY_PATIENTS.filter(p => p.pathway === 'stemi').length}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>STEMI Alerts</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{EMERGENCY_PATIENTS.filter(p => p.pathway === 'trauma').length}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>Trauma Alerts</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{EMERGENCY_PATIENTS.filter(p => p.pathway === 'sepsis').length}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>Sepsis Alerts</div>
              </div>
            </div>

            {/* Resuscitation Bay */}
            <div style={{ background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA', padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Zap size={18} color={C.red} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.red }}>Resuscitation Bay — Active</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: C.red, fontWeight: 500 }}>Prioritized by severity</span>
              </div>
              {resusPatients.map(p => <PatientCard key={p.id} p={p} />)}
            </div>

            {/* Critical Queue */}
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Heart size={18} color={C.amber} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Critical Queue</span>
              </div>
              {criticalPatients.length > 0 ? criticalPatients.map(p => <PatientCard key={p.id} p={p} />) : (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: C.textLight }}>No critical patients currently.</div>
              )}
            </div>

            {/* Disposition Needed */}
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ArrowRight size={18} color={C.textLight} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Disposition Planner</span>
              </div>
              {stablePatients.filter(p => p.waitMin > 10).map(p => (
                <div key={p.id} style={{ padding: '10px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={14} color={C.amber} />
                  <span style={{ fontSize: 12, flex: 1 }}>{p.name} — {p.complaint} (waiting {p.waitMin} min)</span>
                  <span style={{ fontSize: 11, color: C.textLight }}>→ Admit / Discharge / Refer</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'resus' && (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Resuscitation — ABCDE Approach</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
                {['A - Airway', 'B - Breathing', 'C - Circulation', 'D - Disability', 'E - Exposure'].map((s, i) => (
                  <div key={i} style={{ padding: '10px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center', fontSize: 11, fontWeight: 600, color: C.text }}>{s}</div>
                ))}
              </div>
              {resusPatients.map(p => (
                <div key={p.id} style={{ padding: '14px 18px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{p.name}</span>
                    <TriBadge triage={p.triage} />
                    <span style={{ fontSize: 12, color: C.textLight }}>{p.complaint}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 8 }}>
                    <div><span style={{ fontSize: 9, color: C.textLight }}>BP</span><div style={{ fontSize: 12, fontWeight: 600, color: p.vitals.bp.startsWith('8') || p.vitals.bp.startsWith('7') ? C.red : C.text }}>{p.vitals.bp}</div></div>
                    <div><span style={{ fontSize: 9, color: C.textLight }}>HR</span><div style={{ fontSize: 12, fontWeight: 600, color: p.vitals.hr > 120 || p.vitals.hr < 60 ? C.red : C.text }}>{p.vitals.hr}</div></div>
                    <div><span style={{ fontSize: 9, color: C.textLight }}>RR</span><div style={{ fontSize: 12, fontWeight: 600, color: p.vitals.rr > 24 || p.vitals.rr < 10 ? C.red : C.text }}>{p.vitals.rr}</div></div>
                    <div><span style={{ fontSize: 9, color: C.textLight }}>SpO2</span><div style={{ fontSize: 12, fontWeight: 600, color: p.vitals.spo2 < 94 ? C.red : C.text }}>{p.vitals.spo2}%</div></div>
                    <div><span style={{ fontSize: 9, color: C.textLight }}>Temp</span><div style={{ fontSize: 12, fontWeight: 600, color: p.vitals.temp > 38 || p.vitals.temp < 36 ? C.red : C.text }}>{p.vitals.temp}°C</div></div>
                    <div><span style={{ fontSize: 9, color: C.textLight }}>GCS</span><div style={{ fontSize: 12, fontWeight: 600, color: p.vitals.gcs < 13 ? C.red : C.text }}>{p.vitals.gcs}/15</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: C.red, color: C.white, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}><AlertTriangle size={11} /> Activate Pathway</button>
                    <button style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer' }}>Resus Note</button>
                    <button style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer' }}>Order Labs</button>
                    <button style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer' }}>Imaging</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'pathways' && (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Time-Critical Pathways</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {/* STEMI */}
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Heart size={18} color={C.red} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>STEMI Pathway</span>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: '#FEF2F2', color: C.red, marginLeft: 'auto' }}>Door-to-Balloon: ≤90 min</span>
                </div>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 10 }}>ECG within 10 min. Activate cath lab. Aspirin 300mg. Monitor for complications.</div>
                {EMERGENCY_PATIENTS.filter(p => p.pathway === 'stemi').map(p => <PatientCard key={p.id} p={p} />)}
              </div>
              {/* Stroke */}
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Brain size={18} color={'#8B5CF6'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Stroke Pathway</span>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: '#F5F3FF', color: '#7C3AED', marginLeft: 'auto' }}>Door-to-Needle: ≤60 min</span>
                </div>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 10 }}>NIHSS score. Non-contrast CT within 20 min. Thrombolysis eligibility. Monitor for bleeding.</div>
                {EMERGENCY_PATIENTS.filter(p => p.pathway === 'stroke').map(p => <PatientCard key={p.id} p={p} />)}
              </div>
              {/* Trauma */}
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Truck size={18} color={'#F59E0B'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Trauma / ATLS Pathway</span>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: '#FFFBEB', color: '#B45309', marginLeft: 'auto' }}>ATLS Protocol</span>
                </div>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 10 }}>Primary survey (ABCDE). Adjuncts. Secondary survey. Definitive care. Trauma team activation.</div>
                {EMERGENCY_PATIENTS.filter(p => p.pathway === 'trauma').map(p => <PatientCard key={p.id} p={p} />)}
              </div>
              {/* Sepsis */}
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AlertTriangle size={18} color={'#EC4899'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Sepsis Pathway</span>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: '#FDF2F8', color: '#BE185D', marginLeft: 'auto' }}>1-hr Bundle</span>
                </div>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 10 }}>Measure lactate. Blood cultures. Broad-spectrum antibiotics. Fluids. Vasopressors if hypotensive.</div>
                {EMERGENCY_PATIENTS.filter(p => p.pathway === 'sepsis').map(p => <PatientCard key={p.id} p={p} />)}
              </div>
            </div>
          </div>
        )}

        {view === 'queue' && (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Users size={18} color={C.textLight} />
              <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Full ED Queue — {EMERGENCY_PATIENTS.length} patients</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#FEF2F2', color: C.red, fontWeight: 600 }}>{resusPatients.length} resus</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#FFF7ED', color: '#C2410C', fontWeight: 600 }}>{criticalPatients.length} critical</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', fontWeight: 600 }}>{stablePatients.length} stable</span>
            </div>
            {/* Prioritized by triage */}
            {[...resusPatients, ...criticalPatients, ...stablePatients].map(p => <PatientCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
