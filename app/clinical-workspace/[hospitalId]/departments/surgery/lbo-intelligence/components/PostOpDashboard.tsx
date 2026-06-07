/**
 * Post-Operative Monitoring Dashboard
 *
 * Displays dynamic post-op alerts: stoma output, anastomotic leak risk,
 * AKI detection, wound assessment, and recovery milestones.
 */
'use client';
import React from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export interface PostOpData {
  pod: number; // post-operative day
  vitals: { hr: number; sbp: number; temp: number; rr: number; spo2: number };
  stoma: { outputMl24h: number; colour: string; functioning: boolean };
  wound: { condition: string; infectionSigns: boolean; discharge: string };
  drains: { outputMl24h: number; fluidCharacter: string };
  labs: { wbc: number; crp: number; lactate: number; creatinine: number };
  painScore: number;
  mobility: 'bedridden' | 'assisted' | 'independent';
  diet: 'nil' | 'sips' | 'soft' | 'full';
  bowelsOpen: boolean;
  flatusPassing: boolean;
  antibiotics: boolean;
  dvtProphylaxis: boolean;
}

export const EMPTY_POSTOP: PostOpData = {
  pod: 1,
  vitals: { hr: 80, sbp: 120, temp: 37.0, rr: 16, spo2: 98 },
  stoma: { outputMl24h: 0, colour: 'pink', functioning: false },
  wound: { condition: 'clean', infectionSigns: false, discharge: 'none' },
  drains: { outputMl24h: 0, fluidCharacter: 'serous' },
  labs: { wbc: 0, crp: 0, lactate: 0, creatinine: 0 },
  painScore: 3,
  mobility: 'bedridden',
  diet: 'nil',
  bowelsOpen: false,
  flatusPassing: false,
  antibiotics: true,
  dvtProphylaxis: true,
};

interface PostOpDashboardProps {
  data: PostOpData;
  onChange: (data: PostOpData) => void;
}

// ── Alert helpers ──────────────────────────────────────────────────────────

function calculateAlerts(data: PostOpData): { type: 'critical' | 'warning' | 'info'; message: string }[] {
  const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];

  // Leak detection
  const tachycardic = data.vitals.hr > 100;
  const febrile = data.vitals.temp > 38;
  if (tachycardic && febrile && data.pod >= 3) {
    alerts.push({ type: 'critical', message: `POD ${data.pod}: Tachycardia + fever — SUSPECT ANASTOMOTIC LEAK. Urgent surgical review.` });
  } else if (tachycardic && febrile) {
    alerts.push({ type: 'warning', message: 'Tachycardia + fever — monitor for sepsis, consider leak.' });
  }

  // Stoma
  if (data.stoma.functioning && data.stoma.outputMl24h > 1500) {
    alerts.push({ type: 'warning', message: `High-output stoma: ${data.stoma.outputMl24h} mL/24h. Monitor electrolytes, consider loperamide.` });
  }
  if (data.stoma.colour === 'dark' || data.stoma.colour === 'purple' || data.stoma.colour === 'black') {
    alerts.push({ type: 'critical', message: `Stoma colour: ${data.stoma.colour.toUpperCase()} — SUSPECT STOMA ISCHAEMIA. Immediate surgical review.` });
  }

  // AKI
  if (data.labs.creatinine > 110) {
    alerts.push({ type: 'warning', message: `Creatinine ${data.labs.creatinine} — AKI risk. Monitor urine output, consider fluid challenge.` });
  }

  // Wound
  if (data.wound.infectionSigns) {
    alerts.push({ type: 'warning', message: `Wound infection signs: ${data.wound.discharge}. Wound swab, start antibiotics.` });
  }

  // Sepsis
  if (data.labs.wbc > 15 && data.labs.crp > 100) {
    alerts.push({ type: 'warning', message: `WBC ${data.labs.wbc}, CRP ${data.labs.crp} — concerning for sepsis.` });
  }

  // Recovery milestones
  if (data.pod >= 5 && !data.bowelsOpen && !data.flatusPassing) {
    alerts.push({ type: 'warning', message: `POD ${data.pod}: No bowel function yet — prolonged ileus. Consider prokinetics.` });
  }
  if (data.pod >= 3 && data.diet === 'nil') {
    alerts.push({ type: 'info', message: `POD ${data.pod}: Consider starting sips if bowel sounds present.` });
  }
  if (data.pod >= 5 && data.mobility === 'bedridden') {
    alerts.push({ type: 'warning', message: `POD ${data.pod}: Patient still bedridden — encourage mobilisation, DVT risk.` });
  }

  // DVT
  if (!data.dvtProphylaxis && data.pod >= 1) {
    alerts.push({ type: 'critical', message: 'No DVT prophylaxis — START LMWH + TED stockings.' });
  }

  return alerts;
}

function RecoveryChecklist({ data }: { data: PostOpData }) {
  const checks = [
    { label: 'Vitals stable', pass: data.vitals.hr < 100 && data.vitals.sbp > 90 && data.vitals.temp < 38 },
    { label: 'Stoma functioning', pass: data.stoma.functioning },
    { label: 'Wound healing', pass: !data.wound.infectionSigns },
    { label: 'Pain controlled', pass: data.painScore <= 4 },
    { label: 'Mobilising', pass: data.mobility !== 'bedridden' },
    { label: 'Tolerating diet', pass: data.diet !== 'nil' },
    { label: 'Passing flatus', pass: data.flatusPassing },
    { label: 'DVT prophylaxis', pass: data.dvtProphylaxis },
    { label: 'Antibiotics given', pass: data.antibiotics },
    { label: 'Drain output normal', pass: data.drains.outputMl24h < 200 },
  ];

  const passed = checks.filter(c => c.pass).length;

  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Recovery Checklist ({passed}/{checks.length})</p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c, i) => (
          <div key={i} className={`flex items-center gap-1 text-xs ${c.pass ? 'text-green-600' : 'text-red-500'}`}>
            <span>{c.pass ? '✅' : '⏳'}</span>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PostOpDashboard({ data, onChange }: PostOpDashboardProps) {
  const set = <K extends keyof PostOpData>(k: K, v: PostOpData[K]) => onChange({ ...data, [k]: v });
  const setV = <K extends keyof PostOpData['vitals']>(k: K, v: number) => onChange({ ...data, vitals: { ...data.vitals, [k]: v } });
  const setStoma = <K extends keyof PostOpData['stoma']>(k: K, v: any) => onChange({ ...data, stoma: { ...data.stoma, [k]: v } });
  const setWound = <K extends keyof PostOpData['wound']>(k: K, v: any) => onChange({ ...data, wound: { ...data.wound, [k]: v } });
  const setDrain = <K extends keyof PostOpData['drains']>(k: K, v: any) => onChange({ ...data, drains: { ...data.drains, [k]: v } });
  const setLabs = <K extends keyof PostOpData['labs']>(k: K, v: any) => onChange({ ...data, labs: { ...data.labs, [k]: v } });

  const alerts = calculateAlerts(data);

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1">
          {alerts.map((a, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg text-xs font-medium ${
              a.type === 'critical' ? 'bg-red-100 border border-red-200 text-red-800' :
              a.type === 'warning' ? 'bg-amber-100 border border-amber-200 text-amber-800' :
              'bg-blue-100 border border-blue-200 text-blue-800'
            }`}>
              {a.type === 'critical' ? '🚨 ' : a.type === 'warning' ? '⚠️ ' : 'ℹ️ '}{a.message}
            </div>
          ))}
        </div>
      )}

      {/* Vitals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'HR', key: 'hr', value: data.vitals.hr, color: data.vitals.hr > 100 ? 'red' : 'green' },
          { label: 'SBP', key: 'sbp', value: data.vitals.sbp, color: data.vitals.sbp < 90 ? 'red' : 'green' },
          { label: 'Temp', key: 'temp', value: data.vitals.temp, color: data.vitals.temp > 38 ? 'red' : 'green', step: '0.1' },
          { label: 'RR', key: 'rr', value: data.vitals.rr, color: data.vitals.rr > 20 ? 'red' : 'green' },
          { label: 'SpO2', key: 'spo2', value: data.vitals.spo2, color: data.vitals.spo2 < 95 ? 'red' : 'green' },
        ].map(m => (
          <div key={m.key} className={`border rounded-lg p-2 text-center ${m.color === 'red' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <p className="text-[10px] text-gray-500 uppercase">{m.label}</p>
            <input type="number" step={m.step || '1'} value={m.value}
              onChange={e => setV(m.key as any, parseFloat(e.target.value) || 0)}
              className="w-full text-center text-lg font-bold bg-transparent border-none outline-none" />
          </div>
        ))}
      </div>

      {/* POD selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Post-Op Day:</span>
        {[1,2,3,4,5,6,7,8,9,10].map(d => (
          <button key={d} onClick={() => set('pod', d)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition ${
              data.pod === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{d}</button>
        ))}
      </div>

      {/* Grid: Stoma, Wound, Drains */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stoma */}
        <div className="border border-gray-200 rounded-xl p-3">
          <h4 className="text-xs font-bold text-gray-700 mb-2">Stoma</h4>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs"><span className="w-20 text-gray-500">Output 24h:</span>
              <input type="number" value={data.stoma.outputMl24h} onChange={e => setStoma('outputMl24h', parseInt(e.target.value) || 0)} className="border border-gray-300 rounded px-1.5 py-0.5 w-20" /> mL
            </label>
            <label className="flex items-center gap-2 text-xs"><span className="w-20 text-gray-500">Colour:</span>
              <select value={data.stoma.colour} onChange={e => setStoma('colour', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                {['pink','red','dark','purple','black'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={data.stoma.functioning} onChange={e => setStoma('functioning', e.target.checked)} className="w-4 h-4" /> Functioning</label>
          </div>
        </div>

        {/* Wound */}
        <div className="border border-gray-200 rounded-xl p-3">
          <h4 className="text-xs font-bold text-gray-700 mb-2">Wound</h4>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs"><span className="w-20 text-gray-500">Condition:</span>
              <select value={data.wound.condition} onChange={e => setWound('condition', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                {['clean','dry','erythematous','indurated','dehisced'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={data.wound.infectionSigns} onChange={e => setWound('infectionSigns', e.target.checked)} className="w-4 h-4" /> Infection signs</label>
            <label className="flex items-center gap-2 text-xs"><span className="w-20 text-gray-500">Discharge:</span>
              <input value={data.wound.discharge} onChange={e => setWound('discharge', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs flex-1" placeholder="None/serous/purulent" />
            </label>
          </div>
        </div>

        {/* Drains */}
        <div className="border border-gray-200 rounded-xl p-3">
          <h4 className="text-xs font-bold text-gray-700 mb-2">Drains</h4>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs"><span className="w-24 text-gray-500">Output 24h:</span>
              <input type="number" value={data.drains.outputMl24h} onChange={e => setDrain('outputMl24h', parseInt(e.target.value) || 0)} className="border border-gray-300 rounded px-1.5 py-0.5 w-20" /> mL
            </label>
            <label className="flex items-center gap-2 text-xs"><span className="w-24 text-gray-500">Fluid:</span>
              <select value={data.drains.fluidCharacter} onChange={e => setDrain('fluidCharacter', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                {['serous','serosanguinous','bloody','purulent','faeculent'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Labs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'WBC', key: 'wbc', value: data.labs.wbc, normal: '<11' },
          { label: 'CRP', key: 'crp', value: data.labs.crp, normal: '<5' },
          { label: 'Lactate', key: 'lactate', value: data.labs.lactate, normal: '<2' },
          { label: 'Creatinine', key: 'creatinine', value: data.labs.creatinine, normal: '<110' },
        ].map(m => {
          const abnormal = (m.key === 'wbc' && m.value > 11) || (m.key === 'crp' && m.value > 50) || (m.key === 'lactate' && m.value > 2) || (m.key === 'creatinine' && m.value > 110);
          return (
            <div key={m.key} className={`border rounded-lg p-2 ${abnormal ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <p className="text-[10px] text-gray-500 uppercase">{m.label} <span className="text-gray-400">({m.normal})</span></p>
              <input type="number" step="0.1" value={m.value}
                onChange={e => setLabs(m.key as any, parseFloat(e.target.value) || 0)}
                className={`w-full text-sm font-bold bg-transparent border-none outline-none ${abnormal ? 'text-red-700' : 'text-gray-700'}`} />
            </div>
          );
        })}
      </div>

      {/* Recovery status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <label className="flex items-center gap-2 text-xs"><span className="text-gray-500">Pain:</span>
          <input type="range" min={0} max={10} value={data.painScore} onChange={e => set('painScore', parseInt(e.target.value))} className="flex-1" />
          <span className="font-bold w-4">{data.painScore}</span>
        </label>
        <label className="flex items-center gap-2 text-xs"><span className="text-gray-500">Mobility:</span>
          <select value={data.mobility} onChange={e => set('mobility', e.target.value as any)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs">
            {['bedridden','assisted','independent'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs"><span className="text-gray-500">Diet:</span>
          <select value={data.diet} onChange={e => set('diet', e.target.value as any)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs">
            {['nil','sips','soft','full'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1"><input type="checkbox" checked={data.bowelsOpen} onChange={e => set('bowelsOpen', e.target.checked)} className="w-3.5 h-3.5" /> Bowels</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={data.flatusPassing} onChange={e => set('flatusPassing', e.target.checked)} className="w-3.5 h-3.5" /> Flatus</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={data.antibiotics} onChange={e => set('antibiotics', e.target.checked)} className="w-3.5 h-3.5" /> Abx</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={data.dvtProphylaxis} onChange={e => set('dvtProphylaxis', e.target.checked)} className="w-3.5 h-3.5" /> DVT</label>
        </div>
      </div>

      {/* Recovery Checklist */}
      <RecoveryChecklist data={data} />

      {/* Discharge readiness */}
      {alerts.filter(a => a.type === 'critical').length === 0 && data.pod >= 5 && data.mobility === 'independent' && data.diet !== 'nil' && data.stoma.functioning && (
        <div className="p-3 bg-green-100 border border-green-200 rounded-xl text-sm text-green-800 font-bold">
          ✅ Patient meets discharge criteria. Consider discharge planning.
        </div>
      )}
    </div>
  );
}
