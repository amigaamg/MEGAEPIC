'use client';

import React, { useMemo, useState } from 'react';
import type { TimelineEvent } from '@/lib/amexan/longitudinal/types';
import { groupEventsByDate, getNotableEvents, EVENT_TYPE_LABELS, formatEventTime } from '@/lib/amexan/longitudinal/timelineEngine';

interface Props {
  events: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
}

const EVENT_ICONS: Record<string, string> = {
  admission: '🏥',
  discharge: '🚪',
  transfer: '➡',
  ward_round: '👨‍⚕️',
  consultation: '👥',
  operation: '🔧',
  procedure: '🛠',
  investigation_ordered: '🔬',
  investigation_result: '📊',
  medication_prescribed: '💊',
  medication_administered: '💉',
  medication_changed: '🔄',
  icu_admission: '⚠️',
  icu_discharge: '✅',
  complication: '🚨',
  event: '📌',
  note: '📝',
  clinic_visit: '🏥',
  emergency_visit: '🚑',
  vaccination: '💉',
  milestone: '⭐',
  outcome: '🎯',
};

type FilterType = 'all' | 'critical' | 'investigations' | 'medications' | 'procedures';

export default function LongitudinalTimeline({ events, onSelectEvent }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    if (filter === 'critical') return getNotableEvents(events);
    if (filter === 'investigations')
      return events.filter(e => e.type === 'investigation_ordered' || e.type === 'investigation_result');
    if (filter === 'medications')
      return events.filter(e => e.type.startsWith('medication'));
    if (filter === 'procedures')
      return events.filter(e => e.type === 'operation' || e.type === 'procedure' || e.type === 'icu_admission' || e.type === 'icu_discharge');
    return events;
  }, [events, filter]);

  const grouped = useMemo(() => groupEventsByDate(filtered), [filtered]);

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Events' },
    { key: 'critical', label: 'Notable' },
    { key: 'investigations', label: 'Investigations' },
    { key: 'medications', label: 'Medications' },
    { key: 'procedures', label: 'Procedures' },
  ];

  return (
    <div className="space-y-4">
      {/* ── Filter tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${filter === f.key
                ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-300'
                : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Timeline ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No events to display.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {Array.from(grouped.entries()).map(([date, dateEvents]) => (
            <div key={date} className="mb-6">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-xs font-bold text-sky-700 relative z-10">
                  {dateEvents.length}
                </div>
                <span className="text-sm font-semibold text-gray-700">{date}</span>
              </div>

              {/* Events */}
              <div className="ml-12 space-y-2">
                {dateEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => {
                      onSelectEvent?.(event);
                      setExpandedDate(expandedDate === event.id ? null : event.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      event.severity === 'critical' ? 'bg-red-50 border-red-200 hover:bg-red-100'
                      : event.severity === 'warning' ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                      : event.severity === 'success' ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    } ${expandedDate === event.id ? 'ring-2 ring-sky-300' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{EVENT_ICONS[event.type] || '📌'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {EVENT_TYPE_LABELS[event.type] || event.type}
                          </p>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatEventTime(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                        {event.metadata && Object.keys(event.metadata).length > 0 && expandedDate === event.id && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500 space-y-0.5">
                            {Object.entries(event.metadata).map(([key, val]) => (
                              <p key={key}>{key}: {String(val)}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
