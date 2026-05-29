'use client';
import type { DocumentEvent } from '@/lib/encounterTypes';

const TIMELINE_CSS = `
  .tl-list{display:flex;flex-direction:column;gap:4px}
  .tl-item{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:6px;transition:background .15s;cursor:default}
  .tl-item:hover{background:rgba(255,255,255,.03)}
  .tl-time{font-size:.625rem;color:#475569;font-family:'JetBrains Mono',monospace;white-space:nowrap;min-width:44px;flex-shrink:0}
  .tl-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .tl-dot.info{background:#3b82f6}
  .tl-dot.warning{background:#f59e0b}
  .tl-dot.critical{background:#ef4444}
  .tl-content{flex:1;min-width:0}
  .tl-desc{font-size:.75rem;color:#94A3B8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tl-actor{font-size:.625rem;color:#475569}
  .tl-icon{flex-shrink:0;font-size:.75rem;margin-right:2px}
`;

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const EVENT_ICONS: Record<string, string> = {
  hpi_entered: '📝', vitals_updated: '❤️', diagnosis_changed: '🧠',
  antibiotic_prescribed: '💊', imaging_ordered: '📡', lab_ordered: '🧪',
  procedure_completed: '🔧', medication_administered: '💉',
  consultation_requested: '👥', disposition_changed: '🚪',
  note_added: '📄', ai_insight_generated: '🤖', team_message: '💬',
  score_calculated: '📊',
};

interface TimelineProps {
  events: DocumentEvent[];
  maxItems?: number;
}

export function Timeline({ events, maxItems = 20 }: TimelineProps) {
  const displayed = events.slice(-maxItems).reverse();
  return (
    <>
      <style>{TIMELINE_CSS}</style>
      <div className="tl-list">
        {displayed.length === 0 && (
          <div style={{ fontSize: '.75rem', color: '#475569', textAlign: 'center', padding: 12 }}>
            No events yet. Start the encounter to build the timeline.
          </div>
        )}
        {displayed.map(event => (
          <div key={event.id} className="tl-item">
            <span className="tl-time">{formatTime(event.timestamp)}</span>
            <span className={`tl-dot ${event.severity || 'info'}`} />
            <span className="tl-icon">{EVENT_ICONS[event.type] || '📌'}</span>
            <div className="tl-content">
              <div className="tl-desc">{event.description}</div>
              <div className="tl-actor">{event.actorName} · {event.actorRole}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
