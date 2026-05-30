'use client';
import React, { useState } from 'react';
import type { WardRoundEntry } from '@/types/encounter';
import { generateWardRoundNote } from '@/engine/note-generator/surgery/wardRound';

interface WardRoundPhaseProps {
  existingRounds: WardRoundEntry[];
  onSave: (data: Omit<WardRoundEntry, 'id' | 'version'>) => Promise<void>;
  onComplete: () => void;
  authorName?: string;
  patientName?: string;
  patientId?: string;
  unitSlug?: string;
}

export function WardRoundPhase({ existingRounds, onSave, onComplete, authorName = 'Dr. Clinician', patientName, patientId, unitSlug }: WardRoundPhaseProps) {
  const [form, setForm] = useState({
    date: Date.now(),
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    author: authorName,
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    onComplete();
    setSaving(false);
  };

  const preview = showPreview ? generateWardRoundNote({
    patientName: patientName || 'Patient',
    patientId: patientId || '',
    unitSlug: unitSlug || '',
    date: new Date(form.date).toLocaleDateString(),
    subjective: form.subjective,
    objective: form.objective,
    assessment: form.assessment,
    plan: form.plan,
    author: form.author,
    version: existingRounds.length + 1,
  }) : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">
          Ward Round #{existingRounds.length + 1}
        </h4>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>

      {existingRounds.length > 0 && (
        <details className="text-sm text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">Previous rounds ({existingRounds.length})</summary>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {existingRounds.map((r, i) => (
              <div key={r.id} className="p-2 border rounded text-xs">
                <p className="font-medium">v{r.version} — {new Date(r.date).toLocaleDateString()} by {r.author}</p>
                <p className="text-gray-400 truncate">{r.assessment}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subjective</label>
          <textarea value={form.subjective} onChange={(e) => setForm((prev) => ({ ...prev, subjective: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Patient's symptoms, concerns..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
          <textarea value={form.objective} onChange={(e) => setForm((prev) => ({ ...prev, objective: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="Vitals, examination findings, results..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
          <textarea value={form.assessment} onChange={(e) => setForm((prev) => ({ ...prev, assessment: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Clinical impression, progress..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <textarea value={form.plan} onChange={(e) => setForm((prev) => ({ ...prev, plan: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="Management plan, investigations, disposition..." />
        </div>
      </div>

      {showPreview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-2">Ward Round Note Preview</h4>
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
          {saving ? 'Saving...' : 'Save Ward Round'}
        </button>
      </div>
    </div>
  );
}
