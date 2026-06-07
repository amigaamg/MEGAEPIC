'use client';
import React, { useState, useMemo } from 'react';
import { generateDischargeSummary } from '@/engine/note-generator/surgery/discharge';
import { MedicalDocument } from '@/src/components/shared/MedicalDocument';

interface DischargeSummaryPhaseProps {
  patientName: string;
  patientId: string;
  unitSlug: string;
  diagnosis?: string;
  procedures?: string[];
  admissionDate?: number;
  onSave: (data: DischargeSummaryData) => Promise<void>;
  onComplete: () => void;
}

interface DischargeSummaryData {
  dischargeDate: number;
  admittingDiagnosis: string;
  finalDiagnosis: string;
  proceduresPerformed: string[];
  summaryOfAdmission: string;
  dischargeMedications: { drug: string; dose: string; frequency: string; duration: string }[];
  followUp: {
    appointmentDate?: string;
    location?: string;
    doctor?: string;
    interval?: string;
  };
  activityRestrictions: string[];
  dietInstructions: string;
  woundCareInstructions: string;
  redFlags: string[];
  dischargeCondition: 'improved' | 'stable' | 'transferred' | 'self_discharge' | 'deceased';
  reviewedBy: string;
  reviewedByName: string;
}

const DEFAULT_RED_FLAGS = [
  'Fever >38°C or chills',
  'Stoma becomes dark, purple, or stops working',
  'Severe abdominal pain',
  'Vomiting or unable to tolerate oral intake',
  'Wound discharge, redness, or breakdown',
  'No stoma output >12 hours',
  'Chest pain or shortness of breath',
];

const ACTIVITY_OPTIONS = [
  'No heavy lifting >5kg for 6 weeks',
  'Can resume light walking',
  'Can drive after 2 weeks',
];

const DISCHARGE_CONDITIONS: { value: DischargeSummaryData['dischargeCondition']; label: string }[] = [
  { value: 'improved', label: 'Improved' },
  { value: 'stable', label: 'Stable' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'self_discharge', label: 'Self-discharge' },
  { value: 'deceased', label: 'Deceased' },
];

export function DischargeSummaryPhase({
  patientName,
  patientId,
  unitSlug,
  diagnosis,
  procedures,
  admissionDate,
  onSave,
  onComplete,
}: DischargeSummaryPhaseProps) {
  const [form, setForm] = useState<DischargeSummaryData>({
    dischargeDate: Date.now(),
    admittingDiagnosis: diagnosis || '',
    finalDiagnosis: diagnosis || '',
    proceduresPerformed: procedures || [],
    summaryOfAdmission: '',
    dischargeMedications: [],
    followUp: {},
    activityRestrictions: [],
    dietInstructions: '',
    woundCareInstructions: '',
    redFlags: [...DEFAULT_RED_FLAGS],
    dischargeCondition: 'improved',
    reviewedBy: '',
    reviewedByName: '',
  });
  const [procedureInput, setProcedureInput] = useState('');
  const [customRedFlag, setCustomRedFlag] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const los = useMemo(() => {
    if (!admissionDate) return null;
    const diffMs = form.dischargeDate - admissionDate;
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  }, [admissionDate, form.dischargeDate]);

  const update = <K extends keyof DischargeSummaryData>(key: K, value: DischargeSummaryData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addProcedure = () => {
    if (!procedureInput.trim()) return;
    update('proceduresPerformed', [...form.proceduresPerformed, procedureInput.trim()]);
    setProcedureInput('');
  };

  const removeProcedure = (i: number) => {
    update('proceduresPerformed', form.proceduresPerformed.filter((_, j) => j !== i));
  };

  const addMedication = () => {
    update('dischargeMedications', [...form.dischargeMedications, { drug: '', dose: '', frequency: '', duration: '' }]);
  };

  const updateMedication = (i: number, field: string, value: string) => {
    update('dischargeMedications', form.dischargeMedications.map((m, j) => (j === i ? { ...m, [field]: value } : m)));
  };

  const removeMedication = (i: number) => {
    update('dischargeMedications', form.dischargeMedications.filter((_, j) => j !== i));
  };

  const toggleActivity = (activity: string) => {
    const exists = form.activityRestrictions.includes(activity);
    update('activityRestrictions', exists ? form.activityRestrictions.filter((a) => a !== activity) : [...form.activityRestrictions, activity]);
  };

  const addCustomActivity = () => {
    if (!customActivity.trim()) return;
    toggleActivity(customActivity.trim());
    setCustomActivity('');
  };

  const toggleRedFlag = (flag: string) => {
    const exists = form.redFlags.includes(flag);
    update('redFlags', exists ? form.redFlags.filter((f) => f !== flag) : [...form.redFlags, flag]);
  };

  const addCustomRedFlag = () => {
    if (!customRedFlag.trim()) return;
    toggleRedFlag(customRedFlag.trim());
    setCustomRedFlag('');
  };

  const updateFollowUp = (field: string, value: string) => {
    update('followUp', { ...form.followUp, [field]: value });
  };

  const dischargeSummary = useMemo(() => {
    if (!showPreview) return '';
    return generateDischargeSummary({
      patientName,
      patientId,
      unitSlug,
      primaryDiagnosis: form.finalDiagnosis,
      secondaryDiagnoses: form.admittingDiagnosis !== form.finalDiagnosis ? [form.admittingDiagnosis] : [],
      admissionDate: admissionDate ? new Date(admissionDate).toLocaleDateString() : '',
      dischargeDate: new Date(form.dischargeDate).toLocaleDateString(),
      proceduresPerformed: form.proceduresPerformed,
      hospitalCourse: form.summaryOfAdmission,
      dischargeMedications: form.dischargeMedications.map((m) => `${m.drug} ${m.dose} ${m.frequency} ${m.duration}`.trim()),
      dischargeInstructions: [
        ...form.activityRestrictions,
        form.dietInstructions && `Diet: ${form.dietInstructions}`,
        form.woundCareInstructions && `Wound care: ${form.woundCareInstructions}`,
      ].filter(Boolean) as string[],
      followUp: [form.followUp.interval, form.followUp.appointmentDate, form.followUp.location, form.followUp.doctor].filter(Boolean).join(', '),
      warningSigns: form.redFlags,
    });
  }, [showPreview, form, patientName, patientId, unitSlug, admissionDate]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, dischargeDate: Date.now() });
    onComplete();
    setSaving(false);
  };

  const fmtDate = (ts?: number) => (ts ? new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-xl p-5 border border-emerald-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚪</span>
          <h2 className="text-xl font-bold text-emerald-800">SURGICAL DISCHARGE SUMMARY</h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span className="font-semibold text-gray-800">👤 PATIENT: {patientName} ({patientId})</span>
          {admissionDate && <span className="text-gray-600">Admitted: {fmtDate(admissionDate)}</span>}
          <span className="text-gray-600">
            Discharge Date:{' '}
            <input
              type="date"
              value={new Date(form.dischargeDate).toISOString().split('T')[0]}
              onChange={(e) => update('dischargeDate', new Date(e.target.value).getTime())}
              className="border rounded px-2 py-0.5 text-sm"
            />
          </span>
          {los !== null && <span className="text-emerald-700 font-medium">Length of Stay: {los} day{los !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* Key Information */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Key Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Admitting Diagnosis</label>
            <input
              type="text" value={form.admittingDiagnosis}
              onChange={(e) => update('admittingDiagnosis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Final Diagnosis</label>
            <input
              type="text" value={form.finalDiagnosis}
              onChange={(e) => update('finalDiagnosis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Procedures Performed</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.proceduresPerformed.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                {p}
                <button onClick={() => removeProcedure(i)} className="hover:text-emerald-900">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text" value={procedureInput}
              onChange={(e) => setProcedureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProcedure()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Add a procedure..."
            />
            <button onClick={addProcedure} className="px-3 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium">
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Summary of Admission */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Summary of Admission</h3>
        <textarea
          value={form.summaryOfAdmission}
          onChange={(e) => update('summaryOfAdmission', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          rows={5}
          placeholder="Clinical narrative of admission, surgery, post-operative course, and current status..."
        />
      </div>

      {/* Discharge Medications */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Discharge Medications</h3>
        {form.dischargeMedications.length > 0 && (
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2 pr-2">Drug</th>
                  <th className="pb-2 pr-2">Dose</th>
                  <th className="pb-2 pr-2">Frequency</th>
                  <th className="pb-2 pr-2">Duration</th>
                  <th className="pb-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {form.dischargeMedications.map((med, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1.5 pr-2">
                      <input type="text" value={med.drug} onChange={(e) => updateMedication(i, 'drug', e.target.value)}
                        className="w-28 px-2 py-1 border border-gray-200 rounded text-sm" placeholder="Drug name" />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input type="text" value={med.dose} onChange={(e) => updateMedication(i, 'dose', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" placeholder="e.g. 625mg" />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input type="text" value={med.frequency} onChange={(e) => updateMedication(i, 'frequency', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" placeholder="e.g. TDS" />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input type="text" value={med.duration} onChange={(e) => updateMedication(i, 'duration', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" placeholder="e.g. 5/7" />
                    </td>
                    <td className="py-1.5">
                      <button onClick={() => removeMedication(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">&times;</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button onClick={addMedication} className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium">
          + Add Medication
        </button>
      </div>

      {/* Follow-Up */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Follow-Up</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Appointment Date</label>
            <input type="date" value={form.followUp.appointmentDate || ''}
              onChange={(e) => updateFollowUp('appointmentDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input type="text" value={form.followUp.location || ''}
              onChange={(e) => updateFollowUp('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Surgical Clinic" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Doctor</label>
            <input type="text" value={form.followUp.doctor || ''}
              onChange={(e) => updateFollowUp('doctor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Dr. Consultant" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Follow-up Interval</label>
            <input type="text" value={form.followUp.interval || ''}
              onChange={(e) => updateFollowUp('interval', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 2 weeks" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Instructions</h3>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">Activity Restrictions</label>
          <div className="space-y-1.5 mb-2">
            {ACTIVITY_OPTIONS.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.activityRestrictions.includes(a)}
                  onChange={() => toggleActivity(a)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                {a}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customActivity} onChange={(e) => setCustomActivity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomActivity()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Custom activity restriction..." />
            <button onClick={addCustomActivity} className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">+</button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Diet Instructions</label>
          <textarea value={form.dietInstructions} onChange={(e) => update('dietInstructions', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2}
            placeholder="Soft diet, small frequent meals. Avoid constipation. High protein for wound healing." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Wound Care Instructions</label>
          <textarea value={form.woundCareInstructions} onChange={(e) => update('woundCareInstructions', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2}
            placeholder="Clean stoma with warm water daily. Change bag every 3 days or when leaking. Monitor for redness around stoma." />
        </div>
      </div>

      {/* Red Flags */}
      <div className="border border-red-200 rounded-xl p-4 bg-red-50">
        <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">⚠ RED FLAGS — Return to Hospital If</h3>
        <div className="space-y-1.5 mb-2">
          {DEFAULT_RED_FLAGS.map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.redFlags.includes(f)} onChange={() => toggleRedFlag(f)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
              {f}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={customRedFlag} onChange={(e) => setCustomRedFlag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomRedFlag()}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" placeholder="+ Custom red flag..." />
          <button onClick={addCustomRedFlag} className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium">+</button>
        </div>
      </div>

      {/* Discharge Condition */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Discharge Condition</h3>
        <div className="flex flex-wrap gap-3">
          {DISCHARGE_CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="dischargeCondition" checked={form.dischargeCondition === c.value}
                onChange={() => update('dischargeCondition', c.value)}
                className="text-emerald-600 focus:ring-emerald-500" />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      {/* Reviewed By */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Review</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reviewed By (ID)</label>
            <input type="text" value={form.reviewedBy} onChange={(e) => update('reviewedBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Dr. Surgeon" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name (Full)</label>
            <input type="text" value={form.reviewedByName} onChange={(e) => update('reviewedByName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Full name" />
          </div>
        </div>
      </div>

      {/* Preview */}
      {showPreview && dischargeSummary && (
        <MedicalDocument
          title="Discharge Summary"
          patientName={patientName}
          patientId={patientId}
          unit={unitSlug}
          date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          noteText={dischargeSummary}
          filename={`discharge-${patientId}-${Date.now()}.pdf`}
        />
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button onClick={() => setShowPreview(!showPreview)}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          {showPreview ? 'Hide Preview' : '📄 Preview Discharge Summary'}
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : 'Save & Complete'}
        </button>
      </div>
    </div>
  );
}
