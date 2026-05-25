import type { BPEntry, BPStats, BPStatus, AlertThreshold } from "../types";
import { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// COMPUTE BP STATUS for a single reading
// ─────────────────────────────────────────────────────────────

export function computeBPStatus(
  systolic: number,
  diastolic: number,
  thresholds: AlertThreshold
): BPStatus {
  if (systolic <= thresholds.hypotensionSystolic) return "hypotension";
  if (systolic >= thresholds.systolicCritical || diastolic >= thresholds.diastolicCritical) return "crisis";
  if (systolic >= thresholds.systolicWarning  || diastolic >= thresholds.diastolicWarning)  return "high";
  if (systolic > thresholds.systolicTarget    || diastolic > thresholds.diastolicTarget)    return "elevated";
  return "controlled";
}

// ─────────────────────────────────────────────────────────────
// COMPUTE FULL BP STATS from an array of entries
// ─────────────────────────────────────────────────────────────

export function computeBPStats(
  entries: BPEntry[],
  thresholds: AlertThreshold
): BPStats {
  if (!entries.length) {
    return {
      latestSystolic: 0,
      latestDiastolic: 0,
      latestDate: Timestamp.now(),
      avg7daySystolic: 0,
      avg7dayDiastolic: 0,
      avg30daySystolic: 0,
      avg30dayDiastolic: 0,
      avg90daySystolic: 0,
      avg90dayDiastolic: 0,
      pctInTarget: 0,
      pctCrisis: 0,
      trend: "stable",
      totalReadings: 0,
    };
  }

  const sorted = [...entries].sort(
    (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()
  );

  const now = Date.now();
  const msDay = 86_400_000;

  const last7   = sorted.filter(e => now - e.timestamp.toMillis() <= 7  * msDay);
  const last30  = sorted.filter(e => now - e.timestamp.toMillis() <= 30 * msDay);
  const last90  = sorted.filter(e => now - e.timestamp.toMillis() <= 90 * msDay);

  const avg = (arr: BPEntry[], key: "systolic" | "diastolic") =>
    arr.length ? Math.round(arr.reduce((s, e) => s + e[key], 0) / arr.length) : 0;

  const latest = sorted[0];

  // Trend: compare 7-day avg vs prior 7-day avg
  const prior7Start = now - 14 * msDay;
  const prior7End   = now - 7  * msDay;
  const prior7      = sorted.filter(e => {
    const ms = e.timestamp.toMillis();
    return ms >= prior7Start && ms < prior7End;
  });

  let trend: BPStats["trend"] = "stable";
  if (last7.length >= 2 && prior7.length >= 2) {
    const currentAvg = avg(last7, "systolic");
    const priorAvg   = avg(prior7, "systolic");
    const delta = currentAvg - priorAvg;
    if (delta <= -5) trend = "improving";
    else if (delta >= 5) trend = "worsening";
  }

  const inTarget = (e: BPEntry) =>
    e.systolic <= thresholds.systolicTarget && e.diastolic <= thresholds.diastolicTarget;
  const isCrisis = (e: BPEntry) =>
    e.systolic >= thresholds.systolicCritical || e.diastolic >= thresholds.diastolicCritical;

  return {
    latestSystolic:    latest.systolic,
    latestDiastolic:   latest.diastolic,
    latestDate:        latest.timestamp,
    avg7daySystolic:   avg(last7, "systolic"),
    avg7dayDiastolic:  avg(last7, "diastolic"),
    avg30daySystolic:  avg(last30, "systolic"),
    avg30dayDiastolic: avg(last30, "diastolic"),
    avg90daySystolic:  avg(last90, "systolic"),
    avg90dayDiastolic: avg(last90, "diastolic"),
    pctInTarget:       last30.length ? Math.round((last30.filter(inTarget).length / last30.length) * 100) : 0,
    pctCrisis:         sorted.length ? Math.round((sorted.filter(isCrisis).length / sorted.length) * 100) : 0,
    trend,
    totalReadings:     entries.length,
  };
}

// ─────────────────────────────────────────────────────────────
// CHART DATA TRANSFORMER
// Converts BPEntry[] → Recharts-ready format with all fields
// ─────────────────────────────────────────────────────────────

export interface BPChartPoint {
  date: string;
  dateMs: number;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  status: BPStatus;
  notes?: string;
  loggedBy: string;
}

export function toBPChartData(
  entries: BPEntry[],
  thresholds: AlertThreshold
): BPChartPoint[] {
  return [...entries]
    .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
    .map((e) => ({
      date:      formatChartDate(e.timestamp),
      dateMs:    e.timestamp.toMillis(),
      systolic:  e.systolic,
      diastolic: e.diastolic,
      heartRate: e.heartRate,
      status:    computeBPStatus(e.systolic, e.diastolic, thresholds),
      notes:     e.notes,
      loggedBy:  e.loggedBy,
    }));
}

// ─────────────────────────────────────────────────────────────
// ROLLING AVERAGE overlay for chart
// ─────────────────────────────────────────────────────────────

export function addRollingAverage(
  points: BPChartPoint[],
  windowDays = 7
): (BPChartPoint & { sysAvg?: number; diaAvg?: number })[] {
  const windowMs = windowDays * 86_400_000;
  return points.map((p, i) => {
    const window = points.filter(
      (q) => p.dateMs - q.dateMs >= 0 && p.dateMs - q.dateMs <= windowMs
    );
    return {
      ...p,
      sysAvg: Math.round(window.reduce((s, q) => s + q.systolic, 0) / window.length),
      diaAvg: Math.round(window.reduce((s, q) => s + q.diastolic, 0) / window.length),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatChartDate(ts: Timestamp): string {
  const d = ts.toDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function bpStatusColor(status: BPStatus): string {
  const map: Record<BPStatus, string> = {
    controlled:  "#10b981",
    elevated:    "#f59e0b",
    high:        "#f97316",
    crisis:      "#ef4444",
    hypotension: "#8b5cf6",
  };
  return map[status];
}

export function bpStatusLabel(status: BPStatus): string {
  const map: Record<BPStatus, string> = {
    controlled:  "Controlled",
    elevated:    "Elevated",
    high:        "High",
    crisis:      "Crisis",
    hypotension: "Hypotension",
  };
  return map[status];
}