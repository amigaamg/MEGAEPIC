// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK III
// CLINICAL PRESENTATION OBJECT REGISTRY
// Every clinical entry point defined once, consumed by all engines.
// ═══════════════════════════════════════════════════════════════

export type PresentationType =
  | 'symptom' | 'sign' | 'known_disease' | 'procedure'
  | 'review' | 'screening' | 'follow_up' | 'preventive'
  | 'emergency' | 'trauma' | 'administrative';

export type BodySystem =
  | 'general' | 'respiratory' | 'cardiovascular' | 'gi'
  | 'neurological' | 'musculoskeletal' | 'genitourinary'
  | 'obgyn' | 'ent' | 'ophthalmology' | 'dermatology'
  | 'psychiatric' | 'endocrine' | 'renal' | 'hepatic'
  | 'hematology' | 'lymphatic' | 'immune';

export type MechanismCategory =
  | 'infectious' | 'inflammatory' | 'neoplastic' | 'vascular'
  | 'traumatic' | 'degenerative' | 'congenital' | 'metabolic'
  | 'endocrine_disorder' | 'autoimmune' | 'toxic' | 'idiopathic'
  | 'functional' | 'obstructive' | 'ischemic' | 'hemorrhagic'
  | 'psychogenic' | 'iatrogenic' | 'nutritional'
  | 'aspiration' | 'cardiac' | 'neurological' | 'musculoskeletal'
  | 'malabsorptive' | 'coagulopathic';

export type EmergencyLevel = 'green' | 'yellow' | 'orange' | 'red';

export type PresentationStatus = 'active' | 'resolved' | 'historical' | 'recurring';

export type PresentationConfidence = 'confirmed' | 'likely' | 'possible' | 'uncertain';

export type ClinicalSyndrome =
  | 'respiratory_syndrome' | 'cardiovascular_syndrome'
  | 'acute_abdomen' | 'neurological_syndrome'
  | 'hemorrhagic_shock' | 'sepsis_syndrome'
  | 'obstructive_airway' | 'head_trauma'
  | 'obstetric_emergency' | 'neonatal_sepsis'
  | 'anaphylaxis' | 'toxic_ingestion';

export interface PresentationAgeRule {
  minMonths?: number;
  maxMonths?: number;
  groups?: string[];
}

export interface PresentationActivationRule {
  type: 'age' | 'sex' | 'pregnancy' | 'department' | 'encounter_type' | 'module_active';
  value: unknown;
  not?: boolean;
}

export interface PresentationVisibilityRules {
  showSections: string[];
  hideSections: string[];
  showTabs: string[];
  hideTabs: string[];
  showCards: string[];
  hideCards: string[];
  showButtons: string[];
  hideButtons: string[];
}

export interface PresentationHistoryRules {
  requiredQuestions: string[];
  optionalQuestions: string[];
  conditionalQuestions: { field: string; value: unknown; questions: string[] }[];
  negativeQuestions: string[];
  sequence: string[];
  stoppingRules: string[];
}

export interface PresentationROSRules {
  primarySystems: string[];
  secondarySystems: string[];
  optionalSystems: string[];
  hiddenSystems: string[];
  crossSystemLinks: { symptom: string; systems: string[] }[];
}

export interface PresentationExaminationRules {
  generalExam: string[];
  focusedExam: string[];
  mandatoryExam: string[];
  optionalExam: string[];
  hiddenExam: string[];
  specialTests: string[];
  scoringSystems: string[];
}

export interface PresentationReasoningRules {
  excludeDiagnoses: string[];
  mechanisms: MechanismCategory[];
  syndromes: ClinicalSyndrome[];
  reasoningStage: 'history_only' | 'history_and_exam' | 'full';
  minimumDataFields: string[];
}

export interface PresentationInvestigationReadiness {
  potentialTests: string[];
  conditions: { test: string; requiredFields: string[]; threshold: string }[];
  urgency: string[];
  dependencies: string[];
}

export interface PresentationManagementReadiness {
  domains: string[];
  emergencyActions: string[];
  monitoringRequired: string[];
  referralCriteria: string[];
}

export interface PresentationMonitoringRules {
  vitalsFrequency: string;
  requiredScores: string[];
  observationCharts: string[];
  alerts: string[];
  escalationThresholds: { parameter: string; threshold: number; action: string }[];
}

export interface PresentationWorkflowRules {
  isolationRequired: boolean;
  pathways: string[];
  teamActivation: string[];
  admissionCriteria: string[];
  dischargeCriteria: string[];
}

export interface PresentationDocumentationRules {
  narrativeTemplate: string;
  summaryTemplate: string;
  problemRepresentation: string;
  timelineRequired: boolean;
  soapFormat: string;
}

export interface PresentationAIRules {
  confidenceThreshold: number;
  missingDataThreshold: number;
  reasoningThreshold: number;
  unsafeThreshold: number;
  escalationThreshold: number;
  humanConfirmationRequired: string[];
  neverInfer: string[];
  canAutoComplete: string[];
  cannotAutoComplete: string[];
}

export interface ClinicalPresentationObject {
  id: string;
  displayName: string;
  synonyms: string[];
  patientLanguage: string[];
  snomed?: string;
  icd?: string;

  presentationType: PresentationType;
  bodySystems: BodySystem[];
  region?: string;
  organ?: string;

  ageRules: PresentationAgeRule;
  genderRules: string[];
  pregnancyRules: string[];
  activationRules: PresentationActivationRule[];

  mechanisms: MechanismCategory[];
  phenotypes: string[];
  syndromes: ClinicalSyndrome[];
  redFlags: string[];
  timeCategories: string[];
  emergencyLevel: EmergencyLevel;

  visibility: PresentationVisibilityRules;
  history: PresentationHistoryRules;
  ros: PresentationROSRules;
  examination: PresentationExaminationRules;
  reasoning: PresentationReasoningRules;
  investigationReadiness: PresentationInvestigationReadiness;
  managementReadiness: PresentationManagementReadiness;
  monitoring: PresentationMonitoringRules;
  workflow: PresentationWorkflowRules;
  documentation: PresentationDocumentationRules;
  ai: PresentationAIRules;
}

// ═══════════════════════════════════════════════════════════════
// PRESENTATION REGISTRY
// ═══════════════════════════════════════════════════════════════

export const CLINICAL_PRESENTATIONS: Record<string, ClinicalPresentationObject> = {

  // ────────────────────────────────────────────────────────────
  // FEVER
  // ────────────────────────────────────────────────────────────
  fever: {
    id: 'fever', displayName: 'Fever',
    synonyms: ['pyrexia', 'hyperthermia', 'raised temperature'],
    patientLanguage: ['fever', 'hot', 'high temperature', 'feeling warm', 'body hot'],
    presentationType: 'symptom', bodySystems: ['general'],
    ageRules: {}, genderRules: [], pregnancyRules: ['pregnant', 'postpartum'],
    activationRules: [],
    mechanisms: ['infectious', 'inflammatory', 'neoplastic', 'autoimmune', 'toxic'],
    phenotypes: ['acute_fever', 'prolonged_fever', 'recurrent_fever', 'fever_with_rash', 'fever_with_joint_pain'],
    syndromes: ['sepsis_syndrome'],
    redFlags: ['neck_stiffness', 'petechial_rash', 'altered_consciousness', 'hypotension', 'tachycardia_out_of_proportion'],
    timeCategories: ['acute_less_than_72h', 'subacute_3_to_14_days', 'chronic_more_than_14_days', 'recurrent'],
    emergencyLevel: 'orange',
    visibility: {
      showSections: ['infectious_disease_hpi', 'fever_characterization', 'travel_history'],
      hideSections: ['trauma_hpi', 'obstetric_examination'],
      showTabs: ['hpi', 'examination'], hideTabs: [],
      showCards: ['fever_duration', 'fever_pattern', 'rigors', 'antipyretic_response'],
      hideCards: ['trauma_mechanism', 'wound_assessment'],
      showButtons: ['sepsis_screening'], hideButtons: [],
    },
    history: {
      requiredQuestions: ['fever_duration', 'fever_pattern', 'fever_measured_temp'],
      optionalQuestions: ['rigors', 'fever_progression', 'antipyretic_response', 'fever_timing'],
      conditionalQuestions: [
        { field: 'fever_duration', value: 7, questions: ['weight_loss', 'night_sweats', 'travel_history', 'tb_screening'] },
      ],
      negativeQuestions: ['neck_stiffness', 'rash', 'joint_pain', 'urinary_symptoms'],
      sequence: ['onset', 'duration', 'pattern', 'severity', 'associated_symptoms'],
      stoppingRules: ['fever_with_red_flag_requires_immediate_assessment'],
    },
    ros: {
      primarySystems: ['general', 'infectious_disease'],
      secondarySystems: ['respiratory', 'gi', 'neurological', 'genitourinary'],
      optionalSystems: ['musculoskeletal', 'dermatology'],
      hiddenSystems: ['obgyn_if_male'],
      crossSystemLinks: [{ symptom: 'fever', systems: ['respiratory', 'gi', 'neurological'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'general_appearance', 'hydration_status'],
      focusedExam: ['temperature_trend', 'skin_rash', 'lymph_nodes'],
      mandatoryExam: ['vital_signs', 'neck_stiffness', 'chest_auscultation'],
      optionalExam: ['abdominal_exam', 'neurological_exam'],
      hiddenExam: [],
      specialTests: ['meningeal_signs', 'tourniquet_test'],
      scoringSystems: ['news2', 'qsofa', 'mews'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['infectious', 'inflammatory', 'neoplastic', 'autoimmune'],
      syndromes: ['sepsis_syndrome'],
      reasoningStage: 'history_only',
      minimumDataFields: ['fever_duration', 'fever_pattern', 'temperature'],
    },
    investigationReadiness: {
      potentialTests: ['full_blood_count', 'malaria_rapid_test', 'blood_culture', 'urinalysis', 'chest_xray'],
      conditions: [
        { test: 'blood_culture', requiredFields: ['fever_duration', 'temperature'], threshold: 'temp > 38.5 or duration > 48h' },
        { test: 'malaria_rapid_test', requiredFields: ['travel_history', 'fever_pattern'], threshold: 'any fever in endemic area' },
      ],
      urgency: ['sepsis_screening_within_1h_if_red_flag'],
      dependencies: ['blood_culture_before_antibiotics'],
    },
    managementReadiness: {
      domains: ['supportive', 'emergency', 'isolation', 'monitoring'],
      emergencyActions: ['iv_access_if_sepsis', 'blood_culture', 'broad_spectrum_antibiotics'],
      monitoringRequired: ['temperature_chart', 'vital_signs_q4h'],
      referralCriteria: ['sepsis_unresponsive_to_fluids', 'unknown_source_after_48h'],
    },
    monitoring: {
      vitalsFrequency: 'q4h',
      requiredScores: ['news2', 'qsofa'],
      observationCharts: ['temperature_chart', 'fluid_balance'],
      alerts: ['temp_above_39.5', 'heart_rate_above_120', 'systolic_below_90'],
      escalationThresholds: [
        { parameter: 'temperature', threshold: 39.5, action: 'escalate_to_clinician' },
        { parameter: 'systolic_bp', threshold: 90, action: 'fluid_resuscitation_protocol' },
      ],
    },
    workflow: {
      isolationRequired: true,
      pathways: ['sepsis_pathway', 'fever_protocol'],
      teamActivation: ['nursing', 'clinician'],
      admissionCriteria: ['sepsis', 'unstable_vitals', 'uncertain_diagnosis'],
      dischargeCriteria: ['afebrile_24h', 'stable_vitals', 'source_identified'],
    },
    documentation: {
      narrativeTemplate: 'fever_hpi',
      summaryTemplate: 'fever_summary',
      problemRepresentation: 'fever_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.7,
      missingDataThreshold: 0.3,
      reasoningThreshold: 0.6,
      unsafeThreshold: 0.9,
      escalationThreshold: 0.8,
      humanConfirmationRequired: ['sepsis_diagnosis', 'antibiotic_choice'],
      neverInfer: ['malaria_without_test'],
      canAutoComplete: ['temperature_chart', 'fever_duration_calculation'],
      cannotAutoComplete: ['source_of_infection', 'severity_assessment'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // COUGH
  // ────────────────────────────────────────────────────────────
  cough: {
    id: 'cough', displayName: 'Cough',
    synonyms: ['tussis', 'persistent cough', 'chronic cough'],
    patientLanguage: ['cough', 'coughing', 'dry cough', 'productive cough', 'barking cough'],
    presentationType: 'symptom', bodySystems: ['respiratory'],
    ageRules: {}, genderRules: [], pregnancyRules: [],
    activationRules: [],
    mechanisms: ['infectious', 'inflammatory', 'obstructive', 'neoplastic', 'vascular', 'aspiration'],
    phenotypes: ['acute_cough', 'subacute_cough', 'chronic_cough', 'productive_cough', 'dry_cough', 'nocturnal_cough'],
    syndromes: ['respiratory_syndrome'],
    redFlags: ['hemoptysis', 'stridor', 'respiratory_distress', 'cyanosis', 'failure_to_thrive'],
    timeCategories: ['acute_less_than_3w', 'subacute_3_to_8w', 'chronic_more_than_8w'],
    emergencyLevel: 'yellow',
    visibility: {
      showSections: ['respiratory_hpi', 'pulmonary_exam', 'tb_screening'],
      hideSections: ['abdominal_exam', 'pelvic_exam'],
      showTabs: ['hpi', 'examination', 'investigations'], hideTabs: [],
      showCards: ['cough_duration', 'cough_character', 'sputum', 'hemoptysis', 'dyspnea', 'wheeze'],
      hideCards: ['pain_characterization', 'obstetric_exam'],
      showButtons: ['tb_screening', 'pft_ordering', 'imaging_ordering'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['cough_duration', 'cough_character'],
      optionalQuestions: ['sputum_color', 'sputum_volume', 'hemoptysis', 'wheeze', 'dyspnea', 'fever'],
      conditionalQuestions: [
        { field: 'cough_duration', value: 21, questions: ['tb_screening', 'weight_loss', 'night_sweats', 'chest_imaging'] },
        { field: 'cough_character', value: 'productive', questions: ['sputum_color', 'sputum_volume', 'sputum_odor'] },
      ],
      negativeQuestions: ['fever', 'night_sweats', 'weight_loss', 'hemoptysis'],
      sequence: ['onset', 'duration', 'character', 'sputum', 'associated_symptoms'],
      stoppingRules: ['hemoptysis_requires_immediate_imaging'],
    },
    ros: {
      primarySystems: ['respiratory'],
      secondarySystems: ['general', 'cardiovascular', 'gi'],
      optionalSystems: ['ent', 'musculoskeletal'],
      hiddenSystems: ['obgyn'],
      crossSystemLinks: [{ symptom: 'cough', systems: ['general', 'cardiovascular', 'gi'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'oxygen_saturation', 'general_appearance'],
      focusedExam: ['respiratory_exam', 'chest_auscultation'],
      mandatoryExam: ['respiratory_rate', 'oxygen_saturation', 'chest_auscultation'],
      optionalExam: ['ent_exam', 'cardiovascular_exam'],
      hiddenExam: ['pelvic_exam', 'rectal_exam'],
      specialTests: ['peak_flow', 'six_minute_walk'],
      scoringSystems: ['news2', 'pediatric_ews'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['infectious', 'inflammatory', 'obstructive', 'neoplastic', 'vascular'],
      syndromes: ['respiratory_syndrome'],
      reasoningStage: 'history_only',
      minimumDataFields: ['cough_duration', 'cough_character', 'oxygen_saturation'],
    },
    investigationReadiness: {
      potentialTests: ['chest_xray', 'full_blood_count', 'sputum_gram_stain', 'sputum_culture', 'gene_xpert'],
      conditions: [
        { test: 'chest_xray', requiredFields: ['cough_duration', 'cough_character'], threshold: 'duration > 3w or hemoptysis' },
        { test: 'sputum_culture', requiredFields: ['sputum_color'], threshold: 'productive cough' },
      ],
      urgency: ['hemoptysis_urgent_imaging'],
      dependencies: ['sputum_before_antibiotics_if_tb_suspected'],
    },
    managementReadiness: {
      domains: ['supportive', 'emergency', 'isolation'],
      emergencyActions: ['oxygen_if_hypoxic', 'nebulized_bronchodilators'],
      monitoringRequired: ['oxygen_saturation', 'respiratory_rate'],
      referralCriteria: ['persistent_cough_>_8w', 'hemoptysis', 'suspected_tb'],
    },
    monitoring: {
      vitalsFrequency: 'q4h_if_acute',
      requiredScores: ['news2'],
      observationCharts: ['oxygen_saturation_chart', 'sputum_chart'],
      alerts: ['o2_sat_below_92', 'respiratory_rate_above_24'],
      escalationThresholds: [
        { parameter: 'oxygen_saturation', threshold: 92, action: 'oxygen_therapy' },
        { parameter: 'respiratory_rate', threshold: 30, action: 'critical_care_referral' },
      ],
    },
    workflow: {
      isolationRequired: true,
      pathways: ['tb_screening_pathway', 'asthma_pathway', 'copd_pathway'],
      teamActivation: ['nursing', 'respiratory_therapist'],
      admissionCriteria: ['hypoxia', 'respiratory_distress', 'hemoptysis_massive'],
      dischargeCriteria: ['stable_oxygenation', 'afebrile'],
    },
    documentation: {
      narrativeTemplate: 'respiratory_hpi',
      summaryTemplate: 'respiratory_summary',
      problemRepresentation: 'cough_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.7,
      missingDataThreshold: 0.3,
      reasoningThreshold: 0.6,
      unsafeThreshold: 0.9,
      escalationThreshold: 0.8,
      humanConfirmationRequired: ['tb_diagnosis', 'antibiotic_choice'],
      neverInfer: ['tb_without_gene_xpert'],
      canAutoComplete: ['cough_duration_calculation'],
      cannotAutoComplete: ['source_of_infection'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // ABDOMINAL PAIN
  // ────────────────────────────────────────────────────────────
  abdominal_pain: {
    id: 'abdominal_pain', displayName: 'Abdominal Pain',
    synonyms: ['stomach ache', 'belly pain', 'abdominal discomfort', 'colic'],
    patientLanguage: ['stomach pain', 'belly ache', 'tummy pain', 'cramps', 'colic pain'],
    presentationType: 'symptom', bodySystems: ['gi'],
    ageRules: {}, genderRules: ['female'], pregnancyRules: ['pregnant', 'postpartum'],
    activationRules: [],
    mechanisms: ['inflammatory', 'obstructive', 'vascular', 'infectious', 'traumatic', 'functional'],
    phenotypes: ['acute_abdomen', 'chronic_abdominal_pain', 'recurrent_abdominal_pain', 'colicky_pain'],
    syndromes: ['acute_abdomen'],
    redFlags: ['peritonism', 'hematemesis', 'hematochezia', 'hypotension', 'distension', 'vomiting_bilious'],
    timeCategories: ['acute_less_than_24h', 'subacute_1_to_7_days', 'chronic_more_than_7_days', 'recurrent'],
    emergencyLevel: 'orange',
    visibility: {
      showSections: ['gi_hpi', 'abdominal_exam', 'surgical_ros'],
      hideSections: ['respiratory_hpi', 'neurological_exam'],
      showTabs: ['hpi', 'examination', 'investigations'], hideTabs: [],
      showCards: ['pain_onset', 'pain_location', 'pain_character', 'pain_severity', 'pain_migration', 'pain_radiation'],
      hideCards: ['chest_pain_radiation', 'dyspnea_onset'],
      showButtons: ['surgical_referral', 'imaging_ordering'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['pain_onset', 'pain_location', 'pain_character', 'pain_severity'],
      optionalQuestions: ['pain_migration', 'pain_radiation', 'nausea', 'vomiting', 'anorexia', 'fever', 'bowel_habits'],
      conditionalQuestions: [
        { field: 'pain_location', value: 'right_lower_quadrant', questions: ['anorexia', 'nausea', 'fever', 'migration_from_umbilicus'] },
        { field: 'vomiting', value: true, questions: ['vomiting_bilious', 'vomiting_feculent', 'dehydration_assessment'] },
        { field: 'sex', value: 'female', questions: ['lmp', 'pregnancy_test', 'vaginal_bleeding', 'vaginal_discharge'] },
      ],
      negativeQuestions: ['peritonism', 'hematemesis', 'hematochezia'],
      sequence: ['onset', 'location', 'character', 'severity', 'migration', 'associated_symptoms'],
      stoppingRules: ['peritonism_requires_immediate_surgical_review'],
    },
    ros: {
      primarySystems: ['gi'],
      secondarySystems: ['genitourinary', 'obgyn', 'general'],
      optionalSystems: ['respiratory', 'cardiovascular'],
      hiddenSystems: [],
      crossSystemLinks: [
        { symptom: 'abdominal_pain', systems: ['gi', 'genitourinary', 'obgyn'] },
        { symptom: 'vomiting', systems: ['gi', 'metabolic', 'neurological'] },
      ],
    },
    examination: {
      generalExam: ['vital_signs', 'hydration_status', 'general_appearance'],
      focusedExam: ['abdominal_exam', 'hernia_orfices'],
      mandatoryExam: ['abdominal_palpation', 'percussion', 'auscultation', 'rectal_exam'],
      optionalExam: ['pelvic_exam_if_female', 'groin_exam'],
      hiddenExam: ['respiratory_exam', 'neurological_exam'],
      specialTests: ['psoas_sign', 'obturator_sign', 'roving_sign', 'murphys_sign'],
      scoringSystems: ['alvarado_score', 'apache'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['inflammatory', 'obstructive', 'vascular', 'infectious', 'functional'],
      syndromes: ['acute_abdomen'],
      reasoningStage: 'history_and_exam',
      minimumDataFields: ['pain_location', 'pain_character', 'pain_severity', 'abdominal_exam_findings'],
    },
    investigationReadiness: {
      potentialTests: ['full_blood_count', 'abdominal_ultrasound', 'ct_abdomen', 'urinalysis', 'pregnancy_test', 'serum_amylase'],
      conditions: [
        { test: 'pregnancy_test', requiredFields: ['sex', 'age'], threshold: 'female reproductive age' },
        { test: 'ct_abdomen', requiredFields: ['peritonism', 'pain_severity'], threshold: 'severe pain or peritonism' },
      ],
      urgency: ['peritonism_emergency_ct'],
      dependencies: ['ultrasound_before_ct_in_children'],
    },
    managementReadiness: {
      domains: ['supportive', 'emergency', 'surgical'],
      emergencyActions: ['nil_by_mouth', 'iv_access', 'surgical_referral_if_peritonism'],
      monitoringRequired: ['pain_chart', 'vital_signs_q2h_if_acute'],
      referralCriteria: ['peritonism', 'obstruction', 'unexplained_severe_pain'],
    },
    monitoring: {
      vitalsFrequency: 'q2h_if_acute_abdomen',
      requiredScores: ['pain_score', 'news2'],
      observationCharts: ['pain_chart', 'fluid_balance'],
      alerts: ['pain_sudden_worsening', 'peritonism_development', 'hypotension'],
      escalationThresholds: [
        { parameter: 'pain_severity', threshold: 8, action: 'surgical_review' },
        { parameter: 'systolic_bp', threshold: 90, action: 'fluid_resuscitation' },
      ],
    },
    workflow: {
      isolationRequired: false,
      pathways: ['acute_abdomen_pathway', 'surgical_review_pathway'],
      teamActivation: ['surgical_team', 'nursing'],
      admissionCriteria: ['peritonism', 'obstruction', 'uncontrolled_pain'],
      dischargeCriteria: ['pain_controlled', 'tolerating_diet', 'no_peritonism'],
    },
    documentation: {
      narrativeTemplate: 'gi_hpi',
      summaryTemplate: 'abdominal_pain_summary',
      problemRepresentation: 'abdominal_pain_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.7,
      missingDataThreshold: 0.3,
      reasoningThreshold: 0.6,
      unsafeThreshold: 0.9,
      escalationThreshold: 0.8,
      humanConfirmationRequired: ['surgical_diagnosis', 'imaging_choice'],
      neverInfer: ['appendicitis_without_exam'],
      canAutoComplete: ['pain_duration_calculation'],
      cannotAutoComplete: ['need_for_surgery'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // HEADACHE
  // ────────────────────────────────────────────────────────────
  headache: {
    id: 'headache', displayName: 'Headache',
    synonyms: ['cephalalgia', 'migraine', 'tension headache', 'cluster headache'],
    patientLanguage: ['headache', 'head pain', 'migraine', 'splitting headache'],
    presentationType: 'symptom', bodySystems: ['neurological'],
    ageRules: {}, genderRules: [], pregnancyRules: ['pregnant', 'postpartum'],
    activationRules: [],
    mechanisms: ['vascular', 'inflammatory', 'infectious', 'neoplastic', 'musculoskeletal', 'psychogenic'],
    phenotypes: ['acute_severe_headache', 'chronic_headache', 'migraine', 'tension_type', 'cluster', 'thunderclap'],
    syndromes: ['neurological_syndrome'],
    redFlags: ['thunderclap_onset', 'neck_stiffness', 'fever', 'neurological_deficit', 'papilledema', 'headache_worse_on_coughing'],
    timeCategories: ['acute_less_than_72h', 'subacute_3_to_14_days', 'chronic_more_than_14_days'],
    emergencyLevel: 'yellow',
    visibility: {
      showSections: ['neurological_hpi', 'neurological_exam', 'eye_exam'],
      hideSections: ['respiratory_hpi', 'abdominal_exam'],
      showTabs: ['hpi', 'examination'], hideTabs: [],
      showCards: ['headache_onset', 'headache_severity', 'headache_character', 'headache_location'],
      hideCards: ['pain_migration', 'peritonism'],
      showButtons: ['neurological_referral', 'imaging_ordering'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['headache_onset', 'headache_severity', 'headache_character'],
      optionalQuestions: ['headache_location', 'headache_duration', 'neck_stiffness', 'photophobia', 'vomiting', 'visual_changes'],
      conditionalQuestions: [
        { field: 'headache_onset', value: 'thunderclap', questions: ['ct_brain_urgent', 'neurology_referral'] },
        { field: 'fever', value: true, questions: ['neck_stiffness', 'meningitis_screening', 'lumbar_puncture'] },
      ],
      negativeQuestions: ['fever', 'neck_stiffness', 'neurological_deficit', 'visual_disturbance'],
      sequence: ['onset', 'location', 'character', 'severity', 'duration', 'associated_symptoms'],
      stoppingRules: ['thunderclap_headache_requires_imaging'],
    },
    ros: {
      primarySystems: ['neurological'],
      secondarySystems: ['ophthalmology', 'general', 'ent', 'psychiatric'],
      optionalSystems: ['musculoskeletal', 'cardiovascular'],
      hiddenSystems: [],
      crossSystemLinks: [{ symptom: 'headache', systems: ['neurological', 'ophthalmology', 'ent'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'general_appearance'],
      focusedExam: ['neurological_exam', 'fundoscopy', 'neck_stiffness'],
      mandatoryExam: ['neurological_exam', 'fundoscopy', 'blood_pressure'],
      optionalExam: ['ent_exam', 'eye_exam'],
      hiddenExam: ['abdominal_exam', 'rectal_exam'],
      specialTests: ['fundoscopy', 'meningeal_signs'],
      scoringSystems: ['migraine_disability_assessment'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['vascular', 'inflammatory', 'infectious', 'neoplastic', 'musculoskeletal', 'psychogenic'],
      syndromes: ['neurological_syndrome'],
      reasoningStage: 'history_and_exam',
      minimumDataFields: ['headache_onset', 'headache_severity', 'headache_character', 'blood_pressure'],
    },
    investigationReadiness: {
      potentialTests: ['ct_brain', 'mri_brain', 'full_blood_count', 'esr_crp'],
      conditions: [
        { test: 'ct_brain', requiredFields: ['headache_onset'], threshold: 'thunderclap or red flag' },
        { test: 'lumbar_puncture', requiredFields: ['fever', 'neck_stiffness'], threshold: 'suspected meningitis' },
      ],
      urgency: ['thunderclap_emergency_ct'],
      dependencies: ['ct_before_lp'],
    },
    managementReadiness: {
      domains: ['supportive', 'emergency'],
      emergencyActions: ['analgesia', 'ct_brain_if_red_flag', 'neurology_referral'],
      monitoringRequired: ['pain_score', 'neurological_observations'],
      referralCriteria: ['thunderclap_onset', 'neurological_deficit', 'treatment_refractory'],
    },
    monitoring: {
      vitalsFrequency: 'q4h',
      requiredScores: ['pain_score', 'gcs'],
      observationCharts: ['neurological_chart', 'pain_chart'],
      alerts: ['gcs_drop', 'new_neurological_deficit'],
      escalationThresholds: [
        { parameter: 'gcs', threshold: 14, action: 'emergency_neurology_review' },
      ],
    },
    workflow: {
      isolationRequired: false,
      pathways: ['headache_pathway', 'stroke_pathway', 'meningitis_pathway'],
      teamActivation: ['neurology_team'],
      admissionCriteria: ['red_flag_headache', 'uncontrolled_pain', 'neurological_deficit'],
      dischargeCriteria: ['pain_controlled', 'red_flags_excluded'],
    },
    documentation: {
      narrativeTemplate: 'neurological_hpi',
      summaryTemplate: 'headache_summary',
      problemRepresentation: 'headache_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.7,
      missingDataThreshold: 0.3,
      reasoningThreshold: 0.6,
      unsafeThreshold: 0.9,
      escalationThreshold: 0.8,
      humanConfirmationRequired: ['meningitis_diagnosis', 'imaging_decision'],
      neverInfer: ['meningitis_without_lp'],
      canAutoComplete: ['headache_duration_calculation'],
      cannotAutoComplete: ['need_for_imaging'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // CHEST PAIN
  // ────────────────────────────────────────────────────────────
  chest_pain: {
    id: 'chest_pain', displayName: 'Chest Pain',
    synonyms: ['chest discomfort', 'angina', 'chest tightness', 'precordial pain'],
    patientLanguage: ['chest pain', 'chest tightness', 'pressure on chest', 'heart pain', 'burning chest'],
    presentationType: 'symptom', bodySystems: ['cardiovascular', 'respiratory'],
    ageRules: { minMonths: 144 }, genderRules: [], pregnancyRules: [],
    activationRules: [],
    mechanisms: ['ischemic', 'inflammatory', 'vascular', 'infectious', 'musculoskeletal', 'psychogenic'],
    phenotypes: ['acute_chest_pain', 'chronic_stable_angina', 'pleuritic_chest_pain', 'chest_wall_pain'],
    syndromes: ['cardiovascular_syndrome'],
    redFlags: ['hemodynamic_instability', 'ecg_changes', 'troponin_elevation', 'aortic_dissection_features'],
    timeCategories: ['acute_less_than_6h', 'subacute_6_to_24h', 'chronic_more_than_24h'],
    emergencyLevel: 'red',
    visibility: {
      showSections: ['cardiovascular_hpi', 'cardiac_exam', 'ecg'],
      hideSections: ['abdominal_exam', 'pelvic_exam', 'musculoskeletal_exam'],
      showTabs: ['hpi', 'examination', 'ecg', 'investigations'], hideTabs: [],
      showCards: ['chest_pain_onset', 'chest_pain_radiation', 'chest_pain_exertional', 'chest_pain_sweating', 'chest_pain_nausea', 'dyspnea', 'palpitations'],
      hideCards: ['pain_migration', 'peritonism'],
      showButtons: ['ecg_ordering', 'troponin_ordering', 'cardiology_referral'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['chest_pain_onset', 'chest_pain_radiation', 'chest_pain_character'],
      optionalQuestions: ['chest_pain_exertional', 'chest_pain_sweating', 'chest_pain_nausea', 'dyspnea', 'palpitations', 'syncope'],
      conditionalQuestions: [
        { field: 'chest_pain_radiation', value: 'left_arm', questions: ['ecg', 'troponin', 'cardiology_referral'] },
        { field: 'dyspnea', value: true, questions: ['oxygen_saturation', 'chest_auscultation', 'bedside_echo'] },
      ],
      negativeQuestions: ['syncope', 'palpitations', 'fever', 'hemoptysis'],
      sequence: ['onset', 'location', 'radiation', 'character', 'severity', 'duration', 'associated_symptoms'],
      stoppingRules: ['hemodynamic_instability_requires_immediate_ecg'],
    },
    ros: {
      primarySystems: ['cardiovascular'],
      secondarySystems: ['respiratory', 'gi', 'musculoskeletal'],
      optionalSystems: ['neurological', 'psychiatric'],
      hiddenSystems: ['obgyn'],
      crossSystemLinks: [{ symptom: 'chest_pain', systems: ['cardiovascular', 'respiratory', 'gi', 'musculoskeletal'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'oxygen_saturation', 'general_appearance'],
      focusedExam: ['cardiovascular_exam', 'respiratory_exam'],
      mandatoryExam: ['blood_pressure_bilateral', 'heart_auscultation', 'chest_auscultation', 'peripheral_pulses'],
      optionalExam: ['abdominal_exam', 'neck_vein_exam'],
      hiddenExam: ['pelvic_exam', 'rectal_exam'],
      specialTests: ['ecg', 'bedside_echo'],
      scoringSystems: ['hearts_score', 'grace_score', 'news2'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['ischemic', 'inflammatory', 'vascular', 'infectious', 'musculoskeletal'],
      syndromes: ['cardiovascular_syndrome'],
      reasoningStage: 'history_and_exam',
      minimumDataFields: ['chest_pain_onset', 'chest_pain_character', 'ecg', 'troponin'],
    },
    investigationReadiness: {
      potentialTests: ['ecg', 'troponin', 'chest_xray', 'd_dimer', 'ct_pulmonary_angiogram', 'echo'],
      conditions: [
        { test: 'ecg', requiredFields: ['chest_pain_onset'], threshold: 'immediate for any chest pain' },
        { test: 'troponin', requiredFields: ['chest_pain_onset', 'ecg'], threshold: 'any suspicion of ACS' },
        { test: 'd_dimer', requiredFields: ['dyspnea', 'chest_pain'], threshold: 'suspected PE' },
      ],
      urgency: ['ecg_within_10min', 'troponin_within_30min'],
      dependencies: ['ecg_before_troponin'],
    },
    managementReadiness: {
      domains: ['emergency', 'cardiology', 'monitoring'],
      emergencyActions: ['ecg', 'aspirin_if_acs', 'oxygen_if_hypoxic', 'cardiology_referral'],
      monitoringRequired: ['cardiac_monitoring', 'vital_signs_q15min'],
      referralCriteria: ['acs', 'aortic_dissection', 'pe', 'arrhythmia'],
    },
    monitoring: {
      vitalsFrequency: 'q15min_if_acute',
      requiredScores: ['hearts_score', 'news2'],
      observationCharts: ['cardiac_monitoring', 'pain_chart'],
      alerts: ['st_elevation', 'hypotension', 'arrhythmia'],
      escalationThresholds: [
        { parameter: 'systolic_bp', threshold: 90, action: 'cardiology_emergency' },
        { parameter: 'heart_rate', threshold: 120, action: 'ecg_and_cardiology_review' },
      ],
    },
    workflow: {
      isolationRequired: false,
      pathways: ['acs_pathway', 'pe_pathway', 'aortic_dissection_pathway'],
      teamActivation: ['cardiology_team', 'code_stemi_team'],
      admissionCriteria: ['acs', 'pe', 'aortic_dissection', 'unstable_arrhythmia'],
      dischargeCriteria: ['troponin_negative', 'stable_ecg', 'pain_free'],
    },
    documentation: {
      narrativeTemplate: 'cardiac_hpi',
      summaryTemplate: 'cardiac_summary',
      problemRepresentation: 'chest_pain_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.8,
      missingDataThreshold: 0.2,
      reasoningThreshold: 0.7,
      unsafeThreshold: 0.95,
      escalationThreshold: 0.85,
      humanConfirmationRequired: ['acs_diagnosis', 'thrombolysis_decision'],
      neverInfer: ['mi_without_ecg_and_troponin'],
      canAutoComplete: ['ecg_interpretation_assist'],
      cannotAutoComplete: ['thrombolysis_decision', 'discharge_decision'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // DIFFICULTY BREATHING
  // ────────────────────────────────────────────────────────────
  difficulty_breathing: {
    id: 'difficulty_breathing', displayName: 'Difficulty Breathing',
    synonyms: ['dyspnea', 'shortness of breath', 'breathlessness', 'SOB'],
    patientLanguage: ['cannot breathe', 'short of breath', 'breathless', 'chest tightness', 'air hunger'],
    presentationType: 'symptom', bodySystems: ['respiratory', 'cardiovascular'],
    ageRules: {}, genderRules: [], pregnancyRules: ['pregnant'],
    activationRules: [],
    mechanisms: ['obstructive', 'infectious', 'vascular', 'cardiac', 'metabolic', 'psychogenic'],
    phenotypes: ['acute_dyspnea', 'chronic_dyspnea', 'exertional_dyspnea', 'paroxysmal_nocturnal_dyspnea', 'orthopnea'],
    syndromes: ['respiratory_syndrome', 'cardiovascular_syndrome'],
    redFlags: ['stridor', 'cyanosis', 'silent_chest', 'hypoxia', 'altered_consciousness', 'use_of_accessory_muscles'],
    timeCategories: ['acute_less_than_1h', 'subacute_1_to_24h', 'chronic_more_than_24h'],
    emergencyLevel: 'red',
    visibility: {
      showSections: ['respiratory_hpi', 'cardiac_hpi', 'oxygenation'],
      hideSections: ['abdominal_exam', 'musculoskeletal_exam'],
      showTabs: ['hpi', 'examination', 'oxygenation', 'investigations'], hideTabs: [],
      showCards: ['dyspnea_onset', 'dyspnea_exertional', 'dyspnea_at_rest', 'dyspnea_orthopnea', 'dyspnea_pnd'],
      hideCards: ['pain_characterization', 'obstetric_exam'],
      showButtons: ['oxygen_ordering', 'blood_gas_ordering', 'imaging_ordering'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['dyspnea_onset', 'oxygen_saturation'],
      optionalQuestions: ['dyspnea_exertional', 'dyspnea_at_rest', 'dyspnea_orthopnea', 'dyspnea_pnd', 'cough', 'wheeze', 'chest_pain', 'fever'],
      conditionalQuestions: [
        { field: 'dyspnea_onset', value: 'sudden', questions: ['pe_screening', 'pneumothorax_screening', 'chest_imaging'] },
        { field: 'orthopnea', value: true, questions: ['cardiac_exam', 'echo', 'bmi', 'sleep_apnea_screening'] },
      ],
      negativeQuestions: ['chest_pain', 'fever', 'cough', 'wheeze', 'palpitations'],
      sequence: ['onset', 'severity', 'positional_factors', 'associated_symptoms'],
      stoppingRules: ['hypoxia_requires_immediate_oxygen_and_assessment'],
    },
    ros: {
      primarySystems: ['respiratory', 'cardiovascular'],
      secondarySystems: ['general', 'musculoskeletal'],
      optionalSystems: ['neurological', 'psychiatric'],
      hiddenSystems: ['obgyn'],
      crossSystemLinks: [{ symptom: 'dyspnea', systems: ['respiratory', 'cardiovascular', 'hematology'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'oxygen_saturation', 'general_appearance', 'accessory_muscle_use'],
      focusedExam: ['respiratory_exam', 'cardiovascular_exam'],
      mandatoryExam: ['respiratory_rate', 'oxygen_saturation', 'chest_auscultation', 'heart_auscultation'],
      optionalExam: ['neck_vein_exam', 'lower_limb_exam'],
      hiddenExam: ['pelvic_exam', 'rectal_exam'],
      specialTests: ['peak_flow', 'blood_gas'],
      scoringSystems: ['news2', 'pediatric_ews', 'borg_scale'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['obstructive', 'infectious', 'vascular', 'cardiac', 'metabolic'],
      syndromes: ['respiratory_syndrome', 'cardiovascular_syndrome'],
      reasoningStage: 'history_and_exam',
      minimumDataFields: ['dyspnea_onset', 'oxygen_saturation', 'respiratory_rate', 'chest_auscultation'],
    },
    investigationReadiness: {
      potentialTests: ['chest_xray', 'blood_gas', 'ecg', 'd_dimer', 'ct_pulmonary_angiogram', 'echo', 'full_blood_count', 'b_np'],
      conditions: [
        { test: 'blood_gas', requiredFields: ['oxygen_saturation'], threshold: 'O2 sat < 92%' },
        { test: 'd_dimer', requiredFields: ['dyspnea_onset'], threshold: 'sudden onset, suspected PE' },
      ],
      urgency: ['blood_gas_within_30min_if_hypoxic', 'chest_xray_within_1h'],
      dependencies: ['oxygen_before_blood_gas'],
    },
    managementReadiness: {
      domains: ['emergency', 'respiratory', 'cardiology'],
      emergencyActions: ['oxygen_therapy', 'nebulized_bronchodilators', 'iv_access', 'chest_drain_if_pneumothorax'],
      monitoringRequired: ['continuous_oximetry', 'vital_signs_q15min'],
      referralCriteria: ['hypoxia_unresponsive', 'suspected_pe', 'cardiac_cause'],
    },
    monitoring: {
      vitalsFrequency: 'q15min_if_acute',
      requiredScores: ['news2', 'borg_scale'],
      observationCharts: ['oxygenation_chart', 'respiratory_rate_chart'],
      alerts: ['o2_sat_below_90', 'respiratory_rate_above_30', 'pco2_above_45'],
      escalationThresholds: [
        { parameter: 'oxygen_saturation', threshold: 90, action: 'escalate_oxygen' },
        { parameter: 'respiratory_rate', threshold: 30, action: 'icu_referral' },
      ],
    },
    workflow: {
      isolationRequired: true,
      pathways: ['respiratory_distress_pathway', 'pe_pathway', 'asthma_pathway', 'copd_pathway'],
      teamActivation: ['respiratory_team', 'icu_team'],
      admissionCriteria: ['hypoxia', 'respiratory_distress', 'suspected_pe'],
      dischargeCriteria: ['stable_oxygenation_room_air', 'stable_vitals'],
    },
    documentation: {
      narrativeTemplate: 'respiratory_hpi',
      summaryTemplate: 'dyspnea_summary',
      problemRepresentation: 'dyspnea_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.8,
      missingDataThreshold: 0.2,
      reasoningThreshold: 0.7,
      unsafeThreshold: 0.95,
      escalationThreshold: 0.85,
      humanConfirmationRequired: ['pe_diagnosis', 'intubation_decision'],
      neverInfer: ['pe_without_ctpa'],
      canAutoComplete: ['oxygen_saturation_trend'],
      cannotAutoComplete: ['need_for_intubation'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // VOMITING
  // ────────────────────────────────────────────────────────────
  vomiting: {
    id: 'vomiting', displayName: 'Vomiting',
    synonyms: ['emesis', 'throwing up', 'being sick', 'regurgitation'],
    patientLanguage: ['vomiting', 'throwing up', 'being sick', 'nausea with vomiting'],
    presentationType: 'symptom', bodySystems: ['gi'],
    ageRules: {}, genderRules: [], pregnancyRules: ['pregnant'],
    activationRules: [],
    mechanisms: ['infectious', 'inflammatory', 'obstructive', 'metabolic', 'toxic', 'neurological', 'psychogenic'],
    phenotypes: ['acute_vomiting', 'projectile_vomiting', 'bilious_vomiting', 'cyclic_vomiting'],
    syndromes: ['acute_abdomen'],
    redFlags: ['bilious_vomiting', 'feculent_vomiting', 'hematemesis', 'dehydration', 'weight_loss', 'headache_with_vomiting'],
    timeCategories: ['acute_less_than_24h', 'subacute_1_to_7_days', 'chronic_more_than_7_days'],
    emergencyLevel: 'yellow',
    visibility: {
      showSections: ['gi_hpi', 'dehydration_assessment', 'metabolic_screening'],
      hideSections: ['trauma_hpi', 'musculoskeletal_exam'],
      showTabs: ['hpi', 'examination'], hideTabs: [],
      showCards: ['vomiting_timing', 'vomiting_description', 'vomiting_bilious', 'vomiting_projectile', 'vomiting_frequency', 'vomiting_blood'],
      hideCards: ['pain_characterization', 'wound_assessment'],
      showButtons: ['dehydration_assessment', 'electrolyte_ordering'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['vomiting_timing', 'vomiting_frequency'],
      optionalQuestions: ['vomiting_description', 'vomiting_bilious', 'vomiting_projectile', 'vomiting_blood', 'nausea', 'abdominal_pain', 'fever', 'diarrhea'],
      conditionalQuestions: [
        { field: 'vomiting_bilious', value: true, questions: ['surgical_referral', 'abdominal_imaging'] },
        { field: 'vomiting_frequency', value: 10, questions: ['dehydration_assessment', 'electrolytes', 'iv_fluids'] },
        { field: 'pregnancy', value: 'pregnant', questions: ['hyperemesis_screening', 'ketones'] },
      ],
      negativeQuestions: ['fever', 'abdominal_pain', 'diarrhea', 'headache'],
      sequence: ['onset', 'frequency', 'content', 'triggers', 'associated_symptoms'],
      stoppingRules: ['bilious_vomiting_requires_surgical_review'],
    },
    ros: {
      primarySystems: ['gi'],
      secondarySystems: ['general', 'metabolic', 'neurological'],
      optionalSystems: ['obgyn'],
      hiddenSystems: [],
      crossSystemLinks: [{ symptom: 'vomiting', systems: ['gi', 'neurological', 'metabolic', 'obgyn'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'hydration_status', 'general_appearance'],
      focusedExam: ['abdominal_exam', 'dehydration_assessment'],
      mandatoryExam: ['abdominal_exam', 'hydration_assessment', 'mucous_membranes'],
      optionalExam: ['neurological_exam', 'rectal_exam'],
      hiddenExam: ['respiratory_exam'],
      specialTests: ['skin_turgor', 'capillary_refill'],
      scoringSystems: ['dehydration_score', 'pediatric_dehydration_score'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['infectious', 'obstructive', 'metabolic', 'toxic', 'neurological'],
      syndromes: ['acute_abdomen'],
      reasoningStage: 'history_only',
      minimumDataFields: ['vomiting_timing', 'vomiting_frequency', 'hydration_status'],
    },
    investigationReadiness: {
      potentialTests: ['electrolytes', 'urea_creatinine', 'blood_glucose', 'pregnancy_test', 'abdominal_ultrasound'],
      conditions: [
        { test: 'electrolytes', requiredFields: ['vomiting_frequency'], threshold: 'frequency > 5/day' },
        { test: 'pregnancy_test', requiredFields: ['sex', 'age'], threshold: 'female reproductive age' },
      ],
      urgency: ['electrolytes_urgent_if_severe_dehydration'],
      dependencies: ['iv_fluids_before_blood_draw_if_severely_dehydrated'],
    },
    managementReadiness: {
      domains: ['supportive', 'emergency'],
      emergencyActions: ['iv_fluids', 'antiemetics', 'nil_by_mouth_if_surgical'],
      monitoringRequired: ['fluid_balance', 'vomiting_frequency_chart'],
      referralCriteria: ['bilious_vomiting', 'severe_dehydration', 'suspected_obstruction'],
    },
    monitoring: {
      vitalsFrequency: 'q4h',
      requiredScores: ['dehydration_score'],
      observationCharts: ['fluid_balance', 'vomiting_chart'],
      alerts: ['signs_of_dehydration', 'electrolyte_imbalance'],
      escalationThresholds: [
        { parameter: 'vomiting_frequency', threshold: 10, action: 'iv_fluids_and_antiemetics' },
      ],
    },
    workflow: {
      isolationRequired: false,
      pathways: ['gastroenteritis_pathway', 'surgical_obstruction_pathway'],
      teamActivation: ['nursing'],
      admissionCriteria: ['severe_dehydration', 'bilious_vomiting', 'electrolyte_imbalance'],
      dischargeCriteria: ['tolerating_oral', 'hydrated', 'no_bilious_vomiting'],
    },
    documentation: {
      narrativeTemplate: 'gi_hpi',
      summaryTemplate: 'vomiting_summary',
      problemRepresentation: 'vomiting_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.6,
      missingDataThreshold: 0.3,
      reasoningThreshold: 0.6,
      unsafeThreshold: 0.9,
      escalationThreshold: 0.8,
      humanConfirmationRequired: ['surgical_diagnosis', 'dehydration_management'],
      neverInfer: ['obstruction_without_imaging'],
      canAutoComplete: ['dehydration_calculation'],
      cannotAutoComplete: ['need_for_surgery'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // DIARRHEA
  // ────────────────────────────────────────────────────────────
  diarrhea: {
    id: 'diarrhea', displayName: 'Diarrhea',
    synonyms: ['loose stools', 'watery stools', 'frequent stools', 'gastroenteritis'],
    patientLanguage: ['diarrhea', 'loose stool', 'watery stool', 'frequent stool', 'runny tummy'],
    presentationType: 'symptom', bodySystems: ['gi'],
    ageRules: {}, genderRules: [], pregnancyRules: [],
    activationRules: [],
    mechanisms: ['infectious', 'inflammatory', 'malabsorptive', 'toxic', 'functional'],
    phenotypes: ['acute_watery_diarrhea', 'bloody_diarrhea', 'chronic_diarrhea', 'persistent_diarrhea'],
    syndromes: ['acute_abdomen'],
    redFlags: ['bloody_stool', 'dehydration', 'fever', 'weight_loss', 'nocturnal_diarrhea'],
    timeCategories: ['acute_less_than_7_days', 'persistent_7_to_14_days', 'chronic_more_than_14_days'],
    emergencyLevel: 'yellow',
    visibility: {
      showSections: ['gi_hpi', 'dehydration_assessment'],
      hideSections: ['trauma_hpi', 'musculoskeletal_exam'],
      showTabs: ['hpi', 'examination'], hideTabs: [],
      showCards: ['diarrhea_duration', 'diarrhea_stool_type', 'diarrhea_frequency', 'diarrhea_dehydration', 'diarrhea_blood'],
      hideCards: ['pain_characterization', 'neurological_exam'],
      showButtons: ['dehydration_assessment', 'stool_ordering'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['diarrhea_duration', 'diarrhea_stool_type', 'diarrhea_frequency'],
      optionalQuestions: ['diarrhea_blood', 'fever', 'vomiting', 'abdominal_pain', 'dehydration_assessment'],
      conditionalQuestions: [
        { field: 'diarrhea_blood', value: true, questions: ['stool_culture', 'stool_microscopy', 'antibiotics_consideration'] },
        { field: 'diarrhea_duration', value: 14, questions: ['chronic_diarrhea_workup', 'malabsorption_screening'] },
      ],
      negativeQuestions: ['fever', 'blood_in_stool', 'vomiting'],
      sequence: ['onset', 'stool_character', 'frequency', 'associated_symptoms'],
      stoppingRules: ['bloody_diarrhea_requires_stool_testing'],
    },
    ros: {
      primarySystems: ['gi'],
      secondarySystems: ['general', 'infectious_disease'],
      optionalSystems: ['endocrine'],
      hiddenSystems: [],
      crossSystemLinks: [{ symptom: 'diarrhea', systems: ['gi', 'infectious_disease'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'hydration_status', 'general_appearance'],
      focusedExam: ['abdominal_exam', 'dehydration_assessment'],
      mandatoryExam: ['abdominal_exam', 'hydration_assessment', 'mucous_membranes'],
      optionalExam: ['rectal_exam'],
      hiddenExam: ['respiratory_exam'],
      specialTests: ['skin_turgor', 'capillary_refill'],
      scoringSystems: ['dehydration_score', 'pediatric_dehydration_score'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['infectious', 'inflammatory', 'malabsorptive', 'toxic', 'functional'],
      syndromes: ['acute_abdomen'],
      reasoningStage: 'history_only',
      minimumDataFields: ['diarrhea_duration', 'diarrhea_stool_type', 'hydration_status'],
    },
    investigationReadiness: {
      potentialTests: ['stool_microscopy', 'stool_culture', 'stool_occult_blood', 'electrolytes', 'stool_rotavirus'],
      conditions: [
        { test: 'stool_culture', requiredFields: ['diarrhea_blood', 'diarrhea_duration'], threshold: 'bloody or duration > 7 days' },
      ],
      urgency: [],
      dependencies: ['stool_before_antibiotics'],
    },
    managementReadiness: {
      domains: ['supportive', 'emergency'],
      emergencyActions: ['oral_rehydration', 'iv_fluids_if_dehydrated', 'zinc_supplementation'],
      monitoringRequired: ['stool_frequency_chart', 'fluid_balance'],
      referralCriteria: ['severe_dehydration', 'bloody_diarrhea', 'persistent_diarrhea'],
    },
    monitoring: {
      vitalsFrequency: 'q4h_if_acute',
      requiredScores: ['dehydration_score'],
      observationCharts: ['fluid_balance', 'stool_chart'],
      alerts: ['signs_of_dehydration', 'blood_in_stool'],
      escalationThresholds: [
        { parameter: 'diarrhea_frequency', threshold: 10, action: 'iv_fluids' },
      ],
    },
    workflow: {
      isolationRequired: true,
      pathways: ['gastroenteritis_pathway', 'cholera_pathway'],
      teamActivation: ['nursing'],
      admissionCriteria: ['severe_dehydration', 'bloody_diarrhea', 'persistent_diarrhea'],
      dischargeCriteria: ['hydrated', 'decreasing_frequency'],
    },
    documentation: {
      narrativeTemplate: 'gi_hpi',
      summaryTemplate: 'diarrhea_summary',
      problemRepresentation: 'diarrhea_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.6,
      missingDataThreshold: 0.3,
      reasoningThreshold: 0.6,
      unsafeThreshold: 0.9,
      escalationThreshold: 0.8,
      humanConfirmationRequired: ['cholera_diagnosis', 'antibiotic_decision'],
      neverInfer: ['cholera_without_stool_test'],
      canAutoComplete: ['dehydration_calculation'],
      cannotAutoComplete: ['need_for_antibiotics'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // SEIZURE / FITS
  // ────────────────────────────────────────────────────────────
  seizure: {
    id: 'seizure', displayName: 'Seizure / Fits',
    synonyms: ['convulsion', 'fit', 'epileptic attack', 'spasm'],
    patientLanguage: ['fits', 'convulsions', 'seizure', 'shaking', 'epilepsy attack'],
    presentationType: 'symptom', bodySystems: ['neurological'],
    ageRules: {}, genderRules: [], pregnancyRules: ['pregnant'],
    activationRules: [],
    mechanisms: ['infectious', 'metabolic', 'vascular', 'neoplastic', 'traumatic', 'toxic', 'degenerative', 'idiopathic'],
    phenotypes: ['generalized_tonic_clonic', 'focal_seizure', 'febrile_convulsion', 'status_epilepticus', 'absence_seizure'],
    syndromes: ['neurological_syndrome'],
    redFlags: ['status_epilepticus', 'prolonged_postictal', 'fever', 'head_trauma', 'neck_stiffness', 'new_onset_>_40y'],
    timeCategories: ['single_episode', 'recurrent', 'status_epilepticus'],
    emergencyLevel: 'red',
    visibility: {
      showSections: ['neurological_hpi', 'abcde_assessment', 'seizure_characterization'],
      hideSections: ['abdominal_exam', 'musculoskeletal_exam'],
      showTabs: ['abcde', 'hpi', 'examination', 'investigations'], hideTabs: [],
      showCards: ['seizure_type', 'seizure_duration', 'seizure_aura', 'seizure_witness', 'seizure_tongue_bite', 'seizure_incontinence', 'seizure_postictal'],
      hideCards: ['pain_characterization', 'peritonism'],
      showButtons: ['abcde_protocol', 'antiepileptic_ordering', 'ct_brain_ordering'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['seizure_type', 'seizure_duration', 'seizure_postictal'],
      optionalQuestions: ['seizure_aura', 'seizure_witness', 'seizure_tongue_bite', 'seizure_incontinence', 'fever', 'head_trauma', 'drug_history', 'alcohol_history'],
      conditionalQuestions: [
        { field: 'fever', value: true, questions: ['meningitis_screening', 'lumbar_puncture', 'malaria_test'] },
        { field: 'seizure_duration', value: 5, questions: ['status_epilepticus_protocol', 'iv_antiepileptics'] },
        { field: 'pregnancy', value: 'pregnant', questions: ['eclampsia_screening', 'blood_pressure', 'urine_protein'] },
      ],
      negativeQuestions: ['fever', 'head_trauma', 'drug_withdrawal', 'alcohol_withdrawal'],
      sequence: ['pre_ictal', 'ictal', 'post_ictal', 'frequency', 'triggers'],
      stoppingRules: ['status_epilepticus_requires_abcde_and_iv_medication'],
    },
    ros: {
      primarySystems: ['neurological'],
      secondarySystems: ['general', 'cardiovascular', 'metabolic'],
      optionalSystems: ['psychiatric'],
      hiddenSystems: [],
      crossSystemLinks: [{ symptom: 'seizure', systems: ['neurological', 'metabolic', 'infectious_disease'] }],
    },
    examination: {
      generalExam: ['abcde_assessment', 'vital_signs', 'blood_glucose', 'gcs'],
      focusedExam: ['neurological_exam', 'fundoscopy'],
      mandatoryExam: ['airway', 'breathing', 'circulation', 'disability', 'blood_glucose'],
      optionalExam: ['full_neurological_exam', 'fundoscopy'],
      hiddenExam: ['abdominal_exam'],
      specialTests: ['fundoscopy', 'meningeal_signs'],
      scoringSystems: ['gcs', 'news2'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['infectious', 'metabolic', 'vascular', 'neoplastic', 'traumatic', 'toxic', 'idiopathic'],
      syndromes: ['neurological_syndrome'],
      reasoningStage: 'history_and_exam',
      minimumDataFields: ['seizure_type', 'seizure_duration', 'blood_glucose', 'gcs'],
    },
    investigationReadiness: {
      potentialTests: ['blood_glucose', 'electrolytes', 'ct_brain', 'eeg', 'malaria_test', 'lumbar_puncture'],
      conditions: [
        { test: 'blood_glucose', requiredFields: ['seizure_onset'], threshold: 'immediate for any seizure' },
        { test: 'ct_brain', requiredFields: ['seizure_type', 'age'], threshold: 'new onset > 40 years or focal' },
      ],
      urgency: ['blood_glucose_immediate', 'ct_brain_urgent_if_red_flag'],
      dependencies: ['stabilize_before_ct'],
    },
    managementReadiness: {
      domains: ['emergency', 'neurology'],
      emergencyActions: ['abcde', 'iv_access', 'blood_glucose_check', 'iv_antiepileptics'],
      monitoringRequired: ['gcs_chart', 'seizure_chart', 'vital_signs_q15min'],
      referralCriteria: ['status_epilepticus', 'new_onset', 'refractory'],
    },
    monitoring: {
      vitalsFrequency: 'q15min_if_active',
      requiredScores: ['gcs', 'news2'],
      observationCharts: ['seizure_chart', 'gcs_chart'],
      alerts: ['prolonged_seizure', 'reduced_gcs', 'hypoglycemia'],
      escalationThresholds: [
        { parameter: 'seizure_duration', threshold: 5, action: 'status_epilepticus_protocol' },
        { parameter: 'gcs', threshold: 12, action: 'neurology_review' },
      ],
    },
    workflow: {
      isolationRequired: false,
      pathways: ['status_epilepticus_pathway', 'first_seizure_pathway', 'eclampsia_pathway'],
      teamActivation: ['neurology_team', 'icu_team_if_status'],
      admissionCriteria: ['status_epilepticus', 'new_onset', 'refractory_seizure'],
      dischargeCriteria: ['seizure_free_24h', 'stable_neurology'],
    },
    documentation: {
      narrativeTemplate: 'neurological_hpi',
      summaryTemplate: 'seizure_summary',
      problemRepresentation: 'seizure_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.8,
      missingDataThreshold: 0.2,
      reasoningThreshold: 0.7,
      unsafeThreshold: 0.95,
      escalationThreshold: 0.85,
      humanConfirmationRequired: ['status_diagnosis', 'antiepileptic_choice'],
      neverInfer: ['eclampsia_without_pregnancy_test'],
      canAutoComplete: ['seizure_duration_tracking'],
      cannotAutoComplete: ['need_for_ventilation'],
    },
  },

  // ────────────────────────────────────────────────────────────
  // BLEEDING (non-traumatic)
  // ────────────────────────────────────────────────────────────
  bleeding: {
    id: 'bleeding', displayName: 'Bleeding / Hemorrhage',
    synonyms: ['hemorrhage', 'blood loss', 'active bleeding'],
    patientLanguage: ['bleeding', 'blood loss', 'hemorrhage', 'bleeding from'],
    presentationType: 'symptom', bodySystems: ['hematology', 'cardiovascular'],
    ageRules: {}, genderRules: [], pregnancyRules: ['pregnant', 'postpartum'],
    activationRules: [],
    mechanisms: ['vascular', 'traumatic', 'coagulopathic', 'neoplastic', 'infectious'],
    phenotypes: ['gi_bleed', 'vaginal_bleeding', 'epistaxis', 'hemoptysis', 'hematuria', 'post_surgical_bleed'],
    syndromes: ['hemorrhagic_shock'],
    redFlags: ['hemodynamic_instability', 'massive_hemorrhage', 'altered_consciousness', 'known_coagulopathy'],
    timeCategories: ['acute_less_than_24h', 'subacute_1_to_7_days', 'chronic_more_than_7_days', 'recurrent'],
    emergencyLevel: 'orange',
    visibility: {
      showSections: ['bleeding_hpi', 'hemodynamic_assessment', 'coagulation'],
      hideSections: ['respiratory_hpi'],
      showTabs: ['hpi', 'examination'], hideTabs: [],
      showCards: ['bleeding_source', 'bleeding_duration', 'bleeding_volume', 'bleeding_triggers', 'bleeding_history'],
      hideCards: ['pain_characterization'],
      showButtons: ['cross_match_ordering', 'coagulation_studies'],
      hideButtons: [],
    },
    history: {
      requiredQuestions: ['bleeding_source', 'bleeding_duration', 'bleeding_volume'],
      optionalQuestions: ['bleeding_triggers', 'bleeding_history', 'known_coagulopathy', 'anticoagulant_use'],
      conditionalQuestions: [
        { field: 'bleeding_source', value: 'vaginal', questions: ['pregnancy_test', 'lmp', 'obstetric_referral'] },
        { field: 'anticoagulant_use', value: true, questions: ['inr', 'reversal_agents'] },
      ],
      negativeQuestions: ['known_coagulopathy', 'anticoagulant_use', 'trauma'],
      sequence: ['source', 'onset', 'volume', 'duration', 'associated_symptoms'],
      stoppingRules: ['hemodynamic_instability_requires_resuscitation'],
    },
    ros: {
      primarySystems: ['cardiovascular', 'hematology'],
      secondarySystems: ['general', 'gi', 'obgyn'],
      optionalSystems: [],
      hiddenSystems: [],
      crossSystemLinks: [{ symptom: 'bleeding', systems: ['cardiovascular', 'hematology', 'obgyn'] }],
    },
    examination: {
      generalExam: ['vital_signs', 'hemodynamic_status', 'skin_pallor'],
      focusedExam: ['bleeding_site_exam'],
      mandatoryExam: ['blood_pressure', 'heart_rate', 'capillary_refill'],
      optionalExam: ['abdominal_exam', 'rectal_exam'],
      hiddenExam: [],
      specialTests: ['postural_blood_pressure'],
      scoringSystems: ['shock_index', 'news2', 'rockall_score'],
    },
    reasoning: {
      excludeDiagnoses: [],
      mechanisms: ['vascular', 'traumatic', 'coagulopathic', 'neoplastic'],
      syndromes: ['hemorrhagic_shock'],
      reasoningStage: 'history_and_exam',
      minimumDataFields: ['bleeding_source', 'bleeding_volume', 'blood_pressure', 'heart_rate'],
    },
    investigationReadiness: {
      potentialTests: ['full_blood_count', 'coagulation_profile', 'cross_match', 'group_and_save', 'bleeding_source_imaging'],
      conditions: [
        { test: 'cross_match', requiredFields: ['bleeding_volume', 'hemodynamic_status'], threshold: 'moderate to severe bleeding' },
      ],
      urgency: ['cross_match_urgent_if_hemodynamically_unstable'],
      dependencies: ['resuscitation_before_investigations_if_unstable'],
    },
    managementReadiness: {
      domains: ['emergency', 'surgical'],
      emergencyActions: ['iv_access', 'fluid_resuscitation', 'blood_transfusion', 'bleeding_control'],
      monitoringRequired: ['hemodynamic_monitoring', 'blood_loss_chart'],
      referralCriteria: ['hemodynamic_instability', 'massive_hemorrhage', 'surgical_source'],
    },
    monitoring: {
      vitalsFrequency: 'q15min_if_active',
      requiredScores: ['shock_index', 'news2'],
      observationCharts: ['blood_loss_chart', 'hemodynamic_chart'],
      alerts: ['tachycardia', 'hypotension', 'dropping_hemoglobin'],
      escalationThresholds: [
        { parameter: 'systolic_bp', threshold: 90, action: 'massive_transfusion_protocol' },
        { parameter: 'heart_rate', threshold: 120, action: 'fluid_resuscitation' },
      ],
    },
    workflow: {
      isolationRequired: false,
      pathways: ['massive_hemorrhage_pathway', 'gi_bleed_pathway'],
      teamActivation: ['surgical_team', 'blood_bank'],
      admissionCriteria: ['hemodynamic_instability', 'active_bleeding', 'coagulopathy'],
      dischargeCriteria: ['hemodynamically_stable', 'bleeding_stopped', 'hemoglobin_stable'],
    },
    documentation: {
      narrativeTemplate: 'bleeding_hpi',
      summaryTemplate: 'bleeding_summary',
      problemRepresentation: 'bleeding_representation',
      timelineRequired: true,
      soapFormat: 'subjective_objective',
    },
    ai: {
      confidenceThreshold: 0.8,
      missingDataThreshold: 0.2,
      reasoningThreshold: 0.7,
      unsafeThreshold: 0.95,
      escalationThreshold: 0.85,
      humanConfirmationRequired: ['transfusion_decision', 'surgical_intervention'],
      neverInfer: ['need_for_transfusion_without_hemoglobin'],
      canAutoComplete: ['blood_loss_calculation'],
      cannotAutoComplete: ['transfusion_decision'],
    },
  },

}; // end PRESENTATION REGISTRY

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

export function getPresentation(id: string): ClinicalPresentationObject | undefined {
  return CLINICAL_PRESENTATIONS[id];
}

export function getPresentationsBySystem(system: BodySystem): ClinicalPresentationObject[] {
  return Object.values(CLINICAL_PRESENTATIONS).filter(p => p.bodySystems.includes(system));
}

export function getPresentationsByType(type: PresentationType): ClinicalPresentationObject[] {
  return Object.values(CLINICAL_PRESENTATIONS).filter(p => p.presentationType === type);
}

export function searchPresentations(term: string): ClinicalPresentationObject[] {
  const lower = term.toLowerCase();
  return Object.values(CLINICAL_PRESENTATIONS).filter(p =>
    p.displayName.toLowerCase().includes(lower) ||
    p.synonyms.some(s => s.toLowerCase().includes(lower)) ||
    p.patientLanguage.some(l => l.toLowerCase().includes(lower))
  );
}
