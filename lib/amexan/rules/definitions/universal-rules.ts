import type { RuleDefinition } from '../types';

export const UNIVERSAL_DATA_RULES: RuleDefinition[] = [
  // ── Vital Sign Ranges ─────────────────────────────────────────
  {
    id: 'dr_pulse_range', type: 'data', priority: 100,
    name: 'Pulse Rate Range',
    description: 'Pulse must be between 30-250 bpm',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.pulse', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.pulse', message: 'Pulse must be between 30-250 bpm', severity: 'error', params: { min: 30, max: 250 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },

  {
    id: 'dr_temperature_range', type: 'data', priority: 100,
    name: 'Temperature Range',
    description: 'Temperature must be between 32-43°C',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.temperature', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.temperature', message: 'Temperature must be between 32-43°C', severity: 'error', params: { min: 32, max: 43 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },
  {
    id: 'dr_sbp_range', type: 'data', priority: 100,
    name: 'Systolic BP Range',
    description: 'Systolic BP must be between 50-300 mmHg',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.systolicBP', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.systolicBP', message: 'Systolic BP must be between 50-300 mmHg', severity: 'error', params: { min: 50, max: 300 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },
  {
    id: 'dr_dbp_range', type: 'data', priority: 100,
    name: 'Diastolic BP Range',
    description: 'Diastolic BP must be between 20-200 mmHg',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.diastolicBP', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.diastolicBP', message: 'Diastolic BP must be between 20-200 mmHg', severity: 'error', params: { min: 20, max: 200 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },
  {
    id: 'dr_rr_range', type: 'data', priority: 100,
    name: 'Respiratory Rate Range',
    description: 'Respiratory rate must be between 4-80 breaths/min',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.respiratoryRate', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.respiratoryRate', message: 'RR must be between 4-80 breaths/min', severity: 'error', params: { min: 4, max: 80 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },
  {
    id: 'dr_o2sat_range', type: 'data', priority: 100,
    name: 'Oxygen Saturation Range',
    description: 'SpO2 must be between 50-100%',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.oxygenSaturation', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.oxygenSaturation', message: 'SpO2 must be between 50-100%', severity: 'error', params: { min: 50, max: 100 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },
  {
    id: 'dr_weight_range', type: 'data', priority: 90,
    name: 'Weight Range',
    description: 'Weight must be reasonable for context',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.weight', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.weight', message: 'Weight must be between 0.5-350 kg', severity: 'error', params: { min: 0.5, max: 350 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },
  {
    id: 'dr_height_range', type: 'data', priority: 90,
    name: 'Height Range',
    description: 'Height must be between 20-280 cm',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.height', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.height', message: 'Height must be between 20-280 cm', severity: 'error', params: { min: 20, max: 280 } },
    ],
    active: true, tags: ['validation', 'vitals'],
  },

  // ── Contextual Validation ─────────────────────────────────────
  {
    id: 'dr_pregnancy_weeks', type: 'data', priority: 95,
    name: 'Pregnancy Weeks Range',
    description: 'Gestational weeks must be 0-45',
    contexts: [{ fact: 'patient.gender', operator: 'eq', value: 'female' }],
    domain: 'universal',
    conditions: [{ fact: 'facts.gestationalWeeks', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'facts.gestationalWeeks', message: 'Gestational weeks must be 0-45', severity: 'error', params: { min: 0, max: 45 } },
    ],
    active: true, tags: ['validation', 'obstetric'],
  },
  {
    id: 'dr_neonatal_weight', type: 'data', priority: 95,
    name: 'Neonatal Weight Range',
    description: 'Neonatal weight must be 0.5-10 kg',
    contexts: [{ fact: 'patient.ageGroup', operator: 'eq', value: 'neonatal' }],
    domain: 'universal',
    conditions: [{ fact: 'vitals.weight', operator: 'exists' }],
    actions: [
      { type: 'validate_range', target: 'vitals.weight', message: 'Neonatal weight must be between 0.5-10 kg', severity: 'error', params: { min: 0.5, max: 10 } },
    ],
    active: true, tags: ['validation', 'neonatal'],
  },

  // ── Required Field Rules ──────────────────────────────────────
  {
    id: 'dr_required_chief_complaint', type: 'data', priority: 80,
    name: 'Chief Complaint Required',
    description: 'Encounter must have a chief complaint',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'encounter.phase', operator: 'eq', value: 'triage' }],
    actions: [
      { type: 'require', target: 'chiefComplaint', message: 'Chief complaint is required to proceed', severity: 'error' },
    ],
    active: true, tags: ['validation', 'required'],
  },
  {
    id: 'dr_required_biodata', type: 'data', priority: 80,
    name: 'Biodata Required',
    description: 'Patient biodata is required before clinical entry',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'encounter.phase', operator: 'in', value: ['history', 'examination', 'assessment'] }],
    actions: [
      { type: 'require', target: 'patient.age', message: 'Patient age is required', severity: 'error' },
      { type: 'require', target: 'patient.gender', message: 'Patient gender is required', severity: 'error' },
    ],
    active: true, tags: ['validation', 'required'],
  },

  // ── Format Rules ──────────────────────────────────────────────
  {
    id: 'dr_date_format', type: 'data', priority: 70,
    name: 'Date Format Validation',
    description: 'Dates must be in ISO 8601 format',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'true', operator: 'eq', value: true }],
    actions: [
      { type: 'validate_format', target: '*.date', message: 'Dates should be in ISO 8601 format (YYYY-MM-DD)', severity: 'warning', params: { format: 'iso8601' } },
    ],
    active: true, tags: ['validation', 'format'],
  },

  // ── Clinical Safety Rules ─────────────────────────────────────
  {
    id: 'cl_male_pregnancy', type: 'data', priority: 99,
    name: 'Male Pregnancy Check',
    description: 'Male patients cannot be pregnant',
    contexts: [{ fact: 'patient.gender', operator: 'eq', value: 'male' }],
    domain: 'universal',
    conditions: [{ fact: 'patient.pregnant', operator: 'eq', value: true }],
    actions: [
      { type: 'block', target: 'patient.pregnant', message: 'Male patients cannot be marked as pregnant', severity: 'error' },
    ],
    active: true, tags: ['safety', 'contradiction'],
  },
  {
    id: 'cl_hypotension_alert', type: 'clinical', priority: 90,
    name: 'Hypotension Alert',
    description: 'SBP <90 mmHg is a critical alert',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.systolicBP', operator: 'lt', value: 90 }],
    actions: [
      { type: 'flag_red_flag', target: 'hypotension', message: 'Systolic BP <90 mmHg: patient is hypotensive. Immediate assessment required.', severity: 'critical' },
      { type: 'suggest_investigation', target: 'ECG', message: 'Obtain ECG to assess for arrhythmia/ischemia' },
    ],
    active: true, tags: ['alert', 'red_flag'],
  },
  {
    id: 'cl_hypoxia_alert', type: 'clinical', priority: 90,
    name: 'Hypoxia Alert',
    description: 'SpO2 <90% is a critical alert',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.oxygenSaturation', operator: 'lt', value: 90 }],
    actions: [
      { type: 'flag_red_flag', target: 'hypoxia', message: 'SpO2 <90%: patient is hypoxic. Administer oxygen immediately.', severity: 'critical' },
      { type: 'suggest_investigation', target: 'ABG', message: 'Obtain arterial blood gas' },
    ],
    active: true, tags: ['alert', 'red_flag'],
  },
  {
    id: 'cl_fever_high', type: 'clinical', priority: 85,
    name: 'High Fever Alert',
    description: 'Temperature >39.5°C is high fever',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.temperature', operator: 'gt', value: 39.5 }],
    actions: [
      { type: 'flag_red_flag', target: 'high_fever', message: 'Temperature >39.5°C: High fever. Initiate antipyretics and investigate source.', severity: 'warning' },
    ],
    active: true, tags: ['alert', 'vitals'],
  },
  {
    id: 'cl_tachycardia_alert', type: 'clinical', priority: 85,
    name: 'Tachycardia Alert',
    description: 'Pulse >120 bpm is concerning',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.pulse', operator: 'gt', value: 120 }],
    actions: [
      { type: 'flag_red_flag', target: 'tachycardia', message: 'Pulse >120 bpm: Tachycardia. Assess for shock, fever, pain, or arrhythmia.', severity: 'warning' },
    ],
    active: true, tags: ['alert', 'vitals'],
  },
  {
    id: 'cl_bradycardia_alert', type: 'clinical', priority: 85,
    name: 'Bradycardia Alert',
    description: 'Pulse <50 bpm is concerning',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'vitals.pulse', operator: 'lt', value: 50 }],
    actions: [
      { type: 'flag_red_flag', target: 'bradycardia', message: 'Pulse <50 bpm: Bradycardia. Assess for heart block, medication effect, or increased ICP.', severity: 'warning' },
    ],
    active: true, tags: ['alert', 'vitals'],
  },
];

export const UNIVERSAL_UI_RULES: RuleDefinition[] = [
  {
    id: 'ui_pediatric_module', type: 'ui', priority: 80,
    name: 'Pediatric Module Activation',
    description: 'Activate pediatric module and deactivate adult for patients <18 years',
    contexts: [], domain: 'universal',
    conditions: [
      { fact: 'patient.age', operator: 'exists' },
      { fact: 'patient.age', operator: 'lt', value: 18 },
    ],
    actions: [
      { type: 'activate_module', target: 'pediatric' },
      { type: 'hide', target: 'module.adult' },
    ],
    active: true, tags: ['context', 'age'],
  },
  {
    id: 'ui_neonatal_module', type: 'ui', priority: 85,
    name: 'Neonatal Module Activation',
    description: 'Activate neonatal module for age <28 days',
    contexts: [], domain: 'universal',
    conditions: [
      { fact: 'patient.age', operator: 'lt', value: 0.077 }, // ~28 days in years
    ],
    actions: [
      { type: 'activate_module', target: 'neonatal' },
      { type: 'hide', target: 'module.pediatric' },
    ],
    active: true, tags: ['context', 'neonatal'],
  },
  {
    id: 'ui_elderly_module', type: 'ui', priority: 80,
    name: 'Elderly Module Activation',
    description: 'Activate geriatric considerations for age >65',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'patient.age', operator: 'gt', value: 65 }],
    actions: [
      { type: 'activate_module', target: 'elderly' },
    ],
    active: true, tags: ['context', 'geriatric'],
  },
  {
    id: 'ui_obstetric_module', type: 'ui', priority: 80,
    name: 'Obstetric Module',
    description: 'Show obstetric section for pregnant women',
    contexts: [{ fact: 'patient.gender', operator: 'eq', value: 'female' }],
    domain: 'universal',
    conditions: [{ fact: 'patient.pregnant', operator: 'eq', value: true }],
    actions: [
      { type: 'show', target: 'section.obstetric' },
      { type: 'activate_module', target: 'obstetric' },
    ],
    active: true, tags: ['context', 'pregnancy'],
  },
  {
    id: 'ui_icu_module', type: 'ui', priority: 80,
    name: 'ICU Module',
    description: 'Activate ICU module for critical care context',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'environment.icu', operator: 'eq', value: true }],
    actions: [
      { type: 'activate_module', target: 'icu' },
      { type: 'show', target: 'section.icu_monitoring' },
    ],
    active: true, tags: ['context', 'icu'],
  },
  {
    id: 'ui_resource_limited', type: 'ui', priority: 75,
    name: 'Resource-Limited Mode',
    description: 'Simplify investigation/treatment options in resource-limited settings',
    contexts: [], domain: 'universal',
    conditions: [{ fact: 'environment.resourceLimited', operator: 'eq', value: true }],
    actions: [
      { type: 'hide', target: 'section.advanced_imaging' },
      { type: 'hide', target: 'section.specialist_referral' },
    ],
    active: true, tags: ['context', 'resource_limited'],
  },
];
