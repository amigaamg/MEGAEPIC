'use client';
import React, { useState, useMemo } from 'react';
import { useEncounter } from '@/lib/amexan/encounter';

interface DDXPhaseProps {
  onComplete?: () => void;
}

export function DDXPhase({ onComplete }: DDXPhaseProps) {
  const { state, computeDDX, dispatch } = useEncounter();
  const [computed, setComputed] = useState(false);
  const [computing, setComputing] = useState(false);

  const handleCompute = () => {
    setComputing(true);
    setTimeout(() => {
      computeDDX();
      setComputed(true);
      setComputing(false);
    }, 300);
  };

  const allDifferentials = state.assessment.differentials;
  const dangerRanked = state.assessment.dangerRanked;
  const mustNotMiss = state.assessment.mustNotMissDiseases;

  const hasResults = allDifferentials.length > 0;

  const factCount = useMemo(() => {
    const symptomFields = Object.values(state.symptoms).filter(s => s?.present).length;
    const hpiFields = Object.values(state.symptoms).filter(s => s?.present)
      .reduce((acc, s) => acc + Object.keys(s).length, 0);
    return hpiFields;
  }, [state.symptoms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <span className="text-sm font-semibold text-gray-700">Differential Diagnosis</span>
        </div>
      </div>

      {!hasResults && !computed && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-4">
            {computing ? 'Running Bayesian analysis...' : `Based on ${Math.max(factCount, 0)} clinical data points`}
          </p>
          <button
            onClick={handleCompute}
            disabled={computing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {computing ? 'Computing...' : 'Run DDX'}
          </button>
        </div>
      )}

      {computing && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
          <span className="animate-pulse">●</span> Computing differential diagnosis from structured data...
        </div>
      )}

      {hasResults && (
        <>
          {/* Must-not-miss diseases */}
          {mustNotMiss.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-2">🚨 Must Not Miss</p>
              {mustNotMiss.map((d) => (
                <div key={d.diseaseId} className="flex items-center justify-between text-sm text-red-700 py-1">
                  <span className="font-medium">{d.diseaseName}</span>
                  <span className="font-mono text-red-600">{Math.round(d.probability * 100)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Danger-ranked list */}
          <div className="space-y-2">
            {dangerRanked.map((d, i) => {
              const dangerColor: Record<string, string> = {
                critical: 'border-red-300 bg-red-50',
                high: 'border-orange-300 bg-orange-50',
                moderate: 'border-yellow-300 bg-yellow-50',
                low: 'border-gray-200 bg-white',
              };
              const barColor: Record<string, string> = {
                critical: 'bg-red-500',
                high: 'bg-orange-500',
                moderate: 'bg-yellow-500',
                low: 'bg-blue-500',
              };
              const pct = Math.round(d.probability * 100);

              return (
                <div
                  key={d.diseaseId}
                  className={`p-3 border rounded-lg transition-colors ${dangerColor[d.dangerLevel] || 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{d.diseaseName}</span>
                      {d.mustNotMiss && <span className="text-[10px] text-red-600 font-bold">CRITICAL</span>}
                    </div>
                    <span className="text-sm font-bold font-mono text-gray-700">{pct}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor[d.dangerLevel]}`}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      d.dangerLevel === 'critical' ? 'bg-red-100 text-red-700' :
                      d.dangerLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                      d.dangerLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {d.dangerLevel}
                    </span>
                    {d.confidence && (
                      <span className="text-[10px] text-gray-400">{d.confidence} confidence</span>
                    )}
                  </div>

                  {d.supportingFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {d.supportingFeatures.slice(0, 4).map((f, j) => (
                        <span key={j} className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-full">
                          + {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => { if (onComplete) onComplete(); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Accept DDX & Continue
            </button>
          </div>
        </>
      )}
    </div>
  );
}
