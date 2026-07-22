'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Calendar, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react'

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d
  })
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
  })
  const staff = ['Dr. Grace Kamau', 'Dr. John Mwangi', 'Nurse Ann Wanjiku', 'Dr. Peter Ochieng', 'Pharm. David Kiprop']
  const shifts = ['Morning', 'Afternoon', 'Night', 'On Call', 'Off']
  const schedule: Record<string, string[]> = {
    'Dr. Grace Kamau': ['Morning', 'Morning', 'Morning', 'Morning', 'Morning', 'Off', 'Off'],
    'Dr. John Mwangi': ['Afternoon', 'Afternoon', 'Night', 'Night', 'Off', 'On Call', 'On Call'],
    'Nurse Ann Wanjiku': ['Night', 'Night', 'Off', 'Afternoon', 'Afternoon', 'Morning', 'Morning'],
    'Dr. Peter Ochieng': ['Morning', 'Morning', 'On Call', 'On Call', 'Off', 'Night', 'Night'],
    'Pharm. David Kiprop': ['Off', 'Off', 'Morning', 'Morning', 'Afternoon', 'Afternoon', 'Off'],
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Calendar size={18} color={C.sky} />
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Staff Schedule</h1>
        <div style={{ flex: 1 }} />
        <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><ChevronLeft size={16} /></button>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{days[0].toLocaleDateString()} - {days[6].toLocaleDateString()}</span>
        <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><ChevronRight size={16} /></button>
      </div>
      <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>Staff</th>
              {days.map((d, i) => (
                <th key={i} style={{ textAlign: 'center', padding: '8px 10px', color: d.getDay() === 0 || d.getDay() === 6 ? '#EF4444' : 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>
                  {d.toLocaleDateString('en', { weekday: 'short' })}
                  <br /><span style={{ fontSize: 10 }}>{d.getDate()}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((name, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 10px', fontWeight: 600, borderBottom: '1px solid var(--surface-border)' }}>{name}</td>
                {schedule[name]?.map((s, j) => {
                  const color = s === 'Morning' ? '#2F80ED' : s === 'Afternoon' ? '#F59E0B' : s === 'Night' ? '#6366F1' : s === 'On Call' ? '#10B981' : '#64748B'
                  return <td key={j} style={{ textAlign: 'center', padding: '8px 4px', borderBottom: '1px solid var(--surface-border)' }}>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: `${color}15`, color }}>{s}</span>
                  </td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
