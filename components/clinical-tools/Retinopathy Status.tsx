'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_PATIENT } from './types';

interface Props { patientName?: string; onClose?: () => void; }

const DR_STAGES = [
  { label: 'No DR', description: 'No retinal abnormalities', color: '#10b981', icon: '✅', screening: 'Rescreen in 1–2 years', codes: ['E11.319', 'E10.319'] },
  { label: 'Mild NPDR', description: 'Microaneurysms only', color: '#f59e0b', icon: '👀', screening: 'Rescreen in 6–12 months', codes: ['E11.3293', 'E10.3293'] },
  { label: 'Moderate NPDR', description: 'Dot-blot haemorrhages, hard exudates, venous beading', color: '#f97316', icon: '📹', screening: 'Rescreen in 3–6 months', codes: ['E11.3294', 'E10.3294'] },
  { label: 'Severe NPDR', description: 'Cotton wool spots, IRMA, venous beading in 2+ quadrants', color: '#ef4444', icon: '⚠️', screening: 'Rescreen in 2–3 months, consider laser', codes: ['E11.3295', 'E10.3295'] },
  { label: 'PDR (Proliferative)', description: 'Neovascularisation, vitreous haemorrhage', color: '#dc2626', icon: '🚨', screening: 'Urgent ophthalmology — laser within 2 weeks', codes: ['E11.351', 'E10.351'] },
  { label: 'DME (Macular Oedema)', description: 'Macular thickening, vision loss', color: '#7f1d1d', icon: '🆘', screening: 'Urgent — anti-VEGF, laser, or steroids', codes: ['E11.321', 'E10.321'] },
];

const DEMO_FINDINGS: Record<string, { stage: string; va?: string; previous?: string; lastExam?: string }> = {
  'Right Eye': { stage: 'Mild NPDR', va: '6/6', previous: 'No DR', lastExam: '2025-08-15' },
  'Left Eye': { stage: 'Moderate NPDR', va: '6/9', previous: 'No DR', lastExam: '2025-08-15' },
};

export default function RetinopathyStatus({ patientName, onClose }: Props) {
  const [eye, setEye] = useState<'Right Eye' | 'Left Eye'>('Right Eye');
  const [stage, setStage] = useState(DEMO_FINDINGS[eye].stage);
  const [va, setVa] = useState(DEMO_FINDINGS[eye].va || '');
  const [previous, setPrevious] = useState(DEMO_FINDINGS[eye].previous || '');
  const [notes, setNotes] = useState('');
  const [hasDME, setHasDME] = useState(false);
  const [lastExam, setLastExam] = useState(DEMO_FINDINGS[eye].lastExam || '');

  const currentStage = useMemo(() => DR_STAGES.find(s => s.label === stage) || DR_STAGES[0], [stage]);

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>👁️ Retinopathy Status</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Diabetic Retinopathy Screening & Staging</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>ETDRS/AAO Guidelines · {patientName || DEMO_PATIENT.name}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Exam */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Eye Examination</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['Right Eye', 'Left Eye'] as const).map(e => (
              <button key={e} onClick={() => { setEye(e); const f = DEMO_FINDINGS[e]; setStage(f.stage); setVa(f.va || ''); setPrevious(f.previous || ''); setLastExam(f.lastExam || ''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${eye === e ? '#6366f1' : '#e2e9f3'}`, background: eye === e ? '#eef2ff' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: eye === e ? '#6366f1' : '#64748b' }}>
                {e === 'Right Eye' ? '👁️ Right' : '👁️ Left'}
              </button>
            ))}
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>DR Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
                {DR_STAGES.map(s => <option key={s.label} value={s.label}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Visual Acuity</label>
              <input value={va} onChange={e => setVa(e.target.value)} placeholder="e.g. 6/6, 6/12, CF" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Previous Stage (if known)</label>
              <input value={previous} onChange={e => setPrevious(e.target.value)} placeholder="e.g. No DR" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Last Exam Date</label>
              <input value={lastExam} onChange={e => setLastExam(e.target.value)} placeholder="YYYY-MM-DD" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#6366f1', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasDME} onChange={e => setHasDME(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }} />
                🟡 Diabetic Macular Oedema (DME) present
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Laser scars, neovascularisation, vitreous haemorrhage, etc." style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 11, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            </div>
            <button style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              👁️ Save Exam Results
            </button>
          </div>
        </div>

        {/* Right: Classification & action */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📊 Staging & Management</div>

          <div style={{ textAlign: 'center', padding: '24px 16px', background: `${currentStage.color}08`, borderRadius: 16, border: `2px solid ${currentStage.color}30`, marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>{currentStage.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: currentStage.color }}>{currentStage.label}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{currentStage.description}</div>
            {hasDME && <div style={{ marginTop: 6, padding: '3px 10px', background: '#fef2f2', color: '#991b1b', borderRadius: 99, fontSize: 10, fontWeight: 700, display: 'inline-block' }}>🟡 + DME</div>}
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d', marginBottom: 6 }}>📅 Recommended Screening</div>
            <div style={{ fontSize: 12, color: '#166534' }}>{currentStage.screening}</div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>📋 ICD-10 Codes</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {currentStage.codes.map(c => (
                <span key={c} style={{ padding: '3px 8px', background: '#eef2ff', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: '#6366f1' }}>{c}</span>
              ))}
              {hasDME && <span style={{ padding: '3px 8px', background: '#fef2f2', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: '#ef4444' }}>+ E11.321</span>}
            </div>
          </div>

          {/* All stages reference */}
          <div style={{ maxHeight: 200, overflowY: 'auto', borderRadius: 12, border: '1px solid #e8eef5' }}>
            <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}><th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e9f3' }}>Stage</th><th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e9f3' }}>Management</th></tr></thead>
              <tbody>
                {DR_STAGES.map(s => (
                  <tr key={s.label} style={{ borderBottom: '1px solid #f1f5f9', background: s.label === stage ? `${s.color}08` : '#fff' }}>
                    <td style={{ padding: '5px 8px', color: s.color, fontWeight: s.label === stage ? 800 : 600 }}>{s.icon} {s.label}</td>
                    <td style={{ padding: '5px 8px', color: '#64748b' }}>{s.screening}</td>
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
