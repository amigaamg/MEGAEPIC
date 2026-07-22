// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Monitoring Engine — vitals, trends, and graph data processing
// ═══════════════════════════════════════════════════════════════════════════════

import type { MonitoringSeries, MonitoringParameter, TrendDirection, MonitoringDataPoint } from './types';
import type { Vitals } from '../encounter/encounterState';

// ── Build monitoring series from vitals history ──────────────────────────────

export function buildMonitoringSeries(
  vitalsHistory: Vitals[],
): MonitoringSeries[] {
  const seriesMap = new Map<MonitoringParameter, MonitoringDataPoint[]>();

  for (const v of vitalsHistory) {
    const ts = v.recordedAt || Date.now();

    if (v.temp !== undefined) {
      addPoint(seriesMap, 'temperature', ts, v.temp);
    }
    if (v.hr !== undefined) {
      addPoint(seriesMap, 'heart_rate', ts, v.hr);
    }
    if (v.rr !== undefined) {
      addPoint(seriesMap, 'respiratory_rate', ts, v.rr);
    }
    if (v.bpSystolic !== undefined) {
      addPoint(seriesMap, 'bp_systolic', ts, v.bpSystolic);
    }
    if (v.bpDiastolic !== undefined) {
      addPoint(seriesMap, 'bp_diastolic', ts, v.bpDiastolic);
    }
    if (v.spo2 !== undefined) {
      addPoint(seriesMap, 'spo2', ts, v.spo2);
    }
    if (v.bloodGlucose !== undefined) {
      addPoint(seriesMap, 'blood_glucose', ts, v.bloodGlucose);
    }
  }

  const series: MonitoringSeries[] = [];

  for (const [param, points] of seriesMap) {
    points.sort((a, b) => a.timestamp - b.timestamp);
    series.push(createSeries(param, points));
  }

  return series;
}

function addPoint(
  map: Map<MonitoringParameter, MonitoringDataPoint[]>,
  param: MonitoringParameter,
  timestamp: number,
  value: number,
) {
  if (!map.has(param)) map.set(param, []);
  map.get(param)!.push({ timestamp, value });
}

function createSeries(param: MonitoringParameter, points: MonitoringDataPoint[]): MonitoringSeries {
  const config = PARAMETER_CONFIG[param] || {
    label: param.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    unit: '',
    lowerLimit: undefined,
    upperLimit: undefined,
    criticalLow: undefined,
    criticalHigh: undefined,
  };

  return {
    parameter: param,
    label: config.label,
    unit: config.unit,
    dataPoints: points,
    trend: computeTrendDirection(points),
    lowerLimit: config.lowerLimit,
    upperLimit: config.upperLimit,
    criticalLow: config.criticalLow,
    criticalHigh: config.criticalHigh,
  };
}

// ── Trend computation ────────────────────────────────────────────────────────

function computeTrendDirection(points: MonitoringDataPoint[]): TrendDirection {
  if (points.length < 3) return 'stable';

  const recent = points.slice(-3);
  const values = recent.map(p => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = secondMean - firstMean;

  if (Math.abs(diff) < 0.05 * mean) return 'stable';
  return diff > 0 ? 'worsening' : 'improving';
}

// ── Parameter reference ranges ───────────────────────────────────────────────

interface ParameterConfig {
  label: string;
  unit: string;
  lowerLimit?: number;
  upperLimit?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

const PARAMETER_CONFIG: Record<MonitoringParameter, ParameterConfig> = {
  temperature: { label: 'Temperature', unit: '°C', lowerLimit: 36.0, upperLimit: 37.5, criticalLow: 35.0, criticalHigh: 39.0 },
  heart_rate: { label: 'Heart Rate', unit: 'bpm', lowerLimit: 60, upperLimit: 100, criticalLow: 40, criticalHigh: 140 },
  respiratory_rate: { label: 'Respiratory Rate', unit: '/min', lowerLimit: 12, upperLimit: 20, criticalLow: 8, criticalHigh: 30 },
  bp_systolic: { label: 'Systolic BP', unit: 'mmHg', lowerLimit: 90, upperLimit: 140, criticalLow: 70, criticalHigh: 200 },
  bp_diastolic: { label: 'Diastolic BP', unit: 'mmHg', lowerLimit: 60, upperLimit: 90, criticalLow: 40, criticalHigh: 120 },
  spo2: { label: 'SpO₂', unit: '%', lowerLimit: 95, upperLimit: 100, criticalLow: 90, criticalHigh: undefined },
  urine_output: { label: 'Urine Output', unit: 'mL/hr', lowerLimit: 30, upperLimit: undefined, criticalLow: 15, criticalHigh: undefined },
  fluid_balance: { label: 'Fluid Balance', unit: 'mL', lowerLimit: -500, upperLimit: 500, criticalLow: -1000, criticalHigh: 1000 },
  weight: { label: 'Weight', unit: 'kg', lowerLimit: undefined, upperLimit: undefined },
  blood_glucose: { label: 'Blood Glucose', unit: 'mmol/L', lowerLimit: 3.9, upperLimit: 7.8, criticalLow: 3.0, criticalHigh: 15.0 },
  news: { label: 'NEWS Score', unit: '', lowerLimit: 0, upperLimit: 4, criticalLow: undefined, criticalHigh: 7 },
  pain_score: { label: 'Pain Score', unit: '/10', lowerLimit: 0, upperLimit: 3, criticalLow: undefined, criticalHigh: 8 },
};

// ── Compute NEWS score ───────────────────────────────────────────────────────

export function computeNEWS(v: Vitals): number {
  let score = 0;
  if (v.rr !== undefined) {
    if (v.rr <= 8) score += 3;
    else if (v.rr <= 11) score += 1;
    else if (v.rr <= 20) score += 0;
    else if (v.rr <= 24) score += 2;
    else score += 3;
  }
  if (v.spo2 !== undefined) {
    if (v.spo2 <= 91) score += 3;
    else if (v.spo2 <= 93) score += 2;
    else if (v.spo2 <= 95) score += 1;
  }
  if (v.temp !== undefined) {
    if (v.temp <= 35.0) score += 3;
    else if (v.temp <= 36.0) score += 1;
    else if (v.temp <= 38.0) score += 0;
    else if (v.temp <= 39.0) score += 1;
    else score += 2;
  }
  if (v.hr !== undefined) {
    if (v.hr <= 40) score += 3;
    else if (v.hr <= 50) score += 1;
    else if (v.hr <= 90) score += 0;
    else if (v.hr <= 110) score += 1;
    else if (v.hr <= 130) score += 2;
    else score += 3;
  }
  if (v.bpSystolic !== undefined) {
    if (v.bpSystolic <= 90) score += 3;
    else if (v.bpSystolic <= 100) score += 2;
    else if (v.bpSystolic <= 110) score += 1;
    else if (v.bpSystolic <= 219) score += 0;
    else score += 3;
  }
  // AVPU
  if (v.avpu === 'unresponsive') score += 3;
  else if (v.avpu === 'pain') score += 2;
  else if (v.avpu === 'voice') score += 1;

  return score;
}

export function interpretNEWS(score: number): string {
  if (score >= 7) return 'High — urgent review required';
  if (score >= 5) return 'Medium — prompt review';
  if (score >= 3) return 'Low — routine review';
  return 'Normal';
}

// ── Get chart-friendly data ──────────────────────────────────────────────────

export function getChartData(series: MonitoringSeries): { labels: string[]; values: number[]; timestamps: number[] } {
  const points = series.dataPoints;
  const labels = points.map(p => new Date(p.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const values = points.map(p => p.value);
  const timestamps = points.map(p => p.timestamp);
  return { labels, values, timestamps };
}
