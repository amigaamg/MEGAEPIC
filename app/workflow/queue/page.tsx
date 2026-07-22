'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import {
  Clock, Users, AlertTriangle, ChevronRight, Search, Filter,
  Activity, Bell, ArrowUp, ArrowDown, MoreHorizontal, UserPlus,
  Calendar, BarChart3, RefreshCw, type LucideIcon,
} from 'lucide-react'
import type {
  ClinicalQueue, QueueItem, QueueType, WorkflowPriority,
} from '@/lib/amexan/clinical-constitution/types'

const DEPARTMENTS = [
  { id: 'emergency', name: 'Emergency', color: '#EF4444', queueTypes: ['triage', 'consultation'] },
  { id: 'outpatient', name: 'Outpatient', color: C.sky, queueTypes: ['consultation'] },
  { id: 'laboratory', name: 'Laboratory', color: '#8B5CF6', queueTypes: ['laboratory'] },
  { id: 'radiology', name: 'Radiology', color: '#F59E0B', queueTypes: ['radiology'] },
  { id: 'pharmacy', name: 'Pharmacy', color: '#10B981', queueTypes: ['pharmacy'] },
  { id: 'theatre', name: 'Theatre', color: '#3B82F6', queueTypes: ['theatre'] },
  { id: 'ward', name: 'Ward', color: '#EC4899', queueTypes: ['ward', 'discharge'] },
  { id: 'physiotherapy', name: 'Physiotherapy', color: '#14B8A6', queueTypes: ['physiotherapy'] },
]

function generateMockQueues(): ClinicalQueue[] {
  const firstNames = ['James', 'Grace', 'Peter', 'Ann', 'John', 'Mary', 'David', 'Sarah', 'Michael', 'Esther', 'Daniel', 'Ruth', 'Samuel', 'Hannah', 'Joseph', 'Deborah', 'Thomas', 'Naomi', 'Paul', 'Elizabeth']
  const lastNames = ['Mwangi', 'Kamau', 'Ochieng', 'Wanjiku', 'Kiprop', 'Nyambura', 'Odhiambo', 'Chebet', 'Njoroge', 'Akinyi', 'Mutua', 'Jerono', 'Kioko', 'Wambui', 'Barasa', 'Nyakio', 'Kariuki', 'Chepkirui', 'Omondi', 'Njoki']

  return DEPARTMENTS.map(dept => {
    const itemCount = 3 + Math.floor(Math.random() * 8)
    const items: QueueItem[] = Array.from({ length: itemCount }, (_, i) => {
      const priority = (Math.floor(Math.random() * 4) + 1) as WorkflowPriority
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const enteredAt = Date.now() - Math.floor(Math.random() * 120 * 60000)
      return {
        id: `qi_${dept.id}_${i}`,
        patientId: `pat_${Math.random().toString(36).slice(2, 8)}`,
        patientName: `${firstName} ${lastName}`,
        workflowId: `wf_${Math.random().toString(36).slice(2, 8)}`,
        priority,
        priorityReason: priority <= 2 ? getPriorityReason(priority) : undefined,
        status: Math.random() > 0.8 ? 'in_progress' : 'waiting',
        enteredAt,
        waitTime: Math.floor((Date.now() - enteredAt) / 60000),
        expectedServiceTime: 15 + Math.floor(Math.random() * 45),
        escalationLevel: 0,
      }
    })
    items.sort((a, b) => a.priority - b.priority || a.enteredAt - b.enteredAt)
    return {
      id: `queue_${dept.id}`,
      name: `${dept.name} Queue`,
      departmentId: dept.id,
      departmentName: dept.name,
      organizationId: 'org_1',
      type: dept.queueTypes[0] as QueueType,
      items,
      lastReordered: Date.now(),
      averageWaitTime: Math.floor(Math.random() * 40) + 10,
    }
  })
}

function getPriorityReason(p: WorkflowPriority): string {
  const reasons: Record<number, string> = {
    1: 'Resuscitation / Critical',
    2: 'High acuity / Time-sensitive',
  }
  return reasons[p] || ''
}

const PRIORITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  2: { label: 'Urgent', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  3: { label: 'Standard', color: C.sky, bg: 'rgba(47,128,237,0.08)' },
  4: { label: 'Routine', color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
  5: { label: 'Low', color: '#CBD5E1', bg: 'rgba(203,213,225,0.08)' },
}

export default function WorkflowQueuePage() {
  const [queues, setQueues] = useState(generateMockQueues)
  const [activeDept, setActiveDept] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => {
      setQueues(generateMockQueues())
      setRefreshing(false)
    }, 600)
  }

  const filteredQueues = useMemo(() => {
    let result = queues
    if (activeDept !== 'all') {
      result = result.filter(q => q.departmentId === activeDept)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.map(queue => ({
        ...queue,
        items: queue.items.filter(item =>
          item.patientName.toLowerCase().includes(q) ||
          item.patientId.toLowerCase().includes(q)
        ),
      })).filter(queue => queue.items.length > 0)
    }
    return result
  }, [queues, activeDept, searchQuery])

  const totalWaiting = useMemo(
    () => queues.reduce((sum, q) => sum + q.items.filter(i => i.status === 'waiting').length, 0),
    [queues],
  )
  const totalInProgress = useMemo(
    () => queues.reduce((sum, q) => sum + q.items.filter(i => i.status === 'in_progress').length, 0),
    [queues],
  )
  const avgWaitAcross = useMemo(
    () => Math.round(queues.reduce((sum, q) => sum + (q.averageWaitTime ?? 0), 0) / queues.length),
    [queues],
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Activity size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Clinical Queues</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search patients..."
            style={{ width: '100%', height: 34, padding: '0 12px 0 34px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }}
          />
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Department sidebar */}
        <div style={{ width: 200, background: 'var(--surface-card)', borderRight: '1px solid var(--surface-border)', padding: '12px 8px', flexShrink: 0, overflow: 'auto' }}>
          <button onClick={() => setActiveDept('all')}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: activeDept === 'all' ? 'var(--sky-50)' : 'transparent', color: activeDept === 'all' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: activeDept === 'all' ? 600 : 400, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)' }}>
            <Activity size={14} /> All Departments
            <span style={{ marginLeft: 'auto', background: 'var(--sky-50)', color: 'var(--primary)', borderRadius: 10, padding: '0 7px', fontSize: 10, fontWeight: 700 }}>{totalWaiting}</span>
          </button>
          <div style={{ height: 1, background: 'var(--surface-border)', margin: '8px 0' }} />
          {DEPARTMENTS.map(dept => {
            const deptQueue = queues.find(q => q.departmentId === dept.id)
            const waiting = deptQueue ? deptQueue.items.filter(i => i.status === 'waiting').length : 0
            return (
              <button key={dept.id} onClick={() => setActiveDept(dept.id)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: activeDept === dept.id ? 'var(--sky-50)' : 'transparent', color: activeDept === dept.id ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: activeDept === dept.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dept.color, flexShrink: 0 }} />
                {dept.name}
                <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9, background: waiting > 0 ? dept.color : 'var(--surface-border)', color: waiting > 0 ? 'white' : 'var(--text-muted)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {waiting}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Waiting', value: totalWaiting, icon: Clock, color: C.sky },
              { label: 'In Progress', value: totalInProgress, icon: Users, color: '#10B981' },
              { label: 'Avg Wait Time', value: `${avgWaitAcross} min`, icon: AlertTriangle, color: '#F59E0B' },
              { label: 'Active Queues', value: queues.length, icon: BarChart3, color: '#8B5CF6' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
                  <s.icon size={18} color={s.color} />
                </div>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Queue lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredQueues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>No patients in queue</p>
              </div>
            ) : (
              filteredQueues.map(queue => (
                <QueueCard key={queue.id} queue={queue} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function QueueCard({ queue }: { queue: ClinicalQueue }) {
  const [expanded, setExpanded] = useState(true)
  const waiting = queue.items.filter(i => i.status === 'waiting').length
  const dept = DEPARTMENTS.find(d => d.id === queue.departmentId)

  return (
    <div style={{ background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
      {/* Queue header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--surface-border)', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: dept?.color || 'var(--primary)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{queue.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
            {queue.type.replace('_', ' ')}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Avg wait: {queue.averageWaitTime} min
        </span>
        <span style={{ background: 'var(--sky-50)', color: 'var(--primary)', borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
          {waiting} waiting
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ padding: 6, borderRadius: 6, border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* Queue items */}
      {expanded && (
        <div>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 100px 80px 40px', gap: 8, padding: '8px 20px', background: 'var(--surface-elevated)', borderBottom: '1px solid var(--surface-border)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>Patient</span>
            <span>Priority</span>
            <span>Reason</span>
            <span>Status</span>
            <span>Wait Time</span>
            <span>Expected</span>
            <span />
          </div>

          {queue.items.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              Queue is empty
            </div>
          ) : (
            queue.items.map((item, idx) => (
              <QueueItemRow key={item.id} item={item} index={idx} isLast={idx === queue.items.length - 1} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function QueueItemRow({ item, index, isLast }: { item: QueueItem; index: number; isLast: boolean }) {
  const priorityInfo = PRIORITY_LABELS[item.priority]
  const isOverdue = item.waitTime > (item.expectedServiceTime ?? 30)

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 100px 80px 40px', gap: 8,
      padding: '10px 20px', alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid var(--surface-border)',
      background: item.priority <= 2 ? 'rgba(239,68,68,0.03)' : 'transparent',
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: item.status === 'in_progress' ? '#10B981' : item.priority <= 2 ? '#EF4444' : 'var(--text-muted)',
          flexShrink: 0,
        }} />
        <div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.patientName}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>
            {item.patientId.slice(0, 10)}
          </span>
        </div>
      </div>

      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4,
          background: priorityInfo.bg, color: priorityInfo.color, fontSize: 11, fontWeight: 600,
        }}>
          {item.priority <= 2 && <AlertTriangle size={10} />}
          {priorityInfo.label}
        </span>
      </div>

      <div>
        {item.priorityReason && (
          <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 500 }}>{item.priorityReason}</span>
        )}
      </div>

      <div>
        <span style={{
          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
          background: item.status === 'in_progress' ? 'rgba(16,185,129,0.1)' : 'var(--surface-elevated)',
          color: item.status === 'in_progress' ? '#10B981' : 'var(--text-muted)',
        }}>
          {item.status === 'in_progress' ? 'In Progress' : 'Waiting'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={12} color={isOverdue ? '#EF4444' : 'var(--text-muted)'} />
        <span style={{ color: isOverdue ? '#EF4444' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400, fontSize: 12 }}>
          {item.waitTime < 60 ? `${item.waitTime}m` : `${Math.floor(item.waitTime / 60)}h ${item.waitTime % 60}m`}
        </span>
        {isOverdue && <AlertTriangle size={12} color="#EF4444" />}
      </div>

      <div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          ~{item.expectedServiceTime} min
        </span>
      </div>

      <div>
        <button style={{ padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
