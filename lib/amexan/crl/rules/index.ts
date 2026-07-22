// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CRL — Rules Registry (all rules aggregated)
// ═══════════════════════════════════════════════════════════════════════════════

import type { ClinicalRule, SpecialtyPlugin } from '../types';
import { PATIENT_CLASSIFICATION_RULES } from './patient-rules';
import { ENCOUNTER_RULES } from './encounter-rules';
import { CONTEXT_ACTIVATION_RULES } from './context-activation-rules';
import { createRuleRegistry } from '../engine';

// ── All rules in priority order ───────────────────────────────────────────
// Sorted by priority (lower = higher priority)
const ALL_RULES: ClinicalRule[] = [
  ...PATIENT_CLASSIFICATION_RULES,
  ...ENCOUNTER_RULES,
  ...CONTEXT_ACTIVATION_RULES,
].sort((a, b) => a.identity.priority - b.identity.priority);

// ── Export the full rule set ──────────────────────────────────────────────
export function getAllRules(): ClinicalRule[] {
  return ALL_RULES;
}

export function getRulesByCategory(category: string): ClinicalRule[] {
  return ALL_RULES.filter(r => r.identity.category === category);
}

// ── Create and populate a registry ────────────────────────────────────────
export function createDefaultRuleRegistry() {
  const registry = createRuleRegistry();
  for (const rule of ALL_RULES) {
    registry.addRule(rule);
  }
  return registry;
}

// ── Specialty Plugins ─────────────────────────────────────────────────────

export const SPECIALTY_PLUGINS: SpecialtyPlugin[] = [
  {
    id: 'internal_medicine',
    name: 'Internal Medicine',
    description: 'Adult internal medicine rules and pathways',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'patient.ageCategory', operator: 'in', value: ['adult', 'older_adult'] },
      ],
    }],
    rules: [],
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Pediatric rules for children aged 0-18',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'patient.ageCategory', operator: 'in', value: ['neonate', 'infant', 'child', 'adolescent'] },
      ],
    }],
    rules: [],
  },
  {
    id: 'obstetrics_gynaecology',
    name: 'Obstetrics & Gynaecology',
    description: 'Women\'s health, pregnancy, and reproductive health',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'patient.sex', operator: 'eq', value: 'female' },
        { field: 'patient.age', operator: 'gte', value: 12 },
        { field: 'patient.ageUnit', operator: 'eq', value: 'years' },
      ],
    }],
    rules: [],
  },
  {
    id: 'surgery',
    name: 'General Surgery',
    description: 'Surgical assessment, pre-op, and post-op care',
    priority: 50,
    activatesOn: [{
      logic: 'OR',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'theatre' },
        { field: 'encounter.isTrauma', operator: 'eq', value: true },
      ],
    }],
    rules: [],
  },
  {
    id: 'emergency_medicine',
    name: 'Emergency Medicine',
    description: 'Acute care, resuscitation, and emergency protocols',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'emergency' },
      ],
    }],
    rules: [],
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    description: 'Mental health assessment, MSE, and risk assessment',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'encounter.department', operator: 'eq', value: 'psychiatry' },
      ],
    }],
    rules: [],
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Musculoskeletal and orthopedic assessment',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'encounter.department', operator: 'eq', value: 'orthopedics' },
      ],
    }],
    rules: [],
  },
  {
    id: 'icu_critical_care',
    name: 'ICU / Critical Care',
    description: 'Intensive care monitoring and organ support',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'encounter.type', operator: 'eq', value: 'icu' },
      ],
    }],
    rules: [],
  },
  {
    id: 'neonatology',
    name: 'Neonatology',
    description: 'Newborn care, birth history, and neonatal assessment',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'patient.ageCategory', operator: 'eq', value: 'neonate' },
      ],
    }],
    rules: [],
  },
  {
    id: 'geriatrics',
    name: 'Geriatrics',
    description: 'Care for older adults: functional assessment, falls, cognition',
    priority: 50,
    activatesOn: [{
      logic: 'AND',
      conditions: [
        { field: 'patient.ageCategory', operator: 'eq', value: 'older_adult' },
      ],
    }],
    rules: [],
  },
];

// ── Active specialty detection ────────────────────────────────────────────
export function getActiveSpecialties(context: Parameters<typeof import('../engine').evaluateAllRules>[1]) {
  return SPECIALTY_PLUGINS.filter(p => {
    // Use the engine to evaluate the specialty activation conditions
    // For now, simple pass-through
    return true;
  }).map(p => p.id);
}
