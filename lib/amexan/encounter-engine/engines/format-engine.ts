// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Assessment Format Generator (UCAEM-FG Rules)
// Builds the correct section sequence based on constitutional context.
// Rule UCAEM-FG-001: Adult Comprehensive Medical/Surgical Format is the base.
// Rule UCAEM-FG-002: Outpatient vs Inpatient vs Emergency encounter variant.
// Rule UCAEM-FG-003: Context evaluation is progressive.
// Rule UCAEM-FG-004: Context changes never destroy data.
// Rule UCAEM-FG-005: Population-specific extensions (geriatric, adolescent, pediatric).
// Rule UCAEM-FG-006: Surgical Assessment variant adds perioperative sections.
// Rule UCAEM-FG-012: Post-Operative Assessment format with recovery/monitoring focus.
// ═══════════════════════════════════════════════════════════════════════════════

import type { SectionDef, AssessmentFormat, ConstitutionalContext } from '../knowledge/symptom-types';

// ─── CONSTITUTIONAL BASE FORMATS ─────────────────────────────────────────────

const adultBaseSections: SectionDef[] = [
  {
    id: 'biodata', label: 'Biodata', description: 'Patient identification and demographics',
    order: 1, required: true, source: 'constitutional',
    population: ['neonate', 'infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'chief_complaints', label: 'Chief Complaints', description: 'Presenting complaints in chronological order',
    order: 2, required: true, source: 'constitutional',
    population: ['neonate', 'infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'hpi', label: 'History of Present Illness', description: 'Systematic exploration of each complaint',
    order: 3, required: true, source: 'constitutional',
    population: ['neonate', 'infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'past_medical_surgical', label: 'Past Medical and Surgical History', description: 'Previous illnesses, operations, admissions',
    order: 4, required: true, source: 'constitutional',
    population: ['infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.age >= 0.08,
  },
  {
    id: 'drug_allergy', label: 'Drug and Allergy History', description: 'Current medications, allergies, adverse reactions',
    order: 5, required: true, source: 'constitutional',
    population: ['neonate', 'infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'family_history', label: 'Family History', description: 'Hereditary, familial, and household health factors',
    order: 6, required: false, source: 'constitutional',
    population: ['infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.age >= 0.08,
  },
  {
    id: 'social_history', label: 'Social and Occupational History', description: 'Lifestyle, environment, occupation, support',
    order: 7, required: false, source: 'constitutional',
    population: ['adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.age >= 13,
  },
  {
    id: 'ros', label: 'Review of Systems', description: 'Systematic symptom screening of unexplored systems',
    order: 8, required: true, source: 'constitutional',
    population: ['neonate', 'infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'summary', label: 'Summary of History', description: 'Clinical synthesis before examination',
    order: 9, required: true, source: 'constitutional',
    population: ['neonate', 'infant', 'child', 'adolescent', 'adult', 'elderly'],
    applicable: () => true,
  },
];

// ─── SPECIALTY EXTENSION SECTIONS ────────────────────────────────────────────

const femaleReproductiveSections: SectionDef[] = [
  {
    id: 'past_obstetric_history', label: 'Past Obstetric History', description: 'Previous pregnancies and outcomes',
    order: 3.5, required: false, source: 'specialty_extension',
    population: ['adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.sex === 'female' && ctx.age >= 13,
  },
  {
    id: 'gynecological_history', label: 'Gynecological History', description: 'Menstrual, contraceptive, gynecological conditions',
    order: 3.6, required: false, source: 'specialty_extension',
    population: ['adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.sex === 'female' && ctx.age >= 13,
  },
];

const obstetricSections: SectionDef[] = [
  {
    id: 'current_pregnancy', label: 'Current Pregnancy / Antenatal Profile', description: 'Current pregnancy details',
    order: 3.1, required: true, source: 'specialty_extension',
    population: ['adolescent', 'adult'],
    applicable: (ctx) => ctx.pregnant,
  },
];

const pediatricSections: SectionDef[] = [
  {
    id: 'birth_history', label: 'Birth History', description: 'Antenatal, natal, and postnatal history',
    order: 4.1, required: true, source: 'specialty_extension',
    population: ['neonate', 'infant', 'child'],
    applicable: (ctx) => ctx.age < 13,
  },
  {
    id: 'growth_development', label: 'Growth and Development History', description: 'Growth parameters and developmental milestones',
    order: 4.2, required: true, source: 'specialty_extension',
    population: ['neonate', 'infant', 'child'],
    applicable: (ctx) => ctx.age < 13,
  },
  {
    id: 'immunization_history', label: 'Immunization History', description: 'Vaccination status against schedule',
    order: 4.3, required: true, source: 'specialty_extension',
    population: ['neonate', 'infant', 'child'],
    applicable: (ctx) => ctx.age < 13,
  },
  {
    id: 'nutrition_history', label: 'Nutrition and Feeding History', description: 'Feeding practices and nutritional status',
    order: 4.4, required: true, source: 'specialty_extension',
    population: ['neonate', 'infant', 'child'],
    applicable: (ctx) => ctx.age < 13,
  },
];

const neonatalSections: SectionDef[] = [
  {
    id: 'antenatal_history', label: 'Antenatal History', description: 'Maternal health and pregnancy course',
    order: 3.1, required: true, source: 'specialty_extension',
    population: ['neonate'],
    applicable: (ctx) => ctx.age < 0.08,
  },
  {
    id: 'natal_history', label: 'Natal History', description: 'Labour, delivery, and condition at birth',
    order: 3.2, required: true, source: 'specialty_extension',
    population: ['neonate'],
    applicable: (ctx) => ctx.age < 0.08,
  },
  {
    id: 'postnatal_history', label: 'Postnatal History', description: 'Early neonatal course and adaptation',
    order: 3.3, required: true, source: 'specialty_extension',
    population: ['neonate'],
    applicable: (ctx) => ctx.age < 0.08,
  },
];

const psychiatricSections: SectionDef[] = [
  {
    id: 'past_psychiatric_history', label: 'Past Psychiatric History', description: 'Previous psychiatric diagnoses and treatments',
    order: 3.5, required: true, source: 'specialty_extension',
    population: ['adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.module === 'psychiatric',
  },
  {
    id: 'substance_use', label: 'Substance Use History', description: 'Alcohol, tobacco, and recreational drug use',
    order: 5.5, required: true, source: 'specialty_extension',
    population: ['adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.module === 'psychiatric' && ctx.age >= 13,
  },
  {
    id: 'forensic_legal', label: 'Forensic and Legal History', description: 'Legal issues, forensic history',
    order: 6.5, required: false, source: 'specialty_extension',
    population: ['adolescent', 'adult', 'elderly'],
    applicable: (ctx) => ctx.module === 'psychiatric' && ctx.age >= 13,
  },
];

// ─── FORMAT GENERATION ───────────────────────────────────────────────────────

export interface FormatGenerationInput {
  context: ConstitutionalContext
  existingSections?: SectionDef[]     // from previous generation (Rule FG-004)
}

export function generateAssessmentFormat(input: FormatGenerationInput): AssessmentFormat {
  const { context, existingSections } = input;
  const sections: SectionDef[] = [];

  // ── Rule UCAEM-FG-001: Start with adult base ──────────────────────────
  const baseSections = [...adultBaseSections];

  // ── Rule UCAEM-FG-009: Obstetric assessment ───────────────────────────
  if (context.pregnant) {
    // Insert obstetric sections after HPI, before PMH
    const hpiIndex = baseSections.findIndex(s => s.id === 'hpi');
    if (hpiIndex >= 0) {
      baseSections.splice(hpiIndex + 1, 0, ...obstetricSections);
    }
    // Insert female reproductive sections
    const pmhIndex = baseSections.findIndex(s => s.id === 'past_medical_surgical');
    if (pmhIndex >= 0) {
      baseSections.splice(pmhIndex, 0, ...femaleReproductiveSections);
    }
  }

  // ── Rule UCAEM-FG-007: Pediatric assessment ───────────────────────────
  if (context.age >= 0.08 && context.age < 13) {
    const pmhIndex = baseSections.findIndex(s => s.id === 'past_medical_surgical');
    if (pmhIndex >= 0) {
      baseSections.splice(pmhIndex + 1, 0, ...pediatricSections);
    }
    // Suppress social history (not applicable for children < 13)
    const socIndex = baseSections.findIndex(s => s.id === 'social_history');
    if (socIndex >= 0) {
      baseSections.splice(socIndex, 1);
    }
  }

  // ── Rule UCAEM-FG-008: Neonatal assessment ────────────────────────────
  if (context.age < 0.08) {
    // Replace PMH with perinatal sections
    const pmhIndex = baseSections.findIndex(s => s.id === 'past_medical_surgical');
    if (pmhIndex >= 0) {
      baseSections.splice(pmhIndex, 1, ...neonatalSections);
    }
    // Suppress non-applicable adult sections
    const suppressIds = ['family_history', 'social_history'];
    for (const id of suppressIds) {
      const idx = baseSections.findIndex(s => s.id === id);
      if (idx >= 0) baseSections.splice(idx, 1);
    }
  }

  // ── Rule UCAEM-FG-010: Psychiatric assessment ─────────────────────────
  if (context.module === 'psychiatric' && context.age >= 13) {
    const hpiIndex = baseSections.findIndex(s => s.id === 'hpi');
    if (hpiIndex >= 0) {
      baseSections.splice(hpiIndex + 1, 0, ...psychiatricSections);
    }
  }

  // ── Rule UCAEM-FG-011: Only applicable sections rendered ──────────────
  for (const section of baseSections) {
    if (section.applicable(context)) {
      sections.push(section);
    }
  }

  // ── Rule UCAEM-FG-004: Preserve data from existing sections ───────────
  if (existingSections) {
    for (const existing of existingSections) {
      if (!sections.find(s => s.id === existing.id)) {
        // Section was removed due to context change — mark not applicable
        // Data is preserved in the fact store, not here
      }
    }
  }

  // Determine population label
  let population = 'adult';
  if (context.age < 0.08) population = 'neonatal';
  else if (context.age < 13) population = 'pediatric';
  else if (context.pregnant) population = 'obstetric';
  else if (context.module === 'psychiatric') population = 'psychiatric';

  return {
    name: `${population.charAt(0).toUpperCase() + population.slice(1)} Comprehensive Assessment`,
    description: `Constitutional assessment format for ${population} patients`,
    population,
    sections,
    constitutionalBase: population === 'neonatal' ? 'Neonatal' : 'Adult Medical/Surgical',
    activeAdapters: getActiveAdapters(context),
  };
}

function getActiveAdapters(context: ConstitutionalContext): string[] {
  const adapters: string[] = [];
  if (context.age < 0.08) adapters.push('neonatal');
  else if (context.age < 13) adapters.push('pediatric');
  else adapters.push('adult');
  if (context.pregnant) adapters.push('obstetric');
  if (context.module === 'psychiatric') adapters.push('psychiatric');
  return adapters;
}

export function getDefaultSectionOrder(): string[] {
  return adultBaseSections.map(s => s.id);
}

export function shouldInsertSectionBefore(sectionId: string, beforeId: string, format: AssessmentFormat): boolean {
  const section = format.sections.find(s => s.id === sectionId);
  const before = format.sections.find(s => s.id === beforeId);
  if (!section || !before) return false;
  return section.order < before.order;
}

// ── Rule UCAEM-FG-002: Encounter-Type Variant ─────────────────────────────────

export const ENCOUNTER_TYPE_VARIANTS = {
  outpatient: {
    label: 'Outpatient Comprehensive Assessment',
    sections: ['biodata', 'chief_complaints', 'hpi', 'past_medical_surgical', 'drug_allergy', 'family_history', 'social_history', 'ros', 'summary'],
    excludeROS: false,
    briefFormat: false,
  },
  inpatient: {
    label: 'Inpatient Comprehensive Assessment',
    sections: ['biodata', 'chief_complaints', 'hpi', 'past_medical_surgical', 'drug_allergy', 'family_history', 'social_history', 'ros', 'summary'],
    excludeROS: false,
    briefFormat: false,
  },
  emergency: {
    label: 'Emergency Department Assessment',
    sections: ['biodata', 'chief_complaints', 'hpi', 'ros', 'summary'],
    excludeROS: false,
    briefFormat: true,
    addEmergencyModules: true,
  },
} as const;

export function getEncounterTypeVariant(
  type: keyof typeof ENCOUNTER_TYPE_VARIANTS,
): typeof ENCOUNTER_TYPE_VARIANTS[keyof typeof ENCOUNTER_TYPE_VARIANTS] {
  return ENCOUNTER_TYPE_VARIANTS[type];
}

export function getEncounterTypeSections(
  type: keyof typeof ENCOUNTER_TYPE_VARIANTS,
  format: AssessmentFormat,
): SectionDef[] {
  const variant = ENCOUNTER_TYPE_VARIANTS[type];
    const sectionSet: Set<string> = new Set(variant.sections);
  return format.sections.filter(s => sectionSet.has(s.id));
}

// ── Rule UCAEM-FG-005: Population-Specific Extensions ────────────────────────

const geriatricExtension: SectionDef[] = [
  {
    id: 'functional_status', label: 'Functional Status', description: 'ADL/IADL, mobility, falls risk',
    order: 3.5, required: false, source: 'population_extension',
    population: ['elderly'],
    applicable: (ctx) => ctx.age >= 65,
  },
  {
    id: 'cognitive_screening', label: 'Cognitive Screening', description: 'Cognitive assessment, dementia screen',
    order: 6.5, required: false, source: 'population_extension',
    population: ['elderly'],
    applicable: (ctx) => ctx.age >= 65,
  },
  {
    id: 'geriatric_syndromes', label: 'Geriatric Syndromes', description: 'Frailty, incontinence, falls, polypharmacy',
    order: 7.5, required: false, source: 'population_extension',
    population: ['elderly'],
    applicable: (ctx) => ctx.age >= 65,
  },
];

const adolescentExtension: SectionDef[] = [
  {
    id: 'heeadsss', label: 'HEEADSSS Assessment', description: 'Home, Education, Eating, Activities, Drugs, Sexuality, Safety, Suicide',
    order: 6.5, required: false, source: 'population_extension',
    population: ['adolescent'],
    applicable: (ctx) => ctx.age >= 13 && ctx.age < 18,
  },
  {
    id: 'pubertal_assessment', label: 'Pubertal Development', description: 'Tanner staging, menarche, voice change',
    order: 4.5, required: false, source: 'population_extension',
    population: ['adolescent'],
    applicable: (ctx) => ctx.age >= 13 && ctx.age < 18,
  },
];

export function applyPopulationExtensions(context: ConstitutionalContext, sections: SectionDef[]): SectionDef[] {
  const result = [...sections];

  if (context.age >= 65) {
    const rosIndex = result.findIndex(s => s.id === 'ros');
    if (rosIndex >= 0) {
      result.splice(rosIndex, 0, ...geriatricExtension);
    }
  }

  if (context.age >= 13 && context.age < 18) {
    const rosIndex = result.findIndex(s => s.id === 'ros');
    if (rosIndex >= 0) {
      result.splice(rosIndex, 0, ...adolescentExtension);
    }
  }

  return result;
}

// ── Rule UCAEM-FG-006: Surgical Assessment Variant ───────────────────────────

const surgicalSections: SectionDef[] = [
  {
    id: 'preoperative_assessment', label: 'Pre-Operative Assessment', description: 'ASA class, NPO status, pre-op workup',
    order: 1.5, required: true, source: 'surgical_variant',
    population: ['adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'surgical_history', label: 'Surgical History', description: 'Prior surgeries, complications, anesthesia history',
    order: 4.5, required: true, source: 'surgical_variant',
    population: ['adult', 'elderly'],
    applicable: (ctx) => ctx.age >= 13,
  },
  {
    id: 'perioperative_plan', label: 'Perioperative Plan', description: 'Surgical plan, antibiotic prophylaxis, VTE prophylaxis',
    order: 9.5, required: true, source: 'surgical_variant',
    population: ['adult', 'elderly'],
    applicable: () => true,
  },
];

export function isSurgicalAssessment(context: ConstitutionalContext): boolean {
  return context.module === 'surgical'
    || context.knownDiseases.some(d => d.name.toLowerCase().includes('surgical'))
    || context.chiefComplaints.some(c => ['appendicitis', 'cholecystitis', 'obstruction', 'fracture'].some(k => c.patientWording.toLowerCase().includes(k)));
}

export function applySurgicalVariant(context: ConstitutionalContext, sections: SectionDef[]): SectionDef[] {
  if (!isSurgicalAssessment(context)) return sections;
  const result = [...sections];
  const rosIndex = result.findIndex(s => s.id === 'ros');
  if (rosIndex >= 0) {
    result.splice(rosIndex, 0, ...surgicalSections);
  }
  return result;
}

// ── Rule UCAEM-FG-012: Post-Operative Assessment Format ───────────────────────

const postOpSections: SectionDef[] = [
  {
    id: 'postop_day', label: 'Post-Operative Day', description: 'POD number, surgery date, procedure performed',
    order: 0.5, required: true, source: 'postop_variant',
    population: ['adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'recovery_status', label: 'Recovery Status', description: 'Awakening, extubation, mobilisation, diet progression',
    order: 2.5, required: true, source: 'postop_variant',
    population: ['adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'postop_monitoring', label: 'Post-Operative Monitoring', description: 'Vitals, drain output, wound status, pain score',
    order: 3.5, required: true, source: 'postop_variant',
    population: ['adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'postop_complications', label: 'Post-Operative Complications', description: 'Fever, bleeding, infection, DVT, ileus',
    order: 7.5, required: true, source: 'postop_variant',
    population: ['adult', 'elderly'],
    applicable: () => true,
  },
  {
    id: 'discharge_planning', label: 'Discharge Planning', description: 'Discharge criteria, follow-up, wound care',
    order: 9.5, required: true, source: 'postop_variant',
    population: ['adult', 'elderly'],
    applicable: () => true,
  },
];

export function isPostOperativeAssessment(context: ConstitutionalContext): boolean {
  return context.module === 'postop'
    || context.knownDiseases.some(d => d.name.toLowerCase().includes('postop'))
    || (context.capturedFacts['recent_surgery'] as boolean) === true;
}

export function applyPostOperativeVariant(context: ConstitutionalContext, sections: SectionDef[]): SectionDef[] {
  if (!isPostOperativeAssessment(context)) return sections;
  const result = [...sections];
  result.unshift(...postOpSections.filter(s => s.applicable(context)));
  return result;
}

// ── Combined format generator with all FG rules applied ───────────────────────

export interface FullFormatInput extends FormatGenerationInput {
  encounterType?: keyof typeof ENCOUNTER_TYPE_VARIANTS
  applySurgical?: boolean
  applyPostOp?: boolean
  applyPopulation?: boolean
}

export function generateFullAssessmentFormat(input: FullFormatInput): AssessmentFormat {
  let format = generateAssessmentFormat(input);

  // FG-002: Apply encounter type variant
  if (input.encounterType && input.encounterType !== 'outpatient') {
    format.sections = getEncounterTypeSections(input.encounterType, format);
    format.encounterType = input.encounterType;
  }

  // FG-005: Apply population-specific extensions
  if (input.applyPopulation !== false) {
    format.sections = applyPopulationExtensions(input.context, format.sections);
  }

  // FG-006: Apply surgical variant
  if (input.applySurgical !== false) {
    format.sections = applySurgicalVariant(input.context, format.sections);
  }

  // FG-012: Apply post-operative variant
  if (input.applyPostOp !== false) {
    format.sections = applyPostOperativeVariant(input.context, format.sections);
  }

  format.activeAdapters = getActiveAdapters(input.context);
  return format;
}
