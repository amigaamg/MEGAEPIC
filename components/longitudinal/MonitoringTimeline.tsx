'use client';

import React from 'react';
import type { MonitoringSeries, TrendDirection } from '@/lib/amexan/longitudinal/types';
import { getChartData } from '@/lib/amexan/longitudinal/monitoringEngine';

interface Props {
  seriesList: MonitoringSeries[];
}

const TREND_ICONS: Record<TrendDirection, string> = {
  improving: '↓',
  stable: '→',
  worsening: '↑',
  variable: '↕',
};

const TREND_COLORS: Record<TrendDirection, string> = {
  improving: 'text-emerald-600',
  stable: 'text-gray-500',
  worsening: 'text-red-600',
  variable: 'text-amber-600',
};

export default function MonitoringTimeline({ seriesList }: Props) {
  if (!seriesList.length) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">
        No monitoring data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {seriesList.map(series => (
        <MonitoringChart key={series.parameter} series={series} />
      ))}
    </div>
  );
}

function MonitoringChart({ series }: { series: MonitoringSeries }) {
  const chartData = getChartData(series);
  const maxVal = Math.max(...chartData.values, series.upperLimit ?? 0) * 1.15 + 5;
  const minVal = Math.min(...chartData.values, series.lowerLimit ?? 0) * 0.85 - 5;
  const range = maxVal - minVal || 1;

  // Limit displayed points to prevent visual clutter
  const maxPoints = 20;
  const displayData = chartData.values.length > maxPoints
    ? {
        labels: chartData.labels.slice(-maxPoints),
        values: chartData.values.slice(-maxPoints),
      }
    : chartData;

  const latest = series.dataPoints[series.dataPoints.length - 1];
  const previous = series.dataPoints.length > 1 ? series.dataPoints[series.dataPoints.length - 2] : null;

  const SVG_WIDTH = 600;
  const SVG_HEIGHT = 120;
  const PADDING = 5;
  const plotWidth = SVG_WIDTH - PADDING * 2;
  const plotHeight = SVG_HEIGHT - PADDING * 2;
  const pointCount = displayData.values.length;

  // Generate SVG polyline points
  const points = displayData.values.map((val, i) => {
    const x = PADDING + (i / Math.max(pointCount - 1, 1)) * plotWidth;
    const y = PADDING + (maxVal - val) / range * plotHeight;
    return `${x},${y}`;
  }).join(' ');

  // Reference lines
  const upperLine = series.upperLimit !== undefined
    ? PADDING + (maxVal - series.upperLimit) / range * plotHeight
    : null;
  const lowerLine = series.lowerLimit !== undefined
    ? PADDING + (maxVal - series.lowerLimit) / range * plotHeight
    : null;
  const criticalHighLine = series.criticalHigh !== undefined
    ? PADDING + (maxVal - series.criticalHigh) / range * plotHeight
    : null;
  const criticalLowLine = series.criticalLow !== undefined
    ? PADDING + (maxVal - series.criticalLow) / range * plotHeight
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-800">{series.label}</h3>
          <span className={`flex items-center gap-1 text-xs font-medium ${TREND_COLORS[series.trend]}`}>
            <span>{TREND_ICONS[series.trend]}</span>
            <span className="capitalize">{series.trend}</span>
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {latest?.value ?? '—'} <span className="text-sm font-normal text-gray-500">{series.unit}</span>
          </p>
          {previous && (
            <p className={`text-xs ${(latest?.value ?? 0) >= (previous?.value ?? 0) ? 'text-red-500' : 'text-emerald-500'}`}>
              {previous ? ((latest?.value ?? 0) - (previous?.value ?? 0)).toFixed(1) : ''} from previous
            </p>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto"
          style={{ minWidth: `${Math.max(pointCount * 30, 300)}px` }}
        >
          {/* Reference ranges */}
          {criticalHighLine !== null && (
            <line x1={PADDING} y1={criticalHighLine} x2={SVG_WIDTH - PADDING} y2={criticalHighLine}
              stroke="#fca5a5" strokeWidth="1" strokeDasharray="4,3" />
          )}
          {criticalLowLine !== null && (
            <line x1={PADDING} y1={criticalLowLine} x2={SVG_WIDTH - PADDING} y2={criticalLowLine}
              stroke="#fca5a5" strokeWidth="1" strokeDasharray="4,3" />
          )}
          {upperLine !== null && (
            <line x1={PADDING} y1={upperLine} x2={SVG_WIDTH - PADDING} y2={upperLine}
              stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
          )}
          {lowerLine !== null && (
            <line x1={PADDING} y1={lowerLine} x2={SVG_WIDTH - PADDING} y2={lowerLine}
              stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
          )}

          {/* Data line */}
          {points.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={series.trend === 'worsening' ? '#ef4444' : series.trend === 'improving' ? '#10b981' : '#3b82f6'}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Data points */}
          {displayData.values.map((val, i) => {
            const x = PADDING + (i / Math.max(pointCount - 1, 1)) * plotWidth;
            const y = PADDING + (maxVal - val) / range * plotHeight;
            const isOutside = (series.lowerLimit !== undefined && val < series.lowerLimit)
              || (series.upperLimit !== undefined && val > series.upperLimit);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={isOutside ? '#ef4444' : series.trend === 'worsening' ? '#f87171' : series.trend === 'improving' ? '#34d399' : '#60a5fa'}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        {displayData.labels.filter((_, i) =>
          i === 0 || i === displayData.labels.length - 1 || i % Math.max(Math.floor(displayData.labels.length / 5), 1) === 0
        ).map((label, i, arr) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* Reference range legend */}
      <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
        {series.lowerLimit !== undefined && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-300 inline-block" /> Low: {series.lowerLimit}{series.unit}
          </span>
        )}
        {series.upperLimit !== undefined && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-300 inline-block" /> High: {series.upperLimit}{series.unit}
          </span>
        )}
        {series.criticalLow !== undefined && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-300 inline-block" /> Crit: {series.criticalLow}{series.unit}
          </span>
        )}
      </div>
    </div>
  );
}
