'use client';
import { useClinical } from '@/src/store/ClinicalContext';

export function VitalsCard() {
  const { state, setVitals } = useClinical();
  const { vitals } = state;

  const handleChange = (key: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setVitals({ [key]: num });
    }
  };

  const vitalsFields: Array<{ key: keyof typeof vitals; label: string; unit: string; normal: string }> = [
    { key: 'spo2', label: 'SpO₂', unit: '%', normal: '≥95%' },
    { key: 'rr', label: 'Respiratory Rate', unit: '/min', normal: '20–40' },
    { key: 'hr', label: 'Heart Rate', unit: '/min', normal: '80–140' },
    { key: 'temp', label: 'Temperature', unit: '°C', normal: '36.5–37.5' },
    { key: 'weight', label: 'Weight', unit: 'kg', normal: '—' },
    { key: 'muac', label: 'MUAC', unit: 'cm', normal: '≥12.5' },
    { key: 'bpSystolic', label: 'BP Systolic', unit: 'mmHg', normal: '—' },
    { key: 'bpDiastolic', label: 'BP Diastolic', unit: 'mmHg', normal: '—' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Vital Signs</h4>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {vitalsFields.map(field => (
          <div key={field.key}>
            <label className="text-[9px] font-medium text-gray-400 uppercase">{field.label}</label>
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="number"
                value={vitals[field.key] ?? ''}
                onChange={e => handleChange(field.key, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
                placeholder={field.normal}
                step="any"
              />
              <span className="text-[9px] text-gray-400">{field.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AVPU Select */}
      <div className="mt-3">
        <label className="text-[9px] font-medium text-gray-400 uppercase">AVPU</label>
        <select
          value={vitals.avpu || 'alert'}
          onChange={e => setVitals({ avpu: e.target.value as any })}
          className="w-full mt-0.5 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 bg-white"
        >
          <option value="alert">Alert</option>
          <option value="voice">Responds to Voice</option>
          <option value="pain">Responds to Pain</option>
          <option value="unresponsive">Unresponsive</option>
        </select>
      </div>
    </div>
  );
}
