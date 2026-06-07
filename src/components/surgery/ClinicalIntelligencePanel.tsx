'use client';
import React, { useMemo } from 'react';
import { getDiseaseById } from '@/engine/knowledge-graph';

interface ClinicalIntelligencePanelProps {
  encounterId: string;
  deptSlug: string;
  unitSlug: string;
  ddxResults: Array<{
    diseaseId: string;
    diseaseName: string;
    probability: number;
    keyFactors: string[];
  }>;
  isComputing: boolean;
  factCount: number;
  encounterStatus: string;
  topDiseaseIds: string[];
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-therapeutic-green/20 text-therapeutic-green border-therapeutic-green/30',
  admitted: 'bg-therapeutic-teal/20 text-therapeutic-teal border-therapeutic-teal/30',
  'post-op': 'bg-therapeutic-purple/20 text-therapeutic-purple border-therapeutic-purple/30',
  discharged: 'bg-frost-500/20 text-frost-500 border-frost-500/30',
  follow_up: 'bg-therapeutic-amber/20 text-therapeutic-amber border-therapeutic-amber/30',
};

function SkeletonBar() {
  return (
    <div className="h-1.5 rounded-full bg-midnight-600 overflow-hidden">
      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-therapeutic-teal/40 via-therapeutic-teal/60 to-therapeutic-teal/40 animate-pulse-slow" />
    </div>
  );
}

export function ClinicalIntelligencePanel(props: ClinicalIntelligencePanelProps) {
  const { ddxResults, isComputing, factCount, encounterStatus } = props;

  const sortedDDX = useMemo(
    () => [...ddxResults].sort((a, b) => b.probability - a.probability),
    [ddxResults]
  );

  const topDiseaseResult = sortedDDX[0];

  const disease = useMemo(() => {
    if (!topDiseaseResult) return null;
    return getDiseaseById(topDiseaseResult.diseaseId) ?? null;
  }, [topDiseaseResult]);

  const redFlags = disease?.diagnosticClues ?? [];

  const historyQuestions = useMemo(() => {
    const legacy = (disease as any)?.history_questions as
      | { question: string; weight: number }[]
      | undefined;
    if (legacy) return legacy;
    return [];
  }, [disease]);

  const labs = (disease as any)?.investigations?.laboratory ?? [];
  const imaging = (disease as any)?.investigations?.imaging ?? [];

  const managementSteps = useMemo(() => {
    if (!disease) return [];
    const mgmt = (disease as any).management;
    if (mgmt?.initial?.resuscitation) {
      return mgmt.initial.resuscitation as string[];
    }
    if (mgmt?.pathways?.[0]?.treatment) {
      const t = mgmt.pathways[0].treatment;
      return typeof t === 'string' ? [t] : t;
    }
    return [];
  }, [disease]);

  const statusColor = STATUS_COLORS[encounterStatus] || 'bg-frost-500/20 text-frost-500 border-frost-500/30';

  return (
    <aside className="w-80 shrink-0 h-full overflow-y-auto border-l border-white/5 bg-midnight-900/80 backdrop-blur-xl">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-frost-400 uppercase">
            Clinical Intelligence
          </h2>
          {encounterStatus && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>
              {encounterStatus.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Computing State */}
        {isComputing && (
          <div className="space-y-3 animate-fade-in">
            <div className="space-y-1.5">
              <SkeletonBar />
              <SkeletonBar />
              <SkeletonBar />
            </div>
            <p className="text-[11px] text-frost-500/60 text-center">Computing differential...</p>
          </div>
        )}

        {/* Empty State */}
        {!isComputing && sortedDDX.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[11px] text-frost-500/40">No DDX results yet</p>
            <p className="text-[10px] text-frost-500/30 mt-1">Enter clinical findings to begin</p>
          </div>
        )}

        {/* Content */}
        {!isComputing && sortedDDX.length > 0 && (
          <>
            {/* Top Diagnoses */}
            <section>
              <h3 className="text-[11px] font-semibold text-frost-300 mb-2 flex items-center gap-1.5">
                <span className="text-therapeutic-teal">⚡</span> Top Diagnoses
              </h3>
              <div className="space-y-2">
                {sortedDDX.slice(0, 5).map((dx) => (
                  <div key={dx.diseaseId}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-[11px] truncate ${
                          dx.diseaseId === topDiseaseResult?.diseaseId
                            ? 'text-frost-50 font-medium'
                            : 'text-frost-400'
                        }`}
                      >
                        {dx.diseaseName}
                      </span>
                      <span className="text-[10px] text-frost-500 tabular-nums">
                        {(dx.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-midnight-600 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(dx.probability * 100, 2)}%`,
                          background:
                            dx.diseaseId === topDiseaseResult?.diseaseId
                              ? 'linear-gradient(90deg, #00e5cc, #00d68f)'
                              : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {disease && (
              <>
                {/* Red Flags */}
                {redFlags.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-semibold text-frost-300 mb-2 flex items-center gap-1.5">
                      <span className="text-therapeutic-amber">⚠</span> Red Flags
                    </h3>
                    <ul className="space-y-1">
                      {redFlags.slice(0, 6).map((flag: string) => (
                        <li key={flag} className="text-[11px] text-frost-400 flex items-start gap-1.5">
                          <span className="text-therapeutic-amber mt-0.5">•</span>
                          {flag.replace(/_/g, ' ')}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Missing Questions */}
                {historyQuestions.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-semibold text-frost-300 mb-2 flex items-center gap-1.5">
                      <span className="text-therapeutic-purple">❓</span> Missing Questions
                    </h3>
                    <ul className="space-y-1">
                      {historyQuestions
                        .sort((a, b) => b.weight - a.weight)
                        .slice(0, 5)
                        .map((q: { question: string; weight: number }, i: number) => (
                          <li key={i} className="text-[11px] text-frost-400 flex items-start gap-1.5">
                            <span className="text-therapeutic-purple mt-0.5">•</span>
                            {q.question}
                          </li>
                        ))}
                    </ul>
                  </section>
                )}

                {/* Suggested Labs */}
                {labs.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-semibold text-frost-300 mb-2 flex items-center gap-1.5">
                      <span className="text-therapeutic-teal">🧪</span> Suggested Labs
                    </h3>
                    <ul className="space-y-1">
                      {labs.map((lab: any) => (
                        <li key={lab.name} className="text-[11px] text-frost-400 flex items-start gap-1.5">
                          <span className="text-therapeutic-teal mt-0.5">•</span>
                          {lab.name}
                          {lab.indication && (
                            <span className="text-frost-500 ml-0.5">({lab.indication})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Suggested Imaging */}
                {imaging.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-semibold text-frost-300 mb-2 flex items-center gap-1.5">
                      <span className="text-therapeutic-teal">📡</span> Suggested Imaging
                    </h3>
                    <ul className="space-y-1">
                      {imaging.map((img: any) => (
                        <li key={img.name} className="text-[11px] text-frost-400 flex items-start gap-1.5">
                          <span className="text-therapeutic-teal mt-0.5">•</span>
                          {img.name}
                          {img.indication && (
                            <span className="text-frost-500 ml-0.5">({img.indication})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Suggested Management */}
                {managementSteps.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-semibold text-frost-300 mb-2 flex items-center gap-1.5">
                      <span className="text-therapeutic-green">💊</span> Suggested Mgmt
                    </h3>
                    <ul className="space-y-1">
                      {managementSteps.slice(0, 6).map((step: string, i: number) => (
                        <li key={i} className="text-[11px] text-frost-400 flex items-start gap-1.5">
                          <span className="text-therapeutic-green mt-0.5">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* Facts Analyzed Footer */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-frost-500">
              <span className="font-medium text-frost-400">{factCount}</span> facts analyzed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-therapeutic-green animate-pulse" />
              <span className="text-therapeutic-green/70">live</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
