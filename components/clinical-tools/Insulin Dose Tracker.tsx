'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_PATIENT, fmtDate } from './types';

interface Props { patientName?: string; onClose?: () => void; }

const INSULIN_TYPES = [
  { name: 'Insulin Glargine (Lantus)', type: 'Long-acting', onset: '2–4h', peak: 'No peak', duration: '24h', color: '#0891b2' },
  { name: 'Insulin Detemir (Levemir)', type: 'Long-acting', onset: '2–4h', peak: '6–8h', duration: '18–24h', color: '#06b6d4' },
  { name: 'Insulin NPH (Isophane)', type: 'Intermediate', onset: '2–4h', peak: '4–12h', duration: '12–18h', color: '#0ea5e9' },
  { name: 'Insulin Aspart (NovoRapid)', type: 'Rapid-acting', onset: '10–20m', peak: '1–3h', duration: '3–5h', color: '#f59e0b' },
  { name: 'Insulin Lispro (Humalog)', type: 'Rapid-acting', onset: '15–30m', peak: '30–90m', duration: '3–5h', color: '#d97706' },
  { name: 'Insulin Glulisine (Apidra)', type: 'Rapid-acting', onset: '10–15m', peak: '30–90m', duration: '3–5h', color: '#f97316' },
  { name: 'Pre-mixed 70/30', type: 'Pre-mixed', onset: '30–60m', peak: '2–8h', duration: '12–16h', color: '#7c3aed' },
];

const DEMO_DOSES = [
  { date: new Date('2026-05-20'), insulin: 'Insulin Glargine (Lantus)', dose: 20, time: '22:00', bg: 7.8, note: '' },
  { date: new Date('2026-05-20'), insulin: 'Insulin Aspart (NovoRapid)', dose: 6, time: '08:00', bg: 8.2, note: 'Breakfast' },
  { date: new Date('2026-05-21'), insulin: 'Insulin Glargine (Lantus)', dose: 22, time: '22:00', bg: 7.2, note: 'Increased by 2u' },
  { date: new Date('2026-05-21'), insulin: 'Insulin Aspart (NovoRapid)', dose: 6, time: '08:00', bg: 7.8, note: 'Breakfast' },
  { date: new Date('2026-05-22'), insulin: 'Insulin Glargine (Lantus)', dose: 22, time: '22:00', bg: 6.5, note: '' },
  { date: new Date('2026-05-22'), insulin: 'Insulin Aspart (NovoRapid)', dose: 8, time: '08:00', bg: 8.5, note: 'Increased by 2u' },
  { date: new Date('2026-05-23'), insulin: 'Insulin Glargine (Lantus)', dose: 24, time: '22:00', bg: 5.8, note: 'Good' },
  { date: new Date('2026-05-23'), insulin: 'Insulin Aspart (NovoRapid)', dose: 8, time: '08:00', bg: 6.2, note: 'Breakfast' },
  { date: new Date('2026-05-24'), insulin: 'Insulin Glargine (Lantus)', dose: 24, time: '22:00', bg: 5.5, note: 'Optimal' },
  { date: new Date('2026-05-24'), insulin: 'Insulin Aspart (NovoRapid)', dose: 6, time: '08:00', bg: 6.0, note: 'Low BG yesterday' },
  { date: new Date('2026-05-25'), insulin: 'Insulin Glargine (Lantus)', dose: 22, time: '22:00', bg: 6.8, note: 'Reduced - low BG trend' },
  { date: new Date('2026-05-25'), insulin: 'Insulin Aspart (NovoRapid)', dose: 6, time: '08:00', bg: 6.5, note: 'Breakfast' },
  { date: new Date('2026-05-26'), insulin: 'Insulin Glargine (Lantus)', dose: 22, time: '22:00', bg: 6.0, note: '' },
  { date: new Date('2026-05-26'), insulin: 'Insulin Aspart (NovoRapid)', dose: 6, time: '08:00', bg: 5.8, note: 'Breakfast' },
];

export default function InsulinDoseTracker({ patientName, onClose }: Props) {
  const [showDemo, setShowDemo] = useState(true);
  const [insulin, setInsulin] = useState('Insulin Glargine (Lantus)');
  const [dose, setDose] = useState('20');
  const [bg, setBg] = useState('6.5');
  const [note, setNote] = useState('');
  const [customDoses, setCustomDoses] = useState<any[]>([]);
  const [tab, setTab] = useState<'log' | 'guide'>('log');

  const entries = useMemo(() => {
    const base = showDemo ? DEMO_DOSES : [];
    return [...base, ...customDoses].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [showDemo, customDoses]);

  const stats = useMemo(() => {
    if (!entries.length) return null;
    const doses = entries.filter(e => e.insulin === insulin);
    const bgVals = doses.map(d => d.bg).filter(Boolean);
    const currentDose = doses.length ? doses[0].dose : 0;
    return {
      totalDoses: entries.length,
      currentDose,
      avgBG: bgVals.length ? (bgVals.reduce((a, b) => a + b, 0) / bgVals.length).toFixed(1) : '—',
      minBG: bgVals.length ? Math.min(...bgVals) : '—',
      maxBG: bgVals.length ? Math.max(...bgVals) : '—',
    };
  }, [entries, insulin]);

  const logDose = () => {
    const d = parseInt(dose);
    const b = parseFloat(bg);
    if (isNaN(d) || isNaN(b)) return;
    setCustomDoses(prev => [...prev, { date: new Date(), insulin, dose: d, time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }), bg: b, note }]);
    setNote('');
  };

  const selectedInsulin = INSULIN_TYPES.find(i => i.name === insulin);

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>💉 Insulin Dose Tracker</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Insulin Titration & Dosing</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || DEMO_PATIENT.name}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>💉 Log Dose</div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Insulin Type</label>
              <select value={insulin} onChange={e => setInsulin(e.target.value)} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 11, fontFamily: 'inherit', outline: 'none' }}>
                {INSULIN_TYPES.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Dose</span><span style={{ color: '#0891b2' }}>units</span>
              </label>
              <input type="number" value={dose} onChange={e => setDose(e.target.value)} min={1} max={100} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'monospace', fontWeight: 700, outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Blood Glucose</span><span style={{ color: '#d97706' }}>mmol/L</span>
              </label>
              <input type="number" value={bg} onChange={e => setBg(e.target.value)} min={1} max={33} step={0.1} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'monospace', fontWeight: 700, outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Note</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Hypo symptoms, dose adjustment reason…" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 11, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            </div>
            <button onClick={logDose} disabled={!dose || !bg} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#0891b2,#06b6d4)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: (!dose || !bg) ? .5 : 1 }}>
              💉 Log Dose
            </button>
          </div>

          {stats && (
            <div style={{ marginTop: 12, background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', marginBottom: 6 }}>📊 {insulin.split('(')[0].trim()}</div>
              <div style={{ fontSize: 11, lineHeight: 1.8 }}>
                <div><strong>Current dose:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0891b2' }}>{stats.currentDose} units</span></div>
                <div><strong>Avg BG:</strong> <span style={{ fontFamily: 'monospace' }}>{stats.avgBG} mmol/L</span></div>
                <div><strong>BG range:</strong> <span style={{ fontFamily: 'monospace' }}>{stats.minBG}–{stats.maxBG}</span></div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a' }}>📊 Dosing History</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                <input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} style={{ accentColor: '#0891b2' }} /> Demo
              </label>
              <button onClick={() => setTab(t => t === 'log' ? 'guide' : 'log')} style={{ padding: '4px 10px', borderRadius: 8, border: '1.5px solid #e2e9f3', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 600 }}>
                {tab === 'log' ? '📖 Guide' : '📋 Log'}
              </button>
            </div>
          </div>

          {tab === 'log' ? (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {entries.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8fa3bd', padding: 24 }}>No doses logged yet</div>
              ) : entries.map((e, i) => (
                <div key={i} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e9f3', marginBottom: 4, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#0891b2' }}>{e.dose} units</span>
                      <span style={{ fontSize: 10, color: '#64748b', marginLeft: 6 }}>{e.insulin.split('(')[0].trim()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: '#8fa3bd' }}>{fmtDate(e.date)} {e.time}</div>
                      {e.bg && <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: e.bg > 10 ? '#ef4444' : e.bg < 4 ? '#f59e0b' : '#10b981' }}>BG: {e.bg}</div>}
                    </div>
                  </div>
                  {e.note && <div style={{ fontSize: 10, color: '#8fa3bd', fontStyle: 'italic', marginTop: 2 }}>{e.note}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 8 }}>📖 Insulin Titration Guide</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1b2a', marginBottom: 4 }}>{selectedInsulin?.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                Type: {selectedInsulin?.type} · Onset: {selectedInsulin?.onset} · Peak: {selectedInsulin?.peak} · Duration: {selectedInsulin?.duration}
              </div>
              <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#166534' }}>
                <li><strong>Titration rule:</strong> Adjust by 2–4 units every 3 days</li>
                <li><strong>Target fasting BG:</strong> 4.0–7.0 mmol/L</li>
                <li><strong>If fasting &gt;10.0:</strong> increase basal by 4u</li>
                <li><strong>If fasting 7.1–10.0:</strong> increase basal by 2u</li>
                <li><strong>If BG &lt;4.0:</strong> decrease basal by 2–4u or 10–20%</li>
                <li><strong>Bolus (meal-time):</strong> 1u per 10g carbs or per 2–3 mmol/L above target</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
