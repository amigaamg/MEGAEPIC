'use client';

import React, { useState, useMemo } from 'react';

interface Props { patientName?: string; onClose?: () => void; }

const SCORE_ITEMS = [
  { key: 'chf', label: 'C: Congestive HF / LV dysfunction', weight: 1 },
  { key: 'htn', label: 'H: Hypertension', weight: 1 },
  { key: 'age65_74', label: 'A₂: Age 65–74 years', weight: 1 },
  { key: 'age75', label: 'A₂: Age ≥75 years', weight: 2 },
  { key: 'diabetes', label: 'D: Diabetes mellitus', weight: 1 },
  { key: 'stroke', label: 'S₂: Stroke / TIA / Thromboembolism', weight: 2 },
  { key: 'vascular', label: 'V: Vascular disease (PAD, MI, aortic plaque)', weight: 1 },
  { key: 'female', label: 'Sc: Sex category (Female)', weight: 1 },
];

export default function CHA2DS2VASc({ patientName, onClose }: Props) {
  const [scores, setScores] = useState<Record<string, boolean>>({
    chf: false, htn: false, age65_74: false, age75: false,
    diabetes: false, stroke: false, vascular: false, female: false,
  });
  const [anticoagulation, setAnticoagulation] = useState<'none' | 'warfarin' | 'dabigatran' | 'rivaroxaban' | 'apixaban' | 'edoxaban'>('none');

  const total = useMemo(() => SCORE_ITEMS.reduce((sum, item) => sum + (scores[item.key] ? item.weight : 0), 0), [scores]);

  const recommendation = useMemo(() => {
    if (total === 0) return { level: 'Low', color: '#10b981', message: 'Low stroke risk (0.2%/y). No antithrombotic therapy recommended.', action: 'Reassess annually' };
    if (total === 1) return { level: 'Low-Moderate', color: '#f59e0b', message: `Moderate stroke risk (${total === 1 ? '0.6' : '2.2'}%/y). Consider OAC based on bleeding risk (HAS-BLED).`, action: 'Consider OAC, assess HAS-BLED' };
    if (total === 2) return { level: 'Moderate', color: '#f97316', message: `Stroke risk ${total === 2 ? '2.2' : '3.2'}%/y. Oral anticoagulation recommended.`, action: 'Start OAC (DOAC preferred over warfarin)' };
    return { level: 'High', color: '#ef4444', message: `High stroke risk (${total >= 8 ? '6.7' : '4.8'}%/y). Oral anticoagulation strongly recommended.`, action: 'Start OAC — DOAC first line unless mechanical valve/ valvular AF' };
  }, [total]);

  const toggle = (key: string) => setScores(s => ({ ...s, [key]: !s[key] }));

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🧮 CHA₂DS₂-VASc Score</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Stroke Risk in Atrial Fibrillation</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>ESC 2020 AF Guidelines · {patientName || 'Demo Patient'}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Risk Factors</div>
          {SCORE_ITEMS.map(item => (
            <div key={item.key} onClick={() => toggle(item.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${scores[item.key] ? '#0891b2' : '#e2e9f3'}`, background: scores[item.key] ? '#e0f7fa' : '#f8fafc', cursor: 'pointer', marginBottom: 6, transition: 'all .12s' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: scores[item.key] ? '#0891b2' : '#e2e9f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>{scores[item.key] ? '✓' : item.weight}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: scores[item.key] ? 700 : 500, color: '#0d1b2a' }}>{item.label}</div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 6 }}>Current Anticoagulation</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['none', 'warfarin', 'dabigatran', 'rivaroxaban', 'apixaban', 'edoxaban'] as const).map(a => (
                <button key={a} onClick={() => setAnticoagulation(a)} style={{ padding: '5px 11px', borderRadius: 99, border: `1.5px solid ${anticoagulation === a ? '#0891b2' : '#e2e9f3'}`, background: anticoagulation === a ? '#e0f7fa' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: anticoagulation === a ? '#0891b2' : '#64748b', textTransform: 'capitalize' }}>
                  {a === 'none' ? 'None' : a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📊 Risk Assessment</div>

          <div style={{ textAlign: 'center', padding: '24px 16px', background: `${recommendation.color}08`, borderRadius: 16, border: `2px solid ${recommendation.color}30`, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CHA₂DS₂-VASc Score</div>
            <div style={{ fontSize: 72, fontWeight: 900, fontFamily: 'monospace', color: recommendation.color, lineHeight: 1 }}>{total}</div>
            <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 99, background: `${recommendation.color}20`, color: recommendation.color, fontWeight: 800, fontSize: 12, marginTop: 8 }}>
              {recommendation.level} Risk
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 6 }}>💡 Recommendation</div>
            <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>{recommendation.message}</div>
          </div>

          <div style={{ background: `${recommendation.color}08`, borderRadius: 12, padding: 16, border: `1px solid ${recommendation.color}30` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>🩺 Management Plan</div>
            <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#334155' }}>
              <li><strong>Action:</strong> {recommendation.action}</li>
              <li><strong>Assess bleeding risk:</strong> HAS-BLED score before starting OAC</li>
              <li><strong>DOAC preferable</strong> to warfarin for non-valvular AF (lower ICH risk)</li>
              <li><strong>If warfarin:</strong> target INR 2.0–3.0, TTR{'>'}70%</li>
              <li>Reassess risk profile at every visit</li>
            </ul>
            {total > 0 && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e9f3' }}>
                <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>📄 Suggested Prescription</div>
                {anticoagulation === 'none' ? (
                  <div style={{ fontSize: 11, color: '#0891b2' }}>
                    Consider initiating <strong>Apixaban 5 mg BID</strong> (or Rivaroxaban 20 mg OD) after assessing renal function and bleeding risk.
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Patient currently on <strong>{anticoagulation}</strong>. Ensure dose adjustment for renal function, age, and weight.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
