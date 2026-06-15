'use client';

export interface PhaseDef {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  phases: PhaseDef[];
  activePhase: string;
  completedPhases: string[];
  onEnterPhase: (id: string) => void;
}

export function PhaseNavigation({ phases, activePhase, completedPhases, onEnterPhase }: Props) {
  return (
    <div className="border-r border-white/10 overflow-y-auto bg-white/[.01] pt-2 min-w-[200px]">
      <div className="flex items-center gap-2 px-4 pb-3 mb-2">
        <span className="text-xs font-bold text-cyan-400" style={{ fontFamily: "'Syne',sans-serif" }}>Encounter</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">Unified</span>
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {phases.map((ph, i) => {
          const done = completedPhases.includes(ph.id);
          const active = activePhase === ph.id;
          const bg = active ? 'bg-cyan-500/10' : done ? 'bg-therapeutic-green/10' : 'bg-transparent';
          const border = active ? 'border border-cyan-500/30' : 'border border-transparent';
          const txt = active ? 'text-cyan-400' : done ? 'text-therapeutic-green' : 'text-slate-500';
          return (
            <button key={ph.id} onClick={() => onEnterPhase(ph.id)}
              className={`w-full px-3 py-2 rounded-md text-left cursor-pointer flex items-center gap-2 transition-all duration-100 ${bg} ${border} ${txt}`}>
              <span className={active || done ? '' : 'opacity-40'}>{ph.icon}</span>
              <span className={`flex-1 text-[11px] ${active ? 'font-semibold' : 'font-normal'}`}>{ph.label}</span>
              {done && <span className="text-[9px] text-therapeutic-green">✓</span>}
              {i < phases.length - 1 && !done && (
                <span className="text-[8px] text-slate-700">{'>'}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
