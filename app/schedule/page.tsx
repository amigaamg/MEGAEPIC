'use client'

import { C } from '@/lib/colors'
import { Calendar, Search, Plus, ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react'

const events = [
  { time: '08:00', title: 'Ward Round - Ward 4', type: 'ward', dept: 'General Surgery' },
  { time: '10:00', title: 'Clinic - Room 3', type: 'clinic', dept: 'Surgery OPD' },
  { time: '11:30', title: 'MDT Meeting', type: 'meeting', dept: 'Boardroom' },
  { time: '13:00', title: 'Theatre - Case 1', type: 'theatre', dept: 'OT 2' },
  { time: '15:00', title: 'Family Meeting - Ward 4', type: 'meeting', dept: 'Family Room' },
  { time: '16:30', title: 'Handover', type: 'admin', dept: 'Doctors Lounge' },
]

export default function SchedulePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Calendar size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Schedule</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Event</button>
      </div>
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <button style={{ padding: 6, borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={16} /></button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Sunday, 12 July 2026</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dr. James Kamau · General Surgery</div>
          </div>
          <button style={{ padding: 6, borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex' }}><ChevronRight size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', minWidth: 60 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.sky }}>{e.time}</div>
              </div>
              <div style={{ width: 3, height: 40, borderRadius: 2, background: e.type === 'ward' ? '#10B981' : e.type === 'clinic' ? C.sky : e.type === 'theatre' ? '#8B5CF6' : e.type === 'meeting' ? '#F59E0B' : '#64748B' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <MapPin size={10} /> {e.dept}
                </div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: e.type === 'ward' ? '#10B98115' : e.type === 'clinic' ? C.sky + '15' : e.type === 'theatre' ? '#8B5CF615' : '#F59E0B15', color: e.type === 'ward' ? '#10B981' : e.type === 'clinic' ? C.sky : e.type === 'theatre' ? '#8B5CF6' : '#F59E0B', textTransform: 'capitalize' }}>{e.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
