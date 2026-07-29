// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN OPERATING INTELLIGENCE DATABASE
// Completely separate from clinical and business databases.
// Stores engine events, rule activations, performance, errors, recommendations,
// quality scores, hospital metrics, engine health — no patient data ever.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  UniversalEngineEvent, OIEntityType, DivisionObservation,
  EngineHealthRecord, OIStoreConfig, DEFAULT_OI_CONFIG,
} from './operations-constitution';

export interface OIStore {
  events: Map<string, UniversalEngineEvent>;
  ruleActivations: Map<string, { ruleId: string; engineId: string; count: number; lastFired: string }>;
  performance: Map<string, { engineId: string; durations: number[]; p95: number; avg: number }>;
  health: Map<string, EngineHealthRecord>;
  observations: Map<string, DivisionObservation>;
  metrics: Map<string, { name: string; value: number; timestamp: string; tags: Record<string, string> }>;
}

export class OIDatabase {
  private store: OIStore;
  private config: OIStoreConfig;
  private eventCount = 0;

  constructor(config: Partial<OIStoreConfig> = {}) {
    this.config = { ...DEFAULT_OI_CONFIG, ...config };
    this.store = {
      events: new Map(),
      ruleActivations: new Map(),
      performance: new Map(),
      health: new Map(),
      observations: new Map(),
      metrics: new Map(),
    };
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  storeEvent(event: UniversalEngineEvent): void {
    this.eventCount++;
    if (this.eventCount > this.config.maxEventsPerEngine * 30) {
      const entries = Array.from(this.store.events.entries());
      const toDelete = entries.slice(0, Math.floor(entries.length * 0.1));
      for (const [key] of toDelete) this.store.events.delete(key);
    }
    this.store.events.set(event.eventId, event);
    this.updateRuleActivations(event);
    this.updatePerformance(event);
    this.updateHealth(event);
  }

  getEvent(eventId: string): UniversalEngineEvent | undefined {
    return this.store.events.get(eventId);
  }

  queryEvents(filters: {
    engineId?: string; engineCategory?: string; status?: string;
    actorType?: string; sessionId?: string; tenantId?: string;
    startTime?: string; endTime?: string; limit?: number;
  }): UniversalEngineEvent[] {
    let results = Array.from(this.store.events.values());
    if (filters.engineId) results = results.filter(e => e.engineId === filters.engineId);
    if (filters.engineCategory) results = results.filter(e => e.engineCategory === filters.engineCategory);
    if (filters.status) results = results.filter(e => e.status === filters.status);
    if (filters.actorType) results = results.filter(e => e.actorType === filters.actorType);
    if (filters.sessionId) results = results.filter(e => e.sessionId === filters.sessionId);
    if (filters.tenantId) results = results.filter(e => e.tenantId === filters.tenantId);
    if (filters.startTime) results = results.filter(e => e.timestamp >= filters.startTime!);
    if (filters.endTime) results = results.filter(e => e.timestamp <= filters.endTime!);
    results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return filters.limit ? results.slice(0, filters.limit) : results;
  }

  getEventCount(): number {
    return this.eventCount;
  }

  // ── Rule Activations ───────────────────────────────────────────────────────

  private updateRuleActivations(event: UniversalEngineEvent): void {
    for (const rule of event.ruleResults) {
      const key = `${rule.ruleId}:${event.engineId}`;
      const existing = this.store.ruleActivations.get(key);
      this.store.ruleActivations.set(key, {
        ruleId: rule.ruleId, engineId: event.engineId,
        count: (existing?.count || 0) + 1,
        lastFired: event.timestamp,
      });
    }
  }

  getRuleActivations(ruleId?: string, engineId?: string): Array<{ ruleId: string; engineId: string; count: number; lastFired: string }> {
    let results = Array.from(this.store.ruleActivations.values());
    if (ruleId) results = results.filter(r => r.ruleId === ruleId);
    if (engineId) results = results.filter(r => r.engineId === engineId);
    return results.sort((a, b) => b.count - a.count);
  }

  getTopRules(limit: number = 10): Array<{ ruleId: string; engineId: string; count: number }> {
    return Array.from(this.store.ruleActivations.values())
      .sort((a, b) => b.count - a.count).slice(0, limit);
  }

  getUnusedRules(allRuleIds: string[]): string[] {
    const activatedRuleIds = new Set(this.store.ruleActivations.keys());
    return allRuleIds.filter(id => !activatedRuleIds.has(id));
  }

  // ── Performance ────────────────────────────────────────────────────────────

  private updatePerformance(event: UniversalEngineEvent): void {
    const existing = this.store.performance.get(event.engineId);
    const durations = existing ? [...existing.durations, event.durationMs] : [event.durationMs];
    if (durations.length > 1000) durations.shift();

    const sorted = [...durations].sort((a, b) => a - b);
    const p95Idx = Math.floor(sorted.length * 0.95);
    const avg = durations.reduce((s, d) => s + d, 0) / durations.length;

    this.store.performance.set(event.engineId, {
      engineId: event.engineId,
      durations,
      p95: sorted[p95Idx] || 0,
      avg: Math.round(avg * 100) / 100,
    });
  }

  getPerformance(engineId: string): { engineId: string; avgDurationMs: number; p95DurationMs: number; sampleCount: number } | undefined {
    const perf = this.store.performance.get(engineId);
    if (!perf) return undefined;
    return {
      engineId: perf.engineId,
      avgDurationMs: perf.avg,
      p95DurationMs: perf.p95,
      sampleCount: perf.durations.length,
    };
  }

  getAllPerformance(): Array<{ engineId: string; avgDurationMs: number; p95DurationMs: number; sampleCount: number }> {
    return Array.from(this.store.performance.values()).map(p => ({
      engineId: p.engineId,
      avgDurationMs: p.avg,
      p95DurationMs: p.p95,
      sampleCount: p.durations.length,
    }));
  }

  // ── Engine Health ──────────────────────────────────────────────────────────

  private updateHealth(event: UniversalEngineEvent): void {
    const existing = this.store.health.get(event.engineId);
    const total = (existing?.totalExecutions || 0) + 1;
    const success = (existing?.successfulExecutions || 0) + (event.status === 'success' ? 1 : 0);
    const failed = (existing?.failedExecutions || 0) + (event.status === 'failed' ? 1 : 0);
    const avgDur = existing
      ? Math.round((existing.averageDurationMs * (total - 1) + event.durationMs) / total)
      : event.durationMs;
    const errorRate = total > 0 ? Math.round(failed / total * 10000) / 100 : 0;

    let healthStatus: EngineHealthRecord['status'] = 'healthy';
    if (errorRate > 10) healthStatus = 'unhealthy';
    else if (errorRate > 5) healthStatus = 'degraded';

    const warnings: string[] = [];
    if (errorRate > 5) warnings.push(`Error rate ${errorRate}% exceeds threshold`);
    if (event.durationMs > 5000) warnings.push(`Execution duration ${event.durationMs}ms exceeds threshold`);

    const p95 = this.store.performance.get(event.engineId)?.p95 || 0;

    this.store.health.set(event.engineId, {
      engineId: event.engineId,
      totalExecutions: total,
      successfulExecutions: success,
      failedExecutions: failed,
      averageDurationMs: avgDur,
      p95DurationMs: p95,
      errorRate,
      lastExecutionAt: event.timestamp,
      status: healthStatus,
      warnings,
      lastCheckedAt: new Date().toISOString(),
    });
  }

  getEngineHealth(engineId: string): EngineHealthRecord | undefined {
    return this.store.health.get(engineId);
  }

  getAllEngineHealth(): EngineHealthRecord[] {
    return Array.from(this.store.health.values());
  }

  getUnhealthyEngines(): EngineHealthRecord[] {
    return Array.from(this.store.health.values()).filter(h => h.status !== 'healthy');
  }

  // ── Observations (Division Output) ─────────────────────────────────────────

  storeObservation(obs: DivisionObservation): void {
    this.store.observations.set(obs.id, obs);
  }

  getObservations(divisionId?: string, status?: DivisionObservation['status'], severity?: DivisionObservation['severity']): DivisionObservation[] {
    let results = Array.from(this.store.observations.values());
    if (divisionId) results = results.filter(o => o.divisionId === divisionId);
    if (status) results = results.filter(o => o.status === status);
    if (severity) results = results.filter(o => o.severity === severity);
    return results.sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
  }

  resolveObservation(obsId: string): boolean {
    const obs = this.store.observations.get(obsId);
    if (!obs) return false;
    this.store.observations.set(obsId, { ...obs, status: 'resolved', resolvedAt: new Date().toISOString() });
    return true;
  }

  // ── Custom Metrics ─────────────────────────────────────────────────────────

  recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    const id = `${name}:${Date.now()}`;
    this.store.metrics.set(id, { name, value, timestamp: new Date().toISOString(), tags });
  }

  queryMetrics(name: string, limit: number = 100): Array<{ value: number; timestamp: string; tags: Record<string, string> }> {
    return Array.from(this.store.metrics.values())
      .filter(m => m.name === name)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  // ── Storage Stats ──────────────────────────────────────────────────────────

  getStorageStats(): { events: number; ruleActivations: number; performance: number; health: number; observations: number; metrics: number } {
    return {
      events: this.store.events.size,
      ruleActivations: this.store.ruleActivations.size,
      performance: this.store.performance.size,
      health: this.store.health.size,
      observations: this.store.observations.size,
      metrics: this.store.metrics.size,
    };
  }

  reset(): void {
    this.store = {
      events: new Map(),
      ruleActivations: new Map(),
      performance: new Map(),
      health: new Map(),
      observations: new Map(),
      metrics: new Map(),
    };
    this.eventCount = 0;
  }
}

export function createOIDatabase(config?: Partial<OIStoreConfig>): OIDatabase {
  return new OIDatabase(config);
}