'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Legend } from 'recharts';
import { DEMO_PATIENT, fmtDate, fmtAgo } from './types';

interface Props { patientId?: string; patientName?: string; onClose?: () => void; }

const DEMO_DATA = [
  { date: new Date('2026-01-15'), systolic: 145, diastolic: 92, inTarget: false },
  { date: new Date('2026-01-22'), systolic: 138, diastolic: 88, inTarget: false },
  { date: new Date('2026-02-01'), systolic: 150, diastolic: 95, inTarget: false },
  { date: new Date('2026-02-08'), systolic: 142, diastolic: 90, inTarget: false },
  { date: new Date('2026-02-15'), systolic: 135, diastolic: 85, inTarget: false },
  { date: new Date('2026-02-22'), systolic: 128, diastolic: 82, inTarget: true },
  { date: new Date('2026-03-01'), systolic: 132, diastolic: 84, inTarget: false },
  { date: new Date('2026-03-08'), systolic: 125, diastolic: 78, inTarget: true },
  { date: new Date('2026-03-15'), systolic: 120, diastolic: 76, inTarget: true },
  { date: new Date('2026-03-22'), systolic: 118, diastolic: 74, inTarget: true },
  { date: new Date('2026-03-29'), systolic: 122, diastolic: 78, inTarget: true },
  { date: new Date('2026-04-05'), systolic: 126, diastolic: 80, inTarget: true },
  { date: new Date('2026-04-12'), systolic: 128, diastolic: 76, inTarget: true },
  { date: new Date('2026-04-19'), systolic: 124, diastolic: 74, inTarget: true },
  { date: new Date('2026-04-26'), systolic: 120, diastolic: 72, inTarget: true },
  { date: new Date('2026-05-03'), systolic: 122, diastolic: 74, inTarget: true },
  { date: new Date('2026-05-10'), systolic: 118, diastolic: 70, inTarget: true },
  { date: new Date('2026-05-17'), systolic: 115, diastolic: 68, inTarget: true },
  { date: new Date('2026-05-24'), systolic: 120, diastolic: 76, inTarget: true },
  { date: new Date('2026-05-26'), systolic: 118, diastolic: 70, inTarget: true },
];

export default function BPTargetAchievement({ patientName, onClose }: Props) {
  const [showDemo, setShowDemo] = useState(true);
  const [targetSys, setTargetSys] = useState('130');
  const [targetDia, setTargetDia] = useState('80');

  const readings = useMemo(() => showDemo ? DEMO_DATA : [], [showDemo]);

  const stats = useMemo(() => {
    if (!readings.length) return null;
    const tSys = parseInt(targetSys) || 130;
    const tDia = parseInt(targetDia) || 80;
    const inTarget = readings.filter(r => r.systolic < tSys && r.diastolic < tDia);
    const above = readings.filter(r => r.systolic >= tSys || r.diastolic >= tDia);
    const pct = readings.length ? Math.round((inTarget.length / readings.length) * 100) : 0;
    const trend = readings.length >= 3 ? readings.slice(-3).filter(r => r.systolic < tSys && r.diastolic < tDia).length >= 2 ? 'improving' : readings.slice(-3).filter(r => r.systolic >= tSys || r.diastolic >= tDia).length >= 2 ? 'worsening' : 'stable' : 'stable';
    return { inTarget: inTarget.length, above: above.length, total: readings.length, pct, trend, tSys, tDia, last: readings[readings.length - 1], first: readings[0] };
  }, [readings, targetSys, targetDia]);

  const chartData = readings.map(r => ({ date: fmtDate(r.date), SBP: r.systolic, DBP: r.diastolic, inTarget: r.inTarget }));

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🎯 BP Target Achievement</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>BP Goal Monitoring</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>Target: &lt;{targetSys}/{targetDia} · {patientName || DEMO_PATIENT.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Target config */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Target Systolic</label>
            <input type="number" value={targetSys} onChange={e => setTargetSys(e.target.value)} style={{ width: 80, padding: '7px 9px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 8, fontSize: 14, fontFamily: 'monospace', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Target Diastolic</label>
            <input type="number" value={targetDia} onChange={e => setTargetDia(e.target.value)} style={{ width: 80, padding: '7px 9px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 8, fontSize: 14, fontFamily: 'monospace', fontWeight: 700, outline: 'none', textAlign: 'center' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
            <input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} style={{ accentColor: '#f97316' }} /> Use Demo Data
          </label>
        </div>

        {stats && (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {[
                { label: 'In Target', value: `${stats.pct}%`, sub: `${stats.inTarget}/${stats.total} readings`, color: '#10b981' },
                { label: 'Above Target', value: `${100 - stats.pct}%`, sub: `${stats.above}/${stats.total} readings`, color: '#ef4444' },
                { label: 'Trend', value: stats.trend, sub: 'Last 3 readings', color: stats.trend === 'improving' ? '#10b981' : stats.trend === 'worsening' ? '#ef4444' : '#f59e0b' },
                { label: 'Latest BP', value: `${stats.last.systolic}/${stats.last.diastolic}`, sub: fmtAgo(DEMO_DATA[DEMO_DATA.length - 1].date), color: stats.last.systolic < stats.tSys && stats.last.diastolic < stats.tDia ? '#10b981' : '#ef4444' },
                { label: 'Avg Systolic', value: `${Math.round(readings.reduce((a, r) => a + r.systolic, 0) / readings.length)}`, sub: 'mmHg', color: '#f97316' },
                { label: 'Avg Diastolic', value: `${Math.round(readings.reduce((a, r) => a + r.diastolic, 0) / readings.length)}`, sub: 'mmHg', color: '#3b82f6' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e9f3' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color: s.color, lineHeight: 1.2, textTransform: 'capitalize' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: '#8fa3bd' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Achievement bar */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a' }}>📊 Overall Achievement</span>
                <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, color: stats.pct >= 70 ? '#10b981' : stats.pct >= 50 ? '#f59e0b' : '#ef4444' }}>{stats.pct}%</span>
              </div>
              <div style={{ height: 20, background: '#e2e9f3', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${stats.pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${stats.pct >= 70 ? '#10b981' : stats.pct >= 50 ? '#f59e0b' : '#ef4444'}, ${stats.pct >= 70 ? '#34d399' : stats.pct >= 50 ? '#fbbf24' : '#fca5a5'})`, transition: 'width .5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#8fa3bd', marginTop: 4 }}>
                <span>{Math.round((100 - stats.pct))}% Out of target</span>
                <span>Goal: ≥70% in target</span>
              </div>
            </div>

            {/* Trend chart */}
            {chartData.length >= 2 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>📈 BP vs Target</div>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[50, 200]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <ReferenceLine y={stats.tSys} stroke="#f97316" strokeDasharray="5 4" label={{ value: `SYS Target ${stats.tSys}`, fill: '#f97316', fontSize: 9, position: 'right' }} />
                    <ReferenceLine y={stats.tDia} stroke="#3b82f6" strokeDasharray="5 4" label={{ value: `DIA Target ${stats.tDia}`, fill: '#3b82f6', fontSize: 9, position: 'right' }} />
                    <Area type="monotone" dataKey="SBP" stroke="#f97316" strokeWidth={2} fill="#f9731610" dot={{ r: 3 }} />
                    <Area type="monotone" dataKey="DBP" stroke="#3b82f6" strokeWidth={2} fill="#3b82f610" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Clinical insights */}
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d', marginBottom: 8 }}>💡 Clinical Insights</div>
          <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#166534' }}>
            {stats && stats.pct >= 70 ? (
              <>
                <li>✅ Patient is at target {stats.pct}% of the time — excellent control</li>
                <li>Continue current regimen and monitoring schedule</li>
                <li>Next review: maintain lifestyle modifications</li>
              </>
            ) : stats && stats.pct >= 50 ? (
              <>
                <li>⚠️ Patient achieving target {stats.pct}% — moderate control</li>
                <li>Consider medication adjustment or dose up-titration</li>
                <li>Reinforce lifestyle modifications (DASH diet, exercise)</li>
              </>
            ) : (
              <>
                <li>🚨 BP controlled only {stats?.pct || 0}% — inadequate control</li>
                <li>Urgent medication review needed — consider escalation</li>
                <li>Confirm adherence, rule out white-coat HTN, check for secondary causes</li>
              </>
            )}
            <li>ESC/ESH 2023 target: &lt;130/80 mmHg for most adults</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
