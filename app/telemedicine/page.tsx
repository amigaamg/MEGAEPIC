'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Video, Phone, Clock, Calendar, Users, Search, Plus, ArrowRight, MessageSquare, Monitor, Camera, Mic, MicOff, CameraOff, PhoneOff, FileText, Pill, Brain, Download, Share2, CheckCircle, AlertTriangle } from 'lucide-react'

const color = '#14B8A6'

interface TeleAppointment {
  id: string; patient: string; type: string; date: string; time: string; duration: string; status: string; provider: string; dept: string
}

const APPOINTMENTS: TeleAppointment[] = [
  { id: 'T-001', patient: 'Grace Mwangi', type: 'Follow-up', date: '12 Jul 2026', time: '10:00', duration: '30min', status: 'confirmed', provider: 'Dr. Kamau', dept: 'Cardiology' },
  { id: 'T-002', patient: 'John Kamau', type: 'Consultation', date: '12 Jul 2026', time: '10:30', duration: '45min', status: 'confirmed', provider: 'Dr. Ochieng', dept: 'Internal Med' },
  { id: 'T-003', patient: 'Samuel Ochieng', type: 'Medication Review', date: '12 Jul 2026', time: '11:30', duration: '15min', status: 'in_progress', provider: 'Dr. Kamau', dept: 'Cardiology' },
  { id: 'T-004', patient: 'Nancy Wambui', type: 'Diabetes Check', date: '12 Jul 2026', time: '14:00', duration: '30min', status: 'scheduled', provider: 'Dr. Kamau', dept: 'Endocrinology' },
  { id: 'T-005', patient: 'Peter Kiprop', type: 'Post-op Review', date: '13 Jul 2026', time: '09:00', duration: '30min', status: 'scheduled', provider: 'Dr. Ochieng', dept: 'Surgery' },
  { id: 'T-006', patient: 'Faith Chebet', type: 'ANC Visit', date: '13 Jul 2026', time: '10:00', duration: '20min', status: 'scheduled', provider: 'Dr. Mwangi', dept: 'OB/GYN' },
]

export default function TelemedicinePage() {
  const [tab, setTab] = useState('upcoming')
  const [inCall, setInCall] = useState(false)
  const [callPatient, setCallPatient] = useState('')
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [showAiSidebar, setShowAiSidebar] = useState(true)
  const [showRx, setShowRx] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  const startCall = (patient: string) => {
    setCallPatient(patient)
    setInCall(true)
  }

  if (inCall) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, background: '#1E293B', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
          <Video size={18} color={color} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>AMEXAN Telemedicine</span>
          <span style={{ width: 1, height: 20, background: '#334155' }} />
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{callPatient} · Dr. James Kamau</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: `${color}20`, color: color, fontWeight: 600 }}>AI Transcription Active</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>Duration: 00:12:34</span>
        </div>

        <div style={{ flex: 1, display: 'flex' }}>
          {/* Video Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1E293B' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Users size={36} color={color} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>{callPatient}</div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Cardiology Follow-up</div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={() => setShowRx(true)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: color, color: '#FFF', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><Pill size={14} /> E-Prescribe</button>
                  <button onClick={() => setShowFollowUp(true)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', fontSize: 11, cursor: 'pointer' }}><Calendar size={14} /> Book Follow-up</button>
                  <button style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', fontSize: 11, cursor: 'pointer' }}><MessageSquare size={14} /> Send Message</button>
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 80, right: 16, width: 180, height: 135, borderRadius: 12, background: '#334155', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
              {!videoOff && <div style={{ padding: 8, fontSize: 10, color: '#64748B' }}>Dr. Kamau</div>}
              {videoOff && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 10, color: '#64748B' }}>Camera Off</div>}
            </div>

            {/* Controls */}
            <div style={{ height: 64, background: '#1E293B', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button onClick={() => setMuted(!muted)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: muted ? '#EF4444' : '#334155', color: '#FFF', cursor: 'pointer' }}>
                {muted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button onClick={() => setVideoOff(!videoOff)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: videoOff ? '#EF4444' : '#334155', color: '#FFF', cursor: 'pointer' }}>
                {videoOff ? <CameraOff size={18} /> : <Camera size={18} />}
              </button>
              <button onClick={() => { setInCall(false); setCallPatient('') }} style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: '#EF4444', color: '#FFF', cursor: 'pointer' }}>
                <PhoneOff size={22} />
              </button>
              <button onClick={() => setShowAiSidebar(!showAiSidebar)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: showAiSidebar ? color : '#334155', color: '#FFF', cursor: 'pointer' }}>
                <Brain size={18} />
              </button>
              <button onClick={() => setShowRx(true)} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#334155', color: '#FFF', cursor: 'pointer' }}>
                <Pill size={18} />
              </button>
              <button style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#334155', color: '#FFF', cursor: 'pointer' }}>
                <FileText size={18} />
              </button>
            </div>
          </div>

          {/* AI Sidebar */}
          {showAiSidebar && (
            <div style={{ width: 320, background: '#1E293B', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={16} color={color} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>AI Clinical Assistant</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${color}20`, color: color }}>LIVE</span>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6 }}>Live Transcription</div>
                  <div style={{ fontSize: 12, color: '#E2E8F0', lineHeight: 1.6 }}>
                    <span style={{ color: color }}>Patient:</span> "I've been having chest pain for the past two weeks..."<br />
                    <span style={{ color: '#F59E0B' }}>Doctor:</span> "Is the pain worse with exertion?"<br />
                    <span style={{ color: color }}>Patient:</span> "Yes, especially when I climb stairs."<br />
                    <span style={{ color: '#F59E0B' }}>Doctor:</span> "Any associated shortness of breath?"<br />
                    <span style={{ color: color }}>Patient:</span> "Sometimes, especially at night."
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#0F172A', border: '1px solid #334155', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: color, textTransform: 'uppercase', marginBottom: 4 }}>AI Summary</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
                    45F with 2-week history of exertional chest pain. Associated orthopnoea. No radiation. No palpitations.<br />
                    Likely differentials: Angina, GERD, Musculoskeletal.
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#0F172A', border: '1px solid #334155', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#F59E0B', textTransform: 'uppercase', marginBottom: 4 }}>Suggested Actions</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    • Order ECG<br />• Order Troponin<br />• Consider stress test<br />• Start PPI trial<br />• Schedule follow-up in 2 weeks
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #334155', display: 'flex', gap: 6 }}>
                <button style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: color, color: '#FFF', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><Download size={12} /> Save Notes</button>
                <button onClick={() => setShowRx(true)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', fontSize: 11, cursor: 'pointer' }}><Pill size={12} /> E-Prescribe</button>
              </div>
            </div>
          )}
        </div>

        {/* E-Rx Dialog */}
        {showRx && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#1E293B', borderRadius: 16, padding: 28, maxWidth: 440, width: '90%', border: '1px solid #334155' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 16 }}>Electronic Prescription</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <input placeholder="Drug name" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13, outline: 'none' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input placeholder="Dose" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13, outline: 'none' }} />
                  <select style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13 }}>
                    <option>PO</option><option>IV</option><option>IM</option><option>SC</option><option>Topical</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input placeholder="Frequency" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13, outline: 'none' }} />
                  <input placeholder="Duration" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13, outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowRx(false)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { setShowRx(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: color, color: '#FFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Sign & Send</button>
              </div>
            </div>
          </div>
        )}

        {showFollowUp && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#1E293B', borderRadius: 16, padding: 28, maxWidth: 400, width: '90%', border: '1px solid #334155' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 16 }}>Book Follow-up</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <input type="date" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13, outline: 'none' }} />
                <select style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13 }}>
                  <option>Video Consultation</option><option>Clinic Visit</option><option>Phone Call</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowFollowUp(false)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { setShowFollowUp(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: color, color: '#FFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Book</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Video size={18} color={color} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN Telemedicine</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 12, color: C.textLight }}>Dr. James Kamau</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>↻</button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{APPOINTMENTS.length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Today</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{APPOINTMENTS.filter(a => a.status === 'confirmed').length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Confirmed</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.amber }}>{APPOINTMENTS.filter(a => a.date === '12 Jul 2026' && a.status === 'scheduled').length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Scheduled</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: color }}>6</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Total Patients</div>
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Video Consultations</div>
            {APPOINTMENTS.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, borderBottom: `1px solid ${C.panel}` }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.patient}</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>{a.type} · {a.dept}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: C.text }}>{a.time} · {a.duration}</div>
                  <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: a.status === 'confirmed' ? '#F0FDF4' : a.status === 'in_progress' ? `${color}15` : '#F1F5F9', color: a.status === 'confirmed' ? C.green : a.status === 'in_progress' ? color : C.textLight }}>{a.status}</span>
                </div>
                <button onClick={() => startCall(a.patient)} disabled={a.status === 'scheduled'} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: a.status === 'scheduled' ? C.panel : color, color: a.status === 'scheduled' ? C.textLight : C.white, fontSize: 11, fontWeight: 600, cursor: a.status === 'scheduled' ? 'default' : 'pointer' }}>
                  {a.status === 'in_progress' ? '↻ Join' : '▶ Start'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
