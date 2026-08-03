/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PHASE 5 — THE AMEXAN APPLICATION & WORKSPACE ARCHITECTURE
 * Universal Application Blueprint (UAB) — Core Hierarchy
 *
 * The Constitution defines WHAT exists. The UAB defines HOW users interact
 * with it. Every application inside AMEXAN inherits exactly this hierarchy.
 *
 *   Application
 *     ↓ Workspace
 *     ↓ Flow
 *     ↓ Page
 *     ↓ Panel
 *     ↓ Widget
 *     ↓ Action
 *     ↓ Event
 *
 * No application is ever designed ad hoc. Every application is an instance of
 * this blueprint. A new module is never a redesign — it is another
 * implementation of the same constitutional blueprint.
 *
 * The blueprint is a TREE. Every level nests strictly inside the level above
 * it, so the constitutional rules can walk the tree and verify conformance.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const APP_BLUEPRINT_NAME = 'AMEXAN Universal Application Blueprint';
export const APP_BLUEPRINT_VERSION = '1.0.0';
export const APP_BLUEPRINT_IMMUTABLE = true;

/**
 * The constitutional hierarchy depth, in order. Every level nests strictly
 * within the one above it. Nothing skips a level.
 */
export const APPLICATION_HIERARCHY = [
  'application',
  'workspace',
  'flow',
  'page',
  'panel',
  'widget',
  'action',
  'event',
] as const;

export type ApplicationLevel = (typeof APPLICATION_HIERARCHY)[number];

/* ────────────────────────────────────────────────────────────────────────────────
 * APPLICATION — a constitutional surface (Clinical, Laboratory, Pharmacy, …).
 * Exposes constitutional objects. Never exposes database tables.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface ApplicationBlueprint {
  id: string;
  name: string;
  description: string;
  /** Constitutional object types this application exposes (never table names). */
  objectTypes: readonly string[];
  workspaces: readonly WorkspaceBlueprint[];
}

/* ────────────────────────────────────────────────────────────────────────────────
 * WORKSPACE — a unit of human work, not a software module.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface WorkspaceBlueprint {
  id: string;
  type: string;
  title: string;
  /** "Why am I here?" — the mission that defines the workspace. */
  mission: string;
  /** Answers to the four universal workspace questions. */
  questions: readonly WorkspaceQuestionAnswer[];
  flows: readonly FlowBlueprint[];
}

export interface WorkspaceQuestionAnswer {
  question: 'what_do_i_need' | 'what_am_i_doing' | 'what_requires_attention' | 'what_happens_next';
  answer: string;
}

/* ────────────────────────────────────────────────────────────────────────────────
 * FLOW — healthcare, not forms. Mirrors a clinical process.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface FlowBlueprint {
  id: string;
  name: string;
  steps: readonly FlowStep[];
}

export type FlowStepKind =
  | 'task'
  | 'decision'
  | 'parallel'
  | 'approval'
  | 'notification'
  | 'delay'
  | 'escalation'
  | 'end';

export interface FlowStep {
  id: string;
  kind: FlowStepKind;
  label: string;
  /** Pages rendered during this step, keyed by page id. */
  pages: Readonly<Record<string, PageBlueprint>>;
}

/* ────────────────────────────────────────────────────────────────────────────────
 * PAGE — represents work, never tables. Lightweight. Business logic never lives here.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface PageBlueprint {
  /** Page intent: the work a human is completing here. */
  purpose: string;
  panels: readonly PanelBlueprint[];
}

/* ────────────────────────────────────────────────────────────────────────────────
 * PANEL — a zone of the layout engine (Header, Summary, Primary, Context,
 * Timeline, Actions, Footer).
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface PanelBlueprint {
  id: string;
  name: string;
  widgets: readonly WidgetBlueprint[];
}

/* ────────────────────────────────────────────────────────────────────────────────
 * WIDGET — a reusable constitutional component (Symptoms, Vitals, Orders, …).
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface WidgetBlueprint {
  id: string;
  name: string;
  /** The constitutional object this widget renders. */
  objectType?: string;
  actions: readonly ActionBlueprint[];
}

/* ────────────────────────────────────────────────────────────────────────────────
 * ACTION — an executable command. Commands generate events. Never mutate state.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface ActionBlueprint {
  id: string;
  name: string;
  emits: readonly EventBlueprint[];
  requires?: readonly string[];
}

/* ────────────────────────────────────────────────────────────────────────────────
 * EVENT — the single output of every action. Events drive workflows,
 * notifications, audit, telemetry, analytics, and synchronization.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface EventBlueprint {
  id: string;
  name: string;
  /** Constitutional objects this event affects. */
  affects: readonly string[];
  /* EAT-R pattern: every event emits Audit, Telemetry, Analytics, Notifications, Sync. */
  sideEffects: readonly EventSideEffect[];
}

export type EventSideEffect =
  | 'audit'
  | 'telemetry'
  | 'analytics'
  | 'notification'
  | 'sync'
  | 'workflow'
  | 'rules';

/**
 * A fully conformant blueprint — an application that passed all constitutional
 * rules.
 */
export interface ConformantApplication extends ApplicationBlueprint {
  blueprintVersion: string;
  /** List of constitutional rules satisfied by this application. */
  conformance: readonly string[];
}

/* ────────────────────────────────────────────────────────────────────────────────
 * Tree walking utilities — the rules traverse the blueprint as a tree.
 * ──────────────────────────────────────────────────────────────────────────────── */

/** Map every action to its owning widget, for accountability paths. */
export interface ActionLocation {
  action: ActionBlueprint;
  widgetId: string;
  panelId: string;
  pageId: string;
  flowId: string;
  workspaceId: string;
}

export const walkActions = (blueprint: ApplicationBlueprint): ActionLocation[] => {
  const locations: ActionLocation[] = [];
  for (const workspace of blueprint.workspaces) {
    for (const flow of workspace.flows) {
      for (const step of flow.steps) {
        for (const [pageId, page] of Object.entries(step.pages)) {
          for (const panel of page.panels) {
            for (const widget of panel.widgets) {
              for (const action of widget.actions) {
                locations.push({
                  action,
                  widgetId: widget.id,
                  panelId: panel.id,
                  pageId,
                  flowId: flow.id,
                  workspaceId: workspace.id,
                });
              }
            }
          }
        }
      }
    }
  }
  return locations;
};

export interface EventLocation {
  event: EventBlueprint;
  actionId: string;
  widgetId: string;
  pageId: string;
  flowId: string;
  workspaceId: string;
}

export const walkEvents = (blueprint: ApplicationBlueprint): EventLocation[] => {
  const locations: EventLocation[] = [];
  for (const workspace of blueprint.workspaces) {
    for (const flow of workspace.flows) {
      for (const step of flow.steps) {
        for (const [pageId, page] of Object.entries(step.pages)) {
          for (const panel of page.panels) {
            for (const widget of panel.widgets) {
              for (const action of widget.actions) {
                for (const event of action.emits) {
                  locations.push({
                    event,
                    actionId: action.id,
                    widgetId: widget.id,
                    pageId,
                    flowId: flow.id,
                    workspaceId: workspace.id,
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  return locations;
};

export const walkWidgets = (blueprint: ApplicationBlueprint): { widget: WidgetBlueprint; pageId: string; workspaceId: string }[] => {
  const widgets: { widget: WidgetBlueprint; pageId: string; workspaceId: string }[] = [];
  for (const workspace of blueprint.workspaces) {
    for (const flow of workspace.flows) {
      for (const step of flow.steps) {
        for (const [pageId, page] of Object.entries(step.pages)) {
          for (const panel of page.panels) {
            for (const widget of panel.widgets) {
              widgets.push({ widget, pageId, workspaceId: workspace.id });
            }
          }
        }
      }
    }
  }
  return widgets;
};
