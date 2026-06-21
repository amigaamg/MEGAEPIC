'use client';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { createSession, processAnswer, type AmexanSession } from '@/lib/amexan/reasoning/encounterOrchestrator';
import type { NextQuestion } from '@/lib/amexan/reasoning/questionEngine';
import { FEATURES } from '@/lib/amexan/knowbase/features/featureLibrary';
import { GEOGRAPHIC_REGION_OPTIONS, type GeographicRegion } from '@/lib/amexan/reasoning/geographicPriors';

const CONVERGENCE_LABELS: Record<string, { label: string; color: string }> = {
  exploring: { label: 'Exploring possibilities', color: '#9CA3AF' },
  converging: { label: 'Narrowing down', color: '#7C3AED' },
  confirming: { label: 'Leading diagnosis emerging', color: '#2563EB' },
};

// Map featureIds (from clinical reasoning engine) to socrates field names (used by documentGenerator)
const FEATURE_TO_SOCRATES_FIELD: Record<string, string> = {
  pain_onset: 'onset',
  pain_severity: 'severity',
  pain_character: 'quality',
  pain_radiation: 'radiation',
  pain_initial_location: 'location',
  pain_location_now: 'location',
  pain_migration: 'migration',
  pain_worsening_factors: 'aggravating_factors',
  pain_relieving_factors: 'relieving_factors',
  peritonism: 'peritonism',
  guarding: 'guarding',
  rebound_history: 'rebound',
  rigidity: 'rigidity',
  nausea: 'present',
  vomiting: 'present',
  vomiting_bilious: 'bilious',
  vomiting_projectile: 'projectile',
  vomiting_frequency: 'frequency',
  vomiting_description: 'description',
  vomiting_relation_to_eating: 'relation_to_eating',
  vomiting_relief: 'relief',
  anorexia: 'degree',
  fever: 'present',
  fever_chills: 'rigors',
  obstipation: 'duration',
  abdominal_distension: 'onset',
  last_menstrual_period: 'lmp',
  vaginal_bleeding: 'vaginal_bleeding',
  prior_abdominal_surgery: 'prior_abdominal_surgery',
  alcohol_use: 'alcohol_use',
  nsaid_use: 'nsaid_use',
  smoking: 'smoking',
  weight_loss: 'weight_loss',
  fatigue: 'fatigue',
  night_sweats: 'night_sweats',
  syncope: 'syncope',
  chest_pain: 'chest_pain',
  dyspnea: 'dyspnea',
  diarrhea: 'diarrhea',
  constipation: 'constipation',
  pain_cough_sensitivity: 'cough_sensitivity',
  pain_movement_sensitivity: 'movement_sensitivity',
  peritonism_worsening: 'progression',
  distension_site: 'site',
  distension_onset: 'onset',
  distension_character: 'character',
  distension_gas_passage_relief: 'gas_passage_relief',
  distension_progression: 'progression',
  nausea_timing: 'timing',
  nausea_severity: 'severity',
  nausea_duration: 'duration',
  fever_severity: 'severity',
  fever_pattern: 'pattern',
  fever_timing: 'timing',
  fever_duration: 'duration',
  recent_travel: 'recent_travel',
  known_gallstones: 'known_gallstones',
  diabetes: 'diabetes',
  previous_similar_episodes: 'previous_similar_episodes',
  pregnancy_status: 'pregnancy_status',
  heartburn: 'heartburn',
  belching: 'belching',
  early_satiety: 'early_satiety',
  leg_swelling: 'leg_swelling',
  melena: 'melena',
  hematochezia: 'hematochezia',
  hematemesis: 'hematemesis',
  dysuria: 'dysuria',
  hematuria: 'hematuria',
  flank_pain: 'flank_pain',
  vaginal_discharge: 'vaginal_discharge',
  dyspareunia: 'dyspareunia',
  jaundice: 'jaundice',
};

const FIELD_VALUE_LABELS: Record<string, (val: string | boolean | string[] | number) => string> = {
  pain_onset: v => String(v),
  pain_initial_location: v => String(v),
  pain_location_now: v => String(v),
  pain_migration: v => String(v),
  pain_character: v => String(v),
  pain_severity: v => `${v}/10`,
  pain_radiation: v => String(v),
  pain_worsening_factors: v => Array.isArray(v) ? v.join(', ') : String(v),
  pain_relieving_factors: v => Array.isArray(v) ? v.join(', ') : String(v),
  peritonism: v => v === true || v === 'true' || v === 'Yes' ? 'Yes — worse with movement' : 'No',
  guarding: v => String(v),
  rebound_history: v => String(v),
  rigidity: v => v === true || v === 'true' || v === 'Yes' ? 'Yes — board-like' : 'No',
  nausea: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  vomiting: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  anorexia: v => v === true || v === 'true' || v === 'Yes' ? 'Yes — appetite lost' : 'No',
  fever: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  obstipation: v => v === true || v === 'true' || v === 'Yes' ? 'Yes — no stool or gas' : 'No',
  abdominal_distension: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  last_menstrual_period: v => String(v),
  vaginal_bleeding: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  prior_abdominal_surgery: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  alcohol_use: v => String(v),
  nsaid_use: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  smoking: v => String(v),
  weight_loss: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  fatigue: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  night_sweats: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  syncope: v => v === true || v === 'true' || v === 'Yes' ? 'Yes — fainted' : 'No',
  chest_pain: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  dyspnea: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  diarrhea: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
  constipation: v => v === true || v === 'true' || v === 'Yes' ? 'Yes' : 'No',
};

function formatValue(featureId: string, value: string | boolean | string[] | number): string {
  if (value === undefined || value === null || value === '') return '';
  const formatter = FIELD_VALUE_LABELS[featureId];
  if (formatter) return formatter(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  const s = String(value);
  if (s.toLowerCase() === 'true') return 'Yes';
  if (s.toLowerCase() === 'false') return 'No';
  return s;
}

export default function AmexanHpiSection() {
  const chiefComplaints = useHistoryStore(s => s.chiefComplaints);
  const biodata = useHistoryStore(s => s.biodata);
  const setSocratesAnswer = useHistoryStore(s => s.setSocratesAnswer);
  const completeSection = useHistoryStore(s => s.completeSection);

  const [session, setSession] = useState<AmexanSession | null>(null);
  const [phaseDone, setPhaseDone] = useState(false);
  const [showNarrative, setShowNarrative] = useState(false);
  const [multiSelection, setMultiSelection] = useState<Set<string>>(new Set());
  const [geographicRegion, setGeographicRegion] = useState<string>('');
  const sessionRef = useRef<AmexanSession | null>(null);

  // ── Answer review panel states ──
  const [showAnswered, setShowAnswered] = useState(true);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState('');
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const answeredPanelRef = useRef<HTMLDivElement>(null);

  const cc = chiefComplaints[0];

  useEffect(() => {
    if (!cc || !biodata) return;
    const sess = createSession(
      cc.symptomId,
      cc.label,
      biodata.age || 30,
      biodata.sex || 'female',
      cc.duration,
      [],
      geographicRegion,
    );
    for (const a of sess.state.answers) {
      if (a.source === 'chief_complaint') {
        const f = FEATURES[a.featureId];
        const socratesField = FEATURE_TO_SOCRATES_FIELD[a.featureId] || a.featureId;
        setSocratesAnswer(cc.symptomId, a.featureId, a.questionLabel || a.featureId, String(a.value), 0, socratesField);
      }
    }
    setSession(sess);
    sessionRef.current = sess;
  }, [cc?.symptomId, biodata?.age, biodata?.sex, geographicRegion]);

  const currentQuestion = session?.nextQuestion ?? null;
  const isComplete = !!session?.isComplete;
  const convergence = session?.state.ddx.convergenceState || 'exploring';

  const topCandidates = useMemo(() => {
    if (!session) return [];
    return session.state.ddx.activeCandidates.slice(0, 5);
  }, [session]);

  // All answered questions from the session, oldest first
  const answeredQuestions = useMemo(() => {
    if (!session) return [];
    return session.state.answers.filter(a => a.source !== 'chief_complaint');
  }, [session]);

  const handleAnswer = useCallback((question: NextQuestion, value: string | boolean | string[]) => {
    if (!sessionRef.current) return;
    const updated = processAnswer(sessionRef.current, question.featureId, value, question.label);
    sessionRef.current = updated;
    setSession({ ...updated });
    setMultiSelection(new Set());
    setEditingAnswer(null);
    if (cc) {
      const socratesField = FEATURE_TO_SOCRATES_FIELD[question.featureId] || question.featureId;
      setSocratesAnswer(cc.symptomId, question.featureId, question.label, value, 0, socratesField);
    }
  }, [cc, setSocratesAnswer]);

  const handleMultiToggle = useCallback((option: string) => {
    setMultiSelection(prev => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option); else next.add(option);
      return next;
    });
  }, []);

  const handleMultiConfirm = useCallback(() => {
    if (!currentQuestion || multiSelection.size === 0) return;
    handleAnswer(currentQuestion, Array.from(multiSelection));
  }, [currentQuestion, multiSelection, handleAnswer]);

  // ── Re-answer / edit support ──
  const startEditing = useCallback((featureId: string, currentValue: string | boolean | string[] | number) => {
    setEditingAnswer(featureId);
    const strVal = typeof currentValue === 'string' ? currentValue :
      typeof currentValue === 'boolean' ? '' :
      Array.isArray(currentValue) ? currentValue.join(', ') : String(currentValue);
    setEditTextValue(strVal);
    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
      if (numberInputRef.current) numberInputRef.current.focus();
    }, 50);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingAnswer(null);
    setEditTextValue('');
  }, []);

  const saveEdit = useCallback((featureId: string) => {
    if (!sessionRef.current || !editTextValue.trim()) return;
    const answer = answeredQuestions.find(a => a.featureId === featureId);
    if (!answer) return;
    handleAnswer(
      {
        featureId,
        label: answer.questionLabel || featureId,
        shortLabel: featureId,
        type: 'text',
        rationale: '',
        sourceDiseaseId: '',
        informationGain: 0,
        priority: 0,
      },
      editTextValue.trim(),
    );
  }, [answeredQuestions, editTextValue, handleAnswer]);

  const handleReAnswer = useCallback((featureId: string, value: string | boolean) => {
    if (!sessionRef.current) return;
    const answer = answeredQuestions.find(a => a.featureId === featureId);
    if (!answer) return;
    handleAnswer(
      {
        featureId,
        label: answer.questionLabel || featureId,
        shortLabel: featureId,
        type: 'text',
        rationale: '',
        sourceDiseaseId: '',
        informationGain: 0,
        priority: 0,
      },
      value,
    );
  }, [answeredQuestions, handleAnswer]);

  const handleFinish = useCallback(() => {
    setShowNarrative(true);
  }, []);

  const handleNarrativeDone = useCallback(() => {
    setPhaseDone(true);
    completeSection('hpi');
  }, [completeSection]);

  // ── Render states ───────────────────────────────────────────

  if (phaseDone) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">✓</div>
        <div className="text-lg font-semibold text-gray-800 mb-2">HPI Complete</div>
        <div className="text-xs text-gray-400">HPI section completed. You can revisit it from the navigation.</div>
      </div>
    );
  }

  if (showNarrative && session?.narrative) {
    const n = session.narrative;
    return (
      <div className="min-h-[400px] space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">HPI Narrative</div>
          <button
            onClick={() => setShowNarrative(false)}
            className="text-[11px] text-blue-600 hover:underline"
          >Back to questions</button>
        </div>
        <div className="p-5 rounded-lg bg-blue-50 border border-blue-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{n.fullNarrative}</div>
        <div className="mt-4 flex gap-3">
          <button onClick={handleNarrativeDone} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Accept & Complete HPI →</button>
          <button onClick={() => setShowNarrative(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Back</button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <div className="text-sm text-gray-400">Initialising...</div>;
  }

  const totalAnswered = session.state.answers.length;
  const convMeta = CONVERGENCE_LABELS[convergence] || CONVERGENCE_LABELS.exploring;

  return (
    <div className="min-h-[500px] max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {biodata?.name || 'Patient'} · {biodata?.age || ''}y · {biodata?.sex || ''}
          </div>
          <div className="text-xs text-gray-500 truncate">{cc?.label}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={geographicRegion}
            onChange={e => setGeographicRegion(e.target.value)}
            className="text-[10px] px-1.5 py-0.5 border border-gray-200 rounded bg-white text-gray-500 focus:outline-none focus:border-blue-400 max-w-[120px]"
            title="Geographic region for prior weighting"
          >
            {GEOGRAPHIC_REGION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{totalAnswered} answered</span>
        </div>
      </div>

      {/* ── Convergence indicator ── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: convMeta.color }} />
        <span className="text-[10px] font-medium" style={{ color: convMeta.color }}>{convMeta.label}</span>
      </div>

      {/* ── TWO-COLUMN LAYOUT: Question (left) + Answered (right) ── */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* ── LEFT: Active Question ── */}
        <div className="flex-1 min-w-0">
          {currentQuestion && !isComplete ? (
            <div className="flex flex-col">
              <div className="w-full">
                {/* Phase badge */}
                <div className="mb-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                    {session.state.phase === 'triage' ? 'Step 1: Triage' :
                     session.state.phase === 'characterization' ? 'Step 2: Characterisation' :
                     session.state.phase === 'confirmation' ? 'Step 3: Probing' :
                     session.state.phase === 'risk_factor' ? 'Step 4: Risk Factors' :
                     session.state.phase === 'examination' ? 'Step 5: Examination' : 'Question'}
                  </span>
                </div>

                {/* Question card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm">
                  <div className="text-sm sm:text-base font-medium text-gray-900 mb-3 leading-relaxed">
                    {currentQuestion.label}
                  </div>
                  {currentQuestion.clinicalGuide && (
                    <div className="text-[11px] text-gray-500 mb-3 italic">{currentQuestion.clinicalGuide}</div>
                  )}

                  {/* ── Answer controls ── */}
                  <div className="mt-1">
                    {currentQuestion.type === 'boolean' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAnswer(currentQuestion, true)}
                          className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white border-2 border-green-200 hover:border-green-400 hover:bg-green-50 text-gray-700 font-medium transition-all active:scale-[0.98]">Yes</button>
                        <button onClick={() => handleAnswer(currentQuestion, false)}
                          className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-gray-700 font-medium transition-all active:scale-[0.98]">No</button>
                      </div>
                    )}

                    {currentQuestion.type === 'select' && currentQuestion.options && (
                      <div className="flex flex-wrap gap-1.5">
                        {currentQuestion.options.map(opt => (
                          <button key={opt} onClick={() => handleAnswer(currentQuestion, opt)}
                            className="px-3 py-2 text-xs rounded-xl border border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-gray-600 font-medium transition-all active:scale-[0.98]">{opt}</button>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === 'multi_select' && currentQuestion.options && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {currentQuestion.options.map(opt => {
                            const isSel = multiSelection.has(opt);
                            return (
                              <button key={opt} onClick={() => handleMultiToggle(opt)}
                                className={`px-3 py-2 text-xs rounded-xl border transition-all active:scale-[0.98] ${
                                  isSel
                                    ? 'border-blue-400 bg-blue-50 text-blue-600 font-medium shadow-sm'
                                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                }`}>{opt}</button>
                            );
                          })}
                        </div>
                        {multiSelection.size > 0 && (
                          <button onClick={handleMultiConfirm}
                            className="text-xs text-blue-600 hover:underline font-medium">Confirm ({multiSelection.size} selected)</button>
                        )}
                      </div>
                    )}

                    {currentQuestion.type === 'number' && (
                      <div className="flex gap-2 items-center">
                        <input
                          ref={numberInputRef}
                          type="number" min={0} max={10}
                          onBlur={e => { if (e.target.value) handleAnswer(currentQuestion, e.target.value); }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              handleAnswer(currentQuestion, e.currentTarget.value);
                            }
                            if (e.key === 'Escape') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                          placeholder="Value..." />
                        <span className="text-[10px] text-gray-400">press Enter to save</span>
                      </div>
                    )}

                    {currentQuestion.type === 'text' && (
                      <div className="space-y-2">
                        <textarea
                          ref={textInputRef}
                          value={editTextValue}
                          onChange={e => setEditTextValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (editTextValue.trim()) handleAnswer(currentQuestion, editTextValue.trim());
                            }
                            if (e.key === 'Escape') {
                              setEditTextValue('');
                              e.currentTarget.blur();
                            }
                          }}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-y min-h-[60px]"
                          placeholder="Type your answer here..."
                          autoFocus
                        />
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => { if (editTextValue.trim()) handleAnswer(currentQuestion, editTextValue.trim()); }}
                            disabled={!editTextValue.trim()}
                            className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >Save</button>
                          <span className="text-[10px] text-gray-400">Enter to save · Shift+Enter for newline · Esc to clear</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rationale */}
                {currentQuestion.rationale && (
                  <details className="mt-2">
                    <summary className="text-[9px] text-gray-400 cursor-pointer hover:text-gray-600 select-none">Why this question?</summary>
                    <p className="mt-1 text-[10px] text-gray-500 italic pl-3 border-l-2 border-gray-100">{currentQuestion.rationale}</p>
                  </details>
                )}
              </div>

              {/* DDX sidebar */}
              {topCandidates.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Current Differential</div>
                  <div className="space-y-1">
                    {topCandidates.slice(0, 4).map(d => (
                      <div key={d.diseaseId} className="flex items-center gap-2">
                        <div className="flex-1 text-[11px] text-gray-600 truncate">
                          {d.diseaseName.replace(/_/g, ' ')}
                        </div>
                        <div className="w-16 sm:w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                          <div className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(d.currentProb * 100)}%`, background: d.currentProb > 0.3 ? '#3B82F6' : d.currentProb > 0.1 ? '#7C3AED' : '#9CA3AF' }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-7 text-right shrink-0">{Math.round(d.currentProb * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (!currentQuestion || isComplete) && !showNarrative ? (
            <div className="p-6 rounded-2xl border-2 border-dashed border-green-200 bg-green-50 text-center">
              <div className="text-base font-semibold text-green-700 mb-2">History complete</div>
              <div className="text-xs text-green-600 mb-4">All key questions have been answered.</div>
              <button onClick={handleFinish} className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-sm">
                Generate Narrative →
              </button>
            </div>
          ) : null}
        </div>

        {/* ── RIGHT: Answered Questions Panel ── */}
        {answeredQuestions.length > 0 && (
          <div className="w-full lg:w-80 shrink-0" ref={answeredPanelRef}>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAnswered(!showAnswered)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <span>Answered ({answeredQuestions.length})</span>
                <svg className={`w-3 h-3 transition-transform ${showAnswered ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAnswered && (
                <div className="max-h-[400px] lg:max-h-[600px] overflow-y-auto border-t border-gray-100 divide-y divide-gray-50">
                  {answeredQuestions.map(a => {
                    const feature = FEATURES[a.featureId];
                    const label = a.questionLabel || feature?.label || a.featureId;
                    const value = formatValue(a.featureId, a.value);
                    const isEditing = editingAnswer === a.featureId;
                    const featType = feature?.type || 'text';

                    return (
                      <div key={a.featureId + a.timestamp} className="px-3 py-2 group hover:bg-gray-50 transition-colors">
                        <div className="text-[10px] text-gray-500 truncate mb-0.5">{label}</div>
                        {isEditing ? (
                          <div className="space-y-1">
                            {featType === 'boolean' ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleReAnswer(a.featureId, true)}
                                  className="px-2 py-1 text-[10px] rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium hover:bg-green-100"
                                >Yes</button>
                                <button
                                  onClick={() => handleReAnswer(a.featureId, false)}
                                  className="px-2 py-1 text-[10px] rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium hover:bg-red-100"
                                >No</button>
                                <button onClick={cancelEditing} className="px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={editTextValue}
                                  onChange={e => setEditTextValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveEdit(a.featureId);
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                  className="flex-1 min-w-0 px-2 py-1 text-[10px] border border-blue-200 rounded focus:outline-none focus:border-blue-400"
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveEdit(a.featureId)}
                                  className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700"
                                >Save</button>
                                <button onClick={cancelEditing} className="px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600">x</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() => startEditing(a.featureId, a.value)}
                            className="flex items-center justify-between cursor-pointer group/edit"
                          >
                            <span className="text-xs font-medium text-gray-700 truncate">{value || '—'}</span>
                            <span className="text-[9px] text-blue-400 opacity-0 group-hover/edit:opacity-100 transition-opacity ml-1 shrink-0">edit</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Generate Narrative button (also shown at bottom when complete) ── */}
      {(!currentQuestion || isComplete) && !showNarrative && answeredQuestions.length > 0 && (
        <div className="mt-4 text-center">
          <button onClick={handleFinish} className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-sm">
            Generate Narrative →
          </button>
        </div>
      )}
    </div>
  );
}
