'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_PATIENT } from './types';

interface Props { patientName?: string; onClose?: () => void; }

const STAGES = [
  { label: 'Optimal', sbpRange: '<120', dbpRange: '<80', risk: 'Normal', color: '#10b981', icon: '✅', management: 'No intervention needed. Reassess in 1–2 years.' },
  { label: 'Normal', sbpRange: '120–129', dbpRange: '80–84', risk: 'Low', color: '#f59e0b', icon: '👀', management: 'Lifestyle advice. Monitor annually.' },
  { label: 'High Normal', sbpRange: '130–139', dbpRange: '85–89', risk: 'Low-Moderate', color: '#f97316', icon: '📹', management: 'Lifestyle modification. Monitor every 6 months.' },
  { label: 'Grade 1 HTN', sbpRange: '140–159', dbpRange: '90–99', risk: 'Moderate', color: '#ef4444', icon: '⚠️', management: 'Lifestyle + start monotherapy. Target <130/80.' },
  { label: 'Grade 2 HTN', sbpRange: '160–179', dbpRange: '100–109', risk: 'High', color: '#dc2626', icon: '🚨', management: 'Start 2-drug combination. Urgent clinic review.' },
  { label: 'Grade 3 HTN', sbpRange: '≥180', dbpRange: '≥110–120', risk: 'Very High', color: '#7f1d1d', icon: '🚑', management: '3-drug combination. Consider IV therapy. Urgent.' },
  { label: 'Crisis', sbpRange: '≥180 &/or', dbpRange: '≥120', risk: 'Emergency', color: '#450a0a', icon: '🆘', management: 'EMERGENCY — IV therapy, target organ damage assessment.' },
];

export default function HTNSeverityStaging({ patientName, onClose }: Props) {
  const [systolic, setSystolic] = useState('145');
  const [diastolic, setDiastolic] = useState('92');

  const classification = useMemo(() => {
    const s = parseInt(systolic) || 0;
    const d = parseInt(diastolic) || 0;
    if (s >= 180 || d >= 120) return STAGES[6];
    if (s >= 160 || d >= 100) return STAGES[5];
    if (s >= 140 || d >= 90) return STAGES[4];
    if (s >= 130 || d >= 85) return STAGES[2];
    if (s >= 120 || d >= 80) return STAGES[1];
    return STAGES[0];
  }, [systolic, diastolic]);

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>📊 HTN Severity Staging</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>ESC/ESH 2023 Classification</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || DEMO_PATIENT.name}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Input */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 BP Values</div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Systolic BP</span><span style={{ color: '#dc2626' }}>mmHg</span>
              </label>
              <input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} min={60} max={280} style={{ width: '100%', padding: '10px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 18, fontFamily: 'monospace', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Diastolic BP</span><span style={{ color: '#3b82f6' }}>mmHg</span>
              </label>
              <input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} min={40} max={160} style={{ width: '100%', padding: '10px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 18, fontFamily: 'monospace', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
            </div>
            <div style={{ textAlign: 'center', padding: '14px', borderRadius: 10, background: `${classification.color}15`, border: `2px solid ${classification.color}30` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Classification</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: classification.color }}>{classification.icon} {classification.label}</div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📊 Staging Guide</div>
          <div style={{ maxHeight: 320, overflowY: 'auto', borderRadius: 12, border: '1px solid #e8eef5' }}>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                  {['Stage', 'SBP (mmHg)', 'DBP (mmHg)', 'Risk', 'Management'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 9, textTransform: 'uppercase', borderBottom: '1px solid #e2e9f3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAGES.map(st => {
                  const isActive = st.label === classification.label;
                  return (
                    <tr key={st.label} style={{
                      background: isActive ? `${st.color}10` : '#fff',
                      borderBottom: '1px solid #f1f5f9',
                      fontWeight: isActive ? 800 : 400,
                    }}>
                      <td style={{ padding: '8px 10px', color: st.color, fontWeight: isActive ? 800 : 600 }}>
                        {isActive && '✓ '}{st.icon} {st.label}
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{st.sbpRange}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{st.dbpRange}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ padding: '1px 6px', borderRadius: 99, background: `${st.color}20`, color: st.color, fontWeight: 700, fontSize: 9 }}>{st.risk}</span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#64748b', fontSize: 10 }}>{st.management}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action plan */}
          <div style={{ marginTop: 12, background: classification.color === '#10b981' ? '#f0fdf4' : '#fef2f2', borderRadius: 12, padding: 16, border: `1px solid ${classification.color}30` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: classification.label === 'Crisis' ? '#991b1b' : '#0d1b2a', marginBottom: 8 }}>
              📋 Management Plan: {classification.label}
            </div>
            <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.7 }}>{classification.management}</div>
            {classification.label !== 'Optimal' && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                <strong>Additional Considerations:</strong><br />
                • Assess CV risk (Framingham/SCORE) — order lipids, glucose, creatinine<br />
                • Check for target organ damage (ECG, echo, fundoscopy, urine ACR)<br />
                • Rule out secondary HTN if resistant or young age (&lt;40y)<br />
                • Lifestyle: DASH diet, Na &lt;5g/d, 150 min/week exercise, alcohol moderation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
