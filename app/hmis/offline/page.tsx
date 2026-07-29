'use client';
import { useState, useMemo } from 'react';
import { SyncPriority, QueueStatus, ItemStatus, ConflictType, createOfflineQueue, addToQueue, resolveConflict, getSyncStats } from '@/lib/amexan/hmis/offline-engine';
import type { OfflineQueue } from '@/lib/amexan/hmis/offline-engine';

const MOCK_QUEUE: OfflineQueue = createOfflineQueue('DEV-001', 'ACT-001');
addToQueue(MOCK_QUEUE, { entityType: 'encounter', entityId: 'ENC-010', operation: 'create', payload: { patientId: 'P-020', chiefComplaint: 'Headache' }, priority: SyncPriority.High });
addToQueue(MOCK_QUEUE, { entityType: 'vital_sign', entityId: 'VS-015', operation: 'update', payload: { bloodPressure: '140/90', heartRate: 88 }, priority: SyncPriority.Normal });
addToQueue(MOCK_QUEUE, { entityType: 'observation', entityId: 'OBS-005', operation: 'create', payload: { note: 'Patient improving' }, priority: SyncPriority.Low });
MOCK_QUEUE.items[0].status = ItemStatus.Synced;
MOCK_QUEUE.items[0].syncedAt = Date.now() - 300000;
MOCK_QUEUE.items[1].status = ItemStatus.Pending;
MOCK_QUEUE.items[2].status = ItemStatus.Pending;
MOCK_QUEUE.pendingItems = 2;

export default function OfflinePage() {
  const [queue] = useState(MOCK_QUEUE);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const stats = useMemo(() => getSyncStats(queue), [queue]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Offline Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XXII — Offline data sync, conflict resolution, local storage management</p>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>Queue Active</span>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#78716C,#57534E)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Sync Now</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Queued', value: stats.totalQueued, color: '#78716C' }, { label: 'Pending', value: stats.pending, color: '#F59E0B' }, { label: 'Synced', value: stats.synced, color: '#10B981' }, { label: 'Failed', value: stats.failed, color: '#EF4444' }, { label: 'Conflicts', value: stats.conflicts, color: '#DC2626' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>Queue Items</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {queue.items.map(item => {
          const isSelected = selectedItem === item.id;
          return (
            <div key={item.id} onClick={() => setSelectedItem(isSelected ? null : item.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(120,113,108,0.08)' : item.status === ItemStatus.Failed ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(120,113,108,0.3)' : item.status === ItemStatus.Failed ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{item.operation.toUpperCase()} {item.entityType} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>#{item.entityId}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Retries: {item.retryCount}/{item.maxRetries} · Checksum: {item.checksum}</div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: item.priority === SyncPriority.Critical ? 'rgba(239,68,68,0.15)' : item.priority === SyncPriority.High ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: item.priority === SyncPriority.Critical ? '#EF4444' : item.priority === SyncPriority.High ? '#F59E0B' : '#94A3B8' }}>{item.priority}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: item.status === ItemStatus.Synced ? 'rgba(16,185,129,0.15)' : item.status === ItemStatus.Pending ? 'rgba(245,158,11,0.15)' : item.status === ItemStatus.Failed ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', color: item.status === ItemStatus.Synced ? '#10B981' : item.status === ItemStatus.Pending ? '#F59E0B' : item.status === ItemStatus.Failed ? '#EF4444' : '#94A3B8' }}>{item.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Payload:</div>
                  <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6 }}>{JSON.stringify(item.payload, null, 2)}</div>
                  {item.dependencies.length > 0 && <div style={{ marginTop: 8, fontSize: 11, color: '#64748B' }}>Dependencies: {item.dependencies.join(', ')}</div>}
                  {item.error && <div style={{ marginTop: 4, fontSize: 11, color: '#EF4444' }}>Error: {item.error}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
