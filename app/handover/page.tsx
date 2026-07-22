'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import { ADOSProvider, useADOS } from '@/components/ados/ADOSContext'
import { ADOSHandover } from '@/components/ados/ADOSHandover'
import {
  MessageSquare, Clock, AlertTriangle, CheckCircle, User,
  Sun, ArrowRight, FileText, Users, Brain, Activity,
} from 'lucide-react'
import type { ADOSPatient, ADOSVitals, ADOSPatientTask, ADOSShiftType, ADOSAssignmentType, ADOSLocation } from '@/lib/ados/types'

const DEMO_PATIENTS: ADOSPatient[] = [
  { id: 'ho_001', name: 'John Mwangi', age: 58, sex: 'M', bed: '3A-01', diagnosis: 'Community-acquired pneumonia', hospitalDay: 3, priority: 'medium', status: 'in_progress', vitals: { bp: '130/85', hr: 88, rr: 18, spo2: 96, temp: 37.1 }, alerts: [], tasks: [], presentation: 'Improving. Plan discharge tomorrow.' },
  { id: 'ho_002', name: 'Grace Kamau', age: 42, sex: 'F', bed: '3A-02', diagnosis: 'Diabetic ketoacidosis', hospitalDay: 1, priority: 'high', status: 'in_progress', vitals: { bp: '100/60', hr: 112, rr: 26, spo2: 98, temp: 36.8 }, alerts: ['pH 7.1', 'K+ 3.1'], tasks: [], presentation: 'On insulin infusion. Needs ABG at 22:00.' },
  { id: 'ho_003', name: 'Peter Ochieng', age: 72, sex: 'M', bed: '3A-03', diagnosis: 'Acute heart failure', hospitalDay: 5, priority: 'critical', status: 'in_progress', vitals: { bp: '90/55', hr: 105, rr: 28, spo2: 89, temp: 37.0 }, alerts: ['O2 sat 89%', 'Oliguric'], tasks: [], presentation: 'Critical. Needs echo and nephrology review overnight.' },
  { id: 'ho_004', name: 'Ann Wanjiku', age: 35, sex: 'F', bed: '3A-04', diagnosis: 'Severe malaria', hospitalDay: 2, priority: 'medium', status: 'in_progress', vitals: { bp: '110/70', hr: 95, rr: 20, spo2: 97, temp: 38.5 }, alerts: ['Fever day 2'], tasks: [], presentation: 'On IV artesunate. Parasite count improving.' },
  { id: 'ho_005', name: 'David Kiprop', age: 65, sex: 'M', bed: '3A-05', diagnosis: 'Stroke (CVA)', hospitalDay: 7, priority: 'low', status: 'discharge_ready', vitals: { bp: '135/85', hr: 78, rr: 16, spo2: 98, temp: 36.6 }, alerts: [], tasks: [], presentation: 'Ready for rehab placement.' },
  { id: 'ho_006', name: 'Sarah Nyambura', age: 28, sex: 'F', bed: '3A-06', diagnosis: 'Severe preeclampsia', hospitalDay: 4, priority: 'critical', status: 'in_progress', vitals: { bp: '160/110', hr: 100, rr: 22, spo2: 97, temp: 37.2 }, alerts: ['BP uncontrolled', 'Proteinuria 3+'], tasks: [], presentation: 'Needs delivery planning. BP labile.' },
]

function HandoverInnerPage() {
  const router = useRouter()
  const { setContext, lifecycle } = useADOS()
  const [started, setStarted] = useState(false)

  const handleStartHandover = () => {
    setContext({
      doctorId: 'dr_001',
      doctorName: 'Dr. James Mwangi',
      doctorTitle: 'Consultant Physician',
      specialty: 'Internal Medicine',
      organizationId: 'org_ktrh',
      organizationName: 'Kisii Teaching & Referral Hospital',
      departmentId: 'dept_med',
      departmentName: 'Internal Medicine',
      shift: 'morning',
      assignmentType: 'ward_round',
      location: { departmentId: 'dept_med', departmentName: 'Internal Medicine', ward: 'Ward 3A' },
      patients: DEMO_PATIENTS,
      tasks: DEMO_PATIENTS.flatMap(p => p.alerts.map((a, i) => ({
        id: `task_${p.id}_${i}`,
        type: 'review' as const,
        title: a,
        patientId: p.id,
        patientName: p.name,
        status: 'pending' as const,
        priority: p.priority === 'critical' ? 'critical' as const : 'urgent' as const,
        createdAt: Date.now(),
        dependsOn: [],
        escalationLevel: p.priority === 'critical' ? 2 : 1,
      }))),
      alerts: DEMO_PATIENTS.filter(p => p.alerts.length > 0).flatMap(p => p.alerts.map((a, i) => ({
        id: `alert_${p.id}_${i}`,
        type: p.priority === 'critical' ? 'critical' as const : 'warning' as const,
        title: a,
        message: `${p.name} — ${a}`,
        patientId: p.id,
        patientName: p.name,
        timestamp: Date.now(),
        acknowledged: false,
        actionable: true,
        actionLabel: 'Review',
        actionLink: '#',
      }))),
      notifications: [],
    })
    setStarted(true)
  }

  if (started) {
    return <ADOSHandover />
  }

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, flexShrink: 0 }}>
        <MessageSquare size={18} color={C.sky} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>HANDOVER</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight, fontFamily: "'Inter', sans-serif" }}>← Dashboard</button>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ maxWidth: 560, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>
              <MessageSquare size={32} color={C.sky} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>Clinical Handover</h1>
            <p style={{ fontSize: 13, color: C.textLight, margin: 0 }}>
              No encounter simply ends. It creates continuity.
            </p>
          </div>

          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Sun size={20} color="#F59E0B" />
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, display: 'block' }}>Morning Shift</span>
                <span style={{ fontSize: 12, color: C.textLight }}>07:00 - 15:00 · Dr. James Mwangi · Ward 3A</span>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: C.panel, marginBottom: 4, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #10B981, #F59E0B, #EF4444)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Patients', value: DEMO_PATIENTS.length, color: C.sky },
              { label: 'Critical', value: DEMO_PATIENTS.filter(p => p.priority === 'critical').length, color: '#EF4444' },
              { label: 'Pending Tasks', value: DEMO_PATIENTS.flatMap(p => p.alerts).length, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: s.color, display: 'block' }}>{s.value}</span>
                <span style={{ fontSize: 10, color: C.textLight }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 12, display: 'block' }}>Patients Requiring Handover</span>
            {DEMO_PATIENTS.filter(p => p.priority === 'critical' || p.priority === 'high').map(p => (
              <div key={p.id} style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                background: p.priority === 'critical' ? 'rgba(239,68,68,0.05)' : C.panel,
                border: p.priority === 'critical' ? '1px solid rgba(239,68,68,0.15)' : 'none',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.priority === 'critical' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: C.navy }}>{p.name}</span>
                  <span style={{ color: C.textLight }}> — {p.diagnosis}</span>
                </div>
                <span style={{ fontSize: 10, color: C.textLight }}>Bed {p.bed}</span>
              </div>
            ))}
            {DEMO_PATIENTS.filter(p => p.priority === 'critical' || p.priority === 'high').length === 0 && (
              <p style={{ fontSize: 12, color: '#10B981', margin: 0 }}>✓ No critical handover required</p>
            )}
          </div>

          <button onClick={handleStartHandover}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: '#10B981', color: 'white', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
            }}>
            Start Handover Process <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HandoverPage() {
  return (
    <ADOSProvider>
      <HandoverInnerPage />
    </ADOSProvider>
  )
}
