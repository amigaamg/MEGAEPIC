// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CRL — Patient Classification Rules (PAT-0000 series)
// ═══════════════════════════════════════════════════════════════════════════════
// These determine the patient's clinical context before anything else.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ClinicalRule } from '../types';

export const PATIENT_CLASSIFICATION_RULES: ClinicalRule[] = [

  // ── PAT-0001: Age Classification ─────────────────────────────────────────
  {
    identity: {
      id: 'PAT-0001',
      category: 'PAT',
      name: 'Age Classification',
      description: 'Automatically classify patient into age category based on age',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['classification', 'mandatory'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.age', operator: 'exists', value: true },
      ],
    },
    actions: [
      {
        type: 'derive_field',
        target: 'patient.ageCategory',
        value: null, // Will be computed dynamically
        params: {
          formula: `age < 1 ? 'neonate' : age < 13 ? 'infant' : age < 10 ? 'child' : age < 20 ? 'adolescent' : age < 65 ? 'adult' : 'older_adult'`,
        },
      },
    ],
  },

  // ── PAT-0002: Neonate Detection ──────────────────────────────────────────
  {
    identity: {
      id: 'PAT-0002',
      category: 'PAT',
      name: 'Neonate Detection',
      description: 'If age < 28 days, classify as neonate and activate neonatal pathways',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['neonate', 'classification'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.age', operator: 'lt', value: 28 },
        { field: 'patient.ageUnit', operator: 'eq', value: 'days' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'birth_history' },
      { type: 'show_section', target: 'maternal_history' },
      { type: 'show_section', target: 'feeding_history' },
      { type: 'show_section', target: 'immunization_history' },
      { type: 'show_section', target: 'neonatal_examination' },
      { type: 'hide_section', target: 'adult_history' },
      { type: 'hide_section', target: 'geriatric_history' },
      { type: 'hide_section', target: 'menstrual_history' },
      { type: 'hide_section', target: 'obstetric_history' },
      { type: 'derive_field', target: 'patient.ageCategory', value: 'neonate' },
      { type: 'activate_pathway', target: 'neonatology' },
    ],
  },

  // ── PAT-0003: Infant Detection ───────────────────────────────────────────
  {
    identity: {
      id: 'PAT-0003',
      category: 'PAT',
      name: 'Infant Detection',
      description: 'If age 28 days to 12 months, activate infant pathways',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['infant', 'classification'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.age', operator: 'gte', value: 28 },
        { field: 'patient.age', operator: 'lt', value: 365 },
        { field: 'patient.ageUnit', operator: 'eq', value: 'days' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'feeding_history' },
      { type: 'show_section', target: 'developmental_history' },
      { type: 'show_section', target: 'immunization_history' },
      { type: 'hide_section', target: 'menstrual_history' },
      { type: 'hide_section', target: 'obstetric_history' },
      { type: 'activate_pathway', target: 'pediatrics' },
    ],
  },

  // ── PAT-0004: Child Detection ────────────────────────────────────────────
  {
    identity: {
      id: 'PAT-0004',
      category: 'PAT',
      name: 'Child Detection (1-9 years)',
      description: 'If age 1-9 years, activate pediatric pathways',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['child', 'pediatric'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.age', operator: 'gte', value: 1 },
        { field: 'patient.age', operator: 'lte', value: 9 },
        { field: 'patient.ageUnit', operator: 'eq', value: 'years' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'developmental_history' },
      { type: 'show_section', target: 'immunization_history' },
      { type: 'show_section', target: 'school_history' },
      { type: 'hide_section', target: 'menstrual_history' },
      { type: 'hide_section', target: 'obstetric_history' },
      { type: 'hide_section', target: 'occupational_history' },
      { type: 'activate_pathway', target: 'pediatrics' },
    ],
  },

  // ── PAT-0005: Adolescent Detection ───────────────────────────────────────
  {
    identity: {
      id: 'PAT-0005',
      category: 'PAT',
      name: 'Adolescent Detection (10-19 years)',
      description: 'If age 10-19, show menstrual history for females',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['adolescent'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.age', operator: 'between', value: [10, 19] },
        { field: 'patient.ageUnit', operator: 'eq', value: 'years' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'school_history' },
      { type: 'activate_pathway', target: 'adolescent_health' },
    ],
  },

  // ── PAT-0006: Female Reproductive Age ───────────────────────────────────
  {
    identity: {
      id: 'PAT-0006',
      category: 'PAT',
      name: 'Female Reproductive Age Screening',
      description: 'If female aged 12-55, show menstrual, obstetric, and pregnancy screening',
      version: '1.0',
      enabled: true,
      priority: 30,
      tags: ['female', 'reproductive', 'obstetrics'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.sex', operator: 'eq', value: 'female' },
        { field: 'patient.age', operator: 'gte', value: 12 },
        { field: 'patient.age', operator: 'lte', value: 55 },
        { field: 'patient.ageUnit', operator: 'eq', value: 'years' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'menstrual_history' },
      { type: 'show_section', target: 'obstetric_history' },
      { type: 'show_section', target: 'contraception_history' },
      { type: 'require_field', target: 'pregnancy_status.current' },
      { type: 'activate_pathway', target: 'women_health' },
    ],
  },

  // ── PAT-0007: Male Urology ──────────────────────────────────────────────
  {
    identity: {
      id: 'PAT-0007',
      category: 'PAT',
      name: 'Male Urological History',
      description: 'If male, hide female-specific sections, show urology',
      version: '1.0',
      enabled: true,
      priority: 30,
      tags: ['male', 'urology'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.sex', operator: 'eq', value: 'male' },
      ],
    },
    actions: [
      { type: 'hide_section', target: 'menstrual_history' },
      { type: 'hide_section', target: 'obstetric_history' },
      { type: 'hide_section', target: 'contraception_history' },
      { type: 'hide_section', target: 'pregnancy_status' },
      { type: 'show_section', target: 'urological_history' },
    ],
  },

  // ── PAT-0008: Pregnancy Screening ────────────────────────────────────────
  {
    identity: {
      id: 'PAT-0008',
      category: 'PAT',
      name: 'Pregnancy Status Required',
      description: 'If female reproductive age, pregnancy status must be asked early',
      version: '1.0',
      enabled: true,
      priority: 35,
      tags: ['pregnancy', 'safety'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.sex', operator: 'eq', value: 'female' },
        { field: 'patient.age', operator: 'gte', value: 12 },
        { field: 'patient.age', operator: 'lte', value: 55 },
        { field: 'patient.ageUnit', operator: 'eq', value: 'years' },
        { field: 'encounter.complaints', operator: 'exists', value: true },
      ],
    },
    actions: [
      { type: 'recommend_question', target: 'pregnancy_status' },
      { type: 'activate_symptom_schema', target: 'pregnancy_screening' },
    ],
  },

  // ── PAT-0009: Older Adult Detection ──────────────────────────────────────
  {
    identity: {
      id: 'PAT-0009',
      category: 'PAT',
      name: 'Older Adult Assessment',
      description: 'If age 65+, activate geriatric assessment modules',
      version: '1.0',
      enabled: true,
      priority: 20,
      tags: ['geriatric', 'older_adult'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.age', operator: 'gte', value: 65 },
        { field: 'patient.ageUnit', operator: 'eq', value: 'years' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'functional_status' },
      { type: 'show_section', target: 'falls_history' },
      { type: 'show_section', target: 'cognition_screening' },
      { type: 'show_section', target: 'continence_history' },
      { type: 'show_section', target: 'caregiver_info' },
      { type: 'show_section', target: 'advanced_directives' },
      { type: 'activate_pathway', target: 'geriatrics' },
    ],
  },

  // ── PAT-0010: Postpartum Detection ───────────────────────────────────────
  {
    identity: {
      id: 'PAT-0010',
      category: 'PAT',
      name: 'Postpartum Status',
      description: 'If postpartum, show postpartum-specific modules',
      version: '1.0',
      enabled: true,
      priority: 30,
      tags: ['postpartum', 'obstetrics'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.postpartum', operator: 'eq', value: true },
      ],
    },
    actions: [
      { type: 'show_section', target: 'postpartum_history' },
      { type: 'show_section', target: 'lactation_history' },
      { type: 'show_section', target: 'baby_feeding_status' },
      { type: 'show_section', target: 'perineal_wound' },
      { type: 'show_section', target: 'cs_wound' },
      { type: 'show_section', target: 'lochia_status' },
      { type: 'activate_pathway', target: 'postnatal' },
    ],
  },

  // ── PAT-0011: Occupation-Based Risk ──────────────────────────────────────
  {
    identity: {
      id: 'PAT-0011',
      category: 'PAT',
      name: 'Occupation-Based Risk Screening',
      description: 'Based on occupation, activate relevant risk modules',
      version: '1.0',
      enabled: true,
      priority: 40,
      tags: ['occupation', 'risk'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'patient.occupation', operator: 'exists', value: true },
      ],
    },
    actions: [
      { type: 'show_section', target: 'occupational_history' },
      { type: 'recommend_question', target: 'work_exposures' },
    ],
  },
];
