// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN WORKFLOW REGISTRY
// Catalog of every workflow: expected phases, durations, actor types,
// version tracking. Enables Workflow Intelligence Division.
// ═══════════════════════════════════════════════════════════════════════════════

import { WorkflowRegistration } from './operations-constitution';

export interface WorkflowExecutionRecord {
  executionId: string;
  workflowId: string;
  sessionId: string;
  tenantId: string;
  actorType: string;
  journeyId: string;
  phases: WorkflowPhaseRecord[];
  startedAt: string;
  completedAt?: string;
  totalDurationMs?: number;
  aborted: boolean;
  abortReason?: string;
}

export interface WorkflowPhaseRecord {
  phaseId: string;
  phaseName: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  skipped: boolean;
  cardCount: number;
  actionsCount: number;
}

export class WorkflowRegistry {
  private workflows: Map<string, WorkflowRegistration> = new Map();
  private executions: WorkflowExecutionRecord[] = [];

  register(wf: Omit<WorkflowRegistration, 'status'> & { status?: WorkflowRegistration['status'] }): WorkflowRegistration {
    const created: WorkflowRegistration = { ...wf, status: wf.status || 'active' };
    this.workflows.set(created.workflowId, created);
    return created;
  }

  registerBatch(wfs: Array<Omit<WorkflowRegistration, 'status'> & { status?: WorkflowRegistration['status'] }>): WorkflowRegistration[] {
    return wfs.map(w => this.register(w));
  }

  get(workflowId: string): WorkflowRegistration | undefined {
    return this.workflows.get(workflowId);
  }

  getAll(journeyId?: string, status?: WorkflowRegistration['status']): WorkflowRegistration[] {
    let results = Array.from(this.workflows.values());
    if (journeyId) results = results.filter(w => w.journeyId === journeyId);
    if (status) results = results.filter(w => w.status === status);
    return results;
  }

  recordExecution(execution: WorkflowExecutionRecord): void {
    this.executions.push(execution);
  }

  getExecutions(workflowId?: string, limit: number = 100): WorkflowExecutionRecord[] {
    let results = this.executions;
    if (workflowId) results = results.filter(e => e.workflowId === workflowId);
    return results.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
  }

  getWorkflowAnalytics(workflowId: string): {
    totalExecutions: number; completionRate: number; averageDurationMs: number;
    averagePhaseDurations: Record<string, number>; phaseDropOffRates: Record<string, number>;
    abortRate: number; commonAbortReasons: string[];
  } {
    const wfExecutions = this.executions.filter(e => e.workflowId === workflowId);
    const total = wfExecutions.length;
    if (total === 0) return { totalExecutions: 0, completionRate: 0, averageDurationMs: 0, averagePhaseDurations: {}, phaseDropOffRates: {}, abortRate: 0, commonAbortReasons: [] };

    const completed = wfExecutions.filter(e => !e.aborted).length;
    const aborted = wfExecutions.filter(e => e.aborted);
    const durations = wfExecutions.filter(e => e.totalDurationMs).map(e => e.totalDurationMs!);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;

    const phaseDurations: Record<string, number[]> = {};
    const phaseCompletions: Record<string, { completed: number; total: number }> = {};
    const abortReasons: Record<string, number> = {};

    for (const exec of wfExecutions) {
      for (const phase of exec.phases) {
        if (!phaseDurations[phase.phaseId]) phaseDurations[phase.phaseId] = [];
        if (phase.durationMs) phaseDurations[phase.phaseId].push(phase.durationMs);

        if (!phaseCompletions[phase.phaseId]) phaseCompletions[phase.phaseId] = { completed: 0, total: 0 };
        phaseCompletions[phase.phaseId].total++;
        if (!phase.skipped) phaseCompletions[phase.phaseId].completed++;
      }
      if (exec.abortReason) abortReasons[exec.abortReason] = (abortReasons[exec.abortReason] || 0) + 1;
    }

    const averagePhaseDurations: Record<string, number> = {};
    for (const [phaseId, durs] of Object.entries(phaseDurations)) {
      averagePhaseDurations[phaseId] = durs.length > 0 ? Math.round(durs.reduce((s, d) => s + d, 0) / durs.length) : 0;
    }

    const phaseDropOffRates: Record<string, number> = {};
    for (const [phaseId, pc] of Object.entries(phaseCompletions)) {
      phaseDropOffRates[phaseId] = Math.round((1 - pc.completed / pc.total) * 100);
    }

    return {
      totalExecutions: total, completionRate: Math.round(completed / total * 100),
      averageDurationMs: avgDuration, averagePhaseDurations, phaseDropOffRates,
      abortRate: Math.round(aborted.length / total * 100),
      commonAbortReasons: Object.entries(abortReasons).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([r]) => r),
    };
  }

  getBottleneckPhases(thresholdMs: number): Array<{ workflowId: string; phaseId: string; phaseName: string; averageDurationMs: number; executions: number }> {
    const bottlenecks: Array<{ workflowId: string; phaseId: string; phaseName: string; averageDurationMs: number; executions: number }> = [];
    const wfIds = new Set(this.executions.map(e => e.workflowId));
    
    for (const wfId of wfIds) {
      const analytics = this.getWorkflowAnalytics(wfId);
      const wf = this.workflows.get(wfId);
      for (const [phaseId, avgDur] of Object.entries(analytics.averagePhaseDurations)) {
        if (avgDur > thresholdMs) {
          const expected = wf?.expectedDurationPerPhase[phaseId];
          if (!expected || avgDur > expected * 1.5) {
            bottlenecks.push({
              workflowId: wfId, phaseId,
              phaseName: phaseId,
              averageDurationMs: avgDur,
              executions: analytics.totalExecutions,
            });
          }
        }
      }
    }
    return bottlenecks.sort((a, b) => b.averageDurationMs - a.averageDurationMs);
  }

  getStats(): { totalWorkflows: number; totalExecutions: number; totalCompleted: number; totalAborted: number; byJourney: Record<string, number> } {
    const byJourney: Record<string, number> = {};
    for (const wf of this.workflows.values()) byJourney[wf.journeyId] = (byJourney[wf.journeyId] || 0) + 1;
    return {
      totalWorkflows: this.workflows.size,
      totalExecutions: this.executions.length,
      totalCompleted: this.executions.filter(e => !e.aborted).length,
      totalAborted: this.executions.filter(e => e.aborted).length,
      byJourney,
    };
  }
}

export const workflowRegistry = new WorkflowRegistry();