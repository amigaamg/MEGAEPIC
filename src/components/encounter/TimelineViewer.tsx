'use client';
import React, { useState } from 'react';
import { useTimeline, type TimelineEntry } from '@/hooks/useTimeline';

interface TimelineViewerProps {
  encounterId: string;
  deptSlug: string;
  unitSlug: string;
  orgId?: string;
}

export function TimelineViewer({ encounterId, deptSlug, unitSlug, orgId }: TimelineViewerProps) {
  const { events, loading } = useTimeline(encounterId, deptSlug, unitSlug, orgId);
  const [filter, setFilter] = useState<string>('all');

  const eventTypes = Array.from(new Set(events.map((e) => e.event)));
  const filtered = filter === 'all' ? events : events.filter((e) => e.event === filter);

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading timeline...</div>;
  }

  return (
    <div className="space-y-3">
      {eventTypes.length > 1 && (
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full text-xs px-2 py-1 border rounded"
        >
          <option value="all">All events ({events.length})</option>
          {eventTypes.map((t) => (
            <option key={t} value={t}>{t} ({events.filter((e) => e.event === t).length})</option>
          ))}
        </select>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No timeline events yet</p>
        )}
        {filtered.map((event, i) => (
          <TimelineItem key={i} event={event} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ event }: { event: TimelineEntry }) {
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(event.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' });

  const eventColors: Record<string, string> = {
    'Encounter created': 'border-blue-400 bg-blue-50',
    'Phase completed': 'border-green-400 bg-green-50',
    'Phase started': 'border-amber-400 bg-amber-50',
  };
  const colorClass = eventColors[event.event] || 'border-gray-300 bg-gray-50';

  return (
    <div className={`flex gap-3 p-2 rounded border-l-4 text-xs ${colorClass}`}>
      <div className="flex-shrink-0 text-gray-400 w-14 text-right font-mono">{time}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{event.event}</p>
        <p className="text-gray-500 truncate">{event.details}</p>
        <p className="text-gray-400">{event.userName} · {date}</p>
      </div>
    </div>
  );
}
