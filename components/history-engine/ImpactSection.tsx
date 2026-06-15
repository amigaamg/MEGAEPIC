'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

export default function ImpactSection() {
  const impact = useHistoryStore(s => s.impactOnLife);
  const setImpactOnLife = useHistoryStore(s => s.setImpactOnLife);
  const completeSection = useHistoryStore(s => s.completeSection);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Impact on Life</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Work</label>
          <div className="flex gap-1.5">
            {['no_impact', 'reduced', 'unable'].map(opt => (
              <button key={opt} onClick={() => setImpactOnLife({ work: opt as any })}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${impact.work === opt
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Walking / Mobility</label>
          <div className="flex gap-1.5">
            {['no_impact', 'reduced', 'unable'].map(opt => (
              <button key={opt} onClick={() => setImpactOnLife({ walking: opt as any })}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${impact.walking === opt
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Eating / Appetite</label>
          <div className="flex gap-1.5">
            {['no_impact', 'reduced', 'unable'].map(opt => (
              <button key={opt} onClick={() => setImpactOnLife({ eating: opt as any })}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${impact.eating === opt
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Sleep</label>
          <div className="flex gap-1.5">
            {['no_impact', 'disturbed', 'severely_disturbed'].map(opt => (
              <button key={opt} onClick={() => setImpactOnLife({ sleeping: opt as any })}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${impact.sleeping === opt
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Daily Activities (ADLs)</label>
          <div className="flex gap-1.5">
            {['independent', 'needs_assistance', 'dependent'].map(opt => (
              <button key={opt} onClick={() => setImpactOnLife({ adl: opt as any })}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${impact.adl === opt
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Additional notes on functional status</label>
        <textarea value={impact.description} onChange={e => setImpactOnLife({ description: e.target.value })}
          className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          rows={2} placeholder="Describe how illness affects daily life..." />
      </div>

      <button onClick={() => completeSection('impact')}
        className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
        Complete Impact Assessment
      </button>
    </div>
  );
}
