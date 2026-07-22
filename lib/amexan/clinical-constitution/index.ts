// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Public API
// Book II: Clinical Constitution (Volumes I-III)
// Book III: Doctor Constitution (Volume I)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────────────────
export type * from './types';

// ── Care Team Context Engine (Book II Vol IV) ─────────────────────────────────
export {
  buildCareTeamContext,
  generateCareTeamWorkspace,
  getAvailableWorkspaces,
  getProfessionLabel,
  triageCareTeamNotifications,
  createCareTeamHandover,
  acknowledgeCareTeamHandover,
  generateCareTeamEndOfShiftSummary,
  answerCareTeamADOSQuestions,
  updateCareTeamAISuggestions as updateCareTeamAI,
  addCareTeamAIAction,
  clearCareTeamAIActions,
} from './care-team-context-engine';

// ── Doctor Specialist Engine (Book III Vol II) ────────────────────────────────
export {
  buildSpecialistContext,
  getSpecialtyWorkspace,
  hasSpecialtyWorkspace,
  getAvailableSpecialtyAssignments,
  getSpecialtyWorkflowTemplates,
  getSupportedSpecialties,
} from './doctor-specialist-engine';

export type { SpecialtyWorkspaceOverride, SpecialtyWorkspaceMap, SpecialtyWorkflowTemplate } from './doctor-specialist-engine';

// ── Patient Journey Engine (Book II Vol I) ────────────────────────────────────
export {
  createClinicalFact,
  createEpisode,
  createPatientJourney,
  addFactToJourney,
  addEpisodeToJourney,
  buildTimeline,
  filterByTrustLayer,
  detectCareGaps,
  addGoal,
  updateGoalProgress,
  createCareNetwork,
  createConsentDirective,
} from './patient-journey-engine';

// ── Encounter Engine (Book II Vol II) ─────────────────────────────────────────
export {
  createEncounter,
  transitionEncounter,
  setPreparation,
  startInteraction,
  addNote,
  addContribution,
  addPatientInput,
  makeDecision,
  addAction,
  completeAction,
  closeEncounter,
  createTimelineEvent,
  generateFollowUpReminders,
  generateWorkspace,
} from './encounter-engine';

export type { PreparedWorkspace } from './encounter-engine';

// ── Workflow Engine (Book II Vol III) ─────────────────────────────────────────
export {
  createWorkflowInstance,
  transitionPatient,
  transferPatientOwnership,
  acceptTransfer,
  createQueue,
  addToQueue,
  reorderByPriority,
  createTask,
  assignTask,
  completeTask,
  getAdmissionTaskBundle,
  getDischargeTaskBundle,
  getOperationTaskBundle,
  checkDependencies,
  createEscalationPolicy,
  checkEscalation,
  escalateTask,
  checkClinicalClock,
  computeWorkflowHealth,
} from './workflow-engine';

export type { WorkflowHealthSnapshot } from './workflow-engine';

// ── Doctor Context Engine — ADOS (Book III Vol I) ────────────────────────────
export {
  buildDoctorContext,
  generateWorkspace as generateDoctorWorkspace,
  createWardRound,
  startWardRound,
  nextPatient,
  reviewPatient,
  buildPresentation,
  createHandover,
  acknowledgeHandover,
  updateAISuggestions,
  addAIAction,
  clearAIActions,
  triageNotifications,
  generateEndOfShiftSummary,
  answerADOSQuestions,
} from './doctor-context-engine';

// ── Constitution Bridge (wires clinical engines to Volume XIII kernel) ──────
export {
  generateKernelAmxUid,
  doctorContextFromSession,
  careTeamContextFromSession,
  generateDoctorWorkspaceFromKernel,
  generateCareTeamWorkspaceFromKernel,
  bridgeCreateFact,
  bridgeCreateEncounter,
} from './constitution-bridge';

// ── Firestore Persistence ─────────────────────────────────────────────────────
export {
  // Patient Journey
  createPatientJourney as firestoreCreatePatientJourney,
  getPatientJourney,
  createFact,
  getFact,
  listFacts,
  createEpisode as firestoreCreateEpisode,
  getEpisode,
  updateEpisode,
  listEpisodes,
  saveCareNetwork,
  saveConsent,
  listConsents,
  saveCareGap,
  listCareGaps,
  // Encounters
  createEncounter as firestoreCreateEncounter,
  getEncounter,
  updateEncounter,
  listEncounters,
  listPatientEncounters,
  addEncounterTimelineEvent,
  getEncounterTimeline,
  // Workflows
  createWorkflow as firestoreCreateWorkflow,
  updateWorkflow,
  getWorkflow,
  listActiveWorkflows,
  listWorkflowsByState,
  saveQueue,
  getQueue,
  listQueues,
  createTask as firestoreCreateTask,
  updateTask,
  listTasksByAssignee,
  listEscalatedTasks,
  getPatientCurrentState,
  // Doctor
  saveWardRound,
  getActiveWardRound,
  saveHandover,
  getPendingHandovers,
  // Care Team Persistence
  saveCareTeamWorkspace,
  getCareTeamWorkspace,
  saveCareTeamHandover,
  getPendingCareTeamHandovers,
  saveCareTeamNotifications,
  getCareTeamNotifications,
  listCareTeamByProfession,
} from './persistence';
