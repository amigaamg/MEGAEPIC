export type TrajectoryType =
  | 'trend'
  | 'rate_of_change'
  | 'threshold_crossing'
  | 'pattern_match'
  | 'prediction';

export interface TemporalPoint {
  timestamp: number;
  value: number;
  context?: string;
}

export interface Trajectory {
  concept: string;
  points: TemporalPoint[];
  direction: 'rising' | 'falling' | 'stable' | 'fluctuating';
  rateOfChange: number;
  acceleration: number;
  alert?: TrajectoryAlert;
}

export interface TrajectoryAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: number;
}

export interface TemporalRule {
  id: string;
  concept: string;
  type: TrajectoryType;
  condition: TemporalCondition;
  action: string;
  priority: number;
}

export interface TemporalCondition {
  window: number;
  threshold: number;
  direction: 'above' | 'below' | 'crossing' | 'rate' | 'falling';
  sustained?: number;
}

export const TEMPORAL_RULES: TemporalRule[] = [
  { id: 't001', concept: 'creatinine', type: 'rate_of_change', condition: { window: 48, threshold: 0.3, direction: 'above' }, action: 'alert_aki', priority: 10 },
  { id: 't002', concept: 'creatinine', type: 'threshold_crossing', condition: { window: 7, threshold: 1.5, direction: 'above', sustained: 2 }, action: 'stage_ckd', priority: 8 },
  { id: 't003', concept: 'heart_rate', type: 'trend', condition: { window: 1, threshold: 100, direction: 'above', sustained: 6 }, action: 'alert_tachycardia', priority: 7 },
  { id: 't004', concept: 'sbp', type: 'trend', condition: { window: 1, threshold: 90, direction: 'below', sustained: 1 }, action: 'alert_hypotension', priority: 9 },
  { id: 't005', concept: 'sbp', type: 'trend', condition: { window: 24, threshold: 180, direction: 'above', sustained: 3 }, action: 'alert_hypertensive_crisis', priority: 9 },
  { id: 't006', concept: 'spo2', type: 'threshold_crossing', condition: { window: 0.5, threshold: 92, direction: 'below' }, action: 'alert_hypoxia', priority: 10 },
  { id: 't007', concept: 'gcs', type: 'trend', condition: { window: 2, threshold: 2, direction: 'falling' }, action: 'alert_neuro_deterioration', priority: 10 },
  { id: 't008', concept: 'weight', type: 'rate_of_change', condition: { window: 24, threshold: 5, direction: 'above' }, action: 'alert_fluid_overload', priority: 6 },
  { id: 't009', concept: 'urine_output', type: 'trend', condition: { window: 6, threshold: 0.5, direction: 'below', sustained: 2 }, action: 'alert_oliguria', priority: 9 },
  { id: 't010', concept: 'temperature', type: 'threshold_crossing', condition: { window: 1, threshold: 38.5, direction: 'above' }, action: 'alert_fever', priority: 7 },
];

export class TemporalEngine {
  private series: Map<string, TemporalPoint[]> = new Map();

  record(concept: string, value: number, timestamp?: number, context?: string): void {
    const points = this.series.get(concept) || [];
    points.push({ timestamp: timestamp || Date.now(), value, context });
    points.sort((a, b) => a.timestamp - b.timestamp);
    this.series.set(concept, points.slice(-100));
  }

  getSeries(concept: string, window?: number): TemporalPoint[] {
    const points = this.series.get(concept) || [];
    if (!window) return points;
    const cutoff = Date.now() - window * 3600000;
    return points.filter(p => p.timestamp >= cutoff);
  }

  computeTrajectory(concept: string, window?: number): Trajectory {
    const points = this.getSeries(concept, window);
    const direction = this.calcDirection(points);
    const rateOfChange = this.calcRateOfChange(points);
    const acceleration = this.calcAcceleration(points);
    return { concept, points, direction, rateOfChange, acceleration };
  }

  evaluate(concept: string, currentValue: number): Trajectory | null {
    this.record(concept, currentValue);
    const trajectory = this.computeTrajectory(concept, 48);
    const rules = TEMPORAL_RULES.filter(r => r.concept === concept);
    for (const rule of rules) {
      const alert = this.checkRule(rule, trajectory);
      if (alert) {
        trajectory.alert = alert;
        return trajectory;
      }
    }
    return null;
  }

  evaluateAll(measurements: Record<string, number>): Trajectory[] {
    const alerts: Trajectory[] = [];
    for (const [concept, value] of Object.entries(measurements)) {
      const result = this.evaluate(concept, value);
      if (result?.alert) alerts.push(result);
    }
    return alerts;
  }

  private checkRule(rule: TemporalRule, trajectory: Trajectory): TrajectoryAlert | null {
    const points = trajectory.points;
    if (points.length < 2) return null;
    const windowMs = rule.condition.window * 3600000;
    const recent = points.filter(p => p.timestamp >= Date.now() - windowMs);
    if (recent.length < 2) return null;

    const current = recent[recent.length - 1].value;
    const previous = recent[0].value;
    const rate = (current - previous) / (windowMs / 3600000);

    switch (rule.condition.direction) {
      case 'above':
        if (current > rule.condition.threshold) {
          if (!rule.condition.sustained || recent.filter(p => p.value > rule.condition.threshold).length >= rule.condition.sustained) {
            return {
              level: rate > rule.condition.threshold * 0.5 ? 'critical' : 'warning',
              message: `${rule.concept} ${rate > 0 ? 'rising' : 'at'} ${current} (threshold: ${rule.condition.threshold})`,
              triggeredAt: Date.now(),
            };
          }
        }
        break;
      case 'below':
        if (current < rule.condition.threshold) {
          return {
            level: 'critical',
            message: `${rule.concept} dropped to ${current} (threshold: ${rule.condition.threshold})`,
            triggeredAt: Date.now(),
          };
        }
        break;
      case 'rate':
        if (Math.abs(rate) > rule.condition.threshold) {
          return {
            level: Math.abs(rate) > rule.condition.threshold * 2 ? 'critical' : 'warning',
            message: `${rule.concept} changing at ${rate.toFixed(2)}/hour`,
            triggeredAt: Date.now(),
          };
        }
        break;
    }
    return null;
  }

  private calcDirection(points: TemporalPoint[]): 'rising' | 'falling' | 'stable' | 'fluctuating' {
    if (points.length < 2) return 'stable';
    const first = points[0].value;
    const last = points[points.length - 1].value;
    const diff = ((last - first) / first) * 100;
    if (diff > 5) return 'rising';
    if (diff < -5) return 'falling';
    const variance = points.reduce((sum, p) => sum + Math.abs(p.value - first), 0) / points.length;
    return variance > first * 0.05 ? 'fluctuating' : 'stable';
  }

  private calcRateOfChange(points: TemporalPoint[]): number {
    if (points.length < 2) return 0;
    const first = points[0];
    const last = points[points.length - 1];
    const hours = (last.timestamp - first.timestamp) / 3600000;
    return hours > 0 ? (last.value - first.value) / hours : 0;
  }

  private calcAcceleration(points: TemporalPoint[]): number {
    if (points.length < 3) return 0;
    const mid = Math.floor(points.length / 2);
    const rate1 = this.calcRateOfChange(points.slice(0, mid + 1));
    const rate2 = this.calcRateOfChange(points.slice(mid));
    return rate2 - rate1;
  }
}

export const temporalEngine = new TemporalEngine();
