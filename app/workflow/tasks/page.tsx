'use client'

import { useState, useMemo } from 'react'
import { C } from '@/lib/colors'
import {
  Activity, Clock, User, AlertTriangle, CheckCircle, XCircle,
  ChevronRight, Plus, Search, Calendar, ArrowRight, MoreHorizontal,
  ClipboardList, Tag, MessageSquare, RefreshCw, type LucideIcon,
} from 'lucide-react'
import type { ClinicalTask, TaskType, WorkflowPriority } from '@/lib/amexan/clinical-constitution/types'

const PRIORITY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Critical', color: '#EF4444' },
  2: { label: 'Urgent', color: '#F59E0B' },
  3: { label: 'Standard', color: C.sky },
  4: { label: 'Routine', color: '#94A3B8' },
  5: { label: 'Low', color: '#CBD5E1' },
}

const TASK_TYPES: { value: TaskType; label: string; icon: string }[] = [
  { value: 'assessment', label: 'Assessment', icon: '🔍' },
  { value: 'documentation', label: 'Documentation', icon: '📄' },
  { value: 'ordering', label: 'Ordering', icon: '📋' },
  { value: 'specimen_collection', label: 'Specimen', icon: '🧪' },
  { value: 'medication_admin', label: 'Medication', icon: '💊' },
  { value: 'procedure', label: 'Procedure', icon: '🔧' },
  { value: 'review', label: 'Review', icon: '👁' },
  { value: 'approval', label: 'Approval', icon: '✓' },
  { value: 'notification', label: 'Notify', icon: '🔔' },
  { value: 'consult_request', label: 'Consult', icon: '🔄' },
  { value: 'handover', label: 'Handover', icon: '🤝' },
  { value: 'discharge_process', label: 'Discharge', icon: '🚪' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'follow_up', label: 'Follow-up', icon: '📅' },
]

const STATUSES = ['pending', 'in_progress', 'completed'] as const

const DEPARTMENTS = [
  'Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OB/GYN',
  'ICU', 'Laboratory', 'Radiology', 'Pharmacy', 'Physiotherapy',
]

const ASSIGNEES = [
  'Dr. James Mwangi', 'Dr. Grace Kamau', 'Dr. Peter Ochieng',
  'Nurse Ann Wanjiku', 'Dr. John Kiprop', 'Nurse Mary Nyambura',
  'Dr. David Odhiambo', 'Dr. Sarah Chebet',
]

function generateTasks(): ClinicalTask[] {
  const firstNames = ['James', 'Grace', 'Peter', 'Ann', 'John', 'Mary', 'David', 'Sarah', 'Michael', 'Esther']
  const lastNames = ['Mwangi', 'Kamau', 'Ochieng', 'Wanjiku', 'Kiprop', 'Nyambura', 'Odhiambo', 'Chebet']
  const taskTemplates = [
    'Medical admission assessment', 'Nursing admission assessment',
    'Medication reconciliation', 'Ward round review', 'Discharge summary',
    'CT Head interpretation', 'CBC result review', 'Lab specimen collection',
    'Blood culture collection', 'ECG interpretation', 'Chest X-ray review',
    'IV fluid prescription', 'Antibiotic review', 'Pain assessment',
    'Wound care evaluation', 'Physiotherapy assessment', 'Dietitian referral',
    'Social worker assessment', 'Falls risk assessment', 'Pressure sore assessment',
    'Vital signs monitoring', 'Fluid balance charting', 'Bed allocation',
    'Consent for procedure', 'Pre-op assessment', 'Post-op review',
    'Follow-up appointment scheduling', 'Patient education', 'Family meeting',
    'Blood transfusion authorization',
  ]

  return Array.from({ length: 24 }, (_, i) => {
    const statusRoll = Math.random()
    const status = statusRoll < 0.35 ? 'pending' : statusRoll < 0.65 ? 'in_progress' : 'completed'
    const priority = (Math.floor(Math.random() * 4) + 1) as WorkflowPriority
    const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const createdAt = Date.now() - Math.floor(Math.random() * 240 * 60000)
    const dueAt = status === 'completed' ? undefined : createdAt + (15 + Math.floor(Math.random() * 120)) * 60000
    const assigneeIdx = Math.floor(Math.random() * ASSIGNEES.length)

    return {
      id: `task_${i}`,
      workflowId: `wf_${Math.random().toString(36).slice(2, 8)}`,
      patientId: `pat_${Math.random().toString(36).slice(2, 8)}`,
      title: template,
      description: `${template} for ${firstName} ${lastName}`,
      assignedTo: `user_${assigneeIdx}`,
      assignedToName: ASSIGNEES[assigneeIdx],
      assignedBy: 'user_0',
      assignedByName: 'Dr. Admin',
      type: ['assessment', 'documentation', 'ordering', 'review', 'notification', 'follow_up', 'specimen_collection', 'medication_admin'][Math.floor(Math.random() * 8)] as TaskType,
      priority,
      status: status as ClinicalTask['status'],
      createdAt,
      dueAt,
      clinicalClockTarget: priority <= 2 ? 30 : 120,
      dependsOnTaskIds: [],
      escalationLevel: status === 'pending' && Math.random() > 0.7 ? 1 : 0,
      escalationHistory: [],
    }
  })
}

export default function WorkflowTasksPage() {
  const [tasks, setTasks] = useState(generateTasks)
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const filteredTasks = useMemo(() => {
    let result = tasks
    if (activeStatus !== 'all') {
      result = result.filter(t => t.status === activeStatus)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(q)) ||
        t.patientId.toLowerCase().includes(q)
      )
    }
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter)
    }
    return result
  }, [tasks, activeStatus, searchQuery, typeFilter])

  const groupedByStatus = useMemo(() => {
    const grouped: Record<string, ClinicalTask[]> = {
      pending: [], in_progress: [], completed: [],
    }
    filteredTasks.forEach(t => {
      if (grouped[t.status]) grouped[t.status].push(t)
    })
    return grouped
  }, [filteredTasks])

  function handleDragStart(taskId: string) {
    setDraggedTaskId(taskId)
  }

  function handleDrop(status: ClinicalTask['status']) {
    if (draggedTaskId) {
      setTasks(prev => prev.map(t =>
        t.id === draggedTaskId ? { ...t, status, completedAt: status === 'completed' ? Date.now() : t.completedAt, startedAt: status === 'in_progress' ? Date.now() : t.startedAt } : t
      ))
      setDraggedTaskId(null)
    }
  }

  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.dueAt && t.dueAt < Date.now()).length,
    escalated: tasks.filter(t => t.escalationLevel > 0).length,
  }), [tasks])

  const statusTabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <ClipboardList size={18} color="var(--primary)" />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Task Board</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', width: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            style={{ width: '100%', height: 32, padding: '0 10px 0 30px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ height: 32, padding: '0 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Types</option>
          {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <span style={{ fontSize: 11, color: counts.overdue > 0 ? '#EF4444' : 'var(--text-muted)', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: counts.overdue > 0 ? 'rgba(239,68,68,0.1)' : 'var(--surface-elevated)' }}>
          {counts.overdue} overdue
        </span>
        {counts.escalated > 0 && (
          <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)' }}>
            {counts.escalated} escalated
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8, borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-card)' }}>
        {statusTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveStatus(tab.id)}
            style={{
              padding: '10px 16px', border: 'none', borderBottom: activeStatus === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent', color: activeStatus === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: activeStatus === tab.id ? 600 : 400, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
            }}>
            {tab.label}
            <span style={{
              padding: '1px 7px', borderRadius: 8, fontSize: 10, fontWeight: 700,
              background: activeStatus === tab.id ? 'var(--sky-50)' : 'var(--surface-elevated)',
              color: activeStatus === tab.id ? 'var(--primary)' : 'var(--text-muted)',
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 16, padding: 20, height: 'calc(100vh - 130px)', overflow: 'auto' }}>
        {activeStatus === 'all' ? (
          STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={groupedByStatus[status]}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              draggedTaskId={draggedTaskId}
            />
          ))
        ) : (
          <div style={{ flex: 1 }}>
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>No tasks in this state</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredTasks.map(task => (
                  <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanColumn({
  status, tasks, onDragStart, onDrop, draggedTaskId,
}: {
  status: string
  tasks: ClinicalTask[]
  onDragStart: (id: string) => void
  onDrop: (status: ClinicalTask['status']) => void
  draggedTaskId: string | null
}) {
  const columnConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)' },
    in_progress: { label: 'In Progress', color: C.sky, bg: 'rgba(47,128,237,0.05)', border: 'rgba(47,128,237,0.2)' },
    completed: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)' },
  }
  const config = columnConfig[status] || columnConfig.pending

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={() => onDrop(status as ClinicalTask['status'])}
      style={{
        flex: 1, minWidth: 300,
        background: config.bg, borderRadius: 12,
        border: `1px solid ${config.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${config.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: config.color }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{config.label}</span>
          <span style={{ padding: '1px 7px', borderRadius: 8, background: config.bg, color: config.color, fontSize: 10, fontWeight: 700 }}>
            {tasks.length}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tasks.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
            Drop tasks here
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  )
}

function TaskCard({ task, onDragStart }: { task: ClinicalTask; onDragStart: (id: string) => void }) {
  const priorityInfo = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.status !== 'completed' && task.dueAt && task.dueAt < Date.now()
  const taskTypeInfo = TASK_TYPES.find(t => t.value === task.type)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      style={{
        background: 'var(--surface-card)', borderRadius: 10,
        border: isOverdue ? '1px solid #EF4444' : `1px solid var(--surface-border)`,
        padding: 12, cursor: 'grab', userSelect: 'none',
        transition: 'box-shadow 0.15s, transform 0.15s',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
            background: priorityInfo.color + '18', color: priorityInfo.color,
          }}>
            {priorityInfo.label}
          </span>
          {taskTypeInfo && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {taskTypeInfo.label}
            </span>
          )}
          {task.escalationLevel > 0 && (
            <span style={{ color: '#EF4444' }}>⚠</span>
          )}
        </div>
        {isOverdue && <AlertTriangle size={14} color="#EF4444" />}
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 6, lineHeight: 1.4 }}>
        {task.title}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        <span style={{ background: 'var(--surface-elevated)', padding: '1px 6px', borderRadius: 4 }}>
          {task.patientId.slice(0, 10)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--sky-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--primary)' }}>
            {task.assignedToName?.split(' ').map(n => n[0]).join('')}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {task.assignedToName?.split(' ').slice(-1)[0]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} color={isOverdue ? '#EF4444' : 'var(--text-muted)'} />
          <span style={{ fontSize: 10, color: isOverdue ? '#EF4444' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
            {task.dueAt ? formatRelativeTime(task.dueAt) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function formatRelativeTime(timestamp: number): string {
  const diff = timestamp - Date.now()
  const abs = Math.abs(diff)
  if (abs < 60000) return 'Now'
  if (abs < 3600000) return `${Math.floor(abs / 60000)}m`
  if (abs < 86400000) return `${Math.floor(abs / 3600000)}h`
  return `${Math.floor(abs / 86400000)}d`
}
