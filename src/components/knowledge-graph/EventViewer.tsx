'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { EventEngine } from '@/lib/amexan/events/engine';
import { EVENT_LABELS, EVENT_CATEGORIES } from '@/lib/amexan/events/types';
import type { ClinicalEvent, EventType } from '@/lib/amexan/events/types';

const CATEGORY_COLORS: Record<string, string> = {
  patient: '#3B82F6',
  encounter: '#10B981',
  clinical: '#8B5CF6',
  diagnostics: '#F59E0B',
  diagnosis: '#EF4444',
  treatment: '#14B8A6',
  decision_support: '#F97316',
  workflow: '#6366F1',
  documentation: '#06B6D4',
  disposition: '#84CC16',
  monitoring: '#EC4899',
  public_health: '#A855F7',
  audit: '#94A3B8',
};

function getCategory(type: EventType): string {
  for (const [cat, types] of Object.entries(EVENT_CATEGORIES)) {
    if (types.includes(type)) return cat;
  }
  return 'other';
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday ? formatTime(ts) : `${d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })} ${formatTime(ts)}`;
}

interface EventViewerProps {
  engine: EventEngine;
}

export function EventViewer({ engine }: EventViewerProps) {
  const [events, setEvents] = useState<ClinicalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClinicalEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    setEvents([...engine.getHistory({ limit: 200 })].reverse());
  }, [engine]);

  useEffect(() => {
    refresh();
    if (autoRefresh) {
      intervalRef.current = setInterval(refresh, 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, autoRefresh]);

  const stats = useMemo(() => engine.getStats(), [engine]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (filter !== 'all') {
        const cat = getCategory(e.type);
        if (cat !== filter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const label = (EVENT_LABELS[e.type] || e.type).toLowerCase();
        const payload = JSON.stringify(e.payload).toLowerCase();
        return label.includes(q) || payload.includes(q) || e.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, filter, search]);

  const runDemo = () => {
    if (demoRunning) return;
    setDemoRunning(true);

    const patientId = `demo_${Date.now()}`;
    const encounterId = `enc_demo_${Date.now()}`;
    const actor = { id: 'demo_doctor', type: 'clinician' as const, name: 'Dr. Demo', role: 'physician' };
    const patient = { id: patientId, encounterId, mrn: 'DEMO-001' };

    const demoSteps = [
      () => engine.emit('encounter.started', { type: 'outpatient' }, { actor, patient, provenance: 'system_generated' }),
      () => engine.emit('symptom.recorded', { symptomId: 'cough', name: 'Cough', duration_days: 5, severity: 7, productive: true, fever: true }, { actor, patient }),
      () => engine.emit('vital.recorded', { pulse: 102, temperature: 38.5, systolicBP: 110, diastolicBP: 70, oxygenSaturation: 94 }, { actor, patient, provenance: 'user_input' }),
      () => engine.emit('investigation.ordered', { investigationId: 'inv_cxr', name: 'Chest X-ray', priority: 'urgent' }, { actor, patient }),
      () => engine.emit('investigation.resulted', { investigationId: 'inv_cxr', name: 'Chest X-ray', result: 'Right lower lobe consolidation', impression: 'Consistent with pneumonia' }, { actor, patient, provenance: 'system_generated' }),
      () => engine.emit('diagnosis.added', { diagnosisId: 'disease_cap', name: 'Community-Acquired Pneumonia', icd10: 'J18.9', confidence: 0.85, notifiable: false }, { actor, patient }),
      () => engine.emit('treatment.prescribed', { treatmentId: 'tx_amoxicillin', name: 'Amoxicillin', dose: '500mg', frequency: 'three_times_daily', duration: 7 }, { actor, patient }),
      () => engine.emit('score.calculated', { scoreId: 'score_curb65', name: 'CURB-65', value: 2, threshold: 'moderate', interpretation: 'Short stay admission' }, { actor, patient, provenance: 'calculated' }),
      () => engine.emit('guideline.activated', { guidelineId: 'guideline_ers_cap', name: 'ERS CAP Guidelines', version: '2023' }, { actor, patient, provenance: 'system_generated' }),
      () => engine.emit('admission.ordered', { ward: 'General Medical', bed: 'Ward 3B-12', admissionType: 'short_stay' }, { actor, patient }),
      () => engine.emit('discharge.ordered', { dischargeSummary: 'Completed 7 days amoxicillin. Clinically improved. Follow up in 2 weeks.' }, { actor, patient }),
      () => engine.emit('encounter.completed', { outcome: 'discharged_home', lengthOfStay: '7 days' }, { actor, patient, provenance: 'system_generated' }),
    ];

    let i = 0;
    const runNext = () => {
      if (i < demoSteps.length) {
        demoSteps[i]();
        i++;
        setTimeout(runNext, 800);
      } else {
        setDemoRunning(false);
      }
    };
    runNext();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Total Events</div>
          <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{stats.total}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Event Types</div>
          <div className="text-xl font-bold" style={{ color: 'var(--purple)' }}>{Object.keys(stats.byType).length}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Categories</div>
          <div className="text-xl font-bold" style={{ color: 'var(--teal)' }}>{Object.keys(stats.byCategory).length}</div>
        </div>
        <div className="card p-3 flex items-end justify-end">
          <button
            onClick={runDemo}
            disabled={demoRunning}
            className="btn-primary text-xs px-3 py-1.5"
            style={{ opacity: demoRunning ? 0.5 : 1 }}
          >
            {demoRunning ? '▶ Running Demo...' : '▶ Run Demo'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          className="input flex-1 min-w-[150px]"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Events</option>
          {Object.entries(EVENT_CATEGORIES).map(([cat, types]) => (
            <option key={cat} value={cat}>{cat.replace(/_/g, ' ')} ({types.length})</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
          Auto-refresh
        </label>
        <button className="text-[10px] px-2 py-1 rounded" style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }} onClick={refresh}>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {filtered.map(event => {
            const cat = getCategory(event.type);
            const color = CATEGORY_COLORS[cat] || 'var(--text-muted)';
            const isSelected = selectedEvent?.id === event.id;
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="flex items-start gap-2.5 w-full text-left px-3 py-2 rounded-lg transition-colors"
                style={{
                  background: isSelected ? 'var(--sky-50)' : 'transparent',
                  border: isSelected ? '1px solid var(--sky-200)' : '1px solid transparent',
                }}
              >
                <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {EVENT_LABELS[event.type] || event.type}
                    </span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      {event.metadata.provenance}
                    </span>
                  </div>
                  <div className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {event.actor.name || event.actor.id} · {event.patient.id.slice(0, 16)}…
                  </div>
                </div>
                <div className="text-[9px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(event.timestamp)}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No events match your filter</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedEvent ? (
            <div className="card p-4 flex flex-col gap-3" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {EVENT_LABELS[selectedEvent.type] || selectedEvent.type}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {selectedEvent.id}
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-xs" style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>

              <div className="flex flex-col gap-1.5">
                <DetailRow label="Type" value={selectedEvent.type} />
                <DetailRow label="Timestamp" value={new Date(selectedEvent.timestamp).toISOString()} />
                <DetailRow label="Source" value={selectedEvent.source} />
                <DetailRow label="Actor" value={`${selectedEvent.actor.name || selectedEvent.actor.id} (${selectedEvent.actor.type})`} />
                <DetailRow label="Patient" value={selectedEvent.patient.id} />
                {selectedEvent.patient.encounterId && <DetailRow label="Encounter" value={selectedEvent.patient.encounterId} />}
                <DetailRow label="Provenance" value={selectedEvent.metadata.provenance} />
              </div>

              {selectedEvent.payload !== null && selectedEvent.payload !== undefined && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Payload</div>
                  <pre className="text-[9px] font-mono p-2 rounded overflow-x-auto" style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEvent.metadata.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selectedEvent.metadata.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center h-48 gap-2">
              <div className="text-2xl">📋</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Select an event</div>
              <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                Click any event in the stream to view details, or run the demo to see the full clinical workflow
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-[10px]">
      <span className="font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)', minWidth: 80 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}
