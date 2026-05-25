'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, doc, updateDoc, Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { writeTimelineEvent } from '@/lib/firebaseTimeline';

type TaskType = 'review' | 'investigation' | 'medication_renewal' | 'referral' | 'follow_up' | 'discharge' | 'procedure' | 'admin';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface WorkflowTask {
  id?: string;
  patientId: string; patientName?: string;
  doctorId: string; doctorName: string;
  assignedTo?: string; assignedToName?: string;
  taskType: TaskType; title: string;
  description?: string;
  priority: TaskPriority; status: TaskStatus;
  dueDate?: Timestamp | any;
  linkedDocId?: string; linkedCollection?: string;
  createdBy: string; createdAt: Timestamp | any;
  completedAt?: Timestamp | any;
  notes?: string;
  isRecurring: boolean; recurrencePattern?: string;
}

const TASK_TYPE_CONFIG: Record<TaskType, { icon: string; label: string }> = {
  review: { icon: '🩺', label: 'Review' },
  investigation: { icon: '🔬', label: 'Investigation' },
  medication_renewal: { icon: '💊', label: 'Medication Renewal' },
  referral: { icon: '📨', label: 'Referral' },
  follow_up: { icon: '📅', label: 'Follow-up' },
  discharge: { icon: '🏡', label: 'Discharge' },
  procedure: { icon: '🔧', label: 'Procedure' },
  admin: { icon: '📋', label: 'Admin' },
};

const priorityConfig: Record<TaskPriority, { color: string; bg: string }> = {
  low: { color: '#10b981', bg: '#10b98110' },
  medium: { color: '#3b82f6', bg: '#3b82f610' },
  high: { color: '#f59e0b', bg: '#f59e0b10' },
  urgent: { color: '#ef4444', bg: '#ef444410' },
};

const fmtDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

interface Props {
  patientId?: string; doctorId: string; doctorName: string;
  compact?: boolean;
}

export default function WorkflowTaskEngine({ patientId, doctorId, doctorName, compact }: Props) {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('pending');
  const [formData, setFormData] = useState({
    title: '', description: '', taskType: 'review' as TaskType,
    priority: 'medium' as TaskPriority, dueDate: '', isRecurring: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const col = collection(db, 'workflow_tasks');
    const q = patientId
      ? query(col, where('patientId', '==', patientId), orderBy('createdAt', 'desc'))
      : query(col, where('doctorId', '==', doctorId), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      snap => { setTasks(snap.docs.map(d => ({ id: d.id, ...(d.data() as DocumentData) } as WorkflowTask))); setLoading(false); },
      () => setLoading(false),
    );
    return () => unsub();
  }, [patientId, doctorId]);

  const displayTasks = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed' && t.status !== 'cancelled');
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');

  const handleCreate = useCallback(async () => {
    if (!formData.title.trim()) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'workflow_tasks'), {
        patientId: patientId || '', doctorId, doctorName,
        taskType: formData.taskType, title: formData.title,
        description: formData.description, priority: formData.priority,
        status: 'pending', isRecurring: formData.isRecurring,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        createdBy: doctorId, createdAt: serverTimestamp(),
      });
      await writeTimelineEvent({
        patientId: patientId || '', type: 'task_assigned',
        title: `${TASK_TYPE_CONFIG[formData.taskType].icon} Task: ${formData.title}`,
        description: formData.description || '',
        severity: formData.priority === 'urgent' ? 'critical' : formData.priority === 'high' ? 'warning' : 'info',
        createdBy: doctorId, linkedDocId: ref.id, linkedCollection: 'workflow_tasks',
        metadata: { priority: formData.priority, taskType: formData.taskType },
      });
      setFormData({ title: '', description: '', taskType: 'review', priority: 'medium', dueDate: '', isRecurring: false });
      setShowForm(false);
    } catch (e) { console.error('Create task failed:', e); }
    setSaving(false);
  }, [formData, patientId, doctorId, doctorName]);

  const handleStatusUpdate = useCallback(async (taskId: string, status: TaskStatus) => {
    const update: any = { status };
    if (status === 'completed') update.completedAt = serverTimestamp();
    await updateDoc(doc(db, 'workflow_tasks', taskId), update);
    if (status === 'completed') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await writeTimelineEvent({
          patientId: task.patientId, type: 'task_completed',
          title: `✔️ Task Completed: ${task.title}`,
          severity: 'success', createdBy: doctorId,
          linkedDocId: taskId, linkedCollection: 'workflow_tasks',
        });
      }
    }
  }, [doctorId, tasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {/* Urgent banner */}
      {urgentTasks.length > 0 && (
        <div style={{ padding: compact ? 8 : 10, borderRadius: 10, background: '#ef444410', border: '1px solid #ef444430', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontWeight: 800, fontSize: compact ? 11 : 12, color: '#ef4444' }}>🚨 {urgentTasks.length} Urgent Task{urgentTasks.length > 1 ? 's' : ''}</div>
          {urgentTasks.map(t => (
            <div key={t.id} style={{ fontSize: compact ? 10 : 11, marginTop: 2, color: 'var(--text-2)' }}>
              {t.title} {t.dueDate && <span style={{ color: 'var(--muted)' }}>· Due: {fmtDate(t.dueDate)}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {([
          { id: 'pending' as const, label: '⏳ Active', count: pendingTasks.length },
          { id: 'all' as const, label: '📋 All', count: tasks.length },
          { id: 'completed' as const, label: '✅ Done', count: tasks.filter(t => t.status === 'completed').length },
        ]).map(s => (
          <button key={s.id} className={`filter-chip ${filterStatus === s.id ? 'active' : ''}`}
            onClick={() => setFilterStatus(s.id)} style={{ fontSize: 10, padding: '3px 10px' }}>
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Create task */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-sm-accent" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '➕ Create Task'}
        </button>
      </div>

      {showForm && (
        <div style={{ padding: compact ? 10 : 14, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="form-grid-2">
            <div className="field-col">
              <span className="field-lbl">Task Type</span>
              <select className="field-inp" value={formData.taskType} onChange={e => setFormData(prev => ({ ...prev, taskType: e.target.value as TaskType }))}>
                {Object.entries(TASK_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="field-col">
              <span className="field-lbl">Priority</span>
              <select className="field-inp" value={formData.priority} onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}>
                <option value="low">🟢 Low</option>
                <option value="medium">🔵 Medium</option>
                <option value="high">🟡 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>
          <div className="field-col">
            <span className="field-lbl">Task Title *</span>
            <input className="field-inp" placeholder="e.g. Review HbA1c results, Renew metformin prescription"
              value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
          </div>
          <div className="field-col">
            <span className="field-lbl">Description</span>
            <textarea className="field-ta" rows={2} placeholder="Additional details..."
              value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="field-col" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <span className="field-lbl">Due Date</span>
              <input className="field-inp" type="date" value={formData.dueDate}
                onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.isRecurring}
                onChange={e => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))} />
              Recurring
            </label>
          </div>
          <button className="btn-accent" onClick={handleCreate} disabled={saving || !formData.title.trim()}>
            {saving ? 'Creating...' : '📋 Create Task'}
          </button>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 4 }} />)
      ) : displayTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 16, color: 'var(--muted)', fontSize: 12 }}>No tasks.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {displayTasks.map(task => {
            const pc = priorityConfig[task.priority];
            const tc = TASK_TYPE_CONFIG[task.taskType];
            const isOverdue = task.dueDate && new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate) < new Date() && task.status === 'pending';
            return (
              <div key={task.id} style={{
                padding: compact ? 6 : 8, borderRadius: 8,
                background: task.status === 'completed' ? '#10b98105' : pc.bg,
                border: `1px solid ${isOverdue ? '#ef4444' : pc.color}25`,
                borderLeft: `3px solid ${isOverdue ? '#ef4444' : pc.color}`,
                opacity: task.status === 'completed' ? 0.6 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12 }}>
                      {tc.icon} {task.title}
                    </div>
                    {task.description && <div style={{ fontSize: compact ? 10 : 11, color: 'var(--text-2)', marginTop: 2 }}>{task.description}</div>}
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 99, background: pc.bg, color: pc.color, fontWeight: 600 }}>{task.priority}</span>
                      <span style={{ fontSize: 9, color: 'var(--muted)' }}>{tc.label}</span>
                      {isOverdue && <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700 }}>⚠️ Overdue</span>}
                      {task.dueDate && !isOverdue && <span style={{ fontSize: 9, color: 'var(--muted)' }}>Due: {fmtDate(task.dueDate)}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {task.status === 'pending' && (
                      <>
                        <button className="btn-action" style={{ fontSize: 9, padding: '2px 6px', color: '#3b82f6' }} onClick={() => task.id && handleStatusUpdate(task.id, 'in_progress')}>▶️</button>
                        <button className="btn-action" style={{ fontSize: 9, padding: '2px 6px', color: '#10b981' }} onClick={() => task.id && handleStatusUpdate(task.id, 'completed')}>✅</button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <button className="btn-action" style={{ fontSize: 9, padding: '2px 6px', color: '#10b981' }} onClick={() => task.id && handleStatusUpdate(task.id, 'completed')}>✅</button>
                    )}
                    <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(task.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
