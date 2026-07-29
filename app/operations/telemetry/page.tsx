'use client';

import { useEffect, useState } from 'react';
import { Radio, Search, Clock, Activity, Filter } from 'lucide-react';
import { OIDatabase, createOIDatabase } from '@/lib/amexan/operations/oi-database';
import { TelemetryBroker, initTelemetryBroker } from '@/lib/amexan/operations/telemetry-broker';
import { UniversalEngineEvent } from '@/lib/amexan/operations/operations-constitution';
import { engineRegistry } from '@/lib/amexan/operations/engine-registry';
import { initializeAGOC } from '@/lib/amexan/operations/engine-registration';
import { C, S, rowStyle } from '@/app/operations/_shared/styles';

let oiDb: OIDatabase | null = null;
let broker: TelemetryBroker | null = null;

function getDb(): OIDatabase {
  if (!oiDb) { oiDb = createOIDatabase(); broker = initTelemetryBroker(oiDb); }
  return oiDb;
}

export default function TelemetryPage() {
  const [init, setInit] = useState(false);
  const [events, setEvents] = useState<UniversalEngineEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!init) { initializeAGOC(); setInit(true); }
    const db = getDb();
    setEvents(db.queryEvents({}));
    const interval = setInterval(() => {
      setEvents(db.queryEvents({}));
      setRefreshKey(k => k + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [init]);

  const stats = getDb().getStorageStats();

  return (
    <div style={S.pageWide}>
      <div style={S.h1}><Radio size={20} color={C.sky} /> Telemetry Viewer</div>

      <div style={S.statRow}>
        <div style={S.statCard}><div style={S.statNum(C.sky)}>{stats.events}</div><div style={S.statLabel}>Events</div></div>
        <div style={S.statCard}><div style={S.statNum(C.green)}>{stats.ruleActivations}</div><div style={S.statLabel}>Rule Activations</div></div>
        <div style={S.statCard}><div style={S.statNum(C.purple)}>{stats.performance}</div><div style={S.statLabel}>Performance Samples</div></div>
        <div style={S.statCard}><div style={S.statNum(C.amber)}>{stats.health}</div><div style={S.statLabel}>Health Records</div></div>
        <div style={S.statCard}><div style={S.statNum(C.amber)}>{stats.observations}</div><div style={S.statLabel}>Observations</div></div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Event ID</th>
              <th style={S.th}>Engine</th>
              <th style={S.th}>Category</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Duration</th>
              <th style={S.th}>Rules</th>
              <th style={S.th}>Facts</th>
              <th style={S.th}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', padding: 40, color: '#475569' }}>No telemetry events yet. Events appear when engines emit via telemetryEmit().</td></tr>
            ) : events.slice(0, 100).map(e => (
              <tr key={e.eventId}>
                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 'clamp(9px, 1vw, 10px)', color: '#e2e8f0' }}>{e.eventId}</td>
                <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9' }}>{e.engineName}<div style={{ fontSize: 'clamp(8px, 0.9vw, 9px)', color: '#64748b' }}>{e.engineId}</div></td>
                <td style={S.td}><span style={{ fontSize: 'clamp(8px, 0.9vw, 9px)', color: C.sky }}>{e.engineCategory}</span></td>
                <td style={S.td}>
                  <span style={{ color: e.status === 'success' ? C.green : e.status === 'failed' ? C.red : C.amber }}>
                    <span style={S.statusDot(e.status === 'success' ? C.green : e.status === 'failed' ? C.red : C.amber)} />{e.status}
                  </span>
                </td>
                <td style={S.td}>{e.durationMs}ms</td>
                <td style={S.td}>{e.ruleIds.length}</td>
                <td style={S.td}>{e.factsGenerated.length}</td>
                <td style={{ ...S.td, fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b' }}>{new Date(e.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length > 100 && <div style={{ textAlign: 'center', marginTop: 12, fontSize: 'clamp(9px, 1vw, 10px)', color: '#64748b' }}>Showing 100 of {events.length} events</div>}
    </div>
  );
}
