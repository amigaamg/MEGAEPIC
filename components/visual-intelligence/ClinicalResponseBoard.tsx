'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface ResponseEntry {
  id: string;
  drug: string;
  dose: string;
  date: Date;
  effectivenessScore: number;
  symptomScore: number;
  labValue?: number;
  sideEffectBurden: number;
  patientReported: string;
}

interface Props {
  entries: ResponseEntry[];
  patientName?: string;
  diagnosis?: string;
}

const fmtShort = (d: Date) =>
  d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

const scoreColor = (v: number) => v >= 7 ? 'var(--green)' : v >= 4 ? 'var(--amber)' : 'var(--red)';

const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function GaugeRing({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.min(100, Math.max(0, value * 10));
  const offset = RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE;
  return (
    <div className="flex flex-col items-center">
      <svg width={72} height={72} className="-rotate-90">
        <circle cx={36} cy={36} r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={36} cy={36} r={RING_RADIUS} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center -mt-12">
        <div className="text-lg font-bold font-mono" style={{ color }}>{value.toFixed(1)}</div>
        <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default function ClinicalResponseBoard({ entries, patientName, diagnosis }: Props) {
  const [sortBy, setSortBy] = useState<'date' | 'effectiveness' | 'symptom'>('date');

  const sorted = useMemo(() => {
    const copy = [...entries];
    if (sortBy === 'date') copy.sort((a, b) => b.date.getTime() - a.date.getTime());
    if (sortBy === 'effectiveness') copy.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
    if (sortBy === 'symptom') copy.sort((a, b) => a.symptomScore - b.symptomScore);
    return copy;
  }, [entries, sortBy]);

  const avgEffectiveness = entries.length ? entries.reduce((s, e) => s + e.effectivenessScore, 0) / entries.length : 0;
  const avgSymptom = entries.length ? entries.reduce((s, e) => s + e.symptomScore, 0) / entries.length : 0;
  const avgSideEffect = entries.length ? entries.reduce((s, e) => s + e.sideEffectBurden, 0) / entries.length : 0;

  const latest = entries.length ? entries.reduce((a, b) => a.date > b.date ? a : b) : null;

  if (entries.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="text-3xl mb-2">📋</div>
        <div className="text-sm font-bold text-[var(--text-secondary)]">No Clinical Responses</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">Response tracking populates with patient assessments</div>
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
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">CR</div>
          <div>
            <div className="text-[10px] font-extrabold text-[var(--purple)] tracking-wider uppercase">Clinical Response Board</div>
            <div className="text-[9px] text-[var(--text-muted)]">{patientName}{diagnosis ? ` · ${diagnosis}` : ''}</div>
          </div>
        </div>
        <div className="flex gap-1 text-[9px]">
          {(['date', 'effectiveness', 'symptom'] as const).map((k) => (
            <button
              key={k}
              className={`px-2 py-0.5 rounded-full border cursor-pointer ${sortBy === k ? 'bg-[rgba(124,90,245,0.15)] border-[var(--purple)] text-[var(--purple)]' : 'border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setSortBy(k)}
            >
              {k === 'date' ? 'Date' : k === 'effectiveness' ? 'Best Eff' : 'Symptoms'}
            </button>
          ))}
        </div>
      </div>

      {/* Gauges */}
      <div className="flex justify-around py-4 px-4 border-b border-white/5 bg-[var(--surface-elevated)]">
        <GaugeRing value={avgEffectiveness} label="Avg Effectiveness" color="var(--green)" />
        <GaugeRing value={avgSymptom} label="Avg Symptoms" color={avgSymptom > 6 ? 'var(--red)' : avgSymptom > 3 ? 'var(--amber)' : 'var(--green)'} />
        <GaugeRing value={avgSideEffect} label="Side Effect Burden" color={avgSideEffect > 6 ? 'var(--red)' : avgSideEffect > 3 ? 'var(--amber)' : 'var(--green)'} />
        <div className="flex flex-col justify-center">
          <div className="text-[10px] text-[var(--text-muted)]">Latest</div>
          <div className="text-sm font-extrabold text-[var(--text-primary)]">{latest ? fmtShort(latest.date) : '—'}</div>
          {latest && <div className="text-[8px] text-[var(--text-muted)]">Eff: {latest.effectivenessScore.toFixed(1)}</div>}
        </div>
      </div>

      {/* Entry list */}
      <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
        {sorted.map((entry, i) => (
          <motion.div
            key={entry.id}
            className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            {/* Date */}
            <div className="w-12 flex-shrink-0">
              <div className="text-[9px] font-mono font-bold text-[var(--text-secondary)]">{fmtShort(entry.date)}</div>
            </div>

            {/* Drug */}
            <div className="w-24 flex-shrink-0">
              <div className="text-[10px] font-bold text-[var(--text-primary)]">{entry.drug}</div>
              <div className="text-[8px] text-[var(--text-muted)]">{entry.dose}</div>
            </div>

            {/* Effectiveness bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] w-6 text-right font-mono font-bold" style={{ color: scoreColor(entry.effectivenessScore) }}>
                  {entry.effectivenessScore.toFixed(1)}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${scoreColor(entry.effectivenessScore)}, ${entry.effectivenessScore >= 7 ? 'var(--teal)' : 'var(--amber)'})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${entry.effectivenessScore * 10}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />
                </div>
              </div>
            </div>

            {/* Symptom + side effect */}
            <div className="flex gap-2 flex-shrink-0">
              <div className="text-[8px] px-1.5 py-0.5 rounded bg-[rgba(255,69,96,0.08)] text-[var(--red)]">
                Sx {entry.symptomScore.toFixed(1)}
              </div>
              <div className={`text-[8px] px-1.5 py-0.5 rounded ${entry.sideEffectBurden > 5 ? 'bg-[rgba(255,176,32,0.1)] text-[var(--amber)]' : 'bg-[rgba(0,214,143,0.08)] text-[var(--green)]'}`}>
                SE {entry.sideEffectBurden.toFixed(1)}
              </div>
            </div>

            {/* Lab */}
            {entry.labValue !== undefined && (
              <div className="text-[9px] font-mono text-[var(--text-muted)] flex-shrink-0">{entry.labValue}</div>
            )}

            {/* Patient reported */}
            <div className="w-32 text-[9px] text-[var(--text-muted)] truncate flex-shrink-0">{entry.patientReported}</div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between px-4 py-1.5 border-t border-white/5 text-[8px] text-[var(--text-muted)] bg-[var(--surface-base)]">
        <span>{entries.length} assessments</span>
        <span>Eff: {avgEffectiveness.toFixed(1)} · Sx: {avgSymptom.toFixed(1)} · SE: {avgSideEffect.toFixed(1)}</span>
      </div>
    </motion.div>
  );
}
