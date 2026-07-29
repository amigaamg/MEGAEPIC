'use client';
import { useState, useMemo } from 'react';
import { Actor, ActorType, ActorStatus, createActor, assignRole, removeRole, hasPermission, getActorTaskSummary, getTaskByPriority, createSession } from '@/lib/amexan/hmis/user-model';
import type { ActorRole, SessionInfo, DeviceInfo } from '@/lib/amexan/hmis/user-model';
import { TaskPriority, TaskStatus, TaskSource } from '@/lib/amexan/hmis/task-engine';

const MOCK_ACTORS: Actor[] = [
  createActor('ACT-001', 'ID-001', 'P-001', ActorType.Clinician),
  createActor('ACT-002', 'ID-002', 'P-002', ActorType.Nurse),
  createActor('ACT-003', 'ID-003', 'P-003', ActorType.Administrator),
  createActor('ACT-004', 'ID-004', 'P-004', ActorType.Pharmacist),
  createActor('ACT-005', 'ID-005', 'P-005', ActorType.LabScientist),
  createActor('ACT-006', 'ID-006', 'P-006', ActorType.Radiographer),
  createActor('ACT-007', 'ID-007', 'P-007', ActorType.Receptionist),
  createActor('ACT-008', 'ID-008', 'P-008', ActorType.Physiotherapist),
];

MOCK_ACTORS[0].activeRoles = [{ roleId: 'R1', roleName: 'Senior Doctor', organizationId: 'ORG-001', departmentId: 'DEPT-001', isPrimary: true, startedAt: Date.now() - 31536000000, permissions: ['patient.read', 'patient.write', 'prescription.write', 'order.write', 'result.read', '*'], scope: { type: 'department', departmentIds: ['DEPT-001'] } }];
MOCK_ACTORS[0].permissions = ['patient.read', 'patient.write', 'prescription.write', 'order.write', 'result.read', '*'];
MOCK_ACTORS[1].activeRoles = [{ roleId: 'R2', roleName: 'Staff Nurse', organizationId: 'ORG-001', departmentId: 'DEPT-002', isPrimary: true, startedAt: Date.now() - 15768000000, permissions: ['patient.read', 'vitals.write', 'medication.administer'], scope: { type: 'unit', unitIds: ['UNIT-IM-1'] } }];
MOCK_ACTORS[1].permissions = ['patient.read', 'vitals.write', 'medication.administer'];
MOCK_ACTORS[2].activeRoles = [{ roleId: 'R3', roleName: 'Hospital Admin', organizationId: 'ORG-001', isPrimary: true, startedAt: Date.now() - 47304000000, permissions: ['*'], scope: { type: 'global' } }];
MOCK_ACTORS[2].permissions = ['*'];

MOCK_ACTORS[0].tasks = [
  { taskId: 'TK-001', taskType: 'prescription_fill' as any, title: 'Review Amoxicillin Rx', description: 'Patient John Doe - Amoxicillin 500mg', priority: TaskPriority.Urgent, status: TaskStatus.Assigned, source: TaskSource.DoctorOrder, sourceId: 'ORD-001', assignedBy: 'ACT-001', assignedAt: Date.now() - 1800000, dependsOn: [], metadata: {} },
  { taskId: 'TK-002', taskType: 'lab_sample_collect' as any, title: 'Collect Blood Sample', description: 'Ward A, Bed 5 - FBC, UECs', priority: TaskPriority.High, status: TaskStatus.InProgress, source: TaskSource.Schedule, sourceId: 'ORD-002', assignedBy: 'ACT-001', assignedAt: Date.now() - 3600000, startedAt: Date.now() - 1200000, dependsOn: [], metadata: {} },
];
MOCK_ACTORS[1].tasks = [
  { taskId: 'TK-003', taskType: 'medication_administer' as any, title: 'Administer IV Antibiotics', description: 'Ceftriaxone 1g IV - Bed 3', priority: TaskPriority.Emergency, status: TaskStatus.Assigned, source: TaskSource.DoctorOrder, sourceId: 'ORD-003', assignedBy: 'ACT-001', assignedAt: Date.now() - 600000, dependsOn: [], metadata: {} },
];

export default function UserModelPage() {
  const [actors] = useState(MOCK_ACTORS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActorType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActorStatus | 'all'>('all');
  const [selectedActor, setSelectedActor] = useState<string | null>(null);

  const filteredActors = useMemo(() => {
    return actors.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search) return a.id.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
      return true;
    });
  }, [actors, search, typeFilter, statusFilter]);

  const summary = useMemo(() => ({
    total: actors.length,
    active: actors.filter(a => a.status === ActorStatus.Active).length,
    clinicians: actors.filter(a => a.type === ActorType.Clinician || a.type === ActorType.Consultant).length,
    nurses: actors.filter(a => a.type === ActorType.Nurse).length,
    onLeave: actors.filter(a => a.status === ActorStatus.OnLeave).length,
  }), [actors]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>User Model</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book II — Actor roles, permissions, sessions, task assignments</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Add Actor
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Actors', value: summary.total, color: '#8B5CF6' },
          { label: 'Active', value: summary.active, color: '#10B981' },
          { label: 'Clinicians', value: summary.clinicians, color: '#3B82F6' },
          { label: 'Nurses', value: summary.nurses, color: '#EC4899' },
          { label: 'On Leave', value: summary.onLeave, color: '#F59E0B' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by ID or type..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as ActorType | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Types</option>
          {Object.values(ActorType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ActorStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Status</option>
          {Object.values(ActorStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredActors.map(actor => {
          const summary = getActorTaskSummary(actor);
          const isSelected = selectedActor === actor.id;
          return (
            <div
              key={actor.id}
              onClick={() => setSelectedActor(isSelected ? null : actor.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#8B5CF6' }}>
                    {actor.type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{actor.id} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{actor.type}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Roles: {actor.activeRoles.map(r => r.roleName).join(', ') || 'None'} · {summary.total} tasks</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: actor.status === ActorStatus.Active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: actor.status === ActorStatus.Active ? '#10B981' : '#EF4444' }}>
                    {actor.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 10, color: '#64748B' }}>Pending</div><div style={{ fontSize: 16, fontWeight: 600, color: '#F59E0B' }}>{summary.pending}</div></div>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 10, color: '#64748B' }}>In Progress</div><div style={{ fontSize: 16, fontWeight: 600, color: '#3B82F6' }}>{summary.inProgress}</div></div>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 10, color: '#64748B' }}>Completed</div><div style={{ fontSize: 16, fontWeight: 600, color: '#10B981' }}>{summary.completed}</div></div>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 10, color: '#64748B' }}>Overdue</div><div style={{ fontSize: 16, fontWeight: 600, color: '#EF4444' }}>{summary.overdue}</div></div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Roles</div>
                  {actor.activeRoles.map(role => (
                    <div key={role.roleId} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 4, fontSize: 12, color: '#E2E8F0' }}>
                      <div className="flex items-center justify-between">
                        <span>{role.roleName} <span style={{ color: '#64748B' }}>@{role.organizationId}</span></span>
                        <span style={{ fontSize: 10, color: '#64748B' }}>{role.isPrimary ? 'Primary' : 'Secondary'}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Permissions: {role.permissions.slice(0, 3).join(', ')}{role.permissions.length > 3 && '...'}</div>
                    </div>
                  ))}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: '12px 0 6px' }}>Permissions ({actor.permissions.length})</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {actor.permissions.map(p => (
                      <span key={p} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
