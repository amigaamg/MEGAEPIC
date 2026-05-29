'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_PATIENT } from './types';

interface Props { patientName?: string; onClose?: () => void; }

const SINBAD_ITEMS = [
  { key: 'ulcer', label: 'Ulcer Present', weight: 1, options: ['None (0)', 'Present (1)'] },
  { key: 'depth', label: 'Depth of Ulcer', weight: 1, options: ['Superficial / no bone (0)', 'Deep to tendon/bone (1)'] },
  { key: 'infection', label: 'Clinical Infection', weight: 1, options: ['No (0)', 'Yes — cellulitis, pus (1)'] },
  { key: 'area', label: 'Area (largest ulcer)', weight: 1, options: ['<1 cm² (0)', '≥1 cm² (1)'] },
  { key: 'arteriopathy', label: 'Arteriopathy (PAD)', weight: 1, options: ['DP pulse palpable (0)', 'DP pulse absent or ABPI <0.9 (1)'] },
  { key: 'neuropathy', label: 'Sensory Neuropathy', weight: 1, options: ['Normal monofilament (0)', 'Absent monofilament (1)'] },
];

const RISK_CATEGORIES = [
  { min: 0, max: 1, label: 'Low Risk', color: '#10b981', icon: '✅', action: 'Annual foot exam, general foot care education' },
  { min: 2, max: 2, label: 'Moderate Risk', color: '#f59e0b', icon: '👀', action: 'Foot exam every 3–6 months, check footwear' },
  { min: 3, max: 4, label: 'High Risk', color: '#f97316', icon: '⚠️', action: 'Foot exam every 1–3 months, specialist podiatry, custom footwear' },
  { min: 5, max: 6, label: 'Very High / Active', color: '#ef4444', icon: '🚨', action: 'Urgent podiatry referral, consider vascular assessment, offloading' },
];

const MONOFILAMENT_SITES = ['1st toe plantar', '3rd toe plantar', '5th toe plantar', '1st metatarsal head', '3rd metatarsal head', '5th metatarsal head', 'Midfoot medial', 'Heel'];

export default function FootExaminationTool({ patientName, onClose }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({
    ulcer: 0, depth: 0, infection: 0, area: 0, arteriopathy: 0, neuropathy: 0,
  });
  const [monofilament, setMonofilament] = useState<string[]>([]);
  const [footAppearance, setFootAppearance] = useState<string[]>([]);
  const [pedalPulses, setPedalPulses] = useState<'palpable' | 'weak' | 'absent'>('palpable');
  const [abpi, setAbpi] = useState('1.0');

  const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
  const risk = useMemo(() => RISK_CATEGORIES.find(r => total >= r.min && total <= r.max) || RISK_CATEGORIES[0], [total]);
  const neuroStatus = monofilament.length >= 7 ? 'Intact' : monofilament.length >= 4 ? 'Reduced' : 'Absent';
  const neuroColor = neuroStatus === 'Intact' ? '#10b981' : neuroStatus === 'Reduced' ? '#f59e0b' : '#ef4444';

  const APPEARANCE = ['Normal', 'Dry skin', 'Callus', 'Cracked heels', 'Deformity (hammer/claw toe)', 'Charcot foot', 'Amputation', 'Ulceration'];

  const toggleMonofilament = (site: string) => {
    setMonofilament(prev => prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]);
  };

  const toggleAppearance = (item: string) => {
    setFootAppearance(prev => prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#059669,#34d399)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🦶 Foot Examination Score</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Diabetic Foot Risk Assessment</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>SINBAD Score · IDSA Guidelines · {patientName || DEMO_PATIENT.name}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Assessment */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 SINBAD Score</div>
          {SINBAD_ITEMS.map(item => (
            <div key={item.key} style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>{item.label}</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {item.options.map((opt, i) => (
                  <button key={i} onClick={() => setScores(s => ({ ...s, [item.key]: i }))} style={{ flex: 1, padding: '7px 8px', borderRadius: 8, border: `1.5px solid ${scores[item.key] === i ? '#059669' : '#e2e9f3'}`, background: scores[item.key] === i ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: scores[item.key] === i ? '#059669' : '#64748b', textAlign: 'center' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 6 }}>10g Monofilament Test (sites felt: {monofilament.length}/8)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {MONOFILAMENT_SITES.map(site => (
                <button key={site} onClick={() => toggleMonofilament(site)} style={{ padding: '4px 8px', borderRadius: 99, border: `1.5px solid ${monofilament.includes(site) ? '#059669' : '#e2e9f3'}`, background: monofilament.includes(site) ? '#f0fdf4' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: 700, color: monofilament.includes(site) ? '#059669' : '#64748b' }}>
                  {monofilament.includes(site) ? '✓ ' : ''}{site}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: neuroColor, fontWeight: 700, marginTop: 4 }}>Sensation: {neuroStatus}</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Pedal Pulses</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['palpable', 'weak', 'absent'] as const).map(p => (
                <button key={p} onClick={() => setPedalPulses(p)} style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1.5px solid ${pedalPulses === p ? '#059669' : '#e2e9f3'}`, background: pedalPulses === p ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: pedalPulses === p ? '#059669' : '#64748b', textTransform: 'capitalize' }}>{p}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>ABPI (Ankle-Brachial Index)</span><span style={{ color: '#059669' }}>Normal: 0.9–1.3</span>
            </label>
            <input type="number" value={abpi} onChange={e => setAbpi(e.target.value)} min={0.2} max={2.0} step={0.01} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'monospace', fontWeight: 700, outline: 'none' }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Foot Appearance</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {APPEARANCE.map(item => (
                <button key={item} onClick={() => toggleAppearance(item)} style={{ padding: '4px 8px', borderRadius: 99, border: `1.5px solid ${footAppearance.includes(item) ? '#059669' : '#e2e9f3'}`, background: footAppearance.includes(item) ? '#f0fdf4' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: 700, color: footAppearance.includes(item) ? '#059669' : '#64748b' }}>
                  {footAppearance.includes(item) ? '✓ ' : ''}{item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📊 Assessment Result</div>

          <div style={{ textAlign: 'center', padding: '24px 16px', background: `${risk.color}08`, borderRadius: 16, border: `2px solid ${risk.color}30`, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>SINBAD Score</div>
            <div style={{ fontSize: 56, fontWeight: 900, fontFamily: 'monospace', color: risk.color, lineHeight: 1 }}>{total}/6</div>
            <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 99, background: `${risk.color}20`, color: risk.color, fontWeight: 800, fontSize: 12, marginTop: 8 }}>
              {risk.icon} {risk.label}
            </div>
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d', marginBottom: 6 }}>🩺 Recommended Action</div>
            <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>{risk.action}</div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>📋 Findings Summary</div>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Sensation', `${neuroStatus} (${monofilament.length}/8 sites felt)`, neuroColor],
                  ['Pedal Pulses', pedalPulses, pedalPulses === 'palpable' ? '#10b981' : '#f59e0b'],
                  ['ABPI', abpi, parseFloat(abpi) >= 0.9 ? '#10b981' : '#ef4444'],
                  ['Foot Appearance', footAppearance.length ? footAppearance.join(', ') : 'Normal', '#64748b'],
                ].map(([l, v, c]) => (
                  <tr key={l as string} style={{ borderBottom: '1px solid #e2e9f3' }}>
                    <td style={{ padding: '5px 8px', fontWeight: 700, color: '#64748b' }}>{l}</td>
                    <td style={{ padding: '5px 8px', color: c as string, fontWeight: 700 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>🛡️ Preventive Care</div>
            <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#92400e' }}>
              <li>Daily foot inspection (check between toes!)</li>
              <li>Moisturise dry skin, but not between toes</li>
              <li>Cut nails straight across, file edges</li>
              <li>Wear properly fitted shoes — never barefoot</li>
              <li>Check inside shoes for foreign objects before wearing</li>
              <li>Report any redness, swelling, or break in skin immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
