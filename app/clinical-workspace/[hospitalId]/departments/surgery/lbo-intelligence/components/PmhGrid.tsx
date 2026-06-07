/**
 * Structured PMH Grid — replaces free-text PMH with a condition grid
 * with severity sliders. Pre-tagged LBO risk factors are highlighted.
 */
'use client';
import React from 'react';

export interface PmhCondition {
  id: string;
  label: string;
  present: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  note: string;
  riskFactor: boolean;
  riskLabel?: string;
}

const DEFAULT_CONDITIONS: PmhCondition[] = [
  { id: 'diabetes', label: 'Diabetes mellitus', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Affects motility, infection risk' },
  { id: 'ckd', label: 'Chronic kidney disease', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Electrolyte imbalance, ileus risk' },
  { id: 'ihd', label: 'Ischaemic heart disease / CHF', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Fluid management critical' },
  { id: 'constipation', label: 'Chronic constipation', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Major risk factor for volvulus' },
  { id: 'psychiatric', label: 'Psychiatric illness', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Anticholinergic meds → ileus' },
  { id: 'connective_tissue', label: 'Connective tissue disease', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Scleroderma → pseudo-obstruction' },
  { id: 'hypertension', label: 'Hypertension', present: false, severity: 'none', note: '', riskFactor: false },
  { id: 'copd', label: 'COPD / Asthma', present: false, severity: 'none', note: '', riskFactor: false },
  { id: 'liver_disease', label: 'Chronic liver disease', present: false, severity: 'none', note: '', riskFactor: false },
  { id: 'cancer_history', label: 'Previous malignancy', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Suspected obstruction cause' },
  { id: 'diverticular', label: 'Diverticular disease', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Stricture → obstruction' },
  { id: 'ibd', label: 'Inflammatory bowel disease', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Stricture → obstruction' },
  { id: 'parkinsons', label: "Parkinson's disease", present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Constipation common in PD' },
  { id: 'hypothyroid', label: 'Hypothyroidism', present: false, severity: 'none', note: '', riskFactor: false },
  { id: 'obesity', label: 'Obesity', present: false, severity: 'none', note: '', riskFactor: true, riskLabel: 'Increases abdominal pressure' },
];

interface PmhGridProps {
  conditions: PmhCondition[];
  onChange: (conditions: PmhCondition[]) => void;
}

const SEVERITY_OPTIONS: { value: PmhCondition['severity']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export function PmhGrid({ conditions, onChange }: PmhGridProps) {
  const toggle = (id: string) => {
    onChange(conditions.map(c => c.id === id ? { ...c, present: !c.present } : c));
  };
  const setSeverity = (id: string, severity: PmhCondition['severity']) => {
    onChange(conditions.map(c => c.id === id ? { ...c, severity, present: severity !== 'none' } : c));
  };
  const setNote = (id: string, note: string) => {
    onChange(conditions.map(c => c.id === id ? { ...c, note } : c));
  };

  const presentConditions = conditions.filter(c => c.present || c.severity !== 'none');
  const absentConditions = conditions.filter(c => !c.present && c.severity === 'none');

  return (
    <div className="space-y-3">
      {presentConditions.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Present Conditions</p>
          <div className="space-y-1">
            {presentConditions.map(c => (
              <div key={c.id} className={`flex items-center gap-2 p-2 rounded-lg border ${c.riskFactor ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200 bg-gray-50'}`}>
                <button onClick={() => toggle(c.id)} className="text-red-400 hover:text-red-600 text-xs font-bold w-5 h-5 rounded-full border border-red-300 flex items-center justify-center" title="Remove">✕</button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{c.label}</span>
                    {c.riskFactor && <span className="text-[10px] text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full font-bold">RISK FACTOR</span>}
                  </div>
                  {c.riskLabel && <p className="text-[10px] text-amber-700">{c.riskLabel}</p>}
                </div>
                <select value={c.severity} onChange={e => setSeverity(c.id, e.target.value as any)}
                  className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white">
                  {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <input value={c.note} onChange={e => setNote(c.id, e.target.value)} placeholder="Details" className="text-xs border border-gray-200 rounded px-2 py-1 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick-add absent conditions */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Add Condition</p>
        <div className="flex flex-wrap gap-1">
          {absentConditions.map(c => (
            <button key={c.id} onClick={() => toggle(c.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                c.riskFactor ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-100'
              }`}>
              + {c.label}
              {c.riskFactor && ' ⚠️'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_CONDITIONS };
