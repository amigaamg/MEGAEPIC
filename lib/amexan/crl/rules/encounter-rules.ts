// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CRL — Encounter Rules (ENC-0000 series)
// ═══════════════════════════════════════════════════════════════════════════════
// These define what happens based on encounter type and context.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ClinicalRule } from '../types';

export const ENCOUNTER_RULES: ClinicalRule[] = [

  // ── ENC-0001: Emergency Pathway ──────────────────────────────────────────
  {
    identity: {
      id: 'ENC-0001',
      category: 'ENC',
      name: 'Emergency Pathway',
      description: 'If emergency encounter, start with ABCDE assessment, history after stabilization',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['emergency', 'pathway'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'emergency' },
      ],
    },
    actions: [
      { type: 'insert_step', target: 'abcd_assessment' },
      { type: 'show_section', target: 'airway' },
      { type: 'show_section', target: 'breathing' },
      { type: 'show_section', target: 'circulation' },
      { type: 'show_section', target: 'disability' },
      { type: 'show_section', target: 'exposure' },
      { type: 'show_section', target: 'vitals' },
      { type: 'require_field', target: 'vitals.news_score' },
      { type: 'activate_pathway', target: 'emergency_medicine' },
      { type: 'raise_warning', target: 'emergency_protocol_activated' },
    ],
  },

  // ── ENC-0002: Outpatient Standard ────────────────────────────────────────
  {
    identity: {
      id: 'ENC-0002',
      category: 'ENC',
      name: 'Outpatient Standard Pathway',
      description: 'Standard outpatient: history → examination → plan',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['outpatient', 'standard'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'outpatient' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'full_history' },
      { type: 'show_section', target: 'examination' },
      { type: 'show_section', target: 'assessment' },
      { type: 'show_section', target: 'plan' },
      { type: 'require_step', target: 'history' },
      { type: 'require_step', target: 'examination' },
    ],
  },

  // ── ENC-0003: ICU Pathway ───────────────────────────────────────────────
  {
    identity: {
      id: 'ENC-0003',
      category: 'ENC',
      name: 'ICU / Critical Care Pathway',
      description: 'ICU encounter: system-based assessment with monitoring focus',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['icu', 'critical_care'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'icu' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'systems_assessment' },
      { type: 'show_section', target: 'ventilator_settings' },
      { type: 'show_section', target: 'vasopressor_requirements' },
      { type: 'show_section', target: 'fluid_balance' },
      { type: 'show_section', target: 'sedation_assessment' },
      { type: 'show_section', target: 'organ_support' },
      { type: 'require_field', target: 'vitals.gcs' },
      { type: 'require_field', target: 'vitals.sofa_score' },
      { type: 'activate_pathway', target: 'critical_care' },
    ],
  },

  // ── ENC-0004: Antenatal Pathway ──────────────────────────────────────────
  {
    identity: {
      id: 'ENC-0004',
      category: 'ENC',
      name: 'Antenatal Care Pathway',
      description: 'Antenatal visit: obstetric-focused history and examination',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['antenatal', 'obstetrics'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'antenatal' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'antenatal_history' },
      { type: 'show_section', target: 'fundal_height' },
      { type: 'show_section', target: 'fetal_heart_rate' },
      { type: 'show_section', target: 'fetal_movements' },
      { type: 'show_section', target: 'leopold_maneuvers' },
      { type: 'show_section', target: 'risk_factors_pregnancy' },
      { type: 'show_section', target: 'pregnancy_plan' },
      { type: 'activate_pathway', target: 'obstetrics' },
    ],
  },

  // ── ENC-0005: Surgical / Theatre Pathway ─────────────────────────────────
  {
    identity: {
      id: 'ENC-0005',
      category: 'ENC',
      name: 'Surgical / Theatre Pathway',
      description: 'Surgical encounter: pre-operative assessment and surgical history',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['surgery', 'theatre'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'theatre' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'surgical_history' },
      { type: 'show_section', target: 'anaesthetic_history' },
      { type: 'show_section', target: 'pre_op_assessment' },
      { type: 'show_section', target: 'asa_grade' },
      { type: 'show_section', target: 'informed_consent' },
      { type: 'show_section', target: 'nil_by_mouth' },
      { type: 'require_field', target: 'pre_op.asa' },
      { type: 'activate_pathway', target: 'surgery' },
    ],
  },

  // ── ENC-0006: Telemedicine Pathway ───────────────────────────────────────
  {
    identity: {
      id: 'ENC-0006',
      category: 'ENC',
      name: 'Telemedicine Pathway',
      description: 'Telemedicine visit: modified history, no physical exam',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['telemedicine', 'virtual'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'telemedicine' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'telemedicine_consent' },
      { type: 'show_section', target: 'virtual_history' },
      { type: 'hide_section', target: 'physical_examination' },
      { type: 'hide_section', target: 'auscultation' },
      { type: 'hide_section', target: 'palpation' },
      { type: 'show_section', target: 'video_observations' },
      { type: 'require_step', target: 'telemedicine_consult' },
    ],
  },

  // ── ENC-0007: Follow-up Pathway ──────────────────────────────────────────
  {
    identity: {
      id: 'ENC-0007',
      category: 'ENC',
      name: 'Follow-up Visit Pathway',
      description: 'Follow-up: focus on interval history, response to treatment',
      version: '1.0',
      enabled: true,
      priority: 10,
      tags: ['follow_up', 'review'],
      created: Date.now(),
      updated: Date.now(),
    },
    conditions: {
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'follow_up' },
      ],
    },
    actions: [
      { type: 'show_section', target: 'interval_history' },
      { type: 'show_section', target: 'treatment_response' },
      { type: 'show_section', target: 'medication_adherence' },
      { type: 'show_section', target: 'side_effects' },
      { type: 'show_section', target: 'new_symptoms' },
      { type: 'hide_section', target: 'full_history' },
      { type: 'skip_step', target: 'chief_complaint' },
    ],
  },
];
