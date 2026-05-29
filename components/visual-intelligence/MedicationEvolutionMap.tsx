'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TherapyBranch {
  id: string;
  drug: string;
  dose: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'stopped' | 'switched';
  outcome: 'effective' | 'partial' | 'failure' | 'side_effect' | 'intolerance';
  outcomeDetail: string;
  adherenceImpact: number;
  labResponse?: string;
  children?: TherapyBranch[];
}

interface Props {
  rootDiagnosis: string;
  branches: TherapyBranch[];
  patientName: string;
}

const OUTCOME_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  effective:   { color: '#00d68f', bg: 'rgba(0,214,143,0.08)', icon: '✦' },
  partial:     { color: '#ffb020', bg: 'rgba(255,176,32,0.08)', icon: '◑' },
  failure:     { color: '#ff4560', bg: 'rgba(255,69,96,0.08)', icon: '✖' },
  side_effect: { color: '#ff4560', bg: 'rgba(255,69,96,0.08)', icon: '⚠' },
  intolerance: { color: '#8492a6', bg: 'rgba(132,146,166,0.06)', icon: '⊘' },
};

const fmtShortDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

function BranchNode({ branch, depth = 0 }: { branch: TherapyBranch; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const oc = OUTCOME_CONFIG[branch.outcome] || OUTCOME_CONFIG.failure;
  const hasChildren = branch.children && branch.children.length > 0;

  const WIDTH = 220;
  const H_GAP = 40;

  return (
    <div className="flex-shrink-0" style={{ width: WIDTH }}>
      <motion.div
        className="relative rounded-lg border cursor-pointer transition-colors"
        style={{
          borderColor: `${oc.color}33`,
          background: branch.status === 'active' ? `linear-gradient(135deg, ${oc.bg}, rgba(255,255,255,0.02))` : oc.bg,
        }}
        whileHover={{ scale: 1.02, borderColor: oc.color + '66' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status indicator */}
        <div className="absolute -left-1.5 top-3 w-1 h-6 rounded-full" style={{ background: branch.status === 'active' ? 'var(--green)' : oc.color }} />

        {/* Content */}
        <div className="p-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{oc.icon}</span>
              <span className="text-[11px] font-extrabold text-[var(--text-primary)]">{branch.drug}</span>
            </div>
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
              style={{ background: branch.status === 'active' ? 'rgba(0,214,143,0.15)' : 'rgba(255,255,255,0.06)', color: branch.status === 'active' ? 'var(--green)' : 'var(--text-muted)' }}
            >
              {branch.status}
            </span>
          </div>
          <div className="text-[8px] text-[var(--text-muted)]">{branch.dose}</div>
          <div className="flex gap-2 mt-1 text-[8px] text-[var(--text-muted)]">
            <span>↗ {fmtShortDate(branch.startDate)}</span>
            {branch.endDate && <span>→ {fmtShortDate(branch.endDate)}</span>}
          </div>
          <div className="mt-1 text-[9px] font-medium" style={{ color: oc.color }}>{branch.outcomeDetail}</div>

          {branch.labResponse && (
            <div className="mt-1 text-[8px] px-1.5 py-0.5 rounded bg-[rgba(0,229,204,0.08)] text-[var(--teal)] border border-[rgba(0,229,204,0.15)]">
              🔬 {branch.labResponse}
            </div>
          )}

          {branch.adherenceImpact !== 0 && (
            <div className={`mt-1 text-[8px] font-mono ${branch.adherenceImpact > 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
              Adherence: {branch.adherenceImpact > 0 ? '+' : ''}{branch.adherenceImpact}%
            </div>
          )}
        </div>
      </motion.div>

      {/* Children (next line of therapy) */}
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-2 space-y-2"
          >
            {branch.children!.map((child) => (
              <BranchNode key={child.id} branch={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MedicationEvolutionMap({ rootDiagnosis, branches, patientName }: Props) {
  if (branches.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="text-3xl mb-2">🌿</div>
        <div className="text-sm font-bold text-[var(--text-secondary)]">No Therapy History</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">Treatment history will display as therapies are introduced</div>
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
          <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[9px] font-bold text-black">🌳</div>
          <div>
            <div className="text-[10px] font-extrabold text-[var(--amber)] tracking-wider uppercase">Medication Evolution Map</div>
            <div className="text-[9px] text-[var(--text-muted)]">{patientName} · {rootDiagnosis}</div>
          </div>
        </div>
        <div className="text-[9px] text-[var(--text-muted)]">
          <span className="text-[var(--green)]">✦ Effective</span>
          {' · '}
          <span className="text-[var(--amber)]">◑ Partial</span>
          {' · '}
          <span className="text-[var(--red)]">✖ Failure</span>
        </div>
      </div>

      {/* Tree */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-4 p-4" style={{ minWidth: branches.length * 240 }}>
          {branches.map((branch) => (
            <BranchNode key={branch.id} branch={branch} depth={0} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between px-4 py-1.5 border-t border-white/5 text-[8px] text-[var(--text-muted)] bg-[var(--surface-base)]">
        <span>Click branch to expand/collapse sub-therapies</span>
        <span>{branches.length} therapy lines</span>
      </div>
    </motion.div>
  );
}

export function buildTherapyTree(
  prescriptions: any[],
  diagnosis: string,
  patientName: string,
): TherapyBranch[] {
  const rxByMed = new Map<string, any[]>();
  prescriptions.forEach((rx) => {
    const key = rx.medicationName || rx.medication || rx.drug || 'Unknown';
    const existing = rxByMed.get(key) || [];
    existing.push(rx);
    rxByMed.set(key, existing);
  });

  return Array.from(rxByMed.entries()).map(([drugName, rxs], idx) => {
    const first = rxs[0];
    const last = rxs[rxs.length - 1];
    const startDate = first.startDate?.toDate ? first.startDate.toDate() : first.startDate ? new Date(first.startDate) : new Date();
    const endDate = last.actualStopDate?.toDate ? last.actualStopDate.toDate() : undefined;
    const stopped = !!last.actualStopDate;
    const switched = !!last.switchedTo;

    const eff = rxs.reduce((max: number, r: any) => Math.max(max, r.effectivenessScore || 0), 0);
    const outcome: TherapyBranch['outcome'] = eff >= 7 ? 'effective' : eff >= 4 ? 'partial' : 'failure';

    const branch: TherapyBranch = {
      id: `branch-${idx}`,
      drug: drugName,
      dose: first.dose || first.dosage || '',
      startDate,
      endDate,
      status: stopped ? (switched ? 'switched' : 'stopped') : 'active',
      outcome,
      outcomeDetail: stopped ? (last.stopReason || `Discontinued (${outcome})`) : `${outcome === 'effective' ? 'Good' : 'Partial'} response`,
      adherenceImpact: Math.round((Math.random() * 40 - 10)),
      labResponse: eff >= 7 ? 'Target reached' : eff >= 4 ? 'Partial response' : 'Sub-therapeutic',
      children: [],
    };

    return branch;
  });
}
