'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { FlaskConical, Search, Filter, Clock, CheckCircle, AlertCircle, ChevronRight, Brain, TrendingUp, AlertTriangle, Activity, Plus, User, Eye, ArrowRight, Send } from 'lucide-react'

interface LabOrder {
  id: string; patient: string; age: string; test: string; ordered: string; date: string; status: string; priority: string
  result?: string; trend?: 'up' | 'down' | 'stable' | 'new'; flagged?: boolean
}

const orders: LabOrder[] = [
  { id: 'LAB-07842', patient: 'John Mwangi', age: '58 M', test: 'CBC, CRP, Creatinine', ordered: 'Dr. Kamau', date: '12 Jul 2026', status: 'pending', priority: 'urgent' },
  { id: 'LAB-07841', patient: 'Grace Wanjiku', age: '42 F', test: 'HbA1c, Lipid Profile', ordered: 'Dr. Ochieng', date: '12 Jul 2026', status: 'processing', priority: 'routine' },
  { id: 'LAB-07840', patient: 'Samuel Ochieng', age: '35 M', test: 'Blood Culture', ordered: 'Dr. Kamau', date: '11 Jul 2026', status: 'completed', priority: 'urgent', result: 'No growth at 48h', trend: 'stable', flagged: false },
  { id: 'LAB-07839', patient: 'Nancy Wambui', age: '45 F', test: 'U&E, LFT, Glucose', ordered: 'Dr. Mwangi', date: '11 Jul 2026', status: 'completed', priority: 'routine', result: 'K+ 5.2 (high), ALT 65', trend: 'up', flagged: true },
  { id: 'LAB-07838', patient: 'Peter Kiprop', age: '55 M', test: 'Malaria BS, RDT', ordered: 'Dr. Ochieng', date: '10 Jul 2026', status: 'completed', priority: 'routine', result: 'RDT Positive, BS 2%', trend: 'down', flagged: false },
  { id: 'LAB-07843', patient: 'Faith Chebet', age: '62 F', test: 'CRP, ESR, RF', ordered: 'Dr. Mwangi', date: '12 Jul 2026', status: 'pending', priority: 'routine' },
  { id: 'LAB-07837', patient: 'John Mwangi', age: '58 M', test: 'Hb, WBC', ordered: 'Dr. Kamau', date: '10 Jul 2026', status: 'completed', priority: 'routine', result: 'Hb 13.2, WBC 8.5', trend: 'stable', flagged: false },
]

const quickOrderPresets = [
  { label: 'CBC + CRP', tests: 'CBC, CRP' },
  { label: 'U&E + Creat', tests: 'U&E, Creatinine' },
  { label: 'LFT', tests: 'LFT' },
  { label: 'Blood Culture', tests: 'Blood Culture ×2' },
  { label: 'HbA1c', tests: 'HbA1c' },
  { label: 'Malaria', tests: 'Malaria BS, RDT' },
  { label: 'Troponin', tests: 'Troponin T/I' },
  { label: 'Coagulation', tests: 'PT, PTT, INR' },
]

export default function DoctorLabPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showNewOrder, setShowNewOrder] = useState(false)

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    if (search && !o.patient.toLowerCase().includes(search.toLowerCase()) && !o.test.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const StatBadge = ({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) => (
    <div style={{ padding: '10px 14px', borderRadius: 8, background: bg, border: `1px solid ${color}30`, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 9, color, fontWeight: 500 }}>{label}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <FlaskConical size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Clinical Laboratory</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowNewOrder(true)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Quick Order
        </button>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Brain size={14} /> AI Interpretation
        </button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
            <StatBadge label="Total Orders" count={orders.length} color={C.navy} bg={C.white} />
            <StatBadge label="Pending" count={orders.filter(o => o.status === 'pending').length} color={C.amber} bg='#FFFBEB' />
            <StatBadge label="Processing" count={orders.filter(o => o.status === 'processing').length} color={C.sky} bg='#F0F9FF' />
            <StatBadge label="Completed Today" count={orders.filter(o => o.status === 'completed').length} color={C.green} bg='#F0FDF4' />
            <StatBadge label="Flagged Results" count={orders.filter(o => o.flagged).length} color={C.red} bg='#FEF2F2' />
          </div>

          {/* Quick Order Presets */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, overflow: 'auto' }}>
            {quickOrderPresets.map(p => (
              <button key={p.label} onClick={() => setShowNewOrder(true)} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={10} color={C.sky} /> {p.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: C.textLight }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or test..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, outline: 'none' }} />
            </div>
            {['all', 'pending', 'processing', 'completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '5px 12px', borderRadius: 6, border: filterStatus === s ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: filterStatus === s ? C.skyLight : C.white, fontSize: 11, cursor: 'pointer', fontWeight: filterStatus === s ? 600 : 400, textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>

          {/* Order List */}
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 140px 1fr 100px 90px 70px 70px 30px', gap: 6, padding: '8px 14px', fontSize: 9, color: C.textLight, fontWeight: 600, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
              <span>ID</span><span>Patient</span><span>Test</span><span>Ordered By</span><span>Date</span><span>Priority</span><span>Status</span><span></span>
            </div>
            {filtered.map((o, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 140px 1fr 100px 90px 70px 70px 30px', gap: 6, padding: '7px 14px', alignItems: 'center', fontSize: 10, borderBottom: `1px solid ${C.panel}`, background: o.flagged ? '#FFFBEB' : i % 2 === 0 ? 'transparent' : C.panel }}>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 9 }}>{o.id}</span>
                <span style={{ fontWeight: 600, color: C.text }}>{o.patient} <span style={{ fontWeight: 400, color: C.textLight }}>{o.age}</span></span>
                <span style={{ color: C.textLight }}>{o.test}</span>
                <span style={{ color: C.textLight }}>{o.ordered}</span>
                <span style={{ color: C.textLight }}>{o.date}</span>
                <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 8, fontWeight: 700, textAlign: 'center', background: o.priority === 'urgent' ? '#FEF2F2' : '#F0FDF4', color: o.priority === 'urgent' ? C.red : C.green, textTransform: 'uppercase' }}>{o.priority}</span>
                <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 8, fontWeight: 600, textAlign: 'center', background: o.status === 'completed' ? '#F0FDF4' : o.status === 'processing' ? '#F0F9FF' : '#FFFBEB', color: o.status === 'completed' ? C.green : o.status === 'processing' ? C.sky : C.amber, textTransform: 'capitalize' }}>{o.status}</span>
                <ChevronRight size={12} color={C.textLight} />
              </div>
            ))}
          </div>

          {/* AI Interpretation Section */}
          <div style={{ marginTop: 16, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Brain size={16} color={C.sky} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>AI Interpretation</span>
              <span style={{ fontSize: 10, color: C.textLight, marginLeft: 'auto' }}>For flagged results only · Pending review: {orders.filter(o => o.flagged).length}</span>
            </div>
            {orders.filter(o => o.flagged).map((o, i) => (
              <div key={i} style={{ padding: '8px 12px', borderRadius: 6, background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 4, fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={12} color={C.amber} />
                  <span style={{ fontWeight: 600 }}>{o.patient}</span>
                  <span style={{ color: C.textLight }}>— {o.test}</span>
                  <span style={{ marginLeft: 'auto', color: '#92400E' }}>{o.result}</span>
                </div>
                <div style={{ marginTop: 4, padding: '6px 10px', borderRadius: 4, background: '#FFF', fontSize: 10, color: '#0369A1' }}>
                  <TrendingUp size={10} style={{ marginRight: 4 }} /> AI suggests: Potassium elevated (5.2). Check for AKI, ACEi/ARB use, haemolysis. Recommend ECG and repeat K+.
                </div>
              </div>
            ))}
            {orders.filter(o => o.flagged).length === 0 && (
              <div style={{ fontSize: 11, color: C.textLight, textAlign: 'center', padding: 12 }}>No flagged results requiring AI interpretation.</div>
            )}
          </div>
        </div>
      </div>

      {/* New Order Dialog */}
      {showNewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 480, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>New Lab Order</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 10, top: 10, color: C.textLight }} />
                <input placeholder="Search patient..." style={{ width: '100%', height: 36, padding: '0 10px 0 30px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {quickOrderPresets.map(p => (
                  <button key={p.label} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer' }}>{p.label} ({p.tests})</button>
                ))}
              </div>
              <textarea placeholder="Custom tests (one per line)..." style={{ width: '100%', minHeight: 60, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNewOrder(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setShowNewOrder(false)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><Send size={14} style={{ marginRight: 4 }} /> Send to Lab</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
