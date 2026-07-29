'use client';
import { useState, useMemo } from 'react';
import { EventType, EventPriority, SubscriptionStatus, createEvent, getEventBusStats } from '@/lib/amexan/hmis/event-bus-engine';
import type { EventMessage, EventSubscription, WebSocketConnection } from '@/lib/amexan/hmis/event-bus-engine';

const MOCK_EVENTS: EventMessage[] = [
  createEvent(EventType.EncounterCreated, 'encounter-service', 'ENC-001', { patientId: 'P-001', type: 'emergency' }, { priority: EventPriority.High }),
  createEvent(EventType.OrderPlaced, 'order-service', 'ORD-001', { patientId: 'P-001', orderType: 'lab', isStat: true }, { priority: EventPriority.Critical }),
  createEvent(EventType.ResultAvailable, 'lab-service', 'RES-001', { patientId: 'P-001', result: 'K+ 6.8', isCritical: true }, { priority: EventPriority.Critical, correlationId: 'ORD-001' }),
  createEvent(EventType.TaskAssigned, 'task-service', 'TASK-001', { taskType: 'medication_administer', assignedTo: 'ACT-002' }, { priority: EventPriority.High }),
  createEvent(EventType.AppointmentBooked, 'scheduling-service', 'APT-001', { patientId: 'P-002', date: '2026-07-29' }),
  createEvent(EventType.PaymentReceived, 'billing-service', 'PAY-001', { invoiceId: 'INV-001', amount: 5000, method: 'M-Pesa' }, { priority: EventPriority.Normal }),
  createEvent(EventType.SystemHealthCheck, 'monitoring-service', 'SYS-CHK-001', { status: 'healthy', uptime: '72h' }, { priority: EventPriority.Low }),
];

const MOCK_SUBSCRIPTIONS: EventSubscription[] = [
  { id: 'SUB-001', subscriberId: 'notification-service', subscriberType: 'service', eventTypes: [EventType.ResultAvailable, EventType.ResultCritical, EventType.TaskAssigned, EventType.TaskEscalated, EventType.VitalSignAbnormal], status: SubscriptionStatus.Active, createdAt: Date.now() - 86400000, updatedAt: Date.now() },
  { id: 'SUB-002', subscriberId: 'audit-service', subscriberType: 'service', eventTypes: [EventType.EncounterCreated, EventType.EncounterStateChanged, EventType.OrderPlaced, EventType.PrescriptionWritten, EventType.PaymentReceived, EventType.UserLoggedIn, EventType.UserLoggedOut], status: SubscriptionStatus.Active, createdAt: Date.now() - 86400000, updatedAt: Date.now() },
  { id: 'SUB-003', subscriberId: 'realtime-ui', subscriberType: 'websocket', eventTypes: [EventType.ResultAvailable, EventType.TaskAssigned, EventType.VitalSignAbnormal, EventType.AlertTriggered], status: SubscriptionStatus.Active, createdAt: Date.now() - 43200000, updatedAt: Date.now() },
];

const PRIORITY_COLORS: Record<string, string> = { critical: '#EF4444', high: '#F59E0B', normal: '#3B82F6', low: '#64748B' };

export default function EventBusPage() {
  const [events] = useState(MOCK_EVENTS);
  const [subscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [tab, setTab] = useState<'events' | 'subscriptions'>('events');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const stats = useMemo(() => getEventBusStats(events, subscriptions, []), [events, subscriptions]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Event Bus</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XXIII — Event-driven architecture, pub/sub, WebSocket management</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Published', value: stats.totalEventsPublished, color: '#EAB308' }, { label: 'Last Hour', value: stats.eventsInLastHour, color: '#3B82F6' }, { label: 'Subscriptions', value: stats.activeSubscriptions, color: '#10B981' }, { label: 'Connections', value: stats.activeConnections, color: '#8B5CF6' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
        {(['events', 'subscriptions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: tab === t ? 'rgba(234,179,8,0.15)' : 'transparent', color: tab === t ? '#EAB308' : '#64748B', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
            {t === 'events' ? '⚡ Events' : '🔗 Subscriptions'}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map(evt => {
            const isSelected = selectedEvent === evt.id;
            return (
              <div key={evt.id} onClick={() => setSelectedEvent(isSelected ? null : evt.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(234,179,8,0.08)' : evt.priority === EventPriority.Critical ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(234,179,8,0.3)' : evt.priority === EventPriority.Critical ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                <div className="flex items-center justify-between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{evt.eventType} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {evt.source}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Source: {evt.sourceId} · {evt.correlationId && `Corr: ${evt.correlationId}`} · {new Date(evt.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${PRIORITY_COLORS[evt.priority]}20`, color: PRIORITY_COLORS[evt.priority] }}>{evt.priority}</span>
                    <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isSelected && (
                  <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Payload:</div>
                    <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6 }}>{JSON.stringify(evt.payload, null, 2)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {subscriptions.map(sub => (
            <div key={sub.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{sub.subscriberId} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {sub.subscriberType}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{sub.eventTypes.length} event types subscribed</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: sub.status === SubscriptionStatus.Active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', color: sub.status === SubscriptionStatus.Active ? '#10B981' : '#94A3B8' }}>{sub.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {sub.eventTypes.map(et => <span key={et} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{et}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
