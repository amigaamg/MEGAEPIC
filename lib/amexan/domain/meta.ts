// ═══════════════════════════════════════════════════════════════════
// AMEXAN UNIVERSAL META-MODEL
// Document: ACDM-001 Chapter 5 — The Universal Meta-Model
// Every entity in AMEXAN inherits from this foundation.
// ═══════════════════════════════════════════════════════════════════

// ─── Core Identity ───────────────────────────────────────────────
export interface Identity {
  id: string;
  displayName: string;
  businessIdentifiers: Record<string, string>;
}

export interface Ownership {
  createdBy: string;
  createdAt: number;
  updatedBy?: string;
  updatedAt?: number;
  owningEngine: string;
}

export interface LifecycleState<TState extends string = string> {
  state: TState;
  enteredAt: number;
  enteredBy: string;
  reason?: string;
}

export interface VersionInfo {
  version: number;
  previousVersion?: number;
  changeSummary?: string;
}

// ─── Security & Governance ───────────────────────────────────────
export type SecurityClassification = 'public' | 'internal' | 'confidential' | 'restricted' | 'highly_restricted';
export type AuditAction = 'create' | 'read' | 'update' | 'archive' | 'restore' | 'delete' | 'export' | 'merge';

export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  actor: string;
  timestamp: number;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  correlationId?: string;
  reason?: string;
}

export interface AccessPolicy {
  createRoles: string[];
  readRoles: string[];
  updateRoles: string[];
  archiveRoles: string[];
  deleteRoles: string[];
}

// ─── Universal Meta-Types ────────────────────────────────────────

/**
 * Thing is the root of everything in AMEXAN.
 * Every concept — Patient, Encounter, Diagnosis, Bed, Invoice —
 * is a Thing.
 */
export interface Thing {
  kind: 'entity' | 'value_object' | 'event' | 'activity' | 'observation'
    | 'artifact' | 'resource' | 'location' | 'knowledge' | 'rule' | 'relationship';
}

/**
 * An Entity has a stable identity that persists over time.
 * Characteristics: unique identity, lifecycle, relationships, audit trail.
 */
export interface Entity extends Thing {
  kind: 'entity';
  identity: Identity;
  ownership: Ownership;
  lifecycle: LifecycleState[];
  version: VersionInfo;
  securityClassification: SecurityClassification;
  isActive: boolean;
  tags: Record<string, string>;
}

/**
 * A Value Object describes information but has no independent identity.
 * Two Value Objects with identical values are interchangeable.
 * They are immutable once recorded.
 */
export interface ValueObject extends Thing {
  kind: 'value_object';
}

/**
 * An Actor performs actions. May be human or non-human.
 */
export interface Actor extends Thing {
  kind: 'entity';
  actorType: 'human' | 'system' | 'ai' | 'device' | 'integration';
}

/**
 * An Event is an immutable fact that something has happened.
 */
export interface DomainEvent extends Thing {
  kind: 'event';
  eventName: string;
  eventCode: string;
  category: EventCategory;
  sourceEntityId: string;
  sourceEntityType: string;
  initiatingActor: string;
  timestamp: number;
  payload: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
}

export type EventCategory =
  | 'identity' | 'clinical' | 'operational' | 'investigation'
  | 'medication' | 'financial' | 'governance' | 'integration' | 'ai';

/**
 * An Activity is work carried out to achieve a purpose.
 */
export interface Activity extends Thing {
  kind: 'activity';
  name: string;
  description: string;
  responsibleRole: string;
  inputs: string[];
  outputs: string[];
  expectedDuration?: number;
  generatedEvents: string[];
}

/**
 * An Observation is information obtained about a Subject of Care.
 */
export interface ClinicalObservation extends Thing {
  kind: 'observation';
  concept: string;
  value: unknown;
  interpretation?: string;
  referenceRange?: string;
  flag?: 'normal' | 'abnormal' | 'critical' | 'unknown';
  method?: string;
  bodySite?: string;
  laterality?: 'left' | 'right' | 'bilateral';
}

/**
 * An Artifact is a digital or physical object associated with care.
 */
export interface Artifact extends Thing {
  kind: 'artifact';
  artifactType: 'document' | 'image' | 'report' | 'form' | 'recording' | 'other';
  mimeType: string;
  storageUrl: string;
  size: number;
  hash?: string;
}

/**
 * A Resource is something that can be allocated, reserved, or consumed.
 */
export interface Resource extends Thing {
  kind: 'resource';
  resourceType: string;
  status: 'available' | 'allocated' | 'consumed' | 'maintenance' | 'retired';
  quantity?: number;
}

/**
 * A Location is a physical or logical place.
 */
export interface Location extends Thing {
  kind: 'location';
  locationType: 'country' | 'region' | 'facility' | 'building' | 'ward' | 'room' | 'bed' | 'virtual';
  parentLocationId?: string;
  physicalAddress?: string;
  gps?: { lat: number; lng: number };
}

/**
 * A Knowledge concept represents clinical knowledge.
 */
export interface Knowledge extends Thing {
  kind: 'knowledge';
  knowledgeType: 'guideline' | 'protocol' | 'scoring_system' | 'drug_monograph'
    | 'pathway' | 'reference_value' | 'terminology' | 'literature';
  version: string;
  source: string;
  evidenceLevel?: string;
}

/**
 * A Business Rule enforces domain constraints.
 */
export interface BusinessRule extends Thing {
  kind: 'rule';
  ruleId: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  rationale: string;
  enforcementPoint: 'domain' | 'api' | 'ui' | 'database';
  condition: string;
}

/**
 * AI interaction permissions per entity.
 */
export interface AiPermission {
  canRead: boolean;
  canSummarize: boolean;
  canClassify: boolean;
  canSuggestModifications: boolean;
  canGenerateInstances: boolean;
  requiresHumanReview: boolean;
}

// ─── Generic Entity Builder ──────────────────────────────────────
// The CES specifies every entity with these sections.
export interface EntitySpecification {
  canonicalName: string;
  canonicalCode: string;
  entityCategory: Thing['kind'];
  domain: string;
  owningEngine: string;
  definition: string;
  purpose: string;
  responsibilities: string[];
  nonResponsibilities: string[];
  stakeholders: string[];
  businessProcesses: string[];
  clinicalSignificance: string;
  relationships: EntityRelationshipSpec[];
  lifecycle: EntityLifecycleSpec;
  businessRules: BusinessRuleSpec[];
  domainEvents: DomainEventSpec[];
  attributes: AttributeSpec[];
  validation: ValidationSpec;
  securityClassification: SecurityClassification;
  accessPolicy: AccessPolicy;
  auditRequirements: AuditRequirement[];
  privacyRequirements: PrivacyRequirement[];
  aiPermission: AiPermission;
  interoperabilityMappings: InteropMapping[];
  extensibilityNotes: string;
  version: string;
}

export interface EntityRelationshipSpec {
  relatedEntity: string;
  relationshipType: string;
  cardinality: string;
  description: string;
  constraints: string[];
}

export interface EntityLifecycleSpec {
  states: string[];
  transitions: LifecycleTransition[];
}

export interface LifecycleTransition {
  from: string;
  to: string;
  trigger: string;
  actor: string;
  validationRules: string[];
}

export interface BusinessRuleSpec {
  ruleId: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  rationale: string;
}

export interface DomainEventSpec {
  eventName: string;
  trigger: string;
  initiator: string;
  payloadSummary: string;
  consumers: string[];
}

export interface AttributeSpec {
  name: string;
  category: 'identity' | 'core' | 'optional' | 'derived' | 'metadata';
  type: string;
  mandatory: boolean;
  description: string;
}

export interface ValidationSpec {
  mandatory: string[];
  optional: string[];
  unique: string[];
  ranges: Record<string, { min?: number; max?: number }>;
  crossField: string[];
  crossEntity: string[];
}

export interface AuditRequirement {
  action: string;
  requiredFields: string[];
  retentionYears: number;
  immutable: boolean;
}

export interface PrivacyRequirement {
  dataType: 'pii' | 'phi' | 'financial' | 'none';
  deIdentificationRequired: boolean;
  maskingRule?: string;
  consentDependency?: string;
}

export interface InteropMapping {
  standard: string;
  resourceType: string;
  mappingNotes: string;
}
