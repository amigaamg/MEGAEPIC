// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Rule Language (CRL) — Core Types
// ═══════════════════════════════════════════════════════════════════════════════
// Every rule follows this schema. No exceptions.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Rule Identity ──────────────────────────────────────────────────────────

export type RuleCategory =
  | 'PAT'    // Patient identity rules
  | 'ENC'    // Encounter rules
  | 'CC'     // Chief complaint rules
  | 'HPI'    // History rules
  | 'PHX'    // Past medical history
  | 'DHX'    // Drug history
  | 'AHX'    // Allergy history
  | 'FHX'    // Family history
  | 'SHX'    // Social history
  | 'ROS'    // Review of systems
  | 'EXM'    // Examination rules
  | 'INV'    // Investigation rules
  | 'DX'     // Diagnostic rules
  | 'MGT'    // Management rules
  | 'DOC'    // Documentation rules
  | 'WF'     // Workflow rules
  | 'SAF'    // Safety rules
  | 'BNR'    // Bayesian/Reasoning rules
  | 'SYS'    // System rules
  | 'ACT'    // Context activation rules
  | 'SPE'    // Specialty rules
  ;

export interface RuleIdentity {
  id: string;           // e.g. "PAT-0001", "HPI-0014"
  category: RuleCategory;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  priority: number;     // Lower = higher priority (0 = highest)
  tags: string[];
  author?: string;
  created: number;
  updated: number;
  deprecated?: boolean;
  supersededBy?: string;
}

// ── Rule Conditions ─────────────────────────────────────────────────────────

export type ConditionOperator =
  | 'eq'           // equals
  | 'neq'          // not equals
  | 'gt'           // greater than
  | 'gte'          // greater than or equal
  | 'lt'           // less than
  | 'lte'          // less than or equal
  | 'in'           // in array
  | 'not_in'       // not in array
  | 'contains'     // string contains
  | 'starts_with'  // string starts with
  | 'exists'       // field exists and not null
  | 'not_exists'   // field is null or undefined
  | 'between'      // between two values
  | 'matches'      // regex match
  ;

export interface Condition {
  field: string;           // Path to the value, e.g. "patient.age" or "encounter.department"
  operator: ConditionOperator;
  value: unknown;          // Single value or array for 'in'/'not_in'/'between'
  valueType?: 'number' | 'string' | 'boolean' | 'date';
}

export interface ConditionGroup {
  logic: 'AND' | 'OR' | 'NOT';
  conditions: (Condition | ConditionGroup)[];
}

// ── Rule Actions ────────────────────────────────────────────────────────────

export type ActionType =
  // UI Actions
  | 'show_section'
  | 'hide_section'
  | 'require_field'
  | 'set_default'
  | 'disable_field'
  | 'enable_field'
  | 'set_field_options'
  | 'focus_field'

  // Workflow Actions
  | 'lock_step'
  | 'unlock_step'
  | 'skip_step'
  | 'require_step'
  | 'insert_step'
  | 'remove_step'

  // Clinical Actions
  | 'activate_pathway'
  | 'deactivate_pathway'
  | 'activate_symptom_schema'
  | 'activate_ros_system'
  | 'recommend_question'
  | 'recommend_exam'
  | 'recommend_investigation'
  | 'calculate_score'
  | 'update_prior_probability'
  | 'trigger_alert'
  | 'raise_warning'

  // Data Actions
  | 'derive_field'
  | 'normalize_value'
  | 'copy_from_previous'
  | 'merge_with_existing'

  // Documentation Actions
  | 'generate_summary'
  | 'insert_into_documentation'
  | 'require_documentation'
  ;

export interface RuleAction {
  type: ActionType;
  target: string;          // What the action applies to (section ID, field path, etc.)
  value?: unknown;
  params?: Record<string, unknown>;
  priority?: number;
}

// ── Complete Rule Definition ───────────────────────────────────────────────

export interface ClinicalRule {
  identity: RuleIdentity;
  conditions: ConditionGroup;
  actions: RuleAction[];
  exceptions?: ConditionGroup[];
  metadata?: Record<string, unknown>;
}

// ── Rule Evaluation ────────────────────────────────────────────────────────

export interface RuleContext {
  patient: PatientContext;
  encounter: EncounterContext;
  user: UserContext;
  environment: EnvironmentContext;
}

export interface PatientContext {
  id: string;
  age: number;
  ageUnit: 'days' | 'months' | 'years';
  sex: 'male' | 'female' | 'unknown';
  pregnant: boolean | null;
  pregnantWeeks?: number;
  postpartum: boolean;
  ageCategory: AgeCategory;
  knownConditions: string[];
  knownAllergies: string[];
  knownMedications: string[];
  bmi?: number;
  occupation?: string;
  residence?: string;
  religion?: string;
}

export type AgeCategory =
  | 'neonate'      // 0-27 days
  | 'infant'       // 28d-12mo
  | 'child'        // 1-9yr
  | 'adolescent'   // 10-19yr
  | 'adult'        // 20-64yr
  | 'older_adult'  // 65+
  ;

export interface EncounterContext {
  id: string;
  type: EncounterType;
  department: string;
  facility: string;
  priority: EncounterPriority;
  status: EncounterStatus;
  complaints: ComplaintContext[];
  currentStep: string;
  completedSteps: string[];
  vitals?: Record<string, unknown>;
  diagnoses?: string[];
  hasDiabeticFoot?: boolean;
  hasAbdominalPain?: boolean;
  isTrauma?: boolean;
  isPostpartum?: boolean;
  postpartumDays?: number;
  gestationWeeks?: number;
}

export type EncounterType =
  | 'emergency'
  | 'outpatient'
  | 'ward_review'
  | 'icu'
  | 'theatre'
  | 'antenatal'
  | 'postnatal'
  | 'well_baby'
  | 'mental_health'
  | 'telemedicine'
  | 'follow_up'
  ;

export type EncounterPriority = 'immediate' | 'emergency' | 'urgent' | 'semi_urgent' | 'routine';

export type EncounterStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface ComplaintContext {
  id: string;
  patientStatement: string;
  normalizedConcept: string;
  bodySystem: string;
  onset: string;
  duration: string;
  severity: number;
  active: boolean;
}

export interface UserContext {
  id: string;
  role: ClinicianRole;
  specialty: string;
  department: string;
  facilityId: string;
}

export type ClinicianRole =
  | 'doctor'
  | 'consultant'
  | 'medical_officer'
  | 'nurse'
  | 'pharmacist'
  | 'lab_technologist'
  | 'medical_student'
  | 'therapist'
  | 'admin'
  ;

export interface EnvironmentContext {
  facilityType: string;
  country: string;
  region: string;
  hasICU: boolean;
  hasLab: boolean;
  hasRadiology: boolean;
  hasPharmacy: boolean;
  timeOfDay: number;
}

// ── Rule Evaluation Result ─────────────────────────────────────────────────

export interface RuleEvaluation {
  rule: RuleIdentity;
  matched: boolean;
  exceptionTriggered: boolean;
  actions: RuleAction[];
  executionTime: number;
}

export interface RuleEngineResult {
  evaluations: RuleEvaluation[];
  aggregatedActions: Map<string, RuleAction[]>;
  totalRules: number;
  matchedRules: number;
  executionTime: number;
  warnings: string[];
}

// ── Rule Registry ──────────────────────────────────────────────────────────

export interface RuleRegistry {
  rules: Map<string, ClinicalRule>;
  getRule(id: string): ClinicalRule | undefined;
  getRulesByCategory(category: RuleCategory): ClinicalRule[];
  getRulesByTag(tag: string): ClinicalRule[];
  addRule(rule: ClinicalRule): void;
  removeRule(id: string): void;
  enableRule(id: string): void;
  disableRule(id: string): void;
}

// ── Context Activation (what the rules produce) ────────────────────────────

export interface ActivatedContext {
  visibleSections: Set<string>;
  requiredFields: Record<string, string[]>;
  activePathways: string[];
  activeSymptomSchemas: string[];
  activeRosSystems: string[];
  recommendedQuestions: string[];
  recommendedExams: string[];
  recommendedInvestigations: string[];
  alerts: string[];
  warnings: string[];
  derivedValues: Record<string, unknown>;
  lockedSteps: string[];
  skippedSteps: string[];
  insertedSteps: string[];
}

// ── Specialty Rules Plugin ─────────────────────────────────────────────────

export interface SpecialtyPlugin {
  id: string;
  name: string;
  description: string;
  rules: ClinicalRule[];
  activatesOn: ConditionGroup[];
  priority: number;
}
