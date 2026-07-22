'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  Video, Phone, Clock, Calendar, Users, Search, Plus,
  ArrowRight, MessageSquare, Monitor, Camera, Mic, MicOff,
  CameraOff, PhoneOff, FileText, Pill, CheckCircle, AlertTriangle,
  Brain, Download, Share2,
} from 'lucide-react'

interface TeleAppointment {
  id: string; patient: string; age: string; type: string; date: string; time: string; duration: string
  status: string; provider: string; dept: string; reason: string
}

const APPOINTMENTS: TeleAppointment[] = [
  { id: 't_001', patient: 'Grace Mwangi', age: '45 F', type: 'Cardiology Follow-up', date: '12 Jul 2026', time: '10:00', duration: '30min', status: 'confirmed', provider: 'Dr. Kamau', dept: 'Cardiology', reason: 'Chest pain review. ECG results.' },
  { id: 't_002', patient: 'John Kamau', age: '38 M', type: 'Consultation', date: '12 Jul 2026', time: '10:30', duration: '45min', status: 'confirmed', provider: 'Dr. Ochieng', dept: 'Internal Med', reason: 'Fatigue, weight loss. Lab review.' },
  { id: 't_003', patient: 'Samuel Ochieng', age: '55 M', type: 'Medication Review', date: '12 Jul 2026', time: '11:30', duration: '15min', status: 'in_progress', provider: 'Dr. Kamau', dept: 'Cardiology', reason: 'Warfarin dose adjustment.' },
  { id: 't_004', patient: 'Nancy Wambui', age: '32 F', type: 'Diabetes Check', date: '12 Jul 2026', time: '14:00', duration: '30min', status: 'scheduled', provider: 'Dr. Kamau', dept: 'Endocrinology', reason: 'HbA1c 8.5. Medication review.' },
  { id: 't_005', patient: 'Peter Kiprop', age: '65 M', type: 'Post-op Review', date: '13 Jul 2026', time: '09:00', duration: '30min', status: 'scheduled', provider: 'Dr. Ochieng', dept: 'Surgery', reason: 'Wound check. Stitch removal.' },
  { id: 't_006', patient: 'Faith Chebet', age: '28 F', type: 'ANC Visit', date: '13 Jul 2026', time: '10:00', duration: '20min', status: 'scheduled', provider: 'Dr. Mwangi', dept: 'OB/GYN', reason: 'Routine ANC. BP check.' },
]

export default function DoctorTelemedicinePage() {
  const router = useRouter()
  const [view, setView] = useState<'list' | 'call'>('list')
  const [callPatient, setCallPatient] = useState<TeleAppointment | null>(null)
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [showAiNotes, setShowAiNotes] = useState(false)

  const color = '#14B8A6'

  const startCall = (a: TeleAppointment) => {
    setCallPatient(a)
    setView('call')
  }

  if (view === 'call' && callPatient) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, background: '#1E293B', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
          <Video size={18} color={color} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>AMEXAN Telemedicine</span>
          <span style={{ width: 1, height: 20, background: '#334155' }} />
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{callPatient.patient} · {callPatient.type}</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#64748B' }}>{callPatient.provider} · Duration: 00:12:34</span>
        </div>

        <div style={{ flex: 1, display: 'flex' }}>
          {/* Video Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1E293B' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Users size={36} color={color} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>{callPatient.patient}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{callPatient.type} · {callPatient.reason}</div>
              </div>
            </div>

            {/* Self View */}
            <div style={{ position: 'absolute', bottom: 80, right: 16, width: 180, height: 135, borderRadius: 12, background: '#334155', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
              {!videoOff && <div style={{ padding: 8, fontSize: 10, color: '#64748B' }}>Dr. Kamau</div>}
              {videoOff && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 10, color: '#64748B' }}>Camera Off</div>}
            </div>

            {/* Controls */}
            <div style={{ height: 64, background: '#1E293B', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button onClick={() => setMuted(!muted)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: muted ? '#EF4444' : '#334155', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {muted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button onClick={() => setVideoOff(!videoOff)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: videoOff ? '#EF4444' : '#334155', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {videoOff ? <CameraOff size={18} /> : <Camera size={18} />}
              </button>
              <button onClick={() => { setView('list'); setCallPatient(null) }} style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: '#EF4444', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneOff size={22} />
              </button>
              <button onClick={() => setShowAiNotes(!showAiNotes)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: showAiNotes ? color : '#334155', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={18} />
              </button>
              <button style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#334155', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} />
              </button>
            </div>
          </div>

          {/* AI Side Panel */}
          {showAiNotes && (
            <div style={{ width: 320, background: '#1E293B', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Brain size={16} color={color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>AI Clinical Assistant</span>
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>LIVE TRANSCRIPTION</div>
                  <div style={{ fontSize: 12, color: '#E2E8F0', lineHeight: 1.6 }}>
                    Patient: "I've been having chest pain for the past two weeks..."<br />
                    Doctor: "Is the pain worse with exertion?"<br />
                    Patient: "Yes, especially when I climb stairs."<br />
                    Doctor: "Any associated shortness of breath?"<br />
                    Patient: "Sometimes, especially at night."
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#0F172A', border: '1px solid #334155', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: color, marginBottom: 4 }}>AI-GENERATED SUMMARY</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
                    45F with 2-week history of exertional chest pain. Associated orthopnoea. No radiation. No palpitations.
                    Likely differentials: Angina, GERD, Musculoskeletal.
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#0F172A', border: '1px solid #334155', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>SUGGESTED ACTIONS</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    • Order ECG<br />• Order Troponin<br />• Consider stress test<br />• Start PPI trial
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #334155', display: 'flex', gap: 6 }}>
                <button style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: color, color: '#FFF', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><Download size={12} /> Save Notes</button>
                <button style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', fontSize: 11, cursor: 'pointer' }}><Share2 size={12} /> E-Prescribe</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Video size={18} color={color} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: `${color}15`, color: color, fontWeight: 600 }}>TELEMEDICINE</span>
        <span style={{ fontSize: 12, color: C.textLight }}>Dr. James Mwangi</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight }}>← Back</button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{APPOINTMENTS.length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Today's Appointments</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{APPOINTMENTS.filter(a => a.status === 'confirmed' || a.status === 'in_progress').length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Pending Consultations</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.amber }}>2</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Awaiting Lab Results</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.sky }}>3</div>
              <div style={{ fontSize: 11, color: C.textLight }}>E-Rx Pending Signature</div>
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Video Consultations</div>
            {APPOINTMENTS.map(a => (
              <div key={a.id} style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{a.patient}</span>
                    <span style={{ fontSize: 11, color: C.textLight }}>{a.age}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: a.status === 'in_progress' ? `${color}15` : a.status === 'confirmed' ? '#F0FDF4' : '#F1F5F9', color: a.status === 'in_progress' ? color : a.status === 'confirmed' ? C.green : C.textLight }}>{a.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textLight }}>{a.type} · {a.dept} · {a.reason}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.time} · {a.duration}</div>
                  <button onClick={() => startCall(a)} disabled={a.status === 'scheduled'} style={{ marginTop: 4, padding: '5px 12px', borderRadius: 6, border: 'none', background: a.status === 'scheduled' ? C.panel : color, color: a.status === 'scheduled' ? C.textLight : C.white, fontSize: 10, fontWeight: 600, cursor: a.status === 'scheduled' ? 'default' : 'pointer' }}>
                    {a.status === 'in_progress' ? '↻ Join Call' : a.status === 'confirmed' ? '▶ Start Call' : 'Scheduled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
