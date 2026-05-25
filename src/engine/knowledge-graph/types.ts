// ── EXISTING LEGACY TYPES (kept for backward compat) ──────────────────────────

export interface HistoryFeature {
  symptomId: string;
  weight: number;
  condition?: string;
  qualitativeModifiers?: { qualityKey: string; weightBoost: number }[];
  /** NEW: contextual weights that adjust based on vitals/context */
  contextualWeights?: {
    condition: string;
    weightBoost: number;
    favorsSubtype?: string;
  }[];
  /** NEW: marked as a negative predictor — presence REDUCES disease probability */
  negativePredictor?: {
    description: string;
    scoreReduction: number;
    considerMimic?: string[];
  };
  /** NEW: if this feature favors a specific subtype */
  favorsSubtype?: string;
  /** NEW: if this feature should trigger consideration of a mimic */
  considerMimic?: string;
  /** NEW: modifiers array for richer conditions */
  modifiers?: { condition: string; suspectTB?: boolean }[];
}

export interface ExamFeature {
  signId: string;
  baseWeight: number;
  doubleWeight?: boolean;
  condition?: string;
  /** NEW: per-subtype weight modulation */
  subtypeModulation?: Record<string, number>;
  /** NEW: marks this sign as a severity indicator (used by getSeverity) */
  severityIndicator?: boolean;
  /** NEW: severity boost flag */
  severityBoost?: boolean;
  /** NEW: age-dependent threshold */
  ageDependentThresholds?: boolean;
  /** NEW: negative predictor for parent disease */
  negativePredictorForPneumonia?: boolean;
  /** NEW: if present, exclude this disease */
  excludePneumonia?: boolean;
  /** NEW: consider this mimic when sign present */
  considerMimic?: string;
  /** NEW: favours specific subtype */
  favorsSubtype?: string;
}

export interface RiskFactor {
  id: string;
  multiplier: number;
  note?: string;
}

export interface Complication {
  diseaseId: string;
  probability: number;
  lagDays?: [number, number];
  severityBoost: number;
  clues?: string[];
  associatedSubtype?: string;
}

export interface Mimic {
  diseaseId: string;
  discriminators: string[];
  /** NEW: how much this mimic reduces the parent disease score */
  negativeImpactOnParen?: number;
}

// ── NEW ENHANCED TYPES ──────────────────────────────────────────────────────

export interface DangerSign {
  sign: string;
  weight: number;
  description?: string;
}

export interface AgeThreshold {
  ageMonths: [number, number];
  rr: number;
}

export interface SeveritySign {
  sign: string;
  weight: number;
  ageThresholds?: AgeThreshold[];
}

export interface SeverityAssessment {
  immediateDangerSigns: DangerSign[];
  severeCriteria: {
    anyDangerSign: boolean;
    additionalCriteria?: SeveritySign[];
  };
  nonSevereCriteria: {
    hasIndrawingOrFastBreathing: boolean;
    noDangerSigns: boolean;
  };
  severityLabel: string;
}

export interface SubtypeFeature {
  feature: string;
  weight: number;
}

export interface NegativePredictor {
  feature: string;
  weightReduction: number;
}

export interface SubtypeManagement {
  nonSevere?: string;
  severe?: string;
  treatmentFailure48h?: string;
  suspectedStaph?: string;
  management?: string; // for simpler subtypes
}

export interface DiseaseSubtype {
  id: string;
  name: string;
  typicalOrganisms?: string[];
  prevalenceModifier: number;
  agePeak?: [number, number];
  riskFactors?: string[];
  keyFeatures: SubtypeFeature[];
  negativePredictors?: NegativePredictor[];
  imagingFeatures?: string[];
  management: string | SubtypeManagement;
}

export interface InvestigationBedside {
  name: string;
  priority: string;
  yield: number;
  indication: string;
  relevance?: string;
  ageThresholdsNote?: string;
}

export interface InvestigationLab {
  name: string;
  priority: string;
  yield?: number;
  indication: string;
  limitations?: string;
  note?: string;
}

export interface InvestigationImaging {
  name: string;
  priority: string;
  yield?: number;
  cost?: string;
  indication: string;
  typicalFindingsBySubtype?: Record<string, string>;
}

export interface InvestigationAdvanced {
  name: string;
  indication: string;
  priority: string;
}

export interface Investigations {
  bedside?: InvestigationBedside[];
  laboratory?: InvestigationLab[];
  imaging?: InvestigationImaging[];
  advanced?: InvestigationAdvanced[];
}

export interface TreatmentAction {
  actions: string[];
}

export interface TreatmentTrigger {
  timePoint: string;
  ifNoImprovement?: TreatmentAction;
  ifStillSick?: TreatmentAction;
}

export interface TreatmentFailureDef {
  progression_to_severe?: string;
  "48h_failure"?: string;
  day5_failure?: string;
  "chronic_cough_>14d"?: string;
}

export interface ManagementPathway {
  severity: string;
  criteria: string;
  treatment: string | string[];
  counselling?: string;
  reassessment?: string;
}

export interface SpecialConsiderations {
  wheeze_branch?: string;
  HIV_exposed?: string;
  SAM?: string;
}

export interface ManagementDetail {
  protocolReference?: string;
  pathways: ManagementPathway[];
  specialConsiderations?: SpecialConsiderations;
}

export interface TreatmentResponseLogic {
  triggers: TreatmentTrigger[];
}

export interface BranchingQuestion {
  if: string;
  ask: string[];
  note?: string;
  action?: string;
}

export interface AdaptiveQuestioning {
  initialCoreQuestions: string[];
  branching: BranchingQuestion[];
}

export interface MimicDetail {
  diseaseId: string;
  discriminators: string[];
  negativeImpactOnPneumonia?: number;
}

// ── UPDATED MAIN DISEASE NODE ──────────────────────────────────────────────

export interface DiseaseNode {
  id: string;
  name: string;
  system: string;
  alsoPresentIn?: string[];
  agePeak?: [number, number];
  excludedAgeGroups?: string[];
  note?: string;
  prevalenceWeight: number;
  syndromeTags: string[];
  mustNotMiss: boolean;
  emergencyPriority?: string;

  // Severity
  severityAssessment?: SeverityAssessment;

  // Features (legacy)
  historyFeatures?: HistoryFeature[];
  examFeatures?: ExamFeature[];

  // Risk
  riskFactors?: RiskFactor[];
  complications?: Complication[];
  mimics?: Mimic[];

  // Diagnostic logic
  diagnosticClues?: string[];
  exclusionClues?: string[];

  // Subtypes (NEW)
  subtypes?: DiseaseSubtype[];

  // Investigations (enhanced)
  investigations?: InvestigationBedside[] | InvestigationLab[] | InvestigationImaging[] | Investigation[];

  // Management (enhanced)
  management?: ManagementDetail;
  managementProtocols?: ManagementProtocol[];
  treatmentResponseLogic?: TreatmentResponseLogic;

  // Adaptive questioning
  adaptiveQuestioning?: AdaptiveQuestioning;

  // Pathophysiology (informational)
  pathophysiology?: string[];
}

// ── KEPT FOR BACKWARD COMPAT ────────────────────────────────────────────────
export interface Investigation {
  type: string;
  name: string;
  indication: string;
}

export interface ManagementProtocol {
  condition?: string;
  steps: string[];
}
