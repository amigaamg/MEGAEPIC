'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getDiseaseById } from '@/engine/knowledge-graph';
import { generateOperativeNote, type OperativeInput } from '@/engine/note-generator/surgery/operative';
import { MedicalDocument } from '@/src/components/shared/MedicalDocument';

interface TemplateEntry {
  key: string;
  label: string;
  procedure: string;
  steps: string[];
  preOpDiagnosis?: string;
  postOpDiagnosis?: string;
  indication?: string;
  approach?: string;
  position?: string;
  incision?: string;
  keyLandmarks?: string[];
}

interface OperativeNotePhaseProps {
  topDiseaseIds: string[];
  patientName?: string;
  patientId?: string;
  unitSlug?: string;
  existingNote?: any;
  onSave: (data: any) => Promise<void>;
  onComplete: () => void;
  surgeonName?: string;
  encounterDiagnosis?: string;
}

function extractTemplates(disease: any): TemplateEntry[] {
  const raw = disease?.operative_templates;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((t: any, i: number) => ({
      key: `tpl_${i}`,
      label: t.procedure || t.title || `Template ${i + 1}`,
      procedure: t.procedure || '',
      steps: t.steps || [],
      preOpDiagnosis: t.preOpDiagnosis || disease.name,
      postOpDiagnosis: t.postOpDiagnosis || t.preOpDiagnosis || disease.name,
      indication: t.indication || '',
      approach: t.approach || '',
      position: t.position || '',
      incision: t.incision || '',
      keyLandmarks: t.keyLandmarks || [],
    }));
  }
  if (typeof raw === 'object') {
    return Object.entries(raw).map(([key, t]: [string, any]) => ({
      key,
      label: t.title || t.procedure || key.replace(/_/g, ' '),
      procedure: t.procedure || t.title || '',
      steps: t.steps || [],
      preOpDiagnosis: t.preOpDiagnosis || disease.name,
      postOpDiagnosis: t.postOpDiagnosis || t.preOpDiagnosis || disease.name,
      indication: t.indication || '',
      approach: t.approach || '',
      position: t.position || '',
      incision: t.incision || '',
      keyLandmarks: t.keyLandmarks || [],
    }));
  }
  return [];
}

export function OperativeNotePhase({
  topDiseaseIds,
  patientName = 'Unknown',
  patientId = '',
  unitSlug = '',
  existingNote,
  onSave,
  onComplete,
  surgeonName = 'Dr. Surgeon',
  encounterDiagnosis,
}: OperativeNotePhaseProps) {
  const diseaseId = topDiseaseIds[0] || '';
  const disease = useMemo(() => (diseaseId ? getDiseaseById(diseaseId) : undefined), [diseaseId]);
  const diseaseName = disease?.name || encounterDiagnosis || (diseaseId ? diseaseId.replace(/_/g, ' ') : '');

  const templates = useMemo(() => extractTemplates(disease), [disease]);

  const [form, setForm] = useState<OperativeInput>(() => {
    if (existingNote) {
      return {
        preOpDiagnosis: existingNote.preOpDiagnosis || diseaseName,
        postOpDiagnosis: existingNote.postOpDiagnosis || '',
        procedure: existingNote.procedure || '',
        surgeon: existingNote.surgeon || surgeonName,
        assistant: existingNote.assistant || '',
        anaesthesia: existingNote.anaesthesia || 'General anaesthesia',
        findings: existingNote.findings || '',
        procedureDetails: existingNote.procedureDetails || '',
        bloodLoss: existingNote.bloodLoss || 'Minimal (<100 mL)',
        specimens: existingNote.specimens || [],
        complications: existingNote.complications || [],
        disposition: existingNote.disposition || 'To ward for post-operative recovery',
        templateDisease: existingNote.templateDisease || '',
      };
    }
    return {
      preOpDiagnosis: diseaseName,
      postOpDiagnosis: '',
      procedure: '',
      surgeon: surgeonName,
      assistant: '',
      anaesthesia: 'General anaesthesia',
      findings: '',
      procedureDetails: '',
      bloodLoss: 'Minimal (<100 mL)',
      specimens: [],
      complications: [],
      disposition: 'To ward for post-operative recovery',
      templateDisease: '',
    };
  });

  const [specimenInput, setSpecimenInput] = useState('');
  const [complicationInput, setComplicationInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null);
  const autoApplied = useRef(false);

  const update = useCallback(<K extends keyof OperativeInput>(key: K, value: OperativeInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyTemplate = useCallback(
    (tpl: TemplateEntry) => {
      setForm({
        preOpDiagnosis: tpl.preOpDiagnosis || diseaseName,
        postOpDiagnosis: tpl.postOpDiagnosis || tpl.preOpDiagnosis || diseaseName,
        procedure: tpl.procedure,
        surgeon: form.surgeon || surgeonName,
        assistant: form.assistant,
        anaesthesia: form.anaesthesia || 'General anaesthesia',
        findings: tpl.indication
          ? `Indication: ${tpl.indication}${tpl.keyLandmarks?.length ? `\nKey landmarks: ${tpl.keyLandmarks.join(', ')}` : ''}`
          : '',
        procedureDetails: tpl.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        bloodLoss: form.bloodLoss || 'Minimal (<100 mL)',
        specimens: [],
        complications: [],
        disposition: form.disposition || 'To ward for post-operative recovery',
        templateDisease: tpl.label,
      });
      setAppliedTemplate(tpl.key);
    },
    [diseaseName, form.surgeon, form.assistant, form.anaesthesia, form.bloodLoss, form.disposition, surgeonName],
  );

  useEffect(() => {
    if (autoApplied.current || !diseaseName || templates.length === 0) return;
    if (existingNote) {
      autoApplied.current = true;
      return;
    }
    if (encounterDiagnosis || diseaseName) {
      const match = encounterDiagnosis
        ? templates.find(
            (t) =>
              t.label.toLowerCase().includes(encounterDiagnosis.toLowerCase()) ||
              t.procedure.toLowerCase().includes(encounterDiagnosis.toLowerCase()),
          )
        : templates[0];
      if (match) {
        applyTemplate(match);
      }
      autoApplied.current = true;
    }
  }, [diseaseName, templates, encounterDiagnosis, existingNote, applyTemplate]);

  const addSpecimen = () => {
    if (!specimenInput.trim()) return;
    update('specimens', [...form.specimens, specimenInput.trim()]);
    setSpecimenInput('');
  };

  const removeSpecimen = (index: number) => {
    update('specimens', form.specimens.filter((_, i) => i !== index));
  };

  const addComplication = () => {
    if (!complicationInput.trim()) return;
    update('complications', [...form.complications, complicationInput.trim()]);
    setComplicationInput('');
  };

  const removeComplication = (index: number) => {
    update('complications', form.complications.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const preview = useMemo(() => (showPreview ? generateOperativeNote(form) : ''), [showPreview, form]);

  const bloodLossOptions = [
    'Minimal (<100 mL)',
    'Mild (100-300 mL)',
    'Moderate (300-500 mL)',
    'Moderate-Severe (500-1000 mL)',
    'Severe (>1000 mL)',
  ];

  const dispositionOptions = [
    'To ward for post-operative recovery',
    'To HDU for close monitoring',
    'To ICU for continued care',
    'To recovery room then ward',
    'To ward with hourly observations',
    'Transferred to referring facility',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>🔪</span> Operative Note
        </h2>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
          Post-Op Status: Pending
        </span>
      </div>

      {templates.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-indigo-800">⚡ Templates available for {diseaseName}:</span>
            {appliedTemplate && (
              <span className="text-xs text-indigo-500 ml-auto">
                Applied: {templates.find((t) => t.key === appliedTemplate)?.label}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.key}
                onClick={() => applyTemplate(tpl)}
                disabled={appliedTemplate === tpl.key}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                  appliedTemplate === tpl.key
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 cursor-default'
                    : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="font-medium truncate">{tpl.label}</div>
                {tpl.indication && (
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{tpl.indication}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!templates.length && diseaseName && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 flex items-center gap-2">
          <span>ℹ️</span> No operative templates found for{' '}
          <span className="font-medium text-gray-700">{diseaseName}</span>. Fill in the fields manually.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📋 Pre-op Diagnosis</label>
          <input
            type="text"
            value={form.preOpDiagnosis}
            onChange={(e) => update('preOpDiagnosis', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📋 Post-op Diagnosis</label>
          <input
            type="text"
            value={form.postOpDiagnosis}
            onChange={(e) => update('postOpDiagnosis', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">🔧 Procedure</label>
          <input
            type="text"
            value={form.procedure}
            onChange={(e) => update('procedure', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
            placeholder="e.g. Exploratory Laparotomy, Sigmoid Colectomy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">👨‍⚕️ Surgeon</label>
          <input
            type="text"
            value={form.surgeon}
            onChange={(e) => update('surgeon', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🫱 Assistant</label>
          <input
            type="text"
            value={form.assistant}
            onChange={(e) => update('assistant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
            placeholder="(optional)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">💉 Anaesthesia</label>
          <input
            type="text"
            value={form.anaesthesia}
            onChange={(e) => update('anaesthesia', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Findings</label>
        <textarea
          value={form.findings}
          onChange={(e) => update('findings', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          rows={4}
          placeholder="Intra-operative findings..."
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">📝 Procedure Details</label>
          {appliedTemplate && (
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
              Templated — editable
            </span>
          )}
        </div>
        <textarea
          value={form.procedureDetails}
          onChange={(e) => update('procedureDetails', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          rows={8}
          placeholder="Step-by-step description..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🩸 Blood Loss</label>
          <select
            value={form.bloodLoss}
            onChange={(e) => update('bloodLoss', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          >
            {bloodLossOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🚪 Disposition</label>
          <select
            value={form.disposition}
            onChange={(e) => update('disposition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
          >
            {dispositionOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🧪 Specimens</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={specimenInput}
              onChange={(e) => setSpecimenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSpecimen()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
              placeholder="Add specimen (e.g. Sigmoid colon)"
            />
            <button
              onClick={addSpecimen}
              className="px-3 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              + Add
            </button>
          </div>
          {form.specimens.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No specimens added</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {form.specimens.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                >
                  {s}
                  <button
                    onClick={() => removeSpecimen(i)}
                    className="ml-0.5 text-blue-400 hover:text-blue-700 font-bold leading-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">⚠️ Complications</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={complicationInput}
              onChange={(e) => setComplicationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComplication()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-shadow"
              placeholder="Add complication (e.g. None)"
            />
            <button
              onClick={addComplication}
              className="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              + Add
            </button>
          </div>
          {form.complications.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No complications recorded</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {form.complications.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200"
                >
                  {c}
                  <button
                    onClick={() => removeComplication(i)}
                    className="ml-0.5 text-red-400 hover:text-red-700 font-bold leading-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <MedicalDocument
          title="Operative Note"
          patientName={patientName}
          patientId={patientId}
          unit={unitSlug}
          date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          noteText={preview}
          filename={`operative-${patientId}-${Date.now()}.pdf`}
        />
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          {showPreview ? '📄 Hide Preview' : '📄 Preview Note'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm transition-all"
        >
          {saving ? 'Saving...' : '💾 Save & Complete'}
        </button>
      </div>
    </div>
  );
}
