import type { ConstitutionalContext, SectionDef, AssessmentFormat } from '../knowledge/symptom-types';
import type { Biodata, ModuleType, EncounterPhase } from '../types/ces';
import { determineAgeGroup } from './context-engine';

export interface DynamicSection {
  id: string
  label: string
  order: number
  render: boolean
  phase?: EncounterPhase
}

const CONSTITUTIONAL_SECTIONS: DynamicSection[] = [
  { id: 'biodata', label: 'BIODATA', order: 1, render: true, phase: 'registration' },
  { id: 'chief_complaints', label: 'CHIEF COMPLAINTS', order: 2, render: true, phase: 'chief_complaint' },
  { id: 'hpi', label: 'HISTORY OF PRESENTING ILLNESS', order: 3, render: true, phase: 'hpi' },
  { id: 'past_medical_surgical', label: 'PAST MEDICAL AND SURGICAL HISTORY', order: 4, render: true, phase: 'past_medical' },
  { id: 'drug_allergy', label: 'DRUG AND ALLERGY HISTORY', order: 5, render: true, phase: 'drug_history' },
  { id: 'family_history', label: 'FAMILY HISTORY', order: 6, render: true, phase: 'family_history' },
  { id: 'social_history', label: 'SOCIAL AND OCCUPATIONAL HISTORY', order: 7, render: true, phase: 'social_history' },
  { id: 'review_of_systems', label: 'REVIEW OF SYSTEMS', order: 8, render: true, phase: 'review_of_systems' },
  { id: 'summary', label: 'SUMMARY OF HISTORY', order: 9, render: true, phase: undefined },
];

const CONTEXTUAL_SECTIONS: Record<string, { label: string; condition: (ctx: ConstitutionalContext) => boolean; order: number; phase?: EncounterPhase }> = {
  perinatal: {
    label: 'PERINATAL HISTORY (Antenatal, Natal, Postnatal)',
    condition: (ctx: ConstitutionalContext) => ctx.age < 0.08,
    order: 3.5,
    phase: 'patient_context',
  },
  birth_history: {
    label: 'BIRTH HISTORY',
    condition: (ctx: ConstitutionalContext) => ctx.age >= 0.08 && ctx.age < 13,
    order: 5.5,
    phase: 'patient_context',
  },
  pediatric_growth: {
    label: 'GROWTH AND DEVELOPMENT HISTORY',
    condition: (ctx: ConstitutionalContext) => ctx.age >= 0.08 && ctx.age < 5,
    order: 5.6,
    phase: 'patient_context',
  },
  immunization: {
    label: 'IMMUNIZATION HISTORY',
    condition: (ctx: ConstitutionalContext) => ctx.age >= 0.08 && ctx.age < 18,
    order: 5.7,
    phase: 'past_medical',
  },
  nutritional: {
    label: 'NUTRITION AND FEEDING HISTORY',
    condition: (ctx: ConstitutionalContext) => ctx.age >= 0.08 && ctx.age < 13,
    order: 5.8,
    phase: 'review_of_systems',
  },
  obstetric: {
    label: 'OBSTETRIC AND GYNECOLOGICAL HISTORY',
    condition: (ctx: ConstitutionalContext) => ctx.pregnant || ctx.module === 'obstetric',
    order: 3.5,
    phase: 'review_of_systems',
  },
  psychiatric_mse: {
    label: 'MENTAL STATE EXAMINATION',
    condition: (ctx: ConstitutionalContext) => ctx.module === 'psychiatric' || ctx.chiefComplaints.some(c =>
      ['depression', 'anxiety', 'hallucination', 'suicidal', 'mood', 'psychosis', 'mental'].some(k =>
        (c.standardizedConcept || '').toLowerCase().includes(k)
      )
    ),
    order: 8.5,
    phase: 'review_of_systems',
  },
  functional: {
    label: 'FUNCTIONAL ASSESSMENT',
    condition: (ctx: ConstitutionalContext) => ctx.age >= 65 || ctx.module === 'geriatric',
    order: 8.7,
    phase: 'functional_assessment',
  },
};

export function getDynamicSections(ctx: ConstitutionalContext): DynamicSection[] {
  const base = [...CONSTITUTIONAL_SECTIONS];

  for (const [key, def] of Object.entries(CONTEXTUAL_SECTIONS)) {
    if (def.condition(ctx)) {
      base.push({
        id: key,
        label: def.label,
        order: def.order,
        render: true,
        phase: def.phase,
      });
    }
  }

  base.sort((a, b) => a.order - b.order);
  return base;
}

export function determineActiveModule(biodata: Biodata, activeModules: ModuleType[], ctx?: ConstitutionalContext): string {
  const effectiveAge = biodata?.age ?? ctx?.age ?? 0;
  const effectiveAgeGroup = biodata?.ageGroup || determineAgeGroup(effectiveAge);

  if (effectiveAgeGroup === 'neonate') return 'neonatal';
  if (effectiveAgeGroup === 'infant' || effectiveAgeGroup === 'child') return 'pediatric';
  if (activeModules.includes('pregnancy')) return 'obstetric';
  if (activeModules.includes('psychiatry')) return 'psychiatric';
  if (activeModules.includes('surgery')) return 'surgical';
  if (activeModules.includes('emergency')) return 'emergency';
  return 'adult';
}

export function generateAssessmentFormat(
  biodata: Biodata | null,
  activeModules: ModuleType[],
  ctx: ConstitutionalContext,
): AssessmentFormat {
  const module = biodata ? determineActiveModule(biodata, activeModules, ctx) : 'adult';

  const populationLabels: Record<string, string> = {
    neonatal: 'neonate',
    pediatric: 'child',
    adult: 'adult',
    obstetric: 'adult',
    psychiatric: 'adult',
    surgical: 'adult',
    emergency: 'adult',
    geriatric: 'elderly',
  };

  const formatNames: Record<string, string> = {
    neonatal: 'Neonatal Assessment',
    pediatric: 'Pediatric Assessment',
    adult: 'Adult Clinical Assessment',
    obstetric: 'Obstetric Assessment',
    psychiatric: 'Psychiatric Assessment',
    surgical: 'Surgical Assessment',
    emergency: 'Emergency Assessment',
    geriatric: 'Geriatric Assessment',
  };

  const dynamicSections = getDynamicSections(ctx);
  const activeAdapters = Object.keys(CONTEXTUAL_SECTIONS).filter(key =>
    CONTEXTUAL_SECTIONS[key].condition(ctx)
  );

  const effectivePopulation: SectionDef['population'] = (() => {
    if (module === 'neonatal') return ['neonate'];
    if (module === 'pediatric') return ['child', 'infant'];
    if (module === 'obstetric') return ['adult'];
    if (module === 'psychiatric') return ['adult'];
    if (module === 'geriatric') return ['elderly'];
    return ['adult'];
  })();

  const sections: SectionDef[] = dynamicSections.map((ds, i) => ({
    id: ds.id,
    label: ds.label,
    description: '',
    order: i + 1,
    required: i < 4,
    source: (i < 9 ? 'constitutional' : 'population_extension') as SectionDef['source'],
    population: effectivePopulation,
    applicable: () => true,
  }));

  return {
    name: formatNames[module] || 'Adult Clinical Assessment',
    description: `Constitutional format for ${module} population`,
    population: populationLabels[module] || 'adult',
    sections,
    constitutionalBase: module,
    activeAdapters,
    encounterType: biodata?.encounterType,
  };
}
