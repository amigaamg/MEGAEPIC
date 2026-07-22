// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Encounter Module — single source of truth for all encounter data
// ═══════════════════════════════════════════════════════════════════════════════
// All exports from the unified architecture. Import ONLY from here.
// ═══════════════════════════════════════════════════════════════════════════════

// ── State types and factories ─────────────────────────────────────────────

export type {
  WorkflowStep,
  EncounterPhase,
  WorkflowState,
  Demographics,
  ChiefComplaint,
  SymptomId,
  StructuredSymptom,
  GenericSymptom,
  AbdominalPainSymptom,
  ChestPainSymptom,
  CoughSymptom,
  FeverSymptom,
  DyspneaSymptom,
  NauseaVomitingSymptom,
  DiarrheaSymptom,
  ConstipationSymptom,
  DysphagiaSymptom,
  GiBleedingSymptom,
  JaundiceSymptom,
  DistensionSymptom,
  PastMedicalHistory,
  ObstetricHistory,
  GynecologicalHistory,
  Medications,
  FamilyHistory,
  SocialHistory,
  ReviewOfSystems,
  Vitals,
  PhysicalExam,
  GiExam,
  InvestigationOrder,
  ImagingOrder,
  BedsideScore,
  DifferentialCandidate,
  Assessment,
  ManagementPlan,
  EncounterState,
} from './encounterState';

export { createEncounterState, activateSymptom, advanceWorkflow, advancePhase } from './encounterState';

// ── Reducer ────────────────────────────────────────────────────────────────

export type { EncounterAction } from './encounterReducer';
export { encounterReducer } from './encounterReducer';

// ── Symptom schemas ────────────────────────────────────────────────────────

export type { SymptomField, FieldType, SymptomSchema } from './symptomSchemas';
export {
  SYMPTOM_SCHEMAS,
  getSymptomSchema,
  getMandatoryFields,
  getFieldsForPhase,
  getUnansweredFields,
} from './symptomSchemas';

// ── Examination schemas ─────────────────────────────────────────────────────

export type { ExamFieldType, ExamPhase, FindingSignificance, ExamField, ExamSchema } from './examinationSchemas';
export {
  EXAM_SCHEMAS,
  GI_EXAM_SCHEMA,
  getExamSchema,
  getMandatoryExamFields,
  getFieldsForPhase as getExamFieldsForPhase,
  getCriticalExamFields,
  getUnansweredExamFields,
  getExamSystemsActivatedBySymptom,
  getExamSystemsActivatedByCC,
} from './examinationSchemas';

// ── Universal Examination Types ────────────────────────────────────────────

export type {
  BodyRegion,
  Laterality,
  AnatomicalLocation,
  Measurement,
  GrowthMeasurement,
  ClinicalFinding,
  FindingSeverity,
  FindingTrend,
  FindingCertainty,
  VitalSignMeasurement,
  IntelligentVitals,
  Anthropometry,
  ConstitutionalSignId,
  ConstitutionalSign,
  LymphNode,
  LymphNodeExamination,
  GeneralAppearance,
  ExaminationPreparation,
  UniversalGeneralExamination,
  ActivationRule,
} from './examination/examinationTypes';

// ── General Examination Schemas ────────────────────────────────────────────

export type { GenExamFieldType, GenExamField } from './examination/generalExaminationSchemas';
export {
  PREPARATION_FIELDS,
  GENERAL_APPEARANCE_FIELDS,
  ANTHROPOMETRY_FIELDS,
  VITAL_SIGN_FIELDS,
  CONSTITUTIONAL_SIGN_FIELDS,
  GENERAL_EXAMINATION_SECTIONS,
  getGenExamField,
  getMandatoryGenExamFields,
  getActiveGenExamFields,
  getConstitutionalSignId,
} from './examination/generalExaminationSchemas';

// ── Anthropometry Engine ───────────────────────────────────────────────────

export type { AnthropometryResult, AnthropometryReport } from './engines/anthropometryEngine';
export {
  analyzeAnthropometry,
  getExpectedWeight,
  getExpectedLength,
  getExpectedHC,
  getNormalVitalRange as getAnthropometryVitalRange,
} from './engines/anthropometryEngine';

// ── Vitals Interpretation Engine ───────────────────────────────────────────

export type { VitalsReference, VitalsPanelResult } from './engines/vitalsEngine';
export {
  interpretHeartRate,
  interpretRespiratoryRate,
  interpretBloodPressure,
  interpretSpO2,
  interpretTemperature,
  interpretBloodGlucose,
  interpretCapillaryRefill,
  interpretAVPU,
  interpretGCS,
  interpretAllVitals,
  getVitalsReference,
  getVitalsAgeGroup,
} from './engines/vitalsEngine';

// ── General Examination Engine ─────────────────────────────────────────────

export type { GeneralExamSectionStatus, NextGenExamStep, GeneralExamCompleteness, ActivatedExamination } from './engines/generalExaminationEngine';
export {
  getActiveSections,
  CONSTITUTIONAL_ACTIVATION_CHAINS,
  generateGeneralExaminationNarrative,
  generateGeneralExaminationSummary,
  getNextGenExamStep,
  getGeneralExamCompleteness,
} from './engines/generalExaminationEngine';

// ── System Examination Types (Volume IIB) ──────────────────────────────────

export type {
  SystemId,
  ExamPhase as SystemExamPhase,
  SystemFieldType,
  SystemExamFieldDef,
  SystemExamState,
  SystemPhaseState,
  SystemFieldValue,
  SystemMeasurement,
  SystemExaminations,
  NextSystemExamStep,
  SystemActivationRule,
  SystemContext,
  SystemNarrativeInput,
  SystemNarrativeOutput,
} from './examination/systemExaminationTypes';

export {
  EXAM_PHASE_ORDER as SYSTEM_EXAM_PHASE_ORDER,
  SYSTEM_LABELS,
  SYSTEM_PHASE_MAP,
} from './examination/systemExaminationTypes';

// ── System Examination Schemas ──────────────────────────────────────────────

export { RESPIRATORY_FIELDS } from './examination/systems/respiratorySchema';
export { CARDIOVASCULAR_FIELDS } from './examination/systems/cardiovascularSchema';
export { GASTROINTESTINAL_FIELDS } from './examination/systems/gastrointestinalSchema';
export { NEUROLOGICAL_FIELDS } from './examination/systems/neurologicalSchema';
export { MUSCULOSKELETAL_FIELDS } from './examination/systems/musculoskeletalSchema';
export {
  RENAL_FIELDS,
  ENDOCRINE_FIELDS,
  BREAST_FIELDS,
  ENT_FIELDS,
  EYE_FIELDS,
  SKIN_FIELDS,
  OBSTETRIC_FIELDS,
  NEONATAL_FIELDS,
} from './examination/systems/otherSystemsSchema';

// ── System Examination Engine ────────────────────────────────────────────────

export type { } from './engines/systemExaminationEngine';
export {
  SYSTEM_FIELD_REGISTRY,
  SYSTEM_ACTIVATION_RULES,
  getSystemFields,
  getFieldDefinition as getSystemFieldDefinition,
  createInitialSystemState,
  createInitialSystemPhaseState,
  getActiveSystems,
  getNextSystemExamStep,
  updateSystemExamField,
  completeSystemExamPhase,
  getSystemCompleteness,
  getSystemExamSummary,
} from './engines/systemExaminationEngine';

// ── System Narrative Engine ──────────────────────────────────────────────────

export {
  generateSystemNarrative,
  generateFullPhysicalExamination,
  generateExamSectionForNote,
} from './engines/systemNarrativeEngine';

// ── Examination engine — what to examine next ──────────────────────────────

export type { NextExamStep, ExamPriority, ExamCompletenessResult } from './engines/examinationEngine';
export {
  getNextExamStep,
  getAllPendingExamSteps,
  getActiveExamSystems,
  getCurrentExamPhase,
  getExamCompleteness,
  EXAM_PHASE_ORDER,
} from './engines/examinationEngine';

// ── Exam narrative — document findings ─────────────────────────────────────

export { buildGiExamNarrative, buildGiExamSummary } from './engines/examNarrativeEngine';

// ── Completion engine ──────────────────────────────────────────────────────

export type { DomainRequirement, CompletionResult } from './completionEngine';
export { evaluateCompleteness, canEnterStep, canEnterPhase, questionsExhausted } from './completionEngine';

// ── Encounter Phases — 22-step phase definitions ─────────────────────────────

export type { EncounterPhase as EncounterPhaseAlias, PhaseGroup, PhaseDefinition } from './encounterPhases';
export {
  ENCOUNTER_PHASES,
  PHASE_ORDER,
  EVIDENCE_COLLECTION_PHASES,
  CLINICAL_SYNTHESIS_PHASES,
  PHASE_GROUPS,
  getPhaseDefinition,
  getPhasesByGroup,
  getPhaseIndex,
  isBeforeClinicalSummary,
  isAfterClinicalSummary,
  isClinicalSummary,
} from './encounterPhases';

// ── Engines ────────────────────────────────────────────────────────────────

// Workflow — single progression authority
export {
  WORKFLOW_ORDER,
  getWorkflowOrder,
  canAdvanceTo,
  getNextStep,
  getPreviousStep,
  isComplete,
  phaseToStep,
  stepToPhases,
  getStepGroup,
  isLastPhaseInStep,
  getNextPhaseInStep,
  canAdvanceToPhase,
  getNextPhase,
  getPreviousPhase,
  isPhaseComplete,
  isBeforePhase,
  isAfterPhase,
  isClinicalSummaryReached,
  areAllPhasesComplete,
  getCompletedStepCount,
  getCompletedPhaseCount,
  getPhaseProgress,
} from './engines/workflowEngine';

// Question — universal question selector
export type { NextQuestion, QuestionPriority } from './engines/questionEngine';
export {
  getNextQuestion,
  getAllPendingQuestions,
  getCurrentPhase,
  QUESTION_PHASES,
} from './engines/questionEngine';

// Red Flag — pure clinical rules
export type { RedFlagRule, RedFlagResult } from './engines/redFlagEngine';
export { evaluateRedFlags, assessSeverity } from './engines/redFlagEngine';

// ROS — targeted review of systems
export type { RosSystemDefinition, RosField } from './engines/rosEngine';
export {
  ROS_SYSTEMS,
  getActiveRosSystems,
  getNextRosQuestion,
  getRosCompleteness,
} from './engines/rosEngine';

// Narrative — dumb formatter (NO reasoning)
export { describeSymptom, buildHPINarrative } from './engines/narrativeEngine';

// Documentation — generates clinical notes at the end
export type { NoteType } from './engines/documentationEngine';
export {
  generateInitialAssessment,
  generateProgressNote,
  generateReferralLetter,
  generateDischargeSummary,
  regenerateDocumentation,
  updateDocumentation,
  generateHTML,
  signEncounter,
  addAddendum,
  createDocumentationState,
  generatePatientIdentification,
  generateChiefComplaints,
  generateHPISection,
  generatePastMedicalHistory,
  generatePastSurgicalHistory,
  generateDrugHistory,
  generateAllergyHistory,
  generateFamilyHistory,
  generateSocialHistory,
  generateReviewOfSystems,
  generatePhysicalExamination,
  generateClinicalSummarySection,
  generateAssessment,
  generateInvestigations,
  generateManagement,
  generateDisposition,
} from './engines/documentationEngine';

// HPI Generator — consultant-quality chronological narrative
export { generateHPI, buildFullHPISection } from './engines/hpiGenerator';

// Clinical Summary — watershed
export type { ClinicalSummaryInput } from './engines/clinicalSummaryEngine';
export {
  buildClinicalSummaryInput,
  generateClinicalSummary,
  createClinicalSummaryState,
  finalizeClinicalSummary,
  editClinicalSummary,
} from './engines/clinicalSummaryEngine';

// Investigations
export type { InvestigationCard, InvestigationPanel, InvestigationResult, InvestigationCategory, LabResultPayload } from './engines/investigationsEngine';
export {
  getBaselinePanel,
  getAbdominalPainPanel,
  getRespiratoryPanel,
  applyLabResult,
  applyLabResultsToAll,
  selectInvestigation,
  getSelectedInvestigations,
  getPendingResults,
} from './engines/investigationsEngine';

// Management schemas
export type { ManagementCategoryDef, DispositionCard } from './schemas/managementSchemas';
export {
  MANAGEMENT_CATEGORIES,
  createEmergencyItem,
  createSupportiveItem,
  createDefinitiveItem,
  createMonitoringItem,
  createConsultationItem,
  createEducationItem,
  createPreventionItem,
  createFollowUpItem,
  createMedication,
  COMMON_MEDICATIONS,
} from './schemas/managementSchemas';

// Diagnostic schemas
export type { ICD10Entry, MustNotMissEntry } from './schemas/diagnosticSchemas';
export {
  ICD10_COMMON,
  PROBLEM_CATEGORY_OPTIONS,
  MUST_NOT_MISS_DIAGNOSES,
} from './schemas/diagnosticSchemas';

// DDX — adapter between state and Bayesian engine
export type { DDXInput, DDXOutput } from './engines/ddxEngine';
export { prepareDDXInput, prepareDDXOutput, estimateTriagePriority, runDDX } from './engines/ddxEngine';

// Session adapter — backward-compatible replacement for encounterOrchestrator
export type { AmexanSession } from './engines/sessionAdapter';
export { createSession, processAnswer } from './engines/sessionAdapter';

// ── React context provider ─────────────────────────────────────────────────

export { EncounterProvider, useEncounter } from './EncounterContext';
