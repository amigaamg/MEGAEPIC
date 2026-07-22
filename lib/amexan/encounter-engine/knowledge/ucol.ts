import type { ClinicalObjectiveGroup } from './symptom-types';

export const UNIVERSAL_OBJECTIVES: Record<string, ClinicalObjectiveGroup> = {
  // ─── HPI / Symptom Exploration ─────────────────────────────────────
  characterization: {
    id: 'obj_char', label: 'Characterization', description: 'Establish presence, nature, and quality of symptom',
    order: 1, required: true, questionIds: [],
  },
  timeline: {
    id: 'obj_timeline', label: 'Timeline', description: 'Onset, duration, frequency, temporal evolution',
    order: 2, required: true, questionIds: [],
  },
  severity: {
    id: 'obj_severity', label: 'Severity', description: 'Assess intensity and functional impact',
    order: 3, required: true, questionIds: [],
  },
  aggravating: {
    id: 'obj_aggravating', label: 'Aggravating / Relieving Factors', description: 'Identify triggers and relieving factors',
    order: 4, required: false, questionIds: [],
  },
  associated: {
    id: 'obj_associated', label: 'Associated Symptoms', description: 'Identify accompanying features',
    order: 5, required: true, questionIds: [],
  },
  source_localization: {
    id: 'obj_source', label: 'Source Localization', description: 'Identify potential source or origin',
    order: 6, required: true, questionIds: [],
  },
  exposure: {
    id: 'obj_exposure', label: 'Exposure History', description: 'Identify epidemiological and environmental risk factors',
    order: 7, required: false, questionIds: [],
  },
  functional: {
    id: 'obj_functional', label: 'Functional Impact', description: 'Effect on daily life and function',
    order: 8, required: false, questionIds: [],
  },
  previous: {
    id: 'obj_previous', label: 'Previous Episodes', description: 'History of similar episodes',
    order: 9, required: false, questionIds: [],
  },
  complications: {
    id: 'obj_complications', label: 'Complications', description: 'Identify complications related to symptom',
    order: 10, required: false, questionIds: [],
  },
  negatives: {
    id: 'obj_negatives', label: 'Important Negatives', description: 'Document pertinent negative findings',
    order: 11, required: false, questionIds: [],
  },
  red_flags: {
    id: 'obj_red_flags', label: 'Red Flag Screening', description: 'Exclude serious pathology',
    order: 12, required: true, questionIds: [],
  },
  aura: {
    id: 'obj_aura', label: 'Aura / Prodrome', description: 'Preceding neurological or systemic symptoms',
    order: 13, required: false, questionIds: [],
  },
  triggers: {
    id: 'obj_triggers', label: 'Triggers', description: 'Identify precipitating factors',
    order: 14, required: false, questionIds: [],
  },
  sputum: {
    id: 'obj_sputum', label: 'Sputum Characteristics', description: 'Assess sputum volume, color, consistency',
    order: 15, required: false, questionIds: [],
  },

  // ─── Pediatric-specific ────────────────────────────────────────────
  pediatric: {
    id: 'obj_pediatric', label: 'Pediatric Assessment', description: 'Age-appropriate assessment',
    order: 16, required: false, questionIds: [],
  },
  pediatric_feeding: {
    id: 'obj_ped_feeding', label: 'Feeding Assessment', description: 'Assess feeding in pediatric context',
    order: 17, required: false, questionIds: [],
  },
  immunization_context: {
    id: 'obj_ped_immunization', label: 'Immunization Context', description: 'Verify immunization status',
    order: 18, required: false, questionIds: [],
  },
  neonatal_feeding: {
    id: 'obj_neonatal_feeding', label: 'Neonatal Feeding', description: 'Assess feeding in neonate',
    order: 19, required: true, questionIds: [],
  },

  // ─── Obstetric-specific ────────────────────────────────────────────
  obstetric: {
    id: 'obj_obstetric', label: 'Obstetric Assessment', description: 'Assess pregnancy context',
    order: 20, required: true, questionIds: [],
  },

  // ─── Emergency ─────────────────────────────────────────────────────
  emergency_screening: {
    id: 'obj_emergency', label: 'Emergency Screening', description: 'ABCDE danger signs',
    order: 0, required: true, questionIds: [],
  },

  // ─── History-specific ──────────────────────────────────────────────
  chronic_diseases: {
    id: 'obj_pmh_chronic', label: 'Chronic Diseases', description: 'Document all chronic conditions',
    order: 21, required: true, questionIds: [],
  },
  surgical_history: {
    id: 'obj_pmh_surgical', label: 'Surgical History', description: 'Previous surgeries',
    order: 22, required: false, questionIds: [],
  },
  current_medications: {
    id: 'obj_drug_current', label: 'Current Medications', description: 'Document all current medications',
    order: 23, required: true, questionIds: [],
  },
  drug_allergies: {
    id: 'obj_allergy_drug', label: 'Drug Allergies', description: 'Document drug allergies',
    order: 24, required: true, questionIds: [],
  },
  family_history: {
    id: 'obj_family_diseases', label: 'Family Diseases', description: 'Family history of significant diseases',
    order: 25, required: true, questionIds: [],
  },
  social_occupation: {
    id: 'obj_social_occupation', label: 'Occupation / School', description: 'Occupational and school history',
    order: 26, required: true, questionIds: [],
  },
  lifestyle: {
    id: 'obj_social_lifestyle', label: 'Lifestyle', description: 'Smoking, alcohol, substance use',
    order: 27, required: true, questionIds: [],
  },
  menstrual: {
    id: 'obj_obgyn_menstrual', label: 'Menstrual History', description: 'Menarche, cycle, LMP',
    order: 28, required: true, questionIds: [],
  },
  obstetric_history: {
    id: 'obj_obgyn_obstetric', label: 'Obstetric History', description: 'Gravidity, parity, outcomes',
    order: 29, required: true, questionIds: [],
  },
  feeding_nutrition: {
    id: 'obj_nutrition_feeding', label: 'Feeding History', description: 'Feeding practices and dietary intake',
    order: 30, required: true, questionIds: [],
  },
  immunization_status: {
    id: 'obj_immunization_status', label: 'Immunization Status', description: 'Vaccination status',
    order: 31, required: true, questionIds: [],
  },
  growth_params: {
    id: 'obj_growth_params', label: 'Growth Parameters', description: 'Growth measurements and trajectory',
    order: 32, required: true, questionIds: [],
  },
  development: {
    id: 'obj_development', label: 'Developmental Milestones', description: 'Developmental progress',
    order: 33, required: true, questionIds: [],
  },
  antenatal: {
    id: 'obj_perinatal_antenatal', label: 'Antenatal History', description: 'Maternal health and pregnancy course',
    order: 34, required: true, questionIds: [],
  },
  natal: {
    id: 'obj_perinatal_natal', label: 'Natal History', description: 'Labour, delivery, birth condition',
    order: 35, required: true, questionIds: [],
  },
  postnatal: {
    id: 'obj_perinatal_postnatal', label: 'Postnatal History', description: 'Neonatal adaptation',
    order: 36, required: true, questionIds: [],
  },
  ros_general: {
    id: 'obj_ros_general', label: 'General / Constitutional ROS', description: 'Systemic symptom screening',
    order: 37, required: true, questionIds: [],
  },
  ros_by_system: {
    id: 'obj_ros_by_system', label: 'System-by-System ROS', description: 'Targeted system review',
    order: 38, required: false, questionIds: [],
  },
};

export function getObjective(id: string): ClinicalObjectiveGroup | undefined {
  return UNIVERSAL_OBJECTIVES[id];
}

export function getObjectivesByIds(ids: string[]): ClinicalObjectiveGroup[] {
  return ids.map(id => UNIVERSAL_OBJECTIVES[id]).filter(Boolean);
}
