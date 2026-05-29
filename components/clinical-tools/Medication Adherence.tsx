'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_PATIENT, fmtDate } from './types';

interface Props { patientName?: string; onClose?: () => void; }

interface MedEntry {
  date: Date; medName: string; dose: string; taken: boolean; time?: string; sideEffect?: string;
}

const DEMO_MEDS: MedEntry[] = [
  { date: new Date('2026-05-20'), medName: 'Amlodipine', dose: '10 mg', taken: true, time: '08:00' },
  { date: new Date('2026-05-20'), medName: 'Losartan', dose: '50 mg', taken: true, time: '08:05' },
  { date: new Date('2026-05-21'), medName: 'Amlodipine', dose: '10 mg', taken: true, time: '07:45' },
  { date: new Date('2026-05-21'), medName: 'Losartan', dose: '50 mg', taken: false, time: undefined, sideEffect: 'Forgot' },
  { date: new Date('2026-05-22'), medName: 'Amlodipine', dose: '10 mg', taken: true, time: '08:10' },
  { date: new Date('2026-05-22'), medName: 'Losartan', dose: '50 mg', taken: true, time: '08:12' },
  { date: new Date('2026-05-23'), medName: 'Amlodipine', dose: '10 mg', taken: true, time: '07:30' },
  { date: new Date('2026-05-23'), medName: 'Losartan', dose: '50 mg', taken: true, time: '07:32' },
  { date: new Date('2026-05-24'), medName: 'Amlodipine', dose: '10 mg', taken: true, time: '08:00' },
  { date: new Date('2026-05-24'), medName: 'Losartan', dose: '50 mg', taken: true, time: '08:02' },
  { date: new Date('2026-05-25'), medName: 'Amlodipine', dose: '10 mg', taken: true, time: '07:50' },
  { date: new Date('2026-05-25'), medName: 'Losartan', dose: '50 mg', taken: true, time: '07:55' },
  { date: new Date('2026-05-26'), medName: 'Amlodipine', dose: '10 mg', taken: true, time: '08:05' },
  { date: new Date('2026-05-26'), medName: 'Losartan', dose: '50 mg', taken: true, time: '08:07' },
];

const MED_LIST = ['Amlodipine', 'Losartan', 'Ramipril', 'Bisoprolol', 'HCTZ', 'Spironolactone', 'Metformin', 'Insulin Glargine', 'Atorvastatin'];

export default function MedicationAdherenceTool({ patientName, onClose }: Props) {
  const [showDemo, setShowDemo] = useState(true);
  const [medName, setMedName] = useState('Amlodipine');
  const [dose, setDose] = useState('10 mg');
  const [taken, setTaken] = useState(true);
  const [logTime, setLogTime] = useState(new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }));
  const [sideEffect, setSideEffect] = useState('');
  const [customMeds, setCustomMeds] = useState<MedEntry[]>([]);

  const entries = useMemo(() => {
    const base = showDemo ? DEMO_MEDS : [];
    return [...base, ...customMeds].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [showDemo, customMeds]);

  const adherenceRate = useMemo(() => {
    if (!entries.length) return 0;
    return Math.round((entries.filter(e => e.taken).length / entries.length) * 100);
  }, [entries]);

  const logEntry = () => {
    setCustomMeds(prev => [...prev, { date: new Date(), medName, dose, taken, time: logTime, sideEffect }]);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>💊 Medication Adherence</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Track Medication Compliance</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || DEMO_PATIENT.name}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Left: Log panel */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Log Adherence</div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Medication</label>
              <select value={medName} onChange={e => setMedName(e.target.value)} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
                {MED_LIST.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Dose</label>
              <input value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 10 mg" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setTaken(true)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1.5px solid ${taken ? '#10b981' : '#e2e9f3'}`, background: taken ? '#f0fdf4' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: taken ? '#10b981' : '#64748b' }}>✅ Taken</button>
                <button onClick={() => setTaken(false)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1.5px solid ${!taken ? '#ef4444' : '#e2e9f3'}`, background: !taken ? '#fef2f2' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: !taken ? '#ef4444' : '#64748b' }}>❌ Missed</button>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Side Effects / Note</label>
              <textarea value={sideEffect} onChange={e => setSideEffect(e.target.value)} rows={2} placeholder="Dizziness, nausea, forgot, ran out…" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 11, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            </div>
            <button onClick={logEntry} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              💊 Log Entry
            </button>
          </div>

          {/* Adherence rate */}
          <div style={{ marginTop: 12, background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Overall Adherence</div>
            <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'monospace', color: adherenceRate >= 80 ? '#10b981' : adherenceRate >= 60 ? '#f59e0b' : '#ef4444' }}>{adherenceRate}%</div>
            <div style={{ fontSize: 10, color: '#8fa3bd' }}>{entries.filter(e => e.taken).length}/{entries.length} doses taken</div>
            {adherenceRate < 80 && <div style={{ marginTop: 6, fontSize: 10, color: '#ef4444', fontWeight: 700 }}>⚠️ Below 80% target</div>}
            {adherenceRate >= 80 && <div style={{ marginTop: 6, fontSize: 10, color: '#10b981', fontWeight: 700 }}>✅ Good adherence</div>}
          </div>
        </div>

        {/* Right: History */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a' }}>📊 Adherence Log</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
              <input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} style={{ accentColor: '#6366f1' }} /> Demo Data
            </label>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8fa3bd', padding: 24 }}>No entries recorded yet</div>
            ) : (
              entries.map((e, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 9, border: '1px solid #e2e9f3', marginBottom: 5, background: e.taken ? '#f0fdf4' : '#fef2f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>{e.medName} {e.dose}</span>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: e.taken ? '#10b98120' : '#ef444420', color: e.taken ? '#10b981' : '#ef4444', fontWeight: 700 }}>{e.taken ? 'Taken' : 'Missed'}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#8fa3bd', marginTop: 1 }}>{fmtDate(e.date)} {e.time && `at ${e.time}`}</div>
                      {e.sideEffect && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>⚠️ {e.sideEffect}</div>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Barriers */}
          <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a', marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>🩺 Adherence Barriers Assessment</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: '#92400e' }}>
              {[
                { q: 'Cost of medications?', answer: 'Not assessed' },
                { q: 'Side effects?', answer: 'Check log above' },
                { q: 'Understand regimen?', answer: 'Not assessed' },
                { q: 'Pill organiser user?', answer: 'Not assessed' },
              ].map(b => (
                <div key={b.q} style={{ padding: 6, background: '#fff', borderRadius: 6, border: '1px solid #fde68a' }}>
                  <strong>{b.q}</strong> <span style={{ color: '#64748b' }}>{b.answer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
