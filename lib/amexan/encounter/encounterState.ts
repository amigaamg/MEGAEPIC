// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Unified EncounterState — single source of truth
// ═══════════════════════════════════════════════════════════════════════════════
// Every engine reads from this object. No engine maintains its own state.
// No English text stored here — only structured clinical data.
// The DocumentationEngine renders English at the very end.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiseaseNode } from '../knowbase/diseaseNode';
import type { UniversalGeneralExamination } from './examination/examinationTypes';
import type { SystemExaminations } from './examination/systemExaminationTypes';

// ── Clinical Summary State (inline to avoid circular deps) ─────────────────────

export interface ClinicalSummaryState {
  generated: string;
  edited: string;
  isEdited: boolean;
  finalized: boolean;
}

// ── Diagnostic types (inline) ──────────────────────────────────────────────────

export type DiagnosisConfidence = 'suspected' | 'likely' | 'confirmed' | 'ruled_out';
export type DiagnosisCertainty = 'definitive' | 'probable' | 'possible' | 'unlikely';

export interface DiagnosisCardBase {
  id: string;
  diagnosis: string;
  confidence: DiagnosisConfidence;
  certainty: DiagnosisCertainty;
  icd10?: string;
  snomed?: string;
  supportingFindings: string[];
  contradictingFindings: string[];
  missingEvidence: string[];
  requiredInvestigations: string[];
  clinicalReasoning: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProvisionalDiagnosisCard extends DiagnosisCardBase {
  isPrimary: boolean;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  requiresUrgentAction: boolean;
  actionMessage?: string;
}

export interface DifferentialDiagnosisCard extends DiagnosisCardBase {
  rank: number;
  dangerLevel: 'low' | 'moderate' | 'high' | 'critical';
  mustNotMiss: boolean;
  canBecomeProvisional: boolean;
}

export type ProblemCategory =
  | 'symptom' | 'sign' | 'syndrome' | 'diagnosis' | 'risk_factor'
  | 'social' | 'functional' | 'psychiatric' | 'nutritional' | 'other';

export interface ProblemListItem {
  id: string;
  problem: string;
  category: ProblemCategory;
  priority: number;
  dateIdentified: number;
  status: 'active' | 'resolved' | 'monitoring' | 'chronic';
  icd10?: string;
  snomed?: string;
  linkedDiagnosisId?: string;
  notes: string;
}

// ── Management types (inline) ──────────────────────────────────────────────────

export type ManagementCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface ManagementItem {
  id: string;
  category: ManagementCategory;
  description: string;
  detail: string;
  priority: 'stat' | 'urgent' | 'routine';
  assignedTo?: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
  createdAt: number;
  completedAt?: number;
}

export type MedicationRoute = 'oral' | 'iv' | 'im' | 'sc' | 'sl' | 'pr' | 'inhaled' | 'topical' | 'ophthalmic' | 'otic';
export type MedicationFrequency = 'stat' | 'od' | 'bd' | 'tds' | 'qds' | 'q4h' | 'q6h' | 'q8h' | 'q12h' | 'nocte' | 'prn';

export interface MedicationDose {
  value: number;
  unit: string;
  weightBased?: boolean;
}

export interface MedicationCard {
  id: string;
  genericName: string;
  brandName?: string;
  indication: string;
  dose: MedicationDose;
  route: MedicationRoute;
  frequency: MedicationFrequency;
  durationDays?: number;
  administrationInstructions?: string;
  allergyCheckPassed: boolean;
  interactionCheckPassed: boolean;
  monitoringRequired?: string[];
  prescribedBy?: string;
  prescribedAt?: number;
  status: 'draft' | 'prescribed' | 'administering' | 'completed' | 'discontinued';
  weightKg?: number;
  dosePerKg?: number;
  calculatedDose?: number;
  maxDose?: number;
  renalAdjustmentRequired?: boolean;
  pregnancySafe?: boolean;
}

export type DispositionType =
  | 'discharge' | 'admit_ward' | 'admit_hdu' | 'admit_icu'
  | 'refer' | 'transfer' | 'death_certification' | 'against_medical_advice';

export interface DispositionCard {
  type: DispositionType;
  reason: string;
  destination?: string;
  escortRequired?: boolean;
  documentsPrepared: string[];
  followUpPlan?: string;
  safetyNetting?: string;
  medicationReconciliationDone: boolean;
  nursingHandoverDone: boolean;
}

// ── Documentation types (inline) ───────────────────────────────────────────────

export interface NoteSection {
  heading: string;
  body: string;
  isEmpty: boolean;
}

export interface GeneratedNote {
  title: string;
  type: 'initial_assessment' | 'progress_note' | 'ward_round' | 'referral_letter' | 'discharge_summary';
  content: string;
  sections: NoteSection[];
  generatedAt: number;
  wordCount: number;
  version: number;
}

export interface SignatureInfo {
  signedBy: string;
  signedAt: number;
  role: string;
  uid: string;
  isElectronicSignature: boolean;
}

export interface Addendum {
  id: string;
  addedBy: string;
  addedAt: number;
  content: string;
  reason: string;
}

export interface DocumentationState {
  currentNote: GeneratedNote | null;
  noteHistory: GeneratedNote[];
  signature: SignatureInfo | null;
  signedAt: number | null;
  encounterLocked: boolean;
  addenda: Addendum[];
}

// ── Workflow ──────────────────────────────────────────────────────────────────
// Two-layer progression:
//   Layer 1 — WorkflowStep (legacy 8-step, kept for backward compatibility)
//   Layer 2 — EncounterPhase (new 22-step doctor-centric workflow)
// Every component can use whichever granularity it needs.

export type WorkflowStep =
  | 'intake'
  | 'chief_complaint'
  | 'history'
  | 'examination'
  | 'investigations'
  | 'assessment'
  | 'plan'
  | 'complete';

export type EncounterPhase =
  | 'biodata'
  | 'chief_complaints'
  | 'hpi'
  | 'pmh'
  | 'psh'
  | 'drug_history'
  | 'allergy_history'
  | 'family_history'
  | 'social_history'
  | 'ros'
  | 'physical_examination'
  | 'clinical_summary'
  | 'provisional_diagnosis'
  | 'differential_diagnoses'
  | 'problem_list'
  | 'investigations'
  | 'results_review'
  | 'final_diagnosis'
  | 'management'
  | 'disposition'
  | 'documentation'
  | 'sign_off'
  | 'closed';

export interface WorkflowState {
  // Legacy 8-step — used by existing components, reducers, and engines
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];

  // New 22-step phase — used by new components; kept in sync with currentStep
  currentPhase: EncounterPhase;
  completedPhases: EncounterPhase[];

  startedAt: number;
  updatedAt: number;
}

// ── Demographics ──────────────────────────────────────────────────────────────

export interface Demographics {
  patientId: string;
  encounterId: string;
  name: string;
  ageYears: number;
  ageMonths: number;
  sex: 'male' | 'female' | 'other';
  mrn: string;
  residence: string;
  occupation?: string;
  informant: string;
  informantRelation: string;
  historyReliability: 'reliable' | 'unreliable' | 'unknown';
  geographicRegion: string;
  organizationId: string;
  departmentSlug: string;
  unitSlug: string;
}

// ── Chief Complaint ───────────────────────────────────────────────────────────

export interface ChiefComplaint {
  text: string;
  duration: string;
  severity: number;
  priority: 'high' | 'medium' | 'low';
  activeHighways: string[];
}

// ── Symptom Schemas ───────────────────────────────────────────────────────────
// Each symptom type has a structured schema. No flat fields.

export interface AbdominalPainSymptom {
  id: 'abdominal_pain';
  present: boolean;
  location: string;
  onset: string;
  duration: string;
  character: string;
  severity: number;
  radiation: string;
  progression: string;
  aggravating: string[];
  relieving: string[];
  temporalPattern: string;
  associatedSymptoms: string[];
  timingRelativeToMeals?: string;
}

export interface ChestPainSymptom {
  id: 'chest_pain';
  present: boolean;
  location: string;
  onset: string;
  duration: string;
  character: string;
  severity: number;
  radiation: string;
  exertional: boolean;
  pleuritic: boolean;
  relievingFactors: string[];
  associatedSymptoms: string[];
}

export interface CoughSymptom {
  id: 'cough';
  present: boolean;
  duration: string;
  character: 'dry' | 'productive' | 'barking' | 'paroxysmal';
  sputumColor: string;
  sputumVolume: string;
  hemoptysis: boolean;
  nocturnal: boolean;
  exerciseTriggered: boolean;
  postTussiveVomiting: boolean;
  associatedSymptoms: string[];
}

export interface FeverSymptom {
  id: 'fever';
  present: boolean;
  duration: string;
  pattern: 'continuous' | 'intermittent' | 'remittent' | 'relapsing';
  highestTemp: number;
  measuredTemp: number;
  rigors: boolean;
  nightSweats: boolean;
  responseToAntipyretics: string;
}

export interface DyspneaSymptom {
  id: 'dyspnea';
  present: boolean;
  onset: string;
  severity: string;
  atRest: boolean;
  onExertion: string;
  orthopnea: boolean;
  PND: boolean;
  associatedDistress: string[];
}

export interface NauseaVomitingSymptom {
  id: 'nausea_vomiting';
  present: boolean;
  frequency: string;
  bilious: boolean;
  projectile: boolean;
  feculent: boolean;
  hematemesis: boolean;
  timingRelativeToPain: string;
  reliefAfterVomiting: boolean;
}

export interface DiarrheaSymptom {
  id: 'diarrhea';
  present: boolean;
  duration: string;
  frequency: string;
  character: 'watery' | 'bloody' | 'mucoid' | 'fatty';
  volume: string;
  nocturnal: boolean;
  associatedSymptoms: string[];
}

export interface ConstipationSymptom {
  id: 'constipation';
  present: boolean;
  duration: string;
  frequency: string;
  stoolConsistency: string;
  straining: boolean;
  incompleteEvacuation: boolean;
  bleeding: boolean;
}

export interface DysphagiaSymptom {
  id: 'dysphagia';
  present: boolean;
  phase: 'oropharyngeal' | 'esophageal' | 'both';
  foodType: 'solids' | 'liquids' | 'both';
  progression: string;
  odynophagia: boolean;
  associatedSymptoms: string[];
}

export interface GiBleedingSymptom {
  id: 'gi_bleeding';
  present: boolean;
  type: 'hematemesis' | 'melena' | 'hematochezia' | 'occult';
  volume: string;
  color: string;
  associatedPain: boolean;
  syncope: boolean;
}

export interface JaundiceSymptom {
  id: 'jaundice';
  present: boolean;
  duration: string;
  progression: string;
  itching: boolean;
  darkUrine: boolean;
  paleStools: boolean;
  associatedPain: boolean;
}

export interface DistensionSymptom {
  id: 'distension';
  present: boolean;
  onset: string;
  site: string;
  progression: string;
  postprandial: boolean;
  relievedByStoolGas: boolean;
  associatedPain: boolean;
}

// ── Symptom Registry ──────────────────────────────────────────────────────────
// All known symptoms. Each symptom maps to a schema.

export type SymptomId =
  | 'abdominal_pain'
  | 'chest_pain'
  | 'cough'
  | 'fever'
  | 'dyspnea'
  | 'nausea_vomiting'
  | 'diarrhea'
  | 'constipation'
  | 'dysphagia'
  | 'gi_bleeding'
  | 'jaundice'
  | 'distension'
  | 'headache'
  | 'dizziness'
  | 'syncope'
  | 'palpitations'
  | 'dysuria'
  | 'frequency'
  | 'hematuria'
  | 'vaginal_bleeding'
  | 'vaginal_discharge'
  | 'rash'
  | 'joint_pain'
  | 'back_pain'
  | 'seizure'
  | 'weakness'
  | 'numbness'
  | 'weight_loss'
  | 'fatigue'
  | 'night_sweats'
  | 'reduced_feeding'
  | 'lethargy'
  | 'cyanosis'
  | 'stridor';

export type StructuredSymptom =
  | AbdominalPainSymptom
  | ChestPainSymptom
  | CoughSymptom
  | FeverSymptom
  | DyspneaSymptom
  | NauseaVomitingSymptom
  | DiarrheaSymptom
  | ConstipationSymptom
  | DysphagiaSymptom
  | GiBleedingSymptom
  | JaundiceSymptom
  | DistensionSymptom;

// ── Generic symptom fallback for symptoms without a specific schema ───────────

export interface GenericSymptom {
  id: SymptomId;
  present: boolean;
  duration: string;
  severity: string;
  characteristics: Record<string, string | boolean | number>;
  notes: string;
}

// ── History Section ───────────────────────────────────────────────────────────

export interface PastMedicalHistory {
  conditions: string[];
  surgeries: string[];
  admissions: string[];
  hiv: 'positive' | 'negative' | 'unknown';
  tb: 'treated' | 'current' | 'none' | 'unknown';
  diabetes: boolean;
  hypertension: boolean;
  asthma: boolean;
  sickleCell: boolean;
  cardiacDisease: boolean;
  immunodeficiency: boolean;
  otherChronic: string[];
}

export interface ObstetricHistory {
  gravida: number;
  para: number;
  abortus: number;
  LMP: string;
  EDD: string;
  gestationalAgeWeeks: number;
  complications: string[];
}

export interface GynecologicalHistory {
  menarcheAge: number;
  menstrualCycle: string;
  lastMenstrualPeriod: string;
  contraception: string;
  previousGynecologicalIssues: string[];
}

export interface Medications {
  current: { name: string; dose: string; frequency: string; route: string; indication: string }[];
  allergies: { drug: string; reaction: string; severity: string }[];
  anticoagulants: boolean;
  nsaids: boolean;
  steroids: boolean;
}

export interface FamilyHistory {
  tb: boolean;
  asthma: boolean;
  atopy: boolean;
  sickleCell: boolean;
  diabetes: boolean;
  hypertension: boolean;
  cancer: string[];
  geneticDiseases: string[];
  similarIllness: boolean;
}

export interface SocialHistory {
  smoking: 'current' | 'former' | 'never';
  alcohol: string;
  housingConditions: string;
  waterSource: string;
  sanitation: string;
  occupation: string;
  schoolAttendance: string;
  exposureToTb: boolean;
  travelHistory: string[];
}

// ── Review of Systems ─────────────────────────────────────────────────────────

export interface ReviewOfSystems {
  general: { fever: boolean; weightLoss: boolean; nightSweats: boolean; fatigue: boolean; appetite: string };
  respiratory: { cough: boolean; dyspnea: boolean; wheeze: boolean; hemoptysis: boolean };
  cardiovascular: { chestPain: boolean; palpitations: boolean; orthopnea: boolean; edema: boolean };
  gastrointestinal: { nausea: boolean; vomiting: boolean; diarrhea: boolean; constipation: boolean; dysphagia: boolean; bleeding: boolean; jaundice: boolean };
  genitourinary: { dysuria: boolean; frequency: boolean; hematuria: boolean; discharge: boolean };
  musculoskeletal: { jointPain: boolean; swelling: boolean; weakness: boolean };
  neurological: { headache: boolean; dizziness: boolean; seizures: boolean; numbness: boolean; visionChanges: boolean };
  endocrine: { heatCold: boolean; tremor: boolean; skinChanges: boolean };
  psychiatric: { depression: boolean; anxiety: boolean; sleepChanges: boolean };
}

// ── Examination ───────────────────────────────────────────────────────────────

export interface Vitals {
  recordedAt: number;
  spo2?: number;
  rr?: number;
  hr?: number;
  temp?: number;
  weight?: number;
  height?: number;
  muac?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  avpu: 'alert' | 'voice' | 'pain' | 'unresponsive';
  capRefill?: number;
  bloodGlucose?: number;
  urineOutput?: number;
  bmi?: number;
}

// ── Structured Gastrointestinal Examination ──────────────────────────────
// Follows Hutchison's approach: Inspection → Palpation → Percussion → Auscultation → Special Signs
// Each field maps to a finding in examinationSchemas.ts

export interface GiExam {
  // ── Inspection ────────────────────────────────────────────────────────
  contour: string;
  distensionPattern?: string;
  abdominalScars: string[];
  striae?: string;
  visibleVeins?: string;
  caputMedusae?: boolean;
  visiblePeristalsis?: boolean;
  hernialOrifices: string;
  umbilicus?: string;
  flankFullness?: boolean;
  skinChanges?: string[];
  cullensSign?: boolean;
  greyTurnerSign?: boolean;

  // ── Palpation (Superficial) ───────────────────────────────────────────
  tenderness: string;
  tendernessLocation?: string[];
  guarding: string;
  mcburneysTenderness?: boolean;
  rovsignsSign?: string;
  psoasSign?: string;
  obturatorSign?: string;
  murphysSign?: string;
  blumbergSign?: string;

  // ── Palpation (Deep) ──────────────────────────────────────────────────
  liverPalpable: boolean;
  liverSpan?: number;
  liverSurface?: string;
  liverEdge?: string;
  liverTenderness?: boolean;
  spleenPalpable: boolean;
  spleenGrade?: string;
  spleenTenderness?: boolean;
  kidneysPalpable?: string;
  abdominalMass: boolean;
  massLocation?: string;
  massConsistency?: string;
  massMobility?: string;
  aorticWidth: string;

  // ── Percussion ────────────────────────────────────────────────────────
  percussionNote: string;
  shiftingDullness?: boolean;
  fluidThrill?: boolean;
  liverSpanPercussion?: number;
  splenicDullness?: boolean;
  bladderDullness?: boolean;

  // ── Auscultation ──────────────────────────────────────────────────────
  bowelSounds: string;
  bruits?: string;
  frictionRub?: boolean;
  succussionSplash?: boolean;

  // ── Special Signs ─────────────────────────────────────────────────────
  courvoisierSign?: string;
  kehrSign?: string;
  ballanceSign?: string;
  boasSign?: string;
  danceSign?: string;

  // ── DRE ───────────────────────────────────────────────────────────────
  drePerformed?: boolean;
  dreSphincterTone?: string;
  dreFecalLoading?: boolean;
  dreMass?: boolean;
  dreBlood?: boolean;
  dreProstate?: string;

  // ── Inguinal ──────────────────────────────────────────────────────────
  inguinalHernia?: string;
  coughImpulse?: boolean;
  inguinalLymphNodes?: string;

  // ── Notes ─────────────────────────────────────────────────────────────
  giNotes?: string;
  [key: string]: boolean | string | string[] | number | undefined;
}

export interface PhysicalExam {
  general: {
    appearance: string;
    pallor: boolean;
    cyanosis: boolean;
    jaundice: boolean;
    edema: boolean;
    lymphadenopathy: boolean;
    dehydration: string;
  };
  respiratory: Record<string, boolean | string>;
  cardiovascular: Record<string, boolean | string>;
  abdominal: GiExam;
  neurological: Record<string, boolean | string>;
  musculoskeletal: Record<string, boolean | string>;
  skin: Record<string, boolean | string>;
  ent: Record<string, boolean | string>;
}

// ── Investigations ────────────────────────────────────────────────────────────

export interface InvestigationOrder {
  testId: string;
  testName: string;
  status: 'ordered' | 'pending' | 'resulted' | 'cancelled';
  result: string | number | null;
  unit: string;
  referenceRange: string;
  interpretation: string;
  flag: 'normal' | 'abnormal' | 'critical' | null;
  orderedAt: number;
  resultedAt: number | null;
}

export interface ImagingOrder {
  studyId: string;
  studyName: string;
  status: 'ordered' | 'completed';
  finding: string;
  impression: string;
  completedAt: number | null;
}

export interface BedsideScore {
  name: string;
  totalPoints: number;
  maxPoints: number;
  riskCategory: string;
  components: { name: string; points: number; met: boolean }[];
  computedAt: number;
}

// ── Assessment ────────────────────────────────────────────────────────────────

export interface DifferentialCandidate {
  diseaseId: string;
  diseaseName: string;
  probability: number;
  priorProbability: number;
  confidence: 'low' | 'medium' | 'high';
  supportingFeatures: string[];
  againstFeatures: string[];
  dangerLevel: 'low' | 'moderate' | 'high' | 'critical';
  mustNotMiss: boolean;
  actionMessage: string;
}

export interface Assessment {
  differentials: DifferentialCandidate[];
  dangerRanked: DifferentialCandidate[];
  mustNotMissDiseases: DifferentialCandidate[];
  finalDiagnosis: string | null;
  severity: {
    level: 'mild' | 'moderate' | 'severe' | 'critical';
    triagePriority: 'green' | 'yellow' | 'orange' | 'red';
    redFlags: string[];
    scores: BedsideScore[];
  };
}

// ── Plan ──────────────────────────────────────────────────────────────────────

export interface ManagementPlan {
  admissionDecision: 'discharge' | 'admit_ward' | 'admit_hdu' | 'admit_icu' | 'transfer';
  admissionReason: string;
  treatments: { step: string; detail: string; condition?: string }[];
  medications: { name: string; dose: string; route: string; frequency: string; duration: string }[];
  investigations: InvestigationOrder[];
  imaging: ImagingOrder[];
  monitoring: string[];
  followUp: string;
  safetyNetting: string;
  patientEducation: string[];
}

// ── Encounter State — The One Object ──────────────────────────────────────────

export interface EncounterState {
  // Metadata
  version: 1;
  id: string;
  createdAt: number;
  updatedAt: number;

  // Core sections — mirror clinical workflow
  workflow: WorkflowState;
  demographics: Demographics;
  chiefComplaint: ChiefComplaint;
  symptoms: Record<SymptomId, StructuredSymptom | GenericSymptom>;
  history: {
    pmh: PastMedicalHistory;
    obstetric: ObstetricHistory | null;
    gynecological: GynecologicalHistory | null;
    medications: Medications;
    family: FamilyHistory;
    social: SocialHistory;
    ros: ReviewOfSystems;
  };
  examination: {
    vitals: Vitals;
    physical: PhysicalExam;
    scores: BedsideScore[];
    generalExamination: UniversalGeneralExamination;
    systemExaminations: SystemExaminations;
  };
  investigations: {
    labs: InvestigationOrder[];
    imaging: ImagingOrder[];
  };
  assessment: Assessment;
  plan: ManagementPlan;

  // Clinical summary (watershed)
  clinicalSummary: ClinicalSummaryState;

  // Diagnostic phase
  provisionalDiagnosis: ProvisionalDiagnosisCard | null;
  differentialDiagnoses: DifferentialDiagnosisCard[];
  problemList: ProblemListItem[];

  // Investigations
  investigationPanels: string[]; // panel IDs selected

  // Management — ABCDE/FGH
  managementPlan: ManagementItem[];
  medications: MedicationCard[];
  disposition: DispositionCard | null;

  // Documentation
  documentation: DocumentationState;

  // Completion tracking — one authority
  completion: {
    domainsComplete: Record<string, boolean>;
    completenessScore: number;
    historyComplete: boolean;
    examinationComplete: boolean;
    questionsExhausted: boolean;
  };
}

// ── Initial State Factory ─────────────────────────────────────────────────────

export function createEncounterState(overrides?: Partial<EncounterState>): EncounterState {
  return {
    version: 1,
    id: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),

    workflow: {
      currentStep: 'intake',
      completedSteps: [],
      currentPhase: 'biodata',
      completedPhases: [],
      startedAt: Date.now(),
      updatedAt: Date.now(),
    },

    demographics: {
      patientId: '',
      encounterId: '',
      name: '',
      ageYears: 0,
      ageMonths: 0,
      sex: 'other',
      mrn: '',
      residence: '',
      informant: '',
      informantRelation: '',
      historyReliability: 'unknown',
      geographicRegion: '',
      organizationId: '',
      departmentSlug: '',
      unitSlug: '',
    },

    chiefComplaint: {
      text: '',
      duration: '',
      severity: 0,
      priority: 'medium',
      activeHighways: [],
    },

    symptoms: {} as Record<SymptomId, StructuredSymptom | GenericSymptom>,

    history: {
      pmh: {
        conditions: [],
        surgeries: [],
        admissions: [],
        hiv: 'unknown',
        tb: 'none',
        diabetes: false,
        hypertension: false,
        asthma: false,
        sickleCell: false,
        cardiacDisease: false,
        immunodeficiency: false,
        otherChronic: [],
      },
      obstetric: null,
      gynecological: null,
      medications: { current: [], allergies: [], anticoagulants: false, nsaids: false, steroids: false },
      family: {
        tb: false, asthma: false, atopy: false, sickleCell: false,
        diabetes: false, hypertension: false, cancer: [], geneticDiseases: [],
        similarIllness: false,
      },
      social: {
        smoking: 'never', alcohol: '', housingConditions: '', waterSource: '',
        sanitation: '', occupation: '', schoolAttendance: '', exposureToTb: false,
        travelHistory: [],
      },
      ros: {
        general: { fever: false, weightLoss: false, nightSweats: false, fatigue: false, appetite: '' },
        respiratory: { cough: false, dyspnea: false, wheeze: false, hemoptysis: false },
        cardiovascular: { chestPain: false, palpitations: false, orthopnea: false, edema: false },
        gastrointestinal: { nausea: false, vomiting: false, diarrhea: false, constipation: false, dysphagia: false, bleeding: false, jaundice: false },
        genitourinary: { dysuria: false, frequency: false, hematuria: false, discharge: false },
        musculoskeletal: { jointPain: false, swelling: false, weakness: false },
        neurological: { headache: false, dizziness: false, seizures: false, numbness: false, visionChanges: false },
        endocrine: { heatCold: false, tremor: false, skinChanges: false },
        psychiatric: { depression: false, anxiety: false, sleepChanges: false },
      },
    },

    examination: {
      vitals: {
        recordedAt: Date.now(),
        avpu: 'alert',
      },
      physical: {
        general: { appearance: '', pallor: false, cyanosis: false, jaundice: false, edema: false, lymphadenopathy: false, dehydration: '' },
        respiratory: {},
        cardiovascular: {},
        abdominal: {
          contour: '', abdominalScars: [], hernialOrifices: '',
          tenderness: '', guarding: '',
          liverPalpable: false, spleenPalpable: false, abdominalMass: false,
          percussionNote: '', bowelSounds: '',
          aorticWidth: 'normal_not_palpable',
        },
        neurological: {},
        musculoskeletal: {},
        skin: {},
        ent: {},
      },
      scores: [],
      generalExamination: {
        preparation: {
          identityConfirmed: false,
          consentObtained: false,
          chaperoneRequired: false,
          lightingAdequate: false,
          patientComfortable: false,
          exposureAdequate: false,
          privacyMaintained: false,
          handHygienePerformed: false,
          ppeUsed: false,
        },
        generalAppearance: {
          overall: 'well',
          consciousness: 'alert',
          nutritionalState: 'normal',
          hydration: 'well_hydrated',
          distress: 'none',
        },
        vitalSigns: {},
        anthropometry: {},
        constitutionalSigns: {},
        lymphNodeExamination: { examined: false, regionalNodes: [], generalized: false },
        examinedAt: Date.now(),
      },
      systemExaminations: {},
    },

    investigations: {
      labs: [],
      imaging: [],
    },

    assessment: {
      differentials: [],
      dangerRanked: [],
      mustNotMissDiseases: [],
      finalDiagnosis: null,
      severity: {
        level: 'mild',
        triagePriority: 'green',
        redFlags: [],
        scores: [],
      },
    },

    plan: {
      admissionDecision: 'discharge',
      admissionReason: '',
      treatments: [],
      medications: [],
      investigations: [],
      imaging: [],
      monitoring: [],
      followUp: '',
      safetyNetting: '',
      patientEducation: [],
    },

    // Clinical summary
    clinicalSummary: {
      generated: '',
      edited: '',
      isEdited: false,
      finalized: false,
    },

    // Diagnostic phase
    provisionalDiagnosis: null,
    differentialDiagnoses: [],
    problemList: [],

    // Investigations
    investigationPanels: [],

    // Management — ABCDE/FGH
    managementPlan: [],
    medications: [],
    disposition: null,

    // Documentation
    documentation: {
      currentNote: null,
      noteHistory: [],
      signature: null,
      signedAt: null,
      encounterLocked: false,
      addenda: [],
    },

    completion: {
      domainsComplete: {},
      completenessScore: 0,
      historyComplete: false,
      examinationComplete: false,
      questionsExhausted: false,
    },

    ...overrides,
  };
}

// ── Helper to activate a symptom schema in the state ──────────────────────────

export function activateSymptom<E extends EncounterState>(
  state: E,
  symptom: StructuredSymptom
): E {
  return {
    ...state,
    symptoms: {
      ...state.symptoms,
      [symptom.id]: symptom,
    },
  };
}

// ── Helper to advance workflow ────────────────────────────────────────────────

export function advanceWorkflow(state: EncounterState, next: WorkflowStep): EncounterState {
  const completed = [...state.workflow.completedSteps, state.workflow.currentStep];
  return {
    ...state,
    workflow: {
      currentStep: next,
      completedSteps: completed,
      currentPhase: state.workflow.currentPhase,
      completedPhases: state.workflow.completedPhases,
      startedAt: state.workflow.startedAt,
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };
}

export function advancePhase(state: EncounterState, nextPhase: EncounterPhase): EncounterState {
  const completed = [...state.workflow.completedPhases, state.workflow.currentPhase];
  return {
    ...state,
    workflow: {
      ...state.workflow,
      currentPhase: nextPhase,
      completedPhases: completed,
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };
}
