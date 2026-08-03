/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UAB — Constitutional Rules & Conformance
 *
 * Seven rules govern every application built on the Universal Application
 * Blueprint. Any application that violates a rule is not constitutional.
 *
 *   Rule 1 — Applications expose constitutional objects, never database tables.
 *   Rule 2 — Workspaces represent work, not software modules.
 *   Rule 3 — Flows represent healthcare, not forms.
 *   Rule 4 — Commands generate events, never modify state directly.
 *   Rule 5 — Pages remain lightweight; business logic never lives in the UI.
 *   Rule 6 — Every page is contextual, never isolated.
 *   Rule 7 — Components are universal and reusable.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { ApplicationBlueprint } from './blueprint';
import { APPLICATION_HIERARCHY, walkActions, walkWidgets } from './blueprint';
import type { ConformantApplication } from './blueprint';
import { isUniversalWorkspaceType } from './workspaces';

export const UAB_RULES = [
  'applications_expose_constitutional_objects',
  'workspaces_represent_work',
  'flows_represent_healthcare',
  'commands_generate_events',
  'pages_are_lightweight',
  'pages_are_contextual',
  'components_are_universal',
] as const;

export type UabRule = (typeof UAB_RULES)[number];

export interface UabViolation {
  rule: UabRule;
  message: string;
  path: string;
}

/* ────────────────────────────────────────────────────────────────────────────────
 * Per-rule checks
 * ──────────────────────────────────────────────────────────────────────────────── */

/** Constitutional object names are singular camelCase. Never snake_case table names. */
const isConstitutionalObjectName = (value: string): boolean => {
  return /^[a-z][a-zA-Z0-9]*$/.test(value) && !/_[a-z]/.test(value);
};

/** Rule 1: every exposed object type is a constitutional object, never a table. */
const checkRule1 = (blueprint: ApplicationBlueprint, violations: UabViolation[]): void => {
  if (!blueprint.objectTypes || blueprint.objectTypes.length === 0) {
    violations.push({
      rule: 'applications_expose_constitutional_objects',
      message: 'Application exposes no constitutional object types.',
      path: `application:${blueprint.id}`,
    });
    return;
  }
  for (const objectType of blueprint.objectTypes) {
    if (!isConstitutionalObjectName(objectType)) {
      violations.push({
        rule: 'applications_expose_constitutional_objects',
        message: `Object type "${objectType}" is not a constitutional object name.`,
        path: `application:${blueprint.id}.objectTypes`,
      });
    }
  }
};

/** Rule 2: every workspace maps to a universal workspace type. */
const checkRule2 = (blueprint: ApplicationBlueprint, violations: UabViolation[]): void => {
  for (const workspace of blueprint.workspaces) {
    if (!isUniversalWorkspaceType(workspace.type)) {
      violations.push({
        rule: 'workspaces_represent_work',
        message: `Workspace type "${workspace.type}" is not a universal workspace type.`,
        path: `application:${blueprint.id}.workspace:${workspace.id}`,
      });
    }
    if (!workspace.mission || workspace.mission.trim().length === 0) {
      violations.push({
        rule: 'workspaces_represent_work',
        message: `Workspace "${workspace.id}" has no mission.`,
        path: `application:${blueprint.id}.workspace:${workspace.id}`,
      });
    }
  }
};

/** Rule 3: every flow has a name and a complete, non-empty step chain. */
const checkRule3 = (blueprint: ApplicationBlueprint, violations: UabViolation[]): void => {
  for (const workspace of blueprint.workspaces) {
    for (const flow of workspace.flows) {
      if (!flow.name || flow.name.trim().length === 0) {
        violations.push({
          rule: 'flows_represent_healthcare',
          message: `Flow "${flow.id}" has no name.`,
          path: `application:${blueprint.id}.workspace:${workspace.id}.flow:${flow.id}`,
        });
      }
      if (!flow.steps || flow.steps.length === 0) {
        violations.push({
          rule: 'flows_represent_healthcare',
          message: `Flow "${flow.id}" has no steps. A healthcare flow cannot be empty.`,
          path: `application:${blueprint.id}.workspace:${workspace.id}.flow:${flow.id}`,
        });
      }
      const lastStep = flow.steps[flow.steps.length - 1];
      if (lastStep && lastStep.kind !== 'end') {
        violations.push({
          rule: 'flows_represent_healthcare',
          message: `Flow "${flow.id}" does not end with an 'end' step.`,
          path: `application:${blueprint.id}.workspace:${workspace.id}.flow:${flow.id}`,
        });
      }
    }
  }
};

/** Rule 4: every action emits at least one event with the EAT-R side effects. */
const checkRule4 = (blueprint: ApplicationBlueprint, violations: UabViolation[]): void => {
  for (const location of walkActions(blueprint)) {
    if (!location.action.emits || location.action.emits.length === 0) {
      violations.push({
        rule: 'commands_generate_events',
        message: `Action "${location.action.id}" emits no events. Commands must generate events.`,
        path: `application:${blueprint.id}.workspace:${location.workspaceId}.widget:${location.widgetId}.action:${location.action.id}`,
      });
      continue;
    }
    for (const event of location.action.emits) {
      if (!event.sideEffects || event.sideEffects.length === 0) {
        violations.push({
          rule: 'commands_generate_events',
          message: `Event "${event.id}" declares no side effects. Every event must emit Audit/Telemetry/Analytics/Notifications/Sync.`,
          path: `application:${blueprint.id}.workspace:${location.workspaceId}.event:${event.id}`,
        });
      }
    }
  }
};

/** Rule 5: every page declares a purpose (it represents work, not a table). */
const checkRule5 = (blueprint: ApplicationBlueprint, violations: UabViolation[]): void => {
  for (const workspace of blueprint.workspaces) {
    for (const flow of workspace.flows) {
      for (const step of flow.steps) {
        for (const [pageId, page] of Object.entries(step.pages)) {
          if (!page.purpose || page.purpose.trim().length === 0) {
            violations.push({
              rule: 'pages_are_lightweight',
              message: `Page "${pageId}" has no purpose. Pages represent work, not tables.`,
              path: `application:${blueprint.id}.workspace:${workspace.id}.flow:${flow.id}.page:${pageId}`,
            });
          }
        }
      }
    }
  }
};

/** Rule 6: every page lives inside at least one flow (contextual, never isolated). */
const checkRule6 = (blueprint: ApplicationBlueprint, violations: UabViolation[]): void => {
  for (const workspace of blueprint.workspaces) {
    for (const flow of workspace.flows) {
      for (const step of flow.steps) {
        if (Object.keys(step.pages).length === 0) {
          violations.push({
            rule: 'pages_are_contextual',
            message: `Flow step "${step.id}" contains no pages. Every step must render work.`,
            path: `application:${blueprint.id}.workspace:${workspace.id}.flow:${flow.id}.step:${step.id}`,
          });
        }
      }
    }
  }
};

/** Rule 7: widgets are universal and reused, not per-page copies. */
const checkRule7 = (blueprint: ApplicationBlueprint, violations: UabViolation[]): void => {
  const widgets = walkWidgets(blueprint);
  if (widgets.length < 2) return;
  const unique = new Set(widgets.map((w) => w.widget.id)).size;
  if (unique === widgets.length) {
    violations.push({
      rule: 'components_are_universal',
      message: 'No widget is reused. Components must be universal and reusable, never per-page copies.',
      path: `application:${blueprint.id}`,
    });
  }
};

/* ────────────────────────────────────────────────────────────────────────────────
 * Conformance API
 * ──────────────────────────────────────────────────────────────────────────────── */

/**
 * Validate an application blueprint against all seven constitutional rules.
 * Returns a list of violations. An empty list means the application conforms.
 */
export const assertApplicationConstitutional = (blueprint: ApplicationBlueprint): UabViolation[] => {
  const violations: UabViolation[] = [];
  checkRule1(blueprint, violations);
  checkRule2(blueprint, violations);
  checkRule3(blueprint, violations);
  checkRule4(blueprint, violations);
  checkRule5(blueprint, violations);
  checkRule6(blueprint, violations);
  checkRule7(blueprint, violations);
  return violations;
};

/**
 * Throwing form. Useful in tests and build-time enforcement.
 */
export const assertApplicationConforms = (blueprint: ApplicationBlueprint): void => {
  const violations = assertApplicationConstitutional(blueprint);
  if (violations.length > 0) {
    const detail = violations.map((v) => `  - [${v.rule}] ${v.message} (${v.path})`).join('\n');
    throw new Error(`[UAB] Application "${blueprint.id}" violates the blueprint:\n${detail}`);
  }
};

/**
 * Return a conformant application record with the rules it satisfies.
 */
export const conformantApplication = (blueprint: ApplicationBlueprint): ConformantApplication => {
  assertApplicationConforms(blueprint);
  const satisfied: string[] = [];
  const violations = assertApplicationConstitutional(blueprint);
  if (violations.length === 0) {
    satisfied.push(...UAB_RULES);
  }
  return {
    ...blueprint,
    blueprintVersion: '1.0.0',
    conformance: satisfied,
  };
};

/**
 * Assert that a hierarchy chain is complete (all 8 levels present, in order).
 */
export const assertCompleteHierarchy = (levels: readonly string[]): void => {
  const missing = APPLICATION_HIERARCHY.filter((level) => !levels.includes(level));
  if (missing.length > 0) {
    throw new Error(`[UAB] Incomplete hierarchy. Missing levels: ${missing.join(', ')}`);
  }
};

/* ────────────────────────────────────────────────────────────────────────────────
 * Folder structure blueprint — the target layout every application follows.
 * ──────────────────────────────────────────────────────────────────────────────── */

export const APP_FOLDER_STRUCTURE = [
  'app/workspaces/',
  'app/flows/',
  'app/pages/',
  'app/components/',
  'app/widgets/',
  'app/commands/',
  'app/layouts/',
  'app/navigation/',
  'app/actions/',
  'app/context/',
  'app/timelines/',
] as const;
