// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Encounter Brain — Core Types
// Universal Encounter Graph + Disease State Objects + Engine Ownership
// ═══════════════════════════════════════════════════════════════════════════════

// ── Engine Ownership ──────────────────────────────────────────────────────────
// Every piece of data has exactly ONE owner engine.
// No engine writes data it does not own.
// No engine reads data it does not have permission to read.

export type EngineId =
  | 'encounter_brain'        // owns: encounter state, workflow, graph
  | 'context_engine'         // owns: patient context, encounter context
  | 'chief_complaint_engine' // owns: chief complaint, symptoms
  | 'timeline_engine'        // owns: master timeline
  | 'hpi_engine'             // owns: HPI facts, symptom relationships
  | 'disease_state_engine'   // owns: disease state objects
  | 'information_gap_engine' // owns: question selection, priority scoring
  | 'clinical_story_engine'  // owns: story completeness assessment
  | 'examination_engine'     // owns: exam findings
  | 'investigation_engine'   // owns: investigation orders and results
  | 'diagnosis_engine'       // owns: differential diagnosis, Bayesian reasoning
  | 'management_engine'      // owns: management plans
  | 'documentation_engine'   // owns: documentation graph, rendered notes
  | 'safety_engine'          // owns: alerts, red flags, contradictions
  | 'completeness_engine'    // owns: completeness tracking
  | 'analytics_engine'       // owns: analytics data (read-only from others)
  | 'audit_engine'          // owns: audit log
  | 'chronic_disease_engine' // owns: chronic disease objects, surgical context
  | 'functional_status';     // owns: functional status, frailty assessment

export interface DataOwnership {
  readonly owner: EngineId;
  readonly readableBy: EngineId[];
  readonly writableBy: EngineId[];  // should be [owner] always
}

// ── Patient Context ───────────────────────────────────────────────────────────

export type AgeCategory = 'neonate' | 'infant' | 'child' | 'adolescent' | 'adult' | 'older_adult';
export type Sex = 'male' | 'female' | 'other';
export type Department = 'surgery' | 'medicine' | 'pediatrics' | 'obstetrics' | 'gynecology'
  | 'emergency' | 'icu' | 'psychiatry' | 'orthopedics' | 'neonatology' | 'geriatrics'
  | 'ophthalmology' | 'ent' | 'dermatology' | 'oncology' | 'cardiology' | 'respiratory'
  | 'neurology' | 'endocrinology' | 'nephrology' | 'gastroenterology' | 'general';
export type EncounterType = 'outpatient' | 'emergency' | 'inpatient' | 'ward_round'
  | 'follow_up' | 'procedure' | 'telemedicine' | 'antenatal' | 'postnatal'
  | 'home_visit' | 'referral' | 'mdt';
export type Acuity = 'immediate' | 'emergency' | 'urgent' | 'semi_urgent' | 'routine' | 'elective';
export type Reliability = 'reliable' | 'partially_reliable' | 'unreliable' | 'unknown';

export interface PatientContext {
  patientId: string;
  encounterId: string;
  name: string;
  ageYears: number;
  ageMonths: number;
  ageCategory: AgeCategory;
  sex: Sex;
  pregnancyStatus: 'pregnant' | 'not_pregnant' | 'unknown' | 'postpartum' | 'post_abortion' | 'not_applicable';
  hasUterus: boolean;
  isBreastfeeding: boolean;
  isPostpartum: boolean;
  lmp?: string;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  occupation?: string;
  informant: string;
  informantRelation: string;
  reliability: Reliability;
  geographicRegion: string;
  facilityId: string;
  departmentSlug: string;
  unitSlug: string;
  requiresGuardian: boolean;
}

// ── Encounter Context ─────────────────────────────────────────────────────────

export interface EncounterContext {
  encounterType: EncounterType;
  department: Department;
  specialty: string;
  acuity: Acuity;
  referralStatus: 'self' | 'referral' | 'transfer' | 'follow_up';
  referringFacility?: string;
  referringClinician?: string;
  referralReason?: string;
  referralDocuments?: string[];
  isPostoperative: boolean;
  postOpDay?: number;
  operationPerformed?: string;
  operationDate?: string;
  isTrauma: boolean;
  traumaMechanism?: string;
  emergencyLevel: 'green' | 'yellow' | 'orange' | 'red';
}

// ── Master Timeline Types ─────────────────────────────────────────────────────

export type TimelineEventType =
  | 'symptom_onset'
  | 'symptom_change'
  | 'health_seeking_action'
  | 'self_medication'
  | 'pharmacy_visit'
  | 'clinic_visit'
  | 'health_centre_visit'
  | 'hospital_visit'
  | 'admission'
  | 'discharge'
  | 'referral'
  | 'transfer'
  | 'investigation'
  | 'diagnosis'
  | 'treatment'
  | 'procedure'
  | 'surgery'
  | 'complication'
  | 'milestone'
  | 'follow_up'
  | 'observation';

export type Certainty = 'confirmed' | 'probable' | 'possible' | 'patient_reported' | 'inferred' | 'unknown';

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  date: string;                    // ISO date or relative descriptor
  datePrecision: 'exact' | 'approximate' | 'estimated' | 'day_only' | 'month_only' | 'year_only' | 'relative';
  relativeToOnset?: string;        // "3 days after pain started"
  description: string;
  facility?: string;
  location?: string;
  treatment?: string;
  clinician?: string;
  outcome?: string;
  certainty: Certainty;
  source: 'patient' | 'clinician' | 'family' | 'record' | 'referral_doc' | 'system';
  owner: EngineId;
  metadata: Record<string, unknown>;
}

// ── Symptom Types ─────────────────────────────────────────────────────────────

export type SymptomId = string;

export type SymptomPolarity = 'present' | 'absent' | 'unknown';

export interface SymptomAttribute {
  featureId: string;
  label: string;
  value: string | boolean | number | string[];
  polarity: SymptomPolarity;
  timestamp: number;
  certainty: Certainty;
  source: 'patient' | 'clinician' | 'system' | 'inferred' | 'referral';
}

export interface SymptomObject {
  symptomId: SymptomId;
  label: string;
  present: boolean;
  isPrimary: boolean;
  attributes: Record<string, SymptomAttribute>;
  relationships: SymptomRelationship[];
  timelineRefs: string[];          // IDs of timeline events this symptom relates to
  onset?: TimelineEvent;
  resolvedAt?: TimelineEvent;
  owner: 'chief_complaint_engine' | 'hpi_engine';
}

// ── Symptom Relationship Types ────────────────────────────────────────────────

export type SymptomRelationType =
  | 'precedes'
  | 'follows'
  | 'occurs_with'
  | 'causes'
  | 'aggravates'
  | 'relieves'
  | 'independent'
  | 'worse_after'
  | 'better_after'
  | 'associated';

export interface SymptomRelationship {
  sourceId: string;
  targetId: string;
  relationType: SymptomRelationType;
  description: string;
  certainty: Certainty;
  timestamp: number;
}

// ── Disease State Objects ─────────────────────────────────────────────────────

export type EvidenceType = 'supporting' | 'against' | 'unknown_missing';
export type DangerLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface EvidenceItem {
  featureId: string;
  type: EvidenceType;
  value: string | boolean | number;
  lrPlus?: number;
  lrMinus?: number;
  impact: number;                  // posterior impact magnitude
  timestamp: number;
}

export interface DiseaseState {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;

  // Probabilities
  priorProb: number;               // from epidemiology + biodata
  currentProb: number;             // posterior after all evidence
  previousProb: number;            // before last update
  probabilityHistory: { prob: number; timestamp: number }[];

  // Evidence tracking
  supportingEvidence: EvidenceItem[];
  againstEvidence: EvidenceItem[];
  unknownEvidence: EvidenceItem[];  // features not yet known that could change probability
  criticalUnknowns: string[];       // features whose absence is dangerous to not know

  // Clinical scores
  scores: Record<string, { score: number; maxScore: number; interpretation: string }>;

  // Red flags
  redFlagTriggered: boolean;
  redFlagFeatures: string[];

  // Danger assessment
  dangerLevel: DangerLevel;
  mustNotMiss: boolean;

  // Timeline staging
  currentStageIndex: number;
  stageHistory: { stageId: number; enteredAt: number }[];

  // Metadata
  lastUpdated: number;
  owner: 'disease_state_engine';
}

// ── Information Gap Types ─────────────────────────────────────────────────────

export interface InformationGap {
  featureId: string;
  label: string;
  category: 'life_threatening' | 'diagnostic' | 'management' | 'documentation' | 'risk_factor' | 'functional_impact';
  priorityScore: number;           // 0-100, the master score
  reasonEssential: string;         // WHY this information is needed now
  sourceDiseaseId?: string;
  parentFeatureId?: string;        // depends-on relationship
  groupId?: string;                // for adaptive question groups
  groupLabel?: string;
  clinicalGuide?: string;
  options?: string[];
  type: 'boolean' | 'select' | 'multi_select' | 'number' | 'text';
}

// ── Clinical Story Types ──────────────────────────────────────────────────────

export type StoryStatus = 'cannot_start' | 'needs_context' | 'story_beginning' | 'story_middle' | 'story_ready' | 'story_review';

export interface StoryNode {
  id: string;
  type: 'context' | 'onset' | 'evolution' | 'symptom' | 'health_seeking' | 'risk_factor'
       | 'functional_impact' | 'negatives' | 'summary' | 'intervention';
  label: string;
  content: string;                 // rendered text for this node
  complete: boolean;
  missing: string[];               // feature IDs needed to complete this node
  children: StoryNode[];
  parentId?: string;
}

export interface ClinicalStory {
  status: StoryStatus;
  nodes: StoryNode[];
  missingSections: string[];
  completenessScore: number;       // 0-1
  canGenerate: boolean;
  storySummary: string;            // rough draft summary
}

// ── Health Seeking Journey ────────────────────────────────────────────────────

export interface HealthSeekingStep {
  stepNumber: number;
  actionType: 'stayed_home' | 'self_medication' | 'pharmacy' | 'clinic' | 'health_centre'
              | 'hospital' | 'traditional_healer' | 'admission' | 'referral' | 'transfer';
  facilityName?: string;
  facilityType?: string;
  facilityLevel?: number;          // 1-6 tier
  date?: string;
  waitingHours?: number;
  clinicianSeen?: string;
  diagnosisGiven?: string;
  treatmentGiven?: string;
  investigationsDone?: string[];
  response: 'improved' | 'no_change' | 'worsened' | 'unknown';
  reasonForEscalation?: string;
  referralDocument?: string;
  transportMode?: string;
  cost?: number;
  outcome?: string;
}

export interface HealthSeekingJourney {
  patientId: string;
  steps: HealthSeekingStep[];
  totalDaysBeforePresentation: number;
  numberOfFacilities: number;
  hadSelfMedication: boolean;
  hadPreviousAdmission: boolean;
  hadSimilarEpisodes: boolean;
  previousAdmissionDetails?: string;
  similarEpisodeDetails?: string;
}

// ── Chronic Disease Object ────────────────────────────────────────────────────

export interface ChronicDiseaseObject {
  diseaseId: string;
  diseaseName: string;
  diagnosisYear: number;
  diagnosisFacility?: string;
  currentClinic?: string;
  medications: { name: string; dose: string; frequency: string; compliance: 'good' | 'partial' | 'poor' | 'unknown' }[];
  compliance: 'good' | 'partial' | 'poor' | 'unknown';
  monitoring: { test: string; value: string; date: string }[];
  lastReviewDate?: string;
  complications: { complication: string; year: number; severity: string }[];
  admissions: { year: number; reason: string; duration: string }[];
  currentControl: 'well_controlled' | 'moderately_controlled' | 'poorly_controlled' | 'unknown';
  owner: 'chronic_disease_engine';
}

// ── Surgical Context Object ───────────────────────────────────────────────────

export interface PreviousSurgeryObject {
  surgeryId: string;
  procedureName: string;
  date: string;
  facility: string;
  indication: string;
  approach: 'open' | 'laparoscopic' | 'robotic' | 'endoscopic' | 'other';
  complications?: string[];
  currentFollowUp?: string;
  currentSymptoms?: string;
}

export interface PostOperativeState {
  postOpDay: number;
  operationPerformed: string;
  operationDate: string;
  surgeon: string;
  anaesthesia: 'general' | 'spinal' | 'regional' | 'local';
  woundStatus: 'clean' | 'clean_contaminated' | 'contaminated' | 'infected';
  painControl: 'adequate' | 'inadequate' | 'unknown';
  ambulation: 'independent' | 'with_assistance' | 'bedridden' | 'unknown';
  feeding: 'nil_by_mouth' | 'clear_liquids' | 'soft_diet' | 'regular_diet' | 'unknown';
  urination: 'normal' | 'retention_catheter' | 'retention_no_catheter' | 'unknown';
  flatus: 'passed' | 'not_passed' | 'unknown';
  bowelMotion: 'passed' | 'not_passed' | 'unknown';
  drainOutput?: string;
  dvtProphylaxis: boolean;
  antibiotics: boolean;
  fever: boolean;
  complications: string[];
}

// ── Functional Status Types ───────────────────────────────────────────────────

export type ADLDomain = 'mobility' | 'feeding' | 'bathing' | 'dressing' | 'toileting' | 'continence' | 'transfer';

export interface ADLStatus {
  domain: ADLDomain;
  independence: 'independent' | 'requires_assistance' | 'dependent' | 'unknown';
  details: string;
}

export interface FunctionalStatus {
  occupation: string;
  workImpact: string;              // "Unable to work", "Working with difficulty", etc.
  schoolAttendance?: string;       // for children/adolescents
  dailyActivities: ADLStatus[];
  overallImpact: 'none' | 'mild' | 'moderate' | 'severe' | 'bedridden';
  caregiverAvailable: boolean;
  caregiverName?: string;
}

// ── Frailty Assessment ────────────────────────────────────────────────────────

export interface FrailtyAssessment {
  assessed: boolean;
  fallsInLastYear: number;
  mobilityAid: 'none' | 'cane' | 'walker' | 'wheelchair' | 'bedridden';
  pressureSores: boolean;
  pressureSoreStage?: number;
  incontinence: 'none' | 'urinary' | 'fecal' | 'both';
  nutritionStatus: 'good' | 'at_risk' | 'malnourished';
  cognitiveStatus: 'normal' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment';
  turnsInBed: 'independently' | 'with_help' | 'needs_turning' | 'unknown';
  dvtRisk: 'low' | 'moderate' | 'high';
  peRisk: 'low' | 'moderate' | 'high';
}

// ── Documentation Graph Types ─────────────────────────────────────────────────

export type DocNodeType =
  | 'context'
  | 'illness_context'
  | 'timeline'
  | 'pain_history'
  | 'symptom_cluster'
  | 'important_negatives'
  | 'health_seeking'
  | 'functional_impact'
  | 'risk_factors'
  | 'chronic_disease_context'
  | 'surgical_context'
  | 'summary'
  | 'differential_summary'
  | 'plan_summary';

export interface DocNode {
  id: string;
  type: DocNodeType;
  label: string;
  content: string;
  order: number;
  complete: boolean;
  children: string[];              // child doc node IDs
  parentId?: string;
  sourceFacts: string[];           // feature IDs that feed into this node
}

export interface DocumentationGraph {
  encounterId: string;
  nodes: DocNode[];
  rootIds: string[];               // entry point node IDs
  renderedFormats: {
    admissionNote?: string;
    soapNote?: string;
    referral?: string;
    dischargeSummary?: string;
    wardRound?: string;
    progressNote?: string;
    hpiNarrative?: string;
  };
  lastRendered: number;
  owner: 'documentation_engine';
}

// ── Workflow Types ────────────────────────────────────────────────────────────

export const WORKFLOW_STEPS = [
  'registration',
  'chief_complaint',
  'timeline',
  'hpi',
  'important_negatives',
  'past_history',
  'drug_history',
  'allergies',
  'family_history',
  'social_history',
  'functional_status',
  'review_of_systems',
  'summary',
  'vitals',
  'abcde',
  'general_examination',
  'system_examination',
  'problem_list',
  'differentials',
  'investigations',
  'interpretation',
  'diagnosis',
  'management',
  'monitoring',
  'disposition',
  'documentation',
  'coding',
  'audit',
] as const;

export type WorkflowStep = typeof WORKFLOW_STEPS[number];

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  skippedSteps: WorkflowStep[];
  startedAt: number;
  updatedAt: number;
  owner: 'encounter_brain';
}

// ── Real Doctor Workflow Step Metadata ────────────────────────────────────────

export interface WorkflowStepMeta {
  step: WorkflowStep;
  label: string;
  description: string;
  owner: EngineId;
  required: boolean;
  dependsOn: WorkflowStep[];
  activationRule?: string;         // CRL-like condition
}

export const WORKFLOW_STEP_META: Record<WorkflowStep, WorkflowStepMeta> = {
  registration: { step: 'registration', label: 'Registration', description: 'Patient identification and biodata', owner: 'encounter_brain', required: true, dependsOn: [] },
  chief_complaint: { step: 'chief_complaint', label: 'Chief Complaint', description: 'Presenting problem in the patient\'s own words', owner: 'chief_complaint_engine', required: true, dependsOn: ['registration'] },
  timeline: { step: 'timeline', label: 'Timeline', description: 'When did the illness start and how has it evolved?', owner: 'timeline_engine', required: true, dependsOn: ['chief_complaint'] },
  hpi: { step: 'hpi', label: 'History of Presenting Illness', description: 'Full characterization of the current illness', owner: 'hpi_engine', required: true, dependsOn: ['timeline'] },
  important_negatives: { step: 'important_negatives', label: 'Important Negatives', description: 'Features whose absence rules out key diagnoses', owner: 'hpi_engine', required: true, dependsOn: ['hpi'] },
  past_history: { step: 'past_history', label: 'Past Medical History', description: 'Chronic diseases, admissions, prior illnesses', owner: 'chronic_disease_engine', required: true, dependsOn: ['hpi'] },
  drug_history: { step: 'drug_history', label: 'Drug History', description: 'Current medications, adherence, past medications', owner: 'hpi_engine', required: true, dependsOn: ['past_history'] },
  allergies: { step: 'allergies', label: 'Allergies', description: 'Drug and other allergies', owner: 'hpi_engine', required: true, dependsOn: ['drug_history'] },
  family_history: { step: 'family_history', label: 'Family History', description: 'Family diseases with genetic or environmental significance', owner: 'hpi_engine', required: false, dependsOn: ['past_history'] },
  social_history: { step: 'social_history', label: 'Social History', description: 'Occupation, smoking, alcohol, housing, support', owner: 'hpi_engine', required: true, dependsOn: ['past_history'] },
  functional_status: { step: 'functional_status', label: 'Functional Status', description: 'How has this illness affected daily life?', owner: 'functional_status', required: true, dependsOn: ['hpi'] },
  review_of_systems: { step: 'review_of_systems', label: 'Review of Systems', description: 'Full system review for associated symptoms', owner: 'hpi_engine', required: true, dependsOn: ['hpi'] },
  summary: { step: 'summary', label: 'Clinical Summary', description: 'Clinician\'s summary of the history', owner: 'encounter_brain', required: true, dependsOn: ['review_of_systems'] },
  vitals: { step: 'vitals', label: 'Vitals', description: 'BP, HR, RR, SpO2, Temp, weight, height', owner: 'examination_engine', required: true, dependsOn: ['summary'] },
  abcde: { step: 'abcde', label: 'ABCDE Assessment', description: 'Airway, Breathing, Circulation, Disability, Exposure', owner: 'examination_engine', required: false, dependsOn: ['vitals'], activationRule: 'encounter.acuity === "emergency" || encounter.acuity === "immediate"' },
  general_examination: { step: 'general_examination', label: 'General Examination', description: 'Appearance, pallor, jaundice, cyanosis, clubbing, lymphadenopathy, edema', owner: 'examination_engine', required: true, dependsOn: ['vitals'] },
  system_examination: { step: 'system_examination', label: 'System Examination', description: 'Focused examination based on presenting problem', owner: 'examination_engine', required: true, dependsOn: ['general_examination'] },
  problem_list: { step: 'problem_list', label: 'Problem List', description: 'Synthesized problem list from history and examination', owner: 'encounter_brain', required: true, dependsOn: ['system_examination'] },
  differentials: { step: 'differentials', label: 'Differentials', description: 'Ranked differential diagnosis with probabilities', owner: 'diagnosis_engine', required: true, dependsOn: ['problem_list'] },
  investigations: { step: 'investigations', label: 'Investigations', description: 'Ordered labs, imaging, and bedside tests', owner: 'investigation_engine', required: true, dependsOn: ['differentials'] },
  interpretation: { step: 'interpretation', label: 'Interpretation', description: 'Lab and imaging result interpretation', owner: 'investigation_engine', required: true, dependsOn: ['investigations'] },
  diagnosis: { step: 'diagnosis', label: 'Diagnosis', description: 'Final diagnosis or working diagnosis', owner: 'diagnosis_engine', required: true, dependsOn: ['interpretation'] },
  management: { step: 'management', label: 'Management Plan', description: 'Treatment, medications, procedures, monitoring', owner: 'management_engine', required: true, dependsOn: ['diagnosis'] },
  monitoring: { step: 'monitoring', label: 'Monitoring Plan', description: 'Frequency of review, parameters to track, escalation plan', owner: 'management_engine', required: true, dependsOn: ['management'] },
  disposition: { step: 'disposition', label: 'Disposition', description: 'Admit, discharge, transfer, or follow-up plan', owner: 'management_engine', required: true, dependsOn: ['monitoring'] },
  documentation: { step: 'documentation', label: 'Documentation', description: 'All clinical notes generated from structured data', owner: 'documentation_engine', required: true, dependsOn: ['disposition'] },
  coding: { step: 'coding', label: 'Coding', description: 'ICD, procedure, and billing codes', owner: 'analytics_engine', required: false, dependsOn: ['documentation'] },
  audit: { step: 'audit', label: 'Audit', description: 'Clinical audit trail and quality review', owner: 'audit_engine', required: true, dependsOn: ['documentation'] },
};

// ── Question Group / Adaptive Block Types ─────────────────────────────────────

export interface QuestionGroup {
  id: string;
  label: string;
  description: string;
  questions: string[];             // feature IDs in this group
  order: number;
  condition?: string;              // CRL condition for activation
  minRequired: number;             // minimum answers needed in this group
}

// ── Encounter Brain — The Single Authoritative State ──────────────────────────

export interface EncounterBrainState {
  // ── Core identification ──
  encounterId: string;
  organizationId: string;
  version: number;

  // ── Patient & encounter context (owner: context_engine) ──
  patient: PatientContext;
  encounter: EncounterContext;

  // ── Symptoms (owner: chief_complaint_engine / hpi_engine) ──
  symptoms: Record<string, SymptomObject>;
  primarySymptomId: string;

  // ── Master Timeline (owner: timeline_engine) ──
  timeline: TimelineEvent[];

  // ── Symptom relationships (owner: hpi_engine) ──
  symptomRelationships: SymptomRelationship[];

  // ── Disease states (owner: disease_state_engine) ──
  diseaseStates: Record<string, DiseaseState>;
  leadingDiseaseId: string | null;
  diseaseConvergenceState: 'exploring' | 'converging' | 'confirming';

  // ── Health seeking journey (owner: health_seeking_engine) ──
  healthSeekingJourney: HealthSeekingJourney | null;

  // ── Chronic diseases (owner: chronic_disease_engine) ──
  chronicDiseases: Record<string, ChronicDiseaseObject>;

  // ── Surgical context (owner: chronic_disease_engine) ──
  previousSurgeries: PreviousSurgeryObject[];
  postOperativeState: PostOperativeState | null;

  // ── Functional status (owner: functional_status) ──
  functionalStatus: FunctionalStatus | null;
  frailtyAssessment: FrailtyAssessment | null;

  // ── Information gaps (owner: information_gap_engine) ──
  gaps: InformationGap[];
  nextGap: InformationGap | null;
  questionsAsked: string[];

  // ── Clinical story (owner: clinical_story_engine) ──
  clinicalStory: ClinicalStory | null;

  // ── Workflow (owner: encounter_brain) ──
  workflow: WorkflowState;
  activeQuestionGroups: QuestionGroup[];

  // ── Documentation (owner: documentation_engine) ──
  documentationGraph: DocumentationGraph | null;

  // ── Safety (owner: safety_engine) ──
  contradictions: import('../knowbase/diseaseNode').Contradiction[];
  redFlags: string[];

  // ── Completeness (owner: completeness_engine) ──
  completeness: Record<string, boolean>;
  completenessScore: number;

  // ── Metadata ──
  createdAt: number;
  updatedAt: number;
  isComplete: boolean;
}
