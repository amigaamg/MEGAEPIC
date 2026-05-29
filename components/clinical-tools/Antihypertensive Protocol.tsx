'use client';

import React, { useState } from 'react';

interface Props { patientName?: string; onClose?: () => void; }

interface ProtocolStep {
  stage: string;
  bpRange: string;
  step: string;
  regimen: { line: string; drugs: { name: string; dose: string; note: string }[]; }[];
  notes: string[];
  escGuideline: string;
}

const PROTOCOL: ProtocolStep[] = [
  {
    stage: 'Stage 1 HTN', bpRange: '140–159 / 90–99',
    step: 'Step 1: Monotherapy',
    regimen: [{
      line: 'First-line (no comorbidities)',
      drugs: [
        { name: 'Amlodipine', dose: '5–10 mg OD', note: 'Avoid in peripheral oedema, elderly fall risk' },
        { name: 'Losartan', dose: '50–100 mg OD', note: 'Monitor renal function + K+ in 2–4 weeks' },
      ],
    }, {
      line: 'If comorbidities present',
      drugs: [
        { name: 'ACEi/ARB + CCB', dose: 'Combination', note: 'Preferred if DM, CKD, HF, or CAD' },
      ],
    }],
    notes: [
      'Start with single agent at lowest dose, up-titrate',
      'If not at target in 4 weeks → dual combination',
      'Consider single-pill combination for adherence',
    ],
    escGuideline: 'ESC/ESH 2023: Initiate 2-drug combination if BP >20/10 mmHg above target',
  },
  {
    stage: 'Stage 2 HTN', bpRange: '160–179 / 100–109',
    step: 'Step 2: Dual Combination',
    regimen: [{
      line: 'Preferred: RAS blocker + CCB',
      drugs: [
        { name: 'Losartan + Amlodipine', dose: '50/5 → 100/10 mg OD', note: 'Most effective combo' },
        { name: 'Ramipril + Amlodipine', dose: '5/5 → 10/10 mg OD', note: 'Alternative RAS/CCB' },
      ],
    }, {
      line: 'Alternative: RAS blocker + Thiazide',
      drugs: [
        { name: 'Losartan + HCTZ', dose: '50/12.5 → 100/25 mg OD', note: 'Check Na+, K+, uric acid' },
      ],
    }],
    notes: [
      'Most patients need 2 drugs to reach target',
      'Single-pill combination improves adherence',
      'Up-titrate both agents before adding 3rd',
    ],
    escGuideline: 'ESC/ESH 2023: Initiate dual combination. Consider SPC (single-pill combination).',
  },
  {
    stage: 'Resistant HTN', bpRange: '≥140/90 on 3 agents incl. diuretic',
    step: 'Step 3: Triple Therapy',
    regimen: [{
      line: 'Triple combination',
      drugs: [
        { name: 'RAS blocker + CCB + Thiazide', dose: 'Max tolerated doses', note: 'Confirm adherence first' },
      ],
    }, {
      line: 'Add 4th agent if still not at target',
      drugs: [
        { name: 'Spironolactone', dose: '12.5–50 mg OD', note: 'Monitor K+, avoid if eGFR <30' },
        { name: 'Bisoprolol', dose: '5–10 mg OD', note: 'If HR >70 or CAD/HF' },
        { name: 'Doxazosin', dose: '4–8 mg OD', note: 'Fall risk in elderly' },
        { name: 'Methyldopa', dose: '250–500 mg BID', note: 'Pregnancy-safe option' },
      ],
    }],
    notes: [
      'Confirm medication adherence (pill count, pharmacy refills)',
      'Rule out white-coat HTN (ABPM or home monitoring)',
      'Check for secondary HTN (renal artery stenosis, pheochromocytoma, OSA)',
      'Consider referral to HTN specialist',
    ],
    escGuideline: 'ESC/ESH 2023: Add spironolactone (or other diuretic) as 4th agent.',
  },
  {
    stage: 'Hypertensive Crisis', bpRange: '≥180 / ≥120',
    step: 'Step 4: Emergency Management',
    regimen: [{
      line: 'Hypertensive emergency (with TOD)',
      drugs: [
        { name: 'IV Labetalol', dose: '20 mg bolus, then infusion', note: 'Reduce BP 25% over 1–2h' },
        { name: 'IV Nitroprusside', dose: '0.25–10 mcg/kg/min', note: 'Monitor for cyanide toxicity' },
        { name: 'IV Nicardipine', dose: '5–15 mg/h infusion', note: 'Preferred in acute stroke' },
      ],
    }, {
      line: 'Hypertensive urgency (no TOD)',
      drugs: [
        { name: 'Oral Captopril', dose: '12.5–25 mg stat', note: 'Recheck in 1h' },
        { name: 'Oral Amlodipine', dose: '5–10 mg stat', note: 'Avoid sublingual nifedipine' },
      ],
    }],
    notes: [
      'Do NOT reduce BP too rapidly — risk of cerebral hypoperfusion',
      'Primary goal: reduce BP by 25% in first 1–2 hours',
      'Admit for IV therapy if evidence of target organ damage',
      'TO CHECK: neurology, fundoscopy, ECG, troponin, creatinine, urine ACR',
    ],
    escGuideline: 'ESC/ESH 2023: Hypertensive emergency requires ICU/ HDU admission with IV therapy.',
  },
];

export default function AntihypertensiveProtocol({ patientName, onClose }: Props) {
  const [step, setStep] = useState(0);

  const s = PROTOCOL[step];

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#0aaa76,#059669)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>📋 Antihypertensive Protocol</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Stepwise Medication Protocol by Stage</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>ESC/ESH 2023 Guidelines · {patientName || 'Demo Patient'}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      {/* Step navigation */}
      <div style={{ display: 'flex', gap: 4, padding: '16px 24px 0', overflowX: 'auto' }}>
        {PROTOCOL.map((p, i) => (
          <button key={i} onClick={() => setStep(i)} style={{ flex: '0 0 auto', padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${step === i ? '#0aaa76' : '#e2e9f3'}`, background: step === i ? '#f0fdf4' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: step === i ? '#0aaa76' : '#64748b' }}>
            {p.stage}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Stage header */}
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d' }}>{s.stage} — {s.step}</div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>BP Range: <strong>{s.bpRange}</strong></div>
            </div>
            <div style={{ fontSize: 10, color: '#15803d', fontStyle: 'italic', maxWidth: 300, textAlign: 'right' }}>{s.escGuideline}</div>
          </div>
        </div>

        {/* Drug regimens */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {s.regimen.map((reg, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0aaa76', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>{reg.line}</div>
              {reg.drugs.map((drug, j) => (
                <div key={j} style={{ padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e9f3', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1b2a' }}>💊 {drug.name}</div>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#0aaa76' }}>{drug.dose}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#8fa3bd', marginTop: 2 }}>⚠️ {drug.note}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Clinical notes */}
        <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', marginBottom: 8 }}>📌 Key Clinical Notes</div>
          <ul style={{ fontSize: 11, color: '#92400e', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
            {s.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
