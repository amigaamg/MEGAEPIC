'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { DISEASE_SYSTEM_MAP, ADAPTIVE_FINDINGS, SYSTEM_METHODS } from '@/lib/history-engine/examination/systemicExamAdaptiveEngine';

const SYSTEM_DISPLAY_NAMES: Record<string, string> = {
  respiratory: 'Respiratory System',
  cardiovascular: 'Cardiovascular System',
  gastrointestinal: 'Gastrointestinal System',
  neurological: 'Neurological System',
  musculoskeletal: 'Musculoskeletal System',
  genitourinary: 'Genitourinary System',
  endocrine: 'Endocrine System',
  skin_msk: 'Skin, Hair & Nails',
};

const FINDING_OPTIONS: { value: 'normal' | 'abnormal' | 'not_examined'; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'not_examined', label: 'Not Examined' },
];

export default function SystemicExaminationSection() {
  const ddx = useHistoryStore(s => s.ddx);
  const systemExaminations = useHistoryStore(s => s.systemExaminations);
  const setSystemExamFinding = useHistoryStore(s => s.setSystemExamFinding);
  const setSystemExamSummary = useHistoryStore(s => s.setSystemExamSummary);
  const completeSection = useHistoryStore(s => s.completeSection);
  const completedSections = useHistoryStore(s => s.completedSections);

  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
  const [examCompleted, setExamCompleted] = useState(completedSections.includes('systemic_examination'));

  const topDiseases = ddx.probabilities.slice(0, 5);
  const topDiseaseIds = topDiseases.map(d => d.diseaseId);

  const systemIds = [...new Set(
    topDiseaseIds.flatMap(did =>
      (DISEASE_SYSTEM_MAP[did] || []).map(s => s.systemId)
    )
  )];

  const relevantFindings = ADAPTIVE_FINDINGS.filter(f => topDiseaseIds.includes(f.relevanceTo));

  const seenKeys = new Set<string>();
  const deduplicatedFindings = relevantFindings.filter(f => {
    const key = `${f.systemId}_${f.featureId}_${f.label}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  const getExamState = (systemId: string) =>
    systemExaminations.find(e => e.systemId === systemId);

  const getFindingState = (systemId: string, findingKey: string) => {
    const exam = getExamState(systemId);
    if (!exam) return null;
    return exam.findings.find(f => f.id === findingKey);
  };

  const handleFindingChange = (
    systemId: string, findingKey: string, label: string,
    finding: 'normal' | 'abnormal' | 'not_examined'
  ) => {
    const current = getFindingState(systemId, findingKey);
    setSystemExamFinding(systemId, findingKey, label, finding, current?.description || '');
  };

  const handleDescriptionChange = (
    systemId: string, findingKey: string, label: string, description: string
  ) => {
    const current = getFindingState(systemId, findingKey);
    setSystemExamFinding(
      systemId, findingKey, label,
      current?.finding || 'not_examined', description
    );
  };

  const handleComplete = () => {
    setExamCompleted(true);
    completeSection('systemic_examination');
  };

  if (systemIds.length === 0) {
    return (
      <div className="text-gray-500 text-xs p-4">
        Systemic examination systems will appear once differential diagnoses are established.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Systemic Examination
        </h2>
        <span className="text-[10px] text-gray-500">(Adaptive by differentials)</span>
      </div>

      {systemIds.map(systemId => {
        const systemName = SYSTEM_DISPLAY_NAMES[systemId] || systemId;
        const methods = SYSTEM_METHODS[systemId]?.methods || [];
        const isExpanded = expandedSystem === systemId;
        const examState = getExamState(systemId);
        const findingsForSystem = deduplicatedFindings.filter(f => f.systemId === systemId);
        const answeredCount = (examState?.findings || []).filter(f => f.finding !== 'not_examined').length;
        const totalCount = findingsForSystem.length;

        return (
          <div
            key={systemId}
            className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--bg-primary)]"
          >
            <button
              onClick={() => setExpandedSystem(isExpanded ? null : systemId)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors bg-[var(--bg-primary)] hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--text-primary)]">{systemName}</span>
                {methods.length > 0 && (
                  <span className="text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                    {methods.join(', ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{answeredCount}/{totalCount}</span>
                <span className="text-gray-600">{isExpanded ? '▾' : '▸'}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-3 border-t border-[var(--border)]">
                {findingsForSystem.length === 0 && (
                  <div className="text-[11px] text-gray-500 italic">
                    No specific findings suggested for this system based on current differentials.
                  </div>
                )}

                {findingsForSystem.map(finding => {
                  const findingKey = `${finding.featureId}_${finding.label}`;
                  const findingState = getFindingState(systemId, findingKey);
                  const currentFinding = findingState?.finding || 'not_examined';
                  const description = findingState?.description || '';

                  return (
                    <div
                      key={findingKey}
                      className="space-y-1.5 pb-2 border-b border-[var(--border)] last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-primary)]">{finding.label}</span>
                        <div className="flex gap-1">
                          {FINDING_OPTIONS.map(opt => {
                            const isActive = currentFinding === opt.value;
                            const activeStyles = isActive
                              ? opt.value === 'normal'
                                ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                                : opt.value === 'abnormal'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : 'bg-gray-700/50 text-gray-400 border-gray-600/30'
                              : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500';

                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handleFindingChange(systemId, findingKey, finding.label, opt.value)
                                }
                                className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-colors ${activeStyles}`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <textarea
                        value={description}
                        onChange={e =>
                          handleDescriptionChange(systemId, findingKey, finding.label, e.target.value)
                        }
                        placeholder="Describe finding..."
                        rows={2}
                        className="w-full px-2 py-1 text-[11px] rounded bg-gray-800/50 border border-[var(--border)] text-[var(--text-primary)] placeholder-gray-500 resize-none focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  );
                })}

                <div className="pt-2">
                  <label className="block text-[11px] text-gray-500 mb-1">System Summary</label>
                  <textarea
                    value={examState?.summary || ''}
                    onChange={e => setSystemExamSummary(systemId, e.target.value)}
                    placeholder={`Summarize ${systemName} examination...`}
                    rows={3}
                    className="w-full px-2 py-1 text-[11px] rounded bg-gray-800/50 border border-[var(--border)] text-[var(--text-primary)] placeholder-gray-500 resize-none focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={handleComplete}
        className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Complete Systemic Examination
      </button>
    </div>
  );
}
