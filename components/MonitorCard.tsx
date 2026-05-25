'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/amexan/MonitorCard.tsx
// Individual monitoring parameter card with inline trend chart
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { AlertLevel } from '@/lib/clinicalProtocols';

const LEVEL_COLORS: Record<AlertLevel, string> = {
  emergency: '#ef4444',
  urgent:    '#f59e0b',
  watch:     '#06b6d4',
  normal:    '#10d47a',
};

interface TrendPoint { day: string; val: number }

interface MonitorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  level?: AlertLevel;
  subtext?: string;
  trend?: TrendPoint[];
  refLow?: number;
  refHigh?: number;
  color?: string;
  icon?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#141f2e',
        border: '1px solid #2a3d57',
        borderRadius: 6,
        padding: '6px 10px',
        fontSize: 11,
      }}
    >
      <div style={{ color: '#64748b', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: '#e8edf5' }}>
        {payload[0].value}
      </div>
    </div>
  );
}

export default function MonitorCard({
  title,
  value,
  unit,
  level = 'normal',
  subtext,
  trend,
  refLow,
  refHigh,
  color,
  icon,
}: MonitorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const lc = color || LEVEL_COLORS[level];

  return (
    <div
      onClick={() => trend && setExpanded((e) => !e)}
      style={{
        background: '#0d1520',
        border: `1px solid ${level === 'emergency' ? '#ef444435' : level === 'urgent' ? '#f59e0b25' : '#1e2d42'}`,
        borderRadius: 8,
        padding: '11px 13px',
        cursor: trend ? 'pointer' : 'default',
        transition: 'border-color .2s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div
          style={{
            fontSize: 9,
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
          {title}
        </div>
        {level === 'emergency' && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#ef4444',
              display: 'block',
              flexShrink: 0,
              animation: 'pulse 1.4s infinite',
            }}
          />
        )}
        {level === 'urgent' && (
          <span
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'block' }}
          />
        )}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: lc,
            lineHeight: 1,
            fontFamily: 'IBM Plex Mono, monospace',
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 10, color: '#64748b' }}>{unit}</span>}
      </div>

      {subtext && (
        <div style={{ fontSize: 10, color: '#3a4a5e', marginTop: 3 }}>{subtext}</div>
      )}

      {/* Trend indicator */}
      {trend && !expanded && (
        <div style={{ fontSize: 9, color: '#2a3d57', marginTop: 4 }}>
          ▼ tap for trend
        </div>
      )}

      {/* Inline trend chart */}
      {expanded && trend && trend.length >= 2 && (
        <div style={{ marginTop: 10 }}>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2a3d" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 8, fill: '#3a4a5e' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#3a4a5e' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {refHigh !== undefined && (
                <ReferenceLine y={refHigh} stroke="#ef444455" strokeDasharray="4 2" />
              )}
              {refLow !== undefined && (
                <ReferenceLine y={refLow} stroke="#f59e0b55" strokeDasharray="4 2" />
              )}
              <Area
                type="monotone"
                dataKey="val"
                stroke={lc}
                strokeWidth={1.5}
                fill={`${lc}15`}
                dot={false}
                activeDot={{ r: 3, fill: lc }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}