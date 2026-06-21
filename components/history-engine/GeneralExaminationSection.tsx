'use client';
import { useEffect, useMemo } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import GENERAL_EXAMINATION_REGISTRY from '@/lib/history-engine/examination/generalExaminationRegistry';
import { ADAPTIVE_FINDINGS } from '@/lib/history-engine/examination/systemicExamAdaptiveEngine';

const APPEARANCE_OPTIONS = [
  'well looking', 'ill looking', 'toxic', 'cachectic',
  'pale', 'jaundiced', 'cyanosed', 'plethoric',
];

const HYDRATION_STATUSES = [
  { value: '' as const, label: '-- Select --' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'mild_dehydration' as const, label: 'Mild Dehydration' },
  { value: 'moderate_dehydration' as const, label: 'Moderate Dehydration' },
  { value: 'severe_dehydration' as const, label: 'Severe Dehydration' },
];

const NUTRITION_STATUSES = [
  { value: '' as const, label: '-- Select --' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'underweight' as const, label: 'Underweight' },
  { value: 'wasted' as const, label: 'Wasted' },
  { value: 'obese' as const, label: 'Obese' },
];

const CONSCIOUSNESS_LEVELS = [
  { value: '' as const, label: '-- Select --' },
  { value: 'alert' as const, label: 'Alert' },
  { value: 'drowsy' as const, label: 'Drowsy' },
  { value: 'confused' as const, label: 'Confused' },
  { value: 'unresponsive' as const, label: 'Unresponsive' },
];

const DISTRESS_OPTIONS = [
  { key: 'pain' as const, label: 'Pain' },
  { key: 'respiratory' as const, label: 'Respiratory' },
  { key: 'cardiovascular' as const, label: 'Cardiovascular' },
  { key: 'neurological' as const, label: 'Neurological' },
];

const VITAL_FIELDS: { key: keyof import('@/lib/history-engine/types').Vitals; label: string; unit: string; min?: number; max?: number; step?: number }[] = [
  { key: 'temperature', label: 'Temperature', unit: '℃', min: 30, max: 45, step: 0.1 },
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', min: 20, max: 250 },
  { key: 'respiratoryRate', label: 'Respiratory Rate', unit: 'breaths/min', min: 4, max: 80 },
  { key: 'bloodPressureSystolic', label: 'BP Systolic', unit: 'mmHg', min: 50, max: 300 },
  { key: 'bloodPressureDiastolic', label: 'BP Diastolic', unit: 'mmHg', min: 20, max: 200 },
  { key: 'oxygenSaturation', label: 'SpO₂', unit: '%', min: 50, max: 100 },
  { key: 'bloodSugar', label: 'Blood Sugar', unit: 'mmol/L', min: 0, max: 50, step: 0.1 },
  { key: 'weight', label: 'Weight', unit: 'kg', min: 0, max: 500, step: 0.1 },
  { key: 'height', label: 'Height', unit: 'cm', min: 0, max: 300 },
  { key: 'painScore', label: 'Pain Score', unit: '0-10', min: 0, max: 10 },
];

function RadioGroup<T extends string>({ options, value, onChange, name }: {
  options: { value: T; label: string }[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const selected = value === opt.value;
        return (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${selected
              ? 'bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'}`}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function GeneralExaminationSection() {
  const exam = useHistoryStore(s => s.generalExamination);
  const setAppearance = useHistoryStore(s => s.setAppearance);
  const setVital = useHistoryStore(s => s.setVital);
  const setHydrationStatus = useHistoryStore(s => s.setHydrationStatus);
  const setNutritionalStatus = useHistoryStore(s => s.setNutritionalStatus);
  const setConsciousness = useHistoryStore(s => s.setConsciousness);
  const setDistress = useHistoryStore(s => s.setDistress);
  const setGeneralSign = useHistoryStore(s => s.setGeneralSign);

  const vitals = exam.vitals;

  const bmi = useMemo(() => {
    if (vitals.weight && vitals.height && vitals.height > 0) {
      const hInM = vitals.height / 100;
      return Math.round((vitals.weight / (hInM * hInM)) * 100) / 100;
    }
    return null;
  }, [vitals.weight, vitals.height]);

  useEffect(() => {
    const currentBmi = vitals.bmi;
    if (bmi !== null && bmi !== currentBmi) {
      setVital('bmi', bmi);
    }
  }, [bmi, vitals.bmi, setVital]);

  const handleVitalChange = (key: keyof typeof vitals, raw: string) => {
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      setVital(key, val);
    }
  };

  const handleHydrationStatus = (status: 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration') => {
    setHydrationStatus(status, exam.hydration.dryMucosa, exam.hydration.sunkenEyes, exam.hydration.reducedSkinTurgor);
  };

  const handleSignPresent = (signId: string, label: string, present: boolean) => {
    const existing = exam.generalSigns.find(s => s.id === signId);
    setGeneralSign(signId, label, present, existing?.details || '');
  };

  const handleSignDetails = (signId: string, label: string, details: string) => {
    const existing = exam.generalSigns.find(s => s.id === signId);
    setGeneralSign(signId, label, existing?.present || false, details);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">General Examination</h2>
      </div>

      {/* Step 1: Appearance */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 1 — Appearance</h3>
        <RadioGroup
          options={APPEARANCE_OPTIONS.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ') }))}
          value={exam.appearance.appearance || null}
          onChange={setAppearance}
          name="appearance"
        />
      </div>

      {/* Step 2: Vitals */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 2 — Vital Signs</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {VITAL_FIELDS.map(field => (
            <div key={field.key as string}>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                {field.label} <span className="text-[var(--text-muted)]">({field.unit})</span>
              </label>
              <input type="number"
                value={vitals[field.key] ?? ''}
                onChange={e => handleVitalChange(field.key as keyof typeof vitals, e.target.value)}
                min={field.min} max={field.max} step={field.step ?? 1}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Anthropometry — BMI */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 3 — Anthropometry (BMI)</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-[var(--text-secondary)]">Weight: </span>
            <span className="text-[var(--text-primary)] font-medium">{vitals.weight ?? '—'} kg</span>
          </div>
          <div className="text-sm">
            <span className="text-[var(--text-secondary)]">Height: </span>
            <span className="text-[var(--text-primary)] font-medium">{vitals.height ?? '—'} cm</span>
          </div>
          <div className="text-sm px-4 py-2 rounded-lg bg-[var(--accent-dim)]">
            <span className="text-[var(--text-secondary)]">BMI: </span>
            <span className="text-[var(--accent)] font-bold">{bmi !== null ? bmi.toFixed(1) : '—'}</span>
          </div>
          {bmi !== null && (
            <div className="text-xs text-[var(--text-muted)]">
              ({bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'})
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Hydration */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 4 — Hydration Status</h3>
        <RadioGroup
          options={HYDRATION_STATUSES}
          value={exam.hydration.status}
          onChange={(s) => { setHydrationStatus(s, exam.hydration.dryMucosa, exam.hydration.sunkenEyes, exam.hydration.reducedSkinTurgor); }}
          name="hydration"
        />
        <div className="flex flex-wrap gap-4 mt-2">
          {([
            { key: 'dryMucosa' as const, label: 'Dry Mucosa' },
            { key: 'sunkenEyes' as const, label: 'Sunken Eyes' },
            { key: 'reducedSkinTurgor' as const, label: 'Reduced Skin Turgor' },
          ]).map(item => (
            <label key={item.key} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox"
                checked={exam.hydration[item.key]}
                onChange={e => {
                  const h = exam.hydration;
                  const newVal = e.target.checked;
                  const dryMucosa = item.key === 'dryMucosa' ? newVal : h.dryMucosa;
                  const sunkenEyes = item.key === 'sunkenEyes' ? newVal : h.sunkenEyes;
                  const reducedSkinTurgor = item.key === 'reducedSkinTurgor' ? newVal : h.reducedSkinTurgor;
                  setHydrationStatus(h.status, dryMucosa, sunkenEyes, reducedSkinTurgor);
                }}
                className="accent-teal-500" />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* Step 5: Nutritional Status */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 5 — Nutritional Status</h3>
        <RadioGroup
          options={NUTRITION_STATUSES}
          value={exam.nutrition.status}
          onChange={setNutritionalStatus}
          name="nutrition"
        />
      </div>

      {/* Step 6: Consciousness */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 6 — Level of Consciousness</h3>
        <RadioGroup
          options={CONSCIOUSNESS_LEVELS}
          value={exam.consciousness.level}
          onChange={(level) => setConsciousness(level, exam.consciousness.gcs)}
          name="consciousness"
        />
        <div className="mt-2">
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">GCS Score</label>
          <input type="number"
            value={exam.consciousness.gcs ?? ''}
            onChange={e => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              if (val !== null && (val < 3 || val > 15)) return;
              setConsciousness(exam.consciousness.level, val);
            }}
            min={3} max={15}
            className="w-24 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-teal-500" />
        </div>
      </div>

      {/* Step 7: Distress */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 7 — Distress Assessment</h3>
        <div className="flex flex-wrap gap-4">
          {DISTRESS_OPTIONS.map(opt => (
            <label key={opt.key} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox"
                checked={exam.distress[opt.key]}
                onChange={e => {
                  const d = exam.distress;
                  const val = e.target.checked;
                  setDistress(
                    opt.key === 'pain' ? val : d.pain,
                    opt.key === 'respiratory' ? val : d.respiratory,
                    opt.key === 'cardiovascular' ? val : d.cardiovascular,
                    opt.key === 'neurological' ? val : d.neurological,
                  );
                }}
                className="accent-teal-500" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Step 8: General Signs */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Step 8 — General Signs</h3>
        <div className="space-y-2">
          {GENERAL_EXAMINATION_REGISTRY.map(sign => {
            const existing = exam.generalSigns.find(s => s.id === sign.id);
            const present = existing?.present ?? false;
            const details = existing?.details ?? '';
            return (
              <div key={sign.id} className="flex items-center gap-3 py-1.5 border-b border-[var(--border)] last:border-b-0">
                <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer min-w-[180px]">
                  <input type="checkbox"
                    checked={present}
                    onChange={e => handleSignPresent(sign.id, sign.label, e.target.checked)}
                    className="accent-teal-500" />
                  <span className="text-[var(--text-primary)]">{sign.label}</span>
                </label>
                <input type="text"
                  value={details}
                  onChange={e => handleSignDetails(sign.id, sign.label, e.target.value)}
                  placeholder="Details..."
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
