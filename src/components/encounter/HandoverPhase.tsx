'use client';
import React, { useState } from 'react';
import { MedicalDocument } from '@/src/components/shared/MedicalDocument';

export interface HandoverData {
  handoverDate: number;
  diagnosis: string;
  currentStatus: string;
  vitalsSummary: string;
  pendingLabs: string[];
  pendingImaging: string[];
  outstandingTasks: string[];
  escalationConcerns: string[];
  medicationsToNote: string[];
  planForNextShift: string;
  codeStatus: 'full' | 'NFR/DNR' | 'limited' | undefined;
  reviewedBy: string;
  reviewedByName: string;
}

interface HandoverPhaseProps {
  patientName: string;
  patientId: string;
  unitSlug: string;
  diagnosis?: string;
  encounterStatus?: string;
  onSave: (data: HandoverData) => Promise<void>;
  onComplete: () => void;
}

function generateHandoverNote(data: HandoverData, patientName: string, patientId: string, unitSlug: string): string {
  const codeLabel =
    data.codeStatus === 'full' ? 'Full Code' :
    data.codeStatus === 'NFR/DNR' ? 'NFR/DNR' :
    data.codeStatus === 'limited' ? 'Limited Resuscitation' : 'Not specified';

  return [
    `SURGICAL HANDOVER NOTE`,
    `Patient: ${patientName} (MRN: ${patientId}) · Unit: ${unitSlug}`,
    `Date: ${new Date(data.handoverDate).toLocaleString()}`,
    `Diagnosis: ${data.diagnosis}`,
    `Status: ${data.currentStatus}`,
    ``,
    `VITALS SUMMARY`,
    data.vitalsSummary,
    ``,
    `PENDING`,
    [...data.pendingLabs.map((l) => `  - Lab: ${l}`), ...data.pendingImaging.map((i) => `  - Imaging: ${i}`)].join('\n'),
    ``,
    `OUTSTANDING TASKS`,
    data.outstandingTasks.map((t) => `  [ ] ${t}`).join('\n'),
    ``,
    `ESCALATION CONCERNS`,
    data.escalationConcerns.map((c) => `  - ${c}`).join('\n') || '  None',
    ``,
    `MEDICATIONS TO NOTE`,
    data.medicationsToNote.map((m) => `  - ${m}`).join('\n') || '  None',
    ``,
    `PLAN FOR NEXT SHIFT`,
    data.planForNextShift,
    ``,
    `CODE STATUS: ${codeLabel}`,
    `Reviewed by: ${data.reviewedByName} (${data.reviewedBy})`,
  ].join('\n');
}

export function HandoverPhase(props: HandoverPhaseProps) {
  const { patientName, patientId, unitSlug, diagnosis, encounterStatus, onSave, onComplete } = props;

  const [form, setForm] = useState<HandoverData>({
    handoverDate: Date.now(),
    diagnosis: diagnosis ?? '',
    currentStatus: '',
    vitalsSummary: '',
    pendingLabs: [],
    pendingImaging: [],
    outstandingTasks: [],
    escalationConcerns: [],
    medicationsToNote: [],
    planForNextShift: '',
    codeStatus: undefined,
    reviewedBy: '',
    reviewedByName: '',
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newLab, setNewLab] = useState('');
  const [newImaging, setNewImaging] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newConcern, setNewConcern] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const update = <K extends keyof HandoverData>(key: K, value: HandoverData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addListItem = (field: keyof HandoverData, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const arr = form[field] as string[];
    update(field, [...arr, value.trim()] as HandoverData[typeof field]);
    setter('');
  };

  const removeListItem = (field: keyof HandoverData, index: number) => {
    const arr = form[field] as string[];
    update(
      field,
      arr.filter((_, i) => i !== index) as HandoverData[typeof field],
    );
  };

  const toggleTask = (index: number) => {
    const items = [...form.outstandingTasks];
    const task = items[index];
    if (task.startsWith('✓ ')) {
      items[index] = task.slice(2);
    } else {
      items[index] = `✓ ${task}`;
    }
    update('outstandingTasks', items);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, handoverDate: Date.now() });
    onComplete();
    setSaving(false);
  };

  const previewNote = showPreview ? generateHandoverNote(form, patientName, patientId, unitSlug) : '';

  const sectionHeader = (icon: string, title: string, accent = 'amber') => (
    <div className={`flex items-center gap-2 px-4 py-2 bg-${accent}-50 border-b border-${accent}-200 rounded-t-lg`}>
      <span className="text-base">{icon}</span>
      <span className={`text-sm font-semibold text-${accent}-800`}>{title}</span>
    </div>
  );

  const addRemoveList = (
    icon: string,
    title: string,
    field: keyof HandoverData,
    inputValue: string,
    setInput: (v: string) => void,
    placeholder: string,
    accent = 'amber',
  ) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {sectionHeader(icon, title, accent)}
      <div className="p-3 space-y-2">
        {(form[field] as string[]).map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 rounded group">
            <span className="flex-1">{item}</span>
            <button
              onClick={() => removeListItem(field, i)}
              className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addListItem(field, inputValue, setInput)}
            className="flex-1 px-3 py-1.5 border rounded text-sm"
            placeholder={placeholder}
          />
          <button
            onClick={() => addListItem(field, inputValue, setInput)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* PATIENT BANNER */}
      <div className="border border-amber-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200">
          <span className="text-base">⚡</span>
          <span className="text-sm font-semibold text-amber-800">SURGICAL HANDOVER</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">👤</span>
            <span className="font-medium text-gray-900">{patientName}</span>
            <span className="text-sm text-gray-500">· MRN: {patientId}</span>
          </div>
          {(diagnosis || form.diagnosis) && (
            <p className="text-sm text-gray-600 ml-8">Diagnosis: {form.diagnosis || diagnosis}</p>
          )}
          {encounterStatus && (
            <p className="text-sm text-gray-600 ml-8">Status: {encounterStatus}</p>
          )}
        </div>
      </div>

      {/* CURRENT STATUS */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {sectionHeader('📋', 'CURRENT STATUS')}
        <div className="p-3">
          <textarea
            value={form.currentStatus}
            onChange={(e) => update('currentStatus', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm resize-y"
            rows={4}
            placeholder="Hemodynamically stable. Afebrile. Abdomen soft. Wound clean. Tolerating sips of water..."
          />
        </div>
      </div>

      {/* VITALS SUMMARY */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {sectionHeader('🔬', 'VITALS SUMMARY')}
        <div className="p-3">
          <textarea
            value={form.vitalsSummary}
            onChange={(e) => update('vitalsSummary', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm resize-y"
            rows={2}
            placeholder="HR 80, BP 130/75, Temp 37.0, SpO2 97%"
          />
        </div>
      </div>

      {/* PENDING LABS & IMAGING */}
      <div className="space-y-3">
        {addRemoveList('🧪', 'PENDING LABS', 'pendingLabs', newLab, setNewLab, 'Add pending lab...', 'blue')}
        {addRemoveList('📡', 'PENDING IMAGING', 'pendingImaging', newImaging, setNewImaging, 'Add pending imaging...', 'purple')}
      </div>

      {/* OUTSTANDING TASKS */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {sectionHeader('📋', 'OUTSTANDING TASKS')}
        <div className="p-3 space-y-2">
          {form.outstandingTasks.map((task, i) => {
            const completed = task.startsWith('✓ ');
            return (
              <div key={i} className="flex items-center gap-2 group">
                <button
                  onClick={() => toggleTask(i)}
                  className={`w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors ${
                    completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {completed && '✓'}
                </button>
                <span className={`flex-1 text-sm ${completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {completed ? task.slice(2) : task}
                </span>
                <button
                  onClick={() => removeListItem('outstandingTasks', i)}
                  className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            );
          })}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addListItem('outstandingTasks', newTask, setNewTask)}
              className="flex-1 px-3 py-1.5 border rounded text-sm"
              placeholder="Add task..."
            />
            <button
              onClick={() => addListItem('outstandingTasks', newTask, setNewTask)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ESCALATION CONCERNS */}
      {addRemoveList('⚠', 'ESCALATION CONCERNS', 'escalationConcerns', newConcern, setNewConcern, 'Add concern...', 'red')}

      {/* MEDICATIONS TO NOTE */}
      {addRemoveList('💊', 'MEDICATIONS TO NOTE', 'medicationsToNote', newMedication, setNewMedication, 'Add medication...', 'green')}

      {/* PLAN FOR NEXT SHIFT */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {sectionHeader('📝', 'PLAN FOR NEXT SHIFT')}
        <div className="p-3">
          <textarea
            value={form.planForNextShift}
            onChange={(e) => update('planForNextShift', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm resize-y"
            rows={4}
            placeholder="Monitor urine output closely. If &lt;30 mL/hr for 2 hours, call reg. Review cultures..."
          />
        </div>
      </div>

      {/* CODE STATUS */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {sectionHeader('🛑', 'CODE STATUS', 'red')}
        <div className="p-3">
          <div className="flex gap-4">
            {(['full', 'NFR/DNR', 'limited'] as const).map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="codeStatus"
                  checked={form.codeStatus === status}
                  onChange={() => update('codeStatus', status)}
                  className="accent-amber-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  {status === 'full' ? 'Full Code' : status === 'NFR/DNR' ? 'NFR/DNR' : 'Limited'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWED BY */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By (ID)</label>
          <input
            type="text"
            value={form.reviewedBy}
            onChange={(e) => update('reviewedBy', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="e.g. dr123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By (Name)</label>
          <input
            type="text"
            value={form.reviewedByName}
            onChange={(e) => update('reviewedByName', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="e.g. Dr. Smith"
          />
        </div>
      </div>

      {/* PREVIEW */}
      {showPreview && previewNote && (
        <MedicalDocument
          title="Surgical Handover Note"
          patientName={patientName}
          patientId={patientId}
          unit={unitSlug}
          date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          noteText={previewNote}
          filename={`handover-${patientId}-${Date.now()}.pdf`}
        />
      )}

      {/* ACTIONS */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          {showPreview ? 'Hide Preview' : 'Preview Note'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? 'Saving...' : 'Save & Complete Handover'}
        </button>
      </div>
    </div>
  );
}
