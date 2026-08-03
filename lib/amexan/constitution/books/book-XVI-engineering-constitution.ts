/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOK XVI — CONSTITUTIONAL SOFTWARE ENGINEERING FRAMEWORK (CSEF) — Volume SC-1
 * Version 1.0
 *
 * The engineering constitution. Governs how AMEXAN is built so that 2, 20, 200,
 * or 2,000 developers can work simultaneously for decades without breaking one
 * another. This is not coding style; this is constitutional software engineering.
 *
 * Mission: Every engineer shall be able to work independently, safely, and
 * efficiently on a bounded part of AMEXAN without risking the stability of the
 * entire Clinical Operating System.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ObjectType } from './book-I-objects';
import { ClinicalContext } from './book-III-context';
import { createRule, RuleCategory, RuleNode, RuleAction, RuleTrigger } from './book-IV-rules';

export const SOFTWARE_ENGINEERING_CONSTITUTION_VERSION = '1.0.0';

/**
 * CR-SC-001 — the supreme engineering rule.
 * Sensitive logic shall never reside in frontend code. The frontend is an
 * untrusted presentation layer: render, collect input, display output — nothing
 * more. Security is enforced exclusively by backend services, authenticated
 * APIs, and the constitutional rule engines.
 */
export const CR_SC_001: RuleNode = createRule({
  id: 'CR-SC-001',
  name: 'Frontend Is an Untrusted Presentation Layer',
  category: RuleCategory.Security,
  trigger: RuleTrigger.OnEvent,
  conditions: [
    { field: 'layer', operator: 'eq', value: 'presentation' },
    { field: 'logic', operator: 'in', value: ['permission', 'pricing', 'rules', 'clinical_decision', 'role_decision', 'token', 'secret', 'business_logic'] },
  ],
  action: RuleAction.Block,
  priority: 100,
  targetTypes: [ObjectType.System, ObjectType.Module, ObjectType.Rule],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'Sensitive logic shall NEVER exist in the frontend. Permission logic, pricing, rules, clinical decisions, role decisions, tokens, secrets, and business logic must never ship to the browser. ' +
    'Browser-delivered code can always be inspected; obfuscation creates a false sense of security. ' +
    'The frontend is an untrusted presentation layer — render, collect input, display output. ' +
    'Security is enforced exclusively by backend services, authenticated APIs, and the constitutional rule engines.',
  evidence: ['SC-1 Principle 8', 'One important correction'],
  isActive: true,
  version: 1,
});

/** SC-001 — No one needs to understand the whole codebase to contribute. */
export const SC_001: RuleNode = createRule({
  id: 'SC-001',
  name: 'Bounded Contribution',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'context', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 90,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'A developer shall never need to understand the entire codebase to contribute. Code is organized into bounded contexts.',
  evidence: ['SC-1 Rule SC-001'],
  isActive: true,
  version: 1,
});

/** SC-002 — Every module exposes only its public interface. */
export const SC_002: RuleNode = createRule({
  id: 'SC-002',
  name: 'Public Interface Only',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'module', operator: 'exists', value: true }],
  action: RuleAction.Show,
  priority: 85,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every module shall expose only its Public Interface. Everything else (Firestore, caching, queries, internal rules) remains private.',
  evidence: ['SC-1 Rule SC-002'],
  isActive: true,
  version: 1,
});

/** SC-003 — Modules communicate only through contracts. */
export const SC_003: RuleNode = createRule({
  id: 'SC-003',
  name: 'Contracts Only',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'communication', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 80,
  targetTypes: [ObjectType.Module, ObjectType.Relationship],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every module shall communicate ONLY through Contracts, never directly. UI → Module API → Engine → Persistence, not UI → Firestore.',
  evidence: ['SC-1 Rule SC-003'],
  isActive: true,
  version: 1,
});

/** SC-004 — No module may import another module's private implementation. */
export const SC_004: RuleNode = createRule({
  id: 'SC-004',
  name: 'No Private Imports',
  category: RuleCategory.Security,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'import.target', operator: 'matches', value: 'private|internal|impl' }],
  action: RuleAction.Block,
  priority: 75,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'No module may import another module\'s private implementation. Only public interfaces may be imported.',
  evidence: ['SC-1 Rule SC-004'],
  isActive: true,
  version: 1,
});

/** SC-005 — Every module shall be independently deployable. */
export const SC_005: RuleNode = createRule({
  id: 'SC-005',
  name: 'Independently Deployable',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.Scheduled,
  conditions: [{ field: 'module', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 70,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every module shall be independently deployable. This is the constitutional goal; the monorepo structure moves toward it.',
  evidence: ['SC-1 Rule SC-005'],
  isActive: true,
  version: 1,
});

/** SC-006 — Strict layer isolation: Presentation → Application → Domain → Infrastructure → Persistence. */
export const SC_006: RuleNode = createRule({
  id: 'SC-006',
  name: 'Strict Layer Isolation',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'layer', operator: 'exists', value: true }],
  action: RuleAction.Block,
  priority: 65,
  targetTypes: [ObjectType.System, ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'AMEXAN shall contain strict layers — Presentation → Application → Domain → Infrastructure → Persistence. UI must never talk directly to Firestore.',
  evidence: ['SC-1 Principle 3'],
  isActive: true,
  version: 1,
});

/** SC-007 — Feature-based architecture, not components/pages/utils folders. */
export const SC_007: RuleNode = createRule({
  id: 'SC-007',
  name: 'Feature-Based Architecture',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'context', operator: 'eq', value: 'feature' }],
  action: RuleAction.Require,
  priority: 60,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Architecture is feature-based (workspace/, patient/, knowledge/, workflow/), not components/pages/hooks/utils. Everything for a feature lives together.',
  evidence: ['SC-1 Principle 4'],
  isActive: true,
  version: 1,
});

/** SC-008 — Teams own domains. */
export const SC_008: RuleNode = createRule({
  id: 'SC-008',
  name: 'Teams Own Domains',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'ownership', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 55,
  targetTypes: [ObjectType.System],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every domain is owned by exactly one team. The Identity team never edits Patient; teams communicate through APIs only.',
  evidence: ['SC-1 Principle 5', 'SC-1 Principle 13'],
  isActive: true,
  version: 1,
});

/** SC-009 — Zero shared chaos: banned folders unless constitutionally defined. */
export const SC_009: RuleNode = createRule({
  id: 'SC-009',
  name: 'No Shared Chaos Folders',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'path', operator: 'matches', value: '^(helpers|utils|misc|shared|common)/' }],
  action: RuleAction.Block,
  priority: 50,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Generic helpers/utils/misc/shared/common folders are banned unless constitutionally defined. Utilities are bounded: workspace-utils, patient-utils, knowledge-utils.',
  evidence: ['SC-1 Principle 12'],
  isActive: true,
  version: 1,
});

/** SC-010 — Every piece of code has one owner. */
export const SC_010: RuleNode = createRule({
  id: 'SC-010',
  name: 'Every Piece of Code Has One Owner',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'module', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 45,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'No file belongs to everyone. Every component, module, engine, service, package, and API must declare an owner team, owner engineer, documentation, and tests.',
  evidence: ['SC-1 Principle 1', 'SC-1 Principle 13'],
  isActive: true,
  version: 1,
});

/** SC-011 — Mandatory test gates before merge. */
export const SC_011: RuleNode = createRule({
  id: 'SC-011',
  name: 'Mandatory Test Gates',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnEvent,
  conditions: [{ field: 'event', operator: 'eq', value: 'merge' }],
  action: RuleAction.Require,
  priority: 40,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'A feature cannot merge unless it passes unit tests, integration tests, type checking, linting, security scans, and performance checks. No exceptions.',
  evidence: ['SC-1 Principle 22'],
  isActive: true,
  version: 1,
});

/** SC-012 — Design tokens are the single source of truth. */
export const SC_012: RuleNode = createRule({
  id: 'SC-012',
  name: 'Design Tokens Are the Single Source of Truth',
  category: RuleCategory.UI,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'style', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 35,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Colors, spacing, typography, border radius, shadows, animations, icons, and breakpoints are defined once as design tokens. Designers change tokens; the whole application updates.',
  evidence: ['SC-1 Principle 23'],
  isActive: true,
  version: 1,
});

/** SC-013 — Observability by default. */
export const SC_013: RuleNode = createRule({
  id: 'SC-013',
  name: 'Observability by Default',
  category: RuleCategory.Audit,
  trigger: RuleTrigger.Scheduled,
  conditions: [{ field: 'module', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 30,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every module emits structured logs, metrics, traces, and health status. No black boxes.',
  evidence: ['SC-1 Principle 24'],
  isActive: true,
  version: 1,
});

/** SC-014 — Engineering permissions: nobody bypasses review. */
export const SC_014: RuleNode = createRule({
  id: 'SC-014',
  name: 'Engineering Permissions',
  category: RuleCategory.Security,
  trigger: RuleTrigger.OnEvent,
  conditions: [{ field: 'event', operator: 'eq', value: 'deploy' }],
  action: RuleAction.Require,
  priority: 25,
  targetTypes: [ObjectType.System],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Everything is permission-based, like hospitals. Juniors cannot merge platform code; seniors cannot deploy without review. No one works directly on main.',
  evidence: ['SC-1 Principle 14', 'SC-1 Principle 21'],
  isActive: true,
  version: 1,
});

/** SC-015 — Documentation is code. */
export const SC_015: RuleNode = createRule({
  id: 'SC-015',
  name: 'Documentation Is Code',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'module', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 20,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every module must contain README, architecture, public API, examples, flow, diagrams, and tests so a future engineer understands without asking.',
  evidence: ['SC-1 Principle 15'],
  isActive: true,
  version: 1,
});

/** All CSEF constitutional rules, ordered by priority (highest first). */
export const SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES: RuleNode[] = [
  CR_SC_001,
  SC_001,
  SC_002,
  SC_003,
  SC_004,
  SC_005,
  SC_006,
  SC_007,
  SC_008,
  SC_009,
  SC_010,
  SC_011,
  SC_012,
  SC_013,
  SC_014,
  SC_015,
];

export function getSoftwareEngineeringRule(ruleId: string): RuleNode | undefined {
  return SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES.find(r => r.id === ruleId);
}

export function isSoftwareEngineeringConstitutionalRule(ruleId: string): boolean {
  return getSoftwareEngineeringRule(ruleId) !== undefined;
}
