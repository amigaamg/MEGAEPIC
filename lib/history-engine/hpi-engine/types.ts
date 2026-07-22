// ── Symptom Types ──────────────────────────────────────────────
export type SymptomCategory =
  | 'pain' | 'fever' | 'vomiting' | 'distension' | 'constipation'
  | 'diarrhea' | 'cough' | 'dyspnea' | 'bleeding' | 'neurological'
  | 'weakness' | 'mass' | 'skin' | 'urinary' | 'psychological'
  | 'trauma' | 'cardiac' | 'endocrine' | 'constitutional' | 'other';

export type Onset = 'sudden' | 'gradual' | 'acute_on_chronic';
export type Course = 'improving' | 'worsening' | 'unchanged' | 'fluctuating';
export type Severity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
export type Chronology = 'before' | 'after' | 'same_time' | 'unknown';

// ── Core Data Types ───────────────────────────────────────────
export interface Duration {
  value: number;
  unit: DurationUnit;
  display: string;
  hours: number;
}

export interface TimelineEvent {
  id: string;
  symptomId: string;
  label: string;
  relativeDay: number;
  absoluteTime?: string;
  detail: string;
}

// ── Exploration Field Types ───────────────────────────────────
export interface ExplorationField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean' | 'date' | 'multi_select';
  options?: string[];
  mandatory: boolean;
  purpose: string;
  ddRelevance?: string[];
  safetyRelevance?: string[];
  triggerConditions?: string[];
  skipIfKnown?: string[];
}

export interface ExplorationTemplate {
  symptomCategory: SymptomCategory;
  name: string;
  coreFields: ExplorationField[];
  associatedSymptomPrompt: string;
  associatedSymptomOptions: { category: SymptomCategory; label: string; triggerCondition?: string }[];
  completionCriteria: string[];
}

// ── Symptom Instance ──────────────────────────────────────────
export interface SymptomInstance {
  id: string;
  category: SymptomCategory;
  label: string;
  verbatim: string;
  isPrimary: boolean;
  parentSymptomId?: string;
  relationshipToParent?: Chronology;
  coreData: Record<string, any>;
  onset?: Onset;
  duration?: Duration;
  course?: Course;
  severity?: Severity;
  timeline: TimelineEvent[];
  explorationComplete: boolean;
  metadata: {
    firstAppearanceDay: number;
    explorationStartedAt?: number;
    explorationCompletedAt?: number;
  };
}

// ── Question Types ────────────────────────────────────────────
export interface Question {
  id: string;
  symptomId: string;
  fieldId: string;
  text: string;
  type: ExplorationField['type'];
  options?: string[];
  purpose: string;
  priority: number;
  ddRelevance: string[];
  safetyRelevance: string[];
  triggerConditions: string[];
  skipIfKnown: string[];
  answered: boolean;
  answer?: any;
  answeredAt?: number;
  skipped: boolean;
  reasonSkipped?: string;
}

// ── Differential Types ────────────────────────────────────────
export interface DifferentialDiagnosis {
  id: string;
  name: string;
  probability: number;
  supporting: string[];
  opposing: string[];
  pendingQuestions: string[];
  complications: string[];
  riskFactors: string[];
  isActive: boolean;
  isExcluded: boolean;
  exclusionReason?: string;
  ruleInThreshold: number;
  ruleOutThreshold: number;
  investigations: string[];
  management: { initial: string[]; definitive: string[] };
  typicalPresentation: string;
}

export interface DifferentialCoverage {
  diagnosisId: string;
  name: string;
  requiredSupporting: string[];
  requiredOpposing: string[];
  supportingCollected: string[];
  opposingCollected: string[];
  riskFactorsCollected: string[];
  complicationsScreened: string[];
  adequateForRuleIn: boolean;
  adequatelyExcluded: boolean;
  coveragePercent: number;
}

// ── HPI State ─────────────────────────────────────────────────
export interface HpiState {
  encounterId: string;
  status: 'not_started' | 'primary_expansion' | 'associated_discovery' | 'associated_expansion' | 'differential_coverage' | 'risk_factor_exploration' | 'care_before_presentation' | 'impact_exploration' | 'current_status' | 'complete' | 'paused';

  symptoms: SymptomInstance[];
  primarySymptomId: string;
  currentSymptomId?: string;

  questions: Question[];
  currentQuestionIndex: number;
  askedQuestionIds: Set<string>;

  differentials: DifferentialDiagnosis[];
  coverage: DifferentialCoverage[];

  timeline: TimelineEvent[];

  sharedData: Record<string, any>;

  riskFactors: Record<string, any>;
  careBeforePresentation: {
    firstSought?: string;
    whereSought?: string;
    treatments?: string[];
    medications?: string[];
    homeRemedies?: string[];
    traditionalRemedies?: string[];
    response?: string;
    referrals?: string[];
  };
  impactOnLife: Record<string, 'normal' | 'impaired' | 'severely_impaired' | 'unable'>;
  currentStatus: {
    trend: 'better' | 'worse' | 'unchanged' | 'fluctuating';
    reasonForVisitToday: string;
    promptedVisit: string;
  };

  completeness: Record<string, boolean>;
  missingMandatory: string[];
  unresolvedAlerts: string[];

  narrative: string;
  lastUpdated: number;
}

// ── Rule Types ────────────────────────────────────────────────
export type RuleSeverity = 'constitutional' | 'mandatory' | 'recommended' | 'contextual';
export type RuleScope = 'global' | 'symptom' | 'differential' | 'stage';

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: RuleSeverity;
  scope: RuleScope;
  category: string;
  condition: string;
  action: string;
  errorMessage?: string;
  appliesToSymptoms?: SymptomCategory[];
  appliesToDiagnoses?: string[];
  appliesToStages?: HpiState['status'][];
}

export interface RuleEvaluation {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: RuleSeverity;
  message?: string;
}

export interface RuleEngineResult {
  evaluations: RuleEvaluation[];
  allPassed: boolean;
  blockingCount: number;
  warningsCount: number;
}

// ── Engine Output ─────────────────────────────────────────────
export interface HpiEngineOutput {
  state: HpiState;
  nextQuestion?: Question;
  questionsRemaining: number;
  completeness: RuleEngineResult;
  narrative: string;
  timeline: TimelineEvent[];
  activeDifferentials: DifferentialDiagnosis[];
}

// ── Encounter Context ─────────────────────────────────────────
export interface EncounterContext {
  patientAge: number;
  patientSex: 'male' | 'female' | 'intersex';
  patientOccupation?: string;
  patientResidence?: string;
  isPregnant?: boolean;
  gestationalAge?: number;
  isPediatric: boolean;
  isNeonatal: boolean;
  isGeriatric: boolean;
  informant: string;
  informantReliability: string;
}
