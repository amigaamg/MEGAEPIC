// ═══════════════════════════════════════════════════════════════════
// AMEXAN DOMAIN LAYER
// The canonical source of truth for all healthcare business concepts.
// ═══════════════════════════════════════════════════════════════════

// ─── Universal Meta-Model ────────────────────────────────────────
export type {
  Thing, Entity, ValueObject, Actor, DomainEvent, Activity,
  ClinicalObservation, Artifact, Resource, Location, Knowledge, BusinessRule,
  Identity, Ownership, LifecycleState, VersionInfo,
  SecurityClassification, AuditAction, AuditEntry, AccessPolicy,
  AiPermission,
  EntitySpecification, EntityRelationshipSpec, EntityLifecycleSpec,
  LifecycleTransition, BusinessRuleSpec,
  AttributeSpec, ValidationSpec, AuditRequirement, PrivacyRequirement, InteropMapping,
} from './meta';

export type { EventCategory } from './meta';

// ─── CES — Entity Catalog ────────────────────────────────────────
export {
  ENTITY_CATALOG,
  defineEntity,
  register,
  PATIENT_SPEC,
  PROVIDER_SPEC,
  ENCOUNTER_SPEC,
  DIAGNOSIS_SPEC,
  MEDICATION_ORDER_SPEC,
  ORGANIZATION_SPEC,
  OBSERVATION_SPEC,
  PROCEDURE_SPEC,
  CARE_PLAN_SPEC,
  APPOINTMENT_SPEC,
  CONSENT_SPEC,
  CLINICAL_DOCUMENT_SPEC,
  INVESTIGATION_SPEC,
  ALLERGY_SPEC,
  AI_RECOMMENDATION_SPEC,
  FACILITY_SPEC,
  SPECIMEN_SPEC,
} from './ces';

// ─── CRS — Relationship Catalog ──────────────────────────────────
export {
  RELATIONSHIP_CATALOG,
  defineRelationship,
  PATIENT_HAS_ENCOUNTER,
  PATIENT_HAS_DIAGNOSIS,
  PATIENT_HAS_ALLERGY,
  PATIENT_HAS_MEDICATION_ORDER,
  ENCOUNTER_CONTAINS_OBSERVATION,
  ENCOUNTER_INCLUDES_PROCEDURE,
  ENCOUNTER_GENERATES_DOCUMENT,
  DIAGNOSIS_SUPPORTED_BY_OBSERVATION,
  DIAGNOSIS_DRIVES_CARE_PLAN,
  PROVIDER_PERFORMS_ENCOUNTER,
  PROVIDER_EMPLOYED_BY_ORGANIZATION,
  PROVIDER_PRESCRIBES_MEDICATION,
  ORGANIZATION_OWNS_FACILITY,
  MEDICATION_ORDER_AUTHORIZES_ADMIN,
  ALLERGY_CONTRAINDICATES_MEDICATION,
} from './crs';

export type {
  RelationshipSpec, RelationshipCardinality, RelationshipDirection,
  RelationshipType, RelationshipLifecycleState,
} from './crs';

// ─── CEvS — Event Catalog ────────────────────────────────────────
export {
  EVENT_CATALOG,
  defineEvent,
  PATIENT_REGISTERED,
  PATIENT_UPDATED,
  PATIENT_MERGED,
  ENCOUNTER_STARTED,
  ENCOUNTER_COMPLETED,
  DIAGNOSIS_CONFIRMED,
  HISTORY_RECORDED,
  PROCEDURE_COMPLETED,
  MEDICATION_PRESCRIBED,
  MEDICATION_ADMINISTERED,
  INVESTIGATION_ORDERED,
  RESULT_VERIFIED,
  CRITICAL_RESULT,
  APPOINTMENT_SCHEDULED,
  PATIENT_DISCHARGED,
  CONSENT_GRANTED,
  CONSENT_WITHDRAWN,
  AI_RECOMMENDATION_GENERATED,
  AI_RECOMMENDATION_ACCEPTED,
  getEventSequence,
} from './cevs';

export type {
  DomainEventSpec, EventLifecycleState, EventPriority,
} from './cevs';

// ─── CWS — Workflow Catalog ──────────────────────────────────────
export {
  WORKFLOW_CATALOG,
  defineWorkflow,
  OUTPATIENT_CONSULTATION,
  EMERGENCY_RESUSCITATION,
  MEDICATION_PRESCRIBING,
} from './cws';

export type {
  WorkflowSpec, WorkflowActivity, WorkflowDecision,
  ExceptionHandler, WorkflowCategory, WorkflowLifecycleState,
  ActivityExecution, DecisionType,
} from './cws';

// ─── BCM — Engine Map ────────────────────────────────────────────
export {
  ENGINE_CATALOG,
  defineEngine,
  ENGINE_DEPENDENCY_GRAPH,
  IDENTITY_ENGINE,
  ORGANIZATION_ENGINE,
  PATIENT_ENGINE,
  ENCOUNTER_ENGINE,
  CLINICAL_DOCUMENTATION_ENGINE,
  OBSERVATION_ENGINE,
  DIAGNOSIS_ENGINE,
  ORDERS_ENGINE,
  INVESTIGATION_ENGINE,
  MEDICATION_ENGINE,
  PROCEDURE_ENGINE,
  CARE_PLANNING_ENGINE,
  SCHEDULING_ENGINE,
  AI_ENGINE,
  WORKFLOW_ENGINE,
  NOTIFICATION_ENGINE,
  AUDIT_ENGINE,
  SEARCH_ENGINE,
  SYNCHRONIZATION_ENGINE,
  INTEGRATION_ENGINE,
} from './bcm';

export type {
  EngineSpec, EngineCategory, EngineDependency,
} from './bcm';
