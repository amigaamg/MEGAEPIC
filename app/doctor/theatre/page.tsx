'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  Scissors, Clock, CheckCircle, AlertTriangle, XCircle,
  User, ChevronRight, Heart, Shield, FileText, Eye,
  FlaskConical, Activity, Search, Thermometer, Bed,
  ArrowRight, type LucideIcon,
} from 'lucide-react'

interface TheatreCase {
  id: string; patient: string; age: string; procedure: string; surgeon: string
  anaesthetist: string; priority: 'Emergency' | 'Urgent' | 'Elective'
  status: 'Pre-op' | 'Anaesthesia' | 'Operating' | 'Recovery' | 'Completed' | 'Cancelled'
  duration: string; bloodRequired: boolean; icuRequired: boolean; theatre: string; position: number
  images: string[]; checklist: { item: string; done: boolean }[]
  implants: string[]
}

const THEATRE_LIST: TheatreCase[] = [
  { id: 'th_001', patient: 'Peter Otieno', age: '67 M', procedure: 'Exploratory Laparotomy', surgeon: 'Dr. Kamau', anaesthetist: 'Dr. Ochieng', priority: 'Emergency', status: 'Operating', duration: '120 min', bloodRequired: true, icuRequired: true, theatre: 'Theatre 1', position: 1, images: ['CT Abdomen'], checklist: [{ item: 'Consent signed', done: true }, { item: 'Blood available', done: true }, { item: 'Antibiotics given', done: true }, { item: 'Thromboprophylaxis', done: true }, { item: 'Team brief', done: true }], implants: ['Nil'] },
  { id: 'th_002', patient: 'Grace Kamau', age: '42 F', procedure: 'Cholecystectomy (Laparoscopic)', surgeon: 'Dr. Kamau', anaesthetist: 'Dr. Ochieng', priority: 'Urgent', status: 'Anaesthesia', duration: '90 min', bloodRequired: false, icuRequired: false, theatre: 'Theatre 1', position: 2, images: ['US Abdomen', 'MRCP'], checklist: [{ item: 'Consent signed', done: true }, { item: 'Instruments ready', done: true }, { item: 'Antibiotics given', done: true }, { item: 'Team brief', done: false }], implants: ['Nil'] },
  { id: 'th_003', patient: 'Samuel Kioko', age: '45 M', procedure: 'Inguinal Hernia Repair (Lichtenstein)', surgeon: 'Dr. Mwangi', anaesthetist: 'Dr. Ochieng', priority: 'Elective', status: 'Pre-op', duration: '60 min', bloodRequired: false, icuRequired: false, theatre: 'Theatre 2', position: 1, images: [], checklist: [{ item: 'Consent signed', done: true }, { item: 'Marking done', done: true }, { item: 'Pre-op assessment', done: true }, { item: 'Antibiotics given', done: false }], implants: ['Polypropylene mesh'] },
  { id: 'th_004', patient: 'Mary Wambui', age: '55 F', procedure: 'Total Knee Replacement', surgeon: 'Dr. Mwangi', anaesthetist: 'Dr. Kimani', priority: 'Elective', status: 'Pre-op', duration: '150 min', bloodRequired: true, icuRequired: false, theatre: 'Theatre 2', position: 2, images: ['X-ray Knee', 'MRI Knee'], checklist: [{ item: 'Consent signed', done: true }, { item: 'Blood available', done: true }, { item: 'Implants ready', done: true }, { item: 'Team brief', done: false }, { item: 'Site marked', done: true }], implants: ['TKR implant set'] },
  { id: 'th_005', patient: 'David Kiprop', age: '65 M', procedure: 'Carotid Endarterectomy', surgeon: 'Dr. Kamau', anaesthetist: 'Dr. Kimani', priority: 'Elective', status: 'Recovery', duration: '120 min', bloodRequired: false, icuRequired: true, theatre: 'Theatre 1', position: 3, images: ['Carotid Doppler', 'CT Angiogram'], checklist: [{ item: 'Consent signed', done: true }, { item: 'Neurological monitoring', done: true }, { item: 'Shunt available', done: true }], implants: ['Nil'] },
]

export default function DoctorTheatrePage() {
  const router = useRouter()
  const [view, setView] = useState<'schedule' | 'case'>('schedule')
  const [selectedCase, setSelectedCase] = useState<string>(THEATRE_LIST[0].id)

  const surgicalCase = THEATRE_LIST.find(c => c.id === selectedCase) || THEATRE_LIST[0]
  const operating = THEATRE_LIST.filter(c => c.status === 'Operating')
  const preOp = THEATRE_LIST.filter(c => c.status === 'Pre-op')

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Scissors size={18} color={C.sky} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>THEATRE MODE</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setView('schedule')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'schedule' ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: view === 'schedule' ? C.skyLight : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'schedule' ? 600 : 400, color: view === 'schedule' ? C.sky : C.text }}>Today's List</button>
          <button onClick={() => setView('case')} style={{ padding: '6px 14px', borderRadius: 6, border: view === 'case' ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: view === 'case' ? C.skyLight : C.white, fontSize: 11, cursor: 'pointer', fontWeight: view === 'case' ? 600 : 400, color: view === 'case' ? C.sky : C.text }}>Case View</button>
        </div>
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight }}>← Back</button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {view === 'schedule' ? (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.sky }}>{THEATRE_LIST.length}</div>
                <div style={{ fontSize: 11, color: C.sky }}>Total Cases</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{THEATRE_LIST.filter(c => c.status === 'Completed').length}</div>
                <div style={{ fontSize: 11, color: C.green }}>Completed</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.red }}>{operating.length}</div>
                <div style={{ fontSize: 11, color: C.red }}>In Progress</div>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.amber }}>{preOp.length}</div>
                <div style={{ fontSize: 11, color: C.amber }}>Pre-op / Waiting</div>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Today's Theatre List</div>
              {THEATRE_LIST.map(c => (
                <div key={c.id} onClick={() => { setSelectedCase(c.id); setView('case') }} style={{ padding: '12px 16px', borderRadius: 10, background: c.status === 'Operating' ? '#F0F9FF' : c.status === 'Recovery' ? '#F0FDF4' : c.status === 'Completed' ? '#F0FDF4' : c.status === 'Cancelled' ? '#F1F5F9' : C.white, border: `1px solid ${c.status === 'Operating' ? '#BAE6FD' : c.status === 'Recovery' ? '#BBF7D0' : C.border}`, marginBottom: 6, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: c.priority === 'Emergency' ? '#FEF2F2' : c.priority === 'Urgent' ? '#FFFBEB' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: c.priority === 'Emergency' ? C.red : c.priority === 'Urgent' ? C.amber : C.green }}>{c.position}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{c.patient}</span>
                        <span style={{ fontSize: 11, color: C.textLight }}>{c.age}</span>
                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: c.priority === 'Emergency' ? '#FEF2F2' : c.priority === 'Urgent' ? '#FFFBEB' : '#F0FDF4', color: c.priority === 'Emergency' ? C.red : c.priority === 'Urgent' ? C.amber : C.green }}>{c.priority}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textLight }}>{c.procedure} · {c.surgeon} · {c.theatre}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: c.status === 'Operating' ? C.skyLight : c.status === 'Recovery' ? '#F0FDF4' : c.status === 'Completed' ? '#F0FDF4' : c.status === 'Cancelled' ? C.panel : C.panel, color: c.status === 'Operating' ? C.sky : c.status === 'Recovery' ? C.green : c.status === 'Completed' ? C.green : c.status === 'Cancelled' ? C.textLight : C.text }}>{c.status}</span>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{c.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {c.bloodRequired && <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, background: '#FEF2F2', color: C.red, border: '1px solid #FECACA' }}>Blood</span>}
                    {c.icuRequired && <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>ICU</span>}
                    {c.images.map((img, i) => <span key={i} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' }}>{img}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflow: 'auto' }}>
              {THEATRE_LIST.map(c => (
                <button key={c.id} onClick={() => setSelectedCase(c.id)} style={{ padding: '6px 14px', borderRadius: 6, border: c.id === selectedCase ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: c.id === selectedCase ? C.skyLight : C.white, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: c.id === selectedCase ? 600 : 400 }}>
                  #{c.position} {c.patient}
                </button>
              ))}
            </div>

            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24 }}>
              {/* Images */}
              {surgicalCase.images.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Imaging</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {surgicalCase.images.map((img, i) => (
                      <div key={i} style={{ padding: '8px 16px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={14} color={C.sky} /> {img}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WHO Checklist */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Shield size={14} color={C.green} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>WHO Surgical Safety Checklist</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textLight }}>{surgicalCase.checklist.filter(i => i.done).length}/{surgicalCase.checklist.length} complete</span>
                </div>
                {surgicalCase.checklist.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: item.done ? '#F0FDF4' : '#FFFBEB', marginBottom: 3, fontSize: 11 }}>
                    {item.done ? <CheckCircle size={14} color={C.green} /> : <Clock size={14} color={C.amber} />}
                    <span style={{ color: item.done ? '#166534' : '#92400E' }}>{item.item}</span>
                  </div>
                ))}
              </div>

              {/* Implants */}
              {surgicalCase.implants.length > 0 && surgicalCase.implants[0] !== 'Nil' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Implants</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {surgicalCase.implants.map((imp, i) => (
                      <span key={i} style={{ padding: '6px 12px', borderRadius: 6, background: '#FFF7ED', border: '1px solid #FED7AA', fontSize: 11, color: '#9A3412' }}>{imp}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Operation Note */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Operation Note</div>
                <textarea placeholder="Procedure, findings, blood loss, complications, specimens..."
                  style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
              </div>

              {/* Recovery */}
              {surgicalCase.status === 'Recovery' && (
                <div style={{ padding: '12px 16px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Heart size={14} color={C.green} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Recovery</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    <div style={{ padding: '6px 10px', borderRadius: 6, background: C.white, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>Aldrete</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>9/10</div>
                    </div>
                    <div style={{ padding: '6px 10px', borderRadius: 6, background: C.white, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>Pain</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>3/10</div>
                    </div>
                    <div style={{ padding: '6px 10px', borderRadius: 6, background: C.white, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>Bleeding</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Nil</div>
                    </div>
                    <div style={{ padding: '6px 10px', borderRadius: 6, background: C.white, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>Awareness</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Awake</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: C.sky, color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Sign Operation Note</button>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>Specimen Labels</button>
                <button style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>Post-op Orders</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
