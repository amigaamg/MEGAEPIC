'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { ArrowRight, Search, Plus, Check, Building, User, ChevronRight, Clock, AlertTriangle, Send, Loader } from 'lucide-react'

const departments = ['Cardiology', 'General Surgery', 'Internal Medicine', 'Paediatrics', 'OB/GYN', 'Orthopaedics', 'ENT', 'Ophthalmology', 'Dermatology', 'Neurology', 'Psychiatry', 'Urology', 'Nephrology', 'Pulmonology', 'Endocrinology', 'Oncology', 'Radiology', 'ICU', 'Emergency']

const consultants: Record<string, string[]> = {
  Cardiology: ['Dr. Kamau', 'Dr. Ochieng', 'Dr. Mwangi'],
  'General Surgery': ['Dr. Kamau', 'Dr. Mwangi'],
  'Internal Medicine': ['Dr. Ochieng', 'Dr. Kamau'],
  Paediatrics: ['Dr. Nyambura', 'Dr. Kiprop'],
  'OB/GYN': ['Dr. Chebet', 'Dr. Wanjiku'],
  Neurology: ['Dr. Kimani', 'Dr. Odhiambo'],
  ICU: ['Dr. Kiprop', 'Dr. Ochieng'],
}

const REVIEW_TIMERS: Record<string, number> = {
  Routine: 24 * 60, Urgent: 4 * 60, Emergency: 60,
}

export default function ReferralPage() {
  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [patientSearch, setPatientSearch] = useState('')
  const [toDept, setToDept] = useState('')
  const [toConsultant, setToConsultant] = useState('')
  const [urgency, setUrgency] = useState('routine')
  const [reason, setReason] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSend = () => {
    setShowConfirm(false)
    setStep('sent')
  }

  if (step === 'sent') {
    const timerMin = REVIEW_TIMERS[urgency.charAt(0).toUpperCase() + urgency.slice(1)] || 24 * 60
    return (
      <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 40, maxWidth: 460, width: '90%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Send size={28} color={C.green} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Referral Sent</div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 16 }}>
            To: {toDept} ({toConsultant || 'Unassigned'}) · {urgency}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: '#F0F9FF', border: '1px solid #BAE6FD', marginBottom: 16 }}>
            <Clock size={16} color={C.sky} />
            <span style={{ fontSize: 12, color: '#0369A1' }}>Consultant notified. Expected response within <strong>{timerMin} min</strong>.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16, textAlign: 'left', fontSize: 11, color: C.textLight }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: '#F0FDF4' }}>
              <Check size={12} color={C.green} /> Referral added to {toDept} queue
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: '#F0FDF4' }}>
              <Check size={12} color={C.green} /> Consultant notified via dashboard + SMS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: '#F0FDF4' }}>
              <Check size={12} color={C.green} /> Response timer started ({timerMin} min)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: '#F0FDF4' }}>
              <Check size={12} color={C.green} /> Patient added to recipient's pending list
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => setStep('form')} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>New Referral</button>
            <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Referral Status</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <ArrowRight size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>New Referral</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowConfirm(true)} disabled={!toDept || !reason} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: !toDept || !reason ? C.panel : C.sky, color: !toDept || !reason ? C.textLight : C.white, fontSize: 12, fontWeight: 600, cursor: !toDept || !reason ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Send size={14} /> Send Referral
        </button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 4 }}>Referring Doctor</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Dr. James Kamau</div>
              <div style={{ fontSize: 11, color: C.textLight }}>General Surgery · AMEXAN Demo Facility</div>
              <div style={{ fontSize: 11, color: C.textLight }}>KMPDC 5678</div>
            </div>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 4 }}>Patient</div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: C.textLight }} />
                <input style={{ width: '100%', height: 36, padding: '0 10px 0 30px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13, outline: 'none' }} placeholder="Search patient..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 4 }}>John Mwangi · 58 M · IP-2026-07842</div>
              <div style={{ fontSize: 11, color: C.textLight }}>CAP, Day 3 · Ward 5 · Bed 3A-01</div>
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Receiving Department</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {departments.map(d => (
                <button key={d} onClick={() => { setToDept(d); setToConsultant('') }} style={{ padding: '6px 12px', borderRadius: 6, border: toDept === d ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: toDept === d ? C.skyLight : C.white, color: toDept === d ? C.sky : C.text, fontSize: 11, cursor: 'pointer', fontWeight: toDept === d ? 600 : 400 }}>{d}</button>
              ))}
            </div>
            {toDept && consultants[toDept] && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, marginBottom: 4 }}>Specific Consultant (optional)</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setToConsultant('')} style={{ padding: '5px 10px', borderRadius: 6, border: toConsultant === '' ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: toConsultant === '' ? C.skyLight : C.white, fontSize: 10, cursor: 'pointer', fontWeight: toConsultant === '' ? 600 : 400 }}>Any</button>
                  {consultants[toDept].map(c => (
                    <button key={c} onClick={() => setToConsultant(c)} style={{ padding: '5px 10px', borderRadius: 6, border: toConsultant === c ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: toConsultant === c ? C.skyLight : C.white, fontSize: 10, cursor: 'pointer', fontWeight: toConsultant === c ? 600 : 400 }}>{c}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Urgency & Expected Response Time</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {[
                { key: 'routine', label: 'Routine', desc: '≤24h', color: C.green },
                { key: 'urgent', label: 'Urgent', desc: '≤4h', color: C.amber },
                { key: 'emergency', label: 'Emergency', desc: '≤1h', color: C.red },
              ].map(u => (
                <button key={u.key} onClick={() => setUrgency(u.key)} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: urgency === u.key ? `2px solid ${u.color}` : `1px solid ${C.border}`, background: urgency === u.key ? `${u.color}15` : C.white, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: urgency === u.key ? u.color : C.text }}>{u.label}</div>
                  <div style={{ fontSize: 10, color: urgency === u.key ? u.color : C.textLight }}>{u.desc} response</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 4 }}>Reason for Referral</div>
            <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 120, fontFamily: 'inherit' }} value={reason} onChange={e => setReason(e.target.value)} placeholder="Clinical history, findings, investigations done, and reason for referral..." />
          </div>
        </div>
      </div>

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 440, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Confirm Referral</div>
            <div style={{ fontSize: 12, color: C.textLight, marginBottom: 16 }}>
              Refer {patientSearch || 'John Mwangi'} to <strong>{toDept}</strong>{toConsultant ? ` (${toConsultant})` : ''} with <strong>{urgency}</strong> priority.
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: 11, color: '#0369A1', marginBottom: 16, lineHeight: 1.5 }}>
              Referral will be added to the {toDept} queue.<br />
              {toConsultant || 'The department'} will be notified via dashboard alert and SMS.<br />
              A response timer ({REVIEW_TIMERS[urgency.charAt(0).toUpperCase() + urgency.slice(1)]} min) will start immediately.<br />
              If no response within that time, escalation will be triggered.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSend} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Confirm & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
