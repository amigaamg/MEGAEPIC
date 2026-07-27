export type AnswerState = 'captured' | 'unknown' | 'unable' | 'declined' | 'not_applicable';

export type AnswerSource = 'patient' | 'guardian' | 'record' | 'clinician' | 'system' | 'ai' | 'calculated';

export interface Answer<T = unknown> {
  value: T | null;
  state: AnswerState;
  source: AnswerSource;
  confidence: number;
  timestamp: number;
  author: string;
  previousState?: Answer<T>;
}

export type AgeGroup =
  | 'preterm_neonate' | 'term_neonate' | 'infant'
  | 'toddler' | 'preschool' | 'school_age'
  | 'adolescent' | 'adult' | 'older_adult'
  | 'unknown';

export type DevelopmentalStage =
  | 'preterm_neonate' | 'term_neonate' | 'infant'
  | 'toddler' | 'preschool' | 'school_age'
  | 'adolescent' | 'young_adult' | 'middle_adult'
  | 'older_adult' | 'frail_elderly' | 'unknown';

export type NutritionalStatus =
  | 'normal' | 'moderate_malnutrition' | 'severe_malnutrition'
  | 'overweight' | 'obese' | 'unknown';

export type Sex = 'male' | 'female' | 'unknown';

export type ReproductiveStage =
  | 'pre_menarche' | 'reproductive_age' | 'pregnant'
  | 'labour' | 'postpartum' | 'post_menopausal'
  | 'male' | 'unknown';

export type PregnancyStatus = 'not_pregnant' | 'pregnant' | 'postpartum' | 'unsure' | 'unknown';

export type EncounterType =
  | 'new_consultation' | 'review' | 'follow_up'
  | 'ward_round' | 'admission' | 'transfer' | 'discharge'
  | 'icu_review' | 'referral' | 'procedure' | 'operation'
  | 'telemedicine' | 'community_visit' | 'home_visit' | 'outreach'
  | 'emergency' | 'outpatient' | 'inpatient'
  | 'theatre' | 'icu' | 'antenatal' | 'postnatal'
  | 'well_baby' | 'mental_health';

export type Department =
  | 'medicine' | 'surgery' | 'pediatrics' | 'obstetrics_gynaecology'
  | 'orthopedics' | 'ent' | 'ophthalmology' | 'dermatology'
  | 'psychiatry' | 'neurology' | 'cardiology' | 'respiratory'
  | 'icu' | 'emergency_medicine' | 'neonatology' | 'renal'
  | 'endocrinology' | 'hematology' | 'oncology' | 'infectious_disease'
  | 'general' | 'other';

export type TriageCategory = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'none';

export type ModeOfArrival = 'walking' | 'ambulance' | 'police' | 'wheelchair' | 'stretcher' | 'private_car' | 'other' | 'unknown';

export type ClinicalCohort =
  | 'adult_male' | 'adult_female'
  | 'pediatric_male' | 'pediatric_female'
  | 'neonatal_male' | 'neonatal_female'
  | 'geriatric_male' | 'geriatric_female'
  | 'pregnant_female' | 'postpartum_female'
  | 'unknown';

export type GeriatricSubtype = 'not_geriatric' | 'young_old' | 'middle_old' | 'oldest_old' | 'unknown';

export type ModuleType =
  | 'neonatal' | 'infant' | 'pediatric' | 'adolescent' | 'adult' | 'geriatric'
  | 'female' | 'male' | 'pregnancy' | 'postpartum'
  | 'psychiatry' | 'surgery' | 'emergency' | 'trauma'
  | 'cardiology' | 'respiratory' | 'neurology' | 'gi' | 'renal' | 'endo'
  | 'obstetrics' | 'gynaecology' | 'orthopedics' | 'ent' | 'ophthalmology'
  | 'dermatology' | 'infectious_disease' | 'oncology' | 'hematology'
  | 'icu_critical_care' | 'neonatology' | 'geriatrics' | 'palliative';

export type RegistrationStage =
  | 'identity'
  | 'patient_context'
  | 'encounter_context'
  | 'clinical_context'
  | 'administrative_context'
  | 'registration_complete';

export type GateStatus = 'locked' | 'pending' | 'active' | 'completed';

export type WorkflowType =
  | 'emergency_resuscitation'
  | 'full_clerking'
  | 'ward_round_review'
  | 'follow_up_review'
  | 'telemedicine_review'
  | 'procedure_check_in'
  | 'rapid_assessment'
  | 'neonatal_admission'
  | 'newborn_review'
  | 'paediatric_clerking'
  | 'antenatal_visit'
  | 'postnatal_review'
  | 'transfer_of_care'
  | 'referral_letter'
  | 'discharge_summary'
  | 'icu_handover'
  | 'well_child_visit'
  | 'preoperative_assessment'
  | 'postoperative_review';

export interface NeonatalDetails {
  gestationAtBirth: Answer<number>;
  correctedAgeMonths: number;
  chronologicalAgeMonths: number;
  dayOfLife: number;
  birthWeight: Answer<number>;
  birthLength: Answer<number>;
  birthHeadCircumference: Answer<number>;
  deliveryMode: Answer<string>;
  apgar1min: Answer<number>;
  apgar5min: Answer<number>;
  resuscitationAtBirth: Answer<string>;
  nicuAdmission: Answer<boolean>;
  nicuReason: Answer<string>;
}

export interface PediatricGrowthDetails {
  currentWeight: Answer<number>;
  currentHeight: Answer<number>;
  currentHeadCircumference: Answer<number>;
  weightForAgeZ: number;
  heightForAgeZ: number;
  weightForHeightZ: number;
  bmi: number;
  bmiPercentile: number;
  nutritionalStatus: NutritionalStatus;
  muac: Answer<number>;
}

export interface DemographicContext {
  age: Answer<number>;
  ageUnit: Answer<'years' | 'months' | 'days'>;
  ageGroup: AgeGroup;
  developmentalStage: DevelopmentalStage;
  clinicalCohort: ClinicalCohort;
  reproductiveStage: ReproductiveStage;
  geriatricSubtype: GeriatricSubtype;
  sex: Answer<Sex>;
  dateOfBirth: Answer<string>;
  chronologicalAgeMonths: number;
  correctedAgeMonths: number;
  dayOfLife: number;
  neonatal: NeonatalDetails;
  pediatricGrowth: PediatricGrowthDetails;
}

export interface ClinicalContextState {
  pregnancy: PregnancyStatus;
  pregnancyDetails: {
    confirmed: Answer<boolean>;
    confirmationMethod: Answer<'upt' | 'ultrasound' | 'clinical' | 'unknown'>;
    lmp: Answer<string>;
    gestationalAgeWeeks: Answer<number>;
    gestationalAgeDays: Answer<number>;
    edd: Answer<string>;
    trimester: Answer<1 | 2 | 3>;
    datingUltrasoundPerformed: Answer<boolean>;
    gravida: Answer<number>;
    para: Answer<number>;
    abortus: Answer<number>;
    livingChildren: Answer<number>;
  };
  isNeonatal: boolean;
  isPediatric: boolean;
  isGeriatric: boolean;
  isPsychiatric: boolean;
  isSurgical: boolean;
  isTrauma: boolean;
  activeModules: ModuleType[];
}

export interface EncounterCascadeFlags {
  showPrehospitalCare: boolean;
  showMedicoLegal: boolean;
  showTransferNotes: boolean;
  showAbcdeResuscitation: boolean;
  skipFullHistory: boolean;
  showReferralDetails: boolean;
}

export interface EncounterContextState {
  encounterType: EncounterType;
  department: Department;
  specialty: string;
  service: string;
  unit: string;
  ward: Answer<string>;
  bed: Answer<string>;
  team: Answer<string>;
  consultant: Answer<string>;
  triageCategory: TriageCategory;
  modeOfArrival: ModeOfArrival;
  referralSource: string;
  cascadeFlags: EncounterCascadeFlags;
  isEmergency: boolean;
  isInpatient: boolean;
  isWardRound: boolean;
  isFollowUp: boolean;
  isTransfer: boolean;
  isReferral: boolean;
  isNewConsultation: boolean;
  isReview: boolean;
  isProcedure: boolean;
  isOperation: boolean;
  isDischarge: boolean;
  isTelemedicine: boolean;
  isCommunityVisit: boolean;
}

export interface WorkflowContextState {
  workflowType: WorkflowType;
  availableHpiTemplates: string[];
  availableExaminationModules: string[];
  activeDocumentationFlows: string[];
  requiredScoringSystems: string[];
  suggestedQuestionGroups: string[];
}

export interface VisibilityRules {
  visibleSections: Set<string>;
  requiredFields: Record<string, string[]>;
  hiddenFields: Set<string>;
  disabledFields: Set<string>;
  visibleModules: Set<ModuleType>;
}

export interface PermissionContext {
  canEdit: boolean;
  canSign: boolean;
  canDelete: boolean;
  canOverride: boolean;
  canViewSensitive: boolean;
  restrictedFields: string[];
}

export interface DocumentationPlan {
  prefilledSections: string[];
  omittedSections: string[];
  autoGenerateSections: string[];
  requiresClinicianInput: string[];
  signatureRequired: boolean;
}

export interface DSSContext {
  activeRules: string[];
  activeCalculators: string[];
  activeAlerts: string[];
  suggestedDifferentialCategories: string[];
}

export interface ClinicalContext {
  demographic: DemographicContext;
  clinical: ClinicalContextState;
  encounter: EncounterContextState;
  workflow: WorkflowContextState;
  visibility: VisibilityRules;
  permissions: PermissionContext;
  documentation: DocumentationPlan;
  decisionSupport: DSSContext;
}

export interface RegistrationState {
  stage: RegistrationStage;
  completedStages: RegistrationStage[];
  data: Record<string, Answer>;
  validationErrors: Record<string, string[]>;
  stageStatuses: Record<string, string>;
  contextSummary: string[];
  activeFields: string[];
}

export interface StageDefinition {
  id: RegistrationStage;
  label: string;
  description: string;
  icon: string;
  required: boolean;
  prerequisites: RegistrationStage[];
}

export interface InformantRule {
  applicableAges: { minMonths?: number; maxMonths?: number };
  applicableConditions?: string[];
  eligibleInformants: string[];
  reliabilityOverride?: 'poor' | 'fair' | 'good' | 'unreliable';
}
