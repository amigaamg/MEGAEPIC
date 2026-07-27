'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AtomicFactStore } from '@/lib/amexan/storage/engine';
import type { AtomicFact, FactQuery } from '@/lib/amexan/storage/types';

interface FactStoreViewerProps {
  store: AtomicFactStore;
  eventEngine: { onCascade: (cb: (effect: unknown, trigger: import('@/lib/amexan/events/types').ClinicalEvent) => void) => () => void };
}

export function FactStoreViewer({ store, eventEngine }: FactStoreViewerProps) {
  const [facts, setFacts] = useState<AtomicFact[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedFact, setSelectedFact] = useState<AtomicFact | null>(null);

  const refresh = useCallback(() => {
    const q: FactQuery = {};
    if (statusFilter === 'any') q.status = 'any';
    else if (statusFilter === 'active') q.status = 'active';
    else if (statusFilter === 'superseded') q.status = 'superseded';
    else if (statusFilter === 'invalidated') q.status = 'invalidated';
    q.sortBy = 'recordedAt';
    q.sortOrder = 'desc';
    q.limit = 500;
    setFacts(store.query(q));
  }, [store, statusFilter]);

  useEffect(() => {
    refresh();
    const unsub = eventEngine.onCascade(() => refresh());
    return unsub;
  }, [refresh, eventEngine]);

  const stats = useMemo(() => store.getStats(), [store]);

  const filtered = useMemo(() => {
    if (!search) return facts;
    const q = search.toLowerCase();
    return facts.filter(f =>
      f.concept.toLowerCase().includes(q) ||
      f.patientId.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      JSON.stringify(f.value).toLowerCase().includes(q) ||
      (f.provenance.actorName || '').toLowerCase().includes(q),
    );
  }, [facts, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Total Facts</div>
          <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{stats.totalFacts}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Patients</div>
          <div className="text-xl font-bold" style={{ color: 'var(--purple)' }}>{stats.patientsWithFacts}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Concepts</div>
          <div className="text-xl font-bold" style={{ color: 'var(--teal)' }}>{stats.conceptsUsed}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Active</div>
          <div className="text-xl font-bold" style={{ color: 'var(--green)' }}>{stats.byStatus.active || 0}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Superseded</div>
          <div className="text-xl font-bold" style={{ color: 'var(--amber)' }}>{stats.byStatus.superseded || 0}</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          className="input flex-1 min-w-[150px]"
          placeholder="Search facts by concept, patient, value..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="active">Active</option>
          <option value="any">All Statuses</option>
          <option value="superseded">Superseded</option>
          <option value="invalidated">Invalidated</option>
        </select>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{filtered.length} facts</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
          {filtered.map(fact => (
            <button
              key={fact.id}
              onClick={() => setSelectedFact(selectedFact?.id === fact.id ? null : fact)}
              className="flex items-start gap-2.5 w-full text-left px-3 py-2 rounded-lg transition-colors"
              style={{
                background: selectedFact?.id === fact.id ? 'var(--sky-50)' : 'transparent',
                border: selectedFact?.id === fact.id ? '1px solid var(--sky-200)' : '1px solid transparent',
                opacity: fact.status === 'invalidated' ? 0.4 : fact.status === 'superseded' ? 0.6 : 1,
              }}
            >
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{
                  background: fact.status === 'active' ? 'var(--green)' : fact.status === 'superseded' ? 'var(--amber)' : 'var(--text-muted)',
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{fact.concept}</span>
                  <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{fact.dataType}</span>
                  {fact.unit && <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{fact.unit}</span>}
                </div>
                <div className="text-[10px] font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                  {JSON.stringify(fact.value)}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {fact.patientId.slice(0, 12)} · {fact.provenance.actorName || fact.provenance.actorId.slice(0, 8)} · {new Date(fact.recordedAt).toLocaleTimeString()}
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No facts match your filter</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedFact ? (
            <div className="card p-4 flex flex-col gap-3" style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{selectedFact.concept}</div>
                  <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{selectedFact.id}</div>
                </div>
                <button onClick={() => setSelectedFact(null)} className="text-xs" style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>

              <StatusBadge status={selectedFact.status} />

              <div className="flex flex-col gap-1.5">
                <DetailRow label="Value" value={JSON.stringify(selectedFact.value)} />
                <DetailRow label="Data Type" value={selectedFact.dataType} />
                {selectedFact.unit && <DetailRow label="Unit" value={selectedFact.unit} />}
                <DetailRow label="Patient" value={selectedFact.patientId} />
                {selectedFact.encounterId && <DetailRow label="Encounter" value={selectedFact.encounterId} />}
                <DetailRow label="Timestamp" value={new Date(selectedFact.timestamp).toISOString()} />
                <DetailRow label="Recorded At" value={new Date(selectedFact.recordedAt).toISOString()} />
                <DetailRow label="Source" value={selectedFact.provenance.source} />
                <DetailRow label="Actor" value={`${selectedFact.provenance.actorName || selectedFact.provenance.actorId} (${selectedFact.provenance.actorType})`} />
                {selectedFact.confidence !== undefined && <DetailRow label="Confidence" value={`${Math.round(selectedFact.confidence * 100)}%`} />}
              </div>

              {selectedFact.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selectedFact.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center h-48 gap-2">
              <div className="text-2xl">💾</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Select a fact</div>
              <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                Each fact is an atomic piece of clinical data with full provenance. Facts never change — they are superseded by new facts.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    active: { bg: 'var(--green-bg)', color: 'var(--green)' },
    superseded: { bg: 'var(--surface-elevated)', color: 'var(--amber)' },
    invalidated: { bg: 'var(--surface-elevated)', color: 'var(--text-muted)' },
  };
  const c = colors[status] || colors.active;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded font-medium self-start" style={{ background: c.bg, color: c.color }}>
      {status.toUpperCase()}
    </span>
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
