/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOK XIX — CONSTITUTIONAL HEALTHCARE COMMUNITY FRAMEWORK (CHCF) — Volume HC-1
 * Version 1.0
 *
 * The community constitution. AMEXAN shall foster a community, not a social
 * network. It connects clinicians, learners, patients, families, and the public —
 * a community that learns together, supports each other, researches together,
 * and continuously works to improve healthcare for everyone.
 *
 * Constitutional Law HC-001: Every interaction in the community shall contribute
 * to the constitutional purposes of AMEXAN — better clinical practice,
 * better learning, better research, better patient care, better public health.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ObjectType } from './book-I-objects';
import { ClinicalContext } from './book-III-context';
import { createRule, RuleCategory, RuleNode, RuleAction, RuleTrigger } from './book-IV-rules';

export const HEALTHCARE_COMMUNITY_CONSTITUTION_VERSION = '1.0.0';

/**
 * CR-HC-001 — the supreme community rule.
 * Never optimize for engagement, advertising, or time spent.
 */
export const CR_HC_001: RuleNode = createRule({
  id: 'CR-HC-001',
  name: 'Never Optimize for Engagement or Time Spent',
  category: RuleCategory.Governance,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [
    { field: 'metric', operator: 'in', value: ['engagement', 'time_spent', 'ad_views', 'impressions', 'dwell_time', 'scroll_depth', 'sessions_per_day'] },
    { field: 'metric.target', operator: 'exists', value: true },
  ],
  action: RuleAction.Block,
  priority: 100,
  targetTypes: [ObjectType.Community, ObjectType.Rule, ObjectType.Context],
  contexts: [ClinicalContext.SystemLevel],
  explanation:
    'AMEXAN shall never optimize for engagement, advertising, or time spent. No attention-baiting, no outrage feeds, no infinite scroll engineered to keep people online. ' +
    'No metrics such as daily sessions, time-on-platform, or impressions shall ever drive product decisions. ' +
    'Success is measured only by healthcare improvement: better clinical practice, better learning, better research, better patient outcomes, better public health.',
  evidence: ['HC-1 Constitutional safeguard'],
  isActive: true,
  version: 1,
});

/** HC-001 — The healthcare community, not a social network. */
export const HC_001: RuleNode = createRule({
  id: 'HC-001',
  name: 'A Healthcare Community, Not a Social Network',
  category: RuleCategory.Governance,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'community', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 90,
  targetTypes: [ObjectType.Community, ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every feature of the community shall serve a healthcare purpose. No engagement feeds, no popularity contests, no arbitrary social rewards.',
  evidence: ['HC-1 Law HC-001'],
  isActive: true,
  version: 1,
});

/** HC-002 — Community objects, not social posts. */
export const HC_002: RuleNode = createRule({
  id: 'HC-002',
  name: 'Community Objects Replace Social Posts',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'content', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 85,
  targetTypes: [ObjectType.Community],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'There are no "posts". Every content unit is a structured community object — clinical case, journal club item, teaching pearl, learning path, discussion question, decision topic, conference announcement, protocol discussion, experience share, research opportunity, question, tip, or event.',
  evidence: ['HC-1 Principle 2'],
  isActive: true,
  version: 1,
});

/** HC-003 — Layered communities. */
export const HC_003: RuleNode = createRule({
  id: 'HC-003',
  name: 'Layered Communities',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'community', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 80,
  targetTypes: [ObjectType.Community],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Communities exist in layers — global healthcare community, organizations, departments, specialties, teaching groups, patient communities, telemedicine groups, research teams, humanitarian groups.',
  evidence: ['HC-1 Principle 3'],
  isActive: true,
  version: 1,
});

/** HC-004 — Verified professional identity. */
export const HC_004: RuleNode = createRule({
  id: 'HC-004',
  name: 'Verified Professional Identity',
  category: RuleCategory.Governance,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'person.professional', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 75,
  targetTypes: [ObjectType.Person, ObjectType.Role],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Healthcare professionals are verified through licensing, institutional, or professional verification. Clinicians identify their specialty, community, and clinical interests. Clinical voices are never anonymous.',
  evidence: ['HC-1 Principle 4'],
  isActive: true,
  version: 1,
});

/** HC-005 — The healthcare social graph is clinical and professional. */
export const HC_005: RuleNode = createRule({
  id: 'HC-005',
  name: 'Healthcare Social Graph',
  category: RuleCategory.Data,
  trigger: RuleTrigger.AfterCreate,
  conditions: [{ field: 'relationship', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 70,
  targetTypes: [ObjectType.Relationship, ObjectType.Person],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'The social graph is professional and clinical — teacher–student, mentor–mentee, colleagues in the same specialty, members of the same department, patients of the same clinician.',
  evidence: ['HC-1 Principle 5'],
  isActive: true,
  version: 1,
});

/** HC-006 — Knowledge-driven feed. */
export const HC_006: RuleNode = createRule({
  id: 'HC-006',
  name: 'Knowledge-Driven Feed',
  category: RuleCategory.UI,
  trigger: RuleTrigger.OnRead,
  conditions: [{ field: 'feed', operator: 'exists', value: true }],
  action: RuleAction.Show,
  priority: 65,
  targetTypes: [ObjectType.Community],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'The feed shows community objects relevant to the clinician\'s specialty, interests, learning, and organization — driven by professional knowledge, never by engagement.',
  evidence: ['HC-1 Principle 7'],
  isActive: true,
  version: 1,
});

/** HC-007 — Constitutional news engine. */
export const HC_007: RuleNode = createRule({
  id: 'HC-007',
  name: 'Constitutional News Engine',
  category: RuleCategory.Data,
  trigger: RuleTrigger.AfterCreate,
  conditions: [{ field: 'news', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 60,
  targetTypes: [ObjectType.Community, ObjectType.Evidence],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'News is organized by medical specialty and geographical region, sourced from trustworthy, labeled channels. Every news item is linked to its original source and tagged with impact and relevance.',
  evidence: ['HC-1 Principle 8'],
  isActive: true,
  version: 1,
});

/** HC-008 — Clinical discussion spaces are safe. */
export const HC_008: RuleNode = createRule({
  id: 'HC-008',
  name: 'Safe Clinical Discussion Spaces',
  category: RuleCategory.Governance,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'discussion', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 55,
  targetTypes: [ObjectType.Community],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Clinical discussions happen in safe, professionally moderated spaces. No patient data, no blame, no fear — honest learning protected by clear community rules.',
  evidence: ['HC-1 Principle 9'],
  isActive: true,
  version: 1,
});

/** HC-009 — Teaching communities. */
export const HC_009: RuleNode = createRule({
  id: 'HC-009',
  name: 'Teaching Communities',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'teaching', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 50,
  targetTypes: [ObjectType.Community, ObjectType.Department],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every teaching community has a structure: cases, journals, images, protocols, seminars, conferences, Q&A, assessments. A teacher can follow students and guide learning.',
  evidence: ['HC-1 Principle 10'],
  isActive: true,
  version: 1,
});

/** HC-010 — Patient communities protect and educate. */
export const HC_010: RuleNode = createRule({
  id: 'HC-010',
  name: 'Protected Patient Communities',
  category: RuleCategory.Privacy,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'patient_community', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 45,
  targetTypes: [ObjectType.Patient, ObjectType.Community],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Patient communities are protected, private, and moderated by healthcare professionals. The best scientific evidence, educational material, and compassionate support are offered.',
  evidence: ['HC-1 Principle 11'],
  isActive: true,
  version: 1,
});

/** HC-011 — Telemedicine communities connect responsibly. */
export const HC_011: RuleNode = createRule({
  id: 'HC-011',
  name: 'Telemedicine Communities',
  category: RuleCategory.Clinical,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'telemedicine', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 40,
  targetTypes: [ObjectType.Patient, ObjectType.Community],
  contexts: [ClinicalContext.Clinical],
  explanation: 'Telemedicine communities connect patients and clinicians for consultation, education, follow-up, and monitoring — always responsible, always protective of patients, always respecting scope of practice.',
  evidence: ['HC-1 Principle 12'],
  isActive: true,
  version: 1,
});

/** HC-012 — Humanitarian collaboration. */
export const HC_012: RuleNode = createRule({
  id: 'HC-012',
  name: 'Humanitarian Collaboration',
  category: RuleCategory.Workflow,
  trigger: RuleTrigger.BeforeCreate,
  conditions: [{ field: 'humanitarian', operator: 'exists', value: true }],
  action: RuleAction.Allow,
  priority: 35,
  targetTypes: [ObjectType.Community],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'During emergencies, AMEXAN connects responders, researchers, and healthcare organizations for crisis collaboration — with strict ethical standards, data protection, and transparency.',
  evidence: ['HC-1 Principle 13'],
  isActive: true,
  version: 1,
});

/** HC-013 — Public health awareness, not marketing. */
export const HC_013: RuleNode = createRule({
  id: 'HC-013',
  name: 'Public Health Awareness Communities',
  category: RuleCategory.Reporting,
  trigger: RuleTrigger.AfterCreate,
  conditions: [{ field: 'public_health', operator: 'exists', value: true }],
  action: RuleAction.Require,
  priority: 30,
  targetTypes: [ObjectType.Community, ObjectType.ClinicalKnowledge],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Communities raise awareness on diabetes, hypertension, child health, maternal health, vaccination, mental health, and public health — through education, never sensationalism or marketing.',
  evidence: ['HC-1 Principle 15'],
  isActive: true,
  version: 1,
});

/** HC-014 — Reputation comes from contribution. */
export const HC_014: RuleNode = createRule({
  id: 'HC-014',
  name: 'Reputation Through Contribution',
  category: RuleCategory.Governance,
  trigger: RuleTrigger.AfterCreate,
  conditions: [{ field: 'contribution', operator: 'exists', value: true }],
  action: RuleAction.SetValue,
  priority: 25,
  targetTypes: [ObjectType.Person, ObjectType.Community],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Reputation is earned through contribution — teaching, sharing cases, answering questions, research, mentoring, and support. Never through likes, followers, or popularity.',
  evidence: ['HC-1 Principle 18'],
  isActive: true,
  version: 1,
});

/** HC-015 — Constitutional moderation. */
export const HC_015: RuleNode = createRule({
  id: 'HC-015',
  name: 'Constitutional Moderation',
  category: RuleCategory.Governance,
  trigger: RuleTrigger.OnEvent,
  conditions: [{ field: 'content.report', operator: 'eq', value: 'violation' }],
  action: RuleAction.Block,
  priority: 20,
  targetTypes: [ObjectType.Community, ObjectType.Rule],
  contexts: [ClinicalContext.SystemLevel],
  explanation: 'Every community has a moderation hierarchy — automated rule-based review, community moderators, platform moderators, and finally constitutional review.',
  evidence: ['HC-1 Principle 19'],
  isActive: true,
  version: 1,
});

/** All CHCF constitutional rules, ordered by priority. */
export const HEALTHCARE_COMMUNITY_CONSTITUTIONAL_RULES: RuleNode[] = [
  CR_HC_001,
  HC_001,
  HC_002,
  HC_003,
  HC_004,
  HC_005,
  HC_006,
  HC_007,
  HC_008,
  HC_009,
  HC_010,
  HC_011,
  HC_012,
  HC_013,
  HC_014,
  HC_015,
];

export function getHealthcareCommunityRule(ruleId: string): RuleNode | undefined {
  return HEALTHCARE_COMMUNITY_CONSTITUTIONAL_RULES.find(r => r.id === ruleId);
}

export function isHealthcareCommunityConstitutionalRule(ruleId: string): boolean {
  return getHealthcareCommunityRule(ruleId) !== undefined;
}
