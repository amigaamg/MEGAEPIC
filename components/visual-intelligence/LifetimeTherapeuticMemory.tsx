'use client';
import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MemoryItem {
  id: string;
  type: 'start' | 'dose_change' | 'switch' | 'side_effect' | 'stop' | 'refill' | 'note';
  drug: string;
  date: Date;
  detail: string;
  icon: string;
  color: string;
  outcome?: string;
}

interface Props {
  items?: MemoryItem[];
  events?: { id: string; date: Date; type: string; drug?: string; detail: string; diseaseTrack?: string; outcome?: string; severity?: string }[];
  patientName: string;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MEMORY_ICONS: Record<string, string> = {
  start: '▶', dose_change: '↕', switch: '⇄', side_effect: '⚠', stop: '■', refill: '🔁', note: '📝',
};
const MEMORY_COLORS: Record<string, string> = {
  start: '#00d68f', dose_change: '#ffb020', switch: '#7c5af5', side_effect: '#ff4560', stop: '#546382', refill: '#3b82f6', note: '#00e5cc',
};
const TYPE_MAP: Record<string, MemoryItem['type']> = {
  diagnosis: 'start',
  medication_start: 'start',
  dose_increase: 'dose_change',
  dose_decrease: 'dose_change',
  frequency_change: 'dose_change',
  side_effect: 'side_effect',
  failure: 'stop',
  stopped: 'stop',
  switched: 'switch',
  remission: 'note',
  hospitalization: 'note',
  lab_milestone: 'note',
};

function eventsToItems(events: Props['events']): MemoryItem[] {
  if (!events) return [];
  return events.map((ev, i) => {
    const mt = TYPE_MAP[ev.type] || 'note';
    return {
      id: ev.id || `mem-${i}`,
      type: mt,
      drug: ev.drug || ev.diseaseTrack || '',
      date: ev.date,
      detail: ev.detail,
      icon: MEMORY_ICONS[mt],
      color: MEMORY_COLORS[mt],
      outcome: ev.outcome,
    };
  });
}

export default function LifetimeTherapeuticMemory({ items, events, patientName }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const allItems = useMemo(() => items || eventsToItems(events) || [], [items, events]);

  const sorted = useMemo(() => [...allItems].sort((a, b) => b.date.getTime() - a.date.getTime()), [allItems]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, MemoryItem[]> = {};
    sorted.forEach((item) => {
      const key = `${item.date.getFullYear()}-${item.date.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [sorted]);

  const totalDuration = useMemo(() => {
    if (sorted.length < 2) return '';
    const first = sorted[sorted.length - 1]!.date;
    const last = sorted[0]!.date;
    const years = last.getFullYear() - first.getFullYear();
    const months = last.getMonth() - first.getMonth();
    const totalM = years * 12 + months;
    const y = Math.floor(totalM / 12);
    const m = totalM % 12;
    return `${y}y ${m}m`;
  }, [sorted]);

  if (allItems.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="text-3xl mb-2">🧠</div>
        <div className="text-sm font-bold text-[var(--text-secondary)]">No Therapeutic Memory</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">Treatment biography will populate over time</div>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-gradient-to-r from-[var(--surface-base)] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-[9px] font-bold text-white">🧠</div>
          <div>
            <div className="text-[10px] font-extrabold text-[var(--teal)] tracking-wider uppercase">Lifetime Therapeutic Memory</div>
            <div className="text-[9px] text-[var(--text-muted)]">{patientName} · {totalDuration}</div>
          </div>
        </div>
        <div className="text-[9px] text-[var(--text-muted)]">{allItems.length} events</div>
      </div>

      {/* Scrolling memory */}
      <div ref={scrollRef} className="overflow-x-auto scrollbar-none">
        <div className="flex gap-0 p-4" style={{ minWidth: Math.max(600, Object.keys(groupedByMonth).length * 160) }}>
          {Object.entries(groupedByMonth).map(([key, groupItems]) => {
            const [year, month] = key.split('-').map(Number);
            return (
              <div key={key} className="flex-shrink-0 w-[150px]">
                {/* Month header */}
                <div className="text-[9px] font-bold text-[var(--text-muted)] mb-2 sticky left-0">
                  {MONTH_NAMES[month!]} {year}
                </div>

                {/* Event cards */}
                <div className="space-y-1.5">
                  {groupItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative rounded-lg px-2 py-1.5 border cursor-pointer transition-colors"
                      style={{
                        borderColor: item.color + '22',
                        background: hoveredItem === item.id ? item.color + '15' : 'rgba(255,255,255,0.02)',
                      }}
                      whileHover={{ scale: 1.02, borderColor: item.color + '55' }}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: item.color }} className="text-[10px]">{item.icon}</span>
                        <span className="text-[9px] font-bold truncate" style={{ color: item.color }}>
                          {item.drug || item.type}
                        </span>
                      </div>
                      <div className="text-[8px] text-[var(--text-secondary)] mt-0.5 truncate">{item.detail}</div>
                      <div className="text-[7px] text-[var(--text-muted)] mt-0.5 font-mono">
                        {item.date.getDate()} {MONTH_NAMES[item.date.getMonth()]}
                      </div>
                      {item.outcome && (
                        <div className="text-[7px] text-[var(--green)] mt-0.5 truncate">{item.outcome}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 py-1.5 border-t border-white/5 text-[8px] text-[var(--text-muted)] bg-[var(--surface-base)]">
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#00d68f] mr-1" />Start</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#ffb020] mr-1" />Change</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#7c5af5] mr-1" />Switch</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#ff4560] mr-1" />SE/Stop</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#3b82f6] mr-1" />Refill</span>
        <span className="ml-auto">{allItems.length} memory entries</span>
      </div>
    </motion.div>
  );
}
