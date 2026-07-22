'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collectionGroup, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { C } from '@/lib/colors'
import { useAuth } from '@/context/AuthContext'
import { Plus, Search, ChevronRight, ClipboardList } from 'lucide-react'

interface EncounterDoc {
  id: string
  patientId: string
  patientName: string
  departmentId: string
  unitId: string
  encounterType: string
  status: string
  createdBy: string
  createdAt: number
  priority?: string
}

export default function EncountersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [encounters, setEncounters] = useState<EncounterDoc[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collectionGroup(db, 'encounters'),
      where('orgId', '==', 'telemed-a98cf'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )
    const unsub = onSnapshot(q,
      (snap) => {
        setEncounters(snap.docs.map(d => ({ ...d.data() as EncounterDoc, id: d.id })))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const filtered = encounters.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false
    if (search && !e.patientName?.toLowerCase().includes(search.toLowerCase()) && !e.id?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    inProgress: encounters.filter(e => e.status === 'active').length,
    completed: encounters.filter(e => e.status === 'completed').length,
    urgent: 0,
    total: encounters.length,
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading encounters…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <ClipboardList size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Encounters</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => router.push('/encounter-center')}
          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        ><Plus size={14} /> New Encounter</button>
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.sky }}>{stats.inProgress}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>In Progress</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{stats.completed}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Completed</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{stats.urgent}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Urgent</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#8B5CF6' }}>{stats.total}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Total</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search encounters..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
          {['all', 'active', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--surface-border)', background: filter === f ? C.sky : 'var(--surface)', color: filter === f ? C.white : 'var(--text-secondary)', fontSize: 11, fontWeight: filter === f ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>{f.replace('_', ' ')}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No encounters found.{' '}
            <button onClick={() => router.push('/encounter-center')} style={{ background: 'none', border: 'none', color: C.sky, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Create one →</button>
          </div>
        ) : (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 120px 1fr 80px 60px 30px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                <span>ID</span><span>Patient</span><span>Type</span><span>Department</span><span>Provider</span><span>Status</span><span></span>
              </div>
              {filtered.map((e, i) => (
                <div
                  key={e.id}
                  onClick={() => router.push(`/encounter-center`)}
                  style={{ display: 'grid', gridTemplateColumns: '120px 120px 120px 1fr 80px 60px 30px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10, cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{e.id?.slice(0, 16)}</span>
                  <span style={{ fontWeight: 600 }}>{e.patientName || '—'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{(e.encounterType || '').replace(/_/g, ' ')}</span>
                  <span>{e.departmentId || '—'}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{e.createdBy ? `Dr. ${e.createdBy}` : '—'}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, textAlign: 'center', background: e.status === 'active' ? '#F59E0B15' : '#10B98115', color: e.status === 'active' ? '#F59E0B' : '#10B981', textTransform: 'capitalize' }}>{e.status === 'active' ? 'in progress' : e.status}</span>
                  <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
