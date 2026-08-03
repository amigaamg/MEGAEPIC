'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { C } from '@/lib/colors'
import {
  Search, X, Users, FileText, FlaskConical, Scan, Pill, Activity,
  Stethoscope, ArrowRight, Loader2, Command,
} from 'lucide-react'
import { search, getIndexSize } from '@/lib/amexan/data/search'
import type { SearchableEntry } from '@/lib/amexan/data/types'
import { getActiveOrganizationId } from '@/lib/firebase/orgContext'
import { listPatients } from '@/lib/firebase/patientService'

const TYPE_META: Record<SearchableEntry['type'], { label: string; icon: React.ReactNode; color: string }> = {
  patient: { label: 'Patient', icon: <Users size={13} />, color: C.sky },
  encounter: { label: 'Encounter', icon: <Stethoscope size={13} />, color: '#10B981' },
  lab: { label: 'Laboratory', icon: <FlaskConical size={13} />, color: '#7C3AED' },
  imaging: { label: 'Imaging', icon: <Scan size={13} />, color: '#F59E0B' },
  medication: { label: 'Medication', icon: <Pill size={13} />, color: '#EF4444' },
  diagnosis: { label: 'Diagnosis', icon: <Activity size={13} />, color: '#06B6D4' },
  note: { label: 'Note', icon: <FileText size={13} />, color: '#8B5CF6' },
  procedure: { label: 'Procedure', icon: <Stethoscope size={13} />, color: '#EC4899' },
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SearchableEntry['type'] | 'all'>('all')
  const [ready, setReady] = useState(() => getIndexSize() > 0)
  const [seeding, setSeeding] = useState(false)
  const [indexedCount, setIndexedCount] = useState(0)

  const seedFromFirestore = useCallback(async () => {
    const orgId = getActiveOrganizationId()
    try {
      if (orgId) {
        const patients = await listPatients(orgId, 200).catch(() => [])
        const { indexEntry } = await import('@/lib/amexan/data/search')
        ;(patients as Awaited<ReturnType<typeof listPatients>>).forEach(p => {
          indexEntry({
            id: `patient_${p.id}`,
            type: 'patient',
            title: p.fullName || `${p.givenName} ${p.familyName}`.trim(),
            description: `${formatAge(p.dateOfBirth)} · ${p.sex} · ${p.phone || '—'} · ${p.amxpId || p.id}`,
            keywords: [p.givenName || '', p.familyName || '', p.phone || '', p.nationalId || '', p.amxpId || '', p.id],
            organizationId: orgId,
            patientId: p.id,
            link: `/patient/${p.id}`,
            createdAt: p.createdAt,
          })
        })
      }
    } catch { /* seeding is best-effort */ }
    setIndexedCount(getIndexSize())
    setSeeding(false)
    setReady(true)
  }, [])

  useEffect(() => {
    if (getIndexSize() === 0) {
      const t = setTimeout(() => { seedFromFirestore() }, 0)
      return () => clearTimeout(t)
    }
  }, [seedFromFirestore])

  const results = useMemo(() => {
    if (!query.trim()) return []
    return search(query, { limit: 60 }).filter(r => typeFilter === 'all' || r.type === typeFilter)
  }, [query, typeFilter])

  const groups = useMemo(() => {
    const map = new Map<SearchableEntry['type'], SearchableEntry[]>()
    results.forEach(r => {
      const arr = map.get(r.type) || []
      arr.push(r)
      map.set(r.type, arr)
    })
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length)
  }, [results])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <header style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Search size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Global Search</span>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>← Dashboard</Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Search everything</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
          Patients, encounters, labs, imaging, medications, diagnoses, notes and procedures.
        </p>

        {/* Search box */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search patients, drugs, guidelines, tasks…"
            autoFocus
            style={{
              width: '100%', padding: '12px 44px', borderRadius: 12, border: `1px solid ${query ? C.sky : 'var(--surface-border)'}`,
              background: 'var(--surface-card)', fontSize: 15, outline: 'none', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
              boxShadow: query ? `0 0 0 3px ${C.sky}22` : 'none',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <X size={16} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
          <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} label="All types" />
          {(Object.keys(TYPE_META) as SearchableEntry['type'][]).map(t => (
            <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} label={TYPE_META[t].label} />
          ))}
        </div>

        {/* Status line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0', fontSize: 11, color: 'var(--text-muted)' }}>
          {seeding && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
          {!ready ? 'Building search index…' : `Indexed ${indexedCount} records`}
        </div>

        {/* Results */}
        {query.trim() && results.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No results for “{query}”</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try a different name, ID, or keyword.</div>
          </div>
        )}

        {groups.map(([type, items]) => (
          <div key={type} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ color: TYPE_META[type].color }}>{TYPE_META[type].icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' }}>
                {TYPE_META[type].label} · {items.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(r => (
                <Link key={r.id} href={r.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    padding: '12px 16px', background: 'var(--surface-card)', borderRadius: 10,
                    border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'border-color 0.15s',
                  }} className="search-result">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: TYPE_META[type].color + '15', color: TYPE_META[type].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {TYPE_META[type].icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{highlight(r.title, query)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{highlight(r.description, query)}</div>
                    </div>
                    <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {!query.trim() && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-card)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Command size={20} />
            </div>
            Type to search across the entire organization.
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 20, border: '1px solid var(--surface-border)',
      background: active ? C.sky : 'var(--surface-card)', color: active ? '#fff' : 'var(--text-muted)',
      fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
    }}>{label}</button>
  )
}

function highlight(text: string, query: string): React.ReactNode {
  if (!text || !query) return text || ''
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx < 0) return text
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ background: '#FDE68A', borderRadius: 2, padding: '0 1px' }}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

function formatAge(dob: string): string {
  if (!dob) return ''
  const d = new Date(dob)
  if (isNaN(d.getTime())) return ''
  const years = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  return `${years}y`
}
