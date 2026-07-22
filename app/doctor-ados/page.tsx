'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import { ADOSProvider, useADOS } from '@/components/ados/ADOSContext'
import { ADOSWorkspace } from '@/components/ados/ADOSWorkspace'
import { ADOSHandover } from '@/components/ados/ADOSHandover'
import {
  Stethoscope, Brain, Clock, AlertTriangle, CheckCircle,
  ChevronRight, User, Activity, Heart, FileText, MessageSquare,
  LogOut, ClipboardList, Bell, Search, Sun, Moon, Footprints,
  Calendar, Monitor, Scissors, Video, Users, Settings,
  LayoutDashboard, ArrowRight, Plus, AlertCircle,
} from 'lucide-react'
import type { ADOSPatient, ADOSVitals, ADOSPatientTask, ADOSQueueItem, ADOSTask, ADOSAlert, ADOSNotification, ADOSShiftType, ADOSAssignmentType, ADOSLocation } from '@/lib/ados/types'

// ── Sample Patient Data ────────────────────────────────────────────────────────

const SAMPLE_PATIENTS: ADOSPatient[] = [
  { id: 'pat_001', name: 'John Mwangi', age: 58, sex: 'M', bed: '3A-01', diagnosis: 'Community-acquired pneumonia', hospitalDay: 3, priority: 'medium', status: 'in_progress', vitals: { bp: '130/85', hr: 88, rr: 18, spo2: 96, temp: 37.1 }, alerts: [], tasks: [{ id: 't1', label: 'Review CXR', done: false }, { id: 't2', label: 'Check CBC', done: true }, { id: 't3', label: 'Plan discharge', done: false }], presentation: '58yo M, Day 3 of admission for CAP. Improved clinically. Afebrile 48h. O2 sat 96% RA. WBC normalizing.' },
  { id: 'pat_002', name: 'Grace Kamau', age: 42, sex: 'F', bed: '3A-02', diagnosis: 'Diabetic ketoacidosis', hospitalDay: 1, priority: 'high', status: 'in_progress', vitals: { bp: '100/60', hr: 112, rr: 26, spo2: 98, temp: 36.8 }, alerts: ['pH 7.1', 'K+ 3.1', 'Glucose 28 mmol/L'], tasks: [{ id: 't4', label: 'Review ABG', done: false }, { id: 't5', label: 'Adjust insulin', done: false }, { id: 't6', label: 'Check electrolytes', done: true }], presentation: '42yo F, known T1DM, presented with DKA. pH 7.1, HCO3 8, glucose 28. On insulin infusion. K+ 3.1 requires repletion.' },
  { id: 'pat_003', name: 'Peter Ochieng', age: 72, sex: 'M', bed: '3A-03', diagnosis: 'Acute heart failure', hospitalDay: 5, priority: 'critical', status: 'in_progress', vitals: { bp: '90/55', hr: 105, rr: 28, spo2: 89, temp: 37.0 }, alerts: ['O2 sat 89% on 4L', 'Chest pain', 'Oliguric'], tasks: [{ id: 't7', label: 'Echo today', done: false }, { id: 't8', label: 'Review CXR', done: false }, { id: 't9', label: 'Adjust diuretics', done: false }], presentation: '72yo M, known HFrEF (EF 30%). Day 5. Worsening SOB, O2 sat 89% on 4L NC. Hypotensive. Oliguric. Needs urgent echo and nephrology review.' },
  { id: 'pat_004', name: 'Ann Wanjiku', age: 35, sex: 'F', bed: '3A-04', diagnosis: 'Severe malaria', hospitalDay: 2, priority: 'medium', status: 'in_progress', vitals: { bp: '110/70', hr: 95, rr: 20, spo2: 97, temp: 38.5 }, alerts: ['Fever day 2'], tasks: [{ id: 't10', label: 'Check parasite count', done: false }, { id: 't11', label: 'Review Hb', done: true }, { id: 't12', label: 'Assess for discharge', done: false }], presentation: '35yo F, severe malaria (P. falciparum). On IV artesunate. Parasite count 2% on admission. Hb 9.5. Improving.' },
  { id: 'pat_005', name: 'David Kiprop', age: 65, sex: 'M', bed: '3A-05', diagnosis: 'Stroke (CVA)', hospitalDay: 7, priority: 'low', status: 'discharge_ready', vitals: { bp: '135/85', hr: 78, rr: 16, spo2: 98, temp: 36.6 }, alerts: [], tasks: [{ id: 't13', label: 'Finalize discharge summary', done: false }, { id: 't14', label: 'PT/OT assessment', done: true }, { id: 't15', label: 'Arrange follow-up', done: false }], presentation: '65yo M, ischemic stroke Day 7. NIHSS 4 (improved from 12). Mild left-sided weakness. Swallowing OK. Ready for rehab placement.' },
  { id: 'pat_006', name: 'Sarah Nyambura', age: 28, sex: 'F', bed: '3A-06', diagnosis: 'Severe preeclampsia', hospitalDay: 4, priority: 'critical', status: 'in_progress', vitals: { bp: '160/110', hr: 100, rr: 22, spo2: 97, temp: 37.2 }, alerts: ['BP uncontrolled', 'Proteinuria 3+', 'Headache'], tasks: [{ id: 't16', label: 'Review BP chart', done: false }, { id: 't17', label: 'Check LFTs', done: true }, { id: 't18', label: 'Plan delivery', done: false }], presentation: '28yo F, primigravida 34w, severe preeclampsia. BP 160/110 despite labetalol. Proteinuria 3+. Headache. Needs delivery planning.' },
  { id: 'pat_007', name: 'Samuel Kioko', age: 45, sex: 'M', bed: '3A-07', diagnosis: 'Cirrhosis with ascites', hospitalDay: 10, priority: 'medium', status: 'in_progress', vitals: { bp: '110/70', hr: 82, rr: 18, spo2: 96, temp: 36.9 }, alerts: ['Ascites', 'Mild encephalopathy'], tasks: [{ id: 't19', label: 'Paracentesis', done: false }, { id: 't20', label: 'Check LFTs/INR', done: true }, { id: 't21', label: 'Sodium restriction', done: false }], presentation: '45yo M, decompensated cirrhosis (EtOH). Tense ascites, mild HE. MELD 18. Awaiting paracentesis.' },
  { id: 'pat_008', name: 'Hannah Chebet', age: 52, sex: 'F', bed: '3A-08', diagnosis: 'Cellulitis (R leg)', hospitalDay: 2, priority: 'low', status: 'in_progress', vitals: { bp: '125/80', hr: 90, rr: 18, spo2: 99, temp: 38.0 }, alerts: [], tasks: [{ id: 't22', label: 'Mark erythema border', done: false }, { id: 't23', label: 'Check WBC/CRP', done: true }, { id: 't24', label: 'IV antibiotics', done: true }], presentation: '52yo F, right leg cellulitis. Erythema from ankle to mid-calf. On IV cloxacillin. Afebrile today.' },
]

function DoctorADOSInner() {
  const router = useRouter()
  const { lifecycle, context, setContext } = useADOS()
  const [showLanding, setShowLanding] = useState(true)
  const [selectedDept, setSelectedDept] = useState<string>('ward')
  const [doctorName, setDoctorName] = useState('Dr. James Mwangi')

  const handleStartShift = useCallback((assignmentType: ADOSAssignmentType) => {
    setShowLanding(false)
    setContext({
      doctorId: 'dr_001',
      doctorName,
      doctorTitle: 'Consultant Physician',
      specialty: 'Internal Medicine',
      organizationId: 'org_ktrh',
      organizationName: 'Kisii Teaching & Referral Hospital',
      departmentId: 'dept_med',
      departmentName: 'Internal Medicine',
      shift: selectedDept === 'emergency' ? 'afternoon' : 'morning',
      assignmentType,
      location: {
        departmentId: 'dept_med',
        departmentName: assignmentType === 'emergency' ? 'Emergency Department' : assignmentType === 'icu' ? 'Intensive Care Unit' : 'Internal Medicine',
        ward: assignmentType === 'ward_round' ? 'Ward 3A' : undefined,
        clinic: assignmentType === 'clinic' ? 'General Medical Clinic' : undefined,
      },
      patients: SAMPLE_PATIENTS,
      tasks: SAMPLE_PATIENTS.flatMap(p => p.tasks.map(t => ({
        id: t.id,
        type: 'review' as const,
        title: t.label,
        patientId: p.id,
        patientName: p.name,
        status: t.done ? ('completed' as const) : ('pending' as const),
        priority: p.priority === 'critical' ? ('critical' as const) : p.priority === 'high' ? ('urgent' as const) : ('routine' as const),
        createdAt: Date.now(),
        dependsOn: [],
        escalationLevel: p.priority === 'critical' ? 2 : 0,
      }))),
      alerts: SAMPLE_PATIENTS.filter(p => p.alerts.length > 0).flatMap(p => p.alerts.map((a, i) => ({
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
        actionLink: `/doctor/patient?id=${p.id}`,
      }))),
      notifications: [],
    })
  }, [selectedDept, doctorName, setContext])

  if (showLanding) {
    return (
      <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{ height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 16, fontWeight: 700 }}>✦</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>AMEXAN</span>
          <span style={{ width: 1, height: 24, background: C.border }} />
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600, letterSpacing: '0.04em' }}>
            ADOS — DOCTOR OPERATING SYSTEM
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: C.textLight }}>{doctorName}</div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 13, fontWeight: 700 }}>
            JM
          </div>
        </header>

        {/* Hero Section */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ maxWidth: 800, width: '100%' }}>
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', border: '2px solid rgba(47,128,237,0.15)' }}>
                <Stethoscope size={36} color={C.sky} />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>
                AMEXAN Doctor Operating System
              </h1>
              <p style={{ fontSize: 14, color: C.textLight, margin: 0, maxWidth: 500, marginInline: 'auto' }}>
                The Doctor Never Searches For Work. Work Finds The Doctor.
              </p>
            </div>

            {/* Department Selection */}
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12, textAlign: 'center' }}>
                Select Your Context
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { id: 'ward', label: 'Ward Round', icon: Footprints, desc: 'Ward 3A — 8 patients', color: C.sky },
                  { id: 'clinic', label: 'Clinic', icon: Calendar, desc: 'General Medical Clinic', color: '#8B5CF6' },
                  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, desc: 'Resus + Critical Care', color: '#EF4444' },
                  { id: 'icu', label: 'ICU', icon: Monitor, desc: 'Intensive Care Unit', color: '#F59E0B' },
                  { id: 'theatre', label: 'Theatre', icon: Scissors, desc: 'Today\'s Operating List', color: '#10B981' },
                  { id: 'telemedicine', label: 'Telemedicine', icon: Video, desc: 'Video Consultations', color: '#14B8A6' },
                  { id: 'private', label: 'Private Practice', icon: Stethoscope, desc: 'Consulting Rooms', color: '#6366F1' },
                  { id: 'admin', label: 'Admin', icon: Settings, desc: 'Reports & Approvals', color: '#64748B' },
                ].map(dept => {
                  const Icon = dept.icon
                  const active = selectedDept === dept.id
                  return (
                    <button key={dept.id} onClick={() => setSelectedDept(dept.id)}
                      style={{
                        padding: '16px', borderRadius: 12,
                        background: active ? `${dept.color}08` : C.white,
                        border: active ? `2px solid ${dept.color}` : `1px solid ${C.border}`,
                        cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.15s',
                      }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${dept.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <Icon size={18} color={dept.color} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 2 }}>{dept.label}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{dept.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ADOS 6 Questions Preview */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Brain size={18} color={C.sky} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>ADOS Continuously Answers 6 Questions</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { q: '📍 Where am I?', a: 'Department, ward, clinic — automatically detected' },
                  { q: '👥 Which patients?', a: 'Your entire panel, filterable by priority' },
                  { q: '⚡ Who needs me first?', a: 'Critical queue, prioritized by severity' },
                  { q: '📋 What decisions wait?', a: 'Pending reviews, discharges, results' },
                  { q: '➡️ What happens next?', a: 'Next actions, pre-generated for each patient' },
                  { q: '✅ Safe handover?', a: 'End-of-shift checklist with zero gaps' },
                ].map(item => (
                  <div key={item.q} style={{ padding: 12, borderRadius: 8, background: C.panel }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 4 }}>{item.q}</span>
                    <span style={{ fontSize: 11, color: C.textLight }}>{item.a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button onClick={() => handleStartShift(selectedDept === 'icu' ? 'icu' : selectedDept === 'clinic' ? 'clinic' : selectedDept === 'emergency' ? 'emergency' : selectedDept === 'theatre' ? 'theatre' : selectedDept === 'telemedicine' ? 'telemedicine' : selectedDept === 'private' ? 'private_practice' : selectedDept === 'admin' ? 'admin' : 'ward_round')}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #2F80ED, #1A5BBF)',
                color: 'white', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 20px rgba(47,128,237,0.3)',
              }}>
              Start Your Shift <ArrowRight size={18} />
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: C.textLight, marginTop: 16 }}>
              Kisii Teaching & Referral Hospital · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (lifecycle.phase === 'handover' || lifecycle.phase === 'completed') {
    return <ADOSHandover />
  }

  return <ADOSWorkspace />
}

export default function DoctorADOSPage() {
  return (
    <ADOSProvider>
      <DoctorADOSInner />
    </ADOSProvider>
  )
}
