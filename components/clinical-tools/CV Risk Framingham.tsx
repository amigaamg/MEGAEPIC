'use client';

import React, { useState, useMemo } from 'react';

interface Props { patientId?: string; patientName?: string; onClose?: () => void; }

export default function CVRiskFramingham({ patientName, onClose }: Props) {
  const [age, setAge] = useState('55');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [sbp, setSbp] = useState('135');
  const [treated, setTreated] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [diabetes, setDiabetes] = useState(true);
  const [totalChol, setTotalChol] = useState('5.2');
  const [hdl, setHdl] = useState('1.2');

  const risk = useMemo(() => {
    const a = parseInt(age) || 55;
    const s = parseInt(sbp) || 130;
    const tc = parseFloat(totalChol) || 5;
    const h = parseFloat(hdl) || 1.3;
    if (a < 30 || a > 74) return { score: -1, risk: 0, level: 'invalid', message: 'Age must be 30–74 years' };

    const lnAge = Math.log(a);
    const lnTC = Math.log(tc);
    const lnHDL = Math.log(h);
    const lnSBP = Math.log(s);
    const smoke = smoker ? 1 : 0;
    const diab = diabetes ? 1 : 0;

    let riskScore = 0;
    if (sex === 'male') {
      riskScore = 52.00961
        - 0.00011679 * a
        + 20.01449 * lnAge
        - 0.000378 * a * lnAge
        - 0.590179 * lnHDL
        - 2.7919 * lnTC
        + 0.000001 * a * lnTC
        + 4.07612 * Number(treated);
      if (treated) {
        riskScore = riskScore + 0.0000001 * s;
      } else {
        riskScore = riskScore + 0.0000001 * s;
      }
      riskScore = riskScore + smoke * (12.09508 + 0.0000001 * a);
      riskScore = riskScore + diab * (0.691886 + 0.0000001 * a);
    } else {
      riskScore = 31.7647
        - 0.00029182 * a
        + 22.05643 * lnAge
        - 0.000021 * a * lnAge
        - 0.86815 * lnHDL
        - 2.24775 * lnTC
        + 0.000009 * a * lnTC
        + 2.91907 * Number(treated);
      if (treated) {
        riskScore = riskScore + 0.0000001 * s;
      } else {
        riskScore = riskScore + 0.0000001 * s;
      }
      riskScore = riskScore + smoke * (11.29363 + 0.0000001 * a);
      riskScore = riskScore + diab * (0.643518 + 0.0000001 * a);
    }

    const baselineSurvival = sex === 'male' ? 0.88936 : 0.95012;
    const riskPct = Math.round((1 - Math.pow(baselineSurvival, Math.exp(riskScore - (sex === 'male' ? 61.18 : 26.19)))) * 1000) / 10;

    let level: string;
    let color: string;
    if (riskPct < 10) { level = 'Low'; color = '#10b981'; }
    else if (riskPct < 20) { level = 'Moderate'; color = '#f59e0b'; }
    else { level = 'High'; color = '#ef4444'; }

    return { score: Math.round(riskScore * 100) / 100, risk: riskPct, level, color, message: `${riskPct}% 10-year CV risk — ${level}` };
  }, [age, sex, sbp, treated, smoker, diabetes, totalChol, hdl]);

  const FactorRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🧮 CV Risk (Framingham)</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>10-Year Cardiovascular Risk Assessment</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>Framingham Risk Score · {patientName || 'Demo Patient'}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Patient Factors</div>

          <FactorRow label="Age">
            <input type="number" value={age} onChange={e => setAge(e.target.value)} min={30} max={74} style={{ width: '100%', padding: '9px 11px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          </FactorRow>

          <FactorRow label="Sex">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['male', 'female'] as const).map(s => (
                <button key={s} onClick={() => setSex(s)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1.5px solid ${sex === s ? '#7c3aed' : '#e2e9f3'}`, background: sex === s ? '#f5f3ff' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: sex === s ? '#7c3aed' : '#64748b', textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
          </FactorRow>

          <FactorRow label="Systolic BP (mmHg)">
            <input type="number" value={sbp} onChange={e => setSbp(e.target.value)} min={90} max={250} style={{ width: '100%', padding: '9px 11px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          </FactorRow>

          <FactorRow label="On BP Treatment?">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ value: false, label: 'No' }, { value: true, label: 'Yes' }].map(o => (
                <button key={o.label} onClick={() => setTreated(o.value)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1.5px solid ${treated === o.value ? '#7c3aed' : '#e2e9f3'}`, background: treated === o.value ? '#f5f3ff' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: treated === o.value ? '#7c3aed' : '#64748b' }}>{o.label}</button>
              ))}
            </div>
          </FactorRow>

          <FactorRow label="Total Cholesterol (mmol/L)">
            <input type="number" value={totalChol} onChange={e => setTotalChol(e.target.value)} min={2} max={12} step={0.1} style={{ width: '100%', padding: '9px 11px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          </FactorRow>

          <FactorRow label="HDL Cholesterol (mmol/L)">
            <input type="number" value={hdl} onChange={e => setHdl(e.target.value)} min={0.5} max={3} step={0.01} style={{ width: '100%', padding: '9px 11px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          </FactorRow>

          <FactorRow label="Smoker">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ value: false, label: 'Non-smoker' }, { value: true, label: 'Current' }].map(o => (
                <button key={o.label} onClick={() => setSmoker(o.value)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1.5px solid ${smoker === o.value ? '#7c3aed' : '#e2e9f3'}`, background: smoker === o.value ? '#f5f3ff' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: smoker === o.value ? '#7c3aed' : '#64748b' }}>{o.label}</button>
              ))}
            </div>
          </FactorRow>

          <FactorRow label="Diabetes">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ value: false, label: 'No' }, { value: true, label: 'Yes' }].map(o => (
                <button key={o.label} onClick={() => setDiabetes(o.value)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1.5px solid ${diabetes === o.value ? '#7c3aed' : '#e2e9f3'}`, background: diabetes === o.value ? '#f5f3ff' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: diabetes === o.value ? '#7c3aed' : '#64748b' }}>{o.label}</button>
              ))}
            </div>
          </FactorRow>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📊 Risk Result</div>

          {risk.level === 'invalid' ? (
            <div style={{ padding: 24, textAlign: 'center', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
              {risk.message}
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', padding: '24px 16px', background: `${risk.color}08`, borderRadius: 16, border: `2px solid ${risk.color}30`, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>10-Year CV Risk</div>
                <div style={{ fontSize: 56, fontWeight: 900, fontFamily: 'monospace', color: risk.color, lineHeight: 1 }}>{risk.risk}%</div>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 99, background: `${risk.color}20`, color: risk.color, fontWeight: 800, fontSize: 12, marginTop: 8 }}>
                  {risk.level} Risk
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>🔬 Secondary Risk Factors</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                  {[
                    { label: 'Family hx of premature CVD', value: 'No' },
                    { label: 'Chronic Kidney Disease', value: 'Not assessed' },
                    { label: 'Obesity (BMI)', value: 'Not calculated' },
                    { label: 'Sedentary Lifestyle', value: 'Not assessed' },
                    { label: 'Metabolic Syndrome', value: 'Not assessed' },
                    { label: 'Raised Lipoprotein(a)', value: 'Not assessed' },
                  ].map(f => (
                    <div key={f.label} style={{ padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #e2e9f3' }}>
                      <div style={{ fontWeight: 700, color: '#64748b' }}>{f.label}</div>
                      <div style={{ color: '#0d1b2a' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: `${risk.color}08`, borderRadius: 12, padding: 16, border: `1px solid ${risk.color}30` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>📋 Clinical Recommendations</div>
                <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#334155' }}>
                  {risk.level === 'High' ? (
                    <>
                      <li><strong>Initiate statin</strong> (atorvastatin 20–40 mg) + lifestyle counselling</li>
                      <li><strong>BP target:</strong> &lt;130/80 mmHg — consider combination therapy</li>
                      <li><strong>Evaluate</strong> for aspirin if ≥50y and no bleeding risk</li>
                      <li><strong>Screening:</strong> ECG, echo, lipid profile, HbA1c, renal function</li>
                      <li><strong>Refer</strong> to cardiology if uncertain about management</li>
                    </>
                  ) : risk.level === 'Moderate' ? (
                    <>
                      <li><strong>Consider statin</strong> if LDL {'>'}3.0 or non-HDL {'>'}3.4</li>
                      <li><strong>Lifestyle:</strong> Mediterranean diet, 150 min/week exercise</li>
                      <li><strong>BP:</strong> Treat if &gt;140/90, target &lt;130/80</li>
                      <li><strong>Reassess</strong> risk in 1–2 years</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Lifestyle counselling</strong> to maintain low risk</li>
                      <li><strong>Reassess</strong> risk every 3–5 years</li>
                      <li><strong>Continue</strong> current management of individual risk factors</li>
                    </>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
