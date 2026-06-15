'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { LOCAL_EXAM_TEMPLATES } from '@/lib/history-engine/examination/localExaminationRegistry';
import type { LocalExaminations, LocalExaminationEntry } from '@/lib/history-engine/types';

const TEMPLATE_TYPES = ['swelling', 'ulcer', 'wound', 'fracture', 'burn', 'mass', 'sinus', 'abscess'] as const;

export default function LocalExaminationSection() {
  const localExaminations = useHistoryStore(s => s.localExaminations);
  const addLocalExamination = useHistoryStore(s => s.addLocalExamination);
  const updateLocalExamination = useHistoryStore(s => s.updateLocalExamination);
  const removeLocalExamination = useHistoryStore(s => s.removeLocalExamination);

  const [selectedType, setSelectedType] = useState<string>('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [description, setDescription] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const template = LOCAL_EXAM_TEMPLATES.find(t => t.type === selectedType);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const t = LOCAL_EXAM_TEMPLATES.find(tmpl => tmpl.type === type);
    if (t) {
      const initial: Record<string, string> = {};
      for (const f of t.fields) {
        initial[f.key] = '';
      }
      setFieldValues(initial);
    }
    setDescription('');
    setInterpretation('');
    setEditingId(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const handleAddOrUpdate = () => {
    if (!template) return;
    if (editingId) {
      updateLocalExamination(editingId, fieldValues, description, interpretation);
    } else {
      const entry: LocalExaminationEntry = {
        id: `local_${Date.now()}`,
        type: template.type,
        anatomicalSite: fieldValues.site || '',
        label: template.label,
        findings: { ...fieldValues },
        description,
        interpretation,
      };
      addLocalExamination(entry);
    }
    setSelectedType('');
    setFieldValues({});
    setDescription('');
    setInterpretation('');
    setEditingId(null);
  };

  const handleEdit = (entry: LocalExaminationEntry) => {
    setSelectedType(entry.type);
    const t = LOCAL_EXAM_TEMPLATES.find(tmpl => tmpl.type === entry.type);
    if (t) {
      const initial: Record<string, string> = {};
      for (const f of t.fields) {
        initial[f.key] = entry.findings[f.key] || '';
      }
      setFieldValues(initial);
    } else {
      setFieldValues({ ...entry.findings });
    }
    setDescription(entry.description);
    setInterpretation(entry.interpretation);
    setEditingId(entry.id);
  };

  const handleRemove = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setSelectedType('');
      setFieldValues({});
      setDescription('');
      setInterpretation('');
    }
    removeLocalExamination(id);
  };

  const handleCancel = () => {
    setSelectedType('');
    setFieldValues({});
    setDescription('');
    setInterpretation('');
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-orange-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Local Examination</h2>
      </div>

      <div>
        <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Examination Type</label>
        <select value={selectedType} onChange={e => handleTypeChange(e.target.value)}
          className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
          <option value="">-- Select type --</option>
          {TEMPLATE_TYPES.map(type => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
      </div>

      {template && (
        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">{template.label}</div>

          <div className="grid grid-cols-2 gap-3">
            {template.fields.map(f => (
              <div key={f.key}>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">{f.label}</label>
                <input type="text" value={fieldValues[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)}
                  placeholder={f.placeholder || ''}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
                placeholder="Overall description of findings..." />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">Interpretation</label>
              <textarea value={interpretation} onChange={e => setInterpretation(e.target.value)} rows={2}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
                placeholder="Clinical interpretation..." />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={handleAddOrUpdate}
              className="px-4 py-2 bg-[var(--accent-dim)] text-[var(--accent)] text-sm font-medium rounded-lg hover:opacity-80 transition-opacity">
              {editingId ? 'Update Examination' : 'Add Examination'}
            </button>
            {editingId && (
              <button onClick={handleCancel}
                className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium rounded-lg hover:bg-[var(--accent-dim)] transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {localExaminations.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Added Examinations</div>
          {localExaminations.map(entry => (
            <div key={entry.id}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--accent)] uppercase">{entry.type}</span>
                  <span className="text-xs text-[var(--text-muted)]">— {entry.label}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(entry)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] underline transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleRemove(entry.id)}
                    className="text-xs text-[var(--text-secondary)] hover:text-red-400 underline transition-colors">
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {entry.findings.site && (
                  <div><span className="text-[var(--text-muted)]">Site:</span> <span className="text-[var(--text-primary)]">{entry.findings.site}</span></div>
                )}
                {entry.findings.size && (
                  <div><span className="text-[var(--text-muted)]">Size:</span> <span className="text-[var(--text-primary)]">{entry.findings.size}</span></div>
                )}
              </div>
              {entry.description && (
                <div className="text-xs text-[var(--text-secondary)]">{entry.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
