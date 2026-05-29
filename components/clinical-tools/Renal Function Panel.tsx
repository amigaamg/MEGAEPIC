'use client';

import React, { useState, useMemo } from 'react';

interface Props { patientName?: string; onClose?: () => void; }

interface RenalResult {
  creatinine: number;  // umol/L
  urea: number;        // mmol/L
  egfr: number;        // mL/min/1.73m²
  sodium: number;      // mmol/L
  potassium: number;   // mmol/L
  chloride?: number;
  bicarbonate?: number;
  acr?: number;        // mg/mmol
}

const DEMO_RESULT: RenalResult = { creatinine: 98, urea: 5.2, egfr: 72, sodium: 138, potassium: 4.3, chloride: 102, bicarbonate: 24, acr: 2.1 };

export default function RenalFunctionPanel({ patientName, onClose }: Props) {
  const [result, setResult] = useState<RenalResult>(DEMO_RESULT);
  const [ordered, setOrdered] = useState(false);

  const ckdStage = useMemo(() => {
    if (result.egfr >= 90) return { stage: 'G1', label: 'Normal', color: '#10b981' };
    if (result.egfr >= 60) return { stage: 'G2', label: 'Mildly decreased', color: '#f59e0b' };
    if (result.egfr >= 45) return { stage: 'G3a', label: 'Mild-moderate', color: '#f97316' };
    if (result.egfr >= 30) return { stage: 'G3b', label: 'Moderate-severe', color: '#ef4444' };
    if (result.egfr >= 15) return { stage: 'G4', label: 'Severely decreased', color: '#dc2626' };
    return { stage: 'G5', label: 'Kidney failure', color: '#7f1d1d' };
  }, [result.egfr]);

  const potassiumAlert = result.potassium > 5.0 ? { color: '#ef4444', label: 'Hyperkalaemia', action: 'Hold ACEi/ARB, Check ECG, Urgent' } :
    result.potassium > 4.5 ? { color: '#f59e0b', label: 'Borderline high', action: 'Monitor, reassess in 1 week' } :
    result.potassium < 3.5 ? { color: '#ef4444', label: 'Hypokalaemia', action: 'Replace K+, check diuretic dose' } :
    { color: '#10b981', label: 'Normal', action: 'No action needed' };

  const update = (key: keyof RenalResult, value: string) => {
    const v = parseFloat(value);
    if (!isNaN(v)) setResult(r => ({ ...r, [key]: v }));
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#059669,#34d399)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🧪 Order Renal Function Panel</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Creatinine, eGFR, Electrolytes</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || 'Demo Patient'} · Pre-filled demo values</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Input */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Lab Values</div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
            {[
              { key: 'creatinine', label: 'Creatinine', unit: 'µmol/L', min: 20, max: 1500 },
              { key: 'urea', label: 'Urea', unit: 'mmol/L', min: 1, max: 50, step: 0.1 },
              { key: 'egfr', label: 'eGFR (CKD-EPI)', unit: 'mL/min/1.73m²', min: 5, max: 150 },
              { key: 'sodium', label: 'Sodium', unit: 'mmol/L', min: 100, max: 180 },
              { key: 'potassium', label: 'Potassium', unit: 'mmol/L', min: 1, max: 9, step: 0.1 },
              { key: 'chloride', label: 'Chloride', unit: 'mmol/L', min: 70, max: 130 },
              { key: 'bicarbonate', label: 'Bicarbonate', unit: 'mmol/L', min: 5, max: 50 },
              { key: 'acr', label: 'Urine ACR', unit: 'mg/mmol', min: 0.1, max: 500, step: 0.1 },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span>{f.label}</span><span style={{ color: '#059669' }}>{f.unit}</span>
                </label>
                <input type="number" value={(result as any)[f.key]} onChange={e => update(f.key as keyof RenalResult, e.target.value)} min={f.min} max={f.max} step={f.step || 1} style={{ width: '100%', padding: '8px 10px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', fontWeight: 700, outline: 'none' }} />
              </div>
            ))}
            <button onClick={() => setOrdered(true)} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>
              {ordered ? '✅ Order Sent' : '🧪 Order Renal Panel'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📊 Assessment</div>

          {/* eGFR */}
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0', marginBottom: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase' }}>eGFR</div>
            <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', color: ckdStage.color }}>{result.egfr}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>CKD Stage <strong style={{ color: ckdStage.color }}>{ckdStage.stage}</strong> — {ckdStage.label}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ padding: '3px 10px', borderRadius: 99, background: `${ckdStage.color}20`, color: ckdStage.color, fontSize: 10, fontWeight: 700 }}>{ckdStage.stage}: {ckdStage.label}</span>
            </div>
          </div>

          {/* Potassium alert */}
          <div style={{ background: `${potassiumAlert.color}08`, borderRadius: 12, padding: 16, border: `1px solid ${potassiumAlert.color}30`, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .5 }}>Potassium</div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: potassiumAlert.color }}>{result.potassium} <span style={{ fontSize: 12, fontWeight: 600, color: '#8fa3bd' }}>mmol/L</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ padding: '3px 8px', borderRadius: 99, background: `${potassiumAlert.color}20`, color: potassiumAlert.color, fontSize: 10, fontWeight: 700 }}>{potassiumAlert.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Action: {potassiumAlert.action}</div>
          </div>

          {/* Nephrology recommendations */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>🩺 Clinical Recommendations</div>
            <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#334155' }}>
              {result.egfr < 60 && <li>⚠️ eGFR &lt;60 — CKD present. Use CKD-EPI equation for accurate staging.</li>}
              {result.potassium > 5.0 && <li>🚨 Hold ACEi/ARB, spironolactone. Check ECG for T-wave changes.</li>}
              {result.acr && result.acr > 3 && <li>📊 Urine ACR elevated — albuminuria present (risk factor for progression).</li>}
              {result.egfr < 45 && <li>Refer to nephrology if eGFR &lt;30 or rapidly declining.</li>}
              <li>Repeat renal function in {result.egfr < 60 ? '3' : '6–12'} months</li>
              <li>Maintain BP &lt;130/80 &lt;130/80 mmHg</li>
              <li>Use CI-AKI risk score before contrast imaging</li>
            </ul>
          </div>

          {/* Drug dose adjustment */}
          <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', marginBottom: 8 }}>💊 Drug Dose Adjustment for eGFR</div>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #fde68a' }}><th style={{ textAlign: 'left', padding: '4px 6px', color: '#92400e' }}>Drug</th><th style={{ textAlign: 'left', padding: '4px 6px', color: '#92400e' }}>eGFR-based Dose</th></tr></thead>
              <tbody>
                {[
                  ['Metformin', result.egfr < 30 ? 'Contraindicated' : result.egfr < 45 ? 'Max 500mg BID' : 'Standard'],
                  ['Empagliflozin', result.egfr < 20 ? 'Not recommended' : result.egfr < 30 ? '10mg if tolerated' : '10-25mg OD'],
                  ['Ramipril', 'Adjust if eGFR ↓ >30% or K+ >5.5'],
                  ['Spironolactone', result.egfr < 30 ? 'Not recommended' : result.egfr < 45 ? '12.5mg OD' : '25-50mg'],
                  ['Apixaban', result.egfr < 25 ? 'Avoid' : 'Standard dose'],
                ].map(([drug, dose]) => (
                  <tr key={drug as string} style={{ borderBottom: '1px solid #fde68a' }}>
                    <td style={{ padding: '4px 6px', fontWeight: 700, color: '#92400e' }}>{drug}</td>
                    <td style={{ padding: '4px 6px', color: '#92400e' }}>{dose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
