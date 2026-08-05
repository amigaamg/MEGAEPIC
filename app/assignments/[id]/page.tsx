'use client'

import { C } from '@/lib/colors'
import { Calendar, Clock, MapPin, User, ClipboardList } from 'lucide-react'

export default function AssignmentPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <ClipboardList size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Assignment Details</span>
      </div>
      <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
        <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Assignment ID</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: C.sky, marginBottom: 16 }}>{params.id}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 12, alignItems: 'center' }}><ClipboardList size={14} color={C.sky} /> <strong>Type:</strong> Ward Round</div>
            <div style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 12, alignItems: 'center' }}><MapPin size={14} color="#10B981" /> <strong>Location:</strong> Ward 4, AMEXAN Demo Facility</div>
            <div style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 12, alignItems: 'center' }}><Clock size={14} color="#F59E0B" /> <strong>Time:</strong> 08:00 - 11:00</div>
            <div style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 12, alignItems: 'center' }}><User size={14} color="#8B5CF6" /> <strong>Assigned:</strong> Dr. James Kamau</div>
            <div style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 12, alignItems: 'center' }}><Calendar size={14} color="#6366F1" /> <strong>Status:</strong> Active</div>
          </div>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: C.sky + '10', border: '1px solid ' + C.sky + '30', fontSize: 11, color: C.sky }}>
            This assignment is currently active. Complete the assigned tasks to mark it as finished.
          </div>
        </div>
      </div>
    </div>
  )
}
