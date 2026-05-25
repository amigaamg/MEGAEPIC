'use client';
import { useState, useMemo } from 'react';
import { usePatientStore } from '@/src/state/patientStore';
import { runInference } from '@/src/engine/inference/scorer';
import { computeDDxEntropy } from '@/src/engine/inference/adaptiveQuestioner';
import { ScoredDisease } from '@/src/engine/inference/types';
import respiratoryDiseases from '@/src/engine/knowledge-graph/diseases/respiratory.json';
import allDiseases from '@/src/engine/knowledge-graph/diseases/respiratory.json';

const DISEASE_COLORS: Record<string, string> = {
  pneumonia: '#ef4444',
  asthma: '#3b82f6',
  bronchiolitis: '#10b981',
  croup: '#f59e0b',
  epiglottitis: '#dc2626',
  foreign_body_aspiration: '#ec4899',
  tuberculosis: '#8b5cf6',
  pleural_effusion: '#14b8a6',
  empyema: '#f97316',
  pneumothorax: '#a855f7',
};

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  critical: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '🚨' },
  severe: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', icon: '⚠️' },
  moderate: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '⚡' },
  mild: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '✓' },
};

function getSeverity(form: any) {
  const c = form.complaints || [];
  const v = form.vitals || {};
  const hpi = form.hpi || {};
  const spo2 = parseFloat(v.spo2);
  const temp = parseFloat(v.temp);
  if (c.includes('cyanosis') || (!isNaN(spo2) && spo2 < 85) || (hpi.drooling && hpi.tripodPosition))
    return { level: 'critical', msg: 'Immediate intervention — stabilise airway and breathing urgently.', redFlags: ['Cyanosis/hypoxia', 'Airway compromise'] };
  if ((!isNaN(spo2) && spo2 < 92) || hpi.grunting || hpi.chestIndrawing || (!isNaN(temp) && temp >= 39.5))
    return { level: 'severe', msg: 'Urgent assessment — escalate to higher level of care.', redFlags: ['Hypoxia (SpO₂<92%)', 'Severe respiratory distress', 'High fever'] };
  if ((!isNaN(spo2) && spo2 <= 94) || c.includes('difficulty_breathing') || (!isNaN(temp) && temp >= 38.5))
    return { level: 'moderate', msg: 'Close monitoring — initiate targeted treatment.', redFlags: ['Borderline SpO₂', 'Respiratory difficulty'] };
  if (c.length > 0)
    return { level: 'mild', msg: 'Clinically manageable — may be outpatient if stable.', redFlags: [] };
  return null;
}

function getSeverityPoints(d: ScoredDisease, form: any): number {
  let pts = 0;
  const disease = d.disease;
  for (const feat of disease.examFeatures || []) {
    if (feat.signId === 'hypoxia') pts += 5;
    if (feat.signId === 'chest_indrawing') pts += 4;
    if (feat.signId === 'cyanosis_sign') pts += 5;
  }
  const v = form.vitals || {};
  if (v.examGrunting) pts += 4;
  if (v.examIndrawing) pts += 4;
  if (parseFloat(v.spo2) < 90) pts += 5;
  if (parseFloat(v.spo2) < 92) pts += 3;
  if (parseFloat(v.temp) >= 39.5) pts += 2;
  return pts;
}

function getComplications(diseaseId: string, allScored: ScoredDisease[]): ScoredDisease[] {
  return allScored.filter(d => d.relation === 'complication' && d.disease.id !== diseaseId);
}

export function DifferentialDashboard() {
  const form = usePatientStore(s => s.form);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [viewTab, setViewTab] = useState<'scores' | 'details' | 'evidence' | 'complications'>('scores');

  const currentDDx = useMemo(() => runInference(form), [form]);
  const ddxEntropy = useMemo(() => computeDDxEntropy(currentDDx), [currentDDx]);
  const severity = useMemo(() => getSeverity(form), [form]);
  const hasData = currentDDx.length > 0 && currentDDx[0].rawScore > 0;

  const selectedDisease = selectedIdx !== null ? currentDDx[selectedIdx] : currentDDx[0];
  const selectedScore = selectedDisease ? getSeverityPoints(selectedDisease, form) : 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-sm font-semibold text-gray-700">Differential Dashboard</span>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(['scores', 'details', 'evidence', 'complications'] as const).map(tab => (
            <button key={tab} onClick={() => setViewTab(tab)}
              className={`text-[9px] px-2 py-1 rounded-md font-medium transition-colors capitalize ${
                viewTab === tab ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <p className="text-gray-300 text-4xl mb-3">📊</p>
            <p className="text-sm text-gray-400 text-center">Select symptoms and complete the clinical interview to see real-time differentials.</p>
            <p className="text-xs text-gray-300 mt-1">The dashboard updates with each answer.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Severity Banner */}
            {severity && (
              <div className="rounded-xl border-2 p-3" style={{
                background: SEVERITY_STYLES[severity.level]?.bg || '#f8fafc',
                borderColor: SEVERITY_STYLES[severity.level]?.border || '#e2e8f0',
              }}>
                <div className="flex items-center gap-2">
                  <span>{SEVERITY_STYLES[severity.level]?.icon || '📋'}</span>
                  <span className="text-xs font-bold" style={{ color: SEVERITY_STYLES[severity.level]?.text || '#64748b' }}>
                    {severity.level.toUpperCase()} — {severity.msg}
                  </span>
                </div>
                {severity.redFlags.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {severity.redFlags.map((f, i) => (
                      <p key={i} className="text-[10px] flex items-start gap-1" style={{ color: SEVERITY_STYLES[severity.level]?.text }}>
                        <span>•</span> {f}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Entropy / Confidence */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Diagnostic Certainty</span>
                <span className="text-[10px] text-gray-400">Entropy: {ddxEntropy.toFixed(2)} bits</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(5, Math.min(100, (1 - ddxEntropy / 4) * 100))}%`,
                    background: ddxEntropy < 1 ? '#10b981' : ddxEntropy < 2 ? '#f59e0b' : '#ef4444',
                  }} />
              </div>
              <p className="text-[9px] text-gray-400 mt-1">
                {ddxEntropy < 1 ? 'High certainty' : ddxEntropy < 2 ? 'Moderate certainty — more information may help' : 'Low certainty — additional discriminators needed'}
              </p>
            </div>

            {/* SCORES TAB */}
            {viewTab === 'scores' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Ranked Differentials
                </h4>
                <div className="space-y-2">
                  {currentDDx.filter(d => d.rawScore > 0).slice(0, 10).map((dx, i) => {
                    const maxScore = currentDDx[0]?.rawScore || 1;
                    const widthPct = Math.max((dx.rawScore / maxScore) * 100, 3);
                    const color = DISEASE_COLORS[dx.disease.id] || '#6b7280';
                    const isSelected = selectedIdx === i;
                    return (
                      <div key={dx.disease.id}
                        onClick={() => setSelectedIdx(i)}
                        className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                          isSelected ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-transparent hover:bg-gray-50'
                        }`}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 w-3 shrink-0">{i + 1}</span>
                            <span className="text-xs font-semibold text-gray-800 truncate">{dx.disease.name}</span>
                            {dx.relation === 'primary' && (
                              <span className="text-[8px] px-1 py-0.5 rounded bg-blue-100 text-blue-600 font-semibold">PRIMARY</span>
                            )}
                            {dx.relation === 'complication' && (
                              <span className="text-[8px] px-1 py-0.5 rounded bg-red-100 text-red-600 font-semibold">COMPLICATION</span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold shrink-0" style={{ color }}>
                            {Math.round(dx.probability * 100)}%
                          </span>
                        </div>
                        <div className="ml-5 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all duration-700" style={{
                            width: `${widthPct}%`,
                            background: color,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DETAILS TAB */}
            {viewTab === 'details' && selectedDisease && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800">{selectedDisease.disease.name}</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: DISEASE_COLORS[selectedDisease.disease.id] + '20' || '#f1f5f9',
                      color: DISEASE_COLORS[selectedDisease.disease.id] || '#64748b',
                    }}>
                    {Math.round(selectedDisease.probability * 100)}% probability
                  </span>
                </div>

                {/* Severity Points */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Raw Score', value: selectedDisease.rawScore.toFixed(1) },
                    { label: 'Severity Points', value: String(selectedScore), color: selectedScore > 12 ? '#dc2626' : selectedScore > 6 ? '#d97706' : '#16a34a' },
                    { label: 'Relation', value: selectedDisease.relation.replace(/_/g, ' ') },
                    { label: 'Must Not Miss', value: selectedDisease.disease.mustNotMiss ? '⚠️ Yes' : 'No' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xs font-bold" style={{ color: (stat as any).color || '#1f2937' }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Syndrome Tags */}
                {selectedDisease.disease.syndromeTags && selectedDisease.disease.syndromeTags.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Syndrome Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDisease.disease.syndromeTags.map(tag => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnostic Clues */}
                {selectedDisease.disease.diagnosticClues && selectedDisease.disease.diagnosticClues.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider mb-1">Diagnostic Clues</p>
                    <ul className="space-y-0.5">
                      {selectedDisease.disease.diagnosticClues.map((clue, i) => (
                        <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                          <span className="text-green-500">+</span> {clue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exclusion Clues */}
                {selectedDisease.disease.exclusionClues && selectedDisease.disease.exclusionClues.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-1">Exclusion Clues</p>
                    <ul className="space-y-0.5">
                      {selectedDisease.disease.exclusionClues.map((clue, i) => (
                        <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                          <span className="text-red-400">−</span> {clue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Factors */}
                {selectedDisease.disease.riskFactors && selectedDisease.disease.riskFactors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">Risk Factors</p>
                    <div className="space-y-0.5">
                      {selectedDisease.disease.riskFactors.map(rf => (
                        <p key={rf.id} className="text-[11px] text-gray-600">
                          • {rf.id.replace(/_/g, ' ')} (multiplier: ×{rf.multiplier})
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mimics */}
                {selectedDisease.disease.mimics && selectedDisease.disease.mimics.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mimics / Should Be Differentiated From</p>
                    <div className="space-y-1">
                      {selectedDisease.disease.mimics.map(m => (
                        <div key={m.diseaseId} className="text-[11px] text-gray-600 bg-gray-50 rounded p-1.5">
                          <span className="font-medium">{m.diseaseId.replace(/_/g, ' ')}</span>
                          {m.discriminators && m.discriminators.length > 0 && (
                            <span className="text-gray-400"> — {m.discriminators.join(', ')}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Investigations */}
                {selectedDisease.disease.investigations && selectedDisease.disease.investigations.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Recommended Investigations</p>
                    <div className="space-y-1">
                      {selectedDisease.disease.investigations.map((inv, i) => (
                        <div key={i} className="text-[11px] flex items-center gap-2">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase">{inv.type}</span>
                          <span className="text-gray-700">{inv.name}</span>
                          <span className="text-gray-400 ml-auto text-[10px]">{inv.indication}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EVIDENCE TAB */}
            {viewTab === 'evidence' && (
              <div className="space-y-3">
                {currentDDx.filter(d => d.rawScore > 0).slice(0, 5).map(dx => (
                  <div key={dx.disease.id} className="bg-white border border-gray-200 rounded-xl p-3">
                    <h5 className="text-xs font-bold text-gray-700 mb-2">
                      {dx.disease.name}
                      <span className="ml-2 text-[10px] font-normal text-gray-400">
                        {Math.round(dx.probability * 100)}% — {dx.relation}
                      </span>
                    </h5>

                    {dx.evidence.historyHits.length > 0 && (
                      <div className="mb-1.5">
                        <p className="text-[9px] font-bold text-green-600 uppercase mb-0.5">History Supports</p>
                        <div className="flex flex-wrap gap-1">
                          {dx.evidence.historyHits.map(h => (
                            <span key={h} className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">
                              {h.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {dx.evidence.examHits.length > 0 && (
                      <div className="mb-1.5">
                        <p className="text-[9px] font-bold text-blue-600 uppercase mb-0.5">Exam Supports</p>
                        <div className="flex flex-wrap gap-1">
                          {dx.evidence.examHits.map(h => (
                            <span key={h} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                              {h.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {dx.evidence.riskBoosts.length > 0 && (
                      <div className="mb-1.5">
                        <p className="text-[9px] font-bold text-amber-600 uppercase mb-0.5">Risk Factors</p>
                        <div className="flex flex-wrap gap-1">
                          {dx.evidence.riskBoosts.map(h => (
                            <span key={h} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                              {h.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(dx.evidence.historyHits.length + dx.evidence.examHits.length + dx.evidence.riskBoosts.length) === 0 && (
                      <p className="text-[10px] text-gray-400 italic">No positive evidence yet</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* COMPLICATIONS TAB */}
            {viewTab === 'complications' && (
              <div className="space-y-3">
                {currentDDx.filter(d => d.rawScore > 0).slice(0, 3).map(dx => {
                  const comps = getComplications(dx.disease.id, currentDDx);
                  const disease = dx.disease;
                  return (
                    <div key={dx.disease.id} className="bg-white border border-gray-200 rounded-xl p-3">
                      <h5 className="text-xs font-bold text-gray-700 mb-2">
                        {dx.disease.name}
                        <span className="ml-2 text-[10px] font-normal text-gray-400">
                          {Math.round(dx.probability * 100)}%
                        </span>
                      </h5>

                      {disease.complications && disease.complications.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[9px] font-bold text-red-500 uppercase mb-1">Possible Complications</p>
                          <div className="space-y-1">
                            {disease.complications.map(comp => {
                              const compDx = currentDDx.find(d => d.disease.id === comp.diseaseId);
                              return (
                                <div key={comp.diseaseId}
                                  className="flex items-center justify-between text-[11px] bg-red-50 rounded p-1.5 border border-red-100">
                                  <div>
                                    <span className="text-gray-700 font-medium">{comp.diseaseId.replace(/_/g, ' ')}</span>
                                    <span className="text-gray-400 ml-1">({(comp.probability * 100).toFixed(0)}% probability)</span>
                                  </div>
                                  <span className="text-[10px] text-red-500 font-semibold">
                                    +{Math.round(comp.severityBoost * 100)}% severity
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(!disease.complications || disease.complications.length === 0) && (
                        <div className="text-[11px] text-gray-400 py-2 bg-green-50 rounded p-1.5 border border-green-100">
                          <span className="text-green-600 font-medium">No known complications</span> — simple disease course expected.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Management Quick View (always visible at bottom) */}
            {viewTab !== 'details' && selectedDisease && selectedDisease.disease.managementProtocols && selectedDisease.disease.managementProtocols.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-3">
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-2">Quick Management — {selectedDisease.disease.name}</p>
                <div className="space-y-1">
                  {selectedDisease.disease.managementProtocols.map((proto, i) => (
                    <div key={i}>
                      {proto.condition && (
                        <p className="text-[9px] font-semibold text-gray-500 uppercase">{proto.condition}</p>
                      )}
                      {proto.steps.map((step, j) => (
                        <p key={j} className="text-[11px] text-gray-700 flex items-start gap-1">
                          <span className="text-blue-400">•</span> {step}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
