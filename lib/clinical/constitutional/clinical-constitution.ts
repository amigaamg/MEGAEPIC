// ═══════════════════════════════════════════════════════════════
// CLINICAL CONSTITUTION — MASTER FIELD REGISTRY
// Every field in AMEXAN defined once, used by all engines.
// ═══════════════════════════════════════════════════════════════

export interface ConstitutionFieldDef {
  id: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'date' | 'tel' | 'calculated';
  section: string;
  label: string;
  shortLabel?: string;
  description?: string;
  visibility: ConstitutionRule[];
  required: ConstitutionRule[];
  hiddenIf: ConstitutionRule[];
  encounterCascade?: {
    triggers: { field: string; value: unknown }[];
    showSections: string[];
    hideSections: string[];
    makeRequired: string[];
  }[];
  usedBy: string[];
  calculation?: string;
  documentation: string;
  permissions: {
    edit: string[];
    view: string[];
  };
}

export type ConstitutionRule =
  | { type: 'age_group'; values: string[] }
  | { type: 'age_min_months'; months: number }
  | { type: 'age_max_months'; months: number }
  | { type: 'sex'; values: string[] }
  | { type: 'reproductive_stage'; values: string[] }
  | { type: 'encounter_type'; values: string[] }
  | { type: 'department'; values: string[] }
  | { type: 'module_active'; module: string }
  | { type: 'module_inactive'; module: string }
  | { type: 'mode_of_arrival'; values: string[] }
  | { type: 'triage_category'; values: string[] }
  | { type: 'field_equals'; field: string; value: unknown }
  | { type: 'field_not_empty'; field: string }
  | { type: 'field_in'; field: string; values: unknown[] }
  | { type: 'always' }
  | { type: 'never' };

const ALWAYS: ConstitutionRule[] = [{ type: 'always' }];
const NEVER: ConstitutionRule[] = [{ type: 'never' }];

export const CONSTITUTION_FIELDS: Record<string, ConstitutionFieldDef> = {

  // ════════════════════════════════════════════
  // IDENTITY
  // ════════════════════════════════════════════

  patient_name: {
    id: 'patient_name', type: 'text', section: 'identity',
    label: 'Patient Name',
    visibility: ALWAYS,
    required: [{ type: 'field_equals', field: 'unknown_patient', value: false }],
    hiddenIf: [{ type: 'field_equals', field: 'unknown_patient', value: true }],
    usedBy: ['documentation_engine', 'billing_engine', 'hmis'],
    documentation: 'Patient name: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
  },

  unknown_patient: {
    id: 'unknown_patient', type: 'boolean', section: 'identity',
    label: 'Unknown Patient',
    description: 'Toggles temporary identity generation',
    visibility: ALWAYS,
    required: NEVER,
    hiddenIf: NEVER,
    usedBy: ['identity_engine'],
    documentation: '',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
  },

  date_of_birth: {
    id: 'date_of_birth', type: 'date', section: 'identity',
    label: 'Date of Birth',
    visibility: ALWAYS,
    required: [{ type: 'field_not_empty', field: 'age' }],
    hiddenIf: [{ type: 'field_not_empty', field: 'age' }],
    usedBy: ['age_calculation', 'documentation_engine', 'growth_engine'],
    calculation: 'If DOB entered → age = today - DOB; if age entered → DOB calculated',
    documentation: 'Date of birth: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
  },

  age: {
    id: 'age', type: 'number', section: 'identity',
    label: 'Age',
    visibility: ALWAYS,
    required: [{ type: 'field_not_empty', field: 'date_of_birth' }],
    hiddenIf: [{ type: 'field_not_empty', field: 'date_of_birth' }],
    usedBy: ['age_calculation', 'gender_engine', 'medication_dosing', 'growth_engine'],
    documentation: 'Age: {value} {age_unit}.',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
  },

  sex: {
    id: 'sex', type: 'select', section: 'identity',
    label: 'Biological Sex',
    visibility: ALWAYS,
    required: ALWAYS,
    hiddenIf: NEVER,
    usedBy: ['gender_engine', 'reproductive_engine', 'dosing_engine', 'growth_engine'],
    documentation: 'Sex: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
  },

  // ════════════════════════════════════════════
  // NEONATAL IDENTITY
  // ════════════════════════════════════════════

  gestation_at_birth: {
    id: 'gestation_at_birth', type: 'number', section: 'neonatal_identity',
    label: 'Gestational age at birth (weeks)',
    description: 'Essential for corrected age; determines preterm vs term classification',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hiddenIf: [{ type: 'module_inactive', module: 'neonatal' }],
    usedBy: ['corrected_age_calculation', 'growth_engine', 'development_engine', 'dosing_engine', 'documentation_engine'],
    calculation: 'If preterm (<37wk) → corrected_age = chronological_age - (40 - gestation_weeks)/4.33 months',
    documentation: 'Born at {value} weeks gestation.',
    permissions: { edit: ['doctor', 'midwife', 'neonatal_nurse'], view: ['all_clinicians'] },
  },

  birth_weight: {
    id: 'birth_weight', type: 'number', section: 'neonatal_identity',
    label: 'Birth weight (kg)',
    description: 'Required for weight loss/gain calculation, medication dosing, growth percentiles',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hiddenIf: [{ type: 'age_min_months', months: 24 }],
    usedBy: ['medication_dosing', 'growth_engine', 'nutrition_engine', 'dehydration_engine', 'documentation_engine'],
    calculation: 'daily_weight_loss = ((birth_weight - current_weight) / birth_weight) × 100',
    documentation: 'Birth weight was {value} kg.',
    permissions: { edit: ['doctor', 'midwife', 'neonatal_nurse'], view: ['all_clinicians'] },
  },

  delivery_mode: {
    id: 'delivery_mode', type: 'select', section: 'birth_history',
    label: 'Mode of delivery',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hiddenIf: [{ type: 'module_inactive', module: 'neonatal' }],
    usedBy: ['documentation_engine', 'perinatal_risk_engine'],
    documentation: 'Delivered via {value}.',
    permissions: { edit: ['doctor', 'midwife', 'neonatal_nurse'], view: ['all_clinicians'] },
  },

  apgar_1min: {
    id: 'apgar_1min', type: 'number', section: 'birth_history',
    label: 'APGAR at 1 minute',
    description: 'Score 0-10 assessing heart rate, respiratory effort, tone, reflex, colour',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'field_not_empty', field: 'birth_weight' }],
    hiddenIf: [{ type: 'module_inactive', module: 'neonatal' }],
    usedBy: ['documentation_engine', 'neonatal_risk_engine'],
    documentation: 'APGAR 1 minute: {value}/10.',
    permissions: { edit: ['doctor', 'midwife', 'neonatal_nurse'], view: ['all_clinicians'] },
  },

  resuscitation_at_birth: {
    id: 'resuscitation_at_birth', type: 'select', section: 'birth_history',
    label: 'Resuscitation required at birth?',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hiddenIf: [{ type: 'module_inactive', module: 'neonatal' }],
    usedBy: ['documentation_engine', 'neonatal_risk_engine'],
    documentation: 'Resuscitation at birth: {value}.',
    permissions: { edit: ['doctor', 'midwife', 'neonatal_nurse'], view: ['all_clinicians'] },
  },

  nicu_admission: {
    id: 'nicu_admission', type: 'boolean', section: 'birth_history',
    label: 'Admitted to NICU?',
    description: 'Triggers NICU follow-up, developmental surveillance, and discharge planning',
    visibility: [{ type: 'module_active', module: 'neonatal' }],
    required: [{ type: 'module_active', module: 'neonatal' }],
    hiddenIf: [{ type: 'module_inactive', module: 'neonatal' }],
    usedBy: ['documentation_engine', 'discharge_engine', 'follow_up_engine'],
    documentation: 'Admitted to NICU: {value}.',
    permissions: { edit: ['doctor', 'neonatal_nurse'], view: ['all_clinicians'] },
    encounterCascade: [{
      triggers: [{ field: 'nicu_admission', value: true }],
      showSections: ['nicu_course', 'neonatal_follow_up'],
      hideSections: [],
      makeRequired: ['nicu_reason', 'nicu_duration'],
    }],
  },

  // ════════════════════════════════════════════
  // PEDIATRIC GROWTH
  // ════════════════════════════════════════════

  current_weight: {
    id: 'current_weight', type: 'number', section: 'growth',
    label: 'Current weight (kg)',
    description: 'Foundation field — used for ALL medication dosing, fluid calculations, and nutritional assessment',
    visibility: [{ type: 'module_active', module: 'neonatal' }, { type: 'module_active', module: 'pediatric' }],
    required: ALWAYS,
    hiddenIf: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    usedBy: ['medication_dosing', 'fluid_calculator', 'growth_engine', 'nutrition_engine',
             'dehydration_engine', 'documentation_engine'],
    calculation: 'weight_for_age_z = (value - mean) / sd; weight_for_height_z = (value - mean) / sd',
    documentation: 'Current weight: {value} kg.',
    permissions: { edit: ['doctor', 'nurse', 'midwife'], view: ['all_clinicians'] },
  },

  current_height: {
    id: 'current_height', type: 'number', section: 'growth',
    label: 'Current height/length (cm)',
    visibility: [{ type: 'field_not_empty', field: 'current_weight' }],
    required: [{ type: 'field_not_empty', field: 'current_weight' }],
    hiddenIf: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    usedBy: ['growth_engine', 'nutrition_engine', 'bmi_calculation', 'documentation_engine'],
    calculation: 'bmi = weight_kg / (height_m)²; height_for_age_z = (value - mean) / sd',
    documentation: 'Current height: {value} cm.',
    permissions: { edit: ['doctor', 'nurse'], view: ['all_clinicians'] },
  },

  current_head_circumference: {
    id: 'current_head_circumference', type: 'number', section: 'growth',
    label: 'Head circumference (cm)',
    description: 'Mandatory <2 years; also screened in neurology and development clinics',
    visibility: [{ type: 'age_max_months', months: 24 }],
    required: [{ type: 'age_max_months', months: 24 }],
    hiddenIf: [{ type: 'age_min_months', months: 25 }],
    usedBy: ['growth_engine', 'neurology_engine', 'development_engine', 'documentation_engine'],
    calculation: 'hc_for_age_z = (value - mean) / sd; microcephaly if z < -2; macrocephaly if z > +2',
    documentation: 'Head circumference: {value} cm.',
    permissions: { edit: ['doctor', 'nurse'], view: ['all_clinicians'] },
  },

  muac: {
    id: 'muac', type: 'number', section: 'growth',
    label: 'MUAC (cm)',
    description: 'Mid-Upper Arm Circumference — WHO standard for 6-60mo malnutrition screening',
    visibility: [{ type: 'age_min_months', months: 6 }, { type: 'age_max_months', months: 60 }],
    required: NEVER,
    hiddenIf: [{ type: 'age_max_months', months: 5 }, { type: 'age_min_months', months: 61 }],
    usedBy: ['nutrition_engine', 'triage_engine'],
    calculation: 'MUAC < 11.5cm → severe acute malnutrition; 11.5-12.5cm → moderate acute malnutrition',
    documentation: 'MUAC: {value} cm.',
    permissions: { edit: ['doctor', 'nurse', 'nutritionist'], view: ['all_clinicians'] },
  },

  // ════════════════════════════════════════════
  // NUTRITION & FEEDING
  // ════════════════════════════════════════════

  breastfeeding_status: {
    id: 'breastfeeding_status', type: 'select', section: 'nutrition',
    label: 'Breastfeeding status',
    description: 'Guides jaundice monitoring, growth assessment, and maternal support',
    visibility: [{ type: 'age_max_months', months: 24 }],
    required: [{ type: 'age_max_months', months: 24 }],
    hiddenIf: [{ type: 'age_min_months', months: 25 }],
    usedBy: ['nutrition_engine', 'jaundice_engine', 'documentation_engine', 'growth_engine'],
    documentation: 'Feeding: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'midwife', 'nutritionist'], view: ['all_clinicians'] },
  },

  // ════════════════════════════════════════════
  // IMMUNIZATION
  // ════════════════════════════════════════════

  immunization_status: {
    id: 'immunization_status', type: 'select', section: 'immunization',
    label: 'Immunization status',
    description: 'Records whether child is up-to-date per EPI schedule',
    visibility: [{ type: 'module_active', module: 'neonatal' }, { type: 'module_active', module: 'pediatric' }],
    required: ALWAYS,
    hiddenIf: [{ type: 'age_group', values: ['adult', 'older_adult'] }],
    usedBy: ['documentation_engine', 'prevention_engine', 'hmis'],
    documentation: 'Immunizations: {value}.',
    permissions: { edit: ['doctor', 'nurse'], view: ['all_clinicians'] },
    encounterCascade: [{
      triggers: [{ field: 'immunization_status', value: 'not_up_to_date' }],
      showSections: ['immunization_catch_up', 'immunization_missed'],
      hideSections: [],
      makeRequired: ['immunization_missed_doses', 'immunization_missed_reason'],
    }],
  },

  // ════════════════════════════════════════════
  // ENCOUNTER CONTEXT
  // ════════════════════════════════════════════

  encounter_type: {
    id: 'encounter_type', type: 'select', section: 'encounter',
    label: 'Encounter Type',
    description: 'Primary determinant of workflow, documentation template, and visibility rules',
    visibility: ALWAYS,
    required: ALWAYS,
    hiddenIf: NEVER,
    usedBy: ['workflow_engine', 'documentation_engine', 'visibility_engine', 'billing_engine', 'hmis'],
    documentation: 'Encounter type: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
    encounterCascade: [
      {
        triggers: [{ field: 'encounter_type', value: 'emergency' }],
        showSections: ['triage', 'abcde', 'resuscitation'],
        hideSections: [],
        makeRequired: ['triage_category', 'mode_of_arrival'],
      },
      {
        triggers: [{ field: 'encounter_type', value: 'ward_round' }],
        showSections: ['progress_note'],
        hideSections: ['biodata', 'full_history', 'full_examination'],
        makeRequired: [],
      },
      {
        triggers: [{ field: 'encounter_type', value: 'transfer' }],
        showSections: ['transfer_notes', 'referral_details'],
        hideSections: [],
        makeRequired: ['referral_reason', 'referring_hospital'],
      },
      {
        triggers: [{ field: 'encounter_type', value: 'discharge' }],
        showSections: ['discharge_summary', 'discharge_medications', 'follow_up_plan'],
        hideSections: ['hpi', 'full_examination'],
        makeRequired: ['discharge_summary'],
      },
      {
        triggers: [{ field: 'encounter_type', value: 'well_baby' }],
        showSections: ['growth', 'immunization', 'development', 'feeding'],
        hideSections: [],
        makeRequired: ['current_weight', 'immunization_status'],
      },
    ],
  },

  department: {
    id: 'department', type: 'select', section: 'encounter',
    label: 'Department',
    description: 'Determines specialty module activation',
    visibility: ALWAYS,
    required: ALWAYS,
    hiddenIf: NEVER,
    usedBy: ['module_engine', 'workflow_engine', 'documentation_engine'],
    documentation: 'Department: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
  },

  mode_of_arrival: {
    id: 'mode_of_arrival', type: 'select', section: 'encounter',
    label: 'Mode of Arrival',
    visibility: ALWAYS,
    required: ALWAYS,
    hiddenIf: NEVER,
    usedBy: ['workflow_engine', 'documentation_engine', 'medico_legal_engine'],
    documentation: 'Arrived via {value}.',
    permissions: { edit: ['doctor', 'nurse', 'clerical'], view: ['all_clinicians'] },
    encounterCascade: [
      {
        triggers: [{ field: 'mode_of_arrival', value: 'ambulance' }, { field: 'mode_of_arrival', value: 'stretcher' }],
        showSections: ['prehospital_care', 'immobilization', 'ems_report'],
        hideSections: [],
        makeRequired: ['prehospital_care', 'arrival_time'],
      },
      {
        triggers: [{ field: 'mode_of_arrival', value: 'police' }],
        showSections: ['medico_legal', 'police_report'],
        hideSections: [],
        makeRequired: ['medico_legal_flag', 'police_station'],
      },
    ],
  },

  triage_category: {
    id: 'triage_category', type: 'select', section: 'triage',
    label: 'Triage Category',
    description: 'Red → ABCDE resuscitation, skip full history. Green → normal workflow.',
    visibility: [{ type: 'encounter_type', values: ['emergency'] }],
    required: [{ type: 'encounter_type', values: ['emergency'] }],
    hiddenIf: [{ type: 'encounter_type', values: ['new_consultation', 'review', 'follow_up', 'ward_round', 'outpatient'] }],
    usedBy: ['workflow_engine', 'documentation_engine', 'priority_engine'],
    documentation: 'Triage: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'triage_officer'], view: ['all_clinicians'] },
    encounterCascade: [{
      triggers: [{ field: 'triage_category', value: 'red' }],
      showSections: ['abcde', 'resuscitation', 'airway', 'breathing', 'circulation', 'disability'],
      hideSections: ['full_history', 'biodata_review', 'social_history', 'family_history'],
      makeRequired: ['airway_compromised', 'breathing_distress', 'circulation_compromised'],
    }],
  },

  service: {
    id: 'service', type: 'select', section: 'service',
    label: 'Clinical Service',
    description: 'Subspecialty division — determines specific clinical pathways',
    visibility: ALWAYS,
    required: NEVER,
    hiddenIf: [{ type: 'encounter_type', values: ['ward_round'] }],
    usedBy: ['module_engine', 'workflow_engine', 'referral_engine'],
    documentation: 'Service: {value}.',
    permissions: { edit: ['doctor', 'clerical'], view: ['all_clinicians'] },
  },

  // ════════════════════════════════════════════
  // REFERRAL
  // ════════════════════════════════════════════

  referral_source: {
    id: 'referral_source', type: 'select', section: 'referral',
    label: 'Referred from',
    description: 'Determines whether pre-existing data should be imported',
    visibility: ALWAYS,
    required: [{ type: 'encounter_type', values: ['referral', 'transfer', 'admission'] }],
    hiddenIf: NEVER,
    usedBy: ['workflow_engine', 'data_import_engine'],
    documentation: 'Referred from: {value}.',
    permissions: { edit: ['doctor', 'clerical'], view: ['all_clinicians'] },
    encounterCascade: [{
      triggers: [{ field: 'referral_source', value: 'hospital_transfer' }],
      showSections: ['transfer_notes', 'referral_details'],
      hideSections: [],
      makeRequired: ['referring_hospital', 'referral_reason', 'referral_notes'],
    }],
  },

  referring_hospital: {
    id: 'referring_hospital', type: 'text', section: 'referral',
    label: 'Referring hospital / facility',
    visibility: [{ type: 'field_equals', field: 'referral_source', value: 'hospital_transfer' }],
    required: [{ type: 'field_equals', field: 'referral_source', value: 'hospital_transfer' }],
    hiddenIf: [{ type: 'field_equals', field: 'referral_source', value: 'hospital_transfer' }],
    usedBy: ['documentation_engine', 'data_import_engine', 'follow_up_engine'],
    documentation: 'Transferred from {value}.',
    permissions: { edit: ['doctor', 'clerical'], view: ['all_clinicians'] },
  },

  // ════════════════════════════════════════════
  // PREHOSPITAL
  // ════════════════════════════════════════════

  prehospital_care: {
    id: 'prehospital_care', type: 'text', section: 'prehospital_care',
    label: 'Prehospital care summary',
    description: 'Care provided before arrival — EMS, clinic, or bystander',
    visibility: [{ type: 'mode_of_arrival', values: ['ambulance', 'stretcher'] }],
    required: [{ type: 'mode_of_arrival', values: ['ambulance'] }],
    hiddenIf: [{ type: 'mode_of_arrival', values: ['walking', 'private_car', 'wheelchair', 'police', 'other', 'unknown'] }],
    usedBy: ['documentation_engine', 'trauma_engine', 'quality_improvement'],
    documentation: 'Prehospital: {value}.',
    permissions: { edit: ['doctor', 'nurse', 'paramedic'], view: ['all_clinicians'] },
  },

  // ════════════════════════════════════════════
  // MEDICO-LEGAL
  // ════════════════════════════════════════════

  medico_legal_flag: {
    id: 'medico_legal_flag', type: 'boolean', section: 'medico_legal',
    label: 'Medico-legal case?',
    description: 'Activates chain of custody, separate records, evidence documentation',
    visibility: [{ type: 'mode_of_arrival', values: ['police'] }],
    required: [{ type: 'mode_of_arrival', values: ['police'] }],
    hiddenIf: [{ type: 'mode_of_arrival', values: ['police'] }],
    usedBy: ['documentation_engine', 'records_engine', 'legal_engine'],
    documentation: 'Medico-legal case: {value}.',
    permissions: { edit: ['doctor', 'nurse'], view: ['consultant', 'legal'] },
  },

  police_station: {
    id: 'police_station', type: 'text', section: 'medico_legal',
    label: 'Police station / reporting officer',
    visibility: [{ type: 'field_equals', field: 'medico_legal_flag', value: true }],
    required: [{ type: 'field_equals', field: 'medico_legal_flag', value: true }],
    hiddenIf: [{ type: 'field_equals', field: 'medico_legal_flag', value: false }],
    usedBy: ['documentation_engine', 'legal_engine'],
    documentation: 'Police: {value}.',
    permissions: { edit: ['doctor', 'nurse'], view: ['consultant', 'legal'] },
  },
};

export const CONSTITUTION_DOMAINS = {
  identity: ['patient_name', 'unknown_patient', 'hospital_number', 'date_of_birth', 'age', 'age_unit', 'sex'],
  neonatal_identity: ['gestation_at_birth', 'birth_weight', 'birth_length', 'birth_head_circumference'],
  birth_history: ['birth_place', 'birth_attendant', 'labour_onset', 'delivery_mode', 'liquor_appearance',
                  'apgar_1min', 'apgar_5min', 'apgar_10min', 'cried_immediately', 'resuscitation_at_birth',
                  'nicu_admission', 'nicu_reason'],
  perinatal_history: ['antenatal_care', 'maternal_illness_pregnancy', 'medications_in_pregnancy',
                      'vitamin_k_given', 'birth_vaccinations'],
  growth: ['current_weight', 'current_height', 'current_head_circumference', 'muac', 'growth_curve_trend'],
  nutrition: ['breastfeeding_status', 'formula_type', 'complementary_feeding', 'appetite', 'feeding_difficulties'],
  immunization: ['immunization_status', 'immunization_card_available', 'immunization_missed_doses',
                 'immunization_missed_reason', 'immunization_adverse_events'],
  encounter: ['encounter_type', 'department', 'service', 'unit', 'mode_of_arrival', 'triage_category'],
  referral: ['referral_source', 'referring_hospital', 'referral_reason'],
  prehospital: ['prehospital_care', 'immobilization', 'arrival_time'],
  medico_legal: ['medico_legal_flag', 'police_station'],
  ward: ['ward', 'bed', 'team', 'consultant'],
  demographics: ['marital_status', 'occupation', 'schooling', 'previous_occupation'],
  residence: ['residence_country', 'residence_county', 'residence_subcounty', 'residence_town',
              'residence_village'],
  contact: ['patient_contact', 'guardian_contact', 'next_of_kin_name', 'next_of_kin_contact',
            'informant', 'informant_reliability'],
} as const;

export function getConstitutionField(fieldId: string): ConstitutionFieldDef | undefined {
  return CONSTITUTION_FIELDS[fieldId];
}

export function getFieldsBySection(section: string): ConstitutionFieldDef[] {
  return Object.values(CONSTITUTION_FIELDS).filter(f => f.section === section);
}
