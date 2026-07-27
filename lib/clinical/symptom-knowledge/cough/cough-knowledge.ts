// ═══════════════════════════════════════════════════════════════
// AMEXAN UNIVERSAL CLINICAL OPERATING SYSTEM (UCOS)
// COUGH KNOWLEDGE OBJECT — the complete cough constitution
// Every symptom inherits this architecture.
// 18 levels: Identity → Context → Etiology → Mechanism →
// Phenotype → Questions → Exam → Differentials → Investigations →
// Results → Management → Guidelines → Localization → Workflow →
// Monitoring → Longitudinal → AI → HMIS
// ═══════════════════════════════════════════════════════════════
// NOT pneumonia knowledge. NOT TB knowledge. COUGH knowledge.
// Diseases are referenced. Physiology is owned.
// ═══════════════════════════════════════════════════════════════

import type { AgeGroup, Sex } from '../../constitutional/registration-engine/types';
import type { MechanismCategoryUniversal, ClinicalConfidence, QuestionPriority, InputType } from '../../constitutional/hpi-constitution';

// ─────────────────────────────────────────────────────────────────
// LEVEL 1: IDENTITY LAYER
// ─────────────────────────────────────────────────────────────────

export interface CoughIdentity {
  id: 'cough';
  displayName: string;
  aliases: string[];
  patientWords: string[];
  snomed: string;
  icd10: string;
  icd11: string;
  bodySystems: string[];
  organs: string[];
  severityClasses: CoughSeverityClass[];
  durationClasses: CoughDurationClass[];
  clinicalUrgency: CoughUrgency;
  ageBehaviour: Record<AgeGroup, CoughAgeBehaviour>;
  pregnancyBehaviour: CoughPregnancyBehaviour;
  neonatalBehaviour: CoughNeonatalBehaviour;
  existingDiseaseModifiers: CoughDiseaseModifier[];
  immunosuppressionModifiers: CoughImmunosuppressionModifier[];
  postoperativeModifiers: CoughPostOpModifier[];
  icuModifiers: CoughICUModifier[];
  emergencyModifiers: CoughEmergencyModifier[];
}

export type CoughSeverityClass = 'mild' | 'moderate' | 'severe' | 'life_threatening';
export type CoughDurationClass = 'acute' | 'subacute' | 'chronic' | 'recurrent';
export type CoughUrgency = 'green' | 'yellow' | 'orange' | 'red';

export interface CoughAgeBehaviour {
  commonCauses: string[];
  redFlags: string[];
  typicalPresentation: string;
  questioningAdaptation: string;
}

export interface CoughPregnancyBehaviour {
  trimesterSpecific: string[];
  medicationChanges: string[];
  increasedRisks: string[];
}

export interface CoughNeonatalBehaviour {
  specialConsiderations: string[];
  feedingCoughWeight: number;
  apnoeaRisk: boolean;
}

export interface CoughDiseaseModifier {
  disease: string;
  effect: string;
  questionChanges: string[];
  investigationChanges: string[];
}

export interface CoughImmunosuppressionModifier {
  type: string;
  additionalCauses: string[];
  changedPriorities: string[];
}

export interface CoughPostOpModifier {
  surgeryType: string;
  additionalMechanisms: string[];
  redFlagOverride: string[];
}

export interface CoughICUModifier {
  ventilatorAssociated: boolean;
  aspirationRisk: boolean;
  monitoringChanges: string[];
}

export interface CoughEmergencyModifier {
  triageOverride: string;
  immediateActions: string[];
  timeCritical: boolean;
}

// ─────────────────────────────────────────────────────────────────
// LEVEL 2: CONTEXT RULES
// ─────────────────────────────────────────────────────────────────

export interface CoughContextRule {
  context: string;
  condition: CoughContextCondition;
  behaviour: CoughContextBehaviour;
}

export type CoughAgeGroup = AgeGroup | 'neonate' | 'child' | 'preterm';

export interface CoughContextCondition {
  ageGroup?: CoughAgeGroup;
  sex?: Sex;
  pregnant?: boolean;
  postpartum?: boolean;
  existingDisease?: string;
  immunosuppressed?: boolean;
  icuPatient?: boolean;
  ventilated?: boolean;
  postoperative?: boolean;
  traumaPatient?: boolean;
  hivPositive?: boolean;
  cancerPatient?: boolean;
  heartFailure?: boolean;
  copd?: boolean;
  renalFailure?: boolean;
  liverDisease?: boolean;
  diabetes?: boolean;
  malnutrition?: boolean;
  transplant?: boolean;
  onChemotherapy?: boolean;
  onRadiation?: boolean;
  onSteroids?: boolean;
  cerebrovascularDisease?: boolean;
  dementia?: boolean;
  endemicTbHigh?: boolean;
  tbContactHousehold?: boolean;
  healthcareWorker?: boolean;
  resourceLevel?: 'low' | 'middle' | 'high';
}

export interface CoughContextBehaviour {
  nocturnalCoughWeight: number;
  feedingCoughWeight: number;
  chronicCoughThreshold: number;
  cancerBranchOpens: boolean;
  tbBranchOpens: boolean;
  asthmaBranchWeight: number;
  gerdBranchWeight: number;
  aceInhibitorCheck: boolean;
  peRiskMultiplier: number;
  aspirationRiskWeight: number;
  additionalRequiredQuestions: string[];
  additionalRequiredExams: string[];
  hiddenQuestions: string[];
  priorityOverrides: Record<string, QuestionPriority>;
}

export const COUGH_CONTEXT_RULES: CoughContextRule[] = [
  {
    context: 'neonate',
    condition: { ageGroup: 'neonate' },
    behaviour: {
      nocturnalCoughWeight: 0.1, feedingCoughWeight: 0.9, chronicCoughThreshold: 7,
      cancerBranchOpens: false, tbBranchOpens: false, asthmaBranchWeight: 0.1,
      gerdBranchWeight: 0.1, aceInhibitorCheck: false, peRiskMultiplier: 0.5,
      aspirationRiskWeight: 0.85, additionalRequiredQuestions: ['feeding_cough', 'choking_episodes', 'cyanotic_spells'],
      additionalRequiredExams: ['feeding_observation', 'oxygen_saturation_monitoring'],
      hiddenQuestions: ['smoking', 'occupational_exposure'], priorityOverrides: {},
    },
  },
  {
    context: 'infant',
    condition: { ageGroup: 'infant' },
    behaviour: {
      nocturnalCoughWeight: 0.3, feedingCoughWeight: 0.7, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: false, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.4, aceInhibitorCheck: false, peRiskMultiplier: 0.5,
      aspirationRiskWeight: 0.6, additionalRequiredQuestions: ['feeding_cough', 'wheeze', 'fever'],
      additionalRequiredExams: ['respiratory_rate', 'chest_indrawing', 'oxygen_saturation'],
      hiddenQuestions: ['smoking', 'occupational_exposure'], priorityOverrides: {},
    },
  },
  {
    context: 'adult_smoker',
    condition: { ageGroup: 'adult', existingDisease: 'smoker' },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 14,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.4,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.5,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['smoking_pack_years', 'hemoptysis', 'weight_loss', 'night_sweats'],
      additionalRequiredExams: ['chest_auscultation', 'clubbing', 'lymph_nodes'],
      hiddenQuestions: [], priorityOverrides: { hemoptysis: 'critical' },
    },
  },
  {
    context: 'pregnant',
    condition: { pregnant: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.3, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.6,
      gerdBranchWeight: 0.5, aceInhibitorCheck: true, peRiskMultiplier: 3.0,
      aspirationRiskWeight: 0.4, additionalRequiredQuestions: ['gestational_age', 'pe_symptoms', 'asthma_history'],
      additionalRequiredExams: ['oxygen_saturation', 'respiratory_rate', 'fetal_heart_rate'],
      hiddenQuestions: [], priorityOverrides: { dyspnea: 'critical' },
    },
  },
  {
    context: 'hiv_positive',
    condition: { hivPositive: true },
    behaviour: {
      nocturnalCoughWeight: 0.6, feedingCoughWeight: 0.2, chronicCoughThreshold: 14,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.2, aceInhibitorCheck: true, peRiskMultiplier: 1.2,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['cd4_count', 'art_regimen', 'opportunistic_infections', 'tb_contact'],
      additionalRequiredExams: ['oral_thrush', 'lymph_nodes', 'chest_auscultation', 'weight_assessment'],
      hiddenQuestions: [], priorityOverrides: { tb_screening: 'critical', pcp_prophylaxis: 'essential' },
    },
  },
  {
    context: 'heart_failure',
    condition: { heartFailure: true },
    behaviour: {
      nocturnalCoughWeight: 0.8, feedingCoughWeight: 0.3, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: false, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.5,
      aspirationRiskWeight: 0.2, additionalRequiredQuestions: ['orthopnea', 'pnd', 'pedal_edema', 'exercise_tolerance'],
      additionalRequiredExams: ['lung_auscultation', 'jvp', 'pedal_edema', 'hepatomegaly'],
      hiddenQuestions: [], priorityOverrides: { orthopnea: 'critical', pnd: 'critical' },
    },
  },
  {
    context: 'copd',
    condition: { copd: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 7,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.4, aceInhibitorCheck: true, peRiskMultiplier: 1.3,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['sputum_change', 'dyspnea_worsening', 'previous_exacerbations', 'home_o2'],
      additionalRequiredExams: ['chest_auscultation', 'oxygen_saturation', 'accessory_muscle_use', 'purse_lip_breathing'],
      hiddenQuestions: [], priorityOverrides: { sputum_purulence: 'critical', dyspnea_worsening: 'critical' },
    },
  },
  {
    context: 'preterm_neonate',
    condition: { ageGroup: 'neonate', existingDisease: 'preterm' },
    behaviour: {
      nocturnalCoughWeight: 0.05, feedingCoughWeight: 0.95, chronicCoughThreshold: 5,
      cancerBranchOpens: false, tbBranchOpens: false, asthmaBranchWeight: 0.05,
      gerdBranchWeight: 0.4, aceInhibitorCheck: false, peRiskMultiplier: 0.3,
      aspirationRiskWeight: 0.95, additionalRequiredQuestions: ['gestational_age', 'birth_weight', 'apnoea_monitoring', 'feeding_tolerance', 'oxygen_requirement'],
      additionalRequiredExams: ['cardiorespiratory_monitoring', 'oxygen_saturation_continuous', 'feeding_observation', 'chest_indrawing'],
      hiddenQuestions: ['smoking', 'occupational_exposure', 'heartburn', 'weight_loss'],
      priorityOverrides: { apnoea: 'critical', cyanosis: 'critical' },
    },
  },
  {
    context: 'toddler',
    condition: { ageGroup: 'toddler' },
    behaviour: {
      nocturnalCoughWeight: 0.4, feedingCoughWeight: 0.5, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.3, aceInhibitorCheck: false, peRiskMultiplier: 0.5,
      aspirationRiskWeight: 0.6, additionalRequiredQuestions: ['fever', 'wheeze', 'croup_symptoms', 'choking_episodes', 'immunization_status'],
      additionalRequiredExams: ['respiratory_rate', 'chest_indrawing', 'ent_exam', 'oxygen_saturation', 'stridor_assessment'],
      hiddenQuestions: ['smoking', 'occupational_exposure', 'ace_inhibitor', 'heartburn'],
      priorityOverrides: { stridor: 'critical', respiratory_distress: 'critical' },
    },
  },
  {
    context: 'preschool',
    condition: { ageGroup: 'preschool' },
    behaviour: {
      nocturnalCoughWeight: 0.45, feedingCoughWeight: 0.3, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.4,
      gerdBranchWeight: 0.2, aceInhibitorCheck: false, peRiskMultiplier: 0.5,
      aspirationRiskWeight: 0.4, additionalRequiredQuestions: ['fever', 'wheeze', 'croup_symptoms', 'immunization_status', 'night_symptoms'],
      additionalRequiredExams: ['chest_auscultation', 'ent_exam', 'oxygen_saturation', 'peak_flow_if_able'],
      hiddenQuestions: ['smoking', 'occupational_exposure', 'ace_inhibitor', 'weight_loss'],
      priorityOverrides: { wheeze: 'essential', stridor: 'critical' },
    },
  },
  {
    context: 'school_age',
    condition: { ageGroup: 'school_age' },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.5,
      gerdBranchWeight: 0.2, aceInhibitorCheck: false, peRiskMultiplier: 0.5,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['asthma_history', 'exercise_symptoms', 'nocturnal_symptoms', 'tb_contact'],
      additionalRequiredExams: ['chest_auscultation', 'ent_exam', 'peak_flow', 'oxygen_saturation'],
      hiddenQuestions: ['occupational_exposure', 'ace_inhibitor'],
      priorityOverrides: { exercise_cough: 'essential', nocturnal_cough: 'essential' },
    },
  },
  {
    context: 'adolescent',
    condition: { ageGroup: 'adolescent' },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.15, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.4,
      gerdBranchWeight: 0.3, aceInhibitorCheck: false, peRiskMultiplier: 1.2,
      aspirationRiskWeight: 0.2, additionalRequiredQuestions: ['smoking', 'asthma_history', 'exercise_symptoms', 'tb_contact', 'hiv_status'],
      additionalRequiredExams: ['chest_auscultation', 'peak_flow', 'oxygen_saturation', 'lymph_nodes'],
      hiddenQuestions: ['feeding_cough', 'immunization_status'],
      priorityOverrides: { smoking: 'essential', tb_screening: 'essential' },
    },
  },
  {
    context: 'elderly_frail',
    condition: { ageGroup: 'older_adult', existingDisease: 'frail' },
    behaviour: {
      nocturnalCoughWeight: 0.6, feedingCoughWeight: 0.4, chronicCoughThreshold: 14,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.4, aceInhibitorCheck: true, peRiskMultiplier: 2.0,
      aspirationRiskWeight: 0.6, additionalRequiredQuestions: ['aspiration_risk', 'swallowing_difficulty', 'functional_status', 'medication_list', 'falls_history'],
      additionalRequiredExams: ['swallow_assessment', 'chest_auscultation', 'oxygen_saturation', 'cognition_assessment', 'functional_assessment'],
      hiddenQuestions: ['exercise_cough', 'occupational_exposure'],
      priorityOverrides: { aspiration_risk: 'critical', swallowing: 'critical', falls: 'essential' },
    },
  },
  {
    context: 'icu_ventilated',
    condition: { icuPatient: true, ventilated: true },
    behaviour: {
      nocturnalCoughWeight: 0.1, feedingCoughWeight: 0.1, chronicCoughThreshold: 3,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.1,
      gerdBranchWeight: 0.1, aceInhibitorCheck: true, peRiskMultiplier: 2.0,
      aspirationRiskWeight: 0.8, additionalRequiredQuestions: ['ventilation_duration', 'secretions_character', 'et_cuff_leak', 'sedation_level', 'vap_prophylaxis'],
      additionalRequiredExams: ['ventilator_assessment', 'secretions_suctioning', 'hemodynamic_monitoring', 'chest_auscultation', 'et_tube_position'],
      hiddenQuestions: ['cough_severity', 'cough_timing', 'cough_feeding_difficulty', 'exercise_cough'],
      priorityOverrides: { vap_screening: 'critical', secretions: 'critical', hemodynamics: 'critical' },
    },
  },
  {
    context: 'postoperative',
    condition: { postoperative: true },
    behaviour: {
      nocturnalCoughWeight: 0.4, feedingCoughWeight: 0.3, chronicCoughThreshold: 7,
      cancerBranchOpens: false, tbBranchOpens: false, asthmaBranchWeight: 0.2,
      gerdBranchWeight: 0.2, aceInhibitorCheck: true, peRiskMultiplier: 3.0,
      aspirationRiskWeight: 0.5, additionalRequiredQuestions: ['surgery_type', 'surgery_date', 'atelectasis_screening', 'pe_symptoms', 'wound_pain_cough'],
      additionalRequiredExams: ['chest_auscultation', 'surgical_wound_inspection', 'oxygen_saturation', 'cough_effectiveness'],
      hiddenQuestions: ['exercise_cough', 'occupational_exposure'],
      priorityOverrides: { pe_screening: 'critical', atelectasis: 'essential', wound_dehiscence: 'critical' },
    },
  },
  {
    context: 'renal_failure',
    condition: { renalFailure: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.5,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['fluid_status', 'dialysis_schedule', 'pulmonary_edema_symptoms', 'medication_review'],
      additionalRequiredExams: ['lung_auscultation', 'jvp', 'pedal_edema', 'fluid_balance_chart'],
      hiddenQuestions: ['exercise_cough'],
      priorityOverrides: { pulmonary_edema: 'critical', fluid_overload: 'critical' },
    },
  },
  {
    context: 'liver_disease',
    condition: { liverDisease: true },
    behaviour: {
      nocturnalCoughWeight: 0.4, feedingCoughWeight: 0.2, chronicCoughThreshold: 14,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.2,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['ascites', 'hepatic_encephalopathy', 'bleeding_tendency', 'medication_metabolism'],
      additionalRequiredExams: ['abdominal_examination', 'jaundice_assessment', 'chest_auscultation'],
      hiddenQuestions: [],
      priorityOverrides: { bleeding: 'critical', hepatic_encephalopathy: 'critical' },
    },
  },
  {
    context: 'diabetes',
    condition: { diabetes: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.4,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.3,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['diabetes_control', 'hba1c', 'blood_glucose', 'infections_frequency'],
      additionalRequiredExams: ['foot_examination', 'fundoscopy', 'chest_auscultation'],
      hiddenQuestions: [],
      priorityOverrides: { blood_glucose: 'essential', infection_monitoring: 'essential' },
    },
  },
  {
    context: 'malnutrition',
    condition: { malnutrition: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.4, chronicCoughThreshold: 10,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.3, aceInhibitorCheck: false, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.4, additionalRequiredQuestions: ['nutritional_assessment', 'mid_upper_arm_circumference', 'tb_screening', 'hiv_test'],
      additionalRequiredExams: ['anthropometry', 'edema_assessment', 'chest_auscultation', 'lymph_nodes'],
      hiddenQuestions: ['occupational_exposure', 'exercise_cough'],
      priorityOverrides: { tb_screening: 'critical', nutritional_status: 'essential' },
    },
  },
  {
    context: 'immunocompromised_nonspecific',
    condition: { immunosuppressed: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 10,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.2,
      gerdBranchWeight: 0.2, aceInhibitorCheck: false, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['immunosuppression_cause', 'neutrophil_count', 'prophylaxis', 'recent_infections'],
      additionalRequiredExams: ['full_examination', 'oral_cavity', 'skin_examination', 'lymph_nodes'],
      hiddenQuestions: [],
      priorityOverrides: { opportunistic_infection: 'critical', tb_screening: 'critical' },
    },
  },
  {
    context: 'oncology_active',
    condition: { cancerPatient: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 10,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.2,
      gerdBranchWeight: 0.2, aceInhibitorCheck: true, peRiskMultiplier: 2.0,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['cancer_type', 'treatment_phase', 'neutropenia', 'pe_symptoms', 'new_respiratory_symptoms'],
      additionalRequiredExams: ['full_examination', 'lymph_nodes', 'chest_auscultation', 'oxygen_saturation'],
      hiddenQuestions: [],
      priorityOverrides: { neutropenic_sepsis: 'critical', pe: 'critical', new_lesion: 'critical' },
    },
  },
  {
    context: 'cerebrovascular_disease',
    condition: { cerebrovascularDisease: true },
    behaviour: {
      nocturnalCoughWeight: 0.4, feedingCoughWeight: 0.6, chronicCoughThreshold: 10,
      cancerBranchOpens: false, tbBranchOpens: false, asthmaBranchWeight: 0.2,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 2.0,
      aspirationRiskWeight: 0.8, additionalRequiredQuestions: ['swallowing_assessment', 'aspiration_history', 'mobility_status', 'feeding_assistance'],
      additionalRequiredExams: ['swallow_screening', 'chest_auscultation', 'neurological_examination', 'oxygen_saturation'],
      hiddenQuestions: ['exercise_cough', 'occupational_exposure'],
      priorityOverrides: { aspiration: 'critical', swallowing_safety: 'critical' },
    },
  },
  {
    context: 'dementia',
    condition: { dementia: true },
    behaviour: {
      nocturnalCoughWeight: 0.4, feedingCoughWeight: 0.5, chronicCoughThreshold: 10,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.2,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.5,
      aspirationRiskWeight: 0.7, additionalRequiredQuestions: ['swallowing_assessment', 'carer_report', 'feeding_difficulty', 'medication_compliance'],
      additionalRequiredExams: ['swallow_screening', 'chest_auscultation', 'cognitive_assessment', 'nutritional_assessment'],
      hiddenQuestions: ['exercise_cough', 'occupational_exposure', 'smoking_pack_years'],
      priorityOverrides: { aspiration: 'critical', carer_burden: 'essential' },
    },
  },
  {
    context: 'healthcare_worker',
    condition: { healthcareWorker: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.15, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.3,
      gerdBranchWeight: 0.2, aceInhibitorCheck: true, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.2, additionalRequiredQuestions: ['occupational_exposure', 'ppe_availability', 'tb_screening', 'covid19_contact', 'needlestick_injury'],
      additionalRequiredExams: ['chest_auscultation', 'oxygen_saturation', 'infection_control_assessment'],
      hiddenQuestions: ['feeding_cough', 'immunization_status'],
      priorityOverrides: { tb_screening: 'critical', occupational_health: 'essential' },
    },
  },
  {
    context: 'endemic_tb_area',
    condition: { endemicTbHigh: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 10,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.2,
      gerdBranchWeight: 0.2, aceInhibitorCheck: true, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['tb_contact', 'cough_duration', 'night_sweats', 'weight_loss', 'hiv_test'],
      additionalRequiredExams: ['chest_auscultation', 'lymph_nodes', 'weight_assessment'],
      hiddenQuestions: [],
      priorityOverrides: { tb_screening: 'critical', cough_duration: 'critical' },
    },
  },
  {
    context: 'tb_contact_household',
    condition: { tbContactHousehold: true },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.2, chronicCoughThreshold: 7,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.2,
      gerdBranchWeight: 0.2, aceInhibitorCheck: true, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['index_case_details', 'exposure_duration', 'cough_symptoms', 'night_sweats', 'hiv_test'],
      additionalRequiredExams: ['chest_auscultation', 'lymph_nodes', 'weight_assessment', 'temperature'],
      hiddenQuestions: [],
      priorityOverrides: { tb_screening: 'critical', contact_tracing: 'essential' },
    },
  },
  {
    context: 'resource_low',
    condition: { resourceLevel: 'low' },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.3, chronicCoughThreshold: 14,
      cancerBranchOpens: false, tbBranchOpens: true, asthmaBranchWeight: 0.4,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['tb_screening', 'hiv_test', 'malaria_test_if_febrile', 'treatment_access'],
      additionalRequiredExams: ['chest_auscultation', 'oxygen_saturation_if_available', 'lymph_nodes', 'weight_assessment'],
      hiddenQuestions: ['occupational_exposure', 'exercise_cough', 'smoking_pack_years'],
      priorityOverrides: { tb_screening: 'critical', hiv_test: 'essential' },
    },
  },
  {
    context: 'resource_middle',
    condition: { resourceLevel: 'middle' },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.3, chronicCoughThreshold: 14,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.4,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['tb_screening', 'hiv_test', 'chest_xray_available'],
      additionalRequiredExams: ['chest_auscultation', 'oxygen_saturation', 'lymph_nodes', 'clubbing'],
      hiddenQuestions: [],
      priorityOverrides: { tb_screening: 'critical', chest_xray: 'essential' },
    },
  },
  {
    context: 'resource_high',
    condition: { resourceLevel: 'high' },
    behaviour: {
      nocturnalCoughWeight: 0.5, feedingCoughWeight: 0.3, chronicCoughThreshold: 14,
      cancerBranchOpens: true, tbBranchOpens: true, asthmaBranchWeight: 0.4,
      gerdBranchWeight: 0.3, aceInhibitorCheck: true, peRiskMultiplier: 1.0,
      aspirationRiskWeight: 0.3, additionalRequiredQuestions: ['full_history', 'ct_chest_available', 'bronchoscopy_available'],
      additionalRequiredExams: ['full_examination', 'spirometry', 'oxygen_saturation', 'ct_chest_if_indicated'],
      hiddenQuestions: [],
      priorityOverrides: {},
    },
  },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 3: ETIOLOGY LAYER — causes grouped by mechanism
// ─────────────────────────────────────────────────────────────────

export interface CoughEtiology {
  mechanismGroup: MechanismCategoryUniversal;
  label: string;
  causes: CoughCause[];
}

export interface CoughCause {
  id: string;
  name: string;
  typicality: 'common' | 'uncommon' | 'rare';
  acuteProbability: number;
  chronicProbability: number;
  typicalPhenotype: string[];
  discriminatingFeatures: string[];
  requiredEvidence: string[];
}

export const COUGH_ETIOLOGIES: CoughEtiology[] = [
  {
    mechanismGroup: 'infectious',
    label: 'Infectious Causes',
    causes: [
      { id: 'cap', name: 'Community-acquired pneumonia', typicality: 'common', acuteProbability: 0.35, chronicProbability: 0.05, typicalPhenotype: ['productive', 'febrile'], discriminatingFeatures: ['fever', 'crackles', 'sputum_purulence'], requiredEvidence: ['fever', 'crackles', 'cxr_consolidation'] },
      { id: 'tb', name: 'Pulmonary tuberculosis', typicality: 'common', acuteProbability: 0.05, chronicProbability: 0.45, typicalPhenotype: ['chronic', 'productive', 'hemoptysis'], discriminatingFeatures: ['night_sweats', 'weight_loss', 'chronic_cough_>2weeks'], requiredEvidence: ['cough_>2weeks', 'night_sweats', 'weight_loss', 'geneXpert'] },
      { id: 'covid19', name: 'COVID-19', typicality: 'common', acuteProbability: 0.25, chronicProbability: 0.1, typicalPhenotype: ['dry', 'febrile', 'systemic'], discriminatingFeatures: ['loss_smell', 'loss_taste', 'contacts'], requiredEvidence: ['fever', 'dry_cough', 'pcr_test'] },
      { id: 'bronchitis_acute', name: 'Acute bronchitis', typicality: 'common', acuteProbability: 0.4, chronicProbability: 0.0, typicalPhenotype: ['acute', 'productive', 'self_limiting'], discriminatingFeatures: ['viral_prodrome', 'self_limiting'], requiredEvidence: ['acute_onset', 'no_consolidation'] },
      { id: 'bronchiolitis', name: 'Bronchiolitis (RSV)', typicality: 'common', acuteProbability: 0.3, chronicProbability: 0.0, typicalPhenotype: ['wheezy', 'infant'], discriminatingFeatures: ['infant', 'wheeze', 'rsv_season'], requiredEvidence: ['infant', 'wheeze', 'rsv_test'] },
      { id: 'pertussis', name: 'Whooping cough', typicality: 'uncommon', acuteProbability: 0.1, chronicProbability: 0.05, typicalPhenotype: ['paroxysmal', 'whooping'], discriminatingFeatures: ['paroxysmal_cough', 'posttussive_vomiting', 'whoop'], requiredEvidence: ['paroxysmal_cough', 'pcr_pertussis'] },
      { id: 'influenza', name: 'Influenza', typicality: 'common', acuteProbability: 0.2, chronicProbability: 0.0, typicalPhenotype: ['acute', 'dry', 'systemic'], discriminatingFeatures: ['high_fever', 'myalgia', 'seasonal'], requiredEvidence: ['fever', 'myalgia', 'rapid_test'] },
      { id: 'fungal_pneumonia', name: 'Fungal pneumonia', typicality: 'uncommon', acuteProbability: 0.03, chronicProbability: 0.05, typicalPhenotype: ['chronic', 'immunocompromised'], discriminatingFeatures: ['immunosuppressed', 'endemic_area'], requiredEvidence: ['immunosuppression', 'cxr_abnormal', 'culture'] },
      { id: 'pcp', name: 'Pneumocystis pneumonia', typicality: 'uncommon', acuteProbability: 0.05, chronicProbability: 0.1, typicalPhenotype: ['dry', 'hypoxic', 'hiv'], discriminatingFeatures: ['hiv', 'low_cd4', 'dry_cough', 'hypoxia'], requiredEvidence: ['hiv', 'cd4_<200', 'cxr_interstitial'] },
    ],
  },
  {
    mechanismGroup: 'obstructive',
    label: 'Obstructive Causes',
    causes: [
      { id: 'asthma', name: 'Asthma', typicality: 'common', acuteProbability: 0.2, chronicProbability: 0.3, typicalPhenotype: ['wheezy', 'nocturnal', 'dry'], discriminatingFeatures: ['wheeze', 'nocturnal_symptoms', 'reversibility'], requiredEvidence: ['wheeze', 'spirometry_reversibility'] },
      { id: 'copd_exacerbation', name: 'COPD exacerbation', typicality: 'common', acuteProbability: 0.3, chronicProbability: 0.2, typicalPhenotype: ['productive', 'wheezy', 'smoker'], discriminatingFeatures: ['smoker', 'chronic_cough', 'sputum_change'], requiredEvidence: ['smoking', 'chronic_symptoms', 'spirometry'] },
      { id: 'bronchiectasis', name: 'Bronchiectasis', typicality: 'uncommon', acuteProbability: 0.1, chronicProbability: 0.3, typicalPhenotype: ['chronic', 'productive', 'recurrent'], discriminatingFeatures: ['chronic_sputum', 'recurrent_infections', 'clubbing'], requiredEvidence: ['chronic_cough', 'sputum_volume', 'ct_bronchiectasis'] },
      { id: 'foreign_body', name: 'Foreign body aspiration', typicality: 'uncommon', acuteProbability: 0.15, chronicProbability: 0.05, typicalPhenotype: ['acute_onset', 'choking', 'unilateral'], discriminatingFeatures: ['choking_episode', 'sudden_onset', 'child'], requiredEvidence: ['choking', 'asymmetric_breath_sounds', 'bronchoscopy'] },
    ],
  },
  {
    mechanismGroup: 'cardiac',
    label: 'Cardiac Causes',
    causes: [
      { id: 'pulmonary_edema', name: 'Pulmonary edema / Heart failure', typicality: 'common', acuteProbability: 0.15, chronicProbability: 0.2, typicalPhenotype: ['nocturnal', 'positional', 'productive_pink'], discriminatingFeatures: ['orthopnea', 'pnd', 'pedal_edema', 'basal_crackles'], requiredEvidence: ['orthopnea', 'pnd', 'bnp_elevated', 'echo'] },
      { id: 'mitral_stenosis', name: 'Mitral stenosis', typicality: 'rare', acuteProbability: 0.02, chronicProbability: 0.05, typicalPhenotype: ['chronic', 'hemoptysis', 'positional'], discriminatingFeatures: ['mid_diastolic_murmur', 'rheumatic_history'], requiredEvidence: ['echo', 'murmur'] },
      { id: 'pulmonary_embolism', name: 'Pulmonary embolism', typicality: 'uncommon', acuteProbability: 0.08, chronicProbability: 0.02, typicalPhenotype: ['acute', 'dyspneic', 'pleuritic'], discriminatingFeatures: ['sudden_dyspnea', 'pleuritic_pain', 'dvt', 'risk_factors'], requiredEvidence: ['dyspnea_sudden', 'wells_score', 'ctpa'] },
    ],
  },
  {
    mechanismGroup: 'neoplastic',
    label: 'Neoplastic Causes',
    causes: [
      { id: 'lung_cancer', name: 'Lung cancer', typicality: 'uncommon', acuteProbability: 0.02, chronicProbability: 0.2, typicalPhenotype: ['chronic', 'hemoptysis', 'smoker'], discriminatingFeatures: ['smoker_>40py', 'hemoptysis', 'weight_loss', 'clubbing'], requiredEvidence: ['chronic_cough', 'hemoptysis', 'ct_chest', 'biopsy'] },
      { id: 'lymphoma', name: 'Lymphoma', typicality: 'rare', acuteProbability: 0.01, chronicProbability: 0.05, typicalPhenotype: ['chronic', 'systemic'], discriminatingFeatures: ['lymphadenopathy', 'night_sweats', 'weight_loss'], requiredEvidence: ['lymph_nodes', 'ct_chest', 'biopsy'] },
      { id: 'mediastinal_tumor', name: 'Mediastinal tumour', typicality: 'rare', acuteProbability: 0.01, chronicProbability: 0.05, typicalPhenotype: ['chronic', 'positional'], discriminatingFeatures: ['superior_vena_cava_syndrome', 'stridor'], requiredEvidence: ['ct_chest', 'biopsy'] },
    ],
  },
  {
    mechanismGroup: 'allergic',
    label: 'Allergic / Irritant Causes',
    causes: [
      { id: 'allergic_rhinitis_postnasal_drip', name: 'Postnasal drip / UACS', typicality: 'common', acuteProbability: 0.1, chronicProbability: 0.3, typicalPhenotype: ['dry', 'throat_clearing', 'nocturnal'], discriminatingFeatures: ['nasal_symptoms', 'throat_clearing', 'seasonal'], requiredEvidence: ['nasal_congestion', 'postnasal_drip', 'allergy_test'] },
      { id: 'gerd', name: 'GERD / LPR', typicality: 'common', acuteProbability: 0.05, chronicProbability: 0.25, typicalPhenotype: ['nocturnal', 'positional', 'dry'], discriminatingFeatures: ['heartburn', 'regurgitation', 'worse_lying_down'], requiredEvidence: ['heartburn', 'ph_monitoring', 'ppi_trial'] },
    ],
  },
  {
    mechanismGroup: 'environmental',
    label: 'Environmental / Drug-induced',
    causes: [
      { id: 'ace_inhibitor_cough', name: 'ACE inhibitor cough', typicality: 'common', acuteProbability: 0.1, chronicProbability: 0.2, typicalPhenotype: ['dry', 'chronic', 'non_productive'], discriminatingFeatures: ['on_ace_inhibitor', 'dry_cough', 'resolves_on_stop'], requiredEvidence: ['ace_inhibitor_use', 'discontinuation_trial'] },
      { id: 'smoking_cough', name: 'Chronic smoker\'s cough', typicality: 'common', acuteProbability: 0.05, chronicProbability: 0.4, typicalPhenotype: ['chronic', 'productive_morning'], discriminatingFeatures: ['smoker', 'morning_cough', 'no_other_symptoms'], requiredEvidence: ['smoking_history', 'chronic_symptoms'] },
      { id: 'occupational_cough', name: 'Occupational lung disease', typicality: 'uncommon', acuteProbability: 0.05, chronicProbability: 0.15, typicalPhenotype: ['chronic', 'work_related'], discriminatingFeatures: ['occupational_exposure', 'improves_off_work'], requiredEvidence: ['exposure_history', 'lung_function'] },
    ],
  },
  {
    mechanismGroup: 'psychogenic',
    label: 'Psychogenic / Functional',
    causes: [
      { id: 'habit_cough', name: 'Habit cough / Tic', typicality: 'uncommon', acuteProbability: 0.1, chronicProbability: 0.15, typicalPhenotype: ['dry', 'absent_sleep'], discriminatingFeatures: ['absent_during_sleep', 'child', 'attention_seeking'], requiredEvidence: ['cough_absent_sleep', 'normal_exam', 'normal_investigations'] },
    ],
  },
  {
    mechanismGroup: 'congenital',
    label: 'Congenital Causes',
    causes: [
      { id: 'tracheoesophageal_fistula', name: 'Tracheoesophageal fistula', typicality: 'rare', acuteProbability: 0.01, chronicProbability: 0.01, typicalPhenotype: ['neonatal', 'feeding'], discriminatingFeatures: ['neonate', 'feeding_cough', 'recurrent_pneumonia'], requiredEvidence: ['barium_swallow', 'bronchoscopy'] },
      { id: 'vascular_ring', name: 'Vascular ring', typicality: 'rare', acuteProbability: 0.01, chronicProbability: 0.01, typicalPhenotype: ['neonatal', 'stridor', 'feeding'], discriminatingFeatures: ['stridor', 'feeding_difficulty', 'ct_angiogram'], requiredEvidence: ['ct_angiogram', 'bronchoscopy'] },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 4: MECHANISM GRAPH — physiological mechanisms of cough
// ─────────────────────────────────────────────────────────────────

export interface CoughMechanism {
  id: string;
  label: string;
  description: string;
  pathway: string[];
  typicalPhenotypes: string[];
  activatesDiseases: string[];
  evidenceRequired: string[];
}

export const COUGH_MECHANISMS: CoughMechanism[] = [
  { id: 'airway_irritation', label: 'Airway irritation', description: 'Direct irritation of cough receptors in airway epithelium', pathway: ['irritant', 'receptor_stimulation', 'afferent_vagus', 'cough_center', 'efferent_response'], typicalPhenotypes: ['dry', 'throat_clearing'], activatesDiseases: ['allergic_rhinitis', 'gerd', 'postnasal_drip'], evidenceRequired: ['nasal_symptoms', 'throat_clearing'] },
  { id: 'mucus_hypersecretion', label: 'Mucus hypersecretion', description: 'Increased mucus production from goblet cells and submucosal glands', pathway: ['inflammation', 'goblet_cell_hyperplasia', 'mucus_hypersecretion', 'cough', 'expectoration'], typicalPhenotypes: ['productive', 'morning_cough'], activatesDiseases: ['copd', 'bronchiectasis', 'chronic_bronchitis'], evidenceRequired: ['sputum_production', 'morning_cough'] },
  { id: 'bronchospasm', label: 'Bronchospasm', description: 'Airway smooth muscle contraction causing airflow obstruction', pathway: ['trigger', 'mast_cell_degranulation', 'smooth_muscle_contraction', 'airflow_obstruction', 'wheeze', 'cough'], typicalPhenotypes: ['wheezy', 'nocturnal', 'exercise_induced'], activatesDiseases: ['asthma', 'copd_exacerbation'], evidenceRequired: ['wheeze', 'reversibility'] },
  { id: 'alveolar_inflammation', label: 'Alveolar inflammation', description: 'Inflammation of lung parenchyma with exudate filling alveoli', pathway: ['pathogen', 'alveolar_inflammation', 'exudate', 'consolidation', 'cough', 'fever'], typicalPhenotypes: ['productive', 'febrile', 'systemic'], activatesDiseases: ['pneumonia'], evidenceRequired: ['fever', 'crackles', 'cxr_consolidation'] },
  { id: 'pleural_irritation', label: 'Pleural irritation', description: 'Inflammation or irritation of pleural membranes', pathway: ['pleural_inflammation', 'pain_receptors', 'shallow_breathing', 'cough'], typicalPhenotypes: ['pleuritic', 'dry'], activatesDiseases: ['pleurisy', 'pneumonia', 'pe'], evidenceRequired: ['pleuritic_pain'] },
  { id: 'pulmonary_edema', label: 'Pulmonary edema', description: 'Fluid accumulation in lung interstitium and alveoli from cardiac cause', pathway: ['elevated_left_atrial_pressure', 'pulmonary_venous_hypertension', 'interstitial_edema', 'alveolar_edema', 'cough', 'dyspnea'], typicalPhenotypes: ['nocturnal', 'positional', 'productive_pink'], activatesDiseases: ['heart_failure', 'mitral_stenosis'], evidenceRequired: ['orthopnea', 'pnd', 'basal_crackles'] },
  { id: 'upper_airway_stimulation', label: 'Upper airway stimulation', description: 'Stimulation of cough receptors in pharynx, larynx, or nasal passages', pathway: ['upper_airway_irritant', 'laryngeal_receptors', 'cough_reflex'], typicalPhenotypes: ['throat_clearing', 'dry', 'nocturnal'], activatesDiseases: ['postnasal_drip', 'gerd', 'allergic_rhinitis'], evidenceRequired: ['nasal_congestion', 'postnasal_drip'] },
  { id: 'chemical_stimulation', label: 'Chemical stimulation', description: 'Cough triggered by chemical irritants or medications', pathway: ['chemical', 'sensory_nerve_activation', 'cough_reflex'], typicalPhenotypes: ['dry', 'non_productive'], activatesDiseases: ['ace_inhibitor_cough', 'occupational_lung_disease'], evidenceRequired: ['ace_inhibitor_use', 'exposure_history'] },
  { id: 'vagal_stimulation', label: 'Vagal stimulation', description: 'Cough triggered by vagal nerve activation from non-respiratory sources', pathway: ['vagal_stimulus', 'cough_center', 'reflex_cough'], typicalPhenotypes: ['dry', 'reflex'], activatesDiseases: ['gerd', 'laryngeal_neuropathy', 'habit_cough'], evidenceRequired: ['heartburn', 'cough_absent_sleep'] },
  { id: 'neoplastic_infiltration', label: 'Neoplastic infiltration', description: 'Tumour growth involving airways, parenchyma, or pleura', pathway: ['neoplastic_growth', 'airway_compression', 'tissue_invasion', 'cough', 'hemoptysis'], typicalPhenotypes: ['chronic', 'hemoptysis', 'smoker'], activatesDiseases: ['lung_cancer', 'lymphoma', 'mediastinal_tumor'], evidenceRequired: ['hemoptysis', 'weight_loss', 'smoking_history'] },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 5: PHENOTYPE GRAPH — every cough phenotype
// ─────────────────────────────────────────────────────────────────

export interface CoughPhenotype {
  id: string;
  label: string;
  description: string;
  keyFeatures: string[];
  likelyMechanisms: string[];
  likelyCauses: string[];
  probabilityByDuration: Record<CoughDurationClass, string[]>;
  questionsToResolve: string[];
  examToPerform: string[];
  urgency: CoughUrgency;
}

export const COUGH_PHENOTYPES: CoughPhenotype[] = [
  { id: 'cough_acute_dry', label: 'Acute dry cough', description: 'Sudden onset, non-productive cough lasting < 3 weeks', keyFeatures: ['acute_onset', 'no_sputum', 'duration_<3weeks'], likelyMechanisms: ['airway_irritation', 'upper_airway_stimulation'], likelyCauses: ['viral_upper_respiratory_infection', 'covid19', 'influenza', 'allergic_rhinitis'], probabilityByDuration: { acute: ['viral_uri', 'covid19', 'influenza'], subacute: [], chronic: [], recurrent: [] }, questionsToResolve: ['fever', 'sore_throat', 'nasal_congestion', 'loss_smell', 'contacts'], examToPerform: ['throat_exam', 'chest_auscultation', 'temperature'], urgency: 'green' },
  { id: 'cough_acute_productive', label: 'Acute productive cough', description: 'Sudden onset cough with sputum production < 3 weeks', keyFeatures: ['sputum', 'acute_onset', 'duration_<3weeks'], likelyMechanisms: ['alveolar_inflammation', 'mucus_hypersecretion'], likelyCauses: ['acute_bronchitis', 'pneumonia', 'copd_exacerbation'], probabilityByDuration: { acute: ['acute_bronchitis', 'pneumonia'], subacute: [], chronic: [], recurrent: [] }, questionsToResolve: ['sputum_color', 'sputum_volume', 'fever', 'dyspnea', 'chest_pain'], examToPerform: ['chest_auscultation', 'temperature', 'oxygen_saturation', 'respiratory_rate'], urgency: 'yellow' },
  { id: 'cough_chronic', label: 'Chronic cough', description: 'Persistent cough lasting > 8 weeks', keyFeatures: ['duration_>8weeks', 'persistent'], likelyMechanisms: ['mucus_hypersecretion', 'airway_irritation', 'chemical_stimulation', 'neoplastic_infiltration'], likelyCauses: ['gerd', 'postnasal_drip', 'asthma_variant', 'copd', 'bronchiectasis', 'ace_inhibitor', 'tb', 'lung_cancer'], probabilityByDuration: { acute: [], subacute: ['post_infectious'], chronic: ['gerd', 'uacs', 'asthma_variant', 'copd', 'bronchiectasis', 'ace_inhibitor', 'tb', 'lung_cancer'], recurrent: [] }, questionsToResolve: ['sputum', 'hemoptysis', 'night_sweats', 'weight_loss', 'heartburn', 'smoking', 'medications'], examToPerform: ['chest_auscultation', 'clubbing', 'lymph_nodes', 'ent_exam'], urgency: 'yellow' },
  { id: 'cough_wheezy', label: 'Wheezy cough', description: 'Cough associated with audible wheeze or prolonged expiration', keyFeatures: ['wheeze', 'prolonged_expiration', 'nocturnal'], likelyMechanisms: ['bronchospasm', 'mucus_hypersecretion'], likelyCauses: ['asthma', 'copd_exacerbation', 'bronchiolitis', 'foreign_body'], probabilityByDuration: { acute: ['bronchiolitis', 'foreign_body'], subacute: ['asthma_exacerbation'], chronic: ['asthma', 'copd'], recurrent: ['asthma'] }, questionsToResolve: ['nocturnal_symptoms', 'exercise_triggers', 'seasonal_pattern', 'reversibility'], examToPerform: ['chest_auscultation', 'peak_flow', 'oxygen_saturation', 'accessory_muscle_use'], urgency: 'yellow' },
  { id: 'cough_nocturnal', label: 'Nocturnal cough', description: 'Cough predominantly occurring at night or when lying flat', keyFeatures: ['night_time', 'lying_flat', 'disturbs_sleep'], likelyMechanisms: ['bronchospasm', 'pulmonary_edema', 'upper_airway_stimulation', 'vagal_stimulation'], likelyCauses: ['asthma', 'gerd', 'postnasal_drip', 'heart_failure'], probabilityByDuration: { acute: [], subacute: ['gerd'], chronic: ['asthma', 'gerd', 'heart_failure', 'uacs'], recurrent: ['asthma'] }, questionsToResolve: ['orthopnea', 'pnd', 'heartburn', 'pedal_edema', 'snoring'], examToPerform: ['chest_auscultation', 'jvp', 'pedal_edema', 'bmi'], urgency: 'orange' },
  { id: 'cough_hemoptysis', label: 'Cough with hemoptysis', description: 'Cough productive of blood or blood-streaked sputum', keyFeatures: ['blood_in_sputum', 'hemoptysis'], likelyMechanisms: ['neoplastic_infiltration', 'alveolar_inflammation', 'bronchiectasis'], likelyCauses: ['tb', 'lung_cancer', 'bronchiectasis', 'pneumonia', 'pulmonary_embolism', 'mitral_stenosis'], probabilityByDuration: { acute: ['pneumonia', 'pe'], subacute: ['tb'], chronic: ['tb', 'lung_cancer', 'bronchiectasis', 'mitral_stenosis'], recurrent: ['bronchiectasis'] }, questionsToResolve: ['hemoptysis_volume', 'hemoptysis_duration', 'smoking', 'weight_loss', 'chest_pain'], examToPerform: ['chest_auscultation', 'clubbing', 'lymph_nodes', 'oral_cavity'], urgency: 'orange' },
  { id: 'cough_paroxysmal', label: 'Paroxysmal / Whooping cough', description: 'Episodic bursts of coughing with characteristic whoop', keyFeatures: ['paroxysms', 'whoop', 'posttussive_vomiting', 'apnoea'], likelyMechanisms: ['airway_irritation', 'vagal_stimulation'], likelyCauses: ['pertussis', 'post_infectious'], probabilityByDuration: { acute: ['pertussis'], subacute: ['pertussis', 'post_viral'], chronic: [], recurrent: [] }, questionsToResolve: ['vaccination_status', 'contacts', 'apnoeic_spells'], examToPerform: ['oxygen_saturation', 'respiratory_rate', 'ent_exam'], urgency: 'orange' },
  { id: 'cough_positional', label: 'Positional cough', description: 'Cough that changes with position (worse lying, better sitting)', keyFeatures: ['worse_lying', 'better_sitting', 'relieved_upright'], likelyMechanisms: ['pulmonary_edema', 'upper_airway_stimulation'], likelyCauses: ['heart_failure', 'gerd', 'postnasal_drip'], probabilityByDuration: { acute: ['heart_failure'], subacute: ['gerd'], chronic: ['heart_failure', 'gerd', 'uacs'], recurrent: [] }, questionsToResolve: ['orthopnea', 'pnd', 'pedal_edema', 'heartburn', 'snoring'], examToPerform: ['chest_auscultation', 'jvp', 'pedal_edema', 'oxygen_saturation'], urgency: 'orange' },
  { id: 'cough_exercise_induced', label: 'Exercise-induced cough', description: 'Cough triggered specifically by exercise or physical exertion', keyFeatures: ['with_exercise', 'resolves_rest', 'young_adult'], likelyMechanisms: ['bronchospasm'], likelyCauses: ['asthma', 'exercise_induced_brochoconstriction'], probabilityByDuration: { acute: ['exercise_induced_asthma'], subacute: [], chronic: ['asthma'], recurrent: ['asthma'] }, questionsToResolve: ['exercise_type', 'recovery_time', 'other_triggers'], examToPerform: ['exercise_challenge', 'spirometry', 'peak_flow'], urgency: 'green' },
  { id: 'cough_barking', label: 'Barking / Croupy cough', description: 'Distinctive barking or brassy cough, typically in children', keyFeatures: ['barking', 'child', 'stridor', 'hoarse'], likelyMechanisms: ['airway_irritation', 'upper_airway_stimulation'], likelyCauses: ['croup', 'laryngomalacia', 'foreign_body', 'epiglottitis'], probabilityByDuration: { acute: ['croup', 'epiglottitis'], subacute: [], chronic: ['laryngomalacia', 'vascular_ring'], recurrent: ['croup'] }, questionsToResolve: ['stridor', 'fever', 'drooling', 'immunization_status'], examToPerform: ['ent_exam', 'oxygen_saturation', 'stridor_assessment', 'respiratory_rate'], urgency: 'red' },
  { id: 'cough_neonatal_feeding', label: 'Neonatal feeding cough', description: 'Cough associated with feeding in neonates and young infants', keyFeatures: ['neonate', 'during_feeding', 'choking', 'cyanosis'], likelyMechanisms: ['aspiration'], likelyCauses: ['tracheoesophageal_fistula', 'laryngeal_cleft', 'gerd', 'swallowing_dysfunction'], probabilityByDuration: { acute: [], subacute: [], chronic: ['tof', 'laryngeal_cleft', 'gerd'], recurrent: ['aspiration'] }, questionsToResolve: ['feeding_difficulty', 'cyanotic_spells', 'recurrent_pneumonia'], examToPerform: ['feeding_observation', 'oxygen_monitoring', 'barium_swallow'], urgency: 'red' },
  { id: 'cough_immunocompromised', label: 'Cough in immunocompromised', description: 'Cough in patient with known immunosuppression', keyFeatures: ['immunosuppressed', 'hiv', 'transplant', 'chemotherapy'], likelyMechanisms: ['alveolar_inflammation', 'neoplastic_infiltration'], likelyCauses: ['pcp', 'fungal_pneumonia', 'tb', 'cmv_pneumonitis', 'bacterial_pneumonia', 'lymphoma'], probabilityByDuration: { acute: ['bacterial_pneumonia'], subacute: ['pcp', 'cmv'], chronic: ['tb', 'fungal', 'lymphoma'], recurrent: [] }, questionsToResolve: ['cd4_count', 'transplant_status', 'chemotherapy', 'prophylaxis'], examToPerform: ['full_examination', 'oxygen_saturation', 'cxr', 'ct_chest'], urgency: 'red' },
  { id: 'cough_post_infectious', label: 'Post-infectious cough', description: 'Persistent cough following an acute respiratory infection', keyFeatures: ['post_viral', 'duration_3to8weeks', 'self_limiting', 'dry'], likelyMechanisms: ['airway_irritation', 'mucus_hypersecretion'], likelyCauses: ['post_viral_cough', 'pertussis', 'covid19'], probabilityByDuration: { acute: [], subacute: ['post_viral', 'pertussis'], chronic: [], recurrent: [] }, questionsToResolve: ['prior_respiratory_infection', 'cough_duration', 'fever_resolved'], examToPerform: ['chest_auscultation', 'ent_exam'], urgency: 'green' },
  { id: 'cough_gerd_related', label: 'GERD-related cough', description: 'Cough caused by gastroesophageal reflux triggering vagal reflex', keyFeatures: ['after_meals', 'worse_lying', 'heartburn', 'nocturnal'], likelyMechanisms: ['vagal_stimulation', 'upper_airway_stimulation'], likelyCauses: ['gerd', 'lpr'], probabilityByDuration: { acute: [], subacute: ['gerd'], chronic: ['gerd', 'lpr'], recurrent: ['gerd'] }, questionsToResolve: ['heartburn', 'regurgitation', 'meal_timing', 'voice_change'], examToPerform: ['ent_exam', 'chest_auscultation', 'bmi'], urgency: 'green' },
  { id: 'cough_uacs_postnasal', label: 'UACS / Postnasal drip cough', description: 'Cough from postnasal drip irritating upper airway receptors', keyFeatures: ['throat_clearing', 'nasal_congestion', 'worse_morning', 'sensation_drip'], likelyMechanisms: ['upper_airway_stimulation'], likelyCauses: ['uacs', 'allergic_rhinitis', 'sinusitis'], probabilityByDuration: { acute: ['allergic'], subacute: ['uacs'], chronic: ['uacs', 'sinusitis'], recurrent: ['allergic'] }, questionsToResolve: ['nasal_symptoms', 'allergy_history', 'sinus_pain', 'seasonal_pattern'], examToPerform: ['ent_exam', 'nasal_endoscopy'], urgency: 'green' },
  { id: 'cough_ace_inhibitor', label: 'ACE inhibitor cough', description: 'Dry cough induced by ACE inhibitor therapy', keyFeatures: ['on_ace_inhibitor', 'dry', 'non_productive', 'recent_drug_start'], likelyMechanisms: ['chemical_stimulation'], likelyCauses: ['ace_inhibitor_cough'], probabilityByDuration: { acute: ['ace_inhibitor'], subacute: ['ace_inhibitor'], chronic: ['ace_inhibitor'], recurrent: [] }, questionsToResolve: ['medication_list', 'drug_start_date', 'cough_onset_timing'], examToPerform: ['chest_auscultation'], urgency: 'green' },
  { id: 'cough_cardiac', label: 'Cardiac cough', description: 'Cough due to heart failure or pulmonary congestion', keyFeatures: ['orthopnea', 'pnd', 'pedal_edema', 'basal_crackles', 'nocturnal'], likelyMechanisms: ['pulmonary_edema'], likelyCauses: ['heart_failure', 'mitral_stenosis', 'cardiomyopathy'], probabilityByDuration: { acute: ['heart_failure'], subacute: [], chronic: ['heart_failure', 'mitral_stenosis'], recurrent: ['heart_failure'] }, questionsToResolve: ['orthopnea', 'pnd', 'pedal_edema', 'exercise_tolerance', 'cardiac_history'], examToPerform: ['chest_auscultation', 'jvp', 'pedal_edema', 'cardiac_auscultation'], urgency: 'orange' },
  { id: 'cough_aspiration', label: 'Aspiration cough', description: 'Cough triggered by food/liquid entering the airway', keyFeatures: ['during_feeding', 'choking', 'dysphagia', 'recurrent_pneumonia'], likelyMechanisms: ['aspiration'], likelyCauses: ['aspiration_pneumonia', 'gerd', 'swallowing_dysfunction', 'cva_dysphagia'], probabilityByDuration: { acute: ['aspiration'], subacute: ['aspiration_pneumonia'], chronic: ['swallowing_dysfunction', 'gerd'], recurrent: ['aspiration'] }, questionsToResolve: ['swallowing_difficulty', 'feeding_association', 'neurological_history', 'recurrent_pneumonia'], examToPerform: ['swallow_screening', 'chest_auscultation', 'neurological_exam'], urgency: 'orange' },
  { id: 'cough_eosinophilic_bronchitis', label: 'Eosinophilic bronchitis', description: 'Non-asthmatic eosinophilic airway inflammation causing chronic cough', keyFeatures: ['chronic_dry_cough', 'eosinophilia', 'no_wheeze', 'normal_spirometry'], likelyMechanisms: ['airway_irritation', 'bronchospasm'], likelyCauses: ['eosinophilic_bronchitis'], probabilityByDuration: { acute: [], subacute: [], chronic: ['eosinophilic_bronchitis'], recurrent: [] }, questionsToResolve: ['allergy_history', 'nasal_symptoms', 'asthma_features'], examToPerform: ['spirometry', 'cbc_eosinophils', 'chest_auscultation'], urgency: 'green' },
  { id: 'cough_croup', label: 'Croup / Laryngotracheobronchitis', description: 'Classic croup cough in children with stridor', keyFeatures: ['barking_cough', 'stridor_inspiratory', 'child', 'fever', 'hoarse'], likelyMechanisms: ['airway_irritation', 'upper_airway_stimulation'], likelyCauses: ['croup', 'laryngomalacia'], probabilityByDuration: { acute: ['croup'], subacute: [], chronic: ['laryngomalacia'], recurrent: ['croup'] }, questionsToResolve: ['stridor', 'fever', 'immunization_status', 'drooling', 'toxicity'], examToPerform: ['ent_exam', 'oxygen_saturation', 'stridor_assessment', 'westley_score'], urgency: 'orange' },
  { id: 'cough_pertussis_syndrome', label: 'Pertussis syndrome', description: 'Paroxysmal cough with inspiratory whoop and posttussive vomiting', keyFeatures: ['paroxysms', 'whoop', 'posttussive_vomiting', 'cyanosis', 'apnoea'], likelyMechanisms: ['airway_irritation', 'vagal_stimulation'], likelyCauses: ['pertussis', 'parapertussis', 'adenovirus'], probabilityByDuration: { acute: ['pertussis'], subacute: ['pertussis'], chronic: [], recurrent: [] }, questionsToResolve: ['vaccination_status', 'contacts', 'apnoeic_spells', 'cough_season'], examToPerform: ['oxygen_saturation', 'respiratory_rate', 'ent_exam', 'pertussis_pcr'], urgency: 'orange' },
  { id: 'cough_pleuritic', label: 'Pleuritic cough', description: 'Cough associated with sharp chest pain on breathing', keyFeatures: ['pleuritic_pain', 'shallow_breathing', 'fever', 'dyspnea'], likelyMechanisms: ['pleural_irritation', 'alveolar_inflammation'], likelyCauses: ['pneumonia', 'pe', 'pleurisy', 'tb'], probabilityByDuration: { acute: ['pneumonia', 'pe'], subacute: ['tb', 'pleurisy'], chronic: ['tb'], recurrent: [] }, questionsToResolve: ['chest_pain_quality', 'dyspnea', 'fever', 'dvt_risk'], examToPerform: ['chest_auscultation', 'pleural_rub', 'oxygen_saturation', 'dvt_assessment'], urgency: 'orange' },
  { id: 'cough_neurogenic', label: 'Neurogenic / Vagal cough', description: 'Cough due to vagal neuropathy or laryngeal sensory neuropathy', keyFeatures: ['chronic_dry', 'throat_sensation', 'voice_change', 'absent_sleep'], likelyMechanisms: ['vagal_stimulation'], likelyCauses: ['post_viral_vagal_neuropathy', 'laryngeal_sensory_neuropathy'], probabilityByDuration: { acute: [], subacute: ['post_viral'], chronic: ['vagal_neuropathy'], recurrent: [] }, questionsToResolve: ['voice_change', 'globus_sensation', 'sleep_pattern', 'prior_uri'], examToPerform: ['ent_exam', 'laryngoscopy', 'neurological_exam'], urgency: 'green' },
  { id: 'cough_failure_to_thrive', label: 'Cough with failure to thrive', description: 'Chronic cough in infant/child with poor weight gain or growth faltering', keyFeatures: ['poor_weight_gain', 'chronic', 'infant', 'feeding_difficulty', 'recurrent_infections'], likelyMechanisms: ['aspiration', 'airway_irritation', 'alveolar_inflammation'], likelyCauses: ['cystic_fibrosis', 'tof', 'bronchiectasis', 'immune_deficiency', 'congenital_heart_disease'], probabilityByDuration: { acute: [], subacute: [], chronic: ['cf', 'tof', 'bronchiectasis', 'immune_deficiency'], recurrent: ['cf', 'aspiration'] }, questionsToResolve: ['growth_parameters', 'feeding_history', 'recurrent_pneumonia', 'family_history', 'sweat_test'], examToPerform: ['anthropometry', 'chest_auscultation', 'clubbing', 'full_examination'], urgency: 'red' },
  { id: 'cough_iris', label: 'Cough in IRIS', description: 'Paradoxical worsening of TB or other infection after starting ART', keyFeatures: ['hiv', 'recent_art_start', 'worsening_respiratory', 'fever', 'lymph_nodes'], likelyMechanisms: ['alveolar_inflammation'], likelyCauses: ['tb_iris', 'ntm_iris', 'cryptococcal_iris'], probabilityByDuration: { acute: ['tb_iris'], subacute: ['ntm_iris'], chronic: [], recurrent: [] }, questionsToResolve: ['art_start_date', 'cd4_trend', 'tb_treatment', 'new_lesions'], examToPerform: ['chest_auscultation', 'lymph_nodes', 'oxygen_saturation', 'cxr'], urgency: 'red' },
  { id: 'cough_miliary', label: 'Miliary cough', description: 'Cough with miliary pattern on imaging, suggests disseminated disease', keyFeatures: ['miliary_pattern', 'systemic_symptoms', 'dyspnea', 'fever'], likelyMechanisms: ['alveolar_inflammation'], likelyCauses: ['miliary_tb', 'fungal_infection', 'metastatic_cancer', 'sarcoidosis'], probabilityByDuration: { acute: ['miliary_tb'], subacute: ['fungal'], chronic: ['sarcoidosis', 'metastatic'], recurrent: [] }, questionsToResolve: ['hiv_status', 'immunosuppression', 'systemic_symptoms', 'exposure'], examToPerform: ['chest_auscultation', 'oxygen_saturation', 'fundoscopy', 'lymph_nodes'], urgency: 'red' },
  { id: 'cough_icu_ards', label: 'ICU / ARDS cough', description: 'Cough in context of ARDS, VAP, or ventilator-associated pneumonia', keyFeatures: ['icu', 'ventilated', 'secretions', 'vap_risk', 'hypoxia'], likelyMechanisms: ['alveolar_inflammation', 'atelectasis'], likelyCauses: ['vap', 'ards', 'atelectasis', 'fluid_overload'], probabilityByDuration: { acute: ['vap', 'ards'], subacute: ['vap'], chronic: [], recurrent: [] }, questionsToResolve: ['ventilation_parameters', 'secretions_culture', 'sedation_level', 'hemodynamics'], examToPerform: ['ventilator_assessment', 'cxr_mobile', 'bronchoscopy', 'eta'], urgency: 'red' },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 6: QUESTION ENGINE — cough-specific questions
// ─────────────────────────────────────────────────────────────────

export interface CoughQuestion {
  id: string;
  text: string;
  clinicalPurpose: string;
  inputType: InputType;
  options?: { value: string; label: string; documentationPhrase: string; evidenceImpact: Record<string, number> }[];
  contextTextOverrides?: CoughQuestionContextText[];
  reducesUncertaintyFor: string[];
  mechanismSupported: string[];
  phenotypeSupported: string[];
  priority: QuestionPriority;
  contextVisibility: CoughContextVisibility;
  dependencies: string[];
  terminationRule: 'once_answered' | 'once_confident' | 'always_ask';
  expectedInformationGain: number;
}

export interface CoughQuestionContextText {
  contextPattern: string;
  text: string;
  options?: { value: string; label: string; documentationPhrase: string }[];
}

export interface CoughContextVisibility {
  showForContexts: string[];
  hideForContexts: string[];
  forceForContexts: string[];
}

export const COUGH_QUESTIONS: CoughQuestion[] = [
  { id: 'cough_duration', text: 'How long have you had the cough?', clinicalPurpose: 'Classify as acute/subacute/chronic', inputType: 'single_choice', options: [
    { value: '<3_days', label: 'Less than 3 days', documentationPhrase: 'of recent onset', evidenceImpact: { acute_bronchitis: 0.2, uri: 0.3 } },
    { value: '3_days_to_3_weeks', label: '3 days to 3 weeks', documentationPhrase: 'of one week\'s duration', evidenceImpact: { pneumonia: 0.3, bronchitis: 0.3 } },
    { value: '3_to_8_weeks', label: '3 to 8 weeks', documentationPhrase: 'of several weeks\' duration', evidenceImpact: { pertussis: 0.4, post_infectious: 0.3 } },
    { value: '>8_weeks', label: 'More than 8 weeks', documentationPhrase: 'of more than two months\' duration', evidenceImpact: { tb: 0.5, lung_cancer: 0.4, gerd: 0.3, bronchiectasis: 0.3 } },
  ], reducesUncertaintyFor: ['all'], mechanismSupported: ['airway_irritation', 'mucus_hypersecretion', 'neoplastic_infiltration'], phenotypeSupported: ['cough_acute_dry', 'cough_acute_productive', 'cough_chronic'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.7 },

  { id: 'cough_sputum', text: 'Are you bringing up any phlegm or sputum?', clinicalPurpose: 'Differentiate dry vs productive', inputType: 'single_choice', options: [
    { value: 'none', label: 'No sputum / Dry cough', documentationPhrase: 'dry', evidenceImpact: { asthma: 0.3, gerd: 0.2, ace_inhibitor: 0.4, covid19: 0.3 } },
    { value: 'mucoid', label: 'Clear or white (mucoid)', documentationPhrase: 'producing clear sputum', evidenceImpact: { bronchitis: 0.2, asthma: 0.2 } },
    { value: 'purulent', label: 'Yellow or green (purulent)', documentationPhrase: 'producing purulent sputum', evidenceImpact: { pneumonia: 0.5, bronchiectasis: 0.4, copd_exacerbation: 0.4 } },
    { value: 'blood_streaked', label: 'Blood-streaked', documentationPhrase: 'producing blood-streaked sputum', evidenceImpact: { tb: 0.6, lung_cancer: 0.5, bronchiectasis: 0.4 } },
    { value: 'frank_blood', label: 'Frank blood (hemoptysis)', documentationPhrase: 'with hemoptysis', evidenceImpact: { tb: 0.7, lung_cancer: 0.6, bronchiectasis: 0.5, pe: 0.3 } },
  ], contextTextOverrides: [
    { contextPattern: 'child', text: 'Does the child have a wet or noisy chest?', options: [
      { value: 'none', label: 'Dry hacking cough', documentationPhrase: 'dry' },
      { value: 'mucoid', label: 'Wet / productive cough', documentationPhrase: 'producing clear sputum' },
      { value: 'purulent', label: 'Thick yellow/green mucus', documentationPhrase: 'producing purulent sputum' },
      { value: 'blood_streaked', label: 'Blood in the mucus', documentationPhrase: 'producing blood-streaked sputum' },
      { value: 'frank_blood', label: 'Coughing up blood', documentationPhrase: 'with hemoptysis' },
    ] },
    { contextPattern: 'infant', text: 'Does the baby sound chesty or congested?', options: [
      { value: 'none', label: 'No, dry cough', documentationPhrase: 'dry' },
      { value: 'mucoid', label: 'Yes, sounds chesty', documentationPhrase: 'producing clear sputum' },
      { value: 'purulent', label: 'Yes, thick secretions', documentationPhrase: 'producing purulent sputum' },
      { value: 'blood_streaked', label: 'Blood-tinged secretions', documentationPhrase: 'producing blood-streaked sputum' },
      { value: 'frank_blood', label: 'Frank blood', documentationPhrase: 'with hemoptysis' },
    ] },
  ], reducesUncertaintyFor: ['cough_acute_dry', 'cough_acute_productive', 'cough_chronic', 'cough_hemoptysis'], mechanismSupported: ['mucus_hypersecretion', 'alveolar_inflammation'], phenotypeSupported: ['cough_acute_dry', 'cough_acute_productive', 'cough_chronic'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.65 },

  { id: 'cough_sputum_color', text: 'What colour is the sputum?', clinicalPurpose: 'Assess for purulence suggesting bacterial infection', inputType: 'single_choice', options: [
    { value: 'clear', label: 'Clear / White', documentationPhrase: 'clear sputum', evidenceImpact: { viral_bronchitis: 0.3, asthma: 0.2 } },
    { value: 'yellow', label: 'Yellow', documentationPhrase: 'yellow sputum', evidenceImpact: { bacterial_bronchitis: 0.3, pneumonia: 0.3 } },
    { value: 'green', label: 'Green', documentationPhrase: 'green sputum', evidenceImpact: { bacterial_infection: 0.4, bronchiectasis: 0.4 } },
    { value: 'rust', label: 'Rust-coloured', documentationPhrase: 'rust-coloured sputum', evidenceImpact: { pneumococcal_pneumonia: 0.6 } },
    { value: 'pink_frothy', label: 'Pink and frothy', documentationPhrase: 'pink frothy sputum', evidenceImpact: { pulmonary_edema: 0.8 } },
  ], reducesUncertaintyFor: ['cough_acute_productive', 'cough_chronic'], mechanismSupported: ['alveolar_inflammation', 'pulmonary_edema', 'mucus_hypersecretion'], phenotypeSupported: ['cough_acute_productive', 'cough_nocturnal'], priority: 'standard', contextVisibility: { showForContexts: [], hideForContexts: ['neonate', 'infant'], forceForContexts: [] }, dependencies: ['cough_sputum'], terminationRule: 'once_answered', expectedInformationGain: 0.4 },

  { id: 'cough_timing', text: 'When does the cough occur?', clinicalPurpose: 'Characterize pattern and identify triggers', inputType: 'single_choice', options: [
    { value: 'morning', label: 'Early morning', documentationPhrase: 'predominantly in the early morning', evidenceImpact: { copd: 0.5, bronchitis: 0.3, smoking: 0.4 } },
    { value: 'nocturnal', label: 'At night / wakes me up', documentationPhrase: 'which is worse at night', evidenceImpact: { asthma: 0.5, gerd: 0.4, heart_failure: 0.4, postnasal_drip: 0.3 } },
    { value: 'after_meals', label: 'After meals', documentationPhrase: 'which occurs after meals', evidenceImpact: { gerd: 0.6, aspiration: 0.4 } },
    { value: 'with_exercise', label: 'With exercise', documentationPhrase: 'triggered by exercise', evidenceImpact: { asthma: 0.6 } },
    { value: 'when_lying', label: 'When lying flat', documentationPhrase: 'worse when lying flat', evidenceImpact: { heart_failure: 0.7, gerd: 0.4 } },
    { value: 'anytime', label: 'Throughout the day', documentationPhrase: 'present throughout the day', evidenceImpact: {} },
  ], contextTextOverrides: [
    { contextPattern: 'infant', text: 'When does the baby cough most?', options: [
      { value: 'nocturnal', label: 'At night / during sleep', documentationPhrase: 'which is worse at night' },
      { value: 'after_meals', label: 'During or after feeding', documentationPhrase: 'which occurs after meals' },
      { value: 'morning', label: 'In the morning', documentationPhrase: 'predominantly in the early morning' },
      { value: 'anytime', label: 'Throughout the day', documentationPhrase: 'present throughout the day' },
      { value: 'when_lying', label: 'When lying down to sleep', documentationPhrase: 'worse when lying flat' },
    ] },
    { contextPattern: 'child', text: 'When does the coughing happen most?', options: [
      { value: 'nocturnal', label: 'At night / wakes from sleep', documentationPhrase: 'which is worse at night' },
      { value: 'with_exercise', label: 'During play or running', documentationPhrase: 'triggered by exercise' },
      { value: 'after_meals', label: 'After eating', documentationPhrase: 'which occurs after meals' },
      { value: 'morning', label: 'In the morning', documentationPhrase: 'predominantly in the early morning' },
      { value: 'anytime', label: 'Throughout the day', documentationPhrase: 'present throughout the day' },
    ] },
  ], reducesUncertaintyFor: ['cough_nocturnal', 'cough_wheezy', 'cough_positional', 'cough_exercise_induced'], mechanismSupported: ['bronchospasm', 'pulmonary_edema', 'upper_airway_stimulation', 'vagal_stimulation'], phenotypeSupported: ['cough_nocturnal', 'cough_wheezy', 'cough_positional', 'cough_exercise_induced'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.55 },

  { id: 'cough_severity', text: 'How severe is the cough?', clinicalPurpose: 'Assess impact and urgency', inputType: 'single_choice', options: [
    { value: 'mild', label: 'Mild — does not interfere with daily activities', documentationPhrase: 'mild', evidenceImpact: {} },
    { value: 'moderate', label: 'Moderate — interferes with sleep or work', documentationPhrase: 'moderate', evidenceImpact: {} },
    { value: 'severe', label: 'Severe — causes vomiting, chest pain, or breathlessness', documentationPhrase: 'severe', evidenceImpact: { pertussis: 0.3, pneumonia: 0.2 } },
  ], contextTextOverrides: [
    { contextPattern: 'infant', text: 'How bad is the coughing?', options: [
      { value: 'mild', label: 'Mild — occasional cough, feeds well', documentationPhrase: 'mild' },
      { value: 'moderate', label: 'Moderate — cough disturbs sleep or feeding', documentationPhrase: 'moderate' },
      { value: 'severe', label: 'Severe — causes choking, turning blue, or vomiting', documentationPhrase: 'severe' },
    ] },
    { contextPattern: 'child', text: 'How much does the cough bother them?', options: [
      { value: 'mild', label: 'Mild — coughs sometimes, plays normally', documentationPhrase: 'mild' },
      { value: 'moderate', label: 'Moderate — cough interrupts play or sleep', documentationPhrase: 'moderate' },
      { value: 'severe', label: 'Severe — causes vomiting, turning blue, or can\'t catch breath', documentationPhrase: 'severe' },
    ] },
  ], reducesUncertaintyFor: ['cough_paroxysmal'], mechanismSupported: [], phenotypeSupported: [], priority: 'standard', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.2 },

  { id: 'cough_fever', text: 'Do you have a fever?', clinicalPurpose: 'Differentiate infectious from non-infectious causes', inputType: 'single_choice', options: [
    { value: 'yes', label: 'Yes', documentationPhrase: 'associated with fever', evidenceImpact: { pneumonia: 0.5, tb: 0.4, bronchitis: 0.3, covid19: 0.4, influenza: 0.5 } },
    { value: 'no', label: 'No', documentationPhrase: 'without fever', evidenceImpact: { asthma: 0.2, gerd: 0.2, ace_inhibitor: 0.3 } },
  ], reducesUncertaintyFor: ['cough_acute_productive', 'cough_acute_dry', 'cough_chronic'], mechanismSupported: ['alveolar_inflammation'], phenotypeSupported: ['cough_acute_productive', 'cough_acute_dry'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.5 },

  { id: 'cough_dyspnea', text: 'Are you short of breath?', clinicalPurpose: 'Assess severity and narrow differential', inputType: 'single_choice', options: [
    { value: 'none', label: 'No', documentationPhrase: 'without dyspnea', evidenceImpact: { acute_bronchitis: 0.2, uri: 0.3 } },
    { value: 'exertional', label: 'Only on exertion', documentationPhrase: 'with exertional dyspnea', evidenceImpact: { copd: 0.3, asthma: 0.3, heart_failure: 0.4 } },
    { value: 'rest', label: 'At rest', documentationPhrase: 'with dyspnea at rest', evidenceImpact: { pneumonia: 0.4, pe: 0.5, heart_failure: 0.5, severe_asthma: 0.5 } },
  ], contextTextOverrides: [
    { contextPattern: 'infant', text: 'Does the baby have difficulty breathing?', options: [
      { value: 'none', label: 'No, breathing seems normal', documentationPhrase: 'without dyspnea' },
      { value: 'exertional', label: 'Yes, during feeding or crying', documentationPhrase: 'with exertional dyspnea' },
      { value: 'rest', label: 'Yes, even at rest / seems to be working hard', documentationPhrase: 'with dyspnea at rest' },
    ] },
    { contextPattern: 'child', text: 'Is the child having trouble breathing?', options: [
      { value: 'none', label: 'No, breathing fine', documentationPhrase: 'without dyspnea' },
      { value: 'exertional', label: 'Yes, when playing or running', documentationPhrase: 'with exertional dyspnea' },
      { value: 'rest', label: 'Yes, even while sitting still', documentationPhrase: 'with dyspnea at rest' },
    ] },
  ], reducesUncertaintyFor: ['cough_wheezy', 'cough_hemoptysis', 'cough_positional'], mechanismSupported: ['bronchospasm', 'pulmonary_edema', 'alveolar_inflammation'], phenotypeSupported: ['cough_wheezy', 'cough_hemoptysis', 'cough_positional'], priority: 'critical', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: ['neonate', 'infant', 'older_adult', 'copd', 'heart_failure'] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.6 },

  { id: 'cough_smoking', text: 'Do you smoke?', clinicalPurpose: 'Assess risk for smoking-related disease', inputType: 'single_choice', options: [
    { value: 'never', label: 'Never smoked', documentationPhrase: 'a non-smoker', evidenceImpact: { copd: 0.2, lung_cancer: 0.1 } },
    { value: 'current', label: 'Current smoker', documentationPhrase: 'a current smoker', evidenceImpact: { copd: 0.6, lung_cancer: 0.5, chronic_bronchitis: 0.5 } },
    { value: 'ex', label: 'Ex-smoker', documentationPhrase: 'an ex-smoker', evidenceImpact: { lung_cancer: 0.4, copd: 0.4 } },
  ], reducesUncertaintyFor: ['cough_chronic', 'cough_hemoptysis'], mechanismSupported: ['mucus_hypersecretion', 'neoplastic_infiltration'], phenotypeSupported: ['cough_chronic', 'cough_hemoptysis'], priority: 'essential', contextVisibility: { showForContexts: ['adolescent', 'adult', 'older_adult'], hideForContexts: ['neonate', 'infant', 'child'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.55 },

  { id: 'cough_smoking_pack_years', text: 'How many years and how many per day?', clinicalPurpose: 'Quantify smoking exposure', inputType: 'text', reducesUncertaintyFor: ['cough_chronic', 'cough_hemoptysis'], mechanismSupported: ['neoplastic_infiltration'], phenotypeSupported: [], priority: 'standard', contextVisibility: { showForContexts: ['adult', 'older_adult'], hideForContexts: [], forceForContexts: [] }, dependencies: ['cough_smoking'], terminationRule: 'once_answered', expectedInformationGain: 0.3 },

  { id: 'cough_hemoptysis_detail', text: 'How much blood have you coughed up?', clinicalPurpose: 'Assess severity of hemoptysis', inputType: 'single_choice', options: [
    { value: 'streaks', label: 'Blood-streaked sputum only', documentationPhrase: 'with blood-streaked sputum', evidenceImpact: { tb: 0.3, bronchiectasis: 0.3, lung_cancer: 0.2 } },
    { value: 'teaspoon', label: 'Teaspoon to tablespoon', documentationPhrase: 'with small-volume hemoptysis', evidenceImpact: { tb: 0.4, bronchiectasis: 0.4, pneumonia: 0.3 } },
    { value: 'cup_or_more', label: 'Cupful or more (massive)', documentationPhrase: 'with massive hemoptysis', evidenceImpact: { tb: 0.5, bronchiectasis: 0.4, lung_cancer: 0.3 } },
  ], reducesUncertaintyFor: ['cough_hemoptysis'], mechanismSupported: ['neoplastic_infiltration', 'bronchiectasis'], phenotypeSupported: ['cough_hemoptysis'], priority: 'critical', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: ['cough_sputum'], terminationRule: 'once_answered', expectedInformationGain: 0.5 },

  { id: 'cough_night_sweats', text: 'Do you have night sweats?', clinicalPurpose: 'Screen for TB and lymphoma', inputType: 'boolean', reducesUncertaintyFor: ['cough_chronic', 'cough_hemoptysis'], mechanismSupported: ['alveolar_inflammation', 'neoplastic_infiltration'], phenotypeSupported: ['cough_chronic', 'cough_hemoptysis'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: ['neonate', 'infant'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.55 },

  { id: 'cough_weight_loss', text: 'Have you lost weight unintentionally?', clinicalPurpose: 'Screen for chronic disease', inputType: 'boolean', reducesUncertaintyFor: ['cough_chronic', 'cough_hemoptysis'], mechanismSupported: ['neoplastic_infiltration', 'alveolar_inflammation'], phenotypeSupported: ['cough_chronic'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: ['neonate', 'infant', 'child'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.5 },

  { id: 'cough_heartburn', text: 'Do you have heartburn or acid reflux?', clinicalPurpose: 'Screen for GERD as cause', inputType: 'boolean', reducesUncertaintyFor: ['cough_chronic', 'cough_nocturnal', 'cough_positional'], mechanismSupported: ['vagal_stimulation', 'upper_airway_stimulation'], phenotypeSupported: ['cough_chronic', 'cough_nocturnal', 'cough_positional'], priority: 'standard', contextVisibility: { showForContexts: [], hideForContexts: ['neonate', 'infant'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.4 },

  { id: 'cough_nasal_symptoms', text: 'Do you have a runny or blocked nose?', clinicalPurpose: 'Screen for postnasal drip / UACS', inputType: 'boolean', reducesUncertaintyFor: ['cough_chronic', 'cough_acute_dry'], mechanismSupported: ['upper_airway_stimulation'], phenotypeSupported: ['cough_chronic', 'cough_acute_dry'], priority: 'standard', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.3 },

  { id: 'cough_medication_list', text: 'Are you taking any regular medications?', clinicalPurpose: 'Identify drug-induced cough', inputType: 'text', reducesUncertaintyFor: ['cough_chronic', 'cough_acute_dry'], mechanismSupported: ['chemical_stimulation'], phenotypeSupported: ['cough_chronic'], priority: 'standard', contextVisibility: { showForContexts: ['adult', 'older_adult'], hideForContexts: ['neonate', 'infant', 'child'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.3 },

  { id: 'cough_ace_inhibitor', text: 'Are you taking an ACE inhibitor?', clinicalPurpose: 'Identify ACE inhibitor cough', inputType: 'boolean', reducesUncertaintyFor: ['cough_chronic', 'cough_acute_dry'], mechanismSupported: ['chemical_stimulation'], phenotypeSupported: ['cough_chronic'], priority: 'essential', contextVisibility: { showForContexts: ['adult', 'older_adult', 'heart_failure'], hideForContexts: ['neonate', 'infant', 'child'], forceForContexts: [] }, dependencies: ['cough_medication_list'], terminationRule: 'once_answered', expectedInformationGain: 0.6 },

  { id: 'cough_occupational_exposure', text: 'Are you exposed to any dusts, fumes, or chemicals at work?', clinicalPurpose: 'Screen for occupational lung disease', inputType: 'boolean', reducesUncertaintyFor: ['cough_chronic'], mechanismSupported: ['chemical_stimulation'], phenotypeSupported: ['cough_chronic'], priority: 'standard', contextVisibility: { showForContexts: ['adult', 'older_adult'], hideForContexts: ['neonate', 'infant', 'child', 'adolescent'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.3 },

  { id: 'cough_tb_contact', text: 'Have you been in contact with someone with TB?', clinicalPurpose: 'Assess TB exposure risk', inputType: 'boolean', reducesUncertaintyFor: ['cough_chronic', 'cough_hemoptysis', 'cough_acute_productive'], mechanismSupported: ['alveolar_inflammation'], phenotypeSupported: ['cough_chronic', 'cough_hemoptysis'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: ['hiv_positive', 'immunocompromised'] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.5 },

  { id: 'cough_chest_pain', text: 'Do you have chest pain?', clinicalPurpose: 'Assess for pleuritic or cardiac involvement', inputType: 'single_choice', options: [
    { value: 'none', label: 'No chest pain', documentationPhrase: 'without chest pain', evidenceImpact: {} },
    { value: 'pleuritic', label: 'Sharp, worse on deep breath', documentationPhrase: 'with pleuritic chest pain', evidenceImpact: { pneumonia: 0.4, pe: 0.5, pleurisy: 0.6 } },
    { value: 'dull', label: 'Dull ache', documentationPhrase: 'with dull chest pain', evidenceImpact: { lung_cancer: 0.3, bronchitis: 0.2 } },
  ], reducesUncertaintyFor: ['cough_acute_productive', 'cough_hemoptysis'], mechanismSupported: ['pleural_irritation', 'neoplastic_infiltration'], phenotypeSupported: ['cough_acute_productive', 'cough_hemoptysis'], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.45 },

  { id: 'cough_feeding_difficulty', text: 'Does the cough happen during feeding?', clinicalPurpose: 'Assess for aspiration or TOF in neonates/infants', inputType: 'boolean', reducesUncertaintyFor: ['cough_neonatal_feeding'], mechanismSupported: ['aspiration'], phenotypeSupported: ['cough_neonatal_feeding'], priority: 'critical', contextVisibility: { showForContexts: ['neonate', 'infant'], hideForContexts: ['adolescent', 'adult', 'older_adult'], forceForContexts: ['neonate'] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.7 },

  { id: 'cough_stridor', text: 'Is there a noisy breathing sound (stridor)?', clinicalPurpose: 'Assess for upper airway obstruction', inputType: 'boolean', reducesUncertaintyFor: ['cough_barking'], mechanismSupported: ['airway_irritation'], phenotypeSupported: ['cough_barking'], priority: 'critical', contextVisibility: { showForContexts: ['neonate', 'infant', 'child'], hideForContexts: ['adolescent', 'adult', 'older_adult'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.65 },

  { id: 'cough_vaccination_history', text: 'Are the child\'s vaccinations up to date?', clinicalPurpose: 'Assess risk for vaccine-preventable diseases', inputType: 'boolean', reducesUncertaintyFor: ['cough_paroxysmal', 'cough_barking'], mechanismSupported: [], phenotypeSupported: ['cough_paroxysmal', 'cough_barking'], priority: 'standard', contextVisibility: { showForContexts: ['neonate', 'infant', 'child'], hideForContexts: ['adolescent', 'adult', 'older_adult'], forceForContexts: [] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.4 },

  { id: 'cough_hiv_status', text: 'Do you know your HIV status?', clinicalPurpose: 'Assess immunocompromise and TB risk', inputType: 'single_choice', options: [
    { value: 'negative', label: 'Negative', documentationPhrase: 'HIV-negative', evidenceImpact: { hiv_related: 0.1 } },
    { value: 'positive', label: 'Positive, on treatment', documentationPhrase: 'HIV-positive on ART', evidenceImpact: { tb: 0.4, pcp: 0.3 } },
    { value: 'positive_not_on_tx', label: 'Positive, not on treatment', documentationPhrase: 'HIV-positive not on ART', evidenceImpact: { tb: 0.6, pcp: 0.5 } },
    { value: 'unknown', label: 'Unknown', documentationPhrase: 'HIV status unknown', evidenceImpact: {} },
  ], reducesUncertaintyFor: ['cough_chronic', 'cough_immunocompromised'], mechanismSupported: ['alveolar_inflammation'], phenotypeSupported: ['cough_chronic', 'cough_immunocompromised'], priority: 'standard', contextVisibility: { showForContexts: ['adult', 'older_adolescent'], hideForContexts: ['neonate', 'infant', 'child'], forceForContexts: ['tb_contact_positive'] }, dependencies: [], terminationRule: 'once_answered', expectedInformationGain: 0.45 },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 7: EXAMINATION ENGINE — cough-specific exam cards
// ─────────────────────────────────────────────────────────────────

export interface CoughExamCard {
  id: string;
  label: string;
  section: 'inspection' | 'palpation' | 'percussion' | 'auscultation' | 'special_test';
  description: string;
  findings: CoughExamFinding[];
  priority: QuestionPriority;
  contextVisibility: CoughContextVisibility;
  phenotypeVisibility: string[];
}

export interface CoughExamFinding {
  finding: string;
  supportsDiseases: string[];
  weight: number;
  documentationPhrase: string;
}

export const COUGH_EXAM_CARDS: CoughExamCard[] = [
  { id: 'cough_exam_inspection', label: 'Inspection (General)', section: 'inspection', description: 'General inspection for respiratory distress and systemic signs', findings: [
    { finding: 'respiratory_distress', supportsDiseases: ['pneumonia', 'asthma', 'copd', 'pe'], weight: 0.8, documentationPhrase: 'in respiratory distress' },
    { finding: 'cyanosis', supportsDiseases: ['pneumonia', 'heart_failure', 'pe'], weight: 0.9, documentationPhrase: 'cyanosed' },
    { finding: 'clubbing', supportsDiseases: ['bronchiectasis', 'lung_cancer', 'tb'], weight: 0.7, documentationPhrase: 'clubbing of the digits' },
    { finding: 'wasting', supportsDiseases: ['tb', 'lung_cancer', 'hiv'], weight: 0.6, documentationPhrase: 'wasted appearance' },
    { finding: 'accessory_muscle_use', supportsDiseases: ['asthma', 'copd', 'pneumonia'], weight: 0.7, documentationPhrase: 'using accessory muscles of respiration' },
    { finding: 'pursed_lip_breathing', supportsDiseases: ['copd'], weight: 0.6, documentationPhrase: 'pursed-lip breathing' },
    { finding: 'barrel_chest', supportsDiseases: ['copd'], weight: 0.5, documentationPhrase: 'barrel-shaped chest' },
  ], priority: 'essential', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, phenotypeVisibility: [] },
  { id: 'cough_exam_auscultation', label: 'Chest Auscultation', section: 'auscultation', description: 'Lung auscultation for breath sounds and added sounds', findings: [
    { finding: 'crackles_basal', supportsDiseases: ['pneumonia', 'heart_failure', 'bronchiectasis'], weight: 0.8, documentationPhrase: 'basal crackles' },
    { finding: 'crackles_focal', supportsDiseases: ['pneumonia'], weight: 0.85, documentationPhrase: 'focal crackles over the right/left lower lobe' },
    { finding: 'wheeze_expiratory', supportsDiseases: ['asthma', 'copd'], weight: 0.85, documentationPhrase: 'expiratory wheeze' },
    { finding: 'wheeze_inspiratory', supportsDiseases: ['foreign_body', 'croup', 'upper_airway_obstruction'], weight: 0.7, documentationPhrase: 'inspiratory wheeze or stridor' },
    { finding: 'bronchial_breathing', supportsDiseases: ['pneumonia'], weight: 0.8, documentationPhrase: 'bronchial breath sounds' },
    { finding: 'prolonged_expiration', supportsDiseases: ['asthma', 'copd'], weight: 0.7, documentationPhrase: 'prolonged expiratory phase' },
    { finding: 'reduced_breath_sounds', supportsDiseases: ['pneumonia', 'pleural_effusion', 'pneumothorax'], weight: 0.6, documentationPhrase: 'reduced breath sounds' },
    { finding: 'pleural_rub', supportsDiseases: ['pleurisy', 'pneumonia', 'pe'], weight: 0.6, documentationPhrase: 'pleural rub' },
  ], priority: 'critical', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, phenotypeVisibility: [] },
  { id: 'cough_exam_percussion', label: 'Chest Percussion', section: 'percussion', description: 'Percussion for dullness or hyperresonance', findings: [
    { finding: 'dull_percussion', supportsDiseases: ['pneumonia', 'pleural_effusion'], weight: 0.7, documentationPhrase: 'dull percussion note' },
    { finding: 'hyperresonant', supportsDiseases: ['copd', 'pneumothorax'], weight: 0.5, documentationPhrase: 'hyperresonant percussion note' },
  ], priority: 'standard', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, phenotypeVisibility: ['cough_acute_productive', 'cough_chronic'] },
  { id: 'cough_exam_vitals', label: 'Vital Signs', section: 'special_test', description: 'Essential vital signs for cough assessment', findings: [
    { finding: 'tachypnea', supportsDiseases: ['pneumonia', 'asthma', 'pe', 'heart_failure'], weight: 0.7, documentationPhrase: 'tachypnoeic' },
    { finding: 'hypoxia', supportsDiseases: ['pneumonia', 'pe', 'asthma', 'heart_failure'], weight: 0.9, documentationPhrase: 'hypoxic' },
    { finding: 'tachycardia', supportsDiseases: ['pneumonia', 'pe', 'asthma', 'heart_failure'], weight: 0.5, documentationPhrase: 'tachycardic' },
    { finding: 'fever', supportsDiseases: ['pneumonia', 'bronchitis', 'tb', 'covid19'], weight: 0.7, documentationPhrase: 'febrile' },
  ], priority: 'critical', contextVisibility: { showForContexts: [], hideForContexts: [], forceForContexts: [] }, phenotypeVisibility: [] },
  { id: 'cough_exam_ent', label: 'ENT / Neck Examination', section: 'special_test', description: 'ENT exam for postnasal drip, throat, and lymph nodes', findings: [
    { finding: 'nasal_congestion', supportsDiseases: ['allergic_rhinitis', 'uacs', 'uri'], weight: 0.5, documentationPhrase: 'nasal congestion' },
    { finding: 'postnasal_drip_visible', supportsDiseases: ['uacs', 'allergic_rhinitis', 'sinusitis'], weight: 0.6, documentationPhrase: 'visible postnasal drip' },
    { finding: 'pharyngeal_erythema', supportsDiseases: ['pharyngitis', 'uri'], weight: 0.4, documentationPhrase: 'pharyngeal erythema' },
    { finding: 'cervical_lymphadenopathy', supportsDiseases: ['tb', 'lymphoma', 'lung_cancer', 'hiv'], weight: 0.6, documentationPhrase: 'cervical lymphadenopathy' },
    { finding: 'tonsillar_enlargement', supportsDiseases: ['tonsillitis', 'pertussis'], weight: 0.3, documentationPhrase: 'tonsillar enlargement' },
  ], priority: 'standard', contextVisibility: { showForContexts: [], hideForContexts: ['neonate', 'infant'], forceForContexts: [] }, phenotypeVisibility: ['cough_chronic', 'cough_acute_dry'] },
  { id: 'cough_exam_chest_pain', label: 'Chest / Cardiovascular', section: 'special_test', description: 'Cardiovascular exam for cardiac causes of cough', findings: [
    { finding: 'elevated_jvp', supportsDiseases: ['heart_failure'], weight: 0.8, documentationPhrase: 'elevated JVP' },
    { finding: 'pedal_edema', supportsDiseases: ['heart_failure'], weight: 0.7, documentationPhrase: 'pedal edema' },
    { finding: 'hepatomegaly', supportsDiseases: ['heart_failure'], weight: 0.6, documentationPhrase: 'hepatomegaly' },
    { finding: 'gallop_rhythm', supportsDiseases: ['heart_failure'], weight: 0.7, documentationPhrase: 'S3 gallop' },
    { finding: 'mid_diastolic_murmur', supportsDiseases: ['mitral_stenosis'], weight: 0.8, documentationPhrase: 'mid-diastolic murmur at apex' },
  ], priority: 'standard', contextVisibility: { showForContexts: [], hideForContexts: ['neonate', 'infant', 'child'], forceForContexts: ['heart_failure', 'older_adult'] }, phenotypeVisibility: ['cough_nocturnal', 'cough_positional', 'cough_chronic'] },
  { id: 'cough_exam_neonatal', label: 'Neonatal / Infant Feeding Observation', section: 'special_test', description: 'Special examination for neonatal cough', findings: [
    { finding: 'choking_during_feeding', supportsDiseases: ['tof', 'laryngeal_cleft', 'aspiration'], weight: 0.9, documentationPhrase: 'choking during feeding' },
    { finding: 'cyanosis_during_feeding', supportsDiseases: ['tof', 'cardiac', 'aspiration'], weight: 0.9, documentationPhrase: 'cyanosis during feeding' },
    { finding: 'nasal_regurgitation', supportsDiseases: ['tof'], weight: 0.8, documentationPhrase: 'nasal regurgitation of milk' },
  ], priority: 'critical', contextVisibility: { showForContexts: ['neonate', 'infant'], hideForContexts: ['child', 'adolescent', 'adult', 'older_adult'], forceForContexts: [] }, phenotypeVisibility: ['cough_neonatal_feeding'] },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 8: DIFFERENTIAL GRAPH — diseases with evidence mapping
// ─────────────────────────────────────────────────────────────────

export interface CoughDifferentialLink {
  diseaseId: string;
  diseaseName: string;
  typicalPhenotypes: string[];
  keyDiscriminatingFacts: string[];
  commonMechanisms: string[];
  basePrevalence: number;
  agePrevalenceModifiers: Partial<Record<CoughAgeGroup, number>>;
  urgency: CoughUrgency;
  investigationRequired: string[];
}

export const COUGH_DIFFERENTIALS: CoughDifferentialLink[] = [
  { diseaseId: 'acute_bronchitis', diseaseName: 'Acute bronchitis', typicalPhenotypes: ['cough_acute_productive', 'cough_acute_dry'], keyDiscriminatingFacts: ['acute_onset', 'viral_prodrome', 'self_limiting', 'no_consolidation'], commonMechanisms: ['airway_irritation', 'mucus_hypersecretion'], basePrevalence: 0.25, agePrevalenceModifiers: { child: 0.3, adult: 0.25, older_adult: 0.15 }, urgency: 'green', investigationRequired: [] },
  { diseaseId: 'cap', diseaseName: 'Community-acquired pneumonia', typicalPhenotypes: ['cough_acute_productive', 'cough_hemoptysis'], keyDiscriminatingFacts: ['fever', 'crackles', 'sputum_purulence', 'dyspnea', 'cxr_consolidation'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.15, agePrevalenceModifiers: { infant: 0.2, child: 0.1, adult: 0.12, older_adult: 0.25 }, urgency: 'orange', investigationRequired: ['chest_xray', 'cbc', 'crp'] },
  { diseaseId: 'tb', diseaseName: 'Pulmonary tuberculosis', typicalPhenotypes: ['cough_chronic', 'cough_hemoptysis', 'cough_immunocompromised'], keyDiscriminatingFacts: ['cough_>2weeks', 'night_sweats', 'weight_loss', 'hemoptysis'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.08, agePrevalenceModifiers: { adult: 0.1, older_adult: 0.08, adolescent: 0.05 }, urgency: 'yellow', investigationRequired: ['chest_xray', 'sputum_afb', 'genexpert'] },
  { diseaseId: 'asthma', diseaseName: 'Asthma', typicalPhenotypes: ['cough_wheezy', 'cough_nocturnal', 'cough_exercise_induced', 'cough_acute_dry'], keyDiscriminatingFacts: ['wheeze', 'nocturnal_symptoms', 'reversibility', 'family_history'], commonMechanisms: ['bronchospasm'], basePrevalence: 0.12, agePrevalenceModifiers: { child: 0.2, adolescent: 0.15, adult: 0.1, older_adult: 0.08 }, urgency: 'yellow', investigationRequired: ['spirometry'] },
  { diseaseId: 'copd_exacerbation', diseaseName: 'COPD exacerbation', typicalPhenotypes: ['cough_acute_productive', 'cough_wheezy', 'cough_chronic'], keyDiscriminatingFacts: ['smoker', 'chronic_cough', 'sputum_change', 'dyspnea_worsening'], commonMechanisms: ['bronchospasm', 'mucus_hypersecretion'], basePrevalence: 0.08, agePrevalenceModifiers: { adult: 0.05, older_adult: 0.2 }, urgency: 'orange', investigationRequired: ['chest_xray', 'abg'] },
  { diseaseId: 'bronchiectasis', diseaseName: 'Bronchiectasis', typicalPhenotypes: ['cough_chronic', 'cough_hemoptysis', 'cough_acute_productive'], keyDiscriminatingFacts: ['chronic_sputum', 'recurrent_infections', 'clubbing', 'hemoptysis'], commonMechanisms: ['mucus_hypersecretion'], basePrevalence: 0.03, agePrevalenceModifiers: { adult: 0.03, older_adult: 0.05 }, urgency: 'yellow', investigationRequired: ['ct_chest', 'sputum_culture'] },
  { diseaseId: 'lung_cancer', diseaseName: 'Lung cancer', typicalPhenotypes: ['cough_chronic', 'cough_hemoptysis'], keyDiscriminatingFacts: ['smoker_>40py', 'hemoptysis', 'weight_loss', 'clubbing', 'age_>50'], commonMechanisms: ['neoplastic_infiltration'], basePrevalence: 0.02, agePrevalenceModifiers: { adult: 0.01, older_adult: 0.06 }, urgency: 'orange', investigationRequired: ['ct_chest', 'bronchoscopy', 'biopsy'] },
  { diseaseId: 'covid19', diseaseName: 'COVID-19', typicalPhenotypes: ['cough_acute_dry', 'cough_acute_productive'], keyDiscriminatingFacts: ['loss_smell', 'loss_taste', 'fever', 'contacts', 'pcr_positive'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.12, agePrevalenceModifiers: { adult: 0.15, older_adult: 0.1 }, urgency: 'orange', investigationRequired: ['covid_pcr'] },
  { diseaseId: 'heart_failure', diseaseName: 'Heart failure / Pulmonary edema', typicalPhenotypes: ['cough_nocturnal', 'cough_positional', 'cough_acute_productive'], keyDiscriminatingFacts: ['orthopnea', 'pnd', 'pedal_edema', 'basal_crackles', 'bnp_elevated'], commonMechanisms: ['pulmonary_edema'], basePrevalence: 0.05, agePrevalenceModifiers: { older_adult: 0.15 }, urgency: 'orange', investigationRequired: ['echo', 'bnp', 'chest_xray'] },
  { diseaseId: 'gerd', diseaseName: 'GERD / LPR', typicalPhenotypes: ['cough_chronic', 'cough_nocturnal', 'cough_positional'], keyDiscriminatingFacts: ['heartburn', 'regurgitation', 'worse_lying', 'nocturnal'], commonMechanisms: ['vagal_stimulation', 'upper_airway_stimulation'], basePrevalence: 0.1, agePrevalenceModifiers: { adult: 0.12, older_adult: 0.1 }, urgency: 'green', investigationRequired: ['ppi_trial'] },
  { diseaseId: 'uacs', diseaseName: 'Upper airway cough syndrome', typicalPhenotypes: ['cough_chronic', 'cough_acute_dry', 'cough_nocturnal'], keyDiscriminatingFacts: ['nasal_symptoms', 'throat_clearing', 'postnasal_drip'], commonMechanisms: ['upper_airway_stimulation'], basePrevalence: 0.1, agePrevalenceModifiers: { adult: 0.1, child: 0.08 }, urgency: 'green', investigationRequired: [] },
  { diseaseId: 'ace_inhibitor_cough', diseaseName: 'ACE inhibitor cough', typicalPhenotypes: ['cough_chronic', 'cough_acute_dry'], keyDiscriminatingFacts: ['on_ace_inhibitor', 'dry_cough', 'resolves_on_stop'], commonMechanisms: ['chemical_stimulation'], basePrevalence: 0.05, agePrevalenceModifiers: { adult: 0.05, older_adult: 0.08 }, urgency: 'green', investigationRequired: [] },
  { diseaseId: 'pertussis', diseaseName: 'Pertussis (Whooping cough)', typicalPhenotypes: ['cough_paroxysmal'], keyDiscriminatingFacts: ['paroxysmal_cough', 'whoop', 'posttussive_vomiting', 'infant'], commonMechanisms: ['airway_irritation'], basePrevalence: 0.02, agePrevalenceModifiers: { infant: 0.08, child: 0.04 }, urgency: 'orange', investigationRequired: ['pertussis_pcr'] },
  { diseaseId: 'bronchiolitis', diseaseName: 'Bronchiolitis (RSV)', typicalPhenotypes: ['cough_wheezy', 'cough_acute_dry'], keyDiscriminatingFacts: ['infant_<12months', 'wheeze', 'rsv_season', 'fever'], commonMechanisms: ['bronchospasm', 'alveolar_inflammation'], basePrevalence: 0.15, agePrevalenceModifiers: { neonate: 0.1, infant: 0.3, child: 0.05 }, urgency: 'orange', investigationRequired: ['rsv_test'] },
  { diseaseId: 'foreign_body', diseaseName: 'Foreign body aspiration', typicalPhenotypes: ['cough_barking', 'cough_wheezy', 'cough_neonatal_feeding'], keyDiscriminatingFacts: ['choking_episode', 'sudden_onset', 'unilateral_signs'], commonMechanisms: ['obstructive'], basePrevalence: 0.02, agePrevalenceModifiers: { infant: 0.05, child: 0.04 }, urgency: 'red', investigationRequired: ['bronchoscopy', 'chest_xray'] },
  { diseaseId: 'pe', diseaseName: 'Pulmonary embolism', typicalPhenotypes: ['cough_acute_dry', 'cough_hemoptysis'], keyDiscriminatingFacts: ['sudden_dyspnea', 'pleuritic_pain', 'dvt', 'risk_factors'], commonMechanisms: ['pleural_irritation'], basePrevalence: 0.02, agePrevalenceModifiers: { adult: 0.02, older_adult: 0.04 }, urgency: 'red', investigationRequired: ['d_dimer', 'ctpa'] },
  { diseaseId: 'pcp', diseaseName: 'Pneumocystis pneumonia', typicalPhenotypes: ['cough_immunocompromised', 'cough_acute_dry'], keyDiscriminatingFacts: ['hiv', 'cd4_<200', 'dry_cough', 'hypoxia'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.01, agePrevalenceModifiers: { adult: 0.01 }, urgency: 'red', investigationRequired: ['chest_xray', 'ct_chest', 'bronchoscopy'] },
  { diseaseId: 'croup', diseaseName: 'Croup (Laryngotracheobronchitis)', typicalPhenotypes: ['cough_barking'], keyDiscriminatingFacts: ['barking_cough', 'stridor', 'child_<5', 'fever'], commonMechanisms: ['airway_irritation'], basePrevalence: 0.08, agePrevalenceModifiers: { infant: 0.1, child: 0.12 }, urgency: 'orange', investigationRequired: [] },
  { diseaseId: 'influenza', diseaseName: 'Influenza', typicalPhenotypes: ['cough_acute_dry'], keyDiscriminatingFacts: ['high_fever', 'myalgia', 'seasonal', 'rapid_onset'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.1, agePrevalenceModifiers: { child: 0.12, adult: 0.1, older_adult: 0.08 }, urgency: 'yellow', investigationRequired: ['rapid_test'] },
  { diseaseId: 'post_infectious_cough', diseaseName: 'Post-infectious cough', typicalPhenotypes: ['cough_post_infectious', 'cough_acute_dry'], keyDiscriminatingFacts: ['post_viral', 'duration_3to8weeks', 'self_limiting', 'normal_cxr'], commonMechanisms: ['airway_irritation'], basePrevalence: 0.08, agePrevalenceModifiers: { adult: 0.1, child: 0.06 }, urgency: 'green', investigationRequired: [] },
  { diseaseId: 'aspiration_pneumonia', diseaseName: 'Aspiration pneumonia', typicalPhenotypes: ['cough_aspiration', 'cough_acute_productive'], keyDiscriminatingFacts: ['aspiration_risk', 'dysphagia', 'neurological_disease', 'recurrent'], commonMechanisms: ['aspiration', 'alveolar_inflammation'], basePrevalence: 0.03, agePrevalenceModifiers: { older_adult: 0.08, infant: 0.04 }, urgency: 'orange', investigationRequired: ['chest_xray', 'swallow_assessment'] },
  { diseaseId: 'ntm', diseaseName: 'Non-tuberculous mycobacteria', typicalPhenotypes: ['cough_chronic', 'cough_hemoptysis'], keyDiscriminatingFacts: ['chronic_cough', 'bronchiectasis', 'immunocompromised', 'slow_progression'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.01, agePrevalenceModifiers: { older_adult: 0.03, adult: 0.01 }, urgency: 'yellow', investigationRequired: ['ct_chest', 'sputum_afb_culture', 'bronchoscopy'] },
  { diseaseId: 'vocal_cord_dysfunction', diseaseName: 'Vocal cord dysfunction', typicalPhenotypes: ['cough_wheezy', 'cough_exercise_induced'], keyDiscriminatingFacts: ['stridor_inspiratory', 'no_response_asthma_tx', 'voice_change', 'anxiety'], commonMechanisms: ['bronchospasm', 'upper_airway_stimulation'], basePrevalence: 0.02, agePrevalenceModifiers: { adolescent: 0.04, adult: 0.03 }, urgency: 'yellow', investigationRequired: ['laryngoscopy', 'spirometry_flow_loop'] },
  { diseaseId: 'pulmonary_fibrosis', diseaseName: 'Pulmonary fibrosis / ILD', typicalPhenotypes: ['cough_chronic', 'cough_exercise_induced'], keyDiscriminatingFacts: ['progressive_dyspnea', 'basal_crackles_velcro', 'clubbing', 'restrictive_pft'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.01, agePrevalenceModifiers: { older_adult: 0.03, adult: 0.01 }, urgency: 'orange', investigationRequired: ['ct_chest_hrct', 'pft', 'bronchoscopy'] },
  { diseaseId: 'cystic_fibrosis', diseaseName: 'Cystic fibrosis', typicalPhenotypes: ['cough_chronic', 'cough_failure_to_thrive', 'cough_acute_productive'], keyDiscriminatingFacts: ['childhood_onset', 'recurrent_infections', 'failure_to_thrive', 'sweat_test_positive'], commonMechanisms: ['mucus_hypersecretion', 'alveolar_inflammation'], basePrevalence: 0.001, agePrevalenceModifiers: { infant: 0.003, child: 0.003, adolescent: 0.002 }, urgency: 'orange', investigationRequired: ['sweat_test', 'genetic_testing', 'chest_xray'] },
  { diseaseId: 'fungal_pneumonia', diseaseName: 'Fungal pneumonia', typicalPhenotypes: ['cough_chronic', 'cough_immunocompromised', 'cough_miliary'], keyDiscriminatingFacts: ['immunosuppressed', 'endemic_area', 'chronic_course', 'eosinophilia'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.005, agePrevalenceModifiers: { adult: 0.005, older_adult: 0.01 }, urgency: 'orange', investigationRequired: ['ct_chest', 'fungal_culture', 'antigen_test'] },
  { diseaseId: 'epiglottitis', diseaseName: 'Epiglottitis', typicalPhenotypes: ['cough_barking', 'cough_croup'], keyDiscriminatingFacts: ['drooling', 'severe_sore_throat', 'stridor', 'fever', 'toxic'], commonMechanisms: ['airway_irritation'], basePrevalence: 0.003, agePrevalenceModifiers: { child: 0.01, adult: 0.002 }, urgency: 'red', investigationRequired: ['lateral_neck_xray', 'laryngoscopy'] },
  { diseaseId: 'pneumothorax', diseaseName: 'Pneumothorax', typicalPhenotypes: ['cough_acute_dry'], keyDiscriminatingFacts: ['sudden_chest_pain', 'dyspnea', 'hyperresonance', 'trauma'], commonMechanisms: ['pleural_irritation'], basePrevalence: 0.005, agePrevalenceModifiers: { adult: 0.008, adolescent: 0.005 }, urgency: 'red', investigationRequired: ['chest_xray', 'ct_chest'] },
  { diseaseId: 'cmv_pneumonitis', diseaseName: 'CMV pneumonitis', typicalPhenotypes: ['cough_immunocompromised', 'cough_acute_dry'], keyDiscriminatingFacts: ['transplant', 'hiv_cd4_low', 'fever', 'hypoxia', 'cmv_pcr_positive'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.003, agePrevalenceModifiers: { adult: 0.004 }, urgency: 'red', investigationRequired: ['cmv_pcr', 'bronchoscopy', 'ct_chest'] },
  { diseaseId: 'bronchiolitis_obliterans', diseaseName: 'Bronchiolitis obliterans', typicalPhenotypes: ['cough_chronic', 'cough_wheezy'], keyDiscriminatingFacts: ['progressive_dyspnea', 'transplant', 'air_trapping', 'mosaic_attenuation'], commonMechanisms: ['bronchospasm', 'airway_irritation'], basePrevalence: 0.002, agePrevalenceModifiers: { adult: 0.002, child: 0.001 }, urgency: 'orange', investigationRequired: ['ct_chest_expiratory', 'pft', 'bronchoscopy'] },
  { diseaseId: 'drug_induced_cough', diseaseName: 'Drug-induced cough (non-ACE)', typicalPhenotypes: ['cough_ace_inhibitor', 'cough_chronic'], keyDiscriminatingFacts: ['drug_start_temporal', 'drug_list', 'resolves_on_stop', 'dry_cough'], commonMechanisms: ['chemical_stimulation'], basePrevalence: 0.01, agePrevalenceModifiers: { adult: 0.01, older_adult: 0.02 }, urgency: 'green', investigationRequired: [] },
  { diseaseId: 'chronic_sinusitis', diseaseName: 'Chronic sinusitis', typicalPhenotypes: ['cough_uacs_postnasal', 'cough_chronic'], keyDiscriminatingFacts: ['nasal_congestion', 'facial_pain', 'purulent_nasal_discharge', 'hyposmia'], commonMechanisms: ['upper_airway_stimulation'], basePrevalence: 0.04, agePrevalenceModifiers: { adult: 0.05, adolescent: 0.03 }, urgency: 'green', investigationRequired: ['ct_sinus'] },
  { diseaseId: 'laryngopharyngeal_reflux', diseaseName: 'Laryngopharyngeal reflux', typicalPhenotypes: ['cough_gerd_related', 'cough_chronic'], keyDiscriminatingFacts: ['voice_change', 'globus', 'throat_clearing', 'heartburn', 'dysphonia'], commonMechanisms: ['vagal_stimulation', 'upper_airway_stimulation'], basePrevalence: 0.04, agePrevalenceModifiers: { adult: 0.05, older_adult: 0.04 }, urgency: 'green', investigationRequired: ['laryngoscopy', 'ppi_trial'] },
  { diseaseId: 'pulmonary_hypertension', diseaseName: 'Pulmonary hypertension', typicalPhenotypes: ['cough_cardiac', 'cough_exercise_induced'], keyDiscriminatingFacts: ['exertional_dyspnea', 'syncope', 'pedal_edema', 'loud_p2', 'right_heart_strain'], commonMechanisms: ['pulmonary_edema'], basePrevalence: 0.005, agePrevalenceModifiers: { adult: 0.005, older_adult: 0.01 }, urgency: 'orange', investigationRequired: ['echo', 'right_heart_catheterization'] },
  { diseaseId: 'chlamydia_pneumonia_infants', diseaseName: 'Chlamydia pneumonia (infants)', typicalPhenotypes: ['cough_wheezy', 'cough_acute_productive'], keyDiscriminatingFacts: ['infant_1_3months', 'staccato_cough', 'conjunctivitis_history', 'afebrile'], commonMechanisms: ['alveolar_inflammation'], basePrevalence: 0.005, agePrevalenceModifiers: { neonate: 0.01, infant: 0.015 }, urgency: 'orange', investigationRequired: ['chlamydia_pcr', 'chest_xray'] },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 9: INVESTIGATION GRAPH — per disease
// ─────────────────────────────────────────────────────────────────

export interface CoughInvestigationMap {
  diseaseId: string;
  initialRequired: string[];
  initialSuggested: string[];
  confirmatory: string[];
  monitoring: string[];
  activationThreshold: number;
}

export const COUGH_INVESTIGATION_MAP: CoughInvestigationMap[] = [
  { diseaseId: 'cap', initialRequired: ['chest_xray'], initialSuggested: ['cbc', 'crp', 'sputum_gram_stain', 'sputum_culture'], confirmatory: ['blood_culture', 'ct_chest'], monitoring: ['crp_trend', 'abg', 'cxr_followup'], activationThreshold: 0.3 },
  { diseaseId: 'tb', initialRequired: ['chest_xray', 'genexpert'], initialSuggested: ['sputum_afb', 'hiv_test'], confirmatory: ['tb_culture', 'ct_chest'], monitoring: ['sputum_afb_monthly', 'lft', 'weight'], activationThreshold: 0.25 },
  { diseaseId: 'asthma', initialRequired: ['spirometry'], initialSuggested: ['cbc_eosinophils', 'peak_flow'], confirmatory: ['exercise_challenge', 'allergy_test'], monitoring: ['peak_flow_daily', 'act_score'], activationThreshold: 0.3 },
  { diseaseId: 'copd_exacerbation', initialRequired: ['chest_xray'], initialSuggested: ['cbc', 'crp', 'abg'], confirmatory: ['ct_chest'], monitoring: ['abg', 'spirometry'], activationThreshold: 0.3 },
  { diseaseId: 'bronchiectasis', initialRequired: ['chest_xray', 'ct_chest'], initialSuggested: ['sputum_culture', 'cbc', 'crp'], confirmatory: ['bronchoscopy'], monitoring: ['sputum_culture', 'pft'], activationThreshold: 0.3 },
  { diseaseId: 'lung_cancer', initialRequired: ['chest_xray', 'ct_chest'], initialSuggested: ['cbc', 'lft'], confirmatory: ['bronchoscopy', 'biopsy', 'pet_ct'], monitoring: ['ct_followup', 'tumor_markers'], activationThreshold: 0.4 },
  { diseaseId: 'heart_failure', initialRequired: ['chest_xray', 'echo', 'bnp'], initialSuggested: ['ecg', 'cbc', 'crp'], confirmatory: ['cardiac_mri'], monitoring: ['weight_daily', 'echo', 'bnp'], activationThreshold: 0.3 },
  { diseaseId: 'pe', initialRequired: ['d_dimer'], initialSuggested: ['ecg', 'chest_xray', 'abg'], confirmatory: ['ctpa', 'vq_scan'], monitoring: ['coagulation', 'echo'], activationThreshold: 0.4 },
  { diseaseId: 'covid19', initialRequired: ['covid_pcr'], initialSuggested: ['chest_xray', 'cbc', 'crp'], confirmatory: ['ct_chest'], monitoring: ['oxygen_saturation', 'crp_trend'], activationThreshold: 0.2 },
  { diseaseId: 'bronchiolitis', initialRequired: ['rsv_test'], initialSuggested: ['chest_xray'], confirmatory: [], monitoring: ['oxygen_saturation', 'respiratory_rate'], activationThreshold: 0.3 },
  { diseaseId: 'pertussis', initialRequired: ['pertussis_pcr'], initialSuggested: ['cbc', 'chest_xray'], confirmatory: ['culture'], monitoring: [], activationThreshold: 0.3 },
  { diseaseId: 'foreign_body', initialRequired: ['chest_xray', 'bronchoscopy'], initialSuggested: ['ct_chest'], confirmatory: [], monitoring: [], activationThreshold: 0.4 },
  { diseaseId: 'pcp', initialRequired: ['chest_xray', 'ct_chest'], initialSuggested: ['bronchoscopy', 'pcr_pcp'], confirmatory: ['bronchoalveolar_lavage'], monitoring: ['oxygen_saturation', 'cd4'], activationThreshold: 0.4 },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 10: RESULT GRAPH — interpretation feedback
// ─────────────────────────────────────────────────────────────────

export interface CoughResultInterpretation {
  investigationId: string;
  findings: CoughFindingInterpretation[];
}

export interface CoughFindingInterpretation {
  finding: string;
  supportsDiseaseId: string;
  weight: number;
  contradictsDiseaseId: string | null;
  documentationPhrase: string;
}

export const COUGH_RESULT_INTERPRETATIONS: CoughResultInterpretation[] = [
  {
    investigationId: 'chest_xray',
    findings: [
      { finding: 'Lobar consolidation', supportsDiseaseId: 'cap', weight: 0.9, contradictsDiseaseId: 'asthma', documentationPhrase: 'showing lobar consolidation' },
      { finding: 'Air-space opacity', supportsDiseaseId: 'cap', weight: 0.8, contradictsDiseaseId: null, documentationPhrase: 'with air-space opacification' },
      { finding: 'Interstitial infiltrates', supportsDiseaseId: 'covid19', weight: 0.6, contradictsDiseaseId: null, documentationPhrase: 'with interstitial infiltrates' },
      { finding: 'Cavitary lesion', supportsDiseaseId: 'tb', weight: 0.85, contradictsDiseaseId: 'cap', documentationPhrase: 'with cavitary lesion' },
      { finding: 'Apical infiltrate', supportsDiseaseId: 'tb', weight: 0.8, contradictsDiseaseId: 'cap', documentationPhrase: 'with apical infiltrate' },
      { finding: 'Miliary pattern', supportsDiseaseId: 'tb', weight: 0.9, contradictsDiseaseId: 'cap', documentationPhrase: 'with miliary pattern' },
      { finding: 'Hyperinflation', supportsDiseaseId: 'copd_exacerbation', weight: 0.6, contradictsDiseaseId: 'cap', documentationPhrase: 'showing hyperinflation' },
      { finding: 'Pleural effusion', supportsDiseaseId: 'heart_failure', weight: 0.5, contradictsDiseaseId: null, documentationPhrase: 'with pleural effusion' },
      { finding: 'Cardiomegaly', supportsDiseaseId: 'heart_failure', weight: 0.6, contradictsDiseaseId: null, documentationPhrase: 'with cardiomegaly' },
      { finding: 'Normal', supportsDiseaseId: 'asthma', weight: 0.3, contradictsDiseaseId: 'cap', documentationPhrase: 'was normal' },
      { finding: 'Bronchial wall thickening', supportsDiseaseId: 'asthma', weight: 0.4, contradictsDiseaseId: null, documentationPhrase: 'with bronchial wall thickening' },
    ],
  },
  {
    investigationId: 'cbc',
    findings: [
      { finding: 'Leukocytosis with left shift', supportsDiseaseId: 'cap', weight: 0.6, contradictsDiseaseId: null, documentationPhrase: 'showing leukocytosis with left shift' },
      { finding: 'Eosinophilia', supportsDiseaseId: 'asthma', weight: 0.5, contradictsDiseaseId: 'cap', documentationPhrase: 'showing eosinophilia' },
      { finding: 'Lymphocytosis', supportsDiseaseId: 'tb', weight: 0.3, contradictsDiseaseId: null, documentationPhrase: 'showing lymphocytosis' },
      { finding: 'Normal', supportsDiseaseId: 'gerd', weight: 0.1, contradictsDiseaseId: null, documentationPhrase: 'was normal' },
    ],
  },
  {
    investigationId: 'genexpert',
    findings: [
      { finding: 'MTB detected, rifampicin sensitive', supportsDiseaseId: 'tb', weight: 0.99, contradictsDiseaseId: 'cap', documentationPhrase: 'positive for MTB with rifampicin sensitivity' },
      { finding: 'MTB detected, rifampicin resistant', supportsDiseaseId: 'tb', weight: 0.99, contradictsDiseaseId: 'cap', documentationPhrase: 'positive for MTB with rifampicin resistance' },
      { finding: 'MTB not detected', supportsDiseaseId: 'cap', weight: 0.6, contradictsDiseaseId: 'tb', documentationPhrase: 'negative for MTB' },
    ],
  },
  {
    investigationId: 'spirometry',
    findings: [
      { finding: 'FEV1/FVC < 0.7 with reversibility > 12%', supportsDiseaseId: 'asthma', weight: 0.9, contradictsDiseaseId: 'copd_exacerbation', documentationPhrase: 'showing reversible airflow obstruction consistent with asthma' },
      { finding: 'FEV1/FVC < 0.7 without reversibility', supportsDiseaseId: 'copd_exacerbation', weight: 0.8, contradictsDiseaseId: 'asthma', documentationPhrase: 'showing non-reversible airflow obstruction' },
      { finding: 'Normal', supportsDiseaseId: 'gerd', weight: 0.3, contradictsDiseaseId: 'asthma', documentationPhrase: 'was normal' },
    ],
  },
  {
    investigationId: 'ct_chest',
    findings: [
      { finding: 'Consolidation with air bronchogram', supportsDiseaseId: 'cap', weight: 0.95, contradictsDiseaseId: null, documentationPhrase: 'showing consolidation with air bronchogram' },
      { finding: 'Tree-in-bud opacities', supportsDiseaseId: 'tb', weight: 0.85, contradictsDiseaseId: null, documentationPhrase: 'showing tree-in-bud opacities' },
      { finding: 'Apical cavitation', supportsDiseaseId: 'tb', weight: 0.9, contradictsDiseaseId: 'cap', documentationPhrase: 'showing apical cavitation' },
      { finding: 'Ground-glass opacities', supportsDiseaseId: 'covid19', weight: 0.7, contradictsDiseaseId: null, documentationPhrase: 'showing ground-glass opacities' },
      { finding: 'Bronchiectasis', supportsDiseaseId: 'bronchiectasis', weight: 0.9, contradictsDiseaseId: null, documentationPhrase: 'showing bronchiectatic changes' },
      { finding: 'Mass lesion', supportsDiseaseId: 'lung_cancer', weight: 0.85, contradictsDiseaseId: 'tb', documentationPhrase: 'showing a mass lesion' },
      { finding: 'Pulmonary nodule', supportsDiseaseId: 'lung_cancer', weight: 0.5, contradictsDiseaseId: null, documentationPhrase: 'showing a pulmonary nodule' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 11: MANAGEMENT GRAPH — treatments per disease
// ─────────────────────────────────────────────────────────────────

export interface CoughManagement {
  diseaseId: string;
  treatmentLines: CoughTreatmentLine[];
  supportiveCare: string[];
  dispositionCriteria: string[];
}

export interface CoughTreatmentLine {
  line: number;
  regimen: string;
  medications: string[];
  duration: string;
  evidenceLevel: string;
}

export const COUGH_MANAGEMENT: CoughManagement[] = [
  { diseaseId: 'cap', treatmentLines: [
    { line: 1, regimen: 'Amoxicillin 500mg TDS or Doxycycline 100mg BD', medications: ['amoxicillin', 'doxycycline'], duration: '5-7 days', evidenceLevel: 'guideline' },
    { line: 2, regimen: 'Ceftriaxone 1g IV + Azithromycin 500mg PO', medications: ['ceftriaxone', 'azithromycin'], duration: '7-10 days', evidenceLevel: 'guideline' },
    { line: 3, regimen: 'IV antibiotics per local guidelines + ICU care', medications: ['ceftriaxone', 'vancomycin', 'piperacillin_tazobactam'], duration: '10-14 days', evidenceLevel: 'guideline' },
  ], supportiveCare: ['oxygen_if_spo2_<92', 'iv_fluids_if_septic', 'antipyretics'], dispositionCriteria: ['afebrile_48h', 'stable_vitals', 'improving_symptoms', 'tolerating_oral'] },
  { diseaseId: 'tb', treatmentLines: [
    { line: 1, regimen: 'RHZE (Rifampicin + INH + Pyrazinamide + Ethambutol)', medications: ['rifampicin', 'isoniazid', 'pyrazinamide', 'ethambutol'], duration: '2 months intensive / 4 months continuation', evidenceLevel: 'gold_standard' },
    { line: 2, regimen: 'MDR-TB regimen per WHO guidelines', medications: ['mdr_tb_drugs'], duration: '9-12 months', evidenceLevel: 'guideline' },
  ], supportiveCare: ['pyridoxine_supplementation', 'nutritional_support', 'directly_observed_therapy'], dispositionCriteria: ['treatment_initiated', 'adherence_plan', 'public_health_notification'] },
  { diseaseId: 'asthma', treatmentLines: [
    { line: 1, regimen: 'Inhaled corticosteroid (budesonide) + SABA as needed', medications: ['budesonide_inhaler', 'salbutamol_inhaler'], duration: 'Long-term controller', evidenceLevel: 'gold_standard' },
    { line: 2, regimen: 'Add LABA (salmeterol) or LAMA or LTRA', medications: ['salmeterol_inhaler', 'montelukast'], duration: 'Add-on', evidenceLevel: 'guideline' },
    { line: 3, regimen: 'Oral prednisolone for acute exacerbation', medications: ['prednisolone_oral'], duration: '5-7 days', evidenceLevel: 'gold_standard' },
  ], supportiveCare: ['inhaler_technique_education', 'asthma_action_plan', 'trigger_avoidance'], dispositionCriteria: ['stable_symptoms', 'adequate_inhaler_technique', 'action_plan_provided'] },
  { diseaseId: 'gerd', treatmentLines: [
    { line: 1, regimen: 'PPI trial (omeprazole 20mg BD) for 4-8 weeks', medications: ['omeprazole'], duration: '4-8 weeks', evidenceLevel: 'guideline' },
    { line: 2, regimen: 'Double-dose PPI + lifestyle modifications', medications: ['omeprazole_high_dose'], duration: '8-12 weeks', evidenceLevel: 'guideline' },
  ], supportiveCare: ['head_of_bed_elevation', 'avoid_late_meals', 'weight_loss'], dispositionCriteria: ['response_to_ppi', 'symptoms_controlled'] },
  { diseaseId: 'heart_failure', treatmentLines: [
    { line: 1, regimen: 'Diuresis (furosemide) + ACE inhibitor', medications: ['furosemide', 'lisinopril'], duration: 'Long-term', evidenceLevel: 'gold_standard' },
    { line: 2, regimen: 'Add beta-blocker + aldosterone antagonist', medications: ['bisoprolol', 'spironolactone'], duration: 'Long-term', evidenceLevel: 'gold_standard' },
  ], supportiveCare: ['oxygen', 'salt_restriction', 'daily_weights', 'fluid_restriction'], dispositionCriteria: ['euvolemic', 'stable_vitals', 'improving_symptoms'] },
  { diseaseId: 'covid19', treatmentLines: [
    { line: 1, regimen: 'Supportive care, monitoring', medications: [], duration: 'Symptom-based', evidenceLevel: 'guideline' },
    { line: 2, regimen: 'Antiviral therapy per local protocol', medications: ['remdesivir', 'nirmatrelvir_ritonavir'], duration: '5-10 days', evidenceLevel: 'guideline' },
  ], supportiveCare: ['oxygen', 'antipyretics', 'monitoring', 'isolation'], dispositionCriteria: ['afebrile', 'stable_oxygen', 'improving'] },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 12–13: GUIDELINE ENGINE + LOCAL CUSTOMIZATION
// ─────────────────────────────────────────────────────────────────

export interface CoughGuideline {
  id: string;
  country: string;
  organization: string;
  year: number;
  diseaseGuidelines: CoughDiseaseGuideline[];
  customRules: CoughCustomRule[];
  drugFormulary: string[];
  active: boolean;
}

export interface CoughDiseaseGuideline {
  diseaseId: string;
  firstLine: string[];
  secondLine: string[];
  requiredInvestigations: string[];
  mandatoryRules: string[];
}

export interface CoughCustomRule {
  id: string;
  type: 'drug_substitution' | 'mandatory_investigation' | 'referral_required' | 'notification_required' | 'protocol_override';
  condition: string;
  action: string;
}

export const COUGH_GUIDELINES: CoughGuideline[] = [
  {
    id: 'who_adult_cap_2024',
    country: 'Global',
    organization: 'WHO',
    year: 2024,
    diseaseGuidelines: [
      { diseaseId: 'cap', firstLine: ['amoxicillin'], secondLine: ['ceftriaxone', 'azithromycin'], requiredInvestigations: ['chest_xray'], mandatoryRules: ['curb65_assessment'] },
      { diseaseId: 'tb', firstLine: ['rifampicin', 'isoniazid', 'pyrazinamide', 'ethambutol'], secondLine: ['mdr_tb_regimen'], requiredInvestigations: ['genexpert', 'chest_xray', 'hiv_test'], mandatoryRules: ['public_health_notification', 'contact_tracing'] },
    ],
    customRules: [],
    drugFormulary: ['amoxicillin', 'ceftriaxone', 'rifampicin', 'isoniazid', 'pyrazinamide', 'ethambutol', 'salbutamol', 'budesonide'],
    active: true,
  },
  {
    id: 'kenya_adult_cap_2025',
    country: 'Kenya',
    organization: 'Ministry of Health Kenya',
    year: 2025,
    diseaseGuidelines: [
      { diseaseId: 'cap', firstLine: ['amoxicillin'], secondLine: ['ceftriaxone', 'doxycycline'], requiredInvestigations: ['chest_xray', 'cbc', 'crp'], mandatoryRules: ['curb65_assessment', 'hiv_test', 'malaria_rdt_if_febrile'] },
      { diseaseId: 'tb', firstLine: ['rifampicin', 'isoniazid', 'pyrazinamide', 'ethambutol'], secondLine: ['mdr_tb_regimen'], requiredInvestigations: ['genexpert', 'chest_xray', 'hiv_test'], mandatoryRules: ['public_health_notification', 'contact_tracing', 'dot_therapy'] },
    ],
    customRules: [
      { id: 'kenya_malaria_rdt', type: 'mandatory_investigation', condition: 'fever_present', action: 'Perform malaria RDT before antibiotics' },
      { id: 'kenya_tb_dot', type: 'protocol_override', condition: 'tb_diagnosis', action: 'Directly observed therapy mandatory' },
    ],
    drugFormulary: ['amoxicillin', 'ceftriaxone', 'doxycycline', 'rifampicin', 'isoniazid', 'pyrazinamide', 'ethambutol', 'artemether_lumefantrine'],
    active: true,
  },
  {
    id: 'hospital_a_formulary_2025',
    country: 'Local',
    organization: 'Hospital A',
    year: 2025,
    diseaseGuidelines: [
      { diseaseId: 'cap', firstLine: ['ceftriaxone'], secondLine: ['piperacillin_tazobactam'], requiredInvestigations: ['chest_xray', 'cbc', 'crp', 'blood_culture'], mandatoryRules: ['icu_referral_if_curb65_>=3'] },
    ],
    customRules: [
      { id: 'hosp_a_ceftriaxone', type: 'drug_substitution', condition: 'ceftriaxone_unavailable', action: 'Cefotaxime 1g IV TDS' },
      { id: 'hosp_a_genexpert', type: 'mandatory_investigation', condition: 'tb_suspected', action: 'GeneXpert mandatory before starting TB treatment' },
    ],
    drugFormulary: ['ceftriaxone', 'cefotaxime', 'piperacillin_tazobactam', 'rifampicin', 'isoniazid'],
    active: true,
  },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 14: WORKFLOW GRAPH
// ─────────────────────────────────────────────────────────────────

export interface CoughWorkflow {
  diseaseId: string;
  steps: CoughWorkflowStep[];
  estimatedDuration: string;
  requiresAdmission: boolean;
}

export interface CoughWorkflowStep {
  step: number;
  role: string;
  action: string;
  department: string;
  triggersNext: string[];
  autoCreateTask: boolean;
}

export const COUGH_WORKFLOWS: CoughWorkflow[] = [
  { diseaseId: 'cap', steps: [
    { step: 1, role: 'doctor', action: 'Clinical assessment and CURB-65 score', department: 'triage/outpatient', triggersNext: ['lab', 'radiology'], autoCreateTask: true },
    { step: 2, role: 'lab', action: 'CBC, CRP, blood cultures', department: 'laboratory', triggersNext: ['doctor_review'], autoCreateTask: true },
    { step: 3, role: 'radiology', action: 'Chest X-ray', department: 'radiology', triggersNext: ['doctor_review'], autoCreateTask: true },
    { step: 4, role: 'doctor', action: 'Review results, prescribe antibiotics', department: 'clinic/ward', triggersNext: ['pharmacy', 'nurse'], autoCreateTask: true },
    { step: 5, role: 'pharmacy', action: 'Dispense antibiotics', department: 'pharmacy', triggersNext: ['nurse'], autoCreateTask: true },
    { step: 6, role: 'nurse', action: 'Administer first dose, monitor vitals', department: 'ward', triggersNext: ['doctor_followup'], autoCreateTask: true },
    { step: 7, role: 'doctor', action: 'Daily review, discharge planning', department: 'ward', triggersNext: ['discharge'], autoCreateTask: true },
  ], estimatedDuration: '3-7 days', requiresAdmission: true },
  { diseaseId: 'asthma', steps: [
    { step: 1, role: 'doctor', action: 'Assess severity, peak flow', department: 'clinic/emergency', triggersNext: ['spirometry'], autoCreateTask: true },
    { step: 2, role: 'respiratory', action: 'Spirometry', department: 'respiratory_lab', triggersNext: ['doctor_review'], autoCreateTask: true },
    { step: 3, role: 'doctor', action: 'Review, prescribe inhalers', department: 'clinic', triggersNext: ['pharmacy', 'education'], autoCreateTask: true },
    { step: 4, role: 'pharmacy', action: 'Dispense inhalers', department: 'pharmacy', triggersNext: ['education'], autoCreateTask: false },
    { step: 5, role: 'nurse', action: 'Inhaler technique education, action plan', department: 'clinic', triggersNext: ['followup'], autoCreateTask: true },
  ], estimatedDuration: 'Outpatient', requiresAdmission: false },
  { diseaseId: 'tb', steps: [
    { step: 1, role: 'doctor', action: 'Clinical assessment, TB screening', department: 'clinic', triggersNext: ['lab'], autoCreateTask: true },
    { step: 2, role: 'lab', action: 'GeneXpert, sputum AFB, HIV test', department: 'laboratory', triggersNext: ['radiology'], autoCreateTask: true },
    { step: 3, role: 'radiology', action: 'Chest X-ray', department: 'radiology', triggersNext: ['doctor_review'], autoCreateTask: true },
    { step: 4, role: 'doctor', action: 'Confirm diagnosis, start treatment', department: 'tb_clinic', triggersNext: ['public_health', 'pharmacy', 'nutrition'], autoCreateTask: true },
    { step: 5, role: 'public_health', action: 'Contact tracing, notification', department: 'public_health', triggersNext: [], autoCreateTask: true },
    { step: 6, role: 'nurse', action: 'DOT therapy monitoring, monthly follow-up', department: 'tb_clinic', triggersNext: [], autoCreateTask: true },
  ], estimatedDuration: '6 months', requiresAdmission: false },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 15: MONITORING GRAPH
// ─────────────────────────────────────────────────────────────────

export interface CoughMonitoring {
  diseaseId: string;
  parameters: CoughMonitoringParameter[];
  severityBasedFrequency: Record<CoughSeverityClass, string>;
}

export interface CoughMonitoringParameter {
  parameter: string;
  frequency: string;
  target: string;
  actionIfAbnormal: string;
  criticalLow?: string;
  criticalHigh?: string;
}

export const COUGH_MONITORING: CoughMonitoring[] = [
  { diseaseId: 'cap', parameters: [
    { parameter: 'Temperature', frequency: '4-6 hourly', target: '< 37.5°C', actionIfAbnormal: 'Re-evaluate antibiotics, cultures, imaging', criticalHigh: '> 39°C' },
    { parameter: 'Oxygen saturation', frequency: 'Continuous if hypoxic, then 4 hourly', target: '≥ 92%', actionIfAbnormal: 'Increase oxygen, ABG, assess deterioration', criticalLow: '< 88%' },
    { parameter: 'Respiratory rate', frequency: '4 hourly', target: '12-20/min', actionIfAbnormal: 'Assess deterioration, ABG', criticalHigh: '> 30/min' },
    { parameter: 'Heart rate', frequency: '4 hourly', target: '60-100/min', actionIfAbnormal: 'Assess sepsis, dehydration', criticalHigh: '> 120/min' },
    { parameter: 'Blood pressure', frequency: '4-6 hourly', target: '≥ 90/60', actionIfAbnormal: 'IV fluids, sepsis evaluation', criticalLow: '< 90/60' },
    { parameter: 'Chest X-ray', frequency: 'At 48-72h if not improving', target: 'Improving', actionIfAbnormal: 'CT chest, bronchoscopy' },
    { parameter: 'CRP trend', frequency: '48 hourly', target: 'Trending down', actionIfAbnormal: 'Re-evaluate antibiotics' },
  ], severityBasedFrequency: { mild: '12 hourly', moderate: '6 hourly', severe: 'Continuous monitoring', life_threatening: 'Continuous ICU monitoring' } },
  { diseaseId: 'asthma', parameters: [
    { parameter: 'Peak flow', frequency: '4-6 hourly (daily if stable)', target: '≥ 80% personal best', actionIfAbnormal: 'Increase bronchodilator frequency, consider oral steroids', criticalLow: '< 50% personal best' },
    { parameter: 'Oxygen saturation', frequency: 'Continuous if acute, daily if stable', target: '≥ 92%', actionIfAbnormal: 'Oxygen therapy, assess severity', criticalLow: '< 90%' },
    { parameter: 'Respiratory rate', frequency: '4 hourly during exacerbation', target: '12-20/min', actionIfAbnormal: 'Assess deterioration', criticalHigh: '> 30/min' },
    { parameter: 'Symptoms (ACT score)', frequency: 'Each visit', target: 'ACT ≥ 20', actionIfAbnormal: 'Step up therapy' },
    { parameter: 'Inhaler technique', frequency: 'Each visit', target: 'Correct', actionIfAbnormal: 'Re-educate' },
  ], severityBasedFrequency: { mild: 'Daily', moderate: '4 hourly', severe: 'Continuous monitoring', life_threatening: 'ICU monitoring' } },
  { diseaseId: 'tb', parameters: [
    { parameter: 'Sputum AFB', frequency: 'Monthly until conversion', target: 'Negative', actionIfAbnormal: 'Assess adherence, drug resistance, culture and DST' },
    { parameter: 'Weight', frequency: 'Monthly', target: 'Stable or gaining', actionIfAbnormal: 'Nutritional assessment, treatment failure evaluation' },
    { parameter: 'LFT', frequency: 'Monthly', target: 'Normal', actionIfAbnormal: 'Adjust hepatotoxic drugs, assess for hepatitis' },
    { parameter: 'Chest X-ray', frequency: 'At 2 months and end of treatment', target: 'Improving or resolved', actionIfAbnormal: 'Assess for complications' },
    { parameter: 'Visual acuity (ethambutol)', frequency: 'Monthly', target: 'Normal', actionIfAbnormal: 'Stop ethambutol, ophthalmology referral' },
  ], severityBasedFrequency: { mild: 'Monthly', moderate: 'Monthly', severe: '2 weekly', life_threatening: 'Weekly' } },
];

// ─────────────────────────────────────────────────────────────────
// LEVEL 16: LONGITUDINAL GRAPH
// ─────────────────────────────────────────────────────────────────

export interface CoughLongitudinalEvent {
  date: string;
  diseaseId: string;
  episodeType: 'first' | 'recurrent' | 'exacerbation' | 'complication';
  severity: CoughSeverityClass;
  treatment: string[];
  outcome: 'resolved' | 'improved' | 'unchanged' | 'worsened' | 'died';
  complications: string[];
}

export interface CoughLongitudinalProfile {
  patientId: string;
  events: CoughLongitudinalEvent[];
  totalEpisodes: number;
  annualFrequency: number;
  trend: 'improving' | 'stable' | 'worsening';
  dominantPattern: string;
  lastEpisode: CoughLongitudinalEvent | null;
}

// ─────────────────────────────────────────────────────────────────
// LEVEL 17: AI GRAPH — how LLMs consume cough knowledge
// ─────────────────────────────────────────────────────────────────

export interface CoughAIContext {
  symptomId: 'cough';
  identity: Pick<CoughIdentity, 'displayName' | 'aliases' | 'patientWords' | 'bodySystems' | 'organs'>;
  activePhenotypes: string[];
  likelyMechanisms: string[];
  differentialScores: Record<string, number>;
  factSummary: Record<string, unknown>;
  contextModifiers: string[];
  investigationPlan: string[];
  managementPlan: string[];
  uncertaintyRemaining: number;
  narrative: string;
}

// ─────────────────────────────────────────────────────────────────
// LEVEL 18: HMIS GRAPH — event-driven actions
// ─────────────────────────────────────────────────────────────────

export interface CoughHMISEvent {
  trigger: string;
  department: string;
  action: string;
  priority: 'routine' | 'urgent' | 'stat';
  autoCreate: boolean;
  notificationRoles: string[];
}

export const COUGH_HMIS_EVENTS: CoughHMISEvent[] = [
  { trigger: 'cough_with_hemoptysis', department: 'radiology', action: 'Chest X-ray ordered (urgent)', priority: 'urgent', autoCreate: true, notificationRoles: ['doctor', 'radiologist'] },
  { trigger: 'tb_suspected', department: 'laboratory', action: 'GeneXpert and sputum AFB ordered', priority: 'urgent', autoCreate: true, notificationRoles: ['doctor', 'lab', 'public_health'] },
  { trigger: 'hypoxia_detected', department: 'nursing', action: 'Start oxygen therapy, monitor SpO2', priority: 'stat', autoCreate: true, notificationRoles: ['doctor', 'nurse'] },
  { trigger: 'pneumonia_diagnosis', department: 'pharmacy', action: 'Prepare antibiotics', priority: 'urgent', autoCreate: true, notificationRoles: ['pharmacy', 'nurse'] },
  { trigger: 'tb_confirmed', department: 'public_health', action: 'Initiate contact tracing, notification', priority: 'routine', autoCreate: true, notificationRoles: ['public_health', 'doctor'] },
  { trigger: 'asthma_diagnosis', department: 'pharmacy', action: 'Dispense inhalers, spacer', priority: 'routine', autoCreate: true, notificationRoles: ['pharmacy', 'nurse_educator'] },
  { trigger: 'admission_required', department: 'admitting', action: 'Admit patient to medical ward', priority: 'urgent', autoCreate: true, notificationRoles: ['admitting', 'ward_nurse', 'doctor'] },
  { trigger: 'icu_required', department: 'icu', action: 'ICU admission, continuous monitoring', priority: 'stat', autoCreate: true, notificationRoles: ['icu_team', 'doctor', 'nurse'] },
];

// ═══════════════════════════════════════════════════════════════
// COMPLETE COUGH KNOWLEDGE EXPORT
// ═══════════════════════════════════════════════════════════════

export const COUGH_KNOWLEDGE = {
  identity: {
    id: 'cough' as const,
    displayName: 'Cough',
    aliases: ['Tussis', 'Coughing', 'Hack'],
    patientWords: ['cough', 'coughing', 'hack', 'bark', 'clearing throat'],
    snomed: '49727002',
    icd10: 'R05',
    icd11: 'MD12.A0',
    bodySystems: ['respiratory', 'immune', 'cardiovascular'],
    organs: ['trachea', 'bronchi', 'lungs', 'pleura', 'pharynx', 'larynx'],
  },
  contextRules: COUGH_CONTEXT_RULES,
  etiologies: COUGH_ETIOLOGIES,
  mechanisms: COUGH_MECHANISMS,
  phenotypes: COUGH_PHENOTYPES,
  questions: COUGH_QUESTIONS,
  examCards: COUGH_EXAM_CARDS,
  differentials: COUGH_DIFFERENTIALS,
  investigationMap: COUGH_INVESTIGATION_MAP,
  resultInterpretations: COUGH_RESULT_INTERPRETATIONS,
  management: COUGH_MANAGEMENT,
  guidelines: COUGH_GUIDELINES,
  workflows: COUGH_WORKFLOWS,
  monitoring: COUGH_MONITORING,
  hmisEvents: COUGH_HMIS_EVENTS,
} as const;
