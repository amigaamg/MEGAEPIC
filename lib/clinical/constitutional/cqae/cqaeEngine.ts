import { PatientContext, ActivationRule, SectionDefinition } from '../types';

export interface CQAEActivationResult {
  visible: SectionDefinition[];
  hidden: SectionDefinition[];
  required: SectionDefinition[];
  optional: SectionDefinition[];
  forced: SectionDefinition[];
}

export interface CQAEEvaluation {
  sectionId: string;
  visible: boolean;
  required: boolean;
  reason?: string;
}

function evaluateRule(rule: ActivationRule, ctx: PatientContext): boolean {
  switch (rule.type) {
    case 'always':
      return true;
    case 'never':
      return false;
    case 'age': {
      const { totalMonths } = ctx.age;
      if (rule.minMonths !== undefined && totalMonths < rule.minMonths) return false;
      if (rule.maxMonths !== undefined && totalMonths > rule.maxMonths) return false;
      return true;
    }
    case 'sex':
      return rule.values.includes(ctx.sex as 'male' | 'female');
    case 'pregnancy':
      return rule.status.includes(ctx.pregnancyStatus as 'not_pregnant' | 'pregnant' | 'postpartum');
    case 'department':
      return rule.values.includes(ctx.department);
    case 'specialty':
      return rule.values.includes(ctx.specialty);
    case 'encounter_type':
      return rule.values.includes(ctx.encounterType);
    case 'symptom_present':
      return rule.symptomIds.some(id =>
        ctx.activeComplaints.some(s => s.symptomId === id && s.present)
      );
    case 'symptom_absent':
      return rule.symptomIds.every(id =>
        !ctx.activeComplaints.some(s => s.symptomId === id && s.present)
      );
    case 'disease_present':
      return rule.diseaseIds.some(id => ctx.activeDiseaseIds.includes(id));
    case 'fact_exists':
      return ctx.existingFacts.some(f => f.type === rule.factType);
    case 'environment':
      return rule.values.includes(ctx.environment?.[rule.setting as keyof typeof ctx.environment] || '');
    default:
      return false;
  }
}

export function evaluateSection(
  section: SectionDefinition,
  ctx: PatientContext
): CQAEEvaluation {
  if (section.activationRules.length === 0) {
    return { sectionId: section.id, visible: true, required: section.required };
  }
  const allPass = section.activationRules.every(rule => evaluateRule(rule, ctx));
  const anyPass = section.activationRules.some(rule => evaluateRule(rule, ctx));
  const allFail = section.activationRules.every(rule => !evaluateRule(rule, ctx));
  const hasNever = section.activationRules.some(r => r.type === 'never');
  const hasAlways = section.activationRules.some(r => r.type === 'always');

  if (hasNever) {
    return { sectionId: section.id, visible: false, required: false, reason: 'Suppressed by never-rule' };
  }
  if (hasAlways) {
    return { sectionId: section.id, visible: true, required: section.required, reason: 'Always active' };
  }

  if (allPass) {
    return { sectionId: section.id, visible: true, required: section.required, reason: 'All rules pass' };
  }
  if (allFail) {
    return { sectionId: section.id, visible: false, required: false, reason: 'All rules fail' };
  }
  return { sectionId: section.id, visible: allPass, required: section.required && allPass, reason: allPass ? 'All rules pass' : allFail ? 'All rules fail' : 'Some rules fail' };
}

export function activateSections(
  sections: SectionDefinition[],
  ctx: PatientContext
): CQAEActivationResult {
  const results = sections.map(s => evaluateSection(s, ctx));
  const map = new Map(results.map(r => [r.sectionId, r]));
  const visible = sections.filter(s => map.get(s.id)?.visible);
  const hidden = sections.filter(s => !map.get(s.id)?.visible);
  const required = visible.filter(s => map.get(s.id)?.required);
  const optional = visible.filter(s => !map.get(s.id)?.required);
  const forced = visible.filter(s => map.get(s.id)?.reason === 'Always active');

  return { visible, hidden, required, optional, forced };
}

export function getActivationReason(
  sectionId: string,
  sections: SectionDefinition[],
  ctx: PatientContext
): string | undefined {
  const section = sections.find(s => s.id === sectionId);
  if (!section) return undefined;
  return evaluateSection(section, ctx).reason;
}

export function filterSectionsByContext(
  sections: SectionDefinition[],
  ctx: PatientContext
): SectionDefinition[] {
  const { visible } = activateSections(sections, ctx);
  return visible.sort((a, b) => a.position - b.position);
}

export function reEvaluateOnContextChange(
  sections: SectionDefinition[],
  previousCtx: PatientContext,
  currentCtx: PatientContext
): { sectionsToActivate: SectionDefinition[]; sectionsToDeactivate: SectionDefinition[]; unchanged: SectionDefinition[] } {
  const previousActivation = activateSections(sections, previousCtx);
  const currentActivation = activateSections(sections, currentCtx);
  const activate: SectionDefinition[] = [];
  const deactivate: SectionDefinition[] = [];
  const unchanged: SectionDefinition[] = [];

  const prevVisibleIds = new Set(previousActivation.visible.map(s => s.id));
  const currVisibleIds = new Set(currentActivation.visible.map(s => s.id));

  for (const section of sections) {
    const wasVisible = prevVisibleIds.has(section.id);
    const isVisible = currVisibleIds.has(section.id);
    if (!wasVisible && isVisible) activate.push(section);
    else if (wasVisible && !isVisible) deactivate.push(section);
    else unchanged.push(section);
  }

  return { sectionsToActivate: activate, sectionsToDeactivate: deactivate, unchanged };
}
