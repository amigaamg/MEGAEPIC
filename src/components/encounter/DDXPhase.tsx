'use client';
import React from 'react';
import type { DDXResult } from '@/engine/ddx-engine';

interface DDXPhaseProps {
  ddxResults: DDXResult[];
  factCount: number;
  isComputing: boolean;
  onAccept: () => Promise<void>;
  onComplete: () => void;
  onManualAdjust?: (diseaseId: string, newProbability: number) => void;
}

export function DDXPhase({ ddxResults, factCount, isComputing, onAccept, onComplete, onManualAdjust }: DDXPhaseProps) {
  const [accepted, setAccepted] = React.useState(false);

  const handleAccept = async () => {
    setAccepted(true);
    await onAccept();
    onComplete();
  };

  const topDisease = ddxResults[0];

  return (
    <div className="space-y-6">
      {isComputing && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
          <span className="animate-pulse">●</span> Updating differential diagnosis...
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Based on {factCount} clinical facts</p>
        <span className="text-xs text-gray-400">{ddxResults.length} diagnoses considered</span>
      </div>

      <div className="space-y-2">
        {ddxResults.map((d, i) => {
          const barWidth = Math.max(d.probability, 5);
          const isTop = i === 0;
          return (
            <div
              key={d.diseaseId}
              className={`p-3 border rounded-lg transition-colors ${isTop ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{d.diseaseName}</span>
                  {isTop && <span className="text-xs text-blue-600 font-medium">Most likely</span>}
                </div>
                <span className="text-sm font-bold font-mono text-gray-700">{d.probability}%</span>
              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-blue-500' : 'bg-gray-300'}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {d.keyFactors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {d.keyFactors.map((f, j) => (
                    <span key={j} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={handleAccept} disabled={accepted || ddxResults.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {accepted ? 'DDX Accepted' : 'Accept DDX & Continue'}
        </button>
      </div>
    </div>
  );
}
