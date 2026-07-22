'use client'
import { useState } from 'react'
import { UserPlus, Search, ClipboardList, Bed, ArrowRightLeft, LogOut, Send, Heart, Activity, Thermometer, Droplets, Weight, AlertTriangle, Clock, User, Users, Phone, MapPin, Shield, CheckCircle, XCircle, Eye, ChevronRight, Menu, Bell, Stethoscope, Ambulance, Hospital, Building, Calendar, FileText, BookOpen, Plus, Filter, MoreHorizontal, type LucideIcon } from 'lucide-react'
import { C } from '@/lib/colors';

const S = {
  page: { minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' as const },
  topBar: { height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 },
  logoText: { fontSize: 14, fontWeight: 700, color: C.navy },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftNav: { width: 220, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' as const, padding: '12px 8px', gap: 1, flexShrink: 0, overflow: 'auto' },
  navItem: (a: boolean) => ({ padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: a ? 600 : 400, color: a ? C.sky : C.text, background: a ? C.skyLight : 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const }),
  main: { flex: 1, overflow: 'auto', padding: 20 },
  card: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  cardH: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.1s' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  label: { fontSize: 11, fontWeight: 500, color: C.text, marginBottom: 4, display: 'block' },
  input: { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.panel, outline: 'none', fontFamily: "'Inter', sans-serif" } as any,
  sel: { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.panel, outline: 'none', fontFamily: "'Inter', sans-serif", cursor: 'pointer' },
  btn: (c: string) => ({ padding: '8px 20px', borderRadius: 8, border: 'none', background: c, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }),
  btnO: { padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  badge: (c: string) => ({ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
  pill: (c: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: `${c}15`, color: c }),
}

interface Patient {
  id: string; name: string; age: string; sex: string; mrn: string; mode: string; triage: string; status: string; bed?: string; ward?: string; doctor?: string; arrival: string; emergency: boolean
}

const MODES = ['Walk-in', 'Ambulance', 'Referral', 'Transfer']
const TRIAGE_COLORS: Record<string, string> = { RED: C.red, ORANGE: C.amber, YELLOW: C.amber, GREEN: C.green }
const BED_STATES = ['Available', 'Reserved', 'Occupied', 'Isolation', 'Cleaning', 'Maintenance']

const WARDS = ['Medical Ward I', 'Medical Ward II', 'Medical Ward III', 'Pediatrics', 'Surgical Ward', 'ICU', 'Maternity', 'NICU']

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'arrival', label: 'Arrival Desk', icon: UserPlus },
  { id: 'registration', label: 'Registration', icon: ClipboardList },
  { id: 'triage', label: 'Triage', icon: Activity },
  { id: 'queue', label: 'Waiting Queue', icon: Users },
  { id: 'bed-board', label: 'Bed Board', icon: Bed },
  { id: 'admission', label: 'Admissions', icon: Hospital },
  { id: 'transfer', label: 'Transfers', icon: ArrowRightLeft },
  { id: 'discharge', label: 'Discharge', icon: LogOut },
  { id: 'referral', label: 'Referral', icon: Send },
  { id: 'death', label: 'Death Workflow', icon: Heart },
]

const WORKSPACE_LINKS = [
  { label: 'Doctor Dashboard', href: '/doctor' },
  { label: 'Nurse Workspace', href: '/nurse' },
  { label: 'Lab Workspace', href: '/laboratory' },
  { label: 'Pharmacy', href: '/pharmacy' },
  { label: 'Radiology', href: '/radiology' },
  { label: 'Theatre', href: '/theatre' },
  { label: 'ICU', href: '/icu' },
  { label: 'Emergency', href: '/emergency' },
  { label: 'Diabetes', href: '/diabetes' },
  { label: 'Hypertension', href: '/hypertension' },
  { label: 'Heart Failure', href: '/hf' },
  { label: 'CKD', href: '/ckd' },
  { label: 'Respiratory', href: '/respiratory' },
  { label: 'Sickle Cell', href: '/sickle-cell' },
  { label: 'HIV', href: '/hiv' },
  { label: 'Oncology', href: '/oncology' },
  { label: 'Neurology', href: '/neurology' },
  { label: 'Mental Health', href: '/mental-health' },
  { label: "Women's Health", href: '/womens-health' },
  { label: 'Antenatal', href: '/antenatal' },
]

function generateId() { return `KTRH-${Date.now().toString(36).toUpperCase()}` }

export default function PMEPage() {
  const [tab, setTab] = useState('arrival')
  const [patients, setPatients] = useState<Patient[]>([
    { id: generateId(), name: 'James Mwangi', age: '2', sex: 'Male', mrn: 'KTRH-2026-0124', mode: 'Ambulance', triage: 'RED', status: 'In ER', bed: '12', ward: 'Medical Ward III', doctor: 'Dr. Methu', arrival: '07:45', emergency: true },
    { id: generateId(), name: 'Amina Hassan', age: '45', sex: 'Female', mrn: 'KTRH-2026-0089', mode: 'Walk-in', triage: 'YELLOW', status: 'Waiting', arrival: '08:12', emergency: false },
    { id: generateId(), name: 'Peter Otieno', age: '67', sex: 'Male', mrn: 'KTRH-2026-0156', mode: 'Referral', triage: 'ORANGE', status: 'Triage', arrival: '08:30', emergency: true },
    { id: generateId(), name: 'Grace Wanjiku', age: '30', sex: 'Female', mrn: 'KTRH-2026-0189', mode: 'Walk-in', triage: 'GREEN', status: 'Registered', arrival: '08:45', emergency: false },
    { id: generateId(), name: 'Unknown Male', age: '~35', sex: 'Male', mrn: 'UNK-2026-001', mode: 'Ambulance', triage: 'RED', status: 'Resuscitation', doctor: 'Dr. Kamau', arrival: '09:05', emergency: true },
  ])

  const [newArrival, setNewArrival] = useState({ name: '', age: '', sex: 'Male', mode: 'Walk-in', emergency: false })
  const [searchQ, setSearchQ] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [transferPatient, setTransferPatient] = useState('')
  const [transferWard, setTransferWard] = useState('')
  const [referralNotes, setReferralNotes] = useState('')

  const filtered = patients.filter(p => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.mrn.toLowerCase().includes(searchQ.toLowerCase()))

  const handleArrival = () => {
    if (!newArrival.name.trim() && !newArrival.emergency) return
    const p: Patient = {
      id: generateId(), name: newArrival.name.trim() || `Unknown ${newArrival.sex} ${Date.now().toString().slice(-3)}`,
      age: newArrival.age || '~?', sex: newArrival.sex, mrn: newArrival.emergency ? `UNK-${Date.now().toString(36).toUpperCase()}` : generateId(),
      mode: newArrival.mode, triage: 'GREEN', status: 'Arrived', arrival: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }), emergency: newArrival.emergency,
    }
    setPatients(prev => [p, ...prev])
    setNewArrival({ name: '', age: '', sex: 'Male', mode: 'Walk-in', emergency: false })
  }

  const updateStatus = (id: string, status: string, extra?: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status, ...extra } : p))
  }

  const handleTransfer = () => {
    if (!transferPatient || !transferWard) return
    updateStatus(transferPatient, 'Transferred', { ward: transferWard })
    setTransferPatient(''); setTransferWard('')
  }

  const beds = Array.from({ length: 24 }, (_, i) => {
    const num = i + 1
    const wardIdx = Math.floor(i / 4)
    const occupant = patients.find(p => p.bed === String(num) && p.status !== 'Discharged')
    return { bed: String(num).padStart(2, '0'), ward: WARDS[wardIdx % WARDS.length], room: Math.ceil(num / 2), status: occupant ? 'Occupied' : (i % 6 === 0 ? 'Cleaning' : 'Available') as string, patient: occupant }
  })

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12, fontWeight: 700 }}>✦</div>
        <div style={S.logoText}>AMEXAN</div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ fontSize: 12, color: C.text }}>Patient Movement Engine</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: C.textLight }}>{patients.length} patients · {patients.filter(p => p.status === 'Discharged').length} discharged</div>
      </header>

      <div style={S.body}>
        <nav style={S.leftNav}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase' }}>Patient Movement</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id} style={S.navItem(tab === item.id)} onClick={() => setTab(item.id)}>
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: '0.06em', padding: '6px 12px 8px', textTransform: 'uppercase', marginTop: 8 }}>Other Workspaces</div>
          {WORKSPACE_LINKS.map(w => (
            <a key={w.label} href={w.href} style={{ ...S.navItem(false), textDecoration: 'none' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>▸</span>
              {w.label}
            </a>
          ))}
        </nav>

        <main style={S.main}>
          {/* ─── ARRIVAL DESK ─── */}
          {tab === 'arrival' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Arrival Desk</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Record every patient entering the hospital</div>
                </div>
              </div>
              <div style={{ ...S.card, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>New Arrival</div>
                <div style={S.grid3}>
                  <div>
                    <label style={S.label}>Full Name <span style={{ color: C.textLight }}>(or leave blank for unknown)</span></label>
                    <input style={S.input} placeholder="e.g. John Kamau" value={newArrival.name} onChange={e => setNewArrival(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={S.label}>Age <span style={{ color: C.textLight }}>(estimate if unknown)</span></label>
                    <input style={S.input} placeholder="e.g. 35" value={newArrival.age} onChange={e => setNewArrival(prev => ({ ...prev, age: e.target.value }))} />
                  </div>
                  <div>
                    <label style={S.label}>Sex</label>
                    <select style={S.sel} value={newArrival.sex} onChange={e => setNewArrival(prev => ({ ...prev, sex: e.target.value }))}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Arrival Mode</label>
                    <select style={S.sel} value={newArrival.mode} onChange={e => setNewArrival(prev => ({ ...prev, mode: e.target.value }))}>
                      {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>&nbsp;</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.text, cursor: 'pointer' }}>
                      <input type="checkbox" checked={newArrival.emergency} onChange={e => setNewArrival(prev => ({ ...prev, emergency: e.target.checked }))} style={{ accentColor: C.sky }} />
                      🚨 Emergency — issue temporary ID
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button style={S.btn(C.sky)} onClick={handleArrival}>
                      <UserPlus size={14} style={{ marginRight: 6 }} />
                      Register Arrival
                    </button>
                  </div>
                </div>
              </div>

              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Today's Arrivals</div>
                  <input style={{ ...S.input, maxWidth: 240 }} placeholder="Search arrivals..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, fontSize: 12, color: C.textLight }}>No arrivals recorded yet</div>
                  ) : (
                    filtered.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.skyLight; e.currentTarget.style.borderColor = C.sky }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.border }}
                        onClick={() => setSelectedPatient(p)}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.emergency ? C.red : C.green, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>{p.mrn} · {p.age} {p.sex} · {p.mode} · {p.arrival}</div>
                        </div>
                        <span style={S.pill(TRIAGE_COLORS[p.triage] || C.textLight)}>{p.triage}</span>
                        <span style={S.pill(p.status === 'Arrived' ? C.sky : p.status === 'Triage' ? C.amber : C.textLight)}>{p.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── REGISTRATION ─── */}
          {tab === 'registration' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Registration Workspace</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Complete demographic records</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Search Existing Records</div>
                  <input style={S.input} placeholder="Search by name, MRN, phone, ID..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filtered.filter(p => p.status !== 'Arrived').map(p => (
                      <div key={p.id} style={{ padding: '8px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 12 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.sky }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border }}>
                        <div style={{ fontWeight: 600, color: C.navy }}>{p.name}</div>
                        <div style={{ color: C.textLight }}>{p.mrn} · {p.age} {p.sex}</div>
                      </div>
                    ))}
                    {filtered.filter(p => p.status !== 'Arrived').length === 0 && (
                      <div style={{ fontSize: 11, color: C.textLight, padding: 8 }}>No existing records match</div>
                    )}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Demographic Record</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.grid2}>
                      <div><label style={S.label}>Full Name</label><input style={S.input} placeholder="Full name" /></div>
                      <div><label style={S.label}>Date of Birth</label><input style={S.input} type="date" /></div>
                    </div>
                    <div style={S.grid2}>
                      <div><label style={S.label}>Sex</label><select style={S.sel}><option>Male</option><option>Female</option></select></div>
                      <div><label style={S.label}>National ID / Passport</label><input style={S.input} placeholder="ID number" /></div>
                    </div>
                    <div><label style={S.label}>Contact Phone</label><input style={S.input} placeholder="+254 7XX XXX XXX" /></div>
                    <div><label style={S.label}>Next of Kin</label><input style={S.input} placeholder="Name · Relationship · Phone" /></div>
                    <div style={S.grid2}>
                      <div><label style={S.label}>Insurance / Payment</label><select style={S.sel}><option>NHIF</option><option>Private Insurance</option><option>Cash</option><option>Other</option></select></div>
                      <div><label style={S.label}>Referring Facility</label><input style={S.input} placeholder="If referred" /></div>
                    </div>
                    <div><label style={S.label}>Preferred Language</label><select style={S.sel}><option>English</option><option>Kiswahili</option><option>Dholuo</option><option>Kikuyu</option><option>Other</option></select></div>
                    <button style={S.btn(C.sky)}>Save & Continue to Triage</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TRIAGE ─── */}
          {tab === 'triage' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Triage Workspace</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Speed-focused acuity assessment</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Patient Queue</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filtered.filter(p => p.status === 'Arrived' || p.status === 'Registered').map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                        onClick={() => setSelectedPatient(p)}>
                        <span style={S.pill(C.sky)}>{p.status}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, flex: 1 }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: C.textLight }}>{p.age} {p.sex} · {p.arrival}</span>
                      </div>
                    ))}
                    {filtered.filter(p => p.status === 'Arrived' || p.status === 'Registered').length === 0 && (
                      <div style={{ fontSize: 11, color: C.textLight, padding: 12, textAlign: 'center' }}>No patients waiting for triage</div>
                    )}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Triage Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: 8, background: C.panel, borderRadius: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Selected: {selectedPatient?.name || 'None'}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{selectedPatient?.mrn || '—'} · {selectedPatient?.age || '—'} {selectedPatient?.sex || '—'}</div>
                    </div>
                    <div><label style={S.label}>Chief Complaint</label><input style={S.input} placeholder="Short free-text description" /></div>
                    <div style={S.grid3}>
                      <div><label style={S.label}>Temp (°C)</label><input style={S.input} placeholder="36.5" /></div>
                      <div><label style={S.label}>Pulse /min</label><input style={S.input} placeholder="80" /></div>
                      <div><label style={S.label}>RR /min</label><input style={S.input} placeholder="18" /></div>
                      <div><label style={S.label}>BP Systolic</label><input style={S.input} placeholder="120" /></div>
                      <div><label style={S.label}>BP Diastolic</label><input style={S.input} placeholder="80" /></div>
                      <div><label style={S.label}>SpO₂ %</label><input style={S.input} placeholder="98" /></div>
                      <div><label style={S.label}>Weight (kg)</label><input style={S.input} placeholder="70" /></div>
                      <div><label style={S.label}>Pain Score</label><select style={S.sel}><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></div>
                      <div><label style={S.label}>Consciousness</label><select style={S.sel}><option>Alert</option><option>Voice</option><option>Pain</option><option>Unresponsive</option></select></div>
                    </div>
                    <div style={S.grid2}>
                      <div><label style={S.label}>Allergies</label><input style={S.input} placeholder="None known" /></div>
                      <div><label style={S.label}>Pregnancy Status</label><select style={S.sel}><option>N/A</option><option>Not pregnant</option><option>Pregnant</option><option>Unknown</option></select></div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>Assign Priority:</span>
                      {['RED', 'ORANGE', 'YELLOW', 'GREEN'].map(t => (
                        <button key={t} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: `${TRIAGE_COLORS[t]}20`, color: TRIAGE_COLORS[t], fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
                      ))}
                    </div>
                    <button style={S.btn(C.sky)}>Complete Triage → Send to Queue</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── WAITING QUEUE ─── */}
          {tab === 'queue' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Waiting Queue</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Living operational view of every queue in the hospital</div>
                </div>
              </div>
              <div style={S.grid4}>
                {[
                  { title: 'Emergency', icon: Activity, color: C.red, items: patients.filter(p => p.triage === 'RED' && p.status !== 'Discharged') },
                  { title: 'OPD', icon: Users, color: C.sky, items: patients.filter(p => p.triage === 'GREEN' && p.status !== 'Discharged') },
                  { title: 'Radiology', icon: Search, color: C.purple, items: patients.filter(p => p.status === 'Awaiting Imaging') },
                  { title: 'Theatre', icon: Stethoscope, color: C.amber, items: patients.filter(p => p.status === 'Scheduled Theatre') },
                ].map(q => (
                  <div key={q.title} style={S.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <q.icon size={16} color={q.color} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{q.title}</div>
                      <span style={S.badge(q.color)}>{q.items.length}</span>
                    </div>
                    {q.items.length === 0 ? (
                      <div style={{ fontSize: 11, color: C.textLight, padding: 8, textAlign: 'center' }}>Empty</div>
                    ) : (
                      q.items.map(p => (
                        <div key={p.id} style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panel}`, fontSize: 11 }}>
                          <div style={{ fontWeight: 600, color: C.navy }}>{p.name}</div>
                          <div style={{ color: C.textLight }}>{p.triage} · {p.arrival}</div>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>All Queues</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: C.textLight, fontWeight: 500 }}>Queue</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: C.textLight, fontWeight: 500 }}>Waiting</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: C.textLight, fontWeight: 500 }}>In Progress</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: C.textLight, fontWeight: 500 }}>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Triage', waiting: '4', prog: '2', done: '18' },
                      { name: 'Emergency', waiting: '2', prog: '3', done: '5' },
                      { name: 'OPD Consultation', waiting: '12', prog: '3', done: '24' },
                      { name: 'Radiology', waiting: '6', prog: '2', done: '9' },
                      { name: 'Theatre', waiting: '3', prog: '1', done: '2' },
                      { name: 'Pharmacy', waiting: '8', prog: '4', done: '15' },
                    ].map(r => (
                      <tr key={r.name} style={{ borderBottom: `1px solid ${C.panel}` }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: C.navy }}>{r.name}</td>
                        <td style={{ padding: '8px 10px', color: C.amber }}>{r.waiting}</td>
                        <td style={{ padding: '8px 10px', color: C.sky }}>{r.prog}</td>
                        <td style={{ padding: '8px 10px', color: C.green }}>{r.done}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── BED BOARD ─── */}
          {tab === 'bed-board' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Bed Board</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Hospital → Building → Floor → Ward → Room → Bed</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={S.pill(C.green)}>{beds.filter(b => b.status === 'Available').length} Available</span>
                  <span style={S.pill(C.red)}>{beds.filter(b => b.status === 'Occupied').length} Occupied</span>
                  <span style={S.pill(C.amber)}>{beds.filter(b => b.status === 'Cleaning').length} Cleaning</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {beds.map(b => (
                  <div key={b.bed} style={{
                    padding: 12, borderRadius: 8, background: b.status === 'Available' ? C.panel : b.status === 'Occupied' ? `${C.red}08` : b.status === 'Cleaning' ? `${C.amber}08` : `${C.textLight}08`,
                    border: `1px solid ${b.status === 'Available' ? C.border : b.status === 'Occupied' ? `${C.red}25` : `${C.amber}25`}`,
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 2 }}>Bed {b.bed}</div>
                    <div style={{ fontSize: 9, color: C.textLight, marginBottom: 4 }}>Rm {b.room} · {b.ward.slice(0, 12)}</div>
                    <span style={S.pill(
                      b.status === 'Available' ? C.green : b.status === 'Occupied' ? C.red : b.status === 'Cleaning' ? C.amber : C.textLight
                    )}>{b.status}</span>
                    {b.patient && (
                      <div style={{ marginTop: 6, fontSize: 10, color: C.navy, fontWeight: 600 }}>{b.patient.name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ADMISSION ─── */}
          {tab === 'admission' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Admissions</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Accept or review pending admissions</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Pending Admission</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {patients.filter(p => p.status === 'Admission Pending').length === 0 ? (
                      <div style={{ fontSize: 11, color: C.textLight, padding: 12, textAlign: 'center' }}>No pending admissions</div>
                    ) : (
                      patients.filter(p => p.status === 'Admission Pending').map(p => (
                        <div key={p.id} style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</div>
                              <div style={{ fontSize: 10, color: C.textLight }}>{p.age} {p.sex} · {p.mrn} · {p.arrival}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={S.btn(C.sky)}>Admit</button>
                              <button style={S.btnO}>Review</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Active Inpatients</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {patients.filter(p => p.status === 'Admitted' || p.status === 'Inpatient').map(p => (
                      <div key={p.id} style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: C.textLight }}>Bed {p.bed} · {p.ward} · Dr. {p.doctor}</div>
                          </div>
                          <span style={S.badge(C.green)}>Admitted</span>
                        </div>
                      </div>
                    ))}
                    {patients.filter(p => p.status === 'Admitted' || p.status === 'Inpatient').length === 0 && (
                      <div style={{ fontSize: 11, color: C.textLight, padding: 12, textAlign: 'center' }}>No active inpatients</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TRANSFER ─── */}
          {tab === 'transfer' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Ward Transfer</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Transfers are events, not edits — complete movement history</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Active Patients</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {patients.filter(p => p.status !== 'Discharged' && p.status !== 'Arrived').map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 12 }}
                        onClick={() => setTransferPatient(p.id)}>
                        <input type="radio" checked={transferPatient === p.id} onChange={() => setTransferPatient(p.id)} style={{ accentColor: C.sky }} />
                        <span style={{ fontWeight: 600, color: C.navy, flex: 1 }}>{p.name}</span>
                        <span style={{ color: C.textLight }}>{p.ward || '—'}</span>
                        <span style={S.badge(p.triage === 'RED' ? C.red : C.textLight)}>{p.triage}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Execute Transfer</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div><label style={S.label}>Transfer to Ward</label>
                      <select style={S.sel} value={transferWard} onChange={e => setTransferWard(e.target.value)}>
                        <option value="">Select ward…</option>
                        {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                    <div><label style={S.label}>Reason for Transfer</label>
                      <select style={S.sel}>
                        <option>Clinical deterioration</option>
                        <option>Step-down care</option>
                        <option>Specialist review</option>
                        <option>Bed availability</option>
                        <option>Infection control</option>
                        <option>Patient request</option>
                      </select>
                    </div>
                    <button style={S.btn(C.sky)} onClick={handleTransfer}>
                      <ArrowRightLeft size={14} style={{ marginRight: 6 }} />
                      Complete Transfer
                    </button>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 8 }}>
                      This records: time, reason, sending team, receiving team. Nothing is overwritten.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── DISCHARGE ─── */}
          {tab === 'discharge' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Discharge Workspace</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Discharge begins before the patient leaves</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Expected Discharges</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {patients.filter(p => p.status === 'Admitted').map(p => (
                      <div key={p.id} style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: C.textLight }}>Bed {p.bed} · {p.ward}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={S.btn(C.amber)}>Mark Expected</button>
                            <button style={S.btn(C.green)}>Discharge Now</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Discharge Checklist</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      'Medication reconciliation complete',
                      'Follow-up appointment scheduled',
                      'Discharge summary finalized',
                      'Patient education completed',
                      'Outstanding investigations reviewed',
                      'Community referrals sent',
                      'Bed marked for cleaning',
                    ].map(item => (
                      <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.text, cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: C.sky }} />
                        {item}
                      </label>
                    ))}
                  </div>
                  <button style={{ ...S.btn(C.green), marginTop: 14, width: '100%' }}>Finalize Discharge</button>
                </div>
              </div>
            </div>
          )}

          {/* ─── REFERRAL ─── */}
          {tab === 'referral' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Referral Workspace</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Internal referrals → task list · External referrals → structured package</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Internal Referrals</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { from: 'Medical Ward III', to: 'Cardiology', patient: 'James Mwangi', reason: 'ECHO requested', urgent: true },
                      { from: 'ICU', to: 'Neurology', patient: 'Amina Hassan', reason: 'CT Brain review', urgent: true },
                      { from: 'OPD', to: 'Orthopedics', patient: 'Peter Otieno', reason: 'Fracture assessment', urgent: false },
                    ].map((r, i) => (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{r.patient} → {r.to}</div>
                            <div style={{ fontSize: 10, color: C.textLight }}>{r.from} · {r.reason}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {r.urgent && <span style={S.pill(C.red)}>URGENT</span>}
                            <button style={S.btn(C.sky)}>Accept</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>New External Referral</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div><label style={S.label}>Patient</label>
                      <select style={S.sel} value={transferPatient} onChange={e => setTransferPatient(e.target.value)}>
                        <option value="">Select patient…</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name} · {p.mrn}</option>)}
                      </select>
                    </div>
                    <div><label style={S.label}>Receiving Facility</label><input style={S.input} placeholder="e.g. Kenyatta National Hospital" /></div>
                    <div><label style={S.label}>Referral Notes</label>
                      <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' as const }} placeholder="Clinical summary, reason for referral, relevant history…" value={referralNotes} onChange={e => setReferralNotes(e.target.value)} />
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>
                      The system will prepare: referral letter, investigation summaries, medication list, imaging reports, and attachments.
                    </div>
                    <button style={S.btn(C.sky)}>
                      <Send size={14} style={{ marginRight: 6 }} />
                      Send Referral Package
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── DEATH WORKFLOW ─── */}
          {tab === 'death' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Death Workflow</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Dignified, documented, auditable</div>
                </div>
              </div>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Record Time of Death</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div><label style={S.label}>Patient</label>
                      <select style={S.sel}>
                        <option value="">Select patient…</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name} · {p.mrn} · {p.ward}</option>)}
                      </select>
                    </div>
                    <div style={S.grid2}>
                      <div><label style={S.label}>Date</label><input style={S.input} type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                      <div><label style={S.label}>Time</label><input style={S.input} type="time" defaultValue={new Date().toTimeString().slice(0, 5)} /></div>
                    </div>
                    <div><label style={S.label}>Certifying Clinician</label><input style={S.input} placeholder="Full name" /></div>
                    <div><label style={S.label}>Cause of Death</label><textarea style={{ ...S.input, minHeight: 60, resize: 'vertical' as const }} placeholder="Immediate cause → underlying cause → contributing conditions" /></div>
                    <button style={S.btn(C.red)}>Record & Lock Encounter</button>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>Automatic Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      'Death certificate workflow initiated',
                      'Bed status → Cleaning',
                      'Active medications closed',
                      'Monitoring tasks closed',
                      'Encounter set to read-only',
                      'Next of kin notification pending',
                      'Medical records notified',
                      'Administration notified',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: C.panel, fontSize: 11, color: C.text }}>
                        <CheckCircle size={14} color={C.green} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
