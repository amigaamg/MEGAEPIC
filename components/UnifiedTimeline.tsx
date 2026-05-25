'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// =============================================================================
// Types
// =============================================================================
type EventType =
  | 'reading' | 'note' | 'rx' | 'lab' | 'imaging'
  | 'referral' | 'alert' | 'complication' | 'teaching' | 'chat';

interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: number;   // ms epoch — sort key
  summary: string;
  actor: string;
  metadata: Record<string, unknown>;
  sourceCollection: string;
}

interface FilterChip {
  key: EventType | 'all';
  label: string;
  icon: string;
}

// =============================================================================
// Constants
// =============================================================================
const EVENT_CONFIG: Record<EventType, {
  icon: string; label: string;
  borderColor: string; bgColor: string; pillBg: string; pillText: string;
}> = {
  reading:     { icon: '📊', label: 'Reading',      borderColor: '#0ea5e9', bgColor: '#f0f9ff', pillBg: '#e0f2fe', pillText: '#0369a1' },
  note:        { icon: '📝', label: 'Clinical Note', borderColor: '#8b5cf6', bgColor: '#faf5ff', pillBg: '#ede9fe', pillText: '#6d28d9' },
  rx:          { icon: '💊', label: 'Prescription',  borderColor: '#22c55e', bgColor: '#f0fdf4', pillBg: '#dcfce7', pillText: '#15803d' },
  lab:         { icon: '🧪', label: 'Lab Order',     borderColor: '#f59e0b', bgColor: '#fffbeb', pillBg: '#fef3c7', pillText: '#b45309' },
  imaging:     { icon: '🩻', label: 'Imaging',       borderColor: '#6366f1', bgColor: '#eef2ff', pillBg: '#e0e7ff', pillText: '#4338ca' },
  referral:    { icon: '🚑', label: 'Referral',      borderColor: '#ef4444', bgColor: '#fef2f2', pillBg: '#fee2e2', pillText: '#b91c1c' },
  alert:       { icon: '⚠️', label: 'Alert',         borderColor: '#f97316', bgColor: '#fff7ed', pillBg: '#ffedd5', pillText: '#c2410c' },
  complication:{ icon: '🩹', label: 'Complication',  borderColor: '#dc2626', bgColor: '#fef2f2', pillBg: '#fee2e2', pillText: '#991b1b' },
  teaching:    { icon: '📘', label: 'Teaching',      borderColor: '#14b8a6', bgColor: '#f0fdfa', pillBg: '#ccfbf1', pillText: '#0f766e' },
  chat:        { icon: '💬', label: 'Message',       borderColor: '#94a3b8', bgColor: '#f8fafc', pillBg: '#f1f5f9', pillText: '#475569' },
};

const FILTER_CHIPS: FilterChip[] = [
  { key: 'all',      label: 'All',        icon: '⚡' },
  { key: 'reading',  label: 'Readings',   icon: '📊' },
  { key: 'note',     label: 'Notes',      icon: '📝' },
  { key: 'rx',       label: 'Rx',         icon: '💊' },
  { key: 'lab',      label: 'Labs',       icon: '🧪' },
  { key: 'imaging',  label: 'Imaging',    icon: '🩻' },
  { key: 'referral', label: 'Referrals',  icon: '🚑' },
  { key: 'alert',    label: 'Alerts',     icon: '⚠️' },
];

const COLLECTION_MAP: Array<{
  col: string; type: EventType; dateField: string;
  toSummary: (d: Record<string, unknown>) => string;
  toActor: (d: Record<string, unknown>) => string;
}> = [
  {
    col: 'toolReadings', type: 'reading', dateField: 'recordedAt',
    toSummary: d => `${d.toolName ?? 'Reading'}: ${d.value ?? '—'} ${d.unit ?? ''}`.trim(),
    toActor: d => String(d.recordedBy ?? 'System'),
  },
  {
    col: 'clinicalNotes', type: 'note', dateField: 'createdAt',
    toSummary: d => {
      const text = (d.content as Record<string, unknown>)?.text ?? d.text ?? d.summary ?? 'Clinical note';
      return String(text).slice(0, 120);
    },
    toActor: d => `Dr. ${d.doctorName ?? 'Unknown'}`,
  },
  {
    col: 'prescriptions', type: 'rx', dateField: 'createdAt',
    toSummary: d => `${d.medication ?? '—'} ${d.dosage ?? ''} ${d.frequency ?? ''}`.trim(),
    toActor: d => `Dr. ${d.doctorName ?? 'Unknown'}`,
  },
  {
    col: 'labOrders', type: 'lab', dateField: 'createdAt',
    toSummary: d => {
      const tests = Array.isArray(d.tests) ? d.tests.join(', ') : String(d.tests ?? d.testName ?? '—');
      return `${tests} · ${d.priority ?? 'Routine'}`;
    },
    toActor: d => `Dr. ${d.doctorName ?? 'Unknown'}`,
  },
  {
    col: 'imagingOrders', type: 'imaging', dateField: 'createdAt',
    toSummary: d => `${d.modality ?? '—'} – ${d.region ?? '—'}`,
    toActor: d => `Dr. ${d.doctorName ?? 'Unknown'}`,
  },
  {
    col: 'referrals', type: 'referral', dateField: 'createdAt',
    toSummary: d => `${d.specialty ?? '—'} · ${d.urgency ?? ''}`.trim(),
    toActor: d => `Dr. ${d.doctorName ?? 'Unknown'}`,
  },
  {
    col: 'alerts', type: 'alert', dateField: 'createdAt',
    toSummary: d => String(d.message ?? d.title ?? 'Alert'),
    toActor: d => String(d.source ?? 'System'),
  },
  {
    col: 'complications', type: 'complication', dateField: 'date',
    toSummary: d => String(d.complicationName ?? '—'),
    toActor: d => `Dr. ${d.doctorName ?? 'Unknown'}`,
  },
  {
    col: 'teachings', type: 'teaching', dateField: 'date',
    toSummary: d => String(d.topic ?? '—'),
    toActor: d => String(d.deliveredBy ?? 'Unknown'),
  },
  {
    col: 'chatMessages', type: 'chat', dateField: 'timestamp',
    toSummary: d => String(d.text ?? '—').slice(0, 100),
    toActor: d => String(d.sender === 'doctor' ? `Dr. ${d.doctorName ?? ''}` : 'Patient'),
  },
];

// =============================================================================
// Helpers
// =============================================================================
function tsToMs(val: unknown): number {
  if (!val) return Date.now();
  if (val instanceof Timestamp) return val.toMillis();
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'number') return val;
  return Date.now();
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ms: number) {
  const d = new Date(ms);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// =============================================================================
// BP & Medication Timeline Component
// =============================================================================
interface BpReading {
  timestamp: number;
  systolic: number;
  diastolic: number;
}

interface MedicationEvent {
  timestamp: number;
  medication: string;
  type: 'start' | 'dose_change' | 'stop';
  dosage?: string;
  frequency?: string;
  note?: string;
}


// -----------------------------------------------------------------------------
// BP & Medication Timeline (redesigned to match reference image)
// -----------------------------------------------------------------------------
function BpMedicationTimeline({ patientId }: { patientId: string }) {
  const [readings, setReadings] = useState<BpReading[]>([]);
  const [medications, setMedications] = useState<MedicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  // Real‑time BP readings from toolReadings
  useEffect(() => {
    if (!patientId) return;
    const q = query(
      collection(db, 'toolReadings'),
      where('patientId', '==', patientId),
      where('toolName', 'in', ['Blood Pressure', 'BP', 'BloodPressure']),
      orderBy('recordedAt', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const bpReadings: BpReading[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        const value = data.value as string;
        if (typeof value === 'string' && value.includes('/')) {
          const [sys, dia] = value.split('/').map(Number);
          if (!isNaN(sys) && !isNaN(dia)) {
            bpReadings.push({
              timestamp: tsToMs(data.recordedAt),
              systolic: sys,
              diastolic: dia,
            });
          }
        }
      });
      setReadings(bpReadings);
      setLoading(false);
    }, (err) => {
      console.error('BP readings error:', err);
      setLoading(false);
    });
    return unsubscribe;
  }, [patientId]);

  // Real‑time medication events from prescriptions, grouped by medication
  useEffect(() => {
    if (!patientId) return;
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const medMap = new Map<string, MedicationEvent[]>();
      snap.forEach((doc) => {
        const data = doc.data();
        const med = data.medication as string;
        if (!med) return;
        const timestamp = tsToMs(data.createdAt);
        const dosage = data.dosage as string;
        const freq = data.frequency as string;
        const instructions = data.instructions as string;
        const isActive = data.active !== false; // default true

        // Create an event for this prescription instance
        const event: MedicationEvent = {
          timestamp,
          medication: med,
          type: isActive ? 'start' : 'stop',
          dosage,
          frequency: freq,
          note: instructions,
          // For dose changes we'll detect later when we have multiple events for same med
        };

        if (!medMap.has(med)) medMap.set(med, []);
        medMap.get(med)!.push(event);
      });

      // Sort each medication's events by timestamp and detect dose changes
      const allEvents: MedicationEvent[] = [];
      for (const [med, events] of medMap.entries()) {
        events.sort((a, b) => a.timestamp - b.timestamp);
        let lastDosage: string | undefined;
        for (let i = 0; i < events.length; i++) {
          const ev = events[i];
          if (ev.type === 'start' && !lastDosage) {
            // initial start
            allEvents.push({ ...ev, type: 'start' });
            lastDosage = ev.dosage;
          } else if (ev.type === 'start' && ev.dosage !== lastDosage) {
            // dose change
            allEvents.push({
              ...ev,
              type: 'dose_change',
              note: `Dose changed from ${lastDosage} to ${ev.dosage}`,
            });
            lastDosage = ev.dosage;
          } else if (ev.type === 'stop') {
            allEvents.push(ev);
          }
        }
      }
      // Sort all events by timestamp (newest last for display? We'll show newest first)
      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      setMedications(allEvents);
    }, (err) => console.error('Med events error:', err));
    return unsubscribe;
  }, [patientId]);

  if (loading) {
    return (
      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (readings.length === 0 && medications.length === 0) return null;

  // Helper to format month and year from timestamp
  const formatMonthYear = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Group BP readings by month for a cleaner list
  const bpByMonth = new Map<string, { systolic: number; diastolic: number; timestamp: number }>();
  readings.forEach(r => {
    const monthKey = formatMonthYear(r.timestamp);
    if (!bpByMonth.has(monthKey) || r.timestamp > bpByMonth.get(monthKey)!.timestamp) {
      bpByMonth.set(monthKey, { systolic: r.systolic, diastolic: r.diastolic, timestamp: r.timestamp });
    }
  });
  const sortedBp = Array.from(bpByMonth.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

  // Prepare medication groups for timeline
  const medGroups = new Map<string, MedicationEvent[]>();
  medications.forEach(med => {
    if (!medGroups.has(med.medication)) medGroups.set(med.medication, []);
    medGroups.get(med.medication)!.push(med);
  });

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">❤️</span>
          <h3 className="font-bold text-gray-800">Blood Pressure & Medication Timeline</h3>
        </div>
        <span className="text-gray-500">{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div className="p-4 pt-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column: BP Readings */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <span>📊</span> BP (mmHg)
              </h4>
              <div className="space-y-2">
                {sortedBp.map(([month, bp]) => (
                  <div key={month} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">{month}</span>
                    <span className="font-mono text-sm">
                      {bp.systolic}/{bp.diastolic}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                  <span>Target</span>
                  <span>&lt;130/80</span>
                </div>
              </div>
              {readings.length === 0 && (
                <p className="text-sm text-gray-500">No BP readings yet</p>
              )}
            </div>

            {/* Right column: Medication Timeline */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <span>💊</span> Medication Timeline
              </h4>
              <div className="space-y-4">
                {Array.from(medGroups.entries()).map(([medName, events]) => (
                  <div key={medName} className="border-l-2 border-blue-200 pl-3">
                    <div className="font-medium text-gray-900">{medName}</div>
                    {events.map((ev, idx) => (
                      <div key={idx} className="mt-1 text-sm">
                        {ev.type === 'start' && (
                          <div className="text-green-700">
                            Started {formatDate(ev.timestamp)}
                            {ev.dosage && <span className="ml-2 text-gray-600">({ev.dosage})</span>}
                          </div>
                        )}
                        {ev.type === 'dose_change' && (
                          <div className="text-orange-600">
                            ⬆ Dose increased: {ev.dosage}
                            {ev.note && <span className="ml-1 text-gray-500 text-xs">({ev.note})</span>}
                          </div>
                        )}
                        {ev.type === 'stop' && (
                          <div className="text-red-600">
                            Stopped {formatDate(ev.timestamp)}
                          </div>
                        )}
                        {ev.frequency && (
                          <div className="text-xs text-gray-500">Frequency: {ev.frequency}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                {medications.length === 0 && (
                  <p className="text-sm text-gray-500">No medications prescribed</p>
                )}
              </div>
            </div>
          </div>

          {/* Optional adherence section – placeholder for future */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            <span className="flex items-center gap-1">✓ Adherence tracking coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Subcomponents for the timeline feed
// =============================================================================
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div style={{
      display: 'flex', gap: 14, animationDelay: `${delay}ms`,
      animation: 'tlFadeIn 0.4s ease both',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        <div style={{ width: 2, flex: 1, minHeight: 40, background: '#f1f5f9', margin: '4px 0' }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 20 }}>
        <div style={{ height: 12, width: 80, borderRadius: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 8 }} />
        <div style={{ height: 60, borderRadius: 10, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      </div>
    </div>
  );
}

function DetailModal({ event, onClose }: { event: TimelineEvent; onClose: () => void }) {
  const cfg = EVENT_CONFIG[event.type];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const data = event.metadata as any;

  function renderDetail() {
    switch (event.type) {
      case 'note':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.type && <Row label="Note Type" value={String(data.type).toUpperCase()} />}
            {data.tags && Array.isArray(data.tags) && data.tags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {(data.tags as string[]).map(t => (
                    <span key={t} style={{ background: '#ede9fe', color: '#6d28d9', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {data.type === 'soap' ? (
              <>
                <Row label="Subjective" value={String((data.content as Record<string,unknown>)?.subjective ?? '—')} />
                <Row label="Objective"  value={String((data.content as Record<string,unknown>)?.objective ?? '—')} />
                <Row label="Assessment" value={String((data.content as Record<string,unknown>)?.assessment ?? '—')} />
                <Row label="Plan"       value={String((data.content as Record<string,unknown>)?.plan ?? '—')} />
              </>
            ) : (
              <Row label="Content" value={String((data.content as Record<string,unknown>)?.text ?? data.text ?? '—')} />
            )}
          </div>
        );
      case 'rx':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Medication"    value={String(data.medication ?? '—')} />
            <Row label="Dosage"        value={String(data.dosage ?? '—')} />
            <Row label="Frequency"     value={String(data.frequency ?? '—')} />
            <Row label="Route"         value={String(data.route ?? '—')} />
            <Row label="Duration"      value={String(data.duration ?? '—')} />
            <Row label="Instructions"  value={String(data.instructions ?? '—')} />
            <Row label="Status"        value={data.active ? 'Active ✓' : 'Ended'} />
          </div>
        );
      case 'lab':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Tests"     value={Array.isArray(data.tests) ? (data.tests as string[]).join(', ') : String(data.testName ?? '—')} />
            <Row label="Priority"  value={String(data.priority ?? 'Routine')} />
            <Row label="Status"    value={String(data.status ?? '—')} />
            <Row label="Specimen"  value={String(data.specimen ?? '—')} />
            <Row label="Notes"     value={String(data.notes ?? '—')} />
            {Array.isArray(data.results) && (data.results as any[]).length > 0 && (
              <div>
                <Label>Results</Label>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(data.results as any[]).map((r, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
                      <strong>{String(r.test)}</strong>: {String(r.value)} {r.unit ? String(r.unit) : ''}
                      {r.flag && <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 700 }}>⚠ {String(r.flag)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'imaging':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Modality" value={String(data.modality ?? '—')} />
            <Row label="Region"   value={String(data.region ?? '—')} />
            <Row label="Status"   value={String(data.status ?? '—')} />
            <Row label="Report"   value={String(data.report ?? '—')} />
          </div>
        );
      case 'referral':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Specialty" value={String(data.specialty ?? '—')} />
            <Row label="Urgency"   value={String(data.urgency ?? '—')} />
            <Row label="Reason"    value={String(data.reason ?? '—')} />
            <Row label="Status"    value={String(data.status ?? '—')} />
            <Row label="Notes"     value={String(data.notes ?? '—')} />
          </div>
        );
      case 'reading':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Tool"   value={String(data.toolName ?? '—')} />
            <Row label="Value"  value={`${String(data.value ?? '—')} ${String(data.unit ?? '')}`} />
            <Row label="Status" value={String(data.status ?? '—')} />
            <Row label="Notes"  value={String(data.notes ?? '—')} />
          </div>
        );
      case 'alert':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Message"  value={String(data.message ?? data.title ?? '—')} />
            <Row label="Severity" value={String(data.severity ?? '—')} />
            <Row label="Source"   value={String(data.source ?? '—')} />
          </div>
        );
      case 'complication':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Complication" value={String(data.complicationName ?? '—')} />
            <Row label="Action Taken" value={String(data.actionTaken ?? '—')} />
            <Row label="Outcome"      value={String(data.outcome ?? '—')} />
            <Row label="Notes"        value={String(data.notes ?? '—')} />
          </div>
        );
      case 'teaching':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Topic"        value={String(data.topic ?? '—')} />
            <Row label="Content"      value={String(data.content ?? '—')} />
            <Row label="Delivered By" value={String(data.deliveredBy ?? '—')} />
          </div>
        );
      case 'chat':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="From"    value={String(data.sender === 'doctor' ? `Dr. ${data.doctorName ?? ''}` : 'Patient')} />
            <Row label="Message" value={String(data.text ?? '—')} />
          </div>
        );
      default:
        return <pre style={{ fontSize: 11, color: '#64748b', whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>;
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'tlFadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
          maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          animation: 'tlSlideUp 0.22s ease',
        }}
      >
        <div style={{
          background: cfg.bgColor, borderBottom: `1px solid ${cfg.borderColor}20`,
          borderLeft: `4px solid ${cfg.borderColor}`,
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{cfg.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>{cfg.label}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                {event.actor} · {formatDate(event.timestamp)}, {formatTime(event.timestamp)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
              width: 30, height: 30, cursor: 'pointer', fontSize: 14,
              color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {renderDetail()}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{children}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value || value === '—') return null;
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

function EventCard({
  event, isLast, index, onClick,
}: {
  event: TimelineEvent; isLast: boolean; index: number; onClick: () => void;
}) {
  const cfg = EVENT_CONFIG[event.type];

  return (
    <div style={{ display: 'flex', gap: 0, animationDelay: `${Math.min(index * 40, 400)}ms`, animation: 'tlFadeIn 0.35s ease both' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: cfg.bgColor, border: `2px solid ${cfg.borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0, zIndex: 1,
          boxShadow: `0 0 0 4px ${cfg.borderColor}18`,
        }}>
          {cfg.icon}
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, background: '#e2e8f0', minHeight: 20, margin: '4px 0' }} />
        )}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16, paddingLeft: 12 }}>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 6, marginTop: 6, letterSpacing: '0.04em' }}>
          {formatTime(event.timestamp)}
        </div>
        <button
          onClick={onClick}
          style={{
            width: '100%', textAlign: 'left', background: '#fff',
            border: `1px solid #e2e8f0`,
            borderLeft: `3px solid ${cfg.borderColor}`,
            borderRadius: 10, padding: '11px 14px',
            cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.1s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.08)`;
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{
              background: cfg.pillBg, color: cfg.pillText,
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{cfg.label}</span>
          </div>
          <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, lineHeight: 1.45, marginBottom: 6 }}>
            {event.summary}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{event.actor}</div>
        </button>
      </div>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 4px', paddingLeft: 40 }}>
      <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        background: '#f8fafc', padding: '2px 10px', borderRadius: 10,
        border: '1px solid #e2e8f0',
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
    </div>
  );
}

function EmptyState({ filter }: { filter: EventType | 'all' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>
        {filter === 'all' ? '🗂️' : EVENT_CONFIG[filter as EventType]?.icon ?? '📄'}
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#64748b', marginBottom: 6 }}>
        No events found
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.6 }}>
        {filter === 'all'
          ? 'Start by adding a clinical note, lab order, or prescription.'
          : `No ${EVENT_CONFIG[filter as EventType]?.label ?? filter} events on record.`}
      </div>
    </div>
  );
}

// =============================================================================
// Main UnifiedTimeline Component
// =============================================================================
export function UnifiedTimeline({
  patientId,
  doctorId,
}: {
  patientId: string;
  doctorId: string;
}) {
  const [eventMap, setEventMap] = useState<Map<string, TimelineEvent>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const loadedCollections = useRef(new Set<string>());

  const upsertEvents = useCallback((col: string, newEvents: TimelineEvent[]) => {
    setEventMap(prev => {
      const next = new Map(prev);
      for (const k of next.keys()) {
        if (k.startsWith(`${col}:`)) next.delete(k);
      }
      newEvents.forEach(e => next.set(`${col}:${e.id}`, e));
      return next;
    });
    loadedCollections.current.add(col);
    if (loadedCollections.current.size >= COLLECTION_MAP.length) setLoading(false);
  }, []);

  useEffect(() => {
    if (!patientId) return;
    loadedCollections.current.clear();

    const unsubs = COLLECTION_MAP.map(({ col, type, dateField, toSummary, toActor }) => {
      const q = query(
        collection(db, col),
        where('patientId', '==', patientId),
        orderBy(dateField, 'desc'),
        limit(50),
      );
      return onSnapshot(q, snap => {
        const events: TimelineEvent[] = snap.docs.map(d => {
          const data = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            type,
            timestamp: tsToMs(data[dateField]),
            summary: toSummary(data),
            actor: toActor(data),
            metadata: data,
            sourceCollection: col,
          };
        });
        upsertEvents(col, events);
      }, () => {
        upsertEvents(col, []);
      });
    });

    return () => unsubs.forEach(u => u());
  }, [patientId, upsertEvents]);

  const allEvents = Array.from(eventMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  const filtered = activeFilter === 'all' ? allEvents : allEvents.filter(e => e.type === activeFilter);

  const grouped: Array<{ dateLabel: string; events: TimelineEvent[] }> = [];
  let lastLabel = '';
  for (const ev of filtered) {
    const label = formatDate(ev.timestamp);
    if (label !== lastLabel) {
      grouped.push({ dateLabel: label, events: [] });
      lastLabel = label;
    }
    grouped[grouped.length - 1].events.push(ev);
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%  { background-position: 200% 0 }
          100%{ background-position: -200% 0 }
        }
        @keyframes tlFadeIn {
          from { opacity: 0; transform: translateY(6px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes tlSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
        .tl-chip { transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
        .tl-chip:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#1e293b' }}>
        {/* BP & Medication Timeline */}
        <BpMedicationTimeline patientId={patientId} />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', letterSpacing: '-0.01em', marginBottom: 2 }}>
            Clinical Journey
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            {allEvents.length} event{allEvents.length !== 1 ? 's' : ''} recorded
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20,
          scrollbarWidth: 'none',
        }}>
          {FILTER_CHIPS.map(chip => {
            const isActive = activeFilter === chip.key;
            const count = chip.key === 'all'
              ? allEvents.length
              : allEvents.filter(e => e.type === chip.key).length;
            return (
              <button
                key={chip.key}
                className="tl-chip"
                onClick={() => setActiveFilter(chip.key)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: isActive ? '#2563eb' : '#f1f5f9',
                  color: isActive ? '#fff' : '#64748b',
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 13 }}>{chip.icon}</span>
                {chip.label}
                {count > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isActive ? '#fff' : '#64748b',
                    fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px',
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[0, 1, 2, 3].map(i => <SkeletonCard key={i} delay={i * 80} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div>
            {grouped.map(({ dateLabel, events }) => (
              <div key={dateLabel}>
                <DateDivider label={dateLabel} />
                {events.map((ev, i) => (
                  <EventCard
                    key={`${ev.sourceCollection}:${ev.id}`}
                    event={ev}
                    index={i}
                    isLast={i === events.length - 1 && dateLabel === grouped[grouped.length - 1].dateLabel}
                    onClick={() => setSelectedEvent(ev)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <DetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}

export default UnifiedTimeline;