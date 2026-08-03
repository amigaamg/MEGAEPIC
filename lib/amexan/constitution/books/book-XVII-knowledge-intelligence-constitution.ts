/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOK XVII — CONSTITUTIONAL KNOWLEDGE & INTELLIGENCE FRAMEWORK (CKIF) — Volume KI-1
 * Version 1.0
 *
 * The intelligence constitution. AMEXAN shall not merely collect information; it
 * shall continuously transform raw information into structured, contextual,
 * explainable clinical intelligence that helps clinicians reason better while
 * remaining transparent about how conclusions were reached.
 *
 * First Constitutional Law: Medicine is a reasoning discipline.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ObjectType } from './book-I-objects';
import { ClinicalContext } from './book-III-context';
import { createRule, RuleCategory, RuleNode, RuleAction, RuleTrigger } from './book-IV-rules';

export const KNOWLEDGE_INTELLIGENCE_CONSTITUTION_VERSION = '1.0.0';

/**
 * CR-KI-001 — the supreme intelligence rule.
 * AMEXAN shall assist reasoning, not replace it.
 */
export const CR_KI_001: RuleNode = createRule({
  id: 'CR-KI-001',
  name: 'AMEXAN Assists Reasoning, Never Replaces It',
  category: RuleCategory.Clinical,
  trigger: RuleTrigger.OnEvent,
  conditions: [
    { field: 'output.type', operator: 'in', value: ['interpretation', 'recommendation', 'reasoning_chain'] },
    { field: 'clinician.review', operator: 'not_exists', value: true },
  ],
  action: RuleAction.Warn,
  priority: 100,
  targetTypes: [ObjectType.Reasoning, ObjectType.Recommendation, ObjectType.Decision],
  contexts: [ClinicalContext.Clinical],
  explanation:
    'AMEXAN shall generate structured interpretations, visualizations, evidence links, protocol pathways, and explainable reasoning chains — but clinical responsibility remains with the licensed professional. ' +
    'Every interpretation must remain inspectable, challengeable, and editable. The system assists reasoning, it never replaces it.',
  evidence: ['KI-1 Constitutional safeguard'],
  isActive: true,
  version: 1,
});

/** KI-001 — Nothing remains raw forever. */
export const KI_001: RuleNode = createRule({
  id: 'KI-001',
  name: 'Nothing Remains Raw Forever',
  category: RuleCategory.Data,
  trigger: RuleTrigger.AfterCreate,
  conditions: [{ field: 'observation', operator: 'exists', value: true }],
  action: RuleAction.CreateTask,
  priority: 90,
  targetTypes: [ObjectType.Observation, ObjectType.ClinicalKnowledge],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Every new piece of information immediately enters the Constitutional Processing Pipeline, moving from raw signals up through context, knowledge, and reasoning.',
  evidence: ['KI-1 Principle 1'],
  isActive: true,
  version: 1,
});

/** KI-002 — Every object is alive: meaning through relationships. */
export const KI_002: RuleNode = createRule({
  id: 'KI-002',
  name: 'Every Object Is Alive Through Relationships',
  category: RuleCategory.Data,
  trigger: RuleTrigger.AfterUpdate,
  conditions: [{ field: 'object', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 85,
  targetTypes: [ObjectType.Relationship],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Nothing is static. Every object gains meaning through relationships — a cough with fever, weight loss, night sweats, geography, and HIV occupies a completely different reasoning space.',
  evidence: ['KI-1 Principle 2'],
  isActive: true,
  version: 1,
});

/** KI-003 — Context is mandatory for reasoning. */
export const KI_003: RuleNode = createRule({
  id: 'KI-003',
  name: 'Context Is Mandatory',
  category: RuleCategory.Clinical,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'reasoning', operator: 'exists', value: true }],
  action: RuleAction.Block,
  priority: 80,
  targetTypes: [ObjectType.Reasoning, ObjectType.Context],
  contexts: [ClinicalContext.Clinical],
  explanation: 'No reasoning engine shall operate without context: age, sex, pregnancy, geography, epidemiology, season, occupation, comorbidities, organization, specialty, and level of care.',
  evidence: ['KI-1 Principle 3'],
  isActive: true,
  version: 1,
});

/** KI-004 — Knowledge must always explain itself. */
export const KI_004: RuleNode = createRule({
  id: 'KI-004',
  name: 'Knowledge Explains Itself',
  category: RuleCategory.Clinical,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'conclusion', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 75,
  targetTypes: [ObjectType.Reasoning, ObjectType.Evidence],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Every conclusion shall answer: Why? Based on what? Which facts, protocols, observations, and relationships? The clinician must always be able to inspect the reasoning.',
  evidence: ['KI-1 Principle 4'],
  isActive: true,
  version: 1,
});

/** KI-005 — Intelligence is layered, never one giant engine. */
export const KI_005: RuleNode = createRule({
  id: 'KI-005',
  name: 'Layered Intelligence',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'engine', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 70,
  targetTypes: [ObjectType.Module],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Never one giant engine. Intelligence is layered: observation → context → relationship → pattern → reasoning → knowledge → guideline → documentation → visualization → learning. Each has one responsibility.',
  evidence: ['KI-1 Principle 5'],
  isActive: true,
  version: 1,
});

/** KI-006 — Documentation is computation. */
export const KI_006: RuleNode = createRule({
  id: 'KI-006',
  name: 'Documentation Is Computation',
  category: RuleCategory.Documentation,
  trigger: RuleTrigger.AfterCreate,
  conditions: [{ field: 'note', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 65,
  targetTypes: [ObjectType.Documentation],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Notes are not dead text. Every sentence becomes structured knowledge — location, migration, timeline, associated symptoms, anatomical relationships, reasoning nodes — feeding every engine.',
  evidence: ['KI-1 Principle 11'],
  isActive: true,
  version: 1,
});

/** KI-007 — Evidence traceability. */
export const KI_007: RuleNode = createRule({
  id: 'KI-007',
  name: 'Evidence Traceability',
  category: RuleCategory.Clinical,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'recommendation', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 60,
  targetTypes: [ObjectType.Recommendation, ObjectType.Evidence],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Every recommendation must expose its source guideline, publication, version, local adaptation, and clinician modification. Nothing becomes anonymous knowledge.',
  evidence: ['KI-1 Principle 16'],
  isActive: true,
  version: 1,
});

/** KI-008 — Personalized protocol engine with layered inheritance. */
export const KI_008: RuleNode = createRule({
  id: 'KI-008',
  name: 'Personalized Protocol Layering',
  category: RuleCategory.Clinical,
  trigger: RuleTrigger.BeforeUpdate,
  conditions: [{ field: 'protocol', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 55,
  targetTypes: [ObjectType.Protocol, ObjectType.Guideline],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Every protocol exists in layers — global, country, organization, department, personal. The clinician may customize without destroying the default; inheritance keeps updates manageable.',
  evidence: ['KI-1 Principle 17'],
  isActive: true,
  version: 1,
});

/** KI-009 — Reflection engine. */
export const KI_009: RuleNode = createRule({
  id: 'KI-009',
  name: 'Reflection Is Constitutional',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.OnTransition,
  conditions: [{ field: 'event', operator: 'eq', value: 'case_completed' }],
  action: RuleAction.CreateTask,
  priority: 50,
  targetTypes: [ObjectType.Reasoning, ObjectType.Person],
  contexts: [ClinicalContext.Clinical],
  explanation: 'After every completed case the clinician may record what was learned, what was missed, what changed, and future reminders. This becomes personal and institutional memory.',
  evidence: ['KI-1 Principle 19'],
  isActive: true,
  version: 1,
});

/** KI-010 — Knowledge is multi-view. */
export const KI_010: RuleNode = createRule({
  id: 'KI-010',
  name: 'Knowledge Is Multi-View',
  category: RuleCategory.UI,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'case', operator: 'exists', value: true }],
  action: RuleAction.Show,
  priority: 45,
  targetTypes: [ObjectType.ClinicalKnowledge],
  contexts: [ClinicalContext.Clinical],
  explanation: 'One case, many views: clinical, teaching, research, administrative, patient explanation, referral, audit. Same facts, different presentation.',
  evidence: ['KI-1 Principle 10'],
  isActive: true,
  version: 1,
});

/** KI-011 — Personal knowledge workspace. */
export const KI_011: RuleNode = createRule({
  id: 'KI-011',
  name: 'Personal Knowledge Workspace',
  category: RuleCategory.Clinical,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'person', operator: 'exists', value: true }],
  action: RuleAction.Allow,
  priority: 40,
  targetTypes: [ObjectType.Person, ObjectType.ClinicalKnowledge],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Every clinician owns a Personal Knowledge Workspace — preferred documentation style, favorite guidelines, local protocols, note templates, reasoning shortcuts. The system never replaces clinical judgement.',
  evidence: ['KI-1 Principle 8'],
  isActive: true,
  version: 1,
});

/** All CKIF constitutional rules, ordered by priority. */
export const KNOWLEDGE_INTELLIGENCE_CONSTITUTIONAL_RULES: RuleNode[] = [
  CR_KI_001,
  KI_001,
  KI_002,
  KI_003,
  KI_004,
  KI_005,
  KI_006,
  KI_007,
  KI_008,
  KI_009,
  KI_010,
  KI_011,
];

export function getKnowledgeIntelligenceRule(ruleId: string): RuleNode | undefined {
  return KNOWLEDGE_INTELLIGENCE_CONSTITUTIONAL_RULES.find(r => r.id === ruleId);
}

export function isKnowledgeIntelligenceConstitutionalRule(ruleId: string): boolean {
  return getKnowledgeIntelligenceRule(ruleId) !== undefined;
}
