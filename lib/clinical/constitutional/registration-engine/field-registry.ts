import type { Sex, AgeGroup, EncounterType, Department, ModuleType } from './types';

export type FieldVisibilityRule =
  | { type: 'sex'; values: Sex[] }
  | { type: 'age_group'; values: AgeGroup[] }
  | { type: 'age_min_months'; months: number }
  | { type: 'age_max_months'; months: number }
  | { type: 'encounter_type'; values: EncounterType[] }
  | { type: 'department'; values: Department[] }
  | { type: 'module_active'; module: ModuleType }
  | { type: 'module_inactive'; module: ModuleType }
  | { type: 'pregnancy'; status: ('not_pregnant' | 'pregnant' | 'postpartum')[] }
  | { type: 'reproductive_stage'; values: string[] }
  | { type: 'mode_of_arrival'; values: string[] }
  | { type: 'triage_category'; values: string[] }
  | { type: 'field_equals'; field: string; value: unknown }
  | { type: 'field_not_empty'; field: string }
  | { type: 'field_in'; field: string; values: unknown[] }
  | { type: 'always' }
  | { type: 'never' };

export type FieldAutofillRule =
  | { type: 'calculate_from'; formula: string }
  | { type: 'copy_from_previous' }
  | { type: 'derive_from_lmp' }
  | { type: 'set_default'; value: unknown }
  | { type: 'increment' };

export type FieldType =
  | 'text' | 'number' | 'select' | 'multi_select' | 'date'
  | 'boolean' | 'radio' | 'chips' | 'tel' | 'email'
  | 'hierarchy' | 'calculated';

export interface FieldOption {
  label: string;
  value: string;
  icon?: string;
  description?: string;
  activationRules?: FieldVisibilityRule[];
}

export interface FieldDefinition {
  id: string;
  stage: string;
  section: string;
  type: FieldType;
  label: string;
  shortLabel?: string;
  placeholder?: string;
  description?: string;
  options?: FieldOption[];
  visibility: FieldVisibilityRule[];
  required: FieldVisibilityRule[];
  hideWhen: FieldVisibilityRule[];
  autofill?: FieldAutofillRule;
  dependsOn?: { field: string; value: unknown }[];
  universalAnswer: boolean;
  validation?: { min?: number; max?: number; pattern?: string; required?: boolean };
  order: number;
}

const ALWAYS: FieldVisibilityRule[] = [{ type: 'always' }];
const NEVER: FieldVisibilityRule[] = [{ type: 'never' }];

export const REGISTRATION_FIELDS: Record<string, FieldDefinition> = {

  // ════════════════════════════════════════════
  // STAGE 1: IDENTITY
  // ════════════════════════════════════════════

  patient_name: {
    id: 'patient_name', stage: 'identity', section: 'identity',
    type: 'text', label: 'Patient Name', placeholder: 'Enter full name',
    description: 'Full legal name as per identification document',
    visibility: [{ type: 'always' }],
    required: [{ type: 'always' }],
    hideWhen: [{ type: 'field_equals', field: 'unknown_patient', value: true }],
    universalAnswer: true, order: 1,
  },

  unknown_patient: {
    id: 'unknown_patient', stage: 'identity', section: 'identity',
    type: 'boolean', label: 'Unknown Patient', description: 'Toggle for unidentified patients',
    options: [
      { label: 'Known Patient', value: 'false' },
      { label: 'Unknown Patient', value: 'true' },
    ],
    visibility: ALWAYS, required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 2,
  },

  hospital_number: {
    id: 'hospital_number', stage: 'identity', section: 'identity',
    type: 'text', label: 'Hospital Number', placeholder: 'Auto-generated or enter',
    description: 'Unique hospital identification number',
    visibility: ALWAYS, required: [{ type: 'always' }],
    hideWhen: [{ type: 'field_equals', field: 'unknown_patient', value: true }],
    autofill: { type: 'increment' },
    universalAnswer: true, order: 3,
  },

  date_of_birth: {
    id: 'date_of_birth', stage: 'identity', section: 'identity',
    type: 'date', label: 'Date of Birth',
    description: 'Leave blank if age is entered; DOB will be calculated',
    visibility: ALWAYS,
    required: [{ type: 'field_not_empty', field: 'age' }],
    hideWhen: [{ type: 'field_not_empty', field: 'age' }],
    universalAnswer: true, order: 4,
  },

  age: {
    id: 'age', stage: 'identity', section: 'identity',
    type: 'number', label: 'Age',
    description: 'Enter age if DOB unknown',
    visibility: ALWAYS,
    required: [{ type: 'field_not_empty', field: 'date_of_birth' }],
    hideWhen: [{ type: 'field_not_empty', field: 'date_of_birth' }],
    validation: { min: 0, max: 150 },
    universalAnswer: true, order: 5,
  },

  age_unit: {
    id: 'age_unit', stage: 'identity', section: 'identity',
    type: 'select', label: 'Age Unit',
    options: [
      { label: 'Years', value: 'years' },
      { label: 'Months', value: 'months' },
      { label: 'Days', value: 'days' },
    ],
    visibility: [{ type: 'field_not_empty', field: 'age' }],
    required: [{ type: 'field_not_empty', field: 'age' }],
    hideWhen: [{ type: 'field_not_empty', field: 'date_of_birth' }],
    universalAnswer: true, order: 6,
  },

  sex: {
    id: 'sex', stage: 'identity', section: 'identity',
    type: 'radio', label: 'Biological Sex',
    options: [
      { label: 'Male', value: 'male', icon: '♂' },
      { label: 'Female', value: 'female', icon: '♀' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 7,
  },

  // ════════════════════════════════════════════
  // STAGE 1B: REPRODUCTIVE STATUS
  // ════════════════════════════════════════════

  reproductive_status: {
    id: 'reproductive_status', stage: 'identity', section: 'reproductive',
    type: 'radio', label: 'Clinical Reproductive Status',
    description: 'Determines all downstream reproductive health modules',
    options: [
      { label: 'Pre-menarche', value: 'pre_menarche', icon: '⊘' },
      { label: 'Reproductive age', value: 'reproductive_age', icon: '♀' },
      { label: 'Post-menopausal', value: 'post_menopausal', icon: '⚥' },
      { label: 'Male', value: 'male', icon: '♂' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'sex', values: ['female'] }, { type: 'age_min_months', months: 120 }],
    required: [{ type: 'sex', values: ['female'] }, { type: 'age_min_months', months: 120 }],
    hideWhen: [{ type: 'sex', values: ['male', 'unknown'] }, { type: 'age_max_months', months: 119 }],
    universalAnswer: true, order: 8,
  },

  // ════════════════════════════════════════════
  // STAGE 1C: NEONATAL IDENTITY (visible when module_active=neonatal)
  // ════════════════════════════════════════════

  gestation_at_birth: {
    id: 'gestation_at_birth', stage: 'identity', section: 'neonatal_identity',
    type: 'number', label: 'Gestational age at birth (weeks)',
    description: 'Essential for corrected age calculation and growth assessment',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 9,
  },

  birth_weight: {
    id: 'birth_weight', stage: 'identity', section: 'neonatal_identity',
    type: 'number', label: 'Birth weight (kg)', placeholder: 'e.g. 2.3',
    description: 'Required for weight loss/gain assessment and medication dosing',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'age_min_months', months: 24 }],
    universalAnswer: true, order: 10,
  },

  birth_length: {
    id: 'birth_length', stage: 'identity', section: 'neonatal_identity',
    type: 'number', label: 'Birth length (cm)', placeholder: 'e.g. 48',
    description: 'Used for growth trajectory assessment',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'field_not_empty', field: 'birth_weight' }],
    hideWhen: [{ type: 'age_min_months', months: 24 }],
    universalAnswer: true, order: 11,
  },

  birth_head_circumference: {
    id: 'birth_head_circumference', stage: 'identity', section: 'neonatal_identity',
    type: 'number', label: 'Head circumference at birth (cm)', placeholder: 'e.g. 34',
    description: 'Essential for microcephaly/macrocephaly screening',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'field_not_empty', field: 'birth_weight' }],
    hideWhen: [{ type: 'age_min_months', months: 24 }],
    universalAnswer: true, order: 12,
  },

  // ════════════════════════════════════════════
  // STAGE 1D: BIRTH HISTORY (neonates only)
  // ════════════════════════════════════════════

  birth_place: {
    id: 'birth_place', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Place of delivery',
    description: 'Determines referral communication needs',
    options: [
      { label: 'Hospital', value: 'hospital' },
      { label: 'Health centre', value: 'health_centre' },
      { label: 'Clinic', value: 'clinic' },
      { label: 'Home', value: 'home' },
      { label: 'On the way', value: 'on_the_way' },
      { label: 'Other', value: 'other' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 13,
  },

  birth_attendant: {
    id: 'birth_attendant', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Birth attendant',
    options: [
      { label: 'Doctor', value: 'doctor' },
      { label: 'Midwife', value: 'midwife' },
      { label: 'Nurse', value: 'nurse' },
      { label: 'TBA', value: 'tba' },
      { label: 'Relative', value: 'relative' },
      { label: 'Unassisted', value: 'unassisted' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 14,
  },

  labour_onset: {
    id: 'labour_onset', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Onset of labour',
    options: [
      { label: 'Spontaneous', value: 'spontaneous' },
      { label: 'Induced', value: 'induced' },
      { label: 'No labour (C-section)', value: 'no_labour_caesarean' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 15,
  },

  delivery_mode: {
    id: 'delivery_mode', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Mode of delivery',
    options: [
      { label: 'SVD (spontaneous vaginal)', value: 'svd' },
      { label: 'Vacuum extraction', value: 'vacuum' },
      { label: 'Forceps delivery', value: 'forceps' },
      { label: 'C-section (elective)', value: 'caesarean_elective' },
      { label: 'C-section (emergency)', value: 'caesarean_emergency' },
      { label: 'Breech delivery', value: 'breech' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 16,
  },

  liquor_appearance: {
    id: 'liquor_appearance', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Liquor appearance',
    options: [
      { label: 'Clear', value: 'clear' },
      { label: 'Meconium-stained', value: 'meconium_stained' },
      { label: 'Blood-stained', value: 'blood_stained' },
      { label: 'Foul-smelling', value: 'foul_smelling' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: NEVER, hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 17,
  },

  apgar_1min: {
    id: 'apgar_1min', stage: 'identity', section: 'birth_history',
    type: 'number', label: 'APGAR at 1 minute',
    description: 'Standard neonatal assessment — scores 0-10',
    validation: { min: 0, max: 10 },
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'field_not_empty', field: 'birth_weight' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 18,
  },

  apgar_5min: {
    id: 'apgar_5min', stage: 'identity', section: 'birth_history',
    type: 'number', label: 'APGAR at 5 minutes',
    description: 'Score <7 at 5 minutes indicates need for ongoing assessment',
    validation: { min: 0, max: 10 },
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'field_not_empty', field: 'apgar_1min' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 19,
  },

  apgar_10min: {
    id: 'apgar_10min', stage: 'identity', section: 'birth_history',
    type: 'number', label: 'APGAR at 10 minutes',
    description: 'Only required if 5-minute APGAR < 7',
    validation: { min: 0, max: 10 },
    visibility: [{ type: 'age_min_months', months: 0 }, { type: 'field_equals', field: 'apgar_5min', value: null }],
    required: [{ type: 'field_equals', field: 'apgar_5min', value: null }],
    hideWhen: [{ type: 'field_equals', field: 'apgar_5min', value: null }],
    universalAnswer: true, order: 20,
  },

  cried_immediately: {
    id: 'cried_immediately', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Did the baby cry immediately after birth?',
    options: [
      { label: 'Yes, strong cry', value: 'yes_strong' },
      { label: 'Yes, weak cry', value: 'yes_weak' },
      { label: 'No', value: 'no' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 21,
  },

  resuscitation_at_birth: {
    id: 'resuscitation_at_birth', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Resuscitation required at birth?',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Stimulation only', value: 'stimulation' },
      { label: 'Bag-mask ventilation', value: 'bag_mask' },
      { label: 'Chest compressions', value: 'chest_compressions' },
      { label: 'Intubation', value: 'intubation' },
      { label: 'Medications', value: 'medications' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 22,
  },

  nicu_admission: {
    id: 'nicu_admission', stage: 'identity', section: 'birth_history',
    type: 'boolean', label: 'Admitted to NICU?',
    description: 'Determines NICU follow-up and developmental surveillance plan',
    options: [
      { label: 'No', value: 'false' },
      { label: 'Yes', value: 'true' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 23,
  },

  nicu_reason: {
    id: 'nicu_reason', stage: 'identity', section: 'birth_history',
    type: 'select', label: 'Reason for NICU admission',
    options: [
      { label: 'Prematurity', value: 'prematurity' },
      { label: 'Respiratory distress', value: 'respiratory_distress' },
      { label: 'Sepsis evaluation', value: 'sepsis' },
      { label: 'Jaundice monitoring', value: 'jaundice' },
      { label: 'Hypoglycaemia monitoring', value: 'hypoglycaemia' },
      { label: 'Congenital anomaly', value: 'congenital_anomaly' },
      { label: 'Birth asphyxia', value: 'birth_asphyxia' },
      { label: 'Low birth weight', value: 'low_birth_weight' },
      { label: 'Other', value: 'other' },
    ],
    visibility: [{ type: 'field_equals', field: 'nicu_admission', value: true }],
    required: [{ type: 'field_equals', field: 'nicu_admission', value: true }],
    hideWhen: [{ type: 'field_equals', field: 'nicu_admission', value: false }],
    universalAnswer: true, order: 24,
  },

  // ════════════════════════════════════════════
  // STAGE 1E: PERINATAL HISTORY (neonates only)
  // ════════════════════════════════════════════

  antenatal_care: {
    id: 'antenatal_care', stage: 'identity', section: 'perinatal_history',
    type: 'select', label: 'Antenatal care (ANC) attendance',
    description: 'Linked to pregnancy complication risk assessment',
    options: [
      { label: 'Yes, regular', value: 'regular' },
      { label: 'Yes, irregular', value: 'irregular' },
      { label: 'None', value: 'none' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 25,
  },

  maternal_illness_pregnancy: {
    id: 'maternal_illness_pregnancy', stage: 'identity', section: 'perinatal_history',
    type: 'multi_select', label: 'Maternal illness during pregnancy',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Hypertension', value: 'hypertension' },
      { label: 'Diabetes (GDM)', value: 'diabetes' },
      { label: 'Malaria', value: 'malaria' },
      { label: 'HIV', value: 'hiv' },
      { label: 'Syphilis', value: 'syphilis' },
      { label: 'UTI', value: 'uti' },
      { label: 'Anaemia', value: 'anaemia' },
      { label: 'Other', value: 'other' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: NEVER, hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 26,
  },

  medications_in_pregnancy: {
    id: 'medications_in_pregnancy', stage: 'identity', section: 'perinatal_history',
    type: 'multi_select', label: 'Medications during pregnancy',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Iron / Folate', value: 'iron_folate' },
      { label: 'Antihypertensives', value: 'antihypertensives' },
      { label: 'Antimalarials (IPTp)', value: 'antimalarials' },
      { label: 'ART', value: 'art' },
      { label: 'Antibiotics', value: 'antibiotics' },
      { label: 'Other', value: 'other' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: NEVER, hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 27,
  },

  vitamin_k_given: {
    id: 'vitamin_k_given', stage: 'identity', section: 'perinatal_history',
    type: 'boolean', label: 'Vitamin K given at birth?',
    description: 'Standard prophylaxis for haemorrhagic disease of newborn',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 28,
  },

  birth_vaccinations: {
    id: 'birth_vaccinations', stage: 'identity', section: 'perinatal_history',
    type: 'boolean', label: 'BCG and OPV0 given at birth?',
    description: 'Standard birth immunizations per EPI schedule',
    options: [
      { label: 'Both given', value: 'both' },
      { label: 'BCG only', value: 'bcg_only' },
      { label: 'OPV0 only', value: 'opv0_only' },
      { label: 'None given', value: 'none' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hideWhen: [{ type: 'module_inactive', module: 'neonatal' }],
    universalAnswer: true, order: 29,
  },

  pregnancy_related: {
    id: 'pregnancy_related', stage: 'patient_context', section: 'reproductive',
    type: 'radio', label: 'Could this visit be pregnancy-related?',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
      { label: 'Unsure', value: 'unsure' },
    ],
    visibility: [
      { type: 'reproductive_stage', values: ['reproductive_age'] },
    ],
    required: [{ type: 'reproductive_stage', values: ['reproductive_age'] }],
    hideWhen: [{ type: 'module_inactive', module: 'female' }],
    universalAnswer: true, order: 9,
  },

  are_you_pregnant: {
    id: 'are_you_pregnant', stage: 'patient_context', section: 'reproductive',
    type: 'radio', label: 'Are you pregnant?',
    options: [
      { label: 'No', value: 'not_pregnant' },
      { label: 'Yes', value: 'pregnant' },
      { label: 'Unsure', value: 'unsure' },
      { label: 'N/A — Male', value: 'not_applicable' },
    ],
    visibility: [
      { type: 'reproductive_stage', values: ['reproductive_age'] },
      { type: 'field_equals', field: 'pregnancy_related', value: 'yes' },
    ],
    required: [{ type: 'field_equals', field: 'pregnancy_related', value: 'yes' }],
    hideWhen: [
      { type: 'field_equals', field: 'pregnancy_related', value: 'no' },
      { type: 'field_equals', field: 'pregnancy_related', value: 'unsure' },
    ],
    universalAnswer: true, order: 10,
  },

  postpartum_status: {
    id: 'postpartum_status', stage: 'patient_context', section: 'reproductive',
    type: 'select', label: 'Postpartum Status',
    options: [
      { label: 'Not postpartum', value: 'not_postpartum' },
      { label: '< 6 weeks postpartum', value: 'early_postpartum' },
      { label: '6 weeks — 6 months', value: 'mid_postpartum' },
      { label: '> 6 months', value: 'late_postpartum' },
    ],
    visibility: [
      { type: 'field_equals', field: 'are_you_pregnant', value: 'not_pregnant' },
      { type: 'age_min_months', months: 144 },
      { type: 'sex', values: ['female'] },
    ],
    required: NEVER,
    hideWhen: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    universalAnswer: true, order: 11,
  },

  pregnancy_confirmation_method: {
    id: 'pregnancy_confirmation_method', stage: 'patient_context', section: 'pregnancy',
    type: 'radio', label: 'How was pregnancy confirmed?',
    options: [
      { label: 'Urine Pregnancy Test', value: 'upt' },
      { label: 'Ultrasound', value: 'ultrasound' },
      { label: 'Clinical Examination', value: 'clinical' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    required: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    hideWhen: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'not_pregnant' }],
    universalAnswer: true, order: 12,
  },

  lmp: {
    id: 'lmp', stage: 'patient_context', section: 'pregnancy',
    type: 'date', label: 'Last Menstrual Period (LMP)',
    description: 'First day of last menstrual period',
    visibility: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    required: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    hideWhen: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'not_pregnant' }],
    universalAnswer: true, order: 13,
  },

  dating_ultrasound: {
    id: 'dating_ultrasound', stage: 'patient_context', section: 'pregnancy',
    type: 'boolean', label: 'Was dating ultrasound performed?',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
    visibility: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 14,
  },

  gestational_age_weeks: {
    id: 'gestational_age_weeks', stage: 'patient_context', section: 'pregnancy',
    type: 'calculated', label: 'Gestational Age',
    description: 'Calculated from LMP or entered directly',
    visibility: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    required: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    hideWhen: NEVER,
    autofill: { type: 'derive_from_lmp' },
    universalAnswer: true, order: 15,
  },

  gravida: {
    id: 'gravida', stage: 'patient_context', section: 'obstetric_history',
    type: 'number', label: 'Gravida', placeholder: 'Number of pregnancies',
    visibility: [
      { type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' },
    ],
    required: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    hideWhen: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'not_pregnant' }],
    universalAnswer: true, order: 16,
  },

  para: {
    id: 'para', stage: 'patient_context', section: 'obstetric_history',
    type: 'number', label: 'Para', placeholder: 'Number of deliveries',
    visibility: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    required: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'pregnant' }],
    hideWhen: [{ type: 'field_equals', field: 'are_you_pregnant', value: 'not_pregnant' }],
    universalAnswer: true, order: 17,
  },

  // ════════════════════════════════════════════
  // STAGE 2B: DEMOGRAPHIC CONTEXT
  // ════════════════════════════════════════════

  marital_status: {
    id: 'marital_status', stage: 'patient_context', section: 'demographics',
    type: 'select', label: 'Marital Status',
    options: [
      { label: 'Single', value: 'single' },
      { label: 'Married', value: 'married' },
      { label: 'Divorced', value: 'divorced' },
      { label: 'Widowed', value: 'widowed' },
      { label: 'Separated', value: 'separated' },
      { label: 'Cohabiting', value: 'cohabiting' },
    ],
    visibility: [
      { type: 'age_min_months', months: 180 },
    ],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 18,
  },

  occupation: {
    id: 'occupation', stage: 'patient_context', section: 'demographics',
    type: 'text', label: 'Occupation', placeholder: 'Current occupation',
    visibility: [{ type: 'age_min_months', months: 216 }],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 19,
  },

  schooling: {
    id: 'schooling', stage: 'patient_context', section: 'demographics',
    type: 'select', label: 'Schooling Status',
    description: 'Shown instead of occupation for children and adolescents',
    options: [
      { label: 'Not in school', value: 'not_in_school' },
      { label: 'Daycare', value: 'daycare' },
      { label: 'Pre-primary', value: 'pre_primary' },
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Tertiary', value: 'tertiary' },
      { label: 'Not applicable', value: 'not_applicable' },
    ],
    visibility: [{ type: 'age_group', values: ['preschool', 'school_age', 'adolescent'] }],
    required: NEVER,
    hideWhen: [{ type: 'age_group', values: ['preterm_neonate', 'term_neonate', 'infant', 'toddler', 'adult', 'older_adult'] }],
    universalAnswer: true, order: 20,
  },

  previous_occupation: {
    id: 'previous_occupation', stage: 'patient_context', section: 'demographics',
    type: 'text', label: 'Previous Occupation',
    description: 'Shown for elderly patients',
    visibility: [{ type: 'age_group', values: ['older_adult'] }],
    required: NEVER, hideWhen: [
      { type: 'age_group', values: ['preterm_neonate', 'term_neonate', 'infant', 'toddler', 'preschool', 'school_age', 'adolescent', 'adult'] },
    ],
    universalAnswer: true, order: 21,
  },

  residence_country: {
    id: 'residence_country', stage: 'patient_context', section: 'residence',
    type: 'select', label: 'Country',
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 22,
  },

  residence_county: {
    id: 'residence_county', stage: 'patient_context', section: 'residence',
    type: 'select', label: 'County / State',
    visibility: [{ type: 'field_not_empty', field: 'residence_country' }],
    required: [{ type: 'field_not_empty', field: 'residence_country' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 23,
  },

  residence_subcounty: {
    id: 'residence_subcounty', stage: 'patient_context', section: 'residence',
    type: 'select', label: 'Subcounty / District',
    visibility: [{ type: 'field_not_empty', field: 'residence_county' }],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 24,
  },

  residence_town: {
    id: 'residence_town', stage: 'patient_context', section: 'residence',
    type: 'text', label: 'Town / City',
    visibility: [{ type: 'field_not_empty', field: 'residence_county' }],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 25,
  },

  residence_village: {
    id: 'residence_village', stage: 'patient_context', section: 'residence',
    type: 'text', label: 'Village / Estate',
    visibility: [{ type: 'field_not_empty', field: 'residence_town' }],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 26,
  },

  // ════════════════════════════════════════════
  // STAGE 2C: CONTACT & INFORMANT
  // ════════════════════════════════════════════

  patient_contact: {
    id: 'patient_contact', stage: 'patient_context', section: 'contact',
    type: 'tel', label: 'Patient Phone',
    visibility: [{ type: 'age_min_months', months: 144 }],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 27,
  },

  guardian_contact: {
    id: 'guardian_contact', stage: 'patient_context', section: 'contact',
    type: 'tel', label: 'Guardian / Parent Phone',
    visibility: [{ type: 'age_max_months', months: 216 }],
    required: [{ type: 'age_max_months', months: 216 }],
    hideWhen: [{ type: 'age_min_months', months: 217 }],
    universalAnswer: true, order: 28,
  },

  next_of_kin_name: {
    id: 'next_of_kin_name', stage: 'patient_context', section: 'contact',
    type: 'text', label: 'Next of Kin',
    placeholder: 'Full name',
    visibility: [{ type: 'age_min_months', months: 144 }],
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 29,
  },

  next_of_kin_contact: {
    id: 'next_of_kin_contact', stage: 'patient_context', section: 'contact',
    type: 'tel', label: 'Next of Kin Phone',
    visibility: [{ type: 'field_not_empty', field: 'next_of_kin_name' }],
    required: [{ type: 'field_not_empty', field: 'next_of_kin_name' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 30,
  },

  informant: {
    id: 'informant', stage: 'patient_context', section: 'contact',
    type: 'select', label: 'Informant',
    description: 'Who provided the history',
    options: [
      { label: 'Self', value: 'self' },
      { label: 'Mother', value: 'mother' },
      { label: 'Father', value: 'father' },
      { label: 'Guardian', value: 'guardian' },
      { label: 'Sibling', value: 'sibling' },
      { label: 'Spouse', value: 'spouse' },
      { label: 'Healthcare worker', value: 'healthcare_worker' },
      { label: 'Police', value: 'police' },
      { label: 'Other', value: 'other' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 31,
  },

  informant_reliability: {
    id: 'informant_reliability', stage: 'patient_context', section: 'contact',
    type: 'select', label: 'History Reliability',
    options: [
      { label: 'Good', value: 'good' },
      { label: 'Fair', value: 'fair' },
      { label: 'Poor', value: 'poor' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 32,
  },

  // ════════════════════════════════════════════
  // STAGE 2D: PEDIATRIC GROWTH (visible for neonates, infants, children)
  // ════════════════════════════════════════════

  current_weight: {
    id: 'current_weight', stage: 'patient_context', section: 'growth',
    type: 'number', label: 'Current weight (kg)',
    description: 'Required for medication dosing, hydration assessment, nutritional status',
    validation: { min: 0, max: 300 },
    visibility: [{ type: 'module_active', module: 'neonatal' }, { type: 'module_active', module: 'pediatric' }],
    required: [{ type: 'always' }],
    hideWhen: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    universalAnswer: true, order: 33,
  },

  current_height: {
    id: 'current_height', stage: 'patient_context', section: 'growth',
    type: 'number', label: 'Current height / length (cm)',
    validation: { min: 0, max: 250 },
    visibility: [{ type: 'field_not_empty', field: 'current_weight' }],
    required: [{ type: 'field_not_empty', field: 'current_weight' }],
    hideWhen: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    universalAnswer: true, order: 34,
  },

  current_head_circumference: {
    id: 'current_head_circumference', stage: 'patient_context', section: 'growth',
    type: 'number', label: 'Head circumference (cm)',
    description: 'Essential for children <2 years; also shown in neurology/developmental clinics',
    validation: { min: 0, max: 60 },
    visibility: [{ type: 'age_max_months', months: 24 }],
    required: [{ type: 'age_max_months', months: 24 }],
    hideWhen: [{ type: 'age_min_months', months: 25 }],
    universalAnswer: true, order: 35,
  },

  muac: {
    id: 'muac', stage: 'patient_context', section: 'growth',
    type: 'number', label: 'MUAC (cm)',
    description: 'Mid-Upper Arm Circumference — WHO malnutrition screening for 6mo–5yr',
    validation: { min: 0, max: 30 },
    visibility: [
      { type: 'age_min_months', months: 6 },
      { type: 'age_max_months', months: 60 },
    ],
    required: NEVER, hideWhen: [
      { type: 'age_max_months', months: 5 },
      { type: 'age_min_months', months: 61 },
    ],
    universalAnswer: true, order: 36,
  },

  growth_curve_trend: {
    id: 'growth_curve_trend', stage: 'patient_context', section: 'growth',
    type: 'select', label: 'Growth curve trend',
    description: 'Trajectory assessment — faltering growth is a red flag',
    options: [
      { label: 'Following curve well', value: 'following' },
      { label: 'Faltering / plateau', value: 'faltering' },
      { label: 'Crossing centiles downward', value: 'crossing_down' },
      { label: 'Always been small', value: 'always_small' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'field_not_empty', field: 'current_weight' }],
    required: [{ type: 'field_not_empty', field: 'current_weight' }],
    hideWhen: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    universalAnswer: true, order: 37,
  },

  // ════════════════════════════════════════════
  // STAGE 2E: NUTRITION & FEEDING
  // ════════════════════════════════════════════

  breastfeeding_status: {
    id: 'breastfeeding_status', stage: 'patient_context', section: 'nutrition',
    type: 'select', label: 'Breastfeeding status',
    description: 'Determines neonatal jaundice risk, growth monitoring, and maternal support needs',
    options: [
      { label: 'Exclusive breastfeeding', value: 'exclusive_bf' },
      { label: 'Mixed feeding (breast + formula)', value: 'mixed' },
      { label: 'Formula only', value: 'formula_only' },
      { label: 'Breastfeeding + complementary foods', value: 'bf_complementary' },
      { label: 'Weaned / not breastfeeding', value: 'weaned' },
      { label: 'Not applicable', value: 'not_applicable' },
    ],
    visibility: [{ type: 'age_max_months', months: 24 }],
    required: [{ type: 'age_max_months', months: 24 }],
    hideWhen: [{ type: 'age_min_months', months: 25 }],
    universalAnswer: true, order: 38,
  },

  formula_type: {
    id: 'formula_type', stage: 'patient_context', section: 'nutrition',
    type: 'text', label: 'Type of formula',
    placeholder: 'e.g. Nan 1, SMA, soya-based, specialty',
    visibility: [{ type: 'field_in', field: 'breastfeeding_status', values: ['mixed', 'formula_only'] }],
    required: NEVER,
    hideWhen: [{ type: 'field_in', field: 'breastfeeding_status', values: ['exclusive_bf', 'weaned', 'not_applicable'] }],
    universalAnswer: true, order: 39,
  },

  complementary_feeding: {
    id: 'complementary_feeding', stage: 'patient_context', section: 'nutrition',
    type: 'select', label: 'Complementary feeding started?',
    description: 'WHO recommends exclusive breastfeeding for 6 months',
    options: [
      { label: 'Not yet started (exclusive milk feeds)', value: 'not_started' },
      { label: 'Started complementary foods', value: 'started' },
      { label: 'Fully weaned onto solids', value: 'fully_weaned' },
      { label: 'Not applicable (age <6mo)', value: 'not_applicable' },
    ],
    visibility: [{ type: 'age_min_months', months: 6 }, { type: 'age_max_months', months: 24 }],
    required: [{ type: 'age_min_months', months: 6 }],
    hideWhen: [{ type: 'age_max_months', months: 5 }, { type: 'age_min_months', months: 25 }],
    universalAnswer: true, order: 40,
  },

  appetite: {
    id: 'appetite', stage: 'patient_context', section: 'nutrition',
    type: 'select', label: 'Current appetite',
    options: [
      { label: 'Good', value: 'good' },
      { label: 'Reduced', value: 'reduced' },
      { label: 'Poor / very little', value: 'poor' },
      { label: 'Excessive', value: 'excessive' },
      { label: 'Selective / picky eater', value: 'selective' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }, { type: 'module_active', module: 'pediatric' }],
    required: [{ type: 'field_not_empty', field: 'current_weight' }],
    hideWhen: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    universalAnswer: true, order: 41,
  },

  feeding_difficulties: {
    id: 'feeding_difficulties', stage: 'patient_context', section: 'nutrition',
    type: 'multi_select', label: 'Feeding difficulties',
    description: 'Identifies infants needing feeding therapy or speech-language referral',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Poor latch', value: 'poor_latch' },
      { label: 'Poor suck', value: 'poor_suck' },
      { label: 'Choking / gagging', value: 'choking' },
      { label: 'Vomiting / reflux', value: 'vomiting' },
      { label: 'Refusing feeds', value: 'refusal' },
      { label: 'Other', value: 'other' },
    ],
    visibility: [{ type: 'age_max_months', months: 24 }],
    required: NEVER,
    hideWhen: [{ type: 'age_min_months', months: 25 }],
    universalAnswer: true, order: 42,
  },

  // ════════════════════════════════════════════
  // STAGE 2F: IMMUNIZATION HISTORY
  // ════════════════════════════════════════════

  immunization_status: {
    id: 'immunization_status', stage: 'patient_context', section: 'immunization',
    type: 'select', label: 'Immunization status',
    description: 'Up-to-date status per EPI schedule and age',
    options: [
      { label: 'Up to date for age', value: 'up_to_date' },
      { label: 'Not up to date', value: 'not_up_to_date' },
      { label: 'Never vaccinated', value: 'never_vaccinated' },
      { label: 'Unknown', value: 'unknown' },
    ],
    visibility: [{ type: 'module_active', module: 'neonatal' }, { type: 'module_active', module: 'pediatric' }],
    required: [{ type: 'always' }],
    hideWhen: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    universalAnswer: true, order: 43,
  },

  immunization_card_available: {
    id: 'immunization_card_available', stage: 'patient_context', section: 'immunization',
    type: 'boolean', label: 'Immunization card / record available?',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
    visibility: [{ type: 'field_not_empty', field: 'immunization_status' }],
    required: [{ type: 'field_not_empty', field: 'immunization_status' }],
    hideWhen: [{ type: 'field_equals', field: 'immunization_status', value: 'unknown' }],
    universalAnswer: true, order: 44,
  },

  immunization_missed_doses: {
    id: 'immunization_missed_doses', stage: 'patient_context', section: 'immunization',
    type: 'boolean', label: 'Any missed or delayed doses?',
    description: 'Triggers catch-up schedule recommendation',
    options: [
      { label: 'No', value: 'false' },
      { label: 'Yes', value: 'true' },
    ],
    visibility: [{ type: 'field_equals', field: 'immunization_status', value: 'not_up_to_date' }],
    required: [{ type: 'field_equals', field: 'immunization_status', value: 'not_up_to_date' }],
    hideWhen: [{ type: 'field_equals', field: 'immunization_status', value: 'up_to_date' }],
    universalAnswer: true, order: 45,
  },

  immunization_missed_reason: {
    id: 'immunization_missed_reason', stage: 'patient_context', section: 'immunization',
    type: 'select', label: 'Reason for missed doses',
    options: [
      { label: 'Vaccine unavailable', value: 'unavailable' },
      { label: 'Child illness', value: 'illness' },
      { label: 'Missed appointment', value: 'missed_appointment' },
      { label: 'Caregiver refusal', value: 'refusal' },
      { label: 'Lack of awareness', value: 'lack_awareness' },
      { label: 'Other', value: 'other' },
    ],
    visibility: [{ type: 'field_equals', field: 'immunization_missed_doses', value: true }],
    required: [{ type: 'field_equals', field: 'immunization_missed_doses', value: true }],
    hideWhen: [{ type: 'field_equals', field: 'immunization_missed_doses', value: false }],
    universalAnswer: true, order: 46,
  },

  immunization_adverse_events: {
    id: 'immunization_adverse_events', stage: 'patient_context', section: 'immunization',
    type: 'multi_select', label: 'Any adverse events following immunization?',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Fever', value: 'fever' },
      { label: 'Rash', value: 'rash' },
      { label: 'Seizure / convulsion', value: 'seizure' },
      { label: 'Severe allergic reaction', value: 'allergic' },
      { label: 'Persistent crying', value: 'crying' },
      { label: 'Other', value: 'other' },
    ],
    visibility: [{ type: 'field_not_empty', field: 'immunization_status' }],
    required: NEVER,
    hideWhen: [{ type: 'field_equals', field: 'immunization_status', value: 'unknown' }],
    universalAnswer: true, order: 47,
  },

  encounter_type: {
    id: 'encounter_type', stage: 'encounter_context', section: 'encounter',
    type: 'select', label: 'Encounter Type',
    description: 'Determines the entire workflow',
    options: [
      { label: 'Emergency', value: 'emergency', icon: '🔴', description: 'Resuscitation, triage, ABCDE' },
      { label: 'New Consultation', value: 'new_consultation', icon: '📋', description: 'First assessment for this problem' },
      { label: 'Review', value: 'review', icon: '🔄', description: 'Planned follow-up, interval history' },
      { label: 'Follow-up', value: 'follow_up', icon: '📋', description: 'Treatment response assessment' },
      { label: 'Ward Round', value: 'ward_round', icon: '👨‍⚕️', description: 'Skip registration, go to today\'s round' },
      { label: 'Inpatient Admission', value: 'inpatient', icon: '🛏️', description: 'Bed allocation, team assignment' },
      { label: 'Transfer', value: 'transfer', icon: '🔄', description: 'Between facilities — import data, don\'t ask again' },
      { label: 'Discharge', value: 'discharge', icon: '🚪', description: 'Discharge summary, medications, follow-up plan' },
      { label: 'ICU Review', value: 'icu_review', icon: '💓', description: 'Critical care handover, SOFA scoring' },
      { label: 'Referral', value: 'referral', icon: '📨', description: 'Referral letter, clinical summary' },
      { label: 'Procedure', value: 'procedure', icon: '💉', description: 'Procedure check-in, consent, safety checklist' },
      { label: 'Operation / Theatre', value: 'operation', icon: '🔪', description: 'Pre-op assessment, consent, WHO checklist' },
      { label: 'Antenatal Visit', value: 'antenatal', icon: '🤰', description: 'Obstetric-focused assessment' },
      { label: 'Postnatal Review', value: 'postnatal', icon: '👶', description: 'Mother + baby assessment' },
      { label: 'Telemedicine', value: 'telemedicine', icon: '📱', description: 'Virtual consultation, no physical exam' },
      { label: 'Community Visit', value: 'community_visit', icon: '🏘️', description: 'Outreach, home-based care' },
      { label: 'Home Visit', value: 'home_visit', icon: '🏠', description: 'Home assessment, social context' },
      { label: 'Well Child / Well Baby', value: 'well_baby', icon: '👶', description: 'Routine growth + immunization check' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 48,
  },

  department: {
    id: 'department', stage: 'encounter_context', section: 'encounter',
    type: 'select', label: 'Department',
    options: [
      { label: 'Medicine', value: 'medicine', icon: '🫁', description: 'Internal Medicine engine' },
      { label: 'Surgery', value: 'surgery', icon: '🔪', description: 'Operative workflow' },
      { label: 'Paediatrics', value: 'pediatrics', icon: '👶', description: 'Growth charts, pediatric dosing' },
      { label: 'Obstetrics & Gynaecology', value: 'obstetrics_gynaecology', icon: '🤰', description: 'Pregnancy engine' },
      { label: 'Orthopaedics', value: 'orthopedics', icon: '🦴', description: 'Trauma engine' },
      { label: 'ENT', value: 'ent', icon: '👂', description: 'ENT examination' },
      { label: 'Ophthalmology', value: 'ophthalmology', icon: '👁️', description: 'Eye examination' },
      { label: 'Dermatology', value: 'dermatology', icon: '🧴', description: 'Skin examination' },
      { label: 'Psychiatry', value: 'psychiatry', icon: '🧠', description: 'MSE, suicide risk' },
      { label: 'Emergency Medicine', value: 'emergency_medicine', icon: '🚑', description: 'Resuscitation, triage' },
      { label: 'ICU', value: 'icu', icon: '💓', description: 'Critical care' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 34,
  },

  mode_of_arrival: {
    id: 'mode_of_arrival', stage: 'encounter_context', section: 'encounter',
    type: 'select', label: 'Mode of Arrival',
    description: 'Determines pre-hospital and medico-legal workflows',
    options: [
      { label: 'Walking', value: 'walking', description: 'No trauma workflow' },
      { label: 'Ambulance', value: 'ambulance', description: 'Reveals prehospital care, transfer notes, immobilization' },
      { label: 'Police', value: 'police', description: 'Reveals medico-legal documentation' },
      { label: 'Wheelchair', value: 'wheelchair' },
      { label: 'Stretcher', value: 'stretcher' },
      { label: 'Private car', value: 'private_car' },
      { label: 'Other', value: 'other' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 35,
  },

  triage_category: {
    id: 'triage_category', stage: 'encounter_context', section: 'triage',
    type: 'radio', label: 'Triage Category',
    description: 'Determines urgency and workflow priority',
    options: [
      { label: 'Red — Immediate', value: 'red', icon: '🔴', description: 'Resuscitation, no full history' },
      { label: 'Orange — Very Urgent', value: 'orange', icon: '🟠', description: 'Assessment within 10 min' },
      { label: 'Yellow — Urgent', value: 'yellow', icon: '🟡', description: 'Assessment within 60 min' },
      { label: 'Green — Standard', value: 'green', icon: '🟢', description: 'Normal workflow' },
      { label: 'Blue — Non-urgent', value: 'blue', icon: '🔵', description: 'Low priority' },
    ],
    visibility: [{ type: 'encounter_type', values: ['emergency'] }],
    required: [{ type: 'encounter_type', values: ['emergency'] }],
    hideWhen: [{ type: 'encounter_type', values: ['outpatient', 'inpatient', 'ward_round', 'follow_up'] }],
    universalAnswer: true, order: 36,
  },

  // ════════════════════════════════════════════
  // STAGE 3B: SERVICE HIERARCHY
  // ════════════════════════════════════════════

  service: {
    id: 'service', stage: 'encounter_context', section: 'service',
    type: 'select', label: 'Clinical Service',
    description: 'Sub-specialty division within the department',
    options: [
      { label: 'General Medicine', value: 'general_medicine' },
      { label: 'Cardiology', value: 'cardiology' },
      { label: 'Respiratory / Pulmonology', value: 'respiratory' },
      { label: 'Gastroenterology', value: 'gastroenterology' },
      { label: 'Neurology', value: 'neurology' },
      { label: 'Endocrinology', value: 'endocrinology' },
      { label: 'Nephrology', value: 'nephrology' },
      { label: 'Oncology', value: 'oncology' },
      { label: 'Haematology', value: 'haematology' },
      { label: 'General Surgery', value: 'general_surgery' },
      { label: 'Orthopaedics', value: 'orthopaedics' },
      { label: 'Neurosurgery', value: 'neurosurgery' },
      { label: 'Cardiothoracic Surgery', value: 'cardiothoracic' },
      { label: 'Paediatric Surgery', value: 'paediatric_surgery' },
      { label: 'General Paediatrics', value: 'general_paediatrics' },
      { label: 'Neonatology', value: 'neonatology' },
      { label: 'Paediatric Cardiology', value: 'paediatric_cardiology' },
      { label: 'Paediatric Neurology', value: 'paediatric_neurology' },
      { label: 'Obstetrics', value: 'obstetrics' },
      { label: 'Gynaecology', value: 'gynaecology' },
      { label: 'Feto-maternal Medicine', value: 'feto_maternal' },
      { label: 'Psychiatry', value: 'psychiatry' },
      { label: 'Child & Adolescent Psychiatry', value: 'child_adolescent_psychiatry' },
      { label: 'Emergency Medicine', value: 'emergency_medicine' },
      { label: 'Intensive Care', value: 'intensive_care' },
      { label: 'Neonatal ICU', value: 'nicu' },
      { label: 'Paediatric ICU', value: 'picu' },
      { label: 'Other', value: 'other' },
    ],
    visibility: ALWAYS,
    required: NEVER,
    hideWhen: [{ type: 'encounter_type', values: ['ward_round'] }],
    universalAnswer: true, order: 52,
  },

  unit: {
    id: 'unit', stage: 'encounter_context', section: 'service',
    type: 'text', label: 'Unit / Ward Name', placeholder: 'e.g. Ward 6, HDU, CCU, SCBU',
    description: 'Specific clinical unit within the service',
    visibility: [{ type: 'field_not_empty', field: 'service' }],
    required: [{ type: 'encounter_type', values: ['inpatient', 'admission', 'transfer', 'ward_round'] }],
    hideWhen: [{ type: 'encounter_type', values: ['telemedicine', 'home_visit', 'community_visit'] }],
    universalAnswer: true, order: 53,
  },

  // ════════════════════════════════════════════
  // STAGE 3C: REFERRAL & TRANSFER DETAILS
  // ════════════════════════════════════════════

  referral_source: {
    id: 'referral_source', stage: 'encounter_context', section: 'referral',
    type: 'select', label: 'Referred from',
    options: [
      { label: 'Self / Walk-in', value: 'self' },
      { label: 'Outpatient clinic', value: 'clinic' },
      { label: 'Hospital transfer', value: 'hospital_transfer' },
      { label: 'Emergency department', value: 'emergency_department' },
      { label: 'Community health worker', value: 'community_health_worker' },
      { label: 'Traditional healer', value: 'traditional_healer' },
      { label: 'Police / legal', value: 'police' },
      { label: 'Other', value: 'other' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'encounter_type', values: ['referral', 'transfer', 'admission'] }],
    hideWhen: NEVER,
    universalAnswer: true, order: 54,
  },

  referring_hospital: {
    id: 'referring_hospital', stage: 'encounter_context', section: 'referral',
    type: 'text', label: 'Referring hospital / facility',
    placeholder: 'Name of referring facility',
    visibility: [{ type: 'field_equals', field: 'referral_source', value: 'hospital_transfer' }],
    required: [{ type: 'field_equals', field: 'referral_source', value: 'hospital_transfer' }],
    hideWhen: [{ type: 'field_equals', field: 'referral_source', value: 'hospital_transfer' }],
    universalAnswer: true, order: 55,
  },

  referral_reason: {
    id: 'referral_reason', stage: 'encounter_context', section: 'referral',
    type: 'text', label: 'Reason for referral / transfer',
    placeholder: 'Brief clinical summary for referral',
    visibility: [{ type: 'field_equals', field: 'referral_source', value: 'hospital_transfer' },
                 { type: 'encounter_type', values: ['referral', 'transfer'] }],
    required: [{ type: 'encounter_type', values: ['referral', 'transfer'] }],
    hideWhen: NEVER,
    universalAnswer: true, order: 56,
  },

  // ════════════════════════════════════════════
  // STAGE 3D: PREHOSPITAL CARE (mode_of_arrival cascades)
  // ════════════════════════════════════════════

  prehospital_care: {
    id: 'prehospital_care', stage: 'encounter_context', section: 'prehospital',
    type: 'text', label: 'Prehospital care summary',
    placeholder: 'Care given before arrival (by EMS, clinic, etc.)',
    description: 'Revealed when mode_of_arrival is ambulance or stretcher',
    visibility: [{ type: 'mode_of_arrival', values: ['ambulance', 'stretcher'] }],
    required: [{ type: 'mode_of_arrival', values: ['ambulance'] }],
    hideWhen: [{ type: 'mode_of_arrival', values: ['walking', 'private_car', 'wheelchair', 'police', 'other', 'unknown'] }],
    universalAnswer: true, order: 57,
  },

  immobilization: {
    id: 'immobilization', stage: 'encounter_context', section: 'prehospital',
    type: 'boolean', label: 'Spinal immobilisation in place?',
    description: 'For ambulance arrivals with suspected trauma',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
    visibility: [{ type: 'mode_of_arrival', values: ['ambulance', 'stretcher'] }],
    required: [{ type: 'field_equals', field: 'prehospital_care', value: null }],
    hideWhen: [{ type: 'mode_of_arrival', values: ['walking', 'private_car', 'wheelchair', 'police'] }],
    universalAnswer: true, order: 58,
  },

  arrival_time: {
    id: 'arrival_time', stage: 'encounter_context', section: 'prehospital',
    type: 'text', label: 'Time of arrival',
    placeholder: 'HH:MM',
    description: 'Time patient arrived at facility',
    visibility: [{ type: 'mode_of_arrival', values: ['ambulance', 'stretcher', 'police'] }],
    required: [{ type: 'encounter_type', values: ['emergency'] }],
    hideWhen: NEVER,
    universalAnswer: true, order: 59,
  },

  // ════════════════════════════════════════════
  // STAGE 3E: MEDICO-LEGAL (mode_of_arrival cascades)
  // ════════════════════════════════════════════

  medico_legal_flag: {
    id: 'medico_legal_flag', stage: 'encounter_context', section: 'medico_legal',
    type: 'boolean', label: 'Medico-legal case?',
    description: 'Activates evidence documentation, chain of custody, and separate records',
    options: [
      { label: 'No', value: 'false' },
      { label: 'Yes', value: 'true' },
    ],
    visibility: [{ type: 'mode_of_arrival', values: ['police'] }],
    required: [{ type: 'mode_of_arrival', values: ['police'] }],
    hideWhen: [{ type: 'mode_of_arrival', values: ['police'] }],
    universalAnswer: true, order: 60,
  },

  police_station: {
    id: 'police_station', stage: 'encounter_context', section: 'medico_legal',
    type: 'text', label: 'Police station / reporting officer',
    placeholder: 'Station name and officer name',
    visibility: [{ type: 'field_equals', field: 'medico_legal_flag', value: true }],
    required: [{ type: 'field_equals', field: 'medico_legal_flag', value: true }],
    hideWhen: [{ type: 'field_equals', field: 'medico_legal_flag', value: false }],
    universalAnswer: true, order: 61,
  },

  // ════════════════════════════════════════════
  // STAGE 3F: WARD / BED (for inpatients)
  // ════════════════════════════════════════════

  ward: {
    id: 'ward', stage: 'encounter_context', section: 'ward',
    type: 'text', label: 'Ward', placeholder: 'Ward name / number',
    visibility: [{ type: 'encounter_type', values: ['inpatient', 'admission', 'ward_round', 'transfer', 'postnatal'] }],
    required: [{ type: 'encounter_type', values: ['inpatient', 'admission'] }],
    hideWhen: [{ type: 'encounter_type', values: ['telemedicine', 'home_visit', 'community_visit', 'outpatient', 'review', 'follow_up'] }],
    universalAnswer: true, order: 62,
  },

  bed: {
    id: 'bed', stage: 'encounter_context', section: 'ward',
    type: 'text', label: 'Bed number', placeholder: 'e.g. 12A',
    visibility: [{ type: 'field_not_empty', field: 'ward' }],
    required: [{ type: 'field_not_empty', field: 'ward' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 63,
  },

  team: {
    id: 'team', stage: 'encounter_context', section: 'ward',
    type: 'text', label: 'Clinical team', placeholder: 'e.g. Firm C, Cardiology Team 2',
    visibility: [{ type: 'encounter_type', values: ['inpatient', 'admission', 'ward_round'] }],
    required: NEVER,
    hideWhen: [{ type: 'encounter_type', values: ['telemedicine', 'home_visit', 'community_visit', 'outpatient'] }],
    universalAnswer: true, order: 64,
  },

  consultant: {
    id: 'consultant', stage: 'encounter_context', section: 'ward',
    type: 'text', label: 'Consultant in charge', placeholder: 'Dr. name',
    visibility: [{ type: 'encounter_type', values: ['inpatient', 'admission', 'ward_round', 'referral'] }],
    required: [{ type: 'encounter_type', values: ['inpatient', 'admission', 'referral'] }],
    hideWhen: NEVER,
    universalAnswer: true, order: 65,
  },

  known_conditions: {
    id: 'known_conditions', stage: 'clinical_context', section: 'pre_existing',
    type: 'multi_select', label: 'Known Medical Conditions',
    description: 'Pre-existing diagnoses that affect this encounter',
    options: [
      { label: 'Hypertension', value: 'hypertension' },
      { label: 'Diabetes Type 1', value: 'type_1_diabetes' },
      { label: 'Diabetes Type 2', value: 'type_2_diabetes' },
      { label: 'Asthma', value: 'asthma' },
      { label: 'HIV', value: 'hiv' },
      { label: 'Sickle Cell Disease', value: 'sickle_cell' },
      { label: 'Epilepsy', value: 'epilepsy' },
      { label: 'Tuberculosis', value: 'tuberculosis' },
      { label: 'Heart Disease', value: 'heart_disease' },
      { label: 'Kidney Disease', value: 'kidney_disease' },
      { label: 'Liver Disease', value: 'liver_disease' },
      { label: 'Cancer', value: 'cancer' },
      { label: 'Mental Illness', value: 'mental_illness' },
      { label: 'None', value: 'none' },
    ],
    visibility: ALWAYS,
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 66,
  },

  allergies: {
    id: 'allergies', stage: 'clinical_context', section: 'pre_existing',
    type: 'multi_select', label: 'Known Allergies',
    options: [
      { label: 'Penicillin', value: 'penicillin' },
      { label: 'Cephalosporins', value: 'cephalosporins' },
      { label: 'Sulpha', value: 'sulpha' },
      { label: 'Aspirin/NSAIDs', value: 'nsaids' },
      { label: 'Paracetamol', value: 'paracetamol' },
      { label: 'Latex', value: 'latex' },
      { label: 'Iodine/Contrast', value: 'iodine' },
      { label: 'Food allergy', value: 'food' },
      { label: 'None known', value: 'none' },
    ],
    visibility: ALWAYS,
    required: [{ type: 'always' }],
    hideWhen: NEVER,
    universalAnswer: true, order: 67,
  },

  current_medications: {
    id: 'current_medications', stage: 'clinical_context', section: 'pre_existing',
    type: 'text', label: 'Current Medications',
    placeholder: 'List current medications',
    visibility: ALWAYS,
    required: NEVER, hideWhen: NEVER,
    universalAnswer: true, order: 68,
  },
};

export const REGISTRATION_STAGES = [
  { id: 'identity', label: 'Identity', description: 'Name, age, sex, birth/perinatal history for neonates', icon: '📋', required: true, prerequisites: [] },
  { id: 'patient_context', label: 'Patient Context', description: 'Reproductive, growth, nutrition, immunization, residence, contact', icon: '👤', required: true, prerequisites: ['identity'] },
  { id: 'encounter_context', label: 'Encounter Context', description: 'Type, department, service, triage, arrival, prehospital, referral', icon: '🏥', required: true, prerequisites: ['patient_context'] },
  { id: 'clinical_context', label: 'Clinical Context', description: 'Known conditions, allergies, medications', icon: '🩺', required: true, prerequisites: ['encounter_context'] },
  { id: 'administrative_context', label: 'Administrative', description: 'Insurance, consent, billing', icon: '📄', required: false, prerequisites: ['clinical_context'] },
  { id: 'registration_complete', label: 'Confirmation', description: 'Review and confirm', icon: '✅', required: true, prerequisites: ['administrative_context'] },
] as const;

export const INFORMANT_RULES = [
  {
    applicableAges: { maxMonths: 2 },
    eligibleInformants: ['mother', 'father', 'guardian', 'healthcare_worker'],
    reliabilityOverride: 'fair' as const,
  },
  {
    applicableAges: { minMonths: 2, maxMonths: 144 },
    eligibleInformants: ['self', 'mother', 'father', 'guardian', 'sibling', 'healthcare_worker'],
  },
  {
    applicableAges: { minMonths: 144 },
    eligibleInformants: ['self', 'mother', 'father', 'guardian', 'sibling', 'spouse', 'healthcare_worker', 'police', 'other'],
  },
  {
    applicableConditions: ['psychosis', 'dementia', 'altered_mental_state', 'unconscious'],
    eligibleInformants: ['guardian', 'healthcare_worker', 'family_member'],
    reliabilityOverride: 'poor' as const,
  },
];
