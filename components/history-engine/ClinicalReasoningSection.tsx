'use client';
import { useMemo } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { interpretVitals } from '@/lib/history-engine/clinicalReasoningEngine';

export default function ClinicalReasoningSection() {
  const clinicalReasoning = useHistoryStore(s => s.clinicalReasoning);
  const provisionalDiagnosis = useHistoryStore(s => s.provisionalDiagnosis);
  const ddx = useHistoryStore(s => s.ddx);
  const generalExamination = useHistoryStore(s => s.generalExamination);
  const setProvisionalDiagnosis = useHistoryStore(s => s.setProvisionalDiagnosis);
  const setDifferentialReasoning = useHistoryStore(s => s.setDifferentialReasoning);

  const vitalsInterpretations = useMemo(() => interpretVitals(generalExamination), [generalExamination]);

  const topDifferentials = useMemo(() =>
    [...ddx.probabilities].sort((a, b) => b.probability - a.probability).slice(0, 5),
    [ddx.probabilities]
  );

  const maxProb = topDifferentials.length > 0 ? topDifferentials[0].probability : 1;

  const handleSetProvisional = (diseaseId: string, diseaseName: string, probability: number) => {
    const reasoning = clinicalReasoning.find(r => r.diseaseId === diseaseId);
    setProvisionalDiagnosis(
      diseaseName,
      diseaseId,
      probability,
      reasoning?.supportingFromHistory ?? [],
      reasoning?.supportingFromExamination ?? []
    );
  };

  const handleRemoveProvisional = () => {
    setProvisionalDiagnosis('', '', 0, [], []);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Clinical Reasoning</h2>
      </div>

      {/* Provisional Diagnosis */}
      {provisionalDiagnosis && provisionalDiagnosis.diagnosis ? (
        <div className="rounded-xl border-2 border-green-500/40 bg-green-500/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-green-400 uppercase tracking-wider font-semibold">Provisional Diagnosis</span>
            <button onClick={handleRemoveProvisional}
              className="text-[10px] text-[var(--text-muted)] hover:text-red-400 underline">
              Remove
            </button>
          </div>
          <div className="text-base font-bold text-green-400">{provisionalDiagnosis.diagnosis}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Probability: {Math.round(provisionalDiagnosis.probability)}%
          </div>
          {provisionalDiagnosis.reasoning.fromHistory.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">From History</div>
              <ul className="space-y-0.5">
                {provisionalDiagnosis.reasoning.fromHistory.map((f, i) => (
                  <li key={i} className="text-xs text-green-300/80 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">&#9679;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {provisionalDiagnosis.reasoning.fromExamination.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">From Examination</div>
              <ul className="space-y-0.5">
                {provisionalDiagnosis.reasoning.fromExamination.map((f, i) => (
                  <li key={i} className="text-xs text-green-300/80 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">&#9679;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--accent-dim)]/30 p-4 text-center">
          <span className="text-xs text-[var(--text-muted)]">No provisional diagnosis set. Click a differential below to set one.</span>
        </div>
      )}

      {/* Top 5 Differentials Bar Chart */}
      {topDifferentials.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Top Differentials</span>
          </div>
          <div className="p-4 space-y-3">
            {topDifferentials.map(d => (
              <div key={d.diseaseId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-primary)] font-medium">{d.diseaseName}</span>
                  <span className="text-[var(--text-secondary)]">{Math.round(d.probability)}%</span>
                </div>
                <div className="w-full h-5 bg-[var(--accent-dim)] rounded-full overflow-hidden relative cursor-pointer group"
                  onClick={() => handleSetProvisional(d.diseaseId, d.diseaseName, d.probability)}
                  title={`Set ${d.diseaseName} as provisional diagnosis`}>
                  <div
                    className="h-full bg-teal-500/60 rounded-full transition-all duration-500"
                    style={{ width: `${(d.probability / maxProb) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                    Set as provisional
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vitals Interpretation */}
      {vitalsInterpretations.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Vitals Interpretation</span>
          </div>
          <div className="p-4 space-y-1.5">
            {vitalsInterpretations.map((v, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={`mt-0.5 shrink-0 ${v.isAbnormal ? 'text-red-500' : 'text-green-500'}`}>
                  {v.isAbnormal ? '&#9679;' : '&#9679;'}
                </span>
                <span className={v.isAbnormal ? 'text-red-300/90' : 'text-green-300/90'}>
                  {v.finding}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Reasoning Items */}
      {clinicalReasoning.length > 0 && (
        <div className="space-y-3">
          {clinicalReasoning.map(item => (
            <div key={item.diseaseId}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--accent-dim)]/30 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{item.diseaseName}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--accent-dim)] px-1.5 py-0.5 rounded">
                    {Math.round(item.probability)}%
                  </span>
                </div>
                <button onClick={() => handleSetProvisional(item.diseaseId, item.diseaseName, item.probability)}
                  className="text-[10px] text-[var(--accent)] hover:text-teal-300 underline">
                  Set as provisional
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Supporting Features */}
                {(item.supportingFromHistory.length > 0 || item.supportingFromExamination.length > 0) && (
                  <div>
                    <div className="text-[10px] text-green-500 uppercase tracking-wider font-semibold mb-1.5">Supporting Features</div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.supportingFromHistory.map((f, i) => (
                        <span key={`hist-${i}`}
                          className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                          {f}
                        </span>
                      ))}
                      {item.supportingFromExamination.map((f, i) => (
                        <span key={`exam-${i}`}
                          className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opposing Features */}
                {item.opposing.length > 0 && (
                  <div>
                    <div className="text-[10px] text-red-500 uppercase tracking-wider font-semibold mb-1.5">Opposing Features</div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.opposing.map((f, i) => (
                        <span key={i}
                          className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Findings */}
                {item.keyFindings.length > 0 && (
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1.5">Key Findings</div>
                    <ul className="space-y-0.5">
                      {item.keyFindings.map((f, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                          <span className="text-teal-500 mt-0.5">&#9679;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Overall Assessment */}
                {item.overallAssessment && (
                  <div className="bg-[var(--accent-dim)]/30 rounded-lg p-3">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Overall Assessment</div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.overallAssessment}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {clinicalReasoning.length === 0 && topDifferentials.length === 0 && (
        <div className="p-6 text-center text-[var(--text-muted)] text-sm">
          Complete history and examination to generate clinical reasoning.
        </div>
      )}
    </div>
  );
}
