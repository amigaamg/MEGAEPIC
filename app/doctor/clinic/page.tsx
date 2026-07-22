'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  Calendar, Clock, User, Users, FileText, Pill, Beaker,
  AlertTriangle, CheckCircle, ChevronRight, Search, Plus,
  ArrowRight, MessageSquare, Activity, Printer, LogOut, Syringe,
} from 'lucide-react'

interface ClinicAppointment {
  id: string; patient: string; age: string; type: string; time: string; status: string; reason: string
  previousHistory: string; currentMeds: string; allergies: string
}

const CLINIC_APPOINTMENTS: ClinicAppointment[] = [
  { id: 'cl_001', patient: 'Grace Wanjiku', age: '45 F', type: 'Diabetes Follow-up', time: '09:00', status: 'checked_in', reason: 'Routine diabetes review. HbA1c check.', previousHistory: 'Type 2 DM × 8 years. Hypertension. CKD Stage 3.', currentMeds: 'Metformin 1g BD, Empagliflozin 10mg OD, Enalapril 5mg OD', allergies: 'Nil' },
  { id: 'cl_002', patient: 'Samuel Ochieng', age: '35 M', type: 'Hypertension Review', time: '09:30', status: 'checked_in', reason: 'BP check. Medication adherence review.', previousHistory: 'HTN × 3 years. No complications.', currentMeds: 'Amlodipine 5mg OD, HCTZ 12.5mg OD', allergies: 'Penicillin' },
  { id: 'cl_003', patient: 'Nancy Wambui', age: '28 F', type: 'ANC Visit (34w)', time: '10:00', status: 'confirmed', reason: 'Routine ANC. Growth scan review.', previousHistory: 'G1P0. No complications. EDD 28 Aug.', currentMeds: 'Folic acid, Ferrous sulfate', allergies: 'Nil' },
  { id: 'cl_004', patient: 'Peter Kiprop', age: '55 M', type: 'Post-op Review', time: '10:30', status: 'confirmed', reason: '4 weeks post-hernia repair. Wound check.', previousHistory: 'Lichtenstein hernia repair 4 weeks ago. Uneventful recovery.', currentMeds: 'Paracetamol PRN', allergies: 'Codeine' },
  { id: 'cl_005', patient: 'Faith Chebet', age: '62 F', type: 'Rheumatology Follow-up', time: '11:00', status: 'arrived', reason: 'Rheumatoid arthritis review. Joint pain assessment.', previousHistory: 'RA × 15 years. On DMARDs. Recent flare.', currentMeds: 'Methotrexate 15mg weekly, Prednisolone 5mg OD, Folic acid', allergies: 'Sulfa' },
  { id: 'cl_006', patient: 'James Mwangi', age: '68 M', type: 'CKD Review', time: '11:30', status: 'scheduled', reason: 'eGFR decline. Anaemia management.', previousHistory: 'CKD Stage 4 (eGFR 22). DM, HTN. On ESA.', currentMeds: 'Darbepoetin, Ferrous sulfate, Sevelamer, Enalapril', allergies: 'Nil' },
]

export default function DoctorClinicPage() {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [showRx, setShowRx] = useState(false)
  const [showRefer, setShowRefer] = useState(false)

  const patient = CLINIC_APPOINTMENTS.find(p => p.id === selectedPatient)
  const now = new Date()
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Calendar size={18} color={C.sky} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>CLINIC MODE</span>
        <span style={{ fontSize: 12, color: C.textLight }}>Dr. James Mwangi · General Surgery Clinic</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight }}>← Back</button>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Patient List */}
        <div style={{ width: 340, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Today's Clinic</div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{CLINIC_APPOINTMENTS.length} appointments</div>
            <div style={{ position: 'relative', marginTop: 8 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: C.textLight }} />
              <input style={{ width: '100%', height: 32, padding: '0 10px 0 30px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, background: C.panel, outline: 'none', fontFamily: "'Inter', sans-serif" }} placeholder="Search patients..." />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {CLINIC_APPOINTMENTS.map(a => (
              <div key={a.id} onClick={() => setSelectedPatient(a.id)} style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: `1px solid ${C.panel}`, background: selectedPatient === a.id ? C.skyLight : 'transparent', borderLeft: selectedPatient === a.id ? `3px solid ${C.sky}` : '3px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.status === 'checked_in' ? C.green : a.status === 'arrived' ? C.amber : C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.white, fontWeight: 600 }}>{a.patient.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.patient}</div>
                    <div style={{ fontSize: 10, color: C.textLight }}>{a.type} · {a.age}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{a.time}</div>
                    <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 8, fontWeight: 600, background: a.status === 'checked_in' ? '#F0FDF4' : a.status === 'arrived' ? '#FFFBEB' : '#F1F5F9', color: a.status === 'checked_in' ? C.green : a.status === 'arrived' ? C.amber : C.textLight }}>{a.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Patient Workspace */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {patient ? (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              {/* Patient Banner */}
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 18, fontWeight: 600 }}>{patient.patient.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{patient.patient}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{patient.age} · {patient.type} · {patient.reason}</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#F0FDF4', color: C.green }}>{patient.time}</span>
                </div>
              </div>

              {/* Previous History */}
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Previous History</div>
                <div style={{ fontSize: 12, color: C.textLight }}>{patient.previousHistory}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Current Medications</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>{patient.currentMeds}</div>
                </div>
                <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Allergies</div>
                  <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: patient.allergies === 'Nil' ? '#F0FDF4' : '#FEF2F2', color: patient.allergies === 'Nil' ? C.green : C.red, display: 'inline-block' }}>{patient.allergies}</div>
                </div>
              </div>

              {/* Consultation */}
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Current Complaint & Assessment</div>
                <textarea placeholder="Chief complaint, history, examination findings..."
                  style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical', marginBottom: 8 }} />
                <textarea placeholder="Assessment and plan..."
                  style={{ width: '100%', minHeight: 60, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                <button onClick={() => setShowRx(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Pill size={14} /> E-Prescription</button>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Beaker size={14} /> Order Lab</button>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> Imaging</button>
                <button onClick={() => setShowRefer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><ArrowRight size={14} /> Refer</button>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><LogOut size={14} /> Follow-up</button>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Printer size={14} /> Certificate</button>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><MessageSquare size={14} /> Chat</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.textLight, fontSize: 13 }}>
              Select a patient from the list to begin consultation
            </div>
          )}
        </div>
      </div>

      {/* Prescription Dialog */}
      {showRx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 500, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>New Prescription</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <input placeholder="Drug name" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="Dose" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
                <select style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
                  <option>PO</option><option>IV</option><option>IM</option><option>SC</option><option>Topical</option><option>Inhalation</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="Frequency" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
                <input placeholder="Duration" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
              </div>
              <textarea placeholder="Special instructions..." style={{ width: '100%', minHeight: 60, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRx(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowRx(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Sign & Send to Pharmacy</button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Dialog */}
      {showRefer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 500, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Refer Patient</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <select style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
                <option>Cardiology</option><option>Neurology</option><option>Nephrology</option><option>Endocrinology</option>
                <option>Gastroenterology</option><option>Respiratory</option><option>Orthopedics</option><option>OB/GYN</option>
              </select>
              <select style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
                <option>Routine (≤7 days)</option><option>Urgent (≤48h)</option><option>Emergency (≤4h)</option>
              </select>
              <textarea placeholder="Reason for referral..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRefer(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowRefer(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Send Referral</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
