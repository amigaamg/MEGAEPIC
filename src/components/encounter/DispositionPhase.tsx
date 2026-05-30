'use client';
import React, { useState } from 'react';
import type { DispositionData } from '@/types/encounter';
import { generateDischargeSummary } from '@/engine/note-generator/surgery/discharge';

interface DispositionPhaseProps {
  topDiseaseNames: string[];
  proceduresPerformed: string[];
  onSave: (data: DispositionData) => Promise<void>;
  onComplete: () => void;
  patientName?: string;
  patientId?: string;
  unitSlug?: string;
}

export function DispositionPhase({ topDiseaseNames, proceduresPerformed, onSave, onComplete, patientName, patientId, unitSlug }: DispositionPhaseProps) {
  const [form, setForm] = useState<DispositionData>({
    decision: 'admit',
    dischargePlan: {
      medications: [],
      instructions: [],
      followUp: 'Review in surgical outpatients in 2 weeks',
      warningSigns: ['Worsening pain', 'Fever >38°C', 'Wound discharge or bleeding', 'Inability to tolerate oral intake'],
    },
    timestamp: Date.now(),
  });
  const [medInput, setMedInput] = useState('');
  const [instrInput, setInstrInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const addItem = (field: 'medications' | 'instructions') => {
    const value = field === 'medications' ? medInput.trim() : instrInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      dischargePlan: {
        ...prev.dischargePlan!,
        [field]: [...(prev.dischargePlan?.[field] || []), value],
      },
    }));
    field === 'medications' ? setMedInput('') : setInstrInput('');
  };

  const removeItem = (field: 'medications' | 'instructions', index: number) => {
    setForm((prev) => ({
      ...prev,
      dischargePlan: {
        ...prev.dischargePlan!,
        [field]: (prev.dischargePlan?.[field] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, timestamp: Date.now() });
    onComplete();
    setSaving(false);
  };

  const dischargeSummary = showSummary ? generateDischargeSummary({
    patientName: patientName || 'Patient',
    patientId: patientId || '',
    unitSlug: unitSlug || '',
    primaryDiagnosis: topDiseaseNames[0] || '',
    secondaryDiagnoses: topDiseaseNames.slice(1),
    admissionDate: new Date().toLocaleDateString(),
    dischargeDate: new Date().toLocaleDateString(),
    proceduresPerformed,
    hospitalCourse: '',
    dischargeMedications: form.dischargePlan?.medications || [],
    dischargeInstructions: form.dischargePlan?.instructions || [],
    followUp: form.dischargePlan?.followUp || '',
    warningSigns: form.dischargePlan?.warningSigns || [],
  }) : '';

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Disposition Decision</label>
        <div className="grid grid-cols-5 gap-2">
          {(['admit', 'discharge', 'transfer', 'surgery', 'icu'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setForm((prev) => ({ ...prev, decision: d }))}
              className={`px-3 py-3 text-sm font-medium rounded-lg border transition-colors ${
                form.decision === d
                  ? d === 'discharge' ? 'border-green-500 bg-green-50 text-green-700'
                    : d === 'surgery' ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : d === 'icu' ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <div className="text-lg mb-1">
                {d === 'admit' ? '🏥' : d === 'discharge' ? '🏠' : d === 'transfer' ? '🚑' : d === 'surgery' ? '🔪' : '💓'}
              </div>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {form.decision === 'discharge' && (
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium text-gray-800">Discharge Plan</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Medications</label>
            <div className="flex gap-2 mb-1">
              <input type="text" value={medInput} onChange={(e) => setMedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem('medications')}
                className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Add medication..." />
              <button onClick={() => addItem('medications')} className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Add</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {(form.dischargePlan?.medications || []).map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  {m} <button onClick={() => removeItem('medications', i)} className="hover:text-blue-900">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <div className="flex gap-2 mb-1">
              <input type="text" value={instrInput} onChange={(e) => setInstrInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem('instructions')}
                className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Add instruction..." />
              <button onClick={() => addItem('instructions')} className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Add</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {(form.dischargePlan?.instructions || []).map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                  {m} <button onClick={() => removeItem('instructions', i)} className="hover:text-green-900">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up</label>
            <input type="text" value={form.dischargePlan?.followUp || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, dischargePlan: { ...prev.dischargePlan!, followUp: e.target.value } }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warning Signs (return to ED if)</label>
            <div className="flex flex-wrap gap-1">
              {(form.dischargePlan?.warningSigns || []).map((w, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                  {w} <button onClick={() => setForm((prev) => ({
                    ...prev,
                    dischargePlan: { ...prev.dischargePlan!, warningSigns: (prev.dischargePlan?.warningSigns || []).filter((_, j) => j !== i) },
                  }))}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          {showSummary && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-700 mb-2">Discharge Summary Preview</h4>
              <pre className="text-xs font-mono whitespace-pre-wrap">{dischargeSummary}</pre>
            </div>
          )}

          <button onClick={() => setShowSummary(!showSummary)}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            {showSummary ? 'Hide Summary' : 'Preview Discharge Summary'}
          </button>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {saving ? 'Saving...' : 'Complete Disposition'}
        </button>
      </div>
    </div>
  );
}
