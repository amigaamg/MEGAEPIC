// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN PRESENTATION ENGINE (BOOK VIII · Volume VIII-A) — FACADE
//
// The single constitutional gateway every actor enters after authentication.
//
//   Presenter.resolve(input)     → phases 1–8: build the ResolutionContext
//   Presenter.generate(input)    → phase 9:   resolve context → dashboard
//   Presenter.switchWorkspace()  → context switching (assignment overrides)
//   Presenter.restoreLastWorkspace() / queueLocalWrite / flushLocalWrites
//                                  → offline & recovery
//
// This facade ties ResolutionEngine + WidgetEngine together. It never contains
// clinical reasoning; it only orchestrates the output of upstream engines.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  CurrentAssignment, DashboardFamilyId, IntelligenceItem,
  ResolvedDashboard, ResolutionContext,
} from './types';
import type { WidgetEngine } from './widgetEngine';
import { ResolutionEngine, type ResolutionInput } from './resolutionEngine';
import { WidgetEngine as WidgetEngineImpl } from './widgetEngine';

export interface PresentOptions {
  intelligence?: IntelligenceItem[];
  forceFamily?: DashboardFamilyId;
}

export interface PresentationEngineOptions {
  widgets?: WidgetEngine;
  resolution?: ResolutionEngine;
}

export class PresentationEngine {
  readonly widgets: WidgetEngine;
  readonly resolution: ResolutionEngine;

  private lastWorkspace?: ResolvedDashboard;
  private pendingWrites: unknown[] = [];

  constructor(options: PresentationEngineOptions = {}) {
    this.widgets = options.widgets ?? new WidgetEngineImpl();
    this.resolution = options.resolution ?? new ResolutionEngine(this.widgets);
  }

  // Phases 1–8: resolve the actor's current constitutional context.
  resolve(input: ResolutionInput): ResolutionContext {
    return this.resolution.resolve(input);
  }

  // Phase 9: generate the live operating environment.
  generate(input: ResolutionInput, options: PresentOptions = {}): ResolvedDashboard {
    const context = this.resolve(input);
    return this.presentContext(context, options);
  }

  presentContext(context: ResolutionContext, options: PresentOptions = {}): ResolvedDashboard {
    const dashboard = this.resolution.present(context, options);
    this.lastWorkspace = dashboard;
    return dashboard;
  }

  // Context switching — one actor, many contexts, no logout, no second account.
  switchWorkspace(context: ResolutionContext, assignment: CurrentAssignment): ResolvedDashboard {
    const dashboard = this.resolution.switchWorkspace(context, assignment);
    this.lastWorkspace = dashboard;
    return dashboard;
  }

  // ── Offline & recovery ───────────────────────────────────────────────────────

  // Remember the last valid workspace so a transient network failure never sends
  // the actor back to login or onboarding.
  restoreLastWorkspace(): ResolvedDashboard | undefined {
    return this.lastWorkspace;
  }

  queueLocalWrite(payload: unknown): void {
    this.pendingWrites.push(payload);
  }

  flushLocalWrites(): unknown[] {
    const writes = this.pendingWrites;
    this.pendingWrites = [];
    return writes;
  }

  get pendingWriteCount(): number {
    return this.pendingWrites.length;
  }
}

export { ResolutionEngine } from './resolutionEngine';
export type { ResolutionInput } from './resolutionEngine';
export { WidgetEngine, FAMILY_WIDGETS, hasPermission, filterByPermission } from './widgetEngine';
export type {
  WidgetEngine as WidgetEngineInterface, WidgetSpec, WidgetCompositionInput,
} from './widgetEngine';