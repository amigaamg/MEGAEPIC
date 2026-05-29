'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { DEMO_PATIENT, fmtDate, fmtAgo } from './types';

interface Props { patientName?: string; onClose?: () => void; }

interface GlucoseEntry { date: Date; value: number; type: string; meal?: string; note?: string; }

const DEMO_DATA: GlucoseEntry[] = [
  { date: new Date('2026-05-20 07:00'), value: 6.8, type: 'Fasting', meal: '—', note: '' },
  { date: new Date('2026-05-20 14:00'), value: 8.2, type: 'Post-meal', meal: 'Ugali, sukuma wiki', note: '' },
  { date: new Date('2026-05-21 07:15'), value: 6.2, type: 'Fasting', meal: '—', note: '' },
  { date: new Date('2026-05-21 14:30'), value: 7.5, type: 'Post-meal', meal: 'Rice, beans, cabbage', note: '' },
  { date: new Date('2026-05-22 06:45'), value: 7.1, type: 'Fasting', meal: '—', note: 'Slept late' },
  { date: new Date('2026-05-22 12:00'), value: 10.2, type: 'Post-meal', meal: 'Chips masala, soda', note: 'Ate out' },
  { date: new Date('2026-05-23 07:00'), value: 5.9, type: 'Fasting', meal: '—', note: '' },
  { date: new Date('2026-05-23 18:00'), value: 6.1, type: 'Random', meal: '—', note: 'Before gym' },
  { date: new Date('2026-05-24 07:10'), value: 5.5, type: 'Fasting', meal: '—', note: 'Good' },
  { date: new Date('2026-05-24 13:30'), value: 7.8, type: 'Post-meal', meal: 'Whole wheat chapati, nyama', note: '' },
  { date: new Date('2026-05-25 06:50'), value: 5.2, type: 'Fasting', meal: '—', note: 'Optimal' },
  { date: new Date('2026-05-25 14:00'), value: 7.0, type: 'Post-meal', meal: 'Brown rice, fish, kachumbari', note: '' },
  { date: new Date('2026-05-26 07:00'), value: 5.0, type: 'Fasting', meal: '—', note: 'Great!' },
  { date: new Date('2026-05-26 13:00'), value: 6.5, type: 'Post-meal', meal: 'Vegetable salad, grilled chicken', note: '' },
];

export default function GlucoseLogTool({ patientName, onClose }: Props) {
  const [showDemo, setShowDemo] = useState(true);
  const [value, setValue] = useState('');
  const [readingType, setReadingType] = useState('Fasting');
  const [meal, setMeal] = useState('');
  const [note, setNote] = useState('');
  const [customEntries, setCustomEntries] = useState<GlucoseEntry[]>([]);

  const entries = useMemo(() => {
    const base = showDemo ? DEMO_DATA : [];
    return [...base, ...customEntries].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [showDemo, customEntries]);

  const stats = useMemo(() => {
    if (!entries.length) return null;
    const vals = entries.map(e => e.value);
    const fasting = entries.filter(e => e.type === 'Fasting').map(e => e.value);
    const post = entries.filter(e => e.type === 'Post-meal').map(e => e.value);
    const avgFasting = fasting.length ? (fasting.reduce((a, b) => a + b, 0) / fasting.length).toFixed(1) : '—';
    const avgPost = post.length ? (post.reduce((a, b) => a + b, 0) / post.length).toFixed(1) : '—';
    const inRange = entries.filter(e => (e.type === 'Fasting' && e.value >= 4.0 && e.value <= 7.0) || (e.type !== 'Fasting' && e.value < 10)).length;
    return {
      avgAll: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
      min: Math.min(...vals),
      max: Math.max(...vals),
      avgFasting, avgPost,
      inRange: Math.round((inRange / entries.length) * 100),
      total: entries.length,
      latest: entries[0],
    };
  }, [entries]);

  const chartData = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    return sorted.map(e => ({ date: fmtDate(e.date), Glucose: e.value, type: e.type }));
  }, [entries]);

  const logReading = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    setCustomEntries(prev => [...prev, { date: new Date(), value: v, type: readingType, meal, note }]);
    setValue(''); setMeal(''); setNote('');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🩸 Glucose Log</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Daily Blood Glucose Readings</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || DEMO_PATIENT.name} · Target: Fasting 4.0–7.0 mmol/L</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Left: Log */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Log Glucose</div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Glucose Level *</span><span style={{ color: '#d97706' }}>mmol/L</span>
              </label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} min={1} max={33} step={0.1} placeholder="e.g. 6.5" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'monospace', fontWeight: 700, outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Reading Type</label>
              <select value={readingType} onChange={e => setReadingType(e.target.value)} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
                {['Fasting', 'Pre-meal', 'Post-meal', 'Random', 'Bedtime'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>What Did You Eat?</label>
              <input value={meal} onChange={e => setMeal(e.target.value)} placeholder="e.g. Ugali and sukuma" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Note</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Activity, stress, illness, etc." style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 11, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            </div>
            <button onClick={logReading} disabled={!value} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: !value ? .5 : 1 }}>
              📋 Log Reading
            </button>
          </div>

          {/* Quick stats */}
          {stats && (
            <div style={{ marginTop: 12, background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', marginBottom: 6 }}>📊 Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                <div><strong>Avg Fasting:</strong> <span style={{ color: '#d97706', fontFamily: 'monospace' }}>{stats.avgFasting} mmol/L</span></div>
                <div><strong>Avg Post:</strong> <span style={{ color: '#d97706', fontFamily: 'monospace' }}>{stats.avgPost} mmol/L</span></div>
                <div><strong>Range:</strong> <span style={{ fontFamily: 'monospace' }}>{stats.min}–{stats.max}</span></div>
                <div><strong>In Range:</strong> <span style={{ color: stats.inRange >= 60 ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>{stats.inRange}%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a' }}>📊 Reading History</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
              <input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} style={{ accentColor: '#d97706' }} /> Demo Data
            </label>
          </div>

          {/* Chart */}
          {chartData.length >= 2 && (
            <div style={{ marginBottom: 12 }}>
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[2, 16]} tick={{ fontSize: 8, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <ReferenceLine y={4} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
                  <ReferenceLine y={7} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
                  <Line type="monotone" dataKey="Glucose" stroke="#d97706" strokeWidth={2} dot={{ r: 3, fill: '#d97706' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {entries.map((e, i) => {
              const isHigh = e.value > (e.type === 'Fasting' ? 7 : 10);
              const isLow = e.value < 4;
              return (
                <div key={i} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e9f3', marginBottom: 4, background: isHigh ? '#fef2f2' : isLow ? '#fffbeb' : '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', color: isHigh ? '#ef4444' : isLow ? '#f59e0b' : '#10b981' }}>{e.value}</span>
                      <span style={{ fontSize: 10, color: '#8fa3bd', marginLeft: 4 }}>mmol/L</span>
                      <span style={{ marginLeft: 6, padding: '1px 5px', borderRadius: 99, fontSize: 8, fontWeight: 700, background: '#e2e9f3', color: '#64748b' }}>{e.type}</span>
                    </div>
                    <div style={{ fontSize: 9, color: '#8fa3bd', textAlign: 'right' }}>
                      <div>{fmtDate(e.date)}</div>
                      <div>{e.date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  {e.meal && <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>🍽️ {e.meal}</div>}
                  {e.note && <div style={{ fontSize: 10, color: '#8fa3bd', fontStyle: 'italic', marginTop: 1 }}>{e.note}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
