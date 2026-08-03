'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { useEncounter } from '@/lib/amexan/encounter';
import { ConversationInput } from './ConversationInput';
import { getNextQuestion } from '@/lib/amexan/encounter/engines/questionEngine';
import type { SymptomField } from '@/lib/amexan/encounter/symptomSchemas';
import type { SymptomId, StructuredSymptom } from '@/lib/amexan/encounter/encounterState';
import { SYMPTOM_SCHEMAS } from '@/lib/amexan/encounter/symptomSchemas';
import { buildHPINarrative } from '@/lib/amexan/encounter/engines/narrativeEngine';

const COMMON_SYMPTOMS: { id: SymptomId; label: string }[] = [
  { id: 'abdominal_pain', label: 'Abdominal Pain' },
  { id: 'chest_pain', label: 'Chest Pain' },
  { id: 'headache', label: 'Headache' },
  { id: 'cough', label: 'Cough' },
  { id: 'fever', label: 'Fever' },
  { id: 'dyspnea', label: 'Shortness of Breath' },
  { id: 'nausea_vomiting', label: 'Nausea & Vomiting' },
  { id: 'diarrhea', label: 'Diarrhea' },
  { id: 'vaginal_bleeding', label: 'Vaginal Bleeding' },
  { id: 'seizure', label: 'Seizures' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'syncope', label: 'Fainting' },
  { id: 'palpitations', label: 'Palpitations' },
  { id: 'dysuria', label: 'Painful Urination' },
  { id: 'back_pain', label: 'Back Pain' },
  { id: 'constipation', label: 'Constipation' },
  { id: 'gi_bleeding', label: 'GI Bleeding' },
  { id: 'rash', label: 'Rash' },
  { id: 'joint_pain', label: 'Joint Pain' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'lethargy', label: 'Lethargy' },
  { id: 'stridor', label: 'Stridor' },
  { id: 'jaundice', label: 'Jaundice' },
  { id: 'distension', label: 'Distension' },
];

function FieldRenderer({ field, value, onChange }: {
  field: SymptomField;
  value: any;
  onChange: (v: any) => void;
}) {
  if (field.dependsOn && !value && value !== 0 && value !== false) {
    const depValue = value;
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
            value === true ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
            value === false ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          No
        </button>
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0} max={10}
          value={typeof value === 'number' ? value : 5}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full max-w-xs h-1.5 accent-blue-600"
        />
        <span className="text-sm font-semibold text-blue-700 w-8 text-center">
          {typeof value === 'number' ? value : '-'}/10
        </span>
      </div>
    );
  }

  if (field.type === 'select' && field.options && field.options.length > 0) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {field.options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt === value ? '' : opt)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              value === opt ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {opt.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === 'multi_select') {
    const selected: string[] = Array.isArray(value) ? value : [];
    const toggle = (opt: string) => {
      if (selected.includes(opt)) {
        onChange(selected.filter(s => s !== opt));
      } else {
        onChange([...selected, opt]);
      }
    };
    return (
      <div className="flex flex-wrap gap-1.5">
        {(field.options || []).map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selected.includes(opt) ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {selected.includes(opt) ? '✓ ' : ''}{opt.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 border rounded-lg text-sm"
      placeholder="Describe..."
    />
  );
}

interface HPIPhaseProps {
  onComplete?: () => void;
}

export function HPIPhase({ onComplete }: HPIPhaseProps) {
  const { state, activateSymptom, answerQuestion } = useEncounter();
  const [hpiNarrative, setHpiNarrative] = useState<string | null>(null);
  const [hpiEditing, setHpiEditing] = useState(false);
  const [hpiEditedText, setHpiEditedText] = useState('');
  const [showNarrative, setShowNarrative] = useState(false);

  const activeSymptomIds = useMemo(() =>
    Object.keys(state.symptoms).filter(id => state.symptoms[id as SymptomId]?.present),
    [state.symptoms],
  );

  const nextQuestion = useMemo(() => {
    if (activeSymptomIds.length === 0) return null;
    return getNextQuestion(state);
  }, [state, activeSymptomIds]);

  const totalMandatoryFields = useMemo(() => {
    let count = 0;
    for (const sid of activeSymptomIds) {
      const schema = SYMPTOM_SCHEMAS[sid as SymptomId];
      if (schema) count += schema.fields.filter(f => f.mandatory).length;
    }
    return count;
  }, [activeSymptomIds]);

  const answeredMandatoryFields = useMemo(() => {
    let count = 0;
    for (const sid of activeSymptomIds) {
      const symptom = state.symptoms[sid as SymptomId];
      const schema = SYMPTOM_SCHEMAS[sid as SymptomId];
      if (!symptom || !schema) continue;
      const answered = new Set(Object.keys(symptom));
      for (const f of schema.fields) {
        if (f.mandatory && answered.has(f.id)) count++;
      }
    }
    return count;
  }, [activeSymptomIds, state.symptoms]);

  const allMandatoryFieldsAnswered = totalMandatoryFields > 0 && answeredMandatoryFields >= totalMandatoryFields;

  const handleActivateSymptom = useCallback((id: SymptomId) => {
    const schema = SYMPTOM_SCHEMAS[id];
    if (!schema) return;
    // Only set present:true — leave all fields undefined so the question engine asks them
    activateSymptom({ id, present: true } as StructuredSymptom);
  }, [activateSymptom]);

  const handleFieldChange = useCallback((field: SymptomField, value: any) => {
    if (!nextQuestion) return;
    answerQuestion(nextQuestion.symptomId, field.id, value);
  }, [answerQuestion, nextQuestion]);

  const handleGenerateNarrative = useCallback(() => {
    const narrative = buildHPINarrative(state);
    setHpiNarrative(narrative);
    setHpiEditedText(narrative);
    setHpiEditing(false);
    setShowNarrative(true);
  }, [state]);

  const handleSaveNarrative = useCallback(() => {
    setHpiNarrative(hpiEditedText);
    setHpiEditing(false);
  }, [hpiEditedText]);

  if (activeSymptomIds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <span className="text-lg">📝</span>
          <span className="text-sm font-semibold text-gray-700">History of Presenting Illness</span>
        </div>

        <ConversationInput />

        <p className="text-xs text-gray-500">Select the symptoms the patient is experiencing:</p>

        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleActivateSymptom(s.id)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={() => setShowNarrative(true)}
            className="px-4 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
          >
            Skip to HPI Narrative
          </button>
          <button
            onClick={() => { if (onComplete) onComplete(); }}
            className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-2"
          >
            Continue without symptoms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <span className="text-sm font-semibold text-gray-700">History of Presenting Illness</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {activeSymptomIds.map(id => (
            <span key={id} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {SYMPTOM_SCHEMAS[id as SymptomId]?.label || id}
            </span>
          ))}
        </div>
      </div>

      <ConversationInput />

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${totalMandatoryFields > 0 ? (answeredMandatoryFields / totalMandatoryFields) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {answeredMandatoryFields}/{totalMandatoryFields} required
        </span>
      </div>

      {/* Question flow */}
      {nextQuestion && !showNarrative && (
        <div className="p-5 border rounded-lg bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {nextQuestion.symptomId.replace(/_/g, ' ')} · {nextQuestion.phase}
            </span>
            {nextQuestion.field.priority === 'critical' && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded uppercase">Red Flag</span>
            )}
            {nextQuestion.field.clinicalGuide && (
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-50 text-amber-700 rounded">Guide</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 mb-3">{nextQuestion.field.label}</p>
          <FieldRenderer
            field={nextQuestion.field}
            value={(state.symptoms[nextQuestion.symptomId] as any)?.[nextQuestion.field.id]}
            onChange={(v) => handleFieldChange(nextQuestion.field, v)}
          />
          {nextQuestion.field.clinicalGuide && (
            <p className="mt-2 text-[11px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded">{nextQuestion.field.clinicalGuide}</p>
          )}
        </div>
      )}

      {/* Completion & Narrative */}
      {allMandatoryFieldsAnswered && !showNarrative && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-700 mb-2">✓ All required fields collected</p>
          <button
            onClick={handleGenerateNarrative}
            className="px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
          >
            Generate HPI Narrative
          </button>
        </div>
      )}

      {!allMandatoryFieldsAnswered && !nextQuestion && !showNarrative && (
        <div className="p-4 bg-gray-50 border rounded-lg text-center">
          <p className="text-sm text-gray-500">Continue exploring symptoms to complete the assessment.</p>
        </div>
      )}

      {/* HPI Narrative display */}
      {showNarrative && (
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-200">
            <span className="text-xs font-semibold text-blue-800">HPI Narrative</span>
            <div className="flex gap-2">
              {hpiEditing ? (
                <>
                  <button onClick={() => { setHpiEditing(false); setHpiEditedText(hpiNarrative || ''); }}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSaveNarrative}
                    className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                </>
              ) : (
                <button onClick={() => setHpiEditing(true)}
                  className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">Edit</button>
              )}
            </div>
          </div>
          <div className="px-4 py-3">
            {hpiEditing ? (
              <textarea
                value={hpiEditedText}
                onChange={(e) => setHpiEditedText(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {hpiNarrative || 'No narrative generated yet. Complete the fields above.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add another symptom button */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => setShowNarrative(!showNarrative)}
          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
        >
          {showNarrative ? 'Back to Questions' : 'Show HPI Narrative'}
        </button>
      </div>

      {/* Complete & Continue */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => { if (onComplete) onComplete(); }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          Complete History & Continue
        </button>
      </div>
    </div>
  );
}
