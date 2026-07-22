// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal Symptom Node — Canonical Type Definitions
// Every symptom in the system follows exactly this skeleton.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── IDENTITY ────────────────────────────────────────────────────────────────

export interface SymptomIdentity {
  id: string                    // SX000001, SX000002, …
  canonicalName: string
  synonyms: string[]            // medical synonyms
  layTerms: string[]            // patient-friendly terms
  translations: Record<string, string>  // lang → term (e.g. 'sw': 'Homa')
  snomed?: string
  icd10?: string
  umls?: string
  bodySystem: string
  primarySpecialty: string
  emergencyWeight: 1 | 2 | 3 | 4 | 5   // 5 = most emergent
}

// ─── METADATA ────────────────────────────────────────────────────────────────

export interface SymptomMetadata {
  version: string               // semantic version of this node
  author: string
  reviewedBy?: string
  evidenceLevel: 'a' | 'b' | 'c' | 'consensus' | 'expert'
  lastUpdated: string           // ISO date
  source: string                // e.g. 'Hutchison Clinical Methods 25e'
}

// ─── ACTIVATION RULES ────────────────────────────────────────────────────────

export interface ActivationRules {
  chiefComplaint: boolean
  hpiMention: boolean
  ros: boolean
  referralLetter: boolean
  voiceTranscription: boolean
  keywords: string[]            // triggers auto-activation
}

// ─── TIMELINE RULES ──────────────────────────────────────────────────────────

export type TimelineCategory = 'acute' | 'subacute' | 'chronic' | 'congenital' | 'recurrent' | 'relapsing' | 'unknown'

export interface TimelineRules {
  allowed: TimelineCategory[]
  defaultCategory?: TimelineCategory
}

// ─── OBJECTIVE GROUP ─────────────────────────────────────────────────────────

export interface ClinicalObjectiveGroup {
  id: string
  label: string
  description: string
  order: number                 // display order within the symptom
  required: boolean
  questionIds: string[]         // references into the question library
}

// ─── CONTEXT CONDITION ───────────────────────────────────────────────────────

export interface ContextCondition {
  ageMin?: number
  ageMax?: number
  sex?: 'male' | 'female'
  pregnant?: boolean
  departments?: string[]
  module?: string               // neonatal, pediatric, adult, etc.
}

// ─── QUESTION ────────────────────────────────────────────────────────────────

export interface QuestionAlternative {
  condition: ContextCondition
  text: string
  type?: 'boolean' | 'chips' | 'multiple' | 'scale' | 'text' | 'date'
  chips?: string[]
}

export interface SymptomQuestion {
  id: string
  text: string                  // default wording
  alternatives: QuestionAlternative[]
  type: 'boolean' | 'chips' | 'multiple' | 'scale' | 'text' | 'date'
  chips?: string[]
  required: boolean
  importance: 1 | 2 | 3         // 3 = critical question
  reasoningWeight: number       // 0-100, contribution to phenotype matching
  factKey: string               // structured fact to create
  documentationPhrase: string   // how this fact appears in narrative
  triggers?: string[]           // question IDs to activate when answered
  dependencies?: string[]       // question IDs that must be answered first
}

// ─── QUESTION LIBRARY ────────────────────────────────────────────────────────

export interface QuestionLibrary {
  questions: SymptomQuestion[]
  getQuestion: (id: string) => SymptomQuestion | undefined
  getApplicableQuestions: (context: AssessmentContext) => ApplicableQuestion[]
}

export interface ApplicableQuestion {
  question: SymptomQuestion
  displayText: string           // chosen alternative wording
  displayChips?: string[]       // chosen alternative chips
}

// ─── COMPLAINT OBJECT (UCCL Rule 003) ─────────────────────────────────────────

export interface ComplaintObject {
  id: string
  standardizedConcept: string       // mapped to SymptomNode identity.id or free text
  patientWording: string
  duration: string                  // e.g. '3 days'
  durationUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  sequenceOrder: number             // chronological order of onset
  reporter: 'patient' | 'caregiver' | 'witness' | 'referral' | 'unknown'
  confidence?: 'certain' | 'estimated' | 'uncertain'
  recordedAt: number                // timestamp
  author: string
}

// ─── CONSTITUTIONAL CONTEXT (CQAE inputs) ────────────────────────────────────

export interface ConstitutionalContext {
  // Identity
  age: number
  correctedAge?: number            // for premature infants
  sex: 'male' | 'female'
  pregnant: boolean
  gravidity?: number
  parity?: number

  // Encounter
  encounterType: string            // 'inpatient' | 'outpatient' | 'emergency' | 'follow-up'
  department: string
  specialty?: string
  location: string                 // 'ward' | 'icu' | 'clinic' | 'casualty'

  // Complaints
  chiefComplaints: ComplaintObject[]

  // Known diseases (PMH)
  knownDiseases: { id: string; name: string; active: boolean }[]

  // Current medications
  currentMedications: { id: string; name: string; category: string }[]

  // Known allergies
  knownAllergies: { id: string; allergen: string; severity: string }[]

  // Working diagnoses
  workingDiagnoses: string[]

  // History facts already captured (factKey → value)
  capturedFacts: Record<string, string | number | boolean | string[]>

  // Context module
  module: string                   // 'neonatal' | 'pediatric' | 'adult' | 'obstetric' | 'psychiatric' | 'surgical'
}

// ─── LEGACY ASSESSMENT CONTEXT (backward compat) ─────────────────────────────

export interface AssessmentContext {
  age: number
  sex: 'male' | 'female'
  pregnant: boolean
  department: string
  module: string
  encounterType: string
}

// ─── FACT EXTRACTION ─────────────────────────────────────────────────────────

export interface StructuredFact {
  key: string
  value: string | number | boolean
  type: 'reported' | 'observed' | 'measured' | 'derived'
  questionId: string
  documentationPhrase: string
}

export interface FactExtractionRule {
  questionId: string
  extract: (answer: string | number | boolean | string[], context: AssessmentContext) => StructuredFact[]
}

// ─── RELATIONSHIP ────────────────────────────────────────────────────────────

export type RelationshipType = 'associated_with' | 'may_cause' | 'may_complicate' | 'differential_for' | 'precedes' | 'follows'

export interface SymptomRelationship {
  targetSymptomId: string
  type: RelationshipType
  strength: number              // 0-1
  description: string
}

// ─── PHENOTYPE ───────────────────────────────────────────────────────────────

export interface PhenotypeCriterion {
  factKey: string
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains'
  value: string | number | boolean | string[]
}

export interface PhenotypeRule {
  id: string
  label: string
  description: string
  criteria: PhenotypeCriterion[]
  probability: number           // base probability 0-1
  suggestsMechanisms: string[]
  suggestsDifferentials: string[]
  emergencyWeight: number        // 0-100
}

// ─── DOCUMENTATION RULES ─────────────────────────────────────────────────────

export interface DocumentationRule {
  id: string
  condition: {
    factKey: string
    operator: 'present' | 'absent' | 'eq' | 'neq'
    value?: string | number | boolean
  }
  template: string              // template string with {{factKey}} placeholders
  priority: number               // lower = higher priority
}

// ─── REASONING HOOK ──────────────────────────────────────────────────────────

export interface ReasoningHook {
  id: string
  trigger: {
    on: 'objective_complete' | 'fact_captured' | 'phenotype_matched'
    ref: string                  // objective ID / fact key / phenotype ID
  }
  action: 'activate_questions' | 'suggest_differentials' | 'suggest_investigations' | 'flag_red_flag'
  payload: string[]              // question IDs / differential IDs / investigation IDs
}

// ─── COMPLETION RULES ────────────────────────────────────────────────────────

export interface ObjectiveCompletion {
  objectiveId: string
  status: 'not_started' | 'in_progress' | 'complete' | 'deferred' | 'not_applicable'
  answeredQuestions: string[]
  percentage: number             // 0-100
}

export interface CompletionRules {
  objectives: ObjectiveCompletion[]
  overall: number                // 0-100
}

// ─── CONTEXT EXTENSION ───────────────────────────────────────────────────────

export interface ContextExtension {
  label: string
  additionalObjectives: ClinicalObjectiveGroup[]
  additionalQuestions: SymptomQuestion[]
  suppressedQuestionIds: string[]
  modifiedQuestions: { id: string; text: string; chips?: string[] }[]
}

// ─── SECTION DEFINITION (UCAEM-FG Format) ────────────────────────────────────

export interface SectionDef {
  id: string
  label: string
  description: string
  order: number
  required: boolean
  source: 'constitutional' | 'specialty_extension' | 'population_extension' | 'surgical_variant' | 'postop_variant'
  population: ('neonate' | 'infant' | 'child' | 'adolescent' | 'adult' | 'elderly')[]
  applicable: (ctx: ConstitutionalContext) => boolean
}

// ─── SECTION STATE (UCAEM-SB-003) ────────────────────────────────────────────

export type SectionExecutionState =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'deferred'
  | 'awaiting_information'
  | 'completed_with_unknowns'
  | 'completed_patient_declined'
  | 'not_applicable'

export interface SectionState {
  sectionId: string
  status: SectionExecutionState
  visited: boolean
  completedAt?: number
  skippedQuestions: string[]
  deferredQuestions: string[]
}

// ─── ASSESSMENT FORMAT (Generated by Format Engine) ──────────────────────────

export interface AssessmentFormat {
  name: string
  description: string
  population: string
  sections: SectionDef[]
  constitutionalBase: string       // which constitutional format this derives from
  activeAdapters: string[]         // which context adapters are active
  encounterType?: string           // FG-002: outpatient | inpatient | emergency
}

// ─── THE CANONICAL SYMPTOM NODE ──────────────────────────────────────────────

export interface SymptomNode {
  identity: SymptomIdentity
  metadata: SymptomMetadata
  activation: ActivationRules
  timeline: TimelineRules
  objectives: ClinicalObjectiveGroup[]
  questions: SymptomQuestion[]
  contextAdapters: Record<string, ContextExtension>
  factExtraction: FactExtractionRule[]
  relationships: SymptomRelationship[]
  phenotypes: PhenotypeRule[]
  documentation: DocumentationRule[]
  reasoningHooks: ReasoningHook[]
  completion: CompletionRules
}
