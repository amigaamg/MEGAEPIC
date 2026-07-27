// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK IV
// HISTORY OF PRESENTING ILLNESS ENGINE
// NOT a question collector.
// A Clinical Evidence Acquisition Engine.
// ═══════════════════════════════════════════════════════════════
// Constitutional Principle I:
//   HPI is not documentation.
//   It is dynamic clinical evidence acquisition.
//   Every question must answer: which uncertainty am I reducing?
// Constitutional Principle II:
//   Every symptom becomes a Living Clinical Object.
// ═══════════════════════════════════════════════════════════════

import type { AgeGroup, Sex, ModuleType } from './registration-engine/types';

// ─────────────────────────────────────────────────────────────────
// SYMPTOM OBJECT — the living clinical object for every symptom
// ─────────────────────────────────────────────────────────────────

export interface SymptomIdentity {
  canonicalName: string;
  patientWording: string;
  aliases: string[];
  snomed?: string;
  icd10?: string;
  organSystem: string;
  bodySystem: string;
}

export type ModeOfOnset = 'sudden' | 'gradual' | 'unknown' | 'since_birth' | 'post_surgery' | 'post_trauma' | 'during_pregnancy' | 'postpartum';
export type TemporalPattern = 'continuous' | 'intermittent' | 'waxing_waning' | 'relapsing' | 'paroxysmal' | 'nocturnal' | 'diurnal_variation';
export type ProgressionTrend = 'improving' | 'worsening' | 'static' | 'waxing_waning' | 'intermittent' | 'relapsing' | 'unknown';

export interface SymptomTimeline {
  firstOnset: string | null;
  modeOfOnset: ModeOfOnset;
  pattern: TemporalPattern;
  progression: ProgressionTrend;
  durationDays: number | null;
  durationText: string | null;
  peakIntensityDate: string | null;
  currentState: string | null;
  previousEpisodes: number;
  recoveryPeriods: string[];
  chronology: { date: string; event: string; severity: number }[];
  recurrence: 'first' | 'recurrent' | 'chronic' | 'unknown';
  evolution: string;
}

export interface SymptomSeverity {
  score: number | null;
  scale: '0-10' | 'mild_moderate_severe' | 'subjective';
  interferesWithDaily: boolean;
  impact: string;
}

export interface SymptomAssociatedFeatures {
  symptoms: string[];
  signs: string[];
  complications: string[];
  relationships: SymptomRelationship[];
}

export interface SymptomRelationship {
  targetSymptomId: string;
  relationshipType: 'caused' | 'associated' | 'led_to' | 'aggravated' | 'relieved' | 'preceded' | 'followed' | 'concurrent';
  strength: number;
  direction: 'unidirectional' | 'bidirectional';
}

export interface SymptomActions {
  treatmentsTried: string[];
  medicationsUsed: string[];
  investigationsDone: string[];
  consultedBefore: boolean;
  selfManagement: string[];
  responseToTreatment: string;
}

export interface SymptomContext {
  aggravatingFactors: string[];
  relievingFactors: string[];
  relationToMeals: 'unrelated' | 'before' | 'during' | 'after' | 'empty_stomach' | null;
  relationToPosture: string | null;
  relationToBowel: string | null;
  relationToUrination: string | null;
  relationToMenstruation: string | null;
  relationToActivity: string | null;
  relationToSleep: string | null;
  relationToStress: string | null;
}

export interface SymptomRiskFactors {
  ageRelated: boolean;
  sexRelated: boolean;
  genetic: string[];
  environmental: string[];
  occupational: string[];
  lifestyle: string[];
  previousIllnesses: string[];
  medications: string[];
}

export interface SymptomImportantNegatives {
  symptomIds: string[];
  freeText: string[];
}

export type ClinicalConfidence = 'confirmed' | 'high' | 'moderate' | 'low' | 'suspected' | 'unknown';

export interface SymptomEvidence {
  factIds: string[];
  confidence: ClinicalConfidence;
  supportingMechanisms: string[];
  supportingPhenotypes: string[];
  contradictingMechanisms: string[];
  informationGainScore: number;
}

export interface SymptomSummary {
  oneLiner: string;
  keyFeatures: string[];
  redFlags: string[];
  unresolvedAspects: string[];
}

export interface SymptomObject {
  id: string;
  encounterId: string;
  patientId: string;
  identity: SymptomIdentity;
  timeline: SymptomTimeline;
  characterization: Record<string, unknown>;
  severity: SymptomSeverity;
  location: SymptomLocation | null;
  associatedFeatures: SymptomAssociatedFeatures;
  context: SymptomContext;
  riskFactors: SymptomRiskFactors;
  actions: SymptomActions;
  importantNegatives: SymptomImportantNegatives;
  mechanisms: MechanismActivation[];
  phenotypes: PhenotypeActivation[];
  evidence: SymptomEvidence;
  summary: SymptomSummary;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomLocation {
  primary: string;
  radiation: string[];
  migration: string[];
  bodyMapCoordinates?: { x: number; y: number }[];
  depth: 'superficial' | 'deep' | 'both' | 'unknown';
  laterality: 'left' | 'right' | 'bilateral' | 'midline' | 'diffuse' | 'unknown';
}

// ─────────────────────────────────────────────────────────────────
// FACT SYSTEM — the single source of truth
// Questions are merely one method of acquiring facts.
// Everything downstream consumes Facts, not question responses.
// ─────────────────────────────────────────────────────────────────

export type FactSource = 'patient' | 'clinician' | 'family' | 'record' | 'device' | 'lab' | 'imaging' | 'referral' | 'ai_inference';
export type FactCategory = 'symptom' | 'sign' | 'history' | 'risk_factor' | 'investigation' | 'diagnosis' | 'management' | 'demographic' | 'contextual';

export interface FactObject {
  id: string;
  encounterId: string;
  patientId: string;
  category: FactCategory;
  symptomId: string | null;
  attribute: string;
  value: unknown;
  unit: string | null;
  confidence: number;
  source: FactSource;
  authorId: string | null;
  timestamp: string;
  isActive: boolean;
  isStale: boolean;
  previousValue: unknown | null;
  replacedByFactId: string | null;
  relationships: FactRelationship[];
  metadata: Record<string, unknown>;
}

export interface FactRelationship {
  targetFactId: string;
  type: 'supports' | 'contradicts' | 'causes' | 'associated' | 'treats' | 'diagnoses' | 'excludes';
  strength: number;
}

export interface FactGraph {
  patientId: string;
  encounterId: string;
  facts: Map<string, FactObject>;
  relationships: FactRelationship[];
  lastUpdated: string;
}

// ─────────────────────────────────────────────────────────────────
// MECHANISM SYSTEM
// Symptoms activate mechanisms. Never diagnoses directly.
// ─────────────────────────────────────────────────────────────────

export type MechanismCategoryUniversal =
  | 'infectious' | 'inflammatory' | 'autoimmune' | 'neoplastic'
  | 'vascular' | 'ischemic' | 'hemorrhagic' | 'traumatic'
  | 'degenerative' | 'congenital' | 'metabolic' | 'endocrine'
  | 'toxic' | 'idiopathic' | 'functional' | 'obstructive'
  | 'restrictive' | 'ventilatory' | 'cardiac' | 'neurological'
  | 'psychogenic' | 'iatrogenic' | 'nutritional' | 'allergic'
  | 'thrombotic' | 'embolic' | 'infiltrative' | 'mechanical'
  | 'pharmacologic' | 'environmental';

export interface MechanismActivation {
  mechanism: MechanismCategoryUniversal;
  probability: number;
  evidenceFactIds: string[];
  confidence: ClinicalConfidence;
  isActive: boolean;
  supportingSymptoms: string[];
  competingMechanisms: string[];
  informationGainPotential: number;
}

// ─────────────────────────────────────────────────────────────────
// PHENOTYPE SYSTEM
// Mechanisms → Phenotypes. Phenotypes are strong evidence clusters.
// ─────────────────────────────────────────────────────────────────

export interface PhenotypeActivation {
  phenotypeId: string;
  label: string;
  mechanism: MechanismCategoryUniversal;
  probability: number;
  evidenceFactIds: string[];
  requiredFeatures: string[];
  observedFeatures: string[];
  absentFeatures: string[];
  confidence: ClinicalConfidence;
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────
// QUESTION SYSTEM
// Every question has rich metadata.
// ─────────────────────────────────────────────────────────────────

export type InputType = 'single_choice' | 'multi_choice' | 'numeric' | 'slider' | 'text' | 'date' | 'time' | 'boolean' | 'body_map' | 'anatomy_search' | 'voice' | 'auto_derived';
export type QuestionPriority = 'critical' | 'essential' | 'standard' | 'helpful' | 'optional' | 'never_ask';
export type AnswerSource = 'direct' | 'inferred' | 'calculated' | 'imported' | 'default';

export interface QuestionOption {
  value: string;
  label: string;
  snomed?: string;
  documentationPhrase: string;
  evidenceImpact: Record<string, number>;
  mechanismImpact: Record<string, number>;
  phenotypeImpact: Record<string, number>;
  triggerField?: string;
  triggerValue?: unknown;
}

export interface QuestionObject {
  id: string;
  text: string;
  clinicalPurpose: string;
  inputType: InputType;
  options: QuestionOption[] | null;
  rangeMin: number | null;
  rangeMax: number | null;
  defaultValue: unknown;
  unit: string | null;
  applicableAges: AgeGroup[];
  applicableSex: Sex[];
  applicableContexts: string[];
  required: boolean;
  unknownAllowed: boolean;
  notApplicableAllowed: boolean;
  priority: QuestionPriority;
  mechanismSupported: MechanismCategoryUniversal[];
  phenotypeSupported: string[];
  diagnosesSupported: string[];
  dependencies: string[];
  conflicts: string[];
  repeatRule: 'never' | 'on_new_encounter' | 'if_stale' | 'on_value_change';
  terminationRule: 'once_answered' | 'once_confident' | 'once_excluded' | 'always_ask';
  confidenceGain: number;
  negativeValue: unknown;
  positiveValue: unknown;
  expectedAnswerType: string;
  documentationRule: string;
  hideWhen: string[];
  showWhen: string[];
  informationGainWeight: number;
  safetyPriority: number;
  specialtyRules: Record<string, boolean>;
}

export interface QuestionAnswer {
  questionId: string;
  value: unknown;
  source: AnswerSource;
  confidence: number;
  timestamp: string;
  authorId: string;
  factId: string;
}

// ─────────────────────────────────────────────────────────────────
// ADAPTIVE QUESTION TREE
// Questions form decision trees, not linear lists.
// ─────────────────────────────────────────────────────────────────

export interface QuestionTreeNode {
  question: QuestionObject;
  branches: QuestionBranch[];
  priority: QuestionPriority;
  isEntryPoint: boolean;
}

export interface QuestionBranch {
  condition: { field: string; operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between'; value: unknown };
  nextNode: QuestionTreeNode | null;
  targetDiagnosisBranch: string | null;
}

export interface QuestionTree {
  rootNodeId: string;
  nodes: Map<string, QuestionTreeNode>;
  symptomIds: string[];
  activatedByMechanisms: MechanismCategoryUniversal[];
}

// ─────────────────────────────────────────────────────────────────
// UNCERTAINTY AND EVIDENCE SYSTEM
// ─────────────────────────────────────────────────────────────────

export interface DiagnosticHypothesis {
  diagnosisId: string;
  label: string;
  icd10: string | null;
  probability: number;
  priorProbability: number;
  evidenceFactIds: string[];
  supportingFacts: number;
  contradictingFacts: number;
  mechanismPath: MechanismCategoryUniversal[];
  phenotypePath: string[];
  urgency: 'critical' | 'urgent' | 'non_urgent' | 'elective';
  confidence: ClinicalConfidence;
  informationGainPotential: number;
  questionsToResolve: string[];
  investigationsToResolve: string[];
}

export interface UncertaintyState {
  hypotheses: DiagnosticHypothesis[];
  totalHypotheses: number;
  activeMechanisms: MechanismActivation[];
  activePhenotypes: PhenotypeActivation[];
  resolvedMechanisms: string[];
  resolvedPhenotypes: string[];
  remainingUncertainty: number;
  diagnosticConfidence: number;
  isClinicallyAcceptable: boolean;
  nextBestQuestion: QuestionObject | null;
  stoppingCriteria: StoppingCriteriaMet[];
}

export interface StoppingCriteriaMet {
  criterion: string;
  met: boolean;
  threshold: number;
  currentValue: number;
}

// ─────────────────────────────────────────────────────────────────
// CONSTITUTIONAL PRINCIPLES ENFORCEMENT
// ─────────────────────────────────────────────────────────────────

export const HPI_PRINCIPLES = {
  hpiIsEvidenceAcquisition: true,
  symptomsAreLivingObjects: true,
  factsNotQuestions: true,
  mechanismsNotDiagnoses: true,
  evidenceOverAnswers: true,
  uncertaintyDriveQuestions: true,
  documentationIsByproduct: true,
  narrativeGrowsNeverRegenerates: true,
} as const;

export const MECHANISM_TO_SYMPTOM_MAP: Partial<Record<MechanismCategoryUniversal, string[]>> = {
  infectious: ['fever', 'cough', 'diarrhea', 'vomiting', 'headache', 'rash'],
  inflammatory: ['abdominal_pain', 'chest_pain', 'joint_pain', 'headache'],
  neoplastic: ['weight_loss', 'fatigue', 'mass', 'bleeding', 'pain'],
  vascular: ['chest_pain', 'headache', 'abdominal_pain', 'leg_pain'],
  obstructive: ['dyspnea', 'abdominal_pain', 'vomiting', 'constipation'],
  traumatic: ['pain', 'bleeding', 'swelling', 'deformity'],
  metabolic: ['fatigue', 'weight_change', 'altered_consciousness', 'polyuria'],
  cardiac: ['chest_pain', 'dyspnea', 'palpitations', 'syncope', 'edema'],
  neurological: ['headache', 'seizure', 'weakness', 'numbness', 'dizziness', 'syncope'],
  psychogenic: ['palpitations', 'chest_pain', 'dizziness', 'fatigue', 'pain'],
  allergic: ['rash', 'dyspnea', 'swelling', 'itching'],
  autoimmune: ['joint_pain', 'rash', 'fatigue', 'fever'],
  endocrine: ['fatigue', 'weight_change', 'polyuria', 'palpitations'],
  toxic: ['vomiting', 'altered_consciousness', 'seizure', 'diarrhea'],
};

export function createEmptySymptomObject(id: string, encounterId: string, patientId: string): SymptomObject {
  return {
    id,
    encounterId,
    patientId,
    identity: {
      canonicalName: '', patientWording: '', aliases: [],
      organSystem: '', bodySystem: '',
    },
    timeline: {
      firstOnset: null, modeOfOnset: 'unknown', pattern: 'continuous',
      progression: 'unknown', durationDays: null, durationText: null,
      peakIntensityDate: null, currentState: null, previousEpisodes: 0,
      recoveryPeriods: [], chronology: [], recurrence: 'unknown', evolution: '',
    },
    characterization: {},
    severity: { score: null, scale: '0-10', interferesWithDaily: false, impact: '' },
    location: null,
    associatedFeatures: { symptoms: [], signs: [], complications: [], relationships: [] },
    context: {
      aggravatingFactors: [], relievingFactors: [],
      relationToMeals: null, relationToPosture: null,
      relationToBowel: null, relationToUrination: null,
      relationToMenstruation: null, relationToActivity: null,
      relationToSleep: null, relationToStress: null,
    },
    riskFactors: {
      ageRelated: false, sexRelated: false, genetic: [],
      environmental: [], occupational: [], lifestyle: [],
      previousIllnesses: [], medications: [],
    },
    actions: {
      treatmentsTried: [], medicationsUsed: [], investigationsDone: [],
      consultedBefore: false, selfManagement: [], responseToTreatment: '',
    },
    importantNegatives: { symptomIds: [], freeText: [] },
    mechanisms: [],
    phenotypes: [],
    evidence: {
      factIds: [], confidence: 'unknown',
      supportingMechanisms: [], supportingPhenotypes: [],
      contradictingMechanisms: [], informationGainScore: 0,
    },
    summary: { oneLiner: '', keyFeatures: [], redFlags: [], unresolvedAspects: [] },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createFactObject(
  id: string, encounterId: string, patientId: string,
  category: FactCategory, attribute: string, value: unknown,
  source: FactSource, symptomId: string | null = null,
  confidence: number = 1.0,
): FactObject {
  return {
    id, encounterId, patientId, category, symptomId,
    attribute, value, unit: null, confidence, source,
    authorId: null, timestamp: new Date().toISOString(),
    isActive: true, isStale: false,
    previousValue: null, replacedByFactId: null,
    relationships: [], metadata: {},
  };
}
