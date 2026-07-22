// CES Types
export type {
  AgeGroup, Sex, EncounterPhase, ModuleType, Confidence, Severity,
  Biodata, ChiefComplaint, ClinicalFact, ClinicalConcept,
  QuestionCard, QuestionGroup, QuestionOption, Answer, TimestampedFact,
  Differential, Investigation, ManagementItem, ClinicalObjective,
  ClinicalFinding, ExaminationSection, TimelineEntry, BorderedFact,
} from './types/ces';

// Context Engine
export { determineAgeGroup, buildBiodata, buildPatientContext } from './engines/context-engine';
export type { PatientContext } from './engines/context-engine';

// Question Engine
export {
  createQuestionEngine, answerQuestion, setPhase, setActiveModules,
  getCurrentCard, getProgress, getVisibleCards,
  getCurrentGroup, didGroupChange,
} from './engines/question-engine';
export type { QuestionEngineState, GroupInfo } from './engines/question-engine';

// Documentation Engine
export { generateHpiNarrative, generateEnhancedHpiNarrative, generateTimeline, generateProblemList, generateUniversalHpiNarrative } from './engines/documentation-engine';
export type { HpiNarrativeContext } from './engines/documentation-engine';

// AI Service
export { generateAiHpiNarrative } from './ai/nvidia-service';

// Reasoning Engine
export {
  computeDifferentials, computeRedFlags, computeMissingInfo, computeObjectives, scoreMechanisms, computeGeneralDdx,
} from './engines/reasoning-engine';
export type { MechanismScore } from './engines/reasoning-engine';

// DDx Knowledge Base
export { DDX_KNOWLEDGE_BASE, getDdxEntry, getDdxEntriesBySystem } from './knowledge/symptom-ddx-knowledge';
export type { DdxDiseaseEntry, DdxSymptomWeight } from './knowledge/symptom-ddx-knowledge';

// Management Generator (Phenotype → Mechanism → Management Pipeline)
export { generateManagementPlan } from './engines/management-generator';
export type { ManagementGeneratorInput, GeneratedManagementPlan } from './engines/management-generator';

// Mechanism Protocol Map
export { getMechanismProtocols, mergeMechanismActions, MECHANISM_PROTOCOL_MAP } from './knowledge/mechanism-protocol-map';
export type { MechanismProtocolAction } from './knowledge/mechanism-protocol-map';

// Orchestrator
export {
  createEncounterOrchestrator, answerInOrchestrator, advancePhase,
  setPatientBiodata, getClinicalNotes, getHpiNarrativeContext,
} from './engines/orchestrator';
export type { EncounterOrchestratorState, VersionRecord } from './engines/orchestrator';

// Constitutional Engines
export { evaluateCqae } from './engines/cqae';
export type { CqaeInput, CqaeResult } from './engines/cqae';

export { createHpiState, getNextHpiQuestions } from './engines/hpi-engine';
export type { HpiExplorationState, HpiExplorationInput } from './engines/hpi-engine';

export {
  createStateMachine, startSection, completeSection,
  navigateToSection, navigateToNextSection, navigateToPreviousSection,
  handleContextChange, setAwaitingInformation, setNotApplicable,
  transitionSectionState,
} from './engines/state-machine';
export type { SectionStateMachine } from './engines/state-machine';

export { generateConstitutionalHpiNarrative, generateSectionNarrative } from './engines/documentation-engine';
export type { ConstitutionalDocInput } from './engines/documentation-engine';

export { buildConstitutionalContext } from './engines/context-engine';
export type { ConstitutionalContextInput } from './engines/context-engine';

// Temporal Engine
export {
  parseDurationToMs, resolveTemporalExpression,
  computeTemporalRelationship, buildTimelineFromFacts,
  extractTemporalExpression, getAgeInUnits, formatDuration,
} from './engines/temporal-engine';
export type { TemporalExpression, TemporalFact, TemporalRelationship } from './engines/temporal-engine';

// Missing Engines
export { generatePatientEducation, getRedFlagInstructions, getMedicationInstructions } from './engines/patient-education-engine';
export { generateFollowUpPlan, generateReferralCriteria } from './engines/follow-up-engine';
export { generateAlerts, prioritizeAlerts, shouldEscalate } from './engines/alert-engine';
export type { ClinicalAlert, AlertPriority } from './engines/alert-engine';
export { runSafetyChecklist, allChecksPassed, getFailedChecks } from './engines/safety-engine';
export type { SafetyCheck } from './engines/safety-engine';
export { createWorkflowFromEncounter, canCompleteTask, getPendingTasks } from './engines/workflow-engine';
export type { WorkflowTask } from './engines/workflow-engine';
// Re-exports removed — pg/neo4j are Node-only. Import directly if needed.

// Knowledge
export { getApplicableQuestionsConstitutional } from './knowledge/symptomKnowledge';

// Graph Sync
export { syncAllSymptomsToGraph, syncSymptomNodeToGraph, getRelatedSymptomsFromGraph } from './knowledge/graph-sync';

// Universal Libraries
export {
  PMH_OBJECTIVES, PMH_QUESTIONS, PMH_FACT_EXTRACTION,
  DRUG_OBJECTIVES, DRUG_QUESTIONS, DRUG_FACT_EXTRACTION,
  ALLERGY_OBJECTIVES, ALLERGY_QUESTIONS, ALLERGY_FACT_EXTRACTION,
  FAMILY_OBJECTIVES, FAMILY_QUESTIONS, FAMILY_FACT_EXTRACTION,
  SOCIAL_OBJECTIVES, SOCIAL_QUESTIONS, SOCIAL_FACT_EXTRACTION,
  OBGYN_OBJECTIVES, OBGYN_QUESTIONS, OBGYN_FACT_EXTRACTION,
  PERINATAL_OBJECTIVES, PERINATAL_QUESTIONS, PERINATAL_FACT_EXTRACTION,
  NUTRITION_OBJECTIVES, NUTRITION_QUESTIONS, NUTRITION_FACT_EXTRACTION,
  IMMUNIZATION_OBJECTIVES, IMMUNIZATION_QUESTIONS, IMMUNIZATION_FACT_EXTRACTION,
  GROWTH_OBJECTIVES, GROWTH_QUESTIONS, GROWTH_FACT_EXTRACTION,
  ROS_OBJECTIVES, ROS_QUESTIONS, ROS_FACT_EXTRACTION,
  ALL_HISTORY_LIBRARIES,
} from './knowledge/libraries';

// UCOL — Universal Objective Library
export { UNIVERSAL_OBJECTIVES, getObjective, getObjectivesByIds } from './knowledge/ucol';

// Mechanism Library
export { MECHANISM_LIBRARY, getMechanism, getMechanismsByCategory, getMechanismsByBodySystem } from './knowledge/mechanisms';
export type { MechanismDefinition, MechanismCategory } from './knowledge/mechanisms';

// Phenotype Library
export { PHENOTYPE_LIBRARY, getPhenotype, getPhenotypesBySymptom, getPhenotypesByMechanism } from './knowledge/phenotypes';
export type { PhenotypeDefinition } from './knowledge/phenotypes';

// Legacy (maintain backward compatibility)
export { computeFeverDdx, FEVER_DDX, FEVER_RED_FLAGS, FEVER_MANAGEMENT_PROTOCOLS, getSymptomNode, searchSymptoms, getAllSymptomNames, getApplicableQuestions, extractFacts } from './knowledge/symptomKnowledge';
export type { FeverDdxEntry, FeverProtocol, FeverDdxResult } from './knowledge/symptomKnowledge';

// Protocol Engine
export {
  registerDiseaseProtocols, getProtocolsForDisease,
  getProtocolsForDifferential, suggestInvestigations,
  suggestMedications, hasProtocolsForDisease,
  getAllRegisteredDiseaseIds, loadExistingProtocols,
} from './engines/protocol-engine';
export type { ProtocolRequest, ProtocolSet, InvestigationBundle, MedicationProtocol } from './engines/protocol-engine';

// Protocol Auto-Executor
export { autoExecuteProtocol, estimateSeverityFromVitals } from './engines/protocol-auto-executor';
export type { AutoExecutionInput, AutoExecutionPlan, AutoExecutedOrder, AutoExecutionVitals } from './engines/protocol-auto-executor';

// Normal Reference Library
export {
  registerReferenceValue, registerReferenceValues,
  getReferenceValue, getNormalRange, isWithinNormalRange,
  getReferenceSuggestions, initializeDefaultReferences,
} from './engines/normal-reference';
export type { NormalReferenceValue, ReferenceQuery, ReferenceResult, NormalReferenceCategory } from './engines/normal-reference';

// Billing Engine
export {
  registerCptCode, registerIcd10Code, getCptCode, getIcd10Code,
  searchCptByCode, searchIcd10ByKeyword, suggestEvalCptCode,
  generateBillingLineItems, suggestIcd10Codes,
  calculateTotalCharge, calculateTotalRvu,
} from './engines/billing-engine';
export type { CptCode, Icd10Code, BillingLineItem, EncounterBillingSummary, BillingAssessmentConfig } from './engines/billing-engine';

// AI Safety Engine
export {
  evaluateAIContentSafety, autoRemediate, registerSafetyRule,
  registerSafetyRules, getSafetyRulesByCategory,
  getSafetyRulesByIds, getAllSafetyRules,
} from './engines/ai-safety-engine';
export type { SafetyRule, SafetyViolation, SafetyContext, SafetyReport, SafetyCategory, SafetySeverity } from './engines/ai-safety-engine';

// Format Engine — extended
export {
  generateAssessmentFormat, generateFullAssessmentFormat,
  getDefaultSectionOrder, getEncounterTypeVariant,
  getEncounterTypeSections, isSurgicalAssessment,
  isPostOperativeAssessment, applyPopulationExtensions,
  applySurgicalVariant, applyPostOperativeVariant,
} from './engines/format-engine';
export type { FormatGenerationInput, FullFormatInput } from './engines/format-engine';

// Rules
export { MODULES, detectActiveModules } from './rules/modules';
export { QUESTION_GROUPS } from './rules/questionGroups';

// Constitution Integration
export {
  PHASE_TO_CONSTITUTION_STATE, mapPhaseToState,
  createConstitutionEncounter, managementItemToAction,
  convertManagementPlanToActions, createDiagnosisDecision,
  createClinicalFactsFromAnswers, createEncounterNoteFromPhase,
  updateEncounterPreparation, addPatientInputToEncounter,
  setEncounterDecision, addActionsToEncounter,
  createConstitutionWorkflow, createTaskFromAction,
} from './constitution-integration';
