'use client';

import React, { useState } from 'react';

interface TeamMember {
  id: string; name: string; role: string; specialty: string;
  email: string; phone?: string; status: 'online' | 'busy' | 'offline';
  avatar?: string;
}

interface Task {
  id: string; title: string; description?: string; assignedTo: string;
  patientId?: string; patientName?: string; priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed'; dueDate: string;
  createdBy: string;
}

interface Props {
  members: TeamMember[];
  tasks: Task[];
  doctorName: string;
  doctorId: string;
  onAssignTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onInviteMember: (email: string, role: string) => void;
}

const ROLE_OPTIONS = [
  'Nurse', 'Clinical Officer', 'Medical Officer', 'Consultant', 'Pharmacist',
  'Lab Technician', 'Radiographer', 'Physiotherapist', 'Nutritionist', 'Counselor',
];

const PRIORITY_COLORS = {
  urgent: { color: '#ef4444', bg: 'rgba(239,68,68,.15)' },
  high: { color: '#f97316', bg: 'rgba(249,115,22,.15)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
  low: { color: '#10b981', bg: 'rgba(16,185,129,.15)' },
};

export default function TeamPanel({ members, tasks, doctorName, doctorId, onAssignTask, onUpdateTaskStatus, onInviteMember }: Props) {
  const [tab, setTab] = useState<'members' | 'tasks' | 'invite'>('tasks');
  const [showAssign, setShowAssign] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', patientId: '', patientName: '', priority: 'medium' as Task['priority'], dueDate: '' });

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const onlineMembers = members.filter(m => m.status === 'online');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className={`filter-chip ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>📋 Tasks ({pendingTasks.length})</button>
        <button className={`filter-chip ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>👥 Team ({members.length})</button>
        <button className={`filter-chip ${tab === 'invite' ? 'active' : ''}`} onClick={() => setTab('invite')}>➕ Invite</button>
      </div>

      {tab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{pendingTasks.length} pending · {tasks.filter(t => t.status === 'completed').length} completed</div>
            <button className="btn-accent" onClick={() => setShowAssign(true)} style={{ fontSize: 11, padding: '6px 12px' }}>➕ Assign</button>
          </div>

          {pendingTasks.length === 0 && !showAssign ? (
            <div className="empty-sm"><p>No pending tasks. All clear!</p></div>
          ) : (
            pendingTasks.map(task => {
              const pc = PRIORITY_COLORS[task.priority];
              const assignee = members.find(m => m.id === task.assignedTo);
              return (
                <div key={task.id} className="task-card" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                }}>
                  <div style={{ width: 4, height: 40, borderRadius: 4, background: pc.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {task.title}
                      <span className="status-pill" style={{ background: pc.bg, color: pc.color, fontSize: 9 }}>{task.priority}</span>
                    </div>
                    {task.description && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{task.description}</div>}
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10, color: 'var(--text-2)' }}>
                      <span>👤 {assignee?.name || 'Unassigned'}</span>
                      {task.patientName && <span>🩺 {task.patientName}</span>}
                      <span>📅 {task.dueDate}</span>
                    </div>
                  </div>
                  <select className="filter-chip" value={task.status} onChange={e => onUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                    style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="completed">✅ Done</option>
                  </select>
                </div>
              );
            })
          )}

          {showAssign && (
            <div className="assign-panel" style={{ padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📝 Assign New Task</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="search-inp" value={newTask.title} onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))} placeholder="Task title *" />
                <input className="search-inp" value={newTask.description} onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))} placeholder="Description (optional)" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select className="filter-chip" value={newTask.assignedTo} onChange={e => setNewTask(n => ({ ...n, assignedTo: e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                    <option value="">— Assignee —</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                  <select className="filter-chip" value={newTask.priority} onChange={e => setNewTask(n => ({ ...n, priority: e.target.value as Task['priority'] }))}
                    style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
                <input className="search-inp" type="date" value={newTask.dueDate} onChange={e => setNewTask(n => ({ ...n, dueDate: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" onClick={() => { setShowAssign(false); setNewTask({ title: '', description: '', assignedTo: '', patientId: '', patientName: '', priority: 'medium', dueDate: '' }); }} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn-accent" onClick={() => {
                    if (newTask.title && newTask.assignedTo) {
                      onAssignTask({ ...newTask, status: 'pending', createdBy: doctorId });
                      setShowAssign(false);
                      setNewTask({ title: '', description: '', assignedTo: '', patientId: '', patientName: '', priority: 'medium', dueDate: '' });
                    }
                  }} disabled={!newTask.title || !newTask.assignedTo} style={{ flex: 2 }}>
                    ✅ Assign Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>
            <span style={{ color: '#10b981' }}>● {onlineMembers.length}</span> online · {members.length} total
          </div>
          {members.length === 0 ? (
            <div className="empty-sm"><p>No team members yet. Invite colleagues to collaborate.</p></div>
          ) : members.map(member => (
            <div key={member.id} className="member-card" style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)',
            }}>
              <div style={{ position: 'relative' }}>
                <div className="pc-ava" style={{ width: 40, height: 40, fontSize: 16 }}>{member.name[0]}</div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid var(--surface)',
                  background: member.status === 'online' ? '#10b981' : member.status === 'busy' ? '#f59e0b' : '#94a3b8',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{member.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{member.role} · {member.specialty}</div>
                <div style={{ fontSize: 10, color: 'var(--text-2)' }}>{member.email}</div>
              </div>
              <div style={{ fontSize: 11, color: member.status === 'online' ? '#10b981' : member.status === 'busy' ? '#f59e0b' : '#94a3b8', fontWeight: 700 }}>
                {member.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'invite' && (
        <div className="invite-panel" style={{ padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📧 Invite Team Member</div>
          <InviteForm onInvite={onInviteMember} />
        </div>
      )}
    </div>
  );
}

function InviteForm({ onInvite }: { onInvite: (email: string, role: string) => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Medical Officer');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (email && role) {
      onInvite(email, role);
      setSent(true);
      setTimeout(() => {
        setSent(false); setEmail('');
      }, 3000);
    }
  };

  if (sent) {
    return <div style={{ textAlign: 'center', padding: 20, color: '#10b981', fontWeight: 700 }}>✅ Invitation sent to {email}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input className="search-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.com *" />
      <select className="filter-chip" value={role} onChange={e => setRole(e.target.value)}
        style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <button className="btn-accent" onClick={handleSend} disabled={!email}>📧 Send Invitation</button>
    </div>
  );
}
