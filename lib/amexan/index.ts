// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Engine — Master Entry Point
// Every engine is accessible through this single module.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Constitution (Volume XIII — Identity, Org, Auth) ─────────────────────────
export type {
  AmxUid, Identity, Person, ProfessionalIdentity, Organization,
  Employment, WorkSchedule, ShiftPattern, LeaveBalance,
  Department, Ward, Clinic, Theatre, Unit,
  Assignment, AssignmentLocation,
  Role, Permission, ResourceType, Action, PermissionScope, PermissionCondition,
  Responsibility, ResponsibilityType,
  DigitalSignature, AuditEntry,
  DashboardTemplate, DashboardSection, DashboardItem, QuickAction, DashboardNotification, DashboardLink,
  UserSession,
  OrganizationBranch, OrganizationConfig, DocumentHeaderConfig, BrandingConfig,
  ClinicalConfig, BillingConfig, IntegrationConfig, OrganizationLicense,
  PricingTier, DepartmentType,
  ProfessionalCategory, MedicalSpecialty, Qualification,
  OrganizationType, OrganizationLevel,
  ProfessionalIdentity as ConstitutionProfessional,
  EmploymentStatus,
  WorkflowDefinition, WorkflowStep, BranchingRule, WorkflowTrigger,
  ClinicalWorkflowType,
  AssignmentType,
  SecurityKey, EmergencyContact, Address,
} from './constitution/types';
export type {
  VerificationLevel, VerificationState, VerificationLevelInfo,
} from './constitution/verification';
export type {
  RecoveryRequest, RecoveryEvent,
} from './constitution/recovery';
export type {
  SessionToken, DeviceInfo,
} from './constitution/session';
export {
  can,
  generateDashboard,
  buildEmptySession,
  validateIdentityStep,
  validateProfessionalStep,
  validateOrganizationCreateStep,
  REGISTRATION_STEPS,
  generateAmxUid, validateAmxUid, getAmxUidType,
  getVerificationLevelLabel, getVerificationRequirements,
  createVerificationState, upgradeVerificationLevel,
  canAccessFeature, getNextRequiredLevel, isVerificationExpired,
  generateRecoveryCode, createRecoveryRequest, initiateRecovery,
  isRecoveryExpired, isRecoveryBlocked, verifyRecoveryCode, getBackupCodes,
  createSessionToken, validateSessionToken, refreshSessionToken,
  computeTrustScore, composeUserSession,
  buildOrgTree, findDepartmentById, getDepartmentChain,
  getBedsInWard, formatAddress, getOrgStats,
  applyBranding, getBrandingPreview,
  createBed, assignBed, releaseBed, markBedCleaned,
  getAvailableBeds, getBedOccupancyReport, getBedsByStatus,
  registerWorker, transferWorker, suspendWorker, terminateWorker,
  getDepartmentStats, getOrgCapacity,
  createShift, clockIn, clockOut, startBreak, endBreak,
  getCurrentShift, getActiveWorkers, getShiftsByDate,
  requestShiftSwap, approveShiftSwap,
  createSchedulePattern, getTodaySchedule, getOnCallWorkers,
  detectScheduleConflicts, generateWeeklyRoster,
  makeAssignment, getCurrentAssignment, getAssignmentQueue,
  startAssignment, completeAssignment, cancelAssignment,
  ASSIGNMENT_TEMPLATES,
  verifyLicense, getExpiredCredentials, addCredential,
  verifyCredential, rejectCredential, checkCredentialExpiry,
  getPendingVerifications,
  getPositionInfo, getPositionAuthority, getSupervisorChain,
  getPositionsByCategory, getAllPositions, canSuperviseLevel,
  evaluatePolicy, evaluatePolicies, createPolicy,
  breakGlassAccess, requireDualAuth, authorizeDual,
  delegateAuthority, revokeDelegation, getActiveDelegations,
  getPatientRelationship,
  generateWorkspace, getWorkspaceModules, ASSIGNMENT_LAYOUTS,
  appendEvent, getPatientTimeline, reconstructState,
  mapToSystem, getConceptDisplay,
  createVersion, addVersion, getVersionHistory, compareVersions,
  indexEntry, search,
} from './constitution';
export type {
  RegistrationStep,
  RegistrationState,
  RegistrationData,
  RegistrationErrors,
  StepConfig,
} from './constitution';

// ── Constitution Services (Firestore, Audit, Signature) ──────────────────────
export {
  createIdentity, getIdentity, updateIdentity,
  createPerson, getPerson, updatePerson,
  createProfessional, getProfessional, updateProfessional,
  createOrganization, getOrganization, updateOrganization,
  createDepartment, getDepartment, listDepartments, deleteDepartment,
  createEmployment, getEmployment, listEmployments,
  createAssignment, getAssignment, listAssignments,
  addOrgMember, getOrgMember, updateOrgMember, removeOrgMember, listOrgMembers,
  createRole, createOrgRole, listRoles,
  createAuditEntry, verifyAuditEntryIntegrity, getAuditLogs, recordAccess,
  signDocument, verifySignature, revokeSignature, getDocumentSignatures,
} from './constitution';

export type { OrgMemberRecord } from './constitution';

// ── Core Types ────────────────────────────────────────────────────────────────
export type * from './encounter-brain/types';

// ── Encounter Brain (single authoritative state) ─────────────────────────────
export {
  createEncounterBrain,
  processAnswer,
  advanceWorkflow,
  getSummary,
  isEncounterComplete,
  addTimelineEvent,
  registerSymptom,
  updateDiseaseStates,
} from './encounter-brain/encounterBrain';

// ── Disease State Objects (live disease tracking) ────────────────────────────
export {
  createDiseaseState,
  applyEvidence,
  computeDangerLevel,
  getDiscriminatingPower,
  updateAllDiseaseStates,
  computeConvergenceState,
} from './encounter-brain/diseaseState';

// ── Master Timeline (single authoritative timeline) ──────────────────────────
export {
  createTimeline,
  addEvent,
  addEvents,
  updateEvent,
  getEventsByType,
  getEventsBetween,
  getSymptomOnset,
  getHealthSeekingTimeline,
  generateTimelineNarrative,
} from './master-timeline/timelineEngine';

// ── Information Gap Engine (priority-based question selection) ───────────────
export {
  computeInformationGaps,
  selectNextGap,
  getGapRationale,
  getStoryGaps,
  selectNextQuestionGroup,
} from './information-gap-engine/informationGapEngine';

// ── Clinical Story Engine (story-aware assessment) ───────────────────────────
export {
  assessStory,
  generateStorySummary,
  getMissingCriticalSections,
  canGenerateNarrative,
} from './clinical-story-engine/clinicalStoryEngine';

// ── Documentation Graph (node-based documentation) ───────────────────────────
export {
  createDocumentationGraph,
  buildDocNodes,
  renderAdmissionNote,
  renderSOAPNote,
  renderDischargeSummary,
  renderHpiNarrative,
  renderReferral,
  renderWardRound,
  generateAllFormats,
} from './documentation-graph/documentationGraph';

// ── Context Rules Engine ─────────────────────────────────────────────────────
export {
  evaluatePatientContext,
  evaluateEncounterContext,
  applyContextRules,
  getContextualIntroduction,
  getIllnessContext,
  getAutoActivatedPathways,
} from './context-rules/contextRules';

// ── HPI Story Rules & Adaptive Question Groups ───────────────────────────────
export {
  generateHpiIntro,
  getUniversalHpiStructure,
  getQuestionGroupsForStep,
  getQuestionPriority,
  organizeIntoConversationBlocks,
} from './context-rules/hpiStoryRules';

// ── Health Seeking Journey Engine ────────────────────────────────────────────
export {
  createHealthSeekingJourney,
  addStep,
  getHealthSeekingNarrative,
  getHealthSeekingGaps,
  getReferralContext,
  getDelayBeforePresentation,
  getSimilarEpisodeHistory,
} from './health-seeking/healthSeekingEngine';

// ── Chronic Disease Engine ───────────────────────────────────────────────────
export {
  createChronicDiseaseObject,
  getChronicDiseaseQuestions,
  getChronicDiseaseIntroduction,
  assessComplicationRisk,
  evaluateSurgicalHistory,
  createPostOperativeState,
  getPostOpQuestions,
  getPostOpNarrative,
} from './chronic-disease/chronicDiseaseEngine';

// ── Functional Status & Frailty Engine ───────────────────────────────────────
export {
  createFunctionalStatus,
  assessFunctionalImpact,
  getFunctionalStatusQuestions,
  getFunctionalStatusNarrative,
  getADLAssessment,
} from './functional-status/functionalStatusEngine';

export {
  assessFrailty,
  getFrailtyQuestions,
  getFrailtyNarrative,
  getDvtProphylaxisRecommendation,
} from './functional-status/frailtyRules';

// ── Symptom Relationships Engine ─────────────────────────────────────────────
export {
  createSymptomRelationship,
  detectRelationships,
  getRelationshipNarrative,
  getRelationshipGaps,
  buildCausalGraph,
} from './symptom-relationships/symptomRelationshipsEngine';

// ── Workflow Engine (Real Doctor Workflow) ───────────────────────────────────
export {
  createWorkflow,
  getCurrentStepMeta,
  advanceToNextStep,
  canAdvance,
  getWorkflowProgress,
  getWorkflowTimeline,
  getStepQuestions,
  getAdaptiveQuestionGroups,
} from './workflow/workflowEngine';

// ── Examination System (Physical Examination Engine) ──────────────────────
// Follows Hutchison's approach. Currently GI. Extends to all systems.

export type {
  ExamFieldType, ExamPhase, FindingSignificance,
  ExamField, ExamSchema, NextExamStep, ExamCompletenessResult,
} from './encounter';

export {
  // Schemas
  EXAM_SCHEMAS, GI_EXAM_SCHEMA,
  getExamSchema, getMandatoryExamFields,
  getCriticalExamFields, getUnansweredExamFields,
  getExamFieldsForPhase,
  getExamSystemsActivatedBySymptom, getExamSystemsActivatedByCC,
  // Engine
  getNextExamStep, getAllPendingExamSteps,
  getActiveExamSystems, getCurrentExamPhase,
  getExamCompleteness, EXAM_PHASE_ORDER,
  // Narrative
  buildGiExamNarrative, buildGiExamSummary,
} from './encounter';

export type { GiExam } from './encounter/encounterState';

// ── Clinical Reasoning Engines (Domain-Specific Medical Knowledge) ──────────
export {
  getAbdominalPainDdx,
  getAbdominalPainPatterns,
  getSystemCategories,
  getBiodataAdjustedPriors as getAbdominalPriors,
  getSocratesGaps,
  getAbdominalPainRedFlagGaps,
  getAbdominalPainPatternGaps,
} from './clinical-reasoning/abdominalPainReasoning';

export {
  getGiBleedingDdx,
  getGiBleedingPatterns,
  getBleedingSocratesProfile,
  getBiodataAdjustedBleedingPriors,
  localizeBleedingSource,
  assessBleedingSeverity,
  getGiBleedingGaps,
  getGiBleedingPatternGaps,
} from './clinical-reasoning/giBleedingReasoning';

export {
  getAllJaundiceDiseases,
  getJaundiceDiseasesByCategory,
  getPreHepatic,
  getHepaticCellular,
  getHepaticCholestatic,
  getPostHepatic,
  getOtherJaundice,
  getJaundicePatterns,
  classifyBilirubinType,
  getJaundiceGaps,
  getJaundicePatternGaps,
} from './clinical-reasoning/jaundiceReasoning';

export {
  getConstipationDdx,
  getConstipationPatterns,
  getConstipationByPathway,
  getBiodataAdjustedConstipationPriors,
  classifyConstipationPathway,
  getConstipationGaps,
  getConstipationPatternGaps,
} from './clinical-reasoning/constipationReasoning';

export {
  getClinicalReasoningGaps,
  getActiveClinicalDomains,
  getPrimaryClinicalDomain,
  getBiodataPriorsForAll,
  getClinicalReasoningSummary,
  assessGiBleedingFromState,
  assessJaundiceFromState,
  assessConstipationFromState,
} from './clinical-reasoning/clinicalReasoningOrchestrator';

// ═══════════════════════════════════════════════════════════════════════════════
// CLINICAL CONSTITUTION — Book II (Patient Journey, Encounter, Workflow)
//                    — Book III (Doctor ADOS)
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  // Book II Vol IV: Care Team
  CareTeamContext, CareTeamProfession, CareTeamShift, CareTeamAssignment,
  CareTeamAssignmentType, CareTeamLocation,
  CareTeamWorkspace, CareTeamQuickAction, CareTeamRightPanelConfig,
  CareTeamNotification, CareTeamHandoverNote,
  // Book II Vol I: Patient Journey
  ClinicalFact, ClinicalObservation, Provenance,
  EpisodeOfCare, EpisodeType, EpisodeStatus,
  PatientJourney, CareNetwork, CareTeamMember,
  PatientGoal, GoalProgressNote,
  NetworkOrganization, NetworkProvider,
  ConsentDirective, ConsentScope,
  TrustLayer, PatientContributedCategory,
  ClinicianAuthenticatedCategory, VerifiedExternalCategory,
  CareGap, CareGapType,
  // Book II Vol II: Encounter
  Encounter, EncounterClass, EncounterType, EncounterState,
  EncounterTrigger, EncounterPreparation, EncounterInteraction,
  EncounterDecision, EncounterDecisionType, EncounterAction,
  EncounterClosure, EncounterOutcome, FollowUpPlan,
  EncounterTimelineEvent, EncounterParticipant,
  EncounterNote, EncounterNoteType, PatientSummary, ContextAlert,
  ProfessionalContribution, PatientInput,
  // Book II Vol III: Workflow
  PrimaryClinicalState, ClinicalOwnership, OwnershipEntry, OwnershipTransfer,
  WorkflowInstance, WorkflowType, WorkflowPriority,
  ClinicalQueue, QueueItem, QueueType,
  ClinicalTask, TaskType, TaskEscalation,
  WorkflowDependency, EscalationPolicy,
  // Book III Vol I: Doctor
  DoctorContext, DoctorShift, DoctorAssignment, DoctorLocation,
  ActivePatient, DoctorWorkspace, WorkspaceType,
  WardRound, WardRoundPatient, PatientPresentation,
  DoctorNotification, AIAssistantState, HandoverNote, HandoverPatient,
} from './clinical-constitution';

export {
  // ── Care Team Engine (Book II Vol IV) ──
  buildCareTeamContext, generateCareTeamWorkspace,
  getAvailableWorkspaces, getProfessionLabel,
  triageCareTeamNotifications,
  createCareTeamHandover, acknowledgeCareTeamHandover,
  generateCareTeamEndOfShiftSummary, answerCareTeamADOSQuestions,
  updateCareTeamAI, addCareTeamAIAction, clearCareTeamAIActions,
  // ── Patient Journey Engine ──
  createClinicalFact, createEpisode,
  createPatientJourney as createPatientJourneyRecord,
  buildTimeline, filterByTrustLayer, detectCareGaps,
  createCareNetwork, createConsentDirective,
  // ── Encounter Engine ──
  createEncounter, transitionEncounter, setPreparation,
  startInteraction, addNote, addContribution, addPatientInput,
  makeDecision, addAction, completeAction, closeEncounter,
  createTimelineEvent, generateFollowUpReminders,
  // ── Workflow Engine ──
  createWorkflowInstance, transitionPatient,
  transferPatientOwnership, acceptTransfer,
  createQueue, addToQueue, reorderByPriority,
  createTask, assignTask,
  getAdmissionTaskBundle, getDischargeTaskBundle, getOperationTaskBundle,
  checkDependencies, createEscalationPolicy, checkEscalation, escalateTask,
  checkClinicalClock, computeWorkflowHealth,
  // ── Doctor ADOS ──
  buildDoctorContext, generateDoctorWorkspace,
  // ── Doctor Specialist Engine (Book III Vol II) ──
  buildSpecialistContext,
  getSpecialtyWorkspace, hasSpecialtyWorkspace,
  getAvailableSpecialtyAssignments, getSpecialtyWorkflowTemplates,
  getSupportedSpecialties,
  createWardRound, startWardRound, nextPatient, reviewPatient,
  buildPresentation, createHandover, acknowledgeHandover,
  updateAISuggestions, addAIAction, clearAIActions,
  triageNotifications, generateEndOfShiftSummary, answerADOSQuestions,
  // ── Constitution Bridge (Volume XIII wiring) ──
  generateKernelAmxUid,
  doctorContextFromSession,
  careTeamContextFromSession,
  generateDoctorWorkspaceFromKernel,
  generateCareTeamWorkspaceFromKernel,
  bridgeCreateFact,
  bridgeCreateEncounter,
  // ── Firestore Persistence ──
  firestoreCreatePatientJourney, getPatientJourney,
  createFact, getFact, listFacts,
  firestoreCreateEpisode, getEpisode, updateEpisode, listEpisodes,
  saveCareNetwork, saveConsent, listConsents,
  firestoreCreateEncounter, getEncounter, updateEncounter,
  listEncounters, listPatientEncounters,
  addEncounterTimelineEvent, getEncounterTimeline,
  firestoreCreateWorkflow, updateWorkflow, getWorkflow,
  listActiveWorkflows, listWorkflowsByState,
  saveQueue, getQueue, listQueues,
  firestoreCreateTask, updateTask,
  listTasksByAssignee, listEscalatedTasks,
  getPatientCurrentState,
  saveWardRound, getActiveWardRound,
  saveHandover, getPendingHandovers,
  // Care Team Persistence
  saveCareTeamWorkspace, getCareTeamWorkspace,
  saveCareTeamHandover, getPendingCareTeamHandovers,
  saveCareTeamNotifications, getCareTeamNotifications,
  listCareTeamByProfession,
} from './clinical-constitution';

// ═══════════════════════════════════════════════════════════════════════════════
// HMIS Constitution — Universal Hospital Information Management System
// ═══════════════════════════════════════════════════════════════════════════════

export * from './hmis';

// ═══════════════════════════════════════════════════════════════════════════════
// Patient Constitution — APOS (AMEXAN Patient Operating System)
// Volumes I–V: Identity, Registration, Journey, Care Service, Family, Seed
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  AmxpId, PatientIdentity, HumanIdentity, AuthenticationIdentity,
  VerificationIdentity, ClinicalIdentity, TrustIdentity, LinkedAccount,
  ActiveSession, AuthMethod as PatientAuthMethod,
  PatientAddress, EmergencyContactPerson, VerificationDocument,
  PatientVerificationLevel, RegistrationStage,
  CareService, ServiceRequirement, ServiceBilling,
  ServiceCommunication, ServiceOutcome, ServiceFeedback,
  JourneyObject, JourneyType, JourneyTask, JourneyAlert,
  MonitoringParameter, EducationModule, EmergencyPlan,
  PatientDashboardConfig, FamilyRelationship, FamilyPermission,
  SeedProfile, SeedRole, SeedPatientProfile, SeedConfig,
  SeedOrganization, SeedClinician, SeedNurse, SeedPatient,
  SeedStudent, SeedSubscription, SeedVerificationState,
} from './patient-constitution';
export {
  generateAmxpId, isValidAmxpId,
  VERIFICATION_LABELS, REGISTRATION_STAGE_LABELS,
  createEmptyPatientIdentity,
  determineVerificationLevel,
  linkPatientAccount, unlinkPatientAccount,
  checkFamilyPermission, addClinicalIdentity,
  registerDevice, createSession as patientCreateSession,
  revokeSession, generateAmxpIdForTemp, mergeTempIdentity,
  createJourney, addJourneyEvent, addMilestone, completeMilestone,
  addGoal, updateGoalProgress, addTask, completeTask,
  addCareTeamMember, addMonitoringParameter, addEducationModule,
  addAlert, acknowledgeAlert, setEmergencyPlan,
  initializeJourneyDefaults, getJourneyPriority,
  buildPatientDashboard, determineJourneyTypesFromConditions,
  generateWelcomeJourneys,
  createCareService, transitionService, addServiceRequirement,
  setServiceBilling, addServiceCommunication,
  markCommunicationDelivered, setServiceOutcome, setServiceFeedback,
  getServiceProgress, getPatientFacingStatus,
  getBundlesForJourney, estimateBundleCost, CARE_BUNDLES,
  createRegistrationState, validateStage1, validateStage2,
  validateStage3, canAdvanceStage, getNextStage, getStageLabel,
  getStageDescription, getStageProgress, generateTempPatientId,
  isRegistrationComplete,
  COUNTRIES, BLOOD_GROUPS, ID_TYPES, LANGUAGES, KENYA_COUNTIES,
  addFamilyMember, removeFamilyMember,
  getDefaultPermissionsForRelationship, canAccessPatientData,
  getEmergencyContacts, createFamilyTree,
  RELATIONSHIP_LABELS, PERMISSION_LABELS,
  getDeveloperSeedConfig, getMinimalSeedConfig,
  getTeachingHospitalSeedConfig, getSeedProfileByEmail,
  getAllSeedEmails, getDemoCasePatients,
} from './patient-constitution';
