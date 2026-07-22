'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  LayoutDashboard, Users, AlertTriangle, Clock, Activity,
  Stethoscope, Footprints, Calendar, Monitor, Scissors, Video,
  FileText, ChevronRight, Brain, Bell, MessageSquare, Search,
  ArrowRight, Plus, Heart, Settings, LogOut, Bed,
} from 'lucide-react'

type WorkspaceTab = 'dashboard' | 'patients' | 'rounds' | 'orders' | 'results' | 'notes' | 'team'

export default function DoctorWorkspacePage() {
  const router = useRouter()
  const [tab, setTab] = useState<WorkspaceTab>('dashboard')

  const tabs: { id: WorkspaceTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'rounds', label: 'Ward Round', icon: Footprints },
    { id: 'orders', label: 'Orders', icon: Activity },
    { id: 'results', label: 'Results', icon: FileText },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'team', label: 'Care Team', icon: Users },
  ]

  const stats = [
    { label: 'Active Patients', value: 8, color: C.sky, icon: Users },
    { label: 'Critical', value: 2, color: '#EF4444', icon: AlertTriangle },
    { label: 'Pending Reviews', value: 5, color: '#F59E0B', icon: Clock },
    { label: 'Discharge Ready', value: 1, color: '#10B981', icon: Activity },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 14, fontWeight: 700 }}>✦</div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 22, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>CLINICAL WORKSPACE</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2 }}>
          <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={16} color={C.textLight} />
          </button>
          <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={16} color={C.textLight} />
          </button>
        </div>
        <button onClick={() => router.push('/doctor')}
          style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight, fontFamily: "'Inter', sans-serif" }}>
          ← Dashboard
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Nav */}
        <nav style={{ width: 200, background: C.white, borderRight: `1px solid ${C.border}`, padding: '12px 8px', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px 10px' }}>Workspace</div>
          {tabs.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none',
                  background: active ? C.skyLight : 'transparent',
                  color: active ? C.sky : C.text, fontSize: 12, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', marginBottom: 2,
                }}>
                <Icon size={15} />
                {t.label}
              </button>
            )
          })}

          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 8px', paddingTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px 8px' }}>Quick Links</div>
            {[
              { label: 'ADOS Mode', path: '/doctor-ados', icon: Brain, color: C.sky },
              { label: 'Emergency', path: '/doctor/emergency', icon: AlertTriangle, color: '#EF4444' },
              { label: 'ICU', path: '/doctor/icu', icon: Monitor, color: '#F59E0B' },
              { label: 'Theatre', path: '/doctor/theatre', icon: Scissors, color: '#10B981' },
              { label: 'Clinic', path: '/doctor/clinic', icon: Calendar, color: '#8B5CF6' },
              { label: 'Telemedicine', path: '/doctor/telemedicine', icon: Video, color: '#14B8A6' },
            ].map(link => {
              const Icon = link.icon
              return (
                <button key={link.label} onClick={() => router.push(link.path)}
                  style={{
                    width: '100%', padding: '6px 12px', borderRadius: 6, border: 'none',
                    background: 'transparent', color: C.text, fontSize: 11,
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', marginBottom: 1,
                  }}>
                  <Icon size={13} color={link.color} />
                  {link.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} style={{
                  background: C.white, borderRadius: 12, border: `1px solid ${C.border}`,
                  borderTop: `3px solid ${s.color}`, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={s.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Context Menu */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Brain size={18} color={C.sky} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Doctor Operating System (ADOS)</span>
              <span style={{ fontSize: 10, color: C.textLight, marginLeft: 'auto' }}>Context-Aware Workspace</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: Footprints, label: 'Ward Round', path: '/doctor-ados', desc: 'Full ADOS with ward round workflow', color: C.sky },
                { icon: AlertTriangle, label: 'Emergency', path: '/doctor/emergency', desc: 'Resus, Trauma, Stroke, STEMI', color: '#EF4444' },
                { icon: Monitor, label: 'ICU', path: '/doctor/icu', desc: 'Ventilated patients, ABGs, Pressors', color: '#F59E0B' },
                { icon: Scissors, label: 'Theatre', path: '/doctor/theatre', desc: 'Surgical list, checklist, recovery', color: '#10B981' },
                { icon: Calendar, label: 'Clinic', path: '/doctor/clinic', desc: 'Appointments, prescriptions, follow-up', color: '#8B5CF6' },
                { icon: Video, label: 'Telemedicine', path: '/doctor/telemedicine', desc: 'Video calls, ePrescribe, certificates', color: '#14B8A6' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <button key={item.label} onClick={() => router.push(item.path)}
                    style={{
                      padding: 16, borderRadius: 12, border: `1px solid ${C.border}`,
                      background: C.panel, cursor: 'pointer', textAlign: 'left',
                      fontFamily: "'Inter', sans-serif", transition: 'all 0.12s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={item.color} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{item.label}</span>
                    </div>
                    <p style={{ fontSize: 11, color: C.textLight, margin: 0 }}>{item.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/doctor/ward-round')}
                style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: C.sky, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <Footprints size={15} /> Start Ward Round
              </button>
              <button onClick={() => router.push('/doctor-ados')}
                style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={15} color={C.sky} /> ADOS Mode
              </button>
              <button onClick={() => router.push('/doctor/emergency')}
                style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#EF4444', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} /> Emergency
              </button>
              <button onClick={() => router.push('/doctor/clinic')}
                style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} /> Clinic
              </button>
              <button onClick={() => router.push('/doctor/icu')}
                style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <Monitor size={15} /> ICU
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
