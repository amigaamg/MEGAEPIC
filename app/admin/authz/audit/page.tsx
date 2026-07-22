'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import { Shield, Search, Filter, RotateCcw, AlertTriangle, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react'
import { getAuditLogs, getAuditSummary, logAccess, clearLogs as clearAuditLogs } from '@/lib/amexan/authz/audit-log'
import type { AuditLogEntry } from '@/lib/amexan/authz/types'

const RESULT_ICONS: Record<AuditLogEntry['result'], typeof CheckCircle> = {
  allowed: CheckCircle,
  denied: XCircle,
  break_glass: AlertTriangle,
  dual_auth: Lock,
}

const RESULT_COLORS: Record<AuditLogEntry['result'], string> = {
  allowed: '#10B981',
  denied: '#EF4444',
  break_glass: '#F59E0B',
  dual_auth: '#8B5CF6',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    for (let i = 0; i < 25; i++) {
      const results: AuditLogEntry['result'][] = ['allowed', 'denied', 'break_glass', 'dual_auth']
      const actions = ['create', 'read', 'update', 'delete', 'approve', 'prescribe', 'administer']
      const resources = ['patient', 'encounter', 'prescription', 'lab_order', 'clinical_note', 'discharge_summary']
      logAccess({
        actor: '' as any,
        actorName: ['Dr. Mwangi', 'Dr. Kamau', 'Nurse Wanjiku', 'Dr. Ochieng', 'Pharmacist Chebet'][Math.floor(Math.random() * 5)],
        actorRole: ['Consultant', 'Registrar', 'Nurse', 'Pharmacist', 'Medical Officer'][Math.floor(Math.random() * 5)],
        organizationId: 'org_1',
        departmentId: ['Medicine', 'Surgery', 'ICU', 'Pharmacy', 'Laboratory'][Math.floor(Math.random() * 5)],
        action: actions[Math.floor(Math.random() * actions.length)],
        resourceType: resources[Math.floor(Math.random() * resources.length)],
        resourceId: `res_${Math.random().toString(36).slice(2, 8)}`,
        result: results[Math.floor(Math.random() * results.length)],
        reason: 'Permission evaluated',
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        sessionId: `sess_${Math.random().toString(36).slice(2, 8)}`,
      })
    }
    return getAuditLogs()
  })

  const [search, setSearch] = useState('')
  const [filterResult, setFilterResult] = useState<string>('all')

  const filtered = useMemo(() => {
    let result = logs
    if (filterResult !== 'all') result = result.filter(l => l.result === filterResult)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l => l.actorName.toLowerCase().includes(q) || l.resourceType.toLowerCase().includes(q) || l.action.toLowerCase().includes(q))
    }
    return result
  }, [logs, search, filterResult])

  const summary = useMemo(() => getAuditSummary(), [logs])

  function handleClear() {
    clearAuditLogs()
    setLogs([])
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Shield size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Authorization / Audit Log</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <select value={filterResult} onChange={e => setFilterResult(e.target.value)}
          style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Results</option>
          <option value="allowed">Allowed</option>
          <option value="denied">Denied</option>
          <option value="break_glass">Break Glass</option>
          <option value="dual_auth">Dual Auth</option>
        </select>
        <button onClick={handleClear}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <RotateCcw size={13} /> Clear
        </button>
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Events', value: summary.total, icon: Shield, color: C.sky },
            { label: 'Allowed', value: summary.allowed, icon: CheckCircle, color: '#10B981' },
            { label: 'Denied', value: summary.denied, icon: XCircle, color: '#EF4444' },
            { label: 'Break Glass', value: summary.breakGlass, icon: AlertTriangle, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
                <s.icon size={16} color={s.color} />
              </div>
              <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Log entries */}
        <div style={{ background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 100px 90px 100px 60px', gap: 0, padding: '10px 16px', background: 'var(--surface-elevated)', borderBottom: '1px solid var(--surface-border)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>Time</span>
            <span>Actor</span>
            <span>Action</span>
            <span>Resource</span>
            <span>Department</span>
            <span>Result</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No audit log entries found
            </div>
          ) : (
            filtered.map(entry => {
              const Icon = RESULT_ICONS[entry.result]
              const color = RESULT_COLORS[entry.result]
              return (
                <div key={entry.id} style={{
                  display: 'grid', gridTemplateColumns: '160px 1fr 100px 90px 100px 60px', gap: 0,
                  padding: '10px 16px', borderBottom: '1px solid var(--surface-border)', fontSize: 12, alignItems: 'center',
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{formatTime(entry.timestamp)}</span>
                  <div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{entry.actorName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>{entry.actorRole}</span>
                  </div>
                  <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{entry.action}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.resourceType}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{entry.departmentId}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontSize: 10, color, fontWeight: 600, textTransform: 'capitalize' }}>{entry.result.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
