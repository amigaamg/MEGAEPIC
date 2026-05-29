'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Dose {
  id: string;
  scheduledTime: Date;
  dose: string;
  status: 'taken' | 'delayed' | 'missed' | 'refused' | 'adjusted' | 'held' | 'pending';
  actualTime?: Date;
  notes?: string;
}

interface MedSchedule {
  id: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  color: string;
  doses: Dose[];
}

interface Props {
  schedules: MedSchedule[];
  date: Date;
  onTakeDose?: (scheduleId: string, doseId: string) => void;
  onReportMissed?: (scheduleId: string, doseId: string, reason: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  taken:   { label: 'Taken',   bg: 'rgba(0,214,143,0.12)', text: 'var(--green)', icon: '✓' },
  delayed: { label: 'Delayed', bg: 'rgba(255,176,32,0.12)', text: 'var(--amber)', icon: '⟳' },
  missed:  { label: 'Missed',  bg: 'rgba(255,69,96,0.12)', text: 'var(--red)',   icon: '✗' },
  refused: { label: 'Refused', bg: 'rgba(255,69,96,0.18)', text: 'var(--red)',   icon: '⊘' },
  adjusted:{ label: 'Adjusted',bg: 'rgba(124,90,245,0.12)', text: 'var(--purple)',icon: '↕' },
  held:    { label: 'Held',    bg: 'rgba(132,146,166,0.12)', text: '#8492a6',     icon: '⏸' },
  pending: { label: 'Pending', bg: 'rgba(255,255,255,0.04)', text: 'var(--text-muted)', icon: '○' },
};

const fmtTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export default function TSHEETS({ schedules, date, onTakeDose, onReportMissed }: Props) {
  const [selectedDose, setSelectedDose] = useState<{ schedId: string; dose: Dose } | null>(null);
  const [missedReason, setMissedReason] = useState('');
  const [showMissedModal, setShowMissedModal] = useState(false);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const total = schedules.reduce((s, m) => s + m.doses.length, 0);
  const taken = schedules.reduce((s, m) => s + m.doses.filter(d => d.status === 'taken').length, 0);
  const pending = schedules.reduce((s, m) => s + m.doses.filter(d => d.status === 'pending').length, 0);
  const missed = schedules.reduce((s, m) => s + m.doses.filter(d => d.status === 'missed' || d.status === 'refused').length, 0);
  const adherencePct = total ? Math.round((taken / total) * 100) : 0;

  if (schedules.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="text-3xl mb-2">💊</div>
        <div className="text-sm font-bold text-[var(--text-secondary)]">No Schedule</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">
          No medications scheduled for {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-gradient-to-r from-[var(--surface-base)] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-[9px] font-bold text-black">24h</div>
          <div>
            <div className="text-[10px] font-extrabold text-[var(--teal)] tracking-wider uppercase">TSHEETS · Medication Schedule</div>
            <div className="text-[9px] text-[var(--text-muted)]">
              {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 text-[9px]">
            <span className="px-1.5 py-0.5 rounded bg-[rgba(0,214,143,0.1)] text-[var(--green)]">{taken} taken</span>
            <span className="px-1.5 py-0.5 rounded bg-[rgba(255,176,32,0.1)] text-[var(--amber)]">{pending} pending</span>
            <span className="px-1.5 py-0.5 rounded bg-[rgba(255,69,96,0.1)] text-[var(--red)]">{missed} missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${adherencePct}%`, background: adherencePct > 80 ? 'var(--green)' : adherencePct > 50 ? 'var(--amber)' : 'var(--red)' }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold" style={{ color: adherencePct > 80 ? 'var(--green)' : adherencePct > 50 ? 'var(--amber)' : 'var(--red)' }}>
              {adherencePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="min-w-[900px] p-3">
          {/* Hour column headers */}
          <div className="flex mb-2" style={{ marginLeft: 120, gap: 0 }}>
            {hours.map((h) => (
              <div key={`h-${h}`} className="flex-shrink-0 text-center" style={{ width: `${100 / 24}%` }}>
                <span className="text-[7px] font-mono text-[var(--text-muted)]">{h.toString().padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Hour grid lines */}
          <div className="relative" style={{ marginLeft: 120 }}>
            {hours.map((h) => (
              <div key={`gl-${h}`} className="absolute top-0 bottom-0 w-px bg-white/[0.02]" style={{ left: `${(h / 24) * 100}%` }} />
            ))}
          </div>

          {/* Drug rows */}
          {schedules.map((med, medIdx) => (
            <motion.div
              key={med.id}
              className="relative mb-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: medIdx * 0.05 }}
            >
              {/* Drug label */}
              <div className="absolute left-0 top-0 bottom-0 w-[120px] flex items-center px-2.5 border-r border-white/5">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: med.color }} />
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{med.drug}</span>
                  </div>
                  <div className="text-[8px] text-[var(--text-muted)] ml-2.5">
                    {med.dose} · {med.route} · {med.frequency}
                  </div>
                </div>
              </div>

              {/* Dose blocks */}
              <div className="flex" style={{ marginLeft: 120 }}>
                {hours.map((h) => {
                  const matching = med.doses.filter(d => d.scheduledTime.getHours() === h);
                  return (
                    <div key={`${med.id}-${h}`} className="flex-shrink-0 p-0.5" style={{ width: `${100 / 24}%` }}>
                      {matching.map((dose) => {
                        const sc = STATUS_CONFIG[dose.status];
                        return (
                          <motion.button
                            key={dose.id}
                            className="w-full rounded text-[9px] font-bold cursor-pointer border text-center leading-tight"
                            style={{
                              background: sc.bg, color: sc.text,
                              borderColor: dose.status === 'pending' ? 'rgba(255,255,255,0.08)' : sc.text + '33',
                              minHeight: 28,
                            }}
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedDose({ schedId: med.id, dose });
                              if (dose.status === 'pending' && onTakeDose) {
                                onTakeDose(med.id, dose.id);
                              }
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              if (dose.status === 'pending' || dose.status === 'missed') {
                                setSelectedDose({ schedId: med.id, dose });
                                setShowMissedModal(true);
                              }
                            }}
                          >
                            <div>{sc.icon}</div>
                            {dose.actualTime && <div className="text-[7px] opacity-60">{fmtTime(dose.actualTime)}</div>}
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dose detail panel */}
      <AnimatePresence>
        {selectedDose && !showMissedModal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-[var(--surface-elevated)]"
          >
            <div className="p-3 flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <span className="text-lg">{STATUS_CONFIG[selectedDose.dose.status]?.icon}</span>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    {selectedDose.dose.dose} @ {fmtTime(selectedDose.dose.scheduledTime)}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    Status: {selectedDose.dose.status}
                    {selectedDose.dose.actualTime && ` · Taken: ${fmtTime(selectedDose.dose.actualTime)}`}
                  </div>
                  {selectedDose.dose.notes && (
                    <div className="text-[10px] text-[var(--text-muted)] italic mt-0.5">{selectedDose.dose.notes}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDose(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missed dose modal */}
      <AnimatePresence>
        {showMissedModal && selectedDose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMissedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card w-[320px] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-extrabold text-[var(--text-primary)] mb-2">Report Missed Dose</div>
              <div className="text-[11px] text-[var(--text-secondary)] mb-3">
                {selectedDose.dose.dose} @ {fmtTime(selectedDose.dose.scheduledTime)}
              </div>
              <input
                className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--surface-card)] border border-white/10 text-[var(--text-primary)] outline-none mb-3"
                placeholder="Reason for missing..."
                value={missedReason}
                onChange={(e) => setMissedReason(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-[var(--text-muted)] border border-white/10 cursor-pointer hover:bg-white/5"
                  onClick={() => setShowMissedModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white cursor-pointer"
                  style={{ background: 'var(--red)' }}
                  onClick={() => {
                    onReportMissed?.(selectedDose.schedId, selectedDose.dose.id, missedReason);
                    setShowMissedModal(false);
                    setSelectedDose(null);
                    setMissedReason('');
                  }}
                >
                  Confirm Missed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex justify-between px-4 py-1.5 border-t border-white/5 text-[8px] text-[var(--text-muted)] bg-[var(--surface-base)]">
        <span>Click to mark taken · Right-click to report missed</span>
        <span>{total} doses · {adherencePct}% adherence</span>
      </div>
    </motion.div>
  );
}
