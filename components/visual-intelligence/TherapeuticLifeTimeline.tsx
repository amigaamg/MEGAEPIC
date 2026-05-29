'use client';
import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TherapyEvent {
  id: string;
  date: Date;
  type: 'diagnosis' | 'medication_start' | 'dose_increase' | 'dose_decrease' | 'frequency_change'
    | 'side_effect' | 'failure' | 'stopped' | 'switched' | 'remission' | 'hospitalization' | 'lab_milestone';
  diseaseTrack: string;
  drug?: string;
  dose?: string;
  detail: string;
  severity?: 'normal' | 'warning' | 'critical';
  outcome?: string;
  labValue?: string;
}

interface Props {
  events: TherapyEvent[];
  patientName: string;
  patientAge?: number;
}

const NODE_STYLES: Record<string, { color: string; glow: string; icon: string; label: string }> = {
  diagnosis:        { color: '#3b82f6', glow: 'rgba(59,130,246,0.4)', icon: '🔍', label: 'Diagnosis' },
  medication_start: { color: '#00d68f', glow: 'rgba(0,214,143,0.5)', icon: '▶', label: 'Started' },
  dose_increase:    { color: '#7c5af5', glow: 'rgba(124,90,245,0.4)', icon: '↑', label: 'Dose ↑' },
  dose_decrease:    { color: '#ffb020', glow: 'rgba(255,176,32,0.4)', icon: '↓', label: 'Dose ↓' },
  frequency_change: { color: '#ffb020', glow: 'rgba(255,176,32,0.4)', icon: '↻', label: 'Freq ↻' },
  side_effect:      { color: '#ff4560', glow: 'rgba(255,69,96,0.5)', icon: '⚠', label: 'SE' },
  failure:          { color: '#ff4560', glow: 'rgba(255,69,96,0.6)', icon: '✖', label: 'Failure' },
  stopped:          { color: '#546382', glow: 'rgba(84,99,130,0.2)', icon: '■', label: 'Stopped' },
  switched:         { color: '#7c5af5', glow: 'rgba(124,90,245,0.4)', icon: '⇄', label: 'Switch' },
  remission:        { color: '#00e5cc', glow: 'rgba(0,229,204,0.4)', icon: '✦', label: 'Remission' },
  hospitalization:  { color: '#ff4560', glow: 'rgba(255,69,96,0.5)', icon: '🏥', label: 'Hospitalized' },
  lab_milestone:    { color: '#00e5cc', glow: 'rgba(0,229,204,0.4)', icon: '🔬', label: 'Lab' },
};

const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

const TRACK_COLORS = ['#00d68f', '#7c5af5', '#ffb020', '#3b82f6', '#ff4560', '#00e5cc'];

export default function TherapeuticLifeTimeline({ events, patientName, patientAge }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<TherapyEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const diseaseTracks = useMemo(() => {
    const tracks = new Map<string, TherapyEvent[]>();
    [...events].sort((a, b) => a.date.getTime() - b.date.getTime()).forEach((ev) => {
      const track = ev.diseaseTrack || 'General';
      const existing = tracks.get(track) || [];
      existing.push(ev);
      tracks.set(track, existing);
    });
    return tracks;
  }, [events]);

  const timelineStart = useMemo(() =>
    events.length ? events.reduce((min, e) => e.date < min ? e.date : min, events[0].date) : new Date(),
    [events],
  );
  const timelineEnd = useMemo(() =>
    events.length ? events.reduce((max, e) => e.date > max ? e.date : max, events[0].date) : new Date(),
    [events],
  );
  const totalDays = Math.max(1, Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / 86400000) + 30);

  const monthMarkers = useMemo(() => {
    const markers: { date: Date; x: number }[] = [];
    const cursor = new Date(timelineStart);
    cursor.setDate(1);
    while (cursor <= timelineEnd) {
      markers.push({
        date: new Date(cursor),
        x: ((cursor.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime() + 86400000 * 30)) * 100,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return markers;
  }, [timelineStart, timelineEnd]);

  const nodeX = (d: Date) =>
    ((d.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime() + 86400000 * 30)) * 100;

  const tracks = Array.from(diseaseTracks.entries());

  if (events.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="text-4xl mb-3">🧬</div>
        <div className="text-sm font-bold text-[var(--text-secondary)]">No Therapy Events Yet</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">The therapeutic biography populates as treatment begins</div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-gradient-to-r from-[var(--surface-base)] to-[var(--surface-elevated)]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-[10px] font-extrabold text-black">A</div>
          <div>
            <div className="text-[9px] font-extrabold text-[var(--teal)] tracking-[0.15em] uppercase">Therapeutic Life Timeline</div>
            <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
              {patientName}{patientAge ? ` · ${patientAge}yrs` : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-[var(--text-muted)] font-mono">
            {events.length} events · {tracks.length} tracks · {totalDays}d span
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold text-[var(--green)] bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] shadow-[0_0_6px_var(--green)]" />
            LIVE
          </div>
        </div>
      </div>

      {/* Timeline body */}
      <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden scrollbar-none">
        <div style={{ minWidth: Math.max(600, tracks.length * 180 + 400) }} className="relative">
          {/* Month markers */}
          <div className="relative h-6 border-b border-white/5" style={{ marginLeft: 140 }}>
            {monthMarkers.map((m, i) => (
              <div key={`m-${i}`} className="absolute top-0 h-full border-l border-white/5" style={{ left: `${m.x}%` }}>
                <span className="absolute left-1 top-1 text-[8px] text-[var(--text-muted)] font-semibold whitespace-nowrap">
                  {m.date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {/* Disease tracks */}
          {tracks.map(([trackName, trackEvents], trackIdx) => {
            const tc = TRACK_COLORS[trackIdx % TRACK_COLORS.length];
            return (
              <div key={`t${trackIdx}-${trackName}`} className="relative border-b border-white/5">
                {/* Track label */}
                <div className="absolute left-0 top-0 bottom-0 w-[140px] flex items-center px-3 border-r border-white/5 bg-[var(--surface-base)] z-10">
                  <div>
                    <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ background: tc, boxShadow: `0 0 6px ${tc}` }} />
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">{trackName}</span>
                    <div className="text-[8px] text-[var(--text-muted)] ml-3">{trackEvents.length} events</div>
                  </div>
                </div>

                {/* Track timeline area */}
                <div className="relative h-14" style={{ marginLeft: 140 }}>
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5" />

                  {/* Event nodes */}
                  {trackEvents.map((ev) => {
                    const ns = NODE_STYLES[ev.type] || NODE_STYLES.medication_start;
                    const x = nodeX(ev.date);
                    const isSel = selectedEvent?.id === ev.id;
                    const isHov = hoveredEvent === ev.id;
                    const isCritical = ev.severity === 'critical';
                    const isPulsing = ev.type === 'medication_start' || ev.type === 'side_effect';

                    return (
                      <motion.div
                        key={ev.id}
                        className="absolute cursor-pointer z-[3]"
                        style={{ left: `calc(${x}% - 14px)`, top: '50%', translateY: '-50%' }}
                        initial={{ opacity: 0, scale: 0.5, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: trackIdx * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                        whileHover={{ scale: 1.15, zIndex: 10 }}
                        onClick={() => setSelectedEvent(isSel ? null : ev)}
                        onMouseEnter={() => setHoveredEvent(ev.id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        <motion.div
                          className="relative flex items-center justify-center rounded-full text-white font-extrabold"
                          style={{
                            width: 28, height: 28, fontSize: ev.type === 'side_effect' || ev.type === 'failure' ? 12 : 10,
                            background: ev.type === 'stopped' ? 'var(--surface-card)' : ns.color,
                            border: isCritical ? '2px solid var(--red)' : '2px solid transparent',
                          }}
                          animate={{
                            scale: isSel ? 1.3 : isHov ? 1.15 : 1,
                            boxShadow: isPulsing ? [
                              `0 0 0 0 ${ns.glow}`,
                              `0 0 0 12px transparent`,
                              `0 0 0 0 transparent`,
                            ] : `0 0 10px ${ns.glow}`,
                          }}
                          transition={isPulsing ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                        >
                          {ns.icon}
                        </motion.div>

                        {/* Date label */}
                        <div className="absolute text-center pointer-events-none" style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 4 }}>
                          <div className="text-[8px] font-bold whitespace-nowrap" style={{ color: ns.color }}>{fmtDate(ev.date)}</div>
                          {ev.drug && <div className="text-[8px] text-[var(--text-secondary)] whitespace-nowrap mt-0.5">{ev.drug}</div>}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Switch bridge arrows */}
                  {trackEvents.map((ev, i) => {
                    if (ev.type !== 'switched' || i === 0) return null;
                    const prev = trackEvents[i - 1];
                    if (!prev) return null;
                    const x1 = nodeX(prev.date);
                    const x2 = nodeX(ev.date);
                    return (
                      <motion.div
                        key={`br-${ev.id}`}
                        className="absolute z-[2]"
                        style={{ left: `calc(${x1}% + 14px)`, top: '50%', width: `calc(${x2 - x1}% - 28px)`, height: 2, translateY: '-50%' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7c5af5, #00e5cc)' }} />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent" style={{ borderLeftColor: '#00e5cc' }} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="h-4 border-b border-white/5" />
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-[var(--surface-elevated)]"
          >
            <div className="p-4 flex justify-between items-start gap-3">
              <div className="flex gap-3 items-start">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white flex-shrink-0"
                  style={{ background: NODE_STYLES[selectedEvent.type]?.color || '#3b82f6' }}
                >
                  {NODE_STYLES[selectedEvent.type]?.icon || '•'}
                </div>
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-xs font-extrabold text-[var(--text-primary)]">
                      {selectedEvent.drug || selectedEvent.detail}
                    </span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: (NODE_STYLES[selectedEvent.type]?.color || '#3b82f6') + '22',
                        color: NODE_STYLES[selectedEvent.type]?.color || '#3b82f6',
                      }}
                    >
                      {NODE_STYLES[selectedEvent.type]?.label || selectedEvent.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)]">{selectedEvent.detail}</div>
                  <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                    {fmtDate(selectedEvent.date)} · {selectedEvent.diseaseTrack} · {selectedEvent.dose || '—'}
                  </div>
                  {selectedEvent.outcome && (
                    <div className="mt-2 insight-card success text-[10px]">
                      📈 {selectedEvent.outcome}
                    </div>
                  )}
                  {selectedEvent.labValue && (
                    <div className="mt-1 insight-card info text-[10px]">
                      🔬 {selectedEvent.labValue}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded cursor-pointer">
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex justify-between px-4 py-1.5 border-t border-white/5 text-[8px] text-[var(--text-muted)] bg-[var(--surface-base)]">
        <span>Click any node for details · Hover to highlight</span>
        <span>AMEXAN Therapeutic Intel · {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export function buildTherapyEvents(
  prescriptions: any[], sideEffects: any[], diagnoses: string[],
): TherapyEvent[] {
  const events: TherapyEvent[] = [];
  diagnoses.forEach((dx) => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 2);
    events.push({ id: `dx-${dx}`, date: d, type: 'diagnosis', diseaseTrack: dx, detail: `Diagnosed with ${dx}`, severity: 'normal' });
  });
  prescriptions.forEach((rx) => {
    const track = rx.indication || rx.condition || 'General';
    const drug = rx.medicationName || rx.medication || rx.drug || '';
    const sd = rx.startDate?.toDate ? rx.startDate.toDate() : rx.startDate ? new Date(rx.startDate) : null;
    if (sd) events.push({ id: `${rx.id}-start`, date: sd, type: 'medication_start', diseaseTrack: track, drug, dose: rx.dose || rx.dosage, detail: `${rx.frequency || ''} · ${rx.route || ''}`, severity: 'normal', outcome: 'Therapy initiated' });
    (rx.doseChanges || []).forEach((dc: any, i: number) => {
      const d = dc.date?.toDate ? dc.date.toDate() : dc.date ? new Date(dc.date) : null;
      if (d) {
        const p = parseFloat(dc.previousDose) || 0, n = parseFloat(dc.newDose) || 0;
        events.push({ id: `${rx.id}-dose-${i}`, date: d, type: n > p ? 'dose_increase' : 'dose_decrease', diseaseTrack: track, drug, dose: `${dc.previousDose} → ${dc.newDose}`, detail: dc.reason || 'Dose adjustment', severity: n > p * 2 ? 'warning' : 'normal' });
      }
    });
    const stopD = rx.actualStopDate?.toDate ? rx.actualStopDate.toDate() : null;
    if (stopD) events.push({ id: `${rx.id}-stop`, date: stopD, type: 'stopped', diseaseTrack: track, drug, dose: rx.dose || rx.dosage, detail: rx.stopReason || 'Discontinued', severity: 'warning' });
    if (rx.switchedTo) events.push({ id: `${rx.id}-switch`, date: rx.switchedAt?.toDate ? rx.switchedAt.toDate() : new Date(), type: 'switched', diseaseTrack: track, drug, dose: rx.dose || rx.dosage, detail: `Switched to ${rx.switchedTo}`, outcome: 'Therapy changed' });
  });
  (sideEffects || []).forEach((se) => {
    const d = se.onset?.toDate ? se.onset.toDate() : null;
    if (d) events.push({ id: `se-${se.id}`, date: d, type: 'side_effect', diseaseTrack: se.medicationName || se.drug || 'General', drug: se.medicationName || se.drug, detail: `${se.sideEffect || se.symptom || ''} (${se.severity || 'mild'})`, severity: se.severity === 'severe' ? 'critical' : se.severity === 'moderate' ? 'warning' : 'normal' });
  });
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
