'use client';
import React, { useState, useCallback, useEffect } from 'react';
import type { HPIEntry } from '@/types/encounter';
import { getDiseaseById } from '@/engine/knowledge-graph';
import type { DiseaseNode } from '@/engine/knowledge-graph/types';

interface HPIPhaseProps {
  topDiseaseIds: string[];
  existingAnswers: HPIEntry[];
  onAnswer: (questionId: string, question: string, answer: string | boolean) => Promise<void>;
  onComplete: () => void;
  unitSlug?: string;
}

function loadQuestions(diseaseIds: string[]): { id: string; question: string; weight: number }[] {
  const seen = new Set<string>();
  const questions: { id: string; question: string; weight: number }[] = [];
  for (const did of diseaseIds) {
    const disease = getDiseaseById(did);
    if (!disease) continue;
    const hq = disease.historyFeatures || [];
    const legacy = (disease as any).history_questions || [];
    const allQ = hq.length > 0 ? hq : legacy;
    for (const q of allQ) {
      const qText = (q as any).question || q.symptomId?.replace(/_/g, ' ') || q.signId?.replace(/_/g, ' ');
      const qId = q.symptomId || q.id || `${disease.id}_${qText}`;
      if (!seen.has(qId) && qText) {
        seen.add(qId);
        questions.push({ id: qId, question: qText, weight: q.weight || 5 });
      }
    }
  }
  return questions;
}

export function HPIPhase({ topDiseaseIds, existingAnswers, onAnswer, onComplete, unitSlug }: HPIPhaseProps) {
  const [questions, setQuestions] = useState(() => loadQuestions(topDiseaseIds));
  const [answers, setAnswers] = useState<Record<string, string | boolean>>(() => {
    const map: Record<string, string | boolean> = {};
    existingAnswers.forEach((a) => { map[a.questionId] = a.answer; });
    return map;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const qs = loadQuestions(topDiseaseIds);
    if (qs.length > 0) setQuestions(qs);
  }, [topDiseaseIds]);

  const handleAnswer = useCallback(async (qId: string, question: string, value: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    await onAnswer(qId, question, value);
  }, [onAnswer]);

  const handleComplete = async () => {
    setSaving(true);
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    for (const q of unanswered) {
      await onAnswer(q.id, q.question, 'Not asked');
    }
    onComplete();
    setSaving(false);
  };

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Questions from top {Math.min(topDiseaseIds.length, 3)} differentials
        </p>
        <span className="text-xs text-gray-400">{answeredCount}/{questions.length} answered</span>
      </div>

      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-1">No questions available</p>
          <p className="text-sm">Complete the presenting complaint to generate questions</p>
        </div>
      )}

      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {questions.map((q) => {
          const answer = answers[q.id];
          const isBoolean = typeof answer === 'boolean' || answer === undefined;

          return (
            <div key={q.id} className="p-4 border rounded-lg hover:border-blue-200 transition-colors">
              <p className="text-sm font-medium text-gray-800 mb-2">{q.question}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnswer(q.id, q.question, true)}
                  className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
                    answer === true ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(q.id, q.question, false)}
                  className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
                    answer === false ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  No
                </button>
                <input
                  type="text"
                  placeholder="Describe..."
                  value={typeof answer === 'string' && answer !== 'Not asked' ? answer : ''}
                  onChange={(e) => handleAnswer(q.id, q.question, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border rounded-lg"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleComplete}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? 'Saving...' : 'Complete HPI'}
        </button>
      </div>
    </div>
  );
}
