export const CONSTITUTION_VERSION = '1.0.0';

export enum ObjectCategory {
  Identity = 'identity',
  Encounter = 'encounter',
  ClinicalKnowledge = 'clinical_knowledge',
  Observation = 'observation',
  Reasoning = 'reasoning',
  Management = 'management',
  Workflow = 'workflow',
  Documentation = 'documentation',
  Administrative = 'administrative',
}

export enum ObjectType {
  Patient = 'patient',
  Person = 'person',
  Clinician = 'clinician',
  Caregiver = 'caregiver',
  Facility = 'facility',
  Organization = 'organization',
  Department = 'department',
  Ward = 'ward',
  Room = 'room',
  Bed = 'bed',
  Device = 'device',
  Laboratory = 'laboratory',
  Pharmacy = 'pharmacy',
  InsuranceProvider = 'insurance_provider',
  ResearchStudy = 'research_study',

  Encounter = 'encounter',
  Visit = 'visit',
  Admission = 'admission',
  Consultation = 'consultation',
  WardRound = 'ward_round',
  EmergencyAssessment = 'emergency_assessment',
  TelemedicineSession = 'telemedicine_session',
  Procedure = 'procedure',
  Operation = 'operation',
  Referral = 'referral',
  Transfer = 'transfer',
  Discharge = 'discharge',
  FollowUp = 'follow_up',

  Symptom = 'symptom',
  Sign = 'sign',
  Mechanism = 'mechanism',
  Phenotype = 'phenotype',
  Syndrome = 'syndrome',
  Disease = 'disease',
  Diagnosis = 'diagnosis',
  Complication = 'complication',
  Investigation = 'investigation',
  Treatment = 'treatment',
  Drug = 'drug',
  MedicalProcedure = 'medical_procedure',
  Protocol = 'protocol',
  Guideline = 'guideline',
  RiskFactor = 'risk_factor',
  Score = 'score',
  DecisionRule = 'decision_rule',
  Differential = 'differential',
  Contraindication = 'contraindication',
  AdverseEffect = 'adverse_effect',

  Question = 'question',
  Answer = 'answer',
  Finding = 'finding',
  Measurement = 'measurement',
  VitalSign = 'vital_sign',
  LabResult = 'lab_result',
  ImagingResult = 'imaging_result',
  PhysicalFinding = 'physical_finding',
  AnthropometricMeasurement = 'anthropometric_measurement',
  TimelineEvent = 'timeline_event',

  Evidence = 'evidence',
  Hypothesis = 'hypothesis',
  DifferentialDiagnosis = 'differential_diagnosis',
  WorkingDiagnosis = 'working_diagnosis',
  ConfirmedDiagnosis = 'confirmed_diagnosis',
  Problem = 'problem',
  Assessment = 'assessment',
  ClinicalImpression = 'clinical_impression',
  Decision = 'decision',
  Recommendation = 'recommendation',

  Prescription = 'prescription',
  Order = 'order',
  TreatmentPlan = 'treatment_plan',
  MonitoringPlan = 'monitoring_plan',
  ProcedurePlan = 'procedure_plan',
  NursingCare = 'nursing_care',
  Counselling = 'counselling',
  Rehabilitation = 'rehabilitation',
  NutritionPlan = 'nutrition_plan',
  PreventiveMeasure = 'preventive_measure',
  FollowUpPlan = 'follow_up_plan',

  Task = 'task',
  Queue = 'queue',
  Assignment = 'assignment',
  Notification = 'notification',
  Escalation = 'escalation',
  Approval = 'approval',
  AuditRecord = 'audit_record',
  StateTransition = 'state_transition',

  HistoryNote = 'history_note',
  SOAPNote = 'soap_note',
  AdmissionNote = 'admission_note',
  ProgressNote = 'progress_note',
  OperationNote = 'operation_note',
  ReferralLetter = 'referral_letter',
  DischargeSummary = 'discharge_summary',
  DeathSummary = 'death_summary',
  MedicalCertificate = 'medical_certificate',
  ConsentForm = 'consent_form',
  PrescriptionSheet = 'prescription_sheet',
  TreatmentSheet = 'treatment_sheet',
  ObservationChart = 'observation_chart',

  Billing = 'billing',
  Invoice = 'invoice',
  Payment = 'payment',
  Claim = 'claim',
  Authorization = 'authorization',
  StockItem = 'stock_item',
  Appointment = 'appointment',
  ResourceAllocation = 'resource_allocation',
  Schedule = 'schedule',

  Event = 'event',
  Context = 'context',
  Equipment = 'equipment',
  Population = 'population',
  System = 'system',
  Reference = 'reference',
  Relationship = 'relationship',
  Rule = 'rule',
  Module = 'module',
  Section = 'section',
  Documentation = 'documentation_doc',
  Workflow = 'workflow_def',
  Pregnancy = 'pregnancy',

  BodySystem = 'body_system',
  AnatomicalStructure = 'anatomical_structure',
  Organism = 'organism',
  TissueType = 'tissue_type',
  CellType = 'cell_type',
  BodyFluid = 'body_fluid',
  MedicalDevice = 'medical_device',
  Implant = 'implant',
  Vaccine = 'vaccine',
  Allergen = 'allergen',
  BloodProduct = 'blood_product',
  AnatomicalPlane = 'anatomical_plane',
  MedicalSpecialty = 'medical_specialty',
  SymptomComplex = 'symptom_complex',
  Stage = 'stage',
  Grade = 'grade',
  Phase = 'phase',
  Episode = 'episode',
  SeverityScore = 'severity_score',
  TriageScore = 'triage_score',
  ApgarScore = 'apgar_score',
  PainScale = 'pain_scale',
  AllergyIntolerance = 'allergy_intolerance',
  ImmunizationRecord = 'immunization_record',
  ExposureEvent = 'exposure_event',
  FamilyHistoryRecord = 'family_history_record',
  SocialHistoryRecord = 'social_history_record',
  TravelHistoryRecord = 'travel_history_record',
  NutritionalAssessment = 'nutritional_assessment',
  WoundAssessment = 'wound_assessment',
  FallRiskAssessment = 'fall_risk_assessment',
  SepsisScreen = 'sepsis_screen',
  TB_Screen = 'tb_screen',
  CancerScreen = 'cancer_screen',
  AntenatalScreen = 'antenatal_screen',
  PostnatalScreen = 'postnatal_screen',
  OrganFunction = 'organ_function',
  FunctionalStatus = 'functional_status',
  QualityOfLife = 'quality_of_life',
  Biomarker = 'biomarker',
  GeneticMarker = 'genetic_marker',
  HealthStatus = 'health_status',
  NursingObservation = 'nursing_observation',
  FluidBalance = 'fluid_balance',
  IntakeOutput = 'intake_output',
}

export const OBJECT_CATEGORY: Record<ObjectType, ObjectCategory> = {
  [ObjectType.Patient]: ObjectCategory.Identity,
  [ObjectType.Person]: ObjectCategory.Identity,
  [ObjectType.Clinician]: ObjectCategory.Identity,
  [ObjectType.Caregiver]: ObjectCategory.Identity,
  [ObjectType.Facility]: ObjectCategory.Identity,
  [ObjectType.Organization]: ObjectCategory.Identity,
  [ObjectType.Department]: ObjectCategory.Identity,
  [ObjectType.Ward]: ObjectCategory.Identity,
  [ObjectType.Room]: ObjectCategory.Identity,
  [ObjectType.Bed]: ObjectCategory.Identity,
  [ObjectType.Device]: ObjectCategory.Identity,
  [ObjectType.Laboratory]: ObjectCategory.Identity,
  [ObjectType.Pharmacy]: ObjectCategory.Identity,
  [ObjectType.InsuranceProvider]: ObjectCategory.Identity,
  [ObjectType.ResearchStudy]: ObjectCategory.Identity,

  [ObjectType.Encounter]: ObjectCategory.Encounter,
  [ObjectType.Visit]: ObjectCategory.Encounter,
  [ObjectType.Admission]: ObjectCategory.Encounter,
  [ObjectType.Consultation]: ObjectCategory.Encounter,
  [ObjectType.WardRound]: ObjectCategory.Encounter,
  [ObjectType.EmergencyAssessment]: ObjectCategory.Encounter,
  [ObjectType.TelemedicineSession]: ObjectCategory.Encounter,
  [ObjectType.Procedure]: ObjectCategory.Encounter,
  [ObjectType.Operation]: ObjectCategory.Encounter,
  [ObjectType.Referral]: ObjectCategory.Encounter,
  [ObjectType.Transfer]: ObjectCategory.Encounter,
  [ObjectType.Discharge]: ObjectCategory.Encounter,
  [ObjectType.FollowUp]: ObjectCategory.Encounter,

  [ObjectType.Symptom]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Sign]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Mechanism]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Phenotype]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Syndrome]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Disease]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Diagnosis]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Complication]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Investigation]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Treatment]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Drug]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.MedicalProcedure]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Protocol]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Guideline]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.RiskFactor]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Score]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.DecisionRule]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Differential]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Contraindication]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.AdverseEffect]: ObjectCategory.ClinicalKnowledge,

  [ObjectType.Question]: ObjectCategory.Observation,
  [ObjectType.Answer]: ObjectCategory.Observation,
  [ObjectType.Finding]: ObjectCategory.Observation,
  [ObjectType.Measurement]: ObjectCategory.Observation,
  [ObjectType.VitalSign]: ObjectCategory.Observation,
  [ObjectType.LabResult]: ObjectCategory.Observation,
  [ObjectType.ImagingResult]: ObjectCategory.Observation,
  [ObjectType.PhysicalFinding]: ObjectCategory.Observation,
  [ObjectType.AnthropometricMeasurement]: ObjectCategory.Observation,
  [ObjectType.TimelineEvent]: ObjectCategory.Observation,

  [ObjectType.Evidence]: ObjectCategory.Reasoning,
  [ObjectType.Hypothesis]: ObjectCategory.Reasoning,
  [ObjectType.DifferentialDiagnosis]: ObjectCategory.Reasoning,
  [ObjectType.WorkingDiagnosis]: ObjectCategory.Reasoning,
  [ObjectType.ConfirmedDiagnosis]: ObjectCategory.Reasoning,
  [ObjectType.Problem]: ObjectCategory.Reasoning,
  [ObjectType.Assessment]: ObjectCategory.Reasoning,
  [ObjectType.ClinicalImpression]: ObjectCategory.Reasoning,
  [ObjectType.Decision]: ObjectCategory.Reasoning,
  [ObjectType.Recommendation]: ObjectCategory.Reasoning,

  [ObjectType.Prescription]: ObjectCategory.Management,
  [ObjectType.Order]: ObjectCategory.Management,
  [ObjectType.TreatmentPlan]: ObjectCategory.Management,
  [ObjectType.MonitoringPlan]: ObjectCategory.Management,
  [ObjectType.ProcedurePlan]: ObjectCategory.Management,
  [ObjectType.NursingCare]: ObjectCategory.Management,
  [ObjectType.Counselling]: ObjectCategory.Management,
  [ObjectType.Rehabilitation]: ObjectCategory.Management,
  [ObjectType.NutritionPlan]: ObjectCategory.Management,
  [ObjectType.PreventiveMeasure]: ObjectCategory.Management,
  [ObjectType.FollowUpPlan]: ObjectCategory.Management,

  [ObjectType.Task]: ObjectCategory.Workflow,
  [ObjectType.Queue]: ObjectCategory.Workflow,
  [ObjectType.Assignment]: ObjectCategory.Workflow,
  [ObjectType.Notification]: ObjectCategory.Workflow,
  [ObjectType.Escalation]: ObjectCategory.Workflow,
  [ObjectType.Approval]: ObjectCategory.Workflow,
  [ObjectType.AuditRecord]: ObjectCategory.Workflow,
  [ObjectType.StateTransition]: ObjectCategory.Workflow,

  [ObjectType.HistoryNote]: ObjectCategory.Documentation,
  [ObjectType.SOAPNote]: ObjectCategory.Documentation,
  [ObjectType.AdmissionNote]: ObjectCategory.Documentation,
  [ObjectType.ProgressNote]: ObjectCategory.Documentation,
  [ObjectType.OperationNote]: ObjectCategory.Documentation,
  [ObjectType.ReferralLetter]: ObjectCategory.Documentation,
  [ObjectType.DischargeSummary]: ObjectCategory.Documentation,
  [ObjectType.DeathSummary]: ObjectCategory.Documentation,
  [ObjectType.MedicalCertificate]: ObjectCategory.Documentation,
  [ObjectType.ConsentForm]: ObjectCategory.Documentation,
  [ObjectType.PrescriptionSheet]: ObjectCategory.Documentation,
  [ObjectType.TreatmentSheet]: ObjectCategory.Documentation,
  [ObjectType.ObservationChart]: ObjectCategory.Documentation,

  [ObjectType.Billing]: ObjectCategory.Administrative,
  [ObjectType.Invoice]: ObjectCategory.Administrative,
  [ObjectType.Payment]: ObjectCategory.Administrative,
  [ObjectType.Claim]: ObjectCategory.Administrative,
  [ObjectType.Authorization]: ObjectCategory.Administrative,
  [ObjectType.StockItem]: ObjectCategory.Administrative,
  [ObjectType.Appointment]: ObjectCategory.Administrative,
  [ObjectType.ResourceAllocation]: ObjectCategory.Administrative,
  [ObjectType.Schedule]: ObjectCategory.Administrative,

  [ObjectType.Event]: ObjectCategory.Workflow,
  [ObjectType.Context]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Equipment]: ObjectCategory.Identity,
  [ObjectType.Population]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.System]: ObjectCategory.Identity,
  [ObjectType.Reference]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Relationship]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Rule]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Module]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Section]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Documentation]: ObjectCategory.Documentation,
  [ObjectType.Workflow]: ObjectCategory.Workflow,
  [ObjectType.Pregnancy]: ObjectCategory.ClinicalKnowledge,

  [ObjectType.BodySystem]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.AnatomicalStructure]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Organism]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.TissueType]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.CellType]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.BodyFluid]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.MedicalDevice]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Implant]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Vaccine]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Allergen]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.BloodProduct]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.AnatomicalPlane]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.MedicalSpecialty]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.SymptomComplex]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Stage]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Grade]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Phase]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Episode]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.SeverityScore]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.TriageScore]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.ApgarScore]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.PainScale]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.AllergyIntolerance]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.ImmunizationRecord]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.ExposureEvent]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.FamilyHistoryRecord]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.SocialHistoryRecord]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.TravelHistoryRecord]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.NutritionalAssessment]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.WoundAssessment]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.FallRiskAssessment]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.SepsisScreen]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.TB_Screen]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.CancerScreen]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.AntenatalScreen]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.PostnatalScreen]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.OrganFunction]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.FunctionalStatus]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.QualityOfLife]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.Biomarker]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.GeneticMarker]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.HealthStatus]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.NursingObservation]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.FluidBalance]: ObjectCategory.ClinicalKnowledge,
  [ObjectType.IntakeOutput]: ObjectCategory.ClinicalKnowledge,
};

export type ObjectStatus =
  | 'active'
  | 'superseded'
  | 'retracted'
  | 'invalidated'
  | 'merged'
  | 'archived';

export interface ConstitutionalIdentity {
  uid: string;
  globalId: string;
  objectType: ObjectType;
  version: number;
  createdAt: number;
  creator: string;
  owningOrganization: string;
}

export interface ConstitutionalLifecycle {
  currentState: string;
  previousState: string | null;
  status: ObjectStatus;
  activationDate: number | null;
  retirementDate: number | null;
  supersededBy: string | null;
  derivedFrom: string | null;
}

export interface ConstitutionalGovernance {
  evidenceLevel: EvidenceLevel;
  confidence: number;
  validationStatus: ValidationStatus;
  approvalStatus: ApprovalStatus;
  jurisdiction: string;
  applicablePopulation: string;
  applicableContext: string[];
}

export interface ConstitutionalSecurity {
  owner: string;
  permissions: string[];
  visibility: string;
  auditTrail: AuditEntry[];
  digitalSignature: string | null;
  encryptionMetadata: Record<string, string> | null;
}

export interface ConstitutionalInteroperability {
  fhirMapping: MappingRef[];
  icdMapping: MappingRef[];
  snomedMapping: MappingRef[];
  loincMapping: MappingRef[];
  atcMapping: MappingRef[];
  externalIds: Record<string, string>;
}

export interface ConstitutionalObjectBase {
  identity: ConstitutionalIdentity;
  lifecycle: ConstitutionalLifecycle;
  governance: ConstitutionalGovernance;
  security: ConstitutionalSecurity;
  interoperability: ConstitutionalInteroperability;
  events: {
    emits: string[];
    consumes: string[];
  };
  relationships: {
    allowedTargetTypes: ObjectType[];
    relationshipTypes: string[];
  };
  rules: {
    governingRuleIds: string[];
  };
  contexts: {
    activatesIn: string[];
  };
  documentation: {
    contributesTo: string[];
  };
  workflows: {
    participatesIn: string[];
  };
  reasoning: {
    usableBy: string[];
  };
  apis: {
    exposes: string[];
  };
}

export type EvidenceLevel =
  | 'systematic_review'
  | 'randomized_trial'
  | 'cohort_study'
  | 'case_control'
  | 'case_series'
  | 'expert_opinion'
  | 'consensus_guideline'
  | 'textbook';

export type ValidationStatus =
  | 'draft'
  | 'validated'
  | 'peer_reviewed'
  | 'published'
  | 'withdrawn';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'superseded';

export interface MappingRef {
  system: string;
  code: string;
  display: string;
  version: string;
}

export interface AuditEntry {
  timestamp: number;
  actor: string;
  action: string;
  resource: string;
  details: string;
  signature: string;
}

export function createConstitutionalBase(
  type: ObjectType,
  overrides?: Partial<ConstitutionalObjectBase>,
): ConstitutionalObjectBase {
  return {
    identity: {
      uid: crypto.randomUUID(),
      globalId: '',
      objectType: type,
      version: 1,
      createdAt: Date.now(),
      creator: 'system',
      owningOrganization: 'amexan',
    },
    lifecycle: {
      currentState: 'active',
      previousState: null,
      status: 'active',
      activationDate: Date.now(),
      retirementDate: null,
      supersededBy: null,
      derivedFrom: null,
    },
    governance: {
      evidenceLevel: 'expert_opinion',
      confidence: 1.0,
      validationStatus: 'draft',
      approvalStatus: 'pending',
      jurisdiction: 'universal',
      applicablePopulation: 'all',
      applicableContext: [],
    },
    security: {
      owner: 'system',
      permissions: [],
      visibility: 'public',
      auditTrail: [],
      digitalSignature: null,
      encryptionMetadata: null,
    },
    interoperability: {
      fhirMapping: [],
      icdMapping: [],
      snomedMapping: [],
      loincMapping: [],
      atcMapping: [],
      externalIds: {},
    },
    events: { emits: [], consumes: [] },
    relationships: { allowedTargetTypes: [], relationshipTypes: [] },
    rules: { governingRuleIds: [] },
    contexts: { activatesIn: [] },
    documentation: { contributesTo: [] },
    workflows: { participatesIn: [] },
    reasoning: { usableBy: [] },
    apis: { exposes: [] },
    ...overrides,
  };
}

export function inheritObject(
  base: ConstitutionalObjectBase,
  overrides: Partial<ConstitutionalObjectBase>,
): ConstitutionalObjectBase {
  return {
    ...base,
    ...overrides,
    identity: { ...base.identity, ...overrides.identity },
    lifecycle: { ...base.lifecycle, ...overrides.lifecycle },
    governance: { ...base.governance, ...overrides.governance },
    security: { ...base.security, ...overrides.security },
    interoperability: { ...base.interoperability, ...overrides.interoperability },
    events: { ...base.events, ...overrides.events },
    relationships: { ...base.relationships, ...overrides.relationships },
    rules: { ...base.rules, ...overrides.rules },
    contexts: { ...base.contexts, ...overrides.contexts },
    documentation: { ...base.documentation, ...overrides.documentation },
    workflows: { ...base.workflows, ...overrides.workflows },
    reasoning: { ...base.reasoning, ...overrides.reasoning },
    apis: { ...base.apis, ...overrides.apis },
  };
}
