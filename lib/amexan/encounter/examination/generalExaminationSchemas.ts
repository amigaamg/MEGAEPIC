// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal General Examination — FIELD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
// Every field in the general examination lives here with its metadata.
// Volume IIA of the Universal Examination Engine.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ConstitutionalSignId } from './examinationTypes';

// ── Field type system (matches existing examSchema pattern) ───────────────────

export type GenExamFieldType =
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'number'
  | 'text'
  | 'grade'
  | 'scale';

export interface GenExamField {
  id: string;
  label: string;
  shortLabel: string;
  type: GenExamFieldType;
  options?: string[];
  mandatory: boolean;
  section: string;
  subsection?: string;
  clinicalGuide: string;
  activatesFields?: string[];
  ageMinMonths?: number;
  ageMaxMonths?: number;
  sexRequired?: 'male' | 'female';
  requiredBySpecialty?: string[];
}

// ── Section A: Preparation ─────────────────────────────────────────────────────

export const PREPARATION_FIELDS: readonly GenExamField[] = [
  { id: 'prep_identity_confirmed', label: 'Identity confirmed', shortLabel: 'Identity', type: 'boolean', mandatory: true, section: 'preparation', clinicalGuide: 'Confirm patient identity using at least two identifiers' },
  { id: 'prep_consent_obtained', label: 'Consent obtained', shortLabel: 'Consent', type: 'boolean', mandatory: true, section: 'preparation', clinicalGuide: 'Verbal or written consent for examination' },
  { id: 'prep_chaperone_required', label: 'Chaperone required', shortLabel: 'Chaperone', type: 'boolean', mandatory: false, section: 'preparation', clinicalGuide: 'Chaperone offered for intimate examinations', activatesFields: ['prep_chaperone_present'] },
  { id: 'prep_chaperone_present', label: 'Chaperone present', shortLabel: 'Present', type: 'boolean', mandatory: true, section: 'preparation', clinicalGuide: 'Chaperone is present during the examination' },
  { id: 'prep_lighting', label: 'Lighting adequate', shortLabel: 'Lighting', type: 'boolean', mandatory: true, section: 'preparation', clinicalGuide: 'Ensure adequate lighting for proper examination' },
  { id: 'prep_comfort', label: 'Patient comfortable', shortLabel: 'Comfort', type: 'boolean', mandatory: false, section: 'preparation', clinicalGuide: 'Patient is positioned comfortably' },
  { id: 'prep_exposure', label: 'Exposure adequate', shortLabel: 'Exposure', type: 'boolean', mandatory: true, section: 'preparation', clinicalGuide: 'Only expose area being examined; maintain dignity' },
  { id: 'prep_privacy', label: 'Privacy maintained', shortLabel: 'Privacy', type: 'boolean', mandatory: true, section: 'preparation', clinicalGuide: 'Curtains closed, door shut, only necessary staff present' },
  { id: 'prep_hand_hygiene', label: 'Hand hygiene performed', shortLabel: 'Hand hygiene', type: 'boolean', mandatory: true, section: 'preparation', clinicalGuide: 'Hands washed or sanitized before patient contact' },
  { id: 'prep_ppe', label: 'PPE used', shortLabel: 'PPE', type: 'boolean', mandatory: false, section: 'preparation', clinicalGuide: 'Gloves, mask, apron as indicated by standard precautions' },
];

// ── Section B: General Appearance ─────────────────────────────────────────────

export const GENERAL_APPEARANCE_FIELDS: readonly GenExamField[] = [
  { id: 'appearance_overall', label: 'Overall appearance', shortLabel: 'Appearance', type: 'select', options: ['well', 'ill', 'toxic', 'distressed', 'cachectic', 'obese', 'comfortable', 'anxious', 'agitated'], mandatory: true, section: 'general_appearance', clinicalGuide: 'First impression of the patient at rest' },
  { id: 'consciousness', label: 'Consciousness level', shortLabel: 'Consciousness', type: 'select', options: ['alert', 'drowsy', 'obtunded', 'stuporous', 'unresponsive'], mandatory: true, section: 'general_appearance', clinicalGuide: 'Level of consciousness; use AVPU at minimum' },
  { id: 'orientation_time', label: 'Oriented to time', shortLabel: 'Time', type: 'boolean', mandatory: false, section: 'general_appearance', clinicalGuide: 'Patient knows current date/time' },
  { id: 'orientation_place', label: 'Oriented to place', shortLabel: 'Place', type: 'boolean', mandatory: false, section: 'general_appearance', clinicalGuide: 'Patient knows where they are' },
  { id: 'orientation_person', label: 'Oriented to person', shortLabel: 'Person', type: 'boolean', mandatory: false, section: 'general_appearance', clinicalGuide: 'Patient knows who they are' },
  { id: 'mobility', label: 'Mobility', shortLabel: 'Mobility', type: 'select', options: ['independent', 'aided', 'wheelchair', 'bedridden', 'unable_to_assess'], mandatory: true, section: 'general_appearance', clinicalGuide: 'Patient mobility status' },
  { id: 'position', label: 'Position in bed', shortLabel: 'Position', type: 'select', options: ['supine', 'prone', 'sitting', 'tripod', 'left_lateral', 'right_lateral', 'knee_chest', 'unable_to_lie_flat', 'antalgic'], mandatory: false, section: 'general_appearance', clinicalGuide: 'Observe patient position; tripod suggests respiratory distress' },
  { id: 'nutritional_state', label: 'Nutritional state', shortLabel: 'Nutrition', type: 'select', options: ['normal', 'thin', 'cachectic', 'obese', 'morbid_obesity', 'malnourished', 'sam', 'mam'], mandatory: true, section: 'general_appearance', clinicalGuide: 'Clinical assessment of nutritional status; use anthropometry for objective measurement' },
  { id: 'hydration', label: 'Hydration status', shortLabel: 'Hydration', type: 'select', options: ['well_hydrated', 'mild_dehydration', 'moderate_dehydration', 'severe_dehydration'], mandatory: true, section: 'general_appearance', clinicalGuide: 'Assess skin turgor, mucous membranes, capillary refill' },
  { id: 'hygiene', label: 'Hygiene', shortLabel: 'Hygiene', type: 'select', options: ['good', 'fair', 'poor'], mandatory: false, section: 'general_appearance', clinicalGuide: 'Overall cleanliness and grooming' },
  { id: 'odour', label: 'Body odour', shortLabel: 'Odour', type: 'select', options: ['normal', 'alcohol', 'ketotic', 'uraemic', 'foul', 'hepatic', 'other'], mandatory: false, section: 'general_appearance', clinicalGuide: 'Distinctive odours may suggest underlying conditions' },
  { id: 'distress_level', label: 'Level of distress', shortLabel: 'Distress', type: 'select', options: ['none', 'mild', 'moderate', 'severe'], mandatory: true, section: 'general_appearance', clinicalGuide: 'Subjective assessment of patient distress' },
  { id: 'speech', label: 'Speech pattern', shortLabel: 'Speech', type: 'select', options: ['normal', 'slurred', 'dysarthric', 'aphasic', 'hoarse'], mandatory: false, section: 'general_appearance', clinicalGuide: 'Assess speech for neurological or respiratory clues' },
  { id: 'cooperation', label: 'Cooperation', shortLabel: 'Cooperation', type: 'select', options: ['cooperative', 'reluctant', 'uncooperative'], mandatory: false, section: 'general_appearance', clinicalGuide: 'Patient willingness to participate in examination' },
  { id: 'breathing_pattern', label: 'Breathing pattern', shortLabel: 'Breathing', type: 'select', options: ['normal', 'laboured', 'kussmaul', 'cheyne_stokes', 'biot'], mandatory: false, section: 'general_appearance', clinicalGuide: 'Observe respiratory pattern at rest' },
];

// ── Section C: Anthropometry ─────────────────────────────────────────────────

export const ANTHROPOMETRY_FIELDS: readonly GenExamField[] = [
  { id: 'weight', label: 'Weight', shortLabel: 'Weight', type: 'number', mandatory: true, section: 'anthropometry', clinicalGuide: 'Record in kilograms; use appropriate scale' },
  { id: 'height', label: 'Height', shortLabel: 'Height', type: 'number', mandatory: true, section: 'anthropometry', clinicalGuide: 'Standing height in cm for patients ≥2 years' },
  { id: 'length', label: 'Length (supine)', shortLabel: 'Length', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'Supine length in cm for patients <2 years', ageMaxMonths: 24 },
  { id: 'head_circumference', label: 'Head circumference', shortLabel: 'OFC', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'Maximum occipitofrontal circumference in cm', ageMaxMonths: 24 },
  { id: 'chest_circumference', label: 'Chest circumference', shortLabel: 'Chest circ.', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'At nipple level in cm; neonates only', ageMaxMonths: 1 },
  { id: 'muac', label: 'MUAC', shortLabel: 'MUAC', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'Mid-upper arm circumference in cm; 6 months to 5 years', ageMinMonths: 6, ageMaxMonths: 60 },
  { id: 'bmi', label: 'BMI', shortLabel: 'BMI', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'Automatically calculated from weight and height if both provided; interpret using WHO standards', ageMinMonths: 24 },
  { id: 'waist_circumference', label: 'Waist circumference', shortLabel: 'Waist', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'Measured at midpoint between lowest rib and iliac crest' },
  { id: 'hip_circumference', label: 'Hip circumference', shortLabel: 'Hip', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'Measured at the widest part of the buttocks' },
  { id: 'abdominal_circumference', label: 'Abdominal circumference', shortLabel: 'Abdo circ.', type: 'number', mandatory: false, section: 'anthropometry', clinicalGuide: 'Measured at the level of the umbilicus' },
];

// ── Section D: Vital Signs ─────────────────────────────────────────────────────

export const VITAL_SIGN_FIELDS: readonly GenExamField[] = [
  { id: 'temperature', label: 'Temperature', shortLabel: 'Temp', type: 'number', mandatory: true, section: 'vital_signs', clinicalGuide: 'Record in Celsius; note method (axillary/oral/rectal/tympanic)' },
  { id: 'temperature_method', label: 'Temperature method', shortLabel: 'Method', type: 'select', options: ['axillary', 'oral', 'rectal', 'tympanic', 'temporal'], mandatory: true, section: 'vital_signs', clinicalGuide: 'Method affects normal range' },
  { id: 'heart_rate', label: 'Heart rate', shortLabel: 'HR', type: 'number', mandatory: true, section: 'vital_signs', clinicalGuide: 'Palpate radial pulse for 30 seconds; if irregular, auscultate apex for full minute' },
  { id: 'heart_rhythm', label: 'Heart rhythm', shortLabel: 'Rhythm', type: 'select', options: ['regular', 'irregular', 'regularly_irregular', 'irregularly_irregular'], mandatory: false, section: 'vital_signs', clinicalGuide: 'Note any irregularity; suggest ECG if uncertain' },
  { id: 'respiratory_rate', label: 'Respiratory rate', shortLabel: 'RR', type: 'number', mandatory: true, section: 'vital_signs', clinicalGuide: 'Count for 60 seconds without patient awareness' },
  { id: 'respiratory_pattern', label: 'Respiratory pattern', shortLabel: 'Pattern', type: 'select', options: ['regular', 'kussmaul', 'cheyne_stokes', 'biot', 'apneustic'], mandatory: false, section: 'vital_signs', clinicalGuide: 'Observe pattern over one full minute' },
  { id: 'bp_systolic', label: 'Systolic BP', shortLabel: 'SBP', type: 'number', mandatory: true, section: 'vital_signs', clinicalGuide: 'Systolic blood pressure in mmHg' },
  { id: 'bp_diastolic', label: 'Diastolic BP', shortLabel: 'DBP', type: 'number', mandatory: true, section: 'vital_signs', clinicalGuide: 'Diastolic blood pressure in mmHg' },
  { id: 'bp_cuff_size', label: 'BP cuff size', shortLabel: 'Cuff', type: 'select', options: ['adult', 'child', 'infant', 'thigh'], mandatory: false, section: 'vital_signs', clinicalGuide: 'Cuff bladder should encircle 80% of the arm' },
  { id: 'bp_position', label: 'BP position', shortLabel: 'Position', type: 'select', options: ['sitting', 'lying', 'standing'], mandatory: false, section: 'vital_signs', clinicalGuide: 'Postural drop measured in standing if clinically indicated' },
  { id: 'spo2', label: 'SpO₂', shortLabel: 'SpO₂', type: 'number', mandatory: true, section: 'vital_signs', clinicalGuide: 'Oxygen saturation on room air unless otherwise noted' },
  { id: 'spo2_on_oxygen', label: 'On oxygen?', shortLabel: 'O₂', type: 'boolean', mandatory: false, section: 'vital_signs', clinicalGuide: 'Document FiO₂ or flow rate if applicable', activatesFields: ['spo2_fio2'] },
  { id: 'spo2_fio2', label: 'FiO₂ / flow rate', shortLabel: 'FiO₂', type: 'text', mandatory: false, section: 'vital_signs', clinicalGuide: 'Oxygen delivery method and rate' },
  { id: 'pain_score', label: 'Pain score', shortLabel: 'Pain', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: 'Use age-appropriate scale; NRS 0-10 for adults' },
  { id: 'pain_scale', label: 'Pain scale type', shortLabel: 'Scale', type: 'select', options: ['nrs', 'wong_baker', 'flacc', 'cries', 'comfort'], mandatory: false, section: 'vital_signs', clinicalGuide: 'Select scale appropriate for patient age and cognition' },
  { id: 'blood_glucose', label: 'Blood glucose', shortLabel: 'BG', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: 'Random or fasting; note time of last meal' },
  { id: 'bg_fasting', label: 'Fasting glucose?', shortLabel: 'Fasting', type: 'boolean', mandatory: false, section: 'vital_signs', clinicalGuide: 'Fasting ≥8 hours' },
  { id: 'capillary_refill', label: 'Capillary refill', shortLabel: 'CRT', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: 'Press nail bed for 5 seconds; normal <2 seconds' },
  { id: 'cap_refill_site', label: 'CRT site', shortLabel: 'Site', type: 'select', options: ['finger', 'toe', 'sternum'], mandatory: false, section: 'vital_signs', clinicalGuide: 'Sternum more reliable in shock' },
  { id: 'avpu', label: 'AVPU', shortLabel: 'AVPU', type: 'select', options: ['alert', 'voice', 'pain', 'unresponsive'], mandatory: true, section: 'vital_signs', clinicalGuide: 'Alert? Responds to Voice? Responds to Pain? Unresponsive?' },
  { id: 'gcs_eye', label: 'GCS — Eye', shortLabel: 'GCS-E', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: '1=No opening, 2=To pain, 3=To voice, 4=Spontaneous' },
  { id: 'gcs_verbal', label: 'GCS — Verbal', shortLabel: 'GCS-V', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: '1=None, 2=Sounds, 3=Words, 4=Confused, 5=Oriented' },
  { id: 'gcs_motor', label: 'GCS — Motor', shortLabel: 'GCS-M', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: '1=None, 2=Extension, 3=Flexion, 4=Withdrawal, 5=Localizes, 6=Obeys' },
  { id: 'urine_output', label: 'Urine output', shortLabel: 'U/O', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: 'mL over specified period' },
  { id: 'urine_output_period', label: 'Urine output period', shortLabel: 'Period', type: 'number', mandatory: false, section: 'vital_signs', clinicalGuide: 'Hours over which output was measured' },
];

// ── Section E: Constitutional Signs ──────────────────────────────────────────

export const CONSTITUTIONAL_SIGN_FIELDS: readonly GenExamField[] = [
  // Pallor
  { id: 'cs_pallor', label: 'Pallor', shortLabel: 'Pallor', type: 'select', options: ['absent', 'mild', 'moderate', 'severe'], mandatory: true, section: 'constitutional_signs', clinicalGuide: 'Observe conjunctiva, palmar creases, nail beds, tongue', activatesFields: ['cs_pallor_site'] },
  { id: 'cs_pallor_site', label: 'Pallor site', shortLabel: 'Site', type: 'multiselect', options: ['conjunctiva', 'palm', 'nail_bed', 'tongue', 'generalized'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Most reliable in conjunctiva and palmar creases' },

  // Jaundice
  { id: 'cs_jaundice', label: 'Jaundice', shortLabel: 'Jaundice', type: 'select', options: ['absent', 'mild', 'moderate', 'severe'], mandatory: true, section: 'constitutional_signs', clinicalGuide: 'Best detected in natural light; sclerae first, then skin', activatesFields: ['cs_jaundice_site'] },
  { id: 'cs_jaundice_site', label: 'Jaundice site', shortLabel: 'Site', type: 'select', options: ['sclerae', 'skin', 'mucosa'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Scleral icterus seen at bilirubin ~2-3 mg/dL' },

  // Cyanosis
  { id: 'cs_cyanosis', label: 'Cyanosis', shortLabel: 'Cyanosis', type: 'select', options: ['absent', 'mild', 'moderate', 'severe'], mandatory: true, section: 'constitutional_signs', clinicalGuide: 'Central (tongue/lips) vs peripheral (nail beds/extremities)', activatesFields: ['cs_cyanosis_type'] },
  { id: 'cs_cyanosis_type', label: 'Cyanosis type', shortLabel: 'Type', type: 'select', options: ['central', 'peripheral'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Central = desaturated Hb ≥5 g/dL; peripheral = slow flow' },

  // Clubbing
  { id: 'cs_clubbing', label: 'Clubbing', shortLabel: 'Clubbing', type: 'select', options: ['absent', 'grade_1', 'grade_2', 'grade_3', 'grade_4'], mandatory: true, section: 'constitutional_signs', clinicalGuide: 'Loss of Schamroth sign; increased hyponychial angle >180°', activatesFields: ['cs_clubbing_schamroth'] },
  { id: 'cs_clubbing_schamroth', label: 'Schamroth sign', shortLabel: 'Schamroth', type: 'select', options: ['negative', 'positive'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Normally diamond-shaped window when nail beds opposed; loss = clubbing' },

  // Lymphadenopathy — general comment
  { id: 'cs_lymphadenopathy', label: 'Lymphadenopathy', shortLabel: 'Lymph nodes', type: 'select', options: ['absent', 'localized', 'generalized'], mandatory: true, section: 'constitutional_signs', clinicalGuide: 'Palpate cervical, axillary, inguinal, epitrochlear, supraclavicular', activatesFields: ['cs_ln_site'] },
  { id: 'cs_ln_site', label: 'Lymph node site', shortLabel: 'Site', type: 'multiselect', options: ['cervical', 'axillary', 'inguinal', 'supraclavicular', 'epitrochlear', 'generalized'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Supraclavicular nodes most significant for malignancy' },

  // Peripheral oedema
  { id: 'cs_oedema', label: 'Peripheral oedema', shortLabel: 'Oedema', type: 'select', options: ['absent', 'mild', 'moderate', 'severe'], mandatory: true, section: 'constitutional_signs', clinicalGuide: 'Press over bony prominence for 5 seconds; grade pitting depth', activatesFields: ['cs_oedema_pitting', 'cs_oedema_site'] },
  { id: 'cs_oedema_pitting', label: 'Pitting oedema', shortLabel: 'Pitting', type: 'select', options: ['non_pitting', 'pitting'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Pitting suggests volume overload; non-pitting suggests lymphatic/thyroid' },
  { id: 'cs_oedema_site', label: 'Oedema site', shortLabel: 'Site', type: 'multiselect', options: ['pedal', 'ankle', 'leg', 'sacral', 'facial', 'generalized'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Dependent areas first; sacral in bedridden patients' },

  // Dehydration
  { id: 'cs_dehydration', label: 'Dehydration', shortLabel: 'Dehydration', type: 'select', options: ['absent', 'mild', 'moderate', 'severe'], mandatory: true, section: 'constitutional_signs', clinicalGuide: 'Skin turgor, sunken eyes, dry mucosa, capillary refill, thirst', activatesFields: ['cs_dehydration_skin_turgor'] },
  { id: 'cs_dehydration_skin_turgor', label: 'Skin turgor', shortLabel: 'Turgor', type: 'select', options: ['normal', 'reduced', 'very_reduced'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Pinch abdominal skin; slow return suggests ≥5% dehydration' },

  // Cachexia
  { id: 'cs_cachexia', label: 'Cachexia', shortLabel: 'Cachexia', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Generalized wasting; loss of muscle mass and subcutaneous fat' },

  // Additional constitutional signs
  { id: 'cs_pigmentation', label: 'Pigmentation changes', shortLabel: 'Pigmentation', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Addisonian, post-inflammatory, medication-related' },
  { id: 'cs_rash', label: 'Rash/skin lesions', shortLabel: 'Rash', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Describe morphology, distribution, and any associated symptoms' },
  { id: 'cs_petechiae', label: 'Petechiae/purpura', shortLabel: 'Petechiae', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Non-blanching; petechiae <2mm, purpura 2-10mm, ecchymosis >10mm' },
  { id: 'cs_spider_naevi', label: 'Spider naevi', shortLabel: 'Spider naevi', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Central arteriole with radiating vessels; blanches on pressure; suggests hyperoestrogenism in liver disease' },
  { id: 'cs_palmar_erythema', label: 'Palmar erythema', shortLabel: 'Palmar erythema', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Hypothenar and thenar eminences; liver disease, pregnancy, hyperthyroidism' },
  { id: 'cs_muscle_wasting', label: 'Muscle wasting', shortLabel: 'Wasting', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Temporalis, thenar, hypothenar, interossei, quadriceps' },
  { id: 'cs_tremor', label: 'Tremor', shortLabel: 'Tremor', type: 'select', options: ['absent', 'resting', 'intention', 'postural'], mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Observe hands at rest, outstretched, and during finger-to-nose' },
  { id: 'cs_asterixis', label: 'Asterixis (flapping tremor)', shortLabel: 'Asterixis', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Liver flap; patient extends wrists with fingers spread for 30 seconds' },
  { id: 'cs_goitre', label: 'Goitre', shortLabel: 'Goitre', type: 'boolean', mandatory: false, section: 'constitutional_signs', clinicalGuide: 'Inspect front of neck; palpate thyroid from behind' },
];

// ── Master registry ───────────────────────────────────────────────────────────

export const GENERAL_EXAMINATION_SECTIONS: Record<string, { label: string; fields: readonly GenExamField[] }> = {
  preparation: { label: 'Preparation', fields: PREPARATION_FIELDS },
  general_appearance: { label: 'General Appearance', fields: GENERAL_APPEARANCE_FIELDS },
  anthropometry: { label: 'Anthropometry', fields: ANTHROPOMETRY_FIELDS },
  vital_signs: { label: 'Vital Signs', fields: VITAL_SIGN_FIELDS },
  constitutional_signs: { label: 'Constitutional Signs', fields: CONSTITUTIONAL_SIGN_FIELDS },
};

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function getGenExamField(id: string): GenExamField | undefined {
  for (const section of Object.values(GENERAL_EXAMINATION_SECTIONS)) {
    const found = section.fields.find(f => f.id === id);
    if (found) return found;
  }
  return undefined;
}

export function getMandatoryGenExamFields(): GenExamField[] {
  const result: GenExamField[] = [];
  for (const section of Object.values(GENERAL_EXAMINATION_SECTIONS)) {
    for (const field of section.fields) {
      if (field.mandatory) result.push(field);
    }
  }
  return result;
}

export function getActiveGenExamFields(ageMonths?: number, sex?: string): GenExamField[] {
  const result: GenExamField[] = [];
  for (const section of Object.values(GENERAL_EXAMINATION_SECTIONS)) {
    for (const field of section.fields) {
      if (field.ageMinMonths !== undefined && ageMonths !== undefined && ageMonths < field.ageMinMonths) continue;
      if (field.ageMaxMonths !== undefined && ageMonths !== undefined && ageMonths > field.ageMaxMonths) continue;
      if (field.sexRequired !== undefined && sex !== undefined && sex !== field.sexRequired) continue;
      result.push(field);
    }
  }
  return result;
}

export function getConstitutionalSignId(fieldId: string): ConstitutionalSignId | undefined {
  const map: Record<string, ConstitutionalSignId> = {
    cs_pallor: 'pallor',
    cs_jaundice: 'jaundice',
    cs_cyanosis: 'cyanosis',
    cs_clubbing: 'clubbing',
    cs_lymphadenopathy: 'lymphadenopathy',
    cs_oedema: 'peripheral_oedema',
    cs_dehydration: 'dehydration',
    cs_pigmentation: 'pigmentation',
    cs_rash: 'rash',
    cs_petechiae: 'petechiae',
    cs_spider_naevi: 'spider_naevi',
    cs_palmar_erythema: 'palmar_erythema',
    cs_muscle_wasting: 'muscle_wasting',
    cs_tremor: 'tremor',
    cs_asterixis: 'asterixis',
    cs_goitre: 'goitre',
    cs_cachexia: 'cachexia',
  };
  return map[fieldId];
}
