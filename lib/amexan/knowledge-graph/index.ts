export {
  default as neo4jService,
  initializeKnowledgeGraph,
  createPatientNode,
  createEncounter,
  addEvidence,
  addProblem,
  resolveProblem,
  createOrder,
  createMedicationOrder,
  createBloodProductOrder,
  createImagingOrder,
  createMonitoring,
  addTimelineEvent,
  addDiagnosis,
  addManagementPlan,
  setDisposition,
  createDiseaseNode,
  linkSymptomToDisease,
  createDrugNode,
  linkDrugToDisease,
  createGuideline,
  createAnatomyNode,
  createScore,
  linkScoreToDisease,
  createReference,
  createProcedure,
  getEncounterTimeline,
  getPatientProblems,
  getActiveMonitoring,
  getDiseaseDdx,
  getKnowledgeGraphStats,
  getWardRoundData,
  addEncounterToLearning,
  getDiseaseAnalytics,
  generateDocument,
  getEvidenceGraphForReasoning,
  getDepartmentSummary,
  runCypherQuery,
} from './neo4jService';

export {
  syncDiseaseNodeToGraph,
  buildKnowledgeGraph,
  queryByFeatureMatch,
  queryDrugsForDiagnosis,
  queryGuidelines,
  queryDifferentialFromEvidence,
  createMonitoringFromProblem,
} from './bridge';

/**
 * The Ultimate Data Flow:
 *
 * ┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
 * │   DiseaseNode│ ───→ │   Neo4j Graph    │ ←─── │  Encounter   │
 * │  (in-memory) │      │  (relationships) │      │   (facts)    │
 * └─────────────┘      └──────────────────┘      └──────────────┘
 *        │                      │                         │
 *        │ syncDiseaseNode      │ queryByFeatureMatch     │ addEvidence
 *        ▼                      ▼                         ▼
 *  Static Knowledge     Dynamic Reasoning         Real-time Data
 *  (symptoms, signs,    (differential, drugs,     (vitals, labs,
 *   scores, guidelines)   guidelines, scores)       orders, outcomes)
 */