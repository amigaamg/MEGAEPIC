'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import HISTORY_FEATURE_REGISTRY from '@/lib/history-engine/historyFeatureRegistry';

interface Props {
  diseaseId: string;
  diseaseName: string;
  probability: number;
}

export default function AdaptiveCard({ diseaseId, diseaseName, probability }: Props) {
  const featureRegistry = useHistoryStore(s => s.featureRegistry);
  const setFeature = useHistoryStore(s => s.setFeature);

  const features = Object.entries(HISTORY_FEATURE_REGISTRY)
    .filter(([, def]) => def.diseaseWeights[diseaseId] && Math.abs(def.diseaseWeights[diseaseId]) >= 2)
    .slice(0, 6);

  if (features.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-700/50 bg-[#12193a] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-teal-500/10 to-transparent border-b border-gray-700/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-teal-400 uppercase">{diseaseName}</span>
          <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{probability}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${probability}%` }} />
          </div>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {features.map(([fid, fdef]) => {
          const answered = featureRegistry[fid];
          const isYes = answered?.present === true;
          const isNo = answered?.present === false;
          return (
            <div key={fid} className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-300">{fdef.label}</span>
              <div className="flex gap-1">
                <button onClick={() => setFeature(fid, true)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${isYes
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:border-teal-500/30'}`}>
                  Yes
                </button>
                <button onClick={() => setFeature(fid, false)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${isNo
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:border-red-500/30'}`}>
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
