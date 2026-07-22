// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — Complete Type System
// Book II Volume I: Patient Journey
// Book II Volume II: Universal Encounter
// Book II Volume III: Clinical Workflow
// Book III Volume I: Doctor Operational Flow
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid, OrganizationType, MedicalSpecialty, ProfessionalCategory } from '../constitution/types';

// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// BOOK II, VOLUME I — UNIVERSAL PATIENT JOURNEY CONSTITUTION
// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

// ── Three Trust Layers ────────────────────────────────────────────────────────

export type TrustLayer = 1 | 2 | 3;

export const TRUST_LAYER: Record<string, TrustLayer> = {
  PATIENT_CONTRIBUTED: 1,
  CLINICIAN_AUTHENTICATED: 2,
  VERIFIED_EXTERNAL: 3,
};

// Layer 1: Patient-contributed information
export type PatientContributedCategory =
  | 'self_reported_symptom' | 'home_bp' | 'home_glucose' | 'weight' | 'pain_diary'
  | 'mood_diary' | 'wearable_data' | 'home_ecg' | 'medication_adherence'
  | 'food_diary' | 'exercise_log' | 'menstrual_tracking' | 'family_history_update'
  | 'lifestyle_info' | 'uploaded_document' | 'outside_prescription'
  | 'outside_discharge_summary' | 'outside_imaging' | 'outside_lab_result'
  | 'caregiver_observation' | 'other_patient_contributed';

// Layer 2: Clinician-authenticated
export type ClinicianAuthenticatedCategory =
  | 'history' | 'physical_examination' | 'diagnosis' | 'clinical_assessment'
  | 'prescription' | 'laboratory_interpretation' | 'procedure_note' | 'consent'
  | 'operation_note' | 'discharge_summary' | 'death_certificate'
  | 'ward_round_note' | 'consultant_review' | 'triage_note'
  | 'nursing_assessment' | 'medication_administration' | 'allergy_record'
  | 'immunization_record' | 'referral_note' | 'other_clinician_authenticated';

// Layer 3: Verified external
export type VerifiedExternalCategory =
  | 'external_mri' | 'external_ct' | 'external_xray' | 'external_ultrasound'
  | 'external_histology' | 'external_lab_result' | 'external_operation_note'
  | 'external_discharge_summary' | 'external_diagnosis' | 'external_prescription'
  | 'external_consultation_note' | 'external_vaccination_record'
  | 'external_imaging_report' | 'other_external_verified';

export type ClinicalFactCategory = PatientContributedCategory | ClinicianAuthenticatedCategory | VerifiedExternalCategory;

// ── Provenance ────────────────────────────────────────────────────────────────
// Every clinical fact carries its complete origin story.

export interface Provenance {
  recordedBy: {
    id: string;       // AmxUid or device ID
    name: string;
    role: string;
    type: 'clinician' | 'patient' | 'caregiver' | 'device' | 'system' | 'external_organization';
  };
  organizationId?: string;
  organizationName?: string;
  departmentId?: string;
  departmentName?: string;
  recordedAt: number;          // When the fact was first recorded
  source: string;              // How it entered AMEXAN (e.g., 'direct_entry', 'import', 'wearable_sync', 'api')
  sourceDevice?: string;       // Device ID or app identifier
  importOriginalId?: string;   // Original record ID from external system
  importOriginalSystem?: string; // Name of external system
  verified: boolean;
  verifiedAt?: number;
  verifiedBy?: string;
  supersededAt?: number;
  supersededBy?: string;       // ID of the fact that superseded this one
}

// ── Clinical Fact — the fundamental unit ──────────────────────────────────────
// Every piece of clinical information is a ClinicalFact.
// Nothing enters the patient journey without becoming a fact.

export interface ClinicalFact {
  id: string;
  patientId: string;
  episodeId?: string;
  encounterId?: string;
  trustLayer: TrustLayer;
  category: ClinicalFactCategory;
  provenance: Provenance;
  timestamp: number;           // When the event actually occurred (not when recorded)
  recordedAt: number;          // When it was entered into AMEXAN

  // The actual clinical content as key-value observations
  observations: ClinicalObservation[];

  // Links to supporting documents
  documentIds: string[];

  // Audit chain
  signatureId?: string;        // Link to DigitalSignature if Layer 2/3
  parentFactId?: string;       // For amendments / corrections
  status: 'active' | 'amended' | 'superseded' | 'voided';
  voidReason?: string;
}

export interface ClinicalObservation {
  concept: string;             // SNOMED CT / LOINC / ICD concept code
  displayName: string;         // Human-readable name
  value: any;
  unit?: string;
  interpretation?: 'normal' | 'abnormal' | 'critical' | 'high' | 'low';
  referenceRange?: string;
  flags: string[];
}

// ── Episode of Care ───────────────────────────────────────────────────────────
// A health condition or care period that spans multiple encounters.

export type EpisodeStatus = 'active' | 'resolved' | 'ongoing_chronic' | 'closed' | 'transferred';

export interface EpisodeOfCare {
  id: string;
  patientId: string;
  name: string;
  description: string;
  type: EpisodeType;
  startDate: number;
  endDate?: number;
  status: EpisodeStatus;
  leadClinicianId?: string;
  leadClinicianName?: string;
  primaryOrganizationId?: string;
  primaryOrganizationName?: string;
  careTeam: CareTeamMember[];
  goals: PatientGoal[];
  encounterIds: string[];
  diagnosisIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type EpisodeType =
  | 'pregnancy' | 'acute_illness' | 'chronic_disease' | 'surgery'
  | 'injury' | 'rehabilitation' | 'mental_health' | 'maternal_care'
  | 'newborn_care' | 'childhood' | 'adolescence' | 'vaccination'
  | 'screening' | 'preventive_care' | 'palliative_care' | 'end_of_life'
  | 'cancer' | 'transplant' | 'clinical_trial' | 'wellness'
  | 'other';

export interface CareTeamMember {
  clinicianId: string;
  name: string;
  role: string;
  specialty?: MedicalSpecialty;
  organizationId?: string;
  organizationName?: string;
  isPrimary: boolean;
  active: boolean;
}

export interface PatientGoal {
  id: string;
  description: string;
  targetValue?: string;
  targetDate?: number;
  startDate: number;
  achievedDate?: number;
  status: 'active' | 'achieved' | 'abandoned' | 'revised';
  progressNotes: GoalProgressNote[];
}

export interface GoalProgressNote {
  timestamp: number;
  note: string;
  recordedBy: string;
}

// ── Patient Journey ───────────────────────────────────────────────────────────
// The lifelong wrapper. One patient, one journey.

export interface PatientJourney {
  patientId: string;
  createdAt: number;
  updatedAt: number;
  factCount: number;
  episodeIds: string[];
  careNetworkIds: string[];
  consentIds: string[];
}

// ── Care Network ──────────────────────────────────────────────────────────────
// The set of organizations and providers contributing to a patient's care.

export interface CareNetwork {
  id: string;
  patientId: string;
  organizations: NetworkOrganization[];
  providers: NetworkProvider[];
  createdAt: number;
  updatedAt: number;
}

export interface NetworkOrganization {
  organizationId: string;
  name: string;
  type: OrganizationType;
  relationship: 'primary' | 'referring' | 'consulting' | 'laboratory' | 'pharmacy' | 'imaging' | 'home_care' | 'insurance' | 'community';
  active: boolean;
  addedAt: number;
  removedAt?: number;
}

export interface NetworkProvider {
  clinicianId: string;
  name: string;
  role: string;
  specialty?: MedicalSpecialty;
  organizationId?: string;
  relationship: 'primary_care' | 'specialist' | 'therapist' | 'nurse' | 'pharmacist' | 'dietitian' | 'social_worker' | 'psychologist' | 'other';
  active: boolean;
  addedAt: number;
  removedAt?: number;
  consentGiven: boolean;
}

// ── Consent / Sharing Directive ───────────────────────────────────────────────

export type ConsentScope = 'encounter' | 'episode' | 'document' | 'lab_result' | 'medication' | 'all_records';
export type ConsentGranteeType = 'clinician' | 'organization' | 'department' | 'caregiver' | 'family_member' | 'researcher';

export interface ConsentDirective {
  id: string;
  patientId: string;
  granteeType: ConsentGranteeType;
  granteeId: string;
  granteeName: string;
  scope: ConsentScope;
  scopeId?: string;          // Specific encounter/episode/document ID
  permissions: ('view' | 'contribute' | 'comment')[];
  timeLimited: boolean;
  validFrom: number;
  validUntil?: number;
  emergencyOverride: boolean;
  revoked: boolean;
  revokedAt?: number;
  createdAt: number;
  consentMethod: 'explicit' | 'implied_emergency' | 'legal_guardian' | 'regulatory';
}

// ── Care Gap ──────────────────────────────────────────────────────────────────

export interface CareGap {
  id: string;
  patientId: string;
  episodeId?: string;
  type: CareGapType;
  description: string;
  clinicalRationale: string;
  recommendedAction: string;
  dueDate?: number;
  status: 'open' | 'addressed' | 'declined' | 'not_applicable';
  detectedAt: number;
  addressedAt?: number;
  relatedGuideline?: string;
}

export type CareGapType =
  | 'screening_overdue' | 'lab_missing' | 'imaging_missing'
  | 'specialist_referral_needed' | 'medication_review_due'
  | 'vaccination_due' | 'follow_up_missed' | 'monitoring_lapse';

// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// BOOK II, VOLUME II — UNIVERSAL ENCOUNTER CONSTITUTION
// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

// ── Encounter Classes ─────────────────────────────────────────────────────────

export type EncounterClass =
  | 'administrative' | 'clinical' | 'nursing' | 'laboratory'
  | 'imaging' | 'pharmacy' | 'theatre' | 'community' | 'digital';

export type EncounterType =
  // Administrative
  | 'registration' | 'insurance_verification' | 'appointment_booking'
  | 'bed_assignment' | 'transfer' | 'discharge_processing' | 'records_request'
  // Clinical
  | 'outpatient_consultation' | 'emergency_consultation' | 'ward_review'
  | 'consultant_review' | 'specialist_consultation' | 'procedure_review'
  | 'telemedicine_review'
  // Nursing
  | 'triage' | 'admission_assessment' | 'medication_administration'
  | 'dressing_change' | 'pressure_sore_review' | 'fluid_review'
  | 'vital_signs_review' | 'discharge_education'
  // Laboratory
  | 'specimen_collection' | 'specimen_reception' | 'quality_review'
  | 'result_verification' | 'critical_value_notification'
  // Imaging
  | 'ultrasound' | 'ct' | 'mri' | 'xray' | 'fluoroscopy' | 'image_reporting'
  // Pharmacy
  | 'medication_reconciliation' | 'dispensing' | 'clinical_pharmacy_review'
  | 'controlled_drug_issue' | 'medication_counselling'
  // Theatre
  | 'pre_op' | 'anaesthesia_review' | 'operation' | 'recovery' | 'post_op_review'
  // Community
  | 'home_visit' | 'community_screening' | 'school_health'
  | 'vaccination_outreach' | 'rehabilitation_session'
  // Digital
  | 'chat_consultation' | 'video_consultation' | 'ai_symptom_review'
  | 'remote_monitoring_review' | 'device_synchronization';

// ── Encounter Lifecycle States ────────────────────────────────────────────────

export type EncounterState =
  | 'created' | 'scheduled' | 'patient_arrived' | 'checked_in'
  | 'in_progress' | 'waiting_results' | 'decision_made'
  | 'actions_running' | 'completed' | 'follow_up_pending' | 'closed';

// ── 7-Component Encounter ─────────────────────────────────────────────────────

export interface Encounter {
  id: string;
  patientId: string;
  episodeId?: string;
  encounterClass: EncounterClass;
  encounterType: EncounterType;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  location: EncounterLocation;
  responsibleTeam: ResponsibleClinician[];
  currentState: EncounterState;
  startTime: number;
  endTime?: number;
  expectedDuration?: number;   // minutes

  // The 7 components
  trigger: EncounterTrigger;
  preparation: EncounterPreparation;
  interaction: EncounterInteraction;
  decision: EncounterDecision | null;
  actions: EncounterAction[];
  closure: EncounterClosure | null;
  followUp: FollowUpPlan | null;

  // Cross-references
  linkedEncounterIds: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;

  // Timeline of events within this encounter
  eventCount: number;
}

export interface EncounterLocation {
  type: 'ward' | 'clinic' | 'theatre' | 'icu' | 'emergency' | 'lab' | 'imaging' | 'pharmacy' | 'community' | 'remote' | 'telemedicine';
  wardId?: string;
  wardName?: string;
  clinicId?: string;
  clinicName?: string;
  room?: string;
  bed?: string;
  building?: string;
  floor?: string;
}

export interface ResponsibleClinician {
  clinicianId: string;
  name: string;
  role: string;
  type: 'primary' | 'consultant' | 'team_member' | 'trainee';
  organizationId?: string;
}

// ── Component 1: Trigger ──────────────────────────────────────────────────────

export type EncounterTriggerType =
  | 'appointment' | 'walk_in' | 'emergency' | 'ambulance' | 'referral'
  | 'transfer' | 'ward_round' | 'order' | 'alert' | 'scheduled'
  | 'telemedicine_request' | 'community_outreach' | 'follow_up'
  | 'device_alert' | 'ai_detection' | 'medication_refill'
  | 'vaccination' | 'screening' | 'other';

export interface EncounterTrigger {
  type: EncounterTriggerType;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency' | 'critical';
  triageCategory?: string;       // ESI, Manchester, etc.
  referralId?: string;
  appointmentId?: string;
  alertId?: string;
  initiatedBy: string;
  initiatedAt: number;
}

// ── Component 2: Preparation ──────────────────────────────────────────────────

export interface EncounterPreparation {
  patientSummary: PatientSummary;
  contextAlerts: ContextAlert[];
  consentStatus: ConsentStatus;
  requiredDocuments: string[];
  missingInformation: string[];
  preparedAt: number;
}

export interface PatientSummary {
  name: string;
  age: number;
  sex: string;
  hospitalNumber?: string;
  allergies: string[];
  currentMedications: string[];
  activeDiagnoses: string[];
  recentEncounters: number;
  lastEncounterDate?: number;
  chronicConditions: string[];
  advanceDirectives?: string;
  warnings: string[];
}

export interface ContextAlert {
  type: 'allergy' | 'critical_result' | 'overdue_task' | 'medication_interaction' | 'fall_risk' | 'isolation' | 'advance_directive';
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export type ConsentStatus = 'verified' | 'not_required' | 'pending' | 'emergency_implied' | 'declined';

// ── Component 3: Interaction ──────────────────────────────────────────────────

export interface EncounterInteraction {
  startedAt: number;
  endedAt?: number;
  participants: EncounterParticipant[];
  notes: EncounterNote[];
  contributions: ProfessionalContribution[];
  patientContributions: PatientInput[];
}

export interface EncounterParticipant {
  participantId: string;
  name: string;
  role: string;
  profession: ProfessionalCategory;
  joinedAt: number;
  leftAt?: number;
}

export interface EncounterNote {
  id: string;
  type: EncounterNoteType;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: number;
  updatedAt: number;
  isSigned: boolean;
  signatureId?: string;
}

export type EncounterNoteType =
  | 'admission_note' | 'ward_round_note' | 'progress_note' | 'consultation_note'
  | 'procedure_note' | 'operation_note' | 'discharge_summary' | 'referral_note'
  | 'triage_note' | 'nursing_note' | 'pharmacy_note' | 'lab_note'
  | 'imaging_note' | 'physiotherapy_note' | 'dietitian_note'
  | 'social_work_note' | 'telemedicine_note' | 'telephone_call';

export interface ProfessionalContribution {
  profession: ProfessionalCategory;
  summary: string;
  findings: ClinicalObservation[];
  assessment: string;
  plan: string;
  contributedAt: number;
  clinicianId: string;
  clinicianName: string;
}

export interface PatientInput {
  type: 'symptom_report' | 'questionnaire' | 'home_measurement' | 'medication_log' | 'question' | 'feedback';
  content: any;
  timestamp: number;
  source: string;
}

// ── Component 4: Decision ─────────────────────────────────────────────────────

export type EncounterDecisionType =
  | 'discharge' | 'admit' | 'observe' | 'transfer' | 'operate'
  | 'refer' | 'review_later' | 'start_medication' | 'stop_medication'
  | 'order_investigations' | 'palliative_care' | 'rehabilitation'
  | 'death_certification' | 'icu_admission' | 'procedure'
  | 'no_change' | 'other';

export interface EncounterDecision {
  type: EncounterDecisionType;
  rationale: string;
  diagnosisId?: string;
  madeBy: string;
  madeByName: string;
  madeAt: number;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: number;
  patientInformed: boolean;
  patientConsented: boolean;
}

// ── Component 5: Actions ──────────────────────────────────────────────────────

export interface EncounterAction {
  id: string;
  type: ActionType;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: number;
  completedAt?: number;
  createsWorkflowId?: string;   // Link to workflow this action triggers
}

export type ActionType =
  | 'lab_order' | 'imaging_order' | 'prescription' | 'procedure'
  | 'referral' | 'consult_request' | 'bed_assignment' | 'transfer_request'
  | 'discharge_process' | 'billing' | 'education' | 'counseling'
  | 'notification' | 'documentation' | 'other';

// ── Component 6: Closure ──────────────────────────────────────────────────────

export interface EncounterClosure {
  completedAt: number;
  completedBy: string;
  completedByName: string;
  outcome: EncounterOutcome;
  summary: string;
  documentsGenerated: string[];
  followUpCreated: boolean;
}

export type EncounterOutcome =
  | 'resolved' | 'improved' | 'unchanged' | 'worsened'
  | 'deceased' | 'transferred' | 'left_against_advice'
  | 'referred' | 'admitted' | 'scheduled_procedure';

// ── Component 7: Follow-up ────────────────────────────────────────────────────

export interface FollowUpPlan {
  id: string;
  encounterId: string;
  instructions: FollowUpInstruction[];
  appointments: FollowUpAppointment[];
  monitoringPlan: MonitoringPlan | null;
  createdBy: string;
  createdAt: number;
}

export interface FollowUpInstruction {
  type: 'medication' | 'activity' | 'diet' | 'wound_care' | 'symptom_monitoring' | 'when_to_seek_care';
  instruction: string;
  duration?: string;
}

export interface FollowUpAppointment {
  withName: string;
  withRole: string;
  specialty?: MedicalSpecialty;
  department?: string;
  organizationId?: string;
  scheduledDate?: number;
  urgency: 'routine' | 'urgent' | 'as_soon_as_possible';
  notes?: string;
}

export interface MonitoringPlan {
  parameters: string[];
  frequency: string;
  deviceRequired?: string;
  notificationThresholds: Record<string, any>;
  reviewDate: number;
  responsibleClinicianId?: string;
}

// ── Encounter Timeline Event ──────────────────────────────────────────────────

export interface EncounterTimelineEvent {
  id: string;
  encounterId: string;
  type: string;
  description: string;
  timestamp: number;
  actorId: string;
  actorName: string;
  details?: any;
}

// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// BOOK II, VOLUME III — UNIVERSAL CLINICAL WORKFLOW CONSTITUTION
// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

// ── Primary Clinical States ───────────────────────────────────────────────────
// Every patient is always in exactly one PrimaryClinicalState.

export type PrimaryClinicalState =
  | 'self_care' | 'appointment' | 'waiting' | 'consultation'
  | 'laboratory' | 'radiology' | 'observation' | 'admission'
  | 'theatre' | 'icu' | 'ward' | 'discharge' | 'follow_up'
  | 'long_term_monitoring' | 'emergency_department' | 'resuscitation'
  | 'triage' | 'pharmacy' | 'physiotherapy' | 'community_care'
  | 'home_care' | 'telemedicine' | 'transfer' | 'deceased';

// ── Layered Ownership ─────────────────────────────────────────────────────────

export interface ClinicalOwnership {
  patientOwner: OwnershipEntry;         // Level 1: Responsible clinician
  workflowOwner: OwnershipEntry;        // Level 2: Current department
  taskOwners: OwnershipEntry[];         // Level 3: Individual professionals
  episodeOwner: OwnershipEntry | null;  // Level 4: Primary consultant for episode
  lastTransferredAt: number;
  transferHistory: OwnershipTransfer[];
}

export interface OwnershipEntry {
  ownerId: string;
  ownerName: string;
  ownerType: 'clinician' | 'department' | 'organization';
  role: string;
  assumedAt: number;
}

export interface OwnershipTransfer {
  fromOwner: string;
  fromName: string;
  toOwner: string;
  toName: string;
  transferType: 'handover' | 'referral' | 'discharge' | 'admission' | 'escalation';
  checklistCompleted: boolean;
  accepted: boolean;
  acceptedAt?: number;
  transferredAt: number;
  notes?: string;
}

// ── Workflow Instance ─────────────────────────────────────────────────────────

export interface WorkflowInstance {
  id: string;
  patientId: string;
  encounterId?: string;
  episodeId?: string;
  type: WorkflowType;
  currentState: PrimaryClinicalState;
  previousState: PrimaryClinicalState | null;
  ownership: ClinicalOwnership;
  queueId?: string;
  priority: WorkflowPriority;
  tasks: ClinicalTask[];
  dependencies: WorkflowDependency[];
  startedAt: number;
  expectedCompletionAt?: number;
  completedAt?: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'escalated';
  outcome?: string;
  escalationLevel: number;
}

export type WorkflowType =
  | 'admission' | 'ward_round' | 'laboratory' | 'radiology'
  | 'medication' | 'operation' | 'referral' | 'follow_up'
  | 'billing' | 'home_care' | 'death_certification' | 'discharge'
  | 'consultation' | 'triage' | 'transfer' | 'emergency'
  | 'physiotherapy' | 'nutrition' | 'social_work' | 'screening';

export type WorkflowPriority = 1 | 2 | 3 | 4 | 5;  // 1 = highest (resuscitation)

// ── Queue ─────────────────────────────────────────────────────────────────────

export interface ClinicalQueue {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  type: QueueType;
  items: QueueItem[];
  lastReordered: number;
  averageWaitTime?: number;    // minutes
}

export type QueueType =
  | 'triage' | 'consultation' | 'laboratory' | 'radiology'
  | 'pharmacy' | 'theatre' | 'ward' | 'discharge' | 'referral'
  | 'physiotherapy' | 'dietitian' | 'social_work' | 'procedure';

export interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  workflowId: string;
  encounterId?: string;
  priority: WorkflowPriority;
  priorityReason?: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  enteredAt: number;
  startedAt?: number;
  expectedServiceTime?: number;  // minutes
  waitTime: number;              // computed: now - enteredAt or startedAt - enteredAt
  escalationLevel: number;
  notes?: string;
}

// ── Clinical Task ─────────────────────────────────────────────────────────────

export interface ClinicalTask {
  id: string;
  workflowId: string;
  patientId: string;
  encounterId?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedBy: string;
  assignedByName: string;
  type: TaskType;
  priority: WorkflowPriority;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue' | 'escalated';
  createdAt: number;
  startedAt?: number;
  dueAt?: number;
  completedAt?: number;
  expectedDuration?: number;   // minutes
  clinicalClockTarget?: number; // Expected completion time in minutes from trigger
  dependsOnTaskIds: string[];
  escalationLevel: number;
  escalationHistory: TaskEscalation[];
}

export type TaskType =
  | 'assessment' | 'documentation' | 'ordering' | 'specimen_collection'
  | 'medication_admin' | 'procedure' | 'review' | 'approval'
  | 'notification' | 'consult_request' | 'handover' | 'discharge_process'
  | 'education' | 'follow_up' | 'other';

export interface TaskEscalation {
  escalatedAt: number;
  escalatedTo: string;
  escalatedToName: string;
  reason: string;
  resolvedAt?: number;
}

// ── Workflow Dependency ───────────────────────────────────────────────────────

export interface WorkflowDependency {
  requiredWorkflowId: string;
  requiredTaskId?: string;
  requiredState: string;
  description: string;
  status: 'pending' | 'satisfied' | 'failed';
  satisfiedAt?: number;
}

// ── Escalation Policy ─────────────────────────────────────────────────────────

export interface EscalationPolicy {
  id: string;
  name: string;
  taskType: TaskType;
  departmentId?: string;
  levels: EscalationLevel[];
  maxWaitTime: number;           // minutes before escalation starts
  reEscalationInterval: number;  // minutes between re-escalations
}

export interface EscalationLevel {
  level: number;
  escalateTo: string;
  escalateToRole: string;
  notifyVia: ('in_app' | 'sms' | 'email' | 'whatsapp')[];
  afterMinutes: number;
}

// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// BOOK II, VOLUME IV — UNIVERSAL CARE TEAM CONSTITUTION
// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

export type CareTeamProfession =
  | 'nurse' | 'midwife' | 'pharmacist' | 'lab_technologist'
  | 'radiographer' | 'physiotherapist' | 'occupational_therapist'
  | 'nutritionist' | 'social_worker' | 'psychologist'
  | 'dentist' | 'clinical_officer' | 'community_health_worker';

export type CareTeamAssignmentType =
  | 'ward_round' | 'clinic' | 'emergency' | 'icu' | 'theatre'
  | 'medication_round' | 'triage' | 'wound_care' | 'vitals_round'
  | 'dispensing' | 'clinical_review' | 'reconciliation'
  | 'specimen_processing' | 'result_verification' | 'quality_control'
  | 'xray' | 'ct' | 'mri' | 'ultrasound' | 'imaging_reporting'
  | 'assessment' | 'treatment_session' | 'rehabilitation'
  | 'antenatal_clinic' | 'labour_ward' | 'postnatal_round'
  | 'vaccination' | 'community_screening' | 'health_education'
  | 'home_visit' | 'group_session' | 'counselling'
  | 'discharge_planning' | 'therapy_session' | 'on_call'
  | 'administrative';

export interface CareTeamContext {
  clinicianId: AmxUid;
  clinicianName: string;
  profession: CareTeamProfession;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  unitId?: string;
  unitName?: string;
  shift: CareTeamShift;
  assignment: CareTeamAssignment;
  currentLocation: CareTeamLocation;
  activePatients: ActivePatient[];
  patientQueue: QueueItem[];
  pendingTasks: ClinicalTask[];
  notifications: CareTeamNotification[];
  workspace: CareTeamWorkspace;
  aiAssistant: AIAssistantState | null;
  loadedAt: number;
}

export interface CareTeamShift {
  type: 'morning' | 'afternoon' | 'night' | 'on_call' | 'weekend' | 'long_day';
  startTime: number;
  endTime: number;
  isActive: boolean;
}

export interface CareTeamAssignment {
  type: CareTeamAssignmentType;
  location: string;
  startTime: number;
  endTime: number;
  description: string;
}

export interface CareTeamLocation {
  departmentId: string;
  departmentName: string;
  unit?: string;
  ward?: string;
  clinic?: string;
  bed?: string;
}

export interface CareTeamWorkspace {
  type: CareTeamAssignmentType;
  profession: CareTeamProfession;
  title: string;
  sections: WorkspaceSection[];
  quickActions: CareTeamQuickAction[];
  rightPanel: CareTeamRightPanelConfig;
}

export interface CareTeamQuickAction {
  id: string;
  label: string;
  shortcut?: string;
  action: string;
  requiresPatient: boolean;
}

export interface CareTeamRightPanelConfig {
  showAI: boolean;
  showOrders: boolean;
  showPatientInfo: boolean;
  showGuidelines: boolean;
  showMessaging: boolean;
  showHandover: boolean;
}

export interface CareTeamNotification {
  id: string;
  profession: CareTeamProfession;
  type: 'critical_result' | 'task_assigned' | 'escalation'
       | 'patient_alert' | 'message' | 'reminder' | 'handover';
  title: string;
  message: string;
  patientId?: string;
  priority: 'routine' | 'urgent' | 'critical';
  timestamp: number;
  read: boolean;
  actionable: boolean;
  actionLabel?: string;
  actionLink?: string;
}

export interface CareTeamHandoverNote {
  id: string;
  fromClinicianId: string;
  fromClinicianName: string;
  profession: CareTeamProfession;
  toClinicianId: string;
  toClinicianName: string;
  shift: string;
  patients: HandoverPatient[];
  summary: string;
  createdAt: number;
  acknowledgedAt?: number;
}

// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// BOOK III, VOLUME I — UNIVERSAL DOCTOR OPERATIONAL FLOW (ADOS)
// ──≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

// ── Doctor Operational Context ────────────────────────────────────────────────

export interface DoctorContext {
  doctorId: AmxUid;
  doctorName: string;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  unitId?: string;
  unitName?: string;
  shift: DoctorShift;
  assignment: DoctorAssignment;
  currentLocation: DoctorLocation;
  activePatients: ActivePatient[];
  patientQueue: QueueItem[];
  pendingTasks: ClinicalTask[];
  notifications: DoctorNotification[];
  workspace: DoctorWorkspace;
  aiAssistant: AIAssistantState | null;
  loadedAt: number;
}

export interface DoctorShift {
  type: 'morning' | 'afternoon' | 'night' | 'on_call' | 'weekend' | 'long_day';
  startTime: number;
  endTime: number;
  isActive: boolean;
}

export interface DoctorAssignment {
  type: AssignmentType;
  location: string;
  startTime: number;
  endTime: number;
  description: string;
}

export type AssignmentType =
  | 'ward_round' | 'clinic' | 'theatre' | 'emergency' | 'icu'
  | 'consultation' | 'home_visit' | 'telemedicine' | 'on_call'
  | 'administrative' | 'research' | 'lecture';

export interface DoctorLocation {
  departmentId: string;
  departmentName: string;
  unit?: string;
  ward?: string;
  clinic?: string;
  bed?: string;
}

export interface ActivePatient {
  patientId: string;
  name: string;
  age: number;
  sex: string;
  bed?: string;
  diagnosis: string;
  hospitalDay?: number;
  status: 'stable' | 'unstable' | 'critical' | 'pending_review' | 'ready_for_discharge';
  newsScore?: number;
  alerts: string[];
  updatedAt: number;
}

// ── Doctor Workspace (generated from context) ─────────────────────────────────

export interface DoctorWorkspace {
  type: WorkspaceType;
  title: string;
  sections: WorkspaceSection[];
  quickActions: DoctorQuickAction[];
  rightPanel: RightPanelConfig;
}

export type WorkspaceType =
  | 'ward_round' | 'clinic' | 'emergency' | 'icu'
  | 'theatre' | 'telemedicine' | 'home' | 'admin';

export interface WorkspaceSection {
  id: string;
  title: string;
  items: any[];
  priority: number;
}

export interface DoctorQuickAction {
  id: string;
  label: string;
  shortcut?: string;
  action: string;
  requiresPatient: boolean;
}

export interface RightPanelConfig {
  showAI: boolean;
  showOrders: boolean;
  showCalculators: boolean;
  showGuidelines: boolean;
  showMessaging: boolean;
}

// ── Ward Round ────────────────────────────────────────────────────────────────

export interface WardRound {
  id: string;
  doctorId: AmxUid;
  wardId: string;
  wardName: string;
  startedAt: number;
  completedAt?: number;
  patients: WardRoundPatient[];
  currentPatientIndex: number;
  status: 'preparing' | 'in_progress' | 'paused' | 'completed';
}

export interface WardRoundPatient {
  patientId: string;
  bed: string;
  name: string;
  presentation: PatientPresentation;
  reviewed: boolean;
  decision?: EncounterDecisionType;
}

export interface PatientPresentation {
  identity: {
    name: string;
    age: number;
    sex: string;
    hospitalDay: number;
    bed: string;
    consultant: string;
  };
  chiefProblem: string;
  overnightEvents: string[];
  currentStatus: {
    vitals: ClinicalObservation[];
    newsScore: number;
    mewsScore?: number;
    glucose?: number;
    painScore?: number;
    weight?: number;
  };
  inputOutput: {
    fluidBalance: string;
    urine: string;
    drain?: string;
    ng?: string;
    stoma?: string;
  };
  investigations: InvestigationTrend[];
  currentTreatment: string[];
  assessment: string;
  plan: string;
  aiSummary?: string;
}

export interface InvestigationTrend {
  name: string;
  values: { date: number; value: any; flagged: boolean }[];
  trend: 'rising' | 'falling' | 'stable' | 'fluctuating';
}

// ── Doctor Notification ───────────────────────────────────────────────────────

export interface DoctorNotification {
  id: string;
  type: 'critical_result' | 'consult_request' | 'task_assigned' | 'escalation'
       | 'patient_alert' | 'message' | 'reminder';
  title: string;
  message: string;
  patientId?: string;
  priority: 'routine' | 'urgent' | 'critical';
  timestamp: number;
  read: boolean;
  actionable: boolean;
  actionLabel?: string;
  actionLink?: string;
}

// ── AI Assistant ──────────────────────────────────────────────────────────────

export interface AIAssistantState {
  enabled: boolean;
  currentPatientId?: string;
  suggestions: string[];
  pendingActions: string[];
}

// ── Handover ──────────────────────────────────────────────────────────────────

export interface HandoverNote {
  id: string;
  fromClinicianId: string;
  fromClinicianName: string;
  toClinicianId: string;
  toClinicianName: string;
  shift: string;
  patients: HandoverPatient[];
  summary: string;
  createdAt: number;
  acknowledgedAt?: number;
}

export interface HandoverPatient {
  patientId: string;
  name: string;
  bed: string;
  diagnosis: string;
  currentIssues: string[];
  pendingTasks: string[];
  pendingResults: string[];
  nightInstructions: string[];
  escalationCriteria: string[];
  status: 'stable' | 'unstable' | 'critical' | 'for_discharge';
}
