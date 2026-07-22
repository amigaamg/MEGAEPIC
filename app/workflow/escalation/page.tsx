'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import {
  Activity, AlertTriangle, CheckCircle, Clock, User,
  ArrowUp, ArrowRight, Search, RefreshCw, Bell, Shield,
  ChevronRight, MoreHorizontal, type LucideIcon,
} from 'lucide-react'
import type { ClinicalTask, TaskEscalation, WorkflowPriority } from '@/lib/amexan/clinical-constitution/types'

const PATIENTS = [
  'John Mwangi', 'Grace Kamau', 'Peter Ochieng', 'Ann Wanjiku',
  'James Kiprop', 'Mary Nyambura', 'David Odhiambo', 'Sarah Chebet',
  'Michael Mutua', 'Esther Jerono',
]

const DEPARTMENTS = ['Emergency', 'Medicine', 'Surgery', 'ICU', 'Pediatrics', 'OB/GYN']
const ESCALATION_REASONS = [
  'Task overdue by >30 minutes',
  'Critical lab result unreviewed',
  'Patient deterioration not assessed',
  'Consult request unanswered >1hr',
  'Medication not administered',
  'Discharge summary not completed',
  'Pending imaging unreported',
  'Clinical notification unacknowledged',
]

function generateEscalatedTasks(): (ClinicalTask & { dept: string })[] {
  return Array.from({ length: 10 }, (_, i) => {
    const reason = ESCALATION_REASONS[Math.floor(Math.random() * ESCALATION_REASONS.length)]
    const level = Math.floor(Math.random() * 3) + 1
    const patient = PATIENTS[Math.floor(Math.random() * PATIENTS.length)]
    const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)]
    const createdAt = Date.now() - Math.floor(Math.random() * 180 * 60000)
    const escalatedAt = createdAt + Math.floor(Math.random() * 60 * 60000)

    return {
      id: `etask_${i}`,
      workflowId: `wf_${Math.random().toString(36).slice(2, 8)}`,
      patientId: `pat_${Math.random().toString(36).slice(2, 8)}`,
      title: `${reason}`,
      description: `Escalated from ${dept} — Patient: ${patient}`,
      assignedBy: 'system',
      assignedByName: 'Escalation Engine',
      assignedTo: ['doc_head_1', 'doc_head_2', 'doc_head_3'][Math.floor(Math.random() * 3)],
      assignedToName: ['Dr. Chief Mwangi', 'Dr. Head Kamau', 'Dr. Lead Ochieng'][Math.floor(Math.random() * 3)],
      type: 'notification' as any,
      priority: Math.min(level + 1, 5) as WorkflowPriority,
      status: 'escalated',
      createdAt,
      dueAt: createdAt + 30 * 60000,
      clinicalClockTarget: level === 1 ? 60 : level === 2 ? 30 : 15,
      dependsOnTaskIds: [],
      escalationLevel: level,
      escalationHistory: [
        { escalatedAt, escalatedTo: 'doc_reg_1', escalatedToName: 'Dr. Registrar', reason: 'Level 1 — Initial escalation' },
        ...(level >= 2 ? [{ escalatedAt: escalatedAt + 15 * 60000, escalatedTo: 'doc_head_1', escalatedToName: 'Dr. Head', reason: `Level 2 — ${reason}` }] : []),
        ...(level >= 3 ? [{ escalatedAt: escalatedAt + 30 * 60000, escalatedTo: 'doc_director', escalatedToName: 'Medical Director', reason: `Level 3 — ${reason}` }] : []),
      ],
      dept,
    }
  })
}

function generateResolvedTasks(): (ClinicalTask & { dept: string })[] {
  return Array.from({ length: 6 }, (_, i) => ({
    ...generateEscalatedTasks()[i],
    id: `rtask_${i}`,
    status: 'completed' as any,
    escalationLevel: 0,
    completedAt: Date.now() - Math.floor(Math.random() * 120 * 60000),
    escalationHistory: [],
    dept: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
  }))
}

const LEVEL_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Level 1', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  2: { label: 'Level 2', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  3: { label: 'Level 3', color: '#DC2626', bg: 'rgba(220,38,38,0.15)' },
}

export default function WorkflowEscalationPage() {
  const [escalatedTasks, setEscalatedTasks] = useState(generateEscalatedTasks)
  const [resolvedTasks] = useState(generateResolvedTasks)
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')

  function handleResolve(taskId: string) {
    setEscalatedTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const filteredTasks = useMemo(() => {
    const source = activeTab === 'active' ? escalatedTasks : resolvedTasks
    let result = source
    if (deptFilter !== 'all') {
      result = result.filter(t => t.dept === deptFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(q)) ||
        t.dept.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => b.escalationLevel - a.escalationLevel || a.createdAt - b.createdAt)
  }, [escalatedTasks, resolvedTasks, activeTab, deptFilter, searchQuery])

  const stats = useMemo(() => ({
    active: escalatedTasks.length,
    level1: escalatedTasks.filter(t => t.escalationLevel === 1).length,
    level2: escalatedTasks.filter(t => t.escalationLevel === 2).length,
    level3: escalatedTasks.filter(t => t.escalationLevel === 3).length,
    resolved: resolvedTasks.length,
    avgResponse: '23 min',
  }), [escalatedTasks, resolvedTasks])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Bell size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Escalation Center</span>
        {stats.active > 0 && (
          <span style={{ background: '#EF4444', color: 'white', borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            {stats.active} Active
          </span>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search escalations..."
            style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          style={{ height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={() => setEscalatedTasks(generateEscalatedTasks())}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)' }}>
        <StatCard label="Active Escalations" value={stats.active} color="#EF4444" />
        <StatCard label="Level 1 (Department)" value={stats.level1} color="#F59E0B" />
        <StatCard label="Level 2 (Head)" value={stats.level2} color="#EF4444" />
        <StatCard label="Level 3 (Director)" value={stats.level3} color="#DC2626" />
        <StatCard label="Avg Response" value={stats.avgResponse} color={C.sky} />
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 8, borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-card)' }}>
        <TabButton label="Active" count={stats.active} active={activeTab === 'active'} color="#EF4444" onClick={() => setActiveTab('active')} />
        <TabButton label="Resolved" count={stats.resolved} active={activeTab === 'resolved'} color="#10B981" onClick={() => setActiveTab('resolved')} />
      </div>

      {/* Content */}
      <div style={{ overflow: 'auto', padding: 16, height: 'calc(100vh - 220px)' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <CheckCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>
              {activeTab === 'active' ? 'No active escalations' : 'No resolved escalations'}
            </p>
            {activeTab === 'active' && <p style={{ fontSize: 12 }}>All tasks are on track</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredTasks.map(task => (
              <div key={task.id}
                style={{
                  background: 'var(--surface-card)', borderRadius: 10,
                  border: `1px solid ${task.escalationLevel >= 3 ? '#DC2626' : task.escalationLevel === 2 ? '#EF4444' : 'var(--surface-border)'}`,
                  borderLeft: `4px solid ${LEVEL_CONFIG[task.escalationLevel]?.color || 'var(--primary)'}`,
                  padding: '14px 16px',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <AlertTriangle size={15} color={LEVEL_CONFIG[task.escalationLevel]?.color || '#EF4444'} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                        background: LEVEL_CONFIG[task.escalationLevel]?.bg || 'rgba(239,68,68,0.1)',
                        color: LEVEL_CONFIG[task.escalationLevel]?.color || '#EF4444',
                      }}>
                        {LEVEL_CONFIG[task.escalationLevel]?.label || `Level ${task.escalationLevel}`}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
                        {task.dept}
                      </span>
                    </div>

                    {/* Escalation chain */}
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Escalation chain: </span>
                      {task.escalationHistory.map((e, i) => (
                        <span key={i} style={{ fontSize: 11 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{e.escalatedToName}</span>
                          {i < task.escalationHistory.length - 1 && <ArrowRight size={11} style={{ verticalAlign: 'middle', margin: '0 4px', color: 'var(--text-muted)' }} />}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>Assigned to: <strong style={{ color: 'var(--text-secondary)' }}>{task.assignedToName}</strong></span>
                      <span>Created: {formatRelativeTime(task.createdAt)}</span>
                      <span>Clock: <strong style={{ color: task.clinicalClockTarget ? '#EF4444' : 'var(--text-muted)' }}>{task.clinicalClockTarget ? `${task.clinicalClockTarget} min target` : 'No target'}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  {activeTab === 'active' && (
                    <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
                      <button onClick={() => handleResolve(task.id)}
                        style={{ height: 32, padding: '0 14px', borderRadius: 6, border: 'none', background: '#10B981', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}>
                        <CheckCircle size={13} /> Resolve
                      </button>
                      <button
                        style={{ height: 32, padding: '0 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}>
                        <User size={13} /> Assign
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${color}08`, border: `1px solid ${color}20` }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

function TabButton({ label, count, active, color, onClick }: { label: string; count: number; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        padding: '10px 16px', border: 'none', borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
        background: 'transparent', color: active ? color : 'var(--text-muted)',
        fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
      }}>
      {label}
      <span style={{
        padding: '1px 7px', borderRadius: 8, fontSize: 10, fontWeight: 700,
        background: active ? `${color}15` : 'var(--surface-elevated)',
        color: active ? color : 'var(--text-muted)',
      }}>{count}</span>
    </button>
  )
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}
