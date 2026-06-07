export { reasonLbo } from './lbo-reasoning-engine';
export type { LboPatientData, LboReasoningOutput } from './lbo-reasoning-engine';

export {
  generateLboHpi,
  generateLboExamNarrative,
  generateLboOperativeNote,
  generateLboDischargeSummary,
  generateLboWardRound,
} from './lbo-documentation';

export {
  getCurrentStateIndex,
  canTransitionTo,
  getNextRequiredState,
  getWorkflowStateInfo,
} from './lbo-workflow';
export type { LboWorkflowState, WorkflowStateInfo } from './lbo-workflow';

export {
  calculateLboScore,
  checkLboRedFlags,
  generateLboManagement,
  interpretAxr,
  interpretCt,
} from '../../clinical-rules/lbo';

export type {
  LboScoringInput,
  LboScoreResult,
  VitalsInput,
  LabInput,
  ExamInput,
  RedFlagResult,
  LboManagementInput,
  ManagementPlan,
  ManagementPhase,
  LboSubtype,
  UrgencyLevel,
  AxrResult,
  CtResult,
  ImagingFinding,
} from '../../clinical-rules/lbo';

// ── Reasoning Layer ─────────────────────────────────────────────────────────
export {
  detectMissingData,
  detectContradictions,
  explainDecision,
  decideOperativeApproach,
  renderPdfText,
  buildClerkingPdf,
  buildOperativeNotePdf,
  buildDischargeSummaryPdf,
} from './reasoning';

export type {
  MissingDataItem,
  MissingDataResult,
  PatientDataPresence,
  ClinicalFinding,
  Contradiction,
  ContradictionResult,
  ExplainableDecision,
  DecisionExplanation,
  DecisionStep,
  ExplainInput,
  OperativeDecisionInput,
  OperativeDecisionResult,
  OperativeOption,
  OperativeIndicationUrgency,
  PdfDocument,
  PdfSection,
} from './reasoning';

// ── Safety Layer ────────────────────────────────────────────────────────────
export { assessSepsis, assessIschemia } from './safety';
export type { SepsisInput, SepsisResult } from './safety/sepsis-detector';
export type { IschemiaInput, IschemiaResult } from './safety/ischemia-detector';

// ── Systemic Monitor ────────────────────────────────────────────────────────
export { assessSystemicRisks } from './systemic-monitor/systemic-overlay';
export type { PatientBaseline, SystemicOverlayResult, SystemicAlert } from './systemic-monitor/systemic-overlay';

// ── Bayesian Scoring ────────────────────────────────────────────────────────
export { updateProbability, getUpdatedDdx, bayesianUpdate, LBO_FINDING_PARAMETERS } from './scoring/bayesian-update';
export type { BayesianInput, BayesianResult } from './scoring/bayesian-update';

// ── Event Bus ───────────────────────────────────────────────────────────────
export { LboEventBus, createLboEvent, emitLabResult, emitImagingResult, emitStateTransition, emitRedFlag } from './event-bus/lbo-event-bus';
export type { LboEventType, LboEvent, EventHandler, EventSubscription } from './event-bus/lbo-event-bus';

// ── Language Engine ─────────────────────────────────────────────────────────
export { fillTemplate, buildSentence, buildNarrative, getClinicalTone } from './language-engine/lbo-language-engine';
export type { PhraseTemplate, SentenceBuilderInput, NarrativeFlowStep } from './language-engine/lbo-language-engine';

// ── Safety barrels ──────────────────────────────────────────────────────────
export { assessSepsis as assessSepsisFn } from './safety/sepsis-detector';
export { assessIschemia as assessIschemiaFn } from './safety/ischemia-detector';

// ── API ─────────────────────────────────────────────────────────────────────
export { runLboEngine } from './api/lbo-api';
export type { LboApiOutput } from './api/lbo-api';
