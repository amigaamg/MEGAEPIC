'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Area, ComposedChart } from 'recharts';
import { DEMO_PATIENT, fmtDate, fmtAgo } from './types';

interface BPReading { date: Date; systolic: number; diastolic: number; pulse?: number; classification?: string; }
interface Props { patientId?: string; patientName?: string; onClose?: () => void; }

const DEMO_READINGS: BPReading[] = [
  { date: new Date('2026-01-15'), systolic: 145, diastolic: 92, pulse: 78, classification: 'Stage 1 HTN' },
  { date: new Date('2026-01-22'), systolic: 138, diastolic: 88, pulse: 76, classification: 'Elevated' },
  { date: new Date('2026-02-01'), systolic: 150, diastolic: 95, pulse: 80, classification: 'Stage 1 HTN' },
  { date: new Date('2026-02-08'), systolic: 142, diastolic: 90, pulse: 74, classification: 'Stage 1 HTN' },
  { date: new Date('2026-02-15'), systolic: 135, diastolic: 85, pulse: 72, classification: 'Elevated' },
  { date: new Date('2026-02-22'), systolic: 128, diastolic: 82, pulse: 70, classification: 'Elevated' },
  { date: new Date('2026-03-01'), systolic: 132, diastolic: 84, pulse: 73, classification: 'Elevated' },
  { date: new Date('2026-03-08'), systolic: 125, diastolic: 78, pulse: 71, classification: 'Normal' },
  { date: new Date('2026-03-15'), systolic: 150, diastolic: 90, pulse: 82, classification: 'Stage 1 HTN' },
  { date: new Date('2026-03-22'), systolic: 140, diastolic: 88, pulse: 76, classification: 'Stage 1 HTN' },
  { date: new Date('2026-03-29'), systolic: 130, diastolic: 80, pulse: 70, classification: 'Normal' },
  { date: new Date('2026-04-05'), systolic: 126, diastolic: 76, pulse: 68, classification: 'Normal' },
  { date: new Date('2026-04-12'), systolic: 122, diastolic: 74, pulse: 66, classification: 'Normal' },
  { date: new Date('2026-04-19'), systolic: 128, diastolic: 80, pulse: 72, classification: 'Normal' },
  { date: new Date('2026-04-26'), systolic: 135, diastolic: 85, pulse: 74, classification: 'Elevated' },
  { date: new Date('2026-05-03'), systolic: 132, diastolic: 82, pulse: 71, classification: 'Elevated' },
  { date: new Date('2026-05-10'), systolic: 128, diastolic: 78, pulse: 69, classification: 'Normal' },
  { date: new Date('2026-05-17'), systolic: 125, diastolic: 76, pulse: 68, classification: 'Normal' },
  { date: new Date('2026-05-24'), systolic: 120, diastolic: 72, pulse: 65, classification: 'Normal' },
  { date: new Date('2026-05-26'), systolic: 118, diastolic: 70, pulse: 64, classification: 'Normal' },
];

const CLASSIFICATION_COLORS: Record<string, string> = {
  'Normal': '#10b981', 'Elevated': '#f59e0b', 'Stage 1 HTN': '#f97316',
  'Stage 2 HTN': '#ef4444', 'Hypertensive Crisis': '#7f1d1d',
};

const STAGE_RANGES = [
  { label: 'Normal', range: 'SBP <130 & DBP <80', color: '#10b981', icon: '✅' },
  { label: 'Elevated', range: '130–139 SBP or 80–89 DBP', color: '#f59e0b', icon: '👀' },
  { label: 'Stage 1 HTN', range: '140–159 SBP or 90–99 DBP', color: '#f97316', icon: '📹' },
  { label: 'Stage 2 HTN', range: '160–179 SBP or 100–109 DBP', color: '#ef4444', icon: '⚠️' },
  { label: 'Crisis', range: '≥180 SBP or ≥120 DBP', color: '#7f1d1d', icon: '🚨' },
];

function CTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1b2a', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 11, boxShadow: '0 8px 24px rgba(0,0,0,.35)', minWidth: 140 }}>
      <div style={{ fontWeight: 700, color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.stroke || p.color || p.fill }} />
          <span style={{ color: '#94a3b8' }}>{p.name}:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>{typeof p.value === 'number' ? p.value.toFixed(0) : p.value} mmHg</span>
        </div>
      ))}
    </div>
  );
}

export default function BPTrendChartTool({ patientId, patientName, onClose }: Props) {
  const [mode, setMode] = useState<'demo' | 'patient'>('demo');
  const [range, setRange] = useState<'1m' | '3m' | '6m' | 'all'>('3m');
  const [showDemo, setShowDemo] = useState(true);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [logNote, setLogNote] = useState('');
  const [loggedReadings, setLoggedReadings] = useState<BPReading[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'log' | 'guide'>('chart');

  const readings = useMemo(() => {
    const base = showDemo || mode === 'demo' ? DEMO_READINGS : [];
    const all = [...base, ...loggedReadings].sort((a, b) => a.date.getTime() - b.date.getTime());
    const cutoff = range === '1m' ? 30 : range === '3m' ? 90 : range === '6m' ? 180 : 9999;
    return all.filter(r => (Date.now() - r.date.getTime()) / 86400000 <= cutoff);
  }, [showDemo, mode, range, loggedReadings]);

  const stats = useMemo(() => {
    if (!readings.length) return null;
    const sys = readings.map(r => r.systolic);
    const dia = readings.map(r => r.diastolic);
    return {
      avgSystolic: (sys.reduce((a, b) => a + b, 0) / sys.length).toFixed(1),
      avgDiastolic: (dia.reduce((a, b) => a + b, 0) / dia.length).toFixed(1),
      maxSystolic: Math.max(...sys),
      minSystolic: Math.min(...sys),
      maxDiastolic: Math.max(...dia),
      minDiastolic: Math.min(...dia),
      latest: readings[readings.length - 1],
      total: readings.length,
      inTarget: readings.filter(r => r.systolic < 130 && r.diastolic < 80).length,
    };
  }, [readings]);

  const chartData = readings.map(r => ({
    date: fmtDate(r.date),
    Systolic: r.systolic,
    Diastolic: r.diastolic,
    Pulse: r.pulse,
    classification: r.classification,
  }));

  const logReading = () => {
    if (!systolic || !diastolic) return;
    const s = parseInt(systolic);
    const d = parseInt(diastolic);
    let cls = 'Normal';
    if (s >= 180 || d >= 120) cls = 'Hypertensive Crisis';
    else if (s >= 160 || d >= 100) cls = 'Stage 2 HTN';
    else if (s >= 140 || d >= 90) cls = 'Stage 1 HTN';
    else if (s >= 130 || d >= 80) cls = 'Elevated';
    setLoggedReadings(prev => [...prev, { date: new Date(), systolic: s, diastolic: d, pulse: pulse ? parseInt(pulse) : undefined, classification: cls }]);
    setSystolic(''); setDiastolic(''); setPulse(''); setLogNote('');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>📈 BP Trend Chart</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Blood Pressure Trend Analysis</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>ESC/ESH 2023 Classification · {patientName || DEMO_PATIENT.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setMode(m => m === 'demo' ? 'patient' : 'demo')}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {mode === 'demo' ? '👤 Patient Mode' : '🎮 Demo Mode'}
            </button>
            {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {[
              { label: 'Avg Systolic', value: stats.avgSystolic, unit: 'mmHg', color: '#dc2626' },
              { label: 'Avg Diastolic', value: stats.avgDiastolic, unit: 'mmHg', color: '#f97316' },
              { label: 'Max Systolic', value: stats.maxSystolic, unit: 'mmHg', color: '#ef4444' },
              { label: 'Min Systolic', value: stats.minSystolic, unit: 'mmHg', color: '#10b981' },
              { label: 'In Target', value: `${Math.round((stats.inTarget / stats.total) * 100)}%`, unit: `(${stats.inTarget}/${stats.total})`, color: '#0aaa76' },
              { label: 'Latest', value: `${stats.latest.systolic}/${stats.latest.diastolic}`, unit: 'mmHg', color: '#6366f1' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e9f3' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: '#8fa3bd' }}>{s.unit}</div>
              </div>
            ))}
          </div>
        )}

        {/* Classification guide */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STAGE_RANGES.map(s => (
            <div key={s.label} style={{ padding: '4px 10px', borderRadius: 99, background: `${s.color}12`, border: `1px solid ${s.color}30`, fontSize: 9, fontWeight: 700, color: s.color, display: 'flex', alignItems: 'center', gap: 4 }}>
              {s.icon} {s.label}: {s.range}
            </div>
          ))}
        </div>

        {/* Range selector + mode toggle */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8fa3bd' }}>📅 Range:</div>
          {(['1m', '3m', '6m', 'all'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${range === r ? '#dc2626' : '#e2e9f3'}`, background: range === r ? '#fef2f2' : '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: range === r ? '#dc2626' : '#64748b' }}>
              {r === '1m' ? '1 Month' : r === '3m' ? '3 Months' : r === '6m' ? '6 Months' : 'All Time'}
            </button>
          ))}
          {mode === 'demo' && (
            <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
              <input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} style={{ accentColor: '#dc2626' }} />
              Show Demo Data
            </label>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e8eef5' }}>
          {[
            { id: 'chart', label: '📈 Trend Chart' },
            { id: 'log', label: '📋 Log Reading' },
            { id: 'guide', label: '📖 Clinical Guide' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2.5px solid ${activeTab === t.id ? '#dc2626' : 'transparent'}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: activeTab === t.id ? '#dc2626' : '#94a3b8' }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'chart' && (
          <div style={{ minHeight: 300 }}>
            {chartData.length < 2 ? (
              <div style={{ textAlign: 'center', color: '#8fa3bd', padding: '40px 0', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                Log at least 2 readings to see trend charts
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis domain={[50, 200]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <ReferenceLine y={130} stroke="#10b981" strokeDasharray="5 4" label={{ value: 'SYS Target 130', fill: '#10b981', fontSize: 9, position: 'right' }} />
                  <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="5 4" label={{ value: 'DIA Target 80', fill: '#3b82f6', fontSize: 9, position: 'right' }} />
                  <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
                  <ReferenceLine y={160} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
                  <Area type="monotone" dataKey="Systolic" stroke="#dc2626" strokeWidth={3} fill="#dc262610" dot={{ r: 3, fill: '#dc2626', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="Diastolic" stroke="#3b82f6" strokeWidth={3} fill="#3b82f610" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {activeTab === 'log' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Log New BP Reading</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Systolic *</span><span style={{ color: '#dc2626' }}>mmHg</span>
                  </label>
                  <input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} min={60} max={250} placeholder="e.g. 130" style={{ width: '100%', padding: '9px 11px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Diastolic *</span><span style={{ color: '#3b82f6' }}>mmHg</span>
                  </label>
                  <input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} min={40} max={150} placeholder="e.g. 80" style={{ width: '100%', padding: '9px 11px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Pulse</span><span style={{ color: '#8b5cf6' }}>bpm</span>
                </label>
                <input type="number" value={pulse} onChange={e => setPulse(e.target.value)} min={30} max={220} placeholder="e.g. 72" style={{ width: '100%', padding: '9px 11px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Note</label>
                <input value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="Any symptoms? e.g. headache, dizziness" style={{ width: '100%', padding: '9px 11px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <button onClick={logReading} disabled={!systolic || !diastolic} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: (!systolic || !diastolic) ? .5 : 1 }}>
                📋 Log Reading
              </button>
            </div>
            {loggedReadings.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8fa3bd', marginBottom: 6 }}>Today's Logged Readings ({loggedReadings.length})</div>
                {loggedReadings.slice().reverse().map((r, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e9f3', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 15, color: '#dc2626' }}>{r.systolic}/{r.diastolic}</span>
                      {r.pulse && <span style={{ fontSize: 11, color: '#8fa3bd', marginLeft: 8 }}>HR: {r.pulse} bpm</span>}
                    </div>
                    <span style={{ fontSize: 9, color: '#8fa3bd' }}>{fmtDate(r.date)} {fmtAgo(r.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'guide' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d', marginBottom: 8 }}>✅ Proper Measurement Technique</div>
              <ul style={{ fontSize: 11, color: '#166534', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                <li>Sit quietly for 5 minutes before measuring</li>
                <li>Feet flat on floor, back supported</li>
                <li>Cuff at heart level on bare upper arm</li>
                <li>No caffeine or smoking 30 min prior</li>
                <li>Empty bladder before measurement</li>
                <li>Take 2–3 readings, 1–2 min apart, average them</li>
                <li>Measure at same time each day (AM & PM)</li>
              </ul>
            </div>
            <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#b45309', marginBottom: 8 }}>🎯 Treatment Targets</div>
              <ul style={{ fontSize: 11, color: '#92400e', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                <li><strong>General:</strong> &lt;130/80 mmHg (ESC/ESH 2023)</li>
                <li><strong>Diabetes:</strong> &lt;130/80 mmHg</li>
                <li><strong>CKD:</strong> &lt;130/80 mmHg</li>
                <li><strong>Elderly (≥80y):</strong> &lt;140/80 mmHg if tolerated</li>
                <li><strong>Consider:</strong> lifestyle + 2-drug combo if &gt;20/10 above target</li>
                <li>Home monitoring: 2× daily for 7 days before visits</li>
              </ul>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 12, padding: 16, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#b91c1c', marginBottom: 8 }}>🚨 When to Escalate</div>
              <ul style={{ fontSize: 11, color: '#991b1b', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                <li><strong>Crisis:</strong> SBP ≥180 or DBP ≥120 → Emergency</li>
                <li><strong>Severe:</strong> SBP ≥160 or DBP ≥100 → Clinic within 48h</li>
                <li><strong>Sustained:</strong> &gt;target on 3+ meds → Refer HTN specialist</li>
                <li><strong>Hypotension:</strong> SBP &lt;90 + dizziness → Review medications</li>
                <li><strong>New symptoms:</strong> Chest pain, SOB, neuro deficits → 999</li>
              </ul>
            </div>
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1d4ed8', marginBottom: 8 }}>📊 Classification (ESC/ESH 2023)</div>
              <div style={{ fontSize: 11, color: '#1e3a8a', lineHeight: 2 }}>
                {STAGE_RANGES.map(s => (
                  <div key={s.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{s.icon}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.label}:</span>
                    <span>{s.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reading history table */}
        <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e8eef5', borderRadius: 10 }}>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                {['Date', 'Systolic', 'Diastolic', 'Pulse', 'Classification'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: .5, borderBottom: '1px solid #e2e9f3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readings.slice().reverse().map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 12px', color: '#64748b' }}>{fmtDate(r.date)}</td>
                  <td style={{ padding: '7px 12px', fontWeight: 800, fontFamily: 'monospace', color: r.systolic >= 140 ? '#ef4444' : r.systolic >= 130 ? '#f59e0b' : '#10b981' }}>{r.systolic}</td>
                  <td style={{ padding: '7px 12px', fontWeight: 800, fontFamily: 'monospace', color: r.diastolic >= 90 ? '#ef4444' : r.diastolic >= 80 ? '#f59e0b' : '#3b82f6' }}>{r.diastolic}</td>
                  <td style={{ padding: '7px 12px', color: '#64748b' }}>{r.pulse || '—'}</td>
                  <td style={{ padding: '7px 12px' }}>
                    <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: 9, fontWeight: 700, background: `${(CLASSIFICATION_COLORS[r.classification || 'Normal'])}15`, color: CLASSIFICATION_COLORS[r.classification || 'Normal'] }}>{r.classification}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
