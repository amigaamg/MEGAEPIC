'use client';
// ─── AMEXAN — DifferentialSidebar ────────────────────────────────────────────
import { DiseaseScore } from '@/src/types';

interface Props {
  differentials: DiseaseScore[];
  isLoading?: boolean;
}

const confidenceConfig = {
  high:   { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',  label: 'HIGH'   },
  medium: { bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',        label: 'MED'    },
  low:    { bar: 'bg-gray-300',    badge: 'bg-gray-50 text-gray-500 border-gray-200',            label: 'LOW'    },
};

export function DifferentialSidebar({ differentials, isLoading }: Props) {
  const visible = differentials.filter(d => d.score > 0);
  const maxScore = visible[0]?.score ?? 1;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
          Live Differentials
        </h3>
        {isLoading && (
          <span className="flex items-center gap-1.5 text-xs text-blue-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Updating
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Answer questions to see the differential build live
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((dx, i) => {
            const cfg = confidenceConfig[dx.confidence];
            const widthPct = Math.max((dx.score / maxScore) * 100, 4);
            return (
              <li key={dx.diseaseId} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400 tabular-nums w-4 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {dx.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                {/* Score bar */}
                <div className="ml-6 bg-gray-100 rounded-full h-1">
                  <div
                    className={`${cfg.bar} h-1 rounded-full transition-all duration-700`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {visible.length > 0 && (
        <p className="text-[11px] text-gray-400 mt-4 border-t border-gray-100 pt-3">
          Ranking updates after each answer. Score reflects symptom weight match.
        </p>
      )}
    </div>
  );
}