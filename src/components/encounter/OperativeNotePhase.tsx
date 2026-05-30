'use client';
import React, { useState } from 'react';
import type { OperativeNoteData } from '@/types/encounter';
import { generateOperativeNote, type OperativeInput } from '@/engine/note-generator/surgery/operative';

interface OperativeNotePhaseProps {
  topDiseaseIds: string[];
  existingNote?: OperativeNoteData;
  onSave: (data: OperativeInput) => Promise<void>;
  onComplete: () => void;
  surgeonName?: string;
}

export function OperativeNotePhase({ topDiseaseIds, existingNote, onSave, onComplete, surgeonName = 'Dr. Surgeon' }: OperativeNotePhaseProps) {
  const [form, setForm] = useState<OperativeInput>({
    preOpDiagnosis: existingNote?.preOpDiagnosis || (topDiseaseIds[0] ? topDiseaseIds[0].replace(/_/g, ' ') : ''),
    postOpDiagnosis: existingNote?.postOpDiagnosis || '',
    procedure: existingNote?.procedure || '',
    surgeon: existingNote?.surgeon || surgeonName,
    assistant: existingNote?.assistant || '',
    anaesthesia: existingNote?.anaesthesia || 'General anaesthesia',
    findings: existingNote?.findings || '',
    procedureDetails: existingNote?.procedureDetails || '',
    bloodLoss: existingNote?.bloodLoss || 'Minimal (<100 mL)',
    specimens: existingNote?.specimens || [],
    complications: existingNote?.complications || [],
    disposition: existingNote?.disposition || 'To ward for post-operative recovery',
  });
  const [specimenInput, setSpecimenInput] = useState('');
  const [complicationInput, setComplicationInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const update = <K extends keyof OperativeInput>(key: K, value: OperativeInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSpecimen = () => {
    if (!specimenInput.trim()) return;
    update('specimens', [...form.specimens, specimenInput.trim()]);
    setSpecimenInput('');
  };

  const addComplication = () => {
    if (!complicationInput.trim()) return;
    update('complications', [...form.complications, complicationInput.trim()]);
    setComplicationInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    onComplete();
    setSaving(false);
  };

  const preview = showPreview ? generateOperativeNote(form) : '';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pre-op Diagnosis</label>
          <input type="text" value={form.preOpDiagnosis} onChange={(e) => update('preOpDiagnosis', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Post-op Diagnosis</label>
          <input type="text" value={form.postOpDiagnosis} onChange={(e) => update('postOpDiagnosis', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Procedure</label>
          <input type="text" value={form.procedure} onChange={(e) => update('procedure', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anaesthesia</label>
          <input type="text" value={form.anaesthesia} onChange={(e) => update('anaesthesia', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surgeon</label>
          <input type="text" value={form.surgeon} onChange={(e) => update('surgeon', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assistant</label>
          <input type="text" value={form.assistant} onChange={(e) => update('assistant', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
        <textarea value={form.findings} onChange={(e) => update('findings', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="Intra-operative findings..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Details</label>
        <textarea value={form.procedureDetails} onChange={(e) => update('procedureDetails', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm font-mono" rows={5} placeholder="Step-by-step description..." />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Loss</label>
          <input type="text" value={form.bloodLoss} onChange={(e) => update('bloodLoss', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disposition</label>
          <input type="text" value={form.disposition} onChange={(e) => update('disposition', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specimens</label>
          <div className="flex gap-2 mb-1">
            <input type="text" value={specimenInput} onChange={(e) => setSpecimenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSpecimen()}
              className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Add specimen" />
            <button onClick={addSpecimen} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">+</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {form.specimens.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                {s} <button onClick={() => update('specimens', form.specimens.filter((_, j) => j !== i))}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complications</label>
          <div className="flex gap-2 mb-1">
            <input type="text" value={complicationInput} onChange={(e) => setComplicationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComplication()}
              className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Add complication" />
            <button onClick={addComplication} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">+</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {form.complications.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                {c} <button onClick={() => update('complications', form.complications.filter((_, j) => j !== i))}>&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-2">Note Preview</h4>
          <pre className="text-xs font-mono whitespace-pre-wrap">{preview}</pre>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <button onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
          {showPreview ? 'Hide Preview' : 'Preview Note'}
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {saving ? 'Saving...' : 'Save Operative Note'}
        </button>
      </div>
    </div>
  );
}
