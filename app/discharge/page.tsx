'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { LogOut, Search, Printer, Check, AlertTriangle, FileText, Calendar, XCircle, Clock, Pill, Activity, Users, Phone, CreditCard, MessageSquare, ChevronRight, Download, CheckCircle } from 'lucide-react'

interface PendingItem {
  category: string; item: string; status: 'pending' | 'done' | 'not_applicable'
}

interface AutoAction {
  label: string; description: string; icon: any; done: boolean; autoCreate: boolean
}

export default function DischargePage() {
  const [patientSearch, setPatientSearch] = useState('')
  const [diagnosis, setDiagnosis] = useState('Community-acquired pneumonia (resolved)')
  const [summary, setSummary] = useState('58yo M admitted 9 Jul 2026 with CAP. Treated with Amoxicillin-Clavulanate 7 days. Clinically improved. Afebrile 48h. WBC normalizing. CXR improving.')
  const [medications, setMedications] = useState('Amoxicillin-Clavulanate 625mg PO TDS × 5 days\nParacetamol 1g PO PRN\nAmoxicillin 500mg PO TDS')
  const [followUp, setFollowUp] = useState('General Surgery clinic — 2 weeks\nRepeat CXR — 6 weeks')
  const [showConfirm, setShowConfirm] = useState(false)
  const [dischargeComplete, setDischargeComplete] = useState(false)

  const pendingChecks: PendingItem[] = [
    { category: 'Laboratory', item: 'Blood culture (final)', status: 'pending' },
    { category: 'Laboratory', item: 'Hb, WBC today', status: 'done' },
    { category: 'Imaging', item: 'CXR (pre-discharge)', status: 'done' },
    { category: 'Pharmacy', item: 'Medication reconciliation', status: 'done' },
    { category: 'Physiotherapy', item: 'Mobility assessment', status: 'not_applicable' },
    { category: 'Insurance', item: 'Authorization for discharge', status: 'pending' },
    { category: 'Nursing', item: 'Discharge education', status: 'pending' },
    { category: 'Billing', item: 'Clear outstanding bills', status: 'pending' },
  ]

  const autoActions: AutoAction[] = [
    { label: 'Discharge Summary', description: 'Auto-generated from admission notes and progress', icon: FileText, done: true, autoCreate: true },
    { label: 'E-Prescription', description: 'Discharge medications sent to pharmacy', icon: Pill, done: false, autoCreate: true },
    { label: 'Follow-up Appointment', description: 'Booked in clinic system', icon: Calendar, done: false, autoCreate: true },
    { label: 'Patient Instructions', description: 'Education material and aftercare instructions', icon: MessageSquare, done: false, autoCreate: true },
    { label: 'Referral Letter', description: 'If ongoing specialist care needed', icon: Users, done: false, autoCreate: false },
    { label: 'Medical Certificate', description: 'Sick leave and work clearance', icon: FileText, done: false, autoCreate: true },
    { label: 'Billing Clearance', description: 'Insurance claim and payment', icon: CreditCard, done: false, autoCreate: true },
    { label: 'SMS Notification', description: 'Discharge info to patient mobile', icon: Phone, done: false, autoCreate: true },
  ]

  const handleCompleteDischarge = () => {
    setShowConfirm(false)
    setDischargeComplete(true)
  }

  if (dischargeComplete) {
    return (
      <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 40, maxWidth: 480, width: '90%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={32} color={C.green} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Discharge Complete</div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 20, lineHeight: 1.5 }}>
            John Mwangi has been discharged.<br />
            Discharge summary, prescription, follow-up, certificate, and SMS have been generated automatically.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, textAlign: 'left' }}>
            {autoActions.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: a.done || (a.autoCreate && true) ? '#F0FDF4' : '#FFFBEB' }}>
                {a.done || a.autoCreate ? <CheckCircle size={14} color={C.green} /> : <Clock size={14} color={C.amber} />}
                <span style={{ fontSize: 11, color: a.done || a.autoCreate ? '#166534' : '#92400E' }}>{a.label} — {a.autoCreate ? 'Auto-generated' : 'Pending'}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => window.print()} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Printer size={14} /> Print Summary</button>
            <button onClick={() => setDischargeComplete(false)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>New Discharge</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <LogOut size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Discharge Workspace</span>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#F0FDF4', color: C.green, fontWeight: 600 }}>AUTO-CHECK ACTIVE</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowConfirm(true)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} /> Complete Discharge
        </button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left Column */}
          <div>
            {/* Patient & Doctor */}
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 4 }}>Patient</div>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: C.textLight }} />
                    <input style={{ width: '100%', height: 36, padding: '0 10px 0 30px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13, outline: 'none' }} placeholder="Search patient..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 4 }}>John Mwangi · 58 M · IP-2026-07842</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 4 }}>Discharging Doctor</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Dr. James Kamau</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>KMPDC 5678 · General Surgery</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Date: 12 Jul 2026</div>
                </div>
              </div>
            </div>

            {/* Auto-Check — Outstanding Items */}
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <AlertTriangle size={16} color={C.amber} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Pre-Discharge Checks</span>
                <span style={{ fontSize: 10, color: C.textLight, marginLeft: 'auto' }}>{pendingChecks.filter(c => c.status === 'done').length}/{pendingChecks.length} complete</span>
              </div>
              {pendingChecks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, background: c.status === 'done' ? '#F0FDF4' : c.status === 'not_applicable' ? '#F1F5F9' : '#FFFBEB', marginBottom: 3, fontSize: 11 }}>
                  {c.status === 'done' ? <CheckCircle size={12} color={C.green} /> : c.status === 'not_applicable' ? <XCircle size={12} color={C.textLight} /> : <Clock size={12} color={C.amber} />}
                  <span style={{ fontWeight: 500, color: c.status === 'done' ? '#166534' : c.status === 'not_applicable' ? C.textLight : '#92400E', minWidth: 80 }}>{c.category}</span>
                  <span style={{ color: c.status === 'done' ? '#166534' : c.status === 'not_applicable' ? C.textLight : '#92400E' }}>{c.item}</span>
                  <span style={{ marginLeft: 'auto', padding: '1px 6px', borderRadius: 3, fontSize: 8, fontWeight: 600, textTransform: 'capitalize', color: c.status === 'done' ? C.green : c.status === 'not_applicable' ? C.textLight : C.amber, background: c.status === 'done' ? '#F0FDF4' : c.status === 'not_applicable' ? '#F1F5F9' : '#FFFBEB' }}>{c.status === 'not_applicable' ? 'N/A' : c.status}</span>
                </div>
              ))}
            </div>

            {/* Auto-Creation Actions */}
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Auto-Creation Engine</div>
              {autoActions.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: a.autoCreate ? '#F0F9FF' : '#FFFBEB', marginBottom: 3, fontSize: 11 }}>
                  <a.icon size={14} color={a.autoCreate ? C.sky : C.amber} />
                  <span style={{ fontWeight: 500, color: C.text }}>{a.label}</span>
                  <span style={{ fontSize: 10, color: C.textLight }}>{a.description}</span>
                  <span style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: 3, fontSize: 8, fontWeight: 600, background: a.autoCreate ? '#F0FDF4' : '#FFFBEB', color: a.autoCreate ? C.green : C.amber }}>{a.autoCreate ? '✓ Auto' : 'Manual'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Discharge Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 3 }}>Diagnosis at Discharge</div>
                  <input style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13, outline: 'none' }} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 3 }}>Admission Summary</div>
                  <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }} value={summary} onChange={e => setSummary(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 3 }}>Discharge Medications</div>
                  <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit' }} value={medications} onChange={e => setMedications(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', marginBottom: 3 }}>Follow-up & Referrals</div>
                  <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit' }} value={followUp} onChange={e => setFollowUp(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: 11, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={14} />
              <span>Complete discharge will auto-generate: Summary, Prescription, Follow-up, Certificate, SMS, and Portal update. Pending checks will be flagged.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 480, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Finalize Discharge</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Pre-discharge check results:</div>
              {pendingChecks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 11 }}>
                  {c.status === 'done' ? <CheckCircle size={12} color={C.green} /> : c.status === 'not_applicable' ? <XCircle size={12} color={C.textLight} /> : <AlertTriangle size={12} color={C.amber} />}
                  <span style={{ color: c.status === 'done' ? '#166534' : c.status === 'not_applicable' ? C.textLight : '#92400E' }}>{c.category}: {c.item}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 11, color: '#92400E', marginBottom: 16 }}>
              {pendingChecks.filter(c => c.status === 'pending').length} items still pending. Continue anyway?
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCompleteDischarge} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Complete Discharge & Auto-Generate All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
