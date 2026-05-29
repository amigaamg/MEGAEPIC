'use client';
import { useEffect, useState } from 'react';
import { listenPatientLifeline } from '@/lib/firebase/encounterService';

const CSS = `
  .pl-container{display:flex;flex-direction:column;gap:2px;padding:8px 0}
  .pl-event{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;transition:background .15s}
  .pl-event:hover{background:rgba(255,255,255,.03)}
  .pl-line{width:2px;height:16px;background:#1E293B;margin:0 auto}
  .pl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;position:relative;z-index:1}
  .pl-dot.encounter{background:#3b82f6}
  .pl-dot.admission{background:#f59e0b}
  .pl-dot.discharge{background:#10b981}
  .pl-dot.lab{background:#8b5cf6}
  .pl-dot.alert{background:#ef4444}
  .pl-dot.procedure{background:#ec4899}
  .pl-content{flex:1;min-width:0}
  .pl-desc{font-size:.75rem;color:#94A3B8}
  .pl-meta{font-size:.625rem;color:#475569}
  .pl-time{font-size:.625rem;color:#475569;font-family:'JetBrains Mono',monospace;white-space:nowrap;min-width:70px;flex-shrink:0;text-align:right}
  .pl-empty{font-size:.75rem;color:#475569;text-align:center;padding:20px}
`;

const DOT_TYPES: Record<string, string> = {
  encounter_created: 'encounter', admission: 'admission', discharge: 'discharge',
  lab_result: 'lab', alert: 'alert', procedure: 'procedure',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

interface LifelineEvent {
  type: string;
  description: string;
  timestamp: number;
  encounterType?: string;
}

export function PatientLifeline({ patientId }: { patientId: string }) {
  const [events, setEvents] = useState<LifelineEvent[]>([]);

  useEffect(() => {
    const unsub = listenPatientLifeline(patientId, setEvents);
    return unsub;
  }, [patientId]);

  return (
    <>
      <style>{CSS}</style>
      <div className="pl-container">
        {events.length === 0 && (
          <div className="pl-empty">No patient history yet</div>
        )}
        {events.map((event, i) => (
          <div key={`${event.timestamp}-${i}`}>
            <div className="pl-event">
              <div className={`pl-dot ${DOT_TYPES[event.type] || 'encounter'}`} />
              <div className="pl-content">
                <div className="pl-desc">{event.description}</div>
                <div className="pl-meta">{event.type.replace(/_/g, ' ')}</div>
              </div>
              <div className="pl-time">{formatDate(event.timestamp)}</div>
            </div>
            {i < events.length - 1 && <div className="pl-line" />}
          </div>
        ))}
      </div>
    </>
  );
}
