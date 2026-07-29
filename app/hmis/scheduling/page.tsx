'use client';
import { useState, useMemo } from 'react';
import { AppointmentType, AppointmentStatus, AppointmentPriority, SlotType, ShiftType, ShiftStatus, createAppointment, detectScheduleConflicts, getAppointmentSummary } from '@/lib/amexan/hmis/scheduling-engine';
import type { Appointment, ScheduleSlot, ProviderSchedule, Shift } from '@/lib/amexan/hmis/scheduling-engine';

const MOCK_APPOINTMENTS: Appointment[] = [
  createAppointment({ patientId: 'P-001', patientName: 'John Kamau', appointmentType: AppointmentType.FollowUp, departmentId: 'DEPT-002', providerId: 'DOC-001', providerName: 'Dr. Smith', facilityId: 'HOS-001', scheduledDate: new Date().toISOString().split('T')[0], scheduledStart: '09:00', durationMinutes: 30, reason: 'HTN follow-up', priority: AppointmentPriority.Routine }),
  createAppointment({ patientId: 'P-002', patientName: 'Mary Wanjiku', appointmentType: AppointmentType.Outpatient, departmentId: 'DEPT-002', providerId: 'DOC-001', providerName: 'Dr. Smith', facilityId: 'HOS-001', scheduledDate: new Date().toISOString().split('T')[0], scheduledStart: '10:00', durationMinutes: 30, reason: 'General checkup', priority: AppointmentPriority.Routine }),
  createAppointment({ patientId: 'P-003', patientName: 'Samuel Ochieng', appointmentType: AppointmentType.ChronicDisease, departmentId: 'DEPT-002', providerId: 'DOC-002', providerName: 'Dr. Jones', facilityId: 'HOS-001', scheduledDate: new Date().toISOString().split('T')[0], scheduledStart: '11:30', durationMinutes: 45, reason: 'Diabetes review', priority: AppointmentPriority.Urgent }),
  createAppointment({ patientId: 'P-004', patientName: 'Grace Mwangi', appointmentType: AppointmentType.Vaccination, departmentId: 'DEPT-002', providerId: 'DOC-003', providerName: 'Dr. Akinyi', facilityId: 'HOS-001', scheduledDate: new Date().toISOString().split('T')[0], scheduledStart: '14:00', durationMinutes: 15, reason: 'Child immunization', priority: AppointmentPriority.Routine }),
  createAppointment({ patientId: 'P-005', patientName: 'Baby Ochieng', appointmentType: AppointmentType.WellChild, departmentId: 'DEPT-002', providerId: 'DOC-003', providerName: 'Dr. Akinyi', facilityId: 'HOS-001', scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], scheduledStart: '08:30', durationMinutes: 20, reason: '6-week checkup', priority: AppointmentPriority.Routine }),
];

MOCK_APPOINTMENTS[0].status = AppointmentStatus.Confirmed;
MOCK_APPOINTMENTS[1].status = AppointmentStatus.CheckedIn;
MOCK_APPOINTMENTS[1].actualStart = Date.now() - 600000;
MOCK_APPOINTMENTS[2].status = AppointmentStatus.Pending;

const STATUS_COLORS: Record<string, string> = { pending: '#F59E0B', confirmed: '#3B82F6', checked_in: '#8B5CF6', in_progress: '#06B6D4', completed: '#10B981', no_show: '#EF4444', cancelled: '#6B7280', rescheduled: '#F97316', on_hold: '#64748B' };

export default function SchedulingPage() {
  const [appointments] = useState(MOCK_APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null);

  const summary = useMemo(() => getAppointmentSummary(appointments), [appointments]);
  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.patientName.toLowerCase().includes(q) || a.providerName.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [appointments, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Scheduling Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XVI — Appointments, resource scheduling, shift management, calendar</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New Appointment</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Total', value: summary.total, color: '#0EA5E9' }, { label: 'Today', value: summary.todayCount, color: '#3B82F6' }, { label: 'Pending', value: summary.pending, color: '#F59E0B' }, { label: 'Confirmed', value: summary.confirmed, color: '#10B981' }, { label: 'No-Show Rate', value: `${summary.noShowRate.toFixed(0)}%`, color: '#EF4444' }, { label: 'Avg Wait', value: `${summary.avgWaitMinutes}m`, color: '#8B5CF6' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by patient, provider, reason..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as AppointmentStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Status</option>
          {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(a => {
          const isSelected = selectedAppt === a.id;
          const isToday = a.scheduledDate === today;
          return (
            <div key={a.id} onClick={() => setSelectedAppt(isSelected ? null : a.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📅</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{a.patientName} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {a.appointmentType}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{a.scheduledDate} @ {a.scheduledStart} · {a.reason} · {a.providerName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  {isToday && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(14,165,233,0.15)', color: '#0EA5E9' }}>Today</span>}
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${STATUS_COLORS[a.status]}20`, color: STATUS_COLORS[a.status] }}>{a.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Duration: <span style={{ color: '#E2E8F0' }}>{a.durationMinutes}min</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Virtual: <span style={{ color: '#E2E8F0' }}>{a.isVirtual ? 'Yes' : 'No'}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Priority: <span style={{ color: '#E2E8F0' }}>{a.priority}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Reminder sent: <span style={{ color: '#E2E8F0' }}>{a.reminderSent ? 'Yes' : 'No'}</span></div>
                  </div>
                  {a.notes && <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8', padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>Notes: {a.notes}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
