// ═══════════════════════════════════════════════════════════════════
// AMEXAN ENCOUNTER ENGINE — CES Types
// Extends the Universal Domain Model with encounter-specific types.
// Domain source of truth: lib/amexan/domain/
// ═══════════════════════════════════════════════════════════════════

// ─── Re-export Universal Domain Types ────────────────────────────
export type {
  Identity, Ownership, LifecycleState, VersionInfo,
  SecurityClassification, AuditAction, AuditEntry, AccessPolicy, AiPermission,
  EntitySpecification, EntityRelationshipSpec, EntityLifecycleSpec,
  BusinessRuleSpec, AttributeSpec, ValidationSpec,
  AuditRequirement, PrivacyRequirement, InteropMapping,
} from '../../domain/meta';

export type { EventCategory } from '../../domain/meta';

// Domain entity specs (canonical definitions)
export {
  ENTITY_CATALOG, defineEntity, register,
  PATIENT_SPEC, PROVIDER_SPEC, ENCOUNTER_SPEC, DIAGNOSIS_SPEC,
  MEDICATION_ORDER_SPEC, ORGANIZATION_SPEC, OBSERVATION_SPEC,
  PROCEDURE_SPEC, CARE_PLAN_SPEC, APPOINTMENT_SPEC, CONSENT_SPEC,
  CLINICAL_DOCUMENT_SPEC, INVESTIGATION_SPEC, ALLERGY_SPEC,
  AI_RECOMMENDATION_SPEC, FACILITY_SPEC, SPECIMEN_SPEC,
} from '../../domain/ces';

// Relationship catalog
export {
  RELATIONSHIP_CATALOG, defineRelationship,
  PATIENT_HAS_ENCOUNTER, PATIENT_HAS_DIAGNOSIS, PATIENT_HAS_ALLERGY,
  ENCOUNTER_CONTAINS_OBSERVATION, DIAGNOSIS_SUPPORTED_BY_OBSERVATION,
  PROVIDER_PERFORMS_ENCOUNTER, MEDICATION_ORDER_AUTHORIZES_ADMIN,
} from '../../domain/crs';

export type {
  RelationshipSpec, RelationshipCardinality, RelationshipDirection,
  RelationshipType, RelationshipLifecycleState,
} from '../../domain/crs';

// Event catalog
export {
  EVENT_CATALOG, defineEvent, getEventSequence,
  PATIENT_REGISTERED, ENCOUNTER_STARTED, ENCOUNTER_COMPLETED,
  DIAGNOSIS_CONFIRMED, MEDICATION_PRESCRIBED, RESULT_VERIFIED,
} from '../../domain/cevs';

export type { DomainEventSpec, EventLifecycleState, EventPriority } from '../../domain/cevs';

// Workflow catalog
export {
  WORKFLOW_CATALOG, defineWorkflow,
  OUTPATIENT_CONSULTATION, EMERGENCY_RESUSCITATION, MEDICATION_PRESCRIBING,
} from '../../domain/cws';

export type {
  WorkflowSpec, WorkflowActivity, WorkflowDecision,
  ExceptionHandler, WorkflowCategory, WorkflowLifecycleState,
} from '../../domain/cws';

// Engine map
export {
  ENGINE_CATALOG, defineEngine, ENGINE_DEPENDENCY_GRAPH,
  IDENTITY_ENGINE, PATIENT_ENGINE, ENCOUNTER_ENGINE,
  CLINICAL_DOCUMENTATION_ENGINE, DIAGNOSIS_ENGINE, MEDICATION_ENGINE,
  AI_ENGINE, WORKFLOW_ENGINE, AUDIT_ENGINE,
} from '../../domain/bcm';

export type { EngineSpec, EngineCategory, EngineDependency } from '../../domain/bcm';

// ─── ENCOUNTER-ENGINE-SPECIFIC TYPES ─────────────────────────────
// These are implementation types for the adaptive question engine
// and are NOT part of the universal domain model.

export type Confidence = 'patient_reported' | 'caregiver_reported' | 'clinician_observed' | 'imported' | 'inferred';
export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';
export type AgeGroup = 'neonate' | 'infant' | 'child' | 'adolescent' | 'adult' | 'elderly';
export type Sex = 'male' | 'female';
export type EncounterPhase =
  | 'registration' | 'patient_context' | 'chief_complaint' | 'hpi'
  | 'past_medical' | 'past_surgical' | 'drug_history' | 'allergies'
  | 'family_history' | 'social_history' | 'review_of_systems'
  | 'functional_assessment' | 'general_exam' | 'systemic_exam' | 'examination'
  | 'clinical_reasoning' | 'differentials' | 'investigations'
  | 'diagnosis' | 'management' | 'disposition'
  | 'discharge_admission_referral' | 'follow_up' | 'analytics';
export type ModuleType =
  | 'neonatal' | 'infant' | 'pediatric' | 'adolescent' | 'adult' | 'geriatric'
  | 'female' | 'male' | 'pregnancy' | 'psychiatry' | 'surgery' | 'emergency'
  | 'cardiology' | 'respiratory' | 'neurology' | 'gi' | 'renal' | 'endo';

export interface TimestampedFact {
  id: string;
  value: string | number | boolean | string[] | null;
  confidence: Confidence;
  timestamp: number;
  enteredBy?: string;
  linkedTo?: string;
}

export interface CESBase {
  id: string;
  label: string;
  description?: string;
}

export interface ClinicalConcept extends CESBase {
  domain: string;
  snomed?: string;
  icd10?: string;
  loinc?: string;
}

export interface ClinicalFact {
  conceptId: string;
  value: TimestampedFact;
  phase: EncounterPhase;
  note?: string;
}

export interface Biodata {
  patientName: string;
  hospitalNumber: string;
  age: number;
  ageGroup: AgeGroup;
  dateOfBirth: string;
  sex: Sex;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  education?: string;
  religion?: string;
  residence?: string;
  nationality?: string;
  nextOfKin?: string;
  contact?: string;
  informant?: string;
  informantRelation?: string;
  reliability?: string;
  dateOfAdmission?: string;
  department: string;
  hospital: string;
  encounterType: string;
  encounterNumber?: string;
  date: string;
  time: string;
  clinician: string;
  referralSource?: string;
  modeOfArrival?: string;
  triageCategory?: string;
  insurance?: string;
  language?: string;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface ChiefComplaint {
  id: string;
  complaint: string;
  duration: string;
  durationSeconds: number;
  onset: string;
  primary: boolean;
  patientWords: string;
  bodySystem?: string;
}

export interface BorderedFact {
  id: string;
  label: string;
  value: string | number | boolean | string[];
  present: boolean;
  confidence: Confidence;
  timestamp: number;
  note?: string;
}

export interface ClinicalFinding {
  id: string;
  concept: ClinicalConcept;
  present: boolean | null;
  value?: string | number;
  qualifier?: string;
  laterality?: 'left' | 'right' | 'bilateral';
  severity?: Severity;
  confidence: Confidence;
  timestamp: number;
  note?: string;
}

export interface ExaminationSection {
  id: string;
  label: string;
  findings: ClinicalFinding[];
}

export interface Differential {
  diseaseId: string;
  diseaseName: string;
  probability: number;
  rank: number;
  supporting: string[];
  against: string[];
  missing: string[];
  redFlag: boolean;
}

export type InvestigationCategory = 'diagnostic' | 'rule_out' | 'supportive_baseline';
export type InvestigationMethod = 'blood_work' | 'imaging' | 'microbiology' | 'pathology' | 'bedside';
export type OrderStatus = 'suggested' | 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';

export interface LabOrder {
  id: string;
  testName: string;
  method: 'blood_work' | 'microbiology' | 'pathology' | 'bedside';
  category: InvestigationCategory;
  reason: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: OrderStatus;
  orderedAt?: number;
  collectedAt?: number;
  completedAt?: number;
  result?: string;
  referenceRange?: string;
  flag?: 'normal' | 'abnormal' | 'critical' | 'not_assessed';
  interpretedBy?: string;
  departmentId?: string;
}

export interface ImagingOrder {
  id: string;
  studyName: string;
  method: 'imaging';
  category: InvestigationCategory;
  reason: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: OrderStatus;
  modality: 'X-ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Echocardiogram' | 'ECG' | 'Other';
  bodyRegion: string;
  orderedAt?: number;
  completedAt?: number;
  result?: string;
  findings?: string;
  impression?: string;
  flag?: 'normal' | 'abnormal' | 'critical' | 'not_assessed';
  interpretedBy?: string;
  departmentId?: string;
}

export type PrescriptionStatus = 'suggested' | 'prescribed' | 'sent_to_pharmacy' | 'confirmed' | 'alternative_offered' | 'dispensed' | 'cancelled';

export interface PrescriptionOrder {
  id: string;
  drugName: string;
  genericName: string;
  dose: string;
  doseUnit: string;
  route: string;
  frequency: string;
  duration: string;
  durationUnit: string;
  category: 'definitive' | 'supportive' | 'preventive';
  indication: string;
  reason: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: PrescriptionStatus;
  prescribedAt?: number;
  prescribedBy?: string;
  prescribedByName?: string;
  allergies: string[];
  contraindications: string[];
  interactions: string[];
  warnings: string[];
  patientInstructions: string;
  alternativeMeds: string[];
  pharmacyNote?: string;
  requiresRenalAdjustment: boolean;
  requiresHepaticAdjustment: boolean;
  pregnancyRisk: 'safe' | 'caution' | 'contraindicated' | 'not_assessed';
  dispensedAt?: number;
  dispensedBy?: string;
}

export interface Investigation {
  id: string;
  name: string;
  category: 'bedside' | 'lab' | 'imaging' | 'microbiology' | 'pathology';
  purpose: string;
  expected: string;
  rulesIn?: string[];
  rulesOut?: string[];
  priority: 'routine' | 'urgent' | 'stat';
  status: 'suggested' | 'ordered' | 'pending' | 'resulted';
  result?: string;
  interpretation?: string;
  flag?: 'normal' | 'abnormal' | 'critical';
}

export interface ManagementItem {
  id: string;
  category: 'emergency' | 'definitive' | 'supportive' | 'monitoring' | 'referral';
  action: string;
  details?: string;
  status: 'pending' | 'done' | 'declined';
}

export interface ClinicalObjective {
  id: string;
  label: string;
  phase: EncounterPhase;
  required: number;
  completed: number;
  dependsOn?: string[];
}

export interface TimelineEntry {
  id: string;
  date: string;
  relative: string;
  events: string[];
  timestamp: number;
}

export interface QuestionOption {
  label: string;
  value: string;
  icon?: string;
}

export interface CqaeRule {
  /** If set, card only visible when patient belongs to one of these age groups */
  ageGroups?: AgeGroup[];
  /** If set, card only visible for this sex */
  sex?: 'male' | 'female';
  /** If set, card visibility depends on pregnancy status */
  pregnant?: boolean;
  /** If set, card visibility depends on module being active/inactive */
  module?: { module: ModuleType; active: boolean };
}

export interface QuestionCard {
  id: string;
  phase: EncounterPhase;
  group?: string;
  groupLabel?: string;
  question: string;
  type: 'single' | 'multiple' | 'chips' | 'scale' | 'text' | 'date' | 'boolean' | 'group';
  options?: QuestionOption[];
  chips?: string[];
  multiple?: boolean;
  dynamicExpansions?: Record<string, QuestionCard[]>;
  required: boolean;
  dependsOn?: { questionId: string; value: string | boolean };
  /** @deprecated Use cqae.module instead */
  contextCondition?: { module: ModuleType; active: boolean };
  /** CQAE activation rules — card is visible only when ALL rules pass */
  cqae?: CqaeRule;
  factKey?: string;
}

export interface QuestionGroupCondition {
  module?: ModuleType;
  complaint?: string;
  factKey?: string;
  value?: any;
  /** If set, this group is visible ONLY to these age groups. If absent, visible to all. */
  ageGroups?: AgeGroup[];
}

export interface QuestionGroup {
  id: string;
  label: string;
  phase: EncounterPhase;
  cards: QuestionCard[];
  condition?: QuestionGroupCondition;
  /** Maps this group to a constitutional section type (e.g. 'birth_history', 'development', 'immunization', 'nutrition') */
  constitutionalSectionId?: string;
}

export interface Answer {
  questionId: string;
  value: string | number | boolean | string[];
  confidence: Confidence;
  timestamp: number;
  note?: string;
}

export interface ModuleDefinition {
  id: ModuleType;
  label: string;
  icon: string;
  condition: (biodata: Biodata, complaints: ChiefComplaint[], facts: Record<string, ClinicalFact>) => boolean;
  phases: EncounterPhase[];
  questionGroups: string[];
}

// ─── ENCOUNTER STATE ─────────────────────────────────────────────

export interface EncounterState {
  id: string;
  biodata: Biodata | null;
  chiefComplaints: ChiefComplaint[];
  facts: Record<string, ClinicalFact>;
  examination: ExaminationSection[];
  differentials: Differential[];
  investigations: Investigation[];
  management: ManagementItem[];
  activeModules: ModuleType[];
  currentPhase: EncounterPhase;
  phases: Record<EncounterPhase, { status: 'locked' | 'active' | 'complete'; completedAt?: number }>;
  objectives: ClinicalObjective[];
  timeline: TimelineEntry[];
  hpiNarrative: string;
  problemList: string[];
  redFlags: string[];
  missingInfo: string[];
  clinicalNotes: Record<string, string>;
  scores: Record<string, { value: number; max: number; interpretation: string }>;
}
