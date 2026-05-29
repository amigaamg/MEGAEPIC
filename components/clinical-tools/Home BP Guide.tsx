'use client';

import React, { useState } from 'react';
import { DEMO_PATIENT } from './types';

interface Props { patientName?: string; onClose?: () => void; }

const STEPS = [
  {
    title: '1. Prepare', icon: '🧘',
    items: [
      'Do not smoke, drink caffeine, or exercise within 30 minutes of measurement',
      'Empty your bladder — a full bladder can raise BP by 10–15 mmHg',
      'Sit in a quiet room at a comfortable temperature',
      'Rest quietly for at least 5 minutes before starting',
      'Do not talk during measurement',
    ],
    tips: ['Best times: morning (before meds + breakfast) and evening (before dinner)'],
  },
  {
    title: '2. Position', icon: '🪑',
    items: [
      'Sit in a chair with back support, feet flat on the floor (don\'t cross legs)',
      'Rest your arm on a table or armrest at heart level',
      'The cuff should be on your bare upper arm (not over clothing)',
      'The bottom of the cuff should be 2–3 cm above your elbow crease',
      'Use the same arm for each measurement (usually left arm)',
    ],
    tips: ['Mark your cuff position with a pen to ensure consistent placement'],
  },
  {
    title: '3. Measure', icon: '📏',
    items: [
      'Press start on your monitor and remain still and quiet',
      'Take 2–3 readings, each 1–2 minutes apart',
      'Record all readings including the date and time',
      'Average the last 2 readings for your BP at that session',
      'If using a wrist monitor, keep wrist at heart level',
    ],
    tips: ['First reading is often highest — discard it and average readings 2 and 3'],
  },
  {
    title: '4. Record', icon: '📝',
    items: [
      'Record all readings in your log or the AMEXAN app',
      'Include: date, time, SBP, DBP, pulse, and any symptoms',
      'Bring your log to every clinic visit',
      'Measure 2× daily for 7 days before each appointment',
      'Don\'t skip readings if they\'re normal — we need the full picture!',
    ],
    tips: ['Most smartphones have a notes app — use it if you forget your logbook'],
  },
  {
    title: '5. Understand', icon: '📊',
    items: [
      'Your target is <130/80 mmHg (ESC/ESH 2023 guideline)',
      'Single high reading doesn\'t mean crisis — trends matter',
      'Home BP is usually lower than clinic BP (white-coat effect)',
      'Bring your monitor to clinic to check its accuracy annually',
      'Contact your doctor if readings are consistently >140/90',
    ],
    tips: ['Home BP monitoring is the best way to know if your treatment is working'],
  },
];

const COMMON_MISTAKES = [
  { mistake: 'Legs crossed during measurement', correction: 'Keep both feet flat on the floor', impact: '+2–8 mmHg' },
  { mistake: 'Unsupported back (sitting on edge of chair)', correction: 'Sit back with full back support', impact: '+5–15 mmHg' },
  { mistake: 'Arm hanging at side (not heart level)', correction: 'Support arm on table at heart level', impact: '+10 mmHg' },
  { mistake: 'Cuff over clothing', correction: 'Place cuff on bare upper arm', impact: '+5–30 mmHg' },
  { mistake: 'Talking during measurement', correction: 'Remain silent and still', impact: '+10–15 mmHg' },
  { mistake: 'Full bladder', correction: 'Empty bladder first', impact: '+10–15 mmHg' },
  { mistake: 'Too small or too large cuff', correction: 'Ensure correct cuff size for your arm', impact: 'Inaccurate by 10–30 mmHg' },
];

const EQUIPMENT_TIPS = [
  { brand: 'Omron M3/M5/M7', stars: 5, features: 'Upper arm, irregular heartbeat detection, memory' },
  { brand: 'Microlife WatchBP Home', stars: 5, features: 'Clinically validated, triple measurement mode, AF detection' },
  { brand: 'A&D Medical UA series', stars: 4, features: 'Upper arm, large display, memory' },
  { brand: 'Beurer BM series', stars: 4, features: 'Upper arm, app-compatible, multiple user memory' },
];

export default function HomeBPGuide({ patientName, onClose }: Props) {
  const [step, setStep] = useState(0);

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🏠 Home BP Monitoring Guide</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Patient Education — Getting Accurate Readings</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || DEMO_PATIENT.name}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Step progress */}
        <div style={{ display: 'flex', gap: 4 }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${i === step ? '#2563eb' : i < step ? '#10b981' : '#e2e9f3'}`, background: i === step ? '#eff6ff' : i < step ? '#f0fdf4' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: 700, color: i === step ? '#2563eb' : i < step ? '#10b981' : '#94a3b8', textAlign: 'center' }}>
              {i < step ? '✅' : s.icon} {s.title.split('.')[1]?.trim() || s.title}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Step content */}
          <div>
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: 20, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8', marginBottom: 12 }}>{STEPS[step].title}</div>
              <ul style={{ fontSize: 12, lineHeight: 2, paddingLeft: 16, margin: 0, color: '#1e3a8a' }}>
                {STEPS[step].items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', fontWeight: 600 }}>
                💡 {STEPS[step].tips[0]}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid #e2e9f3', background: '#fff', cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: step === 0 ? '#d1d5db' : '#64748b' }}>← Previous</button>
              <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', cursor: step === STEPS.length - 1 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, opacity: step === STEPS.length - 1 ? .5 : 1 }}>
                Next →
              </button>
            </div>
          </div>

          {/* Right: Reference info */}
          <div>
            {/* Common mistakes */}
            <div style={{ background: '#fef2f2', borderRadius: 12, padding: 16, border: '1px solid #fecaca', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#b91c1c', marginBottom: 8 }}>⚠️ Common Mistakes & Impact</div>
              <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid #fecaca' }}><th style={{ textAlign: 'left', padding: '4px 6px', color: '#991b1b', fontWeight: 700 }}>Mistake</th><th style={{ textAlign: 'left', padding: '4px 6px', color: '#991b1b', fontWeight: 700 }}>Fix</th><th style={{ textAlign: 'right', padding: '4px 6px', color: '#991b1b', fontWeight: 700 }}>Impact</th></tr></thead>
                <tbody>
                  {COMMON_MISTAKES.map(m => (
                    <tr key={m.mistake} style={{ borderBottom: '1px solid #fecaca' }}>
                      <td style={{ padding: '4px 6px', color: '#991b1b' }}>{m.mistake}</td>
                      <td style={{ padding: '4px 6px', color: '#64748b' }}>{m.correction}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{m.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Equipment */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>🏥 Recommended Monitors</div>
              {EQUIPMENT_TIPS.map(e => (
                <div key={e.brand} style={{ padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid #e2e9f3', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#0d1b2a' }}>{e.brand}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{e.features}</div>
                  </div>
                  <div style={{ fontSize: 11 }}>{'⭐'.repeat(e.stars)}{'☆'.repeat(5 - e.stars)}</div>
                </div>
              ))}
              <div style={{ fontSize: 9, color: '#8fa3bd', marginTop: 6 }}>Always use a clinically validated upper-arm monitor. Avoid wrist/finger monitors.</div>
            </div>

            {/* When to contact doctor */}
            <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>📞 When to Contact Your Doctor</div>
              <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#92400e' }}>
                <li>Readings consistently {'>'}140/90 despite medications</li>
                <li>Single reading ≥180/120 (check again in 15 min — if still high, go to A&E)</li>
                <li>New symptoms: headache, vision changes, chest pain, SOB</li>
                <li>Side effects from medications (dizziness, cough, swelling)</li>
                <li>Before any medication changes (dose adjustments)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
