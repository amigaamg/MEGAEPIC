'use client';
import React, { useState } from 'react';
import type { WardRoundEntry } from '@/types/encounter';
import { generateWardRoundNote } from '@/engine/note-generator/surgery/wardRound';
import { MedicalDocument } from '@/src/components/shared/MedicalDocument';

interface WardRoundPhaseProps {
  existingRounds: WardRoundEntry[];
  onSave: (data: Omit<WardRoundEntry, 'id' | 'version'>) => Promise<void>;
  onComplete: () => void;
  authorName?: string;
  patientName?: string;
  patientId?: string;
  unitSlug?: string;
  encounterStatus?: string;
  timeSinceAdmission?: number;
  timeSinceSurgery?: number;
}

const OVERNIGHT_OPTIONS = [
  { key: 'noSignificant', label: 'No significant events' },
  { key: 'painManaged', label: 'Pain managed with oral analgesia' },
  { key: 'vomited', label: 'Vomited \u00d71' },
  { key: 'catheterOutput', label: 'Catheter output adequate' },
  { key: 'requiredOxygen', label: 'Required oxygen overnight' },
  { key: 'calledNurse', label: 'Called for nursing assistance' },
] as const;

const PLAN_OPTIONS = [
  { key: 'continueAbx', label: 'Continue IV antibiotics' },
  { key: 'removeCatheter', label: 'Remove catheter today' },
  { key: 'advanceDiet', label: 'Advance to soft diet' },
  { key: 'mobilize', label: 'Mobilize to chair' },
  { key: 'reviewCultures', label: 'Review cultures' },
  { key: 'dvtProphylaxis', label: 'DVT prophylaxis' },
] as const;

interface OvernightEvents {
  noSignificant: boolean;
  painManaged: boolean;
  vomited: boolean;
  catheterOutput: boolean;
  requiredOxygen: boolean;
  calledNurse: boolean;
  other: string;
}

interface VitalsState {
  hr: string;
  bpSystolic: string;
  bpDiastolic: string;
  temp: string;
  rr: string;
  spo2: string;
  uop: string;
}

interface ExamState {
  abdomen: string;
  wound: string;
  drains: string;
  bowelSounds: string;
}

interface PlanState {
  continueAbx: boolean;
  removeCatheter: boolean;
  advanceDiet: boolean;
  mobilize: boolean;
  reviewCultures: boolean;
  dvtProphylaxis: boolean;
  other: string;
}

function formatOvernight(events: OvernightEvents): string {
  const selected: string[] = [];
  for (const opt of OVERNIGHT_OPTIONS) {
    if (events[opt.key]) selected.push(opt.label);
  }
  if (events.other.trim()) selected.push(events.other.trim());
  return selected.length > 0 ? selected.join('; ') : 'Not documented';
}

function formatVitals(v: VitalsState): string {
  const parts: string[] = [];
  if (v.hr) parts.push(`HR: ${v.hr} bpm`);
  if (v.bpSystolic && v.bpDiastolic) parts.push(`BP: ${v.bpSystolic}/${v.bpDiastolic}`);
  if (v.temp) parts.push(`Temp: ${v.temp}\u00b0C`);
  if (v.rr) parts.push(`RR: ${v.rr} /min`);
  if (v.spo2) parts.push(`SpO2: ${v.spo2}%`);
  if (v.uop) parts.push(`UOP: ${v.uop}`);
  return parts.length > 0 ? parts.join(', ') : 'Not recorded';
}

function formatExam(e: ExamState): string {
  const parts: string[] = [];
  if (e.abdomen.trim()) parts.push(`Abdomen: ${e.abdomen.trim()}`);
  if (e.wound.trim()) parts.push(`Wound: ${e.wound.trim()}`);
  if (e.drains.trim()) parts.push(`Drains: ${e.drains.trim()}`);
  if (e.bowelSounds.trim()) parts.push(`Bowel sounds: ${e.bowelSounds.trim()}`);
  return parts.length > 0 ? parts.join('\n') : 'Examination not documented';
}

function formatPlan(p: PlanState): string {
  const selected: string[] = [];
  for (const opt of PLAN_OPTIONS) {
    if (p[opt.key]) selected.push(`- [ ] ${opt.label}`);
  }
  if (p.other.trim()) selected.push(`- [ ] ${p.other.trim()}`);
  return selected.length > 0 ? selected.join('\n') : 'Plan pending';
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function calcPostOpDay(hours?: number): string | null {
  if (hours == null || hours < 0) return null;
  const day = Math.floor(hours / 24) + 1;
  return `Post-Op Day ${day}`;
}

export function WardRoundPhase({
  existingRounds, onSave, onComplete,
  authorName = 'Dr. Clinician', patientName, patientId, unitSlug,
  timeSinceSurgery,
}: WardRoundPhaseProps) {
  const [overnightEvents, setOvernightEvents] = useState<OvernightEvents>({
    noSignificant: false, painManaged: false, vomited: false,
    catheterOutput: false, requiredOxygen: false, calledNurse: false, other: '',
  });
  const [subjective, setSubjective] = useState('');
  const [vitals, setVitals] = useState<VitalsState>({
    hr: '', bpSystolic: '', bpDiastolic: '', temp: '', rr: '', spo2: '', uop: '',
  });
  const [exam, setExam] = useState<ExamState>({
    abdomen: '', wound: '', drains: '', bowelSounds: '',
  });
  const [recentResults, setRecentResults] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState<PlanState>({
    continueAbx: false, removeCatheter: false, advanceDiet: false,
    mobilize: false, reviewCultures: false, dvtProphylaxis: false, other: '',
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewNote, setPreviewNote] = useState('');

  const version = existingRounds.length + 1;
  const postOpDay = calcPostOpDay(timeSinceSurgery);

  const buildObjective = () => {
    const sections: string[] = [];
    const vitalsStr = formatVitals(vitals);
    if (vitalsStr !== 'Not recorded') sections.push(vitalsStr);
    sections.push(formatExam(exam));
    if (recentResults.trim()) sections.push(`Recent results: ${recentResults.trim()}`);
    return sections.join('\n\n');
  };

  const buildPlan = () => {
    const parts: string[] = [formatPlan(plan)];
    return parts.join('\n');
  };

  const handleToggleOvernight = (key: keyof OvernightEvents) => {
    if (key === 'other') return;
    setOvernightEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePlan = (key: keyof PlanState) => {
    if (key === 'other') return;
    setPlan((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreview = () => {
    setShowPreview((p) => !p);
    if (!showPreview) {
      const note = generateWardRoundNote({
        patientName: patientName || 'Patient',
        patientId: patientId || '',
        unitSlug: unitSlug || '',
        date: new Date().toLocaleDateString('en-GB'),
        subjective: [formatOvernight(overnightEvents), subjective].filter(Boolean).join('\n'),
        objective: buildObjective(),
        assessment: assessment || 'Clinical impression...',
        plan: buildPlan(),
        author: authorName,
        version,
        vitals: {
          bp: vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : 'Not recorded',
          hr: vitals.hr ? Number(vitals.hr) : 0,
          rr: vitals.rr ? Number(vitals.rr) : 0,
          temp: vitals.temp ? Number(vitals.temp) : 0,
          spo2: vitals.spo2 ? Number(vitals.spo2) : 0,
        },
      });
      setPreviewNote(note);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      date: Date.now(),
      subjective: [formatOvernight(overnightEvents), subjective].filter(Boolean).join('\n'),
      objective: buildObjective(),
      assessment: assessment || 'Assessment pending',
      plan: buildPlan(),
      author: authorName,
    });
    onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ward Round #{version}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateTime(Date.now())}{postOpDay ? ` \u00b7 ${postOpDay}` : ''}
          </p>
        </div>
        {postOpDay && (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            {postOpDay}
          </span>
        )}
      </div>

      {existingRounds.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            Previous rounds ({existingRounds.length})
          </summary>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {[...existingRounds].reverse().map((r) => (
              <div key={r.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  v{r.version} \u2014 {formatDateTime(r.date)} by {r.author}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{r.assessment}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="grid grid-cols-1 gap-5">
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-base" role="img" aria-label="clipboard">\ud83d\udccb</span> Overnight Events
          </h5>
          <div className="space-y-2">
            {OVERNIGHT_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overnightEvents[opt.key as keyof OvernightEvents] as boolean}
                  onChange={() => handleToggleOvernight(opt.key as keyof OvernightEvents)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                {opt.label}
              </label>
            ))}
            <input
              type="text"
              value={overnightEvents.other}
              onChange={(e) => setOvernightEvents((prev) => ({ ...prev, other: e.target.value }))}
              placeholder="Other events..."
              className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-base" role="img" aria-label="speech">\ud83d\udde3</span> Subjective
          </h5>
          <textarea
            value={subjective}
            onChange={(e) => setSubjective(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y"
            rows={3}
            placeholder="&ldquo;Pain is much better today. Feeling hungry.&rdquo;"
          />
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-base" role="img" aria-label="microscope">\ud83d\udd2c</span> Vitals &amp; Objective
          </h5>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {[
              { label: 'HR', key: 'hr', placeholder: 'bpm' },
              { label: 'BP (Syst)', key: 'bpSystolic', placeholder: 'Syst' },
              { label: 'BP (Dias)', key: 'bpDiastolic', placeholder: 'Dias' },
              { label: 'Temp', key: 'temp', placeholder: '\u00b0C' },
              { label: 'RR', key: 'rr', placeholder: '/min' },
              { label: 'SpO2', key: 'spo2', placeholder: '%' },
              { label: 'UOP', key: 'uop', placeholder: 'mL/24h' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                <input
                  type="text"
                  value={vitals[field.key as keyof VitalsState]}
                  onChange={(e) => setVitals((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Abdomen', key: 'abdomen', placeholder: 'Soft, non-tender' },
              { label: 'Wound', key: 'wound', placeholder: 'Clean, dry, intact' },
              { label: 'Drains', key: 'drains', placeholder: '30 mL serous' },
              { label: 'Bowel Sounds', key: 'bowelSounds', placeholder: 'Present' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                <input
                  type="text"
                  value={exam[field.key as keyof ExamState]}
                  onChange={(e) => setExam((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-base" role="img" aria-label="chart">\ud83d\udcca</span> Recent Results
          </h5>
          <textarea
            value={recentResults}
            onChange={(e) => setRecentResults(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y"
            rows={2}
            placeholder="WBC 8.2 (normal) \u00b7 Hb 11.1 \u00b7 CRP 24 (trending down)"
          />
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-base" role="img" aria-label="brain">\ud83e\udde0</span> Assessment
          </h5>
          <textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y"
            rows={3}
            placeholder="Improving post-op course. No signs of anastomotic leak. Wound healing well."
          />
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-base" role="img" aria-label="clipboard">\ud83d\udccb</span> Plan
          </h5>
          <div className="space-y-2">
            {PLAN_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={plan[opt.key as keyof PlanState] as boolean}
                  onChange={() => handleTogglePlan(opt.key as keyof PlanState)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                {opt.label}
              </label>
            ))}
            <input
              type="text"
              value={plan.other}
              onChange={(e) => setPlan((prev) => ({ ...prev, other: e.target.value }))}
              placeholder="Other actions..."
              className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        </section>
      </div>

      {showPreview && previewNote && (
        <MedicalDocument
          title="Ward Round Note"
          patientName={patientName || 'Unknown'}
          patientId={patientId || ''}
          unit={unitSlug || ''}
          date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          noteText={previewNote}
          filename={`ward-round-${patientId || 'unknown'}-${Date.now()}.pdf`}
        />
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePreview}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
        >
          {showPreview ? 'Hide Preview' : 'Preview Note'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Ward Round'}
        </button>
      </div>
    </div>
  );
}
