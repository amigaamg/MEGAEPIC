import type {
  QuestionGroupVisibility, QuestionCardVisibility,
  VisibilityCriterion, CascadeRule, ClinicalPriority,
} from './types';

const ALWAYS: VisibilityCriterion[] = [{ type: 'always' }];
const NEVER: VisibilityCriterion[] = [{ type: 'never' }];

function F(conditions: VisibilityCriterion[]): VisibilityCriterion[] { return conditions; }
function H(conditions: VisibilityCriterion[]): VisibilityCriterion[] { return conditions; }
function R(conditions: VisibilityCriterion[]): VisibilityCriterion[] { return conditions; }
function C(...cascades: CascadeRule[]): CascadeRule[] { return cascades; }

// ──────────────────────────────────────────────────────────────────
// ALL QUESTION GROUPS — organized by domain with medical priority
// ──────────────────────────────────────────────────────────────────

export const QUESTION_GROUPS_CATALOG: QuestionGroupVisibility[] = [

  // ════════════════════════════════════════════════
  // GROUP 1: TRIAGE & SAFETY (always first)
  // ════════════════════════════════════════════════
  {
    groupId: 'triage_safety', label: 'Safety Screening', section: 'triage',
    domain: 'triage', basePriority: 'triage', visibility: ALWAYS, hideWhen: NEVER,
    order: 1,
    cards: [
      { fieldId: 'airway_compromised', label: 'Is the airway compromised?', section: 'triage', domain: 'triage', priority: 'triage', priorityScore: 100, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'airway_compromised', value: true }, showFields: ['airway_intervention', 'airway_type'], hideFields: [], makeRequired: ['oxygen_saturation', 'respiratory_rate'] },
      ), groupId: 'triage_safety', order: 1 },
      { fieldId: 'breathing_distress', label: 'Is there respiratory distress?', section: 'triage', domain: 'triage', priority: 'triage', priorityScore: 99, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'breathing_distress', value: true }, showFields: ['respiratory_rate', 'oxygen_saturation', 'accessory_muscle_use', 'chest_indrawing', 'grunting', 'nasal_flaring'], hideFields: [], makeRequired: ['respiratory_rate', 'oxygen_saturation'] },
      ), groupId: 'triage_safety', order: 2 },
      { fieldId: 'circulation_compromised', label: 'Are there signs of shock?', section: 'triage', domain: 'triage', priority: 'triage', priorityScore: 98, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'circulation_compromised', value: true }, showFields: ['blood_pressure', 'heart_rate', 'capillary_refill', 'urine_output', 'mental_state'], hideFields: [], makeRequired: ['blood_pressure', 'heart_rate'] },
      ), groupId: 'triage_safety', order: 3 },
      { fieldId: 'disability_neuro', label: 'Is there altered consciousness?', section: 'triage', domain: 'triage', priority: 'triage', priorityScore: 97, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'disability_neuro', value: true }, showFields: ['gcs_eye', 'gcs_verbal', 'gcs_motor', 'avpu', 'pupils', 'hypoglycemia_screen'], hideFields: [], makeRequired: ['gcs_eye', 'gcs_verbal', 'gcs_motor'] },
      ), groupId: 'triage_safety', order: 4 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 2: VITAL SIGNS
  // ════════════════════════════════════════════════
  {
    groupId: 'vital_signs', label: 'Vital Signs', section: 'vitals',
    domain: 'vital_sign', basePriority: 'critical', visibility: ALWAYS, hideWhen: NEVER,
    order: 2,
    cards: [
      { fieldId: 'temperature', label: 'Temperature (°C)', section: 'vitals', domain: 'vital_sign', priority: 'critical', priorityScore: 90, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'temperature', value: 39 }, showFields: ['fever_duration', 'fever_pattern', 'rigors', 'antipyretic_response'], hideFields: [], makeRequired: ['fever_duration'] },
        { trigger: { field: 'temperature', value: 35 }, showFields: ['hypothermia_duration', 'exposure_history'], hideFields: [], makeRequired: [] },
      ), groupId: 'vital_signs', order: 1 },
      { fieldId: 'heart_rate', label: 'Heart Rate (bpm)', section: 'vitals', domain: 'vital_sign', priority: 'critical', priorityScore: 89, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'heart_rate', value: 120 }, showFields: ['ekg_rhythm', 'chest_pain', 'syncope'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'heart_rate', value: 60 }, showFields: ['ekg_rhythm', 'dizziness', 'syncope'], hideFields: [], makeRequired: [] },
      ), groupId: 'vital_signs', order: 2 },
      { fieldId: 'respiratory_rate', label: 'Respiratory Rate (/min)', section: 'vitals', domain: 'vital_sign', priority: 'critical', priorityScore: 88, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'respiratory_rate', value: 24 }, showFields: ['oxygen_saturation', 'accessory_muscle_use', 'chest_indrawing'], hideFields: [], makeRequired: ['oxygen_saturation'] },
      ), groupId: 'vital_signs', order: 3 },
      { fieldId: 'oxygen_saturation', label: 'O₂ Saturation (%)', section: 'vitals', domain: 'vital_sign', priority: 'critical', priorityScore: 87, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'oxygen_saturation', value: 94 }, showFields: ['oxygen_flow_rate', 'oxygen_device', 'abg_required'], hideFields: [], makeRequired: [] },
      ), groupId: 'vital_signs', order: 4 },
      { fieldId: 'blood_pressure_systolic', label: 'Systolic BP (mmHg)', section: 'vitals', domain: 'vital_sign', priority: 'critical', priorityScore: 86, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'blood_pressure_systolic', value: 90 }, showFields: ['fluid_resuscitation', 'inotropic_support', 'urine_output'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'blood_pressure_systolic', value: 180 }, showFields: ['antihypertensive_history', 'target_organ_damage'], hideFields: [], makeRequired: [] },
      ), groupId: 'vital_signs', order: 5 },
      { fieldId: 'gcs_eye', label: 'GCS — Eye opening', section: 'vitals', domain: 'neurological', priority: 'critical', priorityScore: 85, visibility: F([{ type: 'is_emergency' }, { type: 'field_equals', params: { field: 'disability_neuro', value: true } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'vital_signs', order: 6 },
      { fieldId: 'gcs_verbal', label: 'GCS — Verbal response', section: 'vitals', domain: 'neurological', priority: 'critical', priorityScore: 84, visibility: F([{ type: 'is_emergency' }, { type: 'field_equals', params: { field: 'disability_neuro', value: true } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'vital_signs', order: 7 },
      { fieldId: 'gcs_motor', label: 'GCS — Motor response', section: 'vitals', domain: 'neurological', priority: 'critical', priorityScore: 83, visibility: F([{ type: 'is_emergency' }, { type: 'field_equals', params: { field: 'disability_neuro', value: true } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'vital_signs', order: 8 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 3: CHIEF COMPLAINT
  // ════════════════════════════════════════════════
  {
    groupId: 'chief_complaint', label: 'Chief Complaint', section: 'chief_complaint',
    domain: 'chief_complaint', basePriority: 'critical', visibility: ALWAYS, hideWhen: F([{ type: 'is_ward_round' }, { type: 'is_follow_up' }]),
    order: 3,
    cards: [
      { fieldId: 'cc_primary', label: 'What is the main problem?', section: 'chief_complaint', domain: 'chief_complaint', priority: 'critical', priorityScore: 80, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'cc_primary', value: 'abdominal_pain' }, showFields: ['pain_onset', 'pain_location', 'pain_character', 'pain_severity', 'pain_migration', 'pain_radiation', 'nausea', 'vomiting', 'anorexia', 'fever', 'peritonism'], hideFields: ['chest_pain_radiation', 'dyspnea_onset'], makeRequired: ['pain_onset', 'pain_location', 'pain_character', 'pain_severity'] },
        { trigger: { field: 'cc_primary', value: 'chest_pain' }, showFields: ['chest_pain_onset', 'chest_pain_radiation', 'chest_pain_exertional', 'chest_pain_sweating', 'chest_pain_nausea', 'dyspnea', 'palpitations'], hideFields: ['pain_migration', 'peritonism'], makeRequired: ['chest_pain_onset', 'chest_pain_radiation'] },
        { trigger: { field: 'cc_primary', value: 'fever' }, showFields: ['fever_duration', 'fever_pattern', 'fever_measured_temp', 'rigors', 'fever_progression'], hideFields: ['pain_character'], makeRequired: ['fever_duration', 'fever_pattern'] },
        { trigger: { field: 'cc_primary', value: 'cough' }, showFields: ['cough_duration', 'cough_character', 'cough_sputum', 'cough_hemoptysis', 'dyspnea', 'wheeze'], hideFields: ['pain_character', 'peritonism'], makeRequired: ['cough_duration', 'cough_character'] },
        { trigger: { field: 'cc_primary', value: 'headache' }, showFields: ['headache_onset', 'headache_severity', 'headache_character', 'headache_location', 'neck_stiffness', 'photophobia', 'vomiting', 'neurological_deficit'], hideFields: ['pain_migration'], makeRequired: ['headache_onset', 'headache_severity'] },
        { trigger: { field: 'cc_primary', value: 'injury_fall' }, showFields: ['trauma_mechanism', 'trauma_time', 'trauma_location', 'wound_assessment', 'neurovascular_status', 'tetanus_status'], hideFields: ['pain_migration', 'peritonism'], makeRequired: ['trauma_mechanism', 'trauma_time'] },
      ), groupId: 'chief_complaint', order: 1 },
      { fieldId: 'cc_duration', label: 'Duration', section: 'chief_complaint', domain: 'chief_complaint', priority: 'essential', priorityScore: 75, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'cc_duration', value: 72 }, showFields: ['treatment_sought', 'treatment_response', 'previous_episodes'], hideFields: [], makeRequired: [] },
      ), groupId: 'chief_complaint', order: 2 },
      { fieldId: 'cc_onset', label: 'When did it start?', section: 'chief_complaint', domain: 'chief_complaint', priority: 'essential', priorityScore: 74, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'chief_complaint', order: 3 },
      { fieldId: 'cc_patient_words', label: 'Patient\'s own words (optional)', section: 'chief_complaint', domain: 'chief_complaint', priority: 'supportive', priorityScore: 40, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'chief_complaint', order: 4 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 4: RED FLAG SCREENING (per CC)
  // ════════════════════════════════════════════════
  {
    groupId: 'red_flags', label: 'Red Flag Screening', section: 'red_flags',
    domain: 'red_flag', basePriority: 'critical', visibility: F([{ type: 'field_not_empty', params: { field: 'cc_primary' } }]), hideWhen: NEVER,
    order: 4,
    cards: [
      { fieldId: 'syncope', label: 'Has there been syncope or fainting?', section: 'red_flags', domain: 'safety', priority: 'critical', priorityScore: 95, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'red_flags', order: 1 },
      { fieldId: 'peritonism', label: 'Is there guarding or rigidity?', section: 'red_flags', domain: 'safety', priority: 'critical', priorityScore: 94, visibility: F([{ type: 'complaint_contains', params: { keyword: 'abdominal' } }]), hideWhen: NEVER, required: R([{ type: 'complaint_contains', params: { keyword: 'abdominal' } }]), groupId: 'red_flags', order: 2 },
      { fieldId: 'hematemesis', label: 'Has there been vomiting blood?', section: 'red_flags', domain: 'safety', priority: 'critical', priorityScore: 93, visibility: F([{ type: 'complaint_contains', params: { keyword: 'vomit' } }, { type: 'complaint_contains', params: { keyword: 'abdominal' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'red_flags', order: 3 },
      { fieldId: 'neck_stiffness', label: 'Is there neck stiffness?', section: 'red_flags', domain: 'safety', priority: 'critical', priorityScore: 92, visibility: F([{ type: 'complaint_contains', params: { keyword: 'headache' } }, { type: 'complaint_contains', params: { keyword: 'fever' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'red_flags', order: 4 },
      { fieldId: 'seizure', label: 'Has there been a seizure?', section: 'red_flags', domain: 'safety', priority: 'critical', priorityScore: 91, visibility: F([{ type: 'complaint_contains', params: { keyword: 'fever' } }, { type: 'is_pediatric' }]), hideWhen: NEVER, required: ALWAYS, groupId: 'red_flags', order: 5 },
      { fieldId: 'vaginal_bleeding_pregnancy', label: 'Vaginal bleeding in pregnancy?', section: 'red_flags', domain: 'obgyn', priority: 'triage', priorityScore: 100, visibility: F([{ type: 'is_pregnant' }]), hideWhen: NEVER, required: R([{ type: 'is_pregnant' }]), groupId: 'red_flags', order: 6 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 5: HPI — PAIN CHARACTERIZATION
  // ════════════════════════════════════════════════
  {
    groupId: 'pain_characterization', label: 'Pain Characterization', section: 'hpi',
    domain: 'pain', basePriority: 'essential', visibility: F([{ type: 'complaint_contains', params: { keyword: 'pain' } }, { type: 'complaint_contains', params: { keyword: 'abdominal' } }]), hideWhen: NEVER,
    order: 5,
    cards: [
      { fieldId: 'pain_onset', label: 'Pain onset: sudden or gradual?', section: 'hpi', domain: 'pain', priority: 'essential', priorityScore: 70, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'pain_onset', value: 'sudden' }, showFields: ['pain_onset_sudden_detail', 'vascular_risk_screening'], hideFields: [], makeRequired: [] },
      ), groupId: 'pain_characterization', order: 1 },
      { fieldId: 'pain_initial_location', label: 'Where did the pain start?', section: 'hpi', domain: 'pain', priority: 'essential', priorityScore: 69, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'pain_characterization', order: 2 },
      { fieldId: 'pain_migration', label: 'Has the pain moved?', section: 'hpi', domain: 'pain', priority: 'essential', priorityScore: 68, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'pain_characterization', order: 3 },
      { fieldId: 'pain_character', label: 'Pain character? (colicky/sharp/burning/tearing)', section: 'hpi', domain: 'pain', priority: 'essential', priorityScore: 67, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'pain_characterization', order: 4 },
      { fieldId: 'pain_severity', label: 'Pain severity (0-10)?', section: 'hpi', domain: 'pain', priority: 'essential', priorityScore: 66, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'pain_severity', value: 8 }, showFields: ['pain_associated_syncope', 'pain_associated_sweating', 'analgesia_given'], hideFields: [], makeRequired: [] },
      ), groupId: 'pain_characterization', order: 5 },
      { fieldId: 'pain_radiation', label: 'Does the pain radiate?', section: 'hpi', domain: 'pain', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'pain_characterization', order: 6 },
      { fieldId: 'pain_worsening_factors', label: 'What makes it worse?', section: 'hpi', domain: 'pain', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'pain_characterization', order: 7 },
      { fieldId: 'pain_relieving_factors', label: 'What makes it better?', section: 'hpi', domain: 'pain', priority: 'standard', priorityScore: 48, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'pain_characterization', order: 8 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 6: REPRODUCTIVE & OBGYN (only when contextually relevant)
  // ════════════════════════════════════════════════
  {
    groupId: 'reproductive_history', label: 'Reproductive History', section: 'reproductive',
    domain: 'obgyn', basePriority: 'standard', visibility: F([
      { type: 'sex', params: { values: ['female'] } },
      { type: 'age_min_months', params: { months: 120 } },
      { type: 'reproductive_stage', params: { values: ['reproductive_age'] } },
    ]), hideWhen: F([
      { type: 'sex', params: { values: ['male'] } },
      { type: 'age_max_months', params: { months: 119 } },
    ]),
    order: 6,
    cards: [
      { fieldId: 'pregnancy_related_visit', label: 'Is this visit pregnancy or gynecological related?', section: 'reproductive', domain: 'obgyn', priority: 'critical', priorityScore: 85, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'pregnancy_related_visit', value: 'not_pregnant_routine' }, showFields: ['lmp', 'menstrual_cycle', 'contraception'], hideFields: ['pregnancy_confirmation', 'gestational_age', 'edd', 'fetal_movements', 'contractions', 'obstetric_history_full', 'antenatal_complications'], makeRequired: [] },
        { trigger: { field: 'pregnancy_related_visit', value: 'currently_pregnant' }, showFields: ['pregnancy_confirmation', 'lmp', 'gestational_age_weeks', 'edd', 'gravida', 'para', 'previous_cs', 'obstetric_history_full', 'antenatal_complications', 'fetal_movements', 'contractions', 'hpi_nausea', 'hpi_vaginal_bleeding'], hideFields: [], makeRequired: ['lmp', 'gestational_age_weeks', 'gravida', 'para'] },
        { trigger: { field: 'pregnancy_related_visit', value: 'gynecological_complaint' }, showFields: ['lmp', 'menstrual_cycle', 'menstrual_complaints', 'vaginal_discharge', 'vaginal_bleeding', 'pelvic_pain', 'contraception', 'cervical_screening', 'sexual_history', 'gynecological_history_full'], hideFields: ['gestational_age', 'edd', 'fetal_movements', 'contractions', 'obstetric_history_full'], makeRequired: ['lmp', 'menstrual_cycle'] },
        { trigger: { field: 'pregnancy_related_visit', value: 'postpartum' }, showFields: ['delivery_date', 'delivery_mode', 'postpartum_complications', 'breastfeeding', 'baby_status', 'lochia', 'perineal_wound', 'cs_wound'], hideFields: ['gestational_age', 'edd', 'fetal_movements'], makeRequired: ['delivery_date', 'delivery_mode'] },
      ), groupId: 'reproductive_history', order: 1 },

      // ── Pregnancy cascade ──
      { fieldId: 'pregnancy_confirmation', label: 'How was pregnancy confirmed?', section: 'reproductive', domain: 'pregnancy', priority: 'essential', priorityScore: 72, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'currently_pregnant' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 2 },
      { fieldId: 'lmp', label: 'LMP (first day of last period)', section: 'reproductive', domain: 'pregnancy', priority: 'essential', priorityScore: 71, visibility: F([{ type: 'sex', params: { values: ['female'] } }, { type: 'age_min_months', params: { months: 120 } }]), hideWhen: F([{ type: 'sex', params: { values: ['male'] } }, { type: 'age_max_months', params: { months: 119 } }]), required: ALWAYS, groupId: 'reproductive_history', order: 3 },
      { fieldId: 'gestational_age_weeks', label: 'Gestational age (weeks)', section: 'reproductive', domain: 'pregnancy', priority: 'essential', priorityScore: 70, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'currently_pregnant' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 4 },
      { fieldId: 'gravida', label: 'Gravida (number of pregnancies)', section: 'reproductive', domain: 'obgyn', priority: 'standard', priorityScore: 55, visibility: F([{ type: 'field_in', params: { field: 'pregnancy_related_visit', values: ['currently_pregnant', 'postpartum'] } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 5 },
      { fieldId: 'para', label: 'Para (number of deliveries)', section: 'reproductive', domain: 'obgyn', priority: 'standard', priorityScore: 54, visibility: F([{ type: 'field_in', params: { field: 'pregnancy_related_visit', values: ['currently_pregnant', 'postpartum'] } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 6 },

      // ── Gynaecology cascade ──
      { fieldId: 'menstrual_cycle', label: 'Menstrual cycle regularity?', section: 'reproductive', domain: 'obgyn', priority: 'standard', priorityScore: 53, visibility: F([{ type: 'field_in', params: { field: 'pregnancy_related_visit', values: ['not_pregnant_routine', 'gynecological_complaint'] } }]), hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'menstrual_cycle', value: 'irregular' }, showFields: ['menstrual_frequency', 'menstrual_duration', 'menstrual_flow', 'dysmenorrhea', 'intermenstrual_bleeding'], hideFields: [], makeRequired: ['menstrual_frequency'] },
        { trigger: { field: 'menstrual_cycle', value: 'absent_amenorrhea' }, showFields: ['pregnancy_test', 'lmp_confirm', 'hormonal_assessment'], hideFields: [], makeRequired: ['pregnancy_test'] },
      ), groupId: 'reproductive_history', order: 7 },
      { fieldId: 'vaginal_bleeding', label: 'Abnormal vaginal bleeding?', section: 'reproductive', domain: 'obgyn', priority: 'critical', priorityScore: 85, visibility: F([{ type: 'field_in', params: { field: 'pregnancy_related_visit', values: ['gynecological_complaint', 'not_pregnant_routine'] } }]), hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'vaginal_bleeding', value: true }, showFields: ['vaginal_bleeding_volume', 'vaginal_bleeding_duration', 'vaginal_bleeding_clots', 'vaginal_bleeding_pain', 'pregnancy_test_required'], hideFields: [], makeRequired: ['vaginal_bleeding_volume', 'vaginal_bleeding_duration'] },
      ), groupId: 'reproductive_history', order: 8 },
      { fieldId: 'vaginal_discharge', label: 'Abnormal vaginal discharge?', section: 'reproductive', domain: 'obgyn', priority: 'standard', priorityScore: 52, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'gynecological_complaint' } }]), hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'vaginal_discharge', value: true }, showFields: ['discharge_color', 'discharge_odor', 'discharge_itching', 'discharge_duration'], hideFields: [], makeRequired: ['discharge_color'] },
      ), groupId: 'reproductive_history', order: 9 },
      { fieldId: 'pelvic_pain', label: 'Pelvic or lower abdominal pain?', section: 'reproductive', domain: 'obgyn', priority: 'essential', priorityScore: 68, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'gynecological_complaint' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 10 },
      { fieldId: 'contraception', label: 'Current contraception?', section: 'reproductive', domain: 'obgyn', priority: 'supportive', priorityScore: 35, visibility: F([{ type: 'field_not_equals', params: { field: 'pregnancy_related_visit', value: 'currently_pregnant' } }, { type: 'sex', params: { values: ['female'] } }]), hideWhen: NEVER, required: NEVER, groupId: 'reproductive_history', order: 11 },

      // ── Postpartum cascade ──
      { fieldId: 'delivery_date', label: 'Date of delivery?', section: 'reproductive', domain: 'obgyn', priority: 'essential', priorityScore: 65, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'postpartum' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 12 },
      { fieldId: 'delivery_mode', label: 'Mode of delivery?', section: 'reproductive', domain: 'obgyn', priority: 'essential', priorityScore: 64, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'postpartum' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 13 },
      { fieldId: 'breastfeeding', label: 'Is the mother breastfeeding?', section: 'reproductive', domain: 'obgyn', priority: 'standard', priorityScore: 55, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'postpartum' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 14 },
      { fieldId: 'lochia', label: 'Lochia: color, volume, odor?', section: 'reproductive', domain: 'obgyn', priority: 'standard', priorityScore: 50, visibility: F([{ type: 'field_equals', params: { field: 'pregnancy_related_visit', value: 'postpartum' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'reproductive_history', order: 15 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 7: ASSOCIATED SYMPTOMS (by complaint)
  // ════════════════════════════════════════════════
  {
    groupId: 'associated_symptoms', label: 'Associated Symptoms', section: 'hpi',
    domain: 'symptom', basePriority: 'standard', visibility: F([{ type: 'field_not_empty', params: { field: 'cc_primary' } }]), hideWhen: NEVER,
    order: 7,
    cards: [
      { fieldId: 'nausea', label: 'Nausea?', section: 'hpi', domain: 'gi', priority: 'standard', priorityScore: 60, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'associated_symptoms', order: 1 },
      { fieldId: 'vomiting', label: 'Vomiting?', section: 'hpi', domain: 'gi', priority: 'essential', priorityScore: 65, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'vomiting', value: true }, showFields: ['vomiting_timing', 'vomiting_description', 'vomiting_bilious', 'vomiting_projectile', 'vomiting_frequency', 'vomiting_blood', 'dehydration_assessment', 'urine_output'], hideFields: [], makeRequired: ['vomiting_timing'] },
      ), groupId: 'associated_symptoms', order: 2 },
      { fieldId: 'diarrhea', label: 'Diarrhea?', section: 'hpi', domain: 'gi', priority: 'standard', priorityScore: 58, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'diarrhea', value: true }, showFields: ['diarrhea_duration', 'diarrhea_stool_type', 'diarrhea_frequency', 'diarrhea_dehydration', 'diarrhea_blood'], hideFields: [], makeRequired: ['diarrhea_duration', 'diarrhea_stool_type'] },
      ), groupId: 'associated_symptoms', order: 3 },
      { fieldId: 'fever_hpi', label: 'Fever?', section: 'hpi', domain: 'infectious_disease', priority: 'essential', priorityScore: 65, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'fever_hpi', value: true }, showFields: ['fever_duration', 'fever_pattern', 'fever_measured_temp', 'rigors', 'fever_progression', 'travel_history', 'malaria_exposure', 'typhoid_symptoms'], hideFields: [], makeRequired: ['fever_duration', 'fever_pattern'] },
      ), groupId: 'associated_symptoms', order: 4 },
      { fieldId: 'dyspnea', label: 'Shortness of breath?', section: 'hpi', domain: 'respiratory', priority: 'critical', priorityScore: 82, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'dyspnea', value: true }, showFields: ['dyspnea_onset', 'dyspnea_exertional', 'dyspnea_at_rest', 'dyspnea_orthopnea', 'dyspnea_pnd', 'oxygen_saturation', 'chest_auscultation_findings'], hideFields: [], makeRequired: ['dyspnea_onset', 'oxygen_saturation'] },
      ), groupId: 'associated_symptoms', order: 5 },
      { fieldId: 'anorexia', label: 'Loss of appetite?', section: 'hpi', domain: 'gi', priority: 'standard', priorityScore: 52, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'associated_symptoms', order: 6 },
      { fieldId: 'weight_loss', label: 'Unintentional weight loss?', section: 'hpi', domain: 'gi', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'weight_loss', value: true }, showFields: ['weight_loss_amount', 'weight_loss_period', 'weight_loss_appetite', 'malignancy_screening'], hideFields: [], makeRequired: ['weight_loss_amount', 'weight_loss_period'] },
      ), groupId: 'associated_symptoms', order: 7 },
      { fieldId: 'fatigue', label: 'Fatigue or weakness?', section: 'hpi', domain: 'symptom', priority: 'supportive', priorityScore: 35, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'associated_symptoms', order: 8 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 8: RESPIRATORY (when relevant)
  // ════════════════════════════════════════════════
  {
    groupId: 'respiratory_symptoms', label: 'Respiratory Symptoms', section: 'hpi',
    domain: 'respiratory', basePriority: 'standard', visibility: F([{ type: 'complaint_contains', params: { keyword: 'cough' } }, { type: 'complaint_contains', params: { keyword: 'breath' } }, { type: 'complaint_contains', params: { keyword: 'chest' } }, { type: 'module_active', params: { module: 'respiratory' } }]), hideWhen: NEVER,
    order: 8,
    cards: [
      { fieldId: 'cough_character', label: 'Cough: dry or productive?', section: 'hpi', domain: 'respiratory', priority: 'essential', priorityScore: 65, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'cough_character', value: 'productive' }, showFields: ['sputum_color', 'sputum_volume', 'sputum_odor', 'hemoptysis'], hideFields: [], makeRequired: ['sputum_color'] },
      ), groupId: 'respiratory_symptoms', order: 1 },
      { fieldId: 'cough_duration', label: 'Cough duration?', section: 'hpi', domain: 'respiratory', priority: 'essential', priorityScore: 64, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'cough_duration', value: 21 }, showFields: ['tb_screening', 'weight_loss', 'night_sweats', 'chest_imaging'], hideFields: [], makeRequired: ['tb_screening'] },
      ), groupId: 'respiratory_symptoms', order: 2 },
      { fieldId: 'hemoptysis', label: 'Coughing up blood?', section: 'hpi', domain: 'respiratory', priority: 'critical', priorityScore: 88, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'hemoptysis', value: true }, showFields: ['hemoptysis_volume', 'hemoptysis_duration', 'chest_imaging_urgent', 'tb_screening'], hideFields: [], makeRequired: ['hemoptysis_volume'] },
      ), groupId: 'respiratory_symptoms', order: 3 },
      { fieldId: 'wheeze', label: 'Wheezing?', section: 'hpi', domain: 'respiratory', priority: 'standard', priorityScore: 58, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'wheeze', value: true }, showFields: ['wheeze_pattern', 'wheeze_triggers', 'asthma_history', 'inhaler_use'], hideFields: [], makeRequired: ['wheeze_pattern'] },
      ), groupId: 'respiratory_symptoms', order: 4 },
      { fieldId: 'chest_pain_resp', label: 'Pleuritic chest pain?', section: 'hpi', domain: 'respiratory', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'respiratory_symptoms', order: 5 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 9: PAST MEDICAL HISTORY
  // ════════════════════════════════════════════════
  {
    groupId: 'past_medical_history', label: 'Past Medical History', section: 'pmh',
    domain: 'pmh', basePriority: 'standard', visibility: ALWAYS, hideWhen: F([{ type: 'is_ward_round' }]),
    order: 9,
    cards: [
      { fieldId: 'pmh_chronic', label: 'Known chronic illnesses?', section: 'pmh', domain: 'pmh', priority: 'essential', priorityScore: 62, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'pmh_chronic', value: 'diabetes' }, showFields: ['diabetes_type', 'diabetes_duration', 'diabetes_medications', 'diabetes_complications', 'hba1c_recent', 'blood_glucose_monitoring'], hideFields: [], makeRequired: ['diabetes_type', 'diabetes_duration'] },
        { trigger: { field: 'pmh_chronic', value: 'hypertension' }, showFields: ['hypertension_duration', 'hypertension_medications', 'bp_control', 'target_organ_damage'], hideFields: [], makeRequired: ['hypertension_duration'] },
        { trigger: { field: 'pmh_chronic', value: 'asthma' }, showFields: ['asthma_control', 'asthma_medications', 'asthma_hospitalizations', 'peak_flow'], hideFields: [], makeRequired: ['asthma_control'] },
        { trigger: { field: 'pmh_chronic', value: 'hiv' }, showFields: ['hiv_duration', 'art_regimen', 'cd4_recent', 'viral_load', 'opportunistic_infections', 'tb_screening'], hideFields: [], makeRequired: ['art_regimen', 'cd4_recent'] },
        { trigger: { field: 'pmh_chronic', value: 'sickle_cell' }, showFields: ['sickle_cell_crisis_frequency', 'hydroxyurea', 'transfusion_history', 'complications'], hideFields: [], makeRequired: ['sickle_cell_crisis_frequency'] },
      ), groupId: 'past_medical_history', order: 1 },
      { fieldId: 'pmh_surgery', label: 'Previous surgeries?', section: 'pmh', domain: 'pmh', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'past_medical_history', order: 2 },
      { fieldId: 'pmh_hospitalization', label: 'Previous hospitalizations?', section: 'pmh', domain: 'pmh', priority: 'supportive', priorityScore: 38, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'past_medical_history', order: 3 },
      { fieldId: 'pmh_transfusion', label: 'Previous blood transfusion?', section: 'pmh', domain: 'pmh', priority: 'supportive', priorityScore: 35, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'past_medical_history', order: 4 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 10: DRUG & ALLERGY HISTORY
  // ════════════════════════════════════════════════
  {
    groupId: 'drug_allergy_history', label: 'Drug & Allergy History', section: 'drugs',
    domain: 'drug_history', basePriority: 'standard', visibility: ALWAYS, hideWhen: NEVER,
    order: 10,
    cards: [
      { fieldId: 'current_medications', label: 'Current medications?', section: 'drugs', domain: 'drug_history', priority: 'essential', priorityScore: 60, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'drug_allergy_history', order: 1 },
      { fieldId: 'drug_allergies', label: 'Any drug allergies?', section: 'drugs', domain: 'allergy', priority: 'critical', priorityScore: 85, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'drug_allergies', value: 'penicillin' }, showFields: ['penicillin_reaction_type', 'penicillin_reaction_severity', 'alternative_antibiotics'], hideFields: [], makeRequired: ['penicillin_reaction_type'] },
        { trigger: { field: 'drug_allergies', value: 'sulpha' }, showFields: ['sulpha_reaction_type', 'alternative_antibiotics'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'drug_allergies', value: 'nsaids' }, showFields: ['nsaid_reaction_type', 'alternative_analgesia'], hideFields: [], makeRequired: [] },
      ), groupId: 'drug_allergy_history', order: 2 },
      { fieldId: 'traditional_medications', label: 'Traditional or herbal medications?', section: 'drugs', domain: 'drug_history', priority: 'supportive', priorityScore: 32, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'drug_allergy_history', order: 3 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 11: FAMILY & SOCIAL HISTORY
  // ════════════════════════════════════════════════
  {
    groupId: 'family_social_history', label: 'Family & Social History', section: 'social',
    domain: 'social', basePriority: 'standard', visibility: ALWAYS, hideWhen: NEVER,
    order: 11,
    cards: [
      { fieldId: 'family_history', label: 'Family history of similar illness?', section: 'social', domain: 'family', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'family_history', value: 'diabetes' }, showFields: ['family_diabetes_relationship', 'family_diabetes_complications'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'family_history', value: 'hypertension' }, showFields: ['family_htn_relationship'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'family_history', value: 'cancer' }, showFields: ['family_cancer_type', 'family_cancer_relationship', 'family_cancer_age'], hideFields: [], makeRequired: ['family_cancer_type'] },
        { trigger: { field: 'family_history', value: 'tb' }, showFields: ['family_tb_relationship', 'family_tb_treatment_status'], hideFields: [], makeRequired: [] },
      ), groupId: 'family_social_history', order: 1 },
      { fieldId: 'smoking', label: 'Smoking history?', section: 'social', domain: 'social', priority: 'standard', priorityScore: 48, visibility: F([{ type: 'age_min_months', params: { months: 144 } }]), hideWhen: F([{ type: 'age_max_months', params: { months: 143 } }]), required: NEVER, cascades: C(
        { trigger: { field: 'smoking', value: true }, showFields: ['smoking_pack_years', 'smoking_duration', 'smoking_cessation_attempts'], hideFields: [], makeRequired: ['smoking_pack_years'] },
      ), groupId: 'family_social_history', order: 2 },
      { fieldId: 'alcohol', label: 'Alcohol use?', section: 'social', domain: 'social', priority: 'standard', priorityScore: 45, visibility: F([{ type: 'age_min_months', params: { months: 180 } }]), hideWhen: F([{ type: 'age_max_months', params: { months: 179 } }]), required: NEVER, cascades: C(
        { trigger: { field: 'alcohol', value: true }, showFields: ['alcohol_units_weekly', 'alcohol_cage_screening', 'alcohol_withdrawal_history'], hideFields: [], makeRequired: ['alcohol_units_weekly'] },
      ), groupId: 'family_social_history', order: 3 },
      { fieldId: 'occupation_social', label: 'Occupation?', section: 'social', domain: 'social', priority: 'standard', priorityScore: 42, visibility: F([{ type: 'age_min_months', params: { months: 216 } }]), hideWhen: NEVER, required: NEVER, groupId: 'family_social_history', order: 4 },
      { fieldId: 'travel_history', label: 'Recent travel?', section: 'social', domain: 'infectious_disease', priority: 'standard', priorityScore: 48, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'travel_history', value: true }, showFields: ['travel_destination', 'travel_duration', 'travel_prophylaxis', 'exposure_history'], hideFields: [], makeRequired: ['travel_destination'] },
      ), groupId: 'family_social_history', order: 5 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 12: ENVIRONMENTAL & EPIDEMIOLOGICAL
  // ════════════════════════════════════════════════
  {
    groupId: 'environmental_context', label: 'Environmental Context', section: 'social',
    domain: 'infectious_disease', basePriority: 'standard', visibility: ALWAYS, hideWhen: NEVER,
    order: 12,
    cards: [
      { fieldId: 'mosquito_exposure', label: 'Mosquito exposure? (nets, stagnant water)', section: 'social', domain: 'infectious_disease', priority: 'standard', priorityScore: 50, visibility: F([{ type: 'complaint_contains', params: { keyword: 'fever' } }]), hideWhen: NEVER, required: NEVER, groupId: 'environmental_context', order: 1 },
      { fieldId: 'water_source', label: 'Water source?', section: 'social', domain: 'infectious_disease', priority: 'supportive', priorityScore: 30, visibility: F([{ type: 'complaint_contains', params: { keyword: 'diarrhea' } }, { type: 'complaint_contains', params: { keyword: 'abdominal' } }]), hideWhen: NEVER, required: NEVER, groupId: 'environmental_context', order: 2 },
      { fieldId: 'tb_contact', label: 'Known TB contact?', section: 'social', domain: 'infectious_disease', priority: 'standard', priorityScore: 48, visibility: F([{ type: 'complaint_contains', params: { keyword: 'cough' } }, { type: 'complaint_contains', params: { keyword: 'fever' } }, { type: 'complaint_contains', params: { keyword: 'weight' } }]), hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'tb_contact', value: true }, showFields: ['tb_contact_type', 'tb_contact_duration', 'tb_screening_complete'], hideFields: [], makeRequired: ['tb_contact_type'] },
      ), groupId: 'environmental_context', order: 3 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 13: NEONATAL IDENTITY & BIRTH HISTORY
  // ════════════════════════════════════════════════
  {
    groupId: 'neonatal_birth', label: 'Neonatal and Birth History', section: 'neonatal_identity',
    domain: 'neonatal', basePriority: 'essential', visibility: F([
      { type: 'module_active', params: { module: 'neonatal' } },
      { type: 'is_neonatal' },
    ]), hideWhen: F([
      { type: 'age_group', params: { values: ['adult', 'older_adult', 'adolescent', 'school_age'] } },
    ]),
    order: 13,
    cards: [
      { fieldId: 'gestation_at_birth', label: 'Gestational age at birth (weeks)', section: 'neonatal_identity', domain: 'neonatal', priority: 'essential', priorityScore: 70, visibility: ALWAYS, hideWhen: NEVER, required: R([{ type: 'module_active', params: { module: 'neonatal' } }]), groupId: 'neonatal_birth', order: 1 },
      { fieldId: 'birth_weight', label: 'Birth weight (kg)', section: 'neonatal_identity', domain: 'neonatal', priority: 'essential', priorityScore: 69, visibility: ALWAYS, hideWhen: F([{ type: 'age_min_months', params: { months: 24 } }]), required: R([{ type: 'module_active', params: { module: 'neonatal' } }]), cascades: C(
        { trigger: { field: 'birth_weight', value: 2.5 }, showFields: ['birth_weight_interpretation', 'low_birth_weight_complications'], hideFields: [], makeRequired: [] },
      ), groupId: 'neonatal_birth', order: 2 },
      { fieldId: 'birth_length', label: 'Birth length (cm)', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'neonatal_birth', order: 3 },
      { fieldId: 'birth_head_circumference', label: 'Head circumference at birth (cm)', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'neonatal_birth', order: 4 },
      { fieldId: 'birth_place', label: 'Place of delivery', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'neonatal_birth', order: 5 },
      { fieldId: 'birth_attendant', label: 'Birth attendant', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'neonatal_birth', order: 6 },
      { fieldId: 'labour_onset', label: 'Labour onset', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'neonatal_birth', order: 7 },
      { fieldId: 'delivery_mode', label: 'Mode of delivery', section: 'neonatal_identity', domain: 'neonatal', priority: 'essential', priorityScore: 60, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'delivery_mode', value: 'cs_elective' }, showFields: ['cs_reason_elective'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'delivery_mode', value: 'cs_emergency' }, showFields: ['cs_reason_emergency', 'cs_urgency_details'], hideFields: [], makeRequired: ['cs_reason_emergency'] },
        { trigger: { field: 'delivery_mode', value: 'vacuum' }, showFields: ['vacuum_indication', 'vacuum_complications'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'delivery_mode', value: 'forceps' }, showFields: ['forceps_indication', 'forceps_complications'], hideFields: [], makeRequired: [] },
      ), groupId: 'neonatal_birth', order: 8 },
      { fieldId: 'liquor_appearance', label: 'Liquor appearance', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'liquor_appearance', value: 'meconium_stained' }, showFields: ['meconium_aspiration_risk', 'resuscitation_plan'], hideFields: [], makeRequired: [] },
      ), groupId: 'neonatal_birth', order: 9 },
      { fieldId: 'apgar_1min', label: 'APGAR at 1 minute', section: 'neonatal_identity', domain: 'neonatal', priority: 'essential', priorityScore: 65, visibility: ALWAYS, hideWhen: NEVER, required: R([{ type: 'field_not_empty', params: { field: 'birth_weight' } }]), cascades: C(
        { trigger: { field: 'apgar_1min', value: 7 }, showFields: ['apgar_5min', 'apgar_10min', 'resuscitation_details'], hideFields: [], makeRequired: ['apgar_5min'] },
      ), groupId: 'neonatal_birth', order: 10 },
      { fieldId: 'apgar_5min', label: 'APGAR at 5 minutes', section: 'neonatal_identity', domain: 'neonatal', priority: 'essential', priorityScore: 64, visibility: F([{ type: 'field_not_empty', params: { field: 'apgar_1min' } }]), hideWhen: NEVER, required: R([{ type: 'field_not_empty', params: { field: 'apgar_1min' } }]), groupId: 'neonatal_birth', order: 11 },
      { fieldId: 'apgar_10min', label: 'APGAR at 10 minutes', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: F([{ type: 'field_not_empty', params: { field: 'apgar_5min' } }, { type: 'field_equals', params: { field: 'apgar_1min', value: 3 } }]), hideWhen: NEVER, required: NEVER, groupId: 'neonatal_birth', order: 12 },
      { fieldId: 'resuscitation_at_birth', label: 'Resuscitation required at birth?', section: 'neonatal_identity', domain: 'neonatal', priority: 'critical', priorityScore: 80, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'resuscitation_at_birth', value: 'bag_mask' }, showFields: ['bag_mask_duration', 'bag_mask_response'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'resuscitation_at_birth', value: 'intubation' }, showFields: ['intubation_indication', 'intubation_duration', 'ventilation_settings'], hideFields: [], makeRequired: ['intubation_indication'] },
      ), groupId: 'neonatal_birth', order: 13 },
      { fieldId: 'nicu_admission', label: 'Admitted to NICU?', section: 'neonatal_identity', domain: 'neonatal', priority: 'essential', priorityScore: 70, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'nicu_admission', value: true }, showFields: ['nicu_reason', 'nicu_duration', 'nicu_complications', 'neonatal_follow_up'], hideFields: [], makeRequired: ['nicu_reason'] },
      ), groupId: 'neonatal_birth', order: 14 },
      { fieldId: 'cried_immediately', label: 'Baby cried immediately after birth?', section: 'neonatal_identity', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'cried_immediately', value: 'no' }, showFields: ['resuscitation_at_birth', 'apgar_1min'], hideFields: [], makeRequired: ['apgar_1min'] },
      ), groupId: 'neonatal_birth', order: 15 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 14: PERINATAL HISTORY
  // ════════════════════════════════════════════════
  {
    groupId: 'perinatal_history', label: 'Perinatal History', section: 'perinatal_history',
    domain: 'neonatal', basePriority: 'standard', visibility: F([
      { type: 'module_active', params: { module: 'neonatal' } },
      { type: 'is_neonatal' },
    ]), hideWhen: F([
      { type: 'age_group', params: { values: ['adult', 'older_adult', 'adolescent'] } },
    ]),
    order: 14,
    cards: [
      { fieldId: 'antenatal_care', label: 'Antenatal care attendance', section: 'perinatal_history', domain: 'neonatal', priority: 'essential', priorityScore: 60, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'antenatal_care', value: 'none' }, showFields: ['antenatal_care_reason', 'home_birth_plan'], hideFields: [], makeRequired: ['antenatal_care_reason'] },
        { trigger: { field: 'antenatal_care', value: 'yes_regular' }, showFields: ['anc_visit_count'], hideFields: [], makeRequired: [] },
      ), groupId: 'perinatal_history', order: 1 },
      { fieldId: 'antenatal_care_visits', label: 'Number of ANC visits', section: 'perinatal_history', domain: 'neonatal', priority: 'standard', priorityScore: 48, visibility: F([{ type: 'field_not_empty', params: { field: 'antenatal_care' } }]), hideWhen: NEVER, required: NEVER, groupId: 'perinatal_history', order: 2 },
      { fieldId: 'maternal_illness_pregnancy', label: 'Maternal illness during pregnancy', section: 'perinatal_history', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'maternal_illness_pregnancy', value: 'hypertension' }, showFields: ['maternal_htn_severity', 'maternal_htn_treatment'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'maternal_illness_pregnancy', value: 'diabetes' }, showFields: ['maternal_dm_control', 'maternal_dm_treatment'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'maternal_illness_pregnancy', value: 'hiv' }, showFields: ['maternal_hiv_art', 'pmtct_status', 'infant_prophylaxis'], hideFields: [], makeRequired: ['maternal_hiv_art'] },
        { trigger: { field: 'maternal_illness_pregnancy', value: 'syphilis' }, showFields: ['maternal_syphilis_treatment', 'infant_evaluation'], hideFields: [], makeRequired: ['maternal_syphilis_treatment'] },
      ), groupId: 'perinatal_history', order: 3 },
      { fieldId: 'medications_in_pregnancy', label: 'Medications taken during pregnancy', section: 'perinatal_history', domain: 'neonatal', priority: 'standard', priorityScore: 48, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'perinatal_history', order: 4 },
      { fieldId: 'pregnancy_complications', label: 'Pregnancy complications', section: 'perinatal_history', domain: 'neonatal', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'pregnancy_complications', value: 'prom' }, showFields: ['prom_duration', 'prom_management', 'chorioamnionitis_screen'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'pregnancy_complications', value: 'aph' }, showFields: ['aph_volume', 'aph_management', 'maternal_haemodynamics'], hideFields: [], makeRequired: [] },
      ), groupId: 'perinatal_history', order: 5 },
      { fieldId: 'fetal_movements_antenatal', label: 'Fetal movements before delivery', section: 'perinatal_history', domain: 'neonatal', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'perinatal_history', order: 6 },
      { fieldId: 'ultrasound_abnormalities', label: 'Antenatal ultrasound abnormalities', section: 'perinatal_history', domain: 'neonatal', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'perinatal_history', order: 7 },
      { fieldId: 'vitamin_k_given', label: 'Vitamin K given at birth?', section: 'perinatal_history', domain: 'neonatal', priority: 'essential', priorityScore: 60, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'perinatal_history', order: 8 },
      { fieldId: 'birth_vaccinations', label: 'Birth vaccinations given? (BCG, OPV, HepB)', section: 'perinatal_history', domain: 'neonatal', priority: 'essential', priorityScore: 60, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'birth_vaccinations', value: 'no' }, showFields: ['birth_vaccination_reason', 'catch_up_plan'], hideFields: [], makeRequired: ['birth_vaccination_reason'] },
      ), groupId: 'perinatal_history', order: 9 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 15: PEDIATRIC GROWTH & NUTRITION
  // ════════════════════════════════════════════════
  {
    groupId: 'pediatric_growth_nutrition', label: 'Growth & Nutrition', section: 'growth',
    domain: 'pediatric', basePriority: 'essential', visibility: F([
      { type: 'module_active', params: { module: 'pediatric' } },
      { type: 'is_pediatric' },
    ]), hideWhen: F([
      { type: 'age_group', params: { values: ['adult', 'older_adult'] } },
    ]),
    order: 15,
    cards: [
      { fieldId: 'current_weight', label: 'Current weight (kg)', section: 'growth', domain: 'pediatric', priority: 'essential', priorityScore: 70, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, groupId: 'pediatric_growth_nutrition', order: 1 },
      { fieldId: 'current_height', label: 'Current height/length (cm)', section: 'growth', domain: 'pediatric', priority: 'essential', priorityScore: 65, visibility: F([{ type: 'field_not_empty', params: { field: 'current_weight' } }]), hideWhen: NEVER, required: ALWAYS, groupId: 'pediatric_growth_nutrition', order: 2 },
      { fieldId: 'current_head_circumference', label: 'Head circumference (cm)', section: 'growth', domain: 'pediatric', priority: 'essential', priorityScore: 60, visibility: F([{ type: 'age_max_months', params: { months: 24 } }]), hideWhen: F([{ type: 'age_min_months', params: { months: 25 } }]), required: R([{ type: 'age_max_months', params: { months: 24 } }]), cascades: C(
        { trigger: { field: 'current_head_circumference', value: 2 }, showFields: ['hc_percentile', 'neurodevelopmental_screen', 'imaging_required'], hideFields: [], makeRequired: ['hc_percentile'] },
      ), groupId: 'pediatric_growth_nutrition', order: 3 },
      { fieldId: 'muac', label: 'Mid-Upper Arm Circumference (cm)', section: 'growth', domain: 'pediatric', priority: 'critical', priorityScore: 80, visibility: F([{ type: 'age_min_months', params: { months: 6 } }, { type: 'age_max_months', params: { months: 60 } }]), hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'muac', value: 11.5 }, showFields: ['severe_acute_malnutrition', 'therapeutic_feeding_program', 'complication_screening'], hideFields: [], makeRequired: ['severe_acute_malnutrition'] },
        { trigger: { field: 'muac', value: 12.5 }, showFields: ['moderate_acute_malnutrition', 'supplementary_feeding_program'], hideFields: [], makeRequired: [] },
      ), groupId: 'pediatric_growth_nutrition', order: 4 },
      { fieldId: 'growth_curve_trend', label: 'Growth curve trend', section: 'growth', domain: 'pediatric', priority: 'standard', priorityScore: 55, visibility: F([{ type: 'age_max_months', params: { months: 60 } }]), hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'growth_curve_trend', value: 'downward_crossing' }, showFields: ['growth_faltering_workup', 'nutritional_assessment', 'chronic_disease_screening'], hideFields: [], makeRequired: ['growth_faltering_workup'] },
      ), groupId: 'pediatric_growth_nutrition', order: 5 },
      { fieldId: 'breastfeeding_status', label: 'Breastfeeding status', section: 'nutrition', domain: 'pediatric', priority: 'essential', priorityScore: 65, visibility: F([{ type: 'age_max_months', params: { months: 24 } }]), hideWhen: F([{ type: 'age_min_months', params: { months: 25 } }]), required: R([{ type: 'age_max_months', params: { months: 24 } }]), cascades: C(
        { trigger: { field: 'breastfeeding_status', value: 'exclusive' }, showFields: ['breastfeeding_frequency', 'breastfeeding_technique', 'jaundice_monitoring'], hideFields: ['formula_type', 'complementary_feeding'], makeRequired: [] },
        { trigger: { field: 'breastfeeding_status', value: 'mixed' }, showFields: ['breastfeeding_frequency', 'formula_type', 'formula_preparation'], hideFields: [], makeRequired: ['formula_type'] },
        { trigger: { field: 'breastfeeding_status', value: 'not_breastfeeding' }, showFields: ['formula_type', 'formula_preparation', 'reason_not_breastfeeding'], hideFields: [], makeRequired: ['formula_type'] },
      ), groupId: 'pediatric_growth_nutrition', order: 6 },
      { fieldId: 'formula_type', label: 'Formula type (if applicable)', section: 'nutrition', domain: 'pediatric', priority: 'standard', priorityScore: 48, visibility: F([{ type: 'field_in', params: { field: 'breastfeeding_status', values: ['mixed', 'not_breastfeeding'] } }]), hideWhen: NEVER, required: R([{ type: 'field_in', params: { field: 'breastfeeding_status', values: ['mixed', 'not_breastfeeding'] } }]), groupId: 'pediatric_growth_nutrition', order: 7 },
      { fieldId: 'complementary_feeding', label: 'Complementary feeding started?', section: 'nutrition', domain: 'pediatric', priority: 'standard', priorityScore: 50, visibility: F([{ type: 'age_min_months', params: { months: 6 } }]), hideWhen: F([{ type: 'age_max_months', params: { months: 5 } }]), required: NEVER, cascades: C(
        { trigger: { field: 'complementary_feeding', value: 'yes' }, showFields: ['complementary_foods', 'meal_frequency', 'food_variety'], hideFields: [], makeRequired: ['complementary_foods'] },
      ), groupId: 'pediatric_growth_nutrition', order: 8 },
      { fieldId: 'appetite', label: 'Appetite', section: 'nutrition', domain: 'pediatric', priority: 'standard', priorityScore: 48, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, groupId: 'pediatric_growth_nutrition', order: 9 },
      { fieldId: 'feeding_difficulties', label: 'Feeding difficulties?', section: 'nutrition', domain: 'pediatric', priority: 'standard', priorityScore: 50, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'feeding_difficulties', value: 'vomiting' }, showFields: ['vomiting_timing', 'vomiting_projectile', 'dehydration_assessment'], hideFields: [], makeRequired: [] },
        { trigger: { field: 'feeding_difficulties', value: 'choking' }, showFields: ['swallowing_assessment', 'speech_therapy_referral'], hideFields: [], makeRequired: [] },
      ), groupId: 'pediatric_growth_nutrition', order: 10 },
    ],
  },

  // ════════════════════════════════════════════════
  // GROUP 16: IMMUNIZATION STATUS
  // ════════════════════════════════════════════════
  {
    groupId: 'immunization_status_group', label: 'Immunization Status', section: 'immunization',
    domain: 'pediatric', basePriority: 'essential', visibility: F([
      { type: 'module_active', params: { module: 'pediatric' } },
      { type: 'is_pediatric' },
    ]), hideWhen: F([
      { type: 'age_group', params: { values: ['adult', 'older_adult'] } },
    ]),
    order: 16,
    cards: [
      { fieldId: 'immunization_status', label: 'Immunization status', section: 'immunization', domain: 'pediatric', priority: 'essential', priorityScore: 70, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'immunization_status', value: 'not_up_to_date' }, showFields: ['immunization_missed_doses', 'immunization_missed_reason', 'immunization_catch_up_plan'], hideFields: [], makeRequired: ['immunization_missed_doses', 'immunization_missed_reason'] },
        { trigger: { field: 'immunization_status', value: 'up_to_date' }, showFields: ['next_due_date'], hideFields: ['immunization_missed_doses', 'immunization_missed_reason'], makeRequired: [] },
      ), groupId: 'immunization_status_group', order: 1 },
      { fieldId: 'immunization_card_available', label: 'Immunization card available?', section: 'immunization', domain: 'pediatric', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: ALWAYS, cascades: C(
        { trigger: { field: 'immunization_card_available', value: false }, showFields: ['immunization_history_recalled', 'immunization_facility_contact'], hideFields: [], makeRequired: ['immunization_history_recalled'] },
      ), groupId: 'immunization_status_group', order: 2 },
      { fieldId: 'immunization_missed_doses', label: 'Which doses were missed?', section: 'immunization', domain: 'pediatric', priority: 'essential', priorityScore: 60, visibility: F([{ type: 'field_equals', params: { field: 'immunization_status', value: 'not_up_to_date' } }]), hideWhen: NEVER, required: R([{ type: 'field_equals', params: { field: 'immunization_status', value: 'not_up_to_date' } }]), groupId: 'immunization_status_group', order: 3 },
      { fieldId: 'immunization_missed_reason', label: 'Reason for missed doses', section: 'immunization', domain: 'pediatric', priority: 'standard', priorityScore: 50, visibility: F([{ type: 'field_equals', params: { field: 'immunization_status', value: 'not_up_to_date' } }]), hideWhen: NEVER, required: R([{ type: 'field_equals', params: { field: 'immunization_status', value: 'not_up_to_date' } }]), groupId: 'immunization_status_group', order: 4 },
      { fieldId: 'immunization_adverse_events', label: 'Any adverse events after vaccination?', section: 'immunization', domain: 'pediatric', priority: 'standard', priorityScore: 55, visibility: ALWAYS, hideWhen: NEVER, required: NEVER, cascades: C(
        { trigger: { field: 'immunization_adverse_events', value: true }, showFields: ['immunization_adverse_details', 'immunization_adverse_severity', 'contraindicated_vaccines'], hideFields: [], makeRequired: ['immunization_adverse_details'] },
      ), groupId: 'immunization_status_group', order: 5 },
    ],
  },
];

export function getQuestionCatalog(): QuestionGroupVisibility[] {
  return QUESTION_GROUPS_CATALOG;
}

