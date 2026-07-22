import { QuestionGroup } from '../types/ces';
import { EXAMINATION_GROUPS } from './examination';

export const QUESTION_GROUPS: Record<string, QuestionGroup> = {
  // ═══════════════════════════════════════════
  // REGISTRATION
  // ═══════════════════════════════════════════
  patient_identity: {
    id: 'patient_identity',
    label: 'Patient Information',
    phase: 'registration',
    cards: [
      { id: 'q_patient_name', phase: 'registration', question: 'Patient Name', type: 'text', required: true, factKey: 'patient_name' },
      { id: 'q_age_value', phase: 'registration', question: 'Age', type: 'text', required: true, factKey: 'age_value' },
      { id: 'q_age_unit', phase: 'registration', question: 'Age Unit', type: 'chips', chips: ['Hours', 'Days', 'Months', 'Years'], required: true, factKey: 'age_unit' },
      { id: 'q_sex', phase: 'registration', question: 'Sex', type: 'chips', chips: ['Male', 'Female'], required: true, factKey: 'sex' },
      {
        id: 'q_reproductive_status', phase: 'registration',
        question: 'Is this a pregnancy or gynecological related visit?',
        type: 'chips',
        chips: ['Not pregnant (routine care)', 'Currently pregnant', 'Gynecological complaint only', 'Postpartum', 'Unsure'],
        required: true, factKey: 'reproductive_status',
        cqae: { sex: 'female', ageGroups: ['adolescent', 'adult', 'elderly'] },
      },
      {
        id: 'q_biodata_lmp', phase: 'registration',
        question: 'Date of Last Menstrual Period (LMP)?',
        type: 'date', required: true, factKey: 'biodata_lmp',
        cqae: { sex: 'female', ageGroups: ['adolescent', 'adult', 'elderly'] },
      },
      {
        id: 'q_biodata_edd', phase: 'registration',
        question: 'Expected Date of Delivery (EDD)?',
        type: 'date', required: false, factKey: 'biodata_edd',
        cqae: { sex: 'female', ageGroups: ['adolescent', 'adult', 'elderly'] },
      },
      {
        id: 'q_biodata_gbd_weeks', phase: 'registration',
        question: 'Gestational age — weeks?',
        type: 'text', required: false, factKey: 'biodata_gbd_weeks',
        cqae: { sex: 'female', ageGroups: ['adolescent', 'adult', 'elderly'] },
      },
      {
        id: 'q_biodata_gbd_days', phase: 'registration',
        question: 'Gestational age — days?',
        type: 'text', required: false, factKey: 'biodata_gbd_days',
        cqae: { sex: 'female', ageGroups: ['adolescent', 'adult', 'elderly'] },
      },
      { id: 'q_occupation', phase: 'registration', question: 'Occupation', type: 'text', required: false, factKey: 'occupation', cqae: { ageGroups: ['adolescent', 'adult', 'elderly'] } },
      { id: 'q_residence', phase: 'registration', question: 'Residence', type: 'text', required: false, factKey: 'residence' },
      { id: 'q_dob', phase: 'registration', question: 'Date of Birth', type: 'date', required: false, factKey: 'dob' },
      { id: 'q_marital_status', phase: 'registration', question: 'Marital Status', type: 'chips', chips: ['Single', 'Married', 'Divorced', 'Widowed'], required: false, factKey: 'marital_status', cqae: { ageGroups: ['adolescent', 'adult', 'elderly'] } },
      { id: 'q_nationality', phase: 'registration', question: 'Nationality', type: 'text', required: false, factKey: 'nationality' },
      { id: 'q_phone', phase: 'registration', question: 'Contact Phone', type: 'text', required: false, factKey: 'phone' },
      { id: 'q_next_of_kin', phase: 'registration', question: 'Next of Kin', type: 'text', required: false, factKey: 'next_of_kin' },
      { id: 'q_informant', phase: 'registration', question: 'Informant', type: 'chips', chips: ['Patient', 'Spouse', 'Parent', 'Child', 'Sibling', 'Other'], required: true, factKey: 'informant' },
      { id: 'q_informant_relation', phase: 'registration', question: 'Informant Relationship', type: 'chips', chips: ['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Other'], required: false, factKey: 'informant_relation' },
      { id: 'q_reliability', phase: 'registration', question: 'Reliability of History', type: 'chips', chips: ['Good', 'Fair', 'Poor'], required: true, factKey: 'reliability' },
      { id: 'q_date_of_admission', phase: 'registration', question: 'Date of Admission', type: 'date', required: false, factKey: 'date_of_admission' },
      { id: 'q_hospital_number', phase: 'registration', question: 'Hospital Number', type: 'text', required: true, factKey: 'hospital_number' },
    ],
  },
  encounter_context: {
    id: 'encounter_context',
    label: 'Encounter Context',
    phase: 'registration',
    cards: [
      { id: 'q_department', phase: 'registration', question: 'Department', type: 'text', required: true, factKey: 'department' },
      { id: 'q_encounter_type', phase: 'registration', question: 'Encounter Type', type: 'chips', chips: ['Outpatient', 'Emergency', 'Inpatient', 'Ward Round', 'Follow-up', 'Procedure', 'Telemedicine'], required: true, factKey: 'encounter_type' },
      { id: 'q_referral_source', phase: 'registration', question: 'Referred From', type: 'chips', chips: ['Self', 'Clinic', 'Hospital Transfer', 'Emergency', 'Other'], required: false, factKey: 'referral_source' },
      { id: 'q_mode_arrival', phase: 'registration', question: 'Mode of Arrival', type: 'chips', chips: ['Walking', 'Wheelchair', 'Stretcher', 'Ambulance', 'Police'], required: false, factKey: 'mode_arrival' },
      { id: 'q_triage_category', phase: 'registration', question: 'Triage Category', type: 'chips', chips: ['Resuscitation', 'Emergency', 'Urgent', 'Semi-urgent', 'Non-urgent'], required: false, factKey: 'triage_category' },
    ],
  },

  // ═══════════════════════════════════════════
  // REPRODUCTIVE & OBGYN cards are now inline within patient_identity above,
  // appearing right after Sex so they flow naturally for female patients.
  // ═══════════════════════════════════════════

  // ═══════════════════════════════════════════
  // CHIEF COMPLAINT
  // ═══════════════════════════════════════════
  chief_complaint: {
    id: 'chief_complaint',
    label: 'What brings you in today?',
    phase: 'chief_complaint',
    cards: [
      { id: 'q_cc_primary', phase: 'chief_complaint', question: 'Main problem', type: 'chips',
        chips: ['Abdominal pain', 'Chest pain', 'Headache', 'Fever', 'Cough', 'Breathlessness', 'Nausea/Vomiting', 'Diarrhea', 'Injury/Fall', 'Rash', 'Dizziness', 'Seizure', 'Urinary problem', 'Back pain', 'Swelling', 'Bleeding', 'Fatigue', 'Other'],
        required: true, factKey: 'cc_primary' },
      { id: 'q_cc_duration', phase: 'chief_complaint', question: 'How long?', type: 'chips',
        chips: ['Hours', '1 day', '2-3 days', '1 week', '2 weeks', '1 month', '>1 month'], required: true, factKey: 'cc_duration' },
      { id: 'q_cc_onset', phase: 'chief_complaint', question: 'When did it start?', type: 'chips',
        chips: ['Today', 'Yesterday', 'Few days ago', '1 week ago', '2 weeks ago', '1 month ago', 'Longer'], required: true, factKey: 'cc_onset' },
      { id: 'q_cc_patient_words', phase: 'chief_complaint', question: 'Tell me more (optional)', type: 'text', required: false, factKey: 'cc_patient_words' },
    ],
  },
  additional_complaints: {
    id: 'additional_complaints',
    label: 'Additional Complaints',
    phase: 'chief_complaint',
    cards: [
      { id: 'q_cc_secondary_1', phase: 'chief_complaint', question: 'Any other problem?', type: 'chips',
        chips: ['Nausea', 'Vomiting', 'Fever', 'Constipation', 'Diarrhea', 'Weight loss', 'Dysuria', 'Cough', 'None'],
        required: false, factKey: 'cc_secondary_1' },
    ],
  },

  // ═══════════════════════════════════════════
  // HPI — PAIN SOCRATES
  // ═══════════════════════════════════════════
  hpi_pain_socrates: {
    id: 'hpi_pain_socrates',
    label: 'About the Pain',
    phase: 'hpi',
    condition: { complaint: 'pain' },
    cards: [
      {
        id: 'q_socrates_site', phase: 'hpi', group: 'socrates', groupLabel: 'ABOUT THE PAIN',
        question: 'Where is the pain?', type: 'chips',
        chips: ['Around umbilicus', 'Right lower abdomen', 'Left lower abdomen', 'Upper abdomen', 'Right upper', 'Left upper', 'Epigastric', 'Generalized', 'Patient points'],
        required: true, factKey: 'pain_site',
      },
      {
        id: 'q_socrates_onset', phase: 'hpi', group: 'socrates',
        question: 'How did it begin?', type: 'chips',
        chips: ['Suddenly', 'Gradually', 'Unsure'],
        required: true, factKey: 'pain_onset',
      },
      {
        id: 'q_socrates_character', phase: 'hpi', group: 'socrates',
        question: 'What is the character?', type: 'chips',
        chips: ['Sharp/Stabbing', 'Dull/Aching', 'Burning', 'Cramping', 'Colicky', 'Pressure', 'Tearing'],
        required: true, factKey: 'pain_character',
      },
      {
        id: 'q_socrates_radiation', phase: 'hpi', group: 'socrates',
        question: 'Does it radiate anywhere?', type: 'chips',
        chips: ['No radiation', 'To back', 'To shoulder', 'To groin', 'Down leg', 'To chest'],
        required: false, factKey: 'pain_radiation',
      },
      {
        id: 'q_socrates_severity', phase: 'hpi', group: 'socrates',
        question: 'Severity (0-10)?', type: 'scale',
        options: Array.from({ length: 11 }, (_, i) => ({ label: `${i}`, value: `${i}` })),
        required: true, factKey: 'pain_severity',
      },
      {
        id: 'q_socrates_timing', phase: 'hpi', group: 'socrates',
        question: 'Is it constant or intermittent?', type: 'chips',
        chips: ['Constant', 'Intermittent', 'Colicky', 'Waxing/waning'],
        required: true, factKey: 'pain_timing',
      },
      {
        id: 'q_socrates_aggravating', phase: 'hpi', group: 'socrates',
        question: 'What makes it worse?', type: 'chips', multiple: true,
        chips: ['Movement', 'Coughing', 'Deep breathing', 'Walking', 'Eating', 'Lying flat', 'Touching'],
        required: false, factKey: 'pain_aggravating',
      },
      {
        id: 'q_socrates_relieving', phase: 'hpi', group: 'socrates',
        question: 'What makes it better?', type: 'chips', multiple: true,
        chips: ['Rest', 'Medication', 'Flexing hips', 'Lying still', 'Bending forward', 'Nothing'],
        required: false, factKey: 'pain_relieving',
      },
      {
        id: 'q_socrates_progression', phase: 'hpi', group: 'socrates',
        question: 'Has it changed since onset?', type: 'chips',
        chips: ['Worsening', 'Stable', 'Improving', 'Migrating', 'Fluctuating'],
        required: true, factKey: 'pain_progression',
      },
      {
        id: 'q_socrates_migration', phase: 'hpi', group: 'socrates',
        question: 'Has the pain moved?', type: 'chips',
        chips: ['No', 'From umbilicus to RIF', 'From epigastrium to RIF', 'From back to front', 'Diffuse to localized'],
        required: false, factKey: 'pain_migration',
        dependsOn: { questionId: 'q_socrates_progression', value: 'Migrating' },
      },
    ],
  },

  // HPI — FEVER SOCRATES (when complaint is fever)
  hpi_fever_socrates: {
    id: 'hpi_fever_socrates',
    label: 'About the Fever (SOCRATES)',
    phase: 'hpi',
    condition: { complaint: 'fever' },
    cards: [
      { id: 'q_fever_onset', phase: 'hpi', group: 'fever_socrates', groupLabel: 'FEVER SOCRATES',
        question: 'How did the fever start?', type: 'chips',
        chips: ['Suddenly', 'Gradually', 'Not sure'], required: true, factKey: 'fever_onset' },
      { id: 'q_fever_duration', phase: 'hpi',
        question: 'How long have you had fever?', type: 'chips',
        chips: ['Hours', '1 day', '2-3 days', '1 week', '2 weeks', '>2 weeks'], required: true, factKey: 'fever_duration' },
      { id: 'q_fever_pattern', phase: 'hpi',
        question: 'What is the pattern of the fever?', type: 'chips',
        chips: ['Constant', 'Comes and goes', 'Worse at night', 'Worse in afternoon'], required: true, factKey: 'fever_pattern' },
      { id: 'q_fever_severity', phase: 'hpi',
        question: 'How high is the fever?', type: 'chips',
        chips: ['Mild (<38°C)', 'Moderate (38-39°C)', 'High (39-40°C)', 'Very high (>40°C)', 'Not measured'], required: true, factKey: 'fever_severity' },
      { id: 'q_fever_rigors', phase: 'hpi',
        question: 'Have you had rigors (severe shaking chills)?', type: 'boolean', required: true, factKey: 'fever_rigors' },
      { id: 'q_fever_night_sweats', phase: 'hpi',
        question: 'Night sweats?', type: 'boolean', required: false, factKey: 'fever_night_sweats' },
      { id: 'q_fever_med_response', phase: 'hpi',
        question: 'Does fever respond to paracetamol?', type: 'chips',
        chips: ['Good response', 'Partial', 'No response', 'Not taken'], required: false, factKey: 'fever_med_response' },
    ],
  },
  hpi_fever_associated: {
    id: 'hpi_fever_associated',
    label: 'Associated Symptoms',
    phase: 'hpi',
    condition: { complaint: 'fever' },
    cards: [
      { id: 'q_fever_headache', phase: 'hpi', question: 'Headache?', type: 'boolean', required: true, factKey: 'fever_headache' },
      { id: 'q_fever_vomiting', phase: 'hpi', question: 'Vomiting?', type: 'boolean', required: true, factKey: 'fever_vomiting' },
      { id: 'q_fever_diarrhea', phase: 'hpi', question: 'Diarrhea?', type: 'boolean', required: true, factKey: 'fever_diarrhea' },
      { id: 'q_fever_cough', phase: 'hpi', question: 'Cough?', type: 'boolean', required: true, factKey: 'fever_cough' },
      { id: 'q_fever_joint_pain', phase: 'hpi', question: 'Joint or muscle pains?', type: 'boolean', required: false, factKey: 'fever_joint_pain' },
      { id: 'q_fever_rash', phase: 'hpi', question: 'Skin rash?', type: 'boolean', required: false, factKey: 'fever_rash' },
      { id: 'q_fever_abdominal_pain', phase: 'hpi', question: 'Abdominal pain?', type: 'boolean', required: false, factKey: 'fever_abdominal_pain' },
      { id: 'q_fever_urinary', phase: 'hpi', question: 'Pain on urination / frequency?', type: 'boolean', required: false, factKey: 'fever_urinary' },
      { id: 'q_fever_travel', phase: 'hpi', question: 'Recent travel to malaria-endemic area?', type: 'boolean', required: true, factKey: 'fever_travel' },
      { id: 'q_fever_prior_meds', phase: 'hpi', question: 'What have you taken?', type: 'chips', multiple: true,
        chips: ['Paracetamol', 'Ibuprofen', 'Antimalarials', 'Antibiotics', 'Herbal', 'Nothing'], required: false, factKey: 'fever_prior_meds' },
    ],
  },

  // CHIEF COMPLAINT — ASSOCIATED SYMPTOMS (for pain)
  hpi_associated_pain: {
    id: 'hpi_associated_pain',
    label: 'Associated Symptoms',
    phase: 'hpi',
    condition: { complaint: 'pain' },
    cards: [
      {
        id: 'q_associated_symptoms', phase: 'hpi', group: 'associated_symptoms',
        question: 'Any associated symptoms?', type: 'chips', multiple: true,
        chips: ['Nausea', 'Vomiting', 'Fever', 'Constipation', 'Diarrhea', 'Weight loss', 'Dysuria', 'Frequency', 'Blood in stool', 'Distension', 'Anorexia', 'Fatigue', 'Sweating'],
        required: false, factKey: 'associated_symptoms',
      },
      {
        id: 'q_vomiting_details', phase: 'hpi',
        question: 'Tell me about the vomiting', type: 'chips', multiple: true,
        chips: ['Food content', 'Bilious', 'Blood', 'Coffee-ground', 'Feculent', 'Projectile'],
        required: false, factKey: 'vomiting_details',
        dependsOn: { questionId: 'q_associated_symptoms', value: 'Vomiting' },
      },
    ],
  },

  // HPI — GENERAL (for non-pain complaints)
  hpi_general: {
    id: 'hpi_general',
    label: 'History of Presenting Illness',
    phase: 'hpi',
    cards: [
      { id: 'q_hpi_onset', phase: 'hpi', question: 'How did it start?', type: 'chips', chips: ['Suddenly', 'Gradually', 'After an event', 'Unsure'], required: true, factKey: 'hpi_onset' },
      { id: 'q_hpi_progression', phase: 'hpi', question: 'How has it changed?', type: 'chips', chips: ['Getting worse', 'Staying same', 'Getting better', 'Coming and going'], required: true, factKey: 'hpi_progression' },
      { id: 'q_hpi_health_seeking', phase: 'hpi', question: 'What have you done about it?', type: 'chips', multiple: true,
        chips: ['Self-medication', 'Pharmacy', 'Clinic visit', 'Hospital visit', 'Traditional healer', 'Nothing'], required: false, factKey: 'health_seeking' },
      { id: 'q_hpi_meds_tried', phase: 'hpi', question: 'Any medications?', type: 'chips', multiple: true,
        chips: ['Paracetamol', 'Ibuprofen', 'Antibiotics', 'Antacids', 'Painkillers', 'Herbal', 'None'], required: false, factKey: 'meds_tried' },
      { id: 'q_hpi_previous_episodes', phase: 'hpi', question: 'Has this happened before?', type: 'boolean', required: false, factKey: 'previous_episodes' },
      { id: 'q_hpi_functional_impact', phase: 'hpi', question: 'How has it affected your life?', type: 'chips', multiple: true,
        chips: ['Work', 'Sleep', 'Eating', 'Walking', 'Self-care', 'Social', 'Mood'], required: false, factKey: 'functional_impact' },
    ],
  },

  // ═══════════════════════════════════════════
  // PAST MEDICAL HISTORY
  // ═══════════════════════════════════════════
  pmh_screening: {
    id: 'pmh_screening',
    label: 'Past Medical History',
    phase: 'past_medical',
    cards: [
      {
        id: 'q_pmh_has_conditions', phase: 'past_medical',
        question: 'Does the patient have any known chronic medical conditions? (Hypertension, Diabetes, TB, HIV, Asthma, etc.)', type: 'chips',
        chips: ['None', 'Yes'],
        required: true, factKey: 'pmh_has_conditions',
      },
      {
        id: 'q_pmh_conditions', phase: 'past_medical',
        question: 'Select all that apply', type: 'chips', multiple: true,
        chips: ['Hypertension', 'Diabetes', 'Asthma', 'TB', 'HIV', 'CKD', 'Cancer', 'Epilepsy', 'Heart Disease', 'Stroke', 'Liver Disease', 'Peptic Ulcer', 'Thyroid', 'Anemia', 'Sickle Cell', 'COPD', 'Cerebral Palsy'],
        required: true, factKey: 'pmh_conditions',
        dependsOn: { questionId: 'q_pmh_has_conditions', value: 'Yes' },
      },
    ],
  },
  pmh_hypertension: {
    id: 'pmh_hypertension',
    label: 'Hypertension Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Hypertension' },
    cards: [
      { id: 'q_htn_year', phase: 'past_medical', question: 'Year diagnosed?', type: 'text', required: false, factKey: 'htn_year' },
      { id: 'q_htn_treatment', phase: 'past_medical', question: 'On treatment?', type: 'boolean', required: false, factKey: 'htn_treatment' },
      { id: 'q_htn_compliance', phase: 'past_medical', question: 'Compliance?', type: 'chips', chips: ['Good', 'Fair', 'Poor'], required: false, factKey: 'htn_compliance' },
      { id: 'q_htn_control', phase: 'past_medical', question: 'Current control?', type: 'chips', chips: ['Well controlled', 'Moderate', 'Poor'], required: false, factKey: 'htn_control' },
    ],
  },
  pmh_diabetes: {
    id: 'pmh_diabetes',
    label: 'Diabetes Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Diabetes' },
    cards: [
      { id: 'q_dm_year', phase: 'past_medical', question: 'Year diagnosed?', type: 'text', required: false, factKey: 'dm_year' },
      { id: 'q_dm_type', phase: 'past_medical', question: 'Type?', type: 'chips', chips: ['Type 1', 'Type 2'], required: false, factKey: 'dm_type' },
      { id: 'q_dm_treatment', phase: 'past_medical', question: 'Treatment?', type: 'chips', chips: ['Diet', 'Oral', 'Insulin', 'Combination'], required: false, factKey: 'dm_treatment' },
      { id: 'q_dm_complications', phase: 'past_medical', question: 'Any complications?', type: 'chips', multiple: true, chips: ['None', 'Retinopathy', 'Nephropathy', 'Neuropathy', 'Foot ulcer'], required: false, factKey: 'dm_complications' },
    ],
  },

  pmh_asthma: {
    id: 'pmh_asthma',
    label: 'Asthma Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Asthma' },
    cards: [
      { id: 'q_asthma_age_diagnosis', phase: 'past_medical', question: 'Age at diagnosis?', type: 'text', required: false, factKey: 'asthma_age_diagnosis' },
      { id: 'q_asthma_severity', phase: 'past_medical', question: 'Severity classification?', type: 'chips', chips: ['Intermittent', 'Mild persistent', 'Moderate persistent', 'Severe persistent'], required: false, factKey: 'asthma_severity' },
      { id: 'q_asthma_triggers', phase: 'past_medical', question: 'Known triggers?', type: 'chips', multiple: true, chips: ['Allergens', 'Exercise', 'Cold air', 'Infections', 'Smoke', 'Stress', 'Medications'], required: false, factKey: 'asthma_triggers' },
      { id: 'q_asthma_medications', phase: 'past_medical', question: 'Current medications?', type: 'text', required: false, factKey: 'asthma_medications' },
      { id: 'q_asthma_last_exacerbation', phase: 'past_medical', question: 'Last exacerbation/hospitalization?', type: 'text', required: false, factKey: 'asthma_last_exacerbation' },
      { id: 'q_asthma_control', phase: 'past_medical', question: 'Current control?', type: 'chips', chips: ['Well controlled', 'Partly controlled', 'Uncontrolled'], required: false, factKey: 'asthma_control' },
    ],
  },
  pmh_tb: {
    id: 'pmh_tb',
    label: 'TB Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'TB' },
    cards: [
      { id: 'q_tb_year', phase: 'past_medical', question: 'Year of TB diagnosis?', type: 'text', required: false, factKey: 'tb_year' },
      { id: 'q_tb_site', phase: 'past_medical', question: 'Site of TB?', type: 'chips', chips: ['Pulmonary', 'Lymph node', 'Pleural', 'Miliary', 'Abdominal', 'Meningeal', 'Bone/Joint', 'Other'], required: false, factKey: 'tb_site' },
      { id: 'q_tb_treatment_completed', phase: 'past_medical', question: 'Completed full treatment?', type: 'boolean', required: false, factKey: 'tb_treatment_completed' },
      { id: 'q_tb_dot', phase: 'past_medical', question: 'Was on DOT?', type: 'boolean', required: false, factKey: 'tb_dot' },
      { id: 'q_tb_drug_resistance', phase: 'past_medical', question: 'Known drug resistance?', type: 'chips', chips: ['None', 'INH resistant', 'Rifampicin resistant', 'MDR-TB', 'XDR-TB'], required: false, factKey: 'tb_drug_resistance' },
      { id: 'q_tb_household_contact', phase: 'past_medical', question: 'Household TB contact?', type: 'boolean', required: false, factKey: 'tb_household_contact' },
    ],
  },
  pmh_hiv: {
    id: 'pmh_hiv',
    label: 'HIV Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'HIV' },
    cards: [
      { id: 'q_hiv_year', phase: 'past_medical', question: 'Year of HIV diagnosis?', type: 'text', required: false, factKey: 'hiv_year' },
      { id: 'q_hiv_on_art', phase: 'past_medical', question: 'On ART?', type: 'boolean', required: false, factKey: 'hiv_on_art' },
      { id: 'q_hiv_art_regimen', phase: 'past_medical', question: 'ART regimen?', type: 'chips', chips: ['TDF+3TC+DTG', 'AZT+3TC+NVP', 'TDF+3TC+EFV', 'ABC+3TC+DTG', 'TDF+FTC+DTG', 'Other'], required: false, factKey: 'hiv_art_regimen' },
      { id: 'q_hiv_adherence', phase: 'past_medical', question: 'Adherence?', type: 'chips', chips: ['Good (≥95%)', 'Fair (85-94%)', 'Poor (<85%)'], required: false, factKey: 'hiv_adherence' },
      { id: 'q_hiv_latest_cd4', phase: 'past_medical', question: 'Latest CD4 count?', type: 'text', required: false, factKey: 'hiv_latest_cd4' },
      { id: 'q_hiv_latest_viral_load', phase: 'past_medical', question: 'Latest viral load?', type: 'chips', chips: ['Undetectable', '<1000', '>1000', 'Unknown'], required: false, factKey: 'hiv_latest_viral_load' },
      { id: 'q_hiv_who_stage', phase: 'past_medical', question: 'WHO Clinical Stage?', type: 'chips', chips: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'], required: false, factKey: 'hiv_who_stage' },
      { id: 'q_hiv_oi_history', phase: 'past_medical', question: 'History of opportunistic infections?', type: 'chips', multiple: true, chips: ['None', 'TB', 'PCP', 'Cryptococcal meningitis', 'Toxoplasmosis', 'CMV', 'Oral candidiasis', 'Kaposi sarcoma'], required: false, factKey: 'hiv_oi_history' },
    ],
  },
  pmh_sickle_cell: {
    id: 'pmh_sickle_cell',
    label: 'Sickle Cell Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Sickle Cell' },
    cards: [
      { id: 'q_scd_genotype', phase: 'past_medical', question: 'Genotype?', type: 'chips', chips: ['HbSS', 'HbSC', 'HbS-beta thal'], required: false, factKey: 'scd_genotype' },
      { id: 'q_scd_frequency', phase: 'past_medical', question: 'Frequency of crises?', type: 'chips', chips: ['Rare (<1/year)', 'Intermittent (1-3/year)', 'Frequent (>3/year)'], required: false, factKey: 'scd_crisis_frequency' },
      { id: 'q_scd_last_crisis', phase: 'past_medical', question: 'Last crisis date?', type: 'text', required: false, factKey: 'scd_last_crisis' },
      { id: 'q_scd_complications', phase: 'past_medical', question: 'Past complications?', type: 'chips', multiple: true, chips: ['None', 'Acute chest syndrome', 'Stroke', 'Splenic sequestration', 'Leg ulcers', 'Avascular necrosis', 'Priapism'], required: false, factKey: 'scd_complications' },
      { id: 'q_scd_hydroxyurea', phase: 'past_medical', question: 'On hydroxyurea?', type: 'boolean', required: false, factKey: 'scd_hydroxyurea' },
      { id: 'q_scd_transfusion', phase: 'past_medical', question: 'Chronic transfusion program?', type: 'boolean', required: false, factKey: 'scd_transfusion_program' },
    ],
  },
  pmh_ckd: {
    id: 'pmh_ckd',
    label: 'CKD Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'CKD' },
    cards: [
      { id: 'q_ckd_stage', phase: 'past_medical', question: 'CKD Stage?', type: 'chips', chips: ['Stage 1', 'Stage 2', 'Stage 3a', 'Stage 3b', 'Stage 4', 'Stage 5'], required: false, factKey: 'ckd_stage' },
      { id: 'q_ckd_etiology', phase: 'past_medical', question: 'Etiology?', type: 'chips', chips: ['HTN', 'Diabetes', 'GN', 'PKD', 'Obstructive', 'Unknown', 'Other'], required: false, factKey: 'ckd_etiology' },
      { id: 'q_ckd_latest_creatinine', phase: 'past_medical', question: 'Latest creatinine?', type: 'text', required: false, factKey: 'ckd_latest_creatinine' },
      { id: 'q_ckd_latest_egfr', phase: 'past_medical', question: 'Latest eGFR?', type: 'text', required: false, factKey: 'ckd_latest_egfr' },
      { id: 'q_ckd_dialysis', phase: 'past_medical', question: 'On dialysis?', type: 'boolean', required: false, factKey: 'ckd_dialysis' },
      { id: 'q_ckd_transplant', phase: 'past_medical', question: 'Kidney transplant?', type: 'boolean', required: false, factKey: 'ckd_transplant' },
    ],
  },
  pmh_cancer: {
    id: 'pmh_cancer',
    label: 'Cancer Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Cancer' },
    cards: [
      { id: 'q_cancer_primary', phase: 'past_medical', question: 'Primary site?', type: 'text', required: false, factKey: 'cancer_primary' },
      { id: 'q_cancer_year', phase: 'past_medical', question: 'Year of diagnosis?', type: 'text', required: false, factKey: 'cancer_year' },
      { id: 'q_cancer_treatment', phase: 'past_medical', question: 'Treatment received?', type: 'chips', multiple: true, chips: ['Surgery', 'Chemotherapy', 'Radiotherapy', 'Hormonal', 'Immunotherapy', 'Palliative only'], required: false, factKey: 'cancer_treatment' },
      { id: 'q_cancer_remission', phase: 'past_medical', question: 'Current status?', type: 'chips', chips: ['Active', 'Remission', 'Cured', 'Palliative', 'Unknown'], required: false, factKey: 'cancer_status' },
    ],
  },
  pmh_epilepsy: {
    id: 'pmh_epilepsy',
    label: 'Epilepsy Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Epilepsy' },
    cards: [
      { id: 'q_epilepsy_age_onset', phase: 'past_medical', question: 'Age at onset?', type: 'text', required: false, factKey: 'epilepsy_age_onset' },
      { id: 'q_epilepsy_seizure_type', phase: 'past_medical', question: 'Seizure type?', type: 'chips', chips: ['Generalized tonic-clonic', 'Focal', 'Absence', 'Myoclonic', 'Mixed'], required: false, factKey: 'epilepsy_seizure_type' },
      { id: 'q_epilepsy_frequency', phase: 'past_medical', question: 'Seizure frequency?', type: 'chips', chips: ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Rare'], required: false, factKey: 'epilepsy_frequency' },
      { id: 'q_epilepsy_medications', phase: 'past_medical', question: 'Current AEDs?', type: 'text', required: false, factKey: 'epilepsy_medications' },
      { id: 'q_epilepsy_last_seizure', phase: 'past_medical', question: 'Last seizure?', type: 'text', required: false, factKey: 'epilepsy_last_seizure' },
    ],
  },
  pmh_heart_disease: {
    id: 'pmh_heart_disease',
    label: 'Heart Disease Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Heart Disease' },
    cards: [
      { id: 'q_hd_type', phase: 'past_medical', question: 'Type of heart disease?', type: 'chips', chips: ['CAD', 'Heart failure', 'Valvular', 'Arrhythmia', 'Congenital', 'RHD', 'Cardiomyopathy'], required: false, factKey: 'heart_disease_type' },
      { id: 'q_hd_year', phase: 'past_medical', question: 'Year of diagnosis?', type: 'text', required: false, factKey: 'heart_disease_year' },
      { id: 'q_hd_medications', phase: 'past_medical', question: 'Cardiac medications?', type: 'text', required: false, factKey: 'heart_disease_medications' },
      { id: 'q_hd_surgery', phase: 'past_medical', question: 'Cardiac surgery?', type: 'boolean', required: false, factKey: 'heart_disease_surgery' },
      { id: 'q_hd_nyha', phase: 'past_medical', question: 'NYHA Class (if HF)?', type: 'chips', chips: ['Class I', 'Class II', 'Class III', 'Class IV'], required: false, factKey: 'heart_disease_nyha' },
      { id: 'q_hd_echo', phase: 'past_medical', question: 'Latest echo findings?', type: 'text', required: false, factKey: 'heart_disease_echo' },
    ],
  },
  pmh_stroke: {
    id: 'pmh_stroke',
    label: 'Stroke Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Stroke' },
    cards: [
      { id: 'q_stroke_year', phase: 'past_medical', question: 'Year of stroke?', type: 'text', required: false, factKey: 'stroke_year' },
      { id: 'q_stroke_type', phase: 'past_medical', question: 'Type?', type: 'chips', chips: ['Ischemic', 'Hemorrhagic', 'TIA', 'Unknown'], required: false, factKey: 'stroke_type' },
      { id: 'q_stroke_residual', phase: 'past_medical', question: 'Residual deficits?', type: 'chips', multiple: true, chips: ['None', 'Hemiparesis', 'Aphasia', 'Dysphagia', 'Cognitive', 'Visual'], required: false, factKey: 'stroke_residual' },
      { id: 'q_stroke_imaging', phase: 'past_medical', question: 'Neuroimaging done?', type: 'chips', chips: ['CT', 'MRI', 'Both', 'None'], required: false, factKey: 'stroke_imaging' },
    ],
  },
  pmh_liver_disease: {
    id: 'pmh_liver_disease',
    label: 'Liver Disease Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Liver Disease' },
    cards: [
      { id: 'q_ld_etiology', phase: 'past_medical', question: 'Etiology?', type: 'chips', chips: ['Alcohol', 'NAFLD', 'Hepatitis B', 'Hepatitis C', 'Autoimmune', 'Cirrhosis', 'Other'], required: false, factKey: 'liver_disease_etiology' },
      { id: 'q_ld_know_status', phase: 'past_medical', question: 'Known complications?', type: 'chips', multiple: true, chips: ['None', 'Ascites', 'Varices', 'Encephalopathy', 'Jaundice', 'Coagulopathy'], required: false, factKey: 'liver_disease_complications' },
      { id: 'q_ld_lfts', phase: 'past_medical', question: 'Latest LFTs?', type: 'text', required: false, factKey: 'liver_disease_lfts' },
    ],
  },
  pmh_copd: {
    id: 'pmh_copd',
    label: 'COPD Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'COPD' },
    cards: [
      { id: 'q_copd_year', phase: 'past_medical', question: 'Year of diagnosis?', type: 'text', required: false, factKey: 'copd_year' },
      { id: 'q_copd_gold_stage', phase: 'past_medical', question: 'GOLD Stage?', type: 'chips', chips: ['Stage 1 (Mild)', 'Stage 2 (Moderate)', 'Stage 3 (Severe)', 'Stage 4 (Very severe)'], required: false, factKey: 'copd_gold_stage' },
      { id: 'q_copd_exacerbations', phase: 'past_medical', question: 'Exacerbations in past year?', type: 'chips', chips: ['0', '1', '2', '3+'], required: false, factKey: 'copd_exacerbations' },
      { id: 'q_copd_hospitalizations', phase: 'past_medical', question: 'Hospitalizations for COPD?', type: 'text', required: false, factKey: 'copd_hospitalizations' },
      { id: 'q_copd_medications', phase: 'past_medical', question: 'Current COPD medications?', type: 'text', required: false, factKey: 'copd_medications' },
      { id: 'q_copd_home_o2', phase: 'past_medical', question: 'On home oxygen?', type: 'boolean', required: false, factKey: 'copd_home_o2' },
    ],
  },
  pmh_thyroid: {
    id: 'pmh_thyroid',
    label: 'Thyroid Disease Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Thyroid' },
    cards: [
      { id: 'q_thyroid_type', phase: 'past_medical', question: 'Type?', type: 'chips', chips: ['Hypothyroidism', 'Hyperthyroidism', 'Goiter', 'Thyroid nodule', 'Thyroid cancer'], required: false, factKey: 'thyroid_type' },
      { id: 'q_thyroid_year', phase: 'past_medical', question: 'Year of diagnosis?', type: 'text', required: false, factKey: 'thyroid_year' },
      { id: 'q_thyroid_treatment', phase: 'past_medical', question: 'Treatment?', type: 'chips', chips: ['Medication', 'Radioiodine', 'Surgery', 'Observation'], required: false, factKey: 'thyroid_treatment' },
      { id: 'q_thyroid_current_meds', phase: 'past_medical', question: 'Current thyroid medication?', type: 'text', required: false, factKey: 'thyroid_medication' },
    ],
  },
  pmh_anemia: {
    id: 'pmh_anemia',
    label: 'Anemia Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Anemia' },
    cards: [
      { id: 'q_anemia_type', phase: 'past_medical', question: 'Known type?', type: 'chips', chips: ['Iron deficiency', 'B12 deficiency', 'Folate deficiency', 'Hemolytic', 'Aplastic', 'Of chronic disease', 'Unknown'], required: false, factKey: 'anemia_type' },
      { id: 'q_anemia_severity', phase: 'past_medical', question: 'Severity?', type: 'chips', chips: ['Mild (Hb 10-12)', 'Moderate (Hb 7-10)', 'Severe (Hb <7)'], required: false, factKey: 'anemia_severity' },
      { id: 'q_anemia_hb', phase: 'past_medical', question: 'Latest Hb?', type: 'text', required: false, factKey: 'anemia_latest_hb' },
      { id: 'q_anemia_treatment', phase: 'past_medical', question: 'On treatment?', type: 'text', required: false, factKey: 'anemia_treatment' },
    ],
  },
  pmh_peptic_ulcer: {
    id: 'pmh_peptic_ulcer',
    label: 'Peptic Ulcer Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Peptic Ulcer' },
    cards: [
      { id: 'q_pud_year', phase: 'past_medical', question: 'Year of diagnosis?', type: 'text', required: false, factKey: 'pud_year' },
      { id: 'q_pud_endoscopy', phase: 'past_medical', question: 'Endoscopy done?', type: 'boolean', required: false, factKey: 'pud_endoscopy' },
      { id: 'q_pud_hpylori', phase: 'past_medical', question: 'H. pylori treated?', type: 'boolean', required: false, factKey: 'pud_hpylori_treated' },
      { id: 'q_pud_current_meds', phase: 'past_medical', question: 'Current acid suppression?', type: 'chips', chips: ['None', 'Omeprazole', 'Pantoprazole', 'Ranitidine', 'Antacids'], required: false, factKey: 'pud_medication' },
      { id: 'q_pud_complications', phase: 'past_medical', question: 'Past complications?', type: 'chips', multiple: true, chips: ['None', 'Bleeding', 'Perforation', 'Stricture'], required: false, factKey: 'pud_complications' },
    ],
  },
  pmh_cerebral_palsy: {
    id: 'pmh_cerebral_palsy',
    label: 'Cerebral Palsy Details',
    phase: 'past_medical',
    condition: { factKey: 'pmh_conditions', value: 'Cerebral Palsy' },
    cards: [
      { id: 'q_cp_type', phase: 'past_medical', question: 'Type of CP?', type: 'chips', chips: ['Spastic', 'Dyskinetic', 'Ataxic', 'Hypotonic', 'Mixed'], required: false, factKey: 'cp_type' },
      { id: 'q_cp_topography', phase: 'past_medical', question: 'Topographical distribution?', type: 'chips', chips: ['Monoplegia', 'Hemiplegia', 'Diplegia', 'Quadriplegia', 'Triplegia'], required: false, factKey: 'cp_topography' },
      { id: 'q_cp_gmfcs', phase: 'past_medical', question: 'GMFCS Level?', type: 'chips', chips: ['Level I (Walks)', 'Level II', 'Level III', 'Level IV', 'Level V (Non-ambulatory)'], required: false, factKey: 'cp_gmfcs' },
      { id: 'q_cp_mobility', phase: 'past_medical', question: 'Mobility status?', type: 'chips', chips: ['Walks independently', 'Walks with aid', 'Wheelchair', 'Bedridden'], required: false, factKey: 'cp_mobility' },
      { id: 'q_cp_speech', phase: 'past_medical', question: 'Speech / communication?', type: 'chips', chips: ['Normal', 'Dysarthria', 'Non-verbal', 'Augmentative communication'], required: false, factKey: 'cp_speech' },
      { id: 'q_cp_feed', phase: 'past_medical', question: 'Feeding/swallowing issues?', type: 'chips', chips: ['None', 'Dysphagia', 'Gastrostomy tube', 'Aspiration risk'], required: false, factKey: 'cp_feeding' },
      { id: 'q_cp_seizures', phase: 'past_medical', question: 'Associated seizures?', type: 'boolean', required: false, factKey: 'cp_seizures' },
      { id: 'q_cp_cognition', phase: 'past_medical', question: 'Cognitive impairment?', type: 'chips', chips: ['None', 'Mild', 'Moderate', 'Severe'], required: false, factKey: 'cp_cognition' },
      { id: 'q_cp_therapies', phase: 'past_medical', question: 'Current therapies?', type: 'chips', multiple: true, chips: ['Physiotherapy', 'OT', 'Speech therapy', 'Orthotics', 'Medications', 'None'], required: false, factKey: 'cp_therapies' },
      { id: 'q_cp_orthopedic', phase: 'past_medical', question: 'Orthopedic issues?', type: 'chips', multiple: true, chips: ['None', 'Scoliosis', 'Hip dislocation', 'Contractures', 'Foot deformity'], required: false, factKey: 'cp_orthopedic' },
    ],
  },

  pmh_previous_admissions: {
    id: 'pmh_previous_admissions',
    label: 'Previous Hospital Admissions',
    phase: 'past_medical',
    cards: [
      { id: 'q_pmh_prev_admission', phase: 'past_medical', question: 'Has the patient ever been admitted to hospital?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'prev_admission' },
      { id: 'q_pmh_admission_hospital', phase: 'past_medical', question: 'Hospital / Facility?', type: 'text', required: false, factKey: 'prev_admission_hospital', dependsOn: { questionId: 'q_pmh_prev_admission', value: 'Yes' } },
      { id: 'q_pmh_admission_year', phase: 'past_medical', question: 'Year of admission?', type: 'text', required: false, factKey: 'prev_admission_year', dependsOn: { questionId: 'q_pmh_prev_admission', value: 'Yes' } },
      { id: 'q_pmh_admission_reason', phase: 'past_medical', question: 'Reason for admission?', type: 'text', required: false, factKey: 'prev_admission_reason', dependsOn: { questionId: 'q_pmh_prev_admission', value: 'Yes' } },
      { id: 'q_pmh_admission_duration', phase: 'past_medical', question: 'Duration of stay?', type: 'chips', chips: ['Days', '1-2 weeks', '2-4 weeks', '>1 month'], required: false, factKey: 'prev_admission_duration', dependsOn: { questionId: 'q_pmh_prev_admission', value: 'Yes' } },
      { id: 'q_pmh_admission_outcome', phase: 'past_medical', question: 'Outcome?', type: 'chips', chips: ['Recovered fully', 'Recovered with sequelae', 'Ongoing care', 'Transferred'], required: false, factKey: 'prev_admission_outcome', dependsOn: { questionId: 'q_pmh_prev_admission', value: 'Yes' } },
    ],
  },
  pmh_serious_illnesses: {
    id: 'pmh_serious_illnesses',
    label: 'Previous Serious Acute Illnesses',
    phase: 'past_medical',
    cards: [
      { id: 'q_pmh_serious_illness', phase: 'past_medical', question: 'Any previous serious acute illness?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'prev_serious_illness' },
      { id: 'q_pmh_serious_illness_type', phase: 'past_medical', question: 'Type of illness?', type: 'chips', chips: ['Severe pneumonia', 'Myocardial infarction', 'Stroke', 'Meningitis', 'Sepsis', 'Malaria with complications', 'Severe trauma', 'Other'], required: false, factKey: 'prev_serious_illness_type', dependsOn: { questionId: 'q_pmh_serious_illness', value: 'Yes' } },
      { id: 'q_pmh_serious_illness_year', phase: 'past_medical', question: 'Year?', type: 'text', required: false, factKey: 'prev_serious_illness_year', dependsOn: { questionId: 'q_pmh_serious_illness', value: 'Yes' } },
      { id: 'q_pmh_serious_illness_complications', phase: 'past_medical', question: 'Any complications?', type: 'text', required: false, factKey: 'prev_serious_illness_complications', dependsOn: { questionId: 'q_pmh_serious_illness', value: 'Yes' } },
    ],
  },

  // ═══════════════════════════════════════════
  // PAST SURGICAL HISTORY
  // ═══════════════════════════════════════════
  psh_screening: {
    id: 'psh_screening',
    label: 'Past Surgical History',
    phase: 'past_surgical',
    cards: [
      { id: 'q_psh_previous_surgery', phase: 'past_surgical', question: 'Previous surgeries?', type: 'boolean', required: true, factKey: 'previous_surgery' },
      { id: 'q_psh_details', phase: 'past_surgical', question: 'Surgery details (type, year, hospital)', type: 'text', required: false, factKey: 'psh_details', dependsOn: { questionId: 'q_psh_previous_surgery', value: true } },
      { id: 'q_psh_complications', phase: 'past_surgical', question: 'Any complications?', type: 'text', required: false, factKey: 'psh_complications', dependsOn: { questionId: 'q_psh_previous_surgery', value: true } },
      { id: 'q_psh_blood_transfusion', phase: 'past_surgical', question: 'Ever received blood transfusion?', type: 'boolean', required: false, factKey: 'blood_transfusion' },
      { id: 'q_psh_anaesthetic_issues', phase: 'past_surgical', question: 'Any anaesthetic problems?', type: 'text', required: false, factKey: 'anaesthetic_issues', dependsOn: { questionId: 'q_psh_previous_surgery', value: true } },
    ],
  },
  psh_implants_devices: {
    id: 'psh_implants_devices',
    label: 'Implants / Devices / Transplants',
    phase: 'past_surgical',
    cards: [
      { id: 'q_psh_implant_gateway', phase: 'past_surgical', question: 'Any implanted devices, stoma, amputation, or transplant?', type: 'chips', chips: ['None', 'Yes'], required: true, factKey: 'psh_implant_gateway' },
      { id: 'q_psh_implant', phase: 'past_surgical', question: 'Which implanted devices or prostheses?', type: 'chips', chips: ['Pacemaker', 'Joint replacement', 'Stent', 'Heart valve', 'Spinal implant', 'Dialysis access', 'Vascular graft', 'ICD', 'Other'], multiple: true, required: false, factKey: 'implants_devices', dependsOn: { questionId: 'q_psh_implant_gateway', value: 'Yes' } },
      { id: 'q_psh_implant_year', phase: 'past_surgical', question: 'Year of implant?', type: 'text', required: false, factKey: 'implant_year', dependsOn: { questionId: 'q_psh_implant_gateway', value: 'Yes' } },
      { id: 'q_psh_ostomy', phase: 'past_surgical', question: 'Has a stoma (colostomy/ileostomy)?', type: 'boolean', required: false, factKey: 'ostomy', dependsOn: { questionId: 'q_psh_implant_gateway', value: 'Yes' } },
      { id: 'q_psh_amputation', phase: 'past_surgical', question: 'Has an amputation?', type: 'boolean', required: false, factKey: 'amputation', dependsOn: { questionId: 'q_psh_implant_gateway', value: 'Yes' } },
      { id: 'q_psh_transplant', phase: 'past_surgical', question: 'Ever received an organ transplant?', type: 'boolean', required: false, factKey: 'organ_transplant', dependsOn: { questionId: 'q_psh_implant_gateway', value: 'Yes' } },
      { id: 'q_psh_transplant_organ', phase: 'past_surgical', question: 'Which organ?', type: 'chips', chips: ['Kidney', 'Liver', 'Heart', 'Lung', 'Cornea', 'Bone marrow', 'Other'], required: false, factKey: 'transplant_organ', dependsOn: { questionId: 'q_psh_transplant', value: true } },
      { id: 'q_psh_transplant_year', phase: 'past_surgical', question: 'Year of transplant?', type: 'text', required: false, factKey: 'transplant_year', dependsOn: { questionId: 'q_psh_transplant', value: true } },
    ],
  },

  // ═══════════════════════════════════════════
  // DRUG HISTORY
  // ═══════════════════════════════════════════
  drug_history: {
    id: 'drug_history',
    label: 'Drug History',
    phase: 'drug_history',
    cards: [
      { id: 'q_dh_current_meds', phase: 'drug_history', question: 'Current medications?', type: 'text', required: false, factKey: 'current_medications' },
      { id: 'q_dh_otc', phase: 'drug_history', question: 'Any over-the-counter or traditional meds?', type: 'text', required: false, factKey: 'otc_medications' },
      { id: 'q_dh_compliance', phase: 'drug_history', question: 'Medication compliance?', type: 'chips', chips: ['Good', 'Fair', 'Poor', 'Not applicable'], required: false, factKey: 'med_compliance' },
    ],
  },
  dh_structured_medications: {
    id: 'dh_structured_medications',
    label: 'Structured Medication List',
    phase: 'drug_history',
    cards: [
      { id: 'q_dh_regular_meds', phase: 'drug_history', question: 'Is the patient on any regular medications?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'dh_regular_meds' },
      { id: 'q_dh_med_name', phase: 'drug_history', question: 'Medication name?', type: 'chips', chips: ['Metformin', 'Amlodipine', 'Enalapril', 'Ceftriaxone', 'Paracetamol', 'Omeprazole', 'Atorvastatin', 'Aspirin', 'Warfarin', 'Insulin', 'ART', 'Furosemide', 'Spironolactone', 'Salbutamol', 'Prednisolone', 'Other'], required: false, factKey: 'med_name', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_dose', phase: 'drug_history', question: 'Dose?', type: 'text', required: false, factKey: 'med_dose', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_frequency', phase: 'drug_history', question: 'Frequency?', type: 'chips', chips: ['OD', 'BD', 'TDS', 'QID', 'Q4H', 'Q6H', 'Q8H', 'Q12H', 'PRN', 'Weekly', 'Monthly'], required: false, factKey: 'med_frequency', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_route', phase: 'drug_history', question: 'Route?', type: 'chips', chips: ['Oral', 'IV', 'IM', 'SC', 'Inhaled', 'Topical', 'SL', 'PR'], required: false, factKey: 'med_route', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_indication', phase: 'drug_history', question: 'Indication?', type: 'chips', chips: ['Hypertension', 'Diabetes', 'Asthma', 'Infection', 'Pain', 'Heart failure', 'DVT prophylaxis', 'Thyroid', 'Epilepsy', 'Mental health', 'Other'], required: false, factKey: 'med_indication', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_duration', phase: 'drug_history', question: 'Duration?', type: 'chips', chips: ['<1 month', '1-6 months', '6-12 months', '>1 year', 'Lifelong'], required: false, factKey: 'med_duration', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_adherence', phase: 'drug_history', question: 'Adherence?', type: 'chips', chips: ['Good (>95%)', 'Fair (80-95%)', 'Poor (<80%)'], required: false, factKey: 'med_adherence', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_side_effects', phase: 'drug_history', question: 'Any notable side effects?', type: 'text', required: false, factKey: 'med_side_effects', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
      { id: 'q_dh_med_source', phase: 'drug_history', question: 'Source of medication?', type: 'chips', chips: ['Prescribed', 'OTC', 'Herbal/Traditional', 'Hospital supply', 'Unknown'], required: false, factKey: 'med_source', dependsOn: { questionId: 'q_dh_regular_meds', value: 'Yes' } },
    ],
  },
  dh_herbal_traditional: {
    id: 'dh_herbal_traditional',
    label: 'Herbal / Traditional Medications',
    phase: 'drug_history',
    cards: [
      { id: 'q_dh_herbal_use', phase: 'drug_history', question: 'Uses any herbal or traditional remedies?', type: 'boolean', required: false, factKey: 'herbal_use' },
      { id: 'q_dh_herbal_name', phase: 'drug_history', question: 'Which remedies?', type: 'text', required: false, factKey: 'herbal_name', dependsOn: { questionId: 'q_dh_herbal_use', value: true } },
      { id: 'q_dh_herbal_frequency', phase: 'drug_history', question: 'Frequency of use?', type: 'chips', chips: ['Daily', 'Weekly', 'Occasionally', 'When ill'], required: false, factKey: 'herbal_frequency', dependsOn: { questionId: 'q_dh_herbal_use', value: true } },
    ],
  },

  // ═══════════════════════════════════════════
  // ALLERGIES
  // ═══════════════════════════════════════════
  allergies: {
    id: 'allergies',
    label: 'Allergies',
    phase: 'allergies',
    cards: [
      { id: 'q_all_known', phase: 'allergies', question: 'Any known allergies?', type: 'chips', chips: ['None known', 'Drug', 'Food', 'Environmental', 'Latex', 'Contrast', 'Other'], required: true, factKey: 'allergy_category' },
      { id: 'q_all_drug', phase: 'allergies', question: 'Which drug?', type: 'chips', chips: ['Penicillin', 'Sulfa', 'Aspirin', 'NSAIDs', 'Ceftriaxone', 'Co-amoxiclav', 'Erythromycin', 'Codeine', 'Morphine', 'Other'], required: false, factKey: 'allergy_drug', dependsOn: { questionId: 'q_all_known', value: 'Drug' } },
      { id: 'q_all_drug_reaction', phase: 'allergies', question: 'Reaction?', type: 'chips', chips: ['Rash', 'Urticaria', 'Angioedema', 'Anaphylaxis', 'Stevens-Johnson', 'Nausea', 'GI upset', 'Unknown'], required: false, factKey: 'allergy_drug_reaction', dependsOn: { questionId: 'q_all_known', value: 'Drug' } },
      { id: 'q_all_drug_severity', phase: 'allergies', question: 'Severity?', type: 'chips', chips: ['Mild', 'Moderate', 'Severe', 'Life-threatening'], required: false, factKey: 'allergy_drug_severity', dependsOn: { questionId: 'q_all_known', value: 'Drug' } },
      { id: 'q_all_food', phase: 'allergies', question: 'Which food?', type: 'chips', chips: ['Peanuts', 'Seafood', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Other'], required: false, factKey: 'allergy_food', dependsOn: { questionId: 'q_all_known', value: 'Food' } },
      { id: 'q_all_environmental', phase: 'allergies', question: 'What environmental allergen?', type: 'chips', chips: ['Dust', 'Pollen', 'Mould', 'Animal dander', 'Insect sting'], required: false, factKey: 'allergy_environmental', dependsOn: { questionId: 'q_all_known', value: 'Environmental' } },
      { id: 'q_all_contrast_type', phase: 'allergies', question: 'Contrast type?', type: 'chips', chips: ['IV contrast (CT)', 'MRI contrast (Gadolinium)'], required: false, factKey: 'allergy_contrast_type', dependsOn: { questionId: 'q_all_known', value: 'Contrast' } },
      { id: 'q_all_reaction_other', phase: 'allergies', question: 'Describe reaction?', type: 'text', required: false, factKey: 'allergy_reaction_description', dependsOn: { questionId: 'q_all_known', value: 'Drug' } },
      { id: 'q_all_year', phase: 'allergies', question: 'Year of first reaction?', type: 'text', required: false, factKey: 'allergy_year', dependsOn: { questionId: 'q_all_known', value: 'Drug' } },
      { id: 'q_all_confirmed', phase: 'allergies', question: 'Confirmed by specialist?', type: 'boolean', required: false, factKey: 'allergy_confirmed', dependsOn: { questionId: 'q_all_known', value: 'Drug' } },
    ],
  },

  // ═══════════════════════════════════════════
  // FAMILY HISTORY
  // ═══════════════════════════════════════════
  family_history: {
    id: 'family_history',
    label: 'Family History',
    phase: 'family_history',
    cards: [
      { id: 'q_fh_parents', phase: 'family_history', question: 'Are parents alive?', type: 'text', required: false, factKey: 'fh_parents' },
      { id: 'q_fh_conditions', phase: 'family_history', question: 'Family history of these conditions?', type: 'chips', multiple: true, chips: ['None', 'Diabetes', 'Hypertension', 'Cancer', 'TB', 'Heart Disease', 'Asthma', 'Mental illness', 'Sudden death'], required: false, factKey: 'fh_conditions' },
    ],
  },

  // ═══════════════════════════════════════════
  // SOCIAL HISTORY
  // ═══════════════════════════════════════════
  social_history: {
    id: 'social_history',
    label: 'Social History',
    phase: 'social_history',
    condition: { ageGroups: ['adolescent', 'adult', 'elderly'] },
    cards: [
      { id: 'q_sh_smoking', phase: 'social_history', question: 'Smoking?', type: 'chips', chips: ['Never', 'Current', 'Former'], required: true, factKey: 'smoking' },
      { id: 'q_sh_smoking_pack_years', phase: 'social_history', question: 'Pack years?', type: 'text', required: false, factKey: 'smoking_pack_years', dependsOn: { questionId: 'q_sh_smoking', value: 'Current' } },
      { id: 'q_sh_alcohol', phase: 'social_history', question: 'Alcohol?', type: 'chips', chips: ['None', 'Social', 'Regular', 'Heavy'], required: true, factKey: 'alcohol' },
      { id: 'q_sh_drugs', phase: 'social_history', question: 'Recreational drugs?', type: 'chips', chips: ['None', 'Marijuana', 'Cocaine', 'Heroin', 'Other'], required: false, factKey: 'recreational_drugs' },
      { id: 'q_sh_occupation_details', phase: 'social_history', question: 'Occupation details?', type: 'text', required: false, factKey: 'occupation_details' },
      { id: 'q_sh_living', phase: 'social_history', question: 'Living situation?', type: 'text', required: false, factKey: 'living_situation' },
      { id: 'q_sh_travel', phase: 'social_history', question: 'Recent travel?', type: 'text', required: false, factKey: 'recent_travel' },
    ],
  },

  // ═══════════════════════════════════════════
  // REVIEW OF SYSTEMS
  // ═══════════════════════════════════════════
  ros_general: {
    id: 'ros_general',
    label: 'General Review',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_general_review', phase: 'review_of_systems', question: 'Any general / constitutional symptoms beyond HPI?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_general_review' },
      { id: 'q_ros_fever', phase: 'review_of_systems', question: 'Fever?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_fever', dependsOn: { questionId: 'q_ros_general_review', value: 'Yes' } },
      { id: 'q_ros_fever_duration', phase: 'review_of_systems', question: 'Fever duration?', type: 'chips', chips: ['Hours', '1-2 days', '3-7 days', '>1 week', 'Recurrent'], required: false, factKey: 'ros_fever_duration', dependsOn: { questionId: 'q_ros_fever', value: 'Yes' } },
      { id: 'q_ros_weight_loss', phase: 'review_of_systems', question: 'Unintentional weight loss?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_weight_loss', dependsOn: { questionId: 'q_ros_general_review', value: 'Yes' } },
      { id: 'q_ros_weight_loss_detail', phase: 'review_of_systems', question: 'Weight loss amount/period?', type: 'chips', chips: ['Mild (<5kg)', 'Moderate (5-10kg)', 'Severe (>10kg)', 'Unknown'], required: false, factKey: 'ros_weight_loss_detail', dependsOn: { questionId: 'q_ros_weight_loss', value: 'Yes' } },
      { id: 'q_ros_night_sweats', phase: 'review_of_systems', question: 'Night sweats?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_night_sweats', dependsOn: { questionId: 'q_ros_general_review', value: 'Yes' } },
      { id: 'q_ros_fatigue', phase: 'review_of_systems', question: 'Fatigue?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_fatigue', dependsOn: { questionId: 'q_ros_general_review', value: 'Yes' } },
      { id: 'q_ros_fatigue_detail', phase: 'review_of_systems', question: 'Fatigue severity?', type: 'chips', chips: ['Mild (normal activity)', 'Moderate (reduced activity)', 'Severe (bedridden)'], required: false, factKey: 'ros_fatigue_detail', dependsOn: { questionId: 'q_ros_fatigue', value: 'Yes' } },
      { id: 'q_ros_appetite', phase: 'review_of_systems', question: 'Appetite?', type: 'chips', chips: ['Normal', 'Reduced', 'Increased'], required: false, factKey: 'ros_appetite', dependsOn: { questionId: 'q_ros_general_review', value: 'Yes' } },
      { id: 'q_ros_general_duration', phase: 'review_of_systems', question: 'Duration of general symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_general_duration', dependsOn: { questionId: 'q_ros_general_review', value: 'Yes' } },
    ],
  },
  ros_cv: {
    id: 'ros_cv',
    label: 'Cardiovascular',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_cv_review', phase: 'review_of_systems', question: 'Any cardiovascular symptoms beyond HPI?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_cv_review' },
      { id: 'q_ros_chest_pain', phase: 'review_of_systems', question: 'Chest pain?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_chest_pain', dependsOn: { questionId: 'q_ros_cv_review', value: 'Yes' } },
      { id: 'q_ros_chest_pain_detail', phase: 'review_of_systems', question: 'Chest pain character?', type: 'chips', chips: ['Sharp', 'Dull', 'Pressure', 'Burning', 'Exertional'], required: false, factKey: 'ros_chest_pain_detail', dependsOn: { questionId: 'q_ros_chest_pain', value: 'Yes' } },
      { id: 'q_ros_palpitations', phase: 'review_of_systems', question: 'Palpitations?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_palpitations', dependsOn: { questionId: 'q_ros_cv_review', value: 'Yes' } },
      { id: 'q_ros_sob', phase: 'review_of_systems', question: 'Shortness of breath?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_sob_exertion', dependsOn: { questionId: 'q_ros_cv_review', value: 'Yes' } },
      { id: 'q_ros_sob_detail', phase: 'review_of_systems', question: 'SOB severity?', type: 'chips', chips: ['On exertion', 'At rest', 'At night (PND)', 'Orthopnea'], required: false, factKey: 'ros_sob_detail', dependsOn: { questionId: 'q_ros_sob', value: 'Yes' } },
      { id: 'q_ros_orthopnea', phase: 'review_of_systems', question: 'Orthopnea?', type: 'chips', chips: ['No', 'Yes - 1 pillow', 'Yes - 2 pillows', 'Yes - 3+ pillows'], required: false, factKey: 'ros_orthopnea', dependsOn: { questionId: 'q_ros_cv_review', value: 'Yes' } },
      { id: 'q_ros_edema', phase: 'review_of_systems', question: 'Leg swelling?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_edema', dependsOn: { questionId: 'q_ros_cv_review', value: 'Yes' } },
      { id: 'q_ros_edema_detail', phase: 'review_of_systems', question: 'Edema extent?', type: 'chips', chips: ['Ankle only', 'Below knee', 'Above knee', 'Generalized'], required: false, factKey: 'ros_edema_detail', dependsOn: { questionId: 'q_ros_edema', value: 'Yes' } },
      { id: 'q_ros_cv_duration', phase: 'review_of_systems', question: 'Duration of CV symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_cv_duration', dependsOn: { questionId: 'q_ros_cv_review', value: 'Yes' } },
    ],
  },
  ros_resp: {
    id: 'ros_resp',
    label: 'Respiratory',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_resp_review', phase: 'review_of_systems', question: 'Any respiratory symptoms beyond HPI?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_resp_review' },
      { id: 'q_ros_cough', phase: 'review_of_systems', question: 'Cough?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_cough', dependsOn: { questionId: 'q_ros_resp_review', value: 'Yes' } },
      { id: 'q_ros_cough_duration', phase: 'review_of_systems', question: 'Cough duration?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_cough_duration', dependsOn: { questionId: 'q_ros_cough', value: 'Yes' } },
      { id: 'q_ros_sputum', phase: 'review_of_systems', question: 'Sputum?', type: 'chips', chips: ['None', 'Clear', 'Yellow', 'Green', 'Blood-stained'], required: false, factKey: 'ros_sputum', dependsOn: { questionId: 'q_ros_resp_review', value: 'Yes' } },
      { id: 'q_ros_sputum_volume', phase: 'review_of_systems', question: 'Sputum volume?', type: 'chips', chips: ['Small', 'Moderate', 'Large (cupful)'], required: false, factKey: 'ros_sputum_volume', dependsOn: { questionId: 'q_ros_resp_review', value: 'Yes' } },
      { id: 'q_ros_wheeze', phase: 'review_of_systems', question: 'Wheezing?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_wheeze', dependsOn: { questionId: 'q_ros_resp_review', value: 'Yes' } },
      { id: 'q_ros_hemoptysis', phase: 'review_of_systems', question: 'Coughing blood?', type: 'chips', chips: ['No', 'Yes - streaks', 'Yes - frank blood'], required: false, factKey: 'ros_hemoptysis', dependsOn: { questionId: 'q_ros_resp_review', value: 'Yes' } },
      { id: 'q_ros_resp_duration', phase: 'review_of_systems', question: 'Duration of respiratory symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_resp_duration', dependsOn: { questionId: 'q_ros_resp_review', value: 'Yes' } },
    ],
  },
  ros_gi: {
    id: 'ros_gi',
    label: 'Gastrointestinal',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_gi_review', phase: 'review_of_systems', question: 'Any GI symptoms beyond HPI?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_gi_review' },
      { id: 'q_ros_dysphagia', phase: 'review_of_systems', question: 'Difficulty swallowing?', type: 'chips', chips: ['No', 'Yes - solids', 'Yes - liquids', 'Yes - both'], required: false, factKey: 'ros_dysphagia', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_nausea', phase: 'review_of_systems', question: 'Nausea?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_nausea', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_vomiting', phase: 'review_of_systems', question: 'Vomiting?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_vomiting', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_vomiting_detail', phase: 'review_of_systems', question: 'Vomiting content?', type: 'chips', chips: ['Food', 'Bile', 'Blood', 'Coffee-ground', 'Feculent'], required: false, factKey: 'ros_vomiting_detail', dependsOn: { questionId: 'q_ros_vomiting', value: 'Yes' } },
      { id: 'q_ros_diarrhea', phase: 'review_of_systems', question: 'Diarrhea?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_diarrhea', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_diarrhea_detail', phase: 'review_of_systems', question: 'Diarrhea character?', type: 'chips', chips: ['Watery', 'Bloody', 'Mucoid', 'Alternating'], required: false, factKey: 'ros_diarrhea_detail', dependsOn: { questionId: 'q_ros_diarrhea', value: 'Yes' } },
      { id: 'q_ros_constipation', phase: 'review_of_systems', question: 'Constipation?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_constipation', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_constipation_detail', phase: 'review_of_systems', question: 'Duration of constipation?', type: 'chips', chips: ['Days', 'Weeks', 'Months', 'Chronic'], required: false, factKey: 'ros_constipation_detail', dependsOn: { questionId: 'q_ros_constipation', value: 'Yes' } },
      { id: 'q_ros_hematemesis', phase: 'review_of_systems', question: 'Vomiting blood?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_hematemesis', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_melena', phase: 'review_of_systems', question: 'Black/tarry stools?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_melena', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_hematochezia', phase: 'review_of_systems', question: 'Blood in stool?', type: 'chips', chips: ['No', 'Yes - bright', 'Yes - dark'], required: false, factKey: 'ros_hematochezia', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_jaundice', phase: 'review_of_systems', question: 'Yellowing of eyes/skin?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_jaundice', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
      { id: 'q_ros_gi_duration', phase: 'review_of_systems', question: 'Duration of GI symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_gi_duration', dependsOn: { questionId: 'q_ros_gi_review', value: 'Yes' } },
    ],
  },
  ros_gu: {
    id: 'ros_gu',
    label: 'Genitourinary',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_gu_review', phase: 'review_of_systems', question: 'Any genitourinary symptoms?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_gu_review' },
      { id: 'q_ros_dysuria', phase: 'review_of_systems', question: 'Pain on urination?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_dysuria', dependsOn: { questionId: 'q_ros_gu_review', value: 'Yes' } },
      { id: 'q_ros_frequency', phase: 'review_of_systems', question: 'Urinary frequency?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_urinary_frequency', dependsOn: { questionId: 'q_ros_gu_review', value: 'Yes' } },
      { id: 'q_ros_urgency', phase: 'review_of_systems', question: 'Urinary urgency?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_urinary_urgency', dependsOn: { questionId: 'q_ros_gu_review', value: 'Yes' } },
      { id: 'q_ros_hematuria', phase: 'review_of_systems', question: 'Blood in urine?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_hematuria', dependsOn: { questionId: 'q_ros_gu_review', value: 'Yes' } },
      { id: 'q_ros_flank_pain', phase: 'review_of_systems', question: 'Flank pain?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_flank_pain', dependsOn: { questionId: 'q_ros_gu_review', value: 'Yes' } },
      { id: 'q_ros_gu_duration', phase: 'review_of_systems', question: 'Duration of GU symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_gu_duration', dependsOn: { questionId: 'q_ros_gu_review', value: 'Yes' } },
    ],
  },
  ros_msk: {
    id: 'ros_msk',
    label: 'Musculoskeletal',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_msk_review', phase: 'review_of_systems', question: 'Any musculoskeletal symptoms?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_msk_review' },
      { id: 'q_ros_joint_pain', phase: 'review_of_systems', question: 'Joint pain?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_joint_pain', dependsOn: { questionId: 'q_ros_msk_review', value: 'Yes' } },
      { id: 'q_ros_joint_pain_detail', phase: 'review_of_systems', question: 'Which joints?', type: 'chips', chips: ['Small (hands/feet)', 'Large (knees/hips)', 'Spine', 'Multiple', 'Symmetrical'], required: false, factKey: 'ros_joint_pain_detail', dependsOn: { questionId: 'q_ros_joint_pain', value: 'Yes' } },
      { id: 'q_ros_joint_swelling', phase: 'review_of_systems', question: 'Joint swelling?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_joint_swelling', dependsOn: { questionId: 'q_ros_msk_review', value: 'Yes' } },
      { id: 'q_ros_back_pain', phase: 'review_of_systems', question: 'Back pain?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_back_pain', dependsOn: { questionId: 'q_ros_msk_review', value: 'Yes' } },
      { id: 'q_ros_back_pain_detail', phase: 'review_of_systems', question: 'Back pain location?', type: 'chips', chips: ['Upper back', 'Lower back', 'Radicular', 'With stiffness'], required: false, factKey: 'ros_back_pain_detail', dependsOn: { questionId: 'q_ros_back_pain', value: 'Yes' } },
      { id: 'q_ros_msk_duration', phase: 'review_of_systems', question: 'Duration of MSK symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_msk_duration', dependsOn: { questionId: 'q_ros_msk_review', value: 'Yes' } },
    ],
  },
  ros_neuro: {
    id: 'ros_neuro',
    label: 'Neurological',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_neuro_review', phase: 'review_of_systems', question: 'Any neurological symptoms?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_neuro_review' },
      { id: 'q_ros_headache', phase: 'review_of_systems', question: 'Headache?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_headache', dependsOn: { questionId: 'q_ros_neuro_review', value: 'Yes' } },
      { id: 'q_ros_headache_detail', phase: 'review_of_systems', question: 'Headache type?', type: 'chips', chips: ['Tension', 'Migraine', 'Cluster', 'Sinus', 'Thunderclap', 'Chronic daily'], required: false, factKey: 'ros_headache_detail', dependsOn: { questionId: 'q_ros_headache', value: 'Yes' } },
      { id: 'q_ros_dizziness', phase: 'review_of_systems', question: 'Dizziness?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_dizziness', dependsOn: { questionId: 'q_ros_neuro_review', value: 'Yes' } },
      { id: 'q_ros_dizziness_detail', phase: 'review_of_systems', question: 'Dizziness type?', type: 'chips', chips: ['Vertigo (spinning)', 'Lightheaded', 'Presyncope', 'Unsteady gait'], required: false, factKey: 'ros_dizziness_detail', dependsOn: { questionId: 'q_ros_dizziness', value: 'Yes' } },
      { id: 'q_ros_seizures', phase: 'review_of_systems', question: 'Seizures?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_seizures', dependsOn: { questionId: 'q_ros_neuro_review', value: 'Yes' } },
      { id: 'q_ros_seizure_detail', phase: 'review_of_systems', question: 'Seizure type?', type: 'chips', chips: ['Generalized', 'Focal', 'Absence', 'Unknown'], required: false, factKey: 'ros_seizure_detail', dependsOn: { questionId: 'q_ros_seizures', value: 'Yes' } },
      { id: 'q_ros_weakness', phase: 'review_of_systems', question: 'Weakness/numbness?', type: 'chips', chips: ['No', 'Yes - unilateral', 'Yes - bilateral', 'Yes - localized'], required: false, factKey: 'ros_weakness', dependsOn: { questionId: 'q_ros_neuro_review', value: 'Yes' } },
      { id: 'q_ros_vision', phase: 'review_of_systems', question: 'Vision changes?', type: 'chips', chips: ['No', 'Blurred', 'Double', 'Loss of vision', 'Flashes/floaters'], required: false, factKey: 'ros_vision', dependsOn: { questionId: 'q_ros_neuro_review', value: 'Yes' } },
      { id: 'q_ros_neuro_duration', phase: 'review_of_systems', question: 'Duration of neuro symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_neuro_duration', dependsOn: { questionId: 'q_ros_neuro_review', value: 'Yes' } },
    ],
  },
  ros_endo: {
    id: 'ros_endo',
    label: 'Endocrine',
    phase: 'review_of_systems',
    cards: [
      { id: 'q_ros_endo_review', phase: 'review_of_systems', question: 'Any endocrine symptoms?', type: 'chips', chips: ['No', 'Yes'], required: true, factKey: 'ros_endo_review' },
      { id: 'q_ros_thirst', phase: 'review_of_systems', question: 'Excessive thirst?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_thirst', dependsOn: { questionId: 'q_ros_endo_review', value: 'Yes' } },
      { id: 'q_ros_urination', phase: 'review_of_systems', question: 'Excessive urination?', type: 'chips', chips: ['No', 'Yes'], required: false, factKey: 'ros_urination', dependsOn: { questionId: 'q_ros_endo_review', value: 'Yes' } },
      { id: 'q_ros_heat_intolerance', phase: 'review_of_systems', question: 'Heat/cold intolerance?', type: 'chips', chips: ['No', 'Heat intolerance', 'Cold intolerance'], required: false, factKey: 'ros_temp_intolerance', dependsOn: { questionId: 'q_ros_endo_review', value: 'Yes' } },
      { id: 'q_ros_endo_duration', phase: 'review_of_systems', question: 'Duration of endocrine symptoms?', type: 'chips', chips: ['Days', 'Weeks', 'Months'], required: false, factKey: 'ros_endo_duration', dependsOn: { questionId: 'q_ros_endo_review', value: 'Yes' } },
    ],
  },

  // ═══════════════════════════════════════════
  // EXAMINATION
  // ═══════════════════════════════════════════
  exam_general: {
    id: 'exam_general',
    label: 'General Examination',
    phase: 'general_exam',
    cards: [
      { id: 'q_exam_consciousness', phase: 'general_exam', question: 'Consciousness level', type: 'chips', chips: ['Alert', 'Confused', 'Drowsy', 'Unconscious'], required: true, factKey: 'exam_consciousness' },
      { id: 'q_exam_build', phase: 'general_exam', question: 'Body build', type: 'chips', chips: ['Well-nourished', 'Average', 'Malnourished', 'Obese'], required: false, factKey: 'exam_build' },
      { id: 'q_exam_dehydration', phase: 'general_exam', question: 'Signs of dehydration?', type: 'chips', chips: ['None', 'Mild', 'Moderate', 'Severe'], required: false, factKey: 'exam_dehydration' },
      { id: 'q_exam_jaundice', phase: 'general_exam', question: 'Jaundice?', type: 'boolean', required: false, factKey: 'exam_jaundice' },
      { id: 'q_exam_cyanosis', phase: 'general_exam', question: 'Cyanosis?', type: 'boolean', required: false, factKey: 'exam_cyanosis' },
      { id: 'q_exam_pallor', phase: 'general_exam', question: 'Pallor?', type: 'chips', chips: ['None', 'Mild', 'Moderate', 'Severe'], required: false, factKey: 'exam_pallor' },
      { id: 'q_exam_edema', phase: 'general_exam', question: 'Pedal edema?', type: 'boolean', required: false, factKey: 'exam_edema' },
      { id: 'q_exam_lymph_nodes', phase: 'general_exam', question: 'Lymphadenopathy?', type: 'text', required: false, factKey: 'exam_lymph_nodes' },
    ],
  },
  exam_vitals: {
    id: 'exam_vitals',
    label: 'Vital Signs',
    phase: 'general_exam',
    cards: [
      { id: 'q_exam_temp', phase: 'general_exam', question: 'Temperature (°C)', type: 'text', required: true, factKey: 'exam_temp' },
      { id: 'q_exam_pulse', phase: 'general_exam', question: 'Heart rate (bpm)', type: 'text', required: true, factKey: 'exam_pulse' },
      { id: 'q_exam_bp_systolic', phase: 'general_exam', question: 'BP Systolic (mmHg)', type: 'text', required: true, factKey: 'exam_bp_systolic' },
      { id: 'q_exam_bp_diastolic', phase: 'general_exam', question: 'BP Diastolic (mmHg)', type: 'text', required: true, factKey: 'exam_bp_diastolic' },
      { id: 'q_exam_rr', phase: 'general_exam', question: 'Respiratory rate (/min)', type: 'text', required: true, factKey: 'exam_rr' },
      { id: 'q_exam_o2', phase: 'general_exam', question: 'O2 Saturation (%)', type: 'text', required: false, factKey: 'exam_o2_sat' },
      { id: 'q_exam_gcs', phase: 'general_exam', question: 'GCS (Eyes/Verbal/Motor)', type: 'text', required: false, factKey: 'exam_gcs' },
    ],
  },

  // ═══════════════════════════════════════════
  // CLINICAL REASONING
  // ═══════════════════════════════════════════
  clinical_impression: {
    id: 'clinical_impression',
    label: 'Clinical Impression',
    phase: 'clinical_reasoning',
    cards: [
      { id: 'q_clinical_summary', phase: 'clinical_reasoning', question: 'Clinical summary of this case', type: 'text', required: false, factKey: 'clinical_summary' },
    ],
  },

  // ═══════════════════════════════════════════
  // DIFFERENTIALS
  // ═══════════════════════════════════════════
  differentials_input: {
    id: 'differentials_input',
    label: 'Differential Diagnoses',
    phase: 'differentials',
    cards: [
      { id: 'q_working_diagnosis', phase: 'differentials', question: 'Working diagnosis', type: 'text', required: true, factKey: 'working_diagnosis' },
      { id: 'q_ddx_1', phase: 'differentials', question: 'Differential 1', type: 'text', required: false, factKey: 'ddx_1' },
      { id: 'q_ddx_2', phase: 'differentials', question: 'Differential 2', type: 'text', required: false, factKey: 'ddx_2' },
      { id: 'q_ddx_3', phase: 'differentials', question: 'Differential 3', type: 'text', required: false, factKey: 'ddx_3' },
    ],
  },

  // ═══════════════════════════════════════════
  // INVESTIGATIONS
  // ═══════════════════════════════════════════
  investigations_plan: {
    id: 'investigations_plan',
    label: 'Investigations',
    phase: 'investigations',
    cards: [
      { id: 'q_inv_labs', phase: 'investigations', question: 'Laboratory tests to order', type: 'chips', multiple: true,
        chips: ['FBC', 'CRP', 'U&E', 'LFT', 'Amylase', 'Blood culture', 'Urinalysis', 'Urine culture', 'Blood group', 'Coagulation', 'HIV', 'Pregnancy test', 'ABG'],
        required: false, factKey: 'inv_labs' },
      { id: 'q_inv_imaging', phase: 'investigations', question: 'Imaging to order', type: 'chips', multiple: true,
        chips: ['Chest X-ray', 'Abdominal X-ray', 'Abdominal US', 'CT Abdomen', 'CT Head', 'MRI', 'Echocardiogram', 'ECG'],
        required: false, factKey: 'inv_imaging' },
    ],
  },

  // ═══════════════════════════════════════════
  // DIAGNOSIS
  // ═══════════════════════════════════════════
  final_diagnosis: {
    id: 'final_diagnosis',
    label: 'Final Diagnosis',
    phase: 'diagnosis',
    cards: [
      { id: 'q_dx_final', phase: 'diagnosis', question: 'Final diagnosis', type: 'text', required: true, factKey: 'final_diagnosis' },
      { id: 'q_dx_icd', phase: 'diagnosis', question: 'ICD Code (if known)', type: 'text', required: false, factKey: 'icd_code' },
    ],
  },

  // ═══════════════════════════════════════════
  // MANAGEMENT
  // ═══════════════════════════════════════════
  management_plan: {
    id: 'management_plan',
    label: 'Management',
    phase: 'management',
    cards: [
      { id: 'q_mgt_admit', phase: 'management', question: 'Admission needed?', type: 'boolean', required: true, factKey: 'mgt_admit' },
      { id: 'q_mgt_npo', phase: 'management', question: 'NPO status?', type: 'boolean', required: false, factKey: 'mgt_npo' },
      { id: 'q_mgt_ivfluids', phase: 'management', question: 'IV fluids?', type: 'chips', chips: ['None', 'Normal Saline', 'Ringer\'s Lactate', 'Dextrose'], required: false, factKey: 'mgt_ivfluids' },
      { id: 'q_mgt_analgesia', phase: 'management', question: 'Analgesia needed?', type: 'chips', chips: ['None', 'Paracetamol', 'NSAIDs', 'Opioid', 'Regional'], required: false, factKey: 'mgt_analgesia' },
      { id: 'q_mgt_antibiotics', phase: 'management', question: 'Antibiotics?', type: 'text', required: false, factKey: 'mgt_antibiotics' },
      { id: 'q_mgt_procedure', phase: 'management', question: 'Procedure needed?', type: 'text', required: false, factKey: 'mgt_procedure' },
      { id: 'q_mgt_referral', phase: 'management', question: 'Referral needed?', type: 'text', required: false, factKey: 'mgt_referral' },
      { id: 'q_mgt_counselling', phase: 'management', question: 'Patient counselled?', type: 'boolean', required: false, factKey: 'mgt_counselling' },
    ],
  },

  // ═══════════════════════════════════════════
  // DISPOSITION
  // ═══════════════════════════════════════════
  disposition: {
    id: 'disposition',
    label: 'Disposition',
    phase: 'disposition',
    cards: [
      { id: 'q_disp_plan', phase: 'disposition', question: 'Disposition', type: 'chips', chips: ['Discharge home', 'Admit to ward', 'Admit to ICU', 'Transfer', 'Refer to OPD', 'Observe in ED'], required: true, factKey: 'disposition' },
      { id: 'q_disp_followup', phase: 'disposition', question: 'Follow-up plan?', type: 'text', required: false, factKey: 'follow_up_plan' },
      { id: 'q_disp_return_instructions', phase: 'disposition', question: 'Return precautions?', type: 'text', required: false, factKey: 'return_instructions' },
    ],
  },

  // ═══════════════════════════════════════════
  // CLINICAL SCORES
  // ═══════════════════════════════════════════
  clinical_score_alvarado: {
    id: 'clinical_score_alvarado',
    label: 'Alvarado Score (Appendicitis)',
    phase: 'clinical_reasoning',
    condition: { complaint: 'pain' },
    cards: [
      { id: 'q_alvarado_migration', phase: 'clinical_reasoning', question: 'Pain migration to RIF?', type: 'boolean', required: false, factKey: 'alvarado_migration' },
      { id: 'q_alvarado_anorexia', phase: 'clinical_reasoning', question: 'Anorexia?', type: 'boolean', required: false, factKey: 'alvarado_anorexia' },
      { id: 'q_alvarado_nausea', phase: 'clinical_reasoning', question: 'Nausea/vomiting?', type: 'boolean', required: false, factKey: 'alvarado_nausea' },
      { id: 'q_alvarado_tenderness', phase: 'clinical_reasoning', question: 'RIF tenderness?', type: 'boolean', required: false, factKey: 'alvarado_tenderness' },
      { id: 'q_alvarado_rebound', phase: 'clinical_reasoning', question: 'Rebound tenderness?', type: 'boolean', required: false, factKey: 'alvarado_rebound' },
      { id: 'q_alvarado_temp', phase: 'clinical_reasoning', question: 'Temperature >37.3°C?', type: 'boolean', required: false, factKey: 'alvarado_temp' },
      { id: 'q_alvarado_wbc', phase: 'clinical_reasoning', question: 'WBC >10,000?', type: 'boolean', required: false, factKey: 'alvarado_wbc' },
      { id: 'q_alvarado_neutrophils', phase: 'clinical_reasoning', question: 'Neutrophils >75%?', type: 'boolean', required: false, factKey: 'alvarado_neutrophils' },
    ],
  },
  clinical_score_gcs: {
    id: 'clinical_score_gcs',
    label: 'Glasgow Coma Scale',
    phase: 'clinical_reasoning',
    cards: [
      { id: 'q_gcs_eye', phase: 'clinical_reasoning', question: 'Eye opening (E)', type: 'chips', chips: ['4=Spontaneous', '3=To speech', '2=To pain', '1=None'], required: false, factKey: 'gcs_eye' },
      { id: 'q_gcs_verbal', phase: 'clinical_reasoning', question: 'Verbal response (V)', type: 'chips', chips: ['5=Orientated', '4=Confused', '3=Inappropriate', '2=Incomprehensible', '1=None'], required: false, factKey: 'gcs_verbal' },
      { id: 'q_gcs_motor', phase: 'clinical_reasoning', question: 'Motor response (M)', type: 'chips', chips: ['6=Obeys commands', '5=Localizes pain', '4=Withdraws', '3=Flexion', '2=Extension', '1=None'], required: false, factKey: 'gcs_motor' },
    ],
  },
  clinical_score_news: {
    id: 'clinical_score_news',
    label: 'NEWS 2 (National Early Warning Score)',
    phase: 'clinical_reasoning',
    cards: [
      { id: 'q_news_rr', phase: 'clinical_reasoning', question: 'Respiratory rate (/min)', type: 'text', required: false, factKey: 'news_rr' },
      { id: 'q_news_o2', phase: 'clinical_reasoning', question: 'O2 saturation (%)', type: 'text', required: false, factKey: 'news_o2' },
      { id: 'q_news_o2_therapy', phase: 'clinical_reasoning', question: 'On supplemental O2?', type: 'boolean', required: false, factKey: 'news_o2_therapy' },
      { id: 'q_news_sbp', phase: 'clinical_reasoning', question: 'Systolic BP (mmHg)', type: 'text', required: false, factKey: 'news_sbp' },
      { id: 'q_news_hr', phase: 'clinical_reasoning', question: 'Heart rate (bpm)', type: 'text', required: false, factKey: 'news_hr' },
      { id: 'q_news_consciousness', phase: 'clinical_reasoning', question: 'Consciousness level', type: 'chips', chips: ['Alert', 'Voice', 'Pain', 'Unresponsive'], required: false, factKey: 'news_consciousness' },
      { id: 'q_news_temp', phase: 'clinical_reasoning', question: 'Temperature (°C)', type: 'text', required: false, factKey: 'news_temp' },
    ],
  },

  // ═══════════════════════════════════════════
  // PROGNOSIS & DISCHARGE DETAILS
  // ═══════════════════════════════════════════
  prognosis: {
    id: 'prognosis',
    label: 'Prognosis',
    phase: 'disposition',
    cards: [
      { id: 'q_prog_expected_course', phase: 'disposition', question: 'Expected clinical course', type: 'chips', chips: ['Full recovery', 'Good with treatment', 'Guarded', 'Poor', 'Uncertain'], required: false, factKey: 'prog_expected_course' },
      { id: 'q_prog_complications', phase: 'disposition', question: 'Anticipated complications?', type: 'text', required: false, factKey: 'prog_complications' },
      { id: 'q_prog_recovery_time', phase: 'disposition', question: 'Estimated recovery time', type: 'chips', chips: ['Days', 'Weeks', 'Months', 'Ongoing'], required: false, factKey: 'prog_recovery_time' },
    ],
  },
  discharge_details: {
    id: 'discharge_details',
    label: 'Discharge Details',
    phase: 'discharge_admission_referral',
    cards: [
      { id: 'q_dc_date', phase: 'discharge_admission_referral', question: 'Discharge date', type: 'date', required: false, factKey: 'dc_date' },
      { id: 'q_dc_summary', phase: 'discharge_admission_referral', question: 'Discharge summary', type: 'text', required: false, factKey: 'dc_summary' },
      { id: 'q_dc_medications', phase: 'discharge_admission_referral', question: 'Discharge medications', type: 'text', required: false, factKey: 'dc_medications' },
      { id: 'q_dc_follow_up', phase: 'discharge_admission_referral', question: 'Follow-up appointment?', type: 'text', required: false, factKey: 'dc_follow_up_appointment' },
      { id: 'q_dc_instructions', phase: 'discharge_admission_referral', question: 'Patient instructions', type: 'text', required: false, factKey: 'dc_instructions' },
      { id: 'q_dc_when_to_return', phase: 'discharge_admission_referral', question: 'When to return to hospital', type: 'text', required: false, factKey: 'dc_return_criteria' },
      { id: 'q_dc_sick_leave', phase: 'discharge_admission_referral', question: 'Sick leave recommended?', type: 'text', required: false, factKey: 'dc_sick_leave' },
    ],
  },
  admission_details: {
    id: 'admission_details',
    label: 'Admission Details',
    phase: 'discharge_admission_referral',
    cards: [
      { id: 'q_admit_ward', phase: 'discharge_admission_referral', question: 'Admitting ward', type: 'text', required: false, factKey: 'admit_ward' },
      { id: 'q_admit_team', phase: 'discharge_admission_referral', question: 'Admitting team', type: 'text', required: false, factKey: 'admit_team' },
      { id: 'q_admit_provisional_dx', phase: 'discharge_admission_referral', question: 'Provisional diagnosis on admission', type: 'text', required: false, factKey: 'admit_provisional_dx' },
      { id: 'q_admit_plan', phase: 'discharge_admission_referral', question: 'Admission plan', type: 'text', required: false, factKey: 'admit_plan' },
    ],
  },

  // ═══════════════════════════════════════════
  // MODULE-SPECIFIC QUESTION GROUPS
  // ═══════════════════════════════════════════
  neonatal_birth: {
    id: 'neonatal_birth', label: 'Birth History', phase: 'patient_context',
    condition: { module: 'neonatal' },
    cards: [
      { id: 'q_neonatal_gestational_age', phase: 'patient_context', question: 'Gestational age at birth (weeks)', type: 'text', required: true, factKey: 'gestational_age' },
      { id: 'q_neonatal_birth_weight', phase: 'patient_context', question: 'Birth weight (kg)', type: 'text', required: true, factKey: 'birth_weight' },
      { id: 'q_neonatal_delivery', phase: 'patient_context', question: 'Mode of delivery', type: 'chips', chips: ['SVD', 'C-section', 'Vacuum', 'Forceps', 'Breech'], required: true, factKey: 'delivery_mode' },
      { id: 'q_neonatal_apgar', phase: 'patient_context', question: 'APGAR scores', type: 'text', required: false, factKey: 'apgar' },
      { id: 'q_neonatal_resuscitation', phase: 'patient_context', question: 'Resuscitation needed?', type: 'boolean', required: false, factKey: 'neonatal_resuscitation' },
      { id: 'q_neonatal_maternal_illness', phase: 'patient_context', question: 'Maternal illnesses in pregnancy?', type: 'text', required: false, factKey: 'maternal_illness' },
    ],
  },
  neonatal_feeding: {
    id: 'neonatal_feeding', label: 'Feeding', phase: 'review_of_systems',
    condition: { module: 'neonatal' },
    cards: [
      { id: 'q_neonatal_feeding_type', phase: 'review_of_systems', question: 'Feeding type', type: 'chips', chips: ['Breastfeeding', 'Formula', 'Mixed', 'IV fluids'], required: true, factKey: 'neonatal_feeding_type' },
      { id: 'q_neonatal_feeding_tolerance', phase: 'review_of_systems', question: 'Feeding tolerance?', type: 'chips', chips: ['Good', 'Vomiting', 'Refusing', 'Not tolerating'], required: false, factKey: 'neonatal_feeding_tolerance' },
    ],
  },
  geriatric_frailty: {
    id: 'geriatric_frailty', label: 'Frailty Assessment', phase: 'functional_assessment',
    condition: { module: 'geriatric' },
    cards: [
      { id: 'q_geriatric_mobility', phase: 'functional_assessment', question: 'Mobility', type: 'chips', chips: ['Independent', 'Walking aid', 'Wheelchair', 'Bedridden'], required: true, factKey: 'geriatric_mobility' },
      { id: 'q_geriatric_falls', phase: 'functional_assessment', question: 'Falls in past 6 months?', type: 'boolean', required: false, factKey: 'geriatric_falls' },
      { id: 'q_geriatric_vision', phase: 'functional_assessment', question: 'Vision problems?', type: 'boolean', required: false, factKey: 'geriatric_vision' },
      { id: 'q_geriatric_hearing', phase: 'functional_assessment', question: 'Hearing problems?', type: 'boolean', required: false, factKey: 'geriatric_hearing' },
      { id: 'q_geriatric_memory', phase: 'functional_assessment', question: 'Memory problems?', type: 'boolean', required: false, factKey: 'geriatric_memory' },
      { id: 'q_geriatric_caregiver', phase: 'functional_assessment', question: 'Has a caregiver?', type: 'boolean', required: false, factKey: 'geriatric_caregiver' },
    ],
  },
  geriatric_adl: {
    id: 'geriatric_adl', label: 'Activities of Daily Living', phase: 'functional_assessment',
    condition: { module: 'geriatric' },
    cards: [
      { id: 'q_geriatric_adl', phase: 'functional_assessment', question: 'Can the patient independently:', type: 'chips', multiple: true,
        chips: ['Bathe', 'Dress', 'Toilet', 'Transfer', 'Feed', 'Continence', 'None of above'], required: false, factKey: 'geriatric_adl' },
    ],
  },
  female_lmp: {
    id: 'female_lmp', label: 'Women\'s Health', phase: 'patient_context',
    condition: { module: 'female' },
    cards: [
      { id: 'q_female_lmp', phase: 'patient_context', question: 'Last Menstrual Period', type: 'text', required: false, factKey: 'lmp' },
      { id: 'q_female_pregnant_possible', phase: 'patient_context', question: 'Could you be pregnant?', type: 'boolean', required: false, factKey: 'pregnancy_possible' },
      { id: 'q_female_contraception', phase: 'patient_context', question: 'Using contraception?', type: 'boolean', required: false, factKey: 'contraception' },
      { id: 'q_female_gravidity', phase: 'patient_context', question: 'Gravidity/Pregnancy count', type: 'text', required: false, factKey: 'gravidity' },
      { id: 'q_female_parity', phase: 'patient_context', question: 'Parity/Live births', type: 'text', required: false, factKey: 'parity' },
    ],
  },
  pregnancy_antenatal: {
    id: 'pregnancy_antenatal', label: 'Antenatal', phase: 'patient_context',
    condition: { module: 'pregnancy' },
    cards: [
      { id: 'q_preg_edd', phase: 'patient_context', question: 'Estimated due date?', type: 'date', required: true, factKey: 'edd' },
      { id: 'q_preg_ga', phase: 'patient_context', question: 'Gestational age (weeks)', type: 'text', required: true, factKey: 'gestational_age_weeks' },
      { id: 'q_preg_anc', phase: 'patient_context', question: 'Attending ANC?', type: 'boolean', required: false, factKey: 'anc_attendance' },
      { id: 'q_preg_fetal_movement', phase: 'patient_context', question: 'Fetal movements normal?', type: 'chips', chips: ['Normal', 'Reduced', 'Absent', 'Excessive'], required: true, factKey: 'fetal_movement' },
    ],
  },
  pregnancy_danger: {
    id: 'pregnancy_danger', label: 'Pregnancy Danger Signs', phase: 'review_of_systems',
    condition: { module: 'pregnancy' },
    cards: [
      { id: 'q_preg_vaginal_bleeding', phase: 'review_of_systems', question: 'Vaginal bleeding?', type: 'boolean', required: true, factKey: 'preg_vaginal_bleeding' },
      { id: 'q_preg_severe_headache', phase: 'review_of_systems', question: 'Severe headache?', type: 'boolean', required: false, factKey: 'preg_severe_headache' },
      { id: 'q_preg_visual_disturbance', phase: 'review_of_systems', question: 'Visual changes?', type: 'boolean', required: false, factKey: 'preg_visual_disturbance' },
      { id: 'q_preg_epigastric_pain', phase: 'review_of_systems', question: 'Upper abdominal pain?', type: 'boolean', required: false, factKey: 'preg_epigastric_pain' },
      { id: 'q_preg_convulsions', phase: 'review_of_systems', question: 'Convulsions?', type: 'boolean', required: false, factKey: 'preg_convulsions' },
      { id: 'q_preg_reduced_movement', phase: 'review_of_systems', question: 'Reduced fetal movements?', type: 'boolean', required: false, factKey: 'preg_reduced_movement' },
    ],
  },
  psychiatry_mse: {
    id: 'psychiatry_mse', label: 'Mental State Examination', phase: 'review_of_systems',
    condition: { module: 'psychiatry' },
    cards: [
      { id: 'q_psych_appearance', phase: 'review_of_systems', question: 'Appearance and behavior', type: 'text', required: false, factKey: 'psych_appearance' },
      { id: 'q_psych_mood', phase: 'review_of_systems', question: 'Mood', type: 'chips', chips: ['Normal', 'Depressed', 'Elevated', 'Anxious', 'Irritable', 'Blunted'], required: true, factKey: 'psych_mood' },
      { id: 'q_psych_thought', phase: 'review_of_systems', question: 'Thought form/content', type: 'text', required: false, factKey: 'psych_thought' },
      { id: 'q_psych_perception', phase: 'review_of_systems', question: 'Hallucinations?', type: 'boolean', required: false, factKey: 'psych_hallucinations' },
      { id: 'q_psych_insight', phase: 'review_of_systems', question: 'Insight', type: 'chips', chips: ['Full', 'Partial', 'Absent'], required: true, factKey: 'psych_insight' },
      { id: 'q_psych_judgment', phase: 'review_of_systems', question: 'Judgment', type: 'chips', chips: ['Intact', 'Impaired'], required: true, factKey: 'psych_judgment' },
    ],
  },
  psychiatry_risk: {
    id: 'psychiatry_risk', label: 'Risk Assessment', phase: 'management',
    condition: { module: 'psychiatry' },
    cards: [
      { id: 'q_psych_suicidal', phase: 'management', question: 'Suicidal ideation?', type: 'boolean', required: true, factKey: 'psych_suicidal' },
      { id: 'q_psych_plan', phase: 'management', question: 'Suicide plan?', type: 'boolean', required: false, factKey: 'psych_suicide_plan', dependsOn: { questionId: 'q_psych_suicidal', value: true } },
      { id: 'q_psych_self_harm', phase: 'management', question: 'Self-harm?', type: 'boolean', required: false, factKey: 'psych_self_harm' },
      { id: 'q_psych_violence', phase: 'management', question: 'Risk of violence?', type: 'boolean', required: false, factKey: 'psych_violence' },
    ],
  },
  male_prostate: {
    id: 'male_prostate', label: 'Prostate / Urinary', phase: 'review_of_systems',
    condition: { module: 'male' },
    cards: [
      { id: 'q_male_nocturia', phase: 'review_of_systems', question: 'Waking to urinate at night?', type: 'boolean', required: false, factKey: 'male_nocturia' },
      { id: 'q_male_hesitancy', phase: 'review_of_systems', question: 'Difficulty starting urine?', type: 'boolean', required: false, factKey: 'male_hesitancy' },
      { id: 'q_male_weak_stream', phase: 'review_of_systems', question: 'Weak stream?', type: 'boolean', required: false, factKey: 'male_weak_stream' },
    ],
  },
  surgery_postop: {
    id: 'surgery_postop', label: 'Post-operative Status', phase: 'patient_context',
    condition: { module: 'surgery' },
    cards: [
      { id: 'q_surgery_postop_day', phase: 'patient_context', question: 'Post-op day?', type: 'text', required: false, factKey: 'postop_day' },
      { id: 'q_surgery_wound_status', phase: 'patient_context', question: 'Wound status', type: 'chips', chips: ['Clean/dry', 'Serous drainage', 'Purulent', 'Dehisced', 'Dressing intact'], required: false, factKey: 'wound_status' },
      { id: 'q_surgery_drains', phase: 'patient_context', question: 'Drains in situ?', type: 'text', required: false, factKey: 'drains' },
      { id: 'q_surgery_flatus', phase: 'patient_context', question: 'Passing flatus?', type: 'boolean', required: false, factKey: 'surgery_flatus' },
      { id: 'q_surgery_stool', phase: 'patient_context', question: 'Opened bowels?', type: 'boolean', required: false, factKey: 'surgery_stool' },
    ],
  },
  emergency_abcde: {
    id: 'emergency_abcde', label: 'ABCDE Assessment', phase: 'review_of_systems',
    condition: { module: 'emergency' },
    cards: [
      { id: 'q_emerg_airway', phase: 'review_of_systems', question: 'Airway patent?', type: 'boolean', required: true, factKey: 'airway_patent' },
      { id: 'q_emerg_breathing_rr', phase: 'review_of_systems', question: 'Respiratory rate?', type: 'text', required: true, factKey: 'emerg_rr' },
      { id: 'q_emerg_breathing_o2', phase: 'review_of_systems', question: 'O2 saturation?', type: 'text', required: true, factKey: 'emerg_o2' },
      { id: 'q_emerg_circulation_hr', phase: 'review_of_systems', question: 'Heart rate?', type: 'text', required: true, factKey: 'emerg_hr' },
      { id: 'q_emerg_circulation_bp', phase: 'review_of_systems', question: 'Blood pressure?', type: 'text', required: true, factKey: 'emerg_bp' },
      { id: 'q_emerg_disability_gcs', phase: 'review_of_systems', question: 'GCS?', type: 'text', required: true, factKey: 'emerg_gcs' },
      { id: 'q_emerg_disability_pupils', phase: 'review_of_systems', question: 'Pupils equal/reactive?', type: 'chips', chips: ['Both reactive', 'Unequal', 'Sluggish', 'Fixed/dilated'], required: false, factKey: 'emerg_pupils' },
      { id: 'q_emerg_exposure', phase: 'review_of_systems', question: 'Exposure findings?', type: 'text', required: false, factKey: 'emerg_exposure' },
    ],
  },

  // ═══════════════════════════════════════════
  // SYSTEMIC EXAMINATION — imported from examination/
  // ═══════════════════════════════════════════
  ...Object.fromEntries(EXAMINATION_GROUPS.map(g => [g.id, g])),
};
