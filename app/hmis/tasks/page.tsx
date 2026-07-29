'use client';
import { useState, useMemo } from 'react';
import { Task, TaskType, TaskPriority, TaskStatus, TaskSource, EscalationAction, createTask, assignTask, startTask, completeTask, cancelTask, escalateTask, getTaskSummary, getOverdueTasks, getTaskByStatus } from '@/lib/amexan/hmis/task-engine';

const PRIORITY_ORDER = [TaskPriority.STAT, TaskPriority.Emergency, TaskPriority.Urgent, TaskPriority.High, TaskPriority.Medium, TaskPriority.Low, TaskPriority.Routine];

const MOCK_TASKS: Task[] = [
  createTask({ taskType: TaskType.PrescriptionFill, title: 'Fill Amoxicillin 500mg', description: 'Patient John Doe - 3x daily for 7 days', priority: TaskPriority.Urgent, source: TaskSource.DoctorOrder, sourceId: 'ORD-001', departmentId: 'DEPT-005', assignedTo: ['ACT-004'], assignedBy: 'ACT-001', patientId: 'P-001', encounterId: 'ENC-001' }),
  createTask({ taskType: TaskType.LabSampleCollect, title: 'Collect Blood - Bed 5', description: 'FBC, UECs, LFTs - Ward A', priority: TaskPriority.High, source: TaskSource.DoctorOrder, sourceId: 'ORD-002', departmentId: 'DEPT-002', assignedTo: ['ACT-005'], assignedBy: 'ACT-001', patientId: 'P-002', encounterId: 'ENC-002' }),
  createTask({ taskType: TaskType.MedicationAdminister, title: 'Administer IV Ceftriaxone', description: '1g IV stat - Bed 3 ICU', priority: TaskPriority.Emergency, source: TaskSource.DoctorOrder, sourceId: 'ORD-003', departmentId: 'DEPT-003', assignedTo: ['ACT-002'], assignedBy: 'ACT-001', patientId: 'P-003', encounterId: 'ENC-003' }),
  createTask({ taskType: TaskType.VitalSignsRecord, title: 'Record Vital Signs', description: '4-hourly vitals - Ward B', priority: TaskPriority.Routine, source: TaskSource.Recurring, sourceId: 'SCH-001', departmentId: 'DEPT-002', assignedTo: ['ACT-002', 'ACT-003'], assignedBy: 'system', patientId: 'P-004', encounterId: 'ENC-004' }),
  createTask({ taskType: TaskType.DischargeProcess, title: 'Process Discharge', description: 'Patient Mary Wanjiku - Discharge summary needed', priority: TaskPriority.Medium, source: TaskSource.DoctorOrder, sourceId: 'ORD-004', departmentId: 'DEPT-002', assignedTo: ['ACT-001'], assignedBy: 'ACT-002', patientId: 'P-002', encounterId: 'ENC-002' }),
];

assignTask(MOCK_TASKS[0], 'ACT-004');
startTask(MOCK_TASKS[0]);
MOCK_TASKS[0].dueBy = Date.now() + 3600000;

assignTask(MOCK_TASKS[1], 'ACT-005');

assignTask(MOCK_TASKS[2], 'ACT-002');
MOCK_TASKS[2].dueBy = Date.now() - 600000;

assignTask(MOCK_TASKS[3], 'ACT-002');
assignTask(MOCK_TASKS[3], 'ACT-003');

assignTask(MOCK_TASKS[4], 'ACT-001');

const PRIORITY_COLORS: Record<string, string> = {
  [TaskPriority.STAT]: '#EF4444', [TaskPriority.Emergency]: '#EF4444', [TaskPriority.Urgent]: '#F59E0B',
  [TaskPriority.High]: '#F97316', [TaskPriority.Medium]: '#3B82F6', [TaskPriority.Low]: '#64748B', [TaskPriority.Routine]: '#6B7280',
};
const STATUS_COLORS: Record<string, string> = {
  [TaskStatus.Pending]: '#64748B', [TaskStatus.Assigned]: '#3B82F6', [TaskStatus.Accepted]: '#8B5CF6',
  [TaskStatus.InProgress]: '#F59E0B', [TaskStatus.Completed]: '#10B981', [TaskStatus.Verified]: '#34D399',
  [TaskStatus.Cancelled]: '#6B7280', [TaskStatus.Escalated]: '#EF4444', [TaskStatus.Failed]: '#DC2626',
};

export default function TaskEnginePage() {
  const [tasks] = useState(MOCK_TASKS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueBy' | 'createdAt'>('priority');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const summary = useMemo(() => getTaskSummary(tasks), [tasks]);
  const overdue = useMemo(() => getOverdueTasks(tasks), [tasks]);

  const filtered = useMemo(() => {
    let result = tasks.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      }
      return true;
    });
    if (sortBy === 'priority') {
      result.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
    } else if (sortBy === 'dueBy') {
      result.sort((a, b) => (a.dueBy ?? Infinity) - (b.dueBy ?? Infinity));
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [tasks, search, statusFilter, priorityFilter, sortBy]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Task Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book V — 30+ task types, 3-level escalation, dependencies, completion proof</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Create Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total', value: summary.total, color: '#10B981' },
          { label: 'Pending', value: summary.pending, color: '#F59E0B' },
          { label: 'In Progress', value: summary.inProgress, color: '#3B82F6' },
          { label: 'Completed', value: summary.completed, color: '#10B981' },
          { label: 'Overdue', value: summary.overdue, color: '#EF4444' },
          { label: 'Escalated', value: summary.escalated, color: '#DC2626' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {overdue.length > 0 && (
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', marginBottom: 4 }}>⚠ {overdue.length} Overdue Task{overdue.length > 1 ? 's' : ''}</div>
          {overdue.map(t => <div key={t.id} style={{ fontSize: 11, color: '#FCA5A5' }}>{t.title} — due {new Date(t.dueBy!).toLocaleString()}</div>)}
        </div>
      )}

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TaskStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Status</option>
          {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Priority</option>
          {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="priority">Sort: Priority</option>
          <option value="dueBy">Sort: Due Date</option>
          <option value="createdAt">Sort: Created</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(task => {
          const isSelected = selectedTask === task.id;
          const isOverdue = task.dueBy && task.dueBy < Date.now() && ![TaskStatus.Completed, TaskStatus.Verified, TaskStatus.Cancelled].includes(task.status);
          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(isSelected ? null : task.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(16,185,129,0.08)' : isOverdue ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(16,185,129,0.3)' : isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" style={{ flex: 1 }}>
                  <div style={{ width: 4, height: 36, borderRadius: 2, background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${STATUS_COLORS[task.status]}20`, color: STATUS_COLORS[task.status] }}>{task.status}</span>
                  {isOverdue && <span style={{ fontSize: 10, color: '#EF4444' }}>⚠</span>}
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Type: <span style={{ color: '#E2E8F0' }}>{task.taskType}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Source: <span style={{ color: '#E2E8F0' }}>{task.source}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Dept: <span style={{ color: '#E2E8F0' }}>{task.departmentId}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Assigned: <span style={{ color: '#E2E8F0' }}>{task.assignedTo.join(', ')}</span></div>
                    {task.dueBy && <div style={{ fontSize: 11, color: '#64748B' }}>Due: <span style={{ color: isOverdue ? '#EF4444' : '#E2E8F0' }}>{new Date(task.dueBy).toLocaleString()}</span></div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Escalation Policy (Level {task.escalation.currentLevel}/{task.escalation.maxEscalations})</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {task.escalation.levels.map(l => (
                      <span key={l.level} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: task.escalation.currentLevel >= l.level ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', color: task.escalation.currentLevel >= l.level ? '#EF4444' : '#64748B' }}>
                        {l.level}: {l.afterMinutes}m → {l.action}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Dependencies ({task.dependencies.length})</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {task.dependencies.map(d => (
                      <span key={d.taskId} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: d.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: d.status === 'completed' ? '#10B981' : '#F59E0B' }}>
                        {d.taskId} ({d.status})
                      </span>
                    ))}
                    {task.dependencies.length === 0 && <span style={{ fontSize: 10, color: '#475569' }}>None</span>}
                  </div>
                  {task.notes.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Notes ({task.notes.length})</div>
                      {task.notes.map(n => <div key={n.id} style={{ fontSize: 11, color: '#94A3B8', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, marginBottom: 2 }}>{n.text}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
