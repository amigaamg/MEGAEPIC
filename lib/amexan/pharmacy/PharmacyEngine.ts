// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN PHARMACY ENGINE (BOOK VI-J) — Engine No. 20
//
// "The Engine of Medication Intelligence, Pharmaceutical Governance, and Safe
// Therapeutics"
//
// Constitutional mission: ensure that every medication reaching a patient is
// the correct medication, at the correct dose, through the correct route, at
// the correct time, for the correct indication, with the lowest possible risk.
//
// AMEXAN does not replace pharmacists. It transforms them into medication
// intelligence specialists, therapeutic advisors, medication safety leaders,
// inventory governors, antimicrobial stewardship leaders, pharmacoeconomic
// analysts, and clinical pharmacology experts.
//
// The engine connects EMR, HMIS, Knowledge Graph, AI, Supply Chain, Billing,
// and Clinical Decision engines into one constitutional pharmaceutical
// ecosystem.
//
// Constitutional medication lifecycle:
//   Clinical Decision → Prescription → Verification → Clinical Review →
//   Interaction Analysis → Inventory Validation → Dispensing → Administration →
//   Monitoring → Outcome → Pharmacovigilance
//
// No medication bypasses constitutional verification.
//
// Constitutional Restrictions (enforced, never commented away):
//   Pharmacists cannot diagnose independently, perform unrelated clinical
//   procedures, modify constitutional protocols, access unauthorized patient
//   information, override consultant decisions without governance, or dispense
//   controlled medicines outside constitutional safeguards.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Hierarchy ──────────────────────────────────────────────────────────────────

export type PharmacyRole =
  | 'chief_pharmacist'
  | 'deputy_chief_pharmacist'
  | 'clinical_pharmacy_manager'
  | 'clinical_pharmacist'
  | 'dispensary_pharmacist'
  | 'inpatient_pharmacist'
  | 'oncology_pharmacist'
  | 'critical_care_pharmacist'
  | 'pediatric_pharmacist'
  | 'drug_information_pharmacist'
  | 'compounding_pharmacist'
  | 'procurement_pharmacist'
  | 'pharmacy_technologist'
  | 'pharmacy_student';

export const PHARMACY_ROLE_LEVELS: Readonly<Record<PharmacyRole, number>> = {
  chief_pharmacist: 14,
  deputy_chief_pharmacist: 13,
  clinical_pharmacy_manager: 12,
  clinical_pharmacist: 11,
  dispensary_pharmacist: 10,
  inpatient_pharmacist: 10,
  oncology_pharmacist: 10,
  critical_care_pharmacist: 10,
  pediatric_pharmacist: 10,
  drug_information_pharmacist: 9,
  compounding_pharmacist: 9,
  procurement_pharmacist: 8,
  pharmacy_technologist: 6,
  pharmacy_student: 3,
};

// ── Medication catalogue ───────────────────────────────────────────────────────

export type MedicationCategory =
  | 'antibiotic' | 'antiviral' | 'antifungal' | 'analgesic' | 'anaesthetic'
  | 'cardiovascular' | 'respiratory' | 'gastrointestinal' | 'endocrine'
  | 'psychotropic' | 'oncologic' | 'immunosuppressant' | 'blood_product'
  | 'fluid_electrolyte' | 'nutrition' | 'vaccine' | 'dermatologic'
  | 'ophthalmic' | 'contraceptive' | 'other';

export type InteractionSeverity = 'minor' | 'moderate' | 'major' | 'contraindicated';

export const INTERACTION_SEVERITY_ORDER: Readonly<Record<InteractionSeverity, number>> = {
  minor: 0, moderate: 1, major: 2, contraindicated: 3,
};

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: InteractionSeverity;
  mechanism?: string;
  recommendation?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: MedicationCategory;
  atcCode?: string;
  formularyStatus: 'essential' | 'standard' | 'restricted' | 'consultant_only' | 'research' | 'not_formulary';
  controlled: boolean;
  awreClass?: 'access' | 'watch' | 'reserve';
  monograph?: MedicationMonograph;
  availableForms: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MedicationMonograph {
  mechanism?: string;
  indications: string[];
  contraindications: string[];
  warnings: string[];
  monitoring: string[];
  pregnancyCategory?: string;
  breastfeedingSafety?: string;
  pediatricDosing?: string;
  renalDosing?: string;
  hepaticDosing?: string;
  adverseReactions: string[];
  references: string[];
}

// ── Prescription verification ──────────────────────────────────────────────────

export type VerificationOutcome = 'approved' | 'rejected' | 'requires_clarification';

export interface PrescriptionCheck {
  id: string;
  checkName: string;
  status: 'pass' | 'warn' | 'fail';
  detail?: string;
}

export interface VerificationResult {
  prescriptionId: string;
  outcome: VerificationOutcome;
  checks: PrescriptionCheck[];
  interactions: DrugInteraction[];
  recommendations: string[];
  verifiedBy?: AmxUid;
  verifiedAt: number;
}

export interface VerificationContext {
  patient: {
    id: string;
    ageYears?: number;
    weightKg?: number;
    pregnancy?: boolean;
    renalFunction?: { clearanceMlMin?: number; creatinineMicromol?: number; onDialysis?: boolean };
    hepaticFunction?: { impaired?: boolean };
    allergies: string[];
    previousAdverseReactions: string[];
  };
  prescription: {
    id: string;
    medicationName: string;
    dose: string;
    route: string;
    frequency: string;
    durationDays?: number;
    indication?: string;
  };
}

// ── AI medication intelligence (dose appropriateness) ─────────────────────────

export interface AiMedicationIntelligence {
  medicationName: string;
  potentialToxicity: boolean;
  doseAppropriate: boolean;
  renalAdjustmentRecommended?: boolean;
  suggestedRegimen?: string;
  evidence: string[];
  monitoringRecommendations: string[];
  pharmacistReviewRequired: boolean;
}

// ── Dispensing ─────────────────────────────────────────────────────────────────

export interface DispensingRecord {
  id: string;
  prescriptionId: string;
  patientId: string;
  pharmacistId: AmxUid;
  medicationId: string;
  medicationName: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: number;
  dispensedAt: number;
  verificationId?: string;
  cost: number;
  currency: string;
  status: 'pending' | 'dispensed' | 'cancelled';
}

// ── Controlled drugs ───────────────────────────────────────────────────────────

export interface ControlledDrugRecord {
  id: string;
  medicationName: string;
  patientId?: string;
  quantity: number;
  action: 'issued' | 'received' | 'wasted' | 'returned' | 'reconciled';
  issuedBy?: AmxUid;
  witnessedBy?: AmxUid;
  occurredAt: number;
  notes?: string;
}

// ── Inventory & procurement ────────────────────────────────────────────────────

export interface StockBatch {
  id: string;
  medicationId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: number;
  receivedAt: number;
  supplierId?: string;
  coldChainRequired: boolean;
  storage: 'ambient' | 'refrigerated' | 'frozen';
}

export interface InventoryItem {
  medicationId: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  batches: StockBatch[];
  consumptionTrend: number[];
  reorderPoint?: number;
}

export interface ProcurementOrder {
  id: string;
  supplierId?: string;
  medicationId: string;
  quantity: number;
  unitCost: number;
  currency: string;
  emergency: boolean;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  orderedAt?: number;
  receivedAt?: number;
}

export interface Supplier {
  id: string;
  name: string;
  leadTimeDays: number;
  historicalDeliveryDays: number[];
  performanceScore?: number;
}

export interface PurchaseHistoryEntry {
  id: string;
  orderId: string;
  supplierId?: string;
  medicationId: string;
  quantity: number;
  unitCost: number;
  purchasedAt: number;
}

// ── Compounding engine ─────────────────────────────────────────────────────────

export type CompoundingKind =
  | 'iv_admixture' | 'chemotherapy' | 'tpn' | 'pediatric_formulation'
  | 'dermatology_preparation' | 'sterile_compounding';

export const COMPOUNDING_KINDS: readonly CompoundingKind[] = [
  'iv_admixture', 'chemotherapy', 'tpn', 'pediatric_formulation',
  'dermatology_preparation', 'sterile_compounding',
];

export interface CompoundingOrder {
  id: string;
  kind: CompoundingKind;
  medicationName: string;
  patientId?: string;
  recipe: string;
  quantity: number;
  sterilityRequired: boolean;
  status: 'prepared' | 'qc_pending' | 'qc_passed' | 'qc_failed' | 'released' | 'wasted';
  batchNumber?: string;
  preparedBy?: AmxUid;
  checkedBy?: AmxUid;
  preparedAt: number;
}

// ── Clinical pharmacy engine ───────────────────────────────────────────────────

export type ClinicalPharmacyActivityType =
  | 'ward_round' | 'medication_appropriateness_review' | 'optimization' | 'monitoring'
  | 'deprescribing' | 'transitions_of_care' | 'patient_counselling' | 'evidence_update';

export const CLINICAL_PHARMACY_ACTIVITY_TYPES: readonly ClinicalPharmacyActivityType[] = [
  'ward_round', 'medication_appropriateness_review', 'optimization', 'monitoring',
  'deprescribing', 'transitions_of_care', 'patient_counselling', 'evidence_update',
];

export interface ClinicalPharmacyActivity {
  id: string;
  type: ClinicalPharmacyActivityType;
  patientId?: string;
  medicationName?: string;
  note: string;
  performedBy: AmxUid;
  performedAt: number;
}

// ── Closed-loop medication administration (links with Nursing Engine) ─────────

export interface MedicationAdministration {
  id: string;
  prescriptionId: string;
  patientId: string;
  medicationName: string;
  barcodeConfirmed: boolean;
  marUpdated: boolean;
  administeredBy: AmxUid;
  verifiedBy?: AmxUid;
  patientMonitored: boolean;
  outcomeDocumented: boolean;
  administeredAt: number;
}

// ── Formulary engine (version controlled) ─────────────────────────────────────

export interface FormularyVersion {
  id: string;
  version: number;
  changes: { medicationName: string; from: Medication['formularyStatus']; to: Medication['formularyStatus'] }[];
  note?: string;
  approvedBy?: AmxUid;
  effectiveAt: number;
}

// ── Pharmacovigilance ──────────────────────────────────────────────────────────

export interface AdverseDrugReaction {
  id: string;
  patientId: string;
  medicationName: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'fatal';
  causality: 'certain' | 'probable' | 'possible' | 'unlikely' | 'conditional' | 'unassessable';
  whoClassification?: string;
  reportedAt: number;
  reportedBy?: AmxUid;
  reportedToRegulator: boolean;
  reviewedByCommittee: boolean;
  learningNotes?: string;
}

// ── Antimicrobial stewardship ──────────────────────────────────────────────────

export type StewardshipStage = 'empirical' | 'targeted' | 'de-escalation' | 'completed';

export interface StewardshipCase {
  id: string;
  patientId: string;
  antibiotic: string;
  indication?: string;
  stage: StewardshipStage;
  cultureSent: boolean;
  sensitivities: string[];
  startedAt: number;
  reviewAt?: number;
  plannedStopDate?: number;
  awreClass?: Medication['awreClass'];
}

// ── Cold chain engine ──────────────────────────────────────────────────────────

export interface ColdChainLog {
  id: string;
  medicationName: string;
  batchNumber: string;
  temperatureC: number;
  acceptableRange: { minC: number; maxC: number };
  excursion: boolean;
  correctiveAction?: string;
  loggedAt: number;
}

// ── Billing integration ────────────────────────────────────────────────────────

export interface DispensingBillingEntry {
  id: string;
  dispensingId: string;
  medicationName: string;
  amount: number;
  currency: string;
  insuranceClaim: boolean;
  patientInvoice: boolean;
  costCenter: string;
  revenue: number;
  billedAt: number;
}

// ── Education engine ───────────────────────────────────────────────────────────

export type PharmacyEducationType =
  | 'new_drug' | 'safety_alert' | 'fda_update' | 'who_alert'
  | 'national_guideline' | 'clinical_trial' | 'cpd' | 'journal_club';

export const PHARMACY_EDUCATION_TYPES: readonly PharmacyEducationType[] = [
  'new_drug', 'safety_alert', 'fda_update', 'who_alert',
  'national_guideline', 'clinical_trial', 'cpd', 'journal_club',
];

export interface PharmacyEducationRecord {
  id: string;
  type: PharmacyEducationType;
  title: string;
  summary: string;
  acknowledged: boolean;
  date: number;
}

// ── Student pharmacists ────────────────────────────────────────────────────────

export type StudentPharmacyCompetency =
  | 'dispensing' | 'verification' | 'counselling' | 'compounding'
  | 'ward_participation' | 'drug_information' | 'research';

export const STUDENT_PHARMACY_COMPETENCIES: readonly StudentPharmacyCompetency[] = [
  'dispensing', 'verification', 'counselling', 'compounding',
  'ward_participation', 'drug_information', 'research',
];

export interface PharmacyStudentRecord {
  id: string;
  studentId: AmxUid;
  competency: StudentPharmacyCompetency;
  level: number;
  supervisedBy: AmxUid;
  recordedAt: number;
}

// ── Communication ──────────────────────────────────────────────────────────────

export type PharmacyCorrespondent =
  | 'doctors' | 'nurses' | 'laboratory' | 'radiology' | 'procurement'
  | 'finance' | 'patients' | 'regulators' | 'suppliers';

export const PHARMACY_CORRESPONDENTS: readonly PharmacyCorrespondent[] = [
  'doctors', 'nurses', 'laboratory', 'radiology', 'procurement',
  'finance', 'patients', 'regulators', 'suppliers',
];

export interface PharmacyCommunication {
  id: string;
  correspondent: PharmacyCorrespondent;
  title: string;
  body: string;
  patientId?: string;
  publishedBy: AmxUid;
  publishedAt: number;
}

// ── HMIS / EMR responsibilities ────────────────────────────────────────────────

export interface PharmacyHmisDuties {
  inventory: boolean;
  procurement: boolean;
  suppliers: boolean;
  billing: boolean;
  insuranceFormularies: boolean;
  controlledDrugs: boolean;
  stockMovement: boolean;
  costAnalysis: boolean;
  departmentConsumption: boolean;
}

export type PharmacyEmrContributionKind =
  | 'prescription_verification' | 'clinical_intervention' | 'medication_reconciliation'
  | 'adr_documentation' | 'patient_counselling' | 'dispensing_record'
  | 'therapeutic_monitoring' | 'medication_history';

export const PHARMACY_EMR_CONTRIBUTION_KINDS: readonly PharmacyEmrContributionKind[] = [
  'prescription_verification', 'clinical_intervention', 'medication_reconciliation',
  'adr_documentation', 'patient_counselling', 'dispensing_record',
  'therapeutic_monitoring', 'medication_history',
];

export interface PharmacyEmrContribution {
  id: string;
  kind: PharmacyEmrContributionKind;
  patientId: string;
  summary: string;
  documentedBy: AmxUid;
  documentedAt: number;
}

// ── AI pharmacy companion ──────────────────────────────────────────────────────

export interface AiPharmacyCompanionAdvice {
  id: string;
  medicationName?: string;
  doseOptimization?: string;
  drugInteractions: string[];
  renalHepaticAdjustment?: string;
  stewardshipSupport?: string;
  therapeuticAlternatives: string[];
  shortageRecommendation?: string;
  pharmacogenomicGuidance?: string;
  costEffectiveSubstitutions: string[];
  literatureSummaries: string[];
  clinicalTrialUpdates: string[];
  generatedAt: number;
}

// ── Clinical analytics ─────────────────────────────────────────────────────────

export interface PharmacyAnalytics {
  drugUtilization: { medicationName: string; unitsDispensed: number }[];
  topMedicines: { medicationName: string; unitsDispensed: number }[];
  antibioticConsumption: number;
  controlledDrugsIssued: number;
  medicationErrors: number;
  stockTurnover: number;
  revenue: number;
  expiryLosses: number;
  interventionAcceptancePercent: number;
  costSavings: number;
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface PharmacyModel {
  organizationId: string;
  facilityId?: string;
  chiefPharmacistId?: AmxUid;
  deputyChiefPharmacistId?: AmxUid;
  clinicalPharmacyManagerId?: AmxUid;
  medications: Medication[];
  interactions: DrugInteraction[];
  verificationResults: VerificationResult[];
  dispensingRecords: DispensingRecord[];
  controlledDrugRecords: ControlledDrugRecord[];
  inventory: Record<string, InventoryItem>;
  procurementOrders: ProcurementOrder[];
  suppliers: Supplier[];
  purchaseHistory: PurchaseHistoryEntry[];
  compoundingOrders: CompoundingOrder[];
  clinicalActivities: ClinicalPharmacyActivity[];
  administrations: MedicationAdministration[];
  formularyVersions: FormularyVersion[];
  adverseDrugReactions: AdverseDrugReaction[];
  stewardshipCases: StewardshipCase[];
  coldChainLogs: ColdChainLog[];
  billingEntries: DispensingBillingEntry[];
  educationRecords: PharmacyEducationRecord[];
  studentPharmacists: PharmacyStudentRecord[];
  communications: PharmacyCommunication[];
  hmis: PharmacyHmisDuties;
  emrContributions: PharmacyEmrContribution[];
  aiCompanionAdvice: AiPharmacyCompanionAdvice[];
  dispensingAccuracy: number;
  medicationErrors: number;
  nearMisses: number;
  averageTurnaroundMinutes: number;
  formularyCompliance: number;
  analytics: PharmacyAnalytics;
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreatePharmacyModelInput {
  organizationId: string;
  facilityId?: string;
  chiefPharmacistId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Verification helpers ───────────────────────────────────────────────────────

/** Simple Cockcroft-Gault style renal impairment flag. */
export function isRenallyImpaired(ctx: VerificationContext): boolean {
  const renal = ctx.patient.renalFunction;
  if (!renal) return false;
  if (renal.onDialysis) return true;
  if (renal.clearanceMlMin !== undefined) return renal.clearanceMlMin < 30;
  return false;
}

export function isHepaticallyImpaired(ctx: VerificationContext): boolean {
  return Boolean(ctx.patient.hepaticFunction?.impaired);
}

// ── Constitutional authority / restriction tables ──────────────────────────────

export const PHARMACY_AUTHORITY: readonly string[] = [
  'verify_prescriptions', 'optimize_therapy', 'dispense_medicines',
  'recommend_alternatives', 'perform_medication_reconciliation', 'provide_drug_information',
  'conduct_stewardship', 'manage_inventory', 'lead_pharmacovigilance', 'participate_in_ward_rounds',
];

export const PHARMACY_RESTRICTIONS: readonly string[] = [
  'diagnose_independently', 'perform_unrelated_clinical_procedures',
  'modify_constitutional_protocols', 'access_unauthorized_patient_information',
  'override_consultant_decisions_without_governance', 'dispense_controlled_outside_safeguards',
];

// ── The Engine ─────────────────────────────────────────────────────────────────

export class PharmacyEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreatePharmacyModelInput): PharmacyModel {
    if (!input.organizationId) throw new Error('[PharmacyEngine] organizationId is required');
    const now = Date.now();
    const actorId = input.actorId ?? input.chiefPharmacistId;
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefPharmacistId: input.chiefPharmacistId,
      deputyChiefPharmacistId: undefined,
      clinicalPharmacyManagerId: undefined,
      medications: [],
      interactions: [],
      verificationResults: [],
      dispensingRecords: [],
      controlledDrugRecords: [],
      inventory: {},
      procurementOrders: [],
      suppliers: [],
      purchaseHistory: [],
      compoundingOrders: [],
      clinicalActivities: [],
      administrations: [],
      formularyVersions: [],
      adverseDrugReactions: [],
      stewardshipCases: [],
      coldChainLogs: [],
      billingEntries: [],
      educationRecords: [],
      studentPharmacists: [],
      communications: [],
      hmis: {
        inventory: true, procurement: true, suppliers: true, billing: true,
        insuranceFormularies: true, controlledDrugs: true, stockMovement: true,
        costAnalysis: true, departmentConsumption: true,
      },
      emrContributions: [],
      aiCompanionAdvice: [],
      dispensingAccuracy: 100,
      medicationErrors: 0,
      nearMisses: 0,
      averageTurnaroundMinutes: 0,
      formularyCompliance: 100,
      analytics: {
        drugUtilization: [], topMedicines: [], antibioticConsumption: 0,
        controlledDrugsIssued: 0, medicationErrors: 0, stockTurnover: 0,
        revenue: 0, expiryLosses: 0, interventionAcceptancePercent: 0, costSavings: 0,
      },
      auditLog: actorId ? [{ at: now, actorId, action: 'pharmacy_engine_initialized' }] : [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard ─────────────────────────────────────────────────────

  static canPharmacistPerform(action: string): { allowed: boolean; reason?: string } {
    if (PHARMACY_AUTHORITY.includes(action)) return { allowed: true };
    if (PHARMACY_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        diagnose_independently: 'Diagnosis is outside pharmacy authority — the pharmacist advises on medicines, not diagnoses.',
        perform_unrelated_clinical_procedures: 'Pharmacy may not perform unrelated clinical procedures.',
        modify_constitutional_protocols: 'Constitutional protocols may not be modified by pharmacy.',
        access_unauthorized_patient_information: 'Patient information access is limited to prescription-related clinical context.',
        override_consultant_decisions_without_governance: 'Consultant decisions may only be overridden through constitutional governance.',
        dispense_controlled_outside_safeguards: 'Controlled medicines require constitutional safeguards (dual verification, registers, reconciliation).',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within Pharmacy authority.` };
  }

  static guard(model: PharmacyModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[PharmacyEngine] actorId is required for pharmacy actions');
    const verdict = PharmacyEngine.canPharmacistPerform(action);
    if (!verdict.allowed) throw new Error(`[PharmacyEngine] ${verdict.reason}`);
  }

  static audit(model: PharmacyModel, actorId: AmxUid | undefined, action: string, detail?: string): PharmacyModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefPharmacistId ?? model.deputyChiefPharmacistId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Catalogue ────────────────────────────────────────────────────────────────

  static addMedication(model: PharmacyModel, input: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>, actorId?: AmxUid): PharmacyModel {
    const name = (input.name ?? '').trim();
    if (!name) throw new Error('[PharmacyEngine] Medication name is required');
    if (model.medications.some(m => m.genericName.toLowerCase() === input.genericName.toLowerCase())) {
      throw new Error(`[PharmacyEngine] Medication "${input.genericName}" already exists in the catalogue`);
    }
    const now = Date.now();
    const medication: Medication = { ...input, id: nextId('med'), createdAt: now, updatedAt: now };
    return { ...PharmacyEngine.audit(model, actorId ?? model.chiefPharmacistId, 'medication_added', input.genericName), medications: [...model.medications, medication], updatedAt: now };
  }

  static updateMedication(model: PharmacyModel, medicationId: string, patch: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>): PharmacyModel {
    const index = model.medications.findIndex(m => m.id === medicationId);
    if (index === -1) throw new Error(`[PharmacyEngine] Medication "${medicationId}" does not exist`);
    const updated = { ...model.medications[index], ...patch, updatedAt: Date.now() };
    return {
      ...model,
      medications: [...model.medications.slice(0, index), updated, ...model.medications.slice(index + 1)],
      updatedAt: Date.now(),
    };
  }

  static setFormularyStatus(model: PharmacyModel, medicationId: string, formularyStatus: Medication['formularyStatus']): PharmacyModel {
    return PharmacyEngine.updateMedication(model, medicationId, { formularyStatus });
  }

  static findMedication(model: PharmacyModel, genericName: string): Medication | undefined {
    return model.medications.find(m => m.genericName.toLowerCase() === genericName.toLowerCase());
  }

  static findMedicationByName(model: PharmacyModel, name: string): Medication | undefined {
    const n = name.toLowerCase();
    return model.medications.find(m => m.name.toLowerCase() === n || m.genericName.toLowerCase() === n);
  }

  // ── Interactions ─────────────────────────────────────────────────────────────

  static registerInteraction(model: PharmacyModel, interaction: Omit<DrugInteraction, 'id'>): PharmacyModel {
    const duplicate = model.interactions.some(
      i => (i.drugA === interaction.drugA && i.drugB === interaction.drugB) || (i.drugA === interaction.drugB && i.drugB === interaction.drugA),
    );
    if (duplicate) return model; // idempotent
    return { ...model, interactions: [...model.interactions, { ...interaction, id: nextId('int') }], updatedAt: Date.now() };
  }

  static findInteractions(model: PharmacyModel, medicationNames: string[]): DrugInteraction[] {
    const names = medicationNames.map(n => n.toLowerCase());
    return model.interactions.filter(i =>
      names.includes(i.drugA.toLowerCase()) || names.includes(i.drugB.toLowerCase()),
    );
  }

  static findInteractionsBetween(model: PharmacyModel, drugA: string, drugB: string): DrugInteraction | undefined {
    const a = drugA.toLowerCase(); const b = drugB.toLowerCase();
    return model.interactions.find(i => (i.drugA.toLowerCase() === a && i.drugB.toLowerCase() === b) || (i.drugA.toLowerCase() === b && i.drugB.toLowerCase() === a));
  }

  static getInteractionGraph(model: PharmacyModel, medicationNames: string[]): { medication: string; edges: { with: string; severity: InteractionSeverity; recommendation?: string }[] }[] {
    const names = medicationNames.map(n => n.toLowerCase());
    return medicationNames.map(medication => {
      const m = medication.toLowerCase();
      const edges = model.interactions
        .filter(i => i.drugA.toLowerCase() === m || i.drugB.toLowerCase() === m)
        .filter(i => names.includes(i.drugA.toLowerCase()) && names.includes(i.drugB.toLowerCase()))
        .map(i => ({
          with: i.drugA.toLowerCase() === m ? i.drugB : i.drugA,
          severity: i.severity,
          recommendation: i.recommendation,
        }))
        .sort((x, y) => INTERACTION_SEVERITY_ORDER[y.severity] - INTERACTION_SEVERITY_ORDER[x.severity]);
      return { medication, edges };
    });
  }

  // ── Prescription verification engine ─────────────────────────────────────────

  static verifyPrescription(model: PharmacyModel, ctx: VerificationContext, pharmacistId?: AmxUid): { model: PharmacyModel; result: VerificationResult } {
    const checks: PrescriptionCheck[] = [];
    const recommendations: string[] = [];
    const med = PharmacyEngine.findMedicationByName(model, ctx.prescription.medicationName);
    const interactions: DrugInteraction[] = [];

    // Allergy check.
    const allergyHit = ctx.patient.allergies.find(a => a.toLowerCase() === ctx.prescription.medicationName.toLowerCase());
    checks.push({
      id: nextId('chk'),
      checkName: 'Allergy',
      status: allergyHit ? 'fail' : 'pass',
      detail: allergyHit ? `Patient is allergic to ${allergyHit}` : undefined,
    });

    // Previous adverse reactions.
    const priorReaction = ctx.patient.previousAdverseReactions.find(r => r.toLowerCase().includes(ctx.prescription.medicationName.toLowerCase()));
    checks.push({
      id: nextId('chk'),
      checkName: 'Previous adverse reaction',
      status: priorReaction ? 'warn' : 'pass',
      detail: priorReaction ? `Prior reaction: ${priorReaction}` : undefined,
    });

    // Renal adjustment check.
    if (isRenallyImpaired(ctx)) {
      checks.push({
        id: nextId('chk'),
        checkName: 'Renal function',
        status: 'warn',
        detail: 'Patient has impaired renal function; dose adjustment may be required',
      });
      recommendations.push('Consider renal-adjusted dosing');
    }

    // Hepatic adjustment check.
    if (isHepaticallyImpaired(ctx)) {
      checks.push({
        id: nextId('chk'),
        checkName: 'Hepatic function',
        status: 'warn',
        detail: 'Patient has impaired hepatic function; dose adjustment may be required',
      });
      recommendations.push('Consider hepatic-adjusted dosing');
    }

    // Pregnancy check.
    if (ctx.patient.pregnancy && med?.monograph?.pregnancyCategory && med.monograph.pregnancyCategory.toLowerCase() !== 'a') {
      checks.push({
        id: nextId('chk'),
        checkName: 'Pregnancy',
        status: 'warn',
        detail: `Pregnancy category ${med.monograph.pregnancyCategory}`,
      });
      recommendations.push('Confirm benefit outweighs fetal risk in pregnancy');
    }

    // Formulary availability.
    const onFormulary = med && med.formularyStatus !== 'not_formulary';
    checks.push({
      id: nextId('chk'),
      checkName: 'Formulary',
      status: onFormulary ? 'pass' : 'warn',
      detail: onFormulary ? undefined : 'Not on local formulary',
    });

    // Restricted medicine.
    if (med?.formularyStatus === 'consultant_only' || med?.formularyStatus === 'restricted') {
      checks.push({
        id: nextId('chk'),
        checkName: 'Restricted medicine',
        status: 'warn',
        detail: `${med.formularyStatus.replace('_', ' ')} — requires authorisation`,
      });
    }

    // Contraindications from monograph.
    if (med?.monograph?.contraindications?.length) {
      const ci = med.monograph.contraindications.filter(c => ctx.patient.previousAdverseReactions.concat(ctx.patient.allergies).some(p => c.toLowerCase().includes(p.toLowerCase())));
      if (ci.length) {
        checks.push({ id: nextId('chk'), checkName: 'Contraindication', status: 'fail', detail: ci.join('; ') });
      }
    }

    // Duplicate therapy within the active prescription set is flagged by the duplication engine;
    // availability by inventory.
    const stock = model.inventory[med?.id ?? ''];
    if (stock && stock.currentStock <= 0) {
      checks.push({ id: nextId('chk'), checkName: 'Availability', status: 'fail', detail: 'No stock available' });
      recommendations.push('Consider an available alternative or emergency procurement');
    } else if (stock && stock.currentStock <= stock.minimumStock) {
      checks.push({ id: nextId('chk'), checkName: 'Availability', status: 'warn', detail: 'Stock below minimum — replenish' });
    }

    const failures = checks.filter(c => c.status === 'fail').length;
    const warnings = checks.filter(c => c.status === 'warn').length;
    const outcome: VerificationOutcome = failures > 0 ? 'rejected' : warnings > 0 ? 'requires_clarification' : 'approved';

    const result: VerificationResult = {
      prescriptionId: ctx.prescription.id,
      outcome,
      checks,
      interactions,
      recommendations,
      verifiedBy: pharmacistId,
      verifiedAt: Date.now(),
    };

    return { model: { ...model, verificationResults: [...model.verificationResults, result], updatedAt: Date.now() }, result };
  }

  // ── AI medication intelligence ───────────────────────────────────────────────

  static analyzeMedicationIntelligence(ctx: VerificationContext): AiMedicationIntelligence {
    const name = ctx.prescription.medicationName.toLowerCase();
    const isAminoglycoside = name.includes('gentamicin') || name.includes('amikacin') || name.includes('tobramycin');
    const renal = ctx.patient.renalFunction;
    const renallyImpaired = isRenallyImpaired(ctx);
    const frequencyTds = /tds|three\s*(times)?\s*(a|per)?\s*day|t\.i\.d/i.test(ctx.prescription.frequency);
    const lowWeight = (ctx.patient.weightKg ?? 70) < 50;

    if (isAminoglycoside && renallyImpaired) {
      const suggestedRegimen = ctx.patient.weightKg ? `Once-daily ${Math.max(4, Math.round((ctx.patient.weightKg * 5) / 10) * 10)} mg IV (renal-adjusted), monitor trough` : 'Renal-adjusted once-daily dosing';
      return {
        medicationName: ctx.prescription.medicationName,
        potentialToxicity: true,
        doseAppropriate: false,
        renalAdjustmentRecommended: true,
        suggestedRegimen,
        evidence: ['Aminoglycosides are nephrotoxic and ototoxic; renal impairment requires dose reduction and interval extension', 'Once-daily dosing is safer when renal function is impaired'],
        monitoringRecommendations: ['Serum creatinine every 48h', 'Aminoglycoside trough before dose 3', 'Auditory/vestibular assessment'],
        pharmacistReviewRequired: true,
      };
    }
    if (isAminoglycoside && lowWeight && frequencyTds) {
      return {
        medicationName: ctx.prescription.medicationName,
        potentialToxicity: true,
        doseAppropriate: false,
        suggestedRegimen: 'Reduce daily dose and consider once-daily regimen',
        evidence: ['Aminoglycosides accumulate in low-body-weight patients on TDS schedules'],
        monitoringRecommendations: ['Renal function monitoring', 'Serum levels'],
        pharmacistReviewRequired: true,
      };
    }
    return {
      medicationName: ctx.prescription.medicationName,
      potentialToxicity: false,
      doseAppropriate: true,
      renalAdjustmentRecommended: renallyImpaired ? true : false,
      evidence: ['No immediate dose concern identified'],
      monitoringRecommendations: ['Routine clinical monitoring per monograph'],
      pharmacistReviewRequired: false,
    };
  }

  // ── Dispensing ───────────────────────────────────────────────────────────────

  static dispense(model: PharmacyModel, input: Omit<DispensingRecord, 'id' | 'dispensedAt' | 'status'>, actorId?: AmxUid): PharmacyModel {
    const record: DispensingRecord = {
      ...input,
      id: nextId('disp'),
      dispensedAt: Date.now(),
      status: 'dispensed',
    };
    let next: PharmacyModel;
    // Decrement stock if inventory tracked.
    const inventory = model.inventory[input.medicationId];
    if (inventory) {
      const updatedInventory = { ...inventory, currentStock: Math.max(0, inventory.currentStock - input.quantity) };
      next = { ...model, inventory: { ...model.inventory, [input.medicationId]: updatedInventory } };
    } else {
      next = model;
    }
    next = { ...next, dispensingRecords: [...next.dispensingRecords, record] };
    const recomputed = PharmacyEngine.recomputeAnalytics(next);
    return { ...PharmacyEngine.audit(recomputed, actorId ?? input.pharmacistId, 'dispensing_completed', input.medicationName), updatedAt: Date.now() };
  }

  // ── Controlled drugs ─────────────────────────────────────────────────────────

  static issueControlledDrug(
    model: PharmacyModel,
    input: Omit<ControlledDrugRecord, 'id' | 'occurredAt'> & { witnessedBy: AmxUid },
    actorId?: AmxUid,
  ): PharmacyModel {
    if (!input.issuedBy || !input.witnessedBy) {
      throw new Error('[PharmacyEngine] Controlled drug issue requires dual verification (issuedBy + witnessedBy)');
    }
    const record: ControlledDrugRecord = { ...input, id: nextId('cd'), occurredAt: Date.now() };
    return { ...PharmacyEngine.audit(model, actorId ?? input.issuedBy, 'controlled_drug_issued', input.medicationName), controlledDrugRecords: [...model.controlledDrugRecords, record], updatedAt: Date.now() };
  }

  static reconcileControlledStock(model: PharmacyModel, medicationName: string, notes?: string, actorId?: AmxUid): PharmacyModel {
    const record: ControlledDrugRecord = {
      id: nextId('cd'),
      medicationName,
      quantity: 0,
      action: 'reconciled',
      occurredAt: Date.now(),
      notes,
    };
    return { ...PharmacyEngine.audit(model, actorId ?? model.chiefPharmacistId, 'controlled_stock_reconciled', medicationName), controlledDrugRecords: [...model.controlledDrugRecords, record], updatedAt: Date.now() };
  }

  // ── Inventory & procurement ──────────────────────────────────────────────────

  static addStockBatch(model: PharmacyModel, medicationId: string, batch: Omit<StockBatch, 'id'>): PharmacyModel {
    const existing = model.inventory[medicationId];
    const fullBatch: StockBatch = { ...batch, id: nextId('bt') };
    if (!existing) {
      const med = model.medications.find(m => m.id === medicationId);
      const item: InventoryItem = {
        medicationId,
        name: med?.name ?? batch.batchNumber,
        currentStock: batch.quantity,
        minimumStock: 0,
        maximumStock: batch.quantity * 2,
        unit: 'unit',
        batches: [fullBatch],
        consumptionTrend: [],
      };
      return { ...model, inventory: { ...model.inventory, [medicationId]: item }, updatedAt: Date.now() };
    }
    const updated: InventoryItem = {
      ...existing,
      currentStock: existing.currentStock + batch.quantity,
      batches: [...existing.batches, fullBatch],
    };
    return { ...model, inventory: { ...model.inventory, [medicationId]: updated }, updatedAt: Date.now() };
  }

  static setReorderLevels(model: PharmacyModel, medicationId: string, minimumStock: number, maximumStock: number): PharmacyModel {
    const existing = model.inventory[medicationId];
    if (!existing) throw new Error(`[PharmacyEngine] No inventory for "${medicationId}"`);
    return {
      ...model,
      inventory: { ...model.inventory, [medicationId]: { ...existing, minimumStock, maximumStock, reorderPoint: minimumStock } },
      updatedAt: Date.now(),
    };
  }

  static recordConsumption(model: PharmacyModel, medicationId: string, units: number): PharmacyModel {
    const existing = model.inventory[medicationId];
    if (!existing) throw new Error(`[PharmacyEngine] No inventory for "${medicationId}"`);
    const trend = [...existing.consumptionTrend, units].slice(-12);
    const updated: InventoryItem = { ...existing, consumptionTrend: trend };
    return { ...model, inventory: { ...model.inventory, [medicationId]: updated }, updatedAt: Date.now() };
  }

  static getLowStock(model: PharmacyModel): InventoryItem[] {
    return Object.values(model.inventory).filter(i => i.currentStock <= i.minimumStock);
  }

  static getReplenishmentNeeds(model: PharmacyModel): { item: InventoryItem; suggestedOrderQuantity: number; reason: string }[] {
    const needs: { item: InventoryItem; suggestedOrderQuantity: number; reason: string }[] = [];
    for (const item of Object.values(model.inventory)) {
      if (item.currentStock <= item.minimumStock) {
        const avg = item.consumptionTrend.length ? item.consumptionTrend.reduce((a, c) => a + c, 0) / item.consumptionTrend.length : item.minimumStock;
        needs.push({
          item,
          suggestedOrderQuantity: Math.max(0, Math.ceil(item.maximumStock - item.currentStock)),
          reason: `Stock ${item.currentStock} at/below minimum ${item.minimumStock}; average consumption ${Math.round(avg)}`,
        });
      }
    }
    return needs;
  }

  static getExpiringStock(model: PharmacyModel, days = 90): { batch: StockBatch; medicationId: string; name: string; daysToExpiry: number }[] {
    const cutoff = Date.now() + days * 86400000;
    const result: { batch: StockBatch; medicationId: string; name: string; daysToExpiry: number }[] = [];
    for (const item of Object.values(model.inventory)) {
      for (const batch of item.batches) {
        if (batch.expiryDate <= cutoff && batch.quantity > 0) {
          result.push({
            batch,
            medicationId: item.medicationId,
            name: item.name,
            daysToExpiry: Math.floor((batch.expiryDate - Date.now()) / 86400000),
          });
        }
      }
    }
    return result.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }

  /** Expiry intelligence: recommends redistribute / discount / use-first / dispose. */
  static suggestExpiryDisposition(model: PharmacyModel, batch: StockBatch): { action: 'redistribute' | 'discount' | 'use_first' | 'dispose'; reason: string } {
    const days = Math.floor((batch.expiryDate - Date.now()) / 86400000);
    const item = model.inventory[batch.medicationId];
    const highTurnover = item ? (item.consumptionTrend.length ? item.consumptionTrend.reduce((a, c) => a + c, 0) / item.consumptionTrend.length >= batch.quantity : false) : false;
    if (days >= 90) return { action: 'redistribute', reason: 'Expiry >90 days away — redistribute to high-consumption units to avoid wastage' };
    if (days >= 30) return { action: highTurnover ? 'use_first' : 'discount', reason: highTurnover ? 'Near expiry but high local turnover — use first' : 'Offer discount or transfer before expiry' };
    if (days > 0) return { action: 'use_first', reason: 'Expiring within 30 days — use first and inform prescribers' };
    return { action: 'dispose', reason: 'Expired — dispose per constitutional waste protocol and record loss' };
  }

  static createProcurementOrder(model: PharmacyModel, input: Omit<ProcurementOrder, 'id' | 'status'>, actorId?: AmxUid): PharmacyModel {
    const order: ProcurementOrder = { ...input, id: nextId('po'), status: 'draft' };
    return { ...PharmacyEngine.audit(model, actorId ?? model.chiefPharmacistId, 'procurement_order_created', order.medicationId), procurementOrders: [...model.procurementOrders, order], updatedAt: Date.now() };
  }

  static receiveProcurementOrder(model: PharmacyModel, orderId: string, receivedBy?: AmxUid): PharmacyModel {
    const index = model.procurementOrders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`[PharmacyEngine] Order "${orderId}" does not exist`);
    const order = model.procurementOrders[index];
    const updated = { ...order, status: 'received' as const, receivedAt: Date.now() };
    let next = { ...model, procurementOrders: [...model.procurementOrders.slice(0, index), updated, ...model.procurementOrders.slice(index + 1)], updatedAt: Date.now() };
    if (order.medicationId) {
      next = PharmacyEngine.addStockBatch(next, order.medicationId, {
        medicationId: order.medicationId,
        batchNumber: `B${Date.now().toString(36).toUpperCase()}`,
        quantity: order.quantity,
        expiryDate: Date.now() + 365 * 86400000,
        receivedAt: Date.now(),
        supplierId: order.supplierId,
        coldChainRequired: false,
        storage: 'ambient',
      });
      const med = model.medications.find(m => m.id === order.medicationId);
      const purchase: PurchaseHistoryEntry = { id: nextId('ph'), orderId, supplierId: order.supplierId, medicationId: order.medicationId, quantity: order.quantity, unitCost: order.unitCost, purchasedAt: Date.now() };
      next = { ...next, purchaseHistory: [...next.purchaseHistory, purchase] };
      if (med) {
        next = { ...next, billingEntries: [...next.billingEntries, { id: nextId('bil'), dispensingId: orderId, medicationName: med.name, amount: order.unitCost * order.quantity, currency: order.currency, insuranceClaim: false, patientInvoice: false, costCenter: 'pharmacy-procurement', revenue: 0, billedAt: Date.now() }] };
      }
    }
    return next;
  }

  // ── Suppliers & vendor performance ───────────────────────────────────────────

  static addSupplier(model: PharmacyModel, input: Omit<Supplier, 'id' | 'performanceScore'>): PharmacyModel {
    const supplier: Supplier = { ...input, id: nextId('sup'), performanceScore: 100 };
    return { ...model, suppliers: [...model.suppliers, supplier], updatedAt: Date.now() };
  }

  static recordSupplierDelivery(model: PharmacyModel, supplierId: string, actualDays: number): PharmacyModel {
    const index = model.suppliers.findIndex(s => s.id === supplierId);
    if (index === -1) throw new Error(`[PharmacyEngine] Supplier "${supplierId}" does not exist`);
    const supplier = model.suppliers[index];
    const history = [...supplier.historicalDeliveryDays, actualDays].slice(-12);
    const expected = supplier.leadTimeDays;
    const onTime = history.filter(d => d <= expected).length / history.length;
    const score = Math.max(0, Math.min(100, Math.round(onTime * 100)));
    const updated = { ...supplier, historicalDeliveryDays: history, performanceScore: score };
    return { ...model, suppliers: [...model.suppliers.slice(0, index), updated, ...model.suppliers.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Compounding engine ───────────────────────────────────────────────────────

  static prepareCompound(model: PharmacyModel, actorId: AmxUid, input: Omit<CompoundingOrder, 'id' | 'status' | 'batchNumber' | 'preparedBy' | 'preparedAt'>): { model: PharmacyModel; order: CompoundingOrder } {
    PharmacyEngine.guard(model, actorId, 'dispense_medicines');
    if (input.sterilityRequired && !input.checkedBy) throw new Error('[PharmacyEngine] Sterile compounding requires a second checker');
    const order: CompoundingOrder = { ...input, id: nextId('cmp'), status: 'prepared', batchNumber: `CMP${Date.now().toString(36).toUpperCase()}`, preparedBy: actorId, preparedAt: Date.now() };
    return { model: { ...PharmacyEngine.audit(model, actorId, 'compound_prepared', input.medicationName), compoundingOrders: [...model.compoundingOrders, order], updatedAt: Date.now() }, order };
  }

  static passQualityControl(model: PharmacyModel, actorId: AmxUid, orderId: string, passed: boolean): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'dispense_medicines');
    const index = model.compoundingOrders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`[PharmacyEngine] Compounding order "${orderId}" does not exist`);
    const orders = [...model.compoundingOrders];
    orders[index] = { ...orders[index], status: passed ? 'qc_passed' : 'qc_failed', checkedBy: actorId };
    if (!passed) {
      return { ...PharmacyEngine.audit(model, actorId, 'compounding_qc_failed', orderId), compoundingOrders: orders, updatedAt: Date.now() };
    }
    return { ...PharmacyEngine.audit(model, actorId, 'compounding_qc_passed', orderId), compoundingOrders: orders, updatedAt: Date.now() };
  }

  static releaseCompound(model: PharmacyModel, actorId: AmxUid, orderId: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'dispense_medicines');
    const index = model.compoundingOrders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`[PharmacyEngine] Compounding order "${orderId}" does not exist`);
    if (model.compoundingOrders[index].status !== 'qc_passed') throw new Error('[PharmacyEngine] Only QC-passed compounds may be released');
    const orders = [...model.compoundingOrders];
    orders[index] = { ...orders[index], status: 'released' };
    return { ...PharmacyEngine.audit(model, actorId, 'compound_released', orderId), compoundingOrders: orders, updatedAt: Date.now() };
  }

  // ── Clinical pharmacy engine (ward rounds, optimisation, transitions) ───────

  static recordClinicalActivity(model: PharmacyModel, actorId: AmxUid, input: Omit<ClinicalPharmacyActivity, 'id' | 'performedBy' | 'performedAt'>): { model: PharmacyModel; activity: ClinicalPharmacyActivity } {
    PharmacyEngine.guard(model, actorId, 'participate_in_ward_rounds');
    const activity: ClinicalPharmacyActivity = { ...input, id: nextId('cpa'), performedBy: actorId, performedAt: Date.now() };
    return { model: { ...PharmacyEngine.audit(model, actorId, 'clinical_activity_recorded', input.type), clinicalActivities: [...model.clinicalActivities, activity], updatedAt: Date.now() }, activity };
  }

  static performMedicationReconciliation(model: PharmacyModel, actorId: AmxUid, patientId: string, notes: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'perform_medication_reconciliation');
    return PharmacyEngine.recordClinicalActivity(model, actorId, { type: 'transitions_of_care', patientId, note: `Medication reconciliation: ${notes}` }).model;
  }

  static recommendDeprescribing(model: PharmacyModel, actorId: AmxUid, patientId: string, medicationName: string, rationale: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'optimize_therapy');
    return PharmacyEngine.recordClinicalActivity(model, actorId, { type: 'deprescribing', patientId, medicationName, note: `Deprescribing recommendation: ${rationale}` }).model;
  }

  // ── Closed-loop administration (with Nursing Engine) ────────────────────────

  static verifyAdministration(model: PharmacyModel, actorId: AmxUid, input: Omit<MedicationAdministration, 'id' | 'verifiedBy' | 'administeredAt'>): { model: PharmacyModel; administration: MedicationAdministration } {
    PharmacyEngine.guard(model, actorId, 'verify_prescriptions');
    const administration: MedicationAdministration = { ...input, id: nextId('adm'), verifiedBy: actorId, administeredAt: Date.now() };
    const closedLoop = input.barcodeConfirmed && input.marUpdated;
    if (!closedLoop) {
      return { model: { ...PharmacyEngine.audit(model, actorId, 'administration_closed_loop_missing', input.prescriptionId), administrations: [...model.administrations, administration], updatedAt: Date.now() }, administration };
    }
    return { model: { ...PharmacyEngine.audit(model, actorId, 'administration_verified', input.medicationName), administrations: [...model.administrations, administration], updatedAt: Date.now() }, administration };
  }

  // ── Formulary engine (version controlled) ────────────────────────────────────

  static publishFormularyVersion(model: PharmacyModel, actorId: AmxUid, changes: FormularyVersion['changes'], note?: string): { model: PharmacyModel; version: FormularyVersion } {
    PharmacyEngine.guard(model, actorId, 'optimize_therapy');
    const current = model.formularyVersions.length ? model.formularyVersions[model.formularyVersions.length - 1].version : 0;
    const version: FormularyVersion = { id: nextId('fv'), version: current + 1, changes, note, approvedBy: actorId, effectiveAt: Date.now() };
    let next = { ...PharmacyEngine.audit(model, actorId, 'formulary_version_published', `v${version.version}`), formularyVersions: [...model.formularyVersions, version], updatedAt: Date.now() };
    for (const change of changes) {
      const med = PharmacyEngine.findMedicationByName(next, change.medicationName);
      if (med) next = PharmacyEngine.setFormularyStatus(next, med.id, change.to);
    }
    return { model: next, version };
  }

  static getCurrentFormulary(model: PharmacyModel): { version: number; medications: Medication[] } {
    const version = model.formularyVersions.length ? model.formularyVersions[model.formularyVersions.length - 1].version : 0;
    return { version, medications: model.medications.filter(m => m.formularyStatus !== 'not_formulary') };
  }

  // ── Pharmacovigilance ────────────────────────────────────────────────────────

  static reportADR(model: PharmacyModel, input: Omit<AdverseDrugReaction, 'id' | 'reportedAt'>, actorId?: AmxUid): PharmacyModel {
    const adr: AdverseDrugReaction = { ...input, id: nextId('adr'), reportedAt: Date.now() };
    return { ...PharmacyEngine.audit(model, actorId ?? model.chiefPharmacistId, 'adr_reported', input.medicationName), adverseDrugReactions: [...model.adverseDrugReactions, adr], updatedAt: Date.now() };
  }

  static reportToRegulator(model: PharmacyModel, actorId: AmxUid, adrId: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'lead_pharmacovigilance');
    const index = model.adverseDrugReactions.findIndex(a => a.id === adrId);
    if (index === -1) throw new Error(`[PharmacyEngine] ADR "${adrId}" does not exist`);
    const adrs = [...model.adverseDrugReactions];
    adrs[index] = { ...adrs[index], reportedToRegulator: true };
    return { ...PharmacyEngine.audit(model, actorId, 'adr_reported_to_regulator', adrId), adverseDrugReactions: adrs, updatedAt: Date.now() };
  }

  static reviewAdrByCommittee(model: PharmacyModel, committeeMemberId: AmxUid, adrId: string, learningNotes: string): PharmacyModel {
    const index = model.adverseDrugReactions.findIndex(a => a.id === adrId);
    if (index === -1) throw new Error(`[PharmacyEngine] ADR "${adrId}" does not exist`);
    const adrs = [...model.adverseDrugReactions];
    adrs[index] = { ...adrs[index], reviewedByCommittee: true, learningNotes };
    return { ...model, adverseDrugReactions: adrs, updatedAt: Date.now() };
  }

  static getSevereADRs(model: PharmacyModel): AdverseDrugReaction[] {
    return model.adverseDrugReactions.filter(a => a.severity === 'severe' || a.severity === 'fatal');
  }

  static getUnreportedSevereADRs(model: PharmacyModel): AdverseDrugReaction[] {
    return model.adverseDrugReactions.filter(a => (a.severity === 'severe' || a.severity === 'fatal') && !a.reportedToRegulator);
  }

  // ── Antimicrobial stewardship ────────────────────────────────────────────────

  static openStewardshipCase(model: PharmacyModel, input: Omit<StewardshipCase, 'id' | 'stage' | 'startedAt'>, actorId?: AmxUid): PharmacyModel {
    const c: StewardshipCase = { ...input, id: nextId('stew'), stage: 'empirical', startedAt: Date.now() };
    return { ...PharmacyEngine.audit(model, actorId ?? model.chiefPharmacistId, 'stewardship_case_opened', input.antibiotic), stewardshipCases: [...model.stewardshipCases, c], updatedAt: Date.now() };
  }

  static advanceStewardship(model: PharmacyModel, caseId: string, stage: StewardshipStage, actorId?: AmxUid): PharmacyModel {
    const index = model.stewardshipCases.findIndex(c => c.id === caseId);
    if (index === -1) throw new Error(`[PharmacyEngine] Stewardship case "${caseId}" does not exist`);
    const updated = { ...model.stewardshipCases[index], stage };
    const existing = model.stewardshipCases[index];
    let next = {
      ...model,
      stewardshipCases: [...model.stewardshipCases.slice(0, index), updated, ...model.stewardshipCases.slice(index + 1)],
      updatedAt: Date.now(),
    };
    if (stage === 'targeted' && !existing.cultureSent) {
      next = { ...next, stewardshipCases: next.stewardshipCases.map(c => c.id === caseId ? { ...c, cultureSent: true } : c) };
    }
    return PharmacyEngine.audit(next, actorId ?? model.chiefPharmacistId, 'stewardship_advanced', `${caseId}: ${stage}`);
  }

  static setStewardshipStopDate(model: PharmacyModel, caseId: string, stopDate: number, actorId?: AmxUid): PharmacyModel {
    const index = model.stewardshipCases.findIndex(c => c.id === caseId);
    if (index === -1) throw new Error(`[PharmacyEngine] Stewardship case "${caseId}" does not exist`);
    const updated = { ...model.stewardshipCases[index], plannedStopDate: stopDate };
    return PharmacyEngine.audit({ ...model, stewardshipCases: [...model.stewardshipCases.slice(0, index), updated, ...model.stewardshipCases.slice(index + 1)], updatedAt: Date.now() }, actorId ?? model.chiefPharmacistId, 'stewardship_stop_date_set', caseId);
  }

  static getActiveStewardship(model: PharmacyModel): StewardshipCase[] {
    return model.stewardshipCases.filter(c => c.stage !== 'completed');
  }

  static getAntibioticConsumption(model: PharmacyModel): number {
    return model.stewardshipCases.filter(c => c.stage === 'completed' || c.stage === 'de-escalation').length;
  }

  static getAwreCompliance(model: PharmacyModel): { access: number; watch: number; reserve: number } {
    return model.stewardshipCases.reduce(
      (acc, c) => { if (c.awreClass === 'access') acc.access += 1; if (c.awreClass === 'watch') acc.watch += 1; if (c.awreClass === 'reserve') acc.reserve += 1; return acc; },
      { access: 0, watch: 0, reserve: 0 },
    );
  }

  // ── Cold chain engine ────────────────────────────────────────────────────────

  static logTemperature(model: PharmacyModel, actorId: AmxUid, input: Omit<ColdChainLog, 'id' | 'excursion' | 'loggedAt'>): { model: PharmacyModel; log: ColdChainLog } {
    PharmacyEngine.guard(model, actorId, 'manage_inventory');
    const excursion = input.temperatureC < input.acceptableRange.minC || input.temperatureC > input.acceptableRange.maxC;
    const log: ColdChainLog = { ...input, id: nextId('cold'), excursion, loggedAt: Date.now() };
    let next = { ...PharmacyEngine.audit(model, actorId, excursion ? 'cold_chain_excursion' : 'cold_chain_temperature_logged', input.batchNumber), coldChainLogs: [...model.coldChainLogs, log], updatedAt: Date.now() };
    if (excursion) {
      const batches = Object.values(next.inventory).flatMap(i => i.batches).filter(b => b.batchNumber === input.batchNumber);
      for (const batch of batches) {
        next = { ...next, inventory: { ...next.inventory, [batch.medicationId]: { ...next.inventory[batch.medicationId], batches: next.inventory[batch.medicationId].batches.map(b => b.id === batch.id ? { ...b, quantity: 0 } : b) } } };
      }
    }
    return { model: next, log };
  }

  static recordCorrectiveAction(model: PharmacyModel, actorId: AmxUid, logId: string, action: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'manage_inventory');
    const index = model.coldChainLogs.findIndex(l => l.id === logId);
    if (index === -1) throw new Error(`[PharmacyEngine] Cold chain log "${logId}" does not exist`);
    const logs = [...model.coldChainLogs];
    logs[index] = { ...logs[index], correctiveAction: action };
    return { ...PharmacyEngine.audit(model, actorId, 'cold_chain_corrective_action', logId), coldChainLogs: logs, updatedAt: Date.now() };
  }

  static getActiveColdChainAlerts(model: PharmacyModel): ColdChainLog[] {
    return model.coldChainLogs.filter(l => l.excursion && !l.correctiveAction);
  }

  // ── Billing integration ──────────────────────────────────────────────────────

  static billDispensing(model: PharmacyModel, input: Omit<DispensingBillingEntry, 'id' | 'billedAt'>): PharmacyModel {
    const entry: DispensingBillingEntry = { ...input, id: nextId('bil'), billedAt: Date.now() };
    return { ...model, billingEntries: [...model.billingEntries, entry], updatedAt: Date.now() };
  }

  static getBillingSummary(model: PharmacyModel): { totalRevenue: number; insuranceClaims: number; patientInvoices: number } {
    return model.billingEntries.reduce(
      (acc, e) => ({ totalRevenue: acc.totalRevenue + e.revenue, insuranceClaims: acc.insuranceClaims + (e.insuranceClaim ? 1 : 0), patientInvoices: acc.patientInvoices + (e.patientInvoice ? 1 : 0) }),
      { totalRevenue: 0, insuranceClaims: 0, patientInvoices: 0 },
    );
  }

  // ── Education engine ─────────────────────────────────────────────────────────

  static publishEducation(model: PharmacyModel, actorId: AmxUid, input: Omit<PharmacyEducationRecord, 'id' | 'acknowledged' | 'date'>): { model: PharmacyModel; record: PharmacyEducationRecord } {
    PharmacyEngine.guard(model, actorId, 'provide_drug_information');
    const record: PharmacyEducationRecord = { ...input, id: nextId('edu'), acknowledged: false, date: Date.now() };
    return { model: { ...PharmacyEngine.audit(model, actorId, 'education_published', input.type), educationRecords: [...model.educationRecords, record], updatedAt: Date.now() }, record };
  }

  static acknowledgeEducation(model: PharmacyModel, actorId: AmxUid, recordId: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'provide_drug_information');
    const index = model.educationRecords.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error(`[PharmacyEngine] Education record "${recordId}" does not exist`);
    const records = [...model.educationRecords];
    records[index] = { ...records[index], acknowledged: true };
    return { ...PharmacyEngine.audit(model, actorId, 'education_acknowledged', recordId), educationRecords: records, updatedAt: Date.now() };
  }

  // ── Student pharmacists ──────────────────────────────────────────────────────

  static recordStudentCompetency(model: PharmacyModel, supervisorId: AmxUid, studentId: AmxUid, competency: StudentPharmacyCompetency, level: number): { model: PharmacyModel; record: PharmacyStudentRecord } {
    if (!STUDENT_PHARMACY_COMPETENCIES.includes(competency)) throw new Error('[PharmacyEngine] Unknown student pharmacy competency');
    const record: PharmacyStudentRecord = { id: nextId('stu'), studentId, competency, level: Math.max(0, Math.min(5, level)), supervisedBy: supervisorId, recordedAt: Date.now() };
    return { model: { ...PharmacyEngine.audit(model, supervisorId, 'student_competency_recorded', competency), studentPharmacists: [...model.studentPharmacists, record], updatedAt: Date.now() }, record };
  }

  static getStudentCompetencies(model: PharmacyModel, studentId: AmxUid): PharmacyStudentRecord[] {
    return model.studentPharmacists.filter(r => r.studentId === studentId);
  }

  // ── Communication (secure and documented) ────────────────────────────────────

  static sendCommunication(model: PharmacyModel, actorId: AmxUid, input: Omit<PharmacyCommunication, 'id' | 'publishedBy' | 'publishedAt'>): { model: PharmacyModel; communication: PharmacyCommunication } {
    if (!PHARMACY_CORRESPONDENTS.includes(input.correspondent)) throw new Error('[PharmacyEngine] Unsupported pharmacy correspondent');
    const communication: PharmacyCommunication = { ...input, id: nextId('com'), publishedBy: actorId, publishedAt: Date.now() };
    return { model: { ...PharmacyEngine.audit(model, actorId, 'pharmacy_communication_sent', input.correspondent), communications: [...model.communications, communication], updatedAt: Date.now() }, communication };
  }

  // ── HMIS / EMR responsibilities ──────────────────────────────────────────────

  static updateHmisDuties(model: PharmacyModel, patch: Partial<PharmacyHmisDuties>): PharmacyModel {
    const hmis = { ...model.hmis, ...patch };
    return { ...model, hmis, updatedAt: Date.now() };
  }

  static recordEmrContribution(model: PharmacyModel, actorId: AmxUid, input: Omit<PharmacyEmrContribution, 'id' | 'documentedBy' | 'documentedAt'>): { model: PharmacyModel; contribution: PharmacyEmrContribution } {
    const contribution: PharmacyEmrContribution = { ...input, id: nextId('emr'), documentedBy: actorId, documentedAt: Date.now() };
    return { model: { ...PharmacyEngine.audit(model, actorId, 'emr_contribution_recorded', input.kind), emrContributions: [...model.emrContributions, contribution], updatedAt: Date.now() }, contribution };
  }

  // ── AI pharmacy companion ────────────────────────────────────────────────────

  static generateCompanionAdvice(model: PharmacyModel, input: Omit<AiPharmacyCompanionAdvice, 'id' | 'generatedAt'>): { model: PharmacyModel; advice: AiPharmacyCompanionAdvice } {
    const advice: AiPharmacyCompanionAdvice = { ...input, id: nextId('ai'), generatedAt: Date.now() };
    return { model: { ...model, aiCompanionAdvice: [...model.aiCompanionAdvice, advice], updatedAt: Date.now() }, advice };
  }

  // ── Quality metrics ──────────────────────────────────────────────────────────

  static recordNearMiss(model: PharmacyModel, actorId: AmxUid, detail: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'verify_prescriptions');
    return { ...PharmacyEngine.audit(model, actorId, 'near_miss_recorded', detail), nearMisses: model.nearMisses + 1, updatedAt: Date.now() };
  }

  static recordMedicationError(model: PharmacyModel, actorId: AmxUid, detail: string): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'verify_prescriptions');
    return { ...PharmacyEngine.audit(model, actorId, 'medication_error_recorded', detail), medicationErrors: model.medicationErrors + 1, updatedAt: Date.now() };
  }

  static updateQualityMetrics(model: PharmacyModel, patch: Partial<Pick<PharmacyModel, 'dispensingAccuracy' | 'averageTurnaroundMinutes' | 'formularyCompliance'>>): PharmacyModel {
    return { ...model, ...patch, updatedAt: Date.now() };
  }

  // ── Clinical analytics ───────────────────────────────────────────────────────

  static recomputeAnalytics(model: PharmacyModel): PharmacyModel {
    const utilization = new Map<string, number>();
    for (const d of model.dispensingRecords) {
      utilization.set(d.medicationName, (utilization.get(d.medicationName) ?? 0) + d.quantity);
    }
    const drugUtilization = [...utilization.entries()].map(([medicationName, unitsDispensed]) => ({ medicationName, unitsDispensed }));
    const topMedicines = [...drugUtilization].sort((a, b) => b.unitsDispensed - a.unitsDispensed).slice(0, 10);
    const antibioticConsumption = model.stewardshipCases.length;
    const controlledDrugsIssued = model.controlledDrugRecords.filter(r => r.action === 'issued').length;
    const revenue = model.billingEntries.reduce((a, e) => a + e.revenue, 0);
    const expiryLosses = model.coldChainLogs.filter(l => l.excursion).length;
    const acceptedInterventions = model.clinicalActivities.filter(a => a.type !== 'evidence_update').length;
    const interventionAcceptancePercent = model.clinicalActivities.length ? Math.round((acceptedInterventions / model.clinicalActivities.length) * 100) : 0;
    const totalPurchases = model.purchaseHistory.length;
    const avgUnitCost = totalPurchases ? model.purchaseHistory.reduce((a, p) => a + p.unitCost, 0) / totalPurchases : 0;
    const costSavings = Math.round(avgUnitCost * 0.1 * model.analytics?.drugUtilization.reduce((a, d) => a + d.unitsDispensed, 0) || 0);
    const stockTurnover = Math.round(model.analytics?.drugUtilization.reduce((a, d) => a + d.unitsDispensed, 0) / Math.max(1, Object.keys(model.inventory).length) * 10) / 10;
    return {
      ...model,
      analytics: {
        drugUtilization,
        topMedicines,
        antibioticConsumption,
        controlledDrugsIssued,
        medicationErrors: model.medicationErrors,
        stockTurnover,
        revenue,
        expiryLosses,
        interventionAcceptancePercent,
        costSavings,
      },
      updatedAt: Date.now(),
    };
  }

  static getAnalytics(model: PharmacyModel): PharmacyAnalytics {
    return { ...model.analytics };
  }

  // ── Read conveniences ────────────────────────────────────────────────────────

  static getMedications(model: PharmacyModel): Medication[] { return model.medications; }
  static getRestrictedMedications(model: PharmacyModel): Medication[] {
    return model.medications.filter(m => m.formularyStatus === 'restricted' || m.formularyStatus === 'consultant_only');
  }
  static getControlledMedications(model: PharmacyModel): Medication[] {
    return model.medications.filter(m => m.controlled);
  }
  static getVerificationQueue(model: PharmacyModel): VerificationResult[] {
    return model.verificationResults.filter(v => v.outcome === 'requires_clarification');
  }
  static getRejectedPrescriptions(model: PharmacyModel): VerificationResult[] {
    return model.verificationResults.filter(v => v.outcome === 'rejected');
  }
  static getInventorySummary(model: PharmacyModel): { totalLines: number; lowStock: number; expiringSoon: number; totalUnits: number } {
    const items = Object.values(model.inventory);
    return {
      totalLines: items.length,
      lowStock: PharmacyEngine.getLowStock(model).length,
      expiringSoon: PharmacyEngine.getExpiringStock(model, 90).length,
      totalUnits: items.reduce((sum, i) => sum + i.currentStock, 0),
    };
  }
  static getDashboardSummary(model: PharmacyModel): {
    medications: number;
    verificationResults: number;
    rejected: number;
    dispensed: number;
    controlledRecords: number;
    lowStock: number;
    adrs: number;
    activeStewardship: number;
    compoundingOrders: number;
    pendingCompounding: number;
    coldChainAlerts: number;
    dispensingAccuracy: number;
    formularyCompliance: number;
  } {
    return {
      medications: model.medications.length,
      verificationResults: model.verificationResults.length,
      rejected: PharmacyEngine.getRejectedPrescriptions(model).length,
      dispensed: model.dispensingRecords.length,
      controlledRecords: model.controlledDrugRecords.length,
      lowStock: PharmacyEngine.getLowStock(model).length,
      adrs: model.adverseDrugReactions.length,
      activeStewardship: PharmacyEngine.getActiveStewardship(model).length,
      compoundingOrders: model.compoundingOrders.length,
      pendingCompounding: model.compoundingOrders.filter(o => o.status === 'prepared' || o.status === 'qc_pending').length,
      coldChainAlerts: PharmacyEngine.getActiveColdChainAlerts(model).length,
      dispensingAccuracy: model.dispensingAccuracy,
      formularyCompliance: model.formularyCompliance,
    };
  }

  // ── Constitutional restrictions (enforced) ──────────────────────────────────

  static diagnoseIndependently(model: PharmacyModel, actorId: AmxUid): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'diagnose_independently');
    return model;
  }

  static performUnrelatedClinicalProcedure(model: PharmacyModel, actorId: AmxUid): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'perform_unrelated_clinical_procedures');
    return model;
  }

  static modifyConstitutionalProtocol(model: PharmacyModel, actorId: AmxUid): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'modify_constitutional_protocols');
    return model;
  }

  static accessUnauthorizedPatientInformation(model: PharmacyModel, actorId: AmxUid): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'access_unauthorized_patient_information');
    return model;
  }

  static overrideConsultantDecisionWithoutGovernance(model: PharmacyModel, actorId: AmxUid): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'override_consultant_decisions_without_governance');
    return model;
  }

  static dispenseControlledOutsideSafeguards(model: PharmacyModel, actorId: AmxUid): PharmacyModel {
    PharmacyEngine.guard(model, actorId, 'dispense_controlled_outside_safeguards');
    return model;
  }
}

export default PharmacyEngine;
