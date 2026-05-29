'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Legend } from 'recharts';
import { DEMO_PATIENT, fmtDate } from './types';

interface Props { patientName?: string; onClose?: () => void; }

interface HbA1cEntry { date: Date; value: number; lab?: string; }

const DEMO_DATA: HbA1cEntry[] = [
  { date: new Date('2025-06-15'), value: 8.9, lab: 'Lancet Labs' },
  { date: new Date('2025-09-20'), value: 8.2, lab: 'Lancet Labs' },
  { date: new Date('2025-12-18'), value: 7.5, lab: 'Lancet Labs' },
  { date: new Date('2026-01-15'), value: 7.8, lab: 'Lancet Labs' },
  { date: new Date('2026-02-12'), value: 7.2, lab: 'Lancet Labs' },
  { date: new Date('2026-03-15'), value: 6.8, lab: 'Lancet Labs' },
  { date: new Date('2026-04-10'), value: 6.5, lab: 'Lancet Labs' },
  { date: new Date('2026-05-08'), value: 6.3, lab: 'Lancet Labs' },
];

export default function HbA1cTrendTool({ patientName, onClose }: Props) {
  const [showDemo, setShowDemo] = useState(true);
  const [value, setValue] = useState('');
  const [lab, setLab] = useState('');
  const [customData, setCustomData] = useState<HbA1cEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'log' | 'guide'>('chart');

  const entries = useMemo(() => {
    const base = showDemo ? DEMO_DATA : [];
    return [...base, ...customData].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [showDemo, customData]);

  const stats = useMemo(() => {
    if (!entries.length) return null;
    const vals = entries.map(e => e.value);
    const latest = entries[entries.length - 1];
    const first = entries[0];
    const change = latest.value - first.value;
    const trend = change < -0.5 ? 'improving' : change > 0.5 ? 'worsening' : 'stable';
    return {
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
      min: Math.min(...vals),
      max: Math.max(...vals),
      latest: latest.value,
      first: first.value,
      change: change.toFixed(1),
      trend,
      total: entries.length,
      dateRange: `${fmtDate(first.date)} — ${fmtDate(latest.date)}`,
    };
  }, [entries]);

  const chartData = entries.map(e => ({ date: fmtDate(e.date), HbA1c: e.value }));

  const logReading = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    setCustomData(prev => [...prev, { date: new Date(), value: v, lab: lab || undefined }]);
    setValue(''); setLab('');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>📈 HbA1c Trend</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>HbA1c Tracking & Diabetes Control</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || DEMO_PATIENT.name} · Target &lt;7.0%</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {[
              { label: 'Latest HbA1c', value: `${stats.latest}%`, sub: 'Current', color: stats.latest <= 7 ? '#10b981' : stats.latest <= 8 ? '#f59e0b' : '#ef4444' },
              { label: 'Average', value: `${stats.avg}%`, sub: stats.total + ' readings', color: '#7c3aed' },
              { label: 'Lowest', value: `${stats.min}%`, sub: 'Best value', color: '#10b981' },
              { label: 'Highest', value: `${stats.max}%`, sub: 'Worst value', color: '#ef4444' },
              { label: 'Change', value: `${stats.change}%`, sub: stats.trend, color: stats.trend === 'improving' ? '#10b981' : stats.trend === 'worsening' ? '#ef4444' : '#f59e0b' },
              { label: 'Period', value: stats.dateRange, sub: `${stats.total} entries`, color: '#64748b' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e9f3' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: s.color, lineHeight: 1.2, textTransform: 'capitalize' }}>{s.value}</div>
                <div style={{ fontSize: 9, color: '#8fa3bd' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e8eef5' }}>
          {[
            { id: 'chart', label: '📈 Trend Chart' },
            { id: 'log', label: '📋 Log Reading' },
            { id: 'guide', label: '📖 Clinical Guide' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2.5px solid ${activeTab === t.id ? '#7c3aed' : 'transparent'}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: activeTab === t.id ? '#7c3aed' : '#94a3b8' }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'chart' && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer', marginBottom: 8 }}>
              <input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} style={{ accentColor: '#7c3aed' }} /> Show Demo Data
            </label>
            {chartData.length < 2 ? (
              <div style={{ textAlign: 'center', color: '#8fa3bd', padding: 24 }}>Log at least 2 HbA1c readings to see trend</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[4, 12]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="5 4" strokeWidth={2} label={{ value: 'Target 7.0%', fill: '#10b981', fontSize: 9, position: 'right' }} />
                  <ReferenceLine y={8} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Action 8.0%', fill: '#f59e0b', fontSize: 9, position: 'right' }} />
                  <Area type="monotone" dataKey="HbA1c" stroke="#7c3aed" strokeWidth={3} fill="#7c3aed10" dot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {activeTab === 'log' && (
          <div style={{ maxWidth: 400 }}>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 10 }}>📋 Log HbA1c Result</div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>HbA1c Value *</span><span style={{ color: '#7c3aed' }}>%</span>
                </label>
                <input type="number" value={value} onChange={e => setValue(e.target.value)} min={4} max={15} step={0.1} placeholder="e.g. 7.2" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Lab Name</label>
                <input value={lab} onChange={e => setLab(e.target.value)} placeholder="e.g. Lancet Laboratories" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <button onClick={logReading} disabled={!value} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: !value ? .5 : 1 }}>
                📋 Log Result
              </button>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 8 }}>🎯 HbA1c Targets</div>
              <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#166534' }}>
                <li><strong>General:</strong> &lt;7.0% (&lt;53 mmol/mol)</li>
                <li><strong>Strict:</strong> &lt;6.5% (young, healthy, new onset)</li>
                <li><strong>Relaxed:</strong> &lt;8.0% (elderly, frail, complications)</li>
                <li>Each 1% HbA1c reduction = 21% fewer diabetes-related deaths</li>
                <li>Each 1% HbA1c reduction = 37% fewer microvascular complications</li>
              </ul>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 12, padding: 16, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#b91c1c', marginBottom: 8 }}>🚨 Action Thresholds</div>
              <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#991b1b' }}>
                <li><strong>&gt;10%:</strong> Urgent — consider DKA/HHS, escalate therapy</li>
                <li><strong>8–10%:</strong> Poor control — intensification needed</li>
                <li><strong>7–8%:</strong> Borderline — lifestyle + medication review</li>
                <li><strong>&lt;6.5% (on insulin):</strong> Watch for hypoglycaemia</li>
                <li>Test every 3–6 months (more frequent if not at target)</li>
              </ul>
            </div>
            <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#b45309', marginBottom: 8 }}>💊 Medication Adjustment</div>
              <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#92400e' }}>
                <li>If HbA1c &gt;target by &lt;1.5% → add another oral agent</li>
                <li>If HbA1c &gt;target by &gt;1.5% → consider insulin</li>
                <li>If on insulin: titrate by 2–6 units/ day based on fasting BG</li>
                <li>Consider GLP-1 RA or SGLT2i for CV/renal benefit</li>
              </ul>
            </div>
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1d4ed8', marginBottom: 8 }}>🔬 Monitoring Schedule</div>
              <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#1e3a8a' }}>
                <li><strong>Every 3 months:</strong> HbA1c (if not at target or on insulin)</li>
                <li><strong>Every 6 months:</strong> HbA1c (if stable at target)</li>
                <li><strong>Annual:</strong> Renal function, lipids, foot exam, retinal screening</li>
                <li><strong>At every visit:</strong> BP, weight, review hypoglycaemia events</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
