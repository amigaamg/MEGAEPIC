'use client'
import { Suspense, useState, useEffect, useMemo, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadEncounter } from '@/lib/amexan/encounter/encounterPersistence'
import { createEncounterOrchestrator, answerInOrchestrator, setPatientBiodata, getClinicalNotes, getHpiNarrativeContext, type EncounterOrchestratorState } from '@/lib/amexan/encounter-engine'
import { generateEnhancedHpiNarrative } from '@/lib/amexan/encounter-engine/engines/documentation-engine'
import { useAuth } from '@/context/AuthContext'
import { getActiveOrganizationId } from '@/lib/firebase/orgContext'
import { C } from '@/lib/colors';

const S = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column' as const, background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, overflow: 'hidden' },
  topBar: { height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0 },
  logoText: { fontSize: 16, fontWeight: 700, color: C.navy },
  wrdBtn: (a: boolean) => ({ padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: a ? C.sky : C.panel, color: a ? C.white : C.text }),
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftNav: { width: 64, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '12px 0', gap: 2, flexShrink: 0 },
  navIcon: (a: boolean) => ({ width: 52, height: 48, borderRadius: 10, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: a ? C.skyLight : 'transparent', color: a ? C.sky : C.textLight, fontSize: 9, gap: 2, transition: 'all 0.1s' }),
  center: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', ...{ minWidth: 0 } },
  banner: { background: C.white, borderBottom: `1px solid ${C.border}`, flexShrink: 0 },
  bannerInner: { padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 },
  avatar: (s: number) => ({ width: s, height: s, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: s * 0.38, fontWeight: 600, flexShrink: 0 }),
  statusStrip: { padding: '8px 24px 12px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' as const },
  probChip: (c: string) => ({ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: `${c}15`, color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' as const }),
  vChip: { padding: '6px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, minWidth: 70, textAlign: 'center' as const },
  wsArea: { flex: 1, overflow: 'auto', padding: 24 },
  rightPanel: { width: 300, background: C.white, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', flexShrink: 0 },
  rpSection: { padding: '14px 20px', borderBottom: `1px solid ${C.panel}` },
  rpLabel: { fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' as const },
  secTitle: { fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: 12 },
  ddCard: { padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 6 },
  mgtCard: { padding: '10px 14px', borderRadius: 8, background: '#FFF7ED', border: '1px solid #FED7AA', marginBottom: 6 },
  qCard: { padding: '12px 16px', borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 10 },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  chip: (s: boolean) => ({ padding: '6px 14px', borderRadius: 6, border: s ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: s ? C.skyLight : C.white, fontSize: 12, color: s ? C.sky : C.text, cursor: 'pointer', fontWeight: s ? 600 : 400, transition: 'all 0.1s' }),
}

type View = 'summary' | 'timeline' | 'history' | 'examination' | 'problems' | 'orders' | 'medications' | 'results' | 'imaging' | 'monitoring' | 'notes' | 'documents' | 'communication' | 'analytics'

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: 'summary', label: 'Summary', icon: '◈' },
  { id: 'timeline', label: 'Timeline', icon: '◷' },
  { id: 'history', label: 'History', icon: '◆' },
  { id: 'examination', label: 'Exam', icon: '△' },
  { id: 'problems', label: 'Problems', icon: '▲' },
  { id: 'orders', label: 'Orders', icon: '▽' },
  { id: 'medications', label: 'Meds', icon: '●' },
  { id: 'results', label: 'Results', icon: '◎' },
  { id: 'imaging', label: 'Imaging', icon: '◉' },
  { id: 'monitoring', label: 'Monitor', icon: '▸' },
  { id: 'notes', label: 'Notes', icon: '⊡' },
  { id: 'documents', label: 'Docs', icon: '□' },
  { id: 'communication', label: 'Chat', icon: '◉' },
  { id: 'analytics', label: 'Analytics', icon: '⊟' },
]

const TIMELINE_EVENTS = [
  { time: '08:12', event: 'Arrival at ward' },
  { time: '08:20', event: 'Triage completed' },
  { time: '08:35', event: 'History taken' },
  { time: '08:50', event: 'Examination completed' },
  { time: '09:10', event: 'CBC sent to lab' },
  { time: '09:40', event: 'Malaria rapid test — Positive' },
  { time: '09:45', event: 'IV Artesunate started' },
  { time: '10:10', event: 'Consultant reviewed' },
  { time: '10:25', event: 'Blood transfusion requested' },
  { time: '12:00', event: 'Temperature reduced to 37.8°C' },
  { time: '12:30', event: 'Mother counselled on malaria management' },
]

const CHAT_MESSAGES = [
  { from: '', role: 'Consultant', msg: 'Repeat CBC tomorrow morning.', time: '10:10' },
  { from: 'Nurse Mary', role: 'Nursing', msg: 'Urine output improving — 1.2 mL/kg/hr over last 4h.', time: '11:30' },
  { from: 'Lab', role: 'Laboratory', msg: 'Blood film: 2+ asexual P. falciparum parasites.', time: '09:45' },
  { from: '', role: 'Consultant', msg: 'Continue IV Artesunate. Monitor glucose q4h.', time: '10:15' },
]

const DEFAULT_DOCTOR = 'Clinician'

function PatientWorkspaceInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { user } = useAuth()
  const [clinicianName, setClinicianName] = useState<string>('')
  const encounterId = params?.get('encounter') || ''

  useEffect(() => {
    setClinicianName(user?.email?.split('@')[0] || DEFAULT_DOCTOR)
  }, [user])
  const [state, setState] = useState<EncounterOrchestratorState | null>(null)
  const [view, setView] = useState<View>('summary')
  const [wardRoundMode, setWardRoundMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!encounterId) { setError('No encounter specified.'); setLoading(false); return }
    loadEncounter(getActiveOrganizationId() ?? '', encounterId).then(data => {
      if (data?.state) setState(data.state as EncounterOrchestratorState)
      else setError('Encounter not found.')
      setLoading(false)
    }).catch(() => { setError('Failed to load encounter'); setLoading(false) })
  }, [encounterId])

  const clinicalNotes = useMemo(() => state ? getClinicalNotes(state) : {}, [state])

  const [aiNarrative, setAiNarrative] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  useEffect(() => {
    if (!state || Object.keys(state.questionEngine.answers).length < 3) return
    setAiLoading(true)
    const ctx = getHpiNarrativeContext(state)
    generateEnhancedHpiNarrative(ctx).then(n => { setAiNarrative(n); setAiLoading(false) }).catch(() => setAiLoading(false))
  }, [state?.questionEngine.answers])

  const handleAnswer = useCallback((cardId: string, value: string | boolean | number | string[]) => {
    if (!state) return
    setState(prev => answerInOrchestrator(prev!, cardId, value))
  }, [state])

  if (loading) return <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.textLight }}>Loading patient workspace…</div>
  if (error) return <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.red }}>{error}<br /><button onClick={() => router.push('/doctor')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, cursor: 'pointer' }}>← Back to Dashboard</button></div>
  if (!state) return null

  const biodata = state.biodata
  const answers = state.questionEngine.answers
  const qCards = state.questionEngine.visibleCards || []
  const activeComplaint = state.chiefComplaints.find(c => c.primary)?.complaint || ''
  const temp = answers['exam_temp']?.value
  const hasFever = temp && parseFloat(String(temp)) > 37.5
  const weight = answers['exam_weight']?.value || answers['weight']?.value || '12'
  const weightStr = `${weight} kg`
  const encounterDate = biodata?.date || null
  const admitDay = encounterDate ? Math.max(1, Math.floor((Date.now() - new Date(encounterDate).getTime()) / (1000 * 60 * 60 * 24))) : 2
  const pewsScore = (hasFever ? 2 : 0) + (parseInt(String(answers['exam_pulse']?.value || '0')) > 140 ? 2 : 0) + (parseInt(String(answers['exam_rr']?.value || '0')) > 35 ? 2 : 0) + (state.redFlags?.length > 0 ? 1 : 0)

  const PriorityBadge = ({ status }: { status: string }) => {
    const color = status === 'high' || status === 'critical' ? C.red : status === 'medium' ? C.amber : C.green
    return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: `${color}15`, color, fontWeight: 600 }}>{status.toUpperCase()}</span>
  }

  return (
    <div style={{ ...S.page, ...(wardRoundMode ? { background: C.skyLight } : {}) }}>
      {/* TOP BAR */}
      <header style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 13, fontWeight: 700 }}>✦</div>
          <span style={S.logoText}>AMEXAN</span>
        </div>
        <span style={{ color: C.border }}>|</span>
        <span style={{ fontSize: 13, color: C.navy, fontWeight: 500 }}>{biodata?.patientName || 'Patient'}</span>
        <span style={{ fontSize: 11, color: C.textLight }}>•</span>
        <span style={{ fontSize: 11, color: C.textLight }}>{biodata?.hospitalNumber || '—'}</span>
        <div style={{ flex: 1 }} />
        {!wardRoundMode && (
          <button onClick={() => router.push('/doctor/ward-round')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.text }}>
            Ward Round
          </button>
        )}
        <button style={S.wrdBtn(wardRoundMode)} onClick={() => setWardRoundMode(v => !v)}>
          {wardRoundMode ? 'Exit Ward Round' : 'Start Ward Round'}
        </button>
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.text }}>Dashboard</button>
      </header>

      <div style={S.body}>
        {/* LEFT NAV */}
        <nav style={S.leftNav}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} style={S.navIcon(view === n.id)} onClick={() => setView(n.id)} title={n.label}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span style={{ fontSize: 8 }}>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* CENTRAL CLINICAL WORKSPACE */}
        <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0}}>
          {/* PATIENT BANNER */}
          <div style={S.banner}>
            <div style={S.bannerInner}>
              <div style={S.avatar(44)}>{biodata?.patientName?.charAt(0) || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: C.navy }}>{biodata?.patientName || 'Unknown'}</span>
                  <PriorityBadge status={hasFever ? 'high' : 'stable'} />
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.textLight }}>
                  <span>MRN: {biodata?.hospitalNumber || '—'}</span>
                  <span>{biodata?.age || '?'} yrs</span>
                  <span>{biodata?.sex === 'male' ? 'Male' : 'Female'}</span>
                  {biodata?.department && <span>Ward: {biodata.department}</span>}
                  <span>Guardian: Mary Mwangi</span>
                  <span>Wt: {weightStr}</span>
                  <span>{biodata?.clinician ? `Dr: ${biodata.clinician}` : ''}</span>
                  <span>Admit: Day {admitDay}</span>
                  <span style={{ color: C.sky, fontWeight: 500 }}>{state.currentPhase?.replace(/_/g, ' ') || 'Active'}</span>
                </div>
              </div>
              {!wardRoundMode && <div style={{ fontSize: 11, color: C.textLight }}>CC: {activeComplaint || '—'}</div>}
            </div>

            {/* CLINICAL STATUS STRIP */}
            <div style={S.statusStrip}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={S.probChip(C.red)}>🔴 Severe Malaria</span>
                <span style={S.probChip(C.amber)}>🟡 Severe Anemia</span>
                <span style={S.probChip(C.sky)}>🔵 Moderate Dehydration</span>
              </div>
              <div style={{ fontSize: 10, color: C.textLight }}>|</div>
              {[
                { val: String(temp || '—'), lab: 'Temp °C', col: hasFever ? C.red : C.text },
                { val: String(answers['exam_pulse']?.value || '—'), lab: 'Pulse bpm' },
                { val: answers['exam_bp_systolic']?.value ? `${answers['exam_bp_systolic'].value}/${answers['exam_bp_diastolic']?.value || '—'}` : '—', lab: 'BP mmHg' },
                { val: String(answers['exam_rr']?.value || '—'), lab: 'RR /min' },
                { val: String(answers['exam_o2_sat']?.value || '—'), lab: 'SpO₂ %' },
                { val: weightStr, lab: 'Wt kg' },
                { val: `PEWS ${pewsScore}`, lab: 'Score', col: pewsScore >= 4 ? C.red : pewsScore >= 2 ? C.amber : C.green },
              ].map(v => (
                <div key={v.lab} style={S.vChip}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: (v as any).col || C.navy }}>{v.val}</div>
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 1 }}>{v.lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* WORKSPACE AREA */}
          <div style={S.wsArea}>
            {view === 'summary' && <SummaryView state={state} clinicalNotes={clinicalNotes} aiNarrative={aiNarrative} aiLoading={aiLoading} wardRoundMode={wardRoundMode} />}
            {view === 'timeline' && <TimelineView state={state} />}
            {view === 'history' && <HistoryView state={state} answers={answers} qCards={qCards} onAnswer={handleAnswer} />}
            {view === 'examination' && <ExamView state={state} answers={answers} qCards={qCards} onAnswer={handleAnswer} />}
            {view === 'problems' && <ProblemsView state={state} />}
            {view === 'orders' && <OrdersView state={state} />}
            {view === 'medications' && <MedsView state={state} clinicianName={clinicianName} />}
            {view === 'results' && <ResultsView state={state} />}
            {view === 'imaging' && <ImagingView />}
            {view === 'monitoring' && <MonitoringView state={state} />}
            {view === 'notes' && <NotesView state={state} clinicianName={clinicianName} />}
            {view === 'documents' && <DocumentsView state={state} />}
            {view === 'communication' && <CommunicationView clinicianName={clinicianName} />}
            {view === 'analytics' && <AnalyticsView state={state} />}
            {wardRoundMode && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => alert('Review marked as complete ✓')}
                  style={{ padding: '14px 40px', borderRadius: 10, border: 'none', background: C.sky, color: C.white, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(47,128,237,0.35)', transition: 'all 0.15s' }}>
                  Complete Review
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ACTION HUB */}
        {!wardRoundMode && <RightPanel state={state} clinicalNotes={clinicalNotes} />}
      </div>
    </div>
  )
}

// ─── RIGHT ACTION HUB ──────────────────────────────────────────────
function RightPanel({ state, clinicalNotes }: { state: EncounterOrchestratorState; clinicalNotes: Record<string, string> }) {
  const topDx = state.differentials[0]
  const hasManagement = state.managementPlan.length > 0
  return (
    <aside style={S.rightPanel}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Action Hub</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* TODAY'S PLAN */}
        <div style={S.rpSection}>
          <div style={S.rpLabel}>Today's Plan</div>
          {hasManagement ? (
            state.managementPlan.slice(0, 4).map((m, i) => (
              <div key={m.id || i} style={S.mgtCard}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#C2410C' }}>{m.action}</div>
                {m.details && <div style={{ fontSize: 11, color: '#9A3412', marginTop: 2 }}>{m.details}</div>}
              </div>
            ))
          ) : (
            <div style={{ fontSize: 12, color: C.textLight, fontStyle: 'italic' }}>Complete assessment to generate plan</div>
          )}
        </div>

        {/* LEADING DIAGNOSIS */}
        {topDx && (
          <div style={S.rpSection}>
            <div style={S.rpLabel}>Leading Diagnosis</div>
            <div style={S.ddCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{topDx.diseaseName}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.sky }}>{topDx.probability}%</span>
              </div>
              {topDx.supporting.length > 0 && <div style={{ fontSize: 11, color: C.green }}>↑ {topDx.supporting.slice(0, 3).join(', ')}</div>}
              {topDx.against.length > 0 && <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>↓ {topDx.against.slice(0, 2).join(', ')}</div>}
            </div>
            {state.differentials.slice(1, 4).map(d => (
              <div key={d.diseaseId || d.rank} style={{ fontSize: 12, padding: '6px 0', borderBottom: `1px solid ${C.panel}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.text }}>{d.diseaseName}</span>
                <span style={{ color: C.textLight }}>{d.probability}%</span>
              </div>
            ))}
          </div>
        )}

        {/* OUTSTANDING TASKS */}
        <div style={S.rpSection}>
          <div style={S.rpLabel}>Outstanding Tasks</div>
          {[
            'Review Hb result',
            'Consultant review',
            'Blood transfusion',
            'Nursing education',
            'Discharge counselling',
          ].map(task => (
            <div key={task} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12, color: C.text, borderBottom: `1px solid ${C.panel}` }}>
              <input type="checkbox" style={{ accentColor: C.sky }} />
              <span>{task}</span>
            </div>
          ))}
          {state.missingInfo.length > 0 && state.missingInfo.map((mi, i) => (
            <div key={i} style={{ fontSize: 12, color: C.text, padding: '4px 0' }}>○ {mi}</div>
          ))}
        </div>

        {/* RED FLAGS */}
        {state.redFlags.length > 0 && (
          <div style={S.rpSection}>
            <div style={S.rpLabel}>Red Flags</div>
            {state.redFlags.map((rf, i) => (
              <div key={i} style={{ fontSize: 12, color: C.red, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚠</span> {rf.replace(/^[^\s]+\s/, '')}
              </div>
            ))}
          </div>
        )}

        {/* INVESTIGATIONS */}
        {topDx && topDx.missing?.length > 0 && (
          <div style={S.rpSection}>
            <div style={S.rpLabel}>Suggested Investigations</div>
            {topDx.missing.slice(0, 5).map((inv, i) => (
              <div key={i} style={{ fontSize: 12, padding: '5px 0', color: C.text, borderBottom: `1px solid ${C.panel}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.sky }}>○</span> {inv}
              </div>
            ))}
          </div>
        )}

        {/* EXPECTED REVIEW */}
        <div style={S.rpSection}>
          <div style={S.rpLabel}>Next Review</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>16:00 Today</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Clinician — Ward Round</div>
        </div>
      </div>
    </aside>
  )
}

export default function PatientWorkspace() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: C.textLight, fontFamily: "'Inter', system-ui, sans-serif" }}>Loading...</div>}>
      <PatientWorkspaceInner />
    </Suspense>
  )
}

// ─── VIEWS ─────────────────────────────────────────────────────────

function SummaryView({ state, clinicalNotes, aiNarrative, aiLoading, wardRoundMode }: { state: any; clinicalNotes: any; aiNarrative: string; aiLoading: boolean; wardRoundMode: boolean }) {
  const problems = [
    { name: 'Severe Malaria', status: 'Improving', goal: 'Parasite clearance', progress: 75, color: C.sky },
    { name: 'Severe Anemia', status: 'Blood Ordered', goal: 'Hb >8 g/dL', progress: 30, color: C.red },
    { name: 'Moderate Dehydration', status: 'Receiving IV Fluids', goal: 'Normal perfusion', progress: 65, color: C.amber },
  ]
  return (
    <div>
      <div style={S.secTitle}>Clinical Summary</div>
      <div style={{ display: 'grid', gridTemplateColumns: wardRoundMode ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* LEFT: Summary */}
        <div>
          <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>History of Presenting Illness</div>
            {aiLoading ? (
              <div style={{ fontSize: 12, color: C.textLight, fontStyle: 'italic' }}>Generating summary…</div>
            ) : aiNarrative ? (
              <div style={{ fontSize: 13, lineHeight: 1.7, color: C.navy }}>{aiNarrative}</div>
            ) : state.hpiNarrative ? (
              <div style={{ fontSize: 13, lineHeight: 1.7, color: C.navy }}>{state.hpiNarrative}</div>
            ) : (
              <div style={{ fontSize: 12, color: C.textLight, fontStyle: 'italic' }}>Complete history to generate summary</div>
            )}
          </div>

          <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Active Clinical Problems</div>
            {problems.map(p => (
              <div key={p.name} style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: p.color, fontWeight: 500 }}>{p.status}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6 }}>Goal: {p.goal}</div>
                <div style={{ height: 6, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: p.color, width: `${p.progress}%`, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 4, textAlign: 'right' }}>{p.progress}% complete</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Differentials and Info */}
        <div>
          <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Differential Diagnosis</div>
            {state.differentials.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textLight, fontStyle: 'italic' }}>No differentials yet</div>
            ) : (
              state.differentials.slice(0, 5).map((d: any) => (
                <div key={d.diseaseId || d.rank} style={S.ddCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{d.rank}. {d.diseaseName}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.sky }}>{d.probability}%</span>
                  </div>
                  {d.supporting?.length > 0 && <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{d.supporting.slice(0, 3).join(', ')}</div>}
                </div>
              ))
            )}
          </div>

          <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Patient Info</div>
            {[
              ['Chief Complaint', state.chiefComplaints.find((c: any) => c.primary)?.complaint || '—'],
              ['Admission Day', '2'],
              ['Current Priority', state.redFlags.length > 0 ? 'High' : 'Stable'],
              ['Expected Discharge', '3 days'],
              ['Isolation Required', 'No'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: `1px solid ${C.panel}` }}>
                <span style={{ color: C.textLight }}>{label}</span>
                <span style={{ color: C.navy, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineView({ state }: { state: EncounterOrchestratorState }) {
  return (
    <div>
      <div style={S.secTitle}>Encounter Timeline</div>
      <div style={{ padding: 20, borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
        {state.timeline.length === 0 && TIMELINE_EVENTS.length === 0 ? (
          <div style={{ fontSize: 13, color: C.textLight, fontStyle: 'italic' }}>Timeline will appear as data is collected</div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: C.skyLight }} />
            {[...TIMELINE_EVENTS].reverse().map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', position: 'relative' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? C.sky : C.panel, border: `2px solid ${i === 0 ? C.sky : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? C.white : C.textLight, flexShrink: 0 }}>
                  {i === 0 ? '⋮' : ''}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ fontSize: 12, color: C.textLight, marginBottom: 2 }}>{entry.time}</div>
                  <div style={{ fontSize: 13, color: C.navy }}>{entry.event}</div>
                </div>
              </div>
            ))}
            {state.questionEngine.answers && Object.keys(state.questionEngine.answers).length > 0 && (
              <div style={{ display: 'flex', gap: 16, padding: '10px 0', position: 'relative' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.sky, border: `2px solid ${C.sky}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0 }}>●</div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ fontSize: 12, color: C.sky, fontWeight: 600, marginBottom: 2 }}>Now</div>
                  <div style={{ fontSize: 13, color: C.navy }}>Active encounter — {Object.keys(state.questionEngine.answers).length} answers recorded</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function HistoryView({ state, answers, qCards, onAnswer }: { state: EncounterOrchestratorState; answers: any; qCards: any[]; onAnswer: any }) {
  const hpiCards = qCards.filter(c => c.phase === 'hpi' || c.phase === 'chief_complaint')
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const historySections = [
    { name: 'History of Presenting Illness', status: 'Completed', color: C.green, content: state.hpiNarrative || 'No narrative recorded yet.' },
    { name: 'Past Medical History', status: 'Completed', color: C.green, content: 'No significant past medical history.' },
    { name: 'Drug History', status: 'Completed', color: C.green, content: 'No regular medications. No known drug allergies.' },
    { name: 'Birth History', status: 'Completed', color: C.green, content: 'Full term, normal vaginal delivery, cried immediately.' },
    { name: 'Family History', status: 'Completed', color: C.green, content: 'No significant family history of chronic illness.' },
    { name: 'Social History', status: 'Completed', color: C.green, content: 'Lives with parents in urban area. Attends school.' },
    { name: 'Review of Systems', status: 'Needs Review', color: C.amber, content: 'Full review of systems pending completion.' },
    { name: 'Immunization History', status: 'Completed', color: C.green, content: 'Fully immunized for age per KEPI schedule.' },
  ]
  return (
    <div>
      <div style={S.secTitle}>History</div>

      {/* Chief Complaint */}
      <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Chief Complaint</div>
        {state.chiefComplaints.map(c => (
          <div key={c.id} style={{ ...S.ddCard, borderLeft: `3px solid ${C.sky}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{c.complaint}</div>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Duration: {c.duration} | Onset: {c.onset}</div>
          </div>
        ))}
      </div>

      {/* Collapsible History Sections */}
      <div style={{ marginBottom: 16 }}>
        {historySections.map(section => (
          <div key={section.name} style={{ marginBottom: 8 }}>
            <div onClick={() => setExpandedHistory(expandedHistory === section.name ? null : section.name)}
              style={{ padding: '12px 16px', borderRadius: expandedHistory === section.name ? '10px 10px 0 0' : 10, background: C.white, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: expandedHistory === section.name ? `1px solid ${C.border}` : 'none', transition: 'all 0.1s' }}>
              <span style={{ fontSize: 12, color: C.text }}>{section.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: section.color, fontWeight: 500 }}>{section.status}</span>
                <span style={{ fontSize: 10, color: C.textLight, transform: expandedHistory === section.name ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</span>
              </span>
            </div>
            {expandedHistory === section.name && (
              <div style={{ padding: '12px 16px', borderRadius: '0 0 10px 10px', background: C.panel, border: `1px solid ${C.border}`, borderTop: 'none', fontSize: 13, lineHeight: 1.6, color: C.navy }}>
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Captured Facts Table */}
      <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Captured Facts (HPI)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding: '6px 10px', textAlign: 'left', color: C.textLight, fontWeight: 600 }}>Symptom</th>
              <th style={{ padding: '6px 10px', textAlign: 'left', color: C.textLight, fontWeight: 600 }}>Duration</th>
              <th style={{ padding: '6px 10px', textAlign: 'left', color: C.textLight, fontWeight: 600 }}>Pattern</th>
              <th style={{ padding: '6px 10px', textAlign: 'left', color: C.textLight, fontWeight: 600 }}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {[
              { symptom: 'Fever', duration: '3 days', pattern: 'Intermittent', severity: 'High Grade' },
              { symptom: 'Chills', duration: 'Present', pattern: 'Rigors', severity: 'Present' },
              { symptom: 'Sweating', duration: 'Present', pattern: 'Paracetamol Response', severity: 'Partial' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: i < 2 ? `1px solid ${C.panel}` : 'none' }}>
                <td style={{ padding: '6px 10px', color: C.navy, fontWeight: 500 }}>{row.symptom}</td>
                <td style={{ padding: '6px 10px', color: C.text }}>{row.duration}</td>
                <td style={{ padding: '6px 10px', color: C.text }}>{row.pattern}</td>
                <td style={{ padding: '6px 10px', color: C.text }}>{row.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>Associated: Vomiting, Convulsions, Poor Feeding, Reduced Urine</div>
        <div style={{ fontSize: 11, color: C.textLight }}>Negative Findings: No cough, No dysuria, No neck stiffness, No diarrhea</div>
      </div>

      {/* FEVERSOCRATES Questions */}
      <div style={S.secTitle}>SOCRATES Workup</div>
      {hpiCards.length === 0 ? (
        <div style={{ fontSize: 13, color: C.textLight, fontStyle: 'italic', marginBottom: 16 }}>Complete registration to see history questions</div>
      ) : (
        hpiCards.map(card => {
          const answered = answers[card.id]
          return (
            <div key={card.id} style={S.qCard}>
              <div style={{ fontSize: 13, color: C.navy, marginBottom: 8, fontWeight: 500 }}>{card.question}</div>
              {card.type === 'chips' && (
                <div style={S.chipRow}>
                  {(card.chips || []).map((chip: string) => (
                    <button key={chip} style={S.chip(answered?.value === chip || (Array.isArray(answered?.value) && answered.value.includes(chip)))} onClick={() => onAnswer(card.id, chip)}>{chip}</button>
                  ))}
                </div>
              )}
              {card.type === 'boolean' && (
                <div style={S.chipRow}>
                  {['Yes', 'No'].map(v => (
                    <button key={v} style={S.chip(String(answered?.value || '') === v)} onClick={() => onAnswer(card.id, v === 'Yes')}>{v}</button>
                  ))}
                </div>
              )}
              {answered && <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>✓ Answered: {String(answered.value)}</div>}
            </div>
          )
        })
      )}
    </div>
  )
}

function ExamView({ state, answers, qCards, onAnswer }: { state: any; answers: any; qCards: any[]; onAnswer: any }) {
  const examCards = qCards.filter(c => c.phase === 'general_exam')
  const [expandedExam, setExpandedExam] = useState<string | null>(null)
  const examSystems = [
    {
      label: 'General', status: 'Completed', color: C.green,
      fields: ['Appearance: Well nourished, alert', 'Hydration: Some dehydration', 'Jaundice: Scleral icterus', 'Pallor: Moderate pallor', 'Lymphadenopathy: None']
    },
    {
      label: 'Vitals', status: 'Completed', color: C.green,
      fields: [`Temp: ${answers['exam_temp']?.value || '—'} °C`, `Pulse: ${answers['exam_pulse']?.value || '—'} bpm`, `BP: ${answers['exam_bp_systolic']?.value || '—'}/${answers['exam_bp_diastolic']?.value || '—'}`, `RR: ${answers['exam_rr']?.value || '—'} /min`, `SpO₂: ${answers['exam_o2_sat']?.value || '—'} %`]
    },
    {
      label: 'CNS', status: 'Completed', color: C.green,
      fields: ['Consciousness: Alert', 'AVPU: A', 'Tone: Normal', 'Power: 5/5 all limbs', 'Neck Stiffness: Absent', 'Fontanelle: Flat']
    },
    {
      label: 'Respiratory', status: 'Completed', color: C.green,
      fields: ['Breath Sounds: Vesicular', 'Added Sounds: None', 'Respiratory Effort: Mild tachypnea', 'Percussion: Resonant', 'Chest Shape: Normal']
    },
    {
      label: 'CVS', status: 'Completed', color: C.green,
      fields: ['Heart Sounds: S1+S2 normal', 'Murmur: None', 'Capillary Refill: 2s', 'Peripheral Pulses: Well felt', 'JVP: Not elevated']
    },
    {
      label: 'Abdomen', status: 'Completed', color: C.green,
      fields: ['Inspection: Flat, no scars', 'Palpation: Soft, mild tenderness', 'Liver: 2 cm below costal margin', 'Spleen: Not palpable', 'Bowel Sounds: Present']
    },
    {
      label: 'Skin', status: 'Needs Review', color: C.amber, warn: true,
      fields: ['Rash: None', 'Turgor: Reduced', 'Mucous Membranes: Dry', 'Petechiae: None']
    },
  ]
  return (
    <div>
      <div style={S.secTitle}>Examination</div>
      {examSystems.map(s => (
        <div key={s.label} style={{ marginBottom: 8 }}>
          <div onClick={() => setExpandedExam(expandedExam === s.label ? null : s.label)}
            style={{ padding: '12px 16px', borderRadius: expandedExam === s.label ? '10px 10px 0 0' : 10, background: C.white, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: expandedExam === s.label ? `1px solid ${C.border}` : 'none', transition: 'all 0.1s' }}>
            <span style={{ fontSize: 12, color: C.text }}>{s.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.status}</span>
              <span style={{ fontSize: 10, color: C.textLight, transform: expandedExam === s.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</span>
            </span>
          </div>
          {expandedExam === s.label && (
            <div style={{ padding: '12px 16px', borderRadius: '0 0 10px 10px', background: C.panel, border: `1px solid ${C.border}`, borderTop: 'none' }}>
              {s.fields.map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: C.text, padding: '4px 0', borderBottom: i < s.fields.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.sky, flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={S.secTitle}>Vital Signs</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Temperature', val: String(answers['exam_temp']?.value || '—'), unit: '°C' },
          { label: 'Heart Rate', val: String(answers['exam_pulse']?.value || '—'), unit: 'bpm' },
          { label: 'BP Systolic', val: String(answers['exam_bp_systolic']?.value || '—'), unit: 'mmHg' },
          { label: 'BP Diastolic', val: String(answers['exam_bp_diastolic']?.value || '—'), unit: 'mmHg' },
          { label: 'Respiratory Rate', val: String(answers['exam_rr']?.value || '—'), unit: '/min' },
          { label: 'O2 Saturation', val: String(answers['exam_o2_sat']?.value || '—'), unit: '%' },
          { label: 'Weight', val: String(state.biodata?.age || '—'), unit: 'kg' },
          { label: 'Height', val: '—', unit: 'cm' },
        ].map(v => (
          <div key={v.label} style={{ padding: 14, borderRadius: 8, background: C.white, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>
              {v.val}<span style={{ fontSize: 11, color: C.textLight, fontWeight: 400 }}> {v.unit}</span>
            </div>
            <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>{v.label}</div>
          </div>
        ))}
      </div>

      <div style={S.secTitle}>Systemic Examination</div>
      {examCards.map(card => {
        const answered = answers[card.id]
        return (
          <div key={card.id} style={S.qCard}>
            <div style={{ fontSize: 13, color: C.navy, marginBottom: 8, fontWeight: 500 }}>{card.question}</div>
            {card.type === 'chips' && (
              <div style={S.chipRow}>
                {(card.chips || []).map((chip: string) => (
                  <button key={chip} style={S.chip(answered?.value === chip)} onClick={() => onAnswer(card.id, chip)}>{chip}</button>
                ))}
              </div>
            )}
            {card.type === 'text' && (
              <input style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }}
                placeholder="Enter value…" value={String(answered?.value || '')} onChange={e => onAnswer(card.id, e.target.value)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ProblemsView({ state }: { state: EncounterOrchestratorState }) {
  const problems = state.problemList || []
  const hasManagement = state.managementPlan.length > 0
  const clinicalProblems = [
    { name: 'Severe Malaria', status: 'Improving', goal: 'Parasite Clearance', monitor: 'q4h vitals', color: C.sky },
    { name: 'Severe Anemia', status: 'Blood Ordered', goal: 'Hb >8 g/dL', monitor: 'q12h Hb', color: C.red },
    { name: 'Moderate Dehydration', status: 'Receiving IV Fluids', goal: 'Normal Perfusion', monitor: 'Fluid balance', color: C.amber },
  ]
  return (
    <div>
      <div style={S.secTitle}>Active Problems (POMR)</div>
      {clinicalProblems.map(p => (
        <div key={p.name} style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 12, borderLeft: `3px solid ${p.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{p.name}</span>
            <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 11, color: C.textLight }}>
            <div>Goal: <strong style={{ color: C.text }}>{p.goal}</strong></div>
            <div>Monitor: <strong style={{ color: C.text }}>{p.monitor}</strong></div>
            <div>Status: <strong style={{ color: p.color }}>Active</strong></div>
          </div>
        </div>
      ))}

      {hasManagement && (
        <div style={{ marginTop: 20 }}>
          <div style={S.secTitle}>Management Plan</div>
          {state.managementPlan.map((m, i) => (
            <div key={m.id || i} style={{ padding: 14, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>{m.action}</div>
              {m.details && <div style={{ fontSize: 11, color: '#15803D', marginTop: 2 }}>{m.details}</div>}
            </div>
          ))}
        </div>
      )}

      {problems.length > 0 && problems.map((p: string, i: number) => (
        <div key={i} style={{ padding: 10, borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 4, fontSize: 13 }}>
          <strong>{i + 1}.</strong> {p}
        </div>
      ))}
    </div>
  )
}

function OrdersView({ state }: { state: EncounterOrchestratorState }) {
  return (
    <div>
      <div style={S.secTitle}>Orders</div>
      {state.differentials.length === 0 ? (
        <div style={{ fontSize: 13, color: C.textLight, fontStyle: 'italic' }}>Complete assessment to generate orders</div>
      ) : (
        <div>
          <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 12, textTransform: 'uppercase' }}>Recommended Investigations</div>
            {(state.differentials[0]?.missing || ['Full blood count', 'Malaria rapid test', 'Blood film', 'Random blood sugar', 'Blood culture']).map((inv: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: C.sky }}>○</span>
                <span style={{ color: C.text }}>{inv}</span>
                <div style={{ flex: 1 }} />
                <button style={{ padding: '4px 12px', borderRadius: 4, border: `1px solid ${C.sky}`, background: C.white, color: C.sky, fontSize: 11, cursor: 'pointer' }}>Order</button>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 12, textTransform: 'uppercase' }}>Active Orders</div>
            {[
              { order: 'IV Artesunate 2.4 mg/kg', status: 'Active', priority: 'STAT' },
              { order: 'IV Normal Saline 10 mL/kg', status: 'Active', priority: 'STAT' },
              { order: 'Paracetamol 15 mg/kg PRN', status: 'Active', priority: 'PRN' },
              { order: 'Blood Transfusion 10 mL/kg', status: 'Pending', priority: 'Urgent' },
            ].map(o => (
              <div key={o.order} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: C.navy }}>{o.order}</span>
                <div style={{ flex: 1 }} />
                <span style={{ color: o.priority === 'STAT' ? C.red : o.priority === 'Urgent' ? C.amber : C.textLight, fontWeight: 600, fontSize: 11 }}>{o.priority}</span>
                <span style={{ color: C.green, fontSize: 11 }}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MedsView({ state, clinicianName }: { state: EncounterOrchestratorState; clinicianName: string }) {
  const activeMeds = [
    { name: 'IV Artesunate', dose: '2.4 mg/kg', route: 'IV', freq: '0h, 12h, 24h, 48h', started: 'Yesterday', next: '14:00', prescriber: clinicianName, nurse: 'Mary', status: 'Administered' },
    { name: 'IV Normal Saline', dose: '10 mL/kg', route: 'IV', freq: 'Over 2h', started: 'Today', next: '12:30', prescriber: clinicianName, nurse: 'Mary', status: 'Infusing' },
    { name: 'Paracetamol', dose: '15 mg/kg', route: 'PO/PR', freq: 'PRN q6h', started: 'Yesterday', next: 'As needed', prescriber: clinicianName, nurse: '—', status: 'PRN' },
    { name: 'IV Ceftriaxone', dose: '50 mg/kg', route: 'IV', freq: 'q12h', started: 'Today', next: '20:00', prescriber: clinicianName, nurse: '—', status: 'Pending' },
  ]
  return (
    <div>
      <div style={S.secTitle}>Medications</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeMeds.map(med => (
          <div key={med.name} style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{med.name}</span>
                <span style={{ fontSize: 11, color: C.textLight, marginLeft: 8 }}>{med.dose}</span>
              </div>
              <span style={{ fontSize: 11, color: med.status === 'Administered' ? C.green : med.status === 'Infusing' ? C.sky : med.status === 'PRN' ? C.amber : C.textLight, fontWeight: 600 }}>{med.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 11, color: C.textLight }}>
              <div>Route: <strong style={{ color: C.text }}>{med.route}</strong></div>
              <div>Frequency: <strong style={{ color: C.text }}>{med.freq}</strong></div>
              <div>Next dose: <strong style={{ color: C.text }}>{med.next}</strong></div>
              <div>Prescriber: <strong style={{ color: C.text }}>{med.prescriber}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultsView({ state }: { state: EncounterOrchestratorState }) {
  const results = [
    { name: 'Hemoglobin', value: '6.5', unit: 'g/dL', flag: 'Critical Low', range: '11.5-15.5', color: C.red },
    { name: 'WBC', value: '8.2', unit: '×10³/μL', flag: 'Normal', range: '4.0-11.0', color: C.green },
    { name: 'Platelets', value: '160', unit: '×10³/μL', flag: 'Normal', range: '150-450', color: C.green },
    { name: 'Malaria RDT', value: 'Positive', unit: '', flag: 'P. falciparum', range: 'Negative', color: C.red },
    { name: 'Blood Glucose', value: '4.2', unit: 'mmol/L', flag: 'Normal', range: '3.3-5.5', color: C.green },
    { name: 'Creatinine', value: '0.8', unit: 'mg/dL', flag: 'Normal', range: '0.5-1.2', color: C.green },
    { name: 'Sodium', value: '138', unit: 'mmol/L', flag: 'Normal', range: '136-145', color: C.green },
    { name: 'Potassium', value: '3.8', unit: 'mmol/L', flag: 'Normal', range: '3.5-5.1', color: C.green },
  ]
  return (
    <div>
      <div style={S.secTitle}>Laboratory Results</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {results.map(r => (
          <div key={r.name} style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: r.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.textLight, marginBottom: 2 }}>{r.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>
                {r.value}<span style={{ fontSize: 11, fontWeight: 400, color: C.textLight }}> {r.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: r.color, marginTop: 2, fontWeight: 500 }}>{r.flag}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ fontSize: 10, color: C.textLight, textAlign: 'right' }}>
                Range: {r.range}
              </div>
              <button style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.sky}`, background: C.white, color: C.sky, fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Trend → View Graph
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImagingView() {
  const studies = [
    { name: 'Chest X-Ray', status: 'Pending', ordered: 'Today', reason: 'Evaluate for pneumonia' },
    { name: 'Abdominal Ultrasound', status: 'Ordered', ordered: 'Yesterday', reason: 'Hepatomegaly evaluation' },
  ]
  return (
    <div>
      <div style={S.secTitle}>Imaging</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {studies.map(s => (
          <div key={s.name} style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{s.name}</div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: s.status === 'Completed' ? `${C.green}15` : `${C.amber}15`, color: s.status === 'Completed' ? C.green : C.amber, fontWeight: 500 }}>{s.status}</span>
            </div>
            <div style={{ fontSize: 12, color: C.textLight }}>Ordered: {s.ordered} — {s.reason}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonitoringView({ state }: { state: EncounterOrchestratorState }) {
  const vitals = [
    { label: 'Heart Rate', value: String(state.questionEngine.answers['exam_pulse']?.value || '—'), unit: 'bpm' },
    { label: 'Temperature', value: String(state.questionEngine.answers['exam_temp']?.value || '—'), unit: '°C' },
    { label: 'Respiratory Rate', value: String(state.questionEngine.answers['exam_rr']?.value || '—'), unit: '/min' },
    { label: 'O2 Saturation', value: String(state.questionEngine.answers['exam_o2_sat']?.value || '—'), unit: '%' },
  ]
  const obs = [
    { time: '08:00', temp: 39.2, hr: 158, rr: 42, spo2: 97, bp: '90/60' },
    { time: '10:00', temp: 38.5, hr: 142, rr: 36, spo2: 98, bp: '92/62' },
    { time: '12:00', temp: 37.8, hr: 130, rr: 32, spo2: 98, bp: '95/65' },
  ]
  return (
    <div>
      <div style={S.secTitle}>Monitoring</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {vitals.map(v => (
          <div key={v.label} style={{ padding: 20, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.navy }}>
              {String(v.value)}<span style={{ fontSize: 13, color: C.textLight, fontWeight: 400 }}> {v.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{v.label}</div>
          </div>
        ))}
      </div>

      <div style={S.secTitle}>Vital Signs Trend</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 8 }}>Temperature °C</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={obs}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.panel} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: C.textLight }} />
              <YAxis domain={[36, 40]} tick={{ fontSize: 10, fill: C.textLight }} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke={C.red} strokeWidth={2} dot={{ r: 3, fill: C.red }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: C.navy, fontWeight: 600, marginBottom: 8 }}>Pulse bpm</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={obs}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.panel} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: C.textLight }} />
              <YAxis domain={[120, 170]} tick={{ fontSize: 10, fill: C.textLight }} />
              <Tooltip />
              <Line type="monotone" dataKey="hr" stroke={C.sky} strokeWidth={2} dot={{ r: 3, fill: C.sky }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: C.purple, fontWeight: 600, marginBottom: 8 }}>Respiratory Rate /min</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={obs}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.panel} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: C.textLight }} />
              <YAxis domain={[25, 50]} tick={{ fontSize: 10, fill: C.textLight }} />
              <Tooltip />
              <Line type="monotone" dataKey="rr" stroke={C.purple} strokeWidth={2} dot={{ r: 3, fill: C.purple }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function NotesView({ state, clinicianName }: { state: EncounterOrchestratorState; clinicianName: string }) {
  const notes = [
    { title: 'Admission Note', date: 'Today 08:35', author: clinicianName, status: 'Completed' },
    { title: 'Progress Note', date: 'Today 12:00', author: clinicianName, status: 'Draft' },
    { title: 'Nursing Note', date: 'Today 10:30', author: 'Nurse Mary', status: 'Completed' },
  ]
  return (
    <div>
      <div style={S.secTitle}>Clinical Notes</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notes.map(n => (
          <div key={n.title} style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{n.title}</span>
              <span style={{ fontSize: 11, color: n.status === 'Completed' ? C.green : C.amber, fontWeight: 500 }}>{n.status}</span>
            </div>
            <div style={{ fontSize: 12, color: C.textLight }}>{n.author} · {n.date}</div>
          </div>
        ))}
      </div>
      <button style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 13, cursor: 'pointer' }}>+ Write New Note</button>
    </div>
  )
}

function DocumentsView({ state }: { state: EncounterOrchestratorState }) {
  return (
    <div>
      <div style={S.secTitle}>Clinical Documents</div>
      <div style={{ padding: 16, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>History of Presenting Illness</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: C.navy, whiteSpace: 'pre-wrap' }}>{state.hpiNarrative || 'Not yet generated'}</div>
      </div>
      <div style={{ padding: 16, borderRadius: 10, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Problem List</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: C.navy }}>{state.problemList.length > 0 ? state.problemList.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') : 'None'}</div>
      </div>
      <div style={{ padding: 16, borderRadius: 10, background: C.panel, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Differential Diagnoses</div>
        {state.differentials.length > 0 ? state.differentials.map((d: any, i: number) => (
          <div key={i} style={{ fontSize: 13, color: C.navy, marginBottom: 4 }}>{d.rank}. {d.diseaseName} ({d.probability}%)</div>
        )) : <div style={{ fontSize: 13, color: C.textLight }}>None</div>}
      </div>
    </div>
  )
}

function CommunicationView({ clinicianName }: { clinicianName: string }) {
  const [chatMsg, setChatMsg] = useState('')
  const [acceptedTasks, setAcceptedTasks] = useState<string[]>([])
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const toggleAccept = (i: number) => setAcceptedTasks(prev => prev.includes(String(i)) ? prev.filter(x => x !== String(i)) : [...prev, String(i)])
  const toggleComplete = (i: number) => setCompletedTasks(prev => prev.includes(String(i)) ? prev.filter(x => x !== String(i)) : [...prev, String(i)])
  const messages = CHAT_MESSAGES.map(m => !m.from || m.from === 'Dr. Methu' ? { ...m, from: clinicianName || 'Dr. Methu' } : m)
  return (
    <div>
      <div style={S.secTitle}>Team Communication</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 16, maxHeight: 400, overflow: 'auto' }}>
        {messages.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < messages.length - 1 ? `1px solid ${C.panel}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.from === clinicianName ? C.sky : c.from === 'Nurse Mary' ? C.green : C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {c.from.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{c.from}</span>
                <span style={{ fontSize: 10, color: C.textLight }}>{c.role}</span>
                <span style={{ fontSize: 10, color: C.textLight }}>· {c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{c.msg}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {c.role === 'Consultant' && (
                  <button onClick={() => toggleAccept(i)}
                    style={{ padding: '3px 10px', borderRadius: 4, border: acceptedTasks.includes(String(i)) ? `1px solid ${C.green}` : `1px solid ${C.border}`, background: acceptedTasks.includes(String(i)) ? `${C.green}15` : C.white, color: acceptedTasks.includes(String(i)) ? C.green : C.text, fontSize: 10, cursor: 'pointer', fontWeight: acceptedTasks.includes(String(i)) ? 600 : 400 }}>
                    {acceptedTasks.includes(String(i)) ? '✓ Accepted' : 'Accept'}
                  </button>
                )}
                <button onClick={() => toggleComplete(i)}
                  style={{ padding: '3px 10px', borderRadius: 4, border: completedTasks.includes(String(i)) ? `1px solid ${C.green}` : `1px solid ${C.border}`, background: completedTasks.includes(String(i)) ? `${C.green}15` : C.white, color: completedTasks.includes(String(i)) ? C.green : C.text, fontSize: 10, cursor: 'pointer', fontWeight: completedTasks.includes(String(i)) ? 600 : 400 }}>
                  {completedTasks.includes(String(i)) ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }}
          placeholder="Type a message…" value={chatMsg} onChange={e => setChatMsg(e.target.value)} />
        <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  )
}

function AnalyticsView({ state }: { state: EncounterOrchestratorState }) {
  const stats = [
    { label: 'Encounter Duration', value: '6h 12m' },
    { label: 'Questions Answered', value: `${Object.keys(state.questionEngine.answers).length}` },
    { label: 'Differentials Generated', value: `${state.differentials.length}` },
    { label: 'Management Actions', value: `${state.managementPlan.length}` },
    { label: 'Red Flags', value: `${state.redFlags.length}` },
    { label: 'Timeline Events', value: `${TIMELINE_EVENTS.length}` },
  ]
  return (
    <div>
      <div style={S.secTitle}>Encounter Analytics</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ padding: 20, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.sky }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
