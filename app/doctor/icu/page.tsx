'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  Monitor, Heart, Wind, Droplets, Syringe, AlertTriangle,
  Bed, Activity, Thermometer, Weight, Clock, CheckCircle,
  Users, Brain, Pill, FileText, MessageSquare, Stethoscope,
  ArrowRight, ChevronRight, Search, Ambulance, type LucideIcon,
} from 'lucide-react'

interface ICUVitals {
  hr: number; bp: string; map: number; rr: number; spo2: number; temp: number; cvp: number
}

interface ICUPatient {
  id: string; name: string; age: string; bed: string; diagnosis: string; admissionDay: number
  vitals: ICUVitals
  ventilator: { mode: string; fio2: number; peep: number; tv: number; pp: number; dp: number; mv: number; weaning: string }
  abg: { ph: number; pco2: number; po2: number; hco3: number; lactate: number; be: number }
  pressors: { drug: string; dose: string; trend: 'up' | 'down' | 'stable' }[]
  sedation: { drug: string; dose: string; RASS: number }
  lines: string[]
  urine: string
  sofa: number; apache: number
  nutrition: string
  status: 'critical' | 'deteriorating' | 'stable' | 'improving'
  alerts: string[]
  familyMeetingToday: boolean
}

const ICU_PATIENTS: ICUPatient[] = [
  {
    id: 'icu_001', name: 'James Mwangi', age: '2 yrs M', bed: 'ICU-01', diagnosis: 'Severe Malaria with MODS', admissionDay: 3,
    vitals: { hr: 145, bp: '85/45', map: 58, rr: 42, spo2: 92, temp: 38.8, cvp: 6 },
    ventilator: { mode: 'SIMV', fio2: 40, peep: 5, tv: 120, pp: 22, dp: 12, mv: 2.4, weaning: 'Not ready' },
    abg: { ph: 7.32, pco2: 38, po2: 98, hco3: 19, lactate: 3.8, be: -6 },
    pressors: [{ drug: 'Noradrenaline', dose: '0.12 mcg/kg/min', trend: 'stable' }],
    sedation: { drug: 'Midazolam', dose: '2 mcg/kg/min', RASS: -3 },
    lines: ['Femoral CVC', 'Peripheral IV ×2', 'Arterial line'],
    urine: '0.4 mL/kg/hr', sofa: 11, apache: 18,
    nutrition: 'PN - 60 mL/hr (trophic)', status: 'critical',
    alerts: ['Lactate > 2', 'MAP < 65', 'Anuria risk'], familyMeetingToday: false,
  },
  {
    id: 'icu_002', name: 'Mary Achieng', age: '45 yrs F', bed: 'ICU-02', diagnosis: 'Septic Shock (E. coli)', admissionDay: 1,
    vitals: { hr: 130, bp: '78/42', map: 54, rr: 36, spo2: 90, temp: 39.5, cvp: 4 },
    ventilator: { mode: 'PRVC', fio2: 55, peep: 8, tv: 380, pp: 28, dp: 16, mv: 6.8, weaning: 'Not ready' },
    abg: { ph: 7.28, pco2: 35, po2: 82, hco3: 16, lactate: 4.5, be: -10 },
    pressors: [{ drug: 'Noradrenaline', dose: '0.35 mcg/kg/min', trend: 'up' }, { drug: 'Vasopressin', dose: '0.03 U/min', trend: 'stable' }],
    sedation: { drug: 'Propofol', dose: '30 mcg/kg/min', RASS: -4 },
    lines: ['IJ CVC', 'Arterial line', 'Peripheral IV'],
    urine: '0.2 mL/kg/hr', sofa: 14, apache: 26,
    nutrition: 'Nil - haemodynamically unstable', status: 'deteriorating',
    alerts: ['Lactate 4.5', 'MAP < 65 on 2 pressors', 'Anuric', 'Source control pending'], familyMeetingToday: true,
  },
  {
    id: 'icu_003', name: 'Peter Otieno', age: '67 yrs M', bed: 'ICU-03', diagnosis: 'Post-Laparotomy (Perforated DU)', admissionDay: 5,
    vitals: { hr: 88, bp: '120/75', map: 90, rr: 20, spo2: 97, temp: 37.0, cvp: 8 },
    ventilator: { mode: 'CPAP', fio2: 35, peep: 5, tv: 450, pp: 18, dp: 8, mv: 6.2, weaning: 'SBT tomorrow' },
    abg: { ph: 7.40, pco2: 38, po2: 105, hco3: 24, lactate: 1.2, be: 0 },
    pressors: [{ drug: 'Noradrenaline', dose: '0.05 mcg/kg/min (weaning)', trend: 'down' }],
    sedation: { drug: 'Dexmedetomidine', dose: '0.5 mcg/kg/hr', RASS: -1 },
    lines: ['IJ CVC', 'Arterial line', 'Surgical drain ×2', 'NG tube'],
    urine: '1.2 mL/kg/hr', sofa: 6, apache: 12,
    nutrition: 'NG feed - 40 mL/hr (tolerating)', status: 'improving',
    alerts: [], familyMeetingToday: false,
  },
  {
    id: 'icu_004', name: 'Grace Wanjiku', age: '30 yrs F', bed: 'ICU-04', diagnosis: 'DKA with Cerebral Oedema', admissionDay: 2,
    vitals: { hr: 102, bp: '105/65', map: 78, rr: 24, spo2: 98, temp: 37.2, cvp: 7 },
    ventilator: { mode: 'None (extubated)', fio2: 21, peep: 0, tv: 0, pp: 0, dp: 0, mv: 0, weaning: 'N/A - extubated' },
    abg: { ph: 7.35, pco2: 32, po2: 110, hco3: 18, lactate: 1.8, be: -5 },
    pressors: [],
    sedation: { drug: 'Nil', dose: '', RASS: 0 },
    lines: ['Peripheral IV ×2', 'Insulin infusion pump'],
    urine: '1.8 mL/kg/hr', sofa: 3, apache: 8,
    nutrition: 'Sips of water, advancing', status: 'improving',
    alerts: ['Monitor for rebound hypoglycaemia'], familyMeetingToday: false,
  },
]

export default function DoctorICUPage() {
  const router = useRouter()
  const [selectedBed, setSelectedBed] = useState<string>(ICU_PATIENTS[0].id)
  const [view, setView] = useState<'board' | 'patient'>('board')

  const patient = ICU_PATIENTS.find(p => p.id === selectedBed) || ICU_PATIENTS[0]
  const criticalPatients = useMemo(() => ICU_PATIENTS.filter(p => p.status === 'critical' || p.status === 'deteriorating'), [])
  const stablePatients = useMemo(() => ICU_PATIENTS.filter(p => p.status === 'stable' || p.status === 'improving'), [])

  const VStat = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: color || C.navy }}>{value}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Monitor size={18} color={C.sky} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>ICU DOCTOR MODE</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setView('board')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'board' ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: view === 'board' ? C.skyLight : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'board' ? 600 : 400, color: view === 'board' ? C.sky : C.text }}>ICU Board</button>
          <button onClick={() => setView('patient')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'patient' ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: view === 'patient' ? C.skyLight : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'patient' ? 600 : 400, color: view === 'patient' ? C.sky : C.text }}>Patient View</button>
        </div>
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight }}>← Back</button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {view === 'board' ? (
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.red }}>{criticalPatients.length}</div>
                <div style={{ fontSize: 11, color: C.red }}>Critical / Deteriorating</div>
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{stablePatients.length}</div>
                <div style={{ fontSize: 11, color: C.green }}>Stable / Improving</div>
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{ICU_PATIENTS.filter(p => p.ventilator.mode !== 'None' && !p.ventilator.mode.includes('extubated')).length}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>Ventilated</div>
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{ICU_PATIENTS.filter(p => p.familyMeetingToday).length}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>Family Meetings Today</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {ICU_PATIENTS.map(p => (
                <div key={p.id} onClick={() => { setSelectedBed(p.id); setView('patient') }} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: p.status === 'critical' || p.status === 'deteriorating' ? '#FEF2F2' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={16} color={p.status === 'critical' || p.status === 'deteriorating' ? C.red : C.green} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.bed}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: p.status === 'critical' ? '#FEF2F2' : p.status === 'deteriorating' ? '#FFF7ED' : p.status === 'stable' ? '#FEFCE8' : '#F0FDF4', color: p.status === 'critical' ? C.red : p.status === 'deteriorating' ? '#C2410C' : p.status === 'stable' ? C.amber : C.green }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8 }}>{p.diagnosis} · Day {p.admissionDay}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 8 }}>
                    <VStat label="MAP" value={String(p.vitals.map)} color={p.vitals.map < 65 ? C.red : C.text} />
                    <VStat label="FiO2" value={`${p.ventilator.fio2}%`} color={p.ventilator.fio2 > 50 ? C.amber : C.text} />
                    <VStat label="PEEP" value={String(p.ventilator.peep)} color={p.ventilator.peep > 8 ? C.amber : C.text} />
                    <VStat label="SOFA" value={String(p.sofa)} color={p.sofa > 10 ? C.red : p.sofa > 5 ? C.amber : C.green} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                    <VStat label="Lactate" value={String(p.abg.lactate)} color={p.abg.lactate > 2 ? C.red : C.text} />
                    <VStat label="Urine" value={p.urine} color={p.urine.startsWith('0.') ? C.red : C.text} />
                    <VStat label="RASS" value={String(p.sedation.RASS)} />
                    <VStat label="Pressors" value={p.pressors.length > 0 ? `${p.pressors.length} drugs` : 'None'} color={p.pressors.length > 1 ? C.red : p.pressors.length > 0 ? C.amber : C.green} />
                  </div>
                  {p.alerts.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {p.alerts.map((a, i) => (
                        <span key={i} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, background: '#FEF2F2', color: C.red, border: '1px solid #FECACA' }}>
                          <AlertTriangle size={9} style={{ marginRight: 2 }} />{a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Patient Selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflow: 'auto' }}>
              {ICU_PATIENTS.map(p => (
                <button key={p.id} onClick={() => setSelectedBed(p.id)} style={{ padding: '6px 14px', borderRadius: 6, border: p.id === selectedBed ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: p.id === selectedBed ? C.skyLight : C.white, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: p.id === selectedBed ? 600 : 400 }}>
                  {p.bed} — {p.name}
                </button>
              ))}
            </div>

            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: patient.status === 'critical' || patient.status === 'deteriorating' ? '#FEF2F2' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={20} color={patient.status === 'critical' || patient.status === 'deteriorating' ? C.red : C.green} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{patient.bed} — {patient.name}</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>{patient.diagnosis} · Day {patient.admissionDay}</div>
                </div>
                <div style={{ flex: 1 }} />
                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: patient.status === 'critical' ? '#FEF2F2' : patient.status === 'deteriorating' ? '#FFF7ED' : '#F0FDF4', color: patient.status === 'critical' ? C.red : patient.status === 'deteriorating' ? '#C2410C' : C.green }}>{patient.status.toUpperCase()}</span>
              </div>

              {/* Vitals Grid */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Vital Signs</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  <VStat label="HR" value={String(patient.vitals.hr)} color={patient.vitals.hr > 120 || patient.vitals.hr < 60 ? C.red : C.text} />
                  <VStat label="BP" value={patient.vitals.bp} color={patient.vitals.map < 65 ? C.red : C.text} />
                  <VStat label="MAP" value={String(patient.vitals.map)} color={patient.vitals.map < 65 ? C.red : C.green} />
                  <VStat label="RR" value={String(patient.vitals.rr)} color={patient.vitals.rr > 30 || patient.vitals.rr < 10 ? C.red : C.text} />
                  <VStat label="SpO2" value={`${patient.vitals.spo2}%`} color={patient.vitals.spo2 < 94 ? C.red : C.text} />
                  <VStat label="Temp" value={`${patient.vitals.temp}°C`} color={patient.vitals.temp > 38 || patient.vitals.temp < 36 ? C.red : C.text} />
                  <VStat label="CVP" value={String(patient.vitals.cvp)} color={patient.vitals.cvp < 4 || patient.vitals.cvp > 12 ? C.amber : C.text} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Left Column */}
                <div>
                  {/* Ventilator */}
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: '#F0F9FF', border: '1px solid #BAE6FD', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Wind size={14} color={C.sky} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0369A1' }}>Ventilator</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748B' }}>{patient.ventilator.mode}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                      <VStat label="FiO2" value={`${patient.ventilator.fio2}%`} color={patient.ventilator.fio2 > 50 ? C.amber : C.text} />
                      <VStat label="PEEP" value={String(patient.ventilator.peep)} color={patient.ventilator.peep > 8 ? C.amber : C.text} />
                      <VStat label="TV" value={String(patient.ventilator.tv)} />
                      <VStat label="P.plat" value={String(patient.ventilator.pp)} color={patient.ventilator.pp > 30 ? C.red : C.text} />
                      <VStat label="DP" value={String(patient.ventilator.dp)} color={patient.ventilator.dp > 15 ? C.red : C.text} />
                      <VStat label="MV" value={String(patient.ventilator.mv)} />
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>Weaning: {patient.ventilator.weaning}</div>
                  </div>

                  {/* ABG */}
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Droplets size={14} color={C.red} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>Arterial Blood Gas</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                      <VStat label="pH" value={String(patient.abg.ph)} color={patient.abg.ph < 7.35 || patient.abg.ph > 7.45 ? C.red : C.text} />
                      <VStat label="pCO2" value={String(patient.abg.pco2)} color={patient.abg.pco2 > 45 || patient.abg.pco2 < 35 ? C.red : C.text} />
                      <VStat label="pO2" value={String(patient.abg.po2)} color={patient.abg.po2 < 80 ? C.red : C.text} />
                      <VStat label="HCO3" value={String(patient.abg.hco3)} color={patient.abg.hco3 < 22 || patient.abg.hco3 > 26 ? C.amber : C.text} />
                      <VStat label="Lactate" value={String(patient.abg.lactate)} color={patient.abg.lactate > 2 ? C.red : C.text} />
                      <VStat label="BE" value={String(patient.abg.be)} color={patient.abg.be < -5 || patient.abg.be > 5 ? C.amber : C.text} />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* Pressors */}
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: '#FFF7ED', border: '1px solid #FED7AA', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Syringe size={14} color={C.amber} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#9A3412' }}>Vasoactive Drugs</span>
                    </div>
                    {patient.pressors.length > 0 ? patient.pressors.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: C.white, marginBottom: 4, fontSize: 11 }}>
                        <span style={{ fontWeight: 600, minWidth: 100 }}>{p.drug}</span>
                        <span style={{ color: C.textLight }}>{p.dose}</span>
                        <span style={{ marginLeft: 'auto', color: p.trend === 'up' ? C.red : p.trend === 'down' ? C.green : C.textLight }}>
                          {p.trend === 'up' ? '↑ Increasing' : p.trend === 'down' ? '↓ Weaning' : '→ Stable'}
                        </span>
                      </div>
                    )) : <div style={{ fontSize: 11, color: C.textLight }}>No vasoactive drugs</div>}
                  </div>

                  {/* Sedation */}
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: '#F5F3FF', border: '1px solid #DDD6FE', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Brain size={14} color={'#7C3AED'} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#6D28D9' }}>Sedation & Analgesia</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                      <VStat label="Drug" value={patient.sedation.drug || 'None'} />
                      <VStat label="Dose" value={patient.sedation.dose || '-'} />
                      <VStat label="RASS" value={String(patient.sedation.RASS)} color={patient.sedation.RASS < -4 || patient.sedation.RASS > 0 ? C.amber : C.text} />
                    </div>
                  </div>

                  {/* Lines, Urine, Nutrition */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 4 }}>LINES</div>
                      {patient.lines.map((l, i) => <div key={i} style={{ fontSize: 10, color: C.text }}>{l}</div>)}
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 4 }}>URINE OUTPUT</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: patient.urine.startsWith('0.') ? C.red : C.navy }}>{patient.urine}</div>
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 4 }}>NUTRITION</div>
                      <div style={{ fontSize: 10, color: C.text }}>{patient.nutrition}</div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ padding: '8px 14px', borderRadius: 6, background: patient.sofa > 10 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${patient.sofa > 10 ? '#FECACA' : '#BBF7D0'}`, fontSize: 11 }}>
                      <span style={{ fontWeight: 600 }}>SOFA: {patient.sofa}</span>
                    </div>
                    <div style={{ padding: '8px 14px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, fontSize: 11 }}>
                      <span style={{ fontWeight: 600 }}>APACHE II: {patient.apache}</span>
                    </div>
                    {patient.familyMeetingToday && (
                      <div style={{ padding: '8px 14px', borderRadius: 6, background: '#F5F3FF', border: '1px solid #DDD6FE', fontSize: 11, color: '#6D28D9' }}>
                        <Users size={12} style={{ marginRight: 4 }} />Family Meeting Scheduled
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 6, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: C.sky, color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Daily Goals</button>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>ICU Round Note</button>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>Order ABG</button>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>Adjust Ventilation</button>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>Family Discussion</button>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>Code Blue</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
