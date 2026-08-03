/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOK I — THE AMEXAN CORE CONSTITUTION
 * Version 1.0 — The Supreme Constitution of the AMEXAN Clinical Operating System
 *
 * This module is IMMUTABLE. It is not documentation; it is the supreme law of the
 * operating system. Nothing—not AI, not plugins, not hospitals, not developers,
 * not future CEOs—may violate it.
 *
 * Guarantees: safety, interoperability, scalability, adaptability, explainability,
 * sustainability, longevity.
 *
 * No implementation shall supersede the Constitution.
 * Every module shall conform to the Constitution.
 * Every future technology shall extend—not replace—the Constitution.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ObjectType } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';

export const CORE_CONSTITUTION_NAME = 'AMEXAN Core Constitution';
export const CORE_CONSTITUTION_VERSION = '1.0.0';
export const CORE_CONSTITUTION_IMMUTABLE = true;
export const CORE_CONSTITUTION_PREVIOUS_VERSION: string | null = null;

export const CONSTITUTIONAL_OATH =
  'I shall never place business logic where presentation belongs. ' +
  'I shall never compromise patient safety for convenience. ' +
  'I shall never hardcode what should be configurable. ' +
  'I shall preserve the Constitution above implementation. ' +
  'I shall build systems that remain understandable, extensible, testable, ' +
  'explainable, and safe for future generations of healthcare.';

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME ONE — PHILOSOPHY
 * The operating system shall never be built around pages. It shall be built
 * around healthcare: People, Organizations, Knowledge, Reasoning, Care,
 * Communication, Education, Research, Improvement. Everything else is implementation.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum ConstitutionalPrinciple {
  HealthcareIsDynamic = 'healthcare_is_dynamic',
  MedicineChanges = 'medicine_changes',
  HospitalsDiffer = 'hospitals_differ',
  SoftwareLearnsTheUser = 'software_learns_the_user',
  ClinicalReasoningIsSacred = 'clinical_reasoning_is_sacred',
  ConstitutionNeverContainsImplementation = 'constitution_never_contains_implementation',
  EverythingIsObjects = 'everything_is_objects',
  EveryObjectOwnsIdentity = 'every_object_owns_identity',
  EveryObjectOwnsLifecycle = 'every_object_owns_lifecycle',
  EveryObjectOwnsRelationships = 'every_object_owns_relationships',
  EveryObjectOwnsPermissions = 'every_object_owns_permissions',
  EveryObjectOwnsVersion = 'every_object_owns_version',
  EveryObjectOwnsTelemetry = 'every_object_owns_telemetry',
  EveryInteractionExplainable = 'every_interaction_explainable',
  EveryDecisionAuditable = 'every_decision_auditable',
  NoAiBypassesConstitutionalReasoning = 'no_ai_bypasses_constitutional_reasoning',
  PresentationNeverOwnsLogic = 'presentation_never_owns_logic',
  LogicNeverOwnsPresentation = 'logic_never_owns_presentation',
  EverythingReplaceable = 'everything_replaceable',
  EverythingReusable = 'everything_reusable',
  EverythingMeasurable = 'everything_measurable',
  EveryModuleIndependentlyTestable = 'every_module_independently_testable',
  OrganizationsOwnTheirData = 'organizations_own_their_data',
  NoHospitalCustomizesConstitutionalBehaviour = 'no_hospital_customizes_constitutional_behaviour',
  BackwardCompatibilityIsConstitutional = 'backward_compatibility_is_constitutional',
}

export const CONSTITUTIONAL_PRINCIPLES: ConstitutionalPrinciple[] = [
  ConstitutionalPrinciple.HealthcareIsDynamic,
  ConstitutionalPrinciple.MedicineChanges,
  ConstitutionalPrinciple.HospitalsDiffer,
  ConstitutionalPrinciple.SoftwareLearnsTheUser,
  ConstitutionalPrinciple.ClinicalReasoningIsSacred,
  ConstitutionalPrinciple.ConstitutionNeverContainsImplementation,
  ConstitutionalPrinciple.EverythingIsObjects,
  ConstitutionalPrinciple.EveryObjectOwnsIdentity,
  ConstitutionalPrinciple.EveryObjectOwnsLifecycle,
  ConstitutionalPrinciple.EveryObjectOwnsRelationships,
  ConstitutionalPrinciple.EveryObjectOwnsPermissions,
  ConstitutionalPrinciple.EveryObjectOwnsVersion,
  ConstitutionalPrinciple.EveryObjectOwnsTelemetry,
  ConstitutionalPrinciple.EveryInteractionExplainable,
  ConstitutionalPrinciple.EveryDecisionAuditable,
  ConstitutionalPrinciple.NoAiBypassesConstitutionalReasoning,
  ConstitutionalPrinciple.PresentationNeverOwnsLogic,
  ConstitutionalPrinciple.LogicNeverOwnsPresentation,
  ConstitutionalPrinciple.EverythingReplaceable,
  ConstitutionalPrinciple.EverythingReusable,
  ConstitutionalPrinciple.EverythingMeasurable,
  ConstitutionalPrinciple.EveryModuleIndependentlyTestable,
  ConstitutionalPrinciple.OrganizationsOwnTheirData,
  ConstitutionalPrinciple.NoHospitalCustomizesConstitutionalBehaviour,
  ConstitutionalPrinciple.BackwardCompatibilityIsConstitutional,
];

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME TWO — CONSTITUTIONAL DOMAINS
 * Everything belongs to one constitutional domain. No orphan modules.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum ConstitutionalDomain {
  Identity = 'identity',
  Organization = 'organization',
  Clinical = 'clinical',
  Administrative = 'administrative',
  Financial = 'financial',
  Communication = 'communication',
  Education = 'education',
  Research = 'research',
  Analytics = 'analytics',
  Marketplace = 'marketplace',
  Infrastructure = 'infrastructure',
  AI = 'ai',
  Integration = 'integration',
  Presentation = 'presentation',
  Experience = 'experience',
  Interaction = 'interaction',
  Workspace = 'workspace',
  Monitoring = 'monitoring',
  Security = 'security',
  Governance = 'governance',
}

export const CONSTITUTIONAL_DOMAINS: ConstitutionalDomain[] = [
  ConstitutionalDomain.Identity,
  ConstitutionalDomain.Organization,
  ConstitutionalDomain.Clinical,
  ConstitutionalDomain.Administrative,
  ConstitutionalDomain.Financial,
  ConstitutionalDomain.Communication,
  ConstitutionalDomain.Education,
  ConstitutionalDomain.Research,
  ConstitutionalDomain.Analytics,
  ConstitutionalDomain.Marketplace,
  ConstitutionalDomain.Infrastructure,
  ConstitutionalDomain.AI,
  ConstitutionalDomain.Integration,
  ConstitutionalDomain.Presentation,
  ConstitutionalDomain.Experience,
  ConstitutionalDomain.Interaction,
  ConstitutionalDomain.Workspace,
  ConstitutionalDomain.Monitoring,
  ConstitutionalDomain.Security,
  ConstitutionalDomain.Governance,
];

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME THREE — CONSTITUTIONAL OBJECTS
 * Every object derives from the Universal Object and inherits:
 *   ID, Name, Owner, Lifecycle, Relationships, Events, Permissions, Version, Telemetry
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface UniversalObjectConstitution {
  id: string;
  name: string;
  owner: string;
  domain: ConstitutionalDomain;
  objectType: ObjectType;
  lifecycle: string;
  relationships: string[];
  events: { emits: string[]; consumes: string[] };
  permissions: string[];
  version: number;
  telemetry: boolean;
}

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME FOUR — CONSTITUTIONAL RELATIONSHIPS
 * Everything relates through explicit relationships. Never hidden.
 * Neo4j becomes the constitutional representation.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum RelationshipCategory {
  BelongsTo = 'belongs_to',
  Contains = 'contains',
  DependsOn = 'depends_on',
  Activates = 'activates',
  Requires = 'requires',
  Produces = 'produces',
  Consumes = 'consumes',
  References = 'references',
  Monitors = 'monitors',
  Audits = 'audits',
  Teaches = 'teaches',
  Extends = 'extends',
  Overrides = 'overrides',
  Communicates = 'communicates',
  Synchronizes = 'synchronizes',
  Owns = 'owns',
  Delegates = 'delegates',
  Observes = 'observes',
  Versions = 'versions',
  Supersedes = 'supersedes',
}

export const RELATIONSHIP_CATEGORIES: RelationshipCategory[] = [
  RelationshipCategory.BelongsTo,
  RelationshipCategory.Contains,
  RelationshipCategory.DependsOn,
  RelationshipCategory.Activates,
  RelationshipCategory.Requires,
  RelationshipCategory.Produces,
  RelationshipCategory.Consumes,
  RelationshipCategory.References,
  RelationshipCategory.Monitors,
  RelationshipCategory.Audits,
  RelationshipCategory.Teaches,
  RelationshipCategory.Extends,
  RelationshipCategory.Overrides,
  RelationshipCategory.Communicates,
  RelationshipCategory.Synchronizes,
  RelationshipCategory.Owns,
  RelationshipCategory.Delegates,
  RelationshipCategory.Observes,
  RelationshipCategory.Versions,
  RelationshipCategory.Supersedes,
];

export const RELATIONSHIP_TYPE_CATEGORY: Partial<Record<RelationshipType, RelationshipCategory>> = {
  [RelationshipType.HasEncounter]: RelationshipCategory.Contains,
  [RelationshipType.HasComplaint]: RelationshipCategory.Contains,
  [RelationshipType.Requires]: RelationshipCategory.Requires,
  [RelationshipType.Overrides]: RelationshipCategory.Overrides,
  [RelationshipType.InheritsFrom]: RelationshipCategory.Extends,
  [RelationshipType.Activates]: RelationshipCategory.Activates,
};

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME FIVE — CONSTITUTIONAL ENGINES
 * Every intelligence belongs to an engine. No engine performs another engine's work.
 * Each engine owns exactly one responsibility.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum ConstitutionalEngine {
  IdentityEngine = 'identity_engine',
  OrganizationEngine = 'organization_engine',
  MembershipEngine = 'membership_engine',
  VerificationEngine = 'verification_engine',
  ReasoningEngine = 'reasoning_engine',
  WorkflowEngine = 'workflow_engine',
  PresentationEngine = 'presentation_engine',
  WorkspaceEngine = 'workspace_engine',
  InteractionEngine = 'interaction_engine',
  ExperienceEngine = 'experience_engine',
  KnowledgeEngine = 'knowledge_engine',
  DocumentationEngine = 'documentation_engine',
  EducationEngine = 'education_engine',
  ResearchEngine = 'research_engine',
  AnalyticsEngine = 'analytics_engine',
  IntegrationEngine = 'integration_engine',
  MarketplaceEngine = 'marketplace_engine',
  TelemetryEngine = 'telemetry_engine',
  MonitoringEngine = 'monitoring_engine',
  NotificationEngine = 'notification_engine',
  BillingEngine = 'billing_engine',
  SubscriptionEngine = 'subscription_engine',
  PolicyEngine = 'policy_engine',
  SecurityEngine = 'security_engine',
}

export const CONSTITUTIONAL_ENGINES: ConstitutionalEngine[] = [
  ConstitutionalEngine.IdentityEngine,
  ConstitutionalEngine.OrganizationEngine,
  ConstitutionalEngine.MembershipEngine,
  ConstitutionalEngine.VerificationEngine,
  ConstitutionalEngine.ReasoningEngine,
  ConstitutionalEngine.WorkflowEngine,
  ConstitutionalEngine.PresentationEngine,
  ConstitutionalEngine.WorkspaceEngine,
  ConstitutionalEngine.InteractionEngine,
  ConstitutionalEngine.ExperienceEngine,
  ConstitutionalEngine.KnowledgeEngine,
  ConstitutionalEngine.DocumentationEngine,
  ConstitutionalEngine.EducationEngine,
  ConstitutionalEngine.ResearchEngine,
  ConstitutionalEngine.AnalyticsEngine,
  ConstitutionalEngine.IntegrationEngine,
  ConstitutionalEngine.MarketplaceEngine,
  ConstitutionalEngine.TelemetryEngine,
  ConstitutionalEngine.MonitoringEngine,
  ConstitutionalEngine.NotificationEngine,
  ConstitutionalEngine.BillingEngine,
  ConstitutionalEngine.SubscriptionEngine,
  ConstitutionalEngine.PolicyEngine,
  ConstitutionalEngine.SecurityEngine,
];

export const ENGINE_DOMAIN: Record<ConstitutionalEngine, ConstitutionalDomain> = {
  [ConstitutionalEngine.IdentityEngine]: ConstitutionalDomain.Identity,
  [ConstitutionalEngine.OrganizationEngine]: ConstitutionalDomain.Organization,
  [ConstitutionalEngine.MembershipEngine]: ConstitutionalDomain.Organization,
  [ConstitutionalEngine.VerificationEngine]: ConstitutionalDomain.Identity,
  [ConstitutionalEngine.ReasoningEngine]: ConstitutionalDomain.Clinical,
  [ConstitutionalEngine.WorkflowEngine]: ConstitutionalDomain.Clinical,
  [ConstitutionalEngine.PresentationEngine]: ConstitutionalDomain.Presentation,
  [ConstitutionalEngine.WorkspaceEngine]: ConstitutionalDomain.Workspace,
  [ConstitutionalEngine.InteractionEngine]: ConstitutionalDomain.Interaction,
  [ConstitutionalEngine.ExperienceEngine]: ConstitutionalDomain.Experience,
  [ConstitutionalEngine.KnowledgeEngine]: ConstitutionalDomain.Clinical,
  [ConstitutionalEngine.DocumentationEngine]: ConstitutionalDomain.Clinical,
  [ConstitutionalEngine.EducationEngine]: ConstitutionalDomain.Education,
  [ConstitutionalEngine.ResearchEngine]: ConstitutionalDomain.Research,
  [ConstitutionalEngine.AnalyticsEngine]: ConstitutionalDomain.Analytics,
  [ConstitutionalEngine.IntegrationEngine]: ConstitutionalDomain.Integration,
  [ConstitutionalEngine.MarketplaceEngine]: ConstitutionalDomain.Marketplace,
  [ConstitutionalEngine.TelemetryEngine]: ConstitutionalDomain.Monitoring,
  [ConstitutionalEngine.MonitoringEngine]: ConstitutionalDomain.Monitoring,
  [ConstitutionalEngine.NotificationEngine]: ConstitutionalDomain.Communication,
  [ConstitutionalEngine.BillingEngine]: ConstitutionalDomain.Financial,
  [ConstitutionalEngine.SubscriptionEngine]: ConstitutionalDomain.Financial,
  [ConstitutionalEngine.PolicyEngine]: ConstitutionalDomain.Governance,
  [ConstitutionalEngine.SecurityEngine]: ConstitutionalDomain.Security,
};

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME SIX — CONSTITUTIONAL LIFECYCLES
 * Every object declares its lifecycle. No object lacks a lifecycle.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum LifecycleSubject {
  Patient = 'patient',
  User = 'user',
  Organization = 'organization',
  Plugin = 'plugin',
  Encounter = 'encounter',
  Rule = 'rule',
}

export interface LifecycleDefinition {
  subject: LifecycleSubject;
  states: string[];
}

export const CONSTITUTIONAL_LIFECYCLES: Record<LifecycleSubject, LifecycleDefinition> = {
  [LifecycleSubject.Patient]: {
    subject: LifecycleSubject.Patient,
    states: ['registered', 'verified', 'active', 'admitted', 'transferred', 'discharged', 'follow_up', 'archived'],
  },
  [LifecycleSubject.User]: {
    subject: LifecycleSubject.User,
    states: ['invited', 'registered', 'verified', 'active', 'suspended', 'revoked', 'archived'],
  },
  [LifecycleSubject.Organization]: {
    subject: LifecycleSubject.Organization,
    states: ['requested', 'validated', 'activated', 'operational', 'suspended', 'closed'],
  },
  [LifecycleSubject.Plugin]: {
    subject: LifecycleSubject.Plugin,
    states: ['draft', 'validated', 'published', 'installed', 'updated', 'deprecated', 'retired'],
  },
  [LifecycleSubject.Encounter]: {
    subject: LifecycleSubject.Encounter,
    states: ['opened', 'in_progress', 'completed', 'amended', 'closed'],
  },
  [LifecycleSubject.Rule]: {
    subject: LifecycleSubject.Rule,
    states: ['draft', 'published', 'superseded', 'retired'],
  },
};

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME SEVEN — CONSTITUTIONAL RULES
 * Rules are never procedural. Rules are declarative:
 *   Condition → Action → Outcome → Audit → Telemetry
 * Stored as constitutional rule objects. Not if-statements.
 * ──────────────────────────────────────────────────────────────────────────────── */

export type ConstitutionalRuleCategory =
  | 'clinical'
  | 'visibility'
  | 'workflow'
  | 'permission'
  | 'notification'
  | 'education'
  | 'analytics'
  | 'research'
  | 'financial'
  | 'integration'
  | 'security'
  | 'ai'
  | 'marketplace'
  | 'experience';

export interface ConstitutionalRuleObject {
  id: string;
  category: ConstitutionalRuleCategory;
  condition: unknown;
  action: unknown;
  outcome: unknown;
  audit: boolean;
  telemetry: boolean;
  supersedes: string | null;
}

export const CONSTITUTIONAL_RULE_CATEGORIES: ConstitutionalRuleCategory[] = [
  'clinical', 'visibility', 'workflow', 'permission', 'notification', 'education',
  'analytics', 'research', 'financial', 'integration', 'security', 'ai', 'marketplace', 'experience',
];

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME EIGHT — CONSTITUTIONAL SECURITY
 * Security is constitutional. Not optional.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum SecurityPrinciple {
  IdentityFirst = 'identity_first',
  LeastPrivilege = 'least_privilege',
  CompleteAudit = 'complete_audit',
  ZeroTrust = 'zero_trust',
  Encryption = 'encryption',
  VersionedPermissions = 'versioned_permissions',
  Delegation = 'delegation',
  Revocation = 'revocation',
  EmergencyOverride = 'emergency_override',
  BreakGlass = 'break_glass',
}

export const CONSTITUTIONAL_SECURITY_PRINCIPLES: SecurityPrinciple[] = [
  SecurityPrinciple.IdentityFirst,
  SecurityPrinciple.LeastPrivilege,
  SecurityPrinciple.CompleteAudit,
  SecurityPrinciple.ZeroTrust,
  SecurityPrinciple.Encryption,
  SecurityPrinciple.VersionedPermissions,
  SecurityPrinciple.Delegation,
  SecurityPrinciple.Revocation,
  SecurityPrinciple.EmergencyOverride,
  SecurityPrinciple.BreakGlass,
];

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME NINE — CONSTITUTIONAL VERSIONING
 * Nothing changes silently. Every object contains Version, Migration, Compatibility,
 * Deprecation, Replacement, History. WHO guideline changes? Create Version 2.
 * Do not overwrite.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface ConstitutionalVersionMetadata {
  version: number;
  migration: string | null;
  compatibility: string;
  deprecation: string | null;
  replacement: string | null;
  history: string[];
}

export const VERSIONING_RULES = {
  neverOverwrite: true,
  createNewVersionOnChange: true,
  keepImmutableHistory: true,
  everyVersionHasMigration: true,
  deprecatedObjectsNameTheirReplacement: true,
  backwardCompatibilityIsMandatory: true,
} as const;

/* ────────────────────────────────────────────────────────────────────────────────
 * VOLUME TEN — CONSTITUTIONAL EXTENSION FRAMEWORK
 * Future systems plug in here. Everything plugs in. Nothing hacks.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum ExtensionPoint {
  NewDiseases = 'new_diseases',
  NewGuidelines = 'new_guidelines',
  NewCountries = 'new_countries',
  NewHospitals = 'new_hospitals',
  NewAiModels = 'new_ai_models',
  NewDevices = 'new_devices',
  NewLanguages = 'new_languages',
  NewPaymentSystems = 'new_payment_systems',
  NewInsuranceSystems = 'new_insurance_systems',
  NewEducationalModules = 'new_educational_modules',
  NewResearchModules = 'new_research_modules',
  NewGovernments = 'new_governments',
  NewCommunicationPlatforms = 'new_communication_platforms',
  NewRobotics = 'new_robotics',
  NewWearables = 'new_wearables',
  NewFlyingDoctorSystems = 'new_flying_doctor_systems',
  NewHomeMonitoring = 'new_home_monitoring',
  FutureTechnologies = 'future_technologies',
}

export const EXTENSION_POINTS: ExtensionPoint[] = [
  ExtensionPoint.NewDiseases,
  ExtensionPoint.NewGuidelines,
  ExtensionPoint.NewCountries,
  ExtensionPoint.NewHospitals,
  ExtensionPoint.NewAiModels,
  ExtensionPoint.NewDevices,
  ExtensionPoint.NewLanguages,
  ExtensionPoint.NewPaymentSystems,
  ExtensionPoint.NewInsuranceSystems,
  ExtensionPoint.NewEducationalModules,
  ExtensionPoint.NewResearchModules,
  ExtensionPoint.NewGovernments,
  ExtensionPoint.NewCommunicationPlatforms,
  ExtensionPoint.NewRobotics,
  ExtensionPoint.NewWearables,
  ExtensionPoint.NewFlyingDoctorSystems,
  ExtensionPoint.NewHomeMonitoring,
  ExtensionPoint.FutureTechnologies,
];

export interface ExtensionContract {
  id: string;
  name: string;
  extensionPoint: ExtensionPoint;
  conformsTo: string;
  version: string;
  owner: string;
}

/* ────────────────────────────────────────────────────────────────────────────────
 * CONSTITUTIONAL DEPENDENCY PYRAMID
 * The implementation order is now fixed forever. No developer may violate this order.
 * ──────────────────────────────────────────────────────────────────────────────── */

export const DEPENDENCY_PYRAMID: string[] = [
  'Core Constitution',
  'Universal Objects',
  'Relationships',
  'Engines',
  'Rules',
  'Policies',
  'Organizations',
  'Identity',
  'Knowledge',
  'Reasoning',
  'Workflow',
  'Presentation',
  'Workspace',
  'Interaction',
  'Experience',
  'Applications',
  'UI',
  'Themes',
  'Hospital Customizations',
  'Plugins',
  'Future Technologies',
];

/* ────────────────────────────────────────────────────────────────────────────────
 * CONSTITUTIONAL GOLDEN RULES
 * Non-negotiable. Every module must conform.
 * ──────────────────────────────────────────────────────────────────────────────── */

export enum GoldenRule {
  NeverPlaceMedicalReasoningInsideReact = 'never_place_medical_reasoning_inside_react',
  NeverPlaceWorkflowsInsidePages = 'never_place_workflows_inside_pages',
  NeverPlacePermissionsInsideComponents = 'never_place_permissions_inside_components',
  NeverHardcodeProtocols = 'never_hardcode_protocols',
  NeverHardcodeHospitals = 'never_hardcode_hospitals',
  NeverHardcodeCountries = 'never_hardcode_countries',
  NeverHardcodeOrganizations = 'never_hardcode_organizations',
  NeverHardcodeBranding = 'never_hardcode_branding',
  NeverHardcodeNavigation = 'never_hardcode_navigation',
  NeverHardcodeDashboards = 'never_hardcode_dashboards',
  EveryModuleIndependentlyTestable = 'every_module_independently_testable',
  EveryModuleEmitsTelemetry = 'every_module_emits_telemetry',
  EveryDecisionExplainable = 'every_decision_explainable',
  EveryActionReversibleWhereClinicallyAppropriate = 'every_action_reversible_where_clinically_appropriate',
  EveryObjectSurvivesFutureTechnology = 'every_object_survives_future_technology',
}

export const GOLDEN_RULES: GoldenRule[] = [
  GoldenRule.NeverPlaceMedicalReasoningInsideReact,
  GoldenRule.NeverPlaceWorkflowsInsidePages,
  GoldenRule.NeverPlacePermissionsInsideComponents,
  GoldenRule.NeverHardcodeProtocols,
  GoldenRule.NeverHardcodeHospitals,
  GoldenRule.NeverHardcodeCountries,
  GoldenRule.NeverHardcodeOrganizations,
  GoldenRule.NeverHardcodeBranding,
  GoldenRule.NeverHardcodeNavigation,
  GoldenRule.NeverHardcodeDashboards,
  GoldenRule.EveryModuleIndependentlyTestable,
  GoldenRule.EveryModuleEmitsTelemetry,
  GoldenRule.EveryDecisionExplainable,
  GoldenRule.EveryActionReversibleWhereClinicallyAppropriate,
  GoldenRule.EveryObjectSurvivesFutureTechnology,
];

/* ────────────────────────────────────────────────────────────────────────────────
 * CONFORMANCE HELPERS
 * Pure functions every module, engine, and extension may use to prove it conforms.
 * ──────────────────────────────────────────────────────────────────────────────── */

export interface ConformanceReport {
  conforms: boolean;
  violations: string[];
}

export function isConstitutionalEngine(engine: string): boolean {
  return (Object.values(ConstitutionalEngine) as string[]).includes(engine);
}

export function isConstitutionalDomain(domain: string): boolean {
  return (Object.values(ConstitutionalDomain) as string[]).includes(domain);
}

export function assertObjectConstitutional(
  object: UniversalObjectConstitution,
): ConformanceReport {
  const violations: string[] = [];

  if (!object.id) violations.push('object.id is required');
  if (!object.name) violations.push('object.name is required');
  if (!object.owner) violations.push('object.owner is required');
  if (!object.lifecycle) violations.push('object.lifecycle is required');
  if (object.version < 1) violations.push('object.version must be >= 1');
  if (object.telemetry === undefined) violations.push('object.telemetry is required');
  if (!isConstitutionalDomain(object.domain)) violations.push(`unknown domain: ${object.domain}`);
  if (!isConstitutionalEngine(object.owner) && object.owner !== 'system' && !object.owner.startsWith('amx:')) {
    violations.push(`owner must be a constitutional engine, 'system', or an 'amx:' principal (got ${object.owner})`);
  }

  return { conforms: violations.length === 0, violations };
}

export function assertExtensionConforms(extension: ExtensionContract): ConformanceReport {
  const violations: string[] = [];
  if (!extension.id) violations.push('extension.id is required');
  if (!extension.name) violations.push('extension.name is required');
  if (!extension.conformsTo) violations.push('extension.conformsTo is required');
  if (!extension.version) violations.push('extension.version is required');
  if (!(Object.values(ExtensionPoint) as string[]).includes(extension.extensionPoint)) {
    violations.push(`unknown extension point: ${extension.extensionPoint}`);
  }
  return { conforms: violations.length === 0, violations };
}

export function getEngineDomain(engine: ConstitutionalEngine): ConstitutionalDomain {
  return ENGINE_DOMAIN[engine];
}

export function getLifecycleStates(subject: LifecycleSubject): string[] {
  return CONSTITUTIONAL_LIFECYCLES[subject].states;
}

export function isSupportedRuleCategory(category: ConstitutionalRuleCategory): boolean {
  return CONSTITUTIONAL_RULE_CATEGORIES.includes(category);
}

export function isRelationshipCategory(category: RelationshipCategory): boolean {
  return RELATIONSHIP_CATEGORIES.includes(category);
}
