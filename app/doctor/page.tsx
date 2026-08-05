'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { listRecentEncounters, saveEncounter, type SavedEncounter } from '@/lib/amexan/encounter/encounterPersistence'
import { createEncounterOrchestrator, answerInOrchestrator, setPatientBiodata, type EncounterOrchestratorState } from '@/lib/amexan/encounter-engine'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { getActiveOrganizationId } from '@/lib/firebase/orgContext'
import { Bell, MessageSquare, AlertTriangle, UserCircle, Search, LayoutDashboard, Users, Footprints, ClipboardPlus, FileText, Beaker, Pill, MessageCircle, BarChart3, Activity, Calendar, BookOpen, Settings, LogOut, AlertCircle, CheckCircle, Clock, Plus, ArrowRight, ArrowLeft, Bed, HeartPulse, Thermometer, User, ChevronRight, Menu, X, Flag, ListTodo, CalendarClock, Brain, Stethoscope, Video, Monitor, Scissors } from 'lucide-react'
import { C } from '@/lib/colors';

const S = {
  page: { minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' as const },
  topBar: { height: 72, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 20, flexShrink: 0 },
  searchInp: { flex: 1, maxWidth: 480, padding: '9px 16px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.panel, outline: 'none' } as any,
  iconBtn: { width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, position: 'relative' as const },
  badge: (c: string) => ({ position: 'absolute' as const, top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: c, color: C.white, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftNav: { width: 220, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' as const, padding: '16px 12px', gap: 2, flexShrink: 0, overflow: 'auto' },
  navItem: (a: boolean) => ({ padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: a ? 600 : 400, color: a ? C.sky : C.text, background: a ? C.skyLight : 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const, transition: 'all 0.1s' }),
  main: { flex: 1, overflow: 'auto', padding: 24 },
  greetCard: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 20 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 },
  statCard: (c: string) => ({ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', borderTop: `3px solid ${c}`, cursor: 'pointer', transition: 'all 0.15s' }),
  queueCard: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  patientRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: C.panel, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.1s', marginBottom: 6 },
  priorityDot: (p: string) => ({ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: p === 'high' ? C.red : p === 'medium' ? C.amber : C.green }),
  taskItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 12, color: C.text, borderBottom: `1px solid ${C.panel}` },
  alertItem: (c: string) => ({ padding: '10px 14px', borderRadius: 8, background: `${c}10`, border: `1px solid ${c}30`, fontSize: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }),
  schItem: { display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${C.panel}`, alignItems: 'center' },
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ados', label: 'ADOS Mode', icon: Brain },
  { id: 'ward-round', label: 'Ward Round', icon: Footprints },
  { id: 'clinical', label: 'Clinical Workspace', icon: ClipboardPlus },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
  { id: 'icu', label: 'ICU', icon: HeartPulse },
  { id: 'theatre', label: 'Theatre', icon: Scissors },
  { id: 'clinic', label: 'Clinic', icon: Calendar },
  { id: 'telemedicine', label: 'Telemedicine', icon: Video },
  { id: 'private', label: 'Private Practice', icon: Stethoscope },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'admissions', label: 'Admissions', icon: FileText },
  { id: 'orders', label: 'Orders', icon: Beaker },
  { id: 'results', label: 'Results', icon: Pill },
  { id: 'medications', label: 'Medications', icon: MessageCircle },
  { id: 'pme', label: 'Patient Movement', icon: BarChart3 },
  { id: 'laboratory', label: 'Laboratory', icon: Activity },
  { id: 'pharmacy', label: 'Pharmacy', icon: Calendar },
  { id: 'radiology', label: 'Radiology', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [encounters, setEncounters] = useState<SavedEncounter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [navSel, setNavSel] = useState('dashboard')
  const [doctorName, setDoctorName] = useState('')
  const [doctorTitle, setDoctorTitle] = useState('')
  const [userLoaded, setUserLoaded] = useState(false)

  useEffect(() => {
    const orgId = getActiveOrganizationId()
    if (orgId) {
      listRecentEncounters(orgId, 50).then(e => { setEncounters(e); setLoading(false) }).catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          const d = snap.data()
          setDoctorName(d.name || user.email?.split('@')[0] || 'User')
          setDoctorTitle(d.role === 'doctor' ? 'Physician' : d.role === 'nurse' ? 'Nurse' : 'Clinician')
        } else {
          setDoctorName(user.email?.split('@')[0] || 'User')
          setDoctorTitle('Clinician')
        }
      } catch {
        const fallback = user.email?.split('@')[0] || 'User'
        setDoctorName(fallback)
        setDoctorTitle('Clinician')
      }
      setUserLoaded(true)
    })()
  }, [user])

  const handleLogout = useCallback(async () => {
    await logout()
    router.push('/login')
  }, [logout, router])

  const createDemo = useCallback(async () => {
    const id = `demo_${Date.now()}`
    let state = createEncounterOrchestrator()
    state = setPatientBiodata(state, { patientName: 'Kevin Mutua', age: 2, sex: 'male', hospitalNumber: 'KTRH-2026-0124', department: 'Pediatrics', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0], hospital: 'AMEXAN Demo Facility', encounterType: 'new', clinician: doctorName || 'Dr. John Methu' })
    state = answerInOrchestrator(state, 'q_cc_primary', 'Fever')
    state = answerInOrchestrator(state, 'q_cc_duration', '3 days')
    state = answerInOrchestrator(state, 'q_cc_onset', '3 days ago')
    state = answerInOrchestrator(state, 'q_fever_onset', 'Suddenly')
    state = answerInOrchestrator(state, 'q_fever_duration', '3 days')
    state = answerInOrchestrator(state, 'q_fever_pattern', 'Comes and goes')
    state = answerInOrchestrator(state, 'q_fever_severity', 'High (39-40°C)')
    state = answerInOrchestrator(state, 'q_fever_rigors', true)
    state = answerInOrchestrator(state, 'q_fever_headache', true)
    state = answerInOrchestrator(state, 'q_fever_vomiting', true)
    state = answerInOrchestrator(state, 'q_fever_cough', false)
    state = answerInOrchestrator(state, 'q_fever_diarrhea', false)
    state = answerInOrchestrator(state, 'q_fever_travel', true)
    state = answerInOrchestrator(state, 'q_exam_temp', '39.2')
    state = answerInOrchestrator(state, 'q_exam_pulse', '158')
    state = answerInOrchestrator(state, 'q_exam_bp_systolic', '90')
    state = answerInOrchestrator(state, 'q_exam_bp_diastolic', '60')
    state = answerInOrchestrator(state, 'q_exam_rr', '42')
    const id2 = `demo_${Date.now() + 1}`
    let state2 = createEncounterOrchestrator()
    state2 = setPatientBiodata(state2, { patientName: 'Amina Hassan', age: 45, sex: 'female', hospitalNumber: 'KTRH-2026-0089', department: 'Medical Ward', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0], hospital: 'AMEXAN Demo Facility', encounterType: 'new', clinician: doctorName || 'Dr. John Methu' })
    state2 = answerInOrchestrator(state2, 'q_cc_primary', 'Chest pain')
    state2 = answerInOrchestrator(state2, 'q_cc_duration', '2 days')
    state2 = answerInOrchestrator(state2, 'q_exam_bp_systolic', '160')
    state2 = answerInOrchestrator(state2, 'q_exam_bp_diastolic', '100')
    const orgId = getActiveOrganizationId()
    if (!orgId) return
    await saveEncounter(orgId, id, state)
    await saveEncounter(orgId, id2, state2)
    router.push(`/doctor/patient?encounter=${id}`)
  }, [router, doctorName])

  const active = encounters.filter(e => e.status === 'active')
  const completed = encounters.filter(e => e.status === 'completed')

  const filtered = encounters.filter(e => {
    if (searchQ && !e.patientName?.toLowerCase().includes(searchQ.toLowerCase()) && !e.hospitalNumber?.toLowerCase().includes(searchQ.toLowerCase())) return false
    return true
  })

  const today = new Date()
  const hours = today.getHours()
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening'
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const criticalCount = encounters.filter(e => {
    const st = (e as any).state as EncounterOrchestratorState | undefined
    const temp = st?.questionEngine?.answers?.['exam_temp']?.value || st?.questionEngine?.answers?.['q_exam_temp']?.value
    return temp && parseFloat(String(temp)) > 38.5
  }).length

  const pendingLabCount = encounters.filter(e => e.currentPhase === 'admission').length

  const sortedEncounters = [...encounters].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  })

  const recentActivity = sortedEncounters.slice(0, 6).map(e => {
    const ago = e.createdAt ? Math.floor((Date.now() - new Date(e.createdAt).getTime()) / 60000) : 0
    const timeStr = ago < 1 ? 'Just now' : ago < 60 ? `${ago}m ago` : `${Math.floor(ago / 60)}h ago`
    const st = (e as any).state as EncounterOrchestratorState | undefined
    const diag = st?.differentials?.[0]?.diseaseName || 'new encounter'
    return { time: timeStr, text: `${e.patientName} — ${diag}` }
  })

  const initials = doctorName ? doctorName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 14, fontWeight: 700 }}>✦</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</div>
          <div style={{ width: 1, height: 24, background: C.border }} />
          <div style={{ fontSize: 12, color: C.text }}>Clinical OS</div>
          <div style={{ fontSize: 11, color: C.textLight }}>Department</div>
          <div style={{ fontSize: 12, color: C.sky, fontWeight: 500, background: C.skyLight, padding: '3px 10px', borderRadius: 6 }}>{doctorTitle || 'Medical'}</div>
        </div>

        <input style={S.searchInp}
          placeholder="Search patients, MRN, beds, wards, drugs, investigations, diagnoses, procedures, staff, orders..."
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          onFocus={e => { e.currentTarget.style.borderColor = C.sky; e.currentTarget.style.background = C.white }}
          onBlur={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.panel }} />

        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <button style={S.iconBtn} title="Notifications">
            <Bell size={18} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, display: 'flex', gap: 1 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: criticalCount > 0 ? C.red : C.border }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: pendingLabCount > 0 ? C.amber : C.border }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.border, opacity: 0.35 }} />
            </div>
          </button>
          <button style={S.iconBtn} title="Messages">
            <MessageSquare size={18} /><span style={S.badge(C.amber)}>{Math.min(encounters.length, 9)}</span>
          </button>
          <button style={S.iconBtn} title="Emergency"><AlertTriangle size={18} /></button>
        </div>
        <button style={S.iconBtn} title="Settings" onClick={() => setNavSel('settings')}>
          <Settings size={18} />
        </button>
        <button style={S.iconBtn} title="Log Out" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          title={doctorName}>{initials}</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '8px 14px 12px', textTransform: 'uppercase' }}>Navigation</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id} style={S.navItem(navSel === item.id)}
              onClick={() => {
                setNavSel(item.id)
                if (item.id === 'ward-round') router.push('/doctor/ward-round')
                if (item.id === 'patients') router.push('/doctor')
                if (item.id === 'clinical') router.push('/doctor/workspace')
                if (item.id === 'ados') router.push('/doctor-ados')
                if (item.id === 'emergency') router.push('/doctor/emergency')
                if (item.id === 'icu') router.push('/doctor/icu')
                if (item.id === 'theatre') router.push('/doctor/theatre')
                if (item.id === 'clinic') router.push('/doctor/clinic')
                if (item.id === 'telemedicine') router.push('/doctor/telemedicine')
                if (item.id === 'private') router.push('/doctor/private-practice')
                if (item.id === 'pme') router.push('/pme')
                if (item.id === 'laboratory') router.push('/laboratory')
                if (item.id === 'pharmacy') router.push('/pharmacy')
                if (item.id === 'radiology') router.push('/radiology')
              }}>
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button style={{ ...S.navItem(false), color: C.sky }} onClick={createDemo}>
            <Plus size={16} />
            New Fever Case
          </button>
        </nav>

        <main style={S.main}>
          <div style={S.greetCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>{greeting},</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.navy, marginTop: 2 }}>{doctorName || 'Loading...'}</div>
                <div style={{ fontSize: 12, color: C.text, marginTop: 4 }}>{doctorTitle} · {dateStr}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {hours < 12 ? 'Morning Shift (07:00-15:00)' : hours < 17 ? 'Afternoon Shift (15:00-23:00)' : 'Night Shift (23:00-07:00)'}
                  </span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} /> {doctorTitle === 'Consultant Surgeon' ? 'General Surgery' : doctorTitle}
                  </span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> Ward 5 + Emergency
                  </span>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => router.push('/doctor-ados')} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: C.sky, color: C.white, fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Brain size={12} /> ADOS Mode</button>
                  <button onClick={() => router.push('/doctor/ward-round')} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Footprints size={12} /> Ward Round</button>
                  <button onClick={() => router.push('/doctor/emergency')} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> Emergency</button>
                  <button onClick={() => router.push('/doctor/clinic')} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> Clinic</button>
                  <button onClick={() => router.push('/handover')} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={12} /> Handover</button>
                </div>
              </div>
              <div style={{ background: C.skyLight, borderRadius: 12, padding: '16px 24px', textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.sky, letterSpacing: '0.04em' }}>TODAY'S ASSIGNMENT</div>
                <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                  {[
                    { num: active.length, label: 'Patients' },
                    { num: Math.min(Math.max(encounters.length - active.length, 0), 9), label: 'Follow-ups' },
                    { num: criticalCount, label: 'Critical' },
                    { num: pendingLabCount, label: 'Pending Labs' },
                    { num: Math.min(completed.length, 9), label: 'Completed' },
                    { num: 0, label: 'Consults' },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{m.num}</div>
                      <div style={{ fontSize: 10, color: C.text }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={S.statsRow}>
            {[
              { num: active.length, label: 'Active Patients', col: C.sky, filter: '' },
              { num: encounters.length, label: 'Total Encounters', col: C.purple, filter: '' },
              { num: criticalCount, label: 'Critical', col: C.red, filter: 'critical' },
              { num: pendingLabCount, label: 'Pending Labs', col: C.amber, filter: '' },
              { num: completed.length, label: 'Completed', col: C.green, filter: '' },
              { num: Math.round(encounters.length > 0 ? (active.length / encounters.length) * 100 : 0), label: 'Active Rate %', col: C.skySoft, filter: '' },
            ].map(s => (
              <div key={s.label} style={S.statCard(s.col)}
                onClick={() => s.filter && setSearchQ(s.filter)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.navy }}>{s.num}</div>
                <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
            <div style={S.queueCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>Patient Queue</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{active.length} active patients</div>
                </div>
                <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => router.push('/doctor/ward-round')}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1A6DD9' }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.sky }}>
                  START WARD ROUND
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 48, fontSize: 13, color: C.textLight }}>Loading patients…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <Bed size={32} style={{ color: C.textLight, marginBottom: 12 }} />
                  <div style={{ fontSize: 13, color: C.textLight }}>No patients yet. Use "New Fever Case" to create a test patient.</div>
                </div>
              ) : (
                <div>
                  {filtered.map(e => {
                    const state = (e as any).state as EncounterOrchestratorState | undefined
                    const temp = state?.questionEngine?.answers?.['exam_temp']?.value || state?.questionEngine?.answers?.['q_exam_temp']?.value
                    const hasFever = temp && parseFloat(String(temp)) > 37.5
                    const bpSys = state?.questionEngine?.answers?.['q_exam_bp_systolic']?.value || state?.questionEngine?.answers?.['exam_bp_systolic']?.value
                    const pulse = state?.questionEngine?.answers?.['q_exam_pulse']?.value || state?.questionEngine?.answers?.['exam_pulse']?.value
                    const rr = state?.questionEngine?.answers?.['q_exam_rr']?.value || state?.questionEngine?.answers?.['exam_rr']?.value
                    const priority = hasFever ? 'high' : e.status === 'active' ? 'medium' : 'low'
                    const bedNum = String(Math.floor(((e.encounterId?.length || 0) % 24) + 1)).padStart(2, '0')
                    const dayNum = e.createdAt ? Math.floor((Date.now() - new Date(e.createdAt).getTime()) / (1000*60*60*24)) + 1 : 1
                    const news2 = (hasFever ? 3 : 0) + (bpSys && parseInt(String(bpSys)) < 100 ? 2 : 0) + (pulse && parseInt(String(pulse)) > 130 ? 3 : 0) + (rr && parseInt(String(rr)) > 30 ? 3 : 0)
                    const tasks: { label: string; done: boolean }[] = []
                    if (!(state?.questionEngine?.answers?.['exam_temp'] || state?.questionEngine?.answers?.['q_exam_temp'])) tasks.push({ label: 'Review vitals', done: false })
                    if (e.status === 'active') tasks.push({ label: 'Review labs', done: false })
                    if (e.currentPhase === 'post_admission') tasks.push({ label: 'Consultant review', done: true })
                    return (
                      <div key={e.encounterId} style={S.patientRow}
                        onClick={() => router.push(`/doctor/patient?encounter=${e.encounterId}`)}
                        onMouseEnter={e => { e.currentTarget.style.background = C.skyLight; e.currentTarget.style.borderColor = C.skySoft }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.border }}>
                        <div style={{ background: C.skyLight, color: C.sky, fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}>
                          Bed {bedNum}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{e.patientName}</span>
                            <span style={{ fontSize: 10, color: C.textLight }}>·</span>
                            <span style={{ fontSize: 11, color: C.textLight }}>{state?.biodata?.age || '?'} {state?.biodata?.age === 1 ? 'yr' : 'yrs'} {state?.biodata?.sex === 'male' ? 'Male' : 'Female'}</span>
                            <span style={{ fontSize: 10, color: C.textLight, background: C.panel, padding: '0 5px', borderRadius: 3 }}>Day {dayNum}</span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 1 }}>
                            {state?.differentials?.[0]?.diseaseName || e.currentPhase?.replace(/_/g, ' ') || 'Under Assessment'}
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: priority === 'high' ? `${C.red}15` : priority === 'medium' ? `${C.green}15` : `${C.sky}15`, color: priority === 'high' ? C.red : priority === 'medium' ? C.green : C.sky }}>
                              {priority === 'high' ? 'HIGH' : priority === 'medium' ? 'STABLE' : 'DISCHARGE'}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: news2 >= 5 ? C.red : news2 >= 3 ? C.amber : C.textLight, background: news2 >= 5 ? `${C.red}10` : news2 >= 3 ? `${C.amber}10` : C.panel, padding: '1px 6px', borderRadius: 4 }}>
                              NEWS2: {news2}
                            </span>
                          </div>
                          {tasks.length > 0 && (
                            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
                              {tasks.map(t => (
                                <label key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: C.textLight, cursor: 'pointer' }}
                                  onClick={e => e.stopPropagation()}>
                                  <input type="checkbox" defaultChecked={t.done} style={{ accentColor: C.sky, width: 10, height: 10 }} />
                                  {t.label}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <div style={{ ...S.queueCard, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>To-Do List</div>
                {(() => {
                  const todoItems: string[] = []
                  const pendingOrders = active.length * 2
                  for (const e of encounters) {
                    const st = (e as any).state as EncounterOrchestratorState | undefined
                    if (st && !(st.questionEngine?.answers?.['exam_temp'] || st.questionEngine?.answers?.['q_exam_temp'])) todoItems.push(`Review vitals — ${e.patientName}`)
                    if (e.currentPhase === 'admission') todoItems.push(`Complete admission note — ${e.patientName}`)
                    if (e.currentPhase === 'post_admission') todoItems.push(`Write progress note — ${e.patientName}`)
                  }
                  if (pendingOrders > 0) todoItems.push(`Sign orders (${pendingOrders} pending)`)
                  if (encounters.length === 0) todoItems.push('No pending tasks')
                  return todoItems.slice(0, 8).map(task => (
                    <div key={task} style={S.taskItem}>
                      <input type="checkbox" style={{ accentColor: C.sky }} />
                      <span>{task}</span>
                    </div>
                  ))
                })()}
              </div>

              <div style={{ ...S.queueCard, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Clinical Alerts</div>
                {(() => {
                  const alerts: { label: string; body: string; color: string }[] = []
                  for (const e of encounters) {
                    const st = (e as any).state as EncounterOrchestratorState | undefined
                    const temp = st?.questionEngine?.answers?.['exam_temp']?.value || st?.questionEngine?.answers?.['q_exam_temp']?.value
                    if (temp && parseFloat(String(temp)) > 39) alerts.push({ label: 'High Fever', body: `${e.patientName} — ${temp}°C`, color: C.red })
                    const bpSys = st?.questionEngine?.answers?.['q_exam_bp_systolic']?.value || st?.questionEngine?.answers?.['exam_bp_systolic']?.value
                    if (bpSys && parseInt(String(bpSys)) < 90) alerts.push({ label: 'Hypotension', body: `${e.patientName} — BP ${bpSys}`, color: C.amber })
                    const bpDia = st?.questionEngine?.answers?.['q_exam_bp_diastolic']?.value || st?.questionEngine?.answers?.['exam_bp_diastolic']?.value
                    if (bpSys && parseInt(String(bpSys)) > 160 && bpDia) alerts.push({ label: 'Hypertension', body: `${e.patientName} — ${bpSys}/${bpDia}`, color: C.amber })
                  }
                  if (alerts.length === 0) {
                    return <div style={{ fontSize: 12, color: C.textLight, padding: 8 }}>No active alerts</div>
                  }
                  return alerts.slice(0, 4).map((a, i) => (
                    <div key={i} style={S.alertItem(a.color)}>
                      <AlertCircle size={14} color={a.color} />
                      <div><strong>{a.label}</strong> — {a.body}</div>
                    </div>
                  ))
                })()}
              </div>

              <div style={S.queueCard}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Ward Overview</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Active Patients', val: String(active.length) },
                    { label: 'Completed', val: String(completed.length) },
                    { label: 'Critical', val: String(criticalCount) },
                    { label: 'Pending Labs', val: String(pendingLabCount) },
                    { label: 'Total Beds', val: '24' },
                    { label: 'Occupied', val: String(active.length) },
                    { label: 'Avg Stay', val: encounters.length > 0 ? `${Math.round(encounters.reduce((s, e) => { const d = e.createdAt ? (Date.now() - new Date(e.createdAt).getTime()) / (1000*60*60*24) : 0; return s + d }, 0) / encounters.length * 10) / 10}d` : '-' },
                    { label: 'Bed Occupancy', val: active.length > 0 ? `${Math.round((active.length / 24) * 100)}%` : '0%' },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '8px 12px', background: C.panel, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: C.textLight }}>{m.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {recentActivity.length > 0 && (
                <div style={{ ...S.queueCard, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Recent Activity</div>
                  {recentActivity.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.panel}` : 'none', fontSize: 12 }}>
                      <span style={{ color: C.textLight, minWidth: 50 }}>{a.time}</span>
                      <span style={{ color: C.text }}>{a.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
