'use client';

import React, { useEffect, useState } from 'react';
import { watchPatientTimeline, TimelineEvent, TIMELINE_EVENT_ICONS, TIMELINE_SEVERITY_COLORS } from '@/lib/firebaseTimeline';

interface Props {
  patientId: string;
  compact?: boolean;
  maxEvents?: number;
}

const fmtTime = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getSeverityStyle = (severity?: string) => {
  const color = severity ? TIMELINE_SEVERITY_COLORS[severity] : 'var(--muted)';
  return {
    dot: { background: color, boxShadow: `0 0 0 3px ${color}20` },
    line: { background: 'var(--border)' },
  };
};

export default function TimelineEngine({ patientId, compact, maxEvents }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchPatientTimeline(
      patientId,
      maxEvents || (compact ? 20 : 100),
      data => { setEvents(data); setLoading(false); },
      () => setLoading(false),
    );
    return () => unsub();
  }, [patientId, compact, maxEvents]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: 0.5 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 11, width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📜</div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No Timeline Events</div>
        <div style={{ fontSize: 12 }}>Clinical actions will appear here as they happen.</div>
      </div>
    );
  }

  const grouped = events.reduce((acc, ev) => {
    const d = ev.createdAt?.toDate ? ev.createdAt.toDate() : new Date(ev.createdAt || 0);
    const key = d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 4 : 8 }}>
      {Object.entries(grouped).map(([dateLabel, dateEvents]) => (
        <div key={dateLabel}>
          {!compact && (
            <div style={{
              fontSize: 11, fontWeight: 800, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: 1,
              padding: '4px 0 8px', borderBottom: '1px solid var(--border)',
              marginBottom: 8,
            }}>
              {dateLabel}
            </div>
          )}
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute', left: 15, top: 0, bottom: 0,
              width: 2, background: 'var(--border)', zIndex: 0,
            }} />
            {dateEvents.map((ev, idx) => {
              const s = getSeverityStyle(ev.severity);
              const icon = TIMELINE_EVENT_ICONS[ev.type] || '📌';
              return (
                <div key={ev.id || idx} style={{
                  display: 'flex', gap: 12, padding: compact ? '6px 0' : '8px 0',
                  position: 'relative', zIndex: 1,
                  animation: 'fadeUp .25s ease',
                  animationFillMode: 'both',
                  animationDelay: `${idx * 30}ms`,
                }}>
                  {/* Dot */}
                  <div style={{
                    width: compact ? 28 : 32, height: compact ? 28 : 32,
                    borderRadius: '50%', background: 'var(--surface)',
                    border: compact ? '2px solid var(--border)' : '2px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: compact ? 11 : 13,
                    ...(ev.severity && ev.severity !== 'info' ? {
                      borderColor: TIMELINE_SEVERITY_COLORS[ev.severity],
                      background: `${TIMELINE_SEVERITY_COLORS[ev.severity]}10`,
                    } : {}),
                  }}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: compact ? 2 : 4 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 8,
                    }}>
                      <div style={{
                        fontWeight: 700, fontSize: compact ? 12 : 13,
                        color: 'var(--text)', lineHeight: 1.3,
                      }}>
                        {ev.title}
                      </div>
                      <div style={{
                        fontSize: 10, color: 'var(--muted)',
                        fontFamily: 'var(--mono)', whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {fmtTime(ev.createdAt)}
                      </div>
                    </div>
                    {ev.description && (
                      <div style={{
                        fontSize: compact ? 11 : 12, color: 'var(--text-2)',
                        marginTop: 2, lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {ev.description}
                      </div>
                    )}
                    {ev.metadata?.value && (
                      <div style={{
                        marginTop: 4, padding: '4px 8px', background: 'var(--bg)',
                        borderRadius: 6, fontSize: 11, fontFamily: 'var(--mono)',
                        color: 'var(--accent)', fontWeight: 600,
                        display: 'inline-block',
                      }}>
                        {ev.metadata.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
