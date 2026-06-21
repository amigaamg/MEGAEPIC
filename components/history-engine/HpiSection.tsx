'use client';
import { useState, useCallback, useMemo } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import type { SocratesQuestion } from '@/lib/history-engine/socratesQuestions';
import { getQuestionsByRound, CLINICAL_ROUNDS, getAdaptiveQuestions } from '@/lib/history-engine/socratesQuestions';
import type { ChiefComplaint } from '@/lib/history-engine/types';

// ── Display helpers ──────────────────────────────────────────────────────────
function formatAnswer(value: string | boolean | string[] | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function getAnswersForSymptom(hpi: Record<string, any>, symptomId: string): Record<string, string | boolean | string[]> {
  const answers: Record<string, string | boolean | string[]> = {};
  const entry = hpi[symptomId];
  if (!entry?.socrates) return answers;
  for (const sa of entry.socrates) answers[sa.questionId] = sa.answer;
  return answers;
}

const ROUND_COLORS: Record<number, string> = { 1: '#DC2626', 2: '#7C3AED', 3: '#2563EB', 4: '#059669', 5: '#4F46E5' };
const ROUND_NEXT_LABELS: Record<number, string> = { 1: 'Round 1: Triage', 2: 'Round 2: Evolution', 3: 'Round 3: Confirmation', 4: 'Round 4: Risk Factors', 5: 'Impact' };

// ── Mini DDX indicator ──────────────────────────────────────────────────────
const DIAGNOSIS_NAMES: Record<string, string> = {
  appendicitis: 'Appendicitis', cholecystitis: 'Cholecystitis', pancreatitis: 'Pancreatitis',
  ureteric_colic: 'Ureteric Colic', intestinal_obstruction: 'Obstruction', perforated_ulcer: 'Perforated Ulcer',
  diverticulitis: 'Diverticulitis', ectopic_pregnancy: 'Ectopic', pid: 'PID', pneumonia: 'Pneumonia',
  gastroenteritis: 'Gastroenteritis', mi: 'MI', dka: 'DKA', peptic_ulcer_disease: 'PUD', uti: 'UTI', colorectal_cancer: 'Colon Ca',
};

interface DdxHint {
  region: string;
  diagnoses: string[];
}

function getDdxHint(answers: Record<string, string | boolean | string[]>): DdxHint | null {
  // Import the infer function inline (it's the same logic as in socratesQuestions)
  const loc = ((answers['ap_location'] as string) || (answers['ap_initial_location'] as string) || '').toLowerCase();
  const migration = (answers['ap_migration'] as string) || '';

  if (!loc && !migration) return null;

  const m = migration.toLowerCase();
  let region = 'abdomen';
  if (m.includes('navel') && m.includes('lower right')) region = 'right lower quadrant';
  else if (m.includes('flank') && m.includes('groin')) region = 'flank';
  else if (m.includes('upper') && m.includes('all over')) region = 'generalized';
  else if (loc.includes('periumbilical')) region = 'periumbilical';
  else if (loc.includes('right lower quadrant')) region = 'right lower quadrant';
  else if (loc.includes('left lower quadrant')) region = 'left lower quadrant';
  else if (loc.includes('right upper quadrant')) region = 'right upper quadrant';
  else if (loc.includes('epigastrium') || loc.includes('upper middle')) region = 'epigastrium';
  else if (loc.includes('flank') || loc.includes('back')) region = 'flank';
  else if (loc.includes('suprapubic') || loc.includes('lower middle')) region = 'suprapubic';
  else if (loc.includes('diffuse') || loc.includes('all over')) region = 'generalized';

  const regionDiagMap: Record<string, string[]> = {
    'right lower quadrant': ['appendicitis', 'ectopic_pregnancy', 'pid', 'diverticulitis', 'colorectal_cancer'],
    'left lower quadrant': ['diverticulitis', 'colorectal_cancer', 'pid'],
    'periumbilical': ['appendicitis', 'intestinal_obstruction', 'gastroenteritis'],
    'right upper quadrant': ['cholecystitis', 'pancreatitis', 'peptic_ulcer_disease'],
    'epigastrium': ['pancreatitis', 'cholecystitis', 'peptic_ulcer_disease', 'perforated_ulcer', 'mi'],
    'flank': ['ureteric_colic', 'appendicitis'],
    'suprapubic': ['ectopic_pregnancy', 'pid', 'uti', 'intestinal_obstruction'],
    'generalized': ['perforated_ulcer', 'intestinal_obstruction', 'pancreatitis', 'gastroenteritis'],
  };

  const diagnoses = regionDiagMap[region] || [];
  return { region, diagnoses };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HpiSection() {
  const chiefComplaints = useHistoryStore(s => s.chiefComplaints);
  const biodata = useHistoryStore(s => s.biodata);
  const hpi = useHistoryStore(s => s.hpi as Record<string, any>);
  const setSocratesAnswer = useHistoryStore(s => s.setSocratesAnswer);
  const completeSection = useHistoryStore(s => s.completeSection);

  const [phaseDone, setPhaseDone] = useState(false);
  const [showNarrative, setShowNarrative] = useState(false);

  const handleAnswer = useCallback((symptomId: string, question: SocratesQuestion, value: string | boolean | string[]) => {
    setSocratesAnswer(symptomId, question.id, question.label, value, question.weight, question.field);
  }, [setSocratesAnswer]);

  // ── Compute rounds per complaint ─────────────────────────────────────────
  const complaintsWithRounds = useMemo(() => {
    return chiefComplaints.map(cc => {
      const answered = getAnswersForSymptom(hpi, cc.symptomId);
      const stored = Object.keys(answered).map(qId => ({ questionId: qId, answer: answered[qId] }));
      const rounds = getAdaptiveQuestions(cc.symptomId, stored, biodata);

      // Find active round (first with unanswered questions)
      let activeRound = 5;
      for (const r of rounds) {
        if (r.questions.length > 0) { activeRound = r.round; break; }
      }

      const allAnswered = rounds.every(r => r.questions.length === 0);
      const doneQ = Object.keys(answered).length;
      // allQ = total questions in this symptom's bank (unfiltered max)
      const allRounds = getAdaptiveQuestions(cc.symptomId, [], biodata);
      const allQ = allRounds.reduce((s, r) => s + r.questions.length, 0);

      const ddxHint = getDdxHint(answered);

      return { ...cc, rounds, activeRound, allAnswered, answered, doneQ, allQ, ddxHint };
    });
  }, [chiefComplaints, hpi, biodata]);

  const allDone = complaintsWithRounds.every(c => c.allAnswered);

  // ── Resume logic: show narrative when done ──
  const handleFinish = useCallback(() => setShowNarrative(true), []);
  const handleNarrativeDone = useCallback(() => {
    setPhaseDone(true);
    completeSection('hpi');
  }, [completeSection]);

  if (phaseDone) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">✓</div>
        <div className="text-lg font-semibold text-gray-800 mb-2">HPI Complete</div>
      </div>
    );
  }

  if (showNarrative) {
    return (
      <div className="min-h-[400px]">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Symptom Story</div>
        <div className="p-5 rounded-lg bg-blue-50 border border-blue-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {chiefComplaints.map(cc => {
            const a = getAnswersForSymptom(hpi, cc.symptomId);
            const pos = Object.entries(a).filter(([,v]) => v === true || v === 'Yes').map(([k]) => k);
            return `• ${cc.label} (${cc.duration || ''}): ${pos.length > 0 ? pos.join(', ') : 'details recorded'}`;
          }).join('\n')}
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={handleNarrativeDone} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Accept & Complete HPI →</button>
          <button onClick={() => setShowNarrative(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Back</button>
        </div>
      </div>
    );
  }

  // ── Main UI: Clinical rounds ──────────────────────────────────────────────
  return (
    <div className="min-h-[400px]">
      {/* Patient header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {biodata?.name || 'Patient'} · {biodata?.age || ''}y · {biodata?.sex || ''}
          </div>
          <div className="text-xs text-gray-500">
            {chiefComplaints.map(c => c.label).join(', ')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {complaintsWithRounds.map(cc => {
          const pct = cc.allQ > 0 ? Math.round((cc.doneQ / cc.allQ) * 100) : 0;
          return (
            <div key={cc.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Complaint header */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{cc.label} <span className="text-xs text-gray-400 font-normal">· {cc.duration}</span></span>
                <span className="text-xs text-gray-400">{cc.doneQ}/{cc.allQ} ({pct}%)</span>
              </div>

              {/* DDX hint — shows narrowed differential based on location */}
              {cc.ddxHint && !cc.allAnswered && (
                <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Narrowed DDX:</span>
                  <span className="text-[10px] text-amber-600">{cc.ddxHint.region.replace(/_/g, ' ')} →</span>
                  {cc.ddxHint.diagnoses.map(d => (
                    <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{DIAGNOSIS_NAMES[d] || d}</span>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 space-y-3">
                {cc.rounds.map(({ round, questions }) => {
                  const meta = CLINICAL_ROUNDS[round];
                  const isActive = round === cc.activeRound && !cc.allAnswered;
                  const isComplete = questions.length === 0;
                  const roundColor = ROUND_COLORS[round] || '#6B7280';

                  // Show first unanswered round as active, others as collapsed
                  return (
                    <div key={round} className={`rounded-md border overflow-hidden ${isActive ? 'border-l-4 ring-1 ring-gray-100' : ''}`}
                      style={isActive ? { borderLeftColor: roundColor } : { opacity: isComplete ? 0.6 : 1 }}>
                      
                      {/* Round header */}
                      <div className="px-3 py-2 flex items-center justify-between bg-white"
                        style={isActive ? { background: `${roundColor}08` } : {}}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: roundColor }} />
                          <span className="text-xs font-semibold text-gray-800">
                            {meta.label}
                          </span>
                          {isComplete && <span className="text-xs text-green-600">✓ Complete</span>}
                        </div>
                        {isActive && !isComplete && (
                          <span className="text-xs text-gray-400">{questions.length} remaining</span>
                        )}
                      </div>

                      {/* Round goal — shown only when active */}
                      {isActive && !isComplete && (
                        <div className="px-3 py-1.5 bg-gray-50 border-t border-b border-gray-100">
                          <span className="text-xs text-gray-500 italic">{meta.goal}</span>
                        </div>
                      )}

                      {/* Questions */}
                      {isActive && !isComplete && (
                        <div className="px-3 py-2 space-y-2">
                          {questions.map(q => (
                            <div key={q.id}>
                              <QuestionRow
                                symptomId={cc.symptomId}
                                question={q}
                                answered={cc.answered[q.id] !== undefined}
                                currentValue={cc.answered[q.id]}
                                onAnswer={(v) => handleAnswer(cc.symptomId, q, v)}
                              />
                              {q.rationale && (
                                <div className="mt-0.5 ml-1">
                                  <span className="text-[10px] text-gray-400 italic leading-tight">{q.rationale}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate story button */}
      {allDone && chiefComplaints.length > 0 && (
        <div className="mt-6 text-center">
          <button onClick={handleFinish}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            Generate Symptom Story →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Single question row ────────────────────────────────────────────────────
function QuestionRow({ symptomId, question, answered, currentValue, onAnswer }: {
  symptomId: string;
  question: SocratesQuestion;
  answered: boolean;
  currentValue: string | boolean | string[] | undefined;
  onAnswer: (value: string | boolean | string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  if (answered) {
    return (
      <div className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-md">
        <span className="text-xs text-gray-600">{question.label}</span>
        <span className="text-xs font-medium text-blue-600">{formatAnswer(currentValue)}</span>
      </div>
    );
  }

  if (question.type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-xs text-gray-700 flex-1">{question.label}</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onAnswer(true)}
            className="px-3 py-1 text-xs rounded-md border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-600 transition-colors"
          >Yes</button>
          <button
            type="button"
            onClick={() => onAnswer(false)}
            className="px-3 py-1 text-xs rounded-md border border-gray-200 hover:border-gray-300 text-gray-600 transition-colors"
          >No</button>
        </div>
      </div>
    );
  }

  if (question.type === 'select' && question.options) {
    return (
      <div className="py-1.5">
        <div className="text-xs text-gray-700 mb-1.5">{question.label}</div>
        <div className="flex flex-wrap gap-1">
          {question.options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onAnswer(opt)}
              className="px-2.5 py-1 text-xs rounded-full border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-600 transition-colors"
            >{opt}</button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'multi_select' && question.options) {
    return (
      <div className="py-1.5">
        <div className="text-xs text-gray-700 mb-1.5">{question.label}</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {question.options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setSelected(prev =>
                  prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                );
              }}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                selected.includes(opt)
                  ? 'border-blue-400 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >{opt}</button>
          ))}
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => { onAnswer(selected); setSelected([]); }}
            className="text-xs text-blue-600 hover:underline"
          >Confirm</button>
        )}
      </div>
    );
  }

  if (question.type === 'number') {
    return (
      <div className="py-1.5">
        <div className="text-xs text-gray-700 mb-1.5">{question.label}</div>
        <input
          type="number"
          min={0}
          onChange={e => onAnswer(e.target.value)}
          className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
        />
      </div>
    );
  }

  if (question.type === 'text') {
    return (
      <div className="py-1.5">
        <div className="text-xs text-gray-700 mb-1.5">{question.label}</div>
        <input
          type="text"
          onChange={e => onAnswer(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
          placeholder={question.clinicalGuide || ''}
        />
      </div>
    );
  }

  return null;
}
