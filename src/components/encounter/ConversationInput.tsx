'use client';
import React, { useState, useCallback } from 'react';
import { useEncounter } from '@/lib/amexan/encounter';
import { parseClinicalConversation, applyConversationToState } from '@/lib/amexan/encounter';
import type { ConversationParseResult } from '@/lib/amexan/encounter';

interface ConversationInputProps {
  onParsed?: (result: ConversationParseResult) => void;
}

export function ConversationInput({ onParsed }: ConversationInputProps) {
  const { state, dispatch, setChiefComplaint, markAbsent } = useEncounter();
  const [text, setText] = useState('');
  const [result, setResult] = useState<ConversationParseResult | null>(null);
  const [applied, setApplied] = useState(false);

  const handleParse = useCallback(() => {
    if (!text.trim()) return;
    const parsed = parseClinicalConversation(text);
    setResult(parsed);
    setApplied(false);
    if (onParsed) onParsed(parsed);
  }, [text, onParsed]);

  const handleApply = useCallback(() => {
    if (!result) return;
    const appliedResult = applyConversationToState(state, result);

    for (const [id, symptom] of Object.entries(appliedResult.symptoms)) {
      const existing = Object.prototype.hasOwnProperty.call(state.symptoms, id);
      dispatch({
        type: existing ? 'UPDATE_SYMPTOM' : 'ACTIVATE_SYMPTOM',
        payload: symptom,
      });
    }

    for (const deniedId of appliedResult.denials) {
      markAbsent(deniedId);
    }

    if (appliedResult.chiefComplaint) {
      setChiefComplaint(
        appliedResult.chiefComplaint.text,
        appliedResult.chiefComplaint.duration || '',
        appliedResult.chiefComplaint.severity || 0,
      );
    }

    setApplied(true);
    setResult(null);
    setText('');
  }, [result, state, dispatch, setChiefComplaint, markAbsent]);

  const clear = useCallback(() => {
    setResult(null);
    setText('');
    setApplied(false);
  }, []);

  return (
    <div className="border border-blue-100 bg-blue-50/40 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🗣️</span>
        <span className="text-sm font-semibold text-gray-700">Paste the patient&apos;s story</span>
      </div>
      <p className="text-[11px] text-gray-500 mb-2">
        Type or paste the presenting complaint in natural language. We&apos;ll extract the
        symptoms, onset, duration, and negatives automatically.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="e.g. 43 year old man with 3 days of central crushing chest pain, worse on exertion, with sweating and vomiting for 20 minutes. No haemoptysis."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-400 outline-none resize-y"
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          <button
            onClick={handleParse}
            disabled={!text.trim()}
            className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 font-medium"
          >
            Parse
          </button>
          {result && (
            <>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Apply to record
              </button>
              <button
                onClick={clear}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {applied && (
        <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ Applied to the record. Continue with the questions below to fill any gaps.
        </p>
      )}

      {result && (
        <div className="mt-3 space-y-2">
          {result.chiefComplaint && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Chief complaint:</span>{' '}
              {result.chiefComplaint.text}
              {result.durationText ? ` for ${result.durationText}` : ''}
            </div>
          )}

          {result.symptoms.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Symptoms detected:</span>{' '}
              <span className="flex flex-wrap gap-1.5 mt-1">
                {result.symptoms.map((s) => (
                  <span
                    key={s.symptomId}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"
                    title={Object.entries(s.fields).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join('\n')}
                  >
                    {s.matchedText}
                  </span>
                ))}
              </span>
            </div>
          )}

          {result.negatives.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Negatives:</span>{' '}
              {result.negatives.join('; ')}
            </div>
          )}

          {result.uncertainties.length > 0 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="font-semibold">Not sure how to record:</span>{' '}
              {result.uncertainties.join('; ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
