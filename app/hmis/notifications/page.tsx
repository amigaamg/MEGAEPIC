'use client';
import { useState, useMemo } from 'react';
import { NotificationType, NotificationCategory, NotificationSeverity, ChannelType, NotificationDeliveryStatus, createNotification, deliverNotification, markAsRead, getNotificationSummary, getUnreadNotifications, getUnacknowledgedCritical } from '@/lib/amexan/hmis/notification-engine';
import type { Notification, NotificationRecipient } from '@/lib/amexan/hmis/notification-engine';

const SEVERITY_COLORS: Record<string, string> = { critical: '#EF4444', urgent: '#F59E0B', important: '#3B82F6', routine: '#64748B', informational: '#6B7280', silent: '#9CA3AF' };
const CATEGORY_COLORS: Record<string, string> = { clinical: '#06B6D4', critical: '#EF4444', administrative: '#8B5CF6', appointment: '#F59E0B', billing: '#10B981', inventory: '#F97316', system: '#64748B', safety: '#DC2626', task: '#3B82F6' };

const MOCK_RECIPIENTS: NotificationRecipient[] = [{ userId: 'ACT-001', role: 'clinician', email: 'doctor@hospital.com', phone: '+254700100200' }];

const MOCK_NOTIFICATIONS: Notification[] = [
  createNotification({ type: NotificationType.CriticalLabResult, category: NotificationCategory.Critical, severity: NotificationSeverity.Critical, title: 'Critical Lab Result', body: 'Patient John Doe - Potassium 6.8 mmol/L (Critical High)', source: { type: 'system' }, sourceId: 'RES-001', recipients: MOCK_RECIPIENTS, patientId: 'P-001', encounterId: 'ENC-001' }),
  createNotification({ type: NotificationType.MedicationDue, category: NotificationCategory.Clinical, severity: NotificationSeverity.Urgent, title: 'Medication Due', body: 'Ceftriaxone 1g IV for Mary Wanjiku - Due now', source: { type: 'system' }, sourceId: 'ORD-003', recipients: MOCK_RECIPIENTS, patientId: 'P-002', encounterId: 'ENC-002' }),
  createNotification({ type: NotificationType.TaskAssigned, category: NotificationCategory.Task, severity: NotificationSeverity.Important, title: 'Task Assigned', body: 'Collect blood sample - Ward A, Bed 5', source: { type: 'user', userId: 'ACT-001' }, sourceId: 'TASK-002', recipients: MOCK_RECIPIENTS, patientId: 'P-003', encounterId: 'ENC-003' }),
  createNotification({ type: NotificationType.AppointmentReminder, category: NotificationCategory.Appointment, severity: NotificationSeverity.Routine, title: 'Appointment Reminder', body: 'You have a follow-up appointment tomorrow at 10:00 AM', source: { type: 'system' }, sourceId: 'SCH-001', recipients: MOCK_RECIPIENTS, patientId: 'P-004' }),
  createNotification({ type: NotificationType.DrugStockLow, category: NotificationCategory.Inventory, severity: NotificationSeverity.Urgent, title: 'Drug Stock Low', body: 'Amoxicillin 500mg - only 50 units remaining, reorder needed', source: { type: 'system' }, sourceId: 'INV-001', recipients: [{ userId: 'ACT-004', role: 'pharmacist' }] }),
  createNotification({ type: NotificationType.SystemAlert, category: NotificationCategory.System, severity: NotificationSeverity.Informational, title: 'System Update', body: 'System maintenance scheduled for 2:00 AM', source: { type: 'system' }, sourceId: 'SYS-001', recipients: [{ userId: 'ACT-003', role: 'admin' }] }),
];

deliverNotification(MOCK_NOTIFICATIONS[0]);
deliverNotification(MOCK_NOTIFICATIONS[1]);
deliverNotification(MOCK_NOTIFICATIONS[2]);
markAsRead(MOCK_NOTIFICATIONS[2], 'ACT-001');

export default function NotificationsPage() {
  const [notifications] = useState(MOCK_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<NotificationSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all');
  const [selectedNotif, setSelectedNotif] = useState<string | null>(null);

  const summary = useMemo(() => getNotificationSummary(notifications), [notifications]);
  const unread = useMemo(() => getUnreadNotifications(notifications, 'ACT-001'), [notifications]);
  const criticalUnack = useMemo(() => getUnacknowledgedCritical(notifications, 'ACT-001'), [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (severityFilter !== 'all' && n.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, search, severityFilter, categoryFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Notifications</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book VI — Multi-channel: in-app, SMS, email, push, WhatsApp, pager</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total', value: summary.total, color: '#EF4444' },
          { label: 'Unread', value: summary.unread, color: '#3B82F6' },
          { label: 'Critical', value: summary.critical, color: '#EF4444' },
          { label: 'Urgent', value: summary.urgent, color: '#F59E0B' },
          { label: 'Unack Critical', value: criticalUnack.length, color: '#DC2626' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as NotificationSeverity | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Severity</option>
          {Object.values(NotificationSeverity).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as NotificationCategory | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Category</option>
          {Object.values(NotificationCategory).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(n => {
          const isSelected = selectedNotif === n.id;
          const isUnread = !n.readBy.includes('ACT-001');
          return (
            <div
              key={n.id}
              onClick={() => setSelectedNotif(isSelected ? null : n.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(239,68,68,0.08)' : isUnread ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3" style={{ flex: 1, minWidth: 0 }}>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', marginTop: 5, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: n.severity === NotificationSeverity.Critical ? '#EF4444' : '#F1F5F9' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{n.body}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${CATEGORY_COLORS[n.category]}20`, color: CATEGORY_COLORS[n.category] }}>{n.category}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${SEVERITY_COLORS[n.severity]}20`, color: SEVERITY_COLORS[n.severity] }}>{n.severity}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Type: <span style={{ color: '#E2E8F0' }}>{n.type}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Source: <span style={{ color: '#E2E8F0' }}>{n.source.type}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Status: <span style={{ color: '#E2E8F0' }}>{n.status}</span></div>
                    {n.patientId && <div style={{ fontSize: 11, color: '#64748B' }}>Patient: <span style={{ color: '#E2E8F0' }}>{n.patientId}</span></div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Channels</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                    {n.channels.map((c, i) => (
                      <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: c.status === 'sent' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: c.status === 'sent' ? '#10B981' : '#F59E0B' }}>
                        {c.type} ({c.status})
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Recipients</div>
                  {n.recipients.map((r, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#94A3B8' }}>{r.userId} {r.role && `(${r.role})`} {r.email && `· ${r.email}`}</div>
                  ))}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: '8px 0 4px' }}>Read by: {n.readBy.length} · Acknowledged by: {n.acknowledgedBy.length}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
