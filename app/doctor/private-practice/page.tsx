'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  Stethoscope, Users, Clock, Calendar, FileText, Pill, Beaker,
  Activity, AlertTriangle, CheckCircle, Search, Plus, ArrowRight,
  MessageSquare, Video, BarChart3, Settings, LogOut, DollarSign,
  TrendingUp, CalendarClock, User, ChevronRight, Brain,
} from 'lucide-react'

interface PrivatePatient {
  id: string; name: string; age: string; lastVisit: string; nextAppt: string; diagnosis: string; status: string
}

const PRIVATE_PATIENTS: PrivatePatient[] = [
  { id: 'pp_001', name: 'Grace Wanjiku', age: '45 F', lastVisit: '5 Jul 2026', nextAppt: '19 Jul 2026', diagnosis: 'Type 2 DM, Hypertension', status: 'active' },
  { id: 'pp_002', name: 'Samuel Ochieng', age: '35 M', lastVisit: '2 Jul 2026', nextAppt: '16 Jul 2026', diagnosis: 'Hypertension', status: 'active' },
  { id: 'pp_003', name: 'Nancy Wambui', age: '28 F', lastVisit: '28 Jun 2026', nextAppt: '26 Jul 2026', diagnosis: 'Pregnancy (34w)', status: 'active' },
  { id: 'pp_004', name: 'Peter Kiprop', age: '55 M', lastVisit: '10 Jul 2026', nextAppt: '-', diagnosis: 'Post-op Inguinal Hernia', status: 'follow-up' },
  { id: 'pp_005', name: 'Faith Chebet', age: '62 F', lastVisit: '20 Jun 2026', nextAppt: '15 Jul 2026', diagnosis: 'Rheumatoid Arthritis', status: 'active' },
]

export default function PrivatePracticePage() {
  const router = useRouter()
  const [tab, setTab] = useState<'dashboard' | 'patients' | 'appointments' | 'billing' | 'ai'>('dashboard')

  const StatCard = ({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
    <div style={{ padding: '16px 20px', borderRadius: 12, background: C.white, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{value}</div>
        <div style={{ fontSize: 11, color: C.textLight }}>{label}</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Stethoscope size={18} color={C.sky} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>PRIVATE PRACTICE</span>
        <span style={{ fontSize: 12, color: C.textLight }}>Dr. James Mwangi · Consultant Physician</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight }}>← Dashboard</button>
      </header>

      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, padding: '0 24px', background: C.white }}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: Activity },
          { key: 'patients', label: 'My Patients', icon: Users },
          { key: 'appointments', label: 'Appointments', icon: CalendarClock },
          { key: 'billing', label: 'Invoices', icon: DollarSign },
          { key: 'ai', label: 'AI Assistant', icon: Brain },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.key ? C.sky : 'transparent'}`, background: 'transparent', color: tab === t.key ? C.sky : C.textLight, fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {tab === 'dashboard' && (
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Good Morning, Dr. James</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              <StatCard icon={<Users size={20} color={C.sky} />} label="Active Patients" value={String(PRIVATE_PATIENTS.filter(p => p.status === 'active').length)} color={C.sky} />
              <StatCard icon={<CalendarClock size={20} color={C.green} />} label="Today's Appointments" value="4" color={C.green} />
              <StatCard icon={<Video size={20} color={C.sky} />} label="Telemedicine Today" value="2" color={C.sky} />
              <StatCard icon={<DollarSign size={20} color={C.amber} />} label="Pending Invoices" value="$1,240" color={C.amber} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Today's Schedule</div>
                {[
                  { time: '09:00', patient: 'Grace Wanjiku', type: 'Clinic Visit', status: 'checked_in' },
                  { time: '10:00', patient: 'Samuel Ochieng', type: 'Video Call', status: 'confirmed' },
                  { time: '11:00', patient: 'Nancy Wambui', type: 'Home Visit', status: 'scheduled' },
                  { time: '14:00', patient: 'Faith Chebet', type: 'Clinic Visit', status: 'scheduled' },
                ].map((appt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: appt.status === 'checked_in' ? C.skyLight : 'transparent', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, minWidth: 50 }}>{appt.time}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text, flex: 1 }}>{appt.patient}</div>
                    <span style={{ fontSize: 10, color: C.textLight }}>{appt.type}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: appt.status === 'checked_in' ? '#F0FDF4' : '#F1F5F9', color: appt.status === 'checked_in' ? C.green : C.textLight }}>{appt.status}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Quick Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> New Patient</button>
                  <button style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}><Video size={14} /> Start Teleconsult</button>
                  <button style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}><FileText size={14} /> Pending Notes</button>
                  <button style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}><Pill size={14} /> E-Prescriptions</button>
                  <button style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}><Beaker size={14} /> Lab Results</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'patients' && (
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Users size={18} color={C.textLight} />
              <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>My Patients</span>
              <div style={{ position: 'relative', marginLeft: 'auto' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: C.textLight }} />
                <input style={{ width: 240, height: 32, padding: '0 10px 0 30px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, background: C.white, outline: 'none', fontFamily: "'Inter', sans-serif" }} placeholder="Search patients..." />
              </div>
              <button style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: C.sky, color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> New</button>
            </div>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              {PRIVATE_PATIENTS.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, borderBottom: `1px solid ${C.panel}`, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 16, fontWeight: 600 }}>{p.name.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name} · {p.age}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{p.diagnosis}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11 }}>
                    <div style={{ color: C.textLight }}>Last: {p.lastVisit}</div>
                    <div style={{ color: C.sky, fontWeight: 500 }}>Next: {p.nextAppt}</div>
                  </div>
                  <ChevronRight size={14} color={C.textLight} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Brain size={22} color={C.sky} />
                <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>AI Clinical Assistant</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <textarea placeholder="Ask anything: summarize a chart, suggest differentials, recommend investigations, draft a referral..."
                  style={{ width: '100%', minHeight: 100, padding: 14, borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical', background: C.panel }} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  'Summarize recent labs',
                  'Draft referral letter',
                  'Suggest differentials',
                  'Check drug interactions',
                  'Calculate eGFR/CKD-EPI',
                  'Generate patient summary',
                ].map(s => (
                  <button key={s} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'billing' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, textAlign: 'center' }}>
              <DollarSign size={48} color={C.textLight} />
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 12 }}>Private Practice Invoicing</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>Consultation fees, insurance claims, and payment tracking.</div>
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, textAlign: 'center' }}>
              <CalendarClock size={48} color={C.textLight} />
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 12 }}>Appointment Management</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>Schedule, reschedule, and manage patient appointments.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
