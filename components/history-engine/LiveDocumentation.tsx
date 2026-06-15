'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

export default function LiveDocumentation() {
  const documents = useHistoryStore(s => s.documents);
  const redFlags = useHistoryStore(s => s.redFlags);
  const biodata = useHistoryStore(s => s.biodata);
  const activeSection = useHistoryStore(s => s.activeSection);
  const completedSections = useHistoryStore(s => s.completedSections);

  const progress = completedSections.length;
  const totalSections = 8;

  const criticalFlags = redFlags.filter(r => r.severity === 'critical');

  return (
    <div className="h-full flex flex-col">
      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">History Progress</span>
          <span className="text-[10px] text-gray-500">{progress}/{totalSections}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${(progress / totalSections) * 100}%` }} />
        </div>
      </div>

      {/* Red Flags */}
      {criticalFlags.length > 0 && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="text-[10px] font-bold text-red-400 uppercase mb-1">Critical Red Flags</div>
          {criticalFlags.slice(0, 2).map(r => (
            <div key={r.id} className="text-[10px] text-red-300/80 py-0.5">⚠ {r.message}</div>
          ))}
        </div>
      )}

      {/* Live Document */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Live Documentation</div>
        <div className="space-y-2 text-[11px] leading-relaxed">
          {documents.fullDocumentation ? (
            <div className="bg-[#12193a] border border-gray-700/30 rounded-lg p-3">
              <pre className="text-[10px] text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {documents.fullDocumentation}
              </pre>
            </div>
          ) : biodata.name ? (
            <div className="text-gray-500 italic">
              Documentation will appear as you complete sections...
            </div>
          ) : (
            <div className="text-gray-600 italic text-center py-4">
              Start with patient details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
