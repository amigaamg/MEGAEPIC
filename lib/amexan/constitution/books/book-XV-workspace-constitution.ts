/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOK XV — THE WORKSPACE RESOLUTION CONSTITUTION
 * Version 1.0
 *
 * Declares the constitutional rules governing how an authenticated actor is
 * resolved into a valid Workspace before any dashboard may be rendered.
 *
 * These rules are LAW, not configuration. No page, component, or engine may
 * render a dashboard for an actor whose Workspace has not been resolved to
 * constitutional completeness. The dashboard is never responsible for deciding
 * who the user is — it only renders an already-resolved Workspace.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ObjectType } from './book-I-objects';
import { ClinicalContext } from './book-III-context';
import { createRule, RuleCategory, RuleNode, RuleAction, RuleTrigger } from './book-IV-rules';

export const WORKSPACE_CONSTITUTION_VERSION = '1.0.0';

/** CR-WS-001 — the supreme workspace rule. */
export const CR_WS_001: RuleNode = createRule({
  id: 'CR-WS-001',
  name: 'No Dashboard Before a Valid Workspace',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnEvent,
  conditions: [
    { field: 'authentication', operator: 'eq', value: 'authenticated' },
    { field: 'workspace', operator: 'not_exists', value: true },
  ],
  action: RuleAction.Block,
  priority: 100,
  targetTypes: [ObjectType.Person, ObjectType.Organization],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'No authenticated user shall ever land on a dashboard before a valid Workspace has been resolved. ' +
    'The dashboard is never responsible for figuring out who the user is. ' +
    'The dashboard only renders an already-resolved workspace.',
  evidence: ['login → authentication → actor loaded → workspace resolution → completeness gate'],
  isActive: true,
  version: 1,
});

/** WS-001 — Dashboard requires a resolved workspace. */
export const WS_001: RuleNode = createRule({
  id: 'WS-001',
  name: 'Dashboard Requires Resolved Workspace',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'target', operator: 'eq', value: 'dashboard' }],
  action: RuleAction.Require,
  priority: 90,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'The dashboard may only render when a valid Workspace has been resolved for the actor.',
  evidence: ['WS-001'],
  isActive: true,
  version: 1,
});

/** WS-002 — Incomplete workspace launches onboarding. */
export const WS_002: RuleNode = createRule({
  id: 'WS-002',
  name: 'Incomplete Workspace Launches Onboarding',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnEvent,
  conditions: [{ field: 'workspace.complete', operator: 'eq', value: false }],
  action: RuleAction.CreateTask,
  priority: 80,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'If a Workspace is incomplete, never render the dashboard. Launch the Professional Onboarding Engine to collect only the missing constitutional information.',
  evidence: ['WS-002'],
  isActive: true,
  version: 1,
});

/** WS-003 — Profession precedes role. */
export const WS_003: RuleNode = createRule({
  id: 'WS-003',
  name: 'Profession Precedes Role',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'role', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 70,
  targetTypes: [ObjectType.Person, ObjectType.Organization],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'A professional identity (profession) must exist before any role is assigned.',
  evidence: ['WS-003'],
  isActive: true,
  version: 1,
});

/** WS-004 — Membership precedes employment. */
export const WS_004: RuleNode = createRule({
  id: 'WS-004',
  name: 'Membership Precedes Employment',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'employment', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 60,
  targetTypes: [ObjectType.Organization],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'An actor must belong to an organization (membership) before employment may be recorded.',
  evidence: ['WS-004'],
  isActive: true,
  version: 1,
});

/** WS-005 — Employment precedes assignment. */
export const WS_005: RuleNode = createRule({
  id: 'WS-005',
  name: 'Employment Precedes Assignment',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'assignment', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 50,
  targetTypes: [ObjectType.Organization],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'An active employment must exist before an assignment is created.',
  evidence: ['WS-005'],
  isActive: true,
  version: 1,
});

/** WS-006 — Assignment determines dashboard. */
export const WS_006: RuleNode = createRule({
  id: 'WS-006',
  name: 'Assignment Determines Dashboard',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'assignment', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 40,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'The active assignment selects which dashboard layout the actor receives.',
  evidence: ['WS-006'],
  isActive: true,
  version: 1,
});

/** WS-007 — Dashboard determines navigation. */
export const WS_007: RuleNode = createRule({
  id: 'WS-007',
  name: 'Dashboard Determines Navigation',
  category: RuleCategory.UI,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'dashboard', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 30,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'The resolved dashboard determines the navigation tree rendered to the actor.',
  evidence: ['WS-007'],
  isActive: true,
  version: 1,
});

/** WS-008 — Navigation determines permissions. */
export const WS_008: RuleNode = createRule({
  id: 'WS-008',
  name: 'Navigation Determines Permissions',
  category: RuleCategory.Security,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'navigation', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 20,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'The navigation tree constrains the permissions surface exposed to the actor.',
  evidence: ['WS-008'],
  isActive: true,
  version: 1,
});

/** WS-009 — Every actor may own multiple workspaces. */
export const WS_009: RuleNode = createRule({
  id: 'WS-009',
  name: 'Multiple Workspaces Per Actor',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'memberships', operator: 'gt', value: 1 }],
  action: RuleAction.Show,
  priority: 10,
  targetTypes: [ObjectType.Organization],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'An actor may own multiple workspaces (e.g. lecturer + consultant + advisor). A workspace switcher must be available.',
  evidence: ['WS-009'],
  isActive: true,
  version: 1,
});

/** WS-010 — Workspace switching never requires re-authentication. */
export const WS_010: RuleNode = createRule({
  id: 'WS-010',
  name: 'Workspace Switching Requires No Re-Authentication',
  category: RuleCategory.Security,
  trigger: RuleTrigger.OnEvent,
  conditions: [{ field: 'event', operator: 'eq', value: 'workspace_switch' }],
  action: RuleAction.Allow,
  priority: 5,
  targetTypes: [ObjectType.Person, ObjectType.Organization],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Switching between workspaces must never require the actor to re-authenticate.',
  evidence: ['WS-010'],
  isActive: true,
  version: 1,
});

/** WS-011 — One actor, one active workspace. */
export const WS_011: RuleNode = createRule({
  id: 'WS-011',
  name: 'One Actor, One Active Workspace',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'workspace.active', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 95,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'A logged-in actor operates in exactly one active workspace at any moment, resolved from ' +
    'Identity → Organization → Role → Workspace. Never a random dashboard.',
  evidence: ['WS-011'],
  isActive: true,
  version: 1,
});

/** WS-012 — Dashboard resolved from role, not hardcoded. */
export const WS_012: RuleNode = createRule({
  id: 'WS-012',
  name: 'Dashboard Resolved From Role',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'target', operator: 'eq', value: 'dashboard' }],
  action: RuleAction.Require,
  priority: 90,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'The Dashboard Resolver is the single source of truth for dashboard routing. Dashboard routes are never hardcoded ' +
    'by role; they are always derived from DashboardResolver from the resolved workspace.',
  evidence: ['WS-012'],
  isActive: true,
  version: 1,
});

/** WS-013 — Every role owns exactly one dashboard family. */
export const WS_013: RuleNode = createRule({
  id: 'WS-013',
  name: 'Every Role Owns One Dashboard Family',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'role', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 88,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'Each role resolves to exactly one dashboard family (Executive, Clinical, Nursing, Laboratory, Pharmacy, ' +
    'Finance, Research, ...). No exceptions.',
  evidence: ['WS-013'],
  isActive: true,
  version: 1,
});

/** WS-014 — Executive users never enter a clinical dashboard (WorkspaceMismatchError). */
export const WS_014: RuleNode = createRule({
  id: 'WS-014',
  name: 'Executive Users Never Enter Clinical Dashboard',
  category: RuleCategory.Security,
  trigger: RuleTrigger.BeforeRender,
  conditions: [{ field: 'role.family', operator: 'eq', value: 'facility_admin' }],
  action: RuleAction.Block,
  priority: 89,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'When the resolved role family is "facility_admin", it is constitutionally illegal to render a clinician ' +
    'dashboard. Matching throws a WorkspaceMismatchError, logs it, and redirects — never continues rendering.',
  evidence: ['WS-014'],
  isActive: true,
  version: 1,
});

/** WS-015 — Clinicians never enter the executive/administrative workspace. */
export const WS_015: RuleNode = createRule({
  id: 'WS-015',
  name: 'Clinicians Never Enter Executive Workspace',
  category: RuleCategory.Security,
  trigger: RuleTrigger.BeforeRender,
  conditions: [{ field: 'role.family', operator: 'neq', value: 'facility_admin' }],
  action: RuleAction.Block,
  priority: 87,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'Clinical roles must never see procurement, payroll, the organization builder, or server status — the ' +
    'executive workspace is reserved for the administrator family.',
  evidence: ['WS-015'],
  isActive: true,
  version: 1,
});

/** WS-016 — Actual pages declare which role families may render them (SupportedRoles). */
export const WS_016: RuleNode = createRule({
  id: 'WS-016',
  name: 'Dashboard Components Declare Privileged Role',
  category: RuleCategory.Security,
  trigger: RuleTrigger.BeforeRender,
  conditions: [{ field: 'component.supportedRoles', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 86,
  targetTypes: [ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'Every renderable component must declare the SupportedRoles, a list of role families it may render. ' +
    'Before rendering, if the current role family is not in SupportedRoles, redirect rather than render.',
  evidence: ['WS-016'],
  isActive: true,
  version: 1,
});

/** All workspace-resolution constitutional rules, ordered by priority (highest first). */
export const WORKSPACE_CONSTITUTIONAL_RULES: RuleNode[] = [
  CR_WS_001,
  WS_011,
  WS_001,
  WS_012,
  WS_014,
  WS_013,
  WS_015,
  WS_016,
  WS_002,
  WS_003,
  WS_004,
  WS_005,
  WS_006,
  WS_007,
  WS_008,
  WS_009,
  WS_010,
];

export function getWorkspaceRule(ruleId: string): RuleNode | undefined {
  return WORKSPACE_CONSTITUTIONAL_RULES.find(r => r.id === ruleId);
}

export function isWorkspaceConstitutionalRule(ruleId: string): boolean {
  return getWorkspaceRule(ruleId) !== undefined;
}
