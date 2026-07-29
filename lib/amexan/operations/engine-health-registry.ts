// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ENGINE HEALTH REGISTRY
// Health tracking for all engines — execution stats, error rates, latency,
// status monitoring. Feeds Performance Intelligence and Infrastructure Division.
// ═══════════════════════════════════════════════════════════════════════════════

import { EngineHealthRecord } from './operations-constitution';

export interface HealthThresholds {
  errorRateWarning: number;
  errorRateCritical: number;
  p95LatencyWarningMs: number;
  p95LatencyCriticalMs: number;
  minExecutionSample: number;
}

export const DEFAULT_HEALTH_THRESHOLDS: HealthThresholds = {
  errorRateWarning: 5,
  errorRateCritical: 10,
  p95LatencyWarningMs: 2000,
  p95LatencyCriticalMs: 5000,
  minExecutionSample: 10,
};

export class EngineHealthRegistry {
  private healthRecords: Map<string, EngineHealthRecord> = new Map();
  private thresholds: HealthThresholds;
  private alerts: EngineHealthAlert[] = [];

  constructor(thresholds: Partial<HealthThresholds> = {}) {
    this.thresholds = { ...DEFAULT_HEALTH_THRESHOLDS, ...thresholds };
  }

  recordExecution(
    engineId: string, durationMs: number, p95DurationMs: number,
    success: boolean, timestamp: string,
  ): EngineHealthRecord {
    const existing = this.healthRecords.get(engineId);
    const total = (existing?.totalExecutions || 0) + 1;
    const successful = (existing?.successfulExecutions || 0) + (success ? 1 : 0);
    const failed = (existing?.failedExecutions || 0) + (success ? 0 : 1);
    const avgDur = existing
      ? Math.round((existing.averageDurationMs * (total - 1) + durationMs) / total)
      : durationMs;
    const errorRate = total > 0 ? Math.round(failed / total * 10000) / 100 : 0;

    let status: EngineHealthRecord['status'] = 'healthy';
    if (errorRate >= this.thresholds.errorRateCritical || p95DurationMs >= this.thresholds.p95LatencyCriticalMs) status = 'unhealthy';
    else if (errorRate >= this.thresholds.errorRateWarning || p95DurationMs >= this.thresholds.p95LatencyWarningMs) status = 'degraded';

    const warnings: string[] = [];
    if (errorRate >= this.thresholds.errorRateWarning) warnings.push(`Error rate ${errorRate}% exceeds warning threshold ${this.thresholds.errorRateWarning}%`);
    if (p95DurationMs >= this.thresholds.p95LatencyWarningMs) warnings.push(`P95 latency ${p95DurationMs}ms exceeds warning threshold ${this.thresholds.p95LatencyWarningMs}ms`);

    const record: EngineHealthRecord = {
      engineId, totalExecutions: total, successfulExecutions: successful,
      failedExecutions: failed, averageDurationMs: avgDur,
      p95DurationMs, errorRate, lastExecutionAt: timestamp,
      status, warnings, lastCheckedAt: new Date().toISOString(),
    };
    this.healthRecords.set(engineId, record);

    if (status !== 'healthy') this.checkAlert(engineId, status, warnings);
    return record;
  }

  getHealth(engineId: string): EngineHealthRecord | undefined {
    return this.healthRecords.get(engineId);
  }

  getAllHealth(): EngineHealthRecord[] {
    return Array.from(this.healthRecords.values());
  }

  getHealthy(): EngineHealthRecord[] {
    return Array.from(this.healthRecords.values()).filter(h => h.status === 'healthy');
  }

  getDegraded(): EngineHealthRecord[] {
    return Array.from(this.healthRecords.values()).filter(h => h.status === 'degraded');
  }

  getUnhealthy(): EngineHealthRecord[] {
    return Array.from(this.healthRecords.values()).filter(h => h.status === 'unhealthy');
  }

  getStatusSummary(): { total: number; healthy: number; degraded: number; unhealthy: number; healthScore: number } {
    const all = Array.from(this.healthRecords.values());
    const healthy = all.filter(h => h.status === 'healthy').length;
    const degraded = all.filter(h => h.status === 'degraded').length;
    const unhealthy = all.filter(h => h.status === 'unhealthy').length;
    const healthScore = all.length > 0
      ? Math.round((healthy * 100 + degraded * 50) / all.length)
      : 100;
    return { total: all.length, healthy, degraded, unhealthy, healthScore };
  }

  getEngineWithWorstHealth(): EngineHealthRecord | undefined {
    const all = Array.from(this.healthRecords.values());
    if (all.length === 0) return undefined;
    return all.reduce((worst, curr) => {
      const severityOrder = { healthy: 0, degraded: 1, unhealthy: 2 };
      return severityOrder[curr.status] > severityOrder[worst.status] ? curr : worst;
    });
  }

  private checkAlert(engineId: string, status: EngineHealthRecord['status'], warnings: string[]): void {
    const existing = this.alerts.findIndex(a => a.engineId === engineId && a.alertStatus === 'open');
    if (existing >= 0) {
      this.alerts[existing] = { ...this.alerts[existing], warnings, lastCheckedAt: new Date().toISOString() };
    } else {
      this.alerts.push({
        engineId, engineStatus: status, warnings, detectedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(), alertStatus: 'open',
      });
    }
  }

  getAlerts(alertStatus?: 'open' | 'acknowledged' | 'resolved'): EngineHealthAlert[] {
    if (alertStatus) return this.alerts.filter(a => a.alertStatus === alertStatus);
    return this.alerts;
  }

  acknowledgeAlert(engineId: string): boolean {
    const alert = this.alerts.find(a => a.engineId === engineId && a.alertStatus === 'open');
    if (!alert) return false;
    alert.alertStatus = 'acknowledged';
    return true;
  }

  resolveAlert(engineId: string): boolean {
    const alert = this.alerts.find(a => a.engineId === engineId && a.alertStatus !== 'resolved');
    if (!alert) return false;
    alert.alertStatus = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    return true;
  }

  updateThresholds(thresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  getThresholds(): HealthThresholds {
    return { ...this.thresholds };
  }

  reset(): void {
    this.healthRecords.clear();
    this.alerts = [];
  }
}

export interface EngineHealthAlert {
  engineId: string;
  engineStatus: EngineHealthRecord['status'];
  warnings: string[];
  detectedAt: string;
  lastCheckedAt: string;
  alertStatus: 'open' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
}

export const engineHealthRegistry = new EngineHealthRegistry();