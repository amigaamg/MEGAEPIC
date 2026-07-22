// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CRL — Context Activation Rules (ACT-0000 series)
// ═══════════════════════════════════════════════════════════════════════════════
// These are the cross-domain rules that activate clinical modules based on
// patient demographics, complaints, and encounter context.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ClinicalRule } from '../types';

export const CONTEXT_ACTIVATION_RULES: ClinicalRule[] = [

  // ── ACT-0001: Diabetic Foot ──────────────────────────────────────────────
  // Rule X-001 from the spec: Known diabetes + foot ulcer → diabetic foot pathway
  {
    identity: {
      id: 'ACT-0001',
      category: 'ACT',
      name: 'Diabetic Foot Pathway Activation',
      description: 'Known diabetic with foot ulcer → activate diabetic foot pathway',
      version: '1.0',
      enabled: true,
      priority: 30,
      tags: ['diabetes', 'foot', 'surgery'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'patient.knownConditions', operator: 'contains', value: 'diabetes' },
            { field: 'patient.knownConditions', operator: 'contains', value: 'diabetes_mellitus' },
            { field: 'patient.knownConditions', operator: 'contains', value: 'type_1_diabetes' },
            { field: 'patient.knownConditions', operator: 'contains', value: 'type_2_diabetes' },
          ],
        },
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'foot_ulcer' },
            { field: 'encounter.complaints', operator: 'contains', value: 'leg_ulcer' },
            { field: 'encounter.complaints', operator: 'contains', value: 'diabetic_foot' },
            { field: 'encounter.hasDiabeticFoot', operator: 'eq', value: true },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'diabetic_foot' },
      { type: 'show_section', target: 'foot_examination' },
      { type: 'show_section', target: 'neurovascular_assessment' },
      { type: 'show_section', target: 'wound_assessment' },
      { type: 'show_section', target: 'diabetes_management' },
      { type: 'show_section', target: 'offloading_assessment' },
      { type: 'recommend_exam', target: 'monofilament_test' },
      { type: 'recommend_exam', target: 'doppler_ankle_brachial' },
      { type: 'recommend_investigation', target: 'wound_swab' },
      { type: 'recommend_investigation', target: 'blood_glucose' },
      { type: 'recommend_investigation', target: 'hba1c' },
      { type: 'recommend_investigation', target: 'xray_foot' },
      { type: 'raise_warning', target: 'diabetic_foot_requires_multidisciplinary_care' },
    ],
  },

  // ── ACT-0002: Female + Abdominal Pain → Gynae ────────────────────────────
  // Rule X-002: Female reproductive age + abdominal pain → pregnancy screening + gynae
  {
    identity: {
      id: 'ACT-0002',
      category: 'ACT',
      name: 'Abdominal Pain in Reproductive-Age Female',
      description: 'Female reproductive age with abdominal pain → include gynecologic causes',
      version: '1.0',
      enabled: true,
      priority: 30,
      tags: ['obstetrics', 'gynaecology', 'abdominal_pain'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.sex', operator: 'eq', value: 'female' },
        { field: 'patient.age', operator: 'between', value: [12, 55] },
        { field: 'patient.ageUnit', operator: 'eq', value: 'years' },
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'abdominal_pain' },
            { field: 'encounter.hasAbdominalPain', operator: 'eq', value: true },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_symptom_schema', target: 'gynaecological_history' },
      { type: 'show_section', target: 'menstrual_history' },
      { type: 'show_section', target: 'pregnancy_test' },
      { type: 'show_section', target: 'vaginal_bleeding' },
      { type: 'show_section', target: 'vaginal_discharge' },
      { type: 'show_section', target: 'sexual_history' },
      { type: 'show_section', target: 'contraception_use' },
      { type: 'require_field', target: 'pregnancy_status.current' },
      { type: 'require_field', target: 'lmp.first_day' },
      { type: 'recommend_investigation', target: 'pregnancy_test_urine' },
      { type: 'recommend_investigation', target: 'pelvic_ultrasound' },
    ],
  },

  // ── ACT-0003: Chest Pain → Cardiac Pathway ───────────────────────────────
  {
    identity: {
      id: 'ACT-0003',
      category: 'ACT',
      name: 'Chest Pain — Cardiac Workup',
      description: 'Chest pain complaint → activate cardiac pathway with red flag screening',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['cardiac', 'chest_pain', 'emergency'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.complaints', operator: 'contains', value: 'chest_pain' },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'cardiac_workup' },
      { type: 'activate_symptom_schema', target: 'chest_pain' },
      { type: 'show_section', target: 'cardiac_examination' },
      { type: 'show_section', target: 'ecg' },
      { type: 'show_section', target: 'cardiac_biomarkers' },
      { type: 'require_field', target: 'chest_pain.onset' },
      { type: 'require_field', target: 'chest_pain.radiation' },
      { type: 'require_field', target: 'chest_pain.exertional' },
      { type: 'recommend_question', target: 'chest_pain_radiation' },
      { type: 'recommend_question', target: 'chest_pain_sweating' },
      { type: 'recommend_question', target: 'chest_pain_nausea' },
      { type: 'recommend_investigation', target: 'ecg' },
      { type: 'recommend_investigation', target: 'troponin' },
      { type: 'recommend_investigation', target: 'cxr' },
    ],
  },

  // ── ACT-0004: Known DM Type 1 → Diabetes Management ─────────────────────
  {
    identity: {
      id: 'ACT-0004',
      category: 'ACT',
      name: 'Known Type 1 Diabetes — Comprehensive Diabetes Assessment',
      description: 'Patient known to have type 1 diabetes → full diabetes workup and management',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['diabetes', 'type_1_diabetes', 'chronic'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'patient.knownConditions', operator: 'contains', value: 'type_1_diabetes' },
            { field: 'patient.knownConditions', operator: 'contains', value: 'type_1_dm' },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'diabetes_type_1' },
      { type: 'show_section', target: 'diabetes_history' },
      { type: 'show_section', target: 'insulin_regimen' },
      { type: 'show_section', target: 'glucose_monitoring' },
      { type: 'show_section', target: 'hypoglycemia_awareness' },
      { type: 'show_section', target: 'diabetic_complications' },
      { type: 'show_section', target: 'retinopathy_screening' },
      { type: 'show_section', target: 'nephropathy_screening' },
      { type: 'show_section', target: 'neuropathy_screening' },
      { type: 'require_field', target: 'diabetes.year_diagnosed' },
      { type: 'require_field', target: 'diabetes.current_medications' },
      { type: 'require_field', target: 'diabetes.clinic_followup' },
      { type: 'recommend_investigation', target: 'hba1c' },
      { type: 'recommend_investigation', target: 'fasting_glucose' },
      { type: 'recommend_investigation', target: 'urine_microalbumin' },
      { type: 'recommend_investigation', target: 'lipid_profile' },
      { type: 'recommend_investigation', target: 'fundoscopy' },
    ],
  },

  // ── ACT-0005: Shortness of Breath → Respiratory ──────────────────────────
  {
    identity: {
      id: 'ACT-0005',
      category: 'ACT',
      name: 'Dyspnea — Respiratory Workup',
      description: 'Shortness of breath → activate respiratory assessment',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['respiratory', 'dyspnea'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'dyspnea' },
            { field: 'encounter.complaints', operator: 'contains', value: 'shortness_of_breath' },
            { field: 'encounter.complaints', operator: 'contains', value: 'difficulty_breathing' },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'respiratory_workup' },
      { type: 'activate_symptom_schema', target: 'dyspnea' },
      { type: 'show_section', target: 'respiratory_examination' },
      { type: 'require_field', target: 'dyspnea.onset' },
      { type: 'require_field', target: 'dyspnea.severity' },
      { type: 'require_field', target: 'dyspnea.at_rest' },
      { type: 'recommend_question', target: 'dyspnea_orthopnea' },
      { type: 'recommend_question', target: 'dyspnea_pnd' },
      { type: 'recommend_exam', target: 'chest_auscultation' },
      { type: 'recommend_investigation', target: 'cxr' },
      { type: 'recommend_investigation', target: 'oxygen_saturation' },
      { type: 'recommend_investigation', target: 'abg' },
    ],
  },

  // ── ACT-0006: Fever + Rash → Infectious / Tropical ───────────────────────
  {
    identity: {
      id: 'ACT-0006',
      category: 'ACT',
      name: 'Fever with Rash — Infectious Disease Workup',
      description: 'Fever with rash → consider infectious/tropical causes',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['infectious', 'tropical', 'fever'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.complaints', operator: 'contains', value: 'fever' },
        { field: 'encounter.complaints', operator: 'contains', value: 'rash' },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'infectious_disease' },
      { type: 'show_section', target: 'rash_description' },
      { type: 'show_section', target: 'lymph_node_assessment' },
      { type: 'show_section', target: 'travel_history' },
      { type: 'show_section', target: 'exposure_history' },
      { type: 'require_field', target: 'fever.duration' },
      { type: 'require_field', target: 'fever.pattern' },
      { type: 'recommend_question', target: 'fever_rigors' },
      { type: 'recommend_question', target: 'fever_travel' },
      { type: 'recommend_question', target: 'fever_exposure' },
    ],
  },

  // ── ACT-0007: Hypertension → CV Risk Assessment ─────────────────────────
  {
    identity: {
      id: 'ACT-0007',
      category: 'ACT',
      name: 'Known Hypertension — Cardiovascular Risk Assessment',
      description: 'Known hypertensive → full cardiovascular risk workup',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['hypertension', 'cardiovascular'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'patient.knownConditions', operator: 'contains', value: 'hypertension' },
            { field: 'patient.knownConditions', operator: 'contains', value: 'hypertensive' },
            { field: 'patient.knownConditions', operator: 'contains', value: 'high_blood_pressure' },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'cardiovascular_risk' },
      { type: 'show_section', target: 'bp_history' },
      { type: 'show_section', target: 'antihypertensive_regimen' },
      { type: 'show_section', target: 'target_organ_damage' },
      { type: 'show_section', target: 'cv_risk_factors' },
      { type: 'require_field', target: 'hypertension.year_diagnosed' },
      { type: 'require_field', target: 'hypertension.current_medications' },
      { type: 'recommend_investigation', target: 'ecg' },
      { type: 'recommend_investigation', target: 'renal_function' },
      { type: 'recommend_investigation', target: 'urinalysis' },
      { type: 'recommend_investigation', target: 'lipid_profile' },
    ],
  },

  // ── ACT-0008: Pregnancy + Complaint → Obstetric Workup ──────────────────
  {
    identity: {
      id: 'ACT-0008',
      category: 'ACT',
      name: 'Pregnant Patient — Obstetric-Focused Workup',
      description: 'If pregnant, route all complaints through obstetric lens',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['pregnancy', 'obstetrics', 'safety'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.pregnant', operator: 'eq', value: true },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'obstetric_workup' },
      { type: 'show_section', target: 'obstetric_history' },
      { type: 'show_section', target: 'antenatal_complications' },
      { type: 'show_section', target: 'fetal_assessment' },
      { type: 'show_section', target: 'contractions' },
      { type: 'show_section', target: 'membrane_status' },
      { type: 'show_section', target: 'fetal_movements' },
      { type: 'require_field', target: 'obstetrics.gestation_weeks' },
      { type: 'require_field', target: 'obstetrics.gravida' },
      { type: 'require_field', target: 'obstetrics.para' },
      { type: 'raise_warning', target: 'pregnant_patient_requires_obstetric_review' },
    ],
  },

  // ── ACT-0009: Trauma → Surgical / Ortho ─────────────────────────────────
  {
    identity: {
      id: 'ACT-0009',
      category: 'ACT',
      name: 'Trauma — Surgical / Orthopedic Pathway',
      description: 'Trauma presentation → activate trauma and surgical assessment',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['trauma', 'surgery', 'orthopedics'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'trauma' },
            { field: 'encounter.complaints', operator: 'contains', value: 'fall' },
            { field: 'encounter.complaints', operator: 'contains', value: 'injury' },
            { field: 'encounter.complaints', operator: 'contains', value: 'fracture' },
            { field: 'encounter.complaints', operator: 'contains', value: 'wound' },
            { field: 'encounter.isTrauma', operator: 'eq', value: true },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'trauma' },
      { type: 'show_section', target: 'mechanism_of_injury' },
      { type: 'show_section', target: 'wound_assessment' },
      { type: 'show_section', target: 'neurovascular_status' },
      { type: 'show_section', target: 'tetanus_status' },
      { type: 'show_section', target: 'imaging_required' },
      { type: 'require_field', target: 'trauma.mechanism' },
      { type: 'require_field', target: 'trauma.time_of_injury' },
      { type: 'require_field', target: 'trauma.tetanus_status' },
    ],
  },

  // ── ACT-0010: Headache → Neurological Assessment ─────────────────────────
  {
    identity: {
      id: 'ACT-0010',
      category: 'ACT',
      name: 'Headache — Neurological Assessment',
      description: 'Headache complaint → activate neurological workup',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['neurology', 'headache'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'headache' },
            { field: 'encounter.complaints', operator: 'contains', value: 'head_injury' },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'neurology' },
      { type: 'activate_symptom_schema', target: 'headache' },
      { type: 'show_section', target: 'neurological_examination' },
      { type: 'require_field', target: 'headache.onset' },
      { type: 'require_field', target: 'headache.severity' },
      { type: 'require_field', target: 'headache.character' },
      { type: 'recommend_question', target: 'headache_red_flags' },
      { type: 'recommend_question', target: 'headache_thunderclap' },
      { type: 'recommend_question', target: 'headache_neck_stiffness' },
    ],
  },

  // ── ACT-0011: Jaundice → Hepatobiliary Workup ───────────────────────────
  {
    identity: {
      id: 'ACT-0011',
      category: 'ACT',
      name: 'Jaundice — Hepatobiliary Assessment',
      description: 'Jaundice presentation → liver and biliary workup',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['hepatobiliary', 'jaundice', 'liver'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.complaints', operator: 'contains', value: 'jaundice' },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'hepatobiliary' },
      { type: 'show_section', target: 'hepatic_examination' },
      { type: 'show_section', target: 'alcohol_history' },
      { type: 'show_section', target: 'hepatitis_risk' },
      { type: 'require_field', target: 'jaundice.duration' },
      { type: 'require_field', target: 'jaundice.pruritus' },
      { type: 'require_field', target: 'jaundice.urine_colour' },
      { type: 'require_field', target: 'jaundice.stool_colour' },
      { type: 'recommend_investigation', target: 'lft' },
      { type: 'recommend_investigation', target: 'bilirubin' },
      { type: 'recommend_investigation', target: 'abdominal_ultrasound' },
    ],
  },

  // ── ACT-0012: Substance Use → Psychiatry / Addiction ────────────────────
  {
    identity: {
      id: 'ACT-0012',
      category: 'ACT',
      name: 'Alcohol / Substance Use — Addiction Assessment',
      description: 'Substance use history → activate addiction and psychiatric modules',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['psychiatry', 'addiction', 'substance_use'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'alcohol' },
            { field: 'encounter.complaints', operator: 'contains', value: 'substance_use' },
            { field: 'encounter.complaints', operator: 'contains', value: 'addiction' },
            { field: 'encounter.complaints', operator: 'contains', value: 'withdrawal' },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'psychiatry' },
      { type: 'show_section', target: 'substance_use_history' },
      { type: 'show_section', target: 'cage_questionnaire' },
      { type: 'show_section', target: 'withdrawal_assessment' },
      { type: 'show_section', target: 'mental_state_examination' },
      { type: 'show_section', target: 'suicide_risk' },
      { type: 'require_field', target: 'substance_use.type' },
      { type: 'require_field', target: 'substance_use.frequency' },
      { type: 'require_field', target: 'substance_use.last_use' },
      { type: 'recommend_question', target: 'cage_cut_down' },
      { type: 'recommend_question', target: 'cage_annoyed' },
      { type: 'recommend_question', target: 'cage_guilty' },
      { type: 'recommend_question', target: 'cage_eye_opener' },
    ],
  },

  // ── ACT-0013: Neonatal Jaundice ─────────────────────────────────────────
  {
    identity: {
      id: 'ACT-0013',
      category: 'ACT',
      name: 'Neonatal Jaundice — Combined Neonatal + Hepatobiliary',
      description: 'Jaundice in a neonate → combined neonatal and jaundice pathway',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['neonatal', 'jaundice', 'pediatrics'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.ageCategory', operator: 'eq', value: 'neonate' },
        { field: 'encounter.complaints', operator: 'contains', value: 'jaundice' },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'neonatal_jaundice' },
      { type: 'activate_symptom_schema', target: 'neonatal_jaundice' },
      { type: 'require_field', target: 'neonatal_jaundice.day_of_life' },
      { type: 'require_field', target: 'neonatal_jaundice.bilirubin_level' },
      { type: 'require_field', target: 'neonatal_jaundice.gestational_age' },
      { type: 'require_field', target: 'neonatal_jaundice.risk_factors' },
      { type: 'recommend_investigation', target: 'serum_bilirubin' },
      { type: 'recommend_investigation', target: 'transcutaneous_bilirubin' },
      { type: 'recommend_investigation', target: 'blood_group_mother_baby' },
      { type: 'recommend_investigation', target: 'direct_coombs' },
      { type: 'raise_warning', target: 'neonatal_jaundice_requires_urgent_assessment' },
    ],
  },

  // ── ACT-0014: Vaginal Bleeding in Pregnancy ──────────────────────────────
  {
    identity: {
      id: 'ACT-0014',
      category: 'ACT',
      name: 'Vaginal Bleeding in Pregnancy — Obstetric Emergency',
      description: 'Pregnant patient with vaginal bleeding → obstetric emergency pathway',
      version: '1.0',
      enabled: true,
      priority: 15,
      tags: ['obstetrics', 'emergency', 'bleeding'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.pregnant', operator: 'eq', value: true },
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'vaginal_bleeding' },
            { field: 'encounter.complaints', operator: 'contains', value: 'antepartum_haemorrhage' },
            { field: 'encounter.complaints', operator: 'contains', value: 'spotting' },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'obstetric_emergency' },
      { type: 'insert_step', target: 'obstetric_emergency_assessment' },
      { type: 'require_field', target: 'obstetric_bleeding.gestation' },
      { type: 'require_field', target: 'obstetric_bleeding.volume' },
      { type: 'require_field', target: 'obstetric_bleeding.pain' },
      { type: 'require_field', target: 'obstetric_bleeding.clots' },
      { type: 'recommend_investigation', target: 'fetal_ultrasound' },
      { type: 'recommend_investigation', target: 'fetal_heart_monitoring' },
      { type: 'recommend_investigation', target: 'blood_crossmatch' },
      { type: 'recommend_exam', target: 'speculum_examination' },
      { type: 'raise_warning', target: 'vaginal_bleeding_in_pregnancy_is_obstetric_emergency' },
    ],
  },

  // ── ACT-0015: Intestinal Obstruction ────────────────────────────────────
  // Cross-domain rule: abdominal distension + constipation/obstipation + vomiting
  // → activate surgical/obstruction pathway with focused assessment
  {
    identity: {
      id: 'ACT-0015',
      category: 'ACT',
      name: 'Intestinal Obstruction — Surgical Assessment',
      description: 'Abdominal distension with obstipation/constipation and vomiting → intestinal obstruction pathway',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['surgical', 'obstruction', 'gi', 'emergency'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'abdominal_distension' },
            { field: 'encounter.complaints', operator: 'contains', value: 'abdominal_distention' },
            { field: 'encounter.hasDistension', operator: 'eq', value: true },
          ],
        },
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'constipation' },
            { field: 'encounter.complaints', operator: 'contains', value: 'obstipation' },
            { field: 'encounter.complaints', operator: 'contains', value: 'no_bowel_movement' },
            { field: 'encounter.complaints', operator: 'contains', value: 'inability_to_pass_gas' },
          ],
        },
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'vomiting' },
            { field: 'encounter.complaints', operator: 'contains', value: 'nausea_vomiting' },
            { field: 'encounter.hasVomiting', operator: 'eq', value: true },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'intestinal_obstruction' },
      { type: 'show_section', target: 'obstruction_history' },
      { type: 'show_section', target: 'surgical_history' },
      { type: 'show_section', target: 'hernia_assessment' },
      { type: 'show_section', target: 'obstruction_examination' },
      { type: 'show_section', target: 'ng_tube_assessment' },
      { type: 'require_field', target: 'obstruction.prior_abdominal_surgery' },
      { type: 'require_field', target: 'obstruction.known_hernia' },
      { type: 'require_field', target: 'obstruction.last_bowel_movement' },
      { type: 'require_field', target: 'obstruction.last_gas_passage' },
      { type: 'require_field', target: 'obstruction.vomiting_description' },
      { type: 'recommend_investigation', target: 'abdominal_xray_erect' },
      { type: 'recommend_investigation', target: 'abdominal_xray_supine' },
      { type: 'recommend_investigation', target: 'ct_abdomen_pelvis' },
      { type: 'recommend_investigation', target: 'serum_electrolytes' },
      { type: 'recommend_investigation', target: 'lactate' },
      { type: 'recommend_exam', target: 'hernia_orifices' },
      { type: 'recommend_exam', target: 'scar_examination' },
      { type: 'raise_warning', target: 'suspected_intestinal_obstruction_requires_surgical_review' },
    ],
  },

  // ── ACT-0016: GI Bleeding ───────────────────────────────────────────────
  {
    identity: {
      id: 'ACT-0016',
      category: 'ACT',
      name: 'GI Bleeding — Upper or Lower GI Workup',
      description: 'Hematemesis, melena, or hematochezia → activate GI bleeding pathway',
      version: '1.0',
      enabled: true,
      priority: 25,
      tags: ['gi', 'bleeding', 'emergency'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        {
          logic: 'OR',
          conditions: [
            { field: 'encounter.complaints', operator: 'contains', value: 'hematemesis' },
            { field: 'encounter.complaints', operator: 'contains', value: 'melena' },
            { field: 'encounter.complaints', operator: 'contains', value: 'hematochezia' },
            { field: 'encounter.complaints', operator: 'contains', value: 'gi_bleeding' },
            { field: 'encounter.complaints', operator: 'contains', value: 'upper_gi_bleed' },
            { field: 'encounter.complaints', operator: 'contains', value: 'lower_gi_bleed' },
            { field: 'encounter.hasGiBleeding', operator: 'eq', value: true },
          ],
        },
      ],
    },
    actions: [
      { type: 'activate_pathway', target: 'gi_bleeding' },
      { type: 'show_section', target: 'gi_bleeding_history' },
      { type: 'show_section', target: 'gi_bleeding_examination' },
      { type: 'show_section', target: 'gi_bleeding_management' },
      { type: 'require_field', target: 'gi_bleeding.onset' },
      { type: 'require_field', target: 'gi_bleeding.volume_estimate' },
      { type: 'require_field', target: 'gi_bleeding.colour' },
      { type: 'require_field', target: 'gi_bleeding.associated_symptoms' },
      { type: 'recommend_investigation', target: 'cbc' },
      { type: 'recommend_investigation', target: 'coagulation_profile' },
      { type: 'recommend_investigation', target: 'blood_crossmatch' },
      { type: 'recommend_investigation', target: 'upper_gi_endoscopy' },
      { type: 'recommend_investigation', target: 'colonoscopy' },
      { type: 'raise_warning', target: 'gi_bleeding_requires_urgent_assessment' },
    ],
  },
];
