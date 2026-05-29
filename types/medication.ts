import { Timestamp } from "firebase/firestore";

export type DiseaseJourneyType = "acute" | "chronic" | "episodic" | "lifelong";
export type PrescriptionOrigin = "inpatient" | "outpatient" | "emergency" | "specialist" | "pharmacy";
export type MedicationForm = "tablet" | "capsule" | "syrup" | "injection" | "inhaler" | "topical" | "patch" | "suppository" | "drops" | "implant";
export type AdministrationSite = "home" | "clinic" | "hospital" | "school" | "work";
export type AdherenceReason =
  | "forgot"
  | "side_effects"
  | "cost"
  | "felt_better"
  | "felt_worse"
  | "hopelessness"
  | "religious"
  | "stigma"
  | "confused"
  | "no_transport"
  | "no_refill"
  | "difficulty_swallowing"
  | "inconvenient_timing"
  | "other";

export interface TherapeuticChallenge {
  id: string;
  patientId: string;
  title: string;
  description: string;
  type: "adherence_streak" | "bp_target" | "glucose_target" | "medication_consistency" | "symptom_improvement" | "education_milestone";
  goal: string;
  durationDays: number;
  reward?: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  progress: number;
  status: "active" | "completed" | "failed";
  milestones: { day: number; label: string; achieved: boolean; achievedAt?: Timestamp }[];
}

export interface MedicationEffectivenessScore {
  overall: number;
  symptomControl: number;
  biomarkerResponse: number;
  adherenceScore: number;
  toleranceScore: number;
  qualityOfLifeImpact: number;
  calculatedAt: Timestamp;
  trend: "improving" | "stable" | "worsening";
}

export interface HomeMedicationInventory {
  id: string;
  patientId: string;
  prescriptionId?: string;
  medicationName: string;
  dose: string;
  form: MedicationForm;
  totalQuantity: number;
  remainingQuantity: number;
  unit: string;
  acquiredAt: Timestamp;
  expiresAt?: Timestamp;
  storageInstructions?: string;
  batchNumber?: string;
  source: "pharmacy" | "hospital" | "clinic" | "other";
  lastUpdated: Timestamp;
  lowStockThreshold: number;
  autoRefillEnabled: boolean;
}

export interface InventoryPrediction {
  medicationId: string;
  medicationName: string;
  dailyUsage: number;
  remainingDays: number;
  estimatedRunOutDate: Timestamp;
  daysUntilEmpty: number;
  refillNeeded: boolean;
  nearbyPharmacies?: { name: string; distance: string; inStock: boolean }[];
}

export interface PatientMedicationNote {
  id: string;
  patientId: string;
  prescriptionId: string;
  type: "side_effect" | "symptom_change" | "missed_reason" | "general" | "question" | "urgent";
  content: string;
  severity?: "mild" | "moderate" | "severe";
  recordedAt: Timestamp;
  readByDoctor: boolean;
  readAt?: Timestamp;
  tags: string[];
}

export interface SideEffectTracking {
  id: string;
  patientId: string;
  prescriptionId: string;
  sideEffect: string;
  severity: "mild" | "moderate" | "severe";
  onset: Timestamp;
  duration?: string;
  action: "none" | "monitored" | "reported" | "medication_changed" | "treatment_given";
  resolvedAt?: Timestamp;
  notes: string;
}

export interface MedicationComplicationAlert {
  id: string;
  patientId: string;
  prescriptionId: string;
  complication: string;
  risk: "low" | "moderate" | "high" | "critical";
  detectedAt: Timestamp;
  triggerValue?: string;
  recommendation: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolvedAt?: Timestamp;
}

export interface MedicationSwitch {
  id: string;
  patientId: string;
  fromDrug: string;
  fromDose: string;
  toDrug: string;
  toDose: string;
  reason: "ineffective" | "side_effects" | "interaction" | "cost" | "availability" | "adherence" | "pregnancy" | "allergy" | "contraindication" | "formulary_change";
  rationale: string;
  decisionBy: string;
  decidedAt: Timestamp;
  washoutPeriod?: string;
  crossTitrationInstructions?: string;
  patientResponse: "improved" | "no_change" | "worsened" | "pending";
  responseNotes?: string;
  followUpDate?: Timestamp;
}

export interface InpatientMedicationOrder {
  id: string;
  patientId: string;
  encounterId: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: "ordered" | "active" | "held" | "discontinued" | "completed";
  indication: string;
  prescriber: string;
  pharmacistReview?: string;
  administeredDoses: InpatientDoseRecord[];
  prnReason?: string;
  maxPrnDoses24h?: number;
  critical: boolean;
}

export interface InpatientDoseRecord {
  id: string;
  orderId: string;
  scheduledTime: Timestamp;
  administeredAt?: Timestamp;
  administeredBy?: string;
  dose: string;
  route: string;
  site?: string;
  status: "pending" | "given" | "refused" | "omitted" | "held";
  reasonIfNotGiven?: string;
  notes: string;
  witnessedBy?: string;
}

export interface DoctorMedicationReview {
  id: string;
  patientId: string;
  doctorId: string;
  reviewedAt: Timestamp;
  reviewType: "routine" | "urgent" | "follow_up" | "discharge";
  adherenceSummary: {
    overallPercentage: number;
    trend: "improving" | "stable" | "worsening";
    missedDoses30d: number;
    commonReasons: string[];
  };
  effectivenessSummary: {
    score: number;
    controlled: boolean;
    notes: string;
  };
  sideEffectBurden: {
    totalActive: number;
    severe: number;
    requiresAction: boolean;
  };
  recommendations: string[];
  medicationChanges: { drugId: string; action: "continue" | "adjust" | "switch" | "stop"; reason: string }[];
  nextReviewDate?: Timestamp;
}

export interface MedicationEducationContent {
  id: string;
  drugId: string;
  title: string;
  contentType: "why_it_matters" | "how_to_take" | "side_effects" | "storage" | "interactions" | "diet" | "monitoring";
  content: string;
  contentFormat: "text" | "video" | "image" | "interactive";
  difficulty: "basic" | "intermediate" | "advanced";
  estimatedReadMinutes: number;
  tags: string[];
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  diagnosis: string;
  journeyType: DiseaseJourneyType;
  startDate: Timestamp;
  targetOutcomes: string[];
  therapyLines: TherapyLine[];
  currentLine: number;
  status: "active" | "completed" | "paused";
  nextReviewDate?: Timestamp;
  createdBy: string;
}

export interface TherapyLine {
  line: number;
  name: string;
  medications: { drug: string; dose: string; frequency: string }[];
  criteria: string;
  duration: string;
  monitoringSchedule: string[];
  escalationCriteria: string[];
  deescalationCriteria?: string[];
}
